/** Trim optional customer name; empty → null (not stored or shown on receipts). */
export function normalizeOptionalCustomerName(name) {
  const trimmed = String(name ?? "").trim();
  return trimmed || null;
}

export function hasReceiptCustomerName(name) {
  return Boolean(normalizeOptionalCustomerName(name));
}
