import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  FileSignature,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import {
  ACTION_QUEUE,
  AGENTS,
  PRIORITY_META,
  STATUS_META,
  getActionClientName,
  getAgent,
} from "@/lib/agents";
import { TodayLabel } from "@/components/dashboard/TodayLabel";
import { Badge } from "@/components/ui/badge";
import { CLIENTS, STATUS_CONFIG, type Client } from "@/lib/data";
import {
  getAllPipelineRows,
  PIPELINE_STAGE_LABELS,
  STAGE_TONE,
  type ClientPipelineRow,
  type PipelineStage,
} from "@/lib/soa/soa-pipeline";
import { cn } from "@/lib/utils";

const advisorPulse = [
  { label: "Discovery", value: 78, tone: "gold" as const },
  { label: "Compliance", value: 63, tone: "orange" as const },
  { label: "SOA", value: 91, tone: "emerald" as const },
];

const liquidTile =
  "border border-white/[0.10] bg-[linear-gradient(135deg,rgba(255,255,255,0.13),rgba(34,211,238,0.10)_34%,rgba(217,70,239,0.08)_66%,rgba(5,10,20,0.42))] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_32px_-20px_rgba(34,211,238,0.95),0_16px_36px_-26px_rgba(0,0,0,0.95)] backdrop-blur-xl";

const liquidLink =
  "border border-white/[0.10] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(34,211,238,0.08)_46%,rgba(217,70,239,0.07))] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_24px_-18px_rgba(34,211,238,0.8)] transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.08] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_30px_-14px_rgba(34,211,238,0.85)]";

const STAGE_SEQUENCE: PipelineStage[] = [
  "fact-find",
  "compliance",
  "soa-in-progress",
  "soa-review",
  "soa-signed",
];

function getDashboardState() {
  const pipelineRows = getAllPipelineRows();
  const rowMap = new Map(pipelineRows.map((row) => [row.client.id, row]));
  const stageCounts = pipelineRows.reduce<Record<PipelineStage, number>>(
    (acc, row) => {
      acc[row.stage] += 1;
      return acc;
    },
    {
      "fact-find": 0,
      compliance: 0,
      "soa-in-progress": 0,
      "soa-review": 0,
      "soa-approved": 0,
      "soa-sent": 0,
      "soa-signed": 0,
    },
  );

  const activeClients = CLIENTS.length;
  const factFindsInProgress = CLIENTS.filter(
    (client) => client.status === "in-progress",
  ).length;
  const readyMeetingClients = CLIENTS.filter(
    (client) => client.status === "ready-for-meeting",
  );
  const readyForMeeting = readyMeetingClients.length;
  const readyForSoA = stageCounts["soa-in-progress"];
  const reviewRequiredClients = CLIENTS.filter(
    (client) => client.status === "review-required",
  );
  const linkSentClients = CLIENTS.filter((client) => client.status === "link-sent");
  const complianceRows = pipelineRows.filter((row) => row.stage === "compliance");
  const reviewRows = pipelineRows.filter((row) => row.stage === "soa-review");
  const highPriorityQueue = ACTION_QUEUE.filter(
    (item) => item.priority === "critical" || item.priority === "high",
  );

  const attentionIds = new Set<string>();
  highPriorityQueue.forEach((item) => {
    if (item.clientId) attentionIds.add(item.clientId);
  });
  reviewRequiredClients.forEach((client) => attentionIds.add(client.id));
  linkSentClients.forEach((client) => attentionIds.add(client.id));
  complianceRows.forEach((row) => attentionIds.add(row.client.id));
  reviewRows.forEach((row) => attentionIds.add(row.client.id));

  const attentionClients = CLIENTS.filter((client) => attentionIds.has(client.id)).sort(
    (a, b) => {
      const aRow = rowMap.get(a.id);
      const bRow = rowMap.get(b.id);
      return getAttentionScore(b, bRow) - getAttentionScore(a, aRow);
    },
  );

  const nextMeetingClients = [...readyMeetingClients].sort(
    (a, b) => getTime(a.meetingDate) - getTime(b.meetingDate),
  );
  const blockedCount = complianceRows.length + reviewRequiredClients.length;
  const needsAttention = attentionClients.length;
  const completedOrSigned = new Set(
    CLIENTS.filter((client) => client.status === "complete").map((client) => client.id),
  );
  pipelineRows
    .filter((row) => row.stage === "soa-signed")
    .forEach((row) => completedOrSigned.add(row.client.id));

  return {
    activeClients,
    factFindsInProgress,
    readyForMeeting,
    readyForSoA,
    needsAttention,
    reviewRequiredClients,
    linkSentClients,
    complianceRows,
    reviewRows,
    blockedCount,
    pipelineRows,
    rowMap,
    stageCounts,
    attentionClients,
    nextMeetingClients,
    completedOrSignedCount: completedOrSigned.size,
  };
}

