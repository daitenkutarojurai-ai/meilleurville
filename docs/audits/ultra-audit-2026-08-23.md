# Ultra-audit hebdomadaire — 2026-08-23

Audit autonome du dimanche. 29 commits depuis le dernier audit (2026-08-16).

Le run a trouvé **trois défauts réels, tous invisibles à l'outillage existant**, et
les a corrigés — plus deux gardes pour qu'ils ne puissent pas revenir :

1. Le site annonçait **352 villes** alors qu'il en classe **540**, sur ~2 170
   pages des deux domaines, dont l'intro de **chaque fiche ville**.
2. `GLOSSARY_TERMS_COUNT` était resté à **33** pendant que le glossaire montait à
   **142 termes** — le site annonçait quatre fois moins qu'il ne publie.
3. Les **15 redirections 301 des guides EN dédoublonnés ne pouvaient pas partir
   sur le domaine anglais** : elles vivent dans `public/_redirects`, que la
   réécriture de locale du Worker empêche de rencontrer. Les URL visées étaient
   anglaises et indexées côté anglais — elles y répondaient 404.

Aucun secret commité, aucune fuite inter-utilisateur, aucun canonical vers un
domaine d'aperçu, aucun `openGraph` sans `images`, aucune régression de perf,
aucun hreflang non réciproque.

⚠️ **`npm run build` n'a pas été lancé**, conformément à `CLAUDE.md` § Commands
(note du 2026-08-08 : depuis une session cloud la génération tourne au-delà de
4 h 30 sans finalisation et meurt en `ENOSPC`). Cf. § 5.

⚠️ **L'egress vers la production est refusé depuis cette routine** (403 CONNECT
sur `www.mavilleideale.fr` et `bestcitiesinfrance.com`, confirmé par
`__agentproxy/status`). Le défaut n° 3 est donc établi **par lecture du code**
— la démonstration est en §2.3 et elle ne dépend d'aucune hypothèse sur
Cloudflare — mais il n'a pas pu être constaté en ligne.

---

## 1. Vérifié — conforme

### Sync + outillage (étape 1)
- `git checkout main && git pull --rebase origin main` — à jour, arbre propre.
  Aucun `stash`, aucun force-push.
- `npm install` — aucune vulnérabilité annoncée.
- `npx tsc --noEmit` — **0 erreur**, avant et après les corrections.
- `npm run integrity` — vert : 540 villes, guides FR **980** / EN **707**, 0 score
  brut recopié, 540 villes × 4 212 signaux, **+ les deux contrôles neufs** (§3).
- `npm run hreflang:check` — OK. 39 sous-pages ville FR, 40 EN, 39 paires.
- `npm run search-index:check` — à jour (FR et EN).
- `npm run parity` — FR 217 · EN 165, **0 route FR sans jumelle EN**.

### Complétude des routes (étape 2)
- `npm run sitemap:check` — **vert dans les deux sens, les deux locales** :
  FR 29 047 URL / 18 chunks / 131 routes statiques / 86 familles dynamiques ;
  EN 28 584 URL / 21 chunks / 77 routes statiques / 88 familles dynamiques.
  Les deux défauts distincts que demande l'étape 2 (route sans entrée sitemap ;
  entrée sitemap sans route) sont absents. Aucune `page.pending.tsx`.

### SEO (étape 3)
Balayage réel des métadonnées : les **382 `page.tsx`** ont été importées, leurs
`generateStaticParams()` jouées et `generateMetadata()` rendue sur un échantillon
de 8 jeux de params par famille — dont **systématiquement le slug le plus long**,
c'est-à-dire le pire cas de longueur de titre. 1 656 lignes, 0 erreur de rendu.

- **Canonical** : présent sur **toutes** les routes dynamiques, sans exception.
  Aucun `localhost`, aucun `*.pages.dev` / `*.workers.dev` / domaine d'aperçu.
  Aucun canonical FR pointant vers `bestcitiesinfrance.com` ni l'inverse.
- **Suffixe de marque** : **aucun titre > 60 ne porte la marque**. Le défaut
  §2.1 de l'audit précédent (1 080 titres EN suffixés « | Best Cities in France »)
  n'a pas régressé.
