import { NextResponse } from "next/server";
import { buildClientAgentInput } from "@/lib/agents/client-input";
import { runAgent } from "@/lib/agents/run-agent";
import type { AgentId } from "@/lib/agents/types";

const RUNNABLE_AGENTS: AgentId[] = [
  "beacon",
  "guardian",
  "scribe",
  "orion",
  "atlas",
  "cipher",
  "nexus",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      agentId?: AgentId;
      clientId?: string;
      force?: boolean;
    };

    if (!body.agentId || !RUNNABLE_AGENTS.includes(body.agentId)) {
      return NextResponse.json(
        { error: "Unsupported or missing agent id" },
        { status: 400 },
      );
    }

    const input = body.clientId
      ? buildClientAgentInput(body.clientId, body.agentId)
      : { generatedAt: new Date().toISOString().slice(0, 10) };

    const result = await runAgent(body.agentId, input, {
      clientId: body.clientId,
      force: body.force,
    });

    return NextResponse.json({
      ok: !result.error,
      agentId: result.agentId,
      output: result.output,
      cached: result.cached,
      telemetry: result.telemetry,
      error: result.error,
    });
  } catch {
    return NextResponse.json(
      { error: "Agent run failed safely" },
      { status: 500 },
    );
  }
}
