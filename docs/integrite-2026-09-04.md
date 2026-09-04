# Intégrité des données — run du 2026-09-04

Agent « intégrité des données », run autonome. Objet : qu'aucun chiffre publié ne se contredise
lui-même — direction du score conforme au nom de la métrique, jumelles hreflang d'accord sur le
même nombre, légende et couleur qui disent la même chose que le chiffre.

**Résultat : 1 défaut réel trouvé et corrigé (102 pages FR publiaient une note d'avis fabriquée
en données structurées, que leur jumelle EN ne publie pas), sa version dormante documentée,
6 blocs `**Convention**` ajoutés ou harmonisés, 2 commentaires de code qui décrivaient d'autres
pondérations que les leurs corrigés. 1 défaut neuf signalé sans correction (le collecteur BODACC
n'a pas tourné depuis le 27/08 et une ville publie toujours zéro entrée). 3 défauts hérités
re-mesurés, tous inchangés. 0 divergence FR/EN sur les valeurs (34 560 contrôlées).**

---

## Méthode

Même harnais que les runs du 07/08, 14/08 et 28/08, avec une variante : `npx tsx` n'étant pas
installé, `lib/` et `data/` sont compilés en commonjs par un `tsc -p` de scratch, puis chargés
par un hook `Module._resolveFilename` qui résout `@/` et retombe sur le `node_modules` du dépôt.
On appelle ensuite les **vraies fonctions** et on rejoue à l'identique les expressions
d'affichage de chaque page FR et de sa jumelle EN. Aucun chiffre n'est lu à l'œil ni dérivé d'un
`grep` du seed.

Rappel confirmé une fois de plus : le conteneur démarre **sans `node_modules`**, `npm install`
d'abord, sinon `tsc` sort des dizaines de milliers de fausses erreurs.

Le run du 28/08 avait couvert les 38 paires de sous-pages ville, les 36 thèmes Red Flag et les
sites d'inversion des 28 paires de hubs. Ce balayage est rejoué ici en régression (il repasse à
l'identique) et l'effort neuf porte sur quatre angles qu'aucun run précédent n'avait ouverts :

1. les **données structurées numériques**, au-delà du seul `itemListOrder` corrigé le 28/08 —
   c'est là qu'est le défaut du run, et il ne se voyait pas à l'écran ;
2. les **surfaces apparues depuis le 28/08** : le 38ᵉ thème Red Flag (`villes-prix-au-m2-trompeur`,
   livré ce matin), le profil `travailleurs-frontaliers` (31/08), l'édition de novembre du
   palmarès (02/09), et les cartes de renvoi ajoutées sur `/classements/[slug]` et
   `/pour-qui/[profil]` ;
3. les **moteurs sans bloc `**Convention**`**, c'est-à-dire ceux dont la direction n'est écrite
   nulle part, en reprenant le tri par nombre de consommateurs ;
4. la **fraîcheur des données mouvantes** (BODACC), que le rapport du 01/09 laissait explicitement
   à vérifier ce run.

Échantillon de villes du tableau de contrôle, inchangé pour permettre la comparaison directe avec
le 28/08 (métropole, ville moyenne, préfecture rurale, montagne, littoral, banlieue, île, deux
DROM) : Paris, Marseille, Angers, Mende, La Rochelle, Briançon, Roubaix, Ajaccio, Cayenne,
Saint-Denis de La Réunion — le balayage numérique, lui, porte sur les 540.

---

## Règle 2 — les jumelles hreflang affichent le même nombre

**34 560 valeurs de moteur contrôlées sur les 540 villes × 14 moteurs, 0 divergence réelle.**

Le contrôle compare les **deux formes d'écriture** que les deux locales emploient : côté FR
`(10 - x).toFixed(1)`, côté EN `Math.round((10 - x) * 10) / 10` puis `.toFixed(1)`. Ces deux
formes divergent sur une frontière `.x5` (`7,55` sort à `7,5` par `toFixed` et à `7,6` par
`Math.round`). Résultat, identique au 28/08 à la dérive de données près :

- **les seules valeurs du site qui tombent sur une frontière `.x5` restent celles de
  `lib/commerce.ts`** — 159 cas (111 sur `coverage.score`, 35 sur `proximity.score`, 9 sur
  `centreVille.score`, 4 sur le composite) ; **aucun** des 13 autres moteurs n'en produit un seul ;
- or `/villes/[slug]/commerces` et `/cities/[slug]/retail` écrivent toutes deux `.toFixed(1)`,
  revérifié ligne à ligne ce run (métadonnée, dimension, FAQ, composite : quatre sites chacune,
  même forme des deux côtés). **Aucune de ces valeurs n'est donc rendue différemment d'une locale
  à l'autre.** Le risque reste théorique et nommé : si une page EN de commerce passait à la forme
  `Math.round`, 159 valeurs divergeraient le jour même.

Comparaison des **sites d'inversion** sur les 39 paires de sous-pages ville : les 10 asymétries de
comptage relevées sont toutes des artefacts de style, vérifiées une à une et sans effet —
① les six pages EN à direction sensible (`air-quality`, `demographics`, `employment`, `healthcare`,
`safety`, `public-services`) calculent l'inverse **une fois** dans une variable
(`cleanScore`, `jobScore`, `safetyScore`…) puis la réutilisent, là où la page FR répète
l'expression à chaque site ; ② les trois pages EN de nuisance (`noise`, `water`, `natural-risks`)
portent un unique `10 - s`, qui est leur `hazardColor` — exactement ce que la règle 3 prescrit,
pas une inversion de valeur ; ③ `a-faire` / `things-to-do` remonte sur la chaîne
`10-choses-a-faire`, faux positif du motif de recherche.

Tableau de contrôle sur l'échantillon (colonne unique = FR et EN d'accord) — **identique au
28/08, ligne pour ligne** :

