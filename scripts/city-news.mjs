#!/usr/bin/env node
/**
 * F64 — public-signal feed ("Signaux publics récents") for the 540 seed cities.
 *
 *   node scripts/city-news.mjs                 # refresh the next ~180 cities, biggest first
 *   node scripts/city-news.mjs --limit=20      # cap the batch (default 180)
 *   node scripts/city-news.mjs --slug=paris    # one city
 *   node scripts/city-news.mjs --force         # refresh even cities already in the JSON
 *   node scripts/city-news.mjs probe           # what the three APIs actually answer (needs egress)
 *   node scripts/city-news.mjs selftest        # offline checks on fixtures
 *   node scripts/city-news.mjs prune           # re-window the committed JSON, no network
 *   node scripts/city-news.mjs stats           # what's in data/city-news.json today
 *
 * ── Sources (phase 1: official open data only) ───────────────────────────
 *
 *   BODACC        bodacc-datadila.opendatasoft.com (Explore v2.1) — registrations,
 *                 deregistrations and insolvency proceedings, Licence Ouverte.
 *   RNA / JO      data.gouv.fr — association creations, Licence Ouverte.
 *   Géorisques    georisques.gouv.fr GASPAR — CatNat orders, Licence Ouverte.
 *
 * The regional press is NOT here and must not be added without a decision
 * being written down first: reproducing headlines falls under the publishers'
 * neighbouring right (loi 2019-775), and Google News RSS forbids reuse in its
 * terms. Rewording an article with an LLM does not remove the right — it adds
 * a factual error signed by us. See ROADMAP.md § F64.
 *
 * ── Why counts, not named filings ────────────────────────────────────────
 *
 * BODACC publishes one record per company, and a large share of those companies
 * are sole traders — i.e. named individuals. Reprinting "X, radiation" on a
 * city page would be republishing personal data, out of its legal-notice
 * context, on a site with 54 000 indexed pages. The licence permits it; that
 * does not make it right, and it is not what a reader needs. So BODACC and RNA
 * are aggregated to MONTHLY COUNTS per commune, and only CatNat orders — acts
 * of the State, naming no one — are listed individually.
 *
 * ── Field names: verified 2026-08-04 for BODACC and CatNat, not for the RNA ──
 *
 * The cloud runner answers 403 CONNECT for these hosts, so the first version of
 * this file was written blind. A local pass ran `probe` against the live APIs on
 * 2026-08-04 and corrected three things that would each have failed silently:
 * the BODACC host (`api.bodacc.fr` does not resolve at all), the `familleavis`
 * value for insolvency proceedings (`collective`, not `procedure_collective`),
 * and the commune filter (see bodaccWhere — the column is mixed-case, so the
 * uppercased exact match returned ~1 % of the rows instead of none, which is the
 * worst of both worlds). The RNA ingest is still off: no resource id.
 *
 * ── Resumability under the cloud-runner constraint ───────────────────────
 *
 * .cache/ is gitignored and each scheduled run starts from a fresh checkout, so
 * the cache does NOT survive between runs. What survives is data/city-news.json,
 * committed as we go. Unlike the parks crawl, this file is a REFRESH, not a
 * one-off: a row is re-fetched once it is older than DUE_AFTER_DAYS, oldest
 * first, so the batch naturally rotates over the 540 cities.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, ".cache", "city-news");
const OUT_JSON = path.join(ROOT, "data", "city-news.json");
const SEED_TS = path.join(ROOT, "data", "cities-seed.ts");

const UA =
  "MaVilleIdeale/1.0 (https://www.mavilleideale.fr; daitenkutarojurai@gmail.com) node-fetch";

/** Bump when a query shape changes — rows stamped with an older version are
 *  refreshed first, because their contents came from a query we no longer trust. */
const QUERY_VERSION = 1;

/** Windowing. Both are enforced here AND again in lib/city-news.ts at read
 *  time, so a JSON that stops being refreshed empties out instead of showing
 *  year-old filings as current. */
const WINDOW_MONTHS = 12;
const MAX_ENTRIES_PER_CITY = 8;
/** A row older than this is due for a refresh.
 *
 *  Sizing note, because the two numbers below have to agree: one city costs
 *  ~3 requests at ~1 req/s, so ~3 s. The default batch of 180 is ~10 min of
 *  wall clock, and 540 / 180 = 3 weekly runs for a full rotation. A row is
 *  therefore re-fetched every ~3 weeks, which is why DUE_AFTER_DAYS is 14
 *  (a row becomes eligible before its turn comes round) and why the display
 *  threshold in lib/city-news.ts is a much looser 45 days — at 21 it would
 *  have branded almost every city "not re-checked since" permanently. */
const DUE_AFTER_DAYS = 14;

const MIN_SLEEP_MS = 1000; // ~1 req/s per the etiquette these APIs ask for.

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--")) ?? "crawl";
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const LIMIT = Number(opt("limit") ?? 180);
const ONLY_SLUG = opt("slug") ?? null;
const FORCE = flag("force");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

/* ── endpoints & fields (BODACC + CatNat verified live 2026-08-04) ────────── */

/** DILA publishes BODACC on its own Opendatasoft portal. `api.bodacc.fr` has no
 *  DNS record — the first version of this file pointed there and every fetch
 *  failed with "fetch failed", which reads like an egress block and is not one. */
const BODACC_BASE =
  "https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets";
const BODACC_DATASET = "annonces-commerciales";
/** Verified against the live catalogue: `dateparution`, `familleavis`, `ville`
 *  and `numerodepartement` all exist. `code_commune_insee` does NOT — the
 *  dataset carries no Insee column, so resolveAnchor() always lands on the
 *  name+dept fallback. The constant stays so the exact anchor is picked up for
 *  free if DILA ever adds the column. */
const BODACC_FIELDS = {
  date: "dateparution",
  family: "familleavis",
  /** Preferred anchor when the dataset carries it. Absent as of 2026-08-04. */
  insee: "code_commune_insee",
  /** Fallback anchor. */
  city: "ville",
  dept: "numerodepartement",
};
/** BODACC `familleavis` values → our kinds. The live vocabulary is: collective,
 *  conciliation, creation, divers, dpc, immatriculation, inconnue, modification,
 *  radiation, retablissement_professionnel, vente (+ null). Only the four that
 *  answer "is the local economy opening or closing shops" are mapped; the rest
 *  return null and are dropped. `collective` is the insolvency family — the
 *  guessed `procedure_collective` matched nothing, so proceedings counted zero
 *  everywhere without erroring. */
