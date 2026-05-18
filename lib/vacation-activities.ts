// V1 — Activités vacances : 10 angles éditoriaux fréquemment recherchés.
//
// Chaque activité définit :
//   - une heuristique de détection par ville (fitness, 0-10)
//   - une saison idéale (mois favoris)
//   - un poids de tempérance climat (la plage déteste le froid, le ski
//     déteste le chaud, etc.)
//
// L'engine `vacation-fit` combine activityFitness + seasonFit pour produire
// le score final d'une destination donnée.

import type { CitySeed } from "@/data/cities-seed";
import type { MonthIndex, MonthSignal } from "@/lib/vacation-seasons";

export const ACTIVITIES = [
  "plage",
  "montagne",
  "ski",
  "citytrip",
  "vignobles",
  "surf",
  "thermal",
  "road-trip",
  "gastro",
  "famille",
] as const;

export type ActivitySlug = (typeof ACTIVITIES)[number];

export interface ActivityDef {
  slug: ActivitySlug;
  label: string;
  emoji: string;
  /** SEO description courte (≤ 160 char) */
  metaDesc: string;
  /** Texte qui s'affiche sous le titre de la page activité */
  intro: string;
  /** Mois favorables (1-12). Score saison maximal sur ces mois. */
  bestMonths: MonthIndex[];
}

export const ACTIVITY_DEFS: Record<ActivitySlug, ActivityDef> = {
  plage: {
    slug: "plage",
    label: "Plage & farniente",
    emoji: "🏖️",
    metaDesc: "Les meilleures destinations plage en France 2026 : Méditerranée, Atlantique, Manche, Bretagne. Eau chaude, sable, criques.",
    intro: "Sable fin, eau qui dépasse les 22 °C, criques préservées ou grandes plages familiales. Ici on classe sur la qualité du littoral et la météo de saison, pas sur le marketing.",
    bestMonths: [6, 7, 8, 9],
  },
  montagne: {
    slug: "montagne",
    label: "Randonnée & montagne",
    emoji: "🥾",
    metaDesc: "Vacances rando en France 2026 : Alpes, Pyrénées, Massif central, Jura, Vosges. Lacs d'altitude, GR, refuges, villages perchés.",
    intro: "Sentiers balisés, lacs d'altitude, villages perchés. La France a une densité de montagne unique en Europe — voici où aller selon l'expérience cherchée.",
    bestMonths: [6, 7, 8, 9],
  },
  ski: {
    slug: "ski",
    label: "Ski & sports d'hiver",
    emoji: "⛷️",
    metaDesc: "Meilleures stations de ski en France 2026 : Alpes, Pyrénées, Jura, Vosges. Enneigement, accessibilité, ambiance.",
    intro: "Stations connues, pépites confidentielles, et villes-camps de base pour skier sans payer le tarif Courchevel.",
    bestMonths: [12, 1, 2, 3],
  },
  citytrip: {
    slug: "citytrip",
    label: "City-trip & culture",
    emoji: "🏛️",
    metaDesc: "Les meilleures villes pour un city-trip en France 2026 : musées, gastro, vie nocturne, patrimoine, prix accessible.",
    intro: "Trois jours, un train et un sac à dos. On classe sur l'épaisseur culturelle réelle (musées, scène, patrimoine) plus que sur la carte postale.",
    bestMonths: [4, 5, 6, 9, 10],
  },
  vignobles: {
    slug: "vignobles",
    label: "Vignobles & œnotourisme",
    emoji: "🍷",
    metaDesc: "Vacances vignobles France 2026 : Bordeaux, Bourgogne, Champagne, Rhône, Alsace. Routes des vins, châteaux, dégustations.",
    intro: "Routes des vins, châteaux ouverts à la dégustation, restaurants étoilés. Pour ceux qui considèrent que vacances et vin sont un même mot.",
    bestMonths: [5, 6, 9, 10],
  },
  surf: {
    slug: "surf",
    label: "Surf & sports nautiques",
    emoji: "🏄",
    metaDesc: "Spots de surf en France 2026 : côte basque, Landes, Bretagne. Débutants et confirmés, vagues, écoles, ambiance.",
    intro: "Atlantique ouvert, vagues constantes, écoles partout. Bretagne nord pour les courageux, Pays Basque pour la culture surf.",
    bestMonths: [5, 6, 7, 9, 10],
  },
  thermal: {
    slug: "thermal",
    label: "Thermal & bien-être",
    emoji: "♨️",
    metaDesc: "Villes thermales en France 2026 : Vichy, Évian, Aix, Dax. Cures, spa, eaux chaudes, bien-être.",
    intro: "Cures certifiées, spas haut de gamme, sources chaudes ouvertes au public. Pour s'y poser une semaine et oublier l'agenda.",
    bestMonths: [3, 4, 5, 9, 10, 11],
  },
  "road-trip": {
    slug: "road-trip",
    label: "Road-trip",
    emoji: "🚗",
    metaDesc: "Idées de road-trip en France 2026 : côte d'Azur, Bretagne, Alsace, Causses, Pyrénées. Itinéraires testés, étapes, durée.",
    intro: "Une bagnole, deux semaines, une carte. Ici on identifie les bases idéales pour rayonner — pas les villes-destination uniques.",
    bestMonths: [5, 6, 7, 8, 9],
  },
  gastro: {
    slug: "gastro",
    label: "Gastronomie",
    emoji: "🍴",
    metaDesc: "Vacances gastronomiques en France 2026 : Lyon, Bordeaux, San Sébastien français, Strasbourg. Étoiles, halles, marchés.",
    intro: "Lyon, Marseille, Bordeaux, Bayonne, Strasbourg — la France a six capitales gastronomiques sérieuses et autant de profils.",
    bestMonths: [3, 4, 5, 9, 10, 11],
  },
  famille: {
    slug: "famille",
    label: "Vacances en famille",
    emoji: "👨‍👩‍👧",
    metaDesc: "Vacances famille France 2026 : destinations avec enfants — plage, parcs, animations, sécurité, budget maîtrisé.",
    intro: "Sécurité, occupation des enfants, restos qui ne s'effondrent pas devant un menu enfant. On filtre dur sur ces trois critères.",
    bestMonths: [4, 5, 7, 8, 10],
  },
};

