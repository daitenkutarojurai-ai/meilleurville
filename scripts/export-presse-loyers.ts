// Tableau presse « loyers » : une ligne par ville (nos estimations T2/T1/T3 et prix au m²),
// triées par loyer T2 croissant, + synthèse par département (ville la moins chère).
//   npx tsx scripts/export-presse-loyers.ts
// Sort : public/presse/loyers-villes-mavilleideale-2026.csv et
//        public/presse/loyers-par-departement-mavilleideale-2026.csv
import { writeFileSync } from "node:fs";
import { CITIES_SEED } from "../data/cities-seed";
import { HOUSING } from "../data/housing";

const rows = CITIES_SEED.filter((c) => HOUSING[c.slug])
  .map((c) => ({ c, h: HOUSING[c.slug] }))
  .sort((a, b) => a.h.avgRentT2 - b.h.avgRentT2 || a.h.avgBuyPriceM2 - b.h.avgBuyPriceM2 || a.c.name.localeCompare(b.c.name, "fr"));

const head = "rang,ville,departement,region,loyer_t1_eur,loyer_t2_eur,loyer_t3_eur,prix_achat_m2_eur,score_global,fiche";
const lines = rows.map(({ c, h }, i) =>
  [i + 1, `"${c.name}"`, `"${c.department}"`, `"${c.region}"`, h.avgRentT1, h.avgRentT2, h.avgRentT3, h.avgBuyPriceM2,
   c.scores.global.toFixed(2), `"https://www.mavilleideale.fr/villes/${c.slug}"`].join(","));
writeFileSync("public/presse/loyers-villes-mavilleideale-2026.csv", "﻿" + head + "\n" + lines.join("\n") + "\n");

const byDep = new Map<string, typeof rows>();
for (const r of rows) byDep.set(r.c.department, [...(byDep.get(r.c.department) ?? []), r]);
const dHead = "departement,villes_suivies,ville_la_moins_chere,loyer_t2_eur,ville_la_plus_chere,loyer_t2_max_eur,loyer_t2_median_eur";
const dLines = [...byDep.entries()].sort((a, b) => a[0].localeCompare(b[0], "fr")).map(([d, rs]) => {
  const v = rs.map((r) => r.h.avgRentT2).sort((a, b) => a - b);
  const med = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
  const lo = rs[0], hi = rs[rs.length - 1];
  return [`"${d}"`, rs.length, `"${lo.c.name}"`, lo.h.avgRentT2, `"${hi.c.name}"`, hi.h.avgRentT2, med].join(",");
});
writeFileSync("public/presse/loyers-par-departement-mavilleideale-2026.csv", "﻿" + dHead + "\n" + dLines.join("\n") + "\n");

const t2 = rows.map((r) => r.h.avgRentT2).sort((a, b) => a - b);
console.log("villes", rows.length, "deps", byDep.size, "médiane T2", t2[Math.floor(t2.length / 2)]);
console.log("<=450:", t2.filter((x) => x <= 450).length, "<=500:", t2.filter((x) => x <= 500).length, ">=1000:", t2.filter((x) => x >= 1000).length);
console.log("moins chères:", rows.slice(0, 5).map((r) => `${r.c.name} ${r.h.avgRentT2}`).join(" | "));
console.log("plus chères:", rows.slice(-5).map((r) => `${r.c.name} ${r.h.avgRentT2}`).join(" | "));
const big = rows.filter((r) => (r.c.population ?? 0) >= 50000);
console.log("≥50k hab moins chères:", big.slice(0, 5).map((r) => `${r.c.name} ${r.h.avgRentT2} (${r.c.scores.global.toFixed(1)})`).join(" | "), "n=", big.length);
const good = rows.filter((r) => r.c.scores.global >= 6 && (r.c.population ?? 0) >= 20000).slice(0, 6);
console.log("bon score & <:", good.map((r) => `${r.c.name} ${r.h.avgRentT2} (${r.c.scores.global.toFixed(1)})`).join(" | "));
const ratio = (a: string, b: string) => `${a}/${b}`;
const ps = HOUSING["paris"]; console.log("paris", ps, ratio("", ""));
