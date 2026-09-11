# Intégrité des données — run du 2026-09-11

Agent « intégrité des données », run autonome. Objet : qu'aucun chiffre publié ne se contredise
lui-même — direction du score conforme au nom de la métrique, jumelles hreflang d'accord sur le
même nombre, légende et couleur qui disent la même chose que le chiffre.

**Résultat : 2 défauts réels trouvés et corrigés — ① huit descriptions de classement annonçaient
« Sources : DREES / Michelin / FUB / ATMO / DVF / SHOM… » pour des palmarès triés uniquement sur
nos axes éditoriaux, dont deux se contredisaient dans leur propre méthodologie ; ② cinq communes
publiaient « Ouverture de la saison balnéaire » à 150-416 km de la mer, dont une à cause du « mer »
de « Guyne·mer ». Un troisième défaut latent corrigé (un champ de provenance figé à la v1 depuis
deux relances de version). 1 garde permanente ajoutée, 2 blocs `**Convention**` ajoutés, 3 pièges
documentés dans le code. 0 divergence FR/EN sur les valeurs (32 400 contrôlées). Le profil livré ce
matin et les trois pipelines sont propres ; le collecteur BODACC, muet depuis le 27/08, a repris.**

---

## Méthode

Même harnais que les runs du 07/08, 14/08, 28/08 et 04/09 : `lib/` et `data/` compilés en commonjs
par un `tsc -p` de scratch, chargés par un hook `Module._resolveFilename` qui résout `@/`, puis on
appelle les **vraies fonctions** et on rejoue les expressions d'affichage de chaque page FR et de sa
jumelle EN. Aucun chiffre n'est lu à l'œil ni dérivé d'un `grep` du seed — contrôle refait ce run
sur Rennes, dont le seed porte `safety: 7.8` et dont le module rend **5,9**.

Rappel reconfirmé : le conteneur démarre **sans `node_modules`**, `npm install` d'abord.

Échantillon de villes inchangé depuis le 28/08 pour permettre la comparaison directe (métropole,
ville moyenne, préfecture rurale, montagne, littoral, banlieue, île, deux DROM) : Paris, Marseille,
Angers, Mende, La Rochelle, Briançon, Roubaix, Ajaccio, Cayenne, Saint-Denis de La Réunion. Les
balayages numériques portent sur les 540.

L'effort neuf porte sur trois angles qu'aucun run précédent n'avait ouverts :

1. la **prose qui vit dans `lib/`** — les tables éditoriales rendues sur des pages mais invisibles
   au garde `moteurs`, qui ne parcourt que `app/**` et `components/*.tsx`. C'est là que CLAUDE.md
   laissait explicitement du travail, et c'est le défaut ① ;
2. les **prédicats de caractère** (`isCoastal`, `isMountain`, `isWineCountry`), jamais confrontés
   aux mesures que le dépôt possède par ailleurs. C'est le défaut ② ;
3. les **surfaces apparues depuis le 04/09** : le 36ᵉ profil `famille-a-l-etranger` et son axe
   `airportAccess` livrés ce matin, le correctif biodiversité du 10/09, et l'état réel des trois
   pipelines après la panne de `git push` du 27/08.

---

## Règle 2 — les jumelles hreflang affichent le même nombre

**32 400 valeurs de moteur contrôlées sur les 540 villes × 12 moteurs, 0 divergence réelle.**

Le contrôle compare les **deux formes d'écriture** employées par les deux locales : côté FR
`(10 - x).toFixed(1)`, côté EN `Math.round((10 - x) * 10) / 10` puis `.toFixed(1)`. Elles divergent
sur une frontière `.x5`. Résultat, conforme au 04/09 à la dérive de données près :

- **`lib/commerce.ts` reste le seul moteur du site à produire des valeurs `.x5`** — 54 cas
  (41 `coverage.score`, 9 `centreVille.score`, 3 composite, 1 `proximity.score`) ; **aucun** des
  11 autres moteurs n'en produit un seul ;
- or `/villes/[slug]/commerces` et `/cities/[slug]/retail` écrivent toutes deux `.toFixed(1)`,
  revérifié ligne à ligne ce run (8 sites d'affichage chacune, **zéro `Math.round` des deux
  côtés**). **Aucune de ces valeurs n'est rendue différemment d'une locale à l'autre.** Le risque
  reste théorique et nommé : si une page EN de commerce passait à la forme `Math.round`, 54 valeurs
  divergeraient le jour même.

