import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Clock, Flame, Shield, Zap } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { CountUp } from "@/components/marketing/CountUp";
import { LeadForm } from "@/components/marketing/LeadForm";
import {
  AmberPath,
  CircleMedia,
  CutoutFloat,
  DarkCta,
  DEVICE_SHOTS,
  FOOD_CUTOUTS,
  FloatShot,
  SECTION_BGS,
  Spark,
} from "@/components/marketing/MarketingDecor";
import { Reveal } from "@/components/marketing/Reveal";
import {
  FAQS,
  HOME_STORIES,
  IMPACT,
  INTERFACE_FEATURES,
  PAYMENT_POINTS,
  PRICING,
  TESTIMONIALS,
} from "@/lib/content";
import { JsonLd, buildMetadata, faqPageLd } from "@/lib/seo";
import { CONTACT, appPath } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "QuickPOS — Restaurant & café order POS for Pakistan",
  description:
    "Place table orders in seconds. Photo menus, kitchen tickets, payments, and stock in one cloud POS for restaurants and cafés.",
  absoluteTitle: true,
});

const HERO_POINTS = [
  { icon: Shield, label: "65% fewer ticket mix-ups" },
  { icon: Zap, label: "2× faster peak checkout" },
  { icon: Clock, label: "Live in under an hour" },
] as const;

const PLAN_VISUALS = [
  {
    key: "starter" as const,
    image: FOOD_CUTOUTS.coffee,
    cta: "Get started",
    href: appPath("/register"),
    external: false,
  },
  {
    key: "standard" as const,
    image: FOOD_CUTOUTS.burger,
    cta: "Get started",
    href: "/contact",
    external: false,
  },
  {
    key: "premium" as const,
    image: FOOD_CUTOUTS.pizza,
    cta: "Talk to sales",
    href: CONTACT.whatsappLink,
    external: true,
  },
];

const FEATURE_SPOTS = [
  {
    title: "Kitchen stock in your hands",
    body: "Every plated order writes stock back. Low dough, protein, or greens alerts fire before you 86 a dish mid-service.",
    image: DEVICE_SHOTS.tabletStock,
    href: "/features",
    cta: "Explore Now",
    cutout: FOOD_CUTOUTS.pasta,
  },
  {
    title: "Pay the Pakistan way",
    body: "Cash, card, JazzCash, EasyPaisa, and Raast on one bill—settle when the guest is ready without juggling apps.",
    image: DEVICE_SHOTS.phonePay,
    href: "/features",
    cta: "Explore Now",
    cutout: FOOD_CUTOUTS.coffee,
  },
] as const;

