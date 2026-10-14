import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  AmberPath,
  CircleMedia,
  CutoutFloat,
  DarkCta,
  FOOD_CUTOUTS,
  PAGE_VISUALS,
  PageHero,
  SECTION_BGS,
  Spark,
} from "@/components/marketing/MarketingDecor";
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
      <PageHero
        crumbs={[{ name: "About", path: "/about" }]}
        eyebrow="About"
        title="Built beside the counter—not above it"
        lead="QuickPOS is an operating system for retail floors: sell faster, keep stock honest, and give owners a daily truth they can act on."
        visual={PAGE_VISUALS.about}
        actions={
          <>
            <Button href={appPath("/register")} variant="primary">
              Start free
            </Button>
            <Button href="/contact" variant="secondary">
              Contact us
            </Button>
          </>
        }
      />

      <Section className="relative overflow-hidden !pt-12">
        <AmberPath className="hidden opacity-50 md:block" />
        <div className="relative grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <p className="text-sm leading-relaxed text-muted md:text-base">
              We design for Pakistan retail realities—khata, WhatsApp receipts,
              and peak-hour checkout—not generic enterprise checklists. Based in
              Multan, we help single stores start free and multi-store operators
              graduate to Premium when branch visibility matters.
            </p>
            <div className="detail-rule mt-6" />
          </Reveal>
          <Reveal delay={80} variant="scale" className="relative lg:col-span-6">
            <CircleMedia
              src="/marketing/about-store.webp"
              alt="Neighborhood retail storefront in Pakistan"
              sizeClass="max-w-[400px]"
            />
            <CutoutFloat
              src={FOOD_CUTOUTS.burger}
              className="-left-2 bottom-4 hidden sm:block"
              size={100}
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="inset" className="relative overflow-hidden">
        <Spark className="absolute right-[14%] top-12 hidden md:block" />
        <Reveal>
          <Heading as="h2">What we believe</Heading>
          <div className="detail-rule mt-4" />
          <ul className="mt-8 max-w-2xl space-y-5 text-muted">
            <li>
              <strong className="text-ink">Truth at the counter.</strong> Every
              sale should update stock and customer history in the same breath.
            </li>
            <li>
              <strong className="text-ink">
                Owners deserve today&apos;s numbers.
              </strong>{" "}
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
        <Reveal className="text-center sm:text-left">
          <Heading as="h2">Customer stories</Heading>
          <div className="detail-rule mx-auto mt-4 sm:mx-0" />
          <p className="mt-4 max-w-xl text-muted">
            Illustrative operator outcomes based on how stores use QuickPOS day
            to day. Individual results vary by category and staffing.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {CASES.map((c, i) => (
            <Reveal key={c.name} delay={i * 60}>
              <article className="quote-open h-full">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-warm">
                  {c.city}
                </p>
                <h3 className="mt-3 font-sans text-2xl font-bold">{c.name}</h3>
                <p className="mt-2 text-sm font-semibold text-ink">{c.result}</p>
                <p className="mt-4 text-sm italic leading-relaxed text-muted">
                  “{c.quote}”
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <DarkCta
        title="See the product in action"
        primaryHref="/features"
        primaryLabel="Features"
        secondaryHref="/contact"
        secondaryLabel="Contact"
        bgImage={SECTION_BGS.store}
        visualLeft={FOOD_CUTOUTS.pasta}
        visualRight={FOOD_CUTOUTS.steak}
      />
    </main>
  );
}
