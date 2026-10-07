import { sendMail } from "./mailer.js";
import {
  buildExpiryAlertHtml,
  buildLoginThankYouHtml,
  buildLowStockAlertHtml,
  buildPasswordChangedHtml,
  buildWelcomeEmailHtml,
} from "./notificationEmails.js";

function normalizeTo(to) {
  return String(to || "")
    .trim()
    .toLowerCase();
}

function assertEmail(to) {
  const email = normalizeTo(to);
  if (!email || !email.includes("@")) {
    throw new Error("Valid recipient email required");
  }
  return email;
}

export async function sendLoginThankYouEmail({
  to,
  userName,
  storeName,
  loginTime,
}) {
  const email = assertEmail(to);
  const when =
    loginTime ||
    new Date().toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  await sendMail({
    to: email,
    subject: `Signed in · ${storeName || "QuickPOS"}`,
    text: `Hi ${userName || "there"},\n\nThank you for signing in to QuickPOS (${storeName || "your store"}) at ${when}.\n\nQuickPOS Team`,
    html: buildLoginThankYouHtml({ userName, storeName, loginTime: when }),
  });

  return { ok: true };
}

export async function sendWelcomeEmail({ to, ownerName, storeName }) {
  const email = assertEmail(to);
  const store = storeName || "QuickPOS";

  await sendMail({
    to: email,
    subject: `Welcome to QuickPOS · ${store}`,
    text: `Hi ${ownerName || "there"},\n\n${store} is ready on QuickPOS. You can start selling and tracking stock now.\n\nQuickPOS Team`,
    html: buildWelcomeEmailHtml({ ownerName, storeName: store }),
  });

  return { ok: true };
}

export async function sendPasswordChangedEmail({ to }) {
  const email = assertEmail(to);
  await sendMail({
    to: email,
    subject: "QuickPOS password updated",
    text: "Your QuickPOS password was changed successfully. If this wasn’t you, contact support.",
    html: buildPasswordChangedHtml(),
  });
  return { ok: true };
}

export async function sendExpiryAlertEmail({ to, storeName, items }) {
  const email = assertEmail(to);
  if (!items?.length) {
    throw new Error("No expiry items to send");
  }

  const count = items.length;
  const subject =
    count === 1
      ? `Expiry alert: ${items[0].productName}`
      : `Expiry alert: ${count} products need attention`;

  await sendMail({
    to: email,
    subject: `${subject} · ${storeName || "QuickPOS"}`,
    text: items
      .map((i) => `- ${i.productName}: ${i.title} — ${i.message}`)
      .join("\n"),
    html: buildExpiryAlertHtml({ storeName, items }),
  });

  return { ok: true };
}

export async function sendLowStockAlertEmail({ to, storeName, items }) {
  const email = assertEmail(to);
  if (!items?.length) throw new Error("No low-stock items");

  const outOfStock = items.filter((i) => Number(i.stock) <= 0).length;
  const subject =
    outOfStock > 0
      ? `Stock-out alert (${outOfStock}) · ${storeName || "QuickPOS"}`
      : `Low stock alert (${items.length}) · ${storeName || "QuickPOS"}`;

  await sendMail({
    to: email,
    subject,
    text: items
      .map((i) => {
        const stock = Number(i.stock) || 0;
        return `- ${i.productName}: ${stock <= 0 ? "OUT" : `${stock} left`}`;
      })
      .join("\n"),
    html: buildLowStockAlertHtml({ storeName, items, outOfStock }),
  });

  return { ok: true };
}