const BODACC_FAMILY_TO_KIND = {
  creation: "entreprises",
  immatriculation: "entreprises",
  radiation: "radiations",
  collective: "procedures",
};

const GEORISQUES_CATNAT =
  "https://www.georisques.gouv.fr/api/v1/gaspar/catnat";

const DATAGOUV_TABULAR = "https://tabular-api.data.gouv.fr/api/resources";
/** @unverified resource id for the RNA (Répertoire National des Associations)
 *  extract exposed through the data.gouv.fr tabular API, and @unverified column
 *  names. `probe` resolves the dataset and prints both. Until it does, the RNA
 *  ingest is skipped rather than guessed at — a city missing one source is
 *  honest, a city carrying invented counts is not. */
const RNA_RESOURCE_ID = null;
const RNA_FIELDS = { insee: "adrs_codeinsee", date: "date_creat" };

const LICENCE_OUVERTE = "Licence Ouverte / Etalab";

const SOURCE_META = {
  bodacc: {
    label: "BODACC",
    licence: LICENCE_OUVERTE,
    url: "https://www.bodacc.fr/",
  },
  rna: {
    label: "Journal officiel des associations",
    licence: LICENCE_OUVERTE,
    url: "https://www.journal-officiel.gouv.fr/pages/associations-recherche/",
  },
  georisques: {
    label: "Géorisques (GASPAR)",
    licence: LICENCE_OUVERTE,
    url: "https://www.georisques.gouv.fr/",
  },
};

/* ── seed loader ────────────────────────────────────────────────────────── */

/**
 * Extract { slug, name, inseeCode, department, population } for the seed
 * cities. Parsed with a regex rather than imported: the seed module runs
 * calibration + z-score rescaling at load time, which costs seconds on a cold
 * start and would force this script out of plain .mjs.
 */
async function loadSeed() {
  const src = await fs.readFile(SEED_TS, "utf8");
  const out = [];
  const blocks = src.split(/\n {2}\{\n/).slice(1);
  for (const b of blocks) {
    const s = (k) => b.match(new RegExp(`${k}:\\s*"([^"]+)"`))?.[1] ?? null;
    const n = (k) => {
      const m = b.match(new RegExp(`${k}:\\s*(-?[\\d.]+)`));
      return m ? Number(m[1]) : null;
    };
    const slug = s("slug");
    const insee = s("inseeCode");
    if (!slug || !insee) continue;
    out.push({
      slug,
      name: s("name"),
      inseeCode: insee,
      department: s("department"),
      population: n("population") ?? 0,
    });
  }
  return out;
}

/**
 * Département code from an Insee commune code. Two digits normally, three for
 * the DROM (971–976), and Corsica's 2A/2B are encoded 20x in some files — the
 * Insee code itself already carries "2A"/"2B", so we pass it through.
 */
export function deptFromInsee(insee) {
  if (!insee || insee.length < 4) return null;
  if (insee.startsWith("2A") || insee.startsWith("2B")) return insee.slice(0, 2);
  if (insee.startsWith("97") || insee.startsWith("98")) return insee.slice(0, 3);
  return insee.slice(0, 2);
}

/** Uppercase, accent-free, punctuation-normalised commune name — the shape
 *  administrative files use ("SAINT-ETIENNE", "L'HAY-LES-ROSES"). */
export function normalizeCommune(name) {
  if (!name) return "";
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── HTTP with backoff ──────────────────────────────────────────────────── */

class EgressBlocked extends Error {}

/**
 * GET returning parsed JSON, with Retry-After-aware backoff.
 *
 * A 403/407 is the organisation proxy refusing the CONNECT, not the API
 * rate-limiting us: retrying is pointless and it only fills the log, so it
 * raises EgressBlocked and the batch runner stops the whole run.
 */
async function getJson(url, { tries = 4 } = {}) {
  let lastErr = null;
  for (let i = 0; i < tries; i++) {
    let res;
    try {
      res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
      });
    } catch (err) {
      // A proxy that refuses CONNECT surfaces as a transport error, not a
      // status — recognise it here too so we abort instead of retrying 4×.
      if (/403|CONNECT|tunnel/i.test(String(err?.message))) {
        throw new EgressBlocked(`blocked at proxy layer — ${new URL(url).host}`);
      }
      lastErr = err;
      await sleep(2 ** i * 1500);
      continue;
    }
    if (res.ok) {
      try {
        return await res.json();
      } catch (err) {
        lastErr = err;
        await sleep(2 ** i * 1500);
        continue;
      }
    }
    if (res.status === 403 || res.status === 407) {
      throw new EgressBlocked(
        `blocked at proxy layer (${res.status}) — ${new URL(url).host}`,
      );
    }
    if (res.status === 404) throw new Error(`404 — ${url}`);
    const retryAfter = Number(res.headers.get("retry-after")) * 1000;
    lastErr = new Error(`${res.status} ${res.statusText} — ${url}`);
    if (i === tries - 1) break;
    await sleep(retryAfter || 2 ** i * 2000 + Math.random() * 500);
  }
  throw lastErr ?? new Error(`request failed — ${url}`);
}

/**
 * Same as getJson, but the raw payload is kept under .cache/city-news/.
 *
 * The cache key carries the DATE. That is the difference between this pipeline
 * and the parks crawl: parks are a one-off backfill, where a cached response is
 * always as good as a fresh one, but this is a refresh — a payload from last
 * week is exactly what we are trying to replace. Keying by day means a run that
 * died mid-batch resumes for free, while next week's run genuinely re-fetches.
 *
 * `--force` bypasses the cache entirely.
 */
async function cachedGetJson(key, url, now) {
  const day = now.toISOString().slice(0, 10);
  const file = path.join(CACHE_DIR, `${key}.${day}.v${QUERY_VERSION}.json`);
  if (!FORCE) {
    try {
      return JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      /* cold cache — fall through to the network */
    }
  }
  const json = await getJson(url);
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(json));
  return json;
}

