import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/security/session";
import { clientIpFrom, logSecurityEvent } from "@/lib/security/access-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  logSecurityEvent("logout", { ip: clientIpFrom(request.headers) });
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
