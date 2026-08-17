#!/usr/bin/env node
/**
 * Distance à la MER OUVERTE, en kilomètres, pour chacune des villes du seed.
 *
 * POURQUOI
 * `lib/city-match.ts` décidait « bord de mer » sur les tags de caractère et un
 * repli `elevation <= 15 m`. Les deux se trompent, et pas à la marge : le test
 * de tag comparait par sous-chaîne, donc « sport » contient « port » et
 * Grenoble, Clermont-Ferrand, Saint-Étienne et Tarbes étaient des villes
 * côtières, tout comme « côte-d'or » et « porte des alpes » ; le repli par
 * altitude promouvait tous les ports fluviaux (Nantes, Bordeaux, Rouen,
 * Libourne, Les Andelys). Un lecteur ne peut pas vérifier un tag, mais il
 * vérifie une distance en une seconde.
 *
 * MÉTHODE
 * Natural Earth 10m ocean (domaine public, aucune clé) est rastérisé en mer /
 * terre sur une grille de 0,01° (~1,1 km). Deux transformées de distance :
 *   1. pour chaque cellule d'eau, la distance à la terre la plus proche ;
 *   2. pour chaque cellule, la distance à la première cellule d'eau dont la
 *      distance à la terre dépasse OPEN_SEA_CLEARANCE_KM.
 * Le second passage est ce qui distingue la mer d'un fleuve : la Garonne à
 * Bordeaux fait 500 m de large, la Loire à Nantes autant. Mesurer la distance
 * à l'eau salée la plus proche donnerait 7 km à Bordeaux — il est à une heure
 * de l'océan. Le seuil de largeur écarte les chenaux et garde les baies, les
 * rades et les îles (Ré, Quiberon, Noirmoutier, tous les DROM).
 *
 *   node scripts/city-coast.mjs           # écrit data/city-coast.json
 *   node scripts/city-coast.mjs --check   # recalcule, compare, n'écrit rien
 *   node scripts/city-coast.mjs --debug   # + un échantillon de villes témoins
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache", "city-coast");
const SRC = path.join(CACHE, "ne_10m_ocean.geojson");
const OUT = path.join(ROOT, "data", "city-coast.json");
const URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_ocean.geojson";

const CHECK = process.argv.includes("--check");
const DEBUG = process.argv.includes("--debug");

const STEP = 0.01; // ~1,1 km en latitude
const KM_PER_DEG_LAT = 111.32;
// Une cellule d'eau compte comme mer ouverte si elle est à plus de 2 km de
// toute terre — donc au milieu d'un plan d'eau d'au moins 4 km de large. Un
// fleuve n'y arrive jamais, un estuaire ouvert oui.
const OPEN_SEA_CLEARANCE_KM = 2;

// Une zone par masse continentale : rastériser tout le globe pour six îles
// coûterait cent fois plus cher pour le même résultat.
const ZONES = [
  { id: "metropole", lat: [41.0, 51.7], lng: [-5.8, 10.0] },
  { id: "guadeloupe", lat: [15.6, 16.7], lng: [-62.0, -60.8] },
  { id: "martinique", lat: [14.3, 15.1], lng: [-61.4, -60.6] },
  { id: "guyane", lat: [1.9, 6.1], lng: [-54.9, -51.3] },
  { id: "reunion", lat: [-21.6, -20.7], lng: [55.0, 56.0] },
  { id: "mayotte", lat: [-13.2, -12.5], lng: [44.8, 45.5] },
];

function loadOceanRings() {
  if (!existsSync(SRC)) {
    mkdirSync(CACHE, { recursive: true });
    console.log("téléchargement du polygone océan Natural Earth 10m…");
    execFileSync("curl", ["-sSL", "--max-time", "300", "-o", SRC, URL], { stdio: "inherit" });
  }
  const gj = JSON.parse(readFileSync(SRC, "utf8"));
  const rings = [];
  for (const f of gj.features) {
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) for (const ring of poly) rings.push(ring);
  }
  return rings;
}

/** Remplissage par balayage : une ligne de latitude, les croisements triés, on
 *  remplit entre les paires. C'est le point-dans-polygone fait une fois par
 *  ligne au lieu d'une fois par cellule. */
function rasterizeWater(rings, zone) {
  const [lat0, lat1] = zone.lat;
  const [lng0, lng1] = zone.lng;
  const rows = Math.round((lat1 - lat0) / STEP);
  const cols = Math.round((lng1 - lng0) / STEP);
  const water = new Uint8Array(rows * cols);

  // Les segments sont indexés par bande de latitude pour ne pas re-parcourir
  // le monde entier à chaque ligne.
  const buckets = new Map();
  const BAND = 1; // degré
  for (const ring of rings) {
    for (let i = 1; i < ring.length; i++) {
      const [xa, ya] = ring[i - 1];
      const [xb, yb] = ring[i];
      if (ya === yb) continue;
      const loY = Math.min(ya, yb);
      const hiY = Math.max(ya, yb);
      if (hiY < lat0 || loY > lat1) continue;
      // Pas de filtre en longitude : la parité d'une ligne de balayage se
      // compte depuis le bord du monde. Écarter les croisements à l'ouest de
      // la fenêtre inverse mer et terre à l'intérieur (Toulouse ressortait à
      // 0 km de la mer).
      for (let b = Math.floor(loY / BAND); b <= Math.floor(hiY / BAND); b++) {
        let arr = buckets.get(b);
        if (!arr) buckets.set(b, (arr = []));
        arr.push([xa, ya, xb, yb]);
      }
    }
  }

  const xs = [];
  for (let r = 0; r < rows; r++) {
    const lat = lat0 + (r + 0.5) * STEP;
    const segs = buckets.get(Math.floor(lat / BAND)) ?? [];
    xs.length = 0;
    for (const [xa, ya, xb, yb] of segs) {
      if (lat < Math.min(ya, yb) || lat >= Math.max(ya, yb)) continue;
      xs.push(xa + ((lat - ya) / (yb - ya)) * (xb - xa));
    }
    if (xs.length < 2) continue;
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const cA = Math.ceil((xs[i] - lng0) / STEP - 0.5);
      const cB = Math.floor((xs[i + 1] - lng0) / STEP - 0.5);
      for (let c = Math.max(0, cA); c <= Math.min(cols - 1, cB); c++) water[r * cols + c] = 1;
    }
  }
  return { water, rows, cols, lat0, lng0 };
}

