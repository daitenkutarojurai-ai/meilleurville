// F43 — Bruit & qualité acoustique par ville
//
// 4 dimensions évaluées depuis le seed (department, population, lat/lon,
// characterTags). Aucune dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - Bruitparif (bruitparif.fr) : observatoire bruit IDF, cartes Lden/Lnight.
//   - CBS (Cartes de Bruit Stratégiques) : obligatoires pour les communes
//     > 100 000 hab. depuis la directive européenne 2002/49/CE. Disponibles
//     sur les sites des grandes agglomérations.
//   - DGAC (aviation civile) : plans d'exposition au bruit (PEB) autour des
//     aéroports — zones A, B, C, D classées.
//   - OMS Europe (2018) : seuils recommandés Lden 53 dB(A) jour, Lnight 45 dB(A).
//
// Tous les scores 0-10. 10 = exposition maximale au bruit.
// Composite = moyenne pondérée des 4 sous-scores.

import type { CityLight } from "@/lib/cities-light";

export type NoiseLevel = "faible" | "modere" | "eleve" | "fort";

export interface NoiseDimension {
  /** 0-10, 10 = exposition maximale */
  score: number;
  level: NoiseLevel;
  /** Justification courte */
  reason: string;
}

export interface NoiseExposure {
  /** Composite 0-10 */
  composite: number;
  level: NoiseLevel;
  road: NoiseDimension;       // routier (autoroute, périphérique, boulevard)
  aircraft: NoiseDimension;   // aéroportuaire (PEB)
  rail: NoiseDimension;       // ferroviaire (LGV, grande ligne)
  urbanNight: NoiseDimension; // urbain nocturne (bars, centre-ville, voisinage)
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): NoiseLevel {
  if (s >= 7.5) return "fort";
  if (s >= 5.5) return "eleve";
  if (s >= 3.5) return "modere";
  return "faible";
}

// ─── Bruit routier (autoroute, périphérique, axes urbains majeurs) ────────
//
// Heuristique : grandes métropoles avec périphérique saturé > 100k véh/jour
// → Lden > 70 dB(A) sur 5-10 % du territoire communal. Couloirs autoroutiers
// (A6, A7, A8, A10, A1) touchent une partie du dept.

const RING_ROAD_CITIES = new Set([
  // Communes traversées par un périphérique > 100k véh/jour
  "paris", "lyon", "marseille", "toulouse", "bordeaux", "lille", "nantes",
  "rennes", "strasbourg", "montpellier", "nice", "grenoble", "tours",
  "rouen", "le-havre", "saint-etienne", "nancy", "metz", "reims", "clermont-ferrand",
  // Petite couronne IDF traversée par A86 ou A1/A3/A4/A6
  "boulogne-billancourt", "saint-denis", "montreuil", "argenteuil",
  "nanterre", "vitry-sur-seine", "courbevoie", "creteil", "asnieres-sur-seine",
  "colombes", "aulnay-sous-bois", "drancy", "aubervilliers", "saint-ouen-sur-seine",
  "rueil-malmaison", "issy-les-moulineaux", "levallois-perret", "neuilly-sur-seine",
  "antony", "champigny-sur-marne", "saint-maur-des-fossés",
]);

const HIGHWAY_AXIS_DEPTS = new Set([
  "Rhône", "Métropole de Lyon", "Bouches-du-Rhône", "Var", "Vaucluse",
  "Loiret", "Eure-et-Loir", "Oise", "Yonne", "Côte-d'Or", "Saône-et-Loire",
  "Seine-Saint-Denis", "Hauts-de-Seine", "Val-de-Marne", "Val-d'Oise",
  "Seine-et-Marne", "Yvelines", "Essonne",
]);

function roadNoise(city: CityLight): NoiseDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole|métropolitaine/.test(tags);
  const hasRing = RING_ROAD_CITIES.has(city.slug);
  const onAxis = HIGHWAY_AXIS_DEPTS.has(city.department);

  if (hasRing) {
    return {
      score: 8.5,
      level: "fort",
      reason: "Périphérique ou rocade saturée traversant la commune — Lden > 70 dB(A) sur les abords (CBS). Logements exposés au-dessus du seuil OMS jour.",
    };
  }
  if (isMetro && pop > 100_000) {
    return {
      score: 7,
      level: "eleve",
      reason: "Grande agglomération avec boulevards urbains et radiales saturées. Bruit routier soutenu sur 15-25 % du territoire communal.",
    };
  }
  if (pop > 50_000 || onAxis) {
    return {
      score: 5,
      level: "modere",
      reason: onAxis
        ? "Couloir autoroutier majeur dans le département — exposition élevée aux abords des nationales et des entrées d'agglo."
        : "Ville moyenne avec axes structurants — bruit routier marqué sur les voies pénétrantes.",
    };
  }
  return {
    score: 2,
    level: "faible",
    reason: "Trafic routier modéré, pas d'axe rapide traversant la commune. Bruit routier sous le seuil OMS sur la majorité du territoire.",
  };
}

