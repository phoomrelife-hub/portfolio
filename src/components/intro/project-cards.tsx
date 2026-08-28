"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const CARD_COUNT = 12;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Rounded to a fixed precision so the server-rendered inline style string and
// the client's recomputed value always match exactly (avoids a hydration
// mismatch — framer-motion's runtime rounds motion-controlled numeric styles
// to fewer digits than a raw floating-point template literal would).
function round(n: number, digits = 2) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function makeCard(i: number) {
  const fromLeft = seededRandom(i * 2.1) > 0.5;
  const startX = fromLeft ? -30 : 130;
  const endX = fromLeft ? 130 : -30;
  const y = round(8 + seededRandom(i * 3.7) * 80);
  const size = round(90 + seededRandom(i * 5.3) * 70);
  const rotate = round((seededRandom(i * 7.9) - 0.5) * 40);
  const duration = round(2.6 + seededRandom(i * 1.3) * 2.2);
  const delay = round(seededRandom(i * 4.4) * 0.9);
  const accentLine = seededRandom(i * 6.1) > 0.6;
  return { startX, endX, y, size, rotate, duration, delay, accentLine };
}

export function ProjectCards({ active }: { active: boolean }) {
  const cards = useMemo(() => Array.from({ length: CARD_COUNT }, (_, i) => makeCard(i)), []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className="absolute rounded-lg border border-gray-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden"
          style={{ top: `${card.y}%`, width: card.size, height: round(card.size * 0.68) }}
          initial={{ x: `${card.startX}vw`, opacity: 0, rotate: card.rotate }}
          animate={
            active
              ? { x: `${card.endX}vw`, opacity: [0, 1, 1, 0], rotate: -card.rotate }
              : { x: `${card.startX}vw`, opacity: 0 }
          }
          transition={{ duration: card.duration, delay: card.delay, ease: "linear" }}
        >
          <div className="h-2 w-full bg-accent/70" />
          <div className="p-2 flex flex-col gap-1.5">
            <div className="h-1.5 w-3/4 rounded bg-gray-300" />
            <div className="h-1.5 w-1/2 rounded bg-gray-300" />
            {card.accentLine && <div className="h-1.5 w-2/3 rounded bg-accent/50" />}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
