"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { NAV, appPath } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-line bg-paper/90 shadow-soft backdrop-blur-lg"
          : "border-transparent bg-paper/80 backdrop-blur-md"
      }`}
    >
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="relative z-10 flex items-center gap-1.5"
          aria-label="QuickPOS home"
        >
          <Image
            src="/brand/logo-lockup-light.svg"
            alt="QuickPOS"
            width={160}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0 md:flex"
          aria-label="Primary"
        >
          {NAV.map((item, i) => (
            <Fragment key={item.href}>
              {i > 0 ? (
                <span className="px-3 text-sm text-muted/50" aria-hidden>
                  /
                </span>
              ) : null}
              <Link
                href={item.href}
                className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            </Fragment>
          ))}
        </nav>

        <div className="relative z-10 hidden items-center gap-2 md:flex">
          <Button href={appPath("/login")} variant="ghost">
            Sign In
          </Button>
          <Button href={appPath("/register")} variant="primary">
            Free trial
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line bg-surface md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>
      </Container>

      {open ? (
        <nav
          id={panelId}
          className="border-t border-line bg-surface md:hidden"
          aria-label="Mobile"
        >
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-3 text-sm font-semibold hover:bg-paper-deep"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button href={appPath("/login")} variant="ghost">
                Sign In
              </Button>
              <Button href={appPath("/register")} variant="primary">
                Free trial
              </Button>
            </div>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
