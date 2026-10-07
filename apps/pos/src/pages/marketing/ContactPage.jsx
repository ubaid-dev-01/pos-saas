import { Link } from "react-router-dom";
import LeadCaptureForm from "../../components/marketing/LeadCaptureForm";
import Seo from "../../components/marketing/Seo";
import { QUICKPOS_CONTACT } from "../../constants/marketing";
import { SITE_URL } from "../../constants/siteContent";

export default function ContactPage() {
  return (
    <>
      <Seo
        title="Book a Demo — QuickPOS"
        description="Talk to QuickPOS about your stores, inventory, and multi-branch needs."
        url={`${SITE_URL}/contact`}
      />
      <main>
        <section className="mkt-band-navy">
          <div className="mkt-container py-24 lg:py-32">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Contact
            </p>
            <h1 className="mt-6 max-w-3xl text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]">
              Book a demo with someone who understands the floor.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-white/70">
              Tell us how many stores you run. We’ll walk checkout, stock, staff,
              and reporting.
            </p>
          </div>
        </section>

        <section className="mkt-band-white border-b border-mkt-100">
          <div className="mkt-container grid divide-y divide-mkt-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            <a
              href={QUICKPOS_CONTACT.phoneLink}
              className="px-6 py-10 hover:bg-mkt-50"
            >
              <p className="mkt-eyebrow">Call</p>
              <p className="mt-3 text-xl font-bold text-mkt-navy">
                {QUICKPOS_CONTACT.phoneDisplay}
              </p>
              <p className="mkt-support mt-2">{QUICKPOS_CONTACT.hours}</p>
            </a>
            <a
              href={QUICKPOS_CONTACT.whatsappDemo}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-10 hover:bg-mkt-50"
            >
              <p className="mkt-eyebrow">WhatsApp</p>
              <p className="mt-3 text-xl font-bold text-mkt-navy">Request a demo</p>
              <p className="mkt-support mt-2">
                Fast replies during business hours
              </p>
            </a>
            <a
              href={`mailto:${QUICKPOS_CONTACT.email}`}
              className="px-6 py-10 hover:bg-mkt-50"
            >
              <p className="mkt-eyebrow">Email</p>
              <p className="mt-3 break-all text-xl font-bold text-mkt-navy">
                {QUICKPOS_CONTACT.email}
              </p>
              <p className="mkt-support mt-2">Within one business day</p>
            </a>
          </div>
        </section>

        <section className="mkt-section mkt-band-soft">
          <div className="mkt-container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mkt-title">Prefer a form?</h2>
              <p className="mkt-body mx-auto mt-6">
                Share your business type and store count — we’ll follow up with
                the right next step.
              </p>
            </div>
            <LeadCaptureForm source="contact-page" />
          </div>
        </section>

        <section className="mkt-section mkt-band-white">
          <div className="mkt-container grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-8">
              <iframe
                title="QuickPOS office — Multan, Pakistan"
                src="https://www.google.com/maps?q=Multan,+Pakistan&output=embed"
                className="h-[360px] w-full border border-mkt-100"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="lg:col-span-4">
              <h2 className="mkt-headline">Business hours</h2>
              <dl className="mt-8 space-y-4 text-sm">
                <div className="flex justify-between border-b border-mkt-100 pb-3">
                  <dt className="text-mkt-500">Mon – Sat</dt>
                  <dd className="font-semibold text-mkt-navy">
                    9:00 AM – 8:00 PM
                  </dd>
                </div>
                <div className="flex justify-between border-b border-mkt-100 pb-3">
                  <dt className="text-mkt-500">Sunday</dt>
                  <dd className="font-semibold text-mkt-navy">Closed</dd>
                </div>
              </dl>
              <p className="mkt-support mt-6">
                Office: {QUICKPOS_CONTACT.office}
              </p>
              <Link to="/register" className="mkt-btn mkt-btn-primary mt-8">
                Or start free trial
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
