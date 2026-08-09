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

if (failed) {
  console.error("Intégrité des données : au moins un contrôle a échoué.");
  console.error("Le build échouerait au même endroit.");
  process.exit(1);
}
console.log("\nIntégrité des données : tous les contrôles passent.");