| Ville | Sécurité | Santé | Emploi | Serv. pub. | Démogr. | Commerces | Vélo | Env. santé | Air | Bruit | Eau | Risques |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Paris | 3,2 | 7,9 | 7,2 | 7,9 | 6,3 | 8,8 | 6,3 | 6,0 | 5,1 | 5,8 | 2,5 | 2,3 |
| Marseille | 3,6 | 7,9 | 5,8 | 7,7 | 6,3 | 7,9 | 6,0 | 2,7 | 2,7 | 6,8 | 8,3 | 6,6 |
| Angers | 5,5 | 7,9 | 6,0 | 8,4 | 7,5 | 7,5 | 8,0 | 6,0 | 5,6 | 4,2 | 4,5 | 2,3 |
| Mende | 8,7 | 3,0 | 5,2 | 5,4 | 4,9 | 4,9 | 4,3 | 6,2 | 6,7 | 1,7 | 7,3 | 2,9 |
| La Rochelle | 6,1 | 5,7 | 4,6 | 7,4 | 6,0 | 7,1 | 7,8 | 5,2 | 5,7 | 3,4 | 6,3 | 5,4 |
| Briançon | 7,1 | 3,5 | 5,1 | 5,9 | 3,4 | 5,2 | 4,1 | 6,2 | 6,2 | 1,7 | 6,1 | 3,8 |
| Roubaix | 3,6 | 5,7 | 4,1 | 8,0 | 7,5 | 6,2 | 6,5 | 6,9 | 6,0 | 4,0 | 2,5 | 1,5 |
| Ajaccio | 5,0 | 5,7 | 4,6 | 7,4 | 6,9 | 6,4 | 5,2 | 4,5 | 4,2 | 3,4 | 8,4 | 4,3 |
| Cayenne | 3,7 | 7,1 | 3,0 | 5,5 | 8,4 | 6,3 | 6,4 | 6,5 | 5,6 | 3,4 | 3,7 | 2,2 |
| Saint-Denis (974) | 4,3 | 7,1 | 3,0 | 7,7 | 8,1 | 7,1 | 6,1 | 6,5 | 5,6 | 3,4 | 3,3 | 2,6 |

