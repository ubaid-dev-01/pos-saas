import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { db } from "../config/firebase";

let unsub = null;

const DEFAULT_STATUS = "good";

function normalizeBatchInput(payload = {}) {
  const qty = Math.max(0, Number(payload.initialQuantity) || 0);
  const reserved = Math.max(0, Number(payload.reservedQuantity) || 0);
  return {
    productId: payload.productId || "",
    productName: payload.productName || "",
    batchNumber: payload.batchNumber || `B-${Date.now()}`,
    lotNumber: payload.lotNumber || "",
    sourceType: payload.sourceType || "opening_stock",
    sourceId: payload.sourceId || null,
    supplierId: payload.supplierId || "",
    supplierName: payload.supplierName || "",
    manufacturingDate: payload.manufacturingDate || null,
    expiryDate: payload.expiryDate || null,
    receivedDate: payload.receivedDate || new Date().toISOString().slice(0, 10),
    initialQuantity: qty,
    currentQuantity: qty,
    reservedQuantity: reserved,
    availableQuantity: Math.max(0, qty - reserved),
    damagedQuantity: Math.max(0, Number(payload.damagedQuantity) || 0),
    returnedToSupplier: Math.max(0, Number(payload.returnedToSupplier) || 0),
    unitCostPrice: Math.max(0, Number(payload.unitCostPrice) || 0),
    qualityStatus: payload.qualityStatus || "passed",
    expiryStatus: payload.expiryStatus || DEFAULT_STATUS,
    daysUntilExpiry: Number(payload.daysUntilExpiry) || null,
    isActive: payload.isActive !== false,
    isExpired: payload.isExpired === true,
    isBlocked: payload.isBlocked === true,
    blockReason: payload.blockReason || null,
  };
}

const useBatchStore = create((set) => ({
  batches: [],
  loading: true,

  subscribeBatches: (storeId, productId = null) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      set({ batches: [], loading: false });
      return;
    }

    if (unsub) unsub();
    set({ loading: true });

    const base = collection(db, "stores", storeId, "productBatches");
    const q = productId
      ? query(
          base,
          where("productId", "==", productId),
          orderBy("receivedDate", "asc"),
          limit(500),
        )
      : query(base, orderBy("receivedDate", "desc"), limit(500));

    unsub = onSnapshot(
      q,
      (snap) => {
        set({
          batches: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          loading: false,
        });
      },
      () => set({ loading: false }),
    );
  },

  cleanup: () => {
    if (unsub) unsub();
    unsub = null;
    set({ batches: [], loading: false });
  },

  addBatch: async (storeId, payload) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const normalized = normalizeBatchInput(payload);

    await setDoc(doc(db, "stores", storeId, "productBatches", id), {
      id,
      ...normalized,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },

  updateBatch: async (storeId, batchId, patch) => {
    await updateDoc(doc(db, "stores", storeId, "productBatches", batchId), {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  },

  bulkBlockExpired: async (storeId, batchIds = [], reason = "Expired") => {
    if (!batchIds.length) return;
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    batchIds.forEach((batchId) => {
      batch.update(doc(db, "stores", storeId, "productBatches", batchId), {
        isBlocked: true,
        isExpired: true,
        blockReason: reason,
        updatedAt: now,
      });
    });
    await batch.commit();
  },
}));

export default useBatchStore;