/* ── pure helpers (exported for selftest — no network, no clock) ─────────── */

/** First day of the month an ISO date falls in. Aggregates are dated to the
 *  1st because a monthly count belongs to no single day. */
export function monthStart(iso) {
  const m = /^(\d{4})-(\d{2})/.exec(String(iso ?? ""));
  return m ? `${m[1]}-${m[2]}-01` : null;
}

/** ISO date `months` before `now`, UTC. */
export function cutoffISO(now, months = WINDOW_MONTHS) {
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

/**
 * Drop entries outside the window, sort most-recent-first, cap.
 *
 * Future-dated rows are dropped: an order published with a forward date would
 * otherwise pin itself to the top of the list forever. Ties break on kind so
 * the committed JSON is byte-stable between runs — an unstable sort would
 * produce a diff on every refresh even when nothing changed.
 */
export function windowEntries(entries, now, { months = WINDOW_MONTHS, max = MAX_ENTRIES_PER_CITY } = {}) {
  const cutoff = cutoffISO(now, months);
  const today = now.toISOString().slice(0, 10);
  const inWindow = (entries ?? [])
    .filter((e) => e && typeof e.date === "string" && e.date >= cutoff && e.date <= today)
    .sort(byDateDesc);
  return roundRobinByKind(inWindow, max).sort(byDateDesc);
}

function byDateDesc(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0;
}

/**
 * Fill the 8 slots by taking one entry from each kind in turn, most recent
 * first, instead of taking the 8 most recent outright.
 *
 * Straight recency looked right and was not: BODACC produces up to three
 * aggregates every single month, so twelve months of business counts fill every
 * slot and a CatNat order from last spring — a flood, a drought, the thing a
 * reader most needs to see — is pushed out by the fourth consecutive month of
 * "42 créations". Round-robin guarantees every kind the city actually has gets
 * a slot before any kind gets a second one.
 *
 * Kinds are visited in order of their most recent entry, so the freshest signal
 * still leads.
 */
export function roundRobinByKind(sorted, max) {
  const byKind = new Map();
  for (const e of sorted) {
    if (!byKind.has(e.kind)) byKind.set(e.kind, []);
    byKind.get(e.kind).push(e);
  }
  const queues = [...byKind.values()];
  const out = [];
  let progress = true;
  while (out.length < max && progress) {
    progress = false;
    for (const q of queues) {
      if (!q.length) continue;
      out.push(q.shift());
      progress = true;
      if (out.length >= max) break;
    }
  }
  return out;
}

/**
 * Fold BODACC/RNA rows into one entry per (month, kind).
 *
 * `rows` is [{ date, kind, count }]. Counts are summed, never averaged and
 * never extrapolated over a partial month: the current month is included as-is
 * and the label says which month it is, so a low count on the 3rd reads as a
 * partial month rather than a collapse.
 */
export function aggregateMonthly(rows, { source, sourceUrl, licence, label, labelEn }) {
  const buckets = new Map();
  for (const r of rows ?? []) {
    const month = monthStart(r?.date);
    const count = Number(r?.count);
    if (!month || !r?.kind || !Number.isFinite(count) || count <= 0) continue;
    const key = `${month}|${r.kind}`;
    buckets.set(key, (buckets.get(key) ?? 0) + count);
  }
  const out = [];
  for (const [key, count] of buckets) {
    const [date, kind] = key.split("|");
    out.push({
      date,
      kind,
      title: label(kind, count, date),
      ...(labelEn ? { titleEn: labelEn(kind, count, date) } : {}),
      source,
      sourceUrl,
      licence,
    });
  }
  return out;
}

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
export function monthLabelFR(iso) {
  const m = /^(\d{4})-(\d{2})/.exec(String(iso ?? ""));
  if (!m) return String(iso ?? "");
  return `${MONTHS_FR[Number(m[2]) - 1]} ${m[1]}`;
}

/** Factual sentences. No adjective, no trend, no comparison to a national
 *  average — the number and the month, nothing else. Plural agreement matters:
 *  "1 créations" in production would undo the credibility the section is for. */
export function bodaccTitle(kind, count, date) {
  const when = monthLabelFR(date);
  const s = count > 1 ? "s" : "";
  if (kind === "entreprises") return `${count} création${s} d'entreprise${s} publiée${s} au BODACC en ${when}`;
  if (kind === "radiations") return `${count} radiation${s} d'entreprise${s} publiée${s} au BODACC en ${when}`;
  if (kind === "procedures") return `${count} procédure${s} collective${s} publiée${s} au BODACC en ${when}`;
  return `${count} annonce${s} au BODACC en ${when}`;
}

export function rnaTitle(_kind, count, date) {
  const s = count > 1 ? "s" : "";
  return `${count} association${s} créée${s} en ${monthLabelFR(date)} (Journal officiel)`;
}

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export function monthLabelEN(iso) {
  const m = /^(\d{4})-(\d{2})/.exec(String(iso ?? ""));
  if (!m) return String(iso ?? "");
  return `${MONTHS_EN[Number(m[2]) - 1]} ${m[1]}`;
}

/**
 * The English sentence, written at crawl time alongside the French one.
 *
 * bestcitiesinfrance.com renders the same records, and a title composed only in
 * French would ship "42 créations d'entreprises publiées au BODACC" onto an
 * English page — the exact leak CLAUDE.md convention #6 is about. The figures
 * are identical by construction: both strings are built from the same count, so
 * the two locales cannot drift the way hand-translated copy does.
 */
export function bodaccTitleEn(kind, count, date) {
  const when = monthLabelEN(date);
  const s = count > 1 ? "s" : "";
  if (kind === "entreprises") return `${count} business registration${s} published in the BODACC in ${when}`;
  if (kind === "radiations") return `${count} business deregistration${s} published in the BODACC in ${when}`;
  if (kind === "procedures") return `${count} insolvency proceeding${s} published in the BODACC in ${when}`;
  return `${count} BODACC notice${s} in ${when}`;
}

export function rnaTitleEn(_kind, count, date) {
  const s = count > 1 ? "s" : "";
  return `${count} association${s} created in ${monthLabelEN(date)} (Journal officiel)`;
}

/**
 * One CatNat order → one entry. These are State acts naming no private party,
 * so unlike BODACC they are listed individually: "arrêté sécheresse du 3 mars"
 * is the kind of thing a reader actually needs, and it cross-checks the
 * modelled hazard scores already on /villes/[slug]/risques.
 *
 * Returns null when the row carries no usable date — a CatNat entry without a
 * date is not an entry, and inventing one from the publication date of a
 * neighbouring order would be a fabrication.
 */
export function catnatEntry(row) {
  if (!row) return null;
  const date =
    isoDate(row.date_publication_arrete) ??
    isoDate(row.date_publication_jo) ??
    isoDate(row.date_debut_evt);
  if (!date) return null;
  const risk = String(row.libelle_risque_jo ?? "").trim();
  const code = String(row.code_national_catnat ?? "").trim();
  const period = catnatPeriod(row);
  const title = risk
    ? `Arrêté de catastrophe naturelle — ${risk.toLowerCase()}${period}`
    : `Arrêté de catastrophe naturelle${period}`;
  // The English frame is ours; the risk label is NOT translated. It is the
  // wording of a French administrative act ("inondations et coulées de boue"),
  // and an approximate English rendering of a legal category would be our error
  // attributed to the State. The date and the outbound link carry the rest.
  const titleEn = risk
    ? `Natural-disaster order — ${risk.toLowerCase()}${catnatPeriodEn(row)}`
    : `Natural-disaster order${catnatPeriodEn(row)}`;
  return {
    date,
    kind: "catnat",
    title,
    titleEn,
    source: SOURCE_META.georisques.label,
    sourceUrl: code
      ? `https://www.georisques.gouv.fr/risques/catnat/donnees?codeNational=${encodeURIComponent(code)}`
      : SOURCE_META.georisques.url,
    licence: SOURCE_META.georisques.licence,
  };
}

function catnatPeriod(row) {
  const a = isoDate(row.date_debut_evt);
  const b = isoDate(row.date_fin_evt);
  if (!a) return "";
  if (!b || b === a) return ` (événement du ${frDate(a)})`;
  return ` (événement du ${frDate(a)} au ${frDate(b)})`;
}

function catnatPeriodEn(row) {
  const a = isoDate(row.date_debut_evt);
  const b = isoDate(row.date_fin_evt);
  if (!a) return "";
  if (!b || b === a) return ` (event of ${enDate(a)})`;
  return ` (event from ${enDate(a)} to ${enDate(b)})`;
}

function enDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS_EN[Number(m[2]) - 1]} ${m[1]}`;
}

function frDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS_FR[Number(m[2]) - 1]} ${m[1]}`;
}

