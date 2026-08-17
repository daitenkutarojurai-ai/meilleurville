#!/usr/bin/env node
/**
 * F62 phase 2 — protected areas (INPN / MNHN) for the 540 seed cities.
 *
 *   node scripts/city-protected-areas.mjs sources    # which files this needs, and where they come from
 *   node scripts/city-protected-areas.mjs fetch      # download them from data.gouv.fr (--dry-run to just look)
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
 * ── Two stages, one of which touches the network ──────────────────────────
 *
 * The ingest reads FILES, not an API: the INPN zonings are published as
 * national shapefile/GeoJSON downloads, which is what a static build wants
 * anyway — one download, then a deterministic local pass over
 * .cache/city-protected-areas/sources/ (or --src=<dir>).
 *
 * `fetch` is the stage that fills that directory, added 2026-08-13. Until then
 * a human had to find, download and reproject seven layers by hand, which is
 * why this component sat at 0/540 for six weeks while the GBIF crawl finished
 * all 540 cities. It resolves the MNHN datasets on data.gouv.fr **by slug**,
 * downloads the resources, unpacks and reprojects them.
 *
 * The cloud runner's egress policy refuses inpn.mnhn.fr and data.gouv.fr
 * (403 CONNECT, re-tested 2026-08-13), so `fetch` runs on the local machine —
 * same constraint as the Insee, Overpass and GBIF pipelines before it. What
 * changed is that it is now one command there instead of a manual hunt.
 *
 * And since 2026-08-17, nobody has to type that command either:
 * scripts/local-data-runner.sh calls `fetch` when the source directory is
 * empty, then the ingest when the layers are newer than the JSON. Writing
 * `fetch` had not been enough on its own — the runner still carried a hardcoded
 * skip saying the layers had to be dropped in by hand, so the sources never
 * appeared and the ingest never ran.
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
import { createReadStream, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

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
const DRY_RUN = args.includes("--dry-run");

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
const INGEST_VERSION = 2;

/**
 * The six disjoint territories the seed lives in, as lon/lat boxes.
 *
 * ── Why the ingest has to know about them ─────────────────────────────────
 *
 * Without this, a city gets `areasTotal: 0` whenever no perimeter falls within
 * 15 km of it, and lib/biodiversity.ts publishes that as a MEASURE — "aucun
 * périmètre protégé à moins de 15 km", written in so many words on the page.
 * That reading is only true where the ingested layers actually apply.
 *
 * They may well not apply overseas. Natura 2000 is a European directive that
 * does not extend to the outermost regions at all, and the MNHN publishes the
 * ZNIEFF and espaces-protégés zonings of each DROM in their own files, so a
 * pass carrying "ZNIEFF continentales" alone covers 522 of the 540 seed cities
 * and none of the 18 overseas ones. Those 18 would then read as bare ground —
 * Cayenne, 15 km from the Amazon, announcing no protected perimeter — which is
 * the same failure as the richness ranking putting Douai at 0,0/10: a gap in
 * OUR collection printed as a fact about the place.
 *
 * So: a territory carrying zero features across every ingested layer is out of
 * scope, and its cities are written with `outOfScope: true` and no coverage
 * figure. The lib turns that into "on ne sait pas", never into a zero. A
 * territory that IS represented keeps the old behaviour, where 0 is a real
 * measurement — the layers are national registries, not contributive maps.
 *
 * The boxes are far enough apart (thousands of km) that a bbox test is exact
 * here; `assertSeedTerritories` in selftest pins all 540 seed cities to exactly
 * one, so a city added outside them fails loudly instead of silently defaulting.
 */
const TERRITORIES = [
  { key: "metropole", label: "France métropolitaine", box: [-6, 10, 41, 52] },
  { key: "guadeloupe", label: "Guadeloupe", box: [-61.9, -60.7, 15.7, 16.6] },
  { key: "martinique", label: "Martinique", box: [-61.3, -60.7, 14.3, 15.0] },
  { key: "guyane", label: "Guyane", box: [-55, -51, 2, 6] },
  { key: "reunion", label: "La Réunion", box: [55.1, 56.0, -21.5, -20.7] },
  { key: "mayotte", label: "Mayotte", box: [44.9, 45.4, -13.2, -12.5] },
];

/** Territory a point falls in, or `null` if it falls in none of them. `null` is
 *  never treated as "métropole by default": an unplaceable city is reported. */
