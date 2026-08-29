"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { LabAgent, LabFutureIdea } from "@/lib/content";
import { cn } from "@/lib/utils";

type StatusStyle = {
  label: string;
  color: string;
  glow: string;
  tint: string;
};

const STATUS: Record<LabAgent["status"], StatusStyle> = {
  live: {
    label: "ใช้งานจริง",
    color: "var(--color-diff-added)",
    glow: "rgba(143, 201, 166, 0.32)",
    tint: "rgba(143, 201, 166, 0.07)",
  },
  developing: {
    label: "กำลังพัฒนา",
    color: "#e3b872",
    glow: "rgba(227, 184, 114, 0.3)",
    tint: "rgba(227, 184, 114, 0.07)",
  },
  restricted: {
    label: "จำกัดการเข้าถึง",
    color: "#ff5f52",
    glow: "rgba(255, 95, 82, 0.34)",
    tint: "rgba(255, 95, 82, 0.08)",
  },
};

// Diagonal hazard tape, drawn in the slot's own status colour.
function hazardStripes(color: string) {
  return `repeating-linear-gradient(45deg, ${color} 0px, ${color} 6px, transparent 6px, transparent 13px)`;
}

function StatusDot({ status, reduce }: { status: LabAgent["status"]; reduce: boolean }) {
  const s = STATUS[status];
  if (status === "restricted") {
    // No steady pulse — it flickers like a warning lamp behind glass.
    return (
      <motion.span
        aria-hidden
        className="relative block h-2 w-2 rotate-45"
        style={{ background: s.color, boxShadow: `0 0 10px ${s.glow}` }}
        animate={reduce ? undefined : { opacity: [1, 0.25, 1, 0.55, 1] }}
        transition={reduce ? undefined : { duration: 1.9, repeat: Infinity, ease: "linear" }}
      />
    );
  }
  return (
    <span aria-hidden className="relative block h-2 w-2">
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: s.color, boxShadow: `0 0 10px ${s.glow}` }}
      />
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${s.color}` }}
          animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
          transition={{ duration: status === "live" ? 2 : 2.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </span>
  );
}

function AgentSlot({
  agent,
  index,
  delay,
  reduce,
  onOpenPhoto,
}: {
  agent: LabAgent;
  index: number;
  delay: number;
  reduce: boolean;
  onOpenPhoto: (photo: string, name: string) => void;
}) {
  const s = STATUS[agent.status];
  const restricted = agent.status === "restricted";

  return (
    <motion.li
      className="relative overflow-hidden rounded-lg border p-3.5"
      style={{
        borderColor: restricted ? "rgba(255, 95, 82, 0.42)" : "var(--color-ink-line)",
        background: `linear-gradient(180deg, ${s.tint}, transparent 70%), rgba(16, 18, 24, 0.7)`,
        boxShadow: restricted ? `inset 0 0 34px rgba(255, 95, 82, 0.12)` : undefined,
      }}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {restricted && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1.5 opacity-45"
            style={{ background: hazardStripes(s.color) }}
          />
          {!reduce && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-8"
              style={{
                background: `linear-gradient(180deg, transparent, ${s.tint}, transparent)`,
              }}
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
            />
          )}
        </>
      )}

      <div className="relative flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-foreground-faint">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          <StatusDot status={agent.status} reduce={reduce} />
          <span
            className="font-mono text-[9px] tracking-[0.18em] uppercase"
            style={{ color: s.color }}
          >
            {s.label}
          </span>
        </div>
      </div>

      <p
        className={cn(
          "relative mt-2 text-sm leading-snug",
          restricted ? "text-foreground-faint" : "text-foreground"
        )}
      >
        {restricted ? (
          <span className="inline-flex items-center gap-2">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
            >
              <rect x="4" y="10.5" width="16" height="10" rx="1.5" />
              <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
            </svg>
            <span
              aria-hidden
              className="select-none"
              style={{ filter: "blur(4px)", color: "var(--color-foreground-muted)" }}
            >
              {agent.name}
            </span>
            <span className="sr-only">agent ที่ยังไม่เปิดเผย</span>
          </span>
        ) : (
          agent.name
        )}
      </p>

      {restricted && (
        <p
          className="relative mt-1.5 font-mono text-[10px] tracking-[0.16em] uppercase"
          style={{ color: s.color }}
        >
          ยังไม่เปิดเผย · อยู่ระหว่างพัฒนา
        </p>
      )}

      {!restricted && agent.photo && (
        <button
          type="button"
          onClick={() => onOpenPhoto(agent.photo!, agent.name)}
          className="relative mt-3 block w-full overflow-hidden rounded-md border border-ink-line/70 aspect-video group/thumb"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={agent.photo}
            alt={agent.name}
            className="h-full w-full object-cover grayscale contrast-125 transition-transform duration-300 group-hover/thumb:scale-105"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 text-[10px] tracking-[0.18em] uppercase text-transparent transition-colors group-hover/thumb:bg-ink/40 group-hover/thumb:text-foreground">
            ดูภาพเต็ม
          </span>
        </button>
      )}
    </motion.li>
  );
}

/**
 * The "lab rack": each internal agent shown as a containment slot rather than a
 * bullet, so the one still-locked agent can read as deliberately withheld.
 */
function PhotoLightbox({
  photo,
  name,
  onClose,
}: {
  photo: string;
  name: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-xl border border-ink-line bg-ink"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="absolute right-3 top-3 z-10 rounded-full border border-ink-line bg-ink-soft/80 px-3 py-1.5 text-xs tracking-widest uppercase text-foreground-muted hover:text-foreground"
        >
          ✕ ปิด
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={name} className="max-h-[85vh] w-full object-contain" />
        <p className="border-t border-ink-line px-4 py-2.5 text-xs tracking-wide text-foreground-faint">
          {name}
        </p>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/**
 * A boot-log style readout for the left column — fills the space the project
 * video normally occupies, since the Lab has no single trailer clip of its own.
 */
export function LabConsole({
  agents,
  delay,
  instant,
}: {
  agents: LabAgent[];
  delay: number;
  instant?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const reduce = Boolean(reduceMotion || instant);
  const liveCount = agents.filter((a) => a.status === "live").length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-ink-line bg-[#07080b] p-5 md:p-6 font-mono text-xs md:text-[13px] leading-relaxed">
      <div className="flex items-center gap-2 text-foreground-faint">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f52]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e3b872]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#8fc9a6]/70" />
        <span className="ml-2 tracking-[0.2em] uppercase">agent-grid — boot log</span>
      </div>

      <div className="mt-4 flex-1 flex flex-col justify-center gap-1.5">
        <motion.p
          className="text-foreground-faint"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay, duration: 0.3 }}
        >
          <span className="text-accent-soft">$</span> connecting to agent-grid...
        </motion.p>
        {agents.map((agent, i) => {
          const s = STATUS[agent.status];
          const restricted = agent.status === "restricted";
          return (
            <motion.p
              key={agent.name}
              initial={reduce ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduce ? 0 : delay + 0.15 + i * 0.12, duration: 0.3 }}
              className="flex items-baseline gap-2"
            >
              <span style={{ color: s.color }}>[{restricted ? "??" : "OK"}]</span>
              <span className={restricted ? "text-foreground-faint" : "text-foreground-muted"}>
                {restricted ? "node redacted" : agent.name}
              </span>
              <span className="text-foreground-faint/60">— {s.label}</span>
            </motion.p>
          );
        })}
        <motion.p
          className="mt-2 text-accent-soft"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : delay + 0.15 + agents.length * 0.12 + 0.2, duration: 0.3 }}
        >
          &gt; {liveCount}/{agents.length} nodes online
          {!reduce && (
            <motion.span
              className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 bg-accent-soft align-middle"
              animate={{ opacity: [1, 1, 0, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity, times: [0, 0.49, 0.5, 0.99, 1] }}
            />
          )}
        </motion.p>
      </div>
    </div>
  );
}

export function LabAgentRack({
  agents,
  delay,
  instant,
  futureIdeas,
}: {
  agents: LabAgent[];
  delay: number;
  instant?: boolean;
  futureIdeas?: LabFutureIdea[];
}) {
  const reduceMotion = useReducedMotion();
  const reduce = Boolean(reduceMotion || instant);
  const liveCount = agents.filter((a) => a.status === "live").length;
  const [preview, setPreview] = useState<{ photo: string; name: string } | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-ink-line bg-ink-soft/60 p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] tracking-[0.22em] uppercase text-accent-soft">
          แล็บ · agent ในระบบ
        </p>
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-foreground-faint">
          {liveCount}/{agents.length} online
        </p>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {agents.map((agent, i) => (
          <AgentSlot
            key={agent.name}
            agent={agent}
            index={i}
            reduce={reduce}
            delay={reduce ? 0 : delay + i * 0.07}
            onOpenPhoto={(photo, name) => setPreview({ photo, name })}
          />
        ))}
      </ul>

      {futureIdeas && futureIdeas.length > 0 && (
        <div className="mt-4 border-t border-dashed border-ink-line pt-3">
          <span className="font-mono text-xs tracking-[0.18em] uppercase text-accent-soft/70">
            ไอเดียในอนาคต
          </span>
          <ul className="mt-2 flex flex-col gap-2">
            {futureIdeas.map((idea) => (
              <li key={idea.name} className="text-sm leading-relaxed text-foreground-faint">
                <span className="font-medium text-foreground-muted">{idea.name}</span>
                {" — "}
                {idea.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AnimatePresence>
        {preview && (
          <PhotoLightbox photo={preview.photo} name={preview.name} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
