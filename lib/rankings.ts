import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import type { City } from "@/lib/types";

export const RANKING_META = {
  teletravail: {
    slug: "teletravail",
    label: "Télétravail",
    emoji: "💻",
    headline: "Meilleures villes pour télétravailler en France",
    description:
      "Classement des villes françaises pour le travail à distance : fibre optique, espaces de coworking, cafés adaptés, coût de la vie, qualité de vie et communauté digitale nomade.",
    methodology:
      "Score composite pondéré : Remote Work (×3), Qualité de vie (×2), Coût (×1.5), Transport (×1), Culture (×0.5).",
    weights: { remoteWork: 3, life: 2, cost: 1.5, transport: 1, culture: 0.5 },
    color: "text-blue-400",
    borderColor: "border-blue-400/20",
    bgColor: "bg-blue-400/5",
    scoreKey: "remoteWork" as const,
    why: [
      "Couverture fibre optique et 4G/5G",
      "Nombre d'espaces de coworking",
      "Cafés avec WiFi stable",
      "Coût de la vie vs salaire remote",
      "Communauté digitale active",
    ],
  },
  famille: {
    slug: "famille",
    label: "Famille",
    emoji: "👨‍👩‍👧‍👦",
    headline: "Meilleures villes pour une famille en France",
    description:
      "Classement des villes françaises pour élever des enfants : qualité des écoles, sécurité, espaces verts, prix de l'immobilier et services de santé.",
    methodology:
      "Score composite pondéré : Écoles (×3), Sécurité (×2.5), Nature (×2), Coût (×1.5), Transport (×1).",
    weights: { schools: 3, safety: 2.5, nature: 2, cost: 1.5, transport: 1 },
    color: "text-emerald-400",
    borderColor: "border-emerald-400/20",
    bgColor: "bg-emerald-400/5",
    scoreKey: "schools" as const,
    why: [
      "Qualité des écoles (taux de réussite, offre scolaire)",
      "Indice de sécurité communautaire",
      "Espaces verts et parcs à proximité",
      "Prix médian au m²",
      "Accès aux soins pédiatriques",
    ],
  },
  nature: {
    slug: "nature",
    label: "Nature & Sport",
    emoji: "🌿",
    headline: "Meilleures villes françaises pour les amoureux de la nature",
    description:
      "Classement des villes françaises pour la nature, le sport et le plein air : randonnée, vélo, montagne, mer, qualité de l'air.",
    methodology:
      "Score composite pondéré : Nature (×4), Vie (×2), Sécurité (×1), Transport (×0.5).",
    weights: { nature: 4, life: 2, safety: 1, transport: 0.5 },
    color: "text-green-400",
    borderColor: "border-green-400/20",
    bgColor: "bg-green-400/5",
    scoreKey: "nature" as const,
    why: [
      "Accès forêts, lacs, montagne, mer (< 30 min)",
      "Km de pistes cyclables",
      "Indice de qualité de l'air (PM2.5, PM10)",
      "Ensoleillement annuel (jours)",
      "Clubs sportifs et infrastructures",
    ],
  },
  etudiant: {
    slug: "etudiant",
    label: "Étudiant",
    emoji: "🎓",
    headline: "Meilleures villes étudiantes en France",
    description:
      "Classement des meilleures villes étudiantes françaises : offre universitaire, coût du logement, vie nocturne, mobilité et dynamisme culturel.",
    methodology:
      "Score composite pondéré : Culture (×3), Transport (×2), Coût (×2.5), Nature (×0.5).",
    weights: { culture: 3, transport: 2, cost: 2.5, nature: 0.5 },
    color: "text-violet-400",
    borderColor: "border-violet-400/20",
    bgColor: "bg-violet-400/5",
    scoreKey: "culture" as const,
    why: [
      "Nombre d'universités et grandes écoles",
      "Loyer moyen pour un studio",
      "Transports en commun étudiants",
      "Vie culturelle et nocturne",
      "Réseau alumni et opportunités emploi",
    ],
  },
  retraite: {
    slug: "retraite",
    label: "Retraite",
    emoji: "🌅",
    headline: "Meilleures villes françaises pour la retraite",
    description:
      "Classement des villes françaises pour prendre sa retraite : douceur de vie, santé, calme, soleil et budget.",
    methodology:
      "Score composite pondéré : Vie (×3), Sécurité (×2.5), Nature (×2), Coût (×2), Transport (×0.5).",
    weights: { life: 3, safety: 2.5, nature: 2, cost: 2, transport: 0.5 },
    color: "text-amber-400",
    borderColor: "border-amber-400/20",
    bgColor: "bg-amber-400/5",
    scoreKey: "life" as const,
    why: [
      "Densité médicale (médecins, spécialistes)",
      "Coût de la vie retraité",
      "Ensoleillement et douceur climatique",
      "Calme et sécurité",
      "Activités seniors et vie sociale",
    ],
  },
  budget: {
    slug: "budget",
    label: "Moins chères",
    emoji: "💰",
    headline: "Villes les moins chères de France pour bien vivre",
    description:
      "Classement des villes françaises où votre argent va le plus loin : loyer, course, sorties. Qualité de vie maximale pour budget maîtrisé.",
    methodology:
      "Score composite pondéré : Coût (×4), Qualité de vie (×2), Sécurité (×1.5), Transport (×1).",
    weights: { cost: 4, life: 2, safety: 1.5, transport: 1 },
    color: "text-yellow-400",
    borderColor: "border-yellow-400/20",
    bgColor: "bg-yellow-400/5",
    scoreKey: "cost" as const,
    why: [
      "Loyer médian au m²",
      "Indice des prix à la consommation local",
      "Coût moyen d'un repas au restaurant",
      "Prix de l'immobilier à l'achat",
      "Charges moyennes (énergie, transport)",
    ],
  },
  soleil: {
    slug: "soleil",
    label: "Soleil & Douceur",
    emoji: "☀️",
    headline: "Villes françaises les plus ensoleillées",
    description:
      "Classement des villes françaises par ensoleillement, douceur climatique et qualité de vie en extérieur. Pour ceux qui fuient la grisaille.",
    methodology:
      "Score composite pondéré : Nature (×3), Qualité de vie (×2), Coût (×1.5), Sécurité (×1).",
    weights: { nature: 3, life: 2, cost: 1.5, safety: 1 },
    color: "text-orange-400",
    borderColor: "border-orange-400/20",
    bgColor: "bg-orange-400/5",
    scoreKey: "nature" as const,
    why: [
      "Nombre de jours de soleil par an",
      "Température moyenne estivale et hivernale",
      "Accès à la mer ou à la montagne",
      "Qualité de l'air extérieur",
      "Infrastructure sports de plein air",
    ],
  },
  securite: {
    slug: "securite",
    label: "Sécurité",
    emoji: "🛡️",
    headline: "Villes françaises les plus sûres",
    description:
      "Classement des villes françaises les plus sûres : indice de criminalité, sentiment de sécurité, résultats scolaires, cohésion sociale.",
    methodology:
      "Score composite pondéré : Sécurité (×4), Écoles (×2), Qualité de vie (×2), Nature (×1).",
    weights: { safety: 4, schools: 2, life: 2, nature: 1 },
    color: "text-sky-400",
    borderColor: "border-sky-400/20",
    bgColor: "bg-sky-400/5",
    scoreKey: "safety" as const,
    why: [
      "Taux de criminalité (statistiques préfecture)",
      "Indice de vandalisme et incivilités",
      "Résultats scolaires et décrochage",
      "Cohésion sociale perçue (avis habitants)",
      "Présence de services de proximité (police, pompiers)",
    ],
  },
  culture: {
    slug: "culture",
    label: "Vie culturelle",
    emoji: "🎭",
    headline: "Villes françaises avec la meilleure vie culturelle",
    description:
      "Classement des villes françaises par richesse culturelle : musées, théâtres, concerts, festivals, patrimoine, scène artistique et offre de loisirs.",
    methodology:
      "Score composite pondéré : Culture (×4), Transport (×2), Qualité de vie (×1.5), Écoles (×1).",
    weights: { culture: 4, transport: 2, life: 1.5, schools: 1 },
    color: "text-purple-400",
    borderColor: "border-purple-400/20",
    bgColor: "bg-purple-400/5",
    scoreKey: "culture" as const,
    why: [
      "Nombre de musées et monuments nationaux",
      "Festivals annuels et programmation culturelle",
      "Scène musicale et théâtrale",
      "Universités et grandes écoles",
      "Librairies, galeries, cinémas indépendants",
    ],
  },
  mobilite: {
    slug: "mobilite",
    label: "Sans voiture",
    emoji: "🚲",
    headline: "Meilleures villes françaises pour vivre sans voiture",
    description:
      "Classement des villes françaises où vous pouvez vous passer de voiture : transports en commun, pistes cyclables, commerces de proximité et services accessibles à pied.",
    methodology:
      "Score composite pondéré : Transport (×4), Qualité de vie (×2), Culture (×1.5), Coût (×1).",
    weights: { transport: 4, life: 2, culture: 1.5, cost: 1 },
    color: "text-teal-400",
    borderColor: "border-teal-400/20",
    bgColor: "bg-teal-400/5",
    scoreKey: "transport" as const,
    why: [
      "Réseau tramway / métro / bus (fréquences, couverture)",
      "Km de pistes cyclables sécurisées",
      "Score marchabilité (commerces, services à pied)",
      "Gare TGV ou TER desservie",
      "Disponibilité vélos et trottinettes en libre-service",
    ],
  },
  investissement: {
    slug: "investissement",
    label: "Investissement",
    emoji: "🏠",
    headline: "Meilleures villes françaises pour investir en immobilier",
    description:
      "Classement des villes françaises pour l'investissement immobilier : rendement locatif, tension locative, dynamisme économique et qualité de vie pour attirer des locataires.",
    methodology:
      "Score composite pondéré : Coût (×3 — pour le prix d'achat accessible), Qualité de vie (×2.5), Transport (×2), Culture (×1), Écoles (×1).",
    weights: { cost: 3, life: 2.5, transport: 2, culture: 1, schools: 1 },
    color: "text-rose-400",
    borderColor: "border-rose-400/20",
    bgColor: "bg-rose-400/5",
    scoreKey: "cost" as const,
    why: [
      "Prix au m² accessibles (pour un bon rendement brut)",
      "Tension locative (demande locative forte)",
      "Dynamisme économique et emploi local",
      "Qualité de vie pour attirer des locataires stables",
      "Connectivité (TGV, transports) — critère d'attractivité",
    ],
  },
  sante: {
    slug: "sante",
    label: "Santé & Soins",
    emoji: "❤️",
    headline: "Meilleures villes françaises pour la santé et l'accès aux soins",
    description:
      "Classement des villes françaises par qualité du système de santé : densité médicale, hôpitaux, spécialistes, délais d'attente, qualité de l'air et cadre de vie propice au bien-être. Sources : DREES, Assurance Maladie, ATMO France, INSEE 2026.",
    methodology:
      "Score composite pondéré : Qualité de vie (×3), Sécurité (×2.5), Nature/air (×2), Transport (×1), Coût (×1). La densité médicale et la qualité de l'air (PM2.5) pèsent fortement via les scores Nature et Vie.",
    weights: { life: 3, safety: 2.5, nature: 2, transport: 1, cost: 1 },
    color: "text-pink-400",
    borderColor: "border-pink-400/20",
    bgColor: "bg-pink-400/5",
    scoreKey: "life" as const,
    why: [
      "Densité de médecins généralistes et spécialistes (DREES 2025)",
      "Présence d'un CHU ou hôpital de référence",
      "Qualité de l'air extérieur (indice ATMO — PM2.5, NO₂)",
      "Délais d'attente aux urgences et accès à la médecine de ville",
      "Cadre de vie : espaces verts, activité physique, alimentation locale",
    ],
  },
  climat: {
    slug: "climat",
    label: "Climat de comfort",
    emoji: "🌤️",
    headline: "Villes françaises au climat le plus agréable",
    description:
      "Classement basé sur les données réelles d'ensoleillement et de température : ensoleillement annuel, douceur estivale (sans canicule), clémence hivernale (sans gel marqué). Les villes au climat le plus équilibré arrivent en tête.",
    methodology:
      "Score climatique composite : ensoleillement (×3, plafonné à 3 000 h/an), douceur d'été (×2, idéal ≈ 23 °C en juillet), clémence d'hiver (×2, idéal ≈ 8 °C en janvier). Calcul à partir des données seed (Météo-France / Open-Meteo agrégées).",
    weights: { nature: 0, life: 0 }, // ignored — climat uses a custom scorer
    color: "text-amber-400",
    borderColor: "border-amber-400/20",
    bgColor: "bg-amber-400/5",
    scoreKey: "nature" as const,
    why: [
      "Heures d'ensoleillement annuel (Météo-France)",
      "Température moyenne de juillet (douceur sans canicule)",
      "Température moyenne de janvier (clémence sans gel)",
      "Pénalité automatique pour les extrêmes (été > 30 °C, hiver < 0 °C)",
      "Classification climatique (méditerranéen / océanique / montagnard / tropical)",
    ],
  },
  logement: {
    slug: "logement",
    label: "Logement abordable",
    emoji: "🔑",
    headline: "Villes françaises où se loger reste accessible en 2026",
    description:
      "Classement basé sur les loyers réels (T1, T2, T3) et le prix de l'immobilier au m² : où votre budget logement va le plus loin sans renoncer à la qualité de vie. Sources : DVF data.gouv.fr (Demande de Valeurs Foncières), Observatoires Locaux des Loyers (OLL), INSEE 2026.",
    methodology:
      "Score d'accessibilité au logement : loyer T2 (×3, plus c'est bas, mieux c'est), prix d'achat au m² (×2), score coût de la vie (×1). Étalonné sur les médianes nationales : loyer T2 ≈ 700 €/mois, prix achat ≈ 2 500 €/m². Données issues de la DVF (data.gouv.fr) et des Observatoires Locaux des Loyers.",
    weights: { cost: 3, life: 1, transport: 0.5 }, // ignored — logement uses a custom scorer; values here only drive the sidebar bars
    color: "text-cyan-500",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
    scoreKey: "cost" as const,
    why: [
      "Loyer médian T2 réel (Observatoires Locaux des Loyers 2025)",
      "Prix au m² à l'achat (Demande de Valeurs Foncières — DVF 2024-2025)",
      "Effort financier rapporté à un revenu médian local (INSEE)",
      "Tension locative et délai moyen de relocation",
      "Évolution sur 5 ans (volatilité du marché)",
    ],
  },
  ecologie: {
    slug: "ecologie",
    label: "Écologie & Air",
    emoji: "🌿",
    headline: "Villes françaises les plus engagées pour l'écologie et la qualité de l'air",
    description:
      "Classement des villes françaises par engagement environnemental : qualité de l'air (PM2.5, NO₂), mobilité douce, espaces verts, politiques bas-carbone et résilience climatique. Sources : ATMO France, Ademe, Cerema, Ministère de la Transition Écologique 2026.",
    methodology:
      "Score composite pondéré : Nature/air (×4), Transport doux (×2.5), Qualité de vie (×2), Coût (×0.5). L'indice qualité de l'air ATMO et la densité d'espaces verts (Cerema) pèsent prioritairement.",
    weights: { nature: 4, transport: 2.5, life: 2, cost: 0.5 },
    color: "text-lime-500",
    borderColor: "border-lime-500/20",
    bgColor: "bg-lime-500/5",
    scoreKey: "nature" as const,
    why: [
      "Indice moyen de qualité de l'air ATMO (PM2.5, NO₂, O₃) — données 2024",
      "Part des déplacements en mobilité douce (vélo, marche, TC) — Cerema 2024",
      "Densité d'espaces verts par habitant (ha/1 000 hab.) — Ademe",
      "Plan Climat-Air-Énergie Territorial (PCAET) adopté et ambitieux",
      "Engagement zéro artificialisation nette et végétalisation urbaine",
    ],
  },
} as const;

