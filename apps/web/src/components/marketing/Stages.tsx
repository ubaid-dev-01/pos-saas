/** High-fidelity product stages — denser, more realistic POS UI */

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

export function CheckoutStage() {
  const products = [
    { n: "Nestle Milk 1L", p: "320", sku: "890123", on: true, tone: "#6b8cae" },
    { n: "Tapal Tea 475g", p: "890", sku: "890441", on: false, tone: "#8a6b4a" },
    { n: "Surf Excel 2kg", p: "1,150", sku: "890772", on: false, tone: "#3d6b9a" },
    { n: "Olper Cream", p: "180", sku: "890019", on: true, tone: "#c4a574" },
    { n: "Lux Soap 3pk", p: "245", sku: "890301", on: false, tone: "#b87a8c" },
    { n: "Dalda Oil 5L", p: "2,480", sku: "890558", on: false, tone: "#d4a84b" },
  ];

  return (
    <div className="min-h-[320px]">
      <Chrome title="quickpos.app / pos" meta="LIVE" />
      <div className="grid sm:grid-cols-[1.4fr_1fr]">
        <div className="border-b border-line p-3 sm:border-b-0 sm:border-r sm:p-4">
          <div className="mb-3 flex h-10 items-center gap-2 rounded-md border border-line bg-paper px-3 shadow-[inset_0_1px_2px_rgba(11,31,58,0.04)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="flex-1 font-mono text-xs text-muted">
              Scan barcode or search…
            </span>
            <span className="rounded-sm border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">
              ⌘K
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {products.map((i) => (
              <div
                key={i.n}
                className={`flex gap-2 rounded-md border p-2 transition-colors ${
                  i.on
                    ? "border-signal/50 bg-accent-soft ring-1 ring-signal/20"
                    : "border-line bg-surface"
                }`}
              >
                <Swatch label={i.sku.slice(-3)} tone={i.tone} />
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium leading-tight text-ink">
                    {i.n}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted">
                    {i.sku}
                  </p>
                  <p className="mt-1 font-mono text-[12px] font-semibold text-ink">
                    Rs {i.p}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-[#fafbfd] p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Cart · Walk-in
            </p>
            <p className="font-mono text-[10px] text-muted">2 lines</p>
          </div>
          <div className="mt-3 flex-1 space-y-0">
            {[
              { n: "Nestle Milk 1L", q: 2, p: "640" },
              { n: "Olper Cream", q: 1, p: "180" },
            ].map((line) => (
              <div
                key={line.n}
                className="flex items-start justify-between gap-2 border-b border-line/70 py-2.5 text-[13px]"
              >
                <div>
                  <p className="font-medium text-ink">{line.n}</p>
                  <p className="font-mono text-[11px] text-muted">× {line.q}</p>
                </div>
                <span className="font-mono font-medium">Rs {line.p}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[12px] text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">Rs 820</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-mono">Included</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-mono text-2xl font-semibold tracking-tight">
              Rs 820
            </span>
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-3 h-11 rounded-md bg-ink text-sm font-medium text-paper"
          >
            Charge · Cash
          </button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <span className="rounded-md border border-line py-2 text-center text-[11px] font-medium text-muted">
              Card
            </span>
            <span className="rounded-md border border-line py-2 text-center text-[11px] font-medium text-muted">
              Split
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InventoryStage() {
  const rows = [
    { sku: "MLK-01", name: "Nestle Milk 1L", qty: 42, ok: true, tone: "#6b8cae" },
    { sku: "OIL-05", name: "Dalda Oil 5L", qty: 8, ok: false, tone: "#d4a84b" },
    { sku: "TEA-47", name: "Tapal Tea 475g", qty: 61, ok: true, tone: "#8a6b4a" },
    { sku: "SOAP-3", name: "Lux Soap 3pk", qty: 3, ok: false, tone: "#b87a8c" },
    { sku: "CRM-02", name: "Olper Cream", qty: 27, ok: true, tone: "#c4a574" },
  ];
  return (
    <div className="min-h-[300px]">
      <Chrome title="quickpos.app / inventory" meta="SYNCED" />
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="text-sm font-medium">Stock ledger</p>
        <p className="font-mono text-[11px] text-muted">5 SKUs · 2 low</p>
      </div>
      <div>
        <div className="grid grid-cols-[40px_64px_1fr_52px_72px] gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          <span />
          <span>SKU</span>
          <span>Product</span>
          <span className="text-right">Qty</span>
          <span>Status</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.sku}
            className="grid grid-cols-[40px_64px_1fr_52px_72px] items-center gap-2 border-t border-line px-3 py-2.5 text-sm"
          >
            <Swatch label="" tone={r.tone} />
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
              {r.ok ? "In stock" : "Low"}
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
            Hassan General Store
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted">
            Multan · NTN 1234567-8
          </p>
          <p className="mt-3 font-mono text-[10px] text-muted">
            INV-48291 · 22 Jul 2026 · 14:22
          </p>
        </div>
        <div className="my-4 border-t border-dashed border-ink/20" />
        <div className="space-y-2.5 text-[13px]">
          <div className="flex justify-between gap-3">
            <span>Nestle Milk 1L × 2</span>
            <span className="font-mono">640.00</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Olper Cream × 1</span>
            <span className="font-mono">180.00</span>
          </div>
        </div>
        <div className="my-4 border-t border-dashed border-ink/20" />
        <div className="flex justify-between text-[13px]">
          <span className="text-muted">Subtotal</span>
          <span className="font-mono">820.00</span>
        </div>
        <div className="mt-3 flex justify-between text-[15px] font-semibold">
          <span>Paid · Cash</span>
          <span className="font-mono">Rs 820</span>
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