Les asymétries de comptage entre pages FR et EN sont les mêmes artefacts de style qu'au 04/09,
revérifiés : les pages EN à direction sensible calculent l'inverse **une fois** dans une variable
puis la réutilisent, là où la page FR répète l'expression ; les `10 - s` des pages EN `noise`,
`water` et `natural-risks` sont leur `hazardColor`, exactement ce que la règle 3 prescrit.

Tableau de contrôle sur l'échantillon (colonne unique = FR et EN d'accord) — **identique au 04/09,
ligne pour ligne** :

| Ville | Env.santé | Sécurité | Santé | Emploi | Serv.pub | Démogr. | Commerces | Vélo | Air | Bruit | Eau | Risques |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Paris | 6,0 | 3,2 | 7,9 | 7,2 | 7,9 | 6,3 | 8,8 | 6,3 | 5,1 | 5,8 | 2,5 | 2,3 |
| Marseille | 2,7 | 3,6 | 7,9 | 5,8 | 7,7 | 6,3 | 7,9 | 6,0 | 2,7 | 6,8 | 8,3 | 6,6 |
| Angers | 6,0 | 5,5 | 7,9 | 6,0 | 8,4 | 7,5 | 7,5 | 8,0 | 5,6 | 4,2 | 4,5 | 2,3 |
| Mende | 6,2 | 8,7 | 3,0 | 5,2 | 5,4 | 4,9 | 4,9 | 4,3 | 6,7 | 1,7 | 7,3 | 2,9 |
| La Rochelle | 5,2 | 6,1 | 5,7 | 4,6 | 7,4 | 6,0 | 7,1 | 7,8 | 5,7 | 3,4 | 6,3 | 5,4 |
| Briançon | 6,2 | 7,1 | 3,5 | 5,1 | 5,9 | 3,4 | 5,2 | 4,1 | 6,2 | 1,7 | 6,1 | 3,8 |
| Roubaix | 6,9 | 3,6 | 5,7 | 4,1 | 8,0 | 7,5 | 6,2 | 6,5 | 6,0 | 4,0 | 2,5 | 1,5 |
| Ajaccio | 4,5 | 5,0 | 5,7 | 4,6 | 7,4 | 6,9 | 6,4 | 5,2 | 4,2 | 3,4 | 8,4 | 4,3 |
| Cayenne | 6,5 | 3,7 | 7,1 | 3,0 | 5,5 | 8,4 | 6,3 | 6,4 | 5,6 | 3,4 | 3,7 | 2,2 |
| Saint-Denis (974) | 6,5 | 4,3 | 7,1 | 3,0 | 7,7 | 8,1 | 7,1 | 6,1 | 5,6 | 3,4 | 3,3 | 2,6 |

« Bruit / Eau / Risques » nomment une **nuisance**, donc `10 = pire`, sans inversion. « Air » nomme
une **qualité** et est inversée à l'affichage, comme les cinq premières. « Env. santé » lit
`healthScore`, déjà orienté `10 = sain`.

---

## Corrigé ① — huit classements citaient des organismes qui ne leur ont rien fourni

C'est le défaut principal du run, et CLAUDE.md le désignait nommément comme restant à traiter après
les deux passes du 09/09 (quartet environnement, 20 surfaces) et du 10/09 (six moteurs
propriétaires, 52 surfaces) : *« Le garde ne scanne que `app/**` et `components/*.tsx` :
`lib/rankings-meta.ts` porte le même défaut sur les 19 descriptions de `RANKING_META` […] et reste
à traiter. »*

**Ce que fait réellement le moteur.** `getRankedCities` (`lib/rankings.ts`) trie les 540 villes sur
les **huit axes éditoriaux du seed**, avec deux exceptions : `logement` lit en plus `data/housing.ts`,
`bord-de-mer` lit les `characterTags` et `sunshinedays`. Rien d'autre n'est ingéré.

**Ce que les pages annonçaient.** Sept descriptions FR et une EN portaient une ligne
« Sources : … ». Elles sont rendues **trois fois** chacune : texte de la page
(`app/classements/[slug]/page.tsx` l. 194), meta description via `clampMeta`, et JSON-LD.

