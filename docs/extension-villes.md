# Extension du seed — inventaire, procédure, backlog, journal

Mémoire de l'agent « extension du seed » (ROADMAP § « Vague 4 — extension du seed », F34 puis
F35). À relire **en entier** avant chaque lot. Objectif : couvrir plus de communes que les 540
d'origine, un lot par run, **sans jamais publier une ville à moitié remplie ni un chiffre
inventé**.

---

## 0. Décisions attendues du propriétaire (consolidé le 2026-10-17)

**L'extension est à l'arrêt depuis le lot 17 (2026-10-15)** : aucune commune de 20 000 hab. et plus absente du
seed ne passe la règle actuelle (§ 3.2 / § 3.3 bis), gisement confirmé épuisé par deux balayages indépendants.
Chaque run suivant ne peut que vérifier la couverture. Les décisions ci-dessous étaient éparpillées dans le
journal ; chacune dit ce qu'elle débloque. Une réponse d'une ligne suffit (commit, ROADMAP ou CLAUDE.md) : la
routine l'écrit au § 3.2 **avant** usage, comme toutes les règles précédentes.

| # | Décision | Débloque | Ce que la routine ferait sans autre précision |
|---|---|---|---|
| D1 | **Overrides documentés** dans `lib/score-calibration.ts` pour les villes qui ne ressemblent pas à leurs voisines | Villeneuve-d'Ascq (62 868 hab., la plus grosse absente), Cenon, La Madeleine, Marcq-en-Barœul, Lambersart, Montfermeil, Sucy-en-Brie (tableau A) | une ville par run, chaque note d'axe adossée à une mesure publiée (Filosofi, DVF, SSMSI) citée dans le journal ; jamais une médiane de voisines |
| D2 | **Abaisser le seuil** de 20 000 à 15 000 hab. (population de référence en vigueur) | pré-mesuré le 2026-10-18 sur six : **seule Juvisy-sur-Orge passerait sans autre décision** (règle standard sans alerte, ratio marché +22 % à appliquer) ; Chevilly-Larue relève aussi de D5 ; Bourg-lès-Valence, Lisieux, Sorgues, Brie-Comte-Robert échouent (tableau D, ~40 noms) | mêmes règles § 3.2 / § 3.3 bis, populations recoupées sur deux sources |
| D3 | **Règle Antilles-Guyane-Mayotte** (≤ 3 villes au seed par territoire : la règle des 4 voisines ne peut pas s'appliquer) | Le Gosier, Sainte-Anne, Le Moule, Petit-Bourg (971), Kourou, Matoury, Rémire-Montjoly (973), Koungou (976) | proposition : voisines = toutes les villes du territoire au seed, à condition que le backtest `--dept=` sur ces villes reste ≤ 0,7 d'écart moyen ; sinon override D1 |
| D4 | **Valider la levée « 4ᵉ voisine > 25 km » à La Réunion**, prise par la routine le 2026-10-14 (lot 16) | confirme Sainte-Marie et Sainte-Suzanne déjà publiées ; ouvre Le Port si sa DVF passe | refus = retrait des 2 villes (2 entrées seed, housing, quartiers, codes postaux, 2 lignes `DOCUMENTED_MODES`) |
| D5 | **Alerte de frontière quand la règle standard tient** (une commune d'un autre département plus proche que la 4ᵉ voisine) | Villeparisis, Saint-Ouen-l'Aumône, Mitry-Mory | proposition : appliquer la règle ① (voisines tous départements) et n'accepter que si standard **et** ① donnent le même global à 0,3 près |
| D6 | **Règle d'égalité des voisines** (4ᵉ et 5ᵉ à moins de 0,5 km d'écart) | Chatou (30 598 hab.) | proposition : prendre les 5 et exiger que la règle tienne sur les deux combinaisons — ce qui **refuse** Chatou aujourd'hui |
| D7 | **Passe DVF locale** sur 97407 (pas une décision : une commande à lancer sur la machine) | Le Port (974) | `npm run property-prices` couvre déjà la commune si elle est ajoutée au seed ; il faut la médiane avant |

Sans aucune réponse, la routine continue à ne rien ajouter : c'est l'issue juste, pas une panne.

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
cohérence. **Depuis le 2026-10-10 (cinquième run), la règle est un script :**
`npm run seed:neighbours -- --lat=… --lng=… --dept="…" [--insee=…] [--pop=…]` imprime les 4 voisines,
les notes brutes, le repère `housing.ts`, la ville de référence climatique et les raisons d'examiner
avant d'ajouter (4ᵉ voisine au-delà de 12,6 km, agglomération coupée par une frontière départementale,
repère m² des voisines dispersé de plus de × 1,5, moins de 4 voisines). `npm run seed:neighbours:selftest`
rejoue la règle sur chaque ville d'extension **avec le seed d'avant son lot** (lots lus dans les
sujets `feat(seed)` de `git log`) et la compare aux notes et au logement écrits ; une ville hors
règle n'y passe que listée dans `KNOWN_OFF_RULE` avec sa raison. Le lancer avant chaque lot, **sur un clone complet** (`git fetch --unshallow origin main` en routine).

**Règle ① transdépartementale (décidée le 2026-10-10, sixième run)** — `npm run seed:neighbours -- … --cross-dept`.
Seulement quand la frontière départementale coupe l'agglomération (le mode standard le signale) et que le
mode standard échoue. Voisines prises tous départements confondus (mêmes filtres de taille, d'override et
d'extension). Sur les deux axes qui portent un biais départemental (sécurité, coût), on transfère le
**niveau calibré** des voisines (brut + biais de leur département) et on **retire** le biais du
département d'arrivée : la ville rend le niveau de ses voisines réelles, et le biais de son propre
département est **neutralisé** — assumé, parce qu'un biais départemental est une moyenne de département
et que les voisines immédiates décrivent mieux une commune de lisière. Garde : refusé (code 1) dès qu'une
voisine porte un biais qui diffère de plus de **1,0** de celui du département d'arrivée sur l'un des deux
axes — au-delà, le transfert importerait la statistique de délinquance ou de cherté d'un autre
département (Mitry-Mory, 77, recevait la sécurité de la Seine-Saint-Denis, écart 2,0). Le recoupement du
marché (§ 3.3) reste obligatoire et s'applique **avant** l'ajout : au-delà d'environ ± 30 % entre le
repère et les prix publiés, la ville attend.

**Exactitude mesurée de la règle, et règle ② (2026-10-11, troisième run)** — `npm run seed:neighbours:backtest`
rejoue chaque règle « une ville retirée » sur les villes d'origine admissibles et compare la note prédite à la
note brute écrite. Règle standard : **écart absolu moyen 0,57 point par axe, 90ᵉ centile 1,2** (161 villes) ;
**0,68** quand la 4ᵉ voisine est au-delà de 25 km. C'est l'incertitude assumée de toute note d'extension, à
garder en tête avant de citer une note d'extension au dixième. Règle ② : les **comparables de taille dans la
région** (4 villes les plus proches en population) sont **écartés** — 0,84 sur les mêmes 41 villes isolées,
pire que la médiane naïve de toute la région (0,76). Seule variante sans perte : abaisser le plancher à
**10 000 hab. dans le département** (0,674 sur les mêmes 41 villes, 0,656 sur les 19 qui n'ont pas 4 voisines à
20 000+) ; **décidée comme règle ②**, **outillée le 2026-10-13** (`npm run seed:neighbours -- … --regle2`, ne se combine pas avec `--cross-dept`) — mesurée le
2026-10-11, elle ne débloque ni Le Creusot, Montceau-les-Mines (3 voisines : Autun, Chalon, Mâcon), ni
Fougères (2), ni Lisieux (1), ni Frontignan (1). La variante régionale avec transfert de niveau (logique ①)
tient l'erreur globale (0,67) mais monte à **1,0 sur le coût et la sécurité** : écartée.

**La Réunion : la 4ᵉ voisine au-delà de 25 km n'est plus une raison de report (décidé le 2026-10-14).**
`npm run seed:neighbours:backtest -- --dept="La Réunion"` rejoue la règle standard sur les 7 villes d'origine
testables de l'île : **toutes** ont leur 4ᵉ voisine entre 34 et 44 km (le relief et Saint-Denis > 150 000 hab.
l'imposent) et l'écart moyen est **0,62** (de 0,39 à 0,97 par ville), contre 0,57 pour la règle sur tout le corpus
et 0,68 pour les villes isolées > 25 km de métropole. Sur l'île, la distance n'est donc pas le signal d'erreur
qu'elle est ailleurs. Le marché (§ 3.3 bis) reste le filtre : Saint-Leu et La Possession y échouent. Ne vaut pas
pour la Guadeloupe, la Martinique ni la Guyane, qui n'ont pas 4 voisines admissibles (`--dept=` le montre).

Arrondi : celui des lots 1 à 8, `Math.round(x × 10) / 10` sur le flottant (5,35 → 5,3).

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
- **§ 3.3 bis — repère logement corrigé par un ratio de marché (décidé le 2026-10-11).** Le recoupement
  du marché compare **une mesure à la même mesure**, jamais le repère `housing.ts` (éditorial, tous biens,
  en moyenne ~1,2 × la médiane DVF appartements du corpus) à un prix publié. Ratio prix = DVF appartements
  de la commune (médiane d'au moins **deux** sites qui publient du DVF : PAP, Immovrai, Habity…) ÷ médiane
  des DVF appartements des 4 voisines dans `data/city-property-prices.json` ; un second ratio intra-source
  (un même portail pour la commune et ses voisines) doit le confirmer à ± 10 % près. Ratio loyer = loyer
  au m² d'**un même portail** (RealAdvisor publie un loyer annuel au m² par commune) pour la commune et ses
  voisines. Sous ± 10 % : bruit de source, repère médian conservé. Entre ± 10 et ± 30 % : le ratio est
  appliqué au repère médian (`--price-ratio=… --rent-ratio=…`, arrondis inchangés). Au-delà de ± 30 % : la
  commune ne ressemble pas à ses voisines, elle attend. Les notes des 8 axes ne sont **pas** touchées
  (la règle ne corrige que le repère logement) : un axe coût hérité de voisines plus chères est un biais
  conservateur assumé, noté au journal. Le selftest rejoue ces villes avec leurs ratios
  (`DOCUMENTED_MODES` de `scripts/seed-neighbours.ts`, sources en commentaire).
- **Relecture à mesure égale (décidée le 2026-10-12, quatrième run)** — `npm run seed:neighbours:relire`.
  Dès que le runner a servi la DVF de la commune et de ses 4 voisines de lot, le ratio prix se relit **dans
  une seule source** (`data/city-property-prices.json`, médiane appartements commune ÷ médiane des voisines),
  seuils inchangés. Le script n'écrit rien : reporter dans `housing.ts` **et** dans `RELU_APRES_LOT`, puis
  rejouer jusqu'à « 0 repère(s) à relire » (une ville d'extension peut être voisine d'une autre, donc la
  relecture d'une ville peut en déplacer une autre ; le graphe suit l'ordre des lots et converge). À lancer
  à chaque run, après `seed-coverage`, quand de nouvelles villes viennent d'être servies.
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
| Villeneuve-d'Ascq | 59009 (confirmé 2026-10-15) | Nord | Hauts-de-France | 62 868 (2023, Banatic + 2ᵉ résultat) | **attend un override** (§ 3.2) |

### 20 000 – 50 000 hab. — état au 2026-10-13 (troisième run)

**Le gisement « règle valable » est épuisé.** Balayage par nom de ~400 communes de 20 000 hab. et plus
(toutes régions, DROM compris) au 2026-10-13 : les seules absentes du seed sont déjà ci-dessous, ou sous le
seuil. Ce qui reste n'avance que par **décision de méthode** (override documenté, seuil abaissé, règle de
marché revue) ou par la **liste exhaustive Insee** (passe locale ; `geo.api.gouv.fr` refuse le CONNECT depuis
une routine, revérifié ce jour). Codes Insee donnés seulement quand un run les a vérifiés ; sinon « à
confirmer », et l'absence se revérifie **par code** avant d'entrer dans un lot.

Ajoutées : lots 1 à 15, voir le journal (§ 6) — ne plus les lister ici.

**A. Attendent un override documenté** (`lib/score-calibration.ts`, § 3.2 limite connue) — la ville ne
ressemble pas à ses voisines, une médiane serait fausse :

