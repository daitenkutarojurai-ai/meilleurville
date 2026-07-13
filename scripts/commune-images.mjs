#!/usr/bin/env node
/**
 * Commune photo pipeline — geo.api.gouv.fr → Wikidata (P18) → Wikimedia Commons.
 *
 *   node scripts/commune-images.mjs communes   # 1. list every French commune
 *   node scripts/commune-images.mjs wikidata   # 2. INSEE (P374) → QID + image (P18), per département
 *   node scripts/commune-images.mjs commons    # 3. file → url, author, licence, Commons page
 *   node scripts/commune-images.mjs manifest   # 4. join → cache manifest + data/city-images.json
 *   node scripts/commune-images.mjs assets     # 5. download + sharp → public/photos/villes/
 *   node scripts/commune-images.mjs all        # the whole chain
 *
 * Flags
 *   --update   re-query Wikidata, re-fetch only communes that are new or whose P18 changed
 *   --force    ignore the cache entirely (full refetch)
 *   --limit=N  cap the number of assets built (batch control)
 *   --dept=74  restrict to one département
 *
 * Every stage is resumable: state lives in .cache/commune-images/ and each stage
 * skips work already on disk. Re-running after Ctrl-C picks up where it stopped.
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "commune-images");
const PHOTOS = path.join(ROOT, "public", "photos", "villes");
const COMMUNES = path.join(CACHE, "communes.json");
const WIKIDATA = path.join(CACHE, "wikidata");
const COMMONS = path.join(CACHE, "commons.jsonl");
const MANIFEST = path.join(CACHE, "manifest.json");
const OUT_JSON = path.join(ROOT, "data", "city-images.json");
const OUT_CARDS = path.join(ROOT, "data", "city-cards.json");

// Wikimedia asks every automated client to identify itself with a contactable
// UA. An anonymous crawler gets 403'd on the SPARQL endpoint.
const UA =
  "MaVilleIdeale/1.0 (https://www.mavilleideale.fr; daitenkutarojurai@gmail.com) node-fetch";

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--")) ?? "all";
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const UPDATE = flag("update");
const FORCE = flag("force");
const LIMIT = Number(opt("limit") ?? Infinity);
const ONLY_DEPT = opt("dept");

// Commons is a free-media repository, but a handful of files carry a
// non-reusable tag. Only ship licences we can actually attribute and serve.
const LICENSE_OK =
  /^(cc0|cc[ -]by|public domain|pd|fal|gfdl|attribution|copyrighted free use)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

/** Fetch with retry + exponential backoff. Honours Retry-After on 429. */
async function get(url, { json = true, accept, tries = 5 } = {}) {
  for (let i = 0; i < tries; i++) {
    let res;
    try {
      res = await fetch(url, {
        headers: { "User-Agent": UA, ...(accept ? { Accept: accept } : {}) },
      });
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(2 ** i * 1000);
      continue;
    }
    if (res.ok) return json ? res.json() : Buffer.from(await res.arrayBuffer());
    if (res.status === 404) return null;
    const retryAfter = Number(res.headers.get("retry-after")) * 1000;
    if (i === tries - 1) throw new Error(`${res.status} ${res.statusText} — ${url}`);
    await sleep(retryAfter || 2 ** i * 1000 + Math.random() * 500);
  }
  return null;
}

const readJson = (f, fallback = null) =>
  fs.readFile(f, "utf8").then(JSON.parse).catch(() => fallback);
const writeJson = async (f, data) => {
  await fs.mkdir(path.dirname(f), { recursive: true });
  await fs.writeFile(f, JSON.stringify(data, null, 2) + "\n");
};

/* ── 1. communes ────────────────────────────────────────────────────────── */

async function stepCommunes() {
  const cached = FORCE ? null : await readJson(COMMUNES);
  if (cached) {
    log(`communes: ${cached.length} (cache)`);
    return cached;
  }
  const list = await get(
    "https://geo.api.gouv.fr/communes?fields=nom,code,codeDepartement,codeRegion,population&format=json",
  );
  await writeJson(COMMUNES, list);
  log(`communes: ${list.length} fetched`);
  return list;
}

/* ── 2. wikidata ────────────────────────────────────────────────────────── */

// Anchoring on P374 (INSEE municipality code, ~35k triples) rather than on
// P31/P279* keeps the query inside the 60s SPARQL budget. Rows for defunct
// communes come back too — they are dropped by the join against geo.api.
const sparql = (dept) => `SELECT ?insee ?item ?image ?type WHERE {
  ?item wdt:P374 ?insee .
  FILTER(STRSTARTS(?insee, "${dept}"))
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?item wdt:P31 ?type }
}`;