| Classement | Annonçait | Trie en réalité sur |
|---|---|---|
| `sante` | DREES, Assurance Maladie, ATMO France, Insee | life, safety, nature, transport, cost — **aucun axe santé n'existe au seed** |
| `logement` (FR+EN) | DVF data.gouv.fr, OLL, Insee | `data/housing.ts`, repère éditorial tous biens confondus |
| `jeunes-actifs` | Insee, Dares, Arcep, OLL | culture, transport, remoteWork, life, cost |
| `gastronomie` | Guide Michelin 2025, Gault & Millau, Insee, INAO | culture, life, nature, cost, safety |
| `ecologie` | ATMO France, Ademe, Cerema, Ministère | nature, transport, life, cost |
| `cyclistes` | FUB, Plan Vélo, Géovélo, Cerema | transport, nature, safety, life |
| `bord-de-mer` | SHOM, Météo-France, Insee RP 2022, SSMSI, OLL | tags de caractère, `sunshinedays`, axes du seed |

Deux d'entre elles **se contredisaient dans leur propre méthodologie**, affichée sur la même page :
la description de `gastronomie` citait « Sources : Guide Michelin 2025 » quand sa méthodologie disait
« le nombre d'étoilés Michelin par ville n'est pas injecté en dur » ; `cyclistes` citait le Baromètre
FUB quand sa méthodologie disait « la note FUB n'est pas injectée individuellement ». Trois
méthodologies affirmaient en outre un calcul que le code ne fait pas — « La densité médicale et la
qualité de l'air (PM2.5) pèsent fortement » (`sante`), « L'indice qualité de l'air ATMO et la
densité d'espaces verts (Cerema) pèsent prioritairement » (`ecologie`), « Données issues de la DVF »
(`logement`).

**C'est aussi une asymétrie hreflang** : côté EN, une seule des 19 descriptions portait une telle
ligne. Six pages FR affirmaient donc une provenance que leur jumelle passait sous silence — même
forme que le défaut du 04/09 (les pages département FR déclaraient un `AggregateRating` que l'EN n'a
jamais déclaré), et même remède : aligner sur le silence, qui est vrai.

**Deux affirmations vérifiées et gardées telles quelles**, parce qu'elles sont exactes : les
médianes citées par `logement` (T2 à **700 €/mois**, achat à **2 500 €/m²**) sont au centime la
médiane réelle de `data/housing.ts` sur les 540 villes. Seule leur provenance était fausse — elles
viennent de nos repères, pas de DVF. Les vraies médianes DVF existent (`lib/property-prices.ts`,
499 villes appartement / 507 maison) et sont publiées séparément sur `/villes/[slug]/logement` ; la
nouvelle rédaction y renvoie plutôt que de les confondre, comme CLAUDE.md l'exige (« les deux
nombres coexistent volontairement — ne pas "aligner" l'un sur l'autre »).

**Deux mesures de plus sur `bord-de-mer`**, dont la méthodologie décrivait deux règles inexistantes :

- elle annonçait « seules les villes **sur ou à 5 km** du littoral sont notées », alors que le filtre
  est une appartenance à un ensemble de tags. Mesuré contre `coastDistanceKm` : **9 des 55 villes
  classées sont à plus de 5 km** de la mer ouverte — Caen **15,0 km**, Challans 14,4, Quimper 13,6,
  Rochefort 9,3, Morlaix 9,2, Lannion 8,6, Biscarrosse 7,2, Bayonne 5,5, Saint-Brieuc 5,1 ;
- elle annonçait un bonus « **+0,4 si > 250 j soleil/an** », quand le code teste
  `sunshinedays > 2400`. Le champ, malgré son nom, porte des **heures** (corpus : 1 480 à 3 100,
  médiane 1 870) : lu en jours, le seuil serait franchi par les 540 villes. Il l'est en réalité par
  **79**.

**Corrigé** : les huit lignes « Sources : » sont réécrites. Les organismes restent **nommés**, en
« cadres de référence », vocabulaire déjà posé par les deux passes précédentes (« calé sur les
cadres de référence publics […] sans reprendre leurs relevés ») ; chaque méthodologie dit désormais
ce que le score **n'est pas**. La méthodologie `bord-de-mer` dit que le filtre est un caractère
éditorial et non une distance mesurée, nomme les trois villes les plus intérieures, et renvoie à la
distance réelle publiée sur la fiche ville ; le seuil de soleil est écrit en heures.

**Aucun classement n'est retrié, aucune ville ne change de rang, aucun nombre publié ne bouge** — ce
sont des légendes, pas des scores.

