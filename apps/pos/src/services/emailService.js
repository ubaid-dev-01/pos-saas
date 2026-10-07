import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";

const call = (name) => httpsCallable(functions, name);

const EMAIL_API_BASE = import.meta.env.VITE_EMAIL_API_BASE || "/api";

function isAdminNotConfiguredError(err) {
  return (
    err?.code === "ADMIN_NOT_CONFIGURED" ||
    String(err?.message || "").includes("Firebase Admin")
  );
}

async function callCloudFunction(name, data) {
  try {
    const res = await call(name)(data);
    return res.data;
  } catch (err) {
    const msg =
      err?.message ||
      err?.details ||
      err?.code ||
      "Cloud function request failed";
    throw new Error(msg);
  }
}

async function postEmailApi(path, body) {
  const response = await fetch(`${EMAIL_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status})`);
    if (data.code) err.code = data.code;
    throw err;
  }

  return data;
}

export async function sendEmailOtp(email, purpose) {
  return postEmailApi("/send-email-otp", { email, purpose });
}

export async function verifyEmailOtp(email, purpose, otp) {
  return postEmailApi("/verify-email-otp", { email, purpose, otp });
}

export async function resetPasswordWithOtp(email, otp, newPassword) {
  try {
    return await postEmailApi("/reset-password-with-otp", {
      email,
      otp,
      newPassword,
    });
  } catch (err) {
    if (!isAdminNotConfiguredError(err)) throw err;
    const restartHint =
      "Restart the dev server (Ctrl+C, then npm run dev) after adding firebase-service-account.json.";
    if (typeof window !== "undefined") {
      const host = window.location?.hostname || "";
      if (host === "localhost" || host === "127.0.0.1") {
        throw new Error(`${err.message} ${restartHint}`);
      }
    }
    return callCloudFunction("resetPasswordWithOtp", {
      email,
      otp,
      newPassword,
    });
  }
}

export async function submitLeadAndNotify(payload) {
  const fn = call("submitLeadAndNotify");
  const res = await fn(payload);
  return res.data;
}

export async function sendReceiptEmail(payload) {
  return postEmailApi("/send-receipt-email", payload);
}

export async function sendStoreWelcomeEmail(payload) {
  return postEmailApi("/send-welcome-email", payload);
}

export async function sendLoginThankYouEmail(payload) {
  return postEmailApi("/send-login-thank-you-email", payload);
}

export async function sendExpiryAlertEmail(payload) {
  return postEmailApi("/send-expiry-alert-email", payload);
}

export async function sendLowStockAlertEmail(payload) {
  return postEmailApi("/send-low-stock-alert-email", payload);
}
