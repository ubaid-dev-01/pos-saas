/** 08 — Secrets must not appear in public HTML/JS bundles */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { baseUrl, fail, ok } from "./_helpers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SECRET_PATTERNS = [
  /adminubaidpass/i,
  /ADMIN_PASSWORD\s*[:=]\s*["'][^"']{8,}/,
  /SMTP_PASS\s*[:=]\s*["'][^"']+/,
  /CLOUDINARY_API_SECRET\s*[:=]\s*["'][^"']+/,
  /AUTH_SECRET\s*[:=]\s*["'][^"']+/,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
  /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/i,
  /postgres(ql)?:\/\/[^:]+:[^@]+@/i,
];

export async function run() {
  console.log("\n[08] Secrets exposure");
  let passed = true;

  const home = await fetch(baseUrl() + "/", {
    headers: { "x-forwarded-for": "203.0.113.16", "user-agent": "NaazWears-SecurityTest/1.0" },
  });
  const html = await home.text();
  for (const re of SECRET_PATTERNS) {
    if (re.test(html)) {
      passed = fail("secret pattern in homepage HTML", re.toString()) && passed;
    }
  }
  if (passed) ok("homepage HTML has no known secret patterns");

  // Source scan (client-reachable files)
  const clientFiles = [
    "lib/validation.ts",
    "lib/env.ts",
    "convex/seedAdmin.ts",
    "app/layout.tsx",
    "middleware.ts",
  ];
  for (const rel of clientFiles) {
    const p = resolve(root, rel);
    if (!existsSync(p)) continue;
    const src = readFileSync(p, "utf8");
    if (/adminubaidpass/.test(src)) {
      passed = fail(`hardcoded password still in ${rel}`) && passed;
    }
    if (rel === "convex/seedAdmin.ts" && /const ADMIN_PASSWORD\s*=\s*["']/.test(src)) {
      passed = fail(`hardcoded ADMIN_PASSWORD in ${rel}`) && passed;
    }
  }
  ok("seedAdmin has no hardcoded password constant");

  // .env.local should not be web-reachable
  const envHit = await fetch(baseUrl() + "/.env.local", {
    headers: { "x-forwarded-for": "203.0.113.16", "user-agent": "NaazWears-SecurityTest/1.0" },
    redirect: "manual",
  });
  if ([400, 404, 403].includes(envHit.status)) ok(".env.local not publicly served", `status ${envHit.status}`);
  else {
    const t = await envHit.text();
    if (/AUTH_SECRET|SMTP_PASS|ADMIN_PASSWORD/.test(t)) {
      passed = fail(".env.local contents exposed!") && passed;
    } else {
      ok(".env.local response has no secrets", `status ${envHit.status}`);
    }
  }

  return passed;
}

if (process.argv[1]?.endsWith("08-secrets-exposure.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