- **hreflang** : la réciprocité a été testée **paire par paire** — pour chaque
  page déclarant `languages`, la page visée a-t-elle bien été rendue, et
  redéclare-t-elle l'URL de départ ? Un hreflang non réciproque est ignoré par
  Google, donc c'est le contrôle qui compte. **0 asymétrie réelle** sur les
  1 656 lignes (les deux signalements bruts étaient des artefacts de mon
  indexation : `/quiz` FR — cf. §4.2 — et la racine FR, qui hérite du layout).
  `app/layout.tsx` émet toujours `fr / en / x-default`.
- **`openGraph` sans `images`** — le piège documenté (237 pages sans carte
  sociale le 2026-08-03) : balayage complet des `page.tsx` contenant `openGraph`,
  **0 page** sans `images:` et sans `opengraph-image.tsx` voisin.
- `app/robots.ts` : `/api/`, `/admin/`, `/auth` en `Disallow` ; `/dashboard`,
  `/favoris`, `/mes-villes`, `/connexion` et les jumelles EN `my-account` /
  `sign-in` en **`index: false` par metadata**, jamais par `Disallow` — le bon
  choix, argumenté dans le fichier. Chunks dérivés de `SITEMAP_CHUNK_COUNT`.
- **`alt`** : 0 `<img>` sans `alt` dans `app/` et `components/`.

### Intégrité des données (étape 4 — sondage)
- **540 villes**, 0 violation de bornes : `global ∈ [2,8 – 8,6]`, les 8 axes finis
  dans `[0, 10]`. 0 slug dupliqué dans le seed.
- Guides : **FR 980**, **EN 707**, 0 slug dupliqué de part et d'autre
  (`assertUniqueSlugs` rejouée pour de vrai par `npm run integrity`).
- **3 villes tirées** — Romans-sur-Isère (6,0), Argentan (6,3),
  Sainte-Geneviève-des-Bois (4,6) : les deux arbres lisent le même
  `CITIES_SEED`, donc affichent les mêmes nombres.
- Surface neuve de la semaine (`3463dc9`, prix DVF) : `/villes/[slug]/logement` et
  `/cities/[slug]/housing` importent **le même `cityPropertyPrices`** et **le même
  `PropertyPriceTable`** — les jumelles hreflang ne peuvent pas diverger par
  construction. C'est le contrôle qui a attrapé les deux vrais bugs de score du
  projet, et il passe.

### Perf (étape 5)
- **Aucun composant client n'importe `@/data/guides`, `@/data/guides-en` ni
  `@/lib/guide-tags`** : le correctif `46358bd` (5,9 Mo → 668 Ko) tient.
- Ma correction §2.1 a été écrite sous cette contrainte, et c'est le point
  intéressant : `lib/site-stats.ts` lit `GUIDES` et `TAG_SLUGS`, donc l'importer
  depuis `CopilotClient.tsx` ou `lib/city-narrative.ts` aurait expédié le corpus
  entier dans le bundle client pour afficher un nombre à trois chiffres. Les deux
  passent donc par une prop / une formule sans nombre. Vérifié après coup :
  **0 composant client n'importe `site-stats`**.
- `framer-motion` : toujours **aucun import réel**. Cf. §4.3.

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt et un balayage de préfixes
  (`xkeysib-`, `sk-ant-`, `ghp_`, `AKIA…`, `BEGIN PRIVATE KEY`) ne remontent que
  des citations dans d'anciens rapports d'audit. Seul `.env.example` est versionné.
- Les **20 handlers du Worker** repassés un par un : tout POST public porte un
  `rateLimit` (+ `rateLimitD1` par cible sur ce qui envoie un e-mail), toute
  lecture privée est scopée sur `user.id` via `authedUser`, **aucune réponse ne
  peut retourner la donnée d'un autre compte**.
  - Un point vérifié plutôt que supposé : `POST /api/favorites` accepte un tableau
    `merge` **sans le valider dans le handler**. Ce n'est pas une faille — la
    validation est dans le store (`mergeFavorites` filtre au regex de slug et
    plafonne à 200 entrées). Noté ici pour que le prochain audit ne le
    re-signale pas comme un trou.
  - `worker/index.ts` n'avait pas bougé depuis l'audit précédent ; c'est moi qui
    l'ai modifié ce run (§2.3), de façon **purement additive** : la nouvelle règle
    ne peut s'appliquer qu'à des chemins qui répondent 404 aujourd'hui, et le
    contrôle §3 le prouve à chaque `npm run integrity`.

