"use client";

import { motion } from "framer-motion";

export function AuraGlow({ active }: { active: boolean }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: 500,
        height: 500,
        marginLeft: -250,
        marginTop: -250,
        background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,248,239,0.5) 40%, rgba(255,255,255,0) 70%)",
        filter: "blur(6px)",
      }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={active ? { opacity: 1, scale: 2.4 } : { opacity: 0, scale: 0.4 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
    />
  );
}
