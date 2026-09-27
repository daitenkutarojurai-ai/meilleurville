# Ultra-audit hebdomadaire — 2026-09-27

Audit autonome du dimanche. **16 commits** depuis le dernier audit (2026-09-20) :
quatre passes du collecteur local, deux batches tourisme (FR 50, EN 51), les
séries `parent-solo` / `single-parent` / `solo-travel` / `vacances-celibataire`
refermées à parité, la fiche expat Israël, le palmarès de décembre, le maillage
`amateurs-de-culture` et le correctif F64 du pied de section. Contenu :
**guides FR 1 151 → 1 173, EN 948 → 978**.

Toutes les gardes existantes passent, avant comme après correction. Le run a
trouvé **quatre défauts réels que l'outillage en place ne pouvait pas voir**, en
a corrigé trois, et en laisse un à l'arbitrage parce qu'il touche 239 pages de
contenu :

1. 🟠 **Le docstring de `lib/score-distribution.ts` annonçait encore trois
   constantes fausses du barème de notes.** Le commit `6d5d909` de cette semaine
   est allé corriger ce bloc — et n'a rattrapé **qu'une** de ses quatre
   dérives. Les trois autres décrivaient le moteur qui note les 540 villes avec
   une moyenne cible, un clamp d'axe et un clamp global qui ne sont pas les siens.
2. 🟡 **Un guide FR se citait lui-même dans `relatedGuides`** et rendait donc une
   carte « À lire ensuite » pointant sur la page courante. La fonction sœur
   (`suggestNextGuides`) exclut `current.slug` depuis toujours ; le bloc écrit à
   la main, non.
3. 🟡 **`/pour-qui/amateurs-de-culture` publiait un poids que le moteur ne
   contient pas** : « télétravailleurs (culture 1,5) », alors que ce profil n'a
   **aucune** clé `culture`. Trois des quatre poids cités dans la même phrase
   étaient exacts. C'est la classe de défaut nº 1 du dépôt — un chiffre cité en
   copie que le code démentit.
4. 🟠 **239 guides FR publient `dateModified` antérieur à `datePublished`** dans
   leur JSON-LD `Article`, dans `og:modifiedTime`, dans leur ligne « mis à jour »
   visible et dans le `lastModified` du sitemap. **Non corrigé** : c'est une
   édition de dates sur 239 pages publiées, cf. §4.1.

Aucun secret commité. **0 canonical manquant, 0 vers un domaine d'aperçu, 0
croisé entre locales, 0 page sans `x-default`** sur 872 rendus de
`generateMetadata()` — le correctif du 20/09 tient. **Aucun écart FR/EN sur une
note publiée**, sur 3 428 couples citant un score des deux côtés. 0 lien interne
mort, 0 cible de redirection morte, 0 régression de perf, 0 import de corpus
dans un composant client.

⚠️ **`npm run build` n'a pas été lancé**, conformément à `CLAUDE.md` § Commands.
Substitut détaillé en §5 — **huitième semaine que je le signale**.

⚠️ **L'egress vers la production reste refusé depuis cette routine.** Cf. §5.

---

## 1. Vérifié — conforme

### Sync + outillage (étape 1)
- Session démarrée en `HEAD` détaché, arbre propre. `git checkout main &&
  git pull --rebase origin main` → à jour sur `e079792`. Aucun `stash`, aucun
  force-push.
- ⚠️ Note de méthode reconduite (13/09, 20/09), revérifiée : `test -f
  .git/shallow` répond **oui**. Le dépôt de la routine est un clone *shallow* —
  ne rien conclure d'un `git log` sur un fichier antérieur à la greffe.
- `npm install` — OK. `npx tsc --noEmit` — **0 erreur**, avant et après
  corrections.
- `npm run integrity` — vert, **15 gardes** : 540 villes, guides **FR 1 173 /
  EN 978**, 0 score brut recopié, 540 villes × 4 292 signaux (dont 4 261 liens
  vers le portail de l'éditeur, annoncés comme tels — la garde ajoutée par le
  correctif F64 de cette semaine), glossaire 183 termes, plus `og:image`
  (387 `page.tsx`), `jsonld` (79 sous-pages ville), `env quartet` (20 surfaces),
  `moteurs` (52), `protégées` (4, 101/540 villes), `classements` et `expat`.
- `npm run hreflang:check` (39 paires de sous-pages ville + 209 paires à la
  main), `npm run parity` (FR 221 · EN 166, 0 route FR sans jumelle),
  `npm run search-index:check` — verts.
- `npm run sitemap:check` — vert **dans les deux sens, les deux locales** :
  FR **29 283** URL / 18 chunks, EN **28 870** URL / 21 chunks. **Inchangés
  après correction**, ce qui est le résultat attendu de correctifs qui ne
  touchent aucune URL.
- **Les quatre selftests hors ligne passent** : `biodiversity:selftest`,
  `news:selftest` (**85** contrôles, 77 la semaine dernière),
  `protected-areas:selftest` (540/540 villes placées), `property-prices:selftest`
  (15 OK).
- **Le dépôt n'a pas divergé de son origine** (`origin/main` et `HEAD` sur le
  même sha) — le contrôle que `CLAUDE.md` § F64 impose depuis la panne de
  `git push` du 27/08-10/09.

### Fraîcheur des pipelines — **le contrôle porte sur la date des lignes, jamais sur leur nombre**

| pipeline | lignes | version | dates de relevé | âge | dû ? |
|---|---|---|---|---|---|
| `city-news.json` | 540 | `queryVersion` 3 (540/540) | 24/09 (313) · 25/09 (227) | 2-3 j | non |
| `city-biodiversity.json` | 540 | `queryVersion` 3 (540/540) | 09 → 13/09 | 14-18 j | non |
| `city-protected-areas.json` | 540 | `ingestVersion` 3 (540/540) | 19/08 | 39 j | non |

