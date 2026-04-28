export default async function handler(req, res) {
  console.log("AI IN ACTION SYSTEM VERIFY")

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers.host
    const base = `${protocol}://${host}`

    const targets = [
      { name: 'health', path: '/api/health', critical: true },
      { name: 'platform-health-cron', path: '/api/cron/platform-health', critical: true },
      { name: 'agent-loop', path: '/api/agent-loop', critical: true },
      { name: 'task-dispatch', path: '/api/task-dispatch', critical: true },
      { name: 'orchestrator', path: '/api/orchestrator', critical: false },
      { name: 'log-writer', path: '/api/log-writer', critical: false },
      { name: 'revenue', path: '/api/revenue', critical: false },
      { name: 'metrics', path: '/api/metrics', critical: false }
    ]

    const checks = []

    for (const target of targets) {
      try {
        const headers = { 'x-ai-action-source': 'system-verify' }
        if (process.env.ORCHESTRATOR_SECRET && target.name === 'orchestrator') {
          headers.authorization = `Bearer ${process.env.ORCHESTRATOR_SECRET}`
        }

        const response = await fetch(`${base}${target.path}`, { method: 'GET', headers })
        const text = await response.text()
        checks.push({
          name: target.name,
          path: target.path,
          critical: target.critical,
          ok: response.ok,
          status: response.status,
          bodyPreview: text.slice(0, 500)
        })
      } catch (err) {
        checks.push({
          name: target.name,
          path: target.path,
          critical: target.critical,
          ok: false,
          status: 0,
          error: err.message
        })
      }
    }

    const passed = checks.filter(check => check.ok).length
    const failed = checks.length - passed
    const criticalFailed = checks.filter(check => check.critical && !check.ok).length

    return res.status(criticalFailed === 0 ? 200 : 500).json({
      status: criticalFailed === 0 ? 'operational' : 'degraded',
      passed,
      failed,
      criticalFailed,
      checks,
      time: new Date().toISOString()
    })
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      error: err.message,
      time: new Date().toISOString()
    })
  }
}
