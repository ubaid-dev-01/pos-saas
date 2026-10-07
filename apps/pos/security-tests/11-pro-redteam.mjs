/**
 * Elite / pro-level security test pack — think like an attacker.
 * Run: BASE_URL=http://localhost:3001 npm run security:test
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { baseUrl, expectStatus, fail, ok, fetchStatus } from "./_helpers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function envConvexUrl() {
  const fromEnv = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (fromEnv) return fromEnv.trim();
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) return "";
  const m = readFileSync(envPath, "utf8").match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

/** 11 — Open redirect / post-login phishing */
export async function runOpenRedirect() {
  console.log("\n[11] Open redirect bypasses");
  let passed = true;
  const safeUrl = pathToFileURL(resolve(root, "lib/safe-next-path.ts")).href;
  const code = `
import { safeNextPath } from "${safeUrl}";
const cases = [
  ["//evil.com", "/account"],
  ["https://evil.com", "/account"],
  ["/\\\\evil.com", "/account"],
  ["/@evil.com", "/account"],
  ["/account", "/account"],
  ["/orders/NN-ABC", "/orders/NN-ABC"],
  [null, "/account"],
];
let failed = 0;
for (const [inn, want] of cases) {
  const got = safeNextPath(inn);
  if (got !== want) { console.error("  FAIL  safeNextPath", JSON.stringify(inn), "=>", got); failed++; }
  else console.log("  PASS  safeNextPath", JSON.stringify(inn), "=>", got);
}
process.exit(failed ? 1 : 0);
`;
  const r = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", code], {
    encoding: "utf8",
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr && !String(r.stderr).includes("MODULE_TYPELESS")) process.stderr.write(r.stderr);
  if (r.status !== 0) passed = false;

  const payloads = [
    "/login?next=//evil.example",
    "/login?next=https://evil.example",
  ];
  for (const path of payloads) {
    const { status } = await expectStatus(path, [200, 400], {
      headers: { "x-forwarded-for": "203.0.113.40" },
    });
    if (status === 400) ok(`middleware blocks ${path}`, "400");
    else ok(`login loads (${status}) — safeNextPath neutralizes`, path);
  }
  return passed;
}

/** 12 — Convex public API must not dump secrets / admin data */
export async function runConvexApi() {
  console.log("\n[12] Convex public API abuse");
  let passed = true;

  // Source-of-truth checks (always run)
  const settingsSrc = readFileSync(resolve(root, "convex/settings.ts"), "utf8");
  if (!settingsSrc.includes("getPublic") || !settingsSrc.includes("assertAdmin")) {
    passed = fail("settings must expose getPublic + protect getAll") && passed;
  } else ok("settings.getPublic + admin getAll in source");

  const homeSrc = readFileSync(resolve(root, "convex/homepage.ts"), "utf8");
  if (!/listAll[\s\S]*assertAdmin/.test(homeSrc)) {
    passed = fail("homepage.listAll must assertAdmin") && passed;
  } else ok("homepage.listAll gated in source");

  const bannersSrc = readFileSync(resolve(root, "convex/banners.ts"), "utf8");
  if (!/export const list[\s\S]*assertAdmin/.test(bannersSrc)) {
    passed = fail("banners.list must assertAdmin") && passed;
  } else ok("banners.list gated in source");

  if (process.env.CONVEX_LIVE !== "1") {
    ok("skip live Convex probes (set CONVEX_LIVE=1 after `npx convex dev`)");
    return passed;
  }

  const url = envConvexUrl();
  if (!url) {
    ok("skip live — no CONVEX_URL");
    return passed;
  }

  try {
    const { ConvexHttpClient } = await import("convex/browser");
    const { api } = await import("../convex/_generated/api.js");
    const client = new ConvexHttpClient(url);

    try {
      await client.query(api.settings.getAll, {});
      passed = fail("settings.getAll allowed anonymously on LIVE deploy") && passed;
    } catch {
      ok("LIVE settings.getAll rejects anonymous");
    }

    const pub = await client.query(api.settings.getPublic, {});
    if (pub?.store && typeof pub.store === "object" && "email" in pub.store) {
      passed = fail("LIVE getPublic leaks store.email") && passed;
    } else ok("LIVE getPublic redacts store.email");

    for (const [label, fn] of [
      ["homepage.listAll", () => client.query(api.homepage.listAll, {})],
      ["banners.list", () => client.query(api.banners.list, {})],
      ["customers.list", () => client.query(api.customers.list, {})],
      ["staff.list", () => client.query(api.staff.list, {})],
    ]) {
      try {
        await fn();
        passed = fail(`LIVE ${label} allowed anonymously`) && passed;
      } catch {
        ok(`LIVE ${label} rejects anonymous`);
      }
    }
  } catch (err) {
    passed = fail("Convex client error", String(err.message || err).slice(0, 120)) && passed;
  }
  return passed;
}

