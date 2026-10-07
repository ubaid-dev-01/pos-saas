import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../config/firebase";

let unsub = null;

const useStockMovementStore = create((set) => ({
  movements: [],
  loading: true,

  subscribe: (storeId, productId = null) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      set({ movements: [], loading: false });
      return;
    }

    if (unsub) unsub();
    set({ loading: true });

    const base = collection(db, "stores", storeId, "stockMovements");
    const q = productId
      ? query(
          base,
          where("productId", "==", productId),
          orderBy("timestamp", "desc"),
          limit(500),
        )
      : query(base, orderBy("timestamp", "desc"), limit(500));

    unsub = onSnapshot(
      q,
      (snap) => {
        set({
          movements: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          loading: false,
        });
      },
      () => set({ loading: false }),
    );
  },

  cleanup: () => {
    if (unsub) unsub();
    unsub = null;
    set({ movements: [], loading: false });
  },
}));

export default useStockMovementStore;
