# Intégrité des données — 2026-11-13

**Résultat : 1 rang fabriqué corrigé sur `/leaderboard` (FR et EN), 1 compteur contradictoire corrigé. Aucune note
publiée n'a bougé ; FR et EN affichent les mêmes nombres sur tout l'échantillon.**

## Priorité : éditions du palmarès en avance — toujours soldée

`data/guides.ts` publie juillet → novembre 2026 ; décembre 2026 et janvier 2027 restent dans `data/palmares-drafts.ts`.
L'édition de novembre annonce la structure par âge, thème du brouillon de décembre. Aucun lien vers une édition retirée
(app, lib, data, components, scripts). Rien de futur n'est rendu.

## Ce qui a changé depuis le 09/11

Redesign « Couleurs » (leaderboard, comparateurs duo/trio FR et EN, hubs EN), guides (retraite, parent solo, série 2027).
Aucune lib de score modifiée.

## Contrôle FR / EN (règle 2)

- 10 villes × 16 valeurs (global, 8 axes, `healthScore`, `stressComposite`, scores de niche), rendu FR `toFixed(1)`
  face au rendu EN `Math.round(…*10)/10` : 0 écart. Global · sécurité · santé environnementale · stress environnemental :
  Lyon 7,1 · 5,1 · 5,3 · 4,7 — Nancy (moyenne) 6,2 · 5,1 · 6,4 · 3,6 — Obernai (petite) 8,4 · 8,6 · 7,2 · 2,8 —
  Saint-Pierre (DROM) 5,8 · 5,2 · 6,8 · 3,2 — Cayenne (DROM) 3,9 · 3,7 · 7,1 · 2,9 — Biarritz (littoral) 5,6 · 6,1 · 6,4 · 3,7 —
  Vannes 6,9 · 6,9 · 6,9 · 3,1 — Lille 5,7 · 3,9 · 6,2 · 3,8 — Gap (montagne) 6,0 · 5,9 · 6,1 · 3,9 —
  Gradignan (`extension`) 5,4 · 5,1 · 6,0 · 4,0.
- Comparateurs redessinés : `/comparer/[pair]` et `/compare/[pair]` (duo et trio) lisent les mêmes champs et calculent les
  profils (famille, télétravail, retraite, étudiant) avec les mêmes clés et la même moyenne. Sans écart.

## Corrigé

- **Leaderboard : rangs distincts pour des villes ex æquo** (convention des classements). Le score global n'a que 52
  valeurs sur 593 villes (palier le plus large : 46) ; la page numérotait `i + 1`, d'où Fontainebleau « 2ᵉ place » et
  Amboise « 3ᵉ place », toutes deux à 7,9, et cinq « 5ᵉ à 9ᵉ » à 7,7. Rang de compétition (`lib/tie-rank.ts`, zéro import)
  sur le podium (« 2ᵉ place ex æquo » / « 2nd place (tied) »), le tableau interactif FR (recalculé pour chaque tri et filtre),
  le tableau EN et les index compacts. JSON-LD : `ItemListUnordered` sans `position`, le top 20 ayant des ex æquo. Légende
  ajoutée sous les deux tableaux (10 = le meilleur ; ordre stable dans un palier, pas un départage).
- **JSON-LD FR « 9 critères »** alors que la liste qui suit et la page en donnent 8 : corrigé en 8.

## Vérifié sans écart

`RANKING_EN` ↔ `RANKING_META` 19/19, `REGION_EN_DESCRIPTIONS` 18/18, aucune clé orpheline. `tsc` propre ; `integrity`,
`hreflang:check`, `search-index:check`, `sitemap:check` verts.

## À arbitrer (inchangé)

1. Faire passer `score_qualite_air` (proxy départemental) sur la mesure station quand elle existe.
2. `villes-pollution-air-chronique` et `villes-desert-services-publics` affichent toujours 0 ville.
