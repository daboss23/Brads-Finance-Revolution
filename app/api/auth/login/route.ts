import {
  authConfigured,
  verifyPassword,
  isLockedOut,
  recordFailure,
  recordSuccess,
} from "@/lib/auth/credentials";
import { verifyTotp } from "@/lib/auth/totp";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth/session";
import { rateLimit, clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit("login", ip, 10, 60);
  if (!rl.allowed) return rateLimited(rl);

  if (!authConfigured()) {
    return Response.json(
      { error: "Sign-in is not configured on this deployment." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
    totp?: string;
  } | null;
  if (!body?.email || !body.password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const lockId = `${email}:${ip}`;

  const lockedFor = isLockedOut(lockId);
  if (lockedFor > 0) {
    return Response.json(
      { error: `Too many failed attempts. Try again in ${Math.ceil(lockedFor / 60)} minutes.` },
      { status: 429 },
    );
  }

  const expectedEmail = (process.env.ADVISER_EMAIL ?? "").trim().toLowerCase();
  const passwordOk =
    email === expectedEmail &&
    verifyPassword(body.password, process.env.ADVISER_PASSWORD_HASH as string);

  if (!passwordOk) {
    recordFailure(lockId, ip);
    // Same message for wrong email vs wrong password — no user enumeration.
    return Response.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const totpSecret = process.env.ADVISER_TOTP_SECRET;
  if (totpSecret) {
    if (!body.totp) {
      return Response.json({ mfaRequired: true }, { status: 401 });
    }
    if (!verifyTotp(totpSecret, body.totp)) {
      recordFailure(lockId, ip);
      return Response.json({ error: "Incorrect authenticator code." }, { status: 401 });
    }
  }

  recordSuccess(lockId, ip);
  const token = await createSessionToken(email, process.env.AUTH_SESSION_SECRET as string);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
    },
  });
}
