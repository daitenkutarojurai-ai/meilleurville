#!/usr/bin/env node
/**
 * Génère `data/search-index.json` (FR) et `data/search-index.en.json` (EN) —
 * les projections maigres que la palette de recherche
 * (`components/SearchPalette.tsx`) consomme côté client.
 *
 * Pourquoi ce script existe
 * -------------------------
 * `components/SearchPalette.tsx` est un composant client. Il importait
 * `GUIDES` depuis `@/data/guides` pour n'en lire que `slug` / `title` /
 * `emoji`, et `getAllTagsWithCounts()` depuis `@/lib/guide-tags`, qui lit le
 * même module. Un tableau de littéraux n'est pas tree-shakable : le corpus
 * éditorial entier (≈ 6 Mo de source, le corps de chaque section de chaque
 * guide) partait donc dans le bundle — plus `CITIES_SEED`, que
 * `data/guides.ts` importe pour ses contrôles d'intégrité. C'est le principe
 * « Projections, not entities » de CLAUDE.md, appliqué partout ailleurs et
 * manqué ici (ultra-audit 2026-08-02 §2.2).
 *
 * Pourquoi deux fichiers
 * ----------------------
 * La palette n'avait aucune notion de locale : sur bestcitiesinfrance.com elle
 * servait les 900+ titres **français** et des raccourcis vers `/glossaire`,
 * route qui n'existe pas côté EN (relevé du 2026-08-05). Le corpus anglais est
 * `data/guides-en.ts`, ses tags `lib/guide-tags-en.ts` : deux corpus, donc deux
 * projections. `lib/search-index.ts` choisit la bonne d'après
 * `NEXT_PUBLIC_DEFAULT_LOCALE`, qui est figé au build (un domaine = un build).
 *
 * Méthode
 * -------
 * Le script ne re-parse pas les guides à la main et ne réimplémente pas le
 * calcul des tags : il **transpile et évalue les modules réels**
 * (`data/guides.ts` puis `lib/guide-tags.ts` côté FR, `data/guides-en.ts` puis
 * `lib/guide-tags-en.ts` côté EN, avec les vrais guides en entrée). La sortie
 * ne peut donc pas diverger de ce que le serveur affiche — une
 * réimplémentation, elle, aurait dérivé au premier changement de
 * `MIN_GUIDES_PER_TAG`.
 *
 * Usage
 * -----
 *   node scripts/build-search-index.mjs            # écrit les deux fichiers
 *   node scripts/build-search-index.mjs --check    # échoue si un fichier commité est périmé
 *
 * `prebuild` l'exécute avant chaque `next build`, donc la production est
 * toujours à jour même si un agent ajoute un guide sans relancer le script.
 * Les fichiers restent commités pour que `next dev` et `tsc` fonctionnent sans
 * étape préalable.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FR = path.join(ROOT, "data", "search-index.json");
const OUT_EN = path.join(ROOT, "data", "search-index.en.json");

/**
 * Transpile un module TypeScript du dépôt et l'exécute avec un `require`
 * fourni par l'appelant. Aucun accès disque au-delà du fichier demandé : les
 * dépendances sont résolues par `resolve`, ce qui laisse le contrôle sur ce
 * qui est réellement chargé (on ne veut ni `CITIES_SEED`, ni les assertions
 * d'intégrité, qui n'ont rien à faire ici).
 */
function loadModule(relPath, resolve) {
  const source = readFileSync(path.join(ROOT, relPath), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: relPath,
  });
  const module = { exports: {} };
  const require = (id) => {
    const stub = resolve(id);
    if (!stub) throw new Error(`${relPath} : import non prévu « ${id} »`);
    return stub;
  };
  // eslint-disable-next-line no-new-func
  new Function("exports", "require", "module", outputText)(
    module.exports,
    require,
    module
  );
  return module.exports;
}

const NOOP = () => {};

function loadGuides() {
  const mod = loadModule("data/guides.ts", (id) => {
    // `data/guides.ts` importe CITIES_SEED et les asserts uniquement pour ses
    // contrôles de build. Ils tournent déjà au vrai build ; les rejouer ici
    // ne validerait rien de plus et tirerait 600 Ko de seed pour rien.
    if (id === "@/data/cities-seed") return { CITIES_SEED: [] };
    if (id === "@/lib/data-integrity") {
      return { assertKnownSlugs: NOOP, assertUniqueSlugs: NOOP };
    }
    if (id === "@/lib/guide-categories") return { GUIDE_CATEGORIES: [] };
    return null;
  });
  if (!Array.isArray(mod.GUIDES) || mod.GUIDES.length === 0) {
    throw new Error("data/guides.ts n'a pas exporté de GUIDES exploitable");
  }
  return mod;
}

function loadTags(guidesModule) {
  const mod = loadModule("lib/guide-tags.ts", (id) =>
    id === "@/data/guides" ? guidesModule : null
  );
  if (typeof mod.getAllTagsWithCounts !== "function") {
    throw new Error("lib/guide-tags.ts n'a pas exporté getAllTagsWithCounts");
  }
  return mod.getAllTagsWithCounts();
}

