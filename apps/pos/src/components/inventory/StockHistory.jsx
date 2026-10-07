import { useMemo, useState } from 'react';
import useInventoryStore from '../../stores/inventoryStore';
import useDebounce from '../../hooks/useDebounce';
import SearchInput from '../ui/SearchInput';
import Pagination from '../ui/Pagination';
import { formatDateTime } from '../../utils/format';
import { useTranslation } from '../../context/LocaleContext';

export default function StockHistory() {
  const { t } = useTranslation();
  const { logs, loading } = useInventoryStore();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 300);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    if (!dq.trim()) return logs;
    const t = dq.trim().toLowerCase();
    return logs.filter((l) => l.productName?.toLowerCase().includes(t) || l.reason?.toLowerCase().includes(t));
  }, [logs, dq]);

  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <div className="space-y-3">
      <SearchInput value={q} onChange={setQ} placeholder={t('inventory.search')} />
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-background border-b border-border text-xs text-text-muted uppercase">
            <tr>
              <th className="p-3 text-left">When</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-right">Prev</th>
              <th className="p-3 text-right">Δ</th>
              <th className="p-3 text-right">New</th>
              <th className="p-3 text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            ) : (
              slice.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="p-3 whitespace-nowrap text-text-muted">{formatDateTime(l.timestamp)}</td>
                  <td className="p-3 font-medium">{l.productName}</td>
                  <td className="p-3 text-right">{l.previousStock}</td>
                  <td className="p-3 text-right">{l.change}</td>
                  <td className="p-3 text-right">{l.newStock}</td>
                  <td className="p-3 text-text-muted">{l.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
    </div>
  );
}