**Garde ajoutée** (`scripts/check-integrity.mjs`) : `classements` refuse toute ligne « Sources : »
dans `lib/rankings-meta.ts` et `lib/rankings-en.ts`. C'est la pièce durable du correctif, parce que
ce défaut s'est déjà perdu deux fois en ne traitant qu'une partie des surfaces. Garde vérifiée
**en échec** avant d'être déclarée verte : une ligne réintroduite la fait sortir en `ÉCHEC` avec le
fichier et le numéro de ligne.

## Corrigé ② — cinq communes ouvraient leur saison balnéaire à 150-416 km de la mer

`lib/city-agenda.ts` construit l'agenda annuel des 540 fiches ville (`/villes/[slug]/agenda` et
`/cities/[slug]/calendar`). Son prédicat `isCoastal()` était une **recherche de sous-chaîne** sur
les tags de caractère — exactement le piège que CLAUDE.md documente pour City Match (« `sport`
contient `port` »), ici sur `côte` et sur `mer` :

| Commune | Distance mesurée à la mer ouverte | Tag déclencheur |
|---|---|---|
| Chenôve | **416 km** | « vignoble **Côte** de Nuits » |
| Semur-en-Auxois | **369 km** | « **Côte**-d'Or » |
| Montbard | **360 km** | « **Côte**-d'Or » |
| Rosny-sous-Bois | **157 km** | « Rosny 2 (centre com·**mer**·cial) » |
| Saint-Quentin | **150 km** | « Guyne·**mer** » |

Les dix pages concernées (cinq FR, cinq EN) publiaient l'entrée « **Ouverture de la saison
balnéaire** — Juin = compromis idéal : eau réchauffée, foule encore raisonnable ». C'est un énoncé
sans ambiguïté et faux, et il était invisible à tout contrôle : le fichier est bien typé, l'entrée
est bien formée, seul son contenu ment.

**Corrigé** : la distance **mesurée** à la mer ouverte (`lib/city-coast.ts`, Natural Earth, 10 Ko —
son propre docstring documente cette histoire : « les trois étaient "bord de mer" du temps où le
test lisait les tags de caractère ») a désormais le dernier mot. Le seuil est posé à **30 km** parce
que le corpus laisse un trou franc : les **77 villes légitimes sont toutes à 29 km ou moins**, les
**5 fausses à 150 km ou plus**. Tout seuil de 30 à 149 retire exactement les cinq et ne touche à rien
d'autre — vérifié après correction : 82 → **77** villes, et La Rochelle, Biarritz, Caen, Quimper,
La Roche-sur-Yon, Saint-Lô et Guingamp gardent toutes leur entrée.

**Les deux prédicats voisins ont été passés au même contrôle et sont sains**, ce qui borne le
défaut : `isMountain()` (gaté sur Auvergne-Rhône-Alpes) rend 16 villes, dont les 6 sous 300 m sont
des fonds de vallée réellement alpins (Grenoble 214 m, Chambéry 270 m, Voiron, Fontaine) et portent
un tag explicite ; `isWineCountry()` rend 27 villes, dont le seul cas à vérifier — Sélestat, pris par
`alsace.*vin` — est bien sur la route des vins.

## Corrigé ③ — un champ de provenance figé à la v1 depuis deux relances de version

`data/city-news.json` annonçait `meta.queryVersion: 1` alors que ses **540 lignes sont en
`queryVersion` 3**, deux relances après (le correctif d'ingest CatNat du 08/09 a porté la version à
3). La cause est un ordre de spread dans `scripts/city-news.mjs` : `{ ...EMPTY_FILE.meta,
...(j.meta ?? {}) }` laisse la valeur écrite au **premier** run écraser la constante courante, pour
toujours.

**Portée : nulle côté lecteur**, et c'est vérifié plutôt que supposé — `pickBatch` et toutes les
surfaces lisent la version **de la ligne**, qui est juste ; un `grep` sur `.ts`, `.tsx` et `.mjs`
hors collecteurs ne trouve **aucun lecteur** de `meta.queryVersion`. Corrigé quand même : un champ
de provenance qui ment est ce qu'on finit par croire, et c'est le troisième de ce run. Les trois
champs qui décrivent le **code** (`queryVersion`, `windowMonths`, `maxEntriesPerCity`) sont
réappliqués après le spread ; `refreshedAt`, qui décrit la **collecte**, continue de venir du
fichier. `npm run news:selftest` : **73 contrôles, tous verts**.

