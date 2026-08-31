// F19 — Pages "Pour qui" thématiques.
//
// 35 profils éditoriaux (compte mesuré 2026-08-31), chacun = recombinaison
// pondérée des axes seed + owner-scores. Top 20 villes par profil +
// intro/méthodo personnalisée. Aucune nouvelle donnée : pure recombinaison.
//
// Ce module est importé par un composant client (`PeopleLikeYouClient`), donc
// il ne doit jamais tirer une *valeur* de `CITIES_SEED` ni de `data/guides*` :
// les libs dont il dépend n'en importent que les types, et les coordonnées de
// référence sont écrites en dur (même parti pris que `lib/distances`).
//
// **Convention** : toute entrée de `weights` est lue par `getScoreValue()` en
// **`10 = bon`**, et le score de profil qui en sort l'est aussi. Deux entrées
// sortent du cas général, toutes deux volontaires — ne pas les « corriger » :
//
//   ① `healthcareAccess` — `lib/healthcare-access` (F47) mesure la DIFFICULTÉ
//      d'accès (`10 = désert`). La clé nomme une facilité, donc `getScoreValue`
//      retourne `10 - composite`. L'inversion est ici, au site de lecture,
//      jamais dans le moteur : les niveaux et le classement santé gardent la
//      valeur brute.
//   ② `rentalTension` — `lib/rental-tension` est une NUISANCE (`10 = très
//      tendu`) et elle entre **sans inversion**, avec un poids positif, sur le
//      seul profil `investisseurs-locatifs` : pour un bailleur, un marché tendu
//      est un délai de relocation court, et l'intro du profil le dit. La même
//      clé sur un profil de locataire serait un bug.
//
// Rappel de direction pour le reste : les axes seed, `sportLeisure`,
// `cyclingMobility`, `investorYield`, `coastalProximity`, `mountainProximity`,
// `metroAccess`, `borderAccess` et les owner scores sont déjà orientés
// `10 = bon`.

import type { CitySeed } from "@/data/cities-seed";
import type { CityLight } from "@/lib/cities-light";
import { HOUSING } from "@/data/housing";
import { computeOwnerScores } from "@/lib/owner-scores";
import { computeSportLeisure } from "@/lib/sport-leisure";
import { computeCyclingMobility } from "@/lib/cycling-mobility";
import { computeHealthcareAccess } from "@/lib/healthcare-access";
import { rentalTension } from "@/lib/rental-tension";
import { computeCityDistances, haversineKm } from "@/lib/distances";
import { TGV_STATIONS, parisCommute } from "@/lib/paris-commute";

type ScoreWeights = Partial<{
  // Axes seed (CityScore)
  life: number;
  transport: number;
  nature: number;
  cost: number;
  safety: number;
  culture: number;
  remoteWork: number;
  schools: number;
  // Owner scores (lib/owner-scores)
  canicule: number;
  solitude: number;
  bruit: number;
  securiteNocturne: number;
  sansVoiture: number;
  teletravail: number;
  qualiteAir: number;
  securiteFemmeSeule: number;
  jeuneActif: number;
  famille: number;
  // Cluster composites (F70 sport, R8.2 tension, F57 vélo, dérivé investisseurs)
  sportLeisure: number;
  rentalTension: number;
  investorYield: number;
  cyclingMobility: number;
  // Accès aux soins (F47). ⚠️ `lib/healthcare-access` compte la *difficulté*
  // (10 = désert), comme le quartet environnement. La clé s'appelle ici
  // « healthcareAccess », donc une qualité : `getScoreValue` la retourne
  // inversée (10 = accès facile), au site d'affichage et jamais dans le moteur,
  // conformément à la convention de score du projet.
  healthcareAccess: number;
  // Dérivés géographiques
  coastalProximity: number;
  mountainProximity: number;
  metroAccess: number;
  borderAccess: number;
}>;

export interface ProfileDef {
  slug: string;
  emoji: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  weights: ScoreWeights;
  reasonHint: (city: CityLight) => string;
}

function ownerVal(city: CityLight, key: string): number {
  const s = computeOwnerScores(city as CitySeed);
  switch (key) {
    case "canicule": return s.find((x) => x.key === "score_canicule")!.value;
    case "solitude": return s.find((x) => x.key === "score_solitude")!.value;
    case "bruit": return s.find((x) => x.key === "score_bruit")!.value;
    case "securiteNocturne": return s.find((x) => x.key === "score_securite_nocturne")!.value;
    case "sansVoiture": return s.find((x) => x.key === "score_sans_voiture")!.value;
    case "teletravail": return s.find((x) => x.key === "score_teletravail")!.value;
    case "qualiteAir": return s.find((x) => x.key === "score_qualite_air")!.value;
    case "securiteFemmeSeule": return s.find((x) => x.key === "score_securite_femme_seule")!.value;
    case "jeuneActif": return s.find((x) => x.key === "score_jeune_actif")!.value;
    case "famille": return s.find((x) => x.key === "score_famille")!.value;
  }
  return 5;
}

// Rendement locatif brut estimé (T2 ~ 45 m²) sur 0-10.
// Yield % = (avgRentT2 × 12) / (45 × avgBuyPriceM2) × 100, normalisé linéairement
// 3 % → 0, 10 % → 10. Fallback (pas de HOUSING) : proxy coût + neutre.
// Pénalité de liquidité : un sous-30 k habitants implique pool locataires plus
// mince et revente plus longue — on déprécie le rendement brut affiché en
// conséquence (un 10 % théorique dans une ville de 12 k = 4,5 % effectif).
export function investorYield(city: CityLight): number {
  const h = HOUSING[city.slug];
  if (!h) {
    return Math.max(0, Math.min(10, (10 - city.scores.cost) * 0.6 + 2.5));
  }
  const yieldPct = (h.avgRentT2 * 12) / (45 * h.avgBuyPriceM2) * 100;
  const base = (yieldPct - 3) * (10 / 7);
  const pop = city.population ?? 0;
  const liquidity =
    pop < 20000 ? 0.45 :
    pop < 50000 ? 0.62 :
    pop < 100000 ? 0.85 : 1.0;
  return Math.max(0, Math.min(10, base * liquidity));
}

// Proximité littorale sur 0-10 : 0 km de la côte → 10 (les pieds dans l'eau),
// 20 km → ≈8 (accès quotidien facile), 60 km → ≈4 (le week-end oui, pas le
// mercredi soir), ≥ 200 km → 0 (intérieur profond). Le seuil visé est celui
// de la vie quotidienne littorale, pas d'un week-end occasionnel à la mer.
export function coastalProximity(city: CityLight): number {
  const dist = computeCityDistances(city as CitySeed);
  const km = dist.sea?.distanceKm;
  if (km == null) return 5;
  if (km <= 0) return 10;
  if (km >= 200) return 0;
  const raw = 10 - (km / 200) * 10;
  const eased = Math.sqrt(raw / 10) * 10;
  return Math.max(0, Math.min(10, eased));
}

// Proximité montagne sur 0-10. La distance retournée par `computeCityDistances`
// vise le centroïde bas d'un massif (porte d'entrée : Albertville, Gap, Lourdes,
// Clermont, Gérardmer, Lons, Corte) — donc « 0 km » = pied du massif, pas
// altitude d'un sommet. Une ville en montagne (Briançon, Gap, Font-Romeu-like)
// atteint le score maximum ; une ville à 30 km (Grenoble, Chambéry, Pau) reste
// dans la vie de massif au quotidien ; à 100 km on parle week-end, plus le
// mercredi soir ; à ≥250 km on sort de la géographie montagnarde (littoral,
// grand ouest, bassin parisien). L'easing en racine carrée pénalise plus tôt
// les distances moyennes — un massif à 80 km n'est pas « à moitié accessible ».
export function mountainProximity(city: CityLight): number {
  const dist = computeCityDistances(city as CitySeed);
  const km = dist.mountain?.distanceKm;
  if (km == null) return 5;
  if (km <= 0) return 10;
  if (km >= 250) return 0;
  const raw = 10 - (km / 250) * 10;
  const eased = Math.sqrt(raw / 10) * 10;
  return Math.max(0, Math.min(10, eased));
}

// Accès à un grand bassin d'emploi, sur 0-10 — calibré pour l'hybride (deux ou
// trois allers-retours par semaine), pas pour le trajet quotidien.
//
// Les douze pôles retenus sont les plus gros bassins d'emploi tertiaire de
// France métropolitaine. Leurs coordonnées sont écrites en dur ici, comme les
// ancres de `lib/distances` : `lib/profile-pages` est importé par un composant
// client (`PeopleLikeYouClient`), donc il ne doit tirer aucune valeur de
// `CITIES_SEED` — sinon le seed entier part dans le bundle. Même raison pour
// laquelle on réimplémente le modèle de `lib/city-commute` au lieu de
// l'importer : il charge le seed à l'initialisation. Les deux calculs suivent
// la même formule (le plus rapide entre passage par Paris, rail direct estimé
// et route) et donnent donc les mêmes minutes.
const EMPLOYMENT_HUBS: Array<{ slug: string; lat: number; lon: number; parisMin: number }> = [
  { slug: "paris", lat: 48.8566, lon: 2.3522, parisMin: 0 },
  ...["lyon", "marseille", "toulouse", "bordeaux", "lille", "nantes", "strasbourg", "montpellier", "rennes", "nice", "grenoble"].map(
    (slug) => {
      const s = TGV_STATIONS.find((st) => st.slug === slug)!;
      return { slug, lat: s.lat, lon: s.lon, parisMin: s.parisMin };
    },
  ),
];

const HUB_LABEL: Record<string, string> = {
  paris: "Paris",
  lyon: "Lyon",
  marseille: "Marseille",
  toulouse: "Toulouse",
  bordeaux: "Bordeaux",
  lille: "Lille",
  nantes: "Nantes",
  strasbourg: "Strasbourg",
  montpellier: "Montpellier",
  rennes: "Rennes",
  nice: "Nice",
  grenoble: "Grenoble",
};

