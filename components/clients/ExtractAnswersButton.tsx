"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  clientId: string;
  /** Turns available to read. Shown so the cost is legible before pressing. */
  answerCount: number;
  /** True once answers have been read and nothing has been said since. */
  upToDate: boolean;
};

// Turns a stopped conversation into fact find fields, on request.
//
// A button rather than something automatic, because it spends Anthropic credit
// and the practice watches that balance closely. It says what it is about to
// read before it reads it, so the spend is never a surprise.
export function ExtractAnswersButton({
  clientId,
  answerCount,
  upToDate,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/clients/${encodeURIComponent(clientId)}/extract-answers${
          upToDate ? "?force=true" : ""
        }`,
        { method: "POST" },
      );
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(body.error ?? `That did not work (${res.status}).`);
        return;
      }
      // The review page reads the extraction server side, so the page itself
      // has to come back rather than this component holding the result.
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not reach the server.");
    } finally {
      setRunning(false);
    }
  }

  const busy = running || pending;

  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={run}
        disabled={busy}
        className="w-full gap-2 border-gold/30 text-foreground hover:border-gold/55"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-gold/80" />
        )}
        {busy
          ? "Reading the conversation"
          : upToDate
            ? "Read these answers again"
            : `Pull ${answerCount === 1 ? "this answer" : `these ${answerCount} answers`} into the fact find`}
      </Button>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/60">
        {upToDate
          ? "Already read into the ten sections below. Nothing new has been said since."
          : "Reads what the client actually said into the fact find sections. Every field is marked unconfirmed until you check it."}
      </p>

      {error && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-destructive/85">
          <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
