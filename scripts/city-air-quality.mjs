#!/usr/bin/env node
/**
 * F63 — data/city-air.json: MEASURED annual air quality for the seed cities.
 *
 * lib/air-quality.ts models exposure from seed fields; nothing on the site was
 * measured. This pipeline brings in the official station measurements:
 *
 *   1. Station metadata — France's "D" reporting to the EEA (LCSQA-INERIS, on
 *      the Eionet CDR): every station with its coordinates, area type
 *      (urban / suburban / rural) and every sampling point with its station
 *      classification (background / traffic / industrial).
 *   2. Verified hourly measurements (E1a) — EEA download API, one parquet per
 *      sampling point and pollutant. Public, no account.
 *   3. For each city and pollutant, the nearest BACKGROUND sampling point
 *      within MAX_KM that has enough valid data for the year. Background
 *      stations are the regulatory measure of what residents breathe; traffic
 *      stations measure the kerb and would make a city look like its busiest
 *      boulevard. A city with no qualifying station gets nothing for that
 *      pollutant — never the value of a station 60 km away.
 *
 * Metrics (YEAR, calendar year, UTC):
 *   no2 / pm10 / pm25 — annual mean, µg/m³ (WHO 2021 guidelines 10 / 15 / 5;
 *     EU limits 40 / 40 / 25)
 *   o3 — days on which the maximum daily 8-hour running mean exceeds
 *     120 µg/m³ (EU target value: no more than 25 days a year, 3-year average)
 *
 * Licences: EEA data under the EEA re-use policy (CC BY 4.0); French
 * measurements produced by the AASQA, compiled by LCSQA (Licence Ouverte).
 *
 *   npm run air-quality                # full run (downloads cached in .cache/)
 *   npm run air-quality -- --stats     # summarise data/city-air.json
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { asyncBufferFromFile, parquetReadObjects } from "hyparquet";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "city-air-quality");
const PQ_DIR = path.join(CACHE, "parquet");
const SEED_TS = path.join(ROOT, "data", "cities-seed.ts");
const OUT = path.join(ROOT, "data", "city-air.json");

const YEAR = 2025;
const MAX_KM = 25;
// EU data-quality objective for fixed measurements is 90 % (85 % once
// maintenance is allowed for). 75 % keeps more stations while still meaning
// "most of the year"; the coverage is published with each value.
const MIN_COVERAGE = 0.75;
const CDR = "https://cdr.eionet.europa.eu/fr/eu/aqd/d/";
const EEA_API = "https://eeadmz1-downloads-api-appservice.azurewebsites.net/ParquetFile/urls";
const UA = "MaVilleIdeale/1.0 (https://www.mavilleideale.fr; daitenkutarojurai@gmail.com)";

// EEA pollutant codes, as they appear in sampling point ids (SPO-FR01001_8).
const POLLUTANTS = { no2: 8, pm10: 5, pm25: 6001, o3: 7 };
// The download API wants the notation, not the code ("PM2.5", not "6001").
const NOTATION = { no2: "NO2", pm10: "PM10", pm25: "PM2.5", o3: "O3" };

if (process.argv.includes("--stats")) {
  const d = JSON.parse(fs.readFileSync(OUT, "utf8"));
  const rows = Object.values(d.cities);
  console.log(`year ${d.meta.year} · ${rows.length} cities`);
  for (const k of Object.keys(POLLUTANTS)) {
    const n = rows.filter((r) => r[k]).length;
    console.log(`${k.padEnd(5)} ${n}/${rows.length}`);
  }
  process.exit(0);
}

const haversineKm = (a, b) => {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

async function cached(file, fetcher) {
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return fs.readFileSync(file);
  const buf = await fetcher();
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, buf);
  return buf;
}

async function get(url, init = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers: { "User-Agent": UA, ...(init.headers ?? {}) } });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      if (attempt >= 4) throw new Error(`HTTP ${res.status} for ${url}`);
    } catch (e) {
      if (attempt >= 4) throw e;
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

// ── 1. seed ─────────────────────────────────────────────────────────────────
function loadSeed() {
  const src = fs.readFileSync(SEED_TS, "utf8");
  return src
    .split(/\r?\n {2}\{\r?\n/)
    .slice(1)
    .map((b) => {
      const s = (k) => b.match(new RegExp(`\\b${k}:\\s*"([^"]+)"`))?.[1] ?? null;
      const n = (k) => Number(b.match(new RegExp(`\\b${k}:\\s*(-?[\\d.]+)`))?.[1]);
      return { slug: s("slug"), lat: n("latitude"), lon: n("longitude") };
    })
    .filter((c) => c.slug && Number.isFinite(c.lat) && Number.isFinite(c.lon));
}

// ── 2. station metadata (latest released D envelope) ────────────────────────
async function loadStations() {
  const listing = (await get(CDR)).toString("utf8");
  const envs = [...listing.matchAll(/href="(env[a-z0-9_]+)\/"[\s\S]*?(\d{2} [A-Z][a-z]{2} 20\d{2})/g)]
    .map((m) => ({ env: m[1], date: new Date(m[2]) }))
    .sort((a, b) => b.date - a.date);
  if (!envs.length) throw new Error("no D envelope found on the CDR");
  const env = envs[0].env;
  const page = (await get(`${CDR}${env}/`)).toString("utf8");
  const xmlName = page.match(/href="([^"/]+\.xml)\/manage_document"/)?.[1];
  if (!xmlName) throw new Error(`no XML in envelope ${env}`);
  const xml = (await cached(path.join(CACHE, xmlName), () => get(`${CDR}${env}/${xmlName}`))).toString("utf8");

  const stations = new Map();
  for (const m of xml.matchAll(/<aqd:AQD_Station gml:id="(STA-[^"]+)">([\s\S]*?)<\/aqd:AQD_Station>/g)) {
    const body = m[2];
    const pos = body.match(/<gml:pos[^>]*>([-\d.]+) ([-\d.]+)<\/gml:pos>/);
    if (!pos) continue;
    stations.set(m[1], {
      id: m[1].replace(/^STA-/, ""),
      name: body.match(/<ef:name>([^<]*)<\/ef:name>/)?.[1]?.trim() ?? m[1],
      lat: Number(pos[1]),
      lon: Number(pos[2]),
      area: body.match(/areaclassification\/([a-z-]+)"/)?.[1] ?? null,
    });
  }
  const samplingPoints = new Map();
  for (const m of xml.matchAll(/<aqd:AQD_SamplingPoint gml:id="(SPO-[^"]+)">([\s\S]*?)<\/aqd:AQD_SamplingPoint>/g)) {
    const body = m[2];
    const station = body.match(/<ef:broader xlink:href="[^"]*\/(STA-[^"]+)"/)?.[1];
    const cls = body.match(/stationclassification\/([a-z]+)"/)?.[1] ?? null;
    if (station && stations.has(station)) samplingPoints.set(m[1], { station: stations.get(station), cls });
  }
  console.log(`D envelope ${env} (${xmlName}): ${stations.size} stations, ${samplingPoints.size} sampling points`);
  return { samplingPoints, source: `${CDR}${env}/${xmlName}` };
}

// ── 3. measurements ─────────────────────────────────────────────────────────
async function listParquets(key) {
  const code = POLLUTANTS[key];
  const body = JSON.stringify({ countries: ["FR"], cities: [], pollutants: [NOTATION[key]], dataset: 2, source: "API" });
  // ⚠ Adding dateTimeStart/dateTimeEnd or aggregationType makes this endpoint
  // return an empty list (tested 2026-10-10) — filter by year after download.
  // The API can take minutes before sending headers, past undici's 300 s
  // headers timeout, so this one call goes through curl. Cached per pollutant.
  const csv = (
    await cached(path.join(CACHE, `urls-${code}.csv`), async () =>
      execFileSync("curl", ["-s", "-m", "900", "-X", "POST", EEA_API, "-H", "Content-Type: application/json", "-d", body], {
        maxBuffer: 64 * 1024 * 1024,
      }),
    )
  ).toString("utf8");
  return csv.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.startsWith("http"));
}

const Y0 = Date.UTC(YEAR, 0, 1), Y1 = Date.UTC(YEAR + 1, 0, 1);
const YEAR_HOURS = (Y1 - Y0) / 3_600_000;

async function annualStats(file, key) {
  const rows = await parquetReadObjects({
    file: await asyncBufferFromFile(file),
    columns: ["Start", "End", "Value", "Validity", "AggType"],
  });
  const hourly = new Map();
  let sum = 0, weight = 0;
  for (const r of rows) {
    const t = r.Start instanceof Date ? r.Start.getTime() : Number(r.Start);
    if (t < Y0 || t >= Y1) continue;
    if (!(r.Validity >= 1) || !(r.Value >= 0)) continue;
    const end = r.End instanceof Date ? r.End.getTime() : Number(r.End);
    const hours = Math.max(1, Math.round((end - t) / 3_600_000));
    sum += r.Value * hours;
    weight += hours;
    if (r.AggType === "hour") hourly.set(t, r.Value);
  }
  const coverage = weight / YEAR_HOURS;
  if (coverage < MIN_COVERAGE) return null;
  if (key !== "o3") return { value: Math.round((sum / weight) * 10) / 10, coverage };
  // Ozone: days whose maximum 8-hour running mean exceeds 120 µg/m³.
  if (hourly.size / YEAR_HOURS < MIN_COVERAGE) return null;
  const days = new Map();
  for (const t of hourly.keys()) {
    let s = 0, n = 0;
    for (let h = 0; h < 8; h++) {
      const v = hourly.get(t - h * 3_600_000);
      if (v !== undefined) { s += v; n++; }
    }
    if (n < 6) continue; // EU rule: an 8-h mean needs 75 % of its hours
    const day = new Date(t).toISOString().slice(0, 10);
    days.set(day, Math.max(days.get(day) ?? 0, s / n));
  }
  let over = 0;
  for (const v of days.values()) if (v > 120) over++;
  return { value: over, coverage };
}

async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const k = i++; await fn(items[k], k); }
  }));
}

// ── main ────────────────────────────────────────────────────────────────────
const seed = loadSeed();
const { samplingPoints, source } = await loadStations();
const nearSeed = (st) => seed.some((c) => haversineKm(c, st) <= MAX_KM);

const measured = []; // { key, spo, station, cls, value, coverage }
for (const key of Object.keys(POLLUTANTS)) {
  const urls = await listParquets(key);
  if (!urls.length) throw new Error(`${key}: the EEA API listed no file — refusing to write a file without it`);
  const wanted = urls.filter((u) => {
    const spo = u.match(/(SPO-[^/]+)\.parquet$/)?.[1];
    const sp = spo && samplingPoints.get(spo);
    return sp && sp.cls === "background" && nearSeed(sp.station);
  });
  console.log(`${key}: ${urls.length} files, ${wanted.length} background points within ${MAX_KM} km of a seed city`);
  let done = 0;
  // Each parquet is decoded whole in memory: 3 at a time keeps the run under
  // ~400 MB (an 8 GB workstation ran short at 6 on 2026-10-10).
  await pool(wanted, 3, async (url) => {
    const spo = url.match(/(SPO-[^/]+)\.parquet$/)[1];
    const file = path.join(PQ_DIR, `${spo}.parquet`);
    try {
      await cached(file, () => get(url));
      const st = await annualStats(file, key);
      const sp = samplingPoints.get(spo);
      if (st) measured.push({ key, spo, station: sp.station, value: st.value, coverage: st.coverage });
    } catch (e) {
      console.warn(`  ! ${spo}: ${e.message}`);
    }
    if (++done % 50 === 0) console.log(`  ${key} ${done}/${wanted.length}`);
  });
}

const cities = {};
for (const c of seed) {
  const row = {};
  for (const key of Object.keys(POLLUTANTS)) {
    let best = null;
    for (const m of measured) {
      if (m.key !== key) continue;
      const d = haversineKm(c, m.station);
      if (d <= MAX_KM && (!best || d < best.d)) best = { m, d };
    }
    if (best) {
      row[key] = {
        value: best.m.value,
        station: best.m.station.name,
        stationCode: best.m.station.id,
        area: best.m.station.area,
        distanceKm: Math.round(best.d * 10) / 10,
        coverage: Math.round(best.m.coverage * 100) / 100,
      };
    }
  }
  if (Object.keys(row).length) cities[c.slug] = row;
}

const out = {
  meta: {
    year: YEAR,
    metric: { no2: "annual mean µg/m³", pm10: "annual mean µg/m³", pm25: "annual mean µg/m³", o3: "days with max daily 8-h mean > 120 µg/m³" },
    stationRule: `nearest background station within ${MAX_KM} km, ≥ ${MIN_COVERAGE * 100} % valid data`,
    sources: [source, EEA_API],
    licence: "EEA re-use policy (CC BY 4.0); measurements by the AASQA, compiled by LCSQA (Licence Ouverte)",
    generatedAt: new Date().toISOString().slice(0, 10),
    // Every seed city this run looked at, data or not: the data runner reruns
    // the pipeline when the seed holds a city missing from this list, which
    // the `cities` keys alone cannot tell (a city with no station is absent).
    evaluated: seed.map((c) => c.slug),
    // Pollutants actually processed this run. Pages show only these, so a run
    // limited to NO2 never reads as "no PM2.5 station near this city".
    pollutants: Object.keys(POLLUTANTS),
  },
  cities,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`wrote ${Object.keys(cities).length}/${seed.length} cities → ${path.relative(ROOT, OUT)}`);
for (const k of Object.keys(POLLUTANTS)) console.log(`  ${k}: ${Object.values(cities).filter((r) => r[k]).length}`);
