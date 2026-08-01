#!/usr/bin/env node
/**
 * F62 phase 2 — protected areas (INPN / MNHN) for the 540 seed cities.
 *
 *   node scripts/city-protected-areas.mjs sources    # which files this needs, and where they come from
 *   node scripts/city-protected-areas.mjs selftest   # geometry checks against analytic answers
 *   node scripts/city-protected-areas.mjs probe --slug=lyon
 *   node scripts/city-protected-areas.mjs            # ingest → data/city-protected-areas.json
 *   node scripts/city-protected-areas.mjs stats
 *
 * ── Why this stage matters ────────────────────────────────────────────────
 *
 * It is the component that does NOT suffer the observation-effort bias. GBIF
 * richness measures, first of all, how many naturalists key in records; a
 * Natura 2000 perimeter exists whether or not anyone comes to look at it. That
 * is why it carries the heaviest weight in lib/biodiversity.ts, and why the
 * aggregate score stays null until this file has data.
 *
 * ── No network here ───────────────────────────────────────────────────────
 *
 * Unlike the GBIF crawler, this stage reads FILES, not an API. The INPN
 * zonings are published as national shapefile/GeoJSON downloads, which is what
 * a static build wants anyway: one download, then a deterministic local pass.
 * Put the layers in .cache/city-protected-areas/sources/ (or point --src at a
 * directory) and run the ingest. `sources` prints exactly what is expected.
 *
 * The cloud runner's egress policy refuses inpn.mnhn.fr and data.gouv.fr
 * (403 CONNECT, re-tested 2026-08-01), so the download step is a local pass —
 * same constraint as the Insee, Overpass and GBIF pipelines before it.
 *
 * ── Method: rasterise, don't sum ──────────────────────────────────────────
 *
 * Coverage is computed on a grid over the 15 km disc, not by adding up the
 * areas of the perimeters. French zonings overlap by construction — a ZNIEFF I
 * usually sits inside a ZNIEFF II, and Natura 2000 sites routinely overlap
 * both — so summing areas double-counts the same ground and can hand a city
 * "180 % coverage". Each grid cell instead keeps the STRONGEST protection that
 * covers it, so overlapping designations count once, at the level that
 * actually applies.
 *
 * Polygons are filled by scanline (one pass per grid row, spans between edge
 * crossings, even-odd rule so inner rings punch holes) rather than by testing
 * every cell against every edge — the difference is ~100×, and some ZNIEFF
 * perimeters carry thousands of vertices.
 *
 * ── Licence ───────────────────────────────────────────────────────────────
 *
 * INPN / MNHN, Licence Ouverte Etalab. Attribution ships with the figures on
 * every surface, exactly like the Commons credits on photos and the ODbL
 * notice on parks. Any surface rendering these numbers renders the credit.
 */
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, ".cache", "city-protected-areas");
const SOURCE_DIR = path.join(CACHE_DIR, "sources");
const OUT_JSON = path.join(ROOT, "data", "city-protected-areas.json");
const SEED_TS = path.join(ROOT, "data", "cities-seed.ts");

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--")) ?? "ingest";
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const ONLY_SLUG = opt("slug") ?? null;
const SRC_DIR = opt("src") ?? SOURCE_DIR;
const LIMIT = Number(opt("limit") ?? Infinity);

const log = (...a) => console.log(...a);

/* ── analysis parameters ─────────────────────────────────────────────────
 *
 * Keep in sync with PROTECTED_RADIUS_KM in lib/biodiversity.ts — the lib reads
 * radiusKm back out of the JSON and the two must agree.
 */

/** Wider than the 10 km GBIF radius on purpose: a protected massif 15 km out
 *  is part of the living environment, you go there on a Sunday. */
const RADIUS_KM = 15;
/** 250 m cells → 6.25 ha each, ~11 300 cells in the disc. Fine enough that a
 *  coverage percentage is precise to a few tenths, coarse enough that the
 *  whole national pass stays in minutes. */
const GRID_STEP_M = 250;
/** Perimeters listed per city. The coverage figures always use ALL of them;
 *  only the displayed list is capped, and the JSON records the true total. */
