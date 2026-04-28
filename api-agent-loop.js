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
        await fetch(`${base}/api/task-dispatch`, {
          method: 'GET',
          headers: { 'x-ai-action-source': 'agent-loop' }
        })
        iterations++
      }

      if (process.env.ENABLE_ORCHESTRATOR_FROM_AGENT_LOOP === 'true') {
        const headers = { 'x-ai-action-source': 'agent-loop' }
        if (process.env.ORCHESTRATOR_SECRET) headers.authorization = `Bearer ${process.env.ORCHESTRATOR_SECRET}`
        await fetch(`${base}/api/orchestrator`, { method: 'GET', headers })
      }
    })()
  )

  return res.status(200).json({
    status: "running",
    mode: "background",
    execution: "multi-step",
    steps: 3,
    orchestratorEnabled: process.env.ENABLE_ORCHESTRATOR_FROM_AGENT_LOOP === 'true',
    time: new Date().toISOString()
  })
}
