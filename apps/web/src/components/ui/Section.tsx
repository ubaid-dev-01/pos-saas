import { type ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  children,
  className = "",
  id,
  dark,
  tone,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
  tone?: "paper" | "surface" | "ink" | "inset";
}) {
  const resolved = dark ? "ink" : tone || "paper";
  const tones = {
    paper: "bg-transparent text-ink",
    surface: "bg-surface/80 text-ink",
    inset: "atmosphere-inset text-ink",
    ink: "atmosphere-ink text-paper",
  };

  return (
    <section
      id={id}
      className={`py-24 md:py-32 ${tones[resolved]} ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}