const AREAS_PER_CITY = 30;
/** Output format version — bump when the shape or the parameters change, so a
 *  half-old JSON is recognisable rather than silently mixed. */
const INGEST_VERSION = 1;

/**
 * Protection levels. A nature reserve bans and manages; a ZNIEFF is an
 * inventory with no regulatory force. Counting them equally would say that a
 * documentary zoning protects as much as a prefectural order.
 *
 * Mirrors PROTECTION_WEIGHT in lib/biodiversity.ts — the lib owns the display
 * weights, this copy exists so the rasteriser can resolve overlaps. If you
 * change one, change both.
 */
const PROTECTION_WEIGHT = {
  "reserve-naturelle": 1,
  "parc-national": 1,
  "arrete-biotope": 0.8,
  "natura-2000": 0.6,
  "parc-naturel-regional": 0.5,
  "znieff-1": 0.4,
  "znieff-2": 0.25,
};

/**
 * The layers to ingest, and how to recognise their files.
 *
 * `match` is tested against the lowercased filename, so the operator can drop
 * the INPN downloads in with whatever names they arrive under. `idFields` and
 * `nameFields` are tried in order against each feature's properties, with a
 * generic fallback (see pickField) — INPN attribute names differ from layer to
 * layer and between vintages.
 *
 * ⚠️ @unverified — written without access to the actual files (inpn.mnhn.fr is
 * blocked from this environment). The field-name candidates below are
 * best-effort. The ingest PRINTS the field it picked for each layer: check
 * those lines on the first local run before trusting a full pass. If a layer
 * shows `id: <none>` or a name that is obviously a code, add the real
 * attribute name here rather than letting it through.
 */
const LAYERS = [
  {
    kind: "reserve-naturelle",
    match: [/reserve.*naturelle/, /^rn[_-]/, /\brnn\b/, /\brnr\b/],
    idFields: ["ID_MNHN", "ID_LOCAL", "CODE_R_ENP", "GID"],
    nameFields: ["NOM_SITE", "NOM", "NOM_ENP", "LIB_ENP"],
  },
  {
    kind: "parc-national",
    match: [/parc.*national/, /^pn[_-]/],
    idFields: ["ID_MNHN", "ID_LOCAL", "CODE_R_ENP", "GID"],
    nameFields: ["NOM_SITE", "NOM", "NOM_ENP", "LIB_ENP"],
  },
  {
    kind: "parc-naturel-regional",
    match: [/parc.*(naturel.*regional|regional)/, /^pnr[_-]/],
    idFields: ["ID_MNHN", "ID_LOCAL", "CODE_R_ENP", "GID"],
    nameFields: ["NOM_SITE", "NOM", "NOM_ENP", "LIB_ENP"],
  },
  {
    kind: "arrete-biotope",
    match: [/biotope/, /^apb/, /^appb/],
    idFields: ["ID_MNHN", "ID_LOCAL", "CODE_R_ENP", "GID"],
    nameFields: ["NOM_SITE", "NOM", "NOM_ENP", "LIB_ENP"],
  },
  {
    // Both directives land in the same bucket: the habitats one (SIC/ZSC) and
    // the birds one (ZPS). Two files, one kind — they protect the same ground
    // under two headings and the grid resolves the overlap.
    kind: "natura-2000",
    match: [/natura/, /\bsic\b/, /\bzsc\b/, /\bzps\b/],
    idFields: ["SITECODE", "SITE_CODE", "CODE", "ID_MNHN"],
    nameFields: ["SITENAME", "SITE_NAME", "NOM_SITE", "NOM"],
  },
  {
    kind: "znieff-1",
    match: [/znieff.*(1|i)(?!i)/, /type[_-]?1/],
    idFields: ["NM_SFFZN", "ID_MNHN", "CD_SIG", "ID_LOCAL"],
    nameFields: ["LB_ZN", "NOM", "LB_ZONE", "NOM_SITE"],
  },
  {
    kind: "znieff-2",
    match: [/znieff.*(2|ii)/, /type[_-]?2/],
    idFields: ["NM_SFFZN", "ID_MNHN", "CD_SIG", "ID_LOCAL"],
    nameFields: ["LB_ZN", "NOM", "LB_ZONE", "NOM_SITE"],
  },
];

