import Link from "next/link";
import { redirect } from "next/navigation";
import { CONTACT } from "@/lib/site";
import { getPosOrigin } from "@/lib/pos-redirect";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Log in",
  description: "Sign in to your QuickPOS store account.",
  path: "/login",
  robots: { index: false, follow: false },
});

export default function LoginPage() {
  const origin = getPosOrigin();
  if (origin) {
    redirect(`${origin}/login`);
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16"
    >
      <p className="text-sm font-medium text-signal">QuickPOS</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
        Log in
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink/70">
        The POS app URL is not configured for this environment. Set{" "}
        <code className="text-sm">NEXT_PUBLIC_APP_URL</code> to your POS deployment.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center bg-signal px-5 text-sm font-semibold text-white"
        >
          Back to home
        </Link>
        <a
          href={CONTACT.whatsappGeneric}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center border border-ink px-5 text-sm font-semibold text-ink"
        >
          WhatsApp us
        </a>
      </div>
    </main>
  );
}
