import { useMemo } from 'react';
import { useTranslation } from '../../context/LocaleContext';
import { formatCurrency } from '../../utils/format';

export default function TopProducts({ transactions }) {
  const { t } = useTranslation();
  const rows = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (t.status !== 'completed') return;
      (t.items || []).forEach((it) => {
        const id = it.productId || it.sku;
        map[id] = map[id] || { name: it.name, qty: 0, revenue: 0 };
        map[id].qty += Number(it.quantity) || 0;
        map[id].revenue += Number(it.total) || 0;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [transactions]);

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-background text-xs text-text-muted uppercase">
          <tr>
            <th className="p-3 text-left">{t('reports.topProducts.col.product')}</th>
            <th className="p-3 text-right">{t('reports.topProducts.col.qty')}</th>
            <th className="p-3 text-right">{t('reports.topProducts.col.revenue')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-border/60">
              <td className="p-3 font-medium">{r.name}</td>
              <td className="p-3 text-right">{r.qty}</td>
              <td className="p-3 text-right">{formatCurrency(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
