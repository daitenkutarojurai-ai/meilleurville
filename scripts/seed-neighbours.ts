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
 *   npx tsx --tsconfig tsconfig.json scripts/seed-neighbours.ts --relire
 *        # repère m² de chaque ville d'extension relu à mesure égale (DVF dépôt ÷ DVF dépôt des voisines)
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
 * `--cross-dept` (règle ①, § 3.2, 2026-10-10) : voisines tous départements confondus ; sur les axes à
 * biais départemental (sécurité, coût), on transfère le niveau calibré des voisines et on retire le
 * biais du département d'arrivée. Refusé quand l'écart de biais avec une voisine dépasse 1,0.
 *
 * `--regle2` (règle ②, § 3.2, décidée 2026-10-11, outillée 2026-10-13) : même département, plancher de
 * population abaissé à 10 000 hab. Seulement quand le mode standard manque de voisines. Ne se combine
 * pas avec `--cross-dept`.
 *
 * `--price-ratio=0.79 --rent-ratio=1.02` (§ 3.3 bis, 2026-10-11) : marché de la commune ÷ marché
 * médian des voisines, mesurés dans une même source ; appliqué au repère médian au-delà de ± 10 %,
 * refus au-delà de ± 30 %.
 *
 * Le seed brut n'est pas exporté (`RAW_CITIES_SEED`) : il est relu comme texte, et le script
 * échoue si le nombre de fiches relues diffère de `CITIES_SEED.length`.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { cityPropertyPrices } from "@/lib/property-prices";
import { calibrateScores } from "@/lib/score-calibration";
import type { CityScore } from "@/lib/types";

const AXES = ["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"] as const;
type Axis = (typeof AXES)[number];
type Raw = Record<Axis, number>;

const POP_MIN = 20_000;
const POP_MAX = 150_000;
/** Règle ② : plancher abaissé à 10 000 hab. dans le département (backtest 0,674 contre 0,57 standard). */
export const POP_MIN_RULE2 = 10_000;
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

interface Candidate {
  lat: number; lng: number; dept: string; exclude?: string; order?: Set<string>; crossDept?: boolean;
  /** Règle ② (§ 3.2, décidée 2026-10-11) : plancher de population abaissé, même département seulement. */
  popMin?: number;
  /** § 3.3 bis : marché de la commune ÷ marché médian des voisines, mesurés dans UNE même source. */
  priceRatio?: number; rentRatio?: number;
}

/**
 * § 3.3 bis (2026-10-11) : sous ± 10 %, un ratio de marché est du bruit de source et le repère reste
 * la médiane des voisines ; au-delà, il est appliqué au repère médian. Au-delà de ± 30 %, la commune
 * ne ressemble plus à ses voisines et le script refuse (la ville attend).
 */
export const MARKET_RATIO_NOISE = 0.10;
export const MARKET_RATIO_MAX = 0.30;
const marketScale = (r: number | undefined) => (r != null && Math.abs(r - 1) > MARKET_RATIO_NOISE ? r : 1);

/**
 * Biais départemental d'un axe, mesuré par `calibrateScores` (aucune table recopiée) : note
 * sentinelle 5, 50 000 hab. (aucun ajustement de taille), slug sans override.
 */
function deptBias(dept: string, axis: Axis): number {
  const scores = { global: 5, life: 5, transport: 5, nature: 5, cost: 5, safety: 5, culture: 5, remoteWork: 5, schools: 5 };
  return r1(calibrateScores({ slug: "__seed_neighbours__", department: dept, population: 50_000, scores }).scores[axis] - 5);
}

