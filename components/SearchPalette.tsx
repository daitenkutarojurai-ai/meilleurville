"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, BookOpen, Trophy, Globe2, Tag as TagIcon, BookText, X } from "lucide-react";
import { RANKING_META } from "@/lib/rankings-meta";
import { rankingEn } from "@/lib/rankings-en";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { scoreColor, scoreHex } from "@/lib/utils";
// Projections maigres : importer @/data/guides ici expédierait le corpus
// éditorial entier au navigateur pour afficher une liste de titres, et
// @/data/cities-seed les 588 Ko du seed pour afficher un nom et un score.
// Cf. lib/search-index.ts — qui sert aussi le corpus de la bonne langue.
// `RANKING_META` vient de @/lib/rankings-meta et non de @/lib/rankings, qui
// importe le seed et data/housing.ts pour ses fonctions de tri.
import { SEARCH_CITIES, SEARCH_GUIDES, SEARCH_TAGS } from "@/lib/search-index";
import POSTAL_BY_SLUG from "@/data/city-postal-codes.json";

const POSTAL: Record<string, string[]> = POSTAL_BY_SLUG;

// Un domaine = un build, donc la locale est figée à la compilation : pas de
// prop `locale` à faire descendre depuis la Navbar, même choix que celle-ci.
const IS_EN = DEFAULT_LOCALE === "en";

/** Choisit la chaîne de la locale du build. Sortie FR inchangée. */
function tr(fr: string, en: string): string {
  return IS_EN ? en : fr;
}

type Entry =
  | { kind: "city"; slug: string; name: string; region: string; score: number }
  | { kind: "guide"; slug: string; title: string; emoji: string }
  | { kind: "ranking"; slug: string; label: string }
  | { kind: "tag"; slug: string; label: string; count: number }
  | { kind: "glossaire"; term: string; href: string };

// Raccourcis vers les sections du glossaire. Les deux glossaires sont deux
// pages distinctes (`app/glossaire` / `app/[locale]/glossary`) avec leurs
// propres sections : les ancres `#section-N` ne se transposent pas, et les
// termes anglais sont repris **mot pour mot** de la page EN pour que le
// lecteur retrouve l'entrée sur laquelle il atterrit.
const GLOSSARY_ENTRIES_FR: { term: string; href: string }[] = [
  { term: "DPE", href: "/glossaire#section-0" },
  { term: "LMNP", href: "/glossaire#section-1" },
  { term: "LMP", href: "/glossaire#section-1" },
  { term: "Taxe foncière", href: "/glossaire#section-0" },
  { term: "Frais de notaire", href: "/glossaire#section-0" },
  { term: "Encadrement des loyers", href: "/glossaire#section-0" },
  { term: "ZFE", href: "/glossaire#section-2" },
  { term: "PTZ", href: "/glossaire#section-2" },
  { term: "Pinel", href: "/glossaire#section-1" },
  { term: "Denormandie", href: "/glossaire#section-1" },
  { term: "Fibre FTTH", href: "/glossaire#section-3" },
  { term: "PLU", href: "/glossaire#section-2" },
  { term: "Loi Carrez", href: "/glossaire#section-0" },
  { term: "Loi Boutin", href: "/glossaire#section-0" },
  { term: "TMI", href: "/glossaire#section-4" },
  { term: "IFI", href: "/glossaire#section-4" },
  { term: "Plus-value immobilière", href: "/glossaire#section-4" },
  { term: "Quotient familial", href: "/glossaire#section-4" },
  { term: "CFE", href: "/glossaire#section-4" },
];

const GLOSSARY_ENTRIES_EN: { term: string; href: string }[] = [
  { term: "DPE (Energy Performance Certificate)", href: "/glossary#section-0" },
  { term: "LMNP (Non-professional furnished-letting landlord)", href: "/glossary#section-1" },
  { term: "LMP (Professional furnished-letting landlord)", href: "/glossary#section-1" },
  { term: "Taxe foncière (property ownership tax)", href: "/glossary#section-0" },
  { term: "Notary fees (frais de notaire)", href: "/glossary#section-0" },
  { term: "Rent control (encadrement des loyers)", href: "/glossary#section-0" },
  { term: "ZFE (Low-Emission Zone)", href: "/glossary#section-2" },
  { term: "PTZ (Zero-Rate Loan)", href: "/glossary#section-2" },
  { term: "Pinel / Pinel+", href: "/glossary#section-1" },
  { term: "Denormandie", href: "/glossary#section-1" },
  { term: "FTTH fibre (Fiber To The Home)", href: "/glossary#section-3" },
  { term: "PLU (Local Urban Plan)", href: "/glossary#section-2" },
  { term: "Loi Carrez (official floor area)", href: "/glossary#section-0" },
  { term: "Loi Boutin (habitable surface)", href: "/glossary#section-0" },
  { term: "TMI (Top marginal tax rate)", href: "/glossary#section-4" },
  { term: "IFI (Property wealth tax)", href: "/glossary#section-4" },
  { term: "Capital gains tax (plus-value immobilière)", href: "/glossary#section-4" },
  { term: "Quotient familial (family tax unit)", href: "/glossary#section-4" },
  { term: "CFE (Business property tax for self-employed)", href: "/glossary#section-4" },
];

