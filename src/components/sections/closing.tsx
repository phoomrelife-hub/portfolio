"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { closing, profile } from "@/lib/content";
import { ParticleField } from "@/components/three/particle-field";
import { Mascot, type MascotMotion } from "@/components/three/mascot";
import { MemoryReel } from "@/components/sections/memory-reel";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Closes the loop opened by the hero: the same particle field, the same frame
// marks, the same oversized cropped word — except the hero's word was his name
// and this one is the thank-you.
const GHOST_WORD = "ขอบคุณ";

const HEADLINE_WORDS = closing.headline.split(" ");

function Rule({ className = "" }: { className?: string }) {
  return <span className={`block h-px bg-ink-line ${className}`} />;
}

export function Closing() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  const [mascotMotion, setMascotMotion] = useState<MascotMotion>("waiting");

  // The mascot that flew in at the hero comes back one last time, sits with the
  // thank-you note for a beat, then leaves the frame for good.
  useEffect(() => {
    if (!inView || reduced) return;
    const appear = setTimeout(() => setMascotMotion("idle"), 1800);
    const leave = setTimeout(() => setMascotMotion("flying-away"), 5200);
    return () => {
      clearTimeout(appear);
      clearTimeout(leave);
    };
  }, [inView, reduced]);

  const wordContainer: Variants = {
    hidden: {},
    show: { transition: { delayChildren: 0.35, staggerChildren: reduced ? 0 : 0.045 } },
  };
  const word: Variants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(4px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: EASE_OUT },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="closing"
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* --- ambient layers (mirrors the hero) ----------------------------- */}
      <div className="absolute inset-0 opacity-70">
        <ParticleField />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(110% 80% at 50% 108%, var(--color-accent-glow) 0%, transparent 58%), radial-gradient(70% 60% at 88% 6%, rgba(226,121,90,0.10) 0%, transparent 62%)",
        }}
      />

      <div aria-hidden className="absolute inset-0 pointer-events-none hidden md:grid grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="border-l border-ink-line/70" />
        ))}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />

      {/* --- oversized ghost word, cropped by the bottom edge --------------- */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, delay: 0.4, ease: EASE_OUT }}
        className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden"
      >
        <span className="block whitespace-nowrap text-center font-semibold leading-[0.72] tracking-[-0.04em] text-foreground/[0.05] text-[26vw]">
          {GHOST_WORD}
        </span>
      </motion.div>

      {/* --- frame marks ---------------------------------------------------- */}
      <div
        aria-hidden
        className="absolute inset-x-6 top-6 md:inset-x-10 md:top-8 flex items-center gap-4 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.35em] text-foreground-faint"
      >
        <span className="text-accent">14</span>
        <Rule className="flex-1" />
        <span className="hidden sm:inline">closing</span>
      </div>

      <div
        aria-hidden
        className="absolute left-6 md:left-10 bottom-40 hidden lg:block pointer-events-none"
      >
        <span
          className="block whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.55em] text-foreground-faint"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {profile.dateRange}
        </span>
      </div>

      {/* --- the reel: the internship replayed before the goodbye ----------- */}
      <MemoryReel />

      {/* --- main composition ---------------------------------------------- */}
      <div
        className="relative z-10 min-h-[86vh] w-full px-6 md:px-16 lg:pl-28 lg:pr-24 pt-8 pb-28 md:pt-12 md:pb-32
                   grid items-center gap-10 lg:gap-16
                   grid-cols-1 lg:grid-cols-12"
      >
        {/* the words themselves — set as a pull quote, not a centered block */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="mb-8 flex items-center gap-3 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.35em] text-foreground-faint"
          >
            <span className="text-accent-soft">/</span>
            <span>บทส่งท้าย</span>
            <Rule className="w-16" />
          </motion.div>

          <div className="relative pl-6 md:pl-9">
            <motion.span
              aria-hidden
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.2, ease: EASE_OUT }}
              className="absolute left-0 top-1 bottom-1 w-px origin-top bg-gradient-to-b from-accent via-accent/50 to-transparent"
            />

            <motion.h2
              variants={wordContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
              className="font-semibold text-foreground glow-text text-balance
                         text-[clamp(1.4rem,2.9vw,2.6rem)] leading-[1.5] tracking-[-0.01em]"
            >
              {HEADLINE_WORDS.map((w, i) => (
                <Fragment key={`${w}-${i}`}>
                  {i > 0 && " "}
                  <motion.span variants={word} className="inline-block">
                    {w}
                  </motion.span>
                </Fragment>
              ))}
            </motion.h2>
          </div>
        </div>

        {/* the thank-you note — a plate the eye lands on last */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.9, ease: EASE_OUT }}
          className="lg:col-span-5 relative"
        >
          <div className="pointer-events-none absolute -top-20 right-2 hidden h-24 w-24 lg:block z-20">
            <Mascot
              motion={reduced ? (inView ? "still" : "waiting") : mascotMotion}
              eyeState="open"
            />
          </div>

          <div className="relative rounded-sm border border-ink-line bg-ink-soft/50 backdrop-blur-[3px] px-6 py-7 md:px-9 md:py-10">
            <span aria-hidden className="absolute -top-px -left-px h-4 w-4 border-t border-l border-accent/60" />
            <span aria-hidden className="absolute -top-px -right-px h-4 w-4 border-t border-r border-accent/60" />
            <span aria-hidden className="absolute -bottom-px -left-px h-4 w-4 border-b border-l border-accent/60" />
            <span aria-hidden className="absolute -bottom-px -right-px h-4 w-4 border-b border-r border-accent/60" />

            <span className="mb-5 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-accent-soft">
              <span className="h-px w-6 bg-accent-soft/60" />
              thank you
            </span>

            <p className="text-base md:text-lg leading-[1.85] text-foreground-muted">
              {closing.subtext}
            </p>

            <Rule className="my-6" />

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xl md:text-2xl font-semibold text-foreground">{profile.name}</p>
                <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.25em] text-foreground-faint">
                  {profile.fullName}
                </p>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground-faint text-right">
                {profile.position}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- bottom bar ------------------------------------------------------ */}
      <div className="absolute inset-x-6 md:inset-x-10 bottom-6 md:bottom-8 z-20">
        <Rule className="mb-4" />
        <div className="flex items-end justify-between gap-6 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.3em] text-foreground-faint">
          <span className="hidden sm:inline">{profile.dateRange}</span>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="flex items-center gap-2 normal-case tracking-widest text-foreground-muted"
          >
            <span className="text-accent-soft">$</span>
            <span>exit 0</span>
            <motion.span
              aria-hidden
              animate={reduced ? undefined : { opacity: [1, 0.1, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="block h-3.5 w-[3px] bg-accent"
            />
          </motion.span>
          <span className="hidden md:inline">Relife Solutions</span>
        </div>
      </div>
    </section>
  );
}
