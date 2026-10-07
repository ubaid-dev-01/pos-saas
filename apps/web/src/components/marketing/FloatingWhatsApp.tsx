import { MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/site";

/** Quiet dock — does not compete with hero CTA */
export function FloatingWhatsApp() {
  return (
    <a
      href={CONTACT.whatsappGeneric}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-md border border-line bg-surface text-signal shadow-stage transition-[transform,box-shadow] duration-200 ease-brand hover:-translate-y-0.5 hover:shadow-stage"
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
    </a>
  );
}
