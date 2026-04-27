export default async function handler(req, res) {
  console.log("TASK DISPATCH SEQUENTIAL EXECUTION")

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers.host
    const base = `${protocol}://${host}`

    await fetch(`${base}/api-log-writer`)
    await fetch(`${base}/api-revenue`)
    await fetch(`${base}/api-metrics`)

    return res.status(200).json({
      status: "ok",
      execution: "sequential",
      chain: "log → revenue → metrics",
      time: new Date().toISOString()
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
