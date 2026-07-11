"use client";

// Sarah's Fusion Core: dual-plasma reactor with a frequency ring.
// Orange fire and electric blue energy collide at a rotating white-hot
// seam; a spectrum ring around the equator dances with Sarah's state.

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
  FREQ_VERT,
  FREQ_FRAG,
} from "./shaders";

export type OrbState = "idle" | "speaking" | "listening" | "thinking";

// The palette is fixed — molten orange vs electric blue is the identity.
// States change energy, not hue: intensity, turbulence, seam heat, how the
// fusion axis moves, and how hard the frequency ring drives.
const WARM_DEEP = new THREE.Color("#c2410c");
const WARM_BRIGHT = new THREE.Color("#ffb45e");
const COOL_DEEP = new THREE.Color("#1d4ed8");
const COOL_BRIGHT = new THREE.Color("#7fd4ff");
const ATMO_WARM = new THREE.Color("#ff7a2f");
const ATMO_COOL = new THREE.Color("#3f8dff");
const RIM_HOT = new THREE.Color("#ffe9c4");

type StateEnergy = {
  intensity: number;
  speed: number;
  displacement: number;
  reach: number;
  seamHeat: number;
  audio: number;      // frequency ring amplitude
  axisTilt: number;   // how far the fusion axis wanders off horizontal
  axisSpin: number;   // how fast the seam sweeps around the orb
};

const STATE_TARGETS: Record<OrbState, StateEnergy> = {
  idle: {
    intensity: 0.95, speed: 0.5, displacement: 0.13, reach: 0.55,
    seamHeat: 0.55, audio: 0.28, axisTilt: 0.25, axisSpin: 0.1,
  },
  listening: {
    intensity: 1.1, speed: 0.75, displacement: 0.16, reach: 0.7,
    seamHeat: 0.8, audio: 0.55, axisTilt: 0.4, axisSpin: 0.16,
  },
  thinking: {
    intensity: 1.0, speed: 1.15, displacement: 0.21, reach: 0.5,
    seamHeat: 1.0, audio: 0.4, axisTilt: 0.85, axisSpin: 0.45,
  },
  speaking: {
    intensity: 1.15, speed: 1.4, displacement: 0.19, reach: 0.85,
    seamHeat: 1.25, audio: 1.0, axisTilt: 0.35, axisSpin: 0.22,
  },
};

const EMBER_COUNT = 160;
const FREQ_BANDS = 96;
const FREQ_RUNGS = 7;

