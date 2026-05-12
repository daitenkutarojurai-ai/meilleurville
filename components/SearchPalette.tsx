"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, BookOpen, Trophy, Globe2, X } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";
import { RANKING_META } from "@/lib/rankings";
import { scoreColor, scoreHex } from "@/lib/utils";

type Entry =
  | { kind: "city"; slug: string; name: string; region: string; score: number }
  | { kind: "guide"; slug: string; title: string; emoji: string }
  | { kind: "ranking"; slug: string; label: string };

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const INDEX: Entry[] = [
  ...CITIES_SEED.map<Entry>((c) => ({
    kind: "city",
    slug: c.slug,
    name: c.name,
    region: c.region,
    score: c.scores.global,
  })),
  ...GUIDES.map<Entry>((g) => ({
    kind: "guide",
    slug: g.slug,
    title: g.title,
    emoji: g.emoji,
  })),
  ...Object.entries(RANKING_META).map<Entry>(([slug, meta]) => ({
    kind: "ranking",
    slug,
    label: meta.headline,
  })),
];

function score(entry: Entry, q: string): number {
  const name = entry.kind === "city" ? entry.name
    : entry.kind === "guide" ? entry.title
    : entry.label;
  const n = normalize(name);
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;
  if (entry.kind === "city" && normalize(entry.region).includes(q)) return 40;
  if (entry.kind === "guide" && normalize(entry.title).split(/\s+/).some((w) => w.startsWith(q))) return 35;
  return 0;
}

function entryHref(e: Entry): string {
  if (e.kind === "city") return `/villes/${e.slug}`;
  if (e.kind === "guide") return `/guides/${e.slug}`;
  return `/classements/${e.slug}`;
}

function entryLabel(e: Entry): string {
  if (e.kind === "city") return e.name;
  if (e.kind === "guide") return e.title;
  return e.label;
}

function entrySublabel(e: Entry): string {
  if (e.kind === "city") return e.region;
  if (e.kind === "guide") return "Guide";
  return "Classement";
}

function EntryIcon({ entry }: { entry: Entry }) {
  if (entry.kind === "city") {
    return (
      <span
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-white text-[10px] font-bold font-mono-data"
        style={{ background: scoreHex(entry.score) }}
        aria-hidden
      >
        {entry.score.toFixed(1)}
      </span>
    );
  }
  if (entry.kind === "guide") {
    return (
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--bg-elevated)] text-base" aria-hidden>
        {entry.emoji}
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)]" aria-hidden>
      <Trophy className="h-3.5 w-3.5" />
    </span>
  );
}

function KindIcon({ kind }: { kind: Entry["kind"] }) {
  if (kind === "city") return <MapPin className="h-3 w-3" aria-hidden />;
  if (kind === "guide") return <BookOpen className="h-3 w-3" aria-hidden />;
  return <Trophy className="h-3 w-3" aria-hidden />;
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global keyboard shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && !inField && !open;
      if (isCmdK || isSlash) {
        e.preventDefault();
        // Reset state when opening so the previous query doesn't linger;
        // doing it here (in a handler) instead of an effect avoids the
        // react-hooks/set-state-in-effect cascade warning.
        setOpen((v) => {
          const next = !v;
          if (next) {
            setQuery("");
            setHighlight(0);
          }
          return next;
        });
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    function onOpenEvent() {
      setOpen((v) => {
        if (v) return v;
        setQuery("");
        setHighlight(0);
        return true;
      });
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("meilleurville:open-search", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("meilleurville:open-search", onOpenEvent);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo<Entry[]>(() => {
    if (!query.trim()) {
      // Default suggestions: top 6 cities by score
      return [...CITIES_SEED]
        .sort((a, b) => b.scores.global - a.scores.global)
        .slice(0, 6)
        .map((c) => ({
          kind: "city" as const,
          slug: c.slug,
          name: c.name,
          region: c.region,
          score: c.scores.global,
        }));
    }
    const q = normalize(query);
    return INDEX
      .map((e) => ({ e, s: score(e, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 10)
      .map((x) => x.e);
  }, [query]);

  // Clamp highlight inline; setting state in an effect for derived data
  // would trigger react-hooks/set-state-in-effect.
  const safeHighlight = highlight >= results.length ? 0 : highlight;

  function commit(entry: Entry) {
    setOpen(false);
    router.push(entryHref(entry));
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
    >
      <button
        type="button"
        aria-label="Fermer la recherche"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlight(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight(Math.min(safeHighlight + 1, Math.max(0, results.length - 1)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight(Math.max(safeHighlight - 1, 0));
              } else if (e.key === "Enter") {
                if (results[safeHighlight]) commit(results[safeHighlight]);
              }
            }}
            placeholder="Rechercher une ville, un guide, un classement…"
            aria-label="Recherche globale"
            aria-controls="palette-results"
            aria-activedescendant={results[safeHighlight] ? `palette-opt-${safeHighlight}` : undefined}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)]">
            Esc
          </kbd>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul id="palette-results" role="listbox" className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
              Aucun résultat pour «&nbsp;{query}&nbsp;».
            </li>
          )}
          {results.map((entry, i) => {
            const href = entryHref(entry);
            const active = i === safeHighlight;
            return (
              <li
                key={`${entry.kind}-${entry.slug}`}
                id={`palette-opt-${i}`}
                role="option"
                aria-selected={active}
              >
                <Link
                  href={href}
                  onClick={(e) => { e.preventDefault(); commit(entry); }}
                  onMouseEnter={() => setHighlight(i)}
                  className={
                    "flex items-center gap-3 px-4 py-2.5 transition-colors " +
                    (active
                      ? "bg-[var(--accent)]/10 text-[var(--text-primary)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]")
                  }
                >
                  <EntryIcon entry={entry} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate flex items-center gap-2">
                      {entryLabel(entry)}
                      {entry.kind === "city" && (
                        <span className={`text-xs font-bold font-mono-data ${scoreColor(entry.score)}`}>
                          {entry.score.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] truncate flex items-center gap-1">
                      <KindIcon kind={entry.kind} />
                      {entrySublabel(entry)}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-[var(--border)] px-4 py-2 flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1 py-0.5 font-mono">↑↓</kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1 py-0.5 font-mono">↵</kbd>
              ouvrir
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Globe2 className="h-3 w-3" aria-hidden />
            {INDEX.length} entrées indexées
          </span>
        </div>
      </div>
    </div>
  );
}
