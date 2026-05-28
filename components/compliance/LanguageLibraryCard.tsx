"use client";

import { useMemo, useState } from "react";
import { Search, Copy, Check, AlertTriangle } from "lucide-react";
import {
  LANGUAGE_TYPE_LABELS,
  type LanguageTemplate,
  type LanguageType,
} from "@/lib/compliance/knowledge-base";
import { cn } from "@/lib/utils";

interface Props {
  templates: LanguageTemplate[];
}

const FILTER_OPTIONS: { value: LanguageType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "general-advice", label: "General Advice" },
  { value: "personal-advice", label: "Personal Advice" },
  { value: "fee-disclosure", label: "Fee Disclosure" },
  { value: "privacy", label: "Privacy" },
  { value: "best-interests", label: "Best Interests" },
  { value: "risk-profile", label: "Risk Profile" },
  { value: "product-replacement", label: "Replacement" },
];

function isApproachingReview(reviewDue: string): boolean {
  const due = new Date(reviewDue).getTime();
  if (Number.isNaN(due)) return false;
  const today = new Date("2026-05-28").getTime();
  const sixtyDays = 1000 * 60 * 60 * 24 * 60;
  return due - today < sixtyDays;
}

export function LanguageLibraryCard({ templates }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LanguageType | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        LANGUAGE_TYPE_LABELS[t.type].toLowerCase().includes(q)
      );
    });
  }, [query, filter, templates]);

  async function copy(template: LanguageTemplate) {
    try {
      await navigator.clipboard.writeText(template.body);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border/60 bg-[hsl(224,20%,7%)]">
        <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
          Approved Language Library
        </h2>
        <p className="text-[11px] text-muted-foreground/75 mt-1">
          Charter approved templates — copy ready text for SOAs, ROAs and client communications.
        </p>
      </div>

      <div className="px-6 py-4 border-b border-border/40 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates"
            className="w-full rounded border border-border bg-background pl-9 pr-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/55 focus:border-gold/45 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                "rounded px-2.5 py-1 text-[11px] font-medium border transition-colors",
                filter === opt.value
                  ? "bg-gold/10 border-gold/35 text-gold"
                  : "bg-card border-border text-muted-foreground/80 hover:border-border/90 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border/40">
        {filtered.length === 0 && (
          <li className="px-6 py-8 text-center text-[13px] text-muted-foreground/65">
            No templates match this search.
          </li>
        )}
        {filtered.map((template) => {
          const approaching = isApproachingReview(template.reviewDue);
          const copied = copiedId === template.id;
          return (
            <li key={template.id} className="px-6 py-5">
              <div className="flex items-start justify-between gap-6 mb-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/85">
                      {LANGUAGE_TYPE_LABELS[template.type]}
                    </span>
                    {approaching && (
                      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Review due
                      </span>
                    )}
                  </div>
                  <h3 className="text-[14px] font-medium text-foreground">
                    {template.title}
                  </h3>
                </div>
                <button
                  onClick={() => copy(template)}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground/75 hover:text-foreground hover:border-border/90 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-[13px] text-muted-foreground/85 leading-relaxed mb-2.5">
                {template.body}
              </p>
              <p className="text-[11px] text-muted-foreground/55">
                Updated {template.lastUpdated} · Next review {template.reviewDue}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
