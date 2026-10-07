import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fromAddress, getTransporter, sendMail } from "./api/_lib/mailer.js";
import { sendReceiptPdfEmail } from "./api/_lib/receiptEmail.js";
import {
  sendExpiryAlertEmail,
  sendLoginThankYouEmail,
} from "./api/_lib/notificationService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

function transporterVerify() {
  try {
    getTransporter().verify((error) => {
      if (error) console.error("SMTP connection error:", error.message);
      else console.log("SMTP ready for QuickPOS emails");
    });
  } catch (e) {
    console.error("SMTP config error:", e.message);
  }
}

transporterVerify();

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "QuickPOS email server running" });
});

app.post("/send-receipt-email", async (req, res) => {
  try {
    const { to, receipt } = req.body || {};
    if (!to || !String(to).includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }
    await sendReceiptPdfEmail({
      to: String(to).trim().toLowerCase(),
      receipt: receipt || {},
    });
    res.json({ ok: true, message: "Receipt sent successfully" });
  } catch (error) {
    console.error("Send receipt error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/send-login-thank-you-email", async (req, res) => {
  try {
    await sendLoginThankYouEmail(req.body || {});
    res.json({ ok: true });
  } catch (error) {
    console.error("Login thank-you error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/send-expiry-alert-email", async (req, res) => {
  try {
    await sendExpiryAlertEmail(req.body || {});
    res.json({ ok: true });
  } catch (error) {
    console.error("Expiry alert error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/send-welcome-email", async (req, res) => {
  try {
    const email = String(req.body?.email || req.body?.to || "")
      .trim()
      .toLowerCase();
    const storeName = String(
      req.body?.storeName || req.body?.name || "QuickPOS",
    ).trim();
    const ownerName = String(req.body?.ownerName || "").trim();

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    await sendMail({
      to: email,
      subject: `Welcome to QuickPOS   ${storeName}`,
      text: `Hi ${ownerName || storeName},\n\nYour store ${storeName} is ready on QuickPOS.\n\nQuickPOS Team`,
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <div style="background:linear-gradient(135deg,#0f4b46,#14b8a6);color:#fff;border-radius:16px;padding:24px;">
            <h1 style="margin:0;font-size:24px;">Welcome to QuickPOS</h1>
            <p style="margin:12px 0 0;opacity:0.9;">${storeName} is ready to sell.</p>
          </div>
          <p style="color:#475569;line-height:1.6;margin-top:20px;">Hi ${ownerName || "there"},</p>
          <p style="color:#475569;line-height:1.6;">Thanks for registering. You can now manage products, checkout, inventory, and reports from one dashboard.</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">QuickPOS Team</p>
        </div>`,
    });

    res.json({ ok: true, message: "Welcome email sent" });
  } catch (error) {
    console.error("Send welcome error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = Number(process.env.EMAIL_SERVER_PORT || process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`Email server http://localhost:${PORT}`);
  console.log(`From: ${fromAddress()}`);
  console.log("POST /send-receipt-email");
  console.log("POST /send-welcome-email");
  console.log("POST /send-login-thank-you-email");
  console.log("POST /send-expiry-alert-email");
});
