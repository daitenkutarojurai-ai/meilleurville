/**
 * Accès aux soins mesuré par commune : APL aux médecins généralistes (DREES)
 * + pharmacies et services d'urgences recensés (Insee, BPE).
 *
 * Sources (Licence Ouverte / Etalab, attribution dans lib/city-healthcare.ts) :
 *   - DREES, « Indicateur d'accessibilité potentielle localisée (APL) aux
 *     médecins généralistes », millésime 2024 (classeur xlsx, feuille
 *     « APL 2024 »). Unité : consultations/visites accessibles par an et par
 *     habitant standardisé. Le calcul tient compte des médecins des communes
 *     voisines (décroissance avec la distance) : c'est ce qui fait la
 *     différence avec une simple densité communale, qui ferait passer
 *     Villeurbanne pour un désert à côté de Lyon. France hors Mayotte.
 *   - Insee, Base permanente des équipements (BPE) au 1er janvier 2025, via
 *     l'API Melodi (jeu DS_BPE, sans jeton) : D265 médecin généraliste
 *     (libéral), D307 pharmacie, D106 urgences. Une commune absente de la
 *     réponse a zéro équipement de ce type.
 *   - geo.api.gouv.fr (IGN / Etalab) : centre de chaque commune, pour mesurer
 *     la distance à vol d'oiseau entre une ville sans service d'urgences et la
 *     commune la plus proche qui en compte un (centre à centre).
 *
 * Paris, Lyon et Marseille : la DREES publie par arrondissement. L'APL de la
 * commune est la moyenne des arrondissements pondérée par la population
 * standardisée, comme le prescrit la note du classeur ; la BPE publie déjà au
 * niveau de la commune.
 *
 * Classeurs xlsx lus sans dépendance : décompression via `unzip`, puis lecture
 * des chaînes partagées et de la feuille (XML).
 *
 *   node scripts/city-healthcare.mjs          # télécharge si besoin, puis génère
 *   node scripts/city-healthcare.mjs --force  # re-télécharge
 */

import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "city-healthcare");
const APL_XLSX = path.join(CACHE, "apl-medecins-generalistes.xlsx");
const APL_DIR = path.join(CACHE, "apl-xlsx");
const OUT = path.join(ROOT, "data", "city-healthcare.json");

const APL_URL =
  "https://data.drees.solidarites-sante.gouv.fr/api/datasets/1.0/530_l-accessibilite-potentielle-localisee-apl/attachments/indicateur_d_apl_aux_medecins_generalistes_xlsx/";
const APL_SHEET = "APL 2024";
const MELODI = "https://api.insee.fr/melodi/data/DS_BPE";
const BPE_TYPES = { gp: "D265", pharmacies: "D307", emergency: "D106" };
const GEO_URL = "https://geo.api.gouv.fr/communes?fields=code,nom,centre&format=json&geometry=centre";
const UA = "MaVilleIdeale/1.0 (+https://www.mavilleideale.fr; bonjour@mavilleideale.fr)";

/** Codes commune des arrondissements PLM, tels que la DREES les publie. */
const PLM = {
  "75056": Array.from({ length: 20 }, (_, i) => String(75101 + i)),
  "69123": Array.from({ length: 9 }, (_, i) => String(69381 + i)),
  "13055": Array.from({ length: 16 }, (_, i) => String(13201 + i)),
};

const log = (m) => console.log(`[healthcare] ${m}`);

