"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type IntroContextValue = { done: boolean; markDone: () => void };

const IntroContext = createContext<IntroContextValue | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  return (
    <IntroContext.Provider value={{ done, markDone: () => setDone(true) }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntroDone() {
  const ctx = useContext(IntroContext);
  return ctx?.done ?? true;
}

export function useMarkIntroDone() {
  const ctx = useContext(IntroContext);
  return ctx?.markDone ?? (() => {});
}