/**
 * Where the operator gets the files. Printed by `sources`.
 *
 * ⚠️ @unverified — these are the publication points as documented, not URLs
 * this script has ever fetched (egress is blocked here). Treat them as a
 * starting point for the local pass; the script never downloads on its own, so
 * a stale link costs a search, not a corrupt dataset.
 */
const SOURCE_NOTES = [
  "INPN — cartes et information géographique : https://inpn.mnhn.fr/telechargement/cartes-et-information-geographique",
  "data.gouv.fr — rechercher « Natura 2000 », « ZNIEFF », « réserves naturelles » (publications MNHN / MTE).",
  "",
  "Shapefiles are fine as a download but this script reads GeoJSON in WGS84.",
  "Convert once per layer:",
  "  ogr2ogr -f GeoJSON -t_srs EPSG:4326 znieff1.geojson N_ZNIEFF1_S_FXX.shp",
  "(INPN ships Lambert-93 / EPSG:2154; the ingest refuses non-WGS84 coordinates",
  " rather than reading metres as degrees.)",
];

/* ── seed loader ─────────────────────────────────────────────────────────
 *
 * Same regex pass as the other pipelines: importing data/cities-seed.ts would
 * run calibration + z-score rescaling on load, and this stays an .mjs.
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
    const lat = n("latitude");
    const lng = n("longitude");
    if (!slug || lat == null || lng == null) continue;
    out.push({ slug, name: s("name"), latitude: lat, longitude: lng, population: n("population") ?? 0 });
  }
  return out;
}

/* ── geometry ────────────────────────────────────────────────────────────
 *
 * Everything below is pure and exported for `selftest`. Coordinates are
 * projected to metres on a local equirectangular frame centred on the city:
 * over a 15 km radius the distortion is well under a percent, and it keeps the
 * rasteriser in plain Cartesian arithmetic.
 */

const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LNG_EQ = 111320;

export function projector(lat0, lng0) {
  const kx = M_PER_DEG_LNG_EQ * Math.cos((lat0 * Math.PI) / 180);
  return (lng, lat) => [(lng - lng0) * kx, (lat - lat0) * M_PER_DEG_LAT];
}

/** Grid over the disc of radius R. Cell (ix, iy) has its centre at
 *  ((ix + 0.5) * step - R, (iy + 0.5) * step - R). `inDisc` marks the cells
 *  whose centre falls inside the disc — those are the denominator. */
export function makeGrid(radiusM, stepM) {
  const n = Math.round((2 * radiusM) / stepM);
  const inDisc = new Uint8Array(n * n);
  let cells = 0;
  for (let iy = 0; iy < n; iy++) {
    const y = (iy + 0.5) * stepM - radiusM;
    for (let ix = 0; ix < n; ix++) {
      const x = (ix + 0.5) * stepM - radiusM;
      if (x * x + y * y <= radiusM * radiusM) {
        inDisc[iy * n + ix] = 1;
        cells++;
      }
    }
  }
  return { n, stepM, radiusM, inDisc, cells };
}

/**
 * Fill one polygon into `mask` (1 byte per cell) by scanline.
 *
 * `rings` is [outer, ...holes], each a flat [x0, y0, x1, y1, …] in metres. The
 * even-odd rule is applied across ALL rings at once, which is exactly what
 * makes inner rings punch holes without any special-casing.
 *
 * Returns the number of newly marked cells inside the disc.
 */
