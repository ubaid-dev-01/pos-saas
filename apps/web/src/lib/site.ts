export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://pos-saas-kappa.vercel.app";

/** Vite POS app origin (login / register / dashboard). Must differ from SITE_URL in production. */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

export const CONTACT = {
  phoneDisplay: "+92 325 6482932",
  phoneLink: "tel:+923256482932",
  whatsappLink:
    "https://wa.me/923256482932?text=Hi%20QuickPOS%2C%20I%27m%20interested%20in%20your%20Premium%20plan",
  whatsappGeneric:
    "https://wa.me/923256482932?text=Hi%20QuickPOS%2C%20I%20have%20a%20question",
  whatsappDemo:
    "https://wa.me/923256482932?text=Hi%20QuickPOS%2C%20I%20want%20to%20request%20a%20demo",
  email: "mubaidjavaid97@gmail.com",
  office: "Multan, Pakistan",
  hours: "Mon–Sat, 9:00 AM – 8:00 PM (PKT)",
} as const;

export const NAV = [
  { href: "/features", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Auth CTAs stay on this marketing origin (`/login`, `/register`) so the browser
 * never opens a new tab to an absolute URL. Those routes server-redirect to POS.
 */
export function appPath(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p;
}
