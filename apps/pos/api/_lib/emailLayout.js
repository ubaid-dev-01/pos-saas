/** Shared QuickPOS transactional email chrome (ink + signal teal). */

export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const APP_URL =
  process.env.PUBLIC_APP_URL ||
  process.env.VITE_APP_URL ||
  "https://pos-saas-kappa.vercel.app";

/**
 * @param {{ title: string, preheader?: string, bodyHtml: string, cta?: { label: string, href: string } }} opts
 */
export function wrapEmailLayout({ title, preheader = "", bodyHtml, cta }) {
  const safeTitle = esc(title);
  const safePre = esc(preheader);
  const ctaBlock = cta?.href
    ? `<p style="margin:28px 0 0;">
        <a href="${esc(cta.href)}" style="display:inline-block;background:#07131f;color:#f4f6f8;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:6px;">
          ${esc(cta.label || "Open QuickPOS")}
        </a>
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${safeTitle}</title>
  ${safePre ? `<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;">${safePre}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(7,19,31,0.12);border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#07131f;padding:22px 28px;">
              <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#0e7c77;font-weight:600;">QuickPOS</div>
              <div style="margin-top:8px;font-size:20px;font-weight:700;color:#f4f6f8;letter-spacing:-0.02em;">${safeTitle}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;color:#07131f;font-size:15px;line-height:1.6;">
              ${bodyHtml}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 22px;border-top:1px solid rgba(7,19,31,0.08);background:#f8fafb;">
              <p style="margin:0;font-size:12px;color:#5b6775;line-height:1.5;">
                Cloud POS for Pakistan retail · checkout, stock, customers, reports.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">
                <a href="${esc(APP_URL)}" style="color:#0e7c77;text-decoration:none;">Open QuickPOS</a>
                · This is an automated message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function appUrl(path = "") {
  const base = APP_URL.replace(/\/$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
