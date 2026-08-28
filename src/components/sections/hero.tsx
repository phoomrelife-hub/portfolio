"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { profile } from "@/lib/content";
import { ParticleField } from "@/components/three/particle-field";
import { AsciiPortrait } from "@/components/ui/ascii-portrait";
import { Mascot, type MascotMotion } from "@/components/three/mascot";
import { useTypewriter } from "@/components/ui/use-typewriter";
import { useIntroDone } from "@/lib/intro-context";

type HeroPhase = "waiting" | "flying-in" | "typing" | "bio";

const FLY_IN_MS = 900;
const FLIP_MS = 900;

const PHASE_MOTION: Record<HeroPhase, MascotMotion> = {
  waiting: "waiting",
  "flying-in": "flying-in",
  typing: "typing",
  bio: "typing",
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// The surname set enormous and cropped by the viewport edges — it anchors the
// bottom of the composition so the section never reads as a floating text block.
const GHOST_WORD = profile.fullName.split(" ").at(-1)?.toUpperCase() ?? "";

function Rule({ className = "" }: { className?: string }) {
  return <span className={`block h-px bg-ink-line ${className}`} />;
}

export function Hero() {
  const [phase, setPhase] = useState<HeroPhase>("waiting");
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.6 });
  const introDone = useIntroDone();

  const [flipped, setFlipped] = useState(false);

  const start = useCallback(() => {
    setPhase((p) => (p === "waiting" ? "flying-in" : p));
  }, []);

  useEffect(() => {
    if (!introDone || !inView || phase !== "waiting") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introDone, inView, phase, start]);

  useEffect(() => {
    if (phase !== "flying-in") return;
    const id = setTimeout(() => setPhase("typing"), FLY_IN_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const typing = phase === "typing" || phase === "bio";
  const line1 = useTypewriter(profile.fullName, typing, 28, 0);
  const line2 = useTypewriter(profile.position, line1.done, 28, 150);
  const line3 = useTypewriter(profile.dateRange, line2.done, 28, 150);
  const bioStart = useTypewriter(profile.bio.start, line3.done, 16, 400);
  const bioGrowth = useTypewriter(profile.bio.growth, flipped, 14, 200);

  const canFlip = phase === "typing" && bioStart.done;

  useEffect(() => {
    if (!introDone || !inView || !canFlip) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPhase("bio");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introDone, inView, canFlip]);

  // The back face only starts typing once the card has actually turned around.
  useEffect(() => {
    if (phase !== "bio") return;
    const id = setTimeout(() => setFlipped(true), FLIP_MS);
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* --- ambient layers ------------------------------------------------ */}
      <div className="absolute inset-0 opacity-90">
        <ParticleField />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 90% at 72% 18%, var(--color-accent-glow) 0%, transparent 55%), radial-gradient(80% 70% at 8% 90%, rgba(226,121,90,0.12) 0%, transparent 60%)",
        }}
      />

      {/* faint structural grid — five vertical rules across the full height */}
      <div aria-hidden className="absolute inset-0 pointer-events-none hidden md:grid grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="border-l border-ink-line/70" />
        ))}
      </div>

      {/* film grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />

      {/* --- oversized ghost surname, cropped by both edges ---------------- */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: 0.5, ease: EASE_OUT }}
        className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden"
      >
        <span className="block whitespace-nowrap text-center font-semibold leading-[0.8] tracking-[-0.04em] text-foreground/[0.05] text-[9.5vw]">
          {GHOST_WORD}
        </span>
      </motion.div>

      {/* --- frame marks ---------------------------------------------------- */}
      <div
        aria-hidden
        className="absolute inset-x-6 top-6 md:inset-x-10 md:top-8 flex items-center gap-4 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.35em] text-foreground-faint"
      >
        <span className="text-accent">01</span>
        <Rule className="flex-1" />
        <span className="hidden sm:inline">{profile.position}</span>
      </div>

      <div
        aria-hidden
        className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none"
      >
        <span
          className="block whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.55em] text-foreground-faint"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {profile.dateRange}
        </span>
      </div>

      {/* --- main composition ---------------------------------------------- */}
      <div
        ref={sectionRef}
        className="relative z-10 min-h-screen w-full px-6 md:px-16 lg:pl-28 lg:pr-24 pt-24 pb-28 md:pt-28 md:pb-32
                   grid items-center gap-10 lg:gap-14
                   grid-cols-1 lg:grid-cols-12"
      >
        {/* portrait plate */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.25, ease: EASE_OUT }}
          className="hidden md:flex lg:col-span-5 flex-col gap-4"
        >
          <div className="relative flex items-center justify-center overflow-hidden rounded-sm border border-ink-line bg-ink-soft/40 backdrop-blur-[2px] px-6 py-8 lg:px-8 lg:py-10">
            {/* corner ticks */}
            <span className="absolute -top-px -left-px h-4 w-4 border-t border-l border-accent/60" />
            <span className="absolute -top-px -right-px h-4 w-4 border-t border-r border-accent/60" />
            <span className="absolute -bottom-px -left-px h-4 w-4 border-b border-l border-accent/60" />
            <span className="absolute -bottom-px -right-px h-4 w-4 border-b border-r border-accent/60" />
            <div className="scale-[1.1] lg:scale-[1.2] origin-center">
              <AsciiPortrait />
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-foreground-faint">
            <span className="text-accent-soft">/</span>
            <span>portrait — ascii render</span>
            <Rule className="flex-1" />
          </div>
        </motion.div>

        {/* type column */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.1, ease: EASE_OUT }}
            className="font-semibold tracking-[-0.03em] leading-[0.85] text-foreground glow-text
                       text-[clamp(4.5rem,15vw,11rem)]"
          >
            {profile.name}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.9, ease: EASE_OUT }}
            className="mt-6 h-px w-full max-w-2xl origin-left bg-gradient-to-r from-accent via-accent/40 to-transparent"
          />

          <div className="relative mt-10 w-full">
            <div className="absolute -top-16 left-2 h-24 w-24 pointer-events-none z-20">
              {phase !== "waiting" && (
                <Mascot motion={PHASE_MOTION[phase]} eyeState="open" />
              )}
            </div>

            <div className="w-full max-w-2xl" style={{ perspective: 1600 }}>
              {/* standby plate — keeps the column composed before typing starts */}
              <AnimatePresence>
                {!typing && (
                  <motion.div
                    key="standby"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="min-h-[22rem] md:min-h-[19rem] flex flex-col gap-5 pt-2"
                  >
                    {[
                      "w-2/3",
                      "w-1/2",
                      "w-2/5",
                    ].map((w, i) => (
                      <span key={i} className={`block h-px bg-ink-line ${w}`} />
                    ))}
                    <div className="mt-2 flex flex-col gap-3">
                      <span className="block h-px w-full bg-ink-line/70" />
                      <span className="block h-px w-11/12 bg-ink-line/70" />
                      <span className="block h-px w-4/5 bg-ink-line/70" />
                    </div>
                    <motion.span
                      animate={{ opacity: [1, 0.15, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      className="mt-2 block h-5 w-[3px] bg-accent"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {typing && (
                  <motion.div
                    key="typed-lines"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full min-h-[22rem] md:min-h-[19rem]"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <motion.div
                      animate={{ rotateY: phase === "bio" ? 180 : 0 }}
                      transition={{ duration: FLIP_MS / 1000, ease: EASE_OUT }}
                      className="relative h-full w-full"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div
                        className="relative flex flex-col gap-2 md:gap-3 rounded-sm border border-ink-line bg-ink-soft/50 backdrop-blur-[3px] p-6 md:p-8"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                      >
                        <span className="absolute left-0 top-6 bottom-6 w-px bg-accent/60" />
                        {line1.display && (
                          <p className="text-xl md:text-2xl text-foreground font-mono tracking-tight">
                            {line1.display}
                          </p>
                        )}
                        {line2.display && (
                          <p className="text-lg md:text-xl text-foreground-muted">{line2.display}</p>
                        )}
                        {line3.display && (
                          <p className="text-base md:text-lg text-foreground-faint">{line3.display}</p>
                        )}
                        {bioStart.display && (
                          <p className="mt-4 text-sm md:text-base leading-relaxed text-foreground-muted">
                            {bioStart.display}
                          </p>
                        )}
                      </div>

                      <div
                        className="absolute inset-0 flex flex-col justify-start rounded-sm border border-accent/30 bg-ink-soft/60 backdrop-blur-[3px] p-6 md:p-8"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <span className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-accent-soft">
                          <span className="h-px w-6 bg-accent-soft/60" />
                          growth
                        </span>
                        <p className="text-sm md:text-base leading-relaxed text-foreground-muted">
                          {bioGrowth.display}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* --- bottom bar + hint ---------------------------------------------- */}
      <div className="absolute inset-x-6 md:inset-x-10 bottom-6 md:bottom-8 z-20">
        <Rule className="mb-4" />
        <div className="flex items-end justify-between gap-6 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.3em] text-foreground-faint">
          <span className="hidden sm:inline">{profile.fullName}</span>

          <AnimatePresence mode="wait">
            {(phase === "waiting" || canFlip) && (
              <motion.div
                key={phase === "waiting" ? "hint" : "hint-flip"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: phase === "waiting" ? 1.2 : 0.4 }}
                className="flex items-center gap-3 normal-case tracking-widest text-foreground-muted"
              >
                <span className="rounded-sm border border-ink-line px-2 py-1 text-[10px] text-foreground">
                  space
                </span>
                <span>
                  {phase === "waiting" ? "กด spacebar" : "กด spacebar เพื่อพลิกดูอีกด้าน"}
                </span>
                <motion.span
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="h-px w-8 bg-accent"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <span className="hidden md:inline">{profile.dateRange}</span>
        </div>
      </div>
    </section>
  );
}
