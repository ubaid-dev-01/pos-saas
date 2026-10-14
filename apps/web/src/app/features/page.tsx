import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  AmberPath,
  DarkCta,
  DEVICE_SHOTS,
  FOOD_CUTOUTS,
  FloatShot,
  PAGE_VISUALS,
  PageHero,
  SECTION_BGS,
  Spark,
} from "@/components/marketing/MarketingDecor";
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
    float: DEVICE_SHOTS.tabletStock,
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
    float: DEVICE_SHOTS.heroDash,
  },
] as const;

export default function FeaturesPage() {
  return (
    <main id="main-content">
      <PageHero
        crumbs={[{ name: "Features", path: "/features" }]}
        eyebrow="Product"
        title="Product, not a checklist."
        lead="Four deep chapters—then the full matrix for procurement."
        visual={PAGE_VISUALS.features}
        actions={
          <>
            <Button href={appPath("/register")} variant="primary">
              Start free
            </Button>
            <Button href="/pricing" variant="secondary">
              Pricing
            </Button>
          </>
        }
      />

      {CHAPTERS.map((ch, i) => (
        <Section
          key={ch.id}
          id={ch.id}
          className={`relative overflow-hidden border-t border-line ${
            i % 2 === 1 ? "atmosphere-inset" : ""
          }`}
        >
          {i === 0 ? <AmberPath className="hidden opacity-40 md:block" /> : null}
          <div className="relative grid items-center gap-14 lg:grid-cols-12">
            <Reveal
              className={`lg:col-span-5 ${"reverse" in ch && ch.reverse ? "lg:order-2" : ""}`}
            >
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-warm">
                Capability
              </p>
              <Heading as="h2" className="mt-3">
                {ch.title}
              </Heading>
              <div className="detail-rule mt-4" />
              <p className="mt-4 max-w-measure leading-relaxed text-muted">
                {ch.lead}
              </p>
            </Reveal>
            <Reveal
              delay={90}
              variant="scale"
              className={`relative lg:col-span-7 ${"reverse" in ch && ch.reverse ? "lg:order-1" : ""}`}
            >
              {"float" in ch && ch.float ? (
                <FloatShot
                  src={ch.float}
                  alt={ch.title}
                  className="mx-auto max-w-xl"
                />
              ) : (
                <StageFrame caption={ch.caption}>{ch.stage}</StageFrame>
              )}
            </Reveal>
          </div>
        </Section>
      ))}

      <Section id="all-features" tone="inset" className="relative overflow-hidden">
        <Spark className="absolute right-[12%] top-16 hidden md:block" />
        <Reveal>
          <Heading as="h2">Full capability list</Heading>
          <div className="detail-rule mt-4" />
          <p className="mt-4 max-w-measure text-muted">
            What ships in QuickPOS today—scannable, no icon park.
          </p>
        </Reveal>
        <div className="mt-14 space-y-16">
          {FEATURE_GROUPS.map((group) => (
            <Reveal key={group.title}>
              <h3 className="text-xl font-bold tracking-[-0.02em]">
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

      <DarkCta
        title="Ready for the floor?"
        bgImage={SECTION_BGS.kitchen}
        visualLeft={FOOD_CUTOUTS.burger}
        visualRight={FOOD_CUTOUTS.pizza}
      />
    </main>
  );
}
