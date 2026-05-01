"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const STORAGE_KEY = "meilleurville:favorites";

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as string[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(slugs: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    window.dispatchEvent(new CustomEvent("favorites-changed"));
  } catch {}
}

export function FavoriteButton({
  slug,
  className = "",
  size = 18,
  label = false,
}: {
  slug: string;
  className?: string;
  size?: number;
  label?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setActive(readFavorites().includes(slug));
    function onChange() {
      setActive(readFavorites().includes(slug));
    }
    window.addEventListener("favorites-changed", onChange);
    return () => window.removeEventListener("favorites-changed", onChange);
  }, [slug]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const current = readFavorites();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    writeFavorites(next);
    setActive(next.includes(slug));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={
        "inline-flex items-center gap-1.5 rounded-full transition-all " +
        (active
          ? "bg-[var(--accent-pink)]/15 text-[var(--accent-pink)] hover:bg-[var(--accent-pink)]/25"
          : "bg-white/70 text-[var(--text-secondary)] hover:bg-white hover:text-[var(--accent-pink)]") +
        " backdrop-blur ring-1 ring-white/40 px-2.5 py-1.5 " +
        className
      }
    >
      <Heart
        className={
          "transition-transform " +
          (active ? "fill-[var(--accent-pink)] text-[var(--accent-pink)]" : "") +
          (animating ? " scale-125" : "")
        }
        style={{ width: size, height: size }}
      />
      {label && (
        <span className="text-xs font-semibold">
          {active ? "Sauvegardé" : "Sauvegarder"}
        </span>
      )}
    </button>
  );
}

export function FavoriteCount({ className = "" }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    setCount(readFavorites().length);
    function onChange() {
      setCount(readFavorites().length);
    }
    window.addEventListener("favorites-changed", onChange);
    return () => window.removeEventListener("favorites-changed", onChange);
  }, []);
  if (count === null || count === 0) return null;
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-[var(--accent-pink)]/15 text-[var(--accent-pink)] text-[10px] font-bold font-mono-data px-1.5 py-0.5 ${className}`}>
      {count}
    </span>
  );
}
