import { create } from "zustand";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase";

let unsub = null;

function normalizeMovement(docData) {
  if (typeof docData?.change === "number") return docData;
  const previousStock = Number(docData?.previousStock) || 0;
  const newStock = Number(docData?.newStock) || 0;
  return {
    ...docData,
    previousStock,
    newStock,
    change: newStock - previousStock,
    reason: docData?.reason || docData?.type || "Stock update",
  };
}

const useInventoryStore = create((set) => ({
  logs: [],
  loading: true,

  subscribe: (storeId) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      set({ logs: [], loading: false });
      return;
    }
    if (unsub) unsub();
    set({ loading: true });
    const q = query(
      collection(db, "stores", storeId, "stockMovements"),
      orderBy("timestamp", "desc"),
      limit(500),
    );
    unsub = onSnapshot(
      q,
      (snap) =>
        set({
          logs: snap.docs.map((d) => normalizeMovement({ id: d.id, ...d.data() })),
          loading: false,
        }),
      () => set({ loading: false }),
    );
  },

  cleanup: () => {
    if (unsub) unsub();
    unsub = null;
    set({ logs: [], loading: false });
  },
}));

export default useInventoryStore;
