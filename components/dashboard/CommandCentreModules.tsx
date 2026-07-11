import Link from "next/link";
import { EngineCore3D } from "./EngineCore3D";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileSignature,
  Mail,
  Network,
  Orbit,
  PenLine,
  RadioTower,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Waves,
} from "lucide-react";
import { TodayLabel } from "@/components/dashboard/TodayLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AgentActivityItem,
  CommandCentreDashboard,
  DashboardMetric,
  DashboardTone,
  NextBestActionItem,
  PipelineSnapshotItem,
  PriorityLevel,
  PriorityQueueItem,
  SarahBriefInsight,
  WorkflowStage,
} from "@/lib/dashboard-command-centre";

type IconComponent = ComponentType<{ className?: string }>;

const metricIcons: Record<string, IconComponent> = {
  "active-clients": Users,
  "fact-finds": Activity,
  "ready-meeting": UserCheck,
  "ready-soa": FileSignature,
  "needs-attention": AlertTriangle,
};

const stageIcons: Record<string, IconComponent> = {
  "link-sent": Mail,
  discovery: ClipboardList,
  "sarah-complete": CheckCircle2,
  "beacon-structured": RadioTower,
  "guardian-check": ShieldCheck,
  "scribe-prep": PenLine,
  "orion-evidence": Orbit,
  "atlas-soa": FileSignature,
};

const agentIcons: Record<AgentActivityItem["name"], IconComponent> = {
  Sarah: Sparkles,
  Beacon: RadioTower,
  Guardian: ShieldCheck,
  Scribe: PenLine,
  Orion: Orbit,
  ATLAS: FileSignature,
  Nexus: Network,
};

const toneText: Record<DashboardTone, string> = {
  cyan: "text-teal-accent",
  blue: "text-blue-accent",
  gold: "text-gold",
  emerald: "text-success",
  orange: "text-warning",
  violet: "text-teal-accent",
  slate: "text-foreground/78",
};

const toneBorder: Record<DashboardTone, string> = {
  cyan: "border-teal-accent/25",
  blue: "border-blue-accent/25",
  gold: "border-gold/30",
  emerald: "border-success/25",
  orange: "border-warning/30",
  violet: "border-teal-accent/25",
  slate: "border-white/[0.10]",
};

const toneBg: Record<DashboardTone, string> = {
  cyan: "bg-teal-accent/10",
  blue: "bg-blue-accent/10",
  gold: "bg-gold/[0.12]",
  emerald: "bg-success/10",
  orange: "bg-warning/[0.12]",
  violet: "bg-teal-accent/10",
  slate: "bg-white/[0.045]",
};

const toneRail: Record<DashboardTone, string> = {
  cyan: "bg-[linear-gradient(90deg,hsl(var(--teal-accent)),hsl(var(--blue-accent)))]",
  blue: "bg-[linear-gradient(90deg,hsl(var(--blue-accent)),hsl(212_80%_56%))]",
  gold: "bg-[linear-gradient(90deg,hsl(var(--gold-dim)),hsl(var(--gold-bright)))]",
  emerald: "bg-[linear-gradient(90deg,hsl(var(--success)),hsl(175_65%_45%))]",
  orange: "bg-[linear-gradient(90deg,hsl(var(--warning)),hsl(28_70%_48%))]",
  violet: "bg-[linear-gradient(90deg,hsl(var(--teal-accent)),hsl(190_60%_50%))]",
  slate: "bg-[linear-gradient(90deg,hsl(220_12%_68%),hsl(220_16%_52%))]",
};

const priorityClasses: Record<PriorityLevel, string> = {
  critical: "border-destructive/40 bg-destructive/[0.12] text-[hsl(6_75%_68%)]",
  high: "border-warning/35 bg-warning/[0.12] text-warning",
  medium: "border-blue-accent/30 bg-blue-accent/10 text-blue-accent",
  low: "border-white/[0.12] bg-white/[0.05] text-muted-foreground",
};


