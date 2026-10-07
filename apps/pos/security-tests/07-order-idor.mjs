/** 07 — Order IDOR / receipt without token */
import { expectStatus, fail, ok } from "./_helpers.mjs";

export async function run() {
  console.log("\n[07] Order IDOR / receipt auth");
  let passed = true;
  const headers = { "x-forwarded-for": "203.0.113.15" };

  // Guessable legacy-style IDs
  for (const id of ["NN-10000", "NN-12345", "NN-99999"]) {
    const page = await expectStatus(`/orders/${id}`, [200, 404], { headers });
    if (page.status === 200) {
      const html = await page.res.text();
      // Page may render "not found" client-side; ensure no PII markers for random id
      if (/customerEmail|customerPhone|Rs\.\s*\d{3,}/i.test(html) && !/Order not found/i.test(html)) {
        passed = fail(`order page may leak data for ${id}`) && passed;
      } else {
        ok(`order ${id} no obvious PII leak`);
      }
    } else {
      ok(`order ${id}`, `status ${page.status}`);
    }

    const pdf = await expectStatus(`/api/receipt/${id}`, [401, 403, 404], { headers });
    if ([401, 403, 404].includes(pdf.status)) {
      ok(`receipt ${id} denied without token`, `status ${pdf.status}`);
    } else {
      passed = fail(`receipt ${id} should deny without token`, `status ${pdf.status}`) && passed;
    }
  }

  // CRLF in order id filename
  const inject = await expectStatus("/api/receipt/NN-ABC%0d%0aX-Injected%3A1", [400, 401, 403, 404], {
    headers,
  });
  if ([400, 401, 403, 404].includes(inject.status)) {
    ok("receipt orderId injection blocked", `status ${inject.status}`);
  } else {
    passed = fail("receipt CRLF not blocked", `status ${inject.status}`) && passed;
  }

  return passed;
}

if (process.argv[1]?.endsWith("07-order-idor.mjs")) {
  process.exit((await run()) ? 0 : 1);
}
