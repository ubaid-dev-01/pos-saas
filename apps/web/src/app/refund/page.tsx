import Link from "next/link";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Refund Policy",
  description:
    "QuickPOS refund policy for Premium and paid onboarding. Starter is free; billing disputes must be raised promptly.",
  path: "/refund",
});

export default function RefundPage() {
  return (
    <main id="main-content">
      <Section className="!pt-16 max-w-3xl">
        <Breadcrumbs items={[{ name: "Refunds", path: "/refund" }]} />
        <Heading as="h1">Refund Policy</Heading>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="font-display text-xl font-bold text-ink">1. Free Starter</h2>
            <p className="mt-3">
              The Starter plan for a single store is free. There is no software fee to
              refund for Starter usage.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">2. Premium &amp; paid services</h2>
            <p className="mt-3">
              Premium subscriptions and paid onboarding are billed per your quote or
              invoice. If you believe you were charged in error, contact sales within 7
              days of the charge with the invoice reference.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">3. How to request</h2>
            <p className="mt-3">
              Reach us via the{" "}
              <Link href="/contact" className="font-semibold text-signal">
                Contact
              </Link>{" "}
              page or WhatsApp. Include your account email, store name, and payment
              details so we can investigate quickly.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-ink">4. Non-refundable items</h2>
            <p className="mt-3">
              Third-party hardware, payment gateway fees, and services purchased outside
              QuickPOS are not refundable through us. Custom work already delivered may be
              non-refundable as stated in your order.
            </p>
          </section>
        </div>
      </Section>
    </main>
  );
}
