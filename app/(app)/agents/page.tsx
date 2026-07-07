import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Gauge,
  LockKeyhole,
  RadioTower,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  AGENT_FLOW,
  AGENT_SYSTEM_SUMMARY,
  AGENTS,
  ORION_FINAL_SOA_NOTE,
  type AgentPriority,
  type AgentStatus,
} from "@/lib/agents";
import { cn } from "@/lib/utils";

const statusTone: Record<AgentStatus, string> = {
  Active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Monitoring: "border-blue-accent/30 bg-blue-accent/10 text-blue-accent",
  Blocked: "border-amber-400/35 bg-amber-400/10 text-amber-300",
  Ready: "border-gold/35 bg-gold/10 text-gold",
};

const priorityTone: Record<AgentPriority, string> = {
  Low: "text-muted-foreground border-border/70 bg-white/[0.03]",
  Medium: "text-blue-accent border-blue-accent/25 bg-blue-accent/10",
  High: "text-gold border-gold/30 bg-gold/10",
  Critical: "text-orange-300 border-orange-400/35 bg-orange-400/10",
};

export default function AgentsPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 xl:px-14 xl:py-12">
      <header className="mb-8 overflow-hidden rounded-[28px] border border-border/70 bg-[radial-gradient(circle_at_top_left,hsl(var(--gold)/0.18),transparent_34%),linear-gradient(135deg,hsl(var(--card)),hsl(222_30%_6%))] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]">
        <div className="grid gap-8 px-7 py-8 lg:grid-cols-[1fr_360px] lg:px-9 lg:py-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
              <RadioTower className="h-3.5 w-3.5" /> Agent Command Centre
            </div>
            <h1 className="max-w-3xl text-[34px] font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-[46px] lg:text-[56px]">
              Four specialist agents moving the advice file with speed and control.
            </h1>
            <p className="mt-5 max-w-2xl text-[14px] leading-7 text-muted-foreground/85 sm:text-[15px]">
              NOVA researches, VANTA controls risk, ORION assembles the SOA and PULSE keeps client momentum moving. Brad stays the final human approver.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[13px] font-semibold text-gold-foreground transition hover:bg-gold/90"
              >
                Open operating brief <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/soa"
                className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/[0.03] px-5 py-2.5 text-[13px] font-semibold text-foreground/85 transition hover:border-gold/40 hover:text-gold"
              >
                Review SOA pipeline
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              System telemetry
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Telemetry label="Active" value={AGENT_SYSTEM_SUMMARY.active} />
              <Telemetry label="Blocked" value={AGENT_SYSTEM_SUMMARY.blocked} />
              <Telemetry label="Load" value={`${AGENT_SYSTEM_SUMMARY.averageWorkload}%`} />
              <Telemetry label="Critical" value={AGENT_SYSTEM_SUMMARY.criticalTasks} />
            </div>
            <div className="mt-5 rounded-xl border border-gold/20 bg-gold/[0.06] p-4">
              <div className="mb-2 flex items-center gap-2 text-gold">
                <Sparkles className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Final SOA owner</span>
              </div>
              <p className="text-[13px] leading-6 text-foreground/80">{ORION_FINAL_SOA_NOTE}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-8 grid gap-4 lg:grid-cols-4">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <article
              key={agent.id}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition duration-200 hover:-translate-y-0.5 hover:border-gold/30"
            >
              <div className={cn("h-[3px] bg-gradient-to-r to-transparent", agent.accent)} />
              <div className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border", agent.tone)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]", statusTone[agent.status])}>
                    {agent.status}
                  </span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold/90">{agent.name}</p>
                <h2 className="mt-2 text-[18px] font-semibold tracking-tight text-foreground">{agent.role}</h2>
                <p className="mt-3 min-h-[72px] text-[13px] leading-6 text-muted-foreground/85">{agent.description}</p>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Workload</span>
                    <span className="tabular-nums">{agent.workload}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold/80 to-blue-accent/80" style={{ width: `${agent.workload}%` }} />
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Active task</p>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", priorityTone[agent.activeTask.priority])}>
                      {agent.activeTask.priority}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium leading-5 text-foreground/90">{agent.activeTask.title}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {agent.activeTask.client} · {agent.activeTask.eta}
                  </p>
                </div>

                {agent.blockedItem && (
                  <div className="mt-3 flex gap-2 rounded-xl border border-orange-400/25 bg-orange-400/8 p-3 text-[12px] leading-5 text-orange-200/90">
                    <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {agent.blockedItem}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Advice assembly flow</p>
              <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-foreground">Capture to approved SOA</h2>
            </div>
            <Gauge className="h-5 w-5 text-gold" />
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {AGENT_FLOW.map((step, index) => (
              <div key={step.label} className="relative rounded-xl border border-border/70 bg-white/[0.025] p-4">
                {index < AGENT_FLOW.length - 1 && (
                  <div className="absolute right-[-14px] top-1/2 z-10 hidden h-px w-7 bg-gradient-to-r from-gold/45 to-transparent md:block" />
                )}
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-[12px] font-bold text-gold">
                  {index + 1}
                </div>
                <p className="text-[13px] font-semibold text-foreground">{step.label}</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <div className="mb-5 flex items-center gap-2 text-gold">
            <Zap className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Next actions</p>
          </div>
          <div className="space-y-3">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] font-bold tracking-[0.18em] text-gold">{agent.name}</p>
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/60" />
                </div>
                <p className="text-[13px] leading-6 text-foreground/82">{agent.nextAction}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Telemetry({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-white/[0.035] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-foreground tabular-nums">{value}</p>
    </div>
  );
}
