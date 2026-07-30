#!/usr/bin/env node
/**
 * F62 — Biodiversity pipeline for the 540 seed cities (GBIF half).
 *
 *   node scripts/city-biodiversity.mjs               # crawl the next ~60 uncovered cities
 *   node scripts/city-biodiversity.mjs --limit=20    # cap the batch (default 60)
 *   node scripts/city-biodiversity.mjs --slug=lyon   # crawl a single city
 *   node scripts/city-biodiversity.mjs --force       # re-crawl cities already in the JSON
 *   node scripts/city-biodiversity.mjs stats         # what's in data/city-biodiversity.json today
 *   node scripts/city-biodiversity.mjs probe         # one city, verbose — validates the query shape
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

/** Bumped when the query shape changes, so a stale cached row is recognisable. */
const QUERY_VERSION = 1;

const RADIUS_KM = 10;
const YEAR_FROM = 2015;
/** Subsample size for rarefaction, and the measurability floor. See header. */
const RAREFY_N = 500;
/** CC BY-NC excluded on purpose — the site is commercial. */
const LICENSES = ["CC0_1_0", "CC_BY_4_0"];
const TOP_SPECIES = 12;

/**
 * GBIF backbone keys for the groups we break richness down by. These are
 * stable identifiers in the GBIF taxonomic backbone, and `taxonKey` matches
 * descendants, so `212` is "every bird".
 * @unverified — confirm each key resolves to the expected name with
 * `curl https://api.gbif.org/v1/species/212` before trusting a batch.
 */
const GROUPS = [
  { id: "birds", taxonKey: 212, label: "Oiseaux" },
  { id: "mammals", taxonKey: 359, label: "Mammifères" },
  { id: "insects", taxonKey: 216, label: "Insectes" },
  { id: "amphibians", taxonKey: 131, label: "Amphibiens" },
  { id: "reptiles", taxonKey: 358, label: "Reptiles" },
  { id: "plants", taxonKey: 6, label: "Flore" },
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
    const counts = json?.facets?.find((f) => f.field?.toLowerCase() === field.toLowerCase())?.counts ?? [];
    out.push(...counts.map((c) => ({ name: c.name, count: c.count })));
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
 * subsample of `n` observations drawn from the observed community.
 *
 *   E[S_n] = Σ_i [ 1 − C(N − N_i, n) / C(N, n) ]
 *
 * i.e. one minus the probability that species i is absent from the subsample.
 * Evaluated through log-gamma because C(N, n) overflows a double well before
 * the counts we see in a city like Paris.
 *
 * Returns null when N < n — you cannot subsample more than you have, and a
 * silently degraded answer here would be exactly the invented figure this
 * project refuses.
 */
export function rarefy(counts, n) {
  const N = counts.reduce((s, c) => s + c.count, 0);
  if (N < n) return null;
  const lgN = lgamma(N + 1) - lgamma(N - n + 1);
  let expected = 0;
  for (const { count } of counts) {
    const m = N - count; // draws that avoid this species
    if (m < n) { expected += 1; continue; } // absence impossible → always present
    const logP = lgamma(m + 1) - lgamma(m - n + 1) - lgN;
    expected += 1 - Math.exp(logP);
  }
  return +expected.toFixed(1);
}

/* ── species naming ─────────────────────────────────────────────────────── */

/**
 * Scientific name, French vernacular name and IUCN category for a species key.
 * Cached on disk across cities and across runs: the top species of one city are
 * overwhelmingly the top species of its neighbours, so the cache turns a
 * per-city cost into a one-off one.
 */
async function speciesInfo(key) {
  await fs.mkdir(SPECIES_CACHE, { recursive: true });
  const file = path.join(SPECIES_CACHE, `${key}.json`);
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch {}

  const sp = await gbif(`/species/${key}`, []);
  await sleep(MIN_SLEEP_MS);
  let vernacularFr = null;
  try {
    const vn = await gbif(`/species/${key}/vernacularNames`, [["limit", "100"]]);
    const fr = (vn?.results ?? []).find((v) => v.language === "fra" || v.language === "fr");
    vernacularFr = fr?.vernacularName ?? null;
    await sleep(MIN_SLEEP_MS);
  } catch {
    // A missing vernacular list is not a failure: the scientific name stands
    // on its own and the surface falls back to it.
  }
  const info = {
    key: Number(key),
    scientificName: sp?.canonicalName ?? sp?.scientificName ?? null,
    vernacularFr,
    vernacularEn: sp?.vernacularName ?? null,
    kingdom: sp?.kingdom ?? null,
    class: sp?.class ?? null,
  };
  await fs.writeFile(file, JSON.stringify(info));
  return info;
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

  // 2. Effort. Distinct observers is the honest denominator: `recordedBy` is
  //    free text and therefore noisy (spelling variants inflate it), which is
  //    why it gates measurability rather than dividing anything.
  const observers = await facetAll(city, "recordedBy", [], 2);
  await sleep(MIN_SLEEP_MS);
  const datasets = await facetAll(city, "datasetKey", [], 2);
  await sleep(MIN_SLEEP_MS);
  say(`observers ${observers.counts.length}${observers.truncated ? "+" : ""}, datasets ${datasets.counts.length}`);

  // 3. Richness per group. Species, not occurrences — an occurrence split would
  //    just re-describe which group birdwatchers photograph most.
  const groups = {};
  const groupsTruncated = [];
  for (const g of GROUPS) {
    const r = await facetAll(city, "speciesKey", [["taxonKey", g.taxonKey]], 3);
    groups[g.id] = r.counts.length;
    if (r.truncated) groupsTruncated.push(g.id);
    await sleep(MIN_SLEEP_MS);
  }
  say(`groups ${JSON.stringify(groups)}`);

  // 4. Globally threatened species (IUCN VU/EN/CR).
  const threatenedParams = THREATENED.map((c) => ["iucnRedListCategory", c]);
  const threatened = await facetAll(city, "speciesKey", threatenedParams, 2);
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
    species: species.counts.length,
    speciesTruncated: species.truncated,
    // null when the city has fewer than RAREFY_N observations — see rarefy().
    rarefiedN: RAREFY_N,
    rarefied: rarefy(species.counts, RAREFY_N),
    groups,
    groupsTruncated,
    threatenedSpecies: threatened.counts.length,
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
  const pool = ONLY_SLUG
    ? seed.filter((c) => c.slug === ONLY_SLUG)
    : seed.filter((c) => FORCE || !current[c.slug]);
  pool.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
  const batch = pool.slice(0, LIMIT);

  log(`seed: ${seed.length} cities`);
  log(`state: ${Object.keys(current).length} already crawled, ${seed.length - Object.keys(current).length} remaining`);
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

async function showStats() {
  const seed = await loadSeed();
  const current = (await readJson(OUT_JSON, {})) ?? {};
  const rows = Object.values(current);
  const measurable = rows.filter((r) => r.rarefied != null).length;
  log(`covered ${rows.length}/${seed.length} cities`);
  log(`  measurable (≥ ${RAREFY_N} observations): ${measurable}`);
  log(`  below the effort floor: ${rows.length - measurable}`);
  log(`  species-facet truncated: ${rows.filter((r) => r.speciesTruncated).length}`);
}

/* ── run ────────────────────────────────────────────────────────────────── */

// Guarded so the pure helpers above (rarefy, lgamma) can be imported and tested
// without the CLI firing a crawl on import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (cmd === "stats") await showStats();
  else if (cmd === "probe") await probe();
  else await crawlBatch();
}
