"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const from = searchParams.get("from");
        router.replace(from && from.startsWith("/") ? from : "/dashboard");
        router.refresh();
        return;
      }
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Sign in failed. Please try again.");
    } catch {
      setError("Connection problem. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px] onboarding-fade-in space-y-8">
        <div className="flex justify-center">
          <NewcastleLogoFull size={56} />
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <form onSubmit={handleSubmit} className="px-8 py-9 space-y-6">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
                <Lock className="h-4 w-4 text-gold" />
              </div>
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
                Adviser Sign In
              </h1>
              <p className="text-[13px] text-muted-foreground/70">
                BMK Command Centre access is restricted to authorised advisers.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground/70"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-border bg-black/30 px-3.5 py-3 text-[14px] text-foreground outline-none transition focus:border-gold/50 focus:shadow-[0_0_0_2px_hsl(var(--gold)/0.2)]"
              />
              {error && (
                <p role="alert" className="pt-1 text-[12.5px] text-destructive">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded bg-gold py-3.5 text-[14px] font-semibold text-gold-foreground transition-all hover:bg-gold/90 active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-muted-foreground/55">
          Sessions expire after 8 hours. All sign-in activity is logged.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <OnboardingBackground />
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
