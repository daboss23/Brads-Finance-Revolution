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
    const duration = 600;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      setDisplayXp(Math.round(start + (end - start) * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prevXp.current = xp;
    const t = setTimeout(() => setFlash(false), 900);
    return () => clearTimeout(t);
  }, [xp]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
      {/* Progress bar */}
      <div className="h-[2px] bg-muted">
        <div
          className="h-full bg-gold transition-all duration-700 ease-out"
          style={{ width: `${overallPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-3 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <NewcastleEmblem size={24} />
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground/50 hidden sm:block">
            Financial Discovery
          </span>
        </div>

        {/* Section indicator */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-muted-foreground/40">Section</span>
          <span className="font-semibold text-muted-foreground/70">{sectionNumber}</span>
          <span className="text-muted-foreground/25">/</span>
          <span className="text-muted-foreground/40">{totalSections}</span>
          <span className="text-muted-foreground/25 mx-1">·</span>
          <span className="text-foreground/55 font-medium">{sectionName}</span>
        </div>

        {/* XP */}
        <div className={cn("flex items-center gap-1.5 transition-all duration-300", flash && "scale-110")}>
          <span className={cn("text-[13px] font-semibold tabular-nums transition-colors duration-300", flash ? "text-gold" : "text-muted-foreground/50")}>
            {displayXp.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-muted-foreground/30">XP</span>
        </div>
      </div>
    </div>
  );
}
