#!/usr/bin/env node
// Template similarity as in the 2026-11-04 audit (lib/fr-index-policy.ts): visible
// <main> text, numbers and city names masked, Jaccard over word 5-grams, two pairs.
// Usage : node scripts/template-similarity.mjs [origin] [sous-page]
//   node scripts/template-similarity.mjs https://mavilleideale.fr bruit
//   node scripts/template-similarity.mjs http://localhost:3311 presidentielle-2027   (next dev)
// Au-dessus de 0,75 en moyenne, la famille reste dans FR_NOINDEX_CITY_SUBPAGES.
//
// Mode paires d'URL, pour les familles qui ne sont pas une sous-page ville (paires
// /compare, pages /leaving/<ville>… — passe EN du 2026-11-25, lib/en-index-policy.ts) :
//   node scripts/template-similarity.mjs --urls <A1> <B1> [<A2> <B2> …]
// Tous les noms de ville et de région du seed sont masqués, pas seulement ceux de la paire.
import fs from "node:fs";

const args = process.argv.slice(2);
const urlMode = args[0] === "--urls";
const [origin = "https://mavilleideale.fr", sub = "presidentielle-2027"] = urlMode ? [] : args;
const PAIRS = urlMode
  ? args.slice(1).reduce((acc, u, i, all) => (i % 2 ? acc : [...acc, [u, all[i + 1]]]), [])
  : [["bayonne", "montauban"], ["rennes", "dijon"]];
const NAMES = { bayonne: ["Bayonne"], montauban: ["Montauban"], rennes: ["Rennes"], dijon: ["Dijon"] };
const ALL_NAMES = urlMode
  ? [...new Set(JSON.parse(fs.readFileSync(new URL("../data/search-index.json", import.meta.url), "utf8")).cities
      .flatMap((c) => [c.name, c.region]))].sort((a, b) => b.length - a.length)
  : [];

async function mainText(slug) {
  const target = urlMode ? slug : `${origin}/villes/${slug}/${sub}`;
  const html = await (await fetch(target, { headers: { "user-agent": "Mozilla/5.0" } })).text();
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  let t = main
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
  for (const n of urlMode ? ALL_NAMES : NAMES[slug]) t = t.replaceAll(n, " VILLE ");
  return t.replace(/\d+([.,]\d+)?/g, " N ").toLowerCase().split(/[^\p{L}N]+/u).filter(Boolean);
}
const grams = (w) => new Set(w.slice(0, -4).map((_, i) => w.slice(i, i + 5).join(" ")));
for (const [a, b] of PAIRS) {
  const [wa, wb] = await Promise.all([mainText(a), mainText(b)]);
  const ga = grams(wa), gb = grams(wb);
  const inter = [...ga].filter((g) => gb.has(g)).length;
  const label = (u) => u.replace(/^https?:\/\/[^/]+/, "");
  console.log(`${label(a)} | ${label(b)}: words ${wa.length}/${wb.length}  jaccard=${(inter / (ga.size + gb.size - inter)).toFixed(2)}`);
}
