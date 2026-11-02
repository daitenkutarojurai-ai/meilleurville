# Intégrité des données — 2026-11-02

**Résultat : 0 écart de chiffre FR/EN ; 6 libellés EN corrigés sur les hubs (dont un palier interverti).**

## Priorité : éditions du palmarès en avance — toujours soldée

Garde `palmarès` : 4 éditions publiées (juillet → octobre), aucune d'un mois futur, 3 brouillons
dans `data/palmares-drafts.ts` (novembre, décembre, janvier). Novembre est dû aujourd'hui (routine palmarès).

## Ce qui a changé depuis le 30/10

Deux moteurs passent sur données mesurées le 01/11 : santé (APL DREES + BPE Insee, `lib/city-healthcare.ts`)
et emploi (chômage RP, emploi local, salaires BTS, `lib/city-employment.ts`), avec un nouveau palier emploi
`sinistre`. Les deux libs portent leur bloc `**Convention**` ; le moteur garde 10 = pire, toutes les
surfaces (pages ville FR/EN, cartes, hubs, statistiques) inversent à l'affichage et disent « 10 = … ».

## Contrôle FR / EN (règle 2)

- Import réel des 10 moteurs (santé, emploi, environnement, services publics, démographie, bruit, eau,
  risques, air, sécurité) sur les **593 villes** (53 `extension`) : **55 742 contrôles** de rendu FR
  `toFixed(1)` vs EN `Math.round(…*10)/10`, brut et inversé : **0 écart**, **0 valeur hors [0, 10]**.
- Échantillon santé / emploi relu : Paris 8,2 / 6,6 · Lyon 7,7 / 6,6 · Rennes 7,6 / 6,1 ·
  Saint-Denis (Réunion) 7,7 / 4,2 · Biarritz 6,1 / 5,6 · Aurillac 6,3 / 5,0 · La Rochelle 6,9 / 5,3 ·
  Sedan 5,8 / 2,0 · Ozoir-la-Ferrière (extension) 5,7 / 5,5 — identiques des deux côtés.
- Niveaux : santé 207 facile / 369 correct / 17 tendu ; emploi 55 / 333 / 201 / 4 sinistré.

## Corrigé

- `/employment` (EN) : `facile` s'affichait « Active » et `actif` « Good » — le palier du dessous avait
  l'étiquette la plus flatteuse, et un même `actif` se lisait « Good » sur le hub, « Active » sur la fiche.
  Aligné sur la fiche ville : Favourable / Active / Strained / Depressed.
- Six hubs EN par macro-région (`employment`, `healthcare`, `demographics`, `environment`, `safety`,
  `public-services`) affichaient le libellé **français** de la lib (« Tendu », « Désert », « Vigilance »…)
  à côté du score. Ils reprennent la table EN de leur hub.

## Couverture

`RANKING_EN` ↔ `RANKING_META` 19/19 ; `REGION_EN_DESCRIPTIONS` 18/18. `tsc` propre, `integrity`,
`search-index:check`, `hreflang:check` verts ; `sitemap:check` vert (FR 32 651, EN 3 804) ; `parity` 0.

## À arbitrer

Rien de neuf. L'écart PM2.5 modèle / station (12/10) reste ouvert.
