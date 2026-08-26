/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pg", "puppeteer-core", "@sparticuz/chromium"],
  },
  // @sparticuz/chromium loads its compressed Chromium binary from its own
  // bin/ directory at runtime, which file tracing can't see. Ship it
  // explicitly for every route that renders PDFs.
  outputFileTracingIncludes: {
    "/api/soa/[id]/pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/export/[id]/pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;