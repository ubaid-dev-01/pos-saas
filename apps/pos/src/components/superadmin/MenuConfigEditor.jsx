import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../context/LocaleContext";
import useAuthStore from "../../stores/authStore";

const keys = [
  "pos",
  "products",
  "inventory",
  "transactions",
  "reports",
  "customers",
  "settings",
];

const sidebarKey = {
  pos: "sidebar.pos",
  products: "sidebar.products",
  inventory: "sidebar.inventory",
  transactions: "sidebar.transactions",
  reports: "sidebar.reports",
  customers: "sidebar.customers",
  settings: "sidebar.settings",
};

export default function MenuConfigEditor({ store, onClose }) {
  const { t } = useTranslation();
  const { updateMenuConfig } = useAuthStore();
  const [cfg, setCfg] = useState(store?.menuConfig || {});

  useEffect(() => {
    setCfg(store?.menuConfig || {});
  }, [store]);

  if (!store) return null;

  const save = async () => {
    try {
      await updateMenuConfig(store.id, cfg);
      toast.success(t("superAdmin.menuConfig.saved"));
      onClose?.();
    } catch (e) {
      toast.error(e?.message || t("superAdmin.menuConfig.saveFailed"));
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <p className="text-text-muted">
        {t("superAdmin.menuConfig.storeLabel", { name: store.name })}
      </p>
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-text-primary space-y-1">
        <p className="font-semibold">{t("superAdmin.menuConfig.warningTitle")}</p>
        <p>{t("superAdmin.menuConfig.warning1")}</p>
        <p>{t("superAdmin.menuConfig.warning2")}</p>
        <p>{t("superAdmin.menuConfig.warning3")}</p>
        <p>{t("superAdmin.menuConfig.warning4")}</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {keys.map((k) => (
          <label
            key={k}
            className="flex items-center justify-between gap-3 border border-border rounded-xl px-3 py-2.5"
          >
            <div>
              <p className="font-medium text-text-primary">{t(sidebarKey[k])}</p>
              <p className="text-xs text-text-muted">
                {t(`superAdmin.menuConfig.desc.${k}`)}
              </p>
            </div>
            <input
              type="checkbox"
              checked={cfg[k] !== false}
              onChange={(e) => setCfg({ ...cfg, [k]: e.target.checked })}
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold"
      >
        {t("common.save")}
      </button>
    </div>
  );
}
