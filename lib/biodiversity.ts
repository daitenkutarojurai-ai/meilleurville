// F62 — Score Biodiversité : la couche « nature » des villes du seed.
//
// Répond à « est-ce qu'on voit encore des oiseaux, des insectes, des arbres
// ici ? ». C'est le seul axe nature que le site n'avait pas : `nature` dans le
// seed est un score éditorial, `/parcs` compte des destinations, `/air` mesure
// une pollution. Aucun ne dit ce qui **vit** autour de la ville.
//
// **Convention** : « Biodiversité » nomme une QUALITÉ → `10 = bon`, pour les
// trois composantes comme pour l'agrégat (cf. CLAUDE.md § Score convention).
// Aucune inversion à l'affichage. Une page FR et sa jumelle EN affichent le
// même nombre.
//
// ── Trois composantes, jamais un chiffre opaque ────────────────────────────
//
//   1. richesse spécifique normalisée par l'effort d'observation (GBIF) ;
//   2. couverture en zones protégées à ≤ 15 km, pondérée par le niveau de
//      protection (INPN/MNHN) ;
//   3. espaces verts urbains, repris de data/city-parks.json (F59).
//
// Chacune se lit séparément sur la page. L'agrégat n'existe que si les trois
// existent : pondérer deux composantes sur trois puis appeler ça un « score
// biodiversité » serait un chiffre faux présenté comme complet.
//
// ── Le biais d'effort d'observation ────────────────────────────────────────
//
// Le volume d'occurrences GBIF mesure d'abord combien de naturalistes saisissent
// des données, pas combien d'espèces vivent là — Paris écrase n'importe quelle
// vallée pyrénéenne en volume brut. Le nombre d'espèces distinctes hérite du
// même biais, parce que les espèces s'accumulent avec l'échantillonnage.
//
// D'où la raréfaction (Hurlbert 1971), calculée par le pipeline : le nombre
// d'espèces attendu dans un sous-échantillon de `rarefiedN` observations. Toutes
// les villes sont comparées **au même effort**. Sous ce seuil d'observations,
// la statistique n'existe pas : la ville est déclarée non mesurable et la page
// le dit, plutôt que de recevoir une moyenne départementale.
//
// ── Licences — condition, pas décoration ───────────────────────────────────
//
// GBIF : crawl restreint aux enregistrements CC0 et CC BY (CC BY-NC exclu, le
// site est commercial), citation GBIF.org + date d'accès. L'API de recherche ne
// génère pas de DOI — seule l'API de téléchargement le fait, et elle demande des
// identifiants ; on cite donc la source et la date, sans prétendre à un DOI
// qu'on n'a pas. INPN/MNHN : mention MNHN + Licence Ouverte Etalab. Toute
// surface affichant ces chiffres affiche l'attribution avec eux, au même titre
// que les crédits Commons et l'ODbL des parcs.
import RAW from "@/data/city-biodiversity.json";
import { cityParks, hasParksData, OSM_CREDIT, OSM_CREDIT_EN } from "@/lib/city-parks";
import { cityPopulation } from "@/lib/city-population";
import { CITIES_SEED } from "@/data/cities-seed";

/* ── attribution ──────────────────────────────────────────────────────── */

export const GBIF_CREDIT = "GBIF.org — Global Biodiversity Information Facility";
export const GBIF_URL = "https://www.gbif.org";
export const INPN_CREDIT = "INPN — MNHN, Licence Ouverte Etalab";
export const INPN_URL = "https://inpn.mnhn.fr";
/** Rappel : les parcs viennent d'OSM et gardent leur attribution ODbL. */
export { OSM_CREDIT, OSM_CREDIT_EN };

/* ── forme des données brutes ─────────────────────────────────────────── */

export type SpeciesGroup =
  | "birds"
  | "mammals"
  | "insects"
  | "amphibians"
  | "reptiles"
  | "plants";

export interface TopSpecies {
  key: number;
  scientificName: string | null;
  vernacularFr: string | null;
  vernacularEn: string | null;
  kingdom: string | null;
  class: string | null;
  /** Occurrences GBIF sur la période et le rayon retenus. */
  count: number;
}

