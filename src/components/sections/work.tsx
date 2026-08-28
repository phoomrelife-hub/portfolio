"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";

const DROP_S = 1.3;
const PARTICLE_COUNT = 10;

function seeded(i: number) {
  const x = Math.sin(i * 91.345) * 47453.5453;
  return x - Math.floor(x);
}

// Dives into a point on screen (the glow orb) like zooming through a single
// pixel of a texture — a growing circle swallows the viewport, we jump the
// real scroll position while fully covered, then the circle fades away to
// reveal the next panel already in place underneath.
function ZoomPortal({ origin }: { origin: { x: number; y: number } }) {
  const originStyle = { left: origin.x, top: origin.y, transform: "translate(-50%, -50%)" } as const;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full"
        style={{
          ...originStyle,
          background: "radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)",
        }}
        initial={{ width: 20, height: 20, opacity: 1 }}
        animate={{ width: 500, height: 500, opacity: 0 }}
        transition={{ duration: DROP_S * 0.4, ease: "easeOut" }}
      />
      <motion.div
        className="absolute rounded-full bg-[#0a0806]"
        style={originStyle}
        initial={{ width: 20, height: 20, opacity: 0.7 }}
        animate={{ width: "260vmax", height: "260vmax", opacity: 1 }}
        transition={{ duration: DROP_S, ease: [0.76, 0, 0.24, 1] }}
      />
    </div>
  );
}

function GlowOrb() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + seeded(i) * 0.6;
    const radius = 26 + seeded(i * 3) * 10;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      delay: seeded(i * 7) * 1.6,
      duration: 1.8 + seeded(i * 11) * 1.2,
    };
  });

  return (
    <div className="relative h-14 w-14">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 45%, transparent 75%)",
          filter: "blur(2px)",
        }}
        animate={{ scale: [0.85, 1.05, 0.85], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-2 rounded-full bg-white" style={{ boxShadow: "0 0 20px 6px rgba(255,255,255,0.8)" }} />
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
          style={{ boxShadow: "0 0 4px 1px rgba(255,255,255,0.9)" }}
          animate={{
            x: [0, p.x],
            y: [0, p.y, p.y + 14],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function Work() {
  const [dropping, setDropping] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.6 });
  const orbRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const descend = useCallback(() => {
    setDropping((d) => {
      if (d) return d;
      const rect = orbRef.current?.getBoundingClientRect();
      if (rect) setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      const jumpDelayMs = DROP_S * 0.55 * 1000;
      setTimeout(() => {
        const target = document.getElementById("work-detail");
        if (target) {
          window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
        }
      }, jumpDelayMs);
      setTimeout(() => setDropping(false), DROP_S * 1000);
      return true;
    });
  }, []);

  useEffect(() => {
    if (!inView || dropping) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        descend();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, dropping, descend]);

  return (
    <Section id="work">
      <div ref={sectionRef} className="w-full">
        <SectionHeading eyebrow="03 — ผลงาน" title="งานที่ทำมีอะไรบ้าง" />

        <motion.div
          className="relative h-[440px] md:h-[480px] rounded-2xl border border-ink-line overflow-hidden bg-[#0a0806]"
          animate={
            dropping
              ? { scale: 1.15, opacity: 0, filter: "blur(10px)" }
              : { scale: 1, opacity: 1, filter: "blur(0px)" }
          }
          transition={{ duration: DROP_S * 0.6, ease: [0.6, 0, 0.9, 0.2] }}
        >
          <video
            src="/work-room-loop.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>

        <motion.button
          ref={orbRef}
          type="button"
          onClick={descend}
          aria-label="เลื่อนลงไปดูผลงาน"
          className="relative z-10 mx-auto mt-6 flex flex-col items-center gap-2 cursor-pointer"
        >
          <GlowOrb />
          <span className="text-xs tracking-widest uppercase text-foreground-faint">
            กด spacebar เพื่อลงไปดูผลงาน
          </span>
        </motion.button>
      </div>

      <AnimatePresence>{dropping && <ZoomPortal key="zoom-portal" origin={origin} />}</AnimatePresence>
    </Section>
  );
}
