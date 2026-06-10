// F70 — Sport & loisirs sportifs par ville.
//
// 4 dimensions évaluées depuis le seed (department, population, elevation,
// characterTags, sunshinedays, avgTempJuly, avgTempJanuary). Aucune
// dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - INJEP / RES (Recensement des Équipements Sportifs, sports.gouv.fr) :
//     densité piscines, stades, salles couvertes, terrains polyvalents.
//   - DRAJES / DDETSPP : maillage clubs et fédérations agréées Jeunesse & Sport.
//   - INSEP, CREPS (Centres de Ressources, d'Expertise et de Performance
//     Sportive) : présence d'une infrastructure élite (Vichy, Font-Romeu,
//     Vincennes, Boulouris, Antibes, Talence, Strasbourg, Châtenay-Malabry).
//   - IGN / Météo-France : altitude, distance côtière, climatologie 1991-2020.
//   - FFRandonnée : densité GR/PR par département.
//
// **Convention** : tous les scores 0-10, 10 = excellent pour la pratique
// sportive (cohérent avec F57 vélo, opposé du quartet env F40-F43).
// Composite = moyenne pondérée des 4 sous-scores.

import type { CitySeed } from "@/data/cities-seed";

export type SportLevel = "excellent" | "bon" | "moyen" | "limité";

export interface SportDimension {
  /** 0-10, 10 = idéal pour la pratique sportive */
  score: number;
  level: SportLevel;
  /** Justification courte */
  reason: string;
}

export interface SportLeisure {
  /** Composite 0-10, 10 = excellent */
  composite: number;
  level: SportLevel;
  facilities: SportDimension;  // équipements municipaux + élite
  outdoor: SportDimension;     // cadre naturel pour le plein air
  clubs: SportDimension;       // vie associative sportive
  climate: SportDimension;     // climat propice à l'activité
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): SportLevel {
  if (s >= 7.5) return "excellent";
  if (s >= 5.5) return "bon";
  if (s >= 3.5) return "moyen";
  return "limité";
}

// ─── Équipements sportifs (RES, INJEP) ────────────────────────────────────
//
// Communes hébergeant un CREPS / INSEP ou un pôle d'excellence reconnu :
// piscines olympiques, vélodromes couverts, halles d'athlétisme, base
// nautique nationale. Cumul équipement élite + maillage municipal dense.

const ELITE_SPORT_CITIES = new Set([
  "vichy",          // CREPS Vichy Auvergne (athlétisme, natation)
  "font-romeu-odeillo-via", "font-romeu", // CNEA altitude
  "boulouris", "saint-raphael",  // ENVSN voile + base nautique
  "antibes",        // CREPS PACA + sports nautiques
  "talence",        // CREPS Bordeaux-Aquitaine
  "strasbourg",     // CREPS Grand-Est + vélodrome
  "chatenay-malabry", // CREPS Île-de-France
  "macon",          // CREPS BFC
  "wattignies", "lille", // CREPS Hauts-de-France
  "nantes",         // CREPS Pays-de-la-Loire + nautisme
  "poitiers",       // CREPS Nouvelle-Aquitaine
  "rouen",          // CREPS Normandie
  "marseille",      // INSEP voile + stade Vélodrome + bases nautiques
  "paris",          // INSEP Vincennes (officiellement Saint-Mandé)
  "saint-mande", "vincennes", // INSEP siège
  "grenoble",       // Patinoire olympique 1968 + ski cluster
  "chambery",       // Halle Olympique Albertville (proche) + ski
  "albertville",    // Patinoire + halle olympique
  "tignes", "val-d-isere", "courchevel", "meribel", // stations élite
  "annecy",         // Sportif outdoor + nautisme lac
  "biarritz",       // Surf + golf historique
  "lourdes",        // Stade Pyrenees + rugby
  "toulouse",       // INP STAPS + rugby clusters
  "clairefontaine", // INF foot
  "tours",          // CREPS Centre-Val-de-Loire
]);

