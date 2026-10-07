import { BookOpen, Coins, Eye, EyeOff, Plus, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import CustomerForm from "../components/customers/CustomerForm";
import CustomerHistory from "../components/customers/CustomerHistory";
import CustomerTable from "../components/customers/CustomerTable";
import KhataTab from "../components/customers/KhataTab";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import useAuthStore from "../stores/authStore";
import useCustomerStore from "../stores/customerStore";
import { formatCurrency } from "../utils/format";
import { useTranslation } from "../context/LocaleContext";

export default function CustomersPage() {
  const { t } = useTranslation();
  const { customers, deleteCustomer, setCustomerActive } = useCustomerStore();
  const { userDoc } = useAuthStore();
  const [tab, setTab] = useState("customers");
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [hist, setHist] = useState(null);
  const [del, setDel] = useState(null);
  const [hardDel, setHardDel] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const visibleCustomers = useMemo(
    () => customers.filter((c) => (showInactive ? true : c.isActive !== false)),
    [customers, showInactive],
  );

  const stats = useMemo(() => {
    const pts = visibleCustomers.reduce(
      (s, c) => s + Number(c.loyaltyPoints || 0),
      0,
    );
    const udhaarTotal = customers
      .filter((c) => c.isActive !== false)
      .reduce((s, c) => s + (Number(c.currentCredit) || 0), 0);
    const udhaarCount = customers.filter(
      (c) => c.isActive !== false && Number(c.currentCredit) > 0,
    ).length;
    return {
      count: visibleCustomers.length,
      pts,
      udhaarTotal,
      udhaarCount,
    };
  }, [visibleCustomers, customers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {t("customers.title")}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {t("customers.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEdit(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> {t("customers.add")}
          </button>
          <button
            type="button"
            onClick={() => setShowInactive((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-medium"
          >
            {showInactive ? (
              <>
                <EyeOff className="w-4 h-4" /> {t("customers.hideInactive")}
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> {t("customers.showInactive")}
              </>
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-surface to-white p-4 shadow-sm">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-xs text-text-muted">{t("customers.totalCustomers")}</p>
          <p className="text-xl font-bold text-text-primary mt-1">
            {stats.count}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/10 via-surface to-white p-4 shadow-sm">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
            <Coins className="h-5 w-5" />
          </div>
          <p className="text-xs text-text-muted">{t("customers.loyaltyPoints")}</p>
          <p className="text-xl font-bold text-text-primary mt-1">
            {stats.pts}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTab("khata")}
          className="text-left rounded-2xl border border-border bg-gradient-to-br from-warning/10 via-surface to-white p-4 shadow-sm hover:border-warning/40 transition"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-warning text-white shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-xs text-text-muted">{t("customers.udhaarOutstanding")}</p>
          <p className="text-xl font-bold text-warning mt-1">
            {formatCurrency(stats.udhaarTotal)}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setTab("khata")}
          className="text-left rounded-2xl border border-border bg-gradient-to-br from-rose-100 via-surface to-white p-4 shadow-sm hover:border-rose-300 transition"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="text-xs text-text-muted">{t("customers.withUdhaar")}</p>
          <p className="text-xl font-bold text-text-primary mt-1">
            {stats.udhaarCount}
          </p>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("customers")}
          className={`relative px-4 py-2 text-sm font-semibold ${
            tab === "customers"
              ? "text-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("customers.title")}
          </span>
          {tab === "customers" && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("khata")}
          className={`relative px-4 py-2 text-sm font-semibold ${
            tab === "khata"
              ? "text-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("customers.khata")}
            {stats.udhaarCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-warning text-white text-[10px] font-bold">
                {stats.udhaarCount}
              </span>
            )}
          </span>
          {tab === "khata" && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {tab === "customers" ? (
        <CustomerTable
          customers={visibleCustomers}
          showInactive={showInactive}
          onEdit={(c) => {
            setEdit(c);
            setFormOpen(true);
          }}
          onHistory={setHist}
          onDelete={setDel}
          onRestore={async (c) => {
            try {
              await setCustomerActive(userDoc.storeId, c.id, true);
              toast.success(t("toast.customerActivated"));
            } catch (e) {
              toast.error(e?.message || "Failed");
            }
          }}
          onHardDelete={setHardDel}
        />
      ) : (
        <KhataTab onViewHistory={setHist} />
      )}
      <CustomerForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        customer={edit}
      />
      <CustomerHistory
        open={!!hist}
        onClose={() => setHist(null)}
        customer={hist}
      />
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete customer?"
        message="This will mark the customer as inactive."
        danger
        onConfirm={async () => {
          try {
            await deleteCustomer(userDoc.storeId, del.id, true);
            toast.success(t("toast.markedInactive"));
          } catch (e) {
            toast.error(e?.message || "Failed");
          }
          setDel(null);
        }}
      />

      <ConfirmDialog
        open={!!hardDel}
        onClose={() => setHardDel(null)}
        title="Delete customer permanently?"
        message="This will permanently remove the customer and cannot be undone."
        confirmLabel="Delete permanently"
        danger
        onConfirm={async () => {
          try {
            await deleteCustomer(userDoc.storeId, hardDel.id, false);
            toast.success(t("toast.deletedPermanently"));
          } catch (e) {
            toast.error(e?.message || "Failed");
          }
          setHardDel(null);
        }}
      />
    </div>
  );
}
