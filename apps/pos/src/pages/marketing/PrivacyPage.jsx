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
  { title: "marketing.privacy.s1.title", bodies: ["marketing.privacy.s1.b0", "marketing.privacy.s1.b1"] },
  { title: "marketing.privacy.s2.title", bodies: ["marketing.privacy.s2.b0"] },
  { title: "marketing.privacy.s3.title", bodies: ["marketing.privacy.s3.b0"] },
  { title: "marketing.privacy.s4.title", bodies: ["marketing.privacy.s4.b0", "marketing.privacy.s4.b1"] },
  { title: "marketing.privacy.s5.title", bodies: ["marketing.privacy.s5.b0"] },
  { title: "marketing.privacy.s6.title", bodies: ["marketing.privacy.s6.b0"] },
  { title: "marketing.privacy.s7.title", bodies: ["marketing.privacy.s7.b0"] },
  { title: "marketing.privacy.s8.title", bodies: ["marketing.privacy.s8.b0"] },
  { title: "marketing.privacy.s9.title", bodies: ["marketing.privacy.s9.b0"] },
  { title: "marketing.privacy.s10.title", bodies: ["marketing.privacy.s10.b0"] },
];

export default function PrivacyPage() {
  const { t, lang } = useTranslation();
  const now = new Date().toLocaleDateString(lang === "ur" ? "ur-PK" : "en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Seo
        title={t("marketing.privacy.seo.title")}
        description={t("marketing.privacy.seo.description")}
        url="https://quickpos.com/privacy"
      />
      <main className="py-14 bg-background">
        <div className="mx-auto max-w-[800px] px-4 space-y-8 bg-white border border-border rounded-2xl p-6 md:p-10">
          <header>
            <h1 className="text-4xl font-extrabold text-primary">
              {t("marketing.privacy.title")}
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

          <Section title={t("marketing.privacy.s11.title")}>
            <p>{t("marketing.privacy.s11.email", { email: QUICKPOS_CONTACT.privacyEmail })}</p>
            <p>{t("marketing.privacy.s11.phone", { phone: QUICKPOS_CONTACT.phoneDisplay })}</p>
            <p>{t("marketing.privacy.s11.whatsapp", { phone: QUICKPOS_CONTACT.phoneDisplay })}</p>
            <p>{t("marketing.privacy.s11.note")}</p>
          </Section>
        </div>
      </main>
    </>
  );
}
