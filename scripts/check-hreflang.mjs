#!/usr/bin/env node
// Vérifie que les hreflang des sous-pages ville pointent vers des routes qui
// existent réellement de l'autre côté.
//
// Pourquoi un script plutôt qu'un test de type : la table FR→EN de
// `lib/i18n.ts` est du texte, l'arbre de routes est du système de fichiers.
// TypeScript ne peut pas rapprocher les deux, et c'est précisément là que la
// faute est coûteuse — un hreflang qui pointe vers un 404 coûte plus cher que
// pas de hreflang du tout, et il le fait sur 540 pages d'un coup.
//
//   node scripts/check-hreflang.mjs
//
// Sort 1 si un couple est cassé. À relancer après toute création de sous-page
// ville (FR ou EN).

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FR_DIR = path.join(ROOT, "app/villes/[slug]");
const EN_DIR = path.join(ROOT, "app/[locale]/cities/[slug]");
const I18N = path.join(ROOT, "lib/i18n.ts");

// `overview` (EN) n'a pas de jumelle FR : sa contrepartie est la fiche ville
// elle-même, qui porte déjà sa propre paire hreflang.
const EN_ONLY = new Set(["overview"]);

/** Extrait le littéral FR_TO_EN_CITY_SUB de lib/i18n.ts sans compiler le module. */
function readTable() {
  const src = fs.readFileSync(I18N, "utf8");
  const m = src.match(/FR_TO_EN_CITY_SUB: Record<string, string> = (\{[^}]*\})/);
  if (!m) throw new Error("FR_TO_EN_CITY_SUB introuvable dans lib/i18n.ts");
  return new Function(`return ${m[1]}`)();
}

/** Sous-pages présentes sur le disque, avec leur état d'activation. */
function subPages(dir) {
  const out = new Map();
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const p = path.join(dir, d.name);
    if (fs.existsSync(path.join(p, "page.tsx"))) out.set(d.name, { state: "live", file: path.join(p, "page.tsx") });
    else if (fs.existsSync(path.join(p, "page.pending.tsx")))
      out.set(d.name, { state: "pending", file: path.join(p, "page.pending.tsx") });
  }
  return out;
}

const table = readTable();
const reverse = Object.fromEntries(Object.entries(table).map(([fr, en]) => [en, fr]));
const fr = subPages(FR_DIR);
const en = subPages(EN_DIR);
const errors = [];

for (const [sub, { state, file }] of fr) {
  const target = table[sub];
  if (!target) {
    errors.push(`FR /${sub} : absente de FR_TO_EN_CITY_SUB (elle n'émettra aucun hreflang)`);
  } else if (!en.has(target)) {
    errors.push(`FR /${sub} → EN /${target} : la route EN n'existe pas`);
  } else if (en.get(target).state !== state) {
    errors.push(`FR /${sub} est ${state} mais EN /${target} est ${en.get(target).state}`);
  }
  if (!fs.readFileSync(file, "utf8").includes(`cityAlternates("${sub}", slug)`))
    errors.push(`FR /${sub} : n'utilise pas cityAlternates("${sub}", slug) — canonical sans hreflang`);
}

for (const [sub, { state, file }] of en) {
  if (EN_ONLY.has(sub)) continue;
  const back = reverse[sub];
  if (!back) {
    errors.push(`EN /${sub} : aucune correspondance FR (ni dans la table, ni dans EN_ONLY)`);
  } else if (!fr.has(back)) {
    errors.push(`EN /${sub} → FR /${back} : la route FR n'existe pas`);
  } else if (fr.get(back).state !== state) {
    errors.push(`EN /${sub} est ${state} mais FR /${back} est ${fr.get(back).state}`);
  }
  if (!fs.readFileSync(file, "utf8").includes(`cityAlternatesEn("${sub}", slug)`))
    errors.push(`EN /${sub} : n'utilise pas cityAlternatesEn("${sub}", slug) — canonical sans hreflang`);
}

console.log(
  `sous-pages ville — FR ${fr.size} · EN ${en.size} (dont ${EN_ONLY.size} sans jumelle FR) · ${Object.keys(table).length} paires déclarées`,
);

// ---------------------------------------------------------------------------
// Familles hors sous-pages ville : les appels à pathAlternates / pathAlternatesEn
// ---------------------------------------------------------------------------
// Les sous-pages ville passent par `cityAlternates*`, qui dérive la jumelle
// d'une table vérifiée ci-dessus. Partout ailleurs, les deux chemins sont
// **écrits à la main** dans la page (c'est la seule façon de déclarer une paire
// dont la queue est traduite : `/vacances/mois/février` ↔ `/vacations/month/february`).
// Écrits à la main veut dire qu'aucun type ne les relit : une faute de frappe,
// un slug traduit qui n'existe pas de l'autre côté, un copier-coller qui laisse
// le chemin de la page voisine — tout ça compile et s'imprime dans le <head>.
// On rapproche donc chaque appel de l'arbre de routes réel.

const APP = path.join(ROOT, "app");

/** Motifs de routes du disque, `[param]` conservé. */
function routePatterns(dir, prefix = "") {
  const out = new Set();
  const walk = (d, route) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        // Les groupes `(marketing)` n'apparaissent pas dans l'URL.
        const seg = e.name.startsWith("(") && e.name.endsWith(")") ? "" : `/${e.name}`;
        walk(p, route + seg);
      } else if (e.name === "page.tsx") {
        out.add(route === "" ? "/" : route);
      }
    }
  };
  walk(dir, prefix);
  return out;
}

