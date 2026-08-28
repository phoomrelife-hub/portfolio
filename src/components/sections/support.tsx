"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { supportItems } from "@/lib/content";

const CELLS = 28;

// One glyph per channel so the three read as different kinds of support rather
// than three copies of the same card.
const glyphs = [
  // 01 — signal arcs, radiating without a ceiling
  <g key="a">
    <circle cx="4" cy="24" r="2.5" />
    <path d="M4 16.5a7.5 7.5 0 0 1 7.5 7.5" />
    <path d="M4 9.5A14.5 14.5 0 0 1 18.5 24" />
    <path d="M4 2.5A21.5 21.5 0 0 1 25.5 24" />
  </g>,
  // 02 — a seal, awarded before anything was proven
  <g key="b">
    <circle cx="14" cy="11" r="8.5" />
    <path d="M9.5 18.5 8 27l6-3.2 6 3.2-1.5-8.5" />
    <path d="m10.5 11 2.5 2.5 4.5-4.5" />
  </g>,
  // 03 — a full set, nothing missing
  <g key="c">
    <rect x="2.5" y="2.5" width="9" height="9" rx="1.5" />
    <rect x="16.5" y="2.5" width="9" height="9" rx="1.5" />
    <rect x="2.5" y="16.5" width="9" height="9" rx="1.5" />
    <rect x="16.5" y="16.5" width="9" height="9" rx="1.5" />
  </g>,
];

const keys = ["AI_ACCESS", "TRUST", "ENVIRONMENT"];

function Meter({ index }: { index: number }) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="mt-5 flex h-3 max-w-3xl items-end gap-[5px] md:h-4">
      {Array.from({ length: CELLS }, (_, i) => {
        // Brightness ramps left→right so a full channel reads as "charging up"
        // rather than as one flat slab of colour.
        const lit = 0.35 + (i / (CELLS - 1)) * 0.65;
        return (
          <motion.span
            key={i}
            initial={reduced ? false : { scaleY: 0.2, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: lit }}
            // amount, not a negative margin: the last channel's meter sits near
            // the fold and a shrunken trigger box left it permanently unlit.
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.45,
              delay: Math.min(index * 0.12, 0.36) + i * 0.022,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="h-full flex-1 origin-bottom rounded-[1px] bg-accent"
          />
        );
      })}
    </div>
  );
}

function Channel({
  item,
  index,
}: {
  item: (typeof supportItems)[number];
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.12, 0.36),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex-1 border-t border-ink-line py-7 pl-8 first:border-t-0 md:py-8 md:pl-14"
    >
      {/* Hover spotlight — decoration only, never carries information. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-6 -right-6 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(46% 120% at 10% 50%, var(--color-accent-glow), transparent 72%)",
        }}
      />

      {/* Node on the spine */}
      <span
        aria-hidden
        className="absolute left-0 top-[2.5rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-accent/50 bg-ink transition-all duration-500 group-hover:bg-accent group-hover:shadow-[0_0_0_5px_var(--color-accent-glow)] md:top-[3rem]"
      />

      <div className="relative grid gap-x-8 gap-y-5 md:grid-cols-[5.5rem_1fr]">
        <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
          <span className="font-mono text-4xl font-semibold leading-none tracking-tighter text-foreground-faint transition-colors duration-500 group-hover:text-accent md:text-6xl">
            {String(index + 1).padStart(2, "0")}
          </span>
          <svg
            viewBox="0 0 28 28"
            className="h-6 w-6 shrink-0 stroke-accent-soft/70 transition-colors duration-500 group-hover:stroke-accent md:h-8 md:w-8"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {glyphs[index % glyphs.length]}
          </svg>
        </div>

        <div className="min-w-0">
          <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-accent-soft">
            {keys[index % keys.length]}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground text-balance md:text-3xl">
            {item.title}
          </h3>
          <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-foreground-muted md:text-base">
            {item.description}
          </p>
          <Meter index={index} />
        </div>
      </div>
    </motion.article>
  );
}

export function Support() {
  return (
    <Section id="support">
      <SectionHeading
        eyebrow="08 — ซัพพอร์ท"
        title="ได้รับการซัพพอร์ทอะไรจากบริษัทบ้าง"
      />

      <div className="relative flex min-h-[58vh] flex-col">
        {/* The spine every channel hangs off — draws downward on reveal. */}
        <motion.span
          aria-hidden
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-0 h-full w-px origin-top bg-gradient-to-b from-accent/60 via-ink-line to-transparent"
        />
        {supportItems.map((item, i) => (
          <Channel key={item.title} item={item} index={i} />
        ))}
      </div>
    </Section>
  );
}
