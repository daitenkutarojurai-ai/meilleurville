// V1 — Moteur de scoring vacances.
//
// vacationFit(city, opts) : note 0-10 d'adéquation entre une ville et un
//                            ensemble de critères (mois, activité, profil).
// bestMonthsFor(city)     : top 3 mois pour visiter cette ville.
// topCitiesForMonth(opts) : classement national pour un mois donné.

import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import {
  monthSignal,
  type MonthIndex,
  type MonthSignal,
} from "@/lib/vacation-seasons";
import {
  ACTIVITY_DEFS,
  activityFitness,
  seasonFit,
  type ActivitySlug,
} from "@/lib/vacation-activities";

export type VacationProfile = "famille" | "couple" | "solo" | "amis" | "seniors";

export const VACATION_PROFILES: VacationProfile[] = ["famille", "couple", "solo", "amis", "seniors"];

export const VACATION_PROFILE_DEFS: Record<VacationProfile, {
  label: string;
  emoji: string;
  intro: string;
  metaDesc: string;
}> = {
  famille: {
    label: "Famille",
    emoji: "👨‍👩‍👧",
    intro: "Sécurité du quotidien, occupation des enfants, restos qui tiennent la route. Les destinations classées ici cumulent les trois, sans top-10 d'agence.",
    metaDesc: "Vacances en famille en France 2026 : top destinations sécurisées, faciles avec enfants, budget maîtrisable. Plage, parcs, animations.",
  },
  couple: {
    label: "Couple",
    emoji: "💑",
    intro: "Restaurants, scène culturelle, balades à deux. Les villes qui se prêtent au long week-end romantique sans tomber dans le cliché.",
    metaDesc: "Vacances en couple en France 2026 : destinations romantiques, gastro, cadre culturel. Loin des pièges à touristes.",
  },
  solo: {
    label: "Solo",
    emoji: "🎒",
    intro: "Sécurité (femme seule incluse), bonne offre de transports, vie culturelle pour ne pas s'ennuyer. Les villes où voyager seul·e est vraiment confortable.",
    metaDesc: "Voyager seul·e en France 2026 : destinations adaptées, sécurisées, scène culturelle dense, accessibles en train.",
  },
  amis: {
    label: "Entre amis",
    emoji: "🍻",
    intro: "Bars, restos, scène nocturne, budget partagé. Les destinations qui supportent une bande de 4-8 sans tuer le portefeuille.",
    metaDesc: "Vacances entre amis en France 2026 : destinations avec scène festive, restos, budget maîtrisable. Côte, montagne, citytrip.",
  },
  seniors: {
    label: "Seniors",
    emoji: "🌿",
    intro: "Climat doux, accessibilité, calme, soins de santé à proximité. Pas de marketing « senior » — juste les villes où l'on reste serein au quotidien.",
    metaDesc: "Vacances seniors en France 2026 : destinations calmes, climat doux, accessibilité, infrastructures santé.",
  },
};

export interface VacationFitOptions {
  month?: MonthIndex;
  activity?: ActivitySlug;
  profile?: VacationProfile;
  /** Budget par jour par personne, en € (optionnel) */
  budgetEurPerDay?: number;
}

export interface VacationFit {
  score: number; // 0-10
  seasonScore: number;
  activityScore: number;
  profileScore: number;
  budgetTier: 1 | 2 | 3 | 4;
  /** Phrase d'accroche éditoriale ≤ 110 char */
  whyOneLine: string;
  /** Mois sur lesquels l'activité (ou la ville en général) est la mieux placée */
  bestMonths: MonthIndex[];
}

// ─── Notation profil ──────────────────────────────────────────────────────

