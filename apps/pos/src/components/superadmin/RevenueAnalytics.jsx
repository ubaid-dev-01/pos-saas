import {
    collectionGroup,
    limit,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
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
import { db } from "../../config/firebase";
import { useTranslation } from "../../context/LocaleContext";
import useAuthStore from "../../stores/authStore";
import {
    exportToCSV,
    exportToJSON,
    generatePrintReport,
} from "../../utils/exportData";
import { formatCompactCurrency, formatCurrency } from "../../utils/format";

function inRange(dateValue, days) {
  let d = null;
  if (dateValue instanceof Date) d = dateValue;
  else if (typeof dateValue?.toDate === "function") d = dateValue.toDate();
  else if (typeof dateValue?.seconds === "number")
    d = new Date(dateValue.seconds * 1000);
  else d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

function toIsoDay(dateValue) {
  let d = null;
  if (dateValue instanceof Date) d = dateValue;
  else if (typeof dateValue?.toDate === "function") d = dateValue.toDate();
  else if (typeof dateValue?.seconds === "number")
    d = new Date(dateValue.seconds * 1000);
  else d = new Date(dateValue);
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function RevenueAnalytics({ stores = [], transactions = [] }) {
  const { t } = useTranslation();
  const userDoc = useAuthStore((s) => s.userDoc);
  const [range, setRange] = useState("30");
  const [fallbackTx, setFallbackTx] = useState([]);

  const ranges = useMemo(
    () => [
      { id: "7", label: t("superAdmin.revenue.range7"), days: 7 },
      { id: "30", label: t("superAdmin.revenue.range30"), days: 30 },
      { id: "90", label: t("superAdmin.revenue.range90"), days: 90 },
      { id: "365", label: t("superAdmin.revenue.range365"), days: 365 },
    ],
    [t],
  );

  useEffect(() => {
    if (userDoc?.role !== "superadmin" || transactions.length > 0) {
      setFallbackTx([]);
      return undefined;
    }

    const q = query(
      collectionGroup(db, "transactions"),
      orderBy("date", "desc"),
      limit(1500),
    );

    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        const storeId = d.ref.parent.parent?.id || data.storeId;
        return { id: d.id, ...data, storeId };
      });
      setFallbackTx(list);
    });
  }, [transactions.length, userDoc?.role]);

  const sourceTransactions =
    transactions.length > 0 ? transactions : fallbackTx;

  const scopedTx = useMemo(() => {
    const days = ranges.find((r) => r.id === range)?.days || 30;
    return sourceTransactions.filter((tx) => inRange(tx.date, days));
  }, [sourceTransactions, range, ranges]);

  const kpi = useMemo(() => {
    const totalRevenue = scopedTx.reduce(
      (sum, tx) => sum + (Number(tx.grandTotal) || 0),
      0,
    );
    const totalOrders = scopedTx.length;
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
    const totalProfit = scopedTx.reduce((sum, tx) => {
      const itemProfit = (tx.items || []).reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const cost = Number(item.costPrice) || 0;
        return acc + (unitPrice - cost) * qty;
      }, 0);
      return sum + itemProfit;
    }, 0);

    return {
      totalRevenue,
      totalOrders,
      avgOrder,
      totalProfit,
      refunds: scopedTx.filter((tx) => tx.status === "voided").length,
    };
  }, [scopedTx]);

  const byDay = useMemo(() => {
    const map = new Map();
    scopedTx.forEach((tx) => {
      const day = toIsoDay(tx.date);
      if (!day) return;
      map.set(day, (map.get(day) || 0) + (Number(tx.grandTotal) || 0));
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue }));
  }, [scopedTx]);

  const byStore = useMemo(() => {
    const map = new Map();
    scopedTx.forEach((tx) => {
      const storeId = tx.storeId || "unknown";
      map.set(storeId, (map.get(storeId) || 0) + (Number(tx.grandTotal) || 0));
    });

    return [...map.entries()]
      .map(([storeId, revenue]) => ({
        storeId,
        name:
          stores.find((store) => store.id === storeId)?.name ||
          t("superAdmin.revenue.unknown"),
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [scopedTx, stores, t]);

  const paymentDistribution = useMemo(() => {
    const map = scopedTx.reduce((acc, tx) => {
      const method = String(tx.paymentMethod || "cash").toLowerCase();
      acc[method] = (acc[method] || 0) + (Number(tx.grandTotal) || 0);
      return acc;
    }, {});
    const palette = ["#2A9D8F", "#0A6B68", "#F4A261", "#E76F51"];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: palette[i % palette.length],
    }));
  }, [scopedTx]);

  const revenueColumns = useMemo(
    () => [
      { key: "name", label: t("superAdmin.revenue.col.store") },
      { key: "revenue", label: t("superAdmin.revenue.col.revenue"), format: "currency" },
    ],
    [t],
  );

  const kpiCards = useMemo(
    () => [
      {
        key: "revenue",
        label: t("superAdmin.revenue.kpi.totalRevenue"),
        value: formatCurrency(kpi.totalRevenue),
      },
      {
        key: "profit",
        label: t("superAdmin.revenue.kpi.totalProfit"),
        value: formatCurrency(kpi.totalProfit),
      },
      {
        key: "avg",
        label: t("superAdmin.revenue.kpi.avgOrder"),
        value: formatCurrency(kpi.avgOrder),
      },
      {
        key: "orders",
        label: t("superAdmin.revenue.kpi.totalOrders"),
        value: kpi.totalOrders.toLocaleString(),
      },
      {
        key: "refunds",
        label: t("superAdmin.revenue.kpi.refunds"),
        value: kpi.refunds.toLocaleString(),
      },
    ],
    [t, kpi],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {ranges.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                range === option.id
                  ? "bg-primary text-white border-primary"
                  : "border-border text-text-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              exportToCSV(byStore, revenueColumns, "quickpos-revenue")
            }
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
          >
            {t("superAdmin.stores.exportCsv")}
          </button>
          <button
            type="button"
            onClick={() => exportToJSON(byStore, "quickpos-revenue")}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-background"
          >
            {t("superAdmin.stores.exportJson")}
          </button>
          <button
            type="button"
            onClick={() =>
              generatePrintReport(
                t("superAdmin.revenue.reportTitle"),
                [
                  {
                    label: t("superAdmin.revenue.kpi.totalRevenue"),
                    value: formatCurrency(kpi.totalRevenue),
                  },
                  {
                    label: t("superAdmin.revenue.kpi.totalOrders"),
                    value: String(kpi.totalOrders),
                  },
                  {
                    label: t("superAdmin.revenue.kpi.avgOrder"),
                    value: formatCurrency(kpi.avgOrder),
                  },
                  {
                    label: t("superAdmin.revenue.kpi.totalProfit"),
                    value: formatCurrency(kpi.totalProfit),
                  },
                ],
                {
                  columns: revenueColumns,
                  rows: byStore,
                },
              )
            }
            className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
          >
            {t("superAdmin.stores.generatePdf")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {kpiCards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <p className="text-xs text-text-muted">{card.label}</p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-text-primary mb-3">
          {t("superAdmin.revenue.overTime")}
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={byDay}>
              <defs>
                <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#revArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-3">
            {t("superAdmin.revenue.byStore")}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byStore}
                layout="vertical"
                margin={{ left: 12, right: 12 }}
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
                <Bar dataKey="revenue" fill="#0A6B68" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-3">
            {t("superAdmin.revenue.paymentDistribution")}
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                >
                  {paymentDistribution.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
