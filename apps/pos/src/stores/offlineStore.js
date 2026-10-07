import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import {
  countOfflineSales,
  enqueueOfflineSale,
  listOfflineSales,
  removeOfflineSale,
} from "../utils/offlineQueue";
import useTransactionStore from "./transactionStore";

const useOfflineStore = create((set, get) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  pendingCount: 0,
  syncing: false,

  init: () => {
    const updateOnline = () => {
      const online = navigator.onLine;
      set({ isOnline: online });
      if (online) get().syncPending();
    };
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    get().refreshCount();
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  },

  refreshCount: async () => {
    try {
      const pendingCount = await countOfflineSales();
      set({ pendingCount });
    } catch {
      set({ pendingCount: 0 });
    }
  },

  queueSale: async (storeId, payload) => {
    const id = uuidv4();
    await enqueueOfflineSale({
      id,
      storeId,
      payload,
    });
    await get().refreshCount();
    return { queued: true, queueId: id };
  },

  syncPending: async () => {
    if (get().syncing || !get().isOnline) return { synced: 0, failed: 0 };
    set({ syncing: true });
    let synced = 0;
    let failed = 0;
    try {
      const pending = await listOfflineSales();
      const { createTransaction } = useTransactionStore.getState();
      for (const entry of pending) {
        try {
          await createTransaction(entry.storeId, {
            ...entry.payload,
            offlineQueueId: entry.id,
          });
          await removeOfflineSale(entry.id);
          synced += 1;
        } catch {
          failed += 1;
        }
      }
      await get().refreshCount();
    } finally {
      set({ syncing: false });
    }
    return { synced, failed };
  },
}));

export default useOfflineStore;
