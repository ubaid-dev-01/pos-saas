import { useMemo, useState } from "react";
import { useTranslation } from "../../context/LocaleContext";
import { exportToCSV, exportToJSON } from "../../utils/exportData";
import { formatDateTime } from "../../utils/format";
import Pagination from "../ui/Pagination";
import SearchInput from "../ui/SearchInput";
import SearchableSelect from "../ui/SearchableSelect";

export default function ActivityLog({
  stores = [],
  users = [],
  transactions = [],
}) {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [storeId, setStoreId] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const rows = useMemo(() => {
    let list = transactions.map((tx) => ({
      id: tx.id,
      timestamp: tx.date,
      action:
        tx.status === "voided"
          ? t("superAdmin.activityLog.action.txVoided")
          : t("superAdmin.activityLog.action.saleCompleted"),
      storeId: tx.storeId,
      storeName:
        stores.find((s) => s.id === tx.storeId)?.name ||
        t("superAdmin.activityLog.unknownStore"),
      userName:
        tx.cashierName ||
        users.find((u) => (u.uid || u.id) === tx.cashierId)?.displayName ||
        t("superAdmin.staff"),
      details: `${tx.invoiceNo || tx.id} · ${tx.paymentMethod || "cash"}`,
      amount: Number(tx.grandTotal) || 0,
    }));

    if (storeId !== "all") list = list.filter((row) => row.storeId === storeId);

    if (q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (row) =>
          row.action.toLowerCase().includes(term) ||
          row.storeName.toLowerCase().includes(term) ||
          row.userName.toLowerCase().includes(term) ||
          row.details.toLowerCase().includes(term),
      );
    }

    return list.sort((a, b) =>
      String(b.timestamp || "").localeCompare(String(a.timestamp || "")),
    );
  }, [transactions, stores, users, storeId, q, t]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  const columns = useMemo(
    () => [
      { key: "timestamp", label: t("superAdmin.activityLog.col.timestamp"), format: "datetime" },
      { key: "action", label: t("superAdmin.activityLog.col.action") },
      { key: "storeName", label: t("superAdmin.activityLog.col.store") },
      { key: "userName", label: t("superAdmin.activityLog.col.user") },
      { key: "details", label: t("superAdmin.activityLog.col.details") },
      { key: "amount", label: t("common.amount"), format: "currency" },
    ],
    [t],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder={t("superAdmin.activityLog.searchPlaceholder")}
          />
        </div>
        <SearchableSelect
          className="min-w-[220px]"
          value={storeId}
          onChange={(value) => {
            setStoreId(value);
            setPage(1);
          }}
          options={[
            { value: "all", label: t("superAdmin.activityLog.allStores") },
            ...stores.map((store) => ({ value: store.id, label: store.name })),
          ]}
        />
        <button
          type="button"
          onClick={() => exportToCSV(rows, columns, "platform-activity")}
          className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
        >
          {t("superAdmin.stores.exportCsv")}
        </button>
        <button
          type="button"
          onClick={() => exportToJSON(rows, "platform-activity")}
          className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
        >
          {t("superAdmin.stores.exportJson")}
        </button>
      </div>

      <div className="overflow-auto rounded-2xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-background text-xs text-text-muted uppercase">
            <tr>
              <th className="p-3 text-left">
                {t("superAdmin.activityLog.col.timestamp")}
              </th>
              <th className="p-3 text-left">
                {t("superAdmin.activityLog.col.action")}
              </th>
              <th className="p-3 text-left">
                {t("superAdmin.activityLog.col.store")}
              </th>
              <th className="p-3 text-left">
                {t("superAdmin.activityLog.col.user")}
              </th>
              <th className="p-3 text-left">
                {t("superAdmin.activityLog.col.details")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.id} className="border-t border-border/60">
                <td className="p-3 text-text-muted">
                  {formatDateTime(row.timestamp)}
                </td>
                <td className="p-3 text-text-primary">{row.action}</td>
                <td className="p-3 text-text-muted">{row.storeName}</td>
                <td className="p-3 text-text-muted">{row.userName}</td>
                <td className="p-3 text-text-muted">{row.details}</td>
              </tr>
            ))}
            {!paged.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  {t("superAdmin.activityLog.noResults")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={rows.length}
        onPageChange={setPage}
      />
    </div>
  );
}
