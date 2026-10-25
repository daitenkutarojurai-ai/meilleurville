"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Cat {
  slug: string;
  label: string;
}

export function ClassementsJumpNav({ categories }: { categories: ReadonlyArray<Cat> }) {
  const [active, setActive] = useState<string>("");
  const [navHeight, setNavHeight] = useState(56);

  useEffect(() => {
    const sync = () => {
      const nav = document.querySelector("nav.sticky");
      if (nav) setNavHeight(Math.round((nav as HTMLElement).getBoundingClientRect().height));
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    const els = categories
      .map((c) => document.getElementById(`cat-${c.slug}`))
      .filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((a, b) =>
          a.intersectionRatio >= b.intersectionRatio ? a : b
        );
        const id = top.target.id.replace(/^cat-/, "");
        setActive(id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.5, 1] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [categories]);

  function onJump(e: React.MouseEvent<HTMLAnchorElement>, slug: string) {
    const target = document.getElementById(`cat-${slug}`);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 24;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#cat-${slug}`);
  }

  return (
    <section
      className="relative py-4 sticky z-30"
      style={{ top: navHeight, background: "transparent", boxShadow: "none" }}
      aria-label="Filtrer par catégorie"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-nowrap gap-2 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible rounded-2xl nav-couleurs-scrolled backdrop-blur ring-1 ring-[var(--accent)]/15 p-3 shadow-[0_10px_24px_-14px_rgba(79,70,229,0.55)]">
          {categories.map((cat) => {
            const isActive = active === cat.slug;
            return (
              <a
                key={cat.slug}
                href={`#cat-${cat.slug}`}
                onClick={(e) => onJump(e, cat.slug)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                  isActive
                    ? "btn-couleurs border-transparent"
                    : "bg-white/85 hover:bg-white border-[var(--accent)]/15 hover:border-[var(--accent)]/40 text-[var(--text-secondary)] hover:text-[var(--accent-hover)]"
                )}
              >
                {cat.label}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
