import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import useAuthStore from "../../stores/authStore";
import { checkPermission, hasAdminAccess } from "../../utils/permissions";
import AccessDenied from "../ui/AccessDenied";
import LoadingScreen from "../ui/LoadingScreen";

export default function ProtectedRoute({
  children,
  requiredPermission,
  requireAdmin,
  requireSuperAdmin,
}) {
  const { t } = useTranslation();
  const { user, userDoc, store, loading, authHydrated } = useAuthStore();
  const location = useLocation();

  if (!authHydrated || loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!userDoc) {
    return <LoadingScreen />;
  }

  if (userDoc.isActive === false) {
    return (
      <AccessDenied
        title={t("ui.accessDenied.accountDisabled.title")}
        message={t("ui.accessDenied.accountDisabled.message")}
      />
    );
  }

  if (requireSuperAdmin && userDoc.role !== "superadmin") {
    return <AccessDenied message={t("ui.accessDenied.superAdmin")} />;
  }

  if (requireAdmin && !hasAdminAccess(userDoc)) {
    return <AccessDenied message={t("ui.accessDenied.admin")} />;
  }

  if (
    requiredPermission &&
    !checkPermission(userDoc, store, requiredPermission)
  ) {
    return (
      <AccessDenied
        message={t("ui.accessDenied.permission", {
          permission: requiredPermission,
        })}
        showBackButton
      />
    );
  }

  if (requiredPermission && userDoc.role === "superadmin" && !userDoc.storeId) {
    if (requiredPermission === "reports") {
      return <Navigate to="/super-admin/revenue" replace />;
    }
    if (requiredPermission === "transactions") {
      return <Navigate to="/super-admin/activity" replace />;
    }
  }

  if (
    userDoc.role === "admin" &&
    !userDoc.storeId &&
    location.pathname !== "/register" &&
    location.pathname !== "/register-store"
  ) {
    return <Navigate to="/register?step=store" replace />;
  }

  return children;
}

export { checkPermission };
