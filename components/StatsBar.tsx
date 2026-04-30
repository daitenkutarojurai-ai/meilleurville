"use client";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 47000, suffix: "+", label: "avis d'habitants" },
  { value: 98, suffix: "+", label: "villes profilées" },
  { value: 12000, suffix: "+", label: "membres actifs" },
  { value: 96, suffix: "%", label: "satisfaction quiz" },
];

function useCountUp(target: number, started: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const duration = 1400;
    const start = performance.now();
    const step = (now: number) => {
      const pct = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(Math.floor(ease * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target]);
  return val;
}

function StatItem({ value, suffix, label }: (typeof STATS)[number] & { started: boolean }) {
  const num = useCountUp(value, true);
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold font-mono-data text-[var(--text-primary)]">
        {num.toLocaleString("fr-FR")}
        {suffix}
      </div>
      <div className="text-sm text-[var(--text-secondary)] mt-0.5">{label}</div>
    </div>
  );
}

export function StatsBar() {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-y border-[var(--border)] bg-[var(--bg-surface)] py-10"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <StatItem key={s.label} {...s} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
