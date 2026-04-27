export default async function handler(req, res) {
  console.log("AGENT LOOP TRIGGERED")

  try {
    // placeholder for future OpenAI + Supabase task execution
    const result = {
      status: "running",
      step: "agent-loop",
      time: new Date().toISOString()
    }

    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
