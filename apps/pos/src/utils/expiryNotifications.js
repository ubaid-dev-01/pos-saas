import { getProductAlerts } from "./productAlerts";

const STORAGE_KEY = "quickpos-expiry-notified";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function readSentMap() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSentMap(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

function alertKey(storeId, alert) {
  return `${storeId}:${alert.productId}:expiry:${alert.daysLeft}`;
}

export function shouldNotify(storeId, alert) {
  const map = readSentMap();
  const key = alertKey(storeId, alert);
  const last = map[key] || 0;
  return Date.now() - last > COOLDOWN_MS;
}

export function markNotified(storeId, alerts) {
  const map = readSentMap();
  const now = Date.now();
  alerts.forEach((a) => {
    map[alertKey(storeId, a)] = now;
  });
  writeSentMap(map);
}

export function getExpiryAlertsFromProducts(products, options = {}) {
  return getProductAlerts(products, options).filter((a) => a.kind === "expiry");
}

export async function requestBrowserNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function showBrowserExpiryNotification({ storeName, items }) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted" || !items.length) return;

  const first = items[0];
  const title =
    items.length === 1
      ? `Expiry: ${first.productName}`
      : `${items.length} products expiring soon`;
  const body =
    items.length === 1
      ? first.message
      : items
          .slice(0, 3)
          .map((i) => `${i.productName}   ${i.title}`)
          .join(" · ");

  try {
    const n = new Notification(title, {
      body,
      icon: "/favicon.svg",
      tag: `quickpos-expiry-${Date.now()}`,
    });
    n.onclick = () => {
      window.focus();
      window.location.href = "/inventory";
      n.close();
    };
  } catch {
    /* ignore */
  }
}
