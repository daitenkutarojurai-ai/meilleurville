/**
 * Prix de vente au m², séparément pour les appartements et les maisons, mesurés
 * sur les transactions réellement enregistrées — pas estimés.
 *
 * Source : DVF géolocalisé (Etalab), qui republie les « Demandes de valeurs
 * foncières » de la DGFiP commune par commune.
 *   https://files.data.gouv.fr/geo-dvf/latest/csv/<année>/communes/<dép>/<insee>.csv
 * Licence Ouverte / Open Licence Etalab — attribution obligatoire, cf.
 * DVF_CREDIT dans lib/property-prices.ts.
 *
 * Pourquoi ce fichier existe alors que `data/housing.ts` porte déjà un
 * `avgBuyPriceM2` : ce dernier est un repère éditorial unique, tous biens
 * confondus. Or l'écart appartement / maison est le premier chiffre que cherche
 * un acheteur, et il est loin d'être négligeable (Bordeaux 2024-2025 :
 * 4 130 €/m² en appartement contre 4 860 en maison). Les deux nombres coexistent
 * et ne mesurent pas la même chose — ne pas les fondre en un seul.
 *
 * Méthode, et les pièges qu'elle contourne :
 *  ① `valeur_fonciere` est le prix de la **mutation entière**, répété sur chaque
 *    ligne. Diviser ligne à ligne par la surface de la ligne surestime les ventes
 *    multi-lots. On regroupe donc par `id_mutation` et on ne garde que les
 *    mutations portant **exactement un** local bâti (maison ou appartement) —
 *    la vente d'immeuble et le lot de 12 appartements sortent.
 *  ② une même mutation revient sur plusieurs lignes (une par parcelle) : on
 *    déduplique sur (mutation, parcelle, surface, type) avant de compter.
 *  ③ les dépendances (garage, cave) accompagnent la plupart des ventes sans
 *    surface habitable : elles sont ignorées au dénominateur, donc le prix porté
 *    est celui du bien **avec** sa dépendance rapporté à la seule surface bâtie.
 *    C'est la convention des notaires, mais elle gonfle légèrement le €/m².
 *  ④ pour une maison, `valeur_fonciere` inclut le **terrain** et la surface est
 *    la seule surface bâtie. Là encore c'est la convention publiée, et les
 *    surfaces d'affichage doivent le dire — sinon le lecteur compare un prix
 *    avec jardin à un prix d'appartement.
 *
 * Trous de couverture, connus et voulus : DVF ne couvre **ni le Bas-Rhin (67),
 * ni le Haut-Rhin (68), ni la Moselle (57)** — régime du livre foncier — **ni
 * Mayotte (976)**. Ces communes sortent avec `coverage: "livre-foncier"` (ou
 * `"absent"`) et **aucun prix** : la page dit pourquoi il n'y a rien, elle ne
 * comble pas le trou avec le repère éditorial.
 *
 *   npm run property-prices               # crawl + génération (reprise auto)
 *   npm run property-prices -- --limit=40 # par lots
 *   npm run property-prices -- --force    # ignore le cache réseau
 *   npm run property-prices:selftest      # contrôles hors ligne
 *   npm run property-prices:stats         # état de la couverture
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "city-property-prices");
const OUT = path.join(ROOT, "data", "city-property-prices.json");

const UA = "MaVilleIdeale/1.0 (+https://www.mavilleideale.fr; bonjour@mavilleideale.fr)";
const BASE = "https://files.data.gouv.fr/geo-dvf/latest/csv";

/** Fenêtre publiée. Deux millésimes : assez d'un côté pour que les communes
 *  moyennes passent le seuil d'effectif, assez peu de l'autre pour que la
 *  médiane reste un prix d'aujourd'hui. */
export const YEARS = [2024, 2025];

/** Incrémenter dès que la méthode change : les lignes d'une version antérieure
 *  sont recalculées au run suivant au lieu d'être mélangées aux nouvelles. */
const QUERY_VERSION = 1;

/** Sous ce nombre de ventes, la médiane d'une commune est un accident
 *  d'échantillon. L'effectif est conservé, le prix n'est pas publié. */
const MIN_SALES = 20;

/** Bornes de vraisemblance. 9 m² = minimum de décence locative ; au-delà de
 *  400 m² on est sur un autre marché que celui du lecteur. */
const MIN_SURFACE = 9;
const MAX_SURFACE = 400;
const MIN_PPM = 200;
const MAX_PPM = 25_000;

/** Départements hors DVF (livre foncier d'Alsace-Moselle) + Mayotte. */
const LIVRE_FONCIER = new Set(["57", "67", "68"]);
const NO_DVF = new Set(["976"]);

/** Paris, Lyon et Marseille n'existent pas comme fichier : DVF publie par
 *  arrondissement. Le code communal du seed est donc éclaté ici. */
const PLM = {
  "75056": range(75101, 75120),
  "69123": range(69381, 69389),
  "13055": range(13201, 13216),
};

