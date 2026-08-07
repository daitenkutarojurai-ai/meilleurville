# Intégrité des données — run du 2026-08-07

Agent « intégrité des données », run autonome. Objet : qu'aucun chiffre publié ne se contredise
lui-même — direction du score conforme au nom de la métrique, jumelles hreflang d'accord sur le
même nombre, légende et couleur qui disent la même chose que le chiffre.

**Résultat : 2 défauts réels trouvés et corrigés, 1 défaut signalé sans correction (il déplace un
score publié), 0 divergence FR/EN sur les valeurs.**

---

## Méthode

Les chiffres ne sont pas lus à l'œil ni dérivés d'un `grep` du seed. Les libs et le seed ont été
compilés en CommonJS avec un `tsc -p` de scratch (hook de résolution `@/`, cf. pattern des
palmarès), puis les **vraies fonctions** ont été appelées et les expressions d'affichage de chaque
page FR et de sa jumelle EN rejouées à l'identique.

Périmètre effectivement parcouru :

- **540 villes** (pas seulement l'échantillon de 10 demandé — le harnais permettait le balayage
  complet, autant le faire).
- **39 paires de sous-pages ville** FR ↔ EN + les hubs nationaux `/securite`, `/sante`, `/emploi`,
  `/demographie`, `/services-publics`, `/risques`, `/environnement`, `/cadre-de-vie`,
  `/tension-locative`, `/commerces`, `/sport`, `/velo` et leurs jumelles EN, plus les pages
  `[macroregion]`.
- **12 moteurs** : `safety-deep`, `healthcare-access`, `employment-market`, `public-services`,
  `demography`, `air-quality`, `noise-exposure`, `water-stress`, `natural-risks`,
  `cycling-mobility`, `sport-leisure`, `commerce`, plus `environment-index` et
  `quality-of-life-index` en composites.

Échantillon de villes retenu pour le tableau de contrôle (profils variés) : Paris, Marseille,
Angers, Mende, La Rochelle, Annecy, Roubaix, Ajaccio, Perpignan, Fort-de-France.

---

## Règle 2 — les jumelles hreflang affichent le même nombre

**29 700 couples de valeurs comparés, 0 écart.**

| Contrôle | Valeurs | Écarts |
|---|---|---|
| 9 surfaces à direction sensible (sécurité, santé, emploi, services publics, démographie, air, bruit, eau, risques) × composite + 4 dimensions × 540 villes | 24 300 | **0** |
| vélo + sport × composite + 4 dimensions × 540 villes | 5 400 | **0** |
| commerces | FR et EN utilisent tous deux `.toFixed(1)` → identiques par construction | — |

Le contrôle porte sur l'**expression rendue**, pas sur la valeur du moteur : côté FR les pages
écrivent `(10 - x).toFixed(1)`, côté EN `Math.round((10 - x) * 10) / 10` puis `.toFixed(1)`. Les
deux formes ne sont **pas** équivalentes en général (`7.55` sort à `7.5` par `toFixed` et à `7.6`
par `Math.round`, l'écriture binaire tombant juste en dessous du demi) — c'est un piège latent
réel, mais aucune valeur du site ne tombe aujourd'hui sur une de ces frontières. Rien à corriger,
seulement à savoir : si un jour un barème est retouché, ce contrôle est celui qui le rattrapera.

Tableau de contrôle sur l'échantillon (composites, colonne unique = FR et EN d'accord) :

| Ville | Sécurité | Santé | Emploi | Serv. pub. | Démogr. | Air | Bruit | Eau | Risques | Vélo | Sport | Commerces |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Paris | 3,2 | 7,9 | 7,2 | 7,9 | 6,3 | 5,1 | 5,8 | 2,5 | 2,3 | 6,3 | 6,7 | 8,8 |
| Marseille | 3,6 | 7,9 | 5,8 | 7,7 | 6,3 | 2,7 | 6,8 | 8,3 | 6,6 | 6,0 | 8,3 | 7,9 |
| Angers | 5,5 | 7,9 | 6,0 | 8,4 | 7,5 | 5,6 | 4,2 | 4,5 | 2,3 | 8,0 | 6,7 | 7,5 |
| Mende | 8,7 | 3,0 | 5,2 | 5,4 | 4,9 | 6,7 | 1,7 | 7,3 | 2,9 | 4,3 | 5,6 | 4,9 |
| La Rochelle | 6,1 | 5,7 | 4,6 | 7,4 | 6,0 | 5,7 | 3,4 | 6,3 | 5,4 | 7,8 | 6,2 | 7,1 |
| Annecy | 6,3 | 6,2 | 6,5 | 8,2 | 6,6 | 4,2 | 3,4 | 3,1 | 2,4 | 6,6 | 8,5 | 7,6 |
| Roubaix | 3,6 | 5,7 | 4,1 | 8,0 | 7,5 | 6,0 | 4,0 | 2,5 | 1,5 | 6,5 | 5,5 | 6,2 |
| Ajaccio | 5,0 | 5,7 | 4,6 | 7,4 | 6,9 | 4,2 | 3,4 | 8,4 | 4,3 | 5,2 | 6,6 | 6,4 |
| Perpignan | 4,3 | 6,2 | 3,9 | 8,2 | 5,1 | 3,7 | 3,4 | 7,6 | 4,8 | 7,8 | 7,4 | 6,7 |
| Fort-de-France | 4,1 | 7,1 | 3,0 | 7,1 | 4,1 | 5,6 | 3,4 | 6,2 | 3,8 | 6,5 | 5,4 | 6,7 |

