"use client";

import { Suspense, Component, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { PlasmaOrb, type OrbState } from "./PlasmaOrb";

export type { OrbState } from "./PlasmaOrb";

type Props = {
  state?: OrbState;
  className?: string;
};

function CssFallbackOrb({ state }: { state: OrbState }) {
  const palette: Record<OrbState, string> = {
    idle: "from-cyan-400/40 via-blue-600/30 to-indigo-900/30",
    thinking: "from-fuchsia-400/40 via-purple-600/30 to-indigo-900/40",
    listening: "from-teal-300/45 via-cyan-500/30 to-blue-900/30",
    speaking: "from-white/60 via-cyan-400/40 to-purple-700/40",
  };
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className={`w-3/4 h-3/4 rounded-full bg-gradient-to-br ${palette[state]} blur-2xl animate-pulse`}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-br from-white/30 to-cyan-300/20 blur-md" />
      </div>
    </div>
  );
}

class OrbErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.error("[OrbCanvas] caught:", err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function OrbCanvas({ state = "idle", className }: Props) {
  const [contextLost, setContextLost] = useState(false);

  if (contextLost) {
    return (
      <div className={className}>
        <CssFallbackOrb state={state} />
      </div>
    );
  }

  return (
    <div className={className}>
      <OrbErrorBoundary fallback={<CssFallbackOrb state={state} />}>
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6.0], fov: 32, near: 0.1, far: 50 }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(0x000000, 0);
            gl.setClearAlpha(0);
            scene.background = null;
            const canvas = gl.domElement;
            canvas.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              console.warn("[OrbCanvas] WebGL context lost");
              setContextLost(true);
            });
            canvas.addEventListener("webglcontextrestored", () => {
              console.warn("[OrbCanvas] WebGL context restored");
              setContextLost(false);
            });
          }}
        >
          <Suspense fallback={null}>
            <PlasmaOrb state={state} />
          </Suspense>
        </Canvas>
      </OrbErrorBoundary>
    </div>
  );
}