export function PlasmaOrb({ state = "idle" }: { state?: OrbState }) {
  const plasmaMatRef = useRef<THREE.ShaderMaterial>(null);
  const atmoMatRef = useRef<THREE.ShaderMaterial>(null);
  const coreMatRef = useRef<THREE.ShaderMaterial>(null);
  const emberMatRef = useRef<THREE.ShaderMaterial>(null);
  const freqMatRef = useRef<THREE.ShaderMaterial>(null);
  const shellGroupRef = useRef<THREE.Group>(null);

  const currentRef = useRef<StateEnergy>({ ...STATE_TARGETS[state] });
  const targetStateRef = useRef<OrbState>(state);
  const axisRef = useRef(new THREE.Vector3(1, 0, 0));

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

  // Frequency ring: FREQ_BANDS columns × FREQ_RUNGS points, mirrored above
  // and below the equator.
  const freqGeometry = useMemo(() => {
    const count = FREQ_BANDS * FREQ_RUNGS * 2;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const band = new Float32Array(count);
    const rung = new Float32Array(count);
    const side = new Float32Array(count);
    let i = 0;
    for (let b = 0; b < FREQ_BANDS; b++) {
      for (let r = 0; r < FREQ_RUNGS; r++) {
        for (const s of [1, -1]) {
          band[i] = b / FREQ_BANDS;
          rung[i] = r / (FREQ_RUNGS - 1);
          side[i] = s;
          i++;
        }
      }
    }
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aBand", new THREE.BufferAttribute(band, 1));
    geom.setAttribute("aRung", new THREE.BufferAttribute(rung, 1));
    geom.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 6);
    return geom;
  }, []);

  const plasmaUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: currentRef.current.speed },
      uDisplacement: { value: currentRef.current.displacement },
      uWarmDeep: { value: WARM_DEEP.clone() },
      uWarmBright: { value: WARM_BRIGHT.clone() },
      uCoolDeep: { value: COOL_DEEP.clone() },
      uCoolBright: { value: COOL_BRIGHT.clone() },
      uAxis: { value: new THREE.Vector3(1, 0, 0) },
      uIntensity: { value: currentRef.current.intensity },
      uSeamHeat: { value: currentRef.current.seamHeat },
    }),
    [],
  );
  const atmoUniforms = useMemo(
    () => ({
      uWarm: { value: ATMO_WARM.clone() },
      uCool: { value: ATMO_COOL.clone() },
      uAxis: { value: new THREE.Vector3(1, 0, 0) },
      uIntensity: { value: currentRef.current.intensity },
    }),
    [],
  );
  const coreUniforms = useMemo(
    () => ({
      uRim: { value: RIM_HOT.clone() },
      uIntensity: { value: currentRef.current.intensity },
    }),
    [],
  );
  const emberUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: currentRef.current.speed },
      uCoreRadius: { value: 1.1 },
      uReach: { value: currentRef.current.reach * 2.5 },
      uIntensity: { value: currentRef.current.intensity },
      uAxis: { value: new THREE.Vector3(1, 0, 0) },
      uWarm: { value: WARM_BRIGHT.clone() },
      uCool: { value: COOL_BRIGHT.clone() },
    }),
    [],
  );
  const freqUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudio: { value: currentRef.current.audio },
      uRadius: { value: 1.62 },
      uPixelSize: { value: 1.6 },
      uWarm: { value: WARM_BRIGHT.clone() },
      uCool: { value: COOL_BRIGHT.clone() },
    }),
    [],
  );

  useFrame((stateRf, dt) => {
    const elapsed = stateRf.clock.elapsedTime;

    if (state !== targetStateRef.current) targetStateRef.current = state;
    const target = STATE_TARGETS[targetStateRef.current];
    const k = Math.min(1, dt * 3.2);
    const cur = currentRef.current;
    cur.intensity = THREE.MathUtils.lerp(cur.intensity, target.intensity, k);
    cur.speed = THREE.MathUtils.lerp(cur.speed, target.speed, k);
    cur.displacement = THREE.MathUtils.lerp(cur.displacement, target.displacement, k);
    cur.reach = THREE.MathUtils.lerp(cur.reach, target.reach, k);
    cur.seamHeat = THREE.MathUtils.lerp(cur.seamHeat, target.seamHeat, k);
    cur.audio = THREE.MathUtils.lerp(cur.audio, target.audio, k);
    cur.axisTilt = THREE.MathUtils.lerp(cur.axisTilt, target.axisTilt, k);
    cur.axisSpin = THREE.MathUtils.lerp(cur.axisSpin, target.axisSpin, k);

    // The fusion axis sweeps slowly around the orb and nods with the
    // state's tilt — thinking makes the seam churn, idle lets it drift.
    const spin = elapsed * cur.axisSpin;
    axisRef.current
      .set(
        Math.cos(spin),
        Math.sin(elapsed * 0.31) * cur.axisTilt,
        Math.sin(spin) * 0.6,
      )
      .normalize();

    if (plasmaMatRef.current) {
      const u = plasmaMatRef.current.uniforms;
      u.uTime.value = elapsed;
      u.uSpeed.value = cur.speed;
      u.uDisplacement.value = cur.displacement;
      u.uIntensity.value = cur.intensity;
      u.uSeamHeat.value = cur.seamHeat;
      (u.uAxis.value as THREE.Vector3).copy(axisRef.current);
    }
    if (atmoMatRef.current) {
      const u = atmoMatRef.current.uniforms;
      u.uIntensity.value = cur.intensity;
      (u.uAxis.value as THREE.Vector3).copy(axisRef.current);
    }
    if (coreMatRef.current) {
      coreMatRef.current.uniforms.uIntensity.value = cur.intensity;
    }
    if (emberMatRef.current) {
      const u = emberMatRef.current.uniforms;
      u.uTime.value = elapsed;
      u.uSpeed.value = cur.speed;
      u.uReach.value = cur.reach * 2.5;
      u.uIntensity.value = cur.intensity;
      (u.uAxis.value as THREE.Vector3).copy(axisRef.current);
    }
    if (freqMatRef.current) {
      const u = freqMatRef.current.uniforms;
      u.uTime.value = elapsed;
      u.uAudio.value = cur.audio;
    }

    if (shellGroupRef.current) {
      shellGroupRef.current.rotation.y += dt * 0.06 * cur.speed;
      shellGroupRef.current.rotation.x =
        Math.sin(elapsed * 0.18 * cur.speed) * 0.16;
    }
  });

  return (
    <>
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

        {/* Atmospheric halo — dual-tinted around the fusion axis */}
        <mesh>
          <sphereGeometry args={[1.28, 24, 24]} />
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

        {/* Embers — sparks escaping each pole, rising as they fade */}
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

      {/* Frequency ring — stays level while the shell rotates inside it */}
      <group rotation={[0.42, 0, -0.12]}>
        <points geometry={freqGeometry} frustumCulled={false}>
          <shaderMaterial
            ref={freqMatRef}
            vertexShader={FREQ_VERT}
            fragmentShader={FREQ_FRAG}
            uniforms={freqUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </>
  );
}
