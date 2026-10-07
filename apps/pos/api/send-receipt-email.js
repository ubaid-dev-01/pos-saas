import { sendReceiptPdfEmail } from "./_lib/receiptEmail.js";

function cors(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, receipt } = req.body || {};

    if (!to || !String(to).includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    await sendReceiptPdfEmail({ to: String(to).trim().toLowerCase(), receipt: receipt || {} });

    res.status(200).json({ ok: true, message: "Receipt sent successfully" });
  } catch (error) {
    console.error("Send receipt email error:", error);
    res.status(500).json({
      error: error?.message || "Failed to send receipt email",
    });
  }
}
