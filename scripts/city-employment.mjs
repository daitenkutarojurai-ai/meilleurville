/**
 * Marché du travail mesuré par commune — chômage, création d'entreprises,
 * salaires (Insee, API Melodi, sans jeton).
 *
 * Sources (Licence Ouverte / Etalab, attribution dans lib/city-employment.ts) :
 *   - Recensement de la population (jeu DS_RP_EMPLOI_LR_PRINC, millésime
 *     2023) : chômeurs et actifs de 15 à 64 ans résidant dans la commune. Le
 *     taux est celui « au sens du recensement » (déclaratif), pas le taux du
 *     BIT publié chaque trimestre par zone d'emploi : il tourne plus haut.
 *   - Recensement, emploi au lieu de travail (DS_RP_EMPLOI_LT_PRINC) : nombre
 *     d'emplois situés dans la commune en 2017 et en 2023, d'où l'évolution de
 *     l'emploi local. Écarté : le taux de création d'entreprises (SIDE), gonflé
 *     par l'auto-entreprenariat contraint (livraison, VTC) — Saint-Denis y
 *     sortait à 36 % et Lens à 25 % contre 18,5 % pour la France, ce qui aurait
 *     classé « dynamiques » des communes où l'emploi salarié manque.
 *   - Base tous salariés (DS_BTS_SAL_EQTP_SEX_AGE) : salaire net mensuel moyen
 *     en équivalent temps plein des emplois du **secteur privé situés dans la
 *     commune** (lieu de travail, pas de résidence). Secret statistique sur
 *     les plus petites communes : la valeur manque alors.
 *
 * Paris, Lyon et Marseille sont publiés au niveau de la commune entière.
 *
 *   node scripts/city-employment.mjs          # télécharge si besoin, puis génère
 *   node scripts/city-employment.mjs --force  # re-télécharge
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "city-employment");
const OUT = path.join(ROOT, "data", "city-employment.json");
const MELODI = "https://api.insee.fr/melodi/data";
const UA = "MaVilleIdeale/1.0 (+https://www.mavilleideale.fr; bonjour@mavilleideale.fr)";

const RP_YEAR = 2023;
const JOBS_FROM = 2017;
const SALARY_YEAR = 2024;

const log = (m) => console.log(`[employment] ${m}`);

/** Une requête Melodi filtrée, mise en cache ; renvoie Map(code → valeur). */
async function melodi(name, dataset, filters, force) {
  await fs.mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, `${name}.json`);
  let body;
  if (!force) {
    try {
      body = await fs.readFile(file, "utf8");
    } catch {}
  }
  if (!body) {
    const qs = new URLSearchParams({ ...filters, maxResult: "100000" });
    const url = `${MELODI}/${dataset}?${qs}`;
    log(`téléchargement ${url}`);
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`Melodi ${dataset} a répondu ${res.status}`);
    body = await res.text();
    await fs.writeFile(file, body);
  }
  const j = JSON.parse(body);
  if (j.paging?.next) throw new Error(`${name} : réponse paginée, maxResult insuffisant`);
  const map = new Map();
  for (const o of j.observations) {
    const v = o.measures?.OBS_VALUE_NIVEAU?.value;
    if (typeof v !== "number") continue;
    map.set(o.dimensions.GEO.replace(/^\d{4}-(COM|FRANCE)-/, (_m, kind) => (kind === "FRANCE" ? "FRANCE-" : "")), v);
  }
  return map;
}

/** Commune + France entière, mêmes filtres. */
async function both(name, dataset, filters, force) {
  const com = await melodi(`${name}-com`, dataset, { GEO: "COM", ...filters }, force);
  const fr = await melodi(`${name}-fr`, dataset, { GEO: "FRANCE-F", ...filters }, force);
  const nat = fr.get("FRANCE-F");
  if (nat === undefined) throw new Error(`${name} : valeur France introuvable`);
  log(`${name} : ${com.size} communes, France ${nat}`);
  return { com, nat };
}