async function cached(file, url, force, minBytes) {
  await fs.mkdir(CACHE, { recursive: true });
  if (!force) {
    try {
      if ((await fs.stat(file)).size > minBytes) return false;
    } catch {}
  }
  log(`téléchargement ${url}`);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${new URL(url).host} a répondu ${res.status}`);
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
  return true;
}

/** Le seed est parsé plutôt qu'importé (même raison que city-income.mjs). */
async function seedByInsee() {
  const src = await fs.readFile(path.join(ROOT, "data", "cities-seed.ts"), "utf8");
  const byCode = new Map();
  const re = /slug:\s*"([a-z0-9-]+)"[\s\S]{0,900}?inseeCode:\s*"([0-9AB]+)"/g;
  for (const m of src.matchAll(re)) if (!byCode.has(m[2])) byCode.set(m[2], m[1]);
  return byCode;
}

const unxml = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");

/** Lit une feuille xlsx en tableau de lignes { A: …, B: … }. */
async function readSheet(dir, sheetName) {
  const wb = await fs.readFile(path.join(dir, "xl", "workbook.xml"), "utf8");
  const rels = await fs.readFile(path.join(dir, "xl", "_rels", "workbook.xml.rels"), "utf8");
  const sheet = [...wb.matchAll(/<sheet [^>]*name="([^"]*)"[^>]*r:id="([^"]*)"/g)].find((m) => unxml(m[1]) === sheetName);
  if (!sheet) throw new Error(`feuille « ${sheetName} » absente du classeur`);
  const target = new RegExp(`Id="${sheet[2]}"[^>]*Target="([^"]*)"|Target="([^"]*)"[^>]*Id="${sheet[2]}"`).exec(rels);
  const sheetPath = path.join(dir, "xl", (target[1] ?? target[2]).replace(/^\/?xl\//, ""));

  const ssXml = await fs.readFile(path.join(dir, "xl", "sharedStrings.xml"), "utf8");
  const strings = [...ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    unxml([...m[1].matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((t) => t[1]).join("")),
  );

  const xml = await fs.readFile(sheetPath, "utf8");
  const rows = [];
  for (const r of xml.matchAll(/<row [^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = {};
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const body = c[3] ?? "";
      const v = /<v>([^<]*)<\/v>/.exec(body)?.[1];
      if (v !== undefined) cells[c[1]] = /t="s"/.test(c[2]) ? strings[Number(v)] : v;
      else {
        const t = /<t[^>]*>([^<]*)<\/t>/.exec(body)?.[1];
        if (t !== undefined) cells[c[1]] = unxml(t);
      }
    }
    rows.push(cells);
  }
  return rows;
}

async function loadApl(force) {
  const fresh = await cached(APL_XLSX, APL_URL, force, 1_000_000);
  try {
    if (fresh) throw new Error("re-décompresser");
    await fs.stat(path.join(APL_DIR, "xl", "workbook.xml"));
  } catch {
    log("décompression du classeur APL");
    await fs.rm(APL_DIR, { recursive: true, force: true });
    await execFileAsync("unzip", ["-o", "-q", APL_XLSX, "-d", APL_DIR]);
  }
  const rows = await readSheet(APL_DIR, APL_SHEET);
  const head = rows.findIndex((r) => r.A === "Code commune INSEE");
  if (head < 0) throw new Error("en-tête « Code commune INSEE » introuvable");
  if (!/^APL aux médecins généralistes$/.test(rows[head].C ?? "") || !/standardisée/.test(rows[head].G ?? "") || !/totale/.test(rows[head].H ?? ""))
    throw new Error(`colonnes inattendues : ${JSON.stringify(rows[head])}`);

  const byCode = new Map();
  let weighted = 0;
  let weights = 0;
  for (const r of rows.slice(head + 1)) {
    const apl = Number(r.C);
    const stdPop = Number(r.G);
    const pop = Number(r.H);
    if (!r.A || !Number.isFinite(apl) || !Number.isFinite(stdPop)) continue;
    byCode.set(r.A, { apl, stdPop, pop });
    weighted += apl * stdPop;
    weights += stdPop;
  }
  log(`APL 2024 : ${byCode.size} communes, moyenne nationale pondérée ${(weighted / weights).toFixed(2)}`);
  return { byCode, national: weighted / weights };
}

function aplFor(code, apl) {
  const parts = PLM[code];
  if (!parts) return apl.byCode.get(code) ?? null;
  let w = 0;
  let s = 0;
  let pop = 0;
  for (const p of parts) {
    const rec = apl.byCode.get(p);
    if (!rec) throw new Error(`arrondissement ${p} absent du classeur APL`);
    s += rec.apl * rec.stdPop;
    w += rec.stdPop;
    pop += rec.pop;
  }
  return { apl: s / w, stdPop: w, pop };
}

async function loadBpe(type, force) {
  const file = path.join(CACHE, `bpe-${type}.json`);
  await cached(file, `${MELODI}?GEO=COM&FACILITY_TYPE=${type}&maxResult=100000`, force, 1_000);
  const j = JSON.parse(await fs.readFile(file, "utf8"));
  if (j.paging?.next) throw new Error(`BPE ${type} : réponse paginée, maxResult insuffisant`);
  const years = new Set();
  const byCode = new Map();
  for (const o of j.observations) {
    if (o.dimensions.BPE_MEASURE !== "FACILITIES") continue;
    years.add(o.dimensions.TIME_PERIOD);
    byCode.set(o.dimensions.GEO.replace(/^\d{4}-COM-/, ""), o.measures.OBS_VALUE_NIVEAU.value);
  }
  log(`BPE ${type} : ${byCode.size} communes, millésime ${[...years].join(", ")}`);
  if (years.size !== 1) throw new Error(`BPE ${type} : plusieurs millésimes mélangés`);
  return { byCode, year: [...years][0] };
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function loadCentres(force) {
  const file = path.join(CACHE, "communes-centres.json");
  await cached(file, GEO_URL, force, 1_000_000);
  const list = JSON.parse(await fs.readFile(file, "utf8"));
  const byCode = new Map();
  for (const c of list) if (c.centre?.coordinates) byCode.set(c.code, { name: c.nom, at: c.centre.coordinates });
  log(`centres de communes : ${byCode.size}`);
  return byCode;
}

async function main() {
  const force = process.argv.includes("--force");
  const seed = await seedByInsee();
  log(`seed : ${seed.size} communes avec code Insee`);

  const apl = await loadApl(force);
  const bpe = {};
  for (const [key, type] of Object.entries(BPE_TYPES)) bpe[key] = await loadBpe(type, force);
  const centres = await loadCentres(force);
  const erSites = [...bpe.emergency.byCode.keys()]
    .map((code) => ({ code, ...centres.get(code) }))
    .filter((c) => c.at);
  log(`communes avec service d'urgences et centre connu : ${erSites.length}/${bpe.emergency.byCode.size}`);
  const population = JSON.parse(await fs.readFile(path.join(ROOT, "data", "city-population.json"), "utf8"));

  const cities = {};
  const noApl = [];
  const noPop = [];
  for (const [code, slug] of [...seed.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    const a = aplFor(code, apl);
    // Population de référence pour les densités : celle du classeur DREES
    // (recensement 2022), sinon notre fichier Insee (Mayotte n'est pas dans l'APL).
    const pop = Math.round(a?.pop ?? population[slug]?.pop2022 ?? 0);
    if (!a) noApl.push(slug);
    if (!pop) {
      noPop.push(slug);
      continue;
    }
    const rec = {};
    if (a) rec.apl = Number(a.apl.toFixed(2));
    rec.gp = bpe.gp.byCode.get(code) ?? 0;
    rec.pharmacies = bpe.pharmacies.byCode.get(code) ?? 0;
    rec.emergency = bpe.emergency.byCode.get(code) ?? 0;
    if (rec.emergency === 0) {
      const here = centres.get(code)?.at;
      if (!here) throw new Error(`centre introuvable pour ${slug} (${code})`);
      let best = null;
      for (const site of erSites) {
        const km = haversineKm(here, site.at);
        if (!best || km < best.km) best = { km, name: site.name };
      }
      rec.erKm = Number(best.km.toFixed(1));
      rec.erNearest = best.name;
    }
    rec.pop = pop;
    cities[slug] = rec;
  }

  const out = {
    meta: {
      aplYear: 2024,
      aplNational: Number(apl.national.toFixed(2)),
      bpeYear: Number(bpe.gp.year),
    },
    cities,
  };
  await fs.writeFile(OUT, JSON.stringify(out) + "\n");
  log(`écrit ${OUT} — ${Object.keys(cities).length}/${seed.size} communes`);
  log(`sans APL (${noApl.length}) : ${noApl.join(", ")}`);
  if (noPop.length) log(`sans population, écartées (${noPop.length}) : ${noPop.join(", ")}`);
}

main().catch((e) => {
  console.error(`[healthcare] échec : ${e.message}`);
  process.exit(1);
});
