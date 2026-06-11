// R8.1 — City Match: swipeable quiz that ranks cities live as the user answers.
// Pure deterministic scoring; permalink encoding so a shared result re-opens
// the exact same matches. No LLM at v1 — just transparent weighted blend.

import type { CityLight } from "@/lib/cities-light";

export type CityMatchAnswer =
  | { id: "budget"; value: "low" | "mid" | "high" }
  | { id: "climate"; value: "warm" | "mild" | "cold" }
  | { id: "size"; value: "metro" | "mid" | "small" }
  | { id: "vibe"; value: "nature" | "culture" | "balanced" }
  | { id: "stage"; value: "solo" | "couple" | "family" | "retire" }
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
}

const TERRAIN_TAGS = {
  // océan/caraïbes/lagon cover the DROM coastal tags (océan Indien, Caraïbes…)
  sea: ["port", "mer", "littoral", "côte", "balnéaire", "atlantique", "méditerranée", "manche", "océan", "caraïbes", "lagon"],
  mountain: ["montagne", "alpin", "pyrénées", "ski", "altitude", "cirque"],
};

function hasTag(city: CityLight, words: string[]): boolean {
  const tags = city.characterTags.map((t) => t.toLowerCase());
  return tags.some((t) => words.some((w) => t.includes(w)));
}

export function isCoastal(city: CityLight): boolean {
  return hasTag(city, TERRAIN_TAGS.sea) || (city.elevation ?? 999) <= 15;
}

function isMountain(city: CityLight): boolean {
  return hasTag(city, TERRAIN_TAGS.mountain) || (city.elevation ?? 0) >= 500;
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
  const scored = cities
    .map((c) => {
      const s = c.scores;
      let score = s.global;
      const reasons: string[] = [];

      // Budget
      if (budget === "low") {
        score += (s.cost - 5) * 0.6;
        if (s.cost >= 7.5) reasons.push(`coût de la vie ${s.cost.toFixed(1)}/10`);
      } else if (budget === "high") {
        score += (s.life - 5) * 0.5;
        if (s.life >= 8) reasons.push(`qualité de vie ${s.life.toFixed(1)}/10`);
      }

      // Vibe
      if (vibe === "nature") {
        score += (s.nature - 5) * 0.6;
        if (s.nature >= 8) reasons.push(`nature ${s.nature.toFixed(1)}/10`);
      } else if (vibe === "culture") {
        score += (s.culture - 5) * 0.6;
        if (s.culture >= 8) reasons.push(`culture ${s.culture.toFixed(1)}/10`);
      } else if (vibe === "balanced") {
        const balance = 10 - Math.abs(s.nature - s.culture);
        score += (balance - 5) * 0.3;
      }

      // Size
      const pop = c.population ?? 0;
      if (size === "metro" && pop >= 200_000) { score += 1.0; reasons.push("grande métropole"); }
      else if (size === "mid" && pop >= 30_000 && pop < 200_000) { score += 1.0; reasons.push("ville à taille humaine"); }
      else if (size === "small" && pop < 30_000) { score += 1.0; reasons.push("village ou bourg"); }
      else { score -= 0.4; }

      // Climate. Hot season = max of the two readings: southern-hemisphere
      // DROM (La Réunion) peaks in January, so a July-only check would
      // undermatch the tropics on "warm" and mislabel them "mild".
      const july = c.avgTempJuly ?? 22;
      const jan = c.avgTempJanuary ?? 4;
      const sun = c.sunshinedays ?? 1800;
      const hot = Math.max(july, jan);
      if (climate === "warm") {
        if (hot >= 24 && sun >= 2000) { score += 1.0; reasons.push(`été ${hot}°C, ${Math.round(sun / 9.5)}j de soleil`); }
        else if (hot < 20) score -= 0.8;
      } else if (climate === "cold") {
        if (Math.min(july, jan) <= 3) { score += 0.8; reasons.push(`hiver ${Math.min(july, jan)}°C`); }
        else if (Math.min(july, jan) >= 8) score -= 0.6;
      } else if (climate === "mild") {
        if (hot >= 20 && hot <= 23) { score += 0.6; reasons.push("climat équilibré"); }
      }

      // Stage
      if (stage === "family") {
        score += (s.schools - 5) * 0.35 + (s.safety - 5) * 0.25;
        if (s.schools >= 8 && s.safety >= 7.5) reasons.push(`familles : écoles ${s.schools.toFixed(1)} + sécurité ${s.safety.toFixed(1)}`);
      } else if (stage === "retire") {
        score += (s.life - 5) * 0.3 + (s.safety - 5) * 0.3 - (pop > 300_000 ? 0.6 : 0);
        if (s.life >= 8) reasons.push("retraite tranquille");
      } else if (stage === "solo") {
        score += (s.culture - 5) * 0.2 + (s.cost - 5) * 0.3;
      } else if (stage === "couple") {
        score += (s.life - 5) * 0.2 + (s.culture - 5) * 0.15;
      }

      // Work
      if (work === "remote") {
        score += (s.remoteWork - 5) * 0.4;
        if (s.remoteWork >= 8) reasons.push(`télétravail ${s.remoteWork.toFixed(1)}/10`);
      } else if (work === "office") {
        score += (s.transport - 5) * 0.3;
        if (s.transport >= 7.5) reasons.push(`transport ${s.transport.toFixed(1)}/10`);
      }

      // Safety
      if (safety === "essential") {
        score += (s.safety - 5) * 0.5;
        if (s.safety >= 8) reasons.push(`très sûr (${s.safety.toFixed(1)}/10)`);
      } else if (safety === "important") {
        score += (s.safety - 5) * 0.25;
      }

      // Terrain
      if (terrain === "sea") {
        if (isCoastal(c)) { score += 1.2; reasons.push("bord de mer"); }
        else score -= 1.5;
      } else if (terrain === "mountain") {
        if (isMountain(c)) { score += 1.2; reasons.push(`montagne (${c.elevation ?? 0} m)`); }
        else score -= 1.2;
      } else if (terrain === "plain") {
        if (!isCoastal(c) && !isMountain(c)) { score += 0.6; reasons.push("plaine"); }
      }

      return {
        city: c,
        raw: score,
        topReasons: reasons.slice(0, 3),
      };
    });

  // Calibrated compatibility: the raw score is global (≤8.6) plus stacked
  // preference bonuses, so it routinely exceeds 10 — the old `(score/10)*100`
  // clamped every strong city to a fake 100%. Normalize relative to the best
  // match this run, with a realistic ceiling (~94%, never a perfect 100) and
  // honest spread downward. No city is a perfect match.
  const maxRaw = Math.max(...scored.map((r) => r.raw));
  return scored
    .map((r) => ({
      city: r.city,
      percent: Math.max(28, Math.min(94, Math.round(94 - (maxRaw - r.raw) * 5.5))),
      topReasons: r.topReasons,
    }))
    .sort((a, b) => b.percent - a.percent);
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

export function encodeAnswers(answers: CityMatchAnswer[]): string {
  const slots: string[] = new Array(CITY_MATCH_QUESTIONS.length).fill("_");
  for (const a of answers) {
    const i = ID_TO_INDEX[a.id];
    if (i == null) continue;
    slots[i] = a.value;
  }
  return slots.join("-");
}

export function decodeAnswers(code: string): CityMatchAnswer[] {
  const parts = code.split("-");
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
