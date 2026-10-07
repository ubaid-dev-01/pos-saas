import { useEffect } from "react";
import { motion } from "framer-motion";

const MARKETING_URL =
  import.meta.env.VITE_MARKETING_URL || "https://pos-saas-kappa.vercel.app";

/**
 * Ledger Ink auth chrome — matches marketing landing (ink / paper / signal).
 */
export default function AuthShell({
  brandBadge,
  brandTitle,
  brandDesc,
  features = [],
  children,
  formSide = "right",
}) {
  useEffect(() => {
    document.documentElement.classList.add("auth-ledger-active");
    return () => document.documentElement.classList.remove("auth-ledger-active");
  }, []);

  const brand = (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="auth-panel relative overflow-hidden p-6 sm:p-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "url(/brand/pattern.svg)",
          backgroundSize: "420px",
        }}
        aria-hidden
      />
      <div className="relative z-10">
        {brandBadge ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--auth-signal)]">
            {brandBadge}
          </p>
        ) : null}
        <h1 className="auth-display mt-4 text-3xl font-semibold leading-tight text-[var(--auth-ink)] sm:text-4xl md:text-5xl">
          {brandTitle}
        </h1>
        {brandDesc ? (
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--auth-muted)] sm:text-base">
            {brandDesc}
          </p>
        ) : null}

        {features.length > 0 ? (
          <ul className="mt-8 space-y-3">
            {features.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 border border-[var(--auth-line)] bg-[var(--auth-surface)] p-4"
              >
                {item.icon ? (
                  <span className="auth-icon">
                    <item.icon className="h-4 w-4" aria-hidden />
                  </span>
                ) : null}
                <div>
                  <p className="font-semibold text-[var(--auth-ink)]">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--auth-muted)]">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.aside>
  );

  const form = (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
      className="auth-panel relative p-6 sm:p-8"
    >
      {children}
    </motion.section>
  );

  return (
    <div className="auth-ledger">
      <header className="border-b border-[var(--auth-line)]/80 bg-[color-mix(in_srgb,var(--auth-paper)_90%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a
            href={MARKETING_URL}
            className="flex items-center gap-2"
            aria-label="QuickPOS home"
          >
            <img
              src="/brand/logo-lockup-light.svg"
              alt="QuickPOS"
              width={160}
              height={32}
              className="h-8 w-auto"
            />
          </a>
          <a
            href={MARKETING_URL}
            className="text-sm font-medium text-[var(--auth-ink)]/70 transition-colors hover:text-[var(--auth-ink)]"
          >
            ← Marketing site
          </a>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-12">
        <div className={formSide === "right" ? "order-2 lg:order-1" : "order-2 lg:order-2"}>
          {brand}
        </div>
        <div className={formSide === "right" ? "order-1 lg:order-2" : "order-1 lg:order-1"}>
          {form}
        </div>
      </div>
    </div>
  );
}
