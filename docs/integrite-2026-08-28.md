# Intégrité des données — run du 2026-08-28

Agent « intégrité des données », run autonome. Objet : qu'aucun chiffre publié ne se contredise
lui-même — direction du score conforme au nom de la métrique, jumelles hreflang d'accord sur le
même nombre, légende et couleur qui disent la même chose que le chiffre.

**Résultat : 4 défauts réels trouvés et corrigés (139 pages EN + 2 chiffres de copie + 5 blocs
`**Convention**`, dont un qui décrivait un autre calcul que le sien), 1 défaut neuf et large
signalé sans correction (53 pages de classement publient des rangs sur des ex æquo stricts),
2 défauts hérités re-mesurés et toujours ouverts. 0 divergence FR/EN sur les valeurs
(37 800 valeurs contrôlées).**

---

## Méthode

Même harnais que les runs du 07/08 et du 14/08 : `lib/` et `data/` chargés par un `npx tsx` de
scratch, puis appel des **vraies fonctions** et rejeu à l'identique des expressions d'affichage
de chaque page FR et de sa jumelle EN. Aucun chiffre n'est lu à l'œil ni dérivé d'un `grep` du
seed. Rappel utile pour le prochain run : le conteneur démarre **sans `node_modules`**,
`npm install` d'abord, sinon `tsc` sort des dizaines de milliers de fausses erreurs.

Le run du 14/08 avait couvert les 38 paires de sous-pages ville et les 36 thèmes Red Flag.
Plutôt que de répéter ce balayage, ce run l'a rejoué en régression (il repasse) et a porté
l'effort neuf sur quatre angles que le 14/08 ne pouvait pas couvrir :

1. les **surfaces apparues depuis** — les 10 classements owner refondus le 19/08 et leurs 10
   jumelles EN `/niche-rankings`, le hub `/espaces-proteges` + `/protected-areas` livré le 26/08,
   le thème `villes-achat-hors-de-portee` du 24/08 ;
2. les **chiffres écrits dans la copie** confrontés à ce que le moteur produit vraiment — c'est
   le piège que CLAUDE.md documente (les chaînes `methodology` vivent loin de la fonction
   qu'elles décrivent, et ni `tsc` ni `npm run integrity` ne peuvent voir l'écart) ;
3. l'**ordre publié**, y compris en données structurées, là où le score ne départage pas ;
4. les **moteurs sans bloc `**Convention**`**, c'est-à-dire ceux dont la direction n'est écrite
   nulle part.

Échantillon de villes du tableau de contrôle (profils variés : métropole, ville moyenne,
préfecture rurale, montagne, littoral, banlieue, île, deux DROM) : Paris, Marseille, Angers,
Mende, La Rochelle, Briançon, Roubaix, Ajaccio, Cayenne, Saint-Denis de La Réunion — le balayage
numérique, lui, porte sur les 540.

---

## Règle 2 — les jumelles hreflang affichent le même nombre

**37 800 valeurs de moteur contrôlées sur les 540 villes × 14 moteurs, 0 divergence réelle.**

Le contrôle ne compare plus seulement les valeurs (identiques par construction, FR et EN appelant
la même lib) mais les **deux formes d'écriture** que les deux locales emploient : côté FR
`(10 - x).toFixed(1)`, côté EN `Math.round((10 - x) * 10) / 10` puis `.toFixed(1)`. Ces deux
formes ne sont pas équivalentes (`7,55` sort à `7,5` par `toFixed` et à `7,6` par `Math.round`),
et le 14/08 notait le piège comme latent sans le localiser. Il l'est maintenant :

- **les seules valeurs du site qui tombent sur une frontière `.x5` sont celles de
  `lib/commerce.ts`** — 112 cas sur `coverage.score`, 35 sur `proximity.score`, 9 sur
  `centreVille.score`, 4 sur le composite ; aucune autre lib n'en produit une seule ;
