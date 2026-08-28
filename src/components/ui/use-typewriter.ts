"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, start: boolean, speedMs = 18, startDelayMs = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      interval = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, speedMs);
    }, startDelayMs);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [start, text, speedMs, startDelayMs]);

  return { display: text.slice(0, count), done: count >= text.length };
}