/** 13 — Business logic / checkout abuse payloads (HTTP layer) */
export async function runBusinessLogic() {
  console.log("\n[13] Business logic / payment spoof surfaces");
  let passed = true;
  // Source-level assertions that fixes exist
  const ordersSrc = readFileSync(resolve(root, "convex/orders.ts"), "utf8");
  if (!ordersSrc.includes("Only Cash on Delivery")) {
    passed = fail("placeOrder must reject non-COD until gateway exists") && passed;
  } else ok("placeOrder COD-only gate present");

  if (!ordersSrc.includes("Invalid payment method")) {
    passed = fail("placeOrder must require enabled payment method") && passed;
  } else ok("placeOrder payment whitelist present");

  if (!ordersSrc.includes("Number.isFinite(it.qty)")) {
    passed = fail("placeOrder must reject NaN qty") && passed;
  } else ok("placeOrder rejects non-finite qty");

  if (!ordersSrc.includes("allowedSizes") && !ordersSrc.includes("Invalid size")) {
    passed = fail("placeOrder must validate size against product") && passed;
  } else ok("placeOrder validates product sizes");

  const adminAuth = readFileSync(resolve(root, "convex/adminAuth.ts"), "utf8");
  if (!adminAuth.includes('status === "Inactive"') && !adminAuth.includes("Invited")) {
    passed = fail("assertAdmin must require Active staff") && passed;
  } else ok("assertAdmin ignores Inactive/Invited staff");

  const staffSrc = readFileSync(resolve(root, "convex/staff.ts"), "utf8");
  if (!staffSrc.includes("assertSuperAdmin") || !staffSrc.includes("demoteProfileToCustomer")) {
    passed = fail("staff deactivate must demote profile + restrict admin invite") && passed;
  } else ok("staff privilege escalation controls present");

  return passed;
}

/** 14 — Cart session IDOR / overflow */
export async function runCartSession() {
  console.log("\n[14] Cart / session hardening");
  let passed = true;
  const cartSrc = readFileSync(resolve(root, "convex/cart.ts"), "utf8");
  if (!cartSrc.includes("UUID_RE") && !cartSrc.includes("Invalid session")) {
    passed = fail("cart must validate UUID sessionId") && passed;
  } else ok("cart validates session UUID");

  if (!cartSrc.includes("MAX_CART_ITEMS") && !cartSrc.includes("too large")) {
    passed = fail("cart must cap item count") && passed;
  } else ok("cart has size caps");

  if (process.env.CONVEX_LIVE !== "1") {
    ok("skip live cart IDOR (set CONVEX_LIVE=1 after convex deploy)");
    return passed;
  }

  const url = envConvexUrl();
  if (!url) {
    ok("skip live cart IDOR — no CONVEX_URL");
    return passed;
  }
  try {
    const { ConvexHttpClient } = await import("convex/browser");
    const { api } = await import("../convex/_generated/api.js");
    const client = new ConvexHttpClient(url);
    try {
      await client.mutation(api.cart.setCart, {
        sessionId: "not-a-uuid",
        items: [{ slug: "x", qty: 1, size: "M" }],
      });
      passed = fail("LIVE cart accepted non-UUID session") && passed;
    } catch {
      ok("LIVE cart rejects non-UUID sessionId");
    }
    try {
      await client.mutation(api.cart.setCart, {
        sessionId: "00000000-0000-4000-8000-000000000099",
        items: Array.from({ length: 100 }, (_, i) => ({
          slug: `slug-${i}`,
          qty: 1,
          size: "M",
        })),
      });
      passed = fail("LIVE cart accepted 100 items") && passed;
    } catch {
      ok("LIVE cart rejects oversized payload");
    }
  } catch (err) {
    ok("cart live check skipped", String(err.message || err).slice(0, 80));
  }
  return passed;
}

/** 15 — Recon / info disclosure */
export async function runRecon() {
  console.log("\n[15] Recon / info disclosure");
  let passed = true;
  const paths = [
    "/.env",
    "/.env.local",
    "/.git/HEAD",
    "/.git/config",
    "/package.json",
    "/tsconfig.json",
    "/convex/seedAdmin.ts",
    "/api",
    "/server-status",
    "/.aws/credentials",
    "/wp-login.php",
    "/phpinfo.php",
    "/admin.php",
    "/backup.zip",
    "/dump.sql",
  ];
  for (const path of paths) {
    const res = await fetchStatus(path, {
      headers: { "x-forwarded-for": "203.0.113.41" },
    });
    if ([200].includes(res.status)) {
      const text = await res.text();
      if (/AUTH_SECRET|SMTP_PASS|ADMIN_PASSWORD|BEGIN (RSA )?PRIVATE KEY/.test(text)) {
        passed = fail(`secret leak at ${path}`) && passed;
      } else if (path.includes(".env") || path.includes(".git") || path.endsWith(".sql")) {
        passed = fail(`sensitive path returned 200: ${path}`) && passed;
      } else {
        ok(`${path} 200 but no secrets`, "review manually");
      }
    } else {
      ok(`denied ${path}`, `status ${res.status}`);
    }
  }

  // Source maps should not be advertised
  const home = await fetchStatus("/", { headers: { "x-forwarded-for": "203.0.113.41" } });
  const html = await home.text();
  if (/sourceMappingURL=/i.test(html)) {
    passed = fail("sourceMappingURL in HTML") && passed;
  } else ok("no sourceMappingURL in homepage HTML");

  return passed;
}

