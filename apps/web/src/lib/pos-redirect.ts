import { APP_URL, SITE_URL } from "@/lib/site";

/**
 * POS (Vite) origin for /login and /register redirects.
 * Uses NEXT_PUBLIC_APP_URL (falls back to localhost:5173 locally via APP_URL).
 * Returns null if unset / same as marketing / placeholder / localhost on Vercel.
 */
export function getPosOrigin(): string | null {
  const site = SITE_URL.trim().replace(/\/$/, "");
  const app = APP_URL.trim().replace(/\/$/, "");

  if (!app) return null;
  if (/YOUR-POS|example\.com/i.test(app)) return null;
  if (site && app === site) return null;
  if (process.env.VERCEL && /localhost|127\.0\.0\.1/.test(app)) return null;

  return app;
}
