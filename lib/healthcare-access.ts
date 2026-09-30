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
// **Convention** : tous les scores 0-10, 10 = accès le plus difficile (désert),
// cohérent avec le quartet env F40-F43. Mais les surfaces s'appellent « Santé »
// / « Accès aux soins », c'est-à-dire une QUALITÉ : elles affichent donc
// `10 - score` et annoncent « 10 = excellent accès ». L'inversion se fait au
// site d'affichage seulement — tris, niveaux et classements gardent la brute.
// Composite = moyenne pondérée des 4 sous-scores.

import type { CityLight } from "@/lib/cities-light";

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

function generalistesAccess(city: CityLight): HealthDimension {
  const d = city.department;
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags) || pop > 150_000;

  if (MG_DESERT_DEPTS.has(d) && !isMetro) {
    return {
      score: 9,
      level: "desert",
      reason: "Département classé en désert médical par le modèle — le palier retenu correspond aux repères DREES du sous-équipement (densité MG sous 80/100k hab., plus de la moitié des praticiens au-delà de 60 ans, départs non remplacés). Aucune densité n'est relevée ici : c'est le département, pas le cabinet, qui est classé.",
    };
  }
  if (MG_SOUS_DOTE_DEPTS.has(d) && !isMetro) {
    return {
      score: 7,
      level: "tendu",
      reason: "Département classé sous-doté par le modèle — palier calé sur le repère DREES des densités inférieures à 100/100k hab. Cabinets souvent fermés aux nouveaux patients hors enfant.",
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

// ─── Sites de CHU et distance au plateau technique ────────────────────────
//
// Jusqu'au 2026-09-30, cette dimension testait l'appartenance du **slug de la
// commune** à un `Set` de villes « hébergeant un CHU ». Deux défauts, tous
// deux silencieux :
//
// ① Le `Set` portait `"saint-denis"` sous le commentaire « CHU DROM », mais ce
//    slug est **Saint-Denis (Seine-Saint-Denis)**, qui n'a pas de CHU — c'est
//    le centre hospitalier Delafontaine, le CHU voisin étant Avicenne, à
//    Bobigny. La Réunion s'écrit `saint-denis-reunion` et n'y figurait pas,
//    alors qu'elle héberge le site Félix-Guyon du CHU de La Réunion. Les deux
//    composites valaient 2,9, donc aucun contrôle sur le composite ne pouvait
//    voir l'échange. Dixième occurrence du piège d'homonymie déjà rencontré
//    aux batches 30 à 33 de la série tourisme.
// ② Un test d'appartenance sur le slug ne crédite que la commune qui **porte
//    le nom** du CHU. Le Kremlin-Bicêtre, qui héberge l'hôpital Bicêtre
//    (AP-HP), sortait 8,0 sur les spécialistes, c'est-à-dire le niveau
//    « désert » ; même cas pour Bron (groupement hospitalier Est des HCL),
//    Pessac (Haut-Lévêque) et Vandœuvre-lès-Nancy (Brabois).
//
// Ce que la dimension veut mesurer n'est pas une limite communale mais une
// **distance à un plateau technique**. La table porte donc les communes
// d'implantation des sites, et le score se calcule sur la distance.
//
// **Coordonnées** : celles que `data/cities-seed.ts` publie pour la commune
// d'implantation — aucune n'est saisie à la main. `npm run integrity` refuse
// toute entrée dont le nom ne désigne pas une ville du seed, ou dont les
// coordonnées s'en écartent : c'est ce garde qui aurait attrapé le défaut ①.
// La précision est donc celle d'un centroïde de commune, quelques kilomètres,
// ce qui est aussi le grain des paliers ci-dessous — on ne mesure pas une
// distance au porche de l'hôpital.
//
// **Sites non dupliqués** : une implantation située dans une commune absente
// du seed (La Tronche pour Grenoble, Salouël pour Amiens, Chambray-lès-Tours,
// Saint-Priest-en-Jarez, Villejuif, Clamart, Bobigny) est à quelques
// kilomètres de la ville qui donne son nom au CHU, donc déjà couverte par le
// point de celle-ci. L'AP-HP compte à elle seule une trentaine de sites en
// Île-de-France : le point « Paris » vaut pour la grappe, Bicêtre et
// Henri-Mondor étant les deux seuls assez excentrés pour peser à part.
//
// **Limite de frontière** : la table ne porte que des sites français. Le CHU le
// plus proche d'Hendaye y sort à 184,8 km (Pessac) alors que Saint-Sébastien est
// à une trentaine de kilomètres — la mesure est juste pour « CHU français » et
// surestime la distance réelle au plateau technique sur une poignée de communes
// frontalières. Même limite que le disque des zones protégées, qui déborde sur
// un pays où la BD TOPO n'a aucun périmètre.
//
// **Ce qui n'est pas ici** : Cayenne, dont le centre hospitalier a été érigé
// en CHR par décret en mai 2025 et **non** en CHU, et Metz-Thionville, qui est
// un CHR. Pointe-à-Pitre non plus — le CHU de la Guadeloupe est implanté aux
// **Abymes**, à 3 km, donc la ville reste créditée par la distance et non par
// son nom. Orléans, en revanche, entre : son CHR a été érigé en CHU en 2022.

interface ChuSite {
  /** Commune d'implantation, telle que `data/cities-seed.ts` la nomme. */
  commune: string;
  lat: number;
  lng: number;
}

export const CHU_SITES: readonly ChuSite[] = [
  { commune: "Amiens", lat: 49.8941, lng: 2.2958 }, // CHU Amiens-Picardie (site Sud à Salouël, limitrophe)
  { commune: "Angers", lat: 47.4784, lng: -0.5632 }, // CHU d'Angers
  { commune: "Besançon", lat: 47.2378, lng: 6.0241 }, // CHU de Besançon — Jean-Minjoz
  { commune: "Bordeaux", lat: 44.8378, lng: -0.5792 }, // CHU de Bordeaux — Pellegrin, Saint-André
  { commune: "Pessac", lat: 44.8083, lng: -0.6311 }, // CHU de Bordeaux — Haut-Lévêque
  { commune: "Brest", lat: 48.3906, lng: -4.4861 }, // CHU de Brest — La Cavale Blanche, Morvan
  { commune: "Caen", lat: 49.1831, lng: -0.3707 }, // CHU de Caen Normandie
  { commune: "Clermont-Ferrand", lat: 45.7797, lng: 3.087 }, // CHU de Clermont-Ferrand — Gabriel-Montpied, Estaing
  { commune: "Dijon", lat: 47.322, lng: 5.0415 }, // CHU Dijon Bourgogne — François-Mitterrand
  { commune: "Grenoble", lat: 45.1885, lng: 5.7245 }, // CHU Grenoble Alpes (site nord à La Tronche, limitrophe)
  { commune: "Lille", lat: 50.6292, lng: 3.0573 }, // CHU de Lille
  { commune: "Limoges", lat: 45.8354, lng: 1.2644 }, // CHU de Limoges — Dupuytren
  { commune: "Lyon", lat: 45.748, lng: 4.8467 }, // Hospices civils de Lyon — Édouard-Herriot, Croix-Rousse
  { commune: "Bron", lat: 45.7339, lng: 4.9156 }, // Hospices civils de Lyon — groupement hospitalier Est (Wertheimer, HFME)
  { commune: "Marseille", lat: 43.2965, lng: 5.3698 }, // AP-HM — La Timone, Nord
  { commune: "Montpellier", lat: 43.6109, lng: 3.8763 }, // CHU de Montpellier — Lapeyronie, Gui-de-Chauliac
  { commune: "Nancy", lat: 48.6921, lng: 6.1844 }, // CHRU de Nancy — hôpital Central
  { commune: "Vandœuvre-lès-Nancy", lat: 48.65, lng: 6.1667 }, // CHRU de Nancy — hôpitaux de Brabois
  { commune: "Nantes", lat: 47.2184, lng: -1.5536 }, // CHU de Nantes
  { commune: "Nice", lat: 43.7102, lng: 7.262 }, // CHU de Nice — Pasteur, L'Archet
  { commune: "Nîmes", lat: 43.8367, lng: 4.3601 }, // CHU de Nîmes — Carémeau
  { commune: "Orléans", lat: 47.9029, lng: 1.9092 }, // CHU d'Orléans (CHR érigé en CHU en 2022)
  { commune: "Paris", lat: 48.8566, lng: 2.3522 }, // AP-HP — Pitié-Salpêtrière, Cochin, Necker, Saint-Louis et al.
  { commune: "Le Kremlin-Bicêtre", lat: 48.8133, lng: 2.3597 }, // AP-HP — Bicêtre
  { commune: "Créteil", lat: 48.7906, lng: 2.4558 }, // AP-HP — Henri-Mondor
  { commune: "Poitiers", lat: 46.5802, lng: 0.34 }, // CHU de Poitiers — La Milétrie
  { commune: "Reims", lat: 49.2628, lng: 4.0347 }, // CHU de Reims — Robert-Debré
  { commune: "Rennes", lat: 48.1173, lng: -1.6778 }, // CHU de Rennes — Pontchaillou
  { commune: "Rouen", lat: 49.4432, lng: 1.0999 }, // CHU de Rouen — Charles-Nicolle
  { commune: "Saint-Étienne", lat: 45.4347, lng: 4.3903 }, // CHU de Saint-Étienne (hôpital Nord à Saint-Priest-en-Jarez, limitrophe)
  { commune: "Strasbourg", lat: 48.5734, lng: 7.7521 }, // CHU de Strasbourg — Hautepierre, Nouvel Hôpital Civil
  { commune: "Toulouse", lat: 43.6047, lng: 1.4442 }, // CHU de Toulouse — Purpan, Rangueil
  { commune: "Tours", lat: 47.3941, lng: 0.6848 }, // CHRU de Tours — Bretonneau (Trousseau à Chambray-lès-Tours, limitrophe)
  { commune: "Fort-de-France", lat: 14.6037, lng: -61.0594 }, // CHU de Martinique — Pierre-Zobda-Quitman
  { commune: "Les Abymes", lat: 16.2658, lng: -61.5236 }, // CHU de la Guadeloupe
  { commune: "Saint-Denis (La Réunion)", lat: -20.8789, lng: 55.4481 }, // CHU de La Réunion — site Nord, Félix-Guyon
  { commune: "Saint-Pierre (La Réunion)", lat: -21.3393, lng: 55.4781 }, // CHU de La Réunion — site Sud
];

/** Communes d'implantation recensées — dérivé, jamais recopié dans une page. */
export const CHU_SITE_COUNT = CHU_SITES.length;

/** Le CHU est dans la commune ou dans sa couronne immédiate. */
const CHU_ON_SITE_KM = 10;
/** Le CHU est à une demi-heure de route environ. */
const CHU_REACH_KM = 30;

const EARTH_KM = 6371;
const toRad = (d: number) => (d * Math.PI) / 180;

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

const chuCache = new Map<string, { commune: string; km: number }>();

/**
 * Site de CHU le plus proche, à vol d'oiseau depuis le centroïde de la commune.
 * Toujours défini : la table n'est pas vide. La distance peut être énorme —
 * Cayenne est à plus de 1 400 km du premier site, ce qui est une mesure et non
 * une donnée manquante.
 */
export function nearestChuSite(city: CityLight): { commune: string; km: number } {
  const hit = chuCache.get(city.slug);
  if (hit) return hit;
  let best = { commune: CHU_SITES[0].commune, km: Infinity };
  for (const s of CHU_SITES) {
    const km = haversineKm(city.latitude, city.longitude, s.lat, s.lng);
    if (km < best.km) best = { commune: s.commune, km };
  }
  const out = { commune: best.commune, km: Math.round(best.km * 10) / 10 };
  chuCache.set(city.slug, out);
  return out;
}

/**
 * Rend la distance telle qu'une page française la lit : virgule décimale, et
 * « dans la commune » plutôt que « à 0,0 km (Untel) » quand la ville EST le
 * site — le nom entre parenthèses serait le sien, et certains portent déjà une
 * parenthèse de désambiguïsation (« Saint-Denis (La Réunion) »), qu'on
 * imbriquerait.
 */
function chuWhere(commune: string, km: number): string {
  if (km === 0) return "dans la commune";
  return `à ${km.toFixed(1).replace(".", ",")} km (${commune})`;
}

/**
 * La proximité d'un CHU ne peut qu'**améliorer** l'accès, jamais le dégrader :
 * on garde le palier le plus favorable des deux (rappel de la convention du
 * fichier, 10 = le plus difficile). Sans cette règle, une commune de 60 000
 * habitants dotée de son propre SAU serait pénalisée par un CHU à 25 km.
 */
function easier(ladder: HealthDimension, chu: HealthDimension | null): HealthDimension {
  if (!chu) return ladder;
  return chu.score <= ladder.score ? chu : ladder;
}

// ─── Spécialistes (concentration métropolitaine) ──────────────────────────
//
// Les spécialistes (cardio, dermato, ophtalmo, gastro, gynéco) se concentrent
// dans les CHU et les grandes agglomérations. Une ville moyenne en zone rurale
// = délais ophtalmo 9-12 mois, dermato 6-8 mois.

function specialistesFromChu(city: CityLight): HealthDimension | null {
  const { commune, km } = nearestChuSite(city);
  if (km <= CHU_ON_SITE_KM) {
    return {
      score: 2,
      level: "facile",
      reason: `Site de CHU ${chuWhere(commune, km)} — plateau technique complet et recours à toutes les spécialités sans quitter l'agglomération. La distance est mesurée entre centroïdes de communes ; les délais de rendez-vous, eux, ne sont pas relevés.`,
    };
  }
  if (km <= CHU_REACH_KM) {
    return {
      score: 4,
      level: "correct",
      reason: `Site de CHU ${chuWhere(commune, km)} — la majorité des spécialités est atteignable en une demi-heure de route environ, mais hors de la commune. Distance mesurée entre centroïdes ; délais non relevés.`,
    };
  }
  return null;
}

function specialistesAccess(city: CityLight): HealthDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags) || pop > 200_000;

  let ladder: HealthDimension;
  if (isMetro || pop > 100_000) {
    ladder = {
      score: 4,
      level: "correct",
      reason: "Grande agglomération — la majorité des spécialités est représentée. Délais ophtalmo et dermato 2-4 mois en moyenne.",
    };
  } else if (pop > 30_000) {
    ladder = {
      score: 6,
      level: "tendu",
      reason: "Ville moyenne — spécialistes présents pour les disciplines de base (cardio, gynéco), mais déplacement souvent nécessaire vers la métropole proche. Délais 4-8 mois.",
    };
  } else {
    ladder = {
      score: 8,
      level: "desert",
      reason: "Commune éloignée d'une agglomération majeure — quasi tous les spécialistes nécessitent un déplacement vers la préfecture ou le CHU. Délais 6-12 mois courants.",
    };
  }
  return easier(ladder, specialistesFromChu(city));
}

