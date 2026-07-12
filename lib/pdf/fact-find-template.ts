// Fact Find Summary — branded HTML for PDF rendering.

import type { SarahFactFind } from "../sarah-fact-find-schema";
import { docShell, esc, logoDataAttr } from "./doc-theme";

interface FactFindDocInput {
  clientName: string;
  data: SarahFactFind;
  preparedFor?: string;
}

type Field = [label: string, value: string];

function fieldGrid(fields: Field[]): string {
  const cells = fields
    .map(
      ([label, value]) => `
      <div class="field">
        <div class="fl">${esc(label)}</div>
        <div class="fv ${value ? "" : "empty"}">${value ? esc(value) : "Not provided"}</div>
      </div>`,
    )
    .join("");
  // Pad to an even number so the right border logic stays clean.
  const pad = fields.length % 2 === 1 ? '<div class="field"></div>' : "";
  return `<div class="fieldgrid">${cells}${pad}</div>`;
}

function section(num: number, title: string, fields: Field[]): string {
  const filled = fields.filter(([, v]) => v).length;
  const complete = filled === fields.length;
  return `
    <div class="sec">
      <div class="sec-head">
        <span class="sec-num">${String(num).padStart(2, "0")}</span>
        <span class="sec-title">${esc(title)}</span>
        <span style="margin-left:auto" class="pill ${complete ? "good" : "warn"}">
          ${complete ? "Complete" : `${filled} of ${fields.length}`}
        </span>
      </div>
      ${fieldGrid(fields)}
    </div>`;
}

