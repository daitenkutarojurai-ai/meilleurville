/**
 * Niveau de vie médian + taux de pauvreté par commune, depuis Filosofi (Insee).
 *
 * Source : « Revenus, pauvreté et niveau de vie en 2021 », base communale
 * Filosofi 2021 en géographie 2025 (fichier CSV zippé publié sur insee.fr).
 * Licence Ouverte / Open Licence Etalab — attribution obligatoire, cf.
 * INSEE_CREDIT dans lib/city-income.ts.
 *
 * Le fichier est en format long : une ligne par (commune, mesure). On ne garde
 * que GEO_OBJECT=COM et deux mesures :
 *   MED_SL  — niveau de vie médian annuel, en euros
 *   PR_MD60 — taux de pauvreté au seuil de 60 % de la médiane, en %
 *
 * Attention au vocabulaire : le niveau de vie est un revenu disponible par
 * unité de consommation, PAS un salaire. Les surfaces doivent le nommer ainsi.
 *
 * ~10 communes du seed n'ont pas de valeur publiée (secret statistique sur les
 * petites communes, couverture Filosofi partielle en Guadeloupe / Guyane /
 * Mayotte). Elles sont absentes du JSON : les pages doivent le dire, pas
 * combler le trou.
 *
 *   node scripts/city-income.mjs          # télécharge si besoin, puis génère
 *   node scripts/city-income.mjs --force  # re-télécharge l'archive
 */

import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "city-income");
const ZIP = path.join(CACHE, "base-cc-filosofi-2021-geo2025_csv.zip");
const OUT = path.join(ROOT, "data", "city-income.json");

const SOURCE_URL =
  "https://www.insee.fr/fr/statistiques/fichier/7756729/base-cc-filosofi-2021-geo2025_csv.zip";
const UA = "MaVilleIdeale/1.0 (+https://www.mavilleideale.fr; bonjour@mavilleideale.fr)";

const log = (m) => console.log(`[income] ${m}`);

async function download(force) {
  await fs.mkdir(CACHE, { recursive: true });
  if (!force) {
    try {
      const st = await fs.stat(ZIP);
      if (st.size > 1_000_000) return log(`archive en cache (${(st.size / 1e6).toFixed(1)} Mo)`);
    } catch {}
  }
  log(`téléchargement ${SOURCE_URL}`);
  const res = await fetch(SOURCE_URL, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`insee.fr a répondu ${res.status}`);
  await pipeline(res.body, createWriteStream(ZIP));
  log(`archive écrite (${((await fs.stat(ZIP)).size / 1e6).toFixed(1)} Mo)`);
}

/** Le seed est parsé plutôt qu'importé : il fait tourner la calibration et le
 *  rescaling z-score au chargement, inutile ici (même raison que city-parks.mjs). */
async function seedByInsee() {
  const src = await fs.readFile(path.join(ROOT, "data", "cities-seed.ts"), "utf8");
  const byCode = new Map();
  const re = /slug:\s*"([a-z0-9-]+)"[\s\S]{0,900}?inseeCode:\s*"([0-9AB]+)"/g;
  for (const m of src.matchAll(re)) if (!byCode.has(m[2])) byCode.set(m[2], m[1]);
  return byCode;
}

async function main() {
  const force = process.argv.includes("--force");
  await download(force);

  const csvPath = path.join(CACHE, "DS_FILOSOFI_CC_data.csv");
  try {
    await fs.stat(csvPath);
  } catch {
    log("décompression");
    await execFileAsync("unzip", ["-o", "-q", ZIP, "-d", CACHE]);
  }

  const byCode = await seedByInsee();
  log(`seed : ${byCode.size} communes avec code Insee`);

  const raw = await fs.readFile(csvPath, "utf8");
  const wanted = new Set(["MED_SL", "PR_MD60"]);
  const found = new Map();
  let lineNo = 0;

  for (const line of raw.split("\n")) {
    if (lineNo++ === 0 || !line) continue;
    // "GEO";"GEO_OBJECT";"FILOSOFI_MEASURE";…;TIME_PERIOD;OBS_VALUE
    const f = line.split(";");
    if (f.length < 9) continue;
    const geo = f[0].replaceAll('"', "");
    const slug = byCode.get(geo);
    if (!slug || f[1].replaceAll('"', "") !== "COM") continue;
    const measure = f[2].replaceAll('"', "");
    if (!wanted.has(measure)) continue;
    const value = Number(f[8].trim());
    if (!Number.isFinite(value) || value === 0) continue;
    const rec = found.get(slug) ?? {};
    if (measure === "MED_SL") rec.medianIncome = Math.round(value);
    else rec.povertyRate = Number(value.toFixed(1));
    found.set(slug, rec);
  }

  // Une commune sans niveau de vie médian n'a rien à afficher : le taux de
  // pauvreté seul induirait en erreur (il est publié plus souvent).
  const out = {};
  for (const slug of [...found.keys()].sort()) {
    const rec = found.get(slug);
    if (rec.medianIncome) out[slug] = rec;
  }

  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  const missing = [...byCode.values()].filter((s) => !out[s]);
  log(`écrit ${OUT} — ${Object.keys(out).length}/${byCode.size} communes`);
  log(`sans donnée publiée (${missing.length}) : ${missing.join(", ")}`);
}

main().catch((e) => {
  console.error(`[income] échec : ${e.message}`);
  process.exit(1);
});
