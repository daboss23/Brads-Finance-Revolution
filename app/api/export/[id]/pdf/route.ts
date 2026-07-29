import { NextRequest, NextResponse } from "next/server";
import { findClient } from "@/lib/data/client-repository";
import { getFactFindOrDemo } from "@/lib/sarah-fact-find-store";
import { ensureFactFindsHydrated } from "@/lib/secure-store/fact-find-persistence";
import { buildFactFindHtml } from "@/lib/pdf/fact-find-template";
import { renderPdf } from "@/lib/pdf/render-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  await ensureFactFindsHydrated();
  const client = await findClient(params.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = getFactFindOrDemo(client.id);
  if (!data) return NextResponse.json({ error: "No fact find available" }, { status: 404 });

  const { cover, body } = buildFactFindHtml({ clientName: client.name, data });
  const pdf = await renderPdf({
    coverHtml: cover,
    html: body,
    headerLeft: "Financial Fact Find",
    headerRight: client.name,
    footerLeft: `Financial Fact Find — ${client.name} · Newcastle Financial Services`,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="fact-find-${client.id}.pdf"`,
    },
  });
}
