import { Edit3, Power, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../context/LocaleContext";
import useDebounce from "../../hooks/useDebounce";
import useAuthStore from "../../stores/authStore";
import { exportToCSV, exportToJSON } from "../../utils/exportData";
import ActionIconButton from "../ui/ActionIconButton";
import Modal from "../ui/Modal";
import Pagination from "../ui/Pagination";
import SearchInput from "../ui/SearchInput";
import SearchableSelect from "../ui/SearchableSelect";
import ViewToggle from "../ui/ViewToggle";

const sidebarKey = {
  pos: "sidebar.pos",
  products: "sidebar.products",
  inventory: "sidebar.inventory",
  transactions: "sidebar.transactions",
  reports: "sidebar.reports",
  customers: "sidebar.customers",
  settings: "sidebar.settings",
};

const permissionKeys = [
  "pos",
  "products",
  "inventory",
  "transactions",
  "reports",
  "customers",
  "settings",
];

export default function UserList({
  users: usersProp,
  stores: storesProp,
  onOpenCreate,
}) {
  const { t } = useTranslation();
  const authUsers = useAuthStore((s) => s.users);
  const authStores = useAuthStore((s) => s.stores);
  const updateUser = useAuthStore((s) => s.updateUser);
  const deletePlatformUser = useAuthStore((s) => s.deletePlatformUser);

  const users = usersProp || authUsers;
  const stores = storesProp || authStores;

  const [role, setRole] = useState("all");
  const [storeId, setStoreId] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [editPermUser, setEditPermUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const dq = useDebounce(q, 300);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let list = users;

    if (role !== "all") list = list.filter((user) => user.role === role);
    if (storeId !== "all")
      list = list.filter((user) => user.storeId === storeId);
    if (status !== "all") {
      list = list.filter((user) => {
        const active = user.isActive !== false;
        return status === "active" ? active : !active;
      });
    }

    if (dq.trim()) {
      const term = dq.trim().toLowerCase();
      list = list.filter(
        (user) =>
          user.email?.toLowerCase().includes(term) ||
          user.displayName?.toLowerCase().includes(term),
      );
    }

    return list;
  }, [users, role, storeId, status, dq]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const storeName = (id) =>
    stores.find((store) => store.id === id)?.name || t("superAdmin.users.platform");

  const roleLabel = (role) => t(`superAdmin.users.role.${role}`);
  const savePermissions = async () => {
    if (!editPermUser) return;
    try {
      await updateUser(editPermUser.uid || editPermUser.id, {
        permissions: editPermUser.permissions,
      });
      toast.success(t("superAdmin.users.permissionsUpdated"));
      setEditPermUser(null);
    } catch (e) {
      toast.error(e?.message || t("superAdmin.users.permUpdateFailed"));
    }
  };

  const columns = useMemo(
    () => [
      { key: "displayName", label: t("common.name") },
      { key: "email", label: t("common.email") },
      { key: "role", label: t("superAdmin.storeDetail.col.role") },
      { key: "storeId", label: t("superAdmin.col.store") },
      { key: "isActive", label: t("superAdmin.stores.status.active") },
      { key: "createdAt", label: t("superAdmin.stores.col.created"), format: "date" },
    ],
    [t],
  );

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
      toast.success(t("superAdmin.users.updated"));
      setEditUser(null);
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {onOpenCreate && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            {t("superAdmin.users.add")}
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder={t("superAdmin.users.searchPlaceholder")}
          />
        </div>
        <SearchableSelect
          className="min-w-[170px]"
          value={role}
          onChange={(value) => {
            setRole(value);
            setPage(1);
          }}
          options={[
            { value: "all", label: t("superAdmin.users.allRoles") },
            { value: "superadmin", label: t("superAdmin.users.role.superadmin") },
            { value: "admin", label: t("superAdmin.users.role.admin") },
            { value: "manager", label: t("superAdmin.users.role.manager") },
            { value: "cashier", label: t("superAdmin.users.role.cashier") },
          ]}
        />
        <SearchableSelect
          className="min-w-[190px]"
          value={storeId}
          onChange={(value) => {
            setStoreId(value);
            setPage(1);
          }}
          options={[
            { value: "all", label: t("superAdmin.users.allStores") },
            ...stores.map((store) => ({ value: store.id, label: store.name })),
          ]}
        />
        <SearchableSelect
          className="min-w-[150px]"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            { value: "all", label: t("superAdmin.users.allStatus") },
            { value: "active", label: t("superAdmin.stores.status.active") },
            { value: "inactive", label: t("superAdmin.stores.status.inactive") },
          ]}
        />
        <ViewToggle view={view} onChange={setView} />
        <button
          type="button"
          onClick={() => exportToCSV(filtered, columns, "platform-users")}
          className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
        >
          {t("superAdmin.stores.exportCsv")}
        </button>
        <button
          type="button"
          onClick={() => exportToJSON(filtered, "platform-users")}
          className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
        >
          {t("superAdmin.stores.exportJson")}
        </button>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-background text-xs text-text-muted uppercase">
              <tr>
                <th className="p-3 text-left">{t("common.name")}</th>
                <th className="p-3 text-left">{t("common.email")}</th>
                <th className="p-3 text-left">{t("superAdmin.storeDetail.col.role")}</th>
                <th className="p-3 text-left">{t("superAdmin.col.store")}</th>
                <th className="p-3 text-left">{t("superAdmin.users.col.permissions")}</th>
                <th className="p-3 text-left">{t("common.status")}</th>
                <th className="p-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr
                  key={user.uid || user.id}
                  className="border-t border-border/60"
                >
                  <td className="p-3 font-medium text-text-primary">
                    {user.displayName || "-"}
                  </td>
                  <td className="p-3 text-text-muted">{user.email}</td>
                  <td className="p-3 capitalize">{roleLabel(user.role)}</td>
                  <td className="p-3 text-text-muted">
                    {storeName(user.storeId)}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {permissionKeys.map((key) => {
                        const allowed = user.permissions?.[key] !== false;
                        return (
                          <span
                            key={key}
                            className={`text-[10px] rounded-full px-2 py-0.5 ${
                              allowed
                                ? "bg-success/15 text-success"
                                : "bg-error/15 text-error"
                            }`}
                          >
                            {t(sidebarKey[key])}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs rounded-full px-2 py-1 ${user.isActive === false ? "bg-error/15 text-error" : "bg-success/15 text-success"}`}
                    >
                      {user.isActive === false
                        ? t("superAdmin.stores.status.inactive")
                        : t("superAdmin.stores.status.active")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {user.role !== "superadmin" && (
                        <>
                          <ActionIconButton
                            title={t("superAdmin.users.action.editPermissions")}
                            icon={Edit3}
                            tone="warning"
                            onClick={() =>
                              setEditPermUser({
                                ...user,
                                permissions: { ...user.permissions },
                              })
                            }
                          />
                          <ActionIconButton
                            title={t("superAdmin.users.action.editUser")}
                            icon={Edit3}
                            tone="info"
                            onClick={() => setEditUser({ ...user })}
                          />
                          <ActionIconButton
                            title={
                              user.isActive === false
                                ? t("superAdmin.users.action.activate")
                                : t("superAdmin.users.action.deactivate")
                            }
                            icon={Power}
                            tone={user.isActive === false ? "success" : "danger"}
                            onClick={async () => {
                              try {
                                await updateUser(user.uid || user.id, {
                                  isActive: user.isActive === false,
                                });
                                toast.success(t("superAdmin.users.updated"));
                              } catch (e) {
                                toast.error(
                                  e?.message || t("superAdmin.users.updateFailed"),
                                );
                              }
                            }}
                          />
                          <ActionIconButton
                            title={t("superAdmin.users.action.deleteUser")}
                            icon={Trash2}
                            tone="danger"
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  t("superAdmin.users.deleteConfirm", {
                                    email: user.email,
                                  }),
                                )
                              ) {
                                return;
                              }
                              try {
                                await deletePlatformUser(
                                  user.uid || user.id,
                                );
                                toast.success(t("superAdmin.users.deleted"));
                              } catch (e) {
                                toast.error(e?.message || t("toast.failed"));
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!paged.length && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-text-muted">
                    {t("superAdmin.users.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {paged.map((user) => (
            <div
              key={user.uid || user.id}
              className="rounded-2xl border border-border bg-surface p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary">
                    {user.displayName || "-"}
                  </p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
                {user.role !== "superadmin" && (
                  <ActionIconButton
                    title={
                      user.isActive === false
                        ? t("superAdmin.users.action.activate")
                        : t("superAdmin.users.action.deactivate")
                    }
                    icon={Power}
                    tone={user.isActive === false ? "success" : "danger"}
                    onClick={async () => {
                      try {
                        await updateUser(user.uid || user.id, {
                          isActive: user.isActive === false,
                        });
                        toast.success(t("superAdmin.users.updated"));
                      } catch (e) {
                        toast.error(e?.message || t("superAdmin.users.updateFailed"));
                      }
                    }}
                  />
                )}
              </div>
              <p className="text-xs text-text-muted capitalize">
                {roleLabel(user.role)} · {storeName(user.storeId)}
              </p>
              <div className="flex flex-wrap gap-1">
                {permissionKeys.map((key) => (
                  <span
                    key={key}
                    className={`text-[10px] rounded-full px-2 py-0.5 ${
                      user.permissions?.[key] !== false
                        ? "bg-success/15 text-success"
                        : "bg-error/15 text-error"
                    }`}
                  >
                    {t(sidebarKey[key])}
                  </span>
                ))}
              </div>
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

      <Modal
        open={!!editPermUser}
        onClose={() => setEditPermUser(null)}
        title={
          editPermUser
            ? t("superAdmin.users.editPermissionsFor", {
                name: editPermUser.displayName || editPermUser.email,
              })
            : t("superAdmin.users.editPermissions")
        }
      >
        {editPermUser && (
          <div className="space-y-3 text-sm">
            <p className="text-text-muted">
              {t("superAdmin.users.storeLabel", {
                name: storeName(editPermUser.storeId),
              })}
            </p>
            <div className="space-y-2">
              {permissionKeys.map((key) => {
                const storeAllows =
                  stores.find((store) => store.id === editPermUser.storeId)
                    ?.menuConfig?.[key] === true;
                const userAllows = editPermUser.permissions?.[key] !== false;
                const effective = storeAllows && userAllows;
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {t(sidebarKey[key])}
                      </p>
                      <p className="text-xs text-text-muted">
                        {t("superAdmin.users.perm.storeEffective", {
                          store: storeAllows
                            ? t("superAdmin.users.perm.enabled")
                            : t("superAdmin.users.perm.disabled"),
                          effective: effective
                            ? t("superAdmin.users.perm.allowed")
                            : t("superAdmin.users.perm.blocked"),
                        })}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userAllows}
                      onChange={(e) =>
                        setEditPermUser((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            [key]: e.target.checked,
                          },
                        }))
                      }
                    />
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              onClick={savePermissions}
              className="w-full rounded-xl bg-primary text-white py-2.5 font-semibold"
            >
              {t("superAdmin.users.savePermissions")}
            </button>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={
          editUser
            ? t("superAdmin.users.editUserFor", { email: editUser.email })
            : t("superAdmin.users.editUser")
        }
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
              <option value="admin">{t("superAdmin.users.role.admin")}</option>
              <option value="manager">{t("superAdmin.users.role.manager")}</option>
              <option value="cashier">{t("superAdmin.users.role.cashier")}</option>
            </select>
            <select
              className="w-full rounded-xl border border-border px-3 py-2"
              value={editUser.storeId || ""}
              onChange={(e) =>
                setEditUser((p) => ({
                  ...p,
                  storeId: e.target.value || null,
                }))
              }
            >
              <option value="">{t("superAdmin.users.noStorePlatform")}</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
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
              {t("superAdmin.users.accountActive")}
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
