import Seo from "../../components/marketing/Seo";
import { useTranslation } from "../../context/LocaleContext";
import { QUICKPOS_CONTACT } from "../../constants/marketing";

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-extrabold text-primary">{title}</h2>
      <div className="mt-2 text-sm text-text-muted space-y-2">{children}</div>
    </section>
  );
}

const SECTION_KEYS = [
  { title: "marketing.refund.s1.title", bodies: ["marketing.refund.s1.b0", "marketing.refund.s1.b1"] },
  { title: "marketing.refund.s2.title", bodies: ["marketing.refund.s2.b0"] },
  { title: "marketing.refund.s3.title", bodies: ["marketing.refund.s3.b0"] },
  { title: "marketing.refund.s4.title", bodies: ["marketing.refund.s4.b0", "marketing.refund.s4.b1"] },
  { title: "marketing.refund.s5.title", bodies: ["marketing.refund.s5.b0"] },
  { title: "marketing.refund.s6.title", bodies: ["marketing.refund.s6.b0"] },
  { title: "marketing.refund.s7.title", bodies: ["marketing.refund.s7.b0"] },
  { title: "marketing.refund.s8.title", bodies: ["marketing.refund.s8.b0"] },
  { title: "marketing.refund.s9.title", bodies: ["marketing.refund.s9.b0"] },
];

export default function RefundPage() {
  const { t, lang } = useTranslation();
  const now = new Date().toLocaleDateString(lang === "ur" ? "ur-PK" : "en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Seo
        title={t("marketing.refund.seo.title")}
        description={t("marketing.refund.seo.description")}
        url="https://quickpos.com/refund"
      />
      <main className="py-14 bg-background">
        <div className="mx-auto max-w-[800px] px-4 space-y-8 bg-white border border-border rounded-2xl p-6 md:p-10">
          <header>
            <h1 className="text-4xl font-extrabold text-primary">
              {t("marketing.refund.titleFull")}
            </h1>
            <p className="text-sm text-text-muted mt-2">
              {t("marketing.terms.lastUpdated")} {now}
            </p>
          </header>

          {SECTION_KEYS.map((section) => (
            <Section key={section.title} title={t(section.title)}>
              {section.bodies.map((key) => (
                <p key={key}>
                  {t(key, {
                    phone: QUICKPOS_CONTACT.phoneDisplay,
                    email: QUICKPOS_CONTACT.refundsEmail,
                  })}
                </p>
              ))}
            </Section>
          ))}

          <section>
            <h2 className="text-xl font-extrabold text-primary">
              {t("marketing.refund.contact.title")}
            </h2>
            <div className="mt-2 text-sm text-text-muted space-y-1">
              <p>{t("marketing.refund.contact.call", { phone: QUICKPOS_CONTACT.phoneDisplay })}</p>
              <p>{t("marketing.refund.contact.whatsapp", { phone: QUICKPOS_CONTACT.phoneDisplay })}</p>
              <p>{t("marketing.refund.contact.email", { email: QUICKPOS_CONTACT.refundsEmail })}</p>
              <p>{t("marketing.refund.contact.note")}</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
