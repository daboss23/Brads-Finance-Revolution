import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AGENTS, STATUS_META, AgentTone } from "@/lib/agents";
import { SparkBars } from "@/components/ui/spark-bars";
import { cn } from "@/lib/utils";

const TONE_FILL: Record<AgentTone, string> = {
  blue: "bg-blue-accent/70",
  orange: "bg-warning/70",
  gold: "bg-gold/70",
  emerald: "bg-success/70",
  violet: "bg-teal-accent/70",
};

export function AgentActivityStrip() {
  const cleared = AGENTS.reduce((s, a) => s + a.completedToday, 0);
  const queue = AGENTS.reduce((s, a) => s + a.queueDepth, 0);
  const avgLoad = Math.round(AGENTS.reduce((s, a) => s + a.workload, 0) / AGENTS.length);

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between px-7 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="status-live h-1.5 w-1.5 rounded-full bg-gold text-gold" />
          <p className="cmd-label text-gold/90">Agent Activity</p>
        </div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-muted-foreground/75 transition-colors hover:text-gold"
        >
          Command centre
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Agent tiles */}
      <div className="grid flex-1 grid-cols-1 border-t border-white/[0.06] sm:grid-cols-2">
        {AGENTS.map((agent, i) => {
          const status = STATUS_META[agent.status];
          return (
            <Link
              key={agent.id}
              href="/agents"
              className={cn(
                "group flex flex-col gap-3 px-7 py-5 transition-colors hover:bg-white/[0.02]",
                "border-white/[0.05]",
                i < AGENTS.length - 1 && "border-b sm:border-b",
                i % 2 === 0 && "sm:border-r",
                i >= 2 && "sm:border-b-0"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold tracking-tight text-foreground">
                  {agent.name}
                </span>
                <span className={cn("inline-flex items-center gap-1.5 cmd-label", status.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                  {status.label}
                </span>
              </div>
              <p className="line-clamp-2 min-h-[30px] text-[11.5px] leading-snug tracking-tight text-muted-foreground/70">
                {agent.activeTask}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={cn("h-full rounded-full", TONE_FILL[agent.tone])}
                    style={{ width: `${agent.workload}%` }}
                  />
                </div>
                <SparkBars data={agent.throughput} tone={agent.tone} className="h-5 w-14" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Aggregate footer */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06]">
        <FooterStat label="Fleet Load" value={`${avgLoad}%`} />
        <FooterStat label="In Queue" value={queue} />
        <FooterStat label="Cleared Today" value={cleared} accent />
      </div>
    </div>
  );
}

function FooterStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="px-6 py-4">
      <p className={cn("text-[18px] font-semibold leading-none tabular-nums", accent ? "text-gold" : "text-foreground/90")}>
        {value}
      </p>
      <p className="mt-1.5 cmd-label text-muted-foreground/50">{label}</p>
    </div>
  );
}
