"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import type { ImpactLevel, RegulatoryUpdate } from "@/lib/compliance/knowledge-base";
import { cn } from "@/lib/utils";

interface Props {
  updates: RegulatoryUpdate[];
  lastChecked: string;
}

const IMPACT_STYLES: Record<ImpactLevel, string> = {
  critical: "bg-red-500/10 text-red-300 border-red-500/35",
  high: "bg-warning/10 text-warning border-orange-500/35",
  medium: "bg-warning/10 text-warning border-warning/35",
  low: "bg-blue-accent/10 text-blue-accent border-blue-accent/35",
};

export function RegulatoryUpdatesCard({ updates, lastChecked }: Props) {
  const [checkedAt, setCheckedAt] = useState(lastChecked);
  const [refreshing, setRefreshing] = useState(false);

  function refresh() {
    setRefreshing(true);
    setTimeout(() => {
      const now = new Date().toLocaleString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      setCheckedAt(now);
      setRefreshing(false);
    }, 700);
  }

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border/60 bg-black/25 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
            Regulatory Updates
          </h2>
          <p className="text-[11px] text-muted-foreground/75 mt-1">
            Last checked {checkedAt}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground/75 hover:text-foreground hover:border-border/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
          {refreshing ? "Checking…" : "Refresh"}
        </button>
      </div>
      <ul className="divide-y divide-border/40">
        {updates.map((update) => (
          <li key={update.id} className="px-6 py-5">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/85">
                    {update.source}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[11px] text-muted-foreground/70">
                    {update.date}
                  </span>
                </div>
                <h3 className="text-[14px] font-medium text-foreground mb-1.5">
                  {update.title}
                </h3>
                <p className="text-[13px] text-muted-foreground/80 leading-relaxed mb-3">
                  {update.summary}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {update.affectedAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded px-2 py-0.5 text-[11px] text-muted-foreground/85 bg-white/[0.03] border border-border/55"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center rounded px-2.5 py-1 text-[11px] font-medium border tracking-tight uppercase",
                    IMPACT_STYLES[update.impact]
                  )}
                >
                  {update.impact}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-6 py-4 border-t border-border/40 bg-[hsl(224,20%,6%)]">
        <p className="text-[11px] text-muted-foreground/65 inline-flex items-center gap-1.5">
          <ExternalLink className="h-3 w-3" />
          Phase 3 demo data. Future builds will pull from ASIC and ATO live feeds.
        </p>
      </div>
    </section>
  );
}
