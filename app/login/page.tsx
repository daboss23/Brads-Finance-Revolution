"use client";

import { useState, type FormEvent } from "react";
import { Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, totp: totp || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        mfaRequired?: boolean;
        error?: string;
      };
      if (data.ok) {
        const next = new URLSearchParams(window.location.search).get("next");
        window.location.href = next && next.startsWith("/") ? next : "/dashboard";
        return;
      }
      if (data.mfaRequired) {
        setMfaStep(true);
        return;
      }
      setError(data.error ?? "Sign-in failed.");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-background px-6 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,hsl(var(--gold)/0.09),transparent_55%)]" />
      <div className="glass-panel glass-panel-elevated relative z-10 w-full max-w-[420px] rounded-[28px] px-8 py-10">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
            {mfaStep ? (
              <ShieldCheck className="h-6 w-6 text-gold" />
            ) : (
              <Lock className="h-6 w-6 text-gold" />
            )}
          </div>
          <h1 className="text-2xl font-light tracking-wide">
            {mfaStep ? "Two-factor check" : "Adviser sign in"}
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            {mfaStep
              ? "Enter the 6-digit code from your authenticator app."
              : "BMK CRM Platform"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {!mfaStep && (
            <>
              <label htmlFor="adviser-email" className="sr-only">
                Adviser email
              </label>
              <input
                id="adviser-email"
                type="email"
                required
                autoComplete="username"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-foreground/[0.04] px-4 py-3 text-sm outline-none placeholder:text-foreground/35 focus:border-gold/50"
              />
              <label htmlFor="adviser-password" className="sr-only">
                Password
              </label>
              <input
                id="adviser-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-foreground/[0.04] px-4 py-3 text-sm outline-none placeholder:text-foreground/35 focus:border-gold/50"
              />
            </>
          )}
          {mfaStep && (
            <>
              <label htmlFor="adviser-totp" className="sr-only">
                Six digit authenticator code
              </label>
              <input
                id="adviser-totp"
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                className="w-full rounded-xl border border-border bg-foreground/[0.04] px-4 py-3 text-center text-lg tracking-[0.4em] outline-none placeholder:text-foreground/25 focus:border-gold/50"
              />
            </>
          )}

          {error && (
            <p role="alert" aria-live="polite" className="rounded-lg bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="btn-gold w-full rounded-xl px-6 py-3.5 text-[14px] font-bold uppercase tracking-[0.05em] transition-[filter] hover:brightness-105 disabled:opacity-60"
          >
            {busy ? "Checking…" : mfaStep ? "Verify" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-foreground/40">
          Sessions expire after 12 hours. All sign-in activity is logged.
        </p>
      </div>
    </div>
  );
}
