import Link from "next/link";
import {
  Users,
  ClipboardList,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { CLIENTS, STATUS_CONFIG } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <div className="px-10 py-9 max-w-[1240px] mx-auto">

      {/* Page header */}
      <div className="flex items-end justify-between mb-9">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/60 mb-2">
            BMK Financial Services
          </p>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-none">
            Good morning, Brad.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Tuesday, 19 May 2026 &nbsp;·&nbsp; Client Fact Find Command Centre
          </p>
        </div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 rounded bg-gold px-4 py-2.5 text-[13px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors tracking-wide"
        >
          New Client
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Active Clients"
          value={metrics.active}
          icon={Users}
          iconColor="text-gold"
          iconBg="bg-gold/10"
          accentFrom="from-gold/40"
        />
        <KpiCard
          label="Fact Finds In Progress"
          value={metrics.inProgress}
          icon={ClipboardList}
          iconColor="text-blue-accent"
          iconBg="bg-blue-accent/10"
          accentFrom="from-blue-accent/40"
        />
        <KpiCard
          label="Ready for Meeting"
          value={metrics.ready}
          icon={Calendar}
          iconColor="text-amber-400"
          iconBg="bg-amber-400/10"
          accentFrom="from-amber-400/40"
        />
        <KpiCard
          label="Needs Review"
          value={metrics.needsReview}
          icon={AlertCircle}
          iconColor="text-orange-400"
          iconBg="bg-orange-400/10"
          accentFrom="from-orange-400/40"
        />
      </div>

      {/* Sarah brief */}
      <div className="mb-8 rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex">
          <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/70 via-gold/30 to-transparent" />
          <div className="flex-1 px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.22em] text-gold uppercase leading-none">
                  Sarah
                </p>
                <p className="text-[10px] text-muted-foreground/60 tracking-wide mt-0.5">
                  AI Adviser Intelligence &nbsp;·&nbsp; Today's Brief
                </p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {[
                `${metrics.notStarted} client${metrics.notStarted !== 1 ? "s have" : " has"} not started their fact find — a follow-up call is recommended.`,
                "Sarah Mitchell is 85% complete and ready for meeting prep ahead of 28 May.",
                "David Okafor and Angela Forsyth both require adviser review before they can progress.",
              ].map((insight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-gold/50" />
                  <p className="text-[13px] text-foreground/75 leading-relaxed">{insight}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Client pipeline table */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-[13px] font-semibold text-foreground">
              Client Pipeline
            </h2>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              {CLIENTS.length} active clients
            </p>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-gold transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[hsl(224,20%,7%)]">
                {["Client", "Progress", "Status", "Next Action", "Meeting", "Updated"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {CLIENTS.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gold/[0.025] transition-colors duration-150 group"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border/80 text-[10px] font-bold text-muted-foreground/70 tracking-tight">
                        {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium text-[13px] text-foreground/90">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <progress
                        value={client.progress}
                        max={100}
                        className={cn(
                          "bmk-progress w-[88px]",
                          client.status === "in-progress" ? "bmk-progress-blue" : ""
                        )}
                      />
                      <span className="text-[12px] text-muted-foreground/70 w-7 tabular-nums">
                        {client.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={STATUS_CONFIG[client.status].className}>
                      {STATUS_CONFIG[client.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 max-w-[220px]">
                    <p className="text-[12px] text-muted-foreground/65 truncate">
                      {client.nextAction}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[12px] text-muted-foreground/65 whitespace-nowrap">
                      {client.meetingDate ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[12px] text-muted-foreground/65 whitespace-nowrap">
                      {client.lastActivity}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/clients/${client.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-6 w-6 rounded hover:bg-white/[0.08]"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className={cn("h-px bg-gradient-to-r to-transparent", accentFrom)} />
      <div className="px-5 pt-5 pb-5">
        <div className="flex items-start justify-between mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/55">
            {label}
          </p>
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-full", iconBg)}>
            <Icon className={cn("h-3.5 w-3.5", iconColor)} />
          </div>
        </div>
        <p className="text-[38px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
