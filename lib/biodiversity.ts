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
// ⚠️ **Deux des trois barèmes sont retirés, et une seule note est publiée
// aujourd'hui : les zones protégées.** La richesse le 2026-08-10 (elle classait
// les programmes de saisie, `RICHNESS_RANKING_PUBLISHED`), les espaces verts le
// 2026-08-31 (un parc à cheval est compté en entier dans chaque commune qu'il
// touche, `GREEN_SPACE_RANKING_PUBLISHED`). Dans les deux cas les mesures brutes
// restent affichées — elles sont exactes — et le remède est un recrawl, pas un
// correctif d'affichage. `overall` reste donc `null` sur les 540 villes.
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
import {
  cityParks,
  hasParksData,
  PARKS_CRAWLED_SLUGS,
  OSM_CREDIT,
  OSM_CREDIT_EN,
} from "@/lib/city-parks";
import { cityPopulation } from "@/lib/city-population";
import { CITIES_SEED } from "@/data/cities-seed";

/* ── attribution ──────────────────────────────────────────────────────── */

// Les deux sous-pages `biodiversite` / `biodiversity` sont en ligne depuis le
// 2026-08-06 : le cron local a dépassé la moitié du seed (302/540 villes, 278
// mesurables) et le barème centile s'est montré stable en le vérifiant sur
// l'historique — entre l'instantané à 182 villes et celui à 302, les rangs ont
// bougé de 0,2 point en médiane, 0,5 au pire, aucune ville au-delà d'un point.
// La note ne suit donc pas l'avancement du crawl, ce qui était la seule raison
// de la retenir.
//
// Ce drapeau reste le point unique qui relie les surfaces : tant qu'il est
// `false`, rien ne doit lier vers les deux routes (la carte 🦋 a déjà pointé
// vers 65 404 en le faisant). Le remettre à `false` suffit à tout dépublier.
export const BIODIVERSITY_PAGES_LIVE = true;

export const GBIF_CREDIT = "GBIF.org — Global Biodiversity Information Facility";
export const GBIF_URL = "https://www.gbif.org";
export const INPN_CREDIT = "INPN — MNHN, Licence Ouverte Etalab";
export const INPN_URL = "https://inpn.mnhn.fr";
/**
 * Les périmètres affichés ne viennent plus de l'INPN mais de la **BD TOPO de
 * l'IGN**, qui redistribue les mêmes tracés du MNHN (`sources: "MNHN 2024"`).
 * Ce n'est pas un choix éditorial : depuis la cyberattaque du 2025-07-26, les
 * fichiers `inpn.mnhn.fr/docs/Shape/*.zip` que data.gouv.fr référence répondent
 * 200 en `text/html` — la coquille du site reconstruit (vérifié 2026-08-19).
 * L'attribution suit la source réellement utilisée.
 */
export const PROTECTED_AREAS_CREDIT =
  "IGN BD TOPO® — périmètres MNHN, Licence Ouverte Etalab";
export const PROTECTED_AREAS_CREDIT_EN =
  "IGN BD TOPO® — perimeters from MNHN, Etalab Open Licence";
export const PROTECTED_AREAS_URL = "https://geoservices.ign.fr/bdtopo";
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

/* ── le rang de richesse est retiré (2026-08-10) ──────────────────────── */

/**
 * Part des observations que se partagent les 5 espèces les plus enregistrées.
 * C'est le diagnostic qui a fait retirer le rang de richesse, et c'est une
 * mesure vraie et lisible en soi : à Mayenne, 87 % des observations portent sur
 * cinq espèces (dont 48 000 contacts d'une seule pipistrelle, un détecteur
 * ultrasons automatique), à Saint-Omer 57 % sur cinq laridés comptés en colonie.
 *
 * `null` quand la facette espèces est tronquée — les effectifs du haut de liste
 * sont alors exacts mais le total ne l'est pas.
 */
export function recordConcentration(row: CityBiodiversityRaw): number | null {
  if (row.occurrences <= 0 || row.topSpecies.length < 5) return null;
  const top5 = row.topSpecies.slice(0, 5).reduce((a, s) => a + s.count, 0);
  return Math.min(1, top5 / row.occurrences);
}

