#!/usr/bin/env node
/**
 * Salles et spots sportifs par ville — salles de sport / fitness, spots de street
 * workout, box CrossFit, salles d'escalade. Demande du propriétaire, 2026-10-22.
 *
 *   node scripts/city-sport-spots.mjs                 # collecte les villes absentes, plus peuplées d'abord
 *   node scripts/city-sport-spots.mjs --limit=50      # taille du lot (défaut 80)
 *   node scripts/city-sport-spots.mjs --slug=lyon     # une seule ville
 *   node scripts/city-sport-spots.mjs --force         # recollecte même les villes déjà présentes
 *   node scripts/city-sport-spots.mjs stats           # ce que contient data/city-sport-spots.json
 *   node scripts/city-sport-spots.mjs merge           # replie les fichiers de workers dans le JSON
 *
 * Collecte parallèle (3 workers, chacun commençant sur un miroir Overpass différent) :
 *   for i in 0 1 2; do node scripts/city-sport-spots.mjs --limit=700 \
 *     --shards=3 --shard=$i --out=.cache/city-sport-spots/shards/$i.json & done; wait
 *   node scripts/city-sport-spots.mjs merge
 *
 * Source : OpenStreetMap via l'API Overpass, une requête par commune, ancrée sur la
 * limite administrative dont le `ref:INSEE` correspond au seed (même méthode et même
 * canari que scripts/city-parks.mjs : un miroir à extrait régional répond 200 avec
 * une liste vide, ce qu'on refuse d'enregistrer comme « aucune salle »).
 *
 * Ce que le fichier dit, et ce qu'il ne dit pas :
 *   — c'est ce qui est CARTOGRAPHIÉ dans OSM, pas un annuaire exhaustif. Une salle
 *     absente d'OSM est absente ici ; les surfaces le disent.
 *   — les box CrossFit sont rarement balisées `sport=crossfit` : on les reconnaît
 *     aussi au nom (« CrossFit », « cross training ») d'une salle de sport.
 *   — un spot de street workout est souvent un groupe d'agrès cartographiés un par
 *     un (`leisure=fitness_station`, `fitness_station=horizontal_bar`…) : on
 *     regroupe les agrès à moins de 80 m en un seul spot et on garde le nombre
 *     d'agrès. Un spot sans nom reste un lieu réel, avec ses coordonnées.
 *   — les comptes (`counts`) sont complets ; la liste (`spots`) est plafonnée par
 *     catégorie aux plus proches du centre-ville (coordonnées du seed).
 *
 * ODbL : © les contributeurs OpenStreetMap. Toute page qui affiche ces entrées DOIT
 * porter l'attribution avec elles (même règle que les parcs, F59).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, ".cache", "city-sport-spots");
const SHARD_DIR = path.join(CACHE_DIR, "shards");
const OUT_JSON = path.join(ROOT, "data", "city-sport-spots.json");
const SEED_TS = path.join(ROOT, "data", "cities-seed.ts");

const UA = "MaVilleIdeale/1.0 (https://www.mavilleideale.fr; daitenkutarojurai@gmail.com) node-fetch";
const OVERPASS_HOSTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--")) ?? "crawl";
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const LIMIT = Number(opt("limit") ?? 80);
const ONLY_SLUG = opt("slug") ?? null;
const FORCE = flag("force");
const SHARD = Number(opt("shard") ?? 0);
const SHARDS = Number(opt("shards") ?? 1);
const OUT = opt("out") ?? null;
const MIN_SLEEP_MS = 4000;
const QUERY_VERSION = 1;

/** Plafond de la liste par catégorie (les comptes, eux, restent complets). */
const CAP = { fitness: 25, street: 25, crossfit: 12, climbing: 12 };
const STREET_CLUSTER_M = 80;
const SAME_PLACE_M = 60;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

