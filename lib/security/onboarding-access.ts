// Access control for client-facing onboarding links.
//
// Fact find links carry personal financial information, so a link must be
// real, recent and still open before Sarah starts a session. Tokens that
// fail any check get a friendly lockout screen, never a live session.

import { getLinkByToken, type FactFindLink } from "@/lib/sarah-data";

// 90 days while the platform runs on demo data; tighten to 30 before
// real client links go out (see SECURITY.md go-live checklist).
export const LINK_VALIDITY_DAYS = 90;

export type OnboardingAccess =
  | { ok: true; link: FactFindLink }
  | { ok: false; reason: "invalid" | "expired" };

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

// Parses the en-AU "17 May 2026" format used across the data layer.
export function parseAuDate(value: string | null): Date | null {
  if (!value) return null;
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = MONTHS[parts[1].toLowerCase()];
  const year = Number(parts[2]);
  if (!Number.isFinite(day) || month === undefined || !Number.isFinite(year)) {
    return null;
  }
  return new Date(year, month, day);
}

export function isLinkExpired(link: FactFindLink, now: Date = new Date()): boolean {
  const sent = parseAuDate(link.sentDate);
  // Links that were never sent cannot be opened by a client at all.
  if (!sent) return true;
  const expiry = new Date(sent);
  expiry.setDate(expiry.getDate() + LINK_VALIDITY_DAYS);
  return now > expiry;
}

export function validateOnboardingToken(token: string): OnboardingAccess {
  const link = getLinkByToken(token);
  if (!link || link.status === "not-sent") return { ok: false, reason: "invalid" };
  if (isLinkExpired(link)) return { ok: false, reason: "expired" };
  return { ok: true, link };
}
