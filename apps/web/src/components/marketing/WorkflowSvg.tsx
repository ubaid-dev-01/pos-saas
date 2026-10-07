/** Lightweight SVG workflow diagram. */
export function WorkflowSvg() {
  return (
    <svg
      viewBox="0 0 640 120"
      className="h-auto w-full text-signal"
      role="img"
      aria-label="Sale to stock to customer to report workflow"
    >
      {[
        { x: 40, label: "Sale" },
        { x: 200, label: "Stock" },
        { x: 360, label: "Customer" },
        { x: 520, label: "Report" },
      ].map((node, i) => (
        <g key={node.label}>
          <circle
            cx={node.x}
            cy={50}
            r={22}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x={node.x}
            y={96}
            textAnchor="middle"
            fill="#07131F"
            style={{ fontSize: 12, fontFamily: "IBM Plex Sans, sans-serif" }}
          >
            {node.label}
          </text>
          {i < 3 ? (
            <line
              x1={node.x + 28}
              y1={50}
              x2={node.x + 132}
              y2={50}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity={0.7}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}
