"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade";

/**
 * ScrollReveal — animates children into view once, with sensible defaults.
 * Respects prefers-reduced-motion (renders instantly).
 */
export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 28,
  className = "",
  amount = 0.2,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  className?: string;
  /** % of element visible to trigger */
  amount?: number;
}) {
  const reduced = useReducedMotion();
  const offset =
    direction === "up"   ? { y:  distance } :
    direction === "down" ? { y: -distance } :
    direction === "left" ? { x:  distance } :
    direction === "right"? { x: -distance } :
    {};

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0)" }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
