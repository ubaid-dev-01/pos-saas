export const RBAC_SECTIONS = [
  "pos",
  "products",
  "inventory",
  "transactions",
  "reports",
  "customers",
  "settings",
];

export function checkPermission(userDoc, store, section) {
  if (!userDoc || !section) return false;

  if (userDoc.role === "superadmin") return true;
  if (!store) return false;

  const storeAllows = store.menuConfig?.[section] !== false;
  const userAllows = userDoc.permissions?.[section] !== false;

  return Boolean(storeAllows && userAllows);
}

export function hasAdminAccess(userDoc) {
  return userDoc?.role === "superadmin" || userDoc?.role === "admin";
}
