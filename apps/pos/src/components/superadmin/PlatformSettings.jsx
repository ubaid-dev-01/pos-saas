import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { db } from "../../config/firebase";
import { useTranslation } from "../../context/LocaleContext";

const DEFAULT_CONFIG = {
  platformName: "QuickPOS",
  supportEmail: "support@quickpos.app",
  supportPhone: "",
  defaultTimezone: "Asia/Karachi",
  defaultCurrency: "PKR",
  sessionTimeoutMinutes: 30,
  freePlanProductLimit: 500,
  freePlanUserLimit: 3,
};

export default function PlatformSettings() {
  const { t } = useTranslation();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ref = doc(db, "platform", "config");
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      setConfig((prev) => ({ ...prev, ...snap.data() }));
    });
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      await setDoc(doc(db, "platform", "config"), config, { merge: true });
      toast.success(t("superAdmin.platformSettings.saved"));
    } catch (e) {
      toast.error(e?.message || t("superAdmin.platformSettings.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-4">
      <h2 className="text-lg font-bold text-text-primary">
        {t("superAdmin.platformSettings.title")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-text-muted">
            {t("superAdmin.platformSettings.platformName")}
          </span>
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            value={config.platformName || ""}
            onChange={(e) => update("platformName", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-text-muted">
            {t("superAdmin.platformSettings.supportEmail")}
          </span>
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            value={config.supportEmail || ""}
            onChange={(e) => update("supportEmail", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-text-muted">
            {t("superAdmin.platformSettings.supportPhone")}
          </span>
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            value={config.supportPhone || ""}
            onChange={(e) => update("supportPhone", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-text-muted">
            {t("superAdmin.platformSettings.defaultTimezone")}
          </span>
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            value={config.defaultTimezone || ""}
            onChange={(e) => update("defaultTimezone", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-text-muted">
            {t("superAdmin.platformSettings.defaultCurrency")}
          </span>
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            value={config.defaultCurrency || ""}
            onChange={(e) => update("defaultCurrency", e.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-text-muted">
            {t("superAdmin.platformSettings.sessionTimeout")}
          </span>
          <input
            type="number"
            min={5}
            className="w-full rounded-xl border border-border px-3 py-2"
            value={config.sessionTimeoutMinutes || 30}
            onChange={(e) =>
              update("sessionTimeoutMinutes", Number(e.target.value) || 30)
            }
          />
        </label>
        <label className="space-y-1">
          <span className="text-text-muted">
            {t("superAdmin.platformSettings.freePlanProductLimit")}
          </span>
          <input
            type="number"
            min={1}
            className="w-full rounded-xl border border-border px-3 py-2"
            value={config.freePlanProductLimit || 0}
            onChange={(e) =>
              update("freePlanProductLimit", Number(e.target.value) || 0)
            }
          />
        </label>
        <label className="space-y-1">
          <span className="text-text-muted">
            {t("superAdmin.platformSettings.freePlanUserLimit")}
          </span>
          <input
            type="number"
            min={1}
            className="w-full rounded-xl border border-border px-3 py-2"
            value={config.freePlanUserLimit || 0}
            onChange={(e) =>
              update("freePlanUserLimit", Number(e.target.value) || 0)
            }
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold disabled:opacity-60"
        >
          {saving
            ? t("superAdmin.platformSettings.saving")
            : t("superAdmin.platformSettings.save")}
        </button>
      </div>
    </div>
  );
}