function territoryOf(lng, lat) {
  for (const t of TERRITORIES) {
    const [w, e, s, n] = t.box;
    if (lng >= w && lng <= e && lat >= s && lat <= n) return t.key;
  }
  return null;
}

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
 * Names are normalised before any `match` regex is tested: lowercased,
 * diacritics folded, then every run of non-alphanumerics collapsed to a single
 * space.
 *
 * Two things this buys. `\b` starts meaning what it looks like it means —
 * without it, `znieff_type_ii_continental` has no word boundary around `ii`
 * (underscore is a word character to a JS regex), so the type-I and type-II
 * patterns had to be written with lookaheads, and one of them was wrong (see
 * LAYERS). And « Réserves naturelles » stops being unmatchable: the accented
 * letters are not in `[a-z]`, so folding them is the difference between
 * recognising the file the MNHN actually publishes and reporting the layer
 * missing.
 */
function normalizeName(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * The layers to ingest, and how to recognise their files.
 *
 * `match` is tested against the NORMALISED filename (see normalizeName), so the
 * operator can drop the INPN downloads in with whatever names they arrive
 * under. `idFields` and `nameFields` are tried in order against each feature's
 * properties, with a generic fallback (see pickField) — INPN attribute names
 * differ from layer to layer and between vintages.
 *
 * ⚠️ @unverified — written without access to the actual files (inpn.mnhn.fr is
 * blocked from this environment, and was itself offline from 2025-07-26 to
 * 2026-07-22 — see SOURCE_NOTES). The field-name candidates below are
 * best-effort. The ingest PRINTS the field it picked for each layer: check
 * those lines on the first local run before trusting a full pass. If a layer
 * shows `id: <none>` or a name that is obviously a code, add the real
 * attribute name here rather than letting it through.
 *
 * ⚠️ A file matching TWO layers is reported as ambiguous and skipped, never
 * assigned to whichever came first in this array. The old type-I pattern
 * (`/znieff.*(1|i)(?!i)/`) matched `znieff type ii` — the `.*` swallowed the
 * first `i` and the lookahead was satisfied by the end of the string — so a
 * ZNIEFF II layer was classified as ZNIEFF I, at weight 0.4 instead of 0.25,
 * while the ingest reported znieff-2 as missing. Nothing was ever ingested with
 * that bug (the data file has always been `{}`), but it would have inflated
 * coverage on the first real pass without raising anything.
 */
const LAYERS = [
  {
    kind: "reserve-naturelle",
    match: [/reserves?\s*naturelles?/, /\brn\b/, /\brnn\b/, /\brnr\b/],
    idFields: ["ID_MNHN", "ID_LOCAL", "CODE_R_ENP", "GID"],
    nameFields: ["NOM_SITE", "NOM", "NOM_ENP", "LIB_ENP"],
  },
  {
    kind: "parc-national",
    match: [/parcs?\s*nationa(l|ux)/, /\bpn\b/],
    idFields: ["ID_MNHN", "ID_LOCAL", "CODE_R_ENP", "GID"],
    nameFields: ["NOM_SITE", "NOM", "NOM_ENP", "LIB_ENP"],
  },
  {
    kind: "parc-naturel-regional",
    match: [/parcs?\s*(naturels?\s*)?regiona(l|ux)/, /\bpnr\b/],
    idFields: ["ID_MNHN", "ID_LOCAL", "CODE_R_ENP", "GID"],
    nameFields: ["NOM_SITE", "NOM", "NOM_ENP", "LIB_ENP"],
  },
  {
    kind: "arrete-biotope",
    match: [/biotope/, /\bapb\b/, /\bappb\b/],
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
    match: [/znieff\s*(de\s*)?(type\s*)?0*(1|i)\b/],
    idFields: ["NM_SFFZN", "ID_MNHN", "CD_SIG", "ID_LOCAL"],
    nameFields: ["LB_ZN", "NOM", "LB_ZONE", "NOM_SITE"],
  },
  {
    kind: "znieff-2",
    match: [/znieff\s*(de\s*)?(type\s*)?0*(2|ii)\b/],
    idFields: ["NM_SFFZN", "ID_MNHN", "CD_SIG", "ID_LOCAL"],
    nameFields: ["LB_ZN", "NOM", "LB_ZONE", "NOM_SITE"],
  },
];

/**
 * Every layer a normalised name matches. Returns 0, 1 or several — the callers
 * treat "several" as an operator-visible ambiguity, never as a pick.
 */
function matchLayers(name) {
  const norm = normalizeName(name);
  return LAYERS.filter((l) => l.match.some((re) => re.test(norm)));
}

/**
 * Where the operator gets the files. Printed by `sources`.
 *
 * ⚠️ The INPN download page this script used to point at is gone. The MNHN's
 * information systems were taken down by a cyberattack on 2025-07-26 and
 * inpn.mnhn.fr stayed offline for about a year; a rebuilt "version zéro" came
 * back on 2026-07-21 carrying species sheets only, with habitat sheets and the
 * territorial synthesis pages announced for 2027. So the old
 * `/telechargement/cartes-et-information-geographique` URL is not a stale link
 * to re-check — it belongs to a site that no longer exists in that shape.
 *
 * The layers themselves never depended on that page: the MNHN publishes the
 * same national zonings on data.gouv.fr, which stayed up throughout. That is
 * what `fetch` resolves, and it is the route to prefer even once the INPN is
 * fully back — one publisher, stable dataset slugs, no scraping.
 */
/**
 * The three MNHN datasets on data.gouv.fr that carry the seven layers, keyed by
 * their **slug** rather than by a file URL.
 *
 * A slug is the stable handle: data.gouv.fr rotates the file behind a resource
 * at every vintage, and each resource also carries a permalink
 * (`https://www.data.gouv.fr/fr/datasets/r/<id>`) that follows the rotation.
 * Hard-coding the current file URL is what makes an ingest quietly download a
 * 2019 shapefile two years later — the same class of defect as the BODACC
 * constant written without seeing the API answer (see CLAUDE.md § F64).
 *
 * ⚠️ @unverified — the three slugs below were read off data.gouv.fr's own
 * listings, but no request has ever been made from this environment (403
 * CONNECT). `fetch` therefore never guesses: it prints every resource each
 * dataset exposes, refuses to pick when a layer matches zero or several, and
 * writes nothing it cannot name. Check the printout on the first local run.
 */
const DATAGOUV_API = "https://www.data.gouv.fr/api/1";
const DATAGOUV_DATASETS = [
  {
    slug: "inpn-donnees-du-programme-espaces-proteges",
    label: "INPN — Espaces protégés (réserves, parcs nationaux, PNR, arrêtés de biotope)",
    kinds: ["reserve-naturelle", "parc-national", "parc-naturel-regional", "arrete-biotope"],
  },
  {
    slug: "inpn-donnees-du-programme-natura-2000",
    label: "INPN — Natura 2000 (ZPS et SIC/ZSC)",
    kinds: ["natura-2000"],
  },
  {
    slug: "inpn-donnees-du-programme-znieff",
    label: "INPN — ZNIEFF (types I et II)",
    kinds: ["znieff-1", "znieff-2"],
  },
];

/** Resource formats worth downloading. Anything else (pdf, csv, html, ods) is
 *  documentation or tabular companion data, not a perimeter layer. */
const GEO_FORMATS = new Set([
  "shp",
  "zip",
  "7z",
  "geojson",
  "json",
  "gpkg",
  "gml",
  "kml",
  "kmz",
  "tar",
  "gz",
]);

const CONVERT_NOTES = [
  "Shapefiles are fine as a download but the ingest reads GeoJSON in WGS84.",
  "`fetch` runs the conversion itself when ogr2ogr is on PATH; without it, it",
  "prints the exact command per file:",
  "  ogr2ogr -f GeoJSON -t_srs EPSG:4326 znieff1.geojson N_ZNIEFF1_S_FXX.shp",
  "(INPN ships Lambert-93 / EPSG:2154; the ingest refuses non-WGS84 coordinates",
  " rather than reading metres as degrees.)",
];

/** Printed by `sources`. Built from DATAGOUV_DATASETS so the listed datasets and
 *  the ones `fetch` actually resolves can never drift apart. */
const SOURCE_NOTES = [
  "npm run protected-areas:fetch — resolves and downloads the layers itself.",
  "  --dry-run lists what it would take without downloading anything.",
  "",
  "Publisher: MNHN / PatriNat on data.gouv.fr (Licence Ouverte Etalab).",
  "inpn.mnhn.fr is NOT the route: its download pages went down with the MNHN",
  "cyberattack of 2025-07-26 and the site that came back on 2026-07-21 carries",
  "species sheets only. data.gouv.fr stayed up throughout.",
  "",
  ...DATAGOUV_DATASETS.map((d) => `  ${d.slug}\n      ${d.label}`),
  "",
  ...CONVERT_NOTES,
];

/* ── fetching the layers ─────────────────────────────────────────────────
 *
 * This is the one stage that touches the network, and it exists to remove the
 * only manual step left in F62: until now the ingest read files a human had to
 * find, download and reproject by hand, so the whole protected-areas component
 * stayed at 0/540 while the GBIF crawl finished all 540 cities.
 *
 * It is deliberately timid. It resolves datasets by slug, prints every resource
 * it sees, and refuses to choose when a layer matches zero or several — a wrong
 * layer silently ingested would inflate coverage on real pages, which is worse
 * than a run that stops and asks.
 */

const UA =
  "MaVilleIdeale/1.0 (+https://www.mavilleideale.fr; contact: daitenkutarojurai@gmail.com)";
const DOWNLOAD_DIR = path.join(CACHE_DIR, "downloads");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * GET a data.gouv.fr API endpoint. Same backoff shape as the GBIF crawler, same
 * terminal treatment of a proxy CONNECT refusal: retrying an egress-policy
 * denial only burns the run, and this pipeline is meant to be told plainly that
 * it must run somewhere with egress.
 */
async function datagouv(pathname) {
  const url = `${DATAGOUV_API}${pathname}`;
  let lastErr = null;
  for (let i = 0; i < 4; i++) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    } catch (err) {
      const msg = String(err?.cause?.message ?? err?.message ?? err);
      if (/403|CONNECT|proxy|EGRESS/i.test(msg)) {
        throw new Error(
          `data.gouv.fr blocked at the proxy layer (${msg}) — run this stage on a machine with egress.`,
        );
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
    if (res.status === 404) {
      throw new Error(
        `HTTP 404 on ${url} — the dataset slug has moved. Look it up on data.gouv.fr and ` +
          `update DATAGOUV_DATASETS; do not paste a file URL in its place.`,
      );
    }
    // An egress proxy answers the request rather than refusing the CONNECT, so
    // a policy denial arrives as a plain 403 and looks like data.gouv.fr saying
    // no. Naming both readings here is the difference between "run this
    // elsewhere" and an hour spent tuning a User-Agent that was never the
    // problem — this environment returns exactly this, tested 2026-08-13.
    if (res.status === 403) {
      throw new Error(
        `HTTP 403 on ${url}\n` +
          `  Either the network egress policy refused it (the cloud routine does, and the\n` +
          `  refusal arrives as a 403 response rather than a failed CONNECT), or data.gouv.fr\n` +
          `  rejected the User-Agent. On a machine with open egress this call succeeds.`,
      );
    }
    throw new Error(`HTTP ${res.status} on ${url}`);
  }
  throw lastErr ?? new Error(`data.gouv.fr request failed: ${url}`);
}

/** Extension of a resource, from its declared format or its URL, normalised. */
function resourceFormat(r) {
  const declared = String(r.format ?? "").toLowerCase().trim();
  if (declared) return declared;
  const m = String(r.url ?? "").match(/\.([a-z0-9]{2,7})(?:\?|$)/i);
  return m ? m[1].toLowerCase() : "";
}

/** Everything a resource offers to recognise itself by. */
function resourceText(r) {
  const file = String(r.url ?? "").split("/").pop() ?? "";
  return [r.title, r.description, decodeURIComponent(file)].filter(Boolean).join(" ");
}

/**
 * Ask data.gouv.fr what each dataset currently publishes, and work out which
 * resource carries which layer.
 *
 * Returns one entry per dataset with `picks` (kind → resource) and everything
 * that did not resolve, so the caller can print a full account rather than a
 * verdict.
 */
async function resolveDatagouvSources() {
  const out = [];
  for (const ds of DATAGOUV_DATASETS) {
    const payload = await datagouv(`/datasets/${ds.slug}/`);
    if (!payload || !Array.isArray(payload.resources)) {
      throw new Error(
        `${ds.slug}: unexpected API shape (no resources array). Got keys: ` +
          `${Object.keys(payload ?? {}).join(", ") || "<none>"}`,
      );
    }
    const geo = payload.resources.filter((r) => GEO_FORMATS.has(resourceFormat(r)));
    const picks = new Map();
    const ambiguous = [];
    for (const r of geo) {
      const layers = matchLayers(resourceText(r)).filter((l) => ds.kinds.includes(l.kind));
      if (layers.length === 1) {
        const kind = layers[0].kind;
        if (!picks.has(kind)) picks.set(kind, []);
        picks.get(kind).push(r);
      } else if (layers.length > 1) {
        ambiguous.push({ resource: r, kinds: layers.map((l) => l.kind) });
      }
    }
    out.push({
      dataset: ds,
      title: payload.title ?? ds.slug,
      lastModified: payload.last_modified ?? payload.last_update ?? null,
      licence: payload.license ?? null,
      resources: payload.resources,
      geo,
      picks,
      ambiguous,
      missing: ds.kinds.filter((k) => !picks.has(k)),
    });
    await sleep(1000);
  }
  return out;
}

/**
 * Download to `dest` unless it is already there with the expected size.
 *
 * Streamed to disk, not buffered: these are national shapefile archives of a
 * few hundred MB, and this runs unattended from cron next to a Next.js build —
 * holding a whole archive in memory to write it out again is the kind of thing
 * that works on the third try and OOMs on the fourth.
 *
 * Written to `<dest>.part` and renamed on completion, so an interrupted run
 * leaves nothing that the size check would mistake for a finished file (the
 * check can only compare when the API declares a size).
 */
async function download(url, dest, expectedSize) {
  try {
    const st = await fs.stat(dest);
    if (st.size > 0 && (!expectedSize || st.size === expectedSize)) return { skipped: true };
  } catch {
    /* not downloaded yet */
  }
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  if (!res.body) throw new Error(`empty response body downloading ${url}`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const partial = `${dest}.part`;
  await pipeline(Readable.fromWeb(res.body), createWriteStream(partial));
  const { size } = await fs.stat(partial);
  if (expectedSize && size !== expectedSize) {
    await fs.rm(partial, { force: true });
    throw new Error(
      `${path.basename(dest)}: got ${size} bytes, the API announced ${expectedSize}. ` +
        `Truncated download — re-run; the file was not kept.`,
    );
  }
  await fs.rename(partial, dest);
  return { skipped: false, bytes: size };
}

/** Is `bin` callable? Used to decide between converting and printing commands. */
async function hasBinary(bin) {
  try {
    await execFile(bin, ["--version"]);
    return true;
  } catch {
    return false;
  }
}

/** Every file under `dir`, recursively. */
async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

/**
 * Pull the layers from data.gouv.fr into SOURCE_DIR, as GeoJSON in WGS84.
 *
 * Archives are unpacked, shapefiles reprojected with ogr2ogr when it is
 * available. The output filename carries the layer kind, so the ingest's own
 * filename matcher recognises it without the operator renaming anything.
 */
async function fetchSources({ dryRun }) {
  log(`resolving ${DATAGOUV_DATASETS.length} datasets on data.gouv.fr…\n`);
  const resolved = await resolveDatagouvSources();

  let blocked = false;
  for (const r of resolved) {
    log(`▸ ${r.title}`);
    log(`  slug ${r.dataset.slug}${r.lastModified ? ` · updated ${r.lastModified}` : ""}`);
    log(`  ${r.resources.length} resources, ${r.geo.length} in a geo format`);
    for (const [kind, list] of r.picks) {
      for (const res of list) {
        log(`    ✓ ${kind.padEnd(22)} ${res.title ?? "(untitled)"} [${resourceFormat(res)}]`);
      }
    }
    for (const a of r.ambiguous) {
      blocked = true;
      log(`    ✗ ambiguous (${a.kinds.join(" / ")}): ${a.resource.title ?? a.resource.url}`);
    }
    if (r.missing.length) {
      blocked = true;
      log(`    ✗ no resource matched: ${r.missing.join(", ")}`);
      log(`      geo resources this dataset exposes:`);
      for (const g of r.geo) log(`        · ${g.title ?? "(untitled)"} [${resourceFormat(g)}]`);
    }
    log("");
  }

  if (blocked) {
    log(
      "Some layers did not resolve to exactly one resource. Rather than guess, this stops here:\n" +
        "an ambiguous or wrong layer would inflate protected-area coverage on 540 live pages.\n" +
        "Refine the `match` patterns in LAYERS against the titles printed above, then re-run.",
    );
    process.exitCode = 1;
    return;
  }
  if (dryRun) {
    log("--dry-run: nothing downloaded.");
    return;
  }

  await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
  await fs.mkdir(SOURCE_DIR, { recursive: true });
  const ogr = await hasBinary("ogr2ogr");
  if (!ogr) {
    log("⚠️  ogr2ogr not on PATH — archives will be unpacked but not reprojected.");
    log("   The commands to run afterwards are printed at the end.\n");
  }
  const manual = [];

  for (const r of resolved) {
    for (const [kind, list] of r.picks) {
      for (const [i, res] of list.entries()) {
        // The permalink follows the publisher's file rotation; the direct url
        // is the current file and can go stale under us.
        const url = res.latest ?? res.url;
        const fmt = resourceFormat(res);
        const suffix = list.length > 1 ? `-${i + 1}` : "";
        const archive = path.join(DOWNLOAD_DIR, `${kind}${suffix}.${fmt}`);
        log(`↓ ${kind}${suffix} ← ${url}`);
        const got = await download(url, archive, res.filesize);
        log(got.skipped ? "  (already downloaded)" : `  ${(got.bytes / 1e6).toFixed(1)} MB`);
        await sleep(1000);

        // GeoJSON straight from the publisher still has to be checked for its
        // CRS — a GeoJSON in Lambert-93 exists and the ingest would refuse it.
        if (fmt === "geojson" || fmt === "json") {
          await fs.copyFile(archive, path.join(SOURCE_DIR, `${kind}${suffix}.geojson`));
          continue;
        }

        const unpacked = path.join(DOWNLOAD_DIR, `${kind}${suffix}`);
        await fs.rm(unpacked, { recursive: true, force: true });
        await fs.mkdir(unpacked, { recursive: true });
        try {
          await execFile("unzip", ["-qo", archive, "-d", unpacked]);
        } catch (err) {
          log(`  ⚠️  could not unpack (${String(err?.message ?? err).split("\n")[0]})`);
          manual.push(`# unpack ${archive} by hand, then reproject its .shp into ${SOURCE_DIR}`);
          continue;
        }
        const files = await walk(unpacked);
        const geoFiles = files.filter((f) => /\.(shp|geojson|gpkg|gml)$/i.test(f));
        if (!geoFiles.length) {
          log(`  ⚠️  no vector file inside the archive`);
          manual.push(`# no .shp/.geojson found in ${archive} — look inside`);
          continue;
        }
        for (const [j, gf] of geoFiles.entries()) {
          const dest = path.join(
            SOURCE_DIR,
            `${kind}${suffix}${geoFiles.length > 1 ? `-${j + 1}` : ""}.geojson`,
          );
          if (!ogr) {
            manual.push(`ogr2ogr -f GeoJSON -t_srs EPSG:4326 ${dest} ${gf}`);
            continue;
          }
          await execFile("ogr2ogr", ["-f", "GeoJSON", "-t_srs", "EPSG:4326", dest, gf]);
          log(`  → ${path.basename(dest)}`);
        }
      }
    }
  }

  if (manual.length) {
    log("\nRun these, then `npm run protected-areas`:");
    for (const c of manual) log(`  ${c}`);
  } else {
    log("\nLayers are in place. Next: npm run protected-areas");
  }
  log("\nAttribution to carry with the figures: INPN — MNHN, Licence Ouverte Etalab.");
}

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
  const ambiguous = [];
  for (const f of files) {
    if (!/\.(geojson|json|geojsonl|geojsonseq|ndjson|jsonl)$/i.test(f)) continue;
    const layers = matchLayers(f);
    // Two layers matching the same file is not a tie to break by array order:
    // that is exactly how a ZNIEFF II file would have been ingested as a
    // ZNIEFF I, at nearly twice its weight. Skip it and say so.
    if (layers.length === 1) matched.push({ file: path.join(SRC_DIR, f), name: f, layer: layers[0] });
    else if (layers.length > 1) ambiguous.push({ name: f, kinds: layers.map((l) => l.kind) });
    else unmatched.push(f);
  }
  const seen = new Set(matched.map((m) => m.layer.kind));
  return {
    dir: SRC_DIR,
    matched,
    unmatched,
    ambiguous,
    missing: LAYERS.map((l) => l.kind).filter((k) => !seen.has(k)),
  };
}

function showSources(src) {
  log(`source directory: ${src.dir}`);
  if (src.matched.length) {
    log("\nrecognised:");
    for (const m of src.matched) log(`  ${m.layer.kind.padEnd(22)} ${m.name}`);
  }
  if (src.ambiguous?.length) {
    log("\nskipped (the filename matches more than one layer — rename it):");
    for (const a of src.ambiguous) log(`  ${a.name.padEnd(40)} ${a.kinds.join(" / ")}`);
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
      territory: territoryOf(c.longitude, c.latitude),
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
  /** Territories carrying at least one perimeter, across all layers of this
   *  pass. A territory absent from this set is one the pass says nothing
   *  about — see TERRITORIES. */
  const coveredTerritories = new Set();

  for (const { file, name, layer } of src.matched) {
    let features = 0;
    let kept = 0;
    let fieldReport = null;
    const layerTerritories = new Set();
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

      // Which territories this layer actually carries perimeters in. Read off
      // the feature's own centre, not off the file's name: a file called
      // "ZNIEFF continentales" is only continental because its contents are.
      const featTerritory = territoryOf((minLng + maxLng) / 2, (minLat + maxLat) / 2);
      if (featTerritory) {
        layerTerritories.add(featTerritory);
        coveredTerritories.add(featTerritory);
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
    log(`  ${" ".repeat(22)} territories: ${[...layerTerritories].sort().join(", ") || "<none>"}`);
  }

  const crawledAt = new Date().toISOString().slice(0, 10);
  const current = (await readJson(OUT_JSON, {})) ?? {};
  const kinds = [...new Set(src.matched.map((m) => m.layer.kind))].sort();

  // Territories the pass says nothing about. Their cities are recorded as out
  // of scope rather than as zero — the difference between "we looked and there
  // is nothing" and "we never had a file covering this place".
  const outOfScope = [];
  const unplaceable = [];
  for (const st of state.values()) {
    if (st.territory == null) unplaceable.push(st.city.slug);
    else if (!coveredTerritories.has(st.territory)) outOfScope.push(st.city.slug);
  }
  if (outOfScope.length) {
    const missingTerr = [
      ...new Set([...state.values()].map((s) => s.territory).filter((t) => t && !coveredTerritories.has(t))),
    ].sort();
    log(
      `\n⚠️  no layer carries a perimeter in ${missingTerr.join(", ")} — ` +
        `${outOfScope.length} cities recorded as OUT OF SCOPE, not as zero.`,
    );
    log(
      "   Natura 2000 does not extend to the outermost regions, and the MNHN publishes the\n" +
        "   overseas ZNIEFF and espaces protégés as separate resources. Add those files to\n" +
        `   ${SRC_DIR} to cover these cities; until then their pages say the pass does not\n` +
        "   reach them, which is true, instead of showing a protected coverage of 0 %.",
    );
  }
  if (unplaceable.length) {
    log(
      `\n⚠️  ${unplaceable.length} cities fall outside every known territory box ` +
        `(${unplaceable.slice(0, 5).join(", ")}${unplaceable.length > 5 ? "…" : ""}). ` +
        "Add the territory to TERRITORIES — they are recorded as out of scope meanwhile.",
    );
  }

  for (const st of state.values()) {
    const inScope = st.territory != null && coveredTerritories.has(st.territory);
    const head = {
      crawledAt,
      source: "inpn",
      ingestVersion: INGEST_VERSION,
      radiusKm: RADIUS_KM,
      gridStepM: GRID_STEP_M,
      /** Territory the city sits in, and whether this pass carried any layer
       *  covering it. Out of scope ⇒ no coverage figure at all, because a 0
       *  here would be read as a measurement. */
      territory: st.territory,
    };
    if (!inScope) {
      current[st.city.slug] = {
        ...head,
        outOfScope: true,
        kinds: [],
        areasTotal: 0,
        areasTruncated: false,
        areas: [],
      };
      continue;
    }
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
      ...head,
      outOfScope: false,
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
  const scored = rows.filter((r) => !r.outOfScope).length;
  log(
    `done: ${state.size} cities ingested in ${secs}s. total ${rows.length}/${seed.length}` +
      ` (${scored} with a coverage figure, ${rows.length - scored} out of scope)` +
      (src.missing.length ? ` — PARTIAL (missing ${src.missing.join(", ")})` : ""),
  );
}

/* ── selftest ────────────────────────────────────────────────────────────
 *
 * The geometry has no network dependency, so it can be checked here and now
 * against answers known analytically. This is what stands in for the crawl
 * canary the other pipelines have (assertAreaResolved in city-parks).
 */

async function selftest() {
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

  /* ── layer recognition ──────────────────────────────────────────────────
   *
   * The geometry above was always right; the filename matcher was not. A
   * ZNIEFF II file used to answer the type-I pattern as well, and `LAYERS.find`
   * handed it to znieff-1 — 0.4 instead of 0.25 in the weighted coverage —
   * while the ingest reported znieff-2 as missing. These cases pin the naming
   * shapes the MNHN actually ships, underscores and roman numerals included.
   */
  const expectKind = (name, want) => {
    const got = matchLayers(name).map((l) => l.kind);
    const ok = got.length === 1 && got[0] === want;
    results.push({ label: `layer «${name}»`, ok });
    log(`  ${ok ? "ok  " : "FAIL"} layer «${name}» → ${got.join(" / ") || "<none>"} (expected ${want})`);
  };
  expectKind("N_ZNIEFF1_S_FXX.shp", "znieff-1");
  expectKind("N_ZNIEFF2_S_FXX.shp", "znieff-2");
  expectKind("znieff_type_1_continental.geojson", "znieff-1");
  expectKind("znieff_type_ii_continental.geojson", "znieff-2");
  expectKind("ZNIEFF de type II (métropole)", "znieff-2");
  expectKind("ZNIEFF de type I (métropole)", "znieff-1");
  expectKind("N_ENP_RN_S_000.shp", "reserve-naturelle");
  expectKind("Réserves naturelles nationales", "reserve-naturelle");
  expectKind("Parcs naturels régionaux", "parc-naturel-regional");
  expectKind("Parcs nationaux (coeur et aire d'adhésion)", "parc-national");
  expectKind("Arrêtés de protection de biotope", "arrete-biotope");
  expectKind("N_ENP_APB_S_FXX.shp", "arrete-biotope");
  expectKind("Natura 2000 — ZPS (directive Oiseaux)", "natura-2000");
  expectKind("Natura 2000 — SIC/ZSC (directive Habitats)", "natura-2000");

  const expectNoKind = (name) => {
    const got = matchLayers(name).map((l) => l.kind);
    const ok = got.length === 0;
    results.push({ label: `no layer «${name}»`, ok });
    log(`  ${ok ? "ok  " : "FAIL"} «${name}» → ${got.join(" / ") || "<none>"} (expected none)`);
  };
  // Companion tables and documentation ride in the same datasets; recognising
  // one as a perimeter layer would ingest an empty file and read as "measured".
  expectNoKind("Documentation du standard de données");
  expectNoKind("Liste des communes");

  /* ── territories ────────────────────────────────────────────────────────
   *
   * The scope guard is only as good as the boxes: a seed city matching none of
   * them, or two of them, would be filed out of scope for ever and read on the
   * page as "the pass does not reach here" while the pass reached it fine.
   * So every seed city is pinned to exactly one, and the boxes are checked to
   * be disjoint on a few points that must not be confused.
   */
  const expectTerritory = (label, lng, lat, want) => {
    const got = territoryOf(lng, lat);
    const ok = got === want;
    results.push({ label: `territory ${label}`, ok });
    log(`  ${ok ? "ok  " : "FAIL"} territory ${label} → ${got ?? "<none>"} (expected ${want ?? "<none>"})`);
  };
  expectTerritory("Paris", 2.3522, 48.8566, "metropole");
  expectTerritory("Ajaccio", 8.7369, 41.9192, "metropole");
  expectTerritory("Cayenne", -52.3333, 4.9333, "guyane");
  expectTerritory("Fort-de-France", -61.0742, 14.6036, "martinique");
  expectTerritory("Pointe-à-Pitre", -61.5333, 16.2415, "guadeloupe");
  expectTerritory("Saint-Denis (974)", 55.4504, -20.8789, "reunion");
  expectTerritory("Mamoudzou", 45.2272, -12.7806, "mayotte");
  // Open ocean off Dakar: nothing must claim it, or a mis-projected layer would
  // silently vouch for a territory.
  expectTerritory("Atlantic (0,0)", 0, 0, null);

  const seedCities = await loadSeed();
  const perTerritory = {};
  const stray = [];
  for (const c of seedCities) {
    const t = territoryOf(c.longitude, c.latitude);
    if (!t) stray.push(c.slug);
    else perTerritory[t] = (perTerritory[t] ?? 0) + 1;
  }
  const allPlaced = stray.length === 0 && seedCities.length > 0;
  results.push({ label: "every seed city in exactly one territory", ok: allPlaced });
  log(
    `  ${allPlaced ? "ok  " : "FAIL"} every seed city placed: ${seedCities.length - stray.length}/${seedCities.length} ` +
      `(${Object.entries(perTerritory).map(([t, n]) => `${t} ${n}`).join(", ")})` +
      (stray.length ? ` — unplaced: ${stray.slice(0, 5).join(", ")}` : ""),
  );

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
  const scoped = rows.filter(([, r]) => !r.outOfScope);
  const outOfScope = rows.filter(([, r]) => r.outOfScope);
  if (outOfScope.length) {
    const byTerr = {};
    for (const [, r] of outOfScope) byTerr[r.territory ?? "?"] = (byTerr[r.territory ?? "?"] ?? 0) + 1;
    log(
      `  out of scope (no layer covers their territory): ${outOfScope.length} — ` +
        Object.entries(byTerr).map(([t, n]) => `${t} ${n}`).join(", "),
    );
    log("    these have NO coverage figure; the pages say so rather than showing 0 %.");
  }
  if (!scoped.length) {
    log("  no city has a coverage figure yet.");
    return;
  }
  const none = scoped.filter(([, r]) => r.areasTotal === 0).length;
  const partial = scoped.filter(([, r]) => r.kinds.length < LAYERS.length).length;
  const cov = scoped.map(([, r]) => r.weightedCoverage).sort((a, b) => a - b);
  const median = cov[cov.length >> 1];
  log(`  with a coverage figure: ${scoped.length}`);
  log(`  median weighted coverage: ${median} %`);
  log(`  cities with no protected perimeter within ${RADIUS_KM} km: ${none}`);
  if (partial) log(`  ⚠️  ingested from an incomplete layer set: ${partial}`);
  const top = scoped
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
  else if (cmd === "fetch") {
    // A network failure here is an operating condition, not a crash: print it
    // as a sentence rather than a stack trace, since the usual reader is
    // someone checking whether the layers landed.
    try {
      await fetchSources({ dryRun: DRY_RUN });
    } catch (err) {
      log(`\n${String(err?.message ?? err)}`);
      process.exitCode = 1;
    }
  }
  else if (cmd === "selftest") process.exitCode = (await selftest()) ? 1 : 0;
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
