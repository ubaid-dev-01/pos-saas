import { sendWelcomeEmail } from "./_lib/notificationService.js";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const to = body.to || body.email;
    await sendWelcomeEmail({
      to,
      ownerName: body.ownerName,
      storeName: body.storeName || body.name,
    });
    res.status(200).json({ ok: true, message: "Welcome email sent" });
  } catch (error) {
    console.error("send-welcome-email:", error);
    res.status(500).json({ error: error.message || "Failed to send welcome email" });
  }
}
