/**
 * Minimal i18n utility for QuickPOS.
 *
 * Pakistan-first: ships with English (default) and Urdu (`ur-PK`).
 * Strings are flat key-value maps so any component can call `t("pos.charge")
 * without needing a heavy framework like react-intl.
 *
 * The selected language is persisted in localStorage under `quickpos-lang`.
 */

import en from "../locales/en.js";
import urBase from "../locales/ur.js";
import urExtra from "../locales/ur-extra.js";

const ur = { ...urBase, ...urExtra };

const STORAGE_KEY = "quickpos-lang";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN", dir: "ltr" },
  { code: "ur", label: "اردو", short: "UR", dir: "rtl" },
];

const dictionaries = { en, ur };

let currentLang =
  (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY)) ||
  "en";

const listeners = new Set();

function notify() {
  for (const fn of listeners) fn(currentLang);
}

export function getLang() {
  return currentLang;
}

export function setLang(code) {
  const next = LANGUAGES.find((l) => l.code === code) ? code : "en";
  if (next === currentLang) return;
  currentLang = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
    if (typeof document !== "undefined") {
      const meta = LANGUAGES.find((l) => l.code === next);
      document.documentElement.lang = next === "ur" ? "ur-PK" : "en";
      document.documentElement.dir = meta?.dir || "ltr";
    }
  } catch {
    /* ignore storage errors */
  }
  notify();
}

export function subscribeLang(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key, vars) {
  const dict = dictionaries[currentLang] || dictionaries.en;
  let str = dict[key] ?? dictionaries.en[key] ?? key;
  if (vars && typeof str === "string") {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v ?? ""));
    }
  }
  return str;
}

if (typeof document !== "undefined") {
  const meta = LANGUAGES.find((l) => l.code === currentLang);
  document.documentElement.lang = currentLang === "ur" ? "ur-PK" : "en";
  document.documentElement.dir = meta?.dir || "ltr";
}
