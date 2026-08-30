# Ultra-audit hebdomadaire — 2026-08-30

Audit autonome du dimanche. 7 commits depuis le dernier audit (2026-08-23), tous
de contenu ou de documentation sauf un correctif JSON-LD.

Le run a trouvé **un défaut réel invisible à l'outillage existant** et deux erreurs
de fait qui traînaient, et les a corrigés — plus une garde pour que le premier ne
puisse pas revenir :

1. Les **722 pages `/comparer/<a>-vs-<b>` partaient sans carte sociale**. C'est le
   piège `openGraph` du 2026-08-03, dont le correctif n'avait touché qu'**une des
   deux branches** du même fichier : les 49 triplets et la jumelle EN avaient leur
   `images`, les 722 paires non. Le balayage prescrit alors ne pouvait pas le voir.
2. **`CLAUDE.md` annonçait lui-même 352 villes** en trois endroits, et sa table de
   référence de l'échelle de couleurs portait les effectifs de ces 352 villes —
   elle sous-estimait le palier violet d'un facteur 6 (« ~3 (0,9 %) » pour 19 (3,5 %)).
3. Le workflow social publiait toujours **« 352 villes »** quatre fois par jour sur
   quatre plateformes — le seul reliquat sortant du défaut §2.1 de l'audit précédent.

Aucun secret commité, aucune fuite inter-utilisateur, aucun canonical vers un
domaine d'aperçu, aucun hreflang non réciproque, aucune régression de perf, aucun
écart FR/EN sur un nombre publié.

⚠️ **`npm run build` n'a pas été lancé**, conformément à `CLAUDE.md` § Commands
(note du 2026-08-08). Substitut détaillé en §5 — **quatrième semaine que je le
signale**.

⚠️ **L'egress vers la production reste refusé depuis cette routine.** Tout ce qui
relève du comportement d'edge n'est audité que par lecture du Worker. Cf. §5.

---

## 1. Vérifié — conforme

### Sync + outillage (étape 1)
- La session démarrait en **`HEAD` détaché** sur `refs/heads/main` — arbre propre,
  aucun travail en cours à préserver. `git checkout main && git pull --rebase
  origin main` : à jour sur `c6ba9b3`. Aucun `stash`, aucun force-push.
- `npm install` — aucune vulnérabilité annoncée.
- `npx tsc --noEmit` — **0 erreur**, avant et après les corrections.
- `npm run integrity` — vert : 540 villes, guides **FR 1 026 / EN 780**, 0 score
  brut recopié, 540 villes × 4 284 signaux, les deux gardes de l'audit précédent,
  **+ la garde neuve** (§3).
- `npm run hreflang:check` — OK. 39 sous-pages ville FR, 40 EN, 39 paires.
- `npm run search-index:check` — à jour (FR et EN).
- `npm run parity` — FR 219 · EN 166, **0 route FR sans jumelle EN**.

### Complétude des routes (étape 2)
- `npm run sitemap:check` — **vert dans les deux sens, les deux locales** :
  FR 29 104 URL / 18 chunks / 133 routes statiques / 86 familles dynamiques ;
  EN 28 666 URL / 21 chunks / 78 routes statiques / 88 familles dynamiques.
  Les deux défauts distincts que demande l'étape 2 (route sans entrée sitemap ;
  entrée sitemap sans route) sont absents. Aucune `page.pending.tsx`.
- Note de méthode : l'étape demande « 2 slugs par groupe ». `sitemap:check` fait
  strictement mieux et sans réseau — il **exécute** les `generateStaticParams()`
  réels et compare l'ensemble complet des URL déclarées à l'ensemble complet des
  paramètres générés, dans les deux sens, sur les 174 familles dynamiques des deux
  locales. Un sondage à 2 slugs ne prouverait rien de plus.

