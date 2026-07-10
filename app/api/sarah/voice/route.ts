import { requireOnboardingTokenHeader } from "@/lib/security/onboarding-access";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ELEVEN_TTS_URL = (voiceId: string) =>
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
const MODEL_ID = "eleven_turbo_v2_5";

export async function POST(req: Request) {
  const denied = requireOnboardingTokenHeader(req);
  if (denied) return denied;

  const reqId = Math.random().toString(36).slice(2, 8);
  const log = (...a: unknown[]) => console.log(`[sarah-voice:${reqId}]`, ...a);
  const err = (...a: unknown[]) => console.error(`[sarah-voice:${reqId}]`, ...a);

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    log("env", {
      apiKey: Boolean(apiKey),
      apiKeyLen: apiKey?.length ?? 0,
      voiceId: voiceId ? `${voiceId.slice(0, 4)}…${voiceId.slice(-4)}` : null,
    });

    if (!apiKey) {
      err("Missing ELEVENLABS_API_KEY");
      return Response.json(
        { error: "Server misconfigured: ELEVENLABS_API_KEY not set." },
        { status: 500 }
      );
    }
    if (!voiceId) {
      err("Missing ELEVENLABS_VOICE_ID");
      return Response.json(
        { error: "Server misconfigured: ELEVENLABS_VOICE_ID not set." },
        { status: 500 }
      );
    }

    const body = await req.json().catch((e) => {
      err("Bad JSON:", e);
      return null;
    });
    if (!body || typeof (body as { text?: unknown }).text !== "string") {
      return Response.json({ error: "Missing text." }, { status: 400 });
    }
    const text = (body as { text: string }).text.trim();
    if (!text) {
      return Response.json({ error: "Empty text." }, { status: 400 });
    }
    log("text length:", text.length);

    const upstream = await fetch(ELEVEN_TTS_URL(voiceId), {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    });

    log("ElevenLabs status:", upstream.status, "content-type:", upstream.headers.get("content-type"));

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      err("ElevenLabs error body:", errText.slice(0, 800));
      return Response.json(
        {
          error: `TTS failed (${upstream.status})`,
          detail: errText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    const audio = await upstream.arrayBuffer();
    log("audio bytes:", audio.byteLength);

    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "Content-Length": String(audio.byteLength),
      },
    });
  } catch (e: unknown) {
    const anyErr = e as { message?: string; stack?: string };
    err("Fatal error:", anyErr?.message, anyErr?.stack);
    return Response.json(
      { error: `Fatal: ${anyErr?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}
