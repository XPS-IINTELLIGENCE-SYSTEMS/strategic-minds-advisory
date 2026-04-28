export const maxDuration = 60

export default async function handler(req, res) {
  console.log("AGENT LOOP + SAFE MULTI STEP EXECUTION")

  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers.host
  const base = `${protocol}://${host}`
  const steps = []
  const MAX = 3

  try {
    for (let i = 0; i < MAX; i++) {
      try {
        const response = await fetch(`${base}/api/task-dispatch`, {
          method: 'GET',
          headers: { 'x-ai-action-source': 'agent-loop' }
        })
        const text = await response.text()
        let body = text
        try { body = JSON.parse(text) } catch (_) {}
        steps.push({ step: i + 1, route: '/api/task-dispatch', ok: response.ok, status: response.status, body })
      } catch (error) {
        steps.push({ step: i + 1, route: '/api/task-dispatch', ok: false, error: error.message })
      }
    }

    let orchestrator = null
    if (process.env.ENABLE_ORCHESTRATOR_FROM_AGENT_LOOP === 'true') {
      try {
        const headers = { 'x-ai-action-source': 'agent-loop' }
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
      mode: 'safe-inline',
      execution: 'multi-step',
      stepsRequested: MAX,
      stepsSucceeded: MAX - failed,
      stepsFailed: failed,
      orchestratorEnabled: process.env.ENABLE_ORCHESTRATOR_FROM_AGENT_LOOP === 'true',
      orchestrator,
      steps,
      time: new Date().toISOString()
    })
  } catch (error) {
    return res.status(200).json({
      status: 'degraded',
      mode: 'safe-inline',
      error: error.message,
      steps,
      time: new Date().toISOString()
    })
  }
}
