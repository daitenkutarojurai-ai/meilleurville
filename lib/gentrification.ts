// F15 — Index de gentrification v0.
//
// Score composite "villes qui vont monter dans 5 ans". Quatre dimensions :
//  1. Évolution prix immobilier (DVF) — proxy v0 : niveau de prix actuel vs
//     coût de vie. Une ville encore abordable avec un score de vie ≥ 7 a un
//     fort potentiel.
//  2. Démographie 25–35 ans (INSEE) — proxy v0 : score_jeune_actif de owner-scores.
//  3. Ouvertures SIRENE — proxy v0 : score culture × score remoteWork (cafés
//     / bars / coworking sont des marqueurs de gentrification observés).
//  4. Hausse télétravailleurs — proxy v0 : score remoteWork.
//
// Tag honnête : tous les scores sont en `proxy-v0`. Sources réelles à brancher
// quand l'import DVF + INSEE recensement + SIRENE flux quotidien sera prêt.
//
// Le mot "gentrification" est sensible politiquement — le ton du site doit
// rester neutre. On ne dit pas "investissez ici", on dit "voici les villes
// dont les signaux de marché et démographiques montent".

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { computeOwnerScores } from "@/lib/owner-scores";

export interface GentrificationSignal {
  key: "prix" | "jeunes" | "ouvertures" | "remote";
  label: string;
  value: number; // 0–10
  source: string;
}

export interface GentrificationRow {
  city: CitySeed;
  score: number; // 0–100 composite
  signals: GentrificationSignal[];
  trajectory: "deja-en-cours" | "montee-rapide" | "potentiel" | "stable" | "baisse";
}

function clamp(n: number, lo = 0, hi = 10): number {
  return Math.max(lo, Math.min(hi, n));
}

function priceSignal(city: CitySeed): GentrificationSignal {
  const housing = HOUSING[city.slug];
  if (!housing) {
    return {
      key: "prix",
      label: "Évolution prix",
      value: 5,
      source: "Estimation régionale — pas de donnée DVF indexée pour cette ville.",
    };
  }
  // Heuristique v0 : ville encore abordable (prix médian < 3500 €/m²) avec une
  // bonne qualité de vie (score global ≥ 6.5) = signal "prix montent vite".
  // Inversement, ville déjà chère = signal saturation (peu de marge).
  const price = housing.avgBuyPriceM2;
  let value: number;
  if (price < 2500 && city.scores.global >= 6.5) value = 8.5;
  else if (price < 3000 && city.scores.global >= 6.0) value = 7.5;
  else if (price < 3500 && city.scores.global >= 6.5) value = 7.0;
  else if (price >= 5000) value = 3.5; // déjà trop cher
  else if (price >= 4000) value = 5.0;
  else value = 6.0;
  return {
    key: "prix",
    label: "Évolution prix probable",
    value: clamp(value),
    source: `Proxy v0 — niveau prix actuel (${price} €/m²) × qualité de vie ${city.scores.global.toFixed(1)}/10. À remplacer par évolution DVF 10 ans (slope régression).`,
  };
}

function youthSignal(city: CitySeed): GentrificationSignal {
  const owner = computeOwnerScores(city);
  const jeuneActif = owner.find((s) => s.key === "score_jeune_actif")!.value;
  return {
    key: "jeunes",
    label: "Démographie 25–35 ans",
    value: jeuneActif,
    source: "Proxy v0 — composite culture + remoteWork + cost + bonus métropole (depuis owner-scores). À remplacer par Insee recensement % 25-35 ans.",
  };
}

function openingsSignal(city: CitySeed): GentrificationSignal {
  // Score = (culture × remoteWork) ^ 0.5 — cités où coworking / cafés
  // indépendants prolifèrent.
  const product = city.scores.culture * city.scores.remoteWork;
  const value = clamp(Math.sqrt(product));
  return {
    key: "ouvertures",
    label: "Ouvertures (cafés / coworking / freelances)",
    value,
    source: "Proxy v0 — racine carrée du produit culture × remote-work. À remplacer par SIRENE flux quotidien (NAF cafés/restaurants/services informatiques) sur 3 ans glissants.",
  };
}

function remoteSignal(city: CitySeed): GentrificationSignal {
  const owner = computeOwnerScores(city);
  const teletravail = owner.find((s) => s.key === "score_teletravail")!.value;
  return {
    key: "remote",
    label: "Hausse télétravailleurs",
    value: teletravail,
    source: "Proxy v0 — score télétravail propriétaire (FTTH + remote axis). À remplacer par Insee recensement « travailleurs au domicile » 5 ans.",
  };
}

function trajectoryFor(score: number, signals: GentrificationSignal[]): GentrificationRow["trajectory"] {
  const price = signals.find((s) => s.key === "prix")!.value;
  if (score >= 75 && price >= 7) return "montee-rapide";
  if (score >= 65) return "deja-en-cours";
  if (score >= 50 && price >= 6) return "potentiel";
  if (score < 35) return "baisse";
  return "stable";
}

export function computeGentrification(city: CitySeed): GentrificationRow {
  const signals: GentrificationSignal[] = [
    priceSignal(city),
    youthSignal(city),
    openingsSignal(city),
    remoteSignal(city),
  ];
  // Composite score (0–100). Weights : prix 35%, jeunes 25%, ouvertures 20%, remote 20%.
  const weighted =
    signals[0].value * 3.5 + signals[1].value * 2.5 + signals[2].value * 2.0 + signals[3].value * 2.0;
  const score = Math.round(weighted * 10) / 10;
  return {
    city,
    score,
    signals,
    trajectory: trajectoryFor(score, signals),
  };
}

export function rankGentrification(limit?: number): GentrificationRow[] {
  const all = CITIES_SEED.map(computeGentrification).sort((a, b) => b.score - a.score);
  return limit != null ? all.slice(0, limit) : all;
}

export const TRAJECTORY_META: Record<GentrificationRow["trajectory"], { label: string; tone: string; desc: string }> = {
  "montee-rapide": {
    label: "Montée rapide",
    tone: "bg-red-100 text-red-700 border-red-300",
    desc: "Tous les signaux au vert ET marché immobilier déjà sous pression — fenêtre courte avant que ce soit cher.",
  },
  "deja-en-cours": {
    label: "Déjà en cours",
    tone: "bg-orange-100 text-orange-700 border-orange-300",
    desc: "Gentrification visible — les loyers et prix m² ont commencé à grimper depuis 3-5 ans.",
  },
  potentiel: {
    label: "Potentiel à 5 ans",
    tone: "bg-amber-100 text-amber-700 border-amber-300",
    desc: "Signaux démographiques et économiques positifs, marché encore accessible.",
  },
  stable: {
    label: "Stable",
    tone: "bg-lime-100 text-lime-700 border-lime-300",
    desc: "Pas d'accélération particulière — ville bien installée, valeurs locales préservées.",
  },
  baisse: {
    label: "En baisse",
    tone: "bg-slate-100 text-slate-700 border-slate-300",
    desc: "Démographie ou attractivité en repli — bons prix mais peu de dynamique nouvelle.",
  },
};
