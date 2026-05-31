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
  {
    slug: "primo-accedants",
    emoji: "🔑",
    label: "Primo-accédants",
    metaTitle: "Meilleures villes primo-accédants 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour acheter son premier logement : prix au m² accessibles, qualité de vie correcte, sécurité, transport. Sélection 2026.",
    intro:
      "Primo-accédants : le premier achat se joue d'abord sur le prix au m². Pas la peine de viser une métropole où le ticket d'entrée pour un T3 correct dépasse 350 000 € — la mensualité étouffe tout le reste. Ces 20 villes mettent en avant un prix d'achat raisonnable sans sacrifier la qualité de vie quotidienne ni la valeur de revente à 10 ans.",
    weights: { cost: 3.0, life: 1.5, safety: 1.5, transport: 1.0, nature: 1.0, schools: 1.0, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "familles-monoparentales",
    emoji: "👩‍👧",
    label: "Familles monoparentales",
    metaTitle: "Meilleures villes familles monoparentales 2026 — Top 20",
    metaDescription: "Top 20 villes pour parents solos : coût accessible avec un seul revenu, sécurité, écoles, transport, services famille. Sélection 2026 calibrée.",
    intro:
      "Familles monoparentales : un seul revenu, des contraintes d'organisation doublées et zéro marge sur le budget. Le triangle qui compte vraiment, c'est coût accessible, sécurité (jour et soir) et école proche d'un transport efficace. Le réseau de garde et les services famille font la différence entre survivre et tenir. Ces 20 villes maximisent ce mélange — souvent des préfectures moyennes plus que des grandes métropoles, parce qu'elles concentrent les services à un coût soutenable.",
    weights: {
      cost: 2.5,
      safety: 2.0,
      schools: 2.0,
      transport: 1.5,
      famille: 1.5,
      securiteFemmeSeule: 1.0,
      life: 1.0,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)}`,
  },
  {
    slug: "familles-nombreuses",
    emoji: "👨‍👩‍👧‍👦",
    label: "Familles nombreuses",
    metaTitle: "Meilleures villes familles nombreuses 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour familles nombreuses : logement spacieux abordable, écoles, sécurité, espaces verts. Score composite calibré 2026.",
    intro:
      "Familles nombreuses : trois enfants ou plus, et tout change d'échelle. Le critère qui domine, c'est le logement — il faut un T4 ou un T5, et dans une métropole tendue le ticket d'entrée devient vite infranchissable. Vient ensuite la capacité des écoles, la sécurité, et des espaces verts où plusieurs enfants peuvent réellement respirer. Ces 20 villes mettent en avant l'espace abordable sans sacrifier les services. Souvent des villes moyennes plutôt que de grandes métropoles : elles offrent le mètre carré qui manque ailleurs.",
    weights: {
      cost: 2.5,
      schools: 2.0,
      famille: 2.0,
      nature: 2.0,
      safety: 1.5,
      life: 1.0,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "amateurs-de-plein-air",
    emoji: "🥾",
    label: "Amateurs de plein air",
    metaTitle: "Meilleures villes nature et plein air 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour les amateurs de plein air : accès nature, air respirable, climat tempéré pour rando, vélo, mer. Score composite calibré 2026.",
    intro:
      "Amateurs de plein air : votre semaine se construit autour de ce qui se passe dehors — la rando du week-end, le vélo après le boulot, la baignade ou la montagne à portée. Le critère qui domine reste l'accès à la nature, mais il ne suffit pas seul. Un air respirable change tout quand on passe ses journées dehors, et un climat tempéré évite les étés où la moindre sortie devient un supplice. Ce classement combine nature, qualité de l'air et confort climatique plutôt que la seule animation urbaine. Résultat : des villes moyennes proches du relief ou du littoral se hissent souvent devant les grandes métropoles.",
    weights: { nature: 3.0, qualiteAir: 1.5, canicule: 1.5, life: 1.5, transport: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "neo-ruraux",
    emoji: "🌾",
    label: "Néo-ruraux",
    metaTitle: "Meilleures villes pour néo-ruraux 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes pour quitter la métropole et s'installer au vert : coût abordable, nature, calme, fibre télétravail. Score composite calibré 2026.",
    intro:
      "Néo-ruraux : vous voulez quitter la métropole sans pour autant disparaître au fond d'un hameau sans connexion. La bonne cible, c'est la petite ou moyenne ville bien placée — celle où le loyer redevient soutenable, où la nature commence au bout de la rue, et où le calme tient sans couper la fibre ni l'épicerie. Ce classement pondère d'abord le coût et la nature, complète avec le calme sonore, garde un œil sur la qualité de vie et la connectivité télétravail, et laisse une marge pour le lien social — parce qu'une installation rurale qui se solde par l'isolement total tient rarement plus de deux ans. Résultat : peu de grandes métropoles, beaucoup de préfectures et de villes moyennes accessibles en train.",
    weights: { cost: 3.0, nature: 2.5, bruit: 2.0, life: 1.5, teletravail: 1.5, solitude: 1.0 },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
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
