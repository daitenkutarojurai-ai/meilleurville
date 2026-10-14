/**
 * Validation croisée des règles de notation de l'extension du seed (docs/extension-villes.md § 3.2).
 *
 * Une ville ajoutée reçoit des notes brutes dérivées de villes déjà au seed. Ce script mesure
 * l'exactitude d'une règle en la rejouant « une ville retirée » sur la cohorte d'origine : pour
 * chaque ville d'origine elle-même admissible (20 000 à 150 000 hab., sans override), on applique
 * la règle comme si la ville était absente, et on compare la note prédite à la note brute écrite.
 * L'écart absolu moyen (MAE) et son 90ᵉ centile disent de combien, sur un axe 0-10, une note
 * d'extension peut s'écarter de ce qu'un rédacteur aurait écrit.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/seed-neighbours-backtest.ts
 *
 * Règles comparées (toutes : médiane par axe, arrondie au dixième ; villes d'extension exclues du
 * vivier pour que la mesure ne dépende pas des lots) :
 *   standard          4 plus proches, même département, 20 000+ hab. (règle en vigueur)
 *   dept-10k          idem, plancher 10 000 hab.
 *   region-transfert  4 plus proches, même région, 10 000+ hab., niveau calibré transféré sur
 *                     sécurité et coût (logique de la règle ①), refus si écart de biais > 1,0
 *   taille-region     4 villes de la région les plus proches en population (comparables de taille)
 *   mediane-region    médiane de toute la région (référence naïve)
 *
 * Sous-populations : toutes ; « isolées » au sens de la règle standard (4ᵉ voisine au-delà de 12,6 km,
 * puis de 25 km) ; « sans-standard » = moins de 4 voisines admissibles dans le département, c'est-à-dire
 * exactement les villes pour qui une règle ② serait utilisée.
 *
 * Mesure du 2026-10-11 (583 villes, 249 villes d'origine testables) :
 *   standard, toutes : MAE 0,572 · p90 1,2 ; isolées > 25 km (41 villes) : 0,683
 *   mêmes 41 villes : dept-10k 0,674 · region-transfert 0,661 · mediane-region 0,755 · taille-region 0,842
 *   sans-standard : dept-10k 0,656 (19 villes) · region-transfert 0,674 (63, coût 1,02 / sécurité 0,96)
 *                   · taille-region 0,764 (80) · mediane-region 0,721 (80)
 * → les « comparables de taille » sont écartés comme règle ② : pires que la médiane régionale naïve
 *   (journal du 2026-10-11, troisième run).
 */
import { readFileSync } from "node:fs";
import { CITIES_SEED } from "@/data/cities-seed";
import { calibrateScores } from "@/lib/score-calibration";

const AXES = ["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"] as const;
type Axis = (typeof AXES)[number];
type City = (typeof CITIES_SEED)[number];

const raws = new Map<string, Record<Axis, number>>();
for (const block of readFileSync("data/cities-seed.ts", "utf8").split(/\n  \{\n/).slice(1)) {
  const slug = block.match(/^\s*slug: "([^"]+)"/m)?.[1];
  const body = block.match(/\bscores: \{([^}]+)\}/)?.[1];
  if (!slug || !body) continue;
  const s = {} as Record<Axis, number>;
  for (const m of body.matchAll(/(\w+): ([\d.]+)/g)) if ((AXES as readonly string[]).includes(m[1])) s[m[1] as Axis] = Number(m[2]);
  raws.set(slug, s);
}
if (raws.size !== CITIES_SEED.length) throw new Error(`seed relu : ${raws.size} fiches, CITIES_SEED en porte ${CITIES_SEED.length}`);

