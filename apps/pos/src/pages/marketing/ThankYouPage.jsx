import { CheckCircle2, Mail, Phone, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Seo from "../../components/marketing/Seo";
import { useTranslation } from "../../context/LocaleContext";
import { QUICKPOS_CONTACT } from "../../constants/marketing";

export default function ThankYouPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state || {};

  return (
    <>
      <Seo
        title={t("marketing.thankYou.seo.title")}
        description={t("marketing.thankYou.seo.description")}
        url="https://quickpos.com/thank-you"
      />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_24%),linear-gradient(180deg,_#f8fbfa_0%,_#eef5f4_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5" /> {t("marketing.thankYou.badge")}
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-4xl font-black leading-tight text-primary sm:text-5xl">
                  {state.name
                    ? t("marketing.thankYou.titleWithName", { name: state.name })
                    : `${t("marketing.thankYou.title")}.`}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
                  {t("marketing.thankYou.body")}
                  {state.businessName
                    ? t("marketing.thankYou.bodyBusiness", {
                        businessName: state.businessName,
                      })
                    : ""}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
                  {t("marketing.thankYou.followUp")}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.18em] text-text-muted uppercase">
                  {t("marketing.thankYou.leadStatus")}
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {t("marketing.thankYou.leadSubmitted")}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {state.leadId
                    ? t("marketing.thankYou.leadId", { id: state.leadId })
                    : t("marketing.thankYou.leadReview")}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.18em] text-text-muted uppercase">
                  {t("marketing.thankYou.emailStatus")}
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {state.emailStatus === "notified"
                    ? t("marketing.thankYou.emailNotified")
                    : t("marketing.thankYou.emailSaved")}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {state.emailMessage || t("marketing.thankYou.contact24h")}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0A2625]"
              >
                <Mail className="h-4 w-4" />
                {t("marketing.thankYou.submitAnother")}
              </Link>
              <a
                href={QUICKPOS_CONTACT.phoneLink}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-text-primary transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Phone className="h-4 w-4" />
                {t("marketing.thankYou.callNow")}
              </a>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
            <h2 className="text-2xl font-black text-primary">
              {t("marketing.thankYou.nextTitle")}
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-text-muted">
              {[0, 1, 2, 3].map((n) => (
                <li
                  key={n}
                  className="rounded-2xl border border-border/70 bg-background p-4"
                >
                  {t(`marketing.thankYou.next${n}`, {
                    email: QUICKPOS_CONTACT.supportEmail,
                  })}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}
