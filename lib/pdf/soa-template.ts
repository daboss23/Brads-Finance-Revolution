// Statement of Advice — branded HTML for PDF rendering.

import type { SoaDocument } from "../soa/soa-template";
import { docShell, esc, logoDataAttr } from "./doc-theme";

// Body text arrives as plain paragraphs (Brad's voice, no markdown).
function paragraphs(body: string): string {
  return body
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
}

export function buildSoaHtml(doc: SoaDocument): string {
  const today = new Date(doc.generatedAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cover = `
    <section class="cover">
      <img class="logo" src="${logoDataAttr()}" alt="" />
      <div class="brand">Newcastle Financial Services</div>
      <div class="rule"></div>
      <div class="doctype">Personal Advice Document</div>
      <h1>Statement of Advice</h1>
      <div class="client">Prepared for ${esc(doc.clientName)}</div>
      <div class="meta">
        <div><div class="k">Adviser</div><div class="v">Brad Lonergan</div></div>
        <div><div class="k">Date prepared</div><div class="v">${today}</div></div>
        <div><div class="k">Licensee</div><div class="v">Charter Financial Planning · AFSL 234665</div></div>
        <div><div class="k">Compliance score</div><div class="v">${doc.complianceScore} / 100</div></div>
      </div>
    </section>`;

  // Contents page
  const toc = `
    <section class="page">
      <div class="rhead">
        <img class="rh-logo" src="${logoDataAttr()}" alt="" />
        <div class="rh-title">Statement of Advice<strong>${esc(doc.clientName)}</strong></div>
      </div>
      <div class="eyebrow">Contents</div>
      <h2 class="block">What this document covers</h2>
      <table>
        <tr><th style="width:12mm">#</th><th>Section</th><th class="num">Status</th></tr>
        ${doc.sections
          .map(
            (s) => `<tr>
              <td class="num" style="color:var(--gold);font-weight:700">${String(s.number).padStart(2, "0")}</td>
              <td style="color:var(--ink)">${esc(s.title)}</td>
              <td class="num"><span class="pill ${s.needsReview ? "warn" : "good"}">${s.needsReview ? "In review" : "Confirmed"}</span></td>
            </tr>`,
          )
          .join("")}
      </table>
      <div class="callout">
        <div class="ct">About this advice</div>
        This Statement of Advice sets out the strategy recommended for
        ${esc(doc.clientName.split(" ")[0])}, why it is in their best interests,
        and what happens next. It should be read in full. Please raise any
        questions with Brad before acting on the recommendations.
      </div>
    </section>`;

  const sections = doc.sections
    .map(
      (s) => `
      <div class="sec">
        <div class="sec-head">
          <span class="sec-num">${String(s.number).padStart(2, "0")}</span>
          <span class="sec-title">${esc(s.title)}</span>
        </div>
        <div class="sec-rule"></div>
        ${paragraphs(s.body)}
        ${
          s.comment
            ? `<div class="callout"><div class="ct">Adviser note</div>${esc(s.comment)}</div>`
            : ""
        }
      </div>`,
    )
    .join("");

  // Projection table (optional)
  const projection =
    doc.projections && doc.projections.length
      ? `
      <div class="sec">
        <div class="sec-head">
          <span class="sec-num">★</span>
          <span class="sec-title">Projected Outcome</span>
        </div>
        <div class="sec-rule"></div>
        <p>The table below compares your current trajectory with the recommended
        strategy over time. Figures are projections based on the assumptions in
        this document and are not guaranteed.</p>
        <table>
          <tr><th>Age</th><th class="num">Current path</th><th class="num">Recommended</th><th class="num">Difference</th></tr>
          ${doc.projections
            .map((p) => {
              const diff = p.recommended - p.current;
              const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");
              return `<tr>
                <td>${p.age}</td>
                <td class="num">${fmt(p.current)}</td>
                <td class="num" style="color:var(--ink);font-weight:600">${fmt(p.recommended)}</td>
                <td class="num" style="color:var(--good)">+${fmt(diff)}</td>
              </tr>`;
            })
            .join("")}
        </table>
      </div>`
      : "";

  const marketNote =
    doc.marketSnapshots && doc.marketSnapshots.length
      ? `<div class="sec">
          <div class="eyebrow">Market context at time of advice</div>
          <table>
            <tr><th>Indicator</th><th>Value</th><th>Source</th></tr>
            ${doc.marketSnapshots
              .map(
                (m) => `<tr><td style="color:var(--ink)">${esc(m.label)}</td><td>${esc(m.value)}</td><td style="color:var(--muted)">${esc(m.source)}</td></tr>`,
              )
              .join("")}
          </table>
        </div>`
      : "";

  const content = `
    <section class="page">
      <div class="rhead">
        <img class="rh-logo" src="${logoDataAttr()}" alt="" />
        <div class="rh-title">Statement of Advice<strong>${esc(doc.clientName)}</strong></div>
      </div>
      ${sections}
      ${projection}
      ${marketNote}
      <div class="note">
        This Statement of Advice was prepared by Brad Lonergan of Newcastle
        Financial Services (BMK Financial Services), authorised representative
        of Charter Financial Planning Limited, AFSL 234665. It is based on your
        relevant personal circumstances as disclosed. Before acting, consider
        whether the advice is appropriate given any change in circumstances.
        Compliance reference ${esc(doc.complianceCertificateId)}. Generated by
        the BMK CRM advice engine, ${today}.
      </div>
    </section>`;

  return docShell(`Statement of Advice — ${doc.clientName}`, cover + toc + content);
}
