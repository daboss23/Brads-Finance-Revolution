import { TrendingUp, Gauge, AlertOctagon } from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { TelemetryRing } from "@/components/ui/telemetry-ring";
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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {/* Pipeline velocity */}
      <div className="glass-panel glass-hover flex items-center gap-6 px-7 py-6">
        <TelemetryRing value={avgProgress} tone="blue" size={104} stroke={8} />
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-blue-accent" />
            <p className="cmd-label text-muted-foreground/65">Pipeline Velocity</p>
          </div>
          <p className="text-[13px] leading-snug tracking-tight text-foreground/80">
            Average fact find completion across {total} active clients
          </p>
        </div>
      </div>

      {/* Client readiness */}
      <div className="glass-panel glass-hover flex items-center gap-6 px-7 py-6">
        <TelemetryRing
          value={readyPct}
          tone="emerald"
          size={104}
          stroke={8}
          label={`${readyForSoa}/${total}`}
          sublabel="Ready"
        />
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5 text-success" />
            <p className="cmd-label text-muted-foreground/65">Client Readiness</p>
          </div>
          <p className="text-[13px] leading-snug tracking-tight text-foreground/80">
            Files ready to progress toward SOA generation
          </p>
        </div>
      </div>

      {/* Bottleneck */}
      <div className="glass-panel edge-orange px-7 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-3.5 w-3.5 text-warning" />
            <p className="cmd-label text-muted-foreground/65">Bottlenecks</p>
          </div>
          <p className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-orange-200">
            {stalled.length}
          </p>
        </div>
        <ul className="space-y-2.5">
          {stalled.slice(0, 3).map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <span className="truncate text-[12.5px] tracking-tight text-foreground/80">
                {c.name}
              </span>
              <span
                className={cn(
                  "shrink-0 cmd-label",
                  c.status === "review-required" ? "text-warning" : "text-muted-foreground/55"
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
