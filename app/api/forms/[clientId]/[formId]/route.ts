import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type PDFImage } from "pdf-lib";
import { CLIENTS } from "@/lib/data";
import { getClientAnswers } from "@/lib/fact-find-answers";
import { getClientProfile } from "@/lib/client-profiles";
import { getLogoPng } from "@/lib/export-logo";
import type { FormId } from "@/lib/forms";

// ── Layout (A4) ─────────────────────────────────────────────────────────────
const PW = 595, PH = 842;
const ML = 52, MR = 52;
const CW = PW - ML - MR;
const HEADER_H = 96;
const FOOTER_H = 36;
const SAFE_BOTTOM = FOOTER_H + 44;

// ── Colours ──────────────────────────────────────────────────────────────────
const C_NAVY      = rgb(0.055, 0.141, 0.267);
const C_GOLD      = rgb(0.784, 0.659, 0.290);
const C_WHITE     = rgb(1, 1, 1);
const C_TEXT      = rgb(0.12,  0.14,  0.18);
const C_MUTED     = rgb(0.45,  0.48,  0.55);
const C_FIELD_BG  = rgb(0.96,  0.97,  0.98);
const C_FIELD_BD  = rgb(0.80,  0.82,  0.87);
const C_SECTION_BG= rgb(0.08,  0.10,  0.14);
const C_PROVIDER_BG = rgb(0.93, 0.94, 0.96);
const C_SUB_TEXT  = rgb(0.65,  0.70,  0.82);
const C_FOOTER_TEXT = rgb(0.45, 0.48, 0.55);

// ── Form data shape ──────────────────────────────────────────────────────────
interface FieldSpec {
  label: string;
  value: string;
  fullWidth?: boolean;
  height?: number;
}

interface SectionSpec {
  title: string;
  fields: FieldSpec[];
}

interface FormSpec {
  formTitle: string;
  providerName: string;
  providerSubtitle: string;
  clientName: string;
  sections: SectionSpec[];
}