---

## Le 36ᵉ profil, livré ce matin : toutes ses figures exactes

`famille-a-l-etranger` et son axe `airportAccess` (51 plateformes) sont arrivés quelques heures
avant ce run et n'avaient jamais été contrôlés. **Chaque figure publiée a été recalculée depuis le
moteur, et toutes tombent juste** :

- médiane du corpus sur l'axe **5,3** ✔, **60** villes sous 3,0 ✔ ;
- « avoir un aéroport n'est pas avoir un accès » : Rennes, Limoges et Clermont-Ferrand **4,0** avec
  une piste à 8-9 km ✔, Lille et Montpellier **5,5** ✔, Mulhouse **6,8** via l'EuroAirport à 27 km ✔,
  Annemasse **8,5** via Genève à 14 km ✔ ;
- les deux extrêmes suisses : Gex **8,5** à 14 km de Genève ✔, Saint-Claude **8,0** à 31 km ✔ ;
- les plus enclavées : Bourges **1,3** (Tours à 165 km) ✔, Nevers **1,2** (Clermont à 167 km) ✔,
  Bar-sur-Aube **1,1** ✔, Saint-Laurent-du-Maroni **0,0** à 249 km de Cayenne ✔ ;
- l'outre-mer : Fort-de-France et Pointe-à-Pitre **6,0** ✔, Saint-Denis de La Réunion **6,0** ✔,
  Cayenne et Mamoudzou **5,0** ✔ ;
- le top 20 sort **dans l'ordre exact** que l'intro énumère, de Senlis (8,1) à Montmorency ✔ ;
- le palier annoncé est exact : **7 villes à 6,9 pour les rangs 15 à 21**, donc Domont 21ᵉ a bien la
  même note que Cergy 15ᵉ ✔ ;
- recouvrement maximal avec les 35 autres profils : **3/20** ✔ (`familles-monoparentales`) ;
- l'avertissement sur le bruit tient : Tremblay-en-France, Goussainville, Gonesse et Villiers-le-Bel
  sont bien au niveau le plus fort de l'échelle aérienne (8,5), **aucune des quatre n'est dans le
  top 20** ✔, et **Ivry-sur-Seine est la seule ville du classement au-dessus de la moyenne** ✔ ;
- la médiane d'ex æquo au rang 20 annoncée pour le fichier est confirmée : **7**, et **34/36**
  profils coupent un palier (33/35 avant ce profil, qui en coupe un aussi) ✔.

**Une nuance de lecture, pas un défaut.** L'intro écrit « **dix-huit** villes y parviennent, toutes à
moins de vingt kilomètres ». C'est exact du **plafond exact** : 18 villes valent `airportAccess === 10`
et sont à 6-20 km. Mais **21 villes affichent `10,0` à une décimale** : Saint-Denis, Pantin et Domont
sortent à 9,9500, à 21 km. L'écart ne se voit nulle part, parce que `/pour-qui/[profil]` publie le
score du profil et le `reasonHint` (« Paris-Charles-de-Gaulle à 21 km »), **jamais l'axe arrondi**.
Rien à corriger donc, mais c'est le même schéma dormant que `commerce` ci-dessus : la phrase
deviendrait fausse le jour où une surface publierait cet axe au dixième.

---

## Contrôles passés sans rien à signaler

- **Le correctif biodiversité du 10/09 tient sur les données fraîches.** Sur les 540 lignes :
  **0 code de baguage** atteint une ligne rendue (`speciesDisplay` / `isVernacularCode`), et le
  casier `Animalia spec` de Saint-Laurent-du-Maroni (**1 058 observations** contre **58** à la
  première espèce réelle, *Pitangus sulphuratus*) est bien retiré de la liste par
  `displayTopSpecies()`. Mieux que ce que le ROADMAP prévoyait : les 1 281 codes **ont aussi quitté
  le JSON** (le rattrapage `biodiversity:vernacular` est passé), il n'en reste **0**.