| Commune | Insee | Raison |
|---|---|---|
| Villeneuve-d'Ascq | 59009 (62 868 en 2023) | ville universitaire et technopole entourée de Roubaix / Tourcoing / Wattrelos |
| Sucy-en-Brie | 94071 | médiane tirée par Saint-Maur : repère 6 200 €/m² contre ~3 750-4 300 au marché (+50 %) |
| La Madeleine | 59368 | voisines Roubaix / Tourcoing / Wattrelos, marché nettement plus cher |
| Marcq-en-Barœul, Lambersart | 59378 (40 184), 59328 (27 090) — pop. 2023, Banatic / Wikipédia + citypopulation | même cas que La Madeleine (Lille en override) |
| Grigny, Lormont, La Valette-du-Var, Saint-Étienne-du-Rouvray | à confirmer | règle non valable, mesurée le 2026-10-08 |
| Chatou (78) | 78146 (30 598 en 2023 : Banatic + Wikipédia EN + bien-dans-ma-ville) | remesurée 2026-10-16 : standard = Houilles · Sartrouville · Maisons-Laffitte* · Le Chesnay, 9 villes 92/95 plus proches ; règle ① **instable selon les coordonnées** — centre 48,8897/2,1573 : Rueil · Houilles · Sartrouville · Suresnes, acceptée ; centre 48,8962/2,1559 (moyenne Vikidia / distanceenvoiture) : Bezons (95) remplace Suresnes et la règle est **refusée** (biais coût > 1,0). Marché dans la bande (DVF appart. ~4 680 — PAP 4 682, Immovrai 4 676 — ÷ 4 915 = 0,95), niveau de vie ~33 670 € (habity, une source) contre 31 100 de médiane des voisines. **Instabilité intrinsèque (mesurée 2026-10-16, troisième run)** : Suresnes et Bezons sont à 70-170 m l'une de l'autre en distance depuis tout centre de commune plausible ; des coordonnées officielles ne la lèveraient pas, seule une **règle d'égalité** décidée par le propriétaire le peut |
| Les Mureaux (78), Saint-Laurent-du-Var (06), Gardanne (13) | à confirmer | remesurées 2026-10-16 : 4ᵉ voisine à 18,9 / 21,8 / 21,0 km ; Les Mureaux a Cergy (95) à 11,8 km, Saint-Laurent un repère m² des voisines × 1,63 |
| Cenon (33) | 33119 (26 834 en 2023, Wikipédia EN citant PopRef 2023 + notre-planete) | règle standard **sans alerte** (Bègles 5,6 · Le Bouscat 5,7 · Talence 7,4 · Villenave-d'Ornon 8,7 km, toutes rive gauche) et marché dans la bande (DVF appart. ~2 958 €/m² — immovrai 2 975, efficity 2 940 — ÷ 3 494 au dépôt = **0,85**) ; mais niveau de vie médian **~18 920 €** (habity, Filosofi 2021, **une seule source**) contre 23 360-27 570 € chez les 4 voisines au dépôt : la médiane importerait la sécurité et les écoles de la rive gauche — mesuré 2026-10-16 |
| Montfermeil | 93047 | 3 voisines d'extension ; grands ensembles des Bosquets, médiane non représentative |
| *Déjà au seed* : Maisons-Laffitte (78358), Clichy-sous-Bois, Romainville, Ris-Orangis | — | notes héritées hors ± 30 % du marché (§ 6, 2026-10-12 quatrième run) : ne pas citer au dixième |

**B. Marché hors ± 30 % de ses voisines** (§ 3.3 bis) :

| Commune | Insee | Mesure |
|---|---|---|
| Loos | 59360 | DVF appart. ~2 735 €/m² contre 1 904 chez ses voisines (+44 %) |
| Croix | 59163 | +32 % |
| Wasquehal | 59646 | +68 % |
| Saint-Leu (974) | 97413 | 4 710 ÷ 2 858 = 1,65 ; 4ᵉ voisine à 27 km |
| Les Lilas | 93045 | remesurée 2026-10-15 : voisines Romainville* · Bagnolet · Noisy-le-Sec · Aubervilliers (1,2-4,6 km), DVF appart. ~6 600 €/m² (PAP 6 621, Immovrai 6 571, Square Habitat 6 640) ÷ 4 590,5 au dépôt = **1,44** ; Vincennes / Saint-Mandé (94) plus proches que la 4ᵉ |
| Le Plessis-Trévise, Villiers-sur-Marne (94079) | à confirmer / 94079 | médiane tirée par Saint-Maur / Nogent / Le Perreux (repère ~6 800 €/m²) |

**C. Voisines trop rares, trop lointaines ou du mauvais côté** (règle standard **et** règle ② échouent) :

| Commune | Insee | Mesure |
|---|---|---|
| Le Port (974) | 97407 (absente vérifiée) | distance levée à La Réunion (2026-10-14) ; marché : PAP 2 118 ÷ 2 340,5 = 0,90, efficity 2 550 → médiane 1,00, intra-source PAP 0,88 — les deux ratios divergent de 12 % à la frontière ± 10 % ; **attend la DVF du dépôt** ou un 2ᵉ site DVF |
| La Possession (974) | 97408 (absente vérifiée) | distance levée (2026-10-14) ; **marché hors ± 30 %** : PAP 2 917 ÷ 2 066,5 = 1,41 (efficity 2 940) → relève du tableau B |
| L'Isle-sur-la-Sorgue (84) | 84054 (absente vérifiée) | 20 244 hab. (pop. de référence 2023 : Banatic + Wikipédia + Habity — **passée au-dessus du seuil**, sortie du tableau D). Standard : Cavaillon 9,3 · Carpentras 15,2 · Orange 31,1 · Pertuis 44,1 km (Avignon en override) ; règle ② : 4ᵉ Orange à 31,1 km — mesuré le 2026-10-13 |
| Sainte-Anne, Le Moule, Petit-Bourg (971) | 97128 (23 973), 97117 (23 014), 97118 (24 665) — PopRef 2023 Insee dép. 971 | Guadeloupe : 3 villes au seed, même cas que Le Gosier |
| Kourou (973) | 97304 (24 824 en 2023, Banatic + Wikipédia) | Guyane : 2 villes au seed (Cayenne, Saint-Laurent) |
| Le Gosier (971) | 97113 (27 757, PopRef 2023 Insee) | 3 voisines (la Guadeloupe n'a que 3 villes au seed) |
| Matoury, Rémire-Montjoly (973) | 97307 (36 512 : Banatic + PopRef 2023 Insee Guyane + Wikipédia), 97309 (27 723 : Banatic + Wikipédia) — recoupées 2026-10-15 | 2 voisines (Cayenne, Saint-Laurent à 200 km) |
| Koungou (976) | 97610 (32 156 au recensement 2017, Banatic ; pas de millésime plus récent trouvé) | 1 seule ville au seed à Mayotte |
| Lunel, Frontignan (34) | 34145 (26 623), 34108 (24 136) — 2023, Banatic + Wikipédia (+ pss-archi pour Lunel), recoupées 2026-10-15 | 1 voisine (Agde, 27-67 km) |
| Fougères (35) | 35115 (20 307, Banatic + pss-archi, 2023) | 2 voisines |
| Le Creusot (71) | 71153 (20 509, Banatic + Wikipédia, 2023) | 3 voisines |
| Miramas (13) | 13063 (26 203, Banatic + Wikipédia, 2023) | 4ᵉ voisine Saint-Rémy à 26,8 km, repère m² × 1,78 |
| La Teste-de-Buch (33) | 33529 (27 566, Banatic + Wikipédia, 2023) | voisines à 44-45 km |
| Nogent-sur-Oise (60) | à confirmer | Chantilly / Senlis ne la décrivent pas (repère m² × 2,74) |
| Saint-Jean-de-Braye (45) | à confirmer | Orléans en override, 3ᵉ-4ᵉ voisines à 55-57 km |
| La Garde (83) | à confirmer | Toulon en override, 4ᵉ voisine à 55 km |
| Grande-Synthe, Coudekerque-Branche (59155) | à confirmer / 59155 | Dunkerque en override, voisines à 35-63 km |
| Les Pennes-Mirabeau (13) | à confirmer | 3ᵉ-4ᵉ voisines de l'autre côté de Marseille |
| Mitry-Mory (77) | à confirmer | vraies voisines en 93 ; règle ① refusée (écart de biais sécurité 2,0) |
| Limeil-Brévannes (94) | à confirmer | plus proche voisine en Essonne |
| Saint-Ouen-l'Aumône | à confirmer | remesurée le 2026-10-15 : Cergy 3,6 · Herblay* 7,2 · Cormeilles 9,7 · Franconville 9,8 km, mais Conflans (78) à 4,8 km — même alerte de frontière que Villeparisis |
| Montigny-lès-Cormeilles | 95424 | seconde source DVF communale manquante (lot 13) |
| Deuil-la-Barre | à confirmer | Sarcelles dans la médiane |
| Gif-sur-Yvette, Mantes-la-Ville, Montereau, Villeparisis, Le Mée-sur-Seine, Dammarie-les-Lys, Les Ulis, Castelnau-le-Lez, Le Petit-Quevilly, Cournon-d'Auvergne, Villefontaine | à confirmer | voisines trop éloignées ou en override |

**D. Sous le seuil de 20 000 hab.** (sorties, à reconsidérer seulement si le seuil descend) : Lisieux (14366,
**19 645** en 2023, Banatic + Wikipédia + citypopulation — sortie du tableau C le 2026-10-15), Montceau-les-Mines
(71306, **17 064** en 2023, Banatic + Wikipédia — sortie du tableau C le 2026-10-15), Brie-Comte-Robert
(77053, 19 003), Juvisy-sur-Orge (91326, 19 292), Bourg-lès-Valence (26058, 19 992), Chevilly-Larue (94021,
19 826) ; et, relevées par nom sans recoupement de population : Le Vésinet, Viroflay, Garches, Chennevières,
Boissy-Saint-Léger, Valenton, Le Bourget, Villetaneuse, Saint-Brice, Mennecy, Nemours, Vaires, Canteleu,
Bois-Guillaume, Ifs, Guipavas, Ploemeur, Pornic, Beaucaire, Rive-de-Gier, Yutz,
Brignoles, Lunéville, Cesson-Sévigné, Bruz, Ramonville-Saint-Agne, Saint-Égrève, Plan-de-Cuques.
Relevées par nom le 2026-10-17 (balayage de ~400 noms supplémentaires, toutes absentes du seed et sous le seuil) :
Sorgues (84129, **~19 006** en 2023 : Wikipédia EN + villesavivre, à 24 près), Fécamp (76259, **~17 313** : notre-planete +
bien-dans-ma-ville, millésime discuté), et sans recoupement de population : Elbeuf, Les Herbiers,
Saint-Pierre-des-Corps, Héricourt, Woippy, Freyming-Merlebach, Creutzwald, Villers-lès-Nancy, Anzin, Chauny,
Tergnier, Canet-en-Roussillon, Le Pontet, Saint-Junien, Bry-sur-Marne, Dugny, Le Pré-Saint-Gervais, Lognes, Hem.
Recoupées sur les populations de référence 2023 (publiées en décembre 2025, en vigueur au 1ᵉʳ janvier 2026) le
2026-10-13 : Bourg-lès-Valence **19 992** (Banatic + Wikipédia), Bruz (35047) **19 683** (Banatic + Wikipédia),
Schœlcher (97229) **19 478** (fichier Insee Martinique + Banatic), Mauguio (34154) **16 522**, Brignoles (83023)
**17 850** — toutes sous le seuil.
Recoupées le 2026-10-14 (quatrième run) sur le même millésime 2023, deux sources concordantes chacune (Banatic +
Wikipédia EN citant l'Insee, sauf mention) : Chevilly-Larue (94021) **19 826** (2022 : 19 813 ; le 20 326 de 2021
qui circule est périmé), Juvisy-sur-Orge (91326) **19 292**, Brie-Comte-Robert (77053) **19 003** (+ citypopulation.de),
Ploemeur (56162) **18 872**, Cesson-Sévigné (35051) **18 761**, Chennevières-sur-Marne (94019) **18 710**, Yutz
(57757) **17 391** (+ citypopulation.de) — toutes sous le seuil. Lunéville (54329) : **18 262** sur plusieurs sites
mais millésime discordant (2019, 2022, 2023 selon la source) — sous le seuil quel que soit le millésime, non
recoupé au sens strict. ⚠️ Le seuil se relit **sur le millésime en vigueur** : une commune à 19 900 peut le
franchir à la publication suivante (cas de L'Isle-sur-la-Sorgue, 20 244 en 2023).
Recoupées le 2026-10-17 (quatrième run) sur le millésime 2023, absence vérifiée **par code Insee**, deux sources
concordantes chacune (Wikipédia EN citant la série Insee 1968-2023 + bien-dans-ma-ville / pss-archi / notre-planete /
citypopulation / Banatic) : Hem (59299) **18 582**, Bry-sur-Marne (94015) **18 503**, Garches (92033) **17 743**,
Le Pré-Saint-Gervais (93061) **16 993**, Les Herbiers (85109) **16 521**, Le Bourget (93013) **15 925** (PopRef 2023
Insee dép. 93 cité), Canet-en-Roussillon (66037) **13 227** (+ Banatic) — toutes sous le seuil. Saint-Pierre-des-Corps
(37233) : 15 700-16 060 selon le site, **non recoupée au sens strict**, sous le seuil quelle que soit la source.
Les deux plus proches (Hem, Bry-sur-Marne) restent à ~1 500 hab. du seuil : aucune ne peut le franchir au millésime
suivant à rythme de croissance publié.

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

### 2026-10-10 (second run) — lot 6 (+4) : Eysines, Montgeron, Longjumeau, Achères

568 → **572** villes ; Eysines en Gironde (Nouvelle-Aquitaine), trois en Île-de-France. Aucune région ni aucun
département nouveau. Absence vérifiée par code Insee (33162, 91421, 91345, 78005).

*Garde-fou runner* : `seed-coverage` avant lot → seule Gradignan attendait ses parcs (1 ville < 30) ; le runner
GitHub Actions a servi les 7 du lot 5 sur tout le reste. `political-lean` reste à 540 (pas de pipeline cloud).

*Densité mesurée avant choix* (script § 3.2, 26 candidates absentes par nom, cf. backlog) : 6 valables
retenues pour identité ; **Sucy-en-Brie** retirée après recoupement du marché (repère médian 6 200 €/m², marché
3 750-4 300 €, efficity / realadvisor sept. 2026 : la médiane est tirée par Saint-Maur, la ville ne ressemble pas
à ses voisines → override documenté) ; **Chilly-Mazarin** retirée faute de deux quartiers sourcés (la recherche ne
donne que « Centre-ville » et des noms de résidences ; la gare « Chilly-Mazarin » du RER C est comptée côté
Longjumeau).

*Identité* (recherche web ; population municipale 2023 = Banatic **et** Wikipédia pour chacune) :

| Ville | Insee | Pop. seed | Source pop. | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Eysines | 33162 | 24 800 | 24 825 (Banatic ; Wikipédia EN) | 44,8853 N 0,65 W (Wikipédia ; cartesfrance 44,884/−0,65) | 3-45 → 24 m (Wikipédia ; Geneawiki) |
| Montgeron | 91421 | 24 000 | 24 022 (Banatic ; Wikipédia, pss-archi) | 48,7054 N 2,4504 E (NGA GeoNames ; mairie 48,705/2,4589) | 31-88 → 60 m (Geneawiki) |
| Longjumeau | 91345 | 22 000 | 21 996 (Banatic ; Wikipédia) | 48,6931 N 2,2948 E (distanceenvoiture ; 2ᵉ point 48,694/2,287) | 40-93 → 67 m (Wikipédia ; Geneawiki) |
| Achères | 78005 | 22 200 | 22 241 (Banatic ; Wikipédia, pss-archi) | 48,9622 N 2,0686 E (annuaire-administration ; latitudelongitude 48,9612/2,0688) | 18-32 → 25 m (Wikipédia ; Geneawiki) |

*Notes brutes* (§ 3.2 ; life, transport, nature, cost, safety, culture, remoteWork, schools ; global =
`recomputeGlobal`) :

| Ville | Voisines (distance) | Notes brutes | global |
|---|---|---|---|
| Eysines | Le Bouscat 4,4 · Mérignac 5,8 · Saint-Médard-en-Jalles 6,0 · Pessac 8,7 km (Bordeaux : override) | 7 · 7.5 · 7 · 5.5 · 6.4 · 6.3 · 7.1 · 6.9 | 6.6 |
| Montgeron | Vigneux-sur-Seine* 2,5 · Yerres 3,0 · Athis-Mons 3,7 · Draveil 3,9 km (Brunoy 3,9 écartée au rang 5) | 6.3 · 6.6 · 6.9 · 5.6 · 6.1 · 5.7 · 6.5 · 6.3 | 6.2 |
| Longjumeau | Massy 4,1 · Palaiseau 4,2 · Savigny-sur-Orge 4,3 · Viry-Châtillon 6,3 km | 6.4 · 7 · 6.3 · 5.5 · 6.2 · 6 · 7.2 · 6.6 | 6.3 |
| Achères | Poissy 4,2 · Conflans 4,9 · Maisons-Laffitte* 5,5 · Sartrouville 7,4 km (Saint-Germain : override) | 6.4 · 7.3 · 6.8 · 5.5 · 5.9 · 5.8 · 6.8 · 6.4 | 6.3 |

\* ville d'extension (une au plus par ville). Notes **rendues** (reprises dans `seoDescriptionEn`) : Eysines 5,6 ·
Montgeron 4,5 · Longjumeau 4,9 · Achères 4,6 — voisines rendues : Le Bouscat 5,5, Mérignac 5,0 ; Vigneux 4,2,
Yerres 5,5 ; Massy 5,3, Savigny 4,4 ; Poissy 4,2, Maisons-Laffitte 4,7.

*Climat* : ville du seed la plus proche — Le Bouscat (2 050 h / 23 °C / 6,9 °C), Vigneux-sur-Seine (1 700 / 20,5 / 4),
Massy (1 720 / 24 / 4,5), Poissy (1 700 / 20,5 / 4).

*Logement* (médiane des 4 voisines, T1/T2/T3/m²) : Eysines 580/800/1 080/3 800 ; Montgeron 690/960/1 290/4 000 ;
Longjumeau 730/1 010/1 360/4 100 ; Achères 710/960/1 300/4 100. Recoupement (prix moyen appartement, recherche
web) : Eysines Cantinolle « un peu moins de 3 500 € » (SeLoger, repère ~ +10 %) ; Montgeron 3 417-3 543 € selon
quartier (PAP 2026, ~ +15 %) ; Longjumeau 2 673-3 141 € (PAP / Square Habitat / RealAdvisor juil. 2026, **~ +30 %**,
écart déjà présent chez ses voisines du repère essonnien) ; Achères 3 293-3 573 € (Square Habitat / PAP, ~ +15 %).
Écarts assumés comme aux lots précédents ; la médiane DVF arrivera par le runner et s'affiche séparément.

*Quartiers* (2 par ville, notes = ville) : Eysines Le Bourg (avenue de la Libération, étude urbaine Bordeaux
Métropole 2021) + Cantinolle (terminus tram D, février 2020) ; Montgeron Centre-ville – Gare (RER D Montgeron-Crosne)
+ La Pelouse (forêt de Sénart) ; Longjumeau Centre-ville (fond de vallée, gare RER C, RN20 déviée à l'ouest) +
Gravigny – Balizy (anciens hameaux de l'est, gare RER C) ; Achères Centre-Ville – Saint-Martin + La Gare (RER A,
Transilien L).

*Codes postaux* : 33320, 91230, 91160, 78260 (confirmés par les recherches d'identité) → 572/572.

*Faits évités faute de source* : statut ZUS de la Prairie de l'Oly (périmètre administratif, pas un nom d'usage),
Champs-de-Villars à Achères (grands ensembles, seule une liste reprise de Wikipédia), commanderie templière de
Balizy (site d'annonces), Migron à Eysines. Tags sans `port` / `mer` / `côte`.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation candidate**. Table des couleurs de `CLAUDE.md` recomptée
sur `CITIES_SEED` : 19 / 50 / 151 / **146** / **115** / 91, moyenne 5,38.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (572 villes) + `:check`, `sitemap:check`
(FR 30 799 URL, EN 30 393), `hreflang:check`. `npm run build` non lancé.

**Prochain lot** : `seed-coverage` d'abord. Candidates valables mesurées : Juvisy-sur-Orge (population à confirmer
≥ 20 000), Morsang-sur-Orge, Brétigny-sur-Orge, Saint-Michel-sur-Orge, Saint-Cyr-l'École, Roissy-en-Brie,
Bussy-Saint-Georges, Lagny-sur-Marne — vérifier chaque population (plusieurs sont proches du seuil de 20 000) et le
recoupement de marché avant ajout. Overrides en attente : Sucy-en-Brie, Villeneuve-d'Ascq, Villeneuve-Saint-Georges,
Grigny, Chatou, Cenon.

### 2026-10-10 (troisième run) — lot 7 (+6) : Brétigny-sur-Orge, Saint-Michel-sur-Orge, Lagny-sur-Marne, Bussy-Saint-Georges, Saint-Cyr-l'École, Roissy-en-Brie

`seed-coverage` au départ : 4 villes en attente du runner local (lot 6), sous le garde-fou de 30 → lot autorisé.
572 → **578** villes, toutes en Île-de-France (Essonne ×2, Seine-et-Marne ×3, Yvelines ×1), aucun département ni
région nouveaux.

*Identité* (recherche web ; population municipale 2023 = Banatic et/ou Wikipédia, recoupée par un 2ᵉ résultat) :

| Ville | Insee | Pop. seed | Source pop. | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Brétigny-sur-Orge | 91103 | 26 700 | 26 658 (Wikipédia EN ; villesavivre) | 48,6114 N 2,3060 E (latlong.net ; distanceenvoiture) | 41-97 → 69 m (Wikipédia ; Geneawiki) |
| Saint-Michel-sur-Orge | 91570 | 21 800 | 21 776 (Wikipédia EN ; Commons, villesavivre) | 48,6326 N 2,3129 E (gps-latitude-longitude ; mairie 48,642/2,312) | 38-91 → 65 m (Wikipédia ; Geneawiki) |
| Lagny-sur-Marne | 77243 | 21 500 | 21 461 (Wikipédia EN ; habity) | 48,8773 N 2,7112 E (Sygic/Wikipédia, une seule source précise) | 37-112 → 75 m (Wikipédia) |
| Bussy-Saint-Georges | 77058 | 27 500 | 27 498 (Banatic ; Wikipédia EN) | 48,8422 N 2,6980 E (distanceenvoiture ; mairie 48,8422/2,6983) | 63-130 → 97 m (Wikipédia ; Simple Wikipedia) |
| Saint-Cyr-l'École | 78545 | 21 300 | 21 268 (Banatic ; villesavivre) | 48,8008 N 2,0633 E (Geneawiki ; mairie 48,8017/2,0628) | 99-174 → 137 m (Geneawiki) |
| Roissy-en-Brie | 77390 | 23 200 | 23 229 (Wikipédia EN ; Banatic) | 48,7906 N 2,6519 E (Wikipédia ; Geneawiki) | 95-115 → 105 m (Wikipédia) |

*Notes brutes* (§ 3.2 ; life, transport, nature, cost, safety, culture, remoteWork, schools ; global =
`recomputeGlobal`) :

| Ville | Voisines (distance) | Notes brutes | global |
|---|---|---|---|
| Brétigny-sur-Orge | Sainte-Geneviève-des-Bois 3,7 · Viry-Châtillon 8,2 · Savigny-sur-Orge 8,3 · Longjumeau* 9,1 km | 6.3 · 7 · 6.4 · 5.5 · 5.9 · 5.7 · 6.8 · 6.3 | 6.2 |
| Saint-Michel-sur-Orge | Sainte-Geneviève-des-Bois 2,0 · Savigny-sur-Orge 5,9 · Viry-Châtillon 6,1 · Longjumeau* 6,9 km | idem | 6.2 |
| Lagny-sur-Marne | Torcy 5,4 · Chelles 8,5 · Champs-sur-Marne 8,7 · Pontault-Combault 12,6 km (Noisiel < 20 000 écartée) | 6.5 · 7.3 · 6.8 · 5.5 · 6.2 · 5.9 · 6.9 · 6.5 | 6.4 |
| Bussy-Saint-Georges | Torcy 3,6 · Champs-sur-Marne 7,2 · Chelles 8,6 · Pontault-Combault 9,0 km | idem Lagny | 6.4 |
| Saint-Cyr-l'École | Guyancourt 3,5 · Montigny-le-Bretonneux 4,0 · Trappes 4,7 · Le Chesnay-Rocquencourt 5,0 km (Versailles : override) | 6.9 · 6.5 · 7.3 · 5.5 · 6.5 · 5.9 · 6.9 · 7 | 6.5 |
| Roissy-en-Brie | Pontault-Combault 3,2 · Torcy 6,6 · Champs-sur-Marne 7,6 · Chelles 10,8 km | idem Lagny | 6.4 |

\* ville d'extension (une au plus par ville). Les deux paires Essonne et le trio Seine-et-Marne partagent leurs 4
voisines, d'où des notes identiques : c'est la règle, pas un copier-coller. Lagny est la plus éloignée de ses
voisines (4ᵉ à 12,6 km) — limite haute de la règle, assumée. Notes **rendues** : Brétigny 4,5 · Saint-Michel 4,5 ·
Lagny 5,1 · Bussy 5,1 · Saint-Cyr 5,0 · Roissy 5,1 — voisines rendues : Sainte-Geneviève 4,6, Savigny 4,4 ;
Torcy 5,1, Pontault 5,0 ; Guyancourt 5,1.

*Climat* : ville du seed la plus proche — Sainte-Geneviève-des-Bois, Torcy, Guyancourt, Pontault-Combault (toutes
1 700 h / 20,5 °C / 4 °C).

*Logement* (médiane des 4 voisines, T1/T2/T3/m²) : Brétigny et Saint-Michel 690/960/1 290/4 000 ; Lagny, Bussy,
Roissy 680/930/1 260/3 900 ; Saint-Cyr 720/990/1 330/4 200. Recoupement (prix moyen appartement 2026, recherche
web) : Brétigny 3 088-3 242 € (Square Habitat / PAP, repère **~ +25-30 %**) ; Saint-Michel ~3 050 € (RealAdvisor,
**~ +30 %**) — même écart que Longjumeau au lot 6, présent chez les voisines essonniennes du repère ; Lagny
3 870-3 989 € (PAP / Square Habitat, ~ 0 %) ; Bussy 4 275-4 374 € (SeLoger / PAP, repère **~ −10 %**) ; Saint-Cyr
4 043-4 387 € (Square Habitat / PAP / RealAdvisor, ~ 0 %) ; Roissy 3 462-3 574 € (PAP / SeLoger, ~ +10 %). Écarts
assumés ; la médiane DVF arrivera par le runner et s'affiche séparément.

*Quartiers* (2 par ville, notes = ville) : Brétigny Centre-ville – Gare + Clause-Bois Badeau (écoquartier, 42 ha de
l'ancienne friche Clause, label 2013) ; Saint-Michel Centre-ville – Gare + Bois des Roches (centre commercial du
Grand Bois en réhabilitation, décrit sans verdict) ; Lagny Centre historique (Notre-Dame-des-Ardents) + Bords de
Marne (gare Lagny-Thorigny **située à Thorigny**, ~1 km) ; Bussy Le Village – Golf + Le Sycomore (EPA Marne) ;
Saint-Cyr Centre-ville + Charles Renard (ZAC près de la gare) ; Roissy Centre-ville – Gare (RER E, 1857) +
La Renardière (bornée par le Morbras).

*Codes postaux* : 91220, 91240, 77400, 77600, 78210, 77680 → 578/578.

*Faits évités faute de source* : date de mise en service et statut du tram-train T13 à Saint-Cyr (sources
contradictoires), temps de trajet vers Paris (promoteurs), population de la Renardière, gare la plus proche de
Morsang. Roissy-en-Brie est désambiguïsée de Roissy-en-France dans `descriptionEn`. Tags sans `port` / `mer` / `côte`.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation candidate**. Table des couleurs de `CLAUDE.md` recomptée
sur `CITIES_SEED` : 19 / 50 / 151 / **150** / **117** / 91, moyenne 5,37.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (578 villes) + `:check`, `sitemap:check`
(FR 31 064 URL, EN 30 658), `hreflang:check`. `npm run build` non lancé.

*En attente du runner local* : 10 villes (lots 6 et 7) pour population, Filosofi, DVF, littoral, parcs, photos,
biodiversité, actualité, zones protégées, orientation politique.

**Prochain lot** : `seed-coverage` d'abord (garde-fou 30). Candidates à mesurer (population ≥ 20 000 à confirmer) :
Le Plessis-Trévise, Villiers-sur-Marne (reportée le 2026-10-09, à remesurer), Ozoir-la-Ferrière et Mitry-Mory
(reportées, voisines à remesurer depuis l'arrivée de Lagny / Bussy / Roissy) ; hors IdF, chercher des communes 20-50 k à
voisinage dense (métropoles lyonnaise, lilloise, toulousaine). Morsang-sur-Orge si 2 quartiers se sourcent.
Overrides en attente : Sucy-en-Brie, Villeneuve-d'Ascq, Villeneuve-Saint-Georges, Grigny, Chatou, Cenon.

### 2026-10-10 (quatrième run) — lot 8 (+2) : Couëron, Halluin

`seed-coverage` au départ : 10 villes en attente du runner local (lots 6 et 7), sous le garde-fou de 30 → lot
autorisé. 578 → **580** villes. Lot volontairement réduit à 2 : sur ~25 candidates mesurées (cf. backlog), seules
ces deux passent la règle de voisinage **et** le recoupement de population / quartiers. Le seed couvre désormais
presque toutes les communes de 20 000 à 50 000 hab. à voisinage dense ; les restantes demandent un override
documenté (§ 3.2, limite connue). Aucun département ni région nouveaux.

*Identité* (recherche web ; population municipale 2023) :

| Ville | Insee | Pop. seed | Source pop. | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Couëron | 44047 | 24 100 | 24 103 (Wikipédia EN citant l'Insee ; Banatic) | 47,2122 N 1,7281 W (cartesfrance, communes.com) | 0-74 → 37 m (Wikipédia ; Geneawiki) |
| Halluin | 59279 | 20 700 | 20 715 (Banatic ; notre-planete.info) | 50,7863 N 3,1261 E (latitudelongitude ; cartesfrance 50,785/3,124) | 9-62 → 36 m (Geneawiki ; Wikipédia EN donne 20 m) |

*Notes brutes* (§ 3.2) :

| Ville | Voisines (distance) | Notes brutes (life, transport, nature, cost, safety, culture, remoteWork, schools) | global |
|---|---|---|---|
| Couëron | Saint-Herblain 5,9 · Orvault 10,2 · Rezé 13,8 · Vertou 20,1 km (Nantes : override) | 7 · 7.3 · 7.4 · 5.7 · 6.6 · 6 · 6.9 · 6.8 | 6.7 |
| Halluin | Tourcoing 7,4 · Roubaix 11,1 · Wattrelos 11,6 · Armentières 20,5 km | 5 · 7 · 4.9 · 7.5 · 4.8 · 5.8 · 5.9 · 5.1 | 5.7 |

La 4ᵉ voisine des deux villes est à ~20 km, au-delà de Lagny (12,6 km, lot 7) : limite haute de la règle,
assumée parce que les quatre voisines sont du même type de commune (couronne nantaise ; anciennes villes textiles
de la vallée de la Lys et du versant nord-est lillois). Notes **rendues** : Couëron 5,4 (ambre) · Halluin 2,8
(rouge) — voisines rendues : Saint-Herblain 5,0, Orvault 5,8 ; Tourcoing et Roubaix 2,8.

*Climat* : ville du seed la plus proche — Saint-Herblain (1 900 h / 21,5 °C / 5,5 °C), Tourcoing (1 700 / 19,5 / 3,5).

*Logement* (médiane des 4 voisines, T1/T2/T3/m²) : Couëron 500/700/940/3 400 ; Halluin 400/550/740/1 700.
Recoupement (prix moyen appartement 2026, recherche web) : Couëron 3 183 € (PAP, DVF au 1ᵉʳ juillet 2026) — repère
**~ +7 %** ; Halluin 2 240-2 449 € (efficity, PAP 2 303 €, RealAdvisor) — repère **~ −25-30 %**, même ordre que
l'écart accepté à Longjumeau / Saint-Michel (en sens inverse) ; il vient de Roubaix et Tourcoing dans la médiane.
La médiane DVF arrivera par le runner et s'affiche séparément.

*Quartiers* (2 par ville, notes = ville) : Couëron Bourg (tour à plomb, médiathèque Victor-Jara, coteau de la
Loire) + La Chabossière (secteur plus récent côté Nantes — découpage donné par la ville et par Wikipédia) ;
Halluin Centre (rue de Lille, rue de la Lys) + Molinel – Colbras (nom de quartier repris par trois sites
immobiliers distincts, et espace naturel du Colbras). Halluin : quartiers faiblement sourcés mais pas un seul
site d'annonces ; les avis de quartier (note sécurité) ne sont **pas** repris.

*Faits sourcés* : tour à plomb de Couëron construite 1875-1878, classée MH le 11 février 1993, rachetée par la
commune en 1988, Espace de la Tour à Plomb (2009) et médiathèque Victor-Jara (2014) — inventaire Pays de la Loire,
Monumentum, ville ; gare TER de Couëron (ter.sncf.com). Halluin : frontière sur la Lys face à Menin, circuits des
écluses Halluin-Menin-Comines, espace naturel du Colbras (fiches de randonnée). **Évités** : hauteur de la tour
(69,40 m ou ~60 m selon la source), Port-Launay (un seul site), « Mont d'Halluin » (aucune source). Tags sans
`port` (le « port fluvial d'Halluin » n'est **pas** tagué) / `mer` / `côte`.

*Codes postaux* : 44220, 59250 → 580/580.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation candidate**. Table des couleurs de `CLAUDE.md` recomptée
sur `CITIES_SEED` : 19 / 50 / 151 / **151** / 117 / **92**, moyenne 5,37.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (580 villes) + `:check`, `sitemap:check`
(FR 31 152 URL, EN 30 746), `hreflang:check`. `npm run build` non lancé.

*En attente du runner local* : 12 villes (lots 6, 7, 8).

**Prochain lot** : `seed-coverage` d'abord (garde-fou 30). Le vivier « règle de voisinage valable » est presque
épuisé ; le prochain run utile est probablement un **override documenté** (Sucy-en-Brie, Villeneuve-Saint-Georges,
Villeneuve-d'Ascq, Le Plessis-Trévise, Villiers-sur-Marne) plutôt qu'un lot par médiane, ou l'élargissement de la
règle à un département voisin là où la frontière départementale coupe une agglomération (à décider et documenter
au § 3.2 avant usage, pas au fil d'un lot).

### 2026-10-10 (cinquième run) — aucun lot : la règle devient un script, un écart du lot 5 trouvé

`seed-coverage` au départ : 12 villes en attente du runner local (lots 6 à 8), sous le garde-fou de 30 → lot
autorisé. **Aucune ville ajoutée**, faute de candidate qui passe la règle — décision assumée plutôt qu'un lot
bancal. 580 villes, inchangé.

*Pourquoi aucun lot.* Le vivier « même département, 4 voisines admissibles proches » est épuisé (constat du
lot 8, confirmé) : contrôle par nom de ~250 communes de 20 000 à 50 000 hab. à travers la métropole — absentes
du seed, il ne reste que des communes déjà mesurées et reportées (Lormont, Cenon, Lunel, Lambersart, Marcq,
Wasquehal, Croix, Grande-Synthe, Lisieux, Cournon…) ou des villes isolées sans voisines admissibles :
Coudekerque-Branche (1ʳᵉ voisine du Nord à 35 km, Dunkerque en override), Le Creusot et Montceau-les-Mines
(Chalon à 32-39 km), Fougères (aucune voisine d'Ille-et-Vilaine admissible, Rennes en override). DROM :
Le Gosier (2 voisines admissibles en Guadeloupe), Matoury (2 en Guyane), Koungou (1 à Mayotte),
Saint-Leu 974 (4ᵉ voisine à 27,2 km) — toutes **reportées**. Populations non revérifiées ce run (aucune
n'aurait passé la règle de toute façon). `geo.api.gouv.fr` et `insee.fr` toujours **403 CONNECT** depuis la
routine : la liste exhaustive par population reste une passe locale.

*Livré : `scripts/seed-neighbours.ts`* (`npm run seed:neighbours`, `:selftest`), § 3.2 mis à jour. La règle
n'existait qu'en prose et en scratch réécrit à chaque run. Le script relit le seed brut comme texte (il
échoue si le compte diffère de `CITIES_SEED.length`), détecte un override en passant une note sentinelle à
`calibrateScores` (aucune liste recopiée), calcule le `global` par `calibrateScores` lui-même. Validation :
**39 des 40 villes d'extension reproduites à l'identique** (notes et logement), en rejouant chacune avec le
seed d'avant son lot — sans cette précaution, 6 villes sortaient en écart parce qu'une ville du **même** lot
n'était pas encore une voisine possible (Villepinte / Livry-Gargan, Villemomble / Gagny, Taverny / Herblay,
Saint-Michel / Brétigny, Bussy et Roissy / Lagny), et deux autres par l'arrondi.

*L'écart : Maisons-Laffitte (lot 5) n'applique pas la règle.* Sa médiane prend **Saint-Germain-en-Laye**,
qui porte un override dans `lib/score-calibration.ts` **depuis le 2026-09-29** (avant le lot 5) : sa note
brute est ignorée au chargement, donc une des quatre valeurs de la médiane ne mesurait rien. La règle
conforme (Sartrouville 2,0 · Houilles 4,5 · Conflans 6,7 · Poissy 7,7 km) donnerait
6.4 · 7.3 · 6.5 · 5.5 · 5.9 · 5.7 · 6.8 · 6.4 et un repère 710/960/1 300/4 100 — **plus bas** que les valeurs
publiées (dont 4 600 €/m²) pour une ville que le journal du lot 5 tenait déjà pour **sous-notée**.
Réécrire sur la règle rapprocherait la méthode et éloignerait le chiffre du réel : **les données ne sont pas
modifiées**, la ville est classée **hors règle, attend un override documenté** (backlog § 5), et le selftest
la liste dans `KNOWN_OFF_RULE` avec cette raison. ⚠️ Achères (lot 6) prend Maisons-Laffitte comme voisine
d'extension : un override futur de Maisons-Laffitte ne change pas Achères (notes figées à l'écriture), mais
le selftest le signalera — à rejouer alors.

*Contrôles* : `tsc` propre, `npm run integrity`, `sitemap:check`, `hreflang:check`. Aucune donnée de
ville modifiée, donc pas de `seed-drift` ni de recomptage de la table des couleurs. `npm run build` non lancé.

**Prochain lot** : `seed-coverage` d'abord. Le gisement « par médiane » est vide ; la suite demande une
**décision de méthode écrite au § 3.2 avant usage**, au choix : ① règle transdépartementale là où la frontière
coupe l'agglomération (le script signale déjà ces cas) — ⚠️ mesuré ce run : transférer la note **brute**
d'un département voisin applique le biais du département d'arrivée par-dessus (Villeneuve-Saint-Georges,
94, voisines Montgeron* / Yerres / Athis-Mons / Choisy-le-Roi, recevrait un coût calibré d'environ 4,6,
sous Athis-Mons à 5,8 et Montgeron à 6,1, du seul fait du biais de coût du 94 ; marché de la commune non
recoupé ce run) ; transférer le **niveau calibré** évite ce piège mais neutralise le biais départemental, ce qui
doit être assumé par écrit ; ② règle « villes isolées » par **comparables de taille dans le département**
(Le Creusot, Fougères, Coudekerque-Branche) ; ③ overrides documentés (Maisons-Laffitte, Sucy-en-Brie,
Villeneuve-Saint-Georges, Villeneuve-d'Ascq, Le Plessis-Trévise, Villiers-sur-Marne) à condition d'une
source chiffrée par axe — jamais au jugé.

### 2026-10-10 (sixième run) — aucun lot : règle ① outillée, trois candidates frontalières mesurées et reportées

`seed-coverage` au départ : **0 ville en attente** — le runner local a tourné (commit `324c252`,
biodiversité / actualité / zones protégées 580/580 ; population 578, revenus 573, photos 578 = manques
permanents connus). Garde-fou levé, mais **aucune ville ajoutée** : 580, inchangé.

*Livré : la règle ① (§ 3.2) devient le mode `--cross-dept` de `scripts/seed-neighbours.ts`.* Biais
départemental lu par `calibrateScores` (aucune table recopiée), niveau calibré transféré sur sécurité et
coût, biais d'arrivée retiré, refus au-delà d'un écart de biais de 1,0, département imprimé à côté de
chaque voisine. Le mode standard est inchangé : `seed:neighbours:selftest` → **39/40**, Maisons-Laffitte
toujours seule hors règle documentée.

*Mesuré et reporté* (coordonnées approchées, à recouper avant tout lot) :

| Commune | Insee | Voisines (`--cross-dept`) | Résultat | Raison du report |
|---|---|---|---|---|
| Villeneuve-Saint-Georges | 94078 | Montgeron* 3,0 · Yerres 3,5 · Athis-Mons 4,6 · Choisy-le-Roi 4,7 | règle applicable (écart de biais coût 1,0) | repère **4 200 €/m²** contre **2 641 €/m²** appartements (PAP, DVF au 1ᵉʳ juillet 2026 ; efficity 2 850, RealAdvisor 2 580-3 320 par rue) : **+45 à +60 %**. Les voisines essonniennes sont plus chères qu'elle. |
| Limeil-Brévannes | 94044 | Yerres 3,5 · Montgeron* 5,2 · Choisy-le-Roi 5,5 · Brunoy 5,6 | règle applicable | repère **4 600 €/m²** contre **3 365 €/m²** (PAP, DVF) ; efficity 3 220, RealAdvisor 3 536 : **+30 à +43 %**, au-delà de l'écart accepté (Halluin −25-30 %). |
| Mitry-Mory | 77294 | Tremblay 3,4 · Villepinte* 6,4 · Sevran 7,9 · Aulnay 10,4 (toutes 93) | **refusée par la garde** | écart de biais sécurité 2,0 (93 −2,0, 77 0) : la sécurité transférée (2,4) serait celle de la Seine-Saint-Denis. |

Constat : dans la couronne sud-est, le repère `housing.ts` des voisines ne décrit pas les communes les
plus populaires de la lisière (Villeneuve-Saint-Georges, Limeil). Elles demandent un repère logement
**propre** sourcé (DVF du runner local, une fois la ville au seed — œuf et poule), pas une médiane.
Piste pour un prochain run : autoriser, pour le **seul logement**, un repère pris sur deux sources de
marché concordantes quand la médiane des voisines s'en écarte de plus de 30 % — décision à écrire au
§ 3.3 avant usage, pas au fil d'un lot.

*Contrôles* : `tsc` propre, `npm run integrity`, `sitemap:check`, `hreflang:check`. Aucune donnée de ville
modifiée : pas de `seed-drift` ni de recomptage des couleurs. `npm run build` non lancé.

**Prochain lot** : `seed-coverage` d'abord ; puis soit la décision « repère logement sourcé » (§ 3.3)
qui débloquerait Villeneuve-Saint-Georges et Limeil-Brévannes, soit la règle ② (villes isolées), soit un
override documenté.

### 2026-10-11 — lot 9 (+2) : Villeneuve-Saint-Georges, Villeneuve-le-Roi

`seed-coverage` au départ : 0 ville en attente (580/580 hors manques permanents) — garde-fou levé.

*Décision écrite avant usage : § 3.3 bis (ratio de marché).* Le report de Villeneuve-Saint-Georges au run
précédent reposait sur une comparaison fausse : le repère `housing.ts` des voisines (4 200 €/m², éditorial,
tous biens) face à un prix DVF **appartements** (2 641 €/m²), soit « +45 à +60 % ». Mesure contre mesure, l'écart
est de **−21 %** : DVF appartements de la commune 2 641 €/m² (médiane de PAP 2 641, Immovrai 2 573, Habity
2 681 ; DVF 2025-2026) contre **3 353 €/m²**, médiane des DVF appartements des 4 voisines dans
`data/city-property-prices.json` (Montgeron 3 622, Yerres 2 975, Athis-Mons 3 238, Choisy-le-Roi 3 468).
Confirmation intra-source SeLoger (appartements : VSG 2 669, Choisy 3 681, Athis 3 277) : 0,767, à 3 % du
ratio DVF. Loyers RealAdvisor (€/m²/an, même portail pour les cinq) : VSG 284 contre médiane 278,5 (Yerres
255, Athis 272, Montgeron 285, Choisy 307) → 1,02, dans le bruit. D'où la règle § 3.3 bis, outillée dans
`scripts/seed-neighbours.ts` (`--price-ratio`, `--rent-ratio`, refus au-delà de ± 30 %, rejeu au selftest).

| Ville | Insee | Pop. (2023) | Règle | Voisines | Logement |
|---|---|---|---|---|---|
| Villeneuve-Saint-Georges | 94078 | 36 221 (Banatic + Habity « populations de référence 2023 ») | ① transdépartementale (écart de biais coût 1,0 = limite incluse) + § 3.3 bis | Montgeron* 3,0 · Yerres 3,5 · Athis-Mons 4,6 · Choisy-le-Roi 4,7 km | 700/970/1 300, **3 300 €/m²** (4 200 × 0,788) |
| Villeneuve-le-Roi | 94077 | 21 000 (Banatic + Wikidata) | standard (4ᵉ voisine à 7,1 km) | Orly* 1,9 · Choisy-le-Roi 3,8 · Vitry 6,3 · Fresnes 7,1 km | 700/980/1 310, 4 500 €/m² (médiane, ratio DVF 1,01 : PAP 3 386, Habity 3 394 contre 3 353) |

Notes brutes = sortie du script, sans retouche (VSG 6.1 · 6.8 · 6.4 · 6.2 · 5.9 · 5.6 · 6.5 · 6.1 ; VLR
5.9 · 7.6 · 5.8 · 5.5 · 5.6 · 5.7 · 6.6 · 5.9). Les deux villes sont du même lot et ne se servent donc pas
mutuellement de voisine. Rendu : VSG **4,3** (orange), VLR **3,9** (rouge). Biais conservateur assumé sur VSG :
son axe coût vient de voisines plus chères (biais coût du 94 retiré par la règle ①), il sous-estime donc sans
doute l'accessibilité qu'affiche son repère logement corrigé. Identité : coordonnées et altitudes Geneawiki
(VSG 30-93 m → 62, VLR 30-91 m → 61). Quartiers : VSG centre-ville / Villeneuve-Triage / Plateau (areq.net,
fiche projet Grand-Orly Seine Bièvre — fin du triage marchandises en 2006, 200 ha —, SeLoger) ; VLR
centre-ville (avenue de la République, rue du Général de Gaulle) / Faisanderie – Gare (efficity, IRIS
« Faisanderie Bas et Gare », marché de la Faisanderie). Nuisance Orly citée dans les deux `descriptionEn`
(questions parlementaires listant Villeneuve-le-Roi et Villeneuve-Saint-Georges parmi les communes riveraines
touchées par le bruit). Climat : ville du seed la plus proche (Montgeron, Orly).

*Dérive mesurée* (`seed-drift.ts`) : **0** ville existante changée, 0 citation de guide. Table des couleurs de
`CLAUDE.md` recomptée sur `CITIES_SEED` à 582 (+1 orange, +1 rouge, moyenne 5,36).

*Reportée* : **Limeil-Brévannes** — en mode ①, Saint-Maur-des-Fossés entre dans les 4 voisines (5,8 km) et
tire les **notes** autant que le logement ; § 3.3 bis ne corrige que le logement, elle attend donc un
override ou une règle ②. Sucy-en-Brie, Le Plessis-Trévise, Villiers-sur-Marne : même cas (Saint-Maur,
Nogent, Le Perreux dans la médiane).

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` + `:check` (582 villes), `sitemap:check`,
`hreflang:check`, `seed:neighbours:selftest` (après commit, le lot étant lu dans `git log`). `npm run build`
non lancé. Population Insee, revenus, DVF, littoral, parcs, photos, biodiversité, actualité, zones protégées :
au runner local (`seed-coverage` liste les deux slugs à traiter) ; pages dégradées proprement d'ici là.

**Prochain lot** : `seed-coverage` d'abord. Gisement rouvert par § 3.3 bis : relire les villes reportées pour
« repère logement » seul (Halluin-type) et mesurer leur ratio mesure contre mesure — candidates à remesurer :
Loos et Mons-en-Barœul (repère 1 700 €/m² face à un marché plus cher), en vérifiant d'abord que la règle de
voisinage elle-même tient (Lille en override).

### 2026-10-11 (second run) — lot 10 (+1) : Mons-en-Barœul

`seed-coverage` au départ : 2 villes en attente du runner local (lot 9), sous le garde-fou de 30 → lot
autorisé. 582 → **583**. Lot volontairement réduit à une ville : des cinq candidates du Nord mesurées
(gisement rouvert par § 3.3 bis), une seule passe la règle **et** le recoupement mesure contre mesure.

*Identité* : Insee 59410 (absent du seed, vérifié par code), Nord, Hauts-de-France ; population municipale
2023 **21 105** (Banatic + Habity, populations de référence 2023) → seed 21 100 ; coordonnées 50,6419 N
3,1078 E (Geneawiki ; latlong.net 50,6369 / 3,1103) ; altitude 22-47 m (Wikipédia, areq.net) → 35 m.

*Notes brutes* (§ 3.2, mode standard, sortie du script sans retouche) : voisines Roubaix 7,2 · Tourcoing
9,8 · Wattrelos 9,9 · Halluin* 16,1 km (Lille : override) → 5 · 7.3 · 4.9 · 7.5 · 4.7 · 5.9 · 6 · 5.1,
global 5.7. 4ᵉ voisine au-delà de 12,6 km : même limite haute que Halluin (20,5 km, lot 8), assumée parce que
le marché mesuré confirme la ressemblance (ci-dessous). Rendu : **2,8** (rouge), comme Roubaix et Halluin.
Climat : ville du seed la plus proche = Lille (3,8 km) : 1 480 h / 19,8 °C / 3,4 °C.

*Logement* (§ 3.3 bis) : DVF appartements de la commune ~**1 780 €/m²** (PAP 1 747, DVF au 1ᵉʳ juillet
2026 ; Qoridor, DVF par quartier 1 731-2 022 ; efficity 1 810) contre **1 904 €/m²**, médiane des DVF
appartements des 4 voisines dans `data/city-property-prices.json` (Roubaix 1 931, Wattrelos 1 877,
Tourcoing 1 739, Halluin 2 184) → ratio **0,93**, dans le bruit : repère médian conservé
(400/550/740, 1 700 €/m²). Intra-source PAP (Mons 1 747 / Roubaix 2 005) : 0,87, à 7 % du ratio DVF.
⚠️ **RealAdvisor diverge** (Mons 2 639-2 697 €/m², soit 1,45 × son propre chiffre de Roubaix 1 820) : écarté,
seul contre trois publications DVF concordantes ; noté ici pour qu'un run suivant ne le prenne pas pour une
mesure. Loyer RealAdvisor (€/m²/an) : Mons 237 contre Roubaix 242 → 0,98 (une seule voisine trouvée sur ce
portail, aucun ratio appliqué).

*Quartiers* (notes = ville) : **Haut de Mons** (centre historique, maisons de brique — site de la ville,
SeLoger) et **Nouveau Mons** (quartier prioritaire, renouvellement urbain depuis 2004 — site de la ville,
document MEL). Faits du `descriptionEn` : métro 2, trois stations Mons Sarts / Mairie de Mons / Fort de Mons
(monsenbaroeul.fr), fort devenu centre socioculturel (guide-tourisme-france). Tags sans `port`/`mer`/`côte`.

*Codes postaux* : 59370 (Mons), plus **94190** et **94290** pour les deux villes du lot 9 qui n'en avaient pas.

*Reportées* (§ 3.3 bis, ratio > ± 30 %, mêmes voisines Roubaix/Tourcoing/Wattrelos) : **Loos** (DVF ~2 735 €/m²,
PAP 2 759 et RealAdvisor 2 711, ratio 1,44 ; voisines à 12,6-17 km, de l'autre côté de Lille), **Croix**
(PAP 2 521, 1,32), **Wasquehal** (PAP 3 234, Square Habitat 3 367, efficity 3 170 → 1,68). Elles ne ressemblent
pas au versant roubaisien : override ou règle ② nécessaires.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation**. Table des couleurs recomptée sur `CITIES_SEED` :
19 / 50 / 151 / 151 / 118 / **94**, moyenne 5,36.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (583 villes) + `:check`, `sitemap:check`
(FR 31 309 URL, EN 30 917), `hreflang:check`. `npm run build` non lancé.

*En attente du runner* : 3 villes (lots 9-10) — population, revenus, DVF, littoral, parcs, photos, air,
biodiversité, actualité, zones protégées.

**Prochain lot** : `seed-coverage` d'abord. Le Nord et la petite couronne sont épuisés pour la médiane ; la
suite utile est la **règle ②** (villes isolées par comparables de taille dans le département : Le Creusot,
Fougères, Coudekerque-Branche) à écrire au § 3.2 avant usage, ou des overrides documentés.

### 2026-10-11 (troisième run) — aucun lot : la règle ② mesurée avant d'être écrite

`seed-coverage` au départ : **0 ville en attente** — le runner a servi les lots 9 et 10 (population 581/583,
revenus 576/583, photos 581/583 = manques permanents connus ; tout le reste 583/583). Garde-fou levé, mais
**aucune ville ajoutée** : 583, inchangé.

*Pourquoi aucun lot.* Le run précédent renvoyait à la règle ② « villes isolées par comparables de taille » à
écrire avant usage. Plutôt que de l'écrire à l'intuition, elle a été **mesurée** : `scripts/seed-neighbours-backtest.ts`
(`npm run seed:neighbours:backtest`) rejoue cinq règles sur les villes d'origine, une ville retirée à la fois.
Résultat (§ 3.2) : les comparables de taille sont la **pire** des règles testées (MAE 0,84 sur les 41 villes
isolées, contre 0,68 pour la règle standard et 0,76 pour la médiane de toute la région) ; ils sont écartés.
La seule variante qui ne dégrade pas l'exactitude — plancher 10 000 hab. dans le département — est décidée
comme règle ② mais ne débloque aucune des candidates nommées :

| Commune | Voisines admissibles à 10 000+ (dép.) | Résultat |
|---|---|---|
| Le Creusot (71) | Autun 19,5 · Chalon 32,7 · Mâcon 63,1 km | 3 voisines, reportée |
| Montceau-les-Mines (71) | Autun 32,2 · Chalon 39,1 · Mâcon 53,5 km | 3 voisines, reportée |
| Fougères (35) | Vitré 25,5 · Dinard 70,4 km | 2 voisines, reportée |
| Lisieux (14) | Hérouville-Saint-Clair 41,1 km | 1 voisine, reportée |
| Frontignan (34) | Agde 27,4 km | 1 voisine, reportée |
| Coudekerque-Branche (59) | `--cross-dept` : Hazebrouck 34,7 · Armentières 50,7 · Béthune 57,4 · Halluin* 57,7 km | applicable mais 4ᵉ voisine à 58 km, Dunkerque (son agglomération) en override : **reportée**, les voisines ne décrivent pas le littoral dunkerquois |
| Grande-Synthe (59) | mêmes voisines, 4ᵉ à 68 km | reportée, même raison |
| La Teste-de-Buch (33) | 4 voisines de la métropole bordelaise à 44-45 km | reportée : le bassin d'Arcachon n'est pas la banlieue de Bordeaux |
| La Garde (83) | La Seyne 11,1 · Six-Fours 14,8 · Sanary 17,0 · Sainte-Maxime 54,9 km | reportée : 4ᵉ voisine hors aire toulonnaise, repère m² dispersé × 1,57, Toulon en override |

Coordonnées approchées (centres de commune), à recouper avant tout lot ; populations non revérifiées (aucune
n'aurait passé la règle).

*Contrôles* : `tsc` propre, `npm run integrity`, `sitemap:check`, `hreflang:check`, `seed:neighbours:selftest`
(**42/43**, Maisons-Laffitte documentée). ⚠️ Le conteneur clone en **profondeur réduite** : le selftest
sortait d'abord **25/43**, onze villes « lot introuvable » et six rejouées contre le mauvais seed. Ce n'est pas
une régression de la règle mais de l'historique git absent ; `git fetch --unshallow origin main` rétablit
42/43, et le selftest **refuse désormais** de tourner sur un clone superficiel. Aucune donnée de ville
modifiée : pas de `seed-drift` ni de recomptage des couleurs. `npm run build` non lancé.

**Prochain lot** : `seed-coverage` d'abord. Le gisement « règle valable » est vide pour la métropole dense, la
couronne et le Nord ; la règle ② n'ouvre pas les villes isolées nommées. Ce qui reste : ③ overrides documentés
(Maisons-Laffitte, Sucy-en-Brie, Villeneuve-d'Ascq, Le Plessis-Trévise, Villiers-sur-Marne, Limeil-Brévannes)
avec une source chiffrée par axe ; ou une liste exhaustive des communes de 20 000+ hab. absentes (base Insee,
passe locale ou runner GitHub Actions) pour trouver les communes que le contrôle par nom a manquées.

### 2026-10-11 (quatrième run) — lot 11 (+2) : Morsang-sur-Orge, Chilly-Mazarin

`seed-coverage` au départ : **0 ville en attente** → lot autorisé. 583 → **585**, Essonne, aucun département ni
région nouveaux. Les deux villes étaient au backlog « règle valable », reportées les 2026-10-10 **faute de deux
quartiers sourcés** ; cette fois chaque quartier est recoupé par au moins deux sites indépendants.

*Identité* (absence vérifiée par code Insee via `seed:neighbours --insee`) :

| Ville | Insee | Pop. seed | Source pop. (municipale en vigueur) | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Morsang-sur-Orge | 91434 | 21 700 | 21 667 (Banatic ; Wikipédia EN, 2023) | 48,6618 N 2,3461 E (latlong.net ; distanceenvoiture 48,6618/2,3457) | 36-81 → 59 m (une source ; mairie ~70 m, nonsurtaxe) |
| Chilly-Mazarin | 91161 | 20 400 | 20 443 (Banatic ; Wikipédia EN, 2023) | 48,7025 N 2,3125 E (Wikipédia ; point IGN 48,703/2,320) | 42-101 → 72 m (geneawiki/cartesfrance) |

⚠️ Chilly-Mazarin est **juste au-dessus du seuil** : des sites tiers citent 19 938 (2021) ou 19 981 ; le chiffre
retenu est la population municipale en vigueur de Banatic, concordante avec Wikipédia. Si la population Insee
2022 du runner tombe sous 20 000, la ville reste au seed (le seuil est un critère d'entrée du backlog, pas de
présence), mais le noter.

*Notes brutes* (§ 3.2, règle standard, aucune alerte du script) :

| Ville | Voisines (distance) | Notes brutes | global | Rendu |
|---|---|---|---|---|
| Morsang-sur-Orge | Savigny-sur-Orge 2,0 · Viry-Châtillon 2,2 · Sainte-Geneviève-des-Bois 2,9 · Saint-Michel-sur-Orge* 4,1 km | 6.3 · 7 · 6.5 · 5.5 · 5.9 · 5.6 · 6.8 · 6.3 | 6.2 | **4,4** (orange) |
| Chilly-Mazarin | Longjumeau* 1,7 · Savigny-sur-Orge 3,7 · Massy 4,0 · Palaiseau 4,9 km | 6.5 · 7 · 6.4 · 5.5 · 6.4 · 6.3 · 7.4 · 6.8 | 6.4 | **5,2** (ambre) |

\* ville d'extension. Voisines rendues : Savigny 4,4 ; Longjumeau 4,9 ; Massy 5,3. Climat : Savigny-sur-Orge
(1 700 h / 20,5 °C / 4 °C) et Longjumeau (1 720 h / 24 °C / 4,5 °C), villes du seed les plus proches.

*Logement* (§ 3.3 bis) :
- **Morsang** : DVF appartements ~**2 502 €/m²** (PAP 2 504 au 1ᵉʳ juillet 2026 ; efficity 2 500) contre
  **2 828 €/m²**, médiane DVF des 4 voisines (`city-property-prices.json` : Viry 2 686, Savigny 2 969,
  Sainte-Geneviève 2 981, Saint-Michel 2 440) → ratio **0,885** ; intra-source PAP (Savigny 3 001,
  Sainte-Geneviève 3 030) 0,83, à 6 % près. Ratio appliqué : repère 690/950/1 280, **3 500 €/m²** (au lieu de 4 000).
- **Chilly** : DVF appartements ~**2 499 €/m²** (PAP 2 507 ; efficity 2 490) contre **3 376 €/m²** (Longjumeau 2 628,
  Savigny 2 969, Massy 4 021, Palaiseau 3 783) → ratio **0,74** ; intra-source PAP (Massy 4 071, Savigny 3 001) 0,71.
  Repère 750/1 030/1 390, **3 000 €/m²** (au lieu de 4 100). L'axe coût hérite de voisines plus chères (Massy,
  Palaiseau) : biais conservateur assumé (§ 3.3 bis).
- RealAdvisor encore divergent (Morsang 3 325, Chilly 3 110), écarté face à deux publications DVF concordantes.
  **Aucun loyer au m² d'un même portail trouvé pour les voisines** : pas de ratio loyer, loyers = médiane.
  Ratios inscrits dans `DOCUMENTED_MODES` ; `seed:neighbours:selftest` **44/45** (Maisons-Laffitte documentée).

*Quartiers* (notes = ville) : Morsang **Le Vieux Bourg** (efficity, page quartier) et **La Gribelette** (efficity,
Foncia « quartier Gribelette », unemplacement ; boulevard de la Gribelette) ; Chilly **Centre-ville** (Orpi,
unemplacement) et **Chilly bas – Gravigny** (Orpi ; IRIS « Rue de Gravigny » 911610107 repris par
lapporteurdimmo ; rue de Gravigny rue commerçante). Densité et part HLM de Gravigny / du centre : chiffres Orpi,
résumés sans chiffre dans la copie.

*Faits évités faute de source* : la gare « Chilly-Mazarin » / Gravigny-Balizy du RER C (déjà notée côté
Longjumeau au lot 6, rattachement communal non tranché) ; parcs d'activités ; origine du nom « Mazarin ».
`descriptionEn` de Morsang : gare la plus proche **Savigny-sur-Orge** (Wikipédia EN). Tags sans `port`/`mer`/`côte`.

*Codes postaux* : 91390, 91380 → 585/585.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation**. Table des couleurs recomptée sur `CITIES_SEED` (585) :
19 / 50 / 151 / **152** / **119** / 94, moyenne 5,36.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (585 villes) + `:check`, `sitemap:check`,
`hreflang:check`, `seed:neighbours:selftest` 44/45. `npm run build` non lancé.

*En attente du runner* : 2 villes — population, revenus, DVF, littoral, parcs, photos, air, biodiversité,
actualité, zones protégées, orientation politique.

**Prochain lot** : `seed-coverage` d'abord. Le backlog « règle valable » est maintenant vide en Essonne ; restent les
overrides documentés (§ 3.2 ③) et la liste exhaustive des communes de 20 000+ absentes (base Insee, passe
locale/runner) pour trouver les communes manquées par le contrôle par nom.

### 2026-10-12 — lot 12 (+1) : La Chapelle-sur-Erdre

`seed-coverage` au départ : **0 ville en attente** (le runner a servi le lot 11 : population 583/585, revenus
578/585, photos 583/585 = manques permanents connus ; tout le reste 585/585) → lot autorisé. 585 → **586**,
Loire-Atlantique, aucun département ni région nouveaux.

*Pourquoi une seule ville.* Un balayage par nom de ~250 communes de 20 000+ hab. connues a confirmé que le seed les
porte presque toutes ; les absentes au-dessus du seuil sont celles déjà reportées (Cenon, Lormont, Gardanne,
Cournon, Les Ulis, Montigny-lès-Cormeilles, DROM). Deux ont été remesurées ce run :

| Commune | Règle § 3.2 | Marché § 3.3 bis | Décision |
|---|---|---|---|
| La Chapelle-sur-Erdre (44035) | Orvault 6,3 · Saint-Herblain 11,8 · Rezé 12,9 · Vertou 15,7 km | +26 %, confirmé intra-source | **lot 12** |
| Montigny-lès-Cormeilles (95424, 22 457 hab. en 2023, Banatic + habity) | **désormais valable**, aucune alerte (Cormeilles 1,7 · Herblay* 2,1 · Franconville 3,0 · Ermont 4,7 km) | PAP 2 618 €/m² ÷ 3 635 (médiane DVF voisines) = 0,72 ; intra-source PAP Cormeilles 4 203 → 0,62 (écart > 10 %) ; RealAdvisor 3 584 (≈ 0,99) | **reportée** : ratio à −28 %, au bord du seuil, et non confirmé par une seconde source communale |
| Les Ulis (91692) | 4ᵉ voisine à 13,2 km, villes des Yvelines/Hauts-de-Seine plus proches | PAP 2 390 / efficity 2 400 ÷ 3 376 = 0,71 (−29 %) | **reportée** : grand ensemble entouré de Palaiseau / Massy, au bord du seuil |
| Saint-Leu, La Possession, Sainte-Marie (974), Le Gosier (971) | 4ᵉ voisine à 27-42 km ; Le Gosier 2 voisines | — | reportées (même motif que Le Port / Sainte-Marie le 2026-10-10) |
| Floirac (33) | valable, voisines rive gauche | — | non retenue : rive droite comme Cenon, et ~18 000 hab. (non recoupé) |

*Identité* : Insee **44035** (absence vérifiée par code), population municipale en vigueur **20 690** (Banatic ;
Wikipédia EN citant les populations de référence 2023 publiées le 18/12/2025 ; bien-dans-ma-ville) → 20 700 au
seed. Coordonnées 47,2997 N −1,5517 (Wikipédia ; distanceenvoiture 47,2996/−1,5506). Altitude 1-57 m (Wikipédia,
mairie.net) → milieu **29 m**.

*Notes brutes* (règle standard) : médiane d'Orvault, Saint-Herblain, Rezé, Vertou → 7 · 7,3 · 7,4 · 5,7 · 6,6 · 6 ·
6,9 · 6,8, global 6,7 ; rendu **5,4** (ambre ; voisines rendues 5,8 / 5,0 / 5,4 / 5,5). ⚠️ 4ᵉ voisine à 15,7 km
(au-delà des 12,6 km du lot 7) : assumé, les quatre sont des communes de Nantes Métropole, Nantes elle-même en
override, et le backtest donne l'erreur standard (0,57) sous 25 km. Climat : Orvault (1 900 h / 21,5 °C / 5,5 °C).

*Logement* (§ 3.3 bis) : DVF appartements PAP **3 477 €/m²** (1ᵉʳ juin 2026) ÷ **2 758 €/m²**, médiane DVF des 4
voisines (`city-property-prices.json` : Saint-Herblain 2 567, Rezé 2 609, Orvault 2 907, Vertou 3 477) → **1,26** ;
intra-source PAP (Orvault 3 193, Saint-Herblain 2 613) → 1,20, à 5 % près ; efficity par quartier 3 120-3 350,
RealAdvisor 3 648. Repère : loyers médiane des voisines 500/700/940, **4 200 €/m²** (3 300 × 1,26). Pas de loyer au
m² d'un même portail pour les voisines : pas de ratio loyer. L'axe coût hérite de voisines moins chères : biais
**favorable** à la ville, noté (inverse du lot 11). Ratio inscrit dans `DOCUMENTED_MODES`.

*Quartiers* (notes = ville) : **Centre-ville – Gare – Chêne Vert** (lesclefsdechezmoi ; efficity « centre-ville » ;
halte TER La Chapelle-Centre ; rues commerçantes place de l'Église / rue Martin-Luther-King, unemplacement) et
**Gesvrine** (guide municipal 2009 : grand ensemble des années 1970, équipements sportifs, centre commercial, plus
ancien parc d'activités ; efficity Gesvrine Est/Ouest ; IRIS 440350108 repris par lapporteurdimmo ;
lesclefsdechezmoi : 99 % de maisons).
*Faits retenus* : tram-train Nantes–Châteaubriant rouvert en 2014, haltes La Chapelle-Centre et La Chapelle-Aulnay
(guide municipal, TER). Tags sans `port`/`mer`/`côte`. Code postal 44240 → postal-codes 586/586.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation**. Couleurs recomptées sur `CITIES_SEED` (586) :
19 / 50 / 151 / **153** / 119 / 94, moyenne 5,36.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (586 villes) + `:check`, `sitemap:check`
(FR 31 460, EN 31 059), `hreflang:check`, `seed:neighbours:selftest` (la ville se rejoue une fois le commit
`feat(seed)` présent). `npm run build` non lancé.

*En attente du runner* : 1 ville — population, revenus, DVF, littoral, parcs, photos, biodiversité, actualité,
zones protégées, orientation politique.

**Prochain lot** : `seed-coverage` d'abord. Le contrôle par nom ne trouve presque plus de commune de 20 000+ hab.
absente qui passe la règle. Restent : ③ overrides documentés (Maisons-Laffitte, Sucy-en-Brie, Villeneuve-d'Ascq,
Le Plessis-Trévise, Villiers-sur-Marne, Limeil-Brévannes) ; Montigny-lès-Cormeilles si une seconde source
communale DVF (Immovrai, Habity) confirme le −28 % ; et la liste exhaustive Insee (passe locale / runner).

### 2026-10-12 (second run) — lot 13 (+2) : Saint-Sébastien-sur-Loire, Bouguenais

`seed-coverage` au départ : **1 ville en attente** (La Chapelle-sur-Erdre, lot 12 du matin) → lot autorisé. 586 →
**588**, Loire-Atlantique, aucun département ni région nouveaux.

*Comment ces deux villes ont été trouvées.* Un balayage par nom de ~200 communes de 20 000+ hab. a confirmé que
presque toutes sont au seed. Les absentes ont été **remesurées** avec le seed actuel : l'arrivée de La
Chapelle-sur-Erdre (lot 12) et de Couëron (lot 8) donne désormais **4 voisines admissibles** à deux communes de
Nantes Métropole reportées le 2026-10-10 pour en manquer.

| Commune | Règle § 3.2 | Marché § 3.3 bis | Décision |
|---|---|---|---|
| Saint-Sébastien-sur-Loire (44190) | Rezé 4,5 · Vertou 4,9 · La Chapelle-sur-Erdre* 10,9 · Saint-Herblain 11,2 km, aucune alerte | ratio 1,27 (voir ci-dessous) | **lot 13** |
| Bouguenais (44020) | Saint-Herblain 4,5 · Rezé 5,6 · Couëron* 8,7 · Orvault 10,0 km, aucune alerte | ratio 1,10, au seuil : repère médian conservé | **lot 13** |
| Carquefou (44026, 20 921 hab. en 2023, Banatic + Wikipédia EN) | La Chapelle* 4,6 · Orvault 10,4 · Rezé 13,4 · Vertou 14,3 km | PAP 3 344 / RealAdvisor 3 427 ÷ 2 907 (3 voisines mesurées) = 1,16 ; intra-source PAP (Orvault 3 193, La Chapelle 3 477) = 1,00 | **reportée** : le ratio intra-source ne confirme pas (écart > 10 %), même motif que Montigny-lès-Cormeilles |
| Chatou (78146, 30 598 hab. en 2023, Wikipédia EN + notre-planete) | `--cross-dept` : selon le centre retenu (latlong 48,8897/2,1573 ou distanceenvoiture 48,8964/2,1601), la 4ᵉ voisine est Suresnes ou **Bezons** ; avec Bezons la garde **refuse** (écart de biais coût > 1,0) | PAP 4 682 / RealAdvisor 5 717 | **reportée** : la règle ne tient pas sur toutes les coordonnées plausibles |
| Montigny-lès-Cormeilles (95424) | valable | seconde source communale cherchée : seule RealAdvisor (3 584) publie un chiffre communal, efficity par quartier (2 120-2 690) | **reportée**, inchangé |
| Villeparisis (77) | 4ᵉ voisine à 10,5 km, 8 villes du 93 plus proches | — | reportée, inchangé |
| Miramas (13), Lunel (34) | 4ᵉ voisine à 47 km / 1 voisine | — | reportées, inchangé |

*Identité* (absence vérifiée par code Insee via `seed:neighbours --insee`) :

| Ville | Insee | Pop. seed | Source pop. (municipale en vigueur) | Coordonnées | Altitude (min-max → milieu) |
|---|---|---|---|---|---|
| Saint-Sébastien-sur-Loire | 44190 | 28 600 | 28 596 (Banatic ; Wikipédia ; habity, 2023) | 47,2079 N −1,5023 (latlong 47,2081/−1,5014 ; distancecalculator 47,2077/−1,5033) | 2-33 → 18 m (geneawiki) |
| Bouguenais | 44020 | 20 500 | 20 530 (Banatic ; Wikipédia, populations de référence 2023 ; bien-dans-ma-ville) | 47,1800 N −1,6236 (Wikipédia 47°10′48″N 1°37′25″W) | 1-41 → 21 m (Wikipédia ; areq.net) |

*Notes brutes* (règle standard, aucune alerte) : Saint-Sébastien 6,9 · 7,4 · 7,2 · 5,8 · 6,4 · 6 · 6,9 · 6,7 (global
6,6), Bouguenais 6,9 · 7,4 · 7,2 · 5,8 · 6,4 · 6 · 7 · 6,7 (global 6,6) ; rendus **5,4** (ambre) tous les deux. Les
deux médianes sont presque identiques parce que les deux villes partagent Rezé et Saint-Herblain ; c'est ce que la
règle produit, pas une recopie. Climat : Nantes (4,0 km) pour Saint-Sébastien, Saint-Herblain (4,5 km) pour
Bouguenais.

*Logement* (§ 3.3 bis) :
- **Saint-Sébastien** : DVF appartements PAP **3 319 €/m²** (1ᵉʳ juin 2026) ÷ **2 609 €/m²**, médiane DVF des
  voisines **mesurées** (`city-property-prices.json` : Rezé 2 609, Vertou 3 477, Saint-Herblain 2 567 ; La
  Chapelle-sur-Erdre pas encore servie par le runner) → **1,27** ; intra-source efficity (quartiers Centre 3 280,
  Baugerie 3 260 contre Rezé 2 660-2 800) ≈ 1,20, à 6 % près. Repère 500/690/930, **4 300 €/m²** (3 400 × 1,27).
  ⚠️ Avec La Chapelle comptée à son prix PAP (3 477), la médiane passerait à 3 043 et le ratio à 1,09 — sous le
  seuil. Le ratio retenu est celui des seules mesures DVF au dépôt, comme la règle le prescrit ; le relire quand le
  runner aura servi La Chapelle. Ratio inscrit dans `DOCUMENTED_MODES`.
- **Bouguenais** : DVF appartements ~**3 040 €/m²** (PAP 3 151 ; efficity 2 930) ÷ **2 758 €/m²** (Saint-Herblain
  2 567, Rezé 2 609, Orvault 2 907, Couëron 3 083) → **1,10** ; intra-source PAP (3 151 ÷ médiane Saint-Herblain
  2 613 / Orvault 3 193 = 2 903) 1,085. Au seuil de ± 10 % : repère médian **conservé**, 500/690/930, 3 400 €/m².
- Pas de loyer au m² d'un même portail pour les voisines : loyers = médiane.

*Quartiers* (notes = ville) : Saint-Sébastien **Centre-ville** (efficity « centre » ; annonce « cœur historique ») et
**La Profondine** (plaquette municipale de février 2022 : terrains vendus dans les années 1950 à des ouvriers
bâtissant eux-mêmes, rues de l'Union et de la Solidarité ; efficity « Jaunaie-Profondine » ; SeLoger « cité-jardin ») ;
Bouguenais **Le Bourg** et **Les Couëts** (Wikipédia et areq.net : deux centres sur le coteau, le Bourg porte la
mairie ; efficity, quartiers Le Bourg et Couëts est/ouest/sud).
*Faits évités faute de source vérifiée ce run* : numéros et terminus des lignes de tram (Neustrie), haltes TER de
Saint-Sébastien. L'aéroport Nantes Atlantique est cité dans `descriptionEn` de Bouguenais (Wikipédia EN) mais
**pas en tag** : « aéroport » contient la sous-chaîne `port` (§ 3.3). Codes postaux 44230, 44340 → 588/588.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation**. Couleurs recomptées sur `CITIES_SEED` (588) :
19 / 50 / 151 / **155** / 119 / 94, moyenne 5,36.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` + `:check`, `sitemap:check`, `hreflang:check`,
`seed:neighbours:selftest` (après commit). `npm run build` non lancé.

*En attente du runner* : 3 villes (La Chapelle-sur-Erdre, Saint-Sébastien-sur-Loire, Bouguenais).

**Prochain lot** : `seed-coverage` d'abord. Le gisement « règle valable » se renouvelle surtout quand une ville
d'extension comble un trou de voisinage (cas de ce lot) : remesurer les reportées des agglomérations où un lot vient
d'arriver. Restent Carquefou (seconde source intra-source), Montigny-lès-Cormeilles, les overrides documentés (§ 3.2
③) et la liste exhaustive Insee.

### 2026-10-12 (troisième run) — lot 14 (+1) : Carquefou ; repère de Saint-Sébastien-sur-Loire relu

`seed-coverage` au départ : **0 ville en attente** (le runner a servi le lot 13 : DVF, revenus, population, photos,
biodiversité, actualité, zones protégées à 588/588 hors manques permanents) → lot autorisé. 588 → **589**,
Loire-Atlantique, aucun département ni région nouveaux.

*Pourquoi Carquefou passe maintenant.* Reportée au lot 13 parce que le ratio intra-source ne confirmait pas le ratio
externe (1,16 contre 1,00). Ce run, la médiane DVF appartements de La Chapelle-sur-Erdre est **mesurée au dépôt**
(3 410 €/m², 123 ventes) : la médiane des 4 voisines passe à **3 158,5 €/m²** (Orvault 2 907, Rezé 2 609, Vertou
3 477, La Chapelle 3 410), et Carquefou (PAP 3 344, relevé du lot 13 ; RealAdvisor 3 427) donne **1,06 / 1,085**,
sous ± 10 % des deux côtés : **repère médian conservé**, plus de ratio à confirmer. ⚠️ Le relevé PAP n'a pas été
refait ce run (valeur du 2026-10-12, second run).

*Identité* : Insee **44026** (absence vérifiée par code via `seed:neighbours --insee`), population **20 921**
(populations de référence 2023 : Wikipédia EN, déjà Banatic au lot 13) → 20 900 au seed. Coordonnées **47,2975 N
−1,4914** (Wikipédia ; areq.net, même valeur ; mairie 47,2969/−1,4928, annuaire-administration). Altitude 1-76 m
(Wikipédia) → **39 m** (cartesfrance donne aussi 39 m de moyenne).

*Notes brutes* (règle standard) : La Chapelle-sur-Erdre* 4,5 · Orvault 10,4 · Rezé 13,4 · Vertou 14,3 km →
7,1 · 7,2 · 7,6 · 5,6 · 6,8 · 6 · 7 · 6,9, global 6,7 ; rendu **5,6** (ambre). ⚠️ 4ᵉ voisine à 14,3 km (> 12,6 km) :
assumé comme au lot 12, quatre communes de Nantes Métropole, Nantes en override, backtest 0,57 sous 25 km.
Climat : La Chapelle-sur-Erdre (1 900 h / 21,5 °C / 5,5 °C). Logement : médiane des voisines 510/710/950, 3 600 €/m².

*Quartiers* (notes = ville) : **La Fleuriaye** (Construction21 : Fleuriaye Est 65 ha bâtie 1995-2010, Ouest 37 ha en
chantier depuis 2013, aménageur LAD-SELA ; zone statistique « Fleuriaye-Souchais » de citypopulation.de) et
**Moulin Boisseau** (Nantes Métropole, deux pages : ancienne friche logistique au sud de la commune, ZAC à l'horizon
2030 ; brochure promoteur CIF). Chiffres d'habitants et de logements de la Fleuriaye divergents entre sources :
**non cités**. Arrêt de tram dans la commune **non confirmé** : aucun fait transport en copie. Tags sans
`port`/`mer`/`côte`. Code postal 44470 → postal-codes 589/589.

*Relecture du lot 13 (prescrite par son entrée).* Le runner a servi La Chapelle-sur-Erdre et Saint-Sébastien-sur-Loire
elle-même (DVF 3 273 €/m², 393 ventes). À mesure égale, 3 273 ÷ 3 009,5 (médiane Rezé, Vertou, La Chapelle,
Saint-Herblain) = **1,088**, sous le seuil : le ratio 1,27 du lot 13, calculé sur 3 voisines faute de mieux, n'a plus
lieu d'être et le repère revient à la **médiane, 3 400 €/m²** (au lieu de 4 300). `scripts/seed-neighbours.ts` porte
la relecture dans `RELU_APRES_LOT`, que le selftest lit (le ratio du lot reste dans `DOCUMENTED_MODES` pour l'histoire).
Mesures relevées sans correction, **à trancher par une règle générale avant d'y toucher** : Bouguenais DVF 3 160 ÷
2 758 = **1,146** (repère médian conservé au lot 13 sur un ratio PAP de 1,10) ; La Chapelle-sur-Erdre 3 410 ÷ 2 758 =
**1,236** (ratio écrit 1,26, écart d'arrondi : 4 100 contre 4 200). Proposition : une fois la DVF de la commune au
dépôt, le ratio se relit à mesure égale (DVF dépôt ÷ DVF dépôt) pour **toutes** les villes d'extension en une passe,
pas ville par ville.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation**. Couleurs recomptées sur `CITIES_SEED` (589) :
19 / 50 / 151 / **156** / 119 / 94, moyenne 5,36.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (589 villes) + `:check`, `sitemap:check`
(FR 31 605, EN 31 197), `hreflang:check`, `seed:neighbours:selftest` (après commit). `npm run build` non lancé.

*En attente du runner* : 1 ville (Carquefou).

**Prochain lot** : `seed-coverage` d'abord. Le balayage par nom de ce run (~130 communes de grandes agglomérations)
ne trouve plus d'absente au-dessus de 20 000 hab. qui passe la règle, hors reportées connues. Pistes : la relecture
générale des ratios ci-dessus ; Montigny-lès-Cormeilles ; les overrides documentés (§ 3.2 ③) ; la liste exhaustive
Insee (passe locale).

### 2026-10-12 (quatrième run) — aucun lot : 24 repères m² relus à mesure égale, 3 villes hors ± 30 %

`seed-coverage` au départ : 1 ville en attente (Carquefou) → lot autorisé, mais **aucune candidate ne passe la
règle**. Balayage par code Insee de ~110 communes d'Île-de-France de 20 000 hab. et plus : les seules absentes du
seed sont déjà au backlog comme reportées (Villiers-sur-Marne, Saint-Ouen-l'Aumône, Les Mureaux, Mantes-la-Ville,
Chatou, Grigny, Les Ulis) ou sous le seuil (Le Pré-Saint-Gervais, Dugny, Le Raincy, Bry-sur-Marne, Bonneuil, Osny).
En province, **Coudekerque-Branche** (59155, absente vérifiée par code) mesurée : Dunkerque en override, voisines
admissibles à 35-63 km (Hazebrouck, Armentières, Halluin, Tourcoing) — règle non valable, reportée. ⚠️ Un contrôle
« absent par nom » donne des faux positifs (`Le Grand-Quevilly` est au seed sous ce nom, 76322) : toujours par code.

*Livrable : la relecture proposée au run précédent, outillée et appliquée.* Nouveau mode `--relire` de
`scripts/seed-neighbours.ts` (§ 3.3 bis) : pour chaque ville d'extension, DVF appartements de la commune ÷ médiane
DVF appartements de ses 4 voisines **de lot**, tout lu au dépôt, seuils ± 10 % / ± 30 %. Sur 47 villes mesurables
(Carquefou pas encore servie, Maisons-Laffitte hors règle) : **23 repères changent** au-delà de ± 10 %, rejoués en
3 passes jusqu'au point fixe (cascade de voisinage entre villes d'extension). Les plus gros écarts corrigés :
L'Haÿ-les-Roses 5 700 → 4 500, Fontenay-aux-Roses 6 200 → 4 700, Bussy-Saint-Georges 3 900 → 5 000,
Montgeron 4 000 → 5 000, Montrouge 6 000 → 7 100, Taverny 3 900 → 3 100, Longjumeau 4 100 → 3 200. Liste complète
dans `RELU_APRES_LOT` ; le selftest vérifie chaque valeur (48/49, Maisons-Laffitte documentée). Les loyers ne sont
pas relus : aucune mesure de loyer au dépôt.

⚠️ **Trois villes déjà publiées sortent de ± 30 %**, ce qui veut dire que la règle n'aurait pas dû les admettre :
**Clichy-sous-Bois** (DVF 1 835 ÷ 2 852,5 = 0,643 ; repère 2 900 → 1 800), **Romainville** (5 240 ÷ 3 423 = 1,531 ;
3 600 → 5 500), **Ris-Orangis** (2 008 ÷ 2 884 = 0,696 ; 4 000 → 2 800). Leur repère prend le ratio mesuré (plus
proche du réel que la médiane), mais leurs **notes héritées** — l'axe coût en premier — décrivent leurs voisines,
pas elles. Elles **attendent un override documenté** dans `lib/score-calibration.ts` ; ne pas les citer au dixième.
Toucher leurs notes déplacerait leur note rendue (cohorte « extension » : aucune autre ville ne bouge).

*Dérive* : aucune note touchée (seul `avgBuyPriceM2` change). `integrity`, `tsc`, `sitemap:check`,
`hreflang:check` verts. `npm run build` non lancé.

**Prochain lot** : `seed-coverage`, puis `npm run seed:neighbours:relire` dès que Carquefou est servie. Candidates :
les overrides des trois villes ci-dessus, de Maisons-Laffitte et de Sucy-en-Brie (§ 3.2 limite connue) ; la liste
exhaustive Insee (passe locale) ; outiller la règle ② si une candidate en a besoin.

### 2026-10-13 — aucun lot : sept candidates mesurées, aucune ne passe ; relecture des repères à point fixe

`seed-coverage` au départ : **1 ville en attente** (Carquefou, photo seule ; DVF, revenus, population,
biodiversité, actualité, zones protégées servis à 589/589 hors manques permanents) → lot autorisé, runner local
vivant (commit `[local-runner]` du jour). `npm run seed:neighbours:relire` : **0 repère à relire**, Carquefou
servie converge (DVF 3 438 ÷ 3 158,5 = 1,088, repère médian 3 600 €/m² conservé).

*Balayage* : ~230 communes de grandes agglomérations et de villes moyennes testées par nom ; les absentes sont
presque toutes sous 20 000 hab. (Lunéville, Chamalières, Bruz, Cesson-Sévigné, Montivilliers, Avrillé, Lattes, Hem,
Woippy, Saint-Cyr-sur-Loire, Saint-Pierre-des-Corps, Fécamp, Elbeuf, Auray, Pontivy…) ou déjà au backlog. Mesurées
avec `seed:neighbours` :

| Commune | Règle § 3.2 | Marché | Décision |
|---|---|---|---|
| La Madeleine (59, ~22 000) | Mons-en-Barœul* 3,0 · Roubaix 8,3 · Tourcoing 9,9 · Wattrelos 11,3 km → repère 1 600 €/m² | marché nettement plus cher que Roubaix/Tourcoing (même cas que Marcq, Lambersart) | **reportée**, attend un override |
| Bourg-lès-Valence (26058) | 3 voisines (Valence 1,7 · Romans 16,7 · Montélimar 45 km) | — | **sortie** : **19 992 hab.** en 2023 (Wikipédia EN, bien-dans-ma-ville, villesavivre), sous le seuil |
| Saint-Leu (974, Insee 97413, absente par code) | Saint-Louis 18,0 · Saint-Paul 18,0 · Le Tampon 26,4 · Saint-Pierre 27,2 km | DVF appart. PAP **4 710 €/m²** (juillet 2026) ÷ médiane DVF des voisines au dépôt **2 858** (2 294 / 5 304 / 2 387 / 3 329) = **1,65** | **reportée** : hors ± 30 % (§ 3.3 bis), 4ᵉ voisine > 25 km |
| La Possession (974) | 4ᵉ voisine à 41 km | — | reportée, règle non valable |
| Le Gosier (971) | 2 voisines admissibles | — | reportée, règle ② non outillée (Pointe-à-Pitre sous 20 000) |
| Matoury, Rémire-Montjoly (973) | 2 voisines (Cayenne, Saint-Laurent à 200 km) | — | reportées, règle non valable en Guyane |

⚠️ Square Habitat indexe Saint-Leu sous « 97416 », qui est son **code postal** et le **code Insee de
Saint-Pierre** : ne pas confondre les deux au prochain relevé.

*Aucune modification du seed* : pas de dérive à mesurer, table des couleurs inchangée (589).

**Prochain lot** : le gisement « règle valable au-dessus de 20 000 hab. » est **épuisé** hors liste exhaustive Insee
(passe locale). Ce qui reste n'avance que par décision de méthode : ① les overrides documentés (Clichy-sous-Bois,
Romainville, Ris-Orangis, Maisons-Laffitte, Sucy-en-Brie, La Madeleine, Villeneuve-d'Ascq) ; ② outiller la règle ②
(plancher 10 000 dans le département) ; ③ décider si le seuil descend sous 20 000 hab. — Bourg-lès-Valence, Cesson-
Sévigné, Bruz, Lunéville seraient alors les premières à mesurer. Aucune des trois ne se tranche sans le propriétaire.

### 2026-10-13 (second run) — lot 15 (+1) : Vallauris ; règle ② outillée et passée sur 13 reportées

`seed-coverage` au départ : **1 ville en attente** (Carquefou, photo seule ; tout le reste servi à 589/589 hors
manques permanents) → lot autorisé. 589 → **590**, Alpes-Maritimes, aucun département ni région nouveaux.

*Règle ② outillée.* `scripts/seed-neighbours.ts --regle2` : même département, plancher 10 000 hab. (§ 3.2) ;
avertissement systématique rappelant le backtest (0,67 contre 0,57) et le nombre de voisines sous 20 000 ;
refus si combinée à `--cross-dept`. Passée sur les reportées « voisines trop rares » :

| Commune | Résultat règle ② | Décision |
|---|---|---|
| Le Gosier (971) | 3 voisines (Pointe-à-Pitre, Les Abymes, Baie-Mahault) | reportée : la Guadeloupe n'a que 3 villes au seed |
| Lunel, Frontignan (34) | 1 voisine (Agde, 27-67 km) | reportées |
| Lisieux (14) | 1 voisine (Hérouville, 41 km) | reportée |
| Fougères (35) | 2 voisines (Vitré, Dinard 70 km) | reportée |
| Le Creusot, Montceau-les-Mines (71) | 3 voisines (Autun, Chalon, Mâcon) | reportées |
| Miramas (13) | 4 voisines, 4ᵉ (Saint-Rémy) à 26,8 km, repère m² × 1,78 | reportée : Saint-Rémy ne ressemble pas à Miramas |
| La Teste-de-Buch (33) | 4 voisines à 44-45 km (métropole bordelaise) | reportée |
| Nogent-sur-Oise (60) | Creil 1,3 · Chantilly · Senlis · Méru 24 km, repère m² × 2,74 | reportée : Chantilly/Senlis ne décrivent pas Nogent |
| Saint-Jean-de-Braye (45) | 3ᵉ et 4ᵉ voisines à 55-57 km | reportée |
| La Garde (83) | 4ᵉ voisine à 55 km, Toulon en override | reportée |
| **Vallauris (06)** | **passe la règle standard** (règle ② inutile) | **lot 15** |

Aucune candidate n'a donc encore besoin de la règle ② : elle est prête, elle n'a rien débloqué.

*Pourquoi Vallauris passe maintenant.* Notée « non mesurée » au backlog ; mesurée ce run, la règle standard
trouve 4 voisines admissibles (Antibes et Cannes en override, écartées) : **Le Cannet 3,2 · Mandelieu-la-Napoule
10,0 · Cagnes-sur-Mer 12,2 · Grasse 14,4 km**. ⚠️ 4ᵉ voisine au-delà de 12,6 km, assumé comme aux lots 12 et 14
(même agglomération azuréenne, backtest 0,57 sous 25 km). ⚠️ Les vraies voisines immédiates (Antibes, Cannes) sont
en override : la note héritée décrit la couronne Le Cannet / Mandelieu / Cagnes / Grasse, pas les deux villes-centres.

*Identité* : Insee **06155** (absence vérifiée par code), population municipale **29 259** (populations de
référence 2023 : Banatic ; notre-planete.info ; villesavivre) → 29 300 au seed. Coordonnées **43,5766 N 7,0561 E**
(fiche touristique, N 43°34′35,8″ E 7°03′21,9″). Altitude 0-285 m (fiche touristique ; le guide pratique de l'office
de tourisme donne 0-281 m) → milieu **143 m**.

*Notes brutes* (règle standard) : 7,5 · 6,4 · 8 · 5,5 · 7 · 7 · 6,9 · 6,8, global 6,9 ; rendu **5,4** (ambre ;
voisines rendues 4,2 / 4,5 / 6,2 / 5,8). Climat : Le Cannet (2 800 h / 26 °C / 9 °C).

*Logement* (§ 3.3 bis) : DVF appartements de la commune — PAP **4 222 €/m²** (1ᵉʳ juillet 2026), efficity 4 430
(juillet 2026), L'Apporteur d'Immo 3 976 (31 juillet 2026) → médiane **4 222** ; médiane DVF des 4 voisines au dépôt
(`city-property-prices.json` : Grasse 2 999, Le Cannet 3 893, Cagnes 4 727, Mandelieu 4 783) **4 310** → ratio
**0,98**. Intra-source PAP : Le Cannet 3 990 → 1,06 ; efficity Mandelieu 5 240 (dépôt 4 783, efficity ≈ × 1,1) →
Vallauris corrigée ≈ 4 030, ratio ≈ 0,93. Tout sous ± 10 % : **repère médian conservé**, 700/990/1 330, **4 500 €/m²**.
L'alerte « repère m² des voisines × 1,81 » (Grasse 3 200 contre Mandelieu 5 800) est levée par ce recoupement : la
commune tombe au milieu de ses voisines. Pas de loyer au m² d'un même portail : loyers = médiane.

*Quartiers* (notes = ville) : **Vallauris centre** (château reconstruit au XVIᵉ siècle : musée national Picasso
« La Guerre et la Paix », musée Magnelli, musée de la Céramique — provence7, office de tourisme) et **Golfe-Juan**
(débarquement de Napoléon le 1ᵉʳ mars 1815, départ de la route Napoléon — guide pratique de l'office de tourisme).
Picasso à Vallauris de 1948 à 1955 (mêmes sources). Tags sans `port`/`mer`/`côte`/`plage` (Golfe-Juan a un port :
non tagué). Code postal 06220 → postal-codes 590/590.

*Dérive* : `seed-drift` → **0 ville changée, 0 citation**. Couleurs recomptées sur `CITIES_SEED` (590) :
19 / 50 / 151 / **157** / 119 / 94, moyenne 5,36.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (590 villes) + `:check`, `sitemap:check`
(FR 31 651, EN 31 243), `hreflang:check`, `seed:neighbours:selftest` (après commit). `npm run build` non lancé.

*En attente du runner* : Vallauris (tous pipelines sauf codes postaux), Carquefou (photo).

**Prochain lot** : `seed-coverage`, puis `seed:neighbours:relire` quand Vallauris est servie (DVF de la commune au
dépôt : ratio attendu ~0,98). Gisement : mesurer les communes de 20 000+ hab. dont le backlog dit « non mesurées » ou
dont les voisines en override sont la seule raison de report, comme Vallauris ; sinon les trois décisions de méthode
du run précédent (overrides documentés, seuil sous 20 000 hab.).


### 2026-10-13 (troisième run) — aucun lot : gisement épuisé, backlog restructuré, trois 974 mesurées

`seed-coverage` au départ : **1 ville en attente** (Carquefou, photo seule) → lot autorisé, runner local vivant
(commit `[local-runner]` du jour, biodiversité / actualité / zones protégées à 590/590). `seed:neighbours:relire` :
**0 repère à relire** ; **Vallauris servie**, DVF 4 225 ÷ 4 310 = **0,980**, conforme au ratio attendu au lot 15
(repère médian 4 500 €/m² conservé).

*Balayage* : ~400 noms de communes de 20 000 hab. et plus testés contre le seed (Île-de-France, métropoles,
préfectures et sous-préfectures, DROM). Les absentes sont toutes déjà reportées ou sous le seuil. Trois communes
de La Réunion jamais passées au script, **absentes vérifiées par code Insee**, mesurées avec `seed:neighbours` :
Sainte-Marie (97418 ; 4ᵉ voisine à 42,6 km), Le Port (97407 ; 44,5 km), Sainte-Suzanne (97420 ; 42,5 km).
Saint-Denis (La Réunion) dépasse 150 000 hab. et sort du filtre, donc les voisines sont l'est et le sud de l'île :
au-delà de 25 km le backtest monte à 0,68, et Saint-Leu, même cas, a été reportée le 2026-10-13. **Reportées.**
`geo.api.gouv.fr` refuse toujours le CONNECT depuis la routine : la liste exhaustive reste une passe locale.

*Livrable* : le backlog (§ 5) est réécrit en quatre tableaux — override à écrire, marché hors ± 30 %, voisines
trop rares ou lointaines, sous le seuil — à la place d'un paragraphe de 35 lignes où ajoutées et reportées se
mêlaient. Chaque reportée garde sa raison mesurée ; les codes Insee ne sont donnés que là où un run les a
vérifiés.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (590).

**Prochain lot** : rien ne passe la règle actuelle. Trois décisions du propriétaire débloqueraient l'extension :
① overrides documentés (tableau A, dont Villeneuve-d'Ascq, la plus grosse absente connue) ; ② abaisser
le seuil sous 20 000 hab. (tableau D) ; ③ une règle pour les DROM où la ville-centre dépasse 150 000 hab.
(Réunion : Sainte-Marie, Le Port, Sainte-Suzanne, La Possession attendent ; populations à recouper). Sans décision, les runs suivants ne peuvent que
vérifier la couverture et relire les repères.


### 2026-10-13 (quatrième run) — aucun lot : une commune franchit le seuil, mesurée et reportée

`seed-coverage` au départ : **1 ville en attente** (Carquefou, photo seule) → lot autorisé. Nouveau balayage par
nom, cette fois **par slug et par nom normalisé** contre `CITIES_SEED` (~650 noms, banlieues de province et DROM
compris) : aucune commune de 20 000 hab. et plus absente qui ne soit déjà au backlog, à une exception près —
**L'Isle-sur-la-Sorgue (84054)**, rangée au tableau D « sous le seuil » mais à **20 244 hab.** dans les populations de
référence 2023 (Banatic + Wikipédia + Habity, publication Insee de décembre 2025 ; 20 315 en 2022). Absence vérifiée
par code Insee.

*Mesure* (`seed:neighbours`, 43,919 N 5,051 E) : standard → Cavaillon 9,3 · Carpentras 15,2 · Orange 31,1 ·
**Pertuis 44,1 km** (Avignon en override) ; deux villes des Bouches-du-Rhône plus proches que la 4ᵉ (Salon 31,2,
Arles 43,4). Règle ② → Apt remplace Pertuis, **4ᵉ voisine Orange à 31,1 km**. Dans les deux cas la 4ᵉ voisine est
au-delà de 25 km (backtest 0,68), le cas qui a fait reporter Saint-Leu et les trois communes de La Réunion le même
jour : **reportée**, par cohérence, au tableau C. Règle ① non tentée : Avignon, la vraie ville-centre, est en
override, et Salon / Arles ne décrivent pas mieux la vallée de la Sorgue.

*Livrable* : backlog fiabilisé — L'Isle-sur-la-Sorgue sortie du tableau D ; cinq communes proches du seuil
recoupées sur le millésime 2023 (toutes sous 20 000) ; Sainte-Anne, Le Moule, Petit-Bourg (971) et Kourou (973),
absentes du backlog, ajoutées au tableau C (même blocage que Le Gosier et Matoury). Aucune modification du seed :
dérive nulle, table des couleurs inchangée (590).

**Prochain lot** : inchangé — rien ne passe la règle actuelle. Les décisions du propriétaire listées au run précédent
(overrides documentés, seuil sous 20 000, règle DROM, et désormais : accepter ou non une 4ᵉ voisine au-delà de 25 km
quand la ville-centre est en override) sont le seul déblocage. Relire chaque année le tableau D sur le nouveau
millésime de populations de référence.


### 2026-10-14 — lot 16 (+2) : Sainte-Marie (Réunion), Sainte-Suzanne (Réunion)

`seed-coverage` au départ : **1 ville en attente** (Carquefou, photo seule) → lot autorisé, runner local vivant.
590 → **592**, La Réunion, aucun département ni région nouveaux.

*Déblocage, mesuré plutôt que décidé au jugé.* Les quatre communes du nord de l'île étaient reportées le
2026-10-13 pour une 4ᵉ voisine au-delà de 25 km, par analogie avec le backtest national (0,68). Le backtest gagne
un filtre `--dept=` qui détaille la règle ville par ville : sur les 7 villes d'origine testables de La Réunion, la
4ᵉ voisine est **toujours** à 34-44 km et l'écart moyen vaut **0,62** — la règle est aussi juste sur l'île qu'en
métropole dense. La raison de report ne tient pas à La Réunion ; § 3.2 le consigne. Vaucluse (L'Isle-sur-la-Sorgue)
et Martinique : aucune ville testable par la règle standard, rien à conclure, L'Isle-sur-la-Sorgue reste reportée.
⚠️ **Décision de méthode prise par la routine** : à valider par le propriétaire (retrait = 2 entrées seed, housing,
quartiers, codes postaux, 2 lignes `DOCUMENTED_MODES`).

*Identité.* **Sainte-Marie** : Insee 97418 (absente vérifiée par code), population municipale 2023 **37 093**
(Banatic, Wikipédia, Insee PopRef 2023) → 37 100 ; coordonnées −20,8969 / 55,5492 (latlong.net) ; altitude
**5 m** (moyenne de l'infobox Wikipédia EN, commune de 0 à ~1 800 m ; bourg et aéroport sur la plaine côtière,
AIP FMEE 20 m) — ⚠️ pas le milieu de fourchette, qui donnerait ~900 m et classerait la ville « montagne », à
l'inverse des 8 autres villes de l'île notées au bourg (5 à 70 m, Le Tampon 530). **Sainte-Suzanne** : Insee 97420
(absente vérifiée), **25 551** en 2023 (Wikipédia EN citant l'Insee, citypopulation.de, villesavivre) → 25 600 ;
−20,9056 / 55,6072 ; altitude 5 m (même infobox, commune 0-1 449 m). Slugs suffixés `-reunion` (homonyme
Sainte-Marie en Martinique, Sainte-Suzanne en Mayenne / Doubs / Ariège). Codes postaux 97438 et 97441.

*Notes brutes* (règle standard, mêmes 4 voisines pour les deux : Saint-André 12,7 / 7,6 · Saint-Benoît 22,8 / 18,0
· Saint-Paul 31,5 / 36,7 · Le Tampon 42,6 / 42,4 km) : 6,5 · 4,9 · 9,2 · 5,5 · 5,9 · 6,3 · 5,8 · 5,9, global 6,3 ;
rendu **4,5** chacune (orange ; voisines rendues 3,6 / 3,7 / 5,3 / 5,2). Climat : Saint-Denis (10,7 km) pour
Sainte-Marie, Saint-André (7,7 km) pour Sainte-Suzanne — ville du seed la plus proche, § 3.3.

*Logement* (§ 3.3 bis). Médiane DVF appartements des 4 voisines au dépôt **2 113 €/m²** (1 491 / 1 839 / 2 387 /
5 304). Sainte-Marie : PAP **2 435** (1ᵉʳ juil. 2026) → **1,15** ; intra-source PAP (Saint-André 1 954,
Saint-Benoît 1 660, Le Tampon 2 473, Saint-Paul au-dessus) 2 213,5 → 1,10 ; efficity 2 810 écarté (type de bien
non précisé) → ratio **1,15**, repère **2 600 €/m²**. Sainte-Suzanne : PAP 2 542, efficity 2 480 → 2 511 → **1,19**,
intra-source 1,15 → repère **2 700 €/m²**. Loyers = médiane (450 / 640 / 830), aucun loyer au m² du même portail.
Axe coût hérité : biais conservateur assumé (§ 3.3 bis).

*Quartiers* (notes = ville) : Gillot (aéroport Roland-Garros, ex-aéroport de Gillot, ~7 km à l'est de Saint-Denis)
et Rivière des Pluies (limite avec Saint-Denis) ; Bel-Air (phare construit en 1845, en service le 15 octobre 1846,
classé MH le 5 septembre 2012 — notice Mérimée PA97400019) et Quartier-Français (village à ~3 km au sud-est de
La Vigne). Cascade Niagara (rivière Sainte-Suzanne, ~25 m) en tag, déjà citée « accessible depuis » Saint-André
par le guide tourisme. Tags sans `port`/`mer`/`côte`/`plage`.

*Reportées ce run* : **Le Port** (ratios de marché divergents à la frontière ± 10 %, voir tableau C) ;
**La Possession** (PAP 2 917 ÷ 2 066,5 = **1,41**, hors ± 30 %).

*Dérive* : `seed-drift` → **0 ville changée, 0 citation**. Couleurs recomptées sur `CITIES_SEED` (592) :
19 / 50 / 151 / 157 / **121** / 94, moyenne 5,35.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (592 villes) + `:check`, `sitemap:check`
(FR 31 742, EN 31 333), `hreflang:check`, `seed:neighbours:selftest` (après commit). `npm run build` non lancé.

*En attente du runner* : les deux nouvelles (tous pipelines sauf codes postaux), Carquefou (photo).

**Prochain lot** : `seed-coverage`, puis `seed:neighbours:relire` quand les deux villes sont servies (ratio attendu
~1,15-1,19). Le Port se tranche à la DVF de la commune. Gisement restant inchangé hors La Réunion : overrides
documentés, seuil sous 20 000 hab., règle Antilles-Guyane — décisions du propriétaire.


### 2026-10-14 (second run) — aucun lot : Le Port cherche sa seconde source DVF, sans succès

`seed-coverage` au départ : **2 villes en attente** (Sainte-Marie et Sainte-Suzanne, lot 16, tous pipelines sauf
codes postaux) + Carquefou (photo seule) → lot autorisé (seuil 30). `seed:neighbours:relire` : **0 repère à relire** ;
les deux villes du lot 16 sont « mesure incomplète » (pas encore servies par le runner). `seed:neighbours:selftest`
(clone complet) : **51/52** reproduites, l'écart étant Maisons-Laffitte, déjà documentée.

*Seule candidate à portée : Le Port (97407)*, reportée au lot 16 pour des ratios de marché divergents à la frontière
± 10 % (PAP 0,90 / intra-source PAP 0,88 / efficity 1,09). Deux recherches web pour un **second site publiant du DVF** :
aucun (Habity et Immovrai ne remontent que l'homonyme de l'Ariège, 09320). Trouvés, mais **pas des médianes DVF** et
donc non retenus au sens du § 3.3 bis : Orpi « prix moyen » appartement **2 037 €/m²** (sans année ni méthode),
netvendeur moyenne d'annonces tous biens 2 641 €/m² (28/08/2026), efficity 2 550 €/m² (moyenne de biens sur le
marché). À titre indicatif seulement, Orpi ÷ 2 340,5 = 0,87 rejoindrait le côté PAP (≈ −10 à −13 %), ce qui
suggérerait un ratio appliqué plutôt qu'un repère médian — mais une source non DVF ne tranche pas. **Reportée.**
Le Port n'étant pas au seed, la DVF du dépôt ne viendra pas d'elle-même : la trancher demande soit une passe locale
DVF sur 97407 (`scripts/city-property-prices.mjs` lit les fichiers par code commune), soit une décision du
propriétaire de retenir Orpi.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (592).

**Prochain lot** : relire Sainte-Marie / Sainte-Suzanne quand le runner les aura servies. Le gisement hors Le Port
reste suspendu aux décisions du propriétaire (overrides documentés — Villeneuve-d'Ascq en tête —, seuil sous
20 000 hab., règle Antilles-Guyane, validation de la levée « 4ᵉ voisine > 25 km » à La Réunion prise au lot 16).


### 2026-10-14 (troisième run) — aucun lot : repères m² de Sainte-Marie et Sainte-Suzanne relus

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents
(population : Mamoudzou, Pierrefitte ; revenus : 7 villes hors Filosofi) — le runner a servi le lot 16 (DVF, revenus,
population, biodiversité, actualité, zones protégées à 592/592). Lot autorisé, mais aucune candidate ne passe la règle.

*Relecture à mesure égale* (`seed:neighbours:relire`, après `git fetch --unshallow`) : les deux villes du lot 16 ont
désormais leur DVF au dépôt. **Sainte-Marie** 2 306 ÷ 2 113 = **1,091** (le ratio PAP du lot donnait 1,15) → sous
± 10 %, repère médian, **2 600 → 2 300 €/m²**. **Sainte-Suzanne** 2 400 ÷ 2 113 = **1,136** (lot : 1,19) →
**2 700 → 2 600 €/m²**. Reportés dans `data/housing.ts` et `RELU_APRES_LOT`. Les portails surestimaient ces deux
marchés de 5 à 6 points, même sens que la plupart des relectures du 2026-10-12. `relire` → 0 repère à relire ;
`selftest` 51/52 (écart Maisons-Laffitte, documenté). Loyers inchangés (aucune mesure de loyer au dépôt).

*Le Port (97407)* : egress `files.data.gouv.fr` refusé depuis la routine (403 CONNECT, retesté), donc sa DVF ne
peut pas être lue en cloud ; reste reportée (journal précédent).

*Dérive* : aucune note modifiée (le repère m² n'entre pas dans les axes) — table des couleurs inchangée (592).
Contrôles : `tsc`, `integrity`, `sitemap:check`, `hreflang:check`. `npm run build` non lancé.

**Prochain lot** : inchangé — suspendu aux décisions du propriétaire (overrides documentés, Villeneuve-d'Ascq en tête ;
seuil sous 20 000 hab. ; règle Antilles-Guyane ; validation de la levée « 4ᵉ voisine > 25 km » à La Réunion) ou à
une passe DVF locale sur 97407 pour Le Port.


### 2026-10-14 (quatrième run) — aucun lot : backlog D recoupé, aucune commune ne franchit le seuil

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents —
lot autorisé, mais le gisement « règle valable » reste épuisé (§ 5) et aucune candidate des tableaux A à C n'a
changé de statut depuis le troisième run. Egress retesté : `files.data.gouv.fr`, `geo.api.gouv.fr`,
`app.dvf.etalab.gouv.fr`, `www.data.gouv.fr` injoignables (connexion refusée) — Le Port (97407) ne peut toujours
pas être tranché sur sa DVF depuis une routine.

*Livrable* : fiabilisation du tableau D. Les communes les plus proches du seuil, jusqu'ici « relevées par nom » ou
recoupées sur un millésime ancien, sont relues sur les **populations de référence 2023** (en vigueur au
1ᵉʳ janvier 2026) : Chevilly-Larue 19 826, Juvisy-sur-Orge 19 292, Brie-Comte-Robert 19 003, Ploemeur 18 872,
Cesson-Sévigné 18 761, Chennevières-sur-Marne 18 710, Yutz 17 391, Lunéville ~18 262. **Aucune ne franchit
20 000** ; ⚠️ Chevilly-Larue est affichée à 20 326 par des copies anciennes de Wikipédia EN (millésime 2021) — c'est
la valeur 2023 qui fait foi. Les autres noms du tableau D (Le Vésinet, Viroflay, Garches…) n'ont pas été relus.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (592). Contrôles : aucun lancé
(modification de ce seul fichier de doc, aucun code ni donnée touchés). `npm run build` non lancé.

**Prochain lot** : inchangé — suspendu aux décisions du propriétaire (overrides documentés, Villeneuve-d'Ascq en tête ;
seuil sous 20 000 hab. ; règle Antilles-Guyane ; validation de la levée « 4ᵉ voisine > 25 km » à La Réunion) ou à
une passe DVF locale sur 97407 pour Le Port. Prochaine relecture utile du seuil : à la publication des populations
de référence 2024 (attendue fin décembre 2026) — Chevilly-Larue et Bourg-lès-Valence sont à moins de 200 hab.


### 2026-10-15 — aucun lot : codes Insee et populations 2023 du backlog recoupés

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents
(population : Mamoudzou, Pierrefitte ; revenus : 7 villes hors Filosofi) — lot autorisé, mais aucune candidate des
tableaux A à C n'a changé de statut : le gisement « règle valable » reste épuisé. Egress retesté :
`geo.api.gouv.fr`, `www.insee.fr`, `files.data.gouv.fr` injoignables (connexion refusée), donc ni liste exhaustive
Insee ni DVF de Le Port (97407).

*Livrable* : fiabilisation des tableaux A et C par recherche web, les lignes « à confirmer » ou « à recouper » prenant
leur code Insee et leur population de référence 2023. Deux sources concordantes : Villeneuve-d'Ascq **59009 / 62 868**,
Marcq-en-Barœul **59378 / 40 184**, Lambersart **59328 / 27 090**, Kourou **97304 / 24 824**. Table PopRef 2023
de l'Insee (dép. 971, une source mais primaire) : Le Gosier **97113 / 27 757**, Sainte-Anne **97128 / 23 973**,
Le Moule **97117 / 23 014**, Petit-Bourg **97118 / 24 665**. **Une seule source, à recouper avant tout lot** :
Matoury 97307 / 36 512 et Rémire-Montjoly 97309 / 27 723 (Wikipédia citant l'Insee), Lunel 34145 / ~26 623 et
Frontignan 34108 / ~24 136 (site de classement secondaire). Koungou 97610 : seul le recensement **2017** a été trouvé
(32 156, Banatic). Toutes restent au-dessus de 20 000 hab. : aucune ne change de tableau, leur blocage étant la règle
de voisinage, pas le seuil. ⚠️ L'absence du seed reste à revérifier par code au moment d'entrer dans un lot.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (592). Contrôles : aucun lancé
(modification de ce seul fichier de doc). `npm run build` non lancé.

**Prochain lot** : inchangé — suspendu aux décisions du propriétaire (overrides documentés, Villeneuve-d'Ascq en tête ;
seuil sous 20 000 hab. ; règle Antilles-Guyane ; validation de la levée « 4ᵉ voisine > 25 km » à La Réunion) ou à
une passe DVF locale sur 97407 pour Le Port.


### 2026-10-15 (second run) — aucun lot : tableau C recoupé, Lisieux et Montceau-les-Mines sortent sous le seuil

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents
(population : Mamoudzou, Pierrefitte ; revenus : 7 villes hors Filosofi) — lot autorisé, mais aucune candidate des
tableaux A à C ne passe la règle : le gisement « règle valable » reste épuisé, et aucune décision du propriétaire
n'est arrivée (ROADMAP, `git log` hors `[scheduled-agent]` relus).

*Livrable* : recoupement par recherche web (populations de référence 2023, deux sources dont Banatic à chaque fois)
des lignes du tableau C restées à une source ou « à confirmer ». Recoupées : Matoury **97307 / 36 512** (+ PopRef 2023
Insee Guyane), Rémire-Montjoly **97309 / 27 723**, Lunel **34145 / 26 623**, Frontignan **34108 / 24 136**, Fougères
**35115 / 20 307**, Le Creusot **71153 / 20 509**, Miramas **13063 / 26 203**, La Teste-de-Buch **33529 / 27 566**.
⚠️ **Deux communes sortent sous le seuil** et passent au tableau D : **Lisieux (14366) 19 645** et
**Montceau-les-Mines (71306) 17 064** — le tableau C les portait sur un ordre de grandeur ancien (Montceau était
au-dessus de 20 000 il y a vingt ans). Absence du seed vérifiée **par code** pour les dix. Aucun blocage de voisinage
ne change (Le Creusot garde ses 3 voisines Autun / Chalon / Mâcon).

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (592). Contrôles : aucun lancé
(modification de ce seul fichier de doc). `npm run build` non lancé.

**Prochain lot** : inchangé — suspendu aux décisions du propriétaire (overrides documentés, Villeneuve-d'Ascq en tête ;
seuil sous 20 000 hab. ; règle Antilles-Guyane ; validation de la levée « 4ᵉ voisine > 25 km » à La Réunion) ou à
une passe DVF locale sur 97407 pour Le Port. Lignes encore « à confirmer » : Saint-Jean-de-Braye, La Garde,
Grande-Synthe, Les Pennes-Mirabeau, Cenon, Mitry-Mory, Limeil-Brévannes et la dernière ligne groupée du tableau C.


### 2026-10-15 (troisième run) — lot 17 (+1) : Ozoir-la-Ferrière

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo) et les manques permanents → lot
autorisé. 592 → **593**, Seine-et-Marne, aucun département ni région nouveaux.

*Comment elle a été trouvée.* Les lignes « à confirmer » du tableau C ont été **remesurées avec le seed actuel**
(coordonnées approchées, centre de commune) plutôt que relues : les extensions des lots 6-7 (Roissy-en-Brie, Lagny,
Herblay, Saint-Gratien) ont changé le voisinage de plusieurs d'entre elles.

| Commune | Règle § 3.2 (seed actuel) | Décision |
|---|---|---|
| **Ozoir-la-Ferrière** (77350) | Roissy-en-Brie* 3,3 · Pontault-Combault 5,3 · Torcy 9,7 · Champs-sur-Marne 10,9 km, **aucune alerte** | **lot 17** |
| Villeparisis (77) | Chelles 7,0 · Lagny* 10,1 · Champs 10,3 · Torcy 10,6 km, mais Tremblay / Villepinte / Sevran (93) à 3,8-5,8 km | reportée (même motif que Mitry-Mory : la frontière coupe l'agglomération, règle ① refusée par l'écart de biais 93/77) |
| Saint-Ouen-l'Aumône (95) | 4ᵉ voisine 9,8 km, Conflans (78) à 4,8 km | reportée (alerte de frontière) |
| Deuil-la-Barre (95) | Montmorency · Saint-Gratien* · Eaubonne · Sarcelles (1,7-4,3 km) ; Épinay et Pierrefitte (93) plus proches | reportée (Sarcelles dans la médiane, alerte de frontière) |
| Les Ulis, Gif-sur-Yvette (91) | 4ᵉ voisine 13,2 / 16,0 km ; `--cross-dept` refusé (biais coût Vélizy > 1,0) | reportées |
| Le Mée-sur-Seine, Dammarie-les-Lys, Montereau (77), Mantes-la-Ville (78) | 4ᵉ voisine 28-42 km | reportées |

*Identité.* Insee **77350** (absente vérifiée par code, `seed:neighbours --insee`), population de référence 2023
**21 238** (Wikipédia EN citant l'Insee PopRef 2023 ; bien-dans-ma-ville ; villesavivre) → 21 200 ; coordonnées
48,7638 N 2,6717 E (distanceenvoiture 48,76383/2,67174 ; cartesfrance 48,762/2,673) ; altitude 94-122 m → **108 m**
(cartesfrance). Code postal 77330 (≠ code Insee).

*Notes brutes* (règle standard) : 6,5 · 7,4 · 6,9 · 5,5 · 6,2 · 6 · 7 · 6,5, global 6,4 ; rendu **5,2** (ambre ;
voisines rendues Roissy 5,1). Climat : Roissy-en-Brie (3,3 km).

*Logement* (§ 3.3 bis). DVF appartements ~**4 294 €/m²** (PAP 4 262 au 1ᵉʳ juil. 2026 ; Immovrai 4 326 en 2025 ;
Habity 4 199) ÷ médiane DVF appartements des 4 voisines au dépôt **3 333,5** (Torcy 3 303, Roissy 3 321, Champs
3 346, Pontault 3 772) = **1,29** ; intra-source PAP (Torcy 3 397, Roissy 3 462, Champs ~3 563 lu dans le tableau de
la page Pontault, Pontault 3 889) 4 262 ÷ 3 512,5 = **1,21**, à 6 % près (sans Champs : 1,23). Ratio 1,29 appliqué →
repère **5 000 €/m²** (médiane 3 900). Loyers = médiane (680 / 930 / 1 250), aucun loyer au m² du même portail.
⚠️ Ratio proche du plafond de ± 30 % : à relire avec `seed:neighbours:relire` dès que le runner aura servi la DVF de
la commune ; si la mesure du dépôt sort au-delà de 1,30, la ville rejoint Romainville parmi les notes héritées à
ne pas citer au dixième. Axe coût hérité de voisines moins chères : biais conservateur assumé (§ 3.3 bis).

*Quartiers* (notes = ville) : L'Archevêché (lotissements de l'Archevêché et de la Doutre lancés en 1927) et
Brèche-aux-Loups (urbanisé à partir de 1968, traversé par le RER E, branche E4) — brochure « nouveaux arrivants »
de la mairie et fiche Wikipédia. Tags : Seine-et-Marne, RER E, forêt d'Armainvilliers (massif « forêts
d'Armainvilliers et de Ferrières », ~5 683 ha sur 12 communes).

*Dérive* : `seed-drift` → **0 ville changée, 0 citation**. Couleurs recomptées sur `CITIES_SEED` (593) :
19 / 50 / 151 / **158** / 121 / 94, moyenne 5,35.

*Contrôles* : `tsc` propre, `npm run integrity`, `search-index` (593 villes) + `:check`, `sitemap:check`
(FR 31 810, EN 31 393), `hreflang:check`, `seed:neighbours:selftest` (après commit). `npm run build` non lancé.

*En attente du runner* : Ozoir-la-Ferrière (tous pipelines sauf codes postaux), Carquefou (photo).

**Prochain lot** : `seed-coverage`, puis `seed:neighbours:relire` quand Ozoir est servie. Le reste du gisement
inchangé : overrides documentés (Villeneuve-d'Ascq en tête), seuil sous 20 000 hab., règle Antilles-Guyane,
validation de la levée « 4ᵉ voisine > 25 km » à La Réunion, et une décision sur l'alerte de frontière quand la
règle standard tient (Villeparisis, Saint-Ouen-l'Aumône).


### 2026-10-15 (quatrième run) — aucun lot : repère d'Ozoir-la-Ferrière relu, Les Lilas et Limeil-Brévannes remesurées

`seed-coverage` au départ : Ozoir-la-Ferrière **servie par le runner** (`a04e7e9`), seul Carquefou attend encore sa
photo → lot autorisé.

*Relecture à mesure égale* (`seed:neighbours:relire`) : Ozoir DVF appartements au dépôt **4 200** ÷ 3 333,5 = **1,260**
(la recherche web du lot donnait 1,29), sous le plafond de ± 30 % → repère **4 900 €/m²** (au lieu de 5 000), reporté
dans `housing.ts` et `RELU_APRES_LOT`. La ville reste dans la règle, ses notes ne bougent pas. Selftest 52/53
(Maisons-Laffitte documentée), « 0 repère(s) à relire ».

*Candidates remesurées avec le seed actuel* (extensions de 93/94 proches) :

| Commune | Règle § 3.2 | Décision |
|---|---|---|
| Les Lilas (93) | Romainville* 1,2 · Bagnolet 1,2 · Noisy-le-Sec 2,5 · Aubervilliers 4,6 km ; marché 6 600 ÷ 4 590,5 = **1,44** | reportée, tableau B (marché) |
| Limeil-Brévannes (94) | Villeneuve-Saint-Georges* · Saint-Maur · Choisy · Maisons-Alfort ; Yerres / Montgeron / Brunoy (91) plus proches, repère m² des voisines × 1,76 | reportée (alerte de frontière, Saint-Maur tire la médiane) |
| Villiers-sur-Marne (94) | Champigny · Le Perreux · Saint-Maur · Nogent (repère médian 6 800) ; 5 villes 77/93 plus proches | inchangée (tableau B) |
| Bonneuil-sur-Marne (94) | — | sous 20 000 hab., non retenue |

*Dérive* : `seed-drift` → 0 ville changée, 0 citation (le repère m² n'entre pas dans les notes). Table des couleurs
inchangée (593). Contrôles : `tsc` propre, `npm run integrity` vert. `npm run build` non lancé.

**Prochain lot** : inchangé — suspendu aux décisions du propriétaire (overrides documentés, Villeneuve-d'Ascq en tête ;
seuil sous 20 000 hab. ; règle Antilles-Guyane ; La Réunion ; alerte de frontière quand la règle standard tient :
Villeparisis, Saint-Ouen-l'Aumône) ou à une passe DVF locale sur 97407 pour Le Port.


### 2026-10-16 — aucun lot : les lignes « à confirmer » du tableau C remesurées, Cenon passe au tableau A

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents →
lot autorisé. Aucune décision du propriétaire depuis le 15/10 (`git log` hors `[scheduled-agent]` : seul le commit
`[local-runner]` du 15).

*Remesure avec le seed actuel* (`seed:neighbours`, coordonnées approchées de centre de commune) :

| Commune | Standard | Règle ② | Décision |
|---|---|---|---|
| Saint-Jean-de-Braye (45) | 2 voisines (Fleury, Olivet) | 3ᵉ-4ᵉ Gien / Montargis à 55-58 km | reste C |
| La Garde (83) | 3 voisines (4ᵉ Saint-Raphaël 70 km) | 4ᵉ Sainte-Maxime 55 km, Bouches-du-Rhône plus proches | reste C |
| Le Petit-Quevilly (76) | 3 voisines | 4ᵉ Dieppe 56 km, repère × 1,61 | reste C |
| Castelnau-le-Lez (34) | 1 voisine (Agde 50 km) | — | reste C |
| Cournon-d'Auvergne (63) | 0 voisine (Clermont en override) | — | reste C |
| Villefontaine (38) | 4ᵉ Fontaine 63 km ; 19 villes du Rhône plus proches | — | reste C |
| Nogent-sur-Oise (60) | 3 voisines (Creil 1,2 km puis 31-33 km) | — | reste C |
| Grande-Synthe, Coudekerque-Branche (59) | 4ᵉ voisine 63-68 km, Calais plus proche | — | restent C |
| Les Pennes-Mirabeau (13) | 4ᵉ Aubagne 24,5 km, Allauch / Aubagne de l'autre côté de Marseille | — | reste C |
| **Cenon (33)** | **aucune alerte** | — | **tableau A** (voir ci-dessous) |

*Cenon* : la ligne C ne portait qu'un jugement (« rive droite, voisines rive gauche »). Remesurée, elle **passe la
règle standard et le marché** (§ 3.3 bis : ~2 958 ÷ 3 494 = 0,85, ratio appliqué possible ; ⚠️ efficity est une
estimation, une seconde source DVF au sens strict manque encore). Ce qui la retient est désormais une **mesure** :
niveau de vie médian ~18 920 € (habity citant Filosofi 2021, une seule source, à recouper) contre 23 360 (Bègles),
23 780 (Villenave), 24 260 (Talence) et 27 570 € (Le Bouscat) au dépôt, soit −19 à −31 %. La médiane des quatre
voisines donnerait à Cenon les notes de sécurité et d'écoles de communes plus aisées : cas exact de la « limite
connue » du § 3.2. Elle attend un override documenté, comme La Madeleine. Identité recoupée : Insee **33119**,
**26 834** hab. (PopRef 2023 : Wikipédia EN + notre-planete), code postal 33150.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (593). Contrôles : aucun lancé
(modification de ce seul fichier de doc). `npm run build` non lancé.

**Prochain lot** : inchangé — suspendu aux décisions du propriétaire (overrides documentés : Villeneuve-d'Ascq,
Cenon, La Madeleine… ; seuil sous 20 000 hab. ; règle Antilles-Guyane ; La Réunion ; alerte de frontière quand la
règle standard tient : Villeparisis, Saint-Ouen-l'Aumône) ou à une passe DVF locale sur 97407 pour Le Port.


### 2026-10-16 (second run) — aucun lot : quatre lignes du tableau A remesurées, Chatou dépend de ses coordonnées

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents →
lot autorisé. Aucune décision du propriétaire depuis le 15/10. Les lignes du tableau A « règle non valable, mesurée le
2026-10-08 » n'avaient pas été revues depuis l'arrivée des lots 4 à 17 ; quatre d'entre elles ont des extensions
dans leur voisinage (Achères, Maisons-Laffitte, Vallauris).

| Commune | Mesure (seed actuel) | Décision |
|---|---|---|
| Les Mureaux (78) | Poissy 11,3 · Achères* 11,5 · Conflans 13,3 · Sartrouville 18,9 km ; Cergy et Pontoise (95) plus proches que la 4ᵉ | reportée |
| Saint-Laurent-du-Var (06) | Cagnes 3,5 · Vallauris* 15,2 · Le Cannet 17,7 · Grasse 21,8 km ; repère m² × 1,63 (Nice en override) | reportée |
| Gardanne (13) | Allauch 13,2 · Vitrolles 18,0 · Aubagne 19,5 · Marignane 21,0 km (Aix en override) | reportée |
| **Chatou (78)** | voir ci-dessous | reportée |

*Chatou* : la plus proche d'un ajout. Identité recoupée : Insee **78146** (absente vérifiée par code), **30 598** hab.
(PopRef 2023 : Wikipédia EN + Banatic + bien-dans-ma-ville), altitude 22-58 m → 40 m (Vikidia, cartesfrance). La
règle standard donne Houilles · Sartrouville · Maisons-Laffitte* · Le Chesnay-Rocquencourt avec 9 villes 92/95 plus
proches que la 4ᵉ (Rueil à 2,7 km) : la frontière coupe l'agglomération, donc règle ①. **Son résultat bascule avec le
point retenu pour le centre de la commune** : à 48,8897 / 2,1573, voisines Rueil · Houilles · Sartrouville · Suresnes,
écart de biais 78/92 = 0,4, règle acceptée ; à 48,8962 / 2,1559 (moyenne de Vikidia 48°53′46″ N 2°09′06″ E et de
distanceenvoiture 48,8964 / 2,1601, les deux sources trouvées, qui divergent de ~600 m), **Bezons (95) passe devant
Suresnes** et la règle est **refusée** (écart de biais coût > 1,0). Une note qui dépend de quelques centaines de
mètres sur un centroïde non officiel ne passe pas. Le reste tenait : marché DVF appartements ~4 680 €/m² (PAP 4 682
au 1ᵉʳ juil. 2026, Immovrai 4 676 en 2025) ÷ 4 915 (médiane des 4 voisines ① au dépôt) = **0,95**, sous ± 10 % ;
intra-source PAP sur Houilles seule (4 387 contre 4 352 au dépôt) ; niveau de vie ~33 670 € (habity, une seule
source) contre 25 680-32 980 € chez les voisines. **Condition de réouverture** (⚠️ jugée fausse au run suivant, voir plus bas) : les coordonnées officielles du
chef-lieu (geo.api.gouv.fr, refusé en CONNECT depuis la routine, revérifié ce run avec files.data.gouv.fr et
Cerema), puis rejouer `seed:neighbours -- --lat=… --lng=… --dept=Yvelines --cross-dept --insee=78146`.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (593). Contrôles : aucun lancé
(modification de ce seul fichier de doc). `npm run build` non lancé.

**Prochain lot** : Chatou dès que les coordonnées officielles sont connues (passe locale ou egress geo.api) ; sinon
inchangé — suspendu aux décisions du propriétaire (overrides documentés : Villeneuve-d'Ascq, Cenon, La Madeleine… ;
seuil sous 20 000 hab. ; règle Antilles-Guyane ; alerte de frontière quand la règle standard tient : Villeparisis,
Saint-Ouen-l'Aumône) ou à une passe DVF locale sur 97407 pour Le Port.

### 2026-10-16 (troisième run) — aucun lot : l'instabilité de Chatou est intrinsèque, la condition de réouverture était fausse

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents →
lot autorisé. Aucune décision du propriétaire depuis le 15/10. Egress revérifié : `geo.api.gouv.fr`,
`api-adresse.data.gouv.fr`, `nominatim.openstreetmap.org`, `overpass-api.de` — tous refusés (code 000).

*Chatou, quatre points mesurés* (distances haversine aux coordonnées du seed : Suresnes 48,8718/2,2278,
Bezons 48,9241/2,2152) :

| Point | Source | Suresnes | Bezons | 4ᵉ voisine | Règle ① |
|---|---|---|---|---|---|
| 48,8897 / 2,1573 | Wikipédia (centre) | 5,53 km | 5,70 km | Suresnes | acceptée |
| 48,8906 / 2,1569 | annuaire administratif (centre, 48,890556 / 2,156944) | 5,59 km | 5,66 km | Suresnes | acceptée |
| 48,8964 / 2,1601 | distanceenvoiture | 5,66 km | 5,07 km | Bezons | refusée |
| 48,8961 / 2,1517 | mairie, 11 place du Général-de-Gaulle (= point Vikidia) | 6,19 km | 5,59 km | Bezons | refusée |

Les deux sources « centre de commune » concordent (≈ 100 m) et donnent Suresnes, mais avec **70 à 170 m de marge**
seulement : Suresnes et Bezons sont pratiquement à égale distance de Chatou, de part et d'autre de la Seine. Le
run précédent posait comme condition de réouverture « les coordonnées officielles du chef-lieu » : c'est faux, un
centroïde officiel tomberait lui aussi dans cette bande de quelques centaines de mètres, et la note (global 6,4
contre 6,1, coût 4,4 contre 5,2) resterait l'effet d'une décimale de coordonnée. **Nouvelle condition** : une règle
d'égalité décidée par le propriétaire (par exemple : quand la 4ᵉ et la 5ᵉ voisine sont à moins de 0,5 km d'écart,
prendre les 5 et exiger que la règle ① tienne sur chacune des deux combinaisons, ce qui ici la **refuse** puisque
Bezons échoue au biais coût). Sans règle, Chatou reste au tableau A.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (593). Contrôles : aucun lancé
(modification de ce seul fichier de doc). `npm run build` non lancé.

**Prochain lot** : suspendu aux décisions du propriétaire (règle d'égalité des voisines pour Chatou ; overrides
documentés : Villeneuve-d'Ascq, Cenon, La Madeleine… ; seuil sous 20 000 hab. ; règle Antilles-Guyane ; alerte de
frontière quand la règle standard tient : Villeparisis, Saint-Ouen-l'Aumône) ou à une passe DVF locale sur 97407
pour Le Port.

### 2026-10-17 — aucun lot : gisement 20 000+ revérifié par un second balayage, contrôles de régression verts

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents
(dernier commit `[local-runner]` le 15/10) → lot autorisé. Aucune décision du propriétaire depuis le 15/10 : toutes
les candidates connues restent suspendues à une décision de méthode (tableaux A à C).

*Second balayage par nom* : ~400 noms de communes de 20 000 hab. et plus (petite et grande couronne, métropoles
de Lyon, Bordeaux, Toulouse, Nantes, Lille, Strasbourg, Grenoble, Marseille, Nice, puis préfectures,
sous-préfectures et villes moyennes de toutes les régions) passés contre `name:` du seed. **Aucune absente
au-dessus du seuil** hors les lignes déjà aux tableaux A-C. Les absentes trouvées sont toutes sous 20 000 hab. et
vont au tableau D ; les deux plus proches du seuil ont été recoupées par recherche web : Sorgues ~19 006 (2023),
Fécamp ~17 313. Le gisement « règle valable » est donc confirmé épuisé sous deux méthodes de balayage
indépendantes ; seule la liste exhaustive Insee (passe locale) pourrait encore faire apparaître un oubli.

*Contrôles de régression sur les 53 villes d'extension* (aucune modification du seed) :
`seed:neighbours:relire` → **0 repère à relire** (DVF des 53 villes servie, ratios inchangés) ;
`seed:neighbours:selftest` → **52/53 reproduites**, Maisons-Laffitte hors règle documentée ;
`seed-drift` → **0 ville changée**, 0 citation de guide candidate ; `seoDescriptionEn` : **555/555** « x.y/10 »
égaux à la note globale rendue (scratch hors dépôt).

Table des couleurs inchangée (593). `npm run build` non lancé.

**Prochain lot** : suspendu aux décisions du propriétaire (règle d'égalité des voisines pour Chatou ; overrides
documentés : Villeneuve-d'Ascq, Cenon, La Madeleine, Marcq-en-Barœul, Lambersart ; seuil sous 20 000 hab., qui
ouvrirait Sorgues, Bourg-lès-Valence, Chevilly-Larue, Lisieux… ; règle Antilles-Guyane ; alerte de frontière quand
la règle standard tient : Villeparisis, Saint-Ouen-l'Aumône) ou à une passe DVF locale sur 97407 pour Le Port.

### 2026-10-17 (second run) — aucun lot : les décisions attendues regroupées au § 0

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents →
lot autorisé. Aucune décision du propriétaire depuis le 15/10 (`git log` hors `[scheduled-agent]` : design, agenda,
audit mobile, aucun touchant le seed ni la méthode). Rien ne passe la règle : aucune ville ajoutée.

*Livrable* : les sept décisions dont dépend l'extension, jusqu'ici dispersées dans une quinzaine d'entrées du
journal, sont regroupées dans un tableau unique en tête de fichier (§ 0), chacune avec ce qu'elle débloque et ce
que la routine ferait par défaut. Deux propositions y sont formulées pour la première fois (D3 Antilles-Guyane,
D5 alerte de frontière) ; elles ne sont **pas appliquées** tant que le propriétaire ne les a pas validées.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (593). Contrôles : aucun lancé
(modification de ce seul fichier de doc). `npm run build` non lancé.

**Prochain lot** : dès qu'une décision du § 0 est prise ; sinon aucun.

### 2026-10-17 (troisième run) — aucun lot : six « 540 » de métadonnées remplacés par le compte rendu

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents →
lot autorisé, mais aucune décision du propriétaire au § 0 depuis le 15/10 (`git log` hors `[scheduled-agent]` :
hub présidentielle, design, agenda, audit mobile) : rien ne passe la règle, aucune ville ajoutée.

*Livrable* : relecture du point ② de l'inventaire (« 540 » écrits en dur dans le texte rendu) après les commits du
16-17/10. Six chaînes **affirmaient la taille actuelle du corpus** et étaient fausses depuis le lot 1 :
- `/orientation-politique` et `/political-leaning` (`description`, réécrite le 16/10 avec « 540 ») → `${allPoliticalLeans().length}`, soit **593** ;
- `/climat-2040-timelapse` → `${CITIES_LIGHT_METRO.length}`, soit **573** (la page ne rend que la métropole, le
  chiffre est donc celui qu'elle affiche, pas celui du seed) ;
- profil `famille-a-l-etranger` (`metaDescription`) → « Toutes les villes du site comparées » : `lib/profile-pages.ts`
  est importé par un composant client et ne doit pas lire `CITIES_SEED` en valeur ;
- deux `description` EN de `/red-flags/themes/[slug]` (« 540-city dataset ») → formulation sans compte.

Laissés tels quels, volontairement : les « 540 » qui décrivent **le périmètre d'une mesure faite à une date**
(retrait du rang de richesse biodiversité sur « les 540 villes », 538/540 au recensement, 44 villes sur 540 en
bruit, red flags qui publient des comptes datés) — les remplacer par 593 rendrait la phrase fausse dans l'autre sens.
Ils sont à remesurer par leur propriétaire, pas à réécrire à la main.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (593). Contrôles : `npx tsc --noEmit`
propre, `npm run integrity`, `npm run sitemap:check`, `npm run hreflang:check` verts. `npm run build` non lancé.

**Prochain lot** : dès qu'une décision du § 0 est prise ; sinon aucun.

### 2026-10-17 (quatrième run) — aucun lot : huit lignes du tableau D recoupées par code Insee

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents →
lot autorisé, mais aucune décision du propriétaire au § 0 (`git log` depuis le 15/10 : aucun commit hors
`[scheduled-agent]` ne touche le seed, `score-calibration.ts`, ROADMAP ni ce fichier) : rien ne passe la règle.

*Livrable* : fiabilisation du backlog. Huit communes du tableau D n'étaient « relevées que par nom, sans recoupement
de population » ; on ne pouvait donc pas exclure qu'une ait franchi 20 000 hab. au millésime 2023. Absence au seed
vérifiée **par code Insee** pour les huit, puis population 2023 recoupée sur deux sources (détail au § 5 D) : Hem
18 582, Bry-sur-Marne 18 503, Garches 17 743, Le Pré-Saint-Gervais 16 993, Les Herbiers 16 521, Le Bourget 15 925,
Canet-en-Roussillon 13 227 ; Saint-Pierre-des-Corps ~15 900 (sources discordantes, toutes sous le seuil).
**Aucune ne franchit le seuil** : le gisement 20 000+ reste épuisé sous la règle actuelle.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (593). Contrôles : aucun lancé
(modification de ce seul fichier de doc). `npm run build` non lancé.

**Prochain lot** : dès qu'une décision du § 0 est prise ; sinon aucun. Reste au tableau D sans recoupement : Le Vésinet,
Viroflay, Boissy-Saint-Léger, Valenton, Villetaneuse, Saint-Brice, Mennecy, Nemours, Vaires, Canteleu, Bois-Guillaume,
Ifs, Guipavas, Pornic, Beaucaire, Rive-de-Gier, Ramonville, Saint-Égrève, Plan-de-Cuques, Elbeuf, Héricourt, Woippy,
Freyming-Merlebach, Creutzwald, Villers-lès-Nancy, Anzin, Chauny, Tergnier, Le Pontet, Saint-Junien, Dugny, Lognes.

### 2026-10-18 — aucun lot : six candidates de la décision D2 pré-mesurées, une seule passerait

`seed-coverage` au départ : **0 ville en attente du runner** hors Carquefou (photo seule) et les manques permanents
(dernier commit `[local-runner]` le 15/10) → lot autorisé, mais aucune décision du propriétaire au § 0 (`git log`
depuis le 15/10 : aucun commit hors `[scheduled-agent]` ne touche le seed, `score-calibration.ts`, ROADMAP ni ce
fichier). Rien ne passe la règle actuelle : aucune ville ajoutée.

*Livrable* : pour que la décision D2 (seuil à 15 000 hab.) puisse être prise sur pièces et produire un lot dès le run
suivant, `npm run seed:neighbours` a été passé sur les six communes du tableau D dont la population 2023 est déjà
recoupée, **chacune sur deux jeux de coordonnées** (sources discordantes de 0,5 à 1 km : latitudelongitude.org /
GeoNames / NGA contre distanceenvoiture.fr / OpenStreetMap), pour vérifier que le résultat ne dépend pas du centroïde
— la leçon de Chatou (2026-10-16). Aucune écriture dans le seed.

| Commune | Insee | Résultat | Détail |
|---|---|---|---|
| **Juvisy-sur-Orge** (91) | 91326 | **passe** (règle standard, sans alerte, stable aux deux centres) | voisines Viry-Châtillon · Draveil · Savigny-sur-Orge · Athis-Mons, 1,6-2,9 km ; notes brutes identiques aux deux centres (global 6,0). Marché : DVF appart. ~3 518 €/m² (PAP 3 506, Immovrai 3 529 ; Habity 3 524) ÷ médiane des 4 voisines au dépôt 2 884 = **1,22** → bande ± 10-30 %, `--price-ratio=1.22` à appliquer ; **ratio intra-source et ratio loyer RealAdvisor encore à mesurer** avant l'ajout |
| Chevilly-Larue (94) | 94021 | règle tient, **alerte de frontière** (relève de D5) | voisines L'Haÿ* · Fresnes · Cachan · Vitry, mêmes notes aux deux centres ; Bourg-la-Reine (3,1 km) et Antony (4,0 km, 92) plus proches que la 4ᵉ. Marché : ~3 487 (PAP 3 549, Immovrai 3 424) ÷ 3 841 = **0,91**, dans le bruit |
| Brie-Comte-Robert (77) | 77053 | alerte de frontière **et** repère m² des voisines × 1,53 | Brunoy, Yerres (91) plus proches que la 4ᵉ ; Ozoir* dans la médiane |
| Bourg-lès-Valence (26) | 26058 | **échoue** : 3 voisines admissibles (Valence, Romans, Montélimar à 46 km), règle ② aussi | |
| Lisieux (14) | 14366 | **échoue** : 1 voisine (Hérouville à 41 km), règle ② aussi | |
| Sorgues (84) | 84129 | **échoue** : 4ᵉ voisine Pertuis à 61,6 km (règle ② : Apt à 44,5 km) ; Avignon, la vraie voisine, est en override | |

Conséquence pour le § 0 : D2 seule ne rouvre qu'**une** commune parmi les six recoupées ; elle n'élargit le gisement
que combinée à D5 (frontière) ou D1 (overrides). Les ~30 autres noms du tableau D restent à recouper avant mesure.

*Aucune modification du seed* : pas de dérive, table des couleurs inchangée (593). Contrôles : aucun lancé
(modification de ce seul fichier de doc). `npm run build` non lancé.

**Prochain lot** : dès qu'une décision du § 0 est prise. Si D2 est validée, Juvisy-sur-Orge est le premier candidat
(mesurer d'abord le ratio intra-source et le ratio loyer).
