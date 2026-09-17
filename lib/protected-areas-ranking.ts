// F62 — classement national des zones protégées autour des villes.
//
// La composante « zones protégées » de `lib/biodiversity.ts` est mesurée sur
// les 540 villes depuis la passe BD TOPO du 2026-08-19. Jusqu'ici elle ne se
// lisait qu'une ville à la fois, sur `/villes/[slug]/biodiversite` : ce module
// l'expose en comparaison nationale, et rien d'autre — aucune nouvelle mesure
// n'est calculée ici, tout vient de `data/city-protected-areas.json`.
//
// **Pourquoi cette composante-là peut être classée alors que la richesse ne le
// peut pas** (rang de richesse retiré le 2026-08-10, cf. ROADMAP) : un
// périmètre réglementaire existe indépendamment de qui vient l'observer. La
// richesse GBIF mesurait d'abord la densité de naturalistes ; un arrêté de
// biotope, lui, est publié au Journal officiel. C'est la seule des trois
// composantes insensible au biais d'effort, et c'est ce qui la rend publiable.
//
// **Convention d'honnêteté**, reprise telle quelle de `lib/owner-rankings.ts` :
// une égalité ne se coupe jamais en son milieu. Les villes sont groupées par
// valeur, un palier qui ferait déborder la limite n'est pas publié à moitié, et
// la page dit combien de villes suivaient et à quelle couverture. Le premier
// palier fait exception — sinon un score grossier rendrait une page vide.
//
// **Convention de direction** : ce module ne publie **aucune note sur 10**. Il
// classe une `coverage` — la part du disque de 15 km sous protection, pondérée
// par le niveau — c'est-à-dire un **pourcentage, 100 = le plus protégé**. Deux
// conséquences pratiques :
//   - ne jamais nourrir `scoreColor` / `scoreHex` avec cette valeur : la
//     palette du site est calée sur 0-10, une couverture de 47,9 % y tomberait
//     hors barème (les deux hubs n'utilisent aucune couleur de score, et c'est
//     volontaire) ;
//   - la note sur 10 de la composante, elle, vient de `lib/biodiversity`
//     (`biodiversityProfile(slug).protection.score`, `10 = le plus protégé`,
//     publiée seulement quand `PROTECTION_CALIBRATED`), et sa `value` est
//     précisément cette couverture. Une surface qui affiche les deux doit dire
//     laquelle est laquelle : ce sont deux échelles, pas deux écritures de la
//     même.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  PROTECTED_RADIUS_KM,
  PROTECTION_WEIGHT,
  cityProtectedAreas,
  isBufferPerimeter,
  isMeasuredProtection,
  protectionSeaDistanceKm,
  type ProtectionKind,
} from "@/lib/biodiversity";

export interface ProtectionEntry {
  city: CitySeed;
  /** Part du disque de 15 km sous protection, pondérée par le niveau. */
  coverage: number;
  /** La même part, tous niveaux confondus et sans pondération. */
  rawCoverage: number;
  areasTotal: number;
  /** Niveau de protection le plus fort relevé autour de la ville. */
  strongest: ProtectionKind | null;
  /** Le plus grand périmètre relevé — celui qui explique le rang. */
  topArea: string | null;
}

export interface ProtectionTier {
  /** Rang de compétition : les ex æquo le partagent, le suivant saute d'autant. */
  rank: number;
  coverage: number;
  /** Triées par nom à l'intérieur du palier — ordre stable, pas un départage. */
  entries: ProtectionEntry[];
}

export interface ProtectionRanking {
  tiers: ProtectionTier[];
  /** Villes réellement publiées (somme des paliers retenus). */
  published: number;
  /** Villes entrées au barème. */
  pool: number;
  /** Palier suivant, non publié parce qu'il déborderait la limite. */
  nextTier: { coverage: number; count: number } | null;
  /** Le premier palier dépasse à lui seul la limite : la mesure ne départage pas. */
  firstTierOverflows: boolean;
}

/** Le nom d'une aire d'adhésion de parc national. Voir ADHESION_ONLY_CITIES. */
const ADHESION_NAME = /adh[ée]sion/i;

function strongestKind(kinds: ProtectionKind[]): ProtectionKind | null {
  let best: ProtectionKind | null = null;
  for (const k of kinds) {
    if (best === null || PROTECTION_WEIGHT[k] > PROTECTION_WEIGHT[best]) best = k;
  }
  return best;
}