**Le collecteur BODACC a repris exactement quand l'audit du 15/09 l'avait
prédit.** Il annonçait « rien n'est dû avant le ~23/09 » (`DUE_AFTER_DAYS` = 14
sur des lignes du 09-13/09) ; les lignes sont datées des **24 et 25/09**. Les
quatre commits `data(pipelines)` de la semaine le confirment côté dépôt. C'est la
lecture que trois runs de septembre avaient prise pour une panne, et le
diagnostic « nominal » est maintenant vérifié par l'événement.

⚠️ **Le silence des deux autres pipelines est nominal, et pour une raison
différente qu'en news** : `crawlBatch` de `city-biodiversity.mjs` ne sert que les
lignes **absentes ou sous `QUERY_VERSION`** (ligne 764-767) — il n'y a **aucun
seuil d'âge**. Les 540 lignes étant en version 3, rien n'est dû, et leurs 14-18
jours ne sont pas un retard. Les zones protégées sont une passe BD TOPO unique
(périmètres arrêtés au 19/08). Ne pas re-diagnostiquer ces deux âges en panne.

### Complétude des routes (étape 2)
- Les deux défauts distincts que demande l'étape — route sans entrée sitemap ;
  entrée sitemap sans route — sont **absents dans les deux locales**
  (`sitemap:check`, 86 familles dynamiques FR et 88 EN contre les vrais
  `generateStaticParams()`). Aucune `page.pending.tsx`.
- **Les 11 grands groupes répondent dans les deux locales**, contrôlés non pas
  par une requête (egress refusé) mais en **jouant les vrais
  `generateStaticParams()` et en rendant `generateMetadata()` sur 2 slugs par
  groupe** — le premier et le dernier paramètre émis :

| groupe | FR | EN |
|---|---|---|
| villes | 540 | 540 |
| classements / rankings | 19 | 19 |
| regions | 18 | 18 |
| departements / departments | 102 | 102 |
| guides | 1 173 | 978 |
| comparer / compare | 771 | 771 |
| red-flags | **39 dossiers statiques** | 28 (sélection) |
| pour-qui / for-who | 36 | 13 (sélection) |
| vacances / vacations | 540 | 540 |
| badge | 540 | — (FR-only assumé) |
| parcs / parks | 540 | 540 |

  Les 22 rendus portent tous leur canonical. ⚠️ Note de méthode : FR
  `red-flags` **n'est pas une route dynamique** — ce sont 39 dossiers
  `app/red-flags/<slug>/page.tsx`, comme `CLAUDE.md` le décrit ; mon premier
  balayage l'a déclaré « non chargeable » en cherchant un `[theme]` qui n'existe
  pas. Contrôlé autrement : **39 thèmes dans `RED_FLAG_THEMES`, 39 dossiers,
  0 thème sans dossier, 0 dossier sans thème.**
- **Liens internes littéraux** : **1 065** `href` entièrement littéraux extraits
  de `app/`, `components/` et `lib/`, confrontés à l'**union** des deux arbres de
  routes (194 routes statiques, **56 790 routes concrètes** énumérées, 174 motifs
  dynamiques, 3 `route.ts`, 1 331 fichiers publics). **0 lien interne mort.**
- **`public/_redirects` — 85 règles** : **0 boucle** (`from === to`), **0 cible
  sans route**, et **1 seule** règle masquant une route vivante — `/quiz →
  /city-match`, l'item déjà connu (§4.4).
  ⚠️ **Piège de méthode à retenir, il m'a fait annoncer 84 faux positifs.** Mon
  premier test de masquage acceptait une URL dès qu'elle correspondait à un
  **motif** dynamique : `/comparer/nantes-vs-angers` « existait » donc, puisque
  `/comparer/[pair]` existe — alors que `generateStaticParams` n'émet que l'ordre
  canonique et que le redirect sert précisément l'autre. C'est exactement le
  piège du `coveredByDynamic` de `npm run parity` que `CLAUDE.md` documente :
  **un motif de même profondeur n'est pas une preuve d'existence**, seul
  l'ensemble énuméré l'est.

### SEO (étape 3)
Balayage réel : les `page.tsx` des deux arbres chargés et exécutés, leurs
`generateStaticParams()` joués, `generateMetadata()` rendue sur un échantillon
par famille incluant **systématiquement le slug le plus long** (pire cas de
longueur). **460 rendus FR, 412 EN — 872 au total, 0 erreur de chargement, 0
erreur de rendu.** Le correctif du 20/09 sur `app/leaderboard/page.tsx` tient :
la page se charge, aucun module n'est un angle mort.

- **Canonical** : présent sur **toutes** les routes dynamiques des deux locales
  (326 rendus dynamiques FR, 334 EN, **0 manquant**). 0 `localhost`, 0
  `*.pages.dev` / `*.workers.dev` / `*.vercel.app`, **0 canonical FR vers
  `bestcitiesinfrance.com` ni l'inverse**. Seul `app/page.tsx` (racine FR)
  n'exporte pas de `metadata` : il hérite du layout, comportement voulu.
- **`x-default`** : 370 rendus FR et 373 EN portent une table `languages`, et
  **0 page sans `x-default` des deux côtés**. Il y en avait 5 côté EN avant le
  correctif de la semaine dernière.
- **Canonicals portés par plusieurs fichiers** : côté FR les **2** doublons
  connus et arbitrés — `/city-match` (alias `/quiz`) et `/mes-villes` (alias
  `/dashboard`). Côté EN, **0**.