export function DashboardHeader({
  activeFiles,
}: {
  activeFiles: number;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-gold/[0.12] bg-[linear-gradient(135deg,hsl(44_60%_88%/0.05),hsl(43_53%_54%/0.04)_40%,hsl(220_18%_6%/0.3))] px-4 py-4 shadow-[inset_0_1px_0_hsl(44_70%_88%/0.08),0_18px_54px_-44px_hsl(43_53%_54%/0.55)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between lg:px-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full border border-gold/25 bg-gold/15 text-[11px] font-bold text-gold">
            N
          </span>
          <p className="cmd-label text-muted-foreground/62">
            Newcastle Financial Services
          </p>
          <span className="size-1 rounded-full bg-gold/55" />
          <p className="text-[12px] text-muted-foreground/72">
            <TodayLabel />
          </p>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold leading-none tracking-normal text-foreground sm:text-[34px]">
          Command Centre
        </h1>
        <p className="mt-2 max-w-[660px] text-[13px] leading-6 text-muted-foreground/76">
          Real-time view of clients, onboarding flow, agent intelligence and
          adviser priorities.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <label className="glass-input hidden h-10 min-w-[260px] items-center gap-2 rounded-full px-3 text-muted-foreground/70 sm:flex xl:min-w-[330px]">
          <Search className="size-4 shrink-0" />
          <span className="sr-only">Search clients, SOAs and evidence</span>
          <input
            className="h-full min-w-0 flex-1 bg-transparent text-[12px] text-foreground/86 outline-none placeholder:text-muted-foreground/58"
            placeholder="Search clients, SOAs, evidence..."
            type="search"
          />
        </label>
        <StatusPill icon={Activity} label="Live" value={`${activeFiles} files`} tone="gold" />
        <Button
          asChild
          className="btn-gold h-10 rounded-full px-4 text-[12px] font-semibold transition hover:scale-[1.02]"
        >
          <Link href="/clients">
            New Client
            <ArrowRight className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function GlowPanel({
  eyebrow,
  title,
  action,
  children,
  className,
  variant = "default",
}: {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "emphasis" | "alert";
}) {
  return (
    <section
      className={cn(
        "glass-panel glass-shine liquid-glow group relative overflow-hidden rounded-2xl p-4",
        variant === "emphasis" && "glass-panel-elevated glass-rim-gold",
        variant === "alert" && "glass-rim-amber",
        className,
      )}
    >
      <span className="shine-layer" aria-hidden />
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(44_75%_84%/0.4),transparent)]" />
      <span className="dashboard-signal pointer-events-none absolute -right-12 top-8 size-28 rounded-full bg-gold/[0.07] blur-3xl" />
      <span className="pointer-events-none absolute -bottom-14 left-8 size-28 rounded-full bg-teal-accent/[0.05] blur-3xl transition group-hover:bg-teal-accent/[0.08]" />
      {(eyebrow || title || action) && (
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <p className="cmd-label text-gold/78">{eyebrow}</p>}
            {title && (
              <h2 className="mt-1 text-[18px] font-semibold tracking-normal text-foreground">
                {title}
              </h2>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}

export function StatusPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  tone: DashboardTone;
}) {
  return (
    <Badge
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-3 text-[11px] shadow-[inset_0_1px_0_hsl(44_70%_88%/0.1)]",
        toneBorder[tone],
        toneBg[tone],
      )}
    >
      <Icon className={cn("size-3.5", toneText[tone])} />
      <span className="cmd-label text-muted-foreground/62">{label}</span>
      <span className="text-[12px] font-semibold text-foreground/88">{value}</span>
    </Badge>
  );
}

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = metricIcons[metric.id] ?? Activity;

  return (
    <GlowPanel
      className={cn(
        "dashboard-breathe-soft glass-hover-lift min-h-[154px] p-4",
        metric.id === "needs-attention" && "border-warning/[0.22]",
      )}
      variant={metric.id === "needs-attention" ? "alert" : "default"}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="relative min-w-0">
          <span
            className={cn(
              "pointer-events-none absolute -left-4 -top-2 size-20 rounded-full opacity-60 blur-2xl",
              toneBg[metric.tone],
            )}
            aria-hidden
          />
          <p className={cn("cmd-label relative", metric.tone === "orange" ? "text-warning" : "text-gold/82")}>
            {metric.label}
          </p>
          <p className="relative mt-3 text-[32px] font-semibold leading-none text-foreground tabular-nums drop-shadow-[0_2px_10px_hsl(220_25%_2%/0.7)]">
            {metric.value}
          </p>
        </div>
        <div
          className={cn(
            "glass-orb grid size-11 shrink-0 place-items-center rounded-xl",
            toneBorder[metric.tone],
            toneText[metric.tone],
          )}
        >
          <Icon className="size-4 drop-shadow-[0_0_6px_currentColor]" />
        </div>
      </div>
      <p className="mt-3 min-h-[38px] text-[12px] leading-5 text-muted-foreground/72">
        {metric.description}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40 shadow-[inset_0_1px_2px_hsl(220_25%_2%/0.8),0_1px_0_hsl(44_60%_90%/0.05)]">
        <div
          className={cn(
            "dashboard-activity-rail h-full rounded-full shadow-[0_0_8px_0_currentColor]",
            toneRail[metric.tone],
            toneText[metric.tone],
            getProgressWidthClass(metric.progress),
          )}
        />
      </div>
      <p
        className={cn(
          "mt-3 flex items-center gap-1.5 text-[11px]",
          metric.trend === "No change" ? "text-muted-foreground/60" : "text-success/90",
        )}
      >
        {metric.trend !== "No change" && <TrendingUp className="size-3" />}
        {metric.trend}
      </p>
    </GlowPanel>
  );
}

