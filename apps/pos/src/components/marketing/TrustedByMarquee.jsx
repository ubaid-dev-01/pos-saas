import { TRUSTED_RETAILERS } from "../../constants/marketing";
import { useTranslation } from "../../context/LocaleContext";

function LogoRow({ retailers, ariaHidden = false }) {
  return (
    <div
      className="trusted-marquee-row flex shrink-0 items-center"
      aria-hidden={ariaHidden || undefined}
    >
      {retailers.map((brand) => (
        <span
          key={`${brand.name}-${ariaHidden ? "dup" : "orig"}`}
          className="inline-flex shrink-0 items-center justify-center px-8 md:px-10"
        >
          <img
            src={brand.logo}
            alt={ariaHidden ? "" : `${brand.name} logo`}
            title={brand.name}
            className="h-20 md:h-24 lg:h-28 w-auto max-w-[220px] object-contain"
            width={220}
            height={112}
            loading="lazy"
            decoding="async"
          />
        </span>
      ))}
    </div>
  );
}

export default function TrustedByMarquee({ retailers = TRUSTED_RETAILERS }) {
  const { t } = useTranslation();
  const loopSegment = [...retailers, ...retailers, ...retailers];

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-4 text-center">
        <p className="text-xs tracking-[0.18em] text-text-muted">
          {t("marketing.trustedBy.title")}
        </p>
      </div>

      <div className="trusted-marquee-viewport mt-8 w-full overflow-hidden">
        <div className="trusted-marquee-track flex w-max">
          <LogoRow retailers={loopSegment} />
          <LogoRow retailers={loopSegment} ariaHidden />
        </div>
      </div>
    </section>
  );
}
