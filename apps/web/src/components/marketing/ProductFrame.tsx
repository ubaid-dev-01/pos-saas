import Image from "next/image";

/** Clean photo crop — editorial presence without frame costume */
export function ProductFrame({
  src,
  alt,
  priority,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative aspect-[16/10] overflow-hidden bg-inset ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 ease-brand hover:scale-[1.02]"
        sizes="(max-width: 1024px) 100vw, 720px"
        priority={priority}
        quality={90}
      />
    </div>
  );
}
