// R8.1 — City Match: swipeable quiz that ranks cities live as the user answers.
// Pure deterministic scoring; permalink encoding so a shared result re-opens
// the exact same matches. No LLM at v1 — just transparent weighted blend.
//
// **Convention** : ce module ne publie **pas** une note sur 10 mais un
// `percent` sur **0-100, où 100 = la meilleure correspondance** avec les
// réponses données. Deux corollaires, tous deux vérifiés par exécution le
// 2026-09-04 (bornes constatées 25 à 94 sur un jeu de réponses médian, tri
// décroissant sur les 540 villes) :
//  ① ce nombre **ne se compare pas** au score de qualité de vie d'une ville et
//     ne doit jamais être passé à `scoreColor`/`scoreHex`, calibrés sur 0-10 :
//     94 y tomberait hors barème. C'est un pourcentage d'adéquation à un
//     questionnaire, pas un jugement sur la ville — deux jeux de réponses
//     différents donnent deux classements différents des mêmes 540 villes ;
//  ② il n'est pas comparable d'une session à l'autre : le maximum atteignable
//     dépend des réponses, pas du corpus.
//
// Les axes lus restent orientés comme partout ailleurs (`10 = bon`, `cost`
// compris — 10 = abordable), et le littoral se lit dans `lib/city-coast.ts`,
// jamais dans les tags (cf. CLAUDE.md § Refonte du barème 2026-08-17).

import type { CityLight } from "@/lib/cities-light";
import { coastDistanceKm, COASTAL_KM } from "@/lib/city-coast";

export type CityMatchAnswer =
  | { id: "budget"; value: "low" | "mid" | "high" }
  | { id: "climate"; value: "warm" | "mild" | "cold" }
  | { id: "size"; value: "metro" | "mid" | "small" }
  | { id: "vibe"; value: "nature" | "culture" | "balanced" }
  | { id: "stage"; value: "solo" | "couple" | "family" | "single-parent" | "retire" }
  | { id: "work"; value: "remote" | "office" | "mixed" }
  | { id: "safety"; value: "essential" | "important" | "secondary" }
  | { id: "terrain"; value: "sea" | "mountain" | "plain" | "any" };

