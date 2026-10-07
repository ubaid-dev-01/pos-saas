/**
 * One-time script to create the super admin user in Firebase Auth.
 * Run from project root:
 *
 *   node scripts/create-superadmin.js
 *
 * You will be prompted for the password — it is NEVER stored in code.
 * After running, log in at your app with the VITE_SUPER_ADMIN_EMAIL + that password.
 */

import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { createInterface } from "readline";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const SUPER_ADMIN_EMAIL = process.env.VITE_SUPER_ADMIN_EMAIL || "";

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log(`\nCreating super admin: ${SUPER_ADMIN_EMAIL}\n`);

  const password = await ask("Enter password (min 6 chars): ");
  if (!password || password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      SUPER_ADMIN_EMAIL,
      password,
    );
    await updateProfile(cred.user, { displayName: "Platform Super Admin" });
    console.log(`\n✓ Super admin created successfully!`);
    console.log(`  UID:   ${cred.user.uid}`);
    console.log(`  Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(
      `\nThe Firestore profile will be created automatically on first login.`,
    );
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      console.log(`\n✓ Super admin already exists. You can log in directly.`);
    } else {
      console.error(`\n✗ Error: ${e.message}`);
      process.exit(1);
    }
  }

  rl.close();
  process.exit(0);
}

main();
