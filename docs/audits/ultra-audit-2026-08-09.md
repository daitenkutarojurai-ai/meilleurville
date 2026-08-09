# Ultra-audit hebdomadaire — 2026-08-09

Audit autonome du dimanche. 50 commits depuis le dernier audit (2026-08-02).

**Le run a trouvé `main` non-buildable.** Le commit `ae08069` d'hier soir
(vacances-célibataire batch 2, 22 h 07 UTC) référençait deux guides inexistants
dans des `relatedGuides` : `assertKnownSlugs` lève au chargement de
`data/guides.ts`, donc `npm run build` **et** `npm run dev` échouaient tous les
deux, et `npx tsc --noEmit` ne le voyait pas — c'est un contrôle d'exécution.
Corrigé (§2.1). Notification envoyée au moment de la découverte, sans attendre la
fin de l'audit.

Sept autres défauts trouvés, six corrigés. Aucun secret commité, aucune fuite
inter-utilisateur, aucun canonical vers un domaine d'aperçu.

⚠️ **`npm run build` n'a pas été lancé**, conformément à `CLAUDE.md` § Commands
(mise à jour du 2026-08-08) : depuis une session cloud la génération tourne
au-delà de 4 h 30 sans jamais atteindre la finalisation, et meurt en `ENOSPC`.
La validation passe par `npx tsc --noEmit`, les vérificateurs du dépôt
(`hreflang:check`, `search-index:check`, `parity`) et des scripts `npx tsx` qui
importent les modules réels — c'est ce dispositif qui a attrapé §2.1, qu'un build
aurait signalé cinq heures plus tard.

---

## 1. Vérifié — conforme

### Sync + outillage
- `git checkout main && git pull --rebase origin main` — à jour, arbre propre.
  Aucun `stash`, aucun force-push.
- `npm install` — 0 vulnérabilité annoncée.
- `npx tsc --noEmit` — **0 erreur**, avant et après les corrections.
- `npm run hreflang:check` — OK. 39 sous-pages ville FR, 40 EN (dont `overview`
  sans jumelle FR), 39 paires déclarées ; chaque hreflang annoncé a une route en
  face, dans le même état d'activation. C'est le chantier §2.1 de l'audit
  précédent, désormais outillé et clos.
- `npm run search-index:check` — à jour (FR 933 / EN 555) après correction §3.7.
- `npm run parity` — FR 215 routes · EN 160.
- `npm run lint` — 343 problèmes (298 erreurs, 45 avertissements), même profil
  qu'annoncé dans `CLAUDE.md` : `@next/next/no-html-link-for-pages` (inoffensif
  sous `output: "export"`) et `react/no-unescaped-entities`. Aucun bug d'exécution.

### Complétude des routes (étape 2)
Les deux défauts cherchés séparément — route sans entrée sitemap, entrée sitemap
sans route. Le sitemap a été **rendu en entier**, chunk par chunk, dans les deux
locales, et les URL confrontées à l'arbre de fichiers.

| Contrôle | FR | EN |
|---|---|---|
| Chunks rendus | 18 | 21 |
| URL émises | 28 910 | 28 312 |
| URL en double | 0 | **1 → corrigé (§2.3)** |
| URL hors domaine canonique | 0 | 0 |
| Têtes d'URL sans répertoire de route | 0 (72 têtes) | 0 (70 têtes) |

Familles vérifiées slug par slug, dans les deux sens :

| Famille | Routes | Sitemap | Écart |
|---|---|---|---|
| `red-flags/villes-*` (FR) | 35 répertoires | 35 `RED_FLAG_THEME_SLUGS` | aucun |
| `red-flags/themes/*` (EN) | 28 `enSlug` | 28 littéraux | aucun |
| `classements/*` (FR) | 13 répertoires + 19 `RANKING_META` | idem | aucun |
| `for-who/*` (EN) | 13 `EN_PROFILES` | 13 | aucun (dérive corrigée le 02/08) |
| Sous-pages ville | 39 FR / 40 EN | 39 / 40 | aucun |
| `villes/*/biodiversite` | 540 | 540 | aucun |