export function fillPolygon(rings, grid, mask) {
  const { n, stepM, radiusM, inDisc } = grid;
  let marked = 0;
  const xs = [];
  for (let iy = 0; iy < n; iy++) {
    const yc = (iy + 0.5) * stepM - radiusM;
    xs.length = 0;
    for (const r of rings) {
      for (let k = 0; k + 3 < r.length; k += 2) {
        const ya = r[k + 1];
        const yb = r[k + 3];
        // Half-open comparison: a vertex exactly on the scanline is counted
        // once, so a span never leaks at a shared vertex.
        if (ya <= yc !== yb <= yc) {
          const t = (yc - ya) / (yb - ya);
          xs.push(r[k] + t * (r[k + 2] - r[k]));
        }
      }
    }
    if (xs.length < 2) continue;
    xs.sort((a, b) => a - b);
    for (let s = 0; s + 1 < xs.length; s += 2) {
      let ixa = Math.ceil((xs[s] + radiusM) / stepM - 0.5);
      let ixb = Math.floor((xs[s + 1] + radiusM) / stepM - 0.5);
      if (ixa < 0) ixa = 0;
      if (ixb > n - 1) ixb = n - 1;
      const row = iy * n;
      for (let ix = ixa; ix <= ixb; ix++) {
        const idx = row + ix;
        if (inDisc[idx] && !mask[idx]) {
          mask[idx] = 1;
          marked++;
        }
      }
    }
  }
  return marked;
}

/** Squared distance from the origin to the segment (ax, ay)–(bx, by). */
function segDist2(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : (-ax * dx - ay * dy) / len2;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const px = ax + t * dx;
  const py = ay + t * dy;
  return px * px + py * py;
}

/** Is the origin inside the polygon (even-odd across all rings)? */
export function originInside(rings) {
  let inside = false;
  for (const r of rings) {
    for (let k = 0; k + 3 < r.length; k += 2) {
      const xa = r[k];
      const ya = r[k + 1];
      const xb = r[k + 2];
      const yb = r[k + 3];
      if (ya > 0 !== yb > 0) {
        const xInt = xa + ((0 - ya) / (yb - ya)) * (xb - xa);
        if (xInt > 0) inside = !inside;
      }
    }
  }
  return inside;
}

/** Distance in metres from the city centre to the perimeter, 0 when inside. */
export function distanceToOrigin(polygons) {
  for (const rings of polygons) if (originInside(rings)) return 0;
  let best = Infinity;
  for (const rings of polygons) {
    for (const r of rings) {
      for (let k = 0; k + 3 < r.length; k += 2) {
        const d2 = segDist2(r[k], r[k + 1], r[k + 2], r[k + 3]);
        if (d2 < best) best = d2;
      }
    }
  }
  return Math.sqrt(best);
}

/* ── GeoJSON streaming ───────────────────────────────────────────────────
 *
 * National INPN layers run to hundreds of megabytes; JSON.parse on the whole
 * file blows the default heap and holding the parsed tree would blow a raised
 * one. So features are pulled out one at a time by brace matching, parsed
 * individually, folded into the per-city grids, and dropped.
 */