/**
 * Le rang centile de richesse est-il publié ?
 *
 * **Non, et ce n'est pas une question d'avancement du crawl.** Le crawl est
 * terminé (540/540 depuis le 2026-08-09) ; c'est la mesure elle-même qui ne
 * mesure pas ce que son nom annonce. Vérifié le 2026-08-10 sur le corpus
 * complet, une fois les 540 villes disponibles — c'est-à-dire au premier moment
 * où le contrôle était possible :
 *
 *   - corrélation de rang entre le score et la **concentration** des relevés
 *     (part des observations tenue par 5 espèces) : **−0,77** ;
 *   - corrélation de rang entre le score et le **nombre d'espèces réellement
 *     recensées** : **+0,10** ;
 *   - part de la variance du score expliquée par le **département** : **56 %**.
 *
 * Autrement dit le chiffre classait les villes selon le type de programme de
 * saisie qui opère autour d'elles — détecteurs à ultrasons pour chauves-souris,
 * comptages de colonies de laridés, atlas botaniques régionaux — et non selon
 * ce qui y vit. La raréfaction de Hurlbert suppose que les enregistrements sont
 * des tirages comparables dans une communauté ; sur des données agrégées par
 * GBIF, un contact automatique et une observation de terrain pèsent pareil, et
 * cette hypothèse tombe.
 *
 * Les conséquences se lisaient à l'écran : Douai (2 588 espèces recensées, l'un
 * des relevés les plus fournis du corpus) affichait 0,0/10 ; Saint-Omer et son
 * marais audomarois, réserve de biosphère, 0,1/10 ; la Guadeloupe 0,1/10 de
 * moyenne et la Guyane 1,8/10, quand le Centre-Val de Loire sortait à 7,8/10.
 * Le site classait la Beauce au-dessus de l'Amazonie, tout en décrivant la
 * Guyane comme d'une « biodiversité exceptionnelle » sur sa page région.
 *
 * Deux réparations ont été essayées avant le retrait, et écartées : un rang
 * fondé sur le nombre d'espèces normalisé par l'effort (loi puissance
 * espèces/observateurs, R² = 0,75) neutralise bien la concentration mais place
 * Arles (Camargue) 509ᵉ sur 513 et Saint-Laurent-du-Maroni dernière — il mesure
 * alors la productivité des programmes de saisie ; et exclure les villes
 * concentrées est impossible, elles sont **408 sur 513** au-dessus de 10 %.
 *
 * Le remède est côté pipeline, pas côté affichage : il demande de pondérer par
 * jeu de données (un jeu = une unité d'échantillonnage) ou de restreindre la
 * requête aux jeux d'observation opportuniste, donc de **recroiser GBIF** avec
 * une agrégation par `datasetKey`. Tant que ce n'est pas fait, les effectifs
 * bruts — espèces, observations, observateurs, groupes, espèces menacées — sont
 * publiés tels quels : ils sont vrais. C'est le **classement** qui est retiré,
 * pas la donnée.
 *
 * Remettre ce drapeau à `true` sans avoir changé la collecte republierait le
 * même chiffre faux : ne le fais pas sans relire les corrélations ci-dessus.
 */
export const RICHNESS_RANKING_PUBLISHED = false;

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

/** Territoire dans lequel la ville se trouve, tel que l'ingest le détermine
 *  depuis les coordonnées du seed. Les six sont disjoints. */
export type ProtectionTerritory =
  | "metropole"
  | "guadeloupe"
  | "martinique"
  | "guyane"
  | "reunion"
  | "mayotte";

interface ProtectedAreasCommon {
  crawledAt: string;
  source: "inpn" | "bdtopo";
  ingestVersion: number;
  radiusKm: number;
  gridStepM: number;
  /** `null` si la ville ne tombe dans aucun territoire connu de l'ingest —
   *  elle est alors traitée comme hors périmètre, jamais comme un zéro. */
  territory: ProtectionTerritory | null;
}

/** Ville réellement mesurée : au moins une couche de la passe couvre son
 *  territoire, donc `0 périmètre` veut bien dire « il n'y en a pas ». */
