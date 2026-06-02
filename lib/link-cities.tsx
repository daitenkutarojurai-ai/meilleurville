import Link from "next/link";
import { Fragment } from "react";
import { CITIES_SEED } from "@/data/cities-seed";

type Entry = { name: string; slug: string };

// Build the lookup once at module load. Sort longest first so multi-word names
// ("Aix-en-Provence", "Saint-Étienne") match before single-word substrings.
const CITY_ENTRIES: Entry[] = CITIES_SEED.map((c) => ({ name: c.name, slug: c.slug })).sort(
  (a, b) => b.name.length - a.name.length
);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// One global regex covering every city name; word-bounded so "Pau" doesn't
// match "Paul" and "Nice" doesn't match "Nicest". Apostrophes/hyphens are
// part of the name itself.
const CITY_REGEX = new RegExp(
  `(?<![\\p{L}\\p{N}])(${CITY_ENTRIES.map((e) => escapeRegExp(e.name)).join("|")})(?![\\p{L}\\p{N}])`,
  "gu"
);

const NAME_TO_SLUG = new Map(CITY_ENTRIES.map((e) => [e.name, e.slug]));

/**
 * Linkify city names in a plain text string. Only the first occurrence of each
 * city is wrapped in a <Link>; subsequent mentions stay plain to avoid spammy
 * over-linking. Returns an array of strings and <Link> nodes suitable for
 * rendering inside a <p>.
 *
 * `excludeSlug` lets the caller skip a city (typically the guide's primary
 * subject — no need to link a "Quitter Bordeaux" guide to /villes/bordeaux
 * from every paragraph).
 */
export function linkifyCities(
  text: string,
  opts: { excludeSlug?: string } = {}
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const used = new Set<string>();
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(CITY_REGEX)) {
    const name = match[0];
    const slug = NAME_TO_SLUG.get(name);
    if (!slug) continue;
    if (slug === opts.excludeSlug) continue;
    if (used.has(slug)) continue;

    const idx = match.index ?? 0;
    if (idx > lastIndex) out.push(text.slice(lastIndex, idx));
    out.push(
      <Link
        key={`city-${slug}-${key++}`}
        href={`/villes/${slug}`}
        className="text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-2 hover:decoration-[var(--accent)] transition-colors"
      >
        {name}
      </Link>
    );
    used.add(slug);
    lastIndex = idx + name.length;
  }

  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out.length > 0 ? out : [text];
}

const BOLD_RE = /\*\*([^*]+)\*\*/g;

// Strip markdown emphasis from a string — for plain-text contexts like JSON-LD
// descriptions and FAQ answers, where `**bold**` markers shouldn't appear.
export function stripMd(text: string): string {
  return text.replace(BOLD_RE, "$1");
}

// Render guide prose: `**bold**` lead-ins become <strong> (the guide bodies use
// markdown emphasis but the template renders plain text, so the markers showed
// literally). When `linkify` is set, non-bold text segments also get city links.
export function renderRich(
  text: string,
  opts: { linkify?: boolean; excludeSlug?: string } = {}
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  const pushPlain = (s: string) => {
    if (!s) return;
    // Wrap each linkified segment in a keyed Fragment so the per-call city keys
    // (which restart at 0) can't collide across segments.
    if (opts.linkify) out.push(<Fragment key={`seg-${key++}`}>{linkifyCities(s, { excludeSlug: opts.excludeSlug })}</Fragment>);
    else out.push(s);
  };
  for (const m of text.matchAll(BOLD_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) pushPlain(text.slice(last, idx));
    out.push(
      <strong key={`b-${key++}`} className="font-semibold text-[var(--text-primary)]">
        {m[1]}
      </strong>
    );
    last = idx + m[0].length;
  }
  if (last < text.length) pushPlain(text.slice(last));
  return out.length > 0 ? out : [text];
}
