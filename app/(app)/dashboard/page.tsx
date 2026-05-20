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
    <div className="px-14 py-12">

      {/* Page header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground/75 mb-3">
            BMK Financial Services
          </p>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground leading-none">
            Good morning, Brad.
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Tuesday, 19 May 2026 &nbsp;·&nbsp; Client Fact Find Command Centre
          </p>
        </div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 rounded bg-gold px-5 py-3 text-[13px] font-semibold text-gold-foreground hover:bg-gold/90 transition-colors tracking-wide"
        >
          New Client
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-5 mb-12">
        <KpiCard
          label="Active Clients"
          value={metrics.active}
          icon={Users}
          iconColor="text-gold"
          iconBg="bg-gold/15"
          accentFrom="from-gold/50"
        />
        <KpiCard
          label="Fact Finds In Progress"
          value={metrics.inProgress}
          icon={ClipboardList}
          iconColor="text-blue-accent"
          iconBg="bg-blue-accent/15"
          accentFrom="from-blue-accent/50"
        />
        <KpiCard
          label="Ready for Meeting"
          value={metrics.ready}
          icon={Calendar}
          iconColor="text-amber-300"
          iconBg="bg-amber-400/15"
          accentFrom="from-amber-400/50"
        />
        <KpiCard
          label="Needs Review"
          value={metrics.needsReview}
          icon={AlertCircle}
          iconColor="text-orange-300"
          iconBg="bg-orange-400/15"
          accentFrom="from-orange-400/50"
        />
      </div>

      {/* Sarah brief */}
      <div className="mb-12 rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex">
          <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/80 via-gold/35 to-transparent" />
          <div className="flex-1 px-8 py-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 border border-gold/35">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.22em] text-gold uppercase leading-none">
                  Sarah
                </p>
                <p className="text-[11px] text-muted-foreground tracking-wide mt-0.5">
                  AI Adviser Intelligence &nbsp;·&nbsp; Today's Brief
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                `${metrics.notStarted} client${metrics.notStarted !== 1 ? "s have" : " has"} not started their fact find — a follow-up call is recommended.`,
                "Sarah Mitchell is 85% complete and ready for meeting prep ahead of 28 May.",
                "David Okafor and Angela Forsyth both require adviser review before they can progress.",
              ].map((insight, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[8px] h-[3px] w-[3px] shrink-0 rounded-full bg-gold/60" />
                  <p className="text-[14px] text-foreground/85 leading-relaxed">{insight}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Client pipeline table */}
      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">
              Client Pipeline
            </h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              {CLIENTS.length} active clients
            </p>
          </div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-gold transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border" style={{ background: "hsl(222 28% 7%)" }}>
                {["Client", "Progress", "Status", "Next Action", "Meeting", "Updated"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-6 py-4 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CLIENTS.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gold/[0.04] transition-colors duration-150 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-[11px] font-bold text-foreground/70 tracking-tight">
                        {client.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium text-[13px] text-foreground">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <progress
                        value={client.progress}
                        max={100}
                        className={cn(
                          "bmk-progress w-28",
                          client.status === "in-progress" ? "bmk-progress-blue" : ""
                        )}
                      />
                      <span className="text-[12px] text-muted-foreground w-8 tabular-nums">
                        {client.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge className={STATUS_CONFIG[client.status].className}>
                      {STATUS_CONFIG[client.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 max-w-[260px]">
                    <p className="text-[13px] text-muted-foreground truncate">
                      {client.nextAction}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                      {client.meetingDate ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                      {client.lastActivity}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <Link
                      href={`/clients/${client.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-7 w-7 rounded hover:bg-white/[0.08]"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
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
      <div className={cn("h-[2px] bg-gradient-to-r to-transparent", accentFrom)} />
      <div className="px-7 pt-7 pb-7">
        <div className="flex items-start justify-between mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground leading-snug max-w-[120px]">
            {label}
          </p>
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full shrink-0", iconBg)}>
            <Icon className={cn("h-3.5 w-3.5", iconColor)} />
          </div>
        </div>
        <p className="text-[52px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
