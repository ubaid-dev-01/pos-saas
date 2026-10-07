import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import {
  ArrowLeft,
  FileText,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { db } from "../../config/firebase";
import useAuthStore from "../../stores/authStore";
import { parseStoreIdFromPath } from "../../utils/superAdminPath";
import { formatCurrency, formatDateTime } from "../../utils/format";
import ActionIconButton from "../ui/ActionIconButton";
import Modal from "../ui/Modal";

const TAB_IDS = [
  "overview",
  "users",
  "products",
  "customers",
  "transactions",
  "invoices",
];

export default function StoreDetail({ stores = [], users = [] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const storeId = parseStoreIdFromPath(pathname);

  const updateStorePlatform = useAuthStore((s) => s.updateStorePlatform);
  const deleteStorePlatform = useAuthStore((s) => s.deleteStorePlatform);
  const updateUser = useAuthStore((s) => s.updateUser);
  const deletePlatformUser = useAuthStore((s) => s.deletePlatformUser);

  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [busy, setBusy] = useState(false);

  const store = stores.find((item) => item.id === storeId) || null;

  const tabs = useMemo(
    () =>
      TAB_IDS.map((id) => ({
        id,
        label: t(`superAdmin.storeDetail.tab.${id}`),
      })),
    [t],
  );

  const planLabel = (plan) => {
    const key = `superAdmin.stores.plan.${plan || "free"}`;
    const label = t(key);
    return label === key ? plan || "free" : label;
  };

  const roleLabel = (role) => {
    const key = `superAdmin.users.role.${role}`;
    const label = t(key);
    return label === key ? role : label;
  };

  useEffect(() => {
    if (!storeId) return undefined;
    const unsubs = [
      onSnapshot(query(collection(db, "stores", storeId, "products")), (snap) =>
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      ),
      onSnapshot(
        query(collection(db, "stores", storeId, "transactions")),
        (snap) =>
          setTransactions(
            snap.docs.map((d) => {
              const tx = d.data();
              const date =
                tx.date?.toDate?.()?.toISOString?.() ||
                (tx.date?.seconds
                  ? new Date(tx.date.seconds * 1000).toISOString()
                  : tx.date);
              return { id: d.id, ...tx, date };
            }),
          ),
      ),
      onSnapshot(query(collection(db, "stores", storeId, "customers")), (snap) =>
        setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [storeId]);

  const scopedUsers = useMemo(
    () => users.filter((user) => user.storeId === storeId),
    [users, storeId],
  );

  const stats = useMemo(() => {
    const revenue = transactions.reduce(
      (sum, tx) => sum + (Number(tx.grandTotal) || 0),
      0,
    );
    const withInvoice = transactions.filter((tx) => tx.invoiceNo);
    const activeProducts = products.filter((p) => p.isActive !== false).length;
    const lowStock = products.filter(
      (p) => Number(p.stock) <= Number(p.lowStockThreshold ?? 5),
    ).length;

    return {
      revenue,
      txCount: transactions.length,
      invoiceCount: withInvoice.length,
      invoiceCounter: Number(store?.invoiceCounter) || 0,
      productCount: products.length,
      activeProducts,
      lowStock,
      customerCount: customers.length,
      userCount: scopedUsers.length,
    };
  }, [transactions, products, customers, scopedUsers, store]);

  const revenueSeries = useMemo(() => {
    const map = new Map();
    transactions.forEach((tx) => {
      const day = String(tx.date || "").slice(0, 10);
      if (!day) return;
      map.set(day, (map.get(day) || 0) + (Number(tx.grandTotal) || 0));
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, revenue]) => ({ date, revenue }));
  }, [transactions]);

  const invoices = useMemo(
    () =>
      [...transactions]
        .filter((tx) => tx.invoiceNo)
        .sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))),
    [transactions],
  );

  const openEditStore = () => {
    if (!store) return;
    setEditForm({
      name: store.name || "",
      ownerName: store.ownerName || "",
      ownerEmail: store.ownerEmail || store.email || "",
      phone: store.phone || "",
      address: store.address || "",
      plan: store.plan || "free",
      isActive: store.isActive !== false,
    });
    setEditOpen(true);
  };

  const saveStore = async () => {
    if (!storeId || !editForm) return;
    setBusy(true);
    try {
      await updateStorePlatform(storeId, {
        name: editForm.name.trim(),
        ownerName: editForm.ownerName.trim(),
        ownerEmail: editForm.ownerEmail.trim(),
        email: editForm.ownerEmail.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        plan: editForm.plan,
        isActive: editForm.isActive,
      });
      toast.success(t("superAdmin.storeDetail.storeUpdated"));
      setEditOpen(false);
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    } finally {
      setBusy(false);
    }
  };

  const removeStore = async () => {
    if (!storeId || !store) return;
    if (
      !window.confirm(
        t("superAdmin.storeDetail.deleteStoreConfirm", { name: store.name }),
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteStorePlatform(storeId);
      toast.success(t("superAdmin.stores.deleted"));
      navigate("/super-admin/stores");
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    } finally {
      setBusy(false);
    }
  };

  const removeProduct = async (productId, name) => {
    if (!window.confirm(t("superAdmin.storeDetail.deleteProductConfirm", { name })))
      return;
    try {
      await deleteDoc(doc(db, "stores", storeId, "products", productId));
      toast.success(t("superAdmin.storeDetail.productDeleted"));
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const removeCustomer = async (customerId, name) => {
    if (!window.confirm(t("superAdmin.storeDetail.deleteCustomerConfirm", { name })))
      return;
    try {
      await deleteDoc(doc(db, "stores", storeId, "customers", customerId));
      toast.success(t("superAdmin.storeDetail.customerDeleted"));
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const saveUserEdit = async () => {
    if (!editUser) return;
    const uid = editUser.uid || editUser.id;
    setBusy(true);
    try {
      await updateUser(uid, {
        displayName: editUser.displayName?.trim() || "",
        role: editUser.role,
        storeId: editUser.storeId || null,
        isActive: editUser.isActive !== false,
      });
      toast.success(t("superAdmin.storeDetail.userUpdated"));
      setEditUser(null);
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    } finally {
      setBusy(false);
    }
  };

  if (!storeId) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-text-muted">{t("superAdmin.storeDetail.invalidLink")}</p>
        <button
          type="button"
          onClick={() => navigate("/super-admin/stores")}
          className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-sm"
        >
          {t("superAdmin.storeDetail.backToStores")}
        </button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-text-muted">{t("superAdmin.storeDetail.notFound")}</p>
        <button
          type="button"
          onClick={() => navigate("/super-admin/stores")}
          className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-sm"
        >
          {t("superAdmin.storeDetail.backToStores")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/super-admin/stores")}
              className="p-2 rounded-xl border border-border hover:bg-background shrink-0"
              aria-label={t("common.back")}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-text-muted">
                {t("superAdmin.storeDetail.subtitle", { storeId })}
              </p>
              <h2 className="text-2xl font-bold text-text-primary truncate">
                {store.name}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                {store.ownerEmail || store.email || t("superAdmin.storeDetail.noEmail")}{" "}
                · {store.phone || t("superAdmin.storeDetail.noPhone")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openEditStore}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-background"
            >
              <Pencil className="w-4 h-4" />
              {t("superAdmin.storeDetail.editStore")}
            </button>
            <button
              type="button"
              onClick={removeStore}
              disabled={busy}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-error/10 text-error text-sm font-semibold hover:bg-error/20"
            >
              <Trash2 className="w-4 h-4" />
              {t("common.delete")}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                tab === item.id
                  ? "bg-primary text-white border-primary"
                  : "border-border text-text-muted hover:bg-background"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              [t("superAdmin.storeDetail.stat.users"), stats.userCount, Users],
              [t("superAdmin.storeDetail.stat.products"), stats.productCount, null],
              [t("superAdmin.storeDetail.stat.customers"), stats.customerCount, null],
              [t("superAdmin.storeDetail.stat.sales"), stats.txCount, null],
              [t("superAdmin.storeDetail.stat.invoices"), stats.invoiceCount, FileText],
              [t("superAdmin.storeDetail.stat.invoiceNo"), stats.invoiceCounter, null],
              [t("superAdmin.storeDetail.stat.revenue"), formatCurrency(stats.revenue), null],
              [t("superAdmin.storeDetail.stat.lowStock"), stats.lowStock, null],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <p className="text-xs text-text-muted">{label}</p>
                <p className="text-xl font-bold text-text-primary mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 text-sm">
              <p className="font-semibold text-text-primary">
                {t("superAdmin.storeDetail.storeProfile")}
              </p>
              <p className="text-text-muted">
                {t("superAdmin.storeDetail.owner")}: {store.ownerName || "-"}
              </p>
              <p className="text-text-muted">
                {t("superAdmin.storeDetail.address")}: {store.address || "-"}
              </p>
              <p className="text-text-muted capitalize">
                {t("superAdmin.storeDetail.planLabel")}: {planLabel(store.plan)} ·{" "}
                {store.isActive === false
                  ? t("superAdmin.stores.status.inactive")
                  : t("superAdmin.stores.status.active")}
              </p>
              <p className="text-text-muted">
                {t("superAdmin.storeDetail.created")}:{" "}
                {formatDateTime(store.createdAt)}
              </p>
              <p className="text-text-muted">
                {t("superAdmin.storeDetail.activeProducts", {
                  active: stats.activeProducts,
                  total: stats.productCount,
                })}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-text-primary mb-3">
                {t("superAdmin.storeDetail.revenueLast30")}
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries}>
                    <defs>
                      <linearGradient id="storeRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2A9D8F" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2A9D8F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6ecf2" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2A9D8F"
                      fill="url(#storeRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <DataTable
          columns={[
            t("superAdmin.storeDetail.col.name"),
            t("superAdmin.storeDetail.col.email"),
            t("superAdmin.storeDetail.col.role"),
            t("superAdmin.storeDetail.col.status"),
            t("superAdmin.storeDetail.col.actions"),
          ]}
          rows={scopedUsers}
          empty={t("superAdmin.storeDetail.empty.users")}
          renderRow={(user) => (
            <tr key={user.uid || user.id} className="border-t border-border/60">
              <td className="p-3 font-medium">{user.displayName || "-"}</td>
              <td className="p-3 text-text-muted">{user.email}</td>
              <td className="p-3 capitalize">{roleLabel(user.role)}</td>
              <td className="p-3">
                {user.isActive === false
                  ? t("superAdmin.stores.status.inactive")
                  : t("superAdmin.stores.status.active")}
              </td>
              <td className="p-3 text-right">
                <ActionIconButton
                  title={t("common.edit")}
                  icon={Pencil}
                  tone="warning"
                  onClick={() => setEditUser({ ...user })}
                />
                {user.role !== "superadmin" && (
                  <ActionIconButton
                    title={t("common.delete")}
                    icon={Trash2}
                    tone="danger"
                    onClick={async () => {
                      if (
                        !window.confirm(
                          t("superAdmin.storeDetail.deleteUserConfirm", {
                            email: user.email,
                          }),
                        )
                      )
                        return;
                      try {
                        await deletePlatformUser(user.uid || user.id);
                        toast.success(t("superAdmin.storeDetail.userRemoved"));
                      } catch (e) {
                        toast.error(e?.message || t("toast.failed"));
                      }
                    }}
                  />
                )}
              </td>
            </tr>
          )}
        />
      )}

      {tab === "products" && (
        <DataTable
          columns={[
            t("superAdmin.storeDetail.col.name"),
            t("superAdmin.storeDetail.col.sku"),
            t("superAdmin.storeDetail.col.category"),
            t("superAdmin.storeDetail.col.price"),
            t("superAdmin.storeDetail.col.stock"),
            t("superAdmin.storeDetail.col.actions"),
          ]}
          rows={products}
          empty={t("superAdmin.storeDetail.empty.products")}
          renderRow={(p) => (
            <tr key={p.id} className="border-t border-border/60">
              <td className="p-3 font-medium">{p.name}</td>
              <td className="p-3 text-text-muted">{p.sku || "-"}</td>
              <td className="p-3 text-text-muted">{p.category || "-"}</td>
              <td className="p-3">{formatCurrency(p.price || 0)}</td>
              <td className="p-3">{p.stock ?? 0}</td>
              <td className="p-3 text-right">
                <ActionIconButton
                  title={t("common.delete")}
                  icon={Trash2}
                  tone="danger"
                  onClick={() => removeProduct(p.id, p.name)}
                />
              </td>
            </tr>
          )}
        />
      )}

      {tab === "customers" && (
        <DataTable
          columns={[
            t("superAdmin.storeDetail.col.name"),
            t("superAdmin.storeDetail.col.email"),
            t("superAdmin.storeDetail.col.phone"),
            t("superAdmin.storeDetail.col.spent"),
            t("superAdmin.storeDetail.col.actions"),
          ]}
          rows={customers}
          empty={t("superAdmin.storeDetail.empty.customers")}
          renderRow={(c) => (
            <tr key={c.id} className="border-t border-border/60">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3 text-text-muted">{c.email || "-"}</td>
              <td className="p-3 text-text-muted">{c.phone || "-"}</td>
              <td className="p-3">{formatCurrency(c.totalSpent || 0)}</td>
              <td className="p-3 text-right">
                <ActionIconButton
                  title={t("common.delete")}
                  icon={Trash2}
                  tone="danger"
                  onClick={() => removeCustomer(c.id, c.name)}
                />
              </td>
            </tr>
          )}
        />
      )}

      {tab === "transactions" && (
        <DataTable
          columns={[
            t("superAdmin.storeDetail.col.id"),
            t("superAdmin.storeDetail.col.date"),
            t("superAdmin.storeDetail.col.customer"),
            t("superAdmin.storeDetail.col.total"),
            t("superAdmin.storeDetail.col.payment"),
            t("superAdmin.storeDetail.col.status"),
          ]}
          rows={transactions.slice(0, 200)}
          empty={t("superAdmin.storeDetail.empty.transactions")}
          renderRow={(tx) => (
            <tr key={tx.id} className="border-t border-border/60">
              <td className="p-3 font-mono text-xs">{tx.id.slice(0, 8)}…</td>
              <td className="p-3 text-text-muted">{formatDateTime(tx.date)}</td>
              <td className="p-3">
                {tx.customerName || t("superAdmin.storeDetail.walkIn")}
              </td>
              <td className="p-3">{formatCurrency(tx.grandTotal || 0)}</td>
              <td className="p-3 capitalize">{tx.paymentMethod || "-"}</td>
              <td className="p-3 capitalize">{tx.status || "completed"}</td>
            </tr>
          )}
        />
      )}

      {tab === "invoices" && (
        <DataTable
          columns={[
            t("superAdmin.storeDetail.col.invoiceNo"),
            t("superAdmin.storeDetail.col.date"),
            t("superAdmin.storeDetail.col.customer"),
            t("superAdmin.storeDetail.col.total"),
            t("superAdmin.storeDetail.col.cashier"),
            t("superAdmin.storeDetail.col.status"),
          ]}
          rows={invoices.slice(0, 200)}
          empty={t("superAdmin.storeDetail.empty.invoices")}
          renderRow={(tx) => (
            <tr key={tx.id} className="border-t border-border/60">
              <td className="p-3 font-semibold text-primary">
                {tx.invoiceNo || "-"}
              </td>
              <td className="p-3 text-text-muted">{formatDateTime(tx.date)}</td>
              <td className="p-3">
                {tx.customerName || t("superAdmin.storeDetail.walkIn")}
              </td>
              <td className="p-3">{formatCurrency(tx.grandTotal || 0)}</td>
              <td className="p-3 text-text-muted">{tx.cashierName || "-"}</td>
              <td className="p-3 capitalize">{tx.status || "completed"}</td>
            </tr>
          )}
        />
      )}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("superAdmin.storeDetail.editStoreTitle")}
      >
        {editForm && (
          <div className="space-y-3 text-sm">
            {[
              ["name", t("superAdmin.storeDetail.storeName")],
              ["ownerName", t("superAdmin.storeDetail.ownerName")],
              ["ownerEmail", t("superAdmin.storeDetail.ownerEmail")],
              ["phone", t("common.phone")],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-text-muted">{label}</label>
                <input
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                  value={editForm[key]}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-text-muted">
                {t("superAdmin.storeDetail.address")}
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                rows={2}
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, address: e.target.value }))
                }
              />
            </div>
            <select
              className="w-full rounded-xl border border-border px-3 py-2"
              value={editForm.plan}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, plan: e.target.value }))
              }
            >
              <option value="free">{t("superAdmin.stores.plan.free")}</option>
              <option value="premium">{t("superAdmin.stores.plan.premium")}</option>
              <option value="enterprise">
                {t("superAdmin.stores.plan.enterprise")}
              </option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, isActive: e.target.checked }))
                }
              />
              {t("superAdmin.storeDetail.storeActive")}
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={saveStore}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold"
            >
              {busy
                ? t("superAdmin.storeDetail.saving")
                : t("superAdmin.storeDetail.saveChanges")}
            </button>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={t("superAdmin.storeDetail.editUserTitle")}
      >
        {editUser && (
          <div className="space-y-3 text-sm">
            <input
              className="w-full rounded-xl border border-border px-3 py-2"
              placeholder={t("superAdmin.storeDetail.displayName")}
              value={editUser.displayName || ""}
              onChange={(e) =>
                setEditUser((p) => ({ ...p, displayName: e.target.value }))
              }
            />
            <select
              className="w-full rounded-xl border border-border px-3 py-2"
              value={editUser.role}
              onChange={(e) =>
                setEditUser((p) => ({ ...p, role: e.target.value }))
              }
            >
              <option value="admin">{t("superAdmin.storeDetail.role.admin")}</option>
              <option value="manager">
                {t("superAdmin.storeDetail.role.manager")}
              </option>
              <option value="cashier">
                {t("superAdmin.storeDetail.role.cashier")}
              </option>
            </select>
            <select
              className="w-full rounded-xl border border-border px-3 py-2"
              value={editUser.storeId || ""}
              onChange={(e) =>
                setEditUser((p) => ({ ...p, storeId: e.target.value || null }))
              }
            >
              <option value="">{t("superAdmin.storeDetail.noStore")}</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editUser.isActive !== false}
                onChange={(e) =>
                  setEditUser((p) => ({ ...p, isActive: e.target.checked }))
                }
              />
              {t("superAdmin.stores.status.active")}
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={saveUserEdit}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold"
            >
              {busy
                ? t("superAdmin.storeDetail.saving")
                : t("superAdmin.storeDetail.saveUser")}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DataTable({ columns, rows, empty, renderRow }) {
  return (
    <div className="overflow-auto rounded-2xl border border-border bg-surface">
      <table className="min-w-full text-sm">
        <thead className="bg-background text-xs text-text-muted uppercase">
          <tr>
            {columns.map((col, index) => (
              <th
                key={col}
                className={`p-3 text-left ${index === columns.length - 1 ? "text-right" : ""}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => renderRow(row))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-text-muted">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
