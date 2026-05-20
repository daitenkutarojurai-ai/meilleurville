// F19 — Pages "Pour qui" thématiques.
//
// 10 profils éditoriaux, chacun = recombinaison pondérée des axes seed +
// owner-scores. Top 20 villes par profil + intro/méthodo personnalisée.
// Aucune nouvelle donnée — pure recombinaison.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeOwnerScores } from "@/lib/owner-scores";

type ScoreWeights = Partial<{
  // Axes seed (CityScore)
  life: number;
  transport: number;
  nature: number;
  cost: number;
  safety: number;
  culture: number;
  remoteWork: number;
  schools: number;
  // Owner scores (lib/owner-scores)
  canicule: number;
  solitude: number;
  bruit: number;
  securiteNocturne: number;
  sansVoiture: number;
  teletravail: number;
  qualiteAir: number;
  securiteFemmeSeule: number;
  jeuneActif: number;
  famille: number;
}>;

export interface ProfileDef {
  slug: string;
  emoji: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  weights: ScoreWeights;
  reasonHint: (city: CitySeed) => string;
}

function ownerVal(city: CitySeed, key: string): number {
  const s = computeOwnerScores(city);
  switch (key) {
    case "canicule": return s.find((x) => x.key === "score_canicule")!.value;
    case "solitude": return s.find((x) => x.key === "score_solitude")!.value;
    case "bruit": return s.find((x) => x.key === "score_bruit")!.value;
    case "securiteNocturne": return s.find((x) => x.key === "score_securite_nocturne")!.value;
    case "sansVoiture": return s.find((x) => x.key === "score_sans_voiture")!.value;
    case "teletravail": return s.find((x) => x.key === "score_teletravail")!.value;
    case "qualiteAir": return s.find((x) => x.key === "score_qualite_air")!.value;
    case "securiteFemmeSeule": return s.find((x) => x.key === "score_securite_femme_seule")!.value;
    case "jeuneActif": return s.find((x) => x.key === "score_jeune_actif")!.value;
    case "famille": return s.find((x) => x.key === "score_famille")!.value;
  }
  return 5;
}

function getScoreValue(city: CitySeed, key: string): number {
  // Axes seed
  if (["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"].includes(key)) {
    return city.scores[key as keyof typeof city.scores];
  }
  return ownerVal(city, key);
}

