#!/usr/bin/env node
/**
 * Rejoue les gardes d'intégrité de `lib/data-integrity.ts` hors build.
 *
 * Pourquoi ce script existe (2026-08-09). Ces gardes tournent au chargement des
 * modules de données, donc au `next build` et au `next dev` — nulle part
 * ailleurs. Or `npx tsc --noEmit` ne les voit pas (un tableau de chaînes est
 * bien typé, qu'il pointe vers un guide existant ou non) et, depuis une session
 * cloud, `npm run build` ne va plus au bout : il tourne plus de 4 h 30 puis meurt
 * en ENOSPC (cf. CLAUDE.md § Commands). Il n'y avait donc plus aucun contrôle
 * entre le commit d'un batch de contenu et le déploiement.
 *
 * Ça s'est produit : le batch `vacances-celibataire` du 2026-08-08 a référencé
 * deux guides inexistants dans ses `relatedGuides`, et `main` est resté
 * non-buildable jusqu'à l'audit du lendemain. Ce script aurait rendu la main en
 * deux secondes.
 *
 * Il ne réimplémente rien : il transpile et exécute les vrais modules, donc les
 * vrais `assertUniqueSlugs` / `assertKnownSlugs` / `assertUniqueInseeCodes`.
 * Ajouter une garde dans `data/*.ts` la fait couvrir ici sans rien changer.
 *
 *   npm run integrity
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Les gardes se taisent en production hors build : on se place explicitement
// dans le cas où elles parlent.
process.env.NODE_ENV = "development";

const cache = new Map();

/** Charge un module TypeScript du dépôt en résolvant récursivement les `@/`. */
function load(relPath) {
  const abs = path.join(ROOT, relPath);
  if (cache.has(abs)) return cache.get(abs);

  const source = readFileSync(abs, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: relPath,
  });

  const module = { exports: {} };
  // Posé avant l'exécution : un cycle d'imports voit un objet partiel plutôt
  // que de repartir en boucle.
  cache.set(abs, module.exports);

  const require = (id) => {
    if (!id.startsWith("@/")) {
      throw new Error(`${relPath} : import externe inattendu « ${id} »`);
    }
    const base = id.slice(2);
    for (const ext of [".ts", ".tsx", ".json", "/index.ts"]) {
      const candidate = base + ext;
      if (!existsSync(path.join(ROOT, candidate))) continue;
      if (candidate.endsWith(".json")) {
        return JSON.parse(readFileSync(path.join(ROOT, candidate), "utf8"));
      }
      return load(candidate);
    }
    throw new Error(`${relPath} : « ${id} » introuvable`);
  };

  // eslint-disable-next-line no-new-func
  new Function("exports", "require", "module", outputText)(
    module.exports,
    require,
    module
  );
  cache.set(abs, module.exports);
  return module.exports;
}

const MODULES = [
  ["data/cities-seed.ts", "CITIES_SEED", "villes"],
  ["data/guides.ts", "GUIDES", "guides FR"],
  ["data/guides-en.ts", "EN_GUIDES", "guides EN"],
];

let failed = false;
for (const [relPath, exportName, label] of MODULES) {
  try {
    const mod = load(relPath);
    const rows = mod[exportName];
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error(`${relPath} n'a pas exporté de ${exportName} exploitable`);
    }
    console.log(`  ok  ${label.padEnd(10)} ${rows.length}`);
  } catch (err) {
    failed = true;
    console.error(`\n  ÉCHEC  ${relPath}\n`);
    console.error(String(err.message ?? err).replace(/^/gm, "    "));
    console.error("");
  }
}

