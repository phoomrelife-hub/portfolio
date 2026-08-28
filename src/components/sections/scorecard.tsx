"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { scorecard } from "@/lib/content";

const entries = Object.values(scorecard);
const ROW_STAGGER = 0.45;
const SEGMENT_STEP = 0.085;
const COUNT_S = 1.1;
const EASE = [0.16, 1, 0.3, 1] as const;

function rowDelay(i: number) {
  return i * ROW_STAGGER;
}

// Big number: flickers through random digits while locked, then counts up to the
// real score once the reveal fires.
function ScoreNumber({ score, max, revealed, delay }: { score: number; max: number; revealed: boolean; delay: number }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => Math.round(v).toString());
  const [scramble, setScramble] = useState("0");

  useEffect(() => {
    if (revealed) return;
    const id = window.setInterval(() => setScramble(String(Math.floor(Math.random() * 10))), 90);
    return () => window.clearInterval(id);
  }, [revealed]);

  useEffect(() => {
    if (!revealed) return;
    const controls = animate(count, score, { duration: COUNT_S, delay, ease: EASE });
    return controls.stop;
  }, [revealed, score, delay, count]);

  return (
    <div className="flex items-baseline gap-1 tabular-nums leading-none">
      {revealed ? (
        <motion.span
          className="text-6xl md:text-8xl font-semibold text-foreground"
          style={{ textShadow: "0 0 60px var(--color-accent-glow)" }}
          initial={{ opacity: 0, filter: "blur(12px)", scale: 1.15 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 0.7, delay, ease: EASE }}
        >
          {display}
        </motion.span>
      ) : (
        <span className="text-6xl md:text-8xl font-semibold text-foreground-faint blur-[3px] select-none">
          {scramble}
        </span>
      )}
      <span className="text-xl md:text-2xl text-foreground-faint">/{max}</span>
    </div>
  );
}

// Ten segments instead of one bar so the score reads as a count even before the
// number lands — each filled segment snaps on in sequence.
function SegmentGauge({ score, max, revealed, delay }: { score: number; max: number; revealed: boolean; delay: number }) {
  return (
    <div className="relative mt-4 flex gap-1.5 overflow-hidden">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < score;
        return (
          <motion.span
            key={i}
            className="h-2.5 flex-1 rounded-[2px]"
            initial={false}
            animate={
              revealed && filled
                ? {
                    backgroundColor: "var(--color-accent)",
                    boxShadow: "0 0 16px 1px var(--color-accent-glow)",
                    scaleY: 1,
                    opacity: 1,
                  }
                : {
                    backgroundColor: "rgba(245,244,242,0.08)",
                    boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                    scaleY: revealed ? 1 : 0.45,
                    opacity: revealed ? 1 : 0.7,
                  }
            }
            transition={{ duration: 0.45, delay: revealed && filled ? delay + i * SEGMENT_STEP : 0, ease: EASE }}
          />
        );
      })}
      {revealed && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/3"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
          initial={{ x: "-120%" }}
          animate={{ x: "420%" }}
          transition={{ duration: 1.1, delay, ease: "easeOut" }}
        />
      )}
    </div>
  );
}

export function Scorecard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    if (!inView || revealed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        reveal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, revealed, reveal]);

  return (
    <Section id="scorecard" className="bg-ink-soft/30 overflow-hidden">
      <div ref={sectionRef} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionHeading eyebrow="10 — ให้คะแนนตัวเอง" title="Scorecard" className="mb-0" />
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.button
                key="hint"
                type="button"
                onClick={reveal}
                className="group flex items-center gap-3 cursor-pointer"
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <motion.span
                  className="rounded-md border border-ink-line px-4 py-1.5 text-xs tracking-[0.2em] uppercase text-foreground-muted"
                  animate={{ borderColor: ["rgba(245,244,242,0.08)", "var(--color-accent)", "rgba(245,244,242,0.08)"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  spacebar
                </motion.span>
                <span className="text-xs tracking-widest uppercase text-foreground-faint">เพื่อเปิดคะแนน</span>
              </motion.button>
            ) : (
              <motion.p
                key="revealed"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xs tracking-[0.2em] uppercase text-accent-soft"
              >
                เปิดผลแล้ว
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 md:mt-10">
          {entries.map((item, i) => {
            const delay = rowDelay(i);
            return (
              <div
                key={item.label}
                className="grid items-center gap-6 border-t border-ink-line py-6 md:grid-cols-[1.25fr_1fr] md:gap-12 md:py-7 first:border-t-0 first:pt-0"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs tracking-[0.3em] text-foreground-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-medium text-foreground">{item.label}</h3>
                  </div>
                  {item.note && (
                    <motion.p
                      className="mt-3 text-sm leading-relaxed text-foreground-muted"
                      animate={
                        revealed
                          ? { opacity: 1, filter: "blur(0px)" }
                          : { opacity: 0.22, filter: "blur(6px)" }
                      }
                      transition={{ duration: 0.7, delay: revealed ? delay + 0.3 : 0, ease: EASE }}
                    >
                      {item.note}
                    </motion.p>
                  )}
                </div>

                <div>
                  <div className="flex justify-end">
                    <ScoreNumber score={item.score} max={item.max} revealed={revealed} delay={delay} />
                  </div>
                  <SegmentGauge score={item.score} max={item.max} revealed={revealed} delay={delay} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* one-off accent flash so the press itself feels like it did something */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            key="flash"
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 55%, var(--color-accent-glow), transparent 65%)",
            }}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </Section>
  );
}
