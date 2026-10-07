import { useMemo } from "react";
import useTransactionStore from "../../stores/transactionStore";
import { formatCurrency, formatDateTime } from "../../utils/format";
import Modal from "../ui/Modal";
import { useTranslation } from "../../context/LocaleContext";

export default function CustomerHistory({ open, onClose, customer }) {
  const { t } = useTranslation();
  const { transactions } = useTransactionStore();

  const rows = useMemo(() => {
    if (!customer) return [];
    return transactions
      .filter((t) => t.customerId === customer.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, customer]);

  if (!customer) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${t("customers.history")} · ${customer.name}`}
      wide
    >
      <div className="text-sm space-y-3">
        <div className="flex gap-6 text-text-muted">
          <span>
            Points:{" "}
            <strong className="text-text-primary">
              {customer.loyaltyPoints}
            </strong>
          </span>
          <span>
            Lifetime:{" "}
            <strong className="text-text-primary">
              {formatCurrency(customer.totalSpent)}
            </strong>
          </span>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="min-w-full text-xs">
            <thead className="bg-background text-text-muted uppercase">
              <tr>
                <th className="p-2 text-left">When</th>
                <th className="p-2 text-left">Invoice</th>
                <th className="p-2 text-right">Items</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-border/60">
                  <td className="p-2 whitespace-nowrap">
                    {formatDateTime(t.date)}
                  </td>
                  <td className="p-2 font-mono">{t.invoiceNo}</td>
                  <td className="p-2 text-right">{t.items?.length || 0}</td>
                  <td className="p-2 text-right font-semibold">
                    {formatCurrency(t.grandTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <p className="text-text-muted text-sm">No purchases yet.</p>
        )}
      </div>
    </Modal>
  );
}