---

## 2. Cassé — trouvé cette semaine

### 2.1 🔴 « 352 villes » — le site annonçait 188 villes de moins qu'il n'en classe, sur ~2 170 pages — corrigé

Le seed est passé de 352 à **540 villes**. Le nombre, lui, était **écrit en dur en
24 endroits** et n'a pas suivi. Ce n'est pas une coquille d'affichage : c'est la
promesse commerciale du site, fausse de 35 %, sur les deux domaines.

Le pire est le plus discret. `lib/city-narrative.ts` termine l'intro de **chaque
fiche ville** par :

```
Score global 6,3/10, calibré sur 352 villes.
Overall score 6.3/10, calibrated across 352 cities.
```

`CityProfile` étant partagé par les deux locales, cette phrase partait sur les
**540 pages ville FR + 540 EN**. Idem pour la note de méthode de
`/villes/[slug]/profils` et `/cities/[slug]/profiles` (**540 + 540**), et pour les
métadonnées de 10 pages outils (`copilot` FR/EN, `vibe` FR/EN, `projection-5ans`
FR/EN, `city-match` EN, `climate-2040-timelapse` EN, `outils`, et la
`metaDescription` du thème `villes-regrets-achat`). **~2 170 pages au total.**

Rien ne pouvait le voir : `tsc` type un nombre, il ne le compte pas ;
`npm run integrity` contrôle les scores cités, pas les effectifs ; et le contrôle
de citations FR/EN ne se déclenche pas, puisque **les deux locales étaient
fausses de la même façon**.

`lib/site-stats.ts` existe précisément pour ça (`CITIES_COUNT`, dérivé du seed) et
était déjà importé par ~40 pages. Les surfaces serveur l'importent désormais.

Deux endroits ne le pouvaient pas, et méritent d'être notés parce que la
tentation de « simplifier » y est forte :
- **`app/copilot/CopilotClient.tsx`** (`"use client"`) reçoit maintenant
  `citiesCount` en **prop**. Y importer `site-stats` aurait embarqué `GUIDES` +
  `TAG_SLUGS` dans le bundle client — le piège de `CLAUDE.md` § Performance.
- **`lib/city-narrative.ts`** est atteint par `CityProfile`, donc client. La
  phrase **ne cite plus de nombre** (« calibré sur l'ensemble des villes du
  site » / « across every city we cover ») : une formule sans nombre ne périme
  pas, et ne coûte pas un octet de bundle.

`app/projection-5ans/ProjectionClient.tsx` avait déjà `cities` en props : il lit
`cities.length`.

### 2.2 🟠 Le glossaire annonçait 33 termes, il en publie 142 — corrigé + garde

`lib/site-stats.ts` : `GLOSSARY_TERMS_COUNT = 33`, avec en commentaire
« Update this constant when terms are added there ». Personne ne l'a fait. La
page en compte **142** (`grep -c 'term: "'`, chiffre que `CLAUDE.md` documente
déjà depuis le 2026-08-19).

Ce nombre est affiché sur **4 surfaces** : `/outils`, `/recherche`, la carte OG du
glossaire et `components/StaticPageCrossLink.tsx`. Le site sous-vendait donc d'un
facteur 4 une de ses pages les plus utiles — dans une meta description, c'est-à-dire
là où ça se lit avant le clic.

Constante mise à 142, **et le commentaire remplacé par un contrôle** : cf. §3.

### 2.3 🟠 Les 15 redirections des guides EN dédoublonnés ne pouvaient pas partir sur le domaine anglais — corrigé + garde

Le dédoublonnage EN du 2026-06-04 a supprimé 15 guides quasi identiques et posé un
301 par slug retiré dans `public/_redirects` :

