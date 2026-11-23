#!/usr/bin/env node
/**
 * Export Search Console (CSV) → docs/seo/cibles.md, la liste de cibles que lisent
 * les routines (les sessions cloud n'ont pas accès à la Search Console).
 *
 * Usage : node scripts/gsc-cibles.mjs <dossier de l'export dézippé>
 *   (Search Console > Performances > 3 derniers mois > Exporter > CSV,
 *    puis dézipper : Chart.csv, Queries.csv, Pages.csv, Devices.csv…)
 *
 * À relancer une fois par mois (ou plus) : le fichier est réécrit entier.
 */
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir || !fs.existsSync(path.join(dir, "Queries.csv"))) {
  console.error("usage: node scripts/gsc-cibles.mjs <dossier contenant Queries.csv et Pages.csv>");
  process.exit(1);
}
const csv = (f) =>
  fs.readFileSync(path.join(dir, f), "utf8").trim().split(/\r?\n/).slice(1).map((l) => {
    const m = l.match(/^(.*),(\d+),(\d+),([\d.]+)%,([\d.]+)$/);
    return m && { k: m[1].replace(/^"|"$/g, ""), c: +m[2], i: +m[3], ctr: +m[4], p: +m[5] };
  }).filter(Boolean);
const Q = csv("Queries.csv");
const P = csv("Pages.csv");
const chart = fs.existsSync(path.join(dir, "Chart.csv"))
  ? fs.readFileSync(path.join(dir, "Chart.csv"), "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(","))
  : [];

const BRAND = /ville\s*id[ée]al|mavilleid/i;
const strip = (u) => u.replace(/^https:\/\/(www\.)?mavilleideale\.fr/, "") || "/";
const sum = (a) => a.reduce((s, r) => ({ c: s.c + r.c, i: s.i + r.i, pw: s.pw + r.p * r.i }), { c: 0, i: 0, pw: 0 });
const pct = (c, i) => (i ? ((100 * c) / i).toFixed(2) + " %" : "–");
const pos = (s) => (s.i ? (s.pw / s.i).toFixed(1) : "–");
const n = (x) => x.toLocaleString("fr-FR");

function template(u) {
  const p = strip(u);
  let m;
  if (p === "/") return "/ (accueil)";
  if ((m = p.match(/^\/villes\/[^/]+\/([^/]+)/))) return "/villes/[ville]/" + m[1];
  if (/^\/villes\/[^/]+$/.test(p)) return "/villes/[ville] (fiche)";
  if (p.startsWith("/guides/")) {
    const s = p.slice(8);
    if (s.includes("-vs-")) return "/guides/*-vs-*";
    const pre = s.match(/^(.*?-(?:a|en|de|du|des|pour))-/);
    return "/guides/" + (pre ? pre[1] + "-*" : s.split("-").slice(0, 2).join("-") + "…");
  }
  return p.split("/").slice(0, 2).join("/") + (p.split("/").length > 2 ? "/*" : "");
}

const out = [];
const period = chart.length ? `${chart[0][0]} → ${chart[chart.length - 1][0]}` : "3 derniers mois";
const totC = chart.reduce((s, r) => s + +r[1], 0);
const totI = chart.reduce((s, r) => s + +r[2], 0);
out.push(`# Cibles SEO — générées depuis la Search Console`, ``,
  `> Généré par \`node scripts/gsc-cibles.mjs\` le ${new Date().toISOString().slice(0, 10)} (période ${period}).`,
  `> Ne pas éditer à la main : relancer le script sur un nouvel export. Stratégie : \`docs/seo/strategie-audience.md\`.`, ``);
if (chart.length) {
  out.push(`**Total période** : ${n(totC)} clics, ${n(totI)} impressions, CTR ${pct(totC, totI)}.`, ``, `| Semaine du | Clics | Impressions | CTR |`, `|---|---:|---:|---:|`);
  for (let w = 0; w * 7 < chart.length; w++) {
    const rows = chart.slice(w * 7, w * 7 + 7);
    if (rows.length < 7) break;
    const c = rows.reduce((s, r) => s + +r[1], 0), i = rows.reduce((s, r) => s + +r[2], 0);
    out.push(`| ${rows[0][0]} | ${n(c)} | ${n(i)} | ${pct(c, i)} |`);
  }
  out.push(``);
}

const brand = Q.filter((r) => BRAND.test(r.k));
const b = sum(brand), all = sum(Q);
out.push(`## 1. Requêtes « ville idéale » (confusion avec ville-ideale.fr)`, ``,
  `${brand.length} requêtes du top 1 000 contiennent « ville idéale » : **${n(b.c)} clics sur ${n(all.c)}** du top 1 000 (${pct(b.c, all.c)}), position ${pos(b)}. Ce trafic cherche surtout un autre site. Il est fragile : ne pas le compter comme acquis.`, ``);

out.push(`## 2. Requêtes à portée de main (position 4-20, hors marque), par impressions`, ``,
  `Action : enrichir la page qui se classe, revoir title/description, ajouter des liens internes depuis les pages fortes.`, ``,
  `| Requête | Impr. | Clics | CTR | Pos. |`, `|---|---:|---:|---:|---:|`);
Q.filter((r) => r.p >= 4 && r.p <= 20 && r.i >= 60 && !BRAND.test(r.k) && !/^parcs?$/.test(r.k))
  .sort((a, b) => b.i - a.i).slice(0, 80)
  .forEach((r) => out.push(`| ${r.k} | ${n(r.i)} | ${r.c} | ${r.ctr} % | ${r.p.toFixed(1)} |`));
out.push(``);

const g = {};
for (const r of P) (g[template(r.k)] ??= []).push(r);
out.push(`## 3. Rendement par gabarit (top 1 000 pages)`, ``,
  `| Gabarit | Pages | Clics | Impr. | CTR | Pos. |`, `|---|---:|---:|---:|---:|---:|`);
Object.entries(g).map(([k, a]) => [k, a.length, sum(a)]).sort((a, b) => b[2].c - a[2].c).slice(0, 40)
  .forEach(([k, len, s]) => out.push(`| ${k} | ${len} | ${n(s.c)} | ${n(s.i)} | ${pct(s.c, s.i)} | ${pos(s)} |`));
out.push(``);

out.push(`## 4. Pages à fort potentiel (≥ 500 impressions, position 4-20), par impressions`, ``,
  `Action : c'est ici qu'une meilleure page rapporte le plus. Un title/description plus net, du contenu propre à la ville, FAQ, liens internes.`, ``,
  `| Page | Impr. | Clics | CTR | Pos. |`, `|---|---:|---:|---:|---:|`);
P.filter((r) => r.i >= 500 && r.p >= 4 && r.p <= 20 && !/\/parcs$/.test(r.k)).sort((a, b) => b.i - a.i).slice(0, 60)
  .forEach((r) => out.push(`| ${strip(r.k)} | ${n(r.i)} | ${r.c} | ${r.ctr} % | ${r.p.toFixed(1)} |`));
out.push(``);

const city = {};
for (const r of P) {
  const m = strip(r.k).match(/^\/villes\/([^/]+)/);
  if (m) { city[m[1]] ??= { c: 0, i: 0, pw: 0 }; city[m[1]].c += r.c; city[m[1]].i += r.i; city[m[1]].pw += r.p * r.i; }
}
out.push(`## 5. Villes qui ont déjà de la traction (toutes pages /villes/[ville]/* confondues, hors parcs)`, ``,
  `Action : priorité de toutes les routines (actu locale, enrichissement, comparaisons, jumelles EN).`, ``);
for (const r of P) { const m = strip(r.k).match(/^\/villes\/([^/]+)\/parcs$/); if (m) { city[m[1]].c -= r.c; city[m[1]].i -= r.i; city[m[1]].pw -= r.p * r.i; } }
out.push(Object.entries(city).filter(([, s]) => s.i > 0).sort((a, b) => b[1].c - a[1].c || b[1].i - a[1].i).slice(0, 60)
  .map(([k, s]) => `\`${k}\` (${s.c} cl., ${n(s.i)} impr.)`).join(" · "), ``);

out.push(`## 6. Comparaisons demandées (requêtes « X ou Y », « X vs Y »)`, ``);
out.push(Q.filter((r) => /\bvs\b|\bou\b/.test(r.k) && !BRAND.test(r.k)).sort((a, b) => b.i - a.i).slice(0, 60)
  .map((r) => `${r.k} (${r.i} impr., pos. ${r.p.toFixed(1)})`).join(" · "), ``);

out.push(`## 7. Titres à revoir : ≥ 300 impressions, CTR < 1 %, position ≤ 12`, ``);
P.filter((r) => r.i >= 300 && r.ctr < 1 && r.p <= 12 && !/\/parcs$/.test(r.k)).sort((a, b) => b.i - a.i).slice(0, 40)
  .forEach((r) => out.push(`- ${strip(r.k)} (${n(r.i)} impr., ${r.ctr} %, pos. ${r.p.toFixed(1)})`));
out.push(``);

fs.mkdirSync("docs/seo", { recursive: true });
fs.writeFileSync("docs/seo/cibles.md", out.join("\n"));
console.log("docs/seo/cibles.md écrit,", out.length, "lignes");
