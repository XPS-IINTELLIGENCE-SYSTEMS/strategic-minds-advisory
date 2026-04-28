import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

function json(res, status, payload) {
  return res.status(status).json({ ...payload, time: new Date().toISOString() })
}

function getBase(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers.host
  return `${protocol}://${host}`
}

function getSupabaseAdmin() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function authOk(req) {
  const secret = process.env.CRON_SECRET || process.env.ORCHESTRATOR_SECRET
  if (!secret) return true
  const auth = req.headers.authorization || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  return bearer === secret || req.headers['x-ai-action-key'] === secret
}

async function insertSafe(client, table, record) {
  if (!client) return { ok: false, mode: 'supabase_not_configured' }
  const { data, error } = await client.from(table).insert(record).select('*').maybeSingle()
  if (error) return { ok: false, error: error.message }
  return { ok: true, data }
}

async function callJson(url, headers = {}) {
  const response = await fetch(url, { method: 'GET', headers })
  const text = await response.text()
  let body = text
  try { body = JSON.parse(text) } catch (_) {}
  return { ok: response.ok, status: response.status, body }
}

function classify(systemVerify) {
  const checks = Array.isArray(systemVerify?.body?.checks) ? systemVerify.body.checks : []
  const failed = checks.filter(check => !check.ok)
  const critical = failed.filter(check => check.critical)
  return {
    failedCount: failed.length,
    criticalFailedCount: critical.length,
    failed,
    critical,
    state: critical.length === 0 ? 'operational' : 'degraded'
  }
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { status: 'error', error: 'method_not_allowed' })
  if (!authOk(req)) return json(res, 401, { status: 'error', error: 'unauthorized' })

  const base = getBase(req)
  const client = getSupabaseAdmin()
  const logsTable = process.env.AI_LOGS_TABLE || 'ai_execution_logs'
  const tasksTable = process.env.AI_TASKS_TABLE || 'ai_tasks'

  try {
    const headers = { 'x-ai-action-source': 'self-heal' }
    if (process.env.ORCHESTRATOR_SECRET) headers.authorization = `Bearer ${process.env.ORCHESTRATOR_SECRET}`

    const verification = await callJson(`${base}/api/system-verify`, headers)
    const diagnosis = classify(verification)

    await insertSafe(client, logsTable, {
      event: 'self_heal_verification',
      status: diagnosis.state,
      action: 'system_verify',
      details: { verification, diagnosis },
      created_at: new Date().toISOString()
    })

    const createdTasks = []
    for (const failure of diagnosis.failed) {
      const task = await insertSafe(client, tasksTable, {
        title: `Heal ${failure.name || failure.path}`,
        type: 'self-heal',
        status: 'pending',
        priority: failure.critical ? 10 : 4,
        payload: { failure, source: 'api-self-heal' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      createdTasks.push(task)
    }

    let orchestrator = null
    if (diagnosis.criticalFailedCount === 0 && process.env.ENABLE_SELF_HEAL_ORCHESTRATOR === 'true') {
      orchestrator = await callJson(`${base}/api/orchestrator`, headers)
    }

    await insertSafe(client, logsTable, {
      event: 'self_heal_completed',
      status: diagnosis.state,
      action: 'self_heal',
      details: { diagnosis, createdTasks, orchestrator },
      created_at: new Date().toISOString()
    })

    return json(res, diagnosis.criticalFailedCount === 0 ? 200 : 500, {
      status: diagnosis.state,
      verificationStatus: verification.status,
      diagnosis,
      createdTasks,
      orchestrator,
      supabaseLogging: Boolean(client)
    })
  } catch (error) {
    await insertSafe(client, logsTable, {
      event: 'self_heal_error',
      status: 'failed',
      action: 'self_heal',
      details: { error: error.message },
      created_at: new Date().toISOString()
    })
    return json(res, 500, { status: 'error', error: error.message })
  }
}
