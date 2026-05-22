"use client";

import { cn } from "@/lib/utils";
import { Phone, PhoneOff } from "lucide-react";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type Props = {
  state: OrbState;
  isVoiceOn: boolean;
  onToggleVoice: () => void;
};

const STATE_LABELS: Record<OrbState, string | null> = {
  idle: null,
  speaking: "Sarah is speaking",
  listening: "Listening…",
  thinking: "Sarah is thinking…",
};

export function SarahOrb({ state, isVoiceOn, onToggleVoice }: Props) {
  const label = STATE_LABELS[state];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn("sarah-orb-wrap", `orb--${state}`)}>
        <div className="sarah-orb-body">
          <div className="sarah-orb-spin" />
          <div className="sarah-orb-highlight" />
        </div>

        <div className="sarah-orb-rays" />
        <div className="sarah-orb-listen-ring" />

        <button
          onClick={onToggleVoice}
          className={cn(
            "sarah-orb-phone-btn",
            isVoiceOn
              ? "sarah-orb-phone-btn--active"
              : "sarah-orb-phone-btn--idle"
          )}
          aria-label={isVoiceOn ? "End voice session" : "Start voice session"}
        >
          {isVoiceOn ? (
            <PhoneOff className="h-4 w-4" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="h-5 flex items-center justify-center">
        {label && (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                state === "speaking"
                  ? "bg-cyan-400"
                  : state === "listening"
                  ? "bg-amber-400"
                  : "bg-slate-400"
              )}
            />
            <span className="text-[11px] font-medium text-slate-500 tracking-widest uppercase">
              {label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
