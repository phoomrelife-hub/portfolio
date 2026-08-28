import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-ink-line px-3 py-1 text-xs tracking-wide text-foreground-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
