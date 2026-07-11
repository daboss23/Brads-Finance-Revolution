import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type PDFImage } from "pdf-lib";
import { CLIENTS } from "@/lib/data";
import { getClientAnswers } from "@/lib/fact-find-answers";
import { getClientProfile } from "@/lib/client-profiles";
import { getFactFindOrDemo } from "@/lib/sarah-fact-find-store";
import { ensureFactFindsHydrated } from "@/lib/secure-store/fact-find-persistence";
import { getLogoPng } from "@/lib/export-logo";
import { FORMS, PROVIDERS, type FormId } from "@/lib/forms";

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

  const definition = FORMS.find((f) => f.id === formId);
  if (!definition) return null;

  // Prefer Sarah's collected fact find (or demo fallback), with the older
  // sample answers and client-profile data as final back-stops.
  const sarah    = getFactFindOrDemo(clientId);
  const answers  = getClientAnswers(clientId);
  const profile  = getClientProfile(clientId);

  const fullName     = sarah?.personalDetails.fullName ||
                       answers["personal-details"]?.["full-name"] ||
                       client.name;
  const dob          = sarah?.personalDetails.dateOfBirth ||
                       answers["personal-details"]?.["dob"] || "";
  const address      = sarah?.personalDetails.address ||
                       answers["contact-information"]?.["address"] ||
                       answers["contact-information"]?.["street-address"] || "";
  const email        = sarah?.contactInformation.email ||
                       answers["contact-information"]?.["email"] || "";
  const mobile       = sarah?.contactInformation.mobile ||
                       answers["contact-information"]?.["mobile"] || "";
  const occupation   = sarah?.employmentAndIncome.occupation ||
                       answers["employment-income"]?.["occupation"] ||
                       profile?.occupation || "";
  const employer     = sarah?.employmentAndIncome.employerName ||
                       answers["employment-income"]?.["employer"] ||
                       profile?.employer || "";
  const incomeStr    = sarah?.employmentAndIncome.annualGrossIncome ||
                       answers["employment-income"]?.["annual-income"] ||
                       (profile?.annualIncome ? `$${profile.annualIncome.toLocaleString()}` : "");
  const superFund    = sarah?.superannuation.fundName ||
                       answers["superannuation"]?.["fund-name"] ||
                       profile?.superFund || "";
  const memberNo     = sarah?.superannuation.memberNumber ||
                       answers["superannuation"]?.["member-number"] ||
                       profile?.superMemberNumber || "";
  const superBal     = sarah?.superannuation.estimatedBalance ||
                       answers["superannuation"]?.["balance"] ||
                       (profile?.superBalance ? `$${profile.superBalance.toLocaleString()}` : "");
  const dependants   = sarah?.familyAndDependants.numberOfDependants || "";
  const partnerName  = sarah?.familyAndDependants.partnerName || "";
  const relationship = sarah?.familyAndDependants.relationshipStatus || "";
  const homeValue    = sarah?.assets.ownerOccupiedPropertyValue || "";
  const savings      = sarah?.assets.savingsAndCash || "";
  const shares       = sarah?.assets.sharesAndInvestments || "";
  const riskPref     = sarah?.goalsAndObjectives.investmentRiskPreference || "Balanced";
  const tfn          = profile?.tfn || "";
  const today        = new Date().toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
  });

  const adviserBlock = {
    title: "Adviser Details",
    fields: [
      { label: "Adviser Name",   value: "Brad Lonergan" },
      { label: "AFSL Number",    value: "234665" },
      { label: "Licence Name",   value: "Newcastle Financial Services" },
      { label: "Adviser Email",  value: "brad@bmkfs.com.au" },
      { label: "Date Prepared",  value: today },
    ],
  };

  const provider = PROVIDERS[definition.provider];
  const providerSubtitle =
    `${provider.name} — ${provider.team} (${provider.website})`;

  const applicantSection = {
    title: "Applicant Details",
    fields: [
      { label: "Full Name",            value: fullName },
      { label: "Date of Birth",        value: dob },
      { label: "Relationship Status",  value: relationship },
      { label: "Partner Name",         value: partnerName },
      { label: "Dependants",           value: dependants },
      { label: "Residential Address",  value: address, fullWidth: true },
      { label: "Email",                value: email },
      { label: "Mobile",               value: mobile },
    ],
  };

  const superSection = {
    title: "Superannuation Details",
    fields: [
      { label: "Existing Super Fund",     value: superFund },
      { label: "Existing Member Number",  value: memberNo },
      { label: "Estimated Balance",       value: superBal },
      { label: "Tax File Number",         value: tfn },
    ],
  };

  const employmentSection = {
    title: "Employment & Income",
    fields: [
      { label: "Employer Name",   value: employer },
      { label: "Occupation",      value: occupation },
      { label: "Annual Income",   value: incomeStr },
    ],
  };

  const baseTitle = definition.name;

  // Per-form custom sections layered on top of the shared blocks.
  let middleSections: SectionSpec[] = [];

  switch (formId) {
    case "mlc-super":
      middleSections = [
        superSection,
        employmentSection,
        {
          title: "Investment Selection",
          fields: [
            { label: "Investment Option",      value: "Balanced — MLC Balanced" },
            { label: "Risk Profile",           value: riskPref },
            { label: "Rollover From Fund",     value: superFund },
            { label: "Existing Member Number", value: memberNo },
          ],
        },
      ];
      break;

    case "mlc-ttr-super":
    case "mlc-ttr-income-stream":
      middleSections = [
        superSection,
        employmentSection,
        {
          title: "Transition to Retirement Plan",
          fields: [
            { label: "Commencement Balance",   value: superBal },
            { label: "Pension Frequency",      value: "Fortnightly" },
            { label: "Investment Option",      value: "Balanced — MLC Balanced" },
            { label: "Risk Profile",           value: riskPref },
          ],
        },
      ];
      break;

    case "aia-life":
      middleSections = [
        employmentSection,
        {
          title: "Life Cover Requested",
          fields: [
            { label: "Sum Insured",          value: "$1,200,000" },
            { label: "Cover Structure",      value: "Standalone" },
            { label: "Beneficiary",          value: partnerName || "Estate" },
          ],
        },
      ];
      break;

    case "aia-tpd":
      middleSections = [
        employmentSection,
        {
          title: "TPD Cover Requested",
          fields: [
            { label: "Sum Insured",          value: "$1,000,000" },
            { label: "Definition",           value: "Any Occupation" },
            { label: "Structure",            value: "Linked to Life Cover" },
          ],
        },
      ];
      break;

    case "aia-ip": {
      const incomeNum =
        Number((incomeStr || "").replace(/[^0-9.]/g, "")) ||
        profile?.annualIncome ||
        100000;
      const ipBenefit = `$${Math.round((incomeNum * 0.75) / 12).toLocaleString()} per month`;
      middleSections = [
        employmentSection,
        {
          title: "Income Protection Cover",
          fields: [
            { label: "Monthly Benefit",  value: ipBenefit },
            { label: "Waiting Period",   value: "90 Days" },
            { label: "Benefit Period",   value: "To Age 65" },
            { label: "Cover Type",       value: "Agreed Value" },
          ],
        },
      ];
      break;
    }

    case "centrelink-aged-care-fee":
      middleSections = [
        {
          title: "Assets",
          fields: [
            { label: "Owner Occupied Home",   value: homeValue },
            { label: "Savings and Cash",      value: savings },
            { label: "Shares and Investments", value: shares },
            { label: "Superannuation Balance", value: superBal },
          ],
        },
      ];
      break;

    case "amp-aged-care-pension":
      middleSections = [
        superSection,
        {
          title: "Pension Setup",
          fields: [
            { label: "Pension Frequency",   value: "Fortnightly" },
            { label: "Investment Profile", value: "Conservative" },
          ],
        },
      ];
      break;

    case "estate-loa":
      middleSections = [
        {
          title: "Family and Dependants",
          fields: [
            { label: "Relationship Status",  value: relationship },
            { label: "Partner Name",         value: partnerName },
            { label: "Number of Dependants", value: dependants },
          ],
        },
        {
          title: "Estate Planning Notes",
          fields: [
            { label: "Will in Place",                value: "" },
            { label: "Power of Attorney",            value: "" },
            { label: "Beneficiary Nominations",      value: "" },
          ],
        },
      ];
      break;

    case "beneficiary-nomination":
      middleSections = [
        superSection,
        {
          title: "Nominated Beneficiaries",
          fields: [
            { label: "Beneficiary 1",  value: partnerName || "" },
            { label: "Allocation 1",   value: "100%" },
            { label: "Beneficiary 2",  value: "" },
            { label: "Allocation 2",   value: "" },
          ],
        },
      ];
      break;

    case "ato-rollover":
      middleSections = [
        superSection,
        {
          title: "Rollover Instruction",
          fields: [
            { label: "From Fund",         value: superFund },
            { label: "From Member Number", value: memberNo },
            { label: "To Fund",           value: "MLC MasterKey Super Fundamentals" },
            { label: "Rollover Amount",   value: "Full Balance" },
          ],
        },
      ];
      break;

    case "amp-mynorth":
    case "bt-panorama":
      middleSections = [
        {
          title: "Investment Account Setup",
          fields: [
            { label: "Initial Investment",  value: savings || superBal },
            { label: "Investment Profile",  value: riskPref },
            { label: "Source of Funds",     value: "Savings / Rollover" },
            { label: "Rollover From Fund",  value: superFund || "AustralianSuper" },
          ],
        },
      ];
      break;

    case "mlc-investment":
    case "cfs-firstchoice":
      middleSections = [
        {
          title: "Investment Application",
          fields: [
            { label: "Initial Investment",  value: savings },
            { label: "Risk Profile",        value: riskPref },
            { label: "Additional Shares",   value: shares },
            { label: "Annual Income",       value: incomeStr },
          ],
        },
      ];
      break;
  }

  return {
    formTitle: baseTitle,
    providerName: provider.name,
    providerSubtitle,
    clientName: fullName,
    sections: [applicantSection, ...middleSections, adviserBlock],
  };
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
  await ensureFactFindsHydrated();
  const { clientId, formId } = params;

  const validIds: FormId[] = FORMS.map((f) => f.id);
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
