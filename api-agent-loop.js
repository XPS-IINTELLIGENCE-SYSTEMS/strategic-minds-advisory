import { waitUntil } from '@vercel/functions'

export const maxDuration = 60

export default function handler(req, res) {
  console.log("AGENT LOOP + MULTI STEP EXECUTION")

  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers.host
  const base = `${protocol}://${host}`

  waitUntil(
    (async () => {
      let iterations = 0
      const MAX = 3

      while (iterations < MAX) {
        await fetch(`${base}/api/task-dispatch`)
        iterations++
      }
    })()
  )

  return res.status(200).json({
    status: "running",
    mode: "background",
    execution: "multi-step",
    steps: 3,
    time: new Date().toISOString()
  })
}
