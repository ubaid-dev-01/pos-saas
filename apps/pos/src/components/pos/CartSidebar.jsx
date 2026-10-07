import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ShoppingBag } from "lucide-react";
import { useState } from "react";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import { normalizeOptionalCustomerName } from "../../utils/customerName";
import { fbrQrImageUrl } from "../../utils/fbr";
import { formatCurrency } from "../../utils/format";
import { useTranslation } from "../../context/LocaleContext";
import ConfirmDialog from "../ui/ConfirmDialog";
import EmptyState from "../ui/EmptyState";
import SearchableSelect from "../ui/SearchableSelect";
import CartItem from "./CartItem";
import CustomerSelector from "./CustomerSelector";
import HeldCartsModal from "./HeldCartsModal";
import PaymentModal from "./PaymentModal";
import ReceiptModal from "./ReceiptModal";

export default function CartSidebar({ onSaleComplete }) {
  const {
    items,
    discount,
    setDiscount,
    clearCart,
    holdCart,
    heldCarts,
    getSubtotal,
    getCartDiscountAmount,
    getTaxTotal,
    getGrandTotal,
    setLastReceipt,
  } = useCartStore();
  const { store, user, userDoc } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [discMode, setDiscMode] = useState(discount.type);
  const [discVal, setDiscVal] = useState(String(discount.value || 0));
  const { t } = useTranslation();

  const subtotal = getSubtotal();
  const cartDisc = getCartDiscountAmount();
  const tax = getTaxTotal();
  const grand = getGrandTotal();

  const applyDisc = () => {
    setDiscount(discMode, Number(discVal) || 0);
  };

  return (
    <>
      <motion.aside
        className="hidden lg:flex flex-col w-cart border-l border-border bg-surface h-[calc(100vh-3.5rem)] sticky top-14 shrink-0"
        initial={false}
      >
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> {t("pos.cart")}
            </h2>
            <span className="text-xs text-text-muted">
              {t("pos.items", { count: items.length })}
            </span>
          </div>
          <CustomerSelector />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence>
            {items.map((it) => (
              <CartItem key={it.productId} item={it} />
            ))}
          </AnimatePresence>
          {!items.length && (
            <EmptyState
              title={t("pos.cartEmpty")}
              description={t("pos.addProductsHint")}
            />
          )}
        </div>
        <div className="p-4 border-t border-border space-y-3 bg-background/60">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">{t("pos.subtotal")}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-text-muted">{t("pos.discount")}</span>
              <SearchableSelect
                className="w-[120px]"
                value={discMode}
                onChange={setDiscMode}
                options={[
                  { value: "percentage", label: "%" },
                  { value: "fixed", label: t("pos.discountFixed") },
                ]}
                placeholder={t("pos.discountMode")}
              />
              <input
                type="number"
                className="w-20 rounded-lg border border-border text-xs px-2 py-1"
                value={discVal}
                onChange={(e) => setDiscVal(e.target.value)}
                onBlur={applyDisc}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">{t("pos.discount")} (−)</span>
              <span>-{formatCurrency(cartDisc)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">{t("pos.tax")} (+)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary pt-1">
              <span>{t("common.total")}</span>
              <span>{formatCurrency(grand)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const id = holdCart();
                if (id) onSaleComplete?.("hold");
              }}
              className="py-2 rounded-xl border border-border text-xs font-semibold"
            >
              {t("pos.hold")} ({heldCarts.length})
            </button>
            <button
              type="button"
              onClick={() => setHeldOpen(true)}
              className="py-2 rounded-xl border border-border text-xs font-semibold"
            >
              {t("pos.recall")}
            </button>
            <button
              type="button"
              onClick={() => setClearOpen(true)}
              className="py-2 rounded-xl border border-error/40 text-error text-xs font-semibold col-span-2"
            >
              {t("pos.clearCart")}
            </button>
          </div>
          <button
            type="button"
            disabled={!items.length}
            onClick={() => setPayOpen(true)}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40"
          >
            {t("pos.charge")} {formatCurrency(grand)}
          </button>
        </div>
      </motion.aside>

      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-[calc(100%-2rem)] mx-auto flex items-center justify-between px-4 py-3 rounded-2xl bg-primary text-white shadow-lg"
        >
          <span className="text-sm font-semibold">
            {t("pos.cart")} · {t("pos.items", { count: items.length })}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold">
            {formatCurrency(grand)}
            <ChevronUp className="w-4 h-4" />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-[70] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="absolute bottom-0 inset-x-0 max-h-[70vh] bg-surface rounded-t-2xl border-t border-border flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border space-y-3 overflow-y-auto flex-1">
                <CustomerSelector />
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {items.map((it) => (
                    <CartItem key={it.productId} item={it} />
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-border space-y-2 bg-background/80">
                <div className="flex justify-between text-sm font-bold text-primary">
                  <span>{t("common.total")}</span>
                  <span>{formatCurrency(grand)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="py-2 rounded-xl border text-xs font-semibold"
                    onClick={() => holdCart()}
                  >
                    {t("pos.hold")}
                  </button>
                  <button
                    type="button"
                    className="py-2 rounded-xl border text-xs font-semibold"
                    onClick={() => setHeldOpen(true)}
                  >
                    {t("pos.recall")}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={!items.length}
                  onClick={() => {
                    setMobileOpen(false);
                    setPayOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40"
                >
                  {t("pos.charge")} {formatCurrency(grand)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onSuccess={(res, pay) => {
          const fbrPayload = res.fbrPayload || null;
          const r = {
            store,
            invoiceNo: res.invoiceNo,
            date: res.date,
            cashierName: userDoc?.displayName || user?.email,
            customerName: normalizeOptionalCustomerName(pay.customer?.name),
            customerEmail: pay.customer?.email || "",
            customerPhone: pay.customer?.phone || "",
            items: res.lineItems,
            subtotal: res.subtotal,
            discountAmount: res.discountAmount,
            taxTotal: res.taxTotal,
            grandTotal: res.grandTotal,
            saleType: res.saleType || "retail",
            paymentMethod: pay.paymentMethod,
            paymentDetails: pay.paymentDetails,
            udhaarAmount: res.udhaarAmount || pay.paymentDetails?.udhaarAmount || 0,
            fbrStatus: res.fbrStatus,
            fbrPayload,
            fbrQrUrl: fbrPayload ? fbrQrImageUrl(fbrPayload) : null,
            offline: res.offline === true,
          };
          setReceipt(r);
          setLastReceipt(r);
          setReceiptOpen(true);
        }}
      />

      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        receipt={receipt}
      />
      <HeldCartsModal open={heldOpen} onClose={() => setHeldOpen(false)} />
      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title={t("pos.clearCartTitle")}
        message={t("pos.clearCartMessage")}
        confirmLabel={t("pos.clearCart")}
        danger
        onConfirm={() => {
          clearCart();
          setClearOpen(false);
        }}
      />
    </>
  );
}