### SEO (étape 3)
Balayage réel des métadonnées : les **385 `page.tsx`** importés, leurs
`generateStaticParams()` joués et `generateMetadata()` rendue sur un échantillon de
8 jeux de params par famille — dont **systématiquement le slug le plus long**,
c'est-à-dire le pire cas de longueur de titre. **785 lignes FR + 745 EN**.

- **Canonical** : présent sur **toutes** les routes dynamiques des deux locales,
  sans exception (0 page sans canonical). Aucun `localhost`, aucun `*.pages.dev` /
  `*.workers.dev` / domaine d'aperçu. Aucun canonical FR pointant vers
  `bestcitiesinfrance.com` ni l'inverse.
- **Suffixe de marque** : 13 titres FR et 29 EN portent la marque, **tous ≤ 57
  caractères**. C'est ce que `CLAUDE.md` autorise (« a page may append the brand
  only if the result stays ≤ 60 »), pas le défaut que vise le prompt. Le
  `title.template` du layout reste un `%s` nu.
- **hreflang** : réciprocité testée **paire par paire** sur les 1 530 lignes — pour
  chaque page déclarant `languages`, la page visée a-t-elle été rendue, et
  redéclare-t-elle l'URL de départ ? **0 asymétrie réelle.** Les 3 signalements
  bruts sont des artefacts de mon indexation, tous trois expliqués : `/quiz` FR
  écrase la clé `/city-match` (page alias, cf. §4.2), `/leaderboard` FR n'est pas
  chargeable par mon transpileur CommonJS (cf. §4.5), et la racine FR n'exporte pas
  de `metadata` — elle hérite du layout, qui émet `fr / en / x-default`.
- **`openGraph` sans `images`** : **1 défaut réel trouvé** (§2.1), corrigé et gardé.
- `app/robots.ts` : `/api/`, `/admin/`, `/auth` en `Disallow` ; `/dashboard`,
  `/favoris`, `/mes-villes`, `/connexion` et les jumelles EN `my-account` /
  `sign-in` en **`index: false` par metadata** — vérifié en rendant les
  métadonnées, pas en lisant le fichier. Chunks dérivés de `SITEMAP_CHUNK_COUNT`.
- **`alt`** : 0 `<img>` sans `alt` dans `app/` et `components/`.
- **Canonicals dupliqués** (contrôle neuf) : 2 en FR, 0 en EN, les deux
  volontaires — `/dashboard` → `/mes-villes` et `/quiz` → `/city-match`, l'un et
  l'autre `noindex` ou 301. Pas d'auto-cannibalisation.

### Intégrité des données (étape 4 — sondage)
- **540 villes**, 0 violation de bornes : `global ∈ [2,8 – 8,6]`, les 8 axes finis
  dans `[0, 10]`. 0 slug dupliqué.
- Guides : **FR 1 026**, **EN 780**, 0 slug dupliqué de part et d'autre
  (`assertUniqueSlugs` rejouée pour de vrai par `npm run integrity`).
- **3 villes tirées** — Saint-Denis de La Réunion (5,7), Troyes (6,2),
  Courbevoie (5,9) : scores numériques, dans les bornes, `computeNicheScores`
  cohérent.
- **Le contrôle FR/EN, fait en grand plutôt qu'en sondage.** C'est celui qui a
  attrapé les deux vrais bugs du projet, donc je l'ai poussé au-delà des 3 villes :
  les 5 sous-pages ville dont le moteur mesure une difficulté (santé, sécurité,
  air, démographie, services publics) ont été vérifiées comme lisant **le même
  moteur** des deux côtés (`computeHealthcareAccess`, `computeSafetyDeep`,
  `computeAirQuality`, `computeDemography`, `computePublicServices`), et appliquant
  **la même inversion** au même site d'affichage. Restait un écart d'écriture — FR
  arrondit avec `.toFixed(1)`, EN avec `Math.round(x*10)/10` — qui pourrait diverger
  d'un dixième sur un cas limite : **13 500 valeurs comparées sur les 540 villes,
  0 écart**. Les jumelles hreflang affichent le même nombre, prouvé et non supposé.
