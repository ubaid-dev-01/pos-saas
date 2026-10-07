import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { LeadForm } from "@/components/marketing/LeadForm";
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
      <Section className="!pt-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
            <Heading as="h1">Contact</Heading>
            <p className="mt-4 text-lg text-muted">
              Prefer a human? Call, WhatsApp, or send the form—we respond during
              business hours ({CONTACT.hours}).
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li>
                <span className="text-muted">Phone</span>
                <br />
                <a
                  className="font-semibold hover:text-signal-deep"
                  href={CONTACT.phoneLink}
                >
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <span className="text-muted">Email</span>
                <br />
                <a
                  className="font-semibold hover:text-signal-deep"
                  href={`mailto:${CONTACT.email}`}
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <span className="text-muted">Office</span>
                <br />
                <span className="font-semibold">
                  {CONTACT.office} · {CONTACT.hours}
                </span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={CONTACT.whatsappDemo} variant="whatsapp" external>
                Request a demo on WhatsApp
              </Button>
              <Button href="/pricing" variant="ghost">
                View pricing
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="border border-line bg-surface p-6 md:p-8">
              <Heading as="h2" className="!text-2xl">
                Send a note
              </Heading>
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
