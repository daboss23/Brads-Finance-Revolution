import { CLIENTS } from "@/lib/data";
import { Users, TrendingUp, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { FactFindLinksTable } from "@/components/fact-find/FactFindLinksTable";

const SECTIONS = [
  "Personal Details",
  "Income & Employment",
  "Assets & Liabilities",
  "Expenses",
  "Superannuation",
  "Insurance",
  "Goals & Objectives",
];

export default function FactFindPage() {
  const completionBySection = SECTIONS.map((section) => {
    const complete = CLIENTS.filter(
      (c) =>
        c.factFindSections.find((s) => s.name === section)?.status ===
        "complete",
    ).length;
    const inProgress = CLIENTS.filter(
      (c) =>
        c.factFindSections.find((s) => s.name === section)?.status ===
        "in-progress",
    ).length;
    const pct = Math.round((complete / CLIENTS.length) * 100);
    return { section, complete, inProgress, pct };
  });

  const fullyComplete = CLIENTS.filter((c) => c.progress === 100).length;
  const avgProgress = Math.round(
    CLIENTS.reduce((s, c) => s + c.progress, 0) / CLIENTS.length,
  );
  const totalSectionsComplete = completionBySection.reduce(
    (s, c) => s + c.complete,
    0,
  );
  const totalPossible = SECTIONS.length * CLIENTS.length;

  const firstRow = completionBySection.slice(0, 4);
  const secondRow = completionBySection.slice(4);

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
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
      <div className="mb-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            <div
              className={cn("h-px bg-gradient-to-r to-transparent", accent)}
            />
            <div className="px-6 pt-6 pb-6">
              <div className="flex items-start justify-between mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground leading-snug">
                  {label}
                </p>
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full shrink-0",
                    bg,
                  )}
                >
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
      <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
      <div className="mb-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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

      {/* Client fact find links — the same table Athena manages, so Brad can
          copy, resend or open a client's link without leaving this screen. */}
      <FactFindLinksTable
        title="Client Fact Find Links"
        description="Every client's Athena link — copy, resend, or open the discovery session"
      />
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
                : "from-muted-foreground/20",
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
                  : "text-foreground/85",
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
            inProgress > 0 && pct < 60 ? "bmk-progress-blue" : "",
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
