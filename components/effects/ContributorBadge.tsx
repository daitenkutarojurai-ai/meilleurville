"use client";

import { useEffect, useState } from "react";

interface ContributorBadgeProps {
  visible: boolean;
}

export function ContributorBadge({ visible }: ContributorBadgeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  if (!mounted && !visible) return null;

  return (
    <div
      aria-live="polite"
      role="status"
      className={[
        "relative mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 overflow-hidden",
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
      ].join(" ")}
    >
      {/* Animated checkmark */}
      <span className="contributor-check flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-base font-bold shadow-md">
        ✓
      </span>

      <span className="font-semibold">Merci pour votre contribution !</span>

      {/* CSS confetti dots */}
      <span aria-hidden className="confetti-container absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="confetti-dot"
            style={{
              left: `${10 + i * 11}%`,
              animationDelay: `${i * 0.08}s`,
              background: ["#22C55E","#84CC16","#F59E0B","#EC4899","#0EA5E9","#A855F7","#F97316","#14B8A6"][i],
            }}
          />
        ))}
      </span>

      <style>{`
        .contributor-check {
          animation: checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes checkPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .confetti-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          top: 0;
          animation: confettiFall 0.8s ease-out forwards;
          opacity: 0;
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-4px) scale(0); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: translateY(40px) scale(0.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
