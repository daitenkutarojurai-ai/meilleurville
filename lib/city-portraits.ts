// R8.3 — Fictional portrait personas per city.
//
// Each city gets 3 deterministic "portraits-types" — clearly labeled as fictional
// characters (personnages fictifs) — derived from its top niche scores plus
// demographics. Names + ages picked from fixed seed pools so the same city
// always shows the same portraits.
//
// NOT real testimonials. NOT real users. Pure illustrative scenarios for
// helping readers imagine if a city matches their archetype.

import type { CitySeed } from "@/data/cities-seed";
import { computeNicheScores, type NicheScores } from "@/lib/niche-scores";

type ArchetypeKey =
  | "teletravailleur"
  | "famille"
  | "retraite"
  | "etudiant"
  | "expat"
  | "couple-actif"
  | "primo-accedant"
  | "creatif";

interface Archetype {
  key: ArchetypeKey;
  label: string;
  emoji: string;
  ageRange: [number, number];
  professions: string[];
  motivations: string[]; // template strings with {city}
  worries: string[];
  weights: (n: NicheScores, c: CitySeed) => number;
}

const ARCHETYPES: Archetype[] = [
  {
    key: "teletravailleur",
    label: "Télétravailleur en pleine bascule",
    emoji: "💻",
    ageRange: [29, 41],
    professions: ["développeuse freelance", "consultante en marketing", "product manager", "rédacteur tech", "designer produit", "data analyst"],
    motivations: [
      "fuir un loyer parisien et garder le même salaire",
      "habiter plus près de la nature sans perdre la fibre",
      "trouver une vraie séparation maison/travail",
    ],
    worries: ["isolement social", "qualité de la connexion fibre", "manque de coworkings"],
    weights: (n) => n.remote * 1.4 + (n.expat * 0.6),
  },
  {
    key: "famille",
    label: "Famille jeunes enfants",
    emoji: "👨‍👩‍👧",
    ageRange: [33, 42],
    professions: ["ingénieure", "professeur des écoles", "infirmier", "chef de projet", "cadre RH"],
    motivations: [
      "trouver une école publique solide sans payer le privé parisien",
      "récupérer du temps en se rapprochant du travail",
      "avoir un jardin pour les enfants",
    ],
    worries: ["liste d'attente crèche", "qualité du collège de secteur", "trajets domicile-école"],
    weights: (n, c) => c.scores.schools * 1.3 + c.scores.safety * 0.7 + c.scores.life * 0.4,
  },
  {
    key: "retraite",
    label: "Couple à la retraite",
    emoji: "🌿",
    ageRange: [62, 71],
    professions: ["ancien médecin et enseignante", "anciens cadres", "ancien ingénieur SNCF", "couple de commerçants à la retraite"],
    motivations: [
      "se rapprocher d'une ville à taille humaine",
      "garder un accès facile aux soins",
      "vendre la grande maison pour un T3 central",
    ],
    worries: ["étés caniculaires", "déserts médicaux", "transports si on ne conduit plus"],
    weights: (n) => n.retirement * 1.5,
  },
  {
    key: "etudiant",
    label: "Étudiant·e en master",
    emoji: "🎓",
    ageRange: [20, 24],
    professions: ["étudiante en master sciences po", "étudiant en école d'ingé", "étudiant en école de commerce", "étudiante en médecine 4e année"],
    motivations: [
      "trouver un studio à moins de 600 €",
      "vivre près du centre sans voiture",
      "scène culturelle et sociale animée",
    ],
    worries: ["budget loyer", "vie culturelle modeste", "transport tard le soir"],
    weights: (n) => n.studentLife * 1.5,
  },
  {
    key: "expat",
    label: "Profil international",
    emoji: "🌍",
    ageRange: [31, 45],
    professions: ["ingénieur logiciel", "chercheuse postdoc", "consultant secteur santé", "professeure de FLE", "cadre marketing global"],
    motivations: [
      "rejoindre un poste local depuis l'étranger",
      "ville suffisamment internationale et anglo-friendly",
      "accès TGV ou aéroport pour les retours famille",
    ],
    worries: ["communauté internationale modeste", "anglais peu pratiqué", "obtenir un médecin traitant"],
    weights: (n, c) => n.expat * 1.4 + c.scores.transport * 0.3,
  },
  {
    key: "couple-actif",
    label: "Couple actif DINK",
    emoji: "✨",
    ageRange: [28, 38],
    professions: ["avocate et architecte", "deux ingénieurs", "consultante et journaliste", "cadres en banque", "designers indépendants"],
    motivations: [
      "vie culturelle dense, restaurants, bars",
      "garder une vraie carrière à deux",
      "se rapprocher du sport ou des montagnes pour les week-ends",
    ],
    worries: ["nightlife trop calme", "scène culturelle limitée", "marché du travail à deux salaires"],
    weights: (n, c) => c.scores.culture * 1.2 + c.scores.life * 0.8 + c.scores.transport * 0.5,
  },
  {
    key: "primo-accedant",
    label: "Primo-accédant",
    emoji: "🔑",
    ageRange: [29, 38],
    professions: ["infirmière et technicien", "deux instits", "cadre intermédiaire", "couple d'artisans"],
    motivations: [
      "acheter sa première maison avec un budget réaliste",
      "stabiliser le couple loin des loyers chers",
      "investir avant que les prix montent",
    ],
    worries: ["chantier énergétique", "marché tendu", "trajet quotidien rallongé"],
    weights: (n, c) => (10 - Math.min(c.scores.cost, 9)) * 1.0 + c.scores.life * 0.6 + c.scores.safety * 0.4,
  },
  {
    key: "creatif",
    label: "Créatif·ve en reconversion",
    emoji: "🎨",
    ageRange: [30, 44],
    professions: ["photographe", "céramiste", "scénariste", "musicienne intermittente", "illustratrice indépendante"],
    motivations: [
      "atelier abordable et vraie scène artistique",
      "communauté créative, pas un désert culturel",
      "calme pour bosser, ville pour se nourrir",
    ],
    worries: ["scène trop confidentielle", "loyer atelier", "réseau pro à reconstruire"],
    weights: (n, c) => c.scores.culture * 1.3 + (10 - Math.min(c.scores.cost, 9)) * 0.5 + c.scores.life * 0.3,
  },
];