async function seedByInsee() {
  const src = await fs.readFile(path.join(ROOT, "data", "cities-seed.ts"), "utf8");
  const byCode = new Map();
  const re = /slug:\s*"([a-z0-9-]+)"[\s\S]{0,900}?inseeCode:\s*"([0-9AB]+)"/g;
  for (const m of src.matchAll(re)) if (!byCode.has(m[2])) byCode.set(m[2], m[1]);
  return byCode;
}

async function main() {
  const force = process.argv.includes("--force");
  const seed = await seedByInsee();
  log(`seed : ${seed.size} communes avec code Insee`);

  const rp = { TIME_PERIOD: String(RP_YEAR), AGE: "Y15T64", SEX: "_T", EDUC: "_T" };
  const unemployed = await both("rp-chomeurs", "DS_RP_EMPLOI_LR_PRINC", { ...rp, EMPSTA_ENQ: "2" }, force);
  const active = await both("rp-actifs", "DS_RP_EMPLOI_LR_PRINC", { ...rp, EMPSTA_ENQ: "1T2" }, force);

  const lt = { SEX: "_T", EMPFORM: "_T", WKTIME: "_T", AGE: "_T" };
  const jobsThen = await both(`rp-emplois-${JOBS_FROM}`, "DS_RP_EMPLOI_LT_PRINC", { ...lt, TIME_PERIOD: String(JOBS_FROM) }, force);
  const jobsNow = await both(`rp-emplois-${RP_YEAR}`, "DS_RP_EMPLOI_LT_PRINC", { ...lt, TIME_PERIOD: String(RP_YEAR) }, force);
  const salary = await both("bts-salaire", "DS_BTS_SAL_EQTP_SEX_AGE", { TIME_PERIOD: String(SALARY_YEAR), SEX: "_T", AGE: "_T" }, force);

  const cities = {};
  const missing = { unemployment: [], jobs: [], salary: [] };
  for (const [code, slug] of [...seed.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    const rec = {};
    const u = unemployed.com.get(code);
    const a = active.com.get(code);
    if (u !== undefined && a) {
      rec.unemployment = Number(((u / a) * 100).toFixed(1));
      rec.active = Math.round(a);
    } else missing.unemployment.push(slug);
    const j0 = jobsThen.com.get(code);
    const j1 = jobsNow.com.get(code);
    if (j0 && j1) {
      rec.jobs = Math.round(j1);
      rec.jobGrowth = Number((((j1 - j0) / j0) * 100).toFixed(1));
    } else missing.jobs.push(slug);
    const sal = salary.com.get(code);
    if (sal) rec.salary = Math.round(sal);
    else missing.salary.push(slug);
    if (Object.keys(rec).length) cities[slug] = rec;
  }

  const out = {
    meta: {
      rpYear: RP_YEAR,
      unemploymentNational: Number(((unemployed.nat / active.nat) * 100).toFixed(1)),
      jobsFrom: JOBS_FROM,
      jobGrowthNational: Number((((jobsNow.nat - jobsThen.nat) / jobsThen.nat) * 100).toFixed(1)),
      salaryYear: SALARY_YEAR,
      salaryNational: Math.round(salary.nat),
    },
    cities,
  };
  await fs.writeFile(OUT, JSON.stringify(out) + "\n");
  log(`écrit ${OUT} — ${Object.keys(cities).length}/${seed.size} communes`);
  log(`France : chômage ${out.meta.unemploymentNational} %, emploi ${out.meta.jobGrowthNational} %, salaire ${out.meta.salaryNational} €`);
  for (const [k, v] of Object.entries(missing)) log(`sans ${k} (${v.length}) : ${v.join(", ")}`);
}

main().catch((e) => {
  console.error(`[employment] échec : ${e.message}`);
  process.exit(1);
});