/** 16 — Advanced XSS / polyglot / encoding WAF */
export async function runAdvancedXss() {
  console.log("\n[16] Advanced XSS / polyglot / encoding");
  let passed = true;
  const payloads = [
    "/shop?q=%3Csvg%20onload=alert(1)%3E",
    "/shop?q=%3Cimg%20src=x%20onerror=alert(1)%3E",
    "/shop?q=%22%3E%3Cscript%3Ealert(1)%3C/script%3E",
    "/shop?q={{7*7}}",
    "/shop?q=${7*7}",
    "/shop?q=javascript%3Aalert(1)",
    "/product/x?redirect=//evil.com",
    "/shop?q=%00%3Cscript%3E",
    "/shop?file=....//....//etc/passwd",
    "/shop?q=SLEEP(5)",
    "/shop?q=WAITFOR%20DELAY%20'0:0:5'",
  ];
  for (const path of payloads) {
    const { status } = await expectStatus(path, [400, 404], {
      headers: { "x-forwarded-for": "203.0.113.42" },
    });
    if (status === 400) ok(`WAF blocked`, path.slice(0, 60));
    else if (status === 404) ok(`404 (ok)`, path.slice(0, 50));
    else passed = fail(`expected block`, `${path} → ${status}`) && passed;
  }
  return passed;
}

/** 17 — Auth surface / clickjacking / CORS */
export async function runAuthSurface() {
  console.log("\n[17] Auth surface / clickjacking / CORS");
  let passed = true;
  const res = await fetchStatus("/login", {
    headers: { "x-forwarded-for": "203.0.113.43" },
  });
  const xfo = res.headers.get("x-frame-options");
  const csp = res.headers.get("content-security-policy") || "";
  if (xfo && /deny|sameorigin/i.test(xfo)) ok("X-Frame-Options", xfo);
  else if (/frame-ancestors/i.test(csp)) ok("CSP frame-ancestors set");
  else passed = fail("missing clickjacking protection") && passed;

  const acao = res.headers.get("access-control-allow-origin");
  if (acao === "*") passed = fail("CORS ACAO is * on login") && passed;
  else ok("no wildcard CORS on login", acao ?? "(absent)");

  // Admin without cookie
  const admin = await fetchStatus("/admin", {
    headers: { "x-forwarded-for": "203.0.113.43" },
  });
  if ([302, 303, 307].includes(admin.status)) {
    const loc = admin.headers.get("location") || "";
    if (loc.includes("/login")) ok("admin redirects to login");
    else passed = fail("admin redirect unexpected", loc) && passed;
  } else if ([401, 403].includes(admin.status)) ok("admin denied", String(admin.status));
  else passed = fail("admin accessible without auth", String(admin.status)) && passed;

  return passed;
}

/** 18 — Static analysis: no hardcoded secrets / public seed */
export async function runStaticAudit() {
  console.log("\n[18] Static secret / seed audit");
  let passed = true;
  const seedAdmin = readFileSync(resolve(root, "convex/seedAdmin.ts"), "utf8");
  if (/const ADMIN_PASSWORD\s*=/.test(seedAdmin) || /adminubaidpass/.test(seedAdmin)) {
    passed = fail("hardcoded admin password in seedAdmin") && passed;
  } else ok("no hardcoded admin password");

  if (!/internalAction/.test(seedAdmin)) {
    passed = fail("seedAdmin.run must be internalAction") && passed;
  } else ok("seedAdmin is internalAction");

  const seed = readFileSync(resolve(root, "convex/seed.ts"), "utf8");
  if (/export const run = action\(/.test(seed)) {
    passed = fail("seed.run must not be public action") && passed;
  } else ok("seed.run is not public action");

  // Scan client bundles for common secret names (source)
  const scanDirs = ["app", "components", "lib"];
  for (const dir of scanDirs) {
    const abs = resolve(root, dir);
    if (!existsSync(abs)) continue;
    walk(abs, (file) => {
      if (!/\.(ts|tsx|js|jsx)$/.test(file)) return;
      const src = readFileSync(file, "utf8");
      if (/SMTP_PASS\s*=\s*['"][^'"]+['"]/.test(src) || /AUTH_SECRET\s*=\s*['"][^'"]{8,}['"]/.test(src)) {
        passed = fail(`possible secret in ${file}`) && passed;
      }
    });
  }
  ok("client source scan complete");
  return passed;
}

function walk(dir, fn) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules" || name.name === ".next") continue;
      walk(p, fn);
    } else fn(p);
  }
}

if (process.argv[1]?.endsWith("11-pro-redteam.mjs")) {
  let failed = 0;
  for (const fn of [
    runOpenRedirect,
    runConvexApi,
    runBusinessLogic,
    runCartSession,
    runRecon,
    runAdvancedXss,
    runAuthSurface,
    runStaticAudit,
  ]) {
    if (!(await fn())) failed++;
  }
  process.exit(failed ? 1 : 0);
}