async function* streamFeatures(file) {
  const line = /\.(geojsonl|geojsonseq|ndjson|jsonl)$/i.test(file);
  const stream = createReadStream(file, { encoding: "utf8", highWaterMark: 1 << 20 });

  if (line) {
    let buf = "";
    for await (const chunk of stream) {
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const s = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (s) yield JSON.parse(s);
      }
    }
    if (buf.trim()) yield JSON.parse(buf.trim());
    return;
  }

  let buf = "";
  let started = false;
  let depth = 0;
  let inStr = false;
  let esc = false;
  let start = -1;
  for await (const chunk of stream) {
    buf += chunk;
    let i = 0;
    if (!started) {
      const m = buf.match(/"features"\s*:\s*\[/);
      if (!m) {
        // Keep a tail long enough that the marker can't be split across chunks.
        if (buf.length > 1 << 20) buf = buf.slice(-64);
        continue;
      }
      buf = buf.slice(m.index + m[0].length);
      started = true;
    }
    for (; i < buf.length; i++) {
      const c = buf[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (c === "}") {
        depth--;
        if (depth === 0 && start >= 0) {
          yield JSON.parse(buf.slice(start, i + 1));
          buf = buf.slice(i + 1);
          i = -1;
          start = -1;
        }
      }
    }
    if (depth === 0) buf = "";
  }
  if (!started) {
    throw new Error(
      `${path.basename(file)}: no "features" array found. ` +
        `Expected a GeoJSON FeatureCollection — convert with ` +
        `\`ogr2ogr -f GeoJSON -t_srs EPSG:4326 out.geojson in.shp\`.`,
    );
  }
}

/** Rings of a feature, as [[outer, ...holes], …], still in lon/lat. */
function featurePolygons(geom) {
  if (!geom) return [];
  if (geom.type === "Polygon") return [geom.coordinates];
  if (geom.type === "MultiPolygon") return geom.coordinates;
  return [];
}

/**
 * Pick an attribute by candidate name, then by shape. INPN attribute names
 * vary per layer and vintage, so a miss falls back to the first plausible
 * field rather than dropping the feature — and the ingest reports which field
 * it settled on so the operator can check it.
 */
function pickField(props, candidates, fallbackRe) {
  for (const c of candidates) {
    for (const k of Object.keys(props)) {
      if (k.toUpperCase() === c.toUpperCase() && props[k] != null && props[k] !== "") {
        return { key: k, value: String(props[k]) };
      }
    }
  }
  for (const k of Object.keys(props)) {
    if (fallbackRe.test(k) && props[k] != null && props[k] !== "") {
      return { key: k, value: String(props[k]) };
    }
  }
  return null;
}

/* ── ingest ──────────────────────────────────────────────────────────────── */

async function listSources() {
  let files = [];
  try {
    files = await fs.readdir(SRC_DIR);
  } catch {
    return { dir: SRC_DIR, matched: [], unmatched: [], missing: LAYERS.map((l) => l.kind) };
  }
  const matched = [];
  const unmatched = [];
  for (const f of files) {
    if (!/\.(geojson|json|geojsonl|geojsonseq|ndjson|jsonl)$/i.test(f)) continue;
    const lower = f.toLowerCase();
    const layer = LAYERS.find((l) => l.match.some((re) => re.test(lower)));
    if (layer) matched.push({ file: path.join(SRC_DIR, f), name: f, layer });
    else unmatched.push(f);
  }
  const seen = new Set(matched.map((m) => m.layer.kind));
  return {
    dir: SRC_DIR,
    matched,
    unmatched,
    missing: LAYERS.map((l) => l.kind).filter((k) => !seen.has(k)),
  };
}

function showSources(src) {
  log(`source directory: ${src.dir}`);
  if (src.matched.length) {
    log("\nrecognised:");
    for (const m of src.matched) log(`  ${m.layer.kind.padEnd(22)} ${m.name}`);
  }
  if (src.unmatched.length) {
    log("\nignored (no layer matches the filename):");
    for (const f of src.unmatched) log(`  ${f}`);
  }
  if (src.missing.length) {
    log("\nmissing layers:");
    for (const k of src.missing) log(`  ${k}`);
  }
  log("\nwhere to get them:");
  for (const l of SOURCE_NOTES) log(l ? `  ${l}` : "");
}

async function ingest() {
  const seed = await loadSeed();
  const src = await listSources();
  if (!src.matched.length) {
    log("no source layer found — nothing to ingest.\n");
    showSources(src);
    log(
      "\nThis stage reads files, it does not download. Fetch the layers on a machine " +
        "with egress, drop them in the directory above, and re-run.",
    );
    return;
  }
  if (src.missing.length) {
    log(`⚠️  partial ingest: no file for ${src.missing.join(", ")}.`);
    log("   Coverage will understate every city until those layers are added.\n");
  }

  const pool = (ONLY_SLUG ? seed.filter((c) => c.slug === ONLY_SLUG) : seed)
    .slice()
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, LIMIT === Infinity ? undefined : LIMIT);
  if (!pool.length) {
    log(`unknown slug: ${ONLY_SLUG}`);
    return;
  }

  const grid = makeGrid(RADIUS_KM * 1000, GRID_STEP_M);
  const cellHa = (GRID_STEP_M * GRID_STEP_M) / 10000;
  const radiusDeg = {
    lat: (RADIUS_KM * 1000) / M_PER_DEG_LAT,
    // Widest longitude span over the seed (southernmost DROM cities), so the
    // bbox prefilter is generous rather than clipping a real perimeter.
    lng: (RADIUS_KM * 1000) / (M_PER_DEG_LNG_EQ * Math.cos((51 * Math.PI) / 180)),
  };

  // Per-city state. `weight` keeps the strongest protection covering each cell
  // (as weight × 100 in a byte), which is what resolves overlapping zonings.
  const state = new Map();
  for (const c of pool) {
    state.set(c.slug, {
      city: c,
      weight: new Uint8Array(grid.n * grid.n),
      areas: [],
      project: projector(c.latitude, c.longitude),
      minLat: c.latitude - radiusDeg.lat,
      maxLat: c.latitude + radiusDeg.lat,
      minLng: c.longitude - radiusDeg.lng,
      maxLng: c.longitude + radiusDeg.lng,
    });
  }

  const scratch = new Uint8Array(grid.n * grid.n);
  const started = Date.now();
  let coordGuardChecked = 0;

  for (const { file, name, layer } of src.matched) {
    let features = 0;
    let kept = 0;
    let fieldReport = null;
    for await (const f of streamFeatures(file)) {
      features++;
      const polys = featurePolygons(f.geometry);
      if (!polys.length) continue;

      // bbox in lon/lat, and the WGS84 guard: INPN ships Lambert-93, and metres
      // read as degrees would put every perimeter in the Gulf of Guinea while
      // still producing plausible-looking numbers.
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
      for (const rings of polys) {
        for (const ring of rings) {
          for (const [lng, lat] of ring) {
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
          }
        }
      }
      if (coordGuardChecked < 20) {
        coordGuardChecked++;
        if (Math.abs(maxLng) > 180 || Math.abs(maxLat) > 90) {
          throw new Error(
            `${name}: coordinates are not WGS84 (saw ${maxLng.toFixed(0)}, ${maxLat.toFixed(0)}). ` +
              `Reproject first: ogr2ogr -f GeoJSON -t_srs EPSG:4326 out.geojson ${name}`,
          );
        }
      }

      const props = f.properties ?? {};
      if (!fieldReport) {
        const id = pickField(props, layer.idFields, /^(id|code|num|cd_|nm_)/i);
        const nm = pickField(props, layer.nameFields, /(nom|name|lib|intitul)/i);
        fieldReport = { id: id?.key ?? null, name: nm?.key ?? null };
      }

      let touched = 0;
      for (const st of state.values()) {
        if (
          maxLng < st.minLng || minLng > st.maxLng ||
          maxLat < st.minLat || minLat > st.maxLat
        ) continue;

        // Project once per (feature, city) — the frame is city-local.
        const projected = polys.map((rings) =>
          rings.map((ring) => {
            const flat = new Float64Array(ring.length * 2);
            for (let i = 0; i < ring.length; i++) {
              const [x, y] = st.project(ring[i][0], ring[i][1]);
              flat[i * 2] = x;
              flat[i * 2 + 1] = y;
            }
            return flat;
          }),
        );

        scratch.fill(0);
        let cells = 0;
        for (const rings of projected) cells += fillPolygon(rings, grid, scratch);
        const distM = distanceToOrigin(projected);
        if (!cells && distM > RADIUS_KM * 1000) continue;

        const w = Math.round(PROTECTION_WEIGHT[layer.kind] * 100);
        if (cells) {
          for (let i = 0; i < scratch.length; i++) {
            if (scratch[i] && st.weight[i] < w) st.weight[i] = w;
          }
        }

        const id = pickField(props, layer.idFields, /^(id|code|num|cd_|nm_)/i);
        const nm = pickField(props, layer.nameFields, /(nom|name|lib|intitul)/i);
        st.areas.push({
          id: id?.value ?? null,
          name: nm?.value ?? null,
          kind: layer.kind,
          areaHa: +(cells * cellHa).toFixed(1),
          distanceKm: +(distM / 1000).toFixed(1),
        });
        touched++;
      }
      if (touched) kept++;
    }
    log(
      `  ${layer.kind.padEnd(22)} ${name} — ${features.toLocaleString("fr-FR")} features, ` +
        `${kept.toLocaleString("fr-FR")} near a seed city` +
        (fieldReport ? ` [id: ${fieldReport.id ?? "<none>"}, name: ${fieldReport.name ?? "<none>"}]` : ""),
    );
  }

  const crawledAt = new Date().toISOString().slice(0, 10);
  const current = (await readJson(OUT_JSON, {})) ?? {};
  const kinds = [...new Set(src.matched.map((m) => m.layer.kind))].sort();

  for (const st of state.values()) {
    let weighted = 0;
    let covered = 0;
    for (let i = 0; i < st.weight.length; i++) {
      if (st.weight[i]) {
        weighted += st.weight[i] / 100;
        covered++;
      }
    }
    const areas = st.areas.sort((a, b) => b.areaHa - a.areaHa);
    current[st.city.slug] = {
      crawledAt,
      source: "inpn",
      ingestVersion: INGEST_VERSION,
      radiusKm: RADIUS_KM,
      gridStepM: GRID_STEP_M,
      /** Layers actually present in this pass — a city ingested without the
       *  ZNIEFF file is not comparable to one ingested with it. */
      kinds,
      /** Share of the disc under protection, weighted by level, overlaps
       *  resolved cell by cell. */
      weightedCoverage: +((weighted / grid.cells) * 100).toFixed(1),
      /** Share under any zoning at all, whatever its level. */
      rawCoverage: +((covered / grid.cells) * 100).toFixed(1),
      areasTotal: areas.length,
      areasTruncated: areas.length > AREAS_PER_CITY,
      areas: areas.slice(0, AREAS_PER_CITY),
    };
  }

  await writeJson(
    OUT_JSON,
    Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b))),
  );

  const secs = ((Date.now() - started) / 1000).toFixed(0);
  const rows = Object.values(current);
  log(
    `done: ${state.size} cities ingested in ${secs}s. total ${rows.length}/${seed.length}` +
      (src.missing.length ? ` — PARTIAL (missing ${src.missing.join(", ")})` : ""),
  );
}

