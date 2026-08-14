# Intégrité des données — run du 2026-08-14

Agent « intégrité des données », run autonome. Objet : qu'aucun chiffre publié ne se contredise
lui-même — direction du score conforme au nom de la métrique, jumelles hreflang d'accord sur le
même nombre, légende et couleur qui disent la même chose que le chiffre.

**Résultat : 1 défaut d'affichage réel trouvé et corrigé (65 pages, les deux locales), 6 blocs
`**Convention**` ajoutés, 2 pages structurellement vides signalées sans correction, 1 défaut
hérité toujours ouvert. 0 divergence FR/EN sur les valeurs (24 300 couples).**

---

## Méthode

Même harnais que le run du 07/08 : `lib/` et `data/` compilés en CommonJS par un `tsc -p` de
scratch (hook de résolution `@/`), puis appel des **vraies fonctions** et rejeu à l'identique des
expressions d'affichage de chaque page FR et de sa jumelle EN. Aucun chiffre n'est lu à l'œil ni
dérivé d'un `grep` du seed.

Le run précédent avait balayé 540 villes × 12 moteurs sans trouver d'écart de valeur. Plutôt que de
répéter ce balayage à l'identique, ce run l'a **rejoué en régression** (il repasse, cf. § règle 2)
et a porté l'effort neuf sur trois angles que le 07/08 n'avait pas couverts :

1. les **surfaces apparues depuis** (croisement mois × profil ×84 FR + ×84 EN, `villes-qui-se-vident`,
   pages biodiversité et parcs retouchées) ;
2. les **26 paires de sous-pages ville** dont le 07/08 n'avait pas comparé les expressions
   numériques (il avait couvert les 12 moteurs à direction sensible, pas le reste) ;
3. les **moteurs sans bloc `**Convention**`**, c'est-à-dire ceux dont la direction n'était écrite
   nulle part — c'est là qu'était le défaut.

Échantillon de villes du tableau de contrôle (profils variés) : Paris, Marseille, Angers, Mende,
La Rochelle, Annecy, Roubaix, Ajaccio, Perpignan, Fort-de-France — le balayage numérique, lui,
porte sur les 540.

---

## Règle 2 — les jumelles hreflang affichent le même nombre

**24 300 couples de valeurs comparés, 0 écart.** Régression propre par rapport au 07/08.

Le contrôle porte sur l'**expression rendue**, pas sur la valeur du moteur : côté FR les pages
écrivent `(10 - x).toFixed(1)`, côté EN `Math.round((10 - x) * 10) / 10` puis `.toFixed(1)`. Les
deux formes ne sont pas équivalentes en général (`7.55` sort à `7.5` par `toFixed` et à `7.6` par
`Math.round`) ; aucune valeur du site ne tombe aujourd'hui sur une de ces frontières. Le piège
reste latent et ce contrôle est celui qui le rattrapera si un barème bouge.

Les 26 paires non couvertes le 07/08 ont été comparées par **extraction des expressions numériques
des deux fichiers jumeaux** (appels `toFixed` / `Math.round` / `dec1`, littéraux de chaîne retirés).
31 paires sur 38 présentent des expressions asymétriques : **toutes** relèvent du formatage
(virgule décimale FR contre point EN, `%` collé ou espacé, copie éditoriale portant le chiffre) ou
de l'arrondi préalable EN décrit ci-dessus. Les sources sont identiques des deux côtés, vérifiées
appel par appel : `rentalTension(city)`, `internetScore(city)`, `buildRentVsBuy(slug)`,
`cityParks(slug)`, `biodiversityProfile(slug)`, `parentSoloFit(city)`, `computeCitySynthesis(city)`,
`formatScore(city.scores.global)` — même fonction, mêmes arguments.

**Le croisement mois × profil (`/vacances/ou-partir/[combo]` ↔ `/vacations/where-to-go/[combo]`,
84 paires) est propre par construction** : mêmes constantes (`POOL_SIZE` 60, `TOP_SHOWN` 12,
`COMPARE_DEPTH` 15), mêmes appels moteur (`topCitiesForMonth(idx, …, { profile, limit: POOL_SIZE,
minPop: 8_000 })` et `topCitiesForProfile(slug, …, { limit: POOL_SIZE })`), même calcul de médiane.
Le `minPop: 8 000` s'écarte volontairement du défaut 5 000 de `/vacances/mois/[mois]`, des deux
côtés et pour la raison documentée dans les deux fichiers. Le cache de `lib/vacation-fit` porte
bien `minPop` dans sa clé depuis le 06/08 : deux surfaces à seuils différents ne peuvent plus se
polluer l'une l'autre.

Tableau de contrôle sur l'échantillon (composites, colonne unique = FR et EN d'accord) :

