import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import useAlertStore from "../stores/alertStore";
import useAuthStore from "../stores/authStore";
import useProductStore from "../stores/productStore";
import { sendExpiryAlertEmail } from "../services/emailService";
import {
  getExpiryAlertsFromProducts,
  markNotified,
  requestBrowserNotificationPermission,
  shouldNotify,
  showBrowserExpiryNotification,
} from "../utils/expiryNotifications";

/**
 * Watches products for expiry risk → in-app alert, browser notification, SMTP email.
 */
export default function useExpiryNotifications() {
  const { user, userDoc, store } = useAuthStore();
  const { products } = useProductStore();
  const { addAlert } = useAlertStore();
  const processing = useRef(false);
  const askedPermission = useRef(false);

  useEffect(() => {
    if (!userDoc?.storeId || userDoc.role === "superadmin") return;
    if (!products?.length) return;
    if (processing.current) return;

    const expiryAlerts = getExpiryAlertsFromProducts(products);
    const pending = expiryAlerts.filter((a) =>
      shouldNotify(userDoc.storeId, a),
    );
    if (!pending.length) return;

    processing.current = true;

    (async () => {
      try {
        if (!askedPermission.current && typeof window !== "undefined") {
          askedPermission.current = true;
          const perm = await requestBrowserNotificationPermission();
          if (perm === "default") {
            toast("Enable browser notifications for expiry alerts", {
              icon: "🔔",
              duration: 4000,
            });
          }
        }

        for (const alert of pending) {
          const alertType = alert.level === "danger" ? "danger" : "warning";
          await addAlert(userDoc.storeId, {
            title: alert.title,
            message: `${alert.productName}: ${alert.message}`,
            type: alertType,
            actionUrl: "/inventory",
          });
        }

        showBrowserExpiryNotification({
          storeName: store?.name,
          items: pending,
        });

        const recipients = [
          store?.email,
          user?.email,
          userDoc?.email,
        ]
          .map((e) => String(e || "").trim().toLowerCase())
          .filter((e) => e.includes("@"));

        const uniqueRecipients = [...new Set(recipients)];

        if (uniqueRecipients.length) {
          await Promise.all(
            uniqueRecipients.map((to) =>
              sendExpiryAlertEmail({
                to,
                storeName: store?.name || "QuickPOS Store",
                items: pending.map((a) => ({
                  productName: a.productName,
                  title: a.title,
                  message: a.message,
                  level: a.level,
                  daysLeft: a.daysLeft,
                })),
              }).catch((err) => {
                console.warn("[QuickPOS] expiry email failed for", to, err);
              }),
            ),
          );
        }

        markNotified(userDoc.storeId, pending);

        if (pending.length === 1) {
          toast(`${pending[0].productName}: ${pending[0].title}`, {
            icon: "⚠️",
          });
        } else {
          toast(`${pending.length} products need expiry attention`, {
            icon: "⚠️",
          });
        }
      } finally {
        processing.current = false;
      }
    })();
  }, [
    products,
    userDoc?.storeId,
    userDoc?.role,
    store?.name,
    store?.email,
    user?.email,
    addAlert,
  ]);
}
