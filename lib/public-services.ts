// F60 — Services publics par ville.
//
// 4 dimensions évaluées depuis le seed (department, population, region,
// characterTags). Aucune dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - DEPP (Direction de l'évaluation, ministère Éducation nationale) :
//     annuaire écoles & collèges par commune, zonage REP/REP+.
//   - CAF / Onape : densité places de crèche par dept.
//   - DGAFP / data.gouv.fr Bureaux de Poste + La Poste open data :
//     bureaux de Poste actifs par commune. La Poste a fermé ~1 000 bureaux
//     sur 2017-2024 (substitution par agences postales communales et relais
//     commerçants).
//   - Agence Nationale de la Cohésion des Territoires (ANCT) — Maisons
//     France Services : ~2 800 implantations 2024 (objectif 1 / canton).
//   - BNF Observatoire de la lecture publique : médiathèques / bibliothèques
//     municipales par commune.
//   - Service-Public.fr / annuaire-administration : présence mairie +
//     antennes administratives.
//
// **Convention** : tous les scores 0-10, 10 = déficit maximum d'accès
// (cohérent avec quartet env F40-F43 et clusters F58 sécurité / F59
// démographie). Score faible = bon accès.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";

export type ServicesLevel = "excellent" | "correct" | "tendu" | "desertique";

export interface ServicesDimension {
  /** 0-10, 10 = déficit maximum */
  score: number;
  level: ServicesLevel;
  reason: string;
}

export interface PublicServices {
  /** Composite 0-10, 10 = déficit le plus marqué */
  composite: number;
  level: ServicesLevel;
  schools: ServicesDimension;       // écoles + crèche + collège + lycée
  library: ServicesDimension;       // médiathèque / bibliothèque
  postOffice: ServicesDimension;    // Poste + France Services
  cityHall: ServicesDimension;      // mairie + démarches en présence
  signature: string;
}

function levelFromScore(s: number): ServicesLevel {
  if (s >= 7.5) return "desertique";
  if (s >= 5.5) return "tendu";
  if (s >= 3.5) return "correct";
  return "excellent";
}

// ─── Écoles + petite enfance ──────────────────────────────────────────────
//
// Logique : la maille communale est ce qui compte. Toute commune ≥ 5 000 hab.
// a au moins une école élémentaire. Les goulots d'étranglement sont :
//   - collège (présent ≥ 5 000 hab., 1 / 4 000-6 000 hab. en plus)
//   - lycée (≥ 15 000 hab. ; sinon le lycée du chef-lieu de canton)
//   - crèche : tension forte selon CAF par dept (PACA, Île-de-France
//     dense, DROM = plus tendus que Bretagne / Ouest)
//
// Bonus REP/REP+ = malus visible (zones sous-dotées d'enseignement).

const CRECHE_TENSE_DEPTS = new Set([
  "Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne",
  "Val-d'Oise", "Essonne", "Yvelines", "Seine-et-Marne",
  "Bouches-du-Rhône", "Var", "Alpes-Maritimes",
  "Guadeloupe", "Martinique", "Guyane", "Réunion", "La Réunion", "Mayotte",
]);

const CRECHE_OK_DEPTS = new Set([
  "Finistère", "Côtes-d'Armor", "Morbihan", "Ille-et-Vilaine",
  "Mayenne", "Sarthe", "Loire-Atlantique", "Vendée",
  "Calvados", "Manche", "Orne",
]);

