import { useTranslation } from '../../context/LocaleContext';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  danger,
  loading,
}) {
  const { t } = useTranslation();
  const resolvedConfirm = confirmLabel ?? t('common.confirm');
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-text-muted text-sm mb-6">{message}</div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-background"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
            danger ? 'bg-error hover:opacity-95' : 'bg-primary hover:opacity-95'
          } disabled:opacity-50`}
        >
          {loading ? t('ui.pleaseWait') : resolvedConfirm}
        </button>
      </div>
    </Modal>
  );
}
