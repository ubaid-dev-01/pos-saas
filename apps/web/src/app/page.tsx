import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { CountUp } from "@/components/marketing/CountUp";
import { LeadForm } from "@/components/marketing/LeadForm";
import { ProductFrame } from "@/components/marketing/ProductFrame";
import { Reveal } from "@/components/marketing/Reveal";
import { SystemDiagram } from "@/components/marketing/SystemDiagram";
import {
  AnalyticsStage,
  CheckoutStage,
  InventoryStage,
  ReceiptStage,
  StageFrame,
} from "@/components/marketing/Stages";
import { CASES, COMPARISON, FAQS, IMPACT, PRICING, TESTIMONIALS } from "@/lib/content";
import { JsonLd, buildMetadata, faqPageLd } from "@/lib/seo";
import { CONTACT, appPath } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "QuickPOS — Cloud POS for retail stores in Pakistan",
  description:
    "Checkout, inventory, customers, and reports in one system. Free Starter for one store.",
  absoluteTitle: true,
});

const CHAPTERS = [
  {
    id: "checkout",
    eyebrow: "Checkout",
    title: "The counter, without friction.",
    lead: "Scan, discount, split tender, and settle—without leaving the sale.",
    caption: "Barcode · Hold cart · Split pay",
    stage: <CheckoutStage />,
    reverse: false,
  },
  {
    id: "inventory",
    eyebrow: "Inventory",
    title: "Stock that tells the truth.",
    lead: "Every sale writes back. Low-stock alerts fire before the shelf goes empty.",
    caption: "Live qty · Thresholds · History",
    stage: <InventoryStage />,
    reverse: true,
  },
  {
    id: "receipts",
    eyebrow: "Receipts",
    title: "Proof the customer keeps.",
    lead: "Print or WhatsApp a branded ticket in one flow—no second app.",
    caption: "Print · WhatsApp · Email",
    stage: <ReceiptStage />,
    reverse: false,
  },
  {
    id: "reports",
    eyebrow: "Reports",
    title: "Owner clarity the same day.",
    lead: "Sales, average ticket, and movement—while decisions still matter.",
    caption: "Trends · Export-ready",
    stage: <AnalyticsStage />,
    reverse: true,
  },
] as const;

