import Link from "next/link";
import {
  Users,
  ClipboardList,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PipelineTable } from "@/components/dashboard/PipelineTable";
import { TodayLabel } from "@/components/dashboard/TodayLabel";

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

  return (
    <div className="px-10 py-12">

      {/* Page header */}
      <header className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.26em] uppercase text-muted-foreground/60 mb-4">
            BMK Financial Services
          </p>
          <h1 className="text-[34px] font-semibold tracking-tight text-foreground leading-[1.05]">
            Good morning, Brad.
          </h1>
          <p className="mt-4 text-[14px] text-muted-foreground/80 tracking-tight">
            <TodayLabel /> &nbsp;·&nbsp; Client Fact Find Command Centre
          </p>
        </div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-[13px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors tracking-tight shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_4px_14px_-4px_rgba(212,175,55,0.45)]"
        >
          New Client
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-4 gap-5 mb-14">
        <KpiCard
          label="Active Clients"
          value={metrics.active}
          icon={Users}
          iconColor="text-gold"
          iconBg="bg-gold/12"
          accentFrom="from-gold/50"
        />
        <KpiCard
          label="Fact Finds In Progress"
          value={metrics.inProgress}
          icon={ClipboardList}
          iconColor="text-blue-accent"
          iconBg="bg-blue-accent/12"
          accentFrom="from-blue-accent/50"
        />
        <KpiCard
          label="Ready for Meeting"
          value={metrics.ready}
          icon={Calendar}
          iconColor="text-amber-300"
          iconBg="bg-amber-400/12"
          accentFrom="from-amber-400/50"
        />
        <KpiCard
          label="Needs Review"
          value={metrics.needsReview}
          icon={AlertCircle}
          iconColor="text-orange-300"
          iconBg="bg-orange-400/12"
          accentFrom="from-orange-400/50"
        />
      </section>

      {/* Sarah brief */}
      <section className="mb-14 rounded-xl border border-border/70 bg-card overflow-hidden">
        <div className="flex">
          <div className="w-[2px] shrink-0 bg-gradient-to-b from-gold/70 via-gold/30 to-transparent" />
          <div className="flex-1 px-9 py-8">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/12 border border-gold/30">
                <Sparkles className="h-[15px] w-[15px] text-gold" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.26em] text-gold/90 uppercase leading-none">
                  Sarah
                </p>
                <p className="text-[11px] text-muted-foreground/75 tracking-tight mt-1.5">
                  AI Adviser Intelligence &nbsp;·&nbsp; Today's Brief
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
                  <p className="text-[14px] text-foreground/82 leading-relaxed tracking-tight">
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
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
              Client Pipeline
            </h2>
            <span className="inline-flex items-center rounded-full bg-white/[0.04] border border-border/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground/80 tabular-nums">
              {CLIENTS.length}
            </span>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground/75 hover:text-gold transition-colors tracking-tight"
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
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  accentFrom: string;
}) {
  return (
    <div className="group rounded-xl border border-border/70 bg-card overflow-hidden transition-colors hover:border-border">
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", accentFrom)} />
      <div className="px-7 pt-7 pb-7">
        <div className="flex items-start justify-between mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70 leading-snug max-w-[140px]">
            {label}
          </p>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full shrink-0 transition-transform group-hover:scale-105",
              iconBg
            )}
          >
            <Icon className={cn("h-[15px] w-[15px]", iconColor)} />
          </div>
        </div>
        <p className="text-[56px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
