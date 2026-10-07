import { isAfter, subDays } from "date-fns";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    Building2,
    Download,
    FileUp,
    ReceiptText,
    TrendingUp,
    UserPlus,
    Users,
    Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useTranslation } from "../../context/LocaleContext";
import {
    formatCompactCurrency,
    formatCurrency,
    formatDateTime,
} from "../../utils/format";

const PLAN_COLORS = {
  free: "#2A9D8F",
  premium: "#0A6B68",
  enterprise: "#F4A261",
};

function CountUpValue({ value, formatter = (n) => n.toLocaleString() }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let frame = 0;
    const totalFrames = 45;
    const tick = () => {
      frame += 1;
      const progress = Math.min(1, frame / totalFrames);
      setDisplay(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    setDisplay(0);
    requestAnimationFrame(tick);
  }, [value]);

  return formatter(display);
}

function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function PlatformDashboard({
  stores = [],
  users = [],
  transactions = [],
  leads = [],
  onOpenCreateStore,
  onOpenCreateUser,
  onOpenImport,
  onExportAll,
  onNavigate,
}) {
  const { t } = useTranslation();

  const metrics = useMemo(() => {
    const activeStores = stores.filter(
      (store) => store.isActive !== false,
    ).length;
    const activeUsers = users.filter((user) => user.isActive !== false).length;
    const totalRevenue = transactions.reduce(
      (sum, tx) => sum + (Number(tx.grandTotal) || 0),
      0,
    );
    const totalTransactions = transactions.length;
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const todaysTransactions = transactions.filter((tx) =>
      String(tx.date || "").startsWith(todayKey),
    );
    const todaysRevenue = todaysTransactions.reduce(
      (sum, tx) => sum + (Number(tx.grandTotal) || 0),
      0,
    );

    return {
      activeStores,
      activeUsers,
      totalRevenue,
      totalTransactions,
      todaysRevenue,
      todaysTransactions: todaysTransactions.length,
    };
  }, [stores, users, transactions]);

  const revenueSeries = useMemo(() => {
    const map = new Map();
    const cutoff = subDays(new Date(), 29);
    transactions.forEach((tx) => {
      const d = toDate(tx.date);
      if (!d || isAfter(cutoff, d)) return;
      const day = d.toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + (Number(tx.grandTotal) || 0));
    });

    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue }));
  }, [transactions]);

  const planDistribution = useMemo(() => {
    const map = stores.reduce((acc, store) => {
      const plan = String(store.plan || "free").toLowerCase();
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(map).map(([plan, value]) => ({
      name: plan,
      value,
      color: PLAN_COLORS[plan] || "#264653",
    }));
  }, [stores]);

  const topStores = useMemo(() => {
    const byStore = new Map();
    transactions.forEach((tx) => {
      const sid = tx.storeId || "unknown";
      byStore.set(sid, (byStore.get(sid) || 0) + (Number(tx.grandTotal) || 0));
    });
    return [...byStore.entries()]
      .map(([storeId, revenue]) => {
        const store = stores.find((s) => s.id === storeId);
        return {
          storeId,
          name: store?.name || t("superAdmin.unknownStore"),
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [stores, transactions, t]);

  const recentActivity = useMemo(() => {
    const txRows = transactions.slice(0, 6).map((tx) => ({
      id: tx.id,
      when: tx.date,
      event: t("superAdmin.activity.txCompleted"),
      store: stores.find((store) => store.id === tx.storeId)?.name || t("superAdmin.col.store"),
      user: tx.cashierName || t("superAdmin.staff"),
      details: formatCurrency(tx.grandTotal || 0),
      tone: "positive",
    }));

    const newStores = stores.slice(0, 2).map((store) => ({
      id: `store-${store.id}`,
      when: store.createdAt,
      event: t("superAdmin.activity.newStore"),
      store: store.name,
      user: t("superAdmin.system"),
      details: t("superAdmin.activity.planSuffix", {
        plan: store.plan || "free",
      }),
      tone: "info",
    }));

    return [...txRows, ...newStores]
      .sort((a, b) => String(b.when || "").localeCompare(String(a.when || "")))
      .slice(0, 10);
  }, [transactions, stores, t]);

  const alerts = useMemo(() => {
    const inactiveCutoff = subDays(new Date(), 30);
    const staleStores = stores.filter((store) => {
      const recentTx = transactions.find(
        (tx) =>
          tx.storeId === store.id &&
          toDate(tx.date) &&
          isAfter(toDate(tx.date), inactiveCutoff),
      );
      return !recentTx;
    });

    const pendingLeads = leads.filter((lead) => lead.status === "new").length;

    return [
      {
        id: "inactive",
        color: "red",
        title: t("superAdmin.alert.lowActivity.title", {
          count: staleStores.length,
        }),
        description: t("superAdmin.alert.lowActivity.desc"),
        action: t("superAdmin.alert.lowActivity.action"),
        onClick: () => onNavigate?.("/super-admin/stores"),
      },
      {
        id: "leads",
        color: "blue",
        title: t("superAdmin.alert.leads.title", { count: pendingLeads }),
        description: t("superAdmin.alert.leads.desc"),
        action: t("superAdmin.alert.leads.action"),
        onClick: () => onNavigate?.("/super-admin/leads"),
      },
    ];
  }, [stores, transactions, leads, onNavigate, t]);

  const kpis = useMemo(
    () => [
      {
        key: "stores",
        title: t("superAdmin.kpi.totalStores"),
        value: stores.length,
        sub: t("superAdmin.kpi.activeCount", { count: metrics.activeStores }),
        tone: "from-[#2A9D8F] to-[#1F7A71]",
        icon: Building2,
        clickTo: "/super-admin/stores",
      },
      {
        key: "users",
        title: t("superAdmin.kpi.totalUsers"),
        value: users.length,
        sub: t("superAdmin.kpi.activeCount", { count: metrics.activeUsers }),
        tone: "from-[#0A6B68] to-[#0A2625]",
        icon: Users,
        clickTo: "/super-admin/users",
      },
      {
        key: "revenue",
        title: t("superAdmin.kpi.totalRevenue"),
        value: metrics.totalRevenue,
        formatter: formatCompactCurrency,
        sub: t("superAdmin.kpi.todayAmount", {
          amount: formatCurrency(metrics.todaysRevenue),
        }),
        tone: "from-[#F4A261] to-[#E76F51]",
        icon: Wallet,
        clickTo: "/super-admin/revenue",
      },
      {
        key: "tx",
        title: t("superAdmin.kpi.totalTransactions"),
        value: metrics.totalTransactions,
        sub: t("superAdmin.kpi.todayCount", {
          count: metrics.todaysTransactions,
        }),
        tone: "from-[#264653] to-[#1B3A4B]",
        icon: ReceiptText,
        clickTo: "/super-admin/activity",
      },
    ],
    [t, stores.length, users.length, metrics],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((card) => (
          <motion.button
            key={card.key}
            type="button"
            onClick={() => onNavigate?.(card.clickTo)}
            className="text-left rounded-2xl border border-border bg-surface p-4 relative overflow-hidden"
            whileHover={{ y: -2 }}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.tone}`}
            />
            <div className="flex items-start justify-between">
              <p className="text-xs text-text-muted uppercase tracking-wide">
                {card.title}
              </p>
              <card.icon className="w-5 h-5 text-text-muted" />
            </div>
            <p className="mt-2 text-2xl font-bold text-text-primary">
              <CountUpValue value={card.value} formatter={card.formatter} />
            </p>
            <p className="mt-1 text-xs text-text-muted">{card.sub}</p>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenCreateStore}
          className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          {t("superAdmin.createStore")}
        </button>
        <button
          type="button"
          onClick={onOpenCreateUser}
          className="px-3 py-2 rounded-xl border border-border text-sm font-semibold text-text-primary inline-flex items-center gap-2 hover:bg-background"
        >
          <UserPlus className="w-4 h-4" />
          {t("superAdmin.addPlatformUser")}
        </button>
        <button
          type="button"
          onClick={onOpenImport}
          className="px-3 py-2 rounded-xl border border-border text-sm font-semibold text-text-primary inline-flex items-center gap-2 hover:bg-background"
        >
          <FileUp className="w-4 h-4" />
          {t("superAdmin.importStoresCsv")}
        </button>
        <button
          type="button"
          onClick={onExportAll}
          className="px-3 py-2 rounded-xl border border-border text-sm font-semibold text-text-primary inline-flex items-center gap-2 hover:bg-background"
        >
          <Download className="w-4 h-4" />
          {t("superAdmin.exportAllData")}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        <div className="xl:col-span-3 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-3">
            {t("superAdmin.revenueTrend")}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2A9D8F" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2A9D8F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6ecf2" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => formatCompactCurrency(v)}
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2A9D8F"
                  fill="url(#revGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-3">
            {t("superAdmin.storeDistribution")}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {planDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-xs text-text-muted">
            {planDistribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <span className="capitalize">
                  {["free", "premium", "enterprise"].includes(item.name)
                    ? t(`superAdmin.stores.plan.${item.name}`)
                    : item.name}
                </span>
                <span className="font-semibold text-text-primary">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-3">
            {t("superAdmin.topStoresByRevenue")}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topStores}
                layout="vertical"
                margin={{ left: 10, right: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6ecf2" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCompactCurrency(v)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar
                  dataKey="revenue"
                  fill="#0A6B68"
                  radius={[0, 8, 8, 0]}
                  onClick={(data) =>
                    onNavigate?.(`/super-admin/stores/${data.storeId}`)
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">
              {t("superAdmin.recentActivity")}
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.("/super-admin/activity")}
              className="text-xs text-primary font-semibold"
            >
              {t("superAdmin.viewAll")}
            </button>
          </div>
          <div className="overflow-auto rounded-xl border border-border">
            <table className="min-w-full text-xs">
              <thead className="bg-background text-text-muted uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">{t("superAdmin.col.time")}</th>
                  <th className="px-3 py-2 text-left">{t("superAdmin.col.event")}</th>
                  <th className="px-3 py-2 text-left">{t("superAdmin.col.store")}</th>
                  <th className="px-3 py-2 text-left">{t("superAdmin.col.user")}</th>
                  <th className="px-3 py-2 text-left">{t("superAdmin.col.details")}</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr key={row.id} className="border-t border-border/60">
                    <td className="px-3 py-2 text-text-muted">
                      {formatDateTime(row.when)}
                    </td>
                    <td className="px-3 py-2 text-text-primary">{row.event}</td>
                    <td className="px-3 py-2 text-text-muted">{row.store}</td>
                    <td className="px-3 py-2 text-text-muted">{row.user}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 ${
                          row.tone === "positive"
                            ? "bg-success/15 text-success"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {row.details}
                      </span>
                    </td>
                  </tr>
                ))}
                {!recentActivity.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-text-muted"
                    >
                      {t("superAdmin.noRecentActivity")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-error" />
          <p className="text-sm font-semibold text-text-primary">
            {t("superAdmin.attentionRequired")}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-border bg-background p-3"
            >
              <p className="text-sm font-semibold text-text-primary">
                {alert.title}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {alert.description}
              </p>
              <button
                type="button"
                onClick={alert.onClick}
                className="mt-3 text-xs font-semibold text-primary inline-flex items-center gap-1"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {alert.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
