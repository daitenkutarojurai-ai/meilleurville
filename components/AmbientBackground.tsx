"use client";

import { MeshGradient } from "@/components/effects/MeshGradient";

/**
 * AmbientBackground — fixed behind everything.
 *  • WebGL mesh-gradient (drifting blobs + fbm warp)
 *  • Soft floating leaves (CSS-only)
 *  • Subtle film grain overlay
 *  • Cream wash at the bottom so content stays readable
 */
export function AmbientBackground() {
  const leaves = [
    { left: "8%",  delay: "0s",  duration: "32s", size: 24, opacity: 0.10, hue: "#16A34A" },
    { left: "22%", delay: "5s",  duration: "38s", size: 18, opacity: 0.09, hue: "#22C55E" },
    { left: "38%", delay: "12s", duration: "34s", size: 22, opacity: 0.10, hue: "#84CC16" },
    { left: "55%", delay: "3s",  duration: "40s", size: 16, opacity: 0.08, hue: "#F59E0B" },
    { left: "68%", delay: "9s",  duration: "36s", size: 22, opacity: 0.10, hue: "#16A34A" },
    { left: "82%", delay: "15s", duration: "39s", size: 20, opacity: 0.09, hue: "#22C55E" },
    { left: "92%", delay: "7s",  duration: "33s", size: 14, opacity: 0.08, hue: "#84CC16" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 opacity-60">
        <MeshGradient />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-canvas)]/65 to-[var(--bg-canvas)]/85" />

      {leaves.map((leaf, i) => (
        <svg
          key={i}
          className="absolute animate-leaf-fall"
          style={{
            left: leaf.left,
            top: "-40px",
            width: leaf.size,
            height: leaf.size,
            opacity: leaf.opacity,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
            color: leaf.hue,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11 20A7 7 0 0 1 4 13c0-4.51 4.06-7.27 11-9c-1.73 6.94-4.49 11-9 11h0Z" />
        </svg>
      ))}

      <div className="grain grain-soft" />
    </div>
  );
}
