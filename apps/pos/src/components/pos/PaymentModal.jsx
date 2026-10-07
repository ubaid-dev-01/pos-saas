import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { sendReceiptEmail } from "../../services/emailService";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import useCashSessionStore from "../../stores/cashSessionStore";
import useCustomerStore from "../../stores/customerStore";
import useOfflineStore from "../../stores/offlineStore";
import useTransactionStore from "../../stores/transactionStore";
import { fbrQrImageUrl } from "../../utils/fbr";
import { normalizeOptionalCustomerName } from "../../utils/customerName";
import { formatCurrency } from "../../utils/format";
import {
  computeSaleTotals,
  isCashPaymentSufficient,
  parseMoneyInput,
  roundMoney,
} from "../../utils/posTotals";
import { useTranslation } from "../../context/LocaleContext";
import Modal from "../ui/Modal";
import SearchableSelect from "../ui/SearchableSelect";
import { buildOfflineInvoiceNo } from "./OfflineBanner";

const PRIMARY_TAB_IDS = ["cash", "card", "digital", "udhaar", "split"];

const DIGITAL_METHODS = [
  { id: "jazzcash", labelKey: "payment.jazzcash" },
  { id: "easypaisa", labelKey: "payment.easypaisa" },
  { id: "raast", labelKey: "payment.raast" },
];

