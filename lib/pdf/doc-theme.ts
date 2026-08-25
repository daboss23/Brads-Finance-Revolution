// Shared visual system for every PDF the platform produces.
//
// One brand: Newcastle Financial Services navy-and-gold, private-banking
// register. Both the fact find and the Statement of Advice are built from
// this same CSS so every document the client receives looks like it came
// from the same premium practice.

import { LOGO_SVG } from "../export-logo";

export const BRAND_CSS = /* css */ `
  :root {
    --navy: #0E2444;
    --navy-deep: #081a33;
    --ink: #16202e;
    --body: #38424f;
    --muted: #737e8c;
    --gold: #b8922e;
    --gold-bright: #cbA24a;
    --gold-soft: #f3ecd8;
    --line: #e6e2d6;
    --paper: #ffffff;
    --tint: #f7f5ef;
    --good: #2e6b4f;
    --amber: #b3801f;
    --amber-bg: #fbf3df;
    --good-bg: #e8f1ea;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: var(--body);
    font-size: 10pt;
    line-height: 1.55;
    background: var(--paper);
  }
  .page { padding: 20mm 18mm 16mm; page-break-after: always; }
  .page:last-child { page-break-after: auto; }

  /* Cover */
  .cover {
    background:
      radial-gradient(120% 80% at 80% 0%, rgba(200,168,74,0.16), transparent 55%),
      linear-gradient(160deg, var(--navy) 0%, var(--navy-deep) 100%);
    color: #eef1f6;
    height: 274mm;
    padding: 26mm 22mm 20mm;
    display: flex; flex-direction: column;
    page-break-after: always;
  }
  .cover .logo { width: 30mm; height: 30mm; }
  .cover .brand {
    margin-top: 7mm;
    font-size: 8.5pt; letter-spacing: 0.34em; text-transform: uppercase;
    color: var(--gold-bright);
  }
  .cover .rule { height: 1px; margin: 7mm 0 auto;
    background: linear-gradient(90deg, var(--gold), transparent 70%); }
  .cover .doctype {
    font-size: 8.5pt; letter-spacing: 0.34em; text-transform: uppercase;
    color: var(--gold-bright); margin-bottom: 5mm;
  }
  .cover h1 {
    font-size: 30pt; font-weight: 600; line-height: 1.12;
    color: #ffffff; max-width: 150mm; letter-spacing: -0.01em;
  }
  .cover .client {
    margin-top: 6mm; font-size: 14pt; color: #cdd4de; font-weight: 300;
  }
  .cover .meta {
    margin-top: 14mm; display: grid; grid-template-columns: 1fr 1fr; gap: 6mm 14mm;
    border-top: 1px solid rgba(200,168,74,0.32); padding-top: 8mm;
  }
  .cover .meta .k { font-size: 7.5pt; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--gold-bright); margin-bottom: 1.5mm; }
  .cover .meta .v { font-size: 10.5pt; color: #e7ebf1; }

  /* Running header on content pages */
  .rhead { display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1.5px solid var(--gold); padding-bottom: 4mm; margin-bottom: 8mm; }
  .rhead .rh-logo { width: 11mm; height: 11mm; }
  .rhead .rh-title { font-size: 8pt; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); text-align: right; }
  .rhead .rh-title strong { display: block; color: var(--ink); font-size: 9.5pt; letter-spacing: 0.04em; margin-top: 1mm; }

  /* Sections */
  .sec { margin-bottom: 9mm; page-break-inside: avoid; }
  .sec-head { display: flex; align-items: baseline; gap: 4mm; margin-bottom: 4mm; }
  .sec-num { font-size: 9pt; font-weight: 700; color: var(--gold);
    font-variant-numeric: tabular-nums; min-width: 8mm; }
  .sec-title { font-size: 14pt; font-weight: 600; color: var(--ink); letter-spacing: -0.01em; }
  .sec-rule { height: 1px; background: var(--line); margin: 3mm 0 4mm; }
  .sec p { margin-bottom: 2.5mm; }
  .sec p:last-child { margin-bottom: 0; }

  .eyebrow { font-size: 7.5pt; letter-spacing: 0.26em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 3mm; }
  h2.block { font-size: 16pt; font-weight: 600; color: var(--ink); margin-bottom: 5mm; letter-spacing: -0.01em; }

  /* Data grid — fact find fields */
  .fieldgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--line); border-radius: 3mm; overflow: hidden; }
  .fieldgrid.one { grid-template-columns: 1fr; }
  .field { padding: 3mm 4mm; border-bottom: 1px solid var(--line); border-right: 1px solid var(--line); }
  .field:nth-child(2n) { border-right: none; }
  .field .fl { font-size: 7.5pt; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 1mm; }
  .field .fv { font-size: 10.5pt; color: var(--ink); }
  .field .fv.empty { color: #b7bcc4; font-style: italic; }

  /* Pills */
  .pill { display: inline-block; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; padding: 1mm 2.5mm; border-radius: 1.4mm; }
  .pill.good { background: var(--good-bg); color: var(--good); }
  .pill.warn { background: var(--amber-bg); color: var(--amber); }

  /* Completion meter */
  .meter { height: 2.5mm; background: var(--line); border-radius: 2mm; overflow: hidden; margin-top: 2mm; }
  .meter > span { display: block; height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-bright)); }

  /* Callout */
  .callout { background: var(--gold-soft); border-left: 2.5px solid var(--gold);
    padding: 4mm 5mm; border-radius: 0 2mm 2mm 0; margin: 4mm 0; page-break-inside: avoid; }
  .callout .ct { font-size: 7.5pt; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); font-weight: 700; margin-bottom: 1.5mm; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 9pt; }
  th { text-align: left; font-size: 7.5pt; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--gold); border-bottom: 1.5px solid var(--gold); padding: 0 3mm 2mm 0; }
  td { border-bottom: 1px solid var(--line); padding: 2.4mm 3mm 2.4mm 0; vertical-align: top; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }

  .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin: 4mm 0; }
  .stat { border: 1px solid var(--line); border-radius: 3mm; padding: 4mm; }
  .stat .sk { font-size: 7.5pt; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
  .stat .sv { font-size: 18pt; font-weight: 600; color: var(--ink); margin-top: 1.5mm; font-variant-numeric: tabular-nums; }

  .note { font-size: 8pt; color: var(--muted); line-height: 1.5; margin-top: 6mm; padding-top: 4mm; border-top: 1px solid var(--line); }
`;

export function logoDataAttr(): string {
  // Inline SVG renders crisply and needs no network fetch under the CSP.
  return `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;
}

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function docShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html lang="en-AU"><head><meta charset="utf-8"><title>${esc(
    title,
  )}</title><style>${BRAND_CSS}</style></head><body>${bodyHtml}</body></html>`;
}