- Un comptage brut d'inversions `10 - x` par fichier remonte 7 « asymétries » FR/EN
  qui n'en sont pas : les pages FR embarquent le nombre en plus dans leur
  `description` et leur FAQ, et bruit / eau / risques utilisent `hazardColor` côté
  EN contre une palette par niveau côté FR — les deux traitements documentés. À ne
  pas re-signaler sur la foi d'un `grep -c`.

### Perf (étape 5)
- **Graphe d'imports tracé pour de vrai**, depuis les 84 composants client, en
  suivant les imports transitifs et en écartant les `import type`. Résultat : sur
  les 11 JSON > 100 Ko du dépôt, **3 seulement sont atteignables côté client**, et
  ce sont exactement les trois documentés :
  - `data/search-index.json` / `.en.json` — la projection **faite pour ça** ; un
    seul des deux part, la locale étant inlinée au build ;
  - `data/city-population.json` (140 Ko) via `CityProfile → DemographyCard →
    lib/demography` — le levier connu de `CLAUDE.md`, explicitement réservé à une
    passe locale.
  Les gros fichiers (`city-parks` 2,5 Mo, `city-biodiversity` 1,9 Mo, `city-news`
  1,7 Mo, `city-protected-areas` 1,1 Mo) sont **hors du graphe client**. La
  discipline tient.
- **Aucun composant client n'importe `@/data/guides`, `@/data/guides-en`,
  `@/lib/guide-tags` ni `@/lib/rankings`.** Le seul `@/data/cities-seed` restant
  (`CityProfile`) est un `import type`, effacé à la compilation.
- **L'index de recherche a grossi** — mesuré : FR 267 Ko brut / **40 Ko gzip**,
  EN 204 Ko / **32 Ko gzip**, contre les 187 / 98 Ko bruts notés dans `CLAUDE.md`.
  Ce n'est pas une régression : `SearchPaletteLauncher` charge la palette en
  `next/dynamic` au **premier déclenchement** de recherche, donc une page où
  personne ne cherche ne télécharge rien. Tendance à garder à l'œil quand même,
  cf. §4.4.
- `framer-motion` : toujours **aucun import réel**, seulement deux mentions en
  commentaire. Cf. §4.3.

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt et un balayage de préfixes
  (`xkeysib-`, `sk-ant-`, `ghp_`, `AKIA…`, `BEGIN PRIVATE KEY`) ne remontent que
  des citations dans d'anciens rapports d'audit. Seul `.env.example` est versionné.
- `worker/index.ts` **n'a pas bougé** cette semaine (ni les stores, ni
  `spam-filter`, ni `rate-limit`). Repassé quand même, handler par handler :
  - **tout POST public porte un `rateLimit`** — contact, feedback, newsletter (×2),
    alertes, auth request-link / verify, reviews, quiz, copilot, city summary ;
    les endpoints qui envoient un e-mail ou appellent Anthropic ajoutent un
    `rateLimitD1` journalier ;
  - **toute lecture privée est scopée sur `user.id`** via `authedUser` —
    `/api/auth/me`, `/api/account`, `/api/favorites`, `/api/projections`,
    `/api/alertes/list`. Aucune réponse ne peut retourner la donnée d'un autre
    compte ;
  - `POST /api/auth/handle` est le seul POST sans `rateLimit`, mais il est
    authentifié (401 sans session) et valide son entrée au regex `HANDLE_RE` avant
    d'écrire. Noté pour que le prochain audit ne le re-signale pas comme un trou.
  - Rappel de l'audit précédent, toujours vrai : `POST /api/favorites` accepte
    `merge` sans le valider dans le handler ; la validation est dans le store
    (`mergeFavorites` filtre au regex de slug et plafonne à 200). Pas une faille.

---

## 2. Cassé — trouvé cette semaine

### 2.1 🔴 Les 722 pages `/comparer/<a>-vs-<b>` partaient sans carte sociale — corrigé + garde

