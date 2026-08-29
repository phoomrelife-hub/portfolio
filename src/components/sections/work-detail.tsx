"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Mascot, type MascotMotion, type EyeState } from "@/components/three/mascot";
import { LabAgentRack, LabConsole } from "@/components/sections/lab-agents";
import { workItems, futureProjects, labFutureIdeas } from "@/lib/content";
import { cn } from "@/lib/utils";

const MASCOT_PX = 96;
// The reveal is a three-beat sequence: the mascot flies over from the card it
// was summoned from, holds while the dossier assembles under it, then settles.
const SUMMON_MS = 620;
const BUILD_MS = 1250;

type Stage = "summon" | "build" | "ready";

// Border edges drawn one after another so the frame is visibly assembled.
const FRAME_EDGES = [
  { key: "top", className: "left-0 top-0 h-px w-full origin-left", horizontal: true, delay: 0 },
  { key: "right", className: "right-0 top-0 h-full w-px origin-top", horizontal: false, delay: 0.12 },
  { key: "bottom", className: "bottom-0 left-0 h-px w-full origin-right", horizontal: true, delay: 0.24 },
  { key: "left", className: "left-0 top-0 h-full w-px origin-bottom", horizontal: false, delay: 0.36 },
];

const STAGE_MOTION: Record<Stage, MascotMotion> = {
  summon: "flying-in",
  build: "idle",
  ready: "idle",
};
const STAGE_EYES: Record<Stage, EyeState> = {
  summon: "open",
  build: "glow",
  ready: "open",
};

/**
 * A block that "draws itself in": wipes open from its top edge while an accent
 * scan line runs down it, so the layout reads as being constructed piece by
 * piece rather than popping in whole.
 */
function BuildBlock({
  delay,
  className,
  children,
  instant,
}: {
  delay: number;
  className?: string;
  children: React.ReactNode;
  instant?: boolean;
}) {
  if (instant) return <div className={cn("relative", className)}>{children}</div>;

  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 22, clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 h-px bg-accent"
        style={{ boxShadow: "0 0 14px var(--color-accent-glow)" }}
        initial={{ top: "0%", opacity: 0 }}
        animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
        transition={{ delay, duration: 0.6, ease: "linear" }}
      />
    </motion.div>
  );
}

function InfoCard({
  label,
  body,
  delay,
  instant,
}: {
  label: string;
  body: React.ReactNode;
  delay: number;
  instant?: boolean;
}) {
  return (
    <BuildBlock
      delay={delay}
      instant={instant}
      className="flex flex-col justify-center overflow-hidden rounded-xl border border-ink-line bg-ink-soft/60 p-5 md:p-6 lg:flex-1"
    >
      <p className="text-xs tracking-[0.22em] uppercase text-accent-soft">{label}</p>
      <div className="mt-2.5 text-base md:text-lg leading-relaxed text-foreground-muted">{body}</div>
    </BuildBlock>
  );
}