function facilitiesScore(city: CitySeed): SportDimension {
  const slug = city.slug.toLowerCase();
  const tags = (city.characterTags ?? []).map((t) => t.toLowerCase());
  const pop = city.population ?? 0;
  const hasSportTag = tags.includes("sport") || tags.includes("rugby") ||
                       tags.includes("sport nautique") || tags.includes("foot");
  const hasMetro = tags.includes("métropole");
  const isElite = ELITE_SPORT_CITIES.has(slug);

  if (isElite) {
    return {
      score: 9.0,
      level: "excellent",
      reason:
        "Pôle sportif d'excellence (CREPS, INSEP ou équipement national reconnu) — piscines, gymnases, halles, parfois patinoire ou vélodrome. Maillage municipal au-dessus de la moyenne nationale.",
    };
  }
  if (hasMetro && pop > 200_000) {
    return {
      score: 7.5,
      level: "excellent",
      reason:
        "Grande métropole — densité élevée de piscines, stades, gymnases, terrains polyvalents. Offre privée (salles de fitness, escalade, crossfit) très étoffée.",
    };
  }
  if (pop > 80_000 || hasSportTag) {
    return {
      score: 6.5,
      level: "bon",
      reason:
        "Ville moyenne avec offre municipale complète — piscine couverte, stades, gymnases scolaires ouverts au public, complexes multisport. Tissu privé correct.",
    };
  }
  if (pop > 30_000) {
    return {
      score: 5.0,
      level: "moyen",
      reason:
        "Offre municipale standard — piscine (souvent unique), stade, quelques gymnases. Pour disciplines spécialisées (escalade, escrime, judo de haut niveau), il faut souvent rayonner sur l'agglo voisine.",
    };
  }
  return {
    score: 3.5,
    level: "moyen",
    reason:
      "Commune petite — équipements limités, souvent partagés à l'échelle intercommunale. Bon pour les sports d'extérieur ; pour le reste, déplacement vers une ville-centre nécessaire.",
  };
}

// ─── Outdoor / cadre naturel ─────────────────────────────────────────────
//
// Le département + l'altitude + les tags donnent une signature outdoor
// solide. Une commune avec montagne ET mer ET tag "nature" cumule.

const MOUNTAIN_DEPTS = new Set([
  // Alpes
  "Haute-Savoie", "Savoie", "Isère", "Hautes-Alpes",
  "Alpes-de-Haute-Provence", "Alpes-Maritimes",
  // Pyrénées
  "Pyrénées-Atlantiques", "Hautes-Pyrénées", "Ariège",
  "Pyrénées-Orientales", "Haute-Garonne",
  // Massif Central
  "Cantal", "Haute-Loire", "Lozère", "Aveyron", "Puy-de-Dôme",
  "Corrèze", "Creuse",
  // Vosges + Jura
  "Vosges", "Haut-Rhin", "Doubs", "Jura", "Territoire de Belfort",
  // Corse
  "Corse-du-Sud", "Haute-Corse",
]);

const COASTAL_DEPTS = new Set([
  // Manche / Atlantique
  "Nord", "Pas-de-Calais", "Somme", "Seine-Maritime",
  "Calvados", "Manche",
  "Ille-et-Vilaine", "Côtes-d'Armor", "Finistère", "Morbihan",
  "Loire-Atlantique", "Vendée", "Charente-Maritime", "Gironde",
  "Landes", "Pyrénées-Atlantiques",
  // Méditerranée
  "Pyrénées-Orientales", "Aude", "Hérault", "Gard",
  "Bouches-du-Rhône", "Var", "Alpes-Maritimes",
  "Corse-du-Sud", "Haute-Corse",
  // DROM
  "Guadeloupe", "Martinique", "La Réunion", "Mayotte", "Guyane",
]);

const FOREST_DEPTS = new Set([
  // Massifs forestiers majeurs (Landes, Vosges, Sologne, Fontainebleau, Morvan)
  "Landes", "Gironde",
  "Vosges", "Haut-Rhin", "Bas-Rhin", "Meurthe-et-Moselle",
  "Loir-et-Cher", "Cher", "Loiret", "Indre",
  "Seine-et-Marne",
  "Nièvre", "Saône-et-Loire", "Yonne",
]);

const LAKE_RIVER_DEPTS = new Set([
  // Lacs alpins + Léman, grands fleuves navigables
  "Haute-Savoie", "Savoie", "Ain",
  // Marne navigable
  "Marne", "Haute-Marne",
  // Loire / Dordogne / Garonne pour canoë
  "Loire-Atlantique", "Maine-et-Loire", "Indre-et-Loire",
  "Loir-et-Cher", "Dordogne", "Lot",
]);

