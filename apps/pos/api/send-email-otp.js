import {
  sendEmailOtp as sendOtp,
} from "./_lib/otpService.js";

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
    const { email, purpose } = req.body || {};
    const data = await sendOtp(email, purpose);
    res.status(200).json(data);
  } catch (error) {
    console.error("send-email-otp:", error);
    const code = error?.code || "";
    const status =
      code === "EMAIL_ALREADY_REGISTERED"
        ? 409
        : code === "EMAIL_NOT_REGISTERED"
          ? 404
          : code === "ADMIN_NOT_CONFIGURED"
            ? 503
            : code === "DISPOSABLE_EMAIL" || code === "INVALID_EMAIL"
              ? 400
              : code === "OTP_DELIVERY_FAILED"
                ? 502
                : 500;
    res.status(status).json({ error: error.message || "Failed to send OTP", code });
  }
}
