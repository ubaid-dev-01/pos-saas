import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { ProductFrame } from "@/components/marketing/ProductFrame";
import { Reveal } from "@/components/marketing/Reveal";
import { CASES } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { appPath } from "@/lib/site";

export const metadata = buildMetadata({
  title: "About QuickPOS — retail POS from Multan, Pakistan",
  description:
    "Learn why QuickPOS exists: calmer retail floors, honest stock, and daily numbers owners can trust. Customer stories from Pakistan stores.",
  path: "/about",
  keywords: [
    "QuickPOS about",
    "Pakistan POS company",
    "retail software Multan",
  ],
});

export default function AboutPage() {
  return (
    <main id="main-content">
      <Section className="!pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <Breadcrumbs items={[{ name: "About", path: "/about" }]} />
            <Heading as="h1">Built beside the counter—not above it</Heading>
            <p className="mt-5 text-lg text-muted">
              QuickPOS is an operating system for retail floors: sell faster, keep
              stock honest, and give owners a daily truth they can act on. We
              design for Pakistan retail realities—khata, WhatsApp receipts, and
              peak-hour checkout—not generic enterprise checklists.
            </p>
            <p className="mt-4 text-muted">
              Based in Multan, we help single stores start free and multi-store
              operators graduate to Premium when branch visibility matters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={appPath("/register")} variant="primary">
                Start free
              </Button>
              <Button href="/contact" variant="secondary">
                Contact us
              </Button>
              <Button href="/features" variant="ghost">
                See features
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <ProductFrame
              src="/marketing/about-store.webp"
              alt="Neighborhood retail storefront in Pakistan"
              priority
            />
          </Reveal>
        </div>
      </Section>

      <Section className="bg-surface border-y border-line">
        <Reveal>
          <Heading as="h2">What we believe</Heading>
          <ul className="mt-6 max-w-2xl space-y-4 text-muted">
            <li>
              <strong className="text-ink">Truth at the counter.</strong> Every
              sale should update stock and customer history in the same breath.
            </li>
            <li>
              <strong className="text-ink">Owners deserve today&apos;s numbers.</strong>{" "}
              Reports should not wait for a bookkeeper merge.
            </li>
            <li>
              <strong className="text-ink">Start simple, scale honestly.</strong>{" "}
              Free for one store; Premium when multi-store visibility is real.
            </li>
          </ul>
        </Reveal>
      </Section>

      <Section id="stories">
        <Reveal>
          <Heading as="h2">Customer stories</Heading>
          <p className="mt-4 max-w-xl text-muted">
            Illustrative operator outcomes based on how stores use QuickPOS day
            to day. Individual results vary by category and staffing.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {CASES.map((c) => (
            <Reveal key={c.name}>
              <article className="h-full border border-line bg-paper p-6">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-signal-deep">
                  {c.city}
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold">{c.name}</h3>
                <p className="mt-2 text-sm font-semibold">{c.result}</p>
                <p className="mt-4 text-sm italic text-muted">“{c.quote}”</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    </main>
  );
}
