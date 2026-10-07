"use client";

import { useState } from "react";
import { ProductFrame } from "./ProductFrame";

const tabs = [
  {
    id: "pos",
    label: "Checkout",
    src: "/marketing/snapshot-checkout.webp",
    alt: "QuickPOS checkout on the retail floor",
  },
  {
    id: "inventory",
    label: "Inventory",
    src: "/marketing/snapshot-inventory.webp",
    alt: "Inventory visibility for store staff",
  },
  {
    id: "reports",
    label: "Reports",
    src: "/marketing/showcase-analytics.webp",
    alt: "Owner reviewing sales analytics",
  },
] as const;

export function ProductStage() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("pos");
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Product areas">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`min-h-11 border px-4 text-sm font-semibold ${
              active === tab.id
                ? "border-ink bg-surface text-ink"
                : "border-transparent text-muted"
            }`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6" role="tabpanel">
        <ProductFrame src={current.src} alt={current.alt} />
      </div>
    </div>
  );
}
