import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../stores/authStore';
import useProductStore from '../../stores/productStore';
import useTransactionStore from '../../stores/transactionStore';
import useCustomerStore from '../../stores/customerStore';
import useInventoryStore from '../../stores/inventoryStore';
import useOfflineStore from '../../stores/offlineStore';
import Sidebar from './Sidebar';
import Header from './Header';
import useExpiryNotifications from '../../hooks/useExpiryNotifications';
import { useTranslation } from '../../context/LocaleContext';

const IDLE_MS = 30 * 60 * 1000;
const WARN_MS = 25 * 60 * 1000;

export default function AppLayout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userDoc, logout } = useAuthStore();
  const last = useRef(Date.now());
  const [warn, setWarn] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  );

  useExpiryNotifications();

  useEffect(() => {
    const cleanup = useOfflineStore.getState().init();
    return cleanup;
  }, []);

  useEffect(() => {
    if (!userDoc?.storeId || userDoc.role === 'superadmin') return undefined;
    const { subscribeProducts, cleanup } = useProductStore.getState();
    const { subscribe: subTxn, cleanup: cTxn } = useTransactionStore.getState();
    const { subscribe: subCust, cleanup: cCust } = useCustomerStore.getState();
    const { subscribe: subInv, cleanup: cInv } = useInventoryStore.getState();
    subscribeProducts(userDoc.storeId);
    subTxn(userDoc.storeId);
    subCust(userDoc.storeId);
    subInv(userDoc.storeId);
    return () => {
      cleanup();
      cTxn();
      cCust();
      cInv();
    };
  }, [userDoc?.storeId, userDoc?.role]);

  useEffect(() => {
    const bump = () => {
      last.current = Date.now();
      setWarn(false);
    };
    const tick = () => {
      const idle = Date.now() - last.current;
      if (idle >= IDLE_MS) {
        logout().then(() => navigate('/login'));
      } else if (idle >= WARN_MS) {
        setWarn(true);
      }
    };
    const id = window.setInterval(tick, 30_000);
    window.addEventListener('mousemove', bump);
    window.addEventListener('keydown', bump);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('mousemove', bump);
      window.removeEventListener('keydown', bump);
    };
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {warn && (
        <div className="bg-secondary/20 text-text-primary text-center text-xs py-2 px-4 border-b border-secondary/30">
          {t('layout.idleWarning')}
        </div>
      )}
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        />
        <motion.main
          className="flex-1 min-w-0 overflow-y-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto w-full max-w-content px-4 py-6 pb-24 md:pb-6">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
}
