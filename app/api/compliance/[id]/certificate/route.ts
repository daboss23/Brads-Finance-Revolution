import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import { CLIENTS } from "@/lib/data";
import { checkCompliance } from "@/lib/compliance/compliance-checker";
import { getLogoPng } from "@/lib/export-logo";
import type { ComplianceStatus } from "@/lib/compliance/knowledge-base";

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
const C_GREEN = rgb(0.08, 0.6, 0.35);
const C_RED = rgb(0.78, 0.18, 0.18);
const C_AMBER = rgb(0.84, 0.58, 0.1);
const C_SECTION_BG = rgb(0.96, 0.97, 0.98);

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

function statusGlyph(status: ComplianceStatus): { glyph: string; color: ReturnType<typeof rgb> } {
  switch (status) {
    case "passed":
      return { glyph: "PASS", color: C_GREEN };
    case "failed":
      return { glyph: "FAIL", color: C_RED };
    case "pending":
      return { glyph: "PEND", color: C_AMBER };
    default:
      return { glyph: "N/A ", color: C_MUTED };
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const client = CLIENTS.find((c) => c.id === params.id);
  if (!client)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = checkCompliance(client.id);
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Compliance Certificate — ${client.name}`);
  pdf.setCreator("BMK Financial Services");

  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await getLogoPng(96);
  const logo = await pdf.embedPng(logoBytes);

  let page = pdf.addPage([PW, PH]);
  let y = PH;

  // Header band
  page.drawRectangle({
    x: 0,
    y: PH - 130,
    width: PW,
    height: 130,
    color: C_NAVY,
  });
  page.drawImage(logo, { x: ML, y: PH - 116, width: 64, height: 64 });
  page.drawText("Newcastle Financial Services", {
    x: ML + 80,
    y: PH - 50,
    size: 14,
    font: fontBold,
    color: C_WHITE,
  });
  page.drawText("Compliance Certificate · Charter AFSL 234665", {
    x: ML + 80,
    y: PH - 70,
    size: 10,
    font: fontReg,
    color: rgb(0.85, 0.88, 0.92),
  });
  page.drawText(`Generated ${today}`, {
    x: ML + 80,
    y: PH - 90,
    size: 9,
    font: fontReg,
    color: rgb(0.7, 0.75, 0.82),
  });
  page.drawRectangle({
    x: 0,
    y: PH - 134,
    width: PW,
    height: 3,
    color: C_GOLD,
  });

  y = PH - 160;

  // Client block
  page.drawText("CLIENT", {
    x: ML,
    y,
    size: 8,
    font: fontBold,
    color: C_MUTED,
  });
  y -= 14;
  page.drawText(client.name, {
    x: ML,
    y,
    size: 18,
    font: fontBold,
    color: C_TEXT,
  });
  y -= 18;
  page.drawText(
    `Status: ${result.overallStatus.toUpperCase()}    Score: ${result.complianceScore} / 100    Checker v${result.checkerVersion}`,
    { x: ML, y, size: 9, font: fontReg, color: C_MUTED },
  );
  y -= 24;
  page.drawLine({
    start: { x: ML, y },
    end: { x: PW - MR, y },
    thickness: 0.5,
    color: C_LIGHT,
  });
  y -= 22;

  const sectionTitle = (text: string) => {
    if (y < 130) {
      page = pdf.addPage([PW, PH]);
      y = PH - 60;
    }
    page.drawRectangle({
      x: ML - 6,
      y: y - 4,
      width: CW + 12,
      height: 22,
      color: C_SECTION_BG,
    });
    page.drawText(text, {
      x: ML,
      y: y + 4,
      size: 10,
      font: fontBold,
      color: C_TEXT,
    });
    y -= 26;
  };

  const drawRow = (label: string, status: ComplianceStatus, detail?: string) => {
    if (y < 90) {
      page = pdf.addPage([PW, PH]);
      y = PH - 60;
    }
    const { glyph, color } = statusGlyph(status);
    page.drawText(glyph, {
      x: ML,
      y,
      size: 8,
      font: fontBold,
      color,
    });
    const labelLines = wrap(label, fontBold, 9.5, CW - 60);
    page.drawText(labelLines[0], {
      x: ML + 36,
      y,
      size: 9.5,
      font: fontBold,
      color: C_TEXT,
    });
    y -= 12;
    if (labelLines.length > 1) {
      for (let i = 1; i < labelLines.length; i++) {
        page.drawText(labelLines[i], {
          x: ML + 36,
          y,
          size: 9.5,
          font: fontBold,
          color: C_TEXT,
        });
        y -= 12;
      }
    }
    if (detail) {
      const detailLines = wrap(detail, fontReg, 8.5, CW - 40);
      for (const line of detailLines) {
        if (y < 60) {
          page = pdf.addPage([PW, PH]);
          y = PH - 60;
        }
        page.drawText(line, {
          x: ML + 36,
          y,
          size: 8.5,
          font: fontReg,
          color: C_MUTED,
        });
        y -= 11;
      }
    }
    y -= 6;
  };

  // Best Interests Duty
  sectionTitle("Best Interests Duty · seven step check");
  result.bestInterestsDuty.forEach((step, i) => {
    drawRow(`Step ${i + 1}. ${step.requirement}`, step.status, step.evidence);
  });
  y -= 8;

  // Safe Harbour
  sectionTitle("Safe Harbour · section 961B(2)");
  result.safeHarbour.forEach((step) => {
    drawRow(step.requirement, step.status, step.evidence);
  });
  y -= 8;

  // AFSL
  sectionTitle("AFSL Obligations · Charter Financial Planning 234665");
  result.afslObligations.forEach((o) => {
    drawRow(o.obligation, o.status, `${o.description} (${o.reference})`);
  });
  y -= 6;

  // Issues
  if (result.blockers.length > 0) {
    sectionTitle("Blockers");
    for (const issue of result.blockers) {
      drawRow(issue.area, "failed", issue.message);
    }
  }
  if (result.missingInformation.length > 0) {
    sectionTitle("Missing Information");
    for (const issue of result.missingInformation) {
      drawRow(issue.area, "failed", issue.message);
    }
  }
  if (result.warnings.length > 0) {
    sectionTitle("Warnings");
    for (const issue of result.warnings) {
      drawRow(issue.area, "pending", issue.message);
    }
  }

  // Sign-off
  if (y < 160) {
    page = pdf.addPage([PW, PH]);
    y = PH - 60;
  }
  y -= 14;
  page.drawRectangle({
    x: ML,
    y: y - 96,
    width: CW,
    height: 96,
    borderColor: C_LIGHT,
    borderWidth: 0.7,
  });
  page.drawText("ADVISER SIGN-OFF", {
    x: ML + 14,
    y: y - 18,
    size: 9,
    font: fontBold,
    color: C_MUTED,
  });
  const signLines = wrap(
    "I, Brad Lonergan (Authorised Representative, Charter Financial Planning AFSL 234665), confirm I have reviewed the compliance check for this client and certify that the best interests duty has been met to the standard required.",
    fontReg,
    9,
    CW - 28,
  );
  let signY = y - 34;
  for (const line of signLines) {
    page.drawText(line, {
      x: ML + 14,
      y: signY,
      size: 9,
      font: fontReg,
      color: C_TEXT,
    });
    signY -= 12;
  }
  page.drawLine({
    start: { x: ML + 14, y: y - 90 },
    end: { x: ML + 220, y: y - 90 },
    thickness: 0.7,
    color: C_TEXT,
  });
  page.drawText("Brad Lonergan", {
    x: ML + 14,
    y: y - 86,
    size: 9,
    font: fontBold,
    color: C_TEXT,
  });
  page.drawText(`Date: ${today}`, {
    x: ML + 240,
    y: y - 86,
    size: 9,
    font: fontReg,
    color: C_TEXT,
  });

  // Footer
  const footerY = 32;
  const totalPages = pdf.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdf.getPage(i);
    p.drawLine({
      start: { x: ML, y: footerY + 12 },
      end: { x: PW - MR, y: footerY + 12 },
      thickness: 0.4,
      color: C_LIGHT,
    });
    p.drawText("BMK Financial Services · Newcastle NSW", {
      x: ML,
      y: footerY,
      size: 8,
      font: fontReg,
      color: C_MUTED,
    });
    p.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: PW - MR - 60,
      y: footerY,
      size: 8,
      font: fontReg,
      color: C_MUTED,
    });
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${client.name.replace(
        /\s+/g,
        "-",
      )}-compliance-certificate.pdf"`,
    },
  });
}
