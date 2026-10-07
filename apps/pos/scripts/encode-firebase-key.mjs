#!/usr/bin/env node
/**
 * Prints FIREBASE_SERVICE_ACCOUNT_JSON (one line) and BASE64 for Vercel env.
 * Usage: node scripts/encode-firebase-key.mjs [path-to-json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input =
  process.argv[2] ||
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(root, "firebase-service-account.json");

if (!fs.existsSync(input)) {
  console.error(`File not found: ${input}`);
  console.error(
    "Download from Firebase Console → Project settings → Service accounts → Generate new private key",
  );
  process.exit(1);
}

const json = fs.readFileSync(input, "utf8");
const minified = JSON.stringify(JSON.parse(json));
const b64 = Buffer.from(minified, "utf8").toString("base64");

console.log("\n=== Local dev ===");
console.log(`Save key as: ${path.join(root, "firebase-service-account.json")}`);
console.log("Or in .env:");
console.log(`FIREBASE_SERVICE_ACCOUNT_PATH=${input}`);

console.log("\n=== Vercel (pick ONE) ===");
console.log("Variable: FIREBASE_SERVICE_ACCOUNT_JSON");
console.log("Value (paste as single line):");
console.log(minified.slice(0, 80) + "... (full length " + minified.length + " chars)");

console.log("\nVariable: FIREBASE_SERVICE_ACCOUNT_JSON_B64");
console.log(b64);

console.log("\nAlso set on Vercel: SMTP_*, FROM_EMAIL, VITE_FIREBASE_* from .env\n");
