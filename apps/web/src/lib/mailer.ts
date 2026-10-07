import nodemailer from "nodemailer";

function cfg(key: string, fallback = "") {
  return (process.env[key] || fallback).trim();
}

function smtpUser() {
  return cfg("SMTP_USER") || cfg("FROM_EMAIL");
}

function smtpPass() {
  return cfg("SMTP_PASS").replace(/\s+/g, "");
}

function fromAddress() {
  const from = cfg("SMTP_FROM");
  if (from) return from;
  const email = smtpUser();
  return email ? `QuickPOS <${email}>` : "QuickPOS";
}

export function leadNotifyTo() {
  return (
    cfg("LEAD_NOTIFY_TO") ||
    cfg("SMTP_REPLY_TO") ||
    cfg("FROM_EMAIL") ||
    smtpUser()
  );
}

export function assertSmtpConfigured() {
  const user = smtpUser();
  const pass = smtpPass();
  const to = leadNotifyTo();
  if (!user || !pass) {
    throw new Error(
      "SMTP not configured. Set SMTP_USER and SMTP_PASS on the marketing Vercel project.",
    );
  }
  if (!to) {
    throw new Error(
      "Lead inbox not configured. Set LEAD_NOTIFY_TO or SMTP_REPLY_TO.",
    );
  }
}

function getTransporter() {
  assertSmtpConfigured();
  return nodemailer.createTransport({
    host: cfg("SMTP_HOST", "smtp.gmail.com"),
    port: Number(cfg("SMTP_PORT", "587")),
    secure: cfg("SMTP_SECURE", "false") === "true",
    auth: { user: smtpUser(), pass: smtpPass() },
  });
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapLayout(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#eef2f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#fff;border:1px solid rgba(7,19,31,0.12);border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#07131f;padding:22px 28px;">
            <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#0e7c77;font-weight:600;">QuickPOS</div>
            <div style="margin-top:8px;font-size:20px;font-weight:700;color:#f4f6f8;">${escapeHtml(title)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;color:#07131f;font-size:15px;line-height:1.6;">${bodyHtml}</td>
        </tr>
        <tr>
          <td style="padding:16px 28px 22px;border-top:1px solid rgba(7,19,31,0.08);background:#f8fafb;">
            <p style="margin:0;font-size:12px;color:#5b6775;">Cloud POS for Pakistan retail · We typically reply within 24 hours.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export type LeadMailPayload = {
  name: string;
  businessName: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
};

export async function sendLeadNotification(lead: LeadMailPayload) {
  const transporter = getTransporter();
  const to = leadNotifyTo();
  const replyTo =
    lead.email && lead.email.includes("@")
      ? lead.email.trim()
      : cfg("SMTP_REPLY_TO", smtpUser());

  const subject = `New QuickPOS lead — ${lead.businessName || lead.name}`;
  const text = [
    "New QuickPOS lead",
    `Name: ${lead.name}`,
    `Business: ${lead.businessName}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email || "—"}`,
    `Source: ${lead.source || "website"}`,
    `Message: ${lead.message || "—"}`,
  ].join("\n");

  const html = wrapLayout(
    "New lead received",
    `
      <p style="margin:0 0 16px;color:#5b6775;">Someone submitted the contact form. Reply within 24 hours.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#5b6775;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6775;">Business</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(lead.businessName)}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6775;">Phone</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(lead.phone)}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6775;">Email</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(lead.email || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6775;">Source</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(lead.source || "website")}</td></tr>
        <tr><td style="padding:8px 0;color:#5b6775;vertical-align:top;">Message</td><td style="padding:8px 0;">${escapeHtml(lead.message || "—")}</td></tr>
      </table>
    `,
  );

  await transporter.sendMail({
    from: fromAddress(),
    to,
    replyTo,
    subject,
    text,
    html,
    headers: { "X-App-Name": "QuickPOS-Web" },
  });
}

/** Thank-you to the person who contacted us — promise 24h response. */
export async function sendLeadThankYou(lead: LeadMailPayload) {
  const email = String(lead.email || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) return { skipped: true as const };

  const transporter = getTransporter();
  const name = escapeHtml(lead.name || "there");
  const business = escapeHtml(lead.businessName || "your business");

  await transporter.sendMail({
    from: fromAddress(),
    to: email,
    replyTo: cfg("SMTP_REPLY_TO", smtpUser()),
    subject: "Thanks for contacting QuickPOS — we’ll reply within 24 hours",
    text: `Hi ${lead.name || "there"},\n\nThanks for reaching out about ${lead.businessName || "your store"}. Our team typically responds within 24 hours.\n\nQuickPOS Team`,
    html: wrapLayout(
      "Thank you — we got your message",
      `
        <p style="margin:0 0 14px;">Hi <strong>${name}</strong>,</p>
        <p style="margin:0 0 14px;color:#5b6775;">
          Thanks for contacting QuickPOS about <strong style="color:#07131f;">${business}</strong>.
          Our team typically responds within <strong style="color:#07131f;">24 hours</strong>.
        </p>
        <div style="background:#e4f2f1;border:1px solid rgba(14,124,119,0.3);border-radius:6px;padding:14px 16px;margin:18px 0;">
          <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0a5c58;">What happens next</div>
          <p style="margin:8px 0 0;color:#07131f;font-size:14px;">
            We’ll review your note and follow up by email or WhatsApp with setup options for your store.
          </p>
        </div>
        <p style="margin:0;font-size:13px;color:#5b6775;">
          If it’s urgent, call or WhatsApp us from the contact page anytime.
        </p>
      `,
    ),
    headers: { "X-App-Name": "QuickPOS-Web" },
  });

  return { ok: true as const };
}
