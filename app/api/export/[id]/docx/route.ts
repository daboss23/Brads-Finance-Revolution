import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  HeadingLevel,
  Footer,
  Header,
  PageNumber,
  NumberFormat,
} from "docx";
import { CLIENTS } from "@/lib/data";
import { FACT_FIND_SECTIONS, type Field } from "@/lib/fact-find-flow";
import { getClientAnswers } from "@/lib/fact-find-answers";
import { getLogoPng } from "@/lib/export-logo";
import { findClient } from "@/lib/data/client-repository";

// ── Colour constants (OOXML hex, no #) ────────────────────────────────────────
const NAVY   = "0E2444";
const GOLD   = "C4A035";
const WHITE  = "FFFFFF";
const TEXT   = "1A1F2E";
const MUTED  = "6B7280";
const AMBER  = "D97706";
const AMBER_BG = "FEF3C7";
const GREEN  = "15803D";
const GREEN_BG = "DCFCE7";
const SECTION_BG = "F1F5F9";
const LIGHT_BORDER = "D1D5DB";

// ── Section → client section name map ─────────────────────────────────────────
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

// ── Border helpers ─────────────────────────────────────────────────────────────
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "auto" } as const;
const THIN_BORDER = { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BORDER } as const;

function noBorders() {
  return { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
}

// ── Progress bar as a two-cell table ─────────────────────────────────────────
function progressBarRow(progress: number): Table {
  const filled = Math.max(1, Math.round(progress));
  const empty  = 100 - filled;

  const filledCell = new TableCell({
    width: { size: filled, type: WidthType.PERCENTAGE },
    shading: { fill: GOLD, type: ShadingType.CLEAR, color: "auto" },
    borders: noBorders(),
    children: [new Paragraph({ text: "", spacing: { before: 0, after: 0 } })],
  });

  const emptyCell = new TableCell({
    width: { size: empty, type: WidthType.PERCENTAGE },
    shading: { fill: "E5E7EB", type: ShadingType.CLEAR, color: "auto" },
    borders: noBorders(),
    children: [new Paragraph({ text: "", spacing: { before: 0, after: 0 } })],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: empty > 0 ? [filledCell, emptyCell] : [filledCell], height: { value: 160, rule: "exact" } })],
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
  });
}

// ── Section header row (dark background) ─────────────────────────────────────
function sectionHeaderRow(title: string, status: string): Table {
  const statusText  = status === "complete" ? "● Complete" : status === "in-progress" ? "◐ In Progress" : "○ Not Completed";
  const statusColor = status === "complete" ? GREEN : status === "in-progress" ? AMBER : "DC2626";
  const statusBg    = status === "complete" ? GREEN_BG : AMBER_BG;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            shading: { fill: SECTION_BG, type: ShadingType.CLEAR, color: "auto" },
            borders: { top: NO_BORDER, bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD }, left: { style: BorderStyle.SINGLE, size: 12, color: GOLD }, right: NO_BORDER },
            margins: { top: 80, bottom: 80, left: 120, right: 0 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 18, color: TEXT, characterSpacing: 20 })],
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: SECTION_BG, type: ShadingType.CLEAR, color: "auto" },
            borders: { top: NO_BORDER, bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD }, left: NO_BORDER, right: NO_BORDER },
            margins: { top: 80, bottom: 80, left: 0, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: statusText, bold: true, size: 16, color: statusColor }),
                ],
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
        ],
      }),
    ],
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
  });
}

// ── Two-column field pair ─────────────────────────────────────────────────────
function fieldPairRow(f1: Field, v1: string | undefined, f2?: Field, v2?: string): Table {
  const missing1 = !v1 || v1 === "—";
  const missing2 = f2 && (!v2 || v2 === "—");

  function fieldCell(label: string, value: string | undefined, isMissing: boolean, pct: number) {
    return new TableCell({
      width: { size: pct, type: WidthType.PERCENTAGE },
      borders: noBorders(),
      margins: { top: 60, bottom: 60, left: 0, right: 120 },
      children: [
        new Paragraph({
          children: [new TextRun({ text: label, size: 16, color: MUTED })],
          spacing: { before: 0, after: 40 },
        }),
        new Paragraph({
          shading: isMissing ? { fill: AMBER_BG, type: ShadingType.CLEAR, color: "auto" } : undefined,
          children: isMissing
            ? [new TextRun({ text: "Missing", bold: true, size: 19, color: AMBER })]
            : [new TextRun({ text: value ?? "—", bold: true, size: 19, color: TEXT })],
          spacing: { before: 0, after: 0 },
        }),
      ],
    });
  }

  const cells = [fieldCell(f1.label, v1, missing1, f2 ? 50 : 100)];
  if (f2) cells.push(fieldCell(f2.label, v2, !!missing2, 50));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: cells })],
    borders: { top: NO_BORDER, bottom: { style: BorderStyle.SINGLE, size: 2, color: "F3F4F6" }, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
  });
}

