import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "6px",
      md: "8px",
      lg: "12px",
      xl: "12px",
      "2xl": "12px",
      full: "9999px",
    },
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        paper: "var(--paper)",
        "paper-deep": "var(--paper-deep)",
        surface: "var(--surface)",
        inset: "var(--inset)",
        signal: "var(--signal)",
        "signal-deep": "var(--signal-deep)",
        "accent-soft": "var(--accent-soft)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        muted: "var(--muted)",
        warm: "var(--warm)",
        whatsapp: "#0E7C77",
      },
      fontFamily: {
        /* One grotesque + mono — Syne removed (costume display) */
        display: ["var(--font-plex)", "system-ui", "sans-serif"],
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1120px",
        measure: "36rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 31, 58, 0.04)",
        stage: "0 12px 32px rgba(11, 31, 58, 0.1), 0 2px 6px rgba(11, 31, 58, 0.06)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
        40: "10rem",
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
