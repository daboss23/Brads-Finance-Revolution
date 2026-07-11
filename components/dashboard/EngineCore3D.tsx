"use client";

// The dashboard's Intelligence Flow core: the same 3D Fusion Core that
// powers Sarah's discovery session, idling at the heart of the engine.

import dynamic from "next/dynamic";

const OrbCanvas = dynamic(() => import("@/components/orb/OrbCanvas"), {
  ssr: false,
  loading: () => (
    <div className="size-full rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.14),transparent_65%)]" />
  ),
});

export function EngineCore3D({ className }: { className?: string }) {
  return <OrbCanvas state="thinking" className={className} />;
}
