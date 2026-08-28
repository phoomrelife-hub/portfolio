"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { gaps, radarAxes, strengths } from "@/lib/content";

const SIZE = 400;
const C = SIZE / 2;
const R = 138;
const RINGS = [0.25, 0.5, 0.75, 1];
const N = radarAxes.length;

function angleOf(i: number) {
  return ((-90 + (i * 360) / N) * Math.PI) / 180;
}

function pointAt(i: number, t: number) {
  const a = angleOf(i);
  return [C + R * t * Math.cos(a), C + R * t * Math.sin(a)] as const;
}

function ringPoints(t: number) {
  return radarAxes
    .map((_, i) => pointAt(i, t).map((n) => n.toFixed(2)).join(","))
    .join(" ");
}

const dataPoints = radarAxes
  .map((axis, i) => pointAt(i, axis.value / 100).map((n) => n.toFixed(2)).join(","))
  .join(" ");

// Label anchors sit just outside the outer ring, expressed as a percentage of
// the square chart box so the HTML label layer lines up with the SVG viewBox.
const labelAnchors = radarAxes.map((_, i) => {
  const a = angleOf(i);
  return {
    left: `${((C + (R + 32) * Math.cos(a)) / SIZE) * 100}%`,
    top: `${((C + (R + 32) * Math.sin(a)) / SIZE) * 100}%`,
  };
});

export function Strengths() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Section id="strengths">
      <SectionHeading
        eyebrow="06 — จุดแข็ง / สิ่งที่ต้องพัฒนา"
        title="ตัวเองเป็นยังไง เมื่อกางออกมาดูทุกด้าน"
      />

      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
        {/* ---------------- radar chart ---------------- */}
        <div className="relative mx-auto w-full max-w-[32rem] px-8 sm:px-12">
          <div className="relative w-full aspect-square">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--color-accent-soft)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.12" />
                </radialGradient>
                <linearGradient id="radar-sweep" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.28" />
                </linearGradient>
                <filter id="radar-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>

              {/* rings */}
              {RINGS.map((t, i) => (
                <motion.polygon
                  key={t}
                  points={ringPoints(t)}
                  fill="none"
                  stroke="rgba(245,244,242,0.10)"
                  strokeWidth={1}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                />
              ))}

              {/* spokes */}
              {radarAxes.map((axis, i) => {
                const [x, y] = pointAt(i, 1);
                const on = active === axis.key;
                return (
                  <motion.line
                    key={axis.key}
                    x1={C}
                    y1={C}
                    x2={x}
                    y2={y}
                    stroke={on ? "var(--color-accent-soft)" : "rgba(245,244,242,0.14)"}
                    strokeWidth={on ? 1.5 : 1}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  />
                );
              })}

              {/* continuous radar sweep */}
              <motion.g
                style={{ transformOrigin: `${C}px ${C}px` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              >
                <path
                  d={`M ${C} ${C} L ${C + R} ${C} A ${R} ${R} 0 0 0 ${C + R * Math.cos(-0.9)} ${
                    C + R * Math.sin(-0.9)
                  } Z`}
                  fill="url(#radar-sweep)"
                />
              </motion.g>

              {/* plotted shape */}
              <motion.g
                style={{ transformOrigin: `${C}px ${C}px` }}
                initial={{ scale: 0.04, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                transition={{ duration: 1.1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <polygon
                  points={dataPoints}
                  fill="var(--color-accent)"
                  opacity={0.35}
                  filter="url(#radar-glow)"
                />
                <polygon
                  points={dataPoints}
                  fill="url(#radar-fill)"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              </motion.g>

              {/* vertices */}
              {radarAxes.map((axis, i) => {
                const [x, y] = pointAt(i, axis.value / 100);
                const on = active === axis.key;
                return (
                  <motion.circle
                    key={axis.key}
                    cx={x}
                    cy={y}
                    fill={on ? "var(--color-accent-soft)" : "var(--color-accent)"}
                    stroke="var(--color-ink)"
                    strokeWidth={2}
                    initial={{ r: 0 }}
                    whileInView={{ r: on ? 7 : 4.5 }}
                    animate={{ r: on ? 7 : 4.5 }}
                    viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                    transition={{ duration: 0.45, delay: 0.9 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                );
              })}
            </svg>

            {/* axis labels */}
            <div className="pointer-events-none absolute inset-0">
              {radarAxes.map((axis, i) => (
                <button
                  key={axis.key}
                  type="button"
                  onMouseEnter={() => setActive(axis.key)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(axis.key)}
                  onBlur={() => setActive(null)}
                  style={labelAnchors[i]}
                  className={cn(
                    "pointer-events-auto absolute w-24 -translate-x-1/2 -translate-y-1/2 text-center text-[11px] leading-tight transition-colors",
                    active === axis.key ? "text-accent-soft" : "text-foreground-muted"
                  )}
                >
                  {axis.label}
                  <span className="block font-mono text-[10px] text-foreground-faint">{axis.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- axis legend ---------------- */}
        <ul className="flex flex-col gap-1.5">
          {radarAxes.map((axis, i) => (
            <motion.li
              key={axis.key}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setActive(axis.key)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "rounded-lg px-3 py-2 transition-colors",
                active === axis.key ? "bg-ink-soft" : "bg-transparent"
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-foreground">{axis.label}</span>
                <span className="font-mono text-[10px] text-foreground-faint">{axis.labelEn}</span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-ink-line">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${axis.value}%` }}
                  viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                  transition={{ duration: 0.9, delay: 0.5 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* ---------------- the actual reflections, per axis ---------------- */}
      <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {radarAxes.map((axis, i) => (
          <motion.div
            key={axis.key}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5% 0px -5% 0px" }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.35), ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setActive(axis.key)}
            onMouseLeave={() => setActive(null)}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              active === axis.key
                ? "border-accent/40 bg-ink-soft/70"
                : "border-ink-line bg-ink-soft/30"
            )}
          >
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-medium text-foreground">{axis.label}</h3>
              <span className="font-mono text-[10px] text-accent-soft">{axis.value}</span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-foreground-faint">{axis.note}</p>

            <ul className="flex flex-col gap-1.5">
              {axis.strengthRefs.map((ref) => (
                <li key={`s${ref}`} className="flex gap-2 text-xs leading-relaxed text-foreground-muted">
                  <span className="shrink-0 text-accent">+</span>
                  <span>{strengths[ref]}</span>
                </li>
              ))}
              {axis.gapRefs.map((ref) => (
                <li key={`g${ref}`} className="flex gap-2 text-xs leading-relaxed text-foreground-muted">
                  <span className="shrink-0 text-amber-400/90">△</span>
                  <span>{gaps[ref]}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        <div className="flex items-end xl:col-span-2">
          <p className="text-xs leading-relaxed text-foreground-faint">
            <span className="text-accent">+</span> คือสิ่งที่ทำได้ดี ·{" "}
            <span className="text-amber-400/90">△</span> คือสิ่งที่ยังต้องพัฒนา
            <br />
            คะแนนแต่ละแกนมาจากการประเมินตัวเอง — แกนที่ยิ่งสั้น คือแกนที่ยิ่งตั้งใจจะดันขึ้นในปีถัดไป
          </p>
        </div>
      </div>
    </Section>
  );
}
