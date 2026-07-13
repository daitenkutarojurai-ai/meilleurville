#!/usr/bin/env node
/**
 * Points of interest for the "things to do" guide series.
 *
 * For every `10-choses-a-faire-a-<city>` (FR) / `things-to-do-in-<city>` (EN)
 * guide, pulls the landmarks *located in that commune* from Wikidata (P131* →
 * the city item, with an image P18 and coordinates P625), matches them against
 * the guide's section headings, and builds a webp for each match.
 *
 *   node scripts/guide-pois.mjs pois     # 1. SPARQL: landmarks per city
 *   node scripts/guide-pois.mjs match    # 2. heading → landmark (+ report)
 *   node scripts/guide-pois.mjs assets   # 3. Commons metadata + webp
 *   node scripts/guide-pois.mjs all
 *
 * Flags: --force, --limit=N, --city=lyon
 *
 * A section only gets a landmark when the heading actually names it. Guides are
 * written around *activities* ("Monter à Fourvière à pied"), not landmark names,
 * so a fuzzy match would happily illustrate "eat in a bouchon" with a basilica.
 * Unmatched sections stay text-only — that is the correct outcome, not a gap.
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "guide-pois");
const POIS = path.join(CACHE, "pois.json");
const PHOTOS = path.join(ROOT, "public", "photos", "poi");
const OUT = path.join(ROOT, "data", "guide-pois.json");

const UA =
  "MaVilleIdeale/1.0 (https://www.mavilleideale.fr; daitenkutarojurai@gmail.com) node-fetch";

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--")) ?? "all";
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const FORCE = flag("force");
const LIMIT = Number(opt("limit") ?? Infinity);
const ONLY_CITY = opt("city");

const LICENSE_OK = /^(cc0|cc[ -]by|public domain|pd|fal|gfdl|attribution|copyrighted free use)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

async function get(url, { json = true, accept, tries = 5 } = {}) {
  for (let i = 0; i < tries; i++) {
    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": UA, ...(accept ? { Accept: accept } : {}) } });
    } catch (err) {
      if (i === tries - 1) throw err;
      await sleep(2 ** i * 1000);
      continue;
    }
    // WDQS occasionally emits a raw control character inside a label, which is
    // invalid JSON and makes res.json() throw. Strip them before parsing.
    if (res.ok && json)
      return JSON.parse((await res.text()).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ""));
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 404) return null;
    const ra = Number(res.headers.get("retry-after")) * 1000;
    if (i === tries - 1) throw new Error(`${res.status} — ${url}`);
    await sleep(ra || 2 ** i * 1000 + Math.random() * 500);
  }
  return null;
}

const readJson = (f, fb = null) => fs.readFile(f, "utf8").then(JSON.parse).catch(() => fb);
const writeJson = async (f, d) => {
  await fs.mkdir(path.dirname(f), { recursive: true });
  await fs.writeFile(f, JSON.stringify(d, null, 2) + "\n");
};

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/* ── guides in scope ────────────────────────────────────────────────────── */

// The guide files are 40k-line TS modules; a targeted parse beats importing
// them through a TS loader just to read slug + headings.
// FR only, on purpose. The FR series headings name places ("Monter à Fourvière",
// "Longer la Saône vers Île Barbe"), so a landmark can be attached to them with
// confidence. The EN `things-to-do-in-*` guides are thematic instead ("Croix-
// Rousse and the Presqu'île", "Riverside, parks and seasons") — there is no one
// landmark a section is about, and matching one anyway put the *théâtre* de la
// Croix-Rousse next to a paragraph about the district. EN keeps the city hero.
async function tourismGuides() {
  const out = [];
  for (const [file, re, locale] of [
    ["data/guides.ts", /^10-choses-a-faire-a-(.+)-2026$/, "fr"],
  ]) {
    const src = await fs.readFile(path.join(ROOT, file), "utf8");
    for (const block of src.split(/\n {2}\{\n/).slice(1)) {
      const slug = block.match(/slug: "([^"]+)"/)?.[1];
      if (!slug) continue;
      const m = slug.match(re);
      if (!m) continue;
      const body = block.split(/\n {4}relatedCities:/)[0];
      const headings = [...body.matchAll(/heading:\s*"((?:[^"\\]|\\.)*)"/g)].map((h) =>
        h[1].replace(/\\"/g, '"'),
      );
      out.push({ slug, citySlug: m[1], locale, headings });
    }
  }
  return out;
}

