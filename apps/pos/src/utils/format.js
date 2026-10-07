import { format, isValid, parseISO } from "date-fns";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  getCurrencyMeta,
  getCurrencySymbol,
} from "../constants/currencies";
import useAuthStore from "../stores/authStore";

export function getActiveCurrency() {
  const store = useAuthStore.getState().store;
  const code = store?.currency || DEFAULT_CURRENCY;
  const locale =
    store?.currencyLocale || getCurrencyMeta(code).locale || DEFAULT_LOCALE;
  return { code, locale };
}

export function formatCurrency(amount, options = {}) {
  const n = Number(amount) || 0;
  const active = getActiveCurrency();
  const currency = options.currency || active.code;
  const locale = options.locale || active.locale;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatCompactCurrency(amount) {
  const n = Number(amount) || 0;
  if (Math.abs(n) < 1000) return formatCurrency(n);
  const { code, locale } = getActiveCurrency();
  const symbol = getCurrencySymbol(code);
  const compact = new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(n);
  return `${symbol}${compact}`;
}

export function formatDate(value) {
  if (!value) return " ";
  const d =
    typeof value === "string"
      ? parseISO(value)
      : value?.toDate?.()
        ? value.toDate()
        : new Date(value);
  if (!isValid(d)) return " ";
  return format(d, "dd MMM yyyy");
}

export function formatDateTime(value) {
  if (!value) return " ";
  const d =
    typeof value === "string"
      ? parseISO(value)
      : value?.toDate?.()
        ? value.toDate()
        : new Date(value);
  if (!isValid(d)) return " ";
  return format(d, "dd MMM yyyy, h:mm a");
}