function schoolsRisk(city: CitySeed): ServicesDimension {
  const pop = city.population ?? 0;
  const d = city.department;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);
  const isStudent = /étudiant|universitaire/.test(tags);
  const isRural = /rural|village|campagne/.test(tags);

  // Très grande ville / métropole étudiante : tout est présent
  if (isMetro || isStudent || pop > 80_000) {
    const crecheMalus = CRECHE_TENSE_DEPTS.has(d) ? 1.5 : 0;
    const score = Math.min(10, 2 + crecheMalus);
    return {
      score,
      level: levelFromScore(score),
      reason: `Tous les niveaux scolaires présents (écoles, collèges, lycées). ${crecheMalus > 1 ? "Places de crèche tendues — délais d'attente fréquents en dept dense." : "Maillage périscolaire complet."}`,
    };
  }
  // Ville moyenne (15-80k) : lycée + collège présents
  if (pop > 15_000) {
    const crecheMalus = CRECHE_TENSE_DEPTS.has(d) ? 1 : (CRECHE_OK_DEPTS.has(d) ? -0.5 : 0);
    const score = Math.max(1, Math.min(10, 3 + crecheMalus));
    return {
      score,
      level: levelFromScore(score),
      reason: `Écoles, collège et lycée présents. ${crecheMalus > 0 ? "Tension sur les places de crèche." : "Périscolaire bien dimensionné."}`,
    };
  }
  // Bourg / petite ville (5-15k) : collège quasi-systématique, lycée parfois
  if (pop > 5_000) {
    return {
      score: 5,
      level: "correct",
      reason: "Écoles élémentaires et souvent collège. Lycée souvent au chef-lieu de canton (5-20 min en voiture). Maillage suffisant.",
    };
  }
  // Village (< 5k) : école communale ou regroupement pédagogique
  if (pop > 1_500) {
    return {
      score: 6,
      level: "tendu",
      reason: "École communale ou regroupement pédagogique intercommunal (RPI). Collège et lycée hors commune.",
    };
  }
  return {
    score: isRural ? 8 : 7,
    level: "tendu",
    reason: "Pas d'école dans la commune ou seulement classe unique. Scolarisation principalement hors commune (bus scolaire).",
  };
}

// ─── Médiathèque / bibliothèque municipale ────────────────────────────────
//
// Référentiel BNF / ministère de la Culture : ~16 000 lieux de lecture
// publique en France 2024. Présence quasi-systématique ≥ 10 000 hab. ;
// > 80 % des communes ≥ 3 000 hab. en ont une (BNF observatoire).

function libraryRisk(city: CitySeed): ServicesDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);
  const isStudent = /étudiant|universitaire/.test(tags);
  const isCulturel = /culturel|patrimoine|tourisme|station/.test(tags);

  if (isMetro || isStudent) {
    return {
      score: 1,
      level: "excellent",
      reason: "Réseau de médiathèques métropolitain (souvent ≥ 5 sites) + bibliothèque universitaire. Horaires étendus week-end et soirée.",
    };
  }
  if (pop > 50_000) {
    return {
      score: 2,
      level: "excellent",
      reason: "Médiathèque principale + souvent annexes de quartier. Ressources numériques, salles de travail.",
    };
  }
  if (pop > 15_000 || isCulturel) {
    return {
      score: 3,
      level: "correct",
      reason: "Médiathèque communale ouverte 4-6 jours/semaine. Catalogue numérique et accès Bibliothèques.fr.",
    };
  }
  if (pop > 5_000) {
    return {
      score: 5,
      level: "correct",
      reason: "Bibliothèque municipale ou point lecture intercommunal. Souvent ouvert 2-4 jours/semaine.",
    };
  }
  if (pop > 1_500) {
    return {
      score: 7,
      level: "tendu",
      reason: "Point lecture associatif ou intégré à l'école. Bibliothèque la plus proche au chef-lieu de canton.",
    };
  }
  return {
    score: 8,
    level: "desertique",
    reason: "Pas de bibliothèque communale. Bibliobus départemental ou déplacement nécessaire.",
  };
}

// ─── Bureau de Poste + France Services ────────────────────────────────────
//
// La Poste a fermé ~1 000 bureaux 2017-2024. Substitution : Agences Postales
// Communales (APC), Relais Poste Commerçants (RPC), Maisons France Services
// (~2 800 en 2024). Maillage très dépendant du département :
// - DROM (Mayotte / Guyane) = très tendu
// - Rural Centre / Bourgogne / Limousin = tendu (fermetures depuis 2017)
// - Métropoles & IDF dense = excellent (multiple bureaux par commune)

