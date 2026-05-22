export async function POST(req: Request) {
  try {
    const { clientId, clientName, token, factFindData } = await req.json();

    // Log the completion for server-side audit trail
    console.log("[Fact Find Complete]", {
      clientId,
      clientName,
      token,
      completedAt: new Date().toISOString(),
    });

    // In production: send Brad a notification (email/SMS/push)
    // For now this endpoint exists so the client can fire-and-forget
    // and we have a hook point for future integrations

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
