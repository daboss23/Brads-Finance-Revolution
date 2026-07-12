/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pg", "puppeteer-core", "@sparticuz/chromium"],
  },
};

export default nextConfig;
