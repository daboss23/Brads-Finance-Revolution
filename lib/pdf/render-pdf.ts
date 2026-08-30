

// HTML → PDF rendering through headless Chromium.
//
// On Vercel this uses @sparticuz/chromium (a lambda-sized Chromium build);
// locally it finds the Playwright-managed Chromium or a system Chrome.
// Rendering documents from real HTML/CSS is what lets the exports carry
// full typography, colour, and layout instead of hand-drawn pdf-lib boxes.

import { existsSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";

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
      // A dedicated throwaway profile is required: when Chrome is already
      // open with the default profile, a new launch hands off to the running
      // instance and exits without printing the WS endpoint, which times out
      // puppeteer. Isolated profile + first-run flags make launches reliable.
      userDataDir: mkdtempSync(path.join(tmpdir(), "bmk-pdf-chrome-")),
      timeout: 60000,
      protocolTimeout: 120000,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-first-run",
        "--no-default-browser-check",
      ],
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
  html: string;
  footerLeft: string; // shown on every page footer, left side
}

export async function renderPdf({ html, footerLeft }: PdfRenderOptions): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:7px;color:#8C7326;display:flex;justify-content:space-between;padding:0 14mm;">
          <span>${footerLeft}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
      margin: { top: "0", bottom: "14mm", left: "0", right: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
