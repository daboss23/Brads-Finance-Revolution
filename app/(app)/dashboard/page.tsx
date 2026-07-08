import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Cpu,
  FileSignature,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { ACTION_QUEUE, AGENTS, PRIORITY_META, getAgent } from "@/lib/agents";
import { CLIENTS, STATUS_CONFIG } from "@/lib/data";
import { getPipelineMetrics } from "@/lib/soa/soa-pipeline";
import { TodayLabel } from "@/components/dashboard/TodayLabel";
import { Badge } from "@/components/ui/badge";
import { TelemetryRing } from "@/components/ui/telemetry-ring";
import { cn } from "@/lib/utils";

function getMetrics() {
  const active = CLIENTS.length;
  const inProgress = CLIENTS.filter((c) => c.status === "in-progress").length;
  const ready = CLIENTS.filter((c) => c.status === "ready-for-meeting").length;
  const needsReview = CLIENTS.filter((c) => c.status === "review-required").length;
  const notStarted = CLIENTS.filter((c) => c.status === "link-sent").length;
  const avgProgress = Math.round(
    CLIENTS.reduce((sum, client) => sum + client.progress, 0) /
      Math.max(CLIENTS.length, 1),
  );
  return { active, inProgress, ready, needsReview, notStarted, avgProgress };
}

const mapRows = [
  "0000000011110000000000000011100000000",
  "0000001112221110000000011122211100000",
  "0000111223332211100000112233332111000",
  "0001122233333322111001122333333221000",
  "0000112223333221100011222333322110000",
  "0000001122221110000011112221110000000",
  "0000000011110000000000111110000000000",
  "0000000000000000000011122211100000000",
  "0000000000000000000112233332110000000",
  "0000000000000000000011222211000000000",
];

const graphBars = [
  "h-12",
  "h-20",
  "h-28",
  "h-16",
  "h-24",
  "h-32",
  "h-14",
  "h-36",
];

const advisorPulse = [
  { label: "Discovery", value: 78, tone: "gold" },
  { label: "Compliance", value: 63, tone: "orange" },
  { label: "SOA", value: 91, tone: "emerald" },
];

const liquidTile =
  "border border-white/[0.10] bg-[linear-gradient(135deg,rgba(255,255,255,0.13),rgba(34,211,238,0.10)_34%,rgba(217,70,239,0.08)_66%,rgba(5,10,20,0.42))] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_32px_-20px_rgba(34,211,238,0.95),0_16px_36px_-26px_rgba(0,0,0,0.95)] backdrop-blur-xl";

const liquidLink =
  "border border-white/[0.10] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(34,211,238,0.08)_46%,rgba(217,70,239,0.07))] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_24px_-18px_rgba(34,211,238,0.8)] transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.08] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_30px_-14px_rgba(34,211,238,0.85)]";