- **Les trois pipelines sont vivants, et c'est le premier run à pouvoir l'écrire depuis le 27/08.**
  Contrôle fait sur la **date des lignes**, jamais sur leur nombre, comme CLAUDE.md l'impose :
  `city-news` porte **540 lignes datées des 09 et 10/09** (la plus ancienne a **2 jours**), toutes en
  `queryVersion` 3 — donc le correctif CatNat du 08/09 a entièrement propagé, et **0 ligne n'est
  marquée `truncated`** : les 506 communes qui ne listent aucun arrêté publient désormais une lecture
  complète, non un plafond de pagination. `city-biodiversity` est à **360/540 lignes rejouées en v3**
  (120/jour les 09, 10 et 11/09) ; les 180 restantes datent du 06-08/08 et n'ont pas de compte de
  reptiles, ce que `groupSpecies()` rend en `null` et non en zéro. `city-protected-areas` : 540/540.
- **Selftests hors ligne** : `news:selftest` **73/73**, `biodiversity:selftest`, 
  `protected-areas:selftest` (540/540 villes placées) — tous verts.
- **Gardes de données** : `npm run integrity` vert — 540 villes, **1 112 guides FR**, **901 guides
  EN**, 0 score brut recopié des deux côtés, 4 292 signaux, 169 termes de glossaire, 386 `page.tsx`
  sans `openGraph` orphelin, 20 surfaces du quartet environnement et 52 surfaces de moteurs
  propriétaires qui disent ce que leur score est. `assertUniqueSlugs` charge sans lever des deux côtés.
- **`npm run sitemap:check`** : FR **29 212 URL** / 18 chunks / 134 routes statiques / 86 familles ;
  EN **28 793 URL** / 21 chunks / 78 routes / 88 familles. Chaque URL déclarée a une page, chaque
  page indexable a une URL.
- **`npm run parity`** : FR 220 routes / EN 166, **0 route FR sans jumelle EN**.
- **`npm run hreflang:check`** : 39 paires de sous-pages ville + 195 paires écrites à la main, chaque
  hreflang annoncé a une route en face dans le même état d'activation.
- **`npm run search-index:check`** : les deux projections sont à jour.
- **Couverture des paires** : `RANKING_META` 19 / `RANKING_EN` 19, **zéro clé orpheline de part et
  d'autre**, et les six champs (`label`, `tagline`, `headline`, `description`, `methodology`, `why`)
  présents et non vides sur les 19. Les quatre cartes de régions (`REGION_EN_DESCRIPTIONS`, les deux
  `REGION_EMOJIS`, `REGION_DESCRIPTIONS`) portent exactement les **18** régions du seed — zéro
  manquante, zéro orpheline. ⚠️ Note de méthode pour le prochain run : ces cartes ne sont **pas
  toutes clés de la même façon** — `REGION_EN_DESCRIPTIONS` et celle de `app/regions/[region]` sont
  clés par **slug**, celle de `app/regions/page.tsx` par **nom d'affichage**. Comparer les unes aux
  autres sans normaliser fabrique 18 faux orphelins dans chaque sens.
- **Les 38 thèmes Red Flag** : `severity` dans [1 ; 10] partout, tri décroissant sans exception.
- **Les 36 profils `/pour-qui`** : score dans [0 ; 10], tri décroissant partout, `scoreColor` nourri
  d'une valeur `10 = bon`.
- **Règle 3, direction et couleur** : inventaire refait des arguments passés à
  `scoreColor`/`scoreHex`/`scoreBg` sur `app/` et `components/` — **aucune nuisance brute**. Les
  pages EN à direction sensible inversent dans une variable **avant** de colorer, les pages FR
  passent par une palette par niveau, et les trois pages de nuisance utilisent `hazardColor` côté EN
  et leur palette de niveau côté FR.

## Blocs `**Convention**` ajoutés

Deux des trois libs qui en manquaient en ont reçu un. Ni l'une ni l'autre ne rend un score sur 10,
et c'est précisément ce qu'il fallait écrire :

