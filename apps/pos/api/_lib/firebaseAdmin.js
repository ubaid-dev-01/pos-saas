import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let adminApp = null;
let adminDb = null;
let adminAuth = null;
let memOtpFallback = false;
let adminTimestamp = null;
let adminFieldValue = null;

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

function parseServiceAccountJson(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    try {
      parsed = JSON.parse(text.replace(/^['"]|['"]$/g, ""));
    } catch {
      throw new Error(
        "Service account JSON is invalid. Use one line minified JSON or firebase-service-account.json.",
      );
    }
  }

  if (parsed?.private_key && typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

function loadServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64;
  if (b64) {
    try {
      return parseServiceAccountJson(
        Buffer.from(String(b64).trim(), "base64").toString("utf8"),
      );
    } catch (e) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_JSON_B64 decode failed: ${e.message}`,
      );
    }
  }

  const jsonInline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonInline) {
    return parseServiceAccountJson(jsonInline);
  }

  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.join(rootDir, "firebase-service-account.json"),
    path.join(process.cwd(), "firebase-service-account.json"),
  ].filter(Boolean);

  for (const credPath of candidates) {
    const resolved = path.isAbsolute(credPath)
      ? credPath
      : path.resolve(rootDir, credPath);
    if (fs.existsSync(resolved)) {
      return parseServiceAccountJson(fs.readFileSync(resolved, "utf8"));
    }
  }

  return null;
}

export function isFirebaseAdminConfigured() {
  if (adminAuth && !memOtpFallback) return true;
  try {
    return Boolean(loadServiceAccount());
  } catch {
    return false;
  }
}

/** Clear cached Admin SDK (e.g. dev server started before key file existed). */
export function resetFirebaseAdminCache() {
  adminApp = null;
  adminDb = null;
  adminAuth = null;
  memOtpFallback = false;
}

export function firebaseAdminSetupHint() {
  return [
    "Password reset needs Firebase Admin credentials.",
    "Local: download service account JSON → save as firebase-service-account.json in project root, then restart npm run dev.",
    "Or set FIREBASE_SERVICE_ACCOUNT_PATH in .env to that file.",
    "Vercel: Project → Settings → Environment Variables → FIREBASE_SERVICE_ACCOUNT_JSON = entire JSON (one line), or FIREBASE_SERVICE_ACCOUNT_JSON_B64 (run: npm run firebase:encode-key).",
  ].join(" ");
}

function adminPayload() {
  return {
    app: adminApp,
    db: adminDb,
    auth: adminAuth,
    memOtpFallback,
    Timestamp: adminTimestamp,
    FieldValue: adminFieldValue,
  };
}

export async function getFirebaseAdmin() {
  if (adminApp && !memOtpFallback) {
    return adminPayload();
  }

  if (memOtpFallback && loadServiceAccount()) {
    resetFirebaseAdminCache();
  }

  const admin = (await import("firebase-admin")).default;
  const { getFirestore, Timestamp, FieldValue } =
    await import("firebase-admin/firestore");
  adminTimestamp = Timestamp;
  adminFieldValue = FieldValue;
  const { getAuth } = await import("firebase-admin/auth");

  const projectId =
    process.env.VITE_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "fir-app-79c12";

  const serviceAccount = loadServiceAccount();

  if (!serviceAccount) {
    try {
      adminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
      });
      adminDb = getFirestore(adminApp);
      adminAuth = getAuth(adminApp);
      memOtpFallback = false;
      console.log(
        "[QuickPOS] Firebase Admin via application default credentials",
      );
    } catch {
      console.warn(`[QuickPOS] ${firebaseAdminSetupHint()}`);
      adminApp = null;
      adminDb = null;
      adminAuth = null;
      memOtpFallback = true;
    }
  } else {
    try {
      try {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || projectId,
        });
      } catch (error) {
        if (error?.code === "app/duplicate-app") {
          adminApp = admin.app();
        } else {
          throw error;
        }
      }
      adminDb = getFirestore(adminApp);
      adminAuth = getAuth(adminApp);
      memOtpFallback = false;
      console.log("[QuickPOS] Firebase Admin ready");
    } catch (error) {
      console.warn(
        "[QuickPOS] Firebase Admin init failed   using in-memory OTP store.",
        error?.message,
      );
      adminApp = null;
      adminDb = null;
      adminAuth = null;
      memOtpFallback = true;
    }
  }

  return adminPayload();
}
