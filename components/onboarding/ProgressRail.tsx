"use client";

import { cn } from "@/lib/utils";
import { TOTAL_XP } from "@/lib/onboarding-questions";
import { useEffect, useRef, useState } from "react";

type Props = {
  currentSection: string;
  sectionNumber: number;
  totalSections: number;
  overallPct: number;
  xp: number;
};

export function ProgressRail({
  currentSection,
  sectionNumber,
  totalSections,
  overallPct,
  xp,
}: Props) {
  const [displayXp, setDisplayXp] = useState(xp);
  const [flash, setFlash] = useState(false);
  const prevXp = useRef(xp);

  useEffect(() => {
    if (xp !== prevXp.current) {
      setFlash(true);
      const start = prevXp.current;
      const end = xp;
      const duration = 600;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setDisplayXp(Math.round(start + (end - start) * progress));
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      prevXp.current = xp;

      const timer = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(timer);
    }
  }, [xp]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border/60">
      <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-6">
        {/* Section */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40">
            Section
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground/70">
            {sectionNumber}/{totalSections}
          </span>
          <span className="text-[11px] text-muted-foreground/40">·</span>
          <span className="text-[11px] font-medium text-foreground/60">{currentSection}</span>
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <progress
            value={overallPct}
            max={100}
            aria-label={`Discovery ${overallPct}% complete`}
            className="bmk-progress h-[3px] w-full"
          />
        </div>

        {/* XP */}
        <div
          className={cn(
            "shrink-0 flex items-center gap-1.5 transition-all duration-300",
            flash && "scale-110"
          )}
        >
          <span
            className={cn(
              "text-[13px] font-semibold tabular-nums transition-colors duration-300",
              flash ? "text-gold" : "text-muted-foreground/60"
            )}
          >
            {displayXp.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-muted-foreground/35">
            XP
          </span>
        </div>
      </div>
    </div>
  );
}
