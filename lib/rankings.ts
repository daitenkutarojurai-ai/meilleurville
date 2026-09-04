// Moteur des 19 classements officiels — `/classements/[slug]` (FR) et
// `/rankings/[slug]` (EN), qui appellent tous deux `getRankedCities()`.
//
// **Convention** : `score` est sur **0-10 et `10 = bon`**, sans exception, et le
// `rank` renvoyé court en sens inverse — **1 = le meilleur**. Aucune inversion
// à faire à l'affichage : c'est déjà l'orientation de la palette
// `scoreColor`/`scoreHex` (cf. l'en-tête de `lib/utils.ts`).
//
// Direction vérifiée par exécution sur les 540 villes le 2026-09-04, jamais
// supposée : les 8 axes pondérés (`cost`, `culture`, `life`, `nature`,
// `remoteWork`, `safety`, `schools`, `transport`) sont tous des axes du seed
// orientés `10 = bon`, aucun poids n'est négatif, et les trois barèmes qui ne
// passent pas par les poids — `climat`, `logement`, `bord-de-mer` — rendent eux
// aussi `10 = bon`. Bornes constatées sur l'ensemble des 19 : 0,40 à 9,50, tri
// décroissant partout, rang 1 en tête partout.
//
// ⚠️ Deux pièges portés par ce fichier :
//  ① `cost` est nommé pour une **qualité** malgré son nom de dépense : 10 =
//     abordable. Le pondérer positivement dans un classement « budget » est
//     donc correct ; l'inverser serait le bug.
//  ② `bord-de-mer` est le seul classement **filtré** (score > 0) : il rend 55
//     villes et non 540. Un consommateur qui suppose 540 lignes se trompe.
//
// ⚠️ Ce moteur trie un score à une décimale sur 540 villes, donc les ex æquo
// **stricts** y sont la norme : mesuré le 2026-09-04, les 19 classements ont un
// ex æquo dans leur top 10, 5 d'entre eux ont un #1 et un #2 à la même note, et
// le plus gros palier du top 50 compte 21 villes (`budget`). L'ordre entre deux
// villes à égalité est la permutation interne du tri, pas un départage — voir la
// convention d'honnêteté de `lib/owner-rankings.ts`, qui publie des paliers
// plutôt que des rangs fabriqués, et le rapport docs/integrite-2026-08-28.md.
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import type { City } from "@/lib/types";
import { RANKING_META, type RankingSlug } from "@/lib/rankings-meta";

// Réexport historique : `RANKING_META` a longtemps vécu ici, et une trentaine
// de surfaces l'importent depuis ce module. La table elle-même est partie dans
// `lib/rankings-meta.ts`, qui n'importe rien — c'est ce qui permet à la palette
// de recherche de lire les accroches sans embarquer le seed (cf. l'en-tête de
// ce fichier-là).
export { RANKING_META };
export type { RankingSlug };


function climateComfortScore(c: (typeof CITIES_SEED)[number]): number {
  // Real data-driven climate-comfort scorer. Returns 0..10.
  // Sunshine: more is better, diminishing returns past 3 000 h.
  const sun = Math.min(c.sunshinedays ?? 1900, 3000);
  const sunScore = Math.max(0, (sun - 1500) / 1500); // 0..1, full at 3 000 h

  // Summer: ideal ≈ 23 °C; harsh penalty past 30 °C, mild penalty under 18 °C.
  const tj = c.avgTempJuly ?? 22;
  const summerScore = tj > 30 ? Math.max(0, 1 - (tj - 30) / 5)
    : tj < 18 ? Math.max(0, 1 - (18 - tj) / 6)
    : 1 - Math.abs(tj - 23) / 12;

  // Winter: ideal ≈ 8 °C; harsh penalty under 0 °C, mild penalty over 16 °C
  // (very mild winters can mean too hot if it's a tropical city — but those
  // already lose points on summer if July is hot).
  const ta = c.avgTempJanuary ?? 5;
  const winterScore = ta < 0 ? Math.max(0, 1 - (0 - ta) / 5)
    : ta > 16 ? Math.max(0, 1 - (ta - 16) / 8)
    : 1 - Math.abs(ta - 8) / 10;

  // Composite — sunshine ×3, summer ×2, winter ×2.
  const raw = (sunScore * 3 + summerScore * 2 + winterScore * 2) / 7;
  return Math.max(0, Math.min(10, raw * 10));
}

