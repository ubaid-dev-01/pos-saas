import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQAccordion({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = idx === open;
        return (
          <div key={item.q} className="border border-mkt-100 bg-white">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : idx)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-mkt-navy">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 text-mkt-500 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <p className="px-5 pb-4 text-sm leading-relaxed text-mkt-500">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
