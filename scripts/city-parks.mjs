#!/usr/bin/env node
/**
 * F59 — Parks & green-space pipeline for the 540 seed cities.
 *
 *   node scripts/city-parks.mjs               # crawl the next ~60 uncovered cities, biggest first
 *   node scripts/city-parks.mjs --limit=20    # cap the batch (default 60)
 *   node scripts/city-parks.mjs --slug=paris  # crawl a single city
 *   node scripts/city-parks.mjs --force       # re-crawl even cities already in the JSON
 *   node scripts/city-parks.mjs stats         # what's in data/city-parks.json today
 *
 * Source: OpenStreetMap via the Overpass API. One query per commune, anchored on
 * the admin area whose "ref:INSEE" matches the seed. We keep parks, public
 * gardens and playgrounds — only when they carry a name (an anonymous polygon
 * is not a destination). We cap at ~40 parks per city, largest first.
 *
 * Overpass etiquette:
 *   — ≥ 2.5 s between calls, honour Retry-After on 429/504, exponential backoff.
 *   — Contactable User-Agent (Wikimedia's rule; OSM follows the same convention).
 *   — Ready to fall back to a mirror if the main endpoint keeps failing.
 *
 * Resumability under the cloud-runner constraint:
 *   The .cache/ folder is gitignored and each scheduled run starts from a fresh
 *   checkout — the local cache does NOT survive between runs. What DOES survive
 *   is data/city-parks.json, which is committed as we go. Each run crawls the
 *   biggest cities still missing from the JSON, one batch, one commit. That is
 *   how a multi-hour crawl is broken into several runs.
 *
 * ODbL: the data returned by OSM is © OpenStreetMap contributors under the Open
 * Database License. Any page rendering these entries MUST show the attribution
 * with them, at parity with the Commons credits on components/CityPhoto.tsx.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, ".cache", "city-parks");
const RAW_DIR = path.join(CACHE_DIR, "overpass");
const OUT_JSON = path.join(ROOT, "data", "city-parks.json");
const SEED_TS = path.join(ROOT, "data", "cities-seed.ts");

const UA =
  "MaVilleIdeale/1.0 (https://www.mavilleideale.fr; daitenkutarojurai@gmail.com) node-fetch";

// Ordered — main endpoint first, community mirrors as fallback. If every host
// on this list 403s, the cloud runner's egress policy is blocking OSM outright
// (report that back to the user, do not silently succeed).
const OVERPASS_HOSTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.osm.jp/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
];

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--")) ?? "crawl";
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const LIMIT = Number(opt("limit") ?? 60);
const ONLY_SLUG = opt("slug") ?? null;
const FORCE = flag("force");
const PARKS_PER_CITY = 40;
const MIN_SLEEP_MS = 2500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

/* ── seed loader ────────────────────────────────────────────────────────── */

/**
 * Extracts { slug, name, inseeCode, latitude, longitude, population } for the
 * 540 seed cities. We parse the source rather than importing it, because the
 * seed module runs calibration + z-score rescaling at load time (2 s+ on cold
 * start) — a plain regex pass is instant and keeps this script an mjs.
 */