| Ville | Sécurité | Santé | Emploi | Serv. pub. | Démogr. | Air | Bruit | Eau | Risques |
|---|---|---|---|---|---|---|---|---|---|
| Paris | 3,2 | 7,9 | 7,2 | 7,9 | 6,3 | 5,1 | 5,8 | 2,5 | 2,3 |
| Marseille | 3,6 | 7,9 | 5,8 | 7,7 | 6,3 | 2,7 | 6,8 | 8,3 | 6,6 |
| Angers | 5,5 | 7,9 | 6,0 | 8,4 | 7,5 | 5,6 | 4,2 | 4,5 | 2,3 |
| Mende | 8,7 | 3,0 | 5,2 | 5,4 | 4,9 | 6,7 | 1,7 | 7,3 | 2,9 |
| La Rochelle | 6,1 | 5,7 | 4,6 | 7,4 | 6,0 | 5,7 | 3,4 | 6,3 | 5,4 |
| Annecy | 6,3 | 6,2 | 6,5 | 8,2 | 6,6 | 4,2 | 3,4 | 3,1 | 2,4 |
| Roubaix | 3,6 | 5,7 | 4,1 | 8,0 | 7,5 | 6,0 | 4,0 | 2,5 | 1,5 |
| Ajaccio | 5,0 | 5,7 | 4,6 | 7,4 | 6,9 | 4,2 | 3,4 | 8,4 | 4,3 |
| Perpignan | 4,3 | 6,2 | 3,9 | 8,2 | 5,1 | 3,7 | 3,4 | 7,6 | 4,8 |
| Fort-de-France | 4,1 | 7,1 | 3,0 | 7,1 | 4,1 | 5,6 | 3,4 | 6,2 | 3,8 |

Colonnes « Bruit / Eau / Risques » : nuisances, donc `10 = pire`, sans inversion. Les autres sont
nommées pour une qualité et sont inversées à l'affichage.

---

## Corrigé ① — la gravité Red Flag et le score global, deux `/10` opposés côte à côte, sans légende

C'est le défaut réel du run, et c'est exactement le cas que la règle 3 existe pour attraper.

Chaque ligne d'un classement Red Flag affiche **deux nombres sur 10 à quelques pixels l'un de
l'autre, en sens opposés** :

- le badge de **gravité** — `severity`, `10 = le plus grave`, palette rouge par niveau ;
- le **score global** de la ville juste en dessous — `10 = bon`, palette `scoreColor`.

Aucune des deux locales ne disait lequel se lit dans quel sens. Un lecteur voyant « Béziers · 8,4/10 »
puis « Score global : 5,1/10 » n'avait aucun moyen de savoir que le premier est une mauvaise
nouvelle et le second une note ordinaire — et les deux portent la même unité apparente.

La couleur sauvait partiellement le lecteur voyant (le badge est rouge en haut de barème, et
`severityColor` est bien une palette par niveau, pas `scoreColor` — la règle sur les palettes était
donc respectée). Elle ne sauvait personne d'autre : côté FR l'`aria-label` disait
`Severity 8.4 sur 10` — un mot anglais dans une page française, **et toujours pas la direction** ;
côté EN il n'y avait **pas d'`aria-label` du tout**. Un lecteur d'écran recevait donc deux nombres
nus et opposés, sans le seul indice qui restait.

Corrigé des deux côtés, sans qu'aucun chiffre ne bouge :

- légende sous le titre du classement, énonçant les **deux** conventions puisque les deux nombres
  cohabitent (FR : « Gravité sur ce thème : 10 = le plus grave, 0 = non concerné. Le score global
  affiché à côté suit la convention inverse du site — 10 = meilleure ville. » ; EN : la même) ;
- `aria-label` FR repassé en français et complété (« Gravité 8.4 sur 10, 10 étant le plus grave ») ;
- `aria-label` EN ajouté (« Severity 8.4 out of 10, 10 being the worst ») ;
- la légende ne s'affiche que si le classement a des lignes — expliquer un badge absent n'aide pas.

**Portée : 36 pages FR** (`components/RedFlagThemePage.tsx`, partagé par les 36 thèmes) **+ 29 pages
EN** (`app/[locale]/red-flags/themes/[slug]/page.tsx`, la sélection EN) = **65 pages**.

Défaut de copie corrigé au passage sur les mêmes pages : le titre était
`Les {rows.length} villes les plus concernées`, qui se rendait littéralement **« Les 0 villes les
plus concernées »** sur les deux thèmes vides ci-dessous (et « The 0 most affected cities » côté EN).
Le titre est maintenant conditionnel.

## Corrigé ② — six moteurs ne disaient nulle part dans quel sens ils se lisent

