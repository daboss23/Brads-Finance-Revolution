/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/sarah",
        destination: "/athena",
        permanent: true,
      },
      {
        source: "/api/sarah",
        destination: "/api/athena",
        permanent: false,
      },
      {
        source: "/api/sarah/voice",
        destination: "/api/athena/voice",
        permanent: false,
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: ["pg", "puppeteer-core", "@sparticuz/chromium"],
    // @sparticuz/chromium loads its compressed Chromium binary from its own
    // bin/ directory at runtime, which file tracing can't see. Ship it
    // explicitly for every route that renders PDFs.
    //
    // This must stay inside `experimental` while we are on Next 14 — at the
    // top level Next 14 ignores it as an unknown key, the binary is left out
    // of the Lambda bundle, and every PDF route fails in production while
    // still working locally, where a system Chromium is found instead. It
    // graduates to the top level in Next 15.
    outputFileTracingIncludes: {
      "/api/soa/[id]/pdf": ["./node_modules/@sparticuz/chromium/bin/**", "./lib/pdf/fonts/**"],
      "/api/export/[id]/pdf": ["./node_modules/@sparticuz/chromium/bin/**", "./lib/pdf/fonts/**"],
      "/api/compliance/[id]/certificate": ["./node_modules/@sparticuz/chromium/bin/**", "./lib/pdf/fonts/**"],
      "/api/forms/[clientId]/[formId]": ["./node_modules/@sparticuz/chromium/bin/**", "./lib/pdf/fonts/**"],
    },
  },
};

export default nextConfig;
