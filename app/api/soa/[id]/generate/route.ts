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
import type { SoaDocument } from "@/lib/soa/soa-template";
import { ensureFactFindsHydrated } from "@/lib/secure-store/fact-find-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Which agent does the real work behind each progress stage. Stages without
// an agent are either instant bookkeeping or the assembly step itself.
const STAGE_AGENTS: Partial<Record<GenerationStage, AgentId>> = {
  "loading-client": "beacon",
  "compliance-gate": "guardian",
  "generating-summary": "scribe",
  "generating-recommendations": "orion",
  "generating-projections": "atlas",
};

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
        // Each stage opens, does its real work, then closes, so the progress
        // panel advances one step at a time instead of lighting every stage
        // at once while the agent chain runs silently behind it.
        let doc: SoaDocument | undefined;
        for (const stage of getStageOrder()) {
          emit("stage", {
            stage,
            label: STAGE_LABELS[stage],
            status: "starting",
          });

          const agentId = STAGE_AGENTS[stage];
          if (agentId) {
            await runAgent(agentId, buildClientAgentInput(params.id, agentId), {
              clientId: params.id,
              force: false,
            });
          } else if (stage === "assembling") {
            doc = generateSoa(params.id, {
              recommendations: approved,
              customStrategies,
            });
          } else {
            // Bookkeeping stages are instant; hold briefly so the step reads.
            await new Promise((r) => setTimeout(r, 200));
          }

          emit("stage", {
            stage,
            label: STAGE_LABELS[stage],
            status: "complete",
          });
        }

        if (!doc) throw new Error("SOA assembly did not produce a document.");

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
