"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import { PlasmaOrb, type OrbState } from "./PlasmaOrb";

export type { OrbState } from "./PlasmaOrb";

type Props = {
  state?: OrbState;
  className?: string;
};

export default function OrbCanvas({ state = "idle", className }: Props) {
  return (
    <div className={className}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.4], fov: 35, near: 0.1, far: 50 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          gl.setClearAlpha(0);
          scene.background = null;
        }}
      >
        <Suspense fallback={null}>
          <PlasmaOrb state={state} />
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom
              intensity={1.3}
              luminanceThreshold={0.12}
              luminanceSmoothing={0.85}
              mipmapBlur
              kernelSize={KernelSize.LARGE}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
