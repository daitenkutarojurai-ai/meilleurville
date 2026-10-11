#!/usr/bin/env node
/**
 * Remplace, dans le texte des guides, les chemins de fichiers internes cités
 * comme source (« (source : data/housing.ts) », « per data/cities-seed.ts »)
 * par ce qu'un lecteur peut comprendre : la page du site ou l'organisme qui
 * porte le chiffre.
 *
 * Pourquoi (2026-10-11) : 2 389 chemins `data/…` et `lib/…` s'affichaient tels
 * quels dans les guides FR et EN, au milieu du texte, sur mobile comme ailleurs.
 * La traçabilité vers le code reste dans le dépôt ; le lecteur, lui, lisait
 * « source : data/cities-seed.ts ». `npm run integrity` refuse désormais tout
 * nouveau chemin dans le texte d'un guide.
 *
 *   node scripts/humanize-guide-sources.mjs           # réécrit data/guides*.ts
 *   node scripts/humanize-guide-sources.mjs --dry     # compte sans écrire
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");

export const SOURCE_LABELS = {
  "data/cities-seed.ts": ["notre fiche ville", "our city profile"],
  "data/housing.ts": ["notre estimation des loyers", "our rent estimate"],
  "data/city-population.json": ["Insee, recensements", "INSEE census"],
  "data/neighborhoods.ts": ["notre fiche quartiers", "our district data"],
  "data/city-parks.json": ["OpenStreetMap", "OpenStreetMap"],
  "lib/climate-normals.ts": ["normales Météo-France 1991-2020", "Météo-France 1991-2020 normals"],
  "lib/vacation-seasons.ts": ["notre calendrier des saisons", "our seasons calendar"],
  "lib/transit.ts": ["notre relevé des transports", "our transit data"],
  "lib/parent-solo.ts": ["notre calculateur parent solo", "our single-parent calculator"],
  "lib/score-distribution.ts": ["notre méthode de notation", "our scoring method"],
  "lib/vacation-fit.ts": ["notre indice de séjour", "our trip-fit index"],
  "lib/city-income.ts": ["Insee, Filosofi 2021", "INSEE Filosofi 2021"],
};

const PATH_RE = /`?\b((?:data|lib)\/[a-z0-9-]+\.(?:ts|json))\b`?/g;

function humanizeLine(line, lang) {
  const i = lang === "fr" ? 0 : 1;
  return line
    // « (source : Insee, Filosofi 2021, via lib/city-income.ts) » : le « via » n'apprend rien au lecteur
    .replace(/,? via `?(?:data|lib)\/[a-z0-9-]+\.(?:ts|json)`?/g, "")
    .replace(PATH_RE, (m, p, offset, whole) => {
      const label = SOURCE_LABELS[p]?.[i];
      if (!label) return m;
      // début de phrase ou de chaîne : majuscule
      const startsSentence = /(^\s*|[.!?]\s+|")$/.test(whole.slice(0, offset));
      return startsSentence ? label[0].toUpperCase() + label.slice(1) : label;
    });
}

export function humanizeSource(src, lang) {
  let count = 0;
  const lines = src.split("\n").map((line) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return line;
    const next = humanizeLine(line, lang);
    if (next !== line) count += (line.match(PATH_RE) || []).length;
    return next;
  });
  return { text: lines.join("\n"), count };
}

for (const [file, lang] of [["data/guides.ts", "fr"], ["data/guides-en.ts", "en"]]) {
  const abs = path.join(ROOT, file);
  const { text, count } = humanizeSource(readFileSync(abs, "utf8"), lang);
  const left = text.split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n").match(PATH_RE) || [];
  console.log(`${file}: ${count} chemin(s) remplacé(s), ${left.length} restant(s)${left.length ? " : " + [...new Set(left)].join(", ") : ""}`);
  if (!DRY) writeFileSync(abs, text);
}
