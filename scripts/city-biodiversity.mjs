#!/usr/bin/env node
/**
 * F62 — Biodiversity pipeline for the 540 seed cities (GBIF half).
 *
 *   node scripts/city-biodiversity.mjs               # crawl the next ~60 uncovered cities
 *   node scripts/city-biodiversity.mjs --limit=20    # cap the batch (default 60)
 *   node scripts/city-biodiversity.mjs --slug=lyon   # crawl a single city
 *   node scripts/city-biodiversity.mjs --force       # re-crawl cities already in the JSON
 *   node scripts/city-biodiversity.mjs vernacular    # fill the missing species names, no recrawl
 *   node scripts/city-biodiversity.mjs stats         # what's in data/city-biodiversity.json today
 *   node scripts/city-biodiversity.mjs probe         # one city, verbose — validates the query shape
 *   node scripts/city-biodiversity.mjs selftest      # offline checks on the maths + the facet reader
 *
 * Source: GBIF (https://www.gbif.org), occurrence search API, no key required.
 * One circle of RADIUS_KM around each seed centroid, occurrences from YEAR_FROM
 * onward, coordinates present and free of flagged geospatial issues.
 *
 * ── What this script records, and what it deliberately does not ────────────
 *
 * It records MEASUREMENTS and statistics derived from them. It does not record
 * scores: turning richness into a 0-10 number is `lib/biodiversity.ts`'s job,
 * same split as scripts/city-population.mjs → lib/demography.ts.
 *
 * The one derived statistic computed here is rarefaction (see below), because
 * it needs the full per-species occurrence vector — thousands of rows per city,
 * 540 cities. Keeping that vector in the committed JSON would cost tens of MB
 * for a number the lib would recompute identically on every render. So the
 * vector is consumed here and only the result is written.
 *
 * ── The observation-effort bias, and why we rarefy ─────────────────────────
 *
 * A raw GBIF occurrence count measures how many naturalists type observations
 * into a phone, not how much lives there. Paris beats any Pyrenean valley on
 * volume. Even distinct-species counts inherit the bias, because species
 * accumulate with sampling: look ten times longer, find more species.
 *
 * So we report the rarefied richness (Hurlbert 1971): the expected number of
 * distinct species in a random subsample of RAREFY_N observations, computed
 * from the per-species counts. Every city is compared at the SAME sampling
 * effort, which is the standard fix in ecology and is defensible in a way that
 * "species per observation" is not (accumulation is sub-linear, so dividing by
 * N over-punishes well-surveyed places).
 *
 * A city with fewer than RAREFY_N observations cannot be rarefied to RAREFY_N —
 * there is nothing to subsample. It gets `rarefied: null` and the surface must
 * say "effort d'observation insuffisant", never a filled-in guess. That is the
 * same number as the measurability floor in lib/biodiversity.ts, and that is on
 * purpose: the floor is not arbitrary, it is the point below which the
 * statistic stops existing.
 *
 * Rarefaction also needs the FULL abundance vector, which the facet page cap
 * may cut short on the best-surveyed cities. When it does, the exact figure is
 * not knowable and `rarefy()` returns a bracket instead — `rarefied` is a
 * rigorous lower bound, `rarefiedUpper` closes it, `rarefiedExact` is false.
 * Until 2026-08-02 this script rarefied the truncated head against its own sum,
 * which overstated richness precisely where the ranking is read. `selftest`
 * pins that regression.
 *
 * ── Licence ────────────────────────────────────────────────────────────────
 *
 * We query only CC0 and CC BY records (`LICENSES`), excluding CC BY-NC, because
 * the site is commercial — same rule as LICENSE_OK in scripts/commune-images.mjs.
 * This is a filter on the source data, so every figure downstream is a figure
 * over free records only; comparisons stay fair because the filter is identical
 * for every city.
 *
 * Attribution is a licence condition, not decoration: any page rendering these
 * numbers must credit GBIF and the accession date (see GBIF_CREDIT in
 * lib/biodiversity.ts). Note that the *search* API does not mint a download
 * DOI — only the occurrence/download API does, and that needs credentials. We
 * therefore record `accessedAt` and the exact query so the figures are
 * reproducible, and the surfaces cite GBIF.org + date rather than claiming a
 * DOI we do not have.
 *
 * ── Resumability under the cloud-runner constraint ─────────────────────────
 *
 * .cache/ is gitignored and every scheduled run starts from a fresh checkout,
 * so the cache does NOT survive between runs. What survives is
 * data/city-biodiversity.json, committed as we go. Each run takes the biggest
 * cities still missing, one batch, one commit.
 *
 * ⚠️ UNVERIFIED AGAINST THE LIVE API. Written 2026-07-30 in the cloud runner,
 * where api.gbif.org answers 403 CONNECT at the proxy — the same egress wall
 * that blocked Overpass, Wikidata and geo.api.gouv.fr during wave 6. Run
 * `probe` on a local machine FIRST and check the parameter shapes flagged
 * @unverified below before launching a 540-city batch.
 */
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, ".cache", "city-biodiversity");
const RAW_DIR = path.join(CACHE_DIR, "gbif");
const SPECIES_CACHE = path.join(CACHE_DIR, "species");
const OUT_JSON = path.join(ROOT, "data", "city-biodiversity.json");
const SEED_TS = path.join(ROOT, "data", "cities-seed.ts");

const API = "https://api.gbif.org/v1";
const UA =
  "MaVilleIdeale/1.0 (https://www.mavilleideale.fr; daitenkutarojurai@gmail.com) node-fetch";

/**
 * Bumped when the query shape changes, so a stale row is recognisable — and,
 * since 2026-09-03, actually replayed: `crawlBatch` now serves rows below this
 * version before uncrawled cities. It did not, which is the same trap
 * scripts/city-news.mjs fell into on 18/08 — a version bump nobody re-ran is a
 * fix that never reaches a reader.
 *
 * 3 (2026-09-03): reptiles resolved by name instead of the empty `taxonKey 358`.
 * 2 (2026-08-02): rarefaction bracketed when the species facet is truncated.
 */
const QUERY_VERSION = 3;

const RADIUS_KM = 10;
const YEAR_FROM = 2015;
/** Subsample size for rarefaction, and the measurability floor. See header. */
const RAREFY_N = 500;
/** CC BY-NC excluded on purpose — the site is commercial. */
const LICENSES = ["CC0_1_0", "CC_BY_4_0"];
const TOP_SPECIES = 12;

/**
 * The taxa we break richness down by. `taxonKey` matches descendants, so the
 * key for Aves is "every bird". Five of the six are given as backbone keys,
 * verified the only way that matters — the completed 540-city crawl returned a
 * plausible non-zero count for each of them on every single city.
 *
 * ⚠️ The sixth was not, and that is why `taxa` exists. Until 2026-09-03 reptiles
 * were queried as `taxonKey: 358` (Reptilia) and came back **0 on all 540
 * cities**, in both locales, since the crawl. Reptilia is not where the GBIF
 * backbone puts reptiles: our own corpus proves it, since the species records
 * it stores carry `class: "Squamata"` and `class: "Testudines"` and never
 * `"Reptilia"` — Longwy lists the wall lizard among its most-recorded species
 * (1 203 observations) on a page whose group chart claims no reptiles at all.
 *
 * So reptiles are resolved **by name** against the backbone at crawl time
 * rather than by a number typed here. That is the fix for the defect class, not
 * just for this taxon: a hardcoded key that stops matching empties its bucket in
 * silence, while a name that stops resolving says so and writes `null`.
 */
const GROUPS = [
  { id: "birds", taxonKeys: [212], label: "Oiseaux" },
  { id: "mammals", taxonKeys: [359], label: "Mammifères" },
  { id: "insects", taxonKeys: [216], label: "Insectes" },
  { id: "amphibians", taxonKeys: [131], label: "Amphibiens" },
  { id: "reptiles", taxa: ["Squamata", "Testudines", "Crocodylia"], label: "Reptiles" },
  { id: "plants", taxonKeys: [6], label: "Flore" },
];

/** IUCN global categories we count as threatened. Global, NOT the French
 *  national red list — the surfaces must say so; INPN brings the national
 *  statuses in a later phase. */
