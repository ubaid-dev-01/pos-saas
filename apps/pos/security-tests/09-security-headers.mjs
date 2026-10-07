/** 09 — Security response headers */
import { fail, ok } from "./_helpers.mjs";
import { baseUrl } from "./_helpers.mjs";

const REQUIRED = [
  ["x-content-type-options", /nosniff/i],
  ["x-frame-options", /deny|sameorigin/i],
  ["referrer-policy", /.+/],
  ["content-security-policy", /default-src/i],
];

export async function run() {
  console.log("\n[09] Security headers");
  let passed = true;
  const res = await fetch(baseUrl() + "/", {
    headers: { "x-forwarded-for": "203.0.113.17", "user-agent": "NaazWears-SecurityTest/1.0" },
  });

  for (const [name, re] of REQUIRED) {
    const val = res.headers.get(name);
    if (val && re.test(val)) ok(name, val.slice(0, 80));
    else passed = fail(`missing/weak header ${name}`, val ?? "(absent)") && passed;
  }

  const csp = res.headers.get("content-security-policy") || "";
  if (/frame-ancestors\s+'none'/i.test(csp)) ok("CSP frame-ancestors none");
  else passed = fail("CSP should set frame-ancestors 'none'") && passed;

  return passed;
}

if (process.argv[1]?.endsWith("09-security-headers.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
