"use client";

import { useEffect, useRef, useState } from "react";

const MAX_DURATION_MS = 30_000;
const SILENCE_HANGOVER_MS = 1500;
const SILENCE_RMS_THRESHOLD = 0.025;
const SPEECH_RMS_THRESHOLD = 0.05;
const MIN_RECORDING_BEFORE_AUTOSTOP_MS = 800;
const TRANSCRIPT_REVEAL_DELAY_MS = 2500;

export function useAudioRecorder(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const maxTimeoutRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cleanupAnalyser();
      if (maxTimeoutRef.current) window.clearTimeout(maxTimeoutRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function cleanupAnalyser() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        // ignore
      }
      analyserRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }

  function pickMimeType(): string {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    for (const t of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return "";
  }

  function attachSilenceDetector(stream: MediaStream, startedAt: number) {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buf = new Uint8Array(analyser.fftSize);
      let lastSpokeAt = performance.now();
      let hasSpoken = false;

      const loop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buf);
        let sumSq = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / buf.length);
        const now = performance.now();

        if (rms > SPEECH_RMS_THRESHOLD) {
          hasSpoken = true;
          lastSpokeAt = now;
        } else if (hasSpoken && rms < SILENCE_RMS_THRESHOLD) {
          if (
            now - lastSpokeAt > SILENCE_HANGOVER_MS &&
            now - startedAt > MIN_RECORDING_BEFORE_AUTOSTOP_MS
          ) {
            stop();
            return;
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      console.warn("[recorder] silence detector unavailable:", e);
    }
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        console.log("[recorder] ondataavailable size:", e.data?.size ?? 0);
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        console.log("[recorder] onstop, chunks:", chunksRef.current.length);
        cleanupAnalyser();
        const tracks = streamRef.current?.getTracks() ?? [];
        tracks.forEach((t) => t.stop());
        streamRef.current = null;

        const blobType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        chunksRef.current = [];
        console.log("[recorder] blob size:", blob.size, "type:", blobType);

        if (blob.size === 0) {
          console.warn("[recorder] empty blob, nothing to transcribe");
          setError("No audio captured. Please try again.");
          setIsRecording(false);
          return;
        }

        setIsTranscribing(true);
        try {
          const fd = new FormData();
          fd.append(
            "audio",
            blob,
            `audio.${blobType.includes("mp4") ? "mp4" : "webm"}`
          );
          console.log("[recorder] posting blob to /api/transcribe…");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          console.log("[recorder] /api/transcribe status:", res.status);
          const data = (await res.json().catch(() => null)) as
            | { text?: string; error?: string }
            | null;
          console.log("[recorder] transcribe response:", data);
          if (!res.ok || !data || data.error) {
            const msg = data?.error ?? `Transcription failed (${res.status})`;
            console.error("[transcribe] error:", msg, data);
            setError(msg);
            setIsTranscribing(false);
            setIsRecording(false);
          } else if (data.text) {
            // Hold the spinner and delay the reveal so it feels like the system
            // is thoughtfully processing rather than snapping.
            const text = data.text;
            window.setTimeout(() => {
              onTranscript(text);
              setIsTranscribing(false);
              setIsRecording(false);
            }, TRANSCRIPT_REVEAL_DELAY_MS);
          } else {
            setIsTranscribing(false);
            setIsRecording(false);
          }
        } catch (e) {
          console.error("[transcribe] request failed:", e);
          setError(e instanceof Error ? e.message : "Transcription request failed.");
          setIsTranscribing(false);
          setIsRecording(false);
        }
      };

      recorder.start(250);
      console.log("[recorder] started, mime:", mimeType || "(default)");
      setIsRecording(true);

      const startedAt = performance.now();
      attachSilenceDetector(stream, startedAt);

      maxTimeoutRef.current = window.setTimeout(() => {
        stop();
      }, MAX_DURATION_MS);
    } catch (e) {
      console.error("[recorder] getUserMedia failed:", e);
      const msg =
        e instanceof Error
          ? e.message
          : "Microphone access was denied or is unavailable.";
      setError(msg);
      setIsRecording(false);
    }
  }

  function stop() {
    if (maxTimeoutRef.current) {
      window.clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    cleanupAnalyser();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch (e) {
        console.warn("[recorder] stop error:", e);
      }
    }
  }

  function toggle() {
    if (isRecording) stop();
    else void start();
  }

  return { isRecording, isTranscribing, error, start, stop, toggle };
}
