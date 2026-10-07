import { sendLowStockAlertEmail } from "./_lib/notificationService.js";

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
    const { to, storeName, items } = req.body || {};
    const data = await sendLowStockAlertEmail({ to, storeName, items });
    res.status(200).json(data);
  } catch (error) {
    console.error("send-low-stock-alert-email:", error);
    res.status(500).json({
      error: error.message || "Failed to send low-stock alert",
    });
  }
}
