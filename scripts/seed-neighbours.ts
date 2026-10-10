/**
 * Règle de voisinage de l'extension du seed (docs/extension-villes.md § 3.2), rendue exécutable.
 *
 * Jusqu'au lot 8, la règle n'existait que décrite au journal et rejouée par un script de scratch
 * réécrit à chaque run : chaque lot pouvait donc l'appliquer un peu différemment sans que rien le
 * voie. Ce script est la règle. Il ne modifie aucun fichier ; il imprime, pour une commune
 * candidate, ses voisines admissibles, les notes brutes à écrire, le repère `housing.ts`, le climat
 * de référence et les raisons de NE PAS l'ajouter.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/seed-neighbours.ts \
 *     --lat=47.2122 --lng=-1.7281 --dept="Loire-Atlantique" [--insee=44047] [--pop=24100]
 *
 *   … --exclude=maisons-laffitte,acheres   # rejouer pour une ville déjà au seed
 *
 *   npx tsx --tsconfig tsconfig.json scripts/seed-neighbours.ts --selftest
 *        # rejoue la règle sur chaque ville d'extension, avec le seed tel qu'il était avant son
 *        # lot (lu dans git log), et compare aux notes et au logement écrits
 *
 * Règle (§ 3.2) : les 4 villes du seed les plus proches à vol d'oiseau, **même département**,
 * 20 000 à 150 000 hab., **sans override** de `lib/score-calibration.ts`, au plus **une** ville
 * d'extension parmi les quatre ; note brute = médiane par axe, arrondie au dixième ; `global` =
 * moyenne pondérée de `calibrateScores` (recalculée de toute façon au chargement). Logement =
 * médiane des mêmes 4, arrondie à 10 € (loyers) et 100 € (m²). Climat = ville du seed la plus
 * proche, tous départements confondus.
 *
 * Le seed brut n'est pas exporté (`RAW_CITIES_SEED`) : il est relu comme texte, et le script
 * échoue si le nombre de fiches relues diffère de `CITIES_SEED.length`.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { calibrateScores } from "@/lib/score-calibration";
import type { CityScore } from "@/lib/types";

const AXES = ["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"] as const;
type Axis = (typeof AXES)[number];
type Raw = Record<Axis, number>;

const POP_MIN = 20_000;
const POP_MAX = 150_000;
/** Au-delà, la 4ᵉ voisine est signalée : Lagny (12,6 km) est la limite haute acceptée sans réserve. */
const FAR_KM = 12.6;

// ── Seed brut, relu comme texte ────────────────────────────────────────────────────────────────
function readRawScores(): Map<string, Raw> {
  const src = readFileSync("data/cities-seed.ts", "utf8");
  const out = new Map<string, Raw>();
  for (const block of src.split(/\n  \{\n/).slice(1)) {
    const slug = block.match(/^\s*slug: "([^"]+)"/m)?.[1];
    const body = block.match(/\bscores: \{([^}]+)\}/)?.[1];
    if (!slug || !body) continue;
    const s: Partial<Raw> = {};
    for (const m of body.matchAll(/(\w+): ([\d.]+)/g)) {
      if ((AXES as readonly string[]).includes(m[1])) s[m[1] as Axis] = Number(m[2]);
    }
    if (AXES.every((a) => typeof s[a] === "number")) out.set(slug, s as Raw);
  }
  if (out.size !== CITIES_SEED.length) {
    throw new Error(`seed relu : ${out.size} fiches, CITIES_SEED en porte ${CITIES_SEED.length}`);
  }
  return out;
}

/** Override présent ⇔ `calibrateScores` réécrit une note sentinelle hors de tout biais. */
function hasOverride(slug: string): boolean {
  const s = 5.123;
  const scores = { global: s, life: s, transport: s, nature: s, cost: s, safety: s, culture: s, remoteWork: s, schools: s };
  // département vide (aucun biais) et 50 000 hab. (aucun ajustement de taille)
  const out = calibrateScores({ slug, department: "", population: 50_000, scores }).scores;
  return AXES.some((a) => out[a] !== s);
}

function weightedGlobal(raw: Raw): number {
  return calibrateScores({ slug: "__seed_neighbours__", department: "", population: 50_000, scores: { global: 0, ...raw } as CityScore }).scores.global;
}

function km(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const x = Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLng - aLng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(x));
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
// Arrondi des lots 1 à 8 : `Math.round` sur le flottant, donc 5,35 (stocké 5,3499…) → 5,3.
const round = (x: number, step: number) => Math.round(x / step) * step;
const r1 = (x: number) => Math.round(x * 10) / 10;

interface Candidate { lat: number; lng: number; dept: string; exclude?: string; order?: Set<string> }