`CLAUDE.md` documente le piège depuis le 2026-08-03 : un `openGraph` de page
**remplace** celui hérité de la racine, donc en déclarer un sans `images` n'émet
**aucun** `og:image`. 237 pages avaient été livrées comme ça.

Le correctif d'alors a laissé une branche derrière lui, dans un fichier qu'il avait
pourtant ouvert. `app/comparer/[pair]/page.tsx` a **deux** branches de
`generateMetadata` : les triplets (`a-vs-b-vs-c`) et les paires (`a-vs-b`). Seule
la première a reçu `images`, commentaire d'explication compris :

```ts
if (parts.length === 3) {
  return { …, openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine…
    images: ["/opengraph-image"],   // ← branche triplet : corrigée
  } };
}
…
return { …, openGraph: {
  title: `${a.name} vs ${b.name} · Quelle ville choisir ?`,   // ← branche paire : oubliée
} };
```

Compté en exécutant le vrai `generateStaticParams()` : **771 pages, dont 722
paires et 49 triplets**. Les 49 triplets avaient leur carte, les **722 paires non**
— et la jumelle EN `app/[locale]/compare/[pair]` l'avait des deux côtés, ce qui rend
l'oubli d'autant plus discret : le comparateur anglais était correct.

**Pourquoi rien ne pouvait le voir.** Le balayage prescrit par `CLAUDE.md` — « pour
chaque `page.tsx` contenant `openGraph`, le signaler s'il n'a ni `images:` ni
`opengraph-image.tsx` voisin » — rend ce fichier **conforme** : il contient bien un
`images:`. Il en faut deux. `tsc` type un objet, il ne compte pas ses branches, et
l'audit du 2026-08-23 avait relancé le balayage tel quel et conclu « 0 page ».

Corrigé (une ligne, `images: ["/opengraph-image"]` dans la branche paire) **et
gardé** : cf. §3.

### 2.2 🟠 `CLAUDE.md` annonçait 352 villes, et sa table de référence était fausse d'un facteur 6 — corrigé

L'audit précédent a purgé le « 352 villes » de ~2 170 pages du site. Il en restait
dans le fichier que **tous les agents lisent avant d'écrire une ligne** :

- ligne 49, l'arbre du projet : « `cities-seed.ts` # 352 cities, raw seed » ;
- ligne 1528, § Bilingual : « EN pages use the same pattern (352 cities at build) » ;
- ligne 104, la **table de l'échelle de couleurs de score**, dont les effectifs
  avaient été calculés sur ces 352 villes.

Le troisième est le plus nuisible, parce que ce n'est pas un compte mais un repère
de jugement. Recalculé en exécutant `CITIES_SEED` (donc après calibrage et
normalisation, jamais en lisant le seed source) :

| Palier | Table d'avant | Réel sur 540 |
|---|---|---|
| ≥ 7,5 violet | ~3 (0,9 %) | **19 (3,5 %)** |
| ≥ 7,0 vert | ~22 (6,3 %) | **50 (9,3 %)** |
| ≥ 6,0 lime | ~116 (33 %) | **151 (28,0 %)** |
| ≥ 5,0 ambre | ~116 (33 %) | **141 (26,1 %)** |
| ≥ 4,0 orange | ~63 (18 %) | **100 (18,5 %)** |
| < 4,0 rouge | ~48 (14 %) | **79 (14,6 %)** |
| moyenne | ≈ 5,42 | **≈ 5,46** |

Le palier violet était donné pour « très rare » et six fois trop bas. Un agent qui
s'y fie pour décider si un score de 7,6 est remarquable se trompe. Table remplacée,
avec la date de mesure et la consigne de recompter après tout ajout de villes.

### 2.3 🟠 Le workflow social publiait « 352 villes » quatre fois par jour — corrigé