export function applyRule(c: Candidate, raws: Map<string, Raw>) {
  const pool = CITIES_SEED
    .filter((v) => v.slug !== c.exclude && (!c.order || c.order.has(v.slug)))
    .map((v) => ({ v, d: km(c.lat, c.lng, v.latitude, v.longitude) }))
    .sort((a, b) => a.d - b.d);

  const neighbours: typeof pool = [];
  let extensions = 0;
  for (const p of pool) {
    const v = p.v;
    if ((!c.crossDept && v.department !== c.dept) || (v.population ?? 0) < (c.popMin ?? POP_MIN) || (v.population ?? 0) > POP_MAX) continue;
    if (hasOverride(v.slug)) continue;
    const isExt = (v as { scoreCohort?: string }).scoreCohort === "extension";
    if (isExt && extensions >= 1) continue;
    if (isExt) extensions++;
    neighbours.push(p);
    if (neighbours.length === 4) break;
  }

  // Mode transdépartemental (§ 3.2, règle ①) : sur les axes portant un biais départemental, on
  // transfère le NIVEAU CALIBRÉ des voisines (brut + biais de leur département), puis on retire le
  // biais du département d'arrivée — sinon il s'appliquerait une seconde fois par-dessus.
  const level = (slug: string, dept: string, a: Axis) =>
    raws.get(slug)![a] + (c.crossDept ? deptBias(dept, a) : 0);
  const raw = Object.fromEntries(AXES.map((a) => [a,
    r1(median(neighbours.map((n) => level(n.v.slug, n.v.department ?? "", a))) - (c.crossDept ? deptBias(c.dept, a) : 0)),
  ])) as Raw;
  const pk = marketScale(c.priceRatio);
  const rk = marketScale(c.rentRatio);
  const housing = neighbours.every((n) => HOUSING[n.v.slug])
    ? {
        avgRentT1: round(rk * median(neighbours.map((n) => HOUSING[n.v.slug].avgRentT1)), 10),
        avgRentT2: round(rk * median(neighbours.map((n) => HOUSING[n.v.slug].avgRentT2)), 10),
        avgRentT3: round(rk * median(neighbours.map((n) => HOUSING[n.v.slug].avgRentT3)), 10),
        avgBuyPriceM2: round(pk * median(neighbours.map((n) => HOUSING[n.v.slug].avgBuyPriceM2)), 100),
      }
    : null;
  const nearestAny = pool[0];

  const warnings: string[] = [];
  for (const [name, r] of [["prix", c.priceRatio], ["loyer", c.rentRatio]] as const) {
    if (r == null) continue;
    if (Math.abs(r - 1) > MARKET_RATIO_MAX) warnings.push(`ratio de marché ${name} ${r} hors de ± ${MARKET_RATIO_MAX * 100} % — la commune ne ressemble pas à ses voisines, règle non applicable`);
    else warnings.push(`§ 3.3 bis : ratio ${name} ${r} ${marketScale(r) === 1 ? `dans le bruit (± ${MARKET_RATIO_NOISE * 100} %), repère médian conservé` : "appliqué au repère médian"} — sources à citer au journal`);
  }
  if (neighbours.length < 4) warnings.push(`seulement ${neighbours.length} voisine(s) admissible(s)${c.crossDept ? "" : " dans le département"} — règle non applicable`);
  if (c.popMin != null && c.popMin < POP_MIN) {
    if (c.crossDept) warnings.push("règle ② et règle ① ne se combinent pas — règle non applicable");
    const small = neighbours.filter((n) => (n.v.population ?? 0) < POP_MIN).length;
    warnings.push(`règle ② : plancher ${c.popMin} hab. dans le département, ${small}/4 voisine(s) sous ${POP_MIN} ; erreur de backtest 0,67 point par axe (contre 0,57) — justifier au journal`);
  }
  if (c.crossDept) {
    const own = neighbours.filter((n) => n.v.department === c.dept).length;
    for (const a of ["safety", "cost"] as const) {
      const gaps = neighbours.filter((n) => Math.abs(deptBias(n.v.department ?? "", a) - deptBias(c.dept, a)) > 1.0);
      if (gaps.length) warnings.push(`${a} : écart de biais départemental > 1,0 avec ${gaps.map((n) => n.v.slug).join(", ")} — le niveau transféré importerait la mesure d'un autre département, règle non applicable`);
    }
    warnings.push(`mode transdépartemental : ${own}/4 voisines dans le département ; biais d'arrivée retiré (safety ${deptBias(c.dept, "safety")}, cost ${deptBias(c.dept, "cost")}) — justifier au journal`);
  }
  const fourth = neighbours[3]?.d ?? Infinity;
  if (neighbours.length === 4 && fourth > FAR_KM) warnings.push(`4ᵉ voisine à ${fourth.toFixed(1)} km (> ${FAR_KM} km, limite haute du lot 7) — à justifier au journal`);
  const closerElsewhere = neighbours.length < 4 || c.crossDept ? [] : pool.filter((p) => p.d < fourth && p.v.department !== c.dept && (p.v.population ?? 0) >= POP_MIN);
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
  // Le conteneur de routine clone en profondeur réduite : l'historique des premiers lots manque et
  // une dizaine de villes sortent « lot introuvable » ou rejouées contre le mauvais seed (constaté le
  // 2026-10-11). On refuse plutôt que de publier 25/43 pour une raison d'environnement.
  if (execSync("git rev-parse --is-shallow-repository", { encoding: "utf8" }).trim() === "true") {
    throw new Error("clone superficiel : lancer `git fetch --unshallow origin main` avant le selftest");
  }
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

/**
 * Villes ajoutées par une règle documentée autre que la règle standard : le selftest les rejoue
 * dans ce mode (transdépartemental, ratio de marché § 3.3 bis) au lieu de les déclarer hors règle.
 */
const DOCUMENTED_MODES: Record<string, Pick<Candidate, "crossDept" | "priceRatio" | "rentRatio">> = {
  // lot 9 (2026-10-11) : DVF appartements 2 641 €/m² (médiane PAP / Immovrai / Habity) ÷ 3 353 €/m²
  // (médiane DVF appartements des 4 voisines, data/city-property-prices.json) ; loyers RealAdvisor
  // 284 ÷ 278,5 €/m²/an.
  "villeneuve-saint-georges": { crossDept: true, priceRatio: 0.788, rentRatio: 1.02 },
  // lot 11 (2026-10-11) : DVF appartements ~2 502 €/m² (PAP 2 504, efficity 2 500) ÷ 2 828 €/m²
  // (médiane DVF appartements des 4 voisines) ; intra-source PAP 2 504 ÷ 3 015 (Savigny, Sainte-Geneviève)
  // = 0,83. Aucun loyer au m² du même portail trouvé pour les voisines : pas de ratio loyer.
  "morsang-sur-orge": { priceRatio: 0.885 },
  // lot 11 : DVF appartements ~2 499 €/m² (PAP 2 507, efficity 2 490) ÷ 3 376 €/m² (médiane des 4 voisines,
  // Massy et Palaiseau tirent la médiane) ; intra-source PAP 2 507 ÷ 3 536 (Massy, Savigny) = 0,71.
  "chilly-mazarin": { priceRatio: 0.74 },
  // lot 12 (2026-10-12) : DVF appartements PAP 3 477 €/m² (1er juin 2026) ÷ 2 758 €/m² (médiane DVF
  // appartements des 4 voisines) = 1,26 ; intra-source PAP 3 477 ÷ 2 903 (Orvault 3 193, Saint-Herblain
  // 2 613) = 1,20, à 5 % près ; efficity par quartier 3 120-3 350. Pas de loyer au m² du même portail.
  "la-chapelle-sur-erdre": { priceRatio: 1.26 },
  // lot 13 (2026-10-12) : DVF appartements PAP 3 319 €/m² (1er juin 2026) ÷ 2 609 €/m² (médiane DVF
  // appartements des 3 voisines mesurées : Rezé 2 609, Vertou 3 477, Saint-Herblain 2 567 ; La Chapelle-sur-Erdre
  // pas encore servie par le runner) = 1,27 ; intra-source efficity (quartiers Centre 3 280, Baugerie 3 260 ÷
  // Rezé 2 660-2 800) ≈ 1,20, à 6 % près. Pas de loyer au m² du même portail.
  "saint-sebastien-sur-loire": { priceRatio: 1.27 },
  // lot 16 (2026-10-14) : DVF appartements PAP 2 435 €/m² (1er juil. 2026) ÷ 2 113 €/m² (médiane DVF appartements
  // des 4 voisines : Saint-Benoît 1 491, Saint-André 1 839, Le Tampon 2 387, Saint-Paul 5 304) = 1,15 ; intra-source
  // PAP 2 435 ÷ 2 213,5 (Saint-André 1 954, Le Tampon 2 473 ; Saint-Benoît 1 660 et Saint-Paul au-dessus encadrent)
  // = 1,10. efficity 2 810 écarté (type de bien non précisé). Pas de loyer au m² du même portail.
  "sainte-marie-reunion": { priceRatio: 1.15 },
  // lot 16 : DVF appartements ~2 511 €/m² (PAP 2 542, efficity 2 480) ÷ 2 113 (mêmes voisines) = 1,19 ; intra-source
  // PAP 2 542 ÷ 2 213,5 = 1,15, à 4 % près.
  "sainte-suzanne-reunion": { priceRatio: 1.19 },
  // lot 17 (2026-10-15) : DVF appartements ~4 294 €/m² (PAP 4 262 au 1er juil. 2026, Immovrai 4 326 en 2025 ;
  // Habity 4 199) ÷ 3 333,5 €/m² (médiane DVF appartements des 4 voisines : Torcy 3 303, Roissy-en-Brie 3 321,
  // Champs-sur-Marne 3 346, Pontault-Combault 3 772) = 1,29 ; intra-source PAP 4 262 ÷ 3 512,5 (Torcy 3 397,
  // Roissy 3 462, Champs ~3 563, Pontault 3 889) = 1,21, à 6 % près. Pas de loyer au m² du même portail.
  "ozoir-la-ferriere": { priceRatio: 1.29 },
};
// Relecture du 2026-10-12 (troisième run) : le runner a depuis servi La Chapelle-sur-Erdre (3 410 €/m²) et
// Saint-Sébastien-sur-Loire elle-même (3 273 €/m²) ; à mesure égale, 3 273 ÷ 3 009,5 (Rezé, Vertou, La Chapelle,
// Saint-Herblain) = 1,088, sous le seuil de ± 10 % : le repère médian (3 400 €/m²) est rétabli. Le ratio du lot 13
// reste rejoué ci-dessus parce que le selftest compare à l'état écrit lors du lot ; voir RELU_APRES_LOT.
//
// Relecture générale du 2026-10-12 (quatrième run), `--relire` : même grandeur des deux côtés (DVF appartements
// de la commune ÷ médiane DVF appartements de ses 4 voisines de lot, tout au dépôt), seuils de § 3.3 bis. 23
// repères changent et sont reportés ici. Une ville d'extension peut être voisine d'une autre, donc la
// relecture se rejoue jusqu'à 0 changement (3 passes, le graphe suit l'ordre des lots). Morsang-sur-Orge revient à
// sa valeur écrite (3 500) mais figure ici : la règle de son lot, rejouée avec le repère relu de Saint-Michel-sur-Orge,
// donnerait 3 400. Trois villes sortent de ± 30 % (Clichy-sous-Bois 0,643,
// Romainville 1,531, Ris-Orangis 0,696) : leur repère prend le ratio mesuré, plus juste que la médiane, mais
// § 3.3 bis dit qu'elles ne ressemblent pas à leurs voisines — leurs notes héritées (axe coût en tête) sont
// suspectes et attendent un override documenté (docs/extension-villes.md, journal du jour).
const RELU_APRES_LOT: Record<string, Partial<Record<"avgBuyPriceM2", number>>> = {
  "saint-sebastien-sur-loire": { avgBuyPriceM2: 3400 },
  "montrouge": { avgBuyPriceM2: 7100 },
  "l-hay-les-roses": { avgBuyPriceM2: 4500 },
  "thiais": { avgBuyPriceM2: 4000 },
  "villepinte": { avgBuyPriceM2: 2800 },
  "clichy-sous-bois": { avgBuyPriceM2: 1800 },
  "romainville": { avgBuyPriceM2: 5500 },
  "ris-orangis": { avgBuyPriceM2: 2800 },
  "fontenay-aux-roses": { avgBuyPriceM2: 4700 },
  "vigneux-sur-seine": { avgBuyPriceM2: 4100 },
  "taverny": { avgBuyPriceM2: 3100 },
  "montgeron": { avgBuyPriceM2: 5000 },
  "longjumeau": { avgBuyPriceM2: 3200 },
  "bretigny-sur-orge": { avgBuyPriceM2: 4400 },
  "saint-michel-sur-orge": { avgBuyPriceM2: 3300 },
  "lagny-sur-marne": { avgBuyPriceM2: 4400 },
  "bussy-saint-georges": { avgBuyPriceM2: 5000 },
  "saint-cyr-l-ecole": { avgBuyPriceM2: 4900 },
  "coueron": { avgBuyPriceM2: 3700 },
  "halluin": { avgBuyPriceM2: 1900 },
  "villeneuve-saint-georges": { avgBuyPriceM2: 3700 },
  "mons-en-baroeul": { avgBuyPriceM2: 1500 },
  "morsang-sur-orge": { avgBuyPriceM2: 3500 },
  "la-chapelle-sur-erdre": { avgBuyPriceM2: 4100 },
  "bouguenais": { avgBuyPriceM2: 4000 },
  // Relecture du 2026-10-14 (troisième run) : DVF au dépôt, 2 306 ÷ 2 113 = 1,091 et 2 400 ÷ 2 113 = 1,136.
  "sainte-marie-reunion": { avgBuyPriceM2: 2300 },
  "sainte-suzanne-reunion": { avgBuyPriceM2: 2600 },
  // Relecture du 2026-10-15 (quatrième run) : DVF au dépôt, 4 200 ÷ 3 333,5 = 1,260 (recherche web au lot : 1,29).
  "ozoir-la-ferriere": { avgBuyPriceM2: 4900 },
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
    const r = applyRule({ lat: c.latitude, lng: c.longitude, dept: c.department ?? "", order: before, ...DOCUMENTED_MODES[c.slug] }, raws);
    const written = raws.get(c.slug)!;
    const bad = AXES.filter((a) => Math.abs(written[a] - r.raw[a]) > 0.051);
    const h = HOUSING[c.slug];
    // Un repère relu après le lot doit valoir la relecture, et le reste rester celui de la règle.
    const expectedM2 = RELU_APRES_LOT[c.slug]?.avgBuyPriceM2 ?? r.housing?.avgBuyPriceM2;
    const hBad = r.housing && h && (r.housing.avgRentT2 !== h.avgRentT2 || expectedM2 !== h.avgBuyPriceM2);
    if (!bad.length && !hBad) { same++; continue; }
    if (KNOWN_OFF_RULE[c.slug]) { known.push(`  ${c.slug}: ${KNOWN_OFF_RULE[c.slug]}`); continue; }
    diffs.push(`  ${c.slug} (lot ${myLot}): ${bad.map((a) => `${a} écrit ${written[a]} / règle ${r.raw[a]}`).join(", ")}${hBad ? ` · logement écrit ${h.avgRentT2}/${h.avgBuyPriceM2} / règle ${r.housing!.avgRentT2}/${expectedM2}` : ""} [${r.neighbours.map((n) => n.v.slug).join(", ")}]`);
  }
  console.log(`selftest : ${same}/${same + diffs.length + known.length} villes d'extension reproduites par la règle`);
  if (known.length) console.log(`hors règle, documentées (${known.length}) :\n${known.join("\n")}`);
  if (diffs.length) console.log(`ÉCARTS NON DOCUMENTÉS (${diffs.length}) :\n${diffs.join("\n")}`);
  return diffs.length ? 1 : 0;
}


