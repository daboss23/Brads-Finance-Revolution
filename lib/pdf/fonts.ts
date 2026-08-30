// Typefaces embedded into every generated document.
//
// The PDF renderer hands Chromium a bare HTML string (page.setContent), so
// there is no origin for it to resolve font URLs against. Every face has to
// travel inside the CSS as a data URI or Chromium silently falls back to a
// default sans and the documents lose their voice.
//
// Files are read from disk once per process and cached. They are traced into
// the Lambda bundle by the outputFileTracingIncludes entry in next.config.mjs
// for each route that renders a PDF.

import { readFileSync } from "fs";
import path from "path";

const FONT_DIR = path.join(process.cwd(), "lib/pdf/fonts");

function dataUri(file: string, mime: string): string {
  const buf = readFileSync(path.join(FONT_DIR, file));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

let cached: string | null = null;

/**
 * @font-face declarations for the document typefaces.
 *
 * Source Serif 4 carries body copy: an open-licence transitional serif drawn
 * for continuous reading on paper, which is what an advice document is. Geist
 * — the same face the app itself uses — carries labels, figures and covers, so
 * the documents and the platform read as one practice.
 */
export function fontFaceCss(): string {
  if (cached) return cached;

  const serif400 = dataUri("source-serif-4-latin-400-normal.woff2", "font/woff2");
  const serif600 = dataUri("source-serif-4-latin-600-normal.woff2", "font/woff2");
  const serifIt = dataUri("source-serif-4-latin-400-italic.woff2", "font/woff2");
  const geist400 = dataUri("Geist-Regular.woff2", "font/woff2");
  const geist500 = dataUri("Geist-Medium.woff2", "font/woff2");
  const geist600 = dataUri("Geist-SemiBold.woff2", "font/woff2");

  cached = /* css */ `
    @font-face {
      font-family: "Source Serif 4";
      font-style: normal; font-weight: 400; font-display: block;
      src: url(${serif400}) format("woff2");
    }
    @font-face {
      font-family: "Source Serif 4";
      font-style: normal; font-weight: 600; font-display: block;
      src: url(${serif600}) format("woff2");
    }
    @font-face {
      font-family: "Source Serif 4";
      font-style: italic; font-weight: 400; font-display: block;
      src: url(${serifIt}) format("woff2");
    }
    @font-face {
      font-family: "Geist";
      font-style: normal; font-weight: 400; font-display: block;
      src: url(${geist400}) format("woff2");
    }
    @font-face {
      font-family: "Geist";
      font-style: normal; font-weight: 500; font-display: block;
      src: url(${geist500}) format("woff2");
    }
    @font-face {
      font-family: "Geist";
      font-style: normal; font-weight: 600; font-display: block;
      src: url(${geist600}) format("woff2");
    }
  `;
  return cached;
}
