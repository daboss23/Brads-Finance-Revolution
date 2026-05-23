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
  EMBER_VERT,
  EMBER_FRAG,
} from "./shaders";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type StateUniforms = {
  intensity: number;
  hueShift: number;
  speed: number;
  displacement: number;
  reach: number;
  plasmaA: THREE.Color;
  plasmaB: THREE.Color;
  plasmaC: THREE.Color;
  atmoColor: THREE.Color;
  rimColor: THREE.Color;
  emberColor: THREE.Color;
};

const STATE_TARGETS: Record<OrbState, StateUniforms> = {
  idle: {
    intensity: 1.0,
    hueShift: 0.0,
    speed: 0.55,
    displacement: 0.14,
    reach: 0.55,
    plasmaA: new THREE.Color("#0a1f6e"),
    plasmaB: new THREE.Color("#1ea0ff"),
    plasmaC: new THREE.Color("#84d8ff"),
    atmoColor: new THREE.Color("#3aa7ff"),
    rimColor: new THREE.Color("#8edcff"),
    emberColor: new THREE.Color("#bfe5ff"),
  },
  thinking: {
    intensity: 0.9,
    hueShift: 0.0,
    speed: 0.95,
    displacement: 0.2,
    reach: 0.5,
    plasmaA: new THREE.Color("#2a0e60"),
    plasmaB: new THREE.Color("#7b2fff"),
    plasmaC: new THREE.Color("#dbb6ff"),
    atmoColor: new THREE.Color("#9a55ff"),
    rimColor: new THREE.Color("#d6b3ff"),
    emberColor: new THREE.Color("#d8c2ff"),
  },
  listening: {
    intensity: 1.05,
    hueShift: 0.0,
    speed: 0.75,
    displacement: 0.16,
    reach: 0.7,
    plasmaA: new THREE.Color("#062d4d"),
    plasmaB: new THREE.Color("#26d6ff"),
    plasmaC: new THREE.Color("#ffd87a"),
    atmoColor: new THREE.Color("#2bd6e8"),
    rimColor: new THREE.Color("#ffe07a"),
    emberColor: new THREE.Color("#a8efff"),
  },
  speaking: {
    intensity: 1.1,
    hueShift: 0.6,
    speed: 1.5,
    displacement: 0.22,
    reach: 0.85,
    plasmaA: new THREE.Color("#1a1a6a"),
    plasmaB: new THREE.Color("#5a78ff"),
    plasmaC: new THREE.Color("#a8d4ff"),
    atmoColor: new THREE.Color("#8ec9ff"),
    rimColor: new THREE.Color("#cfe8ff"),
    emberColor: new THREE.Color("#e6f4ff"),
  },
};

function cloneStateUniforms(s: StateUniforms): StateUniforms {
  return {
    intensity: s.intensity,
    hueShift: s.hueShift,
    speed: s.speed,
    displacement: s.displacement,
    reach: s.reach,
    plasmaA: s.plasmaA.clone(),
    plasmaB: s.plasmaB.clone(),
    plasmaC: s.plasmaC.clone(),
    atmoColor: s.atmoColor.clone(),
    rimColor: s.rimColor.clone(),
    emberColor: s.emberColor.clone(),
  };
}

const EMBER_COUNT = 140;

export function PlasmaOrb({ state = "idle" }: { state?: OrbState }) {
  const plasmaMatRef = useRef<THREE.ShaderMaterial>(null);
  const atmoMatRef = useRef<THREE.ShaderMaterial>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null);
  const emberMatRef = useRef<THREE.ShaderMaterial>(null);
  const shellGroupRef = useRef<THREE.Group>(null);

  const currentRef = useRef<StateUniforms>(cloneStateUniforms(STATE_TARGETS[state]));
  const lastTargetRef = useRef<OrbState>(state);

  const emberGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(EMBER_COUNT * 3);
    const seed = new Float32Array(EMBER_COUNT);
    const life = new Float32Array(EMBER_COUNT);
    for (let i = 0; i < EMBER_COUNT; i++) {
      seed[i] = Math.random() * 100;
      life[i] = Math.random();
    }
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geom.setAttribute("aLife", new THREE.BufferAttribute(life, 1));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 6);
    return geom;
  }, []);

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
  const emberUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: currentRef.current.speed },
      uCoreRadius: { value: 1.1 },
      uReach: { value: currentRef.current.reach * 2.5 },
      uIntensity: { value: currentRef.current.intensity },
      uColor: { value: currentRef.current.emberColor.clone() },
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
    cur.reach = THREE.MathUtils.lerp(cur.reach, target.reach, k);
    cur.plasmaA.lerp(target.plasmaA, k);
    cur.plasmaB.lerp(target.plasmaB, k);
    cur.plasmaC.lerp(target.plasmaC, k);
    cur.atmoColor.lerp(target.atmoColor, k);
    cur.rimColor.lerp(target.rimColor, k);
    cur.emberColor.lerp(target.emberColor, k);

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
    if (emberMatRef.current) {
      const u = emberMatRef.current.uniforms;
      u.uTime.value = elapsed;
      u.uSpeed.value = cur.speed;
      u.uReach.value = cur.reach * 2.5;
      u.uIntensity.value = cur.intensity;
      (u.uColor.value as THREE.Color).copy(cur.emberColor);
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

      {/* Embers — drifting GPU points around the orb */}
      <points geometry={emberGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={emberMatRef}
          vertexShader={EMBER_VERT}
          fragmentShader={EMBER_FRAG}
          uniforms={emberUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
