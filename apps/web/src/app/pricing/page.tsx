import Image from "next/image";
import { Check } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { LeadForm } from "@/components/marketing/LeadForm";
import {
  FOOD_CUTOUTS,
  PAGE_VISUALS,
  PageHero,
  Spark,
} from "@/components/marketing/MarketingDecor";
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

const PLAN_CUTOUTS = [
  { key: "starter" as const, image: FOOD_CUTOUTS.coffee },
  { key: "premium" as const, image: FOOD_CUTOUTS.pizza },
];

export default function PricingPage() {
  return (
    <main id="main-content">
      <JsonLd data={faqPageLd(FAQS)} />
      <PageHero
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
        eyebrow="Pricing"
        title="Pricing that respects operators"
        lead="Start free. Upgrade when multi-store reporting and priority onboarding matter. No surprise POS licensing fees."
        visual={PAGE_VISUALS.pricing}
      />

      <Section className="!pt-12 relative overflow-hidden">
        <div className="grid gap-10 lg:grid-cols-2">
          {PLAN_CUTOUTS.map((plan, i) => {
            const data = PRICING[plan.key];
            const isPremium = plan.key === "premium";
            return (
              <Reveal key={plan.key} delay={i * 60}>
                <article
                  className={`relative flex h-full flex-col items-center p-8 text-center md:p-10 ${
                    isPremium
                      ? "bg-ink text-paper"
                      : "border border-line bg-surface"
                  }`}
                >
                  <Spark
                    className={`absolute right-6 top-6 ${isPremium ? "text-warm" : ""}`}
                  />
                  <div className="relative mb-6 h-36 w-36 bg-transparent">
                    <Image
                      src={plan.image}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="144px"
                    />
                  </div>
                  <p
                    className={`text-xs font-medium uppercase tracking-[0.14em] ${
                      isPremium ? "text-warm" : "text-muted"
                    }`}
                  >
                    {data.name}
                  </p>
                  <p className="mt-3 font-sans text-5xl font-bold tracking-tight">
                    {data.price}
                  </p>
                  <p
                    className={`mt-2 text-sm ${isPremium ? "text-paper/70" : "text-muted"}`}
                  >
                    {data.tagline}
                  </p>
                  <ul
                    className={`mt-6 w-full space-y-2.5 text-left text-sm ${
                      isPremium ? "text-paper/85" : "text-muted"
                    }`}
                  >
                    {data.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-warm"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 w-full space-y-3">
                    {isPremium ? (
                      <>
                        <Button
                          href={CONTACT.phoneLink}
                          variant="inverse"
                          className="w-full"
                        >
                          Call {CONTACT.phoneDisplay}
                        </Button>
                        <Button
                          href={CONTACT.whatsappLink}
                          variant="whatsapp"
                          external
                          className="w-full"
                        >
                          WhatsApp sales
                        </Button>
                      </>
                    ) : (
                      <Button
                        href={appPath("/register")}
                        variant="primary"
                        className="w-full"
                      >
                        Create free account
                      </Button>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section id="compare-plans">
        <Reveal>
          <Heading as="h2">Starter vs Premium</Heading>
          <div className="detail-rule mt-4" />
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

      <Section tone="inset" id="costs" className="relative overflow-hidden">
        <Spark className="absolute left-[10%] top-14 hidden md:block" />
        <Reveal>
          <Heading as="h2">Understanding POS costs</Heading>
          <div className="detail-rule mt-4" />
          <p className="mt-4 max-w-xl text-muted">
            Software, hardware, payment processing, and onboarding—clear so you
            can budget without surprises.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {COST_BREAKDOWN.map((c, i) => (
            <Reveal key={c.title} delay={i * 50}>
              <article className="h-full border-t border-warm pt-5">
                <h3 className="font-sans text-lg font-bold">{c.title}</h3>
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
            <div className="detail-rule mt-4" />
            <div className="mt-8">
              <Accordion items={[...FAQS]} />
            </div>
          </div>
          <div className="relative border-t border-line pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <Spark className="absolute right-0 top-0 hidden md:block" />
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
