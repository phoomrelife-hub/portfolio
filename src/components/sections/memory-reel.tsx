"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { memoryReel, type MemoryBeat } from "@/lib/content";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// How long a single frame of the reel is held. Multi-photo beats burst faster
// because they are one memory told in several shots, not several memories.
const SINGLE_MS = 4000;
const BURST_MS = 4000;
const PIVOT_MS = 4200;

const BEATS = memoryReel.filter((b) => b.era !== "bonus");
const BONUS = memoryReel.find((b) => b.era === "bonus") as MemoryBeat;
// The beat the hair — and the story — changes on.
const PIVOT_INDEX = BEATS.findIndex((b) => b.era === "black");

function eraAccent(era: MemoryBeat["era"]) {
  return era === "black" ? "var(--color-accent)" : "var(--color-accent-soft)";
}

function Rule({ className = "" }: { className?: string }) {
  return <span className={`block h-px bg-ink-line ${className}`} />;
}

function Perforations() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-0 flex justify-between px-2">
      {Array.from({ length: 22 }).map((_, i) => (
        <span key={i} className="h-1.5 w-2 rounded-[1px] bg-foreground/10" />
      ))}
    </span>
  );
}

function BonusOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const media = BONUS.photos ?? [];

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] overflow-y-auto bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={BONUS.caption}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 0%, var(--color-accent-glow) 0%, transparent 60%)",
        }}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="ปิด"
        className="fixed right-5 top-5 z-[80] rounded-full border border-ink-line bg-ink-soft/80 px-4 py-2 text-xs uppercase tracking-widest text-foreground-muted transition-colors hover:border-accent hover:text-foreground"
      >
        ✕ ปิด
      </button>

      <div className="relative mx-auto w-full max-w-5xl px-6 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground-faint md:text-[11px]"
        >
          <span className="text-accent">bonus</span>
          <Rule className="flex-1" />
          <span>unlocked</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
          className="mb-10 text-[clamp(1.2rem,2.4vw,2rem)] font-semibold leading-[1.5] text-foreground glow-text"
        >
          {BONUS.caption}
        </motion.p>

        <div className="grid gap-6 md:grid-cols-2">
          {media.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: EASE_OUT }}
              className="relative aspect-[4/5] overflow-hidden rounded-sm border border-accent/30 bg-ink-soft"
            >
              <Image
                src={src}
                alt={BONUS.caption}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-contain"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

