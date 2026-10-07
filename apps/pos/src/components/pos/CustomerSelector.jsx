import { useEffect, useMemo, useState } from 'react';
import useDebounce from '../../hooks/useDebounce';
import useCustomerStore from '../../stores/customerStore';
import useCartStore from '../../stores/cartStore';
import useAuthStore from '../../stores/authStore';
import SearchInput from '../ui/SearchInput';
import { formatCurrency } from '../../utils/format';
import { normalizeOptionalCustomerName } from '../../utils/customerName';
import { useTranslation } from '../../context/LocaleContext';

export default function CustomerSelector() {
  const { t } = useTranslation();
  const { customers } = useCustomerStore();
  const { customer, setCustomer } = useCartStore();
  const { store } = useAuthStore();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 300);
  const [open, setOpen] = useState(false);
  const [optionalName, setOptionalName] = useState('');

  useEffect(() => {
    if (customer?.id) {
      setOptionalName('');
      return;
    }
    setOptionalName(customer?.name || '');
  }, [customer?.id, customer?.name]);

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return customers.slice(0, 8);
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(s) ||
        c.phone?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s),
    ).slice(0, 12);
  }, [customers, dq]);

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={(v) => {
              setQ(v);
              setOpen(true);
            }}
            placeholder={customer?.name || t('pos.customer.search')}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setCustomer(null);
            setQ('');
            setOptionalName('');
          }}
          className="text-xs px-3 py-2 rounded-xl border border-border hover:bg-background shrink-0"
        >
          {t('common.clear')}
        </button>
      </div>
      <input
        type="text"
        value={customer?.id ? customer.name || '' : optionalName}
        onChange={(e) => {
          const value = e.target.value;
          if (customer?.id) return;
          setOptionalName(value);
          const trimmed = normalizeOptionalCustomerName(value);
          setCustomer(
            trimmed
              ? { name: trimmed, email: customer?.email || '' }
              : null,
          );
        }}
        readOnly={Boolean(customer?.id)}
        placeholder={t('pos.customer.nameOptional')}
        className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 read-only:cursor-default read-only:bg-background/80"
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-background border-b border-border last:border-0"
              onClick={() => {
                setCustomer({
                  id: c.id,
                  name: c.name,
                  email: c.email || "",
                  phone: c.phone || "",
                  currentCredit: c.currentCredit,
                  creditLimit: c.creditLimit,
                });
                setQ('');
                setOpen(false);
              }}
            >
              <span className="font-medium text-text-primary">{c.name}</span>
              <span className="block text-xs text-text-muted">{c.phone}</span>
              {store?.posConfig?.enableCreditSale !== false &&
                Number(c.currentCredit) > 0 && (
                  <span className="block text-[10px] text-warning font-semibold">
                    Udhaar: {formatCurrency(c.currentCredit)}
                  </span>
                )}
            </button>
          ))}
          {!filtered.length && <p className="p-3 text-sm text-text-muted">No matches</p>}
        </div>
      )}
      {customer?.id && (
        <p className="text-xs text-accent mt-1">
          Selected: <span className="font-semibold">{customer.name}</span>
          {Number(customer.currentCredit) > 0 && (
            <span className="text-warning ml-1">
              · Udhaar {formatCurrency(customer.currentCredit)}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
