import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import {
  enableIndexedDbPersistence,
  getFirestore,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "REPLACE_ME",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "REPLACE_ME",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "REPLACE_ME",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "REPLACE_ME",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://fir-app-79c12-default-rtdb.firebaseio.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "REPLACE_ME",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "REPLACE_ME",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** Secondary app so createUserWithEmailAndPassword does not sign out the admin session */
const secondaryAppName = "QuickPOS-Secondary";
export const secondaryApp = getApps().some((a) => a.name === secondaryAppName)
  ? getApp(secondaryAppName)
  : initializeApp(firebaseConfig, secondaryAppName);

export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const functions = getFunctions(app);

if (typeof window !== "undefined" && !globalThis.__quickposPersistenceEnabled) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
      console.warn("[QuickPOS] Firestore offline persistence:", err.message);
    }
  });
  globalThis.__quickposPersistenceEnabled = true;
}

const shouldUseFunctionsEmulator =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
  import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true";

if (shouldUseFunctionsEmulator && !globalThis.__quickposFunctionsEmulatorConnected) {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  globalThis.__quickposFunctionsEmulatorConnected = true;
}

export const storage = getStorage(app);
export default app;
