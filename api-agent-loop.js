import { waitUntil } from '@vercel/functions'

export default function handler(req, res) {
  console.log("AGENT LOOP + FULL TELEMETRY")

  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers.host
  const base = `${protocol}://${host}`

  waitUntil(
    Promise.all([
      fetch(`${base}/api/task-dispatch`),
      fetch(`${base}/api-log-writer`),
      fetch(`${base}/api-revenue`),
      fetch(`${base}/api-metrics`)
    ])
  )

  return res.status(200).json({
    status: "running",
    mode: "background",
    chain: "task-dispatch + log + revenue + metrics",
    time: new Date().toISOString()
  })
}
