import PDFDocument from "pdfkit";
import { sendMail } from "./mailer.js";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(amount) {
  const n = Number(amount) || 0;
  return `Rs ${n.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDisplayDate(value) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

function receiptCustomerName(name) {
  const trimmed = String(name ?? "").trim();
  return trimmed || null;
}

function normalizeItems(items = []) {
  return items.map((item) => ({
    name: String(item?.name || "Item"),
    quantity: Number(item?.quantity) || 0,
    unitPrice: Number(item?.unitPrice) || 0,
    total: Number(item?.total) || 0,
    taxAmount: Number(item?.taxAmount) || 0,
  }));
}

export function buildReceiptEmailHtml(receipt = {}) {
  const store = receipt.store || {};
  const items = normalizeItems(receipt.items);
  const invoiceNo = esc(receipt.invoiceNo || "-");
  const storeName = esc(store.name || "QuickPOS Store");
  const paymentLabel = esc(
    String(receipt.paymentMethod || "paid").toUpperCase(),
  );
  const customerName = receiptCustomerName(receipt.customerName);
  const customerMetaHtml = customerName
    ? `<tr>
            <td width="50%" valign="top" style="padding-right:12px;">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Customer</div>
              <div style="font-size:15px;font-weight:700;margin-top:6px;">${esc(customerName)}</div>
            </td>
            <td width="50%" valign="top" style="padding-left:12px;">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Date & time</div>
              <div style="font-size:15px;font-weight:700;margin-top:6px;">${esc(formatDisplayDate(receipt.date))}</div>
            </td>
          </tr>`
    : `<tr>
            <td colspan="2">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Date & time</div>
              <div style="font-size:15px;font-weight:700;margin-top:6px;">${esc(formatDisplayDate(receipt.date))}</div>
            </td>
          </tr>`;

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 14px;border-bottom:1px solid #e8efed;">
          <div style="font-weight:600;color:#0f172a;font-size:14px;">${esc(item.name)}</div>
          <div style="color:#64748b;font-size:12px;margin-top:4px;">
            ${item.quantity} × ${money(item.unitPrice)}
          </div>
        </td>
        <td align="right" style="padding:12px 14px;border-bottom:1px solid #e8efed;font-weight:700;color:#0f4b46;white-space:nowrap;">
          ${money(item.total)}
        </td>
      </tr>`,
    )
    .join("");

  const udhaarBlock =
    Number(receipt.udhaarAmount) > 0
      ? `<tr><td style="padding:8px 0;color:#b45309;">Udhaar (credit)</td><td align="right" style="padding:8px 0;color:#b45309;font-weight:700;">${money(receipt.udhaarAmount)}</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt ${invoiceNo}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#eef5f3;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;">
    <tr>
      <td style="border-radius:20px 20px 0 0;background:linear-gradient(135deg,#0f4b46 0%,#14b8a6 100%);padding:28px 32px;color:#ffffff;">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.85;">QuickPOS Receipt</div>
              <div style="font-size:26px;font-weight:800;margin-top:8px;line-height:1.2;">${storeName}</div>
              <div style="font-size:13px;margin-top:10px;opacity:0.92;">Tax invoice / sales receipt</div>
            </td>
            <td align="right" valign="top">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:12px;padding:10px 14px;text-align:right;">
                <div style="font-size:11px;opacity:0.85;">Invoice</div>
                <div style="font-size:18px;font-weight:800;margin-top:4px;">${invoiceNo}</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;padding:28px 32px;border-left:1px solid #dbe7e4;border-right:1px solid #dbe7e4;">
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;">
          ${customerMetaHtml}
          <tr>
            <td colspan="2" style="padding-top:14px;">
              <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Cashier</div>
              <div style="font-size:14px;font-weight:600;margin-top:6px;">${esc(receipt.cashierName || "-")}</div>
            </td>
          </tr>
        </table>

        <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2ece9;border-radius:14px;overflow:hidden;margin-bottom:22px;">
          <thead>
            <tr style="background:#f8fbfa;">
              <th align="left" style="padding:12px 14px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Item</th>
              <th align="right" style="padding:12px 14px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="2" style="padding:16px;color:#64748b;">No line items</td></tr>`}</tbody>
        </table>

        <table width="100%" cellspacing="0" cellpadding="0" style="background:#f8fbfa;border:1px solid #e2ece9;border-radius:14px;padding:4px 18px;">
          <tr><td style="padding:10px 0;color:#64748b;">Subtotal</td><td align="right" style="padding:10px 0;font-weight:600;">${money(receipt.subtotal)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Discount</td><td align="right" style="padding:8px 0;font-weight:600;color:#dc2626;">-${money(receipt.discountAmount)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Tax</td><td align="right" style="padding:8px 0;font-weight:600;">${money(receipt.taxTotal)}</td></tr>
          ${udhaarBlock}
          <tr>
            <td style="padding:14px 0 10px;font-size:16px;font-weight:800;color:#0f4b46;">Grand total</td>
            <td align="right" style="padding:14px 0 10px;font-size:22px;font-weight:800;color:#0f4b46;">${money(receipt.grandTotal)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-bottom:12px;">
              <span style="display:inline-block;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700;">
                Payment: ${paymentLabel}
              </span>
            </td>
          </tr>
        </table>

        <p style="margin:20px 0 0;font-size:13px;color:#475569;line-height:1.6;">
          Your detailed receipt is attached as a <strong>PDF</strong>. Please keep it for returns, warranty, and tax records.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fbfa;border:1px solid #dbe7e4;border-top:0;border-radius:0 0 20px 20px;padding:22px 32px;">
        ${store.address ? `<div style="font-size:13px;color:#475569;margin-bottom:6px;"><strong>Address:</strong> ${esc(store.address)}</div>` : ""}
        ${store.phone ? `<div style="font-size:13px;color:#475569;margin-bottom:6px;"><strong>Phone:</strong> ${esc(store.phone)}</div>` : ""}
        ${store.email ? `<div style="font-size:13px;color:#475569;margin-bottom:6px;"><strong>Email:</strong> ${esc(store.email)}</div>` : ""}
        ${store.gstNumber ? `<div style="font-size:13px;color:#475569;margin-bottom:6px;"><strong>GST:</strong> ${esc(store.gstNumber)}</div>` : ""}
        <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #cbd5e1;font-size:12px;color:#94a3b8;text-align:center;">
          Powered by <strong style="color:#0f4b46;">QuickPOS</strong> · Thank you for shopping with us
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildReceiptPlainText(receipt = {}) {
  const items = normalizeItems(receipt.items);
  return [
    receipt.store?.name || "QuickPOS",
    `Invoice: ${receipt.invoiceNo || "-"}`,
    `Date: ${formatDisplayDate(receipt.date)}`,
    ...(receiptCustomerName(receipt.customerName)
      ? [`Customer: ${receiptCustomerName(receipt.customerName)}`]
      : []),
    `Cashier: ${receipt.cashierName || "-"}`,
    "",
    ...items.map(
      (i) =>
        `- ${i.name} (${i.quantity} x ${money(i.unitPrice)}) = ${money(i.total)}`,
    ),
    "",
    `Subtotal: ${money(receipt.subtotal)}`,
    `Discount: -${money(receipt.discountAmount)}`,
    `Tax: ${money(receipt.taxTotal)}`,
    `Grand Total: ${money(receipt.grandTotal)}`,
    `Payment: ${String(receipt.paymentMethod || "").toUpperCase()}`,
    "",
    "PDF receipt attached.",
  ].join("\n");
}

function drawPdfTotalRow(doc, y, label, value, opts = {}) {
  const {
    margin,
    contentW,
    muted,
    primary,
    bold = false,
    large = false,
    valueColor = "#0F172A",
  } = opts;
  const labelSize = large ? 12 : 10;
  const valueSize = large ? 16 : 10;
  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(labelSize).fillColor(muted);
  doc.text(label, margin + 16, y, { width: contentW * 0.55 });
  doc
    .font(bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(valueSize)
    .fillColor(bold ? primary : valueColor);
  doc.text(value, margin + 16, y, {
    width: contentW - 32,
    align: "right",
  });
  return y + (large ? 28 : 20);
}

export async function buildReceiptPdf(receipt = {}) {
  const store = receipt.store || {};
  const items = normalizeItems(receipt.items);

  return new Promise((resolve, reject) => {
    const margin = 44;
    const pageW = 595.28;
    const contentW = pageW - margin * 2;
    const primary = "#0F4B46";
    const accent = "#2A9D8F";
    const muted = "#64748B";
    const border = "#E2ECE9";
    const panelBg = "#F8FBFA";
    const textDark = "#0F172A";

    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = margin;

    const headerH = 98;
    const grad = doc.linearGradient(margin, y, margin + contentW, y + headerH);
    grad.stop(0, primary).stop(1, accent);
    doc.rect(margin, y, contentW, headerH).fill(grad);

    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(8);
    doc.text("QUICKPOS RECEIPT", margin + 18, y + 16, { characterSpacing: 1.5 });
    doc.font("Helvetica-Bold").fontSize(21);
    doc.text(store.name || "QuickPOS Store", margin + 18, y + 30, {
      width: contentW - 140,
    });
    doc.font("Helvetica").fontSize(9);
    doc.text("Tax invoice / sales receipt", margin + 18, y + 58);

    const invBoxW = 108;
    const invBoxX = margin + contentW - invBoxW - 14;
    doc.save();
    doc.fillColor("#FFFFFF").fillOpacity(0.2);
    doc.rect(invBoxX, y + 18, invBoxW, 54).fill();
    doc.restore();
    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(8);
    doc.text("INVOICE NO.", invBoxX + 10, y + 26);
    doc.font("Helvetica-Bold").fontSize(13);
    doc.text(String(receipt.invoiceNo || "-"), invBoxX + 10, y + 40, {
      width: invBoxW - 16,
    });

    y += headerH + 22;

    const customerName = receiptCustomerName(receipt.customerName);
    const metaColW = (contentW - 14) / 2;
    const metaH = 54;
    if (customerName) {
      doc.rect(margin, y, metaColW, metaH).strokeColor(border).lineWidth(1).stroke();
      doc.rect(margin + metaColW + 14, y, metaColW, metaH).stroke();
      doc.font("Helvetica").fontSize(8).fillColor(muted);
      doc.text("CUSTOMER", margin + 12, y + 10);
      doc.text("DATE & TIME", margin + metaColW + 26, y + 10);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(textDark);
      doc.text(customerName, margin + 12, y + 24, { width: metaColW - 20 });
      doc.text(formatDisplayDate(receipt.date), margin + metaColW + 26, y + 24, {
        width: metaColW - 20,
      });
    } else {
      doc.rect(margin, y, contentW, metaH).strokeColor(border).lineWidth(1).stroke();
      doc.font("Helvetica").fontSize(8).fillColor(muted);
      doc.text("DATE & TIME", margin + 12, y + 10);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(textDark);
      doc.text(formatDisplayDate(receipt.date), margin + 12, y + 24, {
        width: contentW - 24,
      });
    }
    doc.font("Helvetica").fontSize(8).fillColor(muted);
    doc.text("CASHIER", margin + 12, y + metaH + 12);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(textDark);
    doc.text(String(receipt.cashierName || "-"), margin + 12, y + metaH + 24);
    if (store.gstNumber) {
      doc.font("Helvetica").fontSize(8).fillColor(muted);
      doc.text("GST / NTN", margin + metaColW + 26, y + metaH + 12);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(textDark);
      doc.text(String(store.gstNumber), margin + metaColW + 26, y + metaH + 24, {
        width: metaColW - 20,
      });
    }

    y += metaH + 44;

    const tableHeaderH = 28;
    doc.rect(margin, y, contentW, tableHeaderH).fill(panelBg);
    doc.rect(margin, y, contentW, tableHeaderH).strokeColor(border).lineWidth(1).stroke();
    doc.font("Helvetica-Bold").fontSize(8).fillColor(muted);
    doc.text("ITEM", margin + 14, y + 9);
    doc.text("QTY", margin + contentW * 0.52, y + 9);
    doc.text("UNIT PRICE", margin + contentW * 0.62, y + 9);
    doc.text("AMOUNT", margin + 14, y + 9, { width: contentW - 28, align: "right" });
    y += tableHeaderH;

    const rowH = 42;
    if (!items.length) {
      doc.rect(margin, y, contentW, 32).strokeColor(border).stroke();
      doc.font("Helvetica").fontSize(10).fillColor(muted);
      doc.text("No line items", margin + 14, y + 10);
      y += 32;
    } else {
      items.forEach((item, index) => {
        const h = rowH;
        if (y + h > 760) {
          doc.addPage();
          y = margin;
        }
        if (index % 2 === 0) {
          doc.rect(margin, y, contentW, h).fill("#FFFFFF");
        } else {
          doc.rect(margin, y, contentW, h).fill(panelBg);
        }
        doc.moveTo(margin, y + h).lineTo(margin + contentW, y + h).strokeColor(border).lineWidth(0.5).stroke();

        doc.font("Helvetica-Bold").fontSize(10).fillColor(textDark);
        doc.text(item.name, margin + 14, y + 8, { width: contentW * 0.48 });
        doc.font("Helvetica").fontSize(9).fillColor(muted);
        doc.text(String(item.quantity), margin + contentW * 0.52, y + 10, {
          width: 36,
        });
        doc.text(money(item.unitPrice), margin + contentW * 0.62, y + 10, {
          width: 70,
        });
        doc.font("Helvetica-Bold").fontSize(10).fillColor(primary);
        doc.text(money(item.total), margin + 14, y + 8, {
          width: contentW - 28,
          align: "right",
        });
        y += h;
      });
    }
    doc.rect(margin, y, contentW, 1).fill(border);
    y += 18;

    const totalsH = Number(receipt.udhaarAmount) > 0 ? 168 : 148;
    if (y + totalsH > 780) {
      doc.addPage();
      y = margin;
    }
    doc.rect(margin, y, contentW, totalsH).fill(panelBg);
    doc.rect(margin, y, contentW, totalsH).strokeColor(border).lineWidth(1).stroke();

    let ty = y + 14;
    ty = drawPdfTotalRow(doc, ty, "Subtotal", money(receipt.subtotal), {
      margin,
      contentW,
      muted,
      primary,
    });
    ty = drawPdfTotalRow(doc, ty, "Discount", `-${money(receipt.discountAmount)}`, {
      margin,
      contentW,
      muted,
      primary,
      valueColor: "#DC2626",
    });
    ty = drawPdfTotalRow(doc, ty, "Tax", money(receipt.taxTotal), {
      margin,
      contentW,
      muted,
      primary,
    });
    if (Number(receipt.udhaarAmount) > 0) {
      ty = drawPdfTotalRow(doc, ty, "Udhaar (credit)", money(receipt.udhaarAmount), {
        margin,
        contentW,
        muted,
        primary,
        valueColor: "#B45309",
      });
    }
    doc
      .moveTo(margin + 14, ty)
      .lineTo(margin + contentW - 14, ty)
      .strokeColor(border)
      .stroke();
    ty += 10;
    ty = drawPdfTotalRow(doc, ty, "Grand total", money(receipt.grandTotal), {
      margin,
      contentW,
      muted,
      primary,
      bold: true,
      large: true,
    });

    const payLabel = String(receipt.paymentMethod || "paid").toUpperCase();
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#047857");
    doc.text(`PAYMENT: ${payLabel}`, margin + 16, ty + 4, {
      width: contentW - 32,
    });

    y += totalsH + 22;

    const footerLines = [];
    if (store.address) footerLines.push(`Address: ${store.address}`);
    if (store.phone) footerLines.push(`Phone: ${store.phone}`);
    if (store.email) footerLines.push(`Email: ${store.email}`);

    if (footerLines.length) {
      doc.font("Helvetica").fontSize(9).fillColor(muted);
      footerLines.forEach((line) => {
        doc.text(line, margin, y, { width: contentW });
        y += 14;
      });
      y += 6;
    }

    doc
      .moveTo(margin, y)
      .lineTo(margin + contentW, y)
      .dash(3, { space: 3 })
      .strokeColor(border)
      .stroke()
      .undash();
    y += 14;

    doc.font("Helvetica").fontSize(10).fillColor(textDark);
    doc.text("Thank you for shopping with us.", margin, y, {
      width: contentW,
      align: "center",
    });
    y += 16;
    doc.font("Helvetica").fontSize(8).fillColor(muted);
    doc.text("Powered by QuickPOS · Keep this receipt for returns & tax records", margin, y, {
      width: contentW,
      align: "center",
    });

    doc.end();
  });
}

export async function sendReceiptPdfEmail({ to, receipt }) {
  const pdf = await buildReceiptPdf(receipt);
  const storeName = receipt.store?.name || "QuickPOS";

  await sendMail({
    to,
    subject: `Your receipt ${receipt.invoiceNo || ""} · ${storeName}`,
    text: buildReceiptPlainText(receipt),
    html: buildReceiptEmailHtml(receipt),
    attachments: [
      {
        filename: `QuickPOS-Receipt-${receipt.invoiceNo || "invoice"}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });
}