const POST_RURAL_TENSE_DEPTS = new Set([
  "Creuse", "Cantal", "Lozère", "Nièvre", "Indre", "Aveyron",
  "Lot", "Corrèze", "Haute-Marne", "Meuse", "Vosges",
  "Saône-et-Loire", "Yonne", "Allier", "Cher", "Haute-Saône",
  "Ardennes", "Ariège", "Hautes-Pyrénées",
]);

const POST_DROM_VERY_TENSE = new Set([
  "Guyane", "Mayotte",
]);

function postOfficeRisk(city: CitySeed): ServicesDimension {
  const pop = city.population ?? 0;
  const d = city.department;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);

  if (POST_DROM_VERY_TENSE.has(d)) {
    return {
      score: 8.5,
      level: "desertique",
      reason: "Maillage très réduit — délais de traitement courrier et colis longs. Service public Postal souvent débordé.",
    };
  }
  if (isMetro || pop > 80_000) {
    return {
      score: 1.5,
      level: "excellent",
      reason: "Plusieurs bureaux de Poste actifs + Maison France Services. Démarches multi-services centralisées.",
    };
  }
  if (pop > 20_000) {
    return {
      score: 2.5,
      level: "excellent",
      reason: "Bureau de Poste principal + souvent une Maison France Services. Horaires complets (Lun-Sam).",
    };
  }
  if (pop > 5_000) {
    const tense = POST_RURAL_TENSE_DEPTS.has(d) ? 1 : 0;
    return {
      score: 4 + tense,
      level: "correct",
      reason: `Bureau de Poste communal ou Agence Postale Communale (APC). ${tense ? "Département en recul du maillage La Poste — horaires réduits possibles." : "Horaires standards."}`,
    };
  }
  if (pop > 1_500) {
    const tense = POST_RURAL_TENSE_DEPTS.has(d) ? 1.5 : 0;
    return {
      score: 6 + tense,
      level: "tendu",
      reason: "Relais Poste Commerçant (RPC) chez un buraliste/épicerie. Pas de bureau de Poste plein exercice ; certaines démarches au chef-lieu de canton.",
    };
  }
  return {
    score: POST_RURAL_TENSE_DEPTS.has(d) ? 8.5 : 7.5,
    level: "desertique",
    reason: "Pas de Poste ni d'agence postale dans la commune. Bureau le plus proche à 5-15 min en voiture.",
  };
}

// ─── Mairie + démarches en présence ───────────────────────────────────────
//
// Toute commune dispose d'une mairie. Ce qui varie :
//   - Amplitude d'ouverture (métropoles : 5j/7, ruralité : 2-3 demi-journées)
//   - Présence d'antennes pour les grandes villes (très grandes communes ont
//     plusieurs mairies d'arrondissement / annexes : Paris, Lyon, Marseille)
//   - Présence d'une Maison France Services pour les démarches CAF / CPAM /
//     impôts / Pôle Emploi en présence

