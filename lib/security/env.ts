// Environment separation for data protection.
//
// The platform handles client PII (income, super, insurance, family details),
// so every deployment must declare which environment it is:
//
//   production — the live adviser environment. Real client data allowed.
//   sandbox    — development, preview and testing. SYNTHETIC DATA ONLY.
//
// Set APP_ENV=production on the production Vercel project only. Anything
// else (local dev, preview deploys, staging) defaults to sandbox so real
// client information can never be entered into a non-production build by
// accident. See SECURITY.md for the full policy.

export type AppEnvironment = "production" | "sandbox";

export function getAppEnvironment(): AppEnvironment {
  return process.env.NEXT_PUBLIC_APP_ENV === "production"
    ? "production"
    : "sandbox";
}

export function isSandbox(): boolean {
  return getAppEnvironment() === "sandbox";
}