/** Transformée de distance par chanfrein en deux passes, en km. `seed(i)` dit
 *  si la cellule est une source (distance 0). */
function distanceTransform(grid, seed) {
  const { rows, cols, lat0 } = grid;
  const midLat = lat0 + (rows * STEP) / 2;
  const dy = STEP * KM_PER_DEG_LAT;
  const dx = STEP * KM_PER_DEG_LAT * Math.cos((midLat * Math.PI) / 180);
  const dd = Math.hypot(dx, dy);
  const INF = 1e9;
  const dist = new Float32Array(rows * cols);
  for (let i = 0; i < dist.length; i++) dist[i] = seed(i) ? 0 : INF;

  const relax = (i, j, w) => {
    const v = dist[j] + w;
    if (v < dist[i]) dist[i] = v;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (dist[i] === 0) continue;
      if (r > 0) relax(i, i - cols, dy);
      if (c > 0) relax(i, i - 1, dx);
      if (r > 0 && c > 0) relax(i, i - cols - 1, dd);
      if (r > 0 && c < cols - 1) relax(i, i - cols + 1, dd);
    }
  }
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      const i = r * cols + c;
      if (dist[i] === 0) continue;
      if (r < rows - 1) relax(i, i + cols, dy);
      if (c < cols - 1) relax(i, i + 1, dx);
      if (r < rows - 1 && c < cols - 1) relax(i, i + cols + 1, dd);
      if (r < rows - 1 && c > 0) relax(i, i + cols - 1, dd);
    }
  }
  return dist;
}

async function main() {
  const rings = loadOceanRings();
  console.log(`océan : ${rings.length.toLocaleString("fr-FR")} anneaux`);

  const { CITIES_SEED } = await import("../data/cities-seed.ts");

  const out = {};
  for (const zone of ZONES) {
    const cities = CITIES_SEED.filter(
      (c) =>
        c.latitude >= zone.lat[0] && c.latitude <= zone.lat[1] &&
        c.longitude >= zone.lng[0] && c.longitude <= zone.lng[1],
    );
    if (cities.length === 0) continue;

    const grid = rasterizeWater(rings, zone);
    const { water, rows, cols, lat0, lng0 } = grid;
    const clearance = distanceTransform(grid, (i) => water[i] === 0);
    const openSea = distanceTransform(grid, (i) => water[i] === 1 && clearance[i] >= OPEN_SEA_CLEARANCE_KM);

    for (const c of cities) {
      const r = Math.min(rows - 1, Math.max(0, Math.floor((c.latitude - lat0) / STEP)));
      const col = Math.min(cols - 1, Math.max(0, Math.floor((c.longitude - lng0) / STEP)));
      // La cellule « mer ouverte » la plus proche est par construction à
      // OPEN_SEA_CLEARANCE_KM du rivage : sans ce retrait, une ville les pieds
      // dans l'eau afficherait 2 km. On mesure la distance au rivage de la mer
      // ouverte, pas à son milieu.
      const d = openSea[r * cols + col] - OPEN_SEA_CLEARANCE_KM;
      out[c.slug] = Math.max(0, Math.round(d * 10) / 10);
    }
    console.log(`${zone.id.padEnd(11)} ${String(cities.length).padStart(3)} villes · grille ${rows}×${cols}`);
  }

  const missing = CITIES_SEED.filter((c) => out[c.slug] == null);
  if (missing.length) throw new Error(`hors zone : ${missing.map((c) => c.slug).join(", ")}`);

  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  const body = JSON.stringify(sorted) + "\n";

  if (DEBUG) {
    const sample = ["nice","marseille","la-rochelle","bordeaux","begles","nantes","reze","rouen","arles","libourne","saint-laurent-du-maroni","ile-de-re","quiberon","noirmoutier","vannes","quimper","caen","rochefort","paris","lyon","grenoble","clermont-ferrand","toulouse","strasbourg","fort-de-france","mamoudzou","saint-denis-reunion","cayenne","istres","le-tampon"];
    for (const s of sample) console.log(`  ${s.padEnd(26)} ${sorted[s] ?? "ABSENT"} km`);
  }
  if (CHECK) {
    console.log(readFileSync(OUT, "utf8") === body ? "identique au fichier commité" : "DIFFÉRENT du fichier commité");
    return;
  }
  writeFileSync(OUT, body);
  const vals = Object.values(sorted);
  console.log(
    `data/city-coast.json écrit : ${vals.length} villes, ` +
      `${vals.filter((v) => v <= 5).length} à 5 km ou moins de la mer ouverte, ` +
      `${vals.filter((v) => v > 100).length} au-delà de 100 km.`,
  );
}

main();