// ─── Détection (fitness par ville) ───────────────────────────────────────
//
// Chaque fitness renvoie 0-10 ; 10 = destination de référence pour cette
// activité. La logique est volontairement conservatrice : on préfère un
// score plat (4-5) plutôt qu'un faux 8.

function tagSet(city: CitySeed): Set<string> {
  return new Set(
    (city.characterTags ?? []).flatMap((t) =>
      t.toLowerCase().split(/[\s,/-]+/)
    )
  );
}

function isCoastal(city: CitySeed): boolean {
  const tags = tagSet(city);
  return ["mer", "plage", "côte", "atlantique", "méditerranée",
    "manche", "balnéaire", "littoral", "lagon", "estuaire", "îles"].some((t) =>
    tags.has(t)
  );
}

function isMediterranean(city: CitySeed): boolean {
  return ["Pyrénées-Orientales", "Aude", "Hérault", "Gard", "Bouches-du-Rhône",
    "Var", "Alpes-Maritimes", "Corse-du-Sud", "Haute-Corse"].includes(city.department);
}

function isAtlantic(city: CitySeed): boolean {
  // Façade atlantique principale
  return ["Pyrénées-Atlantiques", "Landes", "Gironde", "Charente-Maritime",
    "Vendée", "Loire-Atlantique", "Morbihan", "Finistère",
    "Côtes-d'Armor", "Ille-et-Vilaine", "Manche"].includes(city.department);
}

function isMountain(city: CitySeed): boolean {
  const tags = tagSet(city);
  const tagHit = ["alpes", "pyrénées", "montagne", "altitude", "station", "ski", "massif"].some((t) =>
    tags.has(t)
  );
  return (city.elevation ?? 0) >= 500 || tagHit;
}

function isSkiResort(city: CitySeed): boolean {
  const tags = tagSet(city);
  const ALPINE_DEPTS = ["Haute-Savoie", "Savoie", "Hautes-Alpes", "Isère",
    "Alpes-de-Haute-Provence", "Alpes-Maritimes"];
  const PYRENEAN_DEPTS = ["Pyrénées-Atlantiques", "Hautes-Pyrénées",
    "Haute-Garonne", "Ariège", "Pyrénées-Orientales"];
  return (
    tags.has("ski") || tags.has("station") ||
    ((city.elevation ?? 0) >= 700 &&
      [...ALPINE_DEPTS, ...PYRENEAN_DEPTS, "Doubs", "Jura", "Vosges", "Cantal"]
        .includes(city.department))
  );
}