/**
 * Relecture à mesure égale (§ 3.3 bis, 2026-10-12, quatrième run). Au moment d'un lot, le ratio de marché
 * se mesure avec des prix publiés par des portails (la DVF de la commune n'est pas encore au dépôt). Une fois
 * le runner passé, la même grandeur existe des deux côtés dans `data/city-property-prices.json` : médiane DVF
 * appartements de la commune ÷ médiane DVF appartements de ses 4 voisines de lot. Ce mode rejoue la règle pour
 * chaque ville d'extension, applique les seuils de § 3.3 bis à ce ratio et imprime le repère m² qui en sort,
 * à côté du repère écrit. Il n'écrit rien : la relecture se reporte à la main dans `housing.ts` et dans
 * `RELU_APRES_LOT`, que le selftest vérifie ensuite.
 */
function relire(raws: Map<string, Raw>): number {
  const lots = lotsFromGit();
  const rows: string[] = [];
  let changes = 0;
  for (const c of CITIES_SEED) {
    if ((c as { scoreCohort?: string }).scoreCohort !== "extension") continue;
    if (KNOWN_OFF_RULE[c.slug]) { rows.push(`  ${c.slug}: hors règle, non relue`); continue; }
    const myLot = lots.get(c.slug);
    if (myLot == null) { rows.push(`  ${c.slug}: lot introuvable`); continue; }
    const before = new Set(CITIES_SEED.filter((v) => {
      if ((v as { scoreCohort?: string }).scoreCohort !== "extension") return true;
      const l = lots.get(v.slug);
      return l != null && l < myLot;
    }).map((v) => v.slug));
    const mode = DOCUMENTED_MODES[c.slug] ?? {};
    const base = applyRule({ lat: c.latitude, lng: c.longitude, dept: c.department ?? "", order: before, crossDept: mode.crossDept }, raws);
    const own = cityPropertyPrices(c.slug)?.apartment?.medianM2 ?? null;
    const nb = base.neighbours.map((n) => cityPropertyPrices(n.v.slug)?.apartment?.medianM2 ?? null);
    const written = HOUSING[c.slug]?.avgBuyPriceM2;
    if (own == null || nb.some((x) => x == null) || !base.housing) {
      rows.push(`  ${c.slug}: mesure incomplète (commune ${own ?? "—"}, voisines ${nb.map((x) => x ?? "—").join("/")}) — non relue`);
      continue;
    }
    const ratio = Math.round((own / median(nb as number[])) * 1000) / 1000;
    const out = Math.abs(ratio - 1) > MARKET_RATIO_MAX;
    const relu = applyRule({ lat: c.latitude, lng: c.longitude, dept: c.department ?? "", order: before, crossDept: mode.crossDept, priceRatio: ratio, rentRatio: mode.rentRatio }, raws).housing!.avgBuyPriceM2;
    const flag = out ? "  ⚠ hors ± 30 %" : relu !== written ? "  ← à relire" : "";
    if (!out && relu !== written) changes++;
    rows.push(`  ${c.slug.padEnd(28)} DVF ${own} ÷ ${median(nb as number[])} = ${ratio.toFixed(3)}  écrit ${written}  relu ${relu}${flag}`);
  }
  console.log(`relecture à mesure égale (DVF appartements dépôt ÷ DVF appartements dépôt des 4 voisines de lot) :\n${rows.join("\n")}`);
  console.log(`\n${changes} repère(s) à relire`);
  return 0;
}

