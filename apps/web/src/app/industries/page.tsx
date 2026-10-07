import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ProductFrame } from "@/components/marketing/ProductFrame";
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

export default function IndustriesPage() {
  return (
    <main id="main-content">
      <Section className="!pt-16">
        <Reveal>
          <Breadcrumbs items={[{ name: "Industries", path: "/industries" }]} />
          <Heading as="h1">Built for real counters</Heading>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Same QuickPOS core—checkout, stock, customers, reports—tuned to how
            each floor actually sells.
          </p>
        </Reveal>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-8 md:grid-cols-2">
          {INDUSTRIES.map((ind) => (
            <Reveal key={ind.title}>
              <article className="overflow-hidden border border-line bg-surface">
                <ProductFrame src={ind.image} alt={ind.title} />
                <div className="p-6 md:p-8">
                  <h2 className="font-display text-2xl font-bold">{ind.title}</h2>
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

      <Section dark>
        <Reveal className="mx-auto max-w-xl text-center">
          <Heading as="h2" className="text-paper">
            Not sure if you fit?
          </Heading>
          <p className="mt-4 text-paper/70">
            If you sell at a counter and need stock truth, you fit. Talk to us.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={appPath("/register")} variant="inverse">
              Start free
            </Button>
            <Button href="/contact" variant="inverseSecondary">
              Contact sales
            </Button>
          </div>
        </Reveal>
      </Section>
    </main>
  );
}
