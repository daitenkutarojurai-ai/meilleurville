"use client";
import { useEffect, useRef, useState } from "react";
import { Users, MapPin, Star, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  accent: string;
}

const STATS: Stat[] = [
  { value: 47000, suffix: "+", label: "avis d'habitants", icon: Users, accent: "from-emerald-400 to-lime-400" },
  { value: 340,   suffix: "+", label: "villes profilées", icon: MapPin, accent: "from-amber-400 to-orange-400" },
  { value: 12000, suffix: "+", label: "membres actifs", icon: Sparkles, accent: "from-pink-400 to-rose-400" },
  { value: 96,    suffix: "%", label: "satisfaction quiz", icon: Star, accent: "from-sky-400 to-emerald-400" },
];

function useCountUp(target: number, started: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const duration = 1600;
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

function StatItem({ value, suffix, label, icon: Icon, accent, started }: Stat & { started: boolean }) {
  const num = useCountUp(value, started);
  return (
    <div className="group relative flex flex-col items-center text-center">
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} shadow-lg ring-1 ring-white/40 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-white drop-shadow" />
      </div>
      <div className="text-3xl sm:text-4xl font-bold font-mono-data text-[var(--text-primary)] tracking-tight">
        {num.toLocaleString("fr-FR")}
        <span className="text-[var(--accent)]">{suffix}</span>
      </div>
      <div className="text-sm text-[var(--text-secondary)] mt-1">{label}</div>
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
      className="relative border-y border-[var(--border)]/60 py-12 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--bg-surface)]/70 backdrop-blur-sm" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(34,197,94,0.06),transparent_70%)]" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-8 relative">
          <div className="pointer-events-none absolute inset-y-2 left-1/4 hidden sm:block w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-2 left-1/2 hidden sm:block w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-2 left-3/4 hidden sm:block w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent" />

          {STATS.map((s) => (
            <StatItem key={s.label} {...s} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
