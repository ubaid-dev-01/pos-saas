import { type ReactNode } from "react";

export function Heading({
  as: Tag = "h2",
  children,
  className = "",
}: {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
}) {
  /* Headlines support visuals — calm, tight, readable */
  const sizes = {
    h1: "font-sans text-[2.1rem] font-semibold tracking-[-0.035em] leading-[1.08] md:text-[2.85rem] lg:text-[3.35rem]",
    h2: "font-sans text-[1.85rem] font-semibold tracking-[-0.03em] leading-[1.12] md:text-[2.35rem]",
    h3: "font-sans text-xl font-semibold tracking-[-0.02em] md:text-2xl",
  };

  return <Tag className={`${sizes[Tag]} ${className}`}>{children}</Tag>;
}