// ─── Bruit aéroportuaire (PEB) ────────────────────────────────────────────
//
// Approche par proximité du grand aéroport.
// Zone forte (PEB A/B)  : communes très proches Roissy-CDG, Orly, Lyon-Saint-Ex,
//                         Toulouse-Blagnac, Nice-Côte d'Azur, Marseille-Provence,
//                         Bordeaux-Mérignac, Nantes-Atlantique, Strasbourg-Entzheim,
//                         Bâle-Mulhouse.
// Zone modérée (PEB C/D): banlieue éloignée des mêmes aéroports.

const AIRPORT_PEB_HIGH = new Set([
  // Roissy-CDG (95, 93, 77)
  "goussainville", "gonesse", "villiers-le-bel", "le-mesnil-amelot",
  "tremblay-en-france", "roissy-en-france",
  // Orly (94, 91)
  "athis-mons", "viry-chatillon", "savigny-sur-orge", "wissous", "rungis",
  "paray-vieille-poste", "morangis", "thiais", "orly", "villeneuve-le-roi",
  // Lyon-Saint-Exupéry (69 sud + Isère nord)
  "colombier-saugnieu",
  // Toulouse-Blagnac
  "blagnac", "colomiers", "cornebarrieu", "beauzelle",
  // Marseille-Provence (Marignane)
  "marignane", "vitrolles", "saint-victoret",
  // Nice-Côte d'Azur
  "saint-laurent-du-var", "cagnes-sur-mer",
  // Bordeaux-Mérignac
  "merignac", "le-haillan",
  // Nantes-Atlantique
  "bouguenais", "reze",
  // Strasbourg-Entzheim
  "entzheim", "lingolsheim", "geispolsheim",
  // Bâle-Mulhouse
  "saint-louis", "hesingue",
]);

const AIRPORT_PEB_MED = new Set([
  // Banlieue éloignée Roissy (Sud Val-d'Oise, Nord 93)
  "sarcelles", "villepinte", "aulnay-sous-bois", "le-bourget", "drancy",
  "le-blanc-mesnil", "stains", "pierrefitte-sur-seine",
  // Banlieue éloignée Orly
  "creteil", "choisy-le-roi", "alfortville", "vitry-sur-seine", "ivry-sur-seine",
  "fresnes", "antony", "draveil", "yerres", "brunoy",
  // Reste Marseille/Aix corridor
  "aix-en-provence", "marseille",
  // Toulouse banlieue
  "toulouse", "tournefeuille",
  // Lyon banlieue
  "saint-priest", "decines", "meyzieu", "bron",
  // Nice agglo
  "nice", "antibes",
  // Nantes
  "nantes", "saint-herblain",
  // Bordeaux
  "bordeaux", "pessac",
]);

function aircraftNoise(city: CityLight): NoiseDimension {
  const s = city.slug;
  if (AIRPORT_PEB_HIGH.has(s)) {
    return {
      score: 8.5,
      level: "fort",
      reason: "Commune en zone PEB A ou B d'un grand aéroport — survols réguliers, Lden > 65 dB(A), restrictions urbanisme. Habitat neuf restreint.",
    };
  }
  if (AIRPORT_PEB_MED.has(s)) {
    return {
      score: 5.5,
      level: "eleve",
      reason: "Commune en zone PEB C ou D — survols audibles à intervalles réguliers, Lden 55-65 dB(A). Exposition documentée par la DGAC.",
    };
  }
  return {
    score: 1.5,
    level: "faible",
    reason: "Pas d'exposition documentée à un grand aéroport. Survols rares ou très en altitude.",
  };
}

// ─── Bruit ferroviaire (LGV + grandes lignes) ─────────────────────────────
//
// Approche par dept : présence d'une LGV ou ligne classique > 100 trains/jour
// génère un bandeau Lden > 65 dB(A) sur 100-200 m de part et d'autre des voies.

const RAIL_HIGH_DEPTS = new Set([
  // Couloirs LGV principaux + nœuds majeurs
  "Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne",
  "Seine-et-Marne", "Yvelines", "Essonne", "Val-d'Oise",
  "Rhône", "Métropole de Lyon", "Bouches-du-Rhône", "Loire",
  "Nord", "Pas-de-Calais", "Marne", "Loiret", "Côte-d'Or", "Saône-et-Loire",
  "Indre-et-Loire", "Loir-et-Cher", "Vaucluse", "Gironde", "Haute-Garonne",
]);

const RAIL_MED_DEPTS = new Set([
  "Maine-et-Loire", "Loire-Atlantique", "Ille-et-Vilaine", "Calvados",
  "Seine-Maritime", "Bas-Rhin", "Haut-Rhin", "Vosges", "Meurthe-et-Moselle",
  "Moselle", "Doubs", "Allier", "Puy-de-Dôme", "Hérault", "Gard",
  "Drôme", "Isère", "Var", "Alpes-Maritimes", "Vienne", "Charente",
]);