Le 07/08 avait doté neuf libs de hazard d'un bloc `**Convention**`. Six moteurs qui produisent
des nombres publiés n'en avaient toujours pas — et c'est parmi eux que se trouvait le défaut ①.
Direction vérifiée par exécution avant rédaction, jamais supposée :

| Lib | Convention constatée | Vérification |
|---|---|---|
| `red-flag-themes` | `severity` 0-10, **10 = pire** | 36 thèmes, 390 lignes, `severity ∈ [1, 10]`, tri décroissant sans exception |
| `gentrification` | `score` sur **0-100**, `signals[].value` sur 0-10 | ni qualité ni nuisance : une **intensité**, rendue en `--accent` neutre et non en `scoreColor` |
| `parent-solo` | `score` + 4 `breakdown` 0-10, **10 = bon** | entrées = axes du seed déjà orientés 10 = bon, aucune inversion |
| `niche-scores` | 5 scores 0-10, **10 = bon** | + rappel qu'ils ne sont **pas** dans le seed (piège documenté dans CLAUDE.md) |
| `vacation-fit` | `score` / `profileScore` / `activityScore` 0-10, **10 = bon** | + `monthSignal` porte des **mesures**, dont `crowded` 1-5 où **5 = le plus fréquenté** |
| `commute-estimate` | **aucun score 0-10** : des minutes et des parts 0-1 | ne jamais nourrir `scoreColor` — 38 minutes y tomberaient dans le vert |

Le bandeau de `red-flag-themes` annonçait par ailleurs « 4 thèmes éditoriaux » alors qu'il y en a
36 : corrigé. Commentaires seuls, zéro changement de comportement.

---

## Signalé, non corrigé ① — deux thèmes Red Flag ne peuvent rendre aucune ville

Le contrôle de direction sur les 36 thèmes a trouvé autre chose : **deux `rank()` retournent zéro
ligne, structurellement**, parce que leur seuil est hors de la plage que le moteur interrogé produit
réellement. Ce n'est pas un jeu de données pauvre, c'est un filtre qui ne peut pas se déclencher.

| Thème | Filtre écrit | Plage réellement produite sur 540 villes | Villes éligibles |
|---|---|---|---|
| `villes-pollution-air-chronique` | `score_qualite_air <= 5` | **[5,5 ; 8,5]**, médiane 7,0 | **0** |
| `villes-desert-services-publics` | `composite >= 6,5` **et** pop ≥ 10 000 | **[1,6 ; 6,7]**, médiane 3,1, p95 4,8 | **0** (1 ville passe 6,5, sous 10 000 hab.) |

La **direction est bonne** dans les deux cas — `score_qualite_air` est bien `10 = bon` (owner-scores :
`10 = best / lowest risk`) et le thème garde donc les valeurs basses ; `computePublicServices` est
bien `10 = déficit maximum` et le thème garde les valeurs hautes. Ce sont les **bornes** qui ont été
écrites contre une échelle que le moteur ne produit pas (ou ne produit plus).

Portée : **4 pages publiées et présentes au sitemap** — les 2 thèmes FR et leurs 2 jumelles EN,
qui réutilisent le `rank()` FR via `frSlug`. Elles ne sont pas cassées : l'état vide est propre
des deux côtés (« Aucune ville ne dépasse les seuils sur ce thème dans le dataset actuel »), et le
titre ne dit plus « Les 0 villes » depuis le correctif ①. Mais une page qui promet un classement
et n'en livre aucun reste du contenu creux, et le hub `/red-flags` les annonce comme les autres.

**Pourquoi je ne corrige pas seul.** Déplacer ces seuils ne bouge pas un score : ça **publie une
liste de villes réelles nommément désignées comme ayant un air chroniquement pollué ou un désert
de services publics**, là où le site n'en nomme aucune aujourd'hui. C'est un acte éditorial plus
lourd que le déplacement d'un chiffre, et il relève de l'arbitrage humain.

**Correction proposée**, au choix et par thème :

- **Recaler le seuil sur la distribution réelle.** Mesuré ce run, pour éviter d'avoir à le
  redécouvrir :

  | Seuil envisagé | Villes éligibles |
  |---|---|
  | air `<= 6,0` | **70** |
  | air `<= 6,5` | 97 |
  | services publics `>= 4,5` (pop ≥ 10 000) | **14** |
  | services publics `>= 5,0` (pop ≥ 10 000) | 1 |

  Côté air, `<= 6,0` est le candidat naturel : les **57 villes au plancher 5,5** se répartissent en
  Hauts-de-Seine (26), Métropole de Lyon (15), Haute-Savoie (7), Isère (7), Paris (1) et Rhône (1)
  — c'est-à-dire **exactement** les cuvettes alpines, le bassin parisien dense et le couloir
  rhodanien que les bonus de gravité du thème nomment déjà. Le classement retrouverait donc les
  villes qu'il visait. Côté services publics, `>= 5,0` ne rendrait qu'une ville : il faut
  descendre à `>= 4,5` (14 villes) pour que le thème existe.