export function buildFactFindHtml(input: FactFindDocInput): string {
  const d = input.data;
  const today = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const pct = Math.round(d.completionPercentage ?? 0);

  const cover = `
    <section class="cover">
      <img class="logo" src="${logoDataAttr()}" alt="" />
      <div class="brand">Newcastle Financial Services</div>
      <div class="rule"></div>
      <div class="doctype">Client Discovery</div>
      <h1>Financial Fact Find</h1>
      <div class="client">${esc(input.clientName)}</div>
      <div class="meta">
        <div><div class="k">Prepared for</div><div class="v">${esc(input.preparedFor ?? "Brad Lonergan")}</div></div>
        <div><div class="k">Date prepared</div><div class="v">${today}</div></div>
        <div><div class="k">Discovery completion</div><div class="v">${pct}%</div></div>
        <div><div class="k">Source</div><div class="v">Sarah — Financial Discovery Session</div></div>
      </div>
    </section>`;

  const content = `
    <section class="page">
      <div class="rhead">
        <img class="rh-logo" src="${logoDataAttr()}" alt="" />
        <div class="rh-title">Financial Fact Find<strong>${esc(input.clientName)}</strong></div>
      </div>

      <div class="callout">
        <div class="ct">Discovery Summary</div>
        This fact find captures the financial position gathered during
        ${esc(input.clientName.split(" ")[0])}'s discovery session. It is the
        foundation for the advice Brad will prepare. Sections marked in amber
        need confirming at the meeting.
        <div class="meter"><span style="width:${pct}%"></span></div>
      </div>

      ${section(1, "Personal Details", [
        ["Full name", d.personalDetails.fullName],
        ["Date of birth", d.personalDetails.dateOfBirth],
        ["Residential address", d.personalDetails.address],
        ["Time at address", d.personalDetails.timeAtAddress],
        ["Country of birth", d.personalDetails.countryOfBirth],
      ])}

      ${section(2, "Contact Information", [
        ["Mobile", d.contactInformation.mobile],
        ["Home phone", d.contactInformation.homePhone],
        ["Email", d.contactInformation.email],
        ["Preferred contact", d.contactInformation.preferredContact],
        ["Best time to contact", d.contactInformation.bestTimeToContact],
      ])}

      ${section(3, "Family & Dependants", [
        ["Relationship status", d.familyAndDependants.relationshipStatus],
        ["Partner name", d.familyAndDependants.partnerName],
        ["Partner date of birth", d.familyAndDependants.partnerDOB],
        ["Number of dependants", d.familyAndDependants.numberOfDependants],
        ["Ages of dependants", d.familyAndDependants.agesOfDependants],
      ])}

      ${section(4, "Employment & Income", [
        ["Employment status", d.employmentAndIncome.employmentStatus],
        ["Employer", d.employmentAndIncome.employerName],
        ["Occupation", d.employmentAndIncome.occupation],
        ["Annual gross income", d.employmentAndIncome.annualGrossIncome],
        ["Other income sources", d.employmentAndIncome.otherIncomeSources],
      ])}
    </section>

    <section class="page">
      <div class="rhead">
        <img class="rh-logo" src="${logoDataAttr()}" alt="" />
        <div class="rh-title">Financial Fact Find<strong>${esc(input.clientName)}</strong></div>
      </div>

      ${section(5, "Assets", [
        ["Owner-occupied property", d.assets.ownerOccupiedPropertyValue],
        ["Investment property", d.assets.investmentPropertyValue],
        ["Savings & cash", d.assets.savingsAndCash],
        ["Shares & investments", d.assets.sharesAndInvestments],
        ["Vehicles", d.assets.vehicles],
      ])}

      ${section(6, "Liabilities", [
        ["Home mortgage", d.liabilities.homeMortgage],
        ["Investment loans", d.liabilities.investmentLoans],
        ["Personal loans", d.liabilities.personalLoans],
        ["Credit card limits", d.liabilities.creditCardLimits],
        ["Other liabilities", d.liabilities.otherLiabilities],
      ])}

      ${section(7, "Monthly Expenses", [
        ["Housing costs", d.expenses.housingCosts],
        ["Groceries", d.expenses.groceries],
        ["Transport", d.expenses.transport],
        ["Education", d.expenses.education],
        ["Lifestyle & entertainment", d.expenses.lifestyleAndEntertainment],
      ])}

      ${section(8, "Superannuation", [
        ["Fund name", d.superannuation.fundName],
        ["Member number", d.superannuation.memberNumber],
        ["Estimated balance", d.superannuation.estimatedBalance],
        ["Employer contribution rate", d.superannuation.employerContributionRate],
        ["Personal contributions", d.superannuation.personalContributions],
      ])}
    </section>

    <section class="page">
      <div class="rhead">
        <img class="rh-logo" src="${logoDataAttr()}" alt="" />
        <div class="rh-title">Financial Fact Find<strong>${esc(input.clientName)}</strong></div>
      </div>

      ${section(9, "Insurance", [
        ["Life insurance sum insured", d.insurance.lifeInsuranceSumInsured],
        ["Life insurance provider", d.insurance.lifeInsuranceProvider],
        ["Income protection benefit", d.insurance.incomeProtectionMonthlyBenefit],
        ["TPD cover", d.insurance.tpdCover],
        ["Health insurance provider", d.insurance.healthInsuranceProvider],
      ])}

      ${section(10, "Goals & Objectives", [
        ["Primary financial goals", d.goalsAndObjectives.primaryFinancialGoals],
        ["Target retirement age", d.goalsAndObjectives.targetRetirementAge],
        ["Desired retirement income", d.goalsAndObjectives.desiredRetirementIncome],
        ["Investment risk preference", d.goalsAndObjectives.investmentRiskPreference],
        ["Other considerations", d.goalsAndObjectives.otherConsiderations],
      ])}

      <div class="note">
        This document was generated by the BMK CRM platform for Newcastle
        Financial Services from information collected during the client's
        Financial Discovery Session. It is a discovery record only and does
        not constitute financial advice. Figures are indicative and to be
        confirmed with the client. Handled in accordance with the practice's
        privacy obligations under the Privacy Act 1988 (Cth).
      </div>
    </section>`;

  return docShell(`Fact Find — ${input.clientName}`, cover + content);
}
