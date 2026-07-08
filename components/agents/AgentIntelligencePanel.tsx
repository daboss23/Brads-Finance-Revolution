"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSignature,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { AgentId, AgentOutput } from "@/lib/agents/types";
import { cn } from "@/lib/utils";

const ACTIONS: Array<{
  agentId: AgentId;
  label: string;
  title: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    agentId: "beacon",
    label: "Refresh Beacon",
    title: "Beacon structured summary",
    icon: RadioTower,
    description: "Normalises fact-find answers, missing fields and Xplan-ready data.",
  },
  {
    agentId: "guardian",
    label: "Run Guardian Check",
    title: "Guardian compliance flags",
    icon: ShieldCheck,
    description: "Checks data gaps, consent status, review flags and SOA blockers.",
  },
  {
    agentId: "scribe",
    label: "Generate Meeting Brief",
    title: "Scribe meeting prep",
    icon: Sparkles,
    description: "Creates Brad's prep questions, concerns and likely client priorities.",
  },
  {
    agentId: "orion",
    label: "Generate Orion View",
    title: "Orion adviser considerations",
    icon: AlertTriangle,
    description: "Adviser consideration only. Requires Brad review.",
  },
  {
    agentId: "atlas",
    label: "Generate Atlas Pack",
    title: "Atlas SOA input pack",
    icon: FileSignature,
    description: "Prepares SOA inputs only from Brad-approved facts.",
  },
  {
    agentId: "cipher",
    label: "Refresh Cipher",
    title: "Cipher follow-up recommendation",
    icon: Zap,
    description: "Finds stale clients, missing info and follow-up priorities.",
  },
];

type OutputState = Partial<Record<AgentId, { output: AgentOutput; cached: boolean }>>;

export function AgentIntelligencePanel({ clientId }: { clientId: string }) {
  const [outputs, setOutputs] = useState<OutputState>({});
  const [running, setRunning] = useState<AgentId | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(agentId: AgentId) {
    setRunning(agentId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/agents/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId,
            clientId: agentId === "cipher" ? undefined : clientId,
            force: true,
          }),
        });
        const json = await res.json();
        if (res.ok) {
          setOutputs((current) => ({
            ...current,
            [agentId]: { output: json.output, cached: json.cached },
          }));
        }
      } finally {
        setRunning(null);
      }
    });
  }

  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-gold/20 bg-card">
      <div className="border-b border-border/60 bg-[hsl(224,20%,7%)] px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold/85">
          Agent Intelligence
        </p>
        <p className="mt-2 text-[12px] leading-5 text-muted-foreground/75">
          Manual agent runs only. No AI runs on page load.
        </p>
      </div>

      <div className="space-y-3 px-5 py-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const result = outputs[action.agentId];
          return (
            <div key={action.agentId} className="rounded-lg border border-border/70 bg-white/[0.025] p-3">
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[12.5px] font-semibold text-foreground">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground/68">
                        {result ? summariseOutput(action.agentId, result.output) : action.description}
                      </p>
                    </div>
                    {result && (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isPending && running === action.agentId}
                    onClick={() => run(action.agentId)}
                    className={cn(
                      "mt-3 inline-flex h-8 items-center rounded-md border border-gold/25 bg-gold/10 px-3 text-[11px] font-semibold text-gold transition hover:border-gold/45 hover:bg-gold/15 disabled:cursor-wait disabled:opacity-60",
                      result && "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
                    )}
                  >
                    {isPending && running === action.agentId ? "Running" : result ? "Refresh again" : action.label}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function summariseOutput(agentId: AgentId, output: AgentOutput): string {
  if (agentId === "beacon" && "completionPercentage" in output) {
    const missingFields = Array.isArray(output.missingFields) ? output.missingFields : [];
    const vagueFields = Array.isArray(output.vagueFields) ? output.vagueFields : [];
    return `${output.completionPercentage}% complete, ${missingFields.length} missing field groups, ${vagueFields.length} vague fields.`;
  }
  if (agentId === "guardian" && "complianceScore" in output) {
    return `${output.complianceScore}/100 compliance score. ${output.blockedFromSOA ? "Blocked from SOA." : "No critical SOA block."}`;
  }
  if (agentId === "scribe" && "questionsForBrad" in output) {
    const questions = Array.isArray(output.questionsForBrad) ? output.questionsForBrad : [];
    return `${questions.length} meeting prep questions ready.`;
  }
  if (agentId === "orion" && "strategyThemes" in output) {
    const themes = Array.isArray(output.strategyThemes) ? output.strategyThemes : [];
    return `${themes.length} adviser-only strategy themes. Requires Brad review.`;
  }
  if (agentId === "atlas" && "soaReady" in output) {
    const missing = Array.isArray(output.missingBeforeDraft) ? output.missingBeforeDraft : [];
    return output.soaReady ? "SOA input pack ready." : `${missing.length} items missing before draft.`;
  }
  if (agentId === "cipher" && "todaysBrief" in output) {
    return typeof output.todaysBrief === "string" ? output.todaysBrief : "Cipher brief ready.";
  }
  return "Agent output ready.";
}