```
/guides/france-healthcare-how-it-works-for-expats-2026 /guides/france-healthcare-guide-expats-2026 301
```

Les 15 sources **et** les 15 cibles sont des slugs **anglais** (vérifié contre
`EN_GUIDES` : les 15 cibles existent, les 15 sources sont absentes des deux
corpus). Les URL à sauver étaient donc indexées sur **bestcitiesinfrance.com**.

Or sur le domaine EN, `worker/index.ts` réécrit le chemin **avant** de passer la
main aux assets (`run_worker_first = ["/*", "!/_next/*"]` dans les deux
`wrangler.toml`) :

```ts
if (locale === "en" && path !== "/en" && !path.startsWith("/en/")) {
  enUrl.pathname = `/en${path}`;              // /guides/x  →  /en/guides/x
  const enAsset = await env.ASSETS.fetch(new Request(enUrl, request));
```

Le chemin présenté aux assets est `/en/guides/<slug>`. La règle, écrite sur
`/guides/<slug>`, **ne le rencontre jamais** — quelle que soit la façon dont
Cloudflare applique `_redirects`. L'asset n'existe pas, `isInfraFile` est faux,
et le Worker sert `serve404()`. Les 15 URL répondaient donc **404 sur le domaine
où elles étaient indexées**, c'est-à-dire exactement ce que ces redirections
étaient censées éviter.

Symétriquement, sur le domaine FR ces 15 règles visent un slug anglais absent du
corpus français : **un 301 vers un 404**. Cf. §4.1.

Corrigé sur le modèle déjà en place dans le fichier, au même endroit et avec la
même justification que le repli `frPathToEn` (« un 301 vaut toujours mieux qu'un
404 sur une URL indexée ») : une table `RETIRED_EN_GUIDES` consultée sur le
domaine EN, qui 301 vers l'**URL propre** `https://bestcitiesinfrance.com/guides/<cible>`
— pas vers `/en/guides/…`, qui est l'arbre d'assets interne et n'a pas à être
exposé. Purement additif : les 15 sources répondent 404 aujourd'hui, donc la
règle ne peut masquer aucun contenu vivant.

**Non vérifié en ligne** : l'egress est refusé depuis cette routine (403 CONNECT).
La démonstration ci-dessus ne repose que sur le code du Worker et des deux
`wrangler.toml`. Un `curl` depuis une session locale sur
`https://bestcitiesinfrance.com/guides/best-french-cities-families-2026`
(404 attendu avant déploiement, 301 après) le confirmerait en dix secondes.

---

## 3. Corrigé

19 fichiers. Aucun score déplacé, aucun refactor structurel, aucune migration D1,
**aucun déploiement**. `tsc`, `integrity`, `hreflang:check`, `search-index:check`,
`parity` et `sitemap:check` sont verts après coup, et le balayage de métadonnées
rejoué confirme **0 régression** (587 titres > 60 et 252 descriptions > 160 avant
comme après, sur l'échantillon : les corrections ne touchent aucune longueur —
« 352 » et « 540 » font trois caractères).

