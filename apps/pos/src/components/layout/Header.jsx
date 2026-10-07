import { format } from "date-fns";
import { Bell, Languages, LogOut, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import useAlertStore from "../../stores/alertStore";
import useAuthStore from "../../stores/authStore";
import useProductStore from "../../stores/productStore";
import { LANGUAGES } from "../../utils/i18n";
import { getInventoryAlertSeenMap } from "../../utils/inventoryAlertReadState";
import { getProductAlerts } from "../../utils/productAlerts";

const titleKeys = {
  "/pos": "header.pos",
  "/products": "header.products",
  "/inventory": "header.inventory",
  "/transactions": "header.transactions",
  "/reports": "header.reports",
  "/customers": "header.customers",
  "/settings": "header.settings",
  "/alerts": "header.alerts",
  "/support": "header.support",
  "/super-admin": "header.platform",
};

function resolveTitleKey(pathname) {
  if (pathname.startsWith("/super-admin/stores/")) return "header.storeDetail";
  if (pathname.startsWith("/super-admin/stores")) return "header.platformStores";
  if (pathname.startsWith("/super-admin/users")) return "header.platformUsers";
  if (pathname.startsWith("/super-admin/leads")) return "header.leadManagement";
  if (pathname.startsWith("/super-admin/revenue")) return "header.revenueAnalytics";
  if (pathname.startsWith("/super-admin/activity")) return "header.activityLog";
  if (pathname.startsWith("/super-admin/settings")) return "header.platformSettings";
  return titleKeys[pathname] || "header.default";
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, setLang } = useTranslation();
  const { userDoc, store, logout } = useAuthStore();
  const { alerts: systemAlerts, subscribe, unsubscribe } = useAlertStore();
  const { products } = useProductStore();
  const [now, setNow] = useState(new Date());
  const [inventorySeen, setInventorySeen] = useState({});
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (userDoc?.storeId) {
      subscribe(userDoc.storeId);
      return () => unsubscribe();
    }
  }, [userDoc?.storeId, subscribe, unsubscribe]);

  useEffect(() => {
    if (!userDoc?.storeId) return;
    const syncSeen = () => {
      setInventorySeen(getInventoryAlertSeenMap(userDoc.storeId));
    };
    syncSeen();
    window.addEventListener("focus", syncSeen);
    return () => window.removeEventListener("focus", syncSeen);
  }, [userDoc?.storeId]);

  const productAlerts = useMemo(
    () => getProductAlerts(products, { now }),
    [products, now],
  );

  const unseenInventoryAlerts = useMemo(
    () =>
      productAlerts.filter((a) => !inventorySeen[`inventory-${a.id}`]).length,
    [productAlerts, inventorySeen],
  );

  const unseenSystemAlerts = useMemo(
    () => systemAlerts.filter((a) => !a.seen).length,
    [systemAlerts],
  );

  const totalAlerts = unseenInventoryAlerts + unseenSystemAlerts;

  const title = t(resolveTitleKey(location.pathname));
  const storeName =
    userDoc?.role === "superadmin"
      ? t("header.platformName")
      : store?.name || t("header.yourStore");
  const initial = (userDoc?.displayName || userDoc?.email || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="items-center sticky top-0 z-40 bg-surface border-b border-border">
      <div className="px-4 max-w-[100vw] w-full h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {store?.logo ? (
            <img
              src={store.logo}
              alt={storeName}
              className="h-8 rounded-lg"
              title={`${storeName} Logo`}
            />
          ) : (
            store?.name && (
              <div className="flex items-center justify-center h-6 w-6 rounded bg-secondary text-white text-[10px] font-bold">
                {store.name.charAt(0).toUpperCase()}
              </div>
            )
          )}

          <div className="min-w-0">
            <p className="text-xs text-text-muted truncate">{storeName}</p>
            <p className="text-sm font-semibold text-text-primary truncate">
              {title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <span className="hidden sm:block text-xs text-text-muted tabular-nums">
            {format(now, "EEE, dd MMM · h:mm a")}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold hover:bg-background"
              title={t("header.changeLanguage")}
            >
              <Languages className="h-3.5 w-3.5" />
              {LANGUAGES.find((l) => l.code === lang)?.short || "EN"}
            </button>
            {langOpen && (
              <>
                <button
                  type="button"
                  aria-label={t("header.closeLanguageMenu")}
                  className="fixed inset-0 z-40"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-lg border border-border bg-surface shadow-lg">
                  {LANGUAGES.map((l) => (
                    <button
                      type="button"
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-xs font-medium hover:bg-background ${
                        l.code === lang ? "text-primary" : "text-text-primary"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 pl-2 border-l border-border">
            {userDoc?.photoURL ? (
              <img
                src={userDoc.photoURL}
                alt={userDoc.displayName}
                className="w-9 h-9 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                {initial}
              </div>
            )}
            <div className="hidden lg:block max-w-[140px]">
              <p className="text-sm font-medium text-text-primary truncate">
                {userDoc?.displayName || t("header.user")}
              </p>
              <p className="text-xs text-text-muted capitalize">
                {userDoc?.role}
              </p>
            </div>
            {userDoc?.role !== "superadmin" && totalAlerts > 0 && (
              <button
                type="button"
                className="relative p-2 rounded-lg hover:bg-background text-text-muted"
                title={t("header.alertsNotifications")}
                onClick={() => navigate("/alerts")}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-[10px] font-bold text-text-primary flex items-center justify-center">
                  {totalAlerts}
                </span>
              </button>
            )}
            {userDoc?.role !== "superadmin" && (
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="p-2 rounded-lg hover:bg-background text-text-muted"
                title={t("header.storeSettings")}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => logout().then(() => navigate("/login"))}
              className="p-2 rounded-lg hover:bg-background text-text-muted"
              title={t("header.logout")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