const THREATENED = ["VU", "EN", "CR"];

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--")) ?? "crawl";
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const LIMIT = Number(opt("limit") ?? 60);
const ONLY_SLUG = opt("slug") ?? null;
const FORCE = flag("force");
/** Facet page size and page cap. Exposed as flags because GBIF's facet paging
 *  limits are the most likely thing to differ from what this was written
 *  against — tune them on the first local run rather than editing the file. */
const FACET_LIMIT = Number(opt("facet-limit") ?? 1000);
const FACET_PAGES = Number(opt("facet-pages") ?? 6);
const MIN_SLEEP_MS = Number(opt("sleep") ?? 1000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

/* ── seed loader ────────────────────────────────────────────────────────── */

/**
 * Extracts { slug, name, latitude, longitude, population } for the seed cities.
 * We parse the source rather than importing it: the seed module runs
 * calibration + z-score rescaling at load time, and a regex pass is instant and
 * keeps this file an mjs. Same approach as scripts/city-parks.mjs.
 */
async function loadSeed() {
  const src = await fs.readFile(SEED_TS, "utf8");
  const out = [];
  for (const b of src.split(/\n {2}\{\n/).slice(1)) {
    const s = (k) => b.match(new RegExp(`${k}:\\s*"([^"]+)"`))?.[1] ?? null;
    const n = (k) => {
      const m = b.match(new RegExp(`${k}:\\s*(-?[\\d.]+)`));
      return m ? Number(m[1]) : null;
    };
    const slug = s("slug");
    const lat = n("latitude");
    const lng = n("longitude");
    if (!slug || lat == null || lng == null) continue;
    out.push({ slug, name: s("name"), latitude: lat, longitude: lng, population: n("population") ?? 0 });
  }
  return out;
}

/* ── HTTP with backoff ──────────────────────────────────────────────────── */

/**
 * GET a GBIF endpoint with retry. 429/50x back off exponentially and honour
 * Retry-After; a proxy CONNECT refusal is terminal and says so, because
 * retrying an egress-policy denial just burns the run.
 */
async function gbif(pathname, params) {
  const url = new URL(API + pathname);
  for (const [k, v] of params ?? []) url.searchParams.append(k, String(v));
  let lastErr = null;
  for (let i = 0; i < 5; i++) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    } catch (err) {
      // Undici wraps a proxy CONNECT refusal as a generic fetch failure; the
      // egress wall is not something a retry fixes.
      const msg = String(err?.cause?.message ?? err?.message ?? err);
      if (/403|CONNECT|proxy/i.test(msg)) {
        throw new Error(`GBIF blocked at proxy layer (${msg}) — run this pipeline locally`);
      }
      lastErr = err;
      await sleep(2000 * 2 ** i);
      continue;
    }
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after")) || 0;
      await sleep(Math.max(retryAfter * 1000, 2000 * 2 ** i));
      lastErr = new Error(`HTTP ${res.status}`);
      continue;
    }
    // 400 on a facet parameter is a query-shape bug, not a transient fault:
    // surface the URL so the operator can see exactly what GBIF rejected.
    throw new Error(`HTTP ${res.status} on ${url.pathname}${url.search}`);
  }
  throw lastErr ?? new Error("GBIF request failed");
}

/* ── query building ─────────────────────────────────────────────────────── */

/**
 * The filters every request shares. `geoDistance` takes "lat,lng,distance" and
 * `year` takes an inclusive range as "from,to".
 * @unverified — both are documented GBIF params but neither has been exercised
 * from this environment. If `geoDistance` is rejected, the fallback is a WKT
 * circle via `geometry=POLYGON((...))` (counter-clockwise winding, closed ring).
 */
function baseParams(city) {
  const thisYear = new Date().getFullYear();
  const p = [
    ["geoDistance", `${city.latitude},${city.longitude},${RADIUS_KM}km`],
    ["year", `${YEAR_FROM},${thisYear}`],
    ["hasCoordinate", "true"],
    ["hasGeospatialIssue", "false"],
    ["occurrenceStatus", "PRESENT"],
    ["limit", "0"],
  ];
  for (const l of LICENSES) p.push(["license", l]);
  return p;
}

/**
 * Pulls one facet's counts out of a GBIF search response.
 *
 * Split out of facetAll so `selftest` can exercise it on a recorded response
 * shape without touching the network — this is the one place where a change in
 * GBIF's payload would silently yield zero species rather than an error.
 */
export function pickFacet(json, field) {
  // GBIF takes the facet name in camelCase on the way in (`facet=speciesKey`)
  // and echoes it back as the UPPER_SNAKE_CASE enum member on the way out
  // (`"field": "SPECIES_KEY"`). Comparing the two case-insensitively is not
  // enough — the underscore never matches — so both sides are stripped to
  // letters and digits. Getting this wrong does not raise: it finds no facet
  // and records zero species for every city.
  const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const want = norm(field);
  const f = (json?.facets ?? []).find((x) => norm(x.field) === want);
  // null = the response carried no such facet at all (a query-shape bug, which
  // the caller escalates); [] = the facet came back genuinely empty.
  if (!f) return null;
  return (f.counts ?? []).map((c) => ({ name: c.name, count: c.count }));
}

/**
 * Pages one facet to exhaustion (or to the page cap) and returns
 * [{ name, count }] plus whether the cap truncated the tail.
 *
 * Truncation is reported, never swallowed: a species count that is really "at
 * least 6000" must not be rendered as if it were exact.
 */
async function facetAll(city, field, extra = [], pages = FACET_PAGES) {
  const out = [];
  let truncated = false;
  for (let page = 0; page < pages; page++) {
    const params = [
      ...baseParams(city),
      ...extra,
      ["facet", field],
      ["facetMincount", "1"],
      [`${field}.facetLimit`, String(FACET_LIMIT)],
      [`${field}.facetOffset`, String(page * FACET_LIMIT)],
    ];
    const json = await gbif("/occurrence/search", params);
    const counts = pickFacet(json, field);
    if (counts === null) {
      // Silently returning zero species here would write a plausible-looking
      // row for every city. Fail the city instead.
      throw new Error(
        `GBIF returned no "${field}" facet (fields present: ` +
        `${(json?.facets ?? []).map((f) => f.field).join(", ") || "none"})`,
      );
    }
    out.push(...counts);
    if (counts.length < FACET_LIMIT) return { counts: out, truncated: false, total: json?.count ?? 0 };
    truncated = page === pages - 1;
    await sleep(MIN_SLEEP_MS);
  }
  return { counts: out, truncated, total: null };
}

/* ── rarefaction ────────────────────────────────────────────────────────── */

/** Lanczos log-gamma — good to ~1e-13 relative, plenty for a count statistic. */
const LANCZOS = [
  676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012,
  9.9843695780195716e-6, 1.5056327351493116e-7,
];
function lgamma(z) {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < LANCZOS.length; i++) x += LANCZOS[i] / (z + i + 1);
  const t = z + LANCZOS.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/**
 * Hurlbert (1971) rarefaction: expected number of distinct species in a random
 * subsample of `n` observations drawn from a community of `N` observations.
 *
 *   E[S_n] = Σ_i [ 1 − C(N − N_i, n) / C(N, n) ]
 *
 * i.e. one minus the probability that species i is absent from the subsample.
 * Evaluated through log-gamma because C(N, n) overflows a double well before
 * the counts we see in a city like Paris.
 *
 * Decreasing in N at fixed n and fixed counts — the property the bounds below
 * are built on.
 */
function expectedSpecies(counts, n, N) {
  const lgN = lgamma(N + 1) - lgamma(N - n + 1);
  let expected = 0;
  for (const { count } of counts) {
    const m = N - count; // draws that avoid this species
    if (m < n) { expected += 1; continue; } // absence impossible → always present
    const logP = lgamma(m + 1) - lgamma(m - n + 1) - lgN;
    expected += 1 - Math.exp(logP);
  }
  return expected;
}

/** Rounding that keeps a bound a bound: a lower bound never rounds up. */
const floor1 = (v) => Math.floor(v * 10) / 10;
const ceil1 = (v) => Math.ceil(v * 10) / 10;