/**
 * Une entrée par ville mesurée. Une ville non ingérée, ou hors du périmètre des
 * couches de la passe, n'entre pas : elle n'a pas de couverture à comparer, et
 * lui en inventer une la rangerait au plancher.
 */
export function protectionEntries(minPopulation = 0): ProtectionEntry[] {
  const out: ProtectionEntry[] = [];
  for (const city of CITIES_SEED) {
    if (city.population < minPopulation) continue;
    const record = cityProtectedAreas(city.slug);
    if (!record || !isMeasuredProtection(record)) continue;
    // `areas` est triée par superficie décroissante côté ingest : la première
    // est le périmètre qui pèse le plus dans la couverture.
    const top = record.areas[0] ?? null;
    out.push({
      city,
      coverage: record.weightedCoverage,
      rawCoverage: record.rawCoverage,
      areasTotal: record.areasTotal,
      strongest: strongestKind(record.areas.map((a) => a.kind)),
      topArea: top?.name ? top.name.trim() : null,
    });
  }
  return out;
}

/**
 * Classe les villes par couverture protégée, en paliers d'ex æquo.
 *
 * `minPopulation` ne filtre pas une donnée douteuse — la mesure vaut pour les
 * 540 villes — il sert à publier une seconde vue : la couverture d'un disque de
 * 15 km favorise mécaniquement les petites communes de montagne, et un lecteur
 * qui vit dans une métropole veut voir les métropoles entre elles.
 */
export function rankByProtection(limit: number, minPopulation = 0): ProtectionRanking {
  const entries = protectionEntries(minPopulation);
  const byCoverage = new Map<number, ProtectionEntry[]>();
  for (const e of entries) {
    const bucket = byCoverage.get(e.coverage);
    if (bucket) bucket.push(e);
    else byCoverage.set(e.coverage, [e]);
  }

  const ordered = [...byCoverage.entries()].sort((a, b) => b[0] - a[0]);
  const tiers: ProtectionTier[] = [];
  let published = 0;
  let nextTier: { coverage: number; count: number } | null = null;

  for (const [coverage, tierEntries] of ordered) {
    if (tiers.length > 0 && published + tierEntries.length > limit) {
      nextTier = { coverage, count: tierEntries.length };
      break;
    }
    tierEntries.sort((a, b) => a.city.name.localeCompare(b.city.name, "fr"));
    tiers.push({ rank: published + 1, coverage, entries: tierEntries });
    published += tierEntries.length;
  }

  return {
    tiers,
    published,
    pool: entries.length,
    nextTier,
    firstTierOverflows: ordered.length > 0 && ordered[0][1].length > limit,
  };
}

/**
 * Les `count` premières villes publiées, pour le JSON-LD.
 * `ordered` ne vaut `true` que si chacune est seule à son rang — sinon la liste
 * est explicitement non ordonnée, et le balisage doit le dire.
 */
export function protectionRankingHead(
  ranking: ProtectionRanking,
  count = 10,
): { entries: ProtectionEntry[]; ordered: boolean } {
  const entries: ProtectionEntry[] = [];
  let ordered = true;
  for (const tier of ranking.tiers) {
    if (entries.length >= count) break;
    if (tier.entries.length > 1) ordered = false;
    entries.push(...tier.entries.slice(0, count - entries.length));
  }
  return { entries, ordered };
}

/* ── repères nationaux ────────────────────────────────────────────────── */

const ALL = protectionEntries();

/** Villes portant une couverture mesurée. */
export const PROTECTION_RANKED_COUNT = ALL.length;

/** Médiane de la couverture pondérée, en % du disque. */
export const PROTECTION_MEDIAN_COVERAGE = (() => {
  const sorted = ALL.map((e) => e.coverage).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = sorted.length >> 1;
  return sorted.length % 2
    ? sorted[mid]
    : +(((sorted[mid - 1] + sorted[mid]) / 2)).toFixed(1);
})();

/** Villes dont la couverture s'arrondit à 0,0 % du disque. */
export const PROTECTION_ZERO_COUNT = ALL.filter((e) => e.coverage === 0).length;