export const CITY_MATCH_QUESTIONS: Array<{
  id: CityMatchAnswer["id"];
  question: string;
  emoji: string;
  options: Array<{ value: string; label: string; emoji: string }>;
}> = [
  {
    id: "stage",
    question: "À quelle étape de la vie êtes-vous ?",
    emoji: "🌱",
    options: [
      { value: "solo",   label: "Solo, jeune actif",     emoji: "🎒" },
      { value: "couple", label: "Couple sans enfant",     emoji: "💑" },
      { value: "family", label: "Famille avec enfants",   emoji: "👨‍👩‍👧" },
      { value: "single-parent", label: "Parent solo",     emoji: "🧑‍🍼" },
      { value: "retire", label: "Retraité·e ou bientôt", emoji: "🌅" },
    ],
  },
  {
    id: "budget",
    question: "Quel niveau de budget ?",
    emoji: "💰",
    options: [
      { value: "low",  label: "Serré — chaque euro compte",     emoji: "🪙" },
      { value: "mid",  label: "Confortable — sans excès",        emoji: "💶" },
      { value: "high", label: "Aisé — qualité avant prix",       emoji: "💎" },
    ],
  },
  {
    id: "vibe",
    question: "Vous cherchez plutôt…",
    emoji: "✨",
    options: [
      { value: "nature",   label: "Nature, calme, plein air",      emoji: "🌳" },
      { value: "culture",  label: "Vie culturelle, sortir, scène", emoji: "🎭" },
      { value: "balanced", label: "Un équilibre des deux",          emoji: "⚖️" },
    ],
  },
  {
    id: "size",
    question: "Quelle taille de ville ?",
    emoji: "🏙️",
    options: [
      { value: "metro", label: "Grande métropole (200k+)",  emoji: "🏙️" },
      { value: "mid",   label: "Ville moyenne (30k-200k)",   emoji: "🏘️" },
      { value: "small", label: "Petite ville (< 30k)",       emoji: "🌾" },
    ],
  },
  {
    id: "climate",
    question: "Climat idéal ?",
    emoji: "☀️",
    options: [
      { value: "warm", label: "Chaud, ensoleillé",    emoji: "☀️" },
      { value: "mild", label: "Tempéré, océanique",    emoji: "🌤️" },
      { value: "cold", label: "Frais, continental",    emoji: "❄️" },
    ],
  },
  {
    id: "work",
    question: "Votre mode de travail ?",
    emoji: "💻",
    options: [
      { value: "remote", label: "Télétravail 100 %", emoji: "🏠" },
      { value: "mixed",  label: "Hybride",            emoji: "🔀" },
      { value: "office", label: "Bureau / terrain",   emoji: "🏢" },
    ],
  },
  {
    id: "safety",
    question: "Importance de la sécurité ?",
    emoji: "🛡️",
    options: [
      { value: "essential", label: "Essentielle, non négociable", emoji: "🛡️" },
      { value: "important", label: "Importante",                    emoji: "👌" },
      { value: "secondary", label: "Secondaire, je gère",           emoji: "🤷" },
    ],
  },
  {
    id: "terrain",
    question: "Quel cadre géographique ?",
    emoji: "🗺️",
    options: [
      { value: "sea",      label: "Mer / littoral",     emoji: "🌊" },
      { value: "mountain", label: "Montagne",            emoji: "⛰️" },
      { value: "plain",    label: "Plaine / intérieur",  emoji: "🌾" },
      { value: "any",      label: "Indifférent",          emoji: "🧭" },
    ],
  },
];

export interface CityMatchResult {
  city: CityLight;
  percent: number; // 0-100 compatibility
  topReasons: string[]; // 1-3 strong reasons
  /** Le critère le plus contredit, quand il l'est franchement. Une ville peut
   *  très bien sortir en tête en ratant une réponse — « métropole » n'a aucune
   *  candidate en montagne — et taire ce qu'elle rate est ce qui fait passer un
   *  arbitrage pour un bug. */
  caveat?: string;
}

// --- Barème --------------------------------------------------------------
//
// Chaque critère répond par un *fit* dans [−1, 1] — accord parfait à +1,
// contresens à −1 — que le poids convertit en points. Deux raisons de tout
// exprimer ainsi plutôt qu'en primes ad hoc :
//
// ① Les poids deviennent lisibles et comparables. Avant, « taille de ville »
//    valait 1,4 point d'écart et le relief 2,4 : la réponse la plus catégorique
//    du questionnaire était le signal le plus faible, et « grande métropole »
//    sortait Céret, 7 800 habitants (retour lecteur du 2026-08-17).
// ② Les seuils en escalier mentaient sur les cas limites. « Chaud » ne donnait
//    sa prime qu'à partir de 24 °C et 2 000 h de soleil : Bordeaux (23 °C,
//    2 065 h) tombait dans le même sac que Lille. Un barème continu place
//    chaque ville où elle est vraiment.
//
// Le score global de la ville reste dans l'équation — à qualité de réponse
// égale, la mieux notée gagne — mais comme une ancre pondérée, pas comme la
// base à laquelle on ajoute des broutilles.
const W = {
  quality: 1.8,
  size: 3.2,
  terrain: 3.0,
  climate: 2.4,
  vibe: 2.2,
  budget: 2.2,
  stage: 2.0,
  work: 1.8,
  safetyEssential: 2.6,
  safetyImportant: 1.2,
} as const;

const clamp = (v: number, lo = -1, hi = 1) => Math.max(lo, Math.min(hi, v));

