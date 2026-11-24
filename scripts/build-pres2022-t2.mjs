#!/usr/bin/env node
/**
 * data/presidential-2022-t2.json — 2nd round of the 2022 presidential election
 * (24 April, Macron vs Le Pen) for every city of data/political-lean.json.
 *
 * Source: Ministère de l'Intérieur via data.gouv.fr, "Election présidentielle
 * des 10 et 24 avril 2022 - Résultats définitifs du 2nd tour", per-commune TXT
 * (`resultats-par-niveau-subcom-t2-france-entiere.txt`, ISO-8859-1,
 * ';'-separated, 33 columns: 19 fixed, then one 7-column block per candidate).
 * Paris, Lyon and Marseille are single communes in this file, like the 1st-round
 * aggregation. Cities are matched on the INSEE code political-lean.json already
 * carries, so both rounds always describe the same commune.
 *
 *   npm run pres2022-t2            # rebuild the file
 *   npm run pres2022-t2 -- --check # rebuild in memory, report diffs, write nothing
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEAN = path.join(ROOT, "data", "political-lean.json");
const OUT = path.join(ROOT, "data", "presidential-2022-t2.json");
const CACHE = path.join(ROOT, ".cache", "political-lean");
const SRC = path.join(CACHE, "pres2022_t2_com.txt");
const SRC_URL = "https://www.data.gouv.fr/api/1/datasets/r/11a736be-748f-470b-b2c6-b8ba09b48938";
const CHECK = process.argv.includes("--check");

const BASE_COLS = 19;
const BLOCK = 7;
// Same rule as build-political-lean.mjs: only these Z* codes are DROM with 97xxx
// INSEE codes; ZZ (Français de l'étranger) must never merge into a commune.
const DROM_DEPS = new Set(["ZA", "ZB", "ZC", "ZD", "ZM"]);

function inseeFrom(dep, com) {
  com = com.padStart(3, "0");
  if (dep.startsWith("Z")) return DROM_DEPS.has(dep) ? "97" + com : null;
  if (dep === "2A" || dep === "2B") return dep + com;
  return dep.padStart(2, "0") + com;
}
const round1 = (x) => Math.round(x * 10) / 10;

async function ensureSource() {
  if (fs.existsSync(SRC) && fs.statSync(SRC).size > 5e6) return;
  fs.mkdirSync(CACHE, { recursive: true });
  console.error(`downloading ${SRC_URL}`);
  const res = await fetch(SRC_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`source download failed: HTTP ${res.status}`);
  fs.writeFileSync(SRC, Buffer.from(await res.arrayBuffer()));
}

await ensureSource();
const byInsee = new Map();
const lines = new TextDecoder("latin1").decode(fs.readFileSync(SRC)).split(/\r?\n/);
for (let li = 1; li < lines.length; li++) {
  const row = lines[li].split(";");
  if (row.length < BASE_COLS + BLOCK) continue;
  const insee = inseeFrom(row[0], row[2]);
  if (insee === null) continue;
  const n = (i) => Number.parseInt(row[i], 10) || 0;
  const votes = {};
  for (let i = BASE_COLS; i <= row.length - BLOCK; i += BLOCK) {
    const nom = row[i + 2].normalize("NFD").replace(/\p{Mn}/gu, "").toUpperCase().trim();
    votes[nom === "LE PEN" ? "lepen" : nom === "MACRON" ? "macron" : nom] = n(i + 4);
  }
  byInsee.set(insee, { inscrits: n(5), abstentions: n(6), votants: n(8), blancs: n(10), nuls: n(13), exprimes: n(16), votes });
}

const lean = JSON.parse(fs.readFileSync(LEAN, "utf8"));
const out = {};
const missing = [];
for (const [slug, e] of Object.entries(lean)) {
  const r = byInsee.get(e.insee);
  if (!r || !r.exprimes || r.votes.macron == null || r.votes.lepen == null) {
    missing.push(slug);
    continue;
  }
  out[slug] = {
    macron: round1((r.votes.macron * 100) / r.exprimes),
    lepen: round1((r.votes.lepen * 100) / r.exprimes),
    abstentionPct: round1((r.abstentions * 100) / r.inscrits),
    blancsNulsPct: round1(((r.blancs + r.nuls) * 100) / r.votants),
    exprimes: r.exprimes,
  };
}

// One city per line: diffs stay readable when a value moves.
const body = "{\n" + Object.entries(out).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}\n";
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
console.log(`communes in source: ${byInsee.size} · cities: ${Object.keys(out).length}/${Object.keys(lean).length} · changed: ${prev !== body}`);
if (missing.length) console.log(`MISSING (${missing.length}): ${missing.join(", ")}`);
if (!CHECK) fs.writeFileSync(OUT, body);
