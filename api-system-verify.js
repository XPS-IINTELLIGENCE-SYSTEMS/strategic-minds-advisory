export default async function handler(req, res) {
  console.log("AI IN ACTION SYSTEM VERIFY")

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers.host
    const base = `${protocol}://${host}`

    const targets = [
      { name: 'health', path: '/api/health' },
      { name: 'task-dispatch', path: '/api/task-dispatch' },
      { name: 'agent-loop', path: '/api/agent-loop' },
      { name: 'log-writer', path: '/api/log-writer' },
      { name: 'revenue', path: '/api/revenue' },
      { name: 'metrics', path: '/api/metrics' }
    ]

    const checks = []

    for (const target of targets) {
      try {
        const response = await fetch(`${base}${target.path}`)
        const text = await response.text()
        checks.push({
          name: target.name,
          path: target.path,
          ok: response.ok,
          status: response.status,
          bodyPreview: text.slice(0, 300)
        })
      } catch (err) {
        checks.push({
          name: target.name,
          path: target.path,
          ok: false,
          status: 0,
          error: err.message
        })
      }
    }

    const passed = checks.filter(check => check.ok).length
    const failed = checks.length - passed

    return res.status(failed === 0 ? 200 : 500).json({
      status: failed === 0 ? 'operational' : 'degraded',
      passed,
      failed,
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
