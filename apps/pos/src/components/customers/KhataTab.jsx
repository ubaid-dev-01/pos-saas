import {
  AlertTriangle,
  CalendarClock,
  Clock,
  MessageCircle,
  Receipt,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import useAuthStore from "../../stores/authStore";
import useCustomerStore from "../../stores/customerStore";
import { formatCurrency } from "../../utils/format";
import { useTranslation } from "../../context/LocaleContext";
import {
  buildWhatsAppUrl,
  normalizePakistaniPhone,
} from "../../utils/receiptText";
import {
  AGEING_BUCKETS,
  decorateUdhaarCustomers,
  summarizeUdhaarAgeing,
} from "../../utils/udhaarAgeing";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import SearchInput from "../ui/SearchInput";
import UdhaarPaymentModal from "./UdhaarPaymentModal";

function bucketTone(bucketId) {
  if (bucketId === "current") return "success";
  if (bucketId === "days_30") return "info";
  if (bucketId === "days_60") return "warning";
  return "danger";
}

export default function KhataTab({ onViewHistory }) {
  const { t } = useTranslation();
  const { customers } = useCustomerStore();
  const { store } = useAuthStore();
  const [q, setQ] = useState("");
  const [bucketFilter, setBucketFilter] = useState("all");
  const [payTarget, setPayTarget] = useState(null);

  const decorated = useMemo(
    () =>
      decorateUdhaarCustomers(
        customers.filter((c) => c.isActive !== false),
      ),
    [customers],
  );

  const summary = useMemo(() => summarizeUdhaarAgeing(decorated), [decorated]);

  const visible = useMemo(() => {
    let rows = decorated;
    if (bucketFilter !== "all") {
      rows = rows.filter((c) => c.bucket.id === bucketFilter);
    }
    const query = q.trim().toLowerCase();
    if (query) {
      rows = rows.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query),
      );
    }
    return rows;
  }, [decorated, bucketFilter, q]);

  const sendWhatsAppReminder = (customer) => {
    const phone = normalizePakistaniPhone(customer.phone);
    const message = t("khata.reminderMsg", {
      name: customer.name || "",
      store: store?.name || "our store",
      amount: new Intl.NumberFormat("en-PK", {
        maximumFractionDigits: 0,
      }).format(customer.outstanding),
    });
    const url = buildWhatsAppUrl(message, phone);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const exportCsv = () => {
    const rows = [
      ["Customer", "Phone", "Outstanding (PKR)", "Age (days)", "Bucket"],
      ...visible.map((c) => [
        c.name,
        c.phone || "",
        c.outstanding.toFixed(2),
        c.ageDays,
        c.bucket.label,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((v) => {
            const s = String(v ?? "");
            return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `udhaar-ageing-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={Wallet}
          label={t("khata.totalReceivable")}
          value={formatCurrency(summary.totalReceivable)}
          tone="primary"
        />
        <SummaryCard
          icon={AlertTriangle}
          label={t("khata.overdueCount")}
          value={summary.count}
          tone="warning"
        />
        <SummaryCard
          icon={CalendarClock}
          label={t("khata.oldestUnpaid")}
          value={summary.oldestDays ? `${summary.oldestDays} days` : "—"}
          tone="danger"
        />
        <SummaryCard
          icon={Clock}
          label="90+ days"
          value={formatCurrency(summary.byBucket.days_90?.total || 0)}
          tone="danger"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setBucketFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
            bucketFilter === "all"
              ? "bg-primary text-white border-primary"
              : "border-border text-text-muted"
          }`}
        >
          All ({decorated.length})
        </button>
        {AGEING_BUCKETS.map((b) => {
          const bucket = summary.byBucket[b.id];
          return (
            <button
              type="button"
              key={b.id}
              onClick={() => setBucketFilter(b.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                bucketFilter === b.id
                  ? "bg-primary text-white border-primary"
                  : "border-border text-text-muted"
              }`}
            >
              {b.label} ({bucket?.count || 0})
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <div className="w-56">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder={`${t("common.search")}…`}
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!visible.length}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={t("khata.empty")}
          description="When customers buy on credit (udhaar), they'll appear here automatically."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead className="bg-background text-xs text-text-muted uppercase">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-right">{t("khata.outstanding")}</th>
                <th className="p-3 text-right">{t("khata.ageDays")}</th>
                <th className="p-3 text-left">Bucket</th>
                <th className="p-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-text-muted whitespace-nowrap">
                    {c.phone || "—"}
                  </td>
                  <td className="p-3 text-right font-semibold text-warning whitespace-nowrap">
                    {formatCurrency(c.outstanding)}
                  </td>
                  <td className="p-3 text-right">{c.ageDays}</td>
                  <td className="p-3">
                    <Badge variant={bucketTone(c.bucket.id)}>
                      {c.bucket.label}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setPayTarget(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        {t("khata.receivePayment")}
                      </button>
                      <button
                        type="button"
                        disabled={!c.phone}
                        onClick={() => sendWhatsAppReminder(c)}
                        title={
                          c.phone
                            ? t("khata.whatsappReminder")
                            : "Customer has no phone on file"
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold disabled:opacity-40"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewHistory?.(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        {t("khata.viewLedger")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UdhaarPaymentModal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        customer={payTarget}
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  const toneClasses = {
    primary: "from-primary/10 text-primary bg-primary/5",
    warning: "from-amber-100 text-amber-700 bg-amber-50",
    danger: "from-rose-100 text-rose-700 bg-rose-50",
  };
  const cls = toneClasses[tone] || toneClasses.primary;
  return (
    <div
      className={`rounded-2xl border border-border bg-gradient-to-br ${cls} via-surface to-white p-4 shadow-sm`}
    >
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-border">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-xl font-bold text-text-primary mt-1">{value}</p>
    </div>
  );
}