/**
 * Rarefied richness for one city, with the truncated-facet case handled
 * honestly rather than silently.
 *
 * The subtlety that makes this function longer than the formula: rarefaction
 * needs the FULL abundance vector, and `facetAll` may have stopped at the page
 * cap. When it did, `counts` is the head of the distribution and its sum is
 * **not** the community size. Feeding that truncated sum in as N — which is
 * what this script did until 2026-08-02 — inflates every species' detection
 * probability and returns a number that is too high, precisely for the richest
 * cities. Since the score is a percentile rank over this value, the bias lands
 * at the top of the ranking, where readers look.
 *
 * What is knowable, and what this returns instead:
 *
 * - **Not truncated** — `counts` is every species-identified occurrence, so
 *   `sum(counts)` IS the community size and the result is exact. (Occurrences
 *   identified only to genus are excluded on purpose: they cannot contribute a
 *   species to a subsample, so they are not part of the community rarefied.)
 *
 * - **Truncated** — the true community size lies in `[observed, total]`.
 *   Evaluating at `total` (the largest it can be) with only the species we
 *   saw gives a **rigorous lower bound**: every omitted term is non-negative
 *   and E decreases in N. The matching upper bound evaluates at `observed`
 *   (the smallest N can be) and adds the most the unseen tail could
 *   contribute — by the union bound each unseen individual joins the subsample
 *   with probability exactly n/N, so the tail is worth at most
 *   `n · (total − observed) / observed` species.
 *
 * Returns `{ value, exact, upper, reason }`; `value` is null when nothing
 * defensible can be published — fewer observations than the subsample size, or
 * a truncated facet with no occurrence total to bound it against.
 */
export function rarefy(counts, n, { total = null, truncated = false } = {}) {
  const observed = counts.reduce((s, c) => s + c.count, 0);
  if (observed < n) {
    // You cannot subsample more than you have, and a silently degraded answer
    // here would be exactly the invented figure this project refuses.
    return { value: null, exact: false, upper: null, reason: "below-floor" };
  }
  if (!truncated) {
    const v = expectedSpecies(counts, n, observed);
    return { value: +v.toFixed(1), exact: true, upper: +v.toFixed(1), reason: null };
  }
  if (total == null || total < observed) {
    // Truncated tail and no community size to bound it against: the value is
    // unbounded above and would only be a guess. Say so; do not publish.
    return { value: null, exact: false, upper: null, reason: "unbounded" };
  }
  const lower = expectedSpecies(counts, n, total);
  const upper = expectedSpecies(counts, n, observed) + (n * (total - observed)) / observed;
  return { value: floor1(lower), exact: false, upper: ceil1(upper), reason: null };
}

/* ── species naming ─────────────────────────────────────────────────────── */

/**
 * The vernacular name for one language, out of a GBIF /vernacularNames payload.
 *
 * GBIF tags languages in ISO 639-3 ("fra", "eng"), but not always: some
 * checklists write the two-letter code and some write it uppercase. Matching on
 * one exact lowercase string therefore misses names that are right there in the
 * response, and returns null instead of throwing — the same class of silent
 * miss as the SPECIES_KEY facet case fixed on 2026-08-02.
 *
 * Where a language carries several names (English usually does), a `preferred`
 * entry wins; otherwise the first, which is the order GBIF returns.
 *
 * ⚠️ …except that the list also carries **ringing alpha codes** tagged
 * `language: eng`, and taking the first entry took the code whenever it came
 * first. From 2026-09-03 — the day English names went live — to 2026-09-10,
 * **1,281 species cards across 522 of the 540 EN pages showed a code instead of
 * a name**, and on 180 of those pages it was the FIRST card: `GRTI` for the
 * great tit (497 cards), `C F` for the chaffinch (430), `COST` for the starling
 * (237), 26 taxa in all. The French side carried none, so it was also
 * a divergence between a page and its twin, and a pure regression: before
 * 03/09 the EN pages showed the Latin name, which is exact and searchable.
 *
 * A code is not a name, so it is skipped here rather than stored — and it is
 * ALSO refused at the display site (`isVernacularCode()` in
 * lib/biodiversity.ts), because the rows already written carry it and a
 * recrawl is not what makes a fix reach a reader.
 */
function isVernacularCode(name) {
  const letters = String(name).replace(/\s+/g, "");
  return (
    letters.length > 0 &&
    letters.length <= 6 &&
    /^[A-Z ]+$/.test(name) &&
    /^[A-Z]+$/.test(letters)
  );
}

function pickVernacular(results, langs) {
  const want = new Set(langs);
  const hits = (results ?? []).filter(
    (v) =>
      v?.vernacularName &&
      want.has(String(v.language ?? "").toLowerCase()) &&
      !isVernacularCode(v.vernacularName),
  );
  if (!hits.length) return null;
  return (hits.find((v) => v.preferred === true) ?? hits[0]).vernacularName;
}

/**
 * Bumped when the shape — or the CONTENT RULE — of a cached species record
 * changes, so a stale entry is refetched instead of trusted. Without it the
 * 2026-09-03 fix below would have been undone by the cache: every cached record
 * already held `vernacularEn: null`, and a cache hit never asks why.
 *
 * 3 (2026-09-10): `pickVernacular` now refuses ringing alpha codes, so every
 *   record cached before it holds "GRTI" where a name belongs.
 * 2 (2026-09-03): English names read from /vernacularNames.
 */
const SPECIES_INFO_VERSION = 3;

/**
 * Scientific name, vernacular names (FR + EN) and taxonomy for a species key.
 * Cached on disk across cities and across runs: the top species of one city are
 * overwhelmingly the top species of its neighbours, so the cache turns a
 * per-city cost into a one-off one.
 *
 * ⚠️ Both vernacular names come from the SAME /vernacularNames list, which is
 * fetched once. Until 2026-09-03 the English one was read from the species
 * record's own `vernacularName` field, which is not populated for GBIF backbone
 * taxa: **0 of the 412 species in the corpus carried an English name** while
 * 375 carried a French one, so the 540 EN pages listed Latin names only. Zero
 * out of a population that large is a bug, not a source gap — and it cost no
 * extra request to fix, the list was already on the wire.
 */
async function speciesInfo(key) {
  await fs.mkdir(SPECIES_CACHE, { recursive: true });
  const file = path.join(SPECIES_CACHE, `${key}.json`);
  try {
    const cached = JSON.parse(await fs.readFile(file, "utf8"));
    if (cached?.infoVersion === SPECIES_INFO_VERSION) return cached;
  } catch {}

  const sp = await gbif(`/species/${key}`, []);
  await sleep(MIN_SLEEP_MS);
  let vernacularFr = null;
  let vernacularEn = null;
  try {
    const vn = await gbif(`/species/${key}/vernacularNames`, [["limit", "100"]]);
    vernacularFr = pickVernacular(vn?.results, ["fra", "fr"]);
    vernacularEn = pickVernacular(vn?.results, ["eng", "en"]);
    await sleep(MIN_SLEEP_MS);
  } catch {
    // A missing vernacular list is not a failure: the scientific name stands
    // on its own and the surface falls back to it.
  }
  const info = {
    key: Number(key),
    infoVersion: SPECIES_INFO_VERSION,
    scientificName: sp?.canonicalName ?? sp?.scientificName ?? null,
    vernacularFr,
    vernacularEn,
    kingdom: sp?.kingdom ?? null,
    class: sp?.class ?? null,
  };
  await fs.writeFile(file, JSON.stringify(info));
  return info;
}

/**
 * Merges a freshly fetched species record into a `topSpecies` entry already in
 * the JSON. Fills holes only: a name that is already there is never overwritten,
 * so a backfill pass can never silently rewrite what the 540 FR pages display.
 * Returns true when something was actually filled.
 *
 * ⚠️ One exception, and only one: a stored **ringing alpha code** is not a name
 * and is replaced. Without it the corpus keeps its 1,281 "GRTI" cards until a
 * full recrawl — seven hours against twenty minutes of backfill — because the
 * hole-filling rule sees a non-null string and moves on. A code is only ever
 * replaced by a real name, never by another code and never by null.
 */
