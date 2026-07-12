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

  const html = buildFactFindHtml({ clientName: client.name, data });
  const pdf = await renderPdf({
    html,
    footerLeft: `Financial Fact Find — ${client.name} · Newcastle Financial Services`,
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="fact-find-${client.id}.pdf"`,
    },
  });
}
