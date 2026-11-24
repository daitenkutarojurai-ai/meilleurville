#!/usr/bin/env node
// Template similarity as in the 2026-11-04 audit (lib/fr-index-policy.ts): visible
// <main> text, numbers and city names masked, Jaccard over word 5-grams, two pairs.
// Usage : node scripts/template-similarity.mjs [origin] [sous-page]
//   node scripts/template-similarity.mjs https://mavilleideale.fr bruit
//   node scripts/template-similarity.mjs http://localhost:3311 presidentielle-2027   (next dev)
// Au-dessus de 0,75 en moyenne, la famille reste dans FR_NOINDEX_CITY_SUBPAGES.
const [origin = "https://mavilleideale.fr", sub = "presidentielle-2027"] = process.argv.slice(2);
const PAIRS = [["bayonne", "montauban"], ["rennes", "dijon"]];
const NAMES = { bayonne: ["Bayonne"], montauban: ["Montauban"], rennes: ["Rennes"], dijon: ["Dijon"] };

async function mainText(slug) {
  const html = await (await fetch(`${origin}/villes/${slug}/${sub}`, { headers: { "user-agent": "Mozilla/5.0" } })).text();
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  let t = main
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
  for (const n of NAMES[slug]) t = t.replaceAll(n, " VILLE ");
  return t.replace(/\d+([.,]\d+)?/g, " N ").toLowerCase().split(/[^\p{L}N]+/u).filter(Boolean);
}
const grams = (w) => new Set(w.slice(0, -4).map((_, i) => w.slice(i, i + 5).join(" ")));
for (const [a, b] of PAIRS) {
  const [wa, wb] = await Promise.all([mainText(a), mainText(b)]);
  const ga = grams(wa), gb = grams(wb);
  const inter = [...ga].filter((g) => gb.has(g)).length;
  console.log(`${a}/${b}: words ${wa.length}/${wb.length}  jaccard=${(inter / (ga.size + gb.size - inter)).toFixed(2)}`);
}
