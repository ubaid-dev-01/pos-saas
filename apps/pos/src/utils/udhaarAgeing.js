/**
 * Udhaar (credit) ageing helpers.
 *
 * Given a list of customers (each carrying `currentCredit` and optional
 * `lastPurchase` / `firstUnpaidDate`), bucket them by age of the oldest
 * unpaid balance.
 *
 * Buckets follow standard retail receivables practice:
 *   - current: 0-30 days
 *   - days_30: 31-60 days
 *   - days_60: 61-90 days
 *   - days_90: 91+ days
 *
 * The `lastPurchase` field on the customer document is used as a proxy for
 * "age of the outstanding balance" until a finer-grained per-ledger ageing
 * is implemented. If you have stored `firstUnpaidDate` on the customer, it
 * will be preferred.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const AGEING_BUCKETS = [
  { id: "current", label: "0-30 days", maxDays: 30 },
  { id: "days_30", label: "31-60 days", maxDays: 60 },
  { id: "days_60", label: "61-90 days", maxDays: 90 },
  { id: "days_90", label: "90+ days", maxDays: Infinity },
];

export function ageInDays(dateLike, now = new Date()) {
  if (!dateLike) return 0;
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return 0;
  const diff = now.getTime() - d.getTime();
  return Math.max(0, Math.floor(diff / DAY_MS));
}

export function bucketForAge(days) {
  for (const bucket of AGEING_BUCKETS) {
    if (days <= bucket.maxDays) return bucket;
  }
  return AGEING_BUCKETS[AGEING_BUCKETS.length - 1];
}

/**
 * Decorate a list of customers with their `udhaar` ageing metadata.
 *
 * @returns array of customers extended with:
 *   `outstanding`, `ageDays`, `bucket` (the bucket object)
 *   filtered to those with currentCredit > 0
 */
export function decorateUdhaarCustomers(customers = [], now = new Date()) {
  const out = [];
  for (const c of customers) {
    const balance = Number(c.currentCredit) || 0;
    if (balance <= 0) continue;
    const reference =
      c.firstUnpaidDate || c.lastPurchase || c.updatedAt || c.createdAt;
    const days = ageInDays(reference, now);
    out.push({
      ...c,
      outstanding: balance,
      ageDays: days,
      bucket: bucketForAge(days),
    });
  }
  out.sort((a, b) => b.ageDays - a.ageDays);
  return out;
}

/** Aggregate a decorated customer list into a summary used by dashboards. */
export function summarizeUdhaarAgeing(decoratedCustomers = []) {
  const summary = {
    totalReceivable: 0,
    count: decoratedCustomers.length,
    oldestDays: 0,
    byBucket: Object.fromEntries(
      AGEING_BUCKETS.map((b) => [b.id, { count: 0, total: 0, label: b.label }]),
    ),
  };
  for (const c of decoratedCustomers) {
    summary.totalReceivable += c.outstanding;
    if (c.ageDays > summary.oldestDays) summary.oldestDays = c.ageDays;
    const bucket = summary.byBucket[c.bucket.id];
    if (bucket) {
      bucket.count += 1;
      bucket.total += c.outstanding;
    }
  }
  return summary;
}
