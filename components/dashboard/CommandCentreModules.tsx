import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileSignature,
  KeyRound,
  Mail,
  Mic2,
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
  "brad-review": UserCheck,
  "ready-meeting": CalendarClock,
  "ready-soa": FileSignature,
  signed: PenLine,
};

const agentIcons: Record<AgentActivityItem["name"], IconComponent> = {
  Sarah: Sparkles,
  Beacon: RadioTower,
  Guardian: ShieldCheck,
  Scribe: PenLine,
  Orion: Orbit,
  Atlas: FileSignature,
  Cipher: KeyRound,
  Nexus: Network,
};

const toneText: Record<DashboardTone, string> = {
  cyan: "text-cyan-300",
  blue: "text-blue-accent",
  gold: "text-gold",
  emerald: "text-emerald-300",
  orange: "text-orange-300",
  violet: "text-violet-300",
  slate: "text-foreground/78",
};

const toneBorder: Record<DashboardTone, string> = {
  cyan: "border-cyan-300/25",
  blue: "border-blue-accent/25",
  gold: "border-gold/30",
  emerald: "border-emerald-400/25",
  orange: "border-orange-400/30",
  violet: "border-violet-400/25",
  slate: "border-white/[0.10]",
};

const toneBg: Record<DashboardTone, string> = {
  cyan: "bg-cyan-300/10",
  blue: "bg-blue-accent/10",
  gold: "bg-gold/12",
  emerald: "bg-emerald-400/10",
  orange: "bg-orange-400/12",
  violet: "bg-violet-400/10",
  slate: "bg-white/[0.045]",
};

const toneRail: Record<DashboardTone, string> = {
  cyan: "bg-[linear-gradient(90deg,hsl(180_86%_58%),hsl(210_82%_66%))]",
  blue: "bg-[linear-gradient(90deg,hsl(210_82%_66%),hsl(230_90%_70%))]",
  gold: "bg-[linear-gradient(90deg,hsl(43_68%_54%),hsl(32_88%_58%))]",
  emerald: "bg-[linear-gradient(90deg,hsl(160_70%_58%),hsl(178_76%_44%))]",
  orange: "bg-[linear-gradient(90deg,hsl(32_92%_62%),hsl(14_84%_54%))]",
  violet: "bg-[linear-gradient(90deg,hsl(268_70%_66%),hsl(286_88%_64%))]",
  slate: "bg-[linear-gradient(90deg,hsl(220_12%_68%),hsl(220_16%_52%))]",
};

const priorityClasses: Record<PriorityLevel, string> = {
  critical: "border-orange-500/35 bg-orange-500/12 text-orange-300",
  high: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  medium: "border-blue-accent/30 bg-blue-accent/10 text-blue-accent",
  low: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
};

const nodePositions = [
  "md:left-1/2 md:top-0 md:-translate-x-1/2",
  "md:right-[2%] md:top-[18%]",
  "md:right-0 md:top-1/2 md:-translate-y-1/2",
  "md:right-[12%] md:bottom-[8%]",
  "md:left-[12%] md:bottom-[8%]",
  "md:left-0 md:top-1/2 md:-translate-y-1/2",
  "md:left-[2%] md:top-[18%]",
];

const arrowPositions = [
  "right-[26%] top-[10%] rotate-45",
  "right-[6%] top-[37%] rotate-90",
  "right-[18%] bottom-[24%] rotate-[135deg]",
  "left-[38%] bottom-[8%] rotate-180",
  "left-[13%] bottom-[29%] -rotate-[135deg]",
  "left-[7%] top-[34%] -rotate-90",
  "left-[31%] top-[10%] -rotate-45",
];