/** Un axe 0-10 ramené autour de zéro : 5,5 = médiane du corpus, 8 = +1.
 *  Volontairement non borné — un plafond à 1 mettait Obernai (sécurité 8,6) et
 *  Fontainebleau (8,1) à égalité parfaite, et l'ordre entre elles devenait le
 *  hasard de l'ordre du seed. */
const axisFit = (v: number) => (v - 5.5) / 2.5;

/** Moyenne pondérée d'axes, ramenée sur la même échelle. */
function mixFit(parts: Array<[number, number]>): number {
  const total = parts.reduce((s, [w]) => s + w, 0);
  return axisFit(parts.reduce((s, [w, v]) => s + w * v, 0) / total);
}

// Tags de relief. Le test historique comparait par **sous-chaîne**, si bien que
// « sport » contenait « port » : Grenoble, Clermont-Ferrand, Saint-Étienne et
// Tarbes étaient des villes de bord de mer, « côte-d'or » et « porte des alpes »
// aussi. On compare désormais des mots entiers.
const MOUNTAIN_WORDS = /(^|[\s-])(montagnes?|alpin|alpine|alpes|pyr[ée]n[ée]es|ski|altitude|cirque|vosgienne)([\s-]|$)/;
const NEARBY_WORDS = /(proche|porte)/;

function tagMountainFit(city: CityLight): number {
  let best = 0;
  for (const raw of city.characterTags) {
    const t = raw.toLowerCase();
    if (!MOUNTAIN_WORDS.test(t)) continue;
    // « pyrénées-proche », « porte des alpes » : le massif est visible, la ville
    // n'y est pas.
    best = Math.max(best, NEARBY_WORDS.test(t) ? 0.4 : 0.85);
  }
  return best;
}

/** Relief : l'altitude porte la mesure, les tags rattrapent les villes basses
 *  cernées de sommets (Grenoble, 214 m, au pied de trois massifs). */
function mountainFit(city: CityLight): number {
  return Math.max(clamp(((city.elevation ?? 0) - 250) / 500), tagMountainFit(city));
}

/** Littoral : distance réelle à la mer ouverte (`lib/city-coast.ts`).
 *  1 jusqu'à 5 km, 0 vers 25 km, −1 au-delà de 70 km. */
function seaFit(city: CityLight): number {
  const km = coastDistanceKm(city.slug);
  if (km == null) return -1;
  if (km <= COASTAL_KM) return 1;
  if (km <= 25) return 1 - (km - COASTAL_KM) / 20;
  return clamp(-(km - 25) / 45);
}

export function isCoastal(city: { slug: string }): boolean {
  const km = coastDistanceKm(city.slug);
  return km != null && km <= COASTAL_KM;
}

const SIZE_REASON: Record<string, string> = {
  metro: "grande métropole",
  mid: "ville à taille humaine",
  small: "village ou bourg",
};

/** Taille : écart en décades sous la borne franchie, saturé à une décade.
 *  Une ville de 180 000 habitants rate « métropole » de peu, un bourg de 2 000
 *  la rate complètement — l'ancien test binaire les mettait à égalité. */
function sizeFit(size: string, pop: number): number {
  const p = Math.max(pop, 500);
  const miss = (ratio: number) => Math.max(-1, Math.log10(ratio));
  if (size === "metro") return p >= 200_000 ? 1 : miss(p / 200_000);
  if (size === "small") return p < 30_000 ? 1 : miss(30_000 / p);
  if (p < 30_000) return miss(p / 30_000);
  if (p >= 200_000) return miss(200_000 / p);
  return 1;
}

function getAnswer(answers: CityMatchAnswer[], id: CityMatchAnswer["id"]): string | undefined {
  return answers.find((x) => x.id === id)?.value;
}

