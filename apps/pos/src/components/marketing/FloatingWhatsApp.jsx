import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../../context/LocaleContext";
import { QUICKPOS_CONTACT } from "../../constants/marketing";

export default function FloatingWhatsApp() {
  const { t } = useTranslation();
  const [showLabel, setShowLabel] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setShowLabel(false), 3500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <a
      href={QUICKPOS_CONTACT.whatsappGeneric}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-[30] flex items-center gap-2 bg-mkt-navy p-4 text-white"
      title={t("marketing.floatingWhatsapp.title")}
      aria-label={t("marketing.floatingWhatsapp.title")}
    >
      <MessageCircle className="h-6 w-6" aria-hidden />
      {showLabel && (
        <span className="pr-1 text-sm md:hidden">
          {t("marketing.floatingWhatsapp.label")}
        </span>
      )}
    </a>
  );
}