function main(): number {
  const raws = readRawScores();
  if (process.argv.includes("--selftest")) return selftest(raws);
  if (process.argv.includes("--relire")) return relire(raws);

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
  const ratio = (n: string) => (arg(n) == null ? undefined : Number(arg(n)));
  const r = applyRule({ lat, lng, dept, order, crossDept: process.argv.includes("--cross-dept"), popMin: process.argv.includes("--regle2") ? POP_MIN_RULE2 : undefined, priceRatio: ratio("price-ratio"), rentRatio: ratio("rent-ratio") }, raws);
  console.log("\nVoisines (§ 3.2) :");
  for (const n of r.neighbours) {
    const ext = (n.v as { scoreCohort?: string }).scoreCohort === "extension" ? " *extension" : "";
    console.log(`  ${n.d.toFixed(1).padStart(5)} km  ${n.v.slug} [${n.v.department}]${ext}  ${AXES.map((a) => raws.get(n.v.slug)![a]).join(" · ")}`);
  }
  console.log(`\nNotes brutes : scores: { global: ${r.global}, ${AXES.map((a) => `${a}: ${r.raw[a]}`).join(", ")} }`);
  console.log(`Logement     : ${r.housing ? JSON.stringify(r.housing) : "non disponible (une voisine sans entrée housing.ts)"}`);
  const cf = r.climateFrom.v;
  console.log(`Climat       : ${cf.slug} (${r.climateFrom.d.toFixed(1)} km) — sunshinedays ${cf.sunshinedays}, juillet ${cf.avgTempJuly}, janvier ${cf.avgTempJanuary}`);
  if (r.warnings.length) {
    console.log("\nÀ examiner avant d'ajouter :");
    for (const w of r.warnings) console.log(`  ⚠ ${w}`);
  }
  return r.neighbours.length < 4 || r.warnings.some((w) => w.includes("règle non applicable")) ? 1 : 0;
}

process.exit(main());
