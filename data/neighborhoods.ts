export interface Neighborhood {
  slug: string;
  name: string;
  type: "centre-ville" | "résidentiel" | "étudiant" | "branché" | "populaire" | "pavillonnaire";
  scores: {
    global: number;
    safety: number;
    transport: number;
    nature: number;
    cost: number;
    nightlife: number;
  };
  avgRentT2: number;
  tags: string[];
  summary: string;
}

export interface CityNeighborhoods {
  citySlug: string;
  neighborhoods: Neighborhood[];
}

export const NEIGHBORHOODS: CityNeighborhoods[] = [
  {
    citySlug: "annecy",
    neighborhoods: [
      {
        slug: "vieille-ville",
        name: "Vieille-Ville",
        type: "centre-ville",
        scores: { global: 8.9, safety: 8.5, transport: 9.1, nature: 9.2, cost: 5.2, nightlife: 7.8 },
        avgRentT2: 950,
        tags: ["patrimoine", "tourisme", "canal", "restaurants", "piéton"],
        summary: "Le joyau d'Annecy. Ruelles médiévales, canaux, accès direct au lac. Très cher mais sans équivalent pour la qualité de vie immédiate.",
      },
      {
        slug: "novel",
        name: "Novel",
        type: "résidentiel",
        scores: { global: 7.4, safety: 7.0, transport: 7.2, nature: 7.8, cost: 7.1, nightlife: 5.0 },
        avgRentT2: 750,
        tags: ["calme", "familial", "nature proche", "école"],
        summary: "Quartier résidentiel calme, apprécié des familles. Moins cher que le centre, bonnes écoles, bus fréquents vers le centre.",
      },
      {
        slug: "cran-gevrier",
        name: "Cran-Gevrier",
        type: "résidentiel",
        scores: { global: 7.2, safety: 7.5, transport: 7.5, nature: 7.4, cost: 7.8, nightlife: 5.5 },
        avgRentT2: 680,
        tags: ["accessible", "commerce", "pratique", "transport"],
        summary: "Commune limitrophe bien desservie. Plus accessible financièrement, idéal pour les primo-accédants.",
      },
    ],
  },
  {
    citySlug: "nantes",
    neighborhoods: [
      {
        slug: "ile-de-nantes",
        name: "Île de Nantes",
        type: "branché",
        scores: { global: 8.5, safety: 7.8, transport: 8.9, nature: 7.5, cost: 6.5, nightlife: 8.2 },
        avgRentT2: 850,
        tags: ["créatif", "startup", "tram", "machines de l'île", "végétalisé"],
        summary: "Le nouveau coeur néo-industriel de Nantes. Startups, artistes, coworking, le tout à 10 min de la gare. En pleine gentrification.",
      },
      {
        slug: "bouffay",
        name: "Bouffay",
        type: "centre-ville",
        scores: { global: 8.2, safety: 7.5, transport: 9.2, nature: 6.8, cost: 6.2, nightlife: 9.1 },
        avgRentT2: 820,
        tags: ["bar", "restaurant", "vie nocturne", "piéton", "étudiant"],
        summary: "Le centre historique animé. Idéal pour les jeunes sans voiture : tout est à pied. Bruyant le week-end.",
      },
      {
        slug: "saint-felix",
        name: "Saint-Félix",
        type: "résidentiel",
        scores: { global: 8.0, safety: 8.2, transport: 8.1, nature: 7.9, cost: 7.0, nightlife: 6.5 },
        avgRentT2: 780,
        tags: ["calme", "familial", "parc", "bourgeois"],
        summary: "Quartier bourgeois calme avec de beaux immeubles haussmanniens. Bien relié au centre, parcs agréables.",
      },
      {
        slug: "zola",
        name: "Zola",
        type: "étudiant",
        scores: { global: 7.5, safety: 7.0, transport: 8.5, nature: 7.2, cost: 7.8, nightlife: 7.5 },
        avgRentT2: 700,
        tags: ["étudiant", "campus", "abordable", "tram"],
        summary: "Zone universitaire accessible, parfaite pour les étudiants. Loyers moins élevés, bonnes connexions tramway.",
      },
    ],
  },
  {
    citySlug: "rennes",
    neighborhoods: [
      {
        slug: "thabor",
        name: "Thabor",
        type: "résidentiel",
        scores: { global: 8.8, safety: 9.0, transport: 8.5, nature: 9.1, cost: 6.4, nightlife: 6.2 },
        avgRentT2: 800,
        tags: ["parc", "calme", "bourgeois", "famille", "promenade"],
        summary: "Le quartier le plus prisé de Rennes. Le Parc du Thabor est un bijou. Très calme, idéal pour les familles aisées.",
      },
      {
        slug: "centre-ville",
        name: "Centre historique",
        type: "centre-ville",
        scores: { global: 8.4, safety: 7.8, transport: 9.3, nature: 6.9, cost: 6.0, nightlife: 8.8 },
        avgRentT2: 820,
        tags: ["colombages", "animation", "bar", "restaurant", "piéton"],
        summary: "Colombages et ambiance bretonne garantie. Très vivant, parfait pour les 25-35 ans sans voiture.",
      },
      {
        slug: "beauregard",
        name: "Beauregard",
        type: "pavillonnaire",
        scores: { global: 7.6, safety: 8.5, transport: 7.0, nature: 8.2, cost: 7.9, nightlife: 4.5 },
        avgRentT2: 680,
        tags: ["maison", "jardin", "calme", "famille", "voiture"],
        summary: "Quartier pavillonnaire apprécié des familles avec enfants. Jardins, calme absolu, mais dépendant de la voiture.",
      },
    ],
  },
  {
    citySlug: "bordeaux",
    neighborhoods: [
      {
        slug: "chartrons",
        name: "Les Chartrons",
        type: "branché",
        scores: { global: 8.7, safety: 8.2, transport: 8.6, nature: 7.8, cost: 6.3, nightlife: 8.4 },
        avgRentT2: 880,
        tags: ["branché", "galeries", "brunch", "tram", "quais", "bobos"],
        summary: "Le quartier le plus «instagrammable» de Bordeaux. Antiquaires, galeries d'art, cafés branchés. Tram direct vers la gare.",
      },
      {
        slug: "saint-pierre",
        name: "Saint-Pierre",
        type: "centre-ville",
        scores: { global: 8.3, safety: 7.6, transport: 9.1, nature: 7.0, cost: 5.8, nightlife: 9.0 },
        avgRentT2: 850,
        tags: ["historique", "animation", "restaurants", "bars", "tourisme"],
        summary: "Centre historique classé UNESCO. Ambiance festive, nombreux restaurants. Le cœur battant de Bordeaux.",
      },
      {
        slug: "bacalan",
        name: "Bacalan",
        type: "branché",
        scores: { global: 7.9, safety: 7.2, transport: 8.0, nature: 7.5, cost: 7.2, nightlife: 7.8 },
        avgRentT2: 750,
        tags: ["en gentrification", "Cité du Vin", "quais", "lofts", "arts"],
        summary: "Ancien quartier industriel en pleine transformation. Moins cher que les Chartrons mais en rattrapage rapide. La Cité du Vin en voisine.",
      },
    ],
  },
  {
    citySlug: "grenoble",
    neighborhoods: [
      {
        slug: "hyper-centre",
        name: "Hyper-Centre",
        type: "centre-ville",
        scores: { global: 8.0, safety: 7.5, transport: 9.2, nature: 7.1, cost: 6.5, nightlife: 8.5 },
        avgRentT2: 750,
        tags: ["animation", "tram", "université", "commerces", "marché"],
        summary: "Dense, vivant, accessible. Le tram dessert tout. Idéal pour les étudiants et jeunes actifs sans voiture.",
      },
      {
        slug: "europole",
        name: "Europole",
        type: "branché",
        scores: { global: 8.2, safety: 8.1, transport: 8.8, nature: 6.5, cost: 7.2, nightlife: 7.0 },
        avgRentT2: 720,
        tags: ["startup", "coworking", "technopole", "moderne", "WTC"],
        summary: "Le quartier d'affaires innovant de Grenoble. WTC, startups deep tech, coworking. Parfait pour les remote workers qui veulent voir des gens.",
      },
      {
        slug: "ile-verte",
        name: "Île Verte",
        type: "résidentiel",
        scores: { global: 8.4, safety: 8.5, transport: 8.2, nature: 9.0, cost: 6.8, nightlife: 5.5 },
        avgRentT2: 780,
        tags: ["parc", "Isère", "calme", "famille", "verdoyant"],
        summary: "Quartier le plus vert de Grenoble, bordé par l'Isère. Calme familial, parcs magnifiques, vue sur les montagnes.",
      },
    ],
  },
];

export function getNeighborhoods(citySlug: string): Neighborhood[] {
  return NEIGHBORHOODS.find((n) => n.citySlug === citySlug)?.neighborhoods ?? [];
}