function outdoorScore(city: CitySeed): SportDimension {
  const dept = city.department;
  const elev = city.elevation ?? 0;
  const tags = (city.characterTags ?? []).map((t) => t.toLowerCase());
  const mountain = MOUNTAIN_DEPTS.has(dept) || elev > 400;
  const coastal = COASTAL_DEPTS.has(dept) && (
    tags.includes("mer") || tags.includes("maritime") || tags.includes("surf") ||
    tags.includes("méditerranéen") || tags.includes("sport nautique") ||
    tags.includes("breton")
  );
  const forest = FOREST_DEPTS.has(dept) || tags.includes("nature") || tags.includes("verdoyant");
  const lake = LAKE_RIVER_DEPTS.has(dept) || tags.includes("lac");
  const natureBoost = tags.includes("montagne") || tags.includes("nature") || tags.includes("sport");

  let count = 0;
  if (mountain) count++;
  if (coastal) count++;
  if (forest) count++;
  if (lake) count++;

  if ((mountain && coastal) || (count >= 3) || (natureBoost && count >= 2)) {
    return {
      score: 9.0,
      level: "excellent",
      reason:
        "Cadre naturel exceptionnel — au moins deux terrains de jeu majeurs accessibles (montagne / mer / forêt / lac). Rando, trail, vélo, nautisme, ski potentiellement combinables sur l'année.",
    };
  }
  if (mountain) {
    return {
      score: 8.0,
      level: "excellent",
      reason:
        "Cadre montagnard — randonnée, trail, VTT, escalade, ski l'hiver selon altitude. Dénivelé permanent à proximité, terrains d'entraînement gratuits.",
    };
  }
  if (coastal) {
    return {
      score: 7.5,
      level: "excellent",
      reason:
        "Cadre côtier — voile, surf, paddle, plongée, longe-côte. Plages utilisables pour la course à pied et le sport collectif en saison.",
    };
  }
  if (lake) {
    return {
      score: 6.5,
      level: "bon",
      reason:
        "Plan d'eau majeur à proximité (lac alpin, plan d'eau de barrage, ou fleuve navigable) — aviron, canoë, paddle, baignade encadrée. Bases de loisirs municipales fréquentes.",
    };
  }
  if (forest) {
    return {
      score: 6.0,
      level: "bon",
      reason:
        "Massif forestier ou nature périurbaine accessible — sentiers balisés FFRandonnée, parcours santé, VTT en terrain roulant. Idéal pour la pratique régulière sans déplacement long.",
    };
  }
  if (natureBoost) {
    return {
      score: 5.5,
      level: "bon",
      reason:
        "Ambiance plutôt nature même hors massif ou côte — chemins ruraux, vergers, sites classés. Outdoor possible mais nécessite parfois de chercher les itinéraires.",
    };
  }
  return {
    score: 4.0,
    level: "moyen",
    reason:
      "Cadre péri-urbain ou agricole sans relief ni façade naturelle marquée — outdoor utilitaire (course à pied, vélo route) accessible, mais peu de variété hors aménagements municipaux.",
  };
}

// ─── Vie associative sportive (DRAJES, INJEP) ────────────────────────────
//
// Densité du tissu associatif sportif : nombre de clubs agréés et licenciés
// par habitant. INSEE + INJEP : on observe une forte densité dans les
// métropoles étudiantes et les régions à identité sportive (Pays Basque,
// Auvergne-Rhône-Alpes, Bretagne). DROM globalement bien dotés. Désert
// associatif dans le rural ultra-isolé Centre/Est.

const STRONG_CLUB_DEPTS = new Set([
  // Pays Basque / Béarn — rugby, surf, pelote
  "Pyrénées-Atlantiques", "Landes", "Hautes-Pyrénées",
  // Auvergne-Rhône-Alpes — multi-disciplines
  "Rhône", "Métropole de Lyon", "Isère", "Haute-Savoie", "Savoie",
  "Puy-de-Dôme", "Loire", "Allier",
  // Bretagne — voile, foot, sports collectifs
  "Finistère", "Morbihan", "Ille-et-Vilaine", "Côtes-d'Armor",
  // PACA — multi
  "Bouches-du-Rhône", "Var", "Alpes-Maritimes",
  // Sud-Ouest rugby
  "Haute-Garonne", "Tarn", "Tarn-et-Garonne", "Aveyron",
]);

