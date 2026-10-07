import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { auth, db, secondaryAuth } from "../config/firebase";
import {
  ensureSuperAdminFirestoreProfile,
  SUPER_ADMIN_EMAIL,
} from "../config/seed";
import { DEFAULT_CURRENCY, getCurrencyMeta } from "../constants/currencies";
import { checkPermission } from "../utils/permissions";

const defaultPermissions = {
  pos: true,
  products: true,
  inventory: true,
  transactions: true,
  reports: true,
  customers: true,
  settings: true,
};

const defaultMenuConfig = { ...defaultPermissions };

const defaultTaxRates = [
  { id: "tax-1", name: "GST 18%", rate: 18 },
  { id: "tax-2", name: "GST 12%", rate: 12 },
  { id: "tax-3", name: "GST 5%", rate: 5 },
  { id: "tax-4", name: "No Tax", rate: 0 },
];

const defaultCategories = [
  "Electronics",
  "Food",
  "Clothing",
  "Beverages",
  "Stationery",
];

function normalizeUserDoc(data, uid) {
  if (!data) return null;
  const role = data.role === "supperadmin" ? "superadmin" : data.role;
  return { ...data, role, uid: data.uid || uid };
}

function normalizeStoreDoc(data = {}) {
  const code = data.currency || DEFAULT_CURRENCY;
  return {
    ...data,
    currency: code,
    currencyLocale: data.currencyLocale || getCurrencyMeta(code).locale,
  };
}

function mapFirebaseError(err, ctx = {}) {
  const code = err?.code || "";
  const map = {
    "permission-denied":
      "Permission denied: your account cannot perform this action for this store. Check role/store linkage and Firestore rules.",
    "auth/email-already-in-use":
      "This email already has a QuickPOS account. Sign in or use a different email.",
    "auth/invalid-email": "Invalid email format.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/operation-not-allowed":
      "Email/Password sign-in is disabled in Firebase Authentication.",
    "failed-precondition":
      "Operation failed (network or Firestore). Try again.",
    unavailable: "Service temporarily unavailable. Try again.",
    TIMEOUT:
      "Firestore write timed out   check Firebase Console → Firestore → Rules are published.",
  };
  if (map[code]) return map[code];
  if (code === "permission-denied" && ctx?.action === "create-user") {
    return "Permission denied while creating user. Make sure current user is admin/superadmin with same store access.";
  }
  return err?.message || "Something went wrong";
}

function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error(
          `Firestore did not respond in ${ms / 1000}s   check rules / network.`,
        );
        err.code = "TIMEOUT";
        reject(err);
      }, ms);
    }),
  ]);
}

