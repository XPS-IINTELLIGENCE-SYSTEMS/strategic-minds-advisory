export default async function handler(req, res) {
  console.log("CRON → AGENT LOOP")

  try {
    await fetch(process.env.BASE_URL + "/api/agent-loop")

    return res.status(200).json({
      status: "ok",
      next: "agent-loop",
      time: new Date().toISOString()
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
