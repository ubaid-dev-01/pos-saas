/** 02 — XSS / script injection in URL & query → 400 */
import { expectStatus, fail, ok } from "./_helpers.mjs";

const PAYLOADS = [
  "/shop?q=<script>alert(1)</script>",
  "/shop?q=javascript:alert(1)",
  "/?ref=data:text/html,<script>alert(1)</script>",
  "/product/test?onerror=alert(1)",
  "/shop?q=<iframe src=javascript:alert(1)>",
  "/shop?q=<img src=x onerror=alert(1)>",
];

export async function run() {
  console.log("\n[02] XSS / script injection");
  let passed = true;
  for (const path of PAYLOADS) {
    const { pass, status } = await expectStatus(path, [400], {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });
    if (pass) ok(`blocked ${path.slice(0, 60)}`, `status ${status}`);
    else {
      passed = fail(`expected 400 for ${path}`, `got ${status}`) && passed;
    }
  }
  return passed;
}

if (process.argv[1]?.endsWith("02-xss-injection.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
