<div align="center">

# QuickPOS

**Multi-tenant point-of-sale SaaS — marketing site + product app**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

[Repository](https://github.com/ubaid-dev-01/pos-saas) · [Author](https://github.com/ubaid-dev-01) · [Portfolio](https://ubaid-dev-01.vercel.app)

</div>

---

## Overview

QuickPOS is a monorepo: a Next.js marketing site for acquisition/SEO and a Vite + React + Firebase product app for POS operations. Tenant isolation, barcode flows, credit ledgers, bilingual surfaces, and offline queue reconciliation patterns are first-class concerns.

## Features

- Marketing site with brand system (Ledger Ink)
- POS login, sales, inventory, and admin
- Firebase Auth + Firestore data model
- Firebase Functions + email/OTP helpers
- Offline-friendly queue patterns
- Zustand domain stores
- Production schema + market docs in repo

## Architecture

```text
Public web (apps/web)  →  leads / SEO / brand
Product POS (apps/pos) →  Firebase Auth + Firestore
                       →  Cloud Functions / email API
```
Vercel Root Directory for the public site must be `apps/web`.

## Tech stack

- Next.js (`apps/web`)
- Vite + React (`apps/pos`)
- Firebase / Firestore / Functions
- Zustand
- Tailwind CSS

## Project structure

```text
POS-SAAS/
├── apps/web/     # Next.js marketing
├── apps/pos/     # Vite POS product
└── docs/
```

## Getting started

```bash
npm run install:all
cp .env.example .env.local
npm run dev:web
npm run dev:pos
```

## Environment

`VITE_FIREBASE_*`, SMTP, Firebase Admin JSON (local path or Vercel JSON/B64). `firebase-service-account.json` is gitignored.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev:web` / `dev:pos` | Local apps |
| `npm run build:web` / `build:pos` | Production builds |

## Documentation

| Doc | Purpose |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System shape, data flow, boundaries |
| [docs/SETUP.md](docs/SETUP.md) | Local install, env, runbook |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Branching, commits, PR checklist |


## Author

**M Ubaid Javaid** — Software Engineer (MERN / Next.js)

- GitHub: [https://github.com/ubaid-dev-01](https://github.com/ubaid-dev-01)
- Portfolio: [https://ubaid-dev-01.vercel.app](https://ubaid-dev-01.vercel.app)
- Email: mubaidjavaid97@gmail.com

## License

Source is published for portfolio and engineering review. Client product ownership is not implied unless stated in a case study.

