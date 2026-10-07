import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

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
    throw new Error(
      "SMTP not configured. Set SMTP_USER, SMTP_PASS, and FROM_EMAIL in .env",
    );
  }

  return nodemailer.createTransport({
    host: cfg("SMTP_HOST", "smtp.gmail.com"),
    port: Number(cfg("SMTP_PORT", "587")),
    secure: cfg("SMTP_SECURE", "false") === "true",
    auth: { user, pass },
  });
}

export async function sendMail({ to, subject, text, html, attachments = [] }) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: fromAddress(),
    replyTo: cfg("SMTP_REPLY_TO", getSmtpUser()),
    to,
    subject,
    text,
    html,
    attachments,
    headers: { "X-App-Name": "QuickPOS" },
  });
}
