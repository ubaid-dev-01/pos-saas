import { appUrl, esc, wrapEmailLayout } from "./emailLayout.js";

export function buildOtpEmailHtml({ otp, purpose, minutes = 10 }) {
  const isRegister = purpose === "register";
  const title = isRegister ? "Verify your email" : "Reset your password";
  const intro = isRegister
    ? "Enter this code to finish creating your QuickPOS account. Fake or unreachable inboxes cannot complete signup."
    : "Enter this code to set a new password for your QuickPOS account.";

  return wrapEmailLayout({
    title,
    preheader: `Your QuickPOS code is ${otp}`,
    bodyHtml: `
      <p style="margin:0 0 16px;color:#5b6775;">${intro}</p>
      <div style="text-align:center;margin:24px 0;">
        <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#5b6775;margin-bottom:10px;">One-time code</div>
        <div style="display:inline-block;font-family:ui-monospace,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:0.28em;color:#07131f;background:#e4f2f1;border:1px solid rgba(14,124,119,0.35);border-radius:8px;padding:14px 22px;">
          ${esc(otp)}
        </div>
      </div>
      <p style="margin:0;font-size:13px;color:#5b6775;">
        Expires in <strong style="color:#07131f;">${minutes} minutes</strong>. Do not share this code.
      </p>
      <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">
        If you did not request this, you can ignore this email.
      </p>
    `,
  });
}

export function buildWelcomeEmailHtml({ ownerName, storeName }) {
  const name = esc(ownerName || "there");
  const store = esc(storeName || "your store");

  return wrapEmailLayout({
    title: "Welcome to QuickPOS",
    preheader: `${storeName || "Your store"} is ready`,
    cta: { label: "Open your POS", href: appUrl("/login") },
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi <strong>${name}</strong>,</p>
      <p style="margin:0 0 14px;color:#5b6775;">
        <strong style="color:#07131f;">${store}</strong> is live on QuickPOS.
        You can start selling, tracking stock, and sending receipts from one counter system.
      </p>
      <ul style="margin:0;padding-left:18px;color:#5b6775;">
        <li style="margin-bottom:6px;">Add products and set low-stock thresholds</li>
        <li style="margin-bottom:6px;">Run checkout with barcode, hold cart, and split pay</li>
        <li>Watch reports the same day</li>
      </ul>
      <p style="margin:16px 0 0;font-size:13px;color:#5b6775;">
        Need help? Reply to this email or WhatsApp our team from the contact page.
      </p>
    `,
  });
}

export function buildPasswordChangedHtml() {
  return wrapEmailLayout({
    title: "Password updated",
    preheader: "Your QuickPOS password was changed",
    bodyHtml: `
      <p style="margin:0 0 14px;color:#5b6775;">
        Your QuickPOS password was changed successfully.
      </p>
      <p style="margin:0;font-size:13px;color:#5b6775;">
        If this wasn’t you, reset your password again immediately and contact support.
      </p>
    `,
  });
}

export function buildLoginThankYouHtml({ userName, storeName, loginTime }) {
  const name = esc(userName || "there");
  const store = esc(storeName || "your store");
  const when = esc(loginTime || new Date().toLocaleString("en-PK"));

  return wrapEmailLayout({
    title: "Signed in successfully",
    preheader: `Login to ${storeName || "QuickPOS"}`,
    cta: { label: "Open dashboard", href: appUrl("/pos") },
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi <strong>${name}</strong>,</p>
      <p style="margin:0 0 14px;color:#5b6775;">
        Thanks for signing in to QuickPOS for <strong style="color:#07131f;">${store}</strong>.
      </p>
      <div style="background:#f4f6f8;border:1px solid rgba(7,19,31,0.1);border-radius:6px;padding:14px 16px;margin:16px 0;">
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5b6775;">Signed in at</div>
        <div style="margin-top:4px;font-family:ui-monospace,Consolas,monospace;font-size:14px;font-weight:600;color:#07131f;">${when}</div>
      </div>
      <p style="margin:0;font-size:13px;color:#5b6775;">
        If this wasn’t you, change your password and notify your store admin.
      </p>
    `,
  });
}

export function buildExpiryAlertHtml({ storeName, items = [] }) {
  const store = esc(storeName || "Your store");
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(7,19,31,0.08);">
          <strong style="color:#07131f;">${esc(item.productName)}</strong>
          <div style="font-size:12px;color:#5b6775;margin-top:4px;">${esc(item.message)}</div>
        </td>
        <td align="right" style="padding:10px 12px;border-bottom:1px solid rgba(7,19,31,0.08);white-space:nowrap;font-weight:700;color:${
          item.level === "danger" ? "#b91c1c" : "#b45309"
        };">
          ${esc(item.title)}
        </td>
      </tr>`,
    )
    .join("");

  return wrapEmailLayout({
    title: "Product expiry alert",
    preheader: `Expiry attention needed at ${storeName || "your store"}`,
    cta: { label: "Review inventory", href: appUrl("/inventory") },
    bodyHtml: `
      <p style="margin:0 0 16px;color:#5b6775;">
        These products at <strong style="color:#07131f;">${store}</strong> are expired or close to expiry:
      </p>
      <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(7,19,31,0.1);border-radius:6px;overflow:hidden;">
        <thead>
          <tr style="background:#f4f6f8;">
            <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5b6775;">Product</th>
            <th align="right" style="padding:10px 12px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5b6775;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `,
  });
}

export function buildLowStockAlertHtml({ storeName, items = [], outOfStock = 0 }) {
  const store = esc(storeName || "Your store");
  const rows = items
    .slice(0, 20)
    .map((item) => {
      const stock = Number(item.stock) || 0;
      const label = stock <= 0 ? "Out of stock" : `${stock} left`;
      const color = stock <= 0 ? "#b91c1c" : "#b45309";
      return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(7,19,31,0.08);">
          <strong style="color:#07131f;">${esc(item.productName)}</strong>
          ${
            item.sku
              ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;font-family:ui-monospace,Consolas,monospace;">${esc(item.sku)}</div>`
              : ""
          }
        </td>
        <td align="right" style="padding:10px 12px;border-bottom:1px solid rgba(7,19,31,0.08);font-weight:700;color:${color};white-space:nowrap;">
          ${esc(label)}
        </td>
      </tr>`;
    })
    .join("");

  const summary =
    outOfStock > 0
      ? `<p style="margin:0 0 12px;font-size:13px;color:#b91c1c;"><strong>${outOfStock}</strong> item(s) are completely out of stock.</p>`
      : "";

  return wrapEmailLayout({
    title: outOfStock > 0 ? "Stock-out alert" : "Low stock alert",
    preheader: `Inventory attention at ${storeName || "your store"}`,
    cta: { label: "Restock in POS", href: appUrl("/products") },
    bodyHtml: `
      <p style="margin:0 0 12px;color:#5b6775;">
        Stock needs attention at <strong style="color:#07131f;">${store}</strong>:
      </p>
      ${summary}
      <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(7,19,31,0.1);border-radius:6px;overflow:hidden;">
        <thead>
          <tr style="background:#f4f6f8;">
            <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5b6775;">Product</th>
            <th align="right" style="padding:10px 12px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5b6775;">Qty</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin:14px 0 0;font-size:13px;color:#5b6775;">
        Set thresholds on each product so QuickPOS can warn you before the shelf goes empty.
      </p>
    `,
  });
}
