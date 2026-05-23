"use client";

import { useCallback, useRef, useState } from "react";

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);

  // Determine support at init time so clicking never hides the button
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  });

  const recRef = useRef<any>(null);

  const start = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    recRef.current?.stop();

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-AU";

    r.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      onResult(final || interim);
    };

    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start();
    recRef.current = r;
    setIsListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, start, stop };
}
