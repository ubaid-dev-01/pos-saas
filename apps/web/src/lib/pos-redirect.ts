/**
 * Production POS (Vite) origin. Returns null if unset / same as marketing / placeholder.
 */
export function getPosOrigin(): string | null {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const app = (process.env.NEXT_PUBLIC_APP_URL || "")
    .trim()
    .replace(/\/$/, "");

  if (!app) return null;
  if (/YOUR-POS|example\.com/i.test(app)) return null;
  if (site && app === site) return null;
  if (process.env.VERCEL && /localhost|127\.0\.0\.1/.test(app)) return null;

  return app;
}
