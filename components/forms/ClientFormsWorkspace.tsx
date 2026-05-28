"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  CirclePlus,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import {
  STRATEGY_LABELS,
  STRATEGY_DESCRIPTIONS,
  getProvidersForStrategy,
  getFormsForStrategies,
  PROVIDERS,
  type StrategyKey,
} from "@/lib/forms";
import type { Recommendation } from "@/lib/strategy-recommender";
import {
  getApprovedStrategies,
  approveStrategy,
  unapproveStrategy,
} from "@/lib/client-strategy-store";
import { FormsPanel } from "@/components/forms/FormsPanel";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  clientName: string;
  recommendations: Recommendation[];
  defaultApproved?: StrategyKey[];
}

const ALL_STRATEGIES: StrategyKey[] = [
  "ttr-strategy",
  "insurance-review",
  "aged-care",
  "estate-planning",
  "super-consolidation",
  "platform-setup",
  "investment-strategy",
];

const CONFIDENCE_STYLE: Record<string, string> = {
  high: "text-emerald-300/90 bg-emerald-500/10 border-emerald-500/30",
  medium: "text-amber-300/90 bg-amber-500/10 border-amber-500/30",
  low: "text-muted-foreground/70 bg-white/[0.04] border-border/60",
};

export function ClientFormsWorkspace({
  clientId,
  clientName,
  recommendations,
  defaultApproved,
}: Props) {
  const [approved, setApproved] = useState<StrategyKey[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const existing = getApprovedStrategies(clientId);
    if (existing.length === 0 && defaultApproved && defaultApproved.length > 0) {
      // Seed Brad's approved strategies from the client profile on first visit.
      for (const k of defaultApproved) approveStrategy(clientId, k);
      setApproved(getApprovedStrategies(clientId));
    } else {
      setApproved(existing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  function approve(key: StrategyKey) {
    approveStrategy(clientId, key);
    setApproved(getApprovedStrategies(clientId));
  }
  function unapprove(key: StrategyKey) {
    unapproveStrategy(clientId, key);
    setApproved(getApprovedStrategies(clientId));
  }

  const recommendedKeys = recommendations.map((r) => r.strategyKey);
  const otherStrategies = ALL_STRATEGIES.filter(
    (k) => !recommendedKeys.includes(k) && !approved.includes(k),
  );
  const approvedForms = useMemo(
    () => getFormsForStrategies(approved),
    [approved],
  );

  return (
    <div className="space-y-12">

      {/* Section 1 — Sarah Recommends */}
      <section>
        <SectionHeader
          icon={<Sparkles className="h-3.5 w-3.5 text-gold" />}
          title="Sarah Recommends"
          subtitle={
            recommendations.length === 0
              ? "No recommendations yet — once Sarah completes the fact find, suggested strategies appear here."
              : `Auto-suggested for ${clientName} based on the fact find. Approve to add to the workspace.`
          }
        />

        {recommendations.length === 0 ? (
          <EmptyHint text="Waiting on a completed fact find." />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recommendations.map((r) => {
              const isApproved = approved.includes(r.strategyKey);
              return (
                <RecommendationCard
                  key={r.strategyKey}
                  rec={r}
                  approved={isApproved}
                  onApprove={() => approve(r.strategyKey)}
                  onUndo={() => unapprove(r.strategyKey)}
                />
              );
            })}
          </div>
        )}

        {/* Add another strategy */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-2 text-[13.5px] text-muted-foreground hover:text-foreground transition-colors tracking-tight"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            {showAll ? "Hide" : "Add another strategy manually"}
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                showAll && "rotate-90",
              )}
            />
          </button>
          {showAll && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {otherStrategies.map((k) => (
                <ManualStrategyCard
                  key={k}
                  strategyKey={k}
                  onApprove={() => approve(k)}
                />
              ))}
              {otherStrategies.length === 0 && (
                <p className="col-span-2 text-[12px] text-muted-foreground/55 italic">
                  All available strategies are already recommended or approved.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section 2 — Approved Strategies */}
      <section>
        <SectionHeader
          icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
          title="Approved Strategies"
          subtitle={
            approved.length === 0
              ? "Nothing approved yet. Approve a recommendation above to unlock its provider forms."
              : `${approved.length} ${approved.length === 1 ? "strategy" : "strategies"} approved. ${approvedForms.length} ${approvedForms.length === 1 ? "form" : "forms"} ready to generate.`
          }
        />

        {approved.length === 0 ? (
          <EmptyHint text="Approve a recommendation to see forms appear here." />
        ) : (
          <div className="space-y-6">
            {approved.map((k) => (
              <ApprovedStrategyBlock
                key={k}
                clientId={clientId}
                strategyKey={k}
                onRemove={() => unapprove(k)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-2">
        {icon}
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <p className="text-[14px] text-muted-foreground/90 max-w-[640px] leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-card/40 px-6 py-10 text-center">
      <p className="text-[13.5px] text-muted-foreground/85 italic">{text}</p>
    </div>
  );
}

function RecommendationCard({
  rec,
  approved,
  onApprove,
  onUndo,
}: {
  rec: Recommendation;
  approved: boolean;
  onApprove: () => void;
  onUndo: () => void;
}) {
  const providers = getProvidersForStrategy(rec.strategyKey);
  const forms = getFormsForStrategies([rec.strategyKey]);
  return (
    <div
      className={cn(
        "rounded-xl border bg-card overflow-hidden transition-colors",
        approved ? "border-emerald-500/35" : "border-border/70 hover:border-border",
      )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-[15.5px] font-semibold text-foreground tracking-tight leading-snug">
            {rec.strategyName}
          </h3>
          <span
            className={cn(
              "shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.14em] rounded border px-2 py-0.5",
              CONFIDENCE_STYLE[rec.confidence],
            )}
          >
            {rec.confidence}
          </span>
        </div>
        <p className="text-[14px] text-foreground/85 leading-relaxed mb-5">
          {rec.reason}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {providers.map((p) => (
            <span
              key={p}
              className="text-[11px] font-medium text-foreground/80 bg-white/[0.05] border border-border/70 rounded px-2 py-0.5 tracking-tight"
            >
              {PROVIDERS[p].name}
            </span>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground/85 mb-5">
          {forms.length} {forms.length === 1 ? "form" : "forms"} generated on approval
        </p>

        {approved ? (
          <button
            type="button"
            onClick={onUndo}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-[13px] font-medium text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approved
          </button>
        ) : (
          <button
            type="button"
            onClick={onApprove}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-gold/40 bg-gold/[0.08] px-3 py-2.5 text-[13px] font-medium text-gold hover:bg-gold/[0.13] transition-colors"
          >
            Approve strategy
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function ManualStrategyCard({
  strategyKey,
  onApprove,
}: {
  strategyKey: StrategyKey;
  onApprove: () => void;
}) {
  const providers = getProvidersForStrategy(strategyKey);
  return (
    <button
      type="button"
      onClick={onApprove}
      className="text-left rounded-lg border border-border/70 bg-card hover:border-gold/40 hover:bg-gold/[0.04] transition-colors p-5"
    >
      <p className="text-[14.5px] font-semibold text-foreground tracking-tight">
        {STRATEGY_LABELS[strategyKey]}
      </p>
      <p className="text-[13px] text-muted-foreground/85 mt-1.5 leading-relaxed">
        {STRATEGY_DESCRIPTIONS[strategyKey]}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {providers.map((p) => (
          <span
            key={p}
            className="text-[11px] text-foreground/75 bg-white/[0.04] border border-border/60 rounded px-2 py-0.5"
          >
            {PROVIDERS[p].name}
          </span>
        ))}
      </div>
    </button>
  );
}

function ApprovedStrategyBlock({
  clientId,
  strategyKey,
  onRemove,
}: {
  clientId: string;
  strategyKey: StrategyKey;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-card">
        <div>
          <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-emerald-400/90 mb-1">
            Approved
          </p>
          <p className="text-[16px] font-semibold text-foreground tracking-tight">
            {STRATEGY_LABELS[strategyKey]}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[12.5px] text-muted-foreground/80 hover:text-red-400 transition-colors tracking-tight"
        >
          Remove
        </button>
      </div>
      <div className="p-5">
        <FormsPanel clientId={clientId} strategies={[strategyKey]} />
      </div>
    </div>
  );
}