async function cityIndex() {
  const seed = await fs.readFile(path.join(ROOT, "data", "cities-seed.ts"), "utf8");
  const imgs = (await readJson(path.join(ROOT, "data", "city-images.json"), {})) ?? {};
  const idx = {};
  for (const b of seed.split(/\n {2}\{\n/).slice(1)) {
    const slug = b.match(/slug: "([^"]+)"/)?.[1];
    if (!slug) continue;
    idx[slug] = { name: b.match(/name: "([^"]+)"/)?.[1], qid: imgs[slug]?.qid ?? null };
  }
  return idx;
}

/* ── 1. pois ────────────────────────────────────────────────────────────── */

// P131* walks the administrative containment chain, so a landmark filed under an
// arrondissement (Lyon 5e) still comes back for Lyon.
//
// Class allow-list, applied client-side: resolving it in SPARQL (P31/P279*)
// blows past the 60s WDQS budget on a big commune. An item qualifies if it
// carries a heritage listing (P1435 — monument historique) or is directly typed
// as a visitable place. Without this gate the first pass illustrated "monter à
// Fourvière" with the *Fourvière Hôtel*, and the Croix-Rousse market with its
// railway station.
const POI_ALLOW = new Set([
  "Q16970", "Q2977", "Q163687", "Q108325", "Q160742", "Q44613", "Q1370598", "Q317557", // worship
  "Q33506", "Q207694", "Q2087181", "Q839954", "Q1497375", // museums, historic & archaeological sites
  "Q23413", "Q751876", "Q16560", "Q57821", "Q82117", "Q1785071", "Q1006443", // castles, palaces, walls
  "Q12280", "Q474", "Q158438", "Q39715", "Q12518", // bridges, aqueducts, lighthouses, towers
  "Q22698", "Q1107656", "Q167346", "Q22746", "Q39614", "Q43501", // parks, gardens, cemeteries, zoos
  "Q174782", "Q483453", "Q4989906", "Q5003624", "Q179700", // squares, fountains, monuments, statues
  "Q24354", "Q153562", "Q41253", "Q1362504", "Q330284", // theatres, opera, cinemas, market halls
  "Q570116", "Q2416723", "Q164142", "Q744099", // attractions, amphitheatres, hillforts
  "Q23397", "Q34038", "Q35509", "Q40080", "Q8502", // lakes, waterfalls, caves, beaches, mountains
]);

const sparql = (qid, limit) => `SELECT ?item ?fr ?en ?image ?coord ?type ?heritage ?links WHERE {
  ?item wdt:P131* wd:${qid} ; wdt:P18 ?image ; wdt:P625 ?coord ; wikibase:sitelinks ?links .
  FILTER(?item != wd:${qid})
  OPTIONAL { ?item wdt:P31 ?type }
  OPTIONAL { ?item wdt:P1435 ?heritage }
  OPTIONAL { ?item rdfs:label ?fr FILTER(LANG(?fr) = "fr") }
  OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en) = "en") }
} LIMIT ${limit}`;

async function stepPois(guides, cities) {
  const cache = (FORCE ? {} : await readJson(POIS, {})) ?? {};
  const slugs = [...new Set(guides.map((g) => g.citySlug))].filter(
    (s) => (!ONLY_CITY || s === ONLY_CITY) && !cache[s],
  );
  log(`pois: ${slugs.length} cities to query`);

  for (const slug of slugs) {
    const qid = cities[slug]?.qid;
    if (!qid) { log(`  ! ${slug}: no wikidata QID`); cache[slug] = []; continue; }

    // A query that blows the 60s budget doesn't fail cleanly: WDQS flushes the
    // rows it already produced, then appends a Java stack trace, so the body is
    // truncated JSON. Retry smaller rather than crash the run.
    let res = null;
    for (const limit of [15000, 6000, 2500]) {
      try {
        res = await get(
          "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql(qid, limit)),
          { accept: "application/sparql-results+json" },
        );
        break;
      } catch (err) {
        log(`  ~ ${slug}: limit ${limit} failed (${err.message.slice(0, 40)}), retrying smaller`);
        await sleep(2000);
      }
    }
    if (!res) { log(`  ! ${slug}: skipped, WDQS would not answer`); cache[slug] = []; continue; }

    const byQid = {};
    for (const b of res.results.bindings) {
      const q = b.item.value.split("/").pop();
      const coord = b.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
      byQid[q] ??= {
        qid: q,
        fr: b.fr?.value ?? null,
        en: b.en?.value ?? null,
        file: decodeURIComponent(b.image.value.split("Special:FilePath/").pop()).replace(/_/g, " "),
        lng: coord ? Number(coord[1]) : null,
        lat: coord ? Number(coord[2]) : null,
        links: Number(b.links?.value ?? 0),
        heritage: false,
        types: new Set(),
      };
      const rec = byQid[q];
      if (b.heritage) rec.heritage = true;
      if (b.type) rec.types.add(b.type.value.split("/").pop());
    }
    const kept = Object.values(byQid)
      .filter((p) => p.heritage || [...p.types].some((t) => POI_ALLOW.has(t)))
      .map(({ types, heritage, ...p }) => p);

    cache[slug] = kept;
    await writeJson(POIS, cache);
    log(`  ${slug}: ${kept.length} landmarks (of ${Object.keys(byQid).length} geolocated items)`);
    await sleep(1200);
  }
  return cache;
}

