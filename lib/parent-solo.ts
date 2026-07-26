/**
 * Score composite « parent solo » — mêmes pondérations que le profil
 * `single-parent` dans `lib/city-match.ts` (un seul revenu, un seul
 * conducteur). Pur, testable, pas de nouvelle donnée.
 *
 * Formule : coût 0,30 + transports 0,20 + écoles 0,25 + sécurité 0,25.
 * Total des poids = 1,00 → le résultat reste sur 0-10 comme les axes.
 */

import type { CitySeed } from "@/data/cities-seed";

export interface ParentSoloFit {
  score: number; // 0-10, une décimale
  breakdown: {
    cost: number;
    transport: number;
    schools: number;
    safety: number;
  };
}

export function parentSoloFit(city: Pick<CitySeed, "scores">): ParentSoloFit {
  const s = city.scores;
  const weighted = s.cost * 0.3 + s.transport * 0.2 + s.schools * 0.25 + s.safety * 0.25;
  return {
    score: Math.round(weighted * 10) / 10,
    breakdown: { cost: s.cost, transport: s.transport, schools: s.schools, safety: s.safety },
  };
}

export function fitLabel(score: number): { label: string; hint: string } {
  if (score >= 7.5) return { label: "Excellent", hint: "les quatre leviers alignés — rare" };
  if (score >= 6.5) return { label: "Bien", hint: "trois leviers sur quatre, un seul point faible" };
  if (score >= 5.5) return { label: "Correct", hint: "faisable avec organisation, arbitrages à faire" };
  if (score >= 4.5) return { label: "Difficile", hint: "deux axes qui coincent — regarder ailleurs si possible" };
  return { label: "Défavorable", hint: "profil parent solo pénalisé sur plusieurs axes" };
}

/**
 * Revenu net mensuel minimum estimé pour tenir un T3 en parent solo.
 * Règle 33 % (loyer <= 1/3 du revenu net), qu'on relâche à 35 % quand la
 * ville a un score coût de la vie < 5 (marchés très chers où les bailleurs
 * acceptent souvent 40 % avec caution Visale).
 */
export function minIncomeForT3(rentT3: number, cost: number): number {
  const ratio = cost < 5 ? 0.35 : 0.33;
  return Math.round(rentT3 / ratio / 50) * 50;
}
