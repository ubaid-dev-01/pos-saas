import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import { QUICKPOS_CONTACT } from "../../constants/marketing";

const iconCls = "w-4 h-4";

export default function MarketingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0A2625] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-14 grid md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <img
            src="/files/logo-white.svg"
            alt={t("header.default")}
            className="h-10 w-auto"
            width={160}
            height={40}
            loading="lazy"
          />
          <p className="text-sm text-white/70">{t("marketing.footer.tagline")}</p>
          <div className="flex items-center gap-3 text-white/80">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <Facebook className={iconCls} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Instagram className={iconCls} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className={iconCls} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <Twitter className={iconCls} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              <Youtube className={iconCls} />
            </a>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <h2 className="text-sm font-semibold">{t("marketing.footer.product")}</h2>
          <Link to="/features" className="block text-white/70 hover:text-white">
            {t("nav.features")}
          </Link>
          <Link to="/pricing" className="block text-white/70 hover:text-white">
            {t("nav.pricing")}
          </Link>
          <Link to="/features" className="block text-white/70 hover:text-white">
            {t("marketing.footer.integrations")}
          </Link>
          <Link to="/features" className="block text-white/70 hover:text-white">
            {t("marketing.footer.mobileApp")}
          </Link>
          <Link to="/features" className="block text-white/70 hover:text-white">
            {t("marketing.footer.updates")}
          </Link>
        </div>

        <div className="space-y-2 text-sm">
          <h2 className="text-sm font-semibold">{t("marketing.footer.company")}</h2>
          <Link to="/about" className="block text-white/70 hover:text-white">
            {t("marketing.footer.aboutUs")}
          </Link>
          <Link to="/contact" className="block text-white/70 hover:text-white">
            {t("marketing.footer.careers")}
          </Link>
          <Link to="/contact" className="block text-white/70 hover:text-white">
            {t("marketing.footer.blog")}
          </Link>
          <Link to="/contact" className="block text-white/70 hover:text-white">
            {t("marketing.footer.pressKit")}
          </Link>
          <Link to="/contact" className="block text-white/70 hover:text-white">
            {t("marketing.footer.partners")}
          </Link>
          <h2 className="mt-4 text-sm font-semibold">{t("marketing.footer.legal")}</h2>
          <Link to="/terms" className="block text-white/70 hover:text-white">
            {t("marketing.footer.terms")}
          </Link>
          <Link to="/privacy" className="block text-white/70 hover:text-white">
            {t("marketing.footer.privacy")}
          </Link>
          <Link to="/refund" className="block text-white/70 hover:text-white">
            {t("marketing.footer.refund")}
          </Link>
        </div>

        <div className="space-y-2 text-sm">
          <h2 className="text-sm font-semibold">{t("marketing.footer.contact")}</h2>
          <a
            className="block text-white/70 hover:text-white"
            href={QUICKPOS_CONTACT.phoneLink}
          >
            {QUICKPOS_CONTACT.phoneDisplay}
          </a>
          <a
            className="block text-white/70 hover:text-white"
            href={`mailto:${QUICKPOS_CONTACT.supportEmail}`}
          >
            {QUICKPOS_CONTACT.supportEmail}
          </a>
          <a
            className="inline-flex items-center rounded-xl bg-[#128C7E] px-4 py-2 text-white font-medium mt-2"
            href={QUICKPOS_CONTACT.whatsappGeneric}
            target="_blank"
            rel="noreferrer"
          >
            {t("common.whatsapp")}
          </a>
          <p className="text-white/60 mt-3">{t("marketing.footer.location")}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-4 py-4 text-sm text-white/60 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p>{t("marketing.footer.copyright")}</p>
          <p>{t("marketing.footer.madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