- **`openGraph` sans `images`** : 8 fichiers FR et 1 EN en émettent un, et **les
  9 ont un `opengraph-image.tsx` voisin** — vérifié fichier par fichier, ce qui
  confirme la garde `integrity` par un chemin indépendant.
- **`app/robots.ts`** : `Disallow` = `["/api/", "/admin/", "/auth"]`, chunks
  dérivés de `SITEMAP_CHUNK_COUNT`. `noindex` vérifié **en rendant** les
  métadonnées : `/dashboard`, `/favoris`, `/mes-villes`, `/connexion`,
  `/auth/callback` côté FR, `/my-account`, `/sign-in`, `/auth/callback` côté EN
  portent tous `index: false`.
  ⚠️ Rappel : le `robots.txt` servi en production n'est pas celui du dépôt
  (Cloudflare y injecte ses règles anti-crawler IA) — un écart n'est pas un bug.
- **Marque dans les titres** : FR 7 fichiers, EN 21 fichiers, **0 au-dessus de
  60 caractères** des deux côtés. Aucune occurrence de `MaVilleIdeal` sans
  accent : la seule correspondance du dépôt est le commentaire de
  `lib/brand.ts` qui l'interdit.
- **Sitemap `lastModified`, contrôle neuf** : les 18 chunks FR et 21 EN exécutés
  et dépliés. **0 `lastModified` absent ou invalide, 0 date dans le futur, 0 URL
  en doublon, une seule origine par locale.** Plage FR 2026-01-01 → 2026-09-26,
  EN 2026-05-19 → 2026-09-26. Une date de dernière modification postérieure à
  aujourd'hui fait douter Google du fichier entier ; il n'y en a aucune.
- **`alt`** : **0 `<img>` sans `alt`**, **0 `<Image>` sans `alt`** dans `app/` et
  `components/`. ⚠️ Les 4 correspondances brutes de `grep -v alt=` sont des
  balises multi-lignes qui portent bien leur `alt` deux lignes plus bas — un
  balayage ligne par ligne les accuse à tort. Le `alt=""` de `CityCard.tsx` est
  correct : l'image est décorative dans une tuile qui est déjà un `<a>` titré.

### Intégrité des données (étape 4 — sondage)
- **540 villes** : **0 violation de bornes** (`global ∈ [2,8 – 8,6]`, les 8 axes
  dans `[0, 10]`, `latitude`/`longitude` présentes et plausibles), **0 slug
  dupliqué**.
  ⚠️ Piège de méthode : mon premier passage a annoncé **1 080** violations. 1 080
  = exactement 2 × 540, donc « toutes les villes, deux champs » — le signal qu'il
  faut lire comme *le contrôleur est faux*, pas comme *les données sont mortes*.
  Le seed nomme ses champs `latitude`/`longitude`, pas `lat`/`lng`.
- **3 villes tirées** — Alençon (5,7), Bar-sur-Aube (6,7),
  Conflans-Sainte-Honorine (4,7) : scores numériques, dans les bornes,
  `computeNicheScores()` cohérent et dans `[0, 10]`, lu **à travers le module**
  et jamais par un `grep` du seed.
- **Le contrôle FR/EN, fait en grand.** C'est celui qui a attrapé les deux vrais
  bugs du projet. `generateMetadata()` rendue des deux arbres pour **les 540
  villes × les 39 paires de `FR_TO_EN_CITY_SUB`** — **21 060 couples, 0 erreur de
  rendu**. Sur les **3 428** couples citant une **note sur 10 des deux côtés** :
  **0 divergence réelle.**
  Les 53 écarts remontés sont tous le même, et ce n'est pas un écart de note :
  `/villes/<x>/synthese` écrit « global **6**/10 » là où sa jumelle
  `/cities/<x>/synthesis` écrit « overall **6.0**/10 ». Même nombre, deux
  formats — le FR interpole `${s.global}` brut, l'EN `${s.global.toFixed(1)}`.
  Aucune des deux pages n'affiche un chiffre faux. Cf. §4.2.
  ⚠️ Les trois pièges notés le 13/09 sont respectés : on ne compare que les
  motifs « x/10 » / « x sur 10 » / « x out of 10 » (le séparateur de milliers
  anglais est une virgule), une jumelle qui ne cite aucun chiffre n'est pas une
  contradiction, et le défaut cherché est la note, pas le multiensemble des
  nombres de la phrase.
- **Corpus de guides** : `assertUniqueSlugs` rejouée pour de vrai par
  `npm run integrity`. Contrôles supplémentaires sur les 1 173 FR et 978 EN :
  **0 champ obligatoire manquant, 0 section vide ou < 40 caractères, 0
  `readMinutes` hors `[1, 60]`, 0 date mal formée, 0 date dans le futur, 0
  `relatedGuides`/`relatedCities` en doublon interne, 0 `metaTitle` dupliqué, 0
  `metaDesc` dupliqué** — sur les deux corpus. Trois écarts trouvés, tous côté
  FR : le `dateModified` de §4.1, l'auto-lien de §3 nº 2, et un `title` partagé
  par deux guides (§4.3).
- **Résolution guide ↔ page ville** (la classe de bug des batches 32 et 44),
  passée sur les **540 villes** avec le vrai résolveur (`citySlugElisions` +
  formes contractées `au-`/`aux-`) : **série tourisme FR 275/275 et EN 275/275
  atteignables, 0 orphelin, 0 collision, 0 ville réclamant deux guides, 0 guide
  omettant sa propre ville dans `relatedCities`.** Les 14 guides des batches 50
  et 51 de cette semaine sont inclus et conformes.
  ⚠️ Le piège du 20/09 est évité : un `catch` qui renvoie « a une photo »
  transforme une exception en conformité — ici un `throw` est compté comme un
  échec. Seul `vesoul` sort sans photo, **des deux côtés**, ce qui est le trou de
  pipeline connu (§4.4) et non une régression du lot.
