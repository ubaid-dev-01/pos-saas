# QuickPOS

Monorepo for the QuickPOS marketing site and product app.


## Apps

| App | Path | Stack | Purpose |
|-----|------|-------|---------|
| Marketing | [`apps/web`](apps/web) | Next.js App Router | Public site, brand, SEO, leads |
| Product | [`apps/pos`](apps/pos) | Vite + React + Firebase | Login, POS, inventory, admin |

## Brand — Ledger Ink

- Mark: geometric Q + scan line (`apps/web/public/brand/`)
- Colors: ink `#07131F`, paper `#F4F6F8`, signal `#0E7C77`
- Type: Syne (display) + IBM Plex Sans / Mono via `next/font`

## Develop

```bash
npm run install:all
npm run dev:web    # http://localhost:3000
npm run dev:pos    # Vite app
```

Marketing CTAs use `NEXT_PUBLIC_APP_URL` for `/login` and `/register`.

## Deploy (Vercel) — important

**Public website (live domain) = `apps/web` only.**

In Vercel Project Settings → General → **Root Directory** → set to:

```text
apps/web
```

Framework Preset: **Next.js**

| What | Vercel Root Directory |
|------|------------------------|
| Marketing site (main URL) | `apps/web` |
| POS / login / register app | `apps/pos` (separate project or `app.` subdomain) |

Env on `apps/web`:
- `NEXT_PUBLIC_SITE_URL` = your marketing URL
- `NEXT_PUBLIC_APP_URL` = your POS URL (where `/login` and `/register` live)

## Scripts

- `npm run build` — production build for marketing (`apps/web`)
- `npm run build:pos` — production build for the Vite POS app
