#!/usr/bin/env node
/**
 * Refuse to deploy an export whose locale doesn't match the target Worker.
 *
 * Pourquoi ce script existe (2026-08-10). Les deux déploiements partagent le
 * MÊME dossier `out/` : `wrangler.toml` (FR, www.mavilleideale.fr) et
 * `wrangler.en.toml` (EN, bestcitiesinfrance.com) pointent tous les deux
 * dessus, et la locale est figée AU BUILD (`NEXT_PUBLIC_DEFAULT_LOCALE`).
 * Enchaîner `npm run build` puis `npm run cf:deploy:en` publie donc le site
 * français sur le domaine anglais, sans que rien n'échoue : `wrangler` ne sait
 * pas ce qu'il envoie, et l'erreur ne se voit qu'en ouvrant le site.
 *
 * Le contrôle est décisif parce qu'il lit ce qui est réellement inliné dans
 * l'export, pas une variable d'environnement que le shell courant pourrait
 * avoir gardée.
 *
 * ⚠️ Deuxième contrôle, ajouté le 2026-09-06 : le canonical et le
 * `<html lang>` ne suffisent pas. Le canonical est dérivé de
 * `ORIGIN_BY_LOCALE` (`lib/i18n.ts`), donc de la seule locale — il est juste
 * quoi qu'il arrive. Le site a une **seconde** origine, celle de
 * `NEXT_PUBLIC_BASE_URL`, qui alimente `app/robots.ts`, `app/sitemap.ts`,
 * `app/layout.tsx` (`metadataBase`), `lib/jsonld.ts` et les deux flux RSS.
 * Or `npm run build:en` ne surcharge que `NEXT_PUBLIC_DEFAULT_LOCALE` : une
 * valeur de `NEXT_PUBLIC_BASE_URL` posée dans `.env.local` (c'est ce que
 * `.env.example` prescrit, sur le domaine FR) survit donc au build EN et
 * l'emporte sur la locale, `??` obligeant. Mesuré en exécutant les modules :
 * `NEXT_PUBLIC_DEFAULT_LOCALE=en NEXT_PUBLIC_BASE_URL=https://www.mavilleideale.fr`
 * fait écrire `https://www.mavilleideale.fr/sitemap-index.xml` dans le
 * `robots.txt` du site anglais, et des URL FR dans son sitemap. C'est
 * exactement le défaut corrigé le 2026-09-05 dans `lib/jsonld.ts` (le site EN
 * publiait le domaine FR dans ses BreadcrumbList) : le correctif a ajouté le
 * repli par locale sans retirer la préséance de la variable ambiguë, donc le
 * trou reste ouvert du côté de l'environnement.
 *
 * On lit donc aussi l'origine effectivement exportée dans `out/robots.txt`
 * (ligne `Sitemap:`) et dans le premier chunk de sitemap. Les deux fichiers
 * sont conservés par le `postbuild`. Absents, on ne bloque pas le déploiement
 * — le contrôle historique reste décisif — mais on le dit.
 *
 *   node scripts/check-deploy-locale.mjs fr   # avant wrangler deploy
 *   node scripts/check-deploy-locale.mjs en   # avant wrangler deploy -c wrangler.en.toml
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const EXPECTED = {
  fr: { lang: "fr", host: "www.mavilleideale.fr", worker: "meilleurville" },
  en: { lang: "en", host: "bestcitiesinfrance.com", worker: "meilleurville-en" },
};

const target = process.argv[2];
const want = EXPECTED[target];
if (!want) {
  console.error(`usage: check-deploy-locale.mjs <fr|en>  (reçu: ${target ?? "rien"})`);
  process.exit(2);
}

const index = path.join(ROOT, "out", "index.html");
if (!existsSync(index)) {
  console.error(
    `out/index.html est absent — il n'y a rien à déployer.\n` +
      `  FR : npm run build\n` +
      `  EN : npm run build:en`,
  );
  process.exit(1);
}

const html = readFileSync(index, "utf8");
const canonical = html.match(/<link rel="canonical" href="https?:\/\/([^/"]+)/i)?.[1] ?? null;
const lang = html.match(/<html[^>]*\blang="([a-z-]+)"/i)?.[1] ?? null;

const wrong = [];
if (canonical !== want.host) wrong.push(`canonical = ${canonical ?? "introuvable"} (attendu ${want.host})`);
if (lang !== want.lang) wrong.push(`<html lang> = ${lang ?? "introuvable"} (attendu ${want.lang})`);

// --- Seconde origine : celle de NEXT_PUBLIC_BASE_URL (cf. en-tête) ---------
const skipped = [];
/** Premier hôte cité par un fichier exporté, ou `null` si le fichier manque. */
function exportedHost(relPath, pattern) {
  const abs = path.join(ROOT, relPath);
  if (!existsSync(abs)) {
    skipped.push(relPath);
    return null;
  }
  return readFileSync(abs, "utf8").match(pattern)?.[1] ?? "introuvable";
}

const robotsHost = exportedHost("out/robots.txt", /^\s*Sitemap:\s*https?:\/\/([^/\s]+)/im);
if (robotsHost && robotsHost !== want.host) {
  wrong.push(`out/robots.txt annonce le sitemap sur ${robotsHost} (attendu ${want.host})`);
}

const sitemapHost = exportedHost("out/sitemap/0.xml", /<loc>\s*https?:\/\/([^/<\s]+)/i);
if (sitemapHost && sitemapHost !== want.host) {
  wrong.push(`out/sitemap/0.xml déclare des URL sur ${sitemapHost} (attendu ${want.host})`);
}

if (wrong.length) {
  const other = target === "fr" ? "en" : "fr";
  // Deux causes distinctes, deux remèdes. Si le canonical ou le `lang` est en
  // cause, c'est l'export de l'autre locale qui traîne dans `out/`. S'ils sont
  // justes et que seule la seconde origine cloche, l'export est le bon et
  // c'est `NEXT_PUBLIC_BASE_URL` qui contredit la locale (cf. en-tête).
  const staleExport = canonical !== want.host || lang !== want.lang;
  console.error(
    (staleExport
      ? `Refus de déployer : \`out/\` ne contient pas l'export ${target.toUpperCase()}.\n`
      : `Refus de déployer : l'export est bien ${target.toUpperCase()}, mais il publie l'origine de l'autre domaine.\n`) +
      wrong.map((w) => `  - ${w}`).join("\n") +
      (staleExport
        ? `\n\nC'est probablement l'export ${other.toUpperCase()}. Reconstruis avant de déployer :\n` +
          (target === "fr" ? "  npm run build\n" : "  npm run build:en\n")
        : `\n\nCause : \`NEXT_PUBLIC_BASE_URL\` l'emporte sur \`NEXT_PUBLIC_DEFAULT_LOCALE\` dans\n` +
          `app/robots.ts, app/sitemap.ts, app/layout.tsx, lib/jsonld.ts et les flux RSS,\n` +
          `et \`npm run build:en\` ne la surcharge pas. Retire-la de \`.env.local\` (les replis\n` +
          `par locale suffisent) ou pose la valeur du domaine visé, puis reconstruis :\n` +
          (target === "fr" ? "  npm run build\n" : "  npm run build:en\n")),
  );
  process.exit(1);
}

if (skipped.length) {
  console.warn(`  (non vérifié, fichier absent de l'export : ${skipped.join(", ")})`);
}
console.log(`Export ${target.toUpperCase()} confirmé (canonical ${canonical}) → worker ${want.worker}.`);
