import type { ElementType } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  Gauge,
  RadioTower,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PipelineTable } from "@/components/dashboard/PipelineTable";
import { TodayLabel } from "@/components/dashboard/TodayLabel";
import { getPipelineMetrics } from "@/lib/soa/soa-pipeline";
import { AGENT_SYSTEM_SUMMARY, AGENTS, type AgentPriority } from "@/lib/agents";

function getMetrics() {
  const active = CLIENTS.length;
  const inProgress = CLIENTS.filter((c) => c.status === "in-progress").length;
  const ready = CLIENTS.filter((c) => c.status === "ready-for-meeting").length;
  const needsReview = CLIENTS.filter((c) => c.status === "review-required").length;
  const notStarted = CLIENTS.filter((c) => c.status === "link-sent").length;
  const averageProgress = Math.round(
    CLIENTS.reduce((sum, client) => sum + client.progress, 0) /
      Math.max(CLIENTS.length, 1),
  );
  return { active, inProgress, ready, needsReview, notStarted, averageProgress };
}

const priorityTone: Record<AgentPriority, string> = {
  Low: "border-zinc-500/30 bg-zinc-400/10 text-zinc-300",
  Medium: "border-blue-accent/35 bg-blue-accent/10 text-blue-accent",
  High: "border-gold/35 bg-gold/10 text-gold",
  Critical: "border-orange-400/45 bg-orange-400/10 text-orange-300",
};

const actionQueue = [
  {
    priority: "Critical" as AgentPriority,
    title: "Resolve compliance blocker on David Okafor before SOA can proceed",
    agent: "VANTA",
  },
  {
    priority: "High" as AgentPriority,
    title: "Review SOA draft prepared by ORION for Tony Nguyen",
    agent: "ORION",
  },
  {
    priority: "High" as AgentPriority,
    title: "Review NOVA client brief for Sarah Mitchell before the 28 May meeting",
    agent: "NOVA",
  },
  {
    priority: "Medium" as AgentPriority,
    title: "Send PULSE follow up reminder to stalled fact find clients",
    agent: "PULSE",
  },
];