const WEAK_CLUB_DEPTS = new Set([
  // Rural ultra-isolé Centre/Est en déprise démographique
  "Creuse", "Cantal", "Lozère", "Haute-Marne", "Indre",
  "Nièvre", "Meuse", "Haute-Saône",
  // DROM les plus tendus
  "Mayotte", "Guyane",
]);

function clubsScore(city: CitySeed): SportDimension {
  const dept = city.department;
  const tags = (city.characterTags ?? []).map((t) => t.toLowerCase());
  const pop = city.population ?? 0;
  const isStudent = tags.includes("étudiant") || tags.includes("universitaire");
  const isMetro = tags.includes("métropole");
  const isRural = pop < 15_000 && WEAK_CLUB_DEPTS.has(dept);
  const hasSportTag = tags.includes("sport") || tags.includes("rugby") ||
                       tags.includes("sport nautique");

  if (STRONG_CLUB_DEPTS.has(dept) && (isStudent || isMetro || hasSportTag || pop > 30_000)) {
    return {
      score: 8.5,
      level: "excellent",
      reason:
        "Département à forte identité sportive (Pays Basque, AURA, Bretagne, PACA, Sud-Ouest rugby) — tissu associatif dense, diversité des disciplines, licenciés au-dessus de la moyenne nationale.",
    };
  }
  if (isMetro || (pop > 80_000 && isStudent)) {
    return {
      score: 7.5,
      level: "excellent",
      reason:
        "Grande agglo + bassin étudiant — multitude de clubs FFSU et fédéraux, sports émergents (escalade, crossfit, ultimate, roller derby) bien représentés.",
    };
  }
  if (STRONG_CLUB_DEPTS.has(dept)) {
    return {
      score: 7.0,
      level: "bon",
      reason:
        "Département à identité sportive marquée — clubs structurés même en petite commune, fédérations locales actives, événements régionaux.",
    };
  }
  if (isRural) {
    return {
      score: 3.5,
      level: "moyen",
      reason:
        "Rural en déprise démographique — tissu associatif sportif fragile, peu de disciplines accessibles localement. Souvent un seul club par discipline majeure, déplacement nécessaire pour la compétition.",
    };
  }
  if (pop > 40_000) {
    return {
      score: 6.0,
      level: "bon",
      reason:
        "Ville moyenne — éventail de clubs municipaux et fédéraux couvrant la plupart des disciplines majeures. Compétition régionale accessible.",
    };
  }
  return {
    score: 5.0,
    level: "moyen",
    reason:
      "Maillage standard — clubs couvrant les disciplines populaires (foot, tennis, judo, basket), parfois carences sur les sports rares.",
  };
}

// ─── Climat propice à la pratique sportive ───────────────────────────────
//
// L'activité extérieure régulière est facilitée par : soleil annuel, été
// pas suffocant, hiver doux et sans verglas prolongé. Le climat le plus
// favorable est l'arc méditerranéen avec un bémol pour les pics > 35 °C
// estivaux. Le DROM est très favorable hors saison cyclonique.

