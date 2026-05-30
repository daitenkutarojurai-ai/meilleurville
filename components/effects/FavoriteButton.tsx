"use client";

import { useSyncExternalStore, useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { authFetch, getToken } from "@/lib/auth-client";

const STORAGE_KEY = "meilleurville:favorites";
const CHANGED_EVENT = "favorites-changed";

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
    window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
  } catch {}
}

// ----- useSyncExternalStore plumbing -------------------------------------
// One subscribe target (both components react to the same event) avoids the
// useEffect-then-setState pattern that triggers
// react-hooks/set-state-in-effect under React 19 strict-mode.
function subscribe(notify: () => void) {
  window.addEventListener(CHANGED_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CHANGED_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}

// Snapshot is cached so consecutive reads of "same content" return the same
// array reference — useSyncExternalStore requires this to avoid render loops.
let cachedRaw: string | null = null;
let cachedList: string[] = [];

function readSnapshot(): string[] {
  if (typeof window === "undefined") return cachedList;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const data = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(data) ? (data as string[]) : [];
  } catch {
    cachedList = [];
  }
  return cachedList;
}

const EMPTY: string[] = [];
function readServerSnapshot(): string[] {
  return EMPTY;
}

function useFavorites(): string[] {
  return useSyncExternalStore(subscribe, readSnapshot, readServerSnapshot);
}

// ----- Account sync helpers (D1 via the Worker) --------------------------
// Anonymous favourites live in localStorage. When logged in, writes mirror to
// /api/favorites and the local + remote sets are merged once per session.

let mergeAttempted = false;

async function mergeFavoritesOnLogin(): Promise<void> {
  if (mergeAttempted || !getToken()) return;
  mergeAttempted = true;
  try {
    const res = await authFetch("/api/favorites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ merge: readFavorites() }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { favorites: string[] };
    const merged = Array.from(new Set([...readFavorites(), ...(data.favorites ?? [])]));
    if (merged.length !== readFavorites().length) writeFavorites(merged);
  } catch {
    /* offline / server error — localStorage stays the source of truth */
  }
}

async function syncFavorite(slug: string, adding: boolean): Promise<void> {
  if (!getToken()) return;
  try {
    await authFetch("/api/favorites", {
      method: adding ? "POST" : "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    });
  } catch {
    /* fire-and-forget — local state already updated */
  }
}

// ----- Public components --------------------------------------------------

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
  const favorites = useFavorites();
  const active = favorites.includes(slug);
  const [animating, setAnimating] = useState(false);

  // On mount: if logged in, merge account favourites into localStorage (once).
  useEffect(() => {
    mergeFavoritesOnLogin();
  }, []);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const current = readFavorites();
    const adding = !current.includes(slug);
    const next = adding
      ? [...current, slug]
      : current.filter((s) => s !== slug);
    writeFavorites(next);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    // Mirror to the account if logged in (fire-and-forget).
    syncFavorite(slug, adding);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={
        "inline-flex items-center gap-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-pink)] " +
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
  const favorites = useFavorites();
  if (favorites.length === 0) return null;
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-[var(--accent-pink)]/15 text-[var(--accent-pink)] text-[10px] font-bold font-mono-data px-1.5 py-0.5 ${className}`}>
      {favorites.length}
    </span>
  );
}