Colonnes « Bruit / Eau / Risques » : nuisances, donc `10 = pire`, sans inversion — c'est la valeur
correcte. Les autres sont nommées pour une qualité et sont inversées à l'affichage.

---

## Corrigé ① — trois sous-pages FR n'énonçaient pas ce que 10 signifie

`/villes/[slug]/bruit`, `/villes/[slug]/eau`, `/villes/[slug]/risques` affichaient le composite brut
du moteur — **direction correcte** (ce sont des nuisances) — mais **aucune légende** sur la page :
ni « 10 = », ni « maximale », ni dans l'intro, ni sous le grand chiffre. Un lecteur voyait
« Stress hydrique à Ajaccio — 8,4/10 » et n'avait aucun moyen de savoir que 8,4 est une mauvaise
nouvelle. Les jumelles EN, elles, portent la mention depuis leur correction : « (10 = loudest) »,
« (10 = most stressed) », « (10 = most exposed) ». Les deux faces d'une paire hreflang ne
racontaient donc pas la même chose, alors qu'elles affichent le même nombre.

C'est aussi une anomalie interne au FR : les hubs nationaux `/risques` (« 10 = exposition
maximale »), `/sport` et `/velo` (« 10 = excellent ») énoncent tous leur convention, et les
sous-pages ville nommées pour une qualité (`air`, `sante`, `emploi`, `services-publics`,
`demographie`, `securite`, `commerces`) aussi. Les trois pages de nuisance étaient les seules
muettes.

Ajouté sous le composite, dans la forme déjà utilisée par `/villes/[slug]/sante` :

- bruit — « 10 = exposition au bruit maximale · 0 = commune silencieuse. »
- eau — « 10 = stress hydrique maximal · 0 = ressource confortable toute l'année. »
- risques — « 10 = exposition aux aléas maximale · 0 = aucun aléa majeur identifié. »

Aucun chiffre n'a bougé. Les couleurs de ces pages passent déjà par des palettes par niveau
(`NOISE_LEVEL_COLOR` & co), pas par `scoreColor` : rien à reprendre de ce côté.

**Portée : 1 620 pages FR (540 villes × 3).**

## Corrigé ② — la couleur du taux de chômage était inversée, sur les deux locales

`/villes/[slug]/statistiques` et sa jumelle `/cities/[slug]/statistics` affichent une carte « Taux
de chômage » dont la couleur vient de `TONE_COLOR`, une palette de **qualité**
(`haut` = émeraude → `tres-bas` = rouge). `unemploymentBracket()` attribuait ses jetons comme s'ils
décrivaient le **niveau de chômage**, pas la qualité. Résultat, aux deux extrémités :

| Tranche | Libellé affiché | Couleur avant | Couleur attendue |
|---|---|---|---|
| < 5,5 % de chômage | « très bas » | **orange** | vert émeraude |
| 8 – 10 % | « élevé » | **vert émeraude** | orange |

Les mots étaient justes, la couleur disait le contraire. Le milieu du barème (`5,5-7 %` → lime,
`7-8 %` → ambre) et l'extrémité haute (`> 10 %` → rouge) étaient corrects, ce qui confirme
l'intention : c'est bien une palette de qualité, et seuls les deux jetons `haut`/`bas` avaient été
permutés. Le même défaut existait mot pour mot côté EN (`low`/`high` dans `UNEMP_LABEL`), donc les
deux jumelles étaient fausses **de la même façon** — c'est pourquoi le contrôle hreflang ne pouvait
pas l'attraper, et pourquoi la règle 3 existe séparément.

Correction : jetons remis dans l'ordre de qualité dans `unemploymentBracket()`, et table de
libellés réalignée des deux côtés pour que **le texte affiché reste exactement le même**. Seule la
couleur change.

**Portée : 127 villes sur 540 × 2 locales = 254 pages** — 12 villes passaient d'orange à vert
(Laval, Rodez, Millau, Aurillac, Mende…) et 115 de vert à orange (Toulouse, Nice, Aix-en-Provence,
La Rochelle, Rochefort…).

## Corrigé ③ — blocs `**Convention**` manquants

