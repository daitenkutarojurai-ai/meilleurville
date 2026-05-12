"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
  className?: string;
}

export function ScoreBar({ label, score, max = 10, className }: ScoreBarProps) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const pct = Math.min(100, (score / max) * 100);
  const color =
    score >= 9.5 ? "bg-yellow-400"
    : score >= 7.5 ? "bg-emerald-500"
    : score >= 7.0 ? "bg-green-500"
    : score >= 6.0 ? "bg-lime-500"
    : score >= 5.0 ? "bg-amber-400"
    : score >= 4.0 ? "bg-orange-500"
    : "bg-red-500";

  return (
    <div ref={ref} className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono-data font-semibold text-[var(--text-primary)]">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: animated ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}