// ── Build form data from client record ───────────────────────────────────────
function buildFormSpec(formId: FormId, clientId: string): FormSpec | null {
  const client = CLIENTS.find((c) => c.id === clientId);
  if (!client) return null;

  const answers  = getClientAnswers(clientId);
  const profile  = getClientProfile(clientId);

  const fullName     = answers["personal-details"]?.["full-name"] ?? client.name;
  const dob          = answers["personal-details"]?.["dob"] ?? "";
  const address      = answers["contact-information"]?.["address"] ??
                       answers["contact-information"]?.["street-address"] ?? "";
  const occupation   = answers["employment-income"]?.["occupation"] ?? profile?.occupation ?? "";
  const employer     = answers["employment-income"]?.["employer"]   ?? profile?.employer   ?? "";
  const incomeStr    = answers["employment-income"]?.["annual-income"] ??
                       (profile?.annualIncome ? `$${profile.annualIncome.toLocaleString()}` : "");
  const superFund    = answers["superannuation"]?.["fund-name"]      ?? profile?.superFund ?? "";
  const memberNo     = answers["superannuation"]?.["member-number"]  ?? profile?.superMemberNumber ?? "";
  const superBal     = answers["superannuation"]?.["balance"] ??
                       (profile?.superBalance ? `$${profile.superBalance.toLocaleString()}` : "");
  const tfn          = profile?.tfn ?? "";
  const today        = new Date().toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
  });

  if (formId === "mlc-super") {
    return {
      formTitle: "Super Application",
      providerName: "MLC",
      providerSubtitle: "MLC MasterKey Super Fundamentals",
      clientName: fullName,
      sections: [
        {
          title: "Applicant Details",
          fields: [
            { label: "Full Name",            value: fullName },
            { label: "Date of Birth",        value: dob },
            { label: "Tax File Number",      value: tfn },
            { label: "Residential Address",  value: address, fullWidth: true },
          ],
        },
        {
          title: "Employment Details",
          fields: [
            { label: "Employer Name",             value: employer },
            { label: "Occupation",                value: occupation },
            { label: "Super Contribution Rate",   value: "11.5% (SG Rate)" },
            { label: "Annual Income",             value: incomeStr },
          ],
        },
        {
          title: "Investment Selection",
          fields: [
            { label: "Investment Option",        value: "Balanced — MLC Balanced" },
            { label: "Risk Profile",             value: "Balanced Growth" },
            { label: "Rollover From Fund",       value: superFund },
            { label: "Existing Member Number",   value: memberNo },
          ],
        },
        {
          title: "Adviser Details",
          fields: [
            { label: "Adviser Name",    value: client.adviser },
            { label: "AFSL Number",     value: "234665" },
            { label: "Licence Name",    value: "Newcastle Financial Services" },
            { label: "Date Prepared",   value: today },
          ],
        },
      ],
    };
  }

  if (formId === "aia-insurance") {
    const incomeNum  = profile?.annualIncome ?? 118000;
    const ipBenefit  = `$${Math.round(incomeNum * 0.75 / 12).toLocaleString()} per month`;
    return {
      formTitle: "Insurance Application",
      providerName: "AIA",
      providerSubtitle: "Life, TPD and Income Protection",
      clientName: fullName,
      sections: [
        {
          title: "Life Insured Details",
          fields: [
            { label: "Full Name",           value: fullName },
            { label: "Date of Birth",       value: dob },
            { label: "Residential Address", value: address, fullWidth: true },
            { label: "Occupation",          value: occupation },
            { label: "Annual Income",       value: incomeStr },
          ],
        },
        {
          title: "Cover Requested",
          fields: [
            { label: "Life Cover Amount",   value: "$1,200,000" },
            { label: "TPD Cover Amount",    value: "$1,000,000" },
            { label: "IP Monthly Benefit",  value: ipBenefit },
            { label: "IP Waiting Period",   value: "90 Days" },
            { label: "IP Benefit Period",   value: "To Age 65" },
            { label: "Super Fund Link",     value: superFund || "AustralianSuper" },
          ],
        },
        {
          title: "Adviser Details",
          fields: [
            { label: "Adviser Name",   value: client.adviser },
            { label: "AFSL Number",    value: "234665" },
            { label: "Licence Name",   value: "Newcastle Financial Services" },
            { label: "Date Prepared",  value: today },
          ],
        },
      ],
    };
  }

  if (formId === "amp-mynorth") {
    const balance = profile?.superBalance ?? 142000;
    return {
      formTitle: "MyNorth Account Opening",
      providerName: "AMP",
      providerSubtitle: "AMP MyNorth Investment Platform",
      clientName: fullName,
      sections: [
        {
          title: "Investor Details",
          fields: [
            { label: "Full Name",           value: fullName },
            { label: "Date of Birth",       value: dob },
            { label: "Tax File Number",     value: tfn },
            { label: "Residential Address", value: address, fullWidth: true },
          ],
        },
        {
          title: "Investment Details",
          fields: [
            { label: "Initial Investment Amount", value: `$${balance.toLocaleString()}` },
            { label: "Investment Profile",        value: "Balanced Growth" },
            { label: "Source of Funds",           value: "Superannuation Rollover" },
            { label: "Rollover From Fund",        value: superFund || "AustralianSuper" },
          ],
        },
        {
          title: "Adviser Details",
          fields: [
            { label: "Adviser Name",   value: client.adviser },
            { label: "AFSL Number",    value: "234665" },
            { label: "Licence Name",   value: "Newcastle Financial Services" },
            { label: "Date Prepared",  value: today },
          ],
        },
      ],
    };
  }

  return null;
}

