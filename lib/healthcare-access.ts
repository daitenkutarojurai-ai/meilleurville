// F47 — Accès aux soins / désert médical par ville
//
// 4 dimensions évaluées depuis le seed (department, population, characterTags).
// Aucune dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - DREES (drees.solidarites-sante.gouv.fr) : densité de médecins
//     généralistes et spécialistes par département (statistiques annuelles).
//   - Ministère Santé / ARS : zonage Zones d'Intervention Prioritaire (ZIP),
//     Zones d'Action Complémentaire (ZAC), zones sous-dotées.
//   - Conseil National de l'Ordre des Médecins (CNOM) : Atlas démographique
//     annuel, projection vieillissement et remplacement des départs.
//   - Fédération Hospitalière de France : carte des centres hospitaliers avec
//     SAU (Service d'Accueil des Urgences) et plateaux techniques.
//
// Tous les scores 0-10. 10 = accès aux soins le plus difficile (désert).
// Composite = moyenne pondérée des 4 sous-scores.

import type { CitySeed } from "@/data/cities-seed";

export type HealthLevel = "facile" | "correct" | "tendu" | "desert";

export interface HealthDimension {
  /** 0-10, 10 = accès le plus difficile */
  score: number;
  level: HealthLevel;
  /** Justification courte */
  reason: string;
}

export interface HealthcareAccess {
  /** Composite 0-10, 10 = désert médical */
  composite: number;
  level: HealthLevel;
  generalistes: HealthDimension;
  specialistes: HealthDimension;
  urgences: HealthDimension;
  pharmacies: HealthDimension;
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): HealthLevel {
  if (s >= 7.5) return "desert";
  if (s >= 5.5) return "tendu";
  if (s >= 3.5) return "correct";
  return "facile";
}

// ─── Médecins généralistes (DREES, densité départementale 2023-2024) ──────
//
// Densité MG France métropolitaine moyenne : ~125 / 100 000 hab.
//
// Très sous-doté (score 9)   : départements ruraux, > 50 % MG > 60 ans,
//   beaucoup de cabinets en fermeture. Cher, Indre, Yonne, Eure, Allier,
//   Haute-Marne, Meuse, Aisne, Orne, Mayenne, Sarthe, Creuse, Cantal,
//   Saône-et-Loire, Nièvre, Vosges.
//
// Sous-doté (score 7)        : densité < 100/100k, vieillissement marqué.
//   Loir-et-Cher, Eure-et-Loir, Indre-et-Loire (hors Tours), Lot, Aveyron,
//   Tarn, Tarn-et-Garonne, Gers, Haute-Saône, Doubs hors agglo, Lozère,
//   Ardennes, Ariège, Hautes-Pyrénées, Charente, Vienne, Deux-Sèvres,
//   Vendée, Loire-Atlantique (hors Nantes), Manche, Calvados (hors Caen),
//   Seine-Maritime hors agglo.
//
// Correct (score 4)          : densité proche moyenne, équilibre OK.
//   La plupart des départements à grande agglo (Gironde, Haute-Garonne,
//   Rhône, Bouches-du-Rhône, Hérault, Loire-Atlantique, Bas-Rhin, etc.).
//
// Bien doté (score 2)        : densité > 145/100k, concentration urbaine.
//   Paris, Hauts-de-Seine, Val-de-Marne, Bouches-du-Rhône (Marseille),
//   Pyrénées-Atlantiques (Bayonne / Pau), Hérault (Montpellier), Alpes-Maritimes
//   (Nice — côte d'Azur attire les MG), Var (côte).

const MG_DESERT_DEPTS = new Set([
  "Cher", "Indre", "Yonne", "Eure", "Allier", "Haute-Marne", "Meuse", "Aisne",
  "Orne", "Mayenne", "Sarthe", "Creuse", "Cantal", "Saône-et-Loire", "Nièvre",
  "Vosges",
]);

const MG_SOUS_DOTE_DEPTS = new Set([
  "Loir-et-Cher", "Eure-et-Loir", "Lot", "Aveyron", "Tarn", "Tarn-et-Garonne",
  "Gers", "Haute-Saône", "Lozère", "Ardennes", "Ariège", "Hautes-Pyrénées",
  "Charente", "Vienne", "Deux-Sèvres", "Vendée", "Manche", "Somme",
  "Pas-de-Calais", "Aube",
]);

const MG_BIEN_DOTE_DEPTS = new Set([
  "Paris", "Hauts-de-Seine", "Val-de-Marne",
  "Pyrénées-Atlantiques", "Hérault", "Alpes-Maritimes", "Var",
  "Bouches-du-Rhône",
]);

