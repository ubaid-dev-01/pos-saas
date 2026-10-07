import { Link } from "react-router-dom";
import Reveal from "../../components/marketing/Reveal";
import Seo from "../../components/marketing/Seo";
import { HOME_MODULES, SITE_URL } from "../../constants/siteContent";

export default function FeaturesPage() {
  return (
    <>
      <Seo
        title="Platform — QuickPOS"
        description="Checkout, inventory, CRM, analytics, multi-store, and more — each module as a product chapter."
        url={`${SITE_URL}/features`}
      />
      <main>
        <section className="mkt-band-navy">
          <div className="mkt-container py-24 lg:py-32">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Platform
            </p>
            <h1 className="mt-6 max-w-3xl text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.03em]">
              Every module your operation needs — connected.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-white/70">
              Each capability is a chapter in the same system — not a tile in a
              feature grid.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link to="/contact" className="mkt-btn mkt-btn-invert">
                Book a demo
              </Link>
              <Link to="/register" className="mkt-btn mkt-btn-ghost-light">
                Start free
              </Link>
            </div>
          </div>
        </section>

        <section className="mkt-section mkt-band-white">
          <div className="mkt-container space-y-120">
            {HOME_MODULES.map((mod, idx) => (
              <Reveal key={mod.id}>
                <article
                  id={mod.id}
                  className={`mkt-split scroll-mt-28 ${idx % 2 === 1 ? "mkt-split-reverse" : ""}`}
                >
                  <div className="mkt-split-copy">
                    <p className="mkt-eyebrow">{mod.id.replace("-", " ")}</p>
                    <h2 className="mkt-title mt-4">{mod.title}</h2>
                    <p className="mkt-body mt-6">{mod.body}</p>
                    <ul className="mt-8 space-y-3">
                      {mod.points.map((p) => (
                        <li
                          key={p}
                          className="border-l-2 border-mkt-indigo pl-4 text-[15px] font-medium text-mkt-900"
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mkt-split-media">
                    <img
                      src={mod.image}
                      alt={mod.title}
                      className="mkt-media aspect-[4/3]"
                      width={1000}
                      height={750}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mkt-band-navy mkt-section">
          <div className="mkt-container text-center">
            <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.025em]">
              See the platform on your floor.
            </h2>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="mkt-btn mkt-btn-invert">
                Book a demo
              </Link>
              <Link to="/pricing" className="mkt-btn mkt-btn-ghost-light">
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
