export default async function handler(req, res) {
  console.log("METRICS COLLECTION TRIGGERED")

  try {
    const metrics = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      status: "active"
    }

    return res.status(200).json({ status: "ok", metrics })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