function fillNames(sp, info) {
  let changed = false;
  for (const field of ["scientificName", "vernacularFr", "vernacularEn"]) {
    const stored = sp[field];
    const fresh = info?.[field];
    if (fresh == null) continue;
    const isCode =
      field !== "scientificName" && typeof stored === "string" && isVernacularCode(stored);
    if (stored != null && !isCode) continue;
    if (isCode && isVernacularCode(fresh)) continue;
    sp[field] = fresh;
    changed = true;
  }
  return changed;
}

/* ── "unidentified" bins in the GBIF backbone ───────────────────────────── */

/**
 * Epithets that name no organism. The GBIF backbone carries SPECIES-RANK bins
 * spelled "<higher taxon> spec" — `Animalia spec`, `Insecta spec` — where
 * records identified only to a high rank end up. They are valid species keys:
 * they come back through the `speciesKey` facet like any species, they count
 * as one species in `species`, and they enter the rarefaction vector.
 *
 * Nothing in their shape betrays them — "Animalia spec" passes a Latin-binomial
 * test (capital, lowercase, two words), which is why a shape check found none.
 * No valid epithet, in zoology or botany, is written this way.
 *
 * Kept in the JSON on purpose: the bin measures the survey (how much of it was
 * never identified), so dropping it here would destroy a real figure. It is the
 * SURFACE that must not list it as a species — `displayTopSpecies()` in
 * lib/biodiversity.ts. This copy exists so `stats` can name a new one loudly;
 * `selftest` pins the two against the same cases.
 */
const PLACEHOLDER_EPITHETS = new Set(["spec", "sp", "spp", "indet", "indets", "incertae"]);

function isPlaceholderTaxon(sp) {
  const name = String(sp?.scientificName ?? "").trim();
  if (!name) return false;
  const parts = name.split(/\s+/);
  if (parts.length < 2) return true;
  return PLACEHOLDER_EPITHETS.has(parts[1].toLowerCase().replace(/\.$/, ""));
}

/* ── taxon resolution ───────────────────────────────────────────────────── */

/**
 * Backbone key for a taxon named in `GROUPS.taxa`, resolved once per run.
 *
 * Resolving by name is the point: a number typed into this file empties its
 * bucket in silence the day the backbone moves the taxon, which is exactly what
 * happened to Reptilia. A name that stops resolving throws instead, and the
 * caller records `null` — "we did not measure this", never a zero.
 *
 * `/species/match` answers with `usageKey` plus a `matchType`; anything other
 * than an exact match on the expected rank is refused rather than guessed at.
 */
const taxonKeyCache = new Map();
async function resolveTaxonKey(name) {
  if (taxonKeyCache.has(name)) return taxonKeyCache.get(name);
  const m = await gbif("/species/match", [["name", name], ["strict", "true"]]);
  await sleep(MIN_SLEEP_MS);
  const key = m?.usageKey ?? null;
  if (!key || (m.matchType && m.matchType !== "EXACT")) {
    throw new Error(
      `GBIF did not match the taxon "${name}" exactly (matchType=${m?.matchType ?? "none"}) — ` +
      "refusing to count a group through a key we cannot stand behind",
    );
  }
  taxonKeyCache.set(name, key);
  return key;
}

/** The taxonKey params for one group, resolving names when it has them. */
async function groupParams(g) {
  const keys = [...(g.taxonKeys ?? [])];
  for (const name of g.taxa ?? []) keys.push(await resolveTaxonKey(name));
  return keys.map((k) => ["taxonKey", k]);
}

/* ── per-city crawl ─────────────────────────────────────────────────────── */

async function crawlOne(city, { verbose = false } = {}) {
  const say = (...a) => verbose && log("   ", ...a);

  // 1. Distinct species + the per-species occurrence vector that rarefaction
  //    needs. `total` also gives us the occurrence count for free.
  const species = await facetAll(city, "speciesKey");
  await sleep(MIN_SLEEP_MS);
  const occurrences = species.total ?? (await (async () => {
    const j = await gbif("/occurrence/search", baseParams(city));
    await sleep(MIN_SLEEP_MS);
    return j?.count ?? 0;
  })());
  say(`species ${species.counts.length}${species.truncated ? "+" : ""}, occurrences ${occurrences}`);

  // Rarefaction needs the whole abundance vector; when the facet cap cut the
  // tail we can only bracket the answer (see rarefy). That is honest but it
  // costs precision on exactly the richest cities, and it is fixable from the
  // command line — so it must be loud, not a field nobody reads.
  const rare = rarefy(species.counts, RAREFY_N, {
    total: occurrences,
    truncated: species.truncated,
  });
  if (species.truncated) {
    log(
      `    ⚠ ${city.slug}: species facet hit the page cap (${FACET_PAGES}×${FACET_LIMIT}). ` +
      `Rarefaction is bracketed [${rare.value ?? "?"}, ${rare.upper ?? "?"}], not exact. ` +
      `Re-run this city with --facet-pages=${FACET_PAGES * 2} --slug=${city.slug} --force to close it.`,
    );
  }

  // 2. Effort. Distinct observers is the honest denominator: `recordedBy` is
  //    free text and therefore noisy (spelling variants inflate it), which is
  //    why it gates measurability rather than dividing anything.
  const observers = await facetAll(city, "recordedBy", [], facetPages("observers"));
  await sleep(MIN_SLEEP_MS);
  const datasets = await facetAll(city, "datasetKey", [], facetPages("datasets"));
  await sleep(MIN_SLEEP_MS);
  say(`observers ${observers.counts.length}${observers.truncated ? "+" : ""}, datasets ${datasets.counts.length}`);

  // 3. Richness per group. Species, not occurrences — an occurrence split would
  //    just re-describe which group birdwatchers photograph most.
  const groups = {};
  const groupsTruncated = [];
  const groupsUnresolved = [];
  for (const g of GROUPS) {
    let params;
    try {
      params = await groupParams(g);
    } catch (err) {
      // A group whose taxon we could not resolve is unknown, not empty. Writing
      // 0 here is what put "no reptiles" on 540 pages for a month.
      groups[g.id] = null;
      groupsUnresolved.push(g.id);
      say(`group ${g.id} unresolved: ${err.message}`);
      continue;
    }
    const r = await facetAll(city, "speciesKey", params, GROUP_FACET_PAGES);
    groups[g.id] = r.counts.length;
    if (r.truncated) groupsTruncated.push(g.id);
    await sleep(MIN_SLEEP_MS);
  }
  say(`groups ${JSON.stringify(groups)}`);

  // 4. Globally threatened species (IUCN VU/EN/CR).
  const threatenedParams = THREATENED.map((c) => ["iucnRedListCategory", c]);
  const threatened = await facetAll(city, "speciesKey", threatenedParams, facetPages("threatenedSpecies"));
  await sleep(MIN_SLEEP_MS);
  say(`threatened species ${threatened.counts.length}`);

  // 5. Names for the most-recorded species, so the page shows living things
  //    and not only integers.
  const top = [];
  for (const s of species.counts.slice().sort((a, b) => b.count - a.count).slice(0, TOP_SPECIES)) {
    try {
      const info = await speciesInfo(s.name);
      top.push({ ...info, count: s.count });
    } catch (err) {
      say(`species ${s.name} lookup failed: ${err.message}`);
    }
  }

  return {
    crawledAt: new Date().toISOString().slice(0, 10),
    source: "gbif",
    queryVersion: QUERY_VERSION,
    radiusKm: RADIUS_KM,
    yearFrom: YEAR_FROM,
    licenses: LICENSES,
    occurrences,
    observers: observers.counts.length,
    observersTruncated: observers.truncated,
    datasets: datasets.counts.length,
    // Ces deux drapeaux étaient calculés puis jetés : un plafond atteint serait
    // parti sur les pages comme un total, sans que rien ne puisse le voir — la
    // classe de défaut qui a mis 2 000 naturalistes sur 101 villes.
    datasetsTruncated: datasets.truncated,
    species: species.counts.length,
    speciesTruncated: species.truncated,
    // null when the city has fewer than RAREFY_N observations, or when a
    // truncated facet leaves the figure unbounded — see rarefy().
    rarefiedN: RAREFY_N,
    rarefied: rare.value,
    /** False when the species facet was truncated: `rarefied` is then a
     *  rigorous lower bound and `rarefiedUpper` closes the interval. */
    rarefiedExact: rare.exact,
    rarefiedUpper: rare.upper,
    groups,
    groupsTruncated,
    // Groups whose taxon could not be resolved this run: their count is null,
    // and the surfaces must say "not measured" rather than skip the row.
    groupsUnresolved,
    threatenedSpecies: threatened.counts.length,
    threatenedSpeciesTruncated: threatened.truncated,
    topSpecies: top,
    accessedAt: new Date().toISOString(),
  };
}