function cityHallRisk(city: CitySeed): ServicesDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);

  if (isMetro || pop > 100_000) {
    return {
      score: 1.5,
      level: "excellent",
      reason: "Mairie centrale + mairies de quartier/arrondissement. Démarches étendues sur rendez-vous (passeport, CNI, état-civil).",
    };
  }
  if (pop > 30_000) {
    return {
      score: 2.5,
      level: "excellent",
      reason: "Mairie ouverte 5 jours sur 7, services dématérialisés en ligne. Souvent doublée d'une Maison France Services.",
    };
  }
  if (pop > 10_000) {
    return {
      score: 3.5,
      level: "correct",
      reason: "Mairie ouverte du lundi au vendredi + samedi matin. Démarches CNI/passeport possibles sur rendez-vous.",
    };
  }
  if (pop > 3_000) {
    return {
      score: 5,
      level: "correct",
      reason: "Mairie ouverte 4-5 demi-journées par semaine. Démarches CNI / passeport au chef-lieu de canton.",
    };
  }
  if (pop > 800) {
    return {
      score: 6.5,
      level: "tendu",
      reason: "Mairie ouverte 2-3 demi-journées par semaine. Secrétariat unique. Démarches lourdes au chef-lieu.",
    };
  }
  return {
    score: 7.5,
    level: "tendu",
    reason: "Mairie ouverte 1-2 demi-journées par semaine. Secrétaire intercommunal mutualisé sur plusieurs villages.",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(d: PublicServices, name: string): string {
  const tops = [
    { k: "écoles & enfance", d: d.schools },
    { k: "médiathèque", d: d.library },
    { k: "La Poste / France Services", d: d.postOffice },
    { k: "mairie & démarches", d: d.cityHall },
  ]
    .filter((x) => x.d.level === "tendu" || x.d.level === "desertique")
    .sort((a, b) => b.d.score - a.d.score);

  if (d.composite <= 3) {
    return `${name} offre un accès aux services publics excellent — maillage complet sur les quatre axes (école, lecture publique, Poste, mairie).`;
  }
  if (tops.length === 0) {
    return `${name} dispose d'un accès aux services publics correct sur l'ensemble des dimensions.`;
  }
  if (tops.length === 1) {
    return `${name} accuse une tension principalement sur « ${tops[0].k} » (${tops[0].d.level}).`;
  }
  return `${name} cumule plusieurs tensions sur les services publics : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level})`).join(", ")}.`;
}

export function computePublicServices(city: CitySeed): PublicServices {
  const schools = schoolsRisk(city);
  const library = libraryRisk(city);
  const postOffice = postOfficeRisk(city);
  const cityHall = cityHallRisk(city);
  // Pondération : écoles 35 % (le plus structurant pour familles),
  // mairie 25 % (état-civil indispensable), Poste 25 % (logistique du
  // quotidien), médiathèque 15 % (axe culturel).
  const composite =
    Math.round(
      (schools.score * 0.35 + cityHall.score * 0.25 + postOffice.score * 0.25 + library.score * 0.15) * 10
    ) / 10;
  const out: PublicServices = {
    composite,
    level: levelFromScore(composite),
    schools,
    library,
    postOffice,
    cityHall,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

// ─── Rankings ─────────────────────────────────────────────────────────────

export interface PublicServicesRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  services: PublicServices;
}

let SERVICES_RANKING_CACHE: PublicServicesRanking[] | null = null;

export function getPublicServicesRankings(): PublicServicesRanking[] {
  if (SERVICES_RANKING_CACHE) return SERVICES_RANKING_CACHE;
  SERVICES_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    services: computePublicServices(c),
  }));
  return SERVICES_RANKING_CACHE;
}

/** Villes au meilleur accès = composite le plus bas. */
export function topBestServices(limit = 30, minPopulation = 0): PublicServicesRanking[] {
  return getPublicServicesRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.services.composite - b.services.composite)
    .slice(0, limit);
}

/** Villes les plus désertées = composite le plus élevé. */
export function topServicesDesert(limit = 20, minPopulation = 0): PublicServicesRanking[] {
  return getPublicServicesRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.services.composite - a.services.composite)
    .slice(0, limit);
}

export const SERVICES_LEVEL_LABEL: Record<ServicesLevel, string> = {
  excellent: "Excellent",
  correct: "Correct",
  tendu: "Tendu",
  desertique: "Désertique",
};

export const SERVICES_LEVEL_COLOR: Record<ServicesLevel, string> = {
  excellent: "text-emerald-600",
  correct: "text-amber-600",
  tendu: "text-orange-600",
  desertique: "text-red-600",
};

export const SERVICES_LEVEL_BG: Record<ServicesLevel, string> = {
  excellent: "bg-emerald-50 border-emerald-200",
  correct: "bg-amber-50 border-amber-200",
  tendu: "bg-orange-50 border-orange-200",
  desertique: "bg-red-50 border-red-200",
};
