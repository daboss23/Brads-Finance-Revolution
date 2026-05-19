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

function cellClass(status: SectionStatus) {
  if (status === "complete") return "bg-emerald-950/40 text-emerald-400";
  if (status === "in-progress") return "bg-blue-950/40 text-blue-400";
  return "bg-transparent text-muted-foreground/30";
}

export default function FactFindPage() {
  const completionBySection = SECTIONS.map((section) => {
    const count = CLIENTS.filter(
      (c) => c.factFindSections.find((s) => s.name === section)?.status === "complete"
    ).length;
    return { section, count, pct: Math.round((count / CLIENTS.length) * 100) };
  });

  return (
    <div className="px-8 py-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Fact Find Progress
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Section-by-section completion across all active clients
        </p>
      </div>

      {/* Section completion summary */}
      <div className="grid grid-cols-7 gap-3 mb-8">
        {completionBySection.map(({ section, count, pct }) => (
          <div
            key={section}
            className="rounded-lg border border-border bg-card p-4 text-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {SHORT_LABELS[section]}
            </p>
            <p className="text-2xl font-semibold text-foreground tabular-nums">
              {pct}%
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {count}/{CLIENTS.length}
            </p>
          </div>
        ))}
      </div>

      {/* Client matrix */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card-elevated">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 min-w-[180px]">
                Client
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 w-28">
                Status
              </th>
              <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 w-16">
                Total
              </th>
              {SECTIONS.map((s) => (
                <th
                  key={s}
                  className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 w-14"
                  title={s}
                >
                  {SHORT_LABELS[s]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CLIENTS.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-white/[0.025] transition-colors group"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-[13px] text-foreground hover:text-gold transition-colors"
                  >
                    {client.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn(STATUS_CONFIG[client.status].className, "text-[10px]")}>
                    {STATUS_CONFIG[client.status].label}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-[13px] font-medium text-foreground tabular-nums">
                    {client.progress}%
                  </span>
                </td>
                {client.factFindSections.map((section) => (
                  <td
                    key={section.name}
                    className="px-3 py-3 text-center"
                    title={`${section.name}: ${section.status}`}
                  >
                    <div className={cn("flex items-center justify-center rounded p-1", cellClass(section.status))}>
                      <SectionDot status={section.status} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4">
        {[
          { status: "complete" as SectionStatus, label: "Complete" },
          { status: "in-progress" as SectionStatus, label: "In Progress" },
          { status: "missing" as SectionStatus, label: "Missing" },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <SectionDot status={status} />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionDot({ status }: { status: SectionStatus }) {
  if (status === "complete")
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
  if (status === "in-progress")
    return <Clock className="h-3.5 w-3.5 text-blue-400" />;
  return <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />;
}
