"use client";

// The Agent Intelligence Chain as a 3D constellation. The six workflow agents
// (Sarah to ATLAS) sit along a gentle arc, discovery-warm cooling into
// strategy-blue; Cipher and Nexus hang below as the operations satellites that
// watch the whole system. Energy streams node to node along the chain, and each
// node's glow tracks its live activity status.

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { NODE_VERT, NODE_FRAG, CONDUIT_VERT, CONDUIT_FRAG } from "./shaders";

export type ChainAgentStatus =
  | "Active"
  | "Monitoring"
  | "Idle"
  | "Needs Key"
  | "Mock";

export type ChainAgentInput = { name: string; status: ChainAgentStatus };

// Live status maps to how hard a node burns — not to its colour. Hue is fixed
// identity; state changes energy only.
const STATUS_ENERGY: Record<ChainAgentStatus, number> = {
  Active: 1.0,
  Mock: 0.72,
  Monitoring: 0.58,
  Idle: 0.32,
  "Needs Key": 0.18,
};

const WARM = new THREE.Color("#ff8a3c");
const COOL = new THREE.Color("#7fd4ff");
const GOLD = new THREE.Color("#d8b85a");

type NodeDef = {
  id: string;
  activityName: string | null; // matches RuntimeAgentName, or null (Cipher)
  position: [number, number, number];
  color: THREE.Color;
  defaultEnergy: number;
};

// The six-step chain along the arc, then the two operations satellites.
const CHAIN: Array<Omit<NodeDef, "color"> & { warmToCool: number }> = [
  { id: "sarah", activityName: "Sarah", position: [-3.15, 0.15, 0.0], warmToCool: 0.0, defaultEnergy: 0.55 },
  { id: "beacon", activityName: "Beacon", position: [-1.9, 0.55, 0.5], warmToCool: 0.2, defaultEnergy: 0.5 },
  { id: "guardian", activityName: "Guardian", position: [-0.65, 0.12, -0.4], warmToCool: 0.4, defaultEnergy: 0.5 },
  { id: "scribe", activityName: "Scribe", position: [0.6, 0.58, 0.45], warmToCool: 0.6, defaultEnergy: 0.5 },
  { id: "orion", activityName: "Orion", position: [1.85, 0.18, -0.35], warmToCool: 0.8, defaultEnergy: 0.5 },
  { id: "atlas", activityName: "ATLAS", position: [3.05, 0.55, 0.1], warmToCool: 1.0, defaultEnergy: 0.55 },
];

const SATELLITES: NodeDef[] = [
  { id: "cipher", activityName: null, position: [-0.95, -1.2, 0.2], color: GOLD, defaultEnergy: 0.5 },
  { id: "nexus", activityName: "Nexus", position: [1.5, -1.25, -0.1], color: GOLD, defaultEnergy: 0.45 },
];

const NODES: NodeDef[] = [
  ...CHAIN.map((n) => ({
    id: n.id,
    activityName: n.activityName,
    position: n.position,
    defaultEnergy: n.defaultEnergy,
    color: WARM.clone().lerp(COOL, n.warmToCool),
  })),
  ...SATELLITES,
];

// Conduits: the five bright chain hops, plus two faint gold tethers linking the
// operations satellites to the agents they shadow.
const SEGMENTS: Array<[string, string, number]> = [
  ["sarah", "beacon", 1],
  ["beacon", "guardian", 1],
  ["guardian", "scribe", 1],
  ["scribe", "orion", 1],
  ["orion", "atlas", 1],
  ["cipher", "guardian", 0.45], // Cipher shadows compliance follow-up
  ["nexus", "atlas", 0.45], // Nexus watches the final integration
];

const POINTS_PER_SEGMENT = 54;

function nodeById(id: string): NodeDef {
  const n = NODES.find((x) => x.id === id);
  if (!n) throw new Error(`unknown node ${id}`);
  return n;
}

