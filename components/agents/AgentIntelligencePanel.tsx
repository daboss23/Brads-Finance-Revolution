"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSignature,
  RadioTower,
  ShieldCheck,
  Sparkles,
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
    label: "Assemble Orion Packet",
    title: "Orion SOA evidence packet",
    icon: FileSignature,
    description: "Pulls approved facts, compliance notes and projection drivers into one prep layer.",
  },
  {
    agentId: "atlas",
    label: "Generate ATLAS Draft View",
    title: "ATLAS strategy synthesis",
    icon: AlertTriangle,
    description: "Produces tailored strategy reasoning, reusable advice chunks and projection assumptions.",
  },
];

type OutputState = Partial<Record<AgentId, { output: AgentOutput; cached: boolean }>>;

/* Distinct glass rim + icon tone per agent */
const AGENT_GLASS: Partial<Record<AgentId, { row: string; icon: string }>> = {
  beacon: { row: "border-teal-accent/25", icon: "border-teal-accent/35 text-teal-accent" },
  guardian: { row: "border-success/25", icon: "border-success/35 text-success" },
  scribe: { row: "border-purple-accent/25", icon: "border-purple-accent/35 text-purple-accent" },
  orion: { row: "border-blue-accent/25", icon: "border-blue-accent/35 text-blue-accent" },
  atlas: { row: "border-gold/30", icon: "border-gold/40 text-gold" },
};

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
            clientId,
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
    <section className="glass-panel edge-gold mb-5 overflow-hidden">
      <div className="border-b border-white/[0.06] bg-black/25 px-5 py-4">
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
            <div
              key={action.agentId}
              className={cn(
                "glass-chip rounded-xl p-3",
                AGENT_GLASS[action.agentId]?.row,
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "glass-orb grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                    AGENT_GLASS[action.agentId]?.icon ?? "border-gold/30 text-gold",
                  )}
                >
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
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isPending && running === action.agentId}
                    onClick={() => run(action.agentId)}
                    className={cn(
                      "mt-3 inline-flex h-8 items-center rounded-md border border-gold/25 bg-gold/10 px-3 text-[11px] font-semibold text-gold transition hover:border-gold/45 hover:bg-gold/15 disabled:cursor-wait disabled:opacity-60",
                      result && "border-success/25 bg-success/10 text-success",
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
  if (agentId === "orion" && "soaReady" in output) {
    const missing = Array.isArray(output.missingBeforeDraft) ? output.missingBeforeDraft : [];
    return output.soaReady ? "SOA evidence packet ready." : `${missing.length} items still blocking ATLAS.`;
  }
  if (agentId === "atlas" && "strategyThemes" in output) {
    const themes = Array.isArray(output.strategyThemes) ? output.strategyThemes : [];
    const recommendations = Array.isArray(output.tailoredRecommendations)
      ? output.tailoredRecommendations
      : [];
    return `${themes.length} tailored strategy themes and ${recommendations.length} recommendation lanes ready.`;
  }
  return "Agent output ready.";
}