export default function HomePage() {
  return (
    <main id="main-content">
      <JsonLd data={faqPageLd(FAQS)} />

      <section className="atmosphere-hero">
        <div className="relative mx-auto w-full max-w-content px-4 pb-10 pt-10 sm:px-6 md:pb-16 md:pt-14">
          <Reveal className="text-center">
            <p className="hero-badge">Pure floor control · Nothing extra</p>
            <div className="detail-rule mx-auto mt-4" />
            <h1 className="mx-auto mt-5 max-w-[12ch] font-sans text-[3.75rem] font-bold leading-[0.95] tracking-[-0.05em] text-ink sm:text-[5rem] md:text-[6.25rem]">
              Quick<span className="text-warm">POS</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[30rem] text-lg text-muted md:text-xl">
              Table orders for restaurants &amp; cafés
            </p>
          </Reveal>

          <div className="relative mt-8 grid items-center gap-8 lg:mt-2 lg:grid-cols-12 lg:gap-4">
            <Reveal className="order-2 lg:order-1 lg:col-span-3">
              <p className="max-w-[20rem] text-base leading-relaxed text-muted md:text-lg">
                Photo menus, kitchen tickets, and Pakistan payments—one calm POS
                for a busy floor.
              </p>
              <div className="mt-6">
                <Button href={appPath("/register")} variant="primary">
                  Start Free
                </Button>
              </div>
            </Reveal>

            <Reveal
              variant="scale"
              delay={80}
              className="order-1 relative cutout-stack bg-transparent lg:order-2 lg:col-span-6"
            >
              <CutoutFloat
                src={FOOD_CUTOUTS.pizza}
                className="left-[-6%] top-[6%] hidden lg:block"
                size={120}
                delay="0s"
              />
              <CutoutFloat
                src={FOOD_CUTOUTS.coffee}
                className="right-[-6%] bottom-[8%] hidden lg:block"
                size={108}
                delay="0.6s"
              />
              <Spark className="absolute left-[10%] top-[2%] hidden opacity-70 sm:block" />
              <FloatShot
                src={DEVICE_SHOTS.heroPos}
                alt="QuickPOS order screen"
                priority
                className="mx-auto max-w-2xl"
              />
            </Reveal>

            <Reveal delay={120} className="order-3 lg:col-span-3 lg:pl-2">
              <ul className="space-y-5">
                {HERO_POINTS.map((p) => (
                  <li key={p.label} className="flex items-start gap-3">
                    <span className="feature-dot">
                      <p.icon
                        className="h-3.5 w-3.5"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </span>
                    <span className="pt-0.5 text-sm font-medium leading-snug text-ink">
                      {p.label}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="hero-price mt-8 text-3xl font-bold tracking-tight md:text-4xl">
                Free
              </p>
              <p className="mt-1 text-xs text-muted">Starter · forever</p>
            </Reveal>
          </div>
        </div>
      </section>

      <Section className="!py-16 md:!py-20">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="font-sans text-2xl font-bold tracking-[-0.03em] text-ink md:text-3xl">
            Running success one ticket at a time
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Spark />
            <div className="detail-rule" />
            <Spark />
          </div>
        </Reveal>
        <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {IMPACT.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70}>
              <div className="circle-stat">
                <p className="font-sans text-3xl font-bold tracking-tight text-ink md:text-4xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 max-w-[12ch] text-sm leading-snug text-muted">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="features" className="!pt-8 relative overflow-hidden">
        <AmberPath className="hidden opacity-70 md:block" />
        <div className="relative grid gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-warm">
              Built for the floor
            </p>
            <Heading as="h2" className="mt-3 max-w-[14ch]">
              The order screen that has it all
            </Heading>
            <div className="detail-rule mt-4" />
            <p className="mt-4 max-w-measure text-muted leading-relaxed">
              Everything the floor needs—menu photos, modifiers, kitchen send,
              and a ticket guests understand.
            </p>
            <ul className="mt-8 space-y-4">
              {INTERFACE_FEATURES.map((feat) => (
                <li key={feat.title} className="flex gap-3">
                  <span className="mt-1 text-warm" aria-hidden>
                    <Flame className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{feat.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {feat.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="relative grid gap-8 sm:grid-cols-2 lg:col-span-7">
            <Reveal variant="scale" className="relative sm:mt-12">
              <CircleMedia
                src="/marketing/lifestyle-cafe.png"
                alt="Café counter running QuickPOS"
                sizeClass="max-w-[360px]"
              />
              <CutoutFloat
                src={FOOD_CUTOUTS.dessert}
                className="-right-2 bottom-2 hidden sm:block"
                size={96}
                delay="0.3s"
              />
            </Reveal>
            <Reveal delay={80} variant="scale">
              <div className="relative mx-auto flex max-w-[320px] flex-col items-center">
                <Image
                  src={FOOD_CUTOUTS.steak}
                  alt=""
                  width={300}
                  height={300}
                  className="h-auto w-full object-contain"
                  sizes="300px"
                />
                <p className="mt-5 max-w-[24ch] text-center text-base leading-relaxed text-muted">
                  From café rush to full service—tickets stay with the table,
                  not on paper scraps.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section id="pricing" tone="inset" className="relative overflow-hidden">
        <Spark className="absolute left-[8%] top-16 hidden md:block" />
        <Spark className="absolute right-[10%] top-24 hidden md:block" />
        <Reveal className="mx-auto max-w-xl text-center">
          <Heading as="h2">Shop the collection</Heading>
          <div className="detail-rule mx-auto mt-4" />
          <p className="mt-4 text-muted leading-relaxed">
            Start free on one counter. Upgrade when multi-outlet visibility
            matters.{" "}
            <Link
              href="/pricing"
              className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-warm"
            >
              Full pricing
            </Link>
          </p>
        </Reveal>
        <div className="mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
          {PLAN_VISUALS.map((plan, i) => {
            const data = PRICING[plan.key];
            return (
              <Reveal key={plan.key} delay={i * 70}>
                <article className="plan-tile">
                  <div className="plan-tile-media">
                    <Image
                      src={plan.image}
                      alt=""
                      fill
                      className="object-contain p-2"
                      sizes="220px"
                    />
                  </div>
                  <h3 className="text-lg font-bold tracking-[-0.02em] text-ink">
                    {data.name}
                  </h3>
                  <p className="font-mono text-xl font-semibold text-ink">
                    {data.price}
                  </p>
                  <p className="max-w-[22ch] text-sm text-muted">{data.tagline}</p>
                  <Button
                    href={plan.href}
                    variant="primary"
                    external={plan.external || undefined}
                    className="mt-2"
                  >
                    {plan.cta}
                  </Button>
                  <ul className="mt-4 space-y-2 text-left text-sm text-muted">
                    {data.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-warm"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {FEATURE_SPOTS.map((spot, i) => (
        <Section
          key={spot.title}
          id={i === 0 ? "kitchen" : "payments"}
          className={`relative overflow-hidden ${i % 2 === 1 ? "atmosphere-inset" : ""}`}
        >
          <div
            className={`grid items-center gap-12 lg:grid-cols-12 lg:gap-16 ${
              i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <Reveal variant="scale" className="relative lg:col-span-6">
              <CutoutFloat
                src={spot.cutout}
                className={
                  i % 2 === 0
                    ? "-left-4 top-2 hidden sm:block"
                    : "-right-4 top-4 hidden sm:block"
                }
                size={112}
              />
              <FloatShot
                src={spot.image}
                alt={spot.title}
                className="mx-auto max-w-xl"
                sizes="(max-width: 768px) 90vw, 560px"
              />
            </Reveal>
            <Reveal delay={80} className="lg:col-span-6">
              <Heading as="h2" className="max-w-[16ch]">
                {spot.title}
              </Heading>
              <div className="detail-rule mt-4" />
              <p className="mt-4 max-w-measure leading-relaxed text-muted">
                {spot.body}
              </p>
              <div className="mt-8">
                <Button href={spot.href} variant="primary">
                  {spot.cta}
                </Button>
              </div>
            </Reveal>
          </div>
        </Section>
      ))}

      <Section id="orders" className="relative overflow-hidden">
        <AmberPath className="hidden opacity-40 md:block" />
        <div className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <Heading as="h2" className="max-w-[16ch]">
              Built like a real restaurant order flow
            </Heading>
            <div className="detail-rule mt-4" />
            <ul className="mt-8 space-y-4">
              {PAYMENT_POINTS.map((point) => (
                <li key={point} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-warm bg-accent-soft text-warm">
                    <Check
                      className="h-3.5 w-3.5"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-ink">
                    {point}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80} variant="scale" className="relative lg:col-span-7">
            <FloatShot
              src={DEVICE_SHOTS.heroDash}
              alt="Checkout and order ticket flow"
              className="mx-auto bg-transparent"
            />
            <CutoutFloat
              src={FOOD_CUTOUTS.salad}
              className="-bottom-2 right-4 hidden sm:block"
              size={110}
            />
          </Reveal>
        </div>
      </Section>

      <Section id="stories" tone="inset">
        <Reveal className="mx-auto max-w-xl text-center">
          <Heading as="h2">From the floor</Heading>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Spark />
            <div className="detail-rule" />
            <Spark />
          </div>
          <p className="mt-4 text-muted leading-relaxed">
            Restaurants, cafés, and kitchens running orders on QuickPOS.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {HOME_STORIES.map((story, i) => {
            const cutout = [
              FOOD_CUTOUTS.pizza,
              FOOD_CUTOUTS.coffee,
              FOOD_CUTOUTS.pasta,
            ][i];
            return (
              <Reveal key={story.title} delay={i * 70}>
                <Link href={story.href} className="story-card group no-underline">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-transparent p-6">
                    <Image
                      src={cutout}
                      alt={story.title}
                      width={240}
                      height={240}
                      quality={90}
                      className="story-card-img h-auto w-full max-w-[280px] object-contain transition-transform duration-700 ease-brand"
                      sizes="280px"
                    />
                  </div>
                  <div className="mt-2 text-center md:text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-warm">
                      {story.tag}
                    </span>
                    <h3 className="mt-2 text-base font-semibold tracking-[-0.01em] text-ink">
                      {story.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {story.excerpt}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section>
        <Reveal className="mx-auto max-w-xl text-center">
          <Heading as="h2">What our clients say</Heading>
          <Spark className="mt-3" />
        </Reveal>
        <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16">
          {TESTIMONIALS.slice(0, 2).map((t, i) => (
            <Reveal key={t.name} delay={i * 80} className="quote-open">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-warm">
                  <Image
                    src={
                      i === 0
                        ? "/marketing/testimonial-ahmed.webp"
                        : "/marketing/testimonial-fatima.webp"
                    }
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-sm text-muted">{t.role}</p>
                </div>
              </div>
              <div
                className="mt-4 flex gap-1 text-warm"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg
                    key={s}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.77l-5.8 3.05 1.11-6.47-4.7-4.58 6.49-.94L12 2.5z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mt-4">
                <p className="text-base leading-relaxed text-ink md:text-lg">
                  “{t.quote}”
                </p>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="inset" className="overflow-hidden relative">
        <Spark className="absolute right-[20%] top-12 hidden md:block" />
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal variant="scale" className="relative lg:col-span-5">
            <CircleMedia
              src="/marketing/testimonial-portrait.png"
              alt="Restaurant owner using QuickPOS"
              sizeClass="max-w-[380px]"
            />
            <CutoutFloat
              src={FOOD_CUTOUTS.coffee}
              className="-right-1 bottom-4 hidden sm:block"
              size={100}
            />
          </Reveal>
          <Reveal delay={80} className="lg:col-span-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-warm">
              Stay ready
            </p>
            <Heading as="h2" className="mt-3">
              Talk to sales
            </Heading>
            <div className="detail-rule mt-4" />
            <p className="mt-3 max-w-measure text-muted leading-relaxed">
              Tell us what you run—café, restaurant, or multi-outlet—we’ll map
              the setup. Demo on WhatsApp when you’re ready.
            </p>
            <div className="mt-8 max-w-md">
              <LeadForm source="homepage" />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="faq">
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <Heading as="h2">Questions</Heading>
            <div className="detail-rule mt-4" />
            <div className="mt-8">
              <Accordion items={[...FAQS.slice(0, 5)]} />
            </div>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-6">
            <div className="border-t border-line pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <Heading as="h3">Prefer WhatsApp?</Heading>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Book a kitchen demo—we’ll walk the order flow on your menu.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={CONTACT.whatsappDemo} variant="primary" external>
                  Book a demo
                </Button>
                <Button href="/contact" variant="secondary">
                  Contact
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <DarkCta
        title="Put a calm order system on a busy floor."
        bgImage={SECTION_BGS.restaurant}
        visualLeft={FOOD_CUTOUTS.burger}
        visualRight={FOOD_CUTOUTS.pizza}
      />
    </main>
  );
}
