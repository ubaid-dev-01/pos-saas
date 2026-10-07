/** 06 — Auth surfaces: /admin /account redirect; open-redirect on login next= */
import { expectStatus, fail, ok } from "./_helpers.mjs";

export async function run() {
  console.log("\n[06] Auth surfaces / open redirect");
  let passed = true;

  for (const path of ["/admin", "/account", "/account/profile"]) {
    const { status, res } = await expectStatus(path, [307, 302, 303, 401, 403], {
      headers: { "x-forwarded-for": "203.0.113.14" },
    });
    if ([307, 302, 303].includes(status)) {
      const loc = res.headers.get("location") || "";
      if (loc.includes("/login")) ok(`${path} → login`, loc.slice(0, 60));
      else passed = fail(`${path} redirect not to login`, loc) && passed;
    } else if ([401, 403].includes(status)) {
      ok(`${path} denied`, `status ${status}`);
    } else {
      passed = fail(`${path} should require auth`, `status ${status}`) && passed;
    }
  }

  // Open redirect
  const evil = await expectStatus("/login?next=//evil.example", [200, 307, 302], {
    headers: { "x-forwarded-for": "203.0.113.14" },
  });
  const body = await evil.res.text().catch(() => "");
  if (body.includes('href="//evil') || body.includes("location.href=\"//evil")) {
    passed = fail("open redirect payload present in login HTML") && passed;
  } else {
    ok("login page does not embed //evil next target as navigation");
  }

  return passed;
}

if (process.argv[1]?.endsWith("06-auth-surfaces.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
