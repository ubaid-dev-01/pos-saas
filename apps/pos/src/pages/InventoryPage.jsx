import {
    AlertTriangle,
    BadgeDollarSign,
    Boxes,
    Eye,
    EyeOff,
    PackageX,
    SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import StockAdjustment from "../components/inventory/StockAdjustment";
import StockHistory from "../components/inventory/StockHistory";
import ActionIconButton from "../components/ui/ActionIconButton";
import Pagination from "../components/ui/Pagination";
import SearchInput from "../components/ui/SearchInput";
import SearchableSelect from "../components/ui/SearchableSelect";
import ViewToggle from "../components/ui/ViewToggle";
import useProductStore from "../stores/productStore";
import { formatCurrency } from "../utils/format";
import { getProductAlerts, getProductHealth } from "../utils/productAlerts";
import { useTranslation } from "../context/LocaleContext";

export default function InventoryPage() {
  const { t } = useTranslation();
  const { products } = useProductStore();
  const [tab, setTab] = useState("overview");
  const [adj, setAdj] = useState(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("table");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const stats = useMemo(() => {
    const active = products.filter((p) => p.isActive !== false);
    const totalVal = active.reduce(
      (s, p) => s + Number(p.stock) * Number(p.costPrice || 0),
      0,
    );
    const alerts = getProductAlerts(active);
    const low = alerts.filter(
      (a) => a.kind === "stock" && a.level === "warning",
    ).length;
    const out = active.filter((p) => Number(p.stock) === 0).length;
    return { count: active.length, totalVal, low, out, atRisk: alerts.length };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products
      .filter((p) => (showInactive ? true : p.isActive !== false))
      .filter((p) => {
        if (!term) return true;
        return (
          p.name?.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term)
        );
      })
      .filter((p) => {
        if (statusFilter === "all") return true;
        const status = getProductHealth(p).label.toLowerCase();
        return statusFilter === "at-risk"
          ? status.includes("risk") ||
              status.includes("stock") ||
              status.includes("expiry")
          : status === statusFilter;
      });
  }, [products, q, statusFilter, showInactive]);

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">{t("inventory.title")}</h1>
      <div className="flex gap-2 flex-wrap">
        {["overview", "history"].map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border ${
              tab === tabKey
                ? "bg-primary text-white border-primary"
                : "border-border text-text-muted"
            }`}
          >
            {tabKey === "overview" ? t("inventory.tab.overview") : t("inventory.tab.history")}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "Products",
                value: stats.count,
                icon: Boxes,
                tone: "from-sky-500/15 to-sky-500/0 text-sky-600",
              },
              {
                label: "Stock value (cost)",
                value: formatCurrency(stats.totalVal),
                icon: BadgeDollarSign,
                tone: "from-emerald-500/15 to-emerald-500/0 text-emerald-600",
              },
              {
                label: "At risk",
                value: stats.atRisk,
                icon: AlertTriangle,
                tone: "from-amber-500/15 to-amber-500/0 text-amber-600",
              },
              {
                label: "Out of stock",
                value: stats.out,
                icon: PackageX,
                tone: "from-rose-500/15 to-rose-500/0 text-rose-600",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`rounded-2xl border border-border bg-gradient-to-br ${c.tone} bg-surface p-4`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-text-muted">{c.label}</p>
                  <c.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-bold text-primary mt-1">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between">
            <div className="flex-1">
              <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Search inventory by name, sku or category..."
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowInactive((prev) => !prev);
                setPage(1);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-medium"
            >
              {showInactive ? (
                <>
                  <EyeOff className="w-4 h-4" /> Hide inactive
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Show inactive
                </>
              )}
            </button>
            <SearchableSelect
              className="min-w-[190px]"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All statuses" },
                { value: "healthy", label: "Healthy" },
                { value: "warning", label: "Warning" },
                { value: "critical", label: "Critical" },
                { value: "at-risk", label: "At risk" },
              ]}
              placeholder="Status"
            />
            <ViewToggle view={view} onChange={setView} />
          </div>
          {view === "table" ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="min-w-full text-sm">
                  <thead className="bg-background text-xs text-text-muted uppercase">
                    <tr>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-right">Stock</th>
                      <th className="p-3 text-right">Threshold</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProducts.map((p) => {
                      const st = Number(p.stock) || 0;
                      const th = Number(p.lowStockThreshold) || 0;
                      const status = getProductHealth(p);
                      return (
                        <tr key={p.id} className="border-b border-border/60">
                          <td className="p-3 font-medium">
                            {p.name}
                            {p.isActive === false && (
                              <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">{st}</td>
                          <td className="p-3 text-right">{th}</td>
                          <td className="p-3 text-text-muted">
                            {status.label}
                          </td>
                          <td className="p-3 text-right">
                            <ActionIconButton
                              title="Adjust stock"
                              icon={SlidersHorizontal}
                              tone="info"
                              disabled={p.isActive === false}
                              onClick={() => p.isActive !== false && setAdj(p)}
                            />
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
                total={filteredProducts.length}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {pagedProducts.map((p) => {
                const st = Number(p.stock) || 0;
                const th = Number(p.lowStockThreshold) || 0;
                const status = getProductHealth(p);
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-border bg-surface p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-text-primary">
                          {p.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {p.category || "Uncategorized"}
                        </p>
                      </div>
                      <ActionIconButton
                        title="Adjust stock"
                        icon={SlidersHorizontal}
                        tone="info"
                        disabled={p.isActive === false}
                        onClick={() => p.isActive !== false && setAdj(p)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-background p-2">
                        <p className="text-text-muted">Stock</p>
                        <p className="font-semibold text-text-primary">{st}</p>
                      </div>
                      <div className="rounded-lg bg-background p-2">
                        <p className="text-text-muted">Threshold</p>
                        <p className="font-semibold text-text-primary">{th}</p>
                      </div>
                      <div className="rounded-lg bg-background p-2">
                        <p className="text-text-muted">Status</p>
                        <p className="font-semibold text-text-primary">
                          {status.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {view === "grid" && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filteredProducts.length}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {tab === "history" && <StockHistory />}

      <StockAdjustment
        open={!!adj}
        onClose={() => setAdj(null)}
        product={adj}
      />
    </div>
  );
}
