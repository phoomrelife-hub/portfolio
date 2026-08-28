"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { useTypewriter } from "@/components/ui/use-typewriter";
import { mistakeLessons, type MistakeLesson } from "@/lib/content";

function DiffEntry({ item, index }: { item: MistakeLesson; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  const mistake = useTypewriter(item.mistake, inView, 14, 300);
  const lesson = useTypewriter(item.lesson, mistake.done, 14, 200);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-ink-line bg-ink-soft/60 backdrop-blur-sm p-6 font-mono text-sm"
    >
      <p className="text-foreground-faint mb-3 truncate">
        <span className="text-accent-soft">commit_msg</span>: {item.commit}
      </p>
      <p className="leading-relaxed text-diff-removed bg-diff-removed-bg px-3 py-1.5 rounded-md whitespace-pre-wrap">
        <span className="select-none mr-2">-</span>
        {mistake.display}
        {!mistake.done && <span className="inline-block w-[0.5em] h-[1em] bg-diff-removed/70 align-middle animate-pulse ml-0.5" />}
      </p>
      <p className="mt-2 leading-relaxed text-diff-added bg-diff-added-bg px-3 py-1.5 rounded-md whitespace-pre-wrap">
        <span className="select-none mr-2">+</span>
        {lesson.display}
        {mistake.done && !lesson.done && (
          <span className="inline-block w-[0.5em] h-[1em] bg-diff-added/70 align-middle animate-pulse ml-0.5" />
        )}
      </p>
    </motion.div>
  );
}

export function Mistakes() {
  return (
    <Section id="mistakes">
      <SectionHeading eyebrow="06 — บทเรียน" title="ผิดพลาด แล้วเรียนรู้อะไรบ้าง" />
      <p className="font-mono text-xs text-foreground-faint mb-6">
        <span className="text-accent-soft">$</span> git log --mistakes
      </p>
      <div className="flex flex-col gap-4">
        {mistakeLessons.map((item, i) => (
          <DiffEntry key={item.commit} item={item} index={i} />
        ))}
      </div>
    </Section>
  );
}
