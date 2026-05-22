"use client";

import { cn } from "@/lib/utils";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type Props = {
  state: OrbState;
};

export function SarahOrb({ state }: Props) {
  return (
    <div className="w-[220px] h-[220px] md:w-[280px] md:h-[280px] relative flex items-center justify-center mx-auto select-none">

      {/* Expanding rings — speaking only */}
      {state === "speaking" && (
        <>
          <div className="absolute inset-0 rounded-full border border-cyan-400/50 sarah-orb-speak-ring-1" />
          <div className="absolute inset-0 rounded-full border border-cyan-500/40 sarah-orb-speak-ring-2" />
          <div className="absolute inset-0 rounded-full border border-teal-400/30 sarah-orb-speak-ring-3" />
        </>
      )}

      {/* Outer ambient glow */}
      <div
        className={cn(
          "absolute inset-[4%] rounded-full transition-opacity duration-700",
          state === "idle" &&
            "bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.07)_0%,transparent_70%)]",
          state === "speaking" &&
            "bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.22)_0%,transparent_65%)]",
          state === "listening" &&
            "bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.15)_0%,transparent_65%)]",
          state === "thinking" &&
            "bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.11)_0%,transparent_65%)]"
        )}
      />

      {/* Spinning dashed ring — thinking only */}
      {state === "thinking" && (
        <div className="absolute inset-[10%] rounded-full border border-dashed border-sky-400/30 sarah-orb-thinking" />
      )}

      {/* Outer solid ring */}
      <div
        className={cn(
          "absolute inset-[8%] rounded-full border transition-all duration-500",
          state === "idle" && "border-cyan-500/15",
          state === "speaking" && "border-cyan-400/55",
          state === "listening" && "border-teal-400/45",
          state === "thinking" && "border-sky-400/25"
        )}
      />

      {/* Core orb */}
      <div
        className={cn(
          "relative w-[60%] h-[60%] rounded-full",
          state === "idle" && "sarah-orb-idle",
          state === "speaking" && "sarah-orb-speaking",
          state === "listening" && "sarah-orb-listening",
          state === "thinking" && "sarah-orb-thinking-core"
        )}
      >
        {/* Base gradient — deep navy */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0e2a5c] via-[#0a1e44] to-[#050f22]" />

        {/* Inner colour glow */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-opacity duration-500",
            state === "idle" &&
              "bg-[radial-gradient(ellipse_at_40%_35%,rgba(14,165,233,0.25)_0%,transparent_55%)]",
            state === "speaking" &&
              "bg-[radial-gradient(ellipse_at_40%_35%,rgba(6,182,212,0.48)_0%,transparent_55%)]",
            state === "listening" &&
              "bg-[radial-gradient(ellipse_at_40%_35%,rgba(20,184,166,0.38)_0%,transparent_55%)]",
            state === "thinking" &&
              "bg-[radial-gradient(ellipse_at_40%_35%,rgba(56,189,248,0.32)_0%,transparent_55%)]"
          )}
        />

        {/* Specular highlight */}
        <div className="absolute top-[14%] left-[18%] w-[38%] h-[22%] rounded-full bg-white/20 blur-sm" />

        {/* Centre dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "rounded-full transition-all duration-500",
              state === "idle" && "w-2 h-2 bg-cyan-300/40",
              state === "speaking" && "w-3 h-3 bg-cyan-200/75",
              state === "listening" && "w-2.5 h-2.5 bg-teal-300/65",
              state === "thinking" && "w-2 h-2 bg-sky-300/55"
            )}
          />
        </div>
      </div>
    </div>
  );
}
