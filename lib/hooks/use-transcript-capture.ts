"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
  TranscriptSource,
  TranscriptTurn,
} from "@/lib/secure-store/transcript-persistence";

const ENDPOINT = "/api/athena/transcript";
// Long enough that an ordinary exchange produces one write rather than three,
// short enough that a crashed tab loses at most a few seconds of speech.
const FLUSH_DEBOUNCE_MS = 5_000;

type Options = {
  token?: string;
  /** Null until the session has an id. Nothing is sent before then. */
  conversationId: string | null;
  source: TranscriptSource;
  turns: TranscriptTurn[];
  startedAt?: string;
};

// Streams a discovery session into the practice's encrypted store while it is
// still running.
//
// The whole conversation is sent on every flush rather than a delta. That is
// more bytes than strictly needed, and it is the right trade here: it makes a
// retry, a duplicate and an out of order flush all harmless, because the
// server keeps the longer list and no write can shrink a record. Financial
// disclosures are worth more than the bandwidth.
export function useTranscriptCapture({
  token,
  conversationId,
  source,
  turns,
  startedAt,
}: Options) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentCountRef = useRef(0);
  // Read by the unload handler, which must not re-register on every turn.
  const latestRef = useRef({ token, conversationId, source, turns, startedAt });

  useEffect(() => {
    latestRef.current = { token, conversationId, source, turns, startedAt };
  }, [token, conversationId, source, turns, startedAt]);

  const payload = useCallback((completed: boolean) => {
    const { token, conversationId, source, turns, startedAt } = latestRef.current;
    if (!token || !conversationId || turns.length === 0) return null;
    return JSON.stringify({
      token,
      conversationId,
      source,
      completed,
      startedAt,
      turns,
    });
  }, []);

  const flush = useCallback(
    async (completed = false) => {
      const body = payload(completed);
      if (!body) return;
      const count = latestRef.current.turns.length;
      // Completion is always worth a write, even with no new turns, because it
      // is what marks the record as a finished session rather than an
      // abandoned one.
      if (!completed && count <= lastSentCountRef.current) return;
      lastSentCountRef.current = count;

      try {
        await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      } catch (e) {
        // Let the next flush retry: it carries the whole conversation, so a
        // dropped write costs nothing as long as one later one lands.
        lastSentCountRef.current = 0;
        console.error("[transcript-capture] flush failed:", e);
      }
    },
    [payload],
  );

  // Debounced write while the session runs.
  useEffect(() => {
    if (!token || !conversationId || turns.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flush(false), FLUSH_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, conversationId, turns, flush]);

  // A client who closes the tab mid-answer is exactly the case this whole
  // route exists for, so the last turns have to leave the page during unload.
  // sendBeacon is the only request that reliably survives it.
  useEffect(() => {
    const handler = () => {
      const body = payload(false);
      if (!body) return;
      try {
        navigator.sendBeacon(
          ENDPOINT,
          new Blob([body], { type: "application/json" }),
        );
      } catch {
        // Nothing further is possible once the page is going away.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") handler();
    };
    // pagehide covers the mobile case that beforeunload misses, which matters
    // because most clients open these links on a phone. visibilitychange
    // catches the app being backgrounded without the page being discarded.
    window.addEventListener("pagehide", handler);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", handler);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [payload]);

  return { flush };
}
