import { NextResponse, type NextRequest } from "next/server";
import {
  clearAttempts,
  isLockedOut,
  recordFailedAttempt,
  verifyPassword,
} from "@/lib/security/auth";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  isAuthConfigured,
} from "@/lib/security/session";
import { clientIpFrom, logSecurityEvent } from "@/lib/security/access-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = clientIpFrom(request.headers);

  // Cross-site POSTs can't log in: browsers label them via Sec-Fetch-Site.
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "Authentication is not configured on this deployment." },
      { status: 503 },
    );
  }

  if (isLockedOut(ip)) {
    logSecurityEvent("login-lockout", { ip });
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!password || !verifyPassword(password, process.env.AUTH_PASSWORD_HASH!)) {
    recordFailedAttempt(ip);
    logSecurityEvent("login-failed", { ip });
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  clearAttempts(ip);
  logSecurityEvent("login-success", { ip });

  const token = await createSessionToken(process.env.AUTH_SESSION_SECRET!);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
