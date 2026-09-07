"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  Mic,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Pre-flight readout for a live client demo. Everything here comes from
// /api/health/demo, which tests the platform rather than reading environment
// variables, so a green row means the thing actually worked once.

type Tone = "ok" | "warn" | "fail";

interface WalkthroughClient {
  clientId: string;
  name: string;
  ready: boolean;
  complianceScore: number;
  factFindCompletion: number;
  strategies: string[];
  blockers: string[];
}

interface Report {
  ok: boolean;
  checkedAt: string;
  storage: { backend: string; writable: boolean; detail: string; remedy?: string };
  discovery: { mode: "voice" | "text" | "unavailable"; detail: string };
  signIn: { enforced: boolean; detail: string };
  walkthrough: WalkthroughClient[];
  readyClientCount: number;
  notes: string[];
}

export function DemoReadiness() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health/demo", { cache: "no-store" });
      if (!res.ok) throw new Error(`Pre-flight returned ${res.status}.`);
      setReport((await res.json()) as Report);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <section className="mb-8 glass-panel p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="glass-orb grid h-9 w-9 place-items-center rounded-lg border-gold/30 text-gold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Demo Pre-flight</h2>
            <p className="mt-1 text-[12px] text-muted-foreground/70">
              Run this before a client meeting. It writes and reads a real encrypted
              record, calls the live voice agent, and checks which clients reach a
              finished SOA.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void run()} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
          )}
          {loading ? "Checking" : "Re-check"}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg glass-chip border-destructive/30 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </p>
      )}

      {report && (
        <>
          <div className="mb-4 space-y-3">
            <CheckLine
              icon={Database}
              label={`Storage · ${report.storage.backend}`}
              detail={report.storage.detail}
              remedy={report.storage.remedy}
              tone={report.storage.writable ? "ok" : "fail"}
              status={report.storage.writable ? "Writable" : "Failing"}
            />
            <CheckLine
              icon={Mic}
              label="Discovery session"
              detail={report.discovery.detail}
              tone={
                report.discovery.mode === "voice"
                  ? "ok"
                  : report.discovery.mode === "text"
                    ? "warn"
                    : "fail"
              }
              status={
                report.discovery.mode === "voice"
                  ? "Voice"
                  : report.discovery.mode === "text"
                    ? "Text fallback"
                    : "Unavailable"
              }
            />
            <CheckLine
              icon={ShieldAlert}
              label="Sign in"
              detail={report.signIn.detail}
              tone={report.signIn.enforced ? "ok" : "warn"}
              status={report.signIn.enforced ? "Enforced" : "Open"}
            />
          </div>

          {report.notes.length > 0 && (
            <ul className="mb-5 space-y-2">
              {report.notes.map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2.5 rounded-lg glass-chip border-warning/25 px-4 py-2.5 text-[12.5px] leading-relaxed text-muted-foreground/85"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="cmd-label text-gold/80">Walkthrough · Fact find to SOA</p>
            <p className="text-[11.5px] text-muted-foreground/65">
              {report.readyClientCount} of {report.walkthrough.length} clients reach a
              finished SOA
            </p>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            {report.walkthrough.map((client) => (
              <ClientRow key={client.clientId} client={client} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function CheckLine({
  icon: Icon,
  label,
  detail,
  remedy,
  tone,
  status,
}: {
  icon: typeof Database;
  label: string;
  detail: string;
  remedy?: string;
  tone: Tone;
  status: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg glass-chip px-4 py-3">
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", toneText(tone))} />
        <div>
          <p className="text-[13px] font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground/70">{detail}</p>
          {remedy && (
            <code className="mt-2 block break-all rounded bg-white/[0.04] px-2 py-1.5 font-mono text-[11px] text-gold/90">
              {remedy}
            </code>
          )}
        </div>
      </div>
      <StatusChip tone={tone}>{status}</StatusChip>
    </div>
  );
}

function ClientRow({ client }: { client: WalkthroughClient }) {
  const noFactFind = client.factFindCompletion === 0;
  const tone: Tone = client.ready ? "ok" : noFactFind ? "warn" : "fail";
  return (
    <div className="rounded-lg glass-chip px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">{client.name}</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground/65">
            {noFactFind
              ? "No fact find yet. Top of funnel."
              : `Compliance ${client.complianceScore}/100 · ${client.strategies.length} ${
                  client.strategies.length === 1 ? "strategy" : "strategies"
                } approved`}
          </p>
        </div>
        <StatusChip tone={tone}>
          {client.ready ? "SOA ready" : noFactFind ? "Not started" : "Gated"}
        </StatusChip>
      </div>
      {!client.ready && !noFactFind && (
        <ul className="mt-2.5 space-y-1 border-t border-border/50 pt-2.5">
          {client.blockers.map((blocker) => (
            <li key={blocker} className="text-[11.5px] leading-relaxed text-muted-foreground/75">
              {blocker}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const Icon = tone === "ok" ? CheckCircle2 : tone === "warn" ? AlertTriangle : XCircle;
  return (
    <span
      className={cn(
        "glass-chip inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
        tone === "ok" && "border-success/30 text-success",
        tone === "warn" && "border-warning/30 text-warning",
        tone === "fail" && "border-destructive/30 text-destructive",
      )}
    >
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

function toneText(tone: Tone): string {
  if (tone === "ok") return "text-success";
  if (tone === "warn") return "text-warning";
  return "text-destructive";
}
