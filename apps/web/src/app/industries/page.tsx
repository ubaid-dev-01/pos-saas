import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import {
  DarkCta,
  FOOD_CUTOUTS,
  PAGE_VISUALS,
  PageHero,
  SECTION_BGS,
  Spark,
} from "@/components/marketing/MarketingDecor";
import { Reveal } from "@/components/marketing/Reveal";
import { INDUSTRIES, MODULES } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { appPath } from "@/lib/site";

export const metadata = buildMetadata({
  title: "POS for grocery, fashion, pharmacy & multi-store",
  description:
    "QuickPOS fits grocery, boutiques, F&B counters, pharmacy, electronics, wholesale desks, and multi-branch retail across Pakistan.",
  path: "/industries",
  keywords: [
    "grocery POS Pakistan",
    "boutique POS",
    "pharmacy inventory software",
    "multi-store POS",
  ],
});

const INDUSTRY_CUTOUTS = [
  FOOD_CUTOUTS.salad,
  FOOD_CUTOUTS.dessert,
  FOOD_CUTOUTS.coffee,
  FOOD_CUTOUTS.pasta,
  FOOD_CUTOUTS.sushi,
  FOOD_CUTOUTS.steak,
] as const;

export default function IndustriesPage() {
  return (
    <main id="main-content">
      <PageHero
        crumbs={[{ name: "Industries", path: "/industries" }]}
        eyebrow="Industries"
        title="Built for real counters"
        lead="Same QuickPOS core—checkout, stock, customers, reports—tuned to how each floor actually sells."
        visual={PAGE_VISUALS.industries}
      />

      <Section className="!pt-10 relative overflow-hidden">
        <div className="grid gap-12 md:grid-cols-2">
          {INDUSTRIES.map((ind, i) => (
            <Reveal key={ind.title} delay={(i % 2) * 50}>
              <article className="group">
                <div className="relative mx-auto flex aspect-square max-w-[300px] items-center justify-center bg-transparent">
                  <Image
                    src={INDUSTRY_CUTOUTS[i % INDUSTRY_CUTOUTS.length]}
                    alt=""
                    width={280}
                    height={280}
                    className="h-auto w-full object-contain transition-transform duration-700 ease-brand group-hover:scale-[1.04]"
                    sizes="280px"
                  />
                  <Spark className="absolute -right-1 top-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-5 text-center md:text-left">
                  <h2 className="font-sans text-2xl font-bold tracking-[-0.02em]">
                    {ind.title}
                  </h2>
                  <div className="detail-rule mx-auto mt-3 md:mx-0" />
                  <p className="mt-3 text-muted">{ind.body}</p>
                  <ul className="mt-5 space-y-1 text-sm text-muted">
                    {MODULES.slice(0, 4).map((m) => (
                      <li key={m.id}>— {m.title}</li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button href="/features" variant="ghost">
                      See all features
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <DarkCta
        title="Not sure if you fit?"
        lead="If you sell at a counter and need stock truth, you fit. Talk to us."
        primaryHref={appPath("/register")}
        secondaryHref="/contact"
        secondaryLabel="Contact sales"
        bgImage={SECTION_BGS.cafe}
        visualLeft={FOOD_CUTOUTS.burger}
        visualRight={FOOD_CUTOUTS.pizza}
      />
    </main>
  );
}