/* ── selftest ────────────────────────────────────────────────────────────
 *
 * The geometry has no network dependency, so it can be checked here and now
 * against answers known analytically. This is what stands in for the crawl
 * canary the other pipelines have (assertAreaResolved in city-parks).
 */

function selftest() {
  const grid = makeGrid(15000, 250);
  const results = [];
  const check = (label, got, want, tol) => {
    const ok = Math.abs(got - want) <= tol;
    results.push({ label, got, want, ok });
    log(`  ${ok ? "ok  " : "FAIL"} ${label}: ${got.toFixed(2)} (expected ${want} ±${tol})`);
  };

  const box = (x0, y0, x1, y1) =>
    Float64Array.from([x0, y0, x1, y0, x1, y1, x0, y1, x0, y0]);
  const pct = (mask) => {
    let c = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i]) c++;
    return (c / grid.cells) * 100;
  };

  // A square swallowing the whole disc covers all of it.
  let m = new Uint8Array(grid.n * grid.n);
  fillPolygon([box(-20000, -20000, 20000, 20000)], grid, m);
  check("square containing the disc → 100 %", pct(m), 100, 0.01);

  // A half-plane covers half of it.
  m = new Uint8Array(grid.n * grid.n);
  fillPolygon([box(0, -20000, 20000, 20000)], grid, m);
  check("half-plane → 50 %", pct(m), 50, 0.5);

  // A ring with a hole: outer 10 km square minus inner 5 km square.
  // (20 km² − 10 km²... in disc terms: (400 − 100) km² clipped by the disc.)
  m = new Uint8Array(grid.n * grid.n);
  fillPolygon(
    [box(-10000, -10000, 10000, 10000), box(-5000, -5000, 5000, 5000)],
    grid,
    m,
  );
  const discArea = Math.PI * 15 * 15;
  // Outer square (20×20 km) clipped to the disc, minus the inner 10×10 km
  // square which sits entirely inside it.
  const outerClipped = clippedSquareArea(20, 15);
  check("square with a hole → geometry", (pct(m) / 100) * discArea, outerClipped - 100, 1.5);

  // Nothing outside the disc is counted.
  m = new Uint8Array(grid.n * grid.n);
  fillPolygon([box(16000, 16000, 30000, 30000)], grid, m);
  check("polygon outside the radius → 0 %", pct(m), 0, 0.001);

  // Distance: a square 5 km east of the centre starts at 5 km; a square around
  // the centre reads 0.
  check(
    "distance to a perimeter 5 km east",
    distanceToOrigin([[box(5000, -1000, 6000, 1000)]]) / 1000,
    5,
    0.001,
  );
  check(
    "distance when the centre is inside",
    distanceToOrigin([[box(-1000, -1000, 1000, 1000)]]) / 1000,
    0,
    0.001,
  );

  // The disc denominator itself.
  check("disc cell count vs πR²", (grid.cells * 0.0625) / discArea, 1, 0.005);

  const failed = results.filter((r) => !r.ok).length;
  log(failed ? `\n${failed} check(s) FAILED` : "\nall checks passed");
  return failed;
}

