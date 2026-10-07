import Link from "next/link";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "Terms governing use of QuickPOS cloud POS software, accounts, acceptable use, and service changes.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main id="main-content">
      <Section className="!pt-16 max-w-3xl">
        <Breadcrumbs items={[{ name: "Terms", path: "/terms" }]} />
        <Heading as="h1">Terms of Service</Heading>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-xl font-bold text-ink">1. Agreement</h2>
            <p className="mt-3">
              By creating a QuickPOS account or using the service, you agree to these
              Terms. If you use QuickPOS on behalf of a store or company, you confirm
              you are authorized to bind that entity.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">2. The service</h2>
            <p className="mt-3">
              QuickPOS provides cloud point-of-sale software for retail operations,
              including checkout, inventory, customers, and reporting. Features may
              evolve. We will not remove material functionality from a paid plan without
              reasonable notice when commercially practical.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">3. Accounts &amp; security</h2>
            <p className="mt-3">
              You are responsible for safeguarding login credentials, configuring staff
              permissions, and all activity under your stores. Notify us promptly of
              unauthorized access.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">4. Acceptable use</h2>
            <p className="mt-3">
              You may not misuse the service, attempt unauthorized access, disrupt other
              customers, or use QuickPOS for unlawful sales. We may suspend accounts for
              abuse, fraud, or material breach.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">5. Your data &amp; compliance</h2>
            <p className="mt-3">
              You retain ownership of your business data. You remain responsible for tax
              compliance, invoicing accuracy, and store-level records. Our handling of
              personal data is described in the{" "}
              <Link href="/privacy" className="font-semibold text-signal">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">6. Fees</h2>
            <p className="mt-3">
              Starter may be offered free for a single store. Premium and other paid
              plans are billed as agreed in your order or quote. See also our{" "}
              <Link href="/refund" className="font-semibold text-signal">
                Refund Policy
              </Link>
              .
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">7. Contact</h2>
            <p className="mt-3">
              Questions about these Terms: visit{" "}
              <Link href="/contact" className="font-semibold text-signal">
                Contact
              </Link>
              .
            </p>
          </section>
        </div>
      </Section>
    </main>
  );
}
