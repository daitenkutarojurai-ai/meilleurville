// F13 — Données saisonnières.
//
// 4 saisons par ville, dérivées du seed (avgTempJuly, avgTempJanuary,
// sunshinedays, characterTags, region). Les températures intermédiaires
// (printemps, automne) sont estimées par interpolation depuis les deux
// extrêmes du seed.
//
// La fréquentation touristique est estimée à partir des tags ("tourisme",
// "balnéaire", "montagne", "mer", "soleil") et de la région (côtes / ski).
// Quand DGE tourisme et InsideAirbnb seront branchés, seules les fonctions
// `tourismLoadFor` et `airbnbPressureFor` changent.

import type { CitySeed } from "@/data/cities-seed";

export type Season = "printemps" | "ete" | "automne" | "hiver";

export interface SeasonStats {
  season: Season;
  label: string;
  months: string;
  avgTemp: number;
  avgTempHigh: number; // approximation max diurne
  avgTempLow: number; // approximation min nocturne
  sunshineHoursPerDay: number;
  rainyDaysPerMonth: number;
  tourismLoad: "calme" | "moyen" | "haut" | "saturation";
  tourismExplanation: string;
  signature: string; // 1-line "ce qui caractérise la saison à X"
  source: string;
}

const SEASON_META: Record<Season, { label: string; months: string; tempOffset: number; sunFactor: number; rainBaseline: number }> = {
  // tempOffset : delta vs (avgJuly + avgJan)/2.
  printemps: { label: "Printemps", months: "Mars–Mai", tempOffset: 0, sunFactor: 0.9, rainBaseline: 10 },
  ete:       { label: "Été",       months: "Juin–Août", tempOffset: 0, sunFactor: 1.35, rainBaseline: 6 },
  automne:   { label: "Automne",   months: "Sept–Nov", tempOffset: 0, sunFactor: 0.75, rainBaseline: 11 },
  hiver:     { label: "Hiver",     months: "Déc–Fév", tempOffset: 0, sunFactor: 0.55, rainBaseline: 12 },
};

function avgSunshineHoursPerDay(annualHours: number | null, factor: number): number {
  if (annualHours == null) return 5 * factor;
  const dailyMean = annualHours / 365;
  return Math.round(dailyMean * factor * 10) / 10;
}

function rainyDays(rainBaseline: number, region: string | null): number {
  if (!region) return rainBaseline;
  // West / NW more rain; SE less.
  if (["Bretagne", "Pays de la Loire", "Normandie", "Hauts-de-France"].includes(region)) {
    return rainBaseline + 3;
  }
  if (["Provence-Alpes-Côte d'Azur", "Corse", "Occitanie"].includes(region)) {
    return Math.max(3, rainBaseline - 4);
  }
  return rainBaseline;
}

function seasonalTemps(
  season: Season,
  july: number,
  january: number,
): { avg: number; high: number; low: number } {
  let baseAvg: number;
  switch (season) {
    case "ete":
      baseAvg = july;
      break;
    case "hiver":
      baseAvg = january;
      break;
    case "printemps":
      baseAvg = (july + january) / 2 + 1.5; // un peu plus chaud que la moyenne stricte
      break;
    case "automne":
      baseAvg = (july + january) / 2 - 0.5;
      break;
  }
  return {
    avg: Math.round(baseAvg * 10) / 10,
    high: Math.round((baseAvg + 5) * 10) / 10,
    low: Math.round((baseAvg - 5) * 10) / 10,
  };
}

