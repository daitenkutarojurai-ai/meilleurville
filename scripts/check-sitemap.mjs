#!/usr/bin/env node
/**
 * Contrôle de cohérence entre l'arbre de routes et `app/sitemap.ts`, hors build.
 *
 * Pourquoi ce script existe (2026-08-12). Le sitemap est écrit à la main,
 * section par section, alors que les pages, elles, se génèrent depuis les
 * données. Les deux dérivent donc l'un de l'autre en silence, et c'est arrivé
 * au moins trois fois :
 *
 *   - 2026-08-06 — le sitemap gatait les sous-pages biodiversité sur
 *     `hasBiodiversityData` **sans** `BIODIVERSITY_PAGES_LIVE` : il annonçait
 *     604 URL pendant que les pages étaient garées en `page.pending.tsx`.
 *     604 x 404 déclarés à Google.
 *   - 2026-07-22 (F61) — `PROFILE_SLUGS` était figé en dur dans le sitemap :
 *     les deux profils vacances ajoutés à `VACATION_PROFILES` avaient une page
 *     et aucune URL déclarée.
 *   - 2026-08-05 — même chose pour `/expat-retour` : Côte d'Ivoire et Japon
 *     avaient une page, pas d'URL.
 *
 * Aucun de ces trois défauts ne produit d'erreur : le build passe, les pages
 * s'affichent, seul le sitemap ment. Et `npm run build` ne va plus au bout
 * depuis une session cloud (cf. CLAUDE.md § Commands), donc rien ne les voyait.
 *
 * Le contrôle ne réimplémente pas le sitemap : il **exécute** `app/sitemap.ts`
 * et les `generateStaticParams()` des pages, donc les vraies données. Trois
 * comparaisons, dans les deux sens :
 *
 *   1. toute URL déclarée doit correspondre à une route existante (sinon elle
 *      répond 404) ;
 *   2. toute route statique indexable doit être déclarée — sont dispensées les
 *      pages `noindex` (compte, callback) et les pages dont le `canonical`
 *      pointe ailleurs (FR `/quiz` → `/city-match`, un alias n'a rien à faire
 *      dans un sitemap) ;
 *   3. pour chaque route dynamique, l'ensemble des URL déclarées doit être
 *      exactement l'ensemble des paramètres générés — dans les deux sens.
 *
 * Plus les invariants du protocole : pas de doublon, une seule origine par
 * locale, `lastModified` valide, chunk ≤ 50 000 URL.
 *
 * Les deux locales sont contrôlées, chacune dans son propre process : la locale
 * est lue à l'import des modules (`NEXT_PUBLIC_DEFAULT_LOCALE`), donc on ne peut
 * pas les enchaîner dans le même.
 *
 *   npm run sitemap:check
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nodeRequire = createRequire(import.meta.url);

// Limite du protocole sitemap : 50 000 URL par fichier.
const MAX_URLS_PER_CHUNK = 50_000;

// --- Chargement des modules du dépôt ---------------------------------------
//
// Même principe que `scripts/check-integrity.mjs` : on transpile et on exécute
// les vrais modules. Deux ajouts nécessaires ici, parce qu'on charge des
// `page.tsx` et plus seulement des `data/*.ts` : le JSX (compilé en
// `react/jsx-runtime`, jamais rendu — on ne veut que `generateStaticParams`) et
// les imports relatifs vers les composants voisins.

const cache = new Map();

function resolveIn(base, extensions) {
  for (const ext of extensions) {
    const candidate = base + ext;
    const abs = path.join(ROOT, candidate);
    if (!existsSync(abs) || statSync(abs).isDirectory()) continue;
    return candidate;
  }
  return null;
}

function load(relPath) {
  const abs = path.join(ROOT, relPath);
  if (cache.has(abs)) return cache.get(abs);

  const { outputText } = ts.transpileModule(readFileSync(abs, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: relPath,
  });

  const module = { exports: {} };
  // Posé avant l'exécution : un cycle d'imports voit un objet partiel plutôt
  // que de repartir en boucle.
  cache.set(abs, module.exports);

  const EXT = ["", ".ts", ".tsx", ".json", "/index.ts", "/index.tsx"];
  const require = (id) => {
    const base = id.startsWith(".")
      ? path.join(path.dirname(relPath), id)
      : id.startsWith("@/")
        ? id.slice(2)
        : null;
    // `next/link`, `react`, `lucide-react`… : le vrai paquet. Ils ne sont
    // jamais appelés, seulement importés par les modules de page.
    if (base === null) return nodeRequire(id);

    const found = resolveIn(base, EXT);
    if (!found) throw new Error(`${relPath} : « ${id} » introuvable`);
    if (found.endsWith(".json")) return JSON.parse(readFileSync(path.join(ROOT, found), "utf8"));
    return load(found);
  };

  // eslint-disable-next-line no-new-func
  new Function("exports", "require", "module", outputText)(module.exports, require, module);
  cache.set(abs, module.exports);
  return module.exports;
}

// --- Arbre de routes --------------------------------------------------------

function walkPages(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) walkPages(p, out);
    else if (entry === "page.tsx") out.push(p);
  }
  return out;
}

/** Le chemin public d'un `page.tsx`, et la locale qui le sert. */
function routeOf(absPath) {
  let route = absPath.slice(path.join(ROOT, "app").length).replace(/\/page\.tsx$/, "");
  // L'arbre `app/[locale]/**` n'est généré que pour `en`, et le Worker sert ces
  // pages sans préfixe sur bestcitiesinfrance.com.
  const locale = route.startsWith("/[locale]") ? "en" : "fr";
  route = route.replace("/[locale]", "").replace(/\/\([^)]*\)/g, "");
  return { locale, route: route || "/" };
}

