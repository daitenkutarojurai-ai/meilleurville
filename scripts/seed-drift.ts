/**
 * Dérive des notes rendues quand le seed change (extension du seed, F34/F35).
 *
 * `normalizeDistribution` (lib/score-distribution.ts) est un z-score calculé sur
 * TOUT le corpus : ajouter une ville déplace la moyenne et l'écart-type de chaque
 * axe, donc la note rendue de toutes les autres. Arrondie au dixième, la plupart
 * des villes ne bougent pas, mais celles qui sont à la frontière d'un arrondi
 * changent de 0,1 — et un guide qui les cite devient faux (cf. l'incident du
 * 2026-08-10, CLAUDE.md § Score pipeline).
 *
 * Ce script compare le `CITIES_SEED` RENDU d'une révision git (par défaut HEAD)
 * à celui de l'arbre de travail, sur les villes communes aux deux :
 *   - écart max et médian, global + 8 axes ;
 *   - villes dont une note arrondie change ;
 *   - citations « x,y/10 » des guides FR/EN qui reprennent une ancienne note
 *     d'une ville nommée dans les 160 caractères qui précèdent, et dont la
 *     nouvelle note diffère (candidates à corriger — heuristique, à relire) ;
 *   - `seoDescriptionEn` du seed dont le « score x.y/10 » ne vaut plus la note
 *     globale rendue.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/seed-drift.ts            # vs HEAD
 *   npx tsx --tsconfig tsconfig.json scripts/seed-drift.ts origin/main
 *
 * Il ne réécrit rien. Le fichier de base est extrait dans `data/` le temps du
 * calcul (pour que ses imports `@/lib/*` se résolvent), puis supprimé.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import path from "node:path";

type Scores = Record<string, number>;
type Row = { slug: string; name: string; scores: Scores };

const AXES = ["global", "life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"];
const ROOT = path.resolve(__dirname, "..");

async function main() {
  const ref = process.argv[2] ?? "HEAD";
  const baseRel = "data/.seed-drift-base.ts";
  const baseAbs = path.join(ROOT, baseRel);
  const src = execFileSync("git", ["show", `${ref}:data/cities-seed.ts`], { cwd: ROOT, encoding: "utf8" });
  writeFileSync(baseAbs, src);
  let before: Row[];
  try {
    before = (await import(baseAbs)).CITIES_SEED as Row[];
  } finally {
    if (existsSync(baseAbs)) unlinkSync(baseAbs);
  }
  const after = (await import(path.join(ROOT, "data/cities-seed.ts"))).CITIES_SEED as Row[];

  const afterBySlug = new Map(after.map((c) => [c.slug, c]));
  const beforeSlugs = new Set(before.map((c) => c.slug));
  const added = after.filter((c) => !beforeSlugs.has(c.slug)).map((c) => c.slug);
  const removed = before.filter((c) => !afterBySlug.has(c.slug)).map((c) => c.slug);

  console.log(`base ${ref} : ${before.length} villes · arbre de travail : ${after.length} villes`);
  console.log(`ajoutées (${added.length}) : ${added.join(", ") || "—"}`);
  if (removed.length) console.log(`RETIRÉES (${removed.length}) : ${removed.join(", ")}`);

  const changed = new Map<string, { name: string; diffs: string[]; before: Scores; after: Scores }>();
  console.log("\naxe          écart max  écart médian  villes changées");
  for (const axis of AXES) {
    const deltas: number[] = [];
    let n = 0;
    for (const b of before) {
      const a = afterBySlug.get(b.slug);
      if (!a) continue;
      const d = Math.round(Math.abs(a.scores[axis] - b.scores[axis]) * 10) / 10;
      deltas.push(d);
      if (d > 0) {
        n++;
        const e = changed.get(b.slug) ?? { name: b.name, diffs: [], before: b.scores, after: a.scores };
        e.diffs.push(`${axis} ${b.scores[axis]}→${a.scores[axis]}`);
        changed.set(b.slug, e);
      }
    }
    deltas.sort((x, y) => x - y);
    const max = deltas[deltas.length - 1] ?? 0;
    const med = deltas[Math.floor(deltas.length / 2)] ?? 0;
    console.log(`${axis.padEnd(12)} ${max.toFixed(1).padStart(9)}  ${med.toFixed(1).padStart(12)}  ${String(n).padStart(15)}`);
  }
  console.log(`\n${changed.size} ville(s) existante(s) dont au moins une note arrondie change.`);
  for (const [slug, e] of [...changed].slice(0, 60)) console.log(`  ${slug} : ${e.diffs.join(" · ")}`);
  if (changed.size > 60) console.log(`  … et ${changed.size - 60} autres`);

  // Citations de guides : « 6,4/10 » (FR) ou « 6.4/10 » (EN) précédé du nom d'une ville changée.
  const { GUIDES } = await import(path.join(ROOT, "data/guides.ts"));
  const { EN_GUIDES } = await import(path.join(ROOT, "data/guides-en.ts"));
  const hits: string[] = [];
  const scan = (corpus: { slug: string; intro?: string; sections?: { body?: string }[] }[], label: string) => {
    for (const g of corpus) {
      const texts = [g.intro ?? "", ...(g.sections ?? []).map((s) => s.body ?? "")];
      for (const t of texts) {
        for (const m of t.matchAll(/(\d{1,2})[,.](\d)\s*\/\s*10/g)) {
          const v = Number(`${m[1]}.${m[2]}`);
          const ctx = t.slice(Math.max(0, (m.index ?? 0) - 160), m.index);
          for (const e of changed.values()) {
            if (!ctx.includes(e.name)) continue;
            const axes = AXES.filter((ax) => e.before[ax] === v && e.after[ax] !== v);
            if (axes.length) hits.push(`  [${label}] ${g.slug} : ${e.name} ${m[0]} (${axes.map((ax) => `${ax}→${e.after[ax]}`).join(", ")})`);
          }
        }
      }
    }
  };
  scan(GUIDES, "FR");
  scan(EN_GUIDES, "EN");

  // Le seed lui-même : 502 `seoDescriptionEn` citent « quality-of-life score x.y/10 »,
  // qui doit valoir la note globale RENDUE (mesuré 2026-10-06 : 502/502 alignées).
  // Une dérive les rend fausses sans qu'aucune garde ne le voie.
  const meta = (after as (Row & { seoDescriptionEn?: string })[]).flatMap((c) => {
    const m = (c.seoDescriptionEn ?? "").match(/score (\d+\.\d)\/10/);
    return m && Number(m[1]) !== c.scores.global ? [`  [seed] ${c.slug} : seoDescriptionEn ${m[1]}/10, rendu ${c.scores.global}`] : [];
  });
  hits.push(...meta);
  console.log(`\n${hits.length} citation(s) de guide candidate(s) à corriger :`);
  for (const h of hits) console.log(h);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