export function applyRule(c: Candidate, raws: Map<string, Raw>) {
  const pool = CITIES_SEED
    .filter((v) => v.slug !== c.exclude && (!c.order || c.order.has(v.slug)))
    .map((v) => ({ v, d: km(c.lat, c.lng, v.latitude, v.longitude) }))
    .sort((a, b) => a.d - b.d);

  const neighbours: typeof pool = [];
  let extensions = 0;
  for (const p of pool) {
    const v = p.v;
    if (v.department !== c.dept || (v.population ?? 0) < POP_MIN || (v.population ?? 0) > POP_MAX) continue;
    if (hasOverride(v.slug)) continue;
    const isExt = (v as { scoreCohort?: string }).scoreCohort === "extension";
    if (isExt && extensions >= 1) continue;
    if (isExt) extensions++;
    neighbours.push(p);
    if (neighbours.length === 4) break;
  }

  const raw = Object.fromEntries(AXES.map((a) => [a, r1(median(neighbours.map((n) => raws.get(n.v.slug)![a])))])) as Raw;
  const housing = neighbours.every((n) => HOUSING[n.v.slug])
    ? {
        avgRentT1: round(median(neighbours.map((n) => HOUSING[n.v.slug].avgRentT1)), 10),
        avgRentT2: round(median(neighbours.map((n) => HOUSING[n.v.slug].avgRentT2)), 10),
        avgRentT3: round(median(neighbours.map((n) => HOUSING[n.v.slug].avgRentT3)), 10),
        avgBuyPriceM2: round(median(neighbours.map((n) => HOUSING[n.v.slug].avgBuyPriceM2)), 100),
      }
    : null;
  const nearestAny = pool[0];

  const warnings: string[] = [];
  if (neighbours.length < 4) warnings.push(`seulement ${neighbours.length} voisine(s) admissible(s) dans le département — règle non applicable`);
  const fourth = neighbours[3]?.d ?? Infinity;
  if (neighbours.length === 4 && fourth > FAR_KM) warnings.push(`4ᵉ voisine à ${fourth.toFixed(1)} km (> ${FAR_KM} km, limite haute du lot 7) — à justifier au journal`);
  const closerElsewhere = neighbours.length < 4 ? [] : pool.filter((p) => p.d < fourth && p.v.department !== c.dept && (p.v.population ?? 0) >= POP_MIN);
  if (closerElsewhere.length >= 2) {
    warnings.push(`${closerElsewhere.length} villes d'un autre département plus proches que la 4ᵉ voisine (${closerElsewhere.slice(0, 3).map((p) => `${p.v.name} ${p.d.toFixed(1)} km`).join(", ")}) — la frontière départementale coupe peut-être l'agglomération`);
  }
  const prices = neighbours.map((n) => HOUSING[n.v.slug]?.avgBuyPriceM2).filter((x): x is number => typeof x === "number");
  if (prices.length === 4 && Math.max(...prices) / Math.min(...prices) > 1.5) {
    warnings.push(`repère m² des voisines de ${Math.min(...prices)} à ${Math.max(...prices)} € (× ${(Math.max(...prices) / Math.min(...prices)).toFixed(2)}) — une voisine tire la médiane, recouper le marché`);
  }

  return { neighbours, raw, global: weightedGlobal(raw), housing, climateFrom: nearestAny, warnings };
}

// ── CLI ───────────────────────────────────────────────────────────────────────────────────────
function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

/**
 * Lot de chaque ville d'extension, lu dans les sujets de commit « feat(seed): +N villes (A, B) ».
 * La limite « une extension au plus » dépend de ce qui était au seed AVANT le lot : une ville du
 * même lot n'était pas encore une voisine possible.
 */
