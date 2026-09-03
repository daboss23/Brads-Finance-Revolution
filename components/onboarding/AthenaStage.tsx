"use client";

import type { MutableRefObject, ReactNode } from "react";
import dynamic from "next/dynamic";
import { NewcastleLogoFull } from "@/components/logo/newcastle-logo";
import { cn } from "@/lib/utils";
import type { OrbState } from "@/components/orb/OrbCanvas";

const OrbCanvas = dynamic(() => import("@/components/orb/OrbCanvas"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  orbState: OrbState;
  /** Drives the orb's reactive motion. 0 to 1, read every frame. */
  signalRef: MutableRefObject<number>;
  statusLabel: string;
  hasError?: boolean;
  /** Sits under the orb inside the panel: subtitle, or an error and its action. */
  children: ReactNode;
  /** Sits under the panel, full width: the running transcript. */
  belowPanel?: ReactNode;
};

// The shell both Athenas share.
//
// The voice session and the text fallback are different conversations with
// different failure modes, but to the client they must be the same room: same
// orb, same heading, same status line in the same place. Keeping the chrome
// here is what stops the fallback from looking like a different product.
export function AthenaStage({
  orbState,
  signalRef,
  statusLabel,
  hasError,
  children,
  belowPanel,
}: Props) {
  return (
    <>
      {/* Header: logo lockup + headline + status — tight stack */}
      <header className="relative shrink-0 flex flex-col items-center pt-4 px-6">
        <NewcastleLogoFull size={180} />
        <h1 className="-mt-2 text-3xl md:text-5xl font-light tracking-wide text-foreground text-center">
          Financial Discovery Session
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              hasError ? "bg-destructive/80" : "bg-success/80",
            )}
          />
          <span
            className={cn(
              "text-[13px] tracking-wide",
              hasError ? "text-destructive/85" : "text-foreground/55",
            )}
          >
            {statusLabel}
          </span>
        </div>
      </header>

      {/* Orb + subtitle — natural stack, no flex-1 dead space */}
      <main className="relative shrink-0 flex flex-col items-center px-6 mt-8">
        <div className="relative rounded-[28px] border border-white/10 bg-black p-8 sm:p-12 w-full max-w-[720px] flex flex-col items-center overflow-hidden shadow-[0_28px_80px_-36px_hsl(0_0%_0%/0.95)]">
          <OrbCanvas
            state={orbState}
            signalRef={signalRef}
            className="w-[220px] h-[220px] md:w-[320px] md:h-[320px] shrink-0"
          />

          <div className="mt-6 w-full flex items-start justify-center px-4 min-h-[80px] max-w-[680px] mx-auto">
            {children}
          </div>
        </div>

        {belowPanel}
      </main>
    </>
  );
}