const COMMUNE_TYPES = new Set(["Q484170", "Q2989454", "Q22677547", "Q1394200"]);

async function queryDept(dept) {
  const url =
    "https://query.wikidata.org/sparql?format=json&query=" +
    encodeURIComponent(sparql(dept));
  const res = await get(url, { accept: "application/sparql-results+json" });
  /** @type {Record<string, {qid: string, file: string|null, commune: boolean}>} */
  const byInsee = {};
  for (const b of res.results.bindings) {
    const insee = b.insee.value;
    const qid = b.item.value.split("/").pop();
    const type = b.type?.value.split("/").pop();
    const file = b.image
      ? decodeURIComponent(b.image.value.split("Special:FilePath/").pop()).replace(/_/g, " ")
      : null;
    const isCommune = COMMUNE_TYPES.has(type);
    const prev = byInsee[insee];
    // Several Wikidata items can share an INSEE code (a merged commune keeps
    // the code of its former self). Prefer the one typed as a commune, then
    // the one that actually has an image.
    if (!prev || (isCommune && !prev.commune) || (!prev.file && file)) {
      byInsee[insee] = { qid, file: file ?? prev?.file ?? null, commune: isCommune || !!prev?.commune };
    } else if (prev && file && !prev.file) {
      prev.file = file;
    }
  }
  return byInsee;
}

async function stepWikidata(communes) {
  await fs.mkdir(WIKIDATA, { recursive: true });
  const depts = [...new Set(communes.map((c) => c.codeDepartement))]
    .filter((d) => !ONLY_DEPT || d === ONLY_DEPT)
    .sort();
  let hit = 0;
  for (const dept of depts) {
    const file = path.join(WIKIDATA, `${dept}.json`);
    if (!FORCE && !UPDATE && (await readJson(file))) continue;
    const data = await queryDept(dept);
    const withImage = Object.values(data).filter((d) => d.file).length;
    hit += withImage;
    await writeJson(file, data);
    log(`wikidata ${dept}: ${Object.keys(data).length} items, ${withImage} with P18`);
    await sleep(1200); // WDQS: stay well under the 1 req/s soft ceiling
  }
  log(`wikidata: ${depts.length} départements${hit ? `, ${hit} images this run` : " (cache)"}`);
}

/* ── 3. commons ─────────────────────────────────────────────────────────── */

const stripHtml = (s) =>
  s?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() || null;
const firstHref = (s) => s?.match(/href="([^"]+)"/)?.[1]?.replace(/^\/\//, "https://") ?? null;

async function loadCommons() {
  const map = new Map();
  const raw = await fs.readFile(COMMONS, "utf8").catch(() => "");
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);
    map.set(rec.file, rec);
  }
  return map;
}

async function stepCommons() {
  const files = new Set();
  for (const f of await fs.readdir(WIKIDATA).catch(() => [])) {
    const data = await readJson(path.join(WIKIDATA, f), {});
    for (const v of Object.values(data)) if (v.file) files.add(v.file);
  }
  const done = FORCE ? new Map() : await loadCommons();
  if (FORCE) await fs.rm(COMMONS, { force: true });
  const todo = [...files].filter((f) => !done.has(f));
  log(`commons: ${files.size} distinct files, ${todo.length} to fetch`);

  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50);
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" +
      "&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1600" +
      "&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl|Credit|AttributionRequired|Permission" +
      "&titles=" +
      batch.map((f) => encodeURIComponent("File:" + f)).join("|");
    const res = await get(url);
    const lines = [];
    for (const page of res.query?.pages ?? []) {
      const info = page.imageinfo?.[0];
      const file = page.title.replace(/^File:/, "");
      if (!info || page.missing) {
        lines.push(JSON.stringify({ file, missing: true }));
        continue;
      }
      const meta = info.extmetadata ?? {};
      lines.push(
        JSON.stringify({
          file,
          src: info.thumburl ?? info.url,
          mime: info.mime,
          width: info.thumbwidth ?? info.width,
          height: info.thumbheight ?? info.height,
          author: stripHtml(meta.Artist?.value),
          authorUrl: firstHref(meta.Artist?.value),
          license: stripHtml(meta.LicenseShortName?.value),
          licenseUrl: meta.LicenseUrl?.value ?? null,
          commonsUrl: info.descriptionurl,
        }),
      );
    }
    await fs.appendFile(COMMONS, lines.join("\n") + "\n");
    log(`commons: ${Math.min(i + 50, todo.length)}/${todo.length}`);
    await sleep(1000); // Action API: 1 req/s is the polite ceiling for bots
  }
}

