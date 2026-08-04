#!/usr/bin/env node
/**
 * Génère `data/search-index.json` — la projection maigre que la palette de
 * recherche (`components/SearchPalette.tsx`) consomme côté client.
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
 * Méthode
 * -------
 * Le script ne re-parse pas les guides à la main et ne réimplémente pas le
 * calcul des tags : il **transpile et évalue les modules réels**
 * (`data/guides.ts`, puis `lib/guide-tags.ts` avec les vrais `GUIDES` en
 * entrée). La sortie ne peut donc pas diverger de ce que le serveur affiche —
 * une réimplémentation, elle, aurait dérivé au premier changement de
 * `MIN_GUIDES_PER_TAG`.
 *
 * Usage
 * -----
 *   node scripts/build-search-index.mjs            # écrit le fichier
 *   node scripts/build-search-index.mjs --check    # échoue si le fichier commité est périmé
 *
 * `prebuild` l'exécute avant chaque `next build`, donc la production est
 * toujours à jour même si un agent ajoute un guide sans relancer le script.
 * Le fichier reste commité pour que `next dev` et `tsc` fonctionnent sans
 * étape préalable.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "search-index.json");

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

function build() {
  const guidesModule = loadGuides();

  const guides = guidesModule.GUIDES.map((g) => {
    if (!g.slug || !g.title) {
      throw new Error(`guide sans slug ou sans titre : ${JSON.stringify(g.slug ?? g.title)}`);
    }
    // `emoji` est optionnel dans les faits sur quelques entrées anciennes ;
    // la palette affiche une pastille vide plutôt qu'un caractère inventé.
    return { slug: g.slug, title: g.title, emoji: g.emoji ?? "" };
  });

  const tags = loadTags(guidesModule).map((t) => ({
    slug: t.slug,
    label: t.label,
    count: t.count,
  }));

  return {
    "//": "Généré par scripts/build-search-index.mjs — ne pas éditer à la main (npm run search-index).",
    guides,
    tags,
  };
}

function serialize(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

const check = process.argv.includes("--check");
const payload = serialize(build());

if (check) {
  let current = null;
  try {
    current = readFileSync(OUT, "utf8");
  } catch {
    /* fichier absent → périmé */
  }
  if (current !== payload) {
    console.error(
      "data/search-index.json est périmé — lancer `npm run search-index` et commiter le résultat."
    );
    process.exit(1);
  }
  console.log("data/search-index.json est à jour.");
} else {
  writeFileSync(OUT, payload);
  const parsed = JSON.parse(payload);
  console.log(
    `data/search-index.json écrit : ${parsed.guides.length} guides, ${parsed.tags.length} tags, ${(payload.length / 1024).toFixed(0)} Ko.`
  );
}
