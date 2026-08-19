// F16 — Classements basés sur les owner scores (F3).
//
// 10 classements thématiques, chacun pré-calculé en build-time depuis
// `lib/owner-scores.ts`. Distincts des classements officiels du site
// (RANKING_META) qui agrègent les 8 axes du seed.
//
// **Convention d'honnêteté (2026-08-19)** : un classement ne publie un rang
// que là où le score départage réellement. Deux garde-fous, tous deux
// mesurés avant d'être écrits :
//
//   ① Les villes dont le score est un **repli national** (`kind:
//      "estimation-regionale"`, c'est-à-dire la même constante pour tout le
//      monde faute de valeur départementale) sortent du barème. Trier une
//      constante produit l'ordre d'insertion du seed, pas un classement.
//      Concerne `score_qualite_air` (383 villes sur 540) et `score_solitude`
//      (314) — les deux seuls scores à repli plat.
//   ② Une **égalité n'est jamais coupée en son milieu**. Les villes sont
//      groupées par valeur (paliers), et un palier qui ferait déborder la
//      limite n'est pas publié à moitié : le classement s'arrête avant lui et
//      le dit. Le premier palier fait exception — il est toujours publié,
//      sinon un score grossier rendrait une page vide.
//
// C'est le même arbitrage que le retrait du rang de richesse en biodiversité
// (cf. ROADMAP § 2026-08-10) : les valeurs restent publiées, c'est l'ordre
// fabriqué qui disparaît. Avant ce correctif, `/classements/qualite-air`
// publiait 18 de ses 50 lignes en piochant dans une égalité à 411 villes, et
// `/classements/calme-sonore` ses 50 lignes dans une égalité à 170.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeOwnerScores, type OwnerScoreKey } from "@/lib/owner-scores";

export interface OwnerRankingDef {
  slug: string;
  scoreKey: OwnerScoreKey;
  emoji: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  methodology: string;
}