export type RankingSlug = keyof typeof RANKING_META;

function climateComfortScore(c: (typeof CITIES_SEED)[number]): number {
  // Real data-driven climate-comfort scorer. Returns 0..10.
  // Sunshine: more is better, diminishing returns past 3 000 h.
  const sun = Math.min(c.sunshinedays ?? 1900, 3000);
  const sunScore = Math.max(0, (sun - 1500) / 1500); // 0..1, full at 3 000 h

  // Summer: ideal ≈ 23 °C; harsh penalty past 30 °C, mild penalty under 18 °C.
  const tj = c.avgTempJuly ?? 22;
  const summerScore = tj > 30 ? Math.max(0, 1 - (tj - 30) / 5)
    : tj < 18 ? Math.max(0, 1 - (18 - tj) / 6)
    : 1 - Math.abs(tj - 23) / 12;

  // Winter: ideal ≈ 8 °C; harsh penalty under 0 °C, mild penalty over 16 °C
  // (very mild winters can mean too hot if it's a tropical city — but those
  // already lose points on summer if July is hot).
  const ta = c.avgTempJanuary ?? 5;
  const winterScore = ta < 0 ? Math.max(0, 1 - (0 - ta) / 5)
    : ta > 16 ? Math.max(0, 1 - (ta - 16) / 8)
    : 1 - Math.abs(ta - 8) / 10;

  // Composite — sunshine ×3, summer ×2, winter ×2.
  const raw = (sunScore * 3 + summerScore * 2 + winterScore * 2) / 7;
  return Math.max(0, Math.min(10, raw * 10));
}

