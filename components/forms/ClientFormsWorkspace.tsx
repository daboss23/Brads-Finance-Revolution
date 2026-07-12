"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  CirclePlus,
  ShieldCheck,
  ChevronRight,
  Library,
  Plus,
  X,
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
  type ApprovedStrategyId,
} from "@/lib/client-strategy-store";
import {
  getCatalogue,
  getCatalogueStrategy,
  addCustomStrategy,
  removeCatalogueStrategy,
  type CatalogueStrategy,
  type StrategySource,
} from "@/lib/strategy-catalogue";
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

function isBuiltIn(id: ApprovedStrategyId): id is StrategyKey {
  return (ALL_STRATEGIES as string[]).includes(id);
}

const SOURCE_BADGE: Record<StrategySource, string> = {
  ato: "text-sky-300/90 bg-sky-400/10 border-sky-400/30",
  mlc: "text-violet-300/90 bg-violet-400/10 border-violet-400/30",
  custom: "text-gold/90 bg-gold/10 border-gold/30",
};

const SOURCE_LABEL: Record<StrategySource, string> = {
  ato: "ATO",
  mlc: "MLC",
  custom: "Custom",
};

const CONFIDENCE_STYLE: Record<string, string> = {
  high: "text-success/90 bg-success/10 border-success/30",
  medium: "text-warning/90 bg-warning/10 border-warning/30",
  low: "text-muted-foreground/70 bg-white/[0.04] border-border/60",
};

