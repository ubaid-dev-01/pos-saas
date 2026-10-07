/** Single system spine — Sale → Stock → Customer → Report */
export function SystemDiagram() {
  const nodes = [
    { n: "01", label: "Sale", body: "Scan, tender, ticket" },
    { n: "02", label: "Stock", body: "Qty writes back" },
    { n: "03", label: "Customer", body: "History & khata" },
    { n: "04", label: "Report", body: "Owner sees today" },
  ];

  return (
    <div
      className="border-y border-line bg-surface"
      role="img"
      aria-label="Sale updates stock, customer, and report in one flow"
    >
      <div className="mx-auto grid w-full max-w-content md:grid-cols-4">
        {nodes.map((node, i) => (
          <div
            key={node.n}
            className={`group relative px-6 py-12 sm:px-8 ${
              i < nodes.length - 1 ? "md:border-r md:border-line" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-soft font-mono text-[11px] font-semibold text-signal-deep">
                {node.n}
              </span>
              {i < nodes.length - 1 ? (
                <span
                  className="hidden h-px flex-1 bg-gradient-to-r from-signal/50 to-transparent md:block"
                  aria-hidden
                />
              ) : null}
            </div>
            <p className="mt-5 text-lg font-semibold tracking-[-0.02em] text-ink">
              {node.label}
            </p>
            <p className="mt-2 max-w-[18ch] text-sm leading-relaxed text-muted">
              {node.body}
            </p>
            {i < nodes.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-2 top-[3.25rem] z-10 hidden h-4 w-4 items-center justify-center rounded-full border border-line bg-surface text-signal md:flex"
                aria-hidden
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5h6M5.5 2.5 8 5l-2.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
