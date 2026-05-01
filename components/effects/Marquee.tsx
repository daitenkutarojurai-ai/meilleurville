"use client";

import type { ReactNode } from "react";

/**
 * Marquee — duplicates content for a seamless infinite scroll.
 * CSS-only animation; pause on hover.
 */
export function Marquee({
  children,
  speed = 60,
  reverse = false,
  className = "",
}: {
  children: ReactNode;
  /** seconds per full loop */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee gap-8 will-change-transform"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0 gap-8">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-8">{children}</div>
      </div>
      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-canvas)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-canvas)] to-transparent" />
    </div>
  );
}
