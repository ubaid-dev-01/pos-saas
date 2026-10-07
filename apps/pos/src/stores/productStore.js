import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
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
import { uploadImageToCloudinary } from "../utils/cloudinary";
import useAlertStore from "./alertStore";

async function uploadToFirebase(file, path) {
  return uploadImageToCloudinary(file, { folder: path });
}

let unsub = null;

function productsCol(storeId) {
  return collection(db, "stores", storeId, "products");
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseBoolean(value, fallback = true) {
  if (value == null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (["false", "0", "no", "n", "off"].includes(text)) return false;
  if (["true", "1", "yes", "y", "on"].includes(text)) return true;
  return fallback;
}

function normalizeBarcode(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

function hasDuplicateBarcodeInState(products, barcode, ignoreProductId = null) {
  if (!barcode) return false;
  return products.some((product) => {
    if (ignoreProductId && product.id === ignoreProductId) return false;
    return normalizeBarcode(product.barcode) === barcode;
  });
}

async function assertUniqueBarcode(storeId, barcode, ignoreProductId = null) {
  if (!barcode) return;

  const stateProducts = useProductStore.getState().products || [];
  if (hasDuplicateBarcodeInState(stateProducts, barcode, ignoreProductId)) {
    throw new Error("Barcode/QR already exists. Please use a unique code.");
  }

  const dupQuery = query(
    collection(db, "stores", storeId, "products"),
    where("barcode", "==", barcode),
    limit(2),
  );
  const dupSnap = await getDocs(dupQuery);
  const hasDup = dupSnap.docs.some((d) => d.id !== ignoreProductId);
  if (hasDup) {
    throw new Error("Barcode/QR already exists. Please use a unique code.");
  }
}

function normalizeProductInput(data = {}) {
  return {
    barcode: normalizeBarcode(data.barcode),
    name: data.name || "",
    description: data.description || "",
    category: data.category || "",
    price: toNumber(data.price),
    costPrice: toNumber(data.costPrice),
    wholesalePrice: toNumber(data.wholesalePrice, toNumber(data.price)),
    unit: data.unit || "pcs",
    stock: toNumber(data.stock),
    lowStockThreshold: toNumber(data.lowStockThreshold, 5),
    expiryDate: data.expiryDate || "",
    expiryWarningDays: toNumber(data.expiryWarningDays, 90),
    taxRate: toNumber(data.taxRate),
    batchNumber: data.batchNumber || "",
    lastRestockDate: data.lastRestockDate || "",
    storageLocation: data.storageLocation || "",
    supplierId: data.supplierId || "",
    supplierName: data.supplierName || "",
    supplierContact: data.supplierContact || "",
    supplierEmail: data.supplierEmail || "",
    supplierLocation: data.supplierLocation || "",
    isActive: parseBoolean(data.isActive, true),
  };
}

const useProductStore = create((set) => ({
  products: [],
  loading: true,

  subscribeProducts: (storeId) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      set({ products: [], loading: false });
      return;
    }
    if (unsub) unsub();
    set({ loading: true });
    const q = query(productsCol(storeId), orderBy("name"));
    unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        set({ products: list, loading: false });
      },
      () => set({ loading: false }),
    );
  },

  cleanup: () => {
    if (unsub) unsub();
    unsub = null;
    set({ products: [], loading: false });
  },

  addProduct: async (storeId, data, imageFiles = []) => {
    const id = uuidv4();
    const images = [];
    for (let i = 0; i < imageFiles.length; i += 1) {
      const file = imageFiles[i];
      const path = `stores/${storeId}/products/${id}/${uuidv4()}-${file.name}`;
      try {
        const url = await uploadToFirebase(file, path);
        images.push(url);
      } catch (e) {
        // Keep product creation functional even when optional media upload is blocked.
        console.warn("Image upload skipped:", e?.message || e);
      }
    }
    const sku = data.sku || `PRD-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toISOString();
    const payload = normalizeProductInput(data);
    await assertUniqueBarcode(storeId, payload.barcode);
    await setDoc(doc(db, "stores", storeId, "products", id), {
      id,
      sku,
      ...payload,
      images,
      createdAt: now,
      updatedAt: now,
    });
  },

  updateProduct: async (
    storeId,
    productId,
    patch,
    imageFiles = [],
    existingImages = [],
  ) => {
    try {
      const refDoc = doc(db, "stores", storeId, "products", productId);
      const payload = normalizeProductInput(patch);
      await assertUniqueBarcode(storeId, payload.barcode, productId);
      const newUrls = [];
      for (let i = 0; i < imageFiles.length; i += 1) {
        const file = imageFiles[i];
        const path = `stores/${storeId}/products/${productId}/${uuidv4()}-${file.name}`;
        try {
          const url = await uploadToFirebase(file, path);
          newUrls.push(url);
        } catch (e) {
          // Keep product edits functional even when optional media upload is blocked.
          console.warn("Image upload skipped:", e?.message || e);
        }
      }
      const images = [...(existingImages || []), ...newUrls];
      await updateDoc(refDoc, {
        ...payload,
        images,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("updateProduct error:", e);
      throw e;
    }
  },

  deleteProduct: async (storeId, productId, soft = true) => {
    if (soft) {
      await updateDoc(doc(db, "stores", storeId, "products", productId), {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(doc(db, "stores", storeId, "products", productId));
    }
  },

  setProductActive: async (storeId, productId, isActive) => {
    await updateDoc(doc(db, "stores", storeId, "products", productId), {
      isActive: Boolean(isActive),
      updatedAt: new Date().toISOString(),
    });
  },

  bulkDelete: async (storeId, productIds) => {
    const batch = writeBatch(db);
    productIds.forEach((pid) => {
      batch.update(doc(db, "stores", storeId, "products", pid), {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  },

  bulkPriceUpdate: async (storeId, productIds, type, value) => {
    const batch = writeBatch(db);
    const v = Number(value) || 0;
    const { products } = useProductStore.getState();
    productIds.forEach((pid) => {
      const p = products.find((x) => x.id === pid);
      if (!p) return;
      let next = Number(p.price) || 0;
      if (type === "increase_pct") next *= 1 + v / 100;
      else if (type === "decrease_pct") next *= 1 - v / 100;
      else if (type === "increase_fixed") next += v;
      else if (type === "decrease_fixed") next -= v;
      batch.update(doc(db, "stores", storeId, "products", pid), {
        price: Math.max(0, Math.round(next * 100) / 100),
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  },

  adjustStock: async (storeId, productId, payload, userId) => {
    const { type, quantity, reason, notes } = payload;
    const refDoc = doc(db, "stores", storeId, "products", productId);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) throw new Error("Product not found");
    const prev = Number(snap.data().stock) || 0;
    const q = Math.max(0, Number(quantity) || 0);
    const delta = type === "remove" ? -q : q;
    const newStock = Math.max(0, prev + delta);
    const logId = uuidv4();
    const batch = writeBatch(db);
    batch.update(refDoc, {
      stock: newStock,
      updatedAt: new Date().toISOString(),
    });
    const movementId = uuidv4();
    batch.set(doc(db, "stores", storeId, "stockMovements", movementId), {
      id: movementId,
      movementNumber: `SM-${Date.now()}`,
      productId,
      productName: snap.data().name,
      sku: snap.data().sku || "",
      batchId: null,
      batchNumber: null,
      type: type === "remove" ? "adjustment_remove" : "adjustment_add",
      direction: type === "remove" ? "out" : "in",
      quantity: q,
      previousStock: prev,
      newStock,
      unitCost: Number(snap.data().costPrice) || 0,
      totalCost: Math.round((Number(snap.data().costPrice) || 0) * q * 100) / 100,
      source: "adjustment",
      sourceId: null,
      sourceNumber: null,
      reason: reason || "correction",
      notes: notes || "",
      performedBy: userId || "",
      performedByName: "",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    batch.set(doc(db, "stores", storeId, "inventoryLogs", logId), {
      id: logId,
      productId,
      productName: snap.data().name,
      previousStock: prev,
      newStock,
      change: newStock - prev,
      reason: reason || "Correction",
      notes: notes || "",
      referenceId: null,
      userId: userId || "",
      timestamp: new Date().toISOString(),
    });
    await batch.commit();

    const threshold = Number(snap.data().lowStockThreshold || 0);
    if (threshold > 0 && prev > threshold && newStock <= threshold) {
      await useAlertStore.getState().addAlert(storeId, {
        title: "Low Stock Alert",
        message: `${snap.data().name} has dropped to ${newStock}. Threshold is ${threshold}.`,
        type: "warning",
        actionUrl: "/products",
      });

      // Fire-and-forget stock email to store inbox
      try {
        const [{ sendLowStockAlertEmail }, { default: useAuthStore }] =
          await Promise.all([
            import("../services/emailService"),
            import("./authStore"),
          ]);
        const store = useAuthStore.getState().store;
        const to = store?.email || useAuthStore.getState().user?.email || "";
        if (to) {
          void sendLowStockAlertEmail({
            to,
            storeName: store?.name || "Your store",
            items: [
              {
                productName: snap.data().name,
                sku: snap.data().sku || snap.data().barcode || "",
                stock: newStock,
              },
            ],
          }).catch(() => null);
        }
      } catch {
        /* email optional */
      }
    }
  },

  bulkImportProducts: async (storeId, rows = []) => {
    const existingProducts = useProductStore.getState().products || [];
    const now = new Date().toISOString();
    const chunkSize = 400;

    for (let start = 0; start < rows.length; start += chunkSize) {
      const batch = writeBatch(db);
      const chunk = rows.slice(start, start + chunkSize);

      chunk.forEach((row) => {
        const normalized = normalizeProductInput(row);
        const byId = row.id
          ? existingProducts.find((product) => product.id === row.id)
          : null;
        const bySku = row.sku
          ? existingProducts.find((product) => product.sku === row.sku)
          : null;
        const byBarcode = row.barcode
          ? existingProducts.find(
              (product) =>
                (product.barcode || "").trim() === String(row.barcode).trim(),
            )
          : null;
        const existing = byId || bySku || byBarcode || null;
        const id = existing?.id || row.id || uuidv4();
        const normalizedBarcode = normalizeBarcode(normalized.barcode);
        if (
          normalizedBarcode &&
          hasDuplicateBarcodeInState(existingProducts, normalizedBarcode, id)
        ) {
          return;
        }
        const createdAt = existing?.createdAt || now;
        const images = existing?.images || [];

        batch.set(doc(db, "stores", storeId, "products", id), {
          id,
          sku:
            row.sku ||
            existing?.sku ||
            `PRD-${Date.now().toString(36).toUpperCase()}`,
          ...normalized,
          images,
          createdAt,
          updatedAt: now,
        });
      });

      await batch.commit();
    }
  },
}));

export default useProductStore;