export function DashboardHeader({
  activeFiles,
}: {
  activeFiles: number;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-cyan-200/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(34,211,238,0.055)_38%,rgba(217,70,239,0.045))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_54px_-44px_rgba(34,211,238,0.72)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between lg:px-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full border border-gold/25 bg-gold/15 text-[11px] font-bold text-gold">
            B
          </span>
          <p className="cmd-label text-muted-foreground/62">BMK Financial Services</p>
          <span className="size-1 rounded-full bg-gold/55" />
          <p className="text-[12px] text-muted-foreground/72">
            <TodayLabel />
          </p>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold leading-none tracking-normal text-foreground sm:text-[34px]">
          Command centre
        </h1>
        <p className="mt-2 max-w-[660px] text-[13px] leading-6 text-muted-foreground/76">
          Real-time view of clients, onboarding flow and adviser priorities for Brad
          Lonergan.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <label className="hidden h-10 min-w-[260px] items-center gap-2 rounded-full border border-white/[0.11] bg-black/20 px-3 text-muted-foreground/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:flex xl:min-w-[330px]">
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
          className="h-10 rounded-full border border-cyan-200/30 bg-[linear-gradient(135deg,hsl(188_88%_58%),hsl(220_90%_68%)_56%,hsl(268_88%_64%))] px-4 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_30px_-12px_rgba(34,211,238,0.9),0_0_28px_-16px_rgba(217,70,239,0.9)] transition hover:scale-[1.02] hover:text-white"
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
        "group relative overflow-hidden rounded-2xl border border-cyan-200/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.105),rgba(34,211,238,0.065)_32%,rgba(217,70,239,0.052)_64%,rgba(5,10,20,0.80))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(34,211,238,0.10),0_22px_54px_-34px_rgba(0,0,0,0.95),0_0_42px_-30px_rgba(34,211,238,0.85)] backdrop-blur-2xl",
        variant === "emphasis" &&
          "border-cyan-200/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(43,212,255,0.14),0_28px_70px_-34px_rgba(0,0,0,0.95),0_0_54px_-26px_rgba(34,211,238,0.95),0_0_54px_-36px_rgba(217,70,239,0.80)]",
        variant === "alert" && "border-orange-300/24 shadow-[0_0_44px_-30px_rgba(251,146,60,0.95)]",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)]" />
      <span className="dashboard-signal pointer-events-none absolute -right-12 top-8 size-28 rounded-full bg-cyan-300/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-14 left-8 size-28 rounded-full bg-violet-500/8 blur-3xl transition group-hover:bg-violet-500/12" />
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
        "inline-flex h-10 items-center gap-2 rounded-full border px-3 text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
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
        "dashboard-breathe-soft min-h-[154px] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200/28",
        metric.id === "needs-attention" && "border-orange-300/22",
      )}
      variant={metric.id === "needs-attention" ? "alert" : "default"}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("cmd-label", metric.tone === "orange" ? "text-orange-300" : "text-gold/82")}>
            {metric.label}
          </p>
          <p className="mt-3 text-[32px] font-semibold leading-none text-foreground tabular-nums">
            {metric.value}
          </p>
        </div>
        <div
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.20),0_0_24px_-14px_rgba(34,211,238,0.75)] backdrop-blur-xl",
            toneBorder[metric.tone],
            toneBg[metric.tone],
            toneText[metric.tone],
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 min-h-[38px] text-[12px] leading-5 text-muted-foreground/72">
        {metric.description}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn(
            "dashboard-activity-rail h-full rounded-full",
            toneRail[metric.tone],
            getProgressWidthClass(metric.progress),
          )}
        />
      </div>
      <p
        className={cn(
          "mt-3 flex items-center gap-1.5 text-[11px]",
          metric.trend === "No change" ? "text-muted-foreground/60" : "text-emerald-300/86",
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
  return (
    <GlowPanel
      eyebrow="System Core"
      title="Client Progress Engine"
      variant="emphasis"
      className="min-h-[548px] border-cyan-200/25"
      action={
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          <span className="status-live size-1.5 rounded-full bg-emerald-300 text-emerald-300" />
          Live
        </div>
      }
    >
      <p className="mt-3 max-w-[440px] text-[12px] leading-5 text-muted-foreground/70">
        The Sarah onboarding engine drives clients through every advice stage.
      </p>

      <div className="relative mt-5 min-h-[500px] overflow-hidden rounded-2xl border border-cyan-200/10 bg-black/15 px-3 py-4 md:min-h-[430px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(210_82%_66%/0.16),transparent_34%),radial-gradient(circle_at_56%_45%,hsl(43_68%_54%/0.14),transparent_30%)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden size-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/15 md:block" />
        <div className="dashboard-engine-orbit pointer-events-none absolute left-1/2 top-1/2 hidden size-[296px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-200/18 md:block" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden size-[222px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/12 md:block" />

        {arrowPositions.map((position) => (
          <ChevronRight
            key={position}
            className={cn(
              "pointer-events-none absolute hidden size-4 text-cyan-200/42 md:block",
              position,
            )}
          />
        ))}

        <div className="relative z-10 mx-auto grid max-w-[280px] justify-items-center pt-4 md:absolute md:left-1/2 md:top-1/2 md:max-w-none md:-translate-x-1/2 md:-translate-y-1/2 md:pt-0">
          <div className="dashboard-engine-core grid size-44 place-items-center rounded-full border border-cyan-200/25 bg-[radial-gradient(circle_at_38%_30%,rgba(255,255,255,0.20),transparent_20%),radial-gradient(circle_at_62%_48%,hsl(43_68%_54%/0.32),transparent_27%),radial-gradient(circle_at_center,hsl(210_82%_66%/0.28),hsl(222_30%_8%/0.92)_62%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.20),0_0_48px_-10px_rgba(34,211,238,0.65),0_0_48px_-16px_rgba(201,168,76,0.78)]">
            <div className="text-center">
              <div className="mx-auto grid size-10 place-items-center rounded-full border border-cyan-200/30 bg-black/25 text-cyan-200">
                <Sparkles className="size-5" />
              </div>
              <p className="mt-3 text-[20px] font-semibold leading-none text-foreground">
                Sarah
              </p>
              <p className="mt-1 cmd-label text-muted-foreground/72">
                Onboarding Intelligence
              </p>
              <div className="mx-auto mt-3 w-fit rounded-lg border border-gold/25 bg-black/28 px-3 py-2">
                <p className="cmd-label text-muted-foreground/52">In flow</p>
                <p className="mt-1 text-[22px] font-semibold leading-none text-foreground tabular-nums">
                  {totalFilesInFlow}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-6 grid gap-3 md:mt-0 md:block">
          {stages.map((stage, index) => (
            <EngineStageNode
              key={stage.id}
              className={nodePositions[index]}
              index={index + 1}
              stage={stage}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.08] bg-black/18 p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
        <EngineStat label="Average time in flow" value={averageTimeInFlow} tone="cyan" />
        <EngineStat label="Flow velocity" value={flowVelocity} tone="emerald" />
        <EngineStat label="Conversion to meeting" value={conversionToMeeting} tone="violet" />
        <Link
          href="/sarah"
          className="inline-flex min-h-10 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-[12px] font-medium text-muted-foreground/78 transition hover:border-gold/30 hover:text-gold"
        >
          View engine analytics
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </GlowPanel>
  );
}

function EngineStageNode({
  stage,
  index,
  className,
}: {
  stage: WorkflowStage;
  index: number;
  className?: string;
}) {
  const Icon = stageIcons[stage.id] ?? Activity;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-black/38 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_34px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl md:absolute md:w-44",
        toneBorder[stage.tone],
        stage.state === "active" && "dashboard-stage-active",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "relative grid size-10 shrink-0 place-items-center rounded-xl border",
            toneBorder[stage.tone],
            toneBg[stage.tone],
            toneText[stage.tone],
          )}
        >
          <Icon className="size-4" />
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-black/50 bg-card text-[10px] font-semibold text-foreground">
            {stage.count}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground/52 tabular-nums">
              {index}
            </span>
            <p className="text-[11px] font-bold uppercase leading-4 tracking-[0.14em] text-foreground/90">
              {stage.label}
            </p>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground/68">
            {stage.description}
          </p>
        </div>
      </div>
    </div>
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
            className="dashboard-event-glow group rounded-xl border border-white/[0.09] bg-white/[0.035] px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-cyan-200/24 hover:bg-cyan-300/[0.06]"
          >
            <div className="flex items-start gap-3">
              <Badge
                className={cn(
                  "mt-0.5 shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em]",
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
            className="rounded-xl border border-white/[0.08] bg-black/18 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
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
        className="mt-4 inline-flex h-11 w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-[12px] font-medium text-foreground/82 transition hover:border-gold/30 hover:text-gold"
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
            className="rounded-xl border border-white/[0.08] bg-black/20 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
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
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold shadow-[0_0_28px_-16px_rgba(201,168,76,0.85)]">
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
          <span className="size-1.5 rounded-full bg-violet-300" />
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
            className="group flex min-h-10 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-black/16 px-3 text-[12.5px] text-foreground/82 transition hover:border-cyan-200/24 hover:bg-cyan-300/[0.055]"
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
        <div className="rounded-xl border border-white/[0.08] bg-black/18 px-4 py-3">
          <p className="text-[15px] font-semibold text-foreground">System & Agent Activity</p>
          <div
            className={cn(
              "mt-2 flex items-center gap-2 text-[12px] font-medium",
              mockModeActive ? "text-orange-300" : "text-emerald-300",
            )}
          >
            <span
              className={cn(
                "status-live size-2 rounded-full",
                mockModeActive ? "bg-orange-300 text-orange-300" : "bg-emerald-300 text-emerald-300",
              )}
            />
            {systemStatus}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
          {agents.map((agent) => {
            const Icon = agentIcons[agent.name];
            return (
              <Link
                key={agent.name}
                href="/agents"
                className="group rounded-xl border border-white/[0.08] bg-black/18 px-3 py-3 transition hover:border-cyan-200/24 hover:bg-cyan-300/[0.055]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl border",
                      toneBorder[agent.tone],
                      toneBg[agent.tone],
                      toneText[agent.tone],
                    )}
                  >
                    <Icon className="size-4" />
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
              </Link>
            );
          })}
        </div>
      </div>
    </GlowPanel>
  );
}

function statusText(status: AgentActivityItem["status"]) {
  if (status === "Active") return "text-emerald-300";
  if (status === "Idle") return "text-gold";
  if (status === "Needs Key") return "text-orange-300";
  return "text-violet-300";
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
