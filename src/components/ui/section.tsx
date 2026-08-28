import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Each section is a normal full-bleed block in the vertically-scrolling page —
// min-h-screen keeps the one-screen-per-section feel without trapping scroll
// inside the section the way a fixed h-screen + overflow-y-auto would.
export function Section({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative min-h-screen w-full px-6 md:px-16 lg:px-24 py-16 flex flex-col justify-center",
        className
      )}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}
