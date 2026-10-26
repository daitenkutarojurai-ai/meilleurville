# Intégrité des données — 2026-10-26

**Résultat : run propre, aucune correction nécessaire.**

## Priorité : éditions du palmarès publiées en avance — soldée, revérifiée

Mécanisme du 2026-10-09 en place (`data/palmares-drafts.ts`, garde `palmarès`, `CLAUDE.md` § R13.2).
`GUIDES` porte juillet → octobre 2026 ; novembre, décembre et janvier restent en brouillon, aucun de
leurs slugs n'est référencé hors de `data/palmares-drafts.ts` (app, lib, components, data, index de
recherche). L'édition d'octobre se clôt sur « Rendez-vous en novembre » et annonce le thème de la
population municipale, qui est bien celui du brouillon de novembre : pas de promesse orpheline.
Novembre est dû le **2 novembre** — c'est à la routine palmarès de le déplacer, pas à celle-ci.

## Contrôle FR / EN (règle 2)

⚠️ L'historique git a été réinitialisé le 2026-10-22 (commit racine `2d863a9`, 2 332 fichiers) :
`git log --since` ne permet plus de borner « ce qui a changé depuis le dernier run ». Le contrôle a
donc été refait **en entier** plutôt que par diff.

- Seed à **593 villes**, dont 53 `scoreCohort: "extension"` (dernière : Ozoir-la-Ferrière).
- Balayage exhaustif, par import réel des moteurs (`npx tsx`) : sécurité, santé, air, services
  publics, démographie, emploi, bruit, stress hydrique, risques naturels, sur les **593 villes** —
  **26 685 sous-scores**. Pour chacun, rendu FR `(10 - x).toFixed(1)` / `x.toFixed(1)` comparé au
  rendu EN `Math.round(…*10)/10` : **0 écart**, **0 valeur hors [0, 10]**.
- Scores du seed rendu (`CITIES_SEED`, global + 8 axes) : tous à une décimale, donc la page FR qui
  interpole `${city.scores.global}` brut et l'EN qui fait `.toFixed(1)` affichent le même nombre.
  Scores de niche dans [0, 10] sur les 593.

## Conventions (règles 1 et 3)

- Inversions : `securite`/`safety`, `sante`/`healthcare`, `air`/`air-quality`,
  `demographie`/`demographics`, `services-publics`/`public-services`, `emploi`/`employment`
  inversent au site d'affichage des deux côtés ; `bruit`, `eau`, `risques` (nuisances) restent bruts.
- Couleurs : seules les pages EN noise / water / natural-risks passent un score de nuisance à
  `scoreColor`, et toutes via `hazardColor = scoreColor(10 - x)`. Côté FR, palettes par niveau.
- Toute lib de `lib/` déclarant `10 = pire` / `désert` porte son bloc `**Convention**`.

## Couverture

- `RANKING_EN` ↔ `RANKING_META` : 19/19, zéro orpheline. `REGION_EN_DESCRIPTIONS` ↔ régions du
  seed : 18/18, zéro orpheline.
- `npx tsc --noEmit` propre ; `npm run integrity` vert (dont `assertUniqueSlugs` FR/EN) ;
  `sitemap:check` vert (EN 32 109 URL) ; `hreflang:check`, `search-index:check` verts ;
  `parity` code 0 (FR 229 routes, EN 168, 0 route FR sans jumelle hors exceptions déclarées).

## À arbitrer

Rien de neuf. L'écart PM2.5 modèle / mesure en station signalé le 12/10 reste ouvert (il déplacerait
un score publié, hors périmètre de cette routine).