export function computeMatches(answers: CityMatchAnswer[], cities: CityLight[]): CityMatchResult[] {
  const budget = getAnswer(answers, "budget");
  const climate = getAnswer(answers, "climate");
  const size = getAnswer(answers, "size");
  const vibe = getAnswer(answers, "vibe");
  const stage = getAnswer(answers, "stage");
  const work = getAnswer(answers, "work");
  const safety = getAnswer(answers, "safety");
  const terrain = getAnswer(answers, "terrain");

  // All 540 cities are eligible, DROM included — they legitimately win
  // warm/sea profiles. The result card shows the region, so an overseas
  // match is always explicit.
  const scored = cities.map((c) => {
    const s = c.scores;
    const pop = c.population ?? 0;
    // Saison chaude = le plus haut des deux relevés : La Réunion culmine en
    // janvier, un test sur juillet seul rangerait les tropiques en « tempéré ».
    const july = c.avgTempJuly ?? 22;
    const jan = c.avgTempJanuary ?? 4;
    const sun = c.sunshinedays ?? 1800;
    const hot = Math.max(july, jan);
    const cool = Math.min(july, jan);

    let score = 0;
    // Une raison n'est affichée que si le critère est vraiment satisfait, un
    // « mais » que s'il est vraiment raté : le classement et l'explication
    // viennent du même nombre.
    const reasons: Array<{ fit: number; label: string }> = [];
    const misses: Array<{ cost: number; label: string }> = [];
    const add = (weight: number, fit: number, label?: string, miss?: string) => {
      score += weight * fit;
      if (label && fit >= 0.6) reasons.push({ fit, label });
      if (miss && fit <= -0.5) misses.push({ cost: weight * fit, label: miss });
    };

    // Qualité intrinsèque — l'ancre, pas la base.
    add(W.quality, axisFit(s.global));

    const costLabel = `coût de la vie ${s.cost.toFixed(1)}/10`;
    const lifeLabel = `qualité de vie ${s.life.toFixed(1)}/10`;
    if (budget === "low") add(W.budget, axisFit(s.cost), costLabel, costLabel);
    else if (budget === "high") add(W.budget, axisFit(s.life), lifeLabel, lifeLabel);
    else if (budget === "mid") add(W.budget * 0.6, mixFit([[1, s.cost], [1, s.life]]));

    const natureLabel = `nature ${s.nature.toFixed(1)}/10`;
    const cultureLabel = `culture ${s.culture.toFixed(1)}/10`;
    if (vibe === "nature") add(W.vibe, axisFit(s.nature), natureLabel, natureLabel);
    else if (vibe === "culture") add(W.vibe, axisFit(s.culture), cultureLabel, cultureLabel);
    else if (vibe === "balanced") {
      // Équilibre = les deux axes hauts *et* proches. L'ancien test ne
      // regardait que l'écart, donc 2/10 et 2/10 valait un sans-faute.
      const level = mixFit([[1, s.nature], [1, s.culture]]);
      const even = clamp(1 - Math.abs(s.nature - s.culture) / 2.5);
      add(W.vibe * 0.9, 0.5 * level + 0.5 * even, "nature et culture à parité",
        `nature ${s.nature.toFixed(1)} contre culture ${s.culture.toFixed(1)}`);
    }

    if (size) add(W.size, sizeFit(size, pop), SIZE_REASON[size], `${pop.toLocaleString("fr-FR")} habitants`);

    if (climate === "warm") {
      const heat = (hot - 23.5) / 3;
      const light = (sun - 2000) / 700;
      const summerLabel = `été ${hot}°C, ${Math.round(sun / 9.5)}j de soleil`;
      add(W.climate, 0.6 * heat + 0.4 * light, summerLabel, summerLabel);
    } else if (climate === "cold") {
      add(W.climate * 0.9, (5 - cool) / 4, `hiver ${cool}°C`, `hiver ${cool}°C`);
    } else if (climate === "mild") {
      // Océanique : été sans excès et faible amplitude annuelle. Brest (18,8 /
      // 6,5) est le mètre-étalon, Strasbourg (21 / 2,6) le contre-exemple.
      const summer = 1 - Math.abs(july - 21) / 3;
      const range = 1 - Math.abs(july - jan - 14) / 6;
      add(W.climate * 0.9, 0.5 * summer + 0.5 * range, "climat équilibré",
        `amplitude ${Math.round(july - jan)}°C`);
    }

    if (stage === "family") {
      add(W.stage, mixFit([[0.5, s.schools], [0.35, s.safety], [0.15, s.cost]]),
        `familles : écoles ${s.schools.toFixed(1)} + sécurité ${s.safety.toFixed(1)}`);
    } else if (stage === "single-parent") {
      // Un seul revenu et un seul conducteur : le coût et les transports
      // pèsent autant que les écoles, contrairement au profil famille.
      add(W.stage, mixFit([[0.3, s.schools], [0.2, s.safety], [0.3, s.cost], [0.2, s.transport]]),
        `parent solo : coût ${s.cost.toFixed(1)} + écoles ${s.schools.toFixed(1)}`);
      if (s.transport >= 7.5) reasons.push({ fit: axisFit(s.transport), label: `transports ${s.transport.toFixed(1)}/10 — gérable sans voiture` });
    } else if (stage === "retire") {
      const fit = mixFit([[0.35, s.life], [0.3, s.safety], [0.2, s.nature], [0.15, s.cost]]);
      add(W.stage, clamp(fit - (pop > 300_000 ? 0.3 : 0)), "retraite tranquille");
    } else if (stage === "solo") {
      add(W.stage, mixFit([[0.45, s.culture], [0.3, s.cost], [0.25, s.transport]]),
        `jeune actif : culture ${s.culture.toFixed(1)} + coût ${s.cost.toFixed(1)}`);
    } else if (stage === "couple") {
      add(W.stage, mixFit([[0.5, s.life], [0.3, s.culture], [0.2, s.nature]]),
        `couple : qualité de vie ${s.life.toFixed(1)}`);
    }

    const remoteLabel = `télétravail ${s.remoteWork.toFixed(1)}/10`;
    const transportLabel = `transport ${s.transport.toFixed(1)}/10`;
    if (work === "remote") add(W.work, axisFit(s.remoteWork), remoteLabel, remoteLabel);
    else if (work === "office") add(W.work, axisFit(s.transport), transportLabel, transportLabel);
    else if (work === "mixed") {
      add(W.work * 0.9, mixFit([[1, s.remoteWork], [1, s.transport]]),
        `hybride : télétravail ${s.remoteWork.toFixed(1)} + transport ${s.transport.toFixed(1)}`);
    }

    const safetyMiss = `sécurité ${s.safety.toFixed(1)}/10`;
    if (safety === "essential") add(W.safetyEssential, axisFit(s.safety), `très sûr (${s.safety.toFixed(1)}/10)`, safetyMiss);
    else if (safety === "important") add(W.safetyImportant, axisFit(s.safety), undefined, safetyMiss);

    if (terrain === "sea") {
      const km = coastDistanceKm(c.slug);
      const seaLabel = km == null ? "bord de mer" : km < 1 ? "les pieds dans l'eau" : `mer à ${Math.round(km)} km`;
      add(W.terrain, seaFit(c), seaLabel, km == null ? undefined : `mer à ${Math.round(km)} km`);
    } else if (terrain === "mountain") {
      const elevLabel = `montagne (${c.elevation ?? 0} m)`;
      add(W.terrain, mountainFit(c), elevLabel, `${c.elevation ?? 0} m d'altitude`);
    } else if (terrain === "plain") {
      // Ni l'un ni l'autre. On ne mesure pas « à quel point c'est bas » — une
      // ville de plaine à 140 m n'est pas moins plate qu'une à 20 m — mais
      // l'absence des deux reliefs, et le plus marqué des deux commande.
      const away = (fit: number) => 1 - 2 * Math.max(0, fit);
      add(W.terrain * 0.8, clamp(Math.min(away(seaFit(c)), away(mountainFit(c)))), "plaine",
        mountainFit(c) > seaFit(c) ? `${c.elevation ?? 0} m d'altitude` : `mer à ${Math.round(coastDistanceKm(c.slug) ?? 0)} km`);
    }

    return {
      city: c,
      raw: score,
      topReasons: reasons.sort((a, b) => b.fit - a.fit).slice(0, 3).map((r) => r.label),
      caveat: misses.sort((a, b) => a.cost - b.cost)[0]?.label,
    };
  });

  // Compatibilité affichée. Le score brut n'a pas d'échelle absolue — il dépend
  // du nombre de questions répondues — donc on le calibre sur la distribution
  // du tirage : le meilleur à 94 % (jamais 100, aucune ville n'est parfaite),
  // la ville médiane à 50 %, plancher à 25 %. L'ancienne pente fixe de 5,5
  // points par unité rendait des écarts illisibles dès qu'un critère de plus
  // était répondu.
  const raws = scored.map((r) => r.raw).sort((a, b) => b - a);
  const maxRaw = raws[0] ?? 0;
  const medianRaw = raws[Math.floor(raws.length / 2)] ?? maxRaw;
  const slope = clamp((94 - 50) / Math.max(0.2, maxRaw - medianRaw), 3, 22);

  // Tri sur le score brut, pas sur le pourcentage : l'arrondi crée des ex æquo
  // par dizaines et l'ordre à l'intérieur d'un palier deviendrait arbitraire.
  return scored
    .sort((a, b) => b.raw - a.raw)
    .map((r) => ({
      city: r.city,
      percent: clamp(Math.round(94 - (maxRaw - r.raw) * slope), 25, 94),
      topReasons: r.topReasons,
      caveat: r.caveat,
    }));
}

