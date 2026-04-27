import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const DEFAULT_TASKS_TABLE = 'ai_tasks'
const DEFAULT_LOGS_TABLE = 'ai_execution_logs'
const DEFAULT_MODEL = 'gpt-4.1-mini'

function json(res, status, payload) {
  return res.status(status).json({
    ...payload,
    timestamp: new Date().toISOString()
  })
}

function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers.host
  return `${protocol}://${host}`
}

function assertEnv() {
  const missing = []

  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY')

  return missing
}

function authorize(req) {
  const secret = process.env.ORCHESTRATOR_SECRET
  if (!secret) return { ok: true, mode: 'open-no-secret-configured' }

  const headerSecret = req.headers['x-ai-action-key']
  const auth = req.headers.authorization || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (headerSecret === secret || bearer === secret) {
    return { ok: true, mode: 'secret-verified' }
  }

  return { ok: false, mode: 'secret-required' }
}

function supabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

async function writeExecutionLog(client, logsTable, payload) {
  const record = {
    event: payload.event || 'orchestrator_event',
    status: payload.status || 'ok',
    task_id: payload.task_id || null,
    action: payload.action || null,
    details: payload.details || {},
    created_at: new Date().toISOString()
  }

  const { error } = await client.from(logsTable).insert(record)
  if (error) {
    console.error('LOG_WRITE_FAILED', error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

async function getNextPendingTask(client, tasksTable) {
  const { data, error } = await client
    .from(tasksTable)
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`TASK_READ_FAILED: ${error.message}`)
  return data
}

async function markTask(client, tasksTable, taskId, status, patch = {}) {
  if (!taskId) return { ok: false, error: 'missing_task_id' }

  const { error } = await client
    .from(tasksTable)
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...patch
    })
    .eq('id', taskId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

async function createTask(client, tasksTable, input) {
  const task = {
    title: input.title || 'AI in Action generated task',
    type: input.type || 'system',
    status: input.status || 'pending',
    priority: Number.isFinite(input.priority) ? input.priority : 1,
    payload: input.payload || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data, error } = await client.from(tasksTable).insert(task).select('*').single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, task: data }
}

async function callInternalEndpoint(base, path) {
  if (!path || typeof path !== 'string') return { ok: false, error: 'missing_path' }
  if (!path.startsWith('/api/')) return { ok: false, error: 'only_internal_api_paths_allowed' }

  const response = await fetch(`${base}${path}`, {
    method: 'GET',
    headers: { 'x-ai-action-source': 'orchestrator' }
  })

  const text = await response.text()
  let body = text

  try {
    body = JSON.parse(text)
  } catch (_) {
    body = text.slice(0, 500)
  }

  return {
    ok: response.ok,
    status: response.status,
    path,
    body
  }
}

function extractResponseText(response) {
  if (response.output_text) return response.output_text

  const parts = []
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) parts.push(content.text)
      if (content.type === 'text' && content.text) parts.push(content.text)
    }
  }

  return parts.join('\n').trim()
}

async function askOpenAI(task, state) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['action', 'reason', 'next_task'],
    properties: {
      action: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'args'],
        properties: {
          type: {
            type: 'string',
            enum: ['call_internal_endpoint', 'create_task', 'write_log', 'complete_task', 'fail_task', 'noop']
          },
          args: {
            type: 'object',
            additionalProperties: true
          }
        }
      },
      reason: { type: 'string' },
      next_task: {
        type: 'object',
        additionalProperties: false,
        required: ['create', 'title', 'type', 'priority', 'payload'],
        properties: {
          create: { type: 'boolean' },
          title: { type: 'string' },
          type: { type: 'string' },
          priority: { type: 'number' },
          payload: { type: 'object', additionalProperties: true }
        }
      }
    }
  }

  const body = {
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: 'You are AI in Action orchestrator. Choose exactly one safe system action. Prefer verification, logging, task creation, and internal API calls. Do not request external credentials. Do not output prose outside JSON.'
          }
        ]
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: JSON.stringify({ task, state })
          }
        ]
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'ai_in_action_orchestrator_action',
        strict: true,
        schema
      }
    }
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`OPENAI_RESPONSE_FAILED: ${data.error?.message || response.status}`)
  }

  const text = extractResponseText(data)
  if (!text) throw new Error('OPENAI_EMPTY_STRUCTURED_OUTPUT')

  return JSON.parse(text)
}