// ── Missing section block ─────────────────────────────────────────────────────
function missingSectionBlock(requiredFields: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: AMBER_BG, type: ShadingType.CLEAR, color: "auto" },
            borders: { top: NO_BORDER, bottom: NO_BORDER, left: { style: BorderStyle.SINGLE, size: 12, color: AMBER }, right: NO_BORDER },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Section not completed — follow-up required before this file can progress.", bold: true, size: 18, color: AMBER })],
                spacing: { before: 0, after: 60 },
              }),
              ...(requiredFields ? [new Paragraph({
                children: [new TextRun({ text: `Outstanding fields: ${requiredFields}`, size: 16, color: MUTED, italics: true })],
                spacing: { before: 0, after: 0 },
              })] : []),
            ],
          }),
        ],
      }),
    ],
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
  });
}

// ── Spacer paragraph ─────────────────────────────────────────────────────────
function spacer(pts = 120): Paragraph {
  return new Paragraph({ text: "", spacing: { before: 0, after: pts } });
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await findClient(params.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const answers = getClientAnswers(client.id);
  const today   = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  // Logo PNG
  let logoPng: Buffer | null = null;
  try { logoPng = await getLogoPng(160); } catch { /* skip */ }

  // ── Page footer ─────────────────────────────────────────────────────────────
  const docFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BORDER } },
        children: [
          new TextRun({ text: "BMK Financial Services  ·  Brad Lonergan  ·  Newcastle NSW     ", size: 14, color: MUTED }),
          new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], size: 14, color: MUTED }),
        ],
        spacing: { before: 120 },
      }),
    ],
  });

  // ── Document children ────────────────────────────────────────────────────────
  const children: (Paragraph | Table)[] = [];

  // Header table: logo | brand | document meta
  const headerLogoCell = new TableCell({
    width: { size: 12, type: WidthType.PERCENTAGE },
    shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" },
    borders: noBorders(),
    margins: { top: 120, bottom: 120, left: 120, right: 80 },
    verticalAlign: "center",
    children: logoPng
      ? [new Paragraph({
          children: [new ImageRun({ type: "png", data: logoPng, transformation: { width: 54, height: 54 } })],
          spacing: { before: 0, after: 0 },
        })]
      : [new Paragraph({ text: "" })],
  });

  const headerBrandCell = new TableCell({
    width: { size: 55, type: WidthType.PERCENTAGE },
    shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" },
    borders: noBorders(),
    margins: { top: 120, bottom: 120, left: 0, right: 0 },
    verticalAlign: "center",
    children: [
      new Paragraph({
        children: [new TextRun({ text: "Newcastle", size: 30, color: WHITE, characterSpacing: 60 })],
        spacing: { before: 0, after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Financial Services", bold: true, size: 17, color: GOLD, characterSpacing: 30 })],
        spacing: { before: 0, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Plan · Grow · Prosper", size: 14, color: "A3A8B4", characterSpacing: 15 })],
        spacing: { before: 0, after: 0 },
      }),
    ],
  });

  const headerMetaCell = new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" },
    borders: noBorders(),
    margins: { top: 120, bottom: 120, left: 0, right: 160 },
    verticalAlign: "center",
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "FACT FIND REPORT", bold: true, size: 15, color: GOLD, characterSpacing: 25 })],
        spacing: { before: 0, after: 80 },
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: today, size: 17, color: WHITE })],
        spacing: { before: 0, after: 60 },
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: client.adviser, size: 15, color: "A3A8B4" })],
        spacing: { before: 0, after: 0 },
      }),
    ],
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [headerLogoCell, headerBrandCell, headerMetaCell] })],
      borders: { top: NO_BORDER, bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD }, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
    })
  );

  // Client name + progress
  children.push(
    spacer(200),
    new Paragraph({
      children: [new TextRun({ text: client.name, bold: true, size: 48, color: TEXT })],
      spacing: { before: 0, after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Fact Find Report", size: 20, color: MUTED })],
      spacing: { before: 0, after: 160 },
    }),
    progressBarRow(client.progress),
    new Paragraph({
      children: [
        new TextRun({ text: `${client.progress}% Complete`, bold: true, size: 17, color: AMBER }),
        new TextRun({ text: `     Adviser: ${client.adviser}   ·   Generated: ${today}`, size: 17, color: MUTED }),
      ],
      spacing: { before: 80, after: 0 },
    }),
    spacer(200)
  );

  // ── Sections ─────────────────────────────────────────────────────────────────
  for (const section of FACT_FIND_SECTIONS) {
    const clientSection = client.factFindSections.find(
      (s) => s.name === SECTION_MAP[section.id]
    );
    const status = clientSection?.status ?? "missing";
    const sectionAnswers = answers[section.id] ?? {};

    children.push(sectionHeaderRow(section.title, status));

    if (status === "missing") {
      const req = section.fields.filter((f) => f.required).map((f) => f.label).join(", ");
      children.push(missingSectionBlock(req));
    } else {
      const fields = section.fields;
      for (let i = 0; i < fields.length; i += 2) {
        const f1 = fields[i];
        const f2 = fields[i + 1];
        children.push(fieldPairRow(f1, sectionAnswers[f1.id], f2, f2 ? sectionAnswers[f2.id] : undefined));
      }
    }

    children.push(spacer(160));
  }

  // ── Assemble document ─────────────────────────────────────────────────────────
  const doc = new Document({
    creator:     "BMK Financial Services",
    title:       `Fact Find — ${client.name}`,
    description: `Fact find report for ${client.name}, generated ${today}`,
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20, color: TEXT },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 900, right: 900 },
        },
      },
      footers: { default: docFooter },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="fact-find-${client.id}.docx"`,
    },
  });
}