export default function HomePage() {
  return (
    <main id="main-content">
      <JsonLd data={faqPageLd(FAQS)} />

      {/* 1. Presence — Hero */}
      <section className="atmosphere-hero border-b border-line">
        <div className="mx-auto w-full max-w-content px-4 pb-6 pt-16 sm:px-6 md:pt-24">
          <Reveal>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-signal-deep">
              Cloud POS · Pakistan
            </p>
            <h1 className="mt-6 max-w-[12ch] font-sans text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.04em] text-ink md:text-[4rem] lg:text-[4.5rem]">
              QuickPOS
            </h1>
            <p className="mt-4 text-xl font-medium tracking-[-0.02em] text-ink/90 md:text-2xl">
              Truth at the counter.
            </p>
            <p className="mt-4 max-w-measure text-base leading-relaxed text-muted md:text-lg">
              Checkout, stock, customers, and reports in one system—built for
              floors that cannot afford chaos.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={appPath("/register")} variant="primary">
                Start free
              </Button>
              <Button href="/pricing" variant="secondary">
                See pricing
              </Button>
            </div>
          </Reveal>
        </div>
        <Reveal variant="scale" delay={120} className="mx-auto w-full max-w-content px-4 pb-16 sm:px-6 sm:pb-20">
          <StageFrame flush caption="Live checkout · Counter view">
            <CheckoutStage />
          </StageFrame>
        </Reveal>
      </section>

      {/* Metrics — quiet editorial strip */}
      <Section tone="surface" className="!py-16 border-b border-line">
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-0">
          {IMPACT.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 80}
              className={`sm:px-8 ${i > 0 ? "sm:border-l sm:border-line" : "sm:pl-0"}`}
            >
              <p className="font-mono text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm leading-snug text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 2. Recognition */}
      <Section id="problem">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-deep">
              The floor today
            </p>
            <Heading as="h2" className="mt-3">
              Chaos is expensive.
            </Heading>
            <ul className="mt-10 space-y-7">
              {[
                {
                  t: "Stockouts hide until the shelf is empty",
                  d: "Paper counts leave gaps in peak hours.",
                },
                {
                  t: "Checkout slows when it matters",
                  d: "Cashiers juggle tools instead of selling.",
                },
                {
                  t: "Owners fly blind overnight",
                  d: "Numbers wait for a spreadsheet merge.",
                },
              ].map((item, i) => (
                <li key={item.t} className="flex gap-4">
                  <span className="mt-1 font-mono text-[11px] text-signal-deep">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="font-medium tracking-[-0.01em]">{item.t}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {item.d}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-7">
            <StageFrame caption="When systems don’t talk">
              <ProductFrame
                src="/marketing/snapshot-inventory.webp"
                alt="Retail shelf and inventory pressure on a busy floor"
              />
            </StageFrame>
          </Reveal>
        </div>
      </Section>

      {/* 3. System */}
      <Section id="how-it-works" tone="surface" className="!pb-12 border-t border-line">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-deep">
            How it works
          </p>
          <Heading as="h2" className="mt-3">
            One sale. Four truths updated.
          </Heading>
          <p className="mt-4 max-w-measure text-muted leading-relaxed">
            Transaction, stock, customer, and report move together—so the floor
            and the office share the same ledger.
          </p>
        </Reveal>
      </Section>
      <SystemDiagram />

      {/* 4. Depth — capability chapters */}
      {CHAPTERS.map((ch, idx) => (
        <Section
          key={ch.id}
          id={ch.id}
          className={idx === 0 ? "border-t border-line" : "border-t border-line"}
        >
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <Reveal
              className={`lg:col-span-5 ${ch.reverse ? "lg:order-2" : ""}`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-deep">
                {ch.eyebrow}
              </p>
              <Heading as="h2" className="mt-3">
                {ch.title}
              </Heading>
              <p className="mt-4 max-w-measure leading-relaxed text-muted">
                {ch.lead}
              </p>
              <div className="mt-8">
                <Button href={`/features#${ch.id}`} variant="ghost">
                  See details →
                </Button>
              </div>
            </Reveal>
            <Reveal
              delay={90}
              variant="scale"
              className={`lg:col-span-7 ${ch.reverse ? "lg:order-1" : ""}`}
            >
              <StageFrame caption={ch.caption}>{ch.stage}</StageFrame>
            </Reveal>
          </div>
        </Section>
      ))}

      {/* Hardware */}
      <Section id="hardware" tone="inset">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-deep">
              Hardware
            </p>
            <Heading as="h2" className="mt-3">
              Bring your own counter.
            </Heading>
            <p className="mt-4 max-w-measure leading-relaxed text-muted">
              Laptop or tablet. Optional scanner and receipt printer. No
              proprietary terminal lock-in.
            </p>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-7">
            <StageFrame caption="BYO devices · Browser-based">
              <ProductFrame
                src="/marketing/hero-live-snapshot.webp"
                alt="QuickPOS running on a device at a retail counter"
              />
            </StageFrame>
          </Reveal>
        </div>
      </Section>

      {/* Compare */}
      <Section id="compare">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-deep">
            Compare
          </p>
          <Heading as="h2" className="mt-3">
            Traditional POS vs QuickPOS
          </Heading>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-10 overflow-hidden border border-line bg-surface shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-line bg-paper/80">
                  <tr>
                    <th className="px-5 py-4 font-medium">Capability</th>
                    <th className="px-5 py-4 font-medium text-muted">
                      Traditional
                    </th>
                    <th className="bg-accent-soft/50 px-5 py-4 font-medium text-signal-deep">
                      QuickPOS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-5 py-3.5 font-medium">{row.feature}</td>
                      <td className="px-5 py-3.5 text-muted">{row.traditional}</td>
                      <td className="bg-accent-soft/30 px-5 py-3.5 font-medium">
                        {row.quickpos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Proof */}
      <Section id="stories" tone="surface" className="border-y border-line">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-deep">
            Proof
          </p>
          <Heading as="h2" className="mt-3">
            Stores that stopped guessing
          </Heading>
        </Reveal>
        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-0">
          {CASES.map((c, i) => (
            <Reveal
              key={c.name}
              delay={i * 90}
              className={`md:px-8 ${i > 0 ? "md:border-l md:border-line" : "md:pl-0"}`}
            >
              <p className="font-mono text-3xl font-semibold tracking-tight text-signal-deep">
                {c.result.split(" ")[0]}
              </p>
              <p className="mt-2 text-sm font-medium leading-snug">{c.result}</p>
              <p className="mt-5 text-sm text-muted">
                {c.name} · {c.city}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                “{c.quote}”
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section dark>
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <blockquote className="border-t border-paper/15 pt-6">
                <p className="text-lg font-medium leading-snug text-paper md:text-xl">
                  “{t.quote}”
                </p>
                <footer className="mt-7 text-sm text-paper/55">
                  <p className="font-medium text-paper/90">{t.name}</p>
                  <p className="mt-0.5">{t.role}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-deep">
            Pricing
          </p>
          <Heading as="h2" className="mt-3">
            Simple plans.
          </Heading>
          <p className="mt-4 max-w-measure leading-relaxed text-muted">
            Start free. Upgrade when multi-store visibility matters.{" "}
            <Link
              href="/pricing"
              className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-signal"
            >
              Full pricing
            </Link>
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <article className="flex h-full flex-col border border-line bg-surface p-8 shadow-soft md:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {PRICING.starter.name}
              </p>
              <p className="mt-4 font-mono text-4xl font-semibold tracking-tight">
                {PRICING.starter.price}
              </p>
              <p className="mt-2 text-sm text-muted">{PRICING.starter.tagline}</p>
              <ul className="mt-8 flex-1 space-y-2.5 text-sm leading-relaxed">
                {PRICING.starter.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button
                  href={appPath("/register")}
                  variant="secondary"
                  className="w-full"
                >
                  Start free
                </Button>
              </div>
            </article>
          </Reveal>
          <Reveal delay={100}>
            <article className="flex h-full flex-col bg-ink p-8 text-paper shadow-stage md:p-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal">
                {PRICING.premium.name}
              </p>
              <p className="mt-4 font-mono text-4xl font-semibold tracking-tight">
                {PRICING.premium.price}
              </p>
              <p className="mt-2 text-sm text-paper/65">
                {PRICING.premium.tagline}
              </p>
              <ul className="mt-8 flex-1 space-y-2.5 text-sm leading-relaxed text-paper/85">
                {PRICING.premium.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10 grid gap-3">
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
                  WhatsApp
                </Button>
              </div>
            </article>
          </Reveal>
        </div>
      </Section>

      {/* FAQ + lead */}
      <Section tone="surface" className="border-y border-line" id="faq">
        <div className="grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Heading as="h2">Questions</Heading>
            <div className="mt-8">
              <Accordion items={[...FAQS.slice(0, 6)]} />
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6">
            <div className="border border-line bg-paper p-6 shadow-soft md:p-9">
              <Heading as="h3">Talk to sales</Heading>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Tell us what you run—we’ll map the setup.
              </p>
              <div className="mt-6">
                <LeadForm source="homepage" />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Commit */}
      <Section dark>
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
            QuickPOS
          </p>
          <Heading as="h2" className="mt-5 text-paper">
            Put a calm system on a busy floor.
          </Heading>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href={appPath("/register")} variant="inverse">
              Start free
            </Button>
            <Button href="/contact" variant="inverseSecondary">
              Contact
            </Button>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