/* ── batch runner ───────────────────────────────────────────────────────── */

async function readJson(f, fallback) {
  try { return JSON.parse(await fs.readFile(f, "utf8")); } catch { return fallback; }
}
async function writeJson(f, data) {
  await fs.mkdir(path.dirname(f), { recursive: true });
  await fs.writeFile(f, JSON.stringify(data, null, 2) + "\n");
}

async function crawlBatch() {
  const seed = await loadSeed();
  const current = (await readJson(OUT_JSON, {})) ?? {};
  // A row written by an older query shape is not "already crawled": it answers
  // a question we have since corrected. Serving stale versions here is what
  // makes a QUERY_VERSION bump actually reach a reader — city-news.mjs bumped
  // to 2 on 18/08 and replayed nothing for a fortnight because it did not.
  const stale = (c) => current[c.slug] && (current[c.slug].queryVersion ?? 1) < QUERY_VERSION;
  const pool = ONLY_SLUG
    ? seed.filter((c) => c.slug === ONLY_SLUG)
    : seed.filter((c) => FORCE || !current[c.slug] || stale(c));
  // Stale rows first: an uncrawled city shows nothing, a stale one shows a
  // wrong number, and a wrong number is the more urgent of the two.
  pool.sort(
    (a, b) => Number(stale(b)) - Number(stale(a)) || (b.population ?? 0) - (a.population ?? 0),
  );
  const batch = pool.slice(0, LIMIT);

  const staleCount = seed.filter(stale).length;
  log(`seed: ${seed.length} cities`);
  log(`state: ${Object.keys(current).length} already crawled, ${seed.length - Object.keys(current).length} remaining`);
  if (staleCount) log(`       ${staleCount} rows below queryVersion ${QUERY_VERSION} — queued for replay`);
  log(`batch: ${batch.length} cities this run (limit ${LIMIT})`);
  if (!batch.length) { log("nothing to do"); return; }

  await fs.mkdir(RAW_DIR, { recursive: true });
  let ok = 0, thin = 0, failed = 0;
  const started = Date.now();
  for (const [i, city] of batch.entries()) {
    try {
      const row = await crawlOne(city);
      current[city.slug] = row;
      if (row.rarefied == null) thin++;
      ok++;
      log(
        `  [${i + 1}/${batch.length}] ${city.slug} — ${row.species} espèces / ${row.occurrences} obs / ` +
        `${row.observers} observateurs` +
        (row.rarefied == null ? " — effort insuffisant, non mesurable" : ` → rarefied ${row.rarefied}`),
      );
    } catch (err) {
      failed++;
      log(`  [${i + 1}/${batch.length}] ${city.slug} — FAILED: ${err.message}`);
      if (err.message.includes("blocked at proxy layer")) {
        log("GBIF is blocked by the environment's egress policy — aborting run.");
        break;
      }
    }
    // Sorted by slug so the committed diff stays stable between runs.
    await writeJson(OUT_JSON, Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b))));
  }

  const secs = ((Date.now() - started) / 1000).toFixed(0);
  log(`done: ${ok} ok (${thin} below the effort floor), ${failed} failed in ${secs}s. total ${Object.keys(current).length}/${seed.length}`);
}

/** One city, verbose, nothing written — the first thing to run on a local
 *  machine to confirm the query shapes before committing to a long batch. */
async function probe() {
  const seed = await loadSeed();
  const city = seed.find((c) => c.slug === (ONLY_SLUG ?? "lyon"));
  if (!city) { log(`unknown slug: ${ONLY_SLUG}`); return; }
  log(`probing ${city.slug} (${city.latitude}, ${city.longitude}) — nothing will be written`);
  const row = await crawlOne(city, { verbose: true });
  log(JSON.stringify(row, null, 2));
}

/**
 * Backfills the vernacular names missing from the rows already in
 * data/city-biodiversity.json — without recrawling a single city.
 *
 * The corpus holds 6 480 `topSpecies` entries but only **412 distinct species
 * keys**, because the top species of one city are the top species of its
 * neighbours. So the whole hole costs ~412 species lookups (a quarter of an
 * hour at one request a second), against ~7 h for a `--force` pass over the 540
 * cities that would re-measure everything else for nothing.
 *
 * Idempotent by construction: it only ever fills a null, so running it twice
 * changes nothing the second time, and a name GBIF simply does not have stays
 * null rather than being invented.
 */
async function backfillVernacular() {
  const current = (await readJson(OUT_JSON, {})) ?? {};
  const rows = Object.values(current);
  if (!rows.length) { log("data/city-biodiversity.json is empty — nothing to backfill"); return; }

  // One entry per species key, ordered by how many cities display it, so a pass
  // cut short by the runner's timeout has fixed the most-read names first.
  const need = new Map();
  let entries = 0;
  for (const row of rows) {
    for (const sp of row.topSpecies ?? []) {
      entries++;
      // A code counts as missing: it is what the backfill exists to clear.
      const holed =
        sp.scientificName == null ||
        [sp.vernacularFr, sp.vernacularEn].some((n) => n == null || isVernacularCode(n));
      if (!holed) continue;
      need.set(sp.key, (need.get(sp.key) ?? 0) + 1);
    }
  }
  const keys = [...need.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  // Unlike a crawl batch, the default here is "all of them": the whole hole is
  // ~412 lookups, and leaving a locale half-named is worse than either extreme.
  const batch = keys.slice(0, opt("limit") ? Number(opt("limit")) : keys.length);

  log(`corpus: ${rows.length} cities, ${entries} species entries`);
  log(`missing a name: ${keys.length} distinct species keys`);
  log(`batch: ${batch.length} lookups this run`);
  if (!batch.length) { log("nothing to do"); return; }

  const save = async () =>
    writeJson(OUT_JSON, Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b))));

  let filled = 0, looked = 0, failed = 0, streak = 0;
  const started = Date.now();
  for (const [i, key] of batch.entries()) {
    let info;
    try {
      info = await speciesInfo(key);
      looked++;
      streak = 0;
    } catch (err) {
      failed++;
      streak++;
      log(`  [${i + 1}/${batch.length}] ${key} — FAILED: ${err.message}`);
      if (err.message.includes("blocked at proxy layer")) {
        log("GBIF is blocked by the environment's egress policy — aborting run.");
        break;
      }
      // An egress wall does not always announce itself as a CONNECT refusal:
      // this environment's proxy answers a plain HTTP 403 on every request, so
      // without this the pass would log 412 identical failures and still exit 0.
      if (streak >= 5) {
        log(`${streak} consecutive failures — GBIF is not answering, aborting run.`);
        break;
      }
      continue;
    }
    let touched = 0;
    for (const row of rows) {
      for (const sp of row.topSpecies ?? []) {
        if (sp.key === key && fillNames(sp, info)) touched++;
      }
    }
    filled += touched;
    log(
      `  [${i + 1}/${batch.length}] ${key} ${info.scientificName ?? "?"} — ` +
      `fr=${info.vernacularFr ?? "—"} / en=${info.vernacularEn ?? "—"} → ${touched} entrée(s)`,
    );
    if ((i + 1) % 25 === 0) await save();
  }
  await save();

  const still = { fr: 0, en: 0 };
  for (const row of rows) for (const sp of row.topSpecies ?? []) {
    if (sp.vernacularFr == null) still.fr++;
    if (sp.vernacularEn == null) still.en++;
  }
  const secs = ((Date.now() - started) / 1000).toFixed(0);
  log(`done: ${looked} looked up, ${failed} failed, ${filled} entries filled in ${secs}s`);
  log(`  still without a French name: ${still.fr}/${entries}`);
  log(`  still without an English name: ${still.en}/${entries}`);
  log("  (a name GBIF does not publish stays null — the surfaces fall back to the scientific name)");
  // A pass that looked nothing up did not succeed, whatever the shell thinks:
  // exiting 0 here is how a dead stage stays invisible in the nightly runner.
  if (looked === 0 && failed > 0) {
    log("nothing could be looked up — reporting failure so the runner does not call this a pass");
    process.exitCode = 1;
  }
}