Aucune page n'est garée en `page.pending.tsx` : les deux sous-pages biodiversité
sont dégarées et complètes (§4.1).

### Intégrité des données (étape 4 — sondage)
- **540 villes**, 0 violation : `global ∈ [2,8 – 8,6]`, les 8 axes finis dans
  `[0, 10]`. 0 slug dupliqué dans le seed.
- Guides : **FR 933**, **EN 555**, 0 slug dupliqué de part et d'autre.
- **Références fantômes** balayées sur tout le dépôt : `guides.relatedCities`
  (0), `guides-en.relatedCities` (0 sur 2 136 refs), `EXPAT_COUNTRIES`
  `bestSuitedCities` (0 sur 159), `SEO_PAIRS` (0 sur 1 444), `SEO_TRIPLETS`
  (0 sur 147), `ORIGIN_SLUGS` (0). Seul `guides.relatedGuides` était cassé — §2.1.
- **Parité FR/EN sur 3 villes tirées** (Besançon, Le Havre, Cayenne) : les deux
  arbres lisent le même `CITIES_SEED` et affichent donc les mêmes nombres.

  | Ville | Global | Sécurité | Transport | Nature |
  |---|---|---|---|---|
  | Besançon | 6,5 | 5,7 | 7,0 | 6,4 |
  | Le Havre | 5,5 | 4,5 | 6,2 | 5,0 |
  | Cayenne | 3,9 | 3,7 | 3,3 | 7,8 |

- Direction des scores : les trois pages EN de nuisance (`noise`,
  `natural-risks`, `water`) passent bien par `hazardColor = scoreColor(10 - s)`.
  Le correctif `c77e4f2` de la semaine tient.
- Couvertures : biodiversité **540/540** (contre 302 la semaine dernière),
  actualités F64 **540/540**, zones protégées INPN **0/540** (inchangé).

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt ne remonte que des rapports
  d'audit ; aucun préfixe `xkeysib-` / `sk-ant-` / `ghp_` / `AKIA…` dans les
  sources suivies. Seul `.env.example` est versionné.
