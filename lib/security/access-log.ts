// Structured security event logging.
//
// Every auth decision and token denial emits one JSON line. On Vercel these
// land in the deployment's runtime logs (retained per plan tier) so access
// history can be reviewed after an incident. Payloads never include
// passwords, session tokens or client PII — only metadata.

export type SecurityEvent =
  | "login-success"
  | "login-failed"
  | "login-lockout"
  | "logout"
  | "session-denied"
  | "onboarding-token-denied"
  | "api-token-denied";

export function logSecurityEvent(
  event: SecurityEvent,
  meta: Record<string, string | number | boolean | null> = {},
): void {
  const at = new Date().toISOString();
  console.log(JSON.stringify({ type: "security", event, at, ...meta }));

  // Durable copy via the encrypted persistence layer (Postgres when
  // DATABASE_URL is set, local file otherwise). Fire-and-forget: an audit
  // write must never block or fail a login response. Node runtime only.
  if (process.env.NEXT_RUNTIME === "nodejs" || typeof window === "undefined") {
    import("@/lib/db/persistence")
      .then(({ getPersistence }) =>
        getPersistence().recordSecurityEvent({ event, at, meta }),
      )
      .catch((e) => console.error("[access-log] durable write failed", e));
  }
}

export function clientIpFrom(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
