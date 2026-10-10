# Extension du seed — inventaire, procédure, backlog, journal

Mémoire de l'agent « extension du seed » (ROADMAP § « Vague 4 — extension du seed », F34 puis
F35). À relire **en entier** avant chaque lot. Objectif : couvrir plus de communes que les 540
d'origine, un lot par run, **sans jamais publier une ville à moitié remplie ni un chiffre
inventé**.

---

## 1. Ce que « ville complète » veut dire (inventaire du 2026-10-06)

Une ville est une ligne de `data/cities-seed.ts` **plus** une quinzaine de jeux de données par
slug. Mesuré en lisant les lecteurs et les pages, pas en le supposant : **aucun fichier ne fait
planter le build ni une page quand un slug y manque** — tous les accès passent par `?? null`,
`?? []` ou `undefined` contrôlé, et les sous-pages conditionnelles (parcs, biodiversité) ne sont
générées que pour les villes présentes (`generateStaticParams` filtré + `dynamicParams = false`,
sitemap sur le même prédicat).

| Fichier | Lecteur | Générateur | Exécutable depuis une routine ? | Quand la ville manque |
|---|---|---|---|---|
| `data/cities-seed.ts` | partout | à la main | oui | — (c'est la ville) |
| `data/housing.ts` | `getHousing` + ~10 libs | à la main | oui | sections masquées (`housing && …`) **mais** `teletravail` / `remote-work` affichent un repli `?? 800 €` et deux red flags `?? 0 €/m²` → **obligatoire** |
| `data/neighborhoods.ts` | `getNeighborhoods` (`?? []`) | à la main | oui | `/quartiers` rendue avec l'écran vide → **obligatoire** (2-3 quartiers) |
| `data/city-population.json` | `lib/city-population` | `npm run population` | **non** (insee.fr 403) | repli sur `population` du seed (statistiques, démographie), tendance départementale |
| `data/city-income.json` | `lib/city-income` | `npm run income` | **non** | bloc masqué |
| `data/city-property-prices.json` | `lib/property-prices` | `npm run property-prices` | **non** (DVF) | `PropertyPriceTable` rend `null` |
| `data/city-coast.json` | `lib/city-coast` (`?? null`) | `npm run coast` | **non** (Natural Earth) | City Match : terrain neutre ; agenda : **corrigé** (cf. § 4) |
| `data/city-parks.json` | `lib/city-parks` | `npm run parks` | **non** (Overpass) | `/parcs` non générée, absente du sitemap |
| `data/city-images.json` + `city-cards.json` | `lib/city-images`, `lib/city-cards` | `npm run photos` | **non** (Wikidata/Commons) | pas de photo, rien d'autre |
| `data/city-postal-codes.json` | `SearchPalette`, `VillesSearch` (`?? []`) | **aucun générateur au dépôt** | — | la recherche par code postal ne trouve pas la ville |
| `data/climate-normals-raw.json` | `lib/climate-normals` | aucun (29 stations) | — | pas par ville : station la plus proche, sans distance max |
| `data/political-lean.json` | `lib/political-lean` (`?? null`) | `python scripts/build-political-lean.py` | **non** | composant `null` (cadre d'accent vide dans `CityProfile`, cosmétique) |
| `data/city-biodiversity.json` | `lib/biodiversity` | `npm run biodiversity` | **non** (GBIF) — runner local | `/biodiversite` non générée |
| `data/city-news.json` | `lib/city-news` (`[]`) | `npm run news` | **non** (BODACC) — runner local | section absente |
| `data/city-protected-areas.json` | `lib/biodiversity` | `npm run protected-areas` | **non** (BD TOPO) — runner local | `null`, absente du classement |

Tables en dur dans `lib/` : `lib/fiscalite.ts` (`DEPT_TIER[dept] ?? "moderee"` — un **département
nouveau** reçoit en silence le palier « modéré »), `lib/score-calibration.ts` (`DEPT_SAFETY_BIAS`,
`DEPT_COST_BIAS`, appliqués automatiquement aux villes sans override), `lib/healthcare-access.ts`
(`CHU_SITES` par distance : rien à faire, sauf qu'une **homonymie de nom** avec une ville CHU
casserait la garde `CHU` de `npm run integrity`, qui indexe le seed par nom). `lib/dept-slug.ts`
exige un `inseeCode` sur chaque ville.

**Egress depuis une routine (testé le 2026-10-06)** : `geo.api.gouv.fr`, `insee.fr`,
`files.data.gouv.fr`, `data.gouv.fr`, `overpass-api.de`, `wikidata`, `commons` → **403 CONNECT** ;
`WebFetch` bloqué aussi sur `insee.fr`, `citypopulation.de`, `banatic.interieur.gouv.fr`.
**Seule la recherche web fonctionne.** Conséquence : en routine, une ville ne peut porter que les
champs du seed, `housing.ts` et `neighborhoods.ts` ; tout le reste vient du runner local (§ 3).

### Les deux catégories de champs

- **Obligatoires avant d'entrer au seed** (sinon la ville attend) : slug, nom, région, département,
  `inseeCode`, population, lat/lng, altitude, `sunshinedays` / `avgTempJuly` / `avgTempJanuary`,
  `characterTags`, les 8 notes brutes, `descriptionEn` / `seoTitleEn` / `seoDescriptionEn`, une
  entrée `housing.ts`, 2-3 quartiers dans `neighborhoods.ts`.
- **Complétés par le runner local après coup** (la page dégrade proprement d'ici là) : population
  Insee 2011/2016/2022 + âges, Filosofi, DVF, littoral, parcs, photos, biodiversité, actualité,
  zones protégées. Codes postaux et orientation politique : **pas de pipeline automatique** —
  manque assumé, la ville n'est simplement pas trouvée par code postal et n'a pas de bloc politique.

---

## 2. Effet de bord sur les notes des autres villes

`normalizeDistribution` est un z-score sur **tout** le corpus : chaque ajout déplace moyenne et
écart-type de chaque axe, donc la note rendue de toutes les autres villes, au dixième près pour
celles qui sont à la frontière d'un arrondi. Mesure, avant chaque commit de lot :

```bash
npx tsx --tsconfig tsconfig.json scripts/seed-drift.ts          # arbre de travail vs HEAD
```

Il imprime l'écart max / médian (global + 8 axes) sur les villes existantes, la liste des villes
dont une note arrondie change, les citations « x,y/10 » des guides FR/EN qui reprennent une
ancienne note d'une ville nommée juste avant (candidates, heuristique), et les `seoDescriptionEn`
du seed dont le « quality-of-life score x.y/10 » ne vaut plus la note globale rendue (502 villes en
portent un, **502/502 alignées** au 2026-10-06, et **aucune garde ne le vérifie** ailleurs).
`npm run integrity` contrôle en plus les citations brutes-vs-rendues des guides.

**Depuis le lot 1, la dérive est nulle par construction** : le premier essai (4 communes, sans
cohorte) changeait la note arrondie de **522 villes sur 540** (sécurité : 491, global : 191, écart
max 0,1) et produisait **1 018 citations de guides candidates** — un incident du 2026-08-10 par
lot. `lib/score-distribution.ts` prend désormais ses moments sur la **cohorte d'origine** et toute
ville ajoutée porte **`scoreCohort: "extension"`** : elle est notée sur la même échelle sans la
déplacer, et les 540 rendent à l'octet près ce qu'ils rendaient. Le script reste le contrôle
obligatoire : il doit afficher **0 ville changée** ; sinon un champ `scoreCohort` manque.

---

## 3. Procédure d'un lot (5 à 8 communes, 3 si les sources résistent)

```bash
git checkout main && git pull --rebase origin main
npm install                        # le conteneur démarre sans node_modules
node scripts/seed-coverage.mjs     # état de couverture de chaque jeu de données
```

### 3.1 Identité (recherche web, recoupée)

Pour chaque commune : `inseeCode`, département, région, population, coordonnées, altitude. Depuis
une routine, seule la recherche web répond : **chaque population doit être donnée par deux résultats
indépendants** (ex. fiche Wikipédia FR qui cite le recensement + site tiers). Le seed porte une
population **approximative** (arrondie à la centaine, millésime le plus récent concordant) — c'est
son statut dans tout le corpus ; la population Insee exacte 2011/2016/2022 arrive avec
`npm run population` (runner local). ⚠️ Les synthèses de la recherche web se trompent : une passe a
donné Clamart à 82 505 hab. (le vrai ordre de grandeur est 58 000). Un chiffre isolé ne passe pas.
L'absence au seed se vérifie **par code Insee** (`grep 'inseeCode: "XXXXX"' data/cities-seed.ts`),
jamais par nom. Altitude : milieu de la fourchette min/max publiée (convention de ce journal).

### 3.2 Notes brutes des 8 axes — dérivées, jamais au jugé

Règle appliquée depuis le lot 1 : **médiane des notes brutes des 4 villes du seed les plus proches
à vol d'oiseau, dans le même département, entre 20 000 et 150 000 hab., hors villes à override**
(`lib/score-calibration.ts` → `OVERRIDES`), arrondie au dixième. Pourquoi ces filtres : les villes
à override n'ont pas de note brute effective (l'override l'écrase), et le même département garantit
que la nouvelle ville reçoit les **mêmes biais départementaux** (`DEPT_SAFETY_BIAS`,
`DEPT_COST_BIAS`) que ses comparables ; la fourchette de population évite les ajustements de taille
(< 30 000 / > 400 000) que les voisines n'auraient pas. Le `global` brut est recalculé par
`calibrateScores` (valeur du seed ignorée) — écrire la moyenne pondérée de `recomputeGlobal` par
cohérence. Le calcul se rejoue avec le script de scratch décrit au journal ; chaque ville y liste
ses 4 voisines et leurs notes.

**Limite connue** : la règle n'est valable que là où le seed est dense. Une ville qui ne ressemble
pas à ses voisines (Villeneuve-d'Ascq, ville universitaire et technopole entourée de Roubaix /
Tourcoing / Wattrelos) en hériterait des notes : elle **attend** un override documenté dans
`score-calibration.ts` plutôt que de recevoir une médiane fausse.

### 3.3 Climat, logement, quartiers

- `sunshinedays` / `avgTempJuly` / `avgTempJanuary` : ceux de la **ville du seed la plus proche**
  (même station Météo-France de référence à l'échelle de quelques km) ; les normales affichées
  viennent de toute façon de `lib/climate-normals.ts` (station la plus proche).
- `housing.ts` : **médiane des 4 mêmes voisines**, arrondie à 10 € (loyers) et 100 € (m²) — le
  corpus est un repère éditorial cohérent entre voisines, et c'est cette cohérence qu'on reproduit.
  Un ordre de grandeur de marché est recoupé par recherche web et l'écart noté au journal ; la
  médiane DVF réellement enregistrée arrive avec `npm run property-prices` et s'affiche séparément.
- `neighborhoods.ts` : 2 quartiers **réels**, résumé factuel sans verdict. **Aucune donnée
  infra-communale au dépôt** : leurs notes recopient les notes brutes de la ville (global, sécurité,
  transports, nature, coût ; `nightlife` = culture) et leur loyer T2 celui de la ville. Pas de
  différenciation inventée entre quartiers.
- `characterTags` : faits vérifiables (préfecture, lignes de transport, équipement majeur). ⚠️ Éviter
  les sous-chaînes que des prédicats lisent : `côte`, `mer`, `plage`, `littoral`, `port`
  (cf. `lib/city-agenda.ts`, City Match).
- **`scoreCohort: "extension"`** sur chaque nouvelle ville (§ 2). Oubli = dérive de tout le corpus.
- `seoDescriptionEn` : le gabarit du corpus cite « quality-of-life score x.y/10 » = **note globale
  rendue**, lue après ajout (`CITIES_SEED`), jamais la valeur brute.

### 3.4 Contrôles avant commit

```bash
npx tsx --tsconfig tsconfig.json scripts/seed-drift.ts
npx tsc --noEmit
npm run integrity
npm run search-index && npm run search-index:check   # SEARCH_CITIES porte les villes
npm run sitemap:check
npm run hreflang:check
node scripts/seed-coverage.mjs
```

**Jamais `npm run build`** (4 h 30, ~33 Go, ENOSPC muet en session cloud). Recompter la table des
couleurs de `CLAUDE.md` en exécutant `CITIES_SEED` et mettre à jour les compteurs « 540 ».
Nouvelle région → `REGION_EMOJIS` / `REGION_DESCRIPTIONS` (`CLAUDE.md` § Adding a new city).
Nouveau département → vérifier `lib/fiscalite.ts` `DEPT_TIER` et `lib/dept-slug.ts`.

### 3.5 Après le push : le runner local

`scripts/local-data-runner.sh` (cron sur la machine du propriétaire, 02h20 / 14h20 UTC) relance
depuis le 2026-10-06 **population, income, property-prices, coast, parks, photos** dès que
`node scripts/seed-coverage.mjs --needs=<pipeline>` signale une ville du seed absente de leur
sortie (manques permanents connus exclus : Mamoudzou, Pierrefitte, Vesoul…). Biodiversité et
actualité servent d'eux-mêmes les villes absentes ; l'ingest des zones protégées est relancé aussi
quand le seed porte une ville absente du JSON. Sa cible de couverture est **comptée dans le seed**,
plus un `540` en dur. Les prochains runs vérifient l'arrivée des données avec
`node scripts/seed-coverage.mjs`.

---

## 4. Bloqueurs levés au run 1 (2026-10-06)

- `scripts/local-data-runner.sh` : `TARGET_CITIES=540` en dur (aurait déclaré complets des
  pipelines qui n'ont jamais vu les nouvelles villes) ; aucun des six pipelines « population →
  photos » n'était rejoué ; l'ingest des zones protégées ne voyait pas une ville ajoutée.
- `lib/city-agenda.ts` : une ville taguée « mer » **sans** distance mesurée recevait une saison
  balnéaire (`km == null || …`) — désormais seulement sur distance mesurée.
- `lib/city-match.ts` : « mer à 0 km » quand la distance manquait — désormais aucune mention.
- « 540 » affiché en dur comme taille du corpus : remplacé par `CITIES_SEED.length` /
  `CITIES_COUNT` dans 18 surfaces (badges, hubs EN, City Match, Future You, parent solo, week-end,
  red flags EN, départements). Les « 540 » restants sont des **mesures datées** (« mesuré sur les
  540 villes », « 538 des 540 villes couvertes ») : vraies du corpus qu'elles décrivent, à
  réécrire par le run qui refait la mesure, pas à dériver mécaniquement.

---

## 5. Backlog

Absence vérifiée **par code Insee** pour le lot en cours et le suivant ; pour le reste, absence
constatée **par nom** (à reconfirmer par code Insee avant d'entrer dans un lot — homonymes DROM).
Populations : seulement quand recoupées, sinon « à mesurer ».

### 50 000 – 100 000 hab. absentes du seed

| Commune | Insee | Dép. | Région | Pop. (année, source) | Statut |
|---|---|---|---|---|---|
| Villejuif | 94076 | Val-de-Marne | Île-de-France | 60 183 (2023, Wikipédia FR + 2ᵉ résultat) | **lot 1** |
| Clamart | 92023 | Hauts-de-Seine | Île-de-France | 58 576 (2023, Wikipédia FR + 2ᵉ résultat) | **lot 1** |
| Bobigny | 93008 | Seine-Saint-Denis | Île-de-France | 56 927 (2023, Wikipédia + bien-dans-ma-ville) | **lot 1** |
| Épinay-sur-Seine | 93031 | Seine-Saint-Denis | Île-de-France | 52 833 (2023, Wikipédia FR ; 52 606 ville-data) | **lot 1** |
| Villeneuve-d'Ascq | 59009 (à confirmer) | Nord | Hauts-de-France | à mesurer | **attend un override** (§ 3.2) |

### 20 000 – 50 000 hab. — candidats (absents par nom)

~~Montrouge, Meudon, Vanves, L'Haÿ-les-Roses, Thiais, Livry-Gargan, Villepinte~~ (**lot 2**),
Villeneuve-Saint-Georges (94078, **attend un override** : ses voisines 94 du seed sont à 4,7-8 km
et ne lui ressemblent pas, ses vraies voisines sont en Essonne), ~~Gagny,
Clichy-sous-Bois, Romainville, Villemomble, Ris-Orangis~~ (**lot 3**) ; ~~Fontenay-aux-Roses, Chaville, Joinville-le-Pont, Les Pavillons-sous-Bois,
Neuilly-Plaisance~~ (**lot 4**) ; ~~Orly, Saint-Gratien, Vigneux-sur-Seine, Herblay-sur-Seine, Taverny,
Maisons-Laffitte, Gradignan~~ (**lot 5**) ; mesurées le 2026-10-10, règle valable, non retenues faute de place :
Sucy-en-Brie (94, voisines 3,9-7,5 km), Eysines (33, 4,3-8,5 km) ; mesurées le 2026-10-10 et **reportées** :
Villeneuve-le-Roi, Limeil-Brévannes (plus proche voisine en Essonne), Cenon (rive droite, voisines rive gauche),
Saint-Sébastien-sur-Loire (2 voisines admissibles), Castelnau-le-Lez, Le Petit-Quevilly, Cournon-d'Auvergne,
Croix, Wasquehal, Les Ulis, Villeparisis, Le Mée-sur-Seine, Dammarie-les-Lys (voisines trop éloignées ou en
override) ; mesurées le 2026-10-09 et **reportées** : Montfermeil, Les Lilas,
Villiers-sur-Marne, Chevilly-Larue (cf. journal) ; non retenues faute de place, règle valable : Orly
(94054), Villeneuve-le-Roi (94077, voir lot 5) ; **règle de voisinage non
valable, mesurée le 2026-10-08** (cf. journal) : Grigny, Les Mureaux, Chatou, Lormont,
Saint-Laurent-du-Var, La Valette-du-Var, Gardanne, Lunel, Saint-Étienne-du-Rouvray, Lambersart,
Marcq-en-Barœul — toutes attendent un override documenté ; non mesurées : Vallauris, Miramas ;
Villefontaine (Oullins est déjà au seed, fusionnée : `oullins-pierre-benite`) ; Marcq-en-Barœul, Lambersart ; Saint-Étienne-du-Rouvray ; DROM : Le Port,
Sainte-Marie, Saint-Leu (974), Le Gosier (971), Matoury (973), Koungou (976) — homonymes
métropolitains possibles, **vérifier par code Insee**. Liste non exhaustive : la liste complète par
population vient de la base Insee, qui ne se télécharge que depuis la machine locale.

---

## 6. Journal

### 2026-10-06 — run 1 : inventaire, outillage, cohorte de référence, lot 1 (+4)

Inventaire ci-dessus ; `scripts/seed-drift.ts` et `scripts/seed-coverage.mjs` ; runner local
étendu ; trois défauts de dégradation corrigés et 18 « 540 » affichés dérivés (§ 4) — commit
`docs(extension-villes): inventaire et procédure`.

**Lot 1 : Villejuif, Clamart, Bobigny, Épinay-sur-Seine** — 540 → **544** villes, toutes en
Île-de-France (aucune région, aucun département nouveau).

*Identité* (recherche web, `WebFetch` bloqué ; deux résultats concordants par population) :

| Ville | Insee | Pop. seed | Source pop. | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Villejuif | 94076 | 60 200 | 60 183 en 2023 (Wikipédia FR ; 2ᵉ résultat identique) | 48°47′31″N 2°21′49″E | 62-130 → 96 m |
| Clamart | 92023 | 58 600 | 58 576 en 2023 (Wikipédia FR ; 2ᵉ résultat identique) | 48°48′05″N 2°15′46″E | 63-174 → 118 m |
| Bobigny | 93008 | 56 900 | 56 927 en 2023 (Wikipédia ; bien-dans-ma-ville) | 48°54′38″N 2°26′23″E | 39-57 → 48 m |
| Épinay-sur-Seine | 93031 | 52 800 | 52 833 en 2023 (Wikipédia FR ; ville-data 52 606) | 48°57′19″N 2°18′33″E | 22-60 → 41 m |

*Notes brutes* (§ 3.2, médiane des 4 voisines même département, hors overrides) :

| Ville | Voisines (distance) | life | transp. | nature | cost | safety | culture | remote | schools |
|---|---|---|---|---|---|---|---|---|---|
| Villejuif | Vitry 2,3 · Kremlin-Bicêtre 2,4 · Cachan 2,4 · Arcueil 2,7 km | 6.5 | 8.3 | 5.5 | 5.0 | 6.3 | 6.8 | 6.8 | 6.5 |
| Clamart | Plessis-Robinson 2,0 · Châtillon 2,3 · Issy 2,5 · Bagneux 3,2 km | 7.0 | 7.8 | 6.0 | 4.5 | 7.0 | 6.3 | 6.9 | 7.0 |
| Bobigny | Drancy 1,5 · Noisy-le-Sec 2,3 · Bondy 3,2 · Blanc-Mesnil 3,4 km | 4.9 | 7.1 | 5.3 | 6.5 | 4.7 | 5.0 | 6.0 | 5.0 |
| Épinay | Pierrefitte 3,8 · Saint-Ouen 5,2 · Stains 5,5 · La Courneuve 6,8 km | 4.2 | 7.0 | 5.0 | 7.1 | 4.0 | 4.8 | 5.5 | 4.7 |

Épinay : ses deux plus proches voisines du seed (Villeneuve-la-Garenne 2,1 km, Gennevilliers
2,5 km) sont dans les Hauts-de-Seine et Saint-Denis est un override — elles sont donc écartées par la
règle, et la médiane vient de voisines du 93 plus éloignées. Notes **rendues** après calibrage
(biais départementaux) et projection : Villejuif 4,5, Clamart 4,5, Bobigny 2,8, Épinay 2,8 —
cohérentes avec leurs voisines rendues (Kremlin-Bicêtre 4,0, Cachan 4,7, Plessis 5,1, Châtillon
4,2 ; Drancy, Bondy, Stains, Pierrefitte toutes à 2,8).

*Climat* : ville du seed la plus proche — Vitry (Villejuif), Le Plessis-Robinson (Clamart),
Drancy (Bobigny), Villeneuve-la-Garenne (Épinay).

*Logement* (`housing.ts`, médiane des 4 mêmes voisines) : T1/T2/T3/m² = Villejuif 760/1 070/1 430/
5 900 ; Clamart 800/1 180/1 580/6 300 ; Bobigny 620/850/1 150/3 200 ; Épinay 570/790/1 070/2 800.
Recoupement de marché (realadvisor, prix moyen appartement, juillet 2026, via recherche web) :
Clamart 6 430 €/m² (**−2 %** vs repère), Bobigny 3 938 € (repère **19 % sous** le marché affiché),
Épinay 3 209 € (repère **13 % sous**), Villejuif non trouvé. Écart assumé : le repère reproduit
celui des voisines du 93, qui est lui-même plus bas que ce site d'annonces ; la médiane DVF arrivera
par `npm run property-prices` et s'affichera séparément, comme pour les 540.

*Quartiers* (2 par ville, réels, notes = ville) : Villejuif centre + Hautes-Bruyères ; Clamart centre
+ Petit-Clamart ; Bobigny centre + L'Abreuvoir (Émile Aillaud) ; Épinay centre + Orgemont.

*Dérive* : premier essai sans cohorte → 522 villes changées, 1 018 citations candidates (refusé) ;
avec `scoreCohort: "extension"` → **0 ville changée, 0 citation, 502/502 `seoDescriptionEn`
alignées**. Table des couleurs de `CLAUDE.md` recomptée : 19 / 50 / 151 / 141 / **102** / **81**,
moyenne 5,44.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (544 villes) + `:check`,
`sitemap:check` (FR 29 487 URL, EN 29 089), `hreflang:check`. `npm run build` non lancé.

*En attente du runner local* (`node scripts/seed-coverage.mjs`) : population Insee, Filosofi, DVF,
littoral, parcs, photos, biodiversité, actualité, zones protégées pour les 4. **Sans pipeline** :
codes postaux et orientation politique — manque assumé, pas de chiffre au jugé.

*Reportées* : Villeneuve-d'Ascq (règle de voisinage non valable, attend un override documenté) ;
Montrouge (une seule source de population).

**Prochain lot** : Montrouge (2ᵉ source de population), puis Meudon, Vanves, L'Haÿ-les-Roses,
Thiais, Villeneuve-Saint-Georges, Livry-Gargan, Villepinte — toutes en petite couronne dense, où
la règle de voisinage tient. Vérifier d'abord avec `seed-coverage` que le runner local a bien rempli
les 4 du lot 1.

### 2026-10-07 — lot 2 (+7) : Montrouge, Meudon, Vanves, L'Haÿ-les-Roses, Thiais, Livry-Gargan, Villepinte

544 → **551** villes, toutes en Île-de-France (aucune région, aucun département nouveau). Absence
vérifiée par code Insee avant ajout. ⚠️ Le runner local n'avait **pas encore servi le lot 1** au
moment du run (`seed-coverage` : les 4 villes du 06/10 absentes des 11 jeux), donc pas de
vérification d'arrivée possible — à refaire au prochain run ; ce n'est pas un défaut tant que les
pages dégradent (elles le font, § 1).

*Identité* (recherche web ; `WebFetch` toujours bloqué) :

| Ville | Insee | Pop. seed | Source pop. (2023) | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Montrouge | 92049 | 46 300 | 46 324 (bien-dans-ma-ville ; Wikipédia FR) | 48°49′02″N 2°19′19″E | 67-85 → 76 m |
| Meudon | 92048 | 46 300 | 46 334 (bien-dans-ma-ville ; Wikipédia EN) | 48°48′46″N 2°14′18″E | 28-179 → 104 m |
| Vanves | 92075 | 28 600 | 28 622 (bien-dans-ma-ville ; Wikipédia EN) | 48°49′15″N 2°17′23″E | 35-78 → 57 m |
| L'Haÿ-les-Roses | 94038 | 31 200 | 31 188 (bien-dans-ma-ville ; Wikipédia EN) | 48°46′48″N 2°20′15″E | 45-110 → 78 m |
| Thiais | 94073 | 32 900 | 32 918 (bien-dans-ma-ville ; Wikipédia EN, pop. municipale) | 48°45′54″N 2°23′32″E | 41-96 → 69 m |
| Livry-Gargan | 93046 | 47 200 | 47 228 (bien-dans-ma-ville ; Wikipédia EN) | 48°55′09″N 2°32′10″E | 54-125 → 90 m |
| Villepinte | 93078 | 41 500 | 41 470 (bien-dans-ma-ville ; Wikipédia EN) | 48°57′18″N 2°32′28″E | 54-81 → 68 m ⚠️ |

⚠️ Villepinte : une seconde source donne 46-87 m (→ 67) ; écart d'un mètre, 68 retenu (cartesfrance,
dont la moyenne publiée vaut aussi 68). Thiais : un résultat donnait 33 141, non recoupé — 32 918
retenu, porté par deux résultats.

*Notes brutes* (§ 3.2, médiane des 4 voisines même département, 20 000-150 000 hab., hors
overrides ; ordre : life, transport, nature, cost, safety, culture, remoteWork, schools ; global =
`recomputeGlobal`) :

| Ville | Voisines (distance) | Notes brutes | global |
|---|---|---|---|
| Montrouge | Malakoff 1,6 · Bagneux 2,4 · Châtillon 2,7 · Issy 3,7 km | 6.5 · 8 · 5.3 · 5 · 6.5 · 6.3 · 6.5 · 6.5 | 6.2 |
| Meudon | Clamart 2,2 · Sèvres 2,3 · Issy 2,7 · Saint-Cloud 3,7 km (Boulogne écartée : override) | 7.7 · 7.7 · 7 · 3.9 · 7.5 · 6.8 · 7.4 · 7.8 | 6.9 |
| Vanves | Malakoff 0,7 · Issy 1,4 · Châtillon 2,2 · Bagneux 2,7 km | 6.5 · 8 · 5.3 · 5 · 6.5 · 6.3 · 6.5 · 6.5 | 6.2 |
| L'Haÿ-les-Roses | Cachan 1,7 · Villejuif 2,3 · Arcueil 2,9 · Fresnes 3,0 km (Bourg-la-Reine écartée : 92) | 6.5 · 7.8 · 5.5 · 5 · 6.2 · 6.7 · 6.7 · 6.5 | 6.3 |
| Thiais | Choisy 1,7 · Vitry 2,8 · Villejuif 3,7 · Alfortville 4,9 km | 6.4 · 7.9 · 5.7 · 5.3 · 5.9 · 6.3 · 6.8 · 6.3 | 6.2 |
| Livry-Gargan | Sevran 1,9 · Aulnay 3,5 · Bondy 4,6 · Blanc-Mesnil 5,6 km | 4.4 · 6.9 · 5.3 · 6.8 · 4.1 · 4.9 · 5.7 · 4.8 | 5.3 |
| Villepinte | Sevran 2,1 · Tremblay 3,0 · Aulnay 4,0 · Blanc-Mesnil 6,0 km | 4.8 · 6.9 · 5.5 · 6.7 · 4.5 · 5 · 5.9 · 4.9 | 5.5 |

Villejuif (lot 1) entre comme voisine de L'Haÿ et de Thiais : c'est une note elle-même dérivée par
médiane, donc la règle se nourrit d'elle-même dès qu'un lot s'étend sur un précédent. Acceptable
tant qu'une seule des 4 voisines est une ville d'extension ; **à surveiller** si un lot futur en
aligne deux ou plus (préférer alors une voisine d'origine un peu plus lointaine et le dire ici).
Montrouge et Vanves ont les mêmes 4 voisines, donc les mêmes notes brutes ; leurs notes rendues
diffèrent (4,1 contre 4,2) par l'ajustement de taille de `calibrateScores` (Vanves < 30 000 hab.).

Notes **rendues** (lues dans `CITIES_SEED`, reprises dans `seoDescriptionEn`) : Montrouge 4,1 ·
Meudon 5,4 · Vanves 4,2 · L'Haÿ-les-Roses 4,3 · Thiais 4,2 · Livry-Gargan 2,8 · Villepinte 2,8.

*Climat* : ville du seed la plus proche — Arcueil (Montrouge), Clamart (Meudon), Malakoff (Vanves),
Cachan (L'Haÿ), Choisy-le-Roi (Thiais), Sevran (Livry-Gargan, Villepinte).

*Logement* (`housing.ts`, médiane des 4 mêmes voisines, T1/T2/T3/m²) : Montrouge et Vanves
750/1 050/1 400/6 000 ; Meudon 950/1 370/1 860/7 300 ; L'Haÿ 760/1 060/1 420/5 700 ; Thiais
730/1 020/1 360/4 900 ; Livry-Gargan 590/810/1 090/2 900 ; Villepinte 610/840/1 130/3 200. Pas de
recoupement de marché ce run ; la médiane DVF arrivera par `npm run property-prices`.

*Quartiers* (2 par ville, réels, recoupés par recherche web, notes = ville) : Montrouge centre +
Haut-Mesnil–Grand Sud ; Meudon Bellevue + Meudon-la-Forêt ; Vanves centre + Plateau de Vanves ;
L'Haÿ centre + Lallier ; Thiais centre + Pavé de Grignon ; Livry-Gargan Livry + Gargan ; Villepinte
Vieux-Pays + Vert-Galant.

*Faits des `characterTags` / `descriptionEn`, vérifiés en ligne* : T4 à L'Abbaye et Lycée
Henri-Sellier (gare de Gargan en limite, sur Les Pavillons-sous-Bois — la description le dit) ;
station de métro 14 « L'Haÿ-les-Roses » ouverte le 24/06/2024, à la jonction L'Haÿ / Chevilly /
Villejuif ; T7 (La Belle Épine) et T9 à Thiais, station 14 Thiais–Orly. Tags évitant les
sous-chaînes lues par les prédicats (« centre commercial » contient « mer », « aéroport » contient
« port » : écrits « Belle Épine » et « proche Roissy »).

*Dérive* : `seed-drift` → **0 ville changée, 0 citation candidate**. Table des couleurs de
`CLAUDE.md` recomptée sur `CITIES_SEED` : 19 / 50 / 151 / **142** / **106** / **83**, moyenne 5,42.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (551 villes) + `:check`,
`sitemap:check` (FR 29 795 URL, EN 29 397), `hreflang:check`. `npm run build` non lancé.

*Reportée* : Villeneuve-Saint-Georges (règle de voisinage non valable, cf. backlog).

**Prochain lot** : Gagny, Clichy-sous-Bois, Romainville, Villemomble (93, seed dense) ; Les Mureaux,
Chatou (78) ; Ris-Orangis, Grigny (91) — vérifier la densité de voisines de chacune avec le script,
et d'abord `seed-coverage` pour constater l'arrivée des lots 1 et 2 via le runner local.

### 2026-10-08 — lot 3 (+5) : Gagny, Clichy-sous-Bois, Romainville, Villemomble, Ris-Orangis

551 → **556** villes, toutes en Île-de-France (aucune région, aucun département nouveau). Absence
vérifiée par code Insee avant ajout.

⚠️ **Runner local toujours arrêté** : aucun commit `[local-runner]` depuis le **2026-09-25** ;
`seed-coverage` montre les 11 villes des lots 1-2 absentes des 11 jeux (population, revenus, DVF,
littoral, parcs, photos, biodiversité, actualité, zones protégées, orientation politique, codes
postaux). Après ce lot : **16 villes en attente**, sous le seuil de 30 fixé par la routine. Les pages
dégradent proprement (§ 1), mais **au-delà de 30 la routine cesse d'ajouter des villes** : si la
machine du propriétaire ne repart pas, il reste environ deux lots.

*Mesure de densité avant choix* (script de scratch, § 3.2, qui imprime pour chaque candidate ses 4
voisines admissibles et les plus proches écartées) — **11 candidates du backlog refusées** parce que
leurs voisines du même département sont lointaines ou ne leur ressemblent pas :

| Candidate | Pourquoi la règle ne tient pas |
|---|---|
| Grigny (91) | voisines Viry, Draveil, Savigny, Sainte-Geneviève (2,3-4,4 km) : communes pavillonnaires, Grigny est la commune des grands ensembles de la Grande Borne et de Grigny 2 |
| Les Mureaux (78) | voisines à 11-19 km (Poissy, Conflans, Sartrouville, Plaisir) |
| Chatou (78) | voisines à 4,4-9,6 km, Rueil (2,7 km) écartée car 92 ; commune aisée, médiane tirée par Houilles/Sartrouville |
| Lormont (33) | Bordeaux override ; voisines Le Bouscat, Bègles, Talence, Villenave, rive gauche |
| Saint-Laurent-du-Var (06) | Nice override ; 3 des 4 voisines à 17-25 km |
| La Valette-du-Var (83) | Toulon override ; 3 voisines seulement, dont Saint-Raphaël à 71 km |
| Gardanne (13) | Aix override ; voisines à 13-21 km |
| Lunel (34) | Montpellier, Nîmes, Sète overrides ; seule voisine admissible Agde à 67 km |
| Saint-Étienne-du-Rouvray (76) | 3 voisines, dont Dieppe à 61 km |
| Lambersart, Marcq-en-Barœul (59) | Lille override ; médiane = Roubaix/Tourcoing/Wattrelos/Armentières, communes plus modestes |

*Identité* (recherche web ; `WebFetch` bloqué ; deux résultats concordants par population, millésime
2023 = population municipale en vigueur) :

| Ville | Insee | Pop. seed | Source pop. | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Gagny | 93032 | 42 300 | 42 313 (Banatic ; notre-planete.info) | 48,8833 N 2,5333 E (Wikipédia) | 37-120 → 79 m |
| Clichy-sous-Bois | 93014 | 29 400 | 29 354 (Banatic ; 2ᵉ profil) | 48,9058 N 2,5422 E (latitude.to) | 66-121 → 94 m |
| Romainville | 93063 | 37 200 | 37 152 (Banatic ; Wikipédia EN) | 48,884 N 2,435 E (Wikipédia ; distanceenvoiture 48,8861 / 2,4350) | 54-123 → 89 m |
| Villemomble | 93077 | 29 800 | 29 795 (Banatic ; Wikipédia EN) | 48,8833 N 2,5 E (Wikipédia ; GeoNames) | 54-107 → 81 m |
| Ris-Orangis | 91521 | 31 200 | 31 189 (Banatic ; villesavivre) | 48,6537 N 2,4161 E (Wikipédia ; GeoNames 48,6511 / 2,4141) | 32-82 → 57 m |

*Notes brutes* (§ 3.2 ; ordre life, transport, nature, cost, safety, culture, remoteWork, schools ;
global = `recomputeGlobal`) :

| Ville | Voisines (distance) | Notes brutes | global |
|---|---|---|---|
| Gagny | Neuilly-sur-Marne 3,5 · Rosny 3,6 · Livry-Gargan* 4,0 · Bondy 4,3 km | 5.1 · 7 · 5.6 · 6.2 · 4.8 · 5.2 · 6.3 · 5.3 | 5.6 |
| Clichy-sous-Bois | Livry-Gargan* 1,3 · Sevran 3,1 · Aulnay 4,7 · Bondy 5,0 km | 4.4 · 7 · 5.2 · 6.8 · 4.1 · 4.9 · 5.7 · 4.8 | 5.3 |
| Romainville | Noisy-le-Sec 1,3 · Bagnolet 2,1 · Bobigny* 3,0 · Bondy 3,8 km (Montreuil, Pantin écartées : override) | 5.2 · 7.3 · 5.2 · 6.3 · 4.9 · 5.3 · 6.3 · 5.3 | 5.6 |
| Villemomble | Rosny 1,9 · Bondy 2,8 · Neuilly-sur-Marne 4,0 · Noisy-le-Sec 4,3 km | 5.7 · 7.3 · 5.7 · 5.8 · 5.3 · 5.5 · 6.7 · 5.7 | 5.9 |
| Ris-Orangis | Draveil 3,6 · Viry-Châtillon 3,6 · Savigny 5,7 · Sainte-Geneviève 5,9 km (Évry-Courcouronnes écartée : override) | 6.3 · 6.8 · 6.5 · 5.5 · 5.9 · 5.7 · 6.6 · 6.3 | 6.1 |

\* ville d'extension. Une seule par ville au plus, conformément à la vigilance du lot 2. Clichy a les
mêmes 4 voisines que Livry-Gargan à une près, d'où des notes brutes identiques ; sa note rendue
diffère par l'ajustement de taille (< 30 000 hab.). Notes **rendues** (`CITIES_SEED`, reprises dans
`seoDescriptionEn`) : Gagny 2,8 · Clichy-sous-Bois 2,8 · Romainville 2,8 · Villemomble 2,8 ·
Ris-Orangis 4,6 — comme leurs voisines rendues (Bondy, Rosny, Noisy-le-Sec, Livry 2,8 ; Viry 3,9,
Draveil 5,0).

*Climat* : ville du seed la plus proche — Neuilly-sur-Marne (Gagny), Livry-Gargan (Clichy),
Noisy-le-Sec (Romainville), Rosny-sous-Bois (Villemomble), Draveil (Ris-Orangis) ; toutes 1 700 h /
20,5 °C / 4 °C.

*Logement* (médiane des 4 mêmes voisines, T1/T2/T3/m²) : Gagny 660/900/1 220/3 600 ; Clichy
590/810/1 090/2 900 ; Romainville 660/910/1 230/3 600 ; Villemomble 710/980/1 330/4 200 ; Ris-Orangis
690/960/1 290/4 000. Pas de recoupement de marché ce run.

*Quartiers* (2 par ville, réels, notes = ville, types pris dans l'union existante) : Gagny centre +
Le Chénay (gare RER E éponyme) ; Clichy centre + Bas-Clichy (copropriétés du Chêne Pointu, ORCOD-IN
de 2015, EPFIF) ; Romainville centre + Carnot (station Romainville-Carnot) ; Villemomble centre +
plateau d'Avron (versant villemomblois — le parc des Coteaux d'Avron est sur Neuilly-Plaisance,
écrit « accessible depuis ») ; Ris-Orangis centre + Plateau (ancien « Grand Ensemble du Plateau » en
ZUS).

*Faits retirés au premier jet faute de source* : relief de Gagny « entre vallée de la Marne et
plateau d'Avron », mairie de Villemomble « dans le parc du château », « vieux village de Ris au bord
de l'eau », trois gares RER D à Ris (Grand-Bourg et Orangis-Bois de l'Épine non attribuées avec
certitude à la commune — seule la gare de Ris-Orangis est citée). **Le fort de Romainville est sur
Les Lilas** : il n'est cité nulle part.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation candidate**. Table des couleurs de
`CLAUDE.md` recomptée sur `CITIES_SEED` : 19 / 50 / 151 / 142 / **107** / **87**, moyenne 5,40.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (556 villes) + `:check`,
`sitemap:check` (FR 30 035 URL, EN 29 617), `hreflang:check`. `npm run build` non lancé.

*Reportées* : les 11 candidates du tableau ci-dessus (overrides à écrire), Villeneuve-Saint-Georges,
Villeneuve-d'Ascq.

**Prochain lot** : le backlog « dense » (petite couronne où la règle tient) est presque épuisé.
Pistes **absentes du seed par code Insee (vérifié ce run)**, à mesurer avec le même script :
Neuilly-Plaisance (93049), Montfermeil (93047), Le Raincy (93062), Les Pavillons-sous-Bois
(93057) — populations à mesurer. Déjà au seed (inutile de les chercher) : Neuilly-sur-Marne, Bagnolet,
Fontenay-sous-Bois, Nogent-sur-Marne, Bourg-la-Reine, Sceaux, Châtenay-Malabry. À défaut de candidates denses, le run suivant doit écrire des **overrides documentés**
(Villeneuve-d'Ascq, Grigny, Chatou) plutôt qu'appliquer la médiane là où elle ment. Et d'abord
`seed-coverage` : si le runner local n'a toujours rien servi et que l'attente dépasse 30 villes, pas
de lot.

### 2026-10-09 — lot 4 (+5) : Fontenay-aux-Roses, Chaville, Joinville-le-Pont, Les Pavillons-sous-Bois, Neuilly-Plaisance

556 → **561** villes, toutes en Île-de-France (aucune région, aucun département nouveau). Absence
vérifiée par code Insee avant ajout. Garde-fou runner local : `seed-coverage` donnait **16 villes en
attente** avant le lot (sous le seuil de 30), **21 après**. ⚠️ Toujours aucun commit `[local-runner]`
depuis le **2026-09-25** : les lots 1 à 4 n'ont ni population Insee, ni Filosofi, ni DVF, ni parcs,
ni photos. **Il reste au plus un lot (≤ 9 villes) avant que la routine cesse d'ajouter.**

*Densité mesurée avant choix* (script de scratch § 3.2, avec la vigilance du lot 2 désormais
**appliquée par le script** : au plus une ville d'extension parmi les 4 voisines, sinon on descend à la
voisine d'origine suivante). 12 candidates mesurées, 4 refusées :

| Candidate | Pourquoi elle attend |
|---|---|
| Montfermeil (93047) | 3 voisines d'extension (Clichy, Gagny, Livry) ; avec une seule, les voisines d'origine sont à 4,9-6,1 km (Sevran, Neuilly-sur-Marne, Noisy-le-Grand) et Montfermeil porte les grands ensembles des Bosquets — médiane non représentative |
| Les Lilas (93045) | Pantin et Montreuil (les plus proches) sont des overrides ; la 4ᵉ voisine admissible devient Aubervilliers à 4,7 km |
| Villiers-sur-Marne (94079) | plus proche ville du seed Noisy-le-Grand (93, écartée) ; la médiane 94 est tirée par Nogent, Le Perreux et Saint-Maur |
| Chevilly-Larue (94021) | 19 826 hab. (sous 20 000) et 3 voisines d'extension |

*Identité* (recherche web ; deux résultats concordants par population, population municipale 2023) :

| Ville | Insee | Pop. seed | Source pop. | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Fontenay-aux-Roses | 92032 | 24 100 | 24 070 (Banatic ; Wikipédia EN, citypopulation) | 48,7893 N 2,2888 E (latlong.net ; Geneawiki) | 58-164 → 111 m |
| Chaville | 92022 | 20 600 | 20 594 (Banatic ; notre-planete.info) | 48,8057 N 2,1886 E (latitudelongitude.org ; cartesfrance 48,804/2,186) | 63-173 → 118 m |
| Joinville-le-Pont | 94042 | 20 500 | 20 525 (Banatic ; Wikipédia EN) | 48,8254 N 2,4746 E (GeoNames NGA ; distancefromto) | 33-61 → 47 m |
| Les Pavillons-sous-Bois | 93057 | 25 800 | 25 804 (Wikipédia EN ; habity.fr) ⚠️ | 48,9068 N 2,5065 E (distancecalculator ; meilleurescpi) | 50-64 → 57 m |
| Neuilly-Plaisance | 93049 | 21 900 | 21 941 (Wikipédia EN ; pss-archi) | 48,8619 N 2,5064 E (Geneawiki ; latlong.net) | 37-117 → 77 m |

⚠️ Les Pavillons-sous-Bois : d'autres résultats donnent 24 872 (« 2025 », comersis) et 24 003 (budget
communal 2023, référence de recensement différente) ; 25 804 retenu, porté par deux résultats pour le
millésime 2023. La population Insee exacte arrivera avec `npm run population`.

*Notes brutes* (§ 3.2 ; ordre life, transport, nature, cost, safety, culture, remoteWork, schools ;
global = `recomputeGlobal`) :

| Ville | Voisines (distance) | Notes brutes | global |
|---|---|---|---|
| Fontenay-aux-Roses | Châtillon 1,4 · Sceaux 1,5 · Bagneux 1,6 · Plessis-Robinson 1,8 km | 7 · 7.5 · 6 · 4.5 · 7 · 6.3 · 6.8 · 7 | 6.4 |
| Chaville | Sèvres 2,7 · Meudon* 3,7 · Saint-Cloud 4,1 · Plessis-Robinson 6,2 km (Boulogne écartée : override ; Clamart* écartée : 2ᵉ extension) | 7.6 · 7.5 · 7.5 · 3.9 · 7.5 · 6.7 · 7.3 · 7.7 | 6.9 |
| Joinville-le-Pont | Nogent 1,4 · Le Perreux 2,5 · Fontenay-sous-Bois 2,8 · Saint-Maur 3,2 km (Vincennes, Créteil écartées : override) | 7.5 · 7.5 · 7.5 · 4.3 · 7 · 6.5 · 7.2 · 7.5 | 6.8 |
| Les Pavillons-sous-Bois | Bondy 2,0 · Livry-Gargan* 2,6 · Aulnay 3,3 · Rosny 3,9 km (Villemomble*, Clichy* écartées : 2ᵉ/3ᵉ extension) | 4.5 · 7 · 5.2 · 6.8 · 4.2 · 5 · 5.8 · 4.8 | 5.3 |
| Neuilly-Plaisance | Rosny 2,0 · Neuilly-sur-Marne 2,4 · Villemomble* 2,4 · Noisy-le-Grand 3,9 km (Gagny* écartée : 2ᵉ extension ; Montreuil : override) | 6.2 · 7.4 · 6.4 · 5.7 · 5.7 · 5.5 · 6.8 · 5.9 | 6.1 |

\* ville d'extension. Chaville : la ville du seed la plus proche est Vélizy-Villacoublay (Yvelines,
2,5 km), écartée par la règle du même département. Notes **rendues** (`CITIES_SEED`, reprises dans
`seoDescriptionEn`) : Fontenay-aux-Roses 4,5 · Chaville 5,2 · Joinville-le-Pont 5,3 · Les
Pavillons-sous-Bois 2,8 · Neuilly-Plaisance 3,3 — à comparer aux voisines rendues (Meudon 5,4 ;
Bondy, Livry 2,8).

*Climat* : ville du seed la plus proche — Châtillon (Fontenay ; 1 750 h / 21 °C / 4 °C), Vélizy (Chaville ;
idem), Nogent-sur-Marne (Joinville), Bondy (Pavillons), Rosny-sous-Bois (Neuilly-Plaisance) ; ces trois
dernières 1 700 h / 20,5 °C / 4 °C.

*Logement* (médiane des 4 mêmes voisines, T1/T2/T3/m²) : Fontenay 780/1 080/1 450/6 200 ; Chaville
1 000/1 400/1 890/7 600 ; Joinville 950/1 290/1 740/6 800 ; Pavillons 600/820/1 100/3 000 ;
Neuilly-Plaisance 720/990/1 340/4 300. Pas de recoupement de marché ce run.

*Quartiers* (2 par ville, réels, recoupés par recherche web, notes = ville) : Fontenay Blagis – Gare
(gare RER B) + Scarron – Sorrières (limite de Bagneux) ; Chaville Rive Droite (Transilien L, U) + Rive
Gauche (ligne N, bordure de la forêt domaniale de Meudon) ; Joinville Centre (gare RER A) + Polangis
(bords de Marne, ru de Polangis) ; Pavillons Basoche (plus ancien quartier) + Chanzy (au pied du T4,
secteur Victor-Hugo – Chanzy en projet de réaménagement annoncé par la commune) ; Neuilly-Plaisance
Bords de Marne (gare RER A) + Plateau d'Avron (voie Lamarque).

*Faits retirés ou évités faute de source* : la commune d'implantation du parc des Coteaux d'Avron
(le lot 3 l'écrivait « sur Neuilly-Plaisance », un résultat de ce run le dit partagé avec Rosny — la
description EN dit seulement que la voie Lamarque y mène) ; les limites des quartiers de Fontenay (aucune
liste officielle trouvée, les sources immobilières divergent) ; le côté de la Marne de Polangis.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation candidate**. Table des couleurs de `CLAUDE.md`
recomptée sur `CITIES_SEED` : 19 / 50 / 151 / **144** / **108** / **89**, moyenne 5,39.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (561 villes) + `:check`,
`sitemap:check` (FR 30 256 URL, EN 29 837), `hreflang:check`. `npm run build` non lancé.

*Reportées* : Montfermeil, Les Lilas, Villiers-sur-Marne, Chevilly-Larue (tableau ci-dessus), plus les
reportées des lots précédents (overrides à écrire).

**Prochain lot** : d'abord `seed-coverage` — à 21 villes en attente, un lot de plus de 9 dépasserait
le seuil de 30 ; si le runner n'a toujours rien servi, **le lot suivant est le dernier** avant l'arrêt.
Candidates mesurées valables : Orly (Thiais* 2,3 · Choisy 3,2 · Vitry 5,1 · Fresnes 5,4) ; à regarder de près : Sucy-en-Brie (voisines 3,9-7,7 km),
Villeneuve-le-Roi (voisines 3,9-7,4 km, à regarder). Si le seuil est atteint : écrire les overrides
documentés (Villeneuve-d'Ascq, Grigny, Chatou) plutôt qu'ajouter.


### 2026-10-10 — lot 5 (+7) : Orly, Saint-Gratien, Vigneux-sur-Seine, Herblay-sur-Seine, Taverny, Maisons-Laffitte, Gradignan

561 → **568** villes ; six en Île-de-France, **Gradignan est la première ville d'extension hors Île-de-France**
(Gironde, Nouvelle-Aquitaine — département et région déjà au seed). Absence vérifiée par code Insee.

*Garde-fou runner* : la machine locale est retirée, `scripts/local-data-runner.sh` tourne désormais sur **GitHub
Actions** (`.github/workflows/data-runner.yml`, 02h20 / 14h20 UTC) et a servi les 21 villes des lots 1 à 4 :
`seed-coverage` donnait **population, revenus, DVF, littoral, parcs, photos, biodiversité, actualité, zones
protégées à 561/561** avant ce lot. Seuls manquaient `political-lean` et `postal-codes`, que le runner ne
sert pas (aucun pipeline cloud). **Codes postaux comblés ce run** pour les 28 villes d'extension (les 21 + ce
lot) : la recherche par code postal ne les trouvait pas. Codes du lot confirmés par les recherches d'identité ;
les 21 autres sont les codes de distribution standard (Meudon : 92190 et 92360 pour Meudon-la-Forêt).
`political-lean` reste à 540/568 : manque assumé, cadre vide cosmétique, pas de chiffre au jugé.

*Densité mesurée avant choix* (script § 3.2, ≤ 1 voisine d'extension) : 22 candidates, 7 retenues, 2 valables
mises de côté (Sucy-en-Brie, Eysines), 13 reportées (liste au backlog). Le seed est désormais dense autour de
Lyon, Toulouse, Nantes, Strasbourg, Grenoble, Rouen : la plupart des communes de 20 000+ hab. de ces aires y sont
déjà.

*Identité* (recherche web ; population municipale 2023 donnée par Banatic **et** Wikipédia pour chacune) :

| Ville | Insee | Pop. seed | Source pop. | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Orly | 94054 | 24 700 | 24 658 (Banatic ; Wikipédia EN) | 48,7439 N 2,3928 E (Wikipédia ; mairie 48,7467/2,4039) | 30-89 → 60 m (Geneawiki ; areq) |
| Saint-Gratien | 95555 | 21 300 | 21 336 (Banatic ; Wikipédia EN) | 48,9703 N 2,2866 E (distanceenvoiture ; cartesfrance 48,975/2,287) | 39-59 → 49 m (areq ; Geneawiki) |
| Vigneux-sur-Seine | 91657 | 31 500 | 31 466 (Banatic ; Wikipédia EN) | 48,7001 N 2,4170 E (latlong.net ; distanceenvoiture) | 31-84 → 58 m |
| Herblay-sur-Seine | 95306 | 31 800 | 31 779 (Banatic ; Wikipédia EN) | 48,9908 N 2,1664 E (Wikipédia ; latlong.net) | 20-91 → 56 m |
| Taverny | 95607 | 27 600 | 27 593 (Banatic ; Wikipédia EN) | 49,0264 N 2,2275 E (Wikipédia ; GeoNames 49,0254/2,2169) | 55-188 → 122 m |
| Maisons-Laffitte | 78358 | 23 100 | 23 093 (Banatic ; Wikipédia EN) | 48,948 N 2,141 E (cartesfrance ; mairie 48,9481/2,1414) | 22-57 → 40 m (areq) |
| Gradignan | 33192 | 27 000 | 26 952 (Banatic ; Wikipédia EN) | 44,773 N 0,612 W (gazetteer ; 2ᵉ source 44,764/−0,6173) | 10-51 → 31 m |

Milieux d'altitude en x,5 arrondis au mètre supérieur. Saint-Gratien : une page homonyme (Saint-Gratien,
Somme) donne 48-113 m, écartée.

*Notes brutes* (§ 3.2 ; life, transport, nature, cost, safety, culture, remoteWork, schools ; global =
`recomputeGlobal`) :

| Ville | Voisines (distance) | Notes brutes | global |
|---|---|---|---|
| Orly | Thiais* 2,3 · Choisy-le-Roi 3,2 · Vitry 5,1 · Fresnes 5,4 km | 6.1 · 7.7 · 5.8 · 5.5 · 5.7 · 5.9 · 6.7 · 6.1 | 6.1 |
| Saint-Gratien | Sannois 1,9 · Eaubonne 2,5 · Ermont 2,8 · Montmorency 3,4 km | 6.3 · 6.7 · 6.3 · 5.5 · 6.2 · 5.4 · 6.3 · 6.4 | 6.1 |
| Vigneux-sur-Seine | Athis-Mons 1,4 · Draveil 1,8 · Viry-Châtillon 4,6 · Ris-Orangis* 5,2 km | 6.1 · 6.7 · 6.3 · 5.7 · 5.7 · 5.6 · 6.5 · 6.1 | 6.0 |
| Herblay-sur-Seine | Cormeilles 2,6 · Franconville 4,9 · Ermont 6,8 · Sannois 7,3 km | 6 · 7.1 · 6.3 · 5.7 · 5.8 · 5 · 6.7 · 6.1 | 6.0 |
| Taverny | Franconville 2,5 · Ermont 4,9 · Eaubonne 5,4 · Cormeilles 6,3 km (Saint-Leu-la-Forêt, 2,0 km, sous 20 000 hab.) | 6 · 7.1 · 6.5 · 5.5 · 5.8 · 5.1 · 6.7 · 6.2 | 6.0 |
| Maisons-Laffitte | Sartrouville 2,0 · Houilles 4,5 · Saint-Germain-en-Laye 6,5 · Conflans 6,7 km | 6.5 · 7.5 · 7 · 5.2 · 6.1 · 5.8 · 6.9 · 6.5 | 6.3 |
| Gradignan | Villenave-d'Ornon 3,8 · Talence 4,1 · Pessac 4,2 · Bègles 6,4 km (Bordeaux : override) | 6.9 · 7.5 · 6.7 · 5.5 · 6.1 · 6.3 · 7 · 6.8 | 6.5 |

\* ville d'extension. Notes **rendues** (`CITIES_SEED`, reprises dans `seoDescriptionEn`) : Orly 4,1 ·
Saint-Gratien 4,1 · Vigneux 4,2 · Herblay 3,7 · Taverny 3,7 · Maisons-Laffitte 4,7 · Gradignan 5,4 — à comparer
aux voisines rendues (Thiais 4,2, Sannois 3,2, Athis-Mons 3,7, Cormeilles 3,7, Sartrouville 4,0, Talence 5,5,
Pessac 5,4). ⚠️ Maisons-Laffitte est vraisemblablement **sous-notée** par la médiane (Sartrouville et Houilles
tirent le coût et la nature) : candidate à un override documenté si une source le justifie, pas au jugé.

*Climat* : ville du seed la plus proche — Thiais, Sannois, Athis-Mons, Cormeilles, Sartrouville
(1 700 h / 20,5 °C / 4 °C), Saint-Leu-la-Forêt pour Taverny (1 750 h / 21 °C / 4 °C), Villenave-d'Ornon pour
Gradignan (2 050 h / 23 °C / 6,9 °C).

*Logement* (médiane des 4 voisines, T1/T2/T3/m²) : Orly 700/980/1 310/4 500 ; Saint-Gratien 630/880/1 180/3 900 ;
Vigneux 680/940/1 270/3 900 ; Herblay 670/910/1 220/3 700 ; Taverny 670/910/1 220/3 900 ; Maisons-Laffitte
740/1 040/1 400/4 600 ; Gradignan 580/800/1 080/3 800. Pas de recoupement de marché ce run ; la médiane DVF
arrivera par le runner.

*Quartiers* (2 par ville, réels, recoupés par recherche web, notes = ville ; limites non officielles,
souvent issues d'annonces, donc résumés sans verdict) : Orly Vieil Orly (gare Orly-Ville) + Les Navigateurs
(grand ensemble) ; Saint-Gratien Gare (RER C) + Mairie – Petit Lac ; Vigneux Croix-Blanche (en rénovation) +
Gare (RER D) ; Herblay Centre-ville (≈ 600 m de la gare, ligne J) + Val d'Herblay ; Taverny Centre-Ville – Les
Coteaux (gares Taverny et Vaucelles) + Sarments – Vaucelles ; Maisons-Laffitte Centre (RER A, ligne L) + Le Parc
(château, hippodrome avenue de la Pelouse) ; Gradignan Centre-ville (cours du Général-de-Gaulle) + Malartic.

*Faits retirés ou évités faute de source* : la part de l'aéroport d'Orly sur la commune (« borders it ») ; la
rive de la Seine pour Maisons-Laffitte et Vigneux ; la position de Saint-Gratien sur le lac (« close to ») ; la
superficie du Parc de Maisons-Laffitte et de l'hippodrome (chiffres d'annonces) ; le statut ZFU des
Navigateurs ; les lignes de bus TBM de Gradignan (réseau changé en 2023). Tags sans `port` / `mer` / `côte` :
« aéroport » écarté pour cette raison (sous-chaîne `port`).

*Dérive* : `seed-drift` → **0 ville changée, 0 citation candidate**. Table des couleurs de `CLAUDE.md`
recomptée sur `CITIES_SEED` : 19 / 50 / 151 / **145** / **112** / **91**, moyenne 5,38.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (568 villes) + `:check`, `sitemap:check`
(FR 30 603 URL, EN 30 204), `hreflang:check`. `npm run build` non lancé.

**Prochain lot** : `seed-coverage` d'abord (le runner GitHub Actions doit servir les 7 à sa prochaine passe).
Candidates valables : Sucy-en-Brie, Eysines. Le gisement « règle de voisinage valable » s'épuise : la suite
demande soit d'élargir aux 15 000-20 000 hab., soit d'écrire les overrides documentés (Villeneuve-d'Ascq,
Grigny, Chatou, Cenon, Villeneuve-Saint-Georges) — décision à prendre plutôt que de forcer la médiane.
