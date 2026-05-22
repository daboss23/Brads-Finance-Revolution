import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont, PDFImage } from "pdf-lib";
import { CLIENTS } from "@/lib/data";
import { FACT_FIND_SECTIONS, type FactFindSection } from "@/lib/fact-find-flow";
import { getClientAnswers } from "@/lib/fact-find-answers";
import { getLogoPng } from "@/lib/export-logo";

// ── Layout constants ──────────────────────────────────────────────────────────
const PW = 595, PH = 842;          // A4 points
const ML = 52, MR = 52;            // left / right margins
const CW = PW - ML - MR;           // content width  491pt
const HEADER_H = 116;              // first-page header band
const STRIP_H  = 32;               // subsequent-page top strip
const FOOTER_H = 36;               // footer reserved height
const COL2_X   = ML + CW / 2 + 8; // right column x
const COL_W    = CW / 2 - 8;      // each column width

// ── Colours ───────────────────────────────────────────────────────────────────
const C_NAVY  = rgb(0.055, 0.082, 0.141);
const C_GOLD  = rgb(0.800, 0.660, 0.290);
const C_WHITE = rgb(1, 1, 1);
const C_TEXT  = rgb(0.10,  0.12,  0.16);
const C_MUTED = rgb(0.42,  0.45,  0.52);
const C_LIGHT = rgb(0.88,  0.90,  0.93);  // hairlines / rules
const C_GREEN = rgb(0.08,  0.60,  0.35);
const C_AMBER = rgb(0.84,  0.58,  0.10);
const C_AMBER_BG = rgb(0.99, 0.96, 0.88);
const C_GREEN_BG = rgb(0.90, 0.98, 0.93);
const C_AMBER_BD = rgb(0.90, 0.72, 0.25);
const C_SECTION_BG = rgb(0.96, 0.97, 0.98);

// ── Section status map ────────────────────────────────────────────────────────
const SECTION_MAP: Record<string, string> = {
  "personal-details":    "Personal Details",
  "contact-information": "Personal Details",
  "family-dependants":   "Personal Details",
  "employment-income":   "Income & Employment",
  "assets":              "Assets & Liabilities",
  "liabilities":         "Assets & Liabilities",
  "expenses":            "Expenses",
  "superannuation":      "Superannuation",
  "insurance":           "Insurance",
  "goals-objectives":    "Goals & Objectives",
};

