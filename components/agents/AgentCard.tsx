import Link from "next/link";
import { ArrowRight, AlertTriangle, User, Crown } from "lucide-react";
import {
  Agent,
  AgentTone,
  STATUS_META,
  PRIORITY_META,
  getAgentLinkedClientName,
} from "@/lib/agents";
import { SparkBars } from "@/components/ui/spark-bars";
import { cn } from "@/lib/utils";

const TONE: Record<
  AgentTone,
  { text: string; soft: string; ring: string; fill: string; edge: string; glow: string }
> = {
  blue: {
    text: "text-blue-accent",
    soft: "bg-blue-accent/12",
    ring: "border-blue-accent/30",
    fill: "bg-blue-accent/70",
    edge: "edge-blue",
    glow: "from-blue-accent/60",
  },
  orange: {
    text: "text-warning",
    soft: "bg-warning/[0.12]",
    ring: "border-warning/30",
    fill: "bg-warning/70",
    edge: "edge-orange",
    glow: "from-warning/60",
  },
  gold: {
    text: "text-gold",
    soft: "bg-gold/12",
    ring: "border-gold/30",
    fill: "bg-gold/70",
    edge: "edge-gold",
    glow: "from-gold/60",
  },
  emerald: {
    text: "text-success",
    soft: "bg-success/[0.12]",
    ring: "border-success/30",
    fill: "bg-success/70",
    edge: "edge-emerald",
    glow: "from-success/60",
  },
  violet: {
    text: "text-teal-accent",
    soft: "bg-teal-accent/[0.12]",
    ring: "border-teal-accent/30",
    fill: "bg-teal-accent/70",
    edge: "edge-teal",
    glow: "from-teal-accent/60",
  },
};

export function AgentCard({ agent, featured = false }: { agent: Agent; featured?: boolean }) {
  const status = STATUS_META[agent.status];
  const priority = PRIORITY_META[agent.priority];
  const tone = TONE[agent.tone];
  const clientName = getAgentLinkedClientName(agent);

  return (
    <div
      className={cn(
        "group glass-panel glass-hover relative flex flex-col overflow-hidden",
        featured && tone.edge
      )}
    >
      {/* Accent top rail */}
      <div className={cn("h-[3px] bg-gradient-to-r to-transparent", tone.glow)} />

      {/* Featured badge for the final SOA synthesis agent */}
      {featured && (
        <div className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.08] px-2.5 py-1">
          <Crown className="h-3 w-3 text-gold" />
          <span className="cmd-label text-gold/90">Final SOA Assembly</span>
        </div>
      )}

      <div className="relative flex flex-1 flex-col px-7 pt-7 pb-6">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-xl border",
              tone.soft,
              tone.ring
            )}
          >
            <span className={cn("text-[14px] font-bold tracking-tight", tone.text)}>
              {agent.name.slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[19px] font-semibold tracking-tight text-foreground leading-none">
                {agent.name}
              </h3>
              <span className="cmd-label text-muted-foreground/45">
                {agent.flowStep === null ? "PL" : String(agent.flowStep).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground/75 tracking-tight">
              {agent.role}
            </p>
          </div>
          {!featured && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1",
                status.bg,
                status.ring
              )}
            >
              <span className={cn("status-live h-1.5 w-1.5 rounded-full", status.dot, status.text)} />
              <span className={cn("cmd-label", status.text)}>{status.label}</span>
            </span>
          )}
        </div>

        {/* Callsign */}
        <p className="mb-6 text-[13px] italic text-muted-foreground/65 leading-relaxed tracking-tight">
          &ldquo;{agent.callsign}&rdquo;
        </p>

        {/* Telemetry row */}
        <div className="mb-6 grid grid-cols-[1fr_auto] items-end gap-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="cmd-label text-muted-foreground/55">Workload</p>
              <p className="text-[12px] font-semibold text-foreground/85 tabular-nums">
                {agent.workload}%
              </p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className={cn("h-full rounded-full", tone.fill, workloadWidth(agent.workload))}
              />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Stat label="Queue" value={agent.queueDepth} />
              <Stat label="Cleared" value={agent.completedToday} />
              <Stat label="Confidence" value={`${agent.confidence}%`} accent={tone.text} />
            </div>
          </div>
          <SparkBars data={agent.throughput} tone={agent.tone} className="w-24" />
        </div>

        {/* Active task */}
        <div className="mb-4">
          <p className="cmd-label mb-1.5 text-muted-foreground/55">Active Task</p>
          <p className="text-[13.5px] text-foreground/85 leading-relaxed tracking-tight">
            {agent.activeTask}
          </p>
        </div>

        {/* Blocked */}
        {agent.blockedItem && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning/[0.06] px-3.5 py-2.5">
            <AlertTriangle className="mt-[1px] h-3.5 w-3.5 shrink-0 text-warning" />
            <p className="text-[12.5px] leading-relaxed tracking-tight text-warning/90">
              {agent.blockedItem}
            </p>
          </div>
        )}

        {/* Meta chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 cmd-label",
              priority.bg,
              priority.border,
              priority.text
            )}
          >
            {priority.label} priority
          </span>
          {clientName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium tracking-tight text-muted-foreground/85">
              <User className="h-3 w-3" />
              {clientName}
            </span>
          )}
        </div>

        {/* Next action */}
        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <p className="cmd-label mb-1.5 text-gold/80">Suggested Next Action</p>
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] leading-relaxed tracking-tight text-foreground/80">
              {agent.nextAction}
            </p>
            {agent.linkedClientId && (
              <Link
                href={`/clients/${agent.linkedClientId}`}
                className="mt-0.5 shrink-0 text-muted-foreground/50 transition-colors hover:text-gold"
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

function workloadWidth(value: number) {
  if (value >= 95) return "w-full";
  if (value >= 85) return "w-11/12";
  if (value >= 75) return "w-4/5";
  if (value >= 65) return "w-2/3";
  if (value >= 55) return "w-3/5";
  if (value >= 45) return "w-1/2";
  if (value >= 35) return "w-2/5";
  if (value >= 20) return "w-1/4";
  return "w-1/6";
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div>
      <p className={cn("text-[14px] font-semibold tabular-nums leading-none", accent ?? "text-foreground/90")}>
        {value}
      </p>
      <p className="mt-1 cmd-label text-muted-foreground/45">{label}</p>
    </div>
  );
}
