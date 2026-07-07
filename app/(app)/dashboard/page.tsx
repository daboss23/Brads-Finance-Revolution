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
} from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PipelineTable } from "@/components/dashboard/PipelineTable";
import { TodayLabel } from "@/components/dashboard/TodayLabel";
import { AgentActivityStrip } from "@/components/dashboard/AgentActivityStrip";
import { ActionQueue } from "@/components/dashboard/ActionQueue";
import { PipelineVitals } from "@/components/dashboard/PipelineVitals";
import { TelemetryRing } from "@/components/ui/telemetry-ring";
import { getPipelineMetrics } from "@/lib/soa/soa-pipeline";

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
  const soaTotal =
    soa.inGeneration + soa.awaitingReview + soa.approvedReady + soa.signedThisMonth;
  const soaReadyPct = soaTotal
    ? Math.round(((soa.approvedReady + soa.signedThisMonth) / soaTotal) * 100)
    : 0;

  return (
    <div className="px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
      {/* Hero header */}
      <header className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="cmd-label mb-4 text-muted-foreground/60">BMK Financial Services</p>
          <h1 className="text-[30px] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[34px]">
            Good morning, Brad.
          </h1>
          <p className="mt-4 text-[14px] tracking-tight text-muted-foreground/80">
            <TodayLabel /> &nbsp;·&nbsp; Financial Advice Command Centre
          </p>
        </div>
        <Link
          href="/clients"
          className="btn-gold inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold tracking-tight text-gold-foreground transition-transform hover:scale-[1.02]"
        >
          New Client
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Today's Operating Brief */}
      <section className="mb-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="h-3.5 w-[2px] rounded-full bg-gold/80" />
          <h2 className="cmd-label text-gold/90">Today&apos;s Operating Brief</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
          <AgentActivityStrip />
          <ActionQueue />
        </div>
      </section>

      {/* Pipeline vitals */}
      <section className="mb-12">
        <PipelineVitals />
      </section>

      {/* KPI cards */}
      <section className="mb-8">
        <div className="mb-5 flex items-center gap-2.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
          <p className="cmd-label text-muted-foreground/70">Client Overview</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          <KpiCard label="Active Clients" value={metrics.active} icon={Users} tone="gold" />
          <KpiCard label="Fact Finds In Progress" value={metrics.inProgress} icon={ClipboardList} tone="blue" />
          <KpiCard label="Ready for Meeting" value={metrics.ready} icon={Calendar} tone="amber" />
          <KpiCard label="Needs Review" value={metrics.needsReview} icon={AlertCircle} tone="orange" />
        </div>
      </section>

      {/* SOA readiness */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSignature className="h-3.5 w-3.5 text-gold" />
            <p className="cmd-label text-gold/90">SOA Readiness</p>
          </div>
          <Link
            href="/soa"
            className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-muted-foreground/75 transition-colors hover:text-gold"
          >
            Open SOA pipeline
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[auto_1fr]">
          <div className="glass-panel edge-gold flex items-center gap-6 px-8 py-6">
            <TelemetryRing value={soaReadyPct} tone="gold" size={116} stroke={9} sublabel="Ready to Send" />
            <div className="max-w-[150px]">
              <p className="text-[13px] font-medium leading-snug tracking-tight text-foreground/85">
                Advice files approved or signed this cycle
              </p>
              <p className="mt-2 text-[12px] tracking-tight text-muted-foreground/60">
                {soa.approvedReady + soa.signedThisMonth} of {soaTotal} in the SOA pipeline
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            <KpiCard label="In Generation" value={soa.inGeneration} icon={Sparkles} tone="blue" compact />
            <KpiCard label="Awaiting Review" value={soa.awaitingReview} icon={Clock} tone="amber" compact />
            <KpiCard label="Approved · Ready" value={soa.approvedReady} icon={CheckCircle2} tone="emerald" compact />
            <KpiCard label="Signed This Month" value={soa.signedThisMonth} icon={Send} tone="gold" compact />
          </div>
        </div>
      </section>

      {/* Sarah brief */}
      <section className="glass-panel mb-12 overflow-hidden">
        <div className="flex">
          <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/70 via-gold/30 to-transparent" />
          <div className="flex-1 px-7 py-7 sm:px-9 sm:py-8">
            <div className="mb-6 flex items-center gap-3.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/12">
                <Sparkles className="h-[15px] w-[15px] text-gold" />
              </div>
              <div>
                <p className="cmd-label leading-none text-gold/90">Sarah</p>
                <p className="mt-1.5 text-[12.5px] tracking-tight text-muted-foreground/90">
                  AI Adviser Intelligence &nbsp;·&nbsp; Today&apos;s Brief
                </p>
              </div>
            </div>
            <ul className="space-y-3.5">
              {[
                `${metrics.notStarted} client${metrics.notStarted !== 1 ? "s have" : " has"} not started their fact find — a follow-up call is recommended.`,
                "Sarah Mitchell is 85% complete and ready for meeting prep ahead of 28 May.",
                "David Okafor and Angela Forsyth both require adviser review before they can progress.",
              ].map((insight, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-gold/55" />
                  <p className="text-[14px] leading-relaxed tracking-tight text-foreground/82">
                    {insight}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Client pipeline */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
              Client Pipeline
            </h2>
            <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground/80">
              {CLIENTS.length}
            </span>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-[12px] tracking-tight text-muted-foreground/75 transition-colors hover:text-gold"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <PipelineTable />
      </section>
    </div>
  );
}

const KPI_TONE: Record<string, { text: string; soft: string; glow: string }> = {
  gold: { text: "text-gold", soft: "bg-gold/12", glow: "from-gold/50" },
  blue: { text: "text-blue-accent", soft: "bg-blue-accent/12", glow: "from-blue-accent/50" },
  amber: { text: "text-amber-300", soft: "bg-amber-400/12", glow: "from-amber-400/50" },
  orange: { text: "text-orange-300", soft: "bg-orange-500/12", glow: "from-orange-400/50" },
  emerald: { text: "text-emerald-300", soft: "bg-emerald-500/12", glow: "from-emerald-500/50" },
};

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  compact = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: keyof typeof KPI_TONE;
  compact?: boolean;
}) {
  const t = KPI_TONE[tone];
  return (
    <div className="glass-panel glass-hover group overflow-hidden">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", t.glow)} />
      <div className={cn("px-6", compact ? "pt-5 pb-5" : "pt-7 pb-7 sm:px-7")}>
        <div className={cn("flex items-start justify-between", compact ? "mb-4" : "mb-7 sm:mb-8")}>
          <p className="cmd-label max-w-[130px] leading-snug text-muted-foreground/70">
            {label}
          </p>
          <div
            className={cn(
              "grid place-items-center rounded-full transition-transform group-hover:scale-105",
              t.soft,
              compact ? "h-8 w-8" : "h-9 w-9"
            )}
          >
            <Icon className={cn("h-[14px] w-[14px]", t.text)} />
          </div>
        </div>
        <p
          className={cn(
            "font-semibold leading-none tracking-tight tabular-nums text-foreground",
            compact ? "text-[34px]" : "text-[44px] sm:text-[52px]"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