export interface MeasuredProtectedAreas extends ProtectedAreasCommon {
  outOfScope?: false;
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

/**
 * Ville dont **aucune couche de la passe ne couvre le territoire**.
 *
 * Ce n'est pas une ville sans nature protégée : c'est une ville sur laquelle
 * l'ingest n'a rien à dire. Natura 2000 est une directive européenne qui ne
 * s'applique pas aux régions ultrapériphériques, et le MNHN publie les ZNIEFF
 * et espaces protégés d'outre-mer dans des fichiers séparés des fichiers
 * continentaux : une passe qui ne porte que le continental couvre 522 des 540
 * villes du seed et aucune des 18 ultramarines. Leur écrire « aucun périmètre
 * protégé à moins de 15 km » — Cayenne à 15 km de l'Amazonie — répéterait
 * exactement l'erreur du rang de richesse retiré le 2026-08-10 : un trou de
 * *notre* collecte imprimé comme un fait sur le lieu.
 *
 * Le type n'expose donc **aucun chiffre de couverture**. Il n'y a rien à
 * arrondir, rien à afficher, rien à classer.
 */
export interface OutOfScopeProtectedAreas extends ProtectedAreasCommon {
  outOfScope: true;
  kinds: [];
  areasTotal: 0;
  areasTruncated: false;
  areas: [];
}

export type CityProtectedAreas = MeasuredProtectedAreas | OutOfScopeProtectedAreas;

/** Discrimine les deux cas. Une ligne d'ingest v1 (antérieure au champ) est lue
 *  comme mesurée, ce qu'elle était : la passe d'alors était métropolitaine. */
export function isMeasuredProtection(
  record: CityProtectedAreas,
): record is MeasuredProtectedAreas {
  return record.outOfScope !== true;
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
 *
 * Un troisième cas s'ajoute depuis l'ingest v2 : la ville est ingérée mais
 * aucune couche de la passe ne couvre son territoire (`outOfScope`). Le record
 * existe — on sait qu'on ne sait pas, et pourquoi — mais il ne porte aucun
 * chiffre de couverture. Voir OutOfScopeProtectedAreas.
 */
export function cityProtectedAreas(slug: string): CityProtectedAreas | null {
  return PROTECTED[slug] ?? null;
}

export function hasProtectedData(slug: string): boolean {
  return slug in PROTECTED;
}

export const PROTECTED_CRAWLED_SLUGS = Object.keys(PROTECTED);
export const HAS_PROTECTED_DATA = PROTECTED_CRAWLED_SLUGS.length > 0;

/** Villes portant réellement un chiffre de couverture. Les villes hors
 *  périmètre sont ingérées mais n'ont rien à classer : les compter dans le
 *  barème centile reviendrait à les ranger toutes ex æquo au plancher. */
export const PROTECTED_MEASURED_SLUGS = PROTECTED_CRAWLED_SLUGS.filter((s) => {
  const record = PROTECTED[s];
  return !!record && isMeasuredProtection(record);
});

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
  // Vérifié le 2026-08-19, depuis une machine avec egress : **toutes** les URL
  // de inpn.mnhn.fr répondent 200 avec du `text/html` — la coquille Angular du
  // site reconstruit après la cyberattaque, y compris sur une fiche Natura 2000
  // bien formée. On ne peut donc pas affirmer qu'un lien mène quelque part, et
  // la règle du projet est explicite : un lien mort vaut moins que pas de lien.
  // Les surfaces affichent déjà le nom sans lien quand cette fonction renvoie
  // `null`, donc il n'y a rien d'autre à changer.
  //
  // De quoi le rebrancher le jour où l'INPN sert à nouveau des fiches : la
  // BD TOPO porte le code MNHN du site dans `identifiants_sources`
  // (« MNHN:FR8201770 » sur les 1 761 sites Natura 2000), il suffira de le
  // remonter dans `ProtectedArea.id` côté ingest.
  void area;
  return null;
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
  const record = cityProtectedAreas(slug);
  if (!record || !isMeasuredProtection(record)) return null;
  return record.weightedCoverage;
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

/* ── espaces verts : polygones à cheval sur plusieurs communes ────────── */

/**
 * `osmId` → communes du seed auxquelles F59 rattache CE polygone.
 *
 * Une entrée à plusieurs communes n'est pas une curiosité : c'est la preuve,
 * dans la donnée, que la surface d'un même parc est comptée **en entier**
 * plusieurs fois. Voir `GREEN_SPACE_RANKING_PUBLISHED`.
 */
const PARK_CITIES: Map<string, string[]> = (() => {
  const m = new Map<string, string[]>();
  for (const slug of PARKS_CRAWLED_SLUGS)
    for (const p of cityParks(slug)?.parks ?? []) {
      const seen = m.get(p.osmId);
      if (seen) seen.push(slug);
      else m.set(p.osmId, [slug]);
    }
  return m;
})();

const CITY_NAME_BY_SLUG: Map<string, string> = new Map(
  CITIES_SEED.map((c) => [c.slug, c.name]),
);

/** Un parc dont la surface entière est portée au crédit de plusieurs communes. */
export interface CrossBorderPark {
  osmId: string;
  name: string;
  areaM2: number;
  /** Part de la surface d'espaces verts de CETTE commune que ce seul polygone
   *  représente, 0–1. */
  share: number;
  /** Les autres communes du seed auxquelles le même polygone est compté, en
   *  entier lui aussi. Noms d'affichage, pas slugs. */
  otherCities: string[];
}

/**
 * Parcs de la commune qu'OSM rattache aussi à une autre commune du seed, du
 * plus grand au plus petit. Liste vide quand il n'y en a pas — ce qui ne prouve
 * pas l'absence du défaut, seulement que le voisin concerné n'est pas dans nos
 * 540 villes (cf. `GREEN_SPACE_RANKING_PUBLISHED`).
 */
export function greenSpaceCrossBorder(slug: string): CrossBorderPark[] {
  const parks = cityParks(slug)?.parks ?? [];
  const total = parks.reduce((s, p) => s + (p.areaM2 || 0), 0);
  return parks
    .map((p) => ({ park: p, cities: PARK_CITIES.get(p.osmId) ?? [slug] }))
    .filter(({ cities }) => cities.length > 1)
    .map(({ park, cities }) => ({
      osmId: park.osmId,
      name: park.name,
      areaM2: park.areaM2,
      share: total > 0 ? park.areaM2 / total : 0,
      otherCities: cities
        .filter((s) => s !== slug)
        .map((s) => CITY_NAME_BY_SLUG.get(s) ?? s),
    }))
    .sort((a, b) => b.areaM2 - a.areaM2);
}

/** Part de la surface d'espaces verts de la commune qui vient de polygones
 *  comptés aussi ailleurs, 0–1. `0` quand rien n'est détecté. */
export function greenSpaceCrossBorderShare(slug: string): number {
  return greenSpaceCrossBorder(slug).reduce((s, p) => s + p.share, 0);
}

/** Communes portant au moins un polygone compté aussi ailleurs. */
export const GREEN_SPACE_CROSS_BORDER_COUNT = CITIES_SEED.filter(
  (c) => greenSpaceCrossBorder(c.slug).length > 0,
).length;

/** Polygones distincts comptés dans plusieurs communes du seed. */
export const GREEN_SPACE_CROSS_BORDER_PARK_COUNT = [...PARK_CITIES.values()].filter(
  (cities) => cities.length > 1,
).length;

/**
 * Le rang d'espaces verts est-il publiable ? **Non — retiré le 2026-08-31**,
 * pour la même raison que `RICHNESS_RANKING_PUBLISHED` et par la même méthode :
 * on a contrôlé la mesure sur le corpus complet, et elle ne mesure pas ce que
 * son nom annonce.
 *
 * ── Le mécanisme, lisible dans le code de collecte ─────────────────────
 *
 * `scripts/city-parks.mjs` interroge Overpass en `way["leisure"="park"](area.a)`
 * sur l'aire administrative de la commune. Un filtre d'aire Overpass retourne
 * tout élément qui **intersecte** l'aire, et `out geom` en rend la géométrie
 * **entière** : la surface calculée au shoelace est celle du polygone complet,
 * jamais de sa part communale. Un parc à cheval est donc porté en entier au
 * crédit de chaque commune qu'il touche — puis divisé par la population de
 * chacune.
 *
 * Ce n'est pas une hypothèse : 45 polygones sont comptés dans 2 à 4 communes du
 * seed, 11 d'entre eux au-dessus de 100 ha, et la surface enregistrée est
 * identique d'une commune à l'autre (bois de Vincennes, 979,7 ha, compté tel
 * quel à Paris, Saint-Mandé, Charenton-le-Pont et Vincennes ; bois de Boulogne,
 * 805,7 ha, à Paris, Neuilly et Boulogne-Billancourt ; parc Georges-Valbon,
 * 337,9 ha, à Stains, Garges-lès-Gonesse, La Courneuve et Saint-Denis).
 *
 * ── Ce que ça faisait au barème (529 villes notées) ────────────────────
 *
 * | contrôle | valeur |
 * |---|---|
 * | corrélation de rang score ↔ surface du **seul plus grand polygone** | **+0,86** |
 * | villes du top 10 % dont ce polygone est compté aussi dans une autre commune | **26 / 53** |
 * | villes du top 10 % situées en Île-de-France | **27 / 53** |
 * | villes dont un seul polygone fait plus de la moitié de la « surface verte » | **284 / 529** (médiane 52 %) |
 *
 * 47 des 56 villes notées ≥ 9,0 doivent leur place à un polygone de plus de
 * 50 ha, alors que 76 villes seulement en portent un. Saint-Mandé (1 km²,
 * 21 223 hab.) sortait **10,0/10** avec 462 m²/hab, c'est-à-dire les 980 ha du
 * bois de Vincennes — qui est à Paris — divisés par sa propre population ;
 * Charenton-le-Pont et Vincennes de même, Stains 9,8/10 avec un parc de
 * La Courneuve. Le rang classait la proximité d'un grand polygone, pas la
 * surface verte par habitant qu'il annonçait.
 *
 * ── Pourquoi un retrait, et pas un correctif ciblé ─────────────────────
 *
 * Le défaut n'est **détectable** que lorsque la commune voisine est elle-même
 * dans nos 540 : le domaine de Rambouillet, l'Arche de la Nature du Mans ou la
 * Combe à la Serpent de Dijon débordent tout autant sur des communes absentes du
 * seed, sans qu'aucune ligne du JSON ne le montre. Retirer les 78 cas visibles
 * aurait nettoyé la moitié dense du corpus et laissé l'autre intacte, en donnant
 * le barème pour réparé. Et rien dans la donnée ne dit à quelle commune revient
 * quelle part : réaffecter au plus proche centroïde attribue le bois de
 * Vincennes à Charenton, pas à Paris.
 *
 * Le remède est donc côté pipeline, comme pour la richesse : découper les
 * anneaux sur la limite communale (ou n'accepter que les polygones dont le
 * centroïde y tombe) dans `scripts/city-parks.mjs`, donc un `queryVersion`
 * neuf et un recrawl, pas un correctif d'affichage.
 *
 * ⚠️ **F59 n'est pas touchée.** Pour un répertoire de destinations, lister le
 * bois de Vincennes à Saint-Mandé est juste : on y va à pied. C'est seulement
 * comme **surface verte par habitant** que le même polygone devient faux — la
 * symétrie exacte du zéro OSM, vrai pour `/parcs`, faux ici.
 *
 * Les chiffres bruts restent publiés : nombre de parcs, surface relevée,
 * m²/hab. Ils sont exacts pour ce qu'ils sont — la surface des parcs
 * qu'OpenStreetMap rattache à la commune, débordements compris. C'est le
 * **classement** qui est retiré, pas la donnée.
 */
export const GREEN_SPACE_RANKING_PUBLISHED = false;

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

/** Nombre de villes passées par l'ingest INPN, hors périmètre comprises. */
export const PROTECTED_CITY_COUNT = PROTECTED_CRAWLED_SLUGS.length;

/** Nombre de villes portant un chiffre de couverture — c'est celui-ci qui
 *  s'affiche quand une page dit à quoi la ville est comparée. */
export const PROTECTED_MEASURED_COUNT = PROTECTED_MEASURED_SLUGS.length;

/** Même raisonnement que BIODIVERSITY_CALIBRATED, appliqué aux zones
 *  protégées : un rang centile sur cinq villes ne situe rien. Les périmètres
 *  et la couverture en % sont vrais dès la première ville et s'affichent ;
 *  c'est le /10 qui attend d'avoir une population à laquelle se comparer. */
export const PROTECTION_CALIBRATED =
  PROTECTED_MEASURED_SLUGS.length >= MIN_CALIBRATION_CITIES;

/* ── profil par ville ─────────────────────────────────────────────────── */

export interface BiodiversityProfile {
  slug: string;
  raw: CityBiodiversityRaw;
  /** `null` quand aucun score de richesse n'est publiable. `richnessPending`
   *  dit pourquoi — les deux raisons ne se racontent pas pareil à l'écran. */
  richness: Component | null;
  /** `"incomparable"` : la mesure n'est pas comparable d'une ville à l'autre —
   *  raison actuelle de **toutes** les villes, voir RICHNESS_RANKING_PUBLISHED.
   *  `"effort"` : trop peu d'observations ici. `"precision"` : les observations
   *  sont là mais la facette espèces a été tronquée, la raréfaction n'est
   *  qu'encadrée et l'intervalle est trop large pour un rang — c'est un défaut
   *  de collecte, réparable en relançant la ville. `"calibration"` : la mesure
   *  est bonne, mais trop peu de villes sont crawlées pour situer celle-ci par
   *  rapport aux autres. `null` : un score est publié. */
  richnessPending: "incomparable" | "effort" | "precision" | "calibration" | null;
  /** `null` tant que la ville n'est pas ingérée, ou tant que trop peu de
   *  villes le sont pour situer celle-ci. `protectionPending` dit laquelle
   *  des deux. */
  protection: Component | null;
  /** `"data"` : la passe INPN n'a pas encore couvert cette ville — on ne sait
   *  pas, ce n'est pas zéro. `"scope"` : la passe a tourné, mais aucune de ses
   *  couches ne couvre le territoire de la ville (outre-mer sur une passe
   *  continentale) — on ne sait pas non plus, et pour une raison qui se dit.
   *  `"calibration"` : les périmètres sont relevés, le rang sur 10 attend
   *  d'autres villes. `null` : un score est publié. */
  protectionPending: "data" | "scope" | "calibration" | null;
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
   *  pareil). `"incomparable"` : la commune a bien une surface relevée, mais le
   *  barème est retiré — raison actuelle des 529 villes qui portent un chiffre,
   *  voir `GREEN_SPACE_RANKING_PUBLISHED`. `null` : un score est publié. */
  greenSpacePending: "incomparable" | "mapping" | "data" | null;
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
  // L'ordre compte : « incomparable » passe avant tout le reste, parce qu'il ne
  // parle pas de CETTE ville mais du barème. Dire à Douai « effort insuffisant »
  // alors qu'elle porte 2 588 espèces serait faux deux fois.
  const richnessPending: BiodiversityProfile["richnessPending"] =
    !RICHNESS_RANKING_PUBLISHED
      ? "incomparable"
      : !measurable
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
  // L'ordre est l'inverse de celui de la richesse, et c'est voulu : là-bas la
  // mesure existait dans tous les cas, donc la raison de barème passait devant.
  // Ici 11 communes n'ont aucun parc nommé, donc aucune surface à montrer — leur
  // dire « le barème est retiré » masquerait qu'il n'y a rien à comparer.
  // « incomparable » ne concerne que les villes qui portent bien un chiffre.
  const greenSpacePending: BiodiversityProfile["greenSpacePending"] =
    green == null
      ? hasParksData(slug)
        ? "mapping"
        : "data"
      : !GREEN_SPACE_RANKING_PUBLISHED
        ? "incomparable"
        : null;
  const greenSpace: Component | null =
    green != null && greenSpacePending === null
      ? { value: green, ...greenScale(green) }
      : null;

  const protectedAreas = cityProtectedAreas(slug);
  const protection = protectionComponent(slug);
  // « hors périmètre » passe avant « calibration » : la ville n'attend pas que
  // d'autres soient ingérées, elle attend un fichier qui la couvre.
  const protectionPending: BiodiversityProfile["protectionPending"] = !protectedAreas
    ? "data"
    : !isMeasuredProtection(protectedAreas)
      ? "scope"
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
