"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { asciiPortraitFrames, type AsciiFrame } from "@/lib/ascii-portrait";
import { cn } from "@/lib/utils";

const FRAME_MS = 7000;

function AsciiGrid({ frame }: { frame: AsciiFrame }) {
  return (
    <pre
      className={cn(
        "select-none font-mono leading-[1.05] text-foreground-faint whitespace-pre",
        "text-[5px] sm:text-[6px] md:text-[7px] lg:text-[8px]"
      )}
      aria-hidden="true"
    >
      {frame.lines.map((line, i) => {
        if (line.gold.length === 0) {
          return <div key={i}>{line.text}</div>;
        }
        const segments: { text: string; gold: boolean }[] = [];
        let cursor = 0;
        for (const [start, end] of line.gold) {
          if (start > cursor) segments.push({ text: line.text.slice(cursor, start), gold: false });
          segments.push({ text: line.text.slice(start, end), gold: true });
          cursor = end;
        }
        if (cursor < line.text.length) segments.push({ text: line.text.slice(cursor), gold: false });
        return (
          <div key={i}>
            {segments.map((seg, j) =>
              seg.gold ? (
                <span key={j} className="text-accent-soft">
                  {seg.text}
                </span>
              ) : (
                <span key={j}>{seg.text}</span>
              )
            )}
          </div>
        );
      })}
    </pre>
  );
}

// Briefly flashes the real photo over the ASCII grid — a "sensor lock"
// glitch so anyone who can't parse ASCII art still recognizes a face.
function GlitchFlicker({ frame }: { frame: AsciiFrame }) {
  const [flash, setFlash] = useState(false);
  const [scanlineTop, setScanlineTop] = useState(50);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleFlash = () => {
      const delay = 1800 + Math.random() * 2200;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setScanlineTop(20 + Math.random() * 60);
        setFlash(true);
        setTimeout(() => {
          if (!cancelled) setFlash(false);
        }, 90 + Math.random() * 90);
        scheduleFlash();
      }, delay);
    };
    scheduleFlash();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [frame.key]);

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          key="flicker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.04 }}
          className="absolute inset-0 overflow-hidden"
        >
          <Image
            src={frame.photo}
            alt=""
            fill
            sizes="480px"
            className="object-cover grayscale contrast-125"
            style={{ mixBlendMode: "luminosity" }}
          />
          <div className="absolute inset-0 bg-accent/10 mix-blend-color" />
          <div
            className="absolute inset-x-0 h-px bg-accent-soft/70"
            style={{ top: `${scanlineTop}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AsciiPortrait({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % asciiPortraitFrames.length;
      setIndex(indexRef.current);
    }, FRAME_MS);
    return () => clearInterval(id);
  }, []);

  const frame = asciiPortraitFrames[index];

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={frame.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <AsciiGrid frame={frame} />
        </motion.div>
      </AnimatePresence>
      <GlitchFlicker frame={frame} />
    </div>
  );
}