function formatCommute(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m.toString().padStart(2, "0")}`;
}

const metroAccessCache = new Map<string, { hub: string; minutes: number } | null>();

/**
 * Trajet estimé vers le pôle d'emploi le plus proche, ou `null` quand la
 * navette n'existe pas : hors France métropolitaine (DROM) et Corse, aucun de
 * ces douze pôles ne se rejoint par le rail ou la route. C'est une mesure, pas
 * une donnée manquante — le modèle rail de `lib/city-commute` donnerait sinon
 * 1 h 55 entre Ajaccio et Marseille, ce qui n'existe pas.
 */
export function metroAccessCommute(city: CityLight): { hub: string; minutes: number } | null {
  const cached = metroAccessCache.get(city.slug);
  if (cached !== undefined) return cached;

  const value = (() => {
    const self = EMPLOYMENT_HUBS.find((h) => h.slug === city.slug);
    if (self) return { hub: self.slug, minutes: 0 };
    const inMetro =
      city.longitude >= -6 && city.longitude <= 10 && city.latitude >= 40 && city.latitude <= 52;
    if (!inMetro || city.region === "Corse") return null;

    const cityParis = parisCommute(city as CitySeed);
    const cityParisMin = cityParis.source === "unavailable" ? 9999 : cityParis.minutes;
    const cityHasStation = TGV_STATIONS.some((s) => s.slug === city.slug);
    const pt = { lat: city.latitude, lon: city.longitude };

    let best: { hub: string; minutes: number } | null = null;
    for (const hub of EMPLOYMENT_HUBS) {
      const km = haversineKm(pt, { lat: hub.lat, lon: hub.lon });
      // Trois options, on garde la plus rapide.
      // 1. Par le rail via Paris, sur les temps SNCF déjà estimés de chaque
      //    bout (30 min de correspondance — aucune quand le pôle est Paris).
      // 2. Route : détour routier 1,25 sur la distance à vol d'oiseau, 85 km/h
      //    de moyenne, plus 15 min d'approche urbaine — sans ce plancher le
      //    modèle annonce « Lyon en 2 min » depuis Villeurbanne, ce qui est faux.
      // 3. Rail direct, seulement si la ville a elle-même une gare desservie.
      //    Deux écarts assumés avec `lib/city-commute`, qui surestime : il
      //    applique cette branche à toutes les villes, donc invente une liaison
      //    là où la ligne est fermée (Saint-Girons ressortait à 40 min de
      //    Toulouse), et il la calcule à 220 km/h, la vitesse d'une LGV, alors
      //    que la moyenne commerciale hors LGV pure est bien plus basse
      //    (Annecy sortait à 43 min de Grenoble, où le train met près de 2 h).
      //    140 km/h + 20 min de gares reste favorable au rail sans l'inventer.
      const options = [
        hub.slug === "paris" ? cityParisMin : cityParisMin + hub.parisMin + 30,
        Math.round(((km * 1.25) / 85) * 60 + 15),
      ];
      if (cityHasStation) options.push(Math.round((km / 140) * 60 + 20));
      const minutes = Math.min(...options);
      if (!best || minutes < best.minutes) best = { hub: hub.slug, minutes };
    }
    return best;
  })();

  metroAccessCache.set(city.slug, value);
  return value;
}

// Barème : 30 min ou moins = 10 (on y va sans y penser), 60 min = 7,5 (l'heure
// de porte à porte, seuil que la plupart des navetteurs déclarent tenir),
// 90 min = 5, 120 min = 2,5 (soutenable deux jours par semaine, pas cinq),
// 150 min et au-delà = 0.
export function metroAccess(city: CityLight): number {
  const commute = metroAccessCommute(city);
  if (!commute) return 0;
  if (commute.minutes <= 30) return 10;
  if (commute.minutes >= 150) return 0;
  return Math.max(0, Math.min(10, 10 - ((commute.minutes - 30) / 120) * 10));
}

// Pôles d'emploi transfrontaliers, coordonnées en dur pour la même raison que
// `EMPLOYMENT_HUBS` ci-dessus : ce module part dans un bundle client.
//
// La liste n'est pas « toutes les villes derrière la frontière ». Elle suit les
// flux réellement mesurés par l'Insee (recensement 2021, 465 000 résidents de
// France métropolitaine travaillant dans un des huit pays limitrophes) :
// Suisse 224 000, Luxembourg 105 000, Allemagne 50 000, Belgique 46 000,
// Monaco 33 000. L'Espagne et l'Italie pèsent environ 5 000 chacune, soit un
// ordre de grandeur en dessous du plus petit pôle retenu : Irun et Vintimille
// sont donc volontairement absents, et Hendaye ou Menton-côté-italien valent
// zéro sur cet axe. C'est un arbitrage, pas un oubli — l'ajouter mettrait une
// commune de 16 000 habitants en haut d'un classement qui parle d'un flux
// quarante fois plus petit que celui de Genève.
const BORDER_HUBS: Array<{ name: string; country: string; lat: number; lon: number }> = [
  { name: "Genève", country: "Suisse", lat: 46.2044, lon: 6.1432 },
  { name: "Lausanne", country: "Suisse", lat: 46.5197, lon: 6.6323 },
  { name: "Neuchâtel", country: "Suisse", lat: 46.993, lon: 6.931 },
  { name: "Bâle", country: "Suisse", lat: 47.5596, lon: 7.5886 },
  { name: "Luxembourg", country: "Luxembourg", lat: 49.6116, lon: 6.1319 },
  { name: "Esch-sur-Alzette", country: "Luxembourg", lat: 49.4958, lon: 5.9806 },
  { name: "Monaco", country: "Monaco", lat: 43.7384, lon: 7.4246 },
  { name: "Sarrebruck", country: "Allemagne", lat: 49.2402, lon: 6.9969 },
  { name: "Karlsruhe", country: "Allemagne", lat: 49.0069, lon: 8.4037 },
  { name: "Offenbourg", country: "Allemagne", lat: 48.4711, lon: 7.9448 },
  { name: "Fribourg-en-Brisgau", country: "Allemagne", lat: 47.999, lon: 7.8421 },
  { name: "Mouscron", country: "Belgique", lat: 50.7333, lon: 3.2167 },
  { name: "Tournai", country: "Belgique", lat: 50.6056, lon: 3.3883 },
  { name: "Mons", country: "Belgique", lat: 50.4542, lon: 3.9564 },
];

// Facteur de détour appliqué à la distance à vol d'oiseau, pour approcher des
// kilomètres de route. Volontairement plus bas que le 1,25 → route de
// `metroAccessCommute` converti en minutes : ici on ne publie pas de temps de
// trajet. Un franchissement de frontière est le cas où un modèle horaire ment
// le plus — la douane de Bardonnex, le pont de Huningue et la Basse Corniche
// se mesurent en files d'attente, pas en kilomètres.
const BORDER_DETOUR = 1.3;
const BORDER_FULL_KM = 20;
const BORDER_ZERO_KM = 110;

const borderCache = new Map<string, { hub: string; country: string; km: number } | null>();

/**
 * Pôle transfrontalier le plus proche et distance routière estimée, ou `null`
 * au-delà de 110 km — la limite au-delà de laquelle aucun de ces bassins n'est
 * un lieu de travail quotidien. Corse et DROM tombent dans ce cas par
 * construction : c'est une mesure, pas une donnée manquante.
 */
export function borderCommute(city: CityLight): { hub: string; country: string; km: number } | null {
  const cached = borderCache.get(city.slug);
  if (cached !== undefined) return cached;
  let best: { hub: string; country: string; km: number } | null = null;
  for (const h of BORDER_HUBS) {
    const km = Math.round(
      haversineKm({ lat: city.latitude, lon: city.longitude }, { lat: h.lat, lon: h.lon }) * BORDER_DETOUR,
    );
    if (!best || km < best.km) best = { hub: h.name, country: h.country, km };
  }
  const value = best && best.km <= BORDER_ZERO_KM ? best : null;
  borderCache.set(city.slug, value);
  return value;
}

/**
 * Accès à un bassin d'emploi transfrontalier, sur 0-10. Barème calé sur ce
 * qu'un aller-retour quotidien supporte vraiment : 20 km ou moins = 10 (on
 * passe la frontière comme on change de quartier — Saint-Louis et Bâle, Forbach
 * et Sarrebruck, Longwy et Esch), puis décroissance en puissance 1,4, donc plus
 * sévère qu'une droite au milieu de la fourchette, et zéro à 110 km. La
 * pénalité accélérée est volontaire : entre 40 et 70 km, le trajet cesse d'être
 * une navette et devient un choix de vie, et la statistique le dit — l'Insee
 * relève qu'un frontalier sur cinq parcourt plus de 50 km, donc quatre sur cinq
 * restent en deçà.
 */
export function borderAccess(city: CityLight): number {
  const commute = borderCommute(city);
  if (!commute) return 0;
  if (commute.km <= BORDER_FULL_KM) return 10;
  const raw = 1 - (commute.km - BORDER_FULL_KM) / (BORDER_ZERO_KM - BORDER_FULL_KM);
  return Math.max(0, Math.min(10, Math.pow(raw, 1.4) * 10));
}

function getScoreValue(city: CityLight, key: string): number {
  // Axes seed
  if (["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"].includes(key)) {
    return city.scores[key as keyof typeof city.scores];
  }
  // Cluster composites
  if (key === "sportLeisure") return computeSportLeisure(city as CitySeed).composite;
  if (key === "rentalTension") return rentalTension(city);
  if (key === "investorYield") return investorYield(city);
  if (key === "cyclingMobility") return computeCyclingMobility(city).composite;
  // Inversion assumée : le moteur F47 mesure la difficulté d'accès, la clé
  // nomme la facilité. Même traitement que sur /villes/[slug]/sante.
  if (key === "healthcareAccess") return 10 - computeHealthcareAccess(city).composite;
  if (key === "coastalProximity") return coastalProximity(city);
  if (key === "mountainProximity") return mountainProximity(city);
  if (key === "metroAccess") return metroAccess(city);
  if (key === "borderAccess") return borderAccess(city);
  return ownerVal(city, key);
}

export const PROFILE_PAGES: ProfileDef[] = [
  {
    slug: "familles-avec-enfants",
    emoji: "👨‍👩‍👧",
    label: "Familles avec enfants",
    metaTitle: "Meilleures villes familles avec enfants 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises adaptées aux familles avec enfants : écoles, sécurité, espaces verts, coût accessible. Score composite calibré sur Insee + DEPP + SSMSI.",
    intro:
      "Familles avec enfants : la combinaison qui compte vraiment, c'est écoles + sécurité + espaces verts + coût accessible. Pas le top 5 du palmarès culture ou nightlife — les familles ne s'y intéressent pas. Ce classement reflète l'arbitrage réel.",
    weights: { schools: 2.5, safety: 2.0, famille: 2.0, nature: 1.5, cost: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Écoles ${c.scores.schools.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "jeunes-actifs",
    emoji: "🚀",
    label: "Jeunes actifs",
    metaTitle: "Meilleures villes jeunes actifs 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour jeunes actifs 25-35 ans : carrière + culture + télétravail + coût accessible. Calibré sur démographie et SIRENE.",
    intro:
      "Jeunes actifs : il faut un cocktail spécifique — un marché de l'emploi qui bouge, une scène culturelle qui ne s'arrête pas à 22 h, des loyers où on peut commencer sans hériter, et un réseau pour se faire des amis. Ces 20 villes cochent tout ça.",
    weights: { jeuneActif: 2.5, culture: 2.0, remoteWork: 1.5, cost: 1.5, life: 1.0 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · télétravail ${c.scores.remoteWork.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "jeunes-diplomes",
    emoji: "🎓",
    label: "Jeunes diplômés (20-26 ans)",
    metaTitle: "Meilleures villes jeunes diplômés 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes pour un premier poste après le diplôme : loyer compatible avec salaire d'entrée, densité jeune actif pour le réseau, transports, culture. 2026.",
    intro:
      "Jeunes diplômés : la fenêtre 20-26 ans, juste après le master ou l'école, premier CDI ou première alternance longue, premier vrai loyer hors résidence étudiante ou hors logement parental. La situation n'a presque rien à voir avec celle d'un étudiant Crous (qui pèse sur une bourse, un loyer subventionné et un emploi du temps universitaire) ni avec celle d'un jeune actif installé 28-35 (qui négocie sa première augmentation et envisage parfois un premier achat). Ici on entre dans la vie salariée avec un revenu d'entrée — 1 700 à 2 200 € net pour un bac+5 hors finance/conseil (Apec 2024), parfois moins — et zéro épargne accumulée. Le premier loyer hors campus est souvent un T1 ou une colocation, et la marge entre revenu et reste à vivre est étroite. Le coût d'abord, parce qu'à ce niveau de salaire un loyer parisien à 950 € absorbe la moitié du net, tandis qu'un T1 lyonnais ou bordelais à 600 € libère deux fois plus de marge pour le reste — sortir, voyager, rembourser le prêt étudiant, commencer à épargner. La densité de jeunes actifs ensuite, parce qu'à 22 ans on quitte le réseau étudiant constitué en cinq ans et qu'il faut tout reconstruire — collègues bien sûr, mais aussi colocataires, amis de soirée, partenaires de sport, premières relations amoureuses sérieuses : une ville où la tranche 25-35 est représentée massivement (Toulouse, Montpellier, Lyon, Bordeaux) intègre vite, une ville vieillissante isole. La culture pour la même raison — bars, salles de concert, cinémas indé, festivals, scènes ouvertes — c'est l'infrastructure de la vie sociale post-études. Les transports parce que le permis B coûte 1 300 € en moyenne, une voiture d'occasion 5 000 € minimum plus assurance et essence : à l'entrée de carrière la voiture est très souvent reportée, donc tram-métro-bus-vélo doivent suffire pour aller au travail et sortir. Le télétravail et la qualité de vie complètent — les premiers postes intègrent de plus en plus l'hybride (deux à trois jours bureau, le reste télétravail), et une ville agréable au quotidien quand on y passe ses cinq premières années d'adulte compte plus que la performance pure d'une métropole tendue. Ce classement pondère le coût comme premier critère, à parité quasi avec la densité jeune actif, complète par la culture, les transports, le télétravail, la qualité de vie générale et la praticabilité sans voiture. Résultat : un palmarès qui privilégie les grandes capitales étudiantes du Sud-Ouest et de l'Ouest (Toulouse, Bordeaux, Rennes, Nantes, Montpellier), les métropoles régionales équilibrées (Lyon, Strasbourg, Lille), plusieurs préfectures universitaires sous-cotées (Grenoble, Angers, Reims), et systématiquement décote pour Paris (premier loyer écrase tout le reste à ce niveau de salaire — Paris devient un choix possible une fois la première augmentation passée, pas dès la sortie de l'école).",
    weights: {
      cost: 2.5,
      jeuneActif: 2.0,
      culture: 1.5,
      transport: 1.5,
      remoteWork: 1.0,
      life: 1.0,
      sansVoiture: 0.5,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "retraites",
    emoji: "🌅",
    label: "Retraités",
    metaTitle: "Meilleures villes retraités 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour retraités : santé, sécurité, climat doux, calme, coût accessible. Sélection 2026 calibrée.",
    intro:
      "Retraités : santé d'abord, sécurité ensuite, climat agréable, qualité de vie quotidienne. Le coût compte mais moins que pour des actifs (la pension est fixe — c'est la valeur de l'immobilier déjà acquis qui importe). Ces 20 villes maximisent ce mélange.",
    weights: { safety: 2.5, life: 2.5, nature: 1.5, securiteNocturne: 1.5, qualiteAir: 1.5, canicule: 1.0 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "freelances",
    emoji: "💼",
    label: "Freelances et indépendants",
    metaTitle: "Meilleures villes freelances 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour freelances et indépendants : fibre + coworking + culture + coût optimisé. Calibré 2026.",
    intro:
      "Freelances : fibre, coworking, communauté locale d'indépendants, qualité de vie pour ne pas crever sous le travail. Ces 20 villes ont le bon mélange — pas juste les grandes métros, plusieurs villes moyennes en montée s'y glissent.",
    weights: { remoteWork: 2.5, teletravail: 2.0, culture: 1.5, life: 1.5, cost: 1.0, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Télétravail ${c.scores.remoteWork.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "teletravailleurs",
    emoji: "💻",
    label: "Télétravailleurs salariés",
    metaTitle: "Meilleures villes télétravail salarié 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour salarié·e·s en télétravail : fibre, qualité de vie, accès week-end, coût raisonnable. Calibré 2026.",
    intro:
      "Salariés en télétravail : différents des freelances. Vous gardez votre employeur (souvent parisien), donc l'éloignement coûte zéro côté carrière mais beaucoup côté loyer. Ces 20 villes optimisent le rapport qualité de vie / connectivité / accessibilité Paris.",
    weights: { remoteWork: 2.5, teletravail: 2.0, life: 2.0, transport: 1.5, nature: 1.5, cost: 1.0 },
    reasonHint: (c) =>
      `Télétravail ${c.scores.remoteWork.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "etudiants",
    emoji: "🎓",
    label: "Étudiants",
    metaTitle: "Meilleures villes étudiantes 2026 — Top 20 France",
    metaDescription: "Top 20 villes étudiantes en France : universités, culture, transports, coût logement étudiant abordable. Calibré 2026.",
    intro:
      "Étudiants : universités, vie nocturne, transports, et surtout des loyers compatibles avec une bourse Crous. Ces 20 villes ont le mélange — Toulouse, Montpellier, Rennes en tête sans surprise, mais aussi des petites villes universitaires sous-cotées.",
    weights: { culture: 2.0, transport: 2.0, cost: 2.0, schools: 1.5, jeuneActif: 1.5 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "sans-voiture",
    emoji: "🚲",
    label: "Vivre sans voiture",
    metaTitle: "Meilleures villes pour vivre sans voiture 2026 — Top 20",
    metaDescription: "Top 20 villes françaises où vivre sans voiture : tram, métro, bus, vélo. Score sans-voiture propriétaire + transport.",
    intro:
      "Si vous voulez vivre sans permis ou simplement laisser la voiture au garage, ces 20 villes ont le réseau pour. Le score combine la densité du tram/métro/bus avec la walkability et le réseau cyclable.",
    weights: { sansVoiture: 3.0, transport: 2.0, life: 1.5, culture: 1.0 },
    reasonHint: (c) =>
      `Transport ${c.scores.transport.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "premium",
    emoji: "✨",
    label: "Vie premium",
    metaTitle: "Villes françaises premium 2026 — Top 20",
    metaDescription: "Top 20 villes françaises premium : qualité de vie haut de gamme, sécurité, cadre exceptionnel, écoles + culture. Pour budgets > 4 000 €/mois.",
    intro:
      "Vie premium : pas une question de prestige, mais de combinaison rare. Sécurité élevée, cadre exceptionnel, écoles renommées, scène culturelle riche, et un coût qui reflète tout ça. Ces 20 villes sont pour les budgets ≥ 4 000 €/mois.",
    weights: { life: 2.5, safety: 2.0, schools: 1.5, culture: 1.5, nature: 1.5 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "solo-femme",
    emoji: "👤",
    label: "Femme seule",
    metaTitle: "Meilleures villes femme seule 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises adaptées aux femmes seules : sécurité nocturne, densité transport tardif, qualité de vie urbaine.",
    intro:
      "Femme seule : sécurité globale ne suffit pas — il faut sécurité nocturne ET transport tardif. Ces 20 villes maximisent le retour soir serein, sans renoncer à la qualité de vie urbaine et culturelle.",
    weights: { securiteFemmeSeule: 3.0, securiteNocturne: 2.0, transport: 1.5, culture: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Sécurité ${c.scores.safety.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "couple-sans-enfant",
    emoji: "👫",
    label: "Couple sans enfant",
    metaTitle: "Meilleures villes couple sans enfant 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour couples sans enfant : culture, restaurants, sorties, week-ends nature, transport. Score composite calibré 2026.",
    intro:
      "Couple sans enfant : les écoles ne pèsent rien dans l'arbitrage, et avec deux salaires le coût du logement passe au second plan. Ce qui compte vraiment, c'est une scène culturelle vivante, des restaurants et des sorties qui ne ferment pas à 22 h, une nature accessible pour les week-ends à deux, et des transports qui suivent. Ces 20 villes maximisent exactement ce mélange.",
    weights: { culture: 2.5, life: 2.0, jeuneActif: 1.5, nature: 1.5, transport: 1.5, remoteWork: 1.0 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "celibataires",
    emoji: "💫",
    label: "Célibataires (25-45)",
    metaTitle: "Meilleures villes célibataires 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour célibataires 25-45 ans : densité célibataires, sorties, culture, coût sur un revenu, transports tardifs. Calibré 2026.",
    intro:
      "Célibataires (25-45) : votre équation n'est celle d'aucun autre profil du site. Vous n'êtes pas un jeune actif de 25-30 ans encore aimanté par la première étape professionnelle et le premier vrai loyer, pas un jeune diplômé qui sort tout juste du master, pas un couple sans enfant qui négocie à deux salaires un centre-ville coûteux, et pas exactement le profil « femme seule » — celui-là pondère avant tout la sécurité nocturne et le retour serein depuis un transport tardif, une dimension essentielle mais plus étroite. Ici on regarde une fenêtre plus large — vingt ans de vie adulte entre l'école et la famille éventuelle, ou vingt ans qui prolongent un choix de vie assumé — dans laquelle le célibat n'est ni une transition ni une contrainte mais un mode d'organisation quotidien, avec ses avantages (souplesse d'emploi du temps, budget individuel, mobilité géographique intacte) et ses vraies contraintes (un seul revenu qui absorbe seul le loyer, l'assurance, l'énergie et l'abonnement mobile, une vie sociale à reconstruire régulièrement quand un ami se met en couple ou quitte la ville, une pression discrète mais réelle sur la question des rencontres passées trente ans). Le critère cardinal n'est pas le score global d'une ville, il est la combinaison de trois choses très concrètes. La densité de célibataires 25-45 d'abord — cela se traduit dans les données par la part de ménages d'une personne au niveau département (proxy Insee 2020 recalibré au niveau ville, dérivé dans le score « lien social ») et par la vitalité du bassin jeune-actif : une ville où la médiane d'âge tourne autour de 35 ans et où la population 25-45 dépasse 30 % du total (Toulouse, Montpellier, Bordeaux, Rennes, Lyon, Nantes, Strasbourg, Grenoble) intègre socialement en quelques mois, une ville vieillissante avec une médiane à 47 ans et une part 25-45 sous 22 % laisse structurellement seul même les personnalités les plus sociables. La scène culturelle et sortie ensuite — bars, cafés, restaurants qui servent jusqu'à minuit en semaine, salles de concert, cinémas indépendants, festivals de printemps et d'automne, terrasses en juin, marchés de quartier le samedi matin — c'est l'infrastructure concrète de la vie sociale d'un célibataire, autant l'occasion de rencontres nouvelles que le prétexte à sortir un mardi soir avec les amis. Le coût de la vie en troisième pilier, parce qu'un T1 ou T2 à 700-1 100 € encaisse un loyer non partagé et qu'une ville où ce ticket d'entrée passe à 1 400 € restreint mécaniquement les sorties, les week-ends et l'épargne — deux salariés partagent un T3 à 1 500 €, un célibataire porte seul le T2 à 900 €, l'arbitrage n'est pas symétrique. On complète par les transports pour rentrer d'une soirée sans faire quinze kilomètres en voiture avec deux verres dans le nez (un réseau nocturne, un tram jusqu'à minuit, un vélo en libre-service à trois heures du matin change concrètement la vie), par la qualité de vie urbaine qui garde une ville respirable au quotidien, et par la praticabilité sans voiture pour compléter les transports en commun — parce que beaucoup de célibataires optimisent leur budget en zappant la voiture individuelle et compensent par la marche, le vélo et le TER. Ce classement pondère la culture et la densité célibataires comme piliers, complète par la qualité de vie et le coût, garde un œil sur les transports et la praticabilité sans voiture et ne sacrifie pas le lien social — parce qu'un beau centre-ville historique dans un désert démographique tient rarement plus de deux ans. Résultat : un palmarès tiré par les grandes capitales étudiantes qui deviennent capitales jeunes-actifs (Toulouse, Bordeaux, Montpellier, Rennes, Nantes), les métropoles régionales équilibrées (Lyon, Strasbourg, Lille, Grenoble), plusieurs préfectures universitaires sous-cotées (Angers, Reims, Dijon, Tours), et systématiquement décoté pour Paris — sa scène est incomparable, mais le loyer à un revenu absorbe la moitié du salaire net, ce qui restreint le reste au point de rendre la vie sociale contradictoire avec la faisabilité budgétaire jusqu'à un salaire élevé.",
    weights: {
      culture: 2.5,
      jeuneActif: 2.0,
      life: 2.0,
      cost: 1.5,
      transport: 1.5,
      solitude: 1.0,
      sansVoiture: 0.5,
    },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "expat-retour",
    emoji: "✈️",
    label: "Retour d'expatriation",
    metaTitle: "Meilleures villes retour expatriation 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour Français rentrant d'expatriation : qualité de vie + international + frontalières. Suisse, Lux, UK, Canada inclus.",
    intro:
      "Retour d'expat : transition entre un mode de vie international (souvent confort élevé) et une rentrée française. Ces 20 villes combinent qualité de vie, accessibilité internationale (aéroports, frontalières) et un cadre qui ne dépaysera pas trop.",
    weights: { life: 2.5, culture: 1.5, transport: 2.0, remoteWork: 1.5, safety: 1.5, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "primo-accedants",
    emoji: "🔑",
    label: "Primo-accédants",
    metaTitle: "Meilleures villes primo-accédants 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour acheter son premier logement : prix au m² accessibles, qualité de vie correcte, sécurité, transport. Sélection 2026.",
    intro:
      "Primo-accédants : le premier achat se joue d'abord sur le prix au m². Pas la peine de viser une métropole où le ticket d'entrée pour un T3 correct dépasse 350 000 € — la mensualité étouffe tout le reste. Ces 20 villes mettent en avant un prix d'achat raisonnable sans sacrifier la qualité de vie quotidienne ni la valeur de revente à 10 ans.",
    weights: { cost: 3.0, life: 1.5, safety: 1.5, transport: 1.0, nature: 1.0, schools: 1.0, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "familles-monoparentales",
    emoji: "👩‍👧",
    label: "Familles monoparentales",
    metaTitle: "Meilleures villes familles monoparentales 2026 — Top 20",
    metaDescription: "Top 20 villes pour parents solos : coût accessible avec un seul revenu, sécurité, écoles, transport, services famille. Sélection 2026 calibrée.",
    intro:
      "Familles monoparentales : un seul revenu, des contraintes d'organisation doublées et zéro marge sur le budget. Le triangle qui compte vraiment, c'est coût accessible, sécurité (jour et soir) et école proche d'un transport efficace. Le réseau de garde et les services famille font la différence entre survivre et tenir. Ces 20 villes maximisent ce mélange — souvent des préfectures moyennes plus que des grandes métropoles, parce qu'elles concentrent les services à un coût soutenable.",
    weights: {
      cost: 2.5,
      safety: 2.0,
      schools: 2.0,
      transport: 1.5,
      famille: 1.5,
      securiteFemmeSeule: 1.0,
      life: 1.0,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)}`,
  },
  {
    slug: "familles-nombreuses",
    emoji: "👨‍👩‍👧‍👦",
    label: "Familles nombreuses",
    metaTitle: "Meilleures villes familles nombreuses 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour familles nombreuses : logement spacieux abordable, écoles, sécurité, espaces verts. Score composite calibré 2026.",
    intro:
      "Familles nombreuses : trois enfants ou plus, et tout change d'échelle. Le critère qui domine, c'est le logement — il faut un T4 ou un T5, et dans une métropole tendue le ticket d'entrée devient vite infranchissable. Vient ensuite la capacité des écoles, la sécurité, et des espaces verts où plusieurs enfants peuvent réellement respirer. Ces 20 villes mettent en avant l'espace abordable sans sacrifier les services. Souvent des villes moyennes plutôt que de grandes métropoles : elles offrent le mètre carré qui manque ailleurs.",
    weights: {
      cost: 2.5,
      schools: 2.0,
      famille: 2.0,
      nature: 2.0,
      safety: 1.5,
      life: 1.0,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "amateurs-de-plein-air",
    emoji: "🥾",
    label: "Amateurs de plein air",
    metaTitle: "Meilleures villes nature et plein air 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour les amateurs de plein air : accès nature, air respirable, climat tempéré pour rando, vélo, mer. Score composite calibré 2026.",
    intro:
      "Amateurs de plein air : votre semaine se construit autour de ce qui se passe dehors — la rando du week-end, le vélo après le boulot, la baignade ou la montagne à portée. Le critère qui domine reste l'accès à la nature, mais il ne suffit pas seul. Un air respirable change tout quand on passe ses journées dehors, et un climat tempéré évite les étés où la moindre sortie devient un supplice. Ce classement combine nature, qualité de l'air et confort climatique plutôt que la seule animation urbaine. Résultat : des villes moyennes proches du relief ou du littoral se hissent souvent devant les grandes métropoles.",
    weights: { nature: 3.0, qualiteAir: 1.5, canicule: 1.5, life: 1.5, transport: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "neo-ruraux",
    emoji: "🌾",
    label: "Néo-ruraux",
    metaTitle: "Meilleures villes pour néo-ruraux 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes pour quitter la métropole et s'installer au vert : coût abordable, nature, calme, fibre télétravail. Score composite calibré 2026.",
    intro:
      "Néo-ruraux : vous voulez quitter la métropole sans pour autant disparaître au fond d'un hameau sans connexion. La bonne cible, c'est la petite ou moyenne ville bien placée — celle où le loyer redevient soutenable, où la nature commence au bout de la rue, et où le calme tient sans couper la fibre ni l'épicerie. Ce classement pondère d'abord le coût et la nature, complète avec le calme sonore, garde un œil sur la qualité de vie et la connectivité télétravail, et laisse une marge pour le lien social — parce qu'une installation rurale qui se solde par l'isolement total tient rarement plus de deux ans. Résultat : peu de grandes métropoles, beaucoup de préfectures et de villes moyennes accessibles en train.",
    weights: { cost: 3.0, nature: 2.5, bruit: 2.0, life: 1.5, teletravail: 1.5, solitude: 1.0 },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
  },
  {
    slug: "anti-canicule",
    emoji: "🧊",
    label: "Anti-canicule",
    metaTitle: "Meilleures villes anti-canicule 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises où l'été reste vivable : étés tempérés, air respirable, nature accessible. Pour les personnes sensibles à la chaleur.",
    intro:
      "Anti-canicule : la décennie à venir verra les étés français devenir plus longs, plus secs et plus suffocants. Choisir aujourd'hui une ville fraîche n'est plus une lubie de retraité, c'est une stratégie de santé pour les asthmatiques, les seniors, les jeunes enfants et toute personne qui supporte mal les pics au-delà de 32 °C. Le critère qui domine, c'est la résistance climatique — dérivée des températures moyennes de juillet et du potentiel de canicule projeté à 2040. On ajoute une qualité de l'air correcte (les pics d'ozone s'aggravent dans le sud), de la nature accessible pour respirer hors des îlots de chaleur urbains, et une qualité de vie générale qui ne s'effondre pas l'été. Résultat : un classement dominé par les façades atlantique et nord, le piémont alpin et les villes d'altitude — les zones qui resteront vivables même après dix années de réchauffement supplémentaires.",
    weights: { canicule: 3.0, qualiteAir: 2.0, nature: 1.5, life: 1.5, safety: 1.0 },
    reasonHint: (c) =>
      `Juillet ${(c.avgTempJuly ?? 23).toFixed(1)} °C · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
  },
  {
    slug: "sensibles-au-bruit",
    emoji: "🤫",
    label: "Sensibles au bruit",
    metaTitle: "Meilleures villes pour sensibles au bruit 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises où le calme tient toute la journée : faible exposition sonore, nature accessible, air respirable. Pour hypersensibles et télétravail.",
    intro:
      "Sensibles au bruit : la circulation continue, les terrasses ouvertes tard, les sirènes nocturnes, l'école juste sous les fenêtres — autant de petits stimuli qui usent sur la durée. Pour qui supporte mal l'exposition sonore quotidienne — hypersensibles, hyperacousie, jeunes parents en gestion de nourrisson, télétravailleurs enchaînant les visios — le critère cardinal n'est ni le dynamisme culturel ni la sécurité, c'est le bruit ambiant moyen. Ce classement pondère d'abord l'exposition sonore (dérivée des cartes de bruit stratégiques d'agglomération et de la densité du trafic), complète par une nature proche pour décompresser hors des îlots sonores urbains, garde un œil sur la qualité de l'air (bruit routier et particules fines vont souvent ensemble) et sur la qualité de vie générale — parce qu'une rue silencieuse au fond d'un désert de services tient rarement plus de six mois. Résultat : beaucoup de préfectures moyennes et de villes côtières atlantiques, peu de grandes métropoles, et zéro ville traversée par une autoroute ou un axe TGV non protégé.",
    weights: { bruit: 3.0, nature: 2.0, qualiteAir: 1.5, life: 1.5, safety: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "asthmatiques-allergiques",
    emoji: "🌬️",
    label: "Asthmatiques et allergiques",
    metaTitle: "Meilleures villes pour asthmatiques et allergiques 2026",
    metaDescription:
      "Top 20 villes françaises où l'air respire et les crises s'espacent : air propre, étés tempérés, nature non saturée de pollens. Asthme, rhinite, allergies.",
    intro:
      "Asthmatiques et allergiques : les déclencheurs s'enchaînent vite — particules fines et NO₂ près des grands axes, pics d'ozone l'été, pollens d'arbres dès mars (bouleau, cyprès), graminées en juin, ambroisie dès août dans le couloir rhodanien. Pour qui souffre d'un système respiratoire ou immunitaire fragile, choisir une ville devient un arbitrage de santé publique avant d'être un arbitrage de cadre de vie. Ce classement pondère d'abord la qualité de l'air ambiante (dérivée des stations ATMO et des données Lcsqa par agglomération), ajoute le potentiel anti-canicule (la chaleur concentre l'ozone et déclenche les crises), garde une nature accessible mais pas dominée par les sources polliniques sensibilisantes, et tient compte du bruit ambiant — facteur de stress chronique qui aggrave l'asthme. Résultat : un palmarès tiré par les façades atlantique et nord, le piémont alpin et les villes ventées de Bretagne ou du Cotentin, où le brassage d'air maintient l'indice ATMO en zone « bon » la majorité de l'année. Les grandes plaines céréalières, le couloir rhodanien (ambroisie) et les agglomérations enclavées sortent du top.",
    weights: { qualiteAir: 3.0, canicule: 2.0, nature: 1.5, bruit: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "jeunes-parents",
    emoji: "🍼",
    label: "Jeunes parents (0-3 ans)",
    metaTitle: "Meilleures villes pour jeunes parents 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour jeunes parents avec un enfant 0-3 ans : air respirable, sécurité poussette, parcs accessibles, coût soutenable, services petite enfance. Calibré 2026.",
    intro:
      "Jeunes parents : un enfant de 0-3 ans, ce n'est pas la même équation qu'une famille avec un collégien. L'école attendra encore quatre ans ; ce qui compte immédiatement, c'est la qualité de l'air que respirent des poumons en formation, la sécurité d'un trottoir où la poussette tient sans gêner personne, des parcs accessibles à pied pour la balade quotidienne, un loyer ou une mensualité qui résiste à un congé parental ou à un passage temporaire à un seul revenu, et le calme ambiant qui ne réveille pas systématiquement la sieste. La densité de crèches, de PMI et de pédiatres conventionnés pèse aussi lourd que les écoles dans les classements concurrents — mais reste plus difficile à mesurer ville par ville. Ce classement pondère d'abord la sécurité globale et la nature accessible (parcs urbains et premier rang d'arbres), ajoute une qualité de l'air sérieuse, intègre les services famille agrégés (crèches, ludothèques, PMI proxy) et le calme sonore, et garde une marge sur le coût — parce qu'une fenêtre de un à trois ans à 100 % du loyer plus 600 €/mois de crèche réduit toute la marge financière du foyer. Résultat : peu de très grandes métropoles centrales (air dégradé, espaces verts saturés, trottoirs étroits), beaucoup de villes moyennes côtières ou de couronnes pavillonnaires bien équipées en services petite enfance.",
    weights: {
      safety: 2.0,
      nature: 2.0,
      qualiteAir: 2.0,
      famille: 2.0,
      bruit: 1.5,
      cost: 1.5,
      life: 1.0,
      transport: 1.0,
    },
    reasonHint: (c) =>
      `Sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "investisseurs-locatifs",
    emoji: "🏘️",
    label: "Investisseurs locatifs",
    metaTitle: "Meilleures villes investissement locatif 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour investir en locatif : rendement brut estimé, tension de marché, demande jeunes actifs, sécurité de l'actif. Calibré 2026.",
    intro:
      "Investisseurs locatifs : votre arbitrage ne se joue pas comme celui d'un primo-accédant. Vous ne choisissez pas la ville où vous voulez vivre, vous choisissez celle qui dégage le meilleur rendement net une fois la fiscalité passée, sans rogner sur les fondamentaux qui protègent l'actif à dix ans. Le triangle qui compte vraiment, c'est rendement brut (loyer annuel rapporté au prix d'acquisition), tension de marché (un appartement qui se reloue en quinze jours et pas en trois mois) et qualité de la demande locative (bassin de jeunes actifs, de cadres en télétravail et d'étudiants qui paient à l'heure). Le rendement seul, sans demande, c'est une vacance locative qui ronge la rentabilité ; la tension seule, sans rendement, c'est un cash-flow négatif qui ne tient que par l'espoir de la plus-value. Ce classement pondère d'abord le rendement brut estimé sur un T2 — dérivé du loyer médian T2 et du prix m² appartement par ville — complète par l'indicateur de tension de marché, intègre le poids démographique des 25-35 ans (premier bassin de locataires français), garde un œil sur la couverture fibre et la part de cadres (qui tirent le loyer vers le haut), et ne sacrifie pas la sécurité de l'actif. Résultat : peu de grandes métropoles ultra-tendues comme Paris ou Lyon (rendement effondré sous 4 %), beaucoup de villes moyennes industrielles ou universitaires en reconversion où l'on trouve encore du 7-9 % brut avec une demande locale solide.",
    weights: {
      investorYield: 2.5,
      rentalTension: 2.0,
      jeuneActif: 1.5,
      teletravail: 0.8,
      safety: 0.5,
      remoteWork: 0.5,
    },
    reasonHint: (c) => {
      const h = HOUSING[c.slug];
      if (h) {
        const y = (h.avgRentT2 * 12) / (45 * h.avgBuyPriceM2) * 100;
        return `Rendement brut ~ ${y.toFixed(1)} % · T2 ${h.avgRentT2} € · m² ${h.avgBuyPriceM2} €`;
      }
      return `Coût ${c.scores.cost.toFixed(1)} · tension ${rentalTension(c).toFixed(1)} · jeunes actifs ${c.scores.life.toFixed(1)}`;
    },
  },
  {
    slug: "familles-avec-ados",
    emoji: "🎒",
    label: "Familles avec ados (12-17 ans)",
    metaTitle: "Meilleures villes familles avec ados 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour familles avec adolescents 12-17 ans : lycée, transport autonomie ado, sécurité nocturne, scène culturelle, espaces pour s'aérer. Calibré 2026.",
    intro:
      "Familles avec ados : un adolescent de 12-17 ans, ce n'est ni l'enfant scolarisé en primaire couvert par familles avec enfants, ni le nourrisson de jeunes parents. Ce qui change brutalement à l'adolescence, c'est l'autonomie : votre ado rentre seul du lycée, traverse la ville pour son sport ou son club, sort le soir en groupe au cinéma ou au concert, prend les transports pour ses amis. La qualité du lycée pèse plus que celle du primaire — l'orientation post-bac se joue dès la seconde. La sécurité nocturne devient un vrai critère, plus une abstraction : un retour de l'arrêt de bus à 22 h en hiver n'a pas la même tête à Annecy qu'à Aubervilliers. La densité culturelle se met à compter — cinéma, salle de concert, club sportif fédéré, médiathèque ouverte le samedi — parce qu'un ado qui s'ennuie est un ado qui s'isole. Le réseau de transport en commun fait la différence entre un parent-taxi épuisé et un ado autonome. Ce classement pondère d'abord les transports et la sécurité, intègre lourdement la sécurité nocturne et l'offre culturelle, garde le poids des établissements scolaires (lycée + supérieur de proximité) et ajoute la vitalité jeune-actif — les ados ont besoin d'une ville qui ne se vide pas le soir. La nature reste utile pour les week-ends, mais moins centrale qu'à l'âge primaire. Résultat : un palmarès tiré par les villes universitaires moyennes bien desservies, les métropoles régionales équilibrées, et beaucoup moins par les petites communes isolées où l'autonomie de l'ado se résume à la voiture des parents.",
    weights: {
      transport: 2.0,
      schools: 2.0,
      securiteNocturne: 1.5,
      safety: 1.5,
      culture: 1.5,
      jeuneActif: 1.0,
      famille: 1.0,
      life: 1.0,
      nature: 0.5,
    },
    reasonHint: (c) =>
      `Transport ${c.scores.transport.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "sportifs",
    emoji: "🏋️",
    label: "Sportifs réguliers",
    metaTitle: "Meilleures villes pour sportifs 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour pratiquants réguliers : équipements (piscines, gymnases, salles), clubs, cadre outdoor, climat propice. Calibré 2026.",
    intro:
      "Sportifs réguliers : votre semaine se construit autour de la pratique — l'entraînement du mardi soir au gymnase, la sortie longue du dimanche, la piscine deux fois par semaine, le club de tennis qui reprend en mars. Ce profil n'est pas celui du randonneur du dimanche déjà couvert par les amateurs de plein air. Le critère qui domine, c'est la densité d'équipements municipaux ouverts jusqu'à 22 h, le maillage des fédérations agréées Jeunesse & Sport qui ouvrent un vrai créneau adulte, et un climat qui ne réduit pas la pratique à trois mois par an. Ce classement pondère d'abord le composite sport et loisirs (équipements + clubs + outdoor + climat) dérivé du Recensement des Équipements Sportifs INJEP et des données fédérales, complète avec la nature accessible pour les sorties trail, vélo et rando, garde un œil sur le confort climatique d'été et d'hiver, et la qualité de vie générale — parce qu'une ville bien équipée mais vidée le soir tient rarement les pratiquants au-delà de deux saisons. Résultat : un palmarès tiré par les grandes métropoles dotées (Lyon, Bordeaux, Nantes, Toulouse), les pôles d'excellence sportive (Annecy, Chambéry, Antibes, Grenoble, Talence, Vichy) et plusieurs villes moyennes au tissu associatif dense — peu de petites communes rurales et zéro département en déprise.",
    weights: {
      sportLeisure: 3.0,
      nature: 1.5,
      life: 1.0,
      canicule: 1.0,
      jeuneActif: 0.5,
    },
    reasonHint: (c) =>
      `Sport ${computeSportLeisure(c as CitySeed).composite.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
  },
  {
    slug: "proches-aidants",
    emoji: "🤝",
    label: "Proches aidants",
    metaTitle: "Meilleures villes proches aidants 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises adaptées aux proches aidants : sécurité, calme, tissu médico-social, coût maîtrisé, transports vers l'hôpital. Calibré 2026.",
    intro:
      "Proches aidants : selon la DREES, près de 11 millions de personnes en France accompagnent au quotidien un parent âgé, un conjoint malade, un enfant en situation de handicap ou un proche en perte d'autonomie. Ce rôle, souvent invisible, pèse sur la santé mentale, la carrière et le budget — et choisir sa ville quand on est aidant relève d'arbitrages très différents de ceux d'un actif sans charge ou d'un retraité standard. Le critère qui domine, c'est l'accès à un cadre apaisé qui ne rajoute pas une couche de stress aux trajets répétés vers l'EHPAD, la clinique ou le cabinet de soins infirmiers. La sécurité diurne et nocturne pèsent lourd : une visite tardive ou un retour de garde à 22 h n'a pas la même tension dans une commune calme qu'en pleine zone tendue. Le tissu social familial fait la différence entre un aidant qui tient quinze ans et un aidant qui craque en deux — haltes-répit, accueils de jour, plateformes d'accompagnement et associations locales soutiennent dans la durée. Le coût de la vie compte plus qu'à l'ordinaire, parce qu'aider un proche, c'est très souvent réduire son temps de travail (passage à 80 %, congé proche aidant indemnisé environ 65 €/jour, abandon temporaire d'activité), donc encaisser une baisse de revenus durable. Le bruit et la qualité de vie générale comptent parce que le sommeil de l'aidant est déjà fragmenté par les sollicitations, et qu'une ville bruyante achève l'épuisement. Ce classement pondère d'abord la sécurité et le tissu familial, complète par la qualité de vie, la sécurité nocturne, la maîtrise des coûts, la maîtrise du bruit et l'accessibilité en transports en commun pour les trajets domicile-soin sans dépendre de la voiture. Résultat : un palmarès qui privilégie les villes moyennes au tissu associatif dense et les chefs-lieux de département dotés d'un hôpital de proximité, beaucoup moins les hyper-centres tendus ou les communes isolées sans services médico-sociaux.",
    weights: {
      safety: 2.0,
      famille: 1.5,
      life: 1.5,
      securiteNocturne: 1.5,
      cost: 1.5,
      bruit: 1.0,
      transport: 1.0,
      solitude: 0.5,
    },
    reasonHint: (c) =>
      `Sécurité ${c.scores.safety.toFixed(1)} · vie ${c.scores.life.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "futurs-retraites",
    emoji: "🧭",
    label: "Futurs retraités (55-65 ans)",
    metaTitle: "Meilleures villes futurs retraités 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour préparer sa retraite (55-65 ans) : coût maîtrisé, santé future, climat tempéré, transports, qualité de vie. Calibré 2026.",
    intro:
      "Futurs retraités (55-65 ans) : la phase où vous préparez le grand virage. Vous travaillez encore, votre revenu est encore à son maximum, mais vous savez que dans cinq ou dix ans la pension va remplacer le salaire — souvent avec 25 à 40 % de moins selon la trajectoire de carrière (cadres COR 2024, salariés du privé estimation DREES). C'est la fenêtre où le bon choix de ville coûte le moins cher et rapporte le plus. Vendre une résidence principale chère en zone tendue pour acheter plus modeste dans une ville mieux dimensionnée libère une plus-value qui peut financer dix à quinze ans de revenus complémentaires — et anticiper l'installation avant que la santé ne dicte le calendrier, c'est garder la main sur le choix. L'arbitrage est sensiblement différent du profil « retraités » (déjà installés, pension fixe, immobilier amorti, axes prioritaires santé et qualité de vie immédiate) : ici vous êtes encore mobiles, encore actifs, encore en train d'optimiser pour deux temporalités à la fois — le présent salarié et le futur retraité. Le coût d'abord, parce que vous préparez une baisse de revenu durable : une ville où le panier loyer-énergie-vie courante est inférieur à votre métropole actuelle libère immédiatement de la marge pour la suite, et un prix m² accessible permet de monétiser l'écart à l'achat. La qualité de vie générale ensuite, parce que vous serez là chaque jour pendant trente ans, et l'écart entre une ville agréable et une ville fonctionnelle s'élargit avec le temps. La sécurité et la sécurité nocturne montent dans la hiérarchie parce que la perception du risque change après 55 ans — on sort plus prudemment, on évite certaines zones, on veut un environnement quotidien qui n'ajoute pas de stress de fond. La résistance canicule devient un critère qu'on ne pèse pas à 35 ans mais qu'on pèse à 60 (canicule 2003, 2022, 2023 — la surmortalité s'envole au-delà de 65 ans). La qualité de l'air pour la même raison — exposition cumulée et capacité respiratoire qui décline progressivement. Les transports en commun pèsent à cet âge parce qu'à 75 ans la voiture n'est plus une option fiable, et qu'installer son foyer sur une ligne TER ou un réseau urbain dense, c'est garder son autonomie une décennie plus longtemps. Ce classement pondère le coût comme premier critère, à parité avec la qualité de vie, complète par la sécurité diurne et nocturne, la résistance canicule, la qualité de l'air, l'accessibilité en transports et la maîtrise du bruit (le sommeil se dégrade physiologiquement après 55 ans — une ville calme prolonge la santé). Résultat : un palmarès qui privilégie les villes moyennes au tissu hospitalier solide (chefs-lieux régionaux dotés d'un CHU ou hôpital intercommunal), les villes intermédiaires bien desservies à coût accessible, et plusieurs côtes atlantiques ou intérieurs tempérés où on peut vendre la maison parisienne pour acheter plus modeste sans perdre en services. Logique : si vous avez déjà 70 ans et que vous êtes installés depuis longtemps, regardez le profil « retraités » ; si vous êtes à cinq ou dix ans de l'arrêt et que vous envisagez le déménagement, ce classement-ci est calibré pour vous.",
    weights: {
      cost: 2.0,
      life: 2.0,
      safety: 1.5,
      canicule: 1.5,
      qualiteAir: 1.5,
      transport: 1.5,
      securiteNocturne: 1.0,
      bruit: 1.0,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "cyclistes-urbains",
    emoji: "🚴",
    label: "Cyclistes urbains",
    metaTitle: "Meilleures villes pour cyclistes urbains 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises où vivre à vélo au quotidien : réseau cyclable continu, relief praticable, sécurité, climat. Calibré sur le baromètre FUB et Géovélo 2026.",
    intro:
      "Cyclistes urbains : votre arbitrage ne ressemble ni à celui d'un sportif de salle ni à celui d'un randonneur du dimanche. Le vélo n'est ni un loisir occasionnel ni une discipline d'entraînement : c'est votre mode de transport principal, six à sept jours sur sept, pour le travail, les courses, l'école des enfants, les sorties du soir, parfois 4 000 à 6 000 kilomètres par an. Ce profil se différencie nettement de « sans voiture » (qui pondère le réseau multimodal tram-métro-bus-vélo et donne le même poids à un usager exclusif des transports en commun), de « sportifs réguliers » (axé sur les équipements indoor et les clubs fédérés) et d'« amateurs de plein air » (la nature brute du week-end). Ici on s'intéresse uniquement à la praticabilité du vélo au quotidien — et les villes ne se valent vraiment pas. Le critère cardinal, c'est la continuité du réseau cyclable, mesurée par le composite F57 dérivé du baromètre FUB (Fédération des Usagers de la Bicyclette, parlons-velo.fr), de Géovélo et de la cartographie OSM : une ville qui aligne 200 à 500 km d'aménagements sécurisés financés à plus de 50 €/habitant/an (Strasbourg, Grenoble, Rennes, Nantes, Bordeaux, La Rochelle, Chambéry, Annecy) tient un usager quotidien dix fois plus longtemps qu'une métropole où il faut alterner trottoir, piste interrompue et boulevard à quatre voies. Le relief compte presque autant — pédaler 3 km sur du plat versus 3 km avec 80 m de dénivelé positif, ce n'est pas le même effort matin et soir, et le vélo électrique ne lève qu'une partie de la contrainte. La sécurité réelle (accidentologie, séparation des flux, sas vélo, double sens cyclable, limitations à 30 km/h en centre) fait la différence entre une pratique tranquille et un stress de chaque trajet — un point particulièrement sensible pour les parents avec siège enfant ou pour les jeunes adultes qui débutent. Le climat enfin — un nombre de jours pluvieux trop élevé ou des étés caniculaires concentrent la pratique sur quelques mois et fatiguent même les plus motivés. Ce classement pondère lourdement le composite cyclabilité F57, complète par le score sans voiture (un cycliste utilise aussi les transports en commun par mauvais temps ou pour les déplacements longs), ajoute le transport général, la qualité de l'air (vous respirez ce que vous traversez à pleine ventilation pulmonaire), la nature pour les sorties dominicales, et garde un œil sur la qualité de vie et la sécurité globale. Résultat : un palmarès tiré par les championnes du baromètre FUB (Strasbourg historiquement n° 1, Grenoble pour le réseau et la planéité, Rennes pour la cohérence métropolitaine, Bordeaux pour la continuité depuis la rénovation des quais), plusieurs villes moyennes pionnières (La Rochelle berceau du vélo libre-service en 1976, Chambéry, Annecy, Versailles, Caen, Lorient), les villes traversées par une EuroVelo majeure (Saumur, Amboise, Chinon sur la Loire à vélo, Royan sur la Vélodyssée, Bayonne–Anglet–Biarritz sur la Vélodyssée et le Vélo Maritime Sud), et logiquement peu de communes du relief sévère, des centres-villes saturés sans plan vélo ou des banlieues pavillonnaires non maillées.",
    weights: {
      cyclingMobility: 3.0,
      sansVoiture: 1.5,
      transport: 1.0,
      qualiteAir: 1.0,
      nature: 1.0,
      safety: 0.5,
      life: 0.5,
    },
    reasonHint: (c) =>
      `Cyclabilité ${computeCyclingMobility(c).composite.toFixed(1)} · transport ${c.scores.transport.toFixed(1)} · sans voiture ${ownerVal(c, "sansVoiture").toFixed(1)}`,
  },
  {
    slug: "mobilite-reduite",
    emoji: "♿",
    label: "Personnes à mobilité réduite",
    metaTitle: "Meilleures villes mobilité réduite 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour vivre avec une mobilité réduite : métro/tramway PMR, centre-ville plat et court, calme, coût soutenable. Indicateurs indirects assumés.",
    intro:
      "Personnes à mobilité réduite : votre arbitrage ne se laisse pas mesurer aussi frontalement que celui d'un télétravailleur ou d'un investisseur locatif. Les vraies métriques qui feraient un palmarès parfait — pourcentage exact de stations de métro équipées d'ascenseur en état, ratio de bus plancher bas récents, densité de bateaux abaissés sur les trottoirs par kilomètre de voirie, largeur moyenne des trottoirs hors centre-ville historique, état de la voirie dégradée en périphérie, part de commerces marqués Tourisme & Handicap — ne sont pas centralisées commune par commune de manière comparable, et une même ville peut afficher un métro exemplaire et des trottoirs de quartier catastrophiques à trois cents mètres. Ce classement travaille donc en indicateurs indirects — mais des indicateurs qui, mis bout à bout, dessinent une géographie utile pour partir sur des pistes solides avant une visite terrain. Le transport en commun d'abord, poids le plus lourd : les métropoles dotées d'un métro ou d'un tramway (Lyon, Marseille, Toulouse, Lille, Rennes, Strasbourg, Nantes, Bordeaux, Montpellier, Angers, Le Havre, Dijon, Valenciennes, Reims, Nice, Saint-Étienne, Grenoble, Rouen, Le Mans, Tours, Brest, Caen, Orléans, Aubagne, Besançon, Avignon) ont massivement rénové leurs stations et rames sous l'obligation de la loi handicap de 2005 (article 45), et embarquent aujourd'hui la quasi-totalité de leurs lignes de tramway et une majorité de leurs stations de métro en accessibilité PMR intégrale — contrairement aux réseaux 100 % bus, qui restent inégaux malgré la généralisation du plancher bas et des palettes rétractables. Paris fait exception à double titre : réseau métro historique très partiellement accessible (une quinzaine de lignes seulement) mais couverture RER et tramway T3/T6/T8 plus favorable, et bus intégralement plancher bas. Le score sans voiture et la qualité de vie pondèrent la marchabilité réelle du centre-ville — un cœur historique piétonnisé, plat et court est infiniment plus praticable qu'une conurbation étirée où chaque trajet dépasse un kilomètre. La sécurité globale et le bruit environnant réduisent les risques de chute et facilitent la lecture de l'environnement — impératif pour qui compense partiellement une contrainte physique par une vigilance visuelle ou auditive accrue, ou pour qui ne peut pas s'écarter rapidement en cas de danger. Le coût enfin, parce que la mobilité réduite s'accompagne très souvent d'une pension d'invalidité, d'une AAH plafonnée ou d'une retraite anticipée pour inaptitude, et parce que l'aménagement d'un logement adapté (barres d'appui, siège de douche, WC surélevés, largeur de portes conforme, plan incliné) représente 2 000 à 8 000 € qu'un budget serré ne peut pas amortir sur un loyer déjà tendu. La qualité de l'air reste utile en marge — BPCO et pathologies respiratoires chroniques concernent une part significative de la population à mobilité réduite d'origine cardio-pulmonaire ou neuro-musculaire. Résultat : un palmarès tiré par les métropoles à réseau métro et tramway couvrant (Lyon, Strasbourg, Nantes, Rennes, Toulouse, Bordeaux, Montpellier, Angers, Grenoble, Lille), plusieurs villes moyennes à cœur historique compact, plat et bien desservi (Vannes, La Rochelle, Colmar, Chartres, Amboise, Chambéry), et systématiquement en retrait les grandes conurbations sans transit lourd, les banlieues sans centre marchable et les villes de relief sévère où chaque trottoir devient un obstacle. Un rappel important : ce classement n'est pas un audit d'accessibilité — c'est un point de départ. Une visite terrain reste indispensable, notamment pour la voirie de proximité du quartier ciblé, l'accessibilité réelle du logement visé, la présence des services médico-sociaux nécessaires, et la disponibilité effective des créneaux de transport adapté (TAD, PMR sur demande).",
    weights: {
      transport: 2.5,
      sansVoiture: 2.0,
      safety: 1.5,
      life: 1.5,
      bruit: 1.0,
      cost: 1.0,
      qualiteAir: 0.5,
    },
    reasonHint: (c) =>
      `Transport ${c.scores.transport.toFixed(1)} · sans voiture ${ownerVal(c, "sansVoiture").toFixed(1)} · calme ${ownerVal(c, "bruit").toFixed(1)}`,
  },
  {
    slug: "amateurs-de-littoral",
    emoji: "🌊",
    label: "Amateurs de littoral",
    metaTitle: "Meilleures villes littoral 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour vivre au bord de la mer : accès quotidien, cadre marin, qualité de vie, air marin. Manche, Atlantique, Méditerranée.",
    intro:
      "Amateurs de littoral : votre semaine ne s'organise pas comme celle d'un citadin de l'intérieur. La proximité de la mer n'est pas un plaisir de vacances mais une composante de la vie quotidienne — un footing sur le sable à sept heures, un plongeon en rentrant du bureau en juin, la ligne d'horizon depuis la fenêtre ou depuis la terrasse d'un café, l'odeur d'iode qui remplace celle des gaz d'échappement, un dimanche d'huîtres au port de pêche plutôt qu'au centre commercial. Ce profil se distingue nettement d'« amateurs de plein air » (qui pondère la nature au sens large — forêts, sentiers, parcs — et le climat tempéré) et d'« anti-canicule » (qui cherche des étés vivables sans se soucier de la géographie côtière). Ici on ne demande pas seulement de la nature accessible : on demande de la mer accessible, tous les jours, en quinze minutes à pied ou à vélo, pas en une heure de voiture le samedi. La différence a des conséquences très concrètes sur le tissu urbain — architecture ouverte sur l'eau, marché aux poissons, clubs nautiques, écoles de voile, cabanes d'ostréiculteurs, criques et calanques, plages surveillées l'été, digues et jetées où l'on marche l'hiver — et sur la vie sociale, souvent tirée par les activités maritimes de saison douce. Ce classement pondère d'abord la proximité littorale, dérivée pour chaque ville de la distance haversine à la côte la plus proche parmi les trois façades françaises (Manche, Atlantique, Méditerranée) : une ville à moins de trois kilomètres du rivage tient un score maximal, une ville à vingt kilomètres reste dans la vie littorale au sens large (accès quotidien facile en été et en week-end), une ville à plus de deux cents kilomètres bascule dans la géographie intérieure et sort du classement. On complète par la nature globale (parce qu'un littoral bétonné sans arrière-pays vert perd la moitié de son intérêt), par la qualité de l'air (les brises marines nettoient les particules mais la proximité industrialo-portuaire peut inverser la logique), par la qualité de vie générale, par la sécurité, par la résistance canicule (les étés atlantiques restent plus tempérés que les étés méditerranéens, l'écart entre 27 °C à La Rochelle et 34 °C à Perpignan pèse pour qui vit toute l'année sur place et pas seulement pour trois semaines en août), et par les transports pour ne pas isoler la vie littorale du reste. Résultat : un palmarès tiré par les stations balnéaires atlantiques équilibrées (La Rochelle, Saint-Malo, Vannes, Lorient, Arcachon, Biarritz, Anglet, Bayonne), plusieurs villes méditerranéennes bien situées (Cassis, Menton, Antibes, Cagnes-sur-Mer, Sète), quelques préfectures maritimes bretonnes ou normandes sous-cotées, et systématiquement en retrait les grandes métropoles intérieures — même très agréables (Toulouse, Lyon, Bordeaux ville-centre à cinquante kilomètres du Bassin d'Arcachon), elles ne remplissent pas le contrat de la vie littorale quotidienne.",
    weights: {
      coastalProximity: 3.0,
      nature: 1.5,
      qualiteAir: 1.5,
      life: 1.5,
      safety: 1.0,
      canicule: 1.0,
      transport: 0.5,
    },
    reasonHint: (c) => {
      const km = computeCityDistances(c as CitySeed).sea?.distanceKm;
      const kmLabel = km == null
        ? "distance mer non renseignée"
        : km <= 3
          ? "front de mer"
          : `${Math.round(km)} km de la mer`;
      return `${kmLabel} · nature ${c.scores.nature.toFixed(1)} · vie ${c.scores.life.toFixed(1)}`;
    },
  },
  {
    slug: "amateurs-de-montagne",
    emoji: "🏔️",
    label: "Amateurs de montagne",
    metaTitle: "Meilleures villes montagne 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour vivre en montagne : accès quotidien au relief, cadre alpin, air pur, étés frais. Alpes, Pyrénées, Massif central, Jura, Vosges.",
    intro:
      "Amateurs de montagne : votre semaine se règle au bulletin météo montagne et au niveau nivologique BRA. La proximité du relief n'est pas un plaisir de vacances mais une composante quotidienne — le sentier qui démarre au bout du parking, la vue sur les crêtes depuis la fenêtre du salon, le club d'escalade ouvert le mardi soir, le vélo de route qui grimpe un col avant le petit-déjeuner, la neige qu'on prend à trente minutes de voiture en janvier plutôt qu'à cinq heures de train un week-end sur deux. Le profil se distingue nettement d'« amateurs de plein air » (qui pondère la nature au sens large — forêts, sentiers, parcs, plaine ou moyenne montagne indifféremment) et d'« amateurs de littoral » (qui vise la mer accessible tous les jours). Ici on ne demande pas seulement de la nature accessible : on demande du relief accessible, avec ce qu'il implique de spécifique — dénivelé pour la rando et le vélo, altitude pour la fraîcheur estivale et l'enneigement hivernal, roche pour l'escalade et les via ferrata, sentiers balisés maillés à haute densité (FFRandonnée compte plus de 100 000 kilomètres de GR et GRP en France, très inégalement répartis), clubs alpins historiquement enracinés (le Club Alpin Français a été fondé à Grenoble en 1874), et une culture locale qui parle refuge, station et saison là où d'autres villes parlent shopping ou terrasses. Le classement pondère d'abord la proximité montagne, dérivée pour chaque ville de la distance haversine à la porte d'entrée du massif le plus proche parmi les grands massifs français (Alpes du Nord via Albertville, Alpes du Sud via Gap, Pyrénées via Lourdes, Massif Central via Clermont-Ferrand, Vosges via Gérardmer, Jura via Lons-le-Saunier, Massif corse via Corte). Une ville au pied d'un massif tient le score maximal. À trente kilomètres, la vie de massif reste quotidienne — skier après le boulot en semaine tient debout, la sortie du dimanche va de soi. À cent kilomètres, on bascule dans une géographie de week-end régulier. Au-delà de deux cent cinquante, on sort du cadre. On complète par la nature globale, parce qu'un piémont sans forêt ni rivières perd la moitié de son intérêt. Par la résistance canicule : l'altitude modère naturellement les étés, et l'écart entre vingt-deux degrés à Chambéry et trente-quatre à Perpignan pèse pour qui vit là toute l'année, pas pour trois semaines en août. Par la qualité de l'air : les stations d'altitude affichent des ATMO systématiquement meilleurs que le fond de vallée voisin, avec une nuance importante pour les villes de fond de vallée elles-mêmes — Grenoble, Chambéry, Annemasse — soumises aux inversions thermiques hivernales qui piègent particules et NO₂. On intègre la qualité de vie générale pour ne pas se retrouver dans une bourgade isolée sans services, on regarde la sécurité, et on garde une marge pour les transports — parce que vivre en montagne sans desserte ferroviaire ni route dégagée l'hiver isole vite. Résultat : un palmarès tiré par les capitales alpines classiques (Grenoble, Chambéry, Annecy, adossées à la Chartreuse, aux Bauges, à Belledonne, au Vercors et aux Aravis), les préfectures des Hautes-Alpes et Alpes-de-Haute-Provence (Gap, Briançon, Digne-les-Bains, Manosque), les portes des Pyrénées (Pau, Tarbes, Lourdes, Foix), plusieurs villes du Massif Central adossées à un vrai relief (Clermont-Ferrand aux pieds des Puys, Aurillac au cœur du Cantal, Le Puy-en-Velay sur les monts du Velay), les Vosges et le Jura pour les massifs moyens du Grand Est (Épinal, Vesoul, Pontarlier, Lons-le-Saunier), et systématiquement en retrait — même très agréables par ailleurs — les grandes métropoles de plaine (Nantes, Bordeaux, Lille, Rennes, Reims), la façade littorale pure et le bassin parisien, qui ne remplissent pas le contrat de la vie de massif au quotidien.",
    weights: {
      mountainProximity: 3.0,
      nature: 1.5,
      canicule: 1.5,
      life: 1.5,
      qualiteAir: 1.0,
      safety: 1.0,
      transport: 0.5,
    },
    reasonHint: (c) => {
      const km = computeCityDistances(c as CitySeed).mountain?.distanceKm;
      const kmLabel = km == null
        ? "distance massif non renseignée"
        : km <= 3
          ? "au pied du massif"
          : `${Math.round(km)} km du massif`;
      return `${kmLabel} · nature ${c.scores.nature.toFixed(1)} · vie ${c.scores.life.toFixed(1)}`;
    },
  },
  {
    slug: "amateurs-de-culture",
    emoji: "🎭",
    label: "Amateurs de culture",
    metaTitle: "Meilleures villes culture 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour la vie culturelle au quotidien : musées, théâtres, opéras, scènes labellisées, festivals structurants, patrimoine. Culture 3.0 + urbanité.",
    intro:
      "Amateurs de culture : votre semaine ne s'organise pas autour d'un job, d'un enfant ou d'un ratio salaire-loyer, mais autour d'une programmation — l'exposition qui vient d'ouvrir, la pièce au théâtre municipal jeudi soir, l'abonnement à la saison lyrique, le concert au festival d'été, la conférence à la médiathèque, le vernissage du vendredi, le week-end architecture pendant les Journées européennes du patrimoine. Ce profil se distingue des autres profils du site qui pondèrent la culture au passage — « jeunes actifs » (culture 2,0 dans un mélange carrière-loyer), « couple sans enfant » (culture 2,5 dans un mélange vie-nature-transport), « télétravailleurs » (culture 1,5 dans un mélange qualité de vie-connectivité), « expat retour » (culture 1,5 dans un mélange qualité de vie-international) — chez tous ceux-là, la culture est un complément agréable d'un mode de vie principalement défini ailleurs. Ici c'est l'inverse : la programmation commande, le reste s'organise autour. Concrètement, un amateur culture-first accepte une ville plus dense, plus chère et parfois plus verticale si la scène compense, alors qu'un télétravailleur salarié ferait rarement le même arbitrage. Le critère cardinal, c'est l'axe culture du seed, calibré sur la densité de salles de spectacle par habitant (théâtres, opéras, salles de concert, scènes labellisées de type CDN, SMAC, CCN), la densité muséale (musées de France labellisés par le ministère de la Culture), le classement UNESCO ou Monuments historiques du patrimoine bâti, les festivals structurants annuels (Avignon, Aix-en-Provence, Vieilles Charrues, Trans Musicales, Francofolies, Nuits de Fourvière, Voyage à Nantes, Chorégies d'Orange, Festival de Cannes, Interceltique de Lorient, Rio Loco, Nuits Sonores, Jazz in Marciac, entre autres) et le tissu associatif culturel local. On complète par la qualité de vie urbaine — parce qu'une programmation dense reste inutile si le centre-ville est mort à 20 h ou si les rues sont hostiles au piéton du soir. Les transports en commun et la praticabilité sans voiture pèsent parce que l'amateur sort à pied ou en tram — trois soirées par semaine avec un aller-retour voiture devient vite une contrainte, et le stationnement de spectacle en centre-ville historique est presque toujours galère. La sécurité globale intervient pour rentrer sereinement d'un spectacle à 23 h en semaine. La qualité de l'air joue comme un plus pour la vie de terrasse et les balades urbaines qui accompagnent naturellement la sortie culturelle. Et on garde un demi-poids nature pour préserver quelques échappées dominicales — un amateur de culture qui ne prend jamais l'air finit épuisé par l'urbanité continue. Résultat : un palmarès tiré par Paris (aucune autre ville française n'approche sa concentration muséale et scénique), les capitales régionales muséales et scéniques (Lyon avec son Opéra, les Nuits de Fourvière et la Biennale d'art contemporain ; Strasbourg avec le TNS et le musée d'art moderne ; Bordeaux avec le CAPC, le Grand-Théâtre et Cap Sciences ; Toulouse avec les Abattoirs, le Théâtre national et le festival Rio Loco ; Nantes avec le Voyage à Nantes et les Machines de l'île ; Marseille avec le MuCEM, la Vieille Charité et le Ballet national ; Montpellier avec le Corum et Radio France Occitanie ; Nice avec l'Opéra et le MAMAC), les villes moyennes à identité culturelle forte (Aix-en-Provence pour le Festival lyrique, Avignon pour le IN et le OFF, Reims pour la cathédrale et les Flâneries musicales, Angers pour le Château et Premiers Plans, Nancy pour l'Art nouveau et la place Stanislas, Metz avec le Centre Pompidou-Metz), les hauts-lieux d'un festival estival majeur (Colmar, Carcassonne, Saintes, Beaune, Sisteron) et les préfectures classées patrimoine mondial (Le Havre, Chartres, Bourges, Provins). Systématiquement en retrait — les banlieues résidentielles sans centre culturel propre, les préfectures peu dotées et les villes dortoirs sans ancrage patrimonial ou associatif fort. Un rappel important : la métrique culture est calibrée sur des indicateurs quantifiables (densité d'équipements, patrimoine classé, festivals labellisés) mais la vitalité d'une saison culturelle dépend aussi de facteurs qui ne se laissent pas mesurer — programmation d'un directeur d'établissement, dynamisme d'une association locale, ancrage d'une scène punk ou jazz — et une vérification par l'office de tourisme, la mairie culture ou la programmation en ligne reste la meilleure boussole pour une année donnée.",
    weights: {
      culture: 3.0,
      life: 1.5,
      transport: 1.0,
      sansVoiture: 1.0,
      safety: 0.5,
      qualiteAir: 0.5,
      nature: 0.5,
    },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "navetteurs-hybrides",
    emoji: "🚆",
    label: "Actifs en hybride (2-3 jours au bureau)",
    metaTitle: "Meilleures villes télétravail hybride 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour le télétravail hybride 2-3 jours : trajet estimé vers le pôle d'emploi le plus proche, loyer, fibre, qualité de vie.",
    intro:
      "Actifs en hybride : deux ou trois jours au bureau, le reste à la maison. C'est le mode d'organisation le plus répandu chez les cadres depuis les accords télétravail de 2021-2022, et c'est celui qui déplace le plus la géographie du logement. Ce profil n'est pas celui des « télétravailleurs salariés », qui pondère la fibre et la qualité de vie sans regarder la distance : quand on ne revient jamais au siège, on peut s'installer à Quimper comme à Cahors, l'éloignement ne coûte rien. Ici on revient, deux à trois fois par semaine, à heure fixe, avec un abonnement à payer et une soirée à sauver. Ce n'est pas non plus « vivre sans voiture » ni « cyclistes urbains », qui mesurent la mobilité à l'intérieur d'une ville, ni « freelances », qui n'ont pas de siège du tout. Le critère cardinal est donc le temps de trajet vers le plus proche des douze grands pôles d'emploi retenus : Paris, Lyon, Marseille, Toulouse, Bordeaux, Lille, Nantes, Strasbourg, Montpellier, Rennes, Nice, Grenoble. C'est une estimation, et elle est annoncée comme telle. On garde le plus rapide entre trois options : le rail via Paris, calculé sur les temps SNCF publiés à chaque bout ; le rail direct, mais seulement quand la ville a elle-même une gare desservie, parce qu'un modèle qui suppose une ligne partout invente des liaisons fermées depuis vingt ans ; et la route, distance à vol d'oiseau majorée d'un facteur de détour, plus un quart d'heure d'approche urbaine aux deux bouts. Le barème est calé sur ce que l'hybride tient vraiment : trente minutes ou moins ne se discutent pas, une heure de porte à porte reste le seuil que la plupart des navetteurs déclarent tenir, deux heures se supportent deux jours par semaine mais pas cinq, et le compte tombe à zéro au-delà de deux heures et demie. Deux limites franches à garder en tête. En relief, dans les Vosges, les Cévennes ou les Alpes, le facteur routier sous-estime le trajet réel, parfois de moitié. Et les villes des DROM comme celles de Corse valent zéro sur cet axe : il n'existe pas de navette hebdomadaire vers un bassin d'emploi métropolitain, ce n'est pas une donnée manquante mais une mesure. Le coût vient juste derrière, parce que l'hybride n'est pas une préférence esthétique mais un arbitrage financier : on achète du mètre carré avec du temps de transport. Viennent ensuite la qualité de vie, puisque les jours non travaillés au bureau se passent sur place et pas dans un quartier d'affaires ; la fibre et l'aptitude au télétravail, parce que la moitié de la semaine se joue sur la connexion du salon ; les transports locaux, parce que rejoindre la gare tous les matins en deuxième voiture annule une partie de l'économie ; et une marge pour la nature et la sécurité. Résultat : deux réponses cohabitent dans le classement, et c'est la lecture honnête du calcul. La première consiste à rester dans le pôle ou à sa porte, avec Rennes, Nantes, Strasbourg, Lyon, Bordeaux, Toulouse et Grenoble en tête, Villeurbanne à dix-sept minutes de Lyon et Issy-les-Moulineaux à vingt et une de Paris. La seconde, plus intéressante, est la couronne des trente à cinquante minutes, où l'écart de loyer paie le trajet : Senlis, à cinquante-deux minutes de Paris, loue un T3 1 030 € quand Paris en demande 2 800 ; Vienne, à trente-huit minutes de Lyon, 940 € contre 1 380 €, et 2 200 €/m² à l'achat contre 5 000 ; Vitré, à quarante-cinq minutes de Rennes, 800 € contre 1 100 ; La Roche-sur-Yon, à quarante-six minutes de Nantes, 800 € contre 1 150 avec le mètre carré à moitié prix (2 100 € contre 4 200). Trois nuances à ne pas lire de travers. Obernai, deuxième du classement, loue son T3 1 040 € quand Strasbourg en demande 1 080 : il n'y monte pas pour son prix mais pour son cadre de vie, le plus élevé du top 20. Valbonne, à trente-quatre minutes de Nice, ne fait pas mieux non plus (1 490 € contre 1 500 €). Et Muret ne fait gagner que sur l'achat, 2 800 €/m² contre 4 000 à Toulouse, pas sur le loyer, identique à 1 150 €. La bonne question n'est jamais « quelle ville est la moins chère », c'est « combien de minutes je vends, et à quel prix le mètre carré me les rachète ».",
    weights: {
      metroAccess: 3.0,
      cost: 2.5,
      life: 1.5,
      remoteWork: 1.0,
      teletravail: 1.0,
      transport: 1.0,
      nature: 0.5,
      safety: 0.5,
    },
    reasonHint: (c) => {
      const commute = metroAccessCommute(c);
      const label = commute
        ? commute.minutes === 0
          ? "sur place"
          : `${HUB_LABEL[commute.hub]} en ${formatCommute(commute.minutes)}`
        : "aucun pôle joignable";
      return `${label} · coût ${c.scores.cost.toFixed(1)} · vie ${c.scores.life.toFixed(1)}`;
    },
  },
  {
    slug: "suivi-medical-regulier",
    emoji: "🩺",
    label: "Suivi médical régulier",
    metaTitle: "Meilleures villes suivi médical régulier 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises quand une pathologie chronique impose des rendez-vous réguliers : généralistes, spécialistes, urgences, pharmacies, trajets, coût.",
    intro:
      "Suivi médical régulier : quand une pathologie chronique impose des rendez-vous tous les mois ou toutes les semaines (dialyse, chimiothérapie, rééducation après un AVC, suivi cardiologique, diabète insulino-dépendant, maladie inflammatoire, sclérose en plaques), la carte de France qui décide de votre quotidien n'est ni celle du dynamisme économique ni celle du cadre de vie, c'est celle de l'accès aux soins. Ce profil se distingue nettement des trois qui en approchent : « personnes à mobilité réduite » pondère d'abord l'accessibilité PMR des transports et la marchabilité du centre-ville, « proches aidants » accompagne quelqu'un d'autre et cherche avant tout du calme et un tissu médico-social, « asthmatiques et allergiques » vise l'air respirable plutôt que l'offre de soins. Aucun de ces trois-là ne regarde ce qui compte ici. Le critère cardinal est donc l'accès aux soins lui-même, agrégé sur quatre dimensions : la densité de médecins généralistes pour 35 %, parce que c'est la porte d'entrée du système et celle qui décide si vous trouverez un médecin traitant (sans médecin traitant déclaré, le remboursement d'une consultation tombe de 70 % à 30 %) ; la présence de spécialistes et d'un plateau technique pour 25 %, la distance à un service d'accueil des urgences pour 25 %, le maillage de pharmacies pour 15 %. Une précision d'emblée, parce qu'elle change la façon de lire ce classement : cet indicateur est une estimation, construite depuis le département, la taille de la commune et son statut hospitalier, calibrée sur les références publiques de la DREES, du Conseil national de l'Ordre des médecins et du zonage ARS (zones d'intervention prioritaire et zones d'action complémentaire). Ce n'est pas un relevé de cabinets commune par commune, et deux villes du même département partagent ici la même densité de généralistes alors que l'une peut avoir vu partir deux médecins l'an dernier. Le coût vient ensuite, et pas pour la raison qu'on croit : l'ALD exonérante, c'est-à-dire la liste des trente affections de longue durée, prend en charge à 100 % du tarif de la Sécurité sociale les soins liés à l'affection, mais elle ne couvre ni les dépassements d'honoraires, ni le forfait journalier hospitalier, ni ce qui relève des autres soins, et un temps partiel thérapeutique ampute le revenu au moment précis où les frais montent. Les transports pèsent autant, parce que la vraie unité de compte d'un suivi chronique n'est pas la consultation mais le trajet répété : trois séances de dialyse par semaine, ce sont plus de trois cents allers-retours par an. Le véhicule sanitaire léger et le taxi conventionné sont remboursés sur prescription en ALD, mais ils supposent une offre disponible localement, et beaucoup de traitements contre-indiquent la conduite pendant plusieurs heures. Suivent la résistance à la canicule, parce que les personnes atteintes de maladie chronique figurent parmi les publics à risque du plan national canicule : la chaleur décompense l'insuffisance cardiaque et rénale, et plusieurs traitements courants altèrent la thermorégulation. Puis la qualité de l'air, la qualité de vie générale, la sécurité et le calme. Résultat : le palmarès est tenu par les villes universitaires de taille moyenne dotées d'un CHU, où l'accès maximal se paie encore un loyer raisonnable. Rennes sort en tête (accès 7,9/10, T3 à 1 100 €), devant Strasbourg (7,9 et 1 080 €), Brest, Angers, Lille, Nantes, Dijon, Caen, Bordeaux et Besançon ; suivent Saint-Étienne, Reims, Nancy, Grenoble, Tours, Limoges, Rouen, Ivry-sur-Seine, Toulouse et Lyon. Deux d'entre elles méritent d'être regardées de près par qui doit tenir un budget : Saint-Étienne aligne l'accès maximal (7,9) avec le logement le moins cher du top 20, T3 à 770 € et mètre carré à 1 500 € ; Limoges tient 7,1 à 800 € et 1 600 €. Brest, troisième, illustre le compromis inverse : plateau hospitalier et spécialistes au plus haut, généralistes seulement dans la moyenne du Finistère, mais l'air, le calme et les étés les plus tempérés du classement. Deux pièges se lisent en creux, et ils sont l'intérêt principal de ce classement. Le premier est rural : les villes qui paraissent les plus abordables sont exactement celles où l'accès s'effondre — Guéret loue un T3 630 € et vend le mètre carré 1 000 €, avec un accès aux soins à 2,3/10 ; Aurillac 560 € pour 3,1 ; Mende 640 € pour 3,0 ; Nevers 710 € pour 3,6. Un budget qui tient sur le papier ne tient plus dès qu'il faut deux heures de route pour un rendez-vous mensuel. Vingt-deux villes du site tombent au niveau « désert » de l'échelle : elles comptent toutes moins de quinze mille habitants, et toutes affichent un mètre carré inférieur au prix médian du site. La corrélation n'a rien d'un hasard, et c'est elle qu'il faut retenir de cette page. Le second est touristique, et il cumule les deux défauts : Arcachon demande 1 500 € de T3 et 6 800 € du mètre carré pour un accès à 3,5, Gordes 1 560 € pour 3,4, Saint-Tropez 2 600 € et 12 000 € pour 4,2. Beaucoup de résidences secondaires, peu de médecins à l'année. Reste le paradoxe des très grandes villes, qui vaut d'être dit franchement : Paris, Marseille et Nice affichent toutes les trois l'accès maximal, 7,9/10, et sortent pourtant 57ᵉ, 163ᵉ et 100ᵉ. Paris décroche sur le coût seul (T3 à 2 800 €, mètre carré à 10 500 €), Nice sur le coût et la chaleur, Marseille sur la chaleur, l'air et des transports en retrait. L'accès aux soins ne se paie pas qu'en kilomètres. Un rappel pour finir, qui vaut plus que le classement lui-même : ceci est un point de départ, pas un audit. Avant tout déménagement, la vérification qui compte est de savoir si un médecin traitant accepte de nouveaux patients dans le quartier visé, si le service qui vous suit a une équivalence sur place, et sous quel délai. Trois réponses qu'aucun modèle ne peut donner, et que l'établissement concerné, la CPAM et l'ARS de la région donnent en un appel.",
    weights: {
      healthcareAccess: 3.0,
      transport: 1.5,
      cost: 1.5,
      life: 1.0,
      qualiteAir: 1.0,
      canicule: 1.0,
      safety: 0.5,
      bruit: 0.5,
    },
    reasonHint: (c) =>
      `Accès aux soins ${(10 - computeHealthcareAccess(c).composite).toFixed(1)} · transport ${c.scores.transport.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "travailleurs-frontaliers",
    emoji: "🛂",
    label: "Travailleurs frontaliers",
    metaTitle: "Meilleures villes travailleurs frontaliers 2026 — Top 20",
    metaDescription:
      "Top 20 des villes où habiter quand on travaille en Suisse, au Luxembourg, en Allemagne, en Belgique ou à Monaco : distance au pôle, loyer, transports, fibre.",
    intro:
      "Travailleurs frontaliers : on dort en France, on est payé de l'autre côté, et le loyer qu'on paie a déjà été fixé par les voisins qui font la même chose. Ils étaient 465 000 en 2021 à résider en France métropolitaine et à travailler dans l'un des huit pays limitrophes, selon le recensement de l'Insee. La Suisse en absorbe près de la moitié avec 224 000 personnes, le Luxembourg près d'un quart avec 105 000, l'Allemagne 50 000, la Belgique 46 000, Monaco 33 000 ; l'Espagne et l'Italie tournent autour de 5 000 chacune. Ce profil ne recoupe aucun des trente-quatre autres. « Actifs en hybride » vise un pôle d'emploi français et deux à trois allers-retours par semaine ; ici on y va cinq jours, et la frontière change le régime fiscal, la caisse maladie et le bulletin de paie. « Expatriés de retour » traite du retour définitif, pas d'une vie quotidienne à cheval sur deux pays. Et « télétravailleurs salariés » ignore la distance par construction, alors qu'elle est ici le premier des critères. Le critère cardinal est donc l'accès à un bassin d'emploi transfrontalier, mesuré vers quatorze pôles répartis sur cinq pays : Genève, Lausanne, Neuchâtel et Bâle côté suisse, Luxembourg-Ville et Esch-sur-Alzette côté luxembourgeois, Sarrebruck, Karlsruhe, Offenbourg et Fribourg-en-Brisgau côté allemand, Mouscron, Tournai et Mons côté belge, plus Monaco. L'Espagne et l'Italie en sont volontairement absentes : à cinq mille personnes, le flux y est un ordre de grandeur en dessous du plus petit pôle retenu, et faire entrer Irun mettrait Hendaye en haut d'un classement qui parle d'autre chose. Hendaye vaut donc zéro sur cet axe, comme la Corse et les DROM, et c'est une mesure, pas une donnée manquante. Le barème publie des kilomètres, pas des minutes, et c'est une décision. Un franchissement de frontière est précisément le cas où un modèle horaire ment le plus : la douane de Bardonnex, le pont de Huningue et la Basse Corniche se mesurent en files d'attente, pas en vitesse moyenne. On garde donc la distance à vol d'oiseau majorée d'un facteur de détour routier, avec un plein score jusqu'à vingt kilomètres, une décroissance accélérée ensuite et zéro à cent dix. La sévérité du milieu de fourchette est voulue : entre quarante et soixante-dix kilomètres, le trajet cesse d'être une navette pour devenir un choix de vie, et l'Insee relève qu'un frontalier sur cinq parcourt plus de cinquante kilomètres, donc que quatre sur cinq restent en deçà. Le coût vient juste derrière, et il porte le vrai sujet de cette page. Viennent ensuite les transports, parce que passer la frontière en tram ou en TER plutôt qu'en deuxième voiture change le budget autant que le loyer ; la qualité de vie, puisque c'est le côté français qu'on habite le soir ; puis la fibre et l'aptitude au télétravail, qui ne sont plus un confort mais un paramètre fiscal depuis que les accords chiffrent les jours passés à la maison ; et une marge pour la sécurité et la nature. Résultat en tête : Gex, à vingt et un kilomètres de Genève, devance Strasbourg, Annemasse, Lille, Menton et Longwy. Mais le classement se lit moins par son ordre que par sa ligne de fracture. Onze villes du site sont à vingt kilomètres ou moins d'un pôle étranger, et elles se répartissent en deux familles que tout oppose sur le loyer. La frontière chère, celle des bassins genevois, lémanique et monégasque : Nice à 1 500 € le T3, Menton à 1 450 €, Annemasse à 1 350 €, Évian-les-Bains à 1 250 €, avec le mètre carré à 5 200 € à Nice comme à Menton et 4 800 € à Annemasse. La frontière bon marché, celle du Nord, de la Moselle-Est et du pays-haut lorrain : Forbach à 670 €, Sarreguemines à 690 €, Roubaix à 700 €, Wattrelos à 730 €, Tourcoing à 740 €, Longwy à 910 €, Saint-Louis à 1 010 €. Du simple au double sur le loyer, et de 1 200 € à 4 800 € le mètre carré entre Forbach et Annemasse, pour le même privilège de passer la frontière en un quart d'heure. La géographie du salaire étranger n'est donc pas la géographie du prix français : les bassins genevois et monégasque ont déjà capitalisé le différentiel dans la pierre, les bassins sarrois, lorrain et du Nord ne l'ont pas fait. Reste à dire pourquoi, et le site le mesure sans le commenter : Forbach affiche 4,7 sur 10 de qualité de vie, Longwy 5,9, quand Obernai monte à 9,0 et Annecy à 9,0. Le charbon a quitté la Moselle-Est par étapes, les puits de Petite-Rosselle fermant entre 1962 et 2001, et la dernière mine française, La Houve à Creutzwald, s'est arrêtée le 23 avril 2004. Le loyer bas de cette frontière-là est le prix d'un demi-siècle de désindustrialisation, et le salaire allemand ou luxembourgeois est ce qui la repeuple. Trois limites franches, à garder en tête avant de faire un carton. La première tient au modèle : à distance égale, une vallée alpine, un col du Jura et la plaine d'Alsace ne se franchissent pas au même rythme, et le calcul les traite pareil. La deuxième est la conséquence directe de la première, et Saint-Paul-de-Vence, vingtième, en est l'exemple le plus net : trente-deux kilomètres de Monaco à vol d'oiseau, mais une commune de 3 600 habitants où le T3 se loue 1 780 € et le mètre carré s'achète 7 000 €, reliée par une route littorale saturée. La troisième est un partage de rangs : cinq villes sortent à 6,5 pour trois places, Mulhouse, Thonon-les-Bains et Saint-Paul-de-Vence entrant dans le top 20 quand Lingolsheim et Bischheim, à la même note, s'arrêtent juste derrière ; entre elles, l'ordre n'est pas un départage. Enfin, ce que ce classement ne décide pas, et qui décidera pourtant de votre feuille de paie : le régime fiscal et social ne se choisit pas commune par commune, il dépend du pays et parfois du canton. Côté suisse, l'accord de 1983 couvre Berne, Soleure, Bâle-Ville, Bâle-Campagne, Vaud, Valais, Neuchâtel et le Jura, et impose le frontalier en France, la France reversant aux cantons 4,5 % de la masse salariale. Genève relève d'un accord distinct de 1973 et impose à la source, en reversant 3,5 % des salaires bruts à l'Ain et à la Haute-Savoie. Autrement dit, Gex et Annemasse ne sont pas dans le même régime que Saint-Louis, alors que les trois figurent dans ce top 20. Sur le télétravail, l'avenant franco-suisse signé le 27 juin 2023 est entré en vigueur le 24 juillet 2025 et s'applique depuis le 1er janvier 2026 : jusqu'à 40 % du temps de travail annuel depuis la France sans changement de l'État d'imposition, dont au plus dix jours de missions temporaires, avec un échange automatique de données salariales entre les deux pays dont le premier envoi est attendu en 2027 sur l'année 2026. Côté luxembourgeois la règle n'est pas un pourcentage mais un compteur de jours : la convention tolère 34 jours par an travaillés hors du Grand-Duché, et au-delà le télétravail devient imposable en France dès le premier jour. Et le seuil social est encore un troisième nombre, indépendant des deux premiers : depuis le 1er juillet 2023, un accord-cadre européen permet, sur demande, de télétravailler jusqu'à 49,9 % de son temps en restant affilié à la sécurité sociale du pays de l'employeur. Confondre ces trois plafonds est l'erreur la plus coûteuse du dossier. Dernier point qui se joue en trois mois et pas trois ans : un frontalier en Suisse doit exercer son droit d'option entre la LAMal et l'assurance maladie française dans les trois mois qui suivent sa prise de poste, faute de quoi il bascule sur le régime suisse, et l'assurance privée française n'est plus une option depuis le 1er juin 2014. Le loyer se compare sur une page. Le reste se vérifie auprès du service des impôts, de la caisse concernée et du groupement transfrontalier de la zone visée, avant de signer quoi que ce soit.",
    weights: {
      borderAccess: 3.0,
      cost: 2.0,
      transport: 1.5,
      life: 1.5,
      teletravail: 1.0,
      safety: 0.5,
      nature: 0.5,
    },
    reasonHint: (c) => {
      const b = borderCommute(c);
      return `${b ? `${b.hub} à ${b.km} km` : "aucun pôle frontalier"} · coût ${c.scores.cost.toFixed(1)} · transports ${c.scores.transport.toFixed(1)}`;
    },
  },
];

export const PROFILE_SLUGS = PROFILE_PAGES.map((p) => p.slug);

export interface ProfileMatch {
  city: CityLight;
  score: number;
  reason: string;
}

export function rankByProfile(profile: ProfileDef, cities: CityLight[], limit = 20): ProfileMatch[] {
  const totalWeight = Object.values(profile.weights).reduce<number>((s, v) => s + (v ?? 0), 0);
  const rows: ProfileMatch[] = cities.map((city) => {
    let weightedSum = 0;
    for (const [key, weight] of Object.entries(profile.weights)) {
      if (weight == null) continue;
      weightedSum += getScoreValue(city, key) * weight;
    }
    const score = totalWeight > 0 ? weightedSum / totalWeight : 5;
    return {
      city,
      score: Math.round(score * 10) / 10,
      reason: profile.reasonHint(city),
    };
  });
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, limit);
}

export function getProfile(slug: string): ProfileDef | undefined {
  return PROFILE_PAGES.find((p) => p.slug === slug);
}
