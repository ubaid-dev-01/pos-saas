/**
 * 01 — Rate limit: max 100 req / 60s per IP, then 15-minute ban (HTTP 429).
 * Fires in parallel bursts so the 60s window does not reset mid-test.
 */
import { baseUrl, fail, ok } from "./_helpers.mjs";

const TEST_IP = `203.0.113.${100 + Math.floor(Math.random() * 50)}`;

async function hit(i) {
  const res = await fetch(`${baseUrl()}/`, {
    headers: {
      "x-forwarded-for": TEST_IP,
      "user-agent": "NaazWears-SecurityTest/1.0",
      "cache-control": "no-store",
      "x-test-seq": String(i),
    },
    redirect: "manual",
    cache: "no-store",
  });
  return {
    i,
    status: res.status,
    remaining: res.headers.get("x-ratelimit-remaining"),
    retry: res.headers.get("retry-after"),
    ban: res.headers.get("x-ratelimit-ban"),
  };
}

export async function run() {
  console.log("\n[01] Rate limit (100/min → 15m ban)");
  console.log(`  using test IP ${TEST_IP}`);
  let passed = true;

  const started = Date.now();
  /** Fire 120 requests in parallel batches of 30 (stay inside 60s window). */
  const results = [];
  for (let batch = 0; batch < 4; batch++) {
    const start = batch * 30 + 1;
    const end = start + 29;
    const chunk = await Promise.all(
      Array.from({ length: 30 }, (_, k) => hit(start + k))
    );
    results.push(...chunk);
    const blocked = chunk.find((r) => r.status === 429);
    if (blocked) break;
    console.log(
      `  … batch ${batch + 1} last=#${end} status=${chunk[chunk.length - 1].status} remaining=${chunk[chunk.length - 1].remaining ?? "?"}`
    );
  }

  const first429 = results.find((r) => r.status === 429);
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  if (!first429) {
    const last = results[results.length - 1];
    passed =
      fail(
        "never received 429",
        `sent=${results.length} lastRemaining=${last?.remaining} elapsed=${elapsed}s`
      ) && passed;
  } else {
    ok(`blocked at request #${first429.i}`, `Retry-After=${first429.retry ?? "?"} (${elapsed}s)`);
    if (first429.retry && Number(first429.retry) < 60) {
      passed = fail("Retry-After should be ~15 minutes", `got ${first429.retry}`) && passed;
    } else if (first429.retry) {
      ok("Retry-After present", `${first429.retry}s`);
    }
  }

  const stuck = await hit(9999);
  if (stuck.status === 429) ok("ban persists on next request");
  else passed = fail("ban did not persist", `status ${stuck.status}`) && passed;

  return passed;
}

if (process.argv[1]?.endsWith("01-rate-limit.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
