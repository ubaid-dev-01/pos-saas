import { LayoutGrid, List } from "lucide-react";
import { useTranslation } from "../../context/LocaleContext";

export default function ViewToggle({ view, onChange, className = "" }) {
  const { t } = useTranslation();

  return (
    <div
      className={`inline-flex rounded-xl border border-border overflow-hidden bg-surface ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`px-3 py-2 transition-colors ${
          view === "table"
            ? "bg-primary text-white"
            : "text-text-muted hover:bg-background"
        }`}
        title={t("ui.viewToggle.table")}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`px-3 py-2 transition-colors ${
          view === "grid"
            ? "bg-primary text-white"
            : "text-text-muted hover:bg-background"
        }`}
        title={t("ui.viewToggle.grid")}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
}