/** Une ligne de data/city-biodiversity.json — des mesures, pas des scores. */
export interface CityBiodiversityRaw {
  crawledAt: string;
  source: "gbif";
  queryVersion: number;
  radiusKm: number;
  yearFrom: number;
  licenses: string[];
  occurrences: number;
  observers: number;
  observersTruncated: boolean;
  datasets: number;
  species: number;
  speciesTruncated: boolean;
  rarefiedN: number;
  /** Espèces attendues dans un sous-échantillon de `rarefiedN` observations.
   *  `null` quand la ville compte moins de `rarefiedN` observations : on ne
   *  sous-échantillonne pas plus que ce qu'on a. */
  rarefied: number | null;
  groups: Partial<Record<SpeciesGroup, number>>;
  groupsTruncated: SpeciesGroup[];
  /** Espèces classées VU / EN / CR sur la liste rouge **mondiale** UICN. Ce
   *  n'est pas la liste rouge nationale française : les statuts nationaux
   *  viennent de l'INPN, dans une phase ultérieure. */
  threatenedSpecies: number;
  topSpecies: TopSpecies[];
  accessedAt: string;
}

const DATA = RAW as unknown as Record<string, CityBiodiversityRaw>;

/** Ligne brute, ou `null` si le crawl GBIF n'a pas encore couvert la ville. */
export function cityBiodiversityRaw(slug: string): CityBiodiversityRaw | null {
  return DATA[slug] ?? null;
}

/** Vrai dès que le crawl a tourné pour ce slug — même s'il a rapporté trop peu
 *  d'observations pour être mesurable. Distingue « pas encore de donnée » de
 *  « la donnée dit que l'effort est insuffisant ». */
export function hasBiodiversityData(slug: string): boolean {
  return slug in DATA;
}

export const BIODIVERSITY_CRAWLED_SLUGS = Object.keys(DATA);
export const BIODIVERSITY_CITY_COUNT = BIODIVERSITY_CRAWLED_SLUGS.length;

/* ── seuil de mesurabilité ────────────────────────────────────────────── */

/** Sous ces seuils, aucun score de richesse n'est publié. Le premier est le
 *  seuil dur (la raréfaction n'est pas définie en dessous) ; le second écarte
 *  les villes dont tout le relevé tient à deux ou trois contributeurs, où la
 *  richesse observée dit surtout ce qui intéresse ces personnes-là. */
export const MIN_OCCURRENCES = 500;
export const MIN_OBSERVERS = 20;

export function isMeasurable(row: CityBiodiversityRaw): boolean {
  return (
    row.rarefied != null &&
    row.occurrences >= MIN_OCCURRENCES &&
    row.observers >= MIN_OBSERVERS
  );
}

/* ── zones protégées (INPN) — non encore collectées ───────────────────── */

export type ProtectionKind =
  | "reserve-naturelle"
  | "parc-national"
  | "parc-naturel-regional"
  | "natura-2000"
  | "znieff-1"
  | "znieff-2"
  | "arrete-biotope";

/** Poids par niveau de protection. Une réserve naturelle interdit et gère ;
 *  une ZNIEFF est un inventaire sans portée réglementaire — les compter à
 *  égalité reviendrait à dire qu'un zonage documentaire protège autant qu'un
 *  arrêté. */
export const PROTECTION_WEIGHT: Record<ProtectionKind, number> = {
  "reserve-naturelle": 1,
  "parc-national": 1,
  "arrete-biotope": 0.8,
  "natura-2000": 0.6,
  "parc-naturel-regional": 0.5,
  "znieff-1": 0.4,
  "znieff-2": 0.25,
};

export interface ProtectedArea {
  /** Identifiant national INPN (code Natura 2000, n° ZNIEFF, code RN…). */
  id: string;
  name: string;
  kind: ProtectionKind;
  /** Surface du périmètre intersectant le rayon retenu, en hectares. */
  areaHa: number;
  /** Distance du centre-ville au périmètre le plus proche, en km. */
  distanceKm: number;
}

export interface CityProtectedAreas {
  crawledAt: string;
  source: "inpn";
  areas: ProtectedArea[];
}

