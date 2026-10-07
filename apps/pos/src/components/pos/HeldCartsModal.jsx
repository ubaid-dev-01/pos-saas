import Modal from '../ui/Modal';
import { format } from 'date-fns';
import useCartStore from '../../stores/cartStore';
import { useTranslation } from '../../context/LocaleContext';

export default function HeldCartsModal({ open, onClose }) {
  const { heldCarts, recallCart, deleteHeldCart } = useCartStore();
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={t('pos.heldCarts.title')}>
      <div className="space-y-2">
        {!heldCarts.length && <p className="text-sm text-text-muted">{t('pos.heldCarts.empty')}</p>}
        {heldCarts.map((h) => (
          <div key={h.id} className="flex items-center justify-between gap-2 border border-border rounded-xl p-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">{t('pos.items', { count: h.items.length })}</p>
              <p className="text-xs text-text-muted">{format(new Date(h.timestamp), 'dd MMM, h:mm a')}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold"
                onClick={() => {
                  recallCart(h.id);
                  onClose?.();
                }}
              >
                {t('pos.recall')}
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-border text-xs"
                onClick={() => deleteHeldCart(h.id)}
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
