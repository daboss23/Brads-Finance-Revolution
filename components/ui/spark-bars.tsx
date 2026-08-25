import { cn } from "@/lib/utils";

const TONE_FILL: Record<string, string> = {
  gold: "bg-gold/70",
  blue: "bg-blue-accent/70",
  violet: "bg-teal-accent/70",
  emerald: "bg-success/70",
  orange: "bg-warning/70",
};

const HEIGHTS = [
  "h-[10%]",
  "h-[20%]",
  "h-[30%]",
  "h-[40%]",
  "h-[50%]",
  "h-[60%]",
  "h-[70%]",
  "h-[80%]",
  "h-[90%]",
  "h-full",
];

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
        const heightClass = HEIGHTS[Math.min(9, Math.max(0, Math.ceil((v / max) * 10) - 1))];
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-[2px] transition-all",
              heightClass,
              isLast ? TONE_FILL[tone] : "bg-white/[0.08]"
            )}
          />
        );
      })}
    </div>
  );
}
