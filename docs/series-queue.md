# File des séries de guides par ville (routine `meilleurville-series-villes`)

Créée le 2026-10-22. Le propriétaire veut « livrer le plus de contenu neuf possible ». Cette file dit à la
routine `meilleurville-series-villes` (3 runs par jour) quelle série écrire, dans quel ordre et pour quelles
villes. Comment écrire un lot : skill `.claude/skills/guide-batch/`.

## Règles de la file
1. Prends la **première série ouverte** (statut 🟢) dont le compteur mesuré est sous la cible.
2. **Alternance FR/EN** : quand une série FR a 8 guides d'avance ou plus sur sa jumelle EN, le run suivant est
   le lot EN de cette série. Sinon la série FR continue.
3. Lot : **6 à 10 guides**. Une ville qui ne passe pas le filtre anti-page-mince du skill est notée
   « reportée » ici, avec la raison, et sortie du lot.
4. Mets à jour le compteur **mesuré** (`grep -c`), les villes livrées et le prochain lot à chaque run.
5. Ne touche pas aux séries d'autres routines : `10-choses-a-faire-*` / `things-to-do-in-*` (guides-tourisme),
   `parent-solo-a-*` / `single-parent-in-*` (parent-solo), `solo-travel-in-*` et les profils vacances
   (vacances-celibataire / vacances-monoparental), le palmarès. Les séries closes de CLAUDE.md
   (`vivre-a-*`, `demenager-a-*`, `travail-a-*`, `universites-*`) ne se rouvrent pas côté FR ; leurs jumelles
   EN manquantes peuvent s'écrire (c'est de la parité, pas du volume).
6. `budget-mensuel-realiste-*` reste fermée : les sous-pages `/villes/[slug]/cout-de-la-vie` visent déjà la
   requête (décision du 2026-10-18). `quartiers-a-eviter-*` reste écartée (décision du 2026-07-28).

## Séries, par priorité

| # | Série FR | Jumelle EN | FR mesuré | EN mesuré | Cible | Statut |
|---|---|---|---|---|---|---|
| 1 | `famille-a-[ville]-2026` (+ `famille-au-mans-2026`, `famille-au-havre-2026`) | `family-in-[city]-2026` | 34 | 33 | 60 | 🟢 FR lot 3 ensuite (écart 1 : le-mans reportée) |
| 2 | `retraite-a-[ville]-2026` | `retiring-in-[city]-2026` | 30 | 31 | 50 | 🟢 |
| 3 | `etudiant-a-[ville]-2026` | `studying-in-[city]-2026` | 40 | 40 (+1 guide national) | 60 | 🟢 parité atteinte, FR lot 4 ensuite |
| 4 | `vivre-sans-voiture-[ville]-guide-2026` | `car-free-living-in-[city]-2026` | 15 (+1 guide national) | 15 | 30 | 🟢 |
| 5 | `demenager-a-*` (close FR, 50) | `moving-to-[city]-2026` | 50 | 36 | 50 | 🟢 EN seule |
| 6 | `vivre-a-*` (close FR, 51) | `living-in-[city]-2026` | 51 | 45 | 51 | 🟢 EN seule |

### 1. famille-a — prochains lots
Déjà couvertes : lyon, nantes, bordeaux, toulouse, rennes, strasbourg, angers, lille, montpellier,
marseille, nice, caen, dijon, tours, metz, clermont-ferrand, orleans, pau, besancon, le-mans.
- Lot 1 : ✅ livré 2026-10-22 pour grenoble, reims, rouen, brest, saint-etienne, limoges, amiens (7). Restent : paris, toulon, nimes (non écrites ce run, pas faute de données ; à faire au lot suivant).
- Lot 2 : ✅ livré 2026-10-22 pour perpignan, annecy, la-rochelle, poitiers, nancy, vannes, le-havre (7, slug `famille-au-havre-2026`). Reportées : mulhouse (pas de prix DVF, Alsace), avignon, chambery (non écrites ce run, données suffisantes).
- Lot 3 : villes moyennes à fort score Famille (compile l'axe famille depuis `lib/`, prends les 10 premières
  non couvertes, population ≥ 30 000).
Jumelles EN : ✅ les 7 du lot 1 livrées le 2026-10-22 (run suivant). Reste `family-in-le-mans-2026`, **reportée** : le guide FR `famille-au-mans-2026` (juillet) porte des fourchettes non sourcées (maison 250 000 €, budget 1 940–2 550 €, Paris à 56 min) ; à réécrire d'abord côté FR sur chiffres lus par module, puis la jumelle. Écart FR→EN = 1 → **le prochain run sur cette série est le lot FR 2**.

