export default async function handler(req, res) {
  console.log("TASK DISPATCH TRIGGERED")

  try {
    const task = {
      id: Date.now(),
      type: "system-check",
      status: "queued",
      created: new Date().toISOString()
    }

    return res.status(200).json({ status: "ok", task })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