export function ClientFormsWorkspace({
  clientId,
  clientName,
  recommendations,
  defaultApproved,
}: Props) {
  const [approved, setApproved] = useState<ApprovedStrategyId[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [catalogue, setCatalogue] = useState<CatalogueStrategy[]>([]);

  useEffect(() => {
    const existing = getApprovedStrategies(clientId);
    if (existing.length === 0 && defaultApproved && defaultApproved.length > 0) {
      // Seed Brad's approved strategies from the client profile on first visit.
      for (const k of defaultApproved) approveStrategy(clientId, k);
      setApproved(getApprovedStrategies(clientId));
    } else {
      setApproved(existing);
    }
    setCatalogue(getCatalogue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  function approve(key: ApprovedStrategyId) {
    approveStrategy(clientId, key);
    setApproved(getApprovedStrategies(clientId));
  }
  function unapprove(key: ApprovedStrategyId) {
    unapproveStrategy(clientId, key);
    setApproved(getApprovedStrategies(clientId));
  }
  function refreshCatalogue() {
    setCatalogue(getCatalogue());
  }

  const recommendedKeys = recommendations.map((r) => r.strategyKey);
  const otherStrategies = ALL_STRATEGIES.filter(
    (k) => !recommendedKeys.includes(k) && !approved.includes(k),
  );
  const approvedBuiltIns = approved.filter(isBuiltIn);
  const approvedForms = useMemo(
    () => getFormsForStrategies(approvedBuiltIns),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        {/* Add another built-in strategy */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-2 text-[13.5px] text-muted-foreground hover:text-foreground transition-colors tracking-tight"
          >
            <CirclePlus className="h-3.5 w-3.5" />
            {showAll ? "Hide" : "Add another built-in strategy"}
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
                  All built-in strategies are already recommended or approved.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section 2 — Strategy Library (ATO / MLC / Custom) */}
      <StrategyLibrary
        catalogue={catalogue}
        approved={approved}
        onApprove={approve}
        onUnapprove={unapprove}
        onCatalogueChange={refreshCatalogue}
      />

      {/* Section 3 — Approved Strategies */}
      <section>
        <SectionHeader
          icon={<ShieldCheck className="h-3.5 w-3.5 text-success" />}
          title="Approved Strategies"
          subtitle={
            approved.length === 0
              ? "Nothing approved yet. Approve a recommendation or pull one from the library above."
              : `${approved.length} ${approved.length === 1 ? "strategy" : "strategies"} approved. ${approvedForms.length} ${approvedForms.length === 1 ? "form" : "forms"} ready to generate.`
          }
        />

        {approved.length === 0 ? (
          <EmptyHint text="Approve a recommendation to see it appear here." />
        ) : (
          <div className="space-y-6">
            {approved.map((k) =>
              isBuiltIn(k) ? (
                <ApprovedStrategyBlock
                  key={k}
                  clientId={clientId}
                  strategyKey={k}
                  onRemove={() => unapprove(k)}
                />
              ) : (
                <ApprovedCatalogueBlock
                  key={k}
                  id={k}
                  onRemove={() => unapprove(k)}
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Strategy library ─────────────────────────────────────────────────────────

function StrategyLibrary({
  catalogue,
  approved,
  onApprove,
  onUnapprove,
  onCatalogueChange,
}: {
  catalogue: CatalogueStrategy[];
  approved: ApprovedStrategyId[];
  onApprove: (id: string) => void;
  onUnapprove: (id: string) => void;
  onCatalogueChange: () => void;
}) {
  const [filter, setFilter] = useState<StrategySource | "all">("all");
  const [creating, setCreating] = useState(false);

  const filtered =
    filter === "all"
      ? catalogue
      : catalogue.filter((s) => s.source === filter);

  const filters: { key: StrategySource | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "ato", label: "ATO" },
    { key: "mlc", label: "MLC" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <section>
      <SectionHeader
        icon={<Library className="h-3.5 w-3.5 text-gold" />}
        title="Strategy Library"
        subtitle="Pull strategies sourced from ATO guidance and the MLC product suite, or add your own. Everything here stays in the system and is reusable across every client."
      />

      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card/50 p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-[12.5px] font-medium rounded-md transition-colors tracking-tight",
                filter === f.key
                  ? "bg-gold/[0.12] text-gold"
                  : "text-muted-foreground/75 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/[0.08] px-3.5 py-2 text-[13px] font-medium text-gold hover:bg-gold/[0.13] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Create custom strategy
        </button>
      </div>

      {creating && (
        <CustomStrategyForm
          onCreate={(input) => {
            addCustomStrategy(input);
            onCatalogueChange();
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((s) => {
          const isApproved = approved.includes(s.id);
          return (
            <CatalogueCard
              key={s.id}
              strategy={s}
              approved={isApproved}
              onApprove={() => onApprove(s.id)}
              onUndo={() => onUnapprove(s.id)}
              onDelete={() => {
                if (isApproved) onUnapprove(s.id);
                removeCatalogueStrategy(s.id);
                onCatalogueChange();
              }}
            />
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-2 text-[12.5px] text-muted-foreground/55 italic">
            Nothing in this group yet.
          </p>
        )}
      </div>
    </section>
  );
}

function CatalogueCard({
  strategy,
  approved,
  onApprove,
  onUndo,
  onDelete,
}: {
  strategy: CatalogueStrategy;
  approved: boolean;
  onApprove: () => void;
  onUndo: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card overflow-hidden transition-colors flex flex-col",
        approved ? "border-success/35" : "border-border/70 hover:border-border",
      )}
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <span
            className={cn(
              "shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] rounded border px-2 py-0.5",
              SOURCE_BADGE[strategy.source],
            )}
          >
            {SOURCE_LABEL[strategy.source]}
          </span>
          <span className="text-[11px] text-muted-foreground/70 tracking-tight">
            {strategy.category}
          </span>
        </div>
        <h3 className="text-[15.5px] font-semibold text-foreground tracking-tight leading-snug mb-2">
          {strategy.name}
        </h3>
        <p className="text-[13.5px] text-foreground/80 leading-relaxed mb-4 flex-1">
          {strategy.description}
        </p>

        {strategy.reference && (
          <p className="text-[11px] text-muted-foreground/65 mb-3 tracking-tight">
            Source: {strategy.reference}
          </p>
        )}

        {strategy.providers && strategy.providers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {strategy.providers.map((p) => (
              <span
                key={p}
                className="text-[11px] font-medium text-foreground/80 bg-white/[0.05] border border-border/70 rounded px-2 py-0.5 tracking-tight"
              >
                {PROVIDERS[p].name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto">
          {approved ? (
            <button
              type="button"
              onClick={onUndo}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2.5 text-[13px] font-medium text-success"
            >
              <CheckCircle2 className="h-4 w-4" />
              Added to client
            </button>
          ) : (
            <button
              type="button"
              onClick={onApprove}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-gold/40 bg-gold/[0.08] px-3 py-2.5 text-[13px] font-medium text-gold hover:bg-gold/[0.13] transition-colors"
            >
              Add to client
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {strategy.source === "custom" && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete from library"
              className="shrink-0 inline-flex items-center justify-center rounded-md border border-border/60 px-2.5 py-2.5 text-muted-foreground/70 hover:text-red-400 hover:border-red-400/40 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomStrategyForm({
  onCreate,
  onCancel,
}: {
  onCreate: (input: {
    name: string;
    description: string;
    category?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const valid = name.trim().length > 1 && description.trim().length > 10;

  return (
    <div className="rounded-xl glass-card p-6 mb-5">
      <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-gold/90 mb-4">
        New custom strategy
      </p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-[12px] text-muted-foreground/85 mb-1.5 block tracking-tight">
            Strategy name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Investment bond for grandchildren"
            className="w-full rounded-md border border-border/70 bg-background/60 px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50"
          />
        </label>
        <label className="block">
          <span className="text-[12px] text-muted-foreground/85 mb-1.5 block tracking-tight">
            Category
          </span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Tax, Estate, Investment"
            className="w-full rounded-md border border-border/70 bg-background/60 px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50"
          />
        </label>
      </div>
      <label className="block mb-5">
        <span className="text-[12px] text-muted-foreground/85 mb-1.5 block tracking-tight">
          Description — this becomes the recommendation reasoning in the SOA
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Explain what the strategy is and why it suits the client, in plain language."
          className="w-full rounded-md border border-border/70 bg-background/60 px-3 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 resize-none"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!valid}
          onClick={() =>
            onCreate({
              name,
              description,
              category: category || undefined,
            })
          }
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-medium transition-colors",
            valid
              ? "border border-gold/40 bg-gold/[0.1] text-gold hover:bg-gold/[0.16]"
              : "border border-border/50 text-muted-foreground/50 cursor-not-allowed",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Save to library
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] text-muted-foreground/80 hover:text-foreground transition-colors tracking-tight"
        >
          Cancel
        </button>
      </div>
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
        approved ? "border-success/35" : "border-border/70 hover:border-border",
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2.5 text-[13px] font-medium text-success"
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
      className="text-left rounded-lg glass-card hover:border-gold/40 hover:bg-gold/[0.04] transition-colors p-5"
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
    <div className="rounded-xl glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-card">
        <div>
          <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-success/90 mb-1">
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

function ApprovedCatalogueBlock({
  id,
  onRemove,
}: {
  id: string;
  onRemove: () => void;
}) {
  const strategy = getCatalogueStrategy(id);
  const name = strategy?.name ?? id;
  const source = strategy?.source ?? "custom";
  return (
    <div className="rounded-xl glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-success/90">
              Approved
            </p>
            <span
              className={cn(
                "text-[9.5px] font-semibold uppercase tracking-[0.14em] rounded border px-1.5 py-0.5",
                SOURCE_BADGE[source],
              )}
            >
              {SOURCE_LABEL[source]}
            </span>
          </div>
          <p className="text-[16px] font-semibold text-foreground tracking-tight">
            {name}
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
        <p className="text-[13.5px] text-foreground/80 leading-relaxed">
          {strategy?.description ??
            "This strategy will be included in the SOA as an adviser-reviewed recommendation."}
        </p>
        {strategy?.reference && (
          <p className="text-[11px] text-muted-foreground/65 mt-3 tracking-tight">
            Source: {strategy.reference}
          </p>
        )}
        <p className="text-[12px] text-muted-foreground/70 mt-4 italic">
          No provider forms are linked to this strategy. It flows into the SOA
          as recommendation content for Brad to review.
        </p>
      </div>
    </div>
  );
}
