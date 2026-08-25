// Sliding-window rate limiter for public endpoints.
//
// In-memory per server instance, which matches Vercel's per-lambda model
// well enough for a single-adviser deployment: it stops credential
// stuffing and transcription-API abuse from a single source. When the
// platform goes multi-instance/multi-firm, swap the Map for the shared
// secure-store backend or Upstash — the call sites won't change.

interface Window {
  count: number;
  resetAt: number;
}

const STORE_KEY = "__bmk_rate_limit__";

function getWindows(): Map<string, Window> {
  const g = globalThis as unknown as Record<string, Map<string, Window> | undefined>;
  if (!g[STORE_KEY]) g[STORE_KEY] = new Map();
  return g[STORE_KEY] as Map<string, Window>;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(
  bucket: string,
  id: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const windows = getWindows();
  const key = `${bucket}:${id}`;
  const now = Date.now();
  const win = windows.get(key);
  if (!win || win.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    if (windows.size > 10_000) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }
  win.count += 1;
  if (win.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((win.resetAt - now) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

// Standard 429 response for rate-limited requests.
export function rateLimited(result: RateLimitResult): Response {
  return Response.json(
    { error: "Too many requests. Please slow down." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}
