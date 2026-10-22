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
| 1 | `famille-a-[ville]-2026` (+ `famille-au-mans-2026`) | `family-in-[city]-2026` | 20 | 19 | 60 | 🟢 |
| 2 | `retraite-a-[ville]-2026` | `retiring-in-[city]-2026` | 30 | 31 | 50 | 🟢 |
| 3 | `etudiant-a-[ville]-2026` | `studying-in-[city]-2026` | 40 | 23 (+1 guide national) | 60 | 🟢 EN d'abord (écart 17) |
| 4 | `vivre-sans-voiture-[ville]-guide-2026` | `car-free-living-in-[city]-2026` | 15 (+1 guide national) | 15 | 30 | 🟢 |
| 5 | `demenager-a-*` (close FR, 50) | `moving-to-[city]-2026` | 50 | 36 | 50 | 🟢 EN seule |
| 6 | `vivre-a-*` (close FR, 51) | `living-in-[city]-2026` | 51 | 45 | 51 | 🟢 EN seule |

### 1. famille-a — prochains lots
Déjà couvertes : lyon, nantes, bordeaux, toulouse, rennes, strasbourg, angers, lille, montpellier,
marseille, nice, caen, dijon, tours, metz, clermont-ferrand, orleans, pau, besancon, le-mans.
- Lot 1 : paris, grenoble, reims, saint-etienne, rouen, toulon, brest, nimes, limoges, amiens
- Lot 2 : perpignan, annecy, la-rochelle, poitiers, nancy, mulhouse, le-havre, avignon, vannes, chambery
- Lot 3 : villes moyennes à fort score Famille (compile l'axe famille depuis `lib/`, prends les 10 premières
  non couvertes, population ≥ 30 000).
Jumelles EN : `family-in-le-mans-2026` manque déjà ; ensuite chaque lot FR.

### 2. retraite-a — prochains lots
Déjà couvertes : 30 (liste dans CLAUDE.md, table « Nouvelles séries de guides per-city »).
- Lot 4 : biarritz, arcachon, saint-malo, annecy, aix-en-provence, avignon, nimes, beziers, narbonne, sete
- Lot 5 : quimper, lorient, saint-brieuc, colmar, bayonne, menton, antibes, cannes, frejus, dax

### 3. etudiant-a — EN d'abord
Jumelles EN manquantes (17) : rouen, reims, brest, orleans, metz, saint-etienne, le-mans, perpignan, pau,
la-rochelle, toulon, avignon, chambery, valenciennes, mulhouse, le-havre, nimes.
FR ensuite, lot 4 : annecy, vannes, lorient, quimper, colmar, troyes, la-roche-sur-yon, niort, cergy, evry-courcouronnes.

### 4. vivre-sans-voiture — FR puis EN
Seulement des villes avec un vrai réseau (tram/métro/BHNS, ou centre compact cyclable) : la donnée transports
du seed doit le montrer. Déjà couvertes (FR et EN) : paris, lyon, strasbourg, bordeaux, nantes, toulouse, grenoble, rennes, montpellier, nice, lille, clermont-ferrand, marseille, annecy, dijon. Candidates (villes à tram) : rouen, tours, angers, caen, brest, le-mans, orleans, reims, nancy, saint-etienne, le-havre, mulhouse, besancon, avignon.
clermont-ferrand, caen, brest, le-mans, orleans, reims.

### 5–6. EN seules
Liste des manques : diff des slugs de ville FR/EN (`grep -o 'slug: "demenager-a-[a-z-]*'` contre
`moving-to-`), en mappant les slugs hors gabarit documentés dans CLAUDE.md.

## Journal
- 2026-10-22 : file créée (session manuelle). Compteurs mesurés sur `main` @ 001f981.
