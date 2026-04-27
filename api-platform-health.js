export default function handler(req, res) {
  console.log("CRON platform-health executed")
  res.status(200).json({ status: "ok", job: "platform-health", time: new Date().toISOString() })
}