// ── Text wrapping ─────────────────────────────────────────────────────────────
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

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const clientMaybe = CLIENTS.find((c) => c.id === params.id);
  if (!clientMaybe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const client = clientMaybe;

  const answers   = getClientAnswers(client.id);
  const today     = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  // ── Build PDF ───────────────────────────────────────────────────────────────
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Fact Find — ${client.name}`);
  pdfDoc.setCreator("BMK Financial Services");

  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic  = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Embed logo PNG
  let logoImg: PDFImage | null = null;
  try {
    const logoPng = await getLogoPng(180);
    logoImg = await pdfDoc.embedPng(logoPng);
  } catch { /* skip logo if rasterisation fails */ }

  const allPages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;

  // ── Page management ─────────────────────────────────────────────────────────
  function newPage(isFirst = false) {
    page = pdfDoc.addPage([PW, PH]);
    allPages.push(page);

    if (isFirst) {
      // Full navy header band
      page.drawRectangle({ x: 0, y: PH - HEADER_H, width: PW, height: HEADER_H, color: C_NAVY });
      // Gold bottom accent line on header
      page.drawRectangle({ x: 0, y: PH - HEADER_H, width: PW, height: 2, color: C_GOLD });

      // Logo
      if (logoImg) {
        const logoSz = 72;
        page.drawImage(logoImg, { x: ML, y: PH - HEADER_H + (HEADER_H - logoSz) / 2, width: logoSz, height: logoSz });
      }

      // Brand text
      const bx = ML + (logoImg ? 84 : 0);
      page.drawText("Newcastle", {
        x: bx, y: PH - 48, font: regular, size: 15,
        color: C_WHITE,
      });
      page.drawText("Financial Services", {
        x: bx, y: PH - 66, font: bold, size: 8.5,
        color: C_GOLD,
      });
      page.drawRectangle({ x: bx, y: PH - 72, width: 130, height: 0.75, color: rgb(1,1,1,) });
      page.drawText("Plan · Grow · Prosper", {
        x: bx, y: PH - 83, font: regular, size: 7.5,
        color: rgb(0.65, 0.68, 0.75),
      });

      // Right side — document meta
      const rx = PW - MR;
      const rtAlign = (text: string, f: PDFFont, sz: number) => rx - f.widthOfTextAtSize(text, sz);
      page.drawText("FACT FIND REPORT", {
        x: rtAlign("FACT FIND REPORT", bold, 8.5), y: PH - 44,
        font: bold, size: 8.5, color: C_GOLD,
      });
      page.drawText(today, {
        x: rtAlign(today, regular, 9), y: PH - 59,
        font: regular, size: 9, color: C_WHITE,
      });
      page.drawText(client.adviser, {
        x: rtAlign(client.adviser, regular, 9), y: PH - 73,
        font: regular, size: 9, color: rgb(0.75, 0.78, 0.84),
      });

      y = PH - HEADER_H - 28;

      // Client name + progress block
      page.drawText(client.name, { x: ML, y, font: bold, size: 20, color: C_TEXT });
      y -= 18;
      page.drawText("Fact Find Report", { x: ML, y, font: regular, size: 10, color: C_MUTED });
      y -= 24;

      // Progress bar
      const barW = CW;
      const barH = 8;
      page.drawRectangle({ x: ML, y, width: barW, height: barH, color: C_LIGHT });
      page.drawRectangle({ x: ML, y, width: barW * (client.progress / 100), height: barH, color: C_GOLD });
      y -= 16;
      page.drawText(`${client.progress}% Complete`, { x: ML, y, font: bold, size: 9, color: C_AMBER });
      const advText = `Adviser: ${client.adviser}   ·   Generated: ${today}`;
      page.drawText(advText, {
        x: PW - MR - regular.widthOfTextAtSize(advText, 9), y,
        font: regular, size: 9, color: C_MUTED,
      });
      y -= 24;

      // Divider
      page.drawRectangle({ x: ML, y, width: CW, height: 1, color: C_LIGHT });
      y -= 20;

    } else {
      // Subsequent-page strip
      page.drawRectangle({ x: 0, y: PH - STRIP_H, width: PW, height: STRIP_H, color: C_NAVY });
      page.drawText("Newcastle Financial Services", {
        x: ML, y: PH - STRIP_H + 10,
        font: bold, size: 8, color: C_GOLD,
      });
      const cont = `${client.name}  ·  Fact Find Report  ·  ${today}`;
      page.drawText(cont, {
        x: PW - MR - regular.widthOfTextAtSize(cont, 8), y: PH - STRIP_H + 10,
        font: regular, size: 8, color: rgb(0.70, 0.73, 0.78),
      });
      y = PH - STRIP_H - 24;
    }
  }

  function ensureSpace(h: number) {
    if (y - h < FOOTER_H + 12) newPage(false);
  }

  // ── Text helper ──────────────────────────────────────────────────────────────
  function drawText(
    text: string,
    opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; x?: number; maxW?: number; after?: number } = {}
  ) {
    const { font = regular, size = 10, color = C_TEXT, x = ML, maxW = CW, after = 5 } = opts;
    const lines = wrap(text, font, size, maxW);
    ensureSpace(lines.length * (size + 3) + after);
    for (const line of lines) {
      page.drawText(line, { x, y: y - size, font, size, color });
      y -= size + 3;
    }
    y -= after;
  }

  // ── Section header ────────────────────────────────────────────────────────────
  function drawSectionHeader(section: FactFindSection, status: string) {
    ensureSpace(44);
    y -= 10;

    // Background strip
    page.drawRectangle({ x: ML - 8, y: y - 22, width: CW + 16, height: 28, color: C_SECTION_BG });
    // Left gold accent
    page.drawRectangle({ x: ML - 8, y: y - 22, width: 3, height: 28, color: C_GOLD });

    // Title
    page.drawText(section.title.toUpperCase(), {
      x: ML, y: y - 15,
      font: bold, size: 9, color: C_TEXT,
    });

    // Status badge
    const statusText   = status === "complete" ? "Complete" : status === "in-progress" ? "In Progress" : "Not Completed";
    const statusColor  = status === "complete" ? C_GREEN : status === "in-progress" ? C_AMBER : rgb(0.78, 0.22, 0.22);
    const badgeW       = bold.widthOfTextAtSize(statusText, 8) + 14;
    const badgeBg      = status === "complete" ? C_GREEN_BG : C_AMBER_BG;
    const badgeX       = PW - MR - badgeW;
    page.drawRectangle({ x: badgeX - 1, y: y - 20, width: badgeW, height: 14, color: badgeBg });
    page.drawText(statusText, { x: badgeX + 6, y: y - 15, font: bold, size: 8, color: statusColor });

    y -= 34;
  }

  // ── Two-column field pair ─────────────────────────────────────────────────────
  function drawFieldPair(
    label1: string, value1: string | undefined,
    label2?: string, value2?: string
  ) {
    const isMissing1 = !value1 || value1 === "—";
    const isMissing2 = label2 && (!value2 || value2 === "—");
    const lineH = 28;
    ensureSpace(lineH + 4);

    // Label 1
    page.drawText(label1, { x: ML, y: y - 9, font: regular, size: 8, color: C_MUTED });
    // Value 1
    if (isMissing1) {
      page.drawRectangle({ x: ML, y: y - 22, width: 52, height: 13, color: C_AMBER_BG });
      page.drawRectangle({ x: ML, y: y - 22, width: 1.5, height: 13, color: C_AMBER_BD });
      page.drawText("Missing", { x: ML + 5, y: y - 17, font: bold, size: 8, color: C_AMBER });
    } else {
      const vLines = wrap(value1!, regular, 9.5, COL_W);
      page.drawText(vLines[0], { x: ML, y: y - 19, font: bold, size: 9.5, color: C_TEXT });
      if (vLines.length > 1) {
        page.drawText(vLines[1], { x: ML, y: y - 30, font: bold, size: 9.5, color: C_TEXT });
      }
    }

    // Label 2 + value 2
    if (label2 !== undefined) {
      page.drawText(label2, { x: COL2_X, y: y - 9, font: regular, size: 8, color: C_MUTED });
      if (isMissing2) {
        page.drawRectangle({ x: COL2_X, y: y - 22, width: 52, height: 13, color: C_AMBER_BG });
        page.drawRectangle({ x: COL2_X, y: y - 22, width: 1.5, height: 13, color: C_AMBER_BD });
        page.drawText("Missing", { x: COL2_X + 5, y: y - 17, font: bold, size: 8, color: C_AMBER });
      } else if (value2) {
        const v2Lines = wrap(value2, regular, 9.5, COL_W);
        page.drawText(v2Lines[0], { x: COL2_X, y: y - 19, font: bold, size: 9.5, color: C_TEXT });
      }
    }

    y -= lineH + 4;
  }

  // ── Footer applied to every page after content ────────────────────────────────
  function applyFooters() {
    for (let i = 0; i < allPages.length; i++) {
      const p = allPages[i];
      p.drawRectangle({ x: ML - 8, y: 28, width: CW + 16, height: 0.75, color: C_LIGHT });
      const left = "BMK Financial Services  ·  Brad Lonergan  ·  Newcastle NSW";
      p.drawText(left, { x: ML, y: 16, font: regular, size: 7.5, color: C_MUTED });
      const pageNum = `Page ${i + 1} of ${allPages.length}`;
      p.drawText(pageNum, {
        x: PW - MR - regular.widthOfTextAtSize(pageNum, 7.5),
        y: 16, font: regular, size: 7.5, color: C_MUTED,
      });
    }
  }

  // ── Build document ────────────────────────────────────────────────────────────
  newPage(true);

  for (const section of FACT_FIND_SECTIONS) {
    const clientSectionName = SECTION_MAP[section.id];
    const clientSection = client.factFindSections.find((s) => s.name === clientSectionName);
    const status = clientSection?.status ?? "missing";
    const sectionAnswers = answers[section.id] ?? {};

    drawSectionHeader(section, status);

    if (status === "missing") {
      ensureSpace(40);
      // Amber warning block
      page.drawRectangle({ x: ML, y: y - 32, width: CW, height: 36, color: C_AMBER_BG });
      page.drawRectangle({ x: ML, y: y - 32, width: 3, height: 36, color: C_AMBER_BD });
      page.drawText("Section not completed — follow-up required before this file can progress.", {
        x: ML + 10, y: y - 14, font: bold, size: 9, color: rgb(0.65, 0.40, 0.05),
      });
      const req = section.fields.filter((f) => f.required).map((f) => f.label).join(", ");
      if (req) {
        page.drawText(`Outstanding: ${req}`, {
          x: ML + 10, y: y - 26, font: italic, size: 8, color: C_MUTED,
        });
      }
      y -= 48;
    } else {
      // Render fields in two-column pairs
      const fields = section.fields;
      for (let i = 0; i < fields.length; i += 2) {
        const f1 = fields[i];
        const f2 = fields[i + 1];
        const v1 = sectionAnswers[f1.id];
        const v2 = f2 ? sectionAnswers[f2.id] : undefined;
        drawFieldPair(f1.label, v1, f2?.label, v2);
      }
    }

    // Gap between sections
    ensureSpace(8);
    y -= 8;
  }

  applyFooters();

  const pdfBytes = await pdfDoc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fact-find-${client.id}.pdf"`,
    },
  });
}
