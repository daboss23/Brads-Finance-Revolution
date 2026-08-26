import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agents/run-agent";
import { describeAgentOutput } from "@/lib/agents/output-summary";
import type { AgentOutput } from "@/lib/agents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Daily Cipher brief — Vercel Cron hits this endpoint once a day so the
// follow-up agent scans for stalled clients even when nobody has opened
// the platform. Protect with CRON_SECRET (Vercel sends it as a bearer
// token); without a secret the route only responds in development.
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "CRON_SECRET is not configured on this deployment." },
      { status: 503 },
    );
  }

  const input = { generatedAt: new Date().toISOString().slice(0, 10) };
  const result = await runAgent("cipher", input, { force: true });
  const output = result.output as AgentOutput & {
    todaysBrief?: string;
    followUps?: unknown[];
  };

  return Response.json({
    ok: !result.error,
    summary: describeAgentOutput("cipher", result.output),
    todaysBrief: output.todaysBrief ?? null,
    followUpCount: Array.isArray(output.followUps) ? output.followUps.length : 0,
    telemetry: result.telemetry,
    error: result.error,
  });
}