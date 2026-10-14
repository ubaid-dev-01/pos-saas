import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  FOOD_CUTOUTS,
  HalfCutCircle,
  SECTION_BGS,
  Spark,
} from "@/components/marketing/MarketingDecor";
import { CONTACT } from "@/lib/site";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/features#all-features", label: "Full feature list" },
      { href: "/industries", label: "Industries" },
      { href: "/pricing", label: "Pricing" },
      { href: "/#orders", label: "How it works" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/about#stories", label: "Customer stories" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/refund", label: "Refunds" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden text-paper">
      {/* Soft blurred full-bleed content bg */}
      <div className="footer-bg-blur" aria-hidden>
        <Image
          src={SECTION_BGS.restaurant}
          alt=""
          fill
          quality={70}
          sizes="100vw"
          className="object-cover"
        />
        <div className="footer-bg-veil" />
      </div>

      {/* Large zoomed half-cut circles */}
      <HalfCutCircle
        src={FOOD_CUTOUTS.pizza}
        position="top-right"
        size={420}
        zoom={1.3}
        className="hidden sm:block"
      />
      <HalfCutCircle
        src={FOOD_CUTOUTS.burger}
        position="bottom-left"
        size={400}
        zoom={1.3}
        className="hidden sm:block"
      />
      <Spark className="absolute left-1/2 top-10 z-[1] hidden -translate-x-1/2 text-warm md:block" />

      <Container className="relative z-[1] grid gap-12 py-20 md:grid-cols-4 md:py-24">
        <div className="space-y-5">
          <Image
            src="/brand/logo-lockup-dark.svg"
            alt="QuickPOS"
            width={180}
            height={36}
            className="h-9 w-auto"
          />
          <p className="max-w-xs text-base leading-relaxed text-paper/70">
            Cloud POS for Pakistan restaurants and cafés—orders, kitchen stock,
            guests, and reports in one ledger.
          </p>
          <Button href={CONTACT.whatsappGeneric} variant="whatsapp" external>
            WhatsApp
          </Button>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-warm/90">
              {col.title}
            </p>
            <ul className="mt-5 space-y-3 text-base text-paper/75">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="relative z-[1] border-t border-paper/10">
        <Container className="flex flex-col gap-2 py-5 text-sm text-paper/55 md:flex-row md:items-center md:justify-between md:text-base">
          <p>© {new Date().getFullYear()} QuickPOS. All rights reserved.</p>
          <p>
            {CONTACT.office} · {CONTACT.phoneDisplay}
          </p>
        </Container>
      </div>
    </footer>
  );
}
