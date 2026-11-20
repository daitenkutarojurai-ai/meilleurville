# Intégrité des données — 2026-11-20

**Résultat : aucun écart FR / EN de chiffre. Trois corrections sûres : une entrée sitemap manquante (2 URL EN), une
page sécurité qui contredisait la fiche ville sans le dire (FR + EN), et deux thèmes Red Flags EN qui recopiaient en dur
des compteurs que la jumelle FR calcule.**

## Priorité : éditions du palmarès en avance — toujours soldée

Garde `palmarès` : 5 éditions publiées (juillet → novembre 2026), aucune d'un mois futur, 2 brouillons non rendus
(décembre 2026, janvier 2027) dans `data/palmares-drafts.ts`. Novembre annonce la structure par âge (brouillon de
décembre, à publier le 2026-12-02). Mécanisme documenté dans `docs/claude/roadmap.md` § R13.2.

## Corrigé

1. **Sitemap EN** : `/red-flags/themes/shrinking-job-markets` et `/red-flags/themes/cities-emptying-out` (jumelles
   livrées le 19/11) étaient générées sans URL au sitemap. Ajoutées à `EN_RED_FLAG_THEME_SLUGS` ; `sitemap:check` vert
   (EN 4 064 URL).
2. **Sécurité : composite ≠ axe de la fiche, sans le dire.** `/villes/<slug>/securite` se présente comme la
   « décomposition du score sécurité » et `/cities/<slug>/safety` titrait « Safety score », mais leur composite
   (`lib/safety-deep.ts` : axe sécurité + modulateurs métropole / tourisme / passé industriel / DROM / petite ville,
   pondéré 35/30/20/15) n'est pas l'axe affiché sur la fiche. Mesuré sur 593 villes : écart médian 0,5, p90 1,2,
   max 2,2 (Denain fiche 2,4 → composite 4,6) ; 117 villes à ≥ 1 point ; ρ de rang 0,957. Lyon : fiche 5,1, page
   sécurité 4,4. Correction d'affichage seulement, mêmes chiffres des deux côtés : la carte composite cite désormais le
   score de la fiche et explique l'écart ; EN renommé « Composite safety score ». Aucun nombre ne bouge.
3. **Thèmes Red Flags EN `shrinking-job-markets` / `cities-emptying-out`** : 13 compteurs (413, +6,8 %, 43, 24, 19 ;
   591, 217, 167, 525, 120, 2,5, 1,6, 593) écrits en dur alors que le FR les lit dans `CORPUS_RECUL` /
   `CORPUS_SE_VIDENT`. Ils étaient justes aujourd'hui ; au prochain millésime Insee, seul le FR aurait bougé. L'EN les
   interpole maintenant depuis les mêmes objets (texte rendu identique, vérifié).

## Contrôle FR / EN (règle 2)

- Inversions d'affichage des 6 sous-pages (sécurité, air, santé, emploi, services publics, démographie) : FR
  `(10 − x).toFixed(1)` face à EN `Math.round((10 − x)·10)/10`, mêmes moteurs des deux côtés, **593 villes,
  17 790 valeurs (composites + dimensions), 0 écart**.
- 10 villes — global · axes (vie, transport, nature, coût, sécurité, culture, télétravail, écoles) · santé env. /
  stress env. : Lyon 7,1 · 6,8 9,0 5,0 4,2 5,1 9,0 9,0 8,9 · 5,3/4,7 — Angers 6,7 · … · 6,2/3,8 — Millau 5,6 · 3,7
  transport · 6,5/3,5 — Biarritz 5,6 · coût 2,9 · 6,4/3,7 — Strasbourg 7,5 · air 3,6 · 5,4/4,6 — Cayenne (DROM)
  3,9 · 7,1/2,9 — Vannes 6,9 · 6,9/3,1 — Romainville (`extension`) 2,8 · 6,3/3,7 — plus Bordeaux/Annecy du run
  précédent inchangés. FR et EN lisent les mêmes champs de `CITIES_SEED` / mêmes libs.
- 30 paires de thèmes Red Flags : chaque nombre de la prose EN figure dans la prose ou les raisons FR (6 alertes,
  toutes des artefacts de format : heures, « 9pm », « €6,000 »). Les lignes classées viennent du même `rank()`.

## Vérifié sans écart

Blocs `**Convention**` présents (aucune lib de score modifiée depuis le 16/11). `RANKING_EN` ↔ `RANKING_META` 19/19,
`REGION_EN_DESCRIPTIONS` 18/18. `tsc`, `integrity`, `hreflang:check`, `search-index:check`, `sitemap:check` verts.

## À arbitrer

1. **Chemins de dépôt montrés aux lecteurs sur les pages Red Flags** : ~36 occurrences dans `methodology` /
   `reality` de `lib/red-flag-themes.ts` (`data/housing.ts` ×17, `lib/city-population.ts` ×6, `lib/city-income.ts` ×5,
   `lib/property-prices.ts` ×3…). Même règle que les guides (« cite une source qu'on peut ouvrir ») ; la garde
   `sources` ne couvre que les guides. Proposition : étendre la garde aux thèmes et passer `humanize-guide-sources`.
2. **Composite sécurité** : faut-il le recaler sur l'axe (modulateurs centrés) ou le renommer partout (classements
   `safety-deep-rankings`) ? Déplace des chiffres publiés : non fait.
3. Inchangés : `score_qualite_air` sur mesure station ; `villes-pollution-air-chronique` et
   `villes-desert-services-publics` à 0 ville.
