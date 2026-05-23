"use client";

import { useEffect, useRef, useState } from "react";

const MAX_DURATION_MS = 30_000;

export function useAudioRecorder(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const tracks = streamRef.current?.getTracks() ?? [];
        tracks.forEach((t) => t.stop());
        streamRef.current = null;

        const blobType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        chunksRef.current = [];

        if (blob.size === 0) {
          setIsRecording(false);
          return;
        }

        setIsTranscribing(true);
        try {
          const fd = new FormData();
          fd.append("audio", blob, `audio.${blobType.includes("mp4") ? "mp4" : "webm"}`);
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = (await res.json().catch(() => null)) as
            | { text?: string; error?: string }
            | null;
          if (!res.ok || !data || data.error) {
            const msg = data?.error ?? `Transcription failed (${res.status})`;
            console.error("[transcribe] error:", msg, data);
            setError(msg);
          } else if (data.text) {
            onTranscript(data.text);
          }
        } catch (e) {
          console.error("[transcribe] request failed:", e);
          setError(e instanceof Error ? e.message : "Transcription request failed.");
        } finally {
          setIsTranscribing(false);
          setIsRecording(false);
        }
      };

      recorder.start();
      setIsRecording(true);

      timeoutRef.current = window.setTimeout(() => {
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
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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
