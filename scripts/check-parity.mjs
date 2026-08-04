#!/usr/bin/env node
/**
 * Contrôle de parité FR ↔ EN.
 *
 * Deux mesures, volontairement séparées parce qu'elles ne disent pas la même
 * chose et qu'on s'est déjà fait avoir en confondant les deux :
 *
 *  1. **Routes** — les patterns `app/**\/page.tsx` des deux arbres. Répond à
 *     « quelle route n'existe pas en EN ». C'est ce qu'un agent doit lire pour
 *     savoir quoi construire. Hors-ligne, toujours disponible.
 *
 *  2. **URLs** (`--sitemaps`) — le nombre d'URL réellement émises par section,
 *     lu dans les deux sitemaps en ligne. Répond à « la route existe, mais
 *     couvre-t-elle autant de villes / de paires ». Une route EN présente peut
 *     n'émettre que 20 URL là où la FR en émet 600 : la parité de routes serait
 *     verte et le site EN quand même trois fois plus petit.
 *
 * Usage :
 *   node scripts/check-parity.mjs              # routes seulement
 *   node scripts/check-parity.mjs --sitemaps   # + comptage d'URL en ligne
 *   node scripts/check-parity.mjs --json
 *
 * Sort en code 1 s'il reste des routes FR sans jumelle EN — pour qu'un
 * enchaînement automatique puisse s'y accrocher. Les exceptions assumées
 * vivent dans `PARITY_EXCEPTIONS` (lib/i18n.ts), pas ici.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const APP = join(ROOT, "app");
const args = process.argv.slice(2);
const WANT_SITEMAPS = args.includes("--sitemaps");
const AS_JSON = args.includes("--json");

// lib/i18n.ts est du TypeScript : on en extrait les tables plutôt que de tirer
// un runtime TS dans un script de contrôle. Les objets sont des littéraux
// plats, donc une lecture par regex est suffisante — et si le format change,
// le script échoue bruyamment au lieu de rapporter une parité fausse.
function extractRecord(src, name) {
  // `FR_TO_EN_SEGMENT` n'est pas exporté (il ne sert qu'au hreflang), d'où les
  // deux formes acceptées ici.
  let start = src.indexOf(`export const ${name}`);
  if (start === -1) start = src.indexOf(`const ${name}`);
  if (start === -1) throw new Error(`${name} introuvable dans lib/i18n.ts`);
  const open = src.indexOf("{", start);
  let depth = 0, end = -1;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  const body = src.slice(open + 1, end);
  const rec = {};
  for (const m of body.matchAll(/^\s*"?([A-Za-z0-9\-\/]+)"?:\s*"([^"]*)"/gm)) rec[m[1]] = m[2];
  return rec;
}

const i18n = readFileSync(join(ROOT, "lib", "i18n.ts"), "utf8");
const FR_TO_EN_ROUTE = extractRecord(i18n, "FR_TO_EN_ROUTE");
const FR_TO_EN_CITY_SUB = extractRecord(i18n, "FR_TO_EN_CITY_SUB");
const EXCEPTIONS = extractRecord(i18n, "PARITY_EXCEPTIONS");
// FR_TO_EN_ROUTE se compose par spread de FR_TO_EN_SEGMENT : la regex ne voit
// pas le spread, on relit donc la table de base à la source. Elle était
// recopiée en dur ici, et la copie a dérivé dès qu'une famille a été déplacée
// vers FR_TO_EN_SEGMENT — le contrôle criait alors à la tête non mappée.
for (const [fr, en] of Object.entries(extractRecord(i18n, "FR_TO_EN_SEGMENT")))
  FR_TO_EN_ROUTE[fr] ??= en;

function routePatterns(dir) {
  const found = new Set();
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name === "page.tsx") {
        const rel = relative(dir, d);
        const parts = rel === "" ? [] : rel.split(sep)
          .filter((s) => s && !(s.startsWith("(") && s.endsWith(")")));
        found.add("/" + parts.join("/"));
      }
    }
  };
  walk(dir);
  return found;
}

const frRoutes = [...routePatterns(APP)].filter((r) => !r.startsWith("/[locale]"));
const enRoutes = new Set(routePatterns(join(APP, "[locale]")));

/** Traduit une route FR en la route EN attendue, ou null si non mappable. */
function toEn(route) {
  const parts = route.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const head = parts[0];
  const enHead = FR_TO_EN_ROUTE[head];
  if (!enHead) return null;
  const rest = parts.slice(1).map((p) => {
    if (p.startsWith("[")) return p;
    // Les sous-pages portent le même vocabulaire sous /villes, /departements et
    // /regions (fiscalite→tax, synthese→synthesis) : une seule table suffit.
    return FR_TO_EN_CITY_SUB[p] ?? FR_TO_EN_ROUTE[p] ?? p;
  });
  return "/" + [enHead, ...rest].join("/");
}