- **Validation à la frontière** : les 20 handlers du Worker ont été passés en
  revue un par un. Tout POST public combine rate-limit et validation — zod
  (`/comments`, `/contact`, `/feedback`, `/newsletter`, `/reviews`) ou contrôle
  manuel explicite (`EMAIL_RE`, `HANDLE_RE`, `/^[a-z0-9-]{1,80}$/`, honeypot,
  plafond de 254 caractères sur l'email, 20 ko sur une projection). Le
  `/api/quiz` corrigé le 02/08 tient.
- **Aucune fuite inter-utilisateur** : `handleFavorites`, `handleProjections`,
  `handleAccount`, `handleAuthHandle`, `handleAlertesList` passent tous par
  `authedUser(request)` puis scopent sur `user.id` / `user.email`.
- Le seul chemin d'écriture non validé **au handler** — `handleFavorites` POST
  avec `merge: string[]` — l'est **dans le store** : `mergeFavorites` filtre sur
  `/^[a-z0-9-]{1,80}$/` et plafonne à 200 entrées. Pas un défaut.
- `app/robots.ts` : `/api/`, `/admin/`, `/auth` en `Disallow` ; `/dashboard`,
  `/favoris`, `/mes-villes`, `/connexion`, `/auth/callback` et leurs jumelles EN
  (`/my-account`, `/sign-in`) en **noindex par metadata**, jamais par `Disallow`
  — le bon choix, documenté dans le fichier. Chunks dérivés de
  `SITEMAP_CHUNK_COUNT`, pas de dérive possible.

### Performance (étape 5)
Balayage transitif des **83 composants client** (imports de valeur, 6 niveaux de
profondeur) pour trouver les modules de données lourds qui atteindraient le
bundle. Trois chemins seulement, tous connus et modestes :

```
components/SearchPalette.tsx              → @/data/cities-seed          (588 Ko source)
components/SearchPalette.tsx → rankings   → @/data/cities-seed
app/vacances/quiz/QuizFlow.tsx → climate-normals → climate-normals-raw  (45 Ko)
```

Aucun composant client ne touche `@/data/guides` ni `@/data/guides-en` : le
correctif `46358bd` (5,9 Mo → 668 Ko) n'a pas régressé, et les 4,5 Mo de JSON
ajoutés cette semaine (`city-biodiversity` 1,9 Mo, `city-news` 1,7 Mo) restent
côté serveur. Aucune trace de `framer-motion` à l'import (cf. §4.5).

---

## 2. Cassé — trouvé cette semaine

### 2.1 🔴 `main` non-buildable depuis hier soir — corrigé

`ae08069` (2026-08-08 23 h 07 UTC) a livré la série `vacances-celibataire-*`
batch 2 avec deux `relatedGuides` pointant vers des guides qui n'existent pas :

```
data/guides.ts:44593  "vivre-sans-voiture-aix-en-provence-guide-2026"
data/guides.ts:44638  "vivre-sans-voiture-angers-guide-2026"
```

La série `vivre-sans-voiture-*` couvre 16 villes et **ni Aix ni Angers n'en font
partie**. `assertKnownSlugs` (`lib/data-integrity.ts:39`) lève au chargement du
module dès que `NODE_ENV !== "production"` ou que `NEXT_PHASE` vaut
`phase-production-build` : `next build` et `next dev` mouraient l'un comme
l'autre sur

```
Error: [data-integrity] guides.relatedGuides: 2 ghost slugs referenced
```

Le garde a fait exactement son travail — c'est la boucle de rétroaction qui a
manqué. `npx tsc --noEmit` est propre sur ce fichier (un tableau de chaînes est
bien typé), et depuis une session cloud le build ne peut plus servir de filet
(4 h 30 sans finalisation). Un batch de contenu peut donc casser le build sans
que rien ne le dise avant le déploiement.

Remplacés par deux guides réels et topiquement adjacents — les deux textes
s'appuient explicitement sur la population étudiante de leur ville :
`universites-aix-en-provence-2026` et `etudiant-a-angers-2026`.

### 2.2 🟠 Le corpus EN n'avait aucun garde sur ses références de villes — corrigé

`data/guides.ts` valide `relatedCities` **et** `relatedGuides` depuis juin.
`data/guides-en.ts` ne validait que l'unicité des slugs : ses 2 136 références
`relatedCities` n'étaient contrôlées par rien. Or ce champ pilote la remontée
inverse qui affiche un guide sur les pages ville et région EN — un slug fantôme
y est **filtré en silence**, le guide n'apparaît jamais et rien ne dit pourquoi.

L'asymétrie était sans conséquence aujourd'hui (0 fantôme sur 2 136, vérifié),
mais c'est précisément la classe de bug de §2.1, du côté qui n'était pas gardé.
`assertKnownSlugs` ajouté, symétrique du FR. Les guides EN ne portent pas de
champ `relatedGuides` — les liens croisés sont calculés par
`lib/guide-suggestions-en.ts` — donc il n'y a rien d'autre à contrôler.

### 2.3 🟠 URL en double dans le sitemap EN — corrigé

`https://bestcitiesinfrance.com/quality-of-life` était émis **deux fois**, par
deux sections différentes et avec des signaux contradictoires :

| Émetteur | changeFrequency | priority |
|---|---|---|
| bloc EN statique (`app/sitemap.ts:952`) | `weekly` | 0.7 |
| `enQualityOfLifeSection()` (l. 1323) | `monthly` | 0.75 |

Trouvé en rendant les 21 chunks et en dédupliquant les 28 313 URL. C'est la même
classe que le bug de slug dupliqué corrigé sur les guides en juin : deux
déclarations, la seconde silencieuse. L'entrée du bloc statique est retirée ; la
section dédiée reste, avec ses six macro-régions. Un commentaire d'ancrage
explique pourquoi le hub n'est pas dans la liste plate.

Contrôle après correction : **0 doublon des deux côtés**, 28 910 URL FR et
28 312 EN.

### 2.4 🟠 Les titres de `/comparer/[pair]/synthese` n'avaient pas le repli de leur jumelle EN — corrigé

La jumelle EN `app/[locale]/compare/[pair]/synthesis` porte un `fitTitle(long,
short)` qui bascule sur un gabarit court au-delà de 60 caractères. La page FR,
livrée d'abord, ne l'avait pas :

```
97 titres sur 771 dépassaient 60 caractères, jusqu'à 77
77  Saint-Chély-d'Apcher vs Florac-Trois-Rivières · synthèse 8 axes comparée 2026
```

Conformément à l'arbitrage §4.3 de l'audit précédent, ce qui se faisait couper
était la queue de mots-clés et jamais les deux villes — ce n'est donc pas le bug
historique du suffixe de marque. Mais le repli existait déjà dans le dépôt, à
trois lignes de là, dans la version anglaise du même écran. Copié tel quel :
**97 → 4** titres au-delà de 60 (63 caractères au pire, sur des paires de
communes à nom très long). Les descriptions étaient déjà toutes sous 160.

### 2.5 🟠 Les pages biodiversité annonçaient une collecte en cours qui est terminée — corrigé

Les deux sous-pages, dégarées le 06/08 sur 302 villes, portent un paragraphe
« À quoi la ville est comparée » / « What the city is compared to » qui expliquait
honnêtement le biais du moment :

> la collecte est en cours et elle a commencé par les communes les plus peuplées

Le runner local a fini depuis : `data/city-biodiversity.json` couvre **540/540**
villes, dont **513 mesurables**. La phrase est devenue fausse, et fausse dans le
sens qui compte — elle dit au lecteur que la base de comparaison est un
sous-ensemble biaisé alors qu'elle est complète, et impute à un trou de collecte
les 27 villes non classées, qui sont en réalité écartées par les seuils d'effort
et de précision énoncés deux paragraphes plus haut. Le paragraphe citait aussi
un instantané « à 182 villes » qui n'a plus de sens comme point de comparaison.

Réécrit dans les deux langues. Les compteurs affichés étaient déjà dérivés
(`BIODIVERSITY_MEASURABLE_COUNT`) : c'est le récit autour qui avait vieilli.

### 2.6 🟠 Le workflow social quotidien publie des scores qui contredisent le site

`n8n/workflows/social-media-daily.json` — ajouté le 2026-08-02, donc bien vivant
— poste chaque jour sur Facebook, Instagram, LinkedIn, Threads et X une « ville
du jour » avec son score. Les 30 scores sont **écrits en dur dans le nœud
JavaScript**, et **27 sur 30 sont en désaccord avec le pipeline** :

```
bayonne       publié 7,5   réel 5,9   écart 1,6
montpellier   publié 6,9   réel 5,6   écart 1,3
perpignan     publié 6,0   réel 4,7   écart 1,3
nimes         publié 6,3   réel 5,1   écart 1,2
toulon        publié 6,2   réel 5,0   écart 1,2
nice          publié 6,5   réel 5,4   écart 1,1
strasbourg    publié 6,7   réel 7,5   écart −0,8
annecy        publié 7,8   réel 7,3   écart 0,5
… 19 autres entre 0,1 et 0,4
```

Un post annonce « Bayonne 7,5/10 » et renvoie vers une page qui affiche 5,9. Le
même nœud annonce « 352 villes analysées » (quatre fois) là où le seed en compte
540 — le chiffre de l'époque où la série `10-choses-a-faire` était encore
métropolitaine.

**Corrigé** : l'hôte (`mavilleideale.fr` → `www.`, l'apex étant 301 par
`worker/index.ts`) et la marque en prose (`MaVilleIdeale` → `MaVilleIdéale`,
3 occurrences), l'orthographe purgée le 2026-07-27 ayant manqué ce fichier
puisqu'il n'existait pas encore.

