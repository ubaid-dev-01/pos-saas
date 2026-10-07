import { useState } from "react";
import CategoryManager from "../components/settings/CategoryManager";
import ProfileSettings from "../components/settings/ProfileSettings";
import StoreSettings from "../components/settings/StoreSettings";
import SupplierManager from "../components/settings/SupplierManager";
import TaxManager from "../components/settings/TaxManager";
import UserManager from "../components/settings/UserManager";
import { useTranslation } from "../context/LocaleContext";
import useAuthStore from "../stores/authStore";

const tabs = [
  { id: "profile", labelKey: "settings.tab.profile" },
  { id: "store", labelKey: "settings.store" },
  { id: "categories", labelKey: "settings.categories" },
  { id: "tax", labelKey: "settings.tab.tax" },
  { id: "suppliers", labelKey: "settings.suppliers" },
  { id: "users", labelKey: "settings.users", adminOnly: true },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const { userDoc } = useAuthStore();
  const [tab, setTab] = useState("store");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-primary">{t("settings.title")}</h1>
      <div className="flex flex-wrap gap-2">
        {tabs
          .filter((item) => !item.adminOnly || userDoc?.role === "admin")
          .map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                tab === item.id
                  ? "bg-primary text-white border-primary"
                  : "border-border text-text-muted"
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
      </div>
      {tab === "profile" && <ProfileSettings />}
      {tab === "store" && <StoreSettings />}
      {tab === "categories" && <CategoryManager />}
      {tab === "tax" && <TaxManager />}
      {tab === "suppliers" && <SupplierManager />}
      {tab === "users" && userDoc?.role === "admin" && <UserManager />}
    </div>
  );
}