// ── PDF builder ──────────────────────────────────────────────────────────────
async function buildPdf(spec: FormSpec): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`${spec.providerName} ${spec.formTitle} — ${spec.clientName}`);
  pdfDoc.setAuthor("Newcastle Financial Services");
  pdfDoc.setCreator("BMK CRM Platform");

  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoPng  = await getLogoPng(140);
  const logo     = await pdfDoc.embedPng(logoPng);

  const pages: PDFPage[] = [];
  let pg!: PDFPage;
  let cy = 0;

  // ── helpers ────────────────────────────────────────────────────────────────

  function fit(text: string, font: PDFFont, size: number, maxW: number): string {
    let t = text;
    while (t.length > 2 && font.widthOfTextAtSize(t, size) > maxW) {
      t = t.slice(0, -1);
    }
    return t === text ? text : t + "..";
  }

  function addPage(): void {
    const page = pdfDoc.addPage([PW, PH]);
    pages.push(page);

    // Navy header band
    page.drawRectangle({ x: 0, y: PH - HEADER_H, width: PW, height: HEADER_H, color: C_NAVY });
    // Gold accent stripe
    page.drawRectangle({ x: 0, y: PH - HEADER_H, width: PW, height: 2, color: C_GOLD });

    // Logo
    const logoSize = 56;
    const logoY = PH - HEADER_H + (HEADER_H - logoSize) / 2;
    page.drawImage(logo, { x: ML, y: logoY, width: logoSize, height: logoSize });

    // Brand text
    const bx = ML + logoSize + 14;
    page.drawText("Newcastle Financial Services", {
      x: bx, y: PH - HEADER_H + 58, size: 15, font: fontBold, color: C_WHITE,
    });
    page.drawText("AFSL 234665", {
      x: bx, y: PH - HEADER_H + 40, size: 9, font: fontReg, color: C_SUB_TEXT,
    });
    page.drawText("Brad Lonergan  |  Financial Adviser", {
      x: bx, y: PH - HEADER_H + 26, size: 9, font: fontReg, color: C_SUB_TEXT,
    });

    // Form title block (right)
    const titleUpper = spec.formTitle.toUpperCase();
    const titleW = fontBold.widthOfTextAtSize(titleUpper, 11);
    page.drawText(titleUpper, {
      x: PW - MR - titleW, y: PH - HEADER_H + 60, size: 11, font: fontBold, color: C_GOLD,
    });
    const subW = fontReg.widthOfTextAtSize(spec.providerSubtitle, 8.5);
    page.drawText(spec.providerSubtitle, {
      x: PW - MR - subW, y: PH - HEADER_H + 44, size: 8.5, font: fontReg, color: C_SUB_TEXT,
    });

    // Provider badge
    const badgeLabel = spec.providerName;
    const badgeTextW = fontBold.widthOfTextAtSize(badgeLabel, 9);
    const badgeW = badgeTextW + 14;
    page.drawRectangle({ x: PW - MR - badgeW, y: PH - HEADER_H + 22, width: badgeW, height: 18, color: C_GOLD });
    page.drawText(badgeLabel, {
      x: PW - MR - badgeW + 7, y: PH - HEADER_H + 27, size: 9, font: fontBold, color: C_NAVY,
    });

    // Footer
    page.drawRectangle({ x: 0, y: 0, width: PW, height: FOOTER_H, color: C_SECTION_BG });
    page.drawText("Newcastle Financial Services  |  AFSL 234665  |  Confidential Document", {
      x: ML, y: 13, size: 7.5, font: fontReg, color: C_FOOTER_TEXT,
    });

    pg = page;
    cy = PH - HEADER_H - 24;
  }

  function space(needed: number): void {
    if (cy - needed < SAFE_BOTTOM) addPage();
  }

  function sectionTitle(title: string): void {
    space(44);
    const sy = cy - 30;
    pg.drawRectangle({ x: ML,     y: sy, width: 3,       height: 22, color: C_GOLD });
    pg.drawRectangle({ x: ML + 3, y: sy, width: CW - 3,  height: 22, color: C_SECTION_BG });
    pg.drawText(title.toUpperCase(), {
      x: ML + 14, y: sy + 7, size: 8.5, font: fontBold, color: C_GOLD,
    });
    cy = sy - 14;
  }

  function fieldBox(label: string, value: string, x: number, y: number, w: number, h = 34): void {
    pg.drawText(label.toUpperCase(), {
      x, y: y + h + 5, size: 7.5, font: fontBold, color: C_MUTED,
    });
    pg.drawRectangle({ x, y, width: w, height: h, color: C_FIELD_BG, borderColor: C_FIELD_BD, borderWidth: 0.5 });
    if (value) {
      const display = fit(value, fontReg, 11, w - 20);
      pg.drawText(display, { x: x + 10, y: y + (h - 11) / 2 + 1, size: 11, font: fontReg, color: C_TEXT });
    }
  }

  function fieldRow(fields: FieldSpec[]): void {
    const colW = (CW - 12) / 2;
    let i = 0;
    while (i < fields.length) {
      const f  = fields[i];
      const fh = f.height ?? 34;
      if (f.fullWidth) {
        space(fh + 26);
        fieldBox(f.label, f.value, ML, cy - fh, CW, fh);
        cy -= fh + 22;
        i++;
      } else {
        const f2 = fields[i + 1];
        if (f2 && !f2.fullWidth) {
          const rh = Math.max(fh, f2.height ?? 34);
          space(rh + 26);
          fieldBox(f.label,  f.value,  ML,             cy - rh, colW, rh);
          fieldBox(f2.label, f2.value, ML + colW + 12, cy - rh, colW, rh);
          cy -= rh + 22;
          i += 2;
        } else {
          space(fh + 26);
          fieldBox(f.label, f.value, ML, cy - fh, CW, fh);
          cy -= fh + 22;
          i++;
        }
      }
    }
  }

  function signatureBlock(): void {
    space(140);
    cy -= 8;

    // Section header
    const sy = cy - 30;
    pg.drawRectangle({ x: ML,     y: sy, width: 3,      height: 22, color: C_GOLD });
    pg.drawRectangle({ x: ML + 3, y: sy, width: CW - 3, height: 22, color: C_SECTION_BG });
    pg.drawText("DECLARATION & SIGNATURE", {
      x: ML + 14, y: sy + 7, size: 8.5, font: fontBold, color: C_GOLD,
    });
    cy = sy - 20;

    pg.drawText(
      "By signing below, I confirm the information in this application is accurate and complete.",
      { x: ML, y: cy, size: 9, font: fontReg, color: C_MUTED }
    );
    cy -= 22;

    const sigW  = Math.floor((CW - 16) * 0.65);
    const dateW = CW - 16 - sigW;

    pg.drawText("AUTHORISED SIGNATURE", { x: ML,            y: cy + 5, size: 7.5, font: fontBold, color: C_MUTED });
    pg.drawText("DATE",                  { x: ML + sigW + 16, y: cy + 5, size: 7.5, font: fontBold, color: C_MUTED });

    pg.drawRectangle({ x: ML,             y: cy - 54, width: sigW,  height: 54, color: C_FIELD_BG, borderColor: C_FIELD_BD, borderWidth: 0.5 });
    pg.drawRectangle({ x: ML + sigW + 16, y: cy - 54, width: dateW, height: 54, color: C_FIELD_BG, borderColor: C_FIELD_BD, borderWidth: 0.5 });

    cy -= 72;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  addPage();

  // Provider banner
  pg.drawRectangle({ x: ML, y: cy - 46, width: CW, height: 46, color: C_PROVIDER_BG });

  const provW = fontBold.widthOfTextAtSize(spec.providerName, 22);
  pg.drawText(spec.providerName, { x: ML + 16, y: cy - 16, size: 22, font: fontBold, color: C_NAVY });

  const subX = ML + 16 + provW + 12;
  pg.drawText(spec.providerSubtitle, { x: subX, y: cy - 13, size: 10, font: fontReg, color: C_MUTED });

  const prepLabel = "PREPARED FOR";
  const prepLW = fontBold.widthOfTextAtSize(prepLabel, 7.5);
  pg.drawText(prepLabel, { x: PW - MR - prepLW, y: cy - 13, size: 7.5, font: fontBold, color: C_MUTED });

  const clientDispW = fontBold.widthOfTextAtSize(spec.clientName, 11);
  pg.drawText(spec.clientName, { x: PW - MR - clientDispW, y: cy - 30, size: 11, font: fontBold, color: C_TEXT });

  cy -= 60;

  for (const section of spec.sections) {
    sectionTitle(section.title);
    fieldRow(section.fields);
    cy -= 8;
  }

  signatureBlock();

  // Page numbers
  for (let i = 0; i < pages.length; i++) {
    const label = `Page ${i + 1} of ${pages.length}`;
    const lw = fontReg.widthOfTextAtSize(label, 7.5);
    pages[i].drawText(label, { x: PW - MR - lw, y: 13, size: 7.5, font: fontReg, color: C_FOOTER_TEXT });
  }

  return pdfDoc.save();
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: { clientId: string; formId: string } }
) {
  const { clientId, formId } = params;

  const validIds: FormId[] = ["mlc-super", "aia-insurance", "amp-mynorth"];
  if (!validIds.includes(formId as FormId)) {
    return new NextResponse("Invalid form ID", { status: 400 });
  }

  const spec = buildFormSpec(formId as FormId, clientId);
  if (!spec) {
    return new NextResponse("Client not found", { status: 404 });
  }

  try {
    const pdfBytes = await buildPdf(spec);
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${formId}-${clientId}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Form PDF generation error:", err);
    return new NextResponse("Failed to generate form", { status: 500 });
  }
}