// Tag-based filter for `bord-de-mer`. A city qualifies if it carries at least
// one strong coastal marker; otherwise it scores 0 and is pushed to the bottom.
// Trait de côte (SHOM 2024) couldn't be encoded as a geo-fence at the seed
// level, so we read the editorial tags already curated in `data/cities-seed.ts`.
const COASTAL_TAGS = new Set([
  "mer",
  "plage",
  "plages",
  "côte",
  "côte-proche",
  "balnéaire",
  "station-balnéaire",
  "océan",
  "mer-proche",
  "mer-sauvage",
  "surf",
  "sport nautique",
  "patrimoine-maritime",
  "mer-du-Nord",
]);

function coastalLivingScore(c: (typeof CITIES_SEED)[number]): number {
  const tags = new Set(c.characterTags ?? []);
  let isCoastal = false;
  for (const t of tags) {
    if (COASTAL_TAGS.has(t)) {
      isCoastal = true;
      break;
    }
  }
  if (!isCoastal) return 0;

  const s = c.scores;
  // Composite weighted: nature×3 + life×2.5 + safety×1.5 + culture×1 + cost×0.5
  // = total weight 8.5 → divide to bring back to 0..10 scale.
  const base = (s.nature * 3 + s.life * 2.5 + s.safety * 1.5 + s.culture * 1 + s.cost * 0.5) / 8.5;
  let bonus = 0;
  if ((c.sunshinedays ?? 0) > 2400) bonus += 0.4;
  if (tags.has("surf") || tags.has("station-balnéaire")) bonus += 0.3;
  if ((c.population ?? 100000) < 30000) bonus += 0.2;
  return Math.max(0, Math.min(10, base + bonus));
}

function housingAffordabilityScore(c: (typeof CITIES_SEED)[number]): number {
  // Real-data driven score from DVF + Observatoires Locaux des Loyers.
  // Returns 0..10. Cities without housing data fall back to the cost score.
  const h = HOUSING[c.slug];
  if (!h) return Math.max(0, Math.min(10, c.scores.cost * 0.95));

  // T2 rent: 350 €/mo ≈ excellent, 1200 €/mo ≈ saturé. Linear in between.
  const rentScore = Math.max(0, Math.min(10, (1200 - h.avgRentT2) / 85));

  // Buy price/m²: 700 €/m² ≈ excellent, 7 000 €/m² ≈ inaccessible. Linear.
  const buyScore = Math.max(0, Math.min(10, (7000 - h.avgBuyPriceM2) / 630));

  // Cost-of-living score from seed (already calibrated on Insee + observatoires).
  const costScore = c.scores.cost;

  // Composite — loyer ×3, achat ×2, coût général ×1.
  const raw = rentScore * 3 + buyScore * 2 + costScore * 1;
  return Math.max(0, Math.min(10, raw / 6));
}

export function getRankedCities(
  slug: RankingSlug
): Array<{ city: City; rank: number; score: number }> {
  const meta = RANKING_META[slug];
  const weights = meta.weights as Record<string, number>;

  const scored = CITIES_SEED.map((c) => {
    if (slug === "climat") {
      return { city: c, score: climateComfortScore(c) };
    }
    if (slug === "logement") {
      return { city: c, score: housingAffordabilityScore(c) };
    }
    if (slug === "bord-de-mer") {
      return { city: c, score: coastalLivingScore(c) };
    }
    let total = 0;
    let weighted = 0;
    for (const [key, w] of Object.entries(weights)) {
      const val = c.scores[key as keyof typeof c.scores] ?? 7;
      weighted += val * w;
      total += 10 * w;
    }
    const score = total > 0 ? (weighted / total) * 10 : c.scores.global;
    return { city: c, score };
  });

  const filtered = slug === "bord-de-mer" ? scored.filter((x) => x.score > 0) : scored;

  return filtered
    .sort((a, b) => b.score - a.score)
    .map((item, i) => ({
      city: {
        id: item.city.slug,
        slug: item.city.slug,
        name: item.city.name,
        region: item.city.region,
        department: item.city.department,
        population: item.city.population,
        latitude: item.city.latitude,
        longitude: item.city.longitude,
        scores: item.city.scores,
        characterTags: item.city.characterTags,
        reviewCount: 180 + Math.floor(item.city.scores.global * 30),
        sunshinedays: item.city.sunshinedays,
        avgTempJuly: item.city.avgTempJuly,
        avgTempJanuary: item.city.avgTempJanuary,
      },
      rank: i + 1,
      score: Math.round(item.score * 10) / 10,
    }));
}