function range(a, b) {
  return Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
}

const log = (m) => console.log(`[prix-m2] ${m}`);

/** Le seed est parsé plutôt qu'importé : le charger déclenche la calibration et
 *  le rescaling z-score, inutiles ici (même raison que city-income.mjs). */
async function seedCities() {
  const src = await fs.readFile(path.join(ROOT, "data", "cities-seed.ts"), "utf8");
  const out = [];
  const re = /slug:\s*"([a-z0-9-]+)"[\s\S]{0,900}?inseeCode:\s*"([0-9AB]+)"/g;
  const seen = new Set();
  for (const m of src.matchAll(re)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({ slug: m[1], insee: m[2] });
  }
  return out;
}

/** Code département depuis le code commune (2A/2B et DROM sur 3 chiffres). */
function departmentOf(insee) {
  return /^(97|98)/.test(insee) ? insee.slice(0, 3) : insee.slice(0, 2);
}

async function fetchCommuneYear(insee, year, force) {
  const dep = departmentOf(insee);
  const file = path.join(CACHE, String(year), `${insee}.csv`);
  if (!force) {
    try {
      return await fs.readFile(file, "utf8");
    } catch {}
  }
  const url = `${BASE}/${year}/communes/${dep}/${insee}.csv`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (res.status === 404) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, "");
    return "";
  }
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const text = await res.text();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text);
  return text;
}

/**
 * Agrège un CSV DVF dans un accumulateur de prix au m². Exporté pour le
 * selftest : c'est ici que se jouent les quatre pièges du docstring.
 */
export function accumulate(csv, acc) {
  if (!csv) return acc;
  const lines = csv.split("\n");
  const head = lines[0].split(",");
  const I = Object.fromEntries(head.map((h, i) => [h, i]));
  for (const f of ["id_mutation", "nature_mutation", "valeur_fonciere", "code_type_local", "surface_reelle_bati", "id_parcelle"]) {
    if (I[f] === undefined) throw new Error(`colonne DVF absente : ${f}`);
  }

  const mutations = new Map();
  for (let i = 1; i < lines.length; i++) {
    const f = lines[i].split(",");
    if (f.length !== head.length) continue;
    if (f[I.nature_mutation] !== "Vente") continue;
    const type = f[I.code_type_local]; // 1 = maison, 2 = appartement
    if (type !== "1" && type !== "2") continue;

    const id = f[I.id_mutation];
    let mut = mutations.get(id);
    if (!mut) {
      mut = { value: Number(f[I.valeur_fonciere]), locals: [], seen: new Set() };
      mutations.set(id, mut);
    }
    const key = `${f[I.id_parcelle]}|${f[I.surface_reelle_bati]}|${type}`;
    if (mut.seen.has(key)) continue;
    mut.seen.add(key);
    mut.locals.push({ type, surface: Number(f[I.surface_reelle_bati]) });
  }

  for (const mut of mutations.values()) {
    if (mut.locals.length !== 1) continue;
    const { type, surface } = mut.locals[0];
    if (!(mut.value > 0) || !(surface >= MIN_SURFACE) || surface > MAX_SURFACE) continue;
    const ppm = mut.value / surface;
    if (ppm < MIN_PPM || ppm > MAX_PPM) continue;
    (type === "2" ? acc.apartment : acc.house).push(ppm);
  }
  return acc;
}