/** Rayon d'analyse des zones protégées. Plus large que les 10 km du crawl
 *  GBIF : un massif protégé à 15 km fait partie du cadre de vie, on y va le
 *  dimanche. */
export const PROTECTED_RADIUS_KM = 15;

/**
 * Zones protégées autour de la ville.
 *
 * ⚠️ Renvoie `null` pour **toutes** les villes tant que le jeu INPN n'est pas
 * collecté (phase 2 du pipeline F62). `null` veut dire « on ne sait pas », pas
 * « il n'y en a pas » : une surface qui afficherait « 0 zone protégée » sur la
 * foi de ce `null` publierait un chiffre faux sur une ville réelle. Quand le
 * jeu arrivera, seul le corps de cette fonction change.
 */
export function cityProtectedAreas(_slug: string): CityProtectedAreas | null {
  return null;
}

export const HAS_PROTECTED_DATA = false;

/**
 * Composante « zones protégées », 0–10. `null` tant que `cityProtectedAreas`
 * ne renvoie rien — c'est-à-dire pour l'instant partout.
 *
 * Le corps est déjà écrit pour le jour où le jeu INPN arrive : surface pondérée
 * par le niveau de protection, rapportée au disque de PROTECTED_RADIUS_KM, puis
 * passée au même barème centile que les autres composantes.
 */
function protectionComponent(slug: string): Component | null {
  const coverage = protectionCoverage(slug);
  if (coverage == null) return null;
  return { value: coverage, ...protectionScale(coverage) };
}

/**
 * Part du disque de PROTECTED_RADIUS_KM couverte par des zonages, en
 * équivalent-protection forte : chaque surface est multipliée par le poids de
 * son niveau avant d'être rapportée à l'aire du disque. `null` = on ne sait
 * pas encore, jamais 0.
 */
export function protectionCoverage(slug: string): number | null {
  const data = cityProtectedAreas(slug);
  if (!data) return null;
  const weighted = data.areas.reduce(
    (s, a) => s + a.areaHa * PROTECTION_WEIGHT[a.kind],
    0,
  );
  const discHa = Math.PI * PROTECTED_RADIUS_KM ** 2 * 100;
  return +((weighted / discHa) * 100).toFixed(1);
}

/* ── composantes ──────────────────────────────────────────────────────── */

export interface Component {
  /** 0–10, `10 = bon`. */
  score: number;
  /** Valeur mesurée derrière le score, pour que le chiffre soit auditable. */
  value: number;
  /** Rang centile parmi les villes comparables, 0–100. */
  percentile: number;
}

/**
 * Barème par rang centile sur l'ensemble des villes comparables, plutôt que par
 * seuils codés en dur. Deux raisons : le barème se recalibre tout seul à mesure
 * que le crawl avance (aucune constante à réviser à chaque lot), et le score se
 * lit sans dictionnaire — 7,2 signifie « mieux que 72 % des villes mesurées ».
 *
 * Les valeurs sont triées une fois au chargement du module ; la recherche est
 * une dichotomie, pas un balayage.
 */
