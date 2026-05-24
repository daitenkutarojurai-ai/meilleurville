"use client";

import { useSyncExternalStore, useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

// ----- Supabase sync helpers ---------------------------------------------

async function getSupabaseUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function fetchSupabaseFavorites(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("favorites")
    .select("city_slug")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.city_slug);
}

async function insertSupabaseFavorite(userId: string, slug: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("favorites").upsert({ user_id: userId, city_slug: slug });
}

async function deleteSupabaseFavorite(userId: string, slug: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("favorites").delete().eq("user_id", userId).eq("city_slug", slug);
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

  // On mount: if logged in, merge Supabase favorites into localStorage.
  useEffect(() => {
    getSupabaseUserId().then(async (userId) => {
      if (!userId) return;
      const remote = await fetchSupabaseFavorites(userId);
      if (remote.length === 0) return;
      const local = readFavorites();
      const merged = Array.from(new Set([...local, ...remote]));
      if (merged.length !== local.length) writeFavorites(merged);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Sync to Supabase if logged in (fire-and-forget).
    getSupabaseUserId().then((userId) => {
      if (!userId) return;
      if (adding) {
        insertSupabaseFavorite(userId, slug);
      } else {
        deleteSupabaseFavorite(userId, slug);
      }
    });
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
  const favorites = useFavorites();
  if (favorites.length === 0) return null;
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-[var(--accent-pink)]/15 text-[var(--accent-pink)] text-[10px] font-bold font-mono-data px-1.5 py-0.5 ${className}`}>
      {favorites.length}
    </span>
  );
}
