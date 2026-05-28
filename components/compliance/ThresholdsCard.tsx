import { TrendingUp } from "lucide-react";
import type { AtoThreshold } from "@/lib/compliance/knowledge-base";
import { cn } from "@/lib/utils";

interface Props {
  thresholds: AtoThreshold[];
  financialYear: string;
  lastUpdated: string;
}

export function ThresholdsCard({ thresholds, financialYear, lastUpdated }: Props) {
  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border/60 bg-[hsl(224,20%,7%)] flex items-end justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
            ATO Thresholds
          </h2>
          <p className="text-[11px] text-muted-foreground/75 mt-1">
            Financial year {financialYear} · Updated {lastUpdated}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border/40">
        {thresholds.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-6 py-5 bg-card",
              t.changedRecently && "bg-gold/[0.03]"
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/85">
                {t.label}
              </p>
              {t.changedRecently && (
                <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-gold bg-gold/10 border border-gold/30">
                  <TrendingUp className="h-2.5 w-2.5" />
                  Changed
                </span>
              )}
            </div>
            <p className="text-[26px] font-semibold tracking-tight text-foreground tabular-nums mb-2">
              {t.value}
            </p>
            <p className="text-[12px] text-muted-foreground/75 leading-relaxed">
              {t.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
