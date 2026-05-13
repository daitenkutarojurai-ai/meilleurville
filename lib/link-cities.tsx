import Link from "next/link";
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
