export default function handler(req, res) {
  console.log("CRON daily-summary executed")
  res.status(200).json({ status: "ok", job: "daily-summary", time: new Date().toISOString() })
}
