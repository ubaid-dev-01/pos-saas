/** 10 — Method fuzz + oversized query */
import { baseUrl, fail, ok } from "./_helpers.mjs";

export async function run() {
  console.log("\n[10] Method fuzz / oversized input");
  let passed = true;
  const ip = { "x-forwarded-for": "203.0.113.18", "user-agent": "NaazWears-SecurityTest/1.0" };

  for (const method of ["TRACE", "TRACK", "DEBUG"]) {
    try {
      const res = await fetch(baseUrl() + "/", { method, headers: ip, redirect: "manual" });
      if ([400, 405, 501].includes(res.status) || res.status >= 400) {
        ok(`${method} rejected`, `status ${res.status}`);
      } else {
        // Next may ignore — ensure no sensitive TRACE body
        const t = await res.text();
        if (/AUTH_SECRET|SMTP_PASS/.test(t)) {
          passed = fail(`${method} leaked secrets`) && passed;
        } else ok(`${method} no secret leak`, `status ${res.status}`);
      }
    } catch (err) {
      ok(`${method} failed at network`, String(err.message || err).slice(0, 60));
    }
  }

  const huge = "A".repeat(20_000);
  const big = await fetch(`${baseUrl()}/shop?q=${huge}`, {
    headers: ip,
    redirect: "manual",
  });
  if ([400, 414, 431].includes(big.status)) ok("oversized query blocked", `status ${big.status}`);
  else if (big.status < 500) ok("oversized query handled", `status ${big.status}`);
  else passed = fail("oversized query crashed server", `status ${big.status}`) && passed;

  return passed;
}

if (process.argv[1]?.endsWith("10-method-fuzz.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