**Non corrigé, volontairement** : les scores et le compte de villes. Les remettre
à jour à la main les rendrait justes aujourd'hui et faux au prochain
recalibrage — la vraie correction est de **dériver le tableau du seed** au lieu
de le recopier, et elle déplace 27 nombres publiés d'un coup sur un canal
sortant. C'est un arbitrage propriétaire (§4.2). Les hashtags `#MaVilleIdeale`
(3 occurrences) sont laissés tels quels : un hashtag est un identifiant public,
l'accentuer en crée un nouveau et coupe l'historique du précédent.

### 2.7 🟡 `ACTIVITY_SLUGS` recopié à la main dans les deux sections vacances — corrigé

Les blocs `/vacances` et `/vacations` du sitemap retapaient les 10 slugs
d'activité alors que `generateStaticParams` des deux routes dérive de
`ACTIVITIES` (`lib/vacation-activities.ts`). Les listes coïncidaient encore,
mais c'était le dernier endroit du bloc vacances où elles pouvaient diverger —
`PROFILE_SLUGS` est dérivé depuis F61 précisément parce qu'il avait dérivé.
Sortie identique, vérifiée : 10 URL de chaque côté.

### 2.8 🟠 Il n'existait aucun contrôle entre un batch de contenu et le déploiement — corrigé