- **Pages `/tags`, contrôle neuf dans les deux sens.** FR **274** pages pour
  5 092 slugs de tag distincts, EN **114** pour 2 285. **0 slug atteignant le
  seuil de 3 guides sans page, 0 page sans aucun guide, 0 page sous le seuil.**
  Le système de slug **fusionne** correctement les variantes d'accent et de
  casse, donc le doublon de page que le batch 45 redoutait (`ile de france` vs
  `ile-de-france`) **ne peut pas se produire** : les deux tombent sur
  `/tags/ile-de-france`. Résidu cosmétique en §4.3.

### Perf (étape 5)
- **Graphe d'imports client tracé** depuis les **84** composants `"use client"`,
  imports transitifs suivis, `import type` et `{ type X }` écartés : **181
  modules atteignables** — identique à la semaine dernière. Sur les JSON de plus
  de 50 Ko, **4 seulement** sont atteignables et ce sont exactement les quatre
  documentés : `search-index.json` (295 Ko) / `.en.json` (239 Ko) — la projection
  faite pour ça, une seule des deux part au build —, `city-population.json`
  (140 Ko, le levier connu réservé à une passe locale) et `city-cards.json`
  (63 Ko).
- **Les 8 gros JSON restent hors du graphe client**, dont les quatre lourds :
  `city-parks` (2 457 Ko), `city-biodiversity` (2 180), `city-news` (1 716),
  `city-protected-areas` (1 120), plus `city-images` (359),
  `political-lean` (289), `guide-pois` (170) et `city-property-prices` (168).
- **0 import en valeur** de `data/guides`, `data/guides-en`, `lib/guide-tags`,
  `lib/guide-tags-en`, `lib/rankings`, `lib/expat-return` ou `data/cities-seed`
  depuis un composant client. La discipline du 04/08 et du 27/08 tient. Les deux
  modules atteints sont les cas légitimes documentés : `data/housing.ts` via
  `components/CityCard.tsx` (les loyers servent au filtrage côté client) et
  `lib/profile-pages.ts` via `PeopleLikeYouClient`, que `CLAUDE.md` nomme
  explicitement.
- `framer-motion` : **0 import réel** — les 2 correspondances du dépôt sont des
  commentaires dans `components/effects/`.
- **Index de recherche** : FR 302 119 o brut / **47 204 o gzip** (+1 495 o de
  gzip en sept jours pour +22 guides), EN 244 650 / **41 296** (+1 929 o pour
  +30 guides). La croissance gzip reste marginale au regard du volume ajouté, et
  `SearchPaletteLauncher` charge la palette en `next/dynamic`.

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt et un balayage de préfixes
  (`xkeysib-`, `sk-ant-`, `ghp_`, `github_pat_`, `AKIA…`, `BEGIN PRIVATE KEY`) ne
  remontent **rien**, y compris hors des anciens rapports d'audit. Seul
  `.env.example` est versionné.
- **`worker/index.ts`, `lib/spam-filter.ts`, `lib/rate-limit.ts` et
  `lib/auth-tokens.ts` n'ont pas bougé** : **0 commit** les touchant depuis
  l'audit précédent. La revue handler par handler du 30/08, reconduite les 13 et
  20/09, reste valide. Inventaire inchangé : **21 routes `/api/*` littérales**,
  plus `/api/cities/<slug>/summary` (route regex) et `/widget/embed`.
- **Balayage mécanique des 19 handlers** : tout POST public porte un `rateLimit`,
  et toute lecture privée est scopée sur l'utilisateur issu de `authedUser`.
  **0 `SELECT` sans clause de scope** (`user_id` / `email` / `token`). Les 5
  handlers sans `rateLimit` (`handleAuthMe`, `handleAuthHandle`,
  `handleFavorites`, `handleProjections`, `handleAccount`) exigent tous une
  session valide ; les 3 confirmations par lien
  (`handleNewsletterConfirm`, `handleAlertesConfirm`, `handleAlertesUnsubscribe`)
  s'ouvrent sur un `randomUUID()` de 122 bits, non énumérable.
- **Validation à la frontière, vérifiée sur les deux endpoints de contenu
  utilisateur** (`handleReviewsPost`, `handleCommentsPost`) : authentification ou
  IP → `rateLimit` en mémoire → `zod safeParse` → **`checkContent`**
  (`lib/spam-filter.ts`) → pot de miel temporel (< 2 s = refus) → plafond
  journalier en D1. Refus en 400 / 422 / 429 selon le motif.
  ⚠️ Piège de méthode : la fonction s'appelle **`checkContent`**, pas
  `spamFilter` — un balayage qui cherche `spamFilter|isSpam` déclare les 19
  handlers sans filtre anti-spam.
- ⚠️ Piège de méthode reconduit du 20/09 : `/api/quiz`, `/api/copilot` et
  `/api/cities/*/summary` sont limités **au routeur** et non dans le corps du
  handler — un balayage qui ne lit que les fonctions `handle*` les déclare à tort
  sans garde. Ils portent une double limite (minute en mémoire + jour en D1),
  explicitement pour plafonner la dépense Anthropic.

---

## 2. Cassé — trouvé cette semaine

### 2.1 🟠 Le docstring du barème de notes annonçait trois constantes fausses — et un commit de cette semaine est passé dessus sans les voir

`lib/score-distribution.ts` porte en tête le résumé du calcul qui note les 540
villes. Le commit `6d5d909` du 2026-09-23 est venu **exprès** corriger la dérive
de ce bloc : il a ramené le multiplicateur annoncé de 0,55 à 0,35 pour coller au
code, et a ajouté un paragraphe expliquant la dérive. Il a corrigé **une** des
quatre valeurs du bloc. Les trois autres tenaient toujours :