- or `/villes/[slug]/commerces` et `/cities/[slug]/retail` écrivent toutes deux `.toFixed(1)`,
  vérifié ligne à ligne, **donc aucune de ces valeurs n'est rendue différemment d'une locale à
  l'autre**. Le risque reste théorique et il est désormais nommé : si une page EN de commerce
  passait à la forme `Math.round`, 160 valeurs divergeraient immédiatement.

Comparaison des **sites d'inversion** entre les 28 paires de hubs FR/EN (nombre d'expressions
`10 - x` d'un côté contre l'autre) : symétrique partout, aucune paire où une locale inverse et
l'autre non. C'est le contrôle qui avait attrapé sécurité (FR 6,8 vs EN 3,2) et le quatuor
environnement ; il est propre.

Tableau de contrôle sur l'échantillon (colonne unique = FR et EN d'accord) :

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

Colonnes « Air / Bruit / Eau / Risques » : les trois dernières nomment une **nuisance**, donc
`10 = pire`, sans inversion ; « Air » nomme une **qualité** et est inversée à l'affichage. Les six
premières nomment des qualités et sont inversées elles aussi. « Env. santé » lit `healthScore`,
déjà orienté `10 = sain`. Recoupement fait au passage : les valeurs publiées par
`/villes/[slug]/synthese` (Paris santé 7,9, services publics 7,9) sont bien celles des sous-pages
correspondantes — la synthèse et le détail ne se contredisent pas.

---

## Corrigé ① — 139 pages EN annonçaient aux moteurs un classement à l'envers

C'est le vrai défaut du run, et il ne se voyait pas à l'écran : il était dans le JSON-LD.

Trois familles de pages EN déclaraient `itemListOrder: "https://schema.org/ItemListOrderAscending"`
sur une liste **triée du meilleur au pire**. Vérifié dans le code des trois : `cities` et `ranked`
sortent d'un `.sort((a, b) => b.score - a.score)`, donc décroissant. La balise disait l'inverse de
la page.

| Page EN | Tri réel | Ce que le JSON-LD annonçait | Pages |
|---|---|---|---|
| `/rankings/[slug]` | score décroissant | liste croissante | 19 |
| `/regions/[region]` | score global décroissant | liste croissante | 18 |
| `/departments/[dept]` | score global décroissant | liste croissante | 102 |

**Et aucune des trois jumelles FR ne déclare d'ordre du tout** (`app/classements/[slug]`,
`app/regions/[region]`, `app/departements/[dept]` : zéro `itemListOrder`). Deux pages en relation
hreflang décrivaient donc leur liste différemment, l'une par un silence, l'autre par une
affirmation fausse.

Corrigé en **retirant** l'attribut plutôt qu'en le remplaçant par `Descending`, pour deux raisons
écrites dans chaque fichier : ① les deux locales disent alors la même chose, ce qui est le point
de la règle 2 ; ② le sens de tri est justement ce qui reste à trancher au fond (cf. § signalé ①
— les 19 classements ont des ex æquo stricts dans leur top 10, et la convention du 19/08 demande
`ItemListUnordered` dans ce cas). Écrire `Descending` aujourd'hui aurait été remplacer une
affirmation fausse par une affirmation prématurée.

