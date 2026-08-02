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
if (errors.length) {
  console.error(`\n${errors.length} problème(s) :\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("OK — chaque hreflang annoncé a une route en face, dans le même état d'activation");