export const OWNER_RANKINGS: OwnerRankingDef[] = [
  {
    slug: "canicule-resistance",
    scoreKey: "score_canicule",
    emoji: "🥵",
    label: "Résistance canicule",
    metaTitle: "Villes françaises les plus tempérées en été 2026",
    metaDescription: "Classement 2026 des villes françaises où l'été reste vivable. Score canicule 0-10 dérivé des moyennes de juillet 1991-2020.",
    intro: "Les villes en tête de ce classement gardent un été où l'on peut sortir entre 14h et 18h sans climatisation. Score calibré sur la moyenne de juillet — plus elle est élevée, moins on est résistant.",
    methodology: "Score = 9,7 − (température moyenne de juillet − 18) × 0,7, clampé sur 0-10. Source : moyennes de juillet 1991-2020. La projection Météo-France ARPEGE 2040 (jours > 30 °C) n'est pas encore branchée : ce score dit la chaleur d'aujourd'hui, pas celle de 2040.",
  },
  {
    slug: "calme-sonore",
    scoreKey: "score_bruit",
    emoji: "🤫",
    label: "Calme sonore",
    metaTitle: "Villes françaises les moins bruyantes 2026 — Classement",
    metaDescription: "Villes françaises les moins bruyantes : score calme sonore 0-10 dérivé de la taille de la commune et de la zone dense IDF (proxy Bruitparif).",
    intro: "Villes les moins bruyantes selon la combinaison taille de population + zone dense. Les communes IDF subissent une pénalité (Lden ≥ 60 dB(A) documenté). Attention à ce que ce score n'est pas : aucune mesure acoustique n'entre dedans, il ne connaît que le nombre d'habitants.",
    methodology: "Score = 9,6 − pénalité de population (0,8 pt au-dessus de 60 000 habitants, 1,7 au-dessus de 150 000, 2,8 au-dessus de 300 000 ; +0,2 sous 20 000) − 1,2 pt en Île-de-France. N'ayant que la taille de la commune pour entrée, il ne produit que 9 valeurs distinctes sur 540 villes : le premier palier compte à lui seul 170 communes ex æquo, et ce classement n'en départage aucune. À remplacer par Bruitparif (IDF) + Cartes de Bruit Stratégiques Cerema.",
  },
  {
    slug: "lien-social",
    scoreKey: "score_solitude",
    emoji: "🤝",
    label: "Lien social",
    metaTitle: "Villes françaises où on est le moins seul 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises où la solitude est moindre. Score lien-social dérivé du % ménages 1 personne par département (Insee recensement 2020).",
    intro: "Villes où la part des ménages monoparentaux et célibataires reste basse — typiquement villes petites ou moyennes, plus communautaires. À l'inverse, Paris et les hyper-centres sont en bas.",
    methodology: "Score = 8,5 − (% ménages 1 personne du département − 30) × 0,25, + bonus 0,8 si < 30 000 hab. Source : Insee recensement 2020. La table couvre 25 départements : 226 villes sont classées, les 314 autres portent un repli national identique pour toutes et sont écartées du barème plutôt que triées à égalité.",
  },
  {
    slug: "securite-nocturne",
    scoreKey: "score_securite_nocturne",
    emoji: "🌙",
    label: "Sécurité nocturne",
    metaTitle: "Villes françaises les plus sûres la nuit 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises pour la sécurité nocturne. Dérivé du score sécurité SSMSI atteintes aux personnes, ajusté nuit.",
    intro: "Villes où le retour soir tardif est le moins anxiogène. Le score amplifie légèrement les écarts vs la sécurité diurne (nightlife / incidents liés à l'alcool).",
    methodology: "Score = sécurité − (10 − sécurité) × 0,15. Source : SSMSI atteintes aux personnes / 1 000 hab. À remplacer par la sous-catégorie « atteintes nuit » spécifique.",
  },
  {
    slug: "sans-voiture",
    scoreKey: "score_sans_voiture",
    emoji: "🚲",
    label: "Vie sans voiture",
    metaTitle: "Villes françaises où vivre sans voiture 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises où le réseau de transport permet de vivre sans voiture. Score dérivé GTFS multimodal + OpenStreetMap walkability.",
    intro: "Tram, métro, RER, vélo : ces villes laissent vivre sans permis. Les villes < 80 000 hab. avec un score transport < 6,5 sont pénalisées (offre TER limitée).",
    methodology: "Score = score transport site, ajusté pénalité si pop < 80k et transport < 6,5. À enrichir avec Insee Mobilité (% ménages sans voiture).",
  },
  {
    slug: "teletravail-proprietaire",
    scoreKey: "score_teletravail",
    emoji: "💻",
    label: "Télétravail (score propriétaire)",
    metaTitle: "Villes françaises télétravail 2026 — Classement propriétaire",
    metaDescription: "Classement 2026 propriétaire pour télétravailler en France. Couverture FTTH département (ARCEP) + score remote-work + qualité de vie.",
    intro: "Ce classement complète le classement officiel `/classements/teletravail` : il ajoute le facteur fibre par département. Différence visible sur les villes rurales bien fibrées (vs métropoles saturées).",
    methodology: "Score = remoteWork + ajustement FTTH dept (95% → +1, 80% → 0, 65% → -1). Source : ARCEP T4 2024 estimé + score remoteWork du seed.",
  },
  {
    slug: "qualite-air",
    scoreKey: "score_qualite_air",
    emoji: "🍃",
    label: "Qualité de l'air",
    metaTitle: "Villes avec la meilleure qualité de l'air en France 2026",
    metaDescription: "Villes françaises au meilleur air : score dérivé du PM2.5 moyen annuel du département (ATMO France 2023), sur les 157 villes couvertes.",
    intro: "Score inversé vs la moyenne PM2.5 du département. Les villes côtières et atlantiques dominent — Grenoble et la vallée de l'Arve restent en bas (inversion d'hiver). La valeur est départementale, pas communale : deux villes d'un même département portent le même chiffre.",
    methodology: "Score = 9,5 − (PM2.5 µg/m³ − 5) × 0,5. Seuil OMS 2021 : > 5 µg/m³ déjà nocif. Source : ATMO France 2023. La table de PM2.5 couvre 20 départements : 157 villes sont classées, les 383 autres portent un repli national identique pour toutes et sont écartées du barème — les trier reviendrait à trier une constante. À préciser par commune.",
  },
  {
    slug: "securite-femme-seule",
    scoreKey: "score_securite_femme_seule",
    emoji: "👤",
    label: "Sécurité femme seule",
    metaTitle: "Villes françaises sûres pour femme seule 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises pour la sécurité d'une femme seule. Pondération SSMSI + densité réseau de transport soir.",
    intro: "Score combiné sécurité globale + densité transport (proxy retour soir). Les villes qui apparaissent en tête conjuguent les deux. À remplacer par SSMSI VFFS dédié quand l'API ouverte sera disponible.",
    methodology: "Score = sécurité × 0,7 + transport × 0,3 − 0,5. Source : SSMSI. À remplacer par VFFS spécifique femmes + indice tramway-tard-le-soir.",
  },
  {
    slug: "jeune-actif",
    scoreKey: "score_jeune_actif",
    emoji: "🚀",
    label: "Jeune actif",
    metaTitle: "Villes françaises pour jeunes actifs 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises adaptées aux jeunes actifs. Composite culture + remote-work + coût + bonus métropole.",
    intro: "Villes où culture, télétravail et coût de la vie convergent — avec un bonus métropole (> 100 000 hab.) car la masse critique sociale joue. À remplacer par % 25-35 ans Insee + ouvertures SIRENE.",
    methodology: "Score = moyenne des axes culture, remoteWork et cost, + 0,8 au-dessus de 100 000 habitants. À enrichir avec Insee recensement (% 25-35 ans) + flux SIRENE 3 ans glissants.",
  },
  {
    slug: "famille-proprietaire",
    scoreKey: "score_famille",
    emoji: "👨‍👩‍👧",
    label: "Famille (score propriétaire)",
    metaTitle: "Villes françaises pour familles 2026 — score propriétaire",
    metaDescription: "Classement 2026 propriétaire pour familles avec enfants. Composite écoles + sécurité + nature, pénalité coût élevé.",
    intro: "Score propriétaire qui pénalise plus fortement les villes très chères pour les familles modestes. Différent du classement officiel `/classements/famille` qui ne pénalise pas autant le coût.",
    methodology: "Score = moyenne écoles + sécurité + nature, − 0,5 si cost < 4. À enrichir avec DEPP (effectifs écoles, taux brevet) + CAF (places crèche / 1000 enfants).",
  },
];

