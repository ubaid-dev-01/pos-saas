import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { buildMetadata } from "@/lib/seo";
import { CONTACT, appPath } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Thank you",
  description: "We received your QuickPOS inquiry and will respond shortly.",
  path: "/thank-you",
  robots: { index: false, follow: false },
});

export default function ThankYouPage() {
  return (
    <main id="main-content">
      <Section className="!py-28 text-center">
        <Heading as="h1">You’re on the list</Heading>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Our team will reach out shortly. Prefer faster? WhatsApp or call us now.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={CONTACT.whatsappGeneric} variant="whatsapp" external>
            WhatsApp
          </Button>
          <Button href={appPath("/register")} variant="secondary">
            Start free account
          </Button>
          <Button href="/" variant="ghost">
            Back home
          </Button>
        </div>
      </Section>
    </main>
  );
}
