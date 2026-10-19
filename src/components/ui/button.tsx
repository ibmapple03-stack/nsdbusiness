import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-display font-semibold tracking-[-0.01em] " +
  "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-spring)] " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-navy-700 text-white shadow-[var(--shadow-raised)] hover:bg-navy-800 hover:-translate-y-px hover:shadow-[var(--shadow-floating)]",
  secondary: "border border-navy-700 bg-paper text-navy-700 hover:bg-navy-50 hover:-translate-y-px",
  quiet: "text-navy-700 underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500 hover:text-navy-900",
  danger: "bg-danger text-white hover:bg-[#912018]",
  inverse: "bg-white text-navy-900 hover:bg-gold-100 hover:-translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-5 text-[0.95rem]",
  lg: "min-h-12 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${variant === "quiet" ? "" : sizes[size]} ${extra}`;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
