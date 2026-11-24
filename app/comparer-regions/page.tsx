import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { RegionDuelsHub, type RegionDuel } from "@/components/AreaDuelsHub";
import {
  METRO_REGIONS,
  REGION_EMOJIS,
  regionToSlug,
} from "@/lib/regions";
import { CITIES_COUNT } from "@/lib/site-stats";
import { pathAlternates } from "@/lib/i18n";
import { clampMeta } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Comparer les régions françaises · 78 comparatifs 2027",
  description:
    clampMeta("Comparez 2 régions françaises côte à côte : coût de la vie, climat, immobilier, scores qualité de vie, meilleures villes. 78 combinaisons des 13 régions métropolitaines."),
  alternates: pathAlternates("/comparer-regions", "/compare-regions"),
};

const PRIORITY_PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ["Bretagne", "Occitanie", "Côte vs soleil — le grand arbitrage relocation 2026"],
  ["Bretagne", "Normandie", "Atlantique nord-ouest — proximité Paris ou identité régionale"],
  ["Provence-Alpes-Côte d'Azur", "Nouvelle-Aquitaine", "Sud-est vs sud-ouest — Méditerranée ou Atlantique"],
  ["Île-de-France", "Auvergne-Rhône-Alpes", "Paris ou Lyon — quitter la capitale sans perdre l'urbanité"],
];

// La route paire est générée dans l'ordre de METRO_REGIONS (i < j) : une paire
// éditoriale écrite dans l'autre sens pointait vers un 404 et échappait au
// dédoublonnage ci-dessous, donc la paire s'affichait deux fois.
const regionPairSlug = (a: string, b: string) =>
  METRO_REGIONS.indexOf(a) <= METRO_REGIONS.indexOf(b)
    ? `${regionToSlug(a)}-vs-${regionToSlug(b)}`
    : `${regionToSlug(b)}-vs-${regionToSlug(a)}`;

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
    PRIORITY_PAIRS.map(([a, b]) => regionPairSlug(a, b)),
  );
  const toDuel = (a: string, b: string, tagline?: string): RegionDuel => ({
    a,
    b,
    emojiA: REGION_EMOJIS[a] ?? "📍",
    emojiB: REGION_EMOJIS[b] ?? "📍",
    href: `/comparer-regions/${regionPairSlug(a, b)}`,
    tagline,
  });
  const featured = PRIORITY_PAIRS.map(([a, b, tagline]) => toDuel(a, b, tagline));
  const others = allPairs
    .filter(([a, b]) => !prioritySlugs.has(regionPairSlug(a, b)))
    .map(([a, b]) => toDuel(a, b));

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <RegionDuelsHub
        featured={featured}
        others={others}
        eyebrow="78 comparatifs · 13 régions métropolitaines"
        titleLead="Comparer 2 régions"
        titleAccent="côte à côte"
        intro={
          <p className="text-lg">
            Coût de la vie, climat, immobilier, scores moyens, top 5 villes. Toutes les
            combinaisons des 13 régions métropolitaines, en SSG.
          </p>
        }
        featuredTitle="Comparatifs prioritaires"
        featuredBadge="Priorité"
        othersTitle="Toutes les combinaisons"
        othersNote={
          <>
            Note : seules les régions métropolitaines (13) sont incluses dans ces comparatifs.
            Pour les DROM, voir la page{" "}
            <Link href="/regions" className="font-semibold text-[#4338CA] underline">
              régions
            </Link>
            .
          </>
        }
        crossLink={
          <>
            Plus précis qu&apos;une région ? Comparez deux villes directement avec{" "}
            <Link href="/comparer">le comparateur de villes</Link>, départagez deux
            départements voisins avec les{" "}
            <Link href="/comparer-departements">comparatifs départementaux</Link>, ou laissez
            le <Link href="/city-match">quiz de matching</Link> faire le tri sur les{" "}
            {CITIES_COUNT} villes du site.
          </>
        }
      />

      <Footer />
    </main>
  );
}