export default function PaymentModal({ open, onClose, onSuccess }) {
  const { t } = useTranslation();
  const {
    items,
    discount,
    customer,
    saleType,
    setSaleType,
    getGrandTotal,
    clearCart,
  } = useCartStore();
  const { customers } = useCustomerStore();
  const { user, userDoc, store } = useAuthStore();
  const { createTransaction } = useTransactionStore();
  const { session, recordSaleInSession } = useCashSessionStore();
  const { isOnline, queueSale } = useOfflineStore();

  const [tab, setTab] = useState("cash");
  const [digitalMethod, setDigitalMethod] = useState("jazzcash");
  const [cashIn, setCashIn] = useState("");
  const [cardType, setCardType] = useState("Visa");
  const [last4, setLast4] = useState("");
  const [digitalRef, setDigitalRef] = useState("");
  const [udhaarPartialCash, setUdhaarPartialCash] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");
  const [splitDigital, setSplitDigital] = useState("");
  const [splitUdhaar, setSplitUdhaar] = useState("");
  const [splitDigitalMethod, setSplitDigitalMethod] = useState("jazzcash");
  const [busy, setBusy] = useState(false);

  const total = roundMoney(getGrandTotal());
  const creditEnabled = store?.posConfig?.enableCreditSale !== false;

  useEffect(() => {
    if (!open) return;
    setTab("cash");
    setCashIn("");
    setDigitalRef("");
    setUdhaarPartialCash("");
    setSplitCash("");
    setSplitCard("");
    setSplitDigital("");
    setSplitUdhaar("");
    setBusy(false);
  }, [open]);

  const cashReceived = useMemo(() => roundMoney(parseMoneyInput(cashIn)), [cashIn]);
  const cashPaymentOk = isCashPaymentSufficient(cashReceived, total);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customer?.id) || null,
    [customers, customer?.id],
  );

  const creditLimit = Number(selectedCustomer?.creditLimit) || 0;
  const currentCredit = Number(selectedCustomer?.currentCredit) || 0;
  const creditAvailable =
    creditLimit > 0 ? Math.max(0, creditLimit - currentCredit) : null;

  const change = useMemo(
    () => Math.max(0, roundMoney(cashReceived - total)),
    [cashReceived, total],
  );

  const udhaarDue = useMemo(() => {
    if (tab === "udhaar") {
      const partial = Number(udhaarPartialCash) || 0;
      return Math.max(0, total - partial);
    }
    return 0;
  }, [tab, udhaarPartialCash, total]);

  const splitRemaining = useMemo(() => {
    return (
      total -
      (Number(splitCash) || 0) -
      (Number(splitCard) || 0) -
      (Number(splitDigital) || 0) -
      (Number(splitUdhaar) || 0)
    );
  }, [splitCash, splitCard, splitDigital, splitUdhaar, total]);

  const splitOk = Math.abs(splitRemaining) < 0.01;

  const raastQrUrl = useMemo(() => {
    if (digitalMethod !== "raast" && splitDigitalMethod !== "raast") return null;
    const payload = {
      amount: tab === "split" ? Number(splitDigital) || 0 : total,
      merchant: store?.name || "QuickPOS",
      ref: digitalRef || "POS-SALE",
    };
    return fbrQrImageUrl(payload);
  }, [digitalMethod, splitDigitalMethod, tab, splitDigital, total, store?.name, digitalRef]);

  const validatePayment = () => {
    if (tab === "cash") {
      if (!isCashPaymentSufficient(cashReceived, total)) {
        toast.error(t("payment.insufficientCash"));
        return null;
      }
      return {
        paymentMethod: "cash",
        paymentDetails: { cash: cashReceived, change },
      };
    }

    if (tab === "card") {
      return {
        paymentMethod: "card",
        paymentDetails: { cardType, last4 },
      };
    }

    if (tab === "digital") {
      if (!digitalRef.trim()) {
        toast.error(t("payment.refRequired"));
        return null;
      }
      return {
        paymentMethod: digitalMethod,
        paymentDetails: {
          provider: digitalMethod,
          reference: digitalRef.trim(),
          amount: total,
        },
      };
    }

    if (tab === "udhaar") {
      if (!creditEnabled) {
        toast.error(t("payment.udhaarDisabled"));
        return null;
      }
      if (!customer?.id) {
        toast.error(t("payment.selectCustomer"));
        return null;
      }
      const partial = Number(udhaarPartialCash) || 0;
      const due = Math.max(0, total - partial);
      if (due <= 0 && partial < total) {
        toast.error(t("payment.partialCashRequired"));
        return null;
      }
      if (creditLimit > 0 && currentCredit + due > creditLimit) {
        toast.error(
          t("payment.creditLimitExceeded", {
            available: formatCurrency(creditLimit - currentCredit),
          }),
        );
        return null;
      }
      return {
        paymentMethod: "udhaar",
        paymentDetails: {
          udhaarAmount: due,
          partialCash: partial,
          change: partial > total ? partial - total : 0,
        },
      };
    }

    if (tab === "split") {
      if (!splitOk) {
        toast.error(t("payment.splitMismatch"));
        return null;
      }
      const udhaarPart = Number(splitUdhaar) || 0;
      if (udhaarPart > 0) {
        if (!creditEnabled) {
          toast.error(t("payment.udhaarSplitDisabled"));
          return null;
        }
        if (!customer?.id) {
          toast.error(t("payment.selectCustomerSplit"));
          return null;
        }
        if (creditLimit > 0 && currentCredit + udhaarPart > creditLimit) {
          toast.error(t("payment.splitCreditExceeded"));
          return null;
        }
      }
      return {
        paymentMethod: "split",
        paymentDetails: {
          cash: Number(splitCash) || 0,
          card: Number(splitCard) || 0,
          digital: Number(splitDigital) || 0,
          digitalProvider: splitDigitalMethod,
          udhaar: udhaarPart,
        },
      };
    }

    return null;
  };

  const complete = async () => {
    if (!user || !userDoc?.storeId) return;
    const pay = validatePayment();
    if (!pay) return;

    setBusy(true);
    try {
      const trimmedCustomerName = normalizeOptionalCustomerName(customer?.name);
      const customerSnapshot =
        customer?.id || trimmedCustomerName
          ? {
              id: customer?.id || null,
              name: trimmedCustomerName,
              email: customer?.email || selectedCustomer?.email || "",
              phone: customer?.phone || selectedCustomer?.phone || "",
            }
          : null;

      const basePayload = {
        items,
        discount,
        saleType,
        customer: customerSnapshot,
        cashierId: user.uid,
        cashierName: userDoc.displayName || user.email,
        paymentMethod: pay.paymentMethod,
        paymentDetails: pay.paymentDetails,
        registerSessionId: session?.id || null,
        storeSnapshot: store,
        isOnline,
      };

      let res;
      if (!isOnline) {
        const totals = computeSaleTotals(items, discount);
        const invoiceNo = buildOfflineInvoiceNo();
        await queueSale(userDoc.storeId, basePayload);
        res = {
          invoiceNo,
          date: new Date().toISOString(),
          grandTotal: totals.grandTotal,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          discountAmount: totals.cartDiscountAmount,
          lineItems: items.map((item, idx) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: totals.newBases[idx] * (1 + (Number(item.taxRate) || 0) / 100),
            taxAmount: totals.newBases[idx] * ((Number(item.taxRate) || 0) / 100),
          })),
          saleType,
          paymentMethod: pay.paymentMethod,
          paymentDetails: pay.paymentDetails,
          udhaarAmount:
            pay.paymentMethod === "udhaar"
              ? pay.paymentDetails.udhaarAmount
              : pay.paymentDetails?.udhaar || 0,
          fbrStatus: "queued_offline",
          offline: true,
        };
        toast.success(t("payment.savedOffline"));
      } else {
        res = await createTransaction(userDoc.storeId, basePayload);
        if (session?.id) {
          await recordSaleInSession(userDoc.storeId, session.id, {
            paymentMethod: pay.paymentMethod,
            paymentDetails: pay.paymentDetails,
            grandTotal: res.grandTotal,
          });
        }
      }

      clearCart();
      onSuccess?.(res, {
        paymentMethod: pay.paymentMethod,
        paymentDetails: pay.paymentDetails,
        customer: customerSnapshot,
      });

      if (isOnline && customerSnapshot?.email) {
        const receiptPayload = {
          invoiceNo: res.invoiceNo,
          date: res.date,
          customerName: normalizeOptionalCustomerName(customerSnapshot?.name),
          cashierName: userDoc.displayName || user.email,
          items: res.lineItems,
          subtotal: res.subtotal,
          discountAmount: res.discountAmount,
          taxTotal: res.taxTotal,
          grandTotal: res.grandTotal,
          paymentMethod: pay.paymentMethod,
          store: {
            name: store?.name,
            address: store?.address,
            phone: store?.phone,
            email: store?.email,
            gstNumber: store?.gstNumber,
          },
        };

        sendReceiptEmail({ to: customerSnapshot.email, receipt: receiptPayload }).catch(
          () => toast.error(t("payment.emailFailed")),
        );
      }

      onClose?.();
      toast.success(isOnline ? t("payment.success") : t("payment.offlineQueued"));
    } catch (e) {
      toast.error(e?.message || t("payment.failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("payment.title")} wide>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSaleType("retail")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              saleType === "retail"
                ? "bg-primary text-white border-primary"
                : "border-border text-text-muted"
            }`}
          >
            {t("payment.retail")}
          </button>
          <button
            type="button"
            onClick={() => setSaleType("wholesale")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              saleType === "wholesale"
                ? "bg-primary text-white border-primary"
                : "border-border text-text-muted"
            }`}
          >
            {t("payment.wholesale")}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRIMARY_TAB_IDS.map((tabId) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setTab(tabId)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                tab === tabId
                  ? "bg-primary text-white border-primary"
                  : "border-border text-text-muted"
              }`}
            >
              {t(`payment.${tabId}`)}
            </button>
          ))}
        </div>

        <p className="text-sm text-text-muted">
          Total due:{" "}
          <span className="font-bold text-primary text-lg">
            {formatCurrency(total)}
          </span>
          {!isOnline && (
            <span className="ml-2 text-warning text-xs font-semibold">
              (offline   will queue)
            </span>
          )}
        </p>

        {tab === "cash" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCashIn(String(total))}
                className="px-3 py-1.5 rounded-xl border-2 border-primary bg-primary/10 text-xs font-bold text-primary"
              >
                Exact {formatCurrency(total)}
              </motion.button>
              {[total + 100, total + 500, total + 1000, total + 2000].map((amt) => (
                <motion.button
                  key={amt}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCashIn(String(roundMoney(amt)))}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold"
                >
                  {formatCurrency(amt)}
                </motion.button>
              ))}
            </div>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="Amount received (type any amount)"
              value={cashIn}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.,]/g, "").replace(/,/g, "");
                const parts = raw.split(".");
                const normalized =
                  parts.length > 2
                    ? `${parts[0]}.${parts.slice(1).join("")}`
                    : raw;
                setCashIn(normalized);
              }}
            />
            <p className="text-sm">
              {t("payment.change")}:{" "}
              <span className="font-semibold">{formatCurrency(change)}</span>
            </p>
          </div>
        )}

        {tab === "card" && (
          <div className="space-y-3">
            <SearchableSelect
              value={cardType}
              onChange={setCardType}
              options={[
                { value: "Visa", label: "Visa" },
                { value: "Mastercard", label: "Mastercard" },
                { value: "PayPak", label: "PayPak" },
              ]}
              className="w-full"
              placeholder="Card type"
            />
            <input
              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              placeholder={t("payment.last4")}
              maxLength={4}
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        )}

        {tab === "digital" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {DIGITAL_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDigitalMethod(m.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    digitalMethod === m.id
                      ? "bg-accent text-white border-accent"
                      : "border-border text-text-muted"
                  }`}
                >
                  {t(m.labelKey)}
                </button>
              ))}
            </div>
            {digitalMethod === "raast" && raastQrUrl && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 bg-background">
                <img src={raastQrUrl} alt="Raast QR" className="h-28 w-28" />
                <p className="text-xs text-text-muted text-center">
                  Customer scans to pay {formatCurrency(total)} via Raast
                </p>
              </div>
            )}
            <input
              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="Transaction ID / reference"
              value={digitalRef}
              onChange={(e) => setDigitalRef(e.target.value)}
            />
          </div>
        )}

        {tab === "udhaar" && (
          <div className="space-y-3">
            {!customer?.id ? (
              <p className="text-sm text-warning rounded-xl border border-warning/30 bg-warning/5 p-3">
                Select a customer from the cart sidebar to record udhaar (credit).
              </p>
            ) : (
              <div className="rounded-xl border border-border bg-background p-3 text-xs space-y-1">
                <p>
                  Customer: <span className="font-semibold">{customer.name}</span>
                </p>
                <p>
                  Current udhaar:{" "}
                  <span className="font-semibold">{formatCurrency(currentCredit)}</span>
                </p>
                {creditLimit > 0 && (
                  <p>
                    Credit limit: {formatCurrency(creditLimit)} · Available:{" "}
                    {formatCurrency(creditAvailable)}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="text-xs text-text-muted">
                Partial cash received (optional)
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                placeholder="0"
                value={udhaarPartialCash}
                onChange={(e) => setUdhaarPartialCash(e.target.value)}
              />
            </div>
            <p className="text-sm">
              {t("payment.udhaarDue")}:{" "}
              <span className="font-bold text-primary">{formatCurrency(udhaarDue)}</span>
            </p>
          </div>
        )}

        {tab === "split" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted">{t("payment.cash")}</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={splitCash}
                onChange={(e) => setSplitCash(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted">{t("payment.card")}</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={splitCard}
                onChange={(e) => setSplitCard(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted">{t("payment.digital")}</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={splitDigital}
                onChange={(e) => setSplitDigital(e.target.value)}
              />
              {Number(splitDigital) > 0 && (
                <SearchableSelect
                  className="mt-2"
                  value={splitDigitalMethod}
                  onChange={setSplitDigitalMethod}
                  options={DIGITAL_METHODS.map((m) => ({
                    value: m.id,
                    label: t(m.labelKey),
                  }))}
                  placeholder="Provider"
                />
              )}
            </div>
            <div>
              <label className="text-xs text-text-muted">{t("payment.udhaar")}</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={splitUdhaar}
                onChange={(e) => setSplitUdhaar(e.target.value)}
              />
            </div>
            <p
              className={`sm:col-span-2 text-xs ${splitOk ? "text-success" : "text-error"}`}
            >
              {t("payment.splitRemaining")}: {formatCurrency(splitRemaining)}
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={
            busy ||
            (tab === "cash" && !cashPaymentOk) ||
            (tab === "udhaar" && !customer?.id) ||
            (tab === "digital" && !digitalRef.trim()) ||
            (tab === "split" && !splitOk)
          }
          onClick={complete}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-50"
        >
          {busy ? t("payment.processing") : isOnline ? t("payment.complete") : t("payment.saveOffline")}
        </button>
      </div>
    </Modal>
  );
}
