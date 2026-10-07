import Link from "next/link";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How QuickPOS collects, uses, and protects personal and store data for POS accounts and marketing leads in Pakistan.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <Section className="!pt-16 max-w-3xl">
        <Breadcrumbs items={[{ name: "Privacy", path: "/privacy" }]} />
        <Heading as="h1">Privacy Policy</Heading>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-xl font-bold text-ink">1. Who we are</h2>
            <p className="mt-3">
              QuickPOS provides cloud POS software. Contact details are listed on our{" "}
              <Link href="/contact" className="font-semibold text-signal">
                Contact
              </Link>{" "}
              page.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">2. Data we collect</h2>
            <p className="mt-3">
              Account data (name, email, phone, store profile), operational POS data you
              enter (products, sales, customers), and marketing lead form submissions
              (name, business, phone, optional email/message). Technical logs may include
              IP address and device information for security and reliability.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">3. How we use data</h2>
            <p className="mt-3">
              We use data to provide the POS service, authenticate users, send
              transactional messages (for example OTP and receipts when enabled), respond
              to sales inquiries, improve reliability, and meet legal obligations.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">4. Processors</h2>
            <p className="mt-3">
              We use infrastructure and email providers as needed to host the product and
              deliver messages. We do not sell personal information.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">5. Retention &amp; rights</h2>
            <p className="mt-3">
              We retain account and store data while your account is active and as required
              for legal or dispute purposes. Contact us to request access or deletion where
              applicable.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">6. Related policies</h2>
            <p className="mt-3">
              See also{" "}
              <Link href="/terms" className="font-semibold text-signal">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/refund" className="font-semibold text-signal">
                Refunds
              </Link>
              .
            </p>
          </section>
        </div>
      </Section>
    </main>
  );
}
