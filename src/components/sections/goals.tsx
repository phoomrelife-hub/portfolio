"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { goals } from "@/lib/content";

// พีระมิดกางลงล่าง: ชั้นบนสุดแคบสุด ฐานล่างสุดกว้างเต็ม
const TIER_WIDTH = ["52%", "64%", "76%", "88%", "100%"];
const SLANT = 20; // px ที่เอียงเข้าด้านบนของแต่ละชั้น ทำให้ต่อกันเป็นทรงพีระมิด

const trapezoid = {
  clipPath: `polygon(${SLANT}px 0%, calc(100% - ${SLANT}px) 0%, 100% 100%, 0% 100%)`,
};

export function Goals() {
  const [descending, setDescending] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });

  const toggle = useCallback(() => setDescending((d) => !d), []);

  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, toggle]);

  return (
    <Section id="goals">
      <div ref={sectionRef} className="w-full">
        <SectionHeading eyebrow="10 — เป้าหมาย" title="เป้าหมายของเรา" className="mb-6 md:mb-8" />

        <div className="relative flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-ink-line bg-ink px-4 py-8 md:px-10 md:py-10">
          {/* แสงจากยอดพีระมิด */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/3"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(226,121,90,0.28) 0%, rgba(226,121,90,0.07) 45%, transparent 72%)",
            }}
          />

          {/* เส้นวิ่งขึ้น = ความรู้สึกว่ากล้องกำลังดิ่งลงไปข้างล่าง */}
          {descending &&
            Array.from({ length: 11 }).map((_, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="pointer-events-none absolute w-px bg-accent-soft/30"
                style={{ left: `${6 + i * 8.8}%`, height: "24%" }}
                initial={{ top: "-26%", opacity: 0 }}
                animate={{ top: ["-26%", "112%"], opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.5, delay: i * 0.04, repeat: 2, ease: "linear" }}
              />
            ))}

          {/* ยอด */}
          <motion.div
            animate={descending ? { scale: 0.9 } : { scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <span className="mb-3 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent-soft">
              {goals.peakLabel}
            </span>
            <p className="max-w-3xl text-lg leading-relaxed text-accent-soft glow-text md:text-2xl md:leading-relaxed">
              {goals.peak}
            </p>
          </motion.div>

          {/* ตัวพีระมิด */}
          <div className="relative z-10 mt-6 flex flex-1 flex-col items-center justify-end">
            <AnimatePresence mode="wait">
              {!descending ? (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.5 }}
                  className="flex w-full flex-1 flex-col items-center justify-end gap-4"
                >
                  {/* ความว่างที่ทิ้งดิ่งลงไปข้างล่าง */}
                  <div className="relative flex w-full flex-1 justify-center">
                    <div
                      className="w-px"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(243,165,131,0.45) 0%, rgba(243,165,131,0.06) 60%, transparent 100%)",
                      }}
                    />
                  </div>
                  <motion.p
                    animate={{ opacity: [0.25, 0.6, 0.25] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-xs uppercase tracking-[0.25em] text-foreground-faint"
                  >
                    กด spacebar เพื่อดิ่งลงไปดูว่ายอดนี้สูงแค่ไหน
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div
                  key="pyramid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.2 }}
                  className="flex w-full flex-col items-center gap-1.5 md:gap-2"
                >
                  {goals.milestones.map((text, i) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, y: -28, scaleX: 0.55 }}
                      animate={{ opacity: 1, y: 0, scaleX: 1 }}
                      transition={{
                        duration: 0.34,
                        delay: 0.08 + i * 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{ width: TIER_WIDTH[i] }}
                      className="origin-top"
                    >
                      <div
                        style={trapezoid}
                        className="flex items-center justify-center gap-3 border-t border-accent/20 bg-gradient-to-b from-ink-soft to-ink-soft/40 px-10 py-3.5 md:py-5"
                      >
                        <span className="font-mono text-[11px] text-foreground-faint">
                          {String(goals.milestones.length - i).padStart(2, "0")}
                        </span>
                        <span className="text-center text-sm text-foreground md:text-lg">
                          {text}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.62 }}
                    className="mt-3 flex w-full items-center gap-4"
                  >
                    <span className="h-px flex-1 bg-ink-line" />
                    <span className="text-xs uppercase tracking-[0.25em] text-foreground-faint">
                      {goals.baseLabel}
                    </span>
                    <span className="h-px flex-1 bg-ink-line" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}
