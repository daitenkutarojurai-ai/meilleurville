import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  METRO_REGIONS,
  REGION_EMOJIS,
  regionToSlug,
} from "@/lib/regions";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Comparer les régions françaises · 78 comparatifs 2026",
  description:
    "Comparez 2 régions françaises côte à côte : coût de la vie, climat, immobilier, scores qualité de vie, meilleures villes. 78 combinaisons des 13 régions métropolitaines.",
  alternates: { canonical: "/comparer-regions" },
};

const PRIORITY_PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ["Bretagne", "Occitanie", "Côte vs soleil — le grand arbitrage relocation 2026"],
  ["Bretagne", "Normandie", "Atlantique nord-ouest — proximité Paris ou identité régionale"],
  ["Provence-Alpes-Côte d'Azur", "Nouvelle-Aquitaine", "Sud-est vs sud-ouest — Méditerranée ou Atlantique"],
  ["Île-de-France", "Auvergne-Rhône-Alpes", "Paris ou Lyon — quitter la capitale sans perdre l'urbanité"],
];

export default function ComparerRegionsIndex() {
  // All 78 combinations
  const allPairs: Array<[string, string]> = [];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      allPairs.push([METRO_REGIONS[i], METRO_REGIONS[j]]);
    }
  }

  // Priority slugs set for dedup
  const prioritySlugs = new Set(
    PRIORITY_PAIRS.map(([a, b]) => `${regionToSlug(a)}-vs-${regionToSlug(b)}`),
  );
  const otherPairs = allPairs.filter(
    ([a, b]) => !prioritySlugs.has(`${regionToSlug(a)}-vs-${regionToSlug(b)}`),
  );

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-20 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🗺️ 78 comparatifs · 13 régions métropolitaines
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Comparer 2 régions <span className="font-display italic">côte à côte</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Coût de la vie, climat, immobilier, scores moyens, top 5 villes. Toutes les
            combinaisons des 13 régions métropolitaines, en SSG.
          </p>
        </div>
      </section>

      {/* Priority pairs */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Comparatifs prioritaires
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRIORITY_PAIRS.map(([a, b, tagline]) => (
            <Link
              key={`${a}-${b}`}
              href={`/comparer-regions/${regionToSlug(a)}-vs-${regionToSlug(b)}`}
              className="block"
            >
              <Card className="hover:border-[var(--accent)]/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent">Priorité</Badge>
                  <span className="text-2xl" aria-hidden>
                    {REGION_EMOJIS[a] ?? "📍"}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{a}</span>
                  <span className="text-[var(--text-tertiary)]">vs</span>
                  <span className="text-2xl" aria-hidden>
                    {REGION_EMOJIS[b] ?? "📍"}
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">{b}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{tagline}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* All pairs (alphabetical) */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Toutes les combinaisons
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherPairs.map(([a, b]) => (
            <Link
              key={`${a}-${b}`}
              href={`/comparer-regions/${regionToSlug(a)}-vs-${regionToSlug(b)}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
            >
              <span className="mr-1" aria-hidden>
                {REGION_EMOJIS[a] ?? "📍"}
              </span>
              {a}
              <span className="mx-1 text-[var(--text-tertiary)]">vs</span>
              <span className="mr-1" aria-hidden>
                {REGION_EMOJIS[b] ?? "📍"}
              </span>
              {b}
            </Link>
          ))}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-6">
          Note : seules les régions métropolitaines (13) sont incluses dans ces comparatifs.
          Pour les DROM, voir la page <Link href="/regions" className="underline">régions</Link>.
        </p>
      </section>

      {/* Cross-link to other comparators */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            Plus précis qu&apos;une région ? Comparez deux villes directement avec{" "}
            <Link href="/comparer" className="underline text-[var(--accent)]">
              le comparateur de villes
            </Link>
            , ou laissez le{" "}
            <Link href="/city-match" className="underline text-[var(--accent)]">
              quiz de matching
            </Link>{" "}
            faire le tri sur les {CITIES_COUNT} villes du site.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
