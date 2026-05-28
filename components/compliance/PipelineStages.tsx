import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Circle,
  Lock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import type { ComplianceResult } from "@/lib/compliance/compliance-checker";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  factFindComplete: boolean;
  factFindProgress: number;
  result: ComplianceResult;
  signedOff: boolean;
}

type StageState = "complete" | "active" | "locked";

interface Stage {
  id: string;
  label: string;
  state: StageState;
  detail: string;
}

export function PipelineStages({
  clientId,
  factFindComplete,
  factFindProgress,
  result,
  signedOff,
}: Props) {
  const complianceClear =
    result.overallStatus !== "failed" &&
    result.blockers.length === 0 &&
    signedOff;

  const stages: Stage[] = [
    {
      id: "fact-find",
      label: "Fact Find",
      state: factFindComplete
        ? "complete"
        : factFindProgress > 0
        ? "active"
        : "locked",
      detail: factFindComplete
        ? "All ten sections collected"
        : `${factFindProgress}% complete`,
    },
    {
      id: "compliance",
      label: "Compliance Check",
      state: !factFindComplete
        ? "locked"
        : complianceClear
        ? "complete"
        : "active",
      detail: !factFindComplete
        ? "Awaiting fact find"
        : complianceClear
        ? `Score ${result.complianceScore} · Signed off`
        : `Score ${result.complianceScore} · ${result.blockers.length} blocker${
            result.blockers.length === 1 ? "" : "s"
          }`,
    },
    {
      id: "soa",
      label: "SOA Ready",
      state: complianceClear ? "complete" : "locked",
      detail: complianceClear
        ? "Cleared for SOA generation"
        : "Locked — compliance not cleared",
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 bg-[hsl(224,20%,7%)]">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Pipeline Status
        </h2>
      </div>
      <div className="px-6 py-6">
        <ol className="space-y-4">
          {stages.map((stage, i) => {
            const Icon =
              stage.state === "complete"
                ? CheckCircle2
                : stage.state === "active"
                ? Clock
                : Lock;
            const tone =
              stage.state === "complete"
                ? "text-emerald-400"
                : stage.state === "active"
                ? "text-amber-400"
                : "text-muted-foreground/40";
            const pillTone =
              stage.state === "complete"
                ? "text-emerald-400/85 bg-emerald-500/10 border-emerald-500/25"
                : stage.state === "active"
                ? "text-amber-300/85 bg-amber-500/10 border-amber-500/25"
                : "text-muted-foreground/55 bg-white/[0.03] border-border/55";

            const inner = (
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center">
                  <Icon className={cn("h-4 w-4 shrink-0", tone)} />
                  {i < stages.length - 1 && (
                    <div className="w-px flex-1 bg-border/40 mt-2 min-h-[18px]" />
                  )}
                </div>
                <div className={cn("flex-1 min-w-0", i < stages.length - 1 && "pb-2")}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13.5px] font-medium text-foreground">
                      {stage.label}
                    </p>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-medium border tracking-tight uppercase",
                        pillTone
                      )}
                    >
                      {stage.state}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground/80 mt-1">
                    {stage.detail}
                  </p>
                </div>
              </div>
            );

            if (stage.id === "compliance") {
              return (
                <li key={stage.id}>
                  <Link
                    href={`/clients/${clientId}/compliance`}
                    className="block rounded -m-1 p-1 hover:bg-white/[0.02]"
                  >
                    {inner}
                  </Link>
                </li>
              );
            }
            return <li key={stage.id}>{inner}</li>;
          })}
        </ol>
      </div>
    </div>
  );
}

interface SoaGateProps {
  clientId: string;
  result: ComplianceResult;
  signedOff: boolean;
}

export function SoaGate({ clientId, result, signedOff }: SoaGateProps) {
  const cleared =
    result.overallStatus !== "failed" &&
    result.blockers.length === 0 &&
    signedOff;

  if (cleared) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] overflow-hidden">
        <div className="flex">
          <div className="w-[3px] shrink-0 bg-gradient-to-b from-emerald-500/70 to-emerald-500/20" />
          <div className="px-6 py-5">
            <div className="flex items-center gap-2.5 mb-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-emerald-300">
                SOA Ready · Compliance Cleared
              </p>
            </div>
            <p className="text-[13px] text-foreground/80 leading-relaxed mb-3">
              Compliance score {result.complianceScore} / 100, adviser sign-off
              recorded. SOA generation is unlocked for this client.
            </p>
            <Link
              href={`/clients/${clientId}/compliance`}
              className="inline-flex items-center gap-2 rounded border border-emerald-500/35 bg-emerald-500/5 px-3 py-1.5 text-[12px] font-medium text-emerald-300 hover:text-emerald-200 hover:border-emerald-500/55 transition-colors"
            >
              View certificate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const Icon = result.overallStatus === "failed" ? ShieldX : ShieldAlert;
  const blockingItems: string[] = [];

  if (result.blockers.length > 0) {
    for (const b of result.blockers) blockingItems.push(`${b.area}: ${b.message}`);
  }
  if (!signedOff && result.blockers.length === 0) {
    blockingItems.push("Adviser sign-off not yet recorded");
  }
  if (result.missingInformation.length > 0 && blockingItems.length === 0) {
    for (const m of result.missingInformation.slice(0, 3)) {
      blockingItems.push(`${m.area}: ${m.message}`);
    }
  }

  const tone =
    result.overallStatus === "failed"
      ? "border-red-500/30 bg-red-500/[0.04]"
      : "border-amber-500/30 bg-amber-500/[0.04]";
  const accent =
    result.overallStatus === "failed"
      ? "from-red-500/70 to-red-500/20"
      : "from-amber-500/70 to-amber-500/20";
  const head =
    result.overallStatus === "failed" ? "text-red-300" : "text-amber-300";
  const iconTone =
    result.overallStatus === "failed" ? "text-red-400" : "text-amber-400";

  return (
    <div className={cn("rounded-lg border overflow-hidden", tone)}>
      <div className="flex">
        <div className={cn("w-[3px] shrink-0 bg-gradient-to-b", accent)} />
        <div className="px-6 py-5">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Icon className={cn("h-4 w-4", iconTone)} />
            <p
              className={cn(
                "text-[10px] font-bold tracking-[0.18em] uppercase",
                head
              )}
            >
              SOA Generation Locked
            </p>
          </div>
          <p className="text-[13px] text-foreground/80 leading-relaxed mb-3">
            A Statement of Advice cannot be generated for this client until the
            compliance gate is cleared.
          </p>
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground/85 mb-2">
            Blocking
          </p>
          <ul className="space-y-1.5 mb-4">
            {blockingItems.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[12.5px] text-foreground/80"
              >
                <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-muted-foreground/60" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={`/clients/${clientId}/compliance`}
            className={cn(
              "inline-flex items-center gap-2 rounded border px-3 py-1.5 text-[12px] font-medium transition-colors",
              result.overallStatus === "failed"
                ? "border-red-500/35 bg-red-500/5 text-red-300 hover:text-red-200 hover:border-red-500/55"
                : "border-amber-500/35 bg-amber-500/5 text-amber-300 hover:text-amber-200 hover:border-amber-500/55"
            )}
          >
            Open compliance review
          </Link>
        </div>
      </div>
    </div>
  );
}
