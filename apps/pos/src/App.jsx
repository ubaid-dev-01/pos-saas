import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoadingScreen from "./components/ui/LoadingScreen";
import useAuthStore from "./stores/authStore";

const AppLayout = lazy(() => import("./components/layout/AppLayout"));

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const POSPage = lazy(() => import("./pages/POSPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SuperAdminPage = lazy(() => import("./pages/SuperAdminPage"));

function RootRedirect() {
  const { userDoc } = useAuthStore();
  if (!userDoc) return <Navigate to="/login" replace />;
  if (userDoc.role === "superadmin")
    return <Navigate to="/super-admin" replace />;
  if (userDoc.role === "admin" && !userDoc.storeId)
    return <Navigate to="/register?step=store" replace />;
  return <Navigate to="/pos" replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  const authHydrated = useAuthStore((s) => s.authHydrated);

  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  if (!authHydrated) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<RootRedirect />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/pos"
            element={
              <ProtectedRoute requiredPermission="pos">
                <POSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute requiredPermission="products">
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute requiredPermission="inventory">
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute requiredPermission="transactions">
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPermission="reports">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute requiredPermission="customers">
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requireAdmin>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/dashboard" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
