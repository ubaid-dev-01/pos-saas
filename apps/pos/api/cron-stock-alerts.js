import { getFirebaseAdmin } from "./_lib/firebaseAdmin.js";
import { sendLowStockAlertEmail } from "./_lib/notificationService.js";

/**
 * Daily stock digest for all active stores.
 * Secure with CRON_SECRET (Vercel Cron Authorization: Bearer <secret>).
 */
function authorized(req) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const auth = String(req.headers.authorization || "");
  if (auth === `Bearer ${secret}`) return true;
  const q = String(req.query?.secret || "");
  return q === secret;
}

function productNeedsAlert(product) {
  const stock = Number(product.stock) || 0;
  const threshold = Math.max(0, Number(product.lowStockThreshold ?? 5));
  if (stock <= 0) return true;
  if (threshold > 0 && stock <= threshold) return true;
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { db, memOtpFallback } = await getFirebaseAdmin();
    if (memOtpFallback || !db) {
      return res.status(503).json({
        error: "Firebase Admin required for stock cron. Configure service account.",
      });
    }

    const storesSnap = await db
      .collection("stores")
      .where("isActive", "==", true)
      .limit(200)
      .get();

    const results = [];
    const todayKey = new Date().toISOString().slice(0, 10);

    for (const storeDoc of storesSnap.docs) {
      const store = storeDoc.data() || {};
      const storeId = storeDoc.id;
      const to = String(store.email || "").trim().toLowerCase();
      if (!to || !to.includes("@")) {
        results.push({ storeId, skipped: "no_email" });
        continue;
      }

      const metaRef = db.collection("stores").doc(storeId).collection("meta").doc("emailDigests");
      const metaSnap = await metaRef.get();
      const lastStockDay = metaSnap.exists ? metaSnap.data()?.lastStockDay : null;
      if (lastStockDay === todayKey) {
        results.push({ storeId, skipped: "already_sent_today" });
        continue;
      }

      const productsSnap = await db
        .collection("stores")
        .doc(storeId)
        .collection("products")
        .limit(500)
        .get();

      const items = [];
      productsSnap.forEach((p) => {
        const data = p.data() || {};
        if (!productNeedsAlert(data)) return;
        items.push({
          productName: data.name || "Product",
          sku: data.sku || data.barcode || "",
          stock: Number(data.stock) || 0,
        });
      });

      if (!items.length) {
        results.push({ storeId, skipped: "ok_stock" });
        continue;
      }

      items.sort((a, b) => a.stock - b.stock);

      try {
        await sendLowStockAlertEmail({
          to,
          storeName: store.name || "Your store",
          items,
        });
        await metaRef.set(
          {
            lastStockDay: todayKey,
            lastStockAt: new Date().toISOString(),
            lastStockCount: items.length,
          },
          { merge: true },
        );
        results.push({ storeId, sent: true, count: items.length });
      } catch (err) {
        results.push({
          storeId,
          error: err?.message || "send_failed",
        });
      }
    }

    res.status(200).json({
      ok: true,
      day: todayKey,
      stores: storesSnap.size,
      results,
    });
  } catch (error) {
    console.error("cron-stock-alerts:", error);
    res.status(500).json({ error: error.message || "Cron failed" });
  }
}