| le docstring annonçait | le code applique | mesuré sur `CITIES_SEED` |
|---|---|---|
| target mean ≈ **5,0** | `TARGET_MEAN = 5.7` | moyennes d'axe **5,68 – 5,72** |
| std ≈ 1,7 | `TARGET_STD = 1.7` | 1,55 – 1,69 ✅ |
| clamp d'axe **[1,8 – 8,8]** | `MIN = 2.2` · `MAX = 9.0` | min **2,2** · max **9,0** |
| clamp global **[2,5 – 8,6]** | `GLOBAL_MIN = 2.8` · `GLOBAL_MAX = 8.6` | min **2,8** · max 8,4 |
| penalty × 0,35 (corrigé le 23/09) | `* 0.35` | ✅ |

Les trois valeurs fausses ne sont pas des approximations : la borne basse d'un
axe annoncée à 1,8 pour un plancher réel de 2,2, et un plancher global annoncé à
2,5 pour un plancher réel de 2,8, décrivent une échelle qui n'existe pas. La
colonne « mesuré » est la preuve que **le code a raison dans les quatre cas** —
elle est prise en exécutant `CITIES_SEED` à travers le module, jamais en lisant
le seed source, comme `CLAUDE.md` l'exige.

Pourquoi ça compte plus qu'un commentaire : `CLAUDE.md` § Score pipeline dit que
c'est ce bloc qu'on lit avant de toucher au barème, et rappelle qu'un résumé faux
du barème est ce qui a produit **1 026 chiffres dérivés** dans le corpus de
guides. Un rédacteur qui lit « clamp [1,8 – 8,8] » et écrit une phrase dessus
publie une échelle inventée. Et aucune garde ne peut voir l'écart : `tsc` ne lit
pas les commentaires, et `npm run integrity` contrôle les chiffres cités dans les
**guides**, pas ceux cités dans les **en-têtes de libs**.

### 2.2 🟡 Un guide se citait lui-même dans « À lire ensuite »

`meilleures-villes-familles-ecoles-securite-france-2025` porte son propre slug
en première position de son tableau `relatedGuides` :

```
relatedGuides: ["meilleures-villes-familles-ecoles-securite-france-2025", …]
```

et `app/guides/[slug]/page.tsx:73` ne l'excluait pas :

```tsx
const relatedGuides = GUIDES.filter((g) => guide.relatedGuides.includes(g.slug));
```

La page rendait donc **trois** cartes « À lire ensuite » dont une pointant sur
elle-même. Mesuré en rejouant les deux versions du filtre : 3 cartes avant, 2
après, et sur les 1 173 guides **4 244 cartes avant, 4 243 après** — un delta de
exactement 1, ce qui prouve que le correctif ne touche rien d'autre.

Ce qui rend le défaut sûr à corriger, comme le 20/09, est une asymétrie interne
au dépôt : la fonction sœur qui remplit le bloc *automatique* juste en dessous,
`suggestNextGuides` (`lib/guide-suggestions.ts:13`), construit son ensemble
d'exclusion avec `new Set([current.slug, ...current.relatedGuides])` — elle
exclut la page courante **depuis toujours**. Le bloc écrit à la main, non. Et
côté EN il n'y a rien à corriger : `app/[locale]/guides/[slug]/page.tsx` ne rend
pas `relatedGuides` du tout, seulement `suggestNextEnGuides`, qui exclut aussi.

### 2.3 🟡 `/pour-qui/amateurs-de-culture` publiait un poids que le moteur ne contient pas

L'intro du profil énumère quatre profils voisins avec leur pondération culture,
chiffre par chiffre. Confrontée aux `weights` réels de `lib/profile-pages.ts` :

| la page annonçait | `weights.culture` réel |
|---|---|
| « jeunes actifs » (culture 2,0) | `2` ✅ |
| « couple sans enfant » (culture 2,5) | `2.5` ✅ |
| **« télétravailleurs » (culture 1,5)** | **clé `culture` absente** ❌ |
| « expat retour » (culture 1,5) | `1.5` ✅ |

`teletravailleurs` pèse `{remoteWork: 2.5, teletravail: 2, life: 2,
transport: 1.5, nature: 1.5, cost: 1}` — il **ne pondère pas la culture du
tout**. Trois des quatre chiffres étaient exacts, ce qui est précisément ce qui
rend l'erreur crédible à la lecture.