function climateSportScore(city: CitySeed): SportDimension {
  const sun = city.sunshinedays ?? 1900;
  const tempJul = city.avgTempJuly ?? 21;
  const tempJan = city.avgTempJanuary ?? 4;

  // Pénalité canicule : au-delà de 25 °C de moyenne juillet, séances
  // outdoor matin/soir uniquement quelques semaines par an.
  const canicula = Math.max(0, tempJul - 25);
  // Pénalité froid : au-delà de -1 °C dessous de 1 °C de moyenne janvier,
  // verglas prolongé et neige.
  const harshWinter = Math.max(0, 1 - tempJan);

  if (sun >= 2400 && tempJan >= 5 && tempJul <= 26) {
    return {
      score: 9.0,
      level: "excellent",
      reason:
        "Climat très favorable — beaucoup de soleil, hivers cléments, étés chauds sans excès. Pratique extérieure quasi-annuelle, sport en plein air sans interruption longue.",
    };
  }
  if (sun >= 2200 && tempJan >= 3 && tempJul <= 28) {
    return {
      score: 8.0,
      level: "excellent",
      reason:
        "Climat plutôt favorable — soleil au-dessus de la moyenne nationale, hivers doux. Adaptations estivales recommandées les jours de canicule.",
    };
  }
  if (canicula >= 2) {
    return {
      score: 5.0,
      level: "moyen",
      reason:
        "Étés très chauds (moyenne juillet > 27 °C) — séances outdoor matin et soir uniquement plusieurs semaines par an, sport intérieur dominant en pic. Reste excellent le reste de l'année.",
    };
  }
  if (harshWinter >= 2) {
    return {
      score: 5.5,
      level: "moyen",
      reason:
        "Hivers froids prolongés — verglas et neige réduisent la praticabilité plusieurs semaines. Sport indoor dominant décembre-février, mais bonne saison estivale.",
    };
  }
  if (sun >= 1900) {
    return {
      score: 6.5,
      level: "bon",
      reason:
        "Climat tempéré océanique ou semi-continental — saison sportive longue, pluie fréquente mais rarement bloquante. Équipement étanche conseillé.",
    };
  }
  return {
    score: 5.5,
    level: "moyen",
    reason:
      "Climat plus contrasté — soleil sous la moyenne, alternance pluie/froid demande équipement adapté. Pratique régulière possible mais moins agréable que dans le Sud.",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(s: SportLeisure, name: string): string {
  const tops = [
    { k: "équipements", d: s.facilities },
    { k: "cadre outdoor", d: s.outdoor },
    { k: "vie associative", d: s.clubs },
    { k: "climat", d: s.climate },
  ]
    .filter((x) => x.d.level === "excellent" || x.d.level === "bon")
    .sort((a, b) => b.d.score - a.d.score);

  const bads = [
    { k: "équipements", d: s.facilities },
    { k: "cadre outdoor", d: s.outdoor },
    { k: "vie associative", d: s.clubs },
    { k: "climat", d: s.climate },
  ]
    .filter((x) => x.d.level === "limité")
    .sort((a, b) => a.d.score - b.d.score);

  if (s.composite >= 7.5) {
    return `${name} est un terrain de jeu sportif complet — atouts cumulés sur ${tops.slice(0, 2).map((t) => t.k).join(" + ")}.`;
  }
  if (s.composite >= 5.5) {
    return `${name} permet une pratique sportive variée, avec un atout marqué sur le facteur « ${tops[0]?.k ?? "équipements"} ».`;
  }
  if (bads.length > 0) {
    return `${name} reste contraignante pour la pratique régulière — point dur : ${bads[0].k} (${bads[0].d.score}/10).`;
  }
  return `${name} offre des conditions sportives correctes sans excellence particulière sur les 4 dimensions.`;
}

export function computeSportLeisure(city: CitySeed): SportLeisure {
  const facilities = facilitiesScore(city);
  const outdoor = outdoorScore(city);
  const clubs = clubsScore(city);
  const climate = climateSportScore(city);
  // Pondération : équipements 35 % (déterminant pour la pratique
  // structurée), outdoor 30 % (loisir libre), clubs 20 % (entraînement
  // encadré), climat 15 % (moins discriminant que perçu).
  const composite =
    Math.round(
      (facilities.score * 0.35 + outdoor.score * 0.30 + clubs.score * 0.20 + climate.score * 0.15) * 10
    ) / 10;
  const out: SportLeisure = {
    composite,
    level: levelFromScore(composite),
    facilities,
    outdoor,
    clubs,
    climate,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

export const SPORT_LEVEL_LABEL: Record<SportLevel, string> = {
  excellent: "Excellent",
  bon: "Bon",
  moyen: "Moyen",
  "limité": "Limité",
};

export const SPORT_LEVEL_COLOR: Record<SportLevel, string> = {
  excellent: "text-emerald-600",
  bon: "text-green-600",
  moyen: "text-amber-600",
  "limité": "text-red-600",
};

export const SPORT_LEVEL_BG: Record<SportLevel, string> = {
  excellent: "bg-emerald-50 border-emerald-200",
  bon: "bg-green-50 border-green-200",
  moyen: "bg-amber-50 border-amber-200",
  "limité": "bg-red-50 border-red-200",
};
