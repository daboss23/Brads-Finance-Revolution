// Static SVG string of the Newcastle emblem — used in PDF and Word exports.
// Matches the React component in components/logo/newcastle-logo.tsx exactly,
// converted to plain SVG attributes (class → clip-path, no React JSX).
export const LOGO_SVG = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="nfs-clip"><circle cx="100" cy="100" r="97"/></clipPath>
  </defs>
  <circle cx="100" cy="100" r="97" fill="#0E2444"/>
  <path d="M 0 200 L 0 128 C 16 116 38 119 60 128 C 78 134 93 144 108 150 C 121 156 135 151 145 146 C 128 174 93 200 0 200 Z" fill="#C8A84A" clip-path="url(#nfs-clip)"/>
  <path d="M 114 200 C 130 158 162 140 190 132 L 200 128 L 200 200 Z" fill="#2872AC" clip-path="url(#nfs-clip)"/>
  <path d="M 154 200 C 167 168 184 156 200 151 L 200 200 Z" fill="#4D9FD8" clip-path="url(#nfs-clip)" opacity="0.6"/>
  <path d="M -4 86 C 10 77 30 78 54 79 C 68 80 78 78 85 75 C 90 73 93 77 93 82 L 93 96 C 74 98 50 97 26 95 C 13 94 0 93 -4 93 Z" fill="white" clip-path="url(#nfs-clip)" opacity="0.94"/>
  <rect x="34" y="60" width="13" height="22" fill="white" clip-path="url(#nfs-clip)"/>
  <rect x="31" y="54" width="5"  height="9"  fill="white" clip-path="url(#nfs-clip)"/>
  <rect x="38" y="54" width="5"  height="9"  fill="white" clip-path="url(#nfs-clip)"/>
  <rect x="45" y="54" width="5"  height="9"  fill="white" clip-path="url(#nfs-clip)"/>
  <rect x="49" y="69" width="22" height="14" fill="white" clip-path="url(#nfs-clip)"/>
  <rect x="17" y="65" width="12" height="17" fill="white" clip-path="url(#nfs-clip)"/>
  <rect x="16" y="60" width="5"  height="8"  fill="white" clip-path="url(#nfs-clip)"/>
  <rect x="23" y="60" width="5"  height="8"  fill="white" clip-path="url(#nfs-clip)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="white" stroke-width="3" opacity="0.35"/>
  <circle cx="100" cy="100" r="97" fill="none" stroke="white" stroke-width="1.5" opacity="0.12"/>
</svg>`;

export async function getLogoPng(size = 120): Promise<Buffer> {
  // Rasterise the SVG to PNG at the requested pixel size.
  // sharp is available in the Next.js / Vercel Node runtime.
  const sharp = (await import("sharp")).default;
  return sharp(Buffer.from(LOGO_SVG)).resize(size, size).png().toBuffer();
}
