"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";
import { PlasmaOrb, type OrbState } from "./PlasmaOrb";

export type { OrbState } from "./PlasmaOrb";

type Props = {
  state?: OrbState;
  className?: string;
};

export default function OrbCanvas({ state = "idle", className }: Props) {
  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.4], fov: 35, near: 0.1, far: 50 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color("#000000"), 0);
          scene.background = null;
        }}
      >
        <Suspense fallback={null}>
          <PlasmaOrb state={state} />
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom
              intensity={1.4}
              luminanceThreshold={0.05}
              luminanceSmoothing={0.85}
              mipmapBlur
              kernelSize={KernelSize.HUGE}
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={new THREE.Vector2(0.0012, 0.0018)}
              radialModulation
              modulationOffset={0.35}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