`n8n/workflows/social-media-daily.json` porte le générateur de posts quotidiens.
Quatre de ses gabarits — threads, Instagram, LinkedIn, Twitter — annonçaient
« 352 villes analysées ». C'est le seul reliquat **sortant** du défaut §2.1 de
l'audit du 2026-08-23, qui l'avait laissé en arbitrage tout en notant que « le
compte de villes est une simple erreur de fait et pourrait partir seul ».

Deux audits l'ayant signalé sans le corriger, je l'ai fait — et strictement lui.
Remplacement littéral dans la chaîne `jsCode`, **diff d'une ligne**, JSON revalidé
par `json.loads` avant et après. Une première tentative par re-sérialisation du
document a reformaté 298 lignes : annulée, parce qu'un diff illisible sur un
fichier de configuration que je ne peux pas exécuter est un risque en soi.

⚠️ **Les 27 scores en dur du même fichier n'ont pas été touchés**, conformément à
l'arbitrage du 2026-08-09 : les corriger déplacerait 27 nombres publiés. Cf. §4.6.

---

## 3. Corrigé

4 fichiers. Aucun score déplacé, aucun refactor structurel, aucune migration D1,
**aucun déploiement**.

| # | Correction | Fichier |
|---|---|---|
| 1 | `images: ["/opengraph-image"]` dans la branche paire (722 pages) | `app/comparer/[pair]/page.tsx` |
| 2 | 352 → 540 (×2) + table de l'échelle de couleurs recalculée sur 540 | `CLAUDE.md` |
| 3 | « 352 villes » → « 540 villes » (×4) dans les gabarits de posts | `n8n/workflows/social-media-daily.json` |
| 4 | **Garde neuve** (ci-dessous) | `scripts/check-integrity.mjs` |

Vérifications après coup : `tsc` **0 erreur**, `integrity`, `hreflang:check`,
`search-index:check`, `parity`, `sitemap:check` tous verts. Le balayage de
métadonnées rejoué confirme **0 régression** : 253 titres > 60 et 136 descriptions
> 160 avant comme après (les corrections ne touchent aucune longueur), et les
pages `og` sans images passent de 22 à 14 — les 14 restantes étant les 7 gabarits
qui ont un `opengraph-image.tsx` voisin, lequel est bien hérité par toutes les
branches.

### La garde ajoutée — `ok  og:image  385 page.tsx`

La culture du dépôt est constante (`assertUniqueSlugs`, `search-index:check`,
`hreflang:check`, et les deux gardes de la semaine dernière) : une donnée dérivée
doit **échouer bruyamment** quand sa source bouge. Le défaut §2.1 est exactement du
même genre — une règle connue, appliquée à 50 %, qu'aucun type ne relie à son
énoncé.

`npm run integrity` compte désormais, pour chacun des 385 `page.tsx`, les blocs
`openGraph: {` et les `images: [`, et **échoue si le second est inférieur au
premier**. Un fichier voisin d'un `opengraph-image.tsx` est dispensé — ce
sibling-là, lui, est bien hérité par toutes les branches.

C'est le comptage **par branche** qui est la nouveauté : le balayage historique
(« aucun `images:` du tout ») était aveugle au cas de la moitié corrigée, et c'est
précisément le cas qui s'est produit.

*Testé dans les deux sens* : le défaut réintroduit tel qu'il était fait échouer le
contrôle avec le bon message (`app/comparer/[pair]/page.tsx : 2 bloc(s) openGraph,
1 avec images`) ; restauré, vert. Coût : une lecture de 385 fichiers, ~0,1 s.

---

## 4. À arbitrer

### 4.1 ~136 descriptions FR et ~106 EN au-dessus de 160 caractères

Constat inchangé depuis trois audits, chiffres à jour. Les plus gros émetteurs sont
des **hubs statiques** — FR `/synthese` 250, `/palmares` 238, `/environnement` 225,
`/sante` 210, `/classements` 208 ; EN `/synthesis` 269, `/red-flags/themes` 242,
`/overall-ranking` 223. Ce sont des chaînes éditoriales par fichier, denses en
chiffres et sans queue de remplissage : `clampMeta` couperait en plein milieu d'un
montant. C'est une réécriture, pas un correctif mécanique, et elle mérite un run
dédié plutôt que la routine du dimanche. **63 FR et 36 EN sont sur des pages
statiques**, donc le lot est borné et faisable d'un coup.

