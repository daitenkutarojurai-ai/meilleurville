# Intégrité des données — 2026-11-16

**Résultat : run propre. Aucun écart FR / EN, aucune inversion, aucune légende ni clé manquante. Rien corrigé, rien à
corriger.**

## Priorité : éditions du palmarès en avance — toujours soldée

`data/guides.ts` publie juillet → novembre 2026 ; décembre 2026 et janvier 2027 restent dans `data/palmares-drafts.ts`.
L'édition de novembre annonce en clôture la structure par âge, thème du brouillon de décembre. Aucun lien vers une
édition retirée dans `app/`, `lib/`, `data/`, `components/`.

## Ce qui a changé depuis le 13/11

Redesign « Couleurs » des cartes (`FranceHeatmap`, `CarteClient`, `DepartementMap`) et des synthèses de paire FR/EN,
~60 guides. Aucune lib de score modifiée. Cartes : seuls les fonds et accents décoratifs ont changé ; les points et
bulles restent sur `scoreHex` (8 axes, tous nommés pour une qualité), légende « 10 = meilleur » présente.
Synthèses `/comparer/[pair]/synthese` et `/compare/[pair]/synthesis` : même lib (`city-synthesis`), mêmes arrondis.

## Contrôle FR / EN (règle 2)

- 10 villes × global, 8 axes, `healthScore`, `stressComposite`, scores de niche : 0 écart. Global · sécurité · coût ·
  santé env. · stress env. : Bordeaux 6,9 · 5,1 · 4,5 · 4,9 · 5,1 — Poitiers 6,1 · 5,7 · 6,6 · 6,0 · 4,0 —
  Sarlat 5,5 · 6,1 · 5,9 · 6,1 · 4,0 — Fort-de-France 5,1 · 4,2 · 4,1 · 6,1 · 3,9 — Mamoudzou 3,0 · 3,2 · 4,6 · 5,6 · 4,4 —
  La Rochelle 7,2 · 6,5 · 4,6 · 5,4 · 4,6 — Annecy 7,3 · 7,3 · 3,1 · 6,3 · 3,7 — Briançon 5,8 · 6,3 · 5,3 · 6,2 · 3,9 —
  Marseille 3,8 · 2,7 · 5,4 · 3,1 · 6,9 — L'Haÿ-les-Roses (`extension`) 4,3 · 4,4 · 3,3 · 6,1 · 3,9.
- Sous-pages inversées à l'affichage (sécurité, air, santé, emploi, services publics, démographie) : FR `(10 - x).toFixed(1)`
  face à EN `Math.round((10 - x)*10)/10`, composite + dimensions, **593 villes, 8 302 valeurs, 0 écart d'arrondi**.
- Guides jumeaux `villes-les-plus-sures-de-france-2027` / `safest-cities-in-france-2027` : chaque note citée égale la note
  rendue (Annecy 7,3, Lannion 8,2, Marseille 2,7…), mêmes chiffres des deux côtés.

## Vérifié sans écart

Blocs `**Convention**` présents dans les 13 libs de hazard/qualité. `RANKING_EN` ↔ `RANKING_META` 19/19,
`REGION_EN_DESCRIPTIONS` 18/18. `tsc` propre ; `integrity`, `hreflang:check`, `search-index:check`, `sitemap:check`
(FR 17 833 / EN 3 991 URL) verts.

## À arbitrer (inchangé)

1. Faire passer `score_qualite_air` (proxy départemental) sur la mesure station quand elle existe.
2. `villes-pollution-air-chronique` et `villes-desert-services-publics` affichent toujours 0 ville.
