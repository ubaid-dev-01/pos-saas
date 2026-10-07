import { History, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { formatCurrency, formatDate } from "../../utils/format";
import ActionIconButton from "../ui/ActionIconButton";
import Pagination from "../ui/Pagination";
import SearchInput from "../ui/SearchInput";
import ViewToggle from "../ui/ViewToggle";
import { useTranslation } from "../../context/LocaleContext";

export default function CustomerTable({
  customers,
  showInactive,
  onEdit,
  onHistory,
  onDelete,
  onRestore,
  onHardDelete,
}) {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const [page, setPage] = useState(1);
  const [view, setView] = useState("table");
  const pageSize = 10;

  const filtered = useMemo(() => {
    if (!dq.trim()) return customers;
    const t = dq.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(t) ||
        c.phone?.toLowerCase().includes(t) ||
        c.email?.toLowerCase().includes(t),
    );
  }, [customers, dq]);

  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder={t('pos.customer.search')}
          />
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>
      {view === "table" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-background text-xs text-text-muted uppercase">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-right">Points</th>
                <th className="p-3 text-right">Spent</th>
                <th className="p-3 text-left">Last</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="p-3 font-medium">
                    {c.name}
                    {showInactive && c.isActive === false && (
                      <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-text-muted">{c.phone}</td>
                  <td className="p-3 text-text-muted">{c.email}</td>
                  <td className="p-3 text-right">{c.loyaltyPoints}</td>
                  <td className="p-3 text-right">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="p-3 text-text-muted">
                    {formatDate(c.lastPurchase)}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <ActionIconButton
                      title="History"
                      icon={History}
                      tone="info"
                      disabled={c.isActive === false}
                      onClick={() => c.isActive !== false && onHistory(c)}
                    />
                    <ActionIconButton
                      title="Edit"
                      icon={Pencil}
                      tone="warning"
                      disabled={c.isActive === false}
                      onClick={() => c.isActive !== false && onEdit(c)}
                    />
                    {c.isActive === false ? (
                      <>
                        <ActionIconButton
                          title="Restore"
                          icon={RotateCcw}
                          tone="success"
                          onClick={() => onRestore?.(c)}
                        />
                        <ActionIconButton
                          title="Delete permanently"
                          icon={Trash2}
                          tone="danger"
                          onClick={() => onHardDelete?.(c)}
                        />
                      </>
                    ) : (
                      <ActionIconButton
                        title="Archive"
                        icon={Trash2}
                        tone="danger"
                        onClick={() => onDelete(c)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {slice.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-surface p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary">
                    {c.name}
                    {showInactive && c.isActive === false && (
                      <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted">
                    {c.email || "No email"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ActionIconButton
                    title="History"
                    icon={History}
                    tone="info"
                    disabled={c.isActive === false}
                    onClick={() => c.isActive !== false && onHistory(c)}
                  />
                  <ActionIconButton
                    title="Edit"
                    icon={Pencil}
                    tone="warning"
                    disabled={c.isActive === false}
                    onClick={() => c.isActive !== false && onEdit(c)}
                  />
                  {c.isActive === false ? (
                    <>
                      <ActionIconButton
                        title="Restore"
                        icon={RotateCcw}
                        tone="success"
                        onClick={() => onRestore?.(c)}
                      />
                      <ActionIconButton
                        title="Delete permanently"
                        icon={Trash2}
                        tone="danger"
                        onClick={() => onHardDelete?.(c)}
                      />
                    </>
                  ) : (
                    <ActionIconButton
                      title="Archive"
                      icon={Trash2}
                      tone="danger"
                      onClick={() => onDelete(c)}
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-text-muted">Phone: {c.phone || "-"}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-background p-2">
                  <p className="text-text-muted">Points</p>
                  <p className="font-semibold text-text-primary">
                    {c.loyaltyPoints || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-background p-2 col-span-2">
                  <p className="text-text-muted">Spent</p>
                  <p className="font-semibold text-text-primary">
                    {formatCurrency(c.totalSpent)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                Last purchase: {formatDate(c.lastPurchase)}
              </p>
            </div>
          ))}
        </div>
      )}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
      />
    </div>
  );
}
