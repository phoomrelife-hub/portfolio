"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 700;
const ACCENT = new THREE.Color("#e2795a");

function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Converging ember streaks that rush inward with cubic acceleration as
// `durationMs` elapses — a procedural stand-in for a fixed video clip so the
// build always lands its climax exactly on the intro's phase timing, however
// long that ends up being (see chaos-video-clip's writeup on why a baked
// clip can't guarantee that sync).
function Embers({ durationMs }: { durationMs: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const t = useRef(0);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT * 3); // angle, baseRadius, offset
    for (let i = 0; i < COUNT; i++) {
      seeds[i * 3] = seeded(i * 3.1) * Math.PI * 2;
      seeds[i * 3 + 1] = 0.8 + seeded(i * 7.3) * 3.4;
      seeds[i * 3 + 2] = seeded(i * 11.7) * 0.4;
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    return { positions, seeds };
  }, []);

  useFrame((_, delta) => {
    t.current += delta * 1000;
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const progress = Math.min(t.current / durationMs, 1);

    for (let i = 0; i < COUNT; i++) {
      const angle = seeds[i * 3];
      const baseRadius = seeds[i * 3 + 1];
      const offset = seeds[i * 3 + 2];
      const local = Math.min(Math.max((progress * 1.25 - offset) / (1 - offset), 0), 1);
      const eased = local * local * local; // cubic ease-in: slow start, rushes at the end
      const radius = baseRadius * (1 - eased);
      posAttr.setXYZ(i, Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62, 0);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={ACCENT}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

export function EmberBurst({ durationMs }: { durationMs: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <Embers durationMs={durationMs} />
      </Canvas>
    </div>
  );
}