function railNoise(city: CityLight): NoiseDimension {
  const d = city.department;
  if (RAIL_HIGH_DEPTS.has(d)) {
    return {
      score: 6,
      level: "eleve",
      reason: "Département traversé par une LGV ou un nœud ferroviaire majeur — bandeau Lden > 65 dB(A) le long des voies. Exposition localisée mais significative.",
    };
  }
  if (RAIL_MED_DEPTS.has(d)) {
    return {
      score: 4,
      level: "modere",
      reason: "Ligne ferroviaire classique avec trafic régulier — exposition aux abords immédiats des voies, atténuée en s'éloignant.",
    };
  }
  return {
    score: 1.5,
    level: "faible",
    reason: "Pas de ligne ferroviaire majeure dans le département. Bruit ferroviaire négligeable.",
  };
}

// ─── Bruit urbain nocturne (centre-ville actif, vie de bar) ───────────────
//
// Heuristique : population × tags étudiant/festif/touristique = vie nocturne
// active = Lnight > 50 dB(A) sur les zones centrales (OMS recommande < 45).

function urbanNightNoise(city: CityLight): NoiseDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isStudent = /étudiant|universitaire|jeune/.test(tags);
  // Vie nocturne / culture sortie : élargi pour matcher les tags réellement
  // présents dans le seed (culture/culturel/bière/bar/festival).
  const isFestive = /festif|fête|vie nocturne|culture|culturel|bohème|bière|festival/.test(tags);
  const isTouristic = /tourist|station|balnéaire|haut-lieu/.test(tags);
  const isMetro = /métropole/.test(tags) || pop > 200_000;

  const hits = [isStudent, isFestive, isTouristic, isMetro].filter(Boolean).length;

  if (hits >= 3) {
    return {
      score: 8,
      level: "fort",
      reason: "Vie nocturne très active (centre étudiant ou festif, métropole touristique) — Lnight > 55 dB(A) sur les axes centraux, plaintes voisinage fréquentes.",
    };
  }
  if (hits === 2 || isMetro) {
    return {
      score: 6,
      level: "eleve",
      reason: "Centre-ville actif le soir (bars, restaurants, vie étudiante) — Lnight souvent au-dessus du seuil OMS 45 dB(A).",
    };
  }
  if (hits === 1 || pop > 50_000) {
    return {
      score: 4,
      level: "modere",
      reason: "Vie nocturne ponctuelle (centre-ville, weekends). Niveaux Lnight modérés en dehors des zones festives.",
    };
  }
  return {
    score: 1.5,
    level: "faible",
    reason: "Vie nocturne calme, peu d'établissements ouverts tard. Lnight largement sous le seuil OMS.",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(n: NoiseExposure, name: string): string {
  const tops = [
    { k: "trafic routier", d: n.road },
    { k: "survols aéroportuaires", d: n.aircraft },
    { k: "bruit ferroviaire", d: n.rail },
    { k: "vie nocturne urbaine", d: n.urbanNight },
  ]
    .filter((x) => x.d.level === "fort" || x.d.level === "eleve")
    .sort((a, b) => b.d.score - a.d.score);

  if (tops.length === 0) {
    return `${name} est globalement calme — pas de source de bruit dominante sur les 4 dimensions CBS / OMS.`;
  }
  if (tops.length === 1) {
    return `${name} est principalement exposée au facteur « ${tops[0].k} » (${tops[0].d.level}).`;
  }
  return `${name} cumule plusieurs sources de bruit : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level})`).join(", ")}.`;
}

export function computeNoiseExposure(city: CityLight): NoiseExposure {
  const road = roadNoise(city);
  const aircraft = aircraftNoise(city);
  const rail = railNoise(city);
  const urbanNight = urbanNightNoise(city);
  // Pondération : routier 35 % (1ʳᵉ source d'exposition en France selon CBS),
  // aérien 25 %, ferroviaire 15 %, urbain nocturne 25 %. L'aérien et le
  // nocturne ont un impact sommeil plus marqué que le ferroviaire.
  const composite =
    Math.round(
      (road.score * 0.35 + aircraft.score * 0.25 + urbanNight.score * 0.25 + rail.score * 0.15) * 10
    ) / 10;
  const out: NoiseExposure = {
    composite,
    level: levelFromScore(composite),
    road,
    aircraft,
    rail,
    urbanNight,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

export const NOISE_LEVEL_LABEL: Record<NoiseLevel, string> = {
  faible: "Faible",
  modere: "Modéré",
  eleve: "Élevé",
  fort: "Fort",
};

export const NOISE_LEVEL_COLOR: Record<NoiseLevel, string> = {
  faible: "text-emerald-600",
  modere: "text-amber-600",
  eleve: "text-orange-600",
  fort: "text-red-600",
};

export const NOISE_LEVEL_BG: Record<NoiseLevel, string> = {
  faible: "bg-emerald-50 border-emerald-200",
  modere: "bg-amber-50 border-amber-200",
  eleve: "bg-orange-50 border-orange-200",
  fort: "bg-red-50 border-red-200",
};
