"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Copy,
  Send,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Clock,
  Users,
  Link as LinkIcon,
} from "lucide-react";
import {
  FACT_FIND_LINKS,
  LINK_STATUS_CONFIG,
  type LinkStatus,
} from "@/lib/sarah-data";
import { CLIENTS } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
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
        c.factFindSections.find((s) => s.name === section)?.status === "missing"
    ).length;
    const inProgress = CLIENTS.filter(
      (c) =>
        c.factFindSections.find((s) => s.name === section)?.status ===
        "in-progress"
    ).length;
    return { section, missing, inProgress, incomplete: missing + inProgress };
  }).sort((a, b) => b.incomplete - a.incomplete);
}

function getMetrics() {
  const sent = FACT_FIND_LINKS.filter((l) => l.status !== "not-sent").length;
  const opened = FACT_FIND_LINKS.filter(
    (l) => l.status === "opened" || l.status === "in-progress" || l.status === "completed"
  ).length;
  const inProgress = FACT_FIND_LINKS.filter(
    (l) => l.status === "in-progress"
  ).length;
  const completed = FACT_FIND_LINKS.filter(
    (l) => l.status === "completed"
  ).length;
  const notStarted = FACT_FIND_LINKS.filter(
    (l) => l.status === "sent"
  ).length;
  const avg = Math.round(
    FACT_FIND_LINKS.reduce((sum, l) => sum + l.progress, 0) /
      FACT_FIND_LINKS.length
  );
  return { sent, opened, inProgress, completed, notStarted, avg };
}

export default function SarahPage() {
  const metrics = getMetrics();
  const dropOff = getDropOffData();
  const [copied, setCopied] = useState<string | null>(null);
  const [resent, setResent] = useState<string | null>(null);

  function copyLink(token: string) {
    const url = `${window.location.origin}/onboarding/${token}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  function resendLink(token: string) {
    setResent(token);
    setTimeout(() => setResent(null), 2500);
  }

  const topStall = dropOff[0]?.section ?? "Assets & Liabilities";
  const readyForReview = FACT_FIND_LINKS.filter(
    (l) => l.progress >= 85 && l.status !== "completed"
  ).length;

  return (
    <div className="px-14 py-12">

      {/* Page header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground mb-3">
            AI Fact Find Intelligence
          </p>
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground leading-none flex items-center gap-3">
            Sarah
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
      <div className="grid grid-cols-6 gap-4 mb-12">
        {[
          { label: "Links Sent", value: metrics.sent, icon: LinkIcon, color: "text-blue-accent", bg: "bg-blue-accent/15", accent: "from-blue-accent/50" },
          { label: "Opened", value: metrics.opened, icon: ExternalLink, color: "text-sky-400", bg: "bg-sky-400/15", accent: "from-sky-400/50" },
          { label: "In Progress", value: metrics.inProgress, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/15", accent: "from-amber-400/50" },
          { label: "Completed", value: metrics.completed, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/15", accent: "from-emerald-400/50" },
          { label: "Not Started", value: metrics.notStarted, icon: Users, color: "text-zinc-400", bg: "bg-zinc-400/15", accent: "from-zinc-400/20" },
          { label: "Avg Completion", value: `${metrics.avg}%`, icon: TrendingDown, color: "text-gold", bg: "bg-gold/15", accent: "from-gold/50" },
        ].map(({ label, value, icon: Icon, color, bg, accent }) => (
          <div key={label} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className={cn("h-px bg-gradient-to-r to-transparent", accent)} />
            <div className="px-5 pt-5 pb-5">
              <div className="flex items-start justify-between mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground leading-snug">
                  {label}
                </p>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-full shrink-0", bg)}>
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

      {/* Two-column: Sarah intelligence + Drop-off */}
      <div className="grid grid-cols-[1fr_320px] gap-6 mb-12">

        {/* Sarah intelligence panel */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold/70 via-gold/30 to-transparent" />
            <div className="flex-1 px-7 py-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.22em] text-gold uppercase leading-none">
                    Sarah
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
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-[7px] h-[4px] w-[4px] shrink-0 rounded-full",
                        item.priority === "high"
                          ? "bg-orange-400"
                          : item.priority === "action"
                          ? "bg-emerald-400"
                          : item.priority === "medium"
                          ? "bg-amber-400"
                          : "bg-gold/50"
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
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border" style={{ background: "hsl(222 28% 7%)" }}>
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
                    <span className="text-[12px] text-foreground">{section}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {incomplete}/{CLIENTS.length}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        i === 0 ? "bg-orange-400/70" : i === 1 ? "bg-amber-400/60" : "bg-gold/40"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fact find links table */}
      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">
              Fact Find Links
            </h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              All client fact find links — manage, resend, and monitor progress
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border" style={{ background: "hsl(222 28% 7%)" }}>
                {["Client", "Link Status", "Progress", "Sent", "Last Activity", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {FACT_FIND_LINKS.map((link) => (
                <tr
                  key={link.token}
                  className="hover:bg-gold/[0.04] transition-colors duration-150 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border/80 text-[11px] font-bold text-foreground/70 tracking-tight">
                        {link.clientName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-[13px] text-foreground">
                          {link.clientName}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {link.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge className={LINK_STATUS_CONFIG[link.status].className}>
                      {LINK_STATUS_CONFIG[link.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      <progress
                        value={link.progress}
                        max={100}
                        className={cn(
                          "bmk-progress w-24",
                          link.status === "in-progress" ? "bmk-progress-blue" : ""
                        )}
                      />
                      <span className="text-[12px] text-muted-foreground tabular-nums w-8">
                        {link.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[13px] text-muted-foreground">
                      {link.sentDate ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[13px] text-muted-foreground">
                      {link.lastActivity ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {/* Copy link */}
                      <button
                        onClick={() => copyLink(link.token)}
                        title="Copy fact find link"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150",
                          copied === link.token
                            ? "border-emerald-800/50 bg-emerald-950/40 text-emerald-400"
                            : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground/80 hover:bg-white/[0.04]"
                        )}
                      >
                        {copied === link.token ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copied === link.token ? "Copied" : "Copy"}
                      </button>

                      {/* Resend */}
                      <button
                        onClick={() => resendLink(link.token)}
                        title="Resend fact find link"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150",
                          resent === link.token
                            ? "border-blue-800/50 bg-blue-950/40 text-blue-400"
                            : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground/80 hover:bg-white/[0.04]"
                        )}
                      >
                        <Send className="h-3 w-3" />
                        {resent === link.token ? "Sent" : "Resend"}
                      </button>

                      {/* Open client experience */}
                      <Link
                        href={`/onboarding/${link.token}`}
                        target="_blank"
                        title="Open client fact find experience"
                        className="inline-flex items-center gap-1.5 rounded border border-gold/30 bg-gold/[0.07] px-2.5 py-1.5 text-[11px] font-medium text-gold/80 hover:bg-gold/[0.12] hover:text-gold transition-all duration-150"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Link format note */}
        <div className="mt-4 flex items-center gap-2 px-1">
          <LinkIcon className="h-3 w-3 text-muted-foreground/35 shrink-0" />
          <p className="text-[11px] text-muted-foreground/35">
            Links follow the format:{" "}
            <span className="font-mono text-muted-foreground/50">
              {typeof window !== "undefined" ? window.location.origin : "https://bmkcrm.com.au"}/onboarding/[token]
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