Colonnes « Bruit / Eau / Risques » : elles nomment une **nuisance**, donc `10 = pire`, sans
inversion. « Air » nomme une **qualité** et est inversée à l'affichage, comme les cinq premières.
« Env. santé » lit `healthScore`, déjà orienté `10 = sain`.

---

## Corrigé ① — 102 pages FR annonçaient à Google une note d'avis que personne n'a laissée

C'est le vrai défaut du run, et comme celui du 28/08 il était dans le JSON-LD, donc invisible à
l'écran.

`app/departements/[dept]/page.tsx` émettait, sur son entité `AdministrativeArea`, un bloc
`AggregateRating`. Or `AggregateRating` a un sens précis : la moyenne des notes laissées par des
personnes. Ce qui était publié dessous n'en était pas une.

| Champ émis | Ce que la balise annonce | Ce que c'était réellement |
|---|---|---|
| `ratingValue` | la note moyenne donnée par les évaluateurs | la moyenne de **nos** scores éditoriaux, à **deux** décimales |
| `ratingCount` | le nombre d'évaluations | le **nombre de villes** du département |
| `worstRating: "1"` | le plancher de l'échelle | le seed est clampé à 2,8, la palette court sur 0-10 |

Le rendu est parlant sur les petits départements, et il y en a cinq à une ou deux villes :

```
/departements/paris    → « noté 5,10/10 sur la base de 1 avis »
/departements/rhone    → « noté 7,30/10 sur la base de 1 avis »
/departements/mayotte  → « noté 3,00/10 sur la base de 1 avis »
Territoire de Belfort  → « noté 5,05/10 sur la base de 2 avis »
Guyane                 → « noté 3,65/10 sur la base de 2 avis »
```

Trois raisons de retirer plutôt que de corriger les champs :

1. **Un décompte de villes n'est pas un décompte d'avis**, et aucune surface du site ne prétend le
   contraire à l'écran : la page affiche « N villes analysées · Score moyen X,X/10 », ce qui est
   juste. La balise disait autre chose que la page qu'elle décrit — et à une décimale près, en
   prime (`toFixed(2)` contre `toFixed(1)` visible).
2. **La jumelle EN `/departments/[dept]` n'a jamais rien déclaré de tel.** Deux pages en relation
   hreflang décrivaient donc la même donnée différemment, l'une par un silence, l'autre par une
   affirmation fausse — c'est exactement le défaut corrigé le 28/08 sur les 139 pages EN dont
   l'`itemListOrder` annonçait leur classement à l'envers, et le remède est le même : aligner sur
   le silence, qui est vrai.
3. Les **vrais** avis d'habitants existent, dans l'onglet discussion (D1), et leur compte n'est
   pas ce nombre-là. Publier notre propre note sous l'étiquette « avis des lecteurs » est le seul
   endroit du site où un chiffre se donnait pour ce qu'il n'est pas.

La moyenne reste affichée sur la page comme score éditorial, ce qu'elle est. Aucun chiffre ne
disparaît pour un lecteur ; c'est une affirmation destinée aux moteurs qui disparaît.

**Portée : 102 pages** (une par département, côté FR uniquement).

## Corrigé ② — la même balise, dormante et armée, dans `components/CityJsonLd.tsx`

Le composant des 540 pages ville porte la même construction : `aggregateRating` avec
`ratingValue: city.scores.global` et `ratingCount: city.reviewCount ?? 180`.

