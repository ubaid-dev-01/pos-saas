import { resetPasswordWithOtp as resetWithOtp } from "./_lib/otpService.js";

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
    const { email, otp, newPassword } = req.body || {};
    const data = await resetWithOtp(email, otp, newPassword);
    res.status(200).json(data);
  } catch (error) {
    const code = error?.code || "";
    const status =
      code === "ADMIN_NOT_CONFIGURED"
        ? 503
        : String(error?.message || "").includes("Invalid OTP") ||
            String(error?.message || "").includes("OTP")
          ? 403
          : 500;
    res.status(status).json({
      error: error.message || "Could not reset password",
      code: code || undefined,
    });
  }
}
