"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { proposals } from "@/lib/content";

// Design-level metadata only — the proposal copy itself lives in content.ts.
const proposalMeta = [
  { file: "01-follow-ai-news.md", label: "ai-literacy", scope: "ทุกฝ่าย" },
  { file: "02-customer-ownership.md", label: "process", scope: "ฝ่ายขาย" },
  { file: "03-open-request.md", label: "open-invite", scope: "ทุกคน" },
];

const ease = [0.16, 1, 0.3, 1] as const;

function ProposalCommit({ body, index }: { body: string; index: number }) {
  const meta = proposalMeta[index];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.12, 0.4), ease }}
      className="relative rounded-2xl border border-ink-line bg-ink-soft/60 backdrop-blur-sm overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent"
      />

      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink-line px-5 py-3 md:px-7 font-mono text-xs">
        <span className="text-accent-soft">{meta.file}</span>
        <span className="text-diff-added">+1</span>
        <span className="text-foreground-faint">−0</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-accent-soft">
            {meta.label}
          </span>
          <span className="rounded-full border border-ink-line px-2.5 py-0.5 text-foreground-faint">
            {meta.scope}
          </span>
        </span>
      </header>

      <div className="flex gap-4 px-5 py-5 md:gap-6 md:px-7 md:py-6">
        <span
          aria-hidden
          className="hidden shrink-0 select-none font-mono text-4xl leading-none text-foreground-faint/40 sm:block"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="text-base leading-[1.8] text-foreground md:text-lg md:leading-[1.85]">
          <span aria-hidden className="mr-2 select-none font-mono text-diff-added">
            +
          </span>
          {body}
        </p>
      </div>
    </motion.article>
  );
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink-line pb-5 last:border-b-0 last:pb-0">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-faint">
        {title}
      </p>
      {children}
    </div>
  );
}

export function Proposals() {
  return (
    <Section id="proposals">
      <SectionHeading
        eyebrow="11 — ข้อเสนอ"
        title="สิ่งที่อยากเสนอให้กับบริษัท"
        className="mb-6 md:mb-8"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 0.6, ease }}
        className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs md:text-sm"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-diff-added/40 bg-diff-added-bg px-3 py-1 text-diff-added">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-diff-added" />
          Open
        </span>
        <span className="text-foreground-muted">
          <span className="text-accent-soft">phum</span> wants to merge{" "}
          <span className="text-foreground">{proposals.length} proposals</span> into{" "}
          <span className="text-accent-soft">relife:main</span>
        </span>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-10">
        <div className="flex flex-col gap-4">
          {proposals.map((item, i) => (
            <ProposalCommit key={item} body={item} index={i} />
          ))}
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start"
        >
          <SidebarBlock title="Reviewers">
            <p className="text-sm leading-relaxed text-foreground-muted">
              พี่ๆ ทุกฝ่ายใน Relife Solutions
            </p>
          </SidebarBlock>

          <SidebarBlock title="Labels">
            <div className="flex flex-wrap gap-2">
              {proposalMeta.map((m) => (
                <span
                  key={m.label}
                  className="rounded-full border border-ink-line px-2.5 py-1 font-mono text-[11px] text-foreground-muted"
                >
                  {m.label}
                </span>
              ))}
            </div>
          </SidebarBlock>

          <SidebarBlock title="Checks">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground-muted">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-diff-added" />
              เขียนจากสิ่งที่เห็นจริงตลอด 4 เดือน
            </p>
          </SidebarBlock>

          <SidebarBlock title="Status">
            <p className="text-sm leading-relaxed text-foreground-muted">
              รอพี่ๆ review — merge เมื่อไหร่ก็ได้ครับ
            </p>
          </SidebarBlock>
        </motion.aside>
      </div>
    </Section>
  );
}
