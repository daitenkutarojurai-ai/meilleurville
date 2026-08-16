# Ultra-audit hebdomadaire — 2026-08-16

Audit autonome du dimanche. 44 commits depuis le dernier audit (2026-08-09).

Le run n'a trouvé **aucun défaut bloquant** : `main` est buildable (gardes
d'intégrité vertes), aucun secret commité, aucune fuite inter-utilisateur,
aucun canonical vers un domaine d'aperçu, aucune régression de perf.

Un défaut SEO systémique et net a été corrigé : **deux familles de sous-pages
ville EN (1 080 pages) ajoutaient « | Best Cities in France » à la main**, ce
qui poussait leurs 540 titres chacun au-delà de 60 caractères (61-85) alors que
le `title.template` de la racine est un `%s` nu et que leurs jumelles FR n'en
portent pas. Corrigé, plus dix autres titres/descriptions hors bornes (mêmes
motifs `clampMeta` / `fitTitle` déjà présents dans les jumelles de l'autre
locale). 11 fichiers.

⚠️ **`npm run build` n'a pas été lancé**, conformément à `CLAUDE.md` § Commands
(note du 2026-08-08 : depuis une session cloud la génération tourne au-delà de
4 h 30 sans finalisation et meurt en `ENOSPC`). La validation passe par
`npx tsc --noEmit`, `npm run integrity` (rejoue les vraies gardes en 2 s), et les
vérificateurs du dépôt (`hreflang:check`, `search-index:check`, `sitemap:check`,
`parity`). C'est ce dispositif, pas un build, qui a servi de filet cette semaine.

---

## 1. Vérifié — conforme

### Sync + outillage (étape 1)
- `git checkout main && git pull --rebase origin main` — à jour, arbre propre.
  Aucun `stash`, aucun force-push.
- `npm install` — aucune vulnérabilité annoncée.
- `npx tsc --noEmit` — **0 erreur**, avant et après les corrections.
- `npm run integrity` — vert : 540 villes, guides FR 957 / EN 635, 0 score brut
  recopié FR/EN, 540 villes × 4 212 entrées de signaux. Les vraies gardes
  `assertUniqueSlugs` / `assertKnownSlugs` tournent ici, donc `main` est
  buildable (c'est le contrôle qui a manqué la nuit du batch `vacances-celibataire`
  d'il y a deux semaines).
- `npm run hreflang:check` — OK. 39 sous-pages ville FR, 40 EN (dont 1 sans
  jumelle FR), 39 paires ; chaque hreflang annoncé a une route en face, même état
  d'activation.
- `npm run search-index:check` — à jour (FR / EN), y compris après mes
  corrections (elles ne touchent pas le corpus).
- `npm run parity` — FR 217 · EN 165, **0 route FR sans jumelle EN**. Le trou
  §4.4 de l'audit précédent (`/guides/categorie/[categorie]` sans jumelle EN) est
  **comblé** : `app/[locale]/guides/category/[category]/page.tsx` existe depuis
  `0345b3a`-suite (livré cette semaine).

### Complétude des routes (étape 2)
- `npm run sitemap:check` — **vert dans les deux sens, les deux locales** :
  FR 29 022 URL / 18 chunks / 131 routes statiques / 86 familles dynamiques ;
  EN 28 495 URL / 21 chunks / 77 routes statiques / 88 familles dynamiques.
  « Chaque URL déclarée a une page, chaque page indexable a une URL. » C'est le
  contrôle des deux défauts distincts que demande l'étape 2 (route sans entrée
  sitemap ; entrée sitemap sans route) — aucun des deux.
- Les nouvelles routes de la semaine sont bien couvertes et canoniques :
  `where-to-go/[combo]` + `ou-partir/[combo]` (pathAlternates FR↔EN),
  `guides/category/[category]` EN (canonical `${EN_BASE}/…`),
  `red-flags/villes-qui-se-vident` (canonical de thème). Aucune `page.pending.tsx`.

### SEO (étape 3)
- Sweep des métadonnées **réelles** (rendu de `generateMetadata` sur ~42 000
  combinaisons de params, pas une lecture regex) : voir §2 pour les défauts.
- `alternates.canonical` présent sur toutes les routes dynamiques inspectées ;
  canonical FR → `mavilleideale.fr`, EN → `bestcitiesinfrance.com`. Aucun
  `localhost` ni domaine d'aperçu.
