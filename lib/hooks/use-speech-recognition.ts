"use client";

import { useRef, useState } from "react";

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const recRef = useRef<any>(null);

  function start() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
    recRef.current?.stop();

    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-AU";
    r.onresult = (e: any) => {
      const result = e.results[e.results.length - 1];
      onResult(result[0].transcript);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start();
    recRef.current = r;
    setIsListening(true);
  }

  function stop() {
    recRef.current?.stop();
    setIsListening(false);
  }

  return { isListening, isSupported, start, stop };
}
