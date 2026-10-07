import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { db } from "../config/firebase";

let unsub = null;

const useCashSessionStore = create((set, get) => ({
  session: null,
  loading: true,

  subscribe: (storeId) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      set({ session: null, loading: false });
      return;
    }
    if (unsub) unsub();
    set({ loading: true });
    const q = query(
      collection(db, "stores", storeId, "cashRegisterSessions"),
      where("status", "==", "open"),
      limit(1),
    );
    unsub = onSnapshot(
      q,
      (snap) => {
        const doc0 = snap.docs[0];
        set({
          session: doc0 ? { id: doc0.id, ...doc0.data() } : null,
          loading: false,
        });
      },
      () => set({ loading: false }),
    );
  },

  cleanup: () => {
    if (unsub) unsub();
    unsub = null;
    set({ session: null, loading: false });
  },

  openSession: async (storeId, { cashierId, cashierName, openingCash, registerName }) => {
    const existing = get().session;
    if (existing) throw new Error("A cash session is already open");

    const id = uuidv4();
    const now = new Date().toISOString();
    const session = {
      id,
      registerName: registerName || "Counter 1",
      cashierId,
      cashierName,
      openedAt: now,
      closedAt: null,
      openingCash: Number(openingCash) || 0,
      totalSales: 0,
      totalSalesAmount: 0,
      totalReturns: 0,
      totalReturnsAmount: 0,
      cashSales: 0,
      cardSales: 0,
      digitalSales: 0,
      udhaarSales: 0,
      otherSales: 0,
      expectedCash: Number(openingCash) || 0,
      actualCash: null,
      cashDifference: null,
      differenceReason: null,
      closingNotes: null,
      status: "open",
      createdAt: now,
    };
    await setDoc(doc(db, "stores", storeId, "cashRegisterSessions", id), session);
    return session;
  },

  closeSession: async (storeId, sessionId, { actualCash, differenceReason, closingNotes }) => {
    const ref = doc(db, "stores", storeId, "cashRegisterSessions", sessionId);
    const snap = await getDoc(ref);
    const data = snap.data();
    if (!snap.exists() || !data) throw new Error("Session not found");

    const expected = Number(data.expectedCash) || 0;
    const actual = Number(actualCash) || 0;
    const now = new Date().toISOString();

    await updateDoc(ref, {
      closedAt: now,
      actualCash: actual,
      cashDifference: actual - expected,
      differenceReason: differenceReason || null,
      closingNotes: closingNotes || null,
      status: "closed",
    });
  },

  recordSaleInSession: async (storeId, sessionId, { paymentMethod, paymentDetails, grandTotal }) => {
    const ref = doc(db, "stores", storeId, "cashRegisterSessions", sessionId);
    const session = get().session;
    if (!session || session.id !== sessionId) return;

    const total = Number(grandTotal) || 0;
    const cashPart =
      paymentMethod === "cash"
        ? total
        : paymentMethod === "split"
          ? Number(paymentDetails?.cash) || 0
          : paymentMethod === "udhaar" && paymentDetails?.partialCash
            ? Number(paymentDetails.partialCash) || 0
            : 0;
    const cardPart =
      paymentMethod === "card"
        ? total
        : paymentMethod === "split"
          ? Number(paymentDetails?.card) || 0
          : 0;
    const digitalPart =
      ["jazzcash", "easypaisa", "raast"].includes(paymentMethod)
        ? total
        : paymentMethod === "split"
          ? Number(paymentDetails?.digital) || 0
          : 0;
    const udhaarPart =
      paymentMethod === "udhaar"
        ? Number(paymentDetails?.udhaarAmount) || total
        : paymentMethod === "split"
          ? Number(paymentDetails?.udhaar) || 0
          : 0;

    await updateDoc(ref, {
      totalSales: (Number(session.totalSales) || 0) + 1,
      totalSalesAmount: (Number(session.totalSalesAmount) || 0) + total,
      cashSales: (Number(session.cashSales) || 0) + cashPart,
      cardSales: (Number(session.cardSales) || 0) + cardPart,
      digitalSales: (Number(session.digitalSales) || 0) + digitalPart,
      udhaarSales: (Number(session.udhaarSales) || 0) + udhaarPart,
      expectedCash: (Number(session.expectedCash) || 0) + cashPart,
    });
  },
}));

export default useCashSessionStore;