function percentileScale(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return (v: number): { score: number; percentile: number } => {
    if (!sorted.length) return { score: 0, percentile: 0 };
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sorted[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    // Moyenne des rangs des ex æquo : deux villes à la même valeur reçoivent le
    // même score, quelle que soit leur place dans le tri.
    let upper = lo;
    while (upper < sorted.length && sorted[upper] === v) upper++;
    const rank = (lo + upper) / 2;
    const percentile = (rank / sorted.length) * 100;
    return { score: +(percentile / 10).toFixed(1), percentile: Math.round(percentile) };
  };
}

/** Surface totale d'espaces verts nommés relevés par F59, en m². */
function parkAreaM2(slug: string): number | null {
  if (!hasParksData(slug)) return null;
  const data = cityParks(slug);
  if (!data) return null;
  return data.parks.reduce((s, p) => s + (p.areaM2 || 0), 0);
}

/** Population de référence : recensement Insee quand il couvre la commune,
 *  approximation du seed sinon. Les deux coexistent volontairement dans le
 *  projet ; ici on prend la plus fine disponible. */
function referencePopulation(slug: string): number | null {
  const insee = cityPopulation(slug);
  if (insee?.pop2022) return insee.pop2022;
  const seed = CITIES_SEED.find((c) => c.slug === slug);
  return seed?.population ?? null;
}

/** m² d'espaces verts nommés par habitant. Indicateur classique et lisible —
 *  à lire en sachant qu'OSM est renseigné inégalement d'une commune à l'autre,
 *  ce que la page doit dire. */
export function greenSpacePerCapita(slug: string): number | null {
  const area = parkAreaM2(slug);
  const pop = referencePopulation(slug);
  if (area == null || !pop) return null;
  return +(area / pop).toFixed(1);
}

/* ── barèmes calibrés au chargement ───────────────────────────────────── */

const MEASURABLE_SLUGS = BIODIVERSITY_CRAWLED_SLUGS.filter((s) => isMeasurable(DATA[s]));

const richnessScale = percentileScale(
  MEASURABLE_SLUGS.map((s) => DATA[s].rarefied as number),
);

const greenScale = percentileScale(
  CITIES_SEED.map((c) => greenSpacePerCapita(c.slug)).filter(
    (v): v is number => v != null,
  ),
);

const protectionScale = percentileScale(
  CITIES_SEED.map((c) => protectionCoverage(c.slug)).filter(
    (v): v is number => v != null,
  ),
);

/** Villes suffisamment relevées pour qu'un score de richesse ait un sens. */
export const BIODIVERSITY_MEASURABLE_COUNT = MEASURABLE_SLUGS.length;

/**
 * Nombre de villes mesurables en dessous duquel on ne publie AUCUN score de
 * richesse, même pour les villes bien relevées.
 *
 * Le barème est un rang centile : il ne dit pas « riche dans l'absolu », il dit
 * « mieux que N % des autres ». Avec trois villes crawlées, la première afficherait
 * « 0,0/10 » pour la seule raison qu'elle est la moins bonne des trois — et son
 * score bougerait à chaque lot. Un chiffre qui dépend surtout de l'avancement du
 * crawl n'est pas une mesure de la nature.
 *
 * Tant que ce seuil n'est pas franchi, les pages existent, affichent les effectifs
 * bruts (espèces, observations, observateurs) et disent que la comparaison n'est
 * pas encore possible. Les mesures sont vraies dès la première ville ; c'est le
 * classement qui demande une population.
 */
export const MIN_CALIBRATION_CITIES = 100;

/** Le barème centile est-il assez peuplé pour être publié ? */
export const BIODIVERSITY_CALIBRATED =
  MEASURABLE_SLUGS.length >= MIN_CALIBRATION_CITIES;

/* ── profil par ville ─────────────────────────────────────────────────── */

export interface BiodiversityProfile {
  slug: string;
  raw: CityBiodiversityRaw;
  /** `null` quand aucun score de richesse n'est publiable. `richnessPending`
   *  dit pourquoi — les deux raisons ne se racontent pas pareil à l'écran. */
  richness: Component | null;
  /** `"effort"` : trop peu d'observations ici. `"calibration"` : la mesure est
   *  bonne, mais trop peu de villes sont crawlées pour situer celle-ci par
   *  rapport aux autres. `null` : un score est publié. */
  richnessPending: "effort" | "calibration" | null;
  /** `null` tant que le jeu INPN n'est pas collecté — « on ne sait pas ». */
  protection: Component | null;
  /** `null` quand F59 n'a relevé aucun parc nommé pour la commune. */
  greenSpace: Component | null;
  /** Agrégat pondéré, ou `null` si une composante manque. Voir COMPONENT_WEIGHT. */
  overall: number | null;
  measurable: boolean;
}

/**
 * Pondération de l'agrégat. Les zones protégées pèsent le plus parce qu'elles
 * sont la seule composante insensible au biais d'observation : un périmètre
 * Natura 2000 existe indépendamment de qui vient l'observer.
 */
export const COMPONENT_WEIGHT = {
  protection: 0.45,
  richness: 0.35,
  greenSpace: 0.2,
} as const;

export function biodiversityProfile(slug: string): BiodiversityProfile | null {
  const raw = DATA[slug];
  if (!raw) return null;

  const measurable = isMeasurable(raw);
  const richnessPending: BiodiversityProfile["richnessPending"] = !measurable
    ? "effort"
    : !BIODIVERSITY_CALIBRATED
      ? "calibration"
      : null;
  const richness: Component | null =
    richnessPending === null
      ? { value: raw.rarefied as number, ...richnessScale(raw.rarefied as number) }
      : null;

  const green = greenSpacePerCapita(slug);
  const greenSpace: Component | null =
    green == null ? null : { value: green, ...greenScale(green) };

  const protection = protectionComponent(slug);

  // Pas d'agrégat tant qu'une composante manque. Repondérer sur ce qui reste
  // donnerait un nombre qui ne mesure pas ce que son nom annonce.
  const overall =
    richness && protection && greenSpace
      ? +(
          richness.score * COMPONENT_WEIGHT.richness +
          protection.score * COMPONENT_WEIGHT.protection +
          greenSpace.score * COMPONENT_WEIGHT.greenSpace
        ).toFixed(1)
      : null;

  return {
    slug,
    raw,
    richness,
    richnessPending,
    protection,
    greenSpace,
    overall,
    measurable,
  };
}

/* ── libellés ─────────────────────────────────────────────────────────── */

const GROUP_LABEL_FR: Record<SpeciesGroup, string> = {
  birds: "Oiseaux",
  mammals: "Mammifères",
  insects: "Insectes",
  amphibians: "Amphibiens",
  reptiles: "Reptiles",
  plants: "Flore",
};
const GROUP_LABEL_EN: Record<SpeciesGroup, string> = {
  birds: "Birds",
  mammals: "Mammals",
  insects: "Insects",
  amphibians: "Amphibians",
  reptiles: "Reptiles",
  plants: "Plants",
};

export function groupLabel(group: SpeciesGroup, locale: "fr" | "en" = "fr"): string {
  return (locale === "en" ? GROUP_LABEL_EN : GROUP_LABEL_FR)[group];
}

export const GROUP_ORDER: SpeciesGroup[] = [
  "birds",
  "mammals",
  "insects",
  "amphibians",
  "reptiles",
  "plants",
];

const KIND_LABEL_FR: Record<ProtectionKind, string> = {
  "reserve-naturelle": "Réserve naturelle",
  "parc-national": "Parc national",
  "parc-naturel-regional": "Parc naturel régional",
  "natura-2000": "Natura 2000",
  "znieff-1": "ZNIEFF de type I",
  "znieff-2": "ZNIEFF de type II",
  "arrete-biotope": "Arrêté de protection de biotope",
};
const KIND_LABEL_EN: Record<ProtectionKind, string> = {
  "reserve-naturelle": "Nature reserve",
  "parc-national": "National park",
  "parc-naturel-regional": "Regional nature park",
  "natura-2000": "Natura 2000 site",
  "znieff-1": "ZNIEFF type I (inventory site)",
  "znieff-2": "ZNIEFF type II (inventory area)",
  "arrete-biotope": "Biotope protection order",
};

export function protectionLabel(
  kind: ProtectionKind,
  locale: "fr" | "en" = "fr",
): string {
  return (locale === "en" ? KIND_LABEL_EN : KIND_LABEL_FR)[kind];
}

/** Nom affichable d'une espèce : vernaculaire quand GBIF le fournit dans la
 *  langue voulue, nom scientifique sinon. Jamais de traduction inventée. */
export function speciesName(sp: TopSpecies, locale: "fr" | "en" = "fr"): string {
  const vernacular = locale === "en" ? sp.vernacularEn : sp.vernacularFr;
  return vernacular ?? sp.scientificName ?? `GBIF ${sp.key}`;
}

/** Ce que 10 signifie — à afficher dans la légende de chaque surface. */
export const SCORE_LEGEND_FR =
  "10 = biodiversité la plus riche parmi les villes mesurées";
export const SCORE_LEGEND_EN =
  "10 = richest biodiversity among the cities measured";
