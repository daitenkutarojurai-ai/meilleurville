// F19 — Pages "Pour qui" thématiques.
//
// 10 profils éditoriaux, chacun = recombinaison pondérée des axes seed +
// owner-scores. Top 20 villes par profil + intro/méthodo personnalisée.
// Aucune nouvelle donnée — pure recombinaison.

import type { CitySeed } from "@/data/cities-seed";
import type { CityLight } from "@/lib/cities-light";
import { HOUSING } from "@/data/housing";
import { computeOwnerScores } from "@/lib/owner-scores";
import { computeSportLeisure } from "@/lib/sport-leisure";
import { computeCyclingMobility } from "@/lib/cycling-mobility";
import { rentalTension } from "@/lib/rental-tension";
import { computeCityDistances } from "@/lib/distances";

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
  // Cluster composites (F70 sport, R8.2 tension, F57 vélo, dérivé investisseurs)
  sportLeisure: number;
  rentalTension: number;
  investorYield: number;
  cyclingMobility: number;
  // Dérivés géographiques
  coastalProximity: number;
  mountainProximity: number;
}>;

export interface ProfileDef {
  slug: string;
  emoji: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  weights: ScoreWeights;
  reasonHint: (city: CityLight) => string;
}

function ownerVal(city: CityLight, key: string): number {
  const s = computeOwnerScores(city as CitySeed);
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

// Rendement locatif brut estimé (T2 ~ 45 m²) sur 0-10.
// Yield % = (avgRentT2 × 12) / (45 × avgBuyPriceM2) × 100, normalisé linéairement
// 3 % → 0, 10 % → 10. Fallback (pas de HOUSING) : proxy coût + neutre.
// Pénalité de liquidité : un sous-30 k habitants implique pool locataires plus
// mince et revente plus longue — on déprécie le rendement brut affiché en
// conséquence (un 10 % théorique dans une ville de 12 k = 4,5 % effectif).
export function investorYield(city: CityLight): number {
  const h = HOUSING[city.slug];
  if (!h) {
    return Math.max(0, Math.min(10, (10 - city.scores.cost) * 0.6 + 2.5));
  }
  const yieldPct = (h.avgRentT2 * 12) / (45 * h.avgBuyPriceM2) * 100;
  const base = (yieldPct - 3) * (10 / 7);
  const pop = city.population ?? 0;
  const liquidity =
    pop < 20000 ? 0.45 :
    pop < 50000 ? 0.62 :
    pop < 100000 ? 0.85 : 1.0;
  return Math.max(0, Math.min(10, base * liquidity));
}

// Proximité littorale sur 0-10 : 0 km de la côte → 10 (les pieds dans l'eau),
// 20 km → ≈8 (accès quotidien facile), 60 km → ≈4 (le week-end oui, pas le
// mercredi soir), ≥ 200 km → 0 (intérieur profond). Le seuil visé est celui
// de la vie quotidienne littorale, pas d'un week-end occasionnel à la mer.
export function coastalProximity(city: CityLight): number {
  const dist = computeCityDistances(city as CitySeed);
  const km = dist.sea?.distanceKm;
  if (km == null) return 5;
  if (km <= 0) return 10;
  if (km >= 200) return 0;
  const raw = 10 - (km / 200) * 10;
  const eased = Math.sqrt(raw / 10) * 10;
  return Math.max(0, Math.min(10, eased));
}

// Proximité montagne sur 0-10. La distance retournée par `computeCityDistances`
// vise le centroïde bas d'un massif (porte d'entrée : Albertville, Gap, Lourdes,
// Clermont, Gérardmer, Lons, Corte) — donc « 0 km » = pied du massif, pas
// altitude d'un sommet. Une ville en montagne (Briançon, Gap, Font-Romeu-like)
// atteint le score maximum ; une ville à 30 km (Grenoble, Chambéry, Pau) reste
// dans la vie de massif au quotidien ; à 100 km on parle week-end, plus le
// mercredi soir ; à ≥250 km on sort de la géographie montagnarde (littoral,
// grand ouest, bassin parisien). L'easing en racine carrée pénalise plus tôt
// les distances moyennes — un massif à 80 km n'est pas « à moitié accessible ».
export function mountainProximity(city: CityLight): number {
  const dist = computeCityDistances(city as CitySeed);
  const km = dist.mountain?.distanceKm;
  if (km == null) return 5;
  if (km <= 0) return 10;
  if (km >= 250) return 0;
  const raw = 10 - (km / 250) * 10;
  const eased = Math.sqrt(raw / 10) * 10;
  return Math.max(0, Math.min(10, eased));
}

function getScoreValue(city: CityLight, key: string): number {
  // Axes seed
  if (["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"].includes(key)) {
    return city.scores[key as keyof typeof city.scores];
  }
  // Cluster composites
  if (key === "sportLeisure") return computeSportLeisure(city as CitySeed).composite;
  if (key === "rentalTension") return rentalTension(city);
  if (key === "investorYield") return investorYield(city);
  if (key === "cyclingMobility") return computeCyclingMobility(city).composite;
  if (key === "coastalProximity") return coastalProximity(city);
  if (key === "mountainProximity") return mountainProximity(city);
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
    slug: "jeunes-diplomes",
    emoji: "🎓",
    label: "Jeunes diplômés (20-26 ans)",
    metaTitle: "Meilleures villes jeunes diplômés 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes pour un premier poste après le diplôme : loyer compatible avec salaire d'entrée, densité jeune actif pour le réseau, transports, culture. 2026.",
    intro:
      "Jeunes diplômés : la fenêtre 20-26 ans, juste après le master ou l'école, premier CDI ou première alternance longue, premier vrai loyer hors résidence étudiante ou hors logement parental. La situation n'a presque rien à voir avec celle d'un étudiant Crous (qui pèse sur une bourse, un loyer subventionné et un emploi du temps universitaire) ni avec celle d'un jeune actif installé 28-35 (qui négocie sa première augmentation et envisage parfois un premier achat). Ici on entre dans la vie salariée avec un revenu d'entrée — 1 700 à 2 200 € net pour un bac+5 hors finance/conseil (Apec 2024), parfois moins — et zéro épargne accumulée. Le premier loyer hors campus est souvent un T1 ou une colocation, et la marge entre revenu et reste à vivre est étroite. Le coût d'abord, parce qu'à ce niveau de salaire un loyer parisien à 950 € absorbe la moitié du net, tandis qu'un T1 lyonnais ou bordelais à 600 € libère deux fois plus de marge pour le reste — sortir, voyager, rembourser le prêt étudiant, commencer à épargner. La densité de jeunes actifs ensuite, parce qu'à 22 ans on quitte le réseau étudiant constitué en cinq ans et qu'il faut tout reconstruire — collègues bien sûr, mais aussi colocataires, amis de soirée, partenaires de sport, premières relations amoureuses sérieuses : une ville où la tranche 25-35 est représentée massivement (Toulouse, Montpellier, Lyon, Bordeaux) intègre vite, une ville vieillissante isole. La culture pour la même raison — bars, salles de concert, cinémas indé, festivals, scènes ouvertes — c'est l'infrastructure de la vie sociale post-études. Les transports parce que le permis B coûte 1 300 € en moyenne, une voiture d'occasion 5 000 € minimum plus assurance et essence : à l'entrée de carrière la voiture est très souvent reportée, donc tram-métro-bus-vélo doivent suffire pour aller au travail et sortir. Le télétravail et la qualité de vie complètent — les premiers postes intègrent de plus en plus l'hybride (deux à trois jours bureau, le reste télétravail), et une ville agréable au quotidien quand on y passe ses cinq premières années d'adulte compte plus que la performance pure d'une métropole tendue. Ce classement pondère le coût comme premier critère, à parité quasi avec la densité jeune actif, complète par la culture, les transports, le télétravail, la qualité de vie générale et la praticabilité sans voiture. Résultat : un palmarès qui privilégie les grandes capitales étudiantes du Sud-Ouest et de l'Ouest (Toulouse, Bordeaux, Rennes, Nantes, Montpellier), les métropoles régionales équilibrées (Lyon, Strasbourg, Lille), plusieurs préfectures universitaires sous-cotées (Grenoble, Angers, Reims), et systématiquement décote pour Paris (premier loyer écrase tout le reste à ce niveau de salaire — Paris devient un choix possible une fois la première augmentation passée, pas dès la sortie de l'école).",
    weights: {
      cost: 2.5,
      jeuneActif: 2.0,
      culture: 1.5,
      transport: 1.5,
      remoteWork: 1.0,
      life: 1.0,
      sansVoiture: 0.5,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
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
  {
    slug: "anti-canicule",
    emoji: "🧊",
    label: "Anti-canicule",
    metaTitle: "Meilleures villes anti-canicule 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises où l'été reste vivable : étés tempérés, air respirable, nature accessible. Pour les personnes sensibles à la chaleur.",
    intro:
      "Anti-canicule : la décennie à venir verra les étés français devenir plus longs, plus secs et plus suffocants. Choisir aujourd'hui une ville fraîche n'est plus une lubie de retraité, c'est une stratégie de santé pour les asthmatiques, les seniors, les jeunes enfants et toute personne qui supporte mal les pics au-delà de 32 °C. Le critère qui domine, c'est la résistance climatique — dérivée des températures moyennes de juillet et du potentiel de canicule projeté à 2040. On ajoute une qualité de l'air correcte (les pics d'ozone s'aggravent dans le sud), de la nature accessible pour respirer hors des îlots de chaleur urbains, et une qualité de vie générale qui ne s'effondre pas l'été. Résultat : un classement dominé par les façades atlantique et nord, le piémont alpin et les villes d'altitude — les zones qui resteront vivables même après dix années de réchauffement supplémentaires.",
    weights: { canicule: 3.0, qualiteAir: 2.0, nature: 1.5, life: 1.5, safety: 1.0 },
    reasonHint: (c) =>
      `Juillet ${(c.avgTempJuly ?? 23).toFixed(1)} °C · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
  },
  {
    slug: "sensibles-au-bruit",
    emoji: "🤫",
    label: "Sensibles au bruit",
    metaTitle: "Meilleures villes pour sensibles au bruit 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises où le calme tient toute la journée : faible exposition sonore, nature accessible, air respirable. Pour hypersensibles et télétravail.",
    intro:
      "Sensibles au bruit : la circulation continue, les terrasses ouvertes tard, les sirènes nocturnes, l'école juste sous les fenêtres — autant de petits stimuli qui usent sur la durée. Pour qui supporte mal l'exposition sonore quotidienne — hypersensibles, hyperacousie, jeunes parents en gestion de nourrisson, télétravailleurs enchaînant les visios — le critère cardinal n'est ni le dynamisme culturel ni la sécurité, c'est le bruit ambiant moyen. Ce classement pondère d'abord l'exposition sonore (dérivée des cartes de bruit stratégiques d'agglomération et de la densité du trafic), complète par une nature proche pour décompresser hors des îlots sonores urbains, garde un œil sur la qualité de l'air (bruit routier et particules fines vont souvent ensemble) et sur la qualité de vie générale — parce qu'une rue silencieuse au fond d'un désert de services tient rarement plus de six mois. Résultat : beaucoup de préfectures moyennes et de villes côtières atlantiques, peu de grandes métropoles, et zéro ville traversée par une autoroute ou un axe TGV non protégé.",
    weights: { bruit: 3.0, nature: 2.0, qualiteAir: 1.5, life: 1.5, safety: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "asthmatiques-allergiques",
    emoji: "🌬️",
    label: "Asthmatiques et allergiques",
    metaTitle: "Meilleures villes pour asthmatiques et allergiques 2026",
    metaDescription:
      "Top 20 villes françaises où l'air respire et les crises s'espacent : air propre, étés tempérés, nature non saturée de pollens. Asthme, rhinite, allergies.",
    intro:
      "Asthmatiques et allergiques : les déclencheurs s'enchaînent vite — particules fines et NO₂ près des grands axes, pics d'ozone l'été, pollens d'arbres dès mars (bouleau, cyprès), graminées en juin, ambroisie dès août dans le couloir rhodanien. Pour qui souffre d'un système respiratoire ou immunitaire fragile, choisir une ville devient un arbitrage de santé publique avant d'être un arbitrage de cadre de vie. Ce classement pondère d'abord la qualité de l'air ambiante (dérivée des stations ATMO et des données Lcsqa par agglomération), ajoute le potentiel anti-canicule (la chaleur concentre l'ozone et déclenche les crises), garde une nature accessible mais pas dominée par les sources polliniques sensibilisantes, et tient compte du bruit ambiant — facteur de stress chronique qui aggrave l'asthme. Résultat : un palmarès tiré par les façades atlantique et nord, le piémont alpin et les villes ventées de Bretagne ou du Cotentin, où le brassage d'air maintient l'indice ATMO en zone « bon » la majorité de l'année. Les grandes plaines céréalières, le couloir rhodanien (ambroisie) et les agglomérations enclavées sortent du top.",
    weights: { qualiteAir: 3.0, canicule: 2.0, nature: 1.5, bruit: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "jeunes-parents",
    emoji: "🍼",
    label: "Jeunes parents (0-3 ans)",
    metaTitle: "Meilleures villes pour jeunes parents 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour jeunes parents avec un enfant 0-3 ans : air respirable, sécurité poussette, parcs accessibles, coût soutenable, services petite enfance. Calibré 2026.",
    intro:
      "Jeunes parents : un enfant de 0-3 ans, ce n'est pas la même équation qu'une famille avec un collégien. L'école attendra encore quatre ans ; ce qui compte immédiatement, c'est la qualité de l'air que respirent des poumons en formation, la sécurité d'un trottoir où la poussette tient sans gêner personne, des parcs accessibles à pied pour la balade quotidienne, un loyer ou une mensualité qui résiste à un congé parental ou à un passage temporaire à un seul revenu, et le calme ambiant qui ne réveille pas systématiquement la sieste. La densité de crèches, de PMI et de pédiatres conventionnés pèse aussi lourd que les écoles dans les classements concurrents — mais reste plus difficile à mesurer ville par ville. Ce classement pondère d'abord la sécurité globale et la nature accessible (parcs urbains et premier rang d'arbres), ajoute une qualité de l'air sérieuse, intègre les services famille agrégés (crèches, ludothèques, PMI proxy) et le calme sonore, et garde une marge sur le coût — parce qu'une fenêtre de un à trois ans à 100 % du loyer plus 600 €/mois de crèche réduit toute la marge financière du foyer. Résultat : peu de très grandes métropoles centrales (air dégradé, espaces verts saturés, trottoirs étroits), beaucoup de villes moyennes côtières ou de couronnes pavillonnaires bien équipées en services petite enfance.",
    weights: {
      safety: 2.0,
      nature: 2.0,
      qualiteAir: 2.0,
      famille: 2.0,
      bruit: 1.5,
      cost: 1.5,
      life: 1.0,
      transport: 1.0,
    },
    reasonHint: (c) =>
      `Sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "investisseurs-locatifs",
    emoji: "🏘️",
    label: "Investisseurs locatifs",
    metaTitle: "Meilleures villes investissement locatif 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour investir en locatif : rendement brut estimé, tension de marché, demande jeunes actifs, sécurité de l'actif. Calibré 2026.",
    intro:
      "Investisseurs locatifs : votre arbitrage ne se joue pas comme celui d'un primo-accédant. Vous ne choisissez pas la ville où vous voulez vivre, vous choisissez celle qui dégage le meilleur rendement net une fois la fiscalité passée, sans rogner sur les fondamentaux qui protègent l'actif à dix ans. Le triangle qui compte vraiment, c'est rendement brut (loyer annuel rapporté au prix d'acquisition), tension de marché (un appartement qui se reloue en quinze jours et pas en trois mois) et qualité de la demande locative (bassin de jeunes actifs, de cadres en télétravail et d'étudiants qui paient à l'heure). Le rendement seul, sans demande, c'est une vacance locative qui ronge la rentabilité ; la tension seule, sans rendement, c'est un cash-flow négatif qui ne tient que par l'espoir de la plus-value. Ce classement pondère d'abord le rendement brut estimé sur un T2 — dérivé du loyer médian T2 et du prix m² appartement par ville — complète par l'indicateur de tension de marché, intègre le poids démographique des 25-35 ans (premier bassin de locataires français), garde un œil sur la couverture fibre et la part de cadres (qui tirent le loyer vers le haut), et ne sacrifie pas la sécurité de l'actif. Résultat : peu de grandes métropoles ultra-tendues comme Paris ou Lyon (rendement effondré sous 4 %), beaucoup de villes moyennes industrielles ou universitaires en reconversion où l'on trouve encore du 7-9 % brut avec une demande locale solide.",
    weights: {
      investorYield: 2.5,
      rentalTension: 2.0,
      jeuneActif: 1.5,
      teletravail: 0.8,
      safety: 0.5,
      remoteWork: 0.5,
    },
    reasonHint: (c) => {
      const h = HOUSING[c.slug];
      if (h) {
        const y = (h.avgRentT2 * 12) / (45 * h.avgBuyPriceM2) * 100;
        return `Rendement brut ~ ${y.toFixed(1)} % · T2 ${h.avgRentT2} € · m² ${h.avgBuyPriceM2} €`;
      }
      return `Coût ${c.scores.cost.toFixed(1)} · tension ${rentalTension(c).toFixed(1)} · jeunes actifs ${c.scores.life.toFixed(1)}`;
    },
  },
  {
    slug: "familles-avec-ados",
    emoji: "🎒",
    label: "Familles avec ados (12-17 ans)",
    metaTitle: "Meilleures villes familles avec ados 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour familles avec adolescents 12-17 ans : lycée, transport autonomie ado, sécurité nocturne, scène culturelle, espaces pour s'aérer. Calibré 2026.",
    intro:
      "Familles avec ados : un adolescent de 12-17 ans, ce n'est ni l'enfant scolarisé en primaire couvert par familles avec enfants, ni le nourrisson de jeunes parents. Ce qui change brutalement à l'adolescence, c'est l'autonomie : votre ado rentre seul du lycée, traverse la ville pour son sport ou son club, sort le soir en groupe au cinéma ou au concert, prend les transports pour ses amis. La qualité du lycée pèse plus que celle du primaire — l'orientation post-bac se joue dès la seconde. La sécurité nocturne devient un vrai critère, plus une abstraction : un retour de l'arrêt de bus à 22 h en hiver n'a pas la même tête à Annecy qu'à Aubervilliers. La densité culturelle se met à compter — cinéma, salle de concert, club sportif fédéré, médiathèque ouverte le samedi — parce qu'un ado qui s'ennuie est un ado qui s'isole. Le réseau de transport en commun fait la différence entre un parent-taxi épuisé et un ado autonome. Ce classement pondère d'abord les transports et la sécurité, intègre lourdement la sécurité nocturne et l'offre culturelle, garde le poids des établissements scolaires (lycée + supérieur de proximité) et ajoute la vitalité jeune-actif — les ados ont besoin d'une ville qui ne se vide pas le soir. La nature reste utile pour les week-ends, mais moins centrale qu'à l'âge primaire. Résultat : un palmarès tiré par les villes universitaires moyennes bien desservies, les métropoles régionales équilibrées, et beaucoup moins par les petites communes isolées où l'autonomie de l'ado se résume à la voiture des parents.",
    weights: {
      transport: 2.0,
      schools: 2.0,
      securiteNocturne: 1.5,
      safety: 1.5,
      culture: 1.5,
      jeuneActif: 1.0,
      famille: 1.0,
      life: 1.0,
      nature: 0.5,
    },
    reasonHint: (c) =>
      `Transport ${c.scores.transport.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "sportifs",
    emoji: "🏋️",
    label: "Sportifs réguliers",
    metaTitle: "Meilleures villes pour sportifs 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour pratiquants réguliers : équipements (piscines, gymnases, salles), clubs, cadre outdoor, climat propice. Calibré 2026.",
    intro:
      "Sportifs réguliers : votre semaine se construit autour de la pratique — l'entraînement du mardi soir au gymnase, la sortie longue du dimanche, la piscine deux fois par semaine, le club de tennis qui reprend en mars. Ce profil n'est pas celui du randonneur du dimanche déjà couvert par les amateurs de plein air. Le critère qui domine, c'est la densité d'équipements municipaux ouverts jusqu'à 22 h, le maillage des fédérations agréées Jeunesse & Sport qui ouvrent un vrai créneau adulte, et un climat qui ne réduit pas la pratique à trois mois par an. Ce classement pondère d'abord le composite sport et loisirs (équipements + clubs + outdoor + climat) dérivé du Recensement des Équipements Sportifs INJEP et des données fédérales, complète avec la nature accessible pour les sorties trail, vélo et rando, garde un œil sur le confort climatique d'été et d'hiver, et la qualité de vie générale — parce qu'une ville bien équipée mais vidée le soir tient rarement les pratiquants au-delà de deux saisons. Résultat : un palmarès tiré par les grandes métropoles dotées (Lyon, Bordeaux, Nantes, Toulouse), les pôles d'excellence sportive (Annecy, Chambéry, Antibes, Grenoble, Talence, Vichy) et plusieurs villes moyennes au tissu associatif dense — peu de petites communes rurales et zéro département en déprise.",
    weights: {
      sportLeisure: 3.0,
      nature: 1.5,
      life: 1.0,
      canicule: 1.0,
      jeuneActif: 0.5,
    },
    reasonHint: (c) =>
      `Sport ${computeSportLeisure(c as CitySeed).composite.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
  },
  {
    slug: "proches-aidants",
    emoji: "🤝",
    label: "Proches aidants",
    metaTitle: "Meilleures villes proches aidants 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises adaptées aux proches aidants : sécurité, calme, tissu médico-social, coût maîtrisé, transports vers l'hôpital. Calibré 2026.",
    intro:
      "Proches aidants : selon la DREES, près de 11 millions de personnes en France accompagnent au quotidien un parent âgé, un conjoint malade, un enfant en situation de handicap ou un proche en perte d'autonomie. Ce rôle, souvent invisible, pèse sur la santé mentale, la carrière et le budget — et choisir sa ville quand on est aidant relève d'arbitrages très différents de ceux d'un actif sans charge ou d'un retraité standard. Le critère qui domine, c'est l'accès à un cadre apaisé qui ne rajoute pas une couche de stress aux trajets répétés vers l'EHPAD, la clinique ou le cabinet de soins infirmiers. La sécurité diurne et nocturne pèsent lourd : une visite tardive ou un retour de garde à 22 h n'a pas la même tension dans une commune calme qu'en pleine zone tendue. Le tissu social familial fait la différence entre un aidant qui tient quinze ans et un aidant qui craque en deux — haltes-répit, accueils de jour, plateformes d'accompagnement et associations locales soutiennent dans la durée. Le coût de la vie compte plus qu'à l'ordinaire, parce qu'aider un proche, c'est très souvent réduire son temps de travail (passage à 80 %, congé proche aidant indemnisé environ 65 €/jour, abandon temporaire d'activité), donc encaisser une baisse de revenus durable. Le bruit et la qualité de vie générale comptent parce que le sommeil de l'aidant est déjà fragmenté par les sollicitations, et qu'une ville bruyante achève l'épuisement. Ce classement pondère d'abord la sécurité et le tissu familial, complète par la qualité de vie, la sécurité nocturne, la maîtrise des coûts, la maîtrise du bruit et l'accessibilité en transports en commun pour les trajets domicile-soin sans dépendre de la voiture. Résultat : un palmarès qui privilégie les villes moyennes au tissu associatif dense et les chefs-lieux de département dotés d'un hôpital de proximité, beaucoup moins les hyper-centres tendus ou les communes isolées sans services médico-sociaux.",
    weights: {
      safety: 2.0,
      famille: 1.5,
      life: 1.5,
      securiteNocturne: 1.5,
      cost: 1.5,
      bruit: 1.0,
      transport: 1.0,
      solitude: 0.5,
    },
    reasonHint: (c) =>
      `Sécurité ${c.scores.safety.toFixed(1)} · vie ${c.scores.life.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "futurs-retraites",
    emoji: "🧭",
    label: "Futurs retraités (55-65 ans)",
    metaTitle: "Meilleures villes futurs retraités 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour préparer sa retraite (55-65 ans) : coût maîtrisé, santé future, climat tempéré, transports, qualité de vie. Calibré 2026.",
    intro:
      "Futurs retraités (55-65 ans) : la phase où vous préparez le grand virage. Vous travaillez encore, votre revenu est encore à son maximum, mais vous savez que dans cinq ou dix ans la pension va remplacer le salaire — souvent avec 25 à 40 % de moins selon la trajectoire de carrière (cadres COR 2024, salariés du privé estimation DREES). C'est la fenêtre où le bon choix de ville coûte le moins cher et rapporte le plus. Vendre une résidence principale chère en zone tendue pour acheter plus modeste dans une ville mieux dimensionnée libère une plus-value qui peut financer dix à quinze ans de revenus complémentaires — et anticiper l'installation avant que la santé ne dicte le calendrier, c'est garder la main sur le choix. L'arbitrage est sensiblement différent du profil « retraités » (déjà installés, pension fixe, immobilier amorti, axes prioritaires santé et qualité de vie immédiate) : ici vous êtes encore mobiles, encore actifs, encore en train d'optimiser pour deux temporalités à la fois — le présent salarié et le futur retraité. Le coût d'abord, parce que vous préparez une baisse de revenu durable : une ville où le panier loyer-énergie-vie courante est inférieur à votre métropole actuelle libère immédiatement de la marge pour la suite, et un prix m² accessible permet de monétiser l'écart à l'achat. La qualité de vie générale ensuite, parce que vous serez là chaque jour pendant trente ans, et l'écart entre une ville agréable et une ville fonctionnelle s'élargit avec le temps. La sécurité et la sécurité nocturne montent dans la hiérarchie parce que la perception du risque change après 55 ans — on sort plus prudemment, on évite certaines zones, on veut un environnement quotidien qui n'ajoute pas de stress de fond. La résistance canicule devient un critère qu'on ne pèse pas à 35 ans mais qu'on pèse à 60 (canicule 2003, 2022, 2023 — la surmortalité s'envole au-delà de 65 ans). La qualité de l'air pour la même raison — exposition cumulée et capacité respiratoire qui décline progressivement. Les transports en commun pèsent à cet âge parce qu'à 75 ans la voiture n'est plus une option fiable, et qu'installer son foyer sur une ligne TER ou un réseau urbain dense, c'est garder son autonomie une décennie plus longtemps. Ce classement pondère le coût comme premier critère, à parité avec la qualité de vie, complète par la sécurité diurne et nocturne, la résistance canicule, la qualité de l'air, l'accessibilité en transports et la maîtrise du bruit (le sommeil se dégrade physiologiquement après 55 ans — une ville calme prolonge la santé). Résultat : un palmarès qui privilégie les villes moyennes au tissu hospitalier solide (chefs-lieux régionaux dotés d'un CHU ou hôpital intercommunal), les villes intermédiaires bien desservies à coût accessible, et plusieurs côtes atlantiques ou intérieurs tempérés où on peut vendre la maison parisienne pour acheter plus modeste sans perdre en services. Logique : si vous avez déjà 70 ans et que vous êtes installés depuis longtemps, regardez le profil « retraités » ; si vous êtes à cinq ou dix ans de l'arrêt et que vous envisagez le déménagement, ce classement-ci est calibré pour vous.",
    weights: {
      cost: 2.0,
      life: 2.0,
      safety: 1.5,
      canicule: 1.5,
      qualiteAir: 1.5,
      transport: 1.5,
      securiteNocturne: 1.0,
      bruit: 1.0,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "cyclistes-urbains",
    emoji: "🚴",
    label: "Cyclistes urbains",
    metaTitle: "Meilleures villes pour cyclistes urbains 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises où vivre à vélo au quotidien : réseau cyclable continu, relief praticable, sécurité, climat. Calibré sur le baromètre FUB et Géovélo 2026.",
    intro:
      "Cyclistes urbains : votre arbitrage ne ressemble ni à celui d'un sportif de salle ni à celui d'un randonneur du dimanche. Le vélo n'est ni un loisir occasionnel ni une discipline d'entraînement : c'est votre mode de transport principal, six à sept jours sur sept, pour le travail, les courses, l'école des enfants, les sorties du soir, parfois 4 000 à 6 000 kilomètres par an. Ce profil se différencie nettement de « sans voiture » (qui pondère le réseau multimodal tram-métro-bus-vélo et donne le même poids à un usager exclusif des transports en commun), de « sportifs réguliers » (axé sur les équipements indoor et les clubs fédérés) et d'« amateurs de plein air » (la nature brute du week-end). Ici on s'intéresse uniquement à la praticabilité du vélo au quotidien — et les villes ne se valent vraiment pas. Le critère cardinal, c'est la continuité du réseau cyclable, mesurée par le composite F57 dérivé du baromètre FUB (Fédération des Usagers de la Bicyclette, parlons-velo.fr), de Géovélo et de la cartographie OSM : une ville qui aligne 200 à 500 km d'aménagements sécurisés financés à plus de 50 €/habitant/an (Strasbourg, Grenoble, Rennes, Nantes, Bordeaux, La Rochelle, Chambéry, Annecy) tient un usager quotidien dix fois plus longtemps qu'une métropole où il faut alterner trottoir, piste interrompue et boulevard à quatre voies. Le relief compte presque autant — pédaler 3 km sur du plat versus 3 km avec 80 m de dénivelé positif, ce n'est pas le même effort matin et soir, et le vélo électrique ne lève qu'une partie de la contrainte. La sécurité réelle (accidentologie, séparation des flux, sas vélo, double sens cyclable, limitations à 30 km/h en centre) fait la différence entre une pratique tranquille et un stress de chaque trajet — un point particulièrement sensible pour les parents avec siège enfant ou pour les jeunes adultes qui débutent. Le climat enfin — un nombre de jours pluvieux trop élevé ou des étés caniculaires concentrent la pratique sur quelques mois et fatiguent même les plus motivés. Ce classement pondère lourdement le composite cyclabilité F57, complète par le score sans voiture (un cycliste utilise aussi les transports en commun par mauvais temps ou pour les déplacements longs), ajoute le transport général, la qualité de l'air (vous respirez ce que vous traversez à pleine ventilation pulmonaire), la nature pour les sorties dominicales, et garde un œil sur la qualité de vie et la sécurité globale. Résultat : un palmarès tiré par les championnes du baromètre FUB (Strasbourg historiquement n° 1, Grenoble pour le réseau et la planéité, Rennes pour la cohérence métropolitaine, Bordeaux pour la continuité depuis la rénovation des quais), plusieurs villes moyennes pionnières (La Rochelle berceau du vélo libre-service en 1976, Chambéry, Annecy, Versailles, Caen, Lorient), les villes traversées par une EuroVelo majeure (Saumur, Amboise, Chinon sur la Loire à vélo, Royan sur la Vélodyssée, Bayonne–Anglet–Biarritz sur la Vélodyssée et le Vélo Maritime Sud), et logiquement peu de communes du relief sévère, des centres-villes saturés sans plan vélo ou des banlieues pavillonnaires non maillées.",
    weights: {
      cyclingMobility: 3.0,
      sansVoiture: 1.5,
      transport: 1.0,
      qualiteAir: 1.0,
      nature: 1.0,
      safety: 0.5,
      life: 0.5,
    },
    reasonHint: (c) =>
      `Cyclabilité ${computeCyclingMobility(c).composite.toFixed(1)} · transport ${c.scores.transport.toFixed(1)} · sans voiture ${ownerVal(c, "sansVoiture").toFixed(1)}`,
  },
  {
    slug: "amateurs-de-littoral",
    emoji: "🌊",
    label: "Amateurs de littoral",
    metaTitle: "Meilleures villes littoral 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour vivre au bord de la mer : accès quotidien, cadre marin, qualité de vie, air marin. Manche, Atlantique, Méditerranée.",
    intro:
      "Amateurs de littoral : votre semaine ne s'organise pas comme celle d'un citadin de l'intérieur. La proximité de la mer n'est pas un plaisir de vacances mais une composante de la vie quotidienne — un footing sur le sable à sept heures, un plongeon en rentrant du bureau en juin, la ligne d'horizon depuis la fenêtre ou depuis la terrasse d'un café, l'odeur d'iode qui remplace celle des gaz d'échappement, un dimanche d'huîtres au port de pêche plutôt qu'au centre commercial. Ce profil se distingue nettement d'« amateurs de plein air » (qui pondère la nature au sens large — forêts, sentiers, parcs — et le climat tempéré) et d'« anti-canicule » (qui cherche des étés vivables sans se soucier de la géographie côtière). Ici on ne demande pas seulement de la nature accessible : on demande de la mer accessible, tous les jours, en quinze minutes à pied ou à vélo, pas en une heure de voiture le samedi. La différence a des conséquences très concrètes sur le tissu urbain — architecture ouverte sur l'eau, marché aux poissons, clubs nautiques, écoles de voile, cabanes d'ostréiculteurs, criques et calanques, plages surveillées l'été, digues et jetées où l'on marche l'hiver — et sur la vie sociale, souvent tirée par les activités maritimes de saison douce. Ce classement pondère d'abord la proximité littorale, dérivée pour chaque ville de la distance haversine à la côte la plus proche parmi les trois façades françaises (Manche, Atlantique, Méditerranée) : une ville à moins de trois kilomètres du rivage tient un score maximal, une ville à vingt kilomètres reste dans la vie littorale au sens large (accès quotidien facile en été et en week-end), une ville à plus de deux cents kilomètres bascule dans la géographie intérieure et sort du classement. On complète par la nature globale (parce qu'un littoral bétonné sans arrière-pays vert perd la moitié de son intérêt), par la qualité de l'air (les brises marines nettoient les particules mais la proximité industrialo-portuaire peut inverser la logique), par la qualité de vie générale, par la sécurité, par la résistance canicule (les étés atlantiques restent plus tempérés que les étés méditerranéens, l'écart entre 27 °C à La Rochelle et 34 °C à Perpignan pèse pour qui vit toute l'année sur place et pas seulement pour trois semaines en août), et par les transports pour ne pas isoler la vie littorale du reste. Résultat : un palmarès tiré par les stations balnéaires atlantiques équilibrées (La Rochelle, Saint-Malo, Vannes, Lorient, Arcachon, Biarritz, Anglet, Bayonne), plusieurs villes méditerranéennes bien situées (Cassis, Menton, Antibes, Cagnes-sur-Mer, Sète), quelques préfectures maritimes bretonnes ou normandes sous-cotées, et systématiquement en retrait les grandes métropoles intérieures — même très agréables (Toulouse, Lyon, Bordeaux ville-centre à cinquante kilomètres du Bassin d'Arcachon), elles ne remplissent pas le contrat de la vie littorale quotidienne.",
    weights: {
      coastalProximity: 3.0,
      nature: 1.5,
      qualiteAir: 1.5,
      life: 1.5,
      safety: 1.0,
      canicule: 1.0,
      transport: 0.5,
    },
    reasonHint: (c) => {
      const km = computeCityDistances(c as CitySeed).sea?.distanceKm;
      const kmLabel = km == null
        ? "distance mer non renseignée"
        : km <= 3
          ? "front de mer"
          : `${Math.round(km)} km de la mer`;
      return `${kmLabel} · nature ${c.scores.nature.toFixed(1)} · vie ${c.scores.life.toFixed(1)}`;
    },
  },
  {
    slug: "amateurs-de-montagne",
    emoji: "🏔️",
    label: "Amateurs de montagne",
    metaTitle: "Meilleures villes montagne 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour vivre en montagne : accès quotidien au relief, cadre alpin, air pur, étés frais. Alpes, Pyrénées, Massif central, Jura, Vosges.",
    intro:
      "Amateurs de montagne : votre semaine ne s'organise pas comme celle d'un citadin d'intérieur, ni comme celle d'un amoureux du littoral. La proximité du relief n'est pas un plaisir de vacances mais une composante quotidienne — le sentier qui commence au bout du parking, la vue sur les crêtes depuis la fenêtre du salon, le club d'escalade ouvert le mardi soir, le vélo de route qui grimpe un col avant le petit-déjeuner, la neige qu'on prend à trente minutes de voiture en janvier plutôt qu'à cinq heures de train un week-end sur deux. Ce profil se distingue nettement d'« amateurs de plein air » (qui pondère la nature au sens large — forêts, sentiers, parcs, plaine ou moyenne montagne indifféremment) et d'« amateurs de littoral » (qui vise la mer accessible tous les jours). Ici on ne demande pas seulement de la nature accessible : on demande du relief accessible, avec ce qu'il implique de spécifique — dénivelé pour la rando et le vélo, altitude pour la fraîcheur estivale et l'enneigement hivernal, roche pour l'escalade et les via ferrata, sentiers balisés maillés à haute densité (FFRandonnée compte plus de 100 000 kilomètres de GR et GRP en France, très inégalement répartis), clubs alpins historiquement enracinés (le Club Alpin Français a été fondé à Grenoble en 1874), et une culture locale qui parle refuge, station, saison, bulletin météo montagne et niveau nivologique BRA comme les autres villes parlent shopping ou terrasses. Ce classement pondère d'abord la proximité montagne, dérivée pour chaque ville de la distance haversine à la porte d'entrée du massif le plus proche parmi les grands massifs français (Alpes du Nord via Albertville, Alpes du Sud via Gap, Pyrénées via Lourdes, Massif Central via Clermont-Ferrand, Vosges via Gérardmer, Jura via Lons-le-Saunier, Massif corse via Corte) : une ville au pied d'un massif tient le score maximal, une ville à trente kilomètres reste dans la vie de massif au quotidien (skier après le boulot en semaine reste faisable, la sortie du dimanche l'est toujours), une ville à cent kilomètres bascule dans une géographie de week-end régulier, une ville au-delà de deux cent cinquante kilomètres sort du cadre. On complète par la nature globale (parce qu'un piémont sans forêt ni rivières perd la moitié de son intérêt), par la résistance canicule — l'altitude modère naturellement les étés et un pratiquant de montagne peut légitimement ne pas vouloir subir quarante degrés à la belle saison en plaine, l'écart entre vingt-deux degrés à Chambéry et trente-quatre à Perpignan pèse pour qui vit là toute l'année. On garde la qualité de l'air (les stations d'altitude affichent des ATMO systématiquement meilleurs que le fond de vallée voisin, avec une nuance importante pour les villes de fond de vallée elle-même — Grenoble, Chambéry, Annemasse — soumises aux inversions thermiques hivernales qui piègent particules et NO₂), on intègre la qualité de vie générale pour ne pas se retrouver dans une bourgade isolée sans services, on regarde la sécurité et on garde une marge pour les transports — parce que vivre en montagne sans desserte ferroviaire ni route dégagée l'hiver isole vite. Résultat : un palmarès tiré par les capitales alpines classiques (Grenoble, Chambéry, Annecy, tirées par leur position entre Chartreuse, Bauges, Belledonne, Vercors et Aravis), les préfectures des Hautes-Alpes et Alpes-de-Haute-Provence (Gap, Briançon, Digne-les-Bains, Manosque), les portes des Pyrénées (Pau, Tarbes, Lourdes, Foix), plusieurs villes du Massif Central proches d'un vrai relief (Clermont-Ferrand aux pieds des Puys, Aurillac au coeur du Cantal, Le Puy-en-Velay sur les monts du Velay), les Vosges et le Jura pour les massifs moyens du Grand Est (Épinal, Vesoul, Pontarlier, Lons-le-Saunier), et systématiquement en retrait — même très agréables par ailleurs — les grandes métropoles de plaine (Nantes, Bordeaux, Lille, Rennes, Reims), la façade littorale pure et le bassin parisien, qui ne remplissent pas le contrat de la vie de massif au quotidien.",
    weights: {
      mountainProximity: 3.0,
      nature: 1.5,
      canicule: 1.5,
      life: 1.5,
      qualiteAir: 1.0,
      safety: 1.0,
      transport: 0.5,
    },
    reasonHint: (c) => {
      const km = computeCityDistances(c as CitySeed).mountain?.distanceKm;
      const kmLabel = km == null
        ? "distance massif non renseignée"
        : km <= 3
          ? "au pied du massif"
          : `${Math.round(km)} km du massif`;
      return `${kmLabel} · nature ${c.scores.nature.toFixed(1)} · vie ${c.scores.life.toFixed(1)}`;
    },
  },
];

export const PROFILE_SLUGS = PROFILE_PAGES.map((p) => p.slug);

export interface ProfileMatch {
  city: CityLight;
  score: number;
  reason: string;
}

export function rankByProfile(profile: ProfileDef, cities: CityLight[], limit = 20): ProfileMatch[] {
  const totalWeight = Object.values(profile.weights).reduce<number>((s, v) => s + (v ?? 0), 0);
  const rows: ProfileMatch[] = cities.map((city) => {
    let weightedSum = 0;
    for (const [key, weight] of Object.entries(profile.weights)) {
      if (weight == null) continue;
      weightedSum += getScoreValue(city, key) * weight;
    }
    const score = totalWeight > 0 ? weightedSum / totalWeight : 5;
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
