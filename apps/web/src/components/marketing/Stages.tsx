/** High-fidelity product stages — restaurant order POS */

import Image from "next/image";

const MENU = [
  {
    n: "Margherita Pizza",
    p: "1,450",
    cat: "Mains",
    on: true,
    img: "/marketing/food/cutout-pizza.png",
  },
  {
    n: "Classic Burger",
    p: "890",
    cat: "Mains",
    on: true,
    img: "/marketing/food/cutout-burger.png",
  },
  {
    n: "Creamy Pasta",
    p: "1,100",
    cat: "Mains",
    on: false,
    img: "/marketing/food/cutout-pasta.png",
  },
  {
    n: "Garden Salad",
    p: "650",
    cat: "Starters",
    on: false,
    img: "/marketing/food/cutout-salad.png",
  },
  {
    n: "Cappuccino",
    p: "420",
    cat: "Drinks",
    on: false,
    img: "/marketing/food/cutout-coffee.png",
  },
  {
    n: "Sushi Platter",
    p: "2,200",
    cat: "Mains",
    on: false,
    img: "/marketing/food/cutout-sushi.png",
  },
] as const;

function Chrome({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-line bg-[#f0f3f7] px-3 py-2">
      <div className="flex gap-1.5" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-[#d8dee8]" />
        <span className="h-2 w-2 rounded-full bg-[#d8dee8]" />
        <span className="h-2 w-2 rounded-full bg-[#d8dee8]" />
      </div>
      <div className="ml-1 flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-mono text-[11px] text-ink/70">{title}</span>
        {meta ? (
          <span className="hidden rounded-sm bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] font-medium text-signal-deep sm:inline">
            {meta}
          </span>
        ) : null}
      </div>
      <span className="font-mono text-[10px] text-muted">14:22</span>
    </div>
  );
}

function Swatch({ label, tone }: { label: string; tone: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-end justify-center rounded-sm pb-0.5 font-mono text-[8px] font-medium text-white/90"
      style={{ background: tone }}
      aria-hidden
    >
      {label}
    </div>
  );
}

export function StageFrame({
  children,
  caption,
  flush,
}: {
  children: React.ReactNode;
  caption?: string;
  flush?: boolean;
}) {
  return (
    <figure className="m-0">
      <div className={flush ? "stage-shell stage-shell--flush" : "stage-shell"}>
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Restaurant order placement — menu grid + live ticket */
export function RestaurantOrderStage() {
  const cats = ["All", "Mains", "Starters", "Drinks", "Dessert"];
  return (
    <div className="min-h-[340px]">
      <Chrome title="quickpos.app / orders" meta="TABLE 12" />
      <div className="grid lg:grid-cols-[1.55fr_1fr]">
        <div className="border-b border-line p-3 sm:border-b-0 sm:border-r sm:p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {cats.map((c, i) => (
              <span
                key={c}
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  i === 0
                    ? "bg-ink text-paper"
                    : "border border-line bg-surface text-muted"
                }`}
              >
                {c}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {MENU.map((item) => (
              <div
                key={item.n}
                className={`overflow-hidden rounded-lg border bg-surface transition-colors ${
                  item.on
                    ? "border-signal/45 ring-1 ring-signal/25"
                    : "border-line"
                }`}
              >
                <div className="relative aspect-square bg-[#f4f6f8]">
                  <Image
                    src={item.img}
                    alt={item.n}
                    fill
                    className="object-contain p-1"
                    sizes="160px"
                  />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-[12px] font-semibold leading-tight text-ink">
                    {item.n}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-muted">
                      {item.cat}
                    </span>
                    <span className="font-mono text-[12px] font-semibold text-ink">
                      Rs {item.p}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col bg-[#fafbfd] p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Order · Dine-in
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">Table 12</p>
            </div>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[10px] font-medium text-signal-deep">
              3 items
            </span>
          </div>
          <div className="mt-3 flex-1 space-y-0">
            {[
              { n: "Margherita Pizza", note: "Extra basil", q: 1, p: "1,450" },
              { n: "Classic Burger", note: "No onion", q: 2, p: "1,780" },
              { n: "Cappuccino", note: "", q: 1, p: "420" },
            ].map((line) => (
              <div
                key={line.n}
                className="flex items-start justify-between gap-2 border-b border-line/70 py-2.5 text-[13px]"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{line.n}</p>
                  <p className="font-mono text-[11px] text-muted">
                    × {line.q}
                    {line.note ? ` · ${line.note}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-mono font-medium">Rs {line.p}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[12px] text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">Rs 3,650</span>
            </div>
            <div className="flex justify-between">
              <span>Service</span>
              <span className="font-mono">Rs 180</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-mono text-2xl font-semibold tracking-tight">
              Rs 3,830
            </span>
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-3 h-11 rounded-md bg-ink text-sm font-medium text-paper"
          >
            Place order · Send to kitchen
          </button>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["Hold", "Pay later", "Bill"].map((a) => (
              <span
                key={a}
                className="rounded-md border border-line py-2 text-center text-[11px] font-medium text-muted"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutStage() {
  return <RestaurantOrderStage />;
}

export function InventoryStage() {
  const rows = [
    {
      sku: "PZ-01",
      name: "Pizza dough (batch)",
      qty: 42,
      ok: true,
      img: "/marketing/food/cutout-pizza.png",
    },
    {
      sku: "BF-02",
      name: "Beef patties",
      qty: 8,
      ok: false,
      img: "/marketing/food/cutout-burger.png",
    },
    {
      sku: "PS-03",
      name: "Pasta shells",
      qty: 61,
      ok: true,
      img: "/marketing/food/cutout-pasta.png",
    },
    {
      sku: "SL-04",
      name: "Salad greens",
      qty: 3,
      ok: false,
      img: "/marketing/food/cutout-salad.png",
    },
    {
      sku: "CF-05",
      name: "Coffee beans 1kg",
      qty: 27,
      ok: true,
      img: "/marketing/food/cutout-coffee.png",
    },
  ];
  return (
    <div className="min-h-[300px]">
      <Chrome title="quickpos.app / kitchen-stock" meta="SYNCED" />
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="text-sm font-medium">Kitchen stock</p>
        <p className="font-mono text-[11px] text-muted">5 items · 2 low</p>
      </div>
      <div>
        <div className="grid grid-cols-[44px_64px_1fr_52px_72px] gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          <span />
          <span>SKU</span>
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span>Status</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.sku}
            className="grid grid-cols-[44px_64px_1fr_52px_72px] items-center gap-2 border-t border-line px-3 py-2.5 text-sm"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[#f0f3f7]">
              <Image src={r.img} alt="" fill className="object-cover" sizes="36px" />
            </div>
            <span className="font-mono text-[11px] text-muted">{r.sku}</span>
            <span className="truncate text-[13px]">{r.name}</span>
            <span className="text-right font-mono text-xs font-medium">{r.qty}</span>
            <span
              className={`w-fit rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${
                r.ok
                  ? "bg-accent-soft text-signal-deep"
                  : "bg-[#fff4e0] text-[#b86e00]"
              }`}
            >
              {r.ok ? "Ready" : "Low"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReceiptStage() {
  return (
    <div className="receipt-stage-well flex justify-center px-2 py-10 sm:py-12">
      <div className="receipt-paper relative w-full max-w-[280px] border border-line bg-surface px-6 py-7 text-ink">
        <div className="text-center">
          <p className="text-[15px] font-semibold tracking-tight">
            Spice Garden Café
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted">
            Multan · Table 12 · Dine-in
          </p>
          <p className="mt-3 font-mono text-[10px] text-muted">
            ORD-48291 · 14 Oct 2026 · 14:22
          </p>
        </div>
        <div className="my-4 border-t border-dashed border-ink/20" />
        <div className="space-y-2.5 text-[13px]">
          <div className="flex justify-between gap-3">
            <span>Margherita Pizza × 1</span>
            <span className="font-mono">1,450</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Classic Burger × 2</span>
            <span className="font-mono">1,780</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Cappuccino × 1</span>
            <span className="font-mono">420</span>
          </div>
        </div>
        <div className="my-4 border-t border-dashed border-ink/20" />
        <div className="flex justify-between text-[13px]">
          <span className="text-muted">Subtotal</span>
          <span className="font-mono">3,650</span>
        </div>
        <div className="mt-3 flex justify-between text-[15px] font-semibold">
          <span>Paid · Card</span>
          <span className="font-mono">Rs 3,830</span>
        </div>
        <div className="mt-6 flex justify-center gap-5 border-t border-ink/10 pt-4 text-[11px] font-medium text-muted">
          <span>Print</span>
          <span className="text-signal-deep">WhatsApp</span>
          <span>Email</span>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsStage() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const bars = [
    { h: 38, v: "42k" },
    { h: 55, v: "61k" },
    { h: 42, v: "48k" },
    { h: 70, v: "78k" },
    { h: 52, v: "55k" },
    { h: 88, v: "96k" },
    { h: 64, v: "72k" },
  ];
  return (
    <div className="min-h-[300px]">
      <Chrome title="quickpos.app / reports" meta="WEEK" />
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Sales", v: "Rs 4,82,450", d: "+18%" },
            { l: "Avg ticket", v: "Rs 615", d: "+4%" },
            { l: "Tickets", v: "784", d: "+12%" },
          ].map((m) => (
            <div key={m.l} className="rounded-md border border-line bg-paper p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                {m.l}
              </p>
              <p className="mt-1.5 font-mono text-base font-semibold tracking-tight sm:text-lg">
                {m.v}
              </p>
              <p className="mt-1 font-mono text-[11px] text-signal-deep">{m.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-md border border-line bg-paper p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Daily sales</p>
            <p className="font-mono text-[10px] text-muted">This week</p>
          </div>
          <div className="mt-4 flex h-32 items-end gap-2 sm:gap-3" aria-hidden>
            {bars.map((b, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="chart-bar w-full rounded-sm bg-gradient-to-t from-ink to-signal/70"
                  style={{
                    height: `${b.h}%`,
                    minHeight: 8,
                    animationDelay: `${i * 70}ms`,
                  }}
                />
                <span className="font-mono text-[10px] text-muted">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