- `app/layout.tsx` émet `hreflang fr / en / x-default` au niveau racine.
- `app/robots.ts` : `/api/`, `/admin/`, `/auth` en `Disallow` ; `/dashboard`
  (`index:false,follow:false`), `/favoris`, `/mes-villes`, `/connexion`,
  `/auth/callback` en **noindex par metadata**, jamais par `Disallow` — le bon
  choix, documenté dans le fichier. Chunks dérivés de `SITEMAP_CHUNK_COUNT`.
- `alt` présent sur toutes les balises image (`CityPhoto`, `CityCard`,
  `GuidePoiCard`) ; `CityCard alt=""` est volontaire (image décorative, la tuile
  est déjà un lien labellisé).

### Intégrité des données (étape 4 — sondage)
- **540 villes**, 0 violation de bornes : `global ∈ [2,8 – 8,6]`, 8 axes finis
  dans `[0, 10]`. 0 slug dupliqué dans le seed.
- Guides : **FR 957**, **EN 635**, 0 slug dupliqué de part et d'autre
  (`assertUniqueSlugs` sur les deux corpus).
- **3 villes tirées** (Valence 6,3 · Saint-Paul-de-Vence 6,5 · Olivet 5,6) : les
  deux arbres FR/EN lisent le même `CITIES_SEED`, donc affichent les mêmes
  nombres — le contrôle qui a attrapé les deux vrais bugs de score du projet.
- Direction des scores : le fix red-flags `c70695d` de cette semaine (légende +
  aria-label des deux `/10` opposés) est un progrès d'accessibilité et ne touche
  pas au moteur ; les trois pages EN de nuisance (`noise`, `natural-risks`,
  `water`) passent toujours par l'inversion `hazardColor`. Convention intacte.

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt et un balayage des préfixes
  (`xkeysib-`, `sk-ant-`, `ghp_`, `AKIA…`, `BEGIN PRIVATE KEY`) ne remontent
  rien dans les sources suivies. Seul `.env.example` est versionné (placeholders).
- **Worker inchangé depuis l'audit précédent** (`git diff` vide sur `worker/`) :
  les 20 handlers ont été passés en revue un par un la semaine dernière (rate-limit
  + validation zod ou contrôle manuel sur tout POST public ; scoping
  `authedUser`/`user.id` sur toute lecture privée). Rien de neuf à ré-auditer.

### Performance (étape 5)
- Balayage transitif des **84 composants client** (imports de valeur, clôture
  complète, 185 modules atteints). Trois chemins seulement vers un module de
  données, tous connus et modestes :
  `SearchPalette → cities-seed`, `rankings → cities-seed`,
  `climate-normals → climate-normals-raw`.
- **Aucun composant client n'importe `@/data/guides` ni `@/data/guides-en`** : le
  correctif `46358bd` (5,9 Mo → 668 Ko) n'a pas régressé. Les ~4,5 Mo de JSON
  ajoutés récemment (`city-biodiversity` 1,9 Mo, `city-news` 1,7 Mo) restent
  **côté serveur** — 0 importeur client.
- `framer-motion` : aucun import réel (deux occurrences en commentaire
  seulement). Cf. §3.

---

## 2. Cassé — trouvé cette semaine

### 2.1 🟠 Deux familles de sous-pages ville EN ajoutaient la marque à la main — 1 080 titres > 60 — corrigé

`app/[locale]/cities/[slug]/questions/page.tsx` et `.../calendar/page.tsx`
suffixaient leur titre par **« | Best Cities in France »** :

```
Château-Gontier-sur-Mayenne — frequently asked questions 2026 | Best Cities in France   (85)
Annual calendar of events in Château-Gontier-sur-Mayenne 2026 | Best Cities in France    (85)
```

Le `title.template` de la racine est un `%s` nu ; ajouter la marque à la main est
exactement le défaut que l'étape 3 nomme. Résultat : **les 540 titres de chacune
des deux familles dépassent 60 caractères** (61-85), donc le nom de ville — la
partie que cherche l'internaute — se fait tronquer en SERP. Leurs jumelles FR
(`/villes/[slug]/questions`, `/villes/[slug]/agenda`) n'ont jamais porté de
suffixe. Retiré : questions passe à 39-61, calendar à 39-61.

### 2.2 🟡 Titre de glossaire EN avec suffixe de marque à 63 caractères — corrigé

`app/[locale]/glossary/page.tsx` : « French property & relocation glossary 2026
· BestCitiesInFrance » (63). Suffixe retiré (42). La jumelle FR `/glossaire` n'en
porte pas.

### 2.3 🟠 Descriptions de synthèse servies brutes au-delà de 160 — corrigé (5 fichiers)

Cinq familles de pages de synthèse **retournaient la description longue
directement** (elle n'est pas re-coupée à l'émission comme le sont les guides via
`clampMeta`), avec des énumérations des 8 axes qui montaient à 217-224
caractères :