### 2. retraite-a — prochains lots
Déjà couvertes : 30 (liste dans CLAUDE.md, table « Nouvelles séries de guides per-city »).
- Lot 4 : biarritz, arcachon, saint-malo, annecy, aix-en-provence, avignon, nimes, beziers, narbonne, sete
- Lot 5 : quimper, lorient, saint-brieuc, colmar, bayonne, menton, antibes, cannes, frejus, dax

### 3. etudiant-a — parité EN atteinte le 2026-10-22
✅ Les 17 jumelles EN manquantes sont livrées (session manuelle) : rouen, reims, brest, orleans, metz, saint-etienne,
le-mans, perpignan, pau, la-rochelle, toulon, avignon, chambery, valenciennes, mulhouse, le-havre, nimes.
Mêmes chiffres que les guides FR (contrôle mécanique des nombres passé) ; ajouts propres au lecteur étranger : droits
différenciés hors UE « environ 2 900 € / 3 950 € » (les sources divergent à quelques euros, montant exact non cité),
bourse Crous fermée aux non-UE, APL et Visale ouvertes, plafond de 964 h de travail par an.
FR ensuite, lot 4 : annecy, vannes, lorient, quimper, colmar, troyes, la-roche-sur-yon, niort, cergy, evry-courcouronnes.

### 4. vivre-sans-voiture — FR puis EN
Seulement des villes avec un vrai réseau (tram/métro/BHNS, ou centre compact cyclable) : la donnée transports
du seed doit le montrer. Déjà couvertes (FR et EN) : paris, lyon, strasbourg, bordeaux, nantes, toulouse, grenoble, rennes, montpellier, nice, lille, clermont-ferrand, marseille, annecy, dijon. Candidates (villes à tram) : rouen, tours, angers, caen, brest, le-mans, orleans, reims, nancy, saint-etienne, le-havre, mulhouse, besancon, avignon.
clermont-ferrand, caen, brest, le-mans, orleans, reims.

### 5–6. EN seules
Liste des manques : diff des slugs de ville FR/EN (`grep -o 'slug: "demenager-a-[a-z-]*'` contre
`moving-to-`), en mappant les slugs hors gabarit documentés dans CLAUDE.md.

## Journal
- 2026-10-22 : studying-in EN 23 → 40 (+17), parité etudiant-a atteinte. Corrigé au passage dans `etudiant-a-saint-etienne-2026` : « la moins chère de cette série » était faux depuis le guide Valenciennes (studio 360 € contre 420 €).
- 2026-10-22 : file créée (session manuelle). Compteurs mesurés sur `main` @ 001f981.
- 2026-10-22 (run séries) : famille-a lot 1, +7 guides FR (grenoble, reims, rouen, brest, saint-etienne, limoges, amiens). Compteur mesuré FR 27 (`famille-a*`), EN 19. Chiffres lus par module (CITIES_SEED rendu, housing, DVF, Filosofi, Insee 2022) ; faits nommés recoupés par recherche web (téléphérique de la Bastille, Océanopolis/téléphérique de Brest, hortillonnages, Cité du design, tram A/B de Reims, Jardin des plantes de Rouen). Reportées au lot suivant : paris, toulon, nimes. tsc, integrity, search-index(:check), sitemap:check verts.
- 2026-10-22 (run séries, 13h40 UTC) : family-in EN +7 (grenoble, reims, rouen, brest, saint-etienne, limoges, amiens). Mêmes chiffres que les guides FR, 6 sections, incises voyageur étranger (T3, carte scolaire, DVF), pas de `relatedGuides` (champ absent du type EnGuide). Compteurs mesurés FR 27, EN 26. Reportée : le-mans (voir plus haut). tsc, integrity, search-index(:check) verts ; aucun tag neuf.
- 2026-10-22 (run séries, 3e) : famille-a lot 2, +7 guides FR (perpignan, annecy, la-rochelle, poitiers, nancy, vannes, le-havre). Compteur mesuré FR 34 (`famille-a*`, + famille-au-havre), EN 26 → le prochain run est le lot EN (7 jumelles). Chiffres lus par module ; faits nommés recoupés par recherche web ; pas de tarif ni d'horaire ; « accessible depuis » pour Canet, Futuroscope, Villers-lès-Nancy, île de Ré, îles du golfe, Étretat. tsc, integrity, search-index(:check) verts.
- 2026-10-24 (run séries) : family-in-* EN lot 2, +7 jumelles (perpignan, annecy, la-rochelle, poitiers, nancy, vannes, le-havre). Compteurs mesurés FR 34, EN 33 (reste family-in-le-mans-2026, reportée, voir plus haut) → le prochain run est le lot FR 3 (villes moyennes à fort score Famille, ≥ 30 000 hab. ; paris, toulon, nimes, avignon, chambery restent candidates). Mêmes chiffres que les guides FR, 6 sections, pas de `relatedGuides` (absent du type EnGuide). tsc, integrity, search-index(:check), sitemap:check verts (EN 32 080 URL) ; aucun tag neuf.