/** Accepts the shapes these APIs mix: "2026-03-12", "2026-03-12T00:00:00+01:00",
 *  "12/03/2026". Returns YYYY-MM-DD or null — never a guess. */
export function isoDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

/* ── ingests ────────────────────────────────────────────────────────────── */

/**
 * BODACC monthly counts for one commune.
 *
 * Uses the Explore v2.1 aggregation endpoint (`group_by`) rather than paging
 * records: Paris alone publishes tens of thousands of notices a year, and we
 * only ever display a count. One request per city instead of hundreds.
 */
async function fetchBodacc(city, anchor, now) {
  const since = cutoffISO(now, WINDOW_MONTHS);
  const where = `${bodaccWhere(city, anchor, since)} and ${bodaccFamilyFilter()}`;
  const url =
    `${BODACC_BASE}/${BODACC_DATASET}/records` +
    `?select=${encodeURIComponent("count(*) as n")}` +
    `&where=${encodeURIComponent(where)}` +
    `&group_by=${encodeURIComponent(
      `${BODACC_FIELDS.family}, year(${BODACC_FIELDS.date}) as annee, month(${BODACC_FIELDS.date}) as mois`,
    )}` +
    `&limit=100`;
  const json = await cachedGetJson(`${city.slug}.bodacc`, url, now);
  const rows = [];
  for (const r of json?.results ?? []) {
    const kind = bodaccKind(r[BODACC_FIELDS.family]);
    if (!kind) continue;
    rows.push({ date: monthISO(r.annee, r.mois), kind, count: Number(r.n) });
  }
  return aggregateMonthly(rows, {
    source: SOURCE_META.bodacc.label,
    sourceUrl: SOURCE_META.bodacc.url,
    licence: SOURCE_META.bodacc.licence,
    label: bodaccTitle,
    labelEn: bodaccTitleEn,
  });
}

/** Map a BODACC `familleavis` value onto one of our kinds, tolerantly: the
 *  published values vary in case, accents and spacing between exports. */
export function bodaccKind(famille) {
  const key = normalizeCommune(famille).toLowerCase().replace(/[^a-z]+/g, "_");
  for (const [needle, kind] of Object.entries(BODACC_FAMILY_TO_KIND)) {
    if (key.includes(needle)) return kind;
  }
  return null;
}

/**
 * Restrict the aggregation to the four families we map.
 *
 * Not an optimisation: `group_by` returns at most 100 buckets, and all twelve
 * families over twelve months overflow that. Dropping the eight families we
 * ignore anyway (dépôts de comptes, ventes, modifications…) keeps the worst case
 * at 4 × 12 = 48 buckets, so no month can be silently cut off the end.
 */
export function bodaccFamilyFilter() {
  const families = [...new Set(Object.keys(BODACC_FAMILY_TO_KIND))];
  return `${BODACC_FIELDS.family} in (${families.map((f) => `"${f}"`).join(",")})`;
}

/** `2026, 3` → `2026-03-01`. ODS groups dates by year and month separately. */
export function monthISO(year, month) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

/**
 * The commune filter.
 *
 * The seed carries an Insee code and nothing else — no postal code. BODACC
 * carries no Insee column either (checked live 2026-08-04), so this always
 * falls back to commune name + département.
 *
 * The name half is a full-text `search()`, not an equality test, and that is
 * deliberate: BODACC's `ville` is free text typed by clerks. Département 42
 * holds 81 650 rows spelled "Saint-Étienne" and 46 184 spelled "Saint-Etienne";
 * Marseille's rows are split across "Marseille" and "Marseille 8e
 * Arrondissement". An `=` test picks one spelling and silently drops the rest —
 * a number that looks like a measurement and is off by half. `search()` is
 * accent- and case-insensitive and folds the arrondissement rows back into the
 * commune they belong to.
 *
 * What it costs: `search()` also matches a longer commune name containing this
 * one ("Annecy" catches "Annecy-le-Vieux", which merged into Annecy in 2017, so
 * there it is right — but the general case is not guaranteed). Scoped to one
 * département that stays rare, and an over-count is visible where an
 * under-count is not. The imprecision is stated on the page.
 */
