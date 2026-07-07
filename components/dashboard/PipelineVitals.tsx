import { TrendingUp, Gauge, AlertOctagon } from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PipelineVitals() {
  const total = CLIENTS.length;
  const avgProgress = Math.round(
    CLIENTS.reduce((s, c) => s + c.progress, 0) / total
  );
  const readyForSoa = CLIENTS.filter(
    (c) => c.status === "ready-for-meeting" || c.status === "complete"
  ).length;
  const readyPct = Math.round((readyForSoa / total) * 100);
  const stalled = CLIENTS.filter(
    (c) => c.status === "link-sent" || c.status === "review-required"
  );

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* Pipeline velocity */}
      <div className="rounded-xl border border-border/70 bg-card px-7 py-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-accent/12">
            <TrendingUp className="h-[14px] w-[14px] text-blue-accent" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            Pipeline Velocity
          </p>
        </div>
        <p className="text-[40px] font-semibold tracking-tight text-foreground leading-none tabular-nums mb-2">
          {avgProgress}
          <span className="text-[22px] text-muted-foreground/60">%</span>
        </p>
        <p className="text-[12px] text-muted-foreground/70 tracking-tight">
          Average fact find completion across {total} active clients
        </p>
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-blue-accent/70"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>

      {/* Client readiness */}
      <div className="rounded-xl border border-border/70 bg-card px-7 py-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/12">
            <Gauge className="h-[14px] w-[14px] text-emerald-300" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            Client Readiness
          </p>
        </div>
        <p className="text-[40px] font-semibold tracking-tight text-foreground leading-none tabular-nums mb-2">
          {readyForSoa}
          <span className="text-[22px] text-muted-foreground/60">/{total}</span>
        </p>
        <p className="text-[12px] text-muted-foreground/70 tracking-tight">
          Files ready to progress toward SOA generation
        </p>
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-emerald-500/70"
            style={{ width: `${readyPct}%` }}
          />
        </div>
      </div>

      {/* Bottleneck */}
      <div className="rounded-xl border border-orange-500/25 bg-card px-7 py-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/12">
            <AlertOctagon className="h-[14px] w-[14px] text-orange-300" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            Bottlenecks
          </p>
        </div>
        <p className="text-[40px] font-semibold tracking-tight text-foreground leading-none tabular-nums mb-4">
          {stalled.length}
        </p>
        <ul className="space-y-2">
          {stalled.slice(0, 3).map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] text-foreground/80 tracking-tight truncate">
                {c.name}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em]",
                  c.status === "review-required" ? "text-orange-300" : "text-muted-foreground/60"
                )}
              >
                {c.status === "review-required" ? "Review" : "Not started"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
