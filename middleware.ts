import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  isAuthConfigured,
  verifySessionToken,
} from "@/lib/security/session";

// Routes reachable without an adviser session.
// Client-facing onboarding stays public by design (clients have no account);
// its API routes enforce their own per-link token checks instead.
const PUBLIC_PREFIXES = [
  "/login",
  "/onboarding/",
  "/api/auth/",
  "/api/sarah",
  "/api/transcribe",
  "/api/complete-fact-find",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname === p.replace(/\/$/, "") || pathname.startsWith(p),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  // Sandbox builds without credentials stay open for development, but a
  // production deployment missing auth config FAILS CLOSED: nothing loads.
  if (!isAuthConfigured()) {
    if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
      return new NextResponse(
        "Authentication is not configured for this production deployment. Set AUTH_PASSWORD_HASH and AUTH_SESSION_SECRET.",
        { status: 503 },
      );
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token, process.env.AUTH_SESSION_SECRET!);

  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|woff2?)$).*)"],
};
