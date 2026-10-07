import { collection, onSnapshot, query } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../config/firebase";

let unsub = null;
let hasBootstrappedAlerts = false;
let unseenIds = new Set();

function createdAtMs(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

const useAlertStore = create((set) => ({
  alerts: [],
  loading: false,

  subscribe: (storeId) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      hasBootstrappedAlerts = false;
      unseenIds = new Set();
      set({ alerts: [], loading: false });
      return;
    }

    if (unsub) unsub();
    hasBootstrappedAlerts = false;
    unseenIds = new Set();
    set({ loading: true });

    const q = query(collection(db, "stores", storeId, "alerts"));

    unsub = onSnapshot(
      q,
      (snap) => {
        const nextAlerts = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((a) => a.deleted !== true)
          .sort((a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt));

        const nextUnseen = new Set(
          nextAlerts.filter((a) => !a.seen).map((a) => a.id),
        );

        if (hasBootstrappedAlerts) {
          const hasIncoming = [...nextUnseen].some((id) => !unseenIds.has(id));
          if (hasIncoming) {
            playAlertSound();
          }
        }

        hasBootstrappedAlerts = true;
        unseenIds = nextUnseen;

        set({
          alerts: nextAlerts,
          loading: false,
        });
      },
      () => set({ loading: false }),
    );
  },

  unsubscribe: () => {
    if (unsub) unsub();
    unsub = null;
    hasBootstrappedAlerts = false;
    unseenIds = new Set();
  },

  addAlert: async (
    storeId,
    { title, message, type = "info", actionUrl = null },
  ) => {
    try {
      const alertsRef = collection(db, "stores", storeId, "alerts");
      const { addDoc, serverTimestamp } = await import("firebase/firestore");

      await addDoc(alertsRef, {
        title,
        message,
        type, // info, warning, danger, success
        actionUrl,
        seen: false,
        createdAt: serverTimestamp(),
        deleted: false,
      });

      // Play sound notification
      playAlertSound();
    } catch (error) {
      console.error("Error adding alert:", error);
    }
  },

  markAsSeen: async (storeId, alertId) => {
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "stores", storeId, "alerts", alertId), {
        seen: true,
      });
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, seen: true } : a,
        ),
      }));
    } catch (error) {
      console.error("Error marking alert as seen:", error);
    }
  },

  markAllAsSeen: async (storeId) => {
    try {
      const { doc, updateDoc, getDocs, query, collection, where } =
        await import("firebase/firestore");
      const q = query(
        collection(db, "stores", storeId, "alerts"),
        where("seen", "==", false),
      );
      const snap = await getDocs(q);

      for (const docSnap of snap.docs) {
        if (docSnap.data()?.deleted === true) continue;
        await updateDoc(doc(db, "stores", storeId, "alerts", docSnap.id), {
          seen: true,
        });
      }

      set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, seen: true })),
      }));
    } catch (error) {
      console.error("Error marking all alerts as seen:", error);
    }
  },

  deleteAlert: async (storeId, alertId) => {
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "stores", storeId, "alerts", alertId), {
        deleted: true,
      });
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== alertId),
      }));
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  },

  getUnseenCount: () => {
    // This will be used by the hook
    return 0;
  },
}));

export function playAlertSound() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error("Error playing alert sound:", error);
  }
}

export default useAlertStore;
