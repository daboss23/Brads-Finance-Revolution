// Session gate for the adviser platform.
//
// Enforced whenever ADVISER_PASSWORD_HASH and AUTH_SESSION_SECRET are set
// (see SECURITY.md §9). Without them the platform runs open in demo mode
// and logs a warning. Client-facing onboarding stays public — clients
// authenticate via their per-session token in the URL, not a login.

import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

// Public paths: client onboarding + the endpoints Sarah's session needs.
const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth/",
  "/onboarding/",
  "/api/sarah",
  "/api/transcribe",
  "/_next/",
  "/favicon.ico",
];

// Public file extensions (logo, fonts, images).
const PUBLIC_FILE = /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/;

let warned = false;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Sarah's client session submits the completed fact find here (POST is
  // public); reading fact finds back (GET) requires the adviser session.
  if (pathname === "/api/complete-fact-find" && req.method === "POST") {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SESSION_SECRET;
  const configured = Boolean(process.env.ADVISER_PASSWORD_HASH && secret);
  if (!configured) {
    if (!warned && process.env.NODE_ENV === "production") {
      warned = true;
      console.warn(
        "[auth] ADVISER_PASSWORD_HASH / AUTH_SESSION_SECRET not set — " +
          "platform is running OPEN. Configure sign-in before storing real client data (SECURITY.md §9).",
      );
    }
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token, secret as string) : null;
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
