/**
 * Pakistani Rupee (PKR) friendly formatting helpers.
 *
 * Pakistani retail traditionally rounds the final total to the nearest
 * Rs. 1 (or Rs. 5 for high-ticket items) and displays "Rs. 1,235" without
 * decimals on receipts. This module provides:
 *
 *   - `roundToRupee(amount, mode)` — round to nearest 1 or 5
 *   - `formatRupees(amount, opts)` — locale-aware "Rs. 1,235" string
 *   - `getRoundingMode(store)` — read store config (default: nearest_1 for PKR)
 *   - `applyStoreRounding(amount, store)` — convenience round + format
 *
 * Why a separate module from `format.js`?
 *   `format.js` uses `Intl.NumberFormat({ style: 'currency' })` which always
 *   shows decimals and the wrong symbol for some locales. For receipts and
 *   summary screens shop owners want a clean integer-rupee display.
 */

const ROUNDING_MODES = {
  none: { step: 0 },
  nearest_1: { step: 1 },
  nearest_5: { step: 5 },
};

export function getRoundingMode(store) {
  const mode = store?.posConfig?.currencyRounding || store?.currencyRounding;
  if (mode && ROUNDING_MODES[mode]) return mode;
  if (store?.currency === "PKR") return "nearest_1";
  return "none";
}

export function roundToRupee(amount, mode = "nearest_1") {
  const n = Number(amount) || 0;
  const { step } = ROUNDING_MODES[mode] || ROUNDING_MODES.none;
  if (!step) return Math.round(n * 100) / 100;
  return Math.round(n / step) * step;
}

export function roundDiff(amount, mode = "nearest_1") {
  const rounded = roundToRupee(amount, mode);
  return Math.round((rounded - (Number(amount) || 0)) * 100) / 100;
}

const SYMBOL_BY_CURRENCY = {
  PKR: "Rs.",
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED",
  SAR: "SAR",
};

export function formatRupees(amount, opts = {}) {
  const {
    currency = "PKR",
    locale = "en-PK",
    noDecimals = false,
    showSymbol = true,
  } = opts;
  const n = Number(amount) || 0;
  const number = new Intl.NumberFormat(locale, {
    maximumFractionDigits: noDecimals ? 0 : 2,
    minimumFractionDigits: noDecimals ? 0 : 0,
  }).format(n);
  if (!showSymbol) return number;
  const symbol = SYMBOL_BY_CURRENCY[currency] || currency;
  return `${symbol} ${number}`;
}

export function applyStoreRounding(amount, store) {
  const mode = getRoundingMode(store);
  return roundToRupee(amount, mode);
}

export function formatStoreAmount(amount, store, opts = {}) {
  const rounded = applyStoreRounding(amount, store);
  const mode = getRoundingMode(store);
  return formatRupees(rounded, {
    currency: store?.currency || "PKR",
    locale: store?.currencyLocale || "en-PK",
    noDecimals: mode !== "none",
    ...opts,
  });
}