const GLOSSARY_ENTRIES = IS_EN ? GLOSSARY_ENTRIES_EN : GLOSSARY_ENTRIES_FR;

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const INDEX: Entry[] = [
  ...SEARCH_CITIES.map<Entry>((c) => ({
    kind: "city",
    slug: c.slug,
    name: c.name,
    region: c.region,
    score: c.score,
  })),
  ...SEARCH_GUIDES.map<Entry>((g) => ({
    kind: "guide",
    slug: g.slug,
    title: g.title,
    emoji: g.emoji,
  })),
  ...Object.entries(RANKING_META).map<Entry>(([slug, meta]) => ({
    kind: "ranking",
    slug,
    // Les slugs restent français des deux côtés (source de vérité unique dans
    // lib/rankings.ts) ; seul le libellé affiché change.
    label: IS_EN ? rankingEn(slug, meta).headline : meta.headline,
  })),
  ...SEARCH_TAGS.map<Entry>((t) => ({
    kind: "tag",
    slug: t.slug,
    label: t.label,
    count: t.count,
  })),
  ...GLOSSARY_ENTRIES.map<Entry>((g) => ({
    kind: "glossaire",
    term: g.term,
    href: g.href,
  })),
];

function score(entry: Entry, q: string): number {
  const name =
    entry.kind === "city" ? entry.name
    : entry.kind === "guide" ? entry.title
    : entry.kind === "ranking" ? entry.label
    : entry.kind === "tag" ? entry.label
    : entry.term;
  const n = normalize(name);
  if (entry.kind === "city" && /^\d{2,5}$/.test(q)) {
    return (POSTAL[entry.slug] ?? []).some((p) => p.startsWith(q)) ? 90 : 0;
  }
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;
  if (entry.kind === "city" && normalize(entry.region).includes(q)) return 40;
  if (entry.kind === "guide" && normalize(entry.title).split(/\s+/).some((w) => w.startsWith(q))) return 35;
  return 0;
}

function entryHref(e: Entry): string {
  // `/guides` et `/tags` partagent leur segment entre les deux locales ;
  // `/villes` et `/classements` ne l'ont pas (`/cities`, `/rankings`).
  if (e.kind === "city") return IS_EN ? `/cities/${e.slug}` : `/villes/${e.slug}`;
  if (e.kind === "guide") return `/guides/${e.slug}`;
  if (e.kind === "ranking") return IS_EN ? `/rankings/${e.slug}` : `/classements/${e.slug}`;
  if (e.kind === "tag") return `/tags/${e.slug}`;
  return e.href;
}

function entryLabel(e: Entry): string {
  if (e.kind === "city") return e.name;
  if (e.kind === "guide") return e.title;
  if (e.kind === "ranking") return e.label;
  if (e.kind === "tag") return e.label;
  return e.term;
}

function entrySublabel(e: Entry): string {
  // Les noms de région restent tels quels côté EN : ce sont des noms propres,
  // et le reste du site anglais les affiche déjà sans les traduire.
  if (e.kind === "city") return e.region;
  if (e.kind === "guide") return "Guide";
  if (e.kind === "ranking") return tr("Classement", "Ranking");
  if (e.kind === "tag") return `Tag · ${e.count} guides`;
  return tr("Glossaire", "Glossary");
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
  if (entry.kind === "tag") {
    return (
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500" aria-hidden>
        <TagIcon className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (entry.kind === "glossaire") {
    return (
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-500" aria-hidden>
        <BookText className="h-3.5 w-3.5" />
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
  if (kind === "tag") return <TagIcon className="h-3 w-3" aria-hidden />;
  if (kind === "glossaire") return <BookText className="h-3 w-3" aria-hidden />;
  return <Trophy className="h-3 w-3" aria-hidden />;
}

export function SearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  function close() {
    setQuery("");
    setHighlight(0);
    onOpenChange(false);
  }

  // Focus the input on open and lock body scroll while the palette is open.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes the palette.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const results = useMemo<Entry[]>(() => {
    if (!query.trim()) {
      // Default suggestions: top 6 cities by score
      return [...SEARCH_CITIES]
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((c) => ({
          kind: "city" as const,
          slug: c.slug,
          name: c.name,
          region: c.region,
          score: c.score,
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
    close();
    router.push(entryHref(entry));
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tr("Recherche", "Search")}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
    >
      <button
        type="button"
        aria-label={tr("Fermer la recherche", "Close search")}
        onClick={close}
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
            placeholder={tr(
              "Rechercher une ville, un guide, un classement…",
              "Search a city, a guide, a ranking…",
            )}
            aria-label={tr("Recherche globale", "Site search")}
            aria-controls="palette-results"
            aria-activedescendant={results[safeHighlight] ? `palette-opt-${safeHighlight}` : undefined}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)]">
            Esc
          </kbd>
          <button
            type="button"
            onClick={close}
            aria-label={tr("Fermer", "Close")}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul id="palette-results" role="listbox" className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
              {IS_EN ? (
                <>No results for “{query}”.</>
              ) : (
                <>Aucun résultat pour «&nbsp;{query}&nbsp;».</>
              )}
            </li>
          )}
          {results.map((entry, i) => {
            const href = entryHref(entry);
            const active = i === safeHighlight;
            return (
              <li
                key={`${entry.kind}-${entryHref(entry)}`}
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
              {tr("naviguer", "navigate")}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1 py-0.5 font-mono">↵</kbd>
              {tr("ouvrir", "open")}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Globe2 className="h-3 w-3" aria-hidden />
            {INDEX.length} {tr("entrées indexées", "entries indexed")}
          </span>
        </div>
      </div>
    </div>
  );
}
