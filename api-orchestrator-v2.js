import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const TASKS = process.env.AI_TASKS_TABLE || 'ai_tasks'
const LOGS = process.env.AI_LOGS_TABLE || 'ai_execution_logs'

const json = (res, status, payload) => res.status(status).json({ ...payload, time: new Date().toISOString() })
const baseUrl = req => `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`

function allowed(req) {
  if (!process.env.ORCHESTRATOR_SECRET) return true
  const auth = req.headers.authorization || ''
  return req.headers['x-ai-action-key'] === process.env.ORCHESTRATOR_SECRET || auth === `Bearer ${process.env.ORCHESTRATOR_SECRET}`
}

function envMissing() {
  const missing = []
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    missing.push('one model provider key')
  }
  return missing
}

function db() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

async function log(client, event, status, details = {}, taskId = null, action = null) {
  const { error } = await client.from(LOGS).insert({
    event,
    status,
    task_id: taskId,
    action,
    details,
    created_at: new Date().toISOString()
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

async function nextTask(client) {
  const { data, error } = await client
    .from(TASKS)
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

async function setTask(client, id, status, patch = {}) {
  if (!id) return { ok: false, error: 'missing task id' }
  const { error } = await client.from(TASKS).update({ status, updated_at: new Date().toISOString(), ...patch }).eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

async function createTask(client, input = {}) {
  const { data, error } = await client.from(TASKS).insert({
    title: input.title || 'AI in Action task',
    type: input.type || 'system',
    status: input.status || 'pending',
    priority: Number.isFinite(input.priority) ? input.priority : 1,
    payload: input.payload || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).select('*').single()
  return error ? { ok: false, error: error.message } : { ok: true, task: data }
}

async function callInternal(base, path) {
  if (!path || !path.startsWith('/api/') || path === '/api/orchestrator') return { ok: false, error: 'blocked path' }
  const r = await fetch(`${base}${path}`, { headers: { 'x-ai-action-source': 'orchestrator-v2' } })
  const text = await r.text()
  let body = text
  try { body = JSON.parse(text) } catch (_) {}
  return { ok: r.ok, status: r.status, path, body }
}

function safeDecision(task) {
  const path = typeof task?.payload?.path === 'string' && task.payload.path.startsWith('/api/') ? task.payload.path : '/api/system-verify'
  return { action: { type: 'call_internal_endpoint', args: { path } }, reason: 'safe fallback', next_task: { create: false } }
}

async function decide(base, task, state) {
  const r = await fetch(`${base}/api/model-router`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-ai-action-source': 'orchestrator-v2' },
    body: JSON.stringify({ purpose: 'orchestrator_action_selection', task, state })
  })
  const data = await r.json().catch(() => null)
  if (!r.ok || !data?.ok || !data.decision?.action?.type) throw new Error(data?.error || `model router ${r.status}`)
  return { ...data.decision, provider: data.provider, model: data.model }
}

async function execute({ decision, client, base, task }) {
  const action = decision.action || { type: 'noop', args: {} }
  if (action.type === 'call_internal_endpoint') return callInternal(base, action.args.path)
  if (action.type === 'create_task') return createTask(client, action.args)
  if (action.type === 'write_log') return log(client, action.args.event || 'ai_log', action.args.status || 'ok', action.args, task?.id, 'write_log')
  if (action.type === 'complete_task') return setTask(client, task?.id, 'completed', { result: action.args.result || {} })
  if (action.type === 'fail_task') return setTask(client, task?.id, 'failed', { error: action.args.error || 'failed by action' })
  return { ok: true, action: 'noop' }
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { status: 'error', error: 'method not allowed' })
  if (!allowed(req)) return json(res, 401, { status: 'error', error: 'unauthorized' })

  const missing = envMissing()
  if (missing.length) return json(res, 500, { status: 'misconfigured', missing_env: missing })

  const client = db()
  const base = baseUrl(req)
  let task = null

  try {
    task = await nextTask(client)
    if (!task) {
      const seed = await createTask(client, { title: 'Run AI in Action system verification', type: 'system-verify', priority: 10, payload: { path: '/api/system-verify' } })
      await log(client, 'orchestrator_seeded_task', seed.ok ? 'ok' : 'failed', seed)
      return json(res, seed.ok ? 200 : 500, { status: seed.ok ? 'seeded' : 'error', result: seed })
    }

    await setTask(client, task.id, 'running')
    const state = { base, routes: ['/api/system-verify', '/api/self-heal', '/api/agent-loop', '/api/task-dispatch'], tables: { tasks: TASKS, logs: LOGS } }

    let decision
    try {
      decision = await decide(base, task, state)
    } catch (error) {
      decision = safeDecision(task)
      await log(client, 'orchestrator_model_router_fallback', 'degraded', { error: error.message, decision }, task.id, 'fallback')
    }

    const result = await execute({ decision, client, base, task })
    if (decision.next_task?.create) await createTask(client, decision.next_task)
    await setTask(client, task.id, result.ok ? 'completed' : 'failed', { result: { decision, execution: result } })
    await log(client, 'orchestrator_cycle_completed', result.ok ? 'ok' : 'failed', { decision, result }, task.id, decision.action.type)

    return json(res, result.ok ? 200 : 500, { status: result.ok ? 'completed' : 'failed', task_id: task.id, decision, result })
  } catch (error) {
    if (task?.id) await setTask(client, task.id, 'failed', { error: error.message })
    await log(client, 'orchestrator_error', 'failed', { error: error.message }, task?.id || null)
    return json(res, 500, { status: 'error', error: error.message })
  }
}
