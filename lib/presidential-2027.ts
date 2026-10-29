// Projection indicative du 1er tour de la présidentielle 2027, ville par ville.
//
// Méthode (écart proportionnel par famille, « proportional swing ») :
//   1. moyenne des derniers sondages nationaux, chaque enquête ramenée à 100 ;
//   2. pour chaque famille, ratio = moyenne 2027 / résultat national 2022 ;
//   3. part 2027 d'une ville = part 2022 de la ville × ratio, puis on ramène
//      les cinq familles à 100.
// Hypothèse forte, dite sur la page : chaque ville bouge comme le pays. C'est
// une projection mécanique, pas un sondage local. Client-safe (pas de JSON lourd).

import { BLOC_ORDER, type Bloc } from "@/lib/political-lean-meta";
import {
  BLOC_2027,
  NATIONAL_2022_BLOCS,
  POLLS_2027,
  type Candidate2027,
} from "@/data/presidential-2027-polls";

const round1 = (n: number) => Math.round(n * 10) / 10;

function normalize(blocs: Record<Bloc, number>): Record<Bloc, number> {
  const total = BLOC_ORDER.reduce((s, b) => s + blocs[b], 0) || 1;
  const out = {} as Record<Bloc, number>;
  for (const b of BLOC_ORDER) out[b] = (blocs[b] / total) * 100;
  return out;
}

/** Moyenne des sondages par famille (chaque enquête ramenée à 100). */
export const POLL_AVERAGE_BLOCS: Record<Bloc, number> = (() => {
  const sums: Record<Bloc, number> = { extreme_gauche: 0, gauche: 0, centre: 0, droite: 0, extreme_droite: 0 };
  for (const poll of POLLS_2027) {
    const raw: Record<Bloc, number> = { extreme_gauche: 0, gauche: 0, centre: 0, droite: 0, extreme_droite: 0 };
    for (const [cand, pct] of Object.entries(poll.scores) as Array<[Candidate2027, number]>) {
      raw[BLOC_2027[cand]] += pct;
    }
    const n = normalize(raw);
    for (const b of BLOC_ORDER) sums[b] += n[b];
  }
  const out = {} as Record<Bloc, number>;
  for (const b of BLOC_ORDER) out[b] = round1(sums[b] / POLLS_2027.length);
  return out;
})();

/** Moyenne des sondages par candidat, sur les enquêtes qui le testent. */
export function pollAverageCandidates(): Array<{ key: Candidate2027; pct: number }> {
  const acc = new Map<Candidate2027, { sum: number; n: number }>();
  for (const poll of POLLS_2027) {
    for (const [cand, pct] of Object.entries(poll.scores) as Array<[Candidate2027, number]>) {
      const a = acc.get(cand) ?? { sum: 0, n: 0 };
      a.sum += pct;
      a.n += 1;
      acc.set(cand, a);
    }
  }
  return [...acc.entries()]
    .map(([key, { sum, n }]) => ({ key, pct: round1(sum / n) }))
    .sort((a, b) => b.pct - a.pct);
}

const SWING: Record<Bloc, number> = (() => {
  const out = {} as Record<Bloc, number>;
  for (const b of BLOC_ORDER) out[b] = POLL_AVERAGE_BLOCS[b] / NATIONAL_2022_BLOCS[b];
  return out;
})();

export interface Projection2027 {
  blocs: Record<Bloc, number>;
  lead: Bloc;
  second: Bloc;
  /** Écart en points entre les deux premières familles. */
  margin: number;
  /** Écart < 5 points : l'ordre peut basculer avec quelques points de sondage. */
  close: boolean;
}

export function project2027(blocs2022: Record<Bloc, number>): Projection2027 {
  const scaled = {} as Record<Bloc, number>;
  for (const b of BLOC_ORDER) scaled[b] = (blocs2022[b] ?? 0) * SWING[b];
  const n = normalize(scaled);
  const blocs = {} as Record<Bloc, number>;
  for (const b of BLOC_ORDER) blocs[b] = round1(n[b]);
  const ranked = [...BLOC_ORDER].sort((a, b) => n[b] - n[a]);
  const margin = round1(n[ranked[0]] - n[ranked[1]]);
  return { blocs, lead: ranked[0], second: ranked[1], margin, close: margin < 5 };
}

/** Candidats 2027 testés par famille, pour nommer qui porte chaque bloc. */
export const BLOC_FIGURES: Record<Bloc, string> = {
  extreme_gauche: "Arthaud",
  gauche: "Mélenchon, Glucksmann…",
  centre: "Philippe, Attal",
  droite: "Retailleau, Dupont-Aignan",
  extreme_droite: "Le Pen, Zemmour…",
};