function lotsFromGit(): Map<string, number> {
  const byName = new Map(CITIES_SEED.map((c) => [c.name, c.slug]));
  const subjects = execSync("git log --reverse --format=%s -- data/cities-seed.ts", { encoding: "utf8" })
    .split("\n").filter((s) => /^feat\(seed\): \+\d+ villes? \(/.test(s));
  const lot = new Map<string, number>();
  subjects.forEach((s, i) => {
    for (const name of s.slice(s.indexOf("(", 10) + 1, s.lastIndexOf(")")).split(", ")) {
      const slug = byName.get(name.trim());
      if (slug && !lot.has(slug)) lot.set(slug, i + 1);
    }
  });
  return lot;
}

/**
 * Écarts connus, documentés au journal : la ville n'est PAS réécrite sur la règle parce que le
 * résultat conforme serait plus loin du réel que la valeur publiée. Elle attend un override.
 * Une entrée ici n'est jamais un correctif : elle dit qu'une ville est hors règle et pourquoi.
 */
const KNOWN_OFF_RULE: Record<string, string> = {
  "maisons-laffitte":
    "lot 5 : Saint-Germain-en-Laye (override, note brute ignorée au chargement) prise comme voisine ; " +
    "la règle conforme (Sartrouville, Houilles, Conflans, Poissy) donnerait 4 100 €/m² et des notes plus basses " +
    "pour une ville que le journal tenait déjà pour sous-notée — attend un override (journal 2026-10-10, cinquième run)",
};

function selftest(raws: Map<string, Raw>): number {
  const lots = lotsFromGit();
  let same = 0;
  const diffs: string[] = [];
  const known: string[] = [];
  for (const c of CITIES_SEED) {
    if ((c as { scoreCohort?: string }).scoreCohort !== "extension") continue;
    const myLot = lots.get(c.slug);
    if (myLot == null) { diffs.push(`  ${c.slug}: lot introuvable dans l'historique git`); continue; }
    const before = new Set(CITIES_SEED.filter((v) => {
      if ((v as { scoreCohort?: string }).scoreCohort !== "extension") return true;
      const l = lots.get(v.slug);
      return l != null && l < myLot;
    }).map((v) => v.slug));
    const r = applyRule({ lat: c.latitude, lng: c.longitude, dept: c.department ?? "", order: before }, raws);
    const written = raws.get(c.slug)!;
    const bad = AXES.filter((a) => Math.abs(written[a] - r.raw[a]) > 0.051);
    const h = HOUSING[c.slug];
    const hBad = r.housing && h && (r.housing.avgRentT2 !== h.avgRentT2 || r.housing.avgBuyPriceM2 !== h.avgBuyPriceM2);
    if (!bad.length && !hBad) { same++; continue; }
    if (KNOWN_OFF_RULE[c.slug]) { known.push(`  ${c.slug}: ${KNOWN_OFF_RULE[c.slug]}`); continue; }
    diffs.push(`  ${c.slug} (lot ${myLot}): ${bad.map((a) => `${a} écrit ${written[a]} / règle ${r.raw[a]}`).join(", ")}${hBad ? ` · logement écrit ${h.avgRentT2}/${h.avgBuyPriceM2} / règle ${r.housing!.avgRentT2}/${r.housing!.avgBuyPriceM2}` : ""} [${r.neighbours.map((n) => n.v.slug).join(", ")}]`);
  }
  console.log(`selftest : ${same}/${same + diffs.length + known.length} villes d'extension reproduites par la règle`);
  if (known.length) console.log(`hors règle, documentées (${known.length}) :\n${known.join("\n")}`);
  if (diffs.length) console.log(`ÉCARTS NON DOCUMENTÉS (${diffs.length}) :\n${diffs.join("\n")}`);
  return diffs.length ? 1 : 0;
}

function main(): number {
  const raws = readRawScores();
  if (process.argv.includes("--selftest")) return selftest(raws);

  const lat = Number(arg("lat"));
  const lng = Number(arg("lng"));
  const dept = arg("dept");
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !dept) {
    console.error('usage : --lat=48.73 --lng=2.45 --dept="Val-de-Marne" [--insee=94078] [--pop=34000]');
    return 2;
  }
  const insee = arg("insee");
  if (insee) {
    const dup = CITIES_SEED.find((c) => c.inseeCode === insee);
    if (dup) { console.log(`✗ code Insee ${insee} déjà au seed : ${dup.slug}`); return 1; }
    console.log(`✓ code Insee ${insee} absent du seed`);
  }
  const pop = Number(arg("pop"));
  if (Number.isFinite(pop) && pop < POP_MIN) console.log(`⚠ population ${pop} sous le seuil de ${POP_MIN}`);

  // --exclude=a,b : rejouer la règle pour une ville déjà au seed (elle-même et les villes ajoutées
  // après elle sont écartées du vivier).
  const excluded = new Set((arg("exclude") ?? "").split(",").filter(Boolean));
  const order = excluded.size ? new Set(CITIES_SEED.map((c) => c.slug).filter((s) => !excluded.has(s))) : undefined;
  const r = applyRule({ lat, lng, dept, order }, raws);
  console.log("\nVoisines (§ 3.2) :");
  for (const n of r.neighbours) {
    const ext = (n.v as { scoreCohort?: string }).scoreCohort === "extension" ? " *extension" : "";
    console.log(`  ${n.d.toFixed(1).padStart(5)} km  ${n.v.slug}${ext}  ${AXES.map((a) => raws.get(n.v.slug)![a]).join(" · ")}`);
  }
  console.log(`\nNotes brutes : scores: { global: ${r.global}, ${AXES.map((a) => `${a}: ${r.raw[a]}`).join(", ")} }`);
  console.log(`Logement     : ${r.housing ? JSON.stringify(r.housing) : "non disponible (une voisine sans entrée housing.ts)"}`);
  const cf = r.climateFrom.v;
  console.log(`Climat       : ${cf.slug} (${r.climateFrom.d.toFixed(1)} km) — sunshinedays ${cf.sunshinedays}, juillet ${cf.avgTempJuly}, janvier ${cf.avgTempJanuary}`);
  if (r.warnings.length) {
    console.log("\nÀ examiner avant d'ajouter :");
    for (const w of r.warnings) console.log(`  ⚠ ${w}`);
  }
  return r.neighbours.length < 4 ? 1 : 0;
}

process.exit(main());