| # | Correction | Fichier |
|---|---|---|
| 1 | Intro de fiche ville : plus de nombre en dur (1 080 pages) | `lib/city-narrative.ts` |
| 2 | Note de méthode `{CITIES_COUNT}` (540 pages) | `app/villes/[slug]/profils/page.tsx` |
| 3 | Idem, jumelle EN (540 pages) | `app/[locale]/cities/[slug]/profiles/page.tsx` |
| 4 | `citiesCount` en prop (pas d'import corpus côté client) | `app/copilot/CopilotClient.tsx` |
| 5 | `cities.length` au lieu du littéral | `app/projection-5ans/ProjectionClient.tsx` |
| 6-13 | `CITIES_COUNT` dans les métadonnées | `app/copilot/page.tsx`, `app/[locale]/copilot/page.tsx`, `app/vibe/page.tsx`, `app/[locale]/vibe/page.tsx`, `app/projection-5ans/page.tsx`, `app/[locale]/projection-5ans/page.tsx`, `app/[locale]/city-match/page.tsx`, `app/[locale]/climate-2040-timelapse/page.tsx` |
| 14 | `CITIES_COUNT` (déjà importé) | `app/outils/page.tsx` |
| 15 | `${CITIES_SEED.length}` dans la `metaDescription` | `lib/red-flag-themes.ts` |
| 16 | Commentaire d'en-tête périmé | `lib/compatibility.ts` |
| 17 | `GLOSSARY_TERMS_COUNT` 33 → **142** | `lib/site-stats.ts` |
| 18 | `RETIRED_EN_GUIDES` + 301 sur le domaine EN | `worker/index.ts` |
| 19 | **Deux contrôles neufs** (ci-dessous) | `scripts/check-integrity.mjs` |

### Les deux gardes ajoutées

La culture du dépôt est claire (`assertUniqueSlugs`, `search-index:check`,
`hreflang:check`) : une donnée dérivée doit **échouer bruyamment** quand sa source
bouge, pas mentir en silence. Les défauts §2.2 et §2.3 sont exactement des
chiffres et des chaînes qu'aucun type ne relie à leur source. `npm run integrity`
les relie désormais, pour deux lectures de fichier :

```
  ok  301 EN     15 guides retirés, cibles vivantes
  ok  glossaire  142 termes
```

- **glossaire** — recompte les `term: "` de `app/glossaire/page.tsx` et échoue si
  `GLOSSARY_TERMS_COUNT` diverge, en nommant la valeur attendue et les 4 surfaces
  concernées. *Testé dans les deux sens* : à 141 déclarés pour 142 réels, échec
  avec le bon message ; remis à 142, vert.
- **301 EN** — croise `RETIRED_EN_GUIDES` (Worker), `public/_redirects` et
  `EN_GUIDES`. Échoue si une redirection vise un slug absent du corpus (301 vers
  un 404), si elle masque un guide vivant, ou si les deux fichiers divergent — ce
  dernier cas étant précisément ce qui a produit §2.3. *Testé* : une cible
  bidonnée remonte les 3 anomalies attendues.

Conséquence pour les autres agents : **ajouter un terme au glossaire fait
désormais échouer `npm run integrity`** tant que la constante n'est pas mise à
jour. C'est voulu, et le message dit quoi faire.

---

## 4. À arbitrer

### 4.1 Les 15 mêmes règles restent, côté FR, des 301 vers un 404

Je n'ai **pas** touché `public/_redirects` : le correctif §2.3 est additif, et le
nouveau contrôle exige que les deux fichiers disent la même chose. Reste que sur
`www.mavilleideale.fr` ces 15 règles 301 vers un slug anglais que le corpus FR n'a
pas. Coût réel : quasi nul (personne ne demande une URL de guide anglais sur le
domaine français). Options, à trancher hors routine : les déplacer sous un
préfixe qui ne matche que l'arbre EN, ou les retirer de `_redirects` en laissant
le Worker seul maître — auquel cas il faut adapter le contrôle §3, qui les croise.

### 4.2 `app/quiz/page.tsx` : une page complète qui n'est jamais servie

`/quiz` est 301 vers `/city-match` dans `public/_redirects`, et la page se déclare
elle-même `canonical: "/city-match"`. Elle n'est pas au sitemap. Elle est donc
**générée à chaque build et jamais atteignable** — 1 page morte dans l'export,
avec son `QuizFlow`, son JSON-LD et son entretien. Ce n'est pas un bug (le
comportement en ligne est correct), c'est une dette : le prochain agent qui la
lira croira qu'elle est vivante. Suppression franche recommandée, mais c'est un
retrait de contenu, donc arbitrage propriétaire. **Ne pas confondre avec la
jumelle EN `/quiz`**, qui est un vrai hub, canonique d'elle-même et au sitemap —
elle n'est pas concernée par le 301, la réécriture de locale la protégeant (§2.3).

### 4.3 Rappels d'arbitrages déjà ouverts

