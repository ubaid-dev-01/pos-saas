# Security tests — Naaz Wears (PRO / red-team)

Think like an attacker. These scripts probe WAF, auth, Convex API abuse, business logic, recon, and rate limits.

```bash
# terminal 1 — your real app
npm run dev

# terminal 2 — against Next
npm run security:test

# OR without Next (WAF harness — always works)
npm run security:test:harness

# After deploying Convex guards, also hit live API:
CONVEX_LIVE=1 npm run security:test:harness
```

| Variable | Default | Meaning |
|----------|---------|---------|
| `BASE_URL` | `http://localhost:3001` | Next app |
| `CONVEX_URL` / `.env.local` | — | Live Convex API abuse tests |

## Scripts

| File | Attacker scenario |
|------|-------------------|
| `00-unit-core.mjs` | Offline rate-limit + detector engine |
| `01-rate-limit.mjs` | Burst >100 req/min → 15m IP ban |
| `02-xss-injection.mjs` | Classic XSS in query |
| `03-path-traversal.mjs` | `../` / encoded traversal |
| `04-header-injection.mjs` | CRLF / header smuggling |
| `05-sqli-cmd-injection.mjs` | SQLi, shell, `.env`, pollution |
| `06-auth-surfaces.mjs` | Admin lock + open redirect |
| `07-order-idor.mjs` | Guess order / receipt without token |
| `08-secrets-exposure.mjs` | Secrets in HTML / `.env` web leak |
| `09-security-headers.mjs` | CSP, nosniff, frame-deny |
| `10-method-fuzz.mjs` | TRACE/DEBUG + oversized query |
| `11-pro-redteam.mjs` | **Elite pack:** open-redirect bypasses, Convex anon dumps, COD spoof, cart IDOR, recon, polyglot XSS, clickjacking, static seed audit |
| `run-all.mjs` | Full battery (rate-limit last) |

Exit `0` = all green.