/* ── 2. match ───────────────────────────────────────────────────────────── */

// A landmark label is mostly furniture: "église Saint-Pierre" is église (generic)
// + Saint-Pierre (distinctive). A heading must hit a DISTINCTIVE token — matching
// on "église" alone would attach the first church in town to any heading that
// happens to mention a church.
const GENERIC = new Set(
  ("eglise cathedrale basilique chapelle abbaye musee museum parc jardin place rue pont chateau castle " +
   "theatre opera palais hotel maison tour tower fort citadelle monument statue fontaine halle marche " +
   "gare stade quartier centre vieux vieille grand grande petit petite saint sainte notre dame de du des " +
   "halles marches places ponts tours jardins parcs quais theatres chateaux eglises musees fete fetes " +
   "festival foire promenade berges bords rives " +
   "la le les l d et a of the ville city cite quai port plage lac mont rocher square garden park bridge " +
   "church cathedral house museum street old new").split(" "),
);

const tokens = (label) => norm(label).split(" ").filter((t) => t.length >= 4);
const distinctive = (label, cityName) => {
  const city = new Set(norm(cityName).split(" "));
  return tokens(label).filter((t) => !GENERIC.has(t) && !city.has(t));
};

const DETERMINERS = new Set(
  "de du des la le les l a au aux d et en un une sur dans vers pres the of in at to on a an".split(" "),
);

/** The label minus its leading furniture: "basilique Notre-Dame de Fourvière"
 *  → "fourviere", "abbaye de l'Île Barbe" → "ile barbe". This is the string a
 *  guide heading actually uses to name the place. */
const core = (label) => {
  const parts = norm(label).split(" ");
  while (parts.length > 1 && (GENERIC.has(parts[0]) || DETERMINERS.has(parts[0]))) parts.shift();
  return parts.join(" ");
};

/** The label's type noun — "théâtre" in "théâtre de la Croix-Rousse", null in
 *  "Le Louxor" (a bare proper name). Leading articles are skipped: taking "le"
 *  for the type noun made every "Le X" label look like a generic place. */
const typeNoun = (label) => {
  const parts = norm(label).split(" ");
  while (parts.length && DETERMINERS.has(parts[0])) parts.shift();
  return parts.length && GENERIC.has(parts[0]) ? parts[0] : null;
};


/**
 * True when the heading names a DIFFERENT kind of place than the landmark does.
 * "Croix-Rousse" is a district: the théâtre de la Croix-Rousse and its market
 * share a core label but are not the same place, and the heading is about the
 * market. Walk back from the core to the noun that governs it and compare.
 */
function conflicts(heading, label, c) {
  const words = heading.split(" ");
  const at = words.findIndex((_, i) => words.slice(i, i + c.split(" ").length).join(" ") === c);
  if (at <= 0) return false;
  let j = at - 1;
  while (j >= 0 && DETERMINERS.has(words[j])) j--;
  if (j < 0) return false;
  const governing = words[j];
  return GENERIC.has(governing) && governing !== typeNoun(label);
}

/**
 * Does the heading actually NAME this place, rather than merely share a word with
 * it? "les berges de Seine" shares "Seine" with the *square du quai de la Seine*;
 * "grimper à Montmartre" shares "Montmartre" with a *fontaine* named after it.
 * Neither heading names that place — so neither gets its photo.
 */