| Page | max | pages | Correctif |
|---|---|---|---|
| `departements/[dept]/synthese` (FR) | 217 | 102 | `clampMeta` |
| `comparer-regions/[pair]/synthese` (FR) | 224 | 78 | `clampMeta` |
| `regions/[region]/synthese` (FR) | 217 | 18 | `clampMeta` |
| `[locale]/regions/[region]/synthesis` (EN) | 217 | 18 | `clampMeta` |
| `[locale]/compare-regions/[pair]` (EN) | 195 | 74 | `clampMeta` |

`clampMeta` coupe sur une frontière de phrase/proposition à ≤ 158 — c'est le
mécanisme déjà utilisé par la jumelle EN `departments/[dept]/synthesis` (donc le
correctif rend simplement les jumelles cohérentes).

### 2.4 🟠 Titres de synthèse régionale hors bornes — corrigé (2 fichiers)

- `comparer-regions/[pair]/synthese` (FR) : jusqu'à **88 caractères**
  (202/306 paires > 60). Ajout de `fitTitle(long, short)` — le même repli à
  trois lignes de sa jumelle EN, déjà corrigé en §2.4 de l'audit du 2026-08-09
  pour `/comparer/[pair]/synthese`. Bascule sur « `{a} vs {b} · synthèse 2026` » :
  **202 → 18** paires > 60, le résidu étant irréductible (deux noms de région
  longs pèsent déjà ~56 caractères à eux seuls).
- `regions/[region]/synthese` (FR) : « Synthèse 8 axes · … | palmarès régional »
  dépassait 60 sur Provence-Alpes-Côte d'Azur (64) et Bourgogne-Franche-Comté
  (61). Titre mené par la région (comme la jumelle EN) — **plafond 54 sur les 18
  régions**.
- `[locale]/compare-regions/[pair]` (EN) : queue « — French regions compared 2026 »
  raccourcie en « — French regions 2026 », alignée sur la jumelle FR ; les paires
  de deux noms longs restent au-dessus, irréductible.

### 2.5 🟡 Trois familles origine→destination : descriptions 179-237 avec queue de remplissage — corrigé

`ou-vont-les-gens/[ville]` (FR, max 237), `[locale]/leaving/[city]` (EN, 207),
`[locale]/moving-from/[pair]` (EN, 179) : énumération de profils + queue
générique (« Modèle estimatif transparent…, pas du suivi » / « no tracking »).
Enveloppées dans `clampMeta`. Ce sont précisément les queues de remplissage que
l'étape 3 proscrit.

---

## 3. Corrigé

11 fichiers, tous des changements de `generateMetadata` (aucun rendu de page, aucun
score déplacé). `npx tsc --noEmit`, `npm run integrity`, `search-index:check`
propres après coup.

| # | Correction | Fichier |
|---|---|---|
| 1 | Suffixe de marque retiré (540 titres 61-85 → 39-61) | `app/[locale]/cities/[slug]/questions/page.tsx` |
| 2 | Idem | `app/[locale]/cities/[slug]/calendar/page.tsx` |
| 3 | Suffixe de marque retiré (63 → 42) | `app/[locale]/glossary/page.tsx` |
| 4 | `clampMeta` sur description (217) | `app/departements/[dept]/synthese/page.tsx` |
| 5 | `fitTitle` (88→18 >60) + `clampMeta` (224) | `app/comparer-regions/[pair]/synthese/page.tsx` |
| 6 | Titre mené par la région (64→54) + `clampMeta` | `app/regions/[region]/synthese/page.tsx` |
| 7 | `clampMeta` (217) | `app/[locale]/regions/[region]/synthesis/page.tsx` |
| 8 | Queue de titre courte + `clampMeta` (195) | `app/[locale]/compare-regions/[pair]/page.tsx` |
| 9 | `clampMeta` (237, queue de remplissage) | `app/ou-vont-les-gens/[ville]/page.tsx` |
| 10 | `clampMeta` (207) | `app/[locale]/leaving/[city]/page.tsx` |
| 11 | `clampMeta` (179) | `app/[locale]/moving-from/[pair]/page.tsx` |

Effet mesuré sur le sweep de métadonnées réelles : titres > 60 **17 934 → 17 050**
(les 1 080 pages EN questions/calendar + les titres de synthèse) ; descriptions
> 160 **1 010 → 607**. Titres de recherche portant un suffixe de marque et
dépassant 60 : **il n'en reste aucun** (les 34 restants sont tous ≤ 60, donc
autorisés par la règle « marque seulement si ≤ 60 » de `CLAUDE.md`).

