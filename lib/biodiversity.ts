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
//      protection (INPN/MNHN), recouvrements résolus sur une grille par
//      scripts/city-protected-areas.mjs — pas par somme de surfaces, les
//      zonages français s'emboîtent et une somme compterait le même sol
//      plusieurs fois ;
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
import PROTECTED_RAW from "@/data/city-protected-areas.json";
import { cityParks, hasParksData, OSM_CREDIT, OSM_CREDIT_EN } from "@/lib/city-parks";
import { cityPopulation } from "@/lib/city-population";
import { CITIES_SEED } from "@/data/cities-seed";

/* ── attribution ──────────────────────────────────────────────────────── */

// Les deux sous-pages `biodiversite` / `biodiversity` sont encore garées en
// `page.pending.tsx` (F62 attend l'ingest des zones protégées INPN). Tant que
// c'est `false`, aucune surface ne doit lier vers elles : la carte 🦋 pointait
// vers un 404 sur chaque ville déjà collectée, et le lot grossit à chaque run
// du cron local. À basculer dans le commit qui renomme les deux fichiers.
export const BIODIVERSITY_PAGES_LIVE = false;

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
   *  `null` quand la ville compte moins de `rarefiedN` observations (on ne
   *  sous-échantillonne pas plus que ce qu'on a), ou quand une facette tronquée
   *  laisse le chiffre non bornable. */
  rarefied: number | null;
  /** Faux quand la facette espèces a été tronquée par le plafond de pagination :
   *  `rarefied` est alors une **borne inférieure rigoureuse** et `rarefiedUpper`
   *  ferme l'intervalle. La raréfaction a besoin du vecteur d'abondance complet ;
   *  quand il manque sa queue, le chiffre exact n'est pas connaissable, seulement
   *  encadrable. Voir `rarefy()` dans scripts/city-biodiversity.mjs. */
  rarefiedExact: boolean;
  rarefiedUpper: number | null;
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

/** Version de requête du pipeline en dessous de laquelle une ligne n'est pas
 *  publiable. La v1 calculait la raréfaction sur un vecteur d'abondance tronqué
 *  sans le dire, ce qui surestimait la richesse des villes les mieux relevées ;
 *  une ligne v1 n'est pas comparable à une ligne v2 et ne doit pas entrer dans
 *  le barème. Corrigé le 2026-08-02. */
export const MIN_QUERY_VERSION = 2;

/** Largeur d'intervalle tolérée quand la raréfaction est encadrée plutôt
 *  qu'exacte, en part de la borne inférieure.
 *
 *  Le score est un rang centile : une ville dont l'intervalle dépasse cette
 *  largeur pourrait changer de rang selon l'endroit de l'intervalle où tombe la
 *  vraie valeur, et le classement dirait alors surtout où le plafond de
 *  pagination a coupé. Le remède est côté pipeline (relancer la ville avec
 *  `--facet-pages` plus haut), pas côté affichage : en attendant, la ville est
 *  déclarée non mesurable. */
export const MAX_RAREFIED_UNCERTAINTY = 0.05;

/** Largeur relative de l'intervalle de raréfaction ; `0` quand il est exact,
 *  `null` quand il n'y a pas de chiffre. */
export function rarefiedUncertainty(row: CityBiodiversityRaw): number | null {
  if (row.rarefied == null) return null;
  if (row.rarefiedExact) return 0;
  if (row.rarefiedUpper == null || row.rarefied <= 0) return null;
  return (row.rarefiedUpper - row.rarefied) / row.rarefied;
}

export function isMeasurable(row: CityBiodiversityRaw): boolean {
  if (row.queryVersion < MIN_QUERY_VERSION) return false;
  if (row.rarefied == null) return false;
  if (row.occurrences < MIN_OCCURRENCES) return false;
  if (row.observers < MIN_OBSERVERS) return false;
  const uncertainty = rarefiedUncertainty(row);
  return uncertainty != null && uncertainty <= MAX_RAREFIED_UNCERTAINTY;
}

/* ── zones protégées (INPN) ───────────────────────────────────────────── */

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

/** Nombre de couches nationales attendues par l'ingest. Une ville ingérée avec
 *  moins que ça a une couverture minorée, et sa page le dit. */
export const PROTECTION_KIND_COUNT = Object.keys(PROTECTION_WEIGHT).length;

export interface ProtectedArea {
  /** Identifiant national INPN (code Natura 2000, n° ZNIEFF, code RN…).
   *  `null` quand la couche source ne porte pas d'identifiant exploitable —
   *  la zone s'affiche alors sans lien plutôt qu'avec un lien mort. */
  id: string | null;
  name: string | null;
  kind: ProtectionKind;
  /** Surface du périmètre intersectant le disque d'analyse, en hectares,
   *  mesurée sur la grille de `gridStepM` (précision ≈ une cellule de bord). */
  areaHa: number;
  /** Distance du centre-ville au périmètre, en km. `0` = le centre est dedans. */
  distanceKm: number;
}

export interface CityProtectedAreas {
  crawledAt: string;
  source: "inpn";
  ingestVersion: number;
  radiusKm: number;
  gridStepM: number;
  /** Couches réellement présentes lors de la passe. Une ville ingérée sans le
   *  fichier ZNIEFF n'est pas comparable à une ville ingérée avec : le
   *  classement ne mélange que des villes au même jeu de couches. */
  kinds: ProtectionKind[];
  /** Part du disque sous protection, pondérée par le niveau, **recouvrements
   *  résolus cellule par cellule** — voir protectionCoverage. */
  weightedCoverage: number;
  /** Part du disque sous un zonage quelconque, tous niveaux confondus. */
  rawCoverage: number;
  /** Nombre total de périmètres relevés ; `areas` est tronquée à l'affichage. */
  areasTotal: number;
  areasTruncated: boolean;
  areas: ProtectedArea[];
}

const PROTECTED = PROTECTED_RAW as unknown as Record<string, CityProtectedAreas>;

/** Rayon d'analyse des zones protégées. Plus large que les 10 km du crawl
 *  GBIF : un massif protégé à 15 km fait partie du cadre de vie, on y va le
 *  dimanche. */
export const PROTECTED_RADIUS_KM = 15;

/**
 * Zones protégées autour de la ville, ou `null` si la passe INPN ne l'a pas
 * encore couverte.
 *
 * `null` veut dire « on ne sait pas », jamais « il n'y en a pas ». Une ville
 * réellement dépourvue de périmètre à moins de PROTECTED_RADIUS_KM est
 * couverte, avec `areasTotal: 0` et une couverture de 0 : c'est une mesure,
 * et la page l'écrit comme telle. Les deux situations ne se racontent pas
 * pareil et ne doivent pas se confondre à l'écran.
 */
export function cityProtectedAreas(slug: string): CityProtectedAreas | null {
  return PROTECTED[slug] ?? null;
}

export function hasProtectedData(slug: string): boolean {
  return slug in PROTECTED;
}

export const PROTECTED_CRAWLED_SLUGS = Object.keys(PROTECTED);
export const HAS_PROTECTED_DATA = PROTECTED_CRAWLED_SLUGS.length > 0;

/**
 * Lien vers la fiche INPN d'un périmètre.
 *
 * ⚠️ @unverified — gabarits d'URL écrits sans accès à inpn.mnhn.fr (403 CONNECT
 * depuis cet environnement). À vérifier pendant la passe locale, sur un
 * identifiant de chaque couche, AVANT que la première surface ne parte en
 * production : un lien mort vaut moins que pas de lien. Les surfaces affichent
 * le nom sans lien quand cette fonction renvoie `null`, donc rien ne casse tant
 * que la donnée n'est pas là.
 */
export function inpnUrl(area: ProtectedArea): string | null {
  if (!area.id) return null;
  switch (area.kind) {
    case "natura-2000":
      return `${INPN_URL}/site/natura2000/${encodeURIComponent(area.id)}`;
    case "znieff-1":
    case "znieff-2":
      return `${INPN_URL}/zone/znieff/${encodeURIComponent(area.id)}`;
    default:
      return `${INPN_URL}/espace/protege/${encodeURIComponent(area.id)}`;
  }
}

/**
 * Composante « zones protégées », 0–10, ou `null` si la ville n'est pas encore
 * ingérée — ou si trop peu de villes le sont pour que le rang centile ait un
 * sens (même garde-fou que la richesse, voir MIN_CALIBRATION_CITIES).
 */
function protectionComponent(slug: string): Component | null {
  if (!PROTECTION_CALIBRATED) return null;
  const coverage = protectionCoverage(slug);
  if (coverage == null) return null;
  return { value: coverage, ...protectionScale(coverage) };
}

/**
 * Part du disque de PROTECTED_RADIUS_KM couverte par des zonages, en
 * équivalent-protection forte. `null` = on ne sait pas encore, jamais 0.
 *
 * Le chiffre est **calculé par le pipeline sur une grille**, pas ici par somme
 * des surfaces : les zonages français se recouvrent par construction — une
 * ZNIEFF I est presque toujours incluse dans une ZNIEFF II, et les sites
 * Natura 2000 chevauchent les deux. Additionner leurs surfaces compterait le
 * même sol plusieurs fois et pourrait annoncer « 180 % du disque protégé ».
 * Chaque cellule de la grille retient donc le niveau de protection le plus
 * fort qui la couvre, et les recouvrements ne comptent qu'une fois.
 */
export function protectionCoverage(slug: string): number | null {
  return cityProtectedAreas(slug)?.weightedCoverage ?? null;
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

/**
 * Plafond appliqué par F59 : `scripts/city-parks.mjs` ne retient que les
 * `PARKS_PER_CITY = 40` plus grands parcs nommés d'une commune, et n'a pas
 * gardé le compte d'avant plafonnement. Une ville qui atteint ce plafond a
 * donc une surface **tronquée** : ce qu'on additionne est un plancher, pas un
 * total. 41 des 540 villes sont dans ce cas.
 *
 * On publie quand même leur score, contrairement à la raréfaction tronquée qui
 * met la ville en attente : ici l'erreur est bornée par construction et va dans
 * le sens défavorable. Le tri étant par superficie décroissante, chaque parc
 * omis est plus petit que le 40e conservé, lequel pèse en médiane 0,19 % du
 * total de sa ville (0,73 % au pire). La troncature sous-estime les villes les
 * mieux cartographiées, elle ne les flatte pas — mais les surfaces doivent
 * afficher un « ≥ », pas un total.
 */
export const PARKS_PER_CITY_CAP = 40;

/** La commune a-t-elle atteint le plafond de F59 ? Si oui, sa surface d'espaces
 *  verts est un minorant. */
export function greenSpaceTruncated(slug: string): boolean {
  const data = cityParks(slug);
  return (data?.parks.length ?? 0) >= PARKS_PER_CITY_CAP;
}

/** Surface totale d'espaces verts nommés relevés par F59, en m².
 *
 *  `null` a deux causes distinctes, et une seule est un « zéro » : la commune
 *  n'a pas été crawlée, **ou** elle l'a été sans qu'aucun parc nommé ne
 *  ressorte. Voir `greenSpacePerCapita` pour pourquoi le second cas n'est pas
 *  une surface nulle. */
function parkAreaM2(slug: string): number | null {
  if (!hasParksData(slug)) return null;
  const data = cityParks(slug);
  if (!data || data.parks.length === 0) return null;
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

/**
 * m² d'espaces verts nommés par habitant. Indicateur classique et lisible — à
 * lire en sachant qu'OSM est renseigné inégalement d'une commune à l'autre.
 *
 * **Zéro parc nommé ne vaut pas zéro espace vert, et ne reçoit donc pas de
 * score.** C'est le même garde-fou que le biais d'effort d'observation qui
 * gouverne la composante richesse, appliqué à sa source : OSM est une carte
 * contributive, pas un registre. Une commune sans parc nommé dans OSM n'est pas
 * une commune sans verdure, c'est une commune que personne n'a cartographiée —
 * les deux sont indiscernables depuis la donnée, donc on dit qu'on ne sait pas.
 * Les 11 communes concernées recevaient 0,1/10 avant ce correctif, dont
 * Sallanches au fond d'une vallée alpine, Noirmoutier, Porto-Vecchio et Calvi :
 * un score de nature proche de zéro pour ces communes-là aurait été indéfendable.
 *
 * La distinction avec les zones protégées est volontaire et tient à la nature de
 * la source : l'inventaire INPN est un registre administratif exhaustif, donc
 * « aucun périmètre à moins de 15 km » y est un fait mesuré et vaut bien `0`
 * (cf. `cityProtectedAreas`). OSM ne l'est pas.
 */
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

/** Le `filter` écarte les communes sans parc nommé dans OSM. C'est délibéré :
 *  les faire entrer comme des zéros tasserait le bas du barème avec des villes
 *  dont on ignore la surface réelle, et décalerait le rang de toutes les autres. */
const greenScale = percentileScale(
  CITIES_SEED.map((c) => greenSpacePerCapita(c.slug)).filter(
    (v): v is number => v != null,
  ),
);

/** Communes relevées par F59 sans aucun parc nommé dans OSM : mesure impossible,
 *  pas score nul. Chiffre affiché par les surfaces qui expliquent la lacune. */
export const GREEN_SPACE_UNMAPPED_COUNT = CITIES_SEED.filter(
  (c) => hasParksData(c.slug) && greenSpacePerCapita(c.slug) == null,
).length;

/** Communes dont la surface est plafonnée à 40 parcs, donc minorée. */
export const GREEN_SPACE_TRUNCATED_COUNT = CITIES_SEED.filter((c) =>
  greenSpaceTruncated(c.slug),
).length;

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

/** Nombre de villes passées par l'ingest INPN. */
export const PROTECTED_CITY_COUNT = PROTECTED_CRAWLED_SLUGS.length;

/** Même raisonnement que BIODIVERSITY_CALIBRATED, appliqué aux zones
 *  protégées : un rang centile sur cinq villes ne situe rien. Les périmètres
 *  et la couverture en % sont vrais dès la première ville et s'affichent ;
 *  c'est le /10 qui attend d'avoir une population à laquelle se comparer. */
export const PROTECTION_CALIBRATED =
  PROTECTED_CRAWLED_SLUGS.length >= MIN_CALIBRATION_CITIES;

/* ── profil par ville ─────────────────────────────────────────────────── */

export interface BiodiversityProfile {
  slug: string;
  raw: CityBiodiversityRaw;
  /** `null` quand aucun score de richesse n'est publiable. `richnessPending`
   *  dit pourquoi — les deux raisons ne se racontent pas pareil à l'écran. */
  richness: Component | null;
  /** `"effort"` : trop peu d'observations ici. `"precision"` : les observations
   *  sont là mais la facette espèces a été tronquée, la raréfaction n'est
   *  qu'encadrée et l'intervalle est trop large pour un rang — c'est un défaut
   *  de collecte, réparable en relançant la ville. `"calibration"` : la mesure
   *  est bonne, mais trop peu de villes sont crawlées pour situer celle-ci par
   *  rapport aux autres. `null` : un score est publié. */
  richnessPending: "effort" | "precision" | "calibration" | null;
  /** `null` tant que la ville n'est pas ingérée, ou tant que trop peu de
   *  villes le sont pour situer celle-ci. `protectionPending` dit laquelle
   *  des deux. */
  protection: Component | null;
  /** `"data"` : la passe INPN n'a pas encore couvert cette ville — on ne sait
   *  pas, ce n'est pas zéro. `"calibration"` : les périmètres sont relevés,
   *  le rang sur 10 attend d'autres villes. `null` : un score est publié. */
  protectionPending: "data" | "calibration" | null;
  /** Périmètres relevés autour de la ville, ou `null` si non ingérée. Une
   *  ville ingérée sans aucun périmètre a bien une valeur, avec
   *  `areasTotal: 0` — c'est un résultat, pas une absence de donnée. */
  protectedAreas: CityProtectedAreas | null;
  /** `null` quand F59 n'a relevé aucun parc nommé pour la commune.
   *  `greenSpacePending` dit pourquoi. */
  greenSpace: Component | null;
  /** `"mapping"` : la commune a bien été relevée, mais OSM n'y référence aucun
   *  parc nommé — carte contributive incomplète, pas absence de verdure, donc
   *  pas de score (voir `greenSpacePerCapita`). `"data"` : F59 n'a pas encore
   *  crawlé la commune (aucune aujourd'hui, 540/540 — mais une ville ajoutée au
   *  seed avant son crawl passerait par là, et les deux ne se racontent pas
   *  pareil). `null` : un score est publié. */
  greenSpacePending: "mapping" | "data" | null;
  /** La surface additionnée est-elle plafonnée par F59 (40 parcs max) ? Si oui,
   *  `greenSpace.value` est un minorant et la surface doit l'afficher comme tel. */
  greenSpaceTruncated: boolean;
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
  // Un intervalle trop large ne se raconte pas comme un manque d'observations :
  // les naturalistes ont fait leur travail, c'est notre collecte qui a coupé.
  const imprecise =
    raw.rarefied != null &&
    raw.occurrences >= MIN_OCCURRENCES &&
    raw.observers >= MIN_OBSERVERS &&
    !isMeasurable(raw);
  const richnessPending: BiodiversityProfile["richnessPending"] = !measurable
    ? imprecise
      ? "precision"
      : "effort"
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
  const greenSpacePending: BiodiversityProfile["greenSpacePending"] = greenSpace
    ? null
    : hasParksData(slug)
      ? "mapping"
      : "data";

  const protectedAreas = cityProtectedAreas(slug);
  const protection = protectionComponent(slug);
  const protectionPending: BiodiversityProfile["protectionPending"] = !protectedAreas
    ? "data"
    : !PROTECTION_CALIBRATED
      ? "calibration"
      : null;

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
    protectionPending,
    protectedAreas,
    greenSpace,
    greenSpacePending,
    greenSpaceTruncated: greenSpaceTruncated(slug),
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