C'est la cause racine de §2.1, pas seulement son symptôme. Les gardes
d'intégrité ne tournent qu'au chargement des modules, c'est-à-dire au
`next build` et au `next dev`. `npx tsc --noEmit` ne les voit pas — un tableau de
chaînes est bien typé, qu'il pointe vers un guide existant ou non — et depuis le
2026-08-08 le build n'est plus lançable ici. Entre le commit d'un batch et le
déploiement, plus rien ne regardait.

Ajouté `npm run integrity` (`scripts/check-integrity.mjs`) : il transpile et
exécute les vrais `data/cities-seed.ts`, `data/guides.ts` et
`data/guides-en.ts`, donc les vraies gardes, avec un résolveur `@/` récursif —
même motif que `scripts/build-search-index.mjs`, aucune règle réimplémentée.
Ajouter une garde dans un module de données la fait couvrir ici sans toucher au
script. **Deux secondes** contre les cinq heures d'un build.

Vérifié en réintroduisant le slug fantôme de §2.1 : sortie `ÉCHEC`, message
complet, `exit 1`. Puis remis en état, `exit 0`.

Au passage, le message d'erreur d'`assertKnownSlugs` disait toujours
`not declared in CITIES_SEED` **quel que soit le référentiel contrôlé** — il
envoyait donc chercher un slug de guide dans le seed des villes, ce qui coûte une
minute de confusion au moment précis où on en a le moins. Nouveau paramètre
optionnel `knownLabel`, renseigné sur l'appel `guides.relatedGuides`.

### 2.9 🟡 Mon propre correctif §2.2 a cassé `search-index:check` — corrigé dans la foulée

`scripts/build-search-index.mjs` charge `data/guides-en.ts` avec un `require`
maison qui refuse tout import non prévu. En ajoutant `@/data/cities-seed` au
module EN, j'ai fait tomber le builder d'index (`import non prévu`). Le stub
existait déjà pour le chemin FR ; ajouté à l'identique pour le chemin EN. C'est
le vérificateur qui l'a attrapé, comme prévu.

---

## 3. Corrigé

8 fichiers. `npx tsc --noEmit`, `hreflang:check`, `search-index:check` et le
rendu complet des deux sitemaps propres après coup.

