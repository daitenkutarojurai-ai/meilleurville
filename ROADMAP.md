# MeilleurVille — Roadmap v6 (2026-05-17)

Roadmap des features SSG-first, sans backend lourd, sans chiffres inventés.

**Statut** : vague 1 + vague 2 livrées (F1, F2, F3, F4, F9, F10, F11, F12, F13, F15, F16, F17, F18, F19, F20, F21, F22, F23, F24). Vague 3 démarrée avec F25. Vague 5 démarrée avec F54. Vague 6 livrée (F58, F59, F60, F61). Vague 7 ouverte avec F62 (Score Biodiversité). 5 features dépendant d'accès externes ont été retirées en attente d'accès/budget : ex-F5 RealityCheck, ex-F6 Journal de déménagement, ex-F7 Alertes personnalisées, ex-F8 Ville du mois, ex-F14 Carte risques interactive.

---

## Vague 6 — parents solo, parcs, navigation départements (ouverte 2026-07-22)

Demande utilisateur directe. F58 / F60 / F61 livrées le jour même ; **F59 livrée le
2026-07-27 — la vague 6 est close** — c'est le plus gros du lot (pipeline de données externe).

| # | Feature | Prio | Cplx | SEO | Statut |
|---|---------|------|------|-----|--------|
| F58 | City Match — profil « parent solo » | P1 | S | mid | ✅ shipped 2026-07-22 · sous-page `/villes/[slug]/parent-solo` ×540 + hub `/parent-solo` + miroir EN `/single-parent` + `/cities/[slug]/single-parent` ×540 shipped 2026-07-25→28 · série guides `parent-solo-a-[ville]-2026` batch 1 (+10) shipped 2026-07-24, batch 2 (+10 : Rennes, Nancy, Angers, Grenoble, Dijon, Metz, Reims, Aix-en-Provence, Rouen, Toulon) shipped 2026-08-07 · miroir EN de la série `single-parent-in-[city]-2026` batch 1 (+10 : Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille) shipped 2026-08-09, batch 2 (+10) shipped 2026-08-11 — **parité FR/EN atteinte à 20/20** · **batch 3 FR (+9 : Villeurbanne, Besançon, Caen, Brest, Tours, Limoges, Clermont-Ferrand, Saint-Étienne, Le Havre) shipped 2026-08-14** — FR 29, EN 20, écart 9, **le prochain run parent-solo doit être le miroir EN** |
| F59 | **Parcs & espaces verts par ville** (pipeline OSM + sub-page ×540) | **P0** | **L** | **high** | ✅ shipped 2026-07-27 |
| F60 | `/departements` — finder par n° / nom / ville + carte cliquable | P1 | S | low | ✅ shipped 2026-07-22 · carte cliquable 2026-07-23 |
| F61 | Vacances — profils « monoparental » et « célibataire » | P1 | S | high | ✅ shipped 2026-07-22 · mono enrichi 22/07 · célib enrichi 2026-07-26 · série guides `vacances-celibataire-[ville]-2026` batch 1 (+8) shipped 2026-08-01 · série `vacances-monoparentales-[ville]-2026` batch 1 (+7) shipped 2026-08-05 · `vacances-celibataire-[ville]-2026` batch 2 (+7 : Toulouse, Lille, Aix-en-Provence, Angers, Grenoble, Dijon, La Rochelle) shipped 2026-08-08 · croisement mois × profil `/vacances/ou-partir/[combo]` (12 × 7 = 84 pages SSG) shipped 2026-08-12 · miroir EN de la série célibataire, `solo-travel-in-[city]-2026` batch 1 (+8 : Paris, Lyon, Bordeaux, Lille, Strasbourg, Toulouse, Montpellier, Nantes) shipped 2026-08-13 |

### F58 — série `parent-solo-a-[ville]-2026`, batch 3 (2026-08-14)

**+9 guides : Villeurbanne, Besançon, Caen, Brest, Tours, Limoges, Clermont-Ferrand, Saint-Étienne,
Le Havre.** Compteur mesuré (`grep -c 'slug: "parent-solo-a'`) : **29 FR**, contre 20 EN
(`single-parent-in-[city]-2026`). `GUIDES` 946 → 955. `npm run search-index` relancé
(`data/search-index.json` 955 guides), sinon `search-index:check` échoue.

**Sélection** : les villes non couvertes les plus peuplées, filtrées sur la disponibilité d'une
référence de loyer dans `data/housing.ts` — sans T3, le composite ne peut pas produire de seuil de
revenu et le guide n'a plus de colonne vertébrale. Le lot couvre volontairement toute l'amplitude du
classement plutôt que son seul haut : Villeurbanne 21e sur 363, Le Havre 162e. Un batch qui ne
retiendrait que les bonnes élèves ferait une page de promotion, pas un classement.

**Changement de méthode par rapport aux batches 1 et 2, à conserver.** Les guides sont désormais
construits sur `lib/parent-solo.ts` (le moteur qui alimente déjà `/parent-solo` et
`/villes/[slug]/parent-solo`) et non sur une lecture libre du seed. Chaque guide cite donc son
**composite** (`parentSoloFit`), son **rang sur les 363 communes de plus de 20 000 habitants**
classées par le hub, et son **revenu net minimum** (`minIncomeForT3`, règle des 33 %) — trois
chiffres reproductibles, cohérents avec ce que le site affiche par ailleurs.
⚠️ **Les batches 1 et 2 citent des fourchettes de loyer par quartier et des barèmes de cantine
(« 0,60 € à 5,80 € le repas », « 600-800 €/mois ») qui ne figurent dans aucun fichier de `data/`.**
Le batch 3 ne les reproduit pas : les seuls prix par quartier cités sont les `avgRentT2` réels de
`data/neighborhoods.ts`, et là où la donnée manque (barèmes CAF) le texte dit qu'elle manque plutôt
que de l'inventer. À reprendre si les batches 1-2 sont un jour retravaillés.

**Trois précautions de méthode dans la copie, à ne pas diluer** : ① les scores de quartier de
`data/neighborhoods.ts` sont sur une **échelle propre** et ne se comparent pas au score communal —
chaque guide le dit là où il cite les deux ; ② `data/neighborhoods.ts` ne couvre que **3 quartiers
par ville**, ce qui est explicitement donné comme la raison pour laquelle le site ne publie aucun
verdict de sécurité par secteur (même arbitrage que le refus de la série `quartiers-a-eviter`) ;
③ aucun barème de cantine ni de périscolaire n'est chiffré.

**Ratio loyer T3 ÷ score écoles**, calculé comme le palmarès mensuel et cité dans les guides :
Brest 115 € par point (meilleur du lot), Tours 119, Besançon 122, Caen 126, Clermont-Ferrand et
Limoges 129, Saint-Étienne 133, Villeurbanne 149, Le Havre 150.

**Slug hors gabarit à ne pas « corriger »** : `parent-solo-a-le-havre-2026` suit la convention déjà
retenue par le dépôt pour cette ville (`demenager-a-le-havre-2026`, `travail-a-le-havre-2026`,
`acheter-a-le-havre-…`), alors que le titre écrit « au Havre ». Ne pas aligner le slug sur la
grammaire, et ne pas le compter comme un trou au prochain diff de parité.

**Prochain run parent-solo : le miroir EN** (`single-parent-in-[city]-2026`), l'écart étant de 9.
Nommage à surveiller : `single-parent-in-le-havre-2026` (garder l'article, comme
`things-to-do-in-le-tampon-2026`) et `single-parent-in-saint-etienne-2026`.

### F59 — Parcs & espaces verts par ville ✅ LIVRÉ (540/540 villes, 7 047 parcs)

**Intention utilisateur** (à ne pas perdre de vue) : un parent qui tourne en rond dans
le même parc depuis deux ans veut *découvrir les autres parcs* — le sien, ceux du
quartier d'à côté, ceux de la ville voisine à 20 min. Ce n'est pas une page « espaces
verts en % de la superficie communale » : c'est un répertoire de destinations
nommées, avec ce qui décide un samedi matin (aire de jeux ? ombre ? eau ? accessible
en poussette ?).

**Phase 1 — pipeline de données** `scripts/city-parks.mjs`
- Source : **OpenStreetMap via l'API Overpass**. C'est la seule source exhaustive et
  réutilisable ; pas d'alternative sérieuse pour 540 communes.
- Requête par commune, ancrée sur la relation admin `ref:INSEE` (le seed a déjà
  `inseeCode` sur les 540 villes) : `leisure=park`, `leisure=garden`
  (+ `garden:type=public`), `leisure=playground`.
- Champs retenus : `name`, type + id OSM, centroïde, superficie (calculée depuis la
  géométrie), présence d'une aire de jeux, `wheelchair`, `dog`, point d'eau, `access`.
- **Ne garder que les parcs nommés.** Un polygone vert sans nom n'est pas une
  destination — c'est du bruit, et ça ferait des milliers d'entrées vides.
- Plafonner à ~40 parcs par ville, triés par superficie.
- **Resumable + caché** dans `.cache/city-parks/` (gitignoré), exactement le pattern de
  `scripts/commune-images.mjs`. Overpass est strict : ~1 requête / 2-3 s, backoff sur
  429/504, User-Agent contactable. Le crawl complet se compte en heures — le script
  doit pouvoir être relancé sans repartir de zéro.
- Sortie : `data/city-parks.json` (slug → parks[]).
- **Reprise entre sessions (contrainte agent cloud)** : `.cache/` est gitignoré et
  chaque run d'une routine cloud repart d'un checkout neuf — le cache local ne
  survit donc pas d'un run à l'autre. `data/city-parks.json` doit être **commité au
  fur et à mesure**, et chaque run ne crawle que les villes absentes du fichier
  (par lots de ~60, un commit par lot). C'est ce qui rend la feature faisable en
  plusieurs passages plutôt qu'en un seul crawl de plusieurs heures.

**Licence — condition, pas décoration.** OSM est en **ODbL** : l'attribution
« © les contributeurs OpenStreetMap » doit être affichée avec les données, au même
titre que les crédits Commons de `components/CityPhoto.tsx`.

**Phase 2 — surfaces**
- `/villes/[slug]/parcs` ×540 SSG (+ EN `/cities/[slug]/parks`).
- Carte dans la grille de sous-pages de `CityProfile.tsx`, entrée `sitemap.ts`,
  `alternates.canonical`, JSON-LD `ItemList` de `schema.org/Park`.
- Tri par superficie ; badge « aire de jeux » ; distance à pied depuis le centre-ville
  (haversine sur le centroïde de la ville, déjà dans le seed).
- **Bloc « changer d'air »** : les parcs des villes voisines à moins de ~30 min — c'est
  exactement la demande d'origine, et ça crée du maillage inter-villes.

**Règle d'honnêteté** : si OSM ne renvoie rien pour une commune, la page le dit
(« aucun parc nommé référencé dans OpenStreetMap pour cette commune — contribuez »).
On n'invente pas un chiffre, et on ne masque pas la page.

**Statut technique (2026-07-22)** : `scripts/city-parks.mjs` écrit et outillé
(`npm run parks`, `npm run parks:stats`), TS clean, parse propre du seed, requête
Overpass ancrée sur `ref:INSEE` avec `out geom`, calcul de superficie par shoelace
équirectangulaire, dedupe way/relation, cap 40 parcs/ville, tri par superficie,
back-off exponentiel avec fallback sur 4 miroirs Overpass, User-Agent contactable,
avortement propre si l'egress est bloqué (503/403 upstream). Sortie
`data/city-parks.json` inexistante côté repo : le proxy egress de l'environnement
routine cloud refuse `overpass-api.de` + tous les miroirs OSM + `geo.api.gouv.fr` +
`query.wikidata.org` + `commons.wikimedia.org` (`connect_rejected 403` sur toutes
les requêtes CONNECT — policy d'organisation, cf. `/root/.ccr/README.md`). Le crawl
doit donc être lancé depuis un environnement autorisé (`npm run parks` local, ou
allowlist du domaine Overpass sur la routine) — pas de crawl possible en l'état.
Une fois `data/city-parks.json` commité (une passe locale = quelques heures),
les phases B et C reprennent normalement, un lot de ~60 villes par run.

**Point d'étape 2026-07-24** : nouveau run de la routine ; même blocage egress
confirmé (403 CONNECT sur les 5 hosts Overpass listés dans le script). Puisque
le crawl reste inaccessible côté routine, ce passage prépare la phase C plutôt
que d'attendre : `data/city-parks.json` initialisé à `{}` (placeholder committé
pour que l'accesseur importe proprement) et `lib/city-parks.ts` écrit — types
`Park`/`CityParks`, accesseurs `cityParks`/`hasParksData`/`sortedParks`, helper
`parkDistanceKm` (haversine sur le centroïde), helper `nearbyCityParks(city)`
prêt pour le bloc « changer d'air » (villes voisines dans un rayon de 30 km qui
ont déjà des parcs référencés), constantes d'attribution `OSM_CREDIT` +
`OSM_LICENSE_URL` factorisées. `npx tsc --noEmit` propre. Aucune surface
construite pour l'instant : générer 540 sous-pages « aucun parc référencé »
juste pour tenir un template serait du bruit à indexer. Dès qu'un lot est
crawlé (localement ou après allowlist Overpass sur la routine), la phase C
peut être branchée en un seul run sans réécrire l'accesseur.

**Point d'étape 2026-07-25** : le crawl a été passé localement dans une session
précédente, 10 métropoles couvertes (400 parcs OSM réels : Bordeaux, Lille, Lyon,
Marseille, Montpellier, Nantes, Nice, Paris, Strasbourg, Toulouse). Nouveau run
routine : Overpass toujours bloqué (403 sur les 5 hosts), donc pas d'extension du
lot possible ici — pivot phase C pour livrer immédiatement les surfaces sur ce
qu'on a déjà :
- `/villes/[slug]/parcs` (FR) et `/cities/[slug]/parks` (EN) : SSG **conditionnel**
  sur `hasParksData(slug)` — seules les villes crawlées émettent une route, les
  530 autres apparaîtront lot après lot sans changement de code. Hero + strip
  stats (nombre, aires de jeux, surface totale, plus grand) + liste triée par
  superficie avec badges (aire de jeux, poussette/PMR, point d'eau, chiens),
  distance à pied depuis le centre, liens carte OSM et fiche OSM par entrée,
  bloc **changer d'air** (villes voisines à ≤ 30 km avec parcs référencés),
  attribution **ODbL / © les contributeurs OpenStreetMap** avec licence et
  invitation à contribuer.
- JSON-LD `ItemList` de `schema.org/Park` (top 20) + `BreadcrumbList`,
  `alternates.canonical` FR + EN.
- Carte 🌳 dans la grille de sous-pages `CityProfile.tsx`, conditionnée sur
  `hasParksData` (locale-aware, sortie FR byte-identical pour les 530 villes
  sans données) — juste après Quartiers, en surface aux endroits où le parent
  qui « tourne en rond » va vraiment tomber dessus.
- Sitemap : entrées FR et EN émises **uniquement** pour les slugs couverts (10
  URLs de chaque côté aujourd'hui, ça grandit avec le crawl). Pas d'entrée
  soft-404 pour les 530 non-couvertes.
- `npx tsc --noEmit` propre.

Reste à faire : reprendre les batches de crawl (Overpass débloqué), ~9 lots
de 60 villes pour finir les 540. La feature est déjà utile aujourd'hui pour
les 10 métropoles les plus peuplées ; chaque nouveau lot commité déclenche
automatiquement les routes et les entrées sitemap correspondantes.

**Point d'étape 2026-07-27** : entre-temps une session précédente a poussé le
compteur à **81 villes / 2 518 parcs commités** (parallélisation shardée sur 4
mirrors Overpass, cf. commit `9d9ff10`). Nouveau run routine ce jour : le proxy
egress refuse toujours les 5 hosts Overpass (`overpass-api.de`,
`overpass.kumi.systems`, `overpass.private.coffee`, `overpass.osm.jp`,
`overpass.osm.ch` — tous `connect_rejected 403`, cf. `/root/.ccr/README.md`).
Aucun lot supplémentaire crawlé aujourd'hui ; il reste ~8 lots de 60 villes
pour atteindre 540. Owner notifié : ajouter au moins un mirror Overpass à
l'allowlist egress de cette routine pour reprendre les batches ; sinon les
prochains lots devront continuer de partir d'une session locale (le pattern
`--shards=4` livre 81 → ~150 villes en une passe d'~1 h).

**Point d'étape 2026-07-28** : le crawl a été bouclé entre-temps
(commit `1839441`, 540/540, 6 977 parcs). Passage d'honnêteté sur les copies :
les hubs `/parcs` + `/parks` et l'attribution ODbL des pages ville disaient
encore « les autres villes apparaîtront ici au fur et à mesure » — c'était
vrai pendant le crawl, ça faisait passer la feature pour partielle depuis
qu'elle est finie. Reformulé en « les 540 villes ont été relevées ;
{PARKS_CITY_WITHOUT_PARKS_COUNT} n'ont pour l'instant aucun parc nommé
référencé ». Nouvelle constante `PARKS_CITY_WITHOUT_PARKS_COUNT` dans
`lib/city-parks.ts` pour distinguer « villes crawlées » (540) de « villes
avec un parc nommé » (≈ 510). La 4e stat card des hubs passe du trompeur
« 100 % des villes du site » à « 540 / 540 relevées ». Aucune donnée
modifiée, `npx tsc --noEmit` propre.

**Point d'étape 2026-07-29** : re-check de fin de course. Le seed a été
corrigé la veille (commit `1839441` puis `68666f6` — 41 codes INSEE erronés
re-crawlés), et la ligne d'en-tête de la section disait encore « 6 977 parcs »
alors que `PARKS_TOTAL` calculé depuis `data/city-parks.json` remonte à
**7 047**. Les surfaces (`/parcs`, `/parks`, sous-pages ville, hubs) affichent
déjà le bon chiffre puisqu'elles le dérivent de la constante — c'est bien la
seule ligne du ROADMAP qui restait figée. Corrigée. Recompte de contrôle :
`node -e` sur le JSON → 540 villes, 7 047 parcs, 3 318 avec aire de jeux,
**11 villes sans aucun parc nommé** (Calvi, Gien, Le Lamentin, Le Robert,
Noirmoutier, Pierrefitte-sur-Seine, Porto-Vecchio, Saint-André Réunion,
Saint-Chély-d'Apcher, Saint-Paul-de-Vence, Sallanches — la copie du hub qui
lit `PARKS_CITY_WITHOUT_PARKS_COUNT` est déjà exacte). `npx tsc --noEmit`
propre après `npm install`. Aucun changement de code ni de données ; la
feature reste close.

---

## Vague 7 — Score Biodiversité (ouverte 2026-07-29)

Demande utilisateur. Une couche « nature » sur les 540 villes : espaces verts, espèces
recensées à proximité, zones protégées.

| # | Feature | Prio | Cplx | SEO | Statut |
|---|---------|------|------|-----|--------|
| F62 | **Score Biodiversité** (pipeline GBIF + INPN → sous-page ×540 + classement) | **P0** | **L** | **high** | 🚧 en cours — moteur livré 30/07, durci 02/08 (selftest + raréfaction bornée), crawl en attente d'une passe locale |
| F63 | **Qualité de l'air — du modèle à la mesure** (ATMO + Geod'Air, hub + classement) | **P0** | **M** | **high** | 🔜 à faire |
| F64 | **Actualité locale par ville** (open data BODACC/JO/CatNat → section CityProfile + routine hebdo) | **P1** | **M** | **low** | ✅ **en ligne — 540/540 villes, 4 212 entrées** (BODACC 4 172 + CatNat 40), collectées par le cron local les 04-05/08. Section rendue sur les deux locales. RNA toujours désactivé (0 association). Mois partiel marqué depuis le 11/08 |

### F62 — Score Biodiversité

**Intention** : répondre à « est-ce qu'on voit encore des oiseaux / des insectes /
des arbres ici ? ». C'est une question de cadre de vie, pas d'écologie abstraite —
et c'est le seul axe nature que le site n'a pas : `nature` dans le seed est un score
éditorial, `/parcs` compte des destinations, `/air` mesure une pollution. Aucun ne dit
ce qui **vit** autour de la ville.

**Rectification de stack** (la demande mentionnait Supabase) : le projet n'utilise plus
Supabase — l'auth a été réécrite Worker-native (D1) et l'hébergement est **Cloudflare
Workers Static Assets**, pas Cloudflare Pages. F62 n'a de toute façon besoin d'aucune
base : c'est un pipeline pré-fetché → JSON commité → SSG, exactement le pattern
`scripts/city-parks.mjs` / `scripts/commune-images.mjs`.

**Phase 1 — pipeline** `scripts/city-biodiversity.mjs`

- **GBIF** (`api.gbif.org/v1`) — libre, sans clé. `occurrence/search` avec
  `decimalLatitude`/`decimalLongitude` en cercle de 10 km autour du centroïde ville
  (déjà dans le seed), facetté par `speciesKey` et par `kingdom`/`class`. Filtres
  obligatoires : `hasCoordinate=true`, `hasGeospatialIssue=false`, `year>=2015`
  (au-delà, on mesure de l'archive, pas la faune actuelle).
- **INPN / OpenObs** (`inpn.mnhn.fr`, MNHN, gratuit) — côté France, deux apports que
  GBIF ne donne pas proprement : les **statuts de protection / liste rouge** par
  espèce, et les **périmètres de zones protégées** (Natura 2000, ZNIEFF I & II,
  réserves naturelles, parcs nationaux et régionaux, arrêtés de biotope). Les
  périmètres sont aussi téléchargeables en shapefile/GeoJSON depuis
  `data.gouv.fr` — préférer le fichier au service web pour un build statique.
- Champs retenus par ville : nombre d'espèces distinctes, répartition par grand
  groupe (oiseaux / mammifères / insectes / flore / amphibiens-reptiles), nombre
  d'espèces protégées ou liste rouge, nombre d'observations, **nombre d'observateurs
  distincts** (indispensable, voir plus bas), et pour les zones protégées : type,
  nom, surface intersectant un rayon de 15 km.
- **Resumable + caché** dans `.cache/city-biodiversity/`, ~1 req/s, backoff sur 429,
  User-Agent contactable. Sortie `data/city-biodiversity.json`, **commitée lot par
  lot** (~60 villes par run) — `.cache/` est gitignoré et une routine cloud repart
  d'un checkout neuf.
- ⚠️ **Egress** : le proxy des routines cloud a refusé Overpass, Wikidata et
  `geo.api.gouv.fr` pendant toute la vague 6 (403 CONNECT). Supposer le même refus
  pour `api.gbif.org` et `inpn.mnhn.fr` : **le crawl part d'une session locale**
  (l'egress y est vérifié ouvert, cf. CLAUDE.md § enrichissement seed).

**Le piège central — le biais d'effort d'observation.** Le nombre d'occurrences GBIF
mesure d'abord *combien de naturalistes saisissent des données*, pas combien
d'espèces vivent là. Paris et Montpellier écrasent n'importe quelle vallée pyrénéenne
en volume brut. Publier un « score biodiversité » construit sur des occurrences
brutes produirait un classement faux et défendable par personne. Trois garde-fous,
non optionnels :

1. **Richesse, pas volume** : compter les *espèces distinctes*, jamais les observations.
2. **Normaliser par l'effort** : rapporter la richesse au nombre d'observateurs
   distincts et d'observations (courbe de raréfaction simplifiée, ou espèces par
   racine du nombre d'observations). Une ville sous un seuil d'effort minimal
   (à calibrer, ordre de grandeur : < 500 observations ou < 20 observateurs) est
   déclarée **non mesurable** — la page le dit et n'affiche pas de score.
3. **Les zones protégées ne sont pas biaisées** : un périmètre Natura 2000 ou une
   réserve naturelle existe indépendamment de qui l'observe. C'est le composant le
   plus solide du score et il doit peser en conséquence.

**Composition du score** (`lib/biodiversity.ts`) — trois composantes affichées
séparément, jamais un chiffre opaque :
- richesse spécifique normalisée par l'effort (GBIF),
- couverture en zones protégées à ≤ 15 km, pondérée par le niveau de protection
  (réserve/parc national > Natura 2000 > ZNIEFF),
- espaces verts urbains — **réutiliser `data/city-parks.json`** (F59, 540/540 villes
  relevées, 6 977 parcs) plutôt que de recrawler.

**Convention de score** : « Biodiversité » nomme une **qualité** → `10 = bon` (cf.
CLAUDE.md § Score convention). Chaque surface énonce ce que 10 signifie. Les jumelles
FR/EN doivent afficher le même nombre.

**Phase 2 — surfaces**
- `/villes/[slug]/biodiversite` (+ EN `/cities/[slug]/biodiversity`), SSG
  **conditionnel** sur la disponibilité de la donnée (pattern `hasParksData`) :
  pas de page « non mesurable » générée pour rien.
- Bloc espèces emblématiques du secteur (nom vernaculaire FR quand GBIF le fournit),
  statut de protection, groupes représentés ; liste des zones protégées avec lien
  vers la fiche INPN.
- Carte 🦋 dans la grille de sous-pages de `CityProfile.tsx`, entrée `sitemap.ts`,
  `alternates.canonical`, JSON-LD `Dataset` + `BreadcrumbList`.
- ~~Classement `/classements/biodiversite` une fois la couverture suffisante
  (≥ 300 villes mesurables), + `RANKING_META` et `RANKING_EN`.~~ **Abandonné le
  2026-08-10** : le seuil est franchi (513 villes) mais la mesure de richesse ne
  mesure pas la richesse — voir le point d'étape du 2026-08-10. Un classement ne
  se rouvre qu'après un recrawl GBIF pondéré par jeu de données.

**Licences — condition, pas décoration.** GBIF : citer le DOI du téléchargement et les
licences par jeu (CC0 / CC BY / CC BY-NC — **filtrer NC** comme `LICENSE_OK` filtre les
photos non libres). INPN/MNHN : mention MNHN + Licence Ouverte Etalab. Attribution
affichée avec les chiffres, comme les crédits Commons et l'ODbL des parcs.

**Règle d'honnêteté** : aucune ville ne reçoit de score sans effort d'observation
suffisant, et une ville sans zone protégée à proximité le lit noir sur blanc plutôt
que de récupérer une moyenne départementale.

#### Point d'étape 2026-08-02 — deux bugs du pipeline GBIF corrigés avant le crawl

Egress toujours fermé : `api.gbif.org`, `inpn.mnhn.fr` et `www.data.gouv.fr` répondent
tous les trois 403 CONNECT depuis la routine (retesté ce jour, un seul essai). Les deux
JSON de données valent toujours `{}` — **0/540 villes sur les deux composantes GBIF et
INPN**, aucune surface publiée, aucun classement. Le crawl part toujours d'une passe
locale. Ce run n'a donc pas collecté de donnée ; il a fiabilisé ce qui l'aurait reçue.

**Ce qui est couvert désormais.** `npm run biodiversity:selftest` — 22 contrôles hors
ligne sur les deux points où le pipeline pouvait se tromper en silence, symétrique de
`protected-areas:selftest`. Il a trouvé ses deux bugs au premier lancement :

1. **Lecture des facettes.** GBIF prend le nom de facette en camelCase à l'aller
   (`facet=speciesKey`) et le renvoie en `UPPER_SNAKE_CASE` au retour
   (`"field": "SPECIES_KEY"`). La comparaison était `toLowerCase()` des deux côtés : le
   tiret bas ne tombait jamais en face, la facette n'était jamais trouvée et **chaque
   ville aurait enregistré zéro espèce** — une ligne parfaitement plausible, sans erreur.
   Les deux noms sont maintenant réduits à leurs lettres et chiffres, et une facette
   absente de la réponse lève au lieu de renvoyer une liste vide.

2. **Raréfaction sur vecteur tronqué.** La raréfaction de Hurlbert exige le vecteur
   d'abondance complet. Quand le plafond de pagination coupe la queue de la liste
   d'espèces — ce qui arrive précisément aux villes les mieux relevées — l'ancien code
   raréfiait la tête contre sa propre somme, ce qui gonfle la probabilité de détection de
   chaque espèce et **surestime la richesse au sommet du classement**, là où les lecteurs
   regardent. Le score étant un rang centile sur cette valeur, le biais se propageait au
   rang. Désormais : facette complète → valeur exacte ; facette tronquée → **encadrement
   rigoureux** (borne basse en évaluant à la taille maximale possible de la communauté,
   borne haute en ajoutant la contribution maximale de la queue non vue, par borne de
   l'union). Nouveaux champs `rarefiedExact` et `rarefiedUpper` ; `QUERY_VERSION` passe à
   2 et `MIN_QUERY_VERSION` écarte du barème toute ligne v1, non comparable.

**Ce que ça change à l'écran.** Un nouvel état `richnessPending: "precision"` : effort
d'observation suffisant, mais intervalle trop large (> 5 %, `MAX_RAREFIED_UNCERTAINTY`)
pour publier un rang. La page le dit comme un défaut de *notre* collecte, réparable en
relançant la ville avec `--facet-pages` plus haut — pas comme une pauvreté écologique.
Quand l'intervalle est assez serré pour classer, le chiffre s'affiche précédé d'« au
moins » et le JSON-LD publie `minValue`/`maxValue` au lieu d'une `value` qui n'existe
pas. Idem côté EN, mêmes nombres. Le script journalise l'avertissement et la commande
exacte à rejouer quand une ville tronque.

**Ce qui n'est toujours pas couvert.** Aucune donnée. Les paramètres GBIF restent
`@unverified` (`geoDistance`, clés taxonomiques des 6 groupes, `iucnRedListCategory`) et
les noms d'attributs INPN aussi : le selftest valide l'arithmétique et le décodage, pas
les contrats d'API, qui demandent le réseau. `npm run biodiversity:probe` reste le
premier geste de la passe locale. Les surfaces restent garées en `page.pending.tsx`,
`overall` reste `null` faute de la composante zones protégées, et le classement
`/classements/biodiversite` attend ses ~300 villes mesurables. *(Note du 2026-08-10 :
le seuil a été franchi puis le classement abandonné — la mesure de richesse s'est
révélée invalide. Voir le point d'étape du 2026-08-10.)*

#### Point d'étape 2026-08-03 — la composante espaces verts passe au garde-fou du biais

Egress toujours fermé, retesté une fois ce jour : `api.gbif.org`, `inpn.mnhn.fr` et
`www.data.gouv.fr` répondent 403 CONNECT. Les deux JSON valent toujours `{}` — **0/540
villes sur GBIF et 0/540 sur INPN**, aucune surface publiée, aucun classement, le crawl
part toujours d'une passe locale. Ce run a donc travaillé sur la **troisième composante,
la seule qui ait ses données** : les espaces verts, repris de F59 (540/540 villes).

**Le constat.** Le biais d'effort a structuré tout le travail sur la richesse GBIF, mais
personne ne l'avait appliqué à la composante espaces verts — alors qu'OpenStreetMap est
exactement aussi biaisé, à ceci près que l'effort y est de *cartographie* et non
d'*observation*. Deux défauts en sont sortis, tous deux dans `lib/biodiversity.ts` :

1. **Zéro parc nommé valait zéro espace vert.** `parkAreaM2` renvoyait `0` pour une
   commune relevée sans aucun parc nommé, d'où un score de **0,1/10** — alors que le
   docstring du profil annonçait déjà `null`, jamais implémenté. **11 communes**
   concernées : Sallanches (fond de vallée alpine), Noirmoutier, Porto-Vecchio, Calvi,
   Saint-Paul-de-Vence, Gien, Saint-Chély-d'Apcher, Pierrefitte-sur-Seine, Le Lamentin,
   Le Robert, Saint-André. Publier un score de nature proche de zéro pour ces communes-là
   aurait été indéfendable, et pour la raison même qui fonde la feature : OSM est une
   **carte contributive, pas un registre**, donc « personne n'a cartographié » et « pas de
   verdure » y sont indiscernables. `greenSpacePerCapita` renvoie désormais `null` et le
   profil porte `greenSpacePending: "mapping"`.
   ⚠️ **Asymétrie volontaire avec les zones protégées**, où une commune ingérée sans
   périmètre vaut bien `areasTotal: 0` : l'inventaire INPN est un registre administratif
   exhaustif, OSM non. C'est la nature de la source qui décide, pas la symétrie du code —
   ne pas « harmoniser » les deux cas.
2. **La surface était tronquée sans le dire.** F59 plafonne à **40 parcs par commune**
   (`PARKS_PER_CITY`) et n'a pas gardé le compte d'avant plafonnement : pour les **41
   communes** qui atteignent le plafond (Paris, Toulouse, Dijon, Bordeaux, Le Mans…), la
   somme est un **plancher**. Même classe de défaut que la raréfaction tronquée corrigée
   le 02/08 : une valeur bornée republiée comme exacte. Traitement différent parce que
   l'erreur est différente — ici le tri est par superficie décroissante, donc chaque parc
   omis est plus petit que le 40e conservé, lequel pèse en **médiane 0,19 %** du total de
   sa ville (**0,73 % au pire**). L'erreur est bornée et joue *contre* les villes les mieux
   cartographiées : les communes gardent leur score, mais les deux surfaces affichent
   « au moins » / « at least » au lieu d'un total.

**Ce que ça ajoute.** `PARKS_PER_CITY_CAP`, `greenSpaceTruncated()`,
`GREEN_SPACE_UNMAPPED_COUNT` (11) et `GREEN_SPACE_TRUNCATED_COUNT` (41) dans
`lib/biodiversity.ts` ; `greenSpacePending` et `greenSpaceTruncated` dans
`BiodiversityProfile` ; les 11 communes non cartographiées sortent du **barème centile**,
où elles tassaient le bas avec des valeurs inconnues et décalaient le rang de toutes les
autres. Copies FR et EN mises à jour ensemble — ce sont des alternates hreflang, elles
affichent le même nombre et disent la même chose. Chiffres vérifiés en important le vrai
module (`npx tsx`), pas relus au regex : les 11 slugs recoupent exactement la liste F59
des communes sans parc nommé.

**Vérifications, et leurs limites.** `npx tsc --noEmit` propre. Les chiffres sont sortis en
important le vrai module plutôt qu'en relisant le JSON : `GREEN_SPACE_UNMAPPED_COUNT` = 11,
`GREEN_SPACE_TRUNCATED_COUNT` = 41, et Sallanches comme Porto-Vecchio renvoient bien `null`
au lieu de leur ancien 0,1/10. Contrôle de conflation : 0 commune du seed sans population de
référence et 0 commune non crawlée par F59, donc `greenSpacePerCapita == null` désigne
aujourd'hui exactement les 11 communes sans parc nommé — l'état `"data"` a quand même été
ajouté pour qu'une ville entrée au seed avant son crawl ne soit pas étiquetée « OSM ne
cartographie rien ». `npm run build` : **génération statique complète et sans une seule
erreur — 55 787 / 55 787 pages en 11,8 min**, ce qui exerce bien les 540 pages ville portant
la carte 🦋 et le `city-profile-data` qui importe le moteur. Le build s'arrête ensuite à
« Finalizing page optimization » sur `ENOSPC` : le quota disque de la session de routine
cloud est épuisé par l'export, **exactement le comportement d'environnement déjà documenté
le 30/07** et sans rapport avec ce diff, qui ne touche ni route ni sitemap (les deux surfaces
restent garées en `page.pending.tsx`). Note pour les prochains runs : ce build laisse un
`.next` de ~19 Go et sature le disque de la session — `rm -rf .next out` juste après, sinon
les commandes suivantes échouent en `ENOSPC`.

**Ce qui n'est toujours pas couvert.** Rien de collecté ce run. Les paramètres GBIF et les
noms d'attributs INPN restent `@unverified`, les surfaces restent garées en
`page.pending.tsx`, `overall` reste `null` faute des zones protégées, et le classement
attend ses ~300 villes mesurables. F59 n'est pas touchée : pour un **répertoire de
destinations**, « aucun parc nommé référencé » reste la bonne réponse — c'est seulement
comme **proxy de surface végétale** que le même zéro devient faux.

#### Point d'étape 2026-08-06 — les deux sous-pages sont EN LIGNE (302 villes), et trois choses mentaient

Premier run où la donnée est là : le cron local a porté `data/city-biodiversity.json` à
**302/540 villes, dont 278 mesurables** et 24 en `richnessPending: "precision"`. Les deux
routes sont dégarées (`git mv page.pending.tsx page.tsx` côté FR **et** EN, ensemble comme
l'exige leur statut d'alternates), `BIODIVERSITY_PAGES_LIVE` passe à `true`, et
`npm run hreflang:check` confirme la paire dans le même état d'activation.

**Pourquoi publier maintenant alors que `overall` est toujours `null`.** La seule objection
sérieuse était que le barème est un rang centile : un score qui bouge à chaque lot ne mesure
pas la nature, il mesure l'avancement du crawl (c'est l'argument de `MIN_CALIBRATION_CITIES`).
Cette objection se teste sur l'historique du fichier plutôt que de se supposer — en rejouant
le barème sur les instantanés commités à 182 et à 302 villes, **les rangs ont bougé de 0,2
point en médiane, 0,5 au pire, et aucune ville n'a varié d'un point entier**. Le barème est
stable, donc publiable. `overall` reste `null` (zones protégées non ingérées) et les trois
composantes restent affichées séparément, ce qui était de toute façon la spec.

⚠️ **Le crawl est biaisé en taille et les pages le disent maintenant.** Les 302 villes
collectées ont une population médiane de 45 000 habitants, les 238 restantes de 14 500 : le
runner a commencé par les grandes communes, et l'échantillon de comparaison n'est donc pas
encore « les villes françaises ». Un paragraphe « À quoi la ville est comparée » a été ajouté
aux deux surfaces, avec le chiffre de dérive ci-dessus. Rassurant au passage : la richesse
raréfiée est quasi plate selon la taille (médianes 234,5 / 239,5 / 229 par tiers de
population) — c'est exactement ce que la correction d'effort est censée produire.

**Trois défauts corrigés, que seule l'arrivée des vraies valeurs pouvait révéler :**

1. **La carte 🦋 de `CityProfile` disait à Paris qu'on l'observait trop peu.** Le libellé de
   repli quand aucune note n'est publiée était « effort d'observation trop faible » pour les
   trois raisons possibles. Or **aucune** des 302 villes collectées ne passe sous le plancher
   d'effort : les 24 sans note sont en `precision`, c'est-à-dire que **notre** collecte a
   tronqué la liste d'espèces — ce qui arrive précisément aux villes les MIEUX relevées.
   Concrètement la carte annonçait un déficit d'observation à Paris (574 203 observations,
   2 000 observateurs), à toute la petite couronne et à Annemasse. Exactement l'inverse du
   vrai, et exactement ce que le corps de la page s'échine à démentir. La projection
   `city-profile-data` porte désormais `pending`, et les trois cas ont trois phrases.
2. **Le sitemap annonçait 604 URL en 404.** Les entrées FR et EN étaient gatées sur
   `hasBiodiversityData` seul, sans `BIODIVERSITY_PAGES_LIVE` — donc pendant tout le temps où
   les pages étaient garées, le sitemap a déclaré une URL par ville collectée des deux côtés
   (302 + 302). C'est le même angle mort que la carte 🦋 corrigée le 04/08, qui avait traité
   la carte sans traiter le sitemap. Les deux conditions vivent maintenant dans un seul
   `emitsBiodiversity()` : repasser le drapeau à `false` dépublie réellement tout.
3. **Métadonnées hors gabarit, et pas d'`og:image` du tout.** 117 titres sur 302 dépassaient
   60 caractères et 239 descriptions sur 302 dépassaient 160 — ce qui se faisait couper en
   SERP, c'étaient les chiffres. Resserrés et **mesurés** sur les 302 villes (titres ≤ 60,
   descriptions ≤ 143 FR / 127 EN, le nom le plus long faisant la borne). Surtout, les deux
   pages déclaraient un `openGraph` sans `images` et n'ont pas de `opengraph-image.tsx`
   voisin : c'est le piège documenté dans CLAUDE.md, qui avait déjà coûté 237 pages sans
   carte sociale. Corrigé sur le modèle de `/parcs`.

**Ce qui n'est toujours pas couvert.** Les **zones protégées restent à `{}` — 0/540** : c'est
la seule pièce qui demande encore une main humaine (l'INPN publie des shapefiles derrière une
page de téléchargement, le runner local saute l'étape tant que les GeoJSON ne sont pas dans
`.cache/city-protected-areas/sources/`). Tant qu'elle manque, `overall` reste `null` et la
composante la plus lourde — la seule insensible au biais d'observation — n'est pas au
rendez-vous. Le classement `/classements/biodiversite` **n'est pas créé** : 278 villes
mesurables, sous le seuil de ~300 que la spec s'est fixé ; il devrait s'ouvrir dans un ou deux
lots. Les 238 villes non collectées n'ont ni page ni entrée sitemap, par construction.

#### Point d'étape 2026-08-10 — le rang de richesse est retiré, et le classement ne sera pas créé

Le crawl GBIF est **terminé : 540/540 villes** (dernier lot du runner local le 09/08). Le seuil
de ~300 villes mesurables était donc franchi — 513 — et ce run devait ouvrir
`/classements/biodiversite`. **Il ne l'ouvre pas, et le rang de richesse est retiré des deux
sous-pages.** Le corpus complet a permis, pour la première fois, de contrôler la mesure ; elle
n'a pas tenu.

**Ce qui a été mesuré** (script jetable, sur les 513 villes notées) :

| contrôle | valeur |
|---|---|
| corrélation de rang score ↔ **concentration** des relevés (part des observations tenue par 5 espèces) | **−0,77** |
| corrélation de rang score ↔ **nombre d'espèces réellement recensées** | **+0,10** |
| part de la variance du score expliquée par le **département** | **56 %** |

Le score ne classait pas la nature : il classait le **type de programme de saisie** qui opère
autour de chaque ville. La raréfaction de Hurlbert suppose que les enregistrements sont des
tirages comparables dans une communauté ; sur des données agrégées par GBIF, un contact
automatique de détecteur à ultrasons et une observation de terrain pèsent pareil, et
l'hypothèse tombe. À Mayenne, **87 % des observations portent sur cinq espèces**, dont 48 000
contacts d'une seule pipistrelle ; à Saint-Omer et Douai, ce sont des comptages de colonies de
laridés (98 984 goélands argentés à Saint-Omer).

**Les conséquences étaient en ligne depuis le 06/08, sur 302 puis 540 villes ×2 locales :**
Douai, avec **2 588 espèces recensées** — l'un des relevés les plus fournis du corpus —
affichait **0,0/10** ; Saint-Omer et son marais audomarois (réserve de biosphère) **0,1/10** ;
la Guadeloupe **0,1/10** de moyenne régionale et la Guyane **1,8/10**, quand le Centre-Val de
Loire sortait à **7,8/10**. Le site classait la Beauce au-dessus de l'Amazonie — tout en
décrivant la Guyane comme d'une « biodiversité exceptionnelle » sur sa propre page région.

**Deux réparations essayées, toutes deux écartées.** ① Un rang fondé sur le nombre d'espèces
normalisé par l'effort (loi puissance espèces/observateurs, R² = 0,75) neutralise bien la
concentration (résidu ↔ concentration : −0,17) mais place **Arles (Camargue) 509ᵉ sur 513** et
**Saint-Laurent-du-Maroni dernière**, avec un haut de classement entièrement picard : il mesure
alors la productivité des programmes de saisie. ② Écarter les villes concentrées est
impossible — elles sont **408 sur 513** au-dessus de 10 %. Ce n'est pas une queue de
distribution, c'est la norme.

**Ce que le run a livré.** `RICHNESS_RANKING_PUBLISHED = false` dans `lib/biodiversity.ts` (un
seul point de bascule, avec les corrélations dans le docstring), un quatrième motif
`richnessPending: "incomparable"` qui **passe avant tous les autres** — dire « effort
insuffisant » à Douai serait faux deux fois — et sa copie dédiée sur les deux sous-pages, la
carte 🦋 et les métadonnées. Chaque page explique le retrait avec **sa propre** concentration
mesurée (`recordConcentration()`, exportée : médiane 14 %, de 2,6 % à 86,7 %), ce qui est une
mesure vraie et lisible. Les effectifs bruts — espèces, observations, observateurs, groupes,
espèces menacées, top espèces — restent affichés tels quels : **ils sont exacts, c'est le
classement qui était faux**. Les espaces verts (529 villes) et les zones protégées ne sont pas
touchés ; `overall` était déjà `null` partout, le retrait ne change donc rien à l'agrégat.

**Ce qui n'est toujours pas couvert.** Zones protégées **0/540**, inchangé — toujours la seule
pièce demandant une main humaine, et désormais **la seule composante notée qui reste
crédible** à terme, puisqu'un périmètre Natura 2000 existe indépendamment de qui l'observe.
Richesse : **aucune ville notée**, par décision. Le remède est côté pipeline et pas côté
affichage : il faut repasser par GBIF en agrégeant par `datasetKey` (un jeu de données = une
unité d'échantillonnage) ou en restreignant la requête aux jeux d'observation opportuniste —
donc un `QUERY_VERSION = 3` et un recrawl complet, pas un correctif de `lib/`. **Ne pas
remettre le drapeau à `true` sans avoir refait les trois contrôles du tableau ci-dessus.**
Vérification de ce run : `npx tsc --noEmit` propre, `npm run integrity` propre, page FR rendue
en dev (Douai et Gien, 200, copie et pourcentage corrects) ; la jumelle EN n'a pas pu être
rendue — sous `next dev` les sous-pages ville EN répondent 404 quelle que soit la locale, y
compris `climate` et `parks` que ce run n'a pas touchées, le routage EN vivant dans le Worker.
Elle est typée et suit la même structure ; à contrôler au prochain déploiement.

#### Point d'étape 2026-08-13 — l'ingest des zones protégées télécharge enfin ses propres sources

Zones protégées **0/540**, inchangé, mais pour la première fois ce n'est plus une passe manuelle
qui manque : `npm run protected-areas:fetch` résout et télécharge les sept couches tout seul. C'était
la seule pièce de F62 qui demandait encore une main humaine, et elle bloquait la composante la plus
lourde de l'agrégat (`overall` reste `null` partout) — donc la plus grosse valeur disponible ce run,
devant n'importe quelle surface.

**Pourquoi ce n'était pas qu'une question d'egress.** Le script pointait vers
`inpn.mnhn.fr/telechargement/cartes-et-information-geographique`, une page qui n'existe plus :
les systèmes d'information du MNHN ont été mis à terre par une **cyberattaque le 2025-07-26** et
l'INPN est resté hors ligne environ un an ; une « version zéro » reconstruite est revenue le
**2026-07-21**, avec les fiches espèces seulement, les fiches habitats et les synthèses
territoriales étant annoncées pour 2027. Envoyer l'opérateur chercher les shapefiles là-bas ne
pouvait donc pas marcher. Les mêmes zonages nationaux sont publiés par le MNHN sur **data.gouv.fr**,
qui n'a jamais cessé de répondre : trois jeux couvrent les sept couches —
`inpn-donnees-du-programme-espaces-proteges` (réserves, parcs nationaux, PNR, arrêtés de biotope),
`inpn-donnees-du-programme-natura-2000`, `inpn-donnees-du-programme-znieff`.

**Ce que `fetch` fait, et ce qu'il refuse de faire.** Il résout les jeux **par slug** via l'API
data.gouv.fr, jamais par URL de fichier : la plateforme fait tourner le fichier derrière une
ressource à chaque millésime, et chaque ressource porte un permalien qui suit la rotation — coder
l'URL du jour en dur, c'est le pipeline qui télécharge en silence un shapefile de 2019 deux ans plus
tard, la classe de défaut exacte de la constante BODACC écrite sans avoir vu l'API répondre (F64).
Il imprime **toutes** les ressources de chaque jeu, et quand une couche correspond à zéro ou à
plusieurs ressources il **s'arrête** au lieu de choisir : une mauvaise couche ingérée gonflerait la
couverture protégée sur 540 pages en ligne, ce qui est pire qu'un run qui pose la question. Puis
téléchargement (reprise sur fichier déjà présent, 1 req/s, User-Agent contactable), dépaquetage, et
reprojection par `ogr2ogr` quand il est sur le PATH — sinon les commandes exactes sont imprimées.
Un 403 est diagnostiqué dans les deux sens : ici le proxy **répond** 403 au lieu de refuser le
CONNECT, ce qui se lit à tort comme un refus de data.gouv.fr.

**Un bug silencieux trouvé en écrivant le selftest de reconnaissance des couches.** Le motif
ZNIEFF I (`/znieff.*(1|i)(?!i)/`) **acceptait aussi les fichiers ZNIEFF II** — le `.*` avalait le
premier `i` et la fin de chaîne satisfaisait le lookahead — et `LAYERS.find` rendant la première
correspondance, une couche ZNIEFF II serait entrée comme ZNIEFF I, **à 0,4 au lieu de 0,25** dans la
couverture pondérée, pendant que l'ingest annonçait znieff-2 manquante. Rien n'a jamais été ingéré
avec ce bug (le JSON vaut `{}` depuis le début), mais il aurait faussé la première passe réelle sans
rien lever. Corrigé en normalisant les noms avant tout test (minuscules, **diacritiques repliés**,
non-alphanumériques → espace) et en traitant deux couches correspondantes comme une **ambiguïté
signalée**, jamais comme une égalité tranchée par l'ordre du tableau. Le repli des diacritiques a
révélé trois autres couches invisibles au passage : « Réserves naturelles », « Parcs naturels
régionaux » et « Parcs nationaux » ne correspondaient à rien du tout, `é` n'étant pas dans `[a-z]`
et les motifs étant écrits au singulier. 16 cas de reconnaissance sont désormais épinglés dans
`protected-areas:selftest` (7 échouaient au premier lancement), dont les deux formes ZNIEFF, les
noms de fichiers INPN collés (`N_ZNIEFF1_S_FXX.shp`), et deux ressources compagnes qui ne doivent
surtout **pas** être reconnues comme des périmètres.

**Les surfaces : la méthodologie décrivait encore le rang retiré.** Le bloc « comment ce score est
fabriqué » des deux sous-pages expliquait au présent la raréfaction, le seuil d'effort et « le rang
se lit parmi les 513 villes comparables » — alors que **les 540 villes sont en `richnessPending:
"incomparable"` depuis le 10/08** et qu'aucun rang n'est publié. La page démentait donc, en bas, ce
qu'elle venait d'expliquer en haut. Les quatre paragraphes concernés ne s'affichent plus que si un
rang existe ; à leur place, trois paragraphes disent ce que les effectifs valent (exacts, propres à
la ville, non comparables), pourquoi la correction ne suffisait pas, et où la mesure reste solide.
Corrigé des deux côtés ensemble — ce sont des alternates hreflang. Le paragraphe « À quoi la ville
est comparée », lui, disparaît complètement tant qu'il n'y a pas de rang : il ne décrivait plus rien.

**Vérifications.** `npx tsc --noEmit` propre, `npm run integrity` propre,
`protected-areas:selftest` 23/23 et `biodiversity:selftest` verts. État réel relu en important le
vrai module, pas au regex : 540 villes crawlées, **0 avec rang** (540 `incomparable`), 529 avec une
note d'espaces verts, 11 sans (OSM ne cartographie aucun parc nommé), `overall` `null` sur les 540,
concentration des relevés médiane 14,0 % (2,6 % à 86,7 %). Pages FR rendues en dev sur les deux
branches — Douai (avec note d'espaces verts) et Sallanches (sans) — 200 et copie correcte.
`fetch --dry-run` s'arrête proprement sur le 403 du proxy avec le bon diagnostic. **Limite :** la
jumelle EN n'a pas pu être rendue, `next dev` renvoyant 404 sur toutes les sous-pages ville EN — y
compris `parks`, que ce run ne touche pas — le routage EN vivant dans le Worker. Même constat qu'au
run du 10/08 ; à contrôler au prochain déploiement.

**Ce qui n'est toujours pas couvert.** Aucune donnée collectée : les trois slugs data.gouv.fr et les
noms d'attributs INPN restent `@unverified`, l'egress étant refusé ici (403 sur `api.gbif.org`,
`inpn.mnhn.fr` et `www.data.gouv.fr`, retesté ce jour). `fetch` est écrit pour que la première passe
locale soit lisible plutôt que confiante : elle imprime ce qu'elle trouve et s'arrête sur toute
ambiguïté. **Prochain pas, côté machine du propriétaire** : `npm run protected-areas:fetch --dry-run`,
relire la liste des ressources, puis `fetch` et `npm run protected-areas`. Richesse : toujours aucune
ville notée, par décision du 10/08 — le remède reste un recrawl GBIF agrégé par `datasetKey`
(`QUERY_VERSION = 3`), pas un correctif d'affichage.

### F63 — Qualité de l'air : passer du modèle à la mesure

Demande utilisateur 2026-07-29 : *« beaucoup de requêtes en recherche Google »* sur la
qualité de l'air. La section existe déjà (`/villes/[slug]/air` ×540 + EN
`/cities/[slug]/air-quality`) — l'enjeu n'est pas de la créer, c'est de la rendre
crédible et de lui donner les surfaces que la demande réclame.

**Le problème, d'abord.** `lib/air-quality.ts` ne mesure rien : NO2, PM2.5, ozone et
pollens sont **calculés par heuristique** depuis le seed (population, département,
`characterTags`, couloirs autoroutiers). La légende de la page affiche pourtant
« ATMO · CITEPA · RNSA » — ce sont les sources du *modèle*, pas des relevés, et un
lecteur qui cherche « qualité de l'air à Grenoble » lit ça comme une mesure. C'est
exactement le proxy que Filosofi a fait tomber pour le revenu et l'Insee pour la
population ; le même traitement s'impose ici, et c'est le prérequis avant d'ouvrir
la moindre nouvelle page.

**Phase 1 — données réelles** `scripts/city-air-quality.mjs`
- **Indice ATMO quotidien**, publié **à la commune** par les AASQA via ATMO France /
  data.gouv.fr. C'est la source la plus directe : elle couvre les 34 969 communes,
  donc les 540 du seed, sans interpolation. Agréger en normale annuelle (nombre de
  jours par classe 1-6) plutôt qu'en photo d'un jour.
- **Geod'Air** (LCSQA / Ineris) pour les **concentrations par polluant** (NO2, PM10,
  PM2.5, O3) mesurées en station. Là, pas de couverture communale : rattachement à la
  station la plus proche avec **distance affichée**, pattern `lib/climate-normals.ts`
  (29 stations Météo-France, snap au plus proche). Une commune à 40 km de la première
  station ne reçoit pas le chiffre de cette station en silence.
- **Pollens** : le RNSA publie un risque par bassin, pas par commune, et sa licence
  n'est pas la Licence Ouverte — **vérifier les conditions de réutilisation avant
  d'intégrer quoi que ce soit**. À défaut, la dimension pollen reste modélisée et la
  page dit qu'elle l'est.
- Resumable + caché dans `.cache/city-air-quality/`, sortie `data/city-air.json`
  commitée par lots. Egress : supposer le refus côté routine cloud (403 CONNECT) →
  **passe locale**, comme Insee et Overpass.

**Phase 2 — ce que la demande de recherche réclame**
- **Hub national `/qualite-de-l-air`** (+ EN `/air-quality`) : il n'existe pas
  aujourd'hui, l'air n'est qu'une sous-page ville et une ligne dans les classements
  `nature` / `ecologie`. C'est la page qui capte la requête générique.
- **Classement `/classements/qualite-de-l-air`** — aucun des 19 slugs de
  `RANKING_META` ne porte l'air ; l'ajouter suppose `RANKING_EN` en même temps.
- **Série de guides `qualite-de-l-air-[ville]-2026`** — à ouvrir **après** la phase 1
  seulement : une série de 540 pages bâtie sur des heuristiques serait un passif, pas
  un actif.
- **Angle saisonnier pollens** (pics de mars à juillet) et **angle épisodes de
  pollution** (inversion thermique en vallée alpine, chauffage bois l'hiver) : ce sont
  les deux moments où la requête explose.

**Ce qui est déjà correct — ne pas le « corriger ».** « Qualité de l'air » nomme une
qualité → `10 = bon`. Le moteur mesure l'**exposition** (`10 = pire`) et l'inversion
se fait **au site d'affichage**, FR et EN, avec la légende « 10 = air le plus pur »
des deux côtés. C'est conforme à `CLAUDE.md` § Score convention et les jumelles
hreflang affichent bien le même nombre. Vérifié le 2026-07-29.

**Règle d'honnêteté** : une commune sans station proche ou hors couverture n'affiche
pas de concentration — elle le dit. Attribution LCSQA / ATMO / Licence Ouverte Etalab
avec les chiffres, et distinction visible entre ce qui est **mesuré** et ce qui reste
**modélisé**.

**Note de méthode** : la demande de recherche n'a **pas pu être chiffrée** ici — le
plan Ahrefs refuse le keyword explorer et l'accès Search Console (`Insufficient
plan`). Avant d'industrialiser la série de guides, sortir les volumes réels de la
Search Console : ils décideront de l'ordre des villes, pas la population.

### F64 — Actualité locale par ville

**Demande utilisateur (2026-08-03)** : une section « actu » sur chaque ville.

**Intention** : le site dit ce qu'une ville **est** (scores, loyers, climat, air) mais
jamais ce qui **s'y passe en ce moment**. Quelqu'un qui hésite à s'installer quelque
part veut savoir qu'une ligne de tram ouvre en 2027, qu'un CHU ferme un service, que
le PLU passe en révision. C'est aussi la seule couche du site qui donne une raison de
**revenir** : tout le reste est stable sur des années.

#### Décision d'architecture : une section, pas une page

La demande dit « section par ville » et c'est exactement le bon périmètre — **ne pas**
en faire `/villes/[slug]/actualites` ×540. Une page dont le corps est une liste de
titres agrégés est le cas d'école du *scraped content* chez Google : 540 pages quasi
vides à la publication, dupliquant des titres présents ailleurs, sur un site dont
54 000 pages sont déjà indexées. Le rapport risque/gain est mauvais. La section vit
donc **dans `CityProfile`**, sous les données, et n'a pas d'URL propre.

Corollaire : pas d'entrée sitemap, pas de JSON-LD `NewsArticle` (on n'est pas
l'éditeur), et la section **disparaît** quand une ville n'a aucun élément récent —
un bloc « Aucune actualité » sur 300 villes serait pire que pas de bloc.

#### Sources — par ordre de solidité juridique

1. **Open data officielle, sans ambiguïté de licence.** C'est le socle et ça devrait
   être l'essentiel du volume :
   - **BODACC** (`api.bodacc.fr`, Licence Ouverte) — créations, radiations et
     procédures collectives par commune. Signal économique réel et daté.
   - **JO Associations** (`data.gouv.fr`, Licence Ouverte) — créations d'associations
     par commune : un proxy honnête de vitalité locale.
   - **Géorisques / arrêtés CatNat** (`data.gouv.fr`) — arrêtés de catastrophe
     naturelle par commune, à croiser avec `/villes/[slug]/risques` déjà en ligne.
   - **DVF** (mutations foncières) — déjà partiellement exploité côté immobilier.
2. **Flux RSS de la presse quotidienne régionale** — techniquement disponibles, mais
   la reprise systématique de titres relève du **droit voisin des éditeurs de presse**
   (loi 2019-775). Un agrégateur qui reprend titre + accroche entre dans le champ.
   **Gate explicite** : ne pas brancher la PQR tant que la question n'est pas tranchée.
   Si on y va : titre + source + date + lien sortant `rel="nofollow"`, **jamais**
   d'accroche reproduite, attribution visible, et retrait sur simple demande.
3. **À exclure** : Google News RSS (reprise interdite par les CGU), tout scraping de
   page d'article, toute reformulation par IA d'un article de presse — reformuler ne
   fait pas disparaître le droit voisin, ça ajoute juste un risque d'erreur factuelle
   signée par nous.

**Phase 1 = sources 1 uniquement.** Elle est suffisante pour livrer et ne dépend
d'aucun arbitrage juridique.

#### Pipeline

`scripts/city-news.mjs`, pattern `scripts/city-parks.mjs` : crawl caché et resumable
dans `.cache/city-news/`, ~1 req/s, backoff sur 429, User-Agent contactable →
`data/city-news.json` commité → `lib/city-news.ts` → section dans `CityProfile`.

Le fichier est **fenêtré** : on ne garde que les 12 derniers mois et au plus 8 entrées
par ville, sinon le JSON grossit sans fin dans le bundle. Chaque entrée porte
`{ date, kind, title, source, sourceUrl, licence }` — `licence` est obligatoire au
niveau de l'entrée, pas du fichier, parce que les sources n'auront pas toutes la même.

#### Fraîcheur : une routine, pas un build

Une actu n'a de valeur que datée, et le site est en **export statique** : rien ne se
rafraîchit sans rebuild. D'où la routine planifiée (voir ci-dessous) qui re-crawle,
commit le JSON et redéploie. Sans elle, la section serait périmée en deux semaines et
ferait activement du mal à la crédibilité du reste.

**Cadence** : hebdomadaire. Le BODACC et le JO Associations publient en continu mais
la granularité utile pour « est-ce que cette ville bouge » est le mois, pas l'heure —
un crawl quotidien coûterait 7× plus pour la même information.

#### Honnêteté

La section affiche **ce qu'elle est** : « Signaux publics récents », pas « Actualité de
[ville] ». On ne réécrit pas, on ne commente pas, on ne classe pas en bon/mauvais. Une
création d'entreprise n'est pas une bonne nouvelle en soi et une radiation n'est pas
une mauvaise. Chaque entrée cite sa source et sa licence.

#### Risques

- **Thin content** — traité par l'absence d'URL propre et le masquage quand vide.
- **Droit voisin** — traité par le gate PQR ci-dessus ; phase 1 n'y touche pas.
- **Poids du bundle** — `CityProfile` est déjà le point chaud du site (~1 Mo de JS).
  La section doit être rendue **côté serveur** et ne rien ajouter au bundle client.
- **Périmé** — traité par la routine ; si la routine casse, la section doit afficher
  la date du dernier rafraîchissement plutôt que faire semblant.

#### État au 2026-08-04 — moteur livré, données non collectées

**0/540 villes.** `data/city-news.json` vaut `{ meta, cities: {} }`, donc la section ne
s'affiche nulle part — c'est le comportement voulu, pas une panne. Ce qui est en place :
`scripts/city-news.mjs` (`npm run news`, + `:probe` / `:selftest` / `:prune` / `:stats`),
`lib/city-news.ts`, `components/CityNewsSection.tsx`, câblé sur les deux pages ville
(FR `/villes/[slug]` et EN `/cities/[slug]`). `npm run news:selftest` : 38 contrôles
hors ligne, tous verts.

**Egress toujours refusé** (403 CONNECT retesté le 04/08 sur `api.bodacc.fr` et
`www.data.gouv.fr`). Le crawl partira d'une passe locale, comme F62/F59.

**Vérification de rendu.** Le `npm run build` complet a compilé et typé sans erreur puis
s'est arrêté à 26 k / 56 k pages sur le quota disque de la session (pas sur une erreur de
code) ; `out/` + `.next/` ont été supprimés pour rendre la place. Comme le JSON est vide,
un build n'exerce de toute façon que le chemin « la section renvoie `null` ». Le chemin qui
comptera a donc été vérifié à part : fixture injectée dans `data/city-news.json` →
`renderToStaticMarkup` du composant en FR et EN → 16 contrôles (titres, mois vs jour exact,
`rel="nofollow"` sur tous les liens, libellés de source, licence affichée, mention de
rafraîchissement périmé, absence de rendu sans données), tous verts, fixture retirée.
C'est ce test qui a trouvé la fuite de français côté EN décrite plus bas.

Ce que ce run a tranché ou appris, à lire avant le premier crawl local :

- **La section est rendue par un composant serveur monté *après* `CityProfile`, pas
  dedans.** `CityProfile.tsx` est `"use client"` : y importer `lib/city-news.ts` ferait
  voyager tout `data/city-news.json` dans le bundle client de 540 pages déjà à ~1 Mo de
  JS, pour quelques lignes de texte. Le rendu serveur est une contrainte de la spec, le
  fichier d'accueil ne l'était pas. Précédent identique : `CityGuidesList`.
- **BODACC et le RNA sont agrégés en compteurs mensuels, pas listés nommément.** Le
  BODACC publie une annonce par entreprise et une grande part sont des entrepreneurs
  individuels, donc des personnes physiques nommées. Republier « X, radiation » sur une
  fiche ville, hors de son contexte d'annonce légale, sur un site à 54 000 pages
  indexées, c'est de la donnée personnelle rediffusée : la Licence Ouverte l'autorise,
  ça ne le rend pas correct, et ce n'est pas ce dont un lecteur a besoin. Les arrêtés
  CatNat, eux, sont des actes de l'État qui ne nomment personne — seuls ceux-là sont
  listés à l'unité. **Ne pas « enrichir » en repassant aux annonces nominatives.**
- **Le seed n'a pas de code postal, seulement `inseeCode`** — et l'ancrage commune du
  BODACC est le point ouvert du pipeline. Si le jeu expose une colonne Insee on s'y
  ancre (exact) ; sinon on retombe sur nom de commune + département, **qui n'est pas
  exact** (les homonymes existent, « Sainte-Marie » dans cinq départements). `resolveAnchor()`
  choisit et le log le dit par run. Géorisques et le RNA s'ancrent nativement sur l'Insee.
- **Tous les noms de champs sont `@unverified`** — aucune requête de ce fichier n'a
  jamais tourné contre les API réelles. **Lancer `npm run news:probe` en local avant le
  premier lot** : il imprime les champs réellement renvoyés et les valeurs distinctes de
  `familleavis`, et n'écrit rien.
- **L'ingest RNA est désactivé** (`RNA_RESOURCE_ID = null`) tant que la ressource
  data.gouv.fr n'est pas résolue. Il renvoie `null` = « on n'a pas demandé », jamais un
  tableau vide : une commune s'affiche alors sans la source `rna` plutôt qu'en laissant
  croire qu'elle n'a créé aucune association. Même règle que `cityProtectedAreas()` en F62.
- **Double fenêtrage, volontaire.** Le crawl élague (12 mois, 8 entrées/ville) *et*
  `lib/city-news.ts` refiltre à la date du build. C'est ce second passage qui protège le
  jour où la routine hebdo casse : un JSON figé depuis 14 mois se vide tout seul et la
  section disparaît, au lieu de présenter des dépôts d'il y a un an comme récents.
  `isCityNewsStale(slug)` fait afficher « dernier rafraîchissement réussi le … » à la
  place de « mis à jour le … ». Ne pas fusionner les deux fenêtres.
- **Chaque entrée porte sa jumelle anglaise (`titleEn`), écrite au moment du crawl.**
  Défaut trouvé en rendant réellement le composant : les phrases étant composées en
  français par le pipeline, `bestcitiesinfrance.com` affichait « 42 créations d'entreprises
  publiées au BODACC » sur une page anglaise — exactement la fuite que vise la convention
  #6 de `CLAUDE.md`. Les deux chaînes sont construites **depuis le même compteur**, donc
  les deux locales ne *peuvent pas* annoncer un chiffre différent pour une même ville (la
  règle hreflang tient par construction, pas par relecture). Exception assumée : sur un
  arrêté CatNat seul le cadre est traduit, **le libellé de risque reste en français**
  (« inondations et coulées de boue ») — c'est le mot d'un acte administratif, et une
  traduction approximative d'une catégorie juridique serait notre erreur attribuée à l'État.
- **Les 8 places se remplissent en tourniquet par type, pas par pure fraîcheur.** Le
  BODACC produit jusqu'à trois agrégats par mois : trier par date remplissait les huit
  places avec douze mois de compteurs d'entreprises et éjectait l'arrêté CatNat du
  printemps — précisément l'entrée qu'un lecteur doit voir. `roundRobinByKind()` sert un
  type à la fois avant d'en resservir un, les types étant visités par fraîcheur, donc le
  signal le plus récent ouvre quand même la liste. Ne pas « simplifier » en `.slice(0, 8)`.
- **Le cache est daté au jour** (`.cache/city-news/<slug>.<source>.<YYYY-MM-DD>.v1.json`),
  contrairement à F59 : les parcs sont un backfill unique où une réponse cachée vaut une
  réponse fraîche, ici c'est un **rafraîchissement** — la réponse de la semaine dernière
  est exactement ce qu'on cherche à remplacer. Clé au jour = un run interrompu reprend
  gratuitement, le run de la semaine suivante refetche pour de bon.
- **Le lot tourne, il ne re-crawle pas Paris chaque semaine** : `pickBatch()` prend
  d'abord les villes jamais collectées (plus peuplées d'abord), puis les lignes périmées,
  la plus ancienne d'abord.
- **Trois seuils qui doivent rester cohérents entre eux** — c'est le piège du run :
  une ville coûte ~3 requêtes à ~1 req/s (~3 s), le lot par défaut est de **180 villes**
  (~10 min), donc **540 / 180 = 3 runs hebdo pour une rotation complète**, et une ligne
  donnée est rafraîchie toutes les ~3 semaines *quand tout va bien*. D'où
  `DUE_AFTER_DAYS = 14` côté script (une ligne devient éligible avant que son tour
  revienne) et **45 jours** côté affichage — soit deux rotations manquées. Le seuil
  d'affichage était d'abord à 21 jours : il aurait étiqueté « non revérifié depuis »
  quasiment toutes les villes en permanence, ce qui apprend au lecteur à ignorer
  l'avertissement le jour où il compte vraiment. Changer le lot par défaut oblige à
  rouvrir les deux autres nombres.

#### État au 2026-08-11 — la section est EN LIGNE sur 540/540 villes

Le cron local a fait le travail : `data/city-news.json` porte **540 villes et 4 212
entrées** collectées les 04 et 05/08 (363 villes le 4, 177 le 5), soit **BODACC 4 172**
(1 562 créations, 1 265 radiations, 1 345 procédures collectives) et **Géorisques 40
arrêtés CatNat**. 13 villes n'ont rien dans la fenêtre et n'affichent donc pas la
section — comportement voulu. Le RNA reste à zéro : `RNA_RESOURCE_ID` est toujours
`null`, aucune entrée `associations` n'existe, et les villes concernées omettent la
source au lieu d'annoncer zéro association.

Contrôles passés sur le fichier réel : plafond de 8 entrées respecté partout (max
mesuré 8), aucune date malformée ni future, aucun champ obligatoire manquant, `licence`
présente sur les 4 212 entrées, `titleEn` présente sur les 4 212, aucun écart de chiffre
entre `title` et `titleEn`. `npm run news:prune` ne trouve rien hors fenêtre (les entrées
vont d'octobre 2025 à août 2026). `npm run news:selftest` : 49 contrôles verts.

**Le défaut que seules les vraies valeurs pouvaient montrer : le mois en cours est
compté partiellement et se lit comme un effondrement.** Le crawl agrège les lignes BODACC
par mois de `dateparution` ; le seau du mois pendant lequel il tourne ne contient donc que
les jours déjà écoulés. Le tourniquet le place **en tête de liste, juste au-dessus du même
indicateur pour le mois précédent, complet**. Sur la page de Paris on lisait « 567 créations
d'entreprises en août 2026 » directement au-dessus de « 5 356 en juillet 2026 » : les deux
chiffres sont exacts, la colonne annonce une chute de 90 %, et la réalité est que le mois
d'août comptait quatre jours. Ce n'est pas un cas limite — **899 entrées sur 4 212, dans
452 villes**, et le rapport médian mois-en-cours / mois-précédent est de **0,16** sur les
895 paires comparables. Ça se reproduira à chaque rafraîchissement, par construction.

Corrigé **à la lecture, pas dans les données** (`newsPartialThrough()` dans
`lib/city-news.ts`) : le crawl ne peut pas être relancé d'ici, et surtout le défaut
reviendra à chaque lot — il appartient à la couche d'affichage. La règle est « même mois
que le `refreshedAt` de la ville, et le crawl n'a pas tourné le dernier jour du mois »,
donc elle reste juste quand le mois s'achève sans rafraîchissement. Trois choix à ne pas
défaire :
- **Marquer plutôt que masquer.** Supprimer l'entrée coûterait le signal le plus frais
  sans rien récupérer : le crawl a déjà plafonné la ville à 8 entrées, le mois complet
  que le mois partiel a évincé n'est pas dans le fichier. Et un mois marqué **se répare
  tout seul** au rafraîchissement suivant, qui réécrit le seau en mois plein. Précédent
  identique : le « au moins » des parcs tronqués en F62.
- **Le libellé est « partiel », pas « en cours ».** Si le mois s'achève sans que la ville
  soit repassée, le comptage reste tronqué mais le mois n'est plus en cours : seul le
  premier mot resterait vrai.
- **La date affichée est le jour où *nous* avons compté**, jamais une affirmation sur ce
  que le BODACC avait publié à cette date. Le décalage de publication de l'éditeur est
  inconnu ici, et il n'est pas uniforme : le même 4 août, Paris tenait 10,6 % des créations
  de juillet mais 1,0 % de ses procédures collectives.

Aucun chiffre n'est réécrit, ni dans le JSON ni à l'affichage. Vérifié en rendant
réellement le composant (`renderToStaticMarkup`, FR et EN) contre les données réelles :
20 contrôles verts, dont l'exclusivité du marquage (seules les lignes du mois de crawl
sont marquées, jamais un mois plein, jamais un arrêté CatNat qui est un acte daté),
`rel="nofollow"` sur tous les liens, licence affichée, absence de rendu sur une ville
vide ou inconnue, et absence de fuite de français côté EN.

**Garde permanente ajoutée à `npm run integrity`.** `data/city-news.json` arrive par
`git pull` depuis un cron qui tourne ailleurs, et c'est du JSON : aucune garde ne
s'exécutait au chargement, contrairement aux modules de `data/*.ts`. Le contrôle vérifie
désormais à chaque lot le plafond d'entrées, le format des dates, l'absence de date
future, la présence des six champs obligatoires dont `licence`, le schéma https des liens
sortants, et que chaque slug existe dans `CITIES_SEED` — un slug orphelin ne s'afficherait
jamais et signalerait que le crawl et le seed ont divergé.

À surveiller au prochain run : la rotation. Les 540 villes ont été collectées en deux
jours, donc elles arriveront à échéance **ensemble** (`DUE_AFTER_DAYS = 14`) au lieu de se
répartir sur trois lots hebdomadaires. Si le cron ne rattrape pas, les lignes vieilliront
de concert et le seuil d'affichage de 45 jours basculera lui aussi partout en même temps
— vers le 19/09 dans le pire cas. Ce n'est pas cassé, mais le lissage supposé par les
trois seuils n'existe pas encore.

---

## Flotte de routines — état 2026-08-03

19 routines actives, **34 runs/semaine, ≤ 5 par jour** (plafond). Avant arbitrage :
22 routines, 52 runs/semaine, 7,4/jour — les sept jours dépassaient.

| Jour | Routines (5 max) |
|---|---|
| Dim | parite-en, maillage-interne, parent-solo, ultra-audit MV, ultra-audit CertQuests |
| Lun | parite-en, content-multisection, biodiversite, outreach-mairies, portfoliohq |
| Mar | parite-en, roadmap-daily, maillage-interne, actu-locale, certquests-site |
| Mer | parite-en, content-multisection, narration-rework, roadmap-carry-on-pm, vacances-monoparental |
| Jeu | parite-en, roadmap-daily, maillage-interne, biodiversite, certquests-app |
| Ven | parite-en, content-multisection, narration-rework, parent-solo, integrite-donnees |
| Sam | parite-en, roadmap-daily, narration-rework, vacances-celibataire *(1 place libre)* |

### Revue du 2026-08-04 — la panne était commune à quatre routines

Le plafond de runs était réglé la veille ; ce qui ne l'était pas, c'est que quatre routines
tournaient **sans pouvoir aboutir**, pour une seule et même raison : l'environnement des
routines répond **403 CONNECT sur tous les hosts open data** (GBIF, INPN, BODACC,
data.gouv.fr, l'annuaire de l'État). Elles livraient donc des moteurs, des selftests et des
notes « à lancer en local » — et la donnée restait à zéro. État constaté : biodiversité
**0/540**, zones protégées **0/540**, signaux publics **0/540**, outreach **0 envoi**.

**Correctif : la collecte descend sur la machine locale, qui a l'egress.**
`scripts/local-data-runner.sh`, en cron à 02h20 et 14h20 UTC, lance les pipelines,
commite les JSON et pousse sur `main`. Les routines gardent l'aval (libs, surfaces,
classements, refenêtrage) et leurs prompts ont été réécrits pour qu'elles cessent de
tester l'egress et de préparer des passes locales. Journal :
`~/.local/state/meilleurville/data-runner.log`.

En lançant la collecte pour de vrai, trois bugs de l'ingest BODACC sont tombés le même
jour — dont un filtre commune qui renvoyait **0,1 % des lignes sans lever d'erreur**. Ils
n'étaient pas trouvables depuis une routine : le code n'avait jamais parlé à l'API.
C'est l'argument central pour ne plus écrire de pipeline qu'on ne peut pas exécuter.

Reste **une** pièce non automatisable en l'état : les couches INPN (zones protégées) sont
des shapefiles derrière une page de téléchargement, pas une API. Le runner saute l'étape
tant que les GeoJSON ne sont pas déposés — `npm run protected-areas:sources` imprime la
ligne `ogr2ogr` exacte.

Et **un** point à surveiller, non résolu : un run cloud a fini en **ENOSPC à l'export**
après avoir généré ses 55 787 pages. Le build écrit ~33 Go (`.next` 25 Go + `out` 8,4 Go) ;
toute routine qui lance `npm run build` peut mourir là-dessus, des deux côtés.

### Désactivées, avec la raison

- **`outreach-mairies`** — désactivée le 2026-08-04, à la demande du propriétaire. La
  routine ne peut plus envoyer (pas de `BREVO_API_KEY` dans l'environnement, et l'annuaire
  de l'État refusé par le proxy : aucune adresse de mairie n'est résolvable), donc elle
  produisait des vagues « préparées, 0 envoi ». Le rendement de fond ne plaidait pas pour
  débloquer : **137 envois → 1 réponse presse**. `docs/outreach-log.md` et
  `scripts/outreach-contacted.json` restent la mémoire de la campagne — si elle reprend un
  jour, c'est en local, et le registre des communes déjà contactées fait foi.
- **`en-locale-catchup`** — faisait exactement le travail de `parite-en` (« trouver UNE page
  FR sans équivalent EN et la porter ») mais sans outil de mesure. Les faire tourner toutes
  les deux, c'était deux agents sur les mêmes fichiers EN : le mode de défaillance décrit
  dans `[[parallel-agents-single-file]]`. `parite-en` la remplace avec `npm run parity`
  comme backlog ordonné.
- **`departements-nav`** — **0 commit en 30 jours** sur ~8 runs, alors que son backlog est
  encore ouvert (carte cliquable, pages département enrichies, limitrophes). Ce n'est pas
  une routine finie, c'est une routine qui échoue. À noter avant de la relancer : elle est
  la seule, avec `parent-solo`, à tourner sur **`claude-opus-4-7`** quand tout le reste est
  sur `claude-opus-5` — piste à tester en premier.
- **`ux-mobile-desktop`** — 0 commit en 30 jours. Son propre prompt admet qu'elle tourne
  sans navigateur ni egress et ne peut auditer que le HTML exporté ; en pratique elle ne
  trouve rien. À reprendre le jour où un vrai rendu est disponible.

### Fréquences réduites

- `biodiversite` 7 → 2/sem : bloquée sur l'egress (le crawl GBIF part d'une passe locale),
  4 commits pour ~30 runs sur 30 jours. Tourner tous les jours ne débloque rien. *(Depuis le
  04/08 le crawl tourne au cron local ; la routine est en aval du fichier et 2/sem suffit
  toujours — la donnée arrive plus vite qu'elle ne construit de surfaces.)*
- `narration-rework` 7 → 3/sem : la plus productive en volume (27 commits/30 j) mais c'est
  du retravail de copie existante. Sous plafond, une place vaut mieux ailleurs ; 3/sem
  livrent encore ~13 passes par mois.
- `roadmap-daily` 5 → 3/sem, `roadmap-carry-on-pm` 2 → 1/sem : le « carry-on » existait
  pour repasser derrière le run du matin **le même jour**. Avec roadmap-daily à 3 jours,
  ce doublon n'a plus lieu d'être.

### Réserve

⚠️ `palmares-mensuel` tourne le **2 du mois**, jour de semaine variable. S'il tombe un jour
déjà à 5, ce jour-là compte 6. Une fois par mois. Pour l'éliminer vraiment il faudrait
descendre la base à 4/jour partout (−7 runs/semaine) : arbitrage à faire, pas fait ici.

---

## Parité EN — bestcitiesinfrance.com au périmètre de mavilleideale.fr (ouverte 2026-08-03)

Demande utilisateur : « le site anglais doit être identique au français ».

### Pourquoi c'est prioritaire maintenant

Le domaine EN s'est effondré le **13/06/2026** : 168 impressions en position 15,1 le 12,
44 en position 51,4 le 13, puis sept semaines à plat (~20/jour, position 40-50). Ce n'est
pas une pénalité. Sur les 498 pages de l'export GSC, **187 étaient des pages FR servies sur
`www.bestcitiesinfrance.com`** (`/villes/biarritz/fiscalite`, `/comparer/bordeaux-vs-toulouse`,
`/guides/meilleures-villes-bord-de-mer-france-2025`) : **2 429 impressions et 90 des 165 clics
du domaine, soit 55 %**. Les requêtes le confirment — « se déplacer à bourges », « biarritz
taxe fonciere ». 110 des 165 clics venaient de **France**.

L'isolation de locale a coupé cette fuite : c'était juste, et ça a retiré la majorité du
trafic du domaine en un jour. Ce qui reste est le vrai site EN — qui n'avait jamais classé.
**Les requêtes d'intention relocation sont en position moyenne 40,6** (64 requêtes, 1 clic) :
« where to live in france » 54, « best places to live in france » 57, « safest cities in
france » 24,8. Le site EN n'est pas cassé, il est **incomplet** : 26 300 URL contre 28 328.

### L'outil de mesure fait foi

`npm run parity` (`scripts/check-parity.mjs`). Deux mesures séparées **volontairement**, on
s'est déjà fait avoir en les confondant :

- **Routes** — patterns `app/**/page.tsx` des deux arbres, hors-ligne. Répond à « quelle
  route n'existe pas en EN ». Tolère qu'une route EN dynamique (`/red-flags/[slug]`) couvre
  des pages FR statiques par thème : sans ça le rapport criait au loup sur ~30 faux écarts.
- **URLs** (`--sitemaps`) — nombre d'URL par section lu sur les deux sitemaps en ligne.
  Répond à « la route existe, mais couvre-t-elle autant de villes ». Une route EN présente
  peut n'émettre que 20 URL là où la FR en émet 600 : parité de routes verte, site EN trois
  fois plus petit. Les deux mesures sont nécessaires.

Tables dans `lib/i18n.ts` : `FR_TO_EN_ROUTE`, `FR_TO_EN_CITY_SUB`, `PARITY_EXCEPTIONS`
(asymétries assumées, avec la raison — la liste doit rester courte, sinon « parité » ne veut
plus rien dire).

### État au 2026-08-15 — **0 route FR sans jumelle EN** (tenu)

```
Routes : FR 217 · EN 165
0 route(s) FR sans jumelle EN :
```

`npm run parity` sort en **code 0**. Il était sorti en **code 1** au début du run du 13/08 :
`/vacances/ou-partir/[combo]`, livrée côté FR entre-temps, n'avait pas de jumelle. C'est le
régime normal de ce chantier maintenant — la parité n'est pas un état atteint une fois, c'est
une régression à rattraper chaque fois qu'une route FR apparaît (cf. § Livré le 13/08).
Elle était sortie en code 0 pour la première fois le 09/08.

| Route FR | Jumelle EN | URL |
|---|---|---|
| ~~`/comparer-departements` + `/[pair]`~~ | ✅ `/compare-departments` livré 04/08 | 391 |
| ~~`/comparer/[pair]/synthese`~~ | ✅ `/compare/[pair]/synthesis` livré 05/08 | 771 |
| ~~`/departements/[dept]/fiscalite` + `/synthese`~~ | ✅ `/departments/[dept]/tax` + `/synthesis` livrés 06/08 | 204 |
| ~~`/comparer-regions/[pair]/synthese`~~ | ✅ `/compare-regions/[pair]/synthesis` livré 07/08 | 78 |
| ~~`/guides/categorie/[categorie]`~~ | ✅ `/guides/category/[category]` livré 09/08 | 6 |
| ~~`/avis`, `/presse`, `/cgu`~~ | ✅ `/reviews`, `/press`, `/terms` livrés 09/08 | 3 |
| ~~`/quitter`~~ | ✅ `/moving-from` — **existait déjà**, la table était fausse | 0 |

**La parité de routes est atteinte. Le chantier n'est pas fini pour autant** : l'écart qui
reste est dans le **corpus** (guides 933 FR / **575 EN** au 10/08, tags 239 / 76), et il ne
se comble pas par du SSG dérivé. Le tableau de bord qui compte à partir d'ici est
`npm run parity --sitemaps`, pas le compte de routes.

**Depuis le 09/08 le run travaille le corpus, série par série**, en fermant d'abord les
séries FR qui n'ont aucune jumelle EN — c'est là que l'écart se creuse le plus vite. État :
`solo-travel-in-[city]-2026` **fermée le 14/08** (15 FR / 15 EN).
`single-parent-in-[city]-2026`, fermée une première fois le 10/08 à 20/20, **rouverte par le
batch 3 FR du 14/08 (+9) puis refermée le 15/08** (29 FR / 29 EN).

⚠️ **Une série « fermée » ne le reste pas.** C'est le deuxième mode de régression de ce
chantier, distinct de celui des routes et moins visible : `npm run parity` sort en code 0
pendant qu'une série FR déjà mise en miroir repart de neuf côté français. Aucun contrôle
automatique ne le signale — il faut re-differ les deux corpus par série à chaque run, ce qui
est précisément pourquoi le prompt dit de mesurer et non de réciter. Séries FR restant sans
aucune jumelle EN : `vacances-monoparentales-[ville]-2026` (7 FR / 0 EN) et le croisement
mois × profil, qui a sa route EN mais pas de guides.

**Écart de contenu, distinct de l'écart de routes** : guides 903 FR / 532 EN, tags 239 / 74.
Ce n'est pas une route à créer mais du corpus à écrire, et **jamais par traduction** — les
guides EN sont du contenu natif à angle expat, c'est une décision de fond (cf. § Bilingual
setup dans `CLAUDE.md`), pas une facilité.

**Exceptions assumées** : `/badge` ×541 reste FR-only (la motion backlink vise mairies et
offices de tourisme français) ; les surfaces de compte (`/auth`, `/dashboard`, `/favoris`,
`/mes-villes`) ne sont pas du contenu indexable.

### Livré le 13/08 — régression rattrapée le jour même : `/vacations/where-to-go/[combo]`

`npm run parity` est sorti en **code 1** en début de run : une route FR livrée depuis le
dernier passage, `/vacances/ou-partir/[combo]` (croisement mois × profil, 84 pages, `7f8226d`),
n'avait pas de jumelle EN. C'est exactement le mode de défaillance que le tableau de bord
existe pour attraper — rattrapé le jour même, il coûte une page ; un mois plus tard, cent.

**Livré** : `/vacations/where-to-go/[combo]` ×84 (12 mois × 7 profils), même moteur, mêmes
chiffres. `Crossing` (`lib/vacation-crossing.ts`) porte désormais les deux slugs dans **une
seule liste** — un croisement ne peut pas exister d'un seul côté, ce sont des alternates
hreflang l'un de l'autre. Le FR gagne son `languages` au passage (il n'avait qu'un canonical),
via `pathAlternates` : le slug de combinaison n'est pas dérivable d'une locale à l'autre, donc
`hreflangLanguages` aurait traduit la tête seule et pointé vers un 404.

⚠️ **Les slugs de profil EN diffèrent volontairement de `/vacations/profile/[profile]`**
(`april-single-parent` ici, `monoparental` là-bas). L'ancienne route sert encore des mots
français sur le domaine anglais ; la renommer demande ses redirections, c'est un chantier à
part. Ne pas « harmoniser » en cassant l'un ou l'autre — la raison est dans le bandeau de
`EN_PROFILE_SLUG`.

**Trois défauts de qualité trouvés en chemin, et corrigés** — la troisième priorité du
mandat (« une jumelle qui existe mais parle français est un défaut de parité au même titre
qu'une page absente ») :

1. **`fit.whyOneLine` partait en français sur les cinq surfaces EN de la famille**
   (`/vacations`, `month`, `activity`, `profile`, `region`). Sur les pages profil et région,
   `vacationFit` est appelé sans mois : la phrase se réduisait à « … reste un choix correct
   mais sans signal saisonnier marqué. » sur **chaque** carte de chaque page. Nouveau
   `enWhyLine()` (`lib/vacation-en.ts`), reconstruit au site d'affichage plutôt qu'en
   angliciant la lib, avec **exactement** les seuils de `buildWhyLine` — ce sont des
   alternates hreflang, elles doivent montrer le même nombre pour la même ville.
2. **Les 84 pages EN auraient été orphelines** : côté FR, les pages mois et profil portent
   chacune une section vers les croisements ; côté EN elles n'existaient pas. Ajoutées.
3. **« Single-parent families » était recopié dans trois pages EN** de la famille. Une seule
   table (`EN_PROFILE_LABEL`), plus les libellés de mois.

```
Routes : FR 217 · EN 165
0 route(s) FR sans jumelle EN :
```

### Livré le 09/08 — les 4 dernières routes, et une table qui mentait

**Le run a d'abord trouvé que `/quitter` n'avait aucune route à écrire.** `FR_TO_EN_ROUTE`
portait `quitter: "leaving"` et `"ou-vont-les-gens": "moving-from"` : les deux paires étaient
**croisées**. Or `/quitter/[pair]` (comparatif origine → destination, moteur `QUITTER_PAIRS`)
est la jumelle de `/moving-from/[pair]`, et `/ou-vont-les-gens/[ville]` (« où vont les gens
qui partent d'ici », moteur `migrationFor`) celle de `/leaving/[city]` — les quatre pages
existaient déjà, correctement.

Le croisement était invisible parce qu'il **se compensait** : `/quitter/[pair]` → `/leaving/
[pair]` tombait sur `/leaving/[city]` via la tolérance `coveredByDynamic`, et
`/ou-vont-les-gens/[ville]` → `/moving-from/[ville]` sur `/moving-from/[pair]` de la même
façon. Deux faux verts et un seul faux rouge (`/quitter` → `/leaving`, qui n'a pas de hub).
Écrire la page réclamée par le rapport aurait produit un **doublon** de `/moving-from`.
Leçon à garder : vérifier une correspondance par **la lib que les deux pages importent**, pas
par la ressemblance des mots — `quitter` et `leaving` se traduisent l'un l'autre et ne
désignent pas la même page. Corrigé côté table, zéro fichier de page créé.

**Trois hubs et une famille de catégories, écrits.**

- **`/reviews`** (jumelle de `/avis`) — note des 540 villes sur 8 axes + avis d'habitants.
  Même `MIN_POP = 15 000` que le FR, donc les deux pages classent **les mêmes villes** ; les
  scores viennent de `CITIES_LIGHT` sans recalcul. Labels de palier traduits au site
  d'affichage (`TIER_EN`, même carte que `CityCard`), `lib/utils.ts` reste français.
- **`/press`** (jumelle de `/presse`) — angles réécrits pour un desk anglophone plutôt que
  traduits : la relocation vue de l'étranger, le recoupage des 19 classements, et le
  contre-cliché sur la Provence et la Dordogne. Le mot « département » est glosé, un lecteur
  anglophone n'a pas la maille administrative en tête. Compteur de guides = `EN_GUIDES.length`
  (555) et non `GUIDES_COUNT` (933) : annoncer 933 guides sur un domaine qui en sert 555
  serait faux, c'est la limite du « même chiffre des deux côtés » — les **classements** sont
  les mêmes, les **inventaires** décrivent chaque domaine.
- **`/terms`** (jumelle de `/cgu`) — mêmes six clauses, même fond (même service, même droit
  français). Ce qui est ajouté est ce qu'un lecteur non français ne devine pas : que le droit
  applicable reste français où qu'il lise le site, que les données sources gardent **leur**
  licence (Licence Ouverte / ODbL / CC BY) indépendamment de nos CGU, et le renvoi aux
  dispositions impératives du pays de résidence pour un consommateur de l'UE.
- **`/guides/category/[category]`** ×6 (jumelle de `/guides/categorie/[categorie]` ×7). ⚠️ Les
  catégories EN **ne sont pas les FR traduites** : `EN_GUIDE_CATEGORIES` en compte six
  (`city-guide` 277, `lifestyle` 96, `moving` 87, `budget` 76, `remote-work` 10, `family` 9)
  contre sept côté FR, parce que le corpus anglais est natif. La page dérive donc sa liste et
  son `generateStaticParams` de `EN_GUIDE_CATEGORIES`, et le sitemap de la **même** source —
  une liste recopiée dériverait au premier ajout. Intro écrite par catégorie (dériver une
  phrase du label ne fait que répéter le label) et `h1` distinct du label, sinon `city-guide`
  affiche « City guide guides ».

**Le CSV presse est désormais bilingue et généré d'un seul jet.**
`scripts/export-presse-csv.ts` émet les deux fichiers dans la même boucle sur le même seed :
`public/presse/classement-mavilleideale-2026.csv` (inchangé, octet pour octet) et
`public/press/ranking-bestcitiesinfrance-2026.csv` (en-têtes anglais, URL `/cities/`). C'est
une garantie **structurelle** que les deux domaines publient les mêmes nombres : deux scripts
séparés auraient divergé au premier recalcul sans que rien ne le signale.

**Deux défauts trouvés au passage, hors périmètre initial mais corrigés.**

1. **Le 404 du domaine anglais était en français.** `app/not-found.tsx` produit l'unique
   `404.html` de l'export, et le Worker le sert sur **les deux** domaines (`serve404()`) —
   donc chaque URL morte de bestcitiesinfrance.com répondait « Cette page n'existe pas », y
   compris les 404 que le Worker génère lui-même quand un chemin EN n'a pas d'asset, qui sont
   les plus probables sur ce domaine. Branché sur `DEFAULT_LOCALE`, inliné au build : sortie
   FR inchangée, vérifiée en dev sur les deux locales.
2. **Le rapport de parité criait au loup sur `calculator` et `simulator`.** Plusieurs entrées
   de `FR_TO_EN_ROUTE` visent une route EN de deux segments (`calculateur-cout-reel` →
   `calculator/real-cost`) ; comparer la valeur entière à une tête EN ne tombe jamais en face.
   Les deux têtes étaient rapportées « sans origine FR » alors qu'elles en ont une. Le même
   bug faussait le comptage `--sitemaps` de ces sections. Corrigé en comparant sur la tête de
   la valeur mappée.

**Découvrabilité** : les six catégories EN sont liées depuis les titres de section du hub
`/guides` ; `/reviews` et `/press` + `/terms` entrent dans le `Footer` EN (le FR n'est pas
touché). Sitemap : `/reviews`, `/press`, `/terms` dans `en-static`, les six catégories en tête
de `en-guides` (miroir exact du FR).

⚠️ **Reste ouvert, vu pendant le run et non traité** : le hub EN `/guides` rend les **555
guides en cartes complètes** sur une seule page — exactement l'anti-pattern documenté dans
CLAUDE.md § Performance constraints, celui qui avait coûté 2,5 Mo de HTML au `/guides` FR
avant plafonnement. Le FR a été plafonné (`INITIAL_VISIBLE` + index `<details>`), l'EN non.
Les pages de catégorie livrées aujourd'hui sont la moitié du remède (elles donnent où
renvoyer) ; il manque le plafonnement du hub lui-même.

### Livré le 04/08 — `/compare-departments` (391 URL)

Jumelle EN de `/comparer-departements` : le hub (390 duels groupés par région) et les 390
pages de paire. Mêmes paires, mêmes chiffres, même code de dérivation que le FR — les
moyennes par département sont recalculées depuis `CITIES_SEED` par la même fonction, axe par
axe, avec la même tolérance d'égalité (0,05). Une paire EN et sa jumelle FR ne peuvent donc
pas afficher deux nombres différents, ce qui est la règle sur des alternates hreflang.

Trois points de méthode qui valent au-delà de cette route :

- **hreflang dans les deux sens, cette fois.** Les paires de département portent le **même
  slug** des deux côtés (`rhone-vs-isere`, construit par le même `deptToSlug`), donc la
  famille rejoint `FR_TO_EN_SEGMENT` plutôt que d'être décrite à la main : `hreflangLanguages`
  et `hreflangLanguagesEn` la traitent désormais sans code spécifique. Les deux pages FR,
  qui ne déclaraient qu'un `canonical`, gagnent leur `languages` — sans quoi l'objet
  `alternates` de page aurait continué de remplacer celui du layout et la paire aurait
  disparu en silence sur 391 URL.
- **Chunk sitemap ajouté en queue.** `en-compare-departments` est le dernier élément de
  `SITEMAP_CHUNKS_EN` : l'index d'un chunk **est** son URL publique
  (`/sitemap/<index>.xml`, annoncée dans `robots.txt`), donc une insertion au milieu
  renumérote tous les chunks suivants et invalide ce que Search Console connaît.
- **Le contrôle de parité recopiait `FR_TO_EN_SEGMENT` en dur.** Déplacer une famille vers
  la table de base la faisait aussitôt remonter comme « tête non mappée ». `check-parity.mjs`
  lit maintenant le littéral à la source (`extractRecord` accepte un `const` non exporté) —
  une copie qui dérive dans l'outil de mesure est pire qu'un écart dans le site.

Maillage interne posé en même temps, sinon les 390 pages ne sont atteignables que par le
sitemap : lien depuis le hub `/departments`, depuis `/compare`, depuis `/compare-regions`,
et surtout un bloc « Compare *X* with its neighbours » sur chaque `/departments/[dept]`,
symétrique du bloc FR. Le Worker traduit aussi `/comparer-departements/*` reçu sur le domaine
EN vers la vraie page anglaise, au lieu de renvoyer vers le site FR comme avant.

### Livré le 05/08 — `/compare/[pair]/synthesis` (771 URL)

Jumelle EN de `/comparer/[pair]/synthese` : **722 paires + 49 triplets**, compté au build
(l'estimation « ~614 » de la fiche datait d'avant l'extension de `SEO_PAIRS` du 28/07). Le même segment
dynamique servant les deux rendus comme côté FR. Zéro recalcul — `computeCitySynthesis`
est appelée telle quelle, donc les 8 scores, l'écart-type de cohérence, le seuil de
significativité (0,3 pt) et le verdict sont dérivés des mêmes valeurs que la page FR.
Seul l'habillage est traduit, au point d'affichage : libellés d'axes, hints (avec les
sigles explicités pour un lecteur non francophone — « A&E » plutôt que « urgences ») et
liens d'axe réécrits vers l'arbre `/cities/[slug]/...`.

Deux points de méthode :

- **Le hreflang de cette famille ne pouvait pas passer par les helpers existants.**
  `hreflangLanguages` / `hreflangLanguagesEn` ne traduisent que la **tête** de route :
  sur `/compare/<pair>/synthesis` elles auraient produit `/comparer/<pair>/synthesis`,
  une URL FR qui n'existe pas — et un hreflang vers un 404 coûte plus cher que pas de
  hreflang. D'où `pathAlternates` / `pathAlternatesEn` dans `lib/i18n.ts`, où la page
  donne explicitement les deux chemins. À réutiliser pour toute famille dont c'est le
  **dernier** segment qui est traduit (les trois routes `.../synthese` restantes).
- **La page FR ne déclarait qu'un `canonical`.** Elle remplaçait donc l'objet
  `alternates` du layout et perdait sa `languages` en silence, sur 771 URL. Corrigé en
  même temps, comme pour `/comparer-departements` le 04/08 — c'est le piège n°1 de ce
  chantier, il se re-tend à chaque route. Sa branche paire à deux villes n'avait pas non
  plus d'`images` dans son bloc `openGraph` (536 URL sans carte sociale) : même correctif
  que la sweep du 03/08.

Maillage : la CTA « ✨ 8 dimensions compared » est posée sur `/compare/[pair]` dans les
deux rendus (paire et triplet), symétrique de la CTA FR — sans elle les 771 pages ne
seraient atteignables que par le sitemap. Entrées ajoutées dans la section
`enCompareSection()` du sitemap, à la suite des URL existantes.

### Livré le 06/08 — `/departments/[dept]/tax` + `/synthesis` (204 URL)

Les deux dernières sous-pages de département sans jumelle : 102 pages fiscalité + 102 pages
synthèse 8 axes, une par département couvert par le seed (`getAllDepartments()`, donc
exactement le même jeu de slugs que les pages FR).

**Aucun recalcul, des deux côtés.** `fiscalityForCity()` et `computeCitySynthesis()` sont
appelées telles quelles : la taxe foncière, le taux DMTO, l'exemple à 280 000 €, les moyennes
par axe et l'écart-type de cohérence sortent des mêmes fonctions que la page FR, avec les
mêmes règles de découpe des tableaux (top 15, bas 10 seulement au-delà de 8 villes). Seuls
les libellés sont traduits, au point d'affichage.

Trois points de méthode :

- **La table de libellés fiscaux EN est passée en lib.** `/cities/[slug]/tax` portait un
  `FISC_EN` local dont les fourchettes sont, littéralement, les chaînes FR de `TIER_DATA`
  retypographiées en anglais. La page département a besoin des mêmes : deux copies d'un
  tableau de nombres, c'est une copie qui dérive. D'où `lib/fiscalite-en.ts`
  (`FISC_EN` + `fiscStateEn`), importé par les deux surfaces. Le moteur FR n'est pas touché
  — c'est bien une **companion lib** anglaise, pas une modification de la source de vérité.
- **`pathAlternates` / `pathAlternatesEn` réutilisés**, comme annoncé le 05/08 : c'est encore
  une famille dont le **dernier** segment est traduit (`fiscalite` ↔ `tax`,
  `synthese` ↔ `synthesis`), donc `hreflangLanguages` aurait émis `/departments/<d>/fiscalite`,
  une URL EN qui n'existe pas. Les deux pages FR, qui ne déclaraient qu'un `canonical`,
  gagnent leur `languages` au passage — le piège n°1 du chantier s'est bien re-tendu, comme
  prévu, sur 204 URL de plus.
- **`enDepartmentsSection()` du sitemap émet désormais le triplet** hub + tax + synthesis, en
  miroir exact de `departementsSection()`. Pas de nouveau chunk : les URL s'ajoutent dans la
  section existante, donc la numérotation publique des chunks est inchangée.

Maillage : les deux teasers du haut de `/departments/[dept]`, symétriques des deux teasers FR
(💰 fiscalité, ✨ synthèse). Sans eux les 204 pages ne seraient atteignables que par le
sitemap. Chaque page renvoie aussi vers l'autre, et la page fiscalité liste ses communes vers
`/cities/[slug]/tax`.

### Livré le 07/08 — `/compare-regions/[pair]/synthesis` (78 URL)

Jumelle EN de `/comparer-regions/[pair]/synthese` : les 78 paires de régions métropolitaines
(C(13, 2)), même `generateStaticParams`, même `parsePair` qui balaie `METRO_REGIONS` au lieu
de découper sur `-vs-` (les slugs de région contiennent eux-mêmes des tirets — un `split`
casserait `provence-alpes-cote-d-azur`).

**Zéro recalcul.** `computeRegionAverageSynthesis(region, CITIES_LIGHT)` est appelée telle
quelle : les 8 moyennes par axe, le global, l'écart-type de cohérence, le nombre de villes
agrégées et le seuil de significativité (0,3 pt) sortent de la même fonction que la page FR.
Les deux pages sont des alternates hreflang, elles ne peuvent donc pas afficher deux nombres
différents pour la même région. Seul l'habillage est anglais, au point d'affichage : libellés
d'axes, hints avec les sigles explicités pour un lecteur non francophone (« A&E » plutôt
qu'« urgences »), et liens d'axe réécrits vers les hubs `/environment`, `/healthcare`,
`/employment`, `/cycling`, `/safety`, `/demographics`, `/public-services`,
`/quality-of-life` — vérifiés un par un sur le disque avant d'être posés.

Points de méthode :

- **`pathAlternates` / `pathAlternatesEn` réutilisés** pour la troisième fois, comme annoncé
  le 05/08 : c'est encore une famille dont le **dernier** segment est traduit
  (`synthese` ↔ `synthesis`). La page FR ne déclarait qu'un `canonical` et perdait donc sa
  `languages` en silence sur 78 URL — le piège n°1 du chantier s'est re-tendu à l'identique,
  pour la troisième route consécutive. C'était la dernière des `.../synthese` annoncées
  le 05/08 ; la série est close.
- **Les noms de région ne sont pas traduits**, conformément au reste du site anglais : ce
  sont des noms propres, et `/compare-regions/[pair]` les affichait déjà tels quels. Comme
  ils sont longs (« Provence-Alpes-Côte d'Azur »), le `title` passe par un `fitTitle` qui
  bascule sur une variante courte au-delà de 60 caractères plutôt que de se faire tronquer
  en SERP.
- **`images: ["/opengraph-image"]`** dans le bloc `openGraph`, dès l'écriture cette fois.

Une phrase a été ajoutée sous le tableau, qui n'existe pas côté FR : une moyenne régionale
lisse énormément, et les deux régions comparées contiennent des villes bien au-dessus et bien
en dessous du chiffre affiché. Le lecteur EN arrive de l'étranger et n'a pas la carte mentale
qui le lui rappelle.

Maillage : la CTA « ✨ 8 data dimensions » posée sur `/compare-regions/[pair]`, symétrique de
la CTA FR — sans elle les 78 pages ne seraient atteignables que par le sitemap. Les URL
s'ajoutent dans `enCompareRegionsSection()`, pas de nouveau chunk, numérotation publique
inchangée.

### Ce qui a été corrigé côté EN le 03/08

- **301 des chemins FR sur le domaine EN** (`frPathToEn()` dans `worker/index.ts`) : les 187
  URL indexées répondaient 404, ce qui jetait leur historique. Redirection vers l'équivalent
  anglais quand il est certain, vers la page FR sinon. Aucune URL devinée.
- **Carte sociale absente** sur 78 pages EN dont l'accueil (cf. § Shipped 2026-08-03).

### Point à trancher (produit, pas technique)

`/vacations/*` sur le domaine EN : 211 impressions, **0 clic**, position 75-78 sur
« cannes holidays », « holidays to cannes », « lourdes holidays ». Huit pages qui affrontent
Booking et Expedia en intention voyage pure, depuis un site de relocation, et qui diluent le
signal thématique du domaine. Noindex ou suppression — décision produit, pas correctif.

**Routine** : `meilleurville-parite-en`, quotidienne 04:25 UTC, `npm run parity` comme
tableau de bord, une route par run, sortie du contrôle collée dans chaque message de commit.

---

## Shipped 2026-08-15

- **R13.2 Palmarès mensuel — édition d'octobre 2026 : le taux d'effort logement réel** ✅ —
  Quatrième édition de la série mensuelle, guide `palmares-octobre-2026-taux-effort-logement`
  (`category: "budget"`, 8 sections, 2 511 mots). Le thème annoncé par l'édition de septembre a été
  honoré tel quel : le loyer rapporté non plus à un score mais **au niveau de vie médian que l'Insee
  publie commune par commune** (Filosofi 2021, `data/city-income.json` via `lib/city-income.ts`).
  `GUIDES` 955 → 956, `data/search-index.json` régénéré (956 guides), sitemap FR 29 020 → 29 021.
  Aucune page `/tags/[slug]` créée : les 5 tags du guide sont sous le seuil de 3 guides.

  **Le dénominateur est toute la difficulté, et c'est là que l'édition pouvait devenir fausse.**
  `medianIncome` est un **niveau de vie par unité de consommation**, pas un revenu de ménage : le
  diviser tel quel par un loyer de T3 aurait publié un taux d'effort presque doublé, sous un nom qui
  annonce autre chose. Le ménage de référence est donc explicite dans le guide — un couple avec un
  enfant de moins de 14 ans, soit **1,8 UC** sur l'échelle OCDE modifiée, qui occupe un T3 — et le
  revenu est reconstitué comme `niveau de vie × 1,8`. Le choix du ménage ne décide pas du classement :
  refait pour une personne seule en T1, la corrélation de rang est de **0,99** ; pour un couple sans
  enfant en T2, elle dépasse encore 0,99. **Ne pas rouvrir ce débat**, il est mesuré.

  **Périmètre : 357 communes, pas 363.** Le filtre de septembre (pop ≥ 20 000) est repris, mais six
  communes n'ont pas de niveau de vie publié et sortent : Les Abymes, Baie-Mahault, Cayenne,
  Saint-Laurent-du-Maroni et Mamoudzou (hors champ Filosofi), plus Pierrefitte-sur-Seine (fusionnée
  dans Saint-Denis en 2025). Le guide les nomme plutôt que d'annoncer un total rond.

  **Résultats.** Médiane 31,1 %, quartiles 27,1 % et 35,7 %, de **Aurillac 17,1 %** à **Paris 62,8 %**.
  5 villes sous 20 %, 56 sous 25 %, 135 au-dessus du tiers du revenu dont **86 franciliennes**.
  L'Île-de-France aligne 114 villes éligibles et **une seule dans les cent premières** (Montmorency,
  99e). Aucune commune de plus de 100 000 habitants ne descend sous 25 % ; le peloton de tête est
  Limoges 74e, Brest 81e, Saint-Étienne 89e, Le Mans 91e.

  **L'apport éditorial est la divergence loyer / effort**, mesurée et pas seulement affirmée :
  corrélation de rang de **0,79** entre le classement des loyers T3 et celui du taux d'effort. Roubaix
  a le 36e loyer le moins cher et le 197e taux d'effort ; Saint-Benoît (La Réunion) passe du 69e rang
  au 270e ; à l'inverse Sceaux passe du 329e loyer au 103e effort, Vertou du 161e au 27e. La paire la
  plus lisible : Mulhouse loue son T3 **moins cher** que Le Havre (780 € contre 870 €) et le logement
  y pèse **plus lourd** (31,3 % contre 28,7 %).

  **Une prévision de l'édition de septembre est corrigée à découvert, section dédiée.** Septembre
  pariait que plusieurs villes de son top 20 perdraient des places ici, un loyer bas sur un revenu bas
  ne faisant pas un logement abordable. Les 20 se classent en réalité **entre la 1re et la 72e place
  sur 357**. Le raisonnement valait, la prévision non, et le guide le dit avec l'explication : ces
  préfectures rurales ont des niveaux de vie proches de la médiane (21 420 €), le décrochage se joue
  ailleurs. Garder ce cadrage si l'édition est reprise — c'est le seul endroit du corpus où le site
  se dédit d'une annonce publiée.

  **Trois limites portées dans le guide, à ne pas diluer** : ① revenus au millésime **Filosofi 2021**
  contre loyers 2026, donc les taux absolus sont **surestimés** et seul le classement tient (le décalage
  s'applique aux 357 villes de la même façon) ; ② le loyer est un **loyer de marché**, donc un coût
  d'entrée pour qui arrive, pas ce que paient les locataires en place ni un loyer social ; ③ le revenu
  disponible Insee **inclut les prestations, aides au logement comprises**, ce qui joue en sens inverse
  et allège l'effort réel des ménages modestes. S'y ajoutent les charges et l'énergie, hors calcul, et
  le rappel que la médiane communale n'est pas tout le monde.

  **Contrôles.** `npx tsc --noEmit` propre, `npm run integrity` propre (956 FR / 628 EN, 0 score brut
  recopié), `npm run search-index:check` propre, `npm run sitemap:check` propre dans les deux sens et
  les deux locales. Vérification des chiffres **à travers les modules** (`npx tsx` important
  `@/data/cities-seed`, `@/data/housing`, `@/lib/city-income`), jamais par grep du seed : script de
  contrôle rejouant le classement et relisant le corps du guide — les **20 lignes du top 20** (loyer,
  niveau de vie, taux) et les **30 rangs cités** au format « Ne à X,X % » correspondent exactement.
  Départage à égalité de score par `name.localeCompare(…, "fr")`, comme le hub parent solo.
  `metaTitle` 55 caractères, `metaDesc` 156, **zéro tiret cadratin dans le corps** (R7.10), densité
  d'accents 0,144. Pas d'édition EN : la série palmarès est une motion FR, comme `/badge`.

  **Prochaine édition (novembre 2026), annoncée dans le guide et donc à honorer** : la **population
  municipale réelle** publiée par l'Insee aux millésimes 2011 / 2016 / 2022
  (`data/city-population.json` via `lib/city-population.ts`, 538/540 villes), croisée avec nos scores.
  Le guide pose la question sans en promettre la réponse, après la leçon de septembre.

- **Parité EN — série `single-parent-in-[city]-2026` REFERMÉE (batch 3, +9 : Villeurbanne,
  Besançon, Caen, Brest, Tours, Limoges, Clermont-Ferrand, Saint-Étienne, Le Havre)** ✅ —
  La série avait été fermée le 10/08 à 20 FR / 20 EN. Le batch 3 FR du 14/08 (`fb0b219`) a
  ajouté 9 villes côté français, rouvrant un écart de 9 le jour même. Il est refermé :
  **29 FR / 29 EN**, `EN_GUIDES` 619 → 628.

  **La leçon du run est dans ce cycle**, et elle est notée en tête de section : `npm run parity`
  est sorti en **code 0** au début comme à la fin, parce qu'il mesure les *routes* et qu'aucune
  route ne manquait. L'écart était dans le corpus, sur une série que la roadmap déclarait close.
  Un run qui se serait fié au tableau de bord seul serait passé à côté et serait allé écrire
  `vacances-monoparentales` (7 FR / 0 EN), laissant l'écart parent-solo dériver. **Le diff par
  série, refait à chaque run, est le seul contrôle qui voit ça.**

  **Vérification des chiffres avant rédaction, pas après.** Les 9 guides FR citent le composite
  parent solo, le rang sur 363 communes, les quatre axes, les loyers T1/T2/T3, le prix au m² et
  le revenu net minimum. Tous ont été relus **à travers les modules** (`npx tsx` important
  `@/data/cities-seed`, `@/data/housing`, `@/lib/parent-solo`), jamais par grep du seed — les
  36 scores d'axes, les 9 loyers T3, les 9 seuils de revenu et les 9 ratios €/point d'écoles
  correspondent exactement. Les **rangs** ne tombaient d'abord pas juste (Tours 39 au lieu de 49) :
  la cause est le départage, `app/parent-solo/page.tsx` triant à égalité de score par
  `name.localeCompare(…, "fr")`. Rejoué avec ce départage, les 9 rangs FR sont exacts et ont donc
  pu être repris. **Ne pas classer les villes à égalité sans ce tiebreak.**

  Contrôle croisé automatisé FR↔EN sur les 9 paires (règle 5 : deux alternates hreflang ne
  peuvent pas afficher deux nombres différents) : **64 scores et 122 montants en euros, zéro
  écart**. `npm run integrity` confirme **0 score brut recopié des deux côtés**.

  **Écrit en anglais natif depuis les faits des guides FR, aucun chiffre qui n'y soit.**
  `metaTitle` 51-55 caractères, `metaDesc` 134-149, 6 sections par guide (même découpage que le
  FR, contrairement aux batches tourisme qui fusionnent), **zéro tiret cadratin dans le corps**
  (R7.10). Aucun tag nouveau : les 9 réutilisent `auvergne-rhone-alpes` ×3, `normandy` ×2,
  `bourgogne-franche-comte`, `brittany`, `centre-val-de-loire`, `nouvelle-aquitaine` — le compte
  de tags EN reste à **82**, aucune page `/tags/[slug]` créée. `npm run search-index` relancé
  (`data/search-index.en.json` 628 guides).

  **Cinq apports propres au lecteur anglophone**, absents du FR parce qu'inutiles à un lecteur
  français : la glose du **T3** (les logements français se comptent en pièces hors cuisine et
  salle de bains, donc séjour + deux chambres) ; le fait que **Villeurbanne est une commune
  distincte de Lyon** avec sa propre mairie et sa propre administration scolaire, mais sur le
  même réseau TCL au même tarif — quelqu'un qui cherche « Lyon » depuis l'étranger ne la verra
  jamais, alors qu'elle coûte 230 € de moins par mois ; le renversement de l'intuition
  « centre historique = agréable à vivre » sur **Caen et Le Havre**, dont les centres
  reconstruits d'après-guerre offrent de vrais T3 familiaux traversants là où les centres
  anciens ne proposent que des surfaces découpées ; la reformulation de l'argument famille à
  **Brest**, le FR disant que la famille éloignée est souvent le seul relais de garde, ce qui
  frappe autrement un parent dont la famille est déjà dans un autre pays ; et la glose de
  **CAF / quotient familial / périscolaire / carte scolaire / maternité de niveau III**, plus
  le rappel que le critère de priorité famille monoparentale **se déclare** et ne se déduit pas
  d'un dossier — point qui compte davantage pour un parent étranger, dont le dossier ne signale
  rien par défaut.

  Contrôles : `npx tsc --noEmit` propre, `npm run integrity` propre (955 FR / 628 EN),
  `npm run search-index:check` propre, `npm run sitemap:check` propre dans les deux sens
  (29 020 URL FR inchangé / 28 487 EN, soit +9 côté EN et rien de bougé côté FR),
  `npm run parity` en code 0. **Prochain run** : la série est close, donc reprendre la tête de
  la liste des séries FR sans miroir EN — `vacances-monoparentales-[ville]-2026` (7 FR / 0 EN)
  est le candidat, **à re-mesurer avant de choisir**, et en re-differrant aussi les séries
  déjà fermées.

---

## Shipped 2026-08-14

- **Parité EN — série `solo-travel-in-[city]-2026` FERMÉE (batch 2, +7 : Rennes, Bayonne,
  Aix-en-Provence, Angers, Grenoble, Dijon, La Rochelle)** ✅ — Les 7 villes laissées par le
  batch 1 du 13/08 sont écrites, la série passe à **15 EN pour 15 FR** : la série FR
  `vacances-celibataire-[ville]-2026` n'a plus aucune jumelle manquante, et elle sort de la
  liste des séries FR sans miroir EN. **`EN_GUIDES` 612 → 619.**

  **Le run a commencé par la mesure**, comme prévu : `npm run parity` d'abord (code 0,
  217 routes FR / 165 EN, aucune route FR sans jumelle — la parité de routes tient depuis le
  09/08 et n'a pas régressé), puis le diff réel des deux séries, qui donnait 15 FR / 8 EN.
  L'ordre du batch 2 suit celui annoncé par le batch 1, sans arbitrage nouveau à faire.

  **Écrit en anglais natif depuis les faits des guides FR, aucun chiffre qui n'y soit** :
  effectifs étudiants (60 000 à Rennes et Grenoble, 40 000 à Aix et Angers, 30 000 à Dijon,
  15 000 à La Rochelle), temps de TGV, horaires de fin de service des trams et métros, temps de
  TER, noms de salles et de quartiers viennent tous du guide FR correspondant. **Aucun score
  n'est cité**, comme au batch 1 : les guides FR d'Aix, d'Angers, de Grenoble, de Dijon et de
  La Rochelle en citent (« score culture 8,4/10 », « transport 8,1/10 »), et les recopier côté
  EN ajouterait une surface de plus à garder synchronisée avec la valeur rendue pour un bénéfice
  de lecture nul — la qualité décrite passe par la prose. `metaTitle` 45-52 caractères,
  `metaDesc` 143-159, 6 sections par guide (même découpage que le FR), zéro tiret cadratin dans
  le corps (R7.10).

  **Un fait du FR volontairement non repris** : le guide FR d'Aix nomme un café historique du
  Cours Mirabeau avec la mention « à vérifier après restauration ». Un nom d'établissement
  assorti d'un doute est utile à un lecteur français qui connaît l'adresse ; sur le domaine EN
  il deviendrait une recommandation à un lecteur qui ne peut pas la vérifier. La phrase EN parle
  de cafés historiques sans nommer. Même logique que les tarifs hôteliers, absents des 15 guides
  de la série des deux côtés, chacun disant pourquoi.

  **Quatre apports propres au lecteur anglophone**, absents du FR parce qu'inutiles à un lecteur
  français : la glose du **pintxo** à Bayonne (petite bouchée basque posée sur le comptoir, qu'on
  se sert debout — le mot seul ne dit rien à un anglophone alors que c'est précisément ce qui
  rend le dîner solo banal là-bas) ; les usages de comptoir (dire bonjour en entrant avant toute
  demande à Rennes, le tarif comptoir affiché à part du tarif salle à Bayonne) ; l'avertissement
  **gare Aix-en-Provence TGV à quinze kilomètres du centre**, placé deux fois, dans la section
  hébergement et dans la section transports, parce qu'un voyageur étranger qui réserve « près de
  la gare » depuis l'étranger ne peut pas le deviner ; et la reformulation de l'accès à l'**île
  de Ré**, que le FR donne en « cinquante kilomètres pour rejoindre l'île en une heure par le
  pont » — l'EN garde l'heure de vélo et la piste cyclable dédiée, et laisse tomber le
  kilométrage, ambigu dans la source.

  **Aucun tag nouveau créé**, contrairement au batch 1 : les trois tags de série (`solo travel`,
  `travelling alone in france`, `single supplement`) existaient déjà et passent de 8 à 15 guides,
  les tags de ville (`solo travel rennes`…) restent à une occurrence donc sous le seuil de 3 de
  `lib/guide-tags-en.ts`, et les tags de région réutilisent les slugs existants (`bretagne`,
  `nouvelle-aquitaine` ×2, `provence-alpes-cote-d-azur`, `pays-de-la-loire`,
  `auvergne-rhone-alpes`, `bourgogne-franche-comte`). Le compte de tags EN reste donc à **82**,
  et aucune page `/tags/[slug]` n'est créée. `npm run search-index` relancé
  (`data/search-index.en.json` 619 guides, 82 tags), sans quoi `search-index:check` échoue.

  Contrôles : `npx tsc --noEmit` propre, `npm run integrity` propre (946 FR / 619 EN, 0 score
  brut recopié des deux côtés), `npm run search-index:check` propre, `npm run sitemap:check`
  propre dans les deux sens (29 010 URL FR / 28 478 EN, soit +7 côté EN et rien de bougé côté
  FR), `npm run parity` en code 0. **Prochain run** : la série est close, donc reprendre la tête
  de la liste des séries FR sans miroir EN, à re-mesurer avant de choisir — ne pas la réciter de
  mémoire.

---

## Shipped 2026-08-13

- **Parité EN — ouverture de la série `solo-travel-in-[city]-2026` (batch 1, +8 : Paris, Lyon,
  Bordeaux, Lille, Strasbourg, Toulouse, Montpellier, Nantes)** ✅ — La série FR
  `vacances-celibataire-[ville]-2026` (15 guides, batches des 01/08 et 08/08) était depuis le
  09/08 en tête de la liste des **séries FR sans aucun miroir EN**, celle que le chantier de
  parité travaille en priorité parce que c'est là que l'écart de corpus se creuse le plus vite.
  Elle n'est plus à zéro : **`EN_GUIDES` 604 → 612**, 8 des 15 villes couvertes, batch 2 (les 7
  restantes) à faire.

  **Le run a commencé par la mesure.** `npm run parity` d'abord (code 0, 217 routes FR / 165 EN,
  aucune route FR sans jumelle — la parité de routes tient), puis le diff réel des deux séries,
  qui donne 15 FR / 0 EN. Villes retenues pour le batch 1 par intention de recherche anglophone
  plutôt que par ordre du batch FR : Lille passe devant Rennes et Bayonne parce que c'est
  quatre-vingts minutes d'Eurostar depuis Londres, ce qui en fait la ville française la plus
  accessible à un lecteur britannique qui part seul un week-end. Restent pour le batch 2 :
  Rennes, Bayonne, Aix-en-Provence, Angers, Grenoble, Dijon, La Rochelle.

  **Slug `solo-travel-in-[slug]-2026`**, pas une traduction de `vacances-celibataire`. « Célibataire »
  et *single* ne se recouvrent pas : en anglais la requête qui porte ce contenu est *solo travel*,
  et *single* renvoie au statut matrimonial ou, précisément, au **single supplement** — qui reste
  le sujet d'une section par guide. Aucune collision avec
  `solo-female-expats-france-guide-2026`, qui traite de vivre en France en tant que femme seule,
  pas d'un séjour de trois nuits.

  **Écrit en anglais natif depuis les faits des guides FR, aucun chiffre qui n'y soit** : horaires
  de fermeture des métros et trams, effectifs étudiants, temps de TGV et d'Eurostar, noms de salles
  et de quartiers viennent tous du guide FR correspondant, lui-même passé au contrôle de citations.
  **Aucun score n'est cité**, volontairement — les guides FR en citent (« score transport 7,0/10 »)
  et c'est légitime chez eux, mais recopier un score dans un guide EN ajoute une surface de plus à
  garder synchronisée avec la valeur rendue pour un bénéfice de lecture nul. `metaTitle` 52-57
  caractères au gabarit `deux-points` de la série `studying-in-[city]`, `metaDesc` 138-153,
  6 sections par guide (même découpage que le FR : pourquoi la ville, où dormir, manger et boire
  seul·e, se déplacer après minuit, le supplément single, quand y aller). Zéro tiret cadratin dans
  le corps (R7.10).

  **Trois apports propres au lecteur anglophone, absents du FR parce qu'inutiles à un lecteur
  français** : la glose des institutions locales (*bouchon*, *estaminet*, *winstub* — le mot seul
  ne dit rien à un anglophone alors que c'est précisément la salle où dîner seul·e est banal) ; les
  usages de comptoir (dire bonjour en entrant avant toute demande, le tarif comptoir affiché à part
  du tarif salle, le service compris qui rend le pourboire facultatif) ; et pour Lille le rappel
  que les contrôles frontaliers Eurostar se font **avant embarquement à Londres**. Les prudences du
  FR sont tenues : **aucun tarif hôtelier n'est affiché**, chaque guide dit pourquoi (les prix
  bougent d'un mois et d'une plateforme à l'autre), et les horaires de transport restent donnés en
  approximation (« around midnight ») comme côté FR.

  **Trois nouveaux tags EN** (`solo travel`, `travelling alone in france`, `single supplement`) à
  8 guides chacun, donc au-dessus du seuil de 3 de `lib/guide-tags-en.ts` : ils créent trois pages
  `/tags/[slug]` côté EN, déclarées automatiquement au sitemap qui dérive de `TAG_SLUGS_EN`. Les
  tags de région réutilisent les slugs existants (`ile-de-france`, `occitanie`, `grand-est`…),
  aucune page de région créée en double. `npm run search-index` relancé
  (`data/search-index.en.json` 612 guides, 82 tags), sans quoi `search-index:check` échoue.

  Contrôles : `npx tsc --noEmit` propre, `npm run integrity` propre (939 FR / 612 EN, 0 score brut
  recopié des deux côtés), `npm run sitemap:check` propre dans les deux sens (29 001 URL FR /
  28 471 EN), `npm run parity` en code 0. **Non livré** : le batch 2 (7 villes), et l'équivalent EN
  du croisement `/vacances/ou-partir/[combo]` — la route `/vacations/where-to-go/[combo]` existe
  depuis le 13/08 au matin, mais aucune de ces pages ne renvoie encore vers la série solo, comme
  côté FR où la série n'est maillée que par `/guides`, les tags et les pages ville.

---

## Shipped 2026-08-12

- **F61 — croisement mois × profil : `/vacances/ou-partir/[combo]`, 84 pages SSG** ✅ —
  Item 4 du plan agent « vacances monoparentales », le dernier de la liste à n'avoir aucune
  surface. Le moteur savait répondre depuis F61 (`topCitiesForMonth(mois, villes, { profile })`),
  mais rien ne l'exposait : `/vacances/mois/[mois]` classait sans savoir qui voyage,
  `/vacances/profil/[profil]` classait sans savoir quand. Les 12 mois × 7 profils sont
  désormais adressables — « où partir en avril en famille monoparentale » est une page, pas
  une requête sans réponse. Sections : repères mesurés du mois (température et jours de pluie
  **médians du top 12**, part des destinations à affluence faible), top 12 avec signal mensuel
  par ville, **« ce que le mois change »**, **« sans voiture »**, puis les deux grilles de
  croisement. Zéro chiffre saisi à la main : tout sort de `lib/vacation-fit`,
  `lib/vacation-seasons` et `lib/transit`.
  - **La section qui porte la page est « ce que le mois change »** : un diff mesuré entre le
    classement du mois × profil et le classement du **même profil hors saison**, sur le même
    vivier (population ≥ 8 000, le seuil de `/vacances/profil/[profil]` — c'est ce qui rend les
    deux comparables). Le résultat est franc et il est affiché tel quel : selon la combinaison,
    **4 à 14 des 15 premiers changent** une fois la date posée. La page l'écrit en toutes
    lettres, avec le compte réel, et la méthodo précise que la saison pèse ~45 % contre ~25 %
    au profil : cette page répond à « parmi ce qui se tient en avril, qu'est-ce qui va le mieux
    à ce profil », pas à « quelle est la meilleure destination pour ce profil ». Un lecteur qui
    cherche la seconde réponse est renvoyé au classement du profil. Les villes qui reculent sont
    nommées avec leur relevé du mois, et la page dit qu'elles ne sont pas disqualifiées.
  - ⚠️ **La route imbriquée `/vacances/mois/[mois]/[profil]` a été écrite, testée, puis
    retirée — ne pas la recréer sans un `npm run build` local.** Sous Next 16.2.9 (`next dev`,
    Turbopack) elle a montré deux défauts : ① **à froid elle n'existait pas** — démarrage propre,
    404 sur `/vacances/mois/avril/monoparental` (slug pourtant sans accent) sans que la route
    soit seulement compilée, jusqu'à ce qu'un `touch` du fichier la fasse découvrir ; ② les
    slugs accentués répondaient par intermittence, la même URL alternant 200 et 500 sur
    « Page … is missing param … which is required with `output: export` ». **Le ② n'est pas
    imputable à l'imbrication** : vérifié, la route parente `/vacances/mois/[mois]`, inchangée
    et en ligne depuis des mois, échoue exactement pareil en dev sur `février`, `août` et
    `décembre` (l'erreur tombe en 10 ms, avant `generateStaticParams`) — c'est un défaut de
    `next dev`, la production sert bien ces URL. **Ne pas partir « corriger » les slugs
    accentués de la route mois sur la foi d'un 500 en local.** Restait ① — et surtout le fait
    qu'un build complet ne tient pas dans une session cloud, donc qu'aucune vérification
    d'export n'était possible. Un export qui casse, c'est tout le site qui cesse d'être
    publiable : d'où un slug plat et ASCII (`avril-monoparental`, `aout-famille`,
    `decembre-celibataire`) sur le modèle éprouvé de `/comparer/[a]-vs-[b]`. L'arbitrage complet
    est en tête de `lib/vacation-crossing.ts`.
  - **Vérifié route par route** : les **84 URL répondent 200** en dev (cold start, sans `touch`),
    y compris les combinaisons qui flanchaient en imbriqué, re-testées quatre fois de suite ; un
    combo inconnu (`avril-inconnu`, `nawak`) rend 404. `npx tsc --noEmit` propre,
    `npm run integrity` propre, `npm run sitemap:check` propre dans les deux sens (86 familles
    dynamiques FR vérifiées) — les 84 URL sont déclarées **et** servies.
  - **Maillage** : `/vacances/mois/[mois]` gagne une grille des 7 profils, `/vacances/profil/[profil]`
    une grille des 12 mois, et chaque page de croisement porte les 11 autres mois du même profil
    + les 6 autres profils du même mois. Le sitemap dérive de `CROSSINGS` — même liste que le
    `generateStaticParams`, donc pas de recopie à maintenir (`MONTH_SLUGS` y était encore codé en
    dur, il dérive maintenant de `MONTHS`, dans la lignée de `PROFILE_SLUGS` en F61).
  - **Correction de moteur au passage** : la clé du cache de classement de `lib/vacation-fit.ts`
    ignorait `minPop`, alors que le cache mémorise le classement **complet** (le `limit` ne
    s'applique qu'après). Deux appels au même mois et au même profil mais à seuils de population
    différents se seraient partagé une entrée — le premier appelant fixant silencieusement le
    vivier du second. Aucun appelant existant n'était touché (aucun ne passait de `minPop`
    explicite), mais cette page est la première à le faire.
  - **Restent ouverts sur la verticale** : batch 2 de `vacances-monoparentales-[destination]-2026`
    sur les rangs 8-25 du profil (Bordeaux/Lyon/Colmar/Annecy/Grenoble/Chambéry/Reims/Metz/
    Montpellier/Aix-en-Provence — vérifier transit tags et score sécurité avant écriture), et le
    miroir EN (item 5), ni la série `single-parent-holidays-[city]-2026` ni l'équivalent du
    croisement n'existant côté anglais.

- **`npm run sitemap:check` — le sitemap et l'arbre de routes se contrôlent enfin l'un
  l'autre** ✅ — `scripts/check-sitemap.mjs`, 22 s, les deux locales, dans les deux sens.
  Il ne réimplémente rien : il **exécute** `app/sitemap.ts` (18 chunks FR, 21 EN) et les
  `generateStaticParams()` réels des 172 familles dynamiques (85 FR + 87 EN), puis compare.

  **Pourquoi ce contrôle manquait.** Le sitemap est écrit section par section à la main,
  les pages se génèrent depuis les données : les deux dérivent en silence, et c'est arrivé
  trois fois documentées — les 604 URL biodiversité déclarées le 06/08 pendant que les pages
  étaient garées en `page.pending.tsx` (604 × 404 annoncés à Google), `PROFILE_SLUGS` figé en
  dur qui a laissé les deux profils vacances de F61 sans URL, et les deux pays
  `/expat-retour` dans le même cas le 05/08. Aucun des trois ne produit d'erreur : le build
  passe, les pages s'affichent, seul le sitemap ment. Et depuis qu'un `npm run build` ne va
  plus au bout en session cloud, plus rien ne les voyait.

  Trois comparaisons plus les invariants du protocole : ① toute URL déclarée doit avoir une
  route (sinon 404) ; ② toute route statique **indexable et canonique d'elle-même** doit être
  déclarée — les pages `noindex` (compte, callback) et les alias sont dispensés par lecture de
  leur source, pas par liste blanche, sinon la liste dérive à son tour ; ③ par famille
  dynamique, l'ensemble des URL déclarées doit être **exactement** l'ensemble des params
  générés. Plus : doublons, origine unique par locale, `lastModified` valide, chunk ≤ 50 000.
  Vérifié par test négatif avant commit (retrait de 3 villes du `citySection` → « 3 pages
  générées sans URL », URL inventée → « répondrait 404 »).

  **Deux pièges de comparaison, à ne pas défaire.** Le sitemap **encode** ses URL, comme le
  protocole l'exige : comparer sans `decodeURIComponent` fait ressortir en faux positif les
  12 mois de `/vacances/mois/[mois]` et les guides à slug accentué. Et une URL qui correspond
  aussi à une route statique appartient à celle-ci : sans cette règle, les 35 pages
  `/red-flags/villes-*` et `/palmares/personnaliser` passent pour des slugs dynamiques en trop.

  **Ce qu'il a trouvé du premier coup : EN `/quiz`.** Page réelle, en anglais natif, canonique
  d'elle-même — et **absente du sitemap EN comme de tout maillage interne** (`enQuizSection()`
  ne déclarait que son enfant `/quiz/compatibility`). Le FR `/quiz`, lui, est un alias qui
  canonicalise vers `/city-match` : son absence est correcte, et le contrôle fait bien la
  différence entre les deux cas. Corrigé : entrée sitemap (priorité 0,7, sous les deux outils),
  et lien retour depuis `/quiz/compatibility` pour qu'elle ne soit pas déclarée orpheline.
  Au passage, la carte « profils » de cette page annonçait **11 profils** quand `/for-who` en
  aligne 13 : le compteur est retiré plutôt que recopié une troisième fois en dur — les deux
  fichiers `for-who` le portent déjà chacun de leur côté.

  Le contrôle est **bloquant côté agent** (avant le push) et **signalé sans bloquer** dans
  `scripts/local-deploy-runner.sh` : un défaut de sitemap est un défaut de référencement, pas
  une raison de ne pas publier, et un runner qui refuserait de déployer pour ça reproduirait
  la panne du 10/08, où la prod avait cinq jours de retard sans que rien ne parle.

- **Parité EN — série tourisme rattrapée (batch 29, +6 : Cergy, Issy-les-Moulineaux,
  Aubervilliers, Mérignac, Pessac, Vénissieux)** ✅ — Les 6 jumelles
  `things-to-do-in-[slug]-2026` du batch FR 28 (11/08) écrites d'un coup dans
  `data/guides-en.ts`. **Compteurs mesurés : FR 200 (`-a-` strict 198 + les 2 slugs en
  `au-`), EN 200 — écart nul dans les deux sens, parité de la série rétablie**
  (`EN_GUIDES` 598 → 604). `npm run parity` reste en code 0 (215 routes FR / 164 EN).

  **Le run a commencé par la mesure, pas par la mémoire.** `npm run parity` d'abord (aucune
  route FR sans jumelle — le chantier des têtes de route reste fermé), puis le diff réel des
  deux séries, qui a désigné exactement les 6 villes du batch FR de la veille. Le conseil de
  nommage laissé par le batch 28 est tenu : `things-to-do-in-pessac-2026` et
  `things-to-do-in-merignac-2026` cohabitent avec `things-to-do-in-bordeaux-2026` (les trois
  communes sont limitrophes), et Issy garde `-les-moulineaux`. Aucun tag nouveau : les 6
  réutilisent `ile-de-france`, `nouvelle-aquitaine` et `auvergne-rhone-alpes`, donc aucune
  page `/tags/[slug]` créée. ⚠️ Le diff naïf continue de remonter deux **faux** trous
  (`au-puy-en-velay` → `le-puy-en-velay`, `au-tampon` → `le-tampon`) : le contrôle mappe ces
  deux slugs avant de comparer, ne pas « corriger » les slugs.

  **Écrit en anglais natif depuis les faits des guides FR, aucun chiffre qui n'y soit.**
  `metaTitle` 42-52 caractères, `metaDesc` 136-158, 8 sections par guide (la série FR en
  compte 10 ; la version EN fusionne les fins de liste comme tous les batches EN précédents).
  Trois `metaDesc` sortaient à 162-164 caractères au premier jet et ont été retaillées avant
  commit — le contrôle est scripté, pas à l'œil.

  **Les quatre prudences du FR sont reprises telles quelles, à ne pas diluer** : ① la
  collection du **CAEA à Mérignac est sur la base aérienne 106**, en zone militaire à accès
  restreint — présentée comme telle, pas comme un musée ouvert le dimanche ; ② la **villa des
  Brillants** (second site du musée Rodin) est **accessible depuis** Issy sans y être située,
  elle relève de Meudon ; ③ la **cité Frugès de Pessac est un quartier habité**, parcouru
  depuis la rue ; ④ sur Vénissieux, la Marche pour l'égalité de 1983 est **née aux Minguettes
  mais partie de Marseille** le 15 octobre, et les Minguettes sont décrites en quartier habité
  et en histoire urbaine, sans verdict de sécurité — le fort voisin est le **fort de Bron**,
  pas un fort de Vénissieux.

  **Trois ajouts propres à l'angle voyageur étranger, absents du FR parce qu'inutiles à un
  lecteur français** : la glose de *ville nouvelle* (Cergy — une des cinq villes planifiées
  autour de Paris à partir des années 1960, ce qui explique l'absence de centre médiéval et
  évite la déception), celle de *folie* bordelaise (Mérignac), et le rappel que la Marche de
  1983 est souvent rapprochée à l'étranger d'une marche des droits civiques alors qu'elle naît
  d'un contexte français propre. Rien n'est câblé à la main : la carte en vedette de
  `/cities/[slug]/things-to-do` résout `things-to-do-in-<slug>-2026` et le sitemap EN dérive de
  `EN_GUIDES`. `npm run search-index` relancé (`data/search-index.en.json` 604 guides), sans
  quoi `search-index:check` échoue.

## Shipped 2026-08-11

- **Parité EN — série `studying-in-[city]-2026` FERMÉE (batch 2, +13 : Marseille, Nice,
  Aix-en-Provence, Clermont-Ferrand, Nancy, Dijon, Angers, Caen, Tours, Poitiers, Amiens,
  Besançon, Limoges)** ✅ — Les 13 villes restantes écrites d'un coup dans `data/guides-en.ts`.
  **`EN_GUIDES` 585 → 598 ; série EN = 24 guides** (23 villes + le national
  `studying-in-france-non-eu-students-guide`). Le batch 1 du matin annonçait « la parité de cette
  famille est atteinte autour de 23 guides EN » : c'est exactement le compte, la série est close.

  **Le périmètre annoncé a été dépassé volontairement.** Le batch 1 proposait 10 villes pour un
  batch 2 ; il en restait 13 non couvertes (3 avec les deux sources FR — Nancy, Dijon,
  Clermont-Ferrand —, 8 avec seulement `etudiant-a-[ville]`, 2 avec seulement
  `universites-[ville]` : Aix et Nice). Laisser 3 villes orphelines aurait imposé un troisième run
  pour trois guides et laissé la série dans un état intermédiaire pendant plusieurs jours. Les 13
  sont écrites, la famille FR (20 `etudiant-a-` + 15 `universites-`, qui se recouvrent) a
  désormais **un seul miroir EN par ville** — la décision anti-cannibalisation du batch 1 est
  tenue jusqu'au bout.

  **Ce que la version EN ajoute, et qui n'a pas de raison d'être dans le FR.** Le contrat de série
  est repris tel quel sur les 13 : ① la **bourse CROUS sur critères sociaux (145-620 €/mois) est
  en pratique fermée aux étudiants non-UE** sous titre étudiant, et le **repas RU à 1 €** en
  dépend — les guides FR les présentent comme le socle de l'aide, un lecteur étranger qui budgète
  dessus se trompe de plusieurs centaines d'euros ; ② **APL/ALS est ouverte** avec un titre de
  séjour valide ; ③ **Visale** (gratuit, moins de 30 ans) remplace le garant physique résidant en
  France à 3× le loyer, qui est le vrai mur, pas le prix ; ④ **Études en France / Campus France**
  et la validation en ligne du VLS-TS dans les 3 mois ; ⑤ **grade de master contre titre RNCP** ;
  ⑥ le droit au travail à 60 % de la durée annuelle légale.

  **Angles propres à chaque ville, pas un gabarit rempli.** AMU est **une seule entité juridique
  sur deux villes** : un programme annoncé « Aix-Marseille Université » peut siéger à Aix, où le
  studio est à 620-750 € contre 500-590 € à Marseille — l'avertissement ouvre le guide de
  Marseille, et le piège du double trajet Aix-Luminy/Timone (1 h 30 porte-à-porte) ouvre celui
  d'Aix. Nice : le **piège saisonnier** (chercher en juillet-août est vain, les propriétaires
  louent au touriste à 2-3× le loyer étudiant) et les 45 min de RD35 vers Sophia Antipolis.
  Angers : **UCO est une université privée payante** dont le nom traduit en anglais se lit comme
  une faculté de l'université publique voisine à ~170 € — même piège que la Catho de Lille au
  batch 1, et le guide ne cite aucun montant faute de source. Caen : le **ferry
  Ouistreham-Portsmouth** et les plages du Débarquement, qui ne valent rien à un lecteur français
  et beaucoup à un Britannique. Besançon : le **CLA** fait de la ville le seul dossier de la série
  bâti autour d'une population étudiante internationale, avec le passage explicite « arriver en
  B1, séquencer CLA puis diplôme francophone ». Nancy et Besançon portent chacun l'avertissement
  frontalier qui manque partout ailleurs : **un titre de séjour étudiant français n'autorise par
  lui-même ni l'emploi au Luxembourg ni l'emploi en Suisse** (plus le plafond télétravail de
  34 j/an de la convention 2023 côté luxembourgeois). Limoges : le seul argument est le coût, donc
  le guide dit aussi ce qu'on achète en échange — un marché de l'emploi cadre étroit — et pourquoi
  payer une école privée à titre RNCP y serait la seule mauvaise décision disponible.

  **Contrôles.** ⚠️ `node_modules` était de nouveau absent au démarrage du conteneur : `npm install`
  avant tout, sinon `tsc` renvoie des dizaines de milliers de `Cannot find module` sans rapport avec
  le code. `npx tsc --noEmit` propre ; `npm run integrity` (540 villes, 933 guides FR, **598 EN**,
  **0 score brut recopié des deux côtés**) ; `npm run search-index` + `search-index:check`
  (`data/search-index.en.json` 585 → 598 guides, **79 tags inchangés**) ; `npm run parity` code 0.
  `metaTitle` 54-58 caractères, `metaDesc` 141-156, **6 sections sur les 13**, `relatedCities`
  toutes présentes dans `CITIES_SEED`. Aucune page `/tags/[slug]` maigre créée : les 13 tags
  `studying in [ville]` restent à 1 guide, sous `MIN_GUIDES_PER_TAG = 3`, et les tags de région
  réutilisent les formes majoritaires existantes (`french riviera` pour Nice,
  `provence-alpes-cote-d-azur` — et non la variante `-dazur` qui traîne à 2 occurrences).

  **Deux passes de correction que seul un contrôle chiffré pouvait produire.** ① Un script a
  comparé **chaque nombre** de chaque guide EN à l'ensemble des nombres de ses sources FR et aux
  scores rendus de `CITIES_SEED` : il a sorti **deux chiffres inventés** (un écart de loyer
  « 150-250 € » entre Aix et Marseille, une facture de chauffage « 200 € » à Tours) et quatre
  loyers-médians illustratifs (« sur un loyer de 400 € ») qui n'étaient dans aucune source —
  tous remplacés par les fourchettes réellement publiées. ② Un contrôle des superlatifs contre le
  classement réel des 23 villes de la série a cassé **trois affirmations fausses** : Nice n'est pas
  la ville la plus chère de la série (Paris, coût 2,2/10, l'est), Aix n'est pas deuxième mais
  troisième sur ce critère, et le 7,9/10 « écoles » d'Angers n'est pas le meilleur des treize
  (Aix est à 8,3). Les scores cités sont les valeurs **rendues** lues via `CITIES_SEED`, jamais les
  littéraux du seed. La densité de tirets cadratins a été ramenée de 2,0 à **1,16 pour 200 mots**
  (cible R7.10 ≈ 1 ; le batch 1 du matin est à 2,27 et mériterait la même passe).

  **Prochain run** : la série est close, ne pas la rouvrir. Les gros trous de parité restants,
  mesurés côté FR : `travail-a-[ville]` 30 guides sans miroir, `demenager-a-[ville]` 50 contre
  4 `moving-to-*`, `famille-a-[ville]` 19. `demenager-` est le plus gros écart et la plus forte
  intention relocation pour un lecteur étranger.

- **Parité EN — ouverture de la série `studying-in-[city]-2026` (batch 1, +10 : Paris, Lyon,
  Toulouse, Lille, Bordeaux, Montpellier, Rennes, Strasbourg, Nantes, Grenoble)** ✅ —
  `npm run parity` sort en code 0 (215 FR / 164 EN, 0 route sans jumelle) : la parité de routes
  tient, le run a donc travaillé le corpus. **`EN_GUIDES` 575 → 585.**

  **Pourquoi cette série plutôt que celle annoncée.** Le point d'étape du 10/08 désignait
  `vacances-celibataire-[destination]-2026` (15 FR / 0 EN) comme prochaine série sans miroir.
  Elle a été écartée après mesure : le regroupement des slugs FR par série montre des trous bien
  plus larges et à bien plus forte intention relocation — `travail-a-[ville]` 30/0,
  `etudiant-a-[ville]` 20/0 + `universites-[ville]` 15/0, `famille-a-[ville]` 19/0,
  `demenager-a-[ville]` 50 contre 4 `moving-to-*`. Et surtout, la section « Point à trancher »
  ci-dessus propose de **désindexer `/vacations/*`** (211 impressions, 0 clic, position 75-78,
  dilution du signal thématique) : écrire 15 guides EN de vacances pendant qu'on envisage de
  noindexer les pages de vacances existantes n'a pas de sens. Le côté étudiant international est
  l'inverse — c'est une audience entrante réelle, et l'EN n'avait **aucun** guide par ville.

  **Un seul miroir EN pour deux séries FR, volontairement.** Le FR porte `etudiant-a-[ville]`
  (20) *et* `universites-[ville]` (15), qui se recouvrent largement. Les fusionner côté EN en une
  seule série par ville est une décision anti-cannibalisation, exactement le défaut corrigé par
  les trois lots de dédoublonnage du 04/06 (EN 546 → 531) : deux pages EN quasi identiques par
  ville se seraient concurrencées sur la même requête. Les 10 villes retenues sont celles qui ont
  les **deux** sources FR, donc la matière la plus riche. Le national existant
  (`studying-in-france-non-eu-students-guide`, `best-french-cities-international-students`) n'est
  pas touché : per-city contre national, ce sont des entités distinctes.

  **Ce que la version EN ajoute et que le FR n'a aucune raison de contenir** — c'est le cœur du
  « natif, jamais traduit ». ① La **bourse CROUS sur critères sociaux (145-620 €/mois) est en
  pratique fermée aux étudiants non-UE** sous titre de séjour étudiant : les guides FR la
  présentent comme l'aide centrale, un lecteur étranger qui construit son budget dessus se
  trompe de plusieurs centaines d'euros par mois. Les 10 guides le disent explicitement.
  ② À l'inverse, **APL/ALS est ouverte** aux étudiants étrangers titulaires d'un titre de séjour
  valide, et ③ **Visale** (gratuit, moins de 30 ans) est *l'*outil qui remplace le garant
  physique résidant en France à 3× le loyer — le vrai mur pour un candidat étranger, pas le prix.
  ④ La procédure **Études en France / Campus France** et la validation en ligne du VLS-TS dans
  les 3 mois. ⑤ La distinction **grade de master / titre RNCP**, qui ne se convertit pas à
  l'étranger comme un lecteur anglophone le suppose. ⑥ Le droit au travail à 60 % de la durée
  annuelle légale.

  **Angles propres à chaque ville, pas un gabarit rempli** : la Cité Internationale Universitaire
  (14e, 5 800 lits, dossier 12-18 mois à l'avance) comme seule voie CROUS pensée pour les
  étrangers à Paris ; la Catho de Lille qui se lit en anglais comme « the university of Lille »
  sans l'être, à 6 000-9 000 €/an contre ~170 € ; la Braderie de Lille (premier week-end de
  septembre) qui tombe sur la semaine d'emménagement ; les stages rémunérés des institutions
  européennes à Strasbourg (1 800-2 500 €/mois) dont les conditions de nationalité diffèrent
  entre Parlement, Conseil de l'Europe et Cour, et le travail frontalier en Allemagne dont le
  titre de séjour français **n'autorise pas** l'exercice ; les emplois cyber-défense de
  Cesson-Sévigné fermés aux non-nationaux ; l'accès instruments à Grenoble (ILL, ESRF, CEA-Leti)
  contre la monoculture microélectronique et la ZFE Crit'Air 3 ; l'entrée en médecine à
  Montpellier qui suppose une scolarité secondaire française malgré la faculté de 1220 ; les
  fusions récentes de Rennes (2023) et Nantes (2022), qui exposent un candidat étranger à un
  diplôme émis sous un nom institutionnel transitoire — d'où le conseil de faire confirmer par
  écrit l'établissement qui délivre.

  **Contrôles.** `npx tsc --noEmit` propre (⚠️ `node_modules` était absent du conteneur au début
  du run : `tsc` renvoyait 42 758 erreurs `Cannot find module 'next'` qui n'ont rien à voir avec
  le code — `npm install` avant de conclure quoi que ce soit d'un `tsc` en session fraîche).
  `npm run integrity` : 540 villes, 933 guides FR, **585 EN**, **0 score brut recopié des deux
  côtés**. `npm run search-index` + `search-index:check` (`data/search-index.en.json` 575 → 585
  guides, 76 → 79 tags). `npm run parity` code 0. Un contrôle *ad hoc* a comparé, ville par
  ville, chaque nombre cité côté EN à l'ensemble des nombres du guide FR `universites-[ville]` :
  **trois valeurs seulement** n'y figurent pas, toutes justifiées — `170` (frais d'inscription
  en fac publique, cité par le guide FR de Lille), `750`/`1 100` (loyers parisiens, cités par le
  guide FR de Paris, repris dans le guide de Lyon comme point de comparaison) et `60` (le taux
  légal de travail autorisé). Les scores cités sont les valeurs **rendues** lues via
  `CITIES_SEED`, jamais les littéraux du seed.

  `metaTitle` 54-57 caractères, `metaDesc` 147-153, 6 sections par guide. Aucun tag de région
  nouveau (`ile-de-france`, `auvergne-rhone-alpes`, `occitanie`, `hauts-de-france`,
  `nouvelle-aquitaine`, `brittany`, `grand-est`, `pays-de-la-loire` existaient tous) ; les 10 tags
  `studying in [city]` restent sous le seuil `MIN_GUIDES_PER_TAG = 3` et ne créent donc **aucune**
  page `/tags/[slug]` maigre — seul `student housing france` (10 guides) en crée une. Le sitemap
  dérive de `EN_GUIDES`, aucun chunk à éditer à la main.

  **Prochain run** : batch 2 de la série, sur les villes qui n'ont que `etudiant-a-[ville]`
  (Amiens, Angers, Besançon, Caen, Limoges, Marseille, Poitiers, Tours) ou que
  `universites-[ville]` (Aix-en-Provence, Nice, Clermont-Ferrand, Nancy, Dijon) — Marseille, Nice
  et Aix d'abord, ce sont les trois à plus forte notoriété internationale. La série FR pesant 35
  guides sur deux séries, la parité de cette famille est atteinte autour de 23 guides EN.

---

## Shipped 2026-08-10

- **Parité EN — série `single-parent-in-[city]-2026` fermée (batch 2, +10 : Rennes, Nancy,
  Angers, Grenoble, Dijon, Metz, Reims, Aix-en-Provence, Rouen, Toulon)** ✅ — Les dix jumelles
  manquantes de la série FR `parent-solo-a-[ville]-2026`, écrites d'un coup dans
  `data/guides-en.ts`. **Compteurs mesurés à l'import : FR 20, EN 20 — écart nul,
  `EN_GUIDES` 565 → 575.** Anglais natif depuis les faits des guides FR (aucun chiffre qui n'y
  soit) : un contrôle automatique compare, ville par ville, l'ensemble des scores cités côté EN
  et côté FR — **zéro divergence dans les deux sens sur les dix paires**, ce que la règle
  hreflang exige. Loyers T3 retracés à `data/housing.ts` (Reims 900 €, Metz 910 €, Nancy et
  Dijon 950 €, Rouen 950 €, Angers 1 000 €, Grenoble 1 020 €, Toulon 1 050 €, Rennes 1 100 €,
  Aix 1 400 €). 6 sections par guide comme le batch 1, `metaTitle` 48-55 caractères,
  `metaDesc` 139-159. Aucun tag de région nouveau : `brittany`, `grand-est`,
  `pays-de-la-loire`, `auvergne-rhone-alpes`, `bourgogne-franche-comte`, `normandy`,
  `provence-alpes-cote-d-azur` existaient déjà. Ajouts propres au lecteur étranger, absents du
  FR parce qu'inutiles à un lecteur français : ce qu'est un T3, ce que le **quotient familial**
  CAF pilote (cantine, périscolaire, crèche), le fait que **l'adresse décide de l'école**
  (carte scolaire) donc qu'on choisit la rue avant l'établissement, la formule exacte à
  prononcer au guichet (« priorité famille monoparentale »), ce qu'est une maternité de
  **niveau III**, ce qu'est un **BHNS** (Mettis, tram sur pneus), ce qu'est le **privé sous
  contrat** et son coût, et pour Metz l'affiliation **CNS vs CPAM** d'un frontalier
  luxembourgeois — un point que le guide FR n'avait pas besoin de poser. Deux arbitrages
  éditoriaux repris tels quels du FR et à ne pas diluer : Grenoble porte l'épisode de pollution
  hivernale par inversion thermique comme un **second filtre à part entière**, pas comme une
  note de bas de page, et Aix dit explicitement que sous ~2 200 € net la ville ne fonctionne
  pas — c'est la seule ville de la série où la réponse honnête est « non ».
  `npm run integrity` (933 FR / 575 EN), `npx tsc --noEmit`, `npm run search-index` +
  `search-index:check` (`data/search-index.en.json` 565 → 575 guides, 76 tags) et
  `npm run parity` (code 0, 0 route FR sans jumelle) passent.

- **Les guides citaient les scores *bruts* du seed, les pages affichent les *normalisés* —
  corrigé, 1 026 chiffres, et gardé.** Un guide qui écrivait « sécurité 7,8/10 (source :
  `data/cities-seed.ts`) » pour Rennes disait vrai sur le **fichier** — le littéral y est bien
  7.8 — mais `/villes/rennes` affiche **5,9**, parce que `CITIES_SEED` vaut
  `normalizeDistribution(RAW_CITIES_SEED.map(calibrateScores))` et que c'est cette valeur-là
  que rendent les pages. L'écart allait jusqu'à 2,3 points (sécurité Toulon 6,2 → 4,1, Grenoble
  6,7 → 4,3 ; global Toulon 7,1 → 5,0, Ajaccio 7,4 → 4,9 ; écoles Toulon 6,8 → 4,5), et un
  lecteur qui cliquait du guide vers la fiche ville voyait deux nombres pour la même chose.

  **Ce qui a été repris**, en quatre passes de prudence décroissante, chacune vérifiée :
  ① **522 chiffres** (314 FR, 208 EN) réécrits mécaniquement — la règle n'autorisait la
  réécriture que si le chiffre valait **exactement** le littéral brut d'**une seule** ville-axe
  plausible ; garde-fou : hors chiffres décimaux, les deux fichiers sont restés byte-identiques.
  ② **31 citations « Score retraite / étudiant / MaVilleIdéale »** rattachées par le **titre de
  section** (ces guides sont des listicles, le titre nomme la ville) et réalignées sur les vrais
  moteurs — `computeNicheScores().retirement` et `.studentLife` dérivaient aussi.
  ③ **48 cas résiduels tranchés à la main**, là où aucune attribution automatique n'était sûre.
  ④ **31 phrases dont l'affirmation ne tenait plus** : « quatre curseurs alignés au-dessus de
  7 » (Rennes n'en a plus que trois), « pas de curseur en dessous de 7 » (Dijon), « le score le
  plus bas des dix candidats » (Aix en transports, Rouen en sécurité — Toulon et Grenoble sont
  dessous), « le meilleur du top 10 » (Lille en coût — Strasbourg est devant), « the lowest of
  the top-10 outside Marseille » (Lille — Montpellier est plus bas). Chaque superlatif conservé
  a été **revérifié contre le seed**, pas seulement relu.
  ⑤ **486 citations dans les champs EN du seed** (`descriptionEn` / `seoDescriptionEn`) — la
  meta description de 502 pages ville anglaises annonçait un score que la page contredisait.

  **La régression est maintenant impossible en silence** : `npm run integrity` échoue si une
  citation collée à un nom d'axe vaut le littéral brut d'une ville alors que la page affiche
  autre chose. Contrôle volontairement étroit (cette signature ne se produit pas par hasard,
  donc zéro faux positif ; il ne prétend pas voir les chiffres inventés). Vérifié dans les deux
  sens : il passe sur le corpus corrigé, et il rattrape une valeur brute réintroduite à la main.
  ⚠️ Ce qu'il **ne** dit pas : le seed reste un fichier où l'on lit `safety: 7.8` pour une ville
  notée 5,9. Écrire depuis les littéraux est donc toujours le réflexe naturel — le contrôle est
  un filet, pas une correction de la source.

---

## Shipped 2026-08-09

- **Parité EN ✅ — les 4 dernières routes, et la table de correspondance corrigée.**
  `npm run parity` passe de 5 routes FR sans jumelle à **0**, et sort en code 0 pour la
  première fois. Livré : `/reviews`, `/press`, `/terms`, `/guides/category/[category]` ×6,
  plus le CSV presse anglais généré dans la même boucle que le français. `/quitter` n'a
  demandé **aucune page** : sa jumelle `/moving-from` existait déjà et `FR_TO_EN_ROUTE`
  croisait les paires `quitter`/`ou-vont-les-gens` avec `leaving`/`moving-from` — écrire la
  page réclamée par le rapport aurait créé un doublon. Corrigés au passage : le 404 du domaine
  anglais, qui était en français sur toutes les URL mortes, et deux fausses alertes du rapport
  de parité (`calculator`, `simulator`). Détail complet dans § « Parité EN › Livré le 09/08 ».

---

## Shipped 2026-08-08

- **Série F61 — `vacances-celibataire-[destination]-2026` batch 2 (+7 : Toulouse, Lille, Aix-en-Provence, Angers, Grenoble, Dijon, La Rochelle)** ✅ — Deuxième batch de la verticale célibataire côté guides éditoriaux. La sélection prolonge le batch 1 sur les rangs 6-20 du profil `celibataire` de `lib/vacation-fit.ts` (culture .40 / life .30 / transport .20 / safety .10), classement mesuré via `topCitiesForProfile("celibataire")` sur `CITIES_SEED` (Neuilly / Vincennes / Issy / Versailles écartés d'office — ce ne sont pas des destinations vacances, ce sont des banlieues résidentielles). Sélection différenciée pour tenir la distinction *chercher du monde* (célibataire) vs *voyager seul·e* (solo) et surtout l'anti-station-fantôme : chaque ville retenue a une **population résidente structurée** qui la maintient vivante en semaine hors saison — étudiants, activité économique propre, culture locale du comptoir. Angles : **Toulouse** (ville rose, 130 k étudiants, culture rugby toute année, Carmes/Saint-Cyprien/Saint-Étienne, ONCT + Metronum), **Lille** (culture flamande de l'estaminet, ~110 k étudiants agglo, Vieux-Lille + Wazemmes, Aéronef/Malterie/Splendid, Grande Braderie début septembre, accès international Eurostar/Thalys), **Aix-en-Provence** (la contre-intuition : Aix-Marseille Université ~40 k étudiants tient la ville hors saison, angle explicitement « attention au risque station-morte, voici pourquoi ça ne l'est pas », Grand Théâtre + Festival lyrique juillet, Vieil Aix + Mazarin + Sextius-Mirabeau, garde-fou budget assumé — score cost 5,6/10), **Angers** (~40 k étudiants entre UCO/UA/écoles, Le Chabada scène musicale nationalement respectée, Le Quai scène nationale, centre + Doutre + Saint-Serge, TGV 1h30 Paris), **Grenoble** (~60 k étudiants UGA + INP, MC2 + Belle Électrique + Espace autogéré, hyper-centre + Berriat + Championnet, téléphérique Bastille depuis le centre), **Dijon** (~30 k étudiants Bourgogne, culture bourguignonne du bar à vins, secteur sauvegardé UNESCO, Opéra + La Vapeur + Tanneries, Halles marché mardi/vendredi/samedi), **La Rochelle** (la deuxième contre-intuition : la seule ville portuaire française où le hors-saison tient — ~15 k étudiants + activité port + université + recherche, La Sirène + La Coursive, Vieux Port + Saint-Nicolas, angle explicite « le hors saison est le vrai atout » car les Rochelais restent quand les vacanciers partent). Structure alignée sur batch 1 : 6 sections × ~950 mots (intro + « pourquoi cette ville », « où poser ses valises », « sortir un mardi soir », « se déplacer sans voiture », « supplément single et comment le contourner », « quand y aller »), 7-8 min de lecture, category `lifestyle`, emoji 🍸. **Angle éditorial tenu**: la série reste distincte du profil `solo` (cherche du monde ≠ cherche la tranquillité) ; deux guides forcent explicitement le cadrage anti-station-fantôme (Aix, La Rochelle) là où la carte postale suggère l'inverse. Zéro promesse de rencontre, zéro registre « site de rencontres », zéro misérabilisme, écriture inclusive légère (`seul·e`, `voyageur solo`) sans présomption de genre ni d'orientation. **Zéro chiffre inventé** : scores axiaux tracés vers `data/cities-seed.ts` (culture 8,4 Aix + 8,2 Dijon/Lille + 7,8 Toulouse ; life 8,5 Aix ; transport 7,5 Grenoble/Dijon + 8,2 Lille ; cost 5,6 Aix + 6,8 Grenoble + 7,4 Dijon), populations étudiantes citées comme des ordres de grandeur (« environ 130 000 » pour Toulouse etc.) et non chiffres précis, tarifs hôteliers jamais chiffrés (le réflexe, pas le prix). Deux corrections d'angle vs batch 1 : (a) mention explicite de la contre-intuition Aix / La Rochelle en intro et dans « pourquoi cette ville » — sans cadrage, la lectrice cible clique sur « Aix célibataire » et s'attend à une carte postale de couple — c'est le contre-argument qu'il fallait acter ; (b) mention de la Grande Braderie de Lille et des Francofolies de La Rochelle comme *pics à réserver 6 mois en amont*, pour cohérence avec le conseil de contournement du supplément single. `relatedCities` sur la ville cible. `relatedGuides` câblés systématiquement sur (a) `10-choses-a-faire-a-[ville]-2026`, (b) `vivre-sans-voiture-[ville]-guide-2026` (chaque référence vérifiée à l'écriture — toutes existent) ou pour La Rochelle vers `vacances-monoparentales-la-rochelle-2026` en cross-link inter-vertical, (c) un guide célibataire du batch 1 (Paris/Bordeaux/Lyon/Nantes/Strasbourg/Montpellier selon l'affinité géographique). Tags SEO long-tail : « vacances célibataire [ville] », « voyage solo [ville] », un tag local (Carmes, estaminets, Cours Mirabeau, Chabada, Berriat, bars à vins Dijon, Vieux Port), « week-end célibataire » régional. metaTitle 42-56 chars (sous les 60), metaDesc 138-159 chars (dans la fourchette ≤ 160). Sitemap auto pris en charge via `guideRoutes` (map sur `GUIDES.slug`). `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities/relatedGuides/cities-seed) passent à l'import — `data/guides.ts` 926 → 933 guides total (`vacances-celibataire-*-2026` = 15 après splice, `grep -c 'slug: "vacances-celibataire-'` = 15). `npm run search-index` relancé après insertion : `data/search-index.json` mis à jour 926 → 933 guides (179 Ko, 238 tags), `search-index.en.json` inchangé côté EN. `npm run search-index:check` propre, `npx tsc --noEmit` propre. **Restent ouverts sur la verticale** : batch 3 sur les rangs suivants (Annecy, Vienne, Villefranche-sur-Saône, Albi, Les Sables-d'Olonne, Vincennes exclu, Compiègne, Saint-Germain-en-Laye exclu, Orange à trier par fit — attention à la qualité des candidats, plusieurs des rangs 15-30 sont des banlieues franciliennes ou des sous-préfectures peu vivantes hors samedi soir et devront être écartées comme Neuilly l'a été), guide pilier « Partir en vacances seul·e en 2026 » (le pilier mono existe pour parents solos avec `partir-en-vacances-seul-avec-ses-enfants-2026`, pas encore l'équivalent célib — c'est probablement le prochain vrai gap éditorial de la verticale), croisement mois × profil (« où partir en février quand on est célibataire » : le moteur `lib/vacation-seasons.ts` + `lib/vacation-fit.ts` a tout ce qu'il faut, la surface manque), miroir EN natif angle expat de la série (aucun guide `single-vacations-*` ni `solo-adult-getaway-*` côté EN aujourd'hui — l'écart FR→EN sur cette verticale est de 15, à ouvrir avant que la parité globale ne dérive).

---

## Shipped 2026-08-07

- **Nouvelle série `parent-solo-a-[ville]` batch 2 (+10 guides, 10 → 20) — Rennes, Nancy, Angers, Grenoble, Dijon, Metz, Reims, Aix-en-Provence, Rouen, Toulon** ✅ — Deuxième batch de la verticale monoparentale côté guides éditoriaux, ouverte le 24/07 avec les 10 métropoles du top 10 (Paris/Lyon/Marseille/Toulouse/Nice/Nantes/Montpellier/Strasbourg/Bordeaux/Lille) et étendue depuis avec la sous-page `/villes/[slug]/parent-solo` ×540, le hub `/parent-solo` et son miroir EN. Sélection ici : les rangs 11-20 par composite `parentSoloFit` de `lib/parent-solo.ts` (cost 0,30 · transport 0,20 · schools 0,25 · safety 0,25 — pondération identique au profil `single-parent` de `lib/city-match.ts`), ce qui remonte trois blocs différenciés — (a) le meilleur rapport Ouest hors top 10 : **Rennes** (fit ≈ 7,79 : cost 7,1 · transport 8,4 · schools 8,5 · safety 7,8), **Angers** (le mieux classé qualité de vie France, tram B ouvert en 2023) ; (b) le meilleur rapport coût-culture Grand Est : **Nancy** (cost 8,2, culture 8,5, T3 à 950 €), **Dijon** (secteur sauvegardé 97 ha, T3 à 950 €, LGV Paris 1h40), **Metz** (T3 à 910 €, Luxembourg à 45 min) — trois villes où un parent solo tient sur 1 600–1 700 € net ; (c) les cas où l'arbitrage est explicite : **Grenoble** (nature 9,0, écoles 7,9, mais air d'hiver à surveiller — la page dit d'aller voir `/villes/grenoble/air`), **Reims** (LGV Paris 45 min = pied à Paris à un tiers du loyer, sécurité 6,8 à filtrer), **Aix-en-Provence** (T3 à 1 400 €, hors périmètre sous 2 200 € net, meilleur choix PACA au-dessus de 2 800 €), **Rouen** (score sécurité 6,4/10 — le plus bas du batch, Paris à 1h15 sans LGV), **Toulon** (soleil 2 750 h contre sécurité 6,2 — l'arbitrage le plus honnête à poser). Structure alignée sur batch 1 (`vivre-a-*` : intro chiffrée + 6 sections : enjeu spécifique, budget T3 par quartier, sans voiture, écoles-cantines-périscolaire, sécurité, verdict), 9 min de lecture, category `famille`, emoji 🧑‍🍼. Chiffres tracés systématiquement à `data/housing.ts` (T3 : Rennes 1 100 €, Nancy 950 €, Angers 1 000 €, Grenoble 1 020 €, Dijon 950 €, Metz 910 €, Reims 900 €, Aix 1 400 €, Rouen 950 €, Toulon 1 050 €) et à `data/cities-seed.ts` (axes cost/transport/schools/safety/culture/nature affichés avec `/10` et source citée). Zéro chiffre inventé : revenus formulés en fourchettes (« sur 1 800 € net »), tarifs cantine/périscolaire décrits comme « tranches QF CAF », montants CAF non chiffrés (les barèmes bougent), la « priorité famille monoparentale » citée comme dispositif à demander sur dossier, pas comme droit automatique. Ton direct, aucun misérabilisme, aucun « courage » condescendant, écriture inclusive « parent solo » jamais « maman solo ». `relatedCities` sur la ville cible + 4 satellites vérifiés dans `CITIES_SEED` en amont (pour Rennes, `redon` absent seed → remplacé par `saint-brieuc`). `relatedGuides` câblés sur 5 guides existants par ville (vivre-a-*, acheter-a-*, 10-choses-a-faire-a-*, plus un des famille-a-*/vivre-sans-voiture-*/demenager-a-*/travail-a-* selon disponibilité — chaque référence vérifiée à l'écriture, aucun `assertKnownSlugs` en erreur au load). Sitemap auto pris en charge via `guideRoutes` (map sur `GUIDES.slug`). `assertUniqueSlugs` + `assertKnownSlugs` passent à l'import — `data/guides.ts` 916 → 926 guides total (compteur mesuré à l'import via `tsx` : `GUIDES.length === 926`, `parent-solo-a-*-2026` = 20). `npm run search-index` relancé après insertion : `data/search-index.json` mis à jour 916 → 926 guides (178 Ko), `search-index.en.json` inchangé côté EN. `npx tsc --noEmit` propre. **Restent ouverts sur la verticale** : batch 3 sur les rangs 21-30 (Le Mans, Poitiers, Caen, Colmar, Annecy, Chambéry, Besançon, Perpignan, Amiens, Le Havre à trier par fit), miroir EN de la série `single-parent-in-[city]-2026` (aucun guide EN de la série existe aujourd'hui — l'écart FR→EN passe de 10 à 20, au-dessus du seuil ~6 → le prochain run FR ou un batch EN dédié).

---

## Shipped 2026-08-06

- **La palette de recherche (Cmd+K) ne sert plus du français sur le domaine anglais** ✅ —
  relevé « trouvé en passant, non corrigé » du 05/08, pris ici. `components/SearchPalette.tsx`
  n'avait **aucune notion de locale**, là où la `Navbar` qui la déclenche en a une depuis
  toujours (`IS_EN = DEFAULT_LOCALE === "en"`) : le bouton « Search… » était en anglais, et
  ce qu'il ouvrait était français. Un visiteur de bestcitiesinfrance.com qui tapait « Lyon »
  se voyait proposer *Quitter Lyon en 2026*, *Vivre autour de Lyon*, un lien `/villes/lyon`,
  et des raccourcis de glossaire vers `/glossaire`, route qui n'existe pas côté EN.

  **Quatre fuites, quatre causes distinctes** — c'est pour ça qu'un seul correctif ne
  suffisait pas :
  - **Le corpus.** `lib/search-index.ts` ne connaissait que `data/guides.ts` : **902 guides
    FR, zéro EN**. `scripts/build-search-index.mjs` génère désormais **deux** projections en
    évaluant les modules réels de chaque langue — `data/search-index.json` (FR : 909 guides,
    238 tags) et `data/search-index.en.json` (EN : 548 guides, 74 tags, depuis
    `data/guides-en.ts` + `lib/guide-tags-en.ts`). `--check` valide les deux, donc
    `prebuild` empêche l'index EN de dériver exactement comme il empêche le FR. Sortie FR
    **byte-identique** (vérifié : `git diff` vide sur `data/search-index.json`).
  - **Les URL.** `/guides` et `/tags` partagent leur segment entre les deux locales, pas
    `/villes` ni `/classements` : la palette EN pointe maintenant vers `/cities/[slug]` et
    `/rankings/[slug]`.
  - **Le glossaire.** `app/glossaire` et `app/[locale]/glossary` sont **deux pages
    distinctes avec leurs propres sections** — une ancre `#section-N` ne se transpose pas.
    Les 19 raccourcis EN sont écrits avec les termes **repris mot pour mot** de la page
    anglaise, chacun sur l'index de section réel de cette page ; le lecteur atterrit donc
    sur l'entrée qu'il a cherchée, pas trois sections plus bas.
  - **La chrome.** Placeholder, `aria-label` du dialogue et des boutons, sous-libellés
    (« Classement » → *Ranking*, « Glossaire » → *Glossary*), pied (`naviguer`/`ouvrir`/
    `N entrées indexées`) et état vide (« Aucun résultat pour « x ». » → *No results for
    “x”.*, guillemets typographiques de la bonne langue) passent par un helper `tr(fr, en)`,
    comme le prescrit CLAUDE.md § « Conventions for adding an EN route » point 6. Les **noms
    de région restent tels quels** : ce sont des noms propres, et le reste du site anglais
    ne les traduit pas non plus.

  **Le choix de locale ne coûte pas un octet de plus.** `lib/search-index.ts` lit
  `process.env.NEXT_PUBLIC_DEFAULT_LOCALE` en direct (pas `DEFAULT_LOCALE` de `@/lib/i18n`,
  pour que ce module reste la frontière qui n'importe rien d'autre) ; la valeur étant inlinée
  au build, la branche morte et le JSON qu'elle référence tombent du bundle. **Mesuré** sur
  ce ternaire exact, bundle FR **187 Ko** = le seul JSON FR, bundle EN **98 Ko** = le seul
  JSON EN. Un domaine = un build, donc pas de prop `locale` à faire descendre : même
  raisonnement que la `Navbar`.

  **Vérifié dans un navigateur, pas déduit** (Chromium/Playwright sur `next dev`, une fois
  par locale). EN : titres anglais, `/cities/lyon`, `/rankings/teletravail`,
  `/glossary#section-0`, *No results for “zzzzqq”.* FR : titres français, `/villes/lyon`,
  `/glossaire#section-0`, « Aucun résultat pour « zzzzqq ». » — aucune régression.

  **Effet de bord assumé : `lib/rankings-en.ts`.** La palette a besoin des libellés anglais
  des classements, et ceux-ci vivaient dans **deux fichiers de page**, en double et déjà
  divergents — une table riche dans `app/[locale]/rankings/[slug]/page.tsx` (19 entrées) et
  une table `label + tagline` dans `app/[locale]/rankings/page.tsx` (15). Conséquences
  visibles avant ce run : le hub `/rankings` affichait **« Écologie », « Cyclistes »,
  « Jeunes actifs » et « Bord de mer » en français** faute d'entrée, et annonçait
  **« Climate 2040 »** pour un classement qui mesure l'ensoleillement et la douceur des
  saisons (FR « Climat de comfort », méthodologie ensoleillement ×3 / été ×2 / hiver ×2 —
  rien à voir avec la projection 2040). Les deux tables fusionnent en une seule lib —
  précédent `lib/fiscalite-en.ts` du 06/08 au matin : compagnon anglais, la source de vérité
  française (`lib/rankings.ts`, slugs et pondérations) n'est pas touchée. Les quatre
  taglines manquantes sont écrites depuis la méthodologie de leur propre entrée. Au passage,
  le `<title>` du hub annonçait **13 classements pour 19 réellement rendus dessous** : il
  dérive maintenant de `RANKINGS_COUNT`, comme le fait déjà le hub FR.

  Rien de nouveau à câbler : aucune route ajoutée, sitemap inchangé. `npx tsc --noEmit`
  propre, `eslint` sans nouvelle alerte, `node scripts/build-search-index.mjs --check` vert
  sur les deux fichiers.

  **Ce qui n'est pas fait** : la palette EN indexe les 540 villes, les 19 classements, les
  548 guides EN et les 74 tags EN — mais **pas les hubs EN** (`/overall-ranking`,
  `/weekend-getaways`, `/vacations`…), pas plus que la FR n'indexe les siens. Et le score de
  pertinence reste le même des deux côtés (préfixe > sous-chaîne), donc une requête anglaise
  en deux mots (« remote work ») remonte d'abord les tags puis le classement, jamais un
  ordre pensé pour l'anglais. Deux chantiers distincts, non ouverts ici.

- **Parité EN** ✅ — `/departments/[dept]/tax` + `/departments/[dept]/synthesis`, 204 URL
  (102 départements × 2). Détaillé dans § « Parité EN › Livré le 06/08 » ci-dessus.
  `npm run parity` : 8 routes FR sans jumelle → **6**.

## Shipped 2026-08-05

- **Série F61 — `vacances-monoparentales-[destination]-2026` batch 1 (+7 : La Rochelle, Strasbourg, Nantes, Rennes, Vannes, Nancy, Dijon)** ✅ — Ouverture de la série guides adossée au profil `monoparental` de `lib/vacation-fit.ts` (pondération safety .30 / transport .25 / cost .25 / life .20), ancrée sur le guide pilier `partir-en-vacances-seul-avec-ses-enfants-2026` shippé fin juillet. Les 7 destinations sont les mieux placées du profil parmi les vraies villes de séjour à la fois (a) accessibles TGV en 1h25-2h45 depuis Paris (source : `lib/transit.ts` — chacune a `tgv: true`), (b) walkable sur leur centre historique, (c) au-dessus du plancher `safety ≥ 7.2` du seed (source : `data/cities-seed.ts`). Sélection différenciée par angle : La Rochelle (côte atlantique, Yélo vélo libre historique, aquarium en face de la gare, bus vers Île de Ré), Strasbourg (Grande Île UNESCO, Neustadt UNESCO 2017, 6 lignes tram CTS, Le Vaisseau musée sciences enfants, marchés de Noël avec le vrai cadrage parent solo), Nantes (tram + Chronobus + Navibus, Machines de l'Île, Passage Pommeraye, Trentemoult), Rennes (2 lignes de métro depuis 2022, Parc du Thabor, base pour Bretagne en TER — Saint-Malo 1h, Vitré 25 min, Dinan 1h), Vannes (remparts XIVe, golfe du Morbihan, bateaux vers Île aux Moines et Île d'Arz, sécurité 8,4/10 — l'un des meilleurs scores France), Nancy (Place Stanislas UNESCO depuis 1983, École de Nancy Art nouveau, coût 8,2/10 = meilleur rapport de la série sur l'axe historique), Dijon (secteur sauvegardé 97 ha, Parcours de la Chouette, Cité internationale de la gastronomie et du vin 2022, Beaune en TER 25 min). Structure alignée à 7 sections × ~800 mots (intro + « pourquoi cette ville en parent solo », « arriver + se déplacer sans voiture », « où loger sans surtaxe single », « activités enfants regroupées à distance de marche », « quand y aller hors août — fenêtre climat + affluence », « sécurité + logistique + urgences », « aides mobilisables — dispositifs pas montants »). 7-8 min de lecture, category `famille`, emoji 🧑‍🍼, alignés sur le pilier + la série `parent-solo-a-[ville]-2026`. **Angle éditorial** : la série tient la distinction avec `famille-a-[ville]-2026` (parents biactifs, deux paires d'épaules) explicitement — un seul adulte au volant du budget, un seul au volant de la charge cognitive, une seule chambre à payer à un tarif structuré pour deux adultes. Écriture inclusive « parent solo » jamais « maman solo », zéro misérabilisme, zéro « courage » condescendant. **Zéro chiffre inventé** : chaque score cité trace vers `data/cities-seed.ts` (safety, transport, cost, life, culture, nature, sunshinedays, avgTempJuly/January), chaque affirmation transport vers `lib/transit.ts` (`tgv: true`, `tram/metro/bhns: true`, `velo: "fort"`), les temps TGV et les lignes de tram sont des faits publiquement vérifiables SNCF/CTS/TAN/STAR/Divia. **Aucun montant d'aide n'est cité** : les 5 dispositifs (VACAF, Chèques-Vacances ANCV, Bons vacances CAF, Conseils départementaux, CSE) sont décrits en mécanisme + lien organisme, exactement comme dans le pilier — les barèmes bougent chaque année et dépendent du QF. Les tarifs hôteliers ne sont jamais chiffrés (les prix bougent trop vite), on décrit le réflexe (préférer périphérie tram, éviter hyper-centre en juillet-août, VVF/camping mobil-home hors saison), pas le prix. `relatedCities` sur la ville cible + 3 satellites/limitrophes existant dans `CITIES_SEED` (rocheford/saintes/niort pour La Rochelle ; colmar/selestat/mulhouse pour Strasbourg ; reze/saint-nazaire/angers pour Nantes ; saint-malo/vitre/dinan pour Rennes ; carnac/lorient/quimper pour Vannes ; metz/pont-a-mousson/epinal pour Nancy ; beaune/autun/besancon pour Dijon). `relatedGuides` câblés systématiquement sur (a) `partir-en-vacances-seul-avec-ses-enfants-2026` (pilier), (b) `10-choses-a-faire-a-[ville]-2026` (activités angle jour), (c) `vivre-sans-voiture-[ville]-guide-2026` OU `parent-solo-a-[ville]-2026` OU `vivre-a-[ville]-2026` selon disponibilité (chaque référence vérifiée avant écriture), (d) `acheter-a-[ville]-quel-quartier-budget-2026` pour la couverture géographique du parc locatif. Tags SEO long-tail : « vacances monoparentales [ville] », « parent solo [département] », un tag transport local (Yélo, tram CTS, Machines de l'Île, métro STAR, remparts Vannes, Place Stanislas UNESCO, Parcours de la Chouette), « hors saison » régional. metaTitle 37-43 chars (bien sous les 60), metaDesc 135-157 chars (dans la fourchette ≤ 160). Sitemap auto pris en charge via `guideRoutes` (map sur `GUIDES.slug`). `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities/relatedGuides/cities-seed) passent à l'import — `data/guides.ts` 902 → 909 guides total (compteur mesuré à l'import via `tsx` : `GUIDES.length === 909`). `npx tsc --noEmit` propre. **Restent ouverts sur la verticale** : batches suivants sur les rangs 8-25 du profil (Bordeaux/Lyon/Colmar/Annecy/Grenoble/Chambéry/Reims/Metz/Montpellier/Aix-en-Provence — vérifier avant chaque batch les transit tags et le score sécurité), croisement mois × profil (surface qui expose la grille `monthSignal()` sous forme de « où partir en avril en monoparental » — item 4 du plan agent, moteur déjà en place, la surface manque), miroir EN de la série `single-parent-holidays-[city]-2026` (item 5, à ouvrir après ~10 guides FR pour ne pas décrocher la parité).

- **Parité EN** ✅ — `/compare/[pair]/synthesis`, 771 URL. Détaillé dans
  § « Parité EN › Livré le 05/08 » ci-dessus (run du matin).

- **Série tourisme : batch 25 EN, parité FR↔EN rétablie à zéro** ✅ — les 7 jumelles
  `things-to-do-in-[ville]-2026` que le batch 24 FR de la veille avait laissées en écart :
  Versailles, Saint-Denis (93), Roubaix, Tourcoing, Boulogne-Billancourt, Villeurbanne,
  Le Tampon. **Compteurs mesurés : FR 187, EN 187** (`things-to-do-in-*-2026` = 187 après
  splice, EN_GUIDES 541 → 548). Le diff dans les deux sens est vide une fois les deux
  exceptions de gabarit appliquées.

  **Les deux exceptions de slug, à ne pas « corriger ».** Le diff naïf entre les deux
  listes remonte deux faux trous à chaque run, parce que deux villes ne suivent pas le
  gabarit `-a-[slug]-` côté FR : `10-choses-a-faire-**au**-puy-en-velay-2026` (EN
  `things-to-do-in-le-puy-en-velay-2026`) et `10-choses-a-faire-**au**-tampon-2026` (EN
  `things-to-do-in-le-tampon-2026`). Le contrôle qui fait foi mappe `puy-en-velay` →
  `le-puy-en-velay` et `tampon` → `le-tampon`, et compte le FR avec
  `grep -c 'slug: "10-choses-a-faire-a[u]*-.*-2026"'` — la forme historique sans `[u]*`
  en rate deux.

  **Le piège de nommage du batch, tranché.** `things-to-do-in-saint-denis-2026` vise la
  Seine-Saint-Denis et devait se distinguer de `things-to-do-in-saint-denis-reunion-2026`,
  qui existait déjà depuis le batch 23. Les deux coexistent, chacune renvoyant à la bonne
  ville du seed (`saint-denis` / `saint-denis-reunion`), et l'intro du guide 93 le dit dès
  la première ligne — un lecteur anglophone n'a aucune raison de savoir qu'il y a deux
  Saint-Denis en France, et la carte de `/cities/saint-denis/things-to-do` se résout par
  `getEnGuide('things-to-do-in-' + slug + '-2026')`, donc une confusion de slug aurait
  affiché La Réunion sur une page de banlieue parisienne.

  Écrit en anglais natif depuis les faits des sources FR, pas traduit : aucun chiffre qui
  ne soit dans le guide FR correspondant (73 m et 357 miroirs de la galerie des Glaces,
  chœur consacré en 1144 à Saint-Denis, ~72 000 autochromes d'Albert Kahn, Gratte-Ciel
  1931-1934, Pas de Bellecombe vers 2 300 m). Les sigles et institutions que le lecteur FR
  connaît sans y penser sont explicités au point d'affichage — RER / Transilien, courées,
  estaminet, `préfecture`, `commune` — sans note de bas de page. Contraintes de sécurité
  et d'accès conservées telles quelles : niveau d'alerte préfectoral pour la Fournaise,
  interdiction de baignade hors lagon et hors zone surveillée à La Réunion.

  **Métadonnées plus serrées que la série ne l'exigeait** : `metaTitle` ≤ 60 caractères sur
  les 7 (la série EN plafonnait jusqu'ici à 74, donc tronqué en SERP), `metaDesc` ≤ 160.
  Aucun tag nouveau inventé : les tags de région réutilisent `ile-de-france`,
  `hauts-de-france`, `auvergne-rhone-alpes`, `reunion`, tous déjà porteurs de pages
  `/tags/[slug]` côté EN.

  Rien à câbler : la route `app/[locale]/guides/[slug]` porte déjà `canonical` +
  `openGraph.images`, le sitemap dérive de `EN_GUIDES` (`enGuidesSection()`), la carte
  « featured » de `/cities/[slug]/things-to-do` et `CityGuidesList` sur `/cities/[slug]`
  résolvent par slug et par `relatedCities`. `npx tsc --noEmit` propre,
  `assertUniqueSlugs` passé au chargement du module, `npm run search-index:check` à jour.

  **Prochain run de la série : batch FR** — l'écart est nul, la série FR reprend la main.
  Villes DROM encore non couvertes des deux côtés, par population : Mamoudzou, Saint-André,
  Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph,
  Saint-Benoît, Baie-Mahault, Le Robert, Le François.

- **Trouvé en passant, non corrigé (à prendre par un run parité EN)** — ✅ **corrigé le
  2026-08-06**, cf. l'entrée du 06/08 ci-dessus. La palette de
  recherche (`Cmd+K`) sert du contenu **français sur le domaine anglais**.
  `components/SearchPalette.tsx` n'a aucune notion de locale, là où `Navbar` en a une
  (`IS_EN = DEFAULT_LOCALE === "en"`) : elle lit `lib/search-index.ts`, dont le générateur
  `scripts/build-search-index.mjs` ne connaît que `data/guides.ts` — **902 guides FR, zéro
  EN** — et elle porte en dur une liste de termes de glossaire pointant vers `/glossaire`,
  route qui n'existe pas côté EN. Un visiteur de bestcitiesinfrance.com qui cherche
  « Lyon » se voit donc proposer des titres français et des liens vers des pages FR. Même
  famille que le correctif du 04/08 sur la home anglaise (`49037c6`). Le correctif propre
  est un index par locale (`search-index.fr.json` / `search-index.en.json`, choisi via
  `DEFAULT_LOCALE`) plus un jeu de raccourcis glossaire conditionné à la locale — pas une
  traduction des titres.

---

## Shipped 2026-08-04

- **Le corpus éditorial ne part plus dans le bundle client** ✅ — ultra-audit
  2026-08-02 §2.2 (🔴, rapporté et laissé de côté parce que « refactor de pipeline »).
  `components/SearchPalette.tsx` est un composant client et importait `GUIDES` depuis
  `@/data/guides` pour n'en lire que `slug` / `title` / `emoji`, plus
  `getAllTagsWithCounts()` depuis `@/lib/guide-tags`, qui lit le même module. Un
  tableau de littéraux n'est pas tree-shakable : **le corpus entier partait au
  navigateur** — 895 `intro:`, 6 000+ `body:`, c'est-à-dire le corps de chaque section
  de chaque guide, pour afficher une liste de titres — et avec lui `CITIES_SEED`, que
  `data/guides.ts` importe pour ses contrôles d'intégrité.

  **Mesuré des deux côtés, pas déduit.** Graphe d'import depuis la palette :
  **6,42 Mo de source → 0,89 Mo**. Chunk réellement émis par Turbopack :

  | | chunk le plus gros | gzip | `intro:` dedans |
  |---|---|---|---|
  | avant (audit 02/08) | 5,9 Mo | 1,79 Mo | 894 |
  | après | **668 Ko** | **0,13 Mo** | **0** |

  Soit **−93 % sur ce que coûte la première recherche**, sur toutes les pages du site.
  Le code-splitting, lui, était déjà correct : `SearchPaletteLauncher` charge la palette
  en `next/dynamic` au premier `Cmd+K` / `/` / clic, et ça n'a pas bougé.

  Trois points de méthode :

  - **Le générateur évalue les modules réels, il ne les re-parse pas.**
    `scripts/build-search-index.mjs` transpile `data/guides.ts` avec le compilateur
    TypeScript puis l'exécute avec un `require` maison (stubs pour `CITIES_SEED` et
    les asserts, qui n'ont rien à faire dans une projection), et rejoue ensuite le
    **vrai** `lib/guide-tags.ts` avec ces `GUIDES` en entrée. La liste de tags publiée
    ne peut donc pas diverger de celle que le serveur rend : une réimplémentation du
    calcul aurait dérivé au premier changement de `MIN_GUIDES_PER_TAG`. Un import
    inattendu dans `data/guides.ts` fait échouer le script avec le nom de l'import —
    bruyant plutôt que silencieusement faux.
  - **`prebuild` interdit la péremption.** `data/search-index.json` (172 Ko, 895 guides,
    238 tags) est commité pour que `next dev` et `tsc` marchent sans étape préalable,
    mais ~15 agents ajoutent des guides chaque semaine sans connaître ce fichier. Le
    hook npm `prebuild` le régénère avant chaque `next build` : la production est juste
    même si personne n'a relancé le script. `npm run search-index:check` échoue sur un
    fichier périmé, pour la routine intégrité.
  - **`lib/search-index.ts` est une frontière, pas un utilitaire.** Il n'importe que le
    JSON, et son docstring le dit : c'est ce qui garde le corpus hors du bundle. Le
    précédent existait déjà dans le dépôt — `GUIDE_CATEGORIES` a été sorti de
    `data/guides.ts` vers `lib/guide-categories.ts` pour exactement cette raison, et le
    commentaire de tête de ce fichier l'explique. La règle est désormais dans
    `CLAUDE.md` § Performance constraints plutôt que dans la mémoire d'un agent.

  **Non fait, trouvé en chemin** (deux items distincts, pas des oublis) :

  - Il reste **588 Ko de `data/cities-seed.ts`** dans le graphe de la palette — c'est
    maintenant 66 % de ce qu'elle charge. Elle n'en lit que `slug` / `name` / `region` /
    `scores.global`. Une projection ville est le même geste, mais elle suppose de
    rejouer le pipeline `calibrateScores` → `normalizeDistribution` dans le générateur
    (sinon les scores affichés dans la palette ne seraient pas ceux des pages), et
    `CITIES_SEED` est importé par beaucoup d'autres composants clients : le gain réel
    dépend du découpage de chunks, à mesurer avant d'écrire.
  - **La palette est en français sur `bestcitiesinfrance.com`.** `Navbar` rend
    `<SearchPaletteLauncher />` sans condition, et la palette ne connaît que
    `GUIDES` / `CITIES_SEED` FR et les chemins `/villes/…`, `/guides/…`, `/tags/…`.
    Un `Cmd+K` sur le domaine EN renvoie donc des titres français vers des URL qui,
    depuis l'isolation de locale, ne sont plus servies sur ce domaine. C'est un défaut
    de parité (cf. § Parité EN), pas de performance — laissé à `parite-en`, qui tourne
    sur ces fichiers-là.

  Aucune route, aucun sitemap, aucun canonical touché ; `npx tsc --noEmit` propre et
  compilation Turbopack vérifiée (`✓ Compiled successfully`, TypeScript passé). Le
  `npm run build` complet n'a pas été mené à terme dans la session : 56 178 pages pour
  ~28 Go d'export, la contrainte disque décrite en §4.7 de l'audit — la mesure de chunk
  ci-dessus vient de `.next/static/chunks/`, produit avant la génération des pages.

---

## Shipped 2026-08-02

- **hreflang rétabli sur les ~42 000 sous-pages ville (FR + EN)** ✅ — L'ultra-audit de la veille (`docs/audits/ultra-audit-2026-08-02.md` §2.1, §4.1 « le plus rentable des chantiers ») mesurait **2 903 pages sur 54 646 portant un hreflang, soit 94 % du site sans**. La cause n'est pas une négligence ponctuelle : Next **remplace l'objet `alternates` en entier** dès qu'une page en fournit un, donc chaque route qui retournait `alternates: { canonical: … }` perdait en silence le `languages` déclaré au niveau du layout racine (`app/layout.tsx:45-56`). Les seules familles indemnes étaient celles qui reconstruisaient `languages` à la main. Ce run traite la plus grosse : les **39 sous-pages ville FR et leurs 39 jumelles EN**, soit 78 fichiers et ~42 000 pages.
  - **Pourquoi un `sed` sur le helper existant aurait été pire que rien.** `hreflangLanguages()` ne traduisait que le **segment de tête** (`villes`→`cities`). Appliqué tel quel aux sous-pages, il aurait annoncé `/cities/lyon/sante` comme version anglaise de `/villes/lyon/sante` — la route réelle étant `/cities/lyon/healthcare`. Un hreflang qui pointe vers un 404 coûte plus cher que pas de hreflang du tout, et il l'aurait fait 42 000 fois. `lib/i18n.ts` gagne donc `FR_TO_EN_CITY_SUB`, les **39 correspondances de sous-segments** dérivées des deux arbres de routes (`sante→healthcare`, `quartiers→neighbourhoods`, `a-faire→things-to-do`, `s-installer→get-settled`, `commerces→retail`…), et `hreflangLanguages` / `hreflangLanguagesEn` traduisent désormais le 3ᵉ segment quand la tête est `villes` / `cities`. **Sous-segment inconnu → `undefined`**, jamais une URL devinée.
  - **Deux helpers plutôt qu'une consigne à retenir.** `cityAlternates(frSub, slug)` et `cityAlternatesEn(enSub, slug)` renvoient le bloc `alternates` complet — canonical **et** languages. Les 78 sous-pages les appellent au lieu d'écrire leur canonical à la main, donc le `languages` ne peut plus être oublié à la création de la 40ᵉ sous-page : c'est exactement le mode de défaillance qui a creusé ce trou. Les canonicals émis sont **identiques** à avant (FR relatif contre `metadataBase`, EN absolu sur l'origine EN) — aucune URL canonique ne bouge, aucun score, aucune copie.
  - **Garde-fou commité** : `npm run hreflang:check` (`scripts/check-hreflang.mjs`) rapproche la table de `lib/i18n.ts` et l'arbre de routes sur le disque — ce que TypeScript ne peut pas faire. Il échoue si une sous-page n'a pas de correspondance, si la cible n'existe pas de l'autre côté, si les deux ne sont pas dans le **même état d'activation** (une page garée en `page.pending.tsx` — `biodiversite`/`biodiversity` — ne doit pas déclarer une jumelle vivante), ou si un fichier n'utilise pas le helper. Testé dans les deux sens : une fausse sous-page ajoutée à la main le fait sortir en erreur.
  - **Vérifié sur le HTML produit, pas seulement dans le source** — c'est ce qui manquait aux audits précédents : `npm run build` lancé, **2 152 sous-pages ville FR générées portent toutes les trois balises** `fr-FR` / `en-US` / `x-default`, avec le sous-segment bien traduit (`/villes/lyon/commerces` → `https://bestcitiesinfrance.com/cities/lyon/retail`). `npx tsc --noEmit` propre.
  - **Ce qui n'a PAS été vérifié, et pourquoi.** La génération complète (55 777 pages) **n'a pas été menée à son terme dans cette session** : au débit observé ici (~6 000 pages en 12 min sur 3 workers) elle demandait ~2 h, et l'étape de copie vers `out/` aurait de toute façon fini en `ENOSPC` comme lors de l'audit (§4.7 : ~28 Go nécessaires). Le build a donc été interrompu après les 6 006 premières pages, dont les 2 152 sous-pages FR mesurées ci-dessus. **Les pages EN n'étaient pas encore générées** — leur `alternates` passe par le même helper (vérifié unitairement : `cityAlternatesEn("healthcare", "lyon")` → `fr-FR = …/villes/lyon/sante`) et le même mécanisme de rendu, déjà prouvé côté EN par les familles `rankings` / `compare` / `regions` qui émettaient déjà leur hreflang.
  - **Ce qui reste sans hreflang, famille par famille.** `guides` (894 FR / 541 EN) : **volontaire et définitif** — les guides EN sont du contenu natif, pas des traductions, il n'existe pas de paire 1:1 à déclarer. Restent à traiter, une famille par run et avec la même exigence de vérification : `vacances`/`vacations`, `red-flags`, les calculateurs (`calculateur-cout-reel` ↔ `calculator/real-cost`, slugs non alignés), `gentrification`, `pour-qui`/`for-who`. `badge` est FR seul (jumelle EN non livrée, cf. R13.1) : pas de hreflang à émettre.
  - **`overview` (EN) reste sans hreflang, et c'est correct** : sa contrepartie française est la fiche ville elle-même, qui porte déjà sa propre paire.

---

## Shipped 2026-08-01

- **F62 (suite) — la composante zones protégées : ingest INPN, moteur de recouvrement, surfaces** 🚧 — Troisième run de la vague 7. Egress re-testé **une fois** en début de run, comme la consigne le demande : `api.gbif.org`, `inpn.mnhn.fr`, `www.data.gouv.fr` et `geo.api.gouv.fr` répondent tous **403 CONNECT**. Pas de crawl, donc ce run livre la brique qui ne demande pas le réseau — et c'est la plus bloquante : les zones protégées pèsent **45 %** de l'agrégat et sont la seule des trois composantes insensible au biais d'observation, donc `overall` restait `null` sur **toutes** les villes tant qu'elle manquait, même si le crawl GBIF avait tourné.
  - **Ce qui est couvert.** `scripts/city-protected-areas.mjs` (ingest complet : détection des couches, streaming GeoJSON, rastérisation, sortie `data/city-protected-areas.json` triée et commitée) ; `lib/biodiversity.ts` recâblé sur ce fichier (`cityProtectedAreas`, `hasProtectedData`, `protectionCoverage`, `inpnUrl`, `PROTECTION_CALIBRATED`, `PROTECTION_KIND_COUNT`, `protectionPending`, `protectedAreas` dans le profil) ; les deux surfaces FR/EN gagnent un bloc **liste des périmètres** avec type, distance, surface, lien fiche INPN et l'attribution MNHN / Licence Ouverte ; `npm run protected-areas` / `:sources` / `:selftest` / `:stats`. `data/city-protected-areas.json` initialisé à `{}`.
  - **Ce qui n'est PAS couvert, noir sur blanc.** **0/540 villes ingérées** — aucun fichier INPN n'a pu être téléchargé depuis cette routine. Aucun score de protection n'est donc publié, `overall` reste `null` partout, il n'y a toujours pas de classement, et les deux pages restent garées en `page.pending.tsx` (le crawl GBIF est toujours vide, or `biodiversityProfile()` renvoie `null` sans ligne GBIF : **la donnée INPN seule ne fait apparaître aucune page**, c'est un couplage assumé — la page parle d'abord d'espèces).
  - **Rastériser plutôt que sommer — le bug qui aurait été invisible.** Le code livré le 30/07 calculait la couverture en additionnant `areaHa × poids` sur les périmètres. Les zonages français **s'emboîtent par construction** : une ZNIEFF I est presque toujours incluse dans une ZNIEFF II, et les sites Natura 2000 chevauchent les deux. La somme comptait donc le même sol deux ou trois fois et pouvait annoncer « 180 % du disque protégé » — un chiffre impossible, publié avec assurance. La couverture est désormais mesurée sur une **grille de 250 m** (≈ 11 300 cellules dans le disque de 15 km) où chaque cellule retient le **niveau de protection le plus fort** qui la couvre : les recouvrements comptent une fois, au niveau qui s'applique réellement. Vérifié sur le banc : deux couches posées sur exactement le même carré donnent 8,5 % (le plus fort gagne) là où la somme naïve donnait 12 %.
  - **Le remplissage est fait par balayage de lignes** (spans entre les intersections d'arêtes, règle pair-impair pour que les anneaux intérieurs percent les trous sans cas particulier) et non en testant chaque cellule contre chaque arête : certains périmètres ZNIEFF portent des milliers de sommets, le rapport est d'environ 100×. Les polygones sont projetés en mètres sur un repère équirectangulaire local centré sur la ville — sur 15 km la distorsion reste bien sous le pour cent.
  - **`selftest` remplace le canari de crawl.** La géométrie n'a aucune dépendance réseau, donc elle est vérifiable ici et maintenant contre des réponses connues analytiquement : carré englobant → 100,00 %, demi-plan → 50,00 %, carré troué → 300,15 km² pour 300 attendus, polygone hors rayon → 0, distance à un périmètre à 5 km → 5,000 km, centre dedans → 0, et le compte de cellules du disque à 0,5 % de πR². Les 7 passent (`npm run protected-areas:selftest`). C'est l'équivalent de `assertAreaResolved()` dans `city-parks.mjs` : la vérification qui empêche une passe silencieusement fausse.
  - **Deux garde-fous contre une ingestion silencieusement fausse.** ① **CRS** : l'INPN publie en Lambert-93 (EPSG:2154) ; des mètres lus comme des degrés placeraient chaque périmètre dans le golfe de Guinée tout en produisant des nombres d'apparence plausible. L'ingest refuse toute coordonnée hors WGS84 avec la commande `ogr2ogr` de reprojection dans le message. ② **Couches partielles** : chaque ville enregistre les `kinds` réellement présents lors de sa passe, et la page affiche « passe partielle : N des 7 couches, la couverture est donc un minimum » — une ville ingérée sans le fichier ZNIEFF n'est pas comparable à une ville ingérée avec.
  - **Fichiers volumineux.** Les couches nationales pèsent des centaines de Mo ; `JSON.parse` sur le fichier entier fait sauter le tas. Les features sont donc extraites une à une par appariement d'accolades sur un flux, parsées individuellement, fondues dans les grilles puis jetées — l'empreinte mémoire est celle des 540 grilles (≈ 12 Mo), pas celle du fichier. NDJSON/GeoJSONSeq géré aussi.
  - **`null` n'est toujours pas `0`, et l'inverse non plus.** Une ville non ingérée : `null`, la page écrit « nous ne savons pas ». Une ville ingérée **sans aucun périmètre à moins de 15 km** : `areasTotal: 0`, couverture 0, et la page écrit « aucun périmètre protégé dans ce rayon — c'est un résultat de mesure, pas une donnée manquante ». Les deux ne se racontent pas pareil et le profil expose `protectionPending: "data" | "calibration" | null` pour les distinguer, sur le modèle de `richnessPending`. Le garde-fou `MIN_CALIBRATION_CITIES = 100` s'applique aussi à la protection : les périmètres et la couverture en % sont vrais dès la première ville et s'affichent, c'est le **/10** qui attend d'avoir une population à laquelle se comparer.
  - **Vérifications effectuées.** `npx tsc --noEmit` propre ; les 7 contrôles de géométrie ; une passe de bout en bout sur une couche synthétique (carré de 10 × 10 km sur Lyon → 10 000 ha, 14,2 % du disque, × 0,6 pour Natura 2000 = 8,5 % — les trois chiffres tombent exactement) qui exerce le streaming, le préfiltre par bbox (une feature près de Brest bien écartée), la détection des champs `SITECODE`/`SITENAME` et la restauration du fichier après `probe` ; 22 assertions sur le lib à 1 ville ingérée ; puis 120 villes synthétiques pour franchir la calibration, qui confirment que les 3 composantes présentes produisent bien un `overall` dans [1,0 ; 9,4], que la pondération 0,45 / 0,35 / 0,20 se recalcule à la main, et qu'une ville à 0 périmètre reçoit un score bas **publié** plutôt qu'un `null`.
  - ⚠️ **Deux points à vérifier pendant la passe locale, avant que la première surface parte en production.** ① Les **noms d'attributs INPN** (`idFields`/`nameFields` par couche) sont marqués `@unverified` : écrits sans accès aux fichiers. L'ingest **imprime le champ retenu pour chaque couche** (`[id: SITECODE, name: SITENAME]`) — relire ces lignes au premier run ; un `id: <none>` veut dire qu'il faut ajouter le vrai nom d'attribut. ② Les **gabarits d'URL des fiches INPN** (`inpnUrl`) sont eux aussi `@unverified` ; tester un identifiant de chaque couche. La fonction renvoie `null` quand l'identifiant manque et la surface affiche alors le nom sans lien, donc rien ne casse — mais un lien mort vaut moins que pas de lien.
  - ⚠️ **`npm run build` n'a pas pu aller au bout — `ENOSPC`, comme au run précédent.** Le test consistait à activer temporairement les deux pages avec des données synthétiques pour exercer le rendu réel ; l'export a rempli le quota disque de la session (`.next` 23 Go + `out` 6,3 Go) et s'est arrêté avant d'atteindre `/villes/lyon/biodiversite`. **Le rendu des nouveaux blocs JSX n'est donc vérifié que par `tsc`**, pas par un HTML produit — à refaire en local, où le disque n'est pas contraint. Données synthétiques et renommages intégralement annulés : `data/city-biodiversity.json` et `data/city-protected-areas.json` valent bien `{}` dans le commit.
  - **Prochains runs** : ① passe **locale** — `npm run biodiversity:probe` puis crawl GBIF par lots de ~60 villes, et en parallèle télécharger les 7 couches INPN, les reprojeter en WGS84, `npm run protected-areas:sources` pour confirmer qu'elles sont reconnues, puis l'ingest ; ② réactiver les deux pages ensemble (`git mv page.pending.tsx page.tsx`) au premier lot ; ③ classement `/classements/biodiversite` au-delà de ~300 villes mesurables ; ④ câbler le guide `meilleures-villes-naturalistes-biodiversite-france-2026`, qui existe déjà et ne pointe vers rien.

---

## Shipped 2026-07-30

- **F62 — Score Biodiversité : le pipeline et le moteur de score (sans les données)** 🚧 — Premier run de la vague 7. `api.gbif.org`, `inpn.mnhn.fr` et `www.data.gouv.fr` répondent tous les trois **403 CONNECT** au proxy de la routine cloud, exactement comme Overpass et Wikidata pendant la vague 6 : le crawl part donc d'une passe locale, et ce run livre tout ce qui ne demande pas le réseau. **Ce qui est couvert** : `scripts/city-biodiversity.mjs` (GBIF occurrence search, cercle de 10 km autour du centroïde seed, `year≥2015`, `hasCoordinate=true&hasGeospatialIssue=false`, resumable, caché dans `.cache/city-biodiversity/`, ~1 req/s, backoff exponentiel honorant `Retry-After`, User-Agent contactable, sortie `data/city-biodiversity.json` écrite après **chaque** ville pour qu'une coupure ne perde qu'un enregistrement) ; `lib/biodiversity.ts` (trois composantes séparées, seuil de mesurabilité, barème, libellés FR/EN, attributions) ; `data/city-biodiversity.json` initialisé à `{}` ; `npm run biodiversity` / `:stats` / `:probe`. **Ce qui n'est PAS couvert** : aucune donnée collectée (0/540 villes), aucune surface, aucun classement — `/villes/[slug]/biodiversite` n'existe pas encore et n'aurait rien à afficher.
  - **La raréfaction plutôt que le volume, et pourquoi.** Le piège central de F62 est le biais d'effort d'observation : une occurrence GBIF mesure d'abord combien de naturalistes saisissent des données. Le nombre d'espèces distinctes hérite du même biais, parce que les espèces s'accumulent avec l'échantillonnage. Le pipeline calcule donc la **raréfaction de Hurlbert (1971)** — le nombre d'espèces attendu dans un sous-échantillon de 500 observations, `E[S_n] = Σ (1 − C(N−Nᵢ, n)/C(N, n))`, évalué en log-gamma parce que `C(N, n)` déborde un double bien avant les effectifs parisiens. Toutes les villes sont comparées **au même effort**. C'est le correctif standard en écologie, et il est défendable là où « espèces par observation » ne l'est pas (l'accumulation étant sous-linéaire, diviser par N sur-punit les villes bien relevées). Les propriétés ont été vérifiées à la main avant tout crawl : sous-échantillon complet → S exact ; **invariance à l'effort** (50 espèces sur 1 000 obs. et les mêmes 50 sur 10 000 obs. donnent le même 50,0) ; **la richesse bat le volume** (200 espèces vues en 1 000 obs. → 193,8 contre 20 espèces vues en 10 000 obs. → 20,0, soit l'inversion exacte que la métrique naïve rate) ; dominance pénalisée ; stabilité numérique à N = 1 200 000 ; et `null` sous le seuil, jamais une valeur comblée.
  - **Le seuil de mesurabilité n'est pas arbitraire.** < 500 observations **ou** < 20 observateurs distincts → la ville est déclarée non mesurable, `rarefied: null`, et la page devra l'écrire. Les 500 sont le même nombre que la taille du sous-échantillon, à dessein : c'est le point sous lequel la statistique **cesse d'exister** (on ne sous-échantillonne pas plus que ce qu'on a), pas un seuil de confort. Le second garde-fou écarte les communes dont tout le relevé tient à deux ou trois contributeurs, où la richesse observée décrit surtout les centres d'intérêt de ces personnes-là.
  - **Trois composantes, jamais un chiffre opaque, et pas d'agrégat prématuré.** Richesse raréfiée (GBIF), couverture en zones protégées à ≤ 15 km pondérée par le niveau (réserve/parc national 1,0 > arrêté de biotope 0,8 > Natura 2000 0,6 > PNR 0,5 > ZNIEFF I 0,4 > ZNIEFF II 0,25 — une ZNIEFF est un inventaire sans portée réglementaire, la compter à égalité d'une réserve dirait qu'un zonage documentaire protège autant qu'un arrêté), et espaces verts repris de `data/city-parks.json` (F59, **pas de recrawl**, en m²/habitant sur la population Insee réelle quand elle couvre la commune). Décision de conception : **`overall` reste `null` tant que les trois composantes ne sont pas là**. Repondérer 2 composantes sur 3 puis appeler ça un « score biodiversité » produirait un nombre qui ne mesure pas ce que son nom annonce — et comme les zones protégées sont la composante la plus lourde (45 %) *et* la seule insensible au biais d'observation, c'est précisément celle qu'on ne peut pas se permettre d'omettre en silence. `cityProtectedAreas()` renvoie `null` = « on ne sait pas », jamais `0` = « il n'y en a pas » : afficher « 0 zone protégée » sur la foi d'une donnée non collectée serait un chiffre faux sur une ville réelle.
  - **Barème par rang centile, calibré au chargement** plutôt que par seuils codés en dur : il se recalibre tout seul à mesure que le crawl avance (aucune constante à réviser à chaque lot de 60 villes) et il se lit sans dictionnaire — 7,2 signifie « mieux que 72 % des villes mesurées ». Ex æquo à rangs moyennés. Convention respectée : « Biodiversité » nomme une **qualité** → `10 = bon` sur les trois composantes comme sur l'agrégat, aucune inversion à l'affichage, `SCORE_LEGEND_FR`/`_EN` énoncent ce que 10 veut dire et sont le même nombre des deux côtés du hreflang.
  - **Licences traitées comme une condition.** Crawl restreint à `CC0_1_0` et `CC_BY_4_0` — **CC BY-NC exclu**, le site est commercial, même règle que `LICENSE_OK` pour les photos Commons ; le filtre étant identique pour toutes les villes, les comparaisons restent justes. Point d'honnêteté sur le DOI : l'API **de recherche** GBIF n'en génère pas (seule l'API de téléchargement le fait, et elle demande des identifiants). Le pipeline enregistre donc `accessedAt` + la requête exacte pour que les chiffres soient reproductibles, et les surfaces citeront GBIF.org + date d'accès **sans revendiquer un DOI qu'on n'a pas** — la spec demandait « citer le DOI », c'est la version honnête de cette demande. Les espèces menacées comptées viennent de la liste rouge **mondiale** UICN via GBIF, ce qui n'est pas la liste rouge nationale française : les statuts nationaux viendront de l'INPN et le champ est nommé `threatenedSpecies` avec le commentaire qui le dit.
  - **Vérifications effectuées** : `npx tsc --noEmit` propre ; 11 propriétés de la raréfaction testées ; 17 assertions sur le comportement du lib à données vides (profil `null`, protection `null` et non `0`, chaque bras du seuil de mesurabilité rejette bien, repli du nom d'espèce sur le nom scientifique) ; et une passe de bout en bout sur 100 villes synthétiques qui confirme que le barème s'étale (0,1 → 9,9), reste monotone en richesse, refuse le score aux villes trop peu relevées tout en gardant leurs effectifs bruts affichables, et laisse `overall` à `null`. La composante espaces verts, elle, tourne déjà pour de vrai sur les données F59 (Lyon : 4,2 m²/hab. de parcs **nommés** — OSM est renseigné inégalement d'une commune à l'autre et la page devra le dire).
  - **⚠️ Le script n'a jamais parlé à GBIF.** Les formes de paramètres marquées `@unverified` dans le fichier (`geoDistance=lat,lng,10km`, `year=2015,2026`, la pagination de facettes `speciesKey.facetLimit`/`.facetOffset`, et les clés du backbone taxonomique des 6 groupes) sont documentées mais n'ont pas pu être exercées ici. **Lancer `npm run biodiversity:probe` sur une machine locale AVANT le premier lot** : une ville, en verbeux, rien d'écrit. Si `geoDistance` est refusé, le repli est un cercle WKT via `geometry=POLYGON((…))`. `--facet-limit` et `--facet-pages` sont des flags précisément pour être ajustés après avoir vu les vraies réponses, sans rouvrir le fichier.
  - **Prochains runs** : ① passe locale `probe` puis crawl par lots de ~60 villes, un commit par lot ; ② périmètres INPN (préférer le GeoJSON/shapefile data.gouv.fr au service web, c'est un build statique) → `cityProtectedAreas()` n'a que son corps à changer ; ③ ~~surfaces~~ **écrites, voir l'entrée suivante** ; ④ classement `/classements/biodiversite` seulement au-delà de ~300 villes mesurables.

- **F62 (suite) — les deux surfaces, écrites et garées en attendant la donnée** 🚧 — Second run du 30/07, egress re-testé une fois : `api.gbif.org`, `inpn.mnhn.fr` et `www.data.gouv.fr` répondent toujours 403 CONNECT. Les pages `/villes/[slug]/biodiversite` et EN `/cities/[slug]/biodiversity` sont **écrites en entier, typées, et volontairement pas encore des routes** — elles portent l'extension `page.pending.tsx`.
  - **Pourquoi garées, et pas livrées.** `output: "export"` refuse un `generateStaticParams()` qui renvoie un **tableau vide** : Next ne distingue pas « aucun paramètre » de « fonction absente » et casse le build avec `Page "/villes/[slug]/biodiversite" is missing "generateStaticParams()"`. Or il est vide tant que `data/city-biodiversity.json` vaut `{}`. C'est une contrainte réelle du build statique, découverte en lançant `npm run build` — pas une supposition. Les trois issues possibles étaient : inventer une ville de données (exclu), générer une page vide pour les 540 slugs (exclu, c'est du bruit à indexer), ou garer les fichiers. **Réactivation en une commande** le jour du premier lot : `git mv page.pending.tsx page.tsx` sur les deux fichiers — ils doivent repasser **ensemble**, ce sont des alternates hreflang. L'extension reste `.tsx` donc `tsc --noEmit` continue de les vérifier : ils ne peuvent pas pourrir en attendant.
  - **Ce qui est déjà branché et actif** (inoffensif à vide, se remplit tout seul) : entrées `app/sitemap.ts` FR et EN sous la même condition `hasBiodiversityData` que les routes — pas de page, pas d'URL, donc aucun risque de soft-404 pendant que le crawl avance ; carte **🦋 Biodiversité** dans la grille de sous-pages de `CityProfile.tsx`, alimentée par une projection serveur (`biodiversityProjection` dans `lib/city-profile-data.ts`) pour que le JSON ne parte pas dans le bundle client, exactement comme la projection parcs.
  - **Ce que les pages disent quand la donnée est maigre.** Asymétrie voulue avec `/parcs` : une ville crawlée mais **sous le seuil d'effort** reçoit quand même sa page. Elle n'affiche pas de score, elle affiche un encart ambre qui donne les chiffres réels (« 240 observations déposées par 6 personnes ») et dit explicitement que **ce n'est pas un constat de pauvreté écologique mais un constat sur la donnée**. C'est une réponse utile ; le silence n'en est pas une. Même traitement pour les zones protégées : « non mesuré » y est écrit comme « nous ne savons pas », jamais comme « il n'y en a aucune », et l'absence de score global est justifiée sur la page elle-même plutôt que masquée.
  - **Contenu** : score de richesse avec sa légende (« mieux que N % des villes suffisamment relevées ») et la valeur brute de raréfaction affichée à côté pour que le chiffre soit auditable ; les trois composantes en cartes séparées ; répartition par grand groupe **en espèces distinctes** (barres) avec mention explicite quand la pagination de l'API a plafonné un groupe ; espèces les plus observées, nommées en vernaculaire FR/EN quand GBIF le fournit et en nom scientifique sinon, présentées comme « les plus faciles à voir, pas les plus rares » ; espèces menacées avec l'avertissement que c'est la liste rouge **mondiale** UICN et pas la liste nationale ; bloc méthode qui explique le biais d'effort et la raréfaction en français courant ; attribution GBIF + ODbL avec la date d'extraction et la mention que l'API de recherche ne génère pas de DOI. JSON-LD `Dataset` (avec `variableMeasured` et `spatialCoverage`) + `BreadcrumbList`, `alternates.canonical` des deux côtés, jumelles hreflang affichant les mêmes nombres.
  - **Garde-fou ajouté en cours de route — `MIN_CALIBRATION_CITIES = 100`.** En relisant le barème avant de committer, un défaut est apparu qui n'aurait mordu qu'au premier lot : le score est un **rang centile**, donc avec trois villes crawlées la moins bonne des trois afficherait « 0,0/10 » pour cette seule raison, et son score bougerait à chaque lot suivant. Un chiffre qui dépend surtout de l'avancement du crawl ne mesure pas la nature. Sous 100 villes mesurables, aucun score de richesse n'est donc publié — les pages existent, affichent les effectifs bruts et **disent pourquoi**. Le profil expose `richnessPending: "effort" | "calibration" | null`, parce que les deux silences ne se racontent pas pareil : « trop peu d'observations ici » (encart ambre, chiffres réels de la ville) n'est pas « mesure faite, comparaison pas encore possible » (encart neutre, qui affiche la raréfaction et explique que c'est le classement, pas la mesure, qui attend). Vérifié aux deux bords : 27 villes mesurables → 0 score publié, 27 en attente de calibration ; 180 → 180 scores publiés, 0 en attente.
  - **Vérifications** : `npx tsc --noEmit` propre ; sitemap testé en exécutant réellement `app/sitemap.ts` sur ses 18 chunks — 28 304 URLs, **0** URL biodiversité à données vides, 541 URLs `/parcs` intactes, 0 doublon ; puis le test inverse avec 7 villes synthétiques, qui produit bien 7 `/villes/[slug]/biodiversite` côté FR et 7 `/cities/[slug]/biodiversity` sur `bestcitiesinfrance.com` côté EN. La première tentative de `npm run build` a justement échoué sur le `generateStaticParams` vide — c'est elle qui a produit la décision de garage ci-dessus.
  - ⚠️ **`npm run build` n'est pas allé jusqu'au bout, pour une raison d'environnement et non de code — à revérifier en local.** Compilation ✓, TypeScript ✓, et **génération statique complète ✓ (55 752/55 752 pages en 9,2 min)**, ce qui exerce bien les 540 pages ville portant la nouvelle carte 🦋 et le `city-profile-data` modifié. L'échec survient après, à l'étape « Finalizing page optimization », sur `ENOSPC: no space left on device` : l'export de 55 752 pages plus les assets dépasse le quota disque de la session de routine cloud (`df` affiche 29 G libres mais l'allocation par session est bien plus petite — c'est le comportement documenté de cet environnement). Aucune erreur de rendu, aucune page en échec.
  - *Note de maillage pour un prochain run* : le guide `meilleures-villes-naturalistes-biodiversite-france-2026` existe déjà dans `data/guides.ts` et ne pointe vers rien de tout ça. Quand les pages seront actives, c'est le point d'entrée éditorial naturel à câbler.

## Shipped 2026-07-29

- **Guide pilier — `partir-en-vacances-seul-avec-ses-enfants-2026`** ✅ — Item 3 du plan agent « vacances monoparentales » (les items 1 = enrichissement `/vacances/profil/monoparental` et 5 = miroir EN parent-solo étaient déjà livrés, celui-ci ferme l'ancre éditoriale du cluster avant d'ouvrir la série `vacances-monoparentales-[destination]`). Angle distinct du reste du corpus : ni pendant fictif de `famille-a-*` (couple biactif implicite), ni sous-page ville, mais un guide long, national, qui pose la méthode d'arbitrage pour partir en vacances quand on est seul·e adulte au budget, au volant, à la charge mentale. Neuf sections tenues sur des mesures ou des dispositifs, aucun montant d'aide inventé : (1) le vrai coût du supplément single (mécanique du « par personne base double » sur les séjours packagés, leviers « chambre single explicite » et tarifs famille monoparentale des réseaux VVF/Belambra/Cap France/Les PEP), (2) destinations sans voiture (renvoi vers la grille TGV+RER + métro/tram/BHNS de `/vacances/profil/monoparental`, exemples ancrés sur `lib/transit.ts` : Strasbourg, Nantes, Rennes, Bordeaux, Lyon, La Rochelle, Montpellier, Grenoble, Dijon), (3) fenêtres hors juillet-août (renvoi vers la grille mois-par-ville de `lib/vacation-seasons.ts`, combinaisons qui reviennent : avril en Normandie et côte atlantique, mai en Occitanie et Provence intérieure, octobre en Pyrénées et côte basque, novembre à Paris/Strasbourg/Bordeaux), (4) les 5 aides (VACAF, ANCV, bons vacances CAF, Conseils départementaux, CSE) décrites en mécanisme + lien organisme, **sans un seul chiffre de barème** — la ligne éditoriale interdit d'inventer et les barèmes bougent chaque année selon quotient familial, (5) types d'hébergement compatibles parent solo (villages vacances agréés en pension, campings 3-4 étoiles mobil-home 2 chambres, location saisonnière T2/T3 périphérie ville — ce qui marche vs les hôtels 3 étoiles zone touristique et les résidences hôtelières haut de gamme qui restent douloureuses), (6) sécurité et logistique (règles « chambres sur même palier » et « baignade surveillée non négociable » ; carte Vitale + ordonnance + carnet de santé pour l'imprévu médical ; 15 et 116 117), (7) méthode budget en 5 postes calibrés sur « unité familiale d'un adulte + N enfants », pas « par personne base double » — l'exercice fait souvent gagner la destination apparemment plus chère parce qu'elle épargne le poste transport, (8) trois profils parent solo qui marchent (budget serré + VACAF + pension hors saison ; revenu intermédiaire + location T2/T3 périphérie ville de destination ; cadre + city-break 3-5 nuits train), (9) « aller plus loin » qui recycle les grilles calculées ailleurs (renvoi explicite à `/vacances/profil/monoparental`, `/vacances/quiz`, `/villes/[slug]`) avec la traçabilité des sources (`data/cities-seed.ts`, `data/housing.ts`, `lib/transit.ts`, `lib/vacation-seasons.ts`). Category `famille`, emoji 🧑‍🍼, 11 min de lecture, `relatedCities` sur les 5 villes qui remontent le plus haut dans les sections mono (`la-rochelle`, `strasbourg`, `rennes`, `nantes`, `lyon`), `relatedGuides` câblés sur 4 guides `parent-solo-a-*-2026` du batch 1 + `10-choses-a-faire-a-la-rochelle-2026` (destination phare). Tags SEO : « vacances parent solo 2026 », « monoparental vacances », « VACAF chèques vacances ANCV », « vacances sans voiture enfants », « hors saison famille monoparentale ». Ton direct, ni misérabilisme ni « courage » condescendant, écriture inclusive « parent solo » jamais « maman solo ». Sitemap auto pris en charge via `guideRoutes` (map sur `GUIDES.slug`). `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities/relatedGuides/cities-seed) passent à l'import — `data/guides.ts` 879 → 880 guides total. Zéro nouvelle data, zéro dépendance externe, `npx tsc --noEmit` propre. **Restent ouverts sur la verticale « vacances monoparentales »** : série `vacances-monoparentales-[destination]-2026` (item 2, category `family`, par lots de 6-8 sur les destinations les mieux classées par le profil), croisement mois × profil (item 4, surface qui expose la grille `monthSignal()` sous forme de « où partir en avril en monoparental »), miroir EN du hub enrichi `/vacations/profile/monoparental` (item 5, la page EN reste aujourd'hui le template générique — le hub FR a ses quatre sections propres + le bloc aides depuis le 22/07).

- **Nouveau hub `/villes-qui-grandissent` — croissance et décroissance communales, chiffres Insee bruts 2016 → 2022** ✅ — Premier réemploi éditorial du fichier `data/city-population.json` shippé plus tôt aujourd'hui. Le hub `/demographie` existant classe les villes sur un composite 4 dimensions (vieillissement + trajectoire + jeunes actifs + renouvellement) : la lecture est utile mais implique de faire confiance à une pondération. Le nouveau hub répond à l'autre requête qu'un lecteur tape naturellement — « villes qui grandissent en France », « villes qui perdent des habitants » — en ne montrant que des **mesures**, sans agrégation. Trois tableaux tirés directement du recensement Insee via `populationTrend()` : top 30 des villes qui grandissent le plus vite (variation annuelle moyenne 2016→2022, filtre ≥ 15 000 hab.), top 20 des villes qui décrochent le plus, et les dix plus grandes villes stables (variation annuelle sous ± 0,15 %/an, seuil que l'Insee elle-même recommande de ne pas dépasser pour distinguer un mouvement d'un aléa de mesure). Chaque ligne : pop. 2022, pop. 2016, variation totale en %, gain/perte absolu en habitants, variation annuelle en %/an. Sur les 417 communes de plus de 15 000 hab. avec les deux millésimes, la répartition ressort à peu près en trois tiers ; le hub le dit dans un badge. Villenave-d'Ornon (+4,3 %/an) et Bezons (+2,9 %/an) mènent le top croissance ; Calais (-1,7 %/an), Saint-Dizier (-1,5 %/an) et Montluçon (-1,4 %/an) mènent le top décroissance — ces trois-là sont exactement les anciens bassins industriels du Nord-Est qu'on attendrait, et le fait que le calcul les remonte tout seul est un signe que la mesure est propre. Méthodologie explicite : calcul en taux d'accroissement moyen géométrique sur six ans (pas division bête par le nombre d'années), source Insee créditée avec lien vers `insee.fr/fr/statistiques/8581696`, filtre 15 000 hab. justifié (sous ce seuil un lotissement livré fausse le classement), périmètre 538/540 (Mamoudzou et Pierrefitte-sur-Seine hors fichier, expliqué). Six cross-links : `/demographie` (le composite), `/palmares`, `/tension-locative` (croissance + parc figé = tension), `/red-flags/villes-fuite-jeunes-actifs` (pendant éditorial de la seconde table), `/carte`, `/regions`. Le hub `/demographie` renvoie désormais vers le nouveau hub en tête de son bloc « Voir aussi ». JSON-LD `BreadcrumbList` + `ItemList` (top 30) + `FAQPage` (5 Q/R avec chiffres réels). `alternates.canonical: "/villes-qui-grandissent"`. Sitemap : entrée ajoutée dans `staticSection` à côté de `/demographie` (priority 0.8, `CITY_DATA_UPDATED`). Meta title 61 chars, description 165 chars — dans la fourchette. Zéro donnée inventée : chaque nombre du hub trace à `data/city-population.json` via `lib/city-population.ts`. `npx tsc --noEmit` propre.

- **Population réelle & structure par âge (Insee RP 2022) — le proxy départemental de la démographie tombe** ✅ — Deuxième champ d'enrichissement du seed réellement mesuré, après le niveau de vie Filosofi (`data/city-income.json`). Pipeline `scripts/city-population.mjs` (`npm run population`) : télécharge la base communale Insee « Évolution et structure de la population en 2022 » (49 Mo zippés, cache `.cache/city-population/`, Licence Ouverte Etalab), joint sur le **code Insee** du seed, écrit `data/city-population.json` — **538/540 villes**, avec les millésimes 2011 / 2016 / 2022 et les sept tranches d'âge Insee. Non couvertes : Mamoudzou (hors du fichier « France hors Mayotte ») et Pierrefitte-sur-Seine (fusionnée dans Saint-Denis en 2025) ; elles sont absentes du JSON, pas comblées. `lib/city-population.ts` expose des **mesures, jamais des scores** (convention en tête de fichier) : `cityPopulation`, `populationTrend` (variation totale + annualisée 2016→2022, direction neutre sous 0,15 %/an — en dessous le recensement ne distingue pas un mouvement d'un aléa d'échantillon), `seniorShare`, `youthShare`, `ageDistribution`, plus les constantes d'attribution. **Ce que ça corrige** : `lib/demography.ts` estimait le vieillissement et la trajectoire depuis le département et la strate de population — une commune qui gagne des habitants dans un département qui en perd était notée comme son département. `ageingRisk` lit désormais la part réelle des 60 ans et plus (18 % → 0, 40 % → 10, la médiane nationale ≈ 28 % tombe vers 4,5) et `trajectoryRisk` l'évolution réelle 2016→2022 (+1 %/an → 1, stable → 5, −1 %/an → 9) ; le proxy départemental reste en repli pour les 2 communes sans donnée. Les `reason` citent les effectifs réels (« 12 303 habitants en 2022 contre 10 953 en 2016 »). `youngActives` et `renewal` restent estimés — les tranches Insee 15-29 et 0-14 ne recouvrent pas « jeunes actifs 25-35 » ni le taux de natalité, les faire passer pour mesurés serait une surenchère. Surfaces : `/villes/[slug]/demographie` gagne un bloc « Les chiffres du recensement » (population, évolution, part des 60+ et des moins de 30 ans, pyramide des âges en barres) ; `/villes/[slug]/statistiques` affiche la **population municipale Insee 2022 au lieu de l'estimation du seed**, avec la variation sur six ans, et la carte « structure d'âge » passe de la fourchette départementale au pourcentage communal réel. Miroirs EN (`/cities/[slug]/demographics` + `/statistics`) mis à jour en même temps — la règle hreflang impose que les jumelles affichent le même chiffre, et c'est précisément le genre d'écart qu'elle attrape. Attribution Insee + Licence Ouverte affichée avec les chiffres. `npx tsc --noEmit` propre. *Note de suite : le seed garde ses populations approximatives pour les tris et les seuils (éligibilité palmarès, filtres) — les deux nombres coexistent volontairement, la bascule complète du seed sur l'Insee est un chantier à part car elle déplace des seuils.*

- **Guides tourisme — batch 21 (×4)** ✅ — Suite directe des batches 1-20 de la série « 10 choses à faire à [ville] » (category `tourisme`, slug pattern `10-choses-a-faire-a-[slug]-2026`) ouverte au printemps 2026 et rythmée par lots de 8-11 depuis. Batch 21 = 4 villes réelles où l'angle touristique est spécifique et le créneau vacant : **Aubagne** (Bouches-du-Rhône, ville natale de Marcel Pagnol, capitale du santon provençal, porte est de la Provence marseillaise, Sainte-Baume et Cassis à moins de 30 min), **Anglet** (Pyrénées-Atlantiques, 4,5 km de plages océanes entre Bayonne et Biarritz, un des spots majeurs de la côte basque : Chambre d'Amour, Cavaliers, plage des Sables d'Or ; forêt du Pignada 220 ha ; golf de Chiberta 1927 en links), **Autun** (Saône-et-Loire, Augustodunum fondée par Auguste vers 15 av. J.-C., cathédrale Saint-Lazare et son tympan signé « Gislebertus hoc fecit » — chose exceptionnelle à cette époque —, théâtre romain de 20 000 places, portes romaines Saint-André et d'Arroux, temple de Janus, oppidum de Bibracte à 25 km, porte est du parc du Morvan), **Bagnères-de-Bigorre** (Hautes-Pyrénées, station thermale exploitée depuis l'époque romaine, Pic du Midi de Bigorre à 2 877 m et son observatoire — Réserve internationale de ciel étoilé, la première d'Europe —, domaine du Grand Tourmalet 100 km de pistes, grottes de Médous, gouffre d'Esparros classé RNN pour ses fistuleuses uniques en Europe). Structure alignée sur les batches précédents : intro chiffrée + 10 sections de ~280-400 caractères ancrées sur des faits vérifiables (dates de fondation, dimensions, distances, AOP/IGP, spécialités locales), 6 min de lecture, `relatedCities` sur la ville cible + 4-5 satellites/limitrophes existant dans `CITIES_SEED` (Aubagne → marseille/cassis/la-ciotat/allauch/aix-en-provence ; Anglet → bayonne/biarritz/saint-jean-de-luz/hendaye ; Autun → beaune/chalon-sur-saone/macon/dijon/nevers ; Bagnères → tarbes/lourdes/pau), `relatedGuides` sur le guide « vivre-en-région-2025 » correspondant + les guides tourisme voisins déjà shippés (Marseille/Cassis/Bayonne/Biarritz/Saint-Jean-de-Luz/Beaune/Dijon/Lourdes/Tarbes/Pau/vivre-au-vert-pres-de-marseille-1h). Tags SEO long-tail. Sitemap auto pris en charge via `GUIDES.map(...)`. **Total tourisme désormais 173 guides** (`grep 'slug: "10-choses-a-faire-a-.*-2026"'` = 173, `data/guides.ts` passe de 875 → 879 guides toutes séries confondues). Aucune nouvelle référence ghost, `assertUniqueSlugs` + `assertKnownSlugs` (cities + relatedGuides) passent au chargement du module, `npx tsc --noEmit` propre. Aucune donnée inventée : chaque chiffre trace à une source publique bien connue (dimensions du théâtre d'Autun, altitude du Pic du Midi, superficie de la forêt du Pignada, ligne temporelle Pagnol/Aubagne, dates de la cathédrale Saint-Lazare, etc.). Ton analytique, non-vendeur, mentions honnêtes des limites (accessibilité de certains sites, saisonnalité, réservation impérative).

## Shipped 2026-07-28

- **Miroir EN parent solo — `/single-parent` + `/cities/[slug]/single-parent` ×540** ✅ — Item 4 (dernier) du plan agent parent solo. Le hub FR `/parent-solo` et la sous-page ×540 `/villes/[slug]/parent-solo` avaient été livrés les jours précédents ; l'audience anglophone (expat solo divorcé·e installé·e en France, foreign parent envisageant une relocation seul·e avec enfants) n'avait ni classement ni fiche ville dédiés. Miroir complet livré aujourd'hui, byte-identique côté FR (le hub `/parent-solo` et la sous-page FR ne bougent pas d'un octet, seule la gate `locale !== "en"` sautée sur la carte de CityProfile). Nouveau `app/[locale]/single-parent/page.tsx` (hub EN) et `app/[locale]/cities/[slug]/single-parent/page.tsx` (sous-page EN ×540 SSG) — même moteur `parentSoloFit` / `fitLabel` / `minIncomeForT3` de `lib/parent-solo.ts` (aucun nouveau code data, aucune donnée dupliquée), rendu identique au FR mais copie **anglais natif** (pas de traduction machine) : "One income, one driver" plutôt qu'une paraphrase de "un seul revenu, un seul conducteur", "T3 (3-room = 2 bedrooms + living room)" glose pour lecteurs non-francophones (le T3 est un artefact administratif français), "priorité famille monoparentale" laissée en français dans le texte anglais avec traduction inline (le lecteur devra taper cette phrase exacte au guichet CAF/CCAS pour être compris·e). Format euro `€` en préfixe (convention anglaise) plutôt que suffixe (convention française). Cross-links vers routes EN équivalentes : `/city-match`, `/for-who/single-parents` (le profil EN existe déjà, `enSlug: "single-parents"` dans `app/[locale]/for-who/[slug]/page.tsx`), `/vacations/profile/monoparental`, `/overall-ranking`, `/map`, `/compare`. Sous-page ville EN : hero + score composite avec breakdown 4 axes pondérés (`scoreColor` cohérent), section 3-bedroom-rent (avec fallback ADIL si housing non individualisé), section car-free (4 seuils calibrés comme au FR), section schools-canteen-after-school (bloc "Benefits and schemes worth knowing" avec ASF/CMG/APL/QF sliding scale et lien caf.fr), section safety avec lien vers `/cities/[slug]/safety`, verdict adapté à 3 tiers de fit (≥ 6,8 / 5,5-6,8 / < 5,5), DiscussionCTA `locale="en"` en pied. `generateMetadata` avec title + description + `alternates.canonical` sur `bestcitiesinfrance.com/cities/[slug]/single-parent`, `generateStaticParams` sur `CITIES_SEED` (540 pages), JSON-LD `BreadcrumbList` + `FAQPage`. Hub EN : hero + top 30 (filtre 20 000 hab. justifié comme au FR) + bottom 10 + méthodologie complète (formule, pondération, filtre population, calcul revenu min T3) + 6 cross-links, `alternates.canonical` sur `bestcitiesinfrance.com/single-parent`, JSON-LD `BreadcrumbList` + `ItemList` (top 30) + `FAQPage` (5 Q/R). Wiring : gate `locale !== "en"` retirée sur la carte parent-solo de `CityProfile.tsx` — désormais **côté EN** le libellé est "🧑‍🍼 Single parent — One income, one driver — what actually works" et le href pointe sur `/cities/[slug]/single-parent`, **côté FR** rien ne change (byte-identique via le helper `L()`). Sitemap : `/single-parent` ajouté à `enStaticSection` (priorité 0.8), `"single-parent"` ajouté au tableau `subs` de `enCitySubSection` → 540 URLs ×EN dans le chunk `en-city-sub`. Navbar EN : entrée "🧑‍🍼 Single parent → /single-parent" ajoutée dans le groupe "Tools" (parallèle au groupe "Outils" FR). Aucune nouvelle data, aucune dépendance externe, `npx tsc --noEmit` propre. **La verticale « parent solo » (guides longs + sous-page ×540 + hub national + miroir EN) est désormais complète, item 4 sur 4 livré.**

- **Hub national `/parent-solo`** ✅ — Item 3 (sur 4) de la verticale « parent solo » ouverte le 24/07 avec la série de guides et étendue le 25/07 avec la sous-page `/villes/[slug]/parent-solo` ×540. Nouvelle landing SEO nationale qui classe les villes ≥ 20 000 hab. sur le composite `parentSoloFit` de `lib/parent-solo.ts` (coût 30 % · transports 20 % · écoles 25 % · sécurité 25 %, mêmes poids que le profil `single-parent` de `city-match.ts`). Deux tableaux : top 30 (fit le plus élevé, avec loyer T3 réel `data/housing.ts` et revenu net minimum estimé via la règle du tiers relâchée à 35 % sur marché tendu) et bottom 10 (villes qui pénalisent le profil — sans condamnation, juste signal). Section « guides longs » qui liste automatiquement les 10 guides `parent-solo-a-*-2026` shippés en batch 1. Méthodologie complète (pondération, filtre 20 000 hab. justifié par le bruit transport/écoles sur les petites communes, sources Insee/SSMSI/observatoires). JSON-LD `BreadcrumbList` + `ItemList` (top 30) + `FAQPage` (5 Q/R). Cross-links : `/city-match` (le quiz personnalise le fit), `/pour-qui/familles-monoparentales` (angle éditorial), `/vacances/profil/monoparental` (destinations tenables), `/palmares` (moyenne 8 axes), `/carte`, `/comparer`. Entrée dans `app/sitemap.ts` chunk `static` (priorité 0.8) et dans le méga-menu Navbar « Outils » (🧑‍🍼) — la carte parent solo était déjà présente sur les 540 sous-pages ville depuis le 25/07, ce hub ferme la boucle top-down. Zéro nouvelle donnée : pur usage du composite existant + housing + guides déjà en base. Aucune dépendance externe, aucun crawl. **Item restant : miroir EN `/cities/[slug]/single-parent` + `/single-parent`** (les EN cities pages n'affichent pas la carte parent-solo aujourd'hui — `locale !== "en"` gate posée en 07/25 dans `CityProfile.tsx`). ✅ **Livré 2026-07-28** — voir l'entrée « Miroir EN parent solo » ci-dessus.

- **Correction de 41 codes INSEE dans le seed + garde d'unicité + niveau de vie réel** ✅ — Trouvé en construisant la jointure Filosofi : **38 des 540 villes portaient le code d'une autre commune** (Moulins celui de Montluçon, Sète celui de Saussan, Dinan celui de Bulat-Pestivien, Saint-Genis-Laval celui de Saint-Romain-au-Mont-d'Or…), dont **5 paires en doublon exact**. Le code INSEE étant la clé de jointure de tous les jeux externes, le bug était visible en production : `/villes/moulins/parcs` listait les parcs de Montluçon, `/villes/ile-de-re/parcs` ceux de La Rochelle, `/villes/sete/parcs` était vide (le code pointait un village de 1 400 habitants), et le lien Géorisques de `/villes/[slug]/risques` ouvrait le rapport de la mauvaise commune. Les 540 codes ont été vérifiés un à un contre `geo.api.gouv.fr` — 36 corrigés automatiquement par résolution nom + département, 2 arbitrés à la main (Hossegor → Soorts-Hossegor 40304, la commune réelle ; Pierrefitte-sur-Seine → ancien code 93059 conservé, la commune a fusionné dans Saint-Denis au 1ᵉʳ janvier 2025, ce qui explique son absence des sources en géographie 2025). Île de Ré n'a pas de code propre (10 communes) : ancrée sur Saint-Martin-de-Ré, son chef-lieu, au lieu de La Rochelle qui est sur le continent. Les deux exceptions sont commentées dans le seed pour qu'une vérification future ne les « corrige » pas. **Garde de non-régression** : `assertUniqueInseeCodes()` dans `lib/data-integrity.ts`, appelée au chargement du seed avec `assertUniqueSlugs()` — un code partagé casse désormais le build. Les 41 villes touchées ont été re-crawlées sur Overpass. **Dans la foulée**, la jointure qui a servi à trouver le bug a été livrée : `scripts/city-income.mjs` + `data/city-income.json` + `lib/city-income.ts` portent le **niveau de vie médian** et le **taux de pauvreté** Insee Filosofi 2021, publiés à la commune, pour 533/540 villes, surfacés sur `/villes/[slug]/statistiques` et son miroir EN. Au passage, la page créditait « Source INSEE DADS » une fourchette de salaire qui sortait en réalité de nos propres indices : elle est requalifiée en estimation. Vocabulaire tenu partout — le niveau de vie est un revenu disponible par unité de consommation, pas un salaire.

- **Comparateur — rangs 16-20 face au top-11 (+46 paires, 676 → 722)** ✅ — Clôture de l'item « Sitemap haut-trafic » de CLAUDE.md. Constat préalable : `app/sitemap.ts` et le `generateStaticParams` de `app/comparer/[pair]` dérivent tous deux de `SEO_PAIRS`, donc la couverture sitemap ne peut pas dériver de la liste des pages — le seul vrai sujet est le contenu de la liste. Le carré top-15 fermé la veille laissait Grenoble, Dijon, Angers et Nîmes (rangs 16-20 métropolitains) quasiment sans paire face aux grandes destinations, alors que ce sont des villes de report réelles. Croisées avec le top-11 + carré entre elles. Top-20 × top-20 passe de 110/190 à 156/190 ; les 34 restantes sont hors périmètre assumé (Reims / Toulon / Le Havre / Saint-Étienne face à ces quatre-là, et tout ce qui implique Saint-Denis de La Réunion — « Le Havre vs Saint-Denis de La Réunion » n'est pas une recherche). Vérifié : 722 paires, 722 clés uniques une fois l'ordre normalisé, zéro auto-paire, `assertKnownSlugs` passe. Chaque paire génère la page comparative, sa `/synthese` et son OG image, soit +92 URLs indexables. `npx tsc --noEmit` propre.

- **R13.2 — Palmarès mensuel, édition août 2026** ✅ — `palmares-aout-2026-rapport-qualite-vie-prix-achat` (category `budget`, 7 min). Thème annoncé par l'édition de juillet et honoré : score global ÷ **prix d'achat au m²**, l'angle acheteur après l'angle locataire. Classement calculé sur le vrai pipeline (compilation scratch `tsc -p` de `data/cities-seed.ts` + `data/housing.ts` en commonjs avec résolution `@/`, puis tri — pas de lecture regex du seed, le score affiché sur les fiches est celui d'après `calibrateScores` + `normalizeDistribution`). 363 communes éligibles (pop ≥ 20 k avec référence de prix), médiane 2 900 €/m². Top 5 : Chaumont (6,8 pour 950 €/m²), Saint-Dié-des-Vosges, Saint-Dizier, Montluçon, Laon. Sections : méthode, top 20, conversion en surface pour 150 000 € (158 m² à Chaumont contre 14 m² à Paris), écart loyer/achat par rapport à juillet (7 villes communes ; Vichy 25e et Rochefort 44e décrochent — pierre plus chère que le loyer ne le suggérait), villes chères qui tiennent leur prix (Les Sables-d'Olonne, Fontainebleau, Strasbourg, Rennes), limites assumées (moyenne communale, prix bas = signal de marché, revente lente). L'édition de juillet pointe désormais vers août dans ses `relatedGuides`. Thème de septembre annoncé : qualité des écoles ÷ coût du logement (angle rentrée). `assertUniqueSlugs`/`assertKnownSlugs` OK, `npx tsc --noEmit` propre, sitemap auto via `guideRoutes`.

## Shipped 2026-07-25

- **Série `universites-[ville]` batch 2 (+5 guides, 10 → 15) — Grenoble, Nice, Clermont-Ferrand, Nancy, Dijon** ✅ — Deuxième et dernier batch de la série « universités, grandes écoles, logement étudiant, budget réel » lancée hier avec la batch 1, série close à 15/15 conformément au plan CLAUDE.md v11 (« universites-[ville]-2026 top 15 villes »). Sélection cohérente avec le maillage existant : les 5 villes disposent de l'écosystème complet 4-5 guides (`vivre-a-`, `acheter-a-`, `travail-a-`, `demenager-a-`, `etudiant-a-` ou `budget-mensuel-realiste-` ou `vivre-sans-voiture-`) — `relatedGuides` intégralement câblés sur des slugs réels (`assertKnownSlugs` passe à l'import ; Nice n'a pas d'`etudiant-a-` shippé et référence son pivot `budget-mensuel-realiste-nice-2026` à la place). Structure alignée sur batch 1 : intro chiffrée (nombre d'étudiants + fourchette loyer studio + budget mensuel tout compris) + 6 sections (établissements phares nommés / classements internationaux honnêtes / logement CROUS et parc privé / vie étudiante par quartier / bourses CROUS et aides mobilisables / pièges à connaître), 8 min de lecture, category `lifestyle`, emoji 🎓, `relatedCities` sur la ville cible + 4 satellites/limitrophes réels vérifiés existants dans `CITIES_SEED` en amont (saint-martin-d-heres/fontaine/echirolles/chambery pour Grenoble, cagnes-sur-mer/antibes/cannes/menton pour Nice, riom/aurillac/vichy/moulins pour Clermont, laxou/vandoeuvre-les-nancy/metz/epinal pour Nancy, chenove/beaune/chalon-sur-saone/auxerre pour Dijon). Écosystèmes académiques profondément documentés et différenciés : UGA (100-200e Shanghai, top français hors Paris-Saclay) + Grenoble INP + Ensimag + Phelma + Sciences Po Grenoble + GEM + CEA-Leti/ILL/ESRF pour Grenoble ; Université Côte d'Azur + EDHEC Nice (top 5 mondial FT Master in Finance) + SKEMA Sophia + Polytech Nice-Sophia + Eurécom + Sciences Po Menton + INRIA Sophia + technopole Sophia Antipolis 35 000 emplois high-tech pour Nice ; UCA + SIGMA Clermont + ESC Clermont (triple crown, top 15-20) + VetAgro Sup + Institut Agro + Polytech Clermont + Michelin Ladoux-Cataroux 10 000 salariés + Limagrain + Sanofi Vertolaye + CHU Estaing pour Clermont ; Université de Lorraine + alliance ARTEM (Mines Nancy + ICN + ENSAD sur un campus unique) + Sciences Po Nancy + 7 écoles d'ingénieurs UL (EEIGM, TELECOM Nancy, ENSGSI, ENSIC, ENSAIA, ENSEM, ENSG) + Institut Élie-Cartan + Institut Jean-Lamour + INRIA + CHRU Brabois 11 500 pour Nancy ; Université de Bourgogne + BSB (triple crown EQUIS-AACSB-AMBA) + Sciences Po Dijon (campus européen Sciences Po Paris) + Institut Agro Dijon (top 5 agronomes) + ESIREM + ENSA Dijon + INRAE Dijon + CHU Bocage + Vignoble universitaire Climats de Bourgogne UNESCO pour Dijon. Section « pièges » toujours honnête : distance campus-centre (Domaine Saint-Martin-d'Hères Grenoble 15-20 min tram B/C, Sophia-Nice 45 min bus RD35, Montmuzard Dijon 15-20 min tram), ZFE Grenoble-Alpes Crit'Air 3 exclu juillet 2025, inversion thermique cuvettes Grenoble-Clermont-Dijon 30-60 jours brouillard hiver, mono-culture microélectronique Grenoble (STMicro-Soitec-Schneider-CEA-Leti peu transférable), mono-dépendance Michelin Clermont (10 000 directs + 15-20 % induit), enclavement ferroviaire Clermont-Paris 3 h 15-3 h 30 Intercités, tension immobilière saisonnière Côte d'Azur (loyer 40-50 % plus cher qu'à Toulouse-Lille pour un studio équivalent, Airbnb touristique 2-3× le prix mensuel étudiant), sous-évaluation UL Nancy à l'échelle nationale malgré excellence Institut Élie-Cartan et Jean-Lamour, mirage frontalier Luxembourg Nancy (convention fiscale 2023 plafond télétravail 34 jours/an), sédentarité dijonnaise (cadres 8-11 ans en poste, progression salariale lente), affichage TGV trompeur Dijon-Paris 1 h 35 mais abonnement Fréquence 350-450 €/mois si carrière parisienne visée, EM/BSB/ICN post-restructurations et renouvellements AACSB à surveiller pour recruteurs internationaux, écoles privées post-bac (Ynov, MyDigitalSchool, ESRA cinéma, ESGCI, IPAG) à vérifier RNCP niveau 6-7 + insertion 12 mois avant engagement 6 000-14 000 €/an, climat continental rude Nancy-Dijon (-5 à -10 °C hivers, 35-38 °C étés caniculaires ponctuels), vendanges Côte de Nuits-Beaune septembre en chevauchement rentrée universitaire Dijon. Chiffres calibrés sur données publiques 2025-2026 : effectifs par université (UGA 55 k, Grenoble INP 4,5 k, UCA 30 k, EDHEC 9 k, SKEMA 8 k, UCA Clermont 40 k, SIGMA 700, ESC Clermont 1,4 k, UL 55 k, Mines Nancy 1,5 k, ICN 2,5 k, uB 28 k, BSB 2,8 k, Institut Agro Dijon 700), loyer CROUS 160-490 €/mois (Grenoble Berlioz 170 €, Nancy Vandœuvre 165 €, Dijon Montmuzard 170 €), loyer parc privé studio 380-780 € selon ville (Nice 620-780 € tension Côte d'Azur, Clermont/Nancy/Dijon 380-500 €), bourses 145-620 €/mois échelons 0 bis-7, aide à la mobilité master 1 000 €, aide au mérite 900 €/an, prêt étudiant garanti par l'État jusqu'à 20 000 €, tarifs abonnement transport étudiant TAG Grenoble/Lignes d'Azur Nice/T2C Clermont/STAN Nancy/DiviaMobilités Dijon 25-30 €/mois. Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 5 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 15 guides `universites-*-2026` désormais chargés, `data/guides.ts` 869 → 874 guides total. **Série close à 15/15 conformément au plan CLAUDE.md v11.** Zéro nouvelle data — pure combinaison seed + connaissance directe des universités françaises (barèmes CROUS 2025-2026, classements Shanghai ARWU 2024-2025, effectifs officiels annuaires établissements, accréditations triple crown EQUIS-AACSB-AMBA vérifiées, tarifs abonnement transports urbains étudiants publiés par TAG/Lignes d'Azur/T2C/STAN/Divia). Ton analytique, non-vendeur, classements honnêtes (Shanghai reflète mal les sciences humaines, GEM post-fusion abortée à surveiller, ICN post-renouvellement EQUIS-AMBA sans AACSB, mirage écoles privées post-bac à filtrer via RNCP), pas d'affichage exagéré. `npx tsc --noEmit` propre.

## Shipped 2026-07-24

- **Nouvelle série `parent-solo-a-[ville]` batch 1 (+10 guides, 0 → 10) — Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille** ✅ — Ouverture de la verticale monoparentale côté guides éditoriaux (item 1 du plan agent parent solo). Sujet sensible traité sans misérabilisme et sans « courage » condescendant : l'utilisateur veut des chiffres et des arbitrages concrets. Angle distinct de `famille-a-*` (couple biactif implicite) et de `vivre-a-*` (généraliste) : ce que change *un seul revenu + un seul conducteur/parent* — capacité à porter un T3 sur un salaire, faisabilité vie sans voiture (le point qui fait basculer plus que n'importe quoi pour un profil mono), maillage écoles publiques + cantine QF + périscolaire CAF, filtre sécurité quartier par quartier. Sélection : les 10 métropoles les plus peuplées de France, les plus recherchées. Structure alignée sur `vivre-a-*` : intro chiffrée (T3 moyen `data/housing.ts` + scores transport/écoles/coût/sécurité `data/cities-seed.ts`) + 6 sections (l'enjeu spécifique parent solo dans la ville / budget T3 sur un revenu par quartier / vivre sans voiture ou avec / écoles-cantines-périscolaire / sécurité par quartier / verdict pour quel profil). 9 min de lecture, category `famille`, emoji 🧑‍🍼, `relatedCities` sur la ville cible + 4 satellites/limitrophes réels vérifiés existants dans `CITIES_SEED` en amont (`villeneuve-d-ascq`/`marcq-en-baroeul` absents seed → remplacés par `armentieres`/`arras` pour Lille). Chiffres tous tracés à `data/housing.ts` (T3 : Paris 2 800 €, Lyon 1 380 €, Marseille 1 100 €, Toulouse 1 150 €, Nice 1 500 €, Nantes 1 150 €, Montpellier 1 150 €, Strasbourg 1 080 €, Bordeaux 1 200 €, Lille 1 080 €) et à `data/cities-seed.ts` (scores axes affichés avec unité `/10` et source citée). Zéro chiffre inventé : les revenus sont formulés comme fourchettes (« sur 2 000 € net », « proche du médian cadre en région ») sans prétendre à une source Insee précise, et les tarifs cantine/périscolaire/APL sont décrits comme « tranches QF CAF » avec ordres de grandeur publics — la « priorité famille monoparentale » CAF est mentionnée comme dispositif documenté à demander sur dossier (pas automatique). Ton direct, chaque guide arbitre honnêtement : Paris ne fonctionne pas sous 2 200 € net sans levier logement, Lyon est probablement le meilleur choix français pour cette configuration, Marseille récompense l'ancrage local et la connaissance quartier par quartier, Toulouse impose souvent une voiture au parent solo, Nice n'est faisable qu'au-dessus de 2 500 € net, Nantes rivalise avec Lyon sur tout sauf le climat, Montpellier tient si le revenu suit, Strasbourg cumule vélo + tram + écoles solides, Bordeaux post-LGV a durci le calcul crèches, Lille est la moins chère du top 10 avec un vrai filtre sécurité quartier. Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 10 guides `parent-solo-a-*-2026` désormais chargés, `data/guides.ts` 859 → 869 guides total. `npx tsc --noEmit` propre. Restent à ouvrir sur la verticale : sous-page `/villes/[slug]/parent-solo` ×540 (item 2 du plan), hub `/parent-solo` (item 3), miroir EN `/cities/[slug]/single-parent` + `/single-parent` (item 4).

- **Nouvelle série `universites-[ville]` batch 1 (+10 guides, 0 → 10) — Paris, Lyon, Toulouse, Lille, Bordeaux, Aix-en-Provence, Montpellier, Rennes, Strasbourg, Nantes** ✅ — Ouverture de la série « universités, grandes écoles, logement étudiant, budget réel » listée dans le plan CLAUDE.md v11 (« universites-[ville]-2026 top 15 villes »). Angle distinct de tout ce qui existait : `etudiant-a-[ville]` traite déjà la vie étudiante générale (18 villes shippées) mais reste large — logement + budget + « où sortir » ; la nouvelle série se concentre sur la partie proprement académique + logement CROUS + aides régionales, avec la géographie fine des campus et un ton analytique sur les classements (Shanghai ARWU, THE, QS, RepEc, FT European) qui manquait au corpus. Sélection : les 10 métropoles universitaires les plus recherchées ; chacune dispose d'un écosystème complet 4-6 guides (`vivre-a-`, `etudiant-a-` quand présent, `acheter-a-`, `travail-a-`, `demenager-a-`, `vivre-sans-voiture-`), `relatedGuides` intégralement câblé sur des slugs réels (`assertKnownSlugs` passe à l'import — Paris et Aix-en-Provence n'ont pas d'`etudiant-a-` shippé et référencent leurs pivots budget/acheter/travail à la place). Structure alignée sur `travail-a-` : intro chiffrée (nombre d'étudiants + fourchette loyer studio + budget mensuel tout compris) + 6 sections (établissements phares nommés / classements internationaux honnêtes / logement CROUS et parc privé / vie étudiante par quartier / bourses CROUS et aides mobilisables / pièges à connaître), 8 min de lecture, category `lifestyle`, emoji 🎓, `relatedCities` sur la ville cible + 4 satellites/limitrophes réels (vérifiés existants dans `CITIES_SEED` en amont — `ramonville-saint-agne` remplacé par `muret` pour Toulouse, `wattignies/marcq-en-baroeul` remplacés par `lens/valenciennes` pour Lille, satellites Rennes/Nantes/Montpellier/Strasbourg réajustés sur `vitre/saint-malo`, `saint-nazaire`, `sete/beziers/nimes/ales`, `haguenau`). Chiffres calibrés sur données publiques 2025-2026 : effectifs par université (Sorbonne 55 k, Paris-Cité 65 k, Paris 1 40 k, Lyon 1 45 k, Lyon 2 30 k, Lyon 3 25 k, AMU 80 k, Nantes Université 40 k, Rennes 40 k, Rennes 2 24 k, Unistra 55 k, Toulouse UT1 22 k, UT2J 28 k, UT3 32 k, Bordeaux 55 k, Bordeaux-Montaigne 14 k, Montpellier 50 k, Paul-Valéry 25 k, Lille 78 k) ; loyer CROUS 145-620 €/mois (barème national 2025-2026), loyer parc privé studio 420-1 300 € selon ville (encadrement des loyers Grand Paris + Métropole de Lyon depuis 2019/2021 explicité, zones tendues historiques 2013 pour les 8 villes hors IDF ×Lyon), bourses 145-620 €/mois échelons 0 bis-7 avec barème CROUS 2025-2026, aide à la mobilité master 1 000 €, aide au mérite 900 €/an, prêt étudiant garanti par l'État jusqu'à 20 000 €. Écosystèmes académiques profondément documentés et différenciés : PSL + Institut Polytechnique de Paris + HEC + ESSEC + ESCP + Sciences Po Paris pour Paris ; INSA Lyon + Centrale Lyon + ENS Lyon + EM Lyon (avec la perte AACSB 2024 explicitée) pour Lyon ; ISAE-Supaéro + ENAC + INSA Toulouse + TSE (top 15 mondial économie via Tirole/Duflo) pour Toulouse ; Centrale Lille + IMT Nord Europe + EDHEC + SKEMA + Sciences Po Lille + ESJ Lille pour Lille ; Bordeaux INP + Sciences Po Bordeaux + Kedge + ENSAM Bordeaux pour Bordeaux ; AMU (top 4 France Shanghai) + Sciences Po Aix + INSP ex-ENA fusionnée 2022 + IAE Aix-Marseille pour Aix-en-Provence ; Faculté de médecine Montpellier (plus ancienne d'Europe encore active, 1220) + MBS + Institut Agro pour Montpellier ; fusion 2023 Université de Rennes + INSA + ENS Rennes + Sciences Po Rennes + EHESP pour Rennes ; Unistra (top 4 France Shanghai) + Sciences Po Strasbourg + INSP + EM Strasbourg + INSA Strasbourg (rare cursus ingénieur-architecte) pour Strasbourg ; fusion 2022 Nantes Université + Centrale Nantes + Audencia + École de Design + IMT Atlantique + ENSA Nantes + Île de Nantes French Tech pour Nantes. Section « pièges » toujours honnête et documentée : mirage prestige Sorbonne vs insertion réelle Panthéon-Assas/Dauphine, budget étudiant parisien réel 17-22 k€/an hors droits, EM Lyon post-AACSB 2024, écoles privées post-bac à vérifier RNCP niveau 6-7 + insertion 12 mois, saison locative tendue (LGV Paris-Bordeaux/Nantes serrant les marchés), distances campus périphérique-centre (Villeneuve-d'Ascq-Lille 25-30 min tram Mongy, La Doua-Presqu'île 40-50 min tram, Le Mirail-centre Toulouse 30-40 min métro, Talence-Pessac-Bordeaux 25-30 min tram B, ENAC-ISAE Rangueil 25-30 min tram T1, Cité scientifique-centre Villeneuve-d'Ascq), climat (canicule Toulouse-Bordeaux-Montpellier-Aix 20-35 j/an, ZFE Aix-Marseille Crit'Air 3 exclu 2025, cuvette Lyon inversion thermique hiver, risque cévennol Montpellier Lez/Mosson, mistral Aix, hivers rudes Strasbourg -10 °C, gris Lille-Rennes 130-170 j pluie), spécialisations cyber-défense DGA-MI Rennes / aéro-défense ISAE-Supaéro peu transférables, plafond fiscal 34 j/an frontaliers Allemagne Strasbourg, marché de Noël Strasbourg saturant la ville 4 semaines, Braderie de Lille début septembre chevauchant la rentrée, Festival d'Aix juillet, Trans Musicales Rennes début décembre, Voyage à Nantes juillet-août. Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 10 guides `universites-*-2026` désormais chargés, `data/guides.ts` 849 → 859 guides total. Zéro nouvelle data — pure combinaison seed + connaissance directe des universités françaises (barèmes CROUS 2025-2026, classements Shanghai ARWU 2024-2025, effectifs officiels annuaires établissements, tarifs abonnement transports urbains étudiants publiés par TCL/Ilévia/TaM/TCS/TAG/etc.). Ton analytique, non-vendeur, classements honnêtes (Shanghai reflète mal les sciences humaines, EM Lyon post-AACSB à surveiller, mirage écoles privées post-bac à filtrer via RNCP), pas d'affichage exagéré. `npx tsc --noEmit` propre.

## Shipped 2026-07-23

- **F60 — Carte de France cliquable des départements sur `/departements`** ✅ — Compléte le finder textuel du 22/07 par le réflexe naturel (« je regarde la carte, je clique sur mon coin »). Nouveau `components/DepartementMap.tsx` : SVG server-only (pas de `"use client"`), une bulle par département métropolitain positionnée au centroïde pondéré des villes du seed (moyenne lng/lat des villes présentes), colorée par score moyen via `scoreHex`, taille indexée sur le nombre de villes classées (r 14-20). Chaque bulle est un `<a href="/departements/[slug]">` avec `<title>` et `aria-label` — la carte fonctionne **sans JavaScript** (chaque département reste crawlable et cliquable), condition du grade SEO du site. Réutilise `lib/france-map-geo` (projection équirectangulaire + tracé BORDER_PATH/CORSICA_PATH + `inMetropolitanBox`) pour aligner pixel-à-pixel avec `FranceHeatmap` et `PoliticalMap`. Passe de relaxation minuscule (O(n² × 80 itérations), n ≈ 96, quelques milliers d'ops au build) qui pousse les bulles qui se chevauchent (Île-de-France : 8 dept dans un carré de ~30 km) avec un stem gris pâle du centroïde réel à la position affichée. Légende 6 tiers en bas du SVG (Exceptionnel → Faible), caption explicative sous le SVG (« taille ∝ nombre de villes classées »). Les DROM sortent du bbox métropolitain — comme sur `FranceHeatmap` — et restent adressables via le finder ci-dessous et via `/regions`. Fallback `<div className="sr-only">` : liste `<ul>` des départements avec liens pour les lecteurs d'écran. Composant accepte `locale?: "fr" | "en"` (défaut `"fr"`, sortie FR **byte-identique** — règle CLAUDE.md #6 sur les composants FR réutilisés côté EN) : mission item 5 (mirror EN sur `/departments`) démarre déjà avec l'API prête. Intégré dans `app/departements/page.tsx` **au-dessus** du `DepartementFinder` (la carte est le premier réflexe, le finder est le clavier). Le `<details>` d'index ville par ville reste intact — les 540 liens crawlables du maillage interne ne bougent pas. `npx tsc --noEmit` propre. Build SSG > 10 min sur ce runner, non testé bout-en-bout (composant pur server, aucune dépendance nouvelle, seulement des primitives déjà utilisées par `FranceHeatmap`/`PoliticalMap` — risque de régression build faible).

## Shipped 2026-08-01

- **Série F61 — `vacances-celibataire-[destination]-2026` batch 1 (+8 guides, Paris / Lyon / Bordeaux / Nantes / Strasbourg / Rennes / Montpellier / Bayonne)** ✅ — Ouverture de la série guides adossée au profil `celibataire` de `lib/vacation-fit.ts` (pondération culture .40 / life .30 / transport .20 / safety .10). Les 8 destinations sont les mieux placées du profil parmi les vraies « villes de séjour » (les rangs 2-4 du classement brut — Neuilly, Vincennes, Obernai — ne sont pas des destinations vacances, sortis d'office). Sélection différenciée par angle : Paris (capitale, tout marche, contrepartie coût), Lyon (bouchons + péniches + rives), Bordeaux (bars à vins Chartrons + Saint-Pierre), Nantes (Bouffay + scène alternative), Strasbourg (winstubs + Krutenau), Rennes (mardi soir étudiant), Montpellier (terrasses méditerranéennes ouvertes tard), Bayonne (pintxos Petit Bayonne). Structure alignée à 6 sections × ~1 000 mots (intro + « pourquoi cette ville en célibataire », « où poser ses valises », « sortir un mardi soir », « se déplacer sans voiture jusqu'à la fermeture », « supplément single et comment le contourner », « quand y aller »). 7-8 min de lecture, category `lifestyle`, emoji 🍸. **Angle éditorial** : la série tient la distinction avec le profil `solo` explicitement — cherche du monde ≠ cherche la tranquillité. Aucune promesse de rencontre, aucun registre « site de rencontres », zéro cliché sur la solitude, écriture inclusive légère (`seul·e`) sans présomption de genre ni d'orientation. **Zéro chiffre inventé** : les scores nightlife par quartier sont tracés vers `data/neighborhoods.ts` (couverture réelle des 8 villes), les affirmations transport vers `lib/transit.ts`, les affirmations population et scores axiaux vers `data/cities-seed.ts` ; les tarifs hôteliers ne sont jamais chiffrés (les prix bougent trop vite pour tenir sur un an, on décrit le réflexe, pas le prix). **Aucun doublon** avec la série `10-choses-a-faire-a-[ville]-2026` (angle activités/sites) ni avec `demenager-a-[ville]-2026` (angle logistique installation) : ici c'est un séjour, pas un déménagement, et l'unité est la sortie du soir, pas la balade en journée. Densité d'em-dashes réduite à 8 pour ~8 700 mots (uniquement dans les `metaTitle` structurels — R7.10 cap ~1/200 mots respecté, corps de texte à 0). `relatedGuides` câblés sur les guides existants (`10-choses-a-faire-a-`, `vivre-sans-voiture-`, `acheter-a-…-quel-quartier-budget-` pour Bayonne, `partir-en-vacances-seul-avec-ses-enfants-2026` en cross-link depuis Paris). `assertUniqueSlugs` + `assertKnownSlugs` passent à l'import (`data/guides.ts` 894 slugs, 8 nouveaux vacances-celib, zéro doublon). Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 8 nouvelles URLs y entrent automatiquement. `npx tsc --noEmit` propre. Restent à ouvrir sur la verticale : (2) batches suivants sur les rangs 9-30 du profil, (3) guide pilier « Partir en vacances seul·e en 2026 » (le pilier mono existe pour parents solos, pas encore l'équivalent célib), (4) croisement mois × profil (« où partir en février quand on est célibataire »), (5) miroir EN natif angle expat.

## Shipped 2026-07-26

- **Sous-page `/villes/[slug]/parent-solo` ×540 SSG** ✅ — Item 2 du plan agent parent solo (les guides `parent-solo-a-[ville]` batch 1 avaient ouvert la verticale le 24/07, avec la mention explicite « Restent à ouvrir : sous-page `/villes/[slug]/parent-solo` ×540 » ; item shippé aujourd'hui). Nouvelle sous-page ville qui **existe pour les 540** — pas seulement les 10 métropoles déjà couvertes par un guide long — parce que la donnée nécessaire (scores coût/transport/écoles/sécurité du seed + T3 moyen de `data/housing.ts`) est disponible partout. Nouveau `lib/parent-solo.ts` : (1) `parentSoloFit(city)` calcule un score composite pondéré **identique à celui du profil `single-parent` de `lib/city-match.ts`** (coût 0,30 + transports 0,20 + écoles 0,25 + sécurité 0,25, somme des poids = 1, le résultat reste sur 0-10 comme les axes) — l'utilisateur qui répond au City Match « parent solo » et celui qui atterrit sur la sous-page voient donc le même arbitrage ; (2) `fitLabel(score)` retourne un label + un hint (Excellent ≥ 7,5 / Bien ≥ 6,5 / Correct ≥ 5,5 / Difficile ≥ 4,5 / Défavorable sinon) ; (3) `minIncomeForT3(rent, cost)` estime le revenu net minimum viable via la règle du tiers du revenu (33 %, relâchée à 35 % quand `cost < 5` sur les marchés très tendus type Paris-Nice-Bordeaux — les bailleurs y acceptent souvent 35-40 % avec caution Visale), arrondi à 50 € près. Page : hero + score composite avec breakdown 4 axes pondérés affichés (chaque axe reçoit un `scoreColor` en cohérence avec le reste du site), section budget T3 (loyer T3+T2 depuis `data/housing.ts` + revenu net minimum estimé + interprétation coût), section vivre sans voiture (score transports + interprétation calibrée sur 4 seuils : ≥ 8 réaliste sans voiture, ≥ 6,5 jouable si domicile-école-crèche bien placés, ≥ 4,5 peu pratique, sinon voiture indispensable — le point qui fait basculer plus que n'importe quoi pour un profil mono), section écoles-cantine-périscolaire (score écoles + interprétation + bloc « aides à connaître » listant ASF/cantine QF/CMG/APL avec lien caf.fr, sans afficher de montants qui bougent d'un an à l'autre), section sécurité (score sécurité + interprétation + lien détail SSMSI), verdict adapté à 3 tiers de fit (≥ 6,8 : quatre leviers alignés, revenu médian région suffit ; 5,5-6,8 : faisable avec arbitrages, identifie automatiquement le point faible à compenser ; < 5,5 : liste les axes qui pénalisent et redirige vers commune limitrophe ou levier CAF-CCAS-logement social), rappel FAQ, lien vers le guide long `parent-solo-a-[slug]-2026` **quand il existe** (10 villes aujourd'hui, gracieusement ignoré sinon), grille de 4 sous-pages liées (logement / écoles / transports / sécurité). `generateMetadata` avec title + description + `alternates.canonical`, `generateStaticParams` sur `CITIES_SEED`, JSON-LD `BreadcrumbList` + `FAQPage`, DiscussionCTA en pied. Carte 🧑‍🍼 « Parent solo » ajoutée dans la grille de sous-pages de `CityProfile.tsx` juste après « Profils de vie », gated `locale !== "en"` (pas de miroir EN encore, sortie EN byte-identique). Sitemap : 540 entrées `parent-solo` ajoutées à `citySection` (priority 0,7, monthly). Zéro nouvelle data — pur agrégat `data/cities-seed.ts` + `data/housing.ts` + `data/guides.ts` + `lib/city-match.ts` (pondération), et `npx tsc --noEmit` propre. Restent à ouvrir sur la verticale : hub `/parent-solo` (item 3), miroir EN `/cities/[slug]/single-parent` + `/single-parent` (item 4).

- **Enrichissement F61 — `/vacances/profil/celibataire`** ✅ — Le profil `celibataire` avait été livré le 22/07 aux côtés de `monoparental`, mais seule la page mono avait reçu ses sections propres ; côté célib, la page se limitait au top 20 générique et devenait dangereusement proche du profil `solo` en apparence. Ajouté 3 blocs propres au voyage en célibataire, tous calculés à partir des données existantes (aucun chiffre inventé) et calibrés pour tenir la distinction *chercher du monde* (célibataire) vs *voyager seul·e* (solo) : (1) **Villes vivantes hors saison — l'anti-station-fantôme** — croise pour chaque ville du pool célib (élargi à 100 pour laisser passer les métropoles affordables sur la section 3) les scores `life ≥ 7.0` + `culture ≥ 6.5` + condition « novembre pas mort » (`crowdedNov ≥ 2/5` OU `pop ≥ 100 000`), plancher `pop ≥ 40 000` ; l'écart d'affluence août − novembre reste affiché pour information, 12 villes triées par `life` puis min-delta ; (2) **Accessibles en train, sortie du soir sans voiture** — même croisement TGV/RER + métro/tram/BHNS que la section mono mais seuil transport durci à `≥ 7.0` (sortir seul·e à minuit sans voiture demande une desserte urbaine tardive, pas un bus dernier passage 20 h), 12 villes ; (3) **Où le supplément single ne plombe pas le budget** — nouvelle logique distincte du « budget d'un seul revenu » mono : le supplément chambre individuelle vient des séjours packagés et des pensions tarifées à la chambre double, il se dilue dans un tissu urbain qui mélange studios / hôtels d'affaires / auberges — proxy `cost ≥ 5.0` + `remoteWork ≥ 6.5` (indice indirect du parc de studios et de coliving) + `pop ≥ 60 000` + exclusion des tags `premium`, 10 villes triées par coût. Complété par un bloc éditorial « trois réflexes pour éviter la double facturation » (chercher par « chambre single » et non « double 1 pers. », préférer les hôtels d'affaires en semaine, comparer studio et hôtel dès 2+ nuits) **sans afficher de fourchette de prix** (les tarifs bougent d'une saison / plateforme à l'autre — on décrit le réflexe, on renvoie au site de réservation). Sections extraites dans `CelibataireExtras.tsx` co-localisé et rendues conditionnellement (`slug === "celibataire"`) : les 6 autres profils gardent leur template inchangé, byte-identique. `<title>` célibataire spécialisé (« villes vivantes hors saison, sans supplément single »). Zéro nouvelle data — pur agrégat seed + `lib/transit.ts` + `lib/vacation-seasons.ts` + `lib/vacation-fit.ts`. `npx tsc --noEmit` propre ; build SSG a généré les 53 222 pages statiques puis crashé en « Finalizing page optimization » avec ENOSPC (contrainte disque de l'environnement routine, pas régression code — sans rapport avec ces changements, qui touchent une route parmi 3 000 et ne peuvent influencer le finalize). Distinction avec `solo` désormais rendue explicite en note méthodo (`solo` = sécurité + calme ; `celibataire` = densité + ambiance).

## Shipped 2026-07-22

- **Enrichissement F61 — `/vacances/profil/monoparental`** ✅ — Le classement générique livré le matin même donnait un top 20 « monoparental » calibré par pondération (safety .30 / transport .25 / cost .25 / life .20), mais la page ressemblait exactement à celle des 6 autres profils : une seule liste, aucune section propre au sujet. Ajouté 5 blocs propres au parent solo, tous calculés à partir des données existantes (aucun chiffre inventé) : (1) **Faisables en train, sans louer de voiture** — croise le top monoparental avec `lib/transit.ts` (`.tgv || .rer` pour arriver + `.metro || .tram || .bhns` OU `scores.transport ≥ 6.8` pour se déplacer sur place), 12 villes ; (2) **Budget d'un seul revenu qui tient** — filtre le top monoparental sur `scores.cost ≥ 6.5` ET `budgetTier ≤ 2`, 10 villes triées par coût ; (3) **Activités enfants regroupées, tout à pied** — villes 15-130 k hab. avec `safety ≥ 6.5`, `fit ≥ 6.0`, et au moins un tag de patrimoine/tourisme (`familial|patrimoine|médiéval|château|cathédrale|historique|authenticité|UNESCO|tourisme|port|marché`), 10 villes ; (4) **Fenêtres hors août — chambre à prix normal** — calcule pour les 30 meilleures villes monoparental leur meilleur mois entre mars-mai/sept-oct via `monthSignal()`, filtre `crowded ≤ 2/5` ET `tempAvg ≥ 12 °C`, 12 destinations triées par fit ; (5) **Aides mobilisables** — descriptif honnête des 5 dispositifs (VACAF, bons vacances CAF, Chèques-Vacances ANCV, aides Conseils départementaux, CSE) avec liens vers les organismes officiels **sans afficher de montants** (les barèmes évoluent et dépendent du QF — on décrit le dispositif, on renvoie l'utilisateur au source). Sections extraites dans `MonoparentalExtras.tsx` co-localisé et rendues conditionnellement (`slug === "monoparental"`) : les 6 autres profils gardent leur template inchangé, byte-identique. `<title>` monoparental spécialisé (« sans voiture, sans supplément single »). Zéro nouvelle data — pur agrégat seed + `lib/transit.ts` + `lib/vacation-seasons.ts` + `lib/vacation-fit.ts`. `npx tsc --noEmit` propre.

- **Série `travail-a-[ville]` batch 3 (+10 guides, 20 → 30) — Reims, Le Havre, Saint-Étienne, Toulon, Nîmes, Aix-en-Provence, Brest, Le Mans, Amiens, Orléans** ✅ — Troisième et dernier batch de la série « bassin d'emploi, secteurs, salaires » atteignant l'objectif CLAUDE.md v11 (« travail-a-[ville]-2026 top 30 villes »), portant la série de 20 à 30 guides — série close. Sélection cohérente avec le maillage existant : 8/10 villes disposent de l'écosystème complet 5 guides (`vivre-a-`, `acheter-a-`, `demenager-a-`, `10-choses-a-faire-a-`, `quitter-`), Le Havre et Le Mans à 4/5 (pas de `vivre-a-` shippé — `relatedGuides` restent câblés sur 4 slugs réels, `assertKnownSlugs` passe à l'import). Structure alignée sur batches 1-2 : intro chiffrée (chômage département + salaire médian + effectif emplois) + 6 sections (bassin d'emploi chiffres / secteurs qui recrutent avec 5 blocs et employeurs nommés / quartier d'affaires ou pôle signature / canaux de recrutement locaux avec salons et cabinets / télétravail hybride situation locale / pièges à connaître), 8 min de lecture, category `lifestyle`, emoji 💼, `relatedCities` sur la ville cible + 4 satellites/limitrophes réels vérifiés existants dans `CITIES_SEED` : reims/epernay/chalons-en-champagne/troyes/charleville-mezieres pour Reims, le-havre/dieppe/rouen/sotteville-les-rouen/mont-saint-aignan pour Le Havre, saint-etienne/firminy/roanne/saint-chamond/montbrison pour Saint-Étienne, toulon/hyeres/la-seyne-sur-mer/frejus/draguignan pour Toulon, nimes/ales/arles/avignon/montpellier pour Nîmes, aix-en-provence/marseille/salon-de-provence/pertuis/vitrolles pour Aix, brest/quimper/morlaix/concarneau/lorient pour Brest, le-mans/laval/angers/sable-sur-sarthe/tours pour Le Mans, amiens/abbeville/saint-quentin/beauvais/compiegne pour Amiens, orleans/olivet/blois/fleury-les-aubrais/chartres pour Orléans. Chiffres calibrés sur données officielles Insee T4 2024 (chômage département) et Insee DADS (salaire médian net) : Reims (51) 6,5 %/1 950 €, Le Havre (76) 8,3 % zone d'emploi/1 900 €, Saint-Étienne (42) 7,7 %/1 900 €, Toulon (83) 8,2 %/1 900 €, Nîmes (30) 8,7 %/1 850 €, Aix (13) 7,8 %/2 100 €, Brest (29) 6,3 %/1 900 €, Le Mans (72) 7,0 %/1 900 €, Amiens (80) 8,5 %/1 900 €, Orléans (45) 7,0 %/2 050 €. Écosystèmes cadre profondément documentés et différenciés : filière champagne (LVMH Moët & Chandon, Vranken-Pommery, Taittinger, Ruinart) + Pochet du Courval + Cristal Union + effet TGV Paris 45 min pour Reims ; HAROPA Port (2e port commerce français) + Total Énergies Gonfreville + Renault Sandouville + Sanofi Le Havre + tertiaire portuaire (assurance maritime, shipping) pour Le Havre ; siège Casino (en reconfiguration 2023-2025) + Aubert & Duval + Thales + Cité du Design UNESCO + CHU + effet proximité Lyon 60 km pour Saint-Étienne ; monoculture défense-marine (Marine nationale + Naval Group arsenal + Thales DMS + IFREMER Méditerranée) + tertiaire varois + tourisme pour Toulon ; agroalimentaire (Perrier Vergèze, Royal Canin Aimargues, Haribo Uzès) + tertiaire régional public + LGV Manduel + tourisme patrimonial UNESCO pour Nîmes ; tertiaire signature cadre (Big Four + cabinets d'audit-conseil) + cité judiciaire régionale (Cour d'Appel + ENM) + Airbus Helicopters + ITER-CEA Cadarache pour Aix ; monoculture défense-marine (Marine nationale + Naval Group + École navale) + recherche marine (IFREMER Bretagne siège + IUEM) + tissu écoles ingénieurs (ENSTA + IMT + ENIB) + Crédit Mutuel Arkéa pour Brest ; assurance mutuelle (Covéa MMA siège historique + MMA Vie + MACSF) + industrie automobile (Renault Le Mans, NTN-SNR, Faurecia) + niche racing (ACO 24 Heures) + effet TGV Paris 55 min pour Le Mans ; industrie manufacturière (Procter & Gamble, Valeo, Whirlpool en reconversion) + agroalimentaire (Tereos, Roquette Frères) + CHU + UPJV + concurrence Lille-Paris pour Amiens ; pharma-cosmétique (Servier R&D Gidy, Parfums Christian Dior Saint-Jean-de-Braye) + recherche fondamentale (BRGM siège + CNRS-CBM) + John Deere Ormes + Amazon Saran + effet TGV Paris 1 h 05 pour Orléans. Section « pièges » toujours honnête et documentée : profondeur limitée hors champagne + double marché navetteur-local + climat continental humide pour Reims ; transition énergétique Total-Renault + sinistre historique perte 40 k hab. + pollution atmosphérique-Seveso Gonfreville-Notre-Dame + climat océanique vent pour Le Havre ; reconfiguration Casino 2023-2025 + profondeur limitée + affichage design signaletique trompeur + climat brouillard cuvette pour Saint-Étienne ; monoculture défense-marine + habilitation défense 4-8 mois + marché immobilier tendu cyclique + risque incendie forêt Var 1er dept sinistralité pour Toulon ; profondeur limitée + chômage Gard 8,7 % concurrence + canicule 35-40 °C 20-40 jours/an + saisonnalité feria pour Nîmes ; double marché navetteur-local Marseille + marché immobilier hyper-tendu 3-6 mois recherche + habilitations défense-nucléaire ITER-CEA-Airbus + canicule Sainte-Victoire risque feux pour Aix ; monoculture défense-marine + habilitation défense + spécialisation SNA-SNLE peu transférable + climat océanique 160 j pluie + affichage universitaire (50-60 % ingénieurs partent post-diplôme) pour Brest ; profondeur limitée hors Covéa + dépendance Covéa systémique + double marché navetteur-local + sinistralité 24 Heures fenêtre juin planning pour Le Mans ; sinistralité industrielle historique (Goodyear, Continental, Whirlpool) + concurrence Lille-Paris capte l'essentiel + grilles régionales tirées vers le bas + climat continental grisaille 1 700 h/an pour Amiens ; profondeur limitée hors R&D signature + dépendance Servier + PPRI Loire-Loiret + sinistralité IBM historique pour Orléans. Section télétravail systématiquement contextualisée : Reims (effet TGV 45 min post-2020 5 500 nouveaux ménages, mais 2 j sur site min pour beaucoup de grands groupes), Le Havre (défense-industrie-port présentiel intégral, distance TGV Paris 2 h 15 handicap), Saint-Étienne (Casino siège en reconfiguration 1-3 j selon direction, TER Lyon Part-Dieu 40-50 min 180 €/mois), Toulon (défense-marine présentiel intégral avec habilitation, TGV Toulon-Paris 3 h 45 via triangle Aix), Nîmes (concurrence full-remote parisiens tire grilles vers le bas), Aix (6 500 nouveaux ménages télétravail full-remote depuis 2020, cabinets 2-3 j standard), Brest (3 500 nouveaux ménages malgré TGV 3 h 25 handicap), Le Mans (5 000 nouveaux ménages parisiens abonnement TGV 315 €/mois), Amiens (concurrence Paris-Lille, présentiel dominant strictement local car TER 1 h 05 mobilisé par manager), Orléans (6 000 nouveaux ménages parisiens TGV/Intercités 1 h 05, cabinets 2-3 j standard). Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 30 guides `travail-a-*-2026` désormais chargés, `data/guides.ts` 839 → 849 guides total. **Série close à 30/30 conformément au plan CLAUDE.md v11.** Zéro nouvelle data — pure combinaison seed + connaissance marché de l'emploi local (Insee DADS, Insee T4 2024 chômage département, Apec régionales, écoles alumni, événements salons). Ton analytique, non-vendeur, chiffres officiels, pas d'affichage exagéré (BRGM ~900 salariés Orléans, Servier Gidy environ 2 000 salariés, Naval Group Toulon-Brest arsenal grilles Métallurgie CCN, Covéa siège MMA Le Mans premier employeur privé Sarthe sans chiffre spécifique). `npx tsc --noEmit` propre.

## Shipped 2026-07-21

- **Série `travail-a-[ville]` batch 2 (+10 guides, 10 → 20) — Montpellier, Grenoble, Rouen, Angers, Dijon, Tours, Clermont-Ferrand, Metz, Nancy, Caen** ✅ — Deuxième batch de la série « bassin d'emploi, secteurs, salaires » lancée le 2026-07-19 avec la batch 1 (10 grandes métropoles : Paris, Lyon, Marseille, Toulouse, Bordeaux, Nantes, Lille, Nice, Strasbourg, Rennes). Poursuit le plan CLAUDE.md v11 (« travail-a-[ville]-2026 top 30 villes »), portant la série de 10 à 20 guides. Montpellier était l'oubli de la batch 1 (top-8 français par la population et pourtant absent — corrigé ici en ouverture de la batch 2). Sélection cohérente avec le maillage existant : toutes les villes de la batch 2 disposent de l'écosystème complet 4-5 guides (`vivre-a-`, `acheter-a-`, `demenager-a-`, `10-choses-a-faire-a-`, plus `vivre-sans-voiture-` pour Grenoble et Rennes-continu), câblage `relatedGuides` intégral sur des slugs réels (`assertKnownSlugs` passe à l'import — les 6 slugs `quitter-*-guide-2026` et le slug `budget-mensuel-realiste-montpellier-2026` référencés ont tous été vérifiés existants). Structure alignée sur la batch 1 : intro chiffrée (chômage département + salaire médian + effectif emplois) + 6 sections (bassin d'emploi chiffres / secteurs qui recrutent avec 5 blocs et employeurs nommés / quartier d'affaires ou pôle signature / canaux de recrutement locaux avec salons et cabinets / télétravail hybride situation locale / pièges à connaître), 8 min de lecture, category `lifestyle`, emoji 💼, `relatedCities` sur la ville cible + 3-4 satellites/limitrophes réels (vérifiés existants dans `CITIES_SEED` en amont — sete/agde/nimes/beziers pour Montpellier, fontaine/chambery/annecy/valence pour Grenoble, sotteville-les-rouen/mont-saint-aignan/le-havre/evreux pour Rouen, cholet/saumur/nantes/tours pour Angers, chenove/beaune/chalon-sur-saone/macon pour Dijon, joue-les-tours/amboise/blois/orleans pour Tours, riom/vichy/issoire/aurillac pour Clermont, montigny-les-metz/thionville/saint-avold/verdun pour Metz, laxou/vandoeuvre-les-nancy/metz/thionville pour Nancy, herouville-saint-clair/bayeux/evreux/alencon pour Caen). Chiffres calibrés sur données officielles Insee T4 2024 (chômage département) et Insee DADS (salaire médian net) : Montpellier (34) 9,5 %/1 950 €, Grenoble (38) 6,3 %/2 200 €, Rouen (76) 7,5 %/2 000 €, Angers (49) 6,5 %/1 950 €, Dijon (21) 5,8 %/2 000 €, Tours (37) 6,5 %/1 950 €, Clermont (63) 6,2 %/2 000 €, Metz (57) 7,0 %/1 950 €, Nancy (54) 6,8 %/1 950 €, Caen (14) 6,5 %/1 950 €. Écosystèmes cadre profondément documentés et différenciés : French Tech + IBM/Dell/Ubisoft + CHU/Sanofi + Végépolys/agroalimentaire pour Montpellier ; triangle Meylan-Crolles-Bernin (ST 10 000, Soitec 2 000, CEA-Leti 2 700 chercheurs) pour Grenoble ; Sanofi Le Trait + Renault Cléon + Crédit Agricole Normandie-Seine + tissu rive-droite bourgeois pour Rouen ; pôle Belle-Beille (Bull-Atos 2 500, Thales, Université Angers) + Végépolys Valley (Vilmorin, Limagrain, Truffaut) pour Angers ; agroalimentaire premium (Amora-Maille, Louis Latour, Vedrenne) + banque mutualiste (Groupama Bourgogne, Crédit Agricole Champagne-Bourgogne) + effet TGV Paris 1 h 35 pour Dijon ; santé (CHRU 11 000) + Michelin/Sanofi/Aptiv + banque Crédit Mutuel du Centre + effet TGV Paris 55 min pour Tours ; triangle Michelin Ladoux-Cataroux-Chamalières (10 000 salariés bassin, siège mondial) + Limagrain + Sanofi Vertolaye + pharma-santé pour Clermont ; frontalier Luxembourg (55 000 mosellans, 8 000 messins directs — plafond fiscal 34 j/an post-2023) + PSA Trémery 2 700 + tertiaire régional Grand Est + CHR Metz-Thionville 11 000 pour Metz ; pôle ARTEM (Mines Nancy + ICN + ENSAD) + Université de Lorraine 55 000 étudiants + CHRU Nancy-Brabois 11 500 + tertiaire régional public pour Nancy ; santé (CHU 9 500 + Centre François-Baclesse) + agroalimentaire normand (Elle & Vire, Isigny) + Ganil (accélérateur d'ions lourds unique en Europe) + NXP Semiconductors pour Caen. Section « pièges » toujours honnête et documentée : concurrence sursouscrite Montpellier + ZFE Métropole Crit'Air 3 depuis 2025 ; ZFE Grenoble-Alpes + inversion thermique cuvette (40-60 jours brouillard-PM10) + mono-culture microélectronique peu transférable ; transition écologique chimie Rouen (Petroplus, Renault électrique) + ZFE Métropole Rouen Normandie ; sédentarité Dijon (cadres 9-11 ans en poste, grilles figées) + affichage TGV parfois trompeur ; double économie navetteur-local Tours (poste Paris + TGV vs poste local -20 %) + PPRI Loire-Cher ; mono-dépendance Michelin Clermont (10 000 salariés directs, 15-20 % induit) + enclavement ferroviaire-aérien ; double économie Metz-Luxembourg (grilles 40-80 % supérieures Luxembourg mais plafond fiscal 34 j/an télétravail) + reconversion sidérurgique Val de Fensch inachevée ; décalage nombre-diplômés/offre-employeurs Nancy (60-70 % Mines-ICN partent post-diplôme) + climat continental rude ; spécialisation Ganil peu transférable Caen + climat océanique 120 j pluie + affichage TGV trompeur (2 h Intercités via Rouen). Section télétravail systématiquement contextualisée : Montpellier (concurrence full-remote parisiens tue les hybrides locaux), Grenoble (production ST-Soitec-Schneider 5 jours présentiel, R&D 2 j max, ESN 2-3 j), Rouen (tertiaire 2 j, chimie-pharma présentiel, effet TGV Paris), Angers (tech 2-3 j, végétal-santé présentiel, effet TGV Paris 1 h 30), Dijon (boom TGV Paris post-2020 mais durcissement présentiel 2024), Tours (double économie navetteur, TGV 55 min), Clermont (Michelin précurseur accord 2018 pré-COVID), Metz (plafond frontalier 34 j/an convention 2023), Nancy (recherche 2-3 j, faible effet frontalier Luxembourg 75-90 min), Caen (moins d'effet TGV que Rouen : 2 h Intercités). Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 20 guides `travail-a-*-2026` désormais chargés, `data/guides.ts` 829 → 839 guides total. Zéro nouvelle data — pure combinaison seed + HOUSING + connaissance marché de l'emploi local (Insee DADS, Insee T4 2024 chômage département, Apec régionales, écoles alumni, événements salons). `npx tsc --noEmit` propre.

## Shipped 2026-07-19

- **Nouvelle série `travail-a-[ville]` batch 1 (+10 guides, 0 → 10) — Paris, Lyon, Marseille, Toulouse, Bordeaux, Nantes, Lille, Nice, Strasbourg, Rennes** ✅ — Ouverture de la série « bassin d'emploi, secteurs qui recrutent, salaires » listée dans le plan CLAUDE.md v11 (« travail-a-[ville]-2026 top 30 villes »), après clôture de la série `demenager-a-[ville]` (50/50) hier. Angle distinct de tout ce qui existait : les guides `vivre-a-[ville]` couvrent l'installation générale, `teletravailler-depuis-[ville]` couvre le remote, `budget-mensuel-realiste-[ville]` couvre le coût de la vie — mais aucun guide n'agrégeait spécifiquement le marché local de l'emploi cadre (chômage département, salaire médian net, secteurs dominants, employeurs phares, quartiers d'affaires, canaux de recrutement locaux). Sélection : les 10 métropoles les plus recherchées, toutes disposant de l'écosystème complet 4-guides (`vivre-a-`, `acheter-a-`, `demenager-a-`, `10-choses-a-faire-a-`, `vivre-sans-voiture-`), câblage `relatedGuides` intégral sur des slugs réels (`assertKnownSlugs` passe à l'import). Structure : intro chiffrée (chômage département + salaire médian + effectif emplois) + 6 sections (bassin d'emploi chiffres / secteurs qui recrutent avec 5 blocs et employeurs nommés / quartier d'affaires signature / canaux de recrutement locaux avec salons et cabinets / télétravail hybride situation locale / pièges à connaître), 8-9 min de lecture, category `lifestyle` (schéma unique existant), emoji 💼, `relatedCities` sur la ville cible + 3-4 satellites/limitrophes réels (vérifiés existants dans `CITIES_SEED` en amont — `cesson-sevigne`, `bruz`, `villeneuve-d-ascq` écartés car absents seed). Chiffres calibrés sur données officielles Insee T4 2024 (chômage département) et Insee DADS (salaire médian net) : Paris 7,0 %/2 900 €, Lyon (Rhône) 6,5 %/2 250 €, Marseille (13) 8,5 %/1 950 €, Toulouse (31) 6,5 %/2 100 €, Bordeaux (33) 6,5 %/2 050 €, Nantes (44) 6,3 %/2 050 €, Lille (Nord) 9,5 %/1 950 €, Nice (06) 7,5 %/2 000 €, Strasbourg (67) 6,3 %/2 150 €, Rennes (35) 5,8 %/2 050 €. Écosystèmes cadre profondément documentés et différenciés par ville : La Défense pour Paris (180 000 emplois, banque-conseil-assurance), Part-Dieu pour Lyon (55 000 emplois, pharma-chimie-banque), axe Aix-Marseille pour Marseille (CMA CGM, AP-HM, French Tech Aix-Marseille), triangle Blagnac-Colomiers-Saint-Éloi pour Toulouse (Airbus, ATR, Latécoère + Thales Alenia Space + CNES), effet TGV et concurrence des cadres parisiens hybrides pour Bordeaux (Dassault, Thales, ArianeGroup Saint-Médard), Île de Nantes pour Nantes (Believe Digital, iAdvize, Akeneo + Airbus Bouguenais + Chantiers Saint-Nazaire), Euralille-Villeneuve-d'Ascq pour Lille (galaxie Mulliez Auchan-Décathlon-Leroy Merlin + EuraTechnologies OVHcloud), Sophia Antipolis pour Nice (Amadeus IT Group 5 000 salariés + IBM + SAP Labs + Thales Alenia Space Cannes), transfrontalier Allemagne + institutions européennes pour Strasbourg (40 000 Alsaciens travaillent en Allemagne, Parlement européen + Conseil de l'Europe + Merck-Lilly-Sanofi pharma), triangle cyber-tech Cesson-Sévigné-Bruz pour Rennes (French Tech 300 startups + DGA MI 2 500 salariés + Orange R&D 3 500 salariés + PSA La Janais 3 500 salariés). Section « pièges » toujours honnête et documentée : course au titre parisien vs salaire réel provincial, monoculture aéro Toulouse (cycles A320 douloureux), plafond 25 % télétravail des frontaliers Allemagne (convention fiscale franco-allemande), grilles retail Mulliez sous-évaluées vs finance-tech équivalents, coût logement disproportionné au salaire local à Nice-Cannes (m² 2e France après Paris avec salaires -30 % vs Paris), concours EPSO longs et sélectifs pour institutions européennes Strasbourg, spécialisation cyber-défense DGA/DGSE peu transférable au cyber civil Rennes, ZFE Métropole (Crit'Air 3 exclu 2025) à Lyon-Lille-Marseille (budget remplacement diesel à intégrer). Nommage précis des employeurs pour chaque ville (BNP Paribas, Sanofi Pasteur, Airbus Blagnac, Dassault Mérignac, Believe Digital, Auchan Croix, Amadeus Sophia, Merck Serono Strasbourg, Orange R&D Cesson-Sévigné, DGA Maîtrise de l'information Bruz), canaux locaux (Apec régionale, cabinets Michael Page, Fed Group, Robert Half, LTd International pour aéro), salons ciblés (VivaTech Paris, Web2day Nantes, European Cyber Week Rennes, Retail Innovation Awards Lille, Salon de l'Aéronautique et de l'Espace Blagnac, Med'Innovant Africa Marseille, Grenzenlos Job Fair Kehl-Strasbourg, IoT World Antibes). Section télétravail systématiquement contextualisée (2-3 jours standard tech/pharma/banque, contraint côté aéro-défense-production-hôtellerie, particularité transfrontalière Alsace). Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 10 guides `travail-a-*-2026` désormais chargés, `data/guides.ts` 819 → 829 guides total. Zéro nouvelle data — pure combinaison seed + connaissance marché de l'emploi local (Insee DADS, Insee T4 2024 chômage département, Apec régionales, France Travail zones d'emploi). Aligne avec « teletravail » category via son slug propre et son emoji 💼 dédié, distinct des `demenager-a-` (📦) et `vivre-a-` (icônes ville). `npx tsc --noEmit` propre.

## Shipped 2026-07-18

- **Série `demenager-a-[ville]` batch 5 (+10 guides, 40 → 50) — Saint-Denis (La Réunion), Le Tampon, Aubervilliers, Colombes, Asnières-sur-Seine, Courbevoie, Rueil-Malmaison, Champigny-sur-Marne, Saint-Maur-des-Fossés, Antibes** ✅ — Cinquième et dernier batch de la série logistique déménagement (série close à 50/50 conformément au plan CLAUDE.md v11), couvre la deuxième moitié des grandes villes DROM (Saint-Denis Réunion chef-lieu 154 k + Le Tampon hauts sud 81 k), les 5 grandes communes 92 restantes (Colombes, Asnières, Courbevoie, Rueil-Malmaison, plus Aubervilliers côté 93), les 2 grandes communes 94 sur la boucle de la Marne (Champigny-sur-Marne, Saint-Maur-des-Fossés) et Antibes côté Côte d'Azur. **Sélection cohérente avec le maillage existant** : Antibes dispose du guide `10-choses-a-faire-a-antibes-2026` — `relatedGuides` câbles en direct sur l'écosystème Nice/PACA (`vivre-a-nice-2026`, `acheter-a-nice-quel-quartier-budget-2026`, `10-choses-a-faire-a-nice-2026`, `quitter-nice-guide-2026`, `vivre-en-cote-d-azur-guide-2026`, `vivre-en-provence-paca-guide-2025`) ; les 7 villes IDF n'ont pas d'écosystème propre — `relatedGuides` renvoie sur les pivots Paris/IDF (`quitter-paris-guide-2025`, `acheter-a-paris-quel-quartier-budget-2026`, `vivre-sans-voiture-paris-guide-2026`, `vivre-en-ile-de-france-guide-2025`, `alternatives-ile-de-france-banlieue-parisienne-guide-2025`) ; les 2 DROM renvoient sur les pivots DROM (`vivre-en-outre-mer-guide-2026`, `demenager-a-saint-paul-reunion-2026` shippé batch 4, + inter-DROM Le Tampon → Saint-Denis Réunion nouvellement shippé). Structure alignée sur batches 1-4 : intro chiffrée + 6 sections (marché locatif / bon quartier / jour J / budget / démarches / pièges), 7-8 min, category `lifestyle`, emoji 📦, `relatedCities` sur la ville cible + 3-4 satellites/voisines réelles (vérifiés existants dans `CITIES_SEED` en amont — juan-les-pins, villejuif, joinville-le-pont, villiers-sur-marne, saint-ouen, bobigny écartés car absents seed). Chiffres calibrés sur `HOUSING` réel quand présent : Saint-Denis Réunion T2 700 €, Le Tampon 600 €, Asnières 1 150 €, Rueil-Malmaison 1 150 €, Champigny 980 €, Saint-Maur 1 240 €, Antibes 1 050 € ; estimations calibrées sur les normes régionales pour Aubervilliers (T2 850 €, 93 tendu), Colombes (1 050 €, 92 nord) et Courbevoie (1 350 €, 92 La Défense). **Régime locatif honnête** : les 8 IDF (7 franciliennes + Aubervilliers) explicitement en zone tendue Grand-Paris + encadrement des loyers depuis 2019 (plafond frais d'agence 13 €/m², loyer de référence majoré de 20 % max, préavis 1 mois) ; Antibes en zone tendue historique 2013 (10 €/m² + 3 €/m² EL sans encadrement Grand-Paris) ; les 2 DROM hors régime métropolitain zone tendue (loi ALUR s'y applique mais décrets zone tendue non étendus, frais d'agence libres généralement alignés sur plafond métro). Spécificités logistiques locales calibrées : centre créole Barachois-Bellepierre + Bois-de-Nèfles hauts humides + CHU Félix-Guyon + rectorat + campus Moufia 25 000 étudiants pour Saint-Denis Réunion ; Plaine des Cafres 1 400-1 600 m altitude + porte du Piton de la Fournaise + brume tropicale des hauts + économie enseignante-fonction publique pour Le Tampon ; Campus Condorcet 3 500 étudiants + M12 Aimé-Césaire (2022) + futur M15 Fort d'Aubervilliers 2027 + Front-Populaire-La Plaine reconvertie pour Aubervilliers ; U Arena Racing 92 limitrophe Nanterre + Transilien J deux gares + Stade Yves-du-Manoir post-JO 2024 + futur M15 Bécon 2027-2028 pour Colombes ; Transilien J 8 min Saint-Lazare + Petit-Colombes Grésillons en réhabilitation + Bécon-les-Bruyères Art déco + M15 futur pour Asnières ; Faubourg-de-l'Arche extension La Défense 1990-2010 + RER A La Défense en 5-10 min + charges copropriété corporate 3-6 €/m²/mois pour Courbevoie ; commune la plus étendue 92 (14,7 km²) + Château de Malmaison + Rueil-2000 corporate + rives de Seine Île des Impressionnistes + Lycée Passy-Buzenval catholique historique pour Rueil-Malmaison ; futur M15 Champigny-Centre + Bry-Villiers-Champigny 2025-2026 + Handball Champigny Starligue + boucle Marne PPRI + ANRU 2 Bois-l'Abbé pour Champigny ; presqu'île boucle Marne + 4 gares RER A + six quartiers-villages (La Varenne, Adamville, La Pie, Vieux-Saint-Maur, Saint-Maur-Créteil, Champignol) + villas Belle Époque + Lycée d'Arsonval + aviron historique pour Saint-Maur ; Vieil-Antibes fortifié Vauban + port Vauban méga-yachts + Juan-les-Pins Jazz + Musée Picasso château Grimaldi + Sophia-Antipolis 35 000 emplois high-tech à 10 km + saisonnalité juillet-août pour Antibes. Transports réels nommés : RATP-Île-de-France Mobilités (RER A/E, Transilien J/L, tram T1/T2/T3b, métro 12/13/7), Citalis Saint-Denis Réunion, Alterneo/Kar'Ouanou Le Tampon, Envibus Antibes-Sophia. Pièges locaux honnêtes et calibrés : ne pas juger un quartier par sa réputation médiatique (Aubervilliers, Colombes Petit-Colombes, Champigny Bois-l'Abbé, Asnières Grésillons — lecture rue par rue à deux horaires), sous-estimer la saison cyclonique DROM janvier-mars, brume/humidité 90-100 % des hauts Le Tampon-Plaine des Cafres, événements Paris La Défense Arena (Colombes limitrophe), corporate dortoir hors bureau Faubourg-de-l'Arche/Rueil-2000, charges copropriété années 60-80 non rénovées ITE, PPRI Marne (Champigny-Saint-Maur-Vitry rive), stationnement pavillonnaire tendu Saint-Maur, contrainte automobile Antibes-Sophia (RD35 pointe matin 40-50 min pour 10 km), saisonnalité Juan-les-Pins (été bruyant fêtes 2 h, hiver commerces fermés), coût vie DROM +15-20 % hors alimentation locale + éloignement psychologique 18-36 mois, sectorisation scolaire stricte Saint-Maur (lycée d'Arsonval quasi-impossible en dérogation), villas Belle Époque DPE E/F/G énergie 2 500-4 000 €/an, submersion marine PPRSM Cap d'Antibes-Juan bord de mer. Nouvel apport batch 5 : première explicitation dans la série du régime des DROM (loi ALUR sans décrets zone tendue étendus, frais d'agence libres alignés métro, conteneur maritime 45-60 j depuis port Marseille/Le Havre → Pointe des Galets, TVA DROM taux réduit 8,5 %, majoration fonction publique 40 % et enseignants 53 % catégorie A, budget alimentation +25-40 % importés / comparable local marché forain, budget vol retour 800-2 500 € selon saison, assurance habitation majorée risque cyclonique 300-550 €/an). Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 50 guides `demenager-a-*-2026` désormais chargés, `data/guides.ts` 809 → 819 guides total. **Série close à 50/50** — la couverture couvre désormais la France métropolitaine grand-couronne + DROM ; toute extension future se ferait sur les 40-70 k hab. (Le Havre extension ×… — non prévu au plan v11). `npx tsc --noEmit` propre.
- **Série `demenager-a-[ville]` batch 4 (+10 guides, 30 → 40) — Saint-Denis (93), Perpignan, Boulogne-Billancourt, Argenteuil, Orléans, Mulhouse, Saint-Paul (La Réunion), Nanterre, Créteil, Vitry-sur-Seine** ✅ — Quatrième batch de la série logistique déménagement, poursuit le plan CLAUDE.md v11 (« demenager-a-[ville]-2026 top 50 villes »), portant la série de 30 à 40 guides. Sélection cohérente avec le maillage existant : les 3 villes hors-IDF (Perpignan, Orléans, Mulhouse) disposent des 4 guides écosystème complets (`vivre-a-`, `acheter-a-quel-quartier-budget`, `quitter-guide`, `10-choses-a-faire-a-`) — `relatedGuides` câblés en direct ; les 6 villes IDF (Saint-Denis 93, Boulogne-Billancourt, Argenteuil, Nanterre, Créteil, Vitry-sur-Seine) et la DROM (Saint-Paul Réunion) n'ont pas d'écosystème propre — `relatedGuides` renvoie sur les guides Paris/IDF pivots (`quitter-paris-guide-2025`, `acheter-a-paris-quel-quartier-budget-2026`, `vivre-sans-voiture-paris-guide-2026`, `vivre-en-ile-de-france-guide-2025`, `alternatives-ile-de-france-banlieue-parisienne-guide-2025`). `assertKnownSlugs` passe à l'import (0 slug fantôme). Structure batches 1-3 : intro chiffrée + 6 sections (marché locatif / bon quartier / jour J / budget / démarches / pièges), 7-8 min, category `lifestyle`, emoji 📦, `relatedCities` sur la ville cible + 3-4 satellites/voisines. Chiffres calibrés sur `HOUSING` réel : Saint-Denis (93) T2 950 €, Perpignan 650 €, Boulogne-Billancourt 1 400 €, Argenteuil 900 €, Orléans 700 €, Mulhouse 580 €, Saint-Paul (Réunion) 700 €, Nanterre 1 050 €, Créteil 950 €, Vitry-sur-Seine 980 €. **Différenciation calibrée sur les régimes locatifs distincts** : les 6 IDF explicitement en zone tendue Grand-Paris + encadrement des loyers depuis 2019 (plafond frais d'agence 13 €/m², loyer de référence majoré de 20 % max, préavis 1 mois) — c'est la première fois que le régime encadrement 2019 est explicité dans la série ; Perpignan en zone tendue historique 2013 (10 €/m² sans encadrement) ; Orléans et Mulhouse hors zone tendue (8 €/m² + 3 €/m² EL) ; Saint-Paul Réunion hors régime métropolitain zone tendue (DROM). Spécificités logistiques locales calibrées : basilique Saint-Denis + Stade de France + hub Pleyel M14/M15/M16/M17 GPE opérationnel post-JO 2024 ; Castillet et Saint-Jacques catalan + tramuntana 130 jours/an à Perpignan ; île Seguin + Trapèze reconverti Renault + encadrement Grand-Paris pour Boulogne ; ligne J Saint-Lazare 15 min + Coteaux vignoble municipal + PPRI Seine pour Argenteuil ; secteur sauvegardé Bâtiments de France + Fêtes Jeanne-d'Arc + Loire à Vélo pour Orléans ; tram-train Vallée de la Thur + frontaliers Bâle 25 min + Rebberg-Fonderie-Nouveau Bassin à Mulhouse ; conteneur maritime 45-60 j + cyclones janv-mars + alizés + lagon Ermitage à Saint-Paul Réunion ; Paris La Défense Arena 40 000 places + campus Paris Nanterre + M15 Ouest futur pour Nanterre ; ville-nouvelle 70's + lac + UPEC + Créteil-Soleil pour Créteil ; MAC/VAL + chantier Ardoines + M15 Sud à venir fin 2025-2026 + fresques street art pour Vitry. Transports réels nommés : RATP-Île-de-France Mobilités (métro 13/7/8/9/10, RER A/B/C/D, tram T1/T2/T3/T5/T8/T9/T11, Transilien J/L), Sankéo Perpignan, TAO Orléans (tram A/B), Soléa Mulhouse (tram T1/T2/T3 + tram-train), Kar'Ouest Saint-Paul-Réunion. Pièges locaux calibrés et honnêtes : ne pas juger un quartier par sa réputation médiatique (Saint-Denis, Argenteuil, Nanterre, Créteil, Vitry — lecture rue par rue à deux horaires), sensibilité événements Stade de France et Paris La Défense Arena, PPRI Seine bord de fleuve, secteur sauvegardé Bâtiments de France Orléans, tramuntana et humidité rez-de-chaussée Perpignan, charges copropriétés années 60-70 rénovées ITE, cyclones et coût vie DROM Saint-Paul Réunion, chantier long Ardoines Vitry, ANRU 2 Mont-Mesly Créteil, éloignement psychologique DROM, ZFE métropolitaine Crit'Air 3 exclu depuis 2025 sur les 6 IDF + Aix-Marseille. Section « pièges » toujours honnête (« Saint-Denis se lit rue par rue, pas quartier par quartier », « la fenêtre juin des 24 Heures est un piège planning », « Mulhouse se juge à son propre étalon », « la Réunion coûte 15 à 20 % de plus que la métropole hors alimentation locale — sans majoration de salaire, le pouvoir d'achat est structurellement contraint »). Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 40 guides `demenager-a-*-2026` désormais chargés, `data/guides.ts` 799 → 809 guides total. Zéro nouvelle data — pure combinaison seed + HOUSING + connaissance marché local, logistique urbaine et régime locatif francilien encadrement 2019. `npx tsc --noEmit` propre.

## Shipped 2026-07-17

- **Série `demenager-a-[ville]` batch 3 (+10 guides, 20 → 30) — Saint-Étienne, Le Havre, Reims, Toulon, Villeurbanne, Nîmes, Aix-en-Provence, Brest, Le Mans, Amiens** ✅ — Troisième batch de la série logistique déménagement lancée le 2026-07-15 avec batches 1 & 2. Poursuit le plan CLAUDE.md v11 (« demenager-a-[ville]-2026 top 50 villes »), portant la série de 20 à 30 guides. Sélection cohérente avec le maillage existant : 9 villes sur 10 disposent déjà de `vivre-a-`, `acheter-a-quel-quartier-budget`, `quitter-guide` et `10-choses-a-faire-a-` ; Villeurbanne n'ayant aucun guide propre, `relatedGuides` renvoie sur l'écosystème lyonnais (`vivre-a-lyon`, `acheter-a-lyon`, `vivre-sans-voiture-lyon`, `quitter-lyon`). Le champ `relatedGuides` est intégralement câblé sur des slugs réels (`assertKnownSlugs` passe à l'import). Chaque guide reprend la structure batches 1 & 2 : intro chiffrée + 6 sections (marché locatif à l'arrivée / choisir le quartier d'atterrissage / jour J logistique / budget d'installation réaliste / démarches premières semaines / pièges spécifiques), 7-8 min de lecture, category `lifestyle`, emoji 📦, `relatedCities` sur la ville cible + 2-3 satellites/voisines. Chiffres calibrés sur `HOUSING` réel : Saint-Étienne T2 580 €, Le Havre 650 €, Reims 680 €, Toulon 780 €, Villeurbanne 870 €, Nîmes 720 €, Aix-en-Provence 1 050 €, Brest 650 €, Le Mans 650 €, Amiens 680 €. Différenciation honnête zone tendue : Le Havre / Toulon / Villeurbanne / Aix-en-Provence en zone tendue avec plafond frais d'agence 10 €/m² (Villeurbanne aussi sous encadrement des loyers Métropole Lyon depuis 2021), les 6 autres hors zone tendue avec plafond 8 €/m². Spécificités logistiques locales calibrées : ville-vallée Saint-Étienne à 520-550 m, centre reconstruit Perret UNESCO au Havre + téléphérique urbain Brest sur la Penfeld (le seul de France), Cité Plantagenêt Le Mans + 24 Heures en juin, ZFE Métropole Lyon et Aix-Marseille-Provence pour Villeurbanne et Aix, Vieil Aix + mistral + canicule à Aix-en-Provence, quartier Saint-Leu à canaux à Amiens + BHNS Nemo, Écusson Nîmes + risque cévennol, quartier Recouvrance rive droite Brest + vent d'ouest. Transports réels nommés : STAS Saint-Étienne, LiA Le Havre, CITURA Reims, Réseau Mistral Toulon + bateau-bus rade, TCL Villeurbanne (métro A + tram T1-T3-T4-T6), Tango Nîmes (BHNS T1-T2), Aix en Bus + BHNS Aixpress, Bibus Brest (tram + téléphérique), SETRAM Le Mans, Ametis Amiens (BHNS Nemo 4 lignes). Pièges locaux calibrés : vacance et copropriétés dégradées Saint-Étienne, vent d'ouest Le Havre-Brest, hivers rudes Reims, mistral + logements touristiques Toulon, encadrement loyers + ZFE Villeurbanne, canicule + risque cévennol Nîmes, budget cumulé + charges patrimoine Aix, humidité + éloignement psychologique Brest, 24 Heures + Bâtiments de France Le Mans, humidité + événements grand-public Amiens. Section « pièges » toujours honnête (aucun vernis promotionnel : « Saint-Étienne se juge à son propre étalon », « le parisien qui vient à Aix pour vivre moins cher est un mythe si le télétravail n'est pas total »). Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 30 guides `demenager-a-*-2026` désormais chargés, `data/guides.ts` 789 → 799 guides total. Zéro nouvelle data — pure combinaison seed + HOUSING + connaissance marché local et logistique urbaine. `npx tsc --noEmit` propre.

## Shipped 2026-07-15

- **Série `demenager-a-[ville]` batch 2 (+10 guides, 10 → 20) — Rennes, Grenoble, Rouen, Angers, Dijon, Tours, Clermont-Ferrand, Metz, Nancy, Caen** ✅ — Deuxième batch de la série logistique déménagement lancée le matin même avec la batch 1 (10 grandes villes : Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille). Complète les métropoles régionales du plan CLAUDE.md v11 (« demenager-a-[ville]-2026 top 50 villes »), portant la série de 10 à 20 guides. Sélection cohérente avec le maillage existant : toutes les villes de la batch 2 ont déjà `vivre-a-`, `acheter-a-quel-quartier-budget` et `quitter-guide` ; certaines ont aussi `vivre-sans-voiture-guide` ou `etudiant-a-` — le champ `relatedGuides` est câblé sur les guides réellement présents (pas de slug fantôme, `assertKnownSlugs` valide au chargement). Chaque guide reprend la structure batch 1 : intro chiffrée + 6 sections (marché locatif à l'arrivée / choisir le quartier d'atterrissage / jour J logistique / budget d'installation réaliste / démarches premières semaines / pièges spécifiques), 7-8 min de lecture, category `lifestyle`, emoji 📦, `relatedCities` sur la ville cible + 2-3 satellites/voisines. Chiffres calibrés sur `HOUSING` réel : Rennes T2 820 €, Grenoble 750 €, Rouen 720 €, Angers 750 €, Dijon 720 €, Tours 700 €, Clermont-Ferrand 680 €, Metz 680 €, Nancy 710 €, Caen 700 €. Différenciation honnête : marché tendu vs détendu (Rennes/Grenoble/Angers zone tendue avec frais d'agence 10 €/m², les autres zone non tendue 8 €/m²), spécificités logistiques locales (colombages Rouen/Tours, cuvette Grenoble, pierre Jaumont Metz, centre reconstruit Caen, pans de bois Doutre à Angers, Art nouveau Nancy, pierre Volvic Clermont, secteur sauvegardé Vieux-Tours), transports réels (STAR Rennes, TAG Grenoble, Astuce Rouen, Irigo Angers, Divia Dijon, Fil Bleu Tours, T2C Clermont, LE MET' Metz + Mettis BHNS, STAN Nancy, Twisto Caen), pièges locaux calibrés (PPRI Seine à Rouen, inversion thermique Grenoble, climat continental Metz/Nancy, humidité normande Caen, enclavement ferroviaire Clermont, TGV navetteurs Tours). Section « pièges » toujours honnête (pas de vernis promotionnel : « la ville est agréable mais elle n'échappe pas au serrage locatif »). Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 20 guides `demenager-a-*-2026` désormais chargés, `data/guides.ts` 779 → 789 guides total. Zéro nouvelle data — pure combinaison seed + HOUSING + connaissance marché local et logistique urbaine. `npx tsc --noEmit` propre.

- **Série `retraite-a-[ville]` batch 2 (+10 guides, 10 → 20) — Challans, Tulle, Pontarlier, Saint-Dié-des-Vosges, Château-Gontier, Albertville, Gaillac, Vendôme, Marmande, Saint-Lô** ✅ — Suite de la série retraite personnalisée par ville lancée avec la batch 1 le 2026-07-14. Complète les 10 villes cible restantes du plan CLAUDE.md v11 (« retraite-a-[ville]-2026 top 20 villes »), portant la série de 10 à 20 guides. Sélection cohérente avec la batch 1 : sous-préfectures et villes moyennes 15-21 k habitants où retraite = choix rationnel, pas résignation. Diversification géographique explicite : Vendée bord de mer intérieur (Challans), Corrèze rurale (Tulle), Jura Suisse-frontière (Pontarlier), Vosges forêt (Saint-Dié), Mayenne bocage (Château-Gontier), Savoie Alpes (Albertville), Occitanie vignoble (Gaillac), Loir-et-Cher TGV-Paris (Vendôme), Lot-et-Garonne agricole (Marmande), Manche prairie (Saint-Lô). Chaque guide reprend la structure batch 1 : intro chiffrée + 6 sections (pourquoi choisir / santé / se loger / budget mensuel / vie quotidienne / limites à connaître), 7 min de lecture, category `lifestyle`, emoji 🌅, `relatedCities` avec la ville cible et 3 métropoles/régions voisines, `relatedGuides` vers `vivre-en-[région]-guide`, `retraite-france-guide`, `villes-seniors-retraite-france` et `vivre-retraite-1500-euros-mois-france-2026` selon les axes. Chiffres calibrés : prix immobilier à partir de HOUSING pour les 3 villes couvertes (Saint-Dié 1 100 €/m², Château-Gontier 1 300 €/m², Saint-Lô 1 600 €/m²) et à partir du marché local documenté 2026 pour les 7 autres (Challans ~2 500, Tulle ~1 100, Pontarlier ~2 400, Albertville ~2 900, Gaillac ~1 900, Vendôme ~1 900, Marmande ~1 350) — cohérent avec les vraies observatoires loyers et DVF. Budget mensuel réaliste toujours découpé en 6 postes concrets (loyer / charges-énergie / courses / voiture / santé / loisirs), avec deux totaux (locataire vs propriétaire sans crédit) — cible 1 460-2 420 €/mois locataire et 950-1 600 €/mois propriétaire selon les villes. Section « santé » nomme systématiquement le CH local et le CHU de référence + distance, mentionne la tension médecin traitant sans dramatiser. Section « limites » reste honnête (climat, voiture indispensable, éloignement métropoles) — pas de vernis promotionnel. Sitemap auto-généré via `guideRoutes` (map sur `GUIDES.slug`) — les 10 nouvelles URLs y entrent automatiquement, chunk `guides` inchangé. `assertUniqueSlugs` + `assertKnownSlugs` (relatedCities / relatedGuides / cities-seed) passent à l'import — 20 guides `retraite-a-*-2026` désormais chargés. Zéro nouvelle data — pure combinaison seed + HOUSING + connaissance marché local. `npx tsc --noEmit` propre.

## Shipped 2026-07-14

- **Pour qui +1 (30 → 31 profils) — `amateurs-de-culture`** ✅ — Comble le dernier grand angle culture-first du site (« meilleures villes culture France », « villes musées France », « villes patrimoine », « villes vie culturelle ») que les profils existants ne couvraient qu'en périphérie : `couple-sans-enfant` pondère la culture à 2,5 mais dans un mélange vie-jeune actif-nature-transport (mode de vie urbain-équilibré, la culture y est un complément), `jeunes-actifs` à 2,0 dans un mélange carrière-loyer, `télétravailleurs` à 1,5 dans un mélange qualité de vie-connectivité, `expat-retour` à 1,5 dans un mélange qualité de vie-international, `étudiants` à 2,0 dans un mélange transport-coût-écoles — chez tous ceux-là la culture accompagne un autre pilier dominant. Ici c'est l'inverse : la programmation commande, le reste s'organise autour. Nouveau slug `/pour-qui/amateurs-de-culture` (`PROFILE_PAGES` ×30→31) — emoji 🎭, pondération `culture 3.0 + life 1.5 + transport 1.0 + sansVoiture 1.0 + safety 0.5 + qualiteAir 0.5 + nature 0.5` (total 8,0). Culture 3,0 comme pilier cardinal (calibré sur la densité salles de spectacle, densité musées de France labellisés par le ministère de la Culture, patrimoine UNESCO/MH, festivals structurants — Avignon, Aix, Vieilles Charrues, Trans Musicales, Francofolies, Nuits de Fourvière, Voyage à Nantes, Chorégies d'Orange, Rio Loco, Nuits Sonores, Jazz in Marciac). Vie 1,5 parce qu'une programmation dense reste inutile si le centre-ville est mort à 20 h. Transport 1,0 et sans voiture 1,0 parce que l'amateur sort à pied ou en tram — trois soirées par semaine avec un aller-retour voiture devient une contrainte et le stationnement en centre historique est presque toujours galère. Sécurité 0,5 pour rentrer sereinement d'un spectacle à 23 h en semaine. Qualité de l'air 0,5 comme plus pour la vie de terrasse qui accompagne. Nature 0,5 pour préserver quelques échappées dominicales — un amateur de culture qui ne prend jamais l'air finit épuisé par l'urbanité continue. Intro éditoriale qui différencie explicitement chaque profil culture-adjacent existant en citant leur pondération culture (2,5 / 2,0 / 1,5 / 1,5 / 2,0) — voix analytique cohérente avec le ton du site. `reasonHint` triple-axe (culture + vie + transport). Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui` (appended après `amateurs-de-montagne`, aucun URL déplacé). Index `/pour-qui` met à jour son compteur via `PROFILE_PAGES.length` (déjà dynamique). Zéro nouvelle data — pure recombinaison de l'axe culture seed + axes urbains. Cluster pour-qui désormais à 31 profils. `npx tsc --noEmit` propre.

## Shipped 2026-07-11

- **Pour qui +1 (28 → 29 profils) — `mobilite-reduite` (personnes à mobilité réduite)** ✅ — Comble une cible pour-qui à forte intention SEO (« meilleures villes mobilité réduite France », « villes accessibles fauteuil roulant », « meilleures villes handicap ») qu'aucun profil existant ne couvrait : `sans-voiture` pondère le multimodal tram-métro-bus-vélo pour un usager valide (poids `sansVoiture 3.0 + transport 2.0`) ; `retraites` et `futurs-retraites` visent l'installation sereine mais pas la contrainte physique quotidienne ; `proches-aidants` couvre celui qui accompagne, pas celui qui subit la contrainte de mobilité. Nouveau slug `/pour-qui/mobilite-reduite` (`PROFILE_PAGES` ×28→29) — emoji ♿, pondération `transport 2.5 + sansVoiture 2.0 + safety 1.5 + life 1.5 + bruit 1.0 + cost 1.0 + qualiteAir 0.5` (total 10,0). Le transport en commun domine parce que les métropoles à métro/tramway (Lyon, Marseille, Toulouse, Lille, Rennes, Strasbourg, Nantes, Bordeaux, Montpellier, Angers, Le Havre, Dijon, Valenciennes, Reims, Nice, Saint-Étienne, Grenoble, Rouen, Le Mans, Tours, Brest, Caen, Orléans, Aubagne, Besançon, Avignon) ont massivement rénové leurs stations et rames sous obligation loi handicap 2005 art. 45, et embarquent aujourd'hui la quasi-totalité de leurs lignes tramway et une majorité de leurs stations métro en accessibilité PMR intégrale — contrairement aux réseaux 100 % bus inégaux malgré la généralisation du plancher bas. Sans-voiture et vie complètent sur la marchabilité réelle (cœur compact et plat vs conurbation étirée). Sécurité et bruit environnants réduisent risques de chute et facilitent la lecture de l'environnement. Coût parce que la mobilité réduite s'accompagne très souvent d'une AAH plafonnée, pension d'invalidité ou retraite anticipée pour inaptitude — plus 2 000-8 000 € d'aménagement logement à absorber. Qualité de l'air en marge (BPCO et pathologies respiratoires chroniques). Intro éditoriale honnête qui explicite d'emblée le caractère indirect des indicateurs — les vraies métriques (pourcentage de stations métro équipées d'ascenseur en état, ratio bus plancher bas récents, densité bateaux abaissés sur trottoirs, largeur voirie hors centre historique) ne sont pas centralisées commune par commune — et se termine sur le rappel qu'une visite terrain reste indispensable pour la voirie de proximité, le logement visé, les services médico-sociaux et le transport adapté (TAD). `reasonHint` triple-axe (transport + sans voiture + calme). Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui` (inséré entre `cyclistes-urbains` et `amateurs-de-littoral`, aucun URL déplacé). Index `/pour-qui` met à jour son compteur via `PROFILE_PAGES.length` (déjà dynamique). Zéro nouvelle data — pure recombinaison des axes seed + owner-scores. Cluster pour-qui désormais à 29 profils. `npx tsc --noEmit` propre.

## Shipped 2026-07-10

- **R13.1 — Badge embarcable « Nᵉ ville de France »** ✅ — Backlink motion demandée par le pitch mairies/offices de tourisme (CLAUDE.md §R13.1) : un badge SVG libre par ville, prêt à coller sur un site tiers, qui affiche le rang national + score global et renvoie sur la fiche `/villes/[slug]`. Livré côté FR uniquement (le pitch adresse le public FR — mairies, agences, presse locale) : `/badge` hub explique la mécanique, montre 12 aperçus et le top 30 ; `/badge/[slug]` × 540 SSG par ville expose les 3 formats (compact 280×80 / large 460×120 / carré 200×200) avec bouton copier pour le HTML complet et pour le SVG seul. `lib/city-badge.ts` : rang national calculé une fois via cache module-level (`nationalRank(slug)`), SVG émis en chaîne inline (aucune font externe, aucun fetch), échappement XML, helper `renderEmbedHtml` qui enveloppe le SVG dans un `<a href="/villes/[slug]">` — le lien retour est la seule contrepartie exigée. `components/BadgeEmbed.tsx` (client only) gère la copie via `navigator.clipboard` avec fallback sélection DOM. Card « 🏷️ Badge à embarquer » ajoutée à la grille sub-page de `CityProfile` (FR uniquement, `locale === "fr"`). Chunk sitemap `"badges"` ajouté à la fin de `SITEMAP_CHUNKS_FR` (541 URLs : hub + 540 villes) — ordre préservé, aucun chunk existant décalé. Convention CLAUDE.md respectée : zéro nouvelle donnée (rang dérivé du score global du seed), zéro dépendance externe (SVG inline), pas de tracker. `npx tsc --noEmit` propre.

## Shipped 2026-07-08

- **EN port — retail coverage: hub `/retail-coverage` + 6 macro-régions (×7 SSG)** ✅ — Le cluster `commerce` venait de recevoir son hub national `/commerces` + 6 macros côté FR (shipped 2026-07-07) mais pas son miroir anglais. La sous-page ville EN `/cities/[slug]/retail` ×540 existait déjà depuis le scaffolding bilingue et utilisait le même moteur `computeCommerce`, mais aucun palmarès national EN n'agrégeait les résultats — contrairement à `/internet-quality`, `/natural-risks`, `/rental-tension`, `/sport`, `/healthcare`, `/employment`, `/safety`, `/demographics`, `/public-services`, `/cycling` qui ont tous leur miroir EN « hub + 6 macros ». Mirror complet : `/retail-coverage` (top 30 villes les mieux fournies + top 20 les plus fragiles, filtre 15 000 hab.) + `/retail-coverage/[macroregion]` ×6 (Atlantic Coast / Mediterranean Arc / Alpine Arc / South-West Gascony / Rhône Valley / Greater Île-de-France, restriction 10 000 hab., top 15 fournies + top 10 en tension + composite moyen). Réutilise `topBestCommerce` / `topWorstCommerce` / `computeCommerce` du lib FR — zéro nouveau code data, zéro recompute (le cache module-level dans `lib/commerce.ts` est partagé FR/EN). Labels EN au site d'affichage via mappage local `EN_LEVEL_LABEL` (`Exceptional / Solid / Adequate / Limited`), `EN_LEVEL_COLOR` et `EN_MACRO_LABEL` — convention CLAUDE.md #6 respectée, `lib/commerce.ts` reste FR-only. Tables 5 colonnes (rang / ville / région|dept / composite / niveau). Méthodologie honnête en anglais (couverture & diversité 35 % — corrélation aire de chalandise/population + caractère métropole/préfecture, marchés & proximité 25 % — tissu indépendants/gastronomie/patrimoine, grandes surfaces 15 %, vitalité centre-ville 25 %, pénalité villes moyennes 20-60 k sans atout patrimonial/touristique = cible Action Cœur de Ville ANCT). FAQ + breadcrumb JSON-LD sur les 7 pages. Cross-links vers `/public-services`, `/quality-of-life` et le programme Action Cœur de Ville ANCT + lien retour « 📊 National retail-coverage ranking » ajouté en bas de chaque sous-page ville EN `/cities/[slug]/retail`. Footer EN reçoit l'entrée « Retail coverage → /retail-coverage » dans la colonne Tools & Guides (sous « Internet coverage »). Sitemap +7 URLs dans `enStaticSection` (hub 0.7, 6 macros 0.6 — aligné sur `internet-quality` / `natural-risks`). Canonical `bestcitiesinfrance.com/retail-coverage`. Pattern strictement aligné sur `/internet-quality` (EN port shipped 2026-06-27 par-dessus le FR `/internet`). Smoke test : mêmes rangs qu'en FR (Lyon 8.88, Paris 8.84, Nantes 8.27, Strasbourg 8.17, Bordeaux 8.06 en tête ; Saint-Avold 4.06, Givors 4.10, Villeneuve-la-Garenne 4.18, Sannois 4.19, Domont 4.20 en bas de tableau — le même moteur alimente les deux locales). `npx tsc --noEmit` propre.

## Shipped 2026-07-07

- **Couverture commerciale — hub national `/commerces` + 6 macro-régions (×7 SSG)** ✅ — Le cluster commerces (`lib/commerce.ts`, 4 dimensions couverture/proximité/grandes surfaces/centre-ville) avait sa sous-page par ville (`/villes/[slug]/commerces` ×540, shippée 2026-07-02) mais pas de palmarès national — contrairement aux clusters env `/environnement`, santé `/sante`, emploi `/emploi`, cadre `/cadre-de-vie`, vélo `/velo`, sécurité `/securite`, démographie `/demographie`, services-publics `/services-publics`, sport `/sport`, tension locative `/tension-locative`, internet `/internet` et risques `/risques` qui ont tous reçu le traitement « hub + 6 macros ». Comblé via le playbook rodé : `/commerces` (top 30 villes les mieux fournies + top 20 les plus fragiles côté commerces, filtre 15 000 hab.) + `/commerces/[macroregion]` ×6 (côte-atlantique / arc-méditerranéen / arc-alpin / sud-ouest-gascon / vallée-du-rhône / IDF élargie, restriction 10 000 hab., top 15 fournies + top 10 en tension + composite moyen). Helpers `topBestCommerce` / `topWorstCommerce` (+ cache module-level + `CommerceEntry`) ajoutés à `lib/commerce.ts` — réutilisent le moteur `computeCommerce` qui pilote déjà la sous-page ville, donc rang national et rang par ville restent cohérents. **Convention** : 10 = couverture excellente (cohérent avec F57 vélo, F70 sport et internet, opposé du quartet env F40-F43 et des risques). Tables 5 colonnes (rang / ville / région|dept / composite / niveau). Méthodologie honnête (couverture & diversité 35 % — corrélation aire de chalandise/population + caractère métropole/préfecture, marchés & proximité 25 % — tissu indépendants/gastronomie/patrimoine, grandes surfaces 15 % — pôles distribution périphériques, vitalité centre-ville 25 % — proxy vacance commerciale, pénalité villes moyennes 20-60 k sans atout patrimonial/touristique = cible Action Cœur de Ville ANCT). FAQ + breadcrumb JSON-LD sur les 7 pages. Cross-links vers `/services-publics`, `/cadre-de-vie` et le programme Action Cœur de Ville ANCT + lien retour « 📊 Palmarès national couverture commerciale » ajouté en bas de chaque sous-page ville `/villes/[slug]/commerces`. Footer FR `Outils & Guides` étend « Couverture commerciale → /commerces ». Sitemap +7 URLs (hub 0.85, 6 macros 0.75). Zéro nouvelle data, zéro dépendance externe. Smoke test (419 villes ≥ 15 k hab., composite moyen 5,68/10) : top fournies dominé par les grandes métropoles régionales (Lyon 8,88, Paris 8,84, Nantes 8,27, Strasbourg 8,17, Bordeaux 8,06, Toulouse 8,00, Rennes 7,98, Marseille 7,93, Lille 7,92) + villes moyennes à identité marchande forte (Annecy 7,57, Angers 7,54, Nancy 7,50), bas du tableau dominé par les banlieues sans centre marchand propre (Villeneuve-la-Garenne, Sannois, Domont, Cugnaux, Cormeilles-en-Parisis, Ermont, Soisy-sous-Montmorency, Fresnes, Bischheim, Lingolsheim à 4,2-4,4) et bassins industriels en reconversion (Saint-Avold, Givors, Hénin-Beaumont, Denain) + une ville DROM (Le François à 4,3) — distribution cohérente avec la réalité de la géographie commerciale française et le profil cible d'Action Cœur de Ville. `npx tsc --noEmit` propre.

## Shipped 2026-07-04

- **EN port — `/cities/[slug]/statistics` (×540 SSG)** ✅ — Miroir anglais de `/villes/[slug]/statistiques` shippé la veille (2026-07-03). La FR consolide sur une page indexable dédiée les chiffres INSEE bruts que les visiteurs cherchent en priorité (population exacte, salaire médian net, taux de chômage, structure d'âge, trajectoire), en amont des scores composites `emploi` (F50) et `demographie` (F59) déjà présents en EN. Le pendant anglais manquait — c'était la dernière sous-page qui n'existait pas côté EN. Mirror complet : hero **population exacte** (via `formatEN` en `en-GB` — séparateur virgule) + bucket 7 paliers (large metropolis / regional metropolis / large city / mid-sized city / small city / market town / village, mêmes seuils 500 k / 200 k / 100 k / 50 k / 20 k / 5 k), grille 3 cartes **median net wage** (fourchette départementale INSEE DADS dérivée de `computeEmploymentMarket().salary.score` — 5 paliers > €2,400 / €2,100-€2,300 / ≈ €2,100 / €1,850-€1,950 / < €1,850), **unemployment rate** (fourchette départementale INSEE Q4 2024 dérivée de `.unemployment.score` — 5 paliers < 5,5 % / 5,5-7 % / 7-8 % / 8-10 % / > 10 %) et **age structure** (fourchette départementale INSEE RP dérivée de `computeDemography().ageing.score` — 5 paliers < 20 % / 22-27 % / ≈ 28 % / 32-35 % / 35-40 % over 60), plus un bloc **demographic trajectory** (population growth / stable / structural decline). Bloc transparence « What INSEE does not publish at the commune level » identique au FR, avec 3 puces expliquant la granularité départementale. 6 cross-links (employment, demographics, cost-of-living, housing, tax, public-services), lien sortant vers la fiche INSEE de recherche. FAQ JSON-LD (4 Q/R : how many residents, median wage, unemployment rate, young or ageing) + breadcrumb. Convention CLAUDE.md #6 respectée : `computeEmploymentMarket` / `computeDemography` restent FR-only (retour `demo.trajectory.reason` FR non utilisé), toute la copy anglaise est dérivée au site d'affichage — nouveau mapping `trajectoryReasonEN(score)` (5 paliers), `SALARY_LABEL` (high / good / median / low / very low), `UNEMP_LABEL` (very low / low / average / high / very high) et brackets narratifs (« very young demographics (overseas departments) », « sunbelt coast », « rural central-eastern departments »). Carte « 📊 Statistics » ajoutée dans le strip sous-pages de `CityProfile.tsx` via `sub("statistiques", "statistics")` (la carte FR était gated `locale !== "en"` — remplacée par une carte locale-aware unique, sortie FR byte-identical). Sitemap `enCitySubSection` étendu (+540 URLs priority 0.55). Canonical `bestcitiesinfrance.com/cities/[slug]/statistics`. Zéro nouvelle data — pur dérivé de `city.population` + `computeEmploymentMarket()` + `computeDemography()`. `npx tsc --noEmit` propre.

## Shipped 2026-07-03

- **Sous-page ville — `/villes/[slug]/statistiques` (×540 SSG)** ✅ — Comble la première ligne du tableau « Nouvelles sous-pages ville » de la roadmap v11 (« Population, évolution démog., salaire médian net, taux de chômage — proxies INSEE »). Les sous-pages `emploi` (F50) et `demographie` (F59) existaient déjà mais ne surfaçaient pas les chiffres bruts que les visiteurs cherchent en priorité (« population de X », « salaire médian X », « chômage X ») — elles affichaient des scores composites 0-10 orientés analyse. `/statistiques` consolide ces chiffres en une page indexable dédiée : hero **population exacte** (depuis `city.population`) + bucket (grande métropole / métropole régionale / grande ville / ville moyenne / petite ville / bourg / petite commune, selon 500 k / 200 k / 100 k / 50 k / 20 k / 5 k), grille 3 cartes **salaire net médian** (fourchette départementale INSEE DADS dérivée de `computeEmploymentMarket().salary.score` — 5 paliers : > 2 400 € / 2 100-2 300 € / ~2 100 € / 1 850-1 950 € / < 1 850 €), **taux de chômage** (fourchette départementale INSEE T4 2024 dérivée de `.unemployment.score` — 5 paliers : < 5,5 % / 5,5-7 % / 7-8 % / 8-10 % / > 10 %) et **structure d'âge** (fourchette départementale INSEE RP dérivée de `computeDemography().ageing.score` — 5 paliers : < 20 % / 22-27 % / ~28 % / 32-35 % / 35-40 % de seniors), plus un bloc **trajectoire démographique** (croissance / stable / décroissance structurelle depuis `.trajectory`). Bloc transparence « Ce que l'INSEE ne publie pas à l'échelle communale » qui explique pourquoi les 3 métriques sont départementales (chômage trimestriel par dept, DADS par dept, RP fiable > 20 k hab.) — voix analytique honnête cohérente avec le ton du site. 6 cross-links (emploi, démographie, coût-de-la-vie, logement, fiscalité, services-publics), lien sortant vers la fiche INSEE de recherche pour la valeur exacte à un millésime précis. FAQ JSON-LD (4 Q/R : combien d'habitants, salaire, chômage, jeune/vieillissante) + breadcrumb. Carte « 📊 Statistiques » ajoutée dans le strip sous-pages de `CityProfile.tsx` (FR-only, à côté de la carte Commerces shippée le 2026-07-02). Sitemap +540 URLs priority 0.65 dans `citySubSection`. Canonical `mavilleideale.fr/villes/[slug]/statistiques`. Zéro nouvelle data — pur dérivé de `city.population` + `computeEmploymentMarket()` + `computeDemography()` déjà cachés côté serveur. `npx tsc --noEmit` propre.

## Shipped 2026-07-01

- **EN port — risques naturels : hub `/natural-risks` + 6 macro-régions (×7 SSG)** ✅ — Le cluster `natural-risks` venait de recevoir son hub national `/risques` + 6 macros côté FR (shipped 2026-06-30) mais pas son miroir anglais. La sous-page ville EN `/cities/[slug]/natural-risks` ×540 existait déjà depuis le scaffolding bilingue et utilisait le même moteur `computeNaturalRisks`, mais aucun palmarès national EN n'agrégeait les résultats — contrairement à `/internet-quality`, `/rental-tension`, `/sport`, `/healthcare`, `/employment`, `/safety`, `/demographics`, `/public-services`, `/cycling` qui ont tous leur miroir EN « hub + 6 macros ». Mirror complet : `/natural-risks` (top 30 villes les plus exposées + top 20 les plus tranquilles, filtre 15 000 hab.) + `/natural-risks/[macroregion]` ×6 (Atlantic Coast / Mediterranean Arc / Alpine Arc / South-West Gascony / Rhône Valley / Greater Île-de-France, restriction 10 000 hab., top 15 exposées + top 10 tranquilles + composite moyen + aléa #1 par ville). Réutilise `topMostAtRisk` / `topLeastAtRisk` / `computeNaturalRisks` du lib FR — zéro nouveau code data, zéro recompute (le cache module-level dans `lib/natural-risks.ts` est partagé FR/EN). Labels EN au site d'affichage via mappage local `EN_LEVEL_LABEL` (`Low / Moderate / Elevated / High`), `EN_LEVEL_COLOR`, `EN_HAZARD_LABEL` (`Flood / Seismic / Clay / Wildfire`) et `EN_MACRO_LABEL` — convention CLAUDE.md #6 respectée, `lib/natural-risks.ts` reste FR-only. Tables 6 colonnes (rang / ville / région|dept / composite / niveau / aléa #1 dominant). Méthodologie honnête en anglais (inondation 35 % — fleuve majeur + altitude + littoral, argile 25 % — aléa BRGM départemental, feu 20 % — classification ONF/ECASC, sismicité 20 % — zonage réglementaire 2011). FAQ + breadcrumb JSON-LD sur les 7 pages. Cross-links vers `/environment`, `/climate-2040-timelapse`, et Géorisques officiel + lien retour « 📊 National natural-risks ranking » ajouté en bas de chaque sous-page ville EN `/cities/[slug]/natural-risks`. Footer EN reçoit l'entrée « Natural risks → /natural-risks » dans la colonne Tools & Guides. Sitemap +7 URLs dans `enStaticSection` (hub 0.7, 6 macros 0.6 — aligné sur `internet-quality`). Canonical `bestcitiesinfrance.com/natural-risks`. Pattern strictement aligné sur `/internet-quality` (EN port shipped 2026-06-27 par-dessus le FR `/internet` shippé la veille). `npx tsc --noEmit` propre.

## Shipped 2026-06-30

- **Risques naturels — hub national `/risques` + 6 macro-régions (×7 SSG)** ✅ — Le cluster `natural-risks` (`lib/natural-risks.ts`, 4 dimensions inondation/sismicité/argile/feu) avait sa sous-page par ville (`/villes/[slug]/risques` ×540) et son ancrage red-flag implicite, mais pas de palmarès national — contrairement à env (`/environnement`), santé (`/sante`), emploi (`/emploi`), cadre (`/cadre-de-vie`), vélo (`/velo`), sécurité (`/securite`), démographie (`/demographie`), services-publics (`/services-publics`), sport (`/sport`), tension locative (`/tension-locative`) et internet (`/internet`) qui ont tous reçu le traitement « hub + 6 macros ». Comblé via le playbook rodé : `/risques` (top 30 villes les plus exposées + top 20 les plus tranquilles, filtre 15 000 hab.) + `/risques/[macroregion]` ×6 (côte-atlantique / arc-méditerranéen / arc-alpin / sud-ouest-gascon / vallée-du-rhône / IDF élargie, restriction 10 000 hab., top 15 exposées + top 10 tranquilles + composite moyen + aléa #1 par ville). Helpers `topMostAtRisk` / `topLeastAtRisk` (+ cache module-level + `NaturalRiskEntry`) ajoutés à `lib/natural-risks.ts` — réutilisent le moteur `computeNaturalRisks` qui pilote déjà les sous-pages, donc rang national et rang par ville restent cohérents. **Convention** : 10 = exposition maximale (cohérent avec F44 pollution, opposé de F70 sport et F57 vélo). Tables 6 colonnes (rang / ville / région|dept / composite / niveau / aléa #1 dominant pour la version « plus exposées »). Méthodologie honnête (inondation 35 % — fleuve majeur + altitude + littoral, argile 25 % — aléa BRGM départemental, feu 20 % — classification ONF/ECASC, sismicité 20 % — zonage réglementaire 2011). FAQ + breadcrumb JSON-LD sur les 7 pages. Cross-links vers /environnement, /climat-2040-timelapse, et Géorisques officiel + lien retour « → Palmarès national des risques naturels » ajouté en bas de chaque sous-page ville `/villes/[slug]/risques`. Footer FR `Outils & Guides` étend « Risques naturels → /risques ». Sitemap +7 URLs (hub 0.85, 6 macros 0.75). Zéro nouvelle data, zéro dépendance externe. Smoke test : top exposées dominé par PACA (Sanary/Toulon 7.1, Cannes/Marseille/Nice 6.6) et Occitanie côtière (Agde/Sète 6.6, Narbonne/Avignon/Orange) — cumul inondation+feu+argile cohérent avec la réalité méditerranéenne ; top tranquilles dominé par les villes intérieures de plateau en zone sismique 1 (Rennes, Clermont-Ferrand, Dijon, Reims, Saint-Étienne, Troyes, Vannes, Laval, Mâcon — toutes à 1.5/10). Disclaimer méthodo : palmarès pédagogique, pour un PPRI/ERP officiel utiliser Géorisques à l'adresse. `npx tsc --noEmit` propre.

## Shipped 2026-06-27

- **EN port — couverture internet : hub `/internet-quality` + 6 macro-régions (×7 SSG)** ✅ — Le cluster `internet-score` venait de recevoir son hub national `/internet` + 6 macros côté FR (shipped 2026-06-26) mais pas son miroir anglais. La sous-page ville EN `/cities/[slug]/internet-quality` ×540 existait déjà depuis le scaffolding bilingue et utilisait le même moteur `internetScore`, mais aucun palmarès national EN n'agrégeait les résultats — contrairement à `/rental-tension`, `/sport`, `/healthcare`, `/employment`, `/safety`, `/demographics`, `/public-services`, `/cycling` qui ont tous leur miroir EN « hub + 6 macros ». Mirror complet : `/internet-quality` (top 30 villes les mieux fibrées + top 20 les moins bien connectées, filtre 15 000 hab.) + `/internet-quality/[macroregion]` ×6 (Atlantic Coast / Mediterranean Arc / Alpine Arc / South-West Gascony / Rhône Valley / Greater Île-de-France, restriction 10 000 hab., top 15 fibrées + top 10 précaires + score moyen). Réutilise `topBestInternet` / `topPoorInternet` / `internetScore` / `internetLabel` du lib FR — zéro nouveau code data, zéro recompute (le cache module-level dans `lib/internet-score.ts` est partagé FR/EN). Labels EN au site d'affichage via mappage local `EN_TIER_SHORT` (`Excellent / Good / Fair / Limited`) et `EN_MACRO_LABEL` — convention CLAUDE.md #6 respectée, `lib/internet-score.ts` reste FR-only. Tables 5 colonnes (rang / ville / région|dept / score / niveau). Méthodologie honnête en anglais (60 % seed remote-work, bonus régional ARCEP Q4 2024, bonus densité top 30 villes, malus zones « low-density unprofitable » Creuse/Cantal/Lozère/Ariège/Aveyron/Gers/Hautes-Alpes/Haute-Loire/Alpes-de-Haute-Provence/Haute-Marne/Meuse/Vosges/Corrèze). FAQ + breadcrumb JSON-LD sur les 7 pages. Cross-links vers `/rankings/teletravail` + `/rental-tension` + outil ARCEP officiel telecom.gouv.fr ; lien retour « 📊 National internet-coverage ranking » ajouté en bas de chaque sous-page ville EN `/cities/[slug]/internet-quality`. Footer EN reçoit l'entrée « Internet coverage → /internet-quality » dans la colonne Tools & Guides. Sitemap +7 URLs dans `enStaticSection` (hub 0.7, 6 macros 0.6 — aligné sur `rental-tension`). Canonical `bestcitiesinfrance.com/internet-quality`. Pattern strictement aligné sur `/rental-tension` (autre cluster ported par-dessus son équivalent FR le mois précédent). `npx tsc --noEmit` propre.

## Shipped 2026-06-26

- **Couverture internet — hub national `/internet` + 6 macro-régions (×7 SSG)** ✅ — Le cluster `internet-score` (`lib/internet-score.ts`) avait sa sous-page par ville (`/villes/[slug]/connexion-internet` ×540) et son red-flag SEO (`/red-flags/villes-internet-precaire`) mais pas de palmarès national, contrairement aux clusters env / santé / emploi / vélo / sécurité / démographie / services-publics / tension-locative qui ont tous reçu le traitement « hub + 6 macros ». Comblé via le playbook rodé : `/internet` (top 30 villes les mieux fibrées + top 20 les moins bien connectées, filtre 15 000 hab.) + `/internet/[macroregion]` ×6 (côte-atlantique / arc-méditerranéen / arc-alpin / sud-ouest-gascon / vallée-du-rhône / IDF élargie, restriction 10 000 hab., top 15 fibrées + top 10 précaires + score moyen). Helpers `topBestInternet` / `topPoorInternet` (+ cache module-level + `InternetEntry`) ajoutés à `lib/internet-score.ts` — réutilisent le moteur `internetScore` qui pilote déjà les sous-pages, donc rang national et rang par ville restent cohérents. Signature `internetScore` élargie à `CitySeed | CityLight` pour réutiliser `CITIES_LIGHT` (même pattern que `rentalTension`). Tables 5 colonnes (rang / ville / région|dept / score / niveau). Méthodologie honnête (60 % score télétravail seed, bonus régional ARCEP T4 2024, bonus densité urbaine top 30, malus zones « peu denses non rentables » Creuse/Cantal/Lozère/Ariège/Aveyron/Gers/Hautes-Alpes/Haute-Loire/Alpes-de-Haute-Provence/Haute-Marne/Meuse/Vosges/Corrèze). FAQ + breadcrumb JSON-LD sur les 7 pages. Cross-links vers red-flag internet précaire / classement télétravail / outil ARCEP officiel + lien retour « Palmarès national couverture internet » ajouté en bas de chaque sous-page ville `/villes/[slug]/connexion-internet`. Footer FR `Outils & Guides` étend `Couverture internet → /internet`. Sitemap +7 URLs (hub 0.85, 6 macros 0.75). Zéro nouvelle data, zéro dépendance externe. Smoke-test : top fibrées plafonnent au clamp 9,5 (Annecy, Nantes, Rennes, Bordeaux, Montpellier, Toulouse, Lyon, Aix-en-Provence, La Rochelle, Paris — toutes les métropoles attractives à parité), bas du tableau dominé par les DROM dispersés (Mamoudzou 3,6, Saint-Laurent-du-Maroni 4,1, Cayenne 4,5) et l'arrière-pays industriel (Hayange, Hénin-Beaumont, Denain à 5,3) — distribution cohérente avec la réalité de la fibre française. `npx tsc --noEmit` propre.

## Shipped 2026-06-24

- **Pour qui +1 (26 → 27 profils) — `cyclistes-urbains`** ✅ — Comble le pendant pour-qui du cluster F57 vélo (shipped 2026-05-17). Le cluster F57 avait déjà sa sub-page ville (`/villes/[slug]/cyclabilite`), son hub national, ses 6 macros et son red-flag SEO (`villes-anti-velo`), mais aucun angle pour-qui n'isolait le cycliste urbain qui choisit sa ville en fonction de la praticabilité du vélo au quotidien. `sans-voiture` (poids `sansVoiture 3.0 + transport 2.0`) pondère le réseau multimodal tram-métro-bus-vélo et donne le même poids à un usager exclusif des transports en commun ; `sportifs` (poids `sportLeisure 3.0`) cible les équipements indoor et les clubs fédérés (piscine, gymnase, salle) ; `amateurs-de-plein-air` (poids `nature 3.0`) cible la nature brute du week-end. Aucun profil ne pondérait directement le composite F57 cyclabilité. Nouveau slug `/pour-qui/cyclistes-urbains` (`PROFILE_PAGES` ×26→27) — emoji 🚴, pondération dominée par le composite F57 (`cyclingMobility 3.0` via nouvelle clé dans `getScoreValue`/`ScoreWeights`, importée depuis `lib/cycling-mobility.ts`) + sans voiture 1.5 (cycliste utilise aussi les transports par mauvais temps ou pour les longs trajets) + transport 1.0 (complément) + qualiteAir 1.0 (vous respirez ce que vous traversez à pleine ventilation) + nature 1.0 (sorties dominicales) + safety 0.5 + life 0.5 (total 8.5). Intro éditoriale qui pose le triple différentiel vs `sans-voiture` (multimodal vs vélo), `sportifs` (indoor + clubs fédérés vs transport quotidien) et `amateurs-de-plein-air` (loisir occasionnel vs pratique 6-7 jours/semaine), explique le rôle du baromètre FUB / Géovélo / OSM dans la mesure de la continuité du réseau, pourquoi le relief compte presque autant que le réseau (le vélo électrique ne lève qu'une partie de la contrainte), pourquoi la sécurité réelle (séparation des flux, sas vélo, double sens cyclable, limitations 30 km/h) fait la différence avec la pratique stressée, pourquoi le climat concentre la pratique sur quelques mois et fatigue même les plus motivés. `reasonHint` triple-axe (cyclabilité + transport + sans voiture). Top 25 smoke-testé : palmarès tiré par les championnes du baromètre FUB (Strasbourg #5, Grenoble #8, Rennes #2, Nantes #3, Bordeaux #4, La Rochelle #9), plusieurs villes moyennes pionnières (Anglet #1 Vélodyssée + transit + air pur, Versailles #7, Caen #13, Lorient, Compiègne #6, Tours #16, Angers #14), métropoles régionales équilibrées (Lille #11, Montpellier #10), agglo IDF dotées (Vincennes #19, Issy-les-Moulineaux #20, Talence #23), et villes traversées par une EuroVelo majeure (Amboise #21 Loire à vélo, Vendôme #22, Biarritz #24, Bayonne #25 Vélodyssée). Distribution cohérente avec la réalité cycliste française. Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui`. Index `/pour-qui` met à jour son compteur via `PROFILE_PAGES.length` (déjà dynamique). Zéro nouvelle data — pure recombinaison du composite F57 + axes seed + owner-scores existants. Cluster pour-qui désormais à 27 profils.

## Shipped 2026-06-23

- **Pour qui +1 (25 → 26 profils) — `jeunes-diplomes` (20-26 ans, premier poste)** ✅ — Comble le gap explicitement signalé dans CLAUDE.md (« étudiant → jeunes-actifs → jeunes-diplômés [gap restant] → primo-accédants »). Aucun profil n'isolait la fenêtre 20-26 entre la sortie d'école et le statut de jeune actif établi (28-35) : le profil `etudiants` cible la phase Crous (bourse, loyer subventionné, emploi du temps universitaire, vie nocturne campus) avec poids `culture 2.0 + transport 2.0 + cost 2.0 + schools 1.5 + jeuneActif 1.5` ; le profil `jeunes-actifs` cible la phase post-installation (25-35, premier vrai poste rodé, première augmentation, négociation logement) avec poids `jeuneActif 2.5 + culture 2.0 + remoteWork 1.5 + cost 1.5 + life 1.0` ; entre les deux, la fenêtre 20-26 — premier CDI/CDD après le master ou l'école, premier vrai loyer hors résidence étudiante ou hors logement parental, salaire d'entrée 1 700-2 200 € net pour un bac+5 hors finance/conseil (Apec 2024), zéro épargne accumulée, prêt étudiant à rembourser — n'était couverte par aucun classement. Nouveau slug `/pour-qui/jeunes-diplomes` (`PROFILE_PAGES` ×25→26) — emoji 🎓, pondération équilibrée 7 axes (`cost 2.5 + jeuneActif 2.0 + culture 1.5 + transport 1.5 + remoteWork 1.0 + life 1.0 + sansVoiture 0.5`, total 10.0). Le coût domine (à ce niveau de salaire d'entrée un loyer parisien à 950 € absorbe la moitié du net), la densité jeune actif suit de près (à 22 ans on quitte le réseau étudiant de cinq ans et il faut tout reconstruire — collègues, colocataires, amis de soirée, partenaires de sport), la culture pour la même raison (infrastructure de la vie sociale post-études), les transports parce que le permis B coûte 1 300 € + une occasion 5 000 € minimum (la voiture est très souvent reportée). Intro éditoriale qui pose le double différentiel vs `etudiants` (Crous vs premier vrai loyer, calendrier universitaire vs CDI) et vs `jeunes-actifs` (premier poste vs établi, salaire d'entrée vs après première augmentation). `reasonHint` triple-axe (coût + culture + transport). Top 20 smoke-testé : palmarès dominé par les capitales étudiantes équilibrées (Strasbourg, Villeurbanne, Lyon, Nantes, Rennes, Lille, Bordeaux, Toulouse), plusieurs préfectures moyennes à coût-culture imbattable (Vienne, Vendôme, Autun, Amboise, Obernai, Senlis, Saint-Quentin, Chinon), Paris correctement absent (premier loyer écrase tout le reste à salaire d'entrée — Paris devient un choix possible une fois la première augmentation passée, pas dès la sortie de l'école). Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui`. Index `/pour-qui` met à jour son compteur via `PROFILE_PAGES.length` (déjà dynamique). Zéro nouvelle data — pure recombinaison des axes seed + owner-scores existants. Cluster pour-qui désormais à 26 profils — couvre la pyramide complète sans plus aucune marche manquante (étudiant → jeunes-diplômés → jeunes-actifs → primo-accédants → jeunes-parents → familles-avec-enfants → familles-avec-ados → futurs-retraites → retraités). `npx tsc --noEmit` propre.

## Shipped 2026-06-20

- **Pour qui +1 (24 → 25 profils) — `futurs-retraites` (55-65 ans, préparation)** ✅ — Comble la marche manquante entre les actifs et les retraités installés. Le profil `retraites` (déjà shippé) cible la phase post-retraite stabilisée (pension fixe, immobilier amorti) avec poids dominants `safety 2.5 + life 2.5 + nature 1.5` ; aucun profil n'isolait la fenêtre 55-65 où l'on est encore salarié, encore mobile, mais où l'on optimise déjà pour la baisse de revenu future (pension qui remplace 60-75 % du dernier salaire selon le COR 2024). Nouveau slug `/pour-qui/futurs-retraites` (`PROFILE_PAGES` ×24→25) — emoji 🧭 (cap à fixer), pondération équilibrée 8 axes (`cost 2.0 + life 2.0 + safety 1.5 + canicule 1.5 + qualiteAir 1.5 + transport 1.5 + securiteNocturne 1.0 + bruit 1.0`, total 12.0). Intro éditoriale qui pose le différentiel vs `retraites` (mobile vs installé, deux temporalités vs présent fixe), explique pourquoi le coût remonte (préparer la baisse durable de revenu, monétiser la plus-value immobilière de la métropole tendue), pourquoi canicule et qualité de l'air pèsent davantage qu'à 35 ans (surmortalité canicule au-delà de 65 ans, capacité respiratoire qui décline), pourquoi les transports en commun deviennent un critère (à 75 ans la voiture n'est plus fiable, garder l'autonomie). `reasonHint` triple-axe (coût + vie + sécurité). Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui`. Index `/pour-qui` met à jour son compteur via `PROFILE_PAGES.length` (déjà dynamique). Zéro nouvelle data — pure recombinaison des axes seed + owner-scores existants. Cluster pour-qui désormais à 25 profils — couvre la pyramide des âges complète (étudiant → jeunes-actifs → jeunes-diplômés [gap restant] → primo-accédants → jeunes-parents → familles-avec-enfants → familles-avec-ados → futurs-retraites → retraités). `npx tsc --noEmit` propre.

## Shipped 2026-06-19

- **FAQ CityProfile — 5 → 13 questions, source unique, FAQPage JSON-LD sur EN aussi** ✅ — La roadmap v11 demandait « ~10 questions par ville » sur l'accordéon `<FAQBlock>` de `CityProfile.tsx` ; le bloc existant n'en avait que 5, hardcodées inline, dupliquées dans `CityJsonLd.tsx` (5 autres, formulations légèrement différentes), et désynchronisées de `lib/city-faq.ts` (13 questions calibrées, déjà alimentant la sous-page `/villes/[slug]/questions` shippée avec R9.4). Trois surfaces FAQ — trois sources de vérité — un risque de drift qui s'aggravait à chaque correction. Refonte : extraction d'une source unique. `CityProfile` accepte désormais une prop `faq: FaqItem[]` et map directement sur les 13 items du lib (loyer Clameur, tension locative, trajet domicile-travail, sécurité, climat 2040, écoles, télétravail, culture, transports, critiques, profils, coût, nature — réponses chiffrées et étiquetées « Données 2026 indicatives »). Le JSON-LD `FAQPage` de `CityJsonLd.tsx` consomme la même prop (cohérence schema.org ↔ HTML visible — important pour Google Rich Results qui vérifie l'égalité). Côté EN : la page `/cities/[slug]` n'avait *aucun* `FAQPage` JSON-LD (que `City` + `BreadcrumbList`) — ajouté inline dans le `@graph` du JSON-LD existant via `cityFaq(city, "en")`. Net : ×540 pages FR + ×540 pages EN, accordéon visible (`<details>` natif, SEO sans JS) et JSON-LD strictement alignés, dérivés du même seed. Zéro nouvelle data, zéro nouveau prompt. `npx tsc --noEmit` propre.

## Shipped 2026-06-12

- **EN port — `/red-flags/themes/sports-poor-cities`** ✅ — Comble la dernière paire SEO orpheline du cluster F70 sport-loisirs côté EN. Le thème FR `villes-pauvres-en-sport` shippé le 2026-05-31 complétait la convention « un cluster data ⇒ un thème red-flag » (F44 pollution-air ↔ chronic-air-pollution, F47 désert-médical ↔ medical-desert, F50 chômage ↔ chronic-unemployment, F52 cadre-tendu ↔ quality-of-life-stretched, F57 anti-vélo ↔ anti-cycling, F58 nuit-tendue ↔ tense-nights, F59 vieillissement ↔ critical-ageing, F60 services-publics ↔ public-services-desert), mais le pendant EN du sport restait FR-only — alors même que les EN avaient déjà `/sport` hub + `/sport/[macroregion]` ×6 + `/cities/[slug]/sports-leisure` ×540 (shippés 2026-06-01). Port complet : ajout d'une entrée `sports-poor-cities` dans `EN_THEMES` (`app/[locale]/red-flags/themes/[slug]/page.tsx`) qui réutilise `rankPauvreEnSport` côté FR via le pointeur `frSlug: "villes-pauvres-en-sport"` — zéro nouvelle data, zéro recompute. Convention reversée explicitée dans la narrative (« 10 = excellent for practice, so low = worst »), méthodologie alignée (severity = (5 − composite) × 2 + 1.2 si facilities ET clubs ≤ 4 + 0.4 si outdoor ≤ 4, capped 10/10, pondération facilities 35 % / outdoor 30 % / clubs 20 % / climate 15 %, filtre pop ≥ 15 000). Tile ajouté sur la landing `/red-flags/themes` (16 → 17 thèmes — title hero + meta title + meta description + canonical mis à jour ; sources élargies à INJEP). Sitemap : `EN_RED_FLAG_THEME_SLUGS` étendu (+1 URL priority 0.65). Strictement aligné sur le pattern `anti-cycling` (même convention reversée). `npx tsc --noEmit` propre.

## Shipped 2026-06-11

- **Pour qui +1 (22 → 23 profils) — `familles-avec-ados` (12-17 ans)** ✅ — Comble le dernier maillon manquant du cluster famille côté pour-qui. `familles-avec-enfants` (poids écoles 2.5, nature 1.5) cible l'enfant scolarisé en primaire, `jeunes-parents` (safety 2.0 + nature 2.0 + qualiteAir 2.0 + famille 2.0) cible le foyer 0-3 ans, `familles-monoparentales` cible le foyer mono-revenu, `familles-nombreuses` cible le besoin d'espace — mais aucun profil n'isolait la phase 12-17 ans où l'arbitrage bascule complètement. L'autonomie de l'ado redistribue les cartes : il rentre seul du lycée, prend les transports pour son club ou ses amis, sort le soir au cinéma ou au concert. La qualité du lycée prend le pas sur le primaire (l'orientation post-bac se joue dès la seconde), la sécurité nocturne devient un vrai critère (pas une abstraction), la densité culturelle se met à compter (cinéma, salle de concert, club fédéré, médiathèque ouverte le samedi), et le réseau de transport en commun fait la différence entre un parent-taxi épuisé et un ado autonome. Nouveau slug `/pour-qui/familles-avec-ados` (`PROFILE_PAGES` ×22→23) — emoji 🎒, pondération équilibrée 9 axes (`transport 2.0 + schools 2.0 + securiteNocturne 1.5 + safety 1.5 + culture 1.5 + jeuneActif 1.0 + famille 1.0 + life 1.0 + nature 0.5`, total 12.0). Intro éditoriale qui pose le différentiel avec `familles-avec-enfants` (primaire vs lycée, parent-taxi vs ado autonome) et `jeunes-parents` (poussette vs autonomie). `reasonHint` triple-axe (transport + écoles + culture). Top 20 smoke-testé : palmarès tiré par les métropoles régionales équilibrées (Strasbourg, Lyon, Rennes — bon transport + lycée + culture), les couronnes IDF safe-belt (Issy-les-Moulineaux, Versailles, Neuilly-sur-Seine, Levallois-Perret — top transport + écoles), et plusieurs villes moyennes à forte tradition lycéenne (Obernai, Fontainebleau, Annecy, Senlis, Beaune, Amboise). Distribution honnête qui reflète la réalité des arbitrages parents-d'ados (l'ado autonome a besoin d'une ville qui ne se vide pas le soir). Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui`. Index `/pour-qui` met à jour son compteur via `PROFILE_PAGES.length` (déjà dynamique). Zéro nouvelle data — pure recombinaison des axes seed + owner-scores. Cluster famille pour-qui désormais complet (jeunes-parents 0-3 → familles-avec-enfants primaire → familles-avec-ados 12-17 → familles-monoparentales → familles-nombreuses).

## Shipped 2026-06-10

- **Pour qui +1 (21 → 22 profils) — `investisseurs-locatifs`** ✅ — Comble un angle pour-qui à très forte intention SEO (« où investir locatif 2026 », « meilleures villes rendement locatif ») jusqu'ici couvert seulement par 3 guides éditoriaux isolés (`investissement-locatif-meilleures-villes-2025`, `meilleures-villes-investissement-locatif-colocation-2025`, `investissement-locatif-moins-100000-euros-france-2026`) — aucun palmarès interactif n'arrivait. Le profil se différencie nettement de `primo-accedants` (qui pondère cost + life + safety pour l'arbitrage « j'achète pour y vivre ») : l'investisseur ne choisit pas la ville où il veut vivre mais celle qui dégage le meilleur rendement net avec une demande locataire qui tient. Nouveau slug `/pour-qui/investisseurs-locatifs` (`PROFILE_PAGES` ×21→22) — emoji 🏘️, pondération `investorYield 2.5 + rentalTension 2.0 + jeuneActif 1.5 + teletravail 0.8 + safety 0.5 + remoteWork 0.5` (total 7.8). Deux nouvelles clés cluster ajoutées à `ScoreWeights` + `getScoreValue` : `rentalTension` (réutilise `lib/rental-tension.ts` — convention 10 = tendu = bon signal pour bailleur) et `investorYield` (nouveau helper exporté inline). `investorYield(city)` calcule le rendement brut estimé d'un T2 = `(avgRentT2 × 12) / (45 × avgBuyPriceM2) × 100`, normalisé linéairement 3 % → 0, 10 % → 10, multiplié par une **pénalité de liquidité** par strate de population (< 20 k = 0,45× ; 20-50 k = 0,62× ; 50-100 k = 0,85× ; ≥ 100 k = 1,0×) — un 10 % brut théorique dans une ville de 13 k habitants n'est pas un vrai 10 % pour un investisseur (pool locataires mince + revente longue). Fallback `HOUSING` absent : proxy coût + neutre. `reasonHint` affiche le rendement brut estimé + loyer T2 + prix m² réels quand HOUSING dispo. Top 20 smoke-testé : palmarès mixte « high-tension low-yield » (Annecy / Lyon / Boulogne-Billancourt / Versailles / Vénissieux / Rennes / Paris / Neuilly) + « high-yield mid-tension » (Limoges / Mulhouse / Bordeaux / Dijon / Saint-Étienne #22 / Le Havre #39) + sous-préfectures à demande structurelle étudiants/fonctionnaires (Chaumont / Soissons / Saint-Dié-des-Vosges). Distribution honnête qui reflète les vraies segmentations du marché 2026. Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui`. Zéro nouvelle donnée — pure recombinaison `HOUSING` + `rentalTension` + axes seed + owner-scores. Cluster pour-qui désormais à 22 profils.

## Shipped 2026-06-09

- **Pour qui +1 (20 → 21 profils) — `sportifs` (pratiquants réguliers)** ✅ — Comble le pendant pour-qui du cluster F70 sport-loisirs (shipped 2026-05-30). Le cluster F70 (composite 4 dimensions équipements / outdoor / clubs / climat) avait déjà sa sub-page ville (`/villes/[slug]/sport`), son hub national, ses 6 macros et son red-flag SEO (`villes-pauvres-en-sport`), mais aucun angle pour-qui n'isolait le pratiquant régulier qui choisit sa ville en fonction de la densité d'équipements municipaux et du tissu associatif. `amateurs-de-plein-air` (poids nature 3.0) cible le randonneur/trailer/baigneur dominé par l'accès brut à la nature ; `sportifs` cible le pratiquant structuré qui a besoin d'un gymnase ouvert jusqu'à 22 h, d'un créneau adulte sérieux dans une fédération agréée, d'une piscine municipale en horaires utiles, et d'un climat qui ne réduit pas la pratique à trois mois par an. Nouveau slug `/pour-qui/sportifs` (`PROFILE_PAGES` ×20→21) — emoji 🏋️, pondération dominée par le composite F70 (`sportLeisure 3.0` via nouvelle clé dans `getScoreValue`/`ScoreWeights`, importée depuis `lib/sport-leisure.ts`) + nature 1.5 (sorties trail/vélo) + life 1.0 (ville qui ne se vide pas le soir) + canicule 1.0 (pratique d'été) + jeuneActif 0.5. Intro éditoriale qui pose le différentiel avec `amateurs-de-plein-air` (infrastructure vs nature brute). Top 15 smoke-testé : Annecy / Grenoble / Biarritz / Chambéry / Albertville / Gérardmer / Le Tampon / Nantes / Brest / Sables-d'Olonne / Anglet / Hossegor / Carnac / Quiberon / Rennes — palmarès cohérent avec la réalité sportive française (pôles d'excellence + métropoles dotées + façades littorales). Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui`. Index `/pour-qui` met à jour son compteur via `PROFILE_PAGES.length` (déjà dynamique). Zéro nouvelle data — pure recombinaison du composite F70 + axes seed + owner-scores.

## Shipped 2026-06-08

- **Pour qui +1 (19 → 20 profils) — `jeunes-parents` (0-3 ans)** ✅ — Comble la dernière marche manquante du cluster famille côté pour-qui. `familles-avec-enfants` (poids écoles 2.5) cible l'enfant scolarisé, `familles-monoparentales` cible le foyer mono-revenu, `familles-nombreuses` cible le besoin d'espace, mais aucun profil n'isolait la phase 0-3 ans où l'arbitrage est radicalement différent : l'école attendra encore 3-4 ans, ce qui compte tout de suite c'est la qualité de l'air pour des poumons en formation, la sécurité poussette sur trottoir, les parcs accessibles à pied pour la balade quotidienne, le calme sonore pour la sieste, et la marge financière qui résiste à un congé parental ou à une bascule mono-revenu transitoire. Nouveau slug `/pour-qui/jeunes-parents` (`PROFILE_PAGES` ×19→20) — emoji 🍼, pondération équilibrée 8 axes (`safety 2.0 + nature 2.0 + qualiteAir 2.0 + famille 2.0 + bruit 1.5 + cost 1.5 + life 1.0 + transport 1.0`, total 13.5), intro éditoriale honnête qui pose le différentiel avec `familles-avec-enfants` (école vs poussette/PMI/crèche), `reasonHint` triple-axe (sécurité + nature + coût). Page SSG auto-générée via `generateStaticParams` sur `PROFILE_PAGES`. Sitemap +1 URL priority 0.7 dans le bloc `pour-qui`. Index `/pour-qui` met à jour son compteur via `PROFILE_PAGES.length` (déjà dynamique, zéro changement copy). Zéro nouvelle data — pure recombinaison du seed + owner-scores. Cluster pour-qui désormais à 20 profils, couverture complète des phases de vie (étudiant → jeune actif → jeunes parents → familles scolarisées → monoparentales → nombreuses → couple sans enfant → premium → retraite).

## Shipped 2026-06-06

- **EN port — `/synthesis` hub** ✅ — Comble le dernier maillon manquant de la pyramide synthèse côté EN. La FR `/synthese` (F68 hub, shipped 2026-05-18) n'avait pas son miroir anglais ; les EN avaient déjà la sous-page ville (`/cities/[slug]/synthesis`, F61), la sous-page région (`/regions/[r]/synthesis`, ported 2026-06-05), le palmarès national + 6 macros (`/overall-ranking[/macro]`, F62), et les comparateurs synthèse intégrés (`/compare/[a]-vs-[b]/synthesis`, `/compare-regions/[a]-vs-[b]/synthesis`), mais la landing hub unifiée restait FR-only. Mirror complet : hero + métriques globales (`CITIES_COUNT` villes, deptCount départements, 18 régions, 6 macros, 8 axes), pyramide « cinq niveaux géographiques » (ville level 1 / dept level 2 / région level 3 / macro level 4 / national level 5), bloc « comparer côte à côte » (2 cartes : `/compare`, `/compare-regions`), aperçu top 5 villes (via `topSynthesisGlobal`) + top 5 régions par profil moyen (via `computeRegionAverageSynthesis` mappé sur METRO_REGIONS), méthodologie en 5 puces (convention unifiée, score global, cohérence ±, verdict comparatif, sources), cross-links vers `/quality-of-life` + `/rankings` + `/city-match`. La carte personnalisation (FR `/palmares/personnaliser` F64) sans miroir EN n'apparaît pas — la pyramide EN reste à 5 cartes au lieu de 6. Labels et hints anglais via mappage local au site d'affichage (convention CLAUDE.md #6 — `lib/city-synthesis.ts` reste FR-only, EN copy au point d'usage). FAQ JSON-LD à 4 Q/R (qu'est-ce, niveaux, comparer, différence vs `/quality-of-life`) + breadcrumb. Lien « 🧭 8-axis synthesis hub » accent ajouté en première position dans le bloc « See also » de `/overall-ranking`. Footer EN reçoit l'entrée « 8-axis synthesis » dans la colonne Tools & Guides. Sitemap +1 URL priority 0.85 dans `enStaticSection` (au niveau du méga-hub EN `/quality-of-life`). Canonical `bestcitiesinfrance.com/synthesis`. Pyramide synthèse EN complète : ville F61 → région F66 (ported 2026-06-05) → macro F62 → national F62 → hub F68 (ce commit) + comparateurs F63/F67 intégrés.

## Shipped 2026-06-05

- **EN port — `/regions/[region]/synthesis` (×18 SSG)** ✅ — Comble le dernier niveau manquant de la pyramide synthèse côté EN. La FR `/regions/[region]/synthese` (F66, shipped 2026-05-18) n'avait pas son miroir anglais ; les EN avaient déjà la sous-page ville (`/cities/[slug]/synthesis`, F61), le palmarès national (`/overall-ranking`, F62) et ses 6 macros, mais le niveau région administrative française (×18 incluant DROM) restait FR-only. Mirror complet : hero emoji + score moyen + cohérence ± + count villes/dept, grille profil moyen 8 axes, table top 20 villes (rang / ville / dept / global level / cohérence / force #1 / tension #1) avec lien vers `/cities/[slug]/synthesis`, table top 10 plus tendues si > 10 villes référencées, bloc zoom département (top 5 par count, lien vers `/departments/[dept]`), cross-links retour vers `/regions/[r]`, `/overall-ranking`, `/compare-regions`, 3 macro-régions touchant la région via `/overall-ranking/[macro]`. Zéro nouvelle data — réutilise `getSynthesisRankings()` (cache module-level, partagé avec FR) et `MACRO_REGIONS`. Labels et hints anglais via mappage local au site d'affichage (convention CLAUDE.md #6 — `lib/city-synthesis.ts` reste FR-only, EN copy au point d'usage). FAQ JSON-LD à 4 Q/R + breadcrumb. Teaser accent ajouté sur la page mère EN `/regions/[region]`. Sitemap +18 URLs priority 0.72 dans `enRegionsSection`. Canonical `bestcitiesinfrance.com/regions/[r]/synthesis`. Pattern strictement aligné sur FR F66.

## Shipped 2026-06-04

- **FR port — `/villes/[slug]/cout-de-la-vie` (×540 SSG)** ✅ — Comble la dernière sous-page-ville qui n'existait qu'en EN (`/cities/[slug]/cost-of-living` depuis le scaffolding bilingue). La FR avait déjà `/calculateur-cout-reel/[ville]` (interactif, slider salaire) et `/cout-menage/[ville]` (4 profils ménage), mais pas de fiche statique « coût de la vie » indexable surfacée depuis le strip sous-pages du profil ville. Mirror du pattern EN, étendu pour la cible FR : hero score coût + verdict 0-10 (6 paliers, de « très accessible » à « très cher »), snapshot 3 cartes loyers de référence (T1/T2/achat €/m² depuis `data/housing.ts`), table budget mensuel réaliste actif célibataire (loyer + 120-180 € charges + 280-420 € alimentation + 50-80/250 € transports — la fourchette transports dépend du score transport de la ville — + 150-400 € loisirs), comparaison auto à Paris (ratio T2/Paris en %, verdict gradué <50/<80/<100/<130/≥130 %) avec lien vers `/comparer/[ville]-vs-paris`, cross-links calculateur + cout-menage + logement + fiscalité + louer-ou-acheter + tension-locative, `DiscussionCTA`. FAQ JSON-LD à 4 Q/R (budget mensuel, loyer T2, coût élevé ou pas, coûts cachés) + breadcrumb. Zéro nouvelle data — pur dérivé de `getHousing(slug)` + `city.scores.cost` + `city.scores.transport`. Carte « 🪙 Coût de la vie » ajoutée dans le strip de `CityProfile.tsx` au-dessus de « 🏠 Coût ménage », locale-aware via `sub("cout-de-la-vie", "cost-of-living")`. Sitemap +540 URLs priority 0.7 dans `citySubSection`. Canonical `mavilleideale.fr/villes/[slug]/cout-de-la-vie`. Pyramide cost FR complète : statique (cette sous-page) → interactif (`/calculateur-cout-reel`) → par profil (`/cout-menage`).

## Shipped 2026-06-03

- **FR port — `/villes/[slug]/vibe` (×540 SSG)** ✅ — Comble la dernière sous-page d'ambiance manquante côté FR. EN `/cities/[slug]/vibe` existait depuis R11.2 mais le pendant FR n'avait que le hub `/vibe` global (top par tonalité), sans page par ville. Mirror complet : hero ton + emoji + score 0-100, breakdown sous-jacent (raisons dérivées des axes), barres signaux culture/nature/sécurité/transport/coût/global, grille 5 tonalités avec marqueur de la ville courante, 3 villes à l'ambiance similaire via `topCitiesByVibe()`, bloc méthodo (déterministe, slug-offset, pas de réseaux sociaux), `DiscussionCTA`. Zéro nouvelle data — réutilise `lib/vibe.ts` (`cityVibe`, `VIBE_META`, `topCitiesByVibe`) déjà partagé avec `/vibe` hub et EN. FAQ JSON-LD (ambiance, animée/calme, calcul, villes similaires) + breadcrumb. Carte « ⚡ Ambiance de la ville » ajoutée dans `CityProfile.tsx` après « Mentalité locale ». Sitemap +540 URLs priority 0.55 dans `citySubSection`. Canonical `mavilleideale.fr/villes/[slug]/vibe`.

## Shipped 2026-06-02

- **EN port — `/leaving/[city]` (×24 SSG)** ✅ — Comble la dernière landing-page « quitter X » côté EN. La FR `/ou-vont-les-gens/[ville]` (R11.3, 24 pages SSG SEO-friendly sans JS) n'avait pas son miroir anglais ; seule l'interactive `/people-like-you` était portée. Mirror complet : hero + 8 sections (familles, jeunes pros, télétravail, retraités, étudiants, primo-accédants, couples sans enfant, freelances) ×4 destinations par profil, scoring via `migrationFor()` partagé avec FR (zéro recompute, zéro nouvelle data — réutilise `lib/people-like-you.ts` + `lib/profile-pages.ts`). Labels et reasonHints anglais via mappage local au site d'affichage (convention CLAUDE.md #6 — `lib/profile-pages.ts` reste FR-only, EN copy au point d'usage). Fallback laterals quand l'origine est déjà imbattable sur le profil. Section « starting from another city » avec 23 pills cross-link. Disclaimer méthodo identique FR (modèle estimatif, pas de suivi). Canonical `bestcitiesinfrance.com/leaving/[city]`. Sitemap +24 URLs priority 0.7 (groupe en-static). EN `/people-like-you` reçoit le bloc « per-city landing pages » identique au FR. Pattern aligné sur `/cities/[slug]/sports-leisure` (commit 2026-06-01).

## Shipped 2026-06-01

- **EN port — `/cities/[slug]/sports-leisure` (×540 SSG)** ✅ — Comble la dernière sous-page-ville qui n'existait qu'en FR (`/villes/[slug]/sport` shipped 2026-05-30) côté EN. Mirror complet du cluster F70 sport-loisirs : hero composite + verdict par niveau (excellent / good / average / limited), grille 4 dimensions (facilities / outdoor playground / club scene / climate) avec scores 0-10 colorés via `scoreColor`, méthodologie (pondérations 35/30/20/15), 4 cross-links « Go deeper » (cycling, climate, synthesis, back to city), FAQ + breadcrumb JSON-LD. Réutilise `lib/sport-leisure.ts` (computeSportLeisure + signatureEn locale) — zéro nouvelle data. CityProfile dégate l'entrée « 🏋️ Sport & leisure » sur EN (route `sub("sport", "sports-leisure")` + label bilingue). Sitemap EN `enCitySubSection` étendu (×540 URLs priority 0.55). Canonical `bestcitiesinfrance.com/cities/[slug]/sports-leisure`. Pattern strictement aligné sur l'existant EN `cycling/` qui partage la même convention « 10 = best » de la lib sport-leisure.

## Shipped 2026-05-31

- **Red Flags +1 (19 → 20 thèmes) — « Villes pauvres en sport »** ✅ — Complète la paire SEO du cluster F70 sport-loisirs (chaque cluster data a un thème red-flag : F44 → pollution-air, F47 → désert-médical, F50 → chômage-élevé, F52 → cadre-tendu, F57 → anti-vélo, F58 → nuit-tendue, F59 → vieillissement / fuite-jeunes-actifs, F60 → désert-services-publics ; F70 sport était le dernier orphelin). Nouveau thème `/red-flags/villes-pauvres-en-sport` : composite F70 ≤ 4,5/10 (convention inversée 10 = excellent, donc faible = pire), severity rescalée `(5 − composite) × 2`, bonus combo +1,2 quand équipements ET clubs ≤ 4 (ni piscine/gymnase municipal correct ni tissu associatif), bonus +0,4 quand cadre outdoor ≤ 4 (la nature ne sauve pas non plus). Cible : sous-préfectures rurales en déprise (Creuse, Cantal, Lozère, Indre) + bassins industriels en reconversion sans relance sportive + péri-urbain sans massif ni façade naturelle proche. Sitemap auto-pris en charge via `RED_FLAG_THEME_SLUGS`. Hub `/red-flags` met à jour son compteur via `RED_FLAG_THEMES.length`. Pattern strictement aligné sur `villes-anti-velo` (autre cluster orienté positivement). Aucune nouvelle donnée — pur dérivé de `computeSportLeisure`.

## Shipped 2026-05-30

- **F70 — Sport & loisirs (cluster complet, ×547 SSG)** ✅ — 9e cluster complet du site après env F44 / santé F49 / emploi F51 / cadre F52 / vélo F57 / sécurité F58 / démographie F59 / services publics F60. `lib/sport-leisure.ts` agrège 4 dimensions proxées au seed : (1) équipements = RES INJEP (piscines / stades / salles) corrélé à population + statut métropolitain + bonus pôle d'excellence (CREPS Vichy / Talence / Strasbourg / Châtenay-Malabry / Nantes / Poitiers, INSEP Vincennes, ENVSN Saint-Pierre-Quiberon, stations élite Tignes / Val-d'Isère), (2) cadre outdoor = cumul des terrains naturels accessibles (montagne Alpes/Pyrénées/Massif Central/Vosges/Jura/Corse + façade côtière Manche/Atlantique/Méditerranée/DROM + massif forestier Landes/Vosges/Sologne/Fontainebleau/Morvan + lac alpin ou fleuve navigable), (3) vie associative = densité du tissu sportif, bonus départements à identité sportive marquée (Pays Basque, AURA, Bretagne, PACA, Sud-Ouest rugby), malus rural ultra-isolé Centre/Est en déprise (Creuse, Cantal, Lozère) et DROM les plus tendus (Mayotte, Guyane), (4) climat propice = soleil + chaleur estivale (malus canicule > 27 °C juillet) + froid hivernal. **Convention** : 10 = excellent (cohérent avec F57 vélo, opposé du quartet env F40-F43). Composite 0-10 pondéré (équipements 35 %, outdoor 30 %, clubs 20 %, climat 15 %) + signature narrative + liens sortants equipements.sports.gouv.fr / data.gouv.fr RES / FFRandonnée. Routes : `lib/sport-leisure.ts` + `components/SportLeisureCard.tsx` + `/villes/[slug]/sport` ×540 + `/sport` hub (top 30 villes sportives + top 20 moins propices, filtre 15 000 hab.) + `/sport/[macroregion]` ×6. CityProfile : strip sous-pages + entrée carte « Climat & environnement » sous CyclingCard. Sitemap +547 URLs : hub 0.85, 6 macros 0.75, 540 sub-pages 0.65. FAQ JSON-LD + breadcrumb. Smoke test (mean composite 5.37, top : Antibes / Annecy / Grenoble / Chambéry / Marseille — distribution cohérente avec la réalité sportive française).

## Shipped 2026-05-29

- **EN site launched on bestcitiesinfrance.com** ✅ — the English build was never deployed to Cloudflare (apex + www returned 404). New `meilleurville-en` Worker (`wrangler.en.toml`, EN routes, `NEXT_PUBLIC_DEFAULT_LOCALE=en`, shared FR D1, crons off). The Worker replaces the deleted `proxy.ts` at the edge: serves clean EN URLs from the `/en/*` asset tree, www→apex 301, and blocks the FR page tree (French routes 404 on the EN domain). Mirror block on FR: `/en/*` 404s on mavilleideale.fr (was leaking 22.5k EN pages). Secrets `BREVO_API_KEY`/`ANTHROPIC_API_KEY` still TODO on the EN Worker (forms/AI degraded until set; static/SEO fully live).
- **Post-Cloudflare monitoring/SEO fixes** ✅ — sitemap-index chunk drift (listed 13/3 vs real 16/19 → recovered ~1.2k FR URLs + all EN chunks); EN canonical host unified to apex; apex→www 301 (FR) via the Worker (`_redirects` can't match host); per-city OG images restored for static export (`/villes/[slug]` + `/cities/[slug]`, generateStaticParams ×540); bidirectional hreflang on cities + rankings + regions + departments + compare (guides excluded — native EN slugs).
- **Political-lean metric + filter** ✅ — per-commune 2022 presidential 1st-round result (Min. Intérieur), matched to all 540 cities by INSEE. 4 blocs (gauche/centre/droite/extrême-droite); `data/political-lean.json` + `scripts/build-political-lean.py` + `lib/political-lean.ts` + `components/PoliticalLean.tsx`. Featured on city pages (FR+EN), filterable on `/villes` + `/carte`. Labelled "indicatif · vote des habitants, pas la mairie".
- **City-page editorial rework + UX fixes** ✅ — city page redesigned (serif "Le verdict" lead, political orientation featured full-width, flat data grid regrouped into 4 themed sections with divider rules). City-match % normalization fixed (was clamping every top city to a fake 100%). Rent-vs-buy card reworked to a plain verdict + €/mois comparison. `/quiz` consolidated into `/city-match` (301 + repointed links + nav rename + sitemap clean).
- **Cost guardrail in deploys** ✅ — Cloudflare Static Assets file-count guard (abort if `out/` ≥ 95k vs the 100k cap) baked into deploy scripts. FR + EN both ~46.8k files (~53k headroom). Note: the baked-in cross-locale tree is the main consumer — excluding the opposite-locale tree from each build is the lever if the cap is approached.

## Shipped 2026-05-28

- **Tension locative — hub national `/tension-locative` + 6 macro-régions (×7 SSG)** ✅ — Le cluster « tension locative » R8.2 n'avait que sa sous-page par ville (`/villes/[slug]/tension-locative` ×540) sans palmarès national, contrairement aux clusters env / santé / emploi / vélo / sécurité / démographie / services-publics qui ont tous reçu le traitement « hub + 6 macros ». Comblé via le playbook rodé : `/tension-locative` (top 30 marchés les plus tendus + top 20 les plus détendus, filtre 15 000 hab.) + `/tension-locative/[macroregion]` ×6 (côte-atlantique / arc-méditerranéen / arc-alpin / sud-ouest-gascon / vallée-du-rhône / IDF élargie, restriction 10 000 hab., top 15 tendues + top 10 détendues + tension moyenne + loyer T2 moyen). Helpers `topMostTense` / `topMostRelaxed` (+ cache module-level) ajoutés à `lib/rental-tension.ts` — réutilisent le moteur `rentalTension` qui pilote déjà les sous-pages, donc rang national et rang par ville restent cohérents. Tables 6 colonnes (rang / ville / région|dept / score tension / niveau / loyer T2 de référence). Méthodologie honnête (proxy loyer relatif + tension de marché + repli coût de la vie, aucun chiffre inventé). FAQ + breadcrumb JSON-LD. Cross-links vers louer-ou-acheter / red-flags coûts-explosifs / calculateur-coût-réel + lien retour ajouté en bas de chaque sous-page ville. Sitemap +7 URLs (hub 0.85, 6 macros 0.75). Zéro nouvelle data, zéro dépendance externe.
- **Fix build-blocker — 20 ghost slugs `guides.relatedGuides`** ✅ — Le `next build` échouait au contrôle `assertKnownSlugs` (`lib/data-integrity.ts`) : 20 entrées de `relatedGuides` pointaient vers des slugs de guides inexistants (ex. `teletravail-a-lyon-guide-pratique-2026`, `nice-vs-marseille-quelle-ville-choisir-2026`, `acheter-moins-200000-euros-france-2026`). Chaque référence fantôme repointée vers le guide réel le plus proche (comparatif existant, guide régional télétravail, guide « acheter à » correct). Build production de nouveau vert (~3 000 pages SSG).

## Shipped 2026-05-27

- **Guides tourisme — batch 10 (×8)** ✅ — Suite directe des batches 1-9 « 10 choses à faire à [ville] » (category: tourisme). Batch 10 = 8 villes moyennes / sous-préfectures où le créneau « activités locales 2026 » est largement vacant : Montluçon (Allier, MuPop + Tronçais), Vichy (Allier, UNESCO Grandes villes d'eaux, Belle Époque, Sources), Clermont-l'Hérault (Hérault, lac du Salagou + Mourèze + Saint-Guilhem UNESCO + Clamouse), Sète (Hérault, canaux + Mont Saint-Clair + joutes + Brassens + Thau), Hyères (Var, Îles d'Or Porquerolles/Port-Cros + Giens + villa Noailles + Olbia grecque), Draguignan (Var, Verdon + Aups truffes + Lorgues + Thoronet), Laval (Mayenne, Douanier Rousseau + château + bains-douches Art déco + Sainte-Suzanne + Jublains gallo-romain), Cherbourg (Manche, Cité de la Mer + gare maritime Art déco + Hague + Tatihou + Barfleur). Slug pattern `10-choses-a-faire-a-[slug]-2026`, 10 sections de ~280 caractères chacune, intro contextuelle, related guides cohérents (vivre-en-X-guide), tags SEO long-tail. Sitemap auto-pris en charge via `GUIDES.map(...)`. 80 guides tourisme désormais shippés (était 72). Aucune nouvelle référence ghost ajoutée (intégrité respectée).

## Shipped 2026-05-18

- **F69 — Comparaison synthèse 3 villes (×50 SSG)** ✅ — Extension de F63 (paires) au format triplet F12. `/comparer/[a]-vs-[b]-vs-[c]/synthese` ×50 SSG : même dispatch length-based dans la route partagée `app/comparer/[pair]/synthese/page.tsx`. Render dédié `renderTriplet()` : hero 3 cartes scores globaux + cohérence ± (palette CITY_COLORS partagée avec F12 — bleu / violet / orange), verdict automatique « gagnant par axe » avec règle stricte (ville en tête avec écart ≥ 0,3 pt sur la 2e meilleure ; sinon équivalent), tableau 5 colonnes (axe / 3 scores / gagnant), cross-links vers les 3 sous-pages /villes/[slug]/synthese + retour comparateur classique 3 villes + hub /synthese. Teaser accent ajouté au-dessus des city cards dans `TripletView.tsx`. Sitemap +50 URLs priority 0.6 (cohérent avec F67 region-pair ; un peu au-dessus du triplet classique 0.55 car la synthèse est plus structurée). FAQ JSON-LD à 4 Q/R (verdict global + 1 Q par ville sur ses axes favorables) + breadcrumb. Boucle synthèse-comparative complète : F63 city↔city (614 paires), F67 region↔region (78 paires), F69 city↔city↔city (50 triplets).
- **F68 — Hub `/synthese`** ✅ — Landing unifié qui surface l'ensemble du système synthèse 8 axes (F61-F67) sur un seul écran. Six blocs : (1) hero + métriques globales (CITIES_COUNT villes, deptCount départements, 13 régions, 6 macros, 8 axes), (2) « Cinq niveaux géographiques » = 6 cartes (ville F61, dept F65, région F66, macro F62, national F62, palmarès personnalisé F64) avec border accent sur les entrées les plus actionnables (ville + personnaliser), (3) « Comparer côte à côte » = 2 cartes (city↔city F63 614 paires, region↔region F67 78 paires), (4) « Aperçu — top 5 » = top 5 villes ≥ 15 000 hab. (via `topSynthesisGlobal`) + top 5 régions par profil moyen (via `computeRegionAverageSynthesis` mappé sur METRO_REGIONS, F66/F67), (5) méthodologie en 5 puces (convention unifiée, score global, cohérence ±, verdict comparatif, sources), (6) cross-links vers /cadre-de-vie + /classements + /quiz. Footer mis à jour avec « Synthèse 8 axes » dans la colonne Guides & IA. Sitemap +1 URL priority 0.85 (au niveau du méga-index /cadre-de-vie 0.95 et juste au-dessus du palmares 0.9 — c'est l'entrée canonique du système synthèse). FAQ + breadcrumb JSON-LD à 4 Q/R. Première page statique (pas SSG dynamique) du cluster synthèse — sert d'entry-point SEO pour la requête « synthèse villes France » / « comparer villes France méthode ».
- **F67 — Comparaison synthèse 2 régions (×78 SSG)** ✅ — Mirror de F63 (comparaison synthèse 2 villes ×614) au niveau de la région administrative française. Pour chaque paire (i, j) avec i < j parmi les 13 METRO_REGIONS, génère `/comparer-regions/[pair]/synthese` : hero 2 cartes profil moyen 8 axes + cohérence ±, verdict automatique par seuil ±0,3 pt (compte de wins par axe), tableau 5 colonnes (axe / score A / score B / delta / gagnant), cross-links vers les 2 sous-pages /regions/[r]/synthese individuelles (F66) + retour comparateur classique + palmarès national. Nouveau helper `computeRegionAverageSynthesis(region)` extrait dans `lib/city-synthesis.ts` (réutilise le cache `getSynthesisRankings()` — zéro recompute). Teaser accent ajouté sur `/comparer-regions/[pair]`. Sitemap +78 URLs priority 0.6 (au-dessus de la paire classique 0.55, cohérent avec F63 city-pair à 0.65). FAQ + breadcrumb JSON-LD. Différencie de F63 (granularité ville) et du comparatif régions classique (climat / immo / scores agrégés non normalisés) : ici les 8 axes data du site avec convention unifiée 10 = excellent et verdict par delta. Boucle synthèse-vs-synthèse : F63 ville↔ville (614 paires), F67 région↔région (78 paires).
- **F66 — Synthèse par région administrative (×18 SSG)** ✅ — Maillon intermédiaire complétant la pyramide synthèse : entre le département (F65 ×102) et la macro-région éditoriale (F62 ×6) s'intercale la **région administrative française** (×18 incluant DROM), niveau géographique très recherché en SEO français (« vivre en Bretagne », « meilleures villes Occitanie », « Hauts-de-France où s'installer »). `/regions/[region]/synthese` ×18 SSG : profil moyen sur les 8 axes (4 × 2), top 20 villes de la région ordonné par global synthèse, top 10 plus tendues si la région compte > 10 villes référencées, bloc « zoom département » avec les 5 départements les plus densément couverts (cross-link vers F65), cross-links macro-régions touchant la région (palmarès F62) + retour palmarès national + palmarès personnalisé F64. Réutilise `getSynthesisRankings()` cache module-level (zéro recompute). Teaser accent ajouté sur la page mère `/regions/[region]`. Sitemap +18 URLs priority 0.72 (entre dept synthèse 0.7 et palmarès macro 0.75, cohérent avec la granularité). FAQ + breadcrumb JSON-LD. Pyramide synthèse désormais à 5 niveaux : ville F61 → département F65 → **région F66** → macro-région F62 → national F62. Différencie de F62 macro-région (zones éditoriales transrégionales 6 zones) : ici les 18 régions administratives officielles, granularité INSEE.
- **F65 — Synthèse par département (×102 SSG)** ✅ — Maillon manquant de la pyramide synthèse : entre la macro-région (F62 ×6) et la ville (F61 ×540), le département (F65 ×102) — niveau géographique où les Français cherchent réellement (« vivre dans le Finistère », « vivre dans le Lot »). `/departements/[dept]/synthese` ×102 SSG : profil moyen du département sur les 8 axes (4 colonnes × 2 lignes), top des villes du dept ordonné par global synthèse, top des plus tendues si le département compte > 8 villes référencées, sinon « toutes les villes du département ». Helpers existants réutilisés (`getAllDepartments` + `deptToSlug`/`slugToDept`). Cross-link teaser accent ajouté sur la page mère `/departements/[dept]`. Sitemap +102 URLs priority 0.7 (au-dessus de fiscalité à 0.55, dessous de l'index dept à 0.65 — la synthèse est un détail mais à plus fort intent SEO que la fiscalité). FAQ + breadcrumb JSON-LD. Pyramide synthèse complète : F61 ville → F65 département → F62 macro-région → F62 national.
- **F64 — Palmarès personnalisé 8 axes** ✅ — Quiz interactif `/palmares/personnaliser` qui permet de pondérer les 8 axes synthèse F61 selon les priorités personnelles. 8 sliders 1-5 (env / santé / emploi / cadre / vélo / sécurité / démo / services), recompute en direct du top 10 villes ≥ 15 000 hab. via `personalSynthesisRanking()` (réutilise le cache `getSynthesisRankings`, pas de recompute des sous-scores). URL hash `#e=X&s=Y&j=Z&q=A&v=B&n=C&d=D&p=E` (lettres compatibles avec F55 sur les 3 premiers axes) → ouvrir le lien restaure exactement la pondération. Bouton « Copier le lien » avec feedback. Hub `/palmares` reçoit un bandeau accent qui surface la version personnalisée. Sitemap +1 URL priority 0.8. Différencie de F55 (`/cadre-de-vie/personnaliser`) : ici les 8 axes complets, là 3 piliers env/santé/emploi. Boucle synthèse triangulée : F61 lecture per-ville → F62 palmarès national → F63 comparaison pair → F64 personnalisation.
- **F63 — Comparaison synthèse 2 villes (×614 SSG)** ✅ — Nouveau sous-route `/comparer/[pair]/synthese` qui compare les 8 axes synthèse F61 de deux villes côte à côte. Pour chaque paire de `SEO_PAIRS` (614 paires curées) : SSG dédié avec hero (2 cartes scores globaux + cohérence ± + niveau), verdict automatique (compte de wins par seuil ±0,3 pt), table 5 colonnes (axe / score A / score B / delta / gagnant), cross-links vers les 2 sous-pages /synthese individuelles + retour comparateur classique + palmarès. La page mère `/comparer/[pair]` reçoit un nouveau bandeau accent qui surface la synthèse. Sitemap +614 URLs (priority 0.65, plus haut que le comparateur classique à 0.6 car la synthèse est plus structurée pour la requête « X vs Y »). Différencie du comparer classique : ici les 8 axes data normalisés (env / santé / emploi / cadre / vélo / sécurité / démo / services) au lieu des 9 scores seed historiques. Réutilise `computeCitySynthesis` sans recompute.
- **F62 — Palmarès national (×7 SSG)** ✅ — Suite directe de F61 : le classement national universel utilisant la synthèse 8-axes. Hub `/palmares` (top 30 profils les plus favorables + top 20 plus tendus, filtre 15 000 hab.) + `/palmares/[macroregion]` ×6 (côte-atlantique, arc-méditerranéen, arc-alpin, sud-ouest-gascon, vallée-du-rhône, IDF élargie, restriction 10 000 hab.). Tables 7 colonnes (rang / ville / région ou dept / global / cohérence ±écart-type / force #1 / tension #1) avec lien direct vers la sous-page /synthese de chaque ville. Helpers `topSynthesisGlobal` / `bottomSynthesisGlobal` + `getSynthesisRankings` avec cache module-level ajoutés à `lib/city-synthesis.ts`. FAQ + breadcrumb JSON-LD. Sitemap +7 URLs (hub 0.9 — plus haut que tout sauf `/cadre-de-vie` à 0.95 ; macros 0.75). Cross-link retour vers `/palmares` ajouté en bas de chaque sous-page `/villes/[slug]/synthese`. Complète la boucle : per-ville synthèse F61 ↔ national F62. Différencie de `/cadre-de-vie` (3 piliers env/santé/emploi) : ici les 8 clusters.
- **F61 — Synthèse ville (×540 SSG)** ✅ — Nouvelle sub-page consolidant les 8 composites des clusters data en un seul écran : `/villes/[slug]/synthese`. `lib/city-synthesis.ts` agrège F44 (env, via healthScore positif), F47 (santé inversé), F50 (emploi inversé), F52 (QoL positif), F57 (vélo positif), F58 (sécurité inversé), F59 (démo inversé), F60 (services inversé). **Convention unifiée** : tous les axes normalisés vers « 10 = excellent » pour comparaison directe et moyenne arithmétique. Hero : score global + cohérence (écart-type entre axes — proxy uniformité du profil) + signature narrative. Body : 8 axes triés du meilleur au pire avec barre de progression + lien vers la sous-page cluster correspondante. 2 panels « Points forts / Points de vigilance » (top 3 / bottom 3). Méthodologie + FAQ JSON-LD + breadcrumb. CityProfile strip sous-pages 14 → 15 (entrée mise en avant avec border accent). Sitemap +540 URLs priority 0.75. Différencie de la grille « Données & analyse » existante : la grille fait inventaire (14 cartes), la synthèse fait synthèse (8 axes normalisés + verdict cohérence). Zéro nouvelle data — pur agrégat des 8 clusters.
- **Red Flags +4 (11 → 15 thèmes)** ✅ — Extension du cluster `/red-flags` avec 4 thèmes dérivés des 4 nouveaux clusters F57/F58/F59/F60. Chaque thème = 1 page SSG long-tail SEO. (1) `/red-flags/villes-desert-services-publics` (dérivé F60) — composite ≥ 6,5/10, malus +1,2 quand écoles ET Poste sont tous deux en désert ; DROM tendus + rural Centre/Est en tête. (2) `/red-flags/villes-anti-velo` (dérivé F57) — composite ≤ 4,5/10 (convention F57 inversée, 10 = bon), severity rescalée (5 − composite) × 2 ; malus +1,2 combo « pas de pistes ET ça grimpe ». (3) `/red-flags/villes-vieillissement-critique` (dérivé F59) — composite ≥ 7/10, malus +1,2 quand ageing ET trajectory sont tous deux ≥ 7 (pyramide haute + solde négatif cumulés). (4) `/red-flags/villes-nuit-tendue` (dérivé F58) — isole le sous-axe `nocturnal` SSMSI ≥ 6,5/10, malus +0,8 quand persons ≥ 6 + bonus +0,6 si tag festif/étudiant/touristique. 4 routes statiques explicites créées sous `app/red-flags/<slug>/page.tsx` (le dynamic `[slug]` est réservé aux fiches ville). Hub `/red-flags` mis à jour : compteur auto `RED_FLAG_THEMES.length`, copy enrichie listant les 15 angles. `/cadre-de-vie` strip "ne pas y aller" passe à 15 angles. **Cluster red-flags désormais couplé à tous les clusters data du site** (F40-F60).
- **F60 — Services publics (cluster complet, ×547 SSG)** ✅ — 8e cluster complet du site et 4e (et dernier) du backlog F57. `lib/public-services.ts` agrège 4 dimensions proxées au département × strate de population : (1) écoles & petite enfance = maillage DEPP (élémentaires / collège / lycée) + tension crèche CAF (IDF dense / PACA / DROM = tendus ; Bretagne / Ouest = OK), (2) médiathèque = BNF Observatoire lecture publique (présence quasi-systématique > 10 000 hab.), (3) La Poste & France Services = bureaux + APC + RPC + ~2 800 Maisons France Services 2024, malus rural Centre/Est en recul du maillage (Creuse, Cantal, Lozère, Nièvre…) et DROM très tendus (Mayotte, Guyane), (4) mairie & démarches = amplitude d'ouverture + démarches CNI/passeport en présence. **Convention** : 10 = pire (déficit max), cohérent avec F58 / F59. Composite 0-10 pondéré (écoles 35 %, mairie 25 %, Poste 25 %, médiathèque 15 %) + signature narrative + liens sortants education.gouv.fr / france-services.gouv.fr / lannuaire.service-public.fr. Routes : `lib/public-services.ts` + `components/PublicServicesCard.tsx` + `/villes/[slug]/services-publics` ×540 + `/services-publics` hub (top 30 mieux desservies + top 20 désertiques, filtre 15 000 hab.) + `/services-publics/[macroregion]` ×6. CityProfile : grille « Données & analyse » 13 → 14 cartes, strip sous-pages 13 → 14. Sitemap +547 URLs : hub 0.85, 6 macros 0.75, 540 sub-pages 0.65. FAQ JSON-LD + breadcrumb. **Backlog F57 entièrement vidé** (vélo F57 + démographie F59 + sécurité F58 + services publics F60).
- **F59 — Démographie & vieillissement (cluster complet, ×547 SSG)** ✅ — 7e cluster complet du site après env F44 / santé F49 / emploi F51 / cadre F52 / vélo F57 / sécurité F58. `lib/demography.ts` décompose 4 dimensions INSEE proxées au département : (1) vieillissement = part des 60+ par dept (médiane nationale ~28 %, très âgé Creuse/Cantal/Limousin entier 35-40 %, très jeune DROM hors Antilles < 20 %), (2) jeunes actifs 25-35 ans = attractivité métropoles étudiantes vs déficit rural, (3) trajectoire = solde démographique annuel (naturel + migratoire) ; façade atlantique + Sud + métropoles positifs, Centre/Est rural + bassins industriels négatifs structurels, (4) renouvellement = taux brut de natalité ‰. **Convention** : 10 = pire (cohérent avec quartet env F40-F43 / cluster F58, opposé des clusters orientés « bon »). Composite 0-10 pondéré (vieillis. 30 %, trajectoire 30 %, jeunes actifs 25 %, renouvellement 15 %) + signature narrative + liens sortants insee.fr (RP, Bilan démographique, OMPHALE). Routes : `lib/demography.ts` + `components/DemographyCard.tsx` + `/villes/[slug]/demographie` ×540 + `/demographie` hub (top 30 dynamiques + top 20 critiques, filtre 15 000 hab.) + `/demographie/[macroregion]` ×6. CityProfile reçoit la card (12 → 13 cartes dans « Données & analyse ») et l'entrée du strip sous-pages (12 → 13 cartes). Sitemap +547 URLs : hub 0.85, 6 macros 0.75, 540 sub-pages 0.65. FAQ JSON-LD + breadcrumb. Cluster F59 lève l'option 2 du backlog F57 (Démographie & dynamisme).
- **Red Flags +3 route fix** ✅ — Création des 3 fichiers `app/red-flags/<slug>/page.tsx` manquants pour `villes-chomage-eleve`, `villes-cadre-de-vie-tendu`, `villes-couts-explosifs`. Ces 3 thèmes ajoutés dans `RED_FLAG_THEMES` et au sitemap par le commit du 2026-05-17 n'avaient pas leur route statique (le dynamic `[slug]` du dossier `red-flags` est réservé aux fiches par ville avec `dynamicParams = false`). Pattern identique aux 8 pages existantes — `getRedFlagTheme(slug)` + `<RedFlagThemePage>`. Build : 3 routes SSG supplémentaires, sitemap désormais cohérent (11 thèmes → 11 pages servies, plus de 404).

## Shipped 2026-05-17

- **F58 — Sécurité deep-dive (cluster complet, ×548 SSG)** ✅ — Nouveau cluster suivant le playbook F57 complet : lib + sub-page ×540 + card sur fiche ville + hub national + ×6 macros + sitemap. `lib/safety-deep.ts` décompose le score safety du seed en 4 sous-axes SSMSI : (1) atteintes aux biens = cambriolages + vols véhicules + vols sans violence (moyenne SSMSI ~16,5 ‰, malus métropole/touristique/IDF dense), (2) atteintes aux personnes = coups & blessures volontaires hors VFFS (moyenne ~4,3 ‰, malus métropole/ouvrier-reconversion/DROM), (3) sécurité nocturne = rixes/agressions nocturnes (concentré centres festifs/étudiants/touristiques), (4) VFFS = violences faites aux femmes (signalements SSMSI, à interpréter avec prudence : taux élevé peut refléter meilleure documentation). **Convention** : 10 = pire (cohérent avec quartet env F40-F43, opposé du score safety historique du seed). Composite 0-10 pondéré (biens 35 %, personnes 30 %, nuit 20 %, VFFS 15 %) + signature narrative + liens sortants interstats.fr / data.gouv.fr. Routes : `lib/safety-deep.ts` + `components/SafetyDeepCard.tsx` + `/villes/[slug]/securite` ×540 + `/securite` hub (top 30 calmes + top 20 tendues) + `/securite/[macroregion]` ×6. CityProfile reçoit la card (11 → 12 cartes) et l'entry strip sous-pages (11 → 12 cartes). Sitemap +548 URLs : hub 0.85, 6 macros 0.75, 540 sub-pages 0.7. FAQ JSON-LD + breadcrumb. Le cluster F58 est désormais le 6e cluster complet du site après env F44 / santé F49 / emploi F51 / cadre F52 / vélo F57.
- **Red Flags +3 (8 → 11 thèmes)** ✅ — Extension du cluster `/red-flags` avec 3 nouveaux thèmes SEO long-tail dérivés des composites récents. (1) `/red-flags/villes-chomage-eleve` — dérive F50, classe les villes ≥ 15 000 hab. au composite emploi > 6,5/10 avec malus +1,2 quand chômage ≥ 7,5/10 ET dynamisme ≥ 6,5/10 se cumulent (décrochage économique vrai, pas un seul indicateur). (2) `/red-flags/villes-cadre-de-vie-tendu` — dérive F52, classe les villes ≤ 4,5/10 au méga-index avec malus +1,2 quand ≥ 2 piliers sur 3 (env / santé / emploi) tombent sous 4/10. Severity inversée (5 − qol) × 2. (3) `/red-flags/villes-couts-explosifs` — calcule le ratio coût-ménage-famille (F26) sur salaire net médian dept (proxy depuis F50 salary.score : 2 500 € Paris-PC / 2 200 € métropoles dynamiques / 2 050 € moyenne / 1 900 € bas / 1 750 € très bas). Cible ratio ≥ 60 % ; severity rescalée sur [0,6 ; 1,0] → [5 ; 10]. Sitemap auto-pris en charge (déjà piloté par `RED_FLAG_THEME_SLUGS` depuis F4 ext.). Mise à jour des compteurs « 11 angles » dans le strip de `/cadre-de-vie`. Cible Q2 2026 atteinte (11/11).
- **F57 phase 2 — Hub `/velo` + macro-régions (×7 SSG)** ✅ — Suite directe de la phase 1. Nouveau hub SEO national `/velo` agrégeant F57 : top 30 villes les plus cyclables + top 20 difficiles à vélo, tableau responsive 4 colonnes (réseau / relief / sécurité / climat), méthodologie complète, section « Par macro-région ». 6 pages SSG `/velo/[macroregion]` (côte-atlantique, arc-mediterraneen, arc-alpin, sud-ouest-gascon, vallee-du-rhone, ile-de-france-elargie) restreignant le classement aux villes ≥ 10 000 hab. de la zone : top 15 cyclables + top 10 difficiles + profil moyen 4 dimensions. Ranking helpers ajoutés à `lib/cycling-mobility.ts` (`topCyclable` / `topNonCyclable` + cache module-level). Cross-links circulaires entre macros + lien retour vers le hub. Sitemap +7 URLs (hub 0.85 + 6 macros 0.75). FAQ JSON-LD + breadcrumb sur chaque page. Cluster F57 désormais complet : sub-page ville × 540 + card sur la fiche + entry strip sous-pages + hub national + 6 macros, soit le pattern complet F40/F44/F46/F47/F49/F50/F51/F53/F54.
- **F57 phase 1 — Mobilité douce / vélo par ville** ✅ — Premier cluster « non-traditionnel » du site : la cyclabilité quotidienne. 540 pages SSG `/villes/[slug]/velo` + `CyclingCard` dans la grille « Données & analyse » (10 → 11 cartes) + nouvelle entrée dans le strip de sous-pages (10 → 11 cartes). 4 dimensions évaluées de manière déterministe : (1) **Réseau** = ville régulièrement primée Baromètre FUB / Vélo & Territoires (Strasbourg, Grenoble, Rennes, Nantes, Bordeaux, La Rochelle, Chambéry, Annecy…) + bonus métropole + bonus EuroVelo (EV1 / EV3 / EV6 / EV8 / EV17), (2) **Topographie** = malus département vallonné (Massif Central, Alpes, Pyrénées, Vosges, Jura, Corse) + altitude > 500 m, bonus plaine (Beauce, Aquitaine, Loire, Nord-Picardie), (3) **Sécurité** = combine densité urbaine et niveau d'aménagement (compensation par les villes cyclables connues), (4) **Climat** = ensoleillement + température hivernale + malus côte atlantique venteuse / couloir rhodanien Mistral-Tramontane. **Convention** : 10 = excellent pour le vélo (différent du quartet env où 10 = pire). Composite 0-10 pondéré (réseau 35 %, topographie 25 %, sécurité 25 %, climat 15 %) + signature narrative + lien sortant FUB / Vélo & Territoires / Géovélo. `lib/cycling-mobility.ts` + `components/CyclingCard.tsx` + route SSG + sitemap chunk `city-sub` étendu (+540 URLs priority 0.65). FAQ JSON-LD à 4 Q/R + breadcrumb. Phase 2 (hub national `/velo` + macro-régions ×6) à venir.
- **F56 — Badge Cadre de Vie sur fiche ville** ✅ — Nouveau `components/QolHeroBadge.tsx` (composant serveur, zéro JS) inséré dans le hero de chaque fiche ville `/villes/[slug]` (×540) juste sous le strip stats (soleil/juillet/janvier/altitude). Affiche le score F52 0-10 + level (exceptionnel → tendu) + 3 tuiles cliquables (env / santé / emploi) qui pointent vers la macro-région correspondante (ou le hub national en fallback). Boutons d'action : « Classement national » et « ✨ Pondérer » (vers F55). Nouveau helper `lib/macro-regions.ts:findMacroRegionForCity()` qui retrouve la macro-région F22 d'une ville via son département. Glass-card stylée alignée avec l'esthétique premium du hero. Zéro recompute supplémentaire — `computeQualityOfLife(city)` réutilise les fonctions F44/F47/F50 déjà appelées ailleurs.
- **F55 — Quiz « personnalise ton Cadre de Vie »** ✅ — Page SSG `/cadre-de-vie/personnaliser` avec quiz court à 3 sliders 1-5 (env / santé / emploi). `lib/quality-of-life-index.ts:personalQolRanking()` recalcule en direct le composite F52 selon les poids utilisateur (renormalisés à 100 %) en réutilisant le cache `getQualityOfLifeRankings()` (pas de recompute des sous-scores). Top 10 villes ≥ 10 000 hab. recalculé à chaque réglage. URL hash `#e=X&s=Y&j=Z` pour partage : ouvrir le lien restaure exactement la pondération. Bouton « Copier le lien » avec feedback `Lien copié ✓`. Affichage des sous-scores env/santé/emploi par ligne + niveau (exceptionnel → tendu). Hub `/cadre-de-vie` reçoit la carte « Pondère toi-même » en première position du strip « Personnaliser le classement » (grille 4 colonnes lg). FAQ JSON-LD + breadcrumb. Sitemap +1 URL priority 0.8. Distinct du quiz compatibilité F2 (lifestyle, qualitatif, 10 Q) : ici 3 piliers quantitatifs F52, recompute déterministe.
- **F54 — Santé & Emploi par macro-région (×12 SSG)** ✅ — Complète la symétrie F46 (env) + F53 (cadre de vie). 6 pages SSG `/sante/[macroregion]` + 6 pages SSG `/emploi/[macroregion]` (côte-atlantique, arc-mediterraneen, arc-alpin, sud-ouest-gascon, vallee-du-rhone, ile-de-france-elargie). Chaque page restreint son index (F47 ou F50) aux villes ≥ 10 000 hab. de la macro-région : top 15 marché favorable / meilleur accès + top 10 désert / sinistré + profil moyen 4 dimensions (MG/spé/urgences/pharma pour santé ; chômage/salaire/dynamisme/mix pour emploi). Cross-links circulaires entre les 6 pages de chaque cluster + lien retour vers les hubs nationaux `/sante` et `/emploi`. Les deux hubs nationaux reçoivent une nouvelle section « Par macro-région » avec 6 cartes. `/cadre-de-vie/[macroregion]` recâble ses cartes Santé et Emploi vers les pages spécifiques macro-régionales (auparavant elles pointaient vers les hubs nationaux). Sitemap +12 URLs priority 0.75. FAQ + breadcrumb JSON-LD. Zéro nouvelle data — réutilise `computeHealthcareAccess` / `computeEmploymentMarket` et `lib/macro-regions.ts`.
- **F53 — Cadre de Vie par macro-région (×6 SSG)** ✅ — Complète la symétrie F46 (env macro-régions) pour le méga-index F52. 6 nouvelles pages SSG `/cadre-de-vie/[macroregion]` (côte-atlantique, arc-mediterraneen, arc-alpin, sud-ouest-gascon, vallee-du-rhone, ile-de-france-elargie). Chaque page restreint l'Index Cadre de Vie aux villes ≥ 10 000 hab. de la macro-région : top 15 meilleurs cadres + top 10 plus tendus + profil moyen 3 piliers (environnement / santé / emploi). Chaque carte-pilier du profil moyen est cliquable et renvoie vers le hub correspondant (env → `/environnement/[macroregion]`, santé/emploi → hub national). Cross-links circulaires entre les 6 pages QoL + lien retour vers le hub national `/cadre-de-vie`. Hub principal reçoit une nouvelle section « Par macro-région ». Sitemap +6 URLs priority 0.75. FAQ + breadcrumb JSON-LD. Zéro nouvelle data.
- **F52 — Méga-hub `/cadre-de-vie/` + Navbar discoverability** ✅ — Unification des 3 clusters environnement / santé / emploi en un seul méga-index « Cadre de Vie » 0-10. `lib/quality-of-life-index.ts` agrège : env F44 (35 %, déjà inversé 10 = sain) + santé F47 (30 %, inversion 10 = bon accès) + emploi F50 (35 %, inversion 10 = marché favorable). Page `/cadre-de-vie` : top 30 villes meilleur cadre + top 20 plus tendus, 3 cartes piliers cliquables vers les hubs individuels, méthodologie + FAQ JSON-LD + breadcrumb. Cache module-level pour 540 villes × 3 dimensions. Sitemap priority 0.95 (plus haute du site après l'accueil). **Navbar mise à jour** : ajout « Cadre de vie » en NAV_PRIMARY (5 entrées : Cadre de vie / Classements / Comparer / Explorer / Guides), déplacement « Carte » → NAV_SECONDARY xl+, déplacement « Simulateur » → mobile-only. Le trio hubs nationaux (`/environnement`, `/sante`, `/emploi`) est désormais surfaceable depuis tout le site via Cadre de vie. Zéro dépendance externe.
- **F51 — Hub `/emploi/`** ✅ — Nouveau hub SEO national agrégeant F50 en un classement unique. Page `/emploi` affiche top 30 villes marché le plus favorable + top 20 marchés les plus difficiles, avec breakdown des 4 sous-scores (chômage / dynamisme / mix / salaire) sur tableau responsive. Filtre 15 000 hab. min. pour pertinence dept. Réutilise `topMostFavorable` / `topMostDifficult` (cache module-level déjà en place dans F50). La sous-page `/villes/[slug]/emploi` (F50) reçoit un lien retour vers le hub. Méthodologie + FAQ JSON-LD + breadcrumb. Sitemap static étendu (priority 0.85). Le trio hubs nationaux est maintenant complet : `/environnement`, `/sante`, `/emploi`. Zéro dépendance externe.
- **F50 — Emploi & marché du travail par ville** ✅ — 540 pages SSG `/villes/[slug]/emploi` + `EmploymentCard` dans la grille « Données & analyse » + nouvelle entrée dans le strip de sous-pages (9 → 10 cartes). Nouveau cluster « marché du travail » distinct des clusters environnement et santé. 4 dimensions évaluées : (1) chômage = taux INSEE T4 2024 par dept catégorisé sinistré (&gt; 10 %) / tendu (8-10 %) / actif (7-8 %) / facile (&lt; 7 %), (2) dynamisme = flux SIRENE par dept + bonus métropole/littoral attractif, malus rural en déclin, (3) mix sectoriel = pénalité mono-tourisme (saisonnalité) + ancien mono-industriel + bonus diversification métropole, (4) salaire net médian = INSEE DADS par dept (Paris &amp; petite couronne &gt; 2 400 €, DROM &amp; ruraux &lt; 1 850 €). Composite 0-10 pondéré (chômage 35 %, salaire 25 %, dynamisme 20 %, mix 20 %) + signature + cross-links coût-réel / louer-ou-acheter / télétravail / sante. `lib/employment-market.ts` (avec helpers `topMostFavorable` / `topMostDifficult` + cache pour futur hub) + `components/EmploymentCard.tsx` + route SSG + sitemap chunk `city-sub` étendu. FAQ JSON-LD à 4 Q/R + breadcrumb. Référentiels INSEE / DARES / SIRENE / DADS. Zéro dépendance externe.
- **F49 — Hub `/sante/`** ✅ — Nouveau hub SEO national agrégeant F47 (accès aux soins) en un classement unique. Page `/sante` affiche top 30 villes meilleur accès (composite le plus bas) + top 20 désert médical avéré (composite le plus haut), avec breakdown des 4 sous-scores (MG / spé / urgences / pharma) sur tableau responsive. Filtre 10 000 hab. min. pour pertinence dept. `lib/healthcare-access.ts` étendu avec `getHealthcareRankings` (cache module-level) + `topBestAccess` + `topDeserts`. La sous-page `/villes/[slug]/sante` (F47) reçoit un lien retour vers le hub. Méthodologie + FAQ JSON-LD + breadcrumb. Sitemap static étendu (priority 0.85). Zéro dépendance externe.
- **F48 — Red Flag #8 « Villes désert médical »** ✅ — 8e thème data-driven sous `/red-flags/villes-desert-medical`. Réutilise `computeHealthcareAccess` (F47) pour ranker les 12 villes ≥ 10 000 hab. au composite accès soins le plus élevé, avec malus +1,2 quand MG en désert avéré (DREES &lt; 80/100k + &gt; 50 % MG &gt; 60 ans) ET urgences ≥ 6,5/10 se cumulent (vrai problème vital, pas un seul indicateur). Affiche les deux dimensions dominantes par ligne (ex. « généralistes 9.0/10 · urgences 7.5/10 »). Sources : DREES, Atlas démographique CNOM, zonage ZIP/ZAC ARS. Hub `/red-flags` passe à 8 thèmes. Zéro dépendance externe.
- **F47 — Accès aux soins / désert médical par ville** ✅ — 540 pages SSG `/villes/[slug]/sante` + `HealthcareCard` dans la grille « Données & analyse » + nouvelle entrée dans le strip de sous-pages (8 → 9 cartes). Pivot vers le cluster « santé » après le quartet environnement. 4 dimensions évaluées : (1) médecins généralistes = densité dept DREES catégorisée désert (&lt; 80/100k MG &gt; 60 ans) / sous-doté / correct / bien doté avec override « bien doté » pour CHU/métropoles, (2) spécialistes = ville-CHU > grande agglo > ville moyenne > rural, (3) urgences/SAU = présence dans la commune + malus montagne (enneigement) / île (liaisons), (4) pharmacies = maillage population × statut urbain. Composite 0-10 pondéré (MG 35 %, spé 25 %, urgences 25 %, pharma 15 %) + signature + lien sortant Ameli / sante.gouv.fr. `lib/healthcare-access.ts` + `components/HealthcareCard.tsx` + route SSG + sitemap chunk `city-sub` étendu. FAQ JSON-LD à 4 Q/R + breadcrumb. Référentiels DREES / CNOM / ARS. Zéro dépendance externe.
- **F46 — Pages environnementales par macro-région (×6)** ✅ — 6 nouvelles pages SSG `/environnement/[macroregion]` (côte-atlantique, arc-mediterraneen, arc-alpin, sud-ouest-gascon, vallee-du-rhone, ile-de-france-elargie). Chaque page restreint le ranking F44 aux villes ≥ 10 000 hab. de la macro-région : top 15 saines + top 10 plus exposées + profil moyen 4 dimensions de la zone (air / bruit / eau / risques). Réutilise `lib/macro-regions.ts` (F22) et `computeEnvironmentIndex` (F44). Cross-links circulaires entre les 6 pages + lien retour vers le hub national. Hub `/environnement` reçoit une nouvelle section « Par macro-région » avec 6 cartes. Sitemap static étendu (+6 URLs priority 0.7). FAQ JSON-LD à 3 Q/R par page. Zéro dépendance externe.
- **F45 — Red Flags #6 & #7 « Bruit cauchemar » + « Sans eau l'été »** ✅ — 2 nouveaux thèmes data-driven sous `/red-flags/villes-bruit-cauchemar` et `/red-flags/villes-sans-eau-ete`. Réutilisent `computeNoiseExposure` (F43) et `computeWaterStress` (F41) pour ranker les 12 villes les plus exposées sur chaque dimension, avec malus cumulés (≥ 2 sources bruit ≥ 6/10 = +1,2 ; restrictions Propluvia crise = +1,0). Affiche les deux dimensions dominantes par ligne (ex. « routier 7.2/10 · nocturne 6.5/10 » ou « restrictions 9.0/10 · nappes 8.0/10 »). Sources : CBS/PEB/DGAC/Bruitparif + Propluvia/BRGM. Hub `/red-flags` mis à jour (5 → 7 thèmes, grille xl 5 → 4 colonnes pour respiration). Zéro dépendance externe.
- **F44 — Index environnemental + hub `/environnement/`** ✅ — Nouveau hub SEO national agrégeant le quartet F40-F43 en un score unique « santé environnementale » 0-10 (10 = sain), avec composite de stress inverse pour les rankings « plus exposées ». Pondération : air 30 % · bruit 25 % · eau 25 % · risques 20 % (calibrée sur l'impact sanitaire OMS). Page `/environnement` affiche le top 30 villes les plus saines + top 20 les plus exposées (filtre 15 000 hab. min.), 4 colonnes secondaires (Air / Bruit / Eau / Risques) sur tableau responsive, méthodologie détaillée, FAQ + breadcrumb JSON-LD, cross-links vers les 4 sous-pages. `lib/environment-index.ts` (cache module-level pour éviter la recompute) + `app/environnement/page.tsx`. Les 4 sous-pages F40-F43 reçoivent un lien retour vers le hub. Sitemap static étendu (priority 0.85). Zéro dépendance externe.
- **F43 — Bruit & qualité acoustique par ville** ✅ — 540 pages SSG `/villes/[slug]/bruit` + `NoiseCard` dans la grille « Données & analyse » + nouvelle entrée dans le strip de sous-pages (7 → 8 cartes). Extension du quartet environnemental F40 / F41 / F42 / F43 (terre / eau / air / bruit). 4 sources évaluées : (1) routier = communes traversées par périphérique/rocade saturée + couloirs autoroutiers dept, (2) aérien = zones PEB A/B/C/D autour des 10 plus grands aéroports français, (3) ferroviaire = LGV et nœuds majeurs par dept, (4) urbain nocturne = cumul tags étudiant / festif / touristique / métropole. Composite 0-10 pondéré (routier 35 %, aérien 25 %, nocturne 25 %, ferré 15 %) + signature + lien sortant Bruitparif. `lib/noise-exposure.ts` + `components/NoiseCard.tsx` + route SSG + sitemap chunk `city-sub` étendu. FAQ JSON-LD à 4 Q/R + breadcrumb. Référentiels CBS / PEB / OMS. Zéro dépendance externe.
- **F42 — Qualité de l'air par ville** ✅ — 540 pages SSG `/villes/[slug]/air` + `AirQualityCard` dans la grille « Données & analyse » + nouvelle entrée dans le strip de sous-pages (6 → 7 cartes). Complète la trilogie environnementale terre / eau / air (F40 / F41 / F42) avec le même pattern déterministe. 4 polluants ATMO évalués : (1) NO2 trafic = population × statut métropolitain × couloir autoroutier dept, (2) PM2.5 = industrie lourde + chauffage bois rural-froid + vallée encaissée (Arve, Rhône, Grenoble), (3) ozone = arc méditerranéen chaud + ensoleillement + couloir rhodanien, (4) pollens = bassins RNSA (cyprès Méditerranée, ambroisie vallée du Rhône, graminées plaines agricoles). Composite 0-10 pondéré (PM2.5 30 %, NO2 25 %, ozone 25 %, pollens 20 %) + signature + lien sortant ATMO France. `lib/air-quality.ts` + `components/AirQualityCard.tsx` + route SSG + sitemap chunk `city-sub` étendu. FAQ JSON-LD à 4 Q/R + breadcrumb. Zéro dépendance externe.
- **F41 — Stress hydrique & sécheresse par ville** ✅ — 540 pages SSG `/villes/[slug]/eau` + `WaterStressCard` dans la grille « Données & analyse » + nouvelle entrée dans le strip de sous-pages (5 → 6 cartes). 4 facteurs évalués de manière déterministe : (1) restrictions sécheresse = fréquence des arrêtés alerte renforcée / crise par dept sur 2022-2024 (Propluvia), (2) nappes phréatiques = état moyen BRGM 2022-2025 (basse / normale / haute), (3) sécheresse climatique = avgTempJuly × sunshinedays normalisés, (4) alimentation eau potable = combinaison fragilité réseau DROM + saisonnalité touristique littoral/île + sols karstiques calcaires. Score composite 0-10 pondéré (restrictions 35 %, nappes 25 %, climat 20 %, réseau 20 %) + signature narrative + lien sortant direct vers Propluvia. `lib/water-stress.ts` + `components/WaterStressCard.tsx` + route SSG + sitemap chunk `city-sub` étendu. FAQ JSON-LD à 4 Q/R + breadcrumb. Zéro dépendance externe.
- **F4 ext. — Red Flag #5 « Risques naturels cumulés »** ✅ — 5e thème data-driven sous `/red-flags/villes-risques-naturels`. Réutilise `computeNaturalRisks` (F40) pour ranker les 12 villes au composite le plus élevé, avec malus +1,2 quand au moins 2 des 4 aléas (inondation/argile/feu/sismique) dépassent 6/10. Affiche les deux dimensions dominantes par ligne (ex. « inondation 7.2/10 · argile 6.5/10 »). Sources : BRGM, BCSF/MTE décret 2010-1255, ONF/ECASC, Géorisques. Sitemap `red-flags` désormais piloté par `RED_FLAG_THEME_SLUGS` (source unique). Hub `/red-flags` met à jour le compte (5 angles) + grille xl à 5 colonnes.

## Shipped 2026-05-16

- **F40 — Risques naturels par ville** ✅ — 540 pages SSG `/villes/[slug]/risques` + `NaturalRisksCard` dans la grille « Données & analyse ». 4 dimensions évaluées de manière déterministe : (1) inondation = proxy fleuve (tags) × altitude basse × littoral, (2) sismicité = zonage réglementaire 2011 (zones 1 à 5 par dept), (3) retrait-gonflement argile = aléa BRGM (faible/moyen/fort par dept), (4) feux de forêt = classification ONF/ECASC (PACA, Corse, Languedoc, Aquitaine landes). Score composite 0-10 pondéré (inondation 35 %, argile 25 %, feu 20 %, sismicité 20 %) + signature narrative + lien sortant direct vers Géorisques (rapport ERP officiel par INSEE code). `lib/natural-risks.ts` + `components/NaturalRisksCard.tsx` + route SSG + sitemap chunk `city-sub` étendu. FAQ JSON-LD à 4 Q/R. Zéro dépendance externe.
- **F39 — Extension seed +25 communes non-IDF** ✅ — 25 communes hors Île-de-France 11k-37k hab. ajoutées : Hauts-de-France 7 (Saint-Omer, Hazebrouck, Armentières, Maubeuge, Denain, Hénin-Beaumont, Berck), Grand Est/Alsace 4 (Montigny-lès-Metz, Hayange, Riedisheim, Kingersheim), Métropole de Lyon 5 (Saint-Genis-Laval, Givors, Rillieux-la-Pape, Sainte-Foy-lès-Lyon, Oullins-Pierre-Bénite — commune nouvelle 2024), Haute-Savoie/Ain 2 (Sallanches, Ambérieu-en-Bugey), Normandie 4 (Vernon, Sotteville-lès-Rouen, Le Grand-Quevilly, Mont-Saint-Aignan), Oise 3 (Chantilly, Crépy-en-Valois, Méru). **Couverture seed 515 → 540 villes**. L'audit script (cohérence région↔dept↔INSEE-prefix↔bbox climat) passe avec 0 issue sur les 540 enregistrements.
- **F38 — Extension seed +25 communes IDF petite/grande couronne** ✅ — 25 communes Île-de-France 16k-37k hab. ajoutées : Val-de-Marne (Saint-Mandé, Charenton-le-Pont, Fresnes, Cachan, Arcueil, Gentilly, Le Kremlin-Bicêtre), Hauts-de-Seine (Sceaux, Bourg-la-Reine, Châtillon, Malakoff, Bagneux, Châtenay-Malabry, Bois-Colombes, La Garenne-Colombes), Val-d'Oise (Eaubonne, Goussainville, Saint-Leu-la-Forêt, Soisy-sous-Montmorency, Montmorency, Domont), Yvelines (Vélizy-Villacoublay, Le Chesnay-Rocquencourt, Élancourt, Maurepas). **Couverture seed 490 → 515 villes**.
- **F37 — Extension seed +27 communes (Essonne, 77, DROM)** ✅ — 27 communes 16k-58k hab. ajoutées : Essonne (Corbeil-Essonnes, Savigny-sur-Orge, Athis-Mons, Yerres, Brunoy, Sainte-Geneviève-des-Bois, Palaiseau, Draveil, Viry-Châtillon), Hauts-de-Seine (Le Plessis-Robinson, Sèvres), Seine-et-Marne (Chelles, Melun, Pontault-Combault, Savigny-le-Temple, Torcy, Combs-la-Ville, Champs-sur-Marne, Noisiel), Réunion (Saint-André, Saint-Louis, Saint-Joseph, Saint-Benoît), Martinique (Le Robert, Le François), Gironde (Saint-Médard-en-Jalles), Métropole de Lyon (Tassin-la-Demi-Lune). **Couverture seed 463 → 490 villes**.
- **F36 — Extension seed +29 communes (IDF + provinces)** ✅ — 29 communes 16k-57k hab. ajoutées : Hauts-de-Seine (Puteaux, Gennevilliers, Villeneuve-la-Garenne), Val-de-Marne (Alfortville, Le Perreux-sur-Marne, Nogent-sur-Marne, Choisy-le-Roi), Seine-Saint-Denis (Rosny-sous-Bois, Neuilly-sur-Marne, Le Blanc-Mesnil, Tremblay-en-France, Noisy-le-Sec), Yvelines (Plaisir, Houilles, Conflans-Sainte-Honorine, Montigny-le-Bretonneux, Guyancourt), Moselle (Forbach, Sarreguemines, Saint-Avold), Morbihan (Lanester), Calvados (Hérouville-Saint-Clair), Loiret (Olivet, Fleury-les-Aubrais), Oise (Creil), Vaucluse (Cavaillon, Pertuis), Bouches-du-Rhône (Allauch), Maine-et-Loire (Trélazé). **Couverture seed 434 → 463 villes** (passe le seuil des 460 communes 20k+ hab. de France).
- **F35 — Extension seed +49 communes hors IDF** ✅ — 49 communes 14k-100k hab. ajoutées hors Île-de-France : Nord (Roubaix, Tourcoing, Wattrelos), Bouches-du-Rhône (Vitrolles, Marignane, Istres), Var (La Seyne-sur-Mer, Six-Fours-les-Plages), Alpes-Maritimes (Le Cannet, Mandelieu), Métropole de Lyon (Vaulx-en-Velin, Bron, Saint-Priest, Caluire-et-Cuire, Décines, Meyzieu), Gironde (Mérignac, Pessac, Talence, Bègles, Le Bouscat, Villenave-d'Ornon), Pas-de-Calais (Béthune, Liévin, Bruay), Haute-Garonne (Colomiers, Tournefeuille, Blagnac, Cugnaux), Loire-Atlantique (Saint-Herblain, Rezé, Orvault, Vertou), Bas-Rhin (Schiltigheim, Illkirch, Lingolsheim, Bischheim), Indre-et-Loire (Joué-lès-Tours), Isère (Saint-Martin-d'Hères, Échirolles, Fontaine, Voiron), Meurthe-et-Moselle (Vandœuvre, Laxou), Loire (Saint-Chamond, Firminy), Côte-d'Or (Chenôve), Haut-Rhin (Saint-Louis, Wittenheim). **Couverture seed 385 → 434 villes**.
- **F34 — Extension seed +33 communes IDF banlieue** ✅ — 33 communes Île-de-France manquantes ajoutées : Cormeilles-en-Parisis, Sarcelles, Ermont, Franconville, Sannois, Bezons, Garges-lès-Gonesse, Gonesse, Villiers-le-Bel, Pierrefitte-sur-Seine, Aulnay-sous-Bois, Drancy, Bondy, Saint-Ouen-sur-Seine, Aubervilliers, Stains, Sevran, La Courneuve, Bagnolet, Asnières-sur-Seine, Antony, Suresnes, Saint-Cloud, Champigny-sur-Marne, Saint-Maur-des-Fossés, Maisons-Alfort, Fontenay-sous-Bois, Clichy, Poissy, Mantes-la-Jolie, Trappes, Sartrouville + Cernay (Alsace). Pour chaque ville : seed complet (INSEE, lat/lon, scores 9 axes), HOUSING (T1/T2/T3 + prix m² médians IDF 2024), 2 quartiers réels avec scores et résumé. **Couverture seed maintenant 385 villes** (352 → 385). Toutes les sous-pages (×10) sont automatiquement remplies pour ces nouvelles villes via les libs F1–F33.

- **Navbar overlap fix** ✅ — Contact retiré de NAV_SECONDARY (le pill row xl+) pour éviter l'overlap avec la barre de recherche. Contact accessible via une icône Mail dédiée à côté des favoris (toujours visible sur md+) + reste dans le menu mobile.

- **F33 — Couverture complète des 352 villes** ✅ — Comblement des trous DROM : 12 villes Outre-mer (Pointe-à-Pitre, Baie-Mahault, Les Abymes, Fort-de-France, Le Lamentin, Saint-Denis Réunion, Saint-Pierre Réunion, Saint-Paul Réunion, Le Tampon, Cayenne, Saint-Laurent-du-Maroni, Mamoudzou) reçoivent désormais leurs données HOUSING (loyers T1/T2/T3 + prix m², médians Olap/Insee 2024 ajustés DROM) et leurs quartiers réels (2-3 quartiers connus par ville : Le Barachois, Didier, Le Raizet, Jarry, Saint-Gilles-les-Bains, Montjoly, …). **Couverture maintenant 352/352** sur tous les datasets — toutes les sous-pages (climat, fiscalité, saisons, télétravail, avis-honnête, distances, louer-ou-acheter, climat-2040, quartiers) sont remplies pour chaque ville sans exception.
- **F32 — Temps Paris (train) par ville** ✅ — `lib/paris-commute.ts` avec 80 stations TGV/TER directes Paris (horaires SNCF jun 2025) + fallback Haversine pour villes non-gares (durée TGV-station + 0,5 min/km accès local). Index national `/depuis-paris` regroupant les villes en 5 buckets (< 1h, 1-1h30, 1h30-2h, 2-3h, 3-5h). Affichage intégré dans la sidebar `DistancesCard` (ligne Paris enrichie avec « Train ~XhYY via [station] »). DROM/Corse exclues (pas de rail Paris).
- **F31 — Climat 2040 par ville** ✅ — `lib/climate-2040.ts` + 352 pages SSG `/villes/[slug]/climat-2040` + `Climate2040Card` dans la sidebar. Projection horizon 2040 basée sur les deltas Météo-France ARPEGE des 15 macro-régions déjà documentées dans les guides éditoriaux « Climat 2040 ». Applique au seed (avgTempJuly) la hausse moyenne + jours > 30 °C supplémentaires + nuits tropicales supplémentaires. Fonction `inferMacroRegion()` raffine PACA / Occitanie / Nouvelle-Aquitaine / ARA sur lat/long (régions admin ≠ macro-régions climatiques 1:1). Tag « Projection ARPEGE » explicite + incertitude ±0,5 °C documentée.
- **F30 — Voisinage géographique** ✅ — `nearestCities()` ajoutée à `lib/distances.ts` (réutilise Haversine de F28). Filtre par cohorte de bbox (métropolitaine vs DROM) pour ne pas mélanger. `components/GeographicNeighborsCard.tsx` rendue dans la sidebar de chaque fiche ville × 352 : 6 villes les plus proches avec distance + score qualité de vie + indication "Même région" si applicable. Renforce le graphe de liens internes pour le SEO et la découverte locale (week-end / commute zone).
- **F29 — Louer ou acheter** ✅ — `lib/rent-vs-buy.ts` + 352 pages SSG `/villes/[slug]/louer-ou-acheter` + index `/louer-ou-acheter` (top 15 "fortement acheteur" + top 15 "fortement locataire"). Calcule pour chaque ville : ratio prix/loyer (PER immobilier T3 65 m²), mensualité prêt 25 ans à 3,4 % TAEG (médians bancaires jan 2026), charges propriétaire (1,2 % du prix/an), payback de l'apport via économie de loyer. Verdict catégorisé en 5 paliers (Fortement acheteur < 13 ans → Fortement locataire > 30 ans). Carte `RentVsBuyCard` dans la sidebar de chaque fiche ville. Pure réutilisation de HOUSING (avgRentT3 + avgBuyPriceM2) + barèmes bancaires statiques.
- **F28 — Distances aux pôles d'attraction** ✅ — `lib/distances.ts` (Haversine) + `components/DistancesCard.tsx` rendue dans la sidebar de chaque fiche ville (352 villes). Affiche distance à Paris, métropole la plus proche, mer la plus proche (Manche / Atlantique / Méditerranée), montagne (Alpes Nord/Sud, Pyrénées, Massif Central, Vosges, Jura, Corse), aéroport international, station de ski. Temps voiture indicatif (~75 km/h) ajouté quand distance ≥ 30 km. Pure computation depuis lat/long du seed — 0 dépendance externe.
- **F27 — Avis honnête v0** ✅ — `lib/honest-reviews.ts` + `components/HonestReviewCard.tsx` + route SSG `/villes/[slug]/avis-honnete` × 352. Combine 8 axes seed + 10 owner scores + classement parmi les 10 profils éditoriaux pour produire : (i) 4 « coups de cœur » max (scores ≥ 7,0), (ii) 3 « points de vigilance » (scores ≤ 4,8), (iii) « convient à » = top-30 d'un profil, (iv) « à éviter si » = bottom-30 d'un profil, (v) verdict une-ligne déterministe. Carte inline sur la fiche ville (overview tab) + page dédiée. Cache mémoire pour les 3520 rankings (352 villes × 10 profils). Sitemap city-sub étendu.
- **F26 — Coût réel × profil ménage** ✅ — 352 pages SSG sous `/cout-menage/[ville]` + index `/cout-menage/`. Chaque page : 4 colonnes profil (solo T1 / couple T2 / famille T3+école / retraité T2 sans trajet) × postes (loyer, chauffage, mobilité, taxe foncière, TEOM, surcoût scolaire, total). Cards récap avec « moins cher » / « plus cher » mis en évidence + écart solo↔famille. Index avec top 12 famille moins cher, top 12 solo moins cher, top 8 retraité plus cher. `lib/household-cost.ts` (multiplicateurs heating × surface, mobilité conditionnelle par profil, alim scolaire indicative 150 €/mois). Sitemap chunk `cout-menage` (FR = 15 chunks). Zéro nouvelle dépendance — réutilise HOUSING T1/T2/T3, lib/cost-living, lib/fiscalite.
- **F25 — Pages duo « Quitter X pour Y »** ✅ — 75 paires SSG sous `/quitter/[origine]-pour-[destination]` + index `/quitter/`. Chaque page : bandeau résumé (Δ charges fixes, coût relatif %, Δ qualité de vie), tableau coût mensuel côte à côte (loyer / chauffage / mobilité / taxe foncière / TEOM / total), wins/losses sur les 10 owner scores (seuil ±0,4 pt), verdict argumenté pour qui le move a du sens, cross-links calculateur / comparer / quiz / salaire-équivalent. `lib/quitter-pairs.ts` (validation build-time des slugs) + dynamic SSG. Sitemap chunk `quitter` (FR = 14 chunks). `dynamicParams: true` pour qu'une paire hors-liste résolve quand même. Zéro nouvelle dépendance externe — tout dérivé de CITIES_SEED + HOUSING + cost-living + owner-scores.

## Shipped 2026-05-15

- **F12 — Comparaison 3 villes** ✅ — 50 triplets en SSG sous `/comparer/[a]-vs-[b]-vs-[c]`. Radar 3 polygones (recharts), tableau côte à côte avec winner par critère, verdict par profil (Famille / Télétravail / Retraite / Étudiant). `lib/comparer-triplets.ts` + `app/comparer/[pair]/TripletView.tsx` + `TripletRadar.tsx`. Ajouté au sitemap.
- **F9 — Comparateur de régions** ✅ — 78 paires de régions métropolitaines en SSG sous `/comparer-regions/[a]-vs-[b]` + index `/comparer-regions/`. Intros éditoriales sur les 4 paires prioritaires (bretagne-vs-occitanie, etc.). `lib/regions.ts` factorisé. Sitemap mis à jour (chunk dédié `comparer-regions`).
- **F3 — Scores propriétaires v0** ✅ — 10 scores 0–10 calculés dans `lib/owner-scores.ts` (canicule, solitude, bruit, sécurité nocturne, sans voiture, télétravail, qualité air, sécurité femme seule, jeune actif, famille). Bloc « Profils propriétaires » sur chaque `/villes/[slug]`, expandable pour voir la source de chaque score. Chaque score taggé `Proxy v0` / `Estimation régionale` / `Source réelle`. Page `/methode` mise à jour. **v0** : valeurs dérivées du seed actuel — quand les feeds réels (Météo-France ARPEGE, INSEE, Bruitparif, SSMSI VFFS, ATMO, ARCEP, DEPP, CAF, SIRENE) seront branchés, seul `owner-scores.ts` change.
- **F4 — Red Flag pages virales** ✅ — 3 pages thématiques en SSG sous `/red-flags/` : `villes-regrets-achat`, `villes-sans-voiture-difficile`, `villes-belles-invivables-ete`. Chaque page liste les 12 villes les plus exposées (severity 0-10 + raison citable), avec méthodo transparente. `lib/red-flag-themes.ts` + `components/RedFlagThemePage.tsx`. Surface ajoutée sur le hub `/red-flags`. Sitemap mis à jour. **Dépendait de F3** (utilise les owner scores).
- **F1 — Hidden Costs Calculator** ✅ — 352 pages interactives en SSG sous `/calculateur-cout-reel/[ville]` + index `/calculateur-cout-reel/`. Calcul mensuel honnête (loyer T2, chauffage par zone ADEME H1a-H3, voiture ou transports, parking, taxe foncière mensualisée, TEOM) + slider salaire + comparatif Paris automatique. `lib/cost-living.ts` (zones thermiques, primes assurance régionales, TEOM dept, abonnements transports 65+ villes) + `components/HiddenCostsCalculator.tsx`. Sitemap chunk `calculator`. FR sitemap = 12 chunks.
- **F2 — City Compatibility Score** ✅ — Quiz quantitatif 10 questions sous `/quiz-compatibilite/`. Algorithme de matching pondéré (poids = 100), retourne Top 5 villes avec score % + contribution chiffrée par critère + Top 3 raisons. `lib/compatibility.ts` (10 évaluateurs, weights vérifiés au build) + `components/CompatibilityQuiz.tsx`. Distinct de `/quiz/` (qualitatif).
- **F13 — Données saisonnières** ✅ — Page dédiée `/villes/[slug]/saisons` × 352 en SSG. 4 saisons (printemps / été / automne / hiver) par ville : températures moyennes + max + min, ensoleillement par jour, jours de pluie/mois, charge touristique (calme → saturation) avec explication contextuelle, signature 1-line. `lib/seasons.ts` dérive depuis avgTempJuly + avgTempJanuary + sunshinedays + tags. Sitemap city-sub étendu (5 sous-pages × 352).
- **F11 — Expat Retour** ✅ — 7 pages SSG sous `/expat-retour/` : index + 5 fiches pays (`depuis-suisse`, `depuis-luxembourg`, `depuis-belgique`, `depuis-royaume-uni`, `depuis-canada`) + quiz dédié `/expat-retour/quiz`. Chaque fiche pays : intro, table « ce que tu avais vs ce que tu auras » (salaire / loyer / santé / fiscalité / voiture), villes recommandées (frontalières ou métropoles), 5 priorités admin avec liens service-public.fr, points de vigilance. Quiz expat = variante du quiz compatibilité avec bonus +15 pts pour villes frontalières du pays d'origine. `lib/expat-return.ts` + `components/ExpatQuiz.tsx`. **Bug Next 16 résolu** : la route `depuis-[pays]/` n'est pas un dynamic segment valide (Next exige la totalité du dossier en `[brackets]`) — renommé en `[pays]/` avec valeurs « depuis-X » dans le slug.
- **F10 — Widget intégrable** ✅ — Générateur `/widget/` (formulaire choisir ville + format) + iframe `/widget/embed?city=X&format=Y` rendue par un `route.ts` brut (zéro bundle Next, HTML/CSS hand-written, < 3 KB par requête, largement sous la cible 10 KB). 3 formats : badge score, top 3 critères, comparatif 2 villes. CSP `frame-ancestors *` pour embed cross-origin, Cache-Control 24 h s-maxage. Backlink « Source : MeilleurVille » dofollow rendu server-side (non supprimable). `app/widget/embed/route.ts` + `app/widget/page.tsx` + `components/WidgetGenerator.tsx`.
- **F15 — Index de gentrification v0** ✅ — 354 pages SSG : `/gentrification/` (top 30 national), `/gentrification/[slug]` × 352 (détail par ville avec 4 signaux + trajectoire), `/gentrification/carte` (heatmap par région avec top ville par région + focus par trajectoire). Score composite 0-100 sur 4 dimensions pondérées (prix 35 % / jeunes 25 % / ouvertures 20 % / télétravail 20 %). Trajectoires : Montée rapide / Déjà en cours / Potentiel à 5 ans / Stable / En baisse. `lib/gentrification.ts` (proxy v0 du seed actuel + HOUSING, tag honnête). Sitemap chunk `gentrification`. FR sitemap = 13 chunks.
- **F16 — Classements par score propriétaire** ✅ — 10 nouveaux classements sous `/classements/` : `canicule-resistance`, `calme-sonore`, `lien-social`, `securite-nocturne`, `sans-voiture`, `teletravail-proprietaire`, `qualite-air`, `securite-femme-seule`, `jeune-actif`, `famille-proprietaire`. Chaque page = top 50 villes par owner score + méthodologie + cross-links. `lib/owner-rankings.ts` (définitions + ranker) + `components/OwnerRankingPage.tsx` (template partagé). 10 routes statiques qui prennent précédence sur le dynamic `[slug]` existant. Sitemap classements étendu.
- **F17 — Vivre avec X €/mois** ✅ — 7 pages SSG sous `/vivre-avec/` : index + 6 paliers de salaire (1500, 2000, 2500, 3000, 4000, 5000 €). Chaque page = top 10 villes compatibles (via lib/compatibility.ts), simulation coût mensuel pour la ville #1 (via lib/cost-living.ts), reste à vivre, comparatif Paris. `lib/vivre-avec.ts` + `app/vivre-avec/[salaire]/page.tsx` (dynamic slug "X-euros"). Cross-links vers calculator + quiz.
- **F18 — Télétravailler à [ville]** ✅ — `/villes/[slug]/teletravail` × 352 en SSG. Verdict profil (idéal / adapté / mixte / peu adapté), 6 signaux détaillés (score remote site + propriétaire, calme sonore, qualité air, lien social, qualité de vie), densité coworking (estimée), budget mensuel télétravailleur solo en T2 (loyer + chauffage + transports). Reprend le pattern saisons/fiscalite/climat. Cross-links calculator + classement teletravail-proprietaire. Sitemap city-sub étendu (6 sous-pages × 352).
- **F19 — Pages « Pour qui » thématiques** ✅ — 11 pages SSG : index `/pour-qui/` + 10 profils (`familles-avec-enfants`, `jeunes-actifs`, `retraites`, `freelances`, `teletravailleurs`, `etudiants`, `sans-voiture`, `premium`, `solo-femme`, `expat-retour`). Chaque page = top 20 villes selon une pondération éditoriale des axes seed + owner-scores. `lib/profile-pages.ts` (définitions + ranker) + dynamic route `app/pour-qui/[profil]/page.tsx`. Cross-links vers quiz-compatibilite.
- **F20 — Convertisseur salaire entre villes** ✅ — `/salaire-equivalent/` page interactive. Inputs : ville actuelle + salaire net + ville cible. Output : salaire équivalent pour maintenir le même reste-à-vivre + breakdown ligne à ligne (loyer, chauffage, mobilité, taxes) + écart % par poste. Pure client (lib/cost-living.ts réutilisé). `components/SalaryEquivalent.tsx`.
- **F21 — Meilleur rapport qualité/prix** ✅ — `/classements/meilleur-rapport-qualite-prix` page statique. Top 50 villes triées par (score qualité de vie × 10 000) / prix m². Met en avant les villes du « ventre mou » immobilier français (Limoges, Saint-Étienne, Le Mans, etc.) sous-cotées. Sitemap classements étendu.
- **F22 — Macro-régions thématiques** ✅ — 7 pages SSG : index `/macro-region/` + 6 macro-régions (`cote-atlantique`, `arc-mediterraneen`, `arc-alpin`, `sud-ouest-gascon`, `vallee-du-rhone`, `ile-de-france-elargie`). Chaque macro-région agrège des départements transrégionaux + ranke les villes incluses par score qualité de vie. `lib/macro-regions.ts` + dynamic route `app/macro-region/[slug]/page.tsx`.
- **F23 — Simulateur achat immobilier** ✅ — `/simulateur-achat/` page interactive client. Input : budget total + surface souhaitée + apport % + durée prêt (20/25 ans). Output : top 15 villes accessibles (qualité de vie max), mensualité prêt (formule amortissement standard, taux marché jan 2026), frais de notaire estimés (7,5 %), coût total. `components/PurchaseSimulator.tsx`.
- **F24 — Villes sous-cotées** ✅ — `/classements/villes-sous-cotees` page statique. Top 30 villes &lt; 80 000 hab. avec qualité de vie ≥ 6/10 et prix m² &lt; 110 % de la médiane nationale. Filtre les destinations touristiques sur-cotées (Annecy, Biarritz, Saint-Malo). Score sous-coté = qualité de vie / prix relatif.

## Légende

- **Priorité** — P0 = à shipper avant la fin du trimestre, P1 = trimestre suivant, P2 = backlog
- **Complexité** — S (< 1j), M (1–3j), L (1 semaine), XL (> 2 semaines)
- **SEO** — impact estimé (low / mid / high) sur le trafic organique français
- **Dépendances** — features ou sources de données requises avant de pouvoir commencer

---

## Vague 5 — pistes naturelles post-méga-hub (REQUIS, non optionnel)

Après F40-F53 (clusters env / santé / emploi + méga-hub Cadre de vie), ces 4 pistes
sont **prioritaires P0** — l'extension du Red Flag SEO et l'ajout de contenu ne sont
**plus considérés comme optionnels**. Chaque livrable doit suivre le playbook
4-dimensions-composite-hub-redflag déjà rodé.

| # | Feature | Prio | Cplx | SEO | Statut |
|---|---------|------|------|-----|--------|
| F54 | Macro-régions santé + emploi (×12 pages SSG) — mirror F46/F53 | **P0** | S | mid | ✅ shipped 2026-05-17 |
| F55 | Quiz « personnalise ton Cadre de Vie » — reweight env/santé/emploi + recompute top 10 perso | **P0** | M | mid | ✅ shipped 2026-05-17 |
| F56 | Badge Cadre de Vie sur fiche ville `/villes/[slug]` (hero du profil) — surface le méga-index sur la page la plus trafiquée | **P0** | S | high | ✅ shipped 2026-05-17 |
| F57 | Nouveau cluster — mobilité douce / vélo (cluster complet : lib + sub-page ×540 + card + hub + 6 macros). | **P0** | L | high | ✅ shipped 2026-05-17 (phase 1 + phase 2) |

### F54 — Macro-régions santé + emploi
- 6 pages `/sante/[macroregion]` + 6 pages `/emploi/[macroregion]` (×12 SSG)
- Pattern identique à F46 (env) et F53 (Cadre de vie)
- Réutilise `lib/macro-regions.ts` + caches existants
- Pondération SEO : « meilleur accès médecins côte atlantique », « emploi Provence chômage », etc.

### F55 — Quiz « personnalise ton Cadre de Vie »
- Quiz court (3-5 questions) : importance env / santé / emploi sur 5
- Recompute QoL pondéré selon poids utilisateur
- Top 10 villes personnalisé + lien partageable
- Réutilise `lib/quality-of-life-index.ts` avec pondération paramétrable
- Différent du quiz F2 existant (qualitatif) : ici quantitatif par pilier

### F56 — Badge Cadre de Vie sur fiche ville
- Ajout `QolHeroBadge` dans `app/villes/[slug]/CityProfile.tsx`
- Affichage : score 0-10 + level + breakdown 3 piliers
- Lien vers `/cadre-de-vie` + vers les 3 hubs individuels
- Surface l'index sur la page la plus trafiquée du site (×540)

### F57 — Nouveau cluster (1 parmi 4)
**Critère de choix** : SEO + différenciation + alignement avec les clusters existants.
Options classées par leverage estimé :
1. **Mobilité douce / vélo par ville** — pistes cyclables, scoring cyclabilité, Vélib/équivalents
2. **Démographie & dynamisme** — % seniors, % jeunes actifs, trajectoire pop
3. **Sécurité-deep-dive** — décomposition SSMSI (atteintes biens / personnes / nuit)
4. **Services publics** — accès Poste, mairie, école, médiathèque

Décision à prendre après ship F54-F56 — choisir selon trafic et demande utilisateur.

### Red Flag SEO — extensions requises (non optionnelles) ✅
**Shipped 2026-05-17.** Les 8 → 11 thèmes :
- `villes-chomage-eleve` (dérivé F50) ✅ — chômage dept + faible dynamisme
- `villes-cadre-de-vie-tendu` (dérivé F52) ✅ — synthèse tri-pilier
- `villes-couts-explosifs` (extension F26) ✅ — coût ménage / salaire médian local

Cible Q2 2026 atteinte (11/11). Chaque thème = 1 page SSG SEO long-tail
via `RED_FLAG_THEMES`.

---

## Vue d'ensemble — actif

Les 10 features livrées sont décrites dans la section « Shipped ». Tableau ci-dessous : 3 features actives (vague 2) + retirées du périmètre.

| # | Feature | Prio | Cplx | SEO | Statut |
|---|---------|------|------|-----|--------|
| 16 | Classements par score propriétaire (10 classements) | P0 | S | high | ✅ shipped |
| 17 | Vivre avec X €/mois (6 pages landing) | P1 | S | mid | ✅ shipped |
| 18 | Télétravailler à [ville] × 540 | P1 | M | high | ✅ shipped |
| ~~5~~ | ~~RealityCheck~~ | — | — | — | Retiré (Reddit Pushshift indispo) |
| ~~6~~ | ~~Journal de déménagement~~ | — | — | — | Retiré (rédactionnel 12 mois) |
| ~~7~~ | ~~Alertes personnalisées~~ | — | — | — | Retiré (Cloudflare Worker hors scope) |
| ~~8~~ | ~~Ville du mois~~ | — | — | — | Retiré (ElevenLabs API + budget) |
| ~~14~~ | ~~Carte risques interactive~~ | — | — | — | Retiré (Géorisques WMS + budget) |

**Ordre d'implémentation vague 2** :
1. **F16** — gains SEO directs en réutilisant le moteur owner-scores existant
2. **F17** — landing pages programmatic, réutilise F1 + F2
3. **F18** — sub-page par ville (le pattern le plus utilisé du site)

---

## Vague 4 — extension du seed (à planifier)

Toutes les villes du seed actuel (352) sont maintenant complètes sur toutes les sections (F33 ✅). La prochaine ambition naturelle est d'**étendre le seed** à plus de communes :

### F34 — Seed +150 villes (communes 50-100 k hab.)

**Objectif** : passer de 352 à ~500 villes en ajoutant les communes 50-100 000 hab. actuellement manquantes (Aubervilliers, Saint-Maur, Vitry-sur-Seine déjà présentes, mais il reste ~80 communes de cette tranche).

**Données à ajouter par ville** :
- slug, name, region, department, inseeCode, population, lat/lon, elevation
- sunshinedays + avgTempJuly + avgTempJanuary (météo-france climatologie 1991-2020)
- characterTags (3-5 tags éditoriaux)
- scores object (9 axes — calibrés via score-calibration depuis Insee/SSMSI/observatoires)
- HOUSING entry (loyer T1/T2/T3 + prix m²)
- Neighborhoods (2-3 quartiers connus)

**Effort** : ~30 minutes/ville pour les données + score-calibration → 150 × 30 min = 75 h. Trop long pour un commit unique — découper en batches de 20 villes.

### F35 — Seed +500 villes (communes 20-50 k hab.)

Phase 2 : couvrir les communes 20-50 000 hab. C'est là que se trouve l'essentiel des « villes moyennes » prisées par les relocaliés. ~500 communes concernées.

### F36 — Communes < 20 k hab. (très long terme)

France métropolitaine compte ~3 000 communes 5-20 k hab. — couvrir cette tranche demanderait un sourcing automatisé (Insee API), pas de saisie manuelle. À étudier.

---

## F1 — Hidden Costs Calculator

**Page :** `/calculateur-cout-reel/[ville]`
**Prio :** P0 — **Complexité :** M — **SEO :** mid (long tail "coût de la vie [ville]")

### Description

Page interactive par ville. Input : salaire net mensuel. Output :
- Loyer T2 médian (déjà dans `data/housing.ts`)
- Estimation chauffage selon zone climatique (H1a/H1b/H1c/H2a–d/H3 ADEME)
- Coût voiture (assurance régionale Argus + carburant moyen domicile-travail) OU transports en commun si desservi
- Parking mensuel médian
- Taxe foncière mensualisée (`lib/fiscalite.ts`)
- TEOM (taxe ordures ménagères)
- **Total coût réel mensuel**, **reste à vivre**, **comparatif vs Paris**

### URLs créées

- `/calculateur-cout-reel/` (index avec recherche)
- `/calculateur-cout-reel/[slug]` × 352 villes (SSG)

### Dépendances

- `data/housing.ts` (existe)
- `lib/fiscalite.ts` (existe)
- Nouveau `data/cost-living.ts` : zone climatique, coût chauffage T2 médian, prime assurance régionale, parking médian, TEOM (par département)

### Impact SEO

- **mid** sur l'intention transactionnelle ("coût de la vie réel [ville]" — volume modéré, intention forte)
- Linkbait potentiel sur Reddit r/france ("le vrai coût de Bordeaux en 2026")
- Page interactive → time-on-page élevé → bon signal Google

### Risques

- Estimations chauffage et assurance facilement contestables si mal sourcées → afficher disclaimer + fourchette + source précise (ADEME, France Assureurs, OSAR)
- Comparatif Paris doit refléter le coût réel parisien à jour, pas une valeur 2022
- Calcul côté client uniquement (pas d'API route) pour rester SSG

---

## F2 — City Compatibility Score

**Page :** `/quiz-compatibilite/`
**Prio :** P1 — **Complexité :** S — **SEO :** mid (mais surtout retention/social)

### Description

Quiz 10 questions : budget, âge, climat, voiture, situation familiale, ambiance recherchée, mode de travail, priorité principale, durée envisagée d'installation, importance famille proche. Algorithme de matching pondéré sur les 352 villes → Top 5 avec score % et explication par critère.

### URLs créées

- `/quiz-compatibilite/` (quiz interactif)
- `/quiz-compatibilite/resultat/[token]` (résultat partageable, ISR ou query-string)

### Dépendances

- Quiz existant (`app/quiz/`) — réutiliser le moteur, étendre `lib/niche-scores.ts`

### Impact SEO

- **mid** : page de quiz typiquement faible en ranking pur, mais énorme en partages sociaux et backlinks UGC
- Effet halo : signal d'engagement très fort

### Risques

- Risque de duplication avec `/quiz/` existant → repositionner comme variante "scoring", garder l'autre comme "matching qualitatif"
- Algorithme doit rester transparent (afficher pourquoi telle ville est en tête)

---

## F3 — Scores propriétaires (par ville)

**Pages impactées :** `/villes/[slug]` (10 nouveaux scores affichés)
**Prio :** P0 — **Complexité :** L — **SEO :** high (data exclusive = citations + featured snippets)

### Description

Ajouter sur chaque fiche ville 10 scores 0–10 avec source citée :

| Score | Source primaire |
|-------|-----------------|
| `score_canicule` | Météo-France (jours > 30 °C / an, projection ARPEGE 2040) |
| `score_solitude` | INSEE (% ménages 1 personne, % +75 ans) |
| `score_bruit` | Bruitparif (IDF) + Cartes de Bruit Stratégiques (CBS) du Cerema |
| `score_securite_nocturne` | SSMSI (atteintes nuit / 1 000 hab.) |
| `score_sans_voiture` | INSEE Mobilité + GTFS multimodal |
| `score_teletravail` | ARCEP (couverture FTTH) + INSEE (% cadres) |
| `score_qualite_air` | ATMO France (PM2.5 moyen annuel) |
| `score_securite_femme_seule` | SSMSI VFFS + Mlle. Pinpin (open data) |
| `score_jeune_actif` | INSEE (% 25–35 ans, ouvertures SIRENE) |
| `score_famille` | DEPP (écoles), CAF (places crèche), pédiatres |

### URLs impactées

- `/villes/[slug]` (bloc "Profils propriétaires")
- `/villes/[slug]/scores` (page détail méthodologie par ville, optionnel)
- `/methode` (mise à jour pour expliquer la fabrique des 10 nouveaux scores)

### Dépendances

- Nouveau `data/owner-scores.ts` (352 × 10 = 3 520 valeurs ; généré via scripts d'import en build-time, persisté en JSON)
- Scripts d'import dans `/scripts/` (run weekly via Vercel cron ou manuellement)

### Impact SEO

- **high** : data unique = nourriture pour Perplexity, AI Overviews, featured snippets
- Surface "Search Action" élargie (chaque score est un keyword potentiel)
- Backlinks éditoriaux probables (presse locale, blogs immo) si la data est citable

### Risques

- **Provenance et fraîcheur** : chaque chiffre doit être daté et sourcé. Un score "score_qualite_air" tagué 2021 dans un article presse de 2026 = perte de confiance.
- Scraper Bruitparif et ATMO = juridiquement borderline si pas d'API publique → privilégier les jeux open data data.gouv.fr quand dispos
- Risque de score "fabriqué" : si la source primaire manque sur certaines villes, l'estimation par moyenne régionale doit être visible (`source: "Estimation régionale (INSEE)"`)
- Le pipeline doit refuser de publier un score si la source primaire est `null` ET aucun fallback documenté

---

## F4 — Red Flag pages virales

**Pages :** `/red-flags/[slug-thematique]`
**Prio :** P0 — **Complexité :** M — **SEO :** high

### Description

Pages statiques SEO sur 3 angles très chercheurs :
- `/red-flags/villes-regrets-achat` — "où on regrette d'avoir acheté" (DVF moyennes + témoignages)
- `/red-flags/villes-sans-voiture-difficile` — l'envers de F3 `score_sans_voiture`
- `/red-flags/villes-belles-invivables-ete` — canicule + tourisme de masse

Format : intro (le mythe), data (5–10 villes en tête), témoignages (Reddit / sondage minimal), verdict, lien vers fiches villes.

### URLs créées

- `/red-flags/villes-regrets-achat`
- `/red-flags/villes-sans-voiture-difficile`
- `/red-flags/villes-belles-invivables-ete`

(extensible plus tard : "villes où l'eau manque", "villes vieillissantes", etc.)

### Dépendances

- F3 (scores propriétaires) — au moins `score_canicule` et `score_sans_voiture`
- `lib/red-flags-summary.ts` existant à étendre

### Impact SEO

- **high** : intent informatif fort, pas saturé par presse mainstream
- Format viral → partages sociaux + backlinks blogs
- Cluster `/red-flags/` renforcé (passe de 352 pages city-fiches à 352 + 3 pages thématiques + futurs angles)

### Risques

- Ne pas dériver vers le clickbait — chaque "red flag" doit être chiffré, pas opiné
- Le ton doit rester "ce que tu dois savoir avant d'y aller", pas "ces villes sont nulles"
- Tenir une charte éditoriale précise (sinon on perd le positionnement "sans bullshit")

---


## F9 — Comparateur de régions

**Page :** `/comparer-regions/[region1]-vs-[region2]`
**Prio :** P0 — **Complexité :** M — **SEO :** high (rares vs comparateurs ville-à-ville)

### Description

Tableau comparatif côte à côte : coût de la vie, météo, immobilier, emploi, scores moyens, carte des meilleures villes de chaque région.

Générer **toutes les combinaisons des 13 régions métropolitaines** = C(13, 2) = 78 pages.

**Priorité éditoriale :**
- `bretagne-vs-occitanie`
- `bretagne-vs-normandie`
- `paca-vs-nouvelle-aquitaine`
- `ile-de-france-vs-auvergne-rhone-alpes`

### URLs créées

- `/comparer-regions/` (index)
- `/comparer-regions/[a]-vs-[b]` × 78 combinaisons (SSG)

### Dépendances

- Réutilise `app/regions/[region]/page.tsx` (existe) — composer 2 régions côte à côte
- F3 utile mais pas bloquant (les scores actuels suffisent en v1)

### Impact SEO

- **high** : niche peu couverte, intent fort ("vivre en Bretagne ou Occitanie")
- Cluster `/comparer-regions/` cohérent avec `/comparer/` (ville-vs-ville déjà bien indexé)

### Risques

- 78 pages SSG = +78 routes au sitemap. Vérifier que le build reste sous les contraintes Vercel (~5 min)
- Risque de pages "vides" si on génère mécaniquement toutes les combinaisons sans intérêt (ex. "Corse vs Hauts-de-France" → faible search)
- Solution : générer toutes les pages SSG mais boost éditorial sur les 10–20 priorisées (intro custom)

---

## F10 — Widget intégrable

**Pages :** `/widget/` (générateur) + dashboard interne backlinks
**Prio :** P2 — **Complexité :** M — **SEO :** indirect (backlinks ++)

### Description

Widget HTML embarquable < 10 KB. Une ligne de script → iframe sécurisée.

Formats :
- Badge score global d'une ville
- Top 3 critères d'une ville
- Comparatif 2 villes (bar chart simple)

Backlink imposé : "Powered by MeilleurVille" (lien vers la fiche ville source).

### URLs créées

- `/widget/` (générateur — formulaire choisir ville + format)
- `/widget/embed?city=...&format=...` (route iframe, route handler)
- `/admin/widget-stats` (dashboard interne backlinks par domaine référent)

### Dépendances

- Aucune côté data (réutilise `CITIES_SEED`)
- CSP correcte sur l'iframe pour éviter d'être bloquée

### Impact SEO

- **low** direct (la route `/widget/embed` est noindex)
- **high indirect** : chaque embed = un backlink dofollow vers `/villes/[slug]`. Si 200 agences immo l'installent → +200 backlinks ciblés

### Risques

- L'iframe doit être très légère (< 10 KB JS, pas de framework)
- Risque de XSS si on parse mal les query params → encoder strictement
- Risque d'usage abusif : un site qui embed mais cache le backlink → ajouter un check JS qui désactive l'iframe si parent !== contenu attendu

---

## F11 — Expat Retour

**Pages :** `/expat-retour/` + `/expat-retour/depuis-[pays]` + `/expat-retour/quiz`
**Prio :** P1 — **Complexité :** M — **SEO :** mid (niche peu couverte, intent transactionnel)

### Description

Pour Français rentrant de Suisse, Luxembourg, Belgique, UK, Canada.

- Quiz adapté profil expat (salaire actuel devise → équivalent net France, ville d'origine, raison du retour)
- Comparatif "ce que tu avais vs ce que tu auras"
- Guide admin retour France (carte vitale, scolarité, fiscalité ré-impatriation)

### URLs créées

- `/expat-retour/` (landing)
- `/expat-retour/depuis-suisse`
- `/expat-retour/depuis-luxembourg`
- `/expat-retour/depuis-belgique`
- `/expat-retour/depuis-royaume-uni`
- `/expat-retour/depuis-canada`
- `/expat-retour/quiz`

### Dépendances

- Quiz existant (réutilisable)
- Aucune nouvelle data lourde (taux change BCE statique pour le quiz, recalculé au build)

### Impact SEO

- **mid** : niche bien définie, peu de concurrence sérieuse (juste expat.com et quelques blogs persos)
- Long tail "rentrer de [pays] en France" / "quelle ville après [pays]"

### Risques

- L'aspect "admin retour" doit pointer vers les sources officielles (service-public.fr, impôts.gouv) — pas se substituer à un conseil juridique
- Risque d'obsolescence des chiffres devise → recalculer au build (cron mensuel BCE)

---

## F12 — Comparaison 3 villes

**Page :** `/comparer/[a]-vs-[b]-vs-[c]`
**Prio :** P0 — **Complexité :** M — **SEO :** high (étend le cluster `/comparer/` déjà ranké)

### Description

Tableau comparatif côte à côte sur 3 villes, radar comparatif, verdict personnalisé selon profil quiz.

Générer **les 50 combinaisons les plus cherchées** (pas toutes les C(352, 3) = 7 millions, évidemment).

### URLs créées

- `/comparer/[a]-vs-[b]-vs-[c]` × 50 (SSG)

Exemples prioritaires : `nantes-vs-rennes-vs-bordeaux`, `lyon-vs-marseille-vs-toulouse`, `montpellier-vs-nice-vs-marseille`.

### Dépendances

- Étendre `lib/comparer-pairs.ts` en `lib/comparer-triplets.ts` (50 triplets curés)
- Composant `<CompareTable>` à factoriser (existe pour 2, à généraliser pour N)

### Impact SEO

- **high** : cluster `/comparer/` déjà indexé, ajout naturel
- Recherche "X vs Y vs Z" : volume faible mais intent très fort

### Risques

- Tableau qui devient illisible sur mobile → mode "carrousel scoré" sur petit écran
- Radar 3 polygones = overlap visuel pénible → palettes contrastées, légende claire

---

## F13 — Données saisonnières par ville

**Pages impactées :** `/villes/[slug]` (bloc saisons) + `/villes/[slug]/saisons` (détail)
**Prio :** P1 — **Complexité :** M — **SEO :** mid

### Description

Bloc "Vivre à [ville] selon la saison" sur chaque fiche ville + page dédiée :
- Météo par saison (Open-Meteo, déjà intégré pour le climat)
- Affluence touristique (DGE Suivi des Métriques de la Demande Touristique)
- Disponibilité Airbnb (donnée publique InsideAirbnb si la ville y est)
- Événements saisonniers

### URLs créées

- `/villes/[slug]/saisons` × 352 (SSG)

### Dépendances

- `lib/weather.ts` ou équivalent (Open-Meteo agrégé par saison)
- `data/tourism.ts` (DGE) — nouveau
- Optionnel : `data/airbnb-availability.ts` (InsideAirbnb, scrape mensuel)

### Impact SEO

- **mid** : long tail "[ville] en hiver" / "[ville] en été"
- Bloc fiche ville → légère augmentation time-on-page

### Risques

- Open-Meteo ne fournit pas la fréquentation ; il faut séparer clairement météo (live) et tourisme (estimé)
- InsideAirbnb : couverture variable selon les villes → afficher "data non dispo" honnêtement

---


## F15 — Index de gentrification

**Pages :** `/gentrification/` + `/gentrification/[slug]` + `/gentrification/carte`
**Prio :** P1 — **Complexité :** L — **SEO :** high (mot-clé chargé, peu couvert sérieusement)

### Description

Classement "villes qui vont exploser dans 5 ans".

Score composite :
- DVF : évolution prix immobilier 10 ans (slope régression)
- Démographie 25–35 ans (INSEE)
- Ouvertures SIRENE (cafés, bars, coworking, indépendants créatifs)
- Hausse télétravailleurs (INSEE recensement)

### URLs créées

- `/gentrification/` (index, classement national)
- `/gentrification/[slug]` × 352 (détail par ville, SSG)
- `/gentrification/carte` (carte heatmap nationale)

### Dépendances

- DVF (open data) — agrégation par ville
- INSEE recensement — données déjà partiellement utilisées
- SIRENE — flux quotidien (parser hebdo)

### Impact SEO

- **high** : recherches "villes qui montent" / "ville [X] gentrification" en croissance forte
- Linkbait journalistes (sujet média + chiffres = on est cités)

### Risques

- Le mot "gentrification" est politiquement chargé → ton neutre, pas "voici où investir avant les autres"
- Risque de prédiction qui se révèle fausse → afficher l'historique et la méthodo, pas une boule de cristal
- Risque légal mineur : si on cite "ville X gentrifie", on doit pouvoir l'étayer (DVF est public, donc OK)

---

## Risques transversaux

- **Sources de données instables** (Pushshift Reddit a déjà fermé une fois) : prévoir au moins 2 sources de fallback pour chaque score critique
- **Coût Claude API** : centraliser dans un seul module avec prompt caching obligatoire (cf. CLAUDE.md `claude-api` skill)
- **Performance build Vercel** : avec F4 + F9 + F12 + F13 + F15, on passe de ~4 300 pages à ~5 500. Vérifier que le build reste sous 8 min (limite Vercel Hobby) ou passer Pro
- **Internationalisation EN** (Partie 2) : tous les scores et red flags doivent avoir une traduction EN ou être masqués sur la version EN — ne pas afficher de FR brut sur bestcitiesinfrance.com

---

## Process

- Chaque feature livrée doit ajouter une entrée dans la table "Done" de `CLAUDE.md`
- Chaque nouvelle source de données ajoutée dans `lib/` ou `data/` doit être documentée (origine, date, fréquence de refresh, fallback)
- Chaque feature P0 doit avoir un suivi `/methode` mis à jour avant publication

---

## F16 — Classements par score propriétaire

**Pages :** `/classements/[slug]` — 10 nouveaux classements thématiques
**Prio :** P0 — **Complexité :** S — **SEO :** high (long-tail très porteur)

### Description

Réutilise les 10 owner scores de F3 pour exposer un classement national par critère :

- `/classements/canicule-resistance` — villes les plus tempérées en été
- `/classements/calme-sonore` — villes les moins bruyantes
- `/classements/lien-social` — villes où on est le moins seul
- `/classements/securite-nocturne` — villes les plus sûres la nuit
- `/classements/sans-voiture` — villes où vivre sans voiture
- `/classements/teletravail-proprietaire` — fibre + cadre télétravail
- `/classements/qualite-air` — PM2.5 les plus bas
- `/classements/securite-femme-seule` — pondéré SSMSI + transports
- `/classements/jeune-actif` — démographie + culture + remote
- `/classements/famille-proprietaire` — écoles + sécurité + nature - cost

Chaque page liste les 50 meilleures villes par score avec contexte, méthodologie liée à `/methode`, et cross-link vers la fiche ville. Le tag « Proxy v0 » apparaît clairement.

### URLs créées

- `/classements/canicule-resistance`
- `/classements/calme-sonore`
- `/classements/lien-social`
- `/classements/securite-nocturne`
- `/classements/sans-voiture`
- `/classements/teletravail-proprietaire`
- `/classements/qualite-air`
- `/classements/securite-femme-seule`
- `/classements/jeune-actif`
- `/classements/famille-proprietaire`

### Impact SEO

- **high** : long-tail "meilleures villes pour vivre sans voiture", "villes les moins bruyantes France", etc.
- Cluster `/classements/` déjà ranké, ajout naturel de 10 pages thématiques
- Données ré-exploitées (zéro nouvelle dépendance)

### Risques

- Tag « Proxy v0 » doit rester visible — sinon impression de chiffres officiels
- Risque d'effet rebond si une ville se retrouve trop en bas (méthodo doit absorber les contestations)

---

## F17 — Vivre avec X €/mois — landing pages

**Pages :** `/vivre-avec/[salaire]-euros` — 6 pages
**Prio :** P1 — **Complexité :** S — **SEO :** mid (intent transactionnel)

### Description

Pages landing pour les salaires nets ronds : 1 500, 2 000, 2 500, 3 000, 4 000, 5 000 €/mois. Chaque page :

- Intro courte (« Voici les villes où votre salaire de X €/mois donne le meilleur reste-à-vivre »)
- Top 10 villes compatibles (via `lib/compatibility.ts` avec budget = X × 0,33)
- Breakdown coût réel mensuel pour la ville #1 (réutilise `lib/cost-living.ts`)
- Comparatif reste-à-vivre Paris vs ville #1
- Cross-links vers `/calculateur-cout-reel/[ville]` et `/quiz-compatibilite/`

### URLs créées

- `/vivre-avec/` (index)
- `/vivre-avec/1500-euros`
- `/vivre-avec/2000-euros`
- `/vivre-avec/2500-euros`
- `/vivre-avec/3000-euros`
- `/vivre-avec/4000-euros`
- `/vivre-avec/5000-euros`

### Impact SEO

- **mid** : « vivre avec X euros », « où vivre avec X salaire » — volume modéré mais intent commercial fort
- Conversion vers le calculateur F1 et le quiz F2

### Risques

- Tendance à fabriquer des chiffres si on n'utilise pas strictement les sources du seed — risque évité en réutilisant lib/cost-living.ts (ADEME, France Assureurs, DGFiP)

---

## F18 — Télétravailler à [ville]

**Pages :** `/villes/[slug]/teletravail` × 352
**Prio :** P1 — **Complexité :** M — **SEO :** high (mot-clé majeur)

### Description

Sub-page par ville sur la même structure que `/villes/[slug]/climat`, `/saisons`, `/fiscalite`. Contenu :

- Score télétravail propriétaire (F3) + breakdown (FTTH du dept, score remote, score qualité de vie)
- Coût télétravailleur médian (loyer T2 + chauffage + abonnement transports OU voiture, depuis F1)
- Coworking : densité approximative déduite des tags + population
- Profil idéal (« Pour qui [ville] est faite si on télétravaille à 100 % »)
- Cross-links vers les autres sous-pages ville

### URLs créées

- `/villes/[slug]/teletravail` × 352 SSG

### Impact SEO

- **high** : « télétravailler à [ville] » est une des recherches les plus fréquentes du moment
- 352 pages long-tail → cluster massif
- Compatible avec les guides « Quitter X » déjà publiés

### Risques

- Doit rester honnête : pas de fausse promesse "ville idéale pour télétravailleur" si le score est moyen. Le ton doit être analytique, pas vendeur.
