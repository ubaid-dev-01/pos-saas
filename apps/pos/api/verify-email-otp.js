import { verifyEmailOtp as verifyOtp } from "./_lib/otpService.js";

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
    const { email, purpose, otp } = req.body || {};
    const data = await verifyOtp(email, purpose, otp);
    res.status(200).json(data);
  } catch (error) {
    const status = error.message?.includes("Invalid") ? 403 : 500;
    res.status(status).json({ error: error.message || "Verification failed" });
  }
}