| # | Correction | Fichier |
|---|---|---|
| 1 | 2 `relatedGuides` fantômes → guides réels ; le build repasse | `data/guides.ts` |
| 2 | `assertKnownSlugs` sur `guides-en.relatedCities` (2 136 refs, 0 fantôme) | `data/guides-en.ts` |
| 3 | `/quality-of-life` émis une seule fois dans le sitemap EN | `app/sitemap.ts` |
| 4 | `ACTIVITY_SLUGS` dérivé de `ACTIVITIES` dans les deux blocs vacances | `app/sitemap.ts` |
| 5 | `fitTitle()` sur la synthèse comparative FR (97 → 4 titres > 60) | `app/comparer/[pair]/synthese/page.tsx` |
| 6 | Paragraphe « à quoi la ville est comparée » remis à la couverture réelle | `app/villes/[slug]/biodiversite/page.tsx` |
| 7 | Idem, jumelle EN | `app/[locale]/cities/[slug]/biodiversity/page.tsx` |
| 8 | Hôte canonique + marque accentuée dans le workflow social | `n8n/workflows/social-media-daily.json` |
| 9 | **`npm run integrity`** — rejoue les gardes hors build, 2 s | `scripts/check-integrity.mjs` (nouveau), `package.json` |
| 10 | `knownLabel` sur `assertKnownSlugs` : le message n'envoie plus systématiquement vers `CITIES_SEED` | `lib/data-integrity.ts`, `data/guides.ts` |
| 11 | Stub `cities-seed` côté EN dans le builder d'index | `scripts/build-search-index.mjs` |

**Rien de touché** qui déplace un score publié, aucun refactor structurel, aucune
migration D1. **Aucun déploiement.**

---

## 4. À arbitrer

### 4.1 Le classement biodiversité est désormais publiable

`CLAUDE.md` fixait la condition : pas de `/classements/biodiversite` sous ~300
villes mesurables. On était à 278 le 06/08 ; le crawl a fini et on est à **513
mesurables sur 540**, au-dessus du seuil avec une marge confortable
(`MIN_CALIBRATION_CITIES = 100` est franchi depuis longtemps).

Ce qui bloque encore, et qui n'est pas une question de volume :
`biodiversityProfile().overall` reste `null` parce que les **zones protégées
INPN pèsent 0,45 de l'agrégat et sont à 0/540**. Un classement ne peut donc pas
porter sur « la biodiversité » — il porterait sur la richesse rapportée à
l'effort, ce qui est un autre nom et doit être dit tel quel dans le titre, le
`h1` et la légende. Deux options honnêtes : publier
`/classements/richesse-biologique` sur la composante qu'on mesure vraiment, ou
attendre l'ingest INPN. Ne pas repondérer deux composantes sur trois pour
fabriquer un `overall` — la note en tête de `lib/biodiversity.ts` le dit déjà.

L'ingest INPN est bloqué par la même chose que la semaine dernière : les
shapefiles sont derrière une page de téléchargement, donc `local-data-runner.sh`
saute l'étape tant que les GeoJSON ne sont pas dans
`.cache/city-protected-areas/sources/` (`npm run protected-areas:sources` donne
la ligne `ogr2ogr`). Rien à faire côté routine — l'egress y est refusé.

### 4.2 Le workflow social doit dériver ses chiffres du seed (§2.6)

27 scores faux publiés quotidiennement, jusqu'à 1,6 point d'écart, sur un canal
qui renvoie vers la page qui les contredit. Le correctif est le même motif que
partout ailleurs dans le dépôt : générer le tableau depuis `CITIES_SEED` plutôt
que le recopier — soit par un script qui régénère le nœud JS, soit en faisant
appeler au workflow un endpoint du Worker qui rend la ville du jour. Tant que
c'est recopié à la main, ça redérivera au prochain recalibrage. Le compte
« 352 villes » (→ 540) part avec.

### 4.3 R7.10 : deux séries récentes au-dessus de la cible em-dash

Le corpus FR entier est **à la cible : 0,99 em-dash / 200 mots** sur 933 guides.
Mais la moyenne cache deux séries livrées ces trois dernières semaines :

```
vacances-monoparentales-    7 guides   2,60 / 200 mots
parent-solo-a-             20 guides   1,90 / 200 mots
vacances-celibataire-      15 guides   0,00 / 200 mots
```

