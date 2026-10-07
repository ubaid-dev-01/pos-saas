import { format } from "date-fns";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { db } from "../config/firebase";
import { normalizeOptionalCustomerName } from "../utils/customerName";
import {
  buildFbrPayload,
  FBR_STATUS,
  isFbrEnabled,
  resolveInitialFbrStatus,
} from "../utils/fbr";
import { computeSaleTotals } from "../utils/posTotals";

let unsub = null;

function invoiceNo(counter) {
  const d = format(new Date(), "yyyyMMdd");
  return `INV-${d}-${String(counter).padStart(4, "0")}`;
}

function movementNo() {
  const d = format(new Date(), "yyyyMMdd");
  return `SM-${d}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function udhaarAmountFromPayment(paymentMethod, paymentDetails, grandTotal) {
  const total = Number(grandTotal) || 0;
  if (paymentMethod === "udhaar") {
    return Number(paymentDetails?.udhaarAmount) || total;
  }
  if (paymentMethod === "split") {
    return Number(paymentDetails?.udhaar) || 0;
  }
  return 0;
}

const useTransactionStore = create((set) => ({
  transactions: [],
  loading: true,

  subscribe: (storeId) => {
    if (!storeId) {
      if (unsub) unsub();
      unsub = null;
      set({ transactions: [], loading: false });
      return;
    }
    if (unsub) unsub();
    set({ loading: true });
    const q = query(
      collection(db, "stores", storeId, "transactions"),
      orderBy("date", "desc"),
      limit(400),
    );
    unsub = onSnapshot(
      q,
      (snap) => {
        set({
          transactions: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
          loading: false,
        });
      },
      () => set({ loading: false }),
    );
  },

  cleanup: () => {
    if (unsub) unsub();
    unsub = null;
    set({ transactions: [], loading: false });
  },

  createTransaction: async (storeId, payload) => {
    const {
      items,
      discount,
      saleType,
      customer,
      cashierId,
      cashierName,
      paymentMethod,
      paymentDetails,
      registerSessionId,
      storeSnapshot,
      isOnline = true,
      offlineQueueId,
    } = payload;
    if (!items?.length) throw new Error("Cart is empty");
    const totals = computeSaleTotals(items, discount);
    const txnId = uuidv4();
    const date = new Date().toISOString();

    const lineItems = items.map((item, idx) => {
      const newBase = totals.newBases[idx];
      const tr = Number(item.taxRate) || 0;
      const taxAmount = newBase * (tr / 100);
      const lineGross = Number(item.unitPrice) * Number(item.quantity);
      const idisc = Number(item.discount) || 0;
      return {
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Math.round((newBase + taxAmount) * 100) / 100,
        taxRate: tr,
        taxAmount: Math.round(taxAmount * 100) / 100,
        discount: idisc,
        discountAmount: Math.round(lineGross * (idisc / 100) * 100) / 100,
        costPrice: Number(item.costPrice) || 0,
      };
    });

    const candidateBatchRefsByProduct = {};
    const productIds = [...new Set(items.map((item) => item.productId))];
    for (const productId of productIds) {
      const q = query(
        collection(db, "stores", storeId, "productBatches"),
        where("productId", "==", productId),
        limit(300),
      );
      const snap = await getDocs(q);
      candidateBatchRefsByProduct[productId] = snap.docs.map((d) => d.ref);
    }

    let issuedInvoice = "";
    const lowStockCrossings = [];
    await runTransaction(db, async (transaction) => {
      const storeRef = doc(db, "stores", storeId);
      const storeSnap = await transaction.get(storeRef);
      if (!storeSnap.exists()) throw new Error("Store not found");
      const storeData = storeSnap.data();
      const useFefo = storeData?.inventoryConfig?.enableFEFO !== false;
      const counter = (Number(storeData.invoiceCounter) || 0) + 1;
      const inv = invoiceNo(counter);
      issuedInvoice = inv;

      const productUpdates = [];
      for (const item of items) {
        const pref = doc(db, "stores", storeId, "products", item.productId);
        const ps = await transaction.get(pref);
        if (!ps.exists()) throw new Error(`Missing product ${item.name}`);
        const prev = Number(ps.data().stock) || 0;
        const q = Number(item.quantity) || 0;
        if (prev < q) throw new Error(`Insufficient stock for ${item.name}`);
        const lowStockThreshold = Number(ps.data().lowStockThreshold ?? 5);

        const batchRefs = candidateBatchRefsByProduct[item.productId] || [];
        const batchPool = [];
        for (const batchRef of batchRefs) {
          const batchSnap = await transaction.get(batchRef);
          if (!batchSnap.exists()) continue;
          const b = batchSnap.data();
          if (b.isBlocked === true || b.isActive === false) continue;
          const available = Math.max(
            0,
            Number(b.availableQuantity ?? b.currentQuantity) || 0,
          );
          if (available <= 0) continue;
          batchPool.push({
            ref: batchRef,
            id: batchSnap.id,
            data: b,
            available,
          });
        }

        if (useFefo) {
          batchPool.sort((a, b) => {
            const aDate = a.data.expiryDate || "9999-12-31";
            const bDate = b.data.expiryDate || "9999-12-31";
            return String(aDate).localeCompare(String(bDate));
          });
        } else {
          batchPool.sort((a, b) => {
            const aDate = a.data.receivedDate || "9999-12-31";
            const bDate = b.data.receivedDate || "9999-12-31";
            return String(aDate).localeCompare(String(bDate));
          });
        }

        let remaining = q;
        const batchAllocations = [];
        for (const batchEntry of batchPool) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, batchEntry.available);
          if (take <= 0) continue;

          remaining -= take;
          const currentQty = Math.max(
            0,
            Number(batchEntry.data.currentQuantity) || 0,
          );
          const reservedQty = Math.max(
            0,
            Number(batchEntry.data.reservedQuantity) || 0,
          );
          const nextCurrent = Math.max(0, currentQty - take);
          const nextAvailable = Math.max(0, nextCurrent - reservedQty);

          batchAllocations.push({
            batchId: batchEntry.id,
            batchNumber: batchEntry.data.batchNumber || "",
            quantity: take,
            unitCost: Number(batchEntry.data.unitCostPrice) || 0,
            ref: batchEntry.ref,
            nextCurrent,
            nextAvailable,
          });
        }

        if (batchPool.length > 0 && remaining > 0) {
          throw new Error(`Insufficient batch stock for ${item.name}`);
        }

        productUpdates.push({
          item,
          pref,
          prev,
          next: prev - q,
          lowStockThreshold,
          sku: ps.data().sku || ps.data().barcode || "",
          batchAllocations,
        });

        const next = prev - q;
        if (
          (lowStockThreshold > 0 && prev > lowStockThreshold && next <= lowStockThreshold) ||
          (prev > 0 && next <= 0)
        ) {
          lowStockCrossings.push({
            productName: item.name,
            sku: ps.data().sku || ps.data().barcode || "",
            stock: next,
          });
        }
      }

      let customerPatch = null;
      const creditDue = udhaarAmountFromPayment(
        paymentMethod,
        paymentDetails,
        totals.grandTotal,
      );
      if (customer?.id) {
        const cref = doc(db, "stores", storeId, "customers", customer.id);
        const cs = await transaction.get(cref);
        if (cs.exists()) {
          const pts = Math.floor(totals.grandTotal / 100);
          const curPts = Number(cs.data().loyaltyPoints) || 0;
          const curSpent = Number(cs.data().totalSpent) || 0;
          const curCredit = Number(cs.data().currentCredit) || 0;
          const creditLimit = Number(cs.data().creditLimit) || 0;

          if (creditDue > 0) {
            const nextCredit = curCredit + creditDue;
            if (creditLimit > 0 && nextCredit > creditLimit) {
              throw new Error(
                `Credit limit exceeded for ${customer.name}. Limit: ${creditLimit}, new balance would be ${nextCredit}`,
              );
            }
          }

          customerPatch = {
            cref,
            loyaltyPoints: curPts + pts,
            totalSpent: curSpent + totals.grandTotal,
            lastPurchase: date,
            currentCredit: curCredit + creditDue,
            creditDue,
            firstUnpaidDate: cs.data().firstUnpaidDate || null,
          };
        }
      }

      for (const { item, pref, prev, next, batchAllocations } of productUpdates) {
        transaction.update(pref, { stock: next, updatedAt: date });

        if (batchAllocations?.length) {
          for (const alloc of batchAllocations) {
            transaction.update(alloc.ref, {
              currentQuantity: alloc.nextCurrent,
              availableQuantity: alloc.nextAvailable,
              isActive: alloc.nextCurrent > 0,
              updatedAt: date,
            });
          }
        }

        const movementId = uuidv4();
        transaction.set(doc(db, "stores", storeId, "stockMovements", movementId), {
          id: movementId,
          movementNumber: movementNo(),
          productId: item.productId,
          productName: item.name,
          sku: item.sku || "",
          batchId: batchAllocations?.[0]?.batchId || null,
          batchNumber: batchAllocations?.[0]?.batchNumber || null,
          type: "stock_out",
          direction: "out",
          quantity: Number(item.quantity) || 0,
          previousStock: prev,
          newStock: next,
          unitCost: Number(item.costPrice) || 0,
          totalCost: round2(
            (Number(item.costPrice) || 0) * (Number(item.quantity) || 0),
          ),
          source: "sale",
          sourceId: txnId,
          sourceNumber: inv,
          reason: "sale",
          notes: `Sale ${inv}`,
          performedBy: cashierId || "",
          performedByName: cashierName || "",
          timestamp: date,
          createdAt: date,
        });

        const logId = uuidv4();
        transaction.set(doc(db, "stores", storeId, "inventoryLogs", logId), {
          id: logId,
          productId: item.productId,
          productName: item.name,
          previousStock: prev,
          newStock: next,
          change: -Number(item.quantity),
          reason: "Sale",
          referenceId: txnId,
          userId: cashierId,
          timestamp: date,
        });
      }

      if (customerPatch) {
        transaction.update(customerPatch.cref, {
          loyaltyPoints: customerPatch.loyaltyPoints,
          totalSpent: customerPatch.totalSpent,
          lastPurchase: customerPatch.lastPurchase,
          ...(customerPatch.creditDue > 0
            ? {
                currentCredit: customerPatch.currentCredit,
                firstUnpaidDate: customerPatch.firstUnpaidDate || date,
              }
            : {}),
          updatedAt: date,
        });

        if (customerPatch.creditDue > 0) {
          const ledgerId = uuidv4();
          transaction.set(
            doc(db, "stores", storeId, "udhaarLedgers", ledgerId),
            {
              id: ledgerId,
              customerId: customer.id,
              customerName: customer.name,
              transactionId: txnId,
              invoiceNo: inv,
              type: "sale_credit",
              direction: "debit",
              amount: customerPatch.creditDue,
              balanceAfter: customerPatch.currentCredit,
              notes: `Udhaar on sale ${inv}`,
              createdAt: date,
              createdBy: cashierId || "",
            },
          );
        }
      }

      const fbrStatus = resolveInitialFbrStatus(storeData, isOnline);
      const fbrPayload =
        fbrStatus !== FBR_STATUS.EXEMPT
          ? buildFbrPayload({
              invoiceNo: inv,
              date,
              store: storeSnapshot || storeData,
              items: lineItems,
              grandTotal: totals.grandTotal,
              customerName:
                normalizeOptionalCustomerName(customer?.name) ||
                "Walk-in Customer",
            })
          : null;

      if (fbrPayload && fbrStatus === FBR_STATUS.PENDING) {
        const logId = uuidv4();
        transaction.set(doc(db, "stores", storeId, "fbrSyncLogs", logId), {
          id: logId,
          transactionId: txnId,
          invoiceNo: inv,
          status: FBR_STATUS.PENDING,
          payload: fbrPayload,
          error: null,
          createdAt: date,
          updatedAt: date,
        });
      }

      transaction.update(storeRef, { invoiceCounter: counter });

      transaction.set(doc(db, "stores", storeId, "transactions", txnId), {
        id: txnId,
        invoiceNo: inv,
        date,
        items: lineItems.map((line) => {
          const allocationSource = productUpdates.find(
            (entry) => entry.item.productId === line.productId,
          );
          return {
            ...line,
            batchAllocations: (allocationSource?.batchAllocations || []).map(
              (a) => ({
                batchId: a.batchId,
                batchNumber: a.batchNumber,
                quantity: a.quantity,
                unitCost: a.unitCost,
              }),
            ),
          };
        }),
        subtotal: Math.round(totals.subtotal * 100) / 100,
        discountType: discount?.type === "fixed" ? "fixed" : "percentage",
        discountValue: Number(discount?.value) || 0,
        discountAmount: Math.round(totals.cartDiscountAmount * 100) / 100,
        taxTotal: Math.round(totals.taxTotal * 100) / 100,
        grandTotal: Math.round(totals.grandTotal * 100) / 100,
        paymentMethod,
        paymentDetails: paymentDetails || {},
        customerId: customer?.id || null,
        customerName: normalizeOptionalCustomerName(customer?.name),
        saleType: saleType === "wholesale" ? "wholesale" : "retail",
        cashierId,
        cashierName,
        registerSessionId: registerSessionId || null,
        status: "completed",
        voidReason: null,
        udhaarAmount: udhaarAmountFromPayment(
          paymentMethod,
          paymentDetails,
          totals.grandTotal,
        ),
        fbrStatus,
        fbrPayload,
        fbrInvoiceId: null,
        offlineQueueId: offlineQueueId || null,
        syncedAt: date,
      });
    });

    if (lowStockCrossings.length) {
      void (async () => {
        try {
          const [{ sendLowStockAlertEmail }, { default: useAuthStore }] =
            await Promise.all([
              import("../services/emailService"),
              import("./authStore"),
            ]);
          const store = useAuthStore.getState().store;
          const to = store?.email || useAuthStore.getState().user?.email || "";
          if (!to) return;
          await sendLowStockAlertEmail({
            to,
            storeName: store?.name || "Your store",
            items: lowStockCrossings,
          });
        } catch {
          /* non-blocking */
        }
      })();
    }

    return {
      txnId,
      invoiceNo: issuedInvoice,
      date,
      grandTotal: Math.round(totals.grandTotal * 100) / 100,
      subtotal: Math.round(totals.subtotal * 100) / 100,
      taxTotal: Math.round(totals.taxTotal * 100) / 100,
      discountAmount: Math.round(totals.cartDiscountAmount * 100) / 100,
      lineItems,
      paymentMethod,
      paymentDetails: paymentDetails || {},
      saleType: saleType === "wholesale" ? "wholesale" : "retail",
      udhaarAmount: udhaarAmountFromPayment(
        paymentMethod,
        paymentDetails,
        totals.grandTotal,
      ),
      fbrStatus: resolveInitialFbrStatus(storeSnapshot, isOnline),
      fbrPayload: isFbrEnabled(storeSnapshot)
        ? buildFbrPayload({
            invoiceNo: issuedInvoice,
            date,
            store: storeSnapshot,
            items: lineItems,
            grandTotal: totals.grandTotal,
            customerName: normalizeOptionalCustomerName(customer?.name),
          })
        : null,
    };
  },

  voidTransaction: async (storeId, txnId, reason) => {
    const txnRef = doc(db, "stores", storeId, "transactions", txnId);
    const date = new Date().toISOString();
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(txnRef);
      if (!snap.exists()) throw new Error("Transaction not found");
      const data = snap.data();
      if (data.status === "voided") throw new Error("Already voided");

      const productUpdates = [];
      for (const line of data.items || []) {
        const pref = doc(db, "stores", storeId, "products", line.productId);
        const ps = await transaction.get(pref);
        if (ps.exists()) {
          const prev = Number(ps.data().stock) || 0;
          const q = Number(line.quantity) || 0;
          productUpdates.push({
            line,
            pref,
            prev,
            q,
            next: prev + q,
            batchAllocations: Array.isArray(line.batchAllocations)
              ? line.batchAllocations
              : [],
          });
        }
      }

      let customerPatch = null;
      const voidCredit = Number(data.udhaarAmount) || 0;
      if (data.customerId) {
        const cref = doc(db, "stores", storeId, "customers", data.customerId);
        const cs = await transaction.get(cref);
        if (cs.exists()) {
          const grand = Number(data.grandTotal) || 0;
          const pts = Math.floor(grand / 100);
          const curPts = Number(cs.data().loyaltyPoints) || 0;
          const curSpent = Number(cs.data().totalSpent) || 0;
          const curCredit = Number(cs.data().currentCredit) || 0;
          customerPatch = {
            cref,
            loyaltyPoints: Math.max(0, curPts - pts),
            totalSpent: Math.max(0, curSpent - grand),
            currentCredit: Math.max(0, curCredit - voidCredit),
            voidCredit,
            customerName: cs.data().name || data.customerName,
          };
        }
      }

      for (const { line, pref, prev, q, next, batchAllocations } of productUpdates) {
        transaction.update(pref, { stock: next, updatedAt: date });

        for (const alloc of batchAllocations) {
          const batchRef = doc(
            db,
            "stores",
            storeId,
            "productBatches",
            alloc.batchId,
          );
          const batchSnap = await transaction.get(batchRef);
          if (!batchSnap.exists()) continue;
          const b = batchSnap.data();
          const currentQuantity = Math.max(0, Number(b.currentQuantity) || 0);
          const reservedQuantity = Math.max(0, Number(b.reservedQuantity) || 0);
          const restoredCurrent = currentQuantity + (Number(alloc.quantity) || 0);
          transaction.update(batchRef, {
            currentQuantity: restoredCurrent,
            availableQuantity: Math.max(0, restoredCurrent - reservedQuantity),
            isActive: true,
            updatedAt: date,
          });
        }

        const movementId = uuidv4();
        transaction.set(doc(db, "stores", storeId, "stockMovements", movementId), {
          id: movementId,
          movementNumber: movementNo(),
          productId: line.productId,
          productName: line.name,
          sku: line.sku || "",
          batchId: batchAllocations?.[0]?.batchId || null,
          batchNumber: batchAllocations?.[0]?.batchNumber || null,
          type: "return_in",
          direction: "in",
          quantity: q,
          previousStock: prev,
          newStock: next,
          unitCost: Number(line.costPrice) || 0,
          totalCost: round2((Number(line.costPrice) || 0) * q),
          source: "sale_return",
          sourceId: txnId,
          sourceNumber: data.invoiceNo || null,
          reason: "void",
          notes: reason || "Transaction void",
          performedBy: "",
          performedByName: "",
          timestamp: date,
          createdAt: date,
        });

        const logId = uuidv4();
        transaction.set(doc(db, "stores", storeId, "inventoryLogs", logId), {
          id: logId,
          productId: line.productId,
          productName: line.name,
          previousStock: prev,
          newStock: next,
          change: q,
          reason: "Void",
          referenceId: txnId,
          userId: "",
          timestamp: date,
        });
      }

      if (customerPatch) {
        transaction.update(customerPatch.cref, {
          loyaltyPoints: customerPatch.loyaltyPoints,
          totalSpent: customerPatch.totalSpent,
          ...(customerPatch.voidCredit > 0
            ? { currentCredit: customerPatch.currentCredit }
            : {}),
          updatedAt: date,
        });

        if (customerPatch.voidCredit > 0) {
          const ledgerId = uuidv4();
          transaction.set(
            doc(db, "stores", storeId, "udhaarLedgers", ledgerId),
            {
              id: ledgerId,
              customerId: data.customerId,
              customerName: customerPatch.customerName,
              transactionId: txnId,
              invoiceNo: data.invoiceNo || null,
              type: "void_reversal",
              direction: "credit",
              amount: customerPatch.voidCredit,
              balanceAfter: customerPatch.currentCredit,
              notes: reason || "Transaction void",
              createdAt: date,
              createdBy: "",
            },
          );
        }
      }

      transaction.update(txnRef, {
        status: "voided",
        voidReason: reason || "Voided",
        voidedAt: date,
      });
    });
  },
}));

export default useTransactionStore;