// ─── Urgences / Hôpital (SAU dans la commune ou à proximité) ──────────────
//
// Présence d'un SAU (Service d'Accueil des Urgences) dans la commune ou à
// moins de 30 min en voiture. Critère vital pour AVC, infarctus, traumato.

function urgencesFromChu(city: CityLight): HealthDimension | null {
  const { commune, km } = nearestChuSite(city);
  if (km <= CHU_ON_SITE_KM) {
    return {
      score: 1.5,
      level: "facile",
      reason: `Site de CHU avec SAU 24/7 ${chuWhere(commune, km)} — le recours aux soins critiques est dans l'agglomération, sans transfert vers un autre département.`,
    };
  }
  if (km <= CHU_REACH_KM) {
    return {
      score: 5,
      level: "correct",
      reason: `Pas de CHU sur la commune, mais un site ${chuWhere(commune, km)} — de l'ordre de 20 à 30 min de route hors conditions dégradées.`,
    };
  }
  return null;
}

function urgencesAccess(city: CityLight): HealthDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags) || pop > 100_000;
  const isMountain = /montagne|station|alpin/.test(tags);
  const isIsland = /île|îles/.test(tags) || ["Corse-du-Sud", "Haute-Corse", "Mayotte", "Guyane"].includes(city.department);

  let ladder: HealthDimension;
  if (isMetro || pop > 50_000) {
    ladder = {
      score: 3,
      level: "facile",
      reason: "Centre hospitalier avec SAU dans la commune. Accès urgences sous 15-20 min selon la zone.",
    };
  } else if (isMountain) {
    ladder = {
      score: 7.5,
      level: "tendu",
      reason: "Commune en zone de montagne — SAU le plus proche souvent à 30-45 min de voiture, plus en cas d'enneigement. Héliportage possible.",
    };
  } else if (isIsland) {
    ladder = {
      score: 7,
      level: "tendu",
      reason: "Commune en zone insulaire — accès urgences dépendant des liaisons (rotation hélicoptère, bateau). Délais imprévisibles.",
    };
  } else if (pop > 15_000) {
    ladder = {
      score: 5,
      level: "correct",
      reason: "Pas de SAU sur la commune mais centre hospitalier de référence accessible en 20-30 min en voiture.",
    };
  } else {
    ladder = {
      score: 7,
      level: "tendu",
      reason: "Commune rurale — SAU le plus proche à 30-45 min en voiture. Couverture SMUR variable selon les heures.",
    };
  }
  return easier(ladder, urgencesFromChu(city));
}

// ─── Pharmacies (densité communale) ───────────────────────────────────────
//
// Heuristique : population × statut urbain. La France a une densité moyenne
// de 1 pharmacie / 3 000 hab. ; sous ce seuil en zone rurale, le maillage
// devient critique (déserts pharmaceutiques émergeants).

function pharmaciesAccess(city: CityLight): HealthDimension {
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

export function computeHealthcareAccess(city: CityLight): HealthcareAccess {
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