Contrôle de non-régression : les quatre autres `itemListOrder` du site sont justes —
`/villes/[slug]/parcs` et `/cities/[slug]/parks` (parcs par superficie décroissante),
`/villes-qui-grandissent` (gain d'habitants décroissant), et les `head.ordered` conditionnels de
`OwnerRankingPage` / `/niche-rankings` / `/espaces-proteges` / `/protected-areas`, qui basculent
déjà en `ItemListUnordered` quand le palier de tête est à égalité. Il ne reste plus un seul
`ItemListOrderAscending` dans le dépôt.

## Corrigé ② — « la table de PM2.5 couvre 20 départements » : elle en couvre 19

`lib/owner-rankings.ts` (FR) et `app/[locale]/niche-rankings/[slug]/page.tsx` (EN) publient la
méthodologie de `/classements/qualite-air` et de `/niche-rankings/air-quality`. Les deux
annonçaient **20 départements**. `DEPT_PM25_AVG` dans `lib/owner-scores.ts` en compte **19**, et
les 19 sont bien tous représentés dans le seed (mesuré : 157 villes classées sur 19 départements
distincts). Corrigé des deux côtés.

Le reste de ces chaînes a été vérifié par exécution et tient : `qualite-air` 157 classées / 383
écartées ✔, `lien-social` 25 départements / 226 classées / 314 écartées ✔, `calme-sonore`
« 9 valeurs distinctes sur 540 villes » ✔ et « le premier palier compte à lui seul 170 communes »
✔. La refonte du 19/08 est donc fidèle à son moteur à ce détail près.

## Corrigé ③ — le hub `/red-flags` annonçait 540 villes là où la page liée en classe 363

`app/red-flags/page.tsx` présentait le classement parent solo comme portant « sur les 540 villes
≥ 20 000 hab. ». Les deux moitiés de la phrase ne peuvent pas être vraies ensemble : le site
compte 540 villes **au total**, dont **363** dépassent 20 000 habitants. Et `/parent-solo`
applique bien `MIN_POP = 20 000` puis imprime lui-même « 363 villes classées » — le hub
contredisait donc, à un clic de distance, la page qu'il décrivait.

Corrigé par un compteur **dérivé du même filtre** (`CITIES_SEED.filter(c => c.population >= 20_000)`)
plutôt que par un nombre réécrit à la main : le hub ne pourra plus dériver de la page qu'il
annonce quand le seed grossira. Le seuil est commenté à côté, avec un renvoi vers `MIN_POP`.

## Corrigé ④ — cinq moteurs ne disaient nulle part dans quel sens ils se lisent

Direction vérifiée **par exécution sur les 540 villes** avant rédaction, jamais supposée.

| Lib | Consommateurs | Convention constatée et écrite |
|---|---|---|
| `utils` (`SCORE_TIERS`) | **115 fichiers** | La palette du site est calée `10 = bon` et 0-10. Le bloc nomme les trois pièges déjà rencontrés : une nuisance brute y ressort **verte au pire**, un score sur 100 ou des minutes n'y ont rien à faire, et l'inversion se fait à l'affichage, jamais au moteur. |
| `owner-scores` | 6 (dont les 20 pages de classement owner) | Les 10 scores sortent en `10 = bon`, **canicule, bruit et solitude étant inversés au calcul** (bornes mesurées : 2,0-10,0 · 5,6-9,8 · 3,3-8,6). D'où : pas de ré-inversion en aval, et le libellé d'une surface doit rester du côté de la qualité (« Calme sonore », pas « Bruit »). |
| `profile-pages` | 6 | Toute clé de `weights` est lue en `10 = bon`. Deux exceptions volontaires documentées : `healthcareAccess` est inversé dans `getScoreValue` (F47 mesure la difficulté), et `rentalTension` entre **sans inversion avec un poids positif** sur le seul profil `investisseurs-locatifs` — pour un bailleur un marché tendu est un délai de relocation court, et l'intro du profil le dit. La même clé sur un profil de locataire serait un bug. |
| `protected-areas-ranking` | 2 hubs | Ne publie **aucune note sur 10** : une couverture en **pourcentage**, `100 = le plus protégé`. Donc à ne jamais passer à `scoreColor` (47,9 % tomberait hors barème — les deux hubs n'utilisent d'ailleurs aucune couleur de score, et c'est volontaire). La note sur 10 de la composante vient d'ailleurs (`biodiversityProfile(slug).protection.score`). |
| `city-synthesis` | 18 | Le bloc existait **et décrivait un autre calcul que le sien** : il annonçait « env, sécurité, démo, services » comme inversés. Le code inverse en fait **santé, emploi, sécurité, démographie, services publics**, et ne touche pas à l'environnement — qui lit `healthScore`, déjà orienté `10 = sain`. Corrigé contre le code, et le commentaire interne de la fonction avec. |

Commentaires seuls, zéro changement de comportement. Le sigle `**Convention**` est aussi ce que
le prochain run grepera : `city-synthesis` portait sa convention sans le marqueur, il l'a
maintenant.

---

## Signalé, non corrigé ① — 53 pages publient des rangs là où le score ne départage pas

C'est le défaut neuf et le plus large du run. Il ne fabrique aucun chiffre faux : il fabrique un
**ordre**. C'est exactement ce que la convention du 2026-08-19 (`lib/owner-rankings.ts`, reprise
dans CLAUDE.md) interdit — mais cette convention n'a été appliquée qu'aux 10 classements owner,
et ni les 19 classements officiels ni les 34 pages `/pour-qui` ne l'ont adoptée.

**Les 19 classements officiels** (`lib/rankings.ts` → `/classements/[slug]` + `/rankings/[slug]`).
Le score est une moyenne pondérée d'axes du seed à une décimale : les égalités **strictes** (écart
flottant nul, vérifié à 17 chiffres) y sont la norme, pas l'exception.

