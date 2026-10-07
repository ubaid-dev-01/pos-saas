import crypto from "node:crypto";
import { sendMail } from "./mailer.js";
import { assertDeliverableEmail } from "./emailValidation.js";
import { getFirebaseAdmin } from "./firebaseAdmin.js";
import { buildOtpEmailHtml } from "./notificationEmails.js";
import { sendPasswordChangedEmail } from "./notificationService.js";

const OTP_TTL_MINUTES = 10;
const OTP_PURPOSES = new Set(["register", "reset-password"]);

/** In-memory OTP (local dev). Production (Vercel) uses Firestore. */
const memStore = new Map();

function preferMemoryOtpStore() {
  if (process.env.QUICKPOS_OTP_USE_MEMORY === "true") return true;
  if (process.env.QUICKPOS_OTP_USE_MEMORY === "false") return false;
  if (process.env.VERCEL === "1") return false;
  return process.env.NODE_ENV !== "production";
}

function isFirestorePermissionError(err) {
  const code = err?.code;
  const msg = String(err?.message || "");
  return (
    code === 7 ||
    code === "permission-denied" ||
    /insufficient permissions/i.test(msg)
  );
}

async function shouldUseOtpMemory() {
  if (preferMemoryOtpStore()) return true;
  const { db, memOtpFallback } = await getFirebaseAdmin();
  return memOtpFallback || !db;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function hash(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function otpDocId(email, purpose) {
  return `${purpose}_${hash(email)}`;
}

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function validatePurpose(purpose) {
  if (!OTP_PURPOSES.has(purpose)) {
    throw new Error("Invalid OTP purpose.");
  }
}

async function isEmailRegistered(normalized) {
  const { auth, memOtpFallback } = await getFirebaseAdmin();
  if (memOtpFallback || !auth) return null;

  try {
    await auth.getUserByEmail(normalized);
    return true;
  } catch (err) {
    if (err?.code === "auth/user-not-found") return false;
    throw err;
  }
}

async function assertEmailEligibleForOtp(normalized, purpose) {
  const registered = await isEmailRegistered(normalized);

  if (registered === null) {
    if (purpose === "reset-password") {
      const err = new Error(
        "Password reset is not available until Firebase Admin is configured. See SETUP_PASSWORD_RESET.md.",
      );
      err.code = "ADMIN_NOT_CONFIGURED";
      throw err;
    }
    return;
  }

  if (purpose === "register" && registered) {
    const err = new Error(
      "This email is already registered. Sign in or use a different email.",
    );
    err.code = "EMAIL_ALREADY_REGISTERED";
    throw err;
  }

  if (purpose === "reset-password" && !registered) {
    const err = new Error(
      "No QuickPOS account found for this email. Use the same email you used to sign up.",
    );
    err.code = "EMAIL_NOT_REGISTERED";
    throw err;
  }
}

async function readOtpRecord(email, purpose) {
  const id = otpDocId(email, purpose);

  if (await shouldUseOtpMemory()) {
    return memStore.get(id) || null;
  }

  const { db } = await getFirebaseAdmin();
  try {
    const snap = await db.collection("emailOtps").doc(id).get();
    if (!snap.exists) return memStore.get(id) || null;
    const data = snap.data();
    return {
      ...data,
      expiresAtMs: data.expiresAt?.toMillis?.() || data.expiresAtMs || 0,
      lastSentAtMs: data.lastSentAt?.toMillis?.() || data.lastSentAtMs || 0,
    };
  } catch (err) {
    if (isFirestorePermissionError(err)) return memStore.get(id) || null;
    throw err;
  }
}

async function writeOtpRecord(email, purpose, payload) {
  const id = otpDocId(email, purpose);
  const { db, memOtpFallback, Timestamp, FieldValue } =
    await getFirebaseAdmin();
  const now = Date.now();
  const expiresAtMs = now + OTP_TTL_MINUTES * 60 * 1000;

  const record = {
    email,
    purpose,
    codeHash: payload.codeHash,
    attempts: payload.attempts ?? 0,
    verified: payload.verified ?? false,
    expiresAtMs,
    lastSentAtMs: now,
  };

  if (await shouldUseOtpMemory()) {
    memStore.set(id, record);
    return record;
  }

  try {
    await db
      .collection("emailOtps")
      .doc(id)
      .set(
        {
          email,
          purpose,
          codeHash: record.codeHash,
          attempts: record.attempts,
          verified: record.verified,
          expiresAt: Timestamp.fromMillis(expiresAtMs),
          lastSentAt: Timestamp.fromMillis(now),
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  } catch (err) {
    if (isFirestorePermissionError(err)) {
      memStore.set(id, record);
      return record;
    }
    throw err;
  }

  return record;
}

async function updateOtpRecord(email, purpose, patch) {
  const id = otpDocId(email, purpose);
  const { db, memOtpFallback, FieldValue } = await getFirebaseAdmin();

  if (await shouldUseOtpMemory()) {
    const cur = memStore.get(id);
    if (!cur) return;
    memStore.set(id, { ...cur, ...patch });
    return;
  }

  const firestorePatch = { ...patch, updatedAt: FieldValue.serverTimestamp() };
  delete firestorePatch.expiresAtMs;
  delete firestorePatch.lastSentAtMs;
  try {
    await db.collection("emailOtps").doc(id).update(firestorePatch);
  } catch (err) {
    if (isFirestorePermissionError(err)) {
      const cur = memStore.get(id);
      if (cur) memStore.set(id, { ...cur, ...patch });
      return;
    }
    throw err;
  }
}

async function deleteOtpRecord(email, purpose) {
  const id = otpDocId(email, purpose);
  const { db, memOtpFallback } = await getFirebaseAdmin();
  if (await shouldUseOtpMemory()) {
    memStore.delete(id);
    return;
  }
  try {
    await db.collection("emailOtps").doc(id).delete();
  } catch (err) {
    if (isFirestorePermissionError(err)) {
      memStore.delete(id);
      return;
    }
    throw err;
  }
}

export async function sendEmailOtp(email, purpose) {
  validatePurpose(purpose);
  const normalized = assertDeliverableEmail(email);

  await assertEmailEligibleForOtp(normalized, purpose);

  const existing = await readOtpRecord(normalized, purpose);
  const now = Date.now();
  if (existing && now - (existing.lastSentAtMs || 0) < 60 * 1000) {
    throw new Error("Please wait a minute before requesting another OTP.");
  }

  const otp = makeOtp();
  await writeOtpRecord(normalized, purpose, {
    codeHash: hash(otp),
    attempts: 0,
    verified: false,
  });

  const subject =
    purpose === "register"
      ? "QuickPOS · Verify your email"
      : "QuickPOS · Password reset code";

  try {
    await sendMail({
      to: normalized,
      subject,
      text: `Your QuickPOS code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`,
      html: buildOtpEmailHtml({ otp, purpose, minutes: OTP_TTL_MINUTES }),
    });
  } catch (err) {
    await deleteOtpRecord(normalized, purpose);
    const fail = new Error(
      "Could not deliver OTP email. Check that the address is real and try again.",
    );
    fail.code = "OTP_DELIVERY_FAILED";
    fail.cause = err;
    throw fail;
  }

  return { ok: true };
}

export async function verifyEmailOtp(email, purpose, otp) {
  validatePurpose(purpose);
  const normalized = normalizeEmail(email);
  const code = String(otp || "").trim();

  if (!normalized || !code) {
    throw new Error("Email and OTP are required.");
  }

  const record = await readOtpRecord(normalized, purpose);
  if (!record) {
    throw new Error("OTP not found. Please request a new one.");
  }

  if ((record.expiresAtMs || 0) < Date.now()) {
    throw new Error("OTP expired. Please request a new one.");
  }

  const attempts = Number(record.attempts) || 0;
  if (attempts >= 5) {
    throw new Error("Too many attempts. Request a new OTP.");
  }

  if (record.codeHash !== hash(code)) {
    await updateOtpRecord(normalized, purpose, { attempts: attempts + 1 });
    throw new Error("Invalid OTP.");
  }

  await updateOtpRecord(normalized, purpose, { verified: true });
  // One-time use for registration — consume after successful verify
  if (purpose === "register") {
    await deleteOtpRecord(normalized, purpose);
  }
  return { ok: true, verified: true };
}

export async function resetPasswordWithOtp(email, otp, newPassword) {
  const normalized = normalizeEmail(email);
  const code = String(otp || "").trim();
  const password = String(newPassword || "");

  if (!normalized || !code || password.length < 6) {
    throw new Error("Email, OTP and password (min 6 chars) are required.");
  }

  await verifyEmailOtp(normalized, "reset-password", code);

  const { auth, memOtpFallback } = await getFirebaseAdmin();
  if (memOtpFallback || !auth) {
    const { firebaseAdminSetupHint } = await import("./firebaseAdmin.js");
    const err = new Error(firebaseAdminSetupHint());
    err.code = "ADMIN_NOT_CONFIGURED";
    throw err;
  }

  let user;
  try {
    user = await auth.getUserByEmail(normalized);
  } catch (err) {
    if (err?.code === "auth/user-not-found") {
      throw new Error(
        "No QuickPOS account with this email. Sign up first or use the email you registered with.",
      );
    }
    throw err;
  }

  try {
    await auth.updateUser(user.uid, { password });
  } catch (err) {
    if (
      err?.code === "auth/insufficient-permission" ||
      /insufficient permissions/i.test(String(err?.message || ""))
    ) {
      throw new Error(
        "Service account cannot update passwords. In Google Cloud Console, give your Firebase Admin service account the role Firebase Authentication Admin, then try again.",
      );
    }
    throw err;
  }

  await deleteOtpRecord(normalized, "reset-password");
  await sendPasswordChangedEmail({ to: normalized });

  return { ok: true };
}
