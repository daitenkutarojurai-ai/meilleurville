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
  { id: "top5",       label: "Top 5",       labelEn: "Top 5" },
  { id: "classements",label: "Classements", labelEn: "Rankings" },
  { id: "explorer",   label: "Explorer",    labelEn: "Explore" },
  { id: "quiz",       label: "Quiz IA",     labelEn: "AI Quiz" },
  { id: "simulateur", label: "Simulateur",  labelEn: "Calculator" },
  { id: "guides",     label: "Guides",      labelEn: "Guides" },
];

export function SectionNav({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
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

  function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <div
      className={cn(
        // Hidden on phones: the 6-pill strip is cramped on a narrow screen.
        // Shown from the md breakpoint up, where it has room to breathe.
        "hidden md:block sticky z-40 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}
      style={{ top: navHeight }}
      aria-label={locale === "en" ? "Section navigation" : "Navigation sections"}
    >
      <div className="border-b border-[var(--border)] bg-[var(--bg-canvas)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Read like the sheet index printed in the margin of a survey map:
              a mono legend, then numbered entries — no emoji, no filled pill. */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5">
            <span className="mr-2 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              {locale === "en" ? "On this page" : "Sur cette page"}
            </span>
            {SECTIONS.map((s, i) => {
              const isActive = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => scrollTo(e, s.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "relative flex shrink-0 items-baseline gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                    isActive
                      ? "text-[var(--accent)] after:absolute after:inset-x-3 after:-bottom-[7px] after:h-[2px] after:rounded-full after:bg-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "font-mono text-[10px] tabular-nums",
                      isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {locale === "en" ? s.labelEn : s.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