function loadEnGuides() {
  const mod = loadModule("data/guides-en.ts", (id) => {
    // Même raison que `loadGuides` : le seed et les asserts n'existent dans ce
    // module que pour les contrôles de build, qui tournent au vrai build.
    if (id === "@/data/cities-seed") return { CITIES_SEED: [] };
    if (id === "@/lib/data-integrity") {
      return { assertKnownSlugs: NOOP, assertUniqueSlugs: NOOP };
    }
    return null;
  });
  if (!Array.isArray(mod.EN_GUIDES) || mod.EN_GUIDES.length === 0) {
    throw new Error("data/guides-en.ts n'a pas exporté de EN_GUIDES exploitable");
  }
  return mod;
}

function loadEnTags(enGuidesModule) {
  const mod = loadModule("lib/guide-tags-en.ts", (id) =>
    id === "@/data/guides-en" ? enGuidesModule : null
  );
  if (typeof mod.getAllTagsWithCountsEn !== "function") {
    throw new Error("lib/guide-tags-en.ts n'a pas exporté getAllTagsWithCountsEn");
  }
  return mod.getAllTagsWithCountsEn();
}

function projectGuides(list) {
  return list.map((g) => {
    if (!g.slug || !g.title) {
      throw new Error(`guide sans slug ou sans titre : ${JSON.stringify(g.slug ?? g.title)}`);
    }
    // `emoji` est optionnel dans les faits sur quelques entrées anciennes ;
    // la palette affiche une pastille vide plutôt qu'un caractère inventé.
    return { slug: g.slug, title: g.title, emoji: g.emoji ?? "" };
  });
}

function projectTags(list) {
  return list.map((t) => ({ slug: t.slug, label: t.label, count: t.count }));
}

/**
 * Villes. Même piège que les guides, dans une autre forme : la palette lisait
 * `CITIES_SEED` pour quatre champs (slug, nom, région, score global) et
 * embarquait les 588 Ko du seed — descriptions FR **et** EN, tags de caractère,
 * codes Insee, normales climatiques — dans le bundle de toutes les pages, la
 * Navbar montant la palette partout.
 *
 * Le module réel est évalué, jamais lu au grep : `CITIES_SEED` est le seed
 * calibré **puis** normalisé (`normalizeDistribution(RAW.map(calibrateScores))`),
 * et c'est cette valeur-là que les pages affichent. Projeter le littéral brut
 * republierait les chiffres que CLAUDE.md interdit de citer.
 *
 * La liste est identique dans les deux locales — les noms de communes et de
 * régions ne se traduisent pas — mais elle est écrite dans les deux fichiers
 * pour qu'un seul JSON par build suffise à la palette.
 */
function loadCities() {
  const mod = loadModule("data/cities-seed.ts", (id) => {
    if (id === "@/lib/score-calibration") {
      return loadModule("lib/score-calibration.ts", () => null);
    }
    if (id === "@/lib/score-distribution") {
      return loadModule("lib/score-distribution.ts", () => null);
    }
    // Les gardes tournent au vrai build (et dans `npm run integrity`) ; les
    // rejouer ici ne validerait rien de plus.
    if (id === "@/lib/data-integrity") {
      return { assertUniqueInseeCodes: NOOP, assertUniqueSlugs: NOOP };
    }
    return null;
  });
  if (!Array.isArray(mod.CITIES_SEED) || mod.CITIES_SEED.length === 0) {
    throw new Error("data/cities-seed.ts n'a pas exporté de CITIES_SEED exploitable");
  }
  return mod.CITIES_SEED;
}

function projectCities(list) {
  return list.map((c) => {
    const score = c.scores?.global;
    if (!c.slug || !c.name || !c.region || typeof score !== "number") {
      throw new Error(`ville incomplète dans le seed : ${JSON.stringify(c.slug ?? c.name)}`);
    }
    return { slug: c.slug, name: c.name, region: c.region, score };
  });
}

const HEADER =
  "Généré par scripts/build-search-index.mjs — ne pas éditer à la main (npm run search-index).";

function buildFr(cities) {
  const guidesModule = loadGuides();
  return {
    "//": HEADER,
    cities,
    guides: projectGuides(guidesModule.GUIDES),
    tags: projectTags(loadTags(guidesModule)),
  };
}

function buildEn(cities) {
  const enGuidesModule = loadEnGuides();
  return {
    "//": HEADER,
    cities,
    guides: projectGuides(enGuidesModule.EN_GUIDES),
    tags: projectTags(loadEnTags(enGuidesModule)),
  };
}

function serialize(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

const check = process.argv.includes("--check");

const CITIES = projectCities(loadCities());

const OUTPUTS = [
  { label: "data/search-index.json", file: OUT_FR, payload: serialize(buildFr(CITIES)) },
  { label: "data/search-index.en.json", file: OUT_EN, payload: serialize(buildEn(CITIES)) },
];

if (check) {
  let stale = false;
  for (const { label, file, payload } of OUTPUTS) {
    let current = null;
    try {
      current = readFileSync(file, "utf8");
    } catch {
      /* fichier absent → périmé */
    }
    if (current !== payload) {
      console.error(
        `${label} est périmé — lancer \`npm run search-index\` et commiter le résultat.`
      );
      stale = true;
    }
  }
  if (stale) process.exit(1);
  console.log("data/search-index.json et data/search-index.en.json sont à jour.");
} else {
  for (const { label, file, payload } of OUTPUTS) {
    writeFileSync(file, payload);
    const parsed = JSON.parse(payload);
    console.log(
      `${label} écrit : ${parsed.cities.length} villes, ${parsed.guides.length} guides, ${parsed.tags.length} tags, ${(payload.length / 1024).toFixed(0)} Ko.`
    );
  }
}