export function ClientProgressEngine({
  stages,
  totalFilesInFlow,
  averageTimeInFlow,
  flowVelocity,
  conversionToMeeting,
}: {
  stages: WorkflowStage[];
  totalFilesInFlow: number;
  averageTimeInFlow: string;
  flowVelocity: string;
  conversionToMeeting: string;
}) {
  const countFor = (...ids: string[]) =>
    stages
      .filter((stage) => ids.includes(stage.id))
      .reduce((sum, stage) => sum + stage.count, 0);

  // Five clear stages: the whole journey in one readable line.
  const pipeline = [
    { name: "Sarah", label: "Discovery", count: countFor("link-sent", "discovery"), detail: "Clients completing their Financial Discovery session" },
    { name: "Beacon", label: "Structuring", count: countFor("beacon-structured", "sarah-complete"), detail: "Fact finds structured for adviser review" },
    { name: "Guardian", label: "Compliance", count: countFor("guardian-check"), detail: "Best interests and risk screening" },
    { name: "Scribe + Orion", label: "Evidence", count: countFor("scribe-prep", "orion-evidence"), detail: "Meeting briefs and evidence packs assembled" },
    { name: "ATLAS", label: "SOA", count: countFor("atlas-soa"), detail: "Strategy synthesis and Statement of Advice drafting" },
  ];

  return (
    <GlowPanel
      eyebrow="System Core"
      title="Intelligence Flow"
      variant="emphasis"
      className="min-h-[548px]"
      action={
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-success">
          <span className="status-live size-1.5 rounded-full bg-success text-success" />
          Live
        </div>
      }
    >
      {/* Engine chamber — the orb owns the space */}
      <div className="depth-grid relative mt-4 flex min-h-[380px] items-center justify-center overflow-hidden rounded-2xl border border-gold/[0.12] bg-black/30 shadow-[inset_0_2px_18px_hsl(220_25%_2%/0.75),inset_0_1px_0_hsl(44_70%_88%/0.07)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.1),transparent_40%)]" />
        <div className="glass-grain pointer-events-none absolute inset-0 z-30 rounded-2xl" />
        <span className="pointer-events-none absolute inset-x-10 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,hsl(44_75%_84%/0.4),transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/[0.14]" />
        <div className="dashboard-engine-orbit pointer-events-none absolute left-1/2 top-1/2 size-[306px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gold/[0.16]" />

        <div className="relative grid size-60 place-items-center">
          <EngineCore3D className="pointer-events-none absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 text-center">
            <p className="cmd-label text-gold/85">Intelligence Engine</p>
            <p className="mt-2 text-[30px] font-semibold leading-none text-foreground tabular-nums drop-shadow-[0_2px_12px_hsl(220_25%_2%/0.95)]">
              {totalFilesInFlow}
            </p>
            <p className="mt-1 text-[12px] text-foreground/70 drop-shadow-[0_2px_10px_hsl(220_25%_2%/0.9)]">
              active files
            </p>
          </div>
        </div>
      </div>

      {/* The pipeline — five stages, one glance */}
      <div className="mt-4 flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-0">
        {pipeline.map((stage, index) => (
          <div key={stage.name} className="contents">
            {index > 0 && (
              <div className="hidden h-px min-w-3 flex-1 bg-[linear-gradient(90deg,hsl(var(--gold)/0.05),hsl(var(--gold)/0.4),hsl(var(--gold)/0.05))] md:block" />
            )}
            <div
              title={stage.detail}
              className="glass-chip group flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition hover:border-gold/30 md:flex-col md:items-center md:justify-center md:gap-0.5 md:px-4 md:text-center"
            >
              <div className="md:contents">
                <p className="text-[13px] font-semibold leading-tight text-foreground whitespace-nowrap">
                  {stage.name}
                </p>
                <p className="cmd-label mt-0.5 text-muted-foreground/60">
                  {stage.label}
                </p>
              </div>
              <p className="text-[12px] font-medium text-gold/90 tabular-nums whitespace-nowrap md:mt-1">
                {stage.count} {stage.count === 1 ? "file" : "files"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl glass-chip p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
        <EngineStat label="Average time in flow" value={averageTimeInFlow} tone="cyan" />
        <EngineStat label="Flow velocity" value={flowVelocity} tone="emerald" />
        <EngineStat label="Conversion to meeting" value={conversionToMeeting} tone="gold" />
        <Link
          href="/sarah"
          className="inline-flex min-h-10 items-center justify-between gap-3 rounded-xl glass-chip px-3 text-[12px] font-medium text-muted-foreground/78 transition hover:border-gold/30 hover:text-gold"
        >
          View engine analytics
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </GlowPanel>
  );
}

function EngineStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: DashboardTone;
}) {
  return (
    <div className="border-white/[0.08] px-2 sm:border-r">
      <p className="text-[11px] text-muted-foreground/58">{label}</p>
      <p className={cn("mt-1 text-[16px] font-semibold tabular-nums", toneText[tone])}>
        {value}
      </p>
    </div>
  );
}

export function PriorityQueue({ items }: { items: PriorityQueueItem[] }) {
  return (
    <GlowPanel
      eyebrow="Action"
      title="Priority Queue"
      className="h-full min-h-[430px]"
      action={
        <StatusPill icon={Activity} label="Live queue" value={String(items.length)} tone="gold" />
      }
    >
      <div className="mt-5 flex flex-col gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="dashboard-event-glow glass-chip group rounded-xl px-3.5 py-3.5 transition hover:border-gold/[0.28] hover:shadow-[0_1px_0_0_hsl(44_70%_90%/0.12)_inset,0_-1px_0_0_hsl(220_25%_3%/0.5)_inset,0_6px_16px_-6px_hsl(0_0%_0%/0.7),0_0_26px_-10px_hsl(var(--gold-glow)/0.3)]"
          >
            <div className="flex items-start gap-3">
              <Badge
                className={cn(
                  "mt-0.5 shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] shadow-[inset_0_1px_0_hsl(44_70%_88%/0.12),0_2px_6px_-2px_hsl(0_0%_0%/0.6)]",
                  priorityClasses[item.priority],
                )}
              >
                {item.priority}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-5 text-foreground/86">{item.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/48">
                  <span>{item.agent}</span>
                  <span className="size-1 rounded-full bg-white/25" />
                  <span>{item.clientName}</span>
                </div>
              </div>
              <ArrowRight className="mt-1 size-3.5 shrink-0 text-muted-foreground/42 transition group-hover:text-gold" />
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/clients"
        className="mt-4 inline-flex h-10 w-full items-center justify-between rounded-xl px-2 text-[12px] font-medium text-muted-foreground/76 transition hover:text-gold"
      >
        View all actions
        <ArrowRight className="size-3.5" />
      </Link>
    </GlowPanel>
  );
}

export function SarahBriefPanel({
  insights,
}: {
  insights: SarahBriefInsight[];
}) {
  return (
    <GlowPanel
      eyebrow="Sarah"
      title="Live Brief"
      action={<StatusPill icon={Sparkles} label="Active" value={`${insights.length} signals`} tone="gold" />}
    >
      <div className="mt-5 flex flex-col gap-3">
        {insights.map((item) => (
          <div
            key={item.id}
            className="rounded-xl glass-chip px-3.5 py-3 shadow-[inset_0_1px_0_hsl(44_70%_88%/0.07)]"
          >
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", toneRail[item.tone])} />
              <p className={cn("cmd-label", toneText[item.tone])}>{item.section}</p>
            </div>
            <p className="mt-2 text-[12.5px] leading-5 text-foreground/84">
              {item.insight}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground/52">{item.timestamp}</p>
          </div>
        ))}
      </div>
      <Link
        href="/sarah"
        className="mt-4 inline-flex h-11 w-full items-center justify-between rounded-xl glass-chip px-3 text-[12px] font-medium text-foreground/82 transition hover:border-gold/30 hover:text-gold"
      >
        Open full Sarah Brief
        <ArrowRight className="size-3.5" />
      </Link>
    </GlowPanel>
  );
}

export function PipelineSnapshot({
  items,
  totalFiles,
}: {
  items: PipelineSnapshotItem[];
  totalFiles: number;
}) {
  return (
    <GlowPanel eyebrow="Pipeline" title="Snapshot" className="h-full">
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl glass-chip px-3 py-3 shadow-[inset_0_1px_0_hsl(44_70%_88%/0.06)]"
          >
            <p className={cn("text-[24px] font-semibold leading-none tabular-nums", toneText[item.tone])}>
              {item.value}
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-muted-foreground/50">
              {item.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground/62">
        <span>{totalFiles} clients moving through the advice lifecycle</span>
        <Link
          href="/soa"
          className="inline-flex items-center gap-2 font-medium text-muted-foreground/74 transition hover:text-gold"
        >
          View pipeline
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </GlowPanel>
  );
}

export function FlowReadingCard({
  insight,
  timestamp,
}: CommandCentreDashboard["flowReading"]) {
  return (
    <GlowPanel className="h-full" variant="emphasis">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold shadow-[0_0_28px_-16px_hsl(var(--gold)/0.85)]">
          <Waves className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[18px] font-semibold leading-none text-foreground">
            Flow Reading
          </p>
          <p className="mt-3 text-[13px] leading-6 text-foreground/82">{insight}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/58">
          <span className="size-1.5 rounded-full bg-gold/70" />
          {timestamp}
        </div>
        <Link href="/sarah" className="text-muted-foreground/48 transition hover:text-gold">
          <ArrowRight className="size-3.5" />
          <span className="sr-only">Open Sarah flow reading</span>
        </Link>
      </div>
    </GlowPanel>
  );
}

export function NextBestActions({ items }: { items: NextBestActionItem[] }) {
  return (
    <GlowPanel eyebrow="Recommendations" title="Next Best Actions">
      <div className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex min-h-10 items-center justify-between gap-3 rounded-xl glass-chip px-3 text-[12.5px] text-foreground/82 transition hover:border-gold/[0.24] hover:bg-gold/[0.05]"
          >
            <span>{item.label}</span>
            <span className="flex items-center gap-2 text-muted-foreground/58">
              <span className="tabular-nums">{item.count}</span>
              <ArrowRight className="size-3.5 transition group-hover:text-gold" />
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/clients"
        className="mt-3 inline-flex h-10 w-full items-center justify-between rounded-xl px-2 text-[12px] font-medium text-muted-foreground/70 transition hover:text-gold"
      >
        View all recommendations
        <ArrowRight className="size-3.5" />
      </Link>
    </GlowPanel>
  );
}

export function AgentActivityStrip({
  agents,
  systemStatus,
  mockModeActive,
}: {
  agents: AgentActivityItem[];
  systemStatus: CommandCentreDashboard["systemStatus"];
  mockModeActive: boolean;
}) {
  return (
    <GlowPanel className="p-3">
      <div className="grid gap-3 xl:grid-cols-[220px_1fr] xl:items-center">
        <div className="rounded-xl glass-chip px-4 py-3">
          <p className="text-[15px] font-semibold text-foreground">System & Agent Activity</p>
          <div
            className={cn(
              "mt-2 flex items-center gap-2 text-[12px] font-medium",
              mockModeActive ? "text-warning" : "text-success",
            )}
          >
            <span
              className={cn(
                "status-live size-2 rounded-full",
                mockModeActive ? "bg-warning text-warning" : "bg-success text-success",
              )}
            />
            {systemStatus}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          {agents.map((agent) => {
            const Icon = agentIcons[agent.name];
            return (
              <Link
                key={agent.name}
                href="/agents"
                className={cn(
                  "glass-chip group relative overflow-hidden rounded-xl px-3 py-3 transition hover:border-gold/[0.28]",
                  agent.status === "Active" && "agent-pulse",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "glass-orb grid size-9 shrink-0 place-items-center",
                      toneBorder[agent.tone],
                      toneText[agent.tone],
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        agent.status === "Active" && "drop-shadow-[0_0_6px_currentColor]",
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-foreground">
                      {agent.name}
                    </p>
                    <p className={cn("mt-0.5 text-[11px] font-medium", statusText(agent.status))}>
                      {agent.status}
                    </p>
                  </div>
                </div>
                <p className="mt-2 truncate text-[10.5px] text-muted-foreground/55">
                  {agent.detail}
                </p>
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-[2px] rounded-t-full",
                    agent.status === "Active" ? toneRail[agent.tone] : "bg-white/[0.06]",
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </div>
    </GlowPanel>
  );
}

function statusText(status: AgentActivityItem["status"]) {
  if (status === "Active") return "text-success";
  if (status === "Idle") return "text-gold";
  if (status === "Needs Key") return "text-warning";
  return "text-teal-accent";
}

function getProgressWidthClass(value: number) {
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
