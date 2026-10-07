import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";

export default function NotFound() {
  return (
    <main id="main-content">
      <Section className="!py-28 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-signal">
          404
        </p>
        <Heading as="h1" className="mt-3">
          Page not found
        </Heading>
        <p className="mx-auto mt-4 max-w-md text-muted">
          That URL doesn’t exist on QuickPOS. Head home or talk to sales if you
          need help finding the right product page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="primary">
            Home
          </Button>
          <Button href="/contact" variant="ghost">
            Contact
          </Button>
          <Link href="/features" className="inline-flex min-h-11 items-center text-sm font-semibold text-signal">
            Features
          </Link>
        </div>
      </Section>
    </main>
  );
}
