// F57 — Mobilité douce / cyclabilité par ville.
//
// 4 dimensions évaluées depuis le seed (department, population, elevation,
// characterTags, sunshinedays). Aucune dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - Géovélo / OpenStreetMap : densité du réseau cyclable national, voies
//     vertes, EuroVelo (ev1 Atlantique, ev6 Loire, ev17 Rhône, ev8 Méditerranée).
//   - Vélo & Territoires (velo-territoires.org) : palmarès annuel des
//     « Villes Vélo de l'Année » + barème Baromètre des Villes Cyclables FUB.
//   - INSEE / SDES : parts modales vélo par aire urbaine (recensement,
//     Enquête Mobilité Certifiée Insee).
//   - IGN / SRTM : altitude moyenne et dénivelé local (utile pour la pente
//     contraignante > 4 % qui dissuade le vélo quotidien).
//
// **Convention** : tous les scores 0-10, 10 = excellent pour le vélo.
// (Différent du quartet env qui utilise 10 = pire — ici on garde la
// convention « 10 = bon » qu'on a aussi sur F44.healthScore.)
// Composite = moyenne pondérée des 4 sous-scores.

import type { CitySeed } from "@/data/cities-seed";

export type CyclingLevel = "excellent" | "bon" | "moyen" | "difficile";

export interface CyclingDimension {
  /** 0-10, 10 = idéal pour le vélo */
  score: number;
  level: CyclingLevel;
  /** Justification courte */
  reason: string;
}

export interface CyclingMobility {
  /** Composite 0-10, 10 = excellent */
  composite: number;
  level: CyclingLevel;
  network: CyclingDimension;       // pistes / voies vertes
  topography: CyclingDimension;    // relief
  safety: CyclingDimension;        // dangerosité / aménagement
  climate: CyclingDimension;       // météo cyclable
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): CyclingLevel {
  if (s >= 7.5) return "excellent";
  if (s >= 5.5) return "bon";
  if (s >= 3.5) return "moyen";
  return "difficile";
}

// ─── Réseau cyclable (Géovélo, OSM, Vélo & Territoires) ───────────────────
//
// Villes systématiquement en tête du Baromètre FUB (parlons-velo.fr) :
//   Strasbourg, Grenoble, Rennes, Nantes, Bordeaux, La Rochelle, Chambéry,
//   Annecy, Versailles, Caen, Lorient, Nantes. Ces villes ont 100-500 km
//   d'aménagements continus + un plan vélo financé > 50 €/hab/an.
//
// Communes le long des EuroVelo majeures bénéficient d'une voie verte
// continue (ev1, ev3, ev6, ev17, ev8).
const TOP_CYCLING_CITIES = new Set([
  "strasbourg", "grenoble", "rennes", "nantes", "bordeaux", "la-rochelle",
  "chambery", "annecy", "versailles", "caen", "lorient", "saint-malo",
  "tours", "angers", "blois", "orleans", "amiens", "lille",
  "metz", "montpellier", "perpignan", "avignon", "valence",
  "le-mans", "poitiers", "niort", "limoges",
  "saint-brieuc", "vannes", "quimper", "brest",
  "dunkerque", "calais", "boulogne-sur-mer",
  // Communes EuroVelo (Loire à vélo, Vélodyssée, ViaRhôna)
  "saumur", "amboise", "chinon", "nevers", "decize",
  "royan", "biarritz", "bayonne", "anglet",
]);

const EUROVELO_DEPTS = new Set([
  // EV6 Loire
  "Loiret", "Loir-et-Cher", "Indre-et-Loire", "Maine-et-Loire", "Loire-Atlantique",
  // EV1 Vélodyssée (Atlantique)
  "Finistère", "Morbihan", "Vendée", "Charente-Maritime", "Gironde", "Landes",
  "Pyrénées-Atlantiques",
  // EV17 ViaRhôna
  "Haute-Savoie", "Ain", "Isère", "Rhône", "Métropole de Lyon", "Drôme",
  "Vaucluse", "Bouches-du-Rhône",
  // EV3 Scandibérique
  "Nord", "Pas-de-Calais", "Somme", "Oise", "Val-d'Oise",
]);

function networkScore(city: CitySeed): CyclingDimension {
  const slug = city.slug.toLowerCase();
  const tags = (city.characterTags ?? []).map((t) => t.toLowerCase());
  const pop = city.population ?? 0;
  const hasCyclingTag = tags.includes("vélo");
  const hasMetro = tags.includes("métropole");
  const onEv = EUROVELO_DEPTS.has(city.department);

  if (TOP_CYCLING_CITIES.has(slug) || hasCyclingTag) {
    return {
      score: 8.8,
      level: "excellent",
      reason:
        "Ville régulièrement primée au Baromètre FUB / Vélo & Territoires — réseau d'aménagements continu, plan vélo financé > 50 €/hab/an, services associés (parkings, vélo-école).",
    };
  }
  if (hasMetro && pop > 150_000) {
    return {
      score: 6.5,
      level: "bon",
      reason:
        "Grande métropole avec plan vélo municipal — pistes structurantes mais discontinuités fréquentes en périphérie. Couverture EPCI plus inégale.",
    };
  }
  if (onEv) {
    return {
      score: 6.0,
      level: "bon",
      reason:
        "Commune située sur un itinéraire EuroVelo — voie verte continue pour les balades, complétée par un réseau urbain de qualité moyenne.",
    };
  }
  if (pop > 50_000) {
    return {
      score: 4.5,
      level: "moyen",
      reason:
        "Ville moyenne avec quelques pistes en centre — réseau encore largement perfectible, surtout pour les liaisons domicile-travail péri-urbaines.",
    };
  }
  return {
    score: 3.0,
    level: "difficile",
    reason:
      "Commune sans politique vélo affirmée — aménagements ponctuels, peu de continuité. Le vélo y reste praticable mais pas confortable au quotidien.",
  };
}