function isWineCountry(city: CitySeed): boolean {
  const tags = tagSet(city);
  const WINE_DEPTS = ["Gironde", "Côte-d'Or", "Saône-et-Loire", "Marne",
    "Aube", "Bas-Rhin", "Haut-Rhin", "Rhône", "Vaucluse", "Drôme",
    "Pyrénées-Orientales", "Aude", "Hérault", "Gard", "Var",
    "Loire-Atlantique", "Maine-et-Loire", "Indre-et-Loire", "Loir-et-Cher"];
  return tags.has("vin") || tags.has("vignoble") || tags.has("vignobles") ||
    WINE_DEPTS.includes(city.department);
}

function isThermalSpa(city: CitySeed): boolean {
  const tags = tagSet(city);
  const namedThermal = ["vichy", "evian-les-bains", "evian", "aix-les-bains",
    "dax", "amelie-les-bains-palalda", "luchon", "bagneres-de-bigorre",
    "vittel", "contrexeville", "la-bourboule", "le-mont-dore"];
  return tags.has("thermal") || tags.has("thermalisme") ||
    namedThermal.includes(city.slug);
}

function isSurfSpot(city: CitySeed): boolean {
  const tags = tagSet(city);
  const SURF_SLUGS = ["biarritz", "anglet", "saint-jean-de-luz", "hossegor",
    "soorts-hossegor", "capbreton", "lacanau", "seignosse", "mimizan",
    "guethary", "guéthary", "quiberon", "la-torche", "penmarch"];
  return tags.has("surf") ||
    SURF_SLUGS.includes(city.slug) ||
    (isAtlantic(city) && tags.has("plage") && (city.population ?? 0) < 50_000);
}

function isCityBreakWorthy(city: CitySeed, scoresGlobal: number, scoresCulture: number): boolean {
  const pop = city.population ?? 0;
  // Métropole + score culture solide
  return (pop > 90_000 && scoresCulture >= 6.5) || (pop > 200_000 && scoresGlobal >= 6);
}

// ─── Fitness API ──────────────────────────────────────────────────────────

