import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  LANGUAGES,
  getLang,
  setLang as setGlobalLang,
  subscribeLang,
  t as translate,
} from "../utils/i18n";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLangState] = useState(() => getLang());

  useEffect(() => subscribeLang(setLangState), []);

  const value = useMemo(() => {
    const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
    return {
      lang,
      dir: meta.dir,
      setLang: setGlobalLang,
      t: (key, vars) => translate(key, vars),
    };
  }, [lang]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      lang: getLang(),
      dir: "ltr",
      setLang: setGlobalLang,
      t: translate,
    };
  }
  return ctx;
}
