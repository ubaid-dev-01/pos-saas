import { ExternalLink, LayoutGrid, List, Power, Settings2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import useDebounce from "../../hooks/useDebounce";
import useAuthStore from "../../stores/authStore";
import {
    exportToCSV,
    exportToJSON,
    generatePrintReport,
} from "../../utils/exportData";
import { formatCurrency, formatDate } from "../../utils/format";
import ActionIconButton from "../ui/ActionIconButton";
import Pagination from "../ui/Pagination";
import SearchInput from "../ui/SearchInput";
import SearchableSelect from "../ui/SearchableSelect";

export default function StoreList({
  stores: storesProp,
  users: usersProp,
  transactions = [],
  onOpenMenu,
  onOpenCreate,
  onOpenImport,
}) {
  const { t } = useTranslation();
  const authStores = useAuthStore((s) => s.stores);
  const authUsers = useAuthStore((s) => s.users);
  const setStoreActive = useAuthStore((s) => s.setStoreActive);
  const deleteStorePlatform = useAuthStore((s) => s.deleteStorePlatform);
  const navigate = useNavigate();

  const stores = storesProp || authStores;
  const users = usersProp || authUsers;

  const [q, setQ] = useState("");
  const [view, setView] = useState("table");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("revenue_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState({});

  const dq = useDebounce(q, 300);

  const metrics = useMemo(() => {
    const txByStore = new Map();
    transactions.forEach((tx) => {
      txByStore.set(
        tx.storeId,
        (txByStore.get(tx.storeId) || 0) + (Number(tx.grandTotal) || 0),
      );
    });

    return stores.reduce((acc, store) => {
      const usersCount = users.filter(
        (user) => user.storeId === store.id,
      ).length;
      const revenue = txByStore.get(store.id) || 0;
      acc[store.id] = { usersCount, revenue };
      return acc;
    }, {});
  }, [stores, users, transactions]);

  const filtered = useMemo(() => {
    let list = stores;

    if (dq.trim()) {
      const term = dq.trim().toLowerCase();
      list = list.filter(
        (store) =>
          store.name?.toLowerCase().includes(term) ||
          store.ownerEmail?.toLowerCase().includes(term) ||
          store.phone?.toLowerCase().includes(term) ||
          store.address?.toLowerCase().includes(term),
      );
    }

    if (planFilter !== "all") {
      list = list.filter(
        (store) => String(store.plan || "free").toLowerCase() === planFilter,
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((store) => {
        const isActive = store.isActive !== false;
        if (statusFilter === "active") return isActive;
        if (statusFilter === "inactive") return !isActive;
        return true;
      });
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortBy === "name_asc")
        return String(a.name || "").localeCompare(String(b.name || ""));
      if (sortBy === "name_desc")
        return String(b.name || "").localeCompare(String(a.name || ""));
      if (sortBy === "created_new")
        return String(b.createdAt || "").localeCompare(
          String(a.createdAt || ""),
        );
      if (sortBy === "created_old")
        return String(a.createdAt || "").localeCompare(
          String(b.createdAt || ""),
        );
      if (sortBy === "revenue_asc")
        return (metrics[a.id]?.revenue || 0) - (metrics[b.id]?.revenue || 0);
      return (metrics[b.id]?.revenue || 0) - (metrics[a.id]?.revenue || 0);
    });

    return sorted;
  }, [stores, dq, planFilter, statusFilter, sortBy, metrics]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((key) => selected[key]),
    [selected],
  );

  const toggleSelected = (id) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const openStoreDetail = (store) => {
    navigate(`/super-admin/stores/${store.id}`);
  };

  const removeStore = async (store) => {
    if (
      !window.confirm(
        t("superAdmin.stores.deleteConfirm", { name: store.name }),
      )
    ) {
      return;
    }
    try {
      await deleteStorePlatform(store.id);
      toast.success(t("superAdmin.stores.deleted"));
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const toggleActive = async (store) => {
    try {
      await setStoreActive(store.id, store.isActive === false);
      toast.success(t("superAdmin.stores.statusUpdated"));
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const bulkActivate = async (next) => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(
        selectedIds.map((storeId) => setStoreActive(storeId, next)),
      );
      toast.success(t("superAdmin.stores.bulkUpdateDone"));
      setSelected({});
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const columns = useMemo(
    () => [
      { key: "name", label: t("superAdmin.stores.col.storeName") },
      { key: "ownerEmail", label: t("superAdmin.stores.col.ownerEmail") },
      { key: "phone", label: t("superAdmin.stores.col.phone") },
      { key: "plan", label: t("superAdmin.stores.col.plan") },
      { key: "createdAt", label: t("superAdmin.stores.col.created"), format: "date" },
    ],
    [t],
  );

  const planLabel = (plan) => {
    const key = `superAdmin.stores.plan.${plan || "free"}`;
    const label = t(key);
    return label === key ? plan || "free" : label;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreate}
            className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
          >
            {t("superAdmin.stores.create")}
          </button>
          <button
            type="button"
            onClick={onOpenImport}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
          >
            {t("superAdmin.stores.importCsv")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCSV(filtered, columns, "platform-stores")}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
          >
            {t("superAdmin.stores.exportCsv")}
          </button>
          <button
            type="button"
            onClick={() => exportToJSON(filtered, "platform-stores")}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
          >
            {t("superAdmin.stores.exportJson")}
          </button>
          <button
            type="button"
            onClick={() =>
              generatePrintReport(
                t("superAdmin.stores.reportTitle"),
                [
                  {
                    label: t("superAdmin.stores.reportTotalStores"),
                    value: String(filtered.length),
                  },
                  {
                    label: t("superAdmin.stores.reportActiveStores"),
                    value: String(
                      filtered.filter((store) => store.isActive !== false)
                        .length,
                    ),
                  },
                ],
                {
                  columns,
                  rows: filtered,
                },
              )
            }
            className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
          >
            {t("superAdmin.stores.generatePdf")}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder={t("superAdmin.stores.searchPlaceholder")}
          />
        </div>
        <SearchableSelect
          className="min-w-[160px]"
          value={planFilter}
          onChange={(value) => {
            setPlanFilter(value);
            setPage(1);
          }}
          options={[
            { value: "all", label: t("superAdmin.stores.allPlans") },
            { value: "free", label: t("superAdmin.stores.plan.free") },
            { value: "premium", label: t("superAdmin.stores.plan.premium") },
            { value: "enterprise", label: t("superAdmin.stores.plan.enterprise") },
          ]}
        />
        <SearchableSelect
          className="min-w-[170px]"
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          options={[
            { value: "all", label: t("superAdmin.stores.allStatuses") },
            { value: "active", label: t("superAdmin.stores.status.active") },
            { value: "inactive", label: t("superAdmin.stores.status.inactive") },
          ]}
        />
        <SearchableSelect
          className="min-w-[220px]"
          value={sortBy}
          onChange={(value) => setSortBy(value)}
          options={[
            { value: "revenue_desc", label: t("superAdmin.stores.sort.revenueDesc") },
            { value: "revenue_asc", label: t("superAdmin.stores.sort.revenueAsc") },
            { value: "created_new", label: t("superAdmin.stores.sort.createdNew") },
            { value: "created_old", label: t("superAdmin.stores.sort.createdOld") },
            { value: "name_asc", label: t("superAdmin.stores.sort.nameAsc") },
            { value: "name_desc", label: t("superAdmin.stores.sort.nameDesc") },
          ]}
        />
        <div className="inline-flex rounded-xl border border-border overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`px-3 py-2 ${view === "table" ? "bg-primary text-white" : "text-text-muted hover:bg-background"}`}
            title={t("superAdmin.stores.tableView")}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`px-3 py-2 ${view === "grid" ? "bg-primary text-white" : "text-text-muted hover:bg-background"}`}
            title={t("superAdmin.stores.gridView")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="rounded-xl border border-border bg-background px-3 py-2 flex flex-wrap items-center gap-2">
          <p className="text-xs text-text-muted">
            {t("superAdmin.stores.selected", { count: selectedIds.length })}
          </p>
          <button
            type="button"
            onClick={() => bulkActivate(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-success/15 text-success font-semibold"
          >
            {t("superAdmin.stores.activateSelected")}
          </button>
          <button
            type="button"
            onClick={() => bulkActivate(false)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-error/15 text-error font-semibold"
          >
            {t("superAdmin.stores.deactivateSelected")}
          </button>
        </div>
      )}

      {view === "table" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-background text-xs text-text-muted uppercase">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paged.length > 0 &&
                      paged.every((store) => selected[store.id])
                    }
                    onChange={(e) => {
                      const next = { ...selected };
                      paged.forEach((store) => {
                        next[store.id] = e.target.checked;
                      });
                      setSelected(next);
                    }}
                  />
                </th>
                <th className="p-3 text-left">{t("superAdmin.stores.col.storeName")}</th>
                <th className="p-3 text-left">{t("superAdmin.stores.col.owner")}</th>
                <th className="p-3 text-left">{t("superAdmin.stores.col.plan")}</th>
                <th className="p-3 text-left">{t("superAdmin.stores.col.users")}</th>
                <th className="p-3 text-left">{t("superAdmin.stores.col.revenue30d")}</th>
                <th className="p-3 text-left">{t("superAdmin.stores.col.status")}</th>
                <th className="p-3 text-left">{t("superAdmin.stores.col.created")}</th>
                <th className="p-3 text-right">{t("superAdmin.stores.col.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((store) => (
                <tr
                  key={store.id}
                  className="border-t border-border/60 odd:bg-white even:bg-[#F7F9FC]"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={!!selected[store.id]}
                      onChange={() => toggleSelected(store.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-text-primary">
                    {store.name}
                  </td>
                  <td className="p-3 text-text-muted">
                    {store.ownerEmail || "-"}
                  </td>
                  <td className="p-3 capitalize">{planLabel(store.plan)}</td>
                  <td className="p-3 text-text-muted">
                    {metrics[store.id]?.usersCount || 0}
                  </td>
                  <td className="p-3 text-text-muted">
                    {formatCurrency(metrics[store.id]?.revenue || 0)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs rounded-full px-2 py-1 ${store.isActive === false ? "bg-error/15 text-error" : "bg-success/15 text-success"}`}
                    >
                      {store.isActive === false
                        ? t("superAdmin.stores.status.inactive")
                        : t("superAdmin.stores.status.active")}
                    </span>
                  </td>
                  <td className="p-3 text-text-muted">
                    {formatDate(store.createdAt)}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <ActionIconButton
                      title={t("superAdmin.stores.action.fullDetail")}
                      icon={ExternalLink}
                      tone="info"
                      onClick={() => openStoreDetail(store)}
                    />
                    <ActionIconButton
                      title={t("superAdmin.stores.action.menuConfig")}
                      icon={Settings2}
                      tone="warning"
                      onClick={() => onOpenMenu?.(store)}
                    />
                    <ActionIconButton
                      title={t("superAdmin.stores.action.toggleActive")}
                      icon={Power}
                      tone={store.isActive === false ? "success" : "danger"}
                      onClick={() => toggleActive(store)}
                    />
                    <ActionIconButton
                      title={t("superAdmin.stores.action.deleteStore")}
                      icon={Trash2}
                      tone="danger"
                      onClick={() => removeStore(store)}
                    />
                  </td>
                </tr>
              ))}
              {!paged.length && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-muted">
                    {t("superAdmin.stores.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {paged.map((store) => (
            <div
              key={store.id}
              className="rounded-2xl border border-border bg-surface p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary">
                    {store.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {store.ownerEmail || t("superAdmin.stores.noOwnerEmail")}
                  </p>
                </div>
                <span className="text-xs rounded-full px-2 py-1 bg-background text-text-muted capitalize">
                  {planLabel(store.plan)}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {t("superAdmin.stores.revenueUsers", {
                  revenue: formatCurrency(metrics[store.id]?.revenue || 0),
                  users: metrics[store.id]?.usersCount || 0,
                })}
              </p>
              <div className="flex items-center gap-1">
                <ActionIconButton
                  title={t("superAdmin.stores.action.fullDetail")}
                  icon={ExternalLink}
                  tone="info"
                  onClick={() => openStoreDetail(store)}
                />
                <ActionIconButton
                  title={t("superAdmin.stores.action.menuConfig")}
                  icon={Settings2}
                  tone="warning"
                  onClick={() => onOpenMenu?.(store)}
                />
                <ActionIconButton
                  title={t("superAdmin.stores.action.toggleActive")}
                  icon={Power}
                  tone={store.isActive === false ? "success" : "danger"}
                  onClick={() => toggleActive(store)}
                />
                <ActionIconButton
                  title={t("superAdmin.stores.action.delete")}
                  icon={Trash2}
                  tone="danger"
                  onClick={() => removeStore(store)}
                />
              </div>
            </div>
          ))}
          {!paged.length && (
            <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-text-muted">
              {t("superAdmin.stores.noResults")}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <SearchableSelect
          className="min-w-[140px]"
          value={String(pageSize)}
          onChange={(value) => {
            setPageSize(Number(value) || 10);
            setPage(1);
          }}
          options={["10", "25", "50", "100"].map((size) => ({
            value: size,
            label: t("superAdmin.stores.pageSize", { size }),
          }))}
        />
        <Pagination
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>

    </div>
  );
}
