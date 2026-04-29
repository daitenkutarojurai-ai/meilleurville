import { CITIES_SEED } from "@/data/cities-seed";
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
} as const;

export type RankingSlug = keyof typeof RANKING_META;

export function getRankedCities(
  slug: RankingSlug
): Array<{ city: City; rank: number; score: number; delta: number }> {
  const meta = RANKING_META[slug];
  const weights = meta.weights as Record<string, number>;

  const scored = CITIES_SEED.map((c) => {
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
