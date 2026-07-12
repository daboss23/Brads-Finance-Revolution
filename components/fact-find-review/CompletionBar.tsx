import { cn } from "@/lib/utils";

interface Props {
  percentage: number;
  missingSections?: string[];
  source: "sarah" | "manual";
}

export function CompletionBar({ percentage, missingSections, source }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(percentage)));
  return (
    <div className="mb-8 rounded-lg glass-card px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
            Fact Find Completion
          </p>
          <p className="text-[13px] text-muted-foreground/90 mt-1">
            {source === "sarah"
              ? "Collected by Sarah during Financial Discovery Session"
              : "Awaiting Sarah completion"}
          </p>
        </div>
        <span className="text-[22px] font-semibold text-foreground tabular-nums">
          {pct}%
        </span>
      </div>
      <progress
        value={pct}
        max={100}
        aria-label={`Fact find ${pct}% complete`}
        className={cn(
          "bmk-progress w-full",
          pct >= 80
            ? "bmk-progress-emerald"
            : pct >= 40
              ? "bmk-progress-amber"
              : "bmk-progress-blue",
        )}
      />
      {missingSections && missingSections.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
            Sarah flagged
          </span>
          {missingSections.map((s) => (
            <span
              key={s}
              className="text-[12px] text-warning bg-warning/10 border border-warning/30 rounded px-2 py-0.5"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
