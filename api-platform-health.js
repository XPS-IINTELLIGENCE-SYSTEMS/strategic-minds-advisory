export default async function handler(req, res) {
  console.log("CRON → AGENT LOOP")

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers.host
    const base = `${protocol}://${host}`

    const response = await fetch(`${base}/api/agent-loop`, {
      method: 'GET',
      headers: { 'x-ai-action-source': 'platform-health-cron' }
    })

    const text = await response.text()
    let body = text
    try { body = JSON.parse(text) } catch (_) {}

    return res.status(response.ok ? 200 : 502).json({
      status: response.ok ? "ok" : "degraded",
      next: "agent-loop",
      base,
      agentLoopStatus: response.status,
      agentLoop: body,
      time: new Date().toISOString()
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
