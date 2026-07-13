"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade";

/**
 * ScrollReveal — animates children into view once, with sensible defaults.
 * Respects prefers-reduced-motion (renders instantly).
 *
 * Hand-rolled on IntersectionObserver rather than framer-motion: this was the
 * library's only real use in the app, and it pulled ~110 kB of JS onto every
 * page that reveals anything. The effect is a transform + opacity + blur
 * transition, which the compositor runs natively.
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
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  const offset =
    direction === "up" ? `translateY(${distance}px)` :
    direction === "down" ? `translateY(-${distance}px)` :
    direction === "left" ? `translateX(${distance}px)` :
    direction === "right" ? `translateX(-${distance}px)` :
    "none";

  const ease = "cubic-bezier(0.2,0.7,0.2,1)";

  return (
    <div
      ref={ref}
      // Paired with a `@media (scripting: none)` rule in globals.css: the
      // markup ships with opacity 0, so without JS it would never appear.
      data-scroll-reveal=""
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : offset,
        filter: shown ? "blur(0)" : "blur(6px)",
        transition: `opacity ${duration}s ${ease} ${delay}s, transform ${duration}s ${ease} ${delay}s, filter ${duration}s ${ease} ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