// --- Citations de score dans les guides ------------------------------------
//
// `data/cities-seed.ts` contient des littéraux BRUTS ; ce que les pages
// affichent est `CITIES_SEED`, c'est-à-dire
// `normalizeDistribution(RAW_CITIES_SEED.map(calibrateScores))`. Un rédacteur
// qui ouvre le seed et recopie « safety: 7.8 » écrit donc un chiffre que la
// fiche ville contredit — elle affiche 5,9. C'est arrivé sur 520 citations
// avant d'être corrigé le 2026-08-10 (écarts jusqu'à 2,3 points, cf. ROADMAP
// § Shipped 2026-08-10).
//
// Le contrôle est volontairement étroit : il ne s'alarme que si un chiffre
// collé à un nom d'axe vaut EXACTEMENT le littéral brut d'une ville plausible
// et diffère de la valeur rendue. Cette signature-là ne se produit pas par
// hasard, donc pas de faux positif ; en échange, il ne prétend pas voir les
// chiffres inventés (ce n'est pas son travail — c'est celui de la relecture).
const AXES = {
  fr: [
    ["sécurité", ["safety"]], ["coût de la vie", ["cost"]], ["coût", ["cost"]],
    ["transports", ["transport"]], ["transport", ["transport"]], ["nature", ["nature"]],
    ["culture", ["culture"]], ["télétravail", ["remoteWork"]], ["écoles", ["schools"]],
    ["qualité de vie", ["life", "global"]], ["score global", ["global"]], ["global", ["global"]],
    ["score mavilleidéale", ["global"]], ["mavilleidéale", ["global"]],
  ],
  en: [
    ["safety", ["safety"]], ["cost of living", ["cost"]], ["cost", ["cost"]],
    ["transport", ["transport"]], ["nature", ["nature"]], ["culture", ["culture"]],
    ["remote work", ["remoteWork"]], ["schools", ["schools"]], ["school", ["schools"]],
    ["quality of life", ["life", "global"]], ["overall", ["global"]], ["global score", ["global"]],
  ],
};

function rawLiterals(seedSource, slugs) {
  const raw = {};
  for (const slug of slugs) {
    const i = seedSource.indexOf(`slug: "${slug}"`);
    if (i < 0) continue;
    const j = seedSource.indexOf("scores: {", i);
    if (j < 0) continue;
    const block = seedSource.slice(j, j + 300);
    const scores = {};
    for (const m of block.matchAll(/(\w+): ([0-9.]+),/g)) scores[m[1]] = Number(m[2]);
    raw[slug] = scores;
  }
  return raw;
}

