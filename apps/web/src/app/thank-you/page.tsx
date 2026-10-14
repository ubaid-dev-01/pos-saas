import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  FOOD_CUTOUTS,
  HalfCutCircle,
  Spark,
} from "@/components/marketing/MarketingDecor";
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
      <Section className="relative !py-28 text-center overflow-hidden">
        <HalfCutCircle
          src={FOOD_CUTOUTS.pizza}
          position="top-right"
          size={360}
          zoom={1.25}
          className="hidden sm:block"
        />
        <HalfCutCircle
          src={FOOD_CUTOUTS.burger}
          position="bottom-left"
          size={340}
          zoom={1.25}
          className="hidden sm:block"
        />
        <Spark className="relative mx-auto" />
        <div className="detail-rule mx-auto mt-4" />
        <div className="relative mx-auto mt-8 h-36 w-36 bg-transparent">
          <Image
            src={FOOD_CUTOUTS.coffee}
            alt=""
            fill
            className="object-contain"
            sizes="144px"
          />
        </div>
        <Heading as="h1" className="relative mt-8">
          You’re on the list
        </Heading>
        <p className="relative mx-auto mt-4 max-w-md text-lg text-muted">
          Our team will reach out shortly. Prefer faster? WhatsApp or call us
          now.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
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