/**
 * Villes sans **aucun** périmètre réglementaire à moins de 15 km. C'est une
 * mesure, pas un trou de collecte : les cinq couches de la passe couvrent leur
 * territoire, elles n'y trouvent rien. Distinct des villes à 0,0 % de
 * couverture, qui ont un périmètre trop petit ou trop excentré pour peser.
 */
export const PROTECTION_NO_PERIMETER = ALL.filter((e) => e.areasTotal === 0)
  .map((e) => e.city)
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

/**
 * Villes dont le seul périmètre de parc national relevé est une **aire
 * d'adhésion**.
 *
 * La BD TOPO publie le cœur d'un parc national et son aire d'adhésion comme
 * deux polygones du même type, et l'ingest les pondère donc pareil (1,0). Ce
 * n'est pas la même chose sur le terrain : le cœur porte une réglementation
 * propre, l'aire d'adhésion est une zone de charte, sans interdiction générale.
 * Là où le rang d'une ville tient à une aire d'adhésion, la page doit le dire
 * plutôt que de laisser lire « parc national ». La détection se fait sur le nom
 * du périmètre, faute d'un attribut qui distingue les deux dans la source —
 * c'est écrit ici pour que personne ne la prenne pour une donnée.
 */
export const PROTECTION_ADHESION_ONLY = ALL.filter((e) => {
  const record = cityProtectedAreas(e.city.slug);
  if (!record || !isMeasuredProtection(record)) return false;
  const national = record.areas.filter((a) => a.kind === "parc-national");
  return national.length > 0 && national.every((a) => ADHESION_NAME.test(a.name ?? ""));
})
  .map((e) => e.city)
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

/** Surface du disque d'analyse, en hectares. Les `areaHa` de la source sont
 *  déjà **découpées sur ce disque** (grille de 250 m côté ingest), donc le
 *  rapport des deux est une part exacte, pas une approximation. */
const DISC_HA = Math.PI * PROTECTED_RADIUS_KM * PROTECTED_RADIUS_KM * 100;

/** Part du disque tenue par les périmètres de protection (zones tampons) d'une
 *  ville, en %. `0` quand elle n'en porte aucun. */
export function bufferShare(slug: string): number {
  const record = cityProtectedAreas(slug);
  if (!record || !isMeasuredProtection(record)) return 0;
  const ha = record.areas.filter(isBufferPerimeter).reduce((a, b) => a + b.areaHa, 0);
  return ha === 0 ? 0 : +((100 * ha) / DISC_HA).toFixed(1);
}

/** Au-delà de cette part du disque, le tampon pèse assez pour porter le rang
 *  de la ville, et la page doit le nommer. En dessous, il est dans la liste
 *  mais ne déplace pas le chiffre : 22 des 28 villes qui en portent un sont
 *  dans ce cas, en dessous de 2,2 % du disque. */
const BUFFER_MATERIAL_SHARE = 5;

/**
 * Villes dont la couverture repose **matériellement sur un périmètre de
 * protection** — la zone tampon d'une réserve naturelle, pas la réserve.
 *
 * Mesuré le 2026-09-14 sur les 540 villes : 28 en portent un, six seulement
 * au-dessus de `BUFFER_MATERIAL_SHARE`, et ces six occupent les rangs 1, 3, 7,
 * 11, 23 et 128 du classement national. Deux réserves géologiques expliquent
 * les six — Haute-Provence et Luberon — et leurs tampons sont d'un autre ordre
 * de grandeur que ce qu'ils entourent : à Digne-les-Bains 68 081 ha de tampon
 * pour 75 ha de réserve dans le même disque, à Apt 39 344 ha pour 25 ha.
 * Comme les deux polygones sortent de la même couche BD TOPO, l'ingest les
 * pondère pareil (1,0) et la cellule de grille retient ce poids : la tête du
 * classement national est donc portée par des tampons comptés comme des
 * réserves.
 *
 * ⚠️ On le **dit**, on ne le corrige pas — même arbitrage qu'au couple cœur de
 * parc / aire d'adhésion (`PROTECTION_ADHESION_ONLY`). Repondérer sur la foi
 * d'un nom réécrirait un classement publié à partir d'une expression
 * régulière ; le lecteur, lui, a besoin de savoir ce qu'il regarde. Le remède
 * propre est côté ingest : la BD TOPO distingue les deux objets par leur
 * couche d'origine, pas par un attribut qu'on lit ici.
 */
