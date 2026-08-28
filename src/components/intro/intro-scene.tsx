"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot, type MascotMotion, type EyeState } from "@/components/three/mascot";
import { KnowledgeGraph } from "@/components/three/knowledge-graph";
import { EmberBurst } from "@/components/three/ember-burst";
import { ProjectCards } from "@/components/intro/project-cards";
import { AuraGlow } from "@/components/intro/aura-glow";
import { profile } from "@/lib/content";
import { useMarkIntroDone } from "@/lib/intro-context";

type IntroPhase = "waiting" | "flying-in" | "idle" | "charging" | "flash" | "fade" | "flying-away" | "done";

const FLY_IN_MS = 900;
const IDLE_MS = 1000;
const CHARGING_MS = 2200; // chaos builds, camera pushes in toward the mascot
const FLASH_MS = 1300; // camera pulls back out, eyes glow, aura blooms to white
const FADE_MS = 1100; // white burns off revealing the real page; mascot goes tired
const FLYAWAY_MS = 900;

const PHASE_MOTION: Record<IntroPhase, MascotMotion> = {
  waiting: "waiting",
  "flying-in": "flying-in",
  idle: "idle",
  charging: "still",
  flash: "still",
  fade: "still",
  "flying-away": "flying-away",
  done: "waiting",
};

const PHASE_EYES: Record<IntroPhase, EyeState> = {
  waiting: "open",
  "flying-in": "open",
  idle: "open",
  charging: "open",
  flash: "glow",
  fade: "tired",
  "flying-away": "tired",
  done: "open",
};

export function IntroScene() {
  const [phase, setPhase] = useState<IntroPhase>("waiting");
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const markIntroDone = useMarkIntroDone();

  const queue = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach(clearTimeout);
    };
  }, []);

  const start = useCallback(() => {
    setPhase((p) => {
      if (p !== "waiting") return p;
      queue(() => setPhase("idle"), FLY_IN_MS);
      return "flying-in";
    });
  }, [queue]);

  useEffect(() => {
    if (phase !== "idle") return;
    queue(() => setPhase("charging"), IDLE_MS);
  }, [phase, queue]);

  useEffect(() => {
    if (phase !== "charging") return;
    queue(() => setPhase("flash"), CHARGING_MS);
  }, [phase, queue]);

  useEffect(() => {
    if (phase !== "flash") return;
    queue(() => setPhase("fade"), FLASH_MS);
  }, [phase, queue]);

  useEffect(() => {
    if (phase !== "fade") return;
    queue(() => setPhase("flying-away"), FADE_MS);
  }, [phase, queue]);

  useEffect(() => {
    if (phase !== "flying-away") return;
    queue(() => setPhase("done"), FLYAWAY_MS);
  }, [phase, queue]);

  useEffect(() => {
    if (phase === "done") markIntroDone();
  }, [phase, markIntroDone]);

  useEffect(() => {
    if (phase === "done") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "waiting") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        start();
      }
    };
    const onClick = () => start();
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [phase, start]);

  if (phase === "done") return null;

  const chaosVisible = phase === "charging" || phase === "flash";
  const chaosOpacity = phase === "charging" ? 1 : phase === "flash" ? 0 : 0;
  const chaosTransitionMs = phase === "charging" ? CHARGING_MS * 0.6 : FLASH_MS * 0.7;

  const zoomScale = phase === "charging" ? 2.4 : 1;
  const zoomDurationS = phase === "charging" ? CHARGING_MS / 1000 : 0.45;
  const zoomEase = phase === "charging" ? ([0.3, 0, 0.7, 1] as const) : ([0.16, 1, 0.3, 1] as const);

  const bgFadeOut = phase === "fade" || phase === "flying-away";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" style={{ pointerEvents: phase === "waiting" ? "auto" : "none" }}>
        <motion.div
          className="absolute inset-0 bg-paper"
          animate={{ opacity: bgFadeOut ? 0 : 1 }}
          transition={{ duration: FADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
        />

        <motion.div
          className="absolute inset-0"
          animate={{ opacity: chaosOpacity }}
          transition={{ duration: chaosTransitionMs / 1000, ease: "easeInOut" }}
          style={{ display: chaosVisible ? "block" : "none" }}
        >
          <KnowledgeGraph intensity={phase === "charging" ? 1 : 0.4} />
          <ProjectCards active={chaosVisible} />
          {phase === "charging" && <EmberBurst durationMs={CHARGING_MS} />}
        </motion.div>

        <AuraGlow active={phase === "flash"} />

        <motion.div
          className="absolute inset-0"
          animate={{ scale: zoomScale }}
          transition={{ duration: zoomDurationS, ease: zoomEase }}
          style={{ transformOrigin: "50% 50%" }}
        >
          <Mascot motion={PHASE_MOTION[phase]} eyeState={PHASE_EYES[phase]} />
        </motion.div>

        <AnimatePresence>
          {phase === "waiting" && (
            <motion.div
              key="intro-text"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center"
            >
              <p className="text-2xl md:text-3xl text-paper-ink">Present</p>
              <p className="text-2xl md:text-3xl text-paper-ink">{profile.name}</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute bottom-12 text-sm text-paper-ink"
              >
                กด spacebar หรือคลิก
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