Neuf libs de hazard portaient leur direction en prose mais pas sous le bloc `**Convention**` que le
reste du site utilise comme point d'entrée. Ajouté à : `natural-risks`, `water-stress`,
`air-quality`, `noise-exposure`, `healthcare-access`, `employment-market`, `housing-tension`,
`quality-of-life-index`, et `environment-index` (qui est la forme de référence et méritait de le
dire explicitement). Chaque bloc précise la direction, si la surface doit inverser ou non, et par
quelle palette passer la couleur. Commentaires seuls, zéro changement de comportement.

---

## Signalé, non corrigé — `environment-index` arrondit deux fois

`computeEnvironmentIndex()` calcule `healthScore` en arrondissant `10 − stress` **avant** que
`stress` ne soit lui-même arrondi, puis arrondit `stress` séparément pour `stressComposite`. Les
deux nombres sont publiés **sur la même page** (`/environnement` et sa jumelle `/environment`
listent « les plus saines » par `healthScore` et « les plus exposées » par `stressComposite`, et les
pages `[macroregion]` font pareil), avec leurs deux légendes opposées. Pour **22 villes sur 540**,
la somme des deux chiffres publiés fait **10,1 et non 10,0** :

```
poitiers  6,0 + 4,1     le-havre  5,9 + 4,2     colmar   6,7 + 3,4
ajaccio   4,5 + 5,6     bayeux    7,1 + 3,0     briancon 6,2 + 3,9
villeurbanne 5,9 + 4,2  longwy    7,3 + 2,8     embrun   6,3 + 3,8
sarlat-la-caneda 6,1 + 4,0   stains 7,0 + 3,1   pierrefitte-sur-seine 7,0 + 3,1   (+10)
```

**Correction proposée** — une ligne dans `lib/environment-index.ts` : dériver la santé du stress
**déjà arrondi**, ce qui rend la relation vraie par construction.

```ts
const stressR = Math.round(stress * 10) / 10;
const health  = Math.round((10 - stressR) * 10) / 10;   // au lieu de (10 - stress)
```

**Écart chiffré** : 22 villes bougent, de **0,1 point au maximum**, jamais davantage. Le top 5 de
`/environnement` est inchangé (Mauriac, Charleville-Mézières, Belfort, Delle, Guéret) ; les
mouvements de rang restent à l'intérieur des blocs d'ex æquo. `healthScore` alimente aussi
`envScore` dans `lib/quality-of-life-index.ts`, donc `/cadre-de-vie` et `/quality-of-life` bougent
du même ordre.

**Pourquoi je ne l'applique pas** : ça déplace un score publié pour un lecteur. Le défaut est
documenté en tête de `lib/environment-index.ts` avec un renvoi vers ce rapport, en attendant
l'arbitrage.

---

## Contrôles passés sans rien à signaler

- **Couverture des paires** : `RANKING_META` 19 / `RANKING_EN` 19, zéro clé orpheline de part et
  d'autre. `REGION_EN_DESCRIPTIONS` 18/18 face aux 18 régions du seed, idem `REGION_DESCRIPTIONS`
  et `REGION_EMOJIS` côté FR — zéro manquante, zéro orpheline.
- **`assertUniqueSlugs`** : `data/guides.ts` (926) et `data/guides-en.ts` (548) chargent sans lever.
- **`npm run hreflang:check`** : chaque hreflang annoncé a une route en face, dans le même état
  d'activation. 39 paires de sous-pages ville déclarées.
- **`npm run parity`** : FR 215 routes / EN 160. Les 5 routes FR sans jumelle EN (`/avis`, `/cgu`,
  `/presse`, `/quitter`, `/guides/categorie/[categorie]`) sont des familles FR-only connues, pas
  des trous d'intégrité — hors périmètre de cet agent, signalé pour mémoire.
- **Sitemap** : les seules routes racine FR absentes de `app/sitemap.ts` sont `/dashboard`,
  `/favoris` et `/mes-villes` — pages de compte, exclues à dessein. Aucune route de contenu
  manquante.
- **Palettes** : balayage des ~200 appels à `scoreColor` / `scoreHex` / `scoreBg`. En dehors du
  chômage (corrigé ci-dessus), aucun n'est nourri d'une valeur de nuisance brute. Les surfaces EN
  nommées pour une nuisance passent bien par `hazardColor = (v) => scoreColor(10 - v)`, les FR par
  une palette par niveau.
- **Moyennes `[macroregion]`** : les composites moyens de `/sante`, `/emploi`, `/services-publics`,
  `/demographie`, `/securite` sont agrégés sur la valeur brute puis inversés **au rendu**, avec la
  légende correspondante. Conforme.
- **Bornes** : `quality-of-life-index` reste dans [0, 10] sur les 540 villes.

---

## Vérification

`npx tsc --noEmit` : **clean**. Aucune route ajoutée ou supprimée, aucun changement de
`app/sitemap.ts` — les modifications sont du contenu de page et des commentaires de lib.
Aucun déploiement (manuel, hors périmètre de l'agent).
