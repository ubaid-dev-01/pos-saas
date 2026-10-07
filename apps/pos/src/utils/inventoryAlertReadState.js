const PREFIX = "quickpos.inventoryAlertSeen";

function storageKey(storeId) {
  return `${PREFIX}:${storeId || "global"}`;
}

function readMap(storeId) {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(storageKey(storeId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(storeId, map) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey(storeId), JSON.stringify(map || {}));
  } catch {
    // Ignore storage write errors.
  }
}

export function isInventoryAlertSeen(storeId, alertId) {
  if (!alertId) return false;
  const map = readMap(storeId);
  return Boolean(map[alertId]);
}

export function markInventoryAlertSeen(storeId, alertId) {
  if (!alertId) return;
  const map = readMap(storeId);
  map[alertId] = true;
  writeMap(storeId, map);
}

export function markAllInventoryAlertsSeen(storeId, alertIds = []) {
  const map = readMap(storeId);
  alertIds.forEach((id) => {
    if (id) map[id] = true;
  });
  writeMap(storeId, map);
}

export function getInventoryAlertSeenMap(storeId) {
  return readMap(storeId);
}
