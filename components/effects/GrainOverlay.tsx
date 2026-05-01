"use client";

/**
 * Subtle film-grain overlay. Pure SVG noise — zero JS.
 * Use as a sibling inside a `relative` container.
 */
export function GrainOverlay({
  opacity = 0.4,
  blend = "overlay",
  className = "",
}: {
  opacity?: number;
  blend?: "overlay" | "multiply" | "soft-light";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`grain ${className}`}
      style={{ opacity, mixBlendMode: blend }}
    />
  );
}
