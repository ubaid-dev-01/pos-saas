import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../../context/LocaleContext";
import { QUICKPOS_CONTACT } from "../../constants/marketing";

const KEY = "quickpos_announcement_hidden";

export default function AnnouncementBar() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(
    () => localStorage.getItem(KEY) !== "1",
  );

  if (!visible) return null;

  return (
    <div className="bg-primary text-white text-sm">
      <div className="mx-auto max-w-[1280px] px-4 py-2.5 flex items-center justify-between gap-2">
        <p className="text-center w-full text-white">
          {t("marketing.announcement.text")}{" "}
          <a
            className="underline font-semibold text-white"
            href={QUICKPOS_CONTACT.phoneLink}
          >
            {QUICKPOS_CONTACT.phoneDisplay}
          </a>
        </p>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded hover:bg-white/20"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setVisible(false);
          }}
          aria-label={t("marketing.announcement.close")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
