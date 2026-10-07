import { format } from "date-fns";
import { AlertCircle, CloudOff, RefreshCw, Wifi } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../context/LocaleContext";
import useOfflineStore from "../../stores/offlineStore";
import { fbrStatusLabel } from "../../utils/fbr";
import useAuthStore from "../../stores/authStore";

export default function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline, pendingCount, syncing, init, syncPending, refreshCount } =
    useOfflineStore();
  const { store } = useAuthStore();

  useEffect(() => {
    const cleanup = init();
    refreshCount();
    return cleanup;
  }, [init, refreshCount]);

  const handleSync = async () => {
    const result = await syncPending();
    if (result.synced > 0) {
      toast.success(t("pos.offline.synced", { count: result.synced }));
    } else if (result.failed > 0) {
      toast.error(t("pos.offline.syncFailed", { count: result.failed }));
    } else {
      toast(t("pos.offline.noPending"));
    }
  };

  const fbrEnabled = store?.fbrConfig?.enabled;

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 ${
        isOnline
          ? "border-success/30 bg-success/5 text-text-primary"
          : "border-warning/40 bg-warning/10 text-text-primary"
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-success shrink-0" />
        ) : (
          <CloudOff className="h-4 w-4 text-warning shrink-0" />
        )}
        <span>
          {isOnline ? t("pos.offline.online") : t("pos.offline.offline")}
        </span>
        {fbrEnabled && (
          <span className="rounded-full bg-background px-2 py-0.5 border border-border text-[10px]">
            {fbrStatusLabel(isOnline ? "pending" : "queued_offline", t)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-warning font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            {t("pos.offline.pending", { count: pendingCount })}
          </span>
        )}
        {isOnline && pendingCount > 0 && (
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 font-semibold hover:bg-background disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {t("pos.offline.syncNow")}
          </button>
        )}
      </div>
    </div>
  );
}

export function buildOfflineInvoiceNo() {
  return `OFF-${format(new Date(), "yyyyMMdd-HHmmss")}`;
}
