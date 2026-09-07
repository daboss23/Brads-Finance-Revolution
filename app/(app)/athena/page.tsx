"use client";

import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  TrendingDown,
  Clock,
  Users,
  Link as LinkIcon,
} from "lucide-react";
import { FACT_FIND_LINKS } from "@/lib/athena-data";
import { CLIENTS } from "@/lib/data";
import { cn } from "@/lib/utils";

const SECTIONS_ORDER = [
  "Personal Details",
  "Income & Employment",
  "Assets & Liabilities",
  "Expenses",
  "Superannuation",
  "Insurance",
  "Goals & Objectives",
];

function getDropOffData() {
  return SECTIONS_ORDER.map((section) => {
    const missing = CLIENTS.filter(
      (c) =>
        c.factFindSections.find((s) => s.name === section)?.status ===
        "missing",
    ).length;
    const inProgress = CLIENTS.filter(
      (c) =>
        c.factFindSections.find((s) => s.name === section)?.status ===
        "in-progress",
    ).length;
    return { section, missing, inProgress, incomplete: missing + inProgress };
  }).sort((a, b) => b.incomplete - a.incomplete);
}

function getMetrics() {
  const sent = FACT_FIND_LINKS.filter((l) => l.status !== "not-sent").length;
  const opened = FACT_FIND_LINKS.filter(
    (l) =>
      l.status === "opened" ||
      l.status === "in-progress" ||
      l.status === "completed",
  ).length;
  const inProgress = FACT_FIND_LINKS.filter(
    (l) => l.status === "in-progress",
  ).length;
  const completed = FACT_FIND_LINKS.filter(
    (l) => l.status === "completed",
  ).length;
  const notStarted = FACT_FIND_LINKS.filter((l) => l.status === "sent").length;
  const avg = Math.round(
    FACT_FIND_LINKS.reduce((sum, l) => sum + l.progress, 0) /
      FACT_FIND_LINKS.length,
  );
  return { sent, opened, inProgress, completed, notStarted, avg };
}

export default function AthenaPage() {
  const metrics = getMetrics();
  const dropOff = getDropOffData();
  const topStall = dropOff[0]?.section ?? "Assets & Liabilities";
  const readyForReview = FACT_FIND_LINKS.filter(
    (l) => l.progress >= 85 && l.status !== "completed",
  ).length;

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-10">
      {/* Page header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground mb-3">
            AI Fact Find Intelligence
          </p>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground leading-none flex items-center gap-3">
            Athena
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
            </span>
          </h1>
          <p className="mt-3 text-[14px] text-muted-foreground">
            Fact find link management &amp; client onboarding intelligence
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {[
          {
            label: "Links Sent",
            value: metrics.sent,
            icon: LinkIcon,
            color: "text-blue-accent",
            bg: "bg-blue-accent/15",
            accent: "from-blue-accent/50",
          },
          {
            label: "Opened",
            value: metrics.opened,
            icon: ExternalLink,
            color: "text-sky-400",
            bg: "bg-sky-400/15",
            accent: "from-sky-400/50",
          },
          {
            label: "In Progress",
            value: metrics.inProgress,
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/[0.15]",
            accent: "from-warning/50",
          },
          {
            label: "Completed",
            value: metrics.completed,
            icon: CheckCircle2,
            color: "text-success",
            bg: "bg-success/15",
            accent: "from-success/50",
          },
          {
            label: "Not Started",
            value: metrics.notStarted,
            icon: Users,
            color: "text-zinc-400",
            bg: "bg-zinc-400/15",
            accent: "from-zinc-400/20",
          },
          {
            label: "Avg Completion",
            value: `${metrics.avg}%`,
            icon: TrendingDown,
            color: "text-gold",
            bg: "bg-gold/15",
            accent: "from-gold/50",
          },
        ].map(({ label, value, icon: Icon, color, bg, accent }) => (
          <div key={label} className="rounded-lg glass-card overflow-hidden">
            <div
              className={cn("h-px bg-gradient-to-r to-transparent", accent)}
            />
            <div className="px-5 pt-5 pb-5">
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
              <p className="text-[38px] font-semibold tracking-tight text-foreground leading-none tabular-nums">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Athena intelligence + Drop-off */}
      <div className="mb-12 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Athena intelligence panel */}
        <div className="rounded-lg glass-card overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/70 via-gold/30 to-transparent" />
            <div className="flex-1 px-7 py-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.22em] text-gold uppercase leading-none">
                    Athena
                  </p>
                  <p className="text-[10px] text-muted-foreground tracking-wide mt-0.5">
                    AI Adviser Intelligence · Current Recommendations
                  </p>
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  {
                    text: `${metrics.notStarted} client${metrics.notStarted !== 1 ? "s have" : " has"} received their link but not yet started — a personal follow-up call is recommended.`,
                    priority: "high",
                  },
                  {
                    text: `The most common stall point is ${topStall}. Consider sending clients a short guide or prompt for this section.`,
                    priority: "medium",
                  },
                  {
                    text: `${readyForReview} client${readyForReview !== 1 ? "s are" : " is"} at 85%+ completion and approaching meeting-ready status.`,
                    priority: "low",
                  },
                  {
                    text: "Tony Nguyen's fact find is 100% complete. Financial plan generation can begin.",
                    priority: "action",
                  },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-[7px] h-[4px] w-[4px] shrink-0 rounded-full",
                        item.priority === "high"
                          ? "bg-warning"
                          : item.priority === "action"
                            ? "bg-success"
                            : item.priority === "medium"
                              ? "bg-warning"
                              : "bg-gold/50",
                      )}
                    />
                    <p className="text-[13px] text-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Drop-off analysis */}
        <div className="rounded-lg glass-card overflow-hidden">
          <div className="border-b border-border bg-card px-5 py-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Common Drop-off Points
            </h2>
            <p className="text-[11px] text-muted-foreground/75 mt-0.5">
              Sections clients most often stall on
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            {dropOff.slice(0, 6).map(({ section, incomplete }, i) => {
              const pct = Math.round((incomplete / CLIENTS.length) * 100);
              return (
                <div key={section}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-foreground">
                      {section}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {incomplete}/{CLIENTS.length}
                    </span>
                  </div>
                  <progress
                    value={pct}
                    max={100}
                    aria-label={`${section} drop-off ${pct}%`}
                    className={cn(
                      "bmk-progress h-1 w-full",
                      i < 2 ? "bmk-progress-amber" : "",
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
