#!/usr/bin/env node
/**
 * Full security battery — unit → HTTP WAF → red-team → rate-limit last.
 *
 *   BASE_URL=http://localhost:3001 npm run security:test
 */
import { baseUrl } from "./_helpers.mjs";

const suites = [
  "./00-unit-core.mjs",
  "./02-xss-injection.mjs",
  "./03-path-traversal.mjs",
  "./04-header-injection.mjs",
  "./05-sqli-cmd-injection.mjs",
  "./06-auth-surfaces.mjs",
  "./07-order-idor.mjs",
  "./08-secrets-exposure.mjs",
  "./09-security-headers.mjs",
  "./10-method-fuzz.mjs",
  "./11-pro-redteam.mjs",
  "./01-rate-limit.mjs",
];

console.log(`Naaz Wears PRO security battery → ${baseUrl()}`);
console.log("Make sure the app is running (npm run dev).\n");

try {
  const res = await fetch(baseUrl() + "/", {
    headers: { "x-forwarded-for": "203.0.113.1", "user-agent": "NaazWears-SecurityTest/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  console.log(`Server reachable (HTTP ${res.status})\n`);
} catch (err) {
  console.error(`Cannot reach ${baseUrl()}: ${err.message || err}`);
  console.error("Start the app first: npm run dev");
  process.exit(2);
}

let failed = 0;
for (const mod of suites) {
  if (mod.endsWith("11-pro-redteam.mjs")) {
    const m = await import(mod);
    const fns = [
      m.runOpenRedirect,
      m.runConvexApi,
      m.runBusinessLogic,
      m.runCartSession,
      m.runRecon,
      m.runAdvancedXss,
      m.runAuthSurface,
      m.runStaticAudit,
    ];
    for (const fn of fns) {
      if (!(await fn())) failed += 1;
    }
    continue;
  }
  const { run } = await import(mod);
  const pass = await run();
  if (!pass) failed += 1;
}

console.log("\n────────────────────────────");
if (failed === 0) {
  console.log("ALL SECURITY TESTS PASSED (PRO BATTERY)");
  process.exit(0);
}
console.error(`${failed} suite(s) FAILED`);
process.exit(1);
