import {
  AlertTriangle,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Package,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import useAlertStore from "../stores/alertStore";
import useAuthStore from "../stores/authStore";
import useProductStore from "../stores/productStore";
import { formatDate } from "../utils/format";
import {
  getInventoryAlertSeenMap,
  markAllInventoryAlertsSeen,
  markInventoryAlertSeen,
} from "../utils/inventoryAlertReadState";
import { getProductAlerts } from "../utils/productAlerts";
import { useTranslation } from "../context/LocaleContext";

export default function AlertsPage() {
  const { t } = useTranslation();
  const { userDoc } = useAuthStore();
  const { products } = useProductStore();
  const [localSeen, setLocalSeen] = useState({});
  const {
    alerts,
    loading,
    subscribe,
    unsubscribe,
    markAsSeen,
    markAllAsSeen,
    deleteAlert,
  } = useAlertStore();

  useEffect(() => {
    if (userDoc?.storeId) {
      subscribe(userDoc.storeId);
      return () => unsubscribe();
    }
  }, [userDoc?.storeId, subscribe, unsubscribe]);

  useEffect(() => {
    if (!userDoc?.storeId) return;
    setLocalSeen(getInventoryAlertSeenMap(userDoc.storeId));
  }, [userDoc?.storeId]);

  const productAlerts = useMemo(() => {
    return getProductAlerts(products).map((item) => ({
      id: `inventory-${item.id}`,
      productId: item.productId,
      productName: item.productName,
      kind: item.kind,
      stock: item.stock,
      threshold: item.threshold,
      daysLeft: item.daysLeft,
      expiryDate: item.expiryDate,
      title: item.title,
      message: item.message,
      type: item.level === "danger" ? "danger" : "warning",
      seen: false,
      isSystem: false,
      createdAt: item.expiryDate || new Date().toISOString(),
      actionUrl: "/products",
    }));
  }, [products]);

  const displayAlerts = useMemo(() => {
    const system = alerts.map((a) => ({ ...a, isSystem: true }));
    return [...system, ...productAlerts]
      .map((a) => ({ ...a, seen: a.seen || Boolean(localSeen[a.id]) }))
      .sort((a, b) => {
        const aTime = Date.parse(String(a.createdAt || 0)) || 0;
        const bTime = Date.parse(String(b.createdAt || 0)) || 0;
        return bTime - aTime;
      });
  }, [alerts, productAlerts, localSeen]);

  const stats = useMemo(
    () => ({
      total: displayAlerts.length,
      unseen: displayAlerts.filter((a) => !a.seen).length,
      danger: displayAlerts.filter((a) => a.type === "danger").length,
      warning: displayAlerts.filter((a) => a.type === "warning").length,
    }),
    [displayAlerts],
  );

  const markSingleAsRead = (alert) => {
    if (alert.isSystem) {
      if (userDoc?.storeId) {
        markAsSeen(userDoc.storeId, alert.id);
      }
      return;
    }
    if (userDoc?.storeId) {
      markInventoryAlertSeen(userDoc.storeId, alert.id);
    }
    setLocalSeen((prev) => ({ ...prev, [alert.id]: true }));
  };

  const markAllVisibleAsRead = () => {
    if (userDoc?.storeId) {
      markAllAsSeen(userDoc.storeId);
    }
    const next = {};
    displayAlerts.forEach((a) => {
      if (!a.isSystem) next[a.id] = true;
    });
    if (userDoc?.storeId) {
      markAllInventoryAlertsSeen(userDoc.storeId, Object.keys(next));
    }
    setLocalSeen((prev) => ({ ...prev, ...next }));
  };

  const alertDetailText = (alert) => {
    if (alert.isSystem) return null;
    if (alert.kind === "stock") {
      return `Product: ${alert.productName || "Unknown"} | Stock: ${Number(alert.stock || 0)} | Threshold: ${Number(alert.threshold || 0)}`;
    }
    if (alert.kind === "expiry") {
      const days = Number(alert.daysLeft);
      const dayText = Number.isFinite(days)
        ? days < 0
          ? `${Math.abs(days)} day(s) overdue`
          : `${days} day(s) left`
        : "expiry soon";
      return `Product: ${alert.productName || "Unknown"} | Expiry: ${formatDate(alert.expiryDate)} | ${dayText}`;
    }
    return `Product: ${alert.productName || "Unknown"}`;
  };

  const readableDate = (value) => {
    if (!value) return formatDate(new Date());
    if (typeof value?.toDate === "function") return formatDate(value.toDate());
    return formatDate(value);
  };

  const typeConfig = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      badge: "info",
      icon: Bell,
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badge: "success",
      icon: CheckCheck,
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "warning",
      icon: AlertTriangle,
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      badge: "error",
      icon: AlertTriangle,
    },
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
            <BellRing className="w-4 h-4" /> Notifications
          </p>
          <h1 className="text-2xl font-bold text-text-primary mt-2">{t("alerts.title")}</h1>
          <p className="text-sm text-text-muted max-w-2xl">
            Manage and track system notifications and alerts for your store.
          </p>
        </div>
        {stats.unseen > 0 && (
          <button
            onClick={markAllVisibleAsRead}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/80 transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total alerts",
            value: stats.total,
            color: "text-slate-600",
            icon: Bell,
          },
          {
            label: "Unread",
            value: stats.unseen,
            color: "text-blue-600",
            icon: BellRing,
          },
          {
            label: "Critical",
            value: stats.danger,
            color: "text-red-600",
            icon: AlertTriangle,
          },
          {
            label: "Warnings",
            value: stats.warning,
            color: "text-amber-600",
            icon: Package,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">{card.label}</p>
              <card.icon className="w-4 h-4 text-text-muted" />
            </div>
            <p className={`text-2xl font-bold ${card.color} mt-1`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="w-full h-40 flex items-center justify-center">
            <p className="text-text-muted">Loading alerts...</p>
          </div>
        ) : displayAlerts.length === 0 ? (
          <EmptyState
            title="No alerts"
            description="You're all caught up! No notifications at this time."
            icon={Bell}
          />
        ) : (
          displayAlerts.map((alert) => {
            const config = typeConfig[alert.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border-2 ${config.border} ${config.bg} p-4 flex items-start gap-4 transition-all ${
                  !alert.seen ? "ring-2 ring-offset-2 ring-primary/30" : ""
                }`}
              >
                <div className="mt-1">
                  <Icon className="w-5 h-5 text-text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text-primary">
                          {alert.title}
                        </h3>
                        <Badge variant={config.badge}>{alert.type}</Badge>
                        {!alert.isSystem && (
                          <Badge variant="neutral">inventory</Badge>
                        )}
                        {!alert.seen && (
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-text-muted mt-1">
                        {alert.message}
                      </p>
                      {!alert.isSystem && (
                        <p className="text-xs text-text-muted mt-1">
                          {alertDetailText(alert)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 gap-2">
                    <p className="text-xs text-text-muted">
                      {readableDate(alert.createdAt)}
                    </p>
                    <div className="flex items-center gap-2">
                      {!alert.seen && (
                        <button
                          onClick={() => markSingleAsRead(alert)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                      {alert.isSystem && (
                        <button
                          onClick={() => {
                            if (userDoc?.storeId) {
                              deleteAlert(userDoc.storeId, alert.id);
                            }
                          }}
                          className="inline-flex items-center justify-center p-1 rounded-lg text-text-muted hover:bg-black/10 transition-colors"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