async function loadSeed() {
  const src = await fs.readFile(SEED_TS, "utf8");
  const out = [];
  const blocks = src.split(/\n {2}\{\n/).slice(1);
  for (const b of blocks) {
    const s = (k) => b.match(new RegExp(`${k}:\\s*"([^"]+)"`))?.[1] ?? null;
    const n = (k) => {
      const m = b.match(new RegExp(`${k}:\\s*(-?[\\d.]+)`));
      return m ? Number(m[1]) : null;
    };
    const slug = s("slug");
    const insee = s("inseeCode");
    if (!slug || !insee) continue;
    out.push({
      slug,
      name: s("name"),
      inseeCode: insee,
      latitude: n("latitude"),
      longitude: n("longitude"),
      population: n("population") ?? 0,
    });
  }
  return out;
}

/* ── HTTP with backoff ──────────────────────────────────────────────────── */

/** Overpass query with per-host retry + exponential backoff on 429/50x. */
async function overpass(query) {
  let lastErr = null;
  for (const host of OVERPASS_HOSTS) {
    for (let i = 0; i < 4; i++) {
      let res;
      try {
        res = await fetch(host, {
          method: "POST",
          headers: {
            "User-Agent": UA,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: "data=" + encodeURIComponent(query),
        });
      } catch (err) {
        lastErr = err;
        // Network hiccup — retry the same host with backoff. If every host on
        // the list also fails at the network layer, we bubble up.
        await sleep(2 ** i * 1500);
        continue;
      }
      if (res.ok) {
        try {
          return await res.json();
        } catch (err) {
          lastErr = err;
          await sleep(2 ** i * 1500);
          continue;
        }
      }
      if (res.status === 403 || res.status === 407) {
        // Egress policy denial (organization proxy). Retrying is pointless and
        // trying every mirror just fills the failure log. Bubble up so the CLI
        // can surface a clear message.
        throw new Error(`Overpass blocked at proxy layer (${res.status}) — ${host}`);
      }
      const retryAfter = Number(res.headers.get("retry-after")) * 1000;
      if (i === 3) {
        lastErr = new Error(`${res.status} ${res.statusText} — ${host}`);
        break; // move on to the next mirror
      }
      await sleep(retryAfter || 2 ** i * 2000 + Math.random() * 500);
    }
  }
  throw lastErr ?? new Error("Overpass: all endpoints exhausted");
}

/* ── Overpass query + parsing ───────────────────────────────────────────── */

/**
 * Match the commune's admin area on ref:INSEE (5-digit Insee code), then pull
 * every named park / public garden / playground, both as ways and as multipolygon
 * relations. `out geom` returns node coordinates so we can compute area locally.
 *
 * Notes:
 *   — `garden:type=private|residential|personal|house` are excluded (backyards
 *     tagged as gardens are not destinations).
 *   — `access=private|no|customers` are excluded post-hoc (patrimonial private
 *     estates sometimes carry leisure=park).
 *   — timeout 90 s is generous but fair; the biggest cities can hit it.
 */
function buildQuery(insee) {
  return `[out:json][timeout:90];
area["ref:INSEE"="${insee}"][boundary=administrative][admin_level="8"]->.a;
(
  way["leisure"="park"]["name"](area.a);
  relation["leisure"="park"]["name"](area.a);
  way["leisure"="garden"]["name"](area.a);
  relation["leisure"="garden"]["name"](area.a);
  way["leisure"="playground"]["name"](area.a);
  relation["leisure"="playground"]["name"](area.a);
);
out geom;`;
}

const PRIVATE_GARDEN = new Set(["private", "residential", "personal", "house"]);
const CLOSED_ACCESS = new Set(["private", "no", "customers", "permit"]);

/** Equal-area planar approximation good to ~0.5 % over the size of a commune —
 *  we convert lat/lng to metres via the equirectangular projection at the ring's
 *  centre and apply the shoelace formula. That is enough precision for sorting;
 *  the values are stored in m² and truncated to the nearest integer. */
function ringAreaM2(ring) {
  if (!ring || ring.length < 3) return 0;
  const lat0 = ring.reduce((s, p) => s + p.lat, 0) / ring.length;
  const cos = Math.cos((lat0 * Math.PI) / 180);
  const M_PER_DEG_LAT = 111_320;
  const M_PER_DEG_LNG = 111_320 * cos;
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const ax = a.lon * M_PER_DEG_LNG;
    const ay = a.lat * M_PER_DEG_LAT;
    const bx = b.lon * M_PER_DEG_LNG;
    const by = b.lat * M_PER_DEG_LAT;
    sum += ax * by - bx * ay;
  }
  return Math.abs(sum) / 2;
}

function centroidOf(ring) {
  if (!ring || ring.length === 0) return null;
  let sx = 0, sy = 0;
  for (const p of ring) { sx += p.lon; sy += p.lat; }
  return { lat: sy / ring.length, lng: sx / ring.length };
}

/** Best-effort parse of an Overpass "out geom" element into { area, center }.
 *  Ways carry a `geometry` array (a single closed ring). Relations carry a
 *  `members` array of `outer`/`inner` ways with their own `geometry`. We sum
 *  outer rings and subtract inner rings (holes) — same as OSM MultiPolygon. */
function extractShape(el) {
  if (el.type === "way" && Array.isArray(el.geometry)) {
    const ring = el.geometry;
    return { area: ringAreaM2(ring), center: centroidOf(ring) };
  }
  if (el.type === "relation" && Array.isArray(el.members)) {
    let area = 0;
    let anchor = null;
    for (const m of el.members) {
      if (!Array.isArray(m.geometry)) continue;
      const a = ringAreaM2(m.geometry);
      if (m.role === "outer") {
        area += a;
        if (!anchor) anchor = centroidOf(m.geometry);
      } else if (m.role === "inner") {
        area -= a;
      }
    }
    // Fall back to the `center` field Overpass computed if we could not
    // extract a ring at all (rare — relations with unresolved members).
    const center = anchor ?? (el.center ? { lat: el.center.lat, lng: el.center.lon } : null);
    return { area: Math.max(0, area), center };
  }
  return { area: 0, center: null };
}

const NORMALIZE_KIND = (leisure) => (leisure === "garden" ? "garden" : leisure === "playground" ? "playground" : "park");

function parkFromElement(el) {
  const t = el.tags ?? {};
  const name = t.name;
  if (!name) return null;
  const leisure = t.leisure;
  if (leisure === "garden" && t["garden:type"] && PRIVATE_GARDEN.has(t["garden:type"])) return null;
  if (t.access && CLOSED_ACCESS.has(t.access)) return null;
  const { area, center } = extractShape(el);
  if (!center) return null;
  return {
    osmId: `${el.type[0]}${el.id}`,          // "w123" / "r456" — stable, human-readable
    name,
    kind: NORMALIZE_KIND(leisure),
    lat: +center.lat.toFixed(5),
    lng: +center.lng.toFixed(5),
    areaM2: Math.round(area),
    playground: leisure === "playground" || t.playground === "yes",
    wheelchair: t.wheelchair === "yes" || t.wheelchair === "designated"
      ? true
      : t.wheelchair === "no"
      ? false
      : null,
    dog: t.dog === "yes" || t["dog"] === "leashed"
      ? true
      : t.dog === "no"
      ? false
      : null,
    drinkingWater: t.drinking_water === "yes" || t["drinking_water:legal"] === "yes",
    access: t.access ?? "public",
  };
}

/** De-dupe by (name, ~50 m proximity) — a park sometimes exists as both a way
 *  and a relation with the same name; keep the one with the larger area. */
function dedupe(parks) {
  const buckets = new Map();
  for (const p of parks) {
    const key = `${p.name.toLowerCase()}|${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`;
    const prev = buckets.get(key);
    if (!prev || prev.areaM2 < p.areaM2) buckets.set(key, p);
  }
  return [...buckets.values()];
}

async function crawlOne(city) {
  const query = buildQuery(city.inseeCode);
  await fs.mkdir(RAW_DIR, { recursive: true });
  const cacheFile = path.join(RAW_DIR, `${city.slug}.json`);

  let raw = null;
  if (!FORCE) {
    try { raw = JSON.parse(await fs.readFile(cacheFile, "utf8")); } catch {}
  }
  if (!raw) {
    raw = await overpass(query);
    await fs.writeFile(cacheFile, JSON.stringify(raw));
  }

  const elements = Array.isArray(raw.elements) ? raw.elements : [];
  const parks = dedupe(elements.map(parkFromElement).filter(Boolean));
  parks.sort((a, b) => b.areaM2 - a.areaM2);
  return parks.slice(0, PARKS_PER_CITY);
}

/* ── batch runner ───────────────────────────────────────────────────────── */

async function readJson(f, fallback) {
  try { return JSON.parse(await fs.readFile(f, "utf8")); } catch { return fallback; }
}
async function writeJson(f, data) {
  await fs.mkdir(path.dirname(f), { recursive: true });
  await fs.writeFile(f, JSON.stringify(data, null, 2) + "\n");
}

function pickBatch(cities, current) {
  const pool = ONLY_SLUG
    ? cities.filter((c) => c.slug === ONLY_SLUG)
    : cities.filter((c) => FORCE || !current[c.slug]);
  pool.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
  return pool.slice(0, LIMIT);
}

async function crawlBatch() {
  const seed = await loadSeed();
  const current = (await readJson(OUT_JSON, {})) ?? {};
  const batch = pickBatch(seed, current);

  log(`seed: ${seed.length} cities`);
  log(`state: ${Object.keys(current).length} already crawled, ${seed.length - Object.keys(current).length} remaining`);
  log(`batch: ${batch.length} cities this run (limit ${LIMIT})`);
  if (!batch.length) { log("nothing to do"); return; }

  let ok = 0, empty = 0, failed = 0;
  const started = Date.now();
  for (const [i, city] of batch.entries()) {
    try {
      const parks = await crawlOne(city);
      current[city.slug] = {
        crawledAt: new Date().toISOString().slice(0, 10),
        source: "openstreetmap",
        parks,
      };
      if (parks.length === 0) empty++;
      ok++;
      log(`  [${i + 1}/${batch.length}] ${city.slug} — ${parks.length} parcs${parks.length ? ` (top ${parks[0].name}, ${(parks[0].areaM2 / 10000).toFixed(1)} ha)` : ""}`);
    } catch (err) {
      failed++;
      log(`  [${i + 1}/${batch.length}] ${city.slug} — FAILED: ${err.message}`);
      // Egress-policy denials are terminal for this run — every subsequent
      // request will hit the same wall. Persist what we have and stop.
      if (err.message.includes("blocked at proxy layer")) {
        log("Overpass is blocked by the environment's egress policy — aborting run.");
        break;
      }
    }
    // Sort by slug so the committed diff is stable across runs.
    await writeJson(OUT_JSON, Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b))));
    if (i < batch.length - 1) await sleep(MIN_SLEEP_MS);
  }

  const secs = ((Date.now() - started) / 1000).toFixed(0);
  log(`done: ${ok} ok (${empty} empty), ${failed} failed in ${secs}s. total covered: ${Object.keys(current).length}/${seed.length}`);
}

async function showStats() {
  const seed = await loadSeed();
  const current = (await readJson(OUT_JSON, {})) ?? {};
  const covered = Object.keys(current).length;
  const totalParks = Object.values(current).reduce((s, c) => s + (c.parks?.length ?? 0), 0);
  const empty = Object.values(current).filter((c) => (c.parks?.length ?? 0) === 0).length;
  log(`covered ${covered}/${seed.length} cities, ${totalParks} parks (${empty} cities with zero named parks)`);
}

/* ── run ────────────────────────────────────────────────────────────────── */

if (cmd === "stats") await showStats();
else await crawlBatch();