- **19 / 19** ont au moins un ex æquo strict dans leur top 10 — celui que le JSON-LD publie.
- `/classements/teletravail` publie **10 rangs tirés de 3 notes distinctes** ; `gastronomie`,
  `retraite`, `sante` et `budget` idem (3 notes pour 10 rangs) ; le plus gros palier du top 50
  compte **21 villes** (`budget`) et 16 (`investissement`).
- Sur **5 classements** (`teletravail`, `retraite`, `culture`, `sante`, `logement`) **le #1 et le
  #2 ont la même note** : la page désigne un vainqueur que la donnée ne désigne pas.
- Exemple à garder : `/classements/teletravail` publie **Vendôme #1 et Rennes #2**, toutes deux
  à 7,8000000000000000, différence exactement nulle. Et l'ordre entre elles ne suit **ni le nom,
  ni l'ordre du seed** (Vendôme y est la 228ᵉ ligne, Rennes la 2ᵉ) : c'est la permutation interne
  du tri. Une montée de version de Node peut donc rebattre le #1 d'un classement sans qu'une
  ligne du dépôt ait bougé.
- Circonstance atténuante réelle : la page publie ensuite **toute** la liste (`TOP_VISIBLE = 100`
  puis la queue), donc aucune égalité n'est *tronquée*. Le défaut est l'ordre publié et le
  `position` en données structurées, pas une omission.

**Les 34 pages `/pour-qui`** (`lib/profile-pages.ts` → `/pour-qui/[profil]` + `/for-who/[slug]`).
Ici c'est plus grave, parce que `rankByProfile` **arrondit avant de trier** (`Math.round(score * 10) / 10`)
puis coupe à 20 : le palier est donc coupé en son milieu, ce que la convention nomme explicitement.

- **34 / 34** ont un ex æquo dans le top 10, **13** ont un #1 et un #2 à la même note.
- `jeunes-parents` publie **20 rangs tirés de 2 notes distinctes** (un palier de 14 villes) ;
  `primo-accedants` et `proches-aidants` en publient 20 pour 4 notes.
- **32 / 34 coupent un palier au rang 20** : cumulé, **140 villes portent exactement la note du
  20ᵉ et ne sont pas listées**, pendant que d'autres à la même note le sont —
  `proches-aidants` en laisse 19 dehors, `futurs-retraites` 15, `primo-accedants` 12.
- Les deux locales impriment `#1`…`#20` et un `position: i + 1` dans le JSON-LD du top 10.