function quantile(sorted, p) {
  if (!sorted.length) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function summarise(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sales = sorted.length;
  if (sales < MIN_SALES) return { sales, pending: "sample" };
  return {
    sales,
    medianM2: Math.round(quantile(sorted, 0.5)),
    p25M2: Math.round(quantile(sorted, 0.25)),
    p75M2: Math.round(quantile(sorted, 0.75)),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

  const cities = await seedCities();
  let store = {};
  try {
    store = JSON.parse(await fs.readFile(OUT, "utf8"));
  } catch {}

  const todo = cities.filter(
    (c) => force || store[c.slug]?.queryVersion !== QUERY_VERSION,
  );
  log(`${cities.length} villes au seed, ${todo.length} à traiter`);

  let done = 0;
  for (const city of todo) {
    if (done >= limit) break;
    const dep = departmentOf(city.insee);

    if (LIVRE_FONCIER.has(dep) || NO_DVF.has(dep)) {
      store[city.slug] = {
        coverage: LIVRE_FONCIER.has(dep) ? "livre-foncier" : "absent",
        years: YEARS,
        queryVersion: QUERY_VERSION,
      };
      done++;
      continue;
    }

    const codes = PLM[city.insee] ?? [city.insee];
    const acc = { apartment: [], house: [] };
    let rows = 0;
    for (const code of codes) {
      for (const year of YEARS) {
        const csv = await fetchCommuneYear(code, year, force);
        if (csv) rows++;
        accumulate(csv, acc);
      }
    }

    const apartment = summarise(acc.apartment);
    const house = summarise(acc.house);
    store[city.slug] = {
      coverage: rows ? "dvf" : "absent",
      apartment,
      house,
      years: YEARS,
      queryVersion: QUERY_VERSION,
    };
    done++;
    if (done % 20 === 0) {
      await write(store);
      log(`${done}/${todo.length}…`);
    }
  }

  await write(store);
  log(`écrit ${OUT} — ${Object.keys(store).length} villes`);
}

async function write(store) {
  const ordered = Object.fromEntries(Object.entries(store).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(OUT, JSON.stringify(ordered, null, 2) + "\n");
}

async function stats() {
  const store = JSON.parse(await fs.readFile(OUT, "utf8"));
  const rows = Object.values(store);
  const withApt = rows.filter((r) => r.apartment?.medianM2).length;
  const withHouse = rows.filter((r) => r.house?.medianM2).length;
  const noDvf = rows.filter((r) => r.coverage !== "dvf").length;
  log(`${rows.length} villes — appartement publié ${withApt}, maison ${withHouse}, hors DVF ${noDvf}`);
  const med = (k) => {
    const v = rows.map((r) => r[k]?.medianM2).filter(Boolean).sort((a, b) => a - b);
    return v.length ? v[Math.floor(v.length / 2)] : null;
  };
  log(`médiane des médianes — appartement ${med("apartment")} €/m², maison ${med("house")} €/m²`);
}

/** Contrôles hors ligne : ils tournent sur des CSV fabriqués, donc sans réseau. */
async function selftest() {
  let ok = 0;
  const fail = [];
  const check = (name, cond) => (cond ? ok++ : fail.push(name));

  const HEAD =
    "id_mutation,nature_mutation,valeur_fonciere,code_type_local,surface_reelle_bati,id_parcelle";
  const csv = (rows) => [HEAD, ...rows].join("\n");
  const run = (rows) => accumulate(csv(rows), { apartment: [], house: [] });

  let a = run(["m1,Vente,200000,2,50,p1"]);
  check("appartement simple → 4 000 €/m²", a.apartment[0] === 4000 && a.house.length === 0);

  a = run(["m1,Vente,300000,1,100,p1"]);
  check("maison simple → 3 000 €/m²", a.house[0] === 3000 && a.apartment.length === 0);

  a = run(["m1,Vente,600000,2,50,p1", "m1,Vente,600000,2,60,p2"]);
  check("vente multi-lots écartée", a.apartment.length === 0);

  a = run(["m1,Vente,200000,2,50,p1", "m1,Vente,200000,2,50,p1"]);
  check("ligne dupliquée fusionnée", a.apartment.length === 1 && a.apartment[0] === 4000);

  a = run(["m1,Vente,200000,2,50,p1", "m1,Vente,200000,3,12,p1"]);
  check("dépendance ignorée sans invalider la vente", a.apartment.length === 1);

  a = run(["m1,Adjudication,200000,2,50,p1", "m2,Echange,200000,2,50,p1"]);
  check("hors « Vente » écarté", a.apartment.length === 0 && a.house.length === 0);

  a = run(["m1,Vente,200000,2,5,p1", "m2,Vente,2000000,2,450,p1"]);
  check("surfaces hors bornes écartées", a.apartment.length === 0);

  a = run(["m1,Vente,5000,2,50,p1", "m2,Vente,20000000,2,50,p1"]);
  check("prix au m² hors bornes écartés", a.apartment.length === 0);

  a = run(["m1,Vente,,2,50,p1", "m2,Vente,200000,2,,p1"]);
  check("valeur ou surface manquante écartée", a.apartment.length === 0);

  check("colonne absente → erreur", (() => {
    try {
      accumulate("foo,bar\n1,2", { apartment: [], house: [] });
      return false;
    } catch {
      return true;
    }
  })());

  const few = summarise(Array.from({ length: MIN_SALES - 1 }, () => 3000));
  check("sous le seuil → pas de prix publié", few.pending === "sample" && few.medianM2 === undefined);

  const many = summarise(Array.from({ length: 100 }, (_, i) => 1000 + i * 100));
  check("médiane et quartiles", many.medianM2 === 5950 && many.p25M2 === 3475 && many.p75M2 === 8425);

  check("PLM éclaté", PLM["75056"].length === 20 && PLM["69123"].length === 9 && PLM["13055"].length === 16);
  check("département DROM sur 3 chiffres", departmentOf("97411") === "974" && departmentOf("33063") === "33");
  check("Corse", departmentOf("2A004") === "2A");

  console.log(`[prix-m2] selftest : ${ok} OK, ${fail.length} KO`);
  if (fail.length) {
    for (const f of fail) console.error(`  ✗ ${f}`);
    process.exitCode = 1;
  }
}

const mode = process.argv[2];
if (mode === "--selftest") await selftest();
else if (mode === "--stats") await stats();
else await main();