export const PROFILE_PAGES: ProfileDef[] = [
  {
    slug: "familles-avec-enfants",
    emoji: "👨‍👩‍👧",
    label: "Familles avec enfants",
    metaTitle: "Meilleures villes familles avec enfants 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises adaptées aux familles avec enfants : écoles, sécurité, espaces verts, coût accessible. Score composite calibré sur Insee + DEPP + SSMSI.",
    intro:
      "Familles avec enfants : la combinaison qui compte vraiment, c'est écoles + sécurité + espaces verts + coût accessible. Pas le top 5 du palmarès culture ou nightlife — les familles ne s'y intéressent pas. Ce classement reflète l'arbitrage réel.",
    weights: { schools: 2.5, safety: 2.0, famille: 2.0, nature: 1.5, cost: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Écoles ${c.scores.schools.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "jeunes-actifs",
    emoji: "🚀",
    label: "Jeunes actifs",
    metaTitle: "Meilleures villes jeunes actifs 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour jeunes actifs 25-35 ans : carrière + culture + télétravail + coût accessible. Calibré sur démographie et SIRENE.",
    intro:
      "Jeunes actifs : il faut un cocktail spécifique — un marché de l'emploi qui bouge, une scène culturelle qui ne s'arrête pas à 22 h, des loyers où on peut commencer sans hériter, et un réseau pour se faire des amis. Ces 20 villes cochent tout ça.",
    weights: { jeuneActif: 2.5, culture: 2.0, remoteWork: 1.5, cost: 1.5, life: 1.0 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · télétravail ${c.scores.remoteWork.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "retraites",
    emoji: "🌅",
    label: "Retraités",
    metaTitle: "Meilleures villes retraités 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour retraités : santé, sécurité, climat doux, calme, coût accessible. Sélection 2026 calibrée.",
    intro:
      "Retraités : santé d'abord, sécurité ensuite, climat agréable, qualité de vie quotidienne. Le coût compte mais moins que pour des actifs (la pension est fixe — c'est la valeur de l'immobilier déjà acquis qui importe). Ces 20 villes maximisent ce mélange.",
    weights: { safety: 2.5, life: 2.5, nature: 1.5, securiteNocturne: 1.5, qualiteAir: 1.5, canicule: 1.0 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "freelances",
    emoji: "💼",
    label: "Freelances et indépendants",
    metaTitle: "Meilleures villes freelances 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour freelances et indépendants : fibre + coworking + culture + coût optimisé. Calibré 2026.",
    intro:
      "Freelances : fibre, coworking, communauté locale d'indépendants, qualité de vie pour ne pas crever sous le travail. Ces 20 villes ont le bon mélange — pas juste les grandes métros, plusieurs villes moyennes en montée s'y glissent.",
    weights: { remoteWork: 2.5, teletravail: 2.0, culture: 1.5, life: 1.5, cost: 1.0, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Télétravail ${c.scores.remoteWork.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "teletravailleurs",
    emoji: "💻",
    label: "Télétravailleurs salariés",
    metaTitle: "Meilleures villes télétravail salarié 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour salarié·e·s en télétravail : fibre, qualité de vie, accès week-end, coût raisonnable. Calibré 2026.",
    intro:
      "Salariés en télétravail : différents des freelances. Vous gardez votre employeur (souvent parisien), donc l'éloignement coûte zéro côté carrière mais beaucoup côté loyer. Ces 20 villes optimisent le rapport qualité de vie / connectivité / accessibilité Paris.",
    weights: { remoteWork: 2.5, teletravail: 2.0, life: 2.0, transport: 1.5, nature: 1.5, cost: 1.0 },
    reasonHint: (c) =>
      `Télétravail ${c.scores.remoteWork.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "etudiants",
    emoji: "🎓",
    label: "Étudiants",
    metaTitle: "Meilleures villes étudiantes 2026 — Top 20 France",
    metaDescription: "Top 20 villes étudiantes en France : universités, culture, transports, coût logement étudiant abordable. Calibré 2026.",
    intro:
      "Étudiants : universités, vie nocturne, transports, et surtout des loyers compatibles avec une bourse Crous. Ces 20 villes ont le mélange — Toulouse, Montpellier, Rennes en tête sans surprise, mais aussi des petites villes universitaires sous-cotées.",
    weights: { culture: 2.0, transport: 2.0, cost: 2.0, schools: 1.5, jeuneActif: 1.5 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "sans-voiture",
    emoji: "🚲",
    label: "Vivre sans voiture",
    metaTitle: "Meilleures villes pour vivre sans voiture 2026 — Top 20",
    metaDescription: "Top 20 villes françaises où vivre sans voiture : tram, métro, bus, vélo. Score sans-voiture propriétaire + transport.",
    intro:
      "Si vous voulez vivre sans permis ou simplement laisser la voiture au garage, ces 20 villes ont le réseau pour. Le score combine la densité du tram/métro/bus avec la walkability et le réseau cyclable.",
    weights: { sansVoiture: 3.0, transport: 2.0, life: 1.5, culture: 1.0 },
    reasonHint: (c) =>
      `Transport ${c.scores.transport.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "premium",
    emoji: "✨",
    label: "Vie premium",
    metaTitle: "Villes françaises premium 2026 — Top 20",
    metaDescription: "Top 20 villes françaises premium : qualité de vie haut de gamme, sécurité, cadre exceptionnel, écoles + culture. Pour budgets > 4 000 €/mois.",
    intro:
      "Vie premium : pas une question de prestige, mais de combinaison rare. Sécurité élevée, cadre exceptionnel, écoles renommées, scène culturelle riche, et un coût qui reflète tout ça. Ces 20 villes sont pour les budgets ≥ 4 000 €/mois.",
    weights: { life: 2.5, safety: 2.0, schools: 1.5, culture: 1.5, nature: 1.5 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "solo-femme",
    emoji: "👤",
    label: "Femme seule",
    metaTitle: "Meilleures villes femme seule 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises adaptées aux femmes seules : sécurité nocturne, densité transport tardif, qualité de vie urbaine.",
    intro:
      "Femme seule : sécurité globale ne suffit pas — il faut sécurité nocturne ET transport tardif. Ces 20 villes maximisent le retour soir serein, sans renoncer à la qualité de vie urbaine et culturelle.",
    weights: { securiteFemmeSeule: 3.0, securiteNocturne: 2.0, transport: 1.5, culture: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Sécurité ${c.scores.safety.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "couple-sans-enfant",
    emoji: "👫",
    label: "Couple sans enfant",
    metaTitle: "Meilleures villes couple sans enfant 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour couples sans enfant : culture, restaurants, sorties, week-ends nature, transport. Score composite calibré 2026.",
    intro:
      "Couple sans enfant : les écoles ne pèsent rien dans l'arbitrage, et avec deux salaires le coût du logement passe au second plan. Ce qui compte vraiment, c'est une scène culturelle vivante, des restaurants et des sorties qui ne ferment pas à 22 h, une nature accessible pour les week-ends à deux, et des transports qui suivent. Ces 20 villes maximisent exactement ce mélange.",
    weights: { culture: 2.5, life: 2.0, jeuneActif: 1.5, nature: 1.5, transport: 1.5, remoteWork: 1.0 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "expat-retour",
    emoji: "✈️",
    label: "Retour d'expatriation",
    metaTitle: "Meilleures villes retour expatriation 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour Français rentrant d'expatriation : qualité de vie + international + frontalières. Suisse, Lux, UK, Canada inclus.",
    intro:
      "Retour d'expat : transition entre un mode de vie international (souvent confort élevé) et une rentrée française. Ces 20 villes combinent qualité de vie, accessibilité internationale (aéroports, frontalières) et un cadre qui ne dépaysera pas trop.",
    weights: { life: 2.5, culture: 1.5, transport: 2.0, remoteWork: 1.5, safety: 1.5, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
];

export const PROFILE_SLUGS = PROFILE_PAGES.map((p) => p.slug);

export interface ProfileMatch {
  city: CitySeed;
  score: number;
  reason: string;
}

export function rankByProfile(profile: ProfileDef, limit = 20): ProfileMatch[] {
  const totalWeight = Object.values(profile.weights).reduce<number>((s, v) => s + (v ?? 0), 0);
  const rows: ProfileMatch[] = CITIES_SEED.map((city) => {
    let weightedSum = 0;
    for (const [key, weight] of Object.entries(profile.weights)) {
      if (weight == null) continue;
      weightedSum += getScoreValue(city, key) * weight;
    }
    const score = totalWeight > 0 ? (weightedSum / totalWeight) * 10 : 50;
    return {
      city,
      score: Math.round(score * 10) / 10,
      reason: profile.reasonHint(city),
    };
  });
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, limit);
}

export function getProfile(slug: string): ProfileDef | undefined {
  return PROFILE_PAGES.find((p) => p.slug === slug);
}