export function bodaccWhere(city, anchor, since) {
  const date = `${BODACC_FIELDS.date} >= date'${since}'`;
  if (anchor === "insee") {
    return `${BODACC_FIELDS.insee} = "${city.inseeCode}" and ${date}`;
  }
  const dept = deptFromInsee(city.inseeCode);
  const name = city.name.replace(/"/g, "");
  return `search(${BODACC_FIELDS.city}, "${name}") and ${BODACC_FIELDS.dept} = "${dept}" and ${date}`;
}

/** CatNat orders for one commune, anchored on the Insee code (exact). */
async function fetchCatnat(city, now) {
  const url = `${GEORISQUES_CATNAT}?code_insee=${encodeURIComponent(city.inseeCode)}&page=1&page_size=50`;
  const json = await cachedGetJson(`${city.slug}.catnat`, url, now);
  const rows = json?.data ?? json?.results ?? [];
  const cutoff = cutoffISO(now, WINDOW_MONTHS);
  return rows
    .map(catnatEntry)
    .filter((e) => e && e.date >= cutoff);
}

/**
 * Association creations for one commune.
 *
 * Disabled until `probe` resolves the RNA resource id on data.gouv.fr. Returning
 * null (rather than an empty list) is what keeps this honest: null means "we did
 * not ask", and the city record then omits "rna" from its sources instead of
 * implying the commune created zero associations.
 */
async function fetchRna(city, now) {
  if (!RNA_RESOURCE_ID) return null;
  const since = cutoffISO(now, WINDOW_MONTHS);
  const url =
    `${DATAGOUV_TABULAR}/${RNA_RESOURCE_ID}/data/` +
    `?${RNA_FIELDS.insee}__exact=${encodeURIComponent(city.inseeCode)}` +
    `&${RNA_FIELDS.date}__greater=${encodeURIComponent(since)}&page_size=500`;
  const json = await cachedGetJson(`${city.slug}.rna`, url, now);
  const rows = [];
  for (const r of json?.data ?? []) {
    const d = isoDate(r?.[RNA_FIELDS.date]);
    if (d) rows.push({ date: d, kind: "associations", count: 1 });
  }
  return aggregateMonthly(rows, {
    source: SOURCE_META.rna.label,
    sourceUrl: SOURCE_META.rna.url,
    licence: SOURCE_META.rna.licence,
    label: rnaTitle,
    labelEn: rnaTitleEn,
  });
}

/* ── one city ───────────────────────────────────────────────────────────── */

/**
 * Refresh one commune across the three sources.
 *
 * A source that throws is recorded as absent, not as zero, and the other two
 * still produce a row. That partial row is legitimate: the surface lists what
 * it has and names its sources. A source that is merely blocked at the proxy
 * aborts the whole run instead (nothing downstream will work either).
 */
async function refreshCity(city, anchor, now) {
  const entries = [];
  const sources = [];
  for (const [name, fn] of [
    ["bodacc", () => fetchBodacc(city, anchor, now)],
    ["georisques", () => fetchCatnat(city, now)],
    ["rna", () => fetchRna(city, now)],
  ]) {
    let got;
    try {
      got = await fn();
    } catch (err) {
      if (err instanceof EgressBlocked) throw err;
      log(`      ${name}: ${err.message}`);
      continue;
    }
    if (got == null) continue; // not asked (RNA disabled) — not "zero".
    sources.push(name);
    entries.push(...got);
    await sleep(MIN_SLEEP_MS);
  }
  if (!sources.length) return null;
  return {
    refreshedAt: now.toISOString().slice(0, 10),
    queryVersion: QUERY_VERSION,
    sources,
    entries: windowEntries(entries, now),
  };
}

/* ── file I/O ───────────────────────────────────────────────────────────── */

const EMPTY_FILE = {
  meta: {
    refreshedAt: null,
    queryVersion: QUERY_VERSION,
    windowMonths: WINDOW_MONTHS,
    maxEntriesPerCity: MAX_ENTRIES_PER_CITY,
  },
  cities: {},
};

async function readFile_() {
  try {
    const j = JSON.parse(await fs.readFile(OUT_JSON, "utf8"));
    return { meta: { ...EMPTY_FILE.meta, ...(j.meta ?? {}) }, cities: j.cities ?? {} };
  } catch {
    return structuredClone(EMPTY_FILE);
  }
}

async function writeFile_(file) {
  // Slug-sorted so the committed diff is stable across runs.
  const cities = Object.fromEntries(
    Object.entries(file.cities).sort(([a], [b]) => a.localeCompare(b)),
  );
  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify({ ...file, cities }, null, 2) + "\n");
}

function daysSince(iso, now) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(t) ? Infinity : Math.floor((now.getTime() - t) / 86_400_000);
}

/**
 * Batch order: never-crawled cities first (biggest first), then the rows that
 * have gone stale, oldest first. That is what turns a weekly routine into a
 * rotation over 540 cities instead of a permanent re-crawl of Paris.
 */
export function pickBatch(seed, cities, now, { limit = LIMIT, onlySlug = null, force = false } = {}) {
  if (onlySlug) return seed.filter((c) => c.slug === onlySlug);
  const fresh = [];
  const stale = [];
  for (const c of seed) {
    const row = cities[c.slug];
    if (!row || force) { fresh.push(c); continue; }
    if ((row.queryVersion ?? 0) !== QUERY_VERSION) { stale.push([c, Infinity]); continue; }
    const age = daysSince(row.refreshedAt, now);
    if (age > DUE_AFTER_DAYS) stale.push([c, age]);
  }
  fresh.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
  stale.sort((a, b) => b[1] - a[1] || (b[0].population ?? 0) - (a[0].population ?? 0));
  return [...fresh, ...stale.map(([c]) => c)].slice(0, limit);
}

/* ── commands ───────────────────────────────────────────────────────────── */

