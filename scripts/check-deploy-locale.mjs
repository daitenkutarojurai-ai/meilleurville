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
 * Le contrôle est décisif parce qu'il lit le NEXT_PUBLIC_BASE_URL réellement
 * inliné dans la page d'accueil exportée (le canonical), pas une variable
 * d'environnement que le shell courant pourrait avoir gardée.
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

if (wrong.length) {
  const other = target === "fr" ? "en" : "fr";
  console.error(
    `Refus de déployer : \`out/\` ne contient pas l'export ${target.toUpperCase()}.\n` +
      wrong.map((w) => `  - ${w}`).join("\n") +
      `\n\nC'est probablement l'export ${other.toUpperCase()}. Reconstruis avant de déployer :\n` +
      (target === "fr" ? "  npm run build\n" : "  npm run build:en\n"),
  );
  process.exit(1);
}

console.log(`Export ${target.toUpperCase()} confirmé (canonical ${canonical}) → worker ${want.worker}.`);
