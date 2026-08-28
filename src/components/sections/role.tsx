"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { roleScene } from "@/lib/content";

const { article } = roleScene;

export function Role() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.6, once: true });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    videoRef.current?.play().catch(() => {});
  }, [inView]);

  const handleEnded = () => {
    setDone(true);
    const v = videoRef.current;
    if (v) {
      v.loop = true;
      v.play().catch(() => {});
    }
  };

  return (
    <Section id="role">
      <div ref={sectionRef} className="w-full">
        {/* Editorial masthead: a faint oversized numeral sits behind the title so
            the heading reads as layered artwork rather than a stacked div. */}
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -top-10 md:-top-20 -left-3 md:-left-6 font-mono font-semibold leading-none text-[7rem] md:text-[14rem] lg:text-[17rem] text-foreground/[0.03] tracking-tighter"
          >
            01
          </span>
          <SectionHeading
            eyebrow="01 — บทบาท"
            title="หน้าที่ที่ทำงาน"
            className="relative mb-12 md:mb-20 [&>p]:text-[0.6875rem] [&>p]:tracking-[0.42em] [&>p]:mb-5 [&>p]:text-accent-soft/70 [&>h2]:text-5xl md:[&>h2]:text-7xl lg:[&>h2]:text-[5.5rem] [&>h2]:leading-[1.08] [&>h2]:tracking-[-0.03em] [&>h2]:max-w-[14ch]"
          />
        </div>

        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-20">
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 order-2 md:order-1 min-w-0"
              >
                <div className="flex items-center gap-3 mb-8">
                  <span className="h-px w-8 bg-accent/60" />
                  <p className="text-[0.625rem] tracking-[0.42em] uppercase text-foreground-faint">
                    หน้าที่ของภูมิ
                  </p>
                </div>
                <div className="flex flex-col gap-10 max-w-[46ch]">
                  {article.map((paragraph, i) => (
                    <motion.div
                      key={paragraph}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
                      className="relative pl-6 md:pl-10"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-[0.55em] font-mono text-[0.625rem] tracking-[0.2em] text-foreground-faint/70"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p
                        className={
                          i === 0
                            ? "text-base md:text-[1.0625rem] leading-[2] text-foreground/85"
                            : "text-sm md:text-[0.9375rem] leading-[2] text-foreground-muted"
                        }
                      >
                        {paragraph}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full shrink-0 overflow-hidden rounded-2xl border border-ink-line bg-ink-soft/40 order-1 md:order-2",
              done ? "md:max-w-xs" : "max-w-2xl mx-auto"
            )}
          >
            <video
              ref={videoRef}
              src="/phum-role-full.mp4"
              muted
              playsInline
              preload="auto"
              onEnded={handleEnded}
              className="w-full h-auto block"
            />
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