/**
 * Les comptes qu'un plafond de pagination peut couper : le drapeau qui le dit,
 * et le budget de pages de la facette qui les produit. Chaque paire doit
 * exister — un compte sans drapeau part sur les pages comme un total, et
 * personne ne peut le voir. C'est ce qui a mis « 2 000 naturalistes » sur 101
 * villes jusqu'au 2026-09-07, pendant que le tableau de chiffres de la même page
 * affichait « 2 000+ » deux écrans plus bas.
 *
 * Le budget est ici et **pas au point d'appel** : c'est la seule façon que le
 * contrôle ne dérive pas de la collecte le jour où l'un des deux bouge.
 */
const FLOOR_FIELDS = [
  ["species", "speciesTruncated", () => FACET_PAGES],
  ["observers", "observersTruncated", () => 2],
  ["datasets", "datasetsTruncated", () => 2],
  ["threatenedSpecies", "threatenedSpeciesTruncated", () => 2],
];
/** Budget de pages de la facette d'un grand groupe. */
const GROUP_FACET_PAGES = 3;

/** Budget de pages d'une facette, lu dans `FLOOR_FIELDS` par le collecteur
 *  comme par le contrôle — une seule définition, donc pas de dérive. */
function facetPages(field) {
  const row = FLOOR_FIELDS.find(([c]) => c === field);
  if (!row) throw new Error(`no facet budget for "${field}"`);
  return row[2]();
}

/**
 * Lignes dont un compte a **épuisé tout le budget de pages** de sa facette sans
 * porter son drapeau de troncature — donc un plafond publié comme un total.
 *
 * Le test porte sur `pages × FACET_LIMIT` et non sur un multiple quelconque de
 * `FACET_LIMIT` : un compte peut légitimement tomber pile sur un millier tant
 * qu'il restait des pages à demander, et la version large de ce contrôle
 * accusait à tort saint-gaudens (1 000 plantes pour 3 pages disponibles) et
 * stains (4 000 espèces pour 6). Un compte qui vaut exactement le budget entier,
 * lui, ne peut pas être un hasard de plus d'une chance sur mille et se sait :
 * `facetAll` n'a plus rien pu demander.
 *
 * ⚠️ Une ligne rejouée avec `--facet-pages` relevé a un autre budget : le
 * contrôle la lira contre celui d'aujourd'hui. Il alerte, il ne bloque pas.
 *
 * Fonction pure : `selftest` l'exerce hors ligne, `stats` la passe sur le corpus.
 */
function floorViolations(rows, limit = FACET_LIMIT) {
  const out = [];
  for (const [slug, row] of Object.entries(rows)) {
    for (const [count, flag, pages] of FLOOR_FIELDS) {
      const v = row?.[count];
      if (typeof v !== "number" || v === 0 || v !== pages() * limit) continue;
      if (row[flag] !== true) out.push({ slug, field: count, value: v });
    }
    for (const [g, v] of Object.entries(row?.groups ?? {})) {
      if (typeof v !== "number" || v === 0 || v !== GROUP_FACET_PAGES * limit) continue;
      if (!(row.groupsTruncated ?? []).includes(g)) out.push({ slug, field: `groups.${g}`, value: v });
    }
  }
  return out;
}

async function showStats() {
  const seed = await loadSeed();
  const current = (await readJson(OUT_JSON, {})) ?? {};
  const rows = Object.values(current);
  const measurable = rows.filter((r) => r.rarefied != null).length;
  log(`covered ${rows.length}/${seed.length} cities`);
  log(`  measurable (≥ ${RAREFY_N} observations): ${measurable}`);
  log(`  below the effort floor: ${rows.length - measurable}`);
  // Nommer les comptes plafonnés, pas seulement celui des espèces : chacun de
  // ces chiffres est publié tel quel sur la page ville et sa jumelle EN, et un
  // plafond publié comme un total est un mensonge silencieux.
  for (const [count, flag] of FLOOR_FIELDS) {
    const n = rows.filter((r) => r[flag] === true).length;
    if (n) log(`  "${count}" facet truncated (published as a floor): ${n}`);
  }
  const gTrunc = rows.flatMap((r) => r.groupsTruncated ?? []);
  for (const g of new Set(gTrunc)) {
    log(`  group "${g}" truncated (published as a floor): ${gTrunc.filter((x) => x === g).length}`);
  }
  const viol = floorViolations(current);
  for (const v of viol) {
    log(`  ⚠️  ${v.slug}: ${v.field} = ${v.value} sits on a facet-page boundary with no truncation flag`);
  }
  // Named per locale, because a hole on one side only is exactly how the EN
  // pages spent a month listing Latin names without anything complaining.
  const all = rows.flatMap((r) => r.topSpecies ?? []);
  const distinct = new Set(all.map((s) => s.key)).size;
  const named = (f) => all.filter((s) => s[f] != null).length;
  log(`  species entries: ${all.length} (${distinct} distinct keys)`);
  log(`    with a French name: ${named("vernacularFr")}/${all.length}`);
  log(`    with an English name: ${named("vernacularEn")}/${all.length}`);
  // A ringing alpha code is not a name. Rows written before 2026-09-10 hold
  // them (`pickVernacular` took the first eng entry, which is the code for the
  // commonest birds); the surfaces refuse them, and this count must fall to
  // zero as the replay works through the corpus.
  for (const f of ["vernacularFr", "vernacularEn"]) {
    const codes = all.filter((s) => s[f] && isVernacularCode(s[f]));
    if (!codes.length) continue;
    const taxa = [...new Set(codes.map((s) => `${s[f]} (${s.scientificName})`))];
    log(`    ⚠️  ${codes.length} ${f} entries are ringing codes, not names — ${taxa.length} taxa`);
    log(`        ${taxa.slice(0, 6).join(", ")}${taxa.length > 6 ? ", …" : ""}`);
  }

  // Named, not counted. A bin that reaches a city's top list is the difference
  // between "the species you are most likely to see" and a filing cabinet: at
  // saint-laurent-du-maroni `Animalia spec` held rank 1 with 1,058 records
  // against 58 for the real runner-up. The surfaces drop it from the list and
  // publish its share instead, but the count of DISTINCT SPECIES on that row
  // still includes it — and so does the rarefaction vector, which is consumed
  // here and not kept, so it cannot be netted out after the fact. Fixing that
  // needs a recrawl that excludes the bins at facet-read time.
  const withBins = Object.entries(current)
    .map(([slug, r]) => [slug, (r.topSpecies ?? []).filter(isPlaceholderTaxon), r])
    .filter(([, bins]) => bins.length > 0);
  for (const [slug, bins, r] of withBins) {
    const n = bins.reduce((a, s) => a + s.count, 0);
    const rank = (r.topSpecies ?? []).findIndex(isPlaceholderTaxon) + 1;
    const pct = r.occurrences > 0 ? ((100 * n) / r.occurrences).toFixed(2) : "?";
    log(
      `  ⚠️  ${slug}: unidentified bin ${bins.map((s) => `"${s.scientificName}"`).join(", ")} ` +
      `at rank ${rank} of the top list — ${n} records (${pct} % of the city), counted as a species`,
    );
  }

  const stale = rows.filter((r) => (r.queryVersion ?? 1) < QUERY_VERSION).length;
  if (stale) log(`  below queryVersion ${QUERY_VERSION} (queued for replay): ${stale}`);

  // A group that is empty on EVERY city is a query bug, not a fact about
  // France: that is how reptiles read 0 on all 540 rows for a month while the
  // pages simply dropped the row. Named here so the next one is loud.
  for (const g of GROUPS) {
    const measured = rows.filter((r) => (r.groups?.[g.id] ?? null) != null);
    const nonZero = measured.filter((r) => r.groups[g.id] > 0).length;
    if (measured.length && nonZero === 0) {
      log(`  ⚠️  group "${g.id}" is 0 on all ${measured.length} measured cities — suspect the query, not the wildlife`);
    }
  }
}