/**
 * Une page FR statique par thème (`/red-flags/villes-hiver-rude`) est couverte
 * si le côté EN a une route **dynamique** de même profondeur
 * (`/red-flags/[slug]`) : elle génère l'URL, seul le fichier diffère. Sans ça
 * le rapport signale ~30 écarts qui n'en sont pas, et un rapport qui crie au
 * loup ne se lit plus.
 */
function coveredByDynamic(expected) {
  const parts = expected.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  for (const r of enRoutes) {
    const rp = r.split("/").filter(Boolean);
    if (rp.length !== parts.length) continue;
    if (rp.every((seg, i) => seg === parts[i] || seg.startsWith("["))) return true;
  }
  return false;
}

const unmapped = [], missing = [];
for (const r of frRoutes) {
  const head = r.split("/").filter(Boolean)[0];
  if (!head) continue;
  if (head in EXCEPTIONS) continue;
  const en = toEn(r);
  if (en === null) { unmapped.push(r); continue; }
  if (!enRoutes.has(en) && !coveredByDynamic(en)) missing.push({ fr: r, expectedEn: en });
}

const frHeads = new Set(frRoutes.map((r) => r.split("/").filter(Boolean)[0]).filter(Boolean));
const enOnly = [...enRoutes]
  .map((r) => r.split("/").filter(Boolean)[0])
  .filter((h) => h && !(h in EXCEPTIONS))
  .filter((h) => ![...frHeads].some((f) => FR_TO_EN_ROUTE[f] === h))
  .filter((v, i, a) => a.indexOf(v) === i);

async function sitemapCounts() {
  const grab = async (origin) => {
    const counts = {};
    for (let i = 0; i < 20; i++) {
      const res = await fetch(`${origin}/sitemap/${i}.xml`);
      if (!res.ok) continue;
      const xml = await res.text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const head = m[1].replace(origin, "").split("/").filter(Boolean)[0] ?? "(root)";
        counts[head] = (counts[head] ?? 0) + 1;
      }
    }
    return counts;
  };
  const [fr, en] = await Promise.all([
    grab("https://www.mavilleideale.fr"),
    grab("https://bestcitiesinfrance.com"),
  ]);
  return Object.entries(fr)
    .filter(([h]) => !(h in EXCEPTIONS))
    .map(([h, n]) => ({ section: h, fr: n, en: en[FR_TO_EN_ROUTE[h] ?? h] ?? 0 }))
    .map((r) => ({ ...r, gap: r.en - r.fr }))
    .filter((r) => r.gap !== 0)
    .sort((a, b) => a.gap - b.gap);
}

const report = { frRoutes: frRoutes.length, enRoutes: enRoutes.size, missing, unmapped, enOnly };
if (WANT_SITEMAPS) report.sections = await sitemapCounts();

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Routes : FR ${report.frRoutes} · EN ${report.enRoutes}`);
  console.log(`\n${missing.length} route(s) FR sans jumelle EN :`);
  for (const m of missing) console.log(`  ${m.fr.padEnd(46)} → attendu ${m.expectedEn}`);
  if (unmapped.length) {
    console.log(`\n${unmapped.length} route(s) FR à tête non mappée (ajouter à FR_TO_EN_ROUTE ou à PARITY_EXCEPTIONS) :`);
    for (const r of unmapped) console.log(`  ${r}`);
  }
  if (enOnly.length) console.log(`\nTêtes EN sans origine FR : ${enOnly.join(", ")}`);
  if (report.sections) {
    console.log(`\nURL par section (sitemaps en ligne) :`);
    console.log(`  ${"section".padEnd(26)}${"FR".padStart(7)}${"EN".padStart(7)}${"écart".padStart(8)}`);
    for (const s of report.sections) {
      console.log(`  ${s.section.padEnd(26)}${String(s.fr).padStart(7)}${String(s.en).padStart(7)}${String(s.gap).padStart(8)}`);
    }
    const total = report.sections.reduce((a, s) => a + s.gap, 0);
    console.log(`  ${"TOTAL".padEnd(26)}${"".padStart(14)}${String(total).padStart(8)}`);
  }
}

process.exit(missing.length > 0 || unmapped.length > 0 ? 1 : 0);
