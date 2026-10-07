import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { db } from "../config/firebase";

let unsub = null;

const useCustomerStore = create((set) => ({
  customers: [],
  loading: true,

  subscribe: (storeId) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      set({ customers: [], loading: false });
      return;
    }
    if (unsub) unsub();
    set({ loading: true });
    const q = query(
      collection(db, "stores", storeId, "customers"),
      orderBy("name"),
    );
    unsub = onSnapshot(
      q,
      (snap) => {
        set({
          customers: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          loading: false,
        });
      },
      () => set({ loading: false }),
    );
  },

  cleanup: () => {
    if (unsub) unsub();
    unsub = null;
    set({ customers: [], loading: false });
  },

  addCustomer: async (storeId, data) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    await setDoc(doc(db, "stores", storeId, "customers", id), {
      id,
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      loyaltyPoints: Number(data.loyaltyPoints) || 0,
      totalSpent: Number(data.totalSpent) || 0,
      currentCredit: Number(data.currentCredit) || 0,
      creditLimit: Number(data.creditLimit) || 0,
      lastPurchase: data.lastPurchase || null,
      isActive: data?.isActive !== false,
      createdAt: now,
      updatedAt: now,
    });
  },

  updateCustomer: async (storeId, customerId, data) => {
    await updateDoc(doc(db, "stores", storeId, "customers", customerId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  deleteCustomer: async (storeId, customerId, soft = true) => {
    const ref = doc(db, "stores", storeId, "customers", customerId);
    if (soft) {
      await updateDoc(ref, {
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(ref);
    }
  },

  setCustomerActive: async (storeId, customerId, isActive) => {
    await updateDoc(doc(db, "stores", storeId, "customers", customerId), {
      isActive: Boolean(isActive),
      updatedAt: new Date().toISOString(),
    });
  },

  redeemPoints: async (storeId, customerId, points) => {
    const refDoc = doc(db, "stores", storeId, "customers", customerId);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) return;
    const cur = Number(snap.data().loyaltyPoints) || 0;
    await updateDoc(refDoc, {
      loyaltyPoints: Math.max(0, cur - Number(points)),
    });
  },

  /**
   * Record an udhaar (credit) payment received from a customer.
   *
   * - Reduces `customers/{id}.currentCredit` (clamped at 0).
   * - Appends a `udhaarLedgers/{id}` entry with `direction: "credit"` and
   *   `type: "payment_received"` so the ledger remains the source of truth.
   * - Runs in a Firestore transaction so balance and ledger are consistent.
   *
   * @param {string} storeId
   * @param {string} customerId
   * @param {object} payload
   *   - amount (required)         number > 0
   *   - paymentMethod             "cash" | "jazzcash" | "easypaisa" | "raast" | "card" | "bank"
   *   - reference                 free-text reference / transaction ID
   *   - notes                     free-text note
   *   - receivedBy                user uid recording the payment
   *   - receivedByName            display name of that user
   */
  receiveUdhaarPayment: async (storeId, customerId, payload) => {
    const amount = Number(payload?.amount) || 0;
    if (!storeId || !customerId) throw new Error("Missing store or customer");
    if (amount <= 0) throw new Error("Payment amount must be greater than 0");

    const now = new Date().toISOString();
    const ledgerId = uuidv4();
    let settledAmount = 0;
    let newBalance = 0;

    await runTransaction(db, async (transaction) => {
      const cref = doc(db, "stores", storeId, "customers", customerId);
      const snap = await transaction.get(cref);
      if (!snap.exists()) throw new Error("Customer not found");

      const data = snap.data();
      const currentCredit = Number(data.currentCredit) || 0;
      settledAmount = Math.min(amount, currentCredit);
      if (settledAmount <= 0) {
        throw new Error("Customer has no outstanding udhaar to settle");
      }
      newBalance = Math.max(0, currentCredit - settledAmount);

      transaction.update(cref, {
        currentCredit: newBalance,
        lastUdhaarPaymentAt: now,
        ...(newBalance === 0 ? { firstUnpaidDate: null } : {}),
        updatedAt: now,
      });

      transaction.set(
        doc(db, "stores", storeId, "udhaarLedgers", ledgerId),
        {
          id: ledgerId,
          customerId,
          customerName: data.name || "",
          type: "payment_received",
          direction: "credit",
          amount: settledAmount,
          balanceAfter: newBalance,
          paymentMethod: payload?.paymentMethod || "cash",
          reference: payload?.reference || "",
          notes: payload?.notes || "",
          receivedBy: payload?.receivedBy || "",
          receivedByName: payload?.receivedByName || "",
          createdAt: now,
        },
      );
    });

    return { ledgerId, settledAmount, newBalance };
  },
}));

export default useCustomerStore;