- **`lib/cost-living.ts`** — rend des **euros**, « plus petit = moins cher », rien à inverser, et un
  montant ne doit jamais être passé à `scoreColor`. Le bloc note aussi ce qui la distingue des six
  moteurs propriétaires : ses barèmes sont de **vraies tables de référence** lues au département
  (zones thermiques de l'arrêté du 28/12/2012, médianes TEOM, primes régionales), donc des médianes
  territoriales réelles — mais jamais une facture communale, ce que dit le « Indicatif » que les deux
  calculateurs affichent (vérifié présent dans `HiddenCostsCalculator.tsx` et sa jumelle EN).
- **`lib/distances.ts`** — rend des **kilomètres**, même règle. Le bloc consigne le piège que
  CLAUDE.md signale : sa liste `AIRPORTS` (10 plateformes métropolitaines) et les `AIR_HUBS`
  (51 plateformes) du nouveau profil **divergent volontairement**, et les aligner déplacerait la
  ligne « aéroport le plus proche » des 540 fiches ville.

**`lib/user-badges.ts` n'en a pas reçu, volontairement** : il rend des badges et une progression
0-1, pas un score directionnel. Un bloc y serait du bruit.

---

## Signalé, non corrigé ① — `environment-index` arrondit toujours deux fois

**Cinquième run consécutif, inchangé** (07/08, 14/08, 28/08, 04/09, 11/09) : **exactement 22 villes
sur 540** publient sur `/environnement` et `/environment` un `healthScore` et un `stressComposite`
dont la somme fait **10,1 au lieu de 10,0**, les deux nombres étant rendus sur la même page avec
leurs deux légendes opposées. **Liste identique aux quatre runs précédents**, Briançon (6,2 + 3,9)
étant dans l'échantillon de contrôle :

```
poitiers 6,0+4,1   le-havre 5,9+4,2   colmar 6,7+3,4   ajaccio 4,5+5,6   bayeux 7,1+3,0
villeurbanne 5,9+4,2   briancon 6,2+3,9   sarlat-la-caneda 6,1+4,0   longwy 7,3+2,8
embrun 6,3+3,8   pierrefitte-sur-seine 7,0+3,1   stains 7,0+3,1   clichy 6,7+3,4
cugnaux 6,6+3,5   vandoeuvre-les-nancy 7,5+2,6   laxou 7,5+2,6   tremblay-en-france 6,8+3,3
forbach 7,5+2,6   sarreguemines 7,5+2,6   saint-avold 7,5+2,6   berck 7,0+3,1   hayange 7,5+2,6
```

Correction proposée, inchangée — une ligne dans `lib/environment-index.ts`, dériver la santé du
stress **déjà arrondi** :

```ts
const stressR = Math.round(stress * 10) / 10;
const health  = Math.round((10 - stressR) * 10) / 10;   // au lieu de (10 - stress)
```

Écart : 22 villes bougent de **0,1 point au maximum**, top 5 de `/environnement` inchangé. Non
appliqué parce que ça déplace un score publié. C'est le plus petit des arbitrages en attente, et le
seul dont l'effet est intégralement chiffré ici.

## Signalé, non corrigé ② — les rangs publiés là où le score ne départage pas

Re-mesuré, quasi inchangé.

**Les 36 pages `/pour-qui`** (35 au run précédent). `rankByProfile` **arrondit avant de trier** puis
coupe à 20, donc le palier est coupé en son milieu.

- **36 / 36** ont un ex æquo dans le top 10 ; **13** ont un #1 et un #2 à la même note ;
- **34 / 36 coupent un palier au rang 20** : cumulé, **143 villes portent exactement la note du 20ᵉ
  et ne sont pas listées** (142 au run précédent), pendant que d'autres à la même note le sont.

**Les 19 classements officiels**, inchangés : **19 / 19** ont un ex æquo dans leur top 10, **5** ont
un #1 et un #2 à la même note, et le plus gros palier du top 50 compte **21 villes** (`budget`).
`/classements/teletravail` publie toujours **Vendôme #1 et Rennes #2**, toutes deux à 7,8,
différence exactement nulle.

**Pourquoi je ne corrige pas seul.** Appliquer la convention du 19/08 ici ne déplace pas un chiffre :
elle **change la liste des villes affichées** et retire des numéros de rang que le lecteur voit.
C'est un acte éditorial et produit. Le gabarit existe et est éprouvé (`rankByOwnerScore` +
`ownerRankingHead`, portés par `components/OwnerRankingPage.tsx`), directement transposable.

## Signalé, non corrigé ③ — `/classements/bord-de-mer` classe 9 villes au-delà de son propre seuil

La méthodologie est corrigée (§ Corrigé ①) et dit désormais que le filtre est un caractère éditorial.
Reste l'arbitrage de fond : **faut-il basculer le filtre sur `coastDistanceKm` ?** Cela retirerait
**9 des 55 villes** du classement — Caen, Challans, Quimper, Rochefort, Morlaix, Lannion,
Biscarrosse, Bayonne, Saint-Brieuc.

