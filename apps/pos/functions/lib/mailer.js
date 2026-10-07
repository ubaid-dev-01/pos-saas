import nodemailer from "nodemailer";

export function cfg(key, fallback = "") {
  return process.env[key] || fallback;
}

export function getSmtpUser() {
  return cfg("SMTP_USER") || cfg("FROM_EMAIL");
}

export function getSmtpPass() {
  return String(cfg("SMTP_PASS") || "").replace(/\s+/g, "");
}

export function fromAddress() {
  const from = cfg("SMTP_FROM");
  if (from) return from;
  const email = getSmtpUser();
  return email ? `QuickPOS <${email}>` : "QuickPOS";
}

export function getTransporter() {
  const user = getSmtpUser();
  const pass = getSmtpPass();
  if (!user || !pass) {
    throw new Error("SMTP not configured");
  }
  return nodemailer.createTransport({
    host: cfg("SMTP_HOST", "smtp.gmail.com"),
    port: Number(cfg("SMTP_PORT", "587")),
    secure: cfg("SMTP_SECURE", "false") === "true",
    auth: { user, pass },
  });
}

export async function sendMail(opts) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: fromAddress(),
    replyTo: cfg("SMTP_REPLY_TO", getSmtpUser()),
    ...opts,
    headers: { "X-App-Name": "QuickPOS", ...(opts.headers || {}) },
  });
}
