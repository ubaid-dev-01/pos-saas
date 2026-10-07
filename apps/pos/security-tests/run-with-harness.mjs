#!/usr/bin/env node
/**
 * Boots a lightweight WAF+rate-limit harness, runs the full battery, then exits.
 * Use when Next.js ports are busy / unstable:
 *   npm run security:test:harness
 */
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const PORT = Number(process.env.HARNESS_PORT || 3210);

const rateUrl = pathToFileURL(resolve(root, "lib/security/rate-limit.ts")).href;
const atkUrl = pathToFileURL(resolve(root, "lib/security/attack-patterns.ts")).href;

const boot = `
import http from "node:http";
import { checkRateLimitAsync, clientIpFromHeaders, RATE_LIMIT_MAX, RATE_LIMIT_BAN_MS, RATE_LIMIT_WINDOW_MS } from "${rateUrl}";
import { scanRequestForAttacks } from "${atkUrl}";
const PORT = ${PORT};
const server = http.createServer(async (req, res) => {
  const host = req.headers.host || ("127.0.0.1:" + PORT);
  const url = new URL(req.url || "/", "http://" + host);
  const headers = {
    get: (n) => {
      const v = req.headers[String(n).toLowerCase()];
      return Array.isArray(v) ? v[0] : (v ?? null);
    },
  };
  const attack = scanRequestForAttacks({ url: url.toString(), headers });
  if (attack) {
    res.writeHead(400, { "content-type": "text/plain", "x-content-type-options": "nosniff", "cache-control": "no-store" });
    res.end("Bad Request (" + attack + ")");
    return;
  }
  const ip = clientIpFromHeaders(headers);
  const path = url.pathname;
  const limitKey = (path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/forgot-password") || path.startsWith("/api/receipt"))
    ? ("auth:" + ip) : ip;
  const limit = await checkRateLimitAsync(limitKey);
  if (!limit.ok) {
    res.writeHead(429, {
      "content-type": "text/plain",
      "retry-after": String(limit.retryAfterSec),
      "x-ratelimit-limit": String(RATE_LIMIT_MAX),
      "x-ratelimit-ban": String(Math.floor(RATE_LIMIT_BAN_MS / 1000)),
      "x-ratelimit-window": String(Math.floor(RATE_LIMIT_WINDOW_MS / 1000)),
      "cache-control": "no-store",
    });
    res.end("Too many requests. Temporarily blocked for 15 minutes.");
    return;
  }
  if (path.startsWith("/admin") || path.startsWith("/account")) {
    res.writeHead(307, { location: "/login?next=" + encodeURIComponent(path) });
    res.end();
    return;
  }
  if (path.startsWith("/api/receipt/")) {
    res.writeHead(401, { "content-type": "text/plain", "cache-control": "no-store" });
    res.end("Receipt link requires a secure token");
    return;
  }
  if (path.includes(".env") || path.includes(".git") || /\\.(php|sql|bak|asp)$/i.test(path)) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
    return;
  }
  if (req.method && !["GET", "HEAD", "POST", "OPTIONS"].includes(req.method)) {
    res.writeHead(405, { "content-type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "content-security-policy": "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
    "x-ratelimit-limit": String(RATE_LIMIT_MAX),
    "x-ratelimit-remaining": String(limit.remaining),
    "cache-control": "no-store",
  });
  res.end("<!doctype html><html><body><h1>Naaz Wears</h1><p>security harness</p></body></html>");
});
server.listen(PORT, "127.0.0.1", () => console.log("HARNESS_READY " + PORT));
`;

const proc = spawn(
  process.execPath,
  ["--experimental-strip-types", "--input-type=module", "-e", boot],
  { stdio: ["ignore", "pipe", "pipe"] }
);

let ready = false;
proc.stdout.on("data", (buf) => {
  const s = buf.toString();
  process.stdout.write(s);
  if (s.includes("HARNESS_READY")) ready = true;
});
proc.stderr.on("data", (buf) => {
  const s = buf.toString();
  if (!s.includes("MODULE_TYPELESS")) process.stderr.write(s);
});

const deadline = Date.now() + 25000;
while (!ready && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 100));
}
if (!ready) {
  console.error("Harness failed to start");
  proc.kill("SIGTERM");
  process.exit(1);
}

const test = spawn(process.execPath, ["security-tests/run-all.mjs"], {
  cwd: root,
  env: { ...process.env, BASE_URL: `http://127.0.0.1:${PORT}` },
  stdio: "inherit",
});

const code = await new Promise((resolveCode) => {
  test.on("exit", (c) => resolveCode(c ?? 1));
});
proc.kill("SIGTERM");
process.exit(code);
