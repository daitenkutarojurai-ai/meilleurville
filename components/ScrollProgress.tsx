"use client";
import { useEffect, useState } from "react";

/**
 * Thin reading-progress bar pinned to the very top of the viewport.
 * Sits above the sticky navbar (z-[60]) and tracks how far the page is
 * scrolled. Pointer-events-none so it never intercepts taps.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] pointer-events-none"
      aria-hidden
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)]"
        style={{
          transform: `scaleX(${progress})`,
          transition: "transform 90ms linear",
          opacity: progress > 0.005 ? 1 : 0,
        }}
      />
    </div>
  );
}
