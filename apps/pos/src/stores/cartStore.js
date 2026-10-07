import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeSaleTotals } from "../utils/posTotals";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      saleType: "retail",
      customer: null,
      discount: { type: "percentage", value: 0 },
      heldCarts: [],
      lastReceipt: null,

      getSubtotal: () =>
        computeSaleTotals(get().items, get().discount).subtotal,
      getCartDiscountAmount: () =>
        computeSaleTotals(get().items, get().discount).cartDiscountAmount,
      getTaxTotal: () =>
        computeSaleTotals(get().items, get().discount).taxTotal,
      getGrandTotal: () =>
        computeSaleTotals(get().items, get().discount).grandTotal,

      addItem: (product, qty = 1) => {
        const id = product.id;
        const q = Math.max(1, Number(qty) || 1);
        set((s) => {
          const existing = s.items.find((i) => i.productId === id);
          const maxStock = Number(product.stock) || 0;
          const retailPrice = Number(product.price) || 0;
          const wholesalePrice = Number(product.wholesalePrice) || retailPrice;
          const activeUnitPrice =
            s.saleType === "wholesale" ? wholesalePrice : retailPrice;
          if (maxStock <= 0) return s;
          if (existing) {
            const nextQty = Math.min(maxStock, existing.quantity + q);
            return {
              items: s.items.map((i) =>
                i.productId === id
                  ? {
                      ...i,
                      quantity: nextQty,
                      maxStock,
                      unitPrice:
                        s.saleType === "wholesale"
                          ? i.wholesalePrice
                          : i.retailPrice,
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                productId: id,
                sku: product.sku,
                name: product.name,
                unit: product.unit || "pcs",
                retailPrice,
                wholesalePrice,
                unitPrice: activeUnitPrice,
                costPrice: Number(product.costPrice) || 0,
                taxRate: Number(product.taxRate) || 0,
                quantity: Math.min(maxStock, q),
                maxStock,
                discount: 0,
              },
            ],
          };
        });
      },

      updateQuantity: (productId, qty) => {
        set((s) => ({
          items: s.items.map((i) => {
            if (i.productId !== productId) return i;
            const n = Math.max(1, Math.min(i.maxStock, Number(qty) || 1));
            return { ...i, quantity: n };
          }),
        }));
      },

      removeItem: (productId) => {
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        }));
      },

      setItemDiscount: (productId, discountPct) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  discount: Math.min(
                    100,
                    Math.max(0, Number(discountPct) || 0),
                  ),
                }
              : i,
          ),
        }));
      },

      setDiscount: (type, value) => {
        set({
          discount: {
            type: type === "fixed" ? "fixed" : "percentage",
            value: Number(value) || 0,
          },
        });
      },

      setCustomer: (customer) => set({ customer }),

      setSaleType: (saleType) => {
        const nextType = saleType === "wholesale" ? "wholesale" : "retail";
        set((s) => ({
          saleType: nextType,
          items: s.items.map((i) => ({
            ...i,
            unitPrice:
              nextType === "wholesale"
                ? Number(i.wholesalePrice || i.unitPrice || 0)
                : Number(i.retailPrice || i.unitPrice || 0),
          })),
        }));
      },

      clearCart: () =>
        set({
          items: [],
          saleType: "retail",
          customer: null,
          discount: { type: "percentage", value: 0 },
        }),

      holdCart: () => {
        const { items, customer, discount } = get();
        if (!items.length) return null;
        const id = uuidv4();
        set((s) => ({
          heldCarts: [
            ...s.heldCarts,
            {
              id,
              items: JSON.parse(JSON.stringify(items)),
              saleType: s.saleType,
              customer,
              discount: { ...discount },
              timestamp: new Date().toISOString(),
            },
          ],
          items: [],
          saleType: "retail",
          customer: null,
          discount: { type: "percentage", value: 0 },
        }));
        return id;
      },

      recallCart: (heldId) => {
        const held = get().heldCarts.find((h) => h.id === heldId);
        if (!held) return;
        set({
          items: JSON.parse(JSON.stringify(held.items)),
          saleType: held.saleType || "retail",
          customer: held.customer,
          discount: { ...held.discount },
        });
      },

      deleteHeldCart: (heldId) => {
        set((s) => ({ heldCarts: s.heldCarts.filter((h) => h.id !== heldId) }));
      },

      setLastReceipt: (receipt) => set({ lastReceipt: receipt }),
    }),
    {
      name: "quickpos-cart",
      partialize: (s) => ({
        items: s.items,
        saleType: s.saleType,
        customer: s.customer,
        discount: s.discount,
        heldCarts: s.heldCarts,
        lastReceipt: s.lastReceipt,
      }),
    },
  ),
);

export default useCartStore;
