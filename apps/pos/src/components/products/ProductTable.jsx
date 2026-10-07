import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency } from "../../utils/format";
import { getProductHealth } from "../../utils/productAlerts";
import ActionIconButton from "../ui/ActionIconButton";
import Badge from "../ui/Badge";
import Pagination from "../ui/Pagination";
import { useTranslation } from "../../context/LocaleContext";

export default function ProductTable({
  products,
  showInactive,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  onHardDelete,
  onView,
  sort,
  onSort,
}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const sorted = useMemo(() => {
    const arr = [...products];
    const [key, dir] = (sort || "name-asc").split("-");
    const mul = dir === "desc" ? -1 : 1;
    arr.sort((a, b) => {
      if (key === "price" || key === "stock")
        return (Number(a[key]) - Number(b[key])) * mul;
      return String(a[key] || "").localeCompare(String(b[key] || "")) * mul;
    });
    return arr;
  }, [products, sort]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const th = (key, label) => (
    <button
      type="button"
      className="text-left text-xs font-semibold text-text-muted uppercase tracking-wide"
      onClick={() => onSort(key)}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={
                    selected.length &&
                    pageItems.every((p) => selected.includes(p.id))
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelect(
                        Array.from(
                          new Set([...selected, ...pageItems.map((p) => p.id)]),
                        ),
                      );
                    } else {
                      onSelect(
                        selected.filter(
                          (id) => !pageItems.some((p) => p.id === id),
                        ),
                      );
                    }
                  }}
                />
              </th>
              <th className="p-3 w-16">Image</th>
              <th className="p-3">{th("name", t("common.name"))}</th>
              <th className="p-3">{th("sku", t("common.sku"))}</th>
              <th className="p-3">{th("category", t("common.category"))}</th>
              <th className="p-3 text-right">{th("price", t("common.price"))}</th>
              <th className="p-3 text-right">{th("stock", t("common.stock"))}</th>
              <th className="p-3">{t("common.status")}</th>
              <th className="p-3 text-right">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((p) => {
              const stock = Number(p.stock) || 0;
              const imageUrl = p?.images?.[0] || "";
              const status = getProductHealth(p);
              return (
                <tr
                  key={p.id}
                  className="border-b border-border/60 hover:bg-background/60"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() =>
                        onSelect(
                          selected.includes(p.id)
                            ? selected.filter((x) => x !== p.id)
                            : [...selected, p.id],
                        )
                      }
                    />
                  </td>
                  <td className="p-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-border flex items-center justify-center text-[10px] text-text-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={p.name || "Product"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        (p.name || "?").slice(0, 2).toUpperCase()
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-text-primary">
                    {p.name}
                    {showInactive && p.isActive === false && (
                      <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-text-muted">{p.sku}</td>
                  <td className="p-3 text-text-muted">{p.category}</td>
                  <td className="p-3 text-right">{formatCurrency(p.price)}</td>
                  <td className="p-3 text-right">{stock}</td>
                  <td className="p-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <ActionIconButton
                      title="View"
                      icon={Eye}
                      tone="info"
                      onClick={() => onView(p)}
                    />
                    <ActionIconButton
                      title="Edit"
                      icon={Pencil}
                      tone="warning"
                      disabled={p.isActive === false}
                      onClick={() => p.isActive !== false && onEdit(p)}
                    />
                    {p.isActive === false ? (
                      <>
                        <ActionIconButton
                          title="Restore"
                          icon={RotateCcw}
                          tone="success"
                          onClick={() => onRestore?.(p)}
                        />
                        <ActionIconButton
                          title="Delete permanently"
                          icon={Trash2}
                          tone="danger"
                          onClick={() => onHardDelete?.(p)}
                        />
                      </>
                    ) : (
                      <ActionIconButton
                        title="Archive"
                        icon={Trash2}
                        tone="danger"
                        onClick={() => onDelete(p)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={sorted.length}
        onPageChange={setPage}
      />
    </div>
  );
}
