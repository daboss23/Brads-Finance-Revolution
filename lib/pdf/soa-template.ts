// Statement of Advice — branded HTML for PDF rendering.
//
// Returns the cover and the body separately: the cover is printed edge to
// edge with no running header, the body carries the header and page numbers.

import type { SoaDocument } from "../soa/soa-template";
import { coverShell, docShell, esc, logoDataAttr } from "./doc-theme";

// Body text arrives as plain paragraphs (Brad's voice, no markdown).
function paragraphs(body: string): string {
  return body
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
}

export interface SoaHtml {
  cover: string;
  body: string;
}

export function buildSoaHtml(doc: SoaDocument): SoaHtml {
  const today = new Date(doc.generatedAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const firstName = doc.clientName.split(" ")[0];

  // The "cover" section holds the confidentiality preamble. It belongs on the
  // contents page as prose, not as a numbered chapter the client reads.
  const coverSection = doc.sections.find((s) => s.id === "cover");
  const bodySections = doc.sections.filter((s) => s.id !== "cover");

  const cover = coverShell(
    `Statement of Advice — ${doc.clientName}`,
    `<section class="cover">
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
        <div><div class="k">Prepared under</div><div class="v">AFSL 234665</div></div>
      </div>
    </section>`,
  );

  const toc = `
    <section class="page">
      <div class="eyebrow">Contents</div>
      <h2 class="block">What this document covers</h2>
      <table class="toc">
        ${bodySections
          .map(
            (s, i) => `<tr>
              <td class="tnum">${String(i + 1).padStart(2, "0")}</td>
              <td class="ttitle">${esc(s.title)}</td>
            </tr>`,
          )
          .join("")}
      </table>
      <div class="callout">
        <div class="ct">About this advice</div>
        This Statement of Advice sets out the strategy recommended for
        ${esc(firstName)}, why it is in their best interests, and what happens
        next. It should be read in full. Please raise any questions with Brad
        before acting on the recommendations.
      </div>
      ${
        coverSection
          ? `<div class="preamble">${paragraphs(coverSection.body)}</div>`
          : ""
      }
    </section>`;

  const sections = bodySections
    .map(
      (s, i) => `
      <div class="sec">
        <div class="sec-head">
          <span class="sec-num">${String(i + 1).padStart(2, "0")}</span>
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

  const projection =
    doc.projections && doc.projections.length
      ? `
      <div class="sec">
        <div class="sec-head">
          <span class="sec-num">◆</span>
          <span class="sec-title">Projected Outcome</span>
        </div>
        <div class="sec-rule"></div>
        <p>The table below compares your current trajectory with the recommended
        strategy over time. Figures are projections based on the assumptions in
        this document and are not guaranteed.</p>
        <table>
          <thead><tr><th>Age</th><th class="num">Current path</th><th class="num">Recommended</th><th class="num">Difference</th></tr></thead>
          <tbody>
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
          </tbody>
        </table>
      </div>`
      : "";

  const marketNote =
    doc.marketSnapshots && doc.marketSnapshots.length
      ? `<div class="sec">
          <div class="eyebrow">Market context at time of advice</div>
          <table>
            <thead><tr><th>Indicator</th><th>Value</th><th>Source</th></tr></thead>
            <tbody>
            ${doc.marketSnapshots
              .map(
                (m) => `<tr><td style="color:var(--ink)">${esc(m.label)}</td><td>${esc(m.value)}</td><td style="color:var(--muted)">${esc(m.source)}</td></tr>`,
              )
              .join("")}
            </tbody>
          </table>
        </div>`
      : "";

  const body = docShell(
    `Statement of Advice — ${doc.clientName}`,
    `${toc}
    <section class="page">
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
    </section>`,
  );

  return { cover, body };
}
