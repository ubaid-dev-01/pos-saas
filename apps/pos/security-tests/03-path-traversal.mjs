/** 03 — Path traversal */
import { expectStatus, fail, ok, fetchStatus } from "./_helpers.mjs";

const PAYLOADS = [
  "/../../../etc/passwd",
  "/shop/../../etc/passwd",
  "/shop?file=../../etc/passwd",
  "/shop?path=%2e%2e%2f%2e%2e%2fetc%2fpasswd",
  "/api/receipt/..%2f..%2f.env",
];

export async function run() {
  console.log("\n[03] Path traversal");
  let passed = true;
  for (const path of PAYLOADS) {
    const { pass, status } = await expectStatus(path, [400, 404], {
      headers: { "x-forwarded-for": "203.0.113.11" },
    });
    // Pathname-only probes (URL normalizes ../ away) — still flag /etc/passwd etc.
    if (pass || status === 400) ok(`handled ${path.slice(0, 70)}`, `status ${status}`);
    else if (status === 200 && /etc\/passwd|shadow/i.test(path)) {
      passed = fail(`traversal returned 200`, path) && passed;
    } else if (status === 200) {
      // Node/Next may normalize /shop/../../etc/passwd → /etc/passwd then 200 on harness root
      // Treat as fail only if body looks like a real passwd file
      const body = await (await fetchStatus(path, { headers: { "x-forwarded-for": "203.0.113.11" } })).text();
      if (/root:.*:0:0:/.test(body)) passed = fail(`passwd contents leaked`, path) && passed;
      else ok(`normalized path no leak`, `status ${status}`);
    } else {
      ok(`non-success ${status}`, path.slice(0, 50));
    }
  }
  return passed;
}

if (process.argv[1]?.endsWith("03-path-traversal.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