async function loadSeed() {
  const src = await fs.readFile(SEED_TS, "utf8");
  const out = [];
  for (const b of src.split(/\r?\n {2}\{\r?\n/).slice(1)) {
    const s = (k) => b.match(new RegExp(`${k}:\\s*"([^"]+)"`))?.[1] ?? null;
    const n = (k) => {
      const m = b.match(new RegExp(`${k}:\\s*(-?[\\d.]+)`));
      return m ? Number(m[1]) : null;
    };
    const slug = s("slug");
    const insee = s("inseeCode");
    if (!slug || !insee) continue;
    out.push({ slug, name: s("name"), inseeCode: insee, latitude: n("latitude"), longitude: n("longitude"), population: n("population") ?? 0 });
  }
  return out;
}

function buildQuery(insee) {
  return `[out:json][timeout:150];
relation["ref:INSEE"="${insee}"][boundary=administrative]->.canary;
area["ref:INSEE"="${insee}"][boundary=administrative][admin_level="8"]->.a;
(
  nwr["leisure"="fitness_centre"](area.a);
  nwr["leisure"="sports_centre"]["sport"~"fitness|crossfit|climbing|calisthenics"](area.a);
  nwr["leisure"="fitness_station"](area.a);
  nwr["sport"="calisthenics"](area.a);
  nwr["sport"="crossfit"](area.a);
  nwr["sport"="climbing"]["leisure"~"sports_centre|fitness_centre"](area.a);
);
out center tags;
.canary out tags;`;
}

function assertAreaResolved(json, insee, host) {
  const seen = (json.elements ?? []).some((el) => el.type === "relation" && el.tags?.["ref:INSEE"] === insee);
  if (!seen) throw new Error(`commune ${insee} does not resolve on ${host} (regional extract?) — refusing to record it as empty`);
}

async function overpass(query, insee) {
  let lastErr = null;
  // Le serveur principal d'abord pour tous les workers : le 2026-10-22 les deux
  // miroirs étaient saturés et l'un d'eux a rendu Lyon à 0 salle (89 en réalité).
  const k = 0;
  const hosts = OVERPASS_HOSTS.slice(k).concat(OVERPASS_HOSTS.slice(0, k));
  for (const host of hosts) {
    for (let i = 0; i < 4; i++) {
      let res;
      try {
        res = await fetch(host, {
          method: "POST",
          headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
          body: "data=" + encodeURIComponent(query),
        });
      } catch (err) {
        lastErr = err;
        await sleep(2 ** i * 1500);
        continue;
      }
      if (res.ok) {
        try {
          const json = await res.json();
          // Une requête qui expire côté serveur répond quand même 200, avec un
          // `remark` et une liste partielle (souvent vide) : c'est ainsi que
          // Marseille est d'abord sortie à 0 salle. On refuse, on réessaie.
          if (json.remark && /timed out|out of memory|runtime error/i.test(json.remark)) {
            throw new Error(`Overpass remark on ${host}: ${json.remark.slice(0, 120)}`);
          }
          assertAreaResolved(json, insee, host);
          return json;
        } catch (err) {
          lastErr = err;
          await sleep(2 ** i * 1500);
          continue;
        }
      }
      if (res.status === 403 || res.status === 407) throw new Error(`Overpass blocked at proxy layer (${res.status}) — ${host}`);
      const retryAfter = Number(res.headers.get("retry-after")) * 1000;
      if (i === 3) { lastErr = new Error(`${res.status} ${res.statusText} — ${host}`); break; }
      await sleep(retryAfter || 2 ** i * 2000 + Math.random() * 500);
    }
  }
  throw lastErr ?? new Error("Overpass: all endpoints exhausted");
}

/* ── classification ─────────────────────────────────────────────────────── */

const CROSSFIT_NAME = /cross\s?-?fit|cross[\s-]?training|\bbox\b/i;
const CLOSED_ACCESS = new Set(["private", "no"]);

/** Une seule catégorie par élément, la plus spécifique d'abord. */
export function classify(t) {
  const sport = (t.sport ?? "").toLowerCase();
  const name = t.name ?? "";
  if (sport.includes("crossfit")) return "crossfit";
  if ((t.leisure === "fitness_centre" || t.leisure === "sports_centre") && CROSSFIT_NAME.test(name) && !/boxe|boxing/i.test(name)) return "crossfit";
  if (sport.includes("climbing")) return "climbing";
  if (t.leisure === "fitness_station" || sport.includes("calisthenics")) return "street";
  if (t.leisure === "fitness_centre" || /fitness|gym|bodybuilding/.test(sport)) return "fitness";
  return null;
}

function distM(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function pointOf(el) {
  if (el.type === "node" && el.lat != null) return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return null;
}

export function extractSpots(elements, center) {
  const raw = [];
  for (const el of elements) {
    if (el.type === "relation" && el.tags?.boundary === "administrative") continue;
    const t = el.tags ?? {};
    if (t.access && CLOSED_ACCESS.has(t.access)) continue;
    const kind = classify(t);
    if (!kind) continue;
    const pt = pointOf(el);
    if (!pt) continue;
    raw.push({
      kind,
      name: t.name ?? null,
      brand: t.brand ?? null,
      website: t.website ?? t["contact:website"] ?? null,
      indoor: t.indoor === "yes" ? true : t.indoor === "no" ? false : null,
      lat: pt.lat,
      lng: pt.lng,
      id: `${el.type[0]}${el.id}`,
    });
  }

  // Street workout : un spot = un groupe d'agrès à moins de STREET_CLUSTER_M.
  const street = raw.filter((s) => s.kind === "street");
  const clusters = [];
  for (const s of street) {
    const c = clusters.find((k) => distM(k, s) <= STREET_CLUSTER_M);
    if (c) {
      c.devices += 1;
      if (!c.name && s.name) c.name = s.name;
    } else clusters.push({ ...s, devices: 1 });
  }

  // Les autres catégories : un même lieu cartographié deux fois (nœud + bâtiment).
  const others = [];
  for (const s of raw.filter((x) => x.kind !== "street")) {
    const dup = others.find(
      (o) => o.kind === s.kind && distM(o, s) <= SAME_PLACE_M && (!o.name || !s.name || o.name.toLowerCase() === s.name.toLowerCase()),
    );
    if (dup) {
      dup.name ??= s.name;
      dup.brand ??= s.brand;
      dup.website ??= s.website;
    } else others.push(s);
  }

  const all = [...others, ...clusters];
  const counts = { fitness: 0, street: 0, crossfit: 0, climbing: 0 };
  for (const s of all) counts[s.kind] += 1;

  const spots = [];
  for (const kind of Object.keys(CAP)) {
    const list = all
      .filter((s) => s.kind === kind)
      .map((s) => ({ ...s, d: center ? distM(center, s) : 0 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, CAP[kind]);
    for (const s of list) {
      const o = { k: kind, n: s.name, lat: +s.lat.toFixed(5), lng: +s.lng.toFixed(5), id: s.id, km: +(s.d / 1000).toFixed(1) };
      if (s.brand && s.brand !== s.name) o.b = s.brand;
      if (s.website) o.w = s.website;
      if (s.devices) o.dev = s.devices;
      spots.push(o);
    }
  }
  return { counts, spots };
}

/* ── IO ─────────────────────────────────────────────────────────────────── */

async function readJson(p, fallback) {
  try { return JSON.parse(await fs.readFile(p, "utf8")); } catch { return fallback; }
}

function emptyFile() {
  return {
    meta: {
      source: "OpenStreetMap (Overpass API)",
      license: "ODbL — © les contributeurs OpenStreetMap",
      queryVersion: QUERY_VERSION,
      caps: CAP,
    },
    cities: {},
  };
}

async function writeOut(file, data) {
  const sorted = Object.fromEntries(Object.entries(data.cities).sort(([a], [b]) => a.localeCompare(b)));
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify({ meta: data.meta, cities: sorted }) + "\n");
}

async function crawl() {
  const seed = await loadSeed();
  const target = OUT ? path.resolve(ROOT, OUT) : OUT_JSON;
  const main = await readJson(OUT_JSON, emptyFile());
  const data = OUT ? await readJson(target, emptyFile()) : main;
  let todo = seed
    .filter((c) => (ONLY_SLUG ? c.slug === ONLY_SLUG : true))
    .filter((c) => FORCE || ONLY_SLUG || !main.cities[c.slug])
    .sort((a, b) => b.population - a.population);
  if (SHARDS > 1) todo = todo.filter((_, i) => i % SHARDS === SHARD);
  todo = todo.filter((c) => FORCE || ONLY_SLUG || !data.cities[c.slug]).slice(0, LIMIT);
  log(`[sport-spots] shard ${SHARD}/${SHARDS} — ${todo.length} villes à collecter → ${path.relative(ROOT, target)}`);
  let done = 0;
  for (const c of todo) {
    const t0 = Date.now();
    try {
      const json = await overpass(buildQuery(c.inseeCode), c.inseeCode);
      const center = c.latitude != null ? { lat: c.latitude, lng: c.longitude } : null;
      const { counts, spots } = extractSpots(json.elements ?? [], center);
      // Garde-fou : une ville de 20 000 habitants ou plus sans aucun lieu cartographié
      // est presque toujours une réponse tronquée d'un serveur surchargé (Lyon à 0 le
      // 2026-10-22). On ne l'écrit pas ; elle sera reprise à la passe suivante.
      if (c.population >= 20000 && !Object.values(counts).some(Boolean)) {
        throw new Error(`réponse vide suspecte pour ${c.population} habitants — non enregistrée`);
      }
      data.cities[c.slug] = { at: new Date().toISOString().slice(0, 10), v: QUERY_VERSION, counts, spots };
      done++;
      log(`  ${c.slug.padEnd(28)} salles ${counts.fitness} · street ${counts.street} · crossfit ${counts.crossfit} · escalade ${counts.climbing}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      if (done % 5 === 0) await writeOut(target, data);
    } catch (err) {
      log(`  ${c.slug.padEnd(28)} ÉCHEC — ${err.message}`);
      if (/blocked at proxy/.test(err.message)) break;
    }
    await sleep(MIN_SLEEP_MS);
  }
  await writeOut(target, data);
  log(`[sport-spots] ${done} villes écrites.`);
}

async function merge() {
  const data = await readJson(OUT_JSON, emptyFile());
  let files = [];
  try { files = (await fs.readdir(SHARD_DIR)).filter((f) => f.endsWith(".json")); } catch {}
  let n = 0;
  for (const f of files) {
    const shard = await readJson(path.join(SHARD_DIR, f), null);
    for (const [slug, row] of Object.entries(shard?.cities ?? {})) {
      if (!data.cities[slug] || row.at >= data.cities[slug].at) { data.cities[slug] = row; n++; }
    }
  }
  data.meta = emptyFile().meta;
  await writeOut(OUT_JSON, data);
  log(`[sport-spots] merge : ${n} lignes repliées depuis ${files.length} fichier(s) → ${Object.keys(data.cities).length} villes.`);
}

async function stats() {
  const seed = await loadSeed();
  const data = await readJson(OUT_JSON, emptyFile());
  const rows = Object.entries(data.cities);
  const tot = { fitness: 0, street: 0, crossfit: 0, climbing: 0 };
  const none = [];
  for (const [slug, r] of rows) {
    for (const k of Object.keys(tot)) tot[k] += r.counts[k];
    if (!Object.values(r.counts).some(Boolean)) none.push(slug);
  }
  log(`${rows.length}/${seed.length} villes collectées.`);
  log(`Totaux : salles ${tot.fitness}, spots street workout ${tot.street}, box CrossFit ${tot.crossfit}, escalade ${tot.climbing}.`);
  log(`Villes sans aucun lieu cartographié (${none.length}) : ${none.join(", ") || "aucune"}`);
  const missing = seed.filter((c) => !data.cities[c.slug]).map((c) => c.slug);
  if (missing.length) log(`Manquantes (${missing.length}) : ${missing.slice(0, 40).join(", ")}${missing.length > 40 ? "…" : ""}`);
}

if (cmd === "stats") await stats();
else if (cmd === "merge") await merge();
else await crawl();
