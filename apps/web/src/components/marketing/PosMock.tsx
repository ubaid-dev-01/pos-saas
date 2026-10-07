/** High-fidelity POS UI mock derived from product structure (not stock art). */
export function PosMock({ className = "" }: { className?: string }) {
  const items = [
    { name: "Nestle Milk 1L", qty: 2, price: "360" },
    { name: "Tapal Danedar 900g", qty: 1, price: "1,250" },
    { name: "Surf Excel 2kg", qty: 1, price: "1,890" },
  ];

  return (
    <div
      className={`overflow-hidden border border-line bg-surface shadow-soft ${className}`}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Floor · Counter 1
          </p>
          <p className="font-display text-lg font-bold">QuickPOS Checkout</p>
        </div>
        <span className="bg-signal/10 px-2 py-1 font-mono text-xs font-semibold text-signal-deep">
          LIVE
        </span>
      </div>
      <div className="grid md:grid-cols-[1.2fr_0.8fr]">
        <div className="border-b border-line p-4 md:border-b-0 md:border-r">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {["Grocery", "Beverages", "Household"].map((c) => (
              <div
                key={c}
                className="border border-line bg-paper px-2 py-3 text-center text-xs font-semibold"
              >
                {c}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between border border-line px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="font-mono text-xs text-muted">Qty {item.qty}</p>
                </div>
                <p className="font-mono text-sm font-semibold">Rs {item.price}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-ink p-4 text-paper">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/60">
            Ticket
          </p>
          <p className="mt-2 font-display text-3xl font-bold">Rs 3,500</p>
          <p className="mt-1 text-sm text-paper/70">3 lines · GST included</p>
          <div className="mt-6 space-y-2">
            <div className="bg-signal px-3 py-3 text-center text-sm font-semibold text-white">
              Charge · Cash / Card
            </div>
            <div className="border border-paper/20 px-3 py-3 text-center text-sm font-semibold">
              WhatsApp receipt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
