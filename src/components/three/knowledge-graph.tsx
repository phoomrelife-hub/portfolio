"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const NODE_COUNT = 26;
const ACCENT = "#e2795a";
const LINE_COLOR = "#c9c2b8";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9973.13) * 43758.5453;
  return x - Math.floor(x);
}

function buildGraph() {
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const r = 1.6 + seededRandom(i * 3.1) * 1.4;
    const theta = seededRandom(i * 7.7) * Math.PI * 2;
    const phi = Math.acos(2 * seededRandom(i * 11.3) - 1);
    nodes.push(
      new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi))
    );
  }
  const edges: Array<[number, number]> = [];
  nodes.forEach((n, i) => {
    const distances = nodes
      .map((m, j) => ({ j, d: i === j ? Infinity : n.distanceTo(m) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    distances.forEach(({ j }) => edges.push([i, j]));
  });
  return { nodes, edges };
}

function GraphGroup({ intensity }: { intensity: number }) {
  const group = useRef<THREE.Group>(null);
  const { nodes, edges } = useMemo(() => buildGraph(), []);

  const linePositions = useMemo(() => {
    const arr = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      arr[i * 6] = nodes[a].x;
      arr[i * 6 + 1] = nodes[a].y;
      arr[i * 6 + 2] = nodes[a].z;
      arr[i * 6 + 3] = nodes[b].x;
      arr[i * 6 + 4] = nodes[b].y;
      arr[i * 6 + 5] = nodes[b].z;
    });
    return arr;
  }, [edges, nodes]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const speed = 0.15 + intensity * 0.9;
    g.rotation.y += delta * speed;
    g.rotation.x = Math.sin(Date.now() * 0.0002) * 0.25 * (0.4 + intensity);
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={LINE_COLOR} transparent opacity={0.35 + intensity * 0.25} />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[0.035 + (i % 3 === 0 ? 0.02 : 0), 8, 8]} />
          <meshStandardMaterial
            color={i % 4 === 0 ? ACCENT : "#d8d2c8"}
            emissive={i % 4 === 0 ? ACCENT : "#000000"}
            emissiveIntensity={i % 4 === 0 ? 0.6 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

export function KnowledgeGraph({ intensity }: { intensity: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 2, 3]} intensity={0.6} />
        <GraphGroup intensity={intensity} />
      </Canvas>
    </div>
  );
}