Ce ne sont pas des séparateurs structurels : ce sont des tirets de prose, et on
trouve le motif que R7.10 interdit nommément — deux dans une même phrase
(« plus léger qu'à Rennes ou Nantes — on marche beaucoup — et le coût logement… »,
`vacances-monoparentales-vannes-2026`). Plusieurs `heading` les utilisent aussi
comme ponctuation de titre. 27 guides à repasser, à la main et fichier par
fichier comme le prescrit `CLAUDE.md` — pas de `sed` global. Que
`vacances-celibataire-` soit à zéro montre que c'est une dérive d'auteur, pas de
gabarit.

### 4.4 Parité FR→EN : `/guides/categorie/[categorie]` sans jumelle

`npm run parity` remonte 5 routes FR sans équivalent EN. Quatre sont des choix
assumés de longue date (`/avis`, `/cgu`, `/presse`, `/quitter`). La cinquième est
neuve : le hub de catégories de guides livré le 06/08 par `0345b3a`
(`/guides/categorie/[categorie]`, 7 URL) n'existe pas côté anglais alors que
`EN_GUIDE_CATEGORIES` est déjà défini et que les 555 guides EN sont catégorisés.
C'est du maillage interne gratuit, mais c'est une route à créer — hors périmètre
« correction sûre ».

Signalé aussi par l'outil : `/projection-5ans` est servi tel quel sur le domaine
anglais, slug français compris.

### 4.5 `framer-motion` toujours déclaré dans `package.json`

Inchangé depuis l'audit du 02/08 : `package.json:29` déclare
`framer-motion@^12.38.0` et **aucun fichier ne l'importe**. Zéro octet n'atteint
le bundle ; c'est du poids mort d'installation. `npm uninstall` est sans risque
mais touche `package-lock.json`, que ~15 agents modifient dans la semaine — à
faire dans une fenêtre calme, pas depuis une routine du dimanche.

### 4.6 `metaDesc` > 160 dans les sources : 339 FR / 113 EN — **pas un défaut**

Vérifié plutôt que reporté : `app/guides/[slug]/page.tsx:49` passe systématiquement
par `clampMeta()`, qui coupe sur une frontière de phrase ou de proposition. Les
balises servies sont donc conformes ; c'est la copie source qui est plus longue,
et c'est voulu — elle sert aussi de texte de carte sur `/guides`. Même
raisonnement pour les 7 `metaTitle` de la semaine au-delà de 60 : leur segment de
tête plafonne à 37 caractères, donc la ville et l'année survivent toujours à la
troncature. Aucune action.

### 4.7 F63 qualité de l'air : rien de neuf

`lib/air-quality.ts` reste entièrement heuristique. Les légendes disent
correctement ce qu'elles font depuis le 02/08. Le fond attend la donnée ATMO /
Geod'Air, qui demande une passe locale.

---

## 5. Écarts avec le prompt de la routine

Un seul, et il faut le consigner : **l'étape 1 demande `npm run build`, ce que
`CLAUDE.md` interdit désormais depuis une routine** (§ Commands, note du
2026-08-08 : plus de 4 h 30 sans finalisation, `.next` à 25 Go, `ENOSPC`). J'ai
suivi `CLAUDE.md`. Le substitut — `tsc`, les trois vérificateurs du dépôt, et des
scripts `tsx` qui importent les modules réels — a trouvé en une minute le défaut
§2.1 qu'un build aurait signalé après cinq heures, s'il était allé au bout.

Deux enseignements pour la suite :
- Le trou que §2.1 a révélé — aucun contrôle entre le commit d'un batch et le
  déploiement — est **comblé** : `npm run integrity` (§2.8). **Tout agent de
  contenu doit le lancer avant de pousser**, au même titre que
  `npm run search-index` après un guide EN. C'est deux secondes.
- Le reste du prompt décrit fidèlement la stack (Cloudflare, D1,
  `worker/index.ts`, pas de `proxy.ts`). Rien d'autre à corriger — sauf l'étape 1,
  dont le `npm run build` devrait devenir « `npx tsc --noEmit` +
  `npm run integrity` + les vérificateurs du dépôt » tant que le build ne tient
  pas dans une session cloud.
