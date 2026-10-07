import Link from "next/link";
import { type ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "inverse"
  | "inverseSecondary"
  | "whatsapp";

/** Colors aligned to logo: ink #07131F + signal teal #0E7C77 */
const styles: Record<Variant, string> = {
  inverse:
    "btn-inverse !bg-paper !text-ink hover:!bg-white border border-transparent shadow-soft hover:shadow-stage",
  inverseSecondary:
    "bg-transparent !text-paper border border-paper/35 hover:!bg-paper hover:!text-ink",
  whatsapp:
    "bg-signal !text-paper hover:bg-signal-deep border border-transparent shadow-soft",
  primary:
    "bg-ink !text-paper hover:bg-ink-soft border border-transparent shadow-soft hover:shadow-stage active:translate-y-px",
  secondary:
    "bg-surface/80 !text-ink border border-ink/20 hover:border-ink/45 hover:bg-surface",
  ghost:
    "bg-transparent !text-ink border border-transparent hover:!text-signal-deep",
};

const base =
  "inline-flex h-12 items-center justify-center rounded-md px-6 text-sm font-medium no-underline transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-brand disabled:opacity-50";

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
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
