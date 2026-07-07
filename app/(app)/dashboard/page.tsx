import type { ElementType } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileSignature,
  Clock,
  CheckCircle2,
  Send,
  Activity,
  Gauge,
  RadioTower,
  Zap,
} from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PipelineTable } from "@/components/dashboard/PipelineTable";
import { TodayLabel } from "@/components/dashboard/TodayLabel";
import { getPipelineMetrics } from "@/lib/soa/soa-pipeline";
import { AGENT_SYSTEM_SUMMARY, AGENTS } from "@/lib/agents";

function getMetrics() {
  const active = CLIENTS.length;
  const inProgress = CLIENTS.filter((c) => c.status === "in-progress").length;
  const ready = CLIENTS.filter((c) => c.status === "ready-for-meeting").length;
  const needsReview = CLIENTS.filter((c) => c.status === "review-required").length;
  const notStarted = CLIENTS.filter((c) => c.status === "link-sent").length;
  return { active, inProgress, ready, needsReview, notStarted };
}

export default function DashboardPage() {
  const metrics = getMetrics();
  const soa = getPipelineMetrics();
  const pipelineVelocity = Math.round(
    ((metrics.ready + soa.approvedReady + soa.signedThisMonth) /
      Math.max(metrics.active + soa.total, 1)) *
      100,
  );

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 xl:px-12 xl:py-12">
      <header className="mb-8 overflow-hidden rounded-[28px] border border-border/70 bg-[radial-gradient(circle_at_16%_10%,hsl(var(--gold)/0.16),transparent_32%),radial-gradient(circle_at_86%_12%,hsl(var(--blue-accent)/0.12),transparent_34%),linear-gradient(135deg,hsl(var(--card)),hsl(222_30%_5%))]">
        <div className="grid gap-8 px-7 py-8 lg:grid-cols-[1fr_390px] lg:px-9 lg:py-10">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
              <Activity className="h-3.5 w-3.5" /> Today&apos;s operating brief
            </p>
            <h1 className="max-w-3xl text-[36px] font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-[48px] lg:text-[58px]">
              Good morning, Brad. Your advice engine is moving.
            </h1>
            <p className="mt-5 max-w-2xl text-[14px] leading-7 text-muted-foreground/85 sm:text-[15px]">
              <TodayLabel /> · NOVA, VANTA, ORION and PULSE are tracking client readiness, compliance gates, SOA assembly and follow up momentum.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[13px] font-semibold text-gold-foreground transition hover:bg-gold/90"
              >
                Open Agents <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/clients"
                className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/[0.03] px-5 py-2.5 text-[13px] font-semibold text-foreground/85 transition hover:border-gold/40 hover:text-gold"
              >
                New Client
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Pipeline velocity</p>
                <p className="mt-2 text-[46px] font-semibold leading-none tracking-tight text-foreground tabular-nums">{pipelineVelocity}%</p>
              </div>
              <Gauge className="h-8 w-8 text-gold" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-gold via-amber-300 to-blue-accent" style={{ width: `${pipelineVelocity}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <HeroMetric label="Agent load" value={`${AGENT_SYSTEM_SUMMARY.averageWorkload}%`} />
              <HeroMetric label="Ready" value={metrics.ready} />
              <HeroMetric label="Review" value={metrics.needsReview} />
            </div>
          </div>
        </div>
      </header>

      <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Clients" value={metrics.active} icon={Users} iconColor="text-gold" iconBg="bg-gold/12" accentFrom="from-gold/50" />
        <KpiCard label="Fact Finds In Progress" value={metrics.inProgress} icon={ClipboardList} iconColor="text-blue-accent" iconBg="bg-blue-accent/12" accentFrom="from-blue-accent/50" />
        <KpiCard label="Ready for Meeting" value={metrics.ready} icon={Calendar} iconColor="text-amber-300" iconBg="bg-amber-400/12" accentFrom="from-amber-400/50" />
        <KpiCard label="Needs Review" value={metrics.needsReview} icon={AlertCircle} iconColor="text-orange-300" iconBg="bg-orange-400/12" accentFrom="from-orange-400/50" />
      </section>

      <section className="mb-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold/90">
                <RadioTower className="h-3.5 w-3.5" /> Agent activity strip
              </p>
              <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-foreground">Live workload and file movement</h2>
            </div>
            <Link href="/agents" className="hidden items-center gap-1.5 text-[12px] text-muted-foreground/75 transition hover:text-gold sm:inline-flex">
              Command centre <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {AGENTS.map((agent) => {
              const Icon = agent.icon;
              return (
                <div key={agent.id} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", agent.tone)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold tracking-[0.2em] text-gold">{agent.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{agent.status}</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-semibold text-foreground tabular-nums">{agent.workload}%</span>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold/80 to-blue-accent/80" style={{ width: `${agent.workload}%` }} />
                  </div>
                  <p className="text-[13px] leading-5 text-foreground/85">{agent.activeTask.title}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{agent.signal}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <div className="mb-5 flex items-center gap-2 text-gold">
            <Zap className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Action queue</p>
          </div>
          <div className="space-y-3">
            {[
              "VANTA is blocking David Okafor until risk preference evidence is complete.",
              "ORION is assembling Tony Nguyen's SOA draft for Brad approval.",
              `${metrics.notStarted} client${metrics.notStarted !== 1 ? "s have" : " has"} not started fact find. PULSE recommends a personal follow up.`,
              "NOVA has Sarah Mitchell ready for meeting brief validation.",
            ].map((item, index) => (
              <div key={item} className="flex gap-3 rounded-xl border border-border/70 bg-white/[0.025] p-4">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-[10px] font-bold text-gold">{index + 1}</span>
                <p className="text-[13px] leading-6 text-foreground/82">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-4 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <FileSignature className="h-3.5 w-3.5 text-gold" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold/90">SOA Pipeline</p>
          </div>
          <Link href="/soa" className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-muted-foreground/75 transition-colors hover:text-gold">
            Open SOA pipeline <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="In Generation" value={soa.inGeneration} icon={Sparkles} iconColor="text-blue-accent" iconBg="bg-blue-accent/12" accentFrom="from-blue-accent/50" />
          <KpiCard label="Awaiting Brad Review" value={soa.awaitingReview} icon={Clock} iconColor="text-amber-300" iconBg="bg-amber-400/12" accentFrom="from-amber-400/50" />
          <KpiCard label="Approved · Ready to Send" value={soa.approvedReady} icon={CheckCircle2} iconColor="text-emerald-300" iconBg="bg-emerald-500/12" accentFrom="from-emerald-500/50" />
          <KpiCard label="Signed This Month" value={soa.signedThisMonth} icon={Send} iconColor="text-gold" iconBg="bg-gold/12" accentFrom="from-gold/50" />
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Client Pipeline</h2>
            <span className="inline-flex items-center rounded-full border border-border/70 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground/80 tabular-nums">{CLIENTS.length}</span>
          </div>
          <Link href="/clients" className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-muted-foreground/75 transition-colors hover:text-gold">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <PipelineTable />
      </section>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-white/[0.035] p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-[22px] font-semibold leading-none text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  accentFrom,
}: {
  label: string;
  value: number;
  icon: ElementType;
  iconColor: string;
  iconBg: string;
  accentFrom: string;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border/70 bg-card transition duration-200 hover:-translate-y-0.5 hover:border-border">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", accentFrom)} />
      <div className="px-6 py-6">
        <div className="mb-7 flex items-start justify-between">
          <p className="max-w-[150px] text-[10px] font-semibold uppercase leading-snug tracking-[0.22em] text-muted-foreground/70">{label}</p>
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105", iconBg)}>
            <Icon className={cn("h-[15px] w-[15px]", iconColor)} />
          </div>
        </div>
        <p className="text-[48px] font-semibold leading-none tracking-tight text-foreground tabular-nums sm:text-[56px]">{value}</p>
      </div>
    </div>
  );
}