- **Ou retirer les deux thèmes** de `RED_FLAG_THEMES` (le hub et le sitemap en dérivent tous les
  deux, il n'y a rien d'autre à décâbler) et poser des `301` vers `/red-flags`, comme pour les
  guides dédoublonnés.

La première voie est la plus fidèle à l'intention : les deux sujets sont réels et documentés, seule
la borne est fausse. Elle demande une relecture éditoriale des villes qui remonteraient.

## Signalé, non corrigé ② — `environment-index` arrondit toujours deux fois

Défaut hérité du run du 07/08, **inchangé et toujours ouvert** : re-mesuré ce run, **exactement
22 villes sur 540** publient sur `/environnement` (et sa jumelle `/environment`) un `healthScore`
et un `stressComposite` dont la somme fait **10,1 au lieu de 10,0** — les deux nombres étant rendus
sur la même page, avec leurs deux légendes opposées.

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

Écart : 22 villes bougent de **0,1 point au maximum**. Top 5 de `/environnement` inchangé. Non
appliqué parce que ça déplace un score publié ; le défaut reste documenté en tête de la lib.

---

## Contrôles passés sans rien à signaler

- **Gardes de données** : `npm run integrity` vert (540 villes, 955 guides FR, 619 guides EN,
  0 score brut recopié, 4 212 signaux). `assertUniqueSlugs` charge sans lever des deux côtés.
- **`npm run hreflang:check`** : 39 paires de sous-pages ville, chaque hreflang annoncé a une route
  en face dans le même état d'activation.
- **`npm run sitemap:check`** : FR 29 020 URL / 18 chunks / 131 routes statiques / 86 familles
  dynamiques ; EN 28 478 URL / 21 chunks / 77 routes / 88 familles. Chaque URL déclarée a une page,
  chaque page indexable a une URL — dans les deux sens. Les 84 + 84 pages du croisement mois ×
  profil sont bien déclarées.
- **`npm run parity`** : FR 217 routes / EN 165, **0 route FR sans jumelle EN** au sens du
  contrôle (il ne compare que les familles censées avoir une jumelle ; les 5 familles FR-only
  signalées le 07/08 ne remontent plus).
- **`npm run search-index:check`** : les deux projections sont à jour.
- **Couverture des paires** : `RANKING_META` 19 / `RANKING_EN` 19, zéro clé orpheline de part et
  d'autre. Les cartes de régions (`REGION_EN_DESCRIPTIONS`, `REGION_DESCRIPTIONS`, `REGION_EMOJIS`
  côté hub et côté détail) portent exactement les 18 régions du seed — zéro manquante, zéro
  orpheline.
- **Les 19 classements** : tous triés du meilleur au pire selon le sens de leur propre nom, toutes
  les valeurs dans [0, 10]. Aucun classement vide.
- **Les 33 profils `/pour-qui`** : 660 lignes, score ∈ [6,4 ; 8,8], tri décroissant partout,
  `scoreColor` nourri d'une valeur `10 = bon` — palette correcte.
- **Palettes** : aucun appel à `scoreColor` / `scoreHex` n'est nourri de minutes, de parts 0-1, d'un
  score sur 100 ou d'une gravité brute. Les surfaces EN nommées pour une nuisance passent par
  `hazardColor = (v) => scoreColor(10 - v)`, les FR par une palette par niveau.
- **Thèmes Red Flag maigres** (signalé pour mémoire, sans défaut d'intégrité) : au-delà des deux
  thèmes vides, cinq rendent moins des 12 villes que le `slice(0, 12)` laisse attendre —
  `villes-nuit-tendue` (4), `villes-desert-culturel` (5), `villes-parking-cauchemar` (5),
  `villes-mono-touristiques` (9), `villes-internet-precaire` (10). Rien n'est faux : le seuil filtre
  et il reste ce qu'il reste. À surveiller si l'un descend vers zéro.

---

## Vérification

`npx tsc --noEmit` : **clean**. `npm run integrity` : **vert**. Aucune route ajoutée ou supprimée,
aucun changement de `app/sitemap.ts` — les modifications sont deux fichiers de page et six
en-têtes de lib.

`npm run build` **non lancé**, conformément à CLAUDE.md : en session cloud il tourne plus de 4 h 30
et meurt en ENOSPC sans jamais afficher d'erreur. Les deux fichiers de page touchés sont couverts
par `tsc` et le rendu des deux composants est du JSX statique sans nouvelle dépendance de données.

Aucun déploiement (manuel, hors périmètre de l'agent).
