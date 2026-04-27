export default function handler(req, res) {
  console.log("HEALTH CHECK + WARMUP")

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers.host
    const base = `${protocol}://${host}`

    fetch(`${base}/api/task-dispatch`)
    fetch(`${base}/api/agent-loop`)

    return res.status(200).json({
      status: "ok",
      warmup: true,
      time: new Date().toISOString()
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
