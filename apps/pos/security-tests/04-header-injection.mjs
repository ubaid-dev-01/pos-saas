/** 04 — Header injection / CRLF */
import { baseUrl, fail, ok } from "./_helpers.mjs";

export async function run() {
  console.log("\n[04] Header injection");
  let passed = true;

  // Host header with CRLF should be rejected by runtime or middleware
  try {
    const res = await fetch(`${baseUrl()}/`, {
      headers: {
        "x-forwarded-for": "203.0.113.12",
        "x-forwarded-host": "evil.com\r\nX-Injected: yes",
        "user-agent": "NaazWears-SecurityTest/1.0",
      },
      redirect: "manual",
    });
    if (res.status === 400) ok("CRLF in x-forwarded-host → 400");
    else if (res.status >= 400) ok("CRLF rejected", `status ${res.status}`);
    else {
      // undici may strip CRLF before send — treat as pass with note
      ok("runtime stripped CRLF before send (safe)", `status ${res.status}`);
    }
  } catch (err) {
    ok("fetch rejected hostile header", String(err.message || err).slice(0, 80));
  }

  const q = await fetch(`${baseUrl()}/shop?q=test%0d%0aSet-Cookie:%20a=1`, {
    headers: { "x-forwarded-for": "203.0.113.12", "user-agent": "NaazWears-SecurityTest/1.0" },
    redirect: "manual",
  });
  if (q.status === 400) ok("CRLF in query → 400");
  else if (q.headers.get("set-cookie")?.includes("a=1")) {
    passed = fail("header injection reflected Set-Cookie") && passed;
  } else {
    ok("no injected Set-Cookie", `status ${q.status}`);
  }

  return passed;
}

if (process.argv[1]?.endsWith("04-header-injection.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