**Pourquoi je ne corrige pas seul.** Appliquer la convention ici ne déplace pas un chiffre : elle
**change la liste des villes affichées** (les paliers débordants entrent ou sortent en bloc) et
retire des numéros de rang que le lecteur voit. C'est un acte éditorial et produit, pas un
correctif d'affichage — au même titre que le recalage des seuils Red Flag ci-dessous.

**Correction proposée**, la même que celle déjà écrite et éprouvée le 19/08, à réutiliser telle
quelle plutôt qu'à réinventer : `rankByOwnerScore` + `ownerRankingHead` groupent par valeur,
publient des paliers rangés au rang de compétition, s'arrêtent **avant** le palier qui déborde en
disant combien de villes suivaient et à quelle note, et basculent le JSON-LD en
`ItemListUnordered` sans `position` dès que la tête est à égalité. Les deux pages qui la portent
(`components/OwnerRankingPage.tsx` et `app/[locale]/niche-rankings/[slug]/page.tsx`) sont un
gabarit directement transposable aux 19 + 34 pages, dans les deux locales. Décision à prendre
aussi sur l'`itemListOrder` retiré au § corrigé ① : c'est le même arbitrage.

## Signalé, non corrigé ② — deux thèmes Red Flag ne peuvent toujours rendre aucune ville

Re-mesuré ce run, **inchangé depuis le 14/08** : sur les 37 thèmes, `villes-pollution-air-chronique`
et `villes-desert-services-publics` rendent **0 ligne**, structurellement — leur seuil est hors de
la plage que le moteur interrogé produit. Portée : 4 pages publiées et présentes au sitemap (les
2 thèmes FR et leurs 2 jumelles EN). La direction est bonne dans les deux cas, ce sont les bornes
qui sont écrites contre une échelle qui n'existe pas.

Les seuils de rattrapage mesurés le 14/08 restent valables (air `<= 6,0` → 70 villes ;
services publics `>= 4,5`, pop ≥ 10 000 → 14 villes). L'arbitrage n'a pas bougé non plus :
déplacer ces seuils **publie une liste de villes réelles nommément désignées** comme ayant un air
chroniquement pollué ou un désert de services publics, ce qui relève de la relecture éditoriale.
L'état vide reste propre des deux côtés et le titre ne dit plus « Les 0 villes » depuis le 14/08.

Pour mémoire, cinq autres thèmes rendent moins des 12 villes attendues — `villes-nuit-tendue` (4),
`villes-desert-culturel` (5), `villes-parking-cauchemar` (5), `villes-mono-touristiques` (9),
`villes-internet-precaire` (10). Rien n'y est faux ; à surveiller si l'un descend vers zéro.

## Signalé, non corrigé ③ — `environment-index` arrondit toujours deux fois

**Troisième run consécutif, inchangé** (07/08, 14/08, 28/08) : **exactement 22 villes sur 540**
publient sur `/environnement` et sa jumelle `/environment` un `healthScore` et un
`stressComposite` dont la somme fait **10,1 au lieu de 10,0**, les deux nombres étant rendus sur
la même page avec leurs deux légendes opposées. Briançon (6,2 + 3,9) est dans l'échantillon de
contrôle de ce run.

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
appliqué parce que ça déplace un score publié. C'est le plus petit des trois arbitrages en
attente, et le seul dont l'effet est intégralement chiffré ici.

---

## Contrôles passés sans rien à signaler

- **Gardes de données** : `npm run integrity` vert (540 villes, 1 012 guides FR, 765 guides EN,
  0 score brut recopié, 4 284 signaux, 155 termes de glossaire, 15 guides EN retirés dont les
  cibles de redirection vivent). `assertUniqueSlugs` charge sans lever des deux côtés.
- **Compteurs de `lib/site-stats.ts`** : les 7 constantes recomptées contre les vrais modules —
  `CITIES_COUNT` 540, `GUIDES_COUNT` 1 012, `REGIONS_COUNT` 18, `DEPARTMENTS_COUNT` 102,
  `RANKINGS_COUNT` 19, `TAGS_COUNT` 248, `GLOSSARY_TERMS_COUNT` 155. Aucun écart.
