import { Copy, MessageCircle, Printer, Send, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { sendReceiptEmail } from "../../services/emailService";
import { hasReceiptCustomerName } from "../../utils/customerName";
import { fbrStatusLabel } from "../../utils/fbr";
import { formatCurrency, formatDateTime } from "../../utils/format";
import {
  buildReceiptText,
  buildSmsUrl,
  buildWhatsAppUrl,
  normalizePakistaniPhone,
} from "../../utils/receiptText";
import { useTranslation } from "../../context/LocaleContext";
import Modal from "../ui/Modal";

export default function ReceiptModal({ open, onClose, receipt }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open || !receipt) return;
    const presetEmail =
      receipt.customerEmail ||
      receipt.store?.email ||
      "";
    setEmail(String(presetEmail).trim());
    const presetPhone = receipt.customerPhone || "";
    setPhone(String(presetPhone).trim());
    setSending(false);
  }, [open, receipt?.invoiceNo]);

  const receiptText = useMemo(
    () => (receipt ? buildReceiptText(receipt) : ""),
    [receipt],
  );

  if (!receipt) return null;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const supportLine =
    receipt.store?.phone || receipt.store?.email || t("receipt.supportDesk");

  const noteLines = [
    t("receipt.noteExchange"),
    t("receipt.noteDamaged"),
    t("receipt.noteHelp", { contact: supportLine }),
  ];

  const print = () => {
    const w = window.open("", "THERMAL_RECEIPT", "width=420,height=760");
    if (!w) {
      toast.error(t("receipt.popupBlocked"));
      return;
    }

    const rows = (receipt.items || [])
      .map(
        (it) => `
          <tr class="item-row">
            <td>
              <div class="item-name">${escapeHtml(it.name || "")}</div>
              <div class="item-meta">${Number(it.quantity) || 0} x ${formatCurrency(Number(it.unitPrice) || 0)}</div>
            </td>
            <td style="text-align:right;">${formatCurrency(it.total || 0)}</td>
          </tr>
        `,
      )
      .join("");

    const notes = noteLines
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");

    const customerPrintRow = hasReceiptCustomerName(receipt.customerName)
      ? `<div><span class="meta-label">Customer</span><br />${escapeHtml(receipt.customerName)}</div>`
      : "";

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Receipt ${receipt.invoiceNo || ""}</title>
          <style>
            @page { size: 80mm auto; margin: 2mm; }
            html, body { width: 80mm; margin: 0; padding: 0; }
            body {
              font-family: "Segoe UI", "Arial", sans-serif;
              font-size: 11px;
              line-height: 1.35;
              color: #111;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt { width: 76mm; margin: 0 auto; }
            .center { text-align: center; }
            .muted { color: #4b5563; }
            .sep { border-top: 1px dashed #9ca3af; margin: 7px 0; }
            .brand-row {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            .logo {
              width: 28px;
              height: 28px;
              object-fit: contain;
              border-radius: 6px;
              border: 1px solid #d1d5db;
            }
            .brand-name { font-weight: 800; font-size: 15px; letter-spacing: 0.2px; }
            .headline {
              text-transform: uppercase;
              letter-spacing: 1px;
              font-size: 10px;
              color: #0f766e;
              font-weight: 700;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px 10px;
            }
            .meta-label { color: #6b7280; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 3px 0; vertical-align: top; }
            th {
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: .5px;
              color: #374151;
              border-bottom: 1px dashed #9ca3af;
            }
            .item-row td { border-bottom: 1px dotted #d1d5db; }
            .item-name { font-weight: 600; }
            .item-meta { color: #6b7280; font-size: 10px; }
            .totals { margin-top: 4px; }
            .totals-row { display: flex; justify-content: space-between; margin: 2px 0; }
            .grand {
              font-weight: 800;
              font-size: 14px;
              padding-top: 2px;
              color: #0f172a;
            }
            .paid-pill {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 999px;
              background: #ecfeff;
              border: 1px solid #99f6e4;
              color: #0f766e;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: .4px;
              text-transform: uppercase;
            }
            .notes { margin: 0; padding-left: 14px; }
            .notes li { margin: 2px 0; }
            .footer-brand {
              text-align: center;
              color: #6b7280;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="center">
              <div class="brand-row">
                ${receipt.store?.logo ? `<img class="logo" src="${escapeHtml(receipt.store.logo)}" alt="logo" />` : ""}
                <div class="brand-name">${escapeHtml(receipt.store?.name || "Store")}</div>
              </div>
              <div class="headline">Tax Invoice / Sales Receipt</div>
              <div class="muted">${escapeHtml(receipt.store?.address || "")}</div>
              <div class="muted">Phone: ${escapeHtml(receipt.store?.phone || "-")}</div>
              <div class="muted">Email: ${escapeHtml(receipt.store?.email || "-")}</div>
              <div class="muted">GST: ${escapeHtml(receipt.store?.gstNumber || "-")}</div>
            </div>
            <div class="sep"></div>
            <div class="meta-grid">
              <div><span class="meta-label">Invoice</span><br /><b>${escapeHtml(receipt.invoiceNo || "-")}</b></div>
              <div><span class="meta-label">Date & Time</span><br />${escapeHtml(formatDateTime(receipt.date))}</div>
              <div><span class="meta-label">Cashier</span><br />${escapeHtml(receipt.cashierName || "-")}</div>
              ${customerPrintRow}
            </div>
            <div class="muted" style="margin-top: 4px;">Sale Type: <b>${escapeHtml((receipt.saleType || "retail").toUpperCase())}</b></div>
            <div class="sep"></div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="sep"></div>
            <div class="totals">
              <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(receipt.subtotal || 0)}</span></div>
              <div class="totals-row"><span>Discount</span><span>-${formatCurrency(receipt.discountAmount || 0)}</span></div>
              <div class="totals-row"><span>Tax</span><span>${formatCurrency(receipt.taxTotal || 0)}</span></div>
              <div class="totals-row grand"><span>Grand Total</span><span>${formatCurrency(receipt.grandTotal || 0)}</span></div>
            </div>
            <div class="sep"></div>
            <div>Payment: <span class="paid-pill">${escapeHtml((receipt.paymentMethod || "").toUpperCase() || "PAID")}</span></div>
            ${receipt.paymentDetails?.cash != null ? `<div class="muted" style="margin-top:4px;">Received: ${formatCurrency(receipt.paymentDetails.cash)} | Change: ${formatCurrency(receipt.paymentDetails.change || 0)}</div>` : ""}
            <div class="sep"></div>
            <ul class="notes">${notes}</ul>
            <div class="sep"></div>
            <div class="center" style="font-weight: 700; font-size: 12px;">Thank you for shopping with us!</div>
            <div class="footer-brand" style="margin-top: 6px;">Please keep this receipt for warranty and returns.</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const sendEmail = async () => {
    const to = email.trim().toLowerCase();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      toast.error(t("receipt.invalidEmail"));
      return;
    }
    setSending(true);
    try {
      await sendReceiptEmail({
        to,
        receipt: {
          ...receipt,
          store: receipt.store || {},
          items: receipt.items || [],
        },
      });
      toast.success(t("toast.receiptPdfSent", { email: to }));
    } catch (error) {
      toast.error(error?.message || "Could not send receipt email");
    } finally {
      setSending(false);
    }
  };

  const shareWhatsApp = () => {
    const intl = normalizePakistaniPhone(phone);
    const url = buildWhatsAppUrl(receiptText, intl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareSms = () => {
    const url = buildSmsUrl(receiptText, phone);
    window.location.href = url;
  };

  const copyReceipt = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(receiptText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = receiptText;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success(t("payment.receiptCopied"));
    } catch (e) {
      toast.error(e?.message || "Could not copy receipt");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("receipt.title")}>
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-background/60 p-3 text-xs text-text-muted">
          {t("payment.thermalPreview")}
        </div>

        <div className="mx-auto max-w-[360px] rounded-2xl border border-border bg-white p-4 shadow-sm print:shadow-none print:border-0 print:p-0 print:max-w-none">
          <div className="print-receipt space-y-4 text-xs">
            <div className="text-center border-b border-dashed border-border pb-3">
              {receipt.store?.logo && (
                <div className="mb-2 flex justify-center">
                  <img
                    src={receipt.store.logo}
                    alt="Store logo"
                    className="h-10 w-10 rounded-lg border border-border object-contain"
                  />
                </div>
              )}
              <p className="text-base font-extrabold text-text-primary tracking-wide uppercase">
                Tax Invoice / Receipt
              </p>
              <p className="text-lg font-bold text-primary mt-1">
                {receipt.store?.name}
              </p>
              <p className="text-text-muted text-xs whitespace-pre-line">
                {receipt.store?.address}
              </p>
              <p className="text-xs text-text-muted">
                Phone: {receipt.store?.phone || " "}
              </p>
              <p className="text-xs text-text-muted">
                Email: {receipt.store?.email || " "}
              </p>
              <p className="text-xs text-text-muted">
                GST: {receipt.store?.gstNumber || " "}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <p className="text-text-muted">{t("receipt.invoice")}</p>
              <p className="text-right font-semibold">{receipt.invoiceNo}</p>
              <p className="text-text-muted">{t("receipt.date")}</p>
              <p className="text-right">{formatDateTime(receipt.date)}</p>
              <p className="text-text-muted">{t("receipt.cashier")}</p>
              <p className="text-right">{receipt.cashierName}</p>
              {hasReceiptCustomerName(receipt.customerName) && (
                <>
                  <p className="text-text-muted">{t("receipt.customer")}</p>
                  <p className="text-right">{receipt.customerName}</p>
                </>
              )}
              <p className="text-text-muted">Sale type</p>
              <p className="text-right capitalize">
                {receipt.saleType || "retail"}
              </p>
            </div>

            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-text-muted border-b border-dashed border-border">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(receipt.items || []).map((it, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-1 pr-2">
                      <p className="font-medium text-text-primary">{it.name}</p>
                      <p className="text-[10px] text-text-muted">
                        {Number(it.quantity) || 0} x{" "}
                        {formatCurrency(Number(it.unitPrice) || 0)}
                      </p>
                    </td>
                    <td className="py-1 text-right whitespace-nowrap font-medium">
                      {formatCurrency(Number(it.total) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-[11px] border-t border-border pt-2">
              <div className="flex justify-between">
                <span>{t("pos.subtotal")}</span>
                <span>{formatCurrency(receipt.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("pos.discount")}</span>
                <span>-{formatCurrency(receipt.discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("pos.tax")}</span>
                <span>{formatCurrency(receipt.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-primary pt-1">
                <span>{t("common.grandTotal")}</span>
                <span>{formatCurrency(receipt.grandTotal)}</span>
              </div>
            </div>

            <div className="text-[11px] border-t border-dashed border-border pt-2 space-y-1">
              <p>
                Payment:{" "}
                <span className="font-bold capitalize">
                  {receipt.paymentMethod}
                </span>
              </p>
              {receipt.paymentDetails?.cash != null && (
                <p>
                  Received: {formatCurrency(receipt.paymentDetails.cash)} ·
                  Change: {formatCurrency(receipt.paymentDetails.change || 0)}
                </p>
              )}
              {Number(receipt.udhaarAmount) > 0 && (
                <p className="text-warning font-semibold">
                  {t("payment.udhaarOnReceipt")}: {formatCurrency(receipt.udhaarAmount)}
                </p>
              )}
              {receipt.offline && (
                <p className="text-warning font-semibold">
                  Offline sale   pending cloud sync
                </p>
              )}
            </div>

            {(receipt.fbrQrUrl || receipt.fbrStatus) && (
              <div className="text-center border-t border-dashed border-border pt-3 space-y-2">
                {receipt.fbrQrUrl && (
                  <img
                    src={receipt.fbrQrUrl}
                    alt="FBR QR"
                    className="mx-auto h-24 w-24 border border-border rounded-lg"
                  />
                )}
                <p className="text-[10px] text-text-muted">
                  {fbrStatusLabel(receipt.fbrStatus || "pending", t)}
                </p>
              </div>
            )}

            <div className="text-[10px] border-t border-dashed border-border pt-2 space-y-1 text-text-muted">
              <p>
                Goods once sold will only be exchanged with original receipt.
              </p>
              <p>Please report damaged or missing items at billing counter.</p>
              <p>
                Need help? Contact{" "}
                {receipt.store?.phone || receipt.store?.email || "support desk"}
                .
              </p>
            </div>

            <p className="text-center text-xs font-semibold text-text-primary pt-1">
              {t("receipt.thanks")}
            </p>
            <p className="text-center text-[10px] text-text-muted">
              Please keep this receipt for returns and warranty.
            </p>
          </div>
        </div>

        <div className="space-y-3 print:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={print}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
            >
              <Printer className="h-4 w-4" /> {t("receipt.print")}
            </button>
            <button
              type="button"
              onClick={copyReceipt}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold"
            >
              <Copy className="h-4 w-4" /> {t("common.copy")}
            </button>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-background/60 p-3">
            <label className="text-xs text-text-muted">
              {t("payment.customerPhone")}
            </label>
            <input
              type="tel"
              inputMode="tel"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              placeholder="0300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={shareWhatsApp}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4" /> {t("common.whatsapp")}
              </button>
              <button
                type="button"
                onClick={shareSms}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-accent text-accent text-sm font-semibold"
              >
                <Smartphone className="h-4 w-4" /> {t("common.sms")}
              </button>
            </div>
            <p className="text-[10px] text-text-muted">
              Opens WhatsApp / SMS with the receipt summary pre-filled. Leave
              phone blank to pick a contact in WhatsApp.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-background/60 p-3">
            <label className="text-xs text-text-muted">
              {t("payment.customerEmail")}
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
              placeholder="customer@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
            <button
              type="button"
              onClick={sendEmail}
              disabled={sending || !email.trim()}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sending ? t("payment.sendingPdf") : t("payment.sendEmailPdf")}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-border text-sm"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
