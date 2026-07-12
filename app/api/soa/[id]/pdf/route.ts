import { NextRequest, NextResponse } from "next/server";
import { findClient } from "@/lib/data/client-repository";
import { generateSoa } from "@/lib/soa/soa-generator";
import { ensureFactFindsHydrated } from "@/lib/secure-store/fact-find-persistence";
import { buildSoaHtml } from "@/lib/pdf/soa-template";
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

  const doc = generateSoa(client.id);
  const html = buildSoaHtml(doc);
  const pdf = await renderPdf({
    html,
    footerLeft: `Statement of Advice — ${client.name} · Newcastle Financial Services`,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="soa-${client.id}.pdf"`,
    },
  });
}
