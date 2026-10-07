import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { Reveal } from "@/components/marketing/Reveal";
import {
  AnalyticsStage,
  CheckoutStage,
  InventoryStage,
  ReceiptStage,
  StageFrame,
} from "@/components/marketing/Stages";
import { FEATURE_GROUPS } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { appPath } from "@/lib/site";

export const metadata = buildMetadata({
  title: "POS features — checkout, inventory, reports",
  description:
    "QuickPOS product chapters: checkout, inventory, receipts, reports, plus the full capability list.",
  path: "/features",
});

const CHAPTERS = [
  {
    id: "checkout",
    title: "Checkout",
    lead: "Barcode-first selling with hold carts, discounts, taxes, and split tender.",
    caption: "Scan · Hold · Charge",
    stage: <CheckoutStage />,
  },
  {
    id: "inventory",
    title: "Inventory",
    lead: "Live stock, adjustments, history, and low-stock alerts after every sale.",
    caption: "Live qty · Alerts",
    stage: <InventoryStage />,
    reverse: true,
  },
  {
    id: "receipts",
    title: "Receipts",
    lead: "Print, WhatsApp, or email a branded ticket without leaving the sale.",
    caption: "Print · WhatsApp",
    stage: <ReceiptStage />,
  },
  {
    id: "reports",
    title: "Reports",
    lead: "Day, product, and staff views—export when accounting asks.",
    caption: "Trends · Export",
    stage: <AnalyticsStage />,
    reverse: true,
  },
] as const;

export default function FeaturesPage() {
  return (
    <main id="main-content">
      <section className="atmosphere-hero border-b border-line">
        <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 md:py-20">
          <Reveal>
            <Breadcrumbs items={[{ name: "Features", path: "/features" }]} />
            <Heading as="h1" className="mt-5">
              Product, not a checklist.
            </Heading>
            <p className="mt-4 max-w-measure text-lg leading-relaxed text-muted">
              Four deep chapters—then the full matrix for procurement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={appPath("/register")} variant="primary">
                Start free
              </Button>
              <Button href="/pricing" variant="secondary">
                Pricing
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {CHAPTERS.map((ch) => (
        <Section
          key={ch.id}
          id={ch.id}
          className="border-t border-line"
        >
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <Reveal
              className={`lg:col-span-5 ${"reverse" in ch && ch.reverse ? "lg:order-2" : ""}`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-signal-deep">
                Capability
              </p>
              <Heading as="h2" className="mt-3">
                {ch.title}
              </Heading>
              <p className="mt-4 max-w-measure leading-relaxed text-muted">{ch.lead}</p>
            </Reveal>
            <Reveal
              delay={90}
              variant="scale"
              className={`lg:col-span-7 ${"reverse" in ch && ch.reverse ? "lg:order-1" : ""}`}
            >
              <StageFrame caption={ch.caption}>{ch.stage}</StageFrame>
            </Reveal>
          </div>
        </Section>
      ))}

      <Section id="all-features" tone="surface" className="border-y border-line">
        <Reveal>
          <Heading as="h2">Full capability list</Heading>
          <p className="mt-4 max-w-measure text-muted">
            What ships in QuickPOS today—scannable, no icon park.
          </p>
        </Reveal>
        <div className="mt-14 space-y-16">
          {FEATURE_GROUPS.map((group) => (
            <Reveal key={group.title}>
              <h3 className="text-xl font-semibold tracking-[-0.02em]">
                {group.title}
              </h3>
              <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {group.items.map((item) => (
                  <div key={item.name} className="border-t border-line pt-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-muted">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section dark>
        <Reveal className="mx-auto max-w-xl text-center">
          <Heading as="h2" className="text-paper">
            Ready for the floor?
          </Heading>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
