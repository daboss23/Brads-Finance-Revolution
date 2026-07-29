// HTTP transport for the XPLAN API.
//
// Verified against Iress's published sample code
// (github.com/iress/iress-xplan-api-examples): the API is reached with the
// XPLAN user's own credentials, and where two-factor is enabled it must use
// the Software Token method, so we answer the challenge with a TOTP code
// derived from the same secret.
//
// The paths in ENDPOINTS below are the one part that still needs confirming
// against Iress's documentation once the API Agreement is in place — XPLAN
// sites are heavily configured, so entity and field names vary per site.
// Everything else here is site-independent.

import { currentTotp } from "@/lib/auth/totp";
import { readXplanConfig, type XplanConfig } from "./config";

export class XplanNotConfiguredError extends Error {
  constructor() {
    super(
      "XPLAN is not configured. Set XPLAN_BASE_URL, XPLAN_USERNAME and " +
        "XPLAN_PASSWORD (see docs/XPLAN-INTEGRATION.md).",
    );
  }
}

export class XplanRequestError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * CONFIRM WITH IRESS before going live. RAPI is the resourceful API used by
 * the sample code; the exact collection paths depend on the site build.
 */
export const ENDPOINTS = {
  /** Entity list. XPLAN calls a client record an "entity". */
  entities: "/resourceful/entity",
  /** Single entity by XPLAN entity id. */
  entity: (entityId: string) => `/resourceful/entity/${encodeURIComponent(entityId)}`,
  /** Entity's stored fact-find style detail. */
  entityDetail: (entityId: string) =>
    `/resourceful/entity/${encodeURIComponent(entityId)}/details`,
} as const;

function authHeaders(cfg: XplanConfig): Record<string, string> {
  // XPLAN's software-token flow appends the current one-time code to the
  // password in the Basic credential. If Brad's site is provisioned for the
  // OAuth 2.0 Standard Integration instead, this is the single place to swap.
  const secret = cfg.totpSecret;
  const password = secret ? `${cfg.password}${currentTotp(secret)}` : cfg.password;
  const basic = Buffer.from(`${cfg.username}:${password}`).toString("base64");

  const headers: Record<string, string> = {
    Authorization: `Basic ${basic}`,
    Accept: "application/json",
  };
  if (cfg.appKey) headers["X-Api-Key"] = cfg.appKey;
  return headers;
}

/**
 * One request against the XPLAN API. Read-only by design: this integration
 * pulls Brad's existing book across and never writes back, so a mapping
 * mistake can't corrupt the practice's system of record.
 */
export async function xplanGet<T>(path: string): Promise<T> {
  const cfg = readXplanConfig();
  if (!cfg) throw new XplanNotConfiguredError();

  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: "GET",
    headers: authHeaders(cfg),
    cache: "no-store",
  });

  if (!res.ok) {
    // Never echo the body wholesale — XPLAN errors can quote client records.
    throw new XplanRequestError(
      res.status,
      `XPLAN request failed (${res.status} ${res.statusText}) for ${path}`,
    );
  }
  return (await res.json()) as T;
}

/** Cheap round trip so the settings screen can prove the credentials work. */
export async function xplanPing(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  try {
    await xplanGet(`${ENDPOINTS.entities}?limit=1`);
    return { ok: true };
  } catch (err) {
    if (err instanceof XplanNotConfiguredError) {
      return { ok: false, reason: "Not configured" };
    }
    if (err instanceof XplanRequestError) {
      return {
        ok: false,
        reason:
          err.status === 401 || err.status === 403
            ? "Credentials rejected. Check the username, password and software token."
            : err.message,
      };
    }
    return { ok: false, reason: "Could not reach the XPLAN site." };
  }
}
