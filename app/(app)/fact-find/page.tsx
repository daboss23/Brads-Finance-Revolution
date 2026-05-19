import { CLIENTS, STATUS_CONFIG, type SectionStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Circle } from "lucide-react";
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

const SHORT_LABELS: Record<string, string> = {
  "Personal Details": "PD",
  "Income & Employment": "I&E",
  "Assets & Liabilities": "A&L",
  "Expenses": "EXP",
  "Superannuation": "SUPER",
  "Insurance": "INS",
  "Goals & Objectives": "GOALS",
};

const SECTION_FULL: Record<string, string> = {
  "Personal Details": "Personal Details",
  "Income & Employment": "Income & Employment",
  "Assets & Liabilities": "Assets & Liabilities",
  "Expenses": "Expenses",
  "Superannuation": "Superannuation",
  "Insurance": "Insurance",
  "Goals & Objectives": "Goals & Objectives",
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

  return (
    <div className="px-10 py-9 max-w-[1240px] mx-auto">

      <div className="mb-9">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/50 mb-2">
          Fact Find
        </p>
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-none">
          Progress Overview
        </h1>
        <p className="mt-2 text-sm text-muted-foreground/60">
          Section-by-section completion across {CLIENTS.length} active clients
        </p>
      </div>

      {/* Section summary cards */}
      <div className="grid grid-cols-7 gap-3 mb-8">
        {completionBySection.map(({ section, complete, inProgress, pct }) => (
          <div
            key={section}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            <div
              className={cn(
                "h-px bg-gradient-to-r to-transparent",
                pct === 100
                  ? "from-emerald-500/50"
                  : pct >= 50
                  ? "from-gold/50"
                  : "from-muted-foreground/20"
              )}
            />
            <div className="px-3.5 py-4 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45 mb-3">
                {SHORT_LABELS[section]}
              </p>
              <p
                className={cn(
                  "text-[26px] font-semibold leading-none tabular-nums mb-3",
                  pct === 100
                    ? "text-emerald-400"
                    : pct >= 60
                    ? "text-gold"
                    : "text-foreground/80"
                )}
              >
                {pct}%
              </p>
              <progress
                value={pct}
                max={100}
                className={cn(
                  "bmk-progress w-full mb-2",
                  pct < 60 && inProgress > 0 ? "bmk-progress-blue" : ""
                )}
              />
              <p className="text-[10px] text-muted-foreground/40">
                {complete}/{CLIENTS.length}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Matrix table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[hsl(224,20%,7%)]">
              <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 min-w-[180px]">
                Client
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 w-32">
                Status
              </th>
              <th className="px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 w-16">
                Total
              </th>
              {SECTIONS.map((s) => (
                <th
                  key={s}
                  className="px-3 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 w-14"
                  title={SECTION_FULL[s]}
                >
                  {SHORT_LABELS[s]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {CLIENTS.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gold/[0.025] transition-colors duration-150 group"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-[13px] text-foreground/85 hover:text-gold transition-colors"
                  >
                    {client.name}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <Badge className={cn(STATUS_CONFIG[client.status].className, "text-[10px]")}>
                    {STATUS_CONFIG[client.status].label}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-[13px] font-medium text-foreground/80 tabular-nums">
                    {client.progress}%
                  </span>
                </td>
                {client.factFindSections.map((section) => (
                  <td
                    key={section.name}
                    className="px-3 py-4 text-center"
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
      <div className="flex items-center gap-6 mt-4 pl-1">
        {[
          { status: "complete" as SectionStatus, label: "Complete" },
          { status: "in-progress" as SectionStatus, label: "In Progress" },
          { status: "missing" as SectionStatus, label: "Missing" },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-2">
            <MatrixDot status={status} />
            <span className="text-[11px] text-muted-foreground/50">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixDot({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === "in-progress")
    return <Clock className="h-4 w-4 text-blue-accent/80" />;
  return <Circle className="h-4 w-4 text-muted-foreground/20" />;
}
