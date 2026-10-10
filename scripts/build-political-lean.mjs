#!/usr/bin/env node
/**
 * data/political-lean.json from the official 2022 presidential first round.
 *
 * Node port of scripts/build-political-lean.py, which hard-coded the retired
 * Linux machine's paths and needed Python — so the cities added by the seed
 * extension (F34) never got a political block. Same source, same aggregation,
 * same output shape; it now downloads its own source into .cache/.
 *
 * Source: Ministère de l'Intérieur via data.gouv.fr, "Election présidentielle
 * des 10 et 24 avril 2022 - Résultats définitifs du 1er tour", per polling
 * station TXT (ISO-8859-1, ';'-separated, ~36 MB). The file is WIDE: 21 fixed
 * columns, then one 7-column block per candidate.
 *
 *   npm run political-lean            # add the seed cities missing from the file
 *   npm run political-lean -- --all   # recompute every city
 *   npm run political-lean -- --check # recompute all, report diffs, write nothing
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEED = path.join(ROOT, "data", "cities-seed.ts");
const OUT = path.join(ROOT, "data", "political-lean.json");
const CACHE = path.join(ROOT, ".cache", "political-lean");
const SRC = path.join(CACHE, "pres2022_t1_bv.txt");
const SRC_URL = "https://www.data.gouv.fr/api/1/datasets/r/79b5cac4-4957-486b-bbda-322d80868224";

const ALL = process.argv.includes("--all");
const CHECK = process.argv.includes("--check");

const BASE_COLS = 21;
const BLOCK = 7;

const BLOC = {
  ARTHAUD: "gauche", ROUSSEL: "gauche", MELENCHON: "gauche",
  HIDALGO: "gauche", JADOT: "gauche", POUTOU: "gauche",
  MACRON: "centre",
  PECRESSE: "droite", LASSALLE: "droite",
  "LE PEN": "extreme_droite", ZEMMOUR: "extreme_droite", "DUPONT-AIGNAN": "extreme_droite",
};
const SLUG = {
  ARTHAUD: "arthaud", ROUSSEL: "roussel", MELENCHON: "melenchon",
  HIDALGO: "hidalgo", JADOT: "jadot", POUTOU: "poutou",
  MACRON: "macron", PECRESSE: "pecresse", LASSALLE: "lassalle",
  "LE PEN": "lepen", ZEMMOUR: "zemmour", "DUPONT-AIGNAN": "dupont-aignan",
};
const BLOC_KEYS = ["gauche", "centre", "droite", "extreme_droite"];
// Only these Z* codes are overseas départements whose communes carry a 97xxx
// INSEE code; the other Z* blocks (ZZ = Français de l'étranger above all)
// collide with them and silently merged embassy votes into Antilles communes.
const DROM_DEPS = new Set(["ZA", "ZB", "ZC", "ZD", "ZM"]);
const MANUAL_INSEE = { venissieux: "69259" };

const stripAccents = (s) => s.normalize("NFD").replace(/\p{Mn}/gu, "");
const normName = (s) =>
  stripAccents(s).toLowerCase().replace(/[''`]/g, " ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

function inseeFrom(dep, com) {
  com = com.padStart(3, "0");
  if (dep.startsWith("Z")) return DROM_DEPS.has(dep) ? "97" + com : null;
  if (dep === "2A" || dep === "2B") return dep + com;
  return dep.padStart(2, "0") + com;
}

// Python's round(x, 1): ties (exact binary halves only) go to the even digit.
function round1(x) {
  const t = x * 10;
  const f = Math.floor(t);
  if (t - f === 0.5) return (f % 2 === 0 ? f : f + 1) / 10;
  return Number(x.toFixed(1));
}

async function ensureSource() {
  if (fs.existsSync(SRC) && fs.statSync(SRC).size > 1e7) return;
  fs.mkdirSync(CACHE, { recursive: true });
  console.error(`downloading ${SRC_URL}`);
  const res = await fetch(SRC_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`source download failed: HTTP ${res.status}`);
  fs.writeFileSync(SRC, Buffer.from(await res.arrayBuffer()));
}

function parseSeed() {
  const recs = [];
  let cur = null;
  for (const line of fs.readFileSync(SEED, "utf8").split(/\r?\n/)) {
    const m = line.match(/\bslug:\s*"([^"]+)"/);
    if (m) {
      if (cur) recs.push(cur);
      cur = { slug: m[1], name: null, dep: null, insee: null };
      continue;
    }
    if (!cur) continue;
    for (const [field, key] of [["name", "name"], ["department", "dep"], ["inseeCode", "insee"]]) {
      const mm = line.match(new RegExp(`\\b${field}:\\s*"([^"]+)"`));
      if (mm && cur[key] === null) cur[key] = mm[1];
    }
  }
  if (cur) recs.push(cur);
  const seen = new Set();
  return recs.filter((r) => (seen.has(r.slug) ? false : (seen.add(r.slug), true)));
}

function aggregate() {
  const voix = new Map();
  const meta = new Map();
  const nameIdx = new Map();
  const text = new TextDecoder("latin1").decode(fs.readFileSync(SRC));
  const lines = text.split(/\r?\n/);
  for (let li = 1; li < lines.length; li++) {
    const row = lines[li].split(";");
    if (row.length <= BASE_COLS) continue;
    const insee = inseeFrom(row[0], row[4]);
    if (insee === null) continue;
    nameIdx.set(`${normName(row[1])}|${normName(row[5])}`, insee);

    if (!meta.has(insee)) meta.set(insee, { inscrits: 0, abstentions: 0, votants: 0, blancs: 0, nuls: 0, exprimes: 0 });
    const m = meta.get(insee);
    for (const [col, key] of [[7, "inscrits"], [8, "abstentions"], [10, "votants"], [12, "blancs"], [15, "nuls"], [18, "exprimes"]]) {
      const n = Number.parseInt(row[col], 10);
      if (Number.isFinite(n)) m[key] += n;
    }
    if (!voix.has(insee)) voix.set(insee, new Map());
    const v = voix.get(insee);
    for (let i = BASE_COLS; i <= row.length - BLOCK; i += BLOCK) {
      const nom = stripAccents(row[i + 2]).toUpperCase().trim();
      if (!(nom in BLOC)) continue;
      const n = Number.parseInt(row[i + 4], 10);
      if (Number.isFinite(n)) v.set(nom, (v.get(nom) ?? 0) + n);
    }
  }
  return { voix, meta, nameIdx };
}

function entryFor(insee, matchedBy, v, m) {
  const exp = m.exprimes || 1;
  const cands = {};
  for (const k of Object.keys(BLOC)) if (v.get(k)) cands[SLUG[k]] = round1((v.get(k) * 100) / exp);
  const raw = Object.fromEntries(BLOC_KEYS.map((b) => [b, 0]));
  for (const [k, votes] of v) raw[BLOC[k]] += votes;
  const blocs = Object.fromEntries(BLOC_KEYS.map((b) => [b, round1((raw[b] * 100) / exp)]));
  // Winner on raw votes, not rounded shares (Colmar ties at 32.2 % rounded).
  const topBloc = BLOC_KEYS.reduce((a, b) => (raw[b] > raw[a] ? b : a));
  let topCand = null;
  for (const [k, n] of v) if (topCand === null || n > v.get(topCand)) topCand = k;
  const ins = m.inscrits || 1;
  return {
    lean: topBloc,
    topPct: blocs[topBloc],
    blocs,
    leanScore: round1(blocs.droite + blocs.extreme_droite - blocs.gauche),
    insee,
    matchedBy,
    cands,
    topCand: topCand ? SLUG[topCand] : null,
    topCandPct: topCand ? round1((v.get(topCand) * 100) / exp) : 0,
    turnout: {
      inscrits: m.inscrits,
      exprimes: m.exprimes,
      abstentionPct: round1((m.abstentions * 100) / ins),
      blancsNulsPct: round1(((m.blancs + m.nuls) * 100) / (m.votants || 1)),
    },
  };
}

// Same layout as Python's json.dump(indent=0): one token per line, no indent,
// and percentages keep Python's float form ("33.0", not "33") so a rebuild
// only diffs where a value really changed. Vote counts stay integers.
const serialize = (o) =>
  JSON.stringify(o, null, 1)
    .replace(/^ +/gm, "")
    .replace(/^("(?!inscrits"|exprimes")[\w-]+": )(-?\d+)(,?)$/gm, "$1$2.0$3");

await ensureSource();
const cities = parseSeed();
const { voix, meta, nameIdx } = aggregate();
console.error(`seed cities: ${cities.length} · communes aggregated: ${voix.size}`);

const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const out = {};
const unmatched = [];
const added = [];
let diffs = 0;
for (const c of cities) {
  if (!ALL && !CHECK && existing[c.slug]) {
    out[c.slug] = existing[c.slug];
    continue;
  }
  let insee = c.insee ?? MANUAL_INSEE[c.slug] ?? null;
  let matchedBy = c.insee ? "insee" : "manual";
  if (!insee || !voix.has(insee)) {
    insee = nameIdx.get(`${normName(c.dep ?? "")}|${normName(c.name ?? "")}`) ?? null;
    matchedBy = "name+dep";
  }
  if (!insee || !voix.has(insee)) {
    unmatched.push(c.slug);
    if (existing[c.slug]) out[c.slug] = existing[c.slug];
    continue;
  }
  const e = entryFor(insee, matchedBy, voix.get(insee), meta.get(insee));
  if (existing[c.slug]) {
    if (serialize(existing[c.slug]) !== serialize(e)) {
      diffs++;
      if (CHECK) console.log(`DIFF ${c.slug}`);
    }
  } else {
    added.push(c.slug);
  }
  out[c.slug] = e;
}

console.log(`entries: ${Object.keys(out).length}/${cities.length} · added: ${added.length} · changed vs file: ${diffs}`);
if (added.length) console.log(`added: ${added.join(", ")}`);
if (unmatched.length) console.log(`UNMATCHED (${unmatched.length}): ${unmatched.join(", ")}`);
if (!CHECK) fs.writeFileSync(OUT, serialize(out));