function tourismLoadFor(season: Season, city: CitySeed): { load: SeasonStats["tourismLoad"]; explanation: string } {
  const tags = city.characterTags;
  const isCoast = tags.some((t) => ["mer", "balnéaire", "atlantique", "méditerranéen", "port"].includes(t));
  const isMountain = tags.some((t) => ["montagne", "alpin", "ski", "alpes", "pyrénées"].includes(t));
  const isTouristyCity = tags.some((t) => ["tourisme", "premium", "historique", "international"].includes(t));
  const isCorsica = city.region === "Corse";

  if (season === "ete") {
    if (isCorsica || (isCoast && (city.region === "Provence-Alpes-Côte d'Azur" || city.region === "Nouvelle-Aquitaine"))) {
      return { load: "saturation", explanation: "Hauts mois touristiques (juillet-août) : prix logement +30 à 60%, restaurants à réserver." };
    }
    if (isCoast || isTouristyCity) {
      return { load: "haut", explanation: "Affluence estivale visible — quartiers historiques et plages saturés en après-midi." };
    }
    if (isMountain) {
      return { load: "moyen", explanation: "Stations alpines en activité randonnée mais bien en deçà de l'hiver." };
    }
    return { load: "moyen", explanation: "Activité touristique présente mais sans saturation." };
  }

  if (season === "hiver") {
    if (isMountain) {
      return { load: "saturation", explanation: "Haute saison ski : prix logement court terme x2 sur les week-ends, accès routier tendu." };
    }
    if (isCorsica) {
      return { load: "calme", explanation: "Île quasi-déserte côté tourisme, restaurants/saisonniers fermés." };
    }
    return { load: "calme", explanation: "Saison basse — meilleur moment pour visiter / s'installer sans pression locative." };
  }

  if (season === "printemps") {
    if (isTouristyCity || isCoast) {
      return { load: "moyen", explanation: "Premiers visiteurs sur ponts de mai, mais climat encore variable." };
    }
    return { load: "calme", explanation: "Fluidité — bon moment pour repérer sereinement." };
  }

  // automne
  if (isMountain) {
    return { load: "calme", explanation: "Inter-saison : ni ski ni randonnée d'été — beaucoup de fermetures temporaires." };
  }
  if (isTouristyCity) {
    return { load: "moyen", explanation: "Affluence en chute après la rentrée, retour à un rythme local." };
  }
  return { load: "calme", explanation: "Retour à la vie locale, prix court terme remontent les loyers en haute basse." };
}

function signatureFor(season: Season, city: CitySeed): string {
  const tags = city.characterTags.join(", ");
  switch (season) {
    case "printemps":
      return `À ${city.name}, le printemps adoucit les températures et fait revenir les terrasses${tags ? ` — ambiance ${tags}` : ""}.`;
    case "ete":
      if (city.avgTempJuly != null && city.avgTempJuly >= 27) {
        return `À ${city.name}, l'été dépasse régulièrement les 30 °C en après-midi — climatisation et stores conseillés.`;
      }
      return `À ${city.name}, l'été reste plutôt clément (juillet ${city.avgTempJuly ?? "—"} °C en moyenne).`;
    case "automne":
      return `À ${city.name}, l'automne installe un rythme local — prix logement détendu, terrasses encore possibles jusqu'en octobre.`;
    case "hiver":
      if (city.avgTempJanuary != null && city.avgTempJanuary <= 3) {
        return `À ${city.name}, l'hiver est franchement froid (janvier ${city.avgTempJanuary} °C en moyenne).`;
      }
      return `À ${city.name}, l'hiver reste tempéré comparé au reste du pays (janvier ${city.avgTempJanuary ?? "—"} °C).`;
  }
}

export function seasonalStats(city: CitySeed): SeasonStats[] {
  const july = city.avgTempJuly ?? 22;
  const january = city.avgTempJanuary ?? 5;
  const seasons: Season[] = ["printemps", "ete", "automne", "hiver"];

  return seasons.map((season) => {
    const meta = SEASON_META[season];
    const temps = seasonalTemps(season, july, january);
    const sun = avgSunshineHoursPerDay(city.sunshinedays, meta.sunFactor);
    const rain = rainyDays(meta.rainBaseline, city.region);
    const { load, explanation } = tourismLoadFor(season, city);
    return {
      season,
      label: meta.label,
      months: meta.months,
      avgTemp: temps.avg,
      avgTempHigh: temps.high,
      avgTempLow: temps.low,
      sunshineHoursPerDay: sun,
      rainyDaysPerMonth: rain,
      tourismLoad: load,
      tourismExplanation: explanation,
      signature: signatureFor(season, city),
      source:
        season === "ete" || season === "hiver"
          ? `Météo-France climato 1991-2020 (avg juillet/janvier)`
          : `Interpolation depuis les extrêmes saisonniers (Météo-France 1991-2020)`,
    };
  });
}

export const TOURISM_LOAD_BADGES: Record<SeasonStats["tourismLoad"], { label: string; tone: string }> = {
  calme: { label: "Calme", tone: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  moyen: { label: "Moyen", tone: "bg-lime-100 text-lime-700 border-lime-300" },
  haut: { label: "Haut", tone: "bg-amber-100 text-amber-700 border-amber-300" },
  saturation: { label: "Saturation", tone: "bg-red-100 text-red-700 border-red-300" },
};
