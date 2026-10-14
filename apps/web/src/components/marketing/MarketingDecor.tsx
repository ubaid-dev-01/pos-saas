import Image from "next/image";
import { type ReactNode } from "react";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { Reveal } from "@/components/marketing/Reveal";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { appPath } from "@/lib/site";

/** Four-point amber spark — Bold Brew motif */
export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`spark ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 1.5l1.4 7.1L20.5 10 13.4 11.4 12 18.5l-1.4-7.1L3.5 10l7.1-1.4L12 1.5z" />
    </svg>
  );
}

/** Winding amber SVG paths for editorial sections */
export function AmberPath({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 800 600"
      fill="none"
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        className="path-amber"
        d="M80 80 C180 40, 260 160, 340 200 S520 180, 580 280 S700 420, 720 520"
      />
      <path
        className="path-amber"
        d="M120 520 C220 480, 300 400, 400 360 S560 300, 680 120"
        opacity="0.45"
      />
    </svg>
  );
}

type Corner = "top-right" | "top-left" | "bottom-left" | "bottom-right";

const CORNER_CLASS: Record<Corner, string> = {
  "top-right": "half-cut half-cut--tr",
  "top-left": "half-cut half-cut--tl",
  "bottom-left": "half-cut half-cut--bl",
  "bottom-right": "half-cut half-cut--br",
};

/**
 * Half-cut circle — no ring border. Prefer transparent cutout PNGs.
 * Parent must have overflow-hidden.
 */
export function HalfCutCircle({
  src,
  position = "top-right",
  size = 360,
  className = "",
  zoom = 1.15,
}: {
  src: string;
  position?: Corner;
  size?: number;
  className?: string;
  /** Scale image inside circle for a zoomed crop */
  zoom?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute z-0 overflow-hidden rounded-full border-0 ${CORNER_CLASS[position]} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        quality={90}
        className="object-cover"
        style={{ transform: `scale(${zoom})` }}
        sizes={`${size}px`}
      />
    </div>
  );
}

/** Soft floating transparent PNG — no shadow, no border, no tint */
export function CutoutFloat({
  src,
  alt = "",
  className = "",
  size = 110,
  delay = "0s",
}: {
  src: string;
  alt?: string;
  className?: string;
  size?: number;
  delay?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute z-10 animate-float-soft ${className}`}
      style={{ animationDelay: delay, width: size, height: size }}
      aria-hidden={alt ? undefined : true}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full border-0 bg-transparent object-contain shadow-none"
        sizes={`${size}px`}
      />
    </div>
  );
}

/**
 * Device / product shot — no border box, no shadow, no plate behind.
 */
export function FloatShot({
  src,
  alt,
  className = "",
  priority,
  sizes = "(max-width: 768px) 100vw, 640px",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`relative border-0 bg-transparent shadow-none ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={960}
        priority={priority}
        quality={92}
        className="relative h-auto w-full border-0 bg-transparent object-contain shadow-none"
        sizes={sizes}
      />
    </div>
  );
}

/** Circular media — no amber ring border */
export function CircleMedia({
  src,
  alt,
  className = "",
  sizeClass = "max-w-[380px]",
}: {
  src: string;
  alt: string;
  className?: string;
  sizeClass?: string;
}) {
  return (
    <div
      className={`circle-frame relative mx-auto aspect-square w-full border-0 ${sizeClass} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        quality={90}
        className="object-cover"
        sizes="380px"
      />
    </div>
  );
}

