import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";
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

  const children: Paragraph[] = [];

  // ── Header ──────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "BMK Financial Services",
          bold: true,
          size: 36,
          color: "0f172a",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Fact Find Report",
          size: 26,
          color: "475569",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Client:  ", bold: true }), new TextRun(client.name)],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Adviser:  ", bold: true }), new TextRun(client.adviser)],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Date:  ", bold: true }), new TextRun(today)],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Progress:  ", bold: true }), new TextRun(`${client.progress}% complete`)],
      spacing: { after: 500 },
    })
  );

  // ── Sections ─────────────────────────────────────────
  for (const section of FACT_FIND_SECTIONS) {
    const clientSectionName = SECTION_MAP[section.id];
    const clientSection = client.factFindSections.find(
      (s) => s.name === clientSectionName
    );
    const status = clientSection?.status ?? "missing";
    const sectionAnswers = answers[section.id] ?? {};

    const statusText =
      status === "complete"
        ? "● Complete"
        : status === "in-progress"
        ? "◐ In Progress"
        : "○ Not Completed";

    const statusColor =
      status === "complete" ? "16a34a" : status === "in-progress" ? "d97706" : "dc2626";

    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.title, bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 400, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: statusText, color: statusColor, size: 20 }),
        ],
        spacing: { after: 200 },
      })
    );

    if (status === "missing") {
      const required = section.fields.filter((f) => f.required).map((f) => f.label).join(", ");
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Section not completed. Required fields outstanding: ${required || "none listed"}`,
              italics: true,
              color: "dc2626",
            }),
          ],
          spacing: { after: 300 },
        })
      );
    } else {
      for (const field of section.fields) {
        const value = sectionAnswers[field.id] ?? "—";
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${field.label}:  `, bold: true }),
              new TextRun({ text: value }),
            ],
            spacing: { after: 100 },
          })
        );
      }
      children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
    }
  }

  const doc = new Document({
    creator: "BMK Financial Services",
    title: `Fact Find — ${client.name}`,
    description: `Fact find report for ${client.name} generated ${today}`,
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="fact-find-${client.id}.docx"`,
    },
  });
}