const names = (label, c, h) => {
  const t = typeNoun(label);
  return (
    c.split(" ").length >= 2 || // a multi-word core is specific on its own
    c.length >= 7 ||            // "fourviere", "confluences", "guillotiere"
    !t ||                       // a bare proper name: "Le Louxor"
    new RegExp(`\\b${t}`).test(h) // "parc du Thabor" ← "Parc du Thabor un matin"
  );
};

function matchSections(guide, pois, cityName) {
  const out = {};
  const usedCores = new Set();
  guide.headings.forEach((heading, i) => {
    const h = norm(heading);
    let best = null;
    for (const p of pois) {
      const label = guide.locale === "en" ? p.en ?? p.fr : p.fr ?? p.en;
      if (!label) continue;
      const c = core(label);
      // One landmark per core: without this both "place de Fourvière" and
      // "basilique Notre-Dame de Fourvière" attach themselves to the two
      // sections that mention the hill.
      if (usedCores.has(c)) continue;
      const dist = distinctive(label, cityName);
      if (!dist.length) continue;
      if (conflicts(h, label, c)) continue;

      // Strong: the heading carries the landmark's core label.
      const present =
        c.length >= 5 &&
        new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(h);
      let score = present && names(label, c, h) ? 100 + c.length : 0;

      // Weak: every distinctive token is present, the evidence is specific
      // enough to trust (a lone short token is not — "croix" hooked the église
      // Sainte-Croix onto "le marché de la Croix-Rousse"), and the heading does
      // not call the place something else than it is.
      const t = typeNoun(label);
      const specific = dist.length >= 2 || dist.some((tok) => tok.length >= 7);
      const rightKind = !t || new RegExp(`\\b${t}`).test(h);
      if (!score && specific && rightKind && dist.every((tok) => new RegExp(`\\b${tok}\\b`).test(h))) {
        score = 10 + dist.join("").length;
      }
      if (!score) continue;
      // Notability tiebreak: between the basilica and the square that share the
      // name "Fourvière", the one with encyclopedia articles is the landmark.
      if (p.links > 0) score += 6;
      if (!best || score > best.score) best = { poi: p, label, core: c, score };
    }
    if (best) {
      usedCores.add(best.core);
      out[i] = { ...best.poi, label: best.label };
    }
  });
  return out;
}

async function stepMatch(guides, cities, pois) {
  const matched = {};
  let sections = 0, hits = 0;
  for (const g of guides) {
    if (ONLY_CITY && g.citySlug !== ONLY_CITY) continue;
    const city = cities[g.citySlug];
    const m = matchSections(g, pois[g.citySlug] ?? [], city?.name ?? g.citySlug);
    sections += g.headings.length;
    hits += Object.keys(m).length;
    if (Object.keys(m).length) matched[g.slug] = { citySlug: g.citySlug, cityName: city?.name, locale: g.locale, sections: m };
  }
  log(`match: ${hits}/${sections} sections matched a landmark, across ${Object.keys(matched).length} guides`);
  await writeJson(path.join(CACHE, "matched.json"), matched);
  return matched;
}

/* ── 3. assets ──────────────────────────────────────────────────────────── */

/** Wikipedia article titles for the matched landmarks only — resolving them in
 *  SPARQL (schema:about over sitelinks) is what pushed the query past the
 *  60s timeout on the big communes. ~500 QIDs here instead of ~100k triples. */
async function wikiLinks(qids) {
  const out = new Map();
  for (let i = 0; i < qids.length; i += 50) {
    const batch = qids.slice(i, i + 50);
    const res = await get(
      "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks" +
        "&sitefilter=frwiki&ids=" + batch.join("|"),
    );
    for (const [qid, ent] of Object.entries(res.entities ?? {})) {
      const title = ent.sitelinks?.frwiki?.title;
      if (title) out.set(qid, `https://fr.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`);
    }
    await sleep(600);
  }
  return out;
}

const stripHtml = (s) => s?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() || null;
const firstHref = (s) => s?.match(/href="([^"]+)"/)?.[1]?.replace(/^\/\//, "https://") ?? null;

