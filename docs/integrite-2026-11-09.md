# Intégrité des données — 2026-11-09

**Résultat : 1 écart FR/EN corrigé (la page EN « honest review » ne montrait pas les mêmes notes que sa jumelle FR
pour 66 villes sur 593), plus 2 corrections d'affichage. Aucune note publiée n'a bougé.**

## Priorité : éditions du palmarès en avance — soldée

Toujours soldée (cf. 06/11) : `data/palmares-drafts.ts` garde décembre 2026 et janvier 2027, rien de futur n'est rendu.

## Ce qui a changé depuis le 06/11

Redesign « Couleurs » des hubs et pages régions, sport (hub, macro-régions, sous-page ville), parcs ; deux guides chiffrés
(salaires, pauvreté) ; aucune lib de score modifiée.

## Contrôle FR / EN (règle 2)

- Sport + 8 axes + global, **593 villes** : **8 302 contrôles** entre le rendu FR `toFixed(1)` et le rendu EN
  `Math.round(…*10)/10`, 0 écart (le composite sport est déjà arrondi dans le moteur, aucun axe n'a plus d'une décimale).
- Sous-pages ville : les 18 paires FR/EN dont les pages n'appellent pas les mêmes fonctions ont été relues une à une.
  Écoles et transports lisent tous deux `scores.schools` / `scores.transport`, sans écart. Écart réel sur une seule
  paire : avis honnête (ci-dessous).
- Échantillon (global · sécurité · sport · qualité de l'air affichée) : Paris 5,1 · 3,9 · 6,7 · 4,8 — Marseille 3,8 · 2,7 · 8,3 · 4,0 —
  Clermont-Ferrand 6,3 · 5,5 · 7,5 · 5,0 — Fort-de-France (DROM) 5,1 · 4,2 · 5,4 · 7,6 — La Rochelle (littoral) 7,2 · 6,5 · 6,2 · 6,3 —
  Briançon (montagne) 5,8 · 6,3 · 5,8 · 6,2 — Millau (petite) 5,6 · 6,3 · 6,5 · 6,8 — Quimper (moyenne) 6,3 · 6,1 · 7,0 · 6,8 —
  Annecy 7,3 · 7,3 · 8,5 · 4,7 — L'Haÿ-les-Roses (`extension`) 4,3 · 4,4 · 4,8 · 4,7.

## Corrigé

- **Avis honnête EN ≠ FR pour 66 villes.** `/cities/[slug]/honest-review` refaisait le tri des puces avec des libellés
  anglais. Le FR déduplique par libellé et fusionne l'axe Télétravail et le score owner Télétravail ; l'EN les gardait
  tous les deux (« Remote work », « Remote connectivity »), ce qui changeait la liste et les notes (Rennes : FR 9,9 · 9,0 · 8,2 · 8,1,
  EN 9,9 · 9,0 · 9,0 · 8,2). La page EN traduit maintenant la sortie de `buildHonestReview()` via `bulletTextEn()`.
  Mesuré : 0 ville divergente, aucune chaîne française qui fuit.
- **« Noise level » sur une note où 10 = calme** (règle 1) : le score owner `score_bruit` vaut 10 pour la ville la plus calme
  (« Calme sonore » en FR), mais l'EN l'appelait « Noise level ». Renommé en « Quietness ».
- **Page région FR, profil moyen** : les cinq tuiles portaient les clés anglaises (« Cost », « Safety »…) et aucune légende.
  Libellés français, plus la légende « 10 = le meilleur sur chaque axe (coût de la vie : 10 = le plus abordable) ».
- **Blocs `**Convention**`** ajoutés à `lib/cycling-mobility-rankings.ts`, `lib/sport-leisure-rankings.ts` et
  `lib/environment-index-rankings.ts` (tris déjà dans le bon sens).

## Vérifié sans écart

Les 20 libs de hazard ou de qualité portent leur bloc `**Convention**`. `RANKING_EN` ↔ `RANKING_META` 19/19,
`REGION_EN_DESCRIPTIONS` 18/18. `tsc` propre ; `integrity`, `hreflang:check`, `search-index:check`, `sitemap:check` verts.

## À arbitrer (inchangé depuis le 06/11)

1. Faire passer `score_qualite_air` (proxy départemental) sur la mesure station quand elle existe.
2. `villes-pollution-air-chronique` et `villes-desert-services-publics` affichent toujours 0 ville.
