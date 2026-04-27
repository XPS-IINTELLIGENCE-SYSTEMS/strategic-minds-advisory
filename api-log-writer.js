export default async function handler(req, res) {
  console.log("LOG WRITER ACTIVE")

  try {
    const log = {
      event: "system-execution",
      time: new Date().toISOString()
    }

    return res.status(200).json({ status: "logged", log })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