export function AgentChain({ agents = [] }: { agents?: ChainAgentInput[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const conduitMatRef = useRef<THREE.ShaderMaterial>(null);
  const nodeMatRefs = useRef<Array<THREE.ShaderMaterial | null>>([]);

  const energyByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of agents) map.set(a.name, STATUS_ENERGY[a.status] ?? 0.4);
    return map;
  }, [agents]);

  // Each node lerps toward the energy its status implies, so status changes
  // glide instead of popping.
  const targetEnergies = useMemo(
    () =>
      NODES.map((n) =>
        n.activityName ? energyByName.get(n.activityName) ?? n.defaultEnergy : n.defaultEnergy,
      ),
    [energyByName],
  );
  const currentEnergies = useRef<number[]>(NODES.map((n) => n.defaultEnergy));

  const nodeUniforms = useMemo(
    () =>
      NODES.map((n) => ({
        uColor: { value: n.color.clone() },
        uIntensity: { value: n.defaultEnergy },
      })),
    [],
  );

  // Build the streaming-particle geometry once. Each conduit is a quadratic
  // bezier bowed slightly off the straight line so the chain reads as depth.
  const conduitGeometry = useMemo(() => {
    const total = SEGMENTS.length * POINTS_PER_SEGMENT;
    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const param = new Float32Array(total);
    const seed = new Float32Array(total);
    const bow = new THREE.Vector3();
    let i = 0;
    for (const [fromId, toId] of SEGMENTS) {
      const a = new THREE.Vector3(...nodeById(fromId).position);
      const b = new THREE.Vector3(...nodeById(toId).position);
      const ca = nodeById(fromId).color;
      const cb = nodeById(toId).color;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      bow.set(0, 0.35, 0.25); // lift the arc toward the viewer
      const control = mid.add(bow);
      for (let p = 0; p < POINTS_PER_SEGMENT; p++) {
        const t = p / (POINTS_PER_SEGMENT - 1);
        const omt = 1 - t;
        // quadratic bezier a -> control -> b
        const x = omt * omt * a.x + 2 * omt * t * control.x + t * t * b.x;
        const y = omt * omt * a.y + 2 * omt * t * control.y + t * t * b.y;
        const z = omt * omt * a.z + 2 * omt * t * control.z + t * t * b.z;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        const col = ca.clone().lerp(cb, t);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
        param[i] = t;
        seed[i] = Math.random() * 100;
        i++;
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geom.setAttribute("aParam", new THREE.BufferAttribute(param, 1));
    geom.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 8);
    return geom;
  }, []);

  const conduitUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0.6 },
      uPixelRatio: {
        value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1,
      },
    }),
    [],
  );

  useFrame((stateRf, dt) => {
    const elapsed = stateRf.clock.elapsedTime;
    const k = Math.min(1, dt * 3.0);

    let sum = 0;
    for (let n = 0; n < NODES.length; n++) {
      const cur = currentEnergies.current;
      cur[n] = THREE.MathUtils.lerp(cur[n], targetEnergies[n], k);
      sum += cur[n];
      const mat = nodeMatRefs.current[n];
      if (mat) {
        // A soft idle breath keeps every node alive even when energy is low.
        const breath = 0.9 + 0.1 * Math.sin(elapsed * 1.3 + n * 0.9);
        mat.uniforms.uIntensity.value = cur[n] * breath;
      }
    }

    if (conduitMatRef.current) {
      const u = conduitMatRef.current.uniforms;
      u.uTime.value = elapsed;
      // Chain drive follows the average node energy.
      u.uEnergy.value = THREE.MathUtils.lerp(u.uEnergy.value, sum / NODES.length, k);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(elapsed * 0.12) * 0.16;
      groupRef.current.position.y = Math.sin(elapsed * 0.5) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {NODES.map((n, idx) => (
        <mesh key={n.id} position={n.position}>
          <icosahedronGeometry args={[idx < 6 ? 0.34 : 0.26, 3]} />
          <shaderMaterial
            ref={(m) => {
              nodeMatRefs.current[idx] = m;
            }}
            vertexShader={NODE_VERT}
            fragmentShader={NODE_FRAG}
            uniforms={nodeUniforms[idx]}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <points geometry={conduitGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={conduitMatRef}
          vertexShader={CONDUIT_VERT}
          fragmentShader={CONDUIT_FRAG}
          uniforms={conduitUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