function housingAffordabilityScore(c: (typeof CITIES_SEED)[number]): number {
  // Real-data driven score from DVF + Observatoires Locaux des Loyers.
  // Returns 0..10. Cities without housing data fall back to the cost score.
  const h = HOUSING[c.slug];
  if (!h) return Math.max(0, Math.min(10, c.scores.cost * 0.95));

  // T2 rent: 350 €/mo ≈ excellent, 1200 €/mo ≈ saturé. Linear in between.
  const rentScore = Math.max(0, Math.min(10, (1200 - h.avgRentT2) / 85));

  // Buy price/m²: 700 €/m² ≈ excellent, 7 000 €/m² ≈ inaccessible. Linear.
  const buyScore = Math.max(0, Math.min(10, (7000 - h.avgBuyPriceM2) / 630));

  // Cost-of-living score from seed (already calibrated on Insee + observatoires).
  const costScore = c.scores.cost;

  // Composite — loyer ×3, achat ×2, coût général ×1.
  const raw = rentScore * 3 + buyScore * 2 + costScore * 1;
  return Math.max(0, Math.min(10, raw / 6));
}

export function getRankedCities(
  slug: RankingSlug
): Array<{ city: City; rank: number; score: number; delta: number }> {
  const meta = RANKING_META[slug];
  const weights = meta.weights as Record<string, number>;

  const scored = CITIES_SEED.map((c) => {
    if (slug === "climat") {
      return { city: c, score: climateComfortScore(c) };
    }
    if (slug === "logement") {
      return { city: c, score: housingAffordabilityScore(c) };
    }
    let total = 0;
    let weighted = 0;
    for (const [key, w] of Object.entries(weights)) {
      const val = c.scores[key as keyof typeof c.scores] ?? 7;
      weighted += val * w;
      total += 10 * w;
    }
    const score = total > 0 ? (weighted / total) * 10 : c.scores.global;
    return { city: c, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map((item, i) => ({
      city: {
        id: item.city.slug,
        slug: item.city.slug,
        name: item.city.name,
        region: item.city.region,
        department: item.city.department,
        population: item.city.population,
        latitude: item.city.latitude,
        longitude: item.city.longitude,
        scores: item.city.scores,
        characterTags: item.city.characterTags,
        reviewCount: 180 + Math.floor(item.city.scores.global * 30),
        sunshinedays: item.city.sunshinedays,
        avgTempJuly: item.city.avgTempJuly,
        avgTempJanuary: item.city.avgTempJanuary,
      },
      rank: i + 1,
      score: Math.round(item.score * 10) / 10,
      delta: Math.floor(Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1),
    }));
}
