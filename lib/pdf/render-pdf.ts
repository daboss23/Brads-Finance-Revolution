// HTML → PDF rendering through headless Chromium.
//
// On Vercel this uses @sparticuz/chromium (a lambda-sized Chromium build);
// locally it finds the Playwright-managed Chromium or a system Chrome.
// Rendering documents from real HTML/CSS is what lets the exports carry
// full typography, colour, and layout instead of hand-drawn pdf-lib boxes.

import { existsSync } from "fs";

const LOCAL_CHROME_CANDIDATES = [
  process.env.LOCAL_CHROME_PATH ?? "",
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium/chrome-linux/chrome",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

async function launchBrowser() {
  const puppeteer = await import("puppeteer-core");

  const local = LOCAL_CHROME_CANDIDATES.find((p) => p && existsSync(p));
  if (local) {
    return puppeteer.launch({
      executablePath: local,
      headless: true,
      args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader"],
    });
  }

  // Vercel / AWS Lambda
  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: true,
    args: chromium.args,
  });
}

export interface PdfRenderOptions {
  /**
   * Cover page markup, rendered edge to edge with no header, footer or page
   * number — the way a printed advice document opens.
   */
  coverHtml?: string;
  /** Body markup. Every page carries the running header and footer. */
  html: string;
  /** Small caps line on the left of the running header (the document type). */
  headerLeft: string;
  /** Emphasised line on the right of the running header (usually the client). */
  headerRight: string;
  /** Shown on every body page footer, left side. */
  footerLeft: string;
}

// Chromium draws header/footer templates in the page margin box, in an
// isolated document: no stylesheet, no external assets, and font sizes reset.
// Everything therefore has to be inline and absolutely sized.
function runningHeader(left: string, right: string): string {
  return `
    <div style="width:100%;box-sizing:border-box;padding:9mm 18mm 0;font-family:Helvetica,Arial,sans-serif;">
      <div style="display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #b8922e;padding-bottom:2.5mm;">
        <span style="font-size:6.5px;letter-spacing:2.2px;text-transform:uppercase;color:#b8922e;">${left}</span>
        <span style="font-size:7px;letter-spacing:0.6px;text-transform:uppercase;color:#0E2444;font-weight:bold;">${right}</span>
      </div>
    </div>`;
}

function pageFooter(left: string): string {
  return `
    <div style="width:100%;box-sizing:border-box;font-family:Helvetica,Arial,sans-serif;font-size:6.5px;color:#8C7326;display:flex;justify-content:space-between;padding:0 18mm;">
      <span>${left}</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>`;
}

export async function renderPdf({
  coverHtml,
  html,
  headerLeft,
  headerRight,
  footerLeft,
}: PdfRenderOptions): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();

    const bodyPdf = await (async () => {
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      return page.pdf({
        format: "a4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: runningHeader(headerLeft, headerRight),
        footerTemplate: pageFooter(footerLeft),
        // Top margin has to clear the running header drawn above.
        margin: { top: "26mm", bottom: "16mm", left: "0", right: "0" },
      });
    })();

    if (!coverHtml) return Buffer.from(bodyPdf);

    const coverPdf = await (async () => {
      await page.setContent(coverHtml, { waitUntil: "domcontentloaded" });
      return page.pdf({
        format: "a4",
        printBackground: true,
        displayHeaderFooter: false,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
      });
    })();

    // Cover and body are laid out under different margin rules, so they are
    // rendered separately and stitched into one file.
    const { PDFDocument } = await import("pdf-lib");
    const out = await PDFDocument.create();
    for (const part of [coverPdf, bodyPdf]) {
      const src = await PDFDocument.load(part);
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
    }
    return Buffer.from(await out.save());
  } finally {
    await browser.close();
  }
}