- **Chiffres cités par les thèmes Red Flag récents**, recalculés un à un : `villes-qui-se-vident`
  « 538 des 540 villes couvertes » ✔ et « 472 villes d'au moins 10 000 habitants » ✔ ;
  `villes-achat-hors-de-portee` « 430 villes où les deux mesures existent » ✔ (prix appartement +
  niveau de vie + plancher de 100 ventes ; sans le plancher on serait à 494, la copie décrit bien
  les trois conditions) et « 26 communes sans aucun prix DVF » ✔.
- **`npm run hreflang:check`** : 39 paires de sous-pages ville, chaque hreflang annoncé a une
  route en face dans le même état d'activation. L'unique route EN sans jumelle FR est
  `/cities/[slug]/overview`, dont le pendant français est la fiche ville elle-même — écart connu
  et voulu.
- **`npm run sitemap:check`** : FR 29 089 URL / 18 chunks / 133 routes statiques / 86 familles ;
  EN 28 649 URL / 21 chunks / 78 routes / 88 familles. Chaque URL déclarée a une page, chaque page
  indexable a une URL, dans les deux sens.
- **`npm run parity`** : FR 219 routes / EN 166, **0 route FR sans jumelle EN**.
- **`npm run search-index:check`** : les deux projections sont à jour.
- **Couverture des paires** : `RANKING_META` 19 / `RANKING_EN` 19, zéro clé orpheline de part et
  d'autre. Les cartes de régions (`REGION_EN_DESCRIPTIONS` côté EN, `REGION_EMOJIS` des deux pages
  FR, `REGION_DESCRIPTIONS`) portent exactement les 18 régions du seed — zéro manquante, zéro
  orpheline.
- **Les 10 classements owner et leurs 10 jumelles EN** : la convention d'ex æquo du 19/08 tourne
  comme annoncé (pool, exclusions, paliers, palier suivant). Les jumelles EN appellent la même
  `rankByOwnerScore(scoreKey)` avec le même `toFixed(1)` et le même gabarit de paliers — valeurs
  identiques par construction, vérifié appel par appel. `calme-sonore` bascule bien en « ce score
  ne départage pas » (170 villes au premier palier).
- **Les 37 thèmes Red Flag** : `severity` dans [1 ; 10] partout, tri décroissant sans exception,
  palette par niveau (jamais `scoreColor` sur une gravité brute).
- **Les 34 profils `/pour-qui`** : score dans [0 ; 10], tri décroissant partout, `scoreColor`
  nourri d'une valeur `10 = bon`. Seul l'ordre entre ex æquo est en cause (§ signalé ①).
- **Direction et légende** : recherche systématique des fichiers qui mêlent un moteur à direction
  sensible et le score global sans énoncer « 10 = » — **0 résultat**. La règle 3 tient là où elle
  mord, c'est-à-dire là où une surface s'écarte de la convention par défaut ou fait cohabiter deux
  échelles. Les surfaces qui n'affichent que le score du site sans légende locale (la majorité)
  suivent la convention documentée sur `/methode` et n'ont pas été touchées : leur ajouter une
  légende au cas par cas produirait du bruit, pas de la clarté.

---

## Vérification

`npx tsc --noEmit` : **clean**. `npm run integrity` : **vert**. Aucune route ajoutée ou supprimée,
aucun changement de `app/sitemap.ts`. Les modifications portent sur quatre fichiers de page
(trois JSON-LD EN, un paragraphe de hub FR) et cinq en-têtes de lib, plus deux chaînes de
méthodologie.

`npm run build` **non lancé**, conformément à CLAUDE.md : en session cloud il tourne plus de
4 h 30 et meurt en ENOSPC sans jamais afficher d'erreur. Les pages touchées sont couvertes par
`tsc` et ne changent aucune dépendance de données.

Aucun déploiement (manuel, hors périmètre de l'agent).
