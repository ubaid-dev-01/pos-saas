import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Load .env files for dev server only. Skipped during build. */
async function loadEnv() {
  try {
    const dotenv = await import(/* @vite-ignore */ "dotenv");
    dotenv.config({ path: path.join(root, ".env") });
    dotenv.config({ path: path.join(root, ".env.local"), override: true });
  } catch {
    // dotenv not installed (e.g. production build) — Vite handles env natively
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

/**
 * Serves /api/send-receipt-email and /api/send-welcome-email during `vite` dev
 * so you don't need a separate email-server process.
 */
export function emailApiPlugin() {
  let handlers;

  async function loadHandlers() {
    if (!handlers) {
      const receipt = await import("./api/_lib/receiptEmail.js");
      const mailer = await import("./api/_lib/mailer.js");
      const otp = await import("./api/_lib/otpService.js");
      const notifications = await import("./api/_lib/notificationService.js");
      handlers = { receipt, mailer, otp, notifications };
    }
    return handlers;
  }

  return {
    name: "quickpos-email-api",
    configureServer(server) {
      loadEnv().catch(() => {});
      loadHandlers()
        .then(async () => {
          const {
            resetFirebaseAdminCache,
            getFirebaseAdmin,
            firebaseAdminSetupHint,
          } = await import("./api/_lib/firebaseAdmin.js");
          resetFirebaseAdminCache();
          const { auth, memOtpFallback } = await getFirebaseAdmin();
          if (memOtpFallback || !auth) {
            console.warn(`[quickpos-email-api] ${firebaseAdminSetupHint()}`);
          } else {
            console.log(
              "[quickpos-email-api] Firebase Admin OK - password reset enabled",
            );
            console.log(
              "[quickpos-email-api] OTP store: in-memory (local dev). Request OTP and reset in the same dev session.",
            );
          }
        })
        .catch(() => {});

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] || "";

        if (req.method === "OPTIONS" && url.startsWith("/api/")) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.statusCode = 204;
          res.end();
          return;
        }

        if (url === "/api/send-receipt-email" && req.method === "POST") {
          try {
            const { receipt, mailer } = await loadHandlers();
            const body = await readJsonBody(req);
            const to = String(body.to || "")
              .trim()
              .toLowerCase();
            if (!to || !to.includes("@")) {
              sendJson(res, 400, { error: "Valid email required" });
              return;
            }
            await receipt.sendReceiptPdfEmail({
              to,
              receipt: body.receipt || {},
            });
            sendJson(res, 200, {
              ok: true,
              message: "Receipt sent successfully",
            });
          } catch (error) {
            console.error("[quickpos-email-api] receipt:", error);
            sendJson(res, 500, {
              error: error?.message || "Failed to send receipt email",
            });
          }
          return;
        }

        if (url === "/api/send-email-otp" && req.method === "POST") {
          try {
            const { otp } = await loadHandlers();
            const body = await readJsonBody(req);
            const data = await otp.sendEmailOtp(body.email, body.purpose);
            sendJson(res, 200, data);
          } catch (error) {
            console.error("[quickpos-email-api] send-otp:", error);
            const code = error?.code || "";
            const status =
              code === "EMAIL_ALREADY_REGISTERED"
                ? 409
                : code === "EMAIL_NOT_REGISTERED"
                  ? 404
                  : code === "ADMIN_NOT_CONFIGURED"
                    ? 503
                    : code === "DISPOSABLE_EMAIL" || code === "INVALID_EMAIL"
                      ? 400
                      : code === "OTP_DELIVERY_FAILED"
                        ? 502
                        : 500;
            sendJson(res, status, {
              error: error?.message || "Failed to send OTP",
              code,
            });
          }
          return;
        }

        if (url === "/api/verify-email-otp" && req.method === "POST") {
          try {
            const { otp } = await loadHandlers();
            const body = await readJsonBody(req);
            const data = await otp.verifyEmailOtp(
              body.email,
              body.purpose,
              body.otp,
            );
            sendJson(res, 200, data);
          } catch (error) {
            const status = String(error?.message || "").includes("Invalid")
              ? 403
              : 500;
            sendJson(res, status, {
              error: error?.message || "Verification failed",
            });
          }
          return;
        }

        if (url === "/api/reset-password-with-otp" && req.method === "POST") {
          try {
            const { otp } = await loadHandlers();
            const body = await readJsonBody(req);
            const data = await otp.resetPasswordWithOtp(
              body.email,
              body.otp,
              body.newPassword,
            );
            sendJson(res, 200, data);
          } catch (error) {
            console.error("[quickpos-email-api] reset-pwd:", error);
            const status = error?.code === "ADMIN_NOT_CONFIGURED" ? 503 : 500;
            sendJson(res, status, {
              error: error?.message || "Reset failed",
              code: error?.code,
            });
          }
          return;
        }

        if (
          url === "/api/send-login-thank-you-email" &&
          req.method === "POST"
        ) {
          try {
            const { notifications } = await loadHandlers();
            const body = await readJsonBody(req);
            await notifications.sendLoginThankYouEmail(body);
            sendJson(res, 200, { ok: true });
          } catch (error) {
            console.error("[quickpos-email-api] login-thank-you:", error);
            sendJson(res, 500, {
              error: error?.message || "Failed to send login email",
            });
          }
          return;
        }

        if (url === "/api/send-expiry-alert-email" && req.method === "POST") {
          try {
            const { notifications } = await loadHandlers();
            const body = await readJsonBody(req);
            await notifications.sendExpiryAlertEmail(body);
            sendJson(res, 200, { ok: true });
          } catch (error) {
            console.error("[quickpos-email-api] expiry-alert:", error);
            sendJson(res, 500, {
              error: error?.message || "Failed to send expiry alert",
            });
          }
          return;
        }

        if (url === "/api/send-low-stock-alert-email" && req.method === "POST") {
          try {
            const { notifications } = await loadHandlers();
            const body = await readJsonBody(req);
            await notifications.sendLowStockAlertEmail(body);
            sendJson(res, 200, { ok: true });
          } catch (error) {
            console.error("[quickpos-email-api] low-stock:", error);
            sendJson(res, 500, {
              error: error?.message || "Failed to send low-stock alert",
            });
          }
          return;
        }

        if (url === "/api/send-welcome-email" && req.method === "POST") {
          try {
            const { notifications } = await loadHandlers();
            const body = await readJsonBody(req);
            await notifications.sendWelcomeEmail({
              to: body.email || body.to,
              ownerName: body.ownerName,
              storeName: body.storeName || body.name,
            });
            sendJson(res, 200, { ok: true, message: "Welcome email sent" });
          } catch (error) {
            console.error("[quickpos-email-api] welcome:", error);
            sendJson(res, 500, {
              error: error?.message || "Failed to send welcome email",
            });
          }
          return;
        }

        next();
      });
    },
  };
}
