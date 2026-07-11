import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Database,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Clock,
} from "lucide-react";
import { CLIENTS, STATUS_CONFIG } from "@/lib/data";
import { getClientProfile } from "@/lib/client-profiles";
import { getFactFindOrDemo } from "@/lib/sarah-fact-find-store";
import { ensureFactFindsHydrated } from "@/lib/secure-store/fact-find-persistence";
import { STRATEGY_LABELS } from "@/lib/forms";
import { checkCompliance } from "@/lib/compliance/compliance-checker";
import { snapshotsForStrategies } from "@/lib/soa/market-data";
import { getGenerationReadiness } from "@/lib/soa/soa-generator";
import { Badge } from "@/components/ui/badge";
import { ClientTabs } from "@/components/clients/ClientTabs";
import { SoaGeneratorRunner } from "@/components/soa/SoaGeneratorRunner";

export default async function GenerateSoaPage({
  params,
}: {
  params: { id: string };
}) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client) notFound();

  const readiness = getGenerationReadiness(client.id);
  await ensureFactFindsHydrated();
  const factFind = getFactFindOrDemo(client.id);
  const profile = getClientProfile(client.id);
  const strategies = profile?.strategies ?? [];
  const compliance = checkCompliance(client.id, strategies);
  const market = snapshotsForStrategies(strategies);

  return (
    <div className="px-14 py-12">
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-9 tracking-wide"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {client.name}
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/90">
              Generate Statement of Advice
            </p>
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-foreground">
            {client.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={STATUS_CONFIG[client.status].className}>
              {STATUS_CONFIG[client.status].label}
            </Badge>
            <span className="text-[12px] text-muted-foreground/85">
              Estimated generation time under 2 minutes
            </span>
          </div>
        </div>
      </div>

      <ClientTabs clientId={client.id} />

      <div className="grid grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-5">

          {/* Readiness */}
          <ReadinessCard
            label="Fact Find"
            icon={Database}
            ok={readiness.factFindCompletion >= 70}
            detail={
              factFind
                ? `${factFind.completionPercentage}% complete${
                    factFind.missingSections.length > 0
                      ? ` · missing: ${factFind.missingSections.join(", ")}`
                      : ""
                  }`
                : "Not yet collected by Sarah."
            }
          />

          <ReadinessCard
            label="Compliance"
            icon={ShieldCheck}
            ok={
              compliance.overallStatus !== "failed" &&
              compliance.blockers.length === 0
            }
            detail={
              compliance.overallStatus === "failed"
                ? `Score ${compliance.complianceScore} · ${compliance.blockers.length} blocker${compliance.blockers.length === 1 ? "" : "s"}`
                : `Score ${compliance.complianceScore} · ${compliance.warnings.length} warning${compliance.warnings.length === 1 ? "" : "s"}`
            }
          />

          <ReadinessCard
            label="Approved Strategies"
            icon={CheckCircle2}
            ok={strategies.length > 0}
            detail={
              strategies.length === 0
                ? "No strategies approved. Open the Strategies tab to approve at least one."
                : strategies.map((s) => STRATEGY_LABELS[s]).join(" · ")
            }
          />

          <ReadinessCard
            label="Market Data Sources"
            icon={TrendingUp}
            ok={market.length > 0}
            detail={`${market.length} live data points will be snapshotted at generation time.`}
            sublist={market.map((m) => `${m.label} (${m.source})`)}
          />

          {/* Generator */}
          <SoaGeneratorRunner
            clientId={client.id}
            disabled={!readiness.ready}
          />

          {/* Issues */}
          {readiness.blockers.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/[0.04] overflow-hidden">
              <div className="flex">
                <div className="w-[3px] shrink-0 bg-gradient-to-b from-red-500/70 to-red-500/20" />
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-red-300">
                      Cannot Generate Yet
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {readiness.blockers.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[13px] text-foreground/85"
                      >
                        <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-red-400/70" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {readiness.warnings.length > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning/[0.05] overflow-hidden">
              <div className="flex">
                <div className="w-[3px] shrink-0 bg-gradient-to-b from-warning/70 to-warning/20" />
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-warning">
                      Brad will see these flagged
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {readiness.warnings.map((w, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[13px] text-foreground/85"
                      >
                        <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-warning/70" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right summary */}
        <aside className="sticky top-8 rounded-lg glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-black/25">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Client Summary
            </h3>
          </div>
          <div className="px-5 py-5 space-y-3.5 text-[12.5px] text-foreground/85">
            <Row label="Name" value={client.name} />
            <Row label="Adviser" value={client.adviser} />
            <Row
              label="Income"
              value={factFind?.employmentAndIncome.annualGrossIncome || "—"}
            />
            <Row
              label="Super"
              value={
                factFind?.superannuation.fundName
                  ? `${factFind.superannuation.fundName} · ${factFind.superannuation.estimatedBalance || "—"}`
                  : "—"
              }
            />
            <Row
              label="Risk profile"
              value={
                factFind?.goalsAndObjectives.investmentRiskPreference || "—"
              }
            />
            <div className="pt-2 mt-2 border-t border-border/40">
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground/85 mb-2">
                Generation Notes
              </p>
              <p className="flex items-start gap-1.5 text-[11.5px] text-muted-foreground/85 leading-relaxed mb-1.5">
                <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                Generation typically completes in under two minutes.
              </p>
              <p className="text-[11.5px] text-muted-foreground/85 leading-relaxed">
                All disclosures and approved language pull from the Charter compliance knowledge base.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/75">
        {label}
      </span>
      <span className="text-right text-[12.5px] text-foreground/90 max-w-[200px]">
        {value}
      </span>
    </div>
  );
}

function ReadinessCard({
  label,
  icon: Icon,
  ok,
  detail,
  sublist,
}: {
  label: string;
  icon: React.ElementType;
  ok: boolean;
  detail: string;
  sublist?: string[];
}) {
  return (
    <div className="rounded-lg glass-card overflow-hidden">
      <div className="px-5 py-4 flex items-start gap-3.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
            ok
              ? "bg-success/10 border-success/30 text-success"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-foreground">{label}</p>
            <span
              className={`text-[10px] font-medium tracking-[0.15em] uppercase ${
                ok ? "text-success/85" : "text-red-400/85"
              }`}
            >
              {ok ? "Ready" : "Blocked"}
            </span>
          </div>
          <p className="text-[12.5px] text-muted-foreground/85 mt-1 leading-relaxed">
            {detail}
          </p>
          {sublist && sublist.length > 0 && (
            <ul className="mt-2 space-y-1">
              {sublist.slice(0, 4).map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[11.5px] text-muted-foreground/65"
                >
                  <span className="mt-[7px] h-[2px] w-[2px] shrink-0 rounded-full bg-muted-foreground/40" />
                  {item}
                </li>
              ))}
              {sublist.length > 4 && (
                <li className="text-[11px] text-muted-foreground/55 mt-1">
                  + {sublist.length - 4} more sources
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