export default function DashboardPage() {
  const metrics = getMetrics();
  const soa = getPipelineMetrics();
  const pipelineVelocity = Math.round(
    ((metrics.ready + soa.approvedReady + soa.signedThisMonth) /
      Math.max(metrics.active + soa.total, 1)) *
      100,
  );
  const bottlenecks = CLIENTS.filter(
    (client) => client.status === "link-sent" || client.status === "review-required",
  ).slice(0, 4);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#05080d] px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_4%,rgba(212,175,55,0.11),transparent_28%),radial-gradient(circle_at_72%_0%,rgba(80,160,255,0.09),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_18%)]" />
      <div className="pointer-events-none absolute left-10 top-0 h-px w-[72%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative mx-auto max-w-[1720px]">
        <header className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.46em] text-muted-foreground/70">
              BMK Financial Services
            </p>
            <h1 className="text-[38px] font-semibold leading-none tracking-[-0.045em] text-foreground sm:text-[48px] lg:text-[58px]">
              Good morning, Brad.
            </h1>
            <p className="mt-5 text-[14px] text-muted-foreground/85">
              <TodayLabel /> &nbsp;·&nbsp; Financial Advice Command Centre
            </p>
          </div>
          <Link
            href="/clients"
            className="group inline-flex w-fit items-center gap-3 rounded-xl border border-gold/40 bg-gradient-to-b from-gold to-[#c99321] px-5 py-3 text-[13px] font-bold text-[#120d04] shadow-[0_0_34px_rgba(212,175,55,0.22),inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:translate-y-[-1px] hover:shadow-[0_0_44px_rgba(212,175,55,0.32),inset_0_1px_0_rgba(255,255,255,0.55)]"
          >
            New Client
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </header>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-4 w-px bg-gold" />
          <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-gold">
            Today&apos;s Operating Brief
          </p>
        </div>

        <section className="mb-8 grid gap-6 2xl:grid-cols-[1.35fr_0.95fr]">
          <GlassPanel className="min-h-[420px] overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <SectionHeader icon={RadioTower} label="Agent Activity" />
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 text-[12px] text-muted-foreground/75 transition hover:text-gold"
              >
                Command centre <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid border-b border-white/8 lg:grid-cols-2">
              {AGENTS.map((agent, index) => (
                <AgentTile
                  key={agent.id}
                  agent={agent}
                  className={cn(
                    index % 2 === 0 && "lg:border-r lg:border-white/8",
                    index < 2 && "border-b border-white/8",
                  )}
                />
              ))}
            </div>

            <div className="grid sm:grid-cols-3">
              <BottomStat label="Fleet Load" value={`${AGENT_SYSTEM_SUMMARY.averageWorkload}%`} />
              <BottomStat label="In Queue" value={actionQueue.length + metrics.needsReview} />
              <BottomStat label="Cleared Today" value={metrics.ready + soa.approvedReady} accent />
            </div>
          </GlassPanel>

          <GlassPanel className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
              <SectionHeader icon={Zap} label="Action Queue" />
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-[12px] text-muted-foreground">
                {actionQueue.length}
              </span>
            </div>
            <div className="divide-y divide-white/8">
              {actionQueue.map((item) => (
                <ActionRow key={item.title} {...item} />
              ))}
            </div>
          </GlassPanel>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-3">
          <TelemetryCard
            icon={TrendingUp}
            label="Pipeline Velocity"
            value={`${metrics.averageProgress}%`}
            subValue="Average fact find completion across active clients"
            tone="blue"
            ringValue={metrics.averageProgress}
          />
          <TelemetryCard
            icon={Gauge}
            label="Client Readiness"
            value={`${metrics.ready}/${metrics.active}`}
            subValue="Files ready to progress toward SOA generation"
            tone="emerald"
            ringValue={Math.round((metrics.ready / Math.max(metrics.active, 1)) * 100)}
          />
          <GlassPanel className="relative overflow-hidden border-orange-400/25 p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.16),transparent_34%)]" />
            <div className="relative mb-7 flex items-center justify-between">
              <SectionHeader icon={AlertCircle} label="Bottlenecks" />
              <p className="text-[44px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
                {bottlenecks.length || metrics.needsReview}
              </p>
            </div>
            <div className="relative space-y-4">
              {(bottlenecks.length ? bottlenecks : CLIENTS.slice(0, 3)).map((client) => (
                <div key={client.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-foreground/88">{client.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/55">
                      {client.meetingStage}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/65">
                    {client.status.replaceAll("-", " ")}
                  </span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </section>

        <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Active Clients" value={metrics.active} icon={Users} iconColor="text-gold" accentFrom="from-gold/70" />
          <KpiCard label="Fact Finds In Progress" value={metrics.inProgress} icon={ClipboardList} iconColor="text-blue-accent" accentFrom="from-blue-accent/70" />
          <KpiCard label="Ready for Meeting" value={metrics.ready} icon={Calendar} iconColor="text-emerald-300" accentFrom="from-emerald-400/70" />
          <KpiCard label="Needs Review" value={metrics.needsReview} icon={AlertCircle} iconColor="text-orange-300" accentFrom="from-orange-400/70" />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <SectionHeader icon={FileSignature} label="SOA Readiness" />
            <Link href="/soa" className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-muted-foreground/75 transition hover:text-gold">
              Open SOA pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="In Generation" value={soa.inGeneration} icon={Sparkles} iconColor="text-blue-accent" accentFrom="from-blue-accent/70" />
            <KpiCard label="Awaiting Brad Review" value={soa.awaitingReview} icon={FileSignature} iconColor="text-amber-300" accentFrom="from-amber-400/70" />
            <KpiCard label="Approved · Ready to Send" value={soa.approvedReady} icon={CheckCircle2} iconColor="text-emerald-300" accentFrom="from-emerald-400/70" />
            <KpiCard label="Signed This Month" value={soa.signedThisMonth} icon={Send} iconColor="text-gold" accentFrom="from-gold/70" />
          </div>
        </section>

        <GlassPanel className="p-0">
          <div className="flex items-end justify-between border-b border-white/8 px-6 py-5">
            <div className="flex items-baseline gap-3">
              <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                Client Pipeline
              </h2>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground/80 tabular-nums">
                {CLIENTS.length}
              </span>
            </div>
            <Link href="/clients" className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-muted-foreground/75 transition hover:text-gold">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-4">
            <PipelineTable />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function GlassPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative rounded-[22px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,24,34,0.86),rgba(8,12,19,0.92))] shadow-[0_22px_70px_-48px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-px before:rounded-[21px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_34%,rgba(96,165,250,0.045)_58%,transparent)] before:content-['']",
        className,
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-gold/90" />
      <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">{label}</p>
    </div>
  );
}

