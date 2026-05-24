import { cn } from "@/lib/utils";

interface Props {
  percentage: number;
  missingSections?: string[];
  source: "sarah" | "manual";
}

export function CompletionBar({ percentage, missingSections, source }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(percentage)));
  return (
    <div className="mb-8 rounded-lg border border-border bg-card px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground/55">
            Fact Find Completion
          </p>
          <p className="text-[12px] text-muted-foreground/60 mt-0.5">
            {source === "sarah"
              ? "Collected by Sarah during Financial Discovery Session"
              : "Awaiting Sarah completion"}
          </p>
        </div>
        <span className="text-[22px] font-semibold text-foreground tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 80
              ? "bg-emerald-500/80"
              : pct >= 40
                ? "bg-amber-500/80"
                : "bg-red-500/80",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {missingSections && missingSections.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/55">
            Sarah flagged
          </span>
          {missingSections.map((s) => (
            <span
              key={s}
              className="text-[11px] text-amber-300/85 bg-amber-500/10 border border-amber-500/25 rounded px-2 py-0.5"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