async function commonsInfo(files) {
  const out = new Map();
  for (let i = 0; i < files.length; i += 50) {
    const batch = files.slice(i, i + 50);
    const res = await get(
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" +
        "&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1200" +
        "&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl" +
        "&titles=" + batch.map((f) => encodeURIComponent("File:" + f)).join("|"),
    );
    for (const page of res.query?.pages ?? []) {
      const info = page.imageinfo?.[0];
      if (!info || page.missing) continue;
      const meta = info.extmetadata ?? {};
      out.set(page.title.replace(/^File:/, ""), {
        src: info.thumburl ?? info.url,
        author: stripHtml(meta.Artist?.value),
        authorUrl: firstHref(meta.Artist?.value),
        license: stripHtml(meta.LicenseShortName?.value),
        licenseUrl: meta.LicenseUrl?.value ?? null,
        commonsUrl: info.descriptionurl,
      });
    }
    log(`  commons ${Math.min(i + 50, files.length)}/${files.length}`);
    await sleep(1000);
  }
  return out;
}

async function stepAssets(matched) {
  await fs.mkdir(PHOTOS, { recursive: true });
  const prev = (FORCE ? {} : await readJson(OUT, {})) ?? {};

  const files = [...new Set(
    Object.values(matched).flatMap((g) => Object.values(g.sections).map((s) => s.file)),
  )];
  const info = await commonsInfo(files);
  const wikis = await wikiLinks([...new Set(
    Object.values(matched).flatMap((g) => Object.values(g.sections).map((s) => s.qid)),
  )]);

  const out = {};
  const keep = new Set();
  const built = new Map();
  let n = 0, rejected = 0;

  for (const [guideSlug, g] of Object.entries(matched)) {
    const sections = {};
    for (const [idx, poi] of Object.entries(g.sections)) {
      const meta = info.get(poi.file);
      if (!meta?.src || !meta.license || !LICENSE_OK.test(meta.license)) { rejected++; continue; }

      const before = prev[guideSlug]?.[idx];
      let img = built.get(poi.file) ?? null;
      if (!img && before?.file === poi.file &&
          await fs.access(path.join(ROOT, "public", before.src)).then(() => true, () => false)) {
        img = { src: before.src, width: before.width, height: before.height, color: before.color };
      }
      if (!img) {
        if (n >= LIMIT) continue;
        let buf;
        try { buf = await get(meta.src, { json: false }); } catch { continue; }
        if (!buf) continue;
        const base = sharp(buf, { failOn: "none" }).rotate();
        const { dominant: d } = await base.stats();
        const webp = await base
          .resize({ width: 640, height: 400, fit: "cover", position: "attention", withoutEnlargement: true })
          .webp({ quality: 70, effort: 5 })
          .toBuffer({ resolveWithObject: true });
        const hash = createHash("sha1").update(webp.data).digest("hex").slice(0, 8);
        const name = `${poi.qid}.${hash}.webp`;
        await fs.writeFile(path.join(PHOTOS, name), webp.data);
        img = {
          src: `/photos/poi/${name}`,
          width: webp.info.width,
          height: webp.info.height,
          color: "#" + [d.r, d.g, d.b].map((v) => v.toString(16).padStart(2, "0")).join(""),
        };
        built.set(poi.file, img);
        n++;
        await sleep(300);
      }
      keep.add(path.basename(img.src));
      sections[idx] = {
        name: poi.label,
        qid: poi.qid,
        lat: poi.lat,
        lng: poi.lng,
        wiki: wikis.get(poi.qid) ?? null,
        file: poi.file,
        ...img,
        author: meta.author,
        authorUrl: meta.authorUrl,
        license: meta.license,
        licenseUrl: meta.licenseUrl,
        commonsUrl: meta.commonsUrl,
      };
    }
    if (Object.keys(sections).length) out[guideSlug] = sections;
  }

  for (const f of await fs.readdir(PHOTOS)) {
    if (f.endsWith(".webp") && !keep.has(f)) await fs.rm(path.join(PHOTOS, f));
  }
  await writeJson(OUT, out);
  log(`assets: ${n} landmark photos built, ${Object.keys(out).length} guides illustrated (${rejected} rejected on licence)`);
}

/* ── run ────────────────────────────────────────────────────────────────── */

const guides = await tourismGuides();
const cities = await cityIndex();
log(`guides: ${guides.length} tourism guides (${new Set(guides.map((g) => g.citySlug)).size} cities)`);

const pois = ["pois", "all"].includes(cmd) ? await stepPois(guides, cities) : (await readJson(POIS, {})) ?? {};
if (cmd === "pois") process.exit(0);

const matched = ["match", "assets", "all"].includes(cmd)
  ? await stepMatch(guides, cities, pois)
  : {};
if (cmd === "match") process.exit(0);
if (["assets", "all"].includes(cmd)) await stepAssets(matched);
