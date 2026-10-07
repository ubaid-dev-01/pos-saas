#!/usr/bin/env node
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });

const { isFirebaseAdminConfigured, firebaseAdminSetupHint, getFirebaseAdmin } =
  await import("../api/_lib/firebaseAdmin.js");

if (!isFirebaseAdminConfigured()) {
  console.error("❌ Firebase Admin NOT configured");
  console.error(firebaseAdminSetupHint());
  process.exit(1);
}

try {
  const { auth, memOtpFallback } = await getFirebaseAdmin();
  if (memOtpFallback || !auth) {
    console.error("❌ Credentials found but Admin Auth failed to initialize");
    process.exit(1);
  }
  console.log("✅ Firebase Admin ready (password reset will work)");
  console.log(`   Project: ${process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "(from key)"}`);
} catch (e) {
  console.error("❌", e.message);
  process.exit(1);
}