function WorkDossier({
  index,
  origin,
  onClose,
}: {
  index: number;
  origin: { x: number; y: number };
  onClose: () => void;
}) {
  const item = workItems[index];
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>(reduce ? "ready" : "summon");

  useEffect(() => {
    if (reduce) return;
    const toBuild = setTimeout(() => setStage("build"), SUMMON_MS);
    const toReady = setTimeout(() => setStage("ready"), SUMMON_MS + BUILD_MS);
    return () => {
      clearTimeout(toBuild);
      clearTimeout(toReady);
    };
  }, [reduce]);

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

  // Sparks fly off the mascot as it conjures, then resolve into the frame.
  const sparks = useMemo(() => {
    const jitter = (n: number) => {
      const v = Math.sin(n * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };
    return Array.from({ length: 16 }, (_, i) => ({
      angle: (i / 16) * Math.PI * 2 + jitter(i) * 0.4,
      dist: 90 + jitter(i + 7) * 190,
      delay: jitter(i + 19) * 0.35,
      size: 2 + jitter(i + 31) * 3,
    }));
  }, []);

  const built = stage !== "summon";
  const instant = Boolean(reduce);
  const base = instant ? 0 : 0.06;
  const step = instant ? 0 : 0.09;

  const hoverX = typeof window === "undefined" ? 0 : window.innerWidth / 2 - MASCOT_PX / 2;
  const hoverY = typeof window === "undefined" ? 0 : window.innerHeight * 0.3;
  const restX = typeof window === "undefined" ? 0 : Math.min(window.innerWidth - 160, window.innerWidth * 0.5 + 380);
  const restY = 42;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] overflow-y-auto bg-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      {/* accent wash that expands from the card that was clicked */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(circle at ${origin.x}px ${origin.y}px, var(--color-accent-glow), transparent 55%)`,
        }}
        initial={{ opacity: instant ? 0.12 : 0.9, scale: instant ? 1 : 0.4 }}
        animate={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="ปิด"
        className="fixed right-5 top-5 z-[80] rounded-full border border-ink-line bg-ink-soft/80 px-4 py-2 text-xs tracking-widest uppercase text-foreground-muted hover:text-foreground hover:border-accent transition-colors"
      >
        ✕ ปิด
      </button>

      {/* the mascot: flies over from the card, hovers while it conjures, settles */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[75]"
        style={{ width: MASCOT_PX, height: MASCOT_PX }}
        initial={{
          x: origin.x - MASCOT_PX / 2,
          y: origin.y - MASCOT_PX / 2,
          scale: instant ? 0.85 : 0.35,
          opacity: 0,
        }}
        animate={{
          x: instant ? restX : [origin.x - MASCOT_PX / 2, hoverX, hoverX, restX],
          y: instant ? restY : [origin.y - MASCOT_PX / 2, hoverY, hoverY, restY],
          scale: instant ? 0.85 : [0.35, 1.15, 1.15, 0.85],
          opacity: 1,
        }}
        transition={
          instant
            ? { duration: 0.3 }
            : {
                duration: (SUMMON_MS + BUILD_MS + 300) / 1000,
                times: [0, SUMMON_MS / (SUMMON_MS + BUILD_MS + 300), (SUMMON_MS + BUILD_MS) / (SUMMON_MS + BUILD_MS + 300), 1],
                ease: [0.16, 1, 0.3, 1],
              }
        }
      >
        <Mascot motion={STAGE_MOTION[stage]} eyeState={STAGE_EYES[stage]} />
        {stage === "build" && (
          <div className="absolute inset-0">
            {sparks.map((s, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 rounded-full bg-accent-soft"
                style={{ width: s.size, height: s.size }}
                initial={{ x: 0, y: 0, opacity: 0.95 }}
                animate={{
                  x: Math.cos(s.angle) * s.dist,
                  y: Math.sin(s.angle) * s.dist,
                  opacity: 0,
                }}
                transition={{ duration: 0.85, delay: s.delay, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </motion.div>

      <div
        className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col justify-center px-5 py-20 md:px-12 lg:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* the frame draws itself around the dossier before the content lands */}
        {!instant && (
          <div aria-hidden className="pointer-events-none absolute inset-3 md:inset-8">
            {FRAME_EDGES.map((edge) => (
              <motion.span
                key={edge.key}
                className={cn("absolute bg-accent", edge.className)}
                initial={{ scaleX: edge.horizontal ? 0 : 1, scaleY: edge.horizontal ? 1 : 0, opacity: 0.9 }}
                animate={{ scaleX: 1, scaleY: 1, opacity: 0.25 }}
                transition={{
                  duration: 0.45,
                  delay: SUMMON_MS / 1000 + edge.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {built && (
            <motion.div
              key="dossier"
              className="grid items-stretch gap-8 lg:min-h-[80vh] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14"
              initial={{ opacity: instant ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-6">
                <BuildBlock delay={base} instant={instant}>
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] tracking-[0.3em] uppercase text-foreground-faint">
                      {String(index + 1).padStart(2, "0")} — โปรเจกต์
                    </p>
                    {item.status === "in-progress" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-amber-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                        </span>
                        กำลังพัฒนาอยู่ — ยังไม่เสร็จ
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-serif text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-[0.92] tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm md:text-base tracking-wide uppercase text-foreground-faint">
                    {item.role}
                  </p>
                </BuildBlock>

                {item.labAgents ? (
                  <BuildBlock
                    delay={base + step}
                    instant={instant}
                    className="w-full lg:flex-1 lg:min-h-[260px] flex"
                  >
                    <LabConsole agents={item.labAgents} instant={instant} delay={base + step} />
                  </BuildBlock>
                ) : (
                  <BuildBlock
                    delay={base + step}
                    instant={instant}
                    className="aspect-video w-full lg:aspect-auto lg:flex-1 lg:min-h-[260px] overflow-hidden rounded-xl border border-ink-line bg-ink-soft/60 flex items-center justify-center"
                  >
                    {item.trailer ? (
                      <video
                        src={item.trailer}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs tracking-widest uppercase text-foreground-faint/50">
                        [TODO: วิดีโอ walkthrough]
                      </span>
                    )}
                  </BuildBlock>
                )}

                <BuildBlock delay={base + step * 2} instant={instant} className="flex flex-wrap items-center gap-2">
                  {item.tech.map((t) => (
                    <Badge key={t} className="text-[10px] px-2.5 py-0.5">
                      {t}
                    </Badge>
                  ))}
                </BuildBlock>
              </div>

              <div className="flex flex-col gap-4 md:gap-5">
                <InfoCard
                  label="รายละเอียดโปรเจกต์"
                  body={item.summary}
                  delay={base + step * 2}
                  instant={instant}
                />
                <InfoCard
                  label="ปัญหาก่อนมีโปรเจกต์นี้"
                  body={item.problemBefore ?? "—"}
                  delay={base + step * 3}
                  instant={instant}
                />
                <InfoCard
                  label="ทำไปทำไม"
                  body={item.purpose ?? "—"}
                  delay={base + step * 4}
                  instant={instant}
                />
                {item.labAgents ? (
                  <BuildBlock delay={base + step * 5} instant={instant}>
                    <LabAgentRack
                      agents={item.labAgents}
                      instant={instant}
                      delay={base + step * 5 + 0.12}
                      futureIdeas={labFutureIdeas}
                    />
                  </BuildBlock>
                ) : (
                <InfoCard
                  label="ช่วยบริษัทยังไง"
                  delay={base + step * 5}
                  instant={instant}
                  body={
                    <div className="flex flex-col gap-3">
                      {item.impact && (
                        <p className="text-base md:text-lg font-medium text-accent-soft">{item.impact}</p>
                      )}
                      <ul className="flex flex-col gap-1.5">
                        {item.highlights.map((h) => (
                          <li key={h} className="flex gap-2">
                            <span className="shrink-0 text-accent">—</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>,
    document.body
  );
}

export function WorkDetail() {
  const [open, setOpen] = useState<{ index: number; origin: { x: number; y: number } } | null>(null);

  return (
    <Section id="work-detail">
      <SectionHeading eyebrow="03 — ผลงาน" title="รายละเอียดงานที่ทำ" />
      <div className="flex flex-col gap-10 md:gap-14">
        {workItems.map((item, i) => {
          const reversed = i % 2 === 1;
          return (
            <motion.button
              key={item.title}
              type="button"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setOpen({
                  index: i,
                  origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
                });
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.4), ease: [0.16, 1, 0.3, 1] }}
              className={`text-left flex flex-col md:items-center gap-4 md:gap-8 cursor-pointer group ${
                reversed ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              {(item.photo || item.trailer) && (
                <div className="relative w-full md:w-1/2 aspect-video rounded-lg overflow-hidden bg-ink-line/40 border border-black/10 flex items-center justify-center grayscale contrast-125 transition-transform duration-300 group-hover:scale-[1.02]">
                  {item.photo?.startsWith("/") ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.photo} alt={item.title} className="h-full w-full object-cover" />
                      {item.photoOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                          <span className="px-4 text-center font-serif text-2xl md:text-4xl font-bold uppercase tracking-wide text-white">
                            {item.photoOverlay}
                          </span>
                        </div>
                      )}
                    </>
                  ) : item.trailer ? (
                    <video
                      src={item.trailer}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs tracking-widest uppercase text-foreground-faint/50">{item.photo}</span>
                  )}
                </div>
              )}

              <div className="w-full md:w-1/2">
                {item.status === "in-progress" && (
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-amber-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                    </span>
                    กำลังพัฒนาอยู่
                  </span>
                )}
                <h3 className="font-serif text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight text-foreground uppercase group-hover:text-accent-soft transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm md:text-base tracking-wide text-foreground-faint uppercase">
                  {item.role}
                </p>
              </div>
            </motion.button>
          );
        })}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-lg border border-dashed border-foreground-faint/25 px-6 py-8 md:px-10 md:py-10"
        >
          <p className="text-xs md:text-sm tracking-wide text-foreground-faint uppercase">
            โปรเจกต์ที่จะทำในอนาคต
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {futureProjects.map((name) => (
              <span
                key={name}
                className="rounded-full border border-foreground-faint/30 px-4 py-1.5 text-sm md:text-base font-medium text-foreground-faint"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <WorkDossier index={open.index} origin={open.origin} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </Section>
  );
}
