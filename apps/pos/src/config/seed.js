import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Super admin email — used only to identify the super admin at login time.
 * No password is stored in frontend code. Create the super admin user
 * manually in Firebase Console → Authentication → Add user.
 */
export const SUPER_ADMIN_EMAIL =
  import.meta.env.VITE_SUPER_ADMIN_EMAIL || "";

const defaultPermissions = {
  pos: true,
  products: true,
  inventory: true,
  transactions: true,
  reports: true,
  customers: true,
  settings: true,
};

export async function ensureSuperAdminFirestoreProfile(
  uid,
  email,
  displayName,
) {
  if (email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) return;
  const ref = doc(db, "users", uid);
  let snap;
  try {
    snap = await getDoc(ref);
  } catch (e) {
    if (e?.code !== "permission-denied") throw e;
    snap = { exists: () => false };
  }
  if (snap.exists()) {
    // Fix role if it was incorrectly set to something other than superadmin
    const data = snap.data();
    if (data.role !== "superadmin") {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(ref, { role: "superadmin" });
    }
    return;
  }
  await setDoc(ref, {
    uid,
    email,
    displayName: displayName || "Platform Super Admin",
    role: "superadmin",
    storeId: null,
    isActive: true,
    permissions: defaultPermissions,
    createdAt: new Date().toISOString(),
  });
}
