# Intégrité des données — 2026-10-19

## Priorité : éditions du palmarès publiées en avance — soldée, revérifiée

Mécanisme en place depuis le 2026-10-09 (`data/palmares-drafts.ts`, garde `palmarès` de
`npm run integrity`, `CLAUDE.md` § R13.2). Revérifié : `GUIDES` ne porte que juillet → octobre 2026,
novembre / décembre / janvier restent en brouillon, aucun de leurs slugs n'apparaît dans `app/`,
`lib/`, `components/` ni dans les index de recherche, et la garde passe. Au 19/10 aucune édition
n'est due : novembre se publie le 2 novembre. Rien à faire.

## Contrôle FR / EN (règle 2)

Seed à **593 villes** (53 en `scoreCohort: "extension"`). Échantillon : Lyon, Nantes, Limoges,
Figeac, Mamoudzou, Saint-Malo, Annecy, Briançon, Bezons et **Ozoir-la-Ferrière** (dernière ville
d'extension). Moteurs exécutés par import réel (`npx tsx`) : global, santé, sécurité, air, bruit,
scores de niche. Rendu FR `toFixed(1)` et rendu EN `Math.round(x*10)/10` de la sécurité inversée
identiques sur les 10 ; toutes les valeurs dans [0, 10].

Aucun moteur de score n'a changé depuis le run du 12/10 (seuls `red-flag-themes`, `profile-pages`,
`i18n`, `expat-return` ont bougé dans `lib/`), et le diff des sous-pages ville FR/EN depuis le 12/10
ne touche aucun `toFixed`, `10 -`, `scoreColor`, `scoreHex` ni `hazardColor` (changements de design
« Carte & plaque » seulement). Le balayage exhaustif du 12/10 (32 395 comparaisons, 0 écart) reste
donc valable.

Pages neuves comparées à la main : `/villes/[slug]/presidentielle-2027` ↔
`/cities/[slug]/2027-election` — mêmes fonctions (`project2027`, `getPoliticalLean`), même
arrondi (`maximumFractionDigits: 1`), même calcul des « villes au vote le plus proche ». Fiche
département EN (`DepartementFiche`, commit e6aa79f) : composant partagé avec le FR.

## Conventions (règles 1 et 3)

- Inversions FR/EN des 11 sous-pages d'environnement et de services : décomptes inchangés depuis le
  12/10, conformes.
- Couleurs : aucune classe verte / lime / émeraude introduite comme décoration dans les fichiers
  modifiés depuis le 12/10.
- **Corrigé** : les cinq libs de classement adossées à un moteur `10 = pire`
  (`demography-`, `employment-market-`, `healthcare-access-`, `public-services-`,
  `safety-deep-rankings.ts`) n'avaient pas de bloc `**Convention**`. Ajouté : valeur brute, tri
  brut, inversion au seul site d'affichage.

## Couverture

- `RANKING_EN` ↔ `RANKING_META` : 19/19, zéro orpheline. `REGION_EN_DESCRIPTIONS` ↔ régions du
  seed : 18/18, zéro orpheline.
- `assertUniqueSlugs` FR/EN vert (`npm run integrity`). `sitemap:check` vert (FR 32 466 URL,
  EN 32 013). `hreflang:check` et `search-index:check` verts.
- **Corrigé** : `npm run parity` sortait en **code 1** sur `/presidentielle-2027`, hub FR seul par
  décision (CLAUDE.md § Politique), canonical nu sans hreflang. Déclaré dans `PARITY_EXCEPTIONS`
  (`lib/i18n.ts`) ; `parity` repasse à 0.

## À arbitrer

Rien de neuf. L'écart PM2.5 modèle / mesure en station signalé le 12/10 reste ouvert (il
déplacerait un score publié, donc hors du périmètre de cette routine).
