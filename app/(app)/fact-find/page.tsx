import { CLIENTS, STATUS_CONFIG, type SectionStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Circle, Users, TrendingUp, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  "Personal Details",
  "Income & Employment",
  "Assets & Liabilities",
  "Expenses",
  "Superannuation",
  "Insurance",
  "Goals & Objectives",
];

const SECTION_ABBR: Record<string, string> = {
  "Personal Details": "PD",
  "Income & Employment": "I&E",
  "Assets & Liabilities": "A&L",
  "Expenses": "EXP",
  "Superannuation": "SUP",
  "Insurance": "INS",
  "Goals & Objectives": "GOA",
};

export default function FactFindPage() {
  const completionBySection = SECTIONS.map((section) => {
    const complete = CLIENTS.filter(
      (c) => c.factFindSections.find((s) => s.name === section)?.status === "complete"
    ).length;
    const inProgress = CLIENTS.filter(
      (c) => c.factFindSections.find((s) => s.name === section)?.status === "in-progress"
    ).length;
    const pct = Math.round((complete / CLIENTS.length) * 100);
    return { section, complete, inProgress, pct };
  });

  const fullyComplete = CLIENTS.filter((c) => c.progress === 100).length;
  const avgProgress = Math.round(CLIENTS.reduce((s, c) => s + c.progress, 0) / CLIENTS.length);
  const totalSectionsComplete = completionBySection.reduce((s, c) => s + c.complete, 0);
  const totalPossible = SECTIONS.length * CLIENTS.length;

  const firstRow = completionBySection.slice(0, 4);
  const secondRow = completionBySection.slice(4);

  return (
    <div className="px-14 py-12">

      {/* Page header */}
      <div className="mb-10">
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground mb-3">
          Fact Find
        </p>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground leading-none">
          Progress Overview
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          Section-by-section completion across {CLIENTS.length} active clients
        </p>
      </div>

      {/* KPI cards — same pattern as dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          {
            label: "Clients Fully Complete",
            value: `${fullyComplete} / ${CLIENTS.length}`,
            icon: Users,
            color: "text-success",
            bg: "bg-success/15",
            accent: "from-success/50",
          },
          {
            label: "Avg Completion",
            value: `${avgProgress}%`,
            icon: TrendingUp,
            color: "text-gold",
            bg: "bg-gold/15",
            accent: "from-gold/50",
          },
          {
            label: "Sections Filled",
            value: `${totalSectionsComplete} / ${totalPossible}`,
            icon: LayoutGrid,
            color: "text-blue-accent",
            bg: "bg-blue-accent/15",
            accent: "from-blue-accent/50",
          },
        ].map(({ label, value, icon: Icon, color, bg, accent }) => (
          <div key={label} className="rounded-lg glass-card overflow-hidden">
            <div className={cn("h-px bg-gradient-to-r to-transparent", accent)} />
            <div className="px-6 pt-6 pb-6">
              <div className="flex items-start justify-between mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground leading-snug">
                  {label}
                </p>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-full shrink-0", bg)}>
                  <Icon className={cn("h-3.5 w-3.5", color)} />
                </div>
              </div>
              <p className="text-[36px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Section completion — first 4 */}
      <div className="grid grid-cols-4 gap-5 mb-5">
        {firstRow.map(({ section, complete, inProgress, pct }) => (
          <SectionCard
            key={section}
            section={section}
            complete={complete}
            inProgress={inProgress}
            pct={pct}
            total={CLIENTS.length}
          />
        ))}
      </div>

      {/* Section completion — last 3 (wider) */}
      <div className="grid grid-cols-3 gap-5 mb-14">
        {secondRow.map(({ section, complete, inProgress, pct }) => (
          <SectionCard
            key={section}
            section={section}
            complete={complete}
            inProgress={inProgress}
            pct={pct}
            total={CLIENTS.length}
          />
        ))}
      </div>

      {/* Matrix table header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">
            Client Matrix
          </h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Fact find completion by client and section — hover a column header for the full section name
          </p>
        </div>
      </div>

      {/* Matrix table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border" style={{ background: "hsl(222 28% 7%)" }}>
              <th className="px-6 pb-5 pt-5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground w-[280px]">
                Client
              </th>
              <th className="px-6 pb-5 pt-5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground w-[180px]">
                Status
              </th>
              <th className="px-6 pb-5 pt-5 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground w-[200px]">
                Progress
              </th>
              {SECTIONS.map((s) => (
                <th
                  key={s}
                  className="px-3 pb-5 pt-5 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground w-14"
                  title={s}
                >
                  {SECTION_ABBR[s]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {CLIENTS.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gold/[0.06] transition-colors duration-150 group"
              >
                <td className="px-6 py-6 align-middle">
                  <Link
                    href={`/clients/${client.id}`}
                    className="group-hover:text-gold transition-colors"
                  >
                    <p className="font-medium text-[13px] text-foreground truncate">
                      {client.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                      {client.email}
                    </p>
                  </Link>
                </td>
                <td className="px-6 py-6 align-middle">
                  <Badge className={cn(STATUS_CONFIG[client.status].className, "text-[10px]")}>
                    {STATUS_CONFIG[client.status].label}
                  </Badge>
                </td>
                <td className="px-6 py-6 align-middle">
                  <div className="flex items-center gap-2.5">
                    <progress
                      value={client.progress}
                      max={100}
                      className={cn(
                        "bmk-progress w-28",
                        client.status === "in-progress" ? "bmk-progress-blue" : ""
                      )}
                    />
                    <span className="text-[12px] font-medium text-muted-foreground tabular-nums w-9 shrink-0">
                      {client.progress}%
                    </span>
                  </div>
                </td>
                {client.factFindSections.map((section) => (
                  <td
                    key={section.name}
                    className="px-3 py-6 text-center align-middle"
                    title={`${section.name}: ${section.status}`}
                  >
                    <div className="flex items-center justify-center">
                      <MatrixDot status={section.status} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-8 mt-5 pl-1">
        {[
          { status: "complete" as SectionStatus, label: "Complete" },
          { status: "in-progress" as SectionStatus, label: "In Progress" },
          { status: "missing" as SectionStatus, label: "Not started" },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-2">
            <MatrixDot status={status} />
            <span className="text-[12px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  complete,
  inProgress,
  pct,
  total,
}: {
  section: string;
  complete: number;
  inProgress: number;
  pct: number;
  total: number;
}) {
  return (
    <div className="rounded-lg glass-card overflow-hidden">
      <div
        className={cn(
          "h-px bg-gradient-to-r to-transparent",
          pct === 100
            ? "from-success/60"
            : pct >= 50
            ? "from-gold/55"
            : inProgress > 0
            ? "from-blue-accent/40"
            : "from-muted-foreground/20"
        )}
      />
      <div className="px-6 py-7">
        <div className="flex items-start justify-between mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground leading-snug max-w-[120px]">
            {section}
          </p>
          <p
            className={cn(
              "text-[28px] font-semibold leading-none tabular-nums shrink-0",
              pct === 100
                ? "text-success"
                : pct >= 60
                ? "text-gold"
                : "text-foreground/85"
            )}
          >
            {pct}%
          </p>
        </div>
        <progress
          value={pct}
          max={100}
          className={cn(
            "bmk-progress w-full mb-3",
            inProgress > 0 && pct < 60 ? "bmk-progress-blue" : ""
          )}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-muted-foreground/75 tabular-nums">
            {complete} of {total} complete
          </span>
          {inProgress > 0 && (
            <span className="text-[10px] font-medium text-blue-accent/70">
              {inProgress} in progress
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MatrixDot({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "in-progress")
    return <Clock className="h-4 w-4 text-blue-accent/80" />;
  return <Circle className="h-4 w-4 text-muted-foreground/20" />;
}