export const OWNER_RANKING_SLUGS = OWNER_RANKINGS.map((r) => r.slug);

/** Un palier = toutes les villes à égalité sur une même valeur. */
export interface OwnerRankingTier {
  /** Rang de compétition : les ex æquo le partagent, le suivant saute d'autant. */
  rank: number;
  score: number;
  /** Triées par nom (ordre stable et assumé — pas un départage). */
  cities: CitySeed[];
}

export interface OwnerRanking {
  tiers: OwnerRankingTier[];
  /** Villes réellement publiées (somme des paliers retenus). */
  published: number;
  /** Villes entrées au barème (score calculé ville par ville). */
  pool: number;
  /** Villes écartées faute de valeur propre (repli national constant). */
  excluded: number;
  /** Palier suivant, non publié parce qu'il déborderait la limite. */
  nextTier: { score: number; count: number } | null;
  /** Le premier palier dépasse à lui seul la limite : le score ne départage pas. */
  firstTierOverflows: boolean;
}

const DEFAULT_LIMIT = 50;

/**
 * Classe les villes par owner score, en paliers d'ex æquo.
 *
 * Voir la convention d'honnêteté en tête de fichier : les villes à repli
 * national sont écartées, et aucune égalité n'est tronquée.
 */
export function rankByOwnerScore(scoreKey: OwnerScoreKey, limit = DEFAULT_LIMIT): OwnerRanking {
  const byScore = new Map<number, CitySeed[]>();
  let pool = 0;

  for (const city of CITIES_SEED) {
    const target = computeOwnerScores(city).find((s) => s.key === scoreKey);
    // Pas de valeur, ou valeur de repli identique pour toutes : hors barème.
    if (!target || target.kind === "estimation-regionale") continue;
    pool += 1;
    const bucket = byScore.get(target.value);
    if (bucket) bucket.push(city);
    else byScore.set(target.value, [city]);
  }

  const ordered = [...byScore.entries()].sort((a, b) => b[0] - a[0]);
  const tiers: OwnerRankingTier[] = [];
  let published = 0;
  let nextTier: { score: number; count: number } | null = null;

  for (const [score, cities] of ordered) {
    // Le premier palier passe toujours : le tronquer serait exactement le
    // défaut qu'on corrige, et l'écarter viderait la page.
    if (tiers.length > 0 && published + cities.length > limit) {
      nextTier = { score, count: cities.length };
      break;
    }
    cities.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    tiers.push({ rank: published + 1, score, cities });
    published += cities.length;
  }

  return {
    tiers,
    published,
    pool,
    excluded: CITIES_SEED.length - pool,
    nextTier,
    firstTierOverflows: ordered.length > 0 && ordered[0][1].length > limit,
  };
}

/**
 * Les `count` premières villes publiées, pour le JSON-LD.
 * `ordered` ne vaut `true` que si chacune est seule à son rang — sinon la
 * liste est explicitement non ordonnée, et le balisage doit le dire.
 */
export function ownerRankingHead(
  ranking: OwnerRanking,
  count = 10
): { cities: CitySeed[]; ordered: boolean } {
  const cities: CitySeed[] = [];
  let ordered = true;
  for (const tier of ranking.tiers) {
    if (cities.length >= count) break;
    if (tier.cities.length > 1) ordered = false;
    cities.push(...tier.cities.slice(0, count - cities.length));
  }
  return { cities, ordered };
}

export function getOwnerRanking(slug: string): OwnerRankingDef | undefined {
  return OWNER_RANKINGS.find((r) => r.slug === slug);
}
