import { Check, X } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import FAQAccordion from "../../components/marketing/FAQAccordion";
import LeadCaptureForm from "../../components/marketing/LeadCaptureForm";
import Seo from "../../components/marketing/Seo";
import { useTranslation } from "../../context/LocaleContext";
import { QUICKPOS_CONTACT } from "../../constants/marketing";
import { SITE_URL } from "../../constants/siteContent";
import { getFaqs, getPricingPlans } from "../../locales/marketingContent";

const STARTER_NOT_INCLUDED = [
  "marketing.pricing.starter.not0",
  "marketing.pricing.starter.not1",
  "marketing.pricing.starter.not2",
  "marketing.pricing.starter.not3",
  "marketing.pricing.starter.not4",
];

export default function PricingPage() {
  const { t } = useTranslation();
  const faqs = useMemo(() => getFaqs(t).slice(0, 5), [t]);
  const plans = useMemo(
    () => getPricingPlans(t, QUICKPOS_CONTACT.phoneDisplay),
    [t],
  );

  return (
    <>
      <Seo
        title="Pricing — QuickPOS"
        description="Start free. Scale with Premium for unlimited stores, staff, analytics, and loyalty."
        url={`${SITE_URL}/pricing`}
      />
      <main>
        <section className="mkt-band-white border-b border-mkt-100">
          <div className="mkt-container py-24 text-center lg:py-32">
            <p className="mkt-eyebrow">Pricing</p>
            <h1 className="mkt-display mx-auto mt-4 max-w-3xl">
              Clear plans for serious operators.
            </h1>
            <p className="mkt-body mx-auto mt-6">
              Start free. Upgrade when the business needs more stores, staff, and
              depth.
            </p>
          </div>
        </section>

        <section className="mkt-section mkt-band-soft">
          <div className="mkt-container grid gap-px bg-mkt-100 lg:grid-cols-2">
            <article className="bg-white p-8 lg:p-12">
              <p className="mkt-eyebrow">{plans.starter.badge}</p>
              <h2 className="mkt-figure mt-4 text-4xl">
                {plans.starter.price}{" "}
                <span className="text-base font-medium text-mkt-500">
                  {plans.starter.period}
                </span>
              </h2>
              <p className="mkt-support mt-4">{plans.starter.tagline}</p>
              <ul className="mt-8 space-y-3">
                {plans.starter.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[15px] text-mkt-900">
                    <Check className="mt-0.5 h-4 w-4 text-mkt-indigo" />
                    {f}
                  </li>
                ))}
                {STARTER_NOT_INCLUDED.map((key) => (
                  <li key={key} className="flex gap-2 text-[15px] text-mkt-500">
                    <X className="mt-0.5 h-4 w-4 text-mkt-200" />
                    {t(key)}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mkt-btn mkt-btn-secondary mt-12 w-full">
                {plans.starter.cta}
              </Link>
            </article>

            <article className="bg-mkt-navy p-8 text-white lg:p-12">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
                {plans.premium.popular} · {plans.premium.badge}
              </p>
              <h2 className="mt-4 font-geist-mono text-4xl font-semibold">
                {plans.premium.price}
              </h2>
              <p className="mt-4 text-[14px] text-white/65">{plans.premium.tagline}</p>
              <ul className="mt-8 space-y-3">
                {plans.premium.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[15px] text-white/85">
                    <Check className="mt-0.5 h-4 w-4 text-white" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-12 space-y-3">
                <Link to="/contact" className="mkt-btn mkt-btn-invert w-full">
                  Talk to an expert
                </Link>
                <a
                  href={QUICKPOS_CONTACT.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mkt-btn mkt-btn-ghost-light w-full"
                >
                  {plans.premium.whatsappCta}
                </a>
              </div>
            </article>
          </div>
        </section>

        <section className="mkt-section mkt-band-white">
          <div className="mkt-container">
            <h2 className="mkt-title text-center">Compare plans</h2>
            <div className="mt-12 overflow-x-auto border border-mkt-100">
              <table className="min-w-full text-sm">
                <thead className="bg-mkt-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-mkt-navy">
                      {t("marketing.pricing.compare.colFeature")}
                    </th>
                    <th className="px-4 py-3 font-semibold text-mkt-navy">
                      {t("marketing.pricing.compare.colStarter")}
                    </th>
                    <th className="px-4 py-3 font-semibold text-mkt-navy">
                      {t("marketing.pricing.compare.colPremium")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.compareRows.map((row) => (
                    <tr key={row.feature} className="border-t border-mkt-100">
                      <td className="px-4 py-3 text-mkt-900">{row.feature}</td>
                      <td className="px-4 py-3 text-mkt-500">{row.starter}</td>
                      <td className="px-4 py-3 font-semibold text-mkt-navy">
                        {row.premium}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-center text-[15px] font-medium text-mkt-navy">
              {t("marketing.pricing.guarantee")}
            </p>
          </div>
        </section>

        <section className="mkt-section mkt-band-soft">
          <div className="mkt-container max-w-3xl">
            <h2 className="mkt-title text-center">
              {t("marketing.pricing.faqTitle")}
            </h2>
            <div className="mt-12">
              <FAQAccordion items={faqs} />
            </div>
          </div>
        </section>

        <section className="mkt-section mkt-band-white">
          <div className="mkt-container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mkt-title">
                {t("marketing.pricing.enterprise.title")}
              </h2>
              <p className="mkt-body mx-auto mt-6">
                {t("marketing.pricing.enterprise.subtitle")}
              </p>
            </div>
            <LeadCaptureForm source="pricing-page" />
          </div>
        </section>
      </main>
    </>
  );
}