### 4.2 ~253 titres FR et ~198 EN au-dessus de 60 — dont 34 + 12 sur des pages statiques

L'arbitrage existant (audits du 2026-08-09 §4.6 et 2026-08-16 §4.2) porte sur les
**gabarits de sous-pages ville**, où c'est le nom de ville qui allonge et où le
segment de tête ≤ ~37 caractères garantit que la ville et l'année survivent à la
troncature. Il tient, et je ne le rouvre pas.

Ce que j'ai séparé cette fois, parce que personne ne l'avait fait : **34 titres FR
et 12 EN sont sur des pages statiques**, c'est-à-dire des chaînes éditoriales
entièrement écrites à la main, du plus long au plus court —
`/red-flags/villes-risques-naturels` 93, `villes-bruit-cauchemar` 86,
`villes-sans-eau-ete` 86, `villes-desert-medical` 83, `/cout-menage` 79 ;
EN `/overall-ranking` 75, `/salary-equivalent` 75, `/public-services` 70.

**Je ne les ai pas raccourcis, et c'est délibéré.** Google *indexe* le titre
complet et n'en *affiche* qu'une soixantaine de caractères : raccourcir revient à
supprimer des mots-clés indexés pour un gain purement cosmétique. Les 46 titres ont
été relus un par un : dans tous les cas le segment de tête identifie la page à 60
caractères (« Risques naturels 2026 — Villes françaises les plus exposé… »), la
queue ne portant que des précisions. L'arbitrage des sous-pages ville s'étend donc
à eux. Si le propriétaire préfère malgré tout maîtriser ce qui s'affiche, c'est un
lot borné de 46 chaînes — mais c'est un choix éditorial, pas un défaut.

### 4.3 Rappels d'arbitrages déjà ouverts

- **`app/quiz/page.tsx`** : page complète, 301 vers `/city-match`, canonique de
  `/city-match`, absente du sitemap — générée à chaque build et jamais atteignable.
  Dette, pas bug. Signalée le 2026-08-23 §4.2 ; toujours là. Elle a une
  conséquence de plus que je peux confirmer : elle **écrase la clé `/city-match`**
  dans tout contrôle qui indexe les pages par canonical, et produit donc un faux
  positif hreflang à chaque audit (§1). Suppression franche recommandée — retrait
  de contenu, donc arbitrage propriétaire. Ne pas confondre avec la jumelle EN
  `/quiz`, qui est un vrai hub canonique de lui-même.
- **`framer-motion` toujours déclaré dans `package.json`**, importé nulle part,
  zéro octet atteint le bundle. `npm uninstall` touche `package-lock.json`, que
  ~15 agents modifient en semaine — **septième report consécutif**. À sept, la
  recommandation de l'audit précédent tient plus que jamais : planifier le run
  dédié plutôt que reconduire le report.
- **Les 15 redirections de guides EN restent, côté FR, des 301 vers un 404**
  (2026-08-23 §4.1). Coût réel quasi nul, correctif non additif, inchangé.
- **`data/city-population.json` (140 Ko) sur les 1 080 pages ville** via
  `CityProfile → DemographyCard`. Remède connu (calculer côté serveur, descendre en
  props) mais il touche le rendu des pages ville : **passe locale avec build**,
  pas une routine.
- **Classement biodiversité** : ne pas recréer `/classements/biodiversite` ni
  remettre `RICHNESS_RANKING_PUBLISHED = true`. Rien à faire côté routine.
- **R7.10 em-dash** : deux séries récentes au-dessus de la cible. Hors périmètre
  « correction sûre ».

### 4.4 Nouveau — l'index de recherche grossit avec le corpus