/* ── 4. manifest ────────────────────────────────────────────────────────── */

async function stepManifest(communes) {
  const commons = await loadCommons();
  const wd = {};
  for (const f of await fs.readdir(WIKIDATA).catch(() => [])) {
    Object.assign(wd, await readJson(path.join(WIKIDATA, f), {}));
  }

  const manifest = {};
  let noItem = 0, noImage = 0, badLicense = 0;
  for (const c of communes) {
    const item = wd[c.code];
    if (!item) { noItem++; continue; }
    if (!item.file) { noImage++; continue; }
    const img = commons.get(item.file);
    if (!img || img.missing || !img.src) { noImage++; continue; }
    if (!img.license || !LICENSE_OK.test(img.license)) { badLicense++; continue; }
    manifest[c.code] = {
      insee: c.code,
      name: c.nom,
      qid: item.qid,
      file: item.file,
      src: img.src,
      width: img.width,
      height: img.height,
      author: img.author,
      authorUrl: img.authorUrl,
      license: img.license,
      licenseUrl: img.licenseUrl,
      commonsUrl: img.commonsUrl,
    };
  }
  await writeJson(MANIFEST, manifest);
  log(
    `manifest: ${Object.keys(manifest).length}/${communes.length} communes with a usable photo ` +
      `(no wikidata item: ${noItem}, no image: ${noImage}, licence rejected: ${badLicense})`,
  );
  return manifest;
}

/* ── 5. assets ──────────────────────────────────────────────────────────── */

// Only the cities that exist on the site get a built asset — the manifest keeps
// the other ~30k communes ready for the day the seed grows.
const SEED_TS = path.join(ROOT, "data", "cities-seed.ts");
const RESOLVED = path.join(CACHE, "insee-resolved.json");

