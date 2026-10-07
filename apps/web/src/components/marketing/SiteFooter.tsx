import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CONTACT } from "@/lib/site";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/features#all-features", label: "Full feature list" },
      { href: "/industries", label: "Industries" },
      { href: "/pricing", label: "Pricing" },
      { href: "/#how-it-works", label: "How it works" },
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
    <footer className="atmosphere-ink text-paper">
      <Container className="grid gap-12 py-20 md:grid-cols-4">
        <div className="space-y-5">
          <Image
            src="/brand/logo-lockup-dark.svg"
            alt="QuickPOS"
            width={160}
            height={32}
            className="h-8 w-auto"
          />
          <p className="max-w-xs text-sm leading-relaxed text-paper/65">
            Cloud POS for Pakistan retail—checkout, stock, customers, and reports
            in one ledger.
          </p>
          <Button href={CONTACT.whatsappGeneric} variant="whatsapp" external>
            WhatsApp
          </Button>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-paper/45">
              {col.title}
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-paper/70">
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

      <div className="border-t border-paper/10">
        <Container className="flex flex-col gap-2 py-5 text-sm text-paper/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} QuickPOS. All rights reserved.</p>
          <p>
            {CONTACT.office} · {CONTACT.phoneDisplay}
          </p>
        </Container>
      </div>
    </footer>
  );
}
