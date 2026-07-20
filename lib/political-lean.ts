// Per-city political lean, derived from the 2022 presidential 1st-round results
// by commune (Ministère de l'Intérieur, data.gouv.fr). Candidates are grouped
// into four blocs; `lean` is the plurality bloc, `blocs` are % of exprimés,
// `leanScore` is (droite+extreme_droite − gauche), i.e. >0 = right-leaning.
//
// Convention: this is an indicative estimate of a city's electorate, NOT an
// endorsement or a claim about current municipal politics. Always shown with
// its source + year + an "indicatif" caption. Data: data/political-lean.json
// (regenerate with the parser in the commit that introduced this file).
import data from "@/data/political-lean.json";

import {
  BLOC_ORDER,
  CANDIDATES,
  type Bloc,
  type CandidateKey,
  type PoliticalLean,
} from "@/lib/political-lean-meta";

// Types + display constants moved to lib/political-lean-meta (client-safe);
// re-exported here so the existing importers keep working.
export {
  BLOC_ORDER, BLOC_COLORS, BLOC_LABEL, CANDIDATES, CANDIDATE_BY_KEY,
} from "@/lib/political-lean-meta";
export type { Bloc, PoliticalLean, Candidate, CandidateKey } from "@/lib/political-lean-meta";

const DATA = data as Record<string, PoliticalLean>;

export function getPoliticalLean(slug: string): PoliticalLean | null {
  return DATA[slug] ?? null;
}

// Only the blocs that are actually a plurality somewhere — so a filter never
// offers an empty bucket (the classic right never wins a plurality in 2022).
export function leanOptions(): Bloc[] {
  const present = new Set<Bloc>();
  for (const k in DATA) present.add(DATA[k].lean);
  return BLOC_ORDER.filter((b) => present.has(b));
}

// slug -> plurality bloc map, for client-side filtering without importing the
// full per-city payload more than once.
export function leanBySlug(): Record<string, Bloc> {
  const out: Record<string, Bloc> = {};
  for (const k in DATA) out[k] = DATA[k].lean;
  return out;
}

// All cities with their lean — for the /orientation-politique ranking page.
export function allPoliticalLeans(): Array<PoliticalLean & { slug: string }> {
  return Object.entries(DATA).map(([slug, v]) => ({ slug, ...v }));
}

// Mean share per candidate across the panel, sorted strongest first. This is an
// average of communal results, not a national tally: every city weighs the same
// whatever its size. Callers must label it as such.
export function meanCandidateShares(): Array<{ key: CandidateKey; pct: number }> {
  const sums = {} as Record<CandidateKey, number>;
  for (const c of CANDIDATES) sums[c.key] = 0;
  const cities = Object.values(DATA);
  for (const city of cities) {
    for (const c of CANDIDATES) sums[c.key] += city.cands[c.key] ?? 0;
  }
  return CANDIDATES.map((c) => ({
    key: c.key,
    pct: Math.round((sums[c.key] / cities.length) * 10) / 10,
  })).sort((a, b) => b.pct - a.pct);
}

// The n strongest candidates in one city, for the per-city detail line.
export function topCandidates(lean: PoliticalLean, n = 3): Array<{ key: CandidateKey; pct: number }> {
  return (Object.entries(lean.cands) as Array<[CandidateKey, number]>)
    .map(([key, pct]) => ({ key, pct }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, n);
}