async function executeAction({ action, client, tasksTable, logsTable, base, task }) {
  switch (action.type) {
    case 'call_internal_endpoint':
      return callInternalEndpoint(base, action.args.path)

    case 'create_task':
      return createTask(client, tasksTable, action.args)

    case 'write_log':
      return writeExecutionLog(client, logsTable, {
        event: action.args.event || 'ai_log',
        status: action.args.status || 'ok',
        task_id: task?.id || null,
        action: 'write_log',
        details: action.args.details || action.args
      })

    case 'complete_task':
      return markTask(client, tasksTable, task?.id, 'completed', {
        result: action.args.result || { completed_by: 'orchestrator' }
      })

    case 'fail_task':
      return markTask(client, tasksTable, task?.id, 'failed', {
        error: action.args.error || 'failed_by_orchestrator'
      })

    case 'noop':
      return { ok: true, action: 'noop' }

    default:
      return { ok: false, error: `unsupported_action:${action.type}` }
  }
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return json(res, 405, { status: 'error', error: 'method_not_allowed' })
  }

  const auth = authorize(req)
  if (!auth.ok) return json(res, 401, { status: 'error', error: auth.mode })

  const missing = assertEnv()
  if (missing.length) {
    return json(res, 500, {
      status: 'misconfigured',
      missing_env: missing
    })
  }

  const client = supabase()
  const tasksTable = process.env.AI_TASKS_TABLE || DEFAULT_TASKS_TABLE
  const logsTable = process.env.AI_LOGS_TABLE || DEFAULT_LOGS_TABLE
  const base = getBaseUrl(req)

  let task = null

  try {
    task = await getNextPendingTask(client, tasksTable)

    if (!task) {
      const seed = await createTask(client, tasksTable, {
        title: 'Run AI in Action system verification',
        type: 'system-verify',
        priority: 10,
        payload: { path: '/api/system-verify', source: 'orchestrator_seed' }
      })

      await writeExecutionLog(client, logsTable, {
        event: 'orchestrator_seeded_task',
        status: seed.ok ? 'ok' : 'failed',
        details: seed
      })

      return json(res, seed.ok ? 200 : 500, {
        status: seed.ok ? 'seeded' : 'error',
        action: 'create_initial_task',
        result: seed,
        auth: auth.mode
      })
    }

    await markTask(client, tasksTable, task.id, 'running')

    const state = {
      base,
      supported_actions: ['call_internal_endpoint', 'create_task', 'write_log', 'complete_task', 'fail_task', 'noop'],
      recommended_internal_paths: ['/api/system-verify', '/api/health', '/api/task-dispatch', '/api/agent-loop'],
      tables: { tasksTable, logsTable }
    }

    const decision = await askOpenAI(task, state)
    const result = await executeAction({
      action: decision.action,
      client,
      tasksTable,
      logsTable,
      base,
      task
    })

    if (decision.next_task?.create) {
      await createTask(client, tasksTable, decision.next_task)
    }

    await markTask(client, tasksTable, task.id, result.ok ? 'completed' : 'failed', {
      result: { decision, execution: result }
    })

    await writeExecutionLog(client, logsTable, {
      event: 'orchestrator_cycle_completed',
      status: result.ok ? 'ok' : 'failed',
      task_id: task.id,
      action: decision.action.type,
      details: { decision, result }
    })

    return json(res, result.ok ? 200 : 500, {
      status: result.ok ? 'completed' : 'failed',
      task_id: task.id,
      decision,
      result,
      auth: auth.mode
    })
  } catch (err) {
    console.error('ORCHESTRATOR_ERROR', err)

    if (task?.id) {
      await markTask(client, tasksTable, task.id, 'failed', { error: err.message })
      await writeExecutionLog(client, logsTable, {
        event: 'orchestrator_error',
        status: 'failed',
        task_id: task.id,
        details: { error: err.message }
      })
    }

    return json(res, 500, {
      status: 'error',
      error: err.message
    })
  }
}
