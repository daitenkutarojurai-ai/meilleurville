#!/usr/bin/env node
/**
 * Couverture des jeux de données par ville face au seed — extension du seed (F34/F35).
 *
 * Chaque fichier `data/city-*.json` est indexé par slug et produit par un pipeline
 * qui ne tourne pas depuis une routine cloud (403 CONNECT sur toutes les sources
 * ouvertes). Quand une ville entre au seed, il faut donc que la machine locale
 * relance les pipelines concernés — et seulement eux. Ce script dit lesquels.
 *
 *   node scripts/seed-coverage.mjs              # tableau : fichier, couverts, manquants
 *   node scripts/seed-coverage.mjs --needs=population
 *        # code 0 si le pipeline `population` a une ville du seed à traiter, 1 sinon
 *
 * Les manques PERMANENTS (commune hors champ de la source) sont listés dans
 * `KNOWN_GAPS` : sans eux, le runner relancerait chaque nuit un pipeline qui ne
 * peut rien ajouter. Une ville nouvelle n'y est jamais ajoutée par défaut : elle
 * n'y entre qu'une fois le pipeline passé et l'absence constatée dans sa sortie.
 *
 * Lit le seed comme texte (aucun import TypeScript), donc tourne avec node nu,
 * depuis cron.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// pipeline → fichier, et accès à l'objet indexé par slug.
export const DATASETS = {
  population: { file: "data/city-population.json" },
  income: { file: "data/city-income.json" },
  "property-prices": { file: "data/city-property-prices.json" },
  coast: { file: "data/city-coast.json" },
  parks: { file: "data/city-parks.json" },
  photos: { file: "data/city-images.json" },
  biodiversity: { file: "data/city-biodiversity.json" },
  news: { file: "data/city-news.json", key: "cities" },
  "protected-areas": { file: "data/city-protected-areas.json" },
  "political-lean": { file: "data/political-lean.json" },
  "postal-codes": { file: "data/city-postal-codes.json" },
};

// Mesuré le 2026-10-06 sur les 540 villes. Chaque entrée = commune absente de la
// source elle-même, pas un oubli de collecte.
export const KNOWN_GAPS = {
  // Mamoudzou : hors fichier Insee « France hors Mayotte » ; Pierrefitte : fusionnée
  // dans Saint-Denis en 2025.
  population: ["mamoudzou", "pierrefitte-sur-seine"],
  // Guadeloupe, Guyane, Mayotte hors champ Filosofi ; Pierrefitte fusionnée.
  income: ["les-abymes", "pointe-a-pitre", "baie-mahault", "cayenne", "saint-laurent-du-maroni", "mamoudzou", "pierrefitte-sur-seine"],
  // Vesoul : aucune image P18 exploitable ; Pierrefitte fusionnée.
  photos: ["vesoul", "pierrefitte-sur-seine"],
};

export function seedSlugs() {
  const src = readFileSync(path.join(ROOT, "data", "cities-seed.ts"), "utf8");
  return [...src.matchAll(/^    slug: "([^"]+)"/gm)].map((m) => m[1]);
}

export function coverage() {
  const slugs = seedSlugs();
  return Object.entries(DATASETS).map(([name, { file, key }]) => {
    const json = JSON.parse(readFileSync(path.join(ROOT, file), "utf8"));
    const obj = key ? json[key] ?? {} : json;
    const gaps = new Set(KNOWN_GAPS[name] ?? []);
    const missing = slugs.filter((s) => !(s in obj));
    return { name, file, covered: slugs.length - missing.length, total: slugs.length, missing, toDo: missing.filter((s) => !gaps.has(s)) };
  });
}

const needs = process.argv.find((a) => a.startsWith("--needs="))?.slice(8);
const rows = coverage();
if (needs) {
  const row = rows.find((r) => r.name === needs);
  if (!row) {
    console.error(`pipeline inconnu « ${needs} » — connus : ${rows.map((r) => r.name).join(", ")}`);
    process.exit(2);
  }
  if (row.toDo.length) console.log(`${needs}: ${row.toDo.length} ville(s) à traiter — ${row.toDo.join(", ")}`);
  process.exit(row.toDo.length ? 0 : 1);
}
console.log(`seed : ${rows[0]?.total ?? 0} villes\n`);
for (const r of rows) {
  const tail = r.toDo.length ? `  à traiter : ${r.toDo.join(", ")}` : r.missing.length ? `  (manques connus : ${r.missing.join(", ")})` : "";
  console.log(`${r.name.padEnd(16)} ${String(r.covered).padStart(4)}/${r.total}${tail}`);
}