Je ne le fais pas seul, et pas seulement par prudence : plusieurs de ces villes sont **défendables**
comme villes maritimes (Caen est reliée à la mer par son canal, Quimper par l'Odet, Morlaix et
Lannion sont des villes de fond de ria). Le choix entre « à moins de 5 km du rivage » et « ville de
culture maritime » est éditorial, pas technique. Ce qui n'était pas défendable, c'était d'annoncer le
premier en appliquant le second — et c'est réparé.

## Signalé, non corrigé ④ — 18 villes littorales n'ont pas d'entrée « saison balnéaire »

Symétrique du défaut ②, et **il ne faut pas le « corriger » par symétrie**. 18 communes sont à moins
de 5 km de la mer ouverte sans porter de tag maritime, dont **11 ultramarines** (Fort-de-France,
Pointe-à-Pitre, Cayenne, Saint-Denis de La Réunion, Les Abymes, Baie-Mahault, Le Lamentin…) et
7 métropolitaines (Vannes, Honfleur, Concarneau…).

Leur pousser l'entrée existante publierait une **saison fausse** : son corps est écrit pour la
métropole (« juin = eau réchauffée, foule raisonnable ; juillet-août = pic touristique »), ce qui ne
décrit ni les Antilles ni La Réunion, dont les saisons sont inversées ou continues. Élargir la
couverture demande d'**écrire ces saisons**, pas de relâcher un prédicat. Le garde-fou posé ce run
est volontairement asymétrique pour cette raison, et le commentaire du code le dit.

## Signalé, non corrigé ⑤ — deux thèmes Red Flag ne peuvent toujours rendre aucune ville

Re-mesuré, **inchangé depuis le 14/08** : sur les 38 thèmes, `villes-pollution-air-chronique` et
`villes-desert-services-publics` rendent **0 ligne**, structurellement. Portée : 4 pages publiées et
présentes au sitemap. La direction est bonne dans les deux cas, ce sont les bornes qui sont écrites
contre une échelle que le moteur ne produit pas. Seuils de rattrapage mesurés le 14/08 toujours
valables (air `<= 6,0` → 70 villes ; services publics `>= 4,5`, pop ≥ 10 000 → 14 villes). Déplacer
ces seuils **publie une liste de villes réelles nommément désignées**, ce qui relève de la relecture
éditoriale.

Cinq autres thèmes rendent moins des 12 villes attendues — `villes-nuit-tendue` (4),
`villes-desert-culturel` (5), `villes-parking-cauchemar` (5), `villes-mono-touristiques` (9),
`villes-internet-precaire` (10). Rien n'y est faux ; à surveiller si l'un descend vers zéro.

## Signalé, non corrigé ⑥ — sept paires de sous-pages n'émettent pas les mêmes types JSON-LD

Inchangé depuis le 04/09, laissé tel quel parce qu'aucun **nombre** n'y est en cause : c'est une
différence de richesse sémantique, pas une affirmation fausse. `biodiversite`, `climat`, `ecoles`,
`transports` portent un `Article` côté FR seulement ; `fiscalite` un `Article` FR et un
`BreadcrumbList` EN ; `climat-2040` et `logement` un `BreadcrumbList` EN seulement. À traiter comme
une tâche SEO d'harmonisation.

---

## Vérification

`npx tsc --noEmit` : **clean**. `npm run integrity` : **vert**, garde `classements` comprise, et
vérifiée en échec avant d'être déclarée verte. `npm run news:selftest` : 73/73.
`npm run sitemap:check`, `npm run parity`, `npm run hreflang:check`, `npm run search-index:check` :
tous verts, aucune route ajoutée ou supprimée.

Une seule valeur publiée change dans tout ce run, et c'est le défaut ② : cinq fiches ville perdent
une entrée d'agenda qui était fausse. Aucun score, aucun rang, aucun classement n'est déplacé.

`npm run build` **non lancé**, conformément à CLAUDE.md : en session cloud il tourne plus de 4 h 30
et meurt en ENOSPC sans jamais afficher d'erreur. Les fichiers touchés sont couverts par `tsc` et
n'ajoutent aucune dépendance de données — sauf `lib/city-agenda.ts`, qui importe désormais
`lib/city-coast.ts` (10 Ko, explicitement documenté comme sûr en bundle, et consommé par deux pages
serveur uniquement).

Aucun déploiement (manuel, hors périmètre de l'agent).
