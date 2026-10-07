/**
 * FBR (Federal Board of Revenue) invoice helpers.
 * Production integration will call PRAL/FBR APIs; this module prepares
 * compliant payload structure and QR display for receipts.
 */

import { t as translate } from "./i18n";

export const FBR_STATUS = {
  PENDING: "pending",
  SYNCED: "synced",
  QUEUED: "queued_offline",
  FAILED: "failed",
  EXEMPT: "exempt",
};

export function isFbrEnabled(store) {
  return Boolean(store?.fbrConfig?.enabled);
}

export function buildFbrPayload({ invoiceNo, date, store, items, grandTotal, customerName }) {
  return {
    sellerNTN: store?.fbrConfig?.ntn || store?.gstNumber || "",
    sellerName: store?.name || "",
    invoiceNumber: invoiceNo,
    invoiceDate: date,
    buyerName: customerName || "Walk-in Customer",
    totalAmount: Number(grandTotal) || 0,
    taxAmount: items?.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0) || 0,
    itemCount: items?.length || 0,
    posId: store?.fbrConfig?.posId || "",
    fbrVersion: "1.0",
  };
}

export function fbrQrImageUrl(payload) {
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encoded}`;
}

const FBR_STATUS_KEYS = {
  pending: "fbr.pending",
  synced: "fbr.synced",
  queued_offline: "fbr.queuedOffline",
  failed: "fbr.failed",
  exempt: "fbr.exempt",
};

export function fbrStatusLabel(status, t) {
  const key = FBR_STATUS_KEYS[status];
  if (key) {
    const tr = typeof t === "function" ? t : translate;
    return tr(key);
  }
  return status;
}

export function resolveInitialFbrStatus(store, isOnline) {
  if (!isFbrEnabled(store)) return FBR_STATUS.EXEMPT;
  return isOnline ? FBR_STATUS.PENDING : FBR_STATUS.QUEUED;
}
