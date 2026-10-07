/** Shared helpers for security-tests/*.mjs */

export function baseUrl() {
  return (process.env.BASE_URL || "http://localhost:3001").replace(/\/$/, "");
}

export function ok(name, detail = "") {
  console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  return true;
}

export function fail(name, detail = "") {
  console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  return false;
}

export async function fetchStatus(path, init = {}) {
  const url = path.startsWith("http") ? path : `${baseUrl()}${path}`;
  const res = await fetch(url, {
    redirect: "manual",
    ...init,
    headers: {
      "user-agent": "NaazWears-SecurityTest/1.0",
      ...(init.headers || {}),
    },
  });
  return res;
}

export async function expectStatus(path, allowed, init = {}) {
  const res = await fetchStatus(path, init);
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(res.status)) {
    return { pass: false, status: res.status, res };
  }
  return { pass: true, status: res.status, res };
}
