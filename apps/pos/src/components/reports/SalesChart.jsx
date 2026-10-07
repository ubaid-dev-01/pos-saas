import { format } from "date-fns";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "../../context/LocaleContext";
import { formatCompactCurrency, formatCurrency } from "../../utils/format";

export default function SalesChart({ transactions, days = 7 }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const map = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = format(d, "yyyy-MM-dd");
      map[key] = { date: key, revenue: 0 };
    }
    transactions.forEach((txn) => {
      if (txn.status !== "completed") return;
      const key = format(new Date(txn.date), "yyyy-MM-dd");
      if (!map[key]) map[key] = { date: key, revenue: 0 };
      map[key].revenue += Number(txn.grandTotal) || 0;
    });
    return Object.values(map).map((row) => ({
      ...row,
      label: format(new Date(`${row.date}T00:00:00`), "MMM dd"),
    }));
  }, [transactions, days]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => formatCompactCurrency(v)}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            name={t("reports.salesChart.revenue")}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0D3B39"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
