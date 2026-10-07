import { Languages, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import { getNavItems } from "../../locales/marketingContent";
import { LANGUAGES } from "../../utils/i18n";

export default function MarketingNavbar() {
  const { t, lang, setLang } = useTranslation();
  const navItems = getNavItems(t);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 ${
        scrolled ? "bg-white/95 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/files/logo-full.svg"
            alt={t("header.default")}
            className="h-9 w-auto"
            width={144}
            height={36}
            loading="eager"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-primary underline decoration-2 decoration-secondary underline-offset-4"
                  : "text-text-primary hover:text-primary"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold hover:bg-background"
              title={t("header.language")}
              aria-label={t("header.language")}
              aria-expanded={langOpen}
            >
              <Languages className="h-3.5 w-3.5" />
              {LANGUAGES.find((l) => l.code === lang)?.short || "EN"}
            </button>
            {langOpen && (
              <>
                <button
                  type="button"
                  aria-label={t("common.close")}
                  className="fixed inset-0 z-40"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-lg border border-border bg-white shadow-lg">
                  {LANGUAGES.map((l) => (
                    <button
                      type="button"
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-xs font-medium hover:bg-background ${
                        l.code === lang ? "text-primary" : "text-text-primary"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link
            to="/login"
            className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white"
          >
            {t("nav.login")}
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-primary text-white hover:bg-[#0A2625]"
          >
            {t("nav.startTrial")}
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg border border-border"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={t("nav.menu")}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 pb-4">
          <div className="flex flex-col gap-3 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-text-primary"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mb-3 flex gap-2">
            {LANGUAGES.map((l) => (
              <button
                type="button"
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setMobileOpen(false);
                }}
                className={`flex-1 rounded-md border px-3 py-2 text-xs font-semibold ${
                  l.code === lang
                    ? "border-primary bg-primary text-white"
                    : "border-border text-text-primary"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/login"
              className="text-center px-4 py-2 rounded-md border border-primary text-primary"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/register"
              className="text-center px-4 py-2 rounded-md bg-primary text-white"
            >
              {t("nav.freeTrial")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
