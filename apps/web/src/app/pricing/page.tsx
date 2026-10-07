import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { LeadForm } from "@/components/marketing/LeadForm";
import { Reveal } from "@/components/marketing/Reveal";
import { COST_BREAKDOWN, FAQS, PLAN_COMPARE, PRICING } from "@/lib/content";
import { JsonLd, buildMetadata, faqPageLd } from "@/lib/seo";
import { CONTACT, appPath } from "@/lib/site";

export const metadata = buildMetadata({
  title: "QuickPOS pricing — free Starter & Premium",
  description:
    "Starter is free forever for one store. Premium is a custom quote for multi-store operators. Clear software, hardware, and payment cost guidance.",
  path: "/pricing",
  keywords: [
    "free POS Pakistan",
    "POS pricing",
    "multi-store POS cost",
    "cloud POS price",
  ],
});

export default function PricingPage() {
  return (
    <main id="main-content">
      <JsonLd data={faqPageLd(FAQS)} />
      <Section className="!pt-16">
        <Reveal>
          <Breadcrumbs items={[{ name: "Pricing", path: "/pricing" }]} />
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-signal-deep">
            Pricing
          </p>
          <Heading as="h1" className="mt-3">
            Pricing that respects operators
          </Heading>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Start free. Upgrade when multi-store reporting and priority
            onboarding matter. No surprise POS licensing fees.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <article className="h-full border border-line bg-surface p-8">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                {PRICING.starter.name}
              </p>
              <p className="mt-3 font-display text-5xl font-bold">
                {PRICING.starter.price}
              </p>
              <p className="mt-2 text-muted">{PRICING.starter.tagline}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {PRICING.starter.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  href={appPath("/register")}
                  variant="secondary"
                  className="w-full"
                >
                  Create free account
                </Button>
              </div>
            </article>
          </Reveal>
          <Reveal delay={0.05}>
            <article className="h-full bg-ink p-8 text-paper">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-signal">
                {PRICING.premium.name}
              </p>
              <p className="mt-3 font-display text-5xl font-bold">
                {PRICING.premium.price}
              </p>
              <p className="mt-2 text-paper/70">{PRICING.premium.tagline}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {PRICING.premium.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              <div className="mt-8 grid gap-3">
                <Button href={CONTACT.phoneLink} variant="inverse">
                  Call {CONTACT.phoneDisplay}
                </Button>
                <Button href={CONTACT.whatsappLink} variant="whatsapp" external>
                  WhatsApp sales
                </Button>
              </div>
            </article>
          </Reveal>
        </div>
      </Section>

      {/* Plan compare */}
      <Section id="compare-plans">
        <Reveal>
          <Heading as="h2">Starter vs Premium</Heading>
          <p className="mt-4 max-w-xl text-muted">
            See exactly what scales when you grow past one store.
          </p>
        </Reveal>
        <div className="mt-10 overflow-x-auto border border-line bg-paper">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th className="px-4 py-3 font-medium">Feature</th>
                <th className="px-4 py-3 font-medium">Starter</th>
                <th className="px-4 py-3 font-medium">Premium</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARE.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{row.feature}</td>
                  <td className="px-4 py-3 text-muted">{row.starter}</td>
                  <td className="px-4 py-3">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">
          30-day money-back guarantee on Premium.
        </p>
      </Section>

      <Section className="bg-surface border-y border-line" id="costs">
        <Reveal>
          <Heading as="h2">Understanding POS costs</Heading>
          <p className="mt-4 max-w-xl text-muted">
            Software, hardware, payment processing, and onboarding—clear so you
            can budget without surprises.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {COST_BREAKDOWN.map((c) => (
            <Reveal key={c.title}>
              <article className="h-full border border-line bg-paper p-6">
                <h3 className="font-display text-lg font-bold">{c.title}</h3>
                <p className="mt-3 text-sm text-muted">{c.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Heading as="h2">FAQ</Heading>
            <div className="mt-8">
              <Accordion items={[...FAQS]} />
            </div>
          </div>
          <div className="border border-line bg-paper p-6 md:p-8">
            <Heading as="h3">Need a custom quote?</Heading>
            <div className="mt-6">
              <LeadForm source="pricing" />
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
