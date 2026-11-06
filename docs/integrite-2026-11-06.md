# Intégrité des données — 2026-11-06

**Résultat : 0 écart de chiffre FR/EN. Deux corrections d'affichage : la qualité de l'air apparaissait
deux fois sur la fiche ville avec deux notes différentes, et la page tension locative ne disait pas ce que vaut 10.**

## Priorité : éditions du palmarès en avance — soldée

5 éditions publiées (juillet → novembre). Novembre est sorti à temps et annonce décembre (structure par âge),
qui est bien le brouillon de décembre. `data/palmares-drafts.ts` contient décembre et janvier. Aucune référence
à `palmares-decembre-2026` / `palmares-janvier-2027` hors du fichier de brouillons.

## Ce qui a changé depuis le 02/11

L'air passe sur données mesurées le 04/11 (`0b9cba0` : station de fond ≤ 10 km, 279 villes 3/3, 112 partielles,
202 estimées). Les pages ville et les hubs ont été redessinés (tension locative, fiscalité, parcs, risques, environnement).

## Contrôle FR / EN (règle 2)

- Air + index environnement, import réel, **593 villes** (dont 53 `extension`) : **4 744 contrôles** entre le rendu
  FR `toFixed(1)` et le rendu EN `Math.round(…*10)/10` (composite, NO2, PM2.5, ozone, pollens, santé env., stress env.).
  **0 écart, 0 valeur hors de [0, 10]**, et `environment-index.air === air.composite` pour toutes les villes.
- Les deux pages air (FR `/villes/x/air`, EN `/cities/x/air-quality`) et `AirQualityCard` appellent le même `computeAirQuality`.
- Échantillon (global · sécurité · air · env.) : Paris 5,1 · 3,9 · 4,8 · 5,9 — Lyon 7,1 · 5,1 · 4,0 · 5,3 —
  Grenoble 6,8 · 4,3 · 4,6 · 5,7 — Saint-Denis (Réunion) 5,7 · 4,9 · 7,2 · 7,0 — Biarritz 5,6 · 6,1 · 7,4 · 6,4 —
  Briançon 5,8 · 6,3 · 6,2 · 6,2 — Aurillac 5,6 · 6,1 · 6,2 · 7,3 — Nice 5,4 · 5,1 · 3,3 · 3,0 —
  Sedan 6,3 · 6,5 · 7,2 · 7,6 — Vallauris (extension) 5,4 · 5,6 · 3,4 · 4,8.

## Corrigé

- **Deux « Qualité de l'air » sur une même fiche ville.** `OwnerScoresCard` affiche `score_qualite_air`, un proxy
  calculé sur le PM2.5 moyen du département (ATMO 2023), et `AirQualityCard` affiche plus bas la note mesurée.
  Écart ≥ 2 points pour **132 villes**, ≥ 3 points pour 13 (Nice 6,5 contre 3,3 ; Valence 7,0 contre 3,8 ; Annonay
  7,0 contre 3,6). L'étiquette dit désormais l'échelle : « Qualité air (moyenne du département) » /
  « Air quality (department average) », « moyenne nationale » pour le repli. Aucune note n'a bougé.
- **Tension locative (FR + EN)** : un score /10 sans légende. Ajout de « 10 = marché le plus tendu » /
  « 10 = tightest market ». La couleur suit déjà le niveau, pas la palette globale.

## Vérifié sans écart

Les 15 libs de hazard ou de qualité portent leur bloc `**Convention**`. Pages risques FR/EN : légende
« 10 = exposition maximale » et palette par niveau identique des deux côtés. `RANKING_EN` ↔ `RANKING_META` 19/19,
`REGION_EN_DESCRIPTIONS` 18/18. `tsc` propre ; `integrity`, `search-index:check`, `hreflang:check` et
`sitemap:check` (EN 3 863) verts.

## À arbitrer (ce qui déplace un score publié)

1. **Faire passer `score_qualite_air` sur la mesure.** Le proxy départemental reste utilisé par `/classements/qualite-air`,
   les avis honnêtes, deux thèmes Red Flag et la page télétravail, alors que `/qualite-de-l-air` et les pages air
   utilisent la station. Sur les 39 villes publiées dans `/classements/qualite-air`, aucune n'est « élevée » en mesure,
   mais 17 sont « modérées » (Brest : 8,5 dans le classement contre 6,1 sur sa page air). Correction proposée :
   `qualiteAir()` lit `10 − computeAirQuality(c).pm25.score` quand `pm25.measured`, et garde le proxy sinon.
2. **`villes-pollution-air-chronique` et `villes-desert-services-publics` affichent toujours 0 ville**
   (signalé depuis le 14/08). Le proxy air ne descend jamais sous 5,5 alors que le filtre est ≤ 5. La mesure
   offre maintenant un filtre propre : niveau `eleve`/`fort`, soit **74 villes**. C'est une liste nominative,
   il faut une relecture éditoriale.
3. L'écart PM2.5 modèle / station signalé le 12/10 est en grande partie résorbé par `0b9cba0` : il ne reste
   que les 202 villes sans station proche.