export function MemoryReel() {
  const railRef = useRef<HTMLDivElement>(null);
  const active = useInView(railRef, { amount: 0.3 });
  const reduced = useReducedMotion();

  const [i, setI] = useState(0);
  const [p, setP] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);

  const beat = BEATS[i];
  const photos = beat.photos ?? [];
  const isPivot = i === PIVOT_INDEX;
  const accent = eraAccent(beat.era);

  // Videos advance on their own `ended` event; photos are on a timer.
  const holdMs = beat.video
    ? null
    : isPivot
      ? PIVOT_MS
      : photos.length > 1
        ? BURST_MS
        : SINGLE_MS;

  const step = useCallback(() => {
    if (photos.length > 1 && p < photos.length - 1) {
      setP(p + 1);
      return;
    }
    if (i >= BEATS.length - 1) {
      setFinished(true);
      return;
    }
    setI(i + 1);
    setP(0);
  }, [i, p, photos.length]);

  useEffect(() => {
    if (!active || !playing || reduced || finished || holdMs === null) return;
    const t = setTimeout(step, holdMs);
    return () => clearTimeout(t);
  }, [active, playing, reduced, finished, holdMs, step]);

  const goTo = useCallback((next: number) => {
    setI(next);
    setP(0);
    setFinished(false);
  }, []);

  const back = useCallback(() => {
    if (p > 0) {
      setP(p - 1);
      return;
    }
    if (finished) {
      setFinished(false);
      return;
    }
    if (i > 0) goTo(i - 1);
  }, [p, i, finished, goTo]);

  const currentSrc = beat.video ?? photos[Math.min(p, photos.length - 1)];

  return (
    <div className="relative z-10 w-full px-6 pb-16 pt-28 md:px-16 md:pt-32 lg:pl-28 lg:pr-24">
      {/* --- band header ---------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground-faint md:text-[11px]"
      >
        <span className="text-accent-soft">/</span>
        <span>memory reel</span>
        <Rule className="w-16" />
        <span className="hidden sm:inline">
          {String(i + 1).padStart(2, "0")} / {String(BEATS.length).padStart(2, "0")}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        {/* --- the projector frame ------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="lg:col-span-8"
        >
          <div
            className="relative aspect-video w-full overflow-hidden rounded-sm border bg-ink-soft/70"
            style={{ borderColor: finished ? "rgba(226,121,90,0.45)" : "var(--color-ink-line)" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -left-px -top-px z-30 h-4 w-4 border-l border-t"
              style={{ borderColor: accent }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-px -top-px z-30 h-4 w-4 border-r border-t"
              style={{ borderColor: accent }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-px -left-px z-30 h-4 w-4 border-b border-l"
              style={{ borderColor: accent }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-px -right-px z-30 h-4 w-4 border-b border-r"
              style={{ borderColor: accent }}
            />

            <div className="pointer-events-none absolute inset-x-0 top-1.5 z-20 opacity-70">
              <Perforations />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-20 opacity-70">
              <Perforations />
            </div>

            <AnimatePresence initial={false}>
              {finished ? (
                // --- the reel has run out: the bonus is sealed, not shown ---
                <motion.div
                  key="endcard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 text-center"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
                    bonus track
                  </span>
                  <p className="max-w-md text-base leading-[1.8] text-foreground-muted md:text-lg">
                    {BONUS.caption}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBonusOpen(true)}
                      className="rounded-full border border-dashed border-accent px-6 py-3 text-xs uppercase tracking-[0.25em] text-accent transition-colors hover:bg-accent hover:text-paper-ink"
                    >
                      เปิดของแถม
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        goTo(0);
                        setPlaying(true);
                      }}
                      className="rounded-full border border-ink-line px-6 py-3 text-xs uppercase tracking-[0.25em] text-foreground-faint transition-colors hover:border-accent hover:text-foreground"
                    >
                      ดูใหม่
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`${i}-${p}`}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 44 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -44 }}
                  transition={{ duration: reduced ? 0.25 : 0.6, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  {/* blurred bed so portrait shots don't sit on dead space */}
                  {!beat.video && (
                    <Image
                      aria-hidden
                      src={currentSrc}
                      alt=""
                      fill
                      unoptimized
                      sizes="70vw"
                      className="scale-110 object-cover opacity-25 blur-2xl"
                    />
                  )}
                  {beat.video ? (
                    <video
                      key={beat.video}
                      src={beat.video}
                      muted
                      playsInline
                      autoPlay={Boolean(active && playing && !reduced)}
                      onEnded={step}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={currentSrc}
                      alt={beat.caption}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      className="object-contain"
                      style={{
                        filter: beat.era === "blonde" ? "saturate(0.88) sepia(0.12)" : undefined,
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* the era flips here — the frame flares once as it does */}
            {isPivot && !finished && (
              <motion.span
                key={`flash-${i}`}
                aria-hidden
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: EASE_OUT }}
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    "linear-gradient(100deg, transparent 0%, rgba(245,244,242,0.7) 45%, var(--color-accent) 60%, transparent 100%)",
                }}
              />
            )}

            {/* in-beat progress */}
            {!finished && holdMs !== null && !reduced && (
              <motion.span
                key={`bar-${i}-${p}`}
                aria-hidden
                className="absolute inset-x-0 bottom-0 z-30 h-[2px] origin-left"
                style={{ background: accent }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: active && playing ? 1 : 0 }}
                transition={{ duration: holdMs / 1000, ease: "linear" }}
              />
            )}
          </div>
        </motion.div>

        {/* --- the caption plate -------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT }}
          className="lg:col-span-4"
        >
          <span
            className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: accent }}
          >
            <span className="h-px w-6" style={{ background: accent }} />
            {finished ? "end of reel" : beat.era === "black" ? "ep.02 — ผมดำ" : "ep.01 — ผมบลอนด์"}
          </span>

          <div className="min-h-[6.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={finished ? "cap-end" : `cap-${i}`}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className={`text-balance text-[clamp(1.05rem,1.7vw,1.5rem)] font-semibold leading-[1.6] text-foreground ${
                  isPivot && !finished ? "glow-text" : ""
                }`}
              >
                {finished ? "จบทริป — แต่ยังเหลืออีกหนึ่งอย่าง" : beat.caption}
              </motion.p>
            </AnimatePresence>

            {isPivot && !finished && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-accent"
              >
                จุดเปลี่ยน
              </motion.span>
            )}
          </div>

          <Rule className="my-6" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={back}
              aria-label="ย้อนกลับ"
              className="h-11 w-11 rounded-full border border-ink-line text-foreground-faint transition-colors hover:border-accent hover:text-foreground"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? "หยุดพัก" : "เล่นต่อ"}
              className="h-11 w-11 rounded-full border border-ink-line text-foreground-faint transition-colors hover:border-accent hover:text-foreground"
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button
              type="button"
              onClick={step}
              aria-label="ถัดไป"
              className="h-11 w-11 rounded-full border border-ink-line text-foreground-faint transition-colors hover:border-accent hover:text-foreground"
            >
              ›
            </button>
            <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground-faint">
              {photos.length > 1 && !finished ? `ภาพ ${p + 1}/${photos.length}` : " "}
            </span>
          </div>
        </motion.div>
      </div>

      {/* --- the timeline rail: two eras, one visible seam ------------------- */}
      <div ref={railRef} className="mt-10">
        <Rule className="mb-3" />
        <div className="flex items-end gap-[3px]">
          {BEATS.map((b, idx) => {
            const done = finished || idx <= i;
            return (
              <button
                key={`${b.caption}-${idx}`}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={b.caption}
                aria-current={idx === i && !finished}
                className={`group flex-1 py-3 ${idx === PIVOT_INDEX ? "ml-3 border-l border-dashed border-accent/50 pl-3" : ""}`}
              >
                <span
                  className="block h-full w-full transition-all"
                  style={{
                    height: idx === i && !finished ? 18 : 8,
                    background: done ? eraAccent(b.era) : "var(--color-ink-line)",
                    opacity: done ? 1 : 0.9,
                  }}
                />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setFinished(true);
              setBonusOpen(true);
            }}
            aria-label={BONUS.caption}
            className="ml-3 flex-1 border-l border-dashed border-accent/50 py-3 pl-3"
          >
            <span
              className="block w-full border border-dashed border-accent"
              style={{ height: finished ? 18 : 8 }}
            />
          </button>
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-foreground-faint md:text-[10px]">
          <span>เม.ย.</span>
          <span className="text-accent">ผมดำแล้ว!!</span>
          <span>ส.ค. + bonus</span>
        </div>
      </div>

      <AnimatePresence>
        {bonusOpen && <BonusOverlay onClose={() => setBonusOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
