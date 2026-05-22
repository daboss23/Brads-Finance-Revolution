import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import { CLIENTS } from "@/lib/data";
import { FACT_FIND_SECTIONS } from "@/lib/fact-find-flow";
import { getClientAnswers } from "@/lib/fact-find-answers";

const SECTION_MAP: Record<string, string> = {
  "personal-details": "Personal Details",
  "contact-information": "Personal Details",
  "family-dependants": "Personal Details",
  "employment-income": "Income & Employment",
  "assets": "Assets & Liabilities",
  "liabilities": "Assets & Liabilities",
  "expenses": "Expenses",
  "superannuation": "Superannuation",
  "insurance": "Insurance",
  "goals-objectives": "Goals & Objectives",
};

// A4 dimensions in points
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Brand colours
const C_NAVY = rgb(0.06, 0.09, 0.16);
const C_GOLD = rgb(0.80, 0.66, 0.29);
const C_WHITE = rgb(1, 1, 1);
const C_TEXT = rgb(0.12, 0.14, 0.18);
const C_MUTED = rgb(0.45, 0.48, 0.54);
const C_GREEN = rgb(0.09, 0.64, 0.38);
const C_AMBER = rgb(0.85, 0.60, 0.12);
const C_RED = rgb(0.82, 0.18, 0.18);

function wrapText(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function addPage(doc: PDFDocument): [PDFPage, number] {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  return [page, PAGE_H - MARGIN - 20];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const answers = getClientAnswers(client.id);
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let [page, y] = addPage(pdfDoc);

  function needsNewPage(height: number) {
    if (y - height < MARGIN + 30) {
      [page, y] = addPage(pdfDoc);
    }
  }

  function drawText(
    text: string,
    opts: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      x?: number;
      indent?: number;
      after?: number;
      maxW?: number;
    } = {}
  ) {
    const {
      font = regular,
      size = 10,
      color = C_TEXT,
      x = MARGIN,
      indent = 0,
      after = 6,
      maxW = CONTENT_W,
    } = opts;

    const lines = wrapText(text, font, size, maxW - indent);
    needsNewPage(lines.length * (size + 4) + after);

    for (const line of lines) {
      y -= size;
      page.drawText(line, { x: x + indent, y, font, size, color });
      y -= 4;
    }
    y -= after;
  }

  function drawRule(color = C_NAVY, thickness = 0.5) {
    needsNewPage(10);
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness,
      color,
    });
    y -= 10;
  }

  // ── Cover header band ────────────────────────────────
  page.drawRectangle({ x: 0, y: PAGE_H - 110, width: PAGE_W, height: 110, color: C_NAVY });
  page.drawText("BMK Financial Services", {
    x: MARGIN,
    y: PAGE_H - 50,
    font: bold,
    size: 20,
    color: C_GOLD,
  });
  page.drawText("Fact Find Report", {
    x: MARGIN,
    y: PAGE_H - 72,
    font: regular,
    size: 12,
    color: C_WHITE,
  });
  page.drawText(`Generated ${today}`, {
    x: MARGIN,
    y: PAGE_H - 90,
    font: regular,
    size: 9,
    color: rgb(0.65, 0.68, 0.75),
  });

  y = PAGE_H - 130;

  // ── Client info ──────────────────────────────────────
  drawText(`Client: ${client.name}`, { font: bold, size: 12, after: 8 });
  drawText(`Adviser: ${client.adviser}`, { size: 10, color: C_MUTED, after: 4 });
  drawText(`Completion: ${client.progress}%`, { size: 10, color: C_MUTED, after: 20 });
  drawRule();

  // ── Sections ─────────────────────────────────────────
  for (const section of FACT_FIND_SECTIONS) {
    const clientSectionName = SECTION_MAP[section.id];
    const clientSection = client.factFindSections.find(
      (s) => s.name === clientSectionName
    );
    const status = clientSection?.status ?? "missing";
    const sectionAnswers = answers[section.id] ?? {};

    needsNewPage(80);

    // Section heading
    y -= 8;
    drawText(section.title, { font: bold, size: 13, color: C_TEXT, after: 4 });

    // Status badge
    const statusColor = status === "complete" ? C_GREEN : status === "in-progress" ? C_AMBER : C_RED;
    const statusText =
      status === "complete" ? "Complete" : status === "in-progress" ? "In Progress" : "Not Completed";

    page.drawRectangle({
      x: MARGIN,
      y: y - 3,
      width: regular.widthOfTextAtSize(statusText, 9) + 12,
      height: 15,
      color: status === "complete"
        ? rgb(0.09, 0.32, 0.19)
        : status === "in-progress"
        ? rgb(0.40, 0.28, 0.05)
        : rgb(0.38, 0.08, 0.08),
    });
    page.drawText(statusText, {
      x: MARGIN + 6,
      y: y + 2,
      font: bold,
      size: 9,
      color: statusColor,
    });
    y -= 20;

    if (status === "missing") {
      const required = section.fields.filter((f) => f.required).map((f) => f.label).join(", ");
      drawText(`Section not completed by client.`, { font: italic, color: C_RED, size: 10, after: 4 });
      if (required) {
        drawText(`Required fields outstanding: ${required}`, {
          color: rgb(0.65, 0.25, 0.25),
          size: 9,
          after: 16,
          maxW: CONTENT_W,
        });
      } else {
        y -= 12;
      }
    } else {
      y -= 4;
      for (const field of section.fields) {
        const value = sectionAnswers[field.id] ?? "—";
        const labelW = bold.widthOfTextAtSize(`${field.label}: `, 9.5);
        needsNewPage(18);

        drawText(`${field.label}: `, {
          font: bold,
          size: 9.5,
          color: C_MUTED,
          after: 0,
        });
        // Value on same visual row (we already moved y, so draw at same y + label size)
        const valueY = y + 9.5 + 4;
        const valueX = MARGIN + labelW;
        const valueLines = wrapText(value, regular, 9.5, CONTENT_W - labelW);
        page.drawText(valueLines[0] ?? "—", {
          x: valueX,
          y: valueY,
          font: regular,
          size: 9.5,
          color: C_TEXT,
        });
        // Extra lines if value wraps
        for (let i = 1; i < valueLines.length; i++) {
          y -= 13.5;
          page.drawText(valueLines[i], {
            x: MARGIN,
            y,
            font: regular,
            size: 9.5,
            color: C_TEXT,
          });
        }
        y -= 6;
      }
      y -= 10;
    }

    drawRule(rgb(0.82, 0.85, 0.90), 0.3);
  }

  // ── Footer on last page ───────────────────────────────
  page.drawText("BMK Financial Services  ·  Brad Lonergan  ·  Newcastle NSW", {
    x: MARGIN,
    y: 30,
    font: regular,
    size: 8,
    color: C_MUTED,
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fact-find-${client.id}.pdf"`,
    },
  });
}
