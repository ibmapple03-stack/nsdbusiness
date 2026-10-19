import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  info: "border-navy-200 bg-navy-50 text-navy-900",
  success: "border-emerald-600/30 bg-emerald-100 text-emerald-800",
  warning: "border-gold-500/50 bg-gold-100 text-[#4d3700]",
  danger: "border-danger/30 bg-danger-100 text-danger",
};

export function Alert({ tone = "info", title, children, className = "" }: { tone?: Tone; title: string; children?: ReactNode; className?: string }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`mb-6 rounded-[var(--radius-md)] border px-4 py-3 ${tones[tone]} ${className}`}>
      <p className="font-display font-semibold">{title}</p>
      {children && <div className="mt-1 text-[0.9375rem] leading-relaxed">{children}</div>}
    </div>
  );
}
