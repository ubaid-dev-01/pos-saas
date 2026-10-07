import { sendLoginThankYouEmail } from "./_lib/notificationService.js";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    await sendLoginThankYouEmail(body);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("send-login-thank-you:", error);
    res.status(500).json({ error: error.message || "Failed to send email" });
  }
}