function scoreCitationOffenders({ source, lang, cities, raw }) {
  const axes = AXES[lang];
  const dec = lang === "fr" ? "," : ".";
  const numRe = lang === "fr" ? /(\d+),(\d+)(\/10)?/g : /(\d+)\.(\d+)(\/10)?/g;
  const byLongestName = [...cities].sort((a, b) => b.name.length - a.name.length);
  const marks = [];
  for (const m of source.matchAll(/^    slug: "([^"]+)",$/gm)) marks.push({ at: m.index, slug: m[1] });
  const guideAt = (off) => {
    let lo = 0, hi = marks.length - 1, res = "";
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (marks[mid].at <= off) { res = marks[mid].slug; lo = mid + 1; } else hi = mid - 1;
    }
    return res;
  };
  const targetOf = (guideSlug) => {
    let best = null;
    for (const c of cities) if (guideSlug.includes(c.slug) && (!best || c.slug.length > best.length)) best = c.slug;
    return best;
  };

  const offenders = [];
  let m;
  while ((m = numRe.exec(source))) {
    const cited = `${m[1]}.${m[2]}`;
    const norm = (t) => t.toLowerCase().replace(/-/g, " ");
    const before = norm(source.slice(Math.max(0, m.index - 60), m.index));
    const after = norm(source.slice(m.index + m[0].length, m.index + m[0].length + 30));
    const tail = before.replace(/[\s:()«»"'’,–—-]*$/u, "");
    const conn = lang === "fr"
      ? /(?:\s+(?:de|à|a|est|sont|:|marque|affiche|note|atteint|reste|vaut)\s*)+$/u
      : /(?:\s+(?:of|at|is|are|:|scores?|sits?|stands?)\s*)+$/u;
    let axisCands = null;
    for (const [word, ax] of axes) {
      if (tail.endsWith(word) || tail.replace(conn, "").endsWith(word)) { axisCands = ax; break; }
    }
    if (!axisCands) {
      const fwd = lang === "fr"
        ? after.match(/^\s*(?:en|de|sur|pour|côté)\s+(?:la |le |l'|les )?([a-zà-ÿ' ]+)/u)
        : after.match(/^\s*(?:on|for|in)\s+(?:the )?([a-z' ]+)/u);
      if (fwd) for (const [word, ax] of axes) if (fwd[1].startsWith(word)) { axisCands = ax; break; }
    }
    if (!axisCands) continue;

    const guide = guideAt(m.index);
    const win = source.slice(Math.max(0, m.index - 90), m.index);
    let nearest = null, nearestAt = -1;
    for (const c of byLongestName) {
      const at = win.lastIndexOf(c.name);
      if (at > nearestAt) { nearestAt = at; nearest = c.slug; }
    }
    const candidates = [...new Set([nearest, targetOf(guide)].filter(Boolean))];

    // Si le chiffre EST la valeur rendue d'une des villes plausibles, on se
    // tait : c'est le cas d'une comparaison où la ville citée n'est pas celle
    // du guide (« La Rochelle … score nature 7,2 » dans un guide sur Nantes),
    // et le littéral brut d'une autre candidate peut coïncider par hasard.
    const citesAShownValue = candidates.some((slug) => {
      const city = cities.find((c) => c.slug === slug);
      return axisCands.some((axis) => city?.scores?.[axis]?.toFixed(1) === cited);
    });
    if (citesAShownValue) continue;

    for (const slug of candidates) {
      const city = cities.find((c) => c.slug === slug);
      for (const axis of axisCands) {
        const rawValue = raw[slug]?.[axis];
        const shown = city?.scores?.[axis];
        if (rawValue === undefined || shown === undefined) continue;
        if (rawValue.toFixed(1) !== cited || shown.toFixed(1) === cited) continue;
        offenders.push({
          guide,
          axis,
          slug,
          cited: cited.replace(".", dec),
          shown: shown.toFixed(1).replace(".", dec),
          ctx: source.slice(Math.max(0, m.index - 55), m.index + m[0].length + 20).replace(/\s+/g, " "),
        });
      }
    }
  }
  return offenders;
}

if (!failed) {
  const cities = load("data/cities-seed.ts").CITIES_SEED;
  const seedSource = readFileSync(path.join(ROOT, "data/cities-seed.ts"), "utf8");
  const raw = rawLiterals(seedSource, cities.map((c) => c.slug));
  for (const [relPath, lang, label] of [
    ["data/guides.ts", "fr", "citations FR"],
    ["data/guides-en.ts", "en", "citations EN"],
  ]) {
    const source = readFileSync(path.join(ROOT, relPath), "utf8");
    const offenders = scoreCitationOffenders({ source, lang, cities, raw });
    if (offenders.length === 0) {
      console.log(`  ok  ${label.padEnd(10)} 0 score brut recopié`);
      continue;
    }
    failed = true;
    console.error(`\n  ÉCHEC  ${relPath} : ${offenders.length} citation(s) reprennent le littéral brut du seed`);
    console.error("         (la fiche ville affiche la valeur normalisée, pas celle-ci)\n");
    for (const o of offenders.slice(0, 20)) {
      console.error(`    ${o.guide} · ${o.slug}.${o.axis} : écrit ${o.cited}, affiché ${o.shown}`);
      console.error(`      … ${o.ctx}`);
    }
    if (offenders.length > 20) console.error(`    … et ${offenders.length - 20} autres`);
    console.error("");
  }
}

if (failed) {
  console.error("Intégrité des données : au moins un contrôle a échoué.");
  console.error("Le build échouerait au même endroit.");
  process.exit(1);
}
console.log("\nIntégrité des données : tous les contrôles passent.");
