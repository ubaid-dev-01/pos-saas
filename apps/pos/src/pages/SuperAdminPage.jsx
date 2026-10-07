import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    setDoc,
} from "firebase/firestore";
import {
    Activity,
    BarChart3,
    Building2,
    LayoutDashboard,
    Settings,
    UserRound,
    UserRoundSearch,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ActivityLog from "../components/superadmin/ActivityLog";
import LeadsManager from "../components/superadmin/LeadsManager";
import MenuConfigEditor from "../components/superadmin/MenuConfigEditor";
import PlatformDashboard from "../components/superadmin/PlatformDashboard";
import PlatformSettings from "../components/superadmin/PlatformSettings";
import RevenueAnalytics from "../components/superadmin/RevenueAnalytics";
import StoreDetail from "../components/superadmin/StoreDetail";
import StoreList from "../components/superadmin/StoreList";
import UserList from "../components/superadmin/UserList";
import Modal from "../components/ui/Modal";
import { db } from "../config/firebase";
import useAuthStore from "../stores/authStore";
import { exportToCSV, exportToJSON, parseCSV } from "../utils/exportData";
import { useTranslation } from "../context/LocaleContext";

const NAV = [
  {
    key: "dashboard",
    labelKey: "superAdmin.dashboard",
    icon: LayoutDashboard,
    path: "/super-admin",
  },
  {
    key: "stores",
    labelKey: "superAdmin.stores",
    icon: Building2,
    path: "/super-admin/stores",
  },
  { key: "users", labelKey: "superAdmin.users", icon: UserRound, path: "/super-admin/users" },
  {
    key: "leads",
    labelKey: "superAdmin.leads",
    icon: UserRoundSearch,
    path: "/super-admin/leads",
  },
  {
    key: "revenue",
    labelKey: "superAdmin.revenue",
    icon: BarChart3,
    path: "/super-admin/revenue",
  },
  {
    key: "activity",
    labelKey: "superAdmin.activity",
    icon: Activity,
    path: "/super-admin/activity",
  },
  {
    key: "settings",
    labelKey: "superAdmin.platformConfig",
    icon: Settings,
    path: "/super-admin/settings",
  },
];

const DEFAULT_MENU = {
  pos: true,
  products: true,
  inventory: true,
  transactions: true,
  reports: true,
  customers: true,
  settings: true,
};

function resolveSection(pathname) {
  if (
    pathname.startsWith("/super-admin/stores/") &&
    pathname.split("/").length > 3
  ) {
    return "store-detail";
  }
  if (pathname === "/super-admin" || pathname === "/super-admin/")
    return "dashboard";
  const key =
    pathname.replace("/super-admin/", "").split("/")[0] || "dashboard";
  return key;
}

export default function SuperAdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userDoc, createPlatformUser } = useAuthStore();
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [dataLoadError, setDataLoadError] = useState("");

  const [menuStore, setMenuStore] = useState(null);
  const [openCreateStore, setOpenCreateStore] = useState(false);
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [creating, setCreating] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    address: "",
    plan: "free",
  });

  const [userForm, setUserForm] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "admin",
    storeId: "",
  });

  const [csvRows, setCsvRows] = useState([]);

  useEffect(() => {
    if (userDoc?.role !== "superadmin") return undefined;

    const normalizeTxDocs = (docs) => {
      const next = docs.map((docRef) => {
        const tx = docRef.data();
        const storeId = docRef.ref.parent.parent?.id || tx.storeId;
        const normalizedDate =
          tx.date instanceof Date
            ? tx.date.toISOString()
            : typeof tx.date?.toDate === "function"
              ? tx.date.toDate().toISOString()
              : typeof tx.date?.seconds === "number"
                ? new Date(tx.date.seconds * 1000).toISOString()
                : tx.date;
        return { id: docRef.id, ...tx, date: normalizedDate, storeId };
      });
      next.sort((a, b) =>
        String(b.date || "").localeCompare(String(a.date || "")),
      );
      return next;
    };

    const hydrateInitial = async () => {
      try {
        const [storesSnap, usersSnap, leadsSnap] = await Promise.all([
          getDocs(collection(db, "stores")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "leads")),
        ]);

        const nextStores = storesSnap.docs.map((docRef) => ({
          id: docRef.id,
          ...docRef.data(),
        }));
        const nextUsers = usersSnap.docs.map((docRef) => ({
          id: docRef.id,
          ...docRef.data(),
        }));
        const nextLeads = leadsSnap.docs.map((docRef) => ({
          id: docRef.id,
          ...docRef.data(),
        }));

        setStores(nextStores);
        setUsers(nextUsers);
        setLeads(nextLeads);
        setDataLoadError("");
      } catch (err) {
        console.error("[SuperAdmin initial load]", err);
        setDataLoadError(
          "Some dashboard data could not be loaded. Check Firestore rules and indexes.",
        );
      }
    };

    hydrateInitial();

    const unsubStores = onSnapshot(
      collection(db, "stores"),
      (snap) => {
        const next = snap.docs.map((docRef) => ({
          id: docRef.id,
          ...docRef.data(),
        }));
        setStores(next);
        useAuthStore.setState({ stores: next });
      },
      (err) => {
        console.error("[SuperAdmin stores listener]", err);
        setDataLoadError(
          "Stores stream failed. Verify super-admin Firestore permissions.",
        );
      },
    );

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const next = snap.docs.map((docRef) => ({
          id: docRef.id,
          ...docRef.data(),
        }));
        setUsers(next);
        useAuthStore.setState({ users: next });
      },
      (err) => {
        console.error("[SuperAdmin users listener]", err);
        setDataLoadError(
          "Users stream failed. Verify super-admin Firestore permissions.",
        );
      },
    );

    const unsubLeads = onSnapshot(
      collection(db, "leads"),
      (snap) => {
        const next = snap.docs.map((docRef) => ({
          id: docRef.id,
          ...docRef.data(),
        }));
        setLeads(next);
      },
      (err) => {
        console.error("[SuperAdmin leads listener]", err);
        setDataLoadError(
          "Leads stream failed. Verify leads read rule for super-admin.",
        );
      },
    );

    return () => {
      unsubStores();
      unsubUsers();
      unsubLeads();
    };
  }, [userDoc?.role]);

  useEffect(() => {
    if (userDoc?.role !== "superadmin") return undefined;
    if (!stores.length) {
      setTransactions([]);
      return undefined;
    }

    const storeTxMap = new Map();

    const normalizeTxDocs = (docs) =>
      docs.map((docRef) => {
        const tx = docRef.data();
        const normalizedDate =
          tx.date instanceof Date
            ? tx.date.toISOString()
            : typeof tx.date?.toDate === "function"
              ? tx.date.toDate().toISOString()
              : typeof tx.date?.seconds === "number"
                ? new Date(tx.date.seconds * 1000).toISOString()
                : tx.date;
        return {
          id: docRef.id,
          ...tx,
          date: normalizedDate,
          storeId: docRef.ref.parent.parent?.id || tx.storeId,
        };
      });

    const syncTransactions = () => {
      const next = [...storeTxMap.values()]
        .flat()
        .sort((a, b) =>
          String(b.date || "").localeCompare(String(a.date || "")),
        );
      setTransactions(next);
    };

    const unsubs = stores.map((store) =>
      onSnapshot(
        collection(db, "stores", store.id, "transactions"),
        (snap) => {
          storeTxMap.set(store.id, normalizeTxDocs(snap.docs));
          syncTransactions();
        },
        (err) => {
          console.error(`[SuperAdmin transactions listener:${store.id}]`, err);
          setDataLoadError(
            "Transactions data could not be loaded from one or more stores. Check Firestore rules for store transactions.",
          );
        },
      ),
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [stores, userDoc?.role]);

  const section = useMemo(
    () => resolveSection(location.pathname),
    [location.pathname],
  );

  const createStore = async () => {
    if (!storeForm.name.trim()) {
      toast.error(t("toast.storeNameRequired"));
      return;
    }
    try {
      setCreating(true);
      const id = `store-${uuidv4()}`;
      const now = new Date().toISOString();
      await setDoc(doc(db, "stores", id), {
        id,
        name: storeForm.name.trim(),
        ownerName: storeForm.ownerName.trim(),
        ownerEmail: storeForm.ownerEmail.trim(),
        phone: storeForm.phone.trim(),
        address: storeForm.address.trim(),
        ownerId: user?.uid || "",
        plan: storeForm.plan,
        isActive: true,
        menuConfig: { ...DEFAULT_MENU },
        categories: ["General"],
        taxRates: [{ id: "tax-default", name: "No Tax", rate: 0 }],
        createdAt: now,
      });
      toast.success(t("toast.storeCreated"));
      setOpenCreateStore(false);
      setStoreForm({
        name: "",
        ownerName: "",
        ownerEmail: "",
        phone: "",
        address: "",
        plan: "free",
      });
    } catch (e) {
      toast.error(e?.message || "Failed to create store");
    } finally {
      setCreating(false);
    }
  };

  const createUser = async () => {
    if (!userForm.email.trim()) {
      toast.error(t("toast.userEmailRequired"));
      return;
    }
    if (!userForm.password || userForm.password.length < 6) {
      toast.error(t("toast.passwordMinLength"));
      return;
    }
    try {
      setCreating(true);
      await createPlatformUser({
        email: userForm.email.trim(),
        password: userForm.password,
        displayName: userForm.displayName.trim(),
        role: userForm.role,
        storeId: userForm.storeId || null,
        permissions: { ...DEFAULT_MENU },
      });
      toast.success(t("toast.userCreatedSignIn"));
      setOpenCreateUser(false);
      setUserForm({
        displayName: "",
        email: "",
        password: "",
        role: "admin",
        storeId: "",
      });
    } catch (e) {
      toast.error(e?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const importStores = async () => {
    if (!csvRows.length) {
      toast.error(t("toast.uploadCsvFirst"));
      return;
    }
    try {
      setCreating(true);
      await Promise.all(
        csvRows.map((row) => {
          const id = `store-${uuidv4()}`;
          return setDoc(doc(db, "stores", id), {
            id,
            name: row.store_name || row.name || "Unnamed Store",
            ownerName: row.owner_name || "",
            ownerEmail: row.owner_email || "",
            phone: row.phone || "",
            address: row.address || "",
            ownerId: user?.uid || "",
            plan: String(row.plan || "free").toLowerCase(),
            isActive: true,
            menuConfig: { ...DEFAULT_MENU },
            categories: ["General"],
            taxRates: [{ id: "tax-default", name: "No Tax", rate: 0 }],
            createdAt: new Date().toISOString(),
          });
        }),
      );
      toast.success(t("toast.storesImported", { count: csvRows.length }));
      setOpenImport(false);
      setCsvRows([]);
    } catch (e) {
      toast.error(e?.message || "Import failed");
    } finally {
      setCreating(false);
    }
  };

  const exportAllData = () => {
    exportToCSV(
      stores,
      [
        { key: "name", label: "Store Name" },
        { key: "ownerEmail", label: "Owner Email" },
        { key: "phone", label: "Phone" },
        { key: "plan", label: "Plan" },
        { key: "isActive", label: "Active" },
        { key: "createdAt", label: "Created", format: "datetime" },
      ],
      "quickpos-stores",
    );
    exportToJSON(
      { stores, users, transactions, leads },
      "quickpos-platform-data",
    );
    toast.success(t("toast.exportsGenerated"));
  };

  const renderBody = () => {
    if (section === "store-detail") {
      return <StoreDetail stores={stores} users={users} />;
    }
    if (section === "stores") {
      return (
        <StoreList
          stores={stores}
          users={users}
          transactions={transactions}
          onOpenMenu={setMenuStore}
          onOpenCreate={() => setOpenCreateStore(true)}
          onOpenImport={() => setOpenImport(true)}
        />
      );
    }
    if (section === "users") {
      return (
        <UserList
          users={users}
          stores={stores}
          onOpenCreate={() => setOpenCreateUser(true)}
        />
      );
    }
    if (section === "leads") {
      return <LeadsManager leads={leads} />;
    }
    if (section === "revenue") {
      return <RevenueAnalytics stores={stores} transactions={transactions} />;
    }
    if (section === "activity") {
      return (
        <ActivityLog
          stores={stores}
          users={users}
          transactions={transactions}
        />
      );
    }
    if (section === "settings") {
      return <PlatformSettings />;
    }

    return (
      <PlatformDashboard
        stores={stores}
        users={users}
        transactions={transactions}
        leads={leads}
        onOpenCreateStore={() => setOpenCreateStore(true)}
        onOpenCreateUser={() => setOpenCreateUser(true)}
        onOpenImport={() => setOpenImport(true)}
        onExportAll={exportAllData}
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border ${
                  section === item.key ||
                  (item.key === "stores" && section === "store-detail")
                    ? "bg-primary text-white border-primary"
                    : "border-border text-text-muted hover:bg-background"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {t(item.labelKey)}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2">
            <img
              src="/files/logo-full.svg"
              alt="QuickPOS"
              className="h-7 w-auto"
            />
            <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.14em]">
              Super Admin
            </span>
          </div>
        </div>
      </div>

      {dataLoadError && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {dataLoadError}
        </div>
      )}

      {renderBody()}

      <Modal
        open={!!menuStore}
        onClose={() => setMenuStore(null)}
        title="Menu configuration"
        wide
      >
        <MenuConfigEditor
          store={menuStore}
          onClose={() => setMenuStore(null)}
        />
      </Modal>

      <Modal
        open={openCreateStore}
        onClose={() => setOpenCreateStore(false)}
        title="Create new store"
      >
        <div className="space-y-3 text-sm">
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Store name"
            value={storeForm.name}
            onChange={(e) =>
              setStoreForm((p) => ({ ...p, name: e.target.value }))
            }
          />
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Owner name"
            value={storeForm.ownerName}
            onChange={(e) =>
              setStoreForm((p) => ({ ...p, ownerName: e.target.value }))
            }
          />
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Owner email"
            value={storeForm.ownerEmail}
            onChange={(e) =>
              setStoreForm((p) => ({ ...p, ownerEmail: e.target.value }))
            }
          />
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Phone"
            value={storeForm.phone}
            onChange={(e) =>
              setStoreForm((p) => ({ ...p, phone: e.target.value }))
            }
          />
          <textarea
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Address"
            rows={2}
            value={storeForm.address}
            onChange={(e) =>
              setStoreForm((p) => ({ ...p, address: e.target.value }))
            }
          />
          <select
            className="w-full rounded-xl border border-border px-3 py-2"
            value={storeForm.plan}
            onChange={(e) =>
              setStoreForm((p) => ({ ...p, plan: e.target.value }))
            }
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <button
            type="button"
            onClick={createStore}
            disabled={creating}
            className="w-full rounded-xl bg-primary text-white py-2.5 font-semibold disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create store"}
          </button>
        </div>
      </Modal>

      <Modal
        open={openCreateUser}
        onClose={() => setOpenCreateUser(false)}
        title="Add platform user"
      >
        <div className="space-y-3 text-sm">
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Display name"
            value={userForm.displayName}
            onChange={(e) =>
              setUserForm((p) => ({ ...p, displayName: e.target.value }))
            }
          />
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm((p) => ({ ...p, email: e.target.value }))
            }
          />
          <input
            type="password"
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Password (min 6 characters)"
            value={userForm.password}
            onChange={(e) =>
              setUserForm((p) => ({ ...p, password: e.target.value }))
            }
          />
          <select
            className="w-full rounded-xl border border-border px-3 py-2"
            value={userForm.role}
            onChange={(e) =>
              setUserForm((p) => ({ ...p, role: e.target.value }))
            }
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
          <select
            className="w-full rounded-xl border border-border px-3 py-2"
            value={userForm.storeId}
            onChange={(e) =>
              setUserForm((p) => ({ ...p, storeId: e.target.value }))
            }
          >
            <option value="">Assign store (optional)</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={createUser}
            disabled={creating}
            className="w-full rounded-xl bg-primary text-white py-2.5 font-semibold disabled:opacity-60"
          >
            {creating ? "Saving..." : "Create user"}
          </button>
        </div>
      </Modal>

      <Modal
        open={openImport}
        onClose={() => setOpenImport(false)}
        title="Import stores from CSV"
        wide
      >
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-text-muted">Upload CSV file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-2 block w-full"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const parsed = await parseCSV(file);
                setCsvRows(parsed.data || []);
              }}
            />
          </label>
          <p className="text-xs text-text-muted">
            Rows ready: {csvRows.length}
          </p>
          {csvRows.length > 0 && (
            <div className="overflow-auto rounded-xl border border-border">
              <table className="min-w-full text-xs">
                <thead className="bg-background">
                  <tr>
                    {Object.keys(csvRows[0]).map((header) => (
                      <th
                        key={header}
                        className="px-2 py-1.5 text-left capitalize"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-t border-border/60">
                      {Object.keys(csvRows[0]).map((key) => (
                        <td
                          key={`${idx}-${key}`}
                          className="px-2 py-1.5 text-text-muted"
                        >
                          {String(row[key] || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            type="button"
            onClick={importStores}
            disabled={creating}
            className="w-full rounded-xl bg-primary text-white py-2.5 font-semibold disabled:opacity-60"
          >
            {creating ? "Importing..." : "Confirm import"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