/** Top N matches + a surprise pick (a strong city outside the top 10). */
export function topMatchesWithSurprise(
  answers: CityMatchAnswer[],
  cities: CityLight[],
  n = 3,
): { top: CityMatchResult[]; surprise: CityMatchResult | null } {
  const all = computeMatches(answers, cities);
  const top = all.slice(0, n);
  const surprise = all.slice(15, 60).find((r) => r.percent >= 65) ?? null;
  return { top, surprise };
}

// --- Permalink encoding -----------------------------------------------------

const ID_TO_INDEX = CITY_MATCH_QUESTIONS.reduce<Record<string, number>>((acc, q, i) => {
  acc[q.id] = i;
  return acc;
}, {});

// Le séparateur est un point, pas un tiret : `single-parent` en contient un,
// donc le découpage positionnel décalait tout le reste des réponses dès qu'un
// parent solo partageait son match. Personne n'a pu le constater — le lien
// partagé pointait vers une route inexistante — mais il partait faux.
const SLOT_SEP = ".";

export function encodeAnswers(answers: CityMatchAnswer[]): string {
  const slots: string[] = new Array(CITY_MATCH_QUESTIONS.length).fill("_");
  for (const a of answers) {
    const i = ID_TO_INDEX[a.id];
    if (i == null) continue;
    slots[i] = a.value;
  }
  return slots.join(SLOT_SEP);
}

export function decodeAnswers(code: string): CityMatchAnswer[] {
  const parts = code.split(SLOT_SEP);
  const out: CityMatchAnswer[] = [];
  for (let i = 0; i < CITY_MATCH_QUESTIONS.length && i < parts.length; i++) {
    const value = parts[i];
    if (!value || value === "_") continue;
    const q = CITY_MATCH_QUESTIONS[i];
    if (q.options.find((o) => o.value === value)) {
      out.push({ id: q.id, value } as CityMatchAnswer);
    }
  }
  return out;
}
