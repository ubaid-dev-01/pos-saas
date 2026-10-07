import { Link } from "react-router-dom";
import Seo from "../../components/marketing/Seo";
import { SITE_URL } from "../../constants/siteContent";

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About QuickPOS"
        description="We build the retail commerce platform for stores that outgrew spreadsheets."
        url={`${SITE_URL}/about`}
      />
      <main>
        <section className="relative min-h-[70svh] overflow-hidden bg-mkt-navy text-white">
          <img
            src="/marketing/about-store.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            width={1600}
            height={1000}
          />
          <div className="absolute inset-0 bg-mkt-navy/75" />
          <div className="mkt-container relative flex min-h-[70svh] flex-col justify-end pb-20 pt-32">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
              About QuickPOS
            </p>
            <h1 className="mt-6 max-w-3xl text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]">
              Built for operators who outgrew spreadsheets.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-white/70">
              Retail software the way a serious store runs — fast at the counter,
              honest in the stockroom, clear for the owner.
            </p>
          </div>
        </section>

        <section className="mkt-section mkt-band-white">
          <div className="mkt-container grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="mkt-eyebrow">Mission</p>
              <h2 className="mkt-title mt-4">
                An operating system the business can trust.
              </h2>
            </div>
            <div className="space-y-6 text-[17px] leading-[1.6] text-mkt-500 lg:col-span-7">
              <p>
                QuickPOS is a retail commerce platform — not a billing toy. We
                connect checkout, inventory, customers, staff permissions, and
                reporting so every decision starts from one source of truth.
              </p>
              <p>
                From single counters to multi-city groups, we serve stores that
                need enterprise reliability with modern product clarity.
              </p>
            </div>
          </div>
        </section>

        <section className="mkt-section mkt-band-soft">
          <div className="mkt-container">
            <p className="mkt-eyebrow">Principles</p>
            <h2 className="mkt-title mt-4 max-w-2xl">
              What we refuse to compromise.
            </h2>
            <div className="mt-12 grid gap-px bg-mkt-100 sm:grid-cols-2">
              {[
                [
                  "Trust at the till",
                  "Every action should be fast, auditable, and hard to get wrong under pressure.",
                ],
                [
                  "Stock that tells the truth",
                  "Inventory is a financial system. We treat it that way.",
                ],
                [
                  "Clarity for owners",
                  "Dashboards exist to decide — not decorate.",
                ],
                [
                  "Scale without reinvention",
                  "Add branches without rebuilding how the business thinks.",
                ],
              ].map(([title, body]) => (
                <div key={title} className="bg-white p-8">
                  <h3 className="mkt-headline">{title}</h3>
                  <p className="mkt-support mt-3">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mkt-band-navy mkt-section">
          <div className="mkt-container text-center">
            <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.025em]">
              Ready to see QuickPOS on your floor?
            </h2>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="mkt-btn mkt-btn-invert">
                Book a demo
              </Link>
              <Link to="/features" className="mkt-btn mkt-btn-ghost-light">
                Explore the platform
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
