/**
 * Repères de corpus des thèmes Red Flag à « villes comparées », et tête de
 * leurs classements. À relancer après chaque lot d'extension du seed
 * (`docs/extension-villes.md` § 3.4) : les nombres de la prose se dérivent seuls
 * (`CORPUS_*` dans `lib/red-flag-themes.ts`), mais les villes NOMMÉES dans la
 * prose (« Paris ouvre le classement », « Joinville-le-Pont porte le loyer le
 * plus élevé ») sont écrites à la main et se relisent contre cette sortie.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/red-flag-corpus.ts
 */
import {
  getRedFlagTheme,
  CORPUS_ACHAT,
  CORPUS_ARRIVEES,
  CORPUS_JEUNES,
  CORPUS_SANS_ENFANTS,
  CORPUS_SE_VIDENT,
  CORPUS_SPREAD,
  CORPUS_VIEILLIR,
} from "@/lib/red-flag-themes";

const corpora = {
  "villes-qui-se-vident": CORPUS_SE_VIDENT,
  "villes-achat-hors-de-portee": CORPUS_ACHAT,
  "villes-prix-au-m2-trompeur": CORPUS_SPREAD,
  "villes-sans-enfants": CORPUS_SANS_ENFANTS,
  "villes-arrivees-loyers-hauts": CORPUS_ARRIVEES,
  "villes-jeunes-studio-cher": CORPUS_JEUNES,
  "villes-vieillir-loin-des-soins": CORPUS_VIEILLIR,
};

for (const [slug, corpus] of Object.entries(corpora)) {
  const rows = getRedFlagTheme(slug)?.rank() ?? [];
  console.log(`\n${slug} — ${rows.length} lignes`);
  console.log("  corpus :", JSON.stringify(corpus));
  console.log(
    "  tête   :",
    rows
      .slice(0, 8)
      .map((r) => r.city.slug + (r.city.scoreCohort === "extension" ? "*" : ""))
      .join(", "),
  );
}
console.log("\n* = ville d'extension");
