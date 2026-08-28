"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn("mb-10 md:mb-14", className)}
    >
      {eyebrow && (
        <p className="text-sm tracking-[0.2em] uppercase text-foreground-faint mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground text-balance">
        {title}
      </h2>
    </motion.div>
  );
}