function generalistesAccess(city: CitySeed): HealthDimension {
  const d = city.department;
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags) || pop > 150_000;

  if (MG_DESERT_DEPTS.has(d) && !isMetro) {
    return {
      score: 9,
      level: "desert",
      reason: "Département en désert médical avéré (DREES) — densité MG < 80/100k hab., > 50 % des médecins ont plus de 60 ans, départs non remplacés. Délais nouveaux patients 3-6 mois.",
    };
  }
  if (MG_SOUS_DOTE_DEPTS.has(d) && !isMetro) {
    return {
      score: 7,
      level: "tendu",
      reason: "Département sous-doté en médecins généralistes (DREES) — densité < 100/100k. Cabinets souvent fermés aux nouveaux patients hors enfant.",
    };
  }
  if (MG_BIEN_DOTE_DEPTS.has(d) || isMetro) {
    return {
      score: 2.5,
      level: "facile",
      reason: "Département ou agglomération bien doté en médecins généralistes (densité > 130/100k). Inscription possible chez un MG dans la plupart des cas.",
    };
  }
  return {
    score: 5,
    level: "correct",
    reason: "Densité de médecins généralistes proche de la moyenne nationale (~125/100k). Délais raisonnables pour les patients déjà inscrits.",
  };
}

// ─── Spécialistes (concentration métropolitaine) ──────────────────────────
//
// Les spécialistes (cardio, dermato, ophtalmo, gastro, gynéco) se concentrent
// dans les CHU et les grandes agglomérations. Une ville moyenne en zone rurale
// = délais ophtalmo 9-12 mois, dermato 6-8 mois.

const CHU_CITIES = new Set([
  // Communes hébergeant un CHU
  "paris", "lyon", "marseille", "lille", "toulouse", "bordeaux", "nantes",
  "rennes", "montpellier", "nice", "strasbourg", "grenoble", "tours", "rouen",
  "amiens", "angers", "besancon", "brest", "caen", "clermont-ferrand", "dijon",
  "limoges", "nancy", "nimes", "poitiers", "reims", "saint-etienne",
  "fort-de-france", "saint-denis", // CHU DROM (Martinique, Réunion)
  "pointe-a-pitre", "cayenne",
]);

function specialistesAccess(city: CitySeed): HealthDimension {
  const slug = city.slug;
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags) || pop > 200_000;
  const isCHU = CHU_CITIES.has(slug);

  if (isCHU) {
    return {
      score: 2,
      level: "facile",
      reason: "Ville hébergeant un CHU — accès direct à toutes les spécialités, plateau technique complet, recours rapide possible.",
    };
  }
  if (isMetro || pop > 100_000) {
    return {
      score: 4,
      level: "correct",
      reason: "Grande agglomération — la majorité des spécialités est représentée. Délais ophtalmo et dermato 2-4 mois en moyenne.",
    };
  }
  if (pop > 30_000) {
    return {
      score: 6,
      level: "tendu",
      reason: "Ville moyenne — spécialistes présents pour les disciplines de base (cardio, gynéco), mais déplacement souvent nécessaire vers la métropole proche. Délais 4-8 mois.",
    };
  }
  return {
    score: 8,
    level: "desert",
    reason: "Commune éloignée d'une agglomération majeure — quasi tous les spécialistes nécessitent un déplacement vers la préfecture ou le CHU. Délais 6-12 mois courants.",
  };
}

// ─── Urgences / Hôpital (SAU dans la commune ou à proximité) ──────────────
//
// Présence d'un SAU (Service d'Accueil des Urgences) dans la commune ou à
// moins de 30 min en voiture. Critère vital pour AVC, infarctus, traumato.

