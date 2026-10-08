# Architecture — QuickPOS

## Intent

QuickPOS is a monorepo: a Next.js marketing site for acquisition/SEO and a Vite + React + Firebase product app for POS operations. Tenant isolation, barcode flows, credit ledgers, bilingual surfaces, and offline queue reconciliation patterns are first-class concerns.

## System shape

```text
Public web (apps/web)  →  leads / SEO / brand
Product POS (apps/pos) →  Firebase Auth + Firestore
                       →  Cloud Functions / email API
```
Vercel Root Directory for the public site must be `apps/web`.

## Stack decisions

- Next.js (`apps/web`)
- Vite + React (`apps/pos`)
- Firebase / Firestore / Functions
- Zustand
- Tailwind CSS

## Boundaries

- Secrets stay in environment variables / secret managers — never in git.
- Client bundles only receive public configuration (`NEXT_PUBLIC_*` / `VITE_*`).
- Tenant or role checks belong in middleware / server layers, not UI-only gates.
- Heavy or long-running work should not run inside short-lived serverless handlers unless designed for it.

## Quality bar

- Prefer typed contracts at API and domain boundaries.
- Ship a vertical slice (auth → persisted outcome) before a broad feature surface.
- Document trade-offs in PRs when changing data models or auth.

