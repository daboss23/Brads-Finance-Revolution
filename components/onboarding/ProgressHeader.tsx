"use client";

import { useEffect, useRef, useState } from "react";
import { NewcastleEmblem } from "@/components/logo/newcastle-logo";
import { cn } from "@/lib/utils";

type Props = {
  sectionName: string;
  sectionNumber: number;
  totalSections: number;
  overallPct: number;
  xp: number;
};

export function ProgressHeader({
  sectionName,
  sectionNumber,
  totalSections,
  overallPct,
  xp,
}: Props) {
  const [displayXp, setDisplayXp] = useState(xp);
  const [flash, setFlash] = useState(false);
  const prevXp = useRef(xp);

  useEffect(() => {
    if (xp === prevXp.current) return;
    setFlash(true);
    const start = prevXp.current;
    const end = xp;
    const duration = 650;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      setDisplayXp(Math.round(start + (end - start) * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prevXp.current = xp;
    const t = setTimeout(() => setFlash(false), 1000);
    return () => clearTimeout(t);
  }, [xp]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/70">
      {/* Progress bar */}
      <progress
        value={overallPct}
        max={100}
        className="bmk-progress block w-full rounded-none"
      />

      <div className="flex items-center justify-between px-6 py-3 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <NewcastleEmblem size={26} />
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold/75 hidden sm:block">
            Financial Discovery
          </span>
        </div>

        {/* Section indicator */}
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-foreground/45 hidden sm:inline">Section</span>
          <span className="font-bold text-foreground/90 tabular-nums">{sectionNumber}</span>
          <span className="text-foreground/30">/</span>
          <span className="text-foreground/55 tabular-nums">{totalSections}</span>
          <span className="text-foreground/25 mx-1">·</span>
          <span className="text-foreground/85 font-semibold">{sectionName}</span>
        </div>

        {/* XP */}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 transition-all duration-300",
            flash
              ? "border-gold/50 bg-gold/15 scale-110"
              : "border-border/70 bg-card/60"
          )}
        >
          <span
            className={cn(
              "text-[14px] font-bold tabular-nums transition-colors duration-300",
              flash ? "text-gold" : "text-foreground/85"
            )}
          >
            {displayXp.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-gold/70">
            XP
          </span>
        </div>
      </div>
    </div>
  );
}
