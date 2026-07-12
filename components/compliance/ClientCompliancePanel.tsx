"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Play,
  Download,
  PenLine,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import {
  checkCompliance,
  COMPLIANCE_STATUS_COPY,
  type ComplianceResult,
} from "@/lib/compliance/compliance-checker";
import type { ComplianceStatus } from "@/lib/compliance/knowledge-base";
import { logAudit, getSignOff } from "@/lib/compliance/audit-trail";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  clientName: string;
  initial: ComplianceResult;
}

const STATUS_ICON: Record<ComplianceStatus, React.ElementType> = {
  passed: CheckCircle2,
  failed: XCircle,
  pending: AlertTriangle,
  "not-applicable": MinusCircle,
};

const STATUS_TONE: Record<ComplianceStatus, string> = {
  passed: "text-success",
  failed: "text-red-400",
  pending: "text-warning",
  "not-applicable": "text-muted-foreground/55",
};

export function ClientCompliancePanel({ clientId, clientName, initial }: Props) {
  const [result, setResult] = useState<ComplianceResult>(initial);
  const [running, setRunning] = useState(false);
  const [signedOff, setSignedOff] = useState<boolean>(
    typeof window !== "undefined" ? Boolean(getSignOff(clientId)) : false,
  );

  const overall = COMPLIANCE_STATUS_COPY[result.overallStatus];

  const ringColor = useMemo(() => {
    if (result.complianceScore >= 85) return "stroke-[hsl(var(--success))]";
    if (result.complianceScore >= 60) return "stroke-[hsl(var(--warning))]";
    return "stroke-red-400";
  }, [result.complianceScore]);

  function runCheck() {
    setRunning(true);
    setTimeout(() => {
      const next = checkCompliance(clientId);
      setResult(next);
      logAudit(clientId, "check-run", "Brad", {
        score: next.complianceScore,
        status: next.overallStatus,
        blockers: next.blockers.length,
        warnings: next.warnings.length,
        missing: next.missingInformation.length,
      });
      setRunning(false);
    }, 650);
  }

  function downloadCertificate() {
    logAudit(clientId, "certificate-generated", "Brad", {
      format: "PDF",
      score: result.complianceScore,
    });
    const a = document.createElement("a");
    a.href = `/api/compliance/${clientId}/certificate`;
    a.download = `${clientName.replace(/\s+/g, "-")}-compliance-certificate.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function signOff() {
    if (result.blockers.length > 0) return;
    logAudit(clientId, "sign-off-given", "Brad", {
      score: result.complianceScore,
      status: result.overallStatus,
      acknowledgement:
        "I have reviewed the compliance check and certify that the best interests duty has been met.",
    });
    setSignedOff(true);
  }

  const OverallIcon =
    overall.tone === "passed"
      ? ShieldCheck
      : overall.tone === "warning"
      ? ShieldAlert
      : ShieldX;

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="grid gap-6 px-5 py-5 sm:grid-cols-[1fr_auto] sm:px-7 sm:py-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <OverallIcon
                className={cn(
                  "h-4 w-4",
                  overall.tone === "passed"
                    ? "text-success"
                    : overall.tone === "warning"
                    ? "text-warning"
                    : "text-red-400"
                )}
              />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/85">
                Compliance Status
              </p>
            </div>
            <h2 className="text-[24px] font-semibold tracking-tight text-foreground mb-1.5">
              {overall.label}
            </h2>
            <p className="text-[13px] text-muted-foreground/85 leading-relaxed max-w-[480px]">
              Best interests duty, safe harbour and Charter AFSL obligations
              evaluated against the client&apos;s fact find and scope of advice.
            </p>
            <p className="text-[11px] text-muted-foreground/55 mt-3">
              Checker v{result.checkerVersion} · Last run{" "}
              {new Date(result.timestamp).toLocaleString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <ScoreRing
              score={result.complianceScore}
              ringColor={ringColor}
            />
          </div>
        </div>
        <div className="px-7 py-4 border-t border-border/40 bg-[hsl(224,20%,6%)] flex flex-wrap items-center gap-3">
          <button
            onClick={runCheck}
            disabled={running}
            className="inline-flex items-center gap-2 rounded border border-gold/35 bg-gold/5 px-4 py-2 text-[12px] font-medium text-gold hover:border-gold/55 transition-colors disabled:opacity-50"
          >
            <Play className="h-3 w-3" />
            {running ? "Running…" : "Run Compliance Check"}
          </button>
          <button
            onClick={downloadCertificate}
            className="inline-flex items-center gap-2 btn-glass rounded px-4 py-2 text-[12px] font-medium text-foreground/80 hover:text-foreground hover:border-border/90 transition-colors"
          >
            <Download className="h-3 w-3" />
            Download Compliance Certificate
          </button>
          <button
            onClick={signOff}
            disabled={result.blockers.length > 0 || signedOff}
            className="inline-flex items-center gap-2 btn-glass rounded px-4 py-2 text-[12px] font-medium text-foreground/80 hover:text-foreground hover:border-border/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={
              result.blockers.length > 0
                ? "Resolve blockers before signing off"
                : signedOff
                ? "Already signed off"
                : "Sign off as adviser"
            }
          >
            <PenLine className="h-3 w-3" />
            {signedOff ? "Signed Off" : "Adviser Sign-Off"}
          </button>
        </div>
      </div>

      {/* Issues lanes */}
      {(result.blockers.length > 0 ||
        result.missingInformation.length > 0 ||
        result.warnings.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <IssueLane
            label="Blockers"
            count={result.blockers.length}
            issues={result.blockers}
            tone="red"
          />
          <IssueLane
            label="Missing Information"
            count={result.missingInformation.length}
            issues={result.missingInformation}
            tone="red"
          />
          <IssueLane
            label="Warnings"
            count={result.warnings.length}
            issues={result.warnings}
            tone="amber"
          />
        </div>
      )}

      {/* Best Interests Duty */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-black/25 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Best Interests Duty
          </h3>
          <span className="text-[11px] text-muted-foreground/65">
            {result.bestInterestsDuty.filter((s) => s.status === "passed").length}{" "}
            of {result.bestInterestsDuty.length} passed
          </span>
        </div>
        <ul className="divide-y divide-border/40">
          {result.bestInterestsDuty.map((step, i) => {
            const Icon = STATUS_ICON[step.status];
            return (
              <li key={step.id} className="px-6 py-4">
                <div className="flex items-start gap-3.5">
                  <Icon
                    className={cn("h-4 w-4 shrink-0 mt-0.5", STATUS_TONE[step.status])}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-[13.5px] font-medium text-foreground">
                        Step {i + 1}. {step.requirement}
                      </p>
                      <StatusPill status={step.status} />
                    </div>
                    <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed">
                      {step.description}
                    </p>
                    {step.evidence && (
                      <p className="mt-2 text-[12px] text-muted-foreground/65 italic leading-relaxed">
                        Evidence: {step.evidence}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Safe Harbour */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-black/25 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Safe Harbour · s961B(2)
          </h3>
          <span className="text-[11px] text-muted-foreground/65">
            {result.safeHarbour.filter((s) => s.status === "passed").length} of{" "}
            {
              result.safeHarbour.filter((s) => s.status !== "not-applicable")
                .length
            }{" "}
            passed
          </span>
        </div>
        <ul className="divide-y divide-border/40">
          {result.safeHarbour.map((step) => {
            const Icon = STATUS_ICON[step.status];
            return (
              <li key={step.id} className="px-6 py-4">
                <div className="flex items-start gap-3.5">
                  <Icon
                    className={cn("h-4 w-4 shrink-0 mt-0.5", STATUS_TONE[step.status])}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-[13.5px] font-medium text-foreground">
                        {step.requirement}
                      </p>
                      <StatusPill status={step.status} />
                    </div>
                    <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* AFSL obligations */}
      <div className="rounded-lg glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 bg-black/25">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            AFSL Obligations · Charter 234665
          </h3>
        </div>
        <ul className="divide-y divide-border/40">
          {result.afslObligations.map((o) => {
            const Icon = STATUS_ICON[o.status];
            return (
              <li key={o.id} className="px-6 py-4">
                <div className="flex items-start gap-3.5">
                  <Icon
                    className={cn("h-4 w-4 shrink-0 mt-0.5", STATUS_TONE[o.status])}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-[13.5px] font-medium text-foreground">
                        {o.obligation}
                      </p>
                      <StatusPill status={o.status} />
                    </div>
                    <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed">
                      {o.description}{" "}
                      <span className="text-muted-foreground/55">
                        · {o.reference}
                      </span>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ScoreRing({
  score,
  ringColor,
}: {
  score: number;
  ringColor: string;
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative h-[108px] w-[108px]">
      <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
        <circle
          cx="54"
          cy="54"
          r={radius}
          strokeWidth="8"
          fill="none"
          className="stroke-border/55"
        />
        <circle
          cx="54"
          cy="54"
          r={radius}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className={ringColor}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[28px] font-semibold tracking-tight text-foreground tabular-nums leading-none">
          {score}
        </p>
        <p className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/65 mt-1">
          Score
        </p>
      </div>
    </div>
  );
}

interface ComplianceIssueLite {
  id: string;
  message: string;
  area: string;
}

function IssueLane({
  label,
  count,
  issues,
  tone,
}: {
  label: string;
  count: number;
  issues: ComplianceIssueLite[];
  tone: "red" | "amber";
}) {
  const toneClass =
    tone === "red"
      ? "border-red-500/30 bg-red-500/[0.04]"
      : "border-warning/30 bg-warning/[0.05]";
  const headTone =
    tone === "red" ? "text-red-300" : "text-warning";

  return (
    <div className={cn("rounded-lg border overflow-hidden", toneClass)}>
      <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
        <p className={cn("text-[10px] font-bold tracking-[0.18em] uppercase", headTone)}>
          {label}
        </p>
        <span className={cn("text-[12px] font-semibold tabular-nums", headTone)}>
          {count}
        </span>
      </div>
      <ul className="px-5 py-3 space-y-2.5 min-h-[60px]">
        {issues.length === 0 && (
          <li className="text-[12px] text-muted-foreground/60 italic">None</li>
        )}
        {issues.map((issue) => (
          <li key={issue.id} className="text-[12.5px] text-foreground/85">
            <span className="text-muted-foreground/60">{issue.area}: </span>
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusPill({ status }: { status: ComplianceStatus }) {
  if (status === "passed")
    return (
      <span className="rounded px-2 py-0.5 text-[10px] font-medium text-success/85 bg-success/10 border border-success/25">
        Passed
      </span>
    );
  if (status === "failed")
    return (
      <span className="rounded px-2 py-0.5 text-[10px] font-medium text-red-400/85 bg-red-500/10 border border-red-500/25">
        Failed
      </span>
    );
  if (status === "pending")
    return (
      <span className="rounded px-2 py-0.5 text-[10px] font-medium text-warning/85 bg-warning/10 border border-warning/25">
        Pending
      </span>
    );
  return (
    <span className="rounded px-2 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-white/[0.04] border border-border/55">
      N/A
    </span>
  );
}