**Vérifié par exécution : elle ne tire pas.** Aucune des 540 villes du seed ne porte de champ
`reviewCount` (les clés de l'enregistrement sont `slug, name, region, department, inseeCode,
population, latitude, longitude, elevation, sunshinedays, avgTempJuly, avgTempJanuary,
characterTags, descriptionEn, seoTitleEn, seoDescriptionEn, scores`), et l'unique appelant
(`app/villes/[slug]/page.tsx:67`) passe l'enregistrement du seed tel quel. Le garde
`(city.reviewCount ?? 0) > 0` est donc toujours faux et **aucune page ville n'a jamais publié de
note agrégée**.

Non retiré — ce serait toucher un composant qui rend les 540 fiches pour supprimer du code mort —
mais **documenté sur place** : le piège est qu'un jour on branche le compte de commentaires D1 sur
`reviewCount` en croyant activer une vraie note, alors que `ratingValue` porterait toujours notre
score éditorial. On publierait alors notre propre note sous le décompte des avis des lecteurs,
c'est-à-dire précisément ce que les 102 pages département faisaient. Le commentaire dit qu'une
vraie note agrégée demande **les deux** nombres venus de D1, ou pas de balise.

Les `reviewCount: 180 + Math.floor(score * 30)` semés dans huit fichiers (et `150 + score * 25`
dans la page département) ne sont **pas** publiés : ils remplissent le champ obligatoire du type
`City` pour les composants de carte, qui ne l'affichent nulle part. Vérifié.

## Corrigé ③ — quatre moteurs ne disaient nulle part dans quel sens ils se lisent

Direction vérifiée **par exécution sur les 540 villes** avant rédaction, jamais supposée.

| Lib | Consommateurs | Convention constatée et écrite |
|---|---|---|
| `rankings` | les 19 classements officiels, FR **et** EN | `score` sur **0-10, `10 = bon`** sans exception, `rank` en sens inverse (**1 = meilleur**). Les 8 axes pondérés sont tous des axes de seed orientés 10 = bon, aucun poids négatif, et les trois barèmes qui court-circuitent les poids (`climat`, `logement`, `bord-de-mer`) rendent aussi 10 = bon. Bornes mesurées sur les 19 : **0,40 à 9,50**. Deux pièges nommés : `cost` est une **qualité** malgré son nom (10 = abordable), et `bord-de-mer` est le seul classement **filtré** — il rend **55** villes, pas 540. |
| `city-match` | `/city-match` FR + EN | Ne publie **pas** une note sur 10 mais un `percent` sur **0-100, 100 = meilleure correspondance** (bornes mesurées 25-94 sur un jeu de réponses médian). Donc : à ne jamais passer à `scoreColor`/`scoreHex`, calibrés sur 0-10 — 94 y tomberait hors barème — et **non comparable d'une session à l'autre**, le maximum atteignable dépendant des réponses. |
| `compatibility` | `/quiz/compatibility` FR + EN | Même famille : `score` sur **0-100, 100 = meilleure compatibilité**, clampé, tri décroissant, 5 lignes rendues. Même interdiction de palette. |
| `city-badge` | `/badge` + `/badge/[slug]` ×540 | Le seul module qui publie **les deux sens à la fois**, côte à côte, sur des sites tiers que nous ne contrôlons pas : `nationalRank` est un **rang** (**1 = la meilleure ville**) et ne se colore donc pas avec `scoreColor`, où un rang 1 ressortirait rouge ; `scores.global` est un **score** (10 = bon). Vérifié : Obernai (8,4, meilleure note du seed) sort au rang 1, Paris au rang 340 sur 540. |

Quatre autres libs portaient leur convention **sans le marqueur** que le balayage grepe
(`lib/vibe.ts`, `lib/rental-tension.ts`, `lib/internet-score.ts`, `lib/projection-5ans.ts`) : le
`**Convention**` leur a été ajouté, texte inchangé. C'est la suite du précédent posé le 28/08 avec
`city-synthesis`.

Commentaires seuls, zéro changement de comportement.

## Corrigé ④ — deux commentaires décrivaient d'autres pondérations que les leurs

Les cartes de renvoi ajoutées le 30/08 et le 01/09 sur `/pour-qui/[profil]` portent des
commentaires qui justifient **à quels profils** la carte s'affiche. Deux étaient faux, mesurés
contre `PROFILE_PAGES` :

- « les quatre profils dont la pondération est bâtie sur écoles + sécurité + espaces verts » :
  **`jeunes-parents` ne pondère pas `schools` du tout** (safety 2, nature 2, qualiteAir 2,
  famille 2, bruit 1,5…) et **`familles-monoparentales` ne pondère pas `nature`** (cost 2,5,
  safety 2, schools 2, transport 1,5…). Ce qui réunit les quatre est le sujet, pas la formule.
- « les trois profils dont le **poids principal** est `jeuneActif` » : ce n'est le premier poids
  que sur un des trois. jeunes-actifs 2,5 (premier), jeunes-diplômés 2,0 (second derrière
  cost 2,5), célibataires 2,0 (second derrière culture 2,5).

C'est le mode de défaillance que CLAUDE.md documente pour les chaînes `methodology` — une phrase
qui vit loin de la fonction qu'elle décrit, qu'aucun `tsc` ni `npm run integrity` ne peut relire.
Ici la **copie visible**, elle, était juste dans les deux cas, et a été laissée telle quelle :
elle décrit le classement voisin, pas le profil courant.

Contrôle fait au passage sur les quatre formules citées par ces cartes, toutes exactes :
`famille` (owner) = moyenne schools + safety + nature, − 0,5 si `cost < 4` ✔ ;
`jeuneActif` = moyenne culture + remoteWork + cost, + 0,8 au-dessus de 100 000 hab. ✔ ;
`/classements/famille` = schools 3, safety 2,5, nature 2, cost 1,5, transport 1 ✔ ;
`/classements/jeunes-actifs` = culture 2,5, transport 2, remoteWork 1,5, life 1,5, cost 1,5 ✔.

---

## Signalé, non corrigé ① — le collecteur BODACC n'a pas tourné depuis le 27/08

C'est le défaut neuf du run, et le rapport du 01/09 avait posé le test qui le décide, mot pour
mot : « le tell à vérifier au prochain run est que ces 180 lignes v1 soient toujours là ».

**Elles y sont toujours, huit jours plus tard.** `data/city-news.json` porte 540 villes,
`meta.refreshedAt` au **2026-08-27**, et se répartit ainsi :

```
queryVersion 2 : 360 villes   (rafraîchies les 26 et 27/08)
queryVersion 1 : 180 villes   (rafraîchies les 4 et 5/08 — 30 et 31 jours)
```

Or `pickBatch` sert **d'abord** les versions périmées : un cron sain aurait pris ces 180 lignes au
troisième lot, le 28/08. Deux lots consécutifs puis plus rien pendant huit jours ressemble à une
passe lancée à la main, pas à un cron rétabli. Le seuil de refenêtrage à 21 jours parle donc dans
le vide sur **180 villes**.

Conséquence concrète et nommable : sur les **10 villes du seed dont le nom porte une parenthèse
de désambiguïsation** — le bug corrigé le 18/08, où le filtre commune cherchait « Saint-Denis
(La Réunion) » dans un champ BODACC qui ne porte que « Saint-Denis » — **neuf sont guéries et
portent leurs 8 entrées**. La dixième, **`le-francois` (Martinique), est encore en `queryVersion` 1
du 05/08 et publie toujours zéro entrée** : sa page affirme encore qu'aucune immatriculation,
aucune radiation et aucune procédure collective n'y a été enregistrée en douze mois, ce que le
correctif du 18/08 a déjà prouvé faux.

Les trois autres villes sans entrée sont connues et distinctes : `ile-de-re` (pas une commune,
non-correctif assumé), `dinan` et `selestat` (inexpliquées, à sonder en local).

**Pourquoi je ne corrige pas.** Il n'y a rien à corriger dans le dépôt : le code est juste depuis
le 18/08, c'est la **donnée** qui n'a pas été recollectée, et l'egress BODACC est refusé depuis une
routine cloud (403 CONNECT). Le remède est une passe de `npm run news` sur la machine locale — ou
la remise en route de `scripts/local-data-runner.sh`, dont l'arrêt est l'hypothèse la plus simple
et qui mérite d'être vérifiée pour elle-même : le même cron porte aussi le collecteur biodiversité,
dont les deux correctifs du 03/09 (reptiles, noms vernaculaires anglais) **attendent également un
passage pour entrer dans les données**.

## Signalé, non corrigé ② — `environment-index` arrondit toujours deux fois

**Quatrième run consécutif, inchangé** (07/08, 14/08, 28/08, 04/09) : **exactement 22 villes sur
540** publient sur `/environnement` et sa jumelle `/environment` un `healthScore` et un
`stressComposite` dont la somme fait **10,1 au lieu de 10,0**, les deux nombres étant rendus sur la
même page avec leurs deux légendes opposées. Liste identique aux trois runs précédents, Briançon
(6,2 + 3,9) étant dans l'échantillon de contrôle.

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

## Signalé, non corrigé ③ — les rangs publiés là où le score ne départage pas

Re-mesuré, et **légèrement aggravé** par les deux surfaces ajoutées depuis le 28/08.

**Les 35 pages `/pour-qui`** (34 au run précédent ; `travailleurs-frontaliers` s'est ajouté le
31/08). `rankByProfile` **arrondit avant de trier** (`Math.round(score * 10) / 10`) puis coupe à
20, donc le palier est coupé en son milieu.

- **35 / 35** ont un ex æquo dans le top 10 ; **13** ont un #1 et un #2 à la même note.
- **33 / 35 coupent un palier au rang 20** : cumulé, **142 villes portent exactement la note du
  20ᵉ et ne sont pas listées** (140 au run précédent), pendant que d'autres à la même note le sont.
  `proches-aidants` en laisse 19 dehors, `jeunes-parents` publie 20 rangs tirés de **2** notes
  distinctes (palier de 16 villes pour 14 places).
- À décharge sur la nouveauté : `travailleurs-frontaliers` est le profil le mieux tenu du fichier
  sur ce point — **5 villes à 6,5 pour 3 places** au rang 20, et 11 notes distinctes sur 20 rangs.
  Le contrôle d'ex æquo que CLAUDE.md prescrit avant d'écrire un profil a bien été fait, et son
  résultat est fidèle.

**Les 19 classements officiels** (`lib/rankings.ts`), inchangés : **19 / 19** ont un ex æquo dans
leur top 10, **5** ont un #1 et un #2 à la même note, et le plus gros palier du top 50 compte
**21 villes** (`budget`). `/classements/teletravail` publie toujours **Vendôme #1 et Rennes #2**,
toutes deux à 7,8, différence exactement nulle — l'ordre entre elles est la permutation interne du
tri, ni le nom ni l'ordre du seed.

**Pourquoi je ne corrige pas seul.** Appliquer la convention du 19/08 ici ne déplace pas un chiffre :
elle **change la liste des villes affichées** (les paliers débordants entrent ou sortent en bloc) et
retire des numéros de rang que le lecteur voit. C'est un acte éditorial et produit. Le gabarit
existe et est éprouvé (`rankByOwnerScore` + `ownerRankingHead`, portés par
`components/OwnerRankingPage.tsx` et `app/[locale]/niche-rankings/[slug]/page.tsx`), directement
transposable aux 19 + 35 pages dans les deux locales.

## Signalé, non corrigé ④ — deux thèmes Red Flag ne peuvent toujours rendre aucune ville

Re-mesuré, **inchangé depuis le 14/08** : sur les 38 thèmes, `villes-pollution-air-chronique` et
`villes-desert-services-publics` rendent **0 ligne**, structurellement. Portée : 4 pages publiées et
présentes au sitemap. La direction est bonne dans les deux cas, ce sont les bornes qui sont écrites
contre une échelle que le moteur ne produit pas. Seuils de rattrapage mesurés le 14/08 toujours
valables (air `<= 6,0` → 70 villes ; services publics `>= 4,5`, pop ≥ 10 000 → 14 villes).
L'arbitrage n'a pas bougé : déplacer ces seuils **publie une liste de villes réelles nommément
désignées**, ce qui relève de la relecture éditoriale.

Cinq autres thèmes rendent moins des 12 villes attendues — `villes-nuit-tendue` (4),
`villes-desert-culturel` (5), `villes-parking-cauchemar` (5), `villes-mono-touristiques` (9),
`villes-internet-precaire` (10). Rien n'y est faux ; à surveiller si l'un descend vers zéro.

## Signalé, non corrigé ⑤ — sept paires de sous-pages n'émettent pas les mêmes types JSON-LD

Relevé au passage du balayage des données structurées, et laissé tel quel parce qu'aucun **nombre**
n'y est en cause : c'est une différence de richesse sémantique, pas une affirmation fausse.

| Paire | Écart |
|---|---|
| `biodiversite` / `biodiversity` | `Article` côté FR seulement |
| `climat` / `climate` | `Article` côté FR seulement |
| `ecoles` / `schools` | `Article` côté FR seulement |
| `transports` / `transport` | `Article` côté FR seulement |
| `fiscalite` / `tax` | `Article` FR seulement, `BreadcrumbList` EN seulement |
| `climat-2040` / `climate-2040` | `BreadcrumbList` EN seulement |
| `logement` / `housing` | `BreadcrumbList` EN seulement |

À traiter comme une tâche SEO d'harmonisation, pas comme un défaut d'intégrité.

---

## Contrôles passés sans rien à signaler

- **Le 38ᵉ thème Red Flag, `villes-prix-au-m2-trompeur`, livré ce matin : chacune de ses figures
  publiées recalculée depuis le moteur, toutes exactes.** 22 villes classées ✔, 433 villes
  éligibles ✔, dispersion médiane du corpus 1,49 ✔, les cinq médianes par tranche de ventes
  (1,49 · 1,46 · 1,50 · 1,50 · 1,54) ✔, les quatre corrélations de rang (ventes 0,050,
  population 0,012, pauvreté 0,393, maisons 0,297 — annoncées 0,05 / 0,01 / 0,39 / 0,30) ✔,
  Montbéliard 121 %, Guingamp 118 %, Les Abymes 113 %, Chenôve 103 % ✔, Aulnay-sous-Bois 1,93
  contre 1,43 côté maison et Chenôve 2,03 contre 1,42 ✔, Biscarrosse 10 % et Salon-de-Provence
  17 % de pauvreté contre 25 % de médiane pour les villes publiées ✔, Cannes 220 350 € d'écart sur
  65 m² ✔, Marseille 19 801 ventes ✔, et les exclusions (41 sans quartiles publiés, 66 sous les
  100 ventes) ✔. La severity est bien bornée : 8/10 au seuil d'entrée de 1,75, 10/10 à 2,25.
- **Le profil `travailleurs-frontaliers` (31/08) : idem, toutes ses figures exactes.** 89 villes
  sur 540 dans le champ ✔, 11 villes à 20 km ou moins ✔ (nice, annemasse, menton, evian-les-bains,
  longwy, roubaix, tourcoing, wattrelos, saint-louis-haut-rhin, forbach, sarreguemines), 11 villes
  à 10/10 ✔, et la ligne de fracture du loyer sur ces onze : Nice T3 1 500 €, Menton 1 450,
  Annemasse 1 350 et 4 800 €/m², Forbach 670 et 1 200 €/m², Sarreguemines 690, Roubaix 700,
  Tourcoing 740, Longwy 910 — **tous conformes à `data/housing.ts`** ✔. Saint-Paul-de-Vence sort
  bien 20ᵉ, à 32 km de Monaco, 3 600 habitants, T3 1 780 € ✔, et le recouvrement maximal avec les
  34 autres profils est bien de **4/20** (`couple-sans-enfant`, `familles-avec-ados`,
  `amateurs-de-montagne`) ✔.
- **L'édition de novembre du palmarès (02/09) : toutes ses figures exactes**, y compris celles que
  son auteur signale avoir corrigées avant commit. 361 communes éligibles ✔, corrélation de rang
  croissance ~ score global **−0,165** ✔ et **−0,206** sur les 344 villes notées sous 7 ✔, notes
  médianes 4,6 / 5,8 pour une médiane générale de 5,3 ✔, loyers T3 médians 1 080 € contre 725 € ✔,
  la relation en U par bande de note (+6,2 % sur 69 villes · +4,5 % sur 74 · +2,8 % sur 116 ·
  +2,0 % sur 85 · +6,8 % sur 17) ✔ — les cinq effectifs compris —, Villenave-d'Ornon #1 à +45,5 %
  pour 42 185 habitants ✔, Beaune première note du corpus éligible à 7,7 ✔, et la perte parisienne
  de **136 270** habitants ✔.
- **Gardes de données** : `npm run integrity` vert (540 villes, 1 066 guides FR, 839 guides EN,
  0 score brut recopié, 4 284 signaux, 155 termes de glossaire, 386 `page.tsx` sans `openGraph`
  orphelin). `assertUniqueSlugs` charge sans lever des deux côtés.
- **Compteurs de `lib/site-stats.ts`** recomptés contre les vrais modules : `CITIES_COUNT` 540,
  `GUIDES_COUNT` 1 066, `REGIONS_COUNT` 18, `DEPARTMENTS_COUNT` 102, `RANKINGS_COUNT` 19. Aucun écart.
- **`npm run sitemap:check`** : FR 29 155 URL / 18 chunks / **134** routes statiques / 86 familles ;
  EN 28 731 URL / 21 chunks / 78 routes / 88 familles. Chaque URL déclarée a une page, chaque page
  indexable a une URL. La 134ᵉ route FR est le thème Red Flag du matin, correctement déclarée.
- **`npm run parity`** : FR 220 routes / EN 166, **0 route FR sans jumelle EN**.
- **`npm run hreflang:check`** : 39 paires de sous-pages ville + **195 paires écrites à la main**
  (le contrôle ajouté le 02/09), chaque hreflang annoncé a une route en face dans le même état
  d'activation.
- **`npm run search-index:check`** : les deux projections sont à jour.
- **Couverture des paires** : `RANKING_META` 19 / `RANKING_EN` 19, zéro clé orpheline de part et
  d'autre, et les six champs (`label`, `tagline`, `headline`, `description`, `methodology`, `why`)
  présents et non vides sur les 19. Les quatre cartes de régions (`REGION_EN_DESCRIPTIONS`,
  les deux `REGION_EMOJIS`, `REGION_DESCRIPTIONS`) portent exactement les 18 régions du seed —
  zéro manquante, zéro orpheline.
- **Règle 3, direction et couleur** : les six paires à direction sensible sont propres des deux
  côtés — les pages EN inversent dans une variable **avant** de colorer
  (`scoreColor(cleanScore)`, `scoreColor(safetyScore)`, `scoreColor(dimScore)`…), les pages FR
  passent par une palette **par niveau** (`AIR_LEVEL_COLOR`, `LEVEL_COLOR`…). Les trois pages de
  nuisance (`bruit`, `eau`, `risques`) utilisent leur palette de niveau côté FR et `hazardColor`
  côté EN, jamais `scoreColor` sur la valeur brute. Inventaire complet des arguments passés à
  `scoreColor`/`scoreHex`/`scoreBg` sur `app/` et `components/` : aucune nuisance brute.
- **Les 38 thèmes Red Flag** : `severity` dans [1 ; 10] partout, tri décroissant sans exception.
- **Les 35 profils `/pour-qui`** : score dans [0 ; 10], tri décroissant partout, `scoreColor`
  nourri d'une valeur `10 = bon`. Seul l'ordre entre ex æquo est en cause (§ signalé ③).
- **La note de mois partiel de F64** (corrigée le 01/09) : `newsPartialCoverage` interpole
  `daysCounted` / `daysInMonth` dans les deux locales depuis la même fonction et le même composant
  serveur, donc identiques par construction. Le fichier porte bien les deux régimes annoncés.

---

## Vérification

`npx tsc --noEmit` : **clean**. `npm run integrity` : **vert**. Aucune route ajoutée ou supprimée,
aucun changement de `app/sitemap.ts`, aucune valeur de moteur déplacée. Les modifications portent
sur un bloc JSON-LD retiré (`app/departements/[dept]/page.tsx`), six en-têtes de lib, un
commentaire de composant et deux commentaires de page — tout le reste est du commentaire.

`npm run build` **non lancé**, conformément à CLAUDE.md : en session cloud il tourne plus de
4 h 30 et meurt en ENOSPC sans jamais afficher d'erreur. Les fichiers touchés sont couverts par
`tsc` et ne changent aucune dépendance de données.

Aucun déploiement (manuel, hors périmètre de l'agent).