const FR_ROUTES = new Set(
  [...routePatterns(APP)].filter((r) => !r.startsWith("/[locale]")),
);
const EN_ROUTES = new Set(routePatterns(path.join(APP, "[locale]")));

/** `/vacances/mois/${mois}` → `/vacances/mois/[dyn]`, pour comparer à un motif. */
function toPattern(literal) {
  return literal.replace(/\$\{[^}]*\}/g, "[dyn]");
}

const isDyn = (s) => s.startsWith("[") && s.endsWith("]");

/**
 * Un motif est servi si une route de même profondeur lui correspond **segment
 * pour segment, même nature** : littéral face à littéral, dynamique face à
 * dynamique.
 *
 * ⚠️ **Ne pas assouplir en laissant un segment dynamique de la route absorber
 * un segment littéral demandé.** C'est la règle qu'utilise `coveredByDynamic`
 * dans `check-parity.mjs`, où elle est justifiée (on y cherche l'existence
 * d'une famille, pas d'une URL), et elle rend ce contrôle-ci aveugle au seul
 * défaut qu'il existe pour attraper : `/vacations/quiz` passerait pour servi
 * par `/vacations/[city]`, alors que cette route ne génère que les 540 slugs de
 * ville et porte `dynamicParams = false` — l'URL est un 404. Testé : la règle
 * lâche laissait passer exactement ce cas.
 *
 * Le prix de la règle stricte est une page **statique** dont la jumelle est
 * servie par une route dynamique (`/red-flags/villes-hiver-rude` face à
 * `/red-flags/[slug]`) : elle sera signalée. C'est voulu — seul l'auteur peut
 * savoir si le slug est bien dans le `generateStaticParams` d'en face, et un
 * hreflang qui pointe vers un 404 coûte plus cher que pas de hreflang du tout.
 * Mesuré au 2026-09-02 : les 390 chemins des 195 paires déclarées tombent tous
 * sur une correspondance exacte, aucun ne dépendait de la règle lâche.
 */
function served(pattern, routes) {
  const want = pattern.split("/").filter(Boolean);
  for (const r of routes) {
    const got = r.split("/").filter(Boolean);
    if (got.length !== want.length) continue;
    if (got.every((seg, i) => seg === want[i] || (isDyn(seg) && isDyn(want[i])))) return true;
  }
  return false;
}

/** Route d'un fichier page.tsx, côté FR ou EN. */
function routeOf(file) {
  const rel = path.relative(APP, path.dirname(file)).split(path.sep);
  const segs = rel.filter((s) => s && !(s.startsWith("(") && s.endsWith(")")));
  const locale = segs[0] === "[locale]";
  return { locale: locale ? "en" : "fr", route: "/" + (locale ? segs.slice(1) : segs).join("/") };
}

function allPages(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === "page.tsx") out.push(p);
    }
  };
  walk(dir);
  return out;
}

// `pathAlternates(fr, en)` / `pathAlternatesEn(fr, en)` — l'ordre des arguments
// est le même dans les deux, seul le canonical produit change.
const CALL =
  /pathAlternates(En)?\(\s*(["'`])([^"'`]*)\2\s*,\s*(["'`])([^"'`]*)\4\s*,?\s*\)/gs;

let pairs = 0;
for (const file of allPages(APP)) {
  const src = fs.readFileSync(file, "utf8");
  const here = routeOf(file);
  for (const m of src.matchAll(CALL)) {
    pairs++;
    const variant = m[1] ? "pathAlternatesEn" : "pathAlternates";
    const frPattern = toPattern(m[3]);
    const enPattern = toPattern(m[5]);
    const where = `${path.relative(ROOT, file)} — ${variant}`;
    if (!served(frPattern, FR_ROUTES)) errors.push(`${where} : le chemin FR ${frPattern} n'est servi par aucune route`);
    if (!served(enPattern, EN_ROUTES)) errors.push(`${where} : le chemin EN ${enPattern} n'est servi par aucune route`);
    // Le canonical d'une page est le sien : `pathAlternates` l'émet depuis son
    // 1er argument, `pathAlternatesEn` depuis le 2nd. Un copier-coller qui
    // laisse le chemin de la page voisine ferait donc pointer le canonical
    // ailleurs — bien plus grave qu'un hreflang manquant.
    const own = variant === "pathAlternatesEn" ? enPattern : frPattern;
    const side = variant === "pathAlternatesEn" ? "en" : "fr";
    if (here.locale !== side)
      errors.push(`${where} : appelé depuis une page ${here.locale}, ce qui émettrait le canonical de l'autre locale`);
    else if (!served(own, side === "en" ? EN_ROUTES : FR_ROUTES) || !sameRoute(own, here.route))
      errors.push(`${where} : canonical ${own} alors que la page est servie sur ${here.route}`);
  }
}

/** Deux motifs décrivent la même route (les noms de paramètre peuvent différer). */
function sameRoute(a, b) {
  const x = a.split("/").filter(Boolean), y = b.split("/").filter(Boolean);
  return x.length === y.length && x.every((s, i) => s === y[i] || (isDyn(s) && isDyn(y[i])));
}

console.log(`autres familles   — ${pairs} paires déclarées à la main, chemins rapprochés des deux arbres de routes`);

if (errors.length) {
  console.error(`\n${errors.length} problème(s) :\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("OK — chaque hreflang annoncé a une route en face, dans le même état d'activation");
