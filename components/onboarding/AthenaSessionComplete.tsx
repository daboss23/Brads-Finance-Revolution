"use client";

// Closing card for a finished discovery session, shared by both Athenas.
export function AthenaSessionComplete() {
  return (
    <div className="relative shrink-0 flex flex-col items-center py-8 px-6 onboarding-rise">
      <div className="glass-panel glass-rim-emerald glass-grain flex w-full max-w-[520px] flex-col items-center gap-3 rounded-[24px] px-8 py-8 text-center">
        <span
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(158_60%_75%/0.35),transparent)]"
          aria-hidden
        />
        <div className="glass-chip flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] text-success border-success/30 shadow-[0_0_28px_-12px_hsl(var(--success)/0.6)]">
          <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_0_hsl(var(--success)/0.8)]" />
          Financial Discovery complete
        </div>
        <p className="max-w-[440px] text-center text-[13px] leading-relaxed text-foreground/70">
          Thank you. Brad will personally review everything you have shared and
          be fully prepared for your meeting.
        </p>
      </div>
    </div>
  );
}
