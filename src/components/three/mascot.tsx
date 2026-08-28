"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export type MascotMotion = "waiting" | "flying-in" | "idle" | "still" | "typing" | "flying-away";
export type EyeState = "open" | "glow" | "tired";

// Grid measured pixel-for-pixel from the reference sprite (16 cols x 10 rows):
// rows 0-1 top body, rows 2-3 top body with single-column eye slots at col 4/11,
// rows 4-5 full-width ear band, rows 6-7 body again, rows 8-9 four single-column
// leg posts at col 3/5/10/12 (the gaps at col 4/11 sit directly under the eyes).
const BODY_ROWS = [
  "..XXXXXXXXXXXX..",
  "..XXXXXXXXXXXX..",
  "..XX.XXXXXX.XX..",
  "..XX.XXXXXX.XX..",
  "XXXXXXXXXXXXXXXX",
  "XXXXXXXXXXXXXXXX",
  "..XXXXXXXXXXXX..",
  "..XXXXXXXXXXXX..",
  "...X.X....X.X...",
  "...X.X....X.X...",
];
const ROWS = BODY_ROWS.length;
const COLS = BODY_ROWS[0].length;
const EYE_ROW = 2.5;
const EYE_COLS: [number, number] = [4, 11];

const CELL = 0.085;
const ACCENT = "#e2795a";
const DARK = "#0a0a0a";
const GLOW = "#fff8ef";
const SWEAT = "#8ecbe6";

function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function cellToWorld(row: number, col: number): [number, number] {
  const x = (col - (COLS - 1) / 2) * CELL;
  const y = ((ROWS - 1) / 2 - row) * CELL;
  return [x, y];
}

function eyeWorldPos(col: number): { x: number; y: number } {
  const [x, y] = cellToWorld(EYE_ROW, col);
  return { x, y };
}

function buildBodyCells() {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (BODY_ROWS[r][c] === "X") {
        cells.push(cellToWorld(r, c));
      }
    }
  }
  return cells;
}

function Body() {
  const cells = useMemo(() => buildBodyCells(), []);
  return (
    <group>
      {cells.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[CELL * 0.98, CELL * 0.98, CELL * 0.98]} />
          <meshStandardMaterial color={ACCENT} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function ChevronEye({ x, y, mirrored }: { x: number; y: number; mirrored?: boolean }) {
  const sign = mirrored ? -1 : 1;
  return (
    <group position={[x, y, CELL * 0.55]}>
      <mesh rotation={[0, 0, sign * 0.6]} position={[0, CELL * 0.18, 0]}>
        <boxGeometry args={[CELL * 0.85, CELL * 0.22, CELL * 0.2]} />
        <meshStandardMaterial color={DARK} flatShading />
      </mesh>
      <mesh rotation={[0, 0, -sign * 0.6]} position={[0, -CELL * 0.18, 0]}>
        <boxGeometry args={[CELL * 0.85, CELL * 0.22, CELL * 0.2]} />
        <meshStandardMaterial color={DARK} flatShading />
      </mesh>
    </group>
  );
}

function BlackEye({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x, y, CELL * 0.45]}>
      <boxGeometry args={[CELL * 0.9, CELL * 1.9, CELL * 0.3]} />
      <meshStandardMaterial color={DARK} flatShading />
    </mesh>
  );
}

function GlowEye({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x, y, CELL * 0.45]}>
      <boxGeometry args={[CELL * 0.9, CELL * 1.9, CELL * 0.3]} />
      <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2.2} toneMapped={false} />
    </mesh>
  );
}

function TiredEye({ x, y }: { x: number; y: number }) {
  // droops the upper half of the eye slot shut, leaving a thin sleepy gap below
  return (
    <mesh position={[x, y + CELL * 0.45, CELL * 0.3]}>
      <boxGeometry args={[CELL * 0.9, CELL * 1.0, CELL * 0.25]} />
      <meshStandardMaterial color={ACCENT} flatShading />
    </mesh>
  );
}

const KEY_ROWS = 2;
const KEY_COLS = 4;
const KEY_CELL = CELL * 0.42;
const KEY_GAP = KEY_CELL * 1.25;
const PLATE = "#1c1a17";
const KEY = "#3a3632";

