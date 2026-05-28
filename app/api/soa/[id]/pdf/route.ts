import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { CLIENTS } from "@/lib/data";
import { generateSoa } from "@/lib/soa/soa-generator";
import { getLogoPng } from "@/lib/export-logo";

const PW = 595;
const PH = 842;
const ML = 52;
const MR = 52;
const CW = PW - ML - MR;

const C_NAVY = rgb(0.055, 0.082, 0.141);
const C_GOLD = rgb(0.8, 0.66, 0.29);
const C_WHITE = rgb(1, 1, 1);
const C_TEXT = rgb(0.1, 0.12, 0.16);
const C_MUTED = rgb(0.42, 0.45, 0.52);
const C_LIGHT = rgb(0.88, 0.9, 0.93);

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = generateSoa(client.id);
  const today = new Date(doc.generatedAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Statement of Advice — ${client.name}`);
  pdf.setCreator("Newcastle Financial Services");

  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await getLogoPng(140);
  const logo = await pdf.embedPng(logoBytes);

  // Cover page
  let page = pdf.addPage([PW, PH]);
  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: C_NAVY });
  page.drawRectangle({
    x: 0,
    y: PH - 5,
    width: PW,
    height: 5,
    color: C_GOLD,
  });
  page.drawImage(logo, {
    x: (PW - 140) / 2,
    y: PH - 320,
    width: 140,
    height: 140,
  });
  const titleW = fontBold.widthOfTextAtSize("Statement of Advice", 32);
  page.drawText("Statement of Advice", {
    x: (PW - titleW) / 2,
    y: PH - 380,
    size: 32,
    font: fontBold,
    color: C_WHITE,
  });
  const subW = fontReg.widthOfTextAtSize(`Prepared for ${client.name}`, 14);
  page.drawText(`Prepared for ${client.name}`, {
    x: (PW - subW) / 2,
    y: PH - 420,
    size: 14,
    font: fontReg,
    color: C_WHITE,
  });
  const dateW = fontReg.widthOfTextAtSize(today, 11);
  page.drawText(today, {
    x: (PW - dateW) / 2,
    y: PH - 442,
    size: 11,
    font: fontReg,
    color: rgb(0.78, 0.82, 0.88),
  });

  page.drawText("Brad Lonergan", {
    x: ML,
    y: 110,
    size: 11,
    font: fontBold,
    color: C_WHITE,
  });
  page.drawText("Authorised Representative", {
    x: ML,
    y: 96,
    size: 9,
    font: fontReg,
    color: rgb(0.78, 0.82, 0.88),
  });
  page.drawText("Charter Financial Planning Limited AFSL 234665", {
    x: ML,
    y: 82,
    size: 9,
    font: fontReg,
    color: rgb(0.78, 0.82, 0.88),
  });
  page.drawText("Newcastle Financial Services", {
    x: PW - MR - fontReg.widthOfTextAtSize("Newcastle Financial Services", 10),
    y: 96,
    size: 10,
    font: fontBold,
    color: C_GOLD,
  });
  page.drawText("Confidential — for client use only", {
    x:
      PW -
      MR -
      fontReg.widthOfTextAtSize("Confidential — for client use only", 9),
    y: 82,
    size: 9,
    font: fontReg,
    color: rgb(0.78, 0.82, 0.88),
  });

  // Section pages
  page = pdf.addPage([PW, PH]);
  let y = PH - 70;

  const ensure = (needed: number) => {
    if (y - needed < 80) {
      page = pdf.addPage([PW, PH]);
      y = PH - 60;
    }
  };

  for (const section of doc.sections) {
    if (section.id === "cover") continue;
    ensure(50);
    page.drawRectangle({
      x: ML - 6,
      y: y - 4,
      width: 28,
      height: 24,
      color: C_GOLD,
    });
    page.drawText(String(section.number), {
      x: ML,
      y: y + 4,
      size: 12,
      font: fontBold,
      color: C_NAVY,
    });
    page.drawText(section.title, {
      x: ML + 38,
      y: y + 4,
      size: 14,
      font: fontBold,
      color: C_TEXT,
    });
    y -= 32;

    const paragraphs = section.body.split(/\n+/).filter((p) => p.trim());
    for (const p of paragraphs) {
      const lines = wrap(p, fontReg, 10, CW);
      for (const line of lines) {
        ensure(16);
        page.drawText(line, {
          x: ML,
          y,
          size: 10,
          font: fontReg,
          color: C_TEXT,
        });
        y -= 14;
      }
      y -= 6;
    }
    y -= 10;
    ensure(20);
    page.drawLine({
      start: { x: ML, y },
      end: { x: PW - MR, y },
      thickness: 0.4,
      color: C_LIGHT,
    });
    y -= 18;
  }

  // Footer on every page
  const totalPages = pdf.getPageCount();
  for (let i = 1; i < totalPages; i++) {
    const p = pdf.getPage(i);
    p.drawLine({
      start: { x: ML, y: 44 },
      end: { x: PW - MR, y: 44 },
      thickness: 0.4,
      color: C_LIGHT,
    });
    p.drawText(`Statement of Advice · ${client.name}`, {
      x: ML,
      y: 30,
      size: 8,
      font: fontReg,
      color: C_MUTED,
    });
    p.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: PW - MR - 60,
      y: 30,
      size: 8,
      font: fontReg,
      color: C_MUTED,
    });
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${client.name.replace(/\s+/g, "-")}-soa.pdf"`,
    },
  });
}
