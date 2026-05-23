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
  FILAMENT_VERT,
  FILAMENT_FRAG,
  EMBER_VERT,
  EMBER_FRAG,
} from "./shaders";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

type StateUniforms = {
  intensity: number;
  hueShift: number;
  speed: number;
  curl: number;
  reach: number;
  displacement: number;
  filamentBright: THREE.Color;
  filamentDeep: THREE.Color;
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
    curl: 0.35,
    reach: 0.55,
    displacement: 0.12,
    filamentBright: new THREE.Color("#79e8ff"),
    filamentDeep: new THREE.Color("#1758ff"),
    plasmaA: new THREE.Color("#0a1f6e"),
    plasmaB: new THREE.Color("#1ea0ff"),
    plasmaC: new THREE.Color("#84d8ff"),
    atmoColor: new THREE.Color("#3aa7ff"),
    rimColor: new THREE.Color("#8edcff"),
    emberColor: new THREE.Color("#cfeeff"),
  },
  thinking: {
    intensity: 0.9,
    hueShift: 0.0,
    speed: 0.95,
    curl: 0.55,
    reach: 0.5,
    displacement: 0.18,
    filamentBright: new THREE.Color("#c8a4ff"),
    filamentDeep: new THREE.Color("#5b1ed0"),
    plasmaA: new THREE.Color("#2a0e60"),
    plasmaB: new THREE.Color("#7b2fff"),
    plasmaC: new THREE.Color("#dbb6ff"),
    atmoColor: new THREE.Color("#9a55ff"),
    rimColor: new THREE.Color("#d6b3ff"),
    emberColor: new THREE.Color("#dec5ff"),
  },
  listening: {
    intensity: 1.05,
    hueShift: 0.0,
    speed: 0.75,
    curl: 0.42,
    reach: 0.7,
    displacement: 0.14,
    filamentBright: new THREE.Color("#9af6ff"),
    filamentDeep: new THREE.Color("#0aa3c8"),
    plasmaA: new THREE.Color("#062d4d"),
    plasmaB: new THREE.Color("#26d6ff"),
    plasmaC: new THREE.Color("#ffd87a"),
    atmoColor: new THREE.Color("#2bd6e8"),
    rimColor: new THREE.Color("#ffe07a"),
    emberColor: new THREE.Color("#bff5ff"),
  },
  speaking: {
    intensity: 1.5,
    hueShift: 1.0,
    speed: 1.6,
    curl: 0.75,
    reach: 0.8,
    displacement: 0.22,
    filamentBright: new THREE.Color("#ffffff"),
    filamentDeep: new THREE.Color("#3a6cff"),
    plasmaA: new THREE.Color("#1a1a6a"),
    plasmaB: new THREE.Color("#5a78ff"),
    plasmaC: new THREE.Color("#ffffff"),
    atmoColor: new THREE.Color("#8ec9ff"),
    rimColor: new THREE.Color("#ffffff"),
    emberColor: new THREE.Color("#ffffff"),
  },
};

function lerpUniforms(
  out: StateUniforms,
  a: StateUniforms,
  b: StateUniforms,
  t: number
) {
  out.intensity = THREE.MathUtils.lerp(a.intensity, b.intensity, t);
  out.hueShift = THREE.MathUtils.lerp(a.hueShift, b.hueShift, t);
  out.speed = THREE.MathUtils.lerp(a.speed, b.speed, t);
  out.curl = THREE.MathUtils.lerp(a.curl, b.curl, t);
  out.reach = THREE.MathUtils.lerp(a.reach, b.reach, t);
  out.displacement = THREE.MathUtils.lerp(a.displacement, b.displacement, t);
  out.filamentBright.copy(a.filamentBright).lerp(b.filamentBright, t);
  out.filamentDeep.copy(a.filamentDeep).lerp(b.filamentDeep, t);
  out.plasmaA.copy(a.plasmaA).lerp(b.plasmaA, t);
  out.plasmaB.copy(a.plasmaB).lerp(b.plasmaB, t);
  out.plasmaC.copy(a.plasmaC).lerp(b.plasmaC, t);
  out.atmoColor.copy(a.atmoColor).lerp(b.atmoColor, t);
  out.rimColor.copy(a.rimColor).lerp(b.rimColor, t);
  out.emberColor.copy(a.emberColor).lerp(b.emberColor, t);
}

