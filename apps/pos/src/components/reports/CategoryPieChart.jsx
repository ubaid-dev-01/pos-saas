import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTranslation } from '../../context/LocaleContext';

const COLORS = ['#0D3B39', '#2A9D8F', '#E8A735', '#E76F51', '#264653', '#457B9D'];

export default function CategoryPieChart({ transactions, products }) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    const map = {};
    const productCategory = Object.fromEntries(products.map((p) => [p.id, p.category]));
    transactions.forEach((txn) => {
      if (txn.status !== 'completed') return;
      (txn.items || []).forEach((it) => {
        const cat = productCategory[it.productId] || t('reports.categoryPie.other');
        map[cat] = (map[cat] || 0) + Number(it.total) || 0;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions, products, t]);

  if (!data.length) return <p className="text-sm text-text-muted">{t('reports.categoryPie.noData')}</p>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" data={data} nameKey="name" outerRadius={90} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
