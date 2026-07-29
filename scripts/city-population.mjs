/**
 * Population réelle par commune + structure par âge, depuis le recensement Insee.
 *
 * Source : « Évolution et structure de la population en 2022 », base communale
 * (base-cc-evol-struct-pop-2022, CSV zippé publié sur insee.fr). Millésimes
 * 2011 / 2016 / 2022 dans le même fichier, ce qui donne l'évolution sans
 * croiser deux publications.
 * Licence Ouverte / Open Licence Etalab — attribution obligatoire, cf.
 * INSEE_POP_CREDIT dans lib/city-population.ts.
 *
 * Ce que ça remplace : `lib/demography.ts` estimait le vieillissement et la
 * trajectoire depuis le département et la strate de population. C'était un
 * proxy assumé. Ici la part des 60 ans et plus et l'évolution 2016→2022 sont
 * mesurées commune par commune.
 *
 * Le fichier « France hors Mayotte » couvre les DROM sauf Mayotte ; les
 * communes non trouvées sont simplement absentes du JSON — les surfaces
 * doivent le dire plutôt que combler le trou.
 *
 *   node scripts/city-population.mjs          # télécharge si besoin, puis génère
 *   node scripts/city-population.mjs --force  # re-télécharge l'archive
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
const CACHE = path.join(ROOT, ".cache", "city-population");
const ZIP = path.join(CACHE, "base-cc-evol-struct-pop-2022_csv.zip");
const CSV = path.join(CACHE, "base-cc-evol-struct-pop-2022.CSV");
const OUT = path.join(ROOT, "data", "city-population.json");

const SOURCE_URL =
  "https://www.insee.fr/fr/statistiques/fichier/8581696/base-cc-evol-struct-pop-2022_csv.zip";
const UA = "MaVilleIdeale/1.0 (+https://www.mavilleideale.fr; bonjour@mavilleideale.fr)";

// Tranches d'âge du fichier. Insee coupe à 14/29/44/59/74/89/90+ — on garde
// ses bornes plutôt que d'en inventer d'autres par interpolation.
const AGE_COLUMNS = [
  ["a0014", "P22_POP0014"],
  ["a1529", "P22_POP1529"],
  ["a3044", "P22_POP3044"],
  ["a4559", "P22_POP4559"],
  ["a6074", "P22_POP6074"],
  ["a7589", "P22_POP7589"],
  ["a90p", "P22_POP90P"],
];

const log = (m) => console.log(`[population] ${m}`);

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
 *  rescaling z-score au chargement, inutile ici (même raison que city-income.mjs). */
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

  try {
    await fs.stat(CSV);
  } catch {
    log("décompression");
    await execFileAsync("unzip", ["-o", "-q", ZIP, "-d", CACHE]);
  }

  const byCode = await seedByInsee();
  log(`seed : ${byCode.size} communes avec code Insee`);

  const raw = await fs.readFile(CSV, "utf8");
  const lines = raw.split("\n");
  const header = lines[0].replaceAll('"', "").trim().split(";");
  const col = (name) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`colonne ${name} absente — le millésime Insee a changé`);
    return i;
  };
  const iPop22 = col("P22_POP");
  const iPop16 = col("P16_POP");
  const iPop11 = col("P11_POP");
  const ageIdx = AGE_COLUMNS.map(([key, name]) => [key, col(name)]);

  const out = {};
  for (let n = 1; n < lines.length; n++) {
    const line = lines[n];
    if (!line) continue;
    const f = line.split(";");
    const slug = byCode.get(f[0].replaceAll('"', ""));
    if (!slug) continue;

    const pop2022 = Math.round(Number(f[iPop22]));
    const pop2016 = Math.round(Number(f[iPop16]));
    const pop2011 = Math.round(Number(f[iPop11]));
    if (!Number.isFinite(pop2022) || pop2022 <= 0) continue;

    const ages = {};
    for (const [key, i] of ageIdx) {
      const v = Number(f[i]);
      // Le recensement publie des effectifs pondérés, non entiers.
      ages[key] = Number.isFinite(v) ? Number(v.toFixed(1)) : 0;
    }
    out[slug] = {
      pop2022,
      pop2016: Number.isFinite(pop2016) && pop2016 > 0 ? pop2016 : null,
      pop2011: Number.isFinite(pop2011) && pop2011 > 0 ? pop2011 : null,
      ages,
    };
  }

  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  await fs.writeFile(OUT, JSON.stringify(sorted, null, 2) + "\n");

  const missing = [...byCode.values()].filter((s) => !sorted[s]);
  log(`écrit ${OUT} — ${Object.keys(sorted).length}/${byCode.size} communes`);
  if (missing.length) log(`sans donnée publiée (${missing.length}) : ${missing.join(", ")}`);
}

main().catch((e) => {
  console.error(`[population] échec : ${e.message}`);
  process.exit(1);
});