export const PROTECTION_BUFFER_LED = ALL.filter(
  (e) => bufferShare(e.city.slug) >= BUFFER_MATERIAL_SHARE,
)
  .map((e) => e.city)
  .sort((a, b) => bufferShare(b.slug) - bufferShare(a.slug));

/** Villes portant un tampon, quelle que soit sa part du disque. Le comptage
 *  est publié à côté de `PROTECTION_BUFFER_LED` pour que le lecteur voie que
 *  la plupart des cas sont anodins. */
export const PROTECTION_BUFFER_COUNT = ALL.filter((e) => {
  const record = cityProtectedAreas(e.city.slug);
  // Sur le polygone, pas sur `bufferShare` : sept tampons pèsent moins de
  // 0,05 % du disque et s'arrondiraient à zéro, alors qu'ils sont bien là.
  return !!record && isMeasuredProtection(record) && record.areas.some(isBufferPerimeter);
}).length;

/** Rangs nationaux des villes de `PROTECTION_BUFFER_LED`, dans le même ordre.
 *  Rang de compétition, ex æquo partagés — même convention que
 *  `rankByProtection`. Dérivé, pour qu'une passe de collecte ne laisse pas des
 *  numéros périmés dans la prose des deux hubs. */
export const PROTECTION_BUFFER_LED_RANKS: number[] = (() => {
  const ordered = [...new Set(ALL.map((e) => e.coverage))].sort((a, b) => b - a);
  const rankOf = new Map<number, number>();
  let seen = 0;
  for (const coverage of ordered) {
    rankOf.set(coverage, seen + 1);
    seen += ALL.filter((e) => e.coverage === coverage).length;
  }
  return PROTECTION_BUFFER_LED.map((city) => {
    const entry = ALL.find((e) => e.city.slug === city.slug);
    return entry ? (rankOf.get(entry.coverage) ?? 0) : 0;
  });
})();

/**
 * Le cas d'école, dérivé plutôt que recopié : la ville la plus portée par un
 * tampon, la surface de ce tampon dans son disque, et celle de la réserve
 * qu'il entoure quand elle y tombe aussi. Les deux hubs le citent, et une
 * prochaine passe de collecte déplacera les chiffres au lieu de les périmer.
 */
export const PROTECTION_BUFFER_EXAMPLE: {
  city: CitySeed;
  bufferHa: number;
  reserveHa: number | null;
} | null = (() => {
  const city = PROTECTION_BUFFER_LED[0];
  if (!city) return null;
  const record = cityProtectedAreas(city.slug);
  if (!record || !isMeasuredProtection(record)) return null;
  const reserves = record.areas.filter((a) => a.kind === "reserve-naturelle");
  const bufferHa = reserves.filter(isBufferPerimeter).reduce((a, b) => a + b.areaHa, 0);
  const own = reserves.filter((a) => !isBufferPerimeter(a));
  return {
    city,
    bufferHa: Math.round(bufferHa),
    reserveHa: own.length ? Math.round(own.reduce((a, b) => a + b.areaHa, 0)) : null,
  };
})();

/** Villes dont **tous** les polygones de réserve naturelle relevés sont des
 *  tampons : la colonne « protection la plus forte » y annonce une réserve
 *  naturelle là où il n'y a que son périmètre de protection. */
export const PROTECTION_BUFFER_ONLY = ALL.filter((e) => {
  const record = cityProtectedAreas(e.city.slug);
  if (!record || !isMeasuredProtection(record)) return false;
  const reserves = record.areas.filter((a) => a.kind === "reserve-naturelle");
  return reserves.length > 0 && reserves.every(isBufferPerimeter);
})
  .map((e) => e.city)
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

/* ── la mer dans le disque ────────────────────────────────────────────── */

/**
 * Villes dont le disque d'analyse atteint la **mer ouverte**, triées de la
 * plus exposée à la moins exposée. Voir `protectionSeaDistanceKm` pour le
 * mécanisme : chez elles le chiffre publié mélange du sol et de l'eau, au
 * dénominateur (le disque ne distingue pas les deux) comme au numérateur (les
 * sites Natura 2000 marins y sont comptés comme n'importe quel zonage).
 *
 * Mesuré le 2026-09-17 : **101 villes sur 540**, dont 37 ont la mer à moins
 * d'un kilomètre de leur centre.
 */