`data/search-index.json` est passé de 187 Ko (mesure de `CLAUDE.md`) à **267 Ko**,
soit **40 Ko gzip** ; l'EN à 204 Ko / 32 Ko gzip. Il porte 1 026 guides FR et 780
EN, et le corpus gagne 6 à 9 guides par semaine — donc environ **+1 à 1,5 Ko gzip
par mois**, indéfiniment.

Ce n'est pas un défaut aujourd'hui : `SearchPaletteLauncher` charge la palette en
`next/dynamic` au premier déclenchement, donc la page moyenne ne paie rien. Mais le
commentaire de `lib/search-index.ts` justifie encore sa maigreur par « la palette,
montée par la Navbar sur toutes les pages » — vrai à l'écriture, plus vrai depuis le
code-splitting. Deux leviers le jour où ça compte, aucun urgent : couper `intro` /
`excerpt` de la projection guides, ou servir l'index en `fetch` au lieu de
l'embarquer. À mesurer avant d'agir, comme le veut `CLAUDE.md`.

### 4.5 Note d'outillage pour le prochain run

Mon transpileur CommonJS de balayage échoue sur `app/leaderboard/page.tsx`
(« Cannot access 'i18n_1' before initialization »). **Ce n'est pas un bug du
fichier** : il appelle `pathAlternates` ligne 15 dans un `export const metadata`
alors que l'`import` est ligne 30, ce qui est parfaitement valide en ESM (les
liaisons d'import sont hoistées et le graphe est évalué avant le corps du module) et
casse seulement une transpilation en `require` positionnels. Le fichier est correct
et sa carte OG vient d'un `opengraph-image.tsx` voisin. À ne pas « corriger ».

### 4.6 Le workflow social reste en désaccord avec le pipeline sur 27 scores

Le compte de villes est parti (§2.3) ; les 27 scores en dur restent, en écart avec
le pipeline jusqu'à 1,6 point. Décision inchangée depuis le 2026-08-09 : ce sont
des nombres publiés sur un canal sortant, dans un fichier de configuration d'une
automatisation externe que je ne peux pas exécuter. Le remède propre n'est pas de
recopier 27 valeurs à la main mais de faire lire le seed au workflow — ce qui est
un chantier, pas une correction de routine.

---

## 5. Écart avec le prompt de la routine

Les deux mêmes que la semaine dernière, tous deux inchangés.

**L'étape 1 demande `npm run build`**, que `CLAUDE.md` interdit depuis une session
cloud (§ Commands, note du 2026-08-08 : > 4 h 30 sans finalisation, `.next` à
25 Go, `ENOSPC`). J'ai suivi `CLAUDE.md`. Le substitut exécuté en entier :
`npx tsc --noEmit`, `npm run integrity` (qui rejoue les vraies gardes de chargement
en 2 s), `hreflang:check`, `search-index:check`, `parity`, `sitemap:check`, plus le
rendu réel des `generateMetadata` de 385 `page.tsx` et le traçage du graphe
d'imports client. **Quatrième semaine que je le signale** : je recommande que
l'étape 1 du prompt remplace `npm run build` par cette combinaison, qui couvre ce
qu'un build validerait côté contenu en quelques minutes au lieu de plusieurs heures
sans résultat.

**Les étapes 2 et 3 supposent qu'on peut interroger les sites.** L'egress est
refusé depuis la routine. Tout ce qui touche au comportement d'edge — redirections,
canonicalisation d'hôte, `robots.txt` réellement servi, propagation d'un
déploiement — n'est donc vérifiable qu'en **lisant** `worker/index.ts`, jamais en le
constatant. Le défaut §2.3 de l'audit précédent (15 URL indexées répondant 404) est
exactement de cette classe et a survécu deux mois et demi pour cette raison. Deux
pistes : autoriser l'egress vers les deux domaines de production depuis cette
routine, ou déclarer explicitement le comportement d'edge hors périmètre pour qu'il
soit contrôlé ailleurs.
