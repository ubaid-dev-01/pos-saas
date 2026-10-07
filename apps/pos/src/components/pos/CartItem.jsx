import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import useCartStore from '../../stores/cartStore';
import { useTranslation } from '../../context/LocaleContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem, setItemDiscount } = useCartStore();
  const { t } = useTranslation();
  const line = Number(item.unitPrice) * Number(item.quantity);
  const afterItemDisc = line * (1 - (Number(item.discount) || 0) / 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100, height: 0 }}
      className="border border-border rounded-xl p-3 bg-surface"
    >
      <div className="flex justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
          <p className="text-xs text-text-muted">{formatCurrency(item.unitPrice)} × {item.quantity}</p>
        </div>
        <button type="button" className="p-1 text-error" onClick={() => removeItem(item.productId)} aria-label={t('ui.remove')}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          className="p-1 rounded-lg border border-border"
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
        <button
          type="button"
          className="p-1 rounded-lg border border-border"
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
        >
          <Plus className="w-4 h-4" />
        </button>
        <span className="ml-auto text-sm font-bold text-primary">{formatCurrency(afterItemDisc)}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="text-[11px] text-text-muted shrink-0">{t('pos.itemDisc')}</label>
        <input
          type="number"
          min={0}
          max={100}
          className="w-20 rounded-lg border border-border px-2 py-1 text-xs"
          value={item.discount || 0}
          onChange={(e) => setItemDiscount(item.productId, e.target.value)}
        />
      </div>
    </motion.div>
  );
}
