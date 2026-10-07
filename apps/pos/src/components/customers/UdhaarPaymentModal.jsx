import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import useCustomerStore from "../../stores/customerStore";
import { formatCurrency } from "../../utils/format";
import { useTranslation } from "../../context/LocaleContext";
import Modal from "../ui/Modal";

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "jazzcash", label: "JazzCash" },
  { id: "easypaisa", label: "EasyPaisa" },
  { id: "raast", label: "Raast" },
  { id: "card", label: "Card" },
  { id: "bank", label: "Bank Transfer" },
];

export default function UdhaarPaymentModal({ open, onClose, customer }) {
  const { t } = useTranslation();
  const { user, userDoc } = useAuthStore();
  const { receiveUdhaarPayment } = useCustomerStore();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const balance = useMemo(
    () => Number(customer?.currentCredit) || 0,
    [customer?.currentCredit],
  );

  useEffect(() => {
    if (!open) return;
    setAmount(String(balance || ""));
    setMethod("cash");
    setReference("");
    setNotes("");
    setBusy(false);
  }, [open, balance]);

  if (!customer) return null;

  const amountNum = Number(amount) || 0;
  const willSettle = Math.min(amountNum, balance);
  const remaining = Math.max(0, balance - willSettle);
  const invalid = amountNum <= 0 || amountNum > balance;

  const handleSubmit = async () => {
    if (invalid) return;
    setBusy(true);
    try {
      const res = await receiveUdhaarPayment(userDoc.storeId, customer.id, {
        amount: amountNum,
        paymentMethod: method,
        reference,
        notes,
        receivedBy: user?.uid || "",
        receivedByName: userDoc?.displayName || user?.email || "",
      });
      toast.success(
        `${t("udhaarPay.success")} (-${formatCurrency(res.settledAmount)})`,
      );
      onClose?.();
    } catch (e) {
      toast.error(e?.message || "Could not record payment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("udhaarPay.title")}>
      <div className="space-y-4 text-sm">
        <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1">
          <p className="text-xs text-text-muted">{t("udhaarPay.customer")}</p>
          <p className="font-semibold text-text-primary">{customer.name}</p>
          {customer.phone && (
            <p className="text-xs text-text-muted">📞 {customer.phone}</p>
          )}
          <div className="pt-2 flex items-baseline justify-between">
            <span className="text-xs text-text-muted">
              {t("udhaarPay.currentBalance")}
            </span>
            <span className="text-lg font-bold text-warning">
              {formatCurrency(balance)}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted">
            {t("udhaarPay.paymentAmount")}
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              className="flex-1 rounded-xl border border-border px-3 py-2 text-base"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const cleaned = e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\..*)\./g, "$1");
                setAmount(cleaned);
              }}
              disabled={busy}
              autoFocus
            />
            <button
              type="button"
              className="px-3 rounded-xl border border-border text-xs font-semibold whitespace-nowrap"
              onClick={() => setAmount(String(balance))}
              disabled={busy}
            >
              Full
            </button>
          </div>
          {amountNum > 0 && amountNum > balance && (
            <p className="mt-1 text-xs text-error">
              Amount exceeds outstanding balance. Will be capped at{" "}
              {formatCurrency(balance)}.
            </p>
          )}
          <p className="mt-2 text-xs text-text-muted">
            New balance after payment:{" "}
            <span className="font-semibold text-text-primary">
              {formatCurrency(remaining)}
            </span>
          </p>
        </div>

        <div>
          <label className="text-xs text-text-muted">
            {t("udhaarPay.paymentMethod")}
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMethod(m.id)}
                disabled={busy}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  method === m.id
                    ? "bg-primary text-white border-primary"
                    : "border-border text-text-muted"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted">
            {t("udhaarPay.reference")}
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Transaction ID / cheque # / receipt"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            disabled={busy}
          />
        </div>

        <div>
          <label className="text-xs text-text-muted">
            {t("common.notes")}
          </label>
          <textarea
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
            rows={2}
            placeholder="Optional note for ledger"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={busy}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy || invalid}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-50"
        >
          {busy
            ? "Recording…"
            : `${t("khata.receivePayment")} · ${formatCurrency(willSettle)}`}
        </button>
      </div>
    </Modal>
  );
}
