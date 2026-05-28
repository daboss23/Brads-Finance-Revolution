import { NextRequest } from "next/server";
import {
  generateSoa,
  SoaGenerationError,
  STAGE_LABELS,
  getStageOrder,
  type GenerationStage,
} from "@/lib/soa/soa-generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
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

        const doc = generateSoa(params.id, {
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