// ─── Topographie / relief ─────────────────────────────────────────────────
//
// Le vélo quotidien dissuade au-delà de 4 % de pente moyenne. Altitude
// absolue secondaire (Reims à 80 m peut être plate ; Lyon à 170 m est plate
// au centre mais cernée par les pentes). On utilise un proxy département.

const HILLY_DEPTS = new Set([
  "Cantal", "Haute-Loire", "Lozère", "Ariège", "Hautes-Pyrénées",
  "Pyrénées-Atlantiques", "Hautes-Alpes", "Alpes-de-Haute-Provence",
  "Haute-Savoie", "Savoie", "Doubs", "Jura", "Vosges", "Hautes-Vosges",
  "Corrèze", "Creuse", "Aveyron", "Lot", "Tarn", "Cévennes",
  "Alpes-Maritimes", "Corse-du-Sud", "Haute-Corse", "Territoire de Belfort",
]);

const FLAT_DEPTS = new Set([
  // Plaine de Beauce, Aquitaine, Loire, Picardie, Flandre
  "Eure-et-Loir", "Loiret", "Loir-et-Cher", "Indre-et-Loire", "Maine-et-Loire",
  "Loire-Atlantique", "Vendée", "Charente-Maritime", "Gironde", "Landes",
  "Pas-de-Calais", "Nord", "Somme", "Oise", "Eure", "Seine-Maritime",
  "Marne", "Aube", "Yonne", "Sarthe", "Mayenne",
]);

function topographyScore(city: CitySeed): CyclingDimension {
  const dept = city.department;
  const elev = city.elevation ?? 0;

  if (HILLY_DEPTS.has(dept) || elev > 500) {
    return {
      score: 3.0,
      level: "difficile",
      reason:
        "Relief marqué — pentes > 4 % fréquentes en agglomération. Vélo possible en VAE mais musculaire dissuasif au quotidien.",
    };
  }
  if (elev > 250) {
    return {
      score: 5.0,
      level: "moyen",
      reason:
        "Coteaux et faux plats — la ville se vit en pente. Centre praticable, périphérie plus exigeante.",
    };
  }
  if (FLAT_DEPTS.has(dept) || elev < 80) {
    return {
      score: 8.5,
      level: "excellent",
      reason:
        "Topographie favorable — plaine, faible dénivelé. Le vélo y est aussi rapide que la voiture en heure de pointe.",
    };
  }
  return {
    score: 6.5,
    level: "bon",
    reason:
      "Relief globalement modéré — quelques côtes mais centre roulant. Adapté au vélo quotidien.",
  };
}

// ─── Sécurité cyclable / aménagement ──────────────────────────────────────
//
// Combine densité urbaine (= trafic) et niveau d'aménagement. Une grande
// métropole sans piste = dangereuse ; une ville cyclable connue compense
// avec des aménagements séparés.

function safetyScore(city: CitySeed): CyclingDimension {
  const slug = city.slug.toLowerCase();
  const tags = (city.characterTags ?? []).map((t) => t.toLowerCase());
  const pop = city.population ?? 0;
  const isParis = city.department === "Paris";
  const isCyclingFriendly = TOP_CYCLING_CITIES.has(slug) || tags.includes("vélo");

  if (isCyclingFriendly) {
    return {
      score: 7.5,
      level: "excellent",
      reason:
        "Aménagements séparés (bandes, pistes, zones 30) bien déployés — co-existence vélo / auto codifiée. Reste prudent en hyper-centre saturé.",
    };
  }
  if (isParis || pop > 250_000) {
    return {
      score: 4.0,
      level: "moyen",
      reason:
        "Grande agglomération avec trafic dense — pistes existent mais discontinuités créent des points noirs. Casque + visibilité essentiels.",
    };
  }
  if (pop > 80_000) {
    return {
      score: 5.5,
      level: "bon",
      reason:
        "Ville de taille moyenne — trafic modéré, mais aménagement vélo encore lacunaire en périphérie. Risque acceptable avec vigilance.",
    };
  }
  return {
    score: 6.5,
    level: "bon",
    reason:
      "Trafic peu dense — la cohabitation auto/vélo y est plus apaisée, même sans aménagement dédié.",
  };
}