export default function DashboardPage() {
  const metrics = getMetrics();
  const soa = getPipelineMetrics();
  const soaTotal =
    soa.inGeneration + soa.awaitingReview + soa.approvedReady + soa.signedThisMonth;
  const soaReadyPct = soaTotal
    ? Math.round(((soa.approvedReady + soa.signedThisMonth) / soaTotal) * 100)
    : 0;
  const clearedToday = AGENTS.reduce((sum, agent) => sum + agent.completedToday, 0);
  const queued = AGENTS.reduce((sum, agent) => sum + agent.queueDepth, 0);
  const fleetLoad = Math.round(
    AGENTS.reduce((sum, agent) => sum + agent.workload, 0) / Math.max(AGENTS.length, 1),
  );
  const reviewClients = CLIENTS.filter((client) => client.status === "review-required");
  const heroClient = CLIENTS.find((client) => client.id === "sarah-mitchell") ?? CLIENTS[0];

  return (
    <main className="relative isolate min-h-[100dvh] overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,hsl(184_88%_58%/0.15),transparent_26%),radial-gradient(circle_at_86%_8%,hsl(286_88%_64%/0.12),transparent_24%),radial-gradient(circle_at_50%_110%,hsl(var(--gold)/0.16),transparent_32%),linear-gradient(145deg,hsl(216_30%_12%),hsl(220_30%_4%)_54%,hsl(270_28%_8%))]" />
      <div className="absolute inset-x-8 top-5 -z-10 h-28 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute bottom-0 right-10 -z-10 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <section className="mx-auto max-w-[1480px] overflow-hidden rounded-[24px] border border-cyan-200/20 bg-[linear-gradient(135deg,hsl(220_18%_12%/0.82),hsl(220_24%_5%/0.90))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_0_1px_rgba(217,70,239,0.10),0_32px_90px_-34px_rgba(0,0,0,0.95),0_0_70px_-42px_rgba(34,211,238,0.85)] backdrop-blur-2xl">
        <TopBar metrics={metrics} />

        <div className="grid gap-3 p-3 lg:grid-cols-[300px_minmax(0,1fr)_330px] xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <aside className="grid gap-3">
            <CommandPanel className="min-h-[310px]" eyebrow="Telemetry" title="Advice signal">
              <div className="mt-3 grid place-items-center">
                <RadarDial value={metrics.avgProgress} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <TinyStat label="Active" value={metrics.active} />
                <TinyStat label="Ready" value={metrics.ready} />
                <TinyStat label="Review" value={metrics.needsReview} danger />
              </div>
            </CommandPanel>

            <CommandPanel eyebrow="Sarah" title="Operating brief">
              <div className="mt-4 space-y-3">
                <BriefLine
                  label="Priority file"
                  value={`${heroClient.name} at ${heroClient.progress}%`}
                />
                <BriefLine
                  label="Client movement"
                  value={`${metrics.inProgress} fact finds currently progressing`}
                />
                <BriefLine
                  label="Follow up"
                  value={`${metrics.notStarted} client${metrics.notStarted === 1 ? "" : "s"} still not started`}
                />
              </div>
            </CommandPanel>

            <CommandPanel eyebrow="Momentum" title="Fact find curve">
              <MiniAreaChart />
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[34px] font-semibold leading-none tracking-normal text-gold">
                    {metrics.avgProgress}%
                  </p>
                  <p className="mt-1 cmd-label text-muted-foreground/55">Average completion</p>
                </div>
                <Link
                  href="/clients"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground/70 transition hover:text-gold"
                >
                  Clients <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CommandPanel>
          </aside>

          <section className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-3">
              <HeroMetric
                label="Client files"
                value={`${metrics.active}/3`}
                detail="Three files need Brad-level attention today"
                icon={Users}
              />
              <HeroMetric
                label="SOA readiness"
                value={`${soaReadyPct}%`}
                detail={`${soa.approvedReady + soa.signedThisMonth} of ${soaTotal} files approved or signed`}
                icon={FileSignature}
                tone="gold"
              />
              <HeroMetric
                label="Agent fleet"
                value={`${fleetLoad}%`}
                detail={`${queued} queued, ${clearedToday} cleared today`}
                icon={Cpu}
                tone="orange"
              />
            </div>

            <div className="grid gap-3 xl:grid-cols-[1fr_260px]">
              <CommandPanel
                eyebrow="Pipeline"
                title="Revenue and advice movement"
                className="min-h-[338px]"
                action={
                  <Link
                    href="/soa"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground/70 transition hover:text-gold"
                  >
                    SOA <ArrowRight className="h-3 w-3" />
                  </Link>
                }
              >
                <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_1.1fr]">
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      <DataPlate label="In generation" value={soa.inGeneration} />
                      <DataPlate label="Awaiting review" value={soa.awaitingReview} />
                      <DataPlate label="Approved" value={soa.approvedReady} />
                      <DataPlate label="Signed" value={soa.signedThisMonth} />
                    </div>
                    <div className={cn("mt-5 rounded-lg p-4", liquidTile)}>
                      <div className="flex items-center gap-2 text-gold">
                        <Sparkles className="h-4 w-4" />
                        <p className="cmd-label">Sarah recommendation</p>
                      </div>
                      <p className="mt-3 text-[13px] leading-6 text-foreground/78">
                        Start with David Okafor evidence, then move Sarah Mitchell into
                        meeting prep once insurance context is confirmed.
                      </p>
                    </div>
                  </div>
                  <BarCluster />
                </div>
              </CommandPanel>

              <CommandPanel eyebrow="Pulse" title="Advisor load">
                <div className="mt-5 space-y-5">
                  {advisorPulse.map((item) => (
                    <LoadRow key={item.label} {...item} />
                  ))}
                </div>
                <div className={cn("mt-6 rounded-lg p-4", liquidTile)}>
                  <p className="text-[12px] leading-5 text-muted-foreground/70">
                    Review pressure is concentrated in compliance and pre-SOA evidence.
                  </p>
                </div>
              </CommandPanel>
            </div>

            <CommandPanel
              eyebrow="Client matrix"
              title="Files moving now"
              action={
                <Link
                  href="/clients"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground/70 transition hover:text-gold"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              }
            >
              <ClientMatrix />
            </CommandPanel>
          </section>

          <aside className="grid gap-3">
            <CommandPanel eyebrow="Territory" title="Newcastle advice map">
              <MapMatrix />
              <div className="mt-4 grid grid-cols-3 gap-2">
                <TinyStat label="Booked" value={metrics.ready} />
                <TinyStat label="SOA" value={soa.inGeneration} />
                <TinyStat label="Risk" value={reviewClients.length} danger />
              </div>
            </CommandPanel>

            <CommandPanel eyebrow="Compliance" title="Gate pressure">
              <div className="mt-5 grid place-items-center">
                <TelemetryRing
                  value={83}
                  tone="orange"
                  size={152}
                  stroke={12}
                  label="83"
                  sublabel="Score"
                />
              </div>
              <div className="mt-5 space-y-2">
                {reviewClients.slice(0, 3).map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}/compliance`}
                    className={cn("group flex items-center justify-between rounded-lg px-3 py-2.5", liquidLink)}
                  >
                    <span className="truncate text-[12px] text-foreground/80">
                      {client.name}
                    </span>
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-300" />
                  </Link>
                ))}
              </div>
            </CommandPanel>

            <CommandPanel eyebrow="Action queue" title="Brad next">
              <ul className="mt-4 space-y-2.5">
                {ACTION_QUEUE.slice(0, 4).map((item) => {
                  const priority = PRIORITY_META[item.priority];
                  const agent = getAgent(item.agentId);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={cn("group flex items-start gap-3 rounded-lg px-3 py-3", liquidLink)}
                      >
                        <span
                          className={cn(
                            "mt-0.5 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                            priority.bg,
                            priority.border,
                            priority.text,
                          )}
                        >
                          {priority.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-[12px] leading-5 text-foreground/82">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-[10px] font-semibold uppercase text-muted-foreground/45">
                            {agent?.name}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CommandPanel>
          </aside>
        </div>
      </section>
    </main>
  );
}

function TopBar({ metrics }: { metrics: ReturnType<typeof getMetrics> }) {
  return (
    <header className="flex flex-col gap-4 border-b border-cyan-200/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(34,211,238,0.06)_38%,rgba(217,70,239,0.05))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_44px_-36px_rgba(34,211,238,0.75)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between lg:px-5">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/25 bg-gold/15 text-[11px] font-bold text-gold">
            B
          </span>
          <p className="cmd-label text-muted-foreground/60">BMK Financial Services</p>
          <span className="h-1 w-1 rounded-full bg-gold/50" />
          <p className="text-[12px] text-muted-foreground/70">
            <TodayLabel />
          </p>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold leading-none tracking-normal text-foreground sm:text-[34px]">
          Advice command dashboard
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className={cn("hidden items-center gap-2 rounded-full px-3 py-2 text-muted-foreground/65 sm:flex", liquidTile)}>
          <Search className="h-3.5 w-3.5" />
          <span className="text-[12px]">Search clients, SOAs, evidence</span>
        </div>
        <TopPill icon={Activity} label="Live" value={`${metrics.active} files`} />
        <Link
          href="/clients"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-cyan-200/30 bg-[linear-gradient(135deg,hsl(180_86%_58%),hsl(220_90%_68%)_56%,hsl(286_88%_64%))] px-4 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_30px_-12px_rgba(34,211,238,0.9),0_0_30px_-16px_rgba(217,70,239,0.9)] transition hover:scale-[1.02]"
        >
          New client <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}

function CommandPanel({
  eyebrow,
  title,
  action,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-lg border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(34,211,238,0.07)_30%,rgba(217,70,239,0.06)_62%,rgba(5,10,20,0.78))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(34,211,238,0.12),0_22px_54px_-34px_rgba(0,0,0,0.95),0_0_42px_-28px_rgba(34,211,238,0.95),0_0_42px_-30px_rgba(217,70,239,0.8)] backdrop-blur-2xl",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-lg before:bg-[linear-gradient(128deg,rgba(255,255,255,0.18),transparent_28%,rgba(34,211,238,0.11)_54%,rgba(217,70,239,0.12)_76%,transparent)]",
        "after:pointer-events-none after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.95),rgba(217,70,239,0.8),transparent)] after:shadow-[0_0_18px_3px_rgba(34,211,238,0.45)]",
        className,
      )}
    >
      <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl transition group-hover:bg-cyan-300/16" />
      <span className="pointer-events-none absolute -bottom-16 left-8 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-2xl transition group-hover:bg-fuchsia-500/16" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="cmd-label text-gold/75">{eyebrow}</p>
          <h2 className="mt-1 text-[17px] font-semibold tracking-normal text-foreground">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

function TopPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className={cn("inline-flex h-9 items-center gap-2 rounded-full px-3", liquidTile)}>
      <Icon className="h-3.5 w-3.5 text-gold" />
      <span className="text-[10px] font-bold uppercase text-muted-foreground/55">
        {label}
      </span>
      <span className="text-[12px] font-semibold text-foreground/85">{value}</span>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  tone?: "blue" | "gold" | "orange";
}) {
  const toneClass = {
    blue: "text-blue-accent bg-blue-accent/10 border-blue-accent/20",
    gold: "text-gold bg-gold/10 border-gold/25",
    orange: "text-orange-300 bg-orange-500/10 border-orange-500/25",
  }[tone];

  return (
    <CommandPanel eyebrow={label} title={value}>
      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="max-w-[190px] text-[12px] leading-5 text-muted-foreground/70">
          {detail}
        </p>
        <div className={cn("grid h-12 w-12 place-items-center rounded-lg border shadow-[inset_0_1px_0_rgba(255,255,255,0.20),0_0_24px_-14px_rgba(34,211,238,0.75)] backdrop-blur-xl", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CommandPanel>
  );
}

function RadarDial({ value }: { value: number }) {
  return (
    <div className="relative grid h-48 w-48 place-items-center rounded-full border border-cyan-200/25 bg-[radial-gradient(circle_at_35%_30%,hsl(180_86%_58%/0.28),transparent_34%),radial-gradient(circle_at_68%_72%,hsl(286_88%_64%/0.22),transparent_38%),radial-gradient(circle,hsl(43_62%_54%/0.18),transparent_60%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_45px_-16px_rgba(34,211,238,0.85),0_0_42px_-20px_rgba(217,70,239,0.75)]">
      <div className="absolute inset-4 rounded-full border border-gold/20" />
      <div className="absolute inset-10 rounded-full border border-gold/20" />
      <div className="absolute left-1/2 top-5 h-[152px] w-px -translate-x-1/2 bg-gold/25" />
      <div className="absolute left-5 top-1/2 h-px w-[152px] -translate-y-1/2 bg-gold/25" />
      <div className="absolute inset-7 rounded-full border border-dashed border-gold/35" />
      <div className="absolute h-24 w-24 rotate-45 rounded-lg border border-white/10 bg-[linear-gradient(135deg,hsl(43_68%_60%/0.18),transparent)] shadow-[0_0_45px_-12px_hsl(43_68%_52%/0.65)]" />
      <div className="relative text-center">
        <p className="text-[38px] font-semibold leading-none tracking-normal text-foreground">
          {value}
          <span className="text-[17px] text-gold/70">%</span>
        </p>
        <p className="mt-2 cmd-label text-muted-foreground/55">File health</p>
      </div>
    </div>
  );
}

function TinyStat({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className={cn("rounded-lg px-3 py-3", liquidTile)}>
      <p className={cn("text-[22px] font-semibold leading-none", danger ? "text-orange-300" : "text-foreground")}>
        {value}
      </p>
      <p className="mt-1.5 cmd-label text-muted-foreground/45">{label}</p>
    </div>
  );
}

function BriefLine({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-lg px-3.5 py-3", liquidTile)}>
      <p className="cmd-label text-muted-foreground/45">{label}</p>
      <p className="mt-1.5 text-[13px] leading-5 text-foreground/82">{value}</p>
    </div>
  );
}

function MiniAreaChart() {
  return (
    <div className={cn("mt-5 h-32 rounded-lg p-3", liquidTile)}>
      <svg viewBox="0 0 260 100" className="h-full w-full" aria-hidden="true">
        <path
          d="M0 82 L32 66 L64 72 L96 42 L128 52 L160 28 L192 38 L224 18 L260 26 L260 100 L0 100 Z"
          className="fill-gold/15"
        />
        <path
          d="M0 82 L32 66 L64 72 L96 42 L128 52 L160 28 L192 38 L224 18 L260 26"
          className="fill-none stroke-gold/75"
          strokeWidth="2"
        />
        <path
          d="M0 88 L260 88"
          className="stroke-white/10"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function DataPlate({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn("rounded-lg px-4 py-3", liquidTile)}>
      <p className="cmd-label text-muted-foreground/45">{label}</p>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-normal text-foreground">
        {value}
      </p>
    </div>
  );
}

function BarCluster() {
  return (
    <div className={cn("flex h-60 items-end gap-3 rounded-lg px-5 pb-5 pt-8", liquidTile)}>
      {graphBars.map((height, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-2">
          <div
            className={cn(
              "w-full rounded-t-full border border-gold/25 bg-[linear-gradient(180deg,hsl(39_90%_72%),hsl(34_72%_48%))] shadow-[0_0_22px_-9px_hsl(38_80%_58%/0.75)]",
              height,
            )}
          />
          <span className="text-[9px] font-semibold uppercase text-muted-foreground/40">
            {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

function LoadRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  const fill = {
    gold: "bg-gold",
    orange: "bg-orange-400",
    emerald: "bg-emerald-400",
  }[tone] ?? "bg-gold";
  const width = getWidthClass(value);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="cmd-label text-muted-foreground/55">{label}</p>
        <p className="text-[12px] font-semibold text-foreground/85">{value}%</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div className={cn("h-full rounded-full", fill, width)} />
      </div>
    </div>
  );
}

function MapMatrix() {
  return (
    <div className="mt-5 rounded-lg border border-cyan-200/15 bg-[radial-gradient(circle_at_26%_18%,hsl(180_86%_58%/0.14),transparent_24%),radial-gradient(circle_at_68%_36%,hsl(286_88%_64%/0.14),transparent_28%),radial-gradient(circle_at_68%_36%,hsl(43_68%_52%/0.16),transparent_26%),linear-gradient(180deg,hsl(220_18%_12%/0.82),hsl(220_22%_6%/0.88))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_34px_-22px_rgba(34,211,238,0.8)] backdrop-blur-xl">
      <div className="grid gap-[3px]">
        {mapRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-[3px]">
            {row.split("").map((cell, cellIndex) => (
              <span
                key={`${rowIndex}-${cellIndex}`}
                className={cn(
                  "h-1.5 w-1.5 rounded-[1px]",
                  cell === "0" && "bg-transparent",
                  cell === "1" && "bg-white/[0.12]",
                  cell === "2" && "bg-gold/35",
                  cell === "3" && "bg-gold/70",
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="cmd-label text-muted-foreground/45">Regional flow</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Live
        </span>
      </div>
    </div>
  );
}

function ClientMatrix() {
  return (
    <div className={cn("mt-4 overflow-hidden rounded-lg", liquidTile)}>
      <div className="grid grid-cols-[1.35fr_0.65fr_0.85fr_1fr_auto] gap-3 border-b border-cyan-200/10 bg-white/[0.035] px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground/45">
        <span>Client</span>
        <span>Progress</span>
        <span>Status</span>
        <span>Next action</span>
        <span />
      </div>
      <div className="divide-y divide-white/[0.055]">
        {CLIENTS.slice(0, 6).map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="grid grid-cols-1 gap-3 px-4 py-3 transition hover:bg-cyan-300/[0.04] md:grid-cols-[1.35fr_0.65fr_0.85fr_1fr_auto] md:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/20 bg-gold/10 text-[10px] font-bold text-gold">
                {client.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="truncate text-[13px] font-medium text-foreground/88">
                {client.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div className={cn("h-full rounded-full bg-gold", getWidthClass(client.progress))} />
              </div>
              <span className="w-9 text-right text-[11px] text-muted-foreground/65">
                {client.progress}%
              </span>
            </div>
            <Badge className={STATUS_CONFIG[client.status].className}>
              {STATUS_CONFIG[client.status].label}
            </Badge>
            <p className="truncate text-[12px] text-muted-foreground/68">
              {client.nextAction}
            </p>
            <ArrowRight className="hidden h-3.5 w-3.5 text-muted-foreground/45 md:block" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function getWidthClass(value: number) {
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
