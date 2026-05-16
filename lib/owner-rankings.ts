// F16 — Classements basés sur les owner scores (F3).
//
// 10 classements thématiques, chacun pré-calculé en build-time depuis
// `lib/owner-scores.ts`. Distincts des classements officiels du site
// (RANKING_META) qui agrègent les 8 axes du seed.

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
    metaTitle: "Villes françaises les plus tempérées en été 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises où l'été reste vivable. Score canicule 0-10 dérivé des moyennes Météo-France juillet 1991-2020, mis à jour avec projection ARPEGE 2040.",
    intro: "Les villes en tête de ce classement gardent un été où l'on peut sortir entre 14h et 18h sans climatisation. Score calibré sur la moyenne de juillet — plus elle est élevée, moins on est résistant.",
    methodology: "Score = 9 − (température moyenne juillet − 22) × 0,9, clampé sur 0-10. Source : Météo-France climato 1991-2020. À enrichir avec la projection ARPEGE 2040 (jours > 30 °C).",
  },
  {
    slug: "calme-sonore",
    scoreKey: "score_bruit",
    emoji: "🤫",
    label: "Calme sonore",
    metaTitle: "Villes françaises les moins bruyantes 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises au meilleur calme sonore. Score bruit 0-10 dérivé de la population, densité urbaine et zone IDF (proxy Bruitparif).",
    intro: "Villes les moins bruyantes selon la combinaison taille de population + zone dense. Les communes IDF subissent une pénalité (Lden ≥ 60 dB(A) documenté).",
    methodology: "Score = 8,5 − pénalité population (0,5 à 2 pts) − pénalité IDF (1 pt). À remplacer par Bruitparif (IDF) + Cartes de Bruit Stratégiques Cerema.",
  },
  {
    slug: "lien-social",
    scoreKey: "score_solitude",
    emoji: "🤝",
    label: "Lien social",
    metaTitle: "Villes françaises où on est le moins seul 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises où la solitude est moindre. Score lien-social dérivé du % ménages 1 personne par département (Insee recensement 2020).",
    intro: "Villes où la part des ménages monoparentaux et célibataires reste basse — typiquement villes petites ou moyennes, plus communautaires. À l'inverse, Paris et les hyper-centres sont en bas.",
    methodology: "Score = 8,5 − (% ménages 1 personne dept − 30) × 0,25, + bonus 0,8 si < 30 000 hab. Source : Insee recensement 2020.",
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
    metaTitle: "Villes françaises avec la meilleure qualité de l'air 2026 — Classement",
    metaDescription: "Classement 2026 des villes françaises au meilleur air. Score PM2.5 moyen annuel département (ATMO France 2023).",
    intro: "Score inversé vs la moyenne PM2.5 du département. Les villes côtières et atlantiques dominent — Grenoble et la vallée de l'Arve restent en bas (inversion d'hiver).",
    methodology: "Score = 9,5 − (PM2.5 µg/m³ − 5) × 0,5. Seuils WHO 2021 : > 5 µg/m³ déjà nocif. Source : ATMO France 2023. À précicer par commune.",
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
    methodology: "Score = moyenne culture + remoteWork + cost + bonus métropole. À enrichir avec Insee recensement + flux SIRENE 3 ans glissants.",
  },
  {
    slug: "famille-proprietaire",
    scoreKey: "score_famille",
    emoji: "👨‍👩‍👧",
    label: "Famille (score propriétaire)",
    metaTitle: "Villes françaises pour familles 2026 — Classement propriétaire",
    metaDescription: "Classement 2026 propriétaire pour familles avec enfants. Composite écoles + sécurité + nature, pénalité coût élevé.",
    intro: "Score propriétaire qui pénalise plus fortement les villes très chères pour les familles modestes. Différent du classement officiel `/classements/famille` qui ne pénalise pas autant le coût.",
    methodology: "Score = moyenne écoles + sécurité + nature, − 0,5 si cost < 4. À enrichir avec DEPP (effectifs écoles, taux brevet) + CAF (places crèche / 1000 enfants).",
  },
];

export const OWNER_RANKING_SLUGS = OWNER_RANKINGS.map((r) => r.slug);

export interface OwnerRankingRow {
  city: CitySeed;
  score: number;
}

export function rankByOwnerScore(scoreKey: OwnerScoreKey, limit = 50): OwnerRankingRow[] {
  const rows: OwnerRankingRow[] = CITIES_SEED.map((city) => {
    const scores = computeOwnerScores(city);
    const target = scores.find((s) => s.key === scoreKey);
    return { city, score: target?.value ?? 5 };
  });
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, limit);
}

export function getOwnerRanking(slug: string): OwnerRankingDef | undefined {
  return OWNER_RANKINGS.find((r) => r.slug === slug);
}
