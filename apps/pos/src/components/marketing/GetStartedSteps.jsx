import { Package, Store, TrendingUp, UserPlus } from "lucide-react";
import { useTranslation } from "../../context/LocaleContext";
import { MARKETING_IMAGES } from "../../constants/marketingImages";
import MediaTextCard from "./MediaTextCard";

function StepContent({ num, Icon, title, desc }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="inline-flex min-w-[2.5rem] items-center justify-center bg-secondary/25 px-2 py-1 text-2xl font-extrabold leading-none text-primary">
          {num}
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center border border-primary/15 bg-white text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold text-primary sm:text-lg">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{desc}</p>
    </>
  );
}

export default function GetStartedSteps() {
  const { t } = useTranslation();

  const steps = [
    {
      num: "01",
      Icon: UserPlus,
      title: t("marketing.getStarted.step1.title"),
      desc: t("marketing.getStarted.step1.desc"),
      image: MARKETING_IMAGES.team,
      alt: t("marketing.getStarted.step1.alt"),
    },
    {
      num: "02",
      Icon: Store,
      title: t("marketing.getStarted.step2.title"),
      desc: t("marketing.getStarted.step2.desc"),
      image: MARKETING_IMAGES.aboutStore,
      alt: t("marketing.getStarted.step2.alt"),
    },
    {
      num: "03",
      Icon: Package,
      title: t("marketing.getStarted.step3.title"),
      desc: t("marketing.getStarted.step3.desc"),
      image: MARKETING_IMAGES.receipts,
      alt: t("marketing.getStarted.step3.alt"),
      imageClassName: "brightness-105 contrast-110",
    },
    {
      num: "04",
      Icon: TrendingUp,
      title: t("marketing.getStarted.step4.title"),
      desc: t("marketing.getStarted.step4.desc"),
      image: MARKETING_IMAGES.checkout,
      alt: t("marketing.getStarted.step4.alt"),
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {steps.map(({ num, Icon, title, desc, image, alt, imageClassName }) => (
        <MediaTextCard
          key={num}
          image={image}
          alt={alt}
          imageClassName={imageClassName}
        >
          <StepContent num={num} Icon={Icon} title={title} desc={desc} />
        </MediaTextCard>
      ))}
    </div>
  );
}