/** Area (km²) of a square of side `side` centred on the origin, clipped by a
 *  disc of radius R — closed form, used as the reference in selftest. */
function clippedSquareArea(side, R) {
  const h = side / 2;
  if (h * Math.SQRT2 <= R) return side * side;
  if (h >= R) {
    // Square contains the disc entirely.
    return Math.PI * R * R;
  }
  // Disc clipped by four chords at distance h. Area = πR² − 4 circular segments.
  const seg = R * R * Math.acos(h / R) - h * Math.sqrt(R * R - h * h);
  return Math.PI * R * R - 4 * seg;
}

/* ── io ──────────────────────────────────────────────────────────────────── */

async function readJson(f, fallback) {
  try {
    return JSON.parse(await fs.readFile(f, "utf8"));
  } catch {
    return fallback;
  }
}
async function writeJson(f, data) {
  await fs.mkdir(path.dirname(f), { recursive: true });
  await fs.writeFile(f, JSON.stringify(data, null, 2) + "\n");
}

async function showStats() {
  const seed = await loadSeed();
  const current = (await readJson(OUT_JSON, {})) ?? {};
  const rows = Object.entries(current);
  log(`covered ${rows.length}/${seed.length} cities`);
  if (!rows.length) {
    log("  data/city-protected-areas.json is empty — the INPN pass has not run yet.");
    log("  Until it does, lib/biodiversity.ts reports the protection component as");
    log("  unknown (never as zero) and publishes no aggregate score.");
    return;
  }
  const none = rows.filter(([, r]) => r.areasTotal === 0).length;
  const partial = rows.filter(([, r]) => r.kinds.length < LAYERS.length).length;
  const cov = rows.map(([, r]) => r.weightedCoverage).sort((a, b) => a - b);
  const median = cov[cov.length >> 1];
  log(`  median weighted coverage: ${median} %`);
  log(`  cities with no protected perimeter within ${RADIUS_KM} km: ${none}`);
  if (partial) log(`  ⚠️  ingested from an incomplete layer set: ${partial}`);
  const top = rows
    .slice()
    .sort((a, b) => b[1].weightedCoverage - a[1].weightedCoverage)
    .slice(0, 5);
  log("  best covered:");
  for (const [slug, r] of top) log(`    ${slug.padEnd(24)} ${r.weightedCoverage} %`);
}

/* ── run ─────────────────────────────────────────────────────────────────── */

// Guarded so the geometry helpers can be imported and tested without the CLI
// firing an ingest on import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (cmd === "sources") showSources(await listSources());
  else if (cmd === "selftest") process.exitCode = selftest() ? 1 : 0;
  else if (cmd === "stats") await showStats();
  else if (cmd === "probe") {
    if (!ONLY_SLUG) log("probe needs --slug=<city>");
    else {
      const before = await readJson(OUT_JSON, {});
      await ingest();
      const after = await readJson(OUT_JSON, {});
      log(JSON.stringify(after[ONLY_SLUG] ?? null, null, 2));
      await writeJson(OUT_JSON, before ?? {});
      log("(probe: data/city-protected-areas.json restored, nothing written)");
    }
  } else await ingest();
}