const TRANSITION_SEC = 0.8;
const TENDRILS = 28;
const POINTS_PER_TENDRIL = 90;
const EMBER_COUNT = 360;

function cloneStateUniforms(s: StateUniforms): StateUniforms {
  return {
    intensity: s.intensity,
    hueShift: s.hueShift,
    speed: s.speed,
    curl: s.curl,
    reach: s.reach,
    displacement: s.displacement,
    filamentBright: s.filamentBright.clone(),
    filamentDeep: s.filamentDeep.clone(),
    plasmaA: s.plasmaA.clone(),
    plasmaB: s.plasmaB.clone(),
    plasmaC: s.plasmaC.clone(),
    atmoColor: s.atmoColor.clone(),
    rimColor: s.rimColor.clone(),
    emberColor: s.emberColor.clone(),
  };
}

export function PlasmaOrb({ state = "idle" }: { state?: OrbState }) {
  // Shader material refs to push uniforms each frame without re-rendering React.
  const plasmaMatRef = useRef<THREE.ShaderMaterial>(null);
  const atmoMatRef = useRef<THREE.ShaderMaterial>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null);
  const filamentMatRef = useRef<THREE.ShaderMaterial>(null);
  const emberMatRef = useRef<THREE.ShaderMaterial>(null);
  const shellGroupRef = useRef<THREE.Group>(null);

  // Current interpolated state and transition trackers.
  const currentRef = useRef<StateUniforms>(cloneStateUniforms(STATE_TARGETS[state]));
  const prevTargetRef = useRef<OrbState>(state);
  const lastTargetRef = useRef<OrbState>(state);
  const transitionStartRef = useRef<number>(0);

  // Filament geometry: TENDRILS * POINTS_PER_TENDRIL points, each with aPathU + aTendril attributes.
  const filamentGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const total = TENDRILS * POINTS_PER_TENDRIL;
    const positions = new Float32Array(total * 3); // dummy positions overwritten in shader.
    const pathU = new Float32Array(total);
    const tendril = new Float32Array(total);
    for (let t = 0; t < TENDRILS; t++) {
      for (let i = 0; i < POINTS_PER_TENDRIL; i++) {
        const idx = t * POINTS_PER_TENDRIL + i;
        pathU[idx] = i / (POINTS_PER_TENDRIL - 1);
        tendril[idx] = t;
      }
    }
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aPathU", new THREE.BufferAttribute(pathU, 1));
    geom.setAttribute("aTendril", new THREE.BufferAttribute(tendril, 1));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 5);
    return geom;
  }, []);

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

  // Initial uniforms (must reference current.* so the materials initialise correctly).
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
  const filamentUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: currentRef.current.speed },
      uReach: { value: currentRef.current.reach * 2.2 },
      uCoreRadius: { value: 1.05 },
      uIntensity: { value: currentRef.current.intensity },
      uCurlAmount: { value: currentRef.current.curl * 1.8 },
      uPixelSize: { value: 1.4 },
      uColorBright: { value: currentRef.current.filamentBright.clone() },
      uColorDeep: { value: currentRef.current.filamentDeep.clone() },
      uHueShift: { value: currentRef.current.hueShift },
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

    // Track target changes (state prop).
    if (state !== lastTargetRef.current) {
      prevTargetRef.current = lastTargetRef.current;
      lastTargetRef.current = state;
      transitionStartRef.current = elapsed;
      // Snapshot current as prev for the lerp.
      // (currentRef already holds the live interpolated values.)
    }
    const transitionElapsed = elapsed - transitionStartRef.current;
    const t = Math.min(1, Math.max(0, transitionElapsed / TRANSITION_SEC));
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Lerp current toward target. We treat currentRef as continuous so the
    // transition feels smooth even if the user spams state changes.
    const target = STATE_TARGETS[lastTargetRef.current];
    // Approach target by easing rate so we never overshoot.
    const approach = 1 - Math.pow(1 - eased, 1);
    void approach;
    // Use a per-frame ease toward target proportional to dt (acts like a critically damped spring).
    const k = Math.min(1, dt * 3.2);
    const cur = currentRef.current;
    cur.intensity = THREE.MathUtils.lerp(cur.intensity, target.intensity, k);
    cur.hueShift = THREE.MathUtils.lerp(cur.hueShift, target.hueShift, k);
    cur.speed = THREE.MathUtils.lerp(cur.speed, target.speed, k);
    cur.curl = THREE.MathUtils.lerp(cur.curl, target.curl, k);
    cur.reach = THREE.MathUtils.lerp(cur.reach, target.reach, k);
    cur.displacement = THREE.MathUtils.lerp(cur.displacement, target.displacement, k);
    cur.filamentBright.lerp(target.filamentBright, k);
    cur.filamentDeep.lerp(target.filamentDeep, k);
    cur.plasmaA.lerp(target.plasmaA, k);
    cur.plasmaB.lerp(target.plasmaB, k);
    cur.plasmaC.lerp(target.plasmaC, k);
    cur.atmoColor.lerp(target.atmoColor, k);
    cur.rimColor.lerp(target.rimColor, k);
    cur.emberColor.lerp(target.emberColor, k);

    // Push uniforms.
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
    if (filamentMatRef.current) {
      const u = filamentMatRef.current.uniforms;
      u.uTime.value = elapsed;
      u.uSpeed.value = cur.speed;
      u.uReach.value = cur.reach * 2.2;
      u.uIntensity.value = cur.intensity;
      u.uCurlAmount.value = cur.curl * 1.8;
      u.uHueShift.value = cur.hueShift;
      (u.uColorBright.value as THREE.Color).copy(cur.filamentBright);
      (u.uColorDeep.value as THREE.Color).copy(cur.filamentDeep);
    }
    if (emberMatRef.current) {
      const u = emberMatRef.current.uniforms;
      u.uTime.value = elapsed;
      u.uSpeed.value = cur.speed;
      u.uReach.value = cur.reach * 2.5;
      u.uIntensity.value = cur.intensity;
      (u.uColor.value as THREE.Color).copy(cur.emberColor);
    }

    // Slow drift rotation of the whole shell so the noise reads as moving plasma.
    if (shellGroupRef.current) {
      shellGroupRef.current.rotation.y += dt * 0.05 * cur.speed;
      shellGroupRef.current.rotation.x =
        Math.sin(elapsed * 0.18 * cur.speed) * 0.18;
    }
  });

  return (
    <group ref={shellGroupRef}>
      {/* Core singularity */}
      <mesh>
        <sphereGeometry args={[0.85, 64, 64]} />
        <shaderMaterial
          ref={coreMatRef}
          vertexShader={ATMOSPHERE_VERT}
          fragmentShader={CORE_FRAG}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Plasma shell (noise-displaced surface, fresnel + animated emissive) */}
      <mesh>
        <icosahedronGeometry args={[1.05, 5]} />
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

      {/* Filaments — GPU points along curl-noise-displaced radial paths */}
      <points geometry={filamentGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={filamentMatRef}
          vertexShader={FILAMENT_VERT}
          fragmentShader={FILAMENT_FRAG}
          uniforms={filamentUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Embers — drifting outward GPU points */}
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

      {/* Atmospheric halo — backside sphere, inverse fresnel for soft bloom */}
      <mesh>
        <sphereGeometry args={[1.6, 64, 64]} />
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
