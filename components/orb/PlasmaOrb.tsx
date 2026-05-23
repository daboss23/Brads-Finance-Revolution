"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  PLASMA_VERT,
  PLASMA_FRAG,
  ATMOSPHERE_VERT,
  ATMOSPHERE_FRAG,
  CORE_FRAG,
} from "./shaders";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type StateUniforms = {
  intensity: number;
  hueShift: number;
  speed: number;
  displacement: number;
  plasmaA: THREE.Color;
  plasmaB: THREE.Color;
  plasmaC: THREE.Color;
  atmoColor: THREE.Color;
  rimColor: THREE.Color;
};

const STATE_TARGETS: Record<OrbState, StateUniforms> = {
  idle: {
    intensity: 1.0,
    hueShift: 0.0,
    speed: 0.55,
    displacement: 0.14,
    plasmaA: new THREE.Color("#0a1f6e"),
    plasmaB: new THREE.Color("#1ea0ff"),
    plasmaC: new THREE.Color("#84d8ff"),
    atmoColor: new THREE.Color("#3aa7ff"),
    rimColor: new THREE.Color("#8edcff"),
  },
  thinking: {
    intensity: 0.9,
    hueShift: 0.0,
    speed: 0.95,
    displacement: 0.2,
    plasmaA: new THREE.Color("#2a0e60"),
    plasmaB: new THREE.Color("#7b2fff"),
    plasmaC: new THREE.Color("#dbb6ff"),
    atmoColor: new THREE.Color("#9a55ff"),
    rimColor: new THREE.Color("#d6b3ff"),
  },
  listening: {
    intensity: 1.05,
    hueShift: 0.0,
    speed: 0.75,
    displacement: 0.16,
    plasmaA: new THREE.Color("#062d4d"),
    plasmaB: new THREE.Color("#26d6ff"),
    plasmaC: new THREE.Color("#ffd87a"),
    atmoColor: new THREE.Color("#2bd6e8"),
    rimColor: new THREE.Color("#ffe07a"),
  },
  speaking: {
    intensity: 1.1,
    hueShift: 0.6,
    speed: 1.5,
    displacement: 0.22,
    plasmaA: new THREE.Color("#1a1a6a"),
    plasmaB: new THREE.Color("#5a78ff"),
    plasmaC: new THREE.Color("#a8d4ff"),
    atmoColor: new THREE.Color("#8ec9ff"),
    rimColor: new THREE.Color("#cfe8ff"),
  },
};

function cloneStateUniforms(s: StateUniforms): StateUniforms {
  return {
    intensity: s.intensity,
    hueShift: s.hueShift,
    speed: s.speed,
    displacement: s.displacement,
    plasmaA: s.plasmaA.clone(),
    plasmaB: s.plasmaB.clone(),
    plasmaC: s.plasmaC.clone(),
    atmoColor: s.atmoColor.clone(),
    rimColor: s.rimColor.clone(),
  };
}

export function PlasmaOrb({ state = "idle" }: { state?: OrbState }) {
  const plasmaMatRef = useRef<THREE.ShaderMaterial>(null);
  const atmoMatRef = useRef<THREE.ShaderMaterial>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null);
  const shellGroupRef = useRef<THREE.Group>(null);

  const currentRef = useRef<StateUniforms>(cloneStateUniforms(STATE_TARGETS[state]));
  const lastTargetRef = useRef<OrbState>(state);

  const plasmaUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: currentRef.current.speed },
      uDisplacement: { value: currentRef.current.displacement },
      uColorA: { value: currentRef.current.plasmaA.clone() },
      uColorB: { value: currentRef.current.plasmaB.clone() },
      uColorC: { value: currentRef.current.plasmaC.clone() },
      uIntensity: { value: currentRef.current.intensity },
      uHueShift: { value: currentRef.current.hueShift },
    }),
    []
  );
  const atmoUniforms = useMemo(
    () => ({
      uColor: { value: currentRef.current.atmoColor.clone() },
      uIntensity: { value: currentRef.current.intensity },
    }),
    []
  );
  const coreUniforms = useMemo(
    () => ({
      uRim: { value: currentRef.current.rimColor.clone() },
      uIntensity: { value: currentRef.current.intensity },
    }),
    []
  );

  useFrame((stateRf, dt) => {
    const elapsed = stateRf.clock.elapsedTime;

    if (state !== lastTargetRef.current) {
      lastTargetRef.current = state;
    }
    const target = STATE_TARGETS[lastTargetRef.current];
    const k = Math.min(1, dt * 3.2);
    const cur = currentRef.current;
    cur.intensity = THREE.MathUtils.lerp(cur.intensity, target.intensity, k);
    cur.hueShift = THREE.MathUtils.lerp(cur.hueShift, target.hueShift, k);
    cur.speed = THREE.MathUtils.lerp(cur.speed, target.speed, k);
    cur.displacement = THREE.MathUtils.lerp(cur.displacement, target.displacement, k);
    cur.plasmaA.lerp(target.plasmaA, k);
    cur.plasmaB.lerp(target.plasmaB, k);
    cur.plasmaC.lerp(target.plasmaC, k);
    cur.atmoColor.lerp(target.atmoColor, k);
    cur.rimColor.lerp(target.rimColor, k);

    if (plasmaMatRef.current) {
      const u = plasmaMatRef.current.uniforms;
      u.uTime.value = elapsed;
      u.uSpeed.value = cur.speed;
      u.uDisplacement.value = cur.displacement;
      u.uIntensity.value = cur.intensity;
      u.uHueShift.value = cur.hueShift;
      (u.uColorA.value as THREE.Color).copy(cur.plasmaA);
      (u.uColorB.value as THREE.Color).copy(cur.plasmaB);
      (u.uColorC.value as THREE.Color).copy(cur.plasmaC);
    }
    if (atmoMatRef.current) {
      const u = atmoMatRef.current.uniforms;
      (u.uColor.value as THREE.Color).copy(cur.atmoColor);
      u.uIntensity.value = cur.intensity;
    }
    if (coreMatRef.current) {
      const u = coreMatRef.current.uniforms;
      (u.uRim.value as THREE.Color).copy(cur.rimColor);
      u.uIntensity.value = cur.intensity;
    }

    if (shellGroupRef.current) {
      shellGroupRef.current.rotation.y += dt * 0.06 * cur.speed;
      shellGroupRef.current.rotation.x =
        Math.sin(elapsed * 0.18 * cur.speed) * 0.18;
    }
  });

  return (
    <group ref={shellGroupRef}>
      <mesh>
        <sphereGeometry args={[0.85, 24, 24]} />
        <shaderMaterial
          ref={coreMatRef}
          vertexShader={ATMOSPHERE_VERT}
          fragmentShader={CORE_FRAG}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <icosahedronGeometry args={[1.05, 4]} />
        <shaderMaterial
          ref={plasmaMatRef}
          vertexShader={PLASMA_VERT}
          fragmentShader={PLASMA_FRAG}
          uniforms={plasmaUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.55, 24, 24]} />
        <shaderMaterial
          ref={atmoMatRef}
          vertexShader={ATMOSPHERE_VERT}
          fragmentShader={ATMOSPHERE_FRAG}
          uniforms={atmoUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
