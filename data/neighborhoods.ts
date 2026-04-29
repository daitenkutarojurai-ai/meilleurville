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
  {
    citySlug: "toulouse",
    neighborhoods: [
      {
        slug: "capitole",
        name: "Capitole",
        type: "centre-ville",
        scores: { global: 8.5, safety: 7.8, transport: 9.2, nature: 6.9, cost: 5.8, nightlife: 9.1 },
        avgRentT2: 820,
        tags: ["Place du Capitole", "animation", "restaurants", "tourisme", "histoire"],
        summary: "Le coeur rose de Toulouse. La Place du Capitole est l'une des plus belles de France. Très animé, bien relié, un peu cher.",
      },
      {
        slug: "compans-cafarelli",
        name: "Compans-Caffarelli",
        type: "branché",
        scores: { global: 8.0, safety: 7.5, transport: 8.8, nature: 7.2, cost: 6.8, nightlife: 7.5 },
        avgRentT2: 780,
        tags: ["bureaux", "parc", "startup", "jeune", "canal"],
        summary: "Le quartier d'affaires moderne avec un beau parc. Attractif pour les jeunes actifs, bien desservi par le métro.",
      },
      {
        slug: "saint-cyprien",
        name: "Saint-Cyprien",
        type: "branché",
        scores: { global: 7.9, safety: 7.2, transport: 8.5, nature: 7.5, cost: 7.1, nightlife: 8.4 },
        avgRentT2: 740,
        tags: ["Garonne", "marché", "bars", "bohème", "artistes"],
        summary: "Le Montmartre toulousain, rive gauche de la Garonne. Marché Victor Hugo, bars à vins, galeries. En gentrification douce.",
      },
    ],
  },
  {
    citySlug: "montpellier",
    neighborhoods: [
      {
        slug: "ecusson",
        name: "L'Écusson",
        type: "centre-ville",
        scores: { global: 8.4, safety: 7.5, transport: 9.0, nature: 6.8, cost: 6.0, nightlife: 9.0 },
        avgRentT2: 800,
        tags: ["Comédie", "université", "terrasses", "piéton", "méditerranéen"],
        summary: "Le centre historique médiéval de Montpellier. Place de la Comédie, ruelles animées. La meilleure adresse pour les étudiants et jeunes.",
      },
      {
        slug: "port-marianne",
        name: "Port Marianne",
        type: "résidentiel",
        scores: { global: 8.2, safety: 8.4, transport: 8.5, nature: 8.0, cost: 6.5, nightlife: 6.0 },
        avgRentT2: 850,
        tags: ["moderne", "lac", "tram", "famille", "eau"],
        summary: "Quartier neuf bien conçu avec le lac et les espaces verts. Le meilleur choix pour les familles à Montpellier.",
      },
      {
        slug: "antigone",
        name: "Antigone",
        type: "résidentiel",
        scores: { global: 7.8, safety: 8.0, transport: 9.1, nature: 7.5, cost: 6.8, nightlife: 6.5 },
        avgRentT2: 780,
        tags: ["néoclassique", "Lez", "architecture", "calme", "tram"],
        summary: "Quartier néoclassique unique dessiné par Ricardo Bofill. Le long du Lez, calme, bonne liaison centre.",
      },
    ],
  },
  {
    citySlug: "strasbourg",
    neighborhoods: [
      {
        slug: "grande-ile",
        name: "Grande Île",
        type: "centre-ville",
        scores: { global: 9.0, safety: 8.5, transport: 9.3, nature: 8.0, cost: 5.6, nightlife: 8.2 },
        avgRentT2: 900,
        tags: ["UNESCO", "cathédrale", "alsacien", "tourisme", "Petite France"],
        summary: "L'île historique classée UNESCO. La Petite France est magique. Très touristique mais incontournable. Le prix à payer : l'immobilier s'envole.",
      },
      {
        slug: "krutenau",
        name: "Krutenau",
        type: "étudiant",
        scores: { global: 8.3, safety: 7.8, transport: 9.0, nature: 7.5, cost: 7.0, nightlife: 8.8 },
        avgRentT2: 780,
        tags: ["étudiant", "bohème", "bars", "canal", "vélo"],
        summary: "Le quartier étudiant animé de Strasbourg. Canaux, bars, vélos. Idéal pour 20-35 ans. En dehors des grandes routes touristiques.",
      },
      {
        slug: "robertsau",
        name: "Robertsau",
        type: "pavillonnaire",
        scores: { global: 8.0, safety: 8.7, transport: 7.5, nature: 9.0, cost: 7.0, nightlife: 4.5 },
        avgRentT2: 750,
        tags: ["forêt", "calme", "familial", "maison", "Institutions européennes"],
        summary: "Village dans la ville, bordé par la forêt du Rhin. Calme absolu, idéal pour les familles. Beaucoup de fonctionnaires européens.",
      },
    ],
  },
  {
    citySlug: "nice",
    neighborhoods: [
      {
        slug: "vieux-nice",
        name: "Vieux-Nice",
        type: "centre-ville",
        scores: { global: 8.8, safety: 7.6, transport: 8.8, nature: 8.5, cost: 5.5, nightlife: 9.2 },
        avgRentT2: 1000,
        tags: ["baroque", "marché", "mer", "couleurs", "tourisme", "restaurants"],
        summary: "Le vieux quartier baroque aux couleurs provençales. Marché du Cours Saleya, ruelle animées à 5 min de la mer. Très cher, très beau.",
      },
      {
        slug: "libération",
        name: "Libération",
        type: "branché",
        scores: { global: 8.0, safety: 7.5, transport: 8.5, nature: 7.0, cost: 6.8, nightlife: 8.0 },
        avgRentT2: 850,
        tags: ["marché", "branché", "diversité", "vivant", "tram"],
        summary: "Quartier populaire en pleine gentrification. Marché coloré, restauration diverse, ambiance authentique. Moins cher que la Promenade.",
      },
      {
        slug: "cimiez",
        name: "Cimiez",
        type: "résidentiel",
        scores: { global: 8.5, safety: 8.8, transport: 7.2, nature: 8.8, cost: 6.0, nightlife: 4.0 },
        avgRentT2: 1100,
        tags: ["bourgeois", "musées", "jardins", "calme", "Matisse"],
        summary: "Le quartier résidentiel huppé sur les hauteurs. Jardins, musée Matisse, calme total. Populaire pour la retraite aisée.",
      },
    ],
  },
  {
    citySlug: "lyon",
    neighborhoods: [
      {
        slug: "presquile",
        name: "Presqu'île",
        type: "centre-ville",
        scores: { global: 9.0, safety: 8.0, transport: 9.5, nature: 7.0, cost: 5.8, nightlife: 9.2 },
        avgRentT2: 950,
        tags: ["Bellecour", "animation", "Terreaux", "restaurants", "galeries"],
        summary: "Le coeur de Lyon entre Rhône et Saône. Bellecour, les Terreaux, les traboules. Dense, vivant, bien connecté. La référence lyonnaise.",
      },
      {
        slug: "croix-rousse",
        name: "Croix-Rousse",
        type: "branché",
        scores: { global: 8.8, safety: 8.2, transport: 8.5, nature: 8.0, cost: 6.8, nightlife: 8.5 },
        avgRentT2: 880,
        tags: ["canuts", "marché", "traboules", "bobos", "pentes", "village"],
        summary: "La colline qui travaille, devenue la colline qui vit bien. Esprit village, marché quotidien, caves à vins, artisans. Très prisé.",
      },
      {
        slug: "confluence",
        name: "Confluence",
        type: "branché",
        scores: { global: 8.3, safety: 8.3, transport: 9.0, nature: 8.5, cost: 6.5, nightlife: 7.5 },
        avgRentT2: 900,
        tags: ["écoquartier", "neuf", "museum", "quais", "moderne"],
        summary: "L'écoquartier exemplaire à la pointe sud de la Presqu'île. Architecture contemporaine, quais aménagés, musée des Confluences.",
      },
    ],
  },
  {
    citySlug: "la-rochelle",
    neighborhoods: [
      {
        slug: "vieux-port",
        name: "Vieux-Port",
        type: "centre-ville",
        scores: { global: 8.9, safety: 8.4, transport: 8.5, nature: 9.0, cost: 5.8, nightlife: 8.5 },
        avgRentT2: 900,
        tags: ["tours médiévales", "mer", "restaurants", "tourisme", "patrimoine"],
        summary: "Le symbole de La Rochelle. Les tours médiévales, le port en arc de cercle, les arcades. Incontournable mais cher et touristique.",
      },
      {
        slug: "minimes",
        name: "Les Minimes",
        type: "résidentiel",
        scores: { global: 8.2, safety: 8.2, transport: 7.8, nature: 9.2, cost: 6.8, nightlife: 6.0 },
        avgRentT2: 780,
        tags: ["plage", "port de plaisance", "cyclable", "calme", "famille"],
        summary: "Quartier résidentiel avec sa propre plage. Port de plaisance, pistes cyclables vers le centre. Idéal pour les familles qui veulent la mer.",
      },
    ],
  },
];

export function getNeighborhoods(citySlug: string): Neighborhood[] {
  return NEIGHBORHOODS.find((n) => n.citySlug === citySlug)?.neighborhoods ?? [];
}

export function getCitiesWithNeighborhoods(): string[] {
  return NEIGHBORHOODS.map((n) => n.citySlug);
}