function Keyboard() {
  const keyRefs = useRef<Array<THREE.Mesh | null>>([]);
  const lit = useRef<Set<number>>(new Set());
  const nextSwap = useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (t > nextSwap.current) {
      lit.current.clear();
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        lit.current.add(Math.floor(Math.random() * KEY_ROWS * KEY_COLS));
      }
      nextSwap.current = t + 0.09 + Math.random() * 0.07;
    }
    keyRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const down = lit.current.has(i);
      mesh.position.z = down ? CELL * 0.08 : CELL * 0.16;
    });
  });

  const keys = useMemo(() => {
    const arr: Array<[number, number]> = [];
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        arr.push([(c - (KEY_COLS - 1) / 2) * KEY_GAP, ((KEY_ROWS - 1) / 2 - r) * KEY_GAP]);
      }
    }
    return arr;
  }, []);

  return (
    <group position={[0, -CELL * 5.4, CELL * 2.4]} rotation={[-0.55, 0, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[KEY_GAP * KEY_COLS + KEY_CELL, KEY_GAP * KEY_ROWS + KEY_CELL, CELL * 0.24]} />
        <meshStandardMaterial color={PLATE} flatShading />
      </mesh>
      {keys.map(([x, y], i) => (
        <mesh key={i} ref={(el) => { keyRefs.current[i] = el; }} position={[x, y, CELL * 0.16]}>
          <boxGeometry args={[KEY_CELL, KEY_CELL, CELL * 0.16]} />
          <meshStandardMaterial color={KEY} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function SweatDrop() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = CELL * 3.3 + Math.sin(t * 3) * CELL * 0.08;
  });
  return (
    <mesh ref={ref} position={[CELL * 6.2, CELL * 3.3, CELL * 0.6]}>
      <boxGeometry args={[CELL * 0.6, CELL * 0.9, CELL * 0.2]} />
      <meshStandardMaterial color={SWEAT} flatShading transparent opacity={0.9} />
    </mesh>
  );
}

function MascotRig({ motion, eyeState }: { motion: MascotMotion; eyeState: EyeState }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    t.current = 0;
  }, [motion]);

  useEffect(() => {
    if (motion !== "idle") return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      const delay = 700 + Math.random() * 900;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        setTimeout(() => {
          if (!cancelled) setBlink(false);
        }, 120);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [motion]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    t.current += delta;

    if (motion === "waiting") {
      g.visible = false;
      return;
    }
    g.visible = true;

    if (motion === "flying-in") {
      const p = Math.min(t.current / 0.9, 1);
      const eased = easeOutBack(p);
      g.position.x = THREE.MathUtils.lerp(-3.2, 0, eased);
      g.position.y = THREE.MathUtils.lerp(-2.4, 0, eased);
      g.rotation.z = THREE.MathUtils.lerp(-0.6, 0, eased);
      g.scale.setScalar(THREE.MathUtils.lerp(0.4, 1, Math.min(p * 1.3, 1)));
    } else if (motion === "idle") {
      g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 0.1);
      g.position.y = Math.sin(t.current * 1.8) * 0.08;
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0, 0.1);
      g.rotation.z = Math.sin(t.current * 1.2) * 0.03;
      g.scale.setScalar(1);
    } else if (motion === "typing") {
      g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 0.1);
      g.position.y = Math.sin(t.current * 1.8) * 0.03 - 0.02;
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.12, 0.1);
      g.rotation.z = Math.sin(t.current * 5) * 0.012;
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, 1, 0.15));
    } else if (motion === "still") {
      g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 0.08);
      g.position.y = Math.sin(t.current * 1.1) * 0.025;
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0, 0.08);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 0.08);
      g.scale.setScalar(1);
    } else if (motion === "flying-away") {
      const p = Math.min(t.current / 0.9, 1);
      g.position.y = THREE.MathUtils.lerp(0, 2.6, p);
      g.position.x = THREE.MathUtils.lerp(0, 0.6, p);
      g.rotation.z = THREE.MathUtils.lerp(0, 0.3, p);
      g.scale.setScalar(THREE.MathUtils.lerp(1, 0.5, p));
    }
  });

  const leftEye = eyeWorldPos(EYE_COLS[0]);
  const rightEye = eyeWorldPos(EYE_COLS[1]);
  const showBlinkChevron = eyeState === "open" && blink;

  return (
    <group ref={group} visible={false}>
      <Body />
      {motion === "typing" && <Keyboard />}
      {showBlinkChevron && (
        <>
          <ChevronEye {...leftEye} mirrored />
          <ChevronEye {...rightEye} mirrored={false} />
        </>
      )}
      {eyeState === "open" && !blink && (
        <>
          <BlackEye {...leftEye} />
          <BlackEye {...rightEye} />
        </>
      )}
      {eyeState === "glow" && (
        <>
          <GlowEye {...leftEye} />
          <GlowEye {...rightEye} />
        </>
      )}
      {eyeState === "tired" && (
        <>
          <TiredEye {...leftEye} />
          <TiredEye {...rightEye} />
          <SweatDrop />
        </>
      )}
    </group>
  );
}

export function Mascot({ motion, eyeState = "open" }: { motion: MascotMotion; eyeState?: EyeState }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 4], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={eyeState === "glow" ? 1.1 : 0.7} />
        <directionalLight position={[2, 3, 4]} intensity={1.1} />
        <directionalLight position={[-2, -1, 2]} intensity={0.35} />
        <MascotRig motion={motion} eyeState={eyeState} />
      </Canvas>
    </div>
  );
}
