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
  { title: "marketing.terms.s1.title", bodies: ["marketing.terms.s1.body", "marketing.terms.s1.body2"] },
  { title: "marketing.terms.s2.title", bodies: ["marketing.terms.s2.b0", "marketing.terms.s2.b1", "marketing.terms.s2.b2", "marketing.terms.s2.b3"] },
  { title: "marketing.terms.s3.title", bodies: ["marketing.terms.s3.b0", "marketing.terms.s3.b1", "marketing.terms.s3.b2", "marketing.terms.s3.b3"] },
  { title: "marketing.terms.s4.title", bodies: ["marketing.terms.s4.b0", "marketing.terms.s4.b1"] },
  { title: "marketing.terms.s5.title", bodies: ["marketing.terms.s5.b0", "marketing.terms.s5.b1", "marketing.terms.s5.b2", "marketing.terms.s5.b3", "marketing.terms.s5.b4", "marketing.terms.s5.b5"] },
  { title: "marketing.terms.s6.title", bodies: ["marketing.terms.s6.b0", "marketing.terms.s6.b1", "marketing.terms.s6.b2", "marketing.terms.s6.b3"] },
  { title: "marketing.terms.s7.title", bodies: ["marketing.terms.s7.b0"] },
  { title: "marketing.terms.s8.title", bodies: ["marketing.terms.s8.b0"] },
  { title: "marketing.terms.s9.title", bodies: ["marketing.terms.s9.b0"] },
  { title: "marketing.terms.s10.title", bodies: ["marketing.terms.s10.b0"] },
  { title: "marketing.terms.s11.title", bodies: ["marketing.terms.s11.b0"] },
  { title: "marketing.terms.s12.title", bodies: ["marketing.terms.s12.b0"] },
  { title: "marketing.terms.s13.title", bodies: ["marketing.terms.s13.b0"] },
  { title: "marketing.terms.s14.title", bodies: ["marketing.terms.s14.b0"] },
];

export default function TermsPage() {
  const { t, lang } = useTranslation();
  const now = new Date().toLocaleDateString(lang === "ur" ? "ur-PK" : "en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Seo
        title={t("marketing.terms.seo.title")}
        description={t("marketing.terms.seo.description")}
        url="https://quickpos.com/terms"
      />
      <main className="py-14 bg-background">
        <div className="mx-auto max-w-[800px] px-4 space-y-8 bg-white border border-border rounded-2xl p-6 md:p-10">
          <header>
            <h1 className="text-4xl font-extrabold text-primary">
              {t("marketing.terms.title")}
            </h1>
            <p className="text-sm text-text-muted mt-2">
              {t("marketing.terms.lastUpdated")} {now}
            </p>
          </header>

          {SECTION_KEYS.map((section) => (
            <Section key={section.title} title={t(section.title)}>
              {section.bodies.map((key) => (
                <p key={key}>{t(key)}</p>
              ))}
            </Section>
          ))}

          <Section title={t("marketing.terms.s15.title")}>
            <p>{t("marketing.terms.s15.phone", { phone: QUICKPOS_CONTACT.phoneDisplay })}</p>
            <p>{t("marketing.terms.s15.whatsapp", { phone: QUICKPOS_CONTACT.phoneDisplay })}</p>
            <p>{t("marketing.terms.s15.email", { email: QUICKPOS_CONTACT.legalEmail })}</p>
            <p>{t("marketing.terms.s15.address", { address: QUICKPOS_CONTACT.office })}</p>
            <p>{t("marketing.terms.s15.note")}</p>
          </Section>
        </div>
      </main>
    </>
  );
}