export default function DashboardPage() {
  const state = getDashboardState();

  return (
    <main className="relative isolate min-h-[100dvh] overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,hsl(184_88%_58%/0.15),transparent_26%),radial-gradient(circle_at_86%_8%,hsl(286_88%_64%/0.12),transparent_24%),radial-gradient(circle_at_50%_110%,hsl(var(--gold)/0.16),transparent_32%),linear-gradient(145deg,hsl(216_30%_12%),hsl(220_30%_4%)_54%,hsl(270_28%_8%))]" />
      <div className="absolute inset-x-8 top-5 -z-10 h-28 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute bottom-0 right-10 -z-10 size-56 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <section className="mx-auto max-w-[1480px] overflow-hidden rounded-[24px] border border-cyan-200/20 bg-[linear-gradient(135deg,hsl(220_18%_12%/0.82),hsl(220_24%_5%/0.90))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_0_1px_rgba(217,70,239,0.10),0_32px_90px_-34px_rgba(0,0,0,0.95),0_0_70px_-42px_rgba(34,211,238,0.85)] backdrop-blur-2xl">
        <TopBar activeClients={state.activeClients} />

        <div className="grid gap-3 p-3 xl:gap-4 xl:p-4">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <PriorityMetricCard
              label="Active Clients"
              value={state.activeClients}
              detail="Clients currently moving through onboarding or advice workflow"
              icon={Users}
              tone="blue"
              widthValue={100}
            />
            <PriorityMetricCard
              label="Fact Finds In Progress"
              value={state.factFindsInProgress}
              detail="Clients still completing Financial Discovery"
              icon={Activity}
              tone="blue"
              widthValue={Math.round((state.factFindsInProgress / Math.max(state.activeClients, 1)) * 100)}
            />
            <PriorityMetricCard
              label="Ready For Meeting"
              value={state.readyForMeeting}
              detail="Clients prepared for adviser meeting or review"
              icon={Users}
              tone="gold"
              widthValue={Math.round((state.readyForMeeting / Math.max(state.activeClients, 1)) * 100)}
            />
            <PriorityMetricCard
              label="Ready For SOA"
              value={state.readyForSoA}
              detail="Files ready to move into Statement of Advice production"
              icon={FileSignature}
              tone="emerald"
              widthValue={Math.round((state.readyForSoA / Math.max(state.activeClients, 1)) * 100)}
            />
            <PriorityMetricCard
              label="Needs Attention"
              value={state.needsAttention}
              detail="Clients or files blocked, incomplete, or requiring follow-up"
              icon={AlertTriangle}
              tone="orange"
              widthValue={Math.round((state.needsAttention / Math.max(state.activeClients, 1)) * 100)}
              emphasis
            />
          </section>

          <section className="grid gap-3 xl:grid-cols-[1.4fr_1fr_0.95fr]">
            <CommandPanel
              eyebrow="Action"
              title="Priority Queue"
              className="min-h-[360px]"
              action={<QueueSummary count={ACTION_QUEUE.length} />}
            >
              <div className="mt-5 flex flex-col gap-3">
                {ACTION_QUEUE.slice(0, 5).map((item) => {
                  const priority = PRIORITY_META[item.priority];
                  const agent = getAgent(item.agentId);
                  const clientName = getActionClientName(item) ?? "Operational file";
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "dashboard-event-glow group rounded-xl px-4 py-4",
                        liquidLink,
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          className={cn(
                            "mt-0.5 shrink-0 border px-2 py-1 text-[9px] font-bold uppercase",
                            priority.bg,
                            priority.border,
                            priority.text,
                          )}
                        >
                          {priority.label}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-5 text-foreground/84">
                            {item.label}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase text-muted-foreground/45">
                            <span>{agent?.name}</span>
                            <span className="size-1 rounded-full bg-white/25" />
                            <span>{clientName}</span>
                          </div>
                        </div>
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/45 transition group-hover:text-gold" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CommandPanel>

            <CommandPanel eyebrow="Pipeline" title="Snapshot">
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <SnapshotCell
                  label="Link Sent"
                  value={state.linkSentClients.length}
                  tone="zinc"
                />
                <SnapshotCell
                  label="In Progress"
                  value={state.factFindsInProgress}
                  tone="blue"
                />
                <SnapshotCell
                  label="Ready For Meeting"
                  value={state.readyForMeeting}
                  tone="gold"
                />
                <SnapshotCell
                  label="Ready For SOA"
                  value={state.readyForSoA}
                  tone="emerald"
                />
                <SnapshotCell
                  label="Completed or Signed"
                  value={state.completedOrSignedCount}
                  tone="emerald"
                />
              </div>

              <div className={cn("mt-5 flex flex-col gap-3 rounded-xl p-4", liquidTile)}>
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles className="h-4 w-4" />
                  <p className="cmd-label">Flow reading</p>
                </div>
                <p className="text-[13px] leading-6 text-foreground/78">
                  {getPipelineSummary(state)}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {STAGE_SEQUENCE.map((stage) => (
                  <div
                    key={stage}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
                  >
                    <span className="text-[12px] text-foreground/78">
                      {getStageLabel(stage)}
                    </span>
                    <Badge className={cn("border px-2 py-0.5", STAGE_TONE[stage])}>
                      {stage === "soa-signed"
                        ? state.completedOrSignedCount
                        : state.stageCounts[stage]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CommandPanel>

            <CommandPanel eyebrow="Sarah" title="Brief">
              <div className="mt-5 flex flex-col gap-3">
                <BriefLine
                  label="What changed"
                  value={getWhatChangedLine(state)}
                />
                <BriefLine
                  label="Where clients are stuck"
                  value={getWhereStuckLine(state)}
                />
                <BriefLine
                  label="What needs follow-up"
                  value={getFollowUpLine(state)}
                />
                <BriefLine
                  label="What is ready next"
                  value={getReadyNextLine(state)}
                />
              </div>
            </CommandPanel>
          </section>

          <section className="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="grid gap-3">
              <CommandPanel eyebrow="Workload" title="Adviser Load">
                <div className="mt-5 flex flex-col gap-5">
                  {advisorPulse.map((item) => (
                    <LoadRow key={item.label} {...item} />
                  ))}
                </div>
                <div className={cn("mt-5 rounded-xl p-4", liquidTile)}>
                  <p className="text-[12px] leading-5 text-muted-foreground/70">
                    Discovery remains steady. Compliance is the tightest operational
                    pressure point before more files can shift into SOA.
                  </p>
                </div>
              </CommandPanel>

              <CommandPanel eyebrow="Compliance" title="Pressure">
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <CompactTruth
                    label="Blocked"
                    value={state.blockedCount}
                    tone="orange"
                  />
                  <CompactTruth
                    label="Awaiting review"
                    value={state.reviewRows.length}
                    tone="gold"
                  />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {state.attentionClients.slice(0, 3).map((client) => (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className={cn("rounded-xl px-3 py-3", liquidLink)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-[12px] text-foreground/82">
                          {client.name}
                        </span>
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-300" />
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-muted-foreground/60">
                        {getAttentionReason(client, state.rowMap.get(client.id))}
                      </p>
                    </Link>
                  ))}
                </div>
              </CommandPanel>
            </div>

            <CommandPanel eyebrow="Operations" title="Agent Activity">
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {AGENTS.map((agent) => {
                  const status = STATUS_META[agent.status];
                  return (
                    <div
                      key={agent.id}
                      className="dashboard-event-glow rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-semibold text-foreground/86">
                            {agent.name}
                          </p>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/45">
                            {agent.role}
                          </p>
                        </div>
                        <span className={cn("inline-flex items-center gap-1.5 cmd-label", status.text)}>
                          <span className={cn("status-live size-1.5 rounded-full", status.dot)} />
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 min-h-[40px] text-[12px] leading-5 text-muted-foreground/68">
                        {agent.activeTask}
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={cn(
                              "dashboard-activity-rail h-full rounded-full bg-[linear-gradient(90deg,hsl(180_86%_58%),hsl(220_90%_68%)_52%,hsl(286_88%_64%))]",
                              getWidthClass(agent.workload),
                            )}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-foreground/75">
                          {agent.workload}%
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase text-muted-foreground/45">
                        <span>{agent.queueDepth} queued</span>
                        <span className="size-1 rounded-full bg-white/25" />
                        <span>{agent.completedToday} cleared</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CommandPanel>
          </section>

          <CommandPanel
            eyebrow="File Health"
            title="Attention Detail"
            action={
              <Link
                href="/clients"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground/70 transition hover:text-gold"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            <div className={cn("mt-4 overflow-hidden rounded-xl", liquidTile)}>
              <div className="grid grid-cols-1 gap-3 border-b border-cyan-200/10 bg-white/[0.035] px-4 py-3 text-[10px] font-bold uppercase text-muted-foreground/45 md:grid-cols-[1.2fr_0.95fr_1fr_1.3fr_auto]">
                <span>Client</span>
                <span>Stage</span>
                <span>Why now</span>
                <span>Next action</span>
                <span>Activity</span>
              </div>
              <div className="divide-y divide-white/[0.055]">
                {state.attentionClients.slice(0, 6).map((client) => {
                  const row = state.rowMap.get(client.id);
                  return (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className="grid grid-cols-1 gap-3 px-4 py-3 transition hover:bg-cyan-300/[0.04] md:grid-cols-[1.2fr_0.95fr_1fr_1.3fr_auto] md:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/20 bg-gold/10 text-[10px] font-bold text-gold">
                          {getInitials(client.name)}
                        </span>
                        <span className="truncate text-[13px] font-medium text-foreground/88">
                          {client.name}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={STATUS_CONFIG[client.status].className}>
                          {STATUS_CONFIG[client.status].label}
                        </Badge>
                        {row && (
                          <Badge className={STAGE_TONE[row.stage]}>
                            {getStageLabel(row.stage)}
                          </Badge>
                        )}
                      </div>

                      <p className="text-[12px] leading-5 text-muted-foreground/68">
                        {getAttentionReason(client, row)}
                      </p>

                      <p className="text-[12px] leading-5 text-foreground/80">
                        {client.nextAction}
                      </p>

                      <div className="flex items-center justify-between gap-2 md:block">
                        <span className="text-[11px] text-muted-foreground/58">
                          {client.lastActivity}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/45 md:hidden" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </CommandPanel>
        </div>
      </section>
    </main>
  );
}

function TopBar({ activeClients }: { activeClients: number }) {
  return (
    <header className="flex flex-col gap-4 border-b border-cyan-200/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(34,211,238,0.06)_38%,rgba(217,70,239,0.05))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_44px_-36px_rgba(34,211,238,0.75)] backdrop-blur-2xl md:flex-row md:items-center md:justify-between lg:px-5">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full border border-gold/25 bg-gold/15 text-[11px] font-bold text-gold">
            B
          </span>
          <p className="cmd-label text-muted-foreground/60">BMK Financial Services</p>
          <span className="size-1 rounded-full bg-gold/50" />
          <p className="text-[12px] text-muted-foreground/70">
            <TodayLabel />
          </p>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold leading-none tracking-normal text-foreground sm:text-[34px]">
          Attention dashboard
        </h1>
        <p className="mt-3 max-w-[620px] text-[13px] leading-6 text-muted-foreground/72">
          What needs Brad&apos;s attention right now. The top line shows the truth,
          the second line tells Brad what to do next, and everything below that
          supports action.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className={cn("hidden items-center gap-2 rounded-full px-3 py-2 text-muted-foreground/65 sm:flex", liquidTile)}>
          <Search className="h-3.5 w-3.5" />
          <span className="text-[12px]">Search clients, SOAs, evidence</span>
        </div>
        <TopPill icon={Activity} label="Live" value={`${activeClients} files`} />
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
        "group relative overflow-hidden rounded-[20px] border border-cyan-200/18 bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(34,211,238,0.07)_30%,rgba(217,70,239,0.06)_62%,rgba(5,10,20,0.78))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(34,211,238,0.12),0_22px_54px_-34px_rgba(0,0,0,0.95),0_0_42px_-28px_rgba(34,211,238,0.95),0_0_42px_-30px_rgba(217,70,239,0.8)] backdrop-blur-2xl",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)]" />
      <span className="dashboard-signal pointer-events-none absolute -right-10 top-6 size-28 rounded-full bg-cyan-300/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-14 left-8 size-28 rounded-full bg-fuchsia-500/8 blur-3xl transition group-hover:bg-fuchsia-500/14" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="cmd-label text-gold/75">{eyebrow}</p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-normal text-foreground">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

function PriorityMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  widthValue,
  emphasis = false,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ElementType;
  tone: "blue" | "gold" | "emerald" | "orange";
  widthValue: number;
  emphasis?: boolean;
}) {
  const iconClasses = {
    blue: "border-blue-accent/20 bg-blue-accent/10 text-blue-accent",
    gold: "border-gold/25 bg-gold/10 text-gold",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    orange: "border-orange-500/25 bg-orange-500/10 text-orange-300",
  }[tone];

  const railClasses = {
    blue: "bg-[linear-gradient(90deg,hsl(180_86%_58%),hsl(220_90%_68%)_54%,hsl(286_88%_64%))]",
    gold: "bg-[linear-gradient(90deg,hsl(44_80%_68%),hsl(39_72%_50%))]",
    emerald: "bg-[linear-gradient(90deg,hsl(158_70%_58%),hsl(172_70%_44%))]",
    orange: "bg-[linear-gradient(90deg,hsl(30_92%_64%),hsl(14_84%_54%))]",
  }[tone];

  return (
    <CommandPanel
      eyebrow={label}
      title={String(value)}
      className={cn("dashboard-breathe-soft min-h-[196px]", emphasis && "ring-1 ring-orange-400/10")}
      action={
        <div
          className={cn(
            "grid size-11 place-items-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.20),0_0_24px_-14px_rgba(34,211,238,0.75)] backdrop-blur-xl",
            iconClasses,
          )}
        >
          <Icon className="size-4" />
        </div>
      }
    >
      <p className="mt-5 text-[12px] leading-5 text-muted-foreground/70">
        {detail}
      </p>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn(
            "dashboard-activity-rail h-full rounded-full",
            railClasses,
            getWidthClass(widthValue),
          )}
        />
      </div>
    </CommandPanel>
  );
}

function QueueSummary({ count }: { count: number }) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-2", liquidTile)}>
      <span className="status-live size-1.5 rounded-full bg-gold text-gold" />
      <span className="text-[10px] font-bold uppercase text-muted-foreground/55">
        Live queue
      </span>
      <span className="text-[12px] font-semibold text-foreground/82">{count}</span>
    </div>
  );
}

function SnapshotCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "zinc" | "blue" | "gold" | "emerald";
}) {
  const toneClass = {
    zinc: "text-foreground/88",
    blue: "text-blue-accent",
    gold: "text-gold",
    emerald: "text-emerald-300",
  }[tone];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-3">
      <p className={cn("text-[22px] font-semibold leading-none", toneClass)}>{value}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/45">
        {label}
      </p>
    </div>
  );
}

function BriefLine({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-xl px-3.5 py-3", liquidTile)}>
      <p className="cmd-label text-muted-foreground/45">{label}</p>
      <p className="mt-1.5 text-[13px] leading-5 text-foreground/82">{value}</p>
    </div>
  );
}

function CompactTruth({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gold" | "orange";
}) {
  return (
    <div className={cn("rounded-xl px-3 py-3", liquidTile)}>
      <p
        className={cn(
          "text-[22px] font-semibold leading-none",
          tone === "orange" ? "text-orange-300" : "text-gold",
        )}
      >
        {value}
      </p>
      <p className="mt-1.5 cmd-label text-muted-foreground/45">{label}</p>
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
  tone: "gold" | "orange" | "emerald";
}) {
  const fill = {
    gold: "bg-gold",
    orange: "bg-orange-400",
    emerald: "bg-emerald-400",
  }[tone];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="cmd-label text-muted-foreground/55">{label}</p>
        <p className="text-[12px] font-semibold text-foreground/85">{value}%</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={cn(
            "dashboard-activity-rail h-full rounded-full",
            fill,
            getWidthClass(value),
          )}
        />
      </div>
    </div>
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

function getAttentionScore(client: Client, row?: ClientPipelineRow) {
  let score = 0;

  if (client.status === "review-required") score += 7;
  if (client.status === "link-sent") score += 5;
  if (client.status === "ready-for-meeting") score += 2;
  if (row?.stage === "compliance") score += 6;
  if (row?.stage === "soa-review") score += 4;
  if (client.meetingDate) score += 1;

  return score + Math.round((100 - client.progress) / 20);
}

function getAttentionReason(client: Client, row?: ClientPipelineRow) {
  if (client.status === "review-required") {
    return "Adviser review is holding the file in place.";
  }
  if (row?.stage === "compliance") {
    return "Compliance evidence needs clearing before SOA can progress.";
  }
  if (row?.stage === "soa-review") {
    return "SOA draft is waiting for Brad review.";
  }
  if (client.status === "link-sent") {
    return "Follow-up is needed because the client has not started cleanly.";
  }
  if (client.status === "ready-for-meeting") {
    return "Meeting-ready file can move forward now.";
  }
  return "Operational follow-up is needed on this file.";
}

function getStageLabel(stage: PipelineStage) {
  if (stage === "fact-find") return "Link Sent";
  if (stage === "compliance") return "Ready For Meeting";
  if (stage === "soa-in-progress") return "Ready For SOA";
  if (stage === "soa-review") return "In Review";
  if (stage === "soa-signed") return "Completed or Signed";
  return PIPELINE_STAGE_LABELS[stage];
}

function getPipelineSummary(state: ReturnType<typeof getDashboardState>) {
  if (state.complianceRows.length > 0) {
    return `${state.complianceRows.length} file${state.complianceRows.length === 1 ? "" : "s"} are sitting between meeting readiness and SOA generation. Clearing those blockers unlocks the next wave fastest.`;
  }

  if (state.readyForSoA > 0) {
    return `${state.readyForSoA} file${state.readyForSoA === 1 ? "" : "s"} can move straight into SOA production now.`;
  }

  return "The board is balanced right now with no dominant pressure point.";
}

function getWhatChangedLine(state: ReturnType<typeof getDashboardState>) {
  if (state.nextMeetingClients[0]?.meetingDate) {
    return `${state.nextMeetingClients[0].name} is the nearest meeting-ready file for ${state.nextMeetingClients[0].meetingDate}.`;
  }

  return `${state.factFindsInProgress} fact find${state.factFindsInProgress === 1 ? "" : "s"} are still actively moving.`;
}

function getWhereStuckLine(state: ReturnType<typeof getDashboardState>) {
  if (state.complianceRows[0]) {
    return `${state.complianceRows[0].client.name} is currently the clearest compliance hold before SOA.`;
  }

  if (state.reviewRequiredClients[0]) {
    return `${state.reviewRequiredClients[0].name} needs adviser review before the file can move cleanly.`;
  }

  return "There is no dominant stuck segment at the moment.";
}

function getFollowUpLine(state: ReturnType<typeof getDashboardState>) {
  if (state.linkSentClients.length === 0) {
    return "No untouched fact find links are currently waiting on follow-up.";
  }

  return `${state.linkSentClients.length} client${state.linkSentClients.length === 1 ? "" : "s"} still need a nudge after link send.`;
}

function getReadyNextLine(state: ReturnType<typeof getDashboardState>) {
  if (state.readyForSoA > 0) {
    return `${state.readyForSoA} file${state.readyForSoA === 1 ? "" : "s"} are ready to shift into SOA production next.`;
  }

  if (state.readyForMeeting > 0) {
    return `${state.readyForMeeting} client${state.readyForMeeting === 1 ? "" : "s"} are ready for meeting preparation next.`;
  }

  return "The next lift should come from moving active fact finds toward meeting readiness.";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function getTime(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
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
