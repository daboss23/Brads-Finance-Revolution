import { ElevenLabsClient } from "elevenlabs";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return new Response("No text", { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voiceId) {
      return new Response("Voice not configured", { status: 503 });
    }

    const eleven = new ElevenLabsClient({ apiKey });

    const audioStream = await eleven.textToSpeech.convert(voiceId, {
      model_id: "eleven_flash_v2_5",
      text: String(text).slice(0, 4000),
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.78,
        style: 0.2,
        use_speaker_boost: true,
      },
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of audioStream) {
          controller.enqueue(chunk instanceof Buffer ? new Uint8Array(chunk) : chunk);
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[Sarah voice]", err);
    return new Response("Voice generation failed", { status: 500 });
  }
}
