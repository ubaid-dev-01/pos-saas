import {
    differenceInCalendarDays,
    endOfDay,
    isAfter,
    isBefore,
    parseISO,
    startOfMonth,
    subDays,
} from "date-fns";
import {
    collection,
    collectionGroup,
    limit,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import {
    BadgeDollarSign,
    Package,
    ReceiptText,
    ShoppingCart,
    TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import CategoryPieChart from "../components/reports/CategoryPieChart";
import ExportButtons from "../components/reports/ExportButtons";
import SalesChart from "../components/reports/SalesChart";
import TopProducts from "../components/reports/TopProducts";
import { db } from "../config/firebase";
import useAuthStore from "../stores/authStore";
import useProductStore from "../stores/productStore";
import { formatCurrency } from "../utils/format";
import { useTranslation } from "../context/LocaleContext";

function parseTransactionDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function filterByRange(transactions, preset, customFrom, customTo) {
  const now = new Date();
  let from = subDays(now, 6);
  let to = endOfDay(new Date());
  if (preset === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    from = d;
    to = endOfDay(d);
  }
  if (preset === "7") from = subDays(new Date(), 6);
  if (preset === "30") from = subDays(new Date(), 29);
  if (preset === "month") from = startOfMonth(new Date());
  if (preset === "custom" && customFrom && customTo) {
    from = parseISO(customFrom);
    to = endOfDay(parseISO(customTo));
  }
  return transactions.filter((txn) => {
    const d = parseTransactionDate(txn.date);
    if (!d) return false;
    return !isBefore(d, from) && !isAfter(d, to);
  });
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const { products } = useProductStore();
  const { userDoc } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState("7");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (!userDoc) {
      setTransactions([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    if (userDoc.role === "superadmin") {
      const q = query(
        collectionGroup(db, "transactions"),
        orderBy("date", "desc"),
        limit(1200),
      );

      return onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => {
            const data = d.data();
            const storeId = d.ref.parent.parent?.id || data.storeId;
            return { id: d.id, ...data, storeId };
          });
          setTransactions(list);
          setLoading(false);
        },
        () => setLoading(false),
      );
    }

    if (!userDoc.storeId) {
      setTransactions([]);
      setLoading(false);
      return undefined;
    }

    const q = query(
      collection(db, "stores", userDoc.storeId, "transactions"),
      orderBy("date", "desc"),
      limit(400),
    );

    return onSnapshot(
      q,
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [userDoc?.storeId, userDoc?.role, userDoc]);

  const scoped = useMemo(
    () => filterByRange(transactions, preset, from, to),
    [transactions, preset, from, to],
  );
  const completed = useMemo(
    () => scoped.filter((t) => t.status === "completed"),
    [scoped],
  );

  const chartDays = useMemo(() => {
    if (preset === "30") return 30;
    if (preset === "today") return 1;
    if (preset === "custom" && from && to) {
      return Math.max(
        1,
        differenceInCalendarDays(parseISO(to), parseISO(from)) + 1,
      );
    }
    return 7;
  }, [preset, from, to]);

  const totals = useMemo(() => {
    const revenue = completed.reduce((s, t) => s + Number(t.grandTotal), 0);
    const cost = completed.reduce(
      (s, t) =>
        s +
        (t.items || []).reduce(
          (a, it) => a + Number(it.costPrice || 0) * Number(it.quantity || 0),
          0,
        ),
      0,
    );
    const profit = revenue - cost;
    const items = completed.reduce(
      (s, t) =>
        s + (t.items || []).reduce((a, it) => a + Number(it.quantity), 0),
      0,
    );
    return {
      revenue,
      count: completed.length,
      avg: completed.length ? revenue / completed.length : 0,
      profit,
      items,
    };
  }, [completed]);

  const payData = useMemo(() => {
    const map = {};
    completed.forEach((t) => {
      const k = t.paymentMethod || "other";
      map[k] = (map[k] || 0) + Number(t.grandTotal);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [completed]);

  const COLORS = ["#0D3B39", "#2A9D8F", "#E8A735", "#E76F51"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-text-primary">{t("reports.title")}</h1>
        <ExportButtons transactions={scoped} products={products} />
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { id: "today", label: "Today" },
          { id: "7", label: "7 days" },
          { id: "30", label: "30 days" },
          { id: "month", label: "This month" },
          { id: "custom", label: "Custom" },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              preset === p.id
                ? "bg-primary text-white border-primary"
                : "border-border text-text-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="flex gap-2 flex-wrap">
          <input
            type="date"
            className="rounded-xl border border-border px-3 py-2 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="rounded-xl border border-border px-3 py-2 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Revenue",
            value: formatCurrency(totals.revenue),
            icon: BadgeDollarSign,
            tone: "from-emerald-500/15 to-emerald-500/0 text-emerald-600",
          },
          {
            label: "Transactions",
            value: totals.count,
            icon: ShoppingCart,
            tone: "from-sky-500/15 to-sky-500/0 text-sky-600",
          },
          {
            label: "Avg order",
            value: formatCurrency(totals.avg),
            icon: ReceiptText,
            tone: "from-violet-500/15 to-violet-500/0 text-violet-600",
          },
          {
            label: "Est. profit",
            value: formatCurrency(totals.profit),
            icon: TrendingUp,
            tone: "from-amber-500/15 to-amber-500/0 text-amber-600",
          },
          {
            label: "Items sold",
            value: totals.items,
            icon: Package,
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
            <p className="text-lg font-bold text-primary mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-2">
            Sales trend
          </p>
          {loading ? (
            <div className="h-64 rounded-xl bg-background animate-pulse" />
          ) : (
            <SalesChart transactions={completed} days={chartDays} />
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-2">
            Category mix
          </p>
          {loading ? (
            <div className="h-64 rounded-xl bg-background animate-pulse" />
          ) : (
            <CategoryPieChart transactions={completed} products={products} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-2">
            Payment methods
          </p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {payData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary mb-2">
            Top products
          </p>
          {loading ? (
            <div className="h-64 rounded-xl bg-background animate-pulse" />
          ) : (
            <TopProducts transactions={completed} />
          )}
        </div>
      </div>
    </div>
  );
}
