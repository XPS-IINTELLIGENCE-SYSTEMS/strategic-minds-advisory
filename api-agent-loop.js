export default async function handler(req, res) {
  console.log("AGENT LOOP + CHAIN RUNNING")

  try {
    await fetch(process.env.BASE_URL + "/api/task-dispatch")

    return res.status(200).json({
      status: "running",
      chain: "task-dispatch",
      time: new Date().toISOString()
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
