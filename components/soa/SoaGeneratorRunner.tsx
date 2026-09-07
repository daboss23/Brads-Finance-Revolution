"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Circle,
  AlertTriangle,
  Play,
  ArrowRight,
} from "lucide-react";
import {
  STAGE_LABELS,
  getStageOrder,
  type GenerationStage,
} from "@/lib/soa/soa-generator";
import { recordPlanGenerated } from "@/lib/soa/voice-learner";
import { announceSoaGenerated } from "@/lib/soa/generation-events";
import { logAudit } from "@/lib/compliance/audit-trail";
import { getApprovedStrategies } from "@/lib/client-strategy-store";
import { getCatalogueStrategy } from "@/lib/strategy-catalogue";
import { saveSoa } from "@/lib/soa/soa-store";
import type { SoaDocument } from "@/lib/soa/soa-template";
import { cn } from "@/lib/utils";

interface Props {
  clientId: string;
  disabled: boolean;
}

type StageState = "pending" | "running" | "done" | "error";

type AgentEventState = {
  agentId: string;
  name: string;
  role: string;
  status: "running" | "done" | "error";
  summary: string;
  durationMs: number;
  cached: boolean;
};

/**
 * The server finishes the chain far faster than a person can read it, so every
 * event is held for a beat before it renders. Brad watches each agent land
 * instead of seeing five names flash past.
 */