**Rien de touché** qui déplace un score publié, aucun refactor structurel, aucune
migration D1. **Aucun déploiement.**

---

## 4. À arbitrer

### 4.1 ~607 descriptions encore > 160, réparties sur ~30 gabarits ville/région

Après les corrections ci-dessus, il reste **607 descriptions servies au-delà de
160**, dispersées sur une trentaine de gabarits (pages ville, `gentrification`,
`vacations/[city]`, `overview`, `agenda`, `tension-locative`, `vacances/mois`,
etc.), la plupart entre **161 et 175** — donc marginalement au-dessus. Beaucoup
sont **pleines de chiffres substantiels** (loyers, scores, ratios), pas de queue
de remplissage : un `clampMeta` les couperait en plein milieu d'un chiffre, ce
qui n'est pas forcément un gain. La correction propre est une **passe gabarit par
gabarit** : soit envelopper dans `clampMeta`, soit resserrer le texte source à
≤ 160 quand il ne double pas comme copie de carte. C'est ~30 fichiers, du churn
large sur des pages que plusieurs agents touchent en semaine — à faire
délibérément, pas dans une routine du dimanche. Les cinq plus gros émetteurs, et
les trois familles à queue de remplissage, ont été traités ce run (§2.3, §2.5).

### 4.2 ~17 000 titres > 60 pour les noms de ville longs — pas un défaut de marque

Le gros du compte « titres > 60 » (17 050) vient des gabarits de sous-pages ville
(`calculateur-cout-reel/[ville]`, `cost-of-living`, `honest-review`, `démographie`…)
où le **nom de ville** allonge le titre. Ce ne sont **pas** des suffixes de marque :
leur segment de tête plafonne à ~37 caractères, donc la ville et l'année survivent
toujours à la troncature — le raisonnement déjà acté en §4.6 de l'audit du
2026-08-09. Aucune action ; à ne pas confondre avec le défaut §2.1, qui était bien
un suffixe de marque ajouté à la main.

### 4.3 `framer-motion` toujours déclaré dans `package.json` — inchangé

`package.json:45` déclare `framer-motion@^12.38.0` et **aucun fichier ne
l'importe** (deux mentions en commentaire seulement). Zéro octet n'atteint le
bundle. `npm uninstall` est sans risque fonctionnel mais touche
`package-lock.json`, que ~15 agents modifient en semaine — à faire dans une
fenêtre calme, pas depuis la routine du dimanche. Reporté pour la cinquième
semaine consécutive : c'est le genre de nettoyage qui mérite un run dédié.

### 4.4 Rappels d'arbitrages déjà ouverts (inchangés)

- **Workflow social** (`n8n/workflows/social-media-daily.json`) : 27 scores
  écrits en dur en désaccord avec le pipeline (jusqu'à 1,6 point) + compte « 352
  villes » obsolète. La vraie correction est de **dériver le tableau du seed**,
  ce qui déplace 27 nombres publiés sur un canal sortant — arbitrage propriétaire
  (audit 2026-08-09 §2.6/§4.2). Non touché.
- **Classement biodiversité** : ne pas recréer `/classements/biodiversite` ni
  remettre `RICHNESS_RANKING_PUBLISHED = true` — la mesure de richesse classe le
  type de programme de saisie, pas la nature (retiré le 2026-08-10). Zones
  protégées INPN toujours 0/540 (egress 403), donc `overall` reste `null`. Rien à
  faire côté routine.
- **R7.10 em-dash** : deux séries récentes au-dessus de la cible (`vacances-monoparentales-`
  2,60/200 mots, `parent-solo-a-` 1,90) restent à repasser à la main, fichier par
  fichier (audit 2026-08-09 §4.3). Hors périmètre « correction sûre ».

---

## 5. Écart avec le prompt de la routine

Un seul, récurrent : **l'étape 1 demande `npm run build`, que `CLAUDE.md` interdit
désormais depuis une session cloud** (§ Commands, note du 2026-08-08 : > 4 h 30
sans finalisation, `.next` à 25 Go, `ENOSPC`). J'ai suivi `CLAUDE.md`. Le
substitut — `tsc` + `npm run integrity` (qui rejoue les vraies gardes en 2 s) +
`hreflang:check` / `search-index:check` / `sitemap:check` / `parity` — couvre ce
qu'un build validerait côté contenu, en une minute au lieu de cinq heures. Comme
l'audit précédent, je recommande que l'étape 1 du prompt remplace `npm run build`
par cette combinaison tant que le build ne tient pas dans une session cloud.
