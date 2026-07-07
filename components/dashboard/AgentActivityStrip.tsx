import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AGENTS, STATUS_META } from "@/lib/agents";
import { cn } from "@/lib/utils";

const AGENT_FILL: Record<string, string> = {
  nova: "bg-blue-accent/70",
  vanta: "bg-orange-500/70",
  orion: "bg-gold/70",
  pulse: "bg-emerald-500/70",
};

export function AgentActivityStrip() {
  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-7 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/90">
            Agent Activity
          </p>
        </div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/75 hover:text-gold transition-colors tracking-tight"
        >
          Open command centre
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-4 divide-x divide-border/55 border-t border-border/55">
        {AGENTS.map((agent) => {
          const status = STATUS_META[agent.status];
          return (
            <Link
              key={agent.id}
              href="/agents"
              className="group px-6 py-5 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-bold tracking-tight text-foreground">
                  {agent.name}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                    status.text
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                  {status.label}
                </span>
              </div>
              <p className="text-[11.5px] text-muted-foreground/70 leading-snug tracking-tight line-clamp-2 min-h-[30px]">
                {agent.activeTask}
              </p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className={cn("h-full rounded-full", AGENT_FILL[agent.id])}
                  style={{ width: `${agent.workload}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
