"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function readNavbarHeight(): number {
  if (typeof document === "undefined") return 56;
  const nav = document.querySelector("nav.sticky");
  if (!nav) return 56;
  return Math.round((nav as HTMLElement).getBoundingClientRect().height);
}

const SECTIONS = [
  { id: "top5",       label: "Top 5",       emoji: "🏆" },
  { id: "classements",label: "Classements", emoji: "📊" },
  { id: "explorer",   label: "Explorer",    emoji: "🔍" },
  { id: "quiz",       label: "Quiz IA",     emoji: "✨" },
  { id: "simulateur", label: "Simulateur",  emoji: "💸" },
  { id: "guides",     label: "Guides",      emoji: "📖" },
];

export function SectionNav() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("");
  const [navHeight, setNavHeight] = useState(56);

  useEffect(() => {
    const sync = () => setNavHeight(readNavbarHeight());
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    // Show nav once hero leaves viewport
    const heroObs = new IntersectionObserver(
      ([e]) => setVisible(!e.isIntersecting),
      { rootMargin: "0px" }
    );
    heroObs.observe(hero);

    // Scrollspy: highlight whichever section is most in view
    const sectionEls = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const sectionObs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.intersectionRatio >= b.intersectionRatio ? a : b
          );
          setActive(top.target.id);
        }
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.1, 0.5, 1] }
    );
    sectionEls.forEach((el) => sectionObs.observe(el));

    return () => {
      heroObs.disconnect();
      sectionObs.disconnect();
    };
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={cn(
        "sticky z-40 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}
      style={{ top: navHeight }}
      aria-label="Navigation sections"
    >
      <div className="border-b border-[var(--border)]/60 bg-[var(--bg-canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                  active === s.id
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                )}
              >
                <span aria-hidden>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
