import { useTranslation } from "../../context/LocaleContext";
import { MARKETING_IMAGES } from "../../constants/marketingImages";
import MarketingImage from "./MarketingImage";

export default function LiveStoreSnapshot() {
  const { t } = useTranslation();

  const liveMetrics = [
    {
      label: t("marketing.liveSnapshot.sales"),
      value: "Rs 82,450",
      hint: t("marketing.liveSnapshot.salesHint"),
    },
    {
      label: t("marketing.liveSnapshot.customers"),
      value: "56",
      hint: t("marketing.liveSnapshot.customersHint"),
    },
    {
      label: t("marketing.liveSnapshot.lowStock"),
      value: "4 SKUs",
      hint: t("marketing.liveSnapshot.lowStockHint"),
    },
    {
      label: t("marketing.liveSnapshot.avgTicket"),
      value: "Rs 615",
      hint: t("marketing.liveSnapshot.avgTicketHint"),
    },
    {
      label: t("marketing.liveSnapshot.queue"),
      value: "18 sec",
      hint: t("marketing.liveSnapshot.queueHint"),
    },
  ];

  return (
    <div className="relative overflow-hidden border border-border min-h-[420px] lg:min-h-[480px]">
      <MarketingImage
        src={MARKETING_IMAGES.hero}
        alt={t("marketing.liveSnapshot.alt")}
        className="absolute inset-0 h-full w-full object-cover"
        width={1440}
        height={960}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        sizes="(max-width: 1024px) 100vw, 720px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/75 to-primary/25" />

      <div className="relative z-10 flex h-full min-h-[420px] lg:min-h-[480px] flex-col justify-end p-5 sm:p-6 text-white">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-white/80 uppercase">
          {t("marketing.liveSnapshot.label")}
        </p>
        <p className="mt-2 max-w-md text-lg font-bold leading-snug sm:text-xl">
          {t("marketing.liveSnapshot.headline")}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {liveMetrics.map((metric) => (
            <div
              key={metric.label}
              className="border border-white/20 bg-black/45 px-3 py-3 backdrop-blur-[2px]"
            >
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/65 uppercase">
                {metric.label}
              </p>
              <p className="mt-1 text-base font-extrabold leading-tight sm:text-lg">
                {metric.value}
              </p>
              <p className="mt-1 text-[10px] text-emerald-200/90">{metric.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