C'est la classe de défaut nº 1 du dépôt : un chiffre cité en copie que le code
démentit en un clic, la même que les « 1 026 figures » de `CLAUDE.md` et que les
deux pages EN qui citaient les pondérations de `lib/niche-scores.ts` pour
classer `lib/owner-scores.ts`. Le commit de maillage de cette semaine
(`86a7894`) l'avait **repéré et documenté** dans son message, en choisissant de
ne pas le corriger (« c'est du contenu, pas du maillage ») — un arbitrage de
périmètre juste pour ce commit-là, qui laissait le défaut ouvert. Un audit
d'intégrité est l'endroit où il se referme.

---

## 3. Corrigé

3 fichiers, **27 insertions, 8 suppressions**. Aucun score déplacé, aucun
refactor structurel, aucune migration D1, **aucun déploiement**.

| # | Correction | Fichier |
|---|---|---|
| 1 | Les trois constantes fausses du docstring alignées sur le code (`TARGET_MEAN`, `MIN`/`MAX`, `GLOBAL_MIN`), avec la mesure qui le prouve et un avertissement disant que **les constantes font foi**. **Commentaire uniquement, aucune ligne exécutable touchée.** | `lib/score-distribution.ts` |
| 2 | `g.slug !== guide.slug` ajouté au filtre `relatedGuides`. Le correctif est au **site d'affichage** et non dans la donnée, pour que la faute ne puisse pas revenir par l'un des 1 173 guides — la discipline que `suggestNextGuides` applique déjà. | `app/guides/[slug]/page.tsx` |
| 3 | La clause fausse remplacée par une vraie : « freelances » (culture 1,5 dans un mélange télétravail-connectivité). `freelances` porte réellement `culture: 1.5` avec `remoteWork: 2.5` / `teletravail: 2`, donc la substitution **préserve l'argument de la phrase** (la culture comme ingrédient d'appoint d'un mode de vie connecté) au lieu de simplement retirer un exemple. | `lib/profile-pages.ts` |

**Portée vérifiée avant et après application** :
- correctif 1 — les quatre valeurs recalculées sur les 540 villes à travers le
  module avant d'écrire une ligne ; `git diff` confirme que seul le bloc de
  commentaire change ;
- correctif 2 — les deux versions du filtre rejouées sur les 1 173 guides :
  4 244 → 4 243 cartes, delta exactement 1, l'auto-lien et rien d'autre ;
- correctif 3 — **les quatre clauses réexaminées après édition** contre
  `PROFILE_PAGES` : les 4 sont désormais exactes (2 · 2,5 · 1,5 · 1,5).

Vérifications après coup : `tsc` **0 erreur**, `integrity` (15 gardes),
`hreflang:check`, `parity`, `search-index:check`, `sitemap:check` tous verts et
**inchangés** — FR 29 283 / EN 28 870, aucune route neuve, aucune URL déplacée,
ce qui est le résultat attendu de correctifs qui ne touchent ni une route ni une
donnée indexée.

---

## 4. À arbitrer

### 4.1 🟠 239 guides FR publient une date de modification antérieure à leur publication — **nouveau**

`updatedAt < publishedAt` sur **239 des 1 173 guides FR** (et **0 des 978 EN**).
Le champ n'est pas décoratif, il sort par quatre portes :

| surface | ligne |
|---|---|
| JSON-LD `Article.dateModified` face à `datePublished` | `app/guides/[slug]/page.tsx:109` |
| `openGraph.modifiedTime` | `:62` |
| la ligne visible « mis à jour <date> » | `:199-200` |
| `lastModified` du sitemap | `app/sitemap.ts:353` et `:1219` |

Un `Article` dont `dateModified` précède `datePublished` est incohérent au sens
de schema.org : Google peut ignorer les deux dates. Et la vignette affichée dit
« mis à jour 14 avr. » sur une page publiée le 15 avril.

Ampleur : écart **médian 66 jours**, maximum **134**
(`lmp-loueur-meuble-professionnel-france-2026`, publié le 15/05 et « mis à jour »
le 01/01). Six catégories touchées (`budget`, `comparaison`, `lifestyle`,
`region`, `famille`, `teletravail`).

**Ce qui rend l'arbitrage tenable plutôt qu'urgent** : c'est un artefact clos.
**Tous** les 239 ont un `publishedAt` au **15/05/2026 ou avant**, et **214
partagent la même date, le 15/05** — la signature d'un remplissage en lot. Rien
de publié après cette date n'est concerné, donc **aucun contenu nouveau ne
rouvre le défaut** : il ne grandira pas tout seul.

**Je n'ai rien corrigé, et pourquoi** : les deux remèdes engagent une décision
qui n'est pas la mienne. ① Corriger la **donnée** suppose de savoir laquelle des
deux dates est la bonne — et l'indice (214 guides publiés le même jour) désigne
`publishedAt` comme le champ fabriqué, donc corriger reviendrait à inventer 239
dates de publication. ② Clamper à l'**affichage**
(`dateModified: max(publishedAt, updatedAt)`) est une seule ligne, n'invente rien
et rend le JSON-LD cohérent — mais change la date affichée et déclarée sur 239
pages publiées, ce que le prompt classe hors de ce que je corrige seul.
**Recommandation** : le clamp ② si l'on veut fermer le défaut cette semaine, la
reprise des `publishedAt` si l'on veut la vérité.

### 4.2 🟠 Le séparateur décimal français — et, mesuré ce run, le `.0` de trop dans l'autre sens

Constat ouvert depuis le 06/09 §4.2, reconduit les 13 et 20/09 : `formatScore()`
est un `toFixed(1)` nu, donc le site français écrit « 6.8 ». **Je n'ai rien
corrigé** — c'est le refactor identifié (helper conscient de la locale, ~500
sites d'appel, `formatScore` étant partagé avec les pages EN où le point est
correct).

Ce que ce run ajoute : la **face symétrique** du même problème, trouvée par le
contrôle FR/EN. `/villes/<x>/synthese` interpole `${s.global}` **brut** là où sa
jumelle EN interpole `${s.global.toFixed(1)}`. Donc pour les 53 villes dont le
global tombe rond, le FR écrit « global **6**/10 » et l'EN « overall
**6.0**/10 » ; et pour les autres, le FR écrit « 6**.**8 », avec le point. La
page FR est donc incohérente **avec sa jumelle** *et* **avec elle-même d'une
ville à l'autre**. Aucun chiffre n'est faux, et les deux défauts se ferment par
le même helper : c'est un argument de plus pour le faire, pas un défaut neuf.

### 4.3 🟡 Deux résidus de contenu, mesurés — **nouveaux**