async function crawlBatch() {
  const now = new Date();
  const seed = await loadSeed();
  const file = await readFile_();
  const batch = pickBatch(seed, file.cities, now, {
    limit: LIMIT,
    onlySlug: ONLY_SLUG,
    force: FORCE,
  });

  log(`seed: ${seed.length} cities`);
  log(`state: ${Object.keys(file.cities).length} rows, last refresh ${file.meta.refreshedAt ?? "never"}`);
  log(`batch: ${batch.length} cities this run (limit ${LIMIT})`);
  if (!batch.length) { log("nothing to do — every row is fresh"); return; }

  const anchor = await resolveAnchor();
  log(`bodacc anchor: ${anchor}${anchor === "name+dept" ? " (inexact — see bodaccWhere)" : ""}`);

  let ok = 0, empty = 0, failed = 0;
  const started = Date.now();
  for (const [i, city] of batch.entries()) {
    try {
      const row = await refreshCity(city, anchor, now);
      if (!row) { failed++; log(`  [${i + 1}/${batch.length}] ${city.slug} — no source answered`); continue; }
      file.cities[city.slug] = row;
      file.meta.refreshedAt = row.refreshedAt;
      if (!row.entries.length) empty++;
      ok++;
      log(`  [${i + 1}/${batch.length}] ${city.slug} — ${row.entries.length} entrée(s) [${row.sources.join(", ")}]`);
    } catch (err) {
      if (err instanceof EgressBlocked) {
        log(`  [${i + 1}/${batch.length}] ${city.slug} — ${err.message}`);
        log("egress policy is blocking the open-data hosts — aborting run, run this locally.");
        break;
      }
      failed++;
      log(`  [${i + 1}/${batch.length}] ${city.slug} — FAILED: ${err.message}`);
    }
    await writeFile_(file);
    if (i < batch.length - 1) await sleep(MIN_SLEEP_MS);
  }
  const secs = ((Date.now() - started) / 1000).toFixed(0);
  log(`done: ${ok} ok (${empty} with nothing in window), ${failed} failed in ${secs}s — ${Object.keys(file.cities).length}/${seed.length} covered`);
}

/**
 * Which commune anchor BODACC actually offers. Falls back to the inexact
 * name+dept filter when the dataset has no Insee column — and says so, rather
 * than silently producing rows whose provenance nobody can audit later.
 */
async function resolveAnchor() {
  try {
    const json = await getJson(`${BODACC_BASE}/${BODACC_DATASET}`);
    const fields = (json?.fields ?? []).map((f) => f.name);
    return fields.includes(BODACC_FIELDS.insee) ? "insee" : "name+dept";
  } catch (err) {
    if (err instanceof EgressBlocked) throw err;
    return "name+dept";
  }
}

/** Print what the three APIs really answer. Writes nothing. */
async function probe() {
  const seed = await loadSeed();
  const city = seed.find((c) => c.slug === (ONLY_SLUG ?? "annecy")) ?? seed[0];
  log(`probing with ${city.name} (Insee ${city.inseeCode})\n`);

  log("— BODACC —");
  try {
    const meta = await getJson(`${BODACC_BASE}/${BODACC_DATASET}`);
    const fields = (meta?.fields ?? []).map((f) => `${f.name}:${f.type}`);
    log(`  dataset ok, ${fields.length} fields`);
    log(`  ${fields.join(", ")}`);
    log(`  insee column present: ${fields.some((f) => f.startsWith(BODACC_FIELDS.insee + ":"))}`);
    const url =
      `${BODACC_BASE}/${BODACC_DATASET}/records?select=${encodeURIComponent("count(*) as n")}` +
      `&group_by=${encodeURIComponent(BODACC_FIELDS.family)}&limit=50`;
    const fam = await getJson(url);
    log(
      `  familleavis values: ${(fam?.results ?? [])
        .map((r) => `${r[BODACC_FIELDS.family]}(${r.n})`)
        .join(", ")}`,
    );
    const counts = await getJson(
      `${BODACC_BASE}/${BODACC_DATASET}/records?select=${encodeURIComponent("count(*) as n")}` +
        `&where=${encodeURIComponent(`${bodaccWhere(city, "name+dept", cutoffISO(new Date(), WINDOW_MONTHS))} and ${bodaccFamilyFilter()}`)}` +
        `&group_by=${encodeURIComponent(`${BODACC_FIELDS.family}, year(${BODACC_FIELDS.date}) as annee, month(${BODACC_FIELDS.date}) as mois`)}&limit=100`,
    );
    const buckets = counts?.results ?? [];
    log(`  ${city.name}: ${buckets.length} month/family bucket(s) over ${WINDOW_MONTHS} months`);
    if (buckets.length) log(`  first bucket: ${JSON.stringify(buckets[0])}`);
  } catch (err) {
    log(`  FAILED: ${err.message}`);
  }

  log("\n— Géorisques CatNat —");
  try {
    const json = await getJson(`${GEORISQUES_CATNAT}?code_insee=${city.inseeCode}&page=1&page_size=5`);
    const rows = json?.data ?? json?.results ?? [];
    log(`  ${rows.length} row(s); keys: ${Object.keys(rows[0] ?? {}).join(", ") || "—"}`);
    if (rows[0]) log(`  first parsed: ${JSON.stringify(catnatEntry(rows[0]))}`);
  } catch (err) {
    log(`  FAILED: ${err.message}`);
  }

  log("\n— RNA / JO associations —");
  if (!RNA_RESOURCE_ID) {
    log("  disabled: RNA_RESOURCE_ID is null. Resolve the RNA resource on");
    log("  data.gouv.fr, check it is queryable through tabular-api.data.gouv.fr,");
    log("  then set RNA_RESOURCE_ID + RNA_FIELDS and re-run this probe.");
  } else {
    try {
      const json = await getJson(
        `${DATAGOUV_TABULAR}/${RNA_RESOURCE_ID}/data/?${RNA_FIELDS.insee}__exact=${city.inseeCode}&page_size=5`,
      );
      log(`  keys: ${Object.keys(json?.data?.[0] ?? {}).join(", ") || "—"}`);
    } catch (err) {
      log(`  FAILED: ${err.message}`);
    }
  }
}