const useAuthStore = create((set, get) => ({
  user: null,
  userDoc: null,
  store: null,
  users: [],
  stores: [],
  /** True after the first Firebase auth state is applied (stops whole-app loading flicker). */
  authHydrated: false,
  loading: false,
  error: null,
  storesUnsub: null,
  usersUnsub: null,
  currentUserUnsub: null,
  currentStoreUnsub: null,

  /** Load Firestore profile + store into Zustand (used by auth listener and immediately after sign-in). */
  loadUserSession: async (user) => {
    if (!user) return;
    const {
      storesUnsub,
      usersUnsub,
      currentUserUnsub: existingCurrentUserUnsub,
      currentStoreUnsub: existingCurrentStoreUnsub,
    } = get();
    if (storesUnsub) storesUnsub();
    if (usersUnsub) usersUnsub();
    if (existingCurrentUserUnsub) existingCurrentUserUnsub();
    if (existingCurrentStoreUnsub) existingCurrentStoreUnsub();
    set({
      storesUnsub: null,
      usersUnsub: null,
      currentUserUnsub: null,
      currentStoreUnsub: null,
      user,
      userDoc: null,
      store: null,
      users: [],
      stores: [],
      loading: true,
      error: null,
    });

    await ensureSuperAdminFirestoreProfile(
      user.uid,
      user.email,
      user.displayName,
    );

    const uref = doc(db, "users", user.uid);
    let usnap;
    try {
      usnap = await withTimeout(getDoc(uref), 10000);
    } catch (readErr) {
      if (readErr?.code !== "permission-denied") throw readErr;
      usnap = { exists: () => false, data: () => undefined };
    }
    const isSuperAdmin =
      SUPER_ADMIN_EMAIL &&
      (user.email || "").toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    if (!usnap.exists()) {
      await withTimeout(
        setDoc(uref, {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          role: isSuperAdmin ? "superadmin" : "admin",
          storeId: null,
          isActive: true,
          permissions: { ...defaultPermissions },
          createdAt: new Date().toISOString(),
        }),
        10000,
      );
      usnap = await withTimeout(getDoc(uref), 10000);
    } else if (isSuperAdmin && usnap.data()?.role !== "superadmin") {
      await withTimeout(
        updateDoc(uref, { role: "superadmin" }),
        10000,
      );
      usnap = await withTimeout(getDoc(uref), 10000);
    }

    const raw = usnap.data();
    const userDoc = normalizeUserDoc(raw, user.uid);

    let store = null;
    if (userDoc.storeId) {
      const sref = doc(db, "stores", userDoc.storeId);
      const ss = await withTimeout(getDoc(sref), 10000);
      if (ss.exists()) store = { id: ss.id, ...normalizeStoreDoc(ss.data()) };
    }

    set({ user, userDoc, store, loading: false, authHydrated: true });

    const bindStoreListener = (storeId) => {
      const { currentStoreUnsub: prevStoreUnsub } = get();
      if (prevStoreUnsub) prevStoreUnsub();

      if (!storeId) {
        set({ store: null, currentStoreUnsub: null });
        return;
      }

      const storeRef = doc(db, "stores", storeId);
      const unsubscribeStore = onSnapshot(
        storeRef,
        (storeSnap) => {
          if (!storeSnap.exists()) {
            set({ store: null });
            return;
          }
          set({
            store: { id: storeSnap.id, ...normalizeStoreDoc(storeSnap.data()) },
          });
        },
        (err) => {
          console.error("[QuickPOS current store listener]", err);
        },
      );

      set({ currentStoreUnsub: unsubscribeStore });
    };

    bindStoreListener(userDoc.storeId || null);

    const unsubscribeCurrentUser = onSnapshot(
      uref,
      async (snap) => {
        if (!snap.exists()) return;
        const nextUserDoc = normalizeUserDoc(snap.data(), user.uid);

        const prevStoreId = get().userDoc?.storeId || null;
        const nextStoreId = nextUserDoc.storeId || null;
        if (prevStoreId !== nextStoreId) {
          bindStoreListener(nextStoreId);
        }

        set({ user, userDoc: nextUserDoc });
      },
      (err) => {
        console.error("[QuickPOS current user listener]", err);
      },
    );
    set({ currentUserUnsub: unsubscribeCurrentUser });

    if (userDoc.role === "superadmin") {
      set({ users: [], stores: [] });
    } else if (userDoc.storeId) {
      get().subscribeStoreTeam(userDoc.storeId);
    } else {
      set({ users: [], usersUnsub: null });
    }
  },

  subscribeStoreTeam: (storeId) => {
    const { usersUnsub } = get();
    if (usersUnsub) usersUnsub();
    if (!storeId) {
      set({ usersUnsub: null, users: [] });
      return;
    }
    const q = query(collection(db, "users"), where("storeId", "==", storeId));
    const uu = onSnapshot(
      q,
      (snap) => {
        set({ users: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
      },
      () => {},
    );
    set({ usersUnsub: uu });
  },

  hasPermission: (section) => {
    const { userDoc, store } = get();
    if (!userDoc || userDoc.isActive === false) return false;
    return checkPermission(userDoc, store, section);
  },

  init: () =>
    new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      setPersistence(auth, browserLocalPersistence).catch(() => {});
      onAuthStateChanged(auth, async (user) => {
        try {
          const { authHydrated } = get();
          if (!authHydrated) {
            set({ loading: true, error: null });
          }

          if (!user) {
            const { storesUnsub, usersUnsub, currentStoreUnsub } = get();
            if (storesUnsub) storesUnsub();
            if (usersUnsub) usersUnsub();
            if (currentStoreUnsub) currentStoreUnsub();
            set({
              user: null,
              userDoc: null,
              store: null,
              users: [],
              stores: [],
              storesUnsub: null,
              usersUnsub: null,
              currentStoreUnsub: null,
              loading: false,
              authHydrated: true,
            });
            done();
            return;
          }

          await get().loadUserSession(user);
        } catch (e) {
          set({
            error: e?.message || "Auth error",
            loading: false,
            authHydrated: true,
          });
        } finally {
          done();
        }
      });
    }),

  login: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await get().loadUserSession(cred.user);
    try {
      const { userDoc, store, user } = get();
      const to = String(user?.email || email || "")
        .trim()
        .toLowerCase();
      if (to.includes("@")) {
        const { sendLoginThankYouEmail } =
          await import("../services/emailService");
        sendLoginThankYouEmail({
          to,
          userName: userDoc?.displayName || user?.displayName || "",
          storeName: store?.name || "QuickPOS",
        }).catch((err) =>
          console.warn("[QuickPOS] login thank-you email:", err?.message),
        );
      }
    } catch {
      /* non-blocking */
    }
  },

  logout: async () => {
    const { storesUnsub, usersUnsub, currentUserUnsub, currentStoreUnsub } =
      get();
    if (storesUnsub) storesUnsub();
    if (usersUnsub) usersUnsub();
    if (currentUserUnsub) currentUserUnsub();
    if (currentStoreUnsub) currentStoreUnsub();
    await signOut(auth);
    try {
      sessionStorage.removeItem("quickpos-login-thankyou-sent");
    } catch {
      /* ignore */
    }
    set({
      user: null,
      userDoc: null,
      store: null,
      users: [],
      stores: [],
      storesUnsub: null,
      usersUnsub: null,
      currentUserUnsub: null,
      currentStoreUnsub: null,
      authHydrated: true,
      loading: false,
    });
  },

  registerAdmin: async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await withTimeout(
      setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        displayName: displayName || "",
        role: "admin",
        storeId: null,
        isActive: true,
        permissions: { ...defaultPermissions },
        createdAt: new Date().toISOString(),
      }),
      10000,
    );

    // Hydrate user/store state immediately so onboarding moves to step 2
    // without waiting for an async auth listener round-trip.
    await get().loadUserSession(cred.user);
  },

  registerStore: async (storeData) => {
    const { user, userDoc: prevDoc } = get();
    if (!user) throw new Error("Not signed in");
    const storeId = `store-${uuidv4()}`;
    const now = new Date().toISOString();
    const sref = doc(db, "stores", storeId);
    const uref = doc(db, "users", user.uid);

    const storeObj = {
      id: storeId,
      name: (storeData.name || "").trim(),
      address: (storeData.address || "").trim(),
      phone: (storeData.phone || "").trim(),
      email: (storeData.email || user.email || "").trim(),
      gstNumber: (storeData.gstNumber || "").trim(),
      logo: null,
      ownerId: user.uid,
      categories: [...defaultCategories],
      taxRates: defaultTaxRates.map((t) => ({
        ...t,
        id: `${t.id}-${uuidv4().slice(0, 8)}`,
      })),
      menuConfig: { ...defaultMenuConfig },
      posConfig: {
        enableCreditSale: true,
        enableHoldCart: true,
        enableSplitPayment: true,
        enableBarcode: true,
        allowNegativeStock: false,
      },
      fbrConfig: {
        enabled: false,
        ntn: "",
        posId: "",
        tier1: false,
      },
      currency: storeData.currency || DEFAULT_CURRENCY,
      currencyLocale: getCurrencyMeta(storeData.currency || DEFAULT_CURRENCY)
        .locale,
      createdAt: now,
      isActive: true,
      plan: "free",
      invoiceCounter: 0,
    };

    try {
      console.log("[QuickPOS] 1/3 Creating store doc…", storeId);
      await withTimeout(setDoc(sref, storeObj), 15000);
      console.log("[QuickPOS] 2/3 Linking user to store…");
      await withTimeout(updateDoc(uref, { storeId }), 10000);
      console.log("[QuickPOS] 3/3 Done   updating local state");

      const nextUserDoc = normalizeUserDoc(
        { ...(prevDoc || {}), storeId, uid: user.uid },
        user.uid,
      );
      set({
        store: { id: storeId, ...normalizeStoreDoc(storeObj) },
        userDoc: nextUserDoc,
      });
      get().subscribeStoreTeam(storeId);
    } catch (e) {
      console.error("[QuickPOS registerStore]", e?.code, e?.message, e);
      throw new Error(mapFirebaseError(e));
    }
  },

  createUser: async ({
    email,
    password,
    displayName,
    photoURL,
    role,
    permissions,
  }) => {
    const { userDoc } = get();
    if (!userDoc?.storeId) throw new Error("No store");
    if (!email || !password) throw new Error("Email and password are required");
    const canManageUsers =
      userDoc.role === "admin" ||
      userDoc.role === "superadmin" ||
      userDoc.permissions?.settings === true;
    if (!canManageUsers) {
      throw new Error("You do not have permission to create users");
    }

    let createdCred = null;
    try {
      createdCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password,
      );
      const newUid = createdCred.user.uid;
      if (displayName || photoURL) {
        await updateProfile(createdCred.user, {
          displayName: displayName || "",
          photoURL: photoURL || null,
        });
      }
      await withTimeout(
        setDoc(doc(db, "users", newUid), {
          uid: newUid,
          email,
          displayName: displayName || "",
          photoURL: photoURL || null,
          role: role === "manager" ? "manager" : "cashier",
          storeId: userDoc.storeId,
          isActive: true,
          permissions: {
            pos: !!permissions?.pos,
            products: !!permissions?.products,
            inventory: !!permissions?.inventory,
            transactions: !!permissions?.transactions,
            reports: !!permissions?.reports,
            customers: !!permissions?.customers,
            settings: !!permissions?.settings,
          },
          createdAt: new Date().toISOString(),
        }),
        10000,
      );
    } catch (e) {
      throw new Error(mapFirebaseError(e, { action: "create-user" }));
    } finally {
      if (createdCred?.user) {
        try {
          await signOut(secondaryAuth);
        } catch {
          // Non-blocking cleanup.
        }
      }
    }
  },

  updateUser: async (targetUid, data) => {
    const { userDoc } = get();
    if (userDoc?.role !== "superadmin") {
      const canManage =
        userDoc?.role === "admin" || userDoc?.permissions?.settings === true;
      if (!canManage)
        throw new Error("You do not have permission to update users");
    }
    await updateDoc(doc(db, "users", targetUid), { ...data });
  },

  /** Super admin: create real Firebase Auth user + Firestore profile */
  createPlatformUser: async ({
    email,
    password,
    displayName,
    role,
    storeId,
    permissions,
  }) => {
    const { userDoc } = get();
    if (userDoc?.role !== "superadmin") {
      throw new Error("Only platform super admin can create users");
    }
    if (!email?.trim() || !password || password.length < 6) {
      throw new Error("Email and password (min 6 characters) are required");
    }
    const normalizedRole = ["admin", "manager", "cashier"].includes(role)
      ? role
      : "cashier";
    const perms = permissions || { ...defaultPermissions };

    let createdCred = null;
    try {
      createdCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim(),
        password,
      );
      const newUid = createdCred.user.uid;
      if (displayName) {
        await updateProfile(createdCred.user, {
          displayName: displayName.trim(),
        });
      }
      await setDoc(doc(db, "users", newUid), {
        uid: newUid,
        email: email.trim().toLowerCase(),
        displayName: displayName?.trim() || "",
        role: normalizedRole,
        storeId: storeId || null,
        isActive: true,
        permissions: {
          pos: perms.pos !== false,
          products: perms.products !== false,
          inventory: perms.inventory !== false,
          transactions: perms.transactions !== false,
          reports: perms.reports !== false,
          customers: perms.customers !== false,
          settings: perms.settings !== false,
        },
        createdAt: new Date().toISOString(),
      });
      return { uid: newUid };
    } catch (e) {
      throw new Error(mapFirebaseError(e, { action: "create-user" }));
    } finally {
      if (createdCred?.user) {
        try {
          await signOut(secondaryAuth);
        } catch {
          /* ignore */
        }
      }
    }
  },

  deletePlatformUser: async (targetUid) => {
    const { userDoc, user } = get();
    if (userDoc?.role !== "superadmin") {
      throw new Error("Only platform super admin can delete users");
    }
    if (targetUid === user?.uid) {
      throw new Error("You cannot delete your own account");
    }
    const snap = await getDoc(doc(db, "users", targetUid));
    if (snap.exists() && snap.data()?.role === "superadmin") {
      throw new Error("Cannot delete another super admin account");
    }
    await deleteDoc(doc(db, "users", targetUid));
  },

  updateStorePlatform: async (storeId, patch) => {
    const { userDoc } = get();
    if (userDoc?.role !== "superadmin") {
      throw new Error("Only platform super admin can update stores");
    }
    await updateDoc(doc(db, "stores", storeId), { ...patch });
  },

  deleteStorePlatform: async (storeId) => {
    const { userDoc } = get();
    if (userDoc?.role !== "superadmin") {
      throw new Error("Only platform super admin can delete stores");
    }
    await deleteDoc(doc(db, "stores", storeId));
  },

  updateUserProfile: async (patch) => {
    const { user } = get();
    if (!user) throw new Error("Not signed in");

    try {
      // Update Firebase Auth profile
      if (patch.displayName || patch.photoURL) {
        const profileUpdate = {};
        if (patch.displayName) profileUpdate.displayName = patch.displayName;
        if (patch.photoURL) profileUpdate.photoURL = patch.photoURL;
        await updateProfile(user, profileUpdate);
      }

      // Update Firestore user document
      const updateData = {};
      if (patch.displayName) updateData.displayName = patch.displayName;
      if (patch.photoURL !== undefined) updateData.photoURL = patch.photoURL;

      if (Object.keys(updateData).length > 0) {
        await updateDoc(doc(db, "users", user.uid), updateData);
      }

      // Reload to get updated user
      const newUserDoc = await getDoc(doc(db, "users", user.uid));
      if (newUserDoc.exists()) {
        set({ userDoc: newUserDoc.data() });
      }
    } catch (e) {
      throw new Error(mapFirebaseError(e, { action: "update-profile" }));
    }
  },

  updateStore: async (patch) => {
    const { store, userDoc } = get();
    if (!store?.id && !userDoc?.storeId) return;
    const sid = store?.id || userDoc.storeId;
    try {
      await updateDoc(doc(db, "stores", sid), { ...patch });
      const snap = await getDoc(doc(db, "stores", sid));
      if (snap.exists()) {
        set({ store: { id: snap.id, ...normalizeStoreDoc(snap.data()) } });
      }
    } catch (e) {
      throw new Error(mapFirebaseError(e));
    }
  },

  updateMenuConfig: async (storeId, menuConfig) => {
    await updateDoc(doc(db, "stores", storeId), { menuConfig });
    const { store } = get();
    if (store?.id === storeId) {
      set({ store: { ...store, menuConfig: { ...menuConfig } } });
    }
  },

  setStoreActive: async (storeId, isActive) => {
    await updateDoc(doc(db, "stores", storeId), { isActive });
  },

  refreshStore: async () => {
    const { userDoc } = get();
    if (!userDoc?.storeId) return;
    const snap = await getDoc(doc(db, "stores", userDoc.storeId));
    if (snap.exists()) {
      set({ store: { id: snap.id, ...normalizeStoreDoc(snap.data()) } });
    }
  },

  fetchAllStoresOnce: async () => {
    const snap = await getDocs(collection(db, "stores"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  fetchAllUsersOnce: async () => {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
}));

export default useAuthStore;
