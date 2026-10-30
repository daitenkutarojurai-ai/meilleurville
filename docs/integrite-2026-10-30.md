# Intégrité des données — 2026-10-30

**Résultat : run propre, aucune correction nécessaire.**

## Priorité : éditions du palmarès publiées en avance — soldée, revérifiée

Mécanisme du 2026-10-09 en place (`data/palmares-drafts.ts`, garde `palmarès`, `CLAUDE.md` → `docs/claude/roadmap.md` § R13.2).
Garde `palmarès` : 4 éditions publiées (juillet → octobre), aucune d'un mois futur, 3 brouillons non rendus.
Les slugs novembre / décembre / janvier n'apparaissent que dans `data/palmares-drafts.ts` (app, lib,
components, data, index de recherche balayés). L'édition d'octobre se clôt sur « Rendez-vous en novembre »
et annonce la population municipale, thème du brouillon de novembre : pas de promesse orpheline.
Novembre est dû le **2 novembre** (routine palmarès).

## Ce qui a changé depuis le 26/10

40 fichiers d'`app/`, `components/`, `lib/` touchés, surtout la refonte « Couleurs » des sous-pages ville
(air, bruit, santé, emploi, climat, écoles, logement, quartiers, télétravail, transports, FR et EN).
Relu ligne à ligne sur ce qui porte un nombre : les diffs ne touchent que des classes de fond/bande ;
les inversions `10 - x` (air, santé, emploi) et le brut assumé du bruit sont intacts, les légendes
« 10 = … » présentes des deux côtés, EN noise/water/natural-risks toujours sur `hazardColor`.
Côté FR, les pastilles restent sur les palettes par niveau (`AIR_LEVEL_COLOR`, `NOISE_LEVEL_COLOR`…).

## Contrôle FR / EN (règle 2)

- Balayage exhaustif par import réel des moteurs (`npx tsx`) : sécurité, santé, air, services publics,
  démographie, emploi, bruit, stress hydrique, risques naturels, sur les **593 villes** (dont 53
  `extension`, dernière Ozoir-la-Ferrière) — **26 685 sous-scores**, rendu FR `toFixed(1)` vs EN
  `Math.round(…*10)/10` : **0 écart**, **0 valeur hors [0, 10]**. `CITIES_SEED` : tous les axes à une
  décimale ; scores de niche dans [0, 10].
- Échantillon relu à la main : Paris, Lyon, Rennes, Saint-Denis (Réunion), Fort-de-France, Biarritz,
  La Rochelle, Aurillac, Ozoir-la-Ferrière (extension).

## Couverture

- `RANKING_EN` ↔ `RANKING_META` : 19/19, zéro orpheline. `REGION_EN_DESCRIPTIONS` : 18/18 régions.
- `npx tsc --noEmit` propre ; `npm run integrity` vert ; `search-index:check`, `hreflang:check` verts ;
  `sitemap:check` vert (FR 32 602 URL, EN 32 202) ; `parity` FR 230 routes, 0 sans jumelle.

## À arbitrer

Rien de neuf. L'écart PM2.5 modèle / mesure en station signalé le 12/10 reste ouvert (il déplacerait
un score publié, hors périmètre de cette routine).