const flat = (v: number) => ({ global: v, life: v, transport: v, nature: v, cost: v, safety: v, culture: v, remoteWork: v, schools: v });
const hasOverride = (slug: string) => {
  const out = calibrateScores({ slug, department: "", population: 50_000, scores: flat(5.123) }).scores;
  return AXES.some((a) => out[a] !== 5.123);
};
const biasCache = new Map<string, number>();
const bias = (dept: string, a: Axis) => {
  const k = `${dept}|${a}`;
  if (!biasCache.has(k)) biasCache.set(k, Math.round((calibrateScores({ slug: "__bt__", department: dept, population: 50_000, scores: flat(5) }).scores[a] - 5) * 10) / 10);
  return biasCache.get(k)!;
};
const km = (a: City, b: City) => {
  const r = (d: number) => (d * Math.PI) / 180;
  const x = Math.sin(r(b.latitude - a.latitude) / 2) ** 2 + Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(r(b.longitude - a.longitude) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
};
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const r1 = (x: number) => Math.round(x * 10) / 10;

const OVERRIDDEN = new Set(CITIES_SEED.filter((c) => hasOverride(c.slug)).map((c) => c.slug));
const ORIGIN = CITIES_SEED.filter((c) => (c as { scoreCohort?: string }).scoreCohort !== "extension");
const admissible = (v: City, floor: number) => (v.population ?? 0) >= floor && (v.population ?? 0) <= 150_000 && !OVERRIDDEN.has(v.slug);
const nearest = (c: City, pool: City[]) => pool.filter((v) => v.slug !== c.slug).map((v) => ({ v, d: km(c, v) })).sort((a, b) => a.d - b.d).slice(0, 4);

/** Une règle rend, pour une ville, sa prédiction par axe — ou null si elle ne s'applique pas. */
type Rule = (c: City) => Record<Axis, number> | null;
const medianOf = (ns: City[], c: City, transfer = false) =>
  Object.fromEntries(AXES.map((a) => {
    const tr = transfer && (a === "safety" || a === "cost");
    return [a, r1(median(ns.map((v) => raws.get(v.slug)![a] + (tr ? bias(v.department ?? "", a) : 0))) - (tr ? bias(c.department ?? "", a) : 0))];
  })) as Record<Axis, number>;

const RULES: Record<string, Rule> = {
  standard: (c) => { const n = nearest(c, ORIGIN.filter((v) => v.department === c.department && admissible(v, 20_000))); return n.length < 4 ? null : medianOf(n.map((x) => x.v), c); },
  "dept-10k": (c) => { const n = nearest(c, ORIGIN.filter((v) => v.department === c.department && admissible(v, 10_000))); return n.length < 4 ? null : medianOf(n.map((x) => x.v), c); },
  "region-transfert": (c) => {
    const n = nearest(c, ORIGIN.filter((v) => v.region === c.region && admissible(v, 10_000)));
    if (n.length < 4) return null;
    if (n.some((x) => (["safety", "cost"] as const).some((a) => Math.abs(bias(x.v.department ?? "", a) - bias(c.department ?? "", a)) > 1.0))) return null;
    return medianOf(n.map((x) => x.v), c, true);
  },
  "taille-region": (c) => {
    const n = ORIGIN.filter((v) => v.slug !== c.slug && v.region === c.region && admissible(v, 10_000))
      .sort((a, b) => Math.abs(Math.log((a.population ?? 1) / (c.population ?? 1))) - Math.abs(Math.log((b.population ?? 1) / (c.population ?? 1)))).slice(0, 4);
    return n.length < 4 ? null : medianOf(n, c);
  },
  "mediane-region": (c) => { const n = ORIGIN.filter((v) => v.slug !== c.slug && v.region === c.region && admissible(v, 10_000)); return n.length < 4 ? null : medianOf(n, c); },
};

// --dept="La Réunion" : restreint les villes testées à un département et imprime le détail ville par
// ville de la règle standard (4ᵉ voisine, écart moyen). Le vivier de voisines reste tout le seed d'origine.
const deptArg = process.argv.find((a) => a.startsWith("--dept="))?.slice(7);
const targets = ORIGIN.filter((c) => admissible(c, 20_000) && (!deptArg || c.department === deptArg));
if (deptArg && !targets.length) throw new Error(`aucune ville testable dans le département « ${deptArg} »`);
const fourthKm = new Map(targets.map((c) => {
  const n = nearest(c, ORIGIN.filter((v) => v.department === c.department && admissible(v, 20_000)));
  return [c.slug, n.length < 4 ? Infinity : n[3].d];
}));

console.log(`${targets.length} villes d'origine testables (20 000-150 000 hab., sans override)\n`);
console.log("règle              sous-pop.      n    MAE    p90   " + AXES.map((a) => a.slice(0, 5).padStart(5)).join(" "));
for (const [name, rule] of Object.entries(RULES)) {
  for (const [label, keep] of [["toutes", () => true], ["isolées>12,6", (d: number) => d > 12.6 && d < Infinity], ["isolées>25", (d: number) => d > 25 && d < Infinity], ["sans-standard", (d: number) => d === Infinity]] as const) {
    const errs: number[] = [];
    const per = Object.fromEntries(AXES.map((a) => [a, [] as number[]])) as Record<Axis, number[]>;
    let n = 0;
    for (const c of targets) {
      if (!keep(fourthKm.get(c.slug)!)) continue;
      const p = rule(c);
      if (!p) continue;
      n++;
      for (const a of AXES) { const e = Math.abs(p[a] - raws.get(c.slug)![a]); errs.push(e); per[a].push(e); }
    }
    if (!n) continue;
    const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
    const p90 = [...errs].sort((a, b) => a - b)[Math.floor(errs.length * 0.9)];
    console.log(`${name.padEnd(18)} ${label.padEnd(13)} ${String(n).padStart(4)}  ${mean(errs).toFixed(3)}  ${p90.toFixed(2)}  ` + AXES.map((a) => mean(per[a]).toFixed(2).padStart(5)).join(" "));
  }
}

if (deptArg) {
  console.log(`\ndétail règle standard — ${deptArg} (4 plus proches du même département, 20 000+ hab.)`);
  for (const c of targets) {
    const n = nearest(c, ORIGIN.filter((v) => v.department === c.department && admissible(v, 20_000)));
    if (n.length < 4) { console.log(`  ${c.slug.padEnd(28)} moins de 4 voisines`); continue; }
    const p = medianOf(n.map((x) => x.v), c);
    const mae = AXES.reduce((s, a) => s + Math.abs(p[a] - raws.get(c.slug)![a]), 0) / AXES.length;
    console.log(`  ${c.slug.padEnd(28)} 4ᵉ voisine ${n[3].d.toFixed(1).padStart(5)} km  MAE ${mae.toFixed(2)}`);
  }
}
