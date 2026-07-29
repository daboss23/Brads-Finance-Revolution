// XPLAN connection settings, read from the environment.
//
// The integration is inert until every required variable is present: with no
// configuration the platform behaves exactly as it does today. That matters
// because API access depends on an Iress API Agreement held by the XPLAN site
// owner (for BMK that is the licensee, not Brad), which may take a while to
// land — see docs/XPLAN-INTEGRATION.md.

export interface XplanConfig {
  /** Site base URL, e.g. https://charter.xplan.iress.com.au */
  baseUrl: string;
  username: string;
  password: string;
  /**
   * Base32 secret for the XPLAN user's software token. Iress's own examples
   * require 2FA to use the Software Token method rather than SMS.
   */
  totpSecret: string | null;
  /** App key issued by Iress for Standard/Custom integrations, if used. */
  appKey: string | null;
}

export interface XplanStatus {
  configured: boolean;
  /** Names of the variables still needed, for the settings screen. */
  missing: string[];
  twoFactor: boolean;
}

const REQUIRED = ["XPLAN_BASE_URL", "XPLAN_USERNAME", "XPLAN_PASSWORD"] as const;

export function readXplanConfig(): XplanConfig | null {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) return null;

  return {
    baseUrl: (process.env.XPLAN_BASE_URL as string).replace(/\/+$/, ""),
    username: process.env.XPLAN_USERNAME as string,
    password: process.env.XPLAN_PASSWORD as string,
    totpSecret: process.env.XPLAN_TOTP_SECRET || null,
    appKey: process.env.XPLAN_APP_KEY || null,
  };
}

export function xplanStatus(): XplanStatus {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  return {
    configured: missing.length === 0,
    missing,
    twoFactor: Boolean(process.env.XPLAN_TOTP_SECRET),
  };
}

export function isXplanEnabled(): boolean {
  return readXplanConfig() !== null;
}
