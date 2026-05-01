"use client";

import { useRef, type ReactNode } from "react";

/**
 * Spotlight — wraps a card and tracks the cursor with a soft radial highlight.
 * Sets `--x` and `--y` CSS variables (0-1) on the wrapper. Uses the `.spotlight`
 * class from globals.css.
 */
export function Spotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--x", String(x));
    el.style.setProperty("--y", String(y));
  }

  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
