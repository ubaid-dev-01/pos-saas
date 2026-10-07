import { differenceInCalendarDays, isValid, parseISO } from "date-fns";

const severityOrder = {
  danger: 0,
  warning: 1,
  info: 2,
};

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const date = parseISO(String(value));
  return isValid(date) ? date : null;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getExpiryStatus(product, now, options = {}) {
  const expiryDate = toDate(product.expiryDate);
  if (!expiryDate) return null;

  const warningDays = Math.max(
    0,
    toNumber(product.expiryWarningDays, options.defaultExpiryWarningDays ?? 90),
  );
  const dangerDays = Math.max(1, toNumber(options.dangerDays, 7));
  const daysLeft = differenceInCalendarDays(expiryDate, now);

  if (daysLeft < 0) {
    return {
      kind: "expiry",
      level: "danger",
      title: "Expired",
      message: `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago.`,
      daysLeft,
      expiryDate: product.expiryDate,
    };
  }

  if (daysLeft <= dangerDays) {
    return {
      kind: "expiry",
      level: "danger",
      title: `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      message: "Immediate action needed before the product expires.",
      daysLeft,
      expiryDate: product.expiryDate,
    };
  }

  if (daysLeft <= warningDays) {
    return {
      kind: "expiry",
      level: "warning",
      title: `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      message: `Warning window starts at ${warningDays} day${warningDays === 1 ? "" : "s"} before expiry.`,
      daysLeft,
      expiryDate: product.expiryDate,
    };
  }

  return null;
}

export function getProductAlerts(products = [], options = {}) {
  const now = options.now || new Date();
  const alerts = [];

  products.forEach((product) => {
    if (!product || product.isActive === false) return;

    const stock = toNumber(product.stock);
    const threshold = Math.max(0, toNumber(product.lowStockThreshold, 5));

    if (stock <= 0) {
      alerts.push({
        id: `${product.id}-stock-out`,
        productId: product.id,
        productName: product.name || "Unnamed product",
        kind: "stock",
        level: "danger",
        title: "Out of stock",
        message: "Stock has reached zero and needs replenishment.",
        stock,
        threshold,
      });
    } else if (stock <= threshold) {
      alerts.push({
        id: `${product.id}-stock-low`,
        productId: product.id,
        productName: product.name || "Unnamed product",
        kind: "stock",
        level: "warning",
        title: `Low stock · ${stock} left`,
        message: `Alert threshold is ${threshold}.`,
        stock,
        threshold,
      });
    }

    const expiryAlert = getExpiryStatus(product, now, options);
    if (expiryAlert) {
      alerts.push({
        id: `${product.id}-expiry`,
        productId: product.id,
        productName: product.name || "Unnamed product",
        ...expiryAlert,
      });
    }
  });

  return alerts.sort((a, b) => {
    const levelDiff = severityOrder[a.level] - severityOrder[b.level];
    if (levelDiff !== 0) return levelDiff;

    if (a.kind !== b.kind) {
      return a.kind === "expiry" ? -1 : 1;
    }

    const aDays = Number.isFinite(a.daysLeft)
      ? a.daysLeft
      : Number.POSITIVE_INFINITY;
    const bDays = Number.isFinite(b.daysLeft)
      ? b.daysLeft
      : Number.POSITIVE_INFINITY;
    return aDays - bDays;
  });
}

export function getProductHealth(product, options = {}) {
  const alerts = getProductAlerts([product], options);
  const first = alerts[0];
  if (!first) {
    return { label: "Healthy", variant: "success", alert: null };
  }

  return {
    label: first.title,
    variant: first.level,
    alert: first,
  };
}
