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

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  PROTECTION_WEIGHT,
  cityProtectedAreas,
  isMeasuredProtection,
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
