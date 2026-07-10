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
  console.log(
    JSON.stringify({
      type: "security",
      event,
      at: new Date().toISOString(),
      ...meta,
    }),
  );
}

export function clientIpFrom(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