export const PROTECTION_SEA_EXPOSED = ALL.filter(
  (e) => protectionSeaDistanceKm(e.city.slug) != null,
)
  .map((e) => e.city)
  .sort(
    (a, b) =>
      (protectionSeaDistanceKm(a.slug) ?? 0) - (protectionSeaDistanceKm(b.slug) ?? 0) ||
      a.name.localeCompare(b.name, "fr"),
  );

export const PROTECTION_SEA_COUNT = PROTECTION_SEA_EXPOSED.length;

const median = (values: number[]): number => {
  const sorted = values.slice().sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : +(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));
};

const SEA_SLUGS = new Set(PROTECTION_SEA_EXPOSED.map((c) => c.slug));

/**
 * L'écart que le mélange produit, dérivé et non recopié : la couverture
 * médiane des villes dont le disque touche la mer, contre celle des villes
 * entièrement continentales. Mesuré le 2026-09-17 : **20,4 % contre 4,6 %**.
 *
 * ⚠️ **Cet écart n'est pas « la part d'eau »** et ne doit jamais être présenté
 * comme tel. Le littoral français est réellement plus protégé que l'intérieur
 * — dunes, marais, conservatoire — et nos données ne savent pas séparer cette
 * protection-là de l'eau comptée comme du sol : il faudrait un masque
 * terre/mer à l'ingest. Ce qui est établi, c'est que les deux entrent dans le
 * même nombre, donc que les deux groupes ne se comparent pas.
 */
export const PROTECTION_SEA_MEDIAN = median(
  ALL.filter((e) => SEA_SLUGS.has(e.city.slug)).map((e) => e.coverage),
);

export const PROTECTION_INLAND_MEDIAN = median(
  ALL.filter((e) => !SEA_SLUGS.has(e.city.slug)).map((e) => e.coverage),
);

/**
 * Combien de villes exposées à la mer un classement publie, et combien il en
 * brassait. Dérivé du `rankByProtection` réel, avec ses paliers d'ex æquo,
 * pour qu'une passe de collecte déplace les nombres au lieu de les périmer.
 *
 * Mesuré le 2026-09-17 : le classement national en publie **16 sur 40** pour
 * un vivier à 18,7 % ; celui des villes de plus de 100 000 habitants **8 sur
 * 20**, soit huit des neuf grandes villes dont le disque touche la mer.
 */
export function seaExposedInRanking(
  limit: number,
  minPopulation = 0,
): { published: number; total: number; poolShare: number } {
  const ranking = rankByProtection(limit, minPopulation);
  const entries = ranking.tiers.flatMap((t) => t.entries);
  const pool = protectionEntries(minPopulation);
  const poolSea = pool.filter((e) => SEA_SLUGS.has(e.city.slug)).length;
  return {
    published: entries.filter((e) => SEA_SLUGS.has(e.city.slug)).length,
    total: entries.length,
    poolShare: pool.length ? +((100 * poolSea) / pool.length).toFixed(1) : 0,
  };
}

/** Date de la passe qui a produit les périmètres, telle qu'écrite dans les
 *  enregistrements. Publiée comme un plafond, pas comme un gage de fraîcheur. */
export const PROTECTION_CRAWLED_AT = (() => {
  for (const city of CITIES_SEED) {
    const record = cityProtectedAreas(city.slug);
    if (record) return record.crawledAt;
  }
  return null;
})();

/* ── libellés ─────────────────────────────────────────────────────────── */

export const PROTECTION_KIND_LABEL_FR: Record<ProtectionKind, string> = {
  "reserve-naturelle": "Réserve naturelle",
  "parc-national": "Parc national",
  "arrete-biotope": "Arrêté de biotope",
  "natura-2000": "Natura 2000",
  "parc-naturel-regional": "Parc naturel régional",
  "znieff-1": "ZNIEFF I",
  "znieff-2": "ZNIEFF II",
};

export const PROTECTION_KIND_LABEL_EN: Record<ProtectionKind, string> = {
  "reserve-naturelle": "Nature reserve",
  "parc-national": "National park",
  "arrete-biotope": "Biotope protection order",
  "natura-2000": "Natura 2000",
  "parc-naturel-regional": "Regional nature park",
  "znieff-1": "ZNIEFF I",
  "znieff-2": "ZNIEFF II",
};