const PACE_MS = {
  stage: 420,
  agentStart: 1200,
  agentDone: 1500,
  beforeComplete: 900,
} as const;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function SoaGeneratorRunner({ clientId, disabled }: Props) {
  const stages = getStageOrder();
  const [states, setStates] = useState<Record<GenerationStage, StageState>>(
    () =>
      Object.fromEntries(stages.map((s) => [s, "pending"])) as Record<
        GenerationStage,
        StageState
      >,
  );
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [agentEvents, setAgentEvents] = useState<AgentEventState[]>([]);

  async function start() {
    setError(null);
    setBlockers([]);
    setComplete(false);
    setRunning(true);
    const fresh = Object.fromEntries(
      stages.map((s) => [s, "pending"]),
    ) as Record<GenerationStage, StageState>;
    setStates(fresh);
    setAgentEvents([]);

    try {
      // Send Brad's approved strategies (built-in, catalogue and custom) plus
      // the names/descriptions for catalogue/custom ones, so the SOA reflects
      // exactly what was approved on the Strategies tab.
      const approved = getApprovedStrategies(clientId);
      const customStrategies = approved
        .map((id) => getCatalogueStrategy(id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
        .map((s) => ({ id: s.id, name: s.name, description: s.description }));

      const res = await fetch(`/api/soa/${clientId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategies: approved, customStrategies }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const event = parseEvent(chunk);
          if (!event) continue;
          if (event.name === "stage") {
            const stage = event.data.stage as GenerationStage;
            const status = event.data.status as "starting" | "complete";
            setStates((prev) => ({
              ...prev,
              [stage]: status === "starting" ? "running" : "done",
            }));
            await sleep(PACE_MS.stage);
          } else if (event.name === "agent") {
            const incoming = event.data as unknown as AgentEventState;
            setAgentEvents((prev) => {
              const idx = prev.findIndex((a) => a.agentId === incoming.agentId);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = incoming;
                return next;
              }
              return [...prev, incoming];
            });
            await sleep(
              incoming.status === "running"
                ? PACE_MS.agentStart
                : PACE_MS.agentDone,
            );
          } else if (event.name === "complete") {
            await sleep(PACE_MS.beforeComplete);
            // Persist the generated document so the review page shows exactly
            // what was generated, including catalogue/custom strategies.
            if (event.data.doc) {
              saveSoa(event.data.doc as SoaDocument);
            }
            recordPlanGenerated(clientId);
            logAudit(clientId, "certificate-generated", "Brad", {
              format: "SOA",
              complianceScore: event.data.complianceScore,
              sectionCount: event.data.sectionCount,
              generatedAt: event.data.generatedAt,
            });
            setComplete(true);
            // Raises the gold download CTA in the right rail. Nothing
            // navigates: the chain above is the record of what just happened.
            announceSoaGenerated({
              clientId,
              generatedAt: String(event.data.generatedAt ?? ""),
              complianceScore: Number(event.data.complianceScore ?? 0),
              sectionCount: Number(event.data.sectionCount ?? 0),
            });
          } else if (event.name === "error") {
            setError(
              typeof event.data.message === "string"
                ? event.data.message
                : "Generation failed",
            );
            setBlockers((event.data.blockers as string[]) ?? []);
            setStates((prev) => {
              const next = { ...prev };
              for (const key of Object.keys(next) as GenerationStage[]) {
                if (next[key] === "running") next[key] = "error";
              }
              return next;
            });
          }
        }
      }

      setRunning(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setRunning(false);
    }
  }

  const doneAgents = agentEvents.filter((a) => a.status === "done").length;

  return (
    <div className="space-y-6">
      <button
        onClick={start}
        disabled={disabled || running}
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[13px] font-semibold transition-colors",
          disabled || running
            ? "glass-card text-muted-foreground/55 cursor-not-allowed"
            : "bg-gold text-gold-foreground hover:bg-gold/90 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_4px_14px_-4px_rgba(212,175,55,0.45)]",
        )}
      >
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" />
            {complete ? "Generate Again" : "Generate SOA"}
          </>
        )}
      </button>

      {complete && (
        <div className="soa-cta-enter rounded-lg border border-gold/30 bg-gold/[0.05] overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-gold-bright/80 to-gold/20" />
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gold/90">
                  Statement of Advice Generated
                </p>
              </div>
              <p className="text-[12.5px] text-foreground/80 leading-relaxed">
                The agent chain below stays on screen. Download the PDF from the
                panel on the right, or open the review page to edit before
                sending.
              </p>
              <Link
                href={`/clients/${clientId}/soa`}
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-gold hover:text-gold-bright transition-colors"
              >
                Open SOA review
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {agentEvents.length > 0 && (
        <div className="rounded-lg glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 bg-black/25 flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Agent Intelligence Chain
            </h3>
            <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-gold/80">
              {doneAgents}/{SOA_CHAIN_LENGTH} complete
            </span>
          </div>
          <ul className="px-6 py-4 space-y-4">
            {agentEvents.map((agent) => (
              <li key={agent.agentId} className="flex items-start gap-3">
                <StageIcon state={agent.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p
                      className={cn(
                        "text-[13px] font-semibold",
                        agent.status === "done"
                          ? "text-foreground"
                          : agent.status === "error"
                            ? "text-red-400"
                            : "text-warning/95",
                      )}
                    >
                      {agent.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {agent.role}
                    </p>
                    {agent.status === "done" && (
                      <span className="ml-auto shrink-0 rounded-full border border-white/[0.09] bg-white/[0.03] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/75 tabular-nums">
                        {agent.cached ? "cached" : `${agent.durationMs}ms`}
                      </span>
                    )}
                  </div>
                  {agent.summary ? (
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground/85">
                      {agent.summary}
                    </p>
                  ) : (
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground/55">
                      Working…
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(running || complete || error) && (
        <div className="rounded-lg glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 bg-black/25">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Generation Progress
            </h3>
          </div>
          <ul className="px-6 py-4 space-y-2.5">
            {stages.map((stage) => {
              const state = states[stage];
              return (
                <li
                  key={stage}
                  className="flex items-center gap-3 text-[13px] text-foreground/85"
                >
                  <StageIcon state={state} />
                  <span
                    className={cn(
                      state === "done" && "text-success/90",
                      state === "running" && "text-warning/95",
                      state === "error" && "text-red-400/95",
                      state === "pending" && "text-muted-foreground/65",
                    )}
                  >
                    {STAGE_LABELS[stage]}
                    {state === "running" && "…"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/[0.04] overflow-hidden">
          <div className="flex">
            <div className="w-[3px] shrink-0 bg-gradient-to-b from-red-500/70 to-red-500/20" />
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-red-300">
                  Generation Stopped
                </p>
              </div>
              <p className="text-[13px] text-foreground/80 mb-3">{error}</p>
              {blockers.length > 0 && (
                <ul className="space-y-1.5">
                  {blockers.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[12.5px] text-foreground/80"
                    >
                      <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-red-400/70" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SOA_CHAIN_LENGTH = 5;

function parseEvent(
  raw: string,
): { name: string; data: Record<string, unknown> } | null {
  const lines = raw.split("\n").filter(Boolean);
  let name = "message";
  let data = "";
  for (const line of lines) {
    if (line.startsWith("event: ")) name = line.slice(7).trim();
    if (line.startsWith("data: ")) data += line.slice(6);
  }
  if (!data) return null;
  try {
    return { name, data: JSON.parse(data) as Record<string, unknown> };
  } catch {
    return null;
  }
}

function StageIcon({ state }: { state: StageState }) {
  if (state === "done")
    return <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />;
  if (state === "running")
    return (
      <Loader2 className="h-3.5 w-3.5 text-warning shrink-0 animate-spin" />
    );
  if (state === "error")
    return <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />;
  return <Circle className="h-3.5 w-3.5 text-muted-foreground/35 shrink-0" />;
}