/** Re-window the committed file against today. No network — this is what a run
 *  can still do when egress is blocked, and it is what keeps a stale file from
 *  carrying entries past 12 months. */
async function prune() {
  const now = new Date();
  const file = await readFile_();
  let dropped = 0, emptied = 0;
  for (const [slug, row] of Object.entries(file.cities)) {
    const before = row.entries?.length ?? 0;
    row.entries = windowEntries(row.entries, now);
    dropped += before - row.entries.length;
    if (before && !row.entries.length) { emptied++; log(`  ${slug}: now empty`); }
  }
  await writeFile_(file);
  log(`pruned ${dropped} out-of-window entrie(s); ${emptied} city/cities emptied`);
}

async function showStats() {
  const seed = await loadSeed();
  const file = await readFile_();
  const rows = Object.values(file.cities);
  const entries = rows.reduce((s, r) => s + (r.entries?.length ?? 0), 0);
  const empty = rows.filter((r) => !(r.entries?.length ?? 0)).length;
  const byKind = {};
  for (const r of rows) for (const e of r.entries ?? []) byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
  log(`covered ${rows.length}/${seed.length} cities, ${entries} entries (${empty} with nothing in window)`);
  log(`last refresh: ${file.meta.refreshedAt ?? "never"}`);
  log(`by kind: ${Object.entries(byKind).map(([k, n]) => `${k} ${n}`).join(", ") || "—"}`);
}

/* ── selftest ───────────────────────────────────────────────────────────── */

/**
 * Offline checks on fixtures. Everything that shapes what a reader sees —
 * windowing, aggregation, plural agreement, date parsing, batch rotation — is
 * pure, so it can be verified without egress. This is the counterpart of the
 * commune canary in city-parks.mjs: the failure mode here is not a wrong photo,
 * it is a wrong number presented as an official count.
 */