async function seedCities() {
  const src = await fs.readFile(SEED_TS, "utf8");
  const out = [];
  // Records are `{ slug: "x", ... }` blocks; split on the slug key so a record
  // missing inseeCode still yields its name/coords for the fallback lookup.
  const blocks = src.split(/\n {2}\{\n/).slice(1);
  for (const b of blocks) {
    const f = (k, q = '"') =>
      b.match(new RegExp(`${k}:\\s*${q === '"' ? '"([^"]+)"' : "(-?[\\d.]+)"}`))?.[1] ?? null;
    const slug = f("slug");
    if (!slug) continue;
    out.push({
      slug,
      name: f("name"),
      insee: f("inseeCode"),
      lat: Number(f("latitude", "n")),
      lng: Number(f("longitude", "n")),
    });
  }
  return out;
}

/** Reverse-geocode the cities whose seed record has no inseeCode. The commune
 *  containing the seed's centre point is unambiguous, where a name match is not
 *  ("Pontoise", "Saint-Étienne" and friends exist several times over). */
async function resolveMissingInsee(cities) {
  const cache = (await readJson(RESOLVED, {})) ?? {};
  const todo = cities.filter((c) => !c.insee && !cache[c.slug]);
  for (const c of todo) {
    const hit = await get(
      `https://geo.api.gouv.fr/communes?lat=${c.lat}&lon=${c.lng}&fields=nom,code&format=json`,
    );
    const found = hit?.[0];
    if (!found) { console.warn(`  ! ${c.slug}: no commune at ${c.lat},${c.lng}`); continue; }
    cache[c.slug] = found.code;
    log(`  insee ${c.slug} → ${found.code} (${found.nom})`);
    await sleep(200);
  }
  if (todo.length) await writeJson(RESOLVED, cache);
  for (const c of cities) if (!c.insee) c.insee = cache[c.slug] ?? null;
  return cities.filter((c) => c.insee);
}

/** Write the resolved codes back into the seed so inseeCode is a real field on
 *  all 540 records, not a lookup that lives only in this script. */
async function stepSeedInsee() {
  const cities = await resolveMissingInsee(await seedCities());
  let src = await fs.readFile(SEED_TS, "utf8");
  let patched = 0;
  for (const c of cities) {
    const anchor = new RegExp(`(slug: "${c.slug}",\\n(\\s+)name: "[^"]*",\\n\\s+region: [^\\n]*\\n\\s+department: [^\\n]*\\n)(?!\\s+inseeCode)`);
    if (!anchor.test(src)) continue;
    src = src.replace(anchor, `$1$2inseeCode: "${c.insee}",\n`);
    patched++;
  }
  await fs.writeFile(SEED_TS, src);
  log(`seed: inseeCode added to ${patched} records`);
}

const WIDTHS = [
  { key: "hero", w: 1024, q: 70 },
  { key: "card", w: 480, q: 70 },
];

async function stepAssets(manifest) {
  await fs.mkdir(PHOTOS, { recursive: true });
  const cities = await resolveMissingInsee(await seedCities());
  const prev = FORCE ? {} : (await readJson(OUT_JSON, {}));
  const out = {};
  const keep = new Set();
  let built = 0, skipped = 0, missing = 0;

  for (const { slug, insee } of cities) {
    const m = manifest[insee];
    if (!m) { missing++; continue; }

    const before = prev[slug];
    // The Commons filename is the change key: a new P18 (or a re-upload under a
    // new name) invalidates; everything else reuses the built webp.
    if (before?.file === m.file && !FORCE && built >= 0) {
      const files = await Promise.all(
        WIDTHS.map((w) => fs.access(path.join(ROOT, "public", before[w.key].src)).then(() => true, () => false)),
      );
      if (files.every(Boolean)) {
        out[slug] = before;
        WIDTHS.forEach((w) => keep.add(path.basename(before[w.key].src)));
        skipped++;
        continue;
      }
    }
    if (built >= LIMIT) { out[slug] = before ?? undefined; continue; }

    let buf;
    try {
      buf = await get(m.src, { json: false });
    } catch (err) {
      console.warn(`  ! ${slug}: download failed (${err.message})`);
      continue;
    }
    if (!buf) { console.warn(`  ! ${slug}: 404 on ${m.src}`); continue; }

    const rec = {
      insee, qid: m.qid, file: m.file,
      author: m.author, authorUrl: m.authorUrl,
      license: m.license, licenseUrl: m.licenseUrl, commonsUrl: m.commonsUrl,
    };
    const base = sharp(buf, { failOn: "none" }).rotate();
    const stats = await base.stats();
    const { r, g, b } = stats.dominant;
    rec.color = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

    for (const { key, w, q } of WIDTHS) {
      const webp = await base
        .clone()
        .resize({ width: w, height: Math.round(w * 0.625), fit: "cover", position: "attention", withoutEnlargement: true })
        .webp({ quality: q, effort: 5 })
        .toBuffer({ resolveWithObject: true });
      const hash = createHash("sha1").update(webp.data).digest("hex").slice(0, 8);
      const name = `${slug}-${w}.${hash}.webp`;
      await fs.writeFile(path.join(PHOTOS, name), webp.data);
      keep.add(name);
      rec[key] = { src: `/photos/villes/${name}`, width: webp.info.width, height: webp.info.height };
    }
    out[slug] = rec;
    built++;
    log(`  + ${slug} (${m.license}) ${built}`);
    await sleep(300); // upload.wikimedia.org — keep the download rate civil
  }

  // Prune webp files no longer referenced (image changed upstream, city removed).
  for (const f of await fs.readdir(PHOTOS)) {
    if (f.endsWith(".webp") && !keep.has(f)) await fs.rm(path.join(PHOTOS, f));
  }

  const sorted = Object.fromEntries(Object.entries(out).filter(([, v]) => v).sort(([a], [b]) => a.localeCompare(b)));
  await writeJson(OUT_JSON, sorted);

  // Lean sibling for CityCard: the card grids live inside client components
  // (/villes filters in the browser), so the full record — hero variant, QID,
  // Commons URLs — would ride into the client bundle for nothing. Only the
  // content hash is stored; lib/city-cards rebuilds the src from slug + hash.
  await writeJson(
    OUT_CARDS,
    Object.fromEntries(
      Object.entries(sorted).map(([slug, r]) => [
        slug,
        { h: path.basename(r.card.src).split(".")[1], c: r.color, a: r.author, l: r.license },
      ]),
    ),
  );
  log(
    `assets: ${Object.keys(sorted).length}/${cities.length} cities have a photo ` +
      `(built ${built}, reused ${skipped}, no photo upstream ${missing})`,
  );
}

/* ── run ────────────────────────────────────────────────────────────────── */

const communes = await stepCommunes();
if (cmd === "communes") process.exit(0);
if (["seed-insee", "all"].includes(cmd)) await stepSeedInsee();
if (cmd === "seed-insee") process.exit(0);
if (["wikidata", "all"].includes(cmd)) await stepWikidata(communes);
if (["commons", "all"].includes(cmd)) await stepCommons();
if (["manifest", "assets", "all"].includes(cmd)) {
  const manifest =
    cmd === "assets" && !UPDATE
      ? (await readJson(MANIFEST)) ?? (await stepManifest(communes))
      : await stepManifest(communes);
  if (["assets", "all"].includes(cmd)) await stepAssets(manifest);
}