**a) 14 pages `/tags` affichent un libellé minoritaire.** Le slug fusionne bien
les variantes (donc pas de page en doublon, §1), mais `getTagLabel` retourne
`slugToOriginal`, qui garde **le premier libellé rencontré** — un choix
explicite, le commentaire de `lib/guide-tags.ts:26` dit « Keep the first
canonical casing seen for display ». Conséquence quand le premier rencontré est
un accident : `/tags/ile-de-france` s'intitule **« ile de france »** d'après **1**
guide, alors que **48** écrivent `ile-de-france`. Idem `/tags/grand-est`
(« grand est », 11 contre 47), `/tags/pays-de-la-loire` (13 contre 28),
`/tags/mediterranee` (« méditerranée », 1 contre 12), `/tags/alpes` (1 contre 7)
— 5 côté FR, 9 côté EN.
**Je n'ai rien touché** : ce n'est pas un bug mais la sortie d'un comportement
documenté, et le précédent du dépôt est la **normalisation de la donnée** (batch
45 a consolidé le `"ile de france"` de `things-to-do-in-pontoise-2026` pour
exactement cette raison), pas la réécriture du helper. 14 tags à normaliser dans
les deux corpus, ou un `getTagLabel` qui choisit le libellé majoritaire —
l'un ou l'autre, pas les deux.

**b) Deux guides FR partagent un `title` au caractère près** :
`villes-france-famille-bilingue-anglais-2026` et
`villes-france-famille-bilingue-fr-en-2026`, tous deux « Villes françaises pour
élever une famille bilingue français-anglais en 2026 », même catégorie
`famille`, publiés à 11 jours d'écart (13/05 et 24/05). Leurs `metaTitle`
diffèrent, donc les `<title>` servis ne sont pas identiques — mais c'est
exactement le motif de **cannibalisation** que `CLAUDE.md` documente avoir purgé
en juin (« near-identical pages competing for one query, same root cause as the
earlier dup-slug bug but with distinct slugs »), et que le balayage de similarité
d'alors n'a pas attrapé ou qui est né après. **Décision de contenu** : garder le
plus riche, 301 l'autre dans `public/_redirects`, comme les 15 dédoublonnages EN
déjà en place. Hors de ce que je corrige seul.

### 4.4 Rappels d'arbitrages déjà ouverts — état au 27/09

- **`npm audit` — 14 avis, 1 critique, 10 hauts, inventaire strictement
  inchangé** (`next`, `sharp`, `wrangler`, `miniflare`, `undici`, `ws`,
  `postcss`, `browserslist`, `nanoid`, `brace-expansion`, `js-yaml`,
  `@babel/core`, `esbuild`, `baseline-browser-mapping`). L'arbitrage des 13 et
  20/09 tient et je le reconduis sans le réécrire : `output: "export"` +
  `images: { unoptimized: true }`, pages servies par Workers Static Assets, et
  les avis `next` visent tous un **runtime serveur Next** qui n'existe pas ici ;
  le reste ne tourne qu'au **build et au déploiement**, sur la machine du
  propriétaire. Toujours pas bougé pour la même raison : `package-lock.json` est
  modifié par ~15 agents en semaine et un bump de `next` demande un
  `npm run build` pour être validé. **À faire dans la passe locale qui porte
  déjà le build.**
- **`framer-motion` toujours déclaré** dans `package.json` (`^12.38.0`), importé
  nulle part, zéro octet livré. **Onzième report consécutif** — à joindre à la
  passe locale ci-dessus, qui touchera de toute façon `package-lock.json`.
- **Vesoul n'a pas de photo** : `data/city-images.json` compte **538 entrées pour
  540 villes**, les deux absentes étant `vesoul` et `pierrefitte-sur-seine`.
  Pierrefitte est attendu (fusionnée dans Saint-Denis en 2025) ; Vesoul est un
  vrai trou, qui laisse `10-choses-a-faire-a-vesoul-2026` et sa jumelle EN sans
  bandeau. Rien n'est cassé — les deux locales se comportent identiquement et le
  pipeline prévoit l'absence. Combler demande de l'egress :
  **ligne pour la prochaine passe locale**, `npm run photos:update` suffit si le
  `P18` existe désormais.
- **`app/quiz/page.tsx`** : page complète, canonique de `/city-match`, absente du
  sitemap, générée à chaque build, et **systématiquement redirigée** par
  `public/_redirects` (`/quiz /city-match 301`) — confirmé ce run par un chemin
  indépendant, c'est la **seule** des 85 règles qui masque une route vivante. Du
  poids de build mort, pas un défaut visible. Signalée les 23/08, 30/08, 06/09,
  13/09, 20/09 ; toujours là.
- **Les 19 classements balisent des rangs sur des ex æquo** (§4.1 du 20/09) :
  arbitrage **non rouvert**, c'est un changement de données structurées sur 38
  pages. Le remède est écrit et tourne à côté — `lib/owner-rankings.ts` bascule
  déjà `itemListOrder` sur `ItemListUnordered` et omet `position` dès que la tête
  est à égalité. Il ne manque que la décision de l'appliquer aux 19 autres.
- **La préséance de `NEXT_PUBLIC_BASE_URL`** (06/09 §4.1) : toujours ouverte, les
  cinq modules lisent encore `process.env.NEXT_PUBLIC_BASE_URL ?? (locale…)`. La
  garde au déploiement (`check-deploy-locale.mjs`) tient. Le geste de
  vérification reste une ligne sur la machine de publication :
  `grep -n NEXT_PUBLIC_BASE_URL …/.env.local`.
- **`data/city-population.json` (140 Ko)** sur les 1 080 pages ville via
  `CityProfile → DemographyCard`. Remède connu (calculer dans
  `lib/city-profile-data.ts`, descendre en props), mais il touche le rendu des
  pages ville : passe locale avec build.
