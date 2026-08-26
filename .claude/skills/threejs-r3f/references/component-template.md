# Four-file scene skeleton

Copy this when starting a new 3D feature. Replace `Xyz` with the feature name.
It already wires in the SSR-safe wrapper, the WebGL fallback + context-loss
recovery, and a minimal fresnel glow shader — all following the house rules in
`SKILL.md`. Delete what a given scene does not need.

## `shaders.ts`

```ts
// A minimal additive fresnel-glow shader. Keep ALL glsl here, never inline.
export const GLOW_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
    gl_FragColor = vec4(uColor * fres * uIntensity, fres);
  }
`;
```

## `Xyz.tsx` — the scene

```tsx
"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GLOW_VERT, GLOW_FRAG } from "./shaders";

const ACCENT = new THREE.Color("#7fd4ff"); // palette is identity — fixed hue

export function Xyz({ energy = 0.6 }: { energy?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const currentRef = useRef({ intensity: energy });

  const uniforms = useMemo(
    () => ({
      uColor: { value: ACCENT.clone() },
      uIntensity: { value: energy },
    }),
    [], // build once; update .value in the loop, never rebuild
  );

  useFrame((_state, dt) => {
    const cur = currentRef.current;
    // Lerp toward the target so prop changes glide instead of popping.
    cur.intensity = THREE.MathUtils.lerp(cur.intensity, energy, Math.min(1, dt * 3.2));
    if (matRef.current) matRef.current.uniforms.uIntensity.value = cur.intensity;
  });

  return (
    <mesh>
      <icosahedronGeometry args={[1, 4]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={GLOW_VERT}
        fragmentShader={GLOW_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
```

## `XyzCanvas.tsx` — the host + fallback

```tsx
"use client";

import { Component, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Xyz } from "./Xyz";

function CssFallback() {
  return (
    <div className="relative size-full">
      <div className="absolute inset-1/4 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.2),transparent_65%)] blur-2xl" />
    </div>
  );
}

class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.error("[XyzCanvas] caught:", err);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default function XyzCanvas({ className }: { className?: string }) {
  const [contextLost, setContextLost] = useState(false);
  if (contextLost) return <div className={className}><CssFallback /></div>;

  return (
    <div className={className}>
      <SceneErrorBoundary fallback={<CssFallback />}>
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6], fov: 32, near: 0.1, far: 50 }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(0x000000, 0);
            gl.setClearAlpha(0);
            scene.background = null;
            const canvas = gl.domElement;
            canvas.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              setContextLost(true);
            });
            canvas.addEventListener("webglcontextrestored", () => setContextLost(false));
          }}
        >
          <Xyz />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
```

## `Xyz3D.tsx` — the SSR-safe wrapper (the only file pages import)

```tsx
"use client";

import dynamic from "next/dynamic";

const XyzCanvas = dynamic(() => import("./XyzCanvas"), {
  ssr: false, // WebGL cannot render on the server
  loading: () => (
    <div className="size-full rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.14),transparent_65%)]" />
  ),
});

export function Xyz3D({ className }: { className?: string }) {
  return <XyzCanvas className={className} />;
}
```

## Wiring it into a page

Import only the `Xyz3D` wrapper, and make decorative canvases ignore input:

```tsx
<Xyz3D className="pointer-events-none absolute inset-0" />
```

Then verify: `npm run lint && npx tsc --noEmit`.
