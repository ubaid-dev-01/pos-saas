import { AnimatePresence, motion } from "framer-motion";
import {
    BarChart3,
    Bell,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    MoreHorizontal,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import useAuthStore from "../../stores/authStore";
import { checkPermission } from "../../utils/permissions";

const NAV = [
  {
    to: "/super-admin",
    key: "super",
    labelKey: "sidebar.platform",
    icon: LayoutDashboard,
    superOnly: true,
  },
  { to: "/pos", key: "pos", labelKey: "sidebar.pos", icon: ShoppingCart },
  { to: "/products", key: "products", labelKey: "sidebar.products", icon: Package },
  {
    to: "/inventory",
    key: "inventory",
    labelKey: "sidebar.inventory",
    icon: ClipboardList,
  },
  { to: "/alerts", key: "alerts", labelKey: "sidebar.alerts", icon: Bell },
  {
    to: "/support",
    key: "support",
    labelKey: "sidebar.support",
    icon: MessageSquare,
    allRoles: true,
  },
  {
    to: "/transactions",
    key: "transactions",
    labelKey: "sidebar.transactions",
    icon: Receipt,
  },
  { to: "/reports", key: "reports", labelKey: "sidebar.reports", icon: BarChart3 },
  { to: "/customers", key: "customers", labelKey: "sidebar.customers", icon: Users },
  { to: "/settings", key: "settings", labelKey: "sidebar.settings", icon: Settings },
];

function visibleForUser(item, userDoc, store) {
  if (item.allRoles) return true;
  if (item.superOnly) return userDoc?.role === "superadmin";
  if (userDoc?.role === "superadmin") return false;
  return checkPermission(userDoc, store, item.key);
}

export default function Sidebar({ collapsed = false, onToggleSidebar }) {
  const navigate = useNavigate();
  const { userDoc, store, logout } = useAuthStore();
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = useMemo(
    () => NAV.filter((n) => visibleForUser(n, userDoc, store)),
    [userDoc, store],
  );

  const bottomPrimary = items.filter((i) => !i.superOnly).slice(0, 4);
  const bottomMore = items.filter((i) => !i.superOnly).slice(4);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border-l-4 ${
      isActive
        ? "bg-white/15 text-white border-secondary"
        : "text-white/75 hover:bg-white/10 border-transparent"
    }`;

  return (
    <>
      <motion.aside
        className="hidden md:flex flex-col border-r border-border bg-primary text-white shrink-0 h-[calc(100vh-3.5rem)] sticky top-14"
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-2 border-b border-white/10 min-h-[56px] flex items-center">
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`flex items-center gap-3 w-full rounded-xl text-white hover:bg-white/10 transition-colors ${
              collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
            }`}
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          >
            <Menu className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs text-white/70 truncate">
                  {store?.name || t("header.default")}
                </p>
                <p className="text-sm font-semibold truncate">{t("sidebar.menu")}</p>
              </div>
            )}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              title={t(item.labelKey)}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-white/10 space-y-1">
          <button
            type="button"
            onClick={() => logout().then(() => navigate("/login"))}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/90 hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>{t("sidebar.logout")}</span>}
          </button>
        </div>
      </motion.aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border flex items-stretch justify-around h-16">
        {userDoc?.role === "superadmin" ? (
          <>
            <NavLink
              to="/super-admin"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center text-xs ${isActive ? "text-accent" : "text-text-muted"}`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              {t("sidebar.platform")}
            </NavLink>
            <NavLink
              to="/support"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center text-xs ${isActive ? "text-accent" : "text-text-muted"}`
              }
            >
              <MessageSquare className="w-5 h-5 mb-0.5" />
              {t("sidebar.support")}
            </NavLink>
          </>
        ) : (
          <>
            {bottomPrimary.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center text-xs ${isActive ? "text-accent" : "text-text-muted"}`
                }
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                <span className="truncate max-w-[72px]">{t(item.labelKey)}</span>
              </NavLink>
            ))}
            {bottomMore.length > 0 && (
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className="flex-1 flex flex-col items-center justify-center text-xs text-text-muted"
              >
                <MoreHorizontal className="w-5 h-5 mb-0.5" />
                {t("sidebar.more")}
              </button>
            )}
          </>
        )}
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-[60] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMoreOpen(false)}
          >
            <motion.div
              className="absolute bottom-0 inset-x-0 bg-surface rounded-t-2xl p-4 border-t border-border max-h-[60vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-text-primary mb-3">
                {t("sidebar.more")}
              </p>
              <div className="space-y-1">
                {bottomMore.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background text-text-primary"
                  >
                    <item.icon className="w-5 h-5 text-text-muted" />
                    {t(item.labelKey)}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