/* ── selftest ───────────────────────────────────────────────────────────── */

/**
 * Offline checks on the two pieces that can fail silently: the facet reader and
 * the rarefaction. Neither touches the network, so this runs in the cloud
 * runner where api.gbif.org is walled off — which is the point. A crawl is a
 * one-shot local pass that commits 60 cities at a time; the arithmetic has to
 * be known-good before it starts, not inspected afterwards.
 *
 * Mirrors `protected-areas:selftest`.
 */
async function selftest() {
  const current = (await readJson(OUT_JSON, {})) ?? {};
  let failed = 0;
  const check = (name, cond, detail = "") => {
    if (cond) return log(`  ✓ ${name}`);
    failed++;
    log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  };
  const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

  log("lgamma");
  check("lgamma(1) = 0", near(lgamma(1), 0));
  check("lgamma(2) = 0", near(lgamma(2), 0));
  check("lgamma(6) = ln(120)", near(lgamma(6), Math.log(120)));
  check("lgamma(0.5) = ln(√π)", near(lgamma(0.5), Math.log(Math.sqrt(Math.PI))));

  log("pickFacet");
  const payload = {
    count: 42,
    facets: [
      { field: "SPECIES_KEY", counts: [{ name: "1", count: 7 }, { name: "2", count: 3 }] },
    ],
  };
  // The response echoes SPECIES_KEY for a speciesKey request: the underscore is
  // why a plain toLowerCase() comparison silently found nothing.
  check("matches SPECIES_KEY against speciesKey", pickFacet(payload, "speciesKey")?.length === 2);
  check("sums to the facet total", pickFacet(payload, "speciesKey").reduce((s, c) => s + c.count, 0) === 10);
  check("matches RECORDED_BY against recordedBy",
    pickFacet({ facets: [{ field: "RECORDED_BY", counts: [{ name: "a", count: 1 }] }] }, "recordedBy")?.length === 1);
  check("absent facet → null (not an empty result)", pickFacet(payload, "datasetKey") === null);
  check("facet-less payload → null", pickFacet({ count: 0 }, "speciesKey") === null);
  check("null payload → null", pickFacet(null, "speciesKey") === null);
  check("present but empty facet → []",
    pickFacet({ facets: [{ field: "SPECIES_KEY", counts: [] }] }, "speciesKey")?.length === 0);

  log("floorViolations");
  // Le défaut visé (2026-09-07) : un compte arrêté par la pagination publié
  // comme un total. Le drapeau existe, il n'était simplement pas lu — et pour
  // `datasets` / `threatenedSpecies` il n'était même pas écrit.
  const capped = { paris: { observers: 2000, observersTruncated: true, groups: {}, groupsTruncated: [] } };
  const lying = { paris: { observers: 2000, observersTruncated: false, groups: {}, groupsTruncated: [] } };
  check("a flagged cap is not a violation", floorViolations(capped).length === 0);
  check("a cap with no flag is one", floorViolations(lying).length === 1);
  check("  …and names the field", floorViolations(lying)[0].field === "observers");
  check("a count away from the boundary is fine",
    floorViolations({ a: { observers: 1992, observersTruncated: false, groups: {}, groupsTruncated: [] } }).length === 0);
  check("zero is not a truncation",
    floorViolations({ a: { species: 0, speciesTruncated: false, groups: {}, groupsTruncated: [] } }).length === 0);
  check("a truncated group needs its entry in groupsTruncated",
    floorViolations({ a: { groups: { insects: 3000 }, groupsTruncated: [] } }).length === 1);
  check("  …and is clean when it has it",
    floorViolations({ a: { groups: { insects: 3000 }, groupsTruncated: ["insects"] } }).length === 0);
  check("a null group count is not a violation",
    floorViolations({ a: { groups: { reptiles: null }, groupsTruncated: [] } }).length === 0);
  check("the four capped counts all have a flag paired",
    FLOOR_FIELDS.length === 4 && FLOOR_FIELDS.every(([c, f]) => f === `${c}Truncated`));
  // Le contrôle large accusait deux villes à tort : un compte peut tomber pile
  // sur un millier tant qu'il restait des pages à demander.
  check("a round count with pages left is not a violation",
    floorViolations({ a: { species: 4000, speciesTruncated: false, groups: { plants: 1000 }, groupsTruncated: [] } }).length === 0);
  // Le collecteur doit écrire les quatre drapeaux : deux étaient calculés puis
  // jetés, et un plafond atteint serait parti muet sur 540 pages.
  const src = fsSync.readFileSync(new URL(import.meta.url), "utf8");
  check("the collector writes every truncation flag it can compute",
    FLOOR_FIELDS.every(([, f]) => new RegExp(`^\\s+${f}:`, "m").test(src)),
    FLOOR_FIELDS.filter(([, f]) => !new RegExp(`^\\s+${f}:`, "m").test(src)).map(([, f]) => f).join(", "));

  log("pickVernacular");
  // The bug this pins (2026-09-03): the English name was read from the species
  // record's own `vernacularName`, not from this list — 0 hits on 412 species.
  const vn = [
    { language: "fra", vernacularName: "Mésange charbonnière" },
    { language: "eng", vernacularName: "Great Tit" },
  ];
  check("finds the French name", pickVernacular(vn, ["fra", "fr"]) === "Mésange charbonnière");
  check("finds the English name", pickVernacular(vn, ["eng", "en"]) === "Great Tit");
  check("accepts the two-letter code",
    pickVernacular([{ language: "en", vernacularName: "Robin" }], ["eng", "en"]) === "Robin");
  check("is case-insensitive on the language tag",
    pickVernacular([{ language: "ENG", vernacularName: "Robin" }], ["eng", "en"]) === "Robin");
  check("prefers the entry flagged preferred",
    pickVernacular(
      [
        { language: "eng", vernacularName: "Wood Pigeon" },
        { language: "eng", vernacularName: "Common Wood-pigeon", preferred: true },
      ],
      ["eng", "en"],
    ) === "Common Wood-pigeon");
  check("falls back to the first when none is preferred",
    pickVernacular(
      [
        { language: "eng", vernacularName: "Wood Pigeon" },
        { language: "eng", vernacularName: "Ringdove" },
      ],
      ["eng", "en"],
    ) === "Wood Pigeon");
  check("another language is not a match", pickVernacular(vn, ["deu", "de"]) === null);
  // The 2026-09-10 defect: the ringing alpha code sits FIRST in the eng list for
  // Parus major, so "first wins" published GRTI on 497 EN pages.
  check("skips a ringing code even when it comes first",
    pickVernacular(
      [
        { language: "eng", vernacularName: "GRTI" },
        { language: "eng", vernacularName: "Great Tit" },
      ],
      ["eng", "en"],
    ) === "Great Tit");
  check("a code with a space is one too (the chaffinch's \"C F\")",
    pickVernacular([{ language: "eng", vernacularName: "C F" }], ["eng", "en"]) === null);
  check("a code alone yields no name, not a code",
    pickVernacular([{ language: "eng", vernacularName: "COST" }], ["eng", "en"]) === null);
  check("a real name in caps-free prose survives", isVernacularCode("Great Tit") === false);
  check("a digit keeps a name readable (\"7-spot Ladybird\")",
    isVernacularCode("7-spot Ladybird") === false);
  check("a long acronym-shaped string is not treated as a code",
    isVernacularCode("ABCDEFG") === false);
  // The rows already written still carry codes — that is reported by `stats`,
  // not asserted here: a check that cannot fail is noise in a harness whose
  // count is read as a measure of coverage.
  check("an entry with no name is not a match",
    pickVernacular([{ language: "eng" }], ["eng", "en"]) === null);
  check("empty list → null", pickVernacular([], ["eng", "en"]) === null);
  check("absent list → null", pickVernacular(undefined, ["eng", "en"]) === null);

  log("fillNames — the backfill merge rule");
  const kept = { key: 1, scientificName: "Columba palumbus", vernacularFr: "Palombe", vernacularEn: null };
  const changed = fillNames(kept, {
    scientificName: "Something else",
    vernacularFr: "Pigeon ramier",
    vernacularEn: "Common Wood-pigeon",
  });
  check("fills the missing name", kept.vernacularEn === "Common Wood-pigeon");
  check("never overwrites a name already displayed", kept.vernacularFr === "Palombe");
  check("never overwrites the scientific name", kept.scientificName === "Columba palumbus");
  check("reports that it changed something", changed === true);
  const unknown = { key: 2, scientificName: "Animalia spec", vernacularFr: null, vernacularEn: null };
  check("a name GBIF does not have stays null",
    fillNames(unknown, { vernacularFr: null, vernacularEn: null }) === false &&
      unknown.vernacularEn === null);
  // The one exception to "never overwrite", added 2026-09-10: a stored ringing
  // code is not a name. Without it the 1,281 "GRTI" cards would need a full
  // recrawl to clear, since the hole-filling rule sees a non-null string.
  const coded = { key: 3, scientificName: "Parus major", vernacularFr: "Mésange charbonnière", vernacularEn: "GRTI" };
  check("a stored ringing code IS replaced by a real name",
    fillNames(coded, { vernacularEn: "Great Tit" }) === true && coded.vernacularEn === "Great Tit");
  check("  …and the French name beside it is left alone",
    coded.vernacularFr === "Mésange charbonnière");
  const stillCoded = { key: 4, scientificName: "Sturnus vulgaris", vernacularFr: null, vernacularEn: "COST" };
  check("a code is never replaced by another code",
    fillNames(stillCoded, { vernacularEn: "COSTA" }) === false && stillCoded.vernacularEn === "COST");
  check("nor blanked when GBIF returns nothing",
    fillNames(stillCoded, { vernacularEn: null }) === false && stillCoded.vernacularEn === "COST");

  log("taxon groups");
  // The 2026-09-03 defect: a class key that matches nothing empties its bucket
  // and nothing complains. Reptiles must go through name resolution, and no
  // group may carry the Reptilia key that produced 0 on all 540 cities.
  const reptiles = GROUPS.find((g) => g.id === "reptiles");
  check("reptiles are resolved by name, not by a hardcoded key",
    (reptiles?.taxa?.length ?? 0) > 0 && !reptiles?.taxonKeys?.length);
  check("reptiles cover the three orders GBIF actually uses",
    ["Squamata", "Testudines", "Crocodylia"].every((t) => reptiles.taxa.includes(t)));
  check("no group is queried through Reptilia (358) any more",
    GROUPS.every((g) => !(g.taxonKeys ?? []).includes(358)));
  check("every group has one source of keys or the other",
    GROUPS.every((g) => (g.taxonKeys?.length ?? 0) > 0 || (g.taxa?.length ?? 0) > 0));
  check("the six groups are the six the surfaces render",
    GROUPS.map((g) => g.id).join(",") === "birds,mammals,insects,amphibians,reptiles,plants");

  log("unidentified bins");
  // The defect of 2026-09-10: this exact string sat at rank 1 of
  // saint-laurent-du-maroni's "species you are most likely to see", and the
  // selftest above already used it as a name-fill example without anyone
  // noticing it is not a species at all.
  check("\"Animalia spec\" is a bin, not a species",
    isPlaceholderTaxon({ scientificName: "Animalia spec" }));
  check("so is \"Insecta spec\"", isPlaceholderTaxon({ scientificName: "Insecta spec" }));
  check("so is an abbreviated \"Carex sp.\"", isPlaceholderTaxon({ scientificName: "Carex sp." }));
  check("a bare higher rank is one too", isPlaceholderTaxon({ scientificName: "Aves" }));
  // A shape test cannot do this job: the bin is spelled exactly like a binomial.
  check("the bin passes a Latin-binomial shape test — which is why shape is not enough",
    /^[A-Z][a-z]+ [a-z]+$/.test("Animalia spec"));
  check("a real binomial is kept", !isPlaceholderTaxon({ scientificName: "Pitangus sulphuratus" }));
  check("a trinomial is kept",
    !isPlaceholderTaxon({ scientificName: "Motacilla alba alba" }));
  check("an epithet that merely starts with 'sp' is kept",
    !isPlaceholderTaxon({ scientificName: "Carex spicata" }) &&
      !isPlaceholderTaxon({ scientificName: "Buteo speciosus" }));
  check("a missing name is not a bin (the surface falls back to the key)",
    !isPlaceholderTaxon({ scientificName: null }));
  // The corpus, so a new bin shows up here and not on a city page.
  const binRows = Object.entries(current ?? {}).filter(([, r]) =>
    (r.topSpecies ?? []).some(isPlaceholderTaxon),
  );
  check(
    `the corpus carries ${binRows.length} row(s) with a bin in the top list`,
    binRows.length <= 2,
    `${binRows.map(([s]) => s).join(", ")} — run stats, then check the surfaces name them`,
  );

  log("rarefaction — closed forms");
  // Enumerated by hand: subsamples of 2 from {A,A,B,B} are AA, BB and 4×AB,
  // so E[S] = (1 + 1 + 4×2) / 6 = 5/3.
  const two = rarefy([{ count: 2 }, { count: 2 }], 2);
  check("E[S_2] on {A,A,B,B} = 5/3", two.value === 1.7, `got ${two.value}`);
  check("  …and is flagged exact", two.exact === true);
  // Drawing the whole community must return every species.
  check("n = N → all species", rarefy([{ count: 3 }, { count: 1 }], 4).value === 2);
  // A single individual is exactly one species, whatever the distribution.
  check("n = 1 → 1 species", rarefy([{ count: 3 }, { count: 1 }], 1).value === 1);

  log("rarefaction — refusals");
  const thin = rarefy([{ count: 10 }], 500);
  check("below the subsample size → null", thin.value === null && thin.reason === "below-floor");
  const unb = rarefy([{ count: 900 }, { count: 100 }], 500, { truncated: true });
  check("truncated with no total → null", unb.value === null && unb.reason === "unbounded");

  log("rarefaction — truncation bounds");
  // A deterministic long-tailed community: a few common species, a long tail of
  // singletons. Shaped like a real city, and the tail is what a facet cap eats.
  const full = [];
  for (let i = 1; i <= 400; i++) full.push({ count: Math.max(1, Math.round(5000 / i)) });
  const N = full.reduce((s, c) => s + c.count, 0);
  const exact = rarefy(full, 500);
  check("full vector is exact", exact.exact === true && exact.value > 0);

  // Now simulate the page cap: keep only the head, but hand rarefy the true
  // community size. This is the case the 2026-08-02 fix is about.
  const head = full.slice(0, 120);
  const cut = rarefy(head, 500, { total: N, truncated: true });
  check("truncated is not flagged exact", cut.exact === false);
  check(
    "lower bound ≤ true value",
    cut.value <= exact.value,
    `lower ${cut.value} vs true ${exact.value}`,
  );
  check(
    "upper bound ≥ true value",
    cut.upper >= exact.value,
    `upper ${cut.upper} vs true ${exact.value}`,
  );
  // The old code's mistake, reproduced: rarefying the head against the head's
  // own sum overstates. If this ever stops being true the bug is back.
  const naive = rarefy(head, 500);
  check(
    "head-against-head overstates the lower bound",
    naive.value > cut.value,
    `naive ${naive.value} vs bounded ${cut.value}`,
  );

  log("rarefaction — monotonicity in N");
  const small = rarefy(head, 500, { total: N, truncated: true }).value;
  const big = rarefy(head, 500, { total: N * 4, truncated: true }).value;
  check("larger community → lower expected richness", big < small, `${big} vs ${small}`);

  log(failed ? `\n${failed} check(s) FAILED` : "\nall checks passed");
  if (failed) process.exitCode = 1;
}

/* ── run ────────────────────────────────────────────────────────────────── */

// Guarded so the pure helpers above (rarefy, lgamma) can be imported and tested
// without the CLI firing a crawl on import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (cmd === "stats") await showStats();
  else if (cmd === "selftest") await selftest();
  else if (cmd === "probe") await probe();
  else if (cmd === "vernacular") await backfillVernacular();
  else await crawlBatch();
}
