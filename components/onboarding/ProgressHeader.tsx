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
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      {/* Progress bar */}
      <progress
        value={overallPct}
        max={100}
        className="bmk-progress block w-full rounded-none"
      />

      <div className="flex items-center justify-between px-6 py-3 max-w-3xl mx-auto">
        {/* Brand — mirrors the BMK sidebar */}
        <div className="flex items-center gap-3">
          <NewcastleEmblem size={32} />
          <div className="hidden sm:flex flex-col gap-0.5 leading-none">
            <span className="text-[11px] font-extralight tracking-[0.26em] uppercase text-foreground/90">
              Newcastle
            </span>
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-gold/75 mt-0.5">
              Financial Discovery
            </span>
          </div>
        </div>

        {/* Section indicator */}
        <div className="flex items-center gap-2 text-[12.5px]">
          <span className="text-muted-foreground/60 hidden sm:inline">Section</span>
          <span className="font-bold text-foreground tabular-nums">{sectionNumber}</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-muted-foreground/70 tabular-nums">{totalSections}</span>
          <span className="text-muted-foreground/35 mx-1">·</span>
          <span className="text-foreground/90 font-semibold">{sectionName}</span>
        </div>

        {/* XP */}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 transition-colors duration-300",
            flash
              ? "border-gold/55 bg-gold/15"
              : "border-border bg-background"
          )}
        >
          <span
            className={cn(
              "text-[14px] font-bold tabular-nums transition-colors duration-300",
              flash ? "text-gold" : "text-foreground/90"
            )}
          >
            {displayXp.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold tracking-[0.16em] uppercase text-gold/75">
            XP
          </span>
        </div>
      </div>
    </div>
  );
}
