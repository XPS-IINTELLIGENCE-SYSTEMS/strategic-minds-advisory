export default function handler(req, res) {
  console.log("CRON content-package executed")
  res.status(200).json({ status: "ok", job: "content-package", time: new Date().toISOString() })
}
