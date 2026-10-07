"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

export function Accordion({
  items,
}: {
  items: readonly { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-btn-${i}`;
        return (
          <div key={item.q} className="transition-colors hover:bg-paper/40">
            <h3 className="text-base font-semibold">
              <button
                type="button"
                id={buttonId}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-semibold tracking-[-0.01em]"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ease-brand ${isOpen ? "rotate-180 text-signal-deep" : ""}`}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
            >
              {isOpen ? (
                <p className="pb-5 pr-8 text-sm leading-relaxed text-muted md:text-base">
                  {item.a}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
