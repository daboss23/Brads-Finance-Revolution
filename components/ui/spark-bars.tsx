import { cn } from "@/lib/utils";

const TONE_FILL: Record<string, string> = {
  gold: "bg-gold/70",
  blue: "bg-blue-accent/70",
  violet: "bg-[hsl(268_70%_66%)]/70",
  emerald: "bg-emerald-400/70",
  orange: "bg-orange-400/70",
};

/** Compact telemetry bars — a lightweight in-house sparkline, no chart lib. */
export function SparkBars({
  data,
  tone = "gold",
  className,
}: {
  data: number[];
  tone?: keyof typeof TONE_FILL;
  className?: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className={cn("flex items-end gap-[3px] h-10", className)}>
      {data.map((v, i) => {
        const h = Math.max(8, Math.round((v / max) * 100));
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-[2px] transition-all",
              isLast ? TONE_FILL[tone] : "bg-white/[0.08]"
            )}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}