export function activityFitness(city: CitySeed, activity: ActivitySlug): number {
  const tags = tagSet(city);
  const pop = city.population ?? 0;
  const scores = city.scores;

  switch (activity) {
    case "plage": {
      if (!isCoastal(city)) return 0;
      let base = 5;
      if (isMediterranean(city)) base += 2; // eaux 22-26 °C l'été
      if (isAtlantic(city)) base += 1;
      if (tags.has("plage") || tags.has("balnéaire")) base += 1;
      if (scores.nature >= 7.5) base += 0.5;
      if (pop > 100_000 && !tags.has("petite")) base -= 0.5; // grosse station = bétonnée
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "montagne": {
      if (!isMountain(city)) return 0;
      let base = 5;
      if ((city.elevation ?? 0) >= 800) base += 2;
      else if ((city.elevation ?? 0) >= 500) base += 1;
      if (tags.has("alpes") || tags.has("pyrénées")) base += 1.5;
      if (scores.nature >= 8) base += 1;
      if (tags.has("randonnée") || tags.has("randonnees") || tags.has("trekking")) base += 1;
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "ski": {
      if (!isSkiResort(city)) return 0;
      let base = 6;
      if ((city.elevation ?? 0) >= 1200) base += 2;
      else if ((city.elevation ?? 0) >= 900) base += 1;
      if (tags.has("ski") || tags.has("station")) base += 1.5;
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "citytrip": {
      if (!isCityBreakWorthy(city, scores.global, scores.culture)) return 0;
      let base = 5;
      base += (scores.culture - 6) * 0.8; // épaisseur culturelle prime
      if (scores.transport >= 7.5) base += 0.5;
      if (tags.has("patrimoine") || tags.has("historique")) base += 0.5;
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "vignobles": {
      if (!isWineCountry(city)) return 0;
      let base = 5;
      if (tags.has("vin") || tags.has("vignoble") || tags.has("vignobles")) base += 2;
      if (tags.has("gastronomie") || tags.has("gastro")) base += 1;
      // Les gros pôles vin
      if (["bordeaux", "beaune", "reims", "epernay", "saint-emilion",
        "colmar", "macon", "chablis", "tournus"].includes(city.slug)) base += 1.5;
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "surf": {
      if (!isSurfSpot(city)) return 0;
      let base = 6;
      if (["biarritz", "anglet", "hossegor", "soorts-hossegor", "lacanau",
        "seignosse", "capbreton"].includes(city.slug)) base += 2.5;
      if (tags.has("surf")) base += 1;
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "thermal": {
      if (!isThermalSpa(city)) return 0;
      let base = 6.5;
      if (["vichy", "evian-les-bains", "aix-les-bains", "dax"].includes(city.slug)) base += 2;
      if (tags.has("thermalisme")) base += 1;
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "road-trip": {
      // Une bonne base road-trip = petite/moyenne ville avec accès auto +
      // densité de spots autour. On approxime via le score nature + culture.
      const access = scores.nature * 0.5 + scores.culture * 0.3 + scores.life * 0.2;
      let base = (access - 5.5) * 1.2 + 5;
      if (pop > 200_000) base -= 1; // métropoles peu road-trip-friendly
      if (tags.has("village") || tags.has("authentique") || tags.has("charme")) base += 0.5;
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "gastro": {
      let base = 4;
      base += (scores.culture - 6) * 0.5;
      if (tags.has("gastronomie") || tags.has("gastro")) base += 1.5;
      if (tags.has("vin") || tags.has("vignoble") || tags.has("vignobles")) base += 0.5;
      if (["lyon", "bordeaux", "strasbourg", "marseille", "bayonne",
        "saint-jean-de-luz", "perigueux", "sarlat-la-caneda",
        "metz", "nice", "annecy"].includes(city.slug)) base += 1.5;
      if (pop < 5_000 && !tags.has("gastronomie")) base -= 1;
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
    case "famille": {
      let base = 5;
      base += (scores.safety - 6) * 0.5;
      base += (scores.life - 6) * 0.3;
      if (isCoastal(city)) base += 1;
      if (tags.has("familial") || tags.has("famille")) base += 1;
      if (tags.has("parc") || tags.has("parcs")) base += 0.5;
      if (pop > 250_000) base -= 0.5; // mégapoles plus stressantes
      return Math.min(10, Math.max(0, Math.round(base * 10) / 10));
    }
  }
}

// ─── Saison fit ───────────────────────────────────────────────────────────

/** Note saisonnière 0-10 d'une activité un mois donné. */
export function seasonFit(activity: ActivitySlug, signal: MonthSignal): number {
  const def = ACTIVITY_DEFS[activity];
  const inSeason = def.bestMonths.includes(signal.month);
  let s = inSeason ? 8 : 4;

  // Plage / surf : besoin de chaleur ET soleil
  if (activity === "plage" || activity === "surf") {
    if (signal.tempAvg >= 22) s += 1.5;
    else if (signal.tempAvg >= 18) s += 0.5;
    else s -= 2;
    if (signal.sunHoursPerDay >= 8) s += 0.5;
  }
  // Ski : besoin de froid + neige (proxy = mois hiver + altitude implicite)
  else if (activity === "ski") {
    if (signal.tempAvg <= 2) s += 1.5;
    else if (signal.tempAvg <= 5) s += 0.5;
    else if (signal.tempAvg >= 12) return Math.max(0, s - 6); // hors saison
  }
  // Montagne / road-trip : besoin de jours secs et de jour long
  else if (activity === "montagne" || activity === "road-trip") {
    if (signal.rainDays <= 8) s += 1;
    else if (signal.rainDays >= 13) s -= 1;
    if (signal.sunHoursPerDay >= 7) s += 0.5;
  }
  // Citytrip / vignobles / gastro / thermal : assez climat-agnostiques mais
  // préfèrent les mi-saisons (foule moindre, prix bas, météo OK).
  else {
    if (signal.month === 4 || signal.month === 5 ||
        signal.month === 9 || signal.month === 10) s += 0.5;
  }

  // Foule pénalise toutes les activités SAUF ski (août = mois mort pour ski).
  if (activity !== "ski") {
    if (signal.crowded >= 4) s -= 0.8;
    else if (signal.crowded === 1) s += 0.5;
  }

  return Math.max(0, Math.min(10, Math.round(s * 10) / 10));
}
