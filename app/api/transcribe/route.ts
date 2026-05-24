export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text";
const SCRIBE_MODEL_ID = "scribe_v1";

export async function POST(req: Request) {
  const reqId = Math.random().toString(36).slice(2, 8);
  const log = (...a: unknown[]) => console.log(`[transcribe:${reqId}]`, ...a);
  const err = (...a: unknown[]) => console.error(`[transcribe:${reqId}]`, ...a);

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    log("ELEVENLABS_API_KEY present:", Boolean(apiKey), "len:", apiKey?.length ?? 0);
    if (!apiKey) {
      err("Missing ELEVENLABS_API_KEY");
      return Response.json(
        { error: "Server misconfigured: ELEVENLABS_API_KEY not set." },
        { status: 500 }
      );
    }

    const incoming = await req.formData().catch((e) => {
      err("Failed to parse multipart form:", e);
      return null;
    });
    if (!incoming) {
      return Response.json({ error: "Invalid form data." }, { status: 400 });
    }

    const audio = incoming.get("audio");
    if (!(audio instanceof Blob)) {
      err("No audio blob in form");
      return Response.json({ error: "No audio uploaded." }, { status: 400 });
    }
    log("audio size:", audio.size, "type:", audio.type);
    if (audio.size === 0) {
      return Response.json({ error: "Empty audio." }, { status: 400 });
    }

    const out = new FormData();
    out.append("model_id", SCRIBE_MODEL_ID);
    const filename =
      audio.type.includes("webm")
        ? "audio.webm"
        : audio.type.includes("mp4")
          ? "audio.mp4"
          : audio.type.includes("ogg")
            ? "audio.ogg"
            : audio.type.includes("wav")
              ? "audio.wav"
              : "audio.bin";
    out.append("file", audio, filename);

    log("Calling ElevenLabs Scribe…", { model: SCRIBE_MODEL_ID, filename });
    const res = await fetch(ELEVENLABS_STT_URL, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: out,
    });

    const bodyText = await res.text();
    log("ElevenLabs status:", res.status);

    if (!res.ok) {
      err("ElevenLabs error body:", bodyText);
      return Response.json(
        { error: `Transcription failed (${res.status})`, detail: bodyText.slice(0, 500) },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(bodyText);
    } catch (e) {
      err("Failed to parse ElevenLabs JSON:", e, "raw:", bodyText.slice(0, 300));
      return Response.json(
        { error: "Bad response from transcription provider." },
        { status: 502 }
      );
    }

    const p = parsed as { text?: string; transcript?: string };
    const text = (p.text ?? p.transcript ?? "").trim();
    log("transcription length:", text.length);
    return Response.json({ text });
  } catch (e: unknown) {
    const anyErr = e as { message?: string; stack?: string };
    err("Fatal error:", anyErr?.message, anyErr?.stack);
    return Response.json(
      { error: `Fatal: ${anyErr?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}
