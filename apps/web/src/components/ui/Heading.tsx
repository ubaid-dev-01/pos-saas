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
  const sizes = {
    h1: "font-sans text-[2.6rem] font-bold tracking-[-0.035em] leading-[1.06] md:text-[3.35rem] lg:text-[3.85rem]",
    h2: "font-sans text-[2.15rem] font-bold tracking-[-0.03em] leading-[1.1] md:text-[2.75rem] lg:text-[3rem]",
    h3: "font-sans text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]",
  };

  return <Tag className={`${sizes[Tag]} ${className}`}>{children}</Tag>;
}
