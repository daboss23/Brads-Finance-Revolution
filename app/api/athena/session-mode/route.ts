import { convAiConfigured } from "@/lib/athena/convai";
import { anthropicConfigured } from "@/lib/ai/anthropic-credentials";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type AthenaSessionMode = "voice" | "text" | "unavailable";

// Tells the onboarding page which Athena the client is about to meet.
//
// Voice is the live ElevenLabs agent and is preferred: it runs its own LLM,
// so it keeps working when the Anthropic balance is empty. Text is the
// Anthropic fallback. The browser asks while the client is still reading the
// intro screen, so choosing costs no visible time.
//
// This reports configuration, not liveness. Proving the session works means
// minting a signed URL, which is rate limited and expires in seconds, so the
// real attempt happens when the client presses begin and falls back to text
// if it fails. /api/health/athena is the adviser-facing check that does test
// the connection end to end.
export async function GET(req: Request) {
  const rl = rateLimit("athena-session-mode", clientIp(req), 20, 60);
  if (!rl.allowed) return rateLimited(rl);

  const voice = convAiConfigured();
  const text = anthropicConfigured();
  const mode: AthenaSessionMode = voice ? "voice" : text ? "text" : "unavailable";

  return Response.json({ mode, voiceAvailable: voice, textAvailable: text });
}
