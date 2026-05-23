// R8.2 — Tension locative : proxy honnête de la difficulté à trouver un
// logement en location dans une ville donnée.
//
// Pas de données officielles d'observatoires de vacance / délai moyen au pas
// communal — la liste DGALN « zones tendues » couvre ~1100 communes mais elle
// n'est pas exposée dans le seed. Donc proxy à partir de :
//   1. Niveau de loyer T2 par rapport à la médiane nationale
//   2. Prix d'achat / m² (un marché cher est rarement détendu)
//   3. Population (signal de demande)
//   4. Score sécurité × qualité de vie (les villes très désirables sont tendues)
//
// Documenté comme `estimation-proxy` pour rester honnête.

import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";

export type TensionLevel = "détendu" | "équilibré" | "soutenu" | "tendu" | "très tendu";

export interface HousingTension {
  /** 0–10, 10 = très tendu (presque impossible à trouver). */
  value: number;
  level: TensionLevel;
  /** Loyer T2 ville / médiane nationale (1.0 = pile dans la moyenne). */
  rentRatio: number;
  /** Couleur d'affichage (tier conscient). */
  color: string;
  /** Verdict une-ligne contextualisé. */
  verdict: string;
  /** Provenance — toujours étiqueter comme proxy. */
  source: string;
}

const LEVEL_META: Record<TensionLevel, { color: string; verdict: (city: string) => string }> = {
  "détendu":    { color: "#16A34A", verdict: (c) => `Marché détendu à ${c} : trouver un T2 reste raisonnable, négociation possible.` },
  "équilibré":  { color: "#84CC16", verdict: (c) => `Marché équilibré à ${c} : compter quelques semaines de recherche, dossier standard suffit.` },
  "soutenu":    { color: "#F59E0B", verdict: (c) => `Marché soutenu à ${c} : dossier solide recommandé, prévoir 1 à 2 mois.` },
  "tendu":      { color: "#F97316", verdict: (c) => `Marché tendu à ${c} : peu de biens, files de visites, garant conseillé.` },
  "très tendu": { color: "#EF4444", verdict: (c) => `Marché très tendu à ${c} : visites collectives, dossier "blindé" attendu, prévoir plusieurs mois.` },
};

function levelFor(score: number): TensionLevel {
  if (score >= 8.5) return "très tendu";
  if (score >= 7.0) return "tendu";
  if (score >= 5.5) return "soutenu";
  if (score >= 3.5) return "équilibré";
  return "détendu";
}

const MEDIAN_RENT_T2 = (() => {
  const values = CITIES_SEED
    .map((c) => HOUSING[c.slug]?.avgRentT2)
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return 700;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
})();

const MEDIAN_BUY_M2 = (() => {
  const values = CITIES_SEED
    .map((c) => HOUSING[c.slug]?.avgBuyPriceM2)
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return 2500;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
})();

export function housingTensionFor(city: CitySeed): HousingTension | null {
  const housing = HOUSING[city.slug];
  if (!housing) return null;

  const rentRatio = housing.avgRentT2 / MEDIAN_RENT_T2;
  const buyRatio = housing.avgBuyPriceM2 / MEDIAN_BUY_M2;

  // Base from rent ratio: 0.8 → 3, 1.0 → 5, 1.5 → 8, 2.0 → 10
  const rentScore = Math.max(0, Math.min(10, (rentRatio - 0.6) * 8));
  // Buy adds pressure
  const buyScore = Math.max(0, Math.min(10, (buyRatio - 0.6) * 5));
  // Population: > 200k = +1, > 500k = +1.5, < 30k = -1
  const pop = city.population ?? 30000;
  const popAdj = pop > 500_000 ? 1.5 : pop > 200_000 ? 1.0 : pop < 30_000 ? -1.0 : 0;
  // Desirability bonus from life + safety axes
  const desirability = ((city.scores.life + city.scores.safety) / 2 - 6) * 0.5;

  const raw = rentScore * 0.55 + buyScore * 0.25 + popAdj + desirability;
  const value = Math.round(Math.max(0, Math.min(10, raw)) * 10) / 10;
  const level = levelFor(value);
  const meta = LEVEL_META[level];

  return {
    value,
    level,
    rentRatio: Math.round(rentRatio * 100) / 100,
    color: meta.color,
    verdict: meta.verdict(city.name),
    source: "estimation-proxy : loyer T2 vs médiane nationale + prix m² + population + désirabilité (life+safety)",
  };
}

export const TENSION_LEVEL_META = LEVEL_META;
export const TENSION_MEDIAN_RENT_T2 = MEDIAN_RENT_T2;
export const TENSION_MEDIAN_BUY_M2 = MEDIAN_BUY_M2;
