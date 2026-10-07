import { Check } from "lucide-react";
import { SHOWCASE_IMAGES } from "../../constants/marketingImages";
import MarketingImage from "./MarketingImage";

export default function ShowcaseRow({
  reverse,
  title,
  desc,
  bullets,
  previewType,
  imageAlt,
}) {
  const image = SHOWCASE_IMAGES[previewType];

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className={reverse ? "lg:order-2" : ""}>
        <div className="overflow-hidden border border-border bg-white">
          <MarketingImage
            src={image}
            alt={imageAlt || title}
            className="w-full min-h-[260px] max-h-[360px] object-cover"
            width={1200}
            height={720}
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 606px"
          />
        </div>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>
        <h3 className="text-2xl md:text-3xl font-extrabold text-primary">{title}</h3>
        <p className="mt-3 text-text-muted">{desc}</p>
        <ul className="mt-4 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="text-sm flex items-start gap-2">
              <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" /> {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
