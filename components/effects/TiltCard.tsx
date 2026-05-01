"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

/**
 * TiltCard — 3D mouse-tilt with a moving spotlight highlight.
 * Real CSS perspective + transform3d. Children render inside a `transform-style: preserve-3d`
 * inner so nested elements can `translateZ()`.
 */
export function TiltCard({
  children,
  className = "",
  max = 8,
  scale = 1.02,
  glare = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  glare?: boolean;
  style?: CSSProperties;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = wrap.current;
    const card = inner.current;
    if (!el || !card) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -2 * max;
    const ry = (px - 0.5) * 2 * max;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale}, ${scale}, ${scale})`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(380px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.55), transparent 55%)`;
      glareRef.current.style.opacity = "1";
    }
  }
  function onLeave() {
    if (inner.current) {
      inner.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)";
    }
    if (glareRef.current) glareRef.current.style.opacity = "0";
  }

  return (
    <div
      ref={wrap}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-3d ${className}`}
      style={style}
    >
      <div
        ref={inner}
        className="tilt-3d-inner relative"
      >
        {children}
        {glare && (
          <div
            ref={glareRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ opacity: 0, transition: "opacity 0.3s", mixBlendMode: "soft-light" }}
          />
        )}
      </div>
    </div>
  );
}