function urgencesAccess(city: CitySeed): HealthDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags) || pop > 100_000;
  const isCHU = CHU_CITIES.has(city.slug);
  const isMountain = /montagne|station|alpin/.test(tags);
  const isIsland = /île|îles/.test(tags) || ["Corse-du-Sud", "Haute-Corse", "Mayotte", "Guyane"].includes(city.department);

  if (isCHU) {
    return {
      score: 1.5,
      level: "facile",
      reason: "CHU avec SAU 24/7 dans la commune — délai d'accès aux soins critiques < 15 min.",
    };
  }
  if (isMetro || pop > 50_000) {
    return {
      score: 3,
      level: "facile",
      reason: "Centre hospitalier avec SAU dans la commune. Accès urgences sous 15-20 min selon la zone.",
    };
  }
  if (isMountain) {
    return {
      score: 7.5,
      level: "tendu",
      reason: "Commune en zone de montagne — SAU le plus proche souvent à 30-45 min de voiture, plus en cas d'enneigement. Héliportage possible.",
    };
  }
  if (isIsland) {
    return {
      score: 7,
      level: "tendu",
      reason: "Commune en zone insulaire — accès urgences dépendant des liaisons (rotation hélicoptère, bateau). Délais imprévisibles.",
    };
  }
  if (pop > 15_000) {
    return {
      score: 5,
      level: "correct",
      reason: "Pas de SAU sur la commune mais centre hospitalier de référence accessible en 20-30 min en voiture.",
    };
  }
  return {
    score: 7,
    level: "tendu",
    reason: "Commune rurale — SAU le plus proche à 30-45 min en voiture. Couverture SMUR variable selon les heures.",
  };
}

// ─── Pharmacies (densité communale) ───────────────────────────────────────
//
// Heuristique : population × statut urbain. La France a une densité moyenne
// de 1 pharmacie / 3 000 hab. ; sous ce seuil en zone rurale, le maillage
// devient critique (déserts pharmaceutiques émergeants).

function pharmaciesAccess(city: CitySeed): HealthDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isRural = /rural|villageois|campagne/.test(tags);

  if (pop > 50_000) {
    return {
      score: 2,
      level: "facile",
      reason: "Maillage de pharmacies dense (>1/3000 hab.) avec garde 24/7 dans l'agglomération.",
    };
  }
  if (pop > 15_000) {
    return {
      score: 3.5,
      level: "correct",
      reason: "Pharmacies présentes en centre-ville, garde de nuit accessible à courte distance.",
    };
  }
  if (pop > 5_000 && !isRural) {
    return {
      score: 5.5,
      level: "tendu",
      reason: "1 à 2 pharmacies dans la commune — vigilance sur les gardes de nuit et de weekend.",
    };
  }
  return {
    score: 7.5,
    level: "tendu",
    reason: "Petite commune — pharmacie pas toujours présente, ou unique avec horaires restreints. Garde de nuit dans la commune voisine.",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(h: HealthcareAccess, name: string): string {
  const tops = [
    { k: "médecins généralistes", d: h.generalistes },
    { k: "spécialistes", d: h.specialistes },
    { k: "accès urgences", d: h.urgences },
    { k: "pharmacies", d: h.pharmacies },
  ]
    .filter((x) => x.d.level === "tendu" || x.d.level === "desert")
    .sort((a, b) => b.d.score - a.d.score);

  if (tops.length === 0) {
    return `${name} bénéficie d'un accès aux soins facile sur les 4 dimensions clés.`;
  }
  if (tops.length === 1) {
    return `${name} est principalement tendue sur le facteur « ${tops[0].k} » (${tops[0].d.level === "desert" ? "désert" : "tendu"}).`;
  }
  return `${name} cumule plusieurs tensions sur l'accès aux soins : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level === "desert" ? "désert" : "tendu"})`).join(", ")}.`;
}

export function computeHealthcareAccess(city: CitySeed): HealthcareAccess {
  const generalistes = generalistesAccess(city);
  const specialistes = specialistesAccess(city);
  const urgences = urgencesAccess(city);
  const pharmacies = pharmaciesAccess(city);
  // Pondération : MG 35 % (porte d'entrée du système de soins),
  // spécialistes 25 %, urgences 25 % (vital), pharmacies 15 %.
  const composite =
    Math.round(
      (generalistes.score * 0.35 + specialistes.score * 0.25 + urgences.score * 0.25 + pharmacies.score * 0.15) * 10
    ) / 10;
  const out: HealthcareAccess = {
    composite,
    level: levelFromScore(composite),
    generalistes,
    specialistes,
    urgences,
    pharmacies,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

export const HEALTH_LEVEL_LABEL: Record<HealthLevel, string> = {
  facile: "Facile",
  correct: "Correct",
  tendu: "Tendu",
  desert: "Désert",
};

export const HEALTH_LEVEL_COLOR: Record<HealthLevel, string> = {
  facile: "text-emerald-600",
  correct: "text-amber-600",
  tendu: "text-orange-600",
  desert: "text-red-600",
};

export const HEALTH_LEVEL_BG: Record<HealthLevel, string> = {
  facile: "bg-emerald-50 border-emerald-200",
  correct: "bg-amber-50 border-amber-200",
  tendu: "bg-orange-50 border-orange-200",
  desert: "bg-red-50 border-red-200",
};