// ─── Climat cyclable ──────────────────────────────────────────────────────
//
// Soleil + faibles précipitations + vent modéré favorisent le vélo. Côte
// atlantique = vent fort dominant, malus. Sud = chaleur estivale, OK hors
// canicule. Nord-Est = hivers froids, malus modéré.

const WINDY_DEPTS = new Set([
  // Côte atlantique exposée + Manche
  "Finistère", "Morbihan", "Côtes-d'Armor", "Manche", "Pas-de-Calais",
  "Vendée", "Charente-Maritime", "Pyrénées-Atlantiques", "Landes",
  // Couloir rhodanien (Mistral / Tramontane)
  "Bouches-du-Rhône", "Vaucluse", "Gard", "Hérault", "Aude", "Pyrénées-Orientales",
]);

function climateScore(city: CitySeed): CyclingDimension {
  const sun = city.sunshinedays ?? 1900;
  const dept = city.department;
  const tempJan = city.avgTempJanuary ?? 4;
  const windy = WINDY_DEPTS.has(dept);

  if (sun >= 2400 && tempJan >= 4 && !windy) {
    return {
      score: 8.0,
      level: "excellent",
      reason:
        "Climat très favorable au vélo — beaucoup de soleil, hivers cléments, vent modéré. Saison cyclable quasi-annuelle.",
    };
  }
  if (windy) {
    return {
      score: 5.0,
      level: "moyen",
      reason:
        "Vent dominant fort (côte atlantique ou couloir rhodanien) — vélo possible mais effort sensible certains jours. Aérodynamique récompensée.",
    };
  }
  if (sun >= 2000 && tempJan >= 3) {
    return {
      score: 7.0,
      level: "bon",
      reason:
        "Climat plutôt favorable — hivers doux, ensoleillement correct. Quelques épisodes pluvieux mais saison cyclable longue.",
    };
  }
  if (tempJan < 1) {
    return {
      score: 4.5,
      level: "moyen",
      reason:
        "Hivers froids prolongés — verglas et neige réduisent la praticabilité plusieurs semaines par an. Très bon en belle saison.",
    };
  }
  return {
    score: 6.0,
    level: "bon",
    reason:
      "Climat océanique tempéré — pluie fréquente mais saison cyclable de 8-9 mois utiles. Équipement étanche conseillé.",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(c: CyclingMobility, name: string): string {
  const tops = [
    { k: "réseau cyclable", d: c.network },
    { k: "topographie", d: c.topography },
    { k: "sécurité", d: c.safety },
    { k: "climat", d: c.climate },
  ]
    .filter((x) => x.d.level === "excellent" || x.d.level === "bon")
    .sort((a, b) => b.d.score - a.d.score);

  const bads = [
    { k: "réseau", d: c.network },
    { k: "topographie", d: c.topography },
    { k: "sécurité", d: c.safety },
    { k: "climat", d: c.climate },
  ]
    .filter((x) => x.d.level === "difficile")
    .sort((a, b) => a.d.score - b.d.score);

  if (c.composite >= 7.5) {
    return `${name} est une ville profondément cyclable — atouts cumulés sur ${tops.slice(0, 2).map((t) => t.k).join(" + ")}.`;
  }
  if (c.composite >= 5.5) {
    return `${name} est globalement praticable à vélo, avec un atout marqué sur le facteur « ${tops[0]?.k ?? "réseau"} ».`;
  }
  if (bads.length > 0) {
    return `${name} reste contraignante à vélo — point dur principal : ${bads[0].k} (${bads[0].d.score}/10).`;
  }
  return `${name} offre des conditions vélo correctes sans excellence particulière sur les 4 dimensions.`;
}

export function computeCyclingMobility(city: CitySeed): CyclingMobility {
  const network = networkScore(city);
  const topography = topographyScore(city);
  const safety = safetyScore(city);
  const climate = climateScore(city);
  // Pondération : réseau 35 % (premier déterminant FUB), topographie 25 %,
  // sécurité 25 %, climat 15 % (moins discriminant que perçu).
  const composite =
    Math.round(
      (network.score * 0.35 + topography.score * 0.25 + safety.score * 0.25 + climate.score * 0.15) * 10
    ) / 10;
  const out: CyclingMobility = {
    composite,
    level: levelFromScore(composite),
    network,
    topography,
    safety,
    climate,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

export const CYCLING_LEVEL_LABEL: Record<CyclingLevel, string> = {
  excellent: "Excellent",
  bon: "Bon",
  moyen: "Moyen",
  difficile: "Difficile",
};

export const CYCLING_LEVEL_COLOR: Record<CyclingLevel, string> = {
  excellent: "text-emerald-600",
  bon: "text-green-600",
  moyen: "text-amber-600",
  difficile: "text-red-600",
};

export const CYCLING_LEVEL_BG: Record<CyclingLevel, string> = {
  excellent: "bg-emerald-50 border-emerald-200",
  bon: "bg-green-50 border-green-200",
  moyen: "bg-amber-50 border-amber-200",
  difficile: "bg-red-50 border-red-200",
};
