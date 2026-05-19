import Link from "next/link";
import { Users, ClipboardList, Calendar, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { CLIENTS, STATUS_CONFIG } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getMetrics() {
  const active = CLIENTS.length;
  const inProgress = CLIENTS.filter((c) => c.status === "in-progress").length;
  const ready = CLIENTS.filter((c) => c.status === "ready-for-meeting").length;
  const needsReview = CLIENTS.filter(
    (c) => c.status === "review-required"
  ).length;
  const notStarted = CLIENTS.filter((c) => c.status === "link-sent").length;
  return { active, inProgress, ready, needsReview, notStarted };
}

export default function DashboardPage() {
  const metrics = getMetrics();

  return (
    <div className="px-8 py-8 max-w-[1200px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Good morning, Brad.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your client pipeline · Tuesday, 19 May 2026
          </p>
        </div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 rounded bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:bg-gold/90 transition-colors"
        >
          New Client
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Active Clients"
          value={metrics.active}
          icon={Users}
          iconColor="text-gold"
          iconBg="bg-gold/10"
        />
        <MetricCard
          label="Fact Finds In Progress"
          value={metrics.inProgress}
          icon={ClipboardList}
          iconColor="text-blue-accent"
          iconBg="bg-blue-accent/10"
        />
        <MetricCard
          label="Ready for Meeting"
          value={metrics.ready}
          icon={Calendar}
          iconColor="text-amber-400"
          iconBg="bg-amber-400/10"
        />
        <MetricCard
          label="Needs Review"
          value={metrics.needsReview}
          icon={AlertCircle}
          iconColor="text-orange-400"
          iconBg="bg-orange-400/10"
        />
      </div>

      {/* Sarah insight block */}
      <div className="mb-8 rounded-lg border border-gold/20 bg-gold/[0.04] px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15 border border-gold/30 mt-0.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] font-semibold text-gold">Sarah</span>
              <span className="text-[10px] text-muted-foreground border border-gold/20 rounded px-1.5 py-0.5">
                AI Adviser Intelligence
              </span>
            </div>
            <ul className="space-y-1.5">
              {[
                `${metrics.notStarted} client${metrics.notStarted !== 1 ? "s have" : " has"} not started their fact find — follow-up recommended.`,
                "Sarah Mitchell is 85% complete and ready for meeting prep on 28 May.",
                "David Okafor and Angela Forsyth require adviser review before progression.",
              ].map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold/50" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Client command table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            Client Pipeline
          </h2>
          <Link
            href="/clients"
            className="text-xs text-muted-foreground hover:text-gold transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card-elevated">
                {["Client", "Progress", "Status", "Next Action", "Meeting", "Updated"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CLIENTS.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-white/[0.025] transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-[11px] font-semibold text-muted-foreground">
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <span className="font-medium text-[13px] text-foreground">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <progress
                        value={client.progress}
                        max={100}
                        className={cn(
                          "bmk-progress w-20",
                          client.status === "in-progress" ? "bmk-progress-blue" : ""
                        )}
                      />
                      <span className="text-[12px] text-muted-foreground w-7 tabular-nums">
                        {client.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className={STATUS_CONFIG[client.status].className}>
                      {STATUS_CONFIG[client.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 max-w-[220px]">
                    <p className="text-[12px] text-muted-foreground truncate">
                      {client.nextAction}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                      {client.meetingDate ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                      {client.lastActivity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/clients/${client.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-6 w-6 rounded hover:bg-white/10"
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

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </div>
    </div>
  );
}
