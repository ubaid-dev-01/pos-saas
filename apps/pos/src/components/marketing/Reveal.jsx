import { useEffect, useRef, useState } from "react";

/**
 * Subtle enter hint only — NEVER hides content.
 * Previous clip-path + opacity:0 left sections blank when IO missed.
 */
export default function Reveal({ children, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }

    // Start visible; only soft-mark when in view (no hide state)
    setOn(true);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);

    // Failsafe: never leave anything hidden
    const failsafe = window.setTimeout(() => setOn(true), 50);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`mkt-reveal ${on ? "is-in" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