const isDynamic = (route) => route.includes("[");

function routeRegExp(route) {
  const body = route
    .split("/")
    .map((seg) =>
      seg.startsWith("[...")
        ? ".+"
        : seg.startsWith("[")
          ? "[^/]+"
          : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .join("/");
  return new RegExp(`^${body}$`);
}

function fillRoute(route, params) {
  return route.replace(/\[\.\.\.([^\]]+)\]|\[([^\]]+)\]/g, (_, rest, one) => {
    const value = params[rest ?? one];
    return Array.isArray(value) ? value.join("/") : String(value);
  });
}

/**
 * Une route statique absente du sitemap n'est fautive que si elle est
 * indexable et se déclare canonique d'elle-même. Le reste est délibéré : les
 * pages de compte sont `noindex`, et un alias (FR `/quiz`, canonical
 * `/city-match`) n'a rien à faire dans un sitemap.
 */
function exemptFromSitemap(absPath, route) {
  const source = readFileSync(absPath, "utf8");
  if (/index:\s*false|noindex/.test(source)) return "noindex";
  const canonical = source.match(/canonical:\s*[`"']([^`"']*)[`"']/);
  if (canonical) {
    const declared = canonical[1].replace(/^\$\{[^}]*\}/, "").replace(/\/$/, "") || "/";
    if (declared.startsWith("/") && declared !== route) return `canonical vers ${declared}`;
  }
  return null;
}

// --- Contrôle d'une locale --------------------------------------------------

async function checkLocale(locale) {
  const problems = [];
  const note = (line) => problems.push(line);

  const { ORIGIN_BY_LOCALE } = load("lib/i18n.ts");
  const expectedOrigin = ORIGIN_BY_LOCALE[locale];

  const sitemap = load("app/sitemap.ts");
  const chunks = await sitemap.generateSitemaps();

  const declared = new Set();
  const seen = new Map();
  let rows = 0;
  for (const { id } of chunks) {
    const entries = await sitemap.default({ id: Promise.resolve(String(id)) });
    if (entries.length > MAX_URLS_PER_CHUNK) {
      note(`chunk ${id} : ${entries.length} URL, au-dessus de la limite de ${MAX_URLS_PER_CHUNK}`);
    }
    for (const entry of entries) {
      rows += 1;
      seen.set(entry.url, (seen.get(entry.url) ?? 0) + 1);
      const url = new URL(entry.url);
      if (url.origin !== expectedOrigin) {
        note(`origine ${url.origin} dans le sitemap ${locale} (attendu ${expectedOrigin}) — ${entry.url}`);
      }
      if (entry.lastModified == null || isNaN(new Date(entry.lastModified).getTime())) {
        note(`lastModified absent ou invalide — ${entry.url}`);
      }
      // Le sitemap encode les URL (obligatoire) ; on compare des chemins
      // décodés, sinon un slug accentué ressort en faux positif.
      declared.add(decodeURIComponent(url.pathname).replace(/\/$/, "") || "/");
    }
  }
  for (const [url, n] of seen) if (n > 1) note(`URL déclarée ${n} fois — ${url}`);

  const pages = walkPages(path.join(ROOT, "app"))
    .map((absPath) => ({ absPath, ...routeOf(absPath) }))
    .filter((p) => p.locale === locale);

  const staticRoutes = new Set(pages.filter((p) => !isDynamic(p.route)).map((p) => p.route));

  // 1. Une URL déclarée sans route en face répond 404. C'est le défaut du
  //    2026-08-06, celui qui coûte le plus cher.
  const patterns = pages.map((p) => ({ ...p, re: routeRegExp(p.route) }));
  const orphans = [...declared].filter(
    (url) => !staticRoutes.has(url) && !patterns.some((p) => p.re.test(url))
  );
  for (const url of orphans) note(`URL déclarée sans route — ${url} répondrait 404`);

  // 2. Une route statique indexable et canonique d'elle-même doit être déclarée.
  for (const page of pages) {
    if (isDynamic(page.route) || declared.has(page.route)) continue;
    const reason = exemptFromSitemap(page.absPath, page.route);
    if (!reason) note(`route absente du sitemap — ${page.route}`);
  }

  // 3. Chaque famille dynamique, dans les deux sens.
  let families = 0;
  const unverified = [];
  for (const page of pages) {
    if (!isDynamic(page.route)) continue;
    let params;
    try {
      const mod = load(path.relative(ROOT, page.absPath));
      if (typeof mod.generateStaticParams !== "function") {
        unverified.push(`${page.route} — pas de generateStaticParams`);
        continue;
      }
      params = await mod.generateStaticParams();
    } catch (err) {
      unverified.push(`${page.route} — ${String(err.message ?? err).split("\n")[0].slice(0, 100)}`);
      continue;
    }
    families += 1;
    const generated = new Set(params.map((p) => fillRoute(page.route, p)));
    // Une URL qui correspond aussi à une route statique appartient à celle-ci :
    // `/red-flags/villes-hiver-rude` est une page à elle, pas un slug de ville.
    const owned = [...declared].filter((url) => page.re?.test(url) ?? routeRegExp(page.route).test(url));
    const declaredHere = new Set(owned.filter((url) => !staticRoutes.has(url)));

    const missing = [...generated].filter((url) => !declaredHere.has(url));
    const extra = [...declaredHere].filter((url) => !generated.has(url));
    if (missing.length) {
      note(`${page.route} — ${missing.length} page(s) générée(s) sans URL au sitemap : ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`);
    }
    if (extra.length) {
      note(`${page.route} — ${extra.length} URL déclarée(s) sans page générée : ${extra.slice(0, 3).join(", ")}${extra.length > 3 ? "…" : ""}`);
    }
  }

  console.log(
    `  ${locale}  ${String(rows).padStart(6)} URL · ${chunks.length} chunks · ${staticRoutes.size} routes statiques · ${families} familles dynamiques vérifiées`
  );
  for (const line of unverified) console.log(`      non vérifiée : ${line}`);
  for (const line of problems) console.log(`      ✗ ${line}`);
  return problems.length;
}

// --- Entrée -----------------------------------------------------------------

const arg = process.argv.find((a) => a.startsWith("--locale="));
if (arg) {
  const locale = arg.slice("--locale=".length);
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = locale;
  process.exit((await checkLocale(locale)) > 0 ? 1 : 0);
}

console.log("Sitemap ↔ routes");
let failed = false;
for (const locale of ["fr", "en"]) {
  const run = spawnSync(process.execPath, [fileURLToPath(import.meta.url), `--locale=${locale}`], {
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_DEFAULT_LOCALE: locale },
  });
  if (run.status !== 0) failed = true;
}
console.log(
  failed
    ? "\nSitemap : au moins une route et le sitemap ne disent pas la même chose."
    : "\nSitemap : chaque URL déclarée a une page, chaque page indexable a une URL."
);
process.exit(failed ? 1 : 0);