function selftest() {
  const results = [];
  const check = (label, got, want) => {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    results.push(ok);
    log(`  ${ok ? "ok  " : "FAIL"} ${label}`);
    if (!ok) log(`       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`);
  };
  const NOW = new Date("2026-08-04T12:00:00Z");

  // — dates —
  check("isoDate ISO", isoDate("2026-03-12"), "2026-03-12");
  check("isoDate ISO+time", isoDate("2026-03-12T00:00:00+01:00"), "2026-03-12");
  check("isoDate FR slash", isoDate("12/03/2026"), "2026-03-12");
  check("isoDate garbage → null", isoDate("mars 2026"), null);
  check("isoDate empty → null", isoDate(""), null);
  check("monthStart", monthStart("2026-03-27"), "2026-03-01");
  check("cutoff 12 months", cutoffISO(NOW, 12), "2025-08-04");

  // — commune helpers —
  check("normalizeCommune accents", normalizeCommune("Saint-Étienne"), "SAINT-ETIENNE");
  check("dept from Insee", deptFromInsee("74010"), "74");
  check("dept from DROM Insee", deptFromInsee("97411"), "974");
  check("dept from Corsican Insee", deptFromInsee("2A004"), "2A");

  // — windowing —
  const entries = [
    { date: "2026-07-01", kind: "entreprises", title: "a" },
    { date: "2024-01-01", kind: "entreprises", title: "old" },   // out of window
    { date: "2027-01-01", kind: "catnat", title: "future" },     // future-dated
    { date: "2026-03-01", kind: "radiations", title: "b" },
  ];
  check(
    "window drops old + future, sorts desc",
    windowEntries(entries, NOW).map((e) => e.title),
    ["a", "b"],
  );
  check(
    "window caps",
    windowEntries(
      Array.from({ length: 12 }, (_, i) => ({
        date: `2026-0${(i % 7) + 1}-01`,
        kind: "entreprises",
        title: `t${i}`,
      })),
      NOW,
    ).length,
    MAX_ENTRIES_PER_CITY,
  );
  // The boundary itself is inside the window — an entry dated exactly 12 months
  // back must not flicker in and out depending on the hour the routine runs.
  check(
    "window keeps the cutoff day itself",
    windowEntries([{ date: "2025-08-04", kind: "catnat", title: "edge" }], NOW).length,
    1,
  );
  check("window on empty input", windowEntries(undefined, NOW), []);
  // The failure this guards against: 12 months × 3 BODACC aggregates filling
  // every slot, so a CatNat order from last spring never reaches the page.
  const crowded = [
    ...Array.from({ length: 12 }, (_, i) => ({
      date: `2026-${String(12 - i).padStart(2, "0")}-01`.replace("2026-12", "2025-12"),
      kind: "entreprises",
      title: `e${i}`,
    })).filter((e) => e.date <= "2026-08-04"),
    ...Array.from({ length: 12 }, (_, i) => ({
      date: `2026-0${(i % 7) + 1}-01`,
      kind: "radiations",
      title: `r${i}`,
    })),
    { date: "2026-01-15", kind: "catnat", title: "arrêté" },
  ];
  check(
    "a rare CatNat order is not crowded out by monthly aggregates",
    windowEntries(crowded, NOW).some((e) => e.kind === "catnat"),
    true,
  );
  check(
    "round-robin still returns most-recent-first",
    windowEntries(crowded, NOW).every((e, i, a) => i === 0 || a[i - 1].date >= e.date),
    true,
  );
  check(
    "window drops rows with no date",
    windowEntries([{ kind: "catnat", title: "x" }], NOW),
    [],
  );

  // — aggregation —
  const agg = aggregateMonthly(
    [
      { date: "2026-07-03", kind: "entreprises", count: 20 },
      { date: "2026-07-28", kind: "entreprises", count: 22 },
      { date: "2026-07-14", kind: "radiations", count: 1 },
      { date: "bogus", kind: "entreprises", count: 5 },        // dropped
      { date: "2026-07-01", kind: "entreprises", count: 0 },   // dropped
    ],
    {
      source: "BODACC",
      sourceUrl: "https://www.bodacc.fr/",
      licence: LICENCE_OUVERTE,
      label: bodaccTitle,
      labelEn: bodaccTitleEn,
    },
  ).sort((a, b) => (a.kind < b.kind ? -1 : 1));
  check("aggregate sums the month", agg.find((e) => e.kind === "entreprises")?.title,
    "42 créations d'entreprises publiées au BODACC en juillet 2026");
  check("aggregate singular agreement", agg.find((e) => e.kind === "radiations")?.title,
    "1 radiation d'entreprise publiée au BODACC en juillet 2026");
  check("aggregate dates to the 1st", agg[0]?.date, "2026-07-01");
  check("aggregate carries the licence", agg[0]?.licence, LICENCE_OUVERTE);
  check("aggregate drops unparseable + zero rows", agg.length, 2);
  // Both locales are composed from the same count, so they cannot disagree on
  // the figure — the hreflang rule in CLAUDE.md ("a FR page and its EN twin must
  // never show different numbers") holds by construction rather than by review.
  check("aggregate carries an English twin",
    agg.find((e) => e.kind === "entreprises")?.titleEn,
    "42 business registrations published in the BODACC in July 2026");
  check("English twin agrees on the figure",
    agg.every((e) => {
      const n = /^(\d+)/.exec(e.title)?.[1];
      return n && e.titleEn?.startsWith(n);
    }), true);
  check("English singular agreement",
    agg.find((e) => e.kind === "radiations")?.titleEn,
    "1 business deregistration published in the BODACC in July 2026");
  check("rna English", rnaTitleEn("associations", 2, "2026-02-01"),
    "2 associations created in February 2026 (Journal officiel)");
  check("rna plural", rnaTitle("associations", 3, "2026-02-01"),
    "3 associations créées en février 2026 (Journal officiel)");
  check("rna singular", rnaTitle("associations", 1, "2026-02-01"),
    "1 association créée en février 2026 (Journal officiel)");

  // — BODACC family mapping —
  check("familleavis creation", bodaccKind("Creation"), "entreprises");
  check("familleavis accented radiation", bodaccKind("Radiation"), "radiations");
  check("familleavis procédure collective", bodaccKind("Procédure collective"), "procedures");
  check("familleavis unknown → null", bodaccKind("Vente"), null);
  check("familleavis empty → null", bodaccKind(""), null);

  // — CatNat —
  const cat = catnatEntry({
    code_national_catnat: "AAA-1",
    libelle_risque_jo: "Inondations et coulées de boue",
    date_debut_evt: "2026-03-12",
    date_fin_evt: "2026-03-14",
    date_publication_arrete: "2026-04-02",
  });
  check("catnat date = arrêté", cat?.date, "2026-04-02");
  check("catnat title", cat?.title,
    "Arrêté de catastrophe naturelle — inondations et coulées de boue (événement du 12 mars 2026 au 14 mars 2026)");
  check("catnat links its record", cat?.sourceUrl.includes("AAA-1"), true);
  check("catnat English frames the official French risk label verbatim", cat?.titleEn,
    "Natural-disaster order — inondations et coulées de boue (event from 12 March 2026 to 14 March 2026)");
  check("catnat with no date → null", catnatEntry({ libelle_risque_jo: "Sécheresse" }), null);
  check("catnat single-day event", catnatEntry({
    libelle_risque_jo: "Sécheresse",
    date_debut_evt: "2026-03-12",
    date_fin_evt: "2026-03-12",
    date_publication_arrete: "2026-04-02",
  })?.title, "Arrêté de catastrophe naturelle — sécheresse (événement du 12 mars 2026)");

  // — BODACC where clause —
  const city = { slug: "annecy", name: "Annecy", inseeCode: "74010" };
  check("where anchors on Insee when available",
    bodaccWhere(city, "insee", "2025-08-04").includes(`${BODACC_FIELDS.insee} = "74010"`), true);
  check("where falls back to a case-insensitive name search + dept",
    bodaccWhere(city, "name+dept", "2025-08-04"),
    `search(${BODACC_FIELDS.city}, "Annecy") and ${BODACC_FIELDS.dept} = "74" and ${BODACC_FIELDS.date} >= date'2025-08-04'`);
  check("family filter names every mapped family and nothing else",
    bodaccFamilyFilter(),
    'familleavis in ("creation","immatriculation","radiation","collective")');
  check("family filter cannot overflow the 100-bucket group_by cap",
    Object.keys(BODACC_FAMILY_TO_KIND).length * WINDOW_MONTHS <= 100, true);
  check("month bucket → first of the month, zero-padded", monthISO(2026, 3), "2026-03-01");
  check("where keeps the seed spelling, accents included",
    bodaccWhere({ slug: "saint-etienne", name: "Saint-Étienne", inseeCode: "42218" }, "name+dept", "2025-08-04")
      .includes('search(ville, "Saint-Étienne")'), true);

  // — batch rotation —
  const seed = [
    { slug: "big", population: 500000 },
    { slug: "small", population: 1000 },
    { slug: "stalest", population: 2000 },
    { slug: "fresh", population: 900000 },
  ];
  const cities = {
    stalest: { refreshedAt: "2026-01-01", queryVersion: QUERY_VERSION, entries: [] },
    fresh: { refreshedAt: "2026-08-01", queryVersion: QUERY_VERSION, entries: [] },
    small: { refreshedAt: "2026-06-01", queryVersion: QUERY_VERSION, entries: [] },
  };
  check("batch: never-crawled first, then stalest; fresh skipped",
    pickBatch(seed, cities, NOW, { limit: 10 }).map((c) => c.slug),
    ["big", "stalest", "small"]);
  check("batch: an old queryVersion is always due",
    pickBatch(seed, { ...cities, fresh: { refreshedAt: "2026-08-04", queryVersion: 0, entries: [] } }, NOW, { limit: 10 })
      .map((c) => c.slug),
    ["big", "fresh", "stalest", "small"]);
  check("batch: --slug overrides everything",
    pickBatch(seed, cities, NOW, { onlySlug: "fresh" }).map((c) => c.slug), ["fresh"]);

  const failed = results.filter((r) => !r).length;
  log(failed ? `\n${failed} check(s) FAILED of ${results.length}` : `\nall ${results.length} checks passed`);
  return failed;
}

/* ── run ────────────────────────────────────────────────────────────────── */

if (cmd === "probe") await probe();
else if (cmd === "selftest") process.exitCode = selftest() ? 1 : 0;
else if (cmd === "prune") await prune();
else if (cmd === "stats") await showStats();
else await crawlBatch();
