"use client";

import { Component, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { AgentChain, type ChainAgentInput } from "./AgentChain";

type Props = {
  agents?: ChainAgentInput[];
  className?: string;
};

// A calm constellation of dots when WebGL is unavailable — never a broken box.
function CssFallbackChain() {
  return (
    <div className="relative size-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_50%,hsl(var(--gold)/0.08),transparent_70%)]" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-6 opacity-70">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="size-2.5 rounded-full bg-gold/60 blur-[1px] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

class ChainErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.error("[AgentChainCanvas] caught:", err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function AgentChainCanvas({ agents, className }: Props) {
  const [contextLost, setContextLost] = useState(false);

  if (contextLost) {
    return (
      <div className={className}>
        <CssFallbackChain />
      </div>
    );
  }

  return (
    <div className={className}>
      <ChainErrorBoundary fallback={<CssFallbackChain />}>
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 1.5]}
          camera={{ position: [0, -0.1, 7.6], fov: 34, near: 0.1, far: 60 }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(0x000000, 0);
            gl.setClearAlpha(0);
            scene.background = null;
            const canvas = gl.domElement;
            canvas.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              console.warn("[AgentChainCanvas] WebGL context lost");
              setContextLost(true);
            });
            canvas.addEventListener("webglcontextrestored", () => {
              console.warn("[AgentChainCanvas] WebGL context restored");
              setContextLost(false);
            });
          }}
        >
          <AgentChain agents={agents} />
        </Canvas>
      </ChainErrorBoundary>
    </div>
  );
}
