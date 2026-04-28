export const maxDuration = 60

export default async function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers.host
  const base = `${protocol}://${host}`
  const steps = []
  const max = 3

  for (let i = 0; i < max; i++) {
    try {
      const response = await fetch(`${base}/api/task-dispatch`, {
        method: 'GET',
        headers: { 'x-ai-action-source': 'agent-loop-native' }
      })
      const text = await response.text()
      let body = text
      try { body = JSON.parse(text) } catch (_) {}
      steps.push({ step: i + 1, ok: response.ok, status: response.status, body })
    } catch (error) {
      steps.push({ step: i + 1, ok: false, error: error.message })
    }
  }

  let orchestrator = null
  if (process.env.ENABLE_ORCHESTRATOR_FROM_AGENT_LOOP === 'true') {
    try {
      const headers = { 'x-ai-action-source': 'agent-loop-native' }
      if (process.env.ORCHESTRATOR_SECRET) headers.authorization = `Bearer ${process.env.ORCHESTRATOR_SECRET}`
      const response = await fetch(`${base}/api/orchestrator`, { method: 'GET', headers })
      const text = await response.text()
      let body = text
      try { body = JSON.parse(text) } catch (_) {}
      orchestrator = { ok: response.ok, status: response.status, body }
    } catch (error) {
      orchestrator = { ok: false, error: error.message }
    }
  }

  const failed = steps.filter(step => !step.ok).length
  return res.status(200).json({
    status: failed === 0 ? 'completed' : 'degraded',
    mode: 'native-safe-inline',
    execution: 'multi-step',
    stepsRequested: max,
    stepsSucceeded: max - failed,
    stepsFailed: failed,
    orchestratorEnabled: process.env.ENABLE_ORCHESTRATOR_FROM_AGENT_LOOP === 'true',
    orchestrator,
    steps,
    time: new Date().toISOString()
  })
}