- **~250 descriptions > 160 sur ~148 gabarits** (échantillon de 8 params par
  famille). Chiffres à jour du même constat que §4.1 de l'audit précédent :
  l'essentiel est entre 161 et 175, dense en chiffres, sans queue de remplissage —
  un `clampMeta` couperait en plein milieu d'un montant. Les plus gros émetteurs
  sont désormais des **hubs statiques** (`/synthese` 250, `/palmares` 238,
  `/environnement` 225, `/sante` 210, `/classements` 208, `/securite` 207), donc
  une chaîne éditoriale par fichier : c'est une réécriture, pas un correctif
  mécanique, et elle mérite un run dédié plutôt que la routine du dimanche.
- **~590 titres > 60** (échantillon) : quasi tous des gabarits de sous-pages ville
  où c'est le **nom de ville** qui allonge. Segment de tête ≤ ~37 caractères, donc
  la ville et l'année survivent à la troncature. **Pas un défaut** — arbitrage déjà
  acté (audit 2026-08-09 §4.6, 2026-08-16 §4.2). À ne pas confondre avec un
  suffixe de marque, dont il ne reste aucun (§1).
- **`framer-motion` toujours déclaré dans `package.json`** et importé nulle part.
  Zéro octet atteint le bundle. `npm uninstall` touche `package-lock.json`, que
  ~15 agents modifient en semaine — **sixième report consécutif**, à faire dans
  une fenêtre calme. Le report est raisonnable une fois ; à six, il vaudrait mieux
  planifier le run dédié que le reconduire.
- **Workflow social** (`n8n/workflows/social-media-daily.json`) : 27 scores en dur
  en désaccord avec le pipeline (jusqu'à 1,6 point), **et il porte aussi le
  « 352 villes » corrigé en §2.1** — sur un canal sortant, cette fois. Je ne l'ai
  pas touché, cohérent avec la décision de l'audit du 2026-08-09 : c'est un
  fichier de configuration d'une automatisation externe que je ne peux pas
  tester, et corriger les scores déplace 27 nombres publiés. Le compte de villes,
  lui, est une simple erreur de fait et pourrait partir seul.
- **Classement biodiversité** : ne pas recréer `/classements/biodiversite` ni
  remettre `RICHNESS_RANKING_PUBLISHED = true` (retiré le 2026-08-10 — la mesure
  classait le type de programme de saisie). Zones protégées INPN toujours 0/540.
  Rien à faire côté routine.
- **R7.10 em-dash** : deux séries récentes au-dessus de la cible restent à
  repasser à la main. Hors périmètre « correction sûre ».

---

## 5. Écart avec le prompt de la routine

Deux, dont un nouveau.

**L'étape 1 demande `npm run build`**, que `CLAUDE.md` interdit désormais depuis
une session cloud (§ Commands, note du 2026-08-08 : > 4 h 30 sans finalisation,
`.next` à 25 Go, `ENOSPC`). J'ai suivi `CLAUDE.md`. Le substitut — `tsc` +
`npm run integrity` (qui rejoue les vraies gardes en 2 s) + `hreflang:check` /
`search-index:check` / `sitemap:check` / `parity`, plus le rendu réel des 382
`generateMetadata` — couvre ce qu'un build validerait côté contenu, en quelques
minutes. **Troisième semaine que je le signale** : je recommande que l'étape 1 du
prompt remplace `npm run build` par cette combinaison.

**Nouveau — l'étape 2 et l'étape 3 supposent qu'on peut interroger les sites.**
L'egress est refusé depuis la routine (403 CONNECT sur les deux domaines). Tout ce
qui touche au **comportement d'edge** — redirections, canonicalisation d'hôte,
`robots.txt` réellement servi, propagation d'un déploiement — n'est donc
vérifiable qu'**en lisant le Worker**, jamais en le constatant. C'est exactement
la classe de défaut de §2.3, et elle a survécu deux mois et demi précisément parce
qu'aucun audit ne pouvait la voir. Deux pistes pour l'étape 2 : autoriser
l'egress vers les deux domaines de production depuis cette routine, ou déclarer
explicitement le comportement d'edge hors périmètre pour qu'il soit contrôlé
ailleurs. En l'état, je l'ai audité par lecture — ce qui marche, mais ne prouve
pas l'état de la production.
