import en from "../src/locales/en.js";
import urBase from "../src/locales/ur.js";
import urExtra from "../src/locales/ur-extra.js";

const ur = { ...urBase, ...urExtra };

const enKeys = Object.keys(en);
const urKeys = new Set(Object.keys(ur));
const missing = enKeys.filter((k) => !urKeys.has(k));

console.log(`en: ${enKeys.length}, ur: ${urKeys.size}, missing in ur: ${missing.length}`);
if (missing.length) {
  console.log(missing.join("\n"));
  process.exit(1);
}
