import { ChevronDown, Languages, Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { MEGA_NAV } from "../../constants/siteContent";
import { useTranslation } from "../../context/LocaleContext";
import { LANGUAGES } from "../../utils/i18n";

export default function SiteNavbar() {
  const { t, lang, setLang } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navId = useId();
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setOpenMenu(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 160);
  };
  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };
  const open = (menu) => {
    cancelClose();
    setOpenMenu(menu);
    setLangOpen(false);
  };

  const triggerClass = (menu) =>
    `inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold ${
      openMenu === menu ? "text-mkt-indigo" : "text-mkt-700 hover:text-mkt-navy"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white ${
        scrolled ? "border-mkt-100" : "border-transparent"
      }`}
    >
      <div className="mkt-container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link
          to="/"
          className="relative z-50 flex items-center gap-2"
          onClick={() => {
            setMobileOpen(false);
            setOpenMenu(null);
          }}
        >
          <img
            src="/files/logo-full.svg"
            alt="QuickPOS"
            className="h-8 w-auto lg:h-9"
            width={144}
            height={36}
            loading="eager"
          />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            className={triggerClass("platform")}
            aria-expanded={openMenu === "platform"}
            aria-controls={`${navId}-platform`}
            onMouseEnter={() => open("platform")}
            onFocus={() => open("platform")}
            onClick={() =>
              setOpenMenu((m) => (m === "platform" ? null : "platform"))
            }
          >
            {MEGA_NAV.platform.label}
            <ChevronDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            className={triggerClass("industries")}
            aria-expanded={openMenu === "industries"}
            aria-controls={`${navId}-industries`}
            onMouseEnter={() => open("industries")}
            onFocus={() => open("industries")}
            onClick={() =>
              setOpenMenu((m) => (m === "industries" ? null : "industries"))
            }
          >
            {MEGA_NAV.industries.label}
            <ChevronDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            className={triggerClass("solutions")}
            aria-expanded={openMenu === "solutions"}
            aria-controls={`${navId}-solutions`}
            onMouseEnter={() => open("solutions")}
            onFocus={() => open("solutions")}
            onClick={() =>
              setOpenMenu((m) => (m === "solutions" ? null : "solutions"))
            }
          >
            {MEGA_NAV.solutions.label}
            <ChevronDown className="h-4 w-4" />
          </button>

          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-semibold ${
                isActive
                  ? "text-mkt-indigo"
                  : "text-mkt-700 hover:text-mkt-navy"
              }`
            }
            onMouseEnter={() => setOpenMenu(null)}
          >
            Pricing
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-semibold ${
                isActive
                  ? "text-mkt-indigo"
                  : "text-mkt-700 hover:text-mkt-navy"
              }`
            }
            onMouseEnter={() => setOpenMenu(null)}
          >
            About
          </NavLink>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangOpen((v) => !v);
                setOpenMenu(null);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-mkt-700 hover:text-mkt-navy"
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
                  className="fixed inset-0 z-40"
                  aria-label="Close"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] border border-mkt-100 bg-white py-1">
                  {LANGUAGES.map((l) => (
                    <button
                      type="button"
                      key={l.code}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-mkt-50"
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
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
            className="px-3 py-2 text-sm font-semibold text-mkt-700 hover:text-mkt-navy"
          >
            Sign in
          </Link>
          <Link to="/contact" className="mkt-btn mkt-btn-primary">
            Book a demo
          </Link>
        </div>

        <button
          type="button"
          className="relative z-50 inline-flex h-10 w-10 items-center justify-center text-mkt-navy lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Full-width mega panels — anchored to header, not the tiny trigger */}
      {openMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 cursor-default bg-mkt-navy/20 lg:top-[72px]"
            aria-label="Close menu"
            onClick={() => setOpenMenu(null)}
          />
          <div
            className="absolute left-0 right-0 top-full z-50 border-b border-mkt-100 bg-white shadow-none"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="mkt-container py-10">
              {openMenu === "platform" && (
                <div
                  id={`${navId}-platform`}
                  className="grid grid-cols-1 gap-10 md:grid-cols-3"
                >
                  {MEGA_NAV.platform.columns.map((col) => (
                    <div key={col.title} className="min-w-0">
                      <p className="mkt-eyebrow mb-5">{col.title}</p>
                      <ul className="space-y-5">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              to={link.to}
                              className="group block"
                              onClick={() => setOpenMenu(null)}
                            >
                              <span className="font-semibold text-mkt-navy group-hover:text-mkt-indigo">
                                {link.label}
                              </span>
                              <span className="mt-1 block text-sm leading-relaxed text-mkt-500">
                                {link.desc}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {openMenu === "industries" && (
                <div
                  id={`${navId}-industries`}
                  className="grid grid-cols-2 gap-x-12 gap-y-4 md:grid-cols-4"
                >
                  {MEGA_NAV.industries.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="py-1 text-sm font-semibold text-mkt-navy hover:text-mkt-indigo"
                      onClick={() => setOpenMenu(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {openMenu === "solutions" && (
                <div
                  id={`${navId}-solutions`}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {MEGA_NAV.solutions.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="border-l-2 border-mkt-100 py-1 pl-4 text-sm font-semibold text-mkt-navy hover:border-mkt-indigo hover:text-mkt-indigo"
                      onClick={() => setOpenMenu(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 overflow-y-auto bg-white lg:hidden">
          <div className="mkt-container space-y-6 py-6 pb-24">
            <div>
              <p className="mkt-eyebrow mb-3">Platform</p>
              <div className="space-y-2">
                {MEGA_NAV.platform.columns
                  .flatMap((c) => c.links)
                  .map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="block py-2 font-semibold text-mkt-navy"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
              </div>
            </div>
            <hr className="mkt-rule" />
            <div className="space-y-2">
              <Link
                to="/pricing"
                className="block py-2 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="block py-2 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block py-2 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/login"
                className="block py-2 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            </div>
            <Link
              to="/contact"
              className="mkt-btn mkt-btn-primary w-full"
              onClick={() => setMobileOpen(false)}
            >
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