/**
 * Page intro (not home hero): content-matched half-cut circle top-right.
 * Uses transparent cutouts where possible.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  actions,
  visual,
}: {
  crumbs: { name: string; path: string }[];
  eyebrow?: string;
  title: ReactNode;
  lead: string;
  actions?: ReactNode;
  visual?: string;
}) {
  return (
    <section className="atmosphere-hero relative overflow-hidden border-b border-line">
      {visual ? (
        <HalfCutCircle
          src={visual}
          position="top-right"
          size={380}
          zoom={1.2}
          className="hidden sm:block"
        />
      ) : null}
      <div className="relative z-[1] mx-auto w-full max-w-content px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <Breadcrumbs items={crumbs} />
          {eyebrow ? (
            <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-warm">
              {eyebrow}
            </p>
          ) : null}
          <Heading
            as="h1"
            className={eyebrow ? "mt-3 max-w-[16ch]" : "mt-5 max-w-[16ch]"}
          >
            {title}
          </Heading>
          <p className="mt-5 max-w-measure text-xl leading-relaxed text-muted">
            {lead}
          </p>
          {actions ? (
            <div className="mt-9 flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

/** Dark CTA — full-bleed content bg image + soft blur, large corner cutouts */
export function DarkCta({
  title,
  lead,
  primaryHref = appPath("/register"),
  primaryLabel = "Start free",
  secondaryHref = "/contact",
  secondaryLabel = "Contact",
  bgImage = SECTION_BGS.restaurant,
  visualLeft = FOOD_CUTOUTS.burger,
  visualRight = FOOD_CUTOUTS.pizza,
}: {
  title: string;
  lead?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  bgImage?: string;
  visualLeft?: string;
  visualRight?: string;
}) {
  return (
    <section className="dark-cta relative overflow-hidden py-24 text-paper md:py-32">
      <Image
        src={bgImage}
        alt=""
        fill
        quality={90}
        className="object-cover"
        sizes="100vw"
        aria-hidden
      />
      <div className="dark-cta-veil" aria-hidden />

      <HalfCutCircle
        src={visualLeft}
        position="bottom-left"
        size={420}
        zoom={1.25}
        className="hidden md:block"
      />
      <HalfCutCircle
        src={visualRight}
        position="top-right"
        size={440}
        zoom={1.25}
        className="hidden md:block"
      />

      <div className="relative z-[2] mx-auto w-full max-w-content px-4 text-center sm:px-6">
        <Reveal>
          <Heading as="h2" className="mx-auto max-w-[16ch] text-paper">
            {title}
          </Heading>
          {lead ? (
            <p className="mx-auto mt-5 max-w-lg text-lg text-paper/80">{lead}</p>
          ) : null}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={primaryHref} variant="inverse">
              {primaryLabel}
            </Button>
            <Button href={secondaryHref} variant="inverseSecondary">
              {secondaryLabel}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const FOOD_CUTOUTS = {
  pizza: "/marketing/food/cutout-pizza.png",
  burger: "/marketing/food/cutout-burger.png",
  coffee: "/marketing/food/cutout-coffee.png",
  sushi: "/marketing/food/cutout-sushi.png",
  pasta: "/marketing/food/cutout-pasta.png",
  salad: "/marketing/food/cutout-salad.png",
  steak: "/marketing/food/cutout-steak.png",
  dessert: "/marketing/food/cutout-dessert.png",
} as const;

/** Full-bleed section backgrounds (photos) */
export const SECTION_BGS = {
  restaurant: "/marketing/food/restaurant-interior.jpg",
  kitchen: "/marketing/food/kitchen-pass.jpg",
  cafe: "/marketing/lifestyle-cafe.png",
  store: "/marketing/about-store.webp",
} as const;

/**
 * Half-cut / decorative visuals — transparent cutouts only (no photo plate bg).
 */
export const PAGE_VISUALS = {
  features: FOOD_CUTOUTS.pasta,
  pricing: FOOD_CUTOUTS.coffee,
  about: FOOD_CUTOUTS.steak,
  contact: FOOD_CUTOUTS.coffee,
  industries: FOOD_CUTOUTS.pizza,
  kitchen: FOOD_CUTOUTS.pasta,
  burger: FOOD_CUTOUTS.burger,
  pizza: FOOD_CUTOUTS.pizza,
} as const;

export const DEVICE_SHOTS = {
  heroPos: "/marketing/hero-pos-light.png",
  heroDash: "/marketing/hero-pos-dashboard.png",
  phonePay: "/marketing/payment-phone-light.png",
  tabletStock: "/marketing/tablet-inventory-ui.png",
} as const;

/** @deprecated use DEVICE_SHOTS */
export const DEVICE_FLOATS = DEVICE_SHOTS;
