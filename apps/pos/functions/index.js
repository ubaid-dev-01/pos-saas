import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "node:url";
import { sendReceiptPdfEmail as sendReceiptPdfEmailLib } from "./lib/receiptEmail.js";

initializeApp();

const db = getFirestore();
const adminAuth = getAuth();

function loadLocalEnvFile() {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    let value = trimmed.slice(equalIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      const commentIndex = value.indexOf(" #");
      if (commentIndex !== -1) {
        value = value.slice(0, commentIndex).trim();
      }
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnvFile();

const OTP_TTL_MINUTES = 10;
const OTP_PURPOSES = new Set(["register", "reset-password"]);

function cfg(key, fallback = "") {
  return process.env[key] || fallback;
}

function getTransporter() {
  const host = cfg("SMTP_HOST", "smtp.gmail.com");
  const port = Number(cfg("SMTP_PORT", "587"));
  const secure = String(cfg("SMTP_SECURE", "false")) === "true";
  const user = cfg("SMTP_USER") || cfg("FROM_EMAIL");
  const pass = String(cfg("SMTP_PASS") || "").replace(/\s+/g, "");

  if (!user || !pass) {
    throw new HttpsError(
      "failed-precondition",
      "SMTP not configured. Set SMTP_USER and SMTP_PASS in Functions env.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function fromAddress() {
  if (cfg("SMTP_FROM")) return cfg("SMTP_FROM");
  const email = cfg("SMTP_USER") || cfg("FROM_EMAIL");
  return email ? `QuickPOS <${email}>` : "QuickPOS";
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function hash(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function otpDocId(email, purpose) {
  return `${purpose}_${hash(email)}`;
}

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendMail({ to, subject, text, html, attachments = [] }) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: fromAddress(),
    replyTo: cfg("SMTP_REPLY_TO", cfg("SMTP_USER")),
    to,
    subject,
    text,
    html,
    attachments,
    headers: {
      "X-App-Name": "QuickPOS",
    },
  });
}

function wrapEmailHtml({ heading, intro, bodyHtml }) {
  return `
    <div style="font-family:Segoe UI,Arial,sans-serif;color:#111;line-height:1.5;max-width:640px;margin:0 auto;">
      <h2 style="margin:0 0 10px;color:#0F4B46;">${heading}</h2>
      <p style="margin:0 0 12px;color:#374151;">${intro}</p>
      <div style="padding:12px 14px;border:1px solid #E5E7EB;border-radius:10px;background:#F9FAFB;">${bodyHtml}</div>
      <p style="margin:14px 0 0;color:#6B7280;font-size:12px;">QuickPOS Team</p>
    </div>
  `;
}

function validatePurpose(purpose) {
  if (!OTP_PURPOSES.has(purpose)) {
    throw new HttpsError("invalid-argument", "Invalid OTP purpose.");
  }
}

async function isEmailRegistered(email) {
  try {
    await adminAuth.getUserByEmail(email);
    return true;
  } catch (err) {
    if (err?.code === "auth/user-not-found") return false;
    throw err;
  }
}

async function assertEmailEligibleForOtp(email, purpose) {
  const registered = await isEmailRegistered(email);

  if (purpose === "register" && registered) {
    throw new HttpsError(
      "already-exists",
      "This email is already registered. Sign in or use a different email.",
    );
  }

  if (purpose === "reset-password" && !registered) {
    throw new HttpsError(
      "not-found",
      "No QuickPOS account found for this email. Use the same email you used to sign up.",
    );
  }
}

function normalizeReceiptItems(items = []) {
  return items.map((item) => ({
    name: String(item?.name || "Item"),
    quantity: Number(item?.quantity) || 0,
    unitPrice: Number(item?.unitPrice) || 0,
    total: Number(item?.total) || 0,
  }));
}

function receiptText(receipt) {
  const items = normalizeReceiptItems(receipt.items || []);
  return [
    receipt.store?.name || "QuickPOS",
    `Invoice: ${receipt.invoiceNo || "-"}`,
    `Date: ${receipt.date || "-"}`,
    `Customer: ${receipt.customerName || "Walk-in Customer"}`,
    "",
    ...items.map(
      (item) =>
        `- ${item.name} (${item.quantity} x ${item.unitPrice.toFixed(2)}) = ${item.total.toFixed(2)}`,
    ),
    "",
    `Subtotal: ${(Number(receipt.subtotal) || 0).toFixed(2)}`,
    `Discount: -${(Number(receipt.discountAmount) || 0).toFixed(2)}`,
    `Tax: ${(Number(receipt.taxTotal) || 0).toFixed(2)}`,
    `Grand Total: ${(Number(receipt.grandTotal) || 0).toFixed(2)}`,
    `Payment: ${(receipt.paymentMethod || "").toUpperCase()}`,
    "",
    "Thank you for shopping with us!",
  ].join("\n");
}

async function sendReceiptPdfEmail({ to, receipt }) {
  await sendReceiptPdfEmailLib({ to, receipt });
}

export const submitLeadAndNotify = onCall({ cors: true }, async (req) => {
  const payload = req.data || {};
  const name = String(payload.name || "").trim();
  const businessName = String(payload.businessName || "").trim();
  const phone = String(payload.phone || "").trim();
  const email = normalizeEmail(payload.email || "");
  const businessType = String(payload.businessType || "").trim();
  const storeCount = String(payload.storeCount || "").trim();
  const preferredContact = String(payload.preferredContact || "").trim();
  const source = String(payload.source || "website").trim();
  const message = String(payload.message || "").trim();

  if (
    !name ||
    !businessName ||
    !phone ||
    !businessType ||
    !storeCount ||
    !preferredContact
  ) {
    throw new HttpsError("invalid-argument", "Missing required lead fields.");
  }

  const leadRef = await db.collection("leads").add({
    name,
    businessName,
    phone,
    email: email || null,
    businessType,
    storeCount,
    preferredContact,
    source,
    message,
    status: "new",
    notes: "",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const subject = `New QuickPOS lead: ${businessName}`;
  const lines = [
    `Lead ID: ${leadRef.id}`,
    `Name: ${name}`,
    `Business: ${businessName}`,
    `Phone: ${phone}`,
    `Email: ${email || "N/A"}`,
    `Business Type: ${businessType}`,
    `Store Count: ${storeCount}`,
    `Preferred Contact: ${preferredContact}`,
    `Source: ${source}`,
    `Message: ${message || "N/A"}`,
  ];

  await sendMail({
    to: cfg("SMTP_USER"),
    subject,
    text: lines.join("\n"),
    html: wrapEmailHtml({
      heading: "New Lead Received",
      intro: "A new lead has been submitted from the website.",
      bodyHtml: `<p style=\"margin:0;white-space:pre-wrap;\">${lines.join("\n")}</p>`,
    }),
  });

  return { ok: true, leadId: leadRef.id };
});

export const sendStoreWelcomeEmail = onCall({ cors: true }, async (req) => {
  const data = req.data || {};
  const to = normalizeEmail(data.to || data.email || data.storeEmail);
  const storeName = String(data.storeName || data.name || "Your store").trim();
  const ownerName = String(data.ownerName || data.name || "").trim();
  const city = String(data.city || data.office || "").trim();

  if (!to || !to.includes("@")) {
    throw new HttpsError(
      "invalid-argument",
      "Valid recipient email is required.",
    );
  }

  await sendMail({
    to,
    subject: `Welcome to QuickPOS, ${storeName}`,
    text: [
      `Hi ${ownerName || storeName},`,
      "",
      "Thanks for registering your QuickPOS store.",
      `Store: ${storeName}`,
      city ? `Location: ${city}` : null,
      "",
      "Our team will help you get started with billing, inventory, and reports.",
      "",
      "QuickPOS Team",
    ]
      .filter(Boolean)
      .join("\n"),
    html: wrapEmailHtml({
      heading: `Welcome to QuickPOS${storeName ? `, ${storeName}` : ""}`,
      intro: "Your store registration was completed successfully.",
      bodyHtml: `
        <p style="margin:0 0 8px;">Hi ${ownerName || storeName || "there"},</p>
        <p style="margin:0 0 8px;">Thanks for registering your store with QuickPOS.</p>
        <p style="margin:0 0 8px;"><b>Store:</b> ${storeName || "-"}</p>
        ${city ? `<p style="margin:0 0 8px;"><b>Location:</b> ${city}</p>` : ""}
        <p style="margin:0;">We will help you with billing setup, stock control, and daily retail operations.</p>
      `,
    }),
  });

  return { ok: true };
});

export const sendEmailOtp = onCall({ cors: true }, async (req) => {
  const email = normalizeEmail(req.data?.email);
  const purpose = String(req.data?.purpose || "").trim();
  validatePurpose(purpose);

  if (!email || !email.includes("@")) {
    throw new HttpsError("invalid-argument", "Valid email is required.");
  }

  await assertEmailEligibleForOtp(email, purpose);

  const ref = db.collection("emailOtps").doc(otpDocId(email, purpose));
  const snap = await ref.get();
  const now = Date.now();

  if (snap.exists) {
    const data = snap.data() || {};
    const lastSentAt = data.lastSentAt?.toMillis?.() || 0;
    if (now - lastSentAt < 60 * 1000) {
      throw new HttpsError(
        "resource-exhausted",
        "Please wait before requesting another OTP.",
      );
    }
  }

  const otp = makeOtp();
  const codeHash = hash(otp);
  const expiresAt = Timestamp.fromMillis(now + OTP_TTL_MINUTES * 60 * 1000);

  await ref.set(
    {
      email,
      purpose,
      codeHash,
      attempts: 0,
      verified: false,
      expiresAt,
      lastSentAt: Timestamp.fromMillis(now),
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: snap.exists
        ? snap.data()?.createdAt || FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await sendMail({
    to: email,
    subject: `QuickPOS OTP (${purpose === "register" ? "Registration" : "Password Reset"})`,
    text: `Your QuickPOS OTP is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`,
    html: wrapEmailHtml({
      heading: "Your QuickPOS OTP",
      intro: "Use the code below to continue. Do not share this code.",
      bodyHtml: `<p style=\"margin:0;font-size:24px;font-weight:700;letter-spacing:3px;color:#0F4B46;\">${otp}</p><p style=\"margin:8px 0 0;color:#4B5563;\">Expires in ${OTP_TTL_MINUTES} minutes.</p>`,
    }),
  });

  return { ok: true };
});

export const verifyEmailOtp = onCall({ cors: true }, async (req) => {
  const email = normalizeEmail(req.data?.email);
  const purpose = String(req.data?.purpose || "").trim();
  const otp = String(req.data?.otp || "").trim();
  validatePurpose(purpose);

  if (!email || !otp) {
    throw new HttpsError("invalid-argument", "Email and OTP are required.");
  }

  const ref = db.collection("emailOtps").doc(otpDocId(email, purpose));
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError(
      "not-found",
      "OTP not found. Please request a new one.",
    );
  }

  const data = snap.data() || {};
  const expired = (data.expiresAt?.toMillis?.() || 0) < Date.now();
  if (expired) {
    throw new HttpsError(
      "deadline-exceeded",
      "OTP expired. Please request a new one.",
    );
  }

  const attempts = Number(data.attempts) || 0;
  if (attempts >= 5) {
    throw new HttpsError(
      "permission-denied",
      "Too many attempts. Request a new OTP.",
    );
  }

  const ok = data.codeHash === hash(otp);
  if (!ok) {
    await ref.update({
      attempts: attempts + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
    throw new HttpsError("permission-denied", "Invalid OTP.");
  }

  await ref.update({
    verified: true,
    verifiedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { ok: true, verified: true };
});

export const resetPasswordWithOtp = onCall({ cors: true }, async (req) => {
  const email = normalizeEmail(req.data?.email);
  const otp = String(req.data?.otp || "").trim();
  const newPassword = String(req.data?.newPassword || "");

  if (!email || !otp || newPassword.length < 6) {
    throw new HttpsError(
      "invalid-argument",
      "Email, OTP and strong password are required.",
    );
  }

  const ref = db.collection("emailOtps").doc(otpDocId(email, "reset-password"));
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "OTP not found.");
  }

  const data = snap.data() || {};
  const expired = (data.expiresAt?.toMillis?.() || 0) < Date.now();
  if (expired) throw new HttpsError("deadline-exceeded", "OTP expired.");

  const attempts = Number(data.attempts) || 0;
  if (attempts >= 5) {
    throw new HttpsError("permission-denied", "Too many attempts.");
  }

  if (data.codeHash !== hash(otp)) {
    await ref.update({
      attempts: attempts + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
    throw new HttpsError("permission-denied", "Invalid OTP.");
  }

  const user = await adminAuth.getUserByEmail(email);
  await adminAuth.updateUser(user.uid, { password: newPassword });

  await ref.delete();

  await sendMail({
    to: email,
    subject: "QuickPOS password changed",
    text: "Your QuickPOS password was changed successfully.",
    html: wrapEmailHtml({
      heading: "Password Updated",
      intro: "Your QuickPOS password was changed successfully.",
      bodyHtml:
        '<p style="margin:0;color:#4B5563;">If this was not you, contact support immediately.</p>',
    }),
  });

  return { ok: true };
});

export const sendReceiptEmail = onCall({ cors: true }, async (req) => {
  const data = req.data || {};
  const to = normalizeEmail(data.to);
  const receipt = data.receipt || {};

  if (!to || !to.includes("@")) {
    throw new HttpsError(
      "invalid-argument",
      "Valid recipient email is required.",
    );
  }

  await sendReceiptPdfEmail({ to, receipt });

  return { ok: true };
});
