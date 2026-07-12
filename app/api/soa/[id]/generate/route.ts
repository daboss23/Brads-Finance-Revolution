import { NextRequest } from "next/server";
import {
  generateSoa,
  SoaGenerationError,
  STAGE_LABELS,
  getStageOrder,
  type GenerationStage,
} from "@/lib/soa/soa-generator";
import { buildClientAgentInput } from "@/lib/agents/client-input";
import { runAgent } from "@/lib/agents/run-agent";
import type { AgentId } from "@/lib/agents/types";
import { ensureFactFindsHydrated } from "@/lib/secure-store/fact-find-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOA_AGENT_CHAIN: AgentId[] = ["beacon", "guardian", "scribe", "orion", "atlas"];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await ensureFactFindsHydrated();

  // The Strategies tab stores Brad's approved strategies (built-in, catalogue
  // and custom) in the browser. The runner posts them here so generation uses
  // exactly what Brad approved, with names/descriptions for the custom ones.
  let approved: string[] | undefined;
  let customStrategies:
    | { id: string; name: string; description: string }[]
    | undefined;
  try {
    const body = await req.json();
    if (Array.isArray(body?.strategies) && body.strategies.length > 0) {
      approved = body.strategies.filter((s: unknown) => typeof s === "string");
    }
    if (Array.isArray(body?.customStrategies)) {
      customStrategies = body.customStrategies.filter(
        (c: unknown) =>
          c &&
          typeof c === "object" &&
          typeof (c as { id?: unknown }).id === "string",
      );
    }
  } catch {
    // No body / invalid JSON — fall back to the client profile or recommender.
  }
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        const stages = getStageOrder();
        for (const stage of stages) {
          emit("stage", {
            stage,
            label: STAGE_LABELS[stage],
            status: "starting",
          });
          // Stagger to feel like genuine progress without being slow.
          await new Promise((r) => setTimeout(r, 220));
        }

        for (const agentId of SOA_AGENT_CHAIN) {
          const input = buildClientAgentInput(params.id, agentId);
          await runAgent(agentId, input, {
            clientId: params.id,
            force: false,
          });
        }

        const doc = generateSoa(params.id, {
          recommendations: approved,
          customStrategies,
          onStage: (s: GenerationStage) => {
            emit("stage", {
              stage: s,
              label: STAGE_LABELS[s],
              status: "complete",
            });
          },
        });

        emit("complete", {
          clientId: doc.clientId,
          generatedAt: doc.generatedAt,
          complianceScore: doc.complianceScore,
          sectionCount: doc.sections.length,
          // Full document so the browser can persist exactly what was
          // generated (including catalogue/custom strategies) for the review
          // page to display — the review page itself can't read localStorage.
          doc,
        });
      } catch (err) {
        if (err instanceof SoaGenerationError) {
          emit("error", { message: err.message, blockers: err.blockers });
        } else {
          const msg = err instanceof Error ? err.message : String(err);
          emit("error", { message: msg, blockers: [] });
        }
      } finally {
        controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
