import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Mic,
} from "lucide-react";
import Link from "next/link";
import { listRuntimeBlueprints } from "@/lib/agent-system";
import { ACTIVE_WORKFLOW_AGENTS, AGENTS } from "@/lib/agents";
import { AgentCard } from "@/components/agents/AgentCard";
import { getAgentTelemetry } from "@/lib/agents/events";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Agents - BMK Command Centre",
};

export default function AgentsPage() {
  const telemetry = getAgentTelemetry();
  const runtimeBlueprints = listRuntimeBlueprints();
  const latestByAgent = new Map(telemetry.map((event) => [event.agentId, event]));
  const autoRunnable = runtimeBlueprints.filter((agent) => agent.autoRunModes.length > 0).length;
  const agentFlow = AGENTS.map((agent) => agent.name);

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 xl:px-14 xl:py-12">
      <header className="mb-10 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <p className="cmd-label mb-4 text-muted-foreground/60">Command Layer</p>
          <h1 className="text-[34px] font-semibold leading-[1.05] text-foreground sm:text-[46px]">
            BMK Agent Command Centre
          </h1>
          <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-muted-foreground/80">
            The current agent language is now consistent across the platform. Sarah
            handles discovery, then Beacon, Guardian, Scribe, Orion, Atlas, Cipher
            and Nexus move the file through structuring, compliance, meeting prep,
            evidence, SOA drafting, follow-up and integrations.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-5">
          <p className="cmd-label text-gold/85">System intelligence</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Summary label="Agents in registry" value={AGENTS.length} />
            <Summary label="Workflow agents" value={ACTIVE_WORKFLOW_AGENTS.length} />
            <Summary label="Runtime modules" value={runtimeBlueprints.length} />
            <Summary label="Auto-runnable" value={autoRunnable} />
          </div>
        </div>
      </header>

      <section className="mb-10 rounded-xl border border-border/70 bg-card px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="cmd-label text-gold/85">Unified flow</p>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground/75">
              One source of truth now maps the client journey from discovery to SOA.
            </p>
          </div>
          <Link
            href="/soa"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground/70 transition hover:text-gold"
          >
            Open SOA pipeline <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[12.5px]">
          {agentFlow.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-border/70 bg-white/[0.03] px-3 py-1.5 font-medium text-foreground/80">
                {step}
              </span>
              {index < agentFlow.length - 1 && (
                <span className="text-muted-foreground/40">-&gt;</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="space-y-3">
            <AgentCard agent={agent} featured={agent.id === "atlas"} />
            <div className="rounded-xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4 text-gold" />
                <p className="cmd-label text-gold/85">Execution profile</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-white/[0.025] px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-foreground">Trigger</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground/68">
                      {agent.trigger}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase",
                      latestByAgent.get(agent.id)?.status === "success"
                        ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                        : "border-border/70 bg-white/[0.03] text-muted-foreground",
                    )}
                  >
                    {latestByAgent.get(agent.id)?.status ?? "idle"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-white/[0.025] px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-foreground">
                      Execution mode
                    </p>
                    <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground/68">
                      {agent.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-border/70 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                    {agent.id === "sarah"
                      ? "Session"
                      : agent.id === "nexus" || agent.id === "cipher"
                        ? "Deterministic"
                        : "AI"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-xl border border-border/70 bg-card p-6">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-gold" />
          <p className="cmd-label text-gold/85">Platform support modules</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SupportModuleCard
            name="Sarah"
            role="Client discovery intake"
            detail="Collects the fact find and feeds the rest of the system."
          />
          <SupportModuleCard
            name="Nexus"
            role="Integration health"
            detail="Tracks environment readiness for Vercel, providers and future integrations."
          />
          <SupportModuleCard
            name="Telemetry"
            role="Run history"
            detail="Captures cache, model and runtime history across the underlying modules."
          />
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-white/[0.03] p-3">
      <p className="text-[22px] font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-2 cmd-label text-muted-foreground/55">{label}</p>
    </div>
  );
}

function SupportModuleCard({
  name,
  role,
  detail,
}: {
  name: string;
  role: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
        <p className="text-[12.5px] font-semibold text-foreground">{name}</p>
      </div>
      <p className="mt-2 text-[11.5px] font-medium text-gold/85">{role}</p>
      <p className="mt-2 text-[11.5px] leading-5 text-muted-foreground/68">{detail}</p>
    </div>
  );
}
