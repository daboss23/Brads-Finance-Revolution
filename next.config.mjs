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
