import { cn } from "@/lib/utils";

type RingTone = "gold" | "blue" | "violet" | "emerald" | "orange";

const TONE_STOPS: Record<RingTone, [string, string]> = {
  gold: ["hsl(45 80% 66%)", "hsl(38 70% 48%)"],
  blue: ["hsl(200 90% 70%)", "hsl(220 82% 58%)"],
  violet: ["hsl(268 78% 72%)", "hsl(244 78% 60%)"],
  emerald: ["hsl(158 70% 58%)", "hsl(172 70% 44%)"],
  orange: ["hsl(30 92% 64%)", "hsl(14 84% 54%)"],
};

/**
 * Frameless telemetry ring — SVG donut with a soft gradient sweep.
 * Used across the command centre for readiness / completion indicators.
 */
export function TelemetryRing({
  value,
  size = 132,
  stroke = 9,
  tone = "gold",
  label,
  sublabel,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: RingTone;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const gid = `ring-${tone}-${size}-${Math.round(pct)}`;
  const [from, to] = TONE_STOPS[tone];
  const sizeClass = size === 104 ? "size-[104px]" : "size-[132px]";

  return (
    <div className={cn("relative inline-grid place-items-center", sizeClass, className)}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(220 20% 40% / 0.14)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {label !== undefined ? (
          <div>
            <p className="text-[26px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
              {label}
            </p>
            {sublabel && (
              <p className="mt-1.5 cmd-label text-muted-foreground/55">{sublabel}</p>
            )}
          </div>
        ) : (
          <p className="text-[26px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
            {Math.round(pct)}
            <span className="text-[15px] text-muted-foreground/55">%</span>
          </p>
        )}
      </div>
    </div>
  );
}
