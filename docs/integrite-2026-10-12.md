# Intégrité des données — 2026-10-12

## Priorité : éditions du palmarès publiées en avance — déjà soldée, revérifiée

Le correctif est en place depuis le run du 2026-10-09 (`data/palmares-drafts.ts`, garde
`palmarès` dans `npm run integrity`, mécanisme décrit dans `CLAUDE.md` § R13.2). Revérifié ce run :
`GUIDES` ne porte que juillet → octobre 2026, les trois brouillons (novembre, décembre, janvier)
restent hors de toute surface rendue, la garde passe (« 4 éditions publiées, aucune d'un mois
futur · 3 brouillons non rendus »). Au 12/10, aucune édition n'est due avant le 2 novembre. Rien à
faire.

## Contrôle FR / EN (règle 2)

Seed à **589 villes** (49 en `scoreCohort: "extension"`, dont Carquefou ajoutée aujourd'hui).
Échantillon nommé : Lyon (métropole), Nantes, Limoges (ville moyenne), Figeac (petite), Mamoudzou
(DROM), Saint-Malo (littoral), Annecy et Briançon (montagne), Bezons (petite couronne),
**Carquefou** (cohorte d'extension). Le balayage porte en fait sur les 589 villes :

- 11 moteurs (air, démographie, emploi, santé, sécurité, services publics — inversés à
  l'affichage ; vélo, sport ; bruit, eau, risques — bruts), composite et chaque dimension, rendu
  FR `toFixed(1)` contre rendu EN `Math.round(x*10)/10` : **32 395 comparaisons, 0 écart, 0 valeur
  hors [0, 10]**.
- Sous-pages parent solo / single-parent (modifiées depuis le 09/10) : même lib
  (`parentSoloFit`), mêmes formats. Conforme.
- **Air mesuré (F63, nouveau depuis le 10/10)** : `AirMeasuredCard` (composant unique, branché sur
  `locale`), hubs `/qualite-de-l-air` et `/air-quality` (mêmes appels `rankAir` /
  `airNationalStats`, même `LIMIT`, mêmes seuils). Même nombre des deux côtés.

## Conventions (règles 1 et 3)

- Air modélisé : FR `(10 - x)` + « 10 = air le plus pur », EN `10 - composite` + « 10 = cleanest
  air ». Conforme.
- Air mesuré : valeurs brutes en µg/m³ (ou jours pour l'ozone), plus haut = pire, colorées par
  seuil OMS / UE et non par `scoreColor`. Conforme.
- **Corrigé** : `lib/city-air.ts` et `lib/air-measured-ranking.ts` n'avaient pas de bloc
  `**Convention**` — ajouté (mesures brutes, jamais de /10, jamais la palette 10 = vert, même
  précision FR/EN, et le rappel que le score modélisé est un autre nombre). Les 17 autres libs de
  score l'ont.

## Couverture

- `RANKING_EN` ↔ `RANKING_META` : 19/19, zéro orpheline. `REGION_EN_DESCRIPTIONS` ↔ régions du
  seed : 18/18, zéro orpheline.
- `assertUniqueSlugs` FR/EN : vert (`npm run integrity`). `sitemap:check` vert (FR 31 605 URL,
  EN 31 197). `hreflang:check`, `search-index:check` verts.
- JSON de pipeline face aux 589 villes : seule **Carquefou** (ajoutée ce jour) manque partout
  (biodiversité, côte, parcs, news, prix, zones protégées, vote, photos) — attendu, la prochaine
  passe locale la prendra ; `city-air.json` la tient pour non évaluée, donc la carte est masquée
  au lieu d'annoncer « aucune station ». Les autres trous sont connus et documentés (Filosofi hors
  Antilles-Guyane-Mayotte, Pierrefitte fusionnée, Vesoul sans photo).

## À arbitrer (non corrigé — déplacerait un score publié)

**Le score PM2.5 modélisé contredit la mesure en station sur la même page, pour 80 villes.**
Sur `/villes/[slug]/air` (et la jumelle EN), le modèle affiche « particules fines **8,0/10** »
(niveau faible) au-dessus d'une carte « Mesuré en station » qui donne une moyenne 2025 **au-dessus
de la limite européenne de 2030** (10 µg/m³) : 80 villes sur les 434 où une station PM2.5 existe,
**77 en Île-de-France** (Puteaux 11,8 µg/m³ à 0,8 km de la station, Gennevilliers 10,3 à 0,5 km,
Suresnes 11,8, Bezons 11,8, Montrouge 11,5…) plus Senlis, Chantilly et Abbeville. Corrélation de
rang modèle/mesure : **0,18** sur PM2.5 (310 villes, station ≤ 10 km), 0,39 sur NO₂, 0,27 sur
l'ozone.

Cause : `pm25Risk()` (`lib/air-quality.ts`) ne relève le risque que pour une vallée froide, un
département « industriel », une commune de plus de 50 000 habitants ou taguée « métropole ». Une
commune de petite couronne de 30 000 habitants, au cœur de l'agglomération parisienne, tombe dans
la branche par défaut (2,0, « faible »). Aucun contresens de direction : c'est le modèle qui est
faux sur cette géographie, et la page dit bien qu'il s'agit d'un modèle — mais elle affiche deux
verdicts opposés sur le même polluant.

Correction proposée (à arbitrer, change ~80 scores publiés et le composite air) : là où
`cityAirMeasures(slug).pm25` existe avec une station ≤ 10 km, dériver la dimension PM2.5 de la
mesure (paliers OMS 5 / UE 2030 10 / UE 25) au lieu de l'heuristique ; à défaut, traiter
« agglomération » sur l'aire urbaine et non sur la population communale. Même réflexion possible
pour NO₂, où aucune contradiction franche n'apparaît (0 ville affichée ≥ 7/10 et mesurée > 20).

Mineur, non corrigé : la carte de ville imprime « 13 µg/m³ » là où la liste du hub imprime
« 13,0 » (`minimumFractionDigits`) — même nombre, identique FR/EN.

Contrôles : `npx tsc --noEmit` propre, `npm run integrity`, `sitemap:check`,
`search-index:check`, `hreflang:check` — tous verts. `npm run build` non lancé.
