import type { PublicStage } from "@/server/public-data";

type Tone = "neutral" | "positive" | "attention" | "info" | "negative" | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-navy-100 text-navy-800",
  positive: "bg-emerald-100 text-emerald-800",
  attention: "bg-gold-100 text-gold-700",
  info: "bg-navy-50 text-navy-700 ring-1 ring-inset ring-navy-200",
  negative: "bg-danger-100 text-danger",
  muted: "bg-surface text-muted ring-1 ring-inset ring-line",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.8125rem] font-medium leading-6 ${tones[tone]}`}>{children}</span>;
}

const STAGE_TONE: Record<PublicStage, Tone> = {
  OPEN: "positive",
  RUNNING: "info",
  UPCOMING: "attention",
  COMPLETED: "muted",
  PROPOSED: "neutral",
};

export function StageBadge({ stage, label }: { stage: PublicStage; label: string }) {
  return (
    <Badge tone={STAGE_TONE[stage]}>
      {stage === "OPEN" && <span aria-hidden className="size-1.5 rounded-full bg-emerald-600" />}
      {label}
    </Badge>
  );
}
