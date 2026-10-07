/**
 * Build plain-text receipt summaries for sharing via WhatsApp, SMS, or copy.
 *
 * Output stays under typical SMS chunking (~ 6 SMS @ 160 chars) and renders
 * cleanly in WhatsApp's monospace block when wrapped in triple-backticks.
 */

import { formatCurrency, formatDateTime } from "./format";

function pad(value, width) {
  const str = String(value ?? "");
  if (str.length >= width) return str;
  return str + " ".repeat(width - str.length);
}

function truncate(value, max) {
  const str = String(value ?? "");
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}

/**
 * Build a friendly multi-line receipt text suitable for WhatsApp / SMS.
 *
 * @param {object} receipt - the receipt object built by `CartSidebar` /
 *   `transactionStore.createTransaction`. Expected fields:
 *   `invoiceNo`, `date`, `items[]`, `subtotal`, `discountAmount`, `taxTotal`,
 *   `grandTotal`, `paymentMethod`, `customerName`, `store{name,phone}`.
 * @param {object} [opts]
 * @param {boolean} [opts.includeItems=true] - print line items
 * @param {boolean} [opts.includeStoreInfo=true]
 * @param {string}  [opts.thankYou] - custom closing line
 */
export function buildReceiptText(receipt, opts = {}) {
  if (!receipt) return "";
  const {
    includeItems = true,
    includeStoreInfo = true,
    thankYou = "Thank you for shopping with us!",
  } = opts;

  const store = receipt.store || {};
  const lines = [];

  if (includeStoreInfo && store.name) {
    lines.push(`*${store.name}*`);
    if (store.address) lines.push(store.address);
    if (store.phone) lines.push(`Phone: ${store.phone}`);
    lines.push("");
  }

  lines.push(`Invoice: ${receipt.invoiceNo || "—"}`);
  lines.push(`Date: ${formatDateTime(receipt.date)}`);
  if (receipt.customerName) lines.push(`Customer: ${receipt.customerName}`);
  if (receipt.cashierName) lines.push(`Cashier: ${receipt.cashierName}`);
  lines.push("");

  if (includeItems && Array.isArray(receipt.items) && receipt.items.length) {
    lines.push("Items:");
    for (const it of receipt.items) {
      const name = truncate(it.name, 24);
      const qty = Number(it.quantity) || 0;
      const total = formatCurrency(Number(it.total) || 0);
      lines.push(`${pad(name, 24)} ${pad(`x${qty}`, 4)} ${total}`);
    }
    lines.push("");
  }

  lines.push(`Subtotal: ${formatCurrency(receipt.subtotal || 0)}`);
  if (Number(receipt.discountAmount) > 0)
    lines.push(`Discount: -${formatCurrency(receipt.discountAmount)}`);
  if (Number(receipt.taxTotal) > 0)
    lines.push(`Tax:      ${formatCurrency(receipt.taxTotal)}`);
  lines.push(`*Total:    ${formatCurrency(receipt.grandTotal || 0)}*`);
  if (Number(receipt.udhaarAmount) > 0)
    lines.push(`Udhaar:   ${formatCurrency(receipt.udhaarAmount)}`);

  if (receipt.paymentMethod) {
    lines.push("");
    lines.push(`Payment: ${String(receipt.paymentMethod).toUpperCase()}`);
  }

  if (receipt.offline) {
    lines.push("(Offline sale — pending cloud sync)");
  }

  lines.push("");
  lines.push(thankYou);

  return lines.join("\n");
}

/**
 * Encode plain receipt text for a `wa.me` URL.
 *
 * @param {string} text   - the receipt text produced by `buildReceiptText`
 * @param {string} [phone] - international phone number (no +, no spaces).
 *                           If omitted, opens a blank WhatsApp share so the
 *                           sender can pick a contact.
 */
export function buildWhatsAppUrl(text, phone) {
  const encoded = encodeURIComponent(text);
  const cleanPhone = String(phone || "")
    .replace(/[^0-9]/g, "")
    .replace(/^0+/, "");
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

/** Native SMS URL — `sms:<phone>?body=<text>` (cross-platform). */
export function buildSmsUrl(text, phone) {
  const encoded = encodeURIComponent(text);
  const cleanPhone = String(phone || "").replace(/[^0-9+]/g, "");
  if (cleanPhone) return `sms:${cleanPhone}?body=${encoded}`;
  return `sms:?body=${encoded}`;
}

/**
 * Normalize a Pakistani phone number to international format suitable for
 * `wa.me` (no +, no leading zeros).
 *
 *  "03001234567"      → "923001234567"
 *  "+92 300 1234567"  → "923001234567"
 *  "0300-1234567"     → "923001234567"
 */
export function normalizePakistaniPhone(raw) {
  let digits = String(raw || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.length === 10) return `92${digits}`;
  return digits;
}