function profileFit(city: CitySeed, profile: VacationProfile): number {
  const s = city.scores;
  switch (profile) {
    case "famille":
      return Math.round((s.safety * 0.4 + s.life * 0.25 + s.nature * 0.2 + s.schools * 0.15) * 10) / 10;
    case "couple":
      return Math.round((s.culture * 0.35 + s.life * 0.3 + s.nature * 0.2 + s.safety * 0.15) * 10) / 10;
    case "solo":
      return Math.round((s.safety * 0.35 + s.culture * 0.3 + s.transport * 0.25 + s.life * 0.1) * 10) / 10;
    case "amis":
      return Math.round((s.culture * 0.35 + s.life * 0.3 + s.transport * 0.2 + s.cost * 0.15) * 10) / 10;
    case "seniors":
      return Math.round((s.safety * 0.35 + s.life * 0.3 + s.nature * 0.2 + s.cost * 0.15) * 10) / 10;
  }
}

// ─── Budget tier ──────────────────────────────────────────────────────────

function budgetTier(city: CitySeed): 1 | 2 | 3 | 4 {
  // Plus le score cost est élevé, plus c'est abordable.
  const c = city.scores.cost;
  if (c >= 8) return 1; // €
  if (c >= 6.5) return 2; // €€
  if (c >= 5) return 3; // €€€
  return 4; // €€€€
}

// ─── Why one-liner ────────────────────────────────────────────────────────

function buildWhyLine(
  city: CitySeed,
  opts: VacationFitOptions,
  signal: MonthSignal | null,
  activityScore: number,
): string {
  const bits: string[] = [];
  if (signal) {
    if (signal.tempAvg >= 22) bits.push(`${signal.tempAvg} °C en moyenne`);
    else if (signal.tempAvg >= 16) bits.push(`temps doux (${signal.tempAvg} °C)`);
    else if (signal.tempAvg <= 5) bits.push(`hiver franc (${signal.tempAvg} °C)`);
    if (signal.rainDays <= 6) bits.push(`peu de pluie`);
    if (signal.crowded <= 2) bits.push(`pas la foule`);
    else if (signal.crowded >= 4) bits.push(`très fréquenté`);
  }
  if (opts.activity && activityScore >= 7.5) {
    bits.push(`référence ${ACTIVITY_DEFS[opts.activity].label.toLowerCase()}`);
  }
  if (bits.length === 0) {
    return `${city.name} reste un choix correct mais sans signal saisonnier marqué.`;
  }
  return `${city.name} : ${bits.slice(0, 3).join(", ")}.`;
}

// ─── Main fit ─────────────────────────────────────────────────────────────

export function vacationFit(city: CitySeed, opts: VacationFitOptions = {}): VacationFit {
  const signal = opts.month ? monthSignal(city, opts.month) : null;

  // Activity
  const actFit = opts.activity ? activityFitness(city, opts.activity) : null;
  const seasonForActivity = opts.activity && signal ? seasonFit(opts.activity, signal) : null;
  const activityScore = actFit ?? 0;
  const seasonScore =
    seasonForActivity !== null
      ? seasonForActivity
      : signal
        ? Math.max(0, 10 - Math.abs(signal.tempAvg - 18) * 0.5 - signal.rainDays * 0.15)
        : 5;

  // Profile
  const profileScore = opts.profile ? profileFit(city, opts.profile) : city.scores.global;

  // Composite
  let composite: number;
  if (opts.activity && opts.month) {
    composite =
      activityScore * 0.45 +
      seasonScore * 0.25 +
      profileScore * 0.15 +
      city.scores.global * 0.15;
  } else if (opts.activity) {
    composite = activityScore * 0.55 + profileScore * 0.2 + city.scores.global * 0.25;
  } else if (opts.month) {
    composite = seasonScore * 0.45 + profileScore * 0.25 + city.scores.global * 0.3;
  } else if (opts.profile) {
    composite = profileScore * 0.55 + city.scores.global * 0.45;
  } else {
    composite = city.scores.global;
  }

  return {
    score: Math.round(composite * 10) / 10,
    seasonScore: Math.round(seasonScore * 10) / 10,
    activityScore: Math.round(activityScore * 10) / 10,
    profileScore: Math.round(profileScore * 10) / 10,
    budgetTier: budgetTier(city),
    bestMonths: bestMonthsFor(city, opts.activity),
    whyOneLine: buildWhyLine(city, opts, signal, activityScore),
  };
}

// ─── Best months for a city ──────────────────────────────────────────────

