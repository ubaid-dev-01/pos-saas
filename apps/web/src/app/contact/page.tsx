import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { LeadForm } from "@/components/marketing/LeadForm";
import {
  CircleMedia,
  CutoutFloat,
  FOOD_CUTOUTS,
  PAGE_VISUALS,
  PageHero,
  Spark,
} from "@/components/marketing/MarketingDecor";
import { Reveal } from "@/components/marketing/Reveal";
import { JsonLd, buildMetadata, localBusinessLd } from "@/lib/seo";
import { CONTACT } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Contact QuickPOS sales & support",
  description:
    "Call, WhatsApp, or email QuickPOS in Multan, Pakistan. Ask about free Starter setup or Premium multi-store onboarding.",
  path: "/contact",
  keywords: ["QuickPOS contact", "POS demo Pakistan", "Multan POS support"],
});

export default function ContactPage() {
  return (
    <main id="main-content">
      <JsonLd data={localBusinessLd()} />
      <PageHero
        crumbs={[{ name: "Contact", path: "/contact" }]}
        eyebrow="Contact"
        title="Talk to a human"
        lead={`Prefer a call or WhatsApp? We respond during business hours (${CONTACT.hours}).`}
        visual={PAGE_VISUALS.contact}
      />

      <Section className="!pt-12 relative overflow-hidden">
        <div className="grid items-start gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <ul className="space-y-6 text-sm">
              <li>
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-warm">
                  Phone
                </span>
                <br />
                <a
                  className="mt-1 inline-block text-base font-semibold hover:text-warm"
                  href={CONTACT.phoneLink}
                >
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-warm">
                  Email
                </span>
                <br />
                <a
                  className="mt-1 inline-block text-base font-semibold hover:text-warm"
                  href={`mailto:${CONTACT.email}`}
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-warm">
                  Office
                </span>
                <br />
                <span className="mt-1 inline-block text-base font-semibold">
                  {CONTACT.office} · {CONTACT.hours}
                </span>
              </li>
            </ul>
            <div className="detail-rule mt-8" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={CONTACT.whatsappDemo} variant="whatsapp" external>
                Request a demo on WhatsApp
              </Button>
              <Button href="/pricing" variant="ghost">
                View pricing
              </Button>
            </div>
            <div className="relative mt-12 hidden max-w-[300px] sm:block">
              <CircleMedia
                src="/marketing/lifestyle-cafe.png"
                alt="Café atmosphere"
                sizeClass="max-w-[300px]"
              />
              <CutoutFloat
                src={FOOD_CUTOUTS.coffee}
                className="-right-4 bottom-0"
                size={88}
              />
            </div>
          </Reveal>

          <Reveal delay={80} className="relative lg:col-span-7">
            <Spark className="absolute -top-2 right-4" />
            <div className="border-t border-warm pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <Heading as="h2" className="!text-2xl">
                Send a note
              </Heading>
              <p className="mt-2 text-sm text-muted">
                Tell us what you run—we’ll map the right plan.
              </p>
              <div className="mt-6">
                <LeadForm source="contact" />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
