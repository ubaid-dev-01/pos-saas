import MarketingImage from "./MarketingImage";

/** Card: photo left, readable content right */
export default function MediaTextCard({
  image,
  alt,
  children,
  className = "",
  imageClassName = "",
}) {
  return (
    <div
      className={`flex overflow-hidden bg-white border border-border min-h-[156px] ${className}`}
    >
      <div className="relative w-[120px] sm:w-[140px] shrink-0 bg-[#e8eeec]">
        <MarketingImage
          src={image}
          alt={alt}
          className={`h-full w-full object-cover object-center ${imageClassName}`}
          width={280}
          height={320}
          loading="lazy"
          sizes="140px"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center bg-[#fafbfc] p-4 sm:p-5 min-w-0 border-l border-border">
        {children}
      </div>
    </div>
  );
}
