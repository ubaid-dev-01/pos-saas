import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../../context/LocaleContext";

export default function GoTopButton() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      className="fixed bottom-24 right-7 z-[30] bg-mkt-navy p-3 text-white"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("marketing.goTop")}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
