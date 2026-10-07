import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { db } from "../config/firebase";

let unsub = null;

const useSupplierStore = create((set) => ({
  suppliers: [],
  loading: true,

  subscribeSuppliers: (storeId) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      set({ suppliers: [], loading: false });
      return;
    }

    if (unsub) unsub();
    set({ loading: true });
    const q = query(
      collection(db, "stores", storeId, "suppliers"),
      orderBy("name"),
    );

    unsub = onSnapshot(
      q,
      (snap) => {
        set({
          suppliers: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          loading: false,
        });
      },
      () => set({ loading: false }),
    );
  },

  cleanup: () => {
    if (unsub) unsub();
    unsub = null;
    set({ suppliers: [], loading: false });
  },

  addSupplier: async (storeId, payload) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    await setDoc(doc(db, "stores", storeId, "suppliers", id), {
      id,
      name: (payload.name || "").trim(),
      contactNumber: (payload.contactNumber || "").trim(),
      email: (payload.email || "").trim(),
      location: (payload.location || "").trim(),
      address: (payload.address || "").trim(),
      notes: (payload.notes || "").trim(),
      isActive: payload.isActive !== false,
      createdAt: now,
      updatedAt: now,
    });
  },

  updateSupplier: async (storeId, supplierId, payload) => {
    await updateDoc(doc(db, "stores", storeId, "suppliers", supplierId), {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
  },

  deleteSupplier: async (storeId, supplierId, soft = true) => {
    const ref = doc(db, "stores", storeId, "suppliers", supplierId);
    if (soft) {
      await updateDoc(ref, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(ref);
    }
  },

  setSupplierActive: async (storeId, supplierId, isActive) => {
    await updateDoc(doc(db, "stores", storeId, "suppliers", supplierId), {
      isActive: Boolean(isActive),
      updatedAt: new Date().toISOString(),
    });
  },
}));

export default useSupplierStore;