function AgentTile({ agent, className }: { agent: (typeof AGENTS)[number]; className?: string }) {
  const statusTone =
    agent.status === "Blocked"
      ? "bg-orange-400 text-orange-300"
      : agent.status === "Monitoring"
        ? "bg-emerald-400 text-emerald-300"
        : agent.status === "Ready"
          ? "bg-gold text-gold"
          : "bg-blue-accent text-blue-accent";

  return (
    <div className={cn("p-7", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-bold text-foreground">{agent.name}</h3>
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_18px_currentColor]", statusTone)} />
          <span className={cn("text-[10px] font-bold uppercase tracking-[0.24em]", statusTone.split(" ")[1])}>
            {agent.status}
          </span>
        </div>
      </div>
      <p className="min-h-[38px] text-[12px] leading-5 text-muted-foreground/80">{agent.activeTask.title}</p>
      <div className="mt-8 flex items-end gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.055]">
          <div
            className={cn(
              "h-full rounded-full",
              agent.status === "Blocked"
                ? "bg-orange-400"
                : agent.status === "Monitoring"
                  ? "bg-emerald-400"
                  : agent.status === "Ready"
                    ? "bg-gold"
                    : "bg-blue-accent",
            )}
            style={{ width: `${agent.workload}%` }}
          />
        </div>
        <MiniBars tone={agent.status} />
      </div>
    </div>
  );
}

function MiniBars({ tone }: { tone: string }) {
  const color =
    tone === "Blocked"
      ? "bg-orange-400"
      : tone === "Monitoring"
        ? "bg-emerald-400"
        : tone === "Ready"
          ? "bg-gold"
          : "bg-blue-accent";
  return (
    <div className="flex h-6 items-end gap-1 opacity-70">
      {[9, 13, 7, 16, 11, 18, 22].map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={cn("w-1 rounded-full bg-white/10", index > 5 ? color : "")}
          style={{ height }}
        />
      ))}
    </div>
  );
}

function ActionRow({ priority, title, agent }: { priority: AgentPriority; title: string; agent: string }) {
  return (
    <div className="group flex items-center gap-4 px-6 py-5 transition hover:bg-white/[0.025]">
      <span className={cn("rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]", priorityTone[priority])}>
        {priority}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-foreground/88">{title}</p>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/55">{agent}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground/45 transition group-hover:translate-x-1 group-hover:text-gold" />
    </div>
  );
}

function TelemetryCard({
  icon: Icon,
  label,
  value,
  subValue,
  ringValue,
  tone,
}: {
  icon: ElementType;
  label: string;
  value: string;
  subValue: string;
  ringValue: number;
  tone: "blue" | "emerald";
}) {
  const color = tone === "blue" ? "#60a5fa" : "#34d399";
  return (
    <GlassPanel className="p-7">
      <div className="flex items-center gap-6">
        <MetricRing value={ringValue} color={color} label={value} />
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Icon className={cn("h-4 w-4", tone === "blue" ? "text-blue-accent" : "text-emerald-300")} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/70">
              {label}
            </p>
          </div>
          <p className="text-[13px] leading-6 text-muted-foreground/85">{subValue}</p>
        </div>
      </div>
    </GlassPanel>
  );
}

function MetricRing({ value, color, label }: { value: number; color: string; label: string }) {
  const degrees = Math.min(Math.max(value, 0), 100) * 3.6;
  return (
    <div
      className="grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${degrees}deg, rgba(255,255,255,0.055) 0deg)`,
      }}
    >
      <div className="grid h-[78px] w-[78px] place-items-center rounded-full bg-[#0b1018] shadow-[inset_0_0_22px_rgba(0,0,0,0.55)]">
        <p className="text-[28px] font-semibold tracking-tight text-foreground tabular-nums">{label}</p>
      </div>
    </div>
  );
}

function BottomStat({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="border-r border-white/8 px-7 py-4 last:border-r-0">
      <p className={cn("text-[22px] font-semibold tracking-tight tabular-nums", accent ? "text-gold" : "text-foreground")}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.34em] text-muted-foreground/55">{label}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor,
  accentFrom,
}: {
  label: string;
  value: number;
  icon: ElementType;
  iconColor: string;
  accentFrom: string;
}) {
  return (
    <GlassPanel className="group overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:border-white/20">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", accentFrom)} />
      <div className="p-6">
        <div className="mb-7 flex items-start justify-between">
          <p className="max-w-[150px] text-[10px] font-bold uppercase leading-snug tracking-[0.26em] text-muted-foreground/65">{label}</p>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition group-hover:scale-105">
            <Icon className={cn("h-[16px] w-[16px]", iconColor)} />
          </div>
        </div>
        <p className="text-[48px] font-semibold leading-none tracking-tight text-foreground tabular-nums sm:text-[54px]">{value}</p>
      </div>
    </GlassPanel>
  );
}
