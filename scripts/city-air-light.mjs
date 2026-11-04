#!/usr/bin/env node
/**
 * F63 — data/city-air-light.json: the slice of data/city-air.json that the
 * air engine (lib/air-quality.ts) scores from.
 *
 * lib/air-quality.ts reaches the browser (lib/city-synthesis and
 * lib/quality-of-life-index are imported by PersonalSynthesisQuiz and
 * PersonalQolQuiz), so it must not import the 340 KB measurement file with its
 * station names, codes and coverage. This projection keeps, per city, the
 * value and distance of NO2, PM2.5 and ozone, and only when the station is
 * urban or suburban: a rural station measures the countryside, not the town
 * (same rule as lib/air-measured-ranking.ts). The distance cap is applied by
 * the engine (AIR_MEASURED_MAX_KM).
 *
 *   npm run air-quality:light           # rewrite data/city-air-light.json
 *   npm run air-quality:light -- --check  # exit 1 when it is stale
 *
 * scripts/city-air-quality.mjs rewrites it at the end of a full run, and
 * `npm run integrity` fails when the two files disagree.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FULL = path.join(ROOT, "data", "city-air.json");
const LIGHT = path.join(ROOT, "data", "city-air-light.json");

const SCORED = ["no2", "pm25", "o3"];
const AREAS = new Set(["urban", "suburban"]);

export function deriveAirLight(full) {
  const cities = {};
  for (const [slug, row] of Object.entries(full.cities)) {
    const out = {};
    for (const p of SCORED) {
      const m = row[p];
      if (!m || !m.area || !AREAS.has(m.area)) continue;
      out[p] = [m.value, m.distanceKm];
    }
    if (Object.keys(out).length) cities[slug] = out;
  }
  return { year: full.meta.year, format: "[value, distanceKm], urban or suburban background station", cities };
}

export function serializeAirLight(light) {
  return JSON.stringify(light) + "\n";
}

export function writeAirLight() {
  const full = JSON.parse(fs.readFileSync(FULL, "utf8"));
  const text = serializeAirLight(deriveAirLight(full));
  fs.writeFileSync(LIGHT, text);
  return text;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  if (process.argv.includes("--check")) {
    const full = JSON.parse(fs.readFileSync(FULL, "utf8"));
    const want = serializeAirLight(deriveAirLight(full));
    const have = fs.existsSync(LIGHT) ? fs.readFileSync(LIGHT, "utf8") : "";
    if (want !== have) {
      console.error("data/city-air-light.json is stale — run `npm run air-quality:light`");
      process.exit(1);
    }
    console.log("data/city-air-light.json is up to date");
  } else {
    const text = writeAirLight();
    const n = Object.keys(JSON.parse(text).cities).length;
    console.log(`wrote ${n} cities, ${text.length} bytes → data/city-air-light.json`);
  }
}
