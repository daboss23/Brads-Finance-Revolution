import Link from "next/link";
import { ArrowRight, AlertTriangle, User } from "lucide-react";
import {
  Agent,
  STATUS_META,
  PRIORITY_META,
  getAgentLinkedClientName,
} from "@/lib/agents";
import { cn } from "@/lib/utils";

const AGENT_ACCENT: Record<string, string> = {
  nova: "from-blue-accent/60",
  vanta: "from-orange-400/60",
  orion: "from-gold/60",
  pulse: "from-emerald-400/60",
};

const AGENT_MONO: Record<
  string,
  { text: string; bg: string; ring: string; fill: string }
> = {
  nova: { text: "text-blue-accent", bg: "bg-blue-accent/12", ring: "border-blue-accent/30", fill: "bg-blue-accent/70" },
  vanta: { text: "text-orange-300", bg: "bg-orange-500/12", ring: "border-orange-500/30", fill: "bg-orange-500/70" },
  orion: { text: "text-gold", bg: "bg-gold/12", ring: "border-gold/30", fill: "bg-gold/70" },
  pulse: { text: "text-emerald-300", bg: "bg-emerald-500/12", ring: "border-emerald-500/30", fill: "bg-emerald-500/70" },
};

export function AgentCard({ agent }: { agent: Agent }) {
  const status = STATUS_META[agent.status];
  const priority = PRIORITY_META[agent.priority];
  const mono = AGENT_MONO[agent.id];
  const clientName = getAgentLinkedClientName(agent);

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/70 bg-card overflow-hidden transition-colors hover:border-border">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", AGENT_ACCENT[agent.id])} />

      <div className="px-7 pt-7 pb-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                mono.bg,
                mono.ring
              )}
            >
              <span className={cn("text-[13px] font-bold tracking-tight", mono.text)}>
                {agent.name.slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold tracking-tight text-foreground leading-none">
                {agent.name}
              </h3>
              <p className="mt-1.5 text-[12px] text-muted-foreground/75 tracking-tight">
                {agent.role}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em]",
              status.bg,
              status.ring,
              status.text
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        {/* Workload rail */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Workload
            </p>
            <p className="text-[12px] font-semibold text-foreground/85 tabular-nums">
              {agent.workload}%
            </p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className={cn("h-full rounded-full", mono.fill)}
              style={{ width: `${agent.workload}%` }}
            />
          </div>
        </div>

        {/* Active task */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
            Active Task
          </p>
          <p className="text-[13.5px] text-foreground/85 leading-relaxed tracking-tight">
            {agent.activeTask}
          </p>
        </div>

        {/* Blocked */}
        {agent.blockedItem && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-orange-500/25 bg-orange-500/[0.06] px-3.5 py-2.5">
            <AlertTriangle className="mt-[1px] h-3.5 w-3.5 shrink-0 text-orange-300" />
            <p className="text-[12.5px] text-orange-200/90 leading-relaxed tracking-tight">
              {agent.blockedItem}
            </p>
          </div>
        )}

        {/* Meta row */}
        <div className="mb-6 flex items-center gap-2.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]",
              priority.bg,
              priority.border,
              priority.text
            )}
          >
            {priority.label} priority
          </span>
          {clientName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground/85 tracking-tight">
              <User className="h-3 w-3" />
              {clientName}
            </span>
          )}
        </div>

        {/* Next action */}
        <div className="mt-auto border-t border-border/55 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80 mb-1.5">
            Suggested Next Action
          </p>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] text-foreground/80 leading-relaxed tracking-tight">
              {agent.nextAction}
            </p>
            {agent.linkedClientId && (
              <Link
                href={`/clients/${agent.linkedClientId}`}
                className="mt-0.5 shrink-0 text-muted-foreground/60 hover:text-gold transition-colors"
                aria-label={`Open ${clientName ?? "client"}`}
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
