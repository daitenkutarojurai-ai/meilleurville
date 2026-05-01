"use client";

import { useRef, type ReactNode } from "react";

/**
 * MagneticButton — child gets pulled toward the cursor on hover.
 * Wrap any clickable. Plays nicely with framer-motion / Button.
 */
export function MagneticButton({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  /** 0–1, how much the inner element follows the cursor */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    const child = inner.current;
    if (!el || !child) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    child.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }
  function onLeave() {
    if (inner.current) inner.current.style.transform = "translate(0, 0)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block ${className}`}
    >
      <div
        ref={inner}
        style={{ transition: "transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1)", willChange: "transform" }}
      >
        {children}
      </div>
    </div>
  );
}