- **`?limit=abc` sur `/api/cities/search`** rend `{results: []}` au lieu des 8 par
  défaut (`parseInt` → `NaN` → `slice(0, NaN)`). Toujours là, toujours sans
  portée sécurité (entrée bornée par le haut, endpoint rate-limité).
- **Classement biodiversité / espaces verts** : ne pas recréer
  `/classements/biodiversite`, ne pas remettre `RICHNESS_RANKING_PUBLISHED` ni
  `GREEN_SPACE_RANKING_PUBLISHED` à `true`.
- **Les 27 scores en dur de `n8n/workflows/social-media-daily.json`** restent en
  écart avec le pipeline. Décision inchangée depuis le 09/08.
- **Titres > 60 et descriptions > 160** : arbitrage des 09/08 §4.6, 16/08 §4.2,
  30/08 §4.2, 06/09 §4.3, 13/09 §4.4 et 20/09 reconduit sans le rouvrir. Sur mon
  échantillon (qui inclut toujours le pire cas) : FR 163 rendus sur **93**
  fichiers et 106 descriptions sur **88** ; EN 120 sur **66** et 76 sur **56** —
  **exactement les mêmes comptes de fichiers que la semaine dernière**, donc
  aucune régression malgré +52 guides. L'essentiel vient du `metaTitle` des
  guides, qui **est** le titre de la page — une passe de réécriture de contenu,
  pas un correctif d'audit.

---

## 5. Écart avec le prompt de la routine

Les deux mêmes que les sept semaines précédentes, tous deux inchangés.

**L'étape 1 demande `npm run build`**, que `CLAUDE.md` interdit depuis une
session cloud (§ Commands, note du 2026-08-08 : > 4 h 30 sans finalisation,
`.next` à 25 Go, `ENOSPC`). J'ai suivi `CLAUDE.md`. Le substitut exécuté en
entier : `npx tsc --noEmit`, `npm run integrity` (qui rejoue les vraies gardes de
chargement en 2 s), `hreflang:check`, `parity`, `search-index:check`,
`sitemap:check`, les quatre selftests hors ligne, plus **872 rendus réels de
`generateMetadata()`** sur les deux arbres, **21 060 rendus** pour le contrôle
FR/EN, le dépliage des **39 chunks de sitemap** pour leurs `lastModified`, le
traçage du graphe d'imports client, 1 065 liens littéraux, les 85 règles de
`_redirects`, la résolution guide ↔ ville sur les 540 villes et les deux séries,
et les contrôles neufs de ce run (hygiène des deux corpus de guides, pages
`/tags` dans les deux sens, bornes des 540 villes).
**Huitième semaine que je le signale** : je recommande que l'étape 1 du prompt
remplace `npm run build` par cette combinaison.

**Les étapes 2 et 3 supposent qu'on peut interroger les sites.** L'egress est
refusé depuis la routine. Tout ce qui touche au comportement d'edge —
redirections réellement servies, canonicalisation d'hôte, `robots.txt` en
production, propagation d'un déploiement — n'est vérifiable qu'en **lisant**
`worker/index.ts` et l'export. Ce run a contourné l'étape 2 en jouant les vrais
`generateStaticParams()` et en rendant 2 slugs par groupe (§1), ce qui prouve que
la page **existe et porte son canonical**, mais pas qu'elle **répond 200 en
ligne**. La question ouverte au §4.1 du 06/09 — l'export EN publie-t-il
aujourd'hui l'origine FR ? — se trancherait toujours d'un seul
`curl https://bestcitiesinfrance.com/robots.txt`. Deux pistes, inchangées :
autoriser l'egress vers les deux domaines de production depuis cette routine, ou
déclarer le comportement d'edge hors périmètre.

**Note sur un écart volontaire avec la liste de corrections du prompt.** Le
prompt autorise à corriger « type sûr, canonical manquant, entrée sitemap
manquante, titre trop long, noindex manquant, `alt` absent ». Mes correctifs 1 et
3 n'y figurent pas littéralement. Je les ai faits parce qu'ils ne déplacent
**aucun score publié**, ne sont **ni un refactor structurel ni une migration
D1** — les trois réserves explicites du prompt — et qu'ils relèvent du cœur de
l'étape 4 : un chiffre cité qui contredit le moteur. Le correctif 1 est un
commentaire ; le correctif 3 est une clause de six mots dont la version fausse
était vérifiable en une ligne de code. J'ai laissé au §4.1 le défaut de dates,
pourtant de la même famille, précisément parce que lui **change 239 pages
publiées**.

**Notes de méthode pour le prochain run**, tirées des fausses pistes de celui-ci :
- Un contrôle d'existence d'URL qui accepte un **motif dynamique** de même forme
  ment : il m'a donné 84 faux « redirect masquant une route vivante ». Seul
  l'ensemble énuméré par `generateStaticParams()` prouve qu'une URL existe — le
  piège du `coveredByDynamic` de `npm run parity`, déjà dans `CLAUDE.md`.
- Un décompte d'anomalies **exactement égal à `n × 540`** accuse le contrôleur,
  pas les données. Mes « 1 080 violations de bornes » étaient deux noms de champs
  faux (`lat`/`lng` pour `latitude`/`longitude`).
- Un balayage `grep -v alt=` **ligne par ligne** accuse toutes les balises
  multi-lignes : les 4 `<img>` « sans `alt` » en portent un deux lignes plus bas.
- Chercher une garde par le nom qu'on **suppose** (`spamFilter`) et non par celui
  qu'elle porte (`checkContent`) fait conclure qu'aucun handler ne filtre le spam.
- Une différence de **format** n'est pas une différence de **valeur** : les 53
  « divergences » FR/EN de ce run sont `6` contre `6.0`. Comparer les chaînes
  suffit à les remonter ; il faut lire avant de les appeler un défaut de score.
