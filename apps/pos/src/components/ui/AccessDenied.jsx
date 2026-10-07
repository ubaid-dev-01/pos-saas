import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LocaleContext";
import useAuthStore from "../../stores/authStore";

export default function AccessDenied({
  message,
  showBackButton = false,
  title,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const store = useAuthStore((s) => s.store);
  const supportEmail = store?.email || "support@quickpos.app";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-8 sm:p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-error/10 text-error">
          <ShieldAlert className="h-10 w-10" aria-hidden />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          {title || t("ui.accessDenied.title")}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-text-muted max-w-xl mx-auto">
          {message || t("ui.accessDenied.message")}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {showBackButton && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl border border-border text-text-primary font-medium hover:bg-background"
            >
              {t("ui.accessDenied.back")}
            </button>
          )}
          <a
            href={`mailto:${supportEmail}`}
            className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:opacity-95"
          >
            {t("ui.accessDenied.contact")}
          </a>
        </div>
      </div>
    </div>
  );
}