// Deterministic first-name pools — drawn by hash so same city = same portraits.
const FIRST_NAMES = [
  "Camille", "Léa", "Inès", "Manon", "Chloé", "Sarah", "Yasmine", "Margaux",
  "Antoine", "Hugo", "Nathan", "Maxime", "Théo", "Lucas", "Mehdi", "Tom",
  "Sophie", "Julie", "Élise", "Anaïs", "Clara", "Romane", "Émilie", "Pauline",
  "Pierre", "Romain", "Vincent", "Julien", "Thomas", "Adrien", "Quentin", "Florian",
  "Aïcha", "Fatou", "Nina", "Mathilde", "Estelle", "Sandrine", "Catherine", "Isabelle",
  "Karim", "Samir", "David", "Olivier", "François", "Bruno", "Philippe", "Jean-Marc",
];

const LAST_INITIALS = ["L.", "M.", "D.", "R.", "B.", "G.", "T.", "C.", "F.", "P.", "V.", "S."];

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

export interface Portrait {
  archetype: ArchetypeKey;
  label: string;
  emoji: string;
  name: string;
  age: number;
  profession: string;
  motivation: string;
  worry: string;
  fitScore: number; // 0-10
}

export function cityPortraits(city: CitySeed, count = 3): Portrait[] {
  const niche = computeNicheScores(city);
  const ranked = ARCHETYPES.map((a) => ({ a, score: a.weights(niche, city) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, count);

  const seed = hashSlug(city.slug);

  return ranked.map(({ a, score }, idx) => {
    const localSeed = seed + idx * 7919;
    const name = `${pick(FIRST_NAMES, localSeed)} ${pick(LAST_INITIALS, localSeed >> 3)}`;
    const ageSpan = a.ageRange[1] - a.ageRange[0];
    const age = a.ageRange[0] + ((localSeed >> 5) % (ageSpan + 1));
    const profession = pick(a.professions, localSeed >> 7);
    const motivation = pick(a.motivations, localSeed >> 9);
    const worry = pick(a.worries, localSeed >> 11);
    // Normalise the rough archetype score to a 0-10 fit
    const fitScore = Math.max(2, Math.min(9.5, score / (a.key === "primo-accedant" ? 2.0 : 1.5)));
    return {
      archetype: a.key,
      label: a.label,
      emoji: a.emoji,
      name,
      age,
      profession,
      motivation,
      worry,
      fitScore: Math.round(fitScore * 10) / 10,
    };
  });
}
