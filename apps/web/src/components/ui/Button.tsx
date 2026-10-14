import Link from "next/link";
import { type ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "inverse"
  | "inverseSecondary"
  | "whatsapp";

const styles: Record<Variant, string> = {
  primary: "btn-anim btn-anim--primary",
  secondary: "btn-anim btn-anim--secondary",
  ghost: "btn-anim btn-anim--ghost",
  inverse: "btn-anim btn-anim--inverse",
  inverseSecondary: "btn-anim btn-anim--inverse-secondary",
  whatsapp: "btn-anim btn-anim--whatsapp",
};

const base =
  "btn-anim-base inline-flex h-14 min-w-[9.5rem] items-center justify-center gap-2 px-8 text-[15px] font-semibold no-underline disabled:pointer-events-none disabled:opacity-50";

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  external,
  type = "button",
  ...rest
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  external?: boolean;
  type?: "button" | "submit";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `${base} ${styles[variant]} ${className}`;

  const inner = (
    <>
      <span className="btn-anim-label relative z-[1] inline-flex items-center gap-2">
        {children}
        <svg
          className="btn-anim-arrow h-4 w-4"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="btn-anim-shine" aria-hidden />
      <span className="btn-anim-fill" aria-hidden />
    </>
  );

  if (href) {
    const isAbsolute =
      href.startsWith("http") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:");
    if (external || isAbsolute) {
      return (
        <a
          href={href}
          className={cls}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...rest}>
      {inner}
    </button>
  );
}
