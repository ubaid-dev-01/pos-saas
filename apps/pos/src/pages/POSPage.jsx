import { useCallback, useMemo, useRef, useState } from 'react';
import ProductGrid from '../components/pos/ProductGrid';
import CartSidebar from '../components/pos/CartSidebar';
import CashSessionBar from '../components/pos/CashSessionBar';
import OfflineBanner from '../components/pos/OfflineBanner';
import Modal from '../components/ui/Modal';
import useKeyboardShortcut from '../hooks/useKeyboardShortcut';
import useCartStore from '../stores/cartStore';
import toast from 'react-hot-toast';
import { useTranslation } from '../context/LocaleContext';

export default function POSPage() {
  const { t } = useTranslation();
  const searchRef = useRef(null);
  const barcodeRef = useRef(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const { clearCart, holdCart, lastReceipt } = useCartStore();

  const printLast = useCallback(() => {
    if (!lastReceipt) {
      toast.error(t('pos.noReceiptYet'));
      return;
    }
    window.print();
  }, [lastReceipt]);

  const shortcuts = useMemo(
    () => ({
      'ctrl+n': () => {
        clearCart();
        toast.success(t('pos.newTransaction'));
      },
      'meta+n': () => {
        clearCart();
        toast.success(t('pos.newTransaction'));
      },
      'ctrl+s': () => {
        holdCart();
        toast.success(t('pos.cartHeld'));
      },
      'meta+s': () => {
        holdCart();
        toast.success(t('pos.cartHeld'));
      },
      'ctrl+p': printLast,
      'meta+p': printLast,
      'ctrl+f': () => searchRef.current?.focus(),
      'meta+f': () => searchRef.current?.focus(),
      'ctrl+k': () => barcodeRef.current?.focus(),
      'meta+k': () => barcodeRef.current?.focus(),
      f1: () => setHelpOpen(true),
    }),
    [clearCart, holdCart, printLast, t],
  );

  useKeyboardShortcut(shortcuts, true);

  return (
    <div className="space-y-3">
      <OfflineBanner />
      <CashSessionBar />
      <div className="flex gap-4 items-start">
      <div className="flex-1 min-w-0">
        <ProductGrid searchRef={searchRef} barcodeRef={barcodeRef} />
      </div>
      <CartSidebar />
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={t('pos.helpTitle')}>
        <ul className="text-sm text-text-muted space-y-2">
          <li>
            <kbd className="px-1 py-0.5 rounded border text-text-primary">Ctrl/Cmd + N</kbd> New transaction (clear cart)
          </li>
          <li>
            <kbd className="px-1 py-0.5 rounded border text-text-primary">Ctrl/Cmd + S</kbd> Hold cart
          </li>
          <li>
            <kbd className="px-1 py-0.5 rounded border text-text-primary">Ctrl/Cmd + P</kbd> Print last receipt
          </li>
          <li>
            <kbd className="px-1 py-0.5 rounded border text-text-primary">Ctrl/Cmd + F</kbd> Focus product search
          </li>
          <li>
            <kbd className="px-1 py-0.5 rounded border text-text-primary">F1</kbd> This help
          </li>
          <li>
            <kbd className="px-1 py-0.5 rounded border text-text-primary">Esc</kbd> Close modals
          </li>
        </ul>
      </Modal>
      </div>
    </div>
  );
}