export function bestMonthsFor(city: CitySeed, activity?: ActivitySlug): MonthIndex[] {
  const months: MonthIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const scored = months.map((m) => {
    const sig = monthSignal(city, m);
    let s = 5;
    if (activity) {
      s = seasonFit(activity, sig);
    } else {
      // Best months "generiques" : ni trop chaud ni trop froid, peu de pluie,
      // peu de foule.
      s = 10 - Math.abs(sig.tempAvg - 19) * 0.4 - sig.rainDays * 0.2;
      if (sig.crowded >= 4) s -= 1;
      else if (sig.crowded === 1) s += 0.5;
    }
    return { month: m, score: s };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((x) => x.month);
}

// ─── Top cities for a given month (rankings page driver) ─────────────────

export interface RankedVacationCity {
  city: CitySeed;
  fit: VacationFit;
}

interface RankCacheKey {
  month?: MonthIndex;
  activity?: ActivitySlug;
  profile?: VacationProfile;
}

const rankCache = new Map<string, RankedVacationCity[]>();

function cacheKey(opts: RankCacheKey): string {
  return `${opts.month ?? "_"}|${opts.activity ?? "_"}|${opts.profile ?? "_"}`;
}

export function topCitiesForMonth(
  month: MonthIndex,
  opts: { activity?: ActivitySlug; profile?: VacationProfile; limit?: number; minPop?: number } = {},
): RankedVacationCity[] {
  const limit = opts.limit ?? 30;
  const minPop = opts.minPop ?? 5_000;
  const key = cacheKey({ month, activity: opts.activity, profile: opts.profile });
  let ranked = rankCache.get(key);
  if (!ranked) {
    ranked = CITIES_SEED
      .filter((c) => (c.population ?? 0) >= minPop)
      .map((c) => ({
        city: c,
        fit: vacationFit(c, { month, activity: opts.activity, profile: opts.profile }),
      }))
      .sort((a, b) => b.fit.score - a.fit.score);
    rankCache.set(key, ranked);
  }
  return ranked.slice(0, limit);
}

export function topCitiesForProfile(
  profile: VacationProfile,
  opts: { limit?: number; minPop?: number } = {},
): RankedVacationCity[] {
  const limit = opts.limit ?? 30;
  const minPop = opts.minPop ?? 8_000;
  const key = cacheKey({ profile });
  let ranked = rankCache.get(key);
  if (!ranked) {
    ranked = CITIES_SEED
      .filter((c) => (c.population ?? 0) >= minPop)
      .map((c) => ({
        city: c,
        fit: vacationFit(c, { profile }),
      }))
      .sort((a, b) => b.fit.score - a.fit.score);
    rankCache.set(key, ranked);
  }
  return ranked.slice(0, limit);
}

export function topCitiesForActivity(
  activity: ActivitySlug,
  opts: { profile?: VacationProfile; limit?: number; minPop?: number } = {},
): RankedVacationCity[] {
  const limit = opts.limit ?? 30;
  const minPop = opts.minPop ?? 3_000;
  const key = cacheKey({ activity, profile: opts.profile });
  let ranked = rankCache.get(key);
  if (!ranked) {
    ranked = CITIES_SEED
      .filter((c) => (c.population ?? 0) >= minPop)
      .map((c) => ({
        city: c,
        fit: vacationFit(c, { activity, profile: opts.profile }),
      }))
      .filter((r) => r.fit.activityScore >= 4) // élimine les destinations non pertinentes
      .sort((a, b) => b.fit.score - a.fit.score);
    rankCache.set(key, ranked);
  }
  return ranked.slice(0, limit);
}

// ─── Helpers UI ───────────────────────────────────────────────────────────

export const BUDGET_TIER_LABEL: Record<1 | 2 | 3 | 4, string> = {
  1: "€",
  2: "€€",
  3: "€€€",
  4: "€€€€",
};

export const BUDGET_TIER_DESC: Record<1 | 2 | 3 | 4, string> = {
  1: "très abordable (< 70 €/j)",
  2: "raisonnable (70-110 €/j)",
  3: "haut de gamme (110-180 €/j)",
  4: "luxe / saison forte (180 €+ /j)",
};
