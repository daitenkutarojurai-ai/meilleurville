# Vague 7 — Biodiversité (F62), qualité de l'air (F63), actualité locale (F64)

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Spécifications et états de collecte, conservés mot pour mot.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


## Vague 7 (2026-07-29) — Score Biodiversité

Demande utilisateur. Spec complète dans `ROADMAP.md` § « Vague 7 ».

- [ ] **F62 — Score Biodiversité** — couche « nature » sur les 540 villes : espèces
  recensées à proximité (**GBIF**, libre, sans clé), zones protégées et statuts de
  protection (**INPN/MNHN**, gratuit), espaces verts (réutilise `data/city-parks.json`
  de F59, pas de re-crawl). Pipeline pré-fetché `scripts/city-biodiversity.mjs` →
  `data/city-biodiversity.json` commité par lots → `lib/biodiversity.ts` →
  `/villes/[slug]/biodiversite` (+ EN `biodiversity`) SSG conditionnel + classement.
  - **Pas de Supabase** : la demande d'origine le citait, mais l'auth est Worker-native
    sur D1 depuis R9.1 et l'hébergement est Cloudflare **Workers Static Assets** (pas
    Pages). F62 n'a besoin d'aucune base — pipeline → JSON → SSG.
  - **Le biais d'effort d'observation est le cœur du problème** : les occurrences GBIF
    mesurent d'abord la densité de naturalistes, pas la biodiversité. On compte des
    **espèces distinctes normalisées par l'effort** (observateurs / observations), on
    déclare une ville **non mesurable** sous un seuil d'effort plutôt que de lui coller
    un score, et on fait peser lourd les **zones protégées** — un périmètre Natura 2000
    existe indépendamment de qui l'observe.
  - Convention : « Biodiversité » nomme une qualité → **10 = bon**. Licences à afficher
    (DOI GBIF + licence par jeu, `CC BY-NC` filtré ; MNHN + Licence Ouverte).
  - Egress : supposer le crawl bloqué côté routine cloud (403 CONNECT comme Overpass) —
    **passe locale**. Confirmé le 2026-07-30 : `api.gbif.org`, `inpn.mnhn.fr` et
    `www.data.gouv.fr` répondent tous les trois 403 CONNECT depuis la routine.
  - **État au 2026-07-30** : moteur livré, données non collectées. `scripts/city-biodiversity.mjs`
    (`npm run biodiversity`, + `:probe` / `:stats`) et `lib/biodiversity.ts` sont en place ;
    `data/city-biodiversity.json` vaut `{}` — **0/540 villes**, aucune surface, aucun classement.
    La richesse est mesurée par **raréfaction de Hurlbert** (espèces attendues dans 500
    observations) et non par un volume d'occurrences ; sous 500 observations ou 20 observateurs
    la ville est **non mesurable** et n'a pas de score. `overall` reste `null` tant que les zones
    protégées INPN ne sont pas collectées : repondérer 2 composantes sur 3 donnerait un chiffre
    qui ne mesure pas ce que son nom annonce. `cityProtectedAreas()` renvoie `null` = « on ne
    sait pas », jamais `0`. ⚠️ Les paramètres GBIF sont marqués `@unverified` dans le script —
    lancer `npm run biodiversity:probe` en local avant le premier lot.
  - **État au 2026-08-01** : la composante **zones protégées** a son ingest complet —
    `scripts/city-protected-areas.mjs` (`npm run protected-areas`, + `:sources` / `:selftest` /
    `:stats`), branché sur `data/city-protected-areas.json`, qui vaut `{}` : **0/540 villes**,
    egress toujours 403. Les deux surfaces listent les périmètres (type, distance, surface,
    lien fiche INPN, mention MNHN / Licence Ouverte) mais restent garées en `page.pending.tsx`.
    Deux points de méthode à ne pas défaire : ① la couverture est **rastérisée sur une grille
    de 250 m**, jamais une somme de surfaces — les zonages français s'emboîtent (ZNIEFF I dans
    ZNIEFF II, Natura 2000 par-dessus) et une somme compte le même sol plusieurs fois, jusqu'à
    « 180 % du disque protégé » ; chaque cellule retient le niveau de protection le plus fort.
    ② une ville ingérée **sans aucun périmètre** vaut `areasTotal: 0` et s'affiche comme une
    mesure ; seule une ville non ingérée vaut `null` = « on ne sait pas ». ⚠️ Noms d'attributs
    INPN et gabarits d'URL des fiches sont `@unverified` — l'ingest imprime le champ retenu par
    couche, relire ces lignes au premier run local.
  - **État au 2026-08-02** : toujours **0/540 villes** sur les deux composantes (egress 403
    CONNECT retesté). Le run a durci le pipeline GBIF au lieu de collecter :
    `npm run biodiversity:selftest` (22 contrôles hors ligne, symétrique de
    `protected-areas:selftest`) a trouvé deux bugs silencieux au premier lancement. ① GBIF
    renvoie les facettes en `UPPER_SNAKE_CASE` (`SPECIES_KEY`) alors qu'on les demande en
    camelCase : la comparaison `toLowerCase()` ne tombait jamais en face et **chaque ville
    aurait enregistré zéro espèce** sans lever d'erreur. Normaliser en ne gardant que lettres
    et chiffres ; une facette absente lève désormais. ② La raréfaction se calculait sur le
    vecteur d'abondance **tronqué** par le plafond de pagination, contre sa propre somme —
    ce qui **surestime la richesse des villes les mieux relevées**, donc le haut du classement
    (le score est un rang centile sur cette valeur). Désormais : facette complète → exact ;
    tronquée → encadrement rigoureux (`rarefiedExact`, `rarefiedUpper`), et si l'intervalle
    dépasse `MAX_RAREFIED_UNCERTAINTY` (5 %) la ville passe en `richnessPending: "precision"`
    — non classée, la page disant que le défaut est dans *notre* collecte, pas dans la nature.
    `QUERY_VERSION` = 2 ; `MIN_QUERY_VERSION` écarte du barème toute ligne v1. Ne pas
    « simplifier » l'encadrement en republiant la borne basse comme une valeur exacte.
  - **État au 2026-08-03** : toujours **0/540** sur GBIF et INPN (403 CONNECT retesté sur
    `api.gbif.org`, `inpn.mnhn.fr`, `www.data.gouv.fr`). Le run a corrigé la troisième
    composante, **espaces verts** — la seule qui a ses données (F59, 540/540) et la seule
    qui n'avait jamais été passée au garde-fou du biais d'effort. Deux défauts, tous deux
    dans `lib/biodiversity.ts` : ① une commune relevée **sans aucun parc nommé dans OSM**
    valait une surface de `0` et récoltait **0,1/10**, alors que le docstring annonçait
    déjà `null` — 11 communes concernées, dont Sallanches au fond d'une vallée alpine,
    Noirmoutier, Porto-Vecchio, Calvi et Saint-Paul-de-Vence. OSM est une **carte
    contributive, pas un registre** : « personne n'a cartographié » et « pas de verdure »
    y sont indiscernables, donc `greenSpacePerCapita` renvoie désormais `null` et le profil
    porte `greenSpacePending: "mapping"`. ⚠️ Ne pas « harmoniser » ce cas avec les zones
    protégées, où `areasTotal: 0` **est** une mesure : l'inventaire INPN est un registre
    administratif exhaustif, OSM non — c'est la source qui décide, pas la symétrie.
    ② F59 plafonne à **40 parcs par commune** (`PARKS_PER_CITY`) sans avoir gardé le compte
    d'avant plafonnement : pour les **41 communes** qui atteignent le plafond, la surface
    additionnée est un **plancher**, pas un total. Elles gardent leur score (le tri est par
    superficie décroissante, donc chaque parc omis est plus petit que le 40e conservé, lequel
    pèse en médiane 0,19 % du total de sa ville et 0,73 % au pire — l'erreur est bornée et
    joue *contre* les villes les mieux cartographiées), mais les deux surfaces affichent
    un « au moins / at least ». Nouveaux exports : `PARKS_PER_CITY_CAP`,
    `greenSpaceTruncated()`, `GREEN_SPACE_UNMAPPED_COUNT` (11), `GREEN_SPACE_TRUNCATED_COUNT`
    (41) ; les 11 communes non cartographiées sortent aussi du barème centile, où elles
    tassaient le bas avec des valeurs inconnues. Rien ne change côté F59 : pour un
    **répertoire de destinations**, « aucun parc nommé » reste une réponse juste — c'est
    seulement comme **proxy de surface végétale** que le même zéro devient faux.
  - **État au 2026-08-04 — la collecte est débloquée, et automatisée.** Elle ne partira plus
    d'une « passe locale » à demander : `scripts/local-data-runner.sh` tourne en **cron sur
    la machine du propriétaire** (02h20 et 14h20 UTC), lance `npm run biodiversity` par lots
    de 60 villes (~45 s la ville), commite `data/city-biodiversity.json` et pousse. Couverture
    complète attendue en ~5 jours. **Ne redemande pas de passe manuelle et ne relance pas le
    crawl depuis une routine** — l'egress y est refusé et le restera. Les zones protégées
    restent à `{}` : l'INPN publie des shapefiles derrière une page de téléchargement, donc le
    runner saute l'étape tant que les GeoJSON ne sont pas dans
    `.cache/city-protected-areas/sources/` (`npm run protected-areas:sources` donne la ligne
    `ogr2ogr`). Tant que cette composante manque, `overall` reste `null` — inchangé.
  - **État au 2026-08-06 — les deux sous-pages sont EN LIGNE.** `/villes/[slug]/biodiversite`
    et EN `/cities/[slug]/biodiversity` sont dégarées sur les **302/540 villes collectées**
    (278 mesurables, 24 en `richnessPending: "precision"`), `BIODIVERSITY_PAGES_LIVE = true`.
    Publier maintenant se justifie parce que le barème centile s'est montré **stable** à la
    vérification sur l'historique du JSON : entre l'instantané à 182 villes et celui à 302,
    les rangs ont bougé de 0,2 point en médiane, 0,5 au pire, aucune ville d'un point entier.
    ⚠️ Le crawl est **biaisé en taille** (302 collectées à 45 000 hab. de médiane, 238
    restantes à 14 500) : les pages portent un paragraphe « À quoi la ville est comparée »
    qui le dit. Trois bugs que seules les vraies valeurs pouvaient révéler ont été corrigés
    au passage — la carte 🦋 annonçait « effort d'observation trop faible » à **Paris** et à
    toute la petite couronne (les villes les mieux relevées, en réalité tronquées par *notre*
    collecte) ; le sitemap gatait sur `hasBiodiversityData` **sans** le drapeau et annonçait
    donc 604 URL en 404 pendant que les pages étaient garées ; et les deux pages déclaraient
    un `openGraph` **sans `images`**, le piège documenté plus haut. `overall` reste `null`
    (zones protégées 0/540) et `/classements/biodiversite` **n'existe pas** : 278 mesurables,
    sous le seuil de ~300. Détail complet dans `ROADMAP.md` § point d'étape 2026-08-06.
  - **État au 2026-08-10 — crawl terminé (540/540), et le rang de richesse est RETIRÉ.**
    Le seuil de ~300 villes mesurables était franchi (513) ; le corpus complet a permis de
    contrôler la mesure pour la première fois, et elle n'a pas tenu : corrélation de rang
    **−0,77** avec la concentration des relevés (part des observations tenue par 5 espèces),
    **+0,10** seulement avec le nombre d'espèces réellement recensées, et **56 %** de la
    variance expliquée par le seul département. Le score classait le **type de programme de
    saisie** (détecteurs à ultrasons, comptages de colonies, atlas botaniques), pas la nature :
    Douai et ses 2 588 espèces sortaient à 0,0/10, la Guadeloupe à 0,1 et la Guyane à 1,8 quand
    le Centre-Val de Loire tenait 7,8. Le site classait la Beauce au-dessus de l'Amazonie.
    ⚠️ **`/classements/biodiversite` est abandonné, pas reporté — ne pas le recréer** au motif
    que la couverture est bonne : c'est la mesure qui est en cause, pas le nombre de villes.
    De même, ne pas remettre `RICHNESS_RANKING_PUBLISHED` (`lib/biodiversity.ts`) à `true` sans
    avoir refait les trois contrôles ; le remède est un recrawl GBIF agrégé par `datasetKey`
    (`QUERY_VERSION = 3`), pas un correctif d'affichage. Les effectifs bruts restent publiés,
    ils sont exacts — c'est le classement qui était faux. Nouveau motif
    `richnessPending: "incomparable"`, prioritaire sur `effort` / `precision` / `calibration`.
    Détail complet dans `ROADMAP.md` § point d'étape 2026-08-10.
  - **État au 2026-08-13 — l'ingest des zones protégées télécharge ses propres sources.**
    `npm run protected-areas:fetch` (+ `--dry-run`) résout les sept couches **par slug** sur
    data.gouv.fr (`inpn-donnees-du-programme-espaces-proteges` / `-natura-2000` / `-znieff`),
    télécharge, dépaquette et reprojette. ⚠️ **Ne renvoie plus personne vers `inpn.mnhn.fr` pour
    les fichiers** : le MNHN a subi une cyberattaque le 2025-07-26, l'INPN est resté hors ligne
    ~1 an et la « version zéro » revenue le 2026-07-21 ne porte que les fiches espèces (habitats
    et synthèses territoriales annoncés pour 2027) — les pages de téléchargement d'origine
    n'existent plus. Corollaire : les gabarits d'`inpnUrl()` visent l'ancien site et restent
    `@unverified` ; les vérifier avant d'afficher le premier lien de fiche. Le résolveur **refuse
    de choisir** quand une couche correspond à zéro ou plusieurs ressources. Bug corrigé au
    passage : le motif ZNIEFF I acceptait aussi les fichiers ZNIEFF II (0,4 au lieu de 0,25), et
    « Réserves naturelles » / « Parcs naturels régionaux » / « Parcs nationaux » ne
    correspondaient à rien (accents non repliés) — 16 cas de reconnaissance épinglés dans
    `protected-areas:selftest`. Données toujours **0/540**, `overall` toujours `null`.
  - **État au 2026-08-26 — les zones protégées sont collectées (540/540) et publiées en
    comparaison nationale.** La source INPN est morte pour de bon : les `.zip` que data.gouv.fr
    référence répondent 200 en `text/html` depuis la cyberattaque de 07/2025. L'ingest bascule sur
    la **BD TOPO de l'IGN**, qui redistribue les mêmes tracés du MNHN (`sources: "MNHN 2024"`) —
    `source: "bdtopo"`, `ingestVersion: 3`, périmètres arrêtés au **2026-08-19**, 540/540 villes,
    **même jeu de cinq couches partout** (réserves naturelles, parcs nationaux, parcs naturels
    régionaux, arrêtés de biotope, Natura 2000), DROM compris. **Les deux ZNIEFF sont hors calcul** :
    un inventaire sans portée juridique n'entre pas dans un score de protection, et les pages le
    disent. `PROTECTION_CALIBRATED` est donc vrai et chaque ville publie son /10 ; **`overall` reste
    `null`** — deux composantes sur trois ne font pas un agrégat qui mesure ce que son nom annonce.
    Hub national livré le même jour : **`/espaces-proteges` (FR) + `/protected-areas` (EN)**, moteur
    dans `lib/protected-areas-ranking.ts` (aucune mesure nouvelle, tout vient du JSON), convention
    de paliers d'ex æquo de `lib/owner-rankings.ts` appliquée telle quelle. Repères mesurés :
    médiane **6,8 %** du disque de 15 km, Digne-les-Bains **96,4 %**, Marseille **47,9 %** (seule
    commune > 100 000 hab. du top 40), **14 villes à 0,0 %** dont **5 sans aucun périmètre**
    (Albi, Auch, Fleurance, Longwy, Vitré). ⚠️ **Ce n'est pas la réouverture de
    `/classements/biodiversite`** : aucun rang de richesse n'est publié, `RICHNESS_RANKING_PUBLISHED`
    reste `false`. ⚠️ **Cœur de parc national et aire d'adhésion pèsent pareil** (1,0) faute
    d'attribut qui les distingue dans la source, alors que l'aire d'adhésion est une zone de charte :
    sur **11 villes** (dont Toulon) le seul polygone relevé est une aire d'adhésion, leur couverture
    est un **majorant**, et les tableaux l'affichent ligne par ligne. La détection se fait sur le
    **nom** du périmètre — ne pas la prendre pour une donnée. ⚠️ `inpnUrl()` renvoie `null` par
    construction : toutes les URL de `inpn.mnhn.fr` répondent 200 en HTML de coquille, donc aucun
    lien de fiche n'est affiché. Pour le rebrancher un jour, la BD TOPO porte le code MNHN dans
    `identifiants_sources`.

  - **État au 2026-09-28 — « 0 ha » en face d'une réserve naturelle nationale, et un avertissement
    allumé sur les 1 080 pages ville.** Rien de neuf côté collecte et c'est **nominal** : GBIF en
    `queryVersion` 3 du 09 au 13/09, zones protégées à la passe BD TOPO du 19/08 (ingest one-shot,
    pas un crawl échu) — ⚠️ le contrôle se fait sur **la date des lignes, jamais sur leur nombre**.
    Le run a porté sur le dernier champ jamais relu de la seule composante qui publie une note : la
    **surface d'un périmètre**. ⚠️ **`areaHa` est un résidu de grille** : le découpage se fait sur
    250 m, donc une cellule pèse **6,25 ha** et rien de plus fin ne se mesure — **404 entrées sur
    4 511, sur 239 des 540 villes**, sortaient « **0 ha** » en face d'un périmètre qui existe, et
    **deux causes opposées tombaient dans le même zéro** : un site minuscule (gîte à chiroptères,
    carrière) ou **le bord d'un très grand site que le disque effleure**. La seconde est démontrée
    par nos propres données — **46 de ces 404** portent un identifiant qui pèse ≥ 100 ha dans le
    disque d'une autre ville, presque tous relevés à 14,8–15,0 km : Châtellerault affichait « 0 ha »
    en face du **Parc Naturel Régional Loire-Anjou-Touraine**. ⚠️ **Forme la plus contradictoire, 9
    villes** annonçaient « 0 % du disque sous protection » au-dessus d'une liste non vide — Hayange
    au-dessus de la **Réserve Naturelle Nationale d'Hettange-Grande**, Épinal au-dessus du **Massif
    Vosgien** — les deux chiffres sortant de la même grille et **étant exacts**. ⚠️ **Second défaut,
    plus large, et la page se contredisait à voix haute** : `PROTECTION_KIND_COUNT` valait
    `Object.keys(PROTECTION_WEIGHT).length` = **7**, ZNIEFF comprises, alors qu'elles sont **hors
    barème depuis le 26/08** et que la passe livre **5 couches partout, volontairement** — d'où
    « Passe partielle : 5 des 7 couches nationales étaient disponibles. La couverture est donc un
    minimum. » sur **540 villes × 2 locales**, trois cents lignes sous un paragraphe de la *même
    page* disant que les ZNIEFF sont écartées **par choix**. Un avertissement allumé 100 % du temps
    ne signale rien, et celui-ci **minorait un chiffre juste** ; `PROTECTION_SCORED_KINDS` déclare
    les cinq couches réglementaires attendues, la note tombe à **0/540** et se déclenchera le jour
    où une passe en perdra réellement une. Livré **au site d'affichage** (même doctrine qu'au 10/09
    et au 07/09 : la grille reste le bon outil pour la couverture, c'est la lecture de son résidu
    qui était fausse) : **`areaWithinDisc()`, seul accès autorisé à `ProtectedArea.areaHa` depuis
    une surface** (relire le champ brut fait revenir le zéro, comme `countWithFloor` et
    `groupSpecies`), `protectionBelowGridOnly()`, `PROTECTION_GRID_STEP_M` /
    `PROTECTION_GRID_CELL_HA` **dérivés du fichier** et les comptes `PROTECTION_AREA_*` calculés au
    chargement ; les deux pages affichent « moins de 6,25 ha », expliquent les deux causes et disent
    que ces périmètres n'ajoutent rien à la couverture. **Déjà dit et non réécrit** : les deux
    locales annonçaient déjà que la surface est « la part du périmètre qui tombe dans le rayon, pas
    le site entier » — ce que la mesure confirme (sur **806** périmètres listés par ≥ 2 villes,
    **741** portent un chiffre différent d'une ville à l'autre ; le PNR du Luberon vaut 12,5 ha sur
    une page et 65 025 ha sur une autre). **Garde `périmètres`** dans `npm run integrity` : toute
    surface lisant `.areaHa` nu échoue, sur le code **commentaires retirés**, **vérifiée en la
    faisant échouer** ; `protected-areas:selftest` **+4 contrôles** qui épinglent le mécanisme
    (⚠️ un test de plancher doit viser **entre les mailles** — la première version posait son carré
    sur le réseau des centres à ±125 m et attrapait une cellule). 🔧 Corrigé au passage dans
    `protected-areas:stats`, même défaut : `partial` comparait à `LAYERS.length` (7) et annonçait
    « incomplete layer set: **540** » à chaque run depuis le 26/08 ; il se cale désormais sur la
    passe elle-même et **nomme** les 9 villes à couverture nulle. **Non couvert** : `overall` reste
    **`null` sur les 540**, le **pendant terrestre** du défaut de mer (disque débordant sur un pays
    sans BD TOPO) n'est **toujours pas mesuré** faute de polygone de frontières, la part d'eau par
    ville n'est pas publiée, cœur/aire d'adhésion et zones tampons restent détectés par le **nom**,
    et la raréfaction des deux villes de Guyane compte encore un casier « Animalia spec ».
  - **État au 2026-09-17 — le disque compte la mer, et le seul chiffre encore publié n'est pas la
    part du sol protégé.** Rien de neuf côté collecte et c'est **nominal** : les 540 lignes GBIF
    sont en `queryVersion` 3 du 09 au 13/09, les zones protégées à la passe BD TOPO du 19/08, et
    aucune ligne n'est échue à quatre jours — ⚠️ le contrôle se fait sur **la date des lignes**,
    jamais sur leur nombre. Le run a porté sur le dernier terme jamais relu de la seule composante
    qui publie une note : son **dénominateur**. ⚠️ **Le disque de 15 km est rastérisé sans
    distinguer la mer du sol**, donc sur **101 villes sur 540 (18,7 %, dont 37 avec la mer à moins
    d'un km et 18 ultramarines)** le pourcentage mélange sol et eau des deux côtés de la fraction :
    l'eau compte au dénominateur comme du sol qui aurait pu être protégé, et les périmètres
    **marins** qui la couvrent comptent au numérateur comme n'importe quel zonage — « Secteur Marin
    de l'Île d'Yeu Jusqu'au Continent » (24 006 ha) est le plus grand périmètre des Sables-d'Olonne,
    « Pertuis Charentais - Rochebonne » (29 025 ha, plateau du large) celui de La Rochelle, et les
    « Posidonies de la Côte Palavasienne » de Sète sont un herbier sous-marin. ⚠️ **L'ingest connaît
    la règle et l'applique là où elle ne change rien** : son `EXCLUDED` refuse les **ZNIEFF
    marines** pour ne pas « récompenser une ville côtière pour de l'eau », or les deux ZNIEFF sont
    hors barème depuis le 26/08 — l'exclusion ne porte donc jamais sur Natura 2000, qui est dans le
    score à 0,6 et qui porte les sites marins. Effets mesurés, tous **dérivés** : couverture médiane
    **20,4 % contre 4,6 %** à l'intérieur, **16 des 40** lignes du classement national et **8 des
    20** de celui des villes > 100 000 hab. ⚠️ **Cet écart n'est pas « la part d'eau »** et aucune
    surface ne doit le dire : le littoral est aussi réellement plus protégé, et séparer les deux
    demanderait un masque terre/mer que la source n'a pas. ⚠️ **On le dit, on ne le repondère pas**
    — troisième application de l'arbitrage du couple cœur/aire d'adhésion (26/08) et des zones
    tampons (14/09) ; la différence avec le **retrait** du rang d'espaces verts (31/08) est que là
    le chiffre était faux, ici il est exact et mal nommé. Le discriminant n'est pas un nom mais une
    mesure déjà au dépôt : `lib/city-coast.ts` (mer **ouverte**, filtrée sur la largeur du plan
    d'eau, donc Nantes à 25,5 km n'en est pas). Livré : `protectionSeaDistanceKm()`
    (`lib/biodiversity.ts`), `PROTECTION_SEA_EXPOSED` / `_COUNT` / `_MEDIAN`,
    `PROTECTION_INLAND_MEDIAN` et `seaExposedInRanking()` (`lib/protected-areas-ranking.ts`), les
    **quatre** surfaces qui publient la couverture (deux sous-pages ville avec la distance mesurée
    de *leur* mer, deux hubs avec méthode, FAQ — donc JSON-LD — et marqueur « disque en partie en
    mer » ligne par ligne), et `protected-areas:stats` qui **nomme** les villes par un chemin de
    code indépendant tombant sur les mêmes 101/540, 20,4 % et 4,6 %. **Garde `protégées` dans
    `npm run integrity`** : 4 surfaces, toute lecture de `weightedCoverage` / `protectionCoverage` /
    `rankByProtection` / `PROTECTION_MEDIAN_COVERAGE` doit le dire dans sa locale — vérifiée **en la
    faisant échouer**, et elle lit le code **commentaires retirés** (la première version passait
    parce que le commentaire qui pose la règle la satisfaisait, piège du garde F64 du 15/09).
    🔧 Corrigé au passage : le chargeur de `scripts/check-integrity.mjs` ne résolvait **pas du tout**
    un import portant déjà son extension (`@/data/city-biodiversity.json`), ce qui rendait
    `lib/biodiversity.ts` inchargeable par les gardes. ⚠️ **Non couvert** : le pendant **terrestre**
    du défaut — le disque d'une ville frontalière déborde sur un pays où la BD TOPO n'a aucun
    périmètre — **n'a pas été mesuré** (aucun polygone de frontières au dépôt), ne pas le supposer ;
    la part d'eau **par ville** n'est pas publiée (une approximation par segment de disque est
    fausse d'un facteur notable sur une presqu'île, on publie la distance mesurée) ; et `overall`
    reste `null` sur les 540.
  - **État au 2026-09-14 — le corpus GBIF est enfin tout entier à jour, et la tête du classement des
    zones protégées repose sur des zones tampons comptées comme des réserves.** Les 540 lignes sont
    en `queryVersion` 3, relevées du **09 au 13/09** : le rejeu du 10/09 est terminé, **les reptiles
    sont comptés sur les 540 villes**, **les 1 281 codes de baguage ont disparu du JSON** (56 entrées
    sur 6 480 restent sans nom anglais et retombent sur le latin, l'affichage prévu), et 540/540 sont
    mesurables. Le run a donc porté sur **la seule composante qui publie encore une note**, les zones
    protégées, et sur le contrôle qu'elle n'avait jamais subi : d'où vient son chiffre.
    ⚠️ **Un `périmètre de protection` n'est pas la réserve** — c'est la zone tampon instituée autour
    d'elle (art. L332-16 code env.). La BD TOPO le publie **dans la même couche**, donc l'ingest le
    type `reserve-naturelle` et le pondère **1,0**, le niveau le plus fort, à égalité avec une
    réserve naturelle nationale. Mesuré : **28 villes** en portent un, **6 au point que leur chiffre
    en dépende** (≥ 5 % du disque), et ces six tiennent les rangs **1, 3, 7, 11, 23 et 128** —
    Digne-les-Bains (96,3 % du disque), Apt (55,7), Manosque (23,8), Gordes (21,2), Pertuis (14,7),
    Sisteron (11,4). À Digne le tampon pèse **68 081 ha** dans le disque et la réserve qu'il entoure
    **75 ha**, 908 fois moins, à poids égal ; à Apt 39 344 contre 25.
    ⚠️ **On le dit, on ne le repondère pas** — même arbitrage qu'au couple cœur de parc / aire
    d'adhésion : la détection est un **nom**, et repondérer sur la foi d'un nom réécrirait un
    classement publié à partir d'une expression régulière. `isBufferPerimeter()`
    (`lib/biodiversity.ts`) ; `bufferShare()`, `PROTECTION_BUFFER_LED`, `PROTECTION_BUFFER_ONLY`,
    `PROTECTION_BUFFER_COUNT`, `PROTECTION_BUFFER_LED_RANKS`, `PROTECTION_BUFFER_EXAMPLE`
    (`lib/protected-areas-ranking.ts`) — **rangs et chiffres dérivés, pas recopiés**. Les deux hubs
    et les deux sous-pages ville le signalent ; `protected-areas:stats` **nomme** les villes
    concernées et `protected-areas:selftest` (+9) épingle la reconnaissance sur les chaînes réelles
    **et sur les noms de réserve qu'elle ne doit pas avaler**.
    ⚠️ **Une corrélation à ne pas re-diagnostiquer comme le défaut du 31/08** : le rang corrèle à
    **0,96** avec la part du disque tenue par le plus grand polygone, plus haut que le 0,86 qui a
    fait retirer le rang d'espaces verts — mais couvrir un disque, c'est par arithmétique être
    couvert surtout par le plus grand périmètre qui le chevauche. Le retrait du 31/08 tenait à un
    **mécanisme** (un parc à cheval compté en entier dans chaque commune), pas à sa corrélation. Les
    autres contrôles ne montrent rien : 55,2 % de variance expliquée par le département, et
    **+0,25 seulement** avec la proximité du littoral — le disque ne « mange » pas de mer au profit
    des villes côtières. 🔧 Corrigé au passage côté EN : le badge de l'aire d'adhésion disait
    « buffer zone only » alors qu'une aire d'adhésion est une **zone de charte**, pas un tampon
    (→ « adhesion area only »). Non couvert : `overall` reste `null`, et la raréfaction des deux
    villes de Guyane compte encore un casier « Animalia spec ».
  - **État au 2026-09-10 — la collecte a repris, et elle a livré un code de baguage en guise de nom
    d'espèce sur 522 pages EN.** Lignes du **09/09 (120 villes) et du 10/09 (60)** : le rejeu en
    `queryVersion` 3 a commencé, **180/540** sont à jour, 6 423 entrées sur 6 480 portent enfin un nom
    anglais. Le collecteur n'était pas mort — c'est le `git push` du cron qui l'était, du 27/08 au
    10/09. Ce run a relu ce que la collecte venait d'écrire, et **les deux défauts trouvés sont dans
    le même champ, `topSpecies`**, celui que les deux sous-pages rendent en cartes.
    ① **Les listes `/vernacularNames` de GBIF contiennent des codes de baguage à quatre lettres
    déclarés en `language: eng`**, et `pickVernacular` prenait la première entrée : **1 281 cartes sur
    522 des 540 pages EN** affichaient un code, **première carte de la section sur 180 d'entre elles**
    — `GRTI` (mésange charbonnière) sur 497, `C F` (pinson) sur 430, `COST` (étourneau) sur 237, parce
    que ce sont les oiseaux les plus observés partout. **Zéro côté FR**, donc aussi une divergence
    entre jumelles hreflang, et un pur recul : avant le 03/09 l'EN affichait le nom latin, exact et
    cherchable. ② **La dorsale GBIF porte des casiers de rang espèce « <taxon supérieur> spec »** où
    tombent les enregistrements identifiés seulement à un rang élevé : `Animalia spec` tenait le
    **rang 1 de Saint-Laurent-du-Maroni** (1 058 obs. contre **58** à la deuxième ligne) et le rang 2
    de Cayenne (1 866). ⚠️ **Aucun test de forme ne l'attrape** — « Animalia spec » passe un test de
    binôme latin, et un contrôle strict des 412 taxons du corpus avait rendu 0 anomalie. Il faussait
    aussi la **concentration des relevés** affichée juste au-dessus, celle qui a fait retirer le rang
    de richesse (Saint-Laurent 2,6 % → **0,5 %**). Livré, **au site d'affichage et non dans la
    collecte** (même doctrine que l'inversion des scores de nuisance : le correctif atteint le lecteur
    sans attendre un recrawl de 7 h) : `isPlaceholderTaxon()` + **`displayTopSpecies()`, seul accès
    autorisé à la liste d'espèces** (lire `row.topSpecies` republie le casier, comme `raw.groups[g]`
    republie le zéro des reptiles) ; `unidentifiedRecords()`, parce que le casier **mesure l'enquête**
    et se publie sous la liste avec sa part plutôt que d'être effacé — part qui est un **plancher**, on
    ne garde que 12 espèces par ville ; `isVernacularCode()` + `speciesDisplay()`, qui décide des deux
    lignes de la carte (le test `sp.vernacularEn && sp.scientificName` qui commandait le sous-titre
    latin sortait le latin deux fois dès qu'il y avait repli). Côté collecte : `pickVernacular` saute
    les codes, **`SPECIES_INFO_VERSION` 2 → 3** (sans quoi le cache disque resservait « GRTI »), et
    `fillNames` gagne sa **seule** exception à « ne jamais écraser un nom déjà affiché » — un code est
    remplacé par un vrai nom, jamais par un autre code ni par `null` : le corpus se solde en **68
    requêtes** (`biodiversity:vernacular`, déjà dans le runner) au lieu d'un recrawl.
    `biodiversity:stats` **nomme** les deux défauts ; `selftest` **54 → 74**. ⚠️ Non couvert : les
    **1 281 codes sont encore dans le JSON** (les surfaces les refusent), les **360 lignes en v2** n'ont
    pas de compte de reptiles, et la **raréfaction** des deux villes de Guyane compte toujours un
    casier — son vecteur est consommé à la collecte, donc il faut un recrawl qui écarte les casiers à
    la lecture de la facette.
  - **État au 2026-09-07 — un plafond de pagination publié comme une mesure sur 101 villes, et un
    collecteur muet depuis dix jours.** Aucune collecte depuis le **28/08** : `data/city-biodiversity.json`
    est inchangé au bit près, donc les 540 lignes sont encore en `queryVersion` 2 et **les deux
    correctifs du 03/09 (reptiles, noms anglais) n'ont atteint aucun lecteur**. ⚠️ **Le contrôle à
    faire en premier est la date des lignes, jamais leur nombre** : trois JSON pleins à 540/540 ne
    disent rien de la santé du collecteur. Le run a traité le dernier champ jamais recompté, les
    **comptes que la pagination plafonne** : la facette `recordedBy` tient sur deux pages de mille,
    donc **101 villes** valent `observers: 2000` **exactement** (la plus haute valeur non tronquée du
    corpus est 1 992) et publiaient ce plafond comme un décompte — « déposées par 2 000 naturalistes »
    dans le chapeau et `value: 2000` en JSON-LD, pendant que le tableau de chiffres de la même page
    affichait « 2 000+ », dans les deux locales, sur 202 pages. Même chose sur les **12 villes** dont
    les insectes sont coupés à 3 000, c'est-à-dire le groupe qui tient la plus longue barre du graphe.
    Et deux drapeaux (`datasetsTruncated`, `threatenedSpeciesTruncated`) étaient **calculés puis
    jetés** par le collecteur — latent, aucune ligne n'approche ces plafonds, mais muet le jour où
    l'une les atteindrait. Livré : **`countWithFloor(row, field)`**, seul accès autorisé aux quatre
    comptes plafonnables depuis une surface (même règle que `groupSpecies()` — lire `raw.observers`
    fait republier le plafond), `groupSpeciesIsFloor()` pour le graphe, `minValue` en JSON-LD, les
    budgets de pages de chaque facette réunis dans **une seule table** lue par la collecte *et* par le
    contrôle, `floorViolations()` passée sur le corpus par `biodiversity:stats` (qui **nomme**
    désormais les comptes plafonnés) et `biodiversity:selftest` de 43 à **54 contrôles**. ⚠️ Le
    « au moins » se dit **au moins** et pas « plus de » : une facette est déclarée tronquée dès que sa
    dernière page revient pleine, donc le total peut valoir exactement le plafond. ⚠️ Et un compte
    n'est un plafond que s'il a épuisé le budget **entier** de sa facette : la première version du
    contrôle signalait tout multiple de 1 000 et accusait à tort `saint-gaudens` (1 000 plantes) et
    `stains` (4 000 espèces), qui avaient encore des pages à demander.
  - **État au 2026-09-03 — deux zéros silencieux, trouvés en recomptant les champs que personne
    n'avait jamais relus.** Aucune collecte (les trois JSON sont pleins), et le collecteur GBIF
    n'avait plus rien à faire depuis le 08/08 : `crawlBatch` ne servait que les villes **absentes**
    du JSON. ① **`groups.reptiles` valait 0 sur les 540 villes et dans les deux locales** — le
    pipeline interrogeait `taxonKey: 358` (Reptilia), que la dorsale GBIF n'utilise pas ; **notre
    propre corpus le prouve**, ses fiches espèces portent `class: "Squamata"` / `"Testudines"` et
    jamais `"Reptilia"`. Le graphe filtrait `count > 0`, donc la ligne **disparaissait** : Longwy
    listait le lézard des murailles (1 203 obs.) au-dessus d'un graphe sans reptiles, comme
    Saint-Joseph (gecko de Manapany) et Saint-Paul (tortue franche). ② **`vernacularEn` valait `null`
    sur 6 480 entrées sur 6 480** (FR : 6 001) — le nom anglais était lu dans `vernacularName` de
    `/species/{key}`, jamais peuplé, alors que le nom français sortait de la liste
    `/vernacularNames` **déjà téléchargée dans la même fonction**. Les 540 pages EN listaient donc
    des noms latins. Livré : reptiles **résolus par nom** (`Squamata`/`Testudines`/`Crocodylia`, un
    nom qui ne résout plus **lève** au lieu de vider son seau), `QUERY_VERSION = 3` **et un
    `crawlBatch` qui sert enfin les lignes périmées** (il ne le faisait pas — le piège du 18/08 côté
    BODACC), `npm run biodiversity:vernacular` qui comble le trou en ~412 requêtes au lieu d'un
    recrawl de 7 h et ne remplit que des trous, `groupSpecies()` comme **seul** accès au compte d'un
    groupe (`null` = non mesuré, lire `raw.groups[g]` fait revenir le zéro), la ligne « non mesuré /
    not measured » affichée avec sa raison sur les deux sous-pages, une étape dans
    `local-data-runner.sh`, et deux garde-fous : `biodiversity:stats` **crie** quand un groupe vaut 0
    partout, `biodiversity:selftest` passe de 23 à 43 contrôles. ⚠️ Les deux corrections ne se voient
    qu'après un passage du collecteur local — à cette heure la donnée porte encore les deux zéros,
    mais les pages ne les présentent plus comme des mesures.
  - **État au 2026-08-31 — le rang d'espaces verts est retiré à son tour ; il ne reste qu'une note.**
    Aucune collecte (les trois JSON sont pleins). La composante **espaces verts** publiait un /10 sur
    529 villes depuis le 06/08 **sans avoir jamais été contrôlée** : elle ne tient pas. Le mécanisme
    est dans le code de collecte, pas dans une statistique — `scripts/city-parks.mjs` interroge
    Overpass en `(area.a)`, qui retourne tout élément **intersectant** la commune, et `out geom` rend
    la géométrie **entière** : un parc à cheval est porté **en entier** au crédit de chaque commune
    qu'il touche, puis divisé par la population de chacune. **45 polygones** sont enregistrés dans 2 à
    4 communes du seed avec la même surface (bois de Vincennes 979,7 ha à Paris, Saint-Mandé,
    Charenton-le-Pont et Vincennes ; Georges-Valbon 337,9 ha à Stains, Garges, La Courneuve et
    Saint-Denis). Mesures sur les 529 notées : corrélation de rang **+0,86** avec la surface du **seul
    plus grand polygone**, **26 des 53 villes du top 10 %** portant un polygone compté aussi ailleurs,
    **27/53** en Île-de-France, **284/529** dont un seul polygone fait plus de la moitié de la surface.
    Saint-Mandé (1 km²) sortait **10,0/10** avec les 980 ha d'un bois qui est à Paris.
    ⚠️ **Retrait complet et pas correctif ciblé** : le défaut n'est *détectable* que si la commune
    voisine est dans nos 540 — Rambouillet, Le Mans ou Dijon débordent pareil sur des communes absentes
    du seed — donc nettoyer les 78 cas visibles aurait donné le barème pour réparé. Le remède est un
    recrawl découpé sur la limite communale, pas un correctif d'affichage.
    ⚠️ **F59 n'est pas touchée** : pour un répertoire de destinations, lister le bois de Vincennes à
    Saint-Mandé est juste — c'est seulement comme **surface par habitant** que le polygone devient faux
    (symétrie exacte du zéro OSM, vrai pour `/parcs`, faux ici). `/parcs` trie par **nombre** de parcs.
    Livré : `GREEN_SPACE_RANKING_PUBLISHED = false`, motif `greenSpacePending: "incomparable"`
    (⚠️ prioritaire **après** `"mapping"`, à l'inverse de la richesse : 11 communes n'ont aucun parc
    nommé, donc rien à comparer, et le leur cacher serait faux), `greenSpaceCrossBorder()` pour que
    chaque page nomme **son** parc partagé, et un `noScoreLabel` (« rang retiré ») parce que les cartes
    de composante écrivaient **« non mesuré » au-dessus du chiffre mesuré**. **`overall` reste `null`
    sur les 540 et une seule composante porte encore une note : les zones protégées.** Les effectifs
    bruts des deux autres restent publiés, ils sont exacts — c'est le classement qui est retiré.

- [ ] **F63 — Qualité de l'air : du modèle à la mesure** — la section existe
  (`/villes/[slug]/air` ×540 + EN `air-quality`) mais `lib/air-quality.ts` **calcule
  tout par heuristique** depuis le seed (population, département, `characterTags`),
  alors que la légende affichait « ATMO · CITEPA · RNSA ». Remplacer par du mesuré :
  **indice ATMO quotidien publié à la commune** (ATMO France / data.gouv.fr) +
  **Geod'Air** (LCSQA/Ineris) pour les concentrations NO2/PM10/PM2.5/O3, rattachées à
  la station la plus proche **avec la distance affichée** (pattern
  `lib/climate-normals.ts`). Pollens RNSA : vérifier la licence avant intégration,
  sinon la dimension reste modélisée **et la page le dit**.
  - ✅ **Le volet honnêteté est soldé (2026-09-09), le volet données reste ouvert.** Les
    quatre libs du quartet (F40 risques, F41 eau, F42 air, F43 bruit) n'importent **que
    `CityLight`** — aucune donnée externe, tout vient du seed — mais les surfaces
    annonçaient « **Sources :** ATMO · CITEPA · RNSA / Propluvia · BRGM / BCSF · BRGM · ONF /
    CBS · PEB · Bruitparif ». La page `/villes/[slug]/air` avait été corrigée **seule** ; ses
    trois sœurs, les 4 cartes de `CityProfile` et les 8 hubs ne l'avaient jamais été, dans
    aucune des deux locales (1 surface sur 8). Les organismes sont désormais nommés en
    « **cadres de référence** » et chaque surface dit ce que son nombre **n'est pas** (mesure
    en station · relevé acoustique · arrêté en vigueur · zonage parcellaire). **Garde
    `env quartet` dans `npm run integrity`** : 20 surfaces contrôlées, un appel à
    `compute*`/un import de ces libs sans marqueur « estimé » fait échouer. Détail : ROADMAP
    § Shipped 2026-09-09. **Ne réintroduis pas « Sources : » sur ces quatre scores.**
  - ✅ **Étendu le 2026-09-10 aux six autres moteurs propriétaires**, qui portaient
    exactement le même défaut : `healthcare-access`, `employment-market`, `safety-deep`,
    `public-services`, `cycling-mobility` et `commerce` n'importent eux aussi **que
    `CityLight`**, et leurs surfaces annonçaient « Sources : DREES · CNOM · ARS »,
    « Sources : INSEE · DARES · SIRENE », « **détail SSMSI** » jusque dans le `<title>` des
    540 pages sécurité, et côté EN « These figures are **measured** at the departmental
    level » / « expressed **per 1,000 residents** ». Même remède, même vocabulaire
    (« cadres de référence », et chaque surface dit ce que son nombre **n'est pas** :
    relevé de cabinets · taux publié · faits enregistrés · annuaire des équipements · note
    d'enquête · décompte terrain). **Garde `moteurs` dans `npm run integrity` : 52 surfaces
    contrôlées.**
    ✅ **Corrigé le 2026-09-30, et c'était le plus large des deux : `lib/healthcare-access.ts` ne
    teste plus l'appartenance d'un slug à un `Set`, il mesure une distance.** Le défaut relevé le
    28/09 tenait en deux formes. ① `CHU_CITIES` portait `"saint-denis"` sous le commentaire « CHU
    DROM », or ce slug est **Saint-Denis (Seine-Saint-Denis)**, sans CHU, pendant que
    `saint-denis-reunion`, qui héberge le site Félix-Guyon, n'y figurait pas — dixième occurrence du
    piège d'homonymie des batches 30-33, et **les deux composites valaient 2,9**, donc aucun contrôle
    sur le score ne pouvait le voir. ② Un test sur le slug ne crédite que la commune qui **porte le
    nom** du CHU : Le Kremlin-Bicêtre (hôpital Bicêtre, AP-HP) sortait **8,0 sur les spécialistes,
    c'est-à-dire le niveau « désert »**, comme Bron, Pessac, Vandœuvre-lès-Nancy et Créteil. La
    seconde forme était de loin la plus large — **291 villes sur 540 étaient à 8,0**, contre 205
    après correction.
    Le remède est celui que cette note prescrivait : **`CHU_SITES`, 37 communes d'implantation avec
    leurs coordonnées**, sur le modèle d'`AIR_HUBS` (littéraux en dur — le module est tiré dans le
    bundle client par `lib/profile-pages.ts`, donc **aucun JSON ne doit y entrer** ; il n'importe
    toujours que `CityLight`, en `import type`). ⚠️ **Les coordonnées sont celles que
    `data/cities-seed.ts` publie pour la commune d'implantation, aucune n'est saisie à la main** : la
    précision est donc celle d'un centroïde de commune, ce qui est aussi le grain des paliers. Deux
    seuils, `CHU_ON_SITE_KM = 10` (134 villes) et `CHU_REACH_KM = 30` (111 de plus), et **une règle
    monotone à ne pas défaire : la proximité d'un CHU ne peut qu'améliorer une note, jamais la
    dégrader** — sans elle, une commune de 60 000 habitants dotée de son propre SAU serait pénalisée
    par un CHU à 25 km.
    ⚠️ **Quatre faits vérifiés en ligne avant écriture, et trois corrigent la table héritée** :
    **Orléans est le 33ᵉ CHU** (CHR érigé en CHU en 2022) et manquait ; le **CHU de la Guadeloupe est
    implanté aux Abymes**, pas à Pointe-à-Pitre — qui reste pourtant créditée, par la distance
    (2,9 km) et non par son nom, ce qui est exactement l'intérêt du modèle ; **Cayenne est un CHR
    depuis un décret de mai 2025, pas un CHU**, et sort donc de la table. Bicêtre au Kremlin-Bicêtre,
    Brabois à Vandœuvre, Haut-Lévêque à Pessac et le groupement hospitalier Est à Bron sont confirmés
    par recoupement.
    **Blast radius mesuré : 213 villes sur 540 voient leur composite bouger, 212 vers un meilleur
    accès et une seule vers un moins bon — Cayenne (2,9 → 4,3), à 1 438 km du premier CHU.** Niveaux :
    `facile` 62 → 147, `tendu` 277 → 205, **`desert` inchangé à 22**. Le red flag
    `villes-desert-medical` passe de 46 à 45 lignes, la seule sortie étant Louviers (22 km de Rouen).
    ⚠️ **Saint-Denis (93) garde 2,9** : le nombre était accidentellement presque juste, c'est sa
    justification qui était fausse — il l'obtient désormais par 8,9 km mesurés jusqu'aux sites
    parisiens. **Un composite stable n'est pas la preuve qu'un modèle est sain.**
    Prose réalignée dans les deux locales, parce qu'elle décrivait le modèle remplacé : les deux hubs
    (`/sante`, `/[locale]/healthcare`) annonçaient « ville hébergeant un CHU (**28 villes**) » quand
    le `Set` en portait 31 — le compte se dérive maintenant de `CHU_SITE_COUNT` ; les bullets
    méthodologie, le chapeau des deux sous-pages ville et la méthodologie du red flag disent
    désormais **que seule la distance est mesurée et que le reste reste estimé** (le garde `moteurs`
    l'exige, et la santé devient un cas mixte comme `demography`). L'intro du profil
    `suivi-medical-regulier` a été refaite sur mesure : son top 20 est recomposé (Ivry, Vitry,
    Vincennes, Issy, Levallois, Neuilly et Créteil entrent, aucune n'hébergeant de CHU sous son nom,
    toutes à moins de 10 km d'un site AP-HP) et **Paris, Marseille et Nice passent des rangs 57ᵉ,
    163ᵉ et 100ᵉ aux rangs 110ᵉ, 251ᵉ et 189ᵉ**. ✅ Vérifié plutôt que supposé : ses deux enseignements
    chiffrés **tiennent toujours** — les 22 villes « désert » comptent toutes moins de 15 000
    habitants (max 14 500) et affichent toutes un m² sous la médiane du site (2 500 €) — et les
    figures rurales et touristiques citées (Guéret 2,3, Aurillac 3,1, Mende 3,0, Nevers 3,6,
    Arcachon 3,5, Gordes 3,4, Saint-Tropez 4,2) sont inchangées. Les rangs 16 à 22 partagent 6,9,
    donc le top 20 coupe un palier en son milieu : publié dans l'intro, comme la section le prescrit.
    **Garde `CHU` dans `npm run integrity`** : toute entrée de `CHU_SITES` doit nommer une ville du
    seed **et** porter ses coordonnées, et se mesurer à 0 km d'elle-même — **vérifiée en la faisant
    échouer** sur le défaut d'origine exact (nom du 93, coordonnées de La Réunion), qu'elle nomme.
    ⚠️ **Non couvert** : la table ne porte que des **sites français**, donc le CHU le plus proche
    d'Hendaye sort à 184,8 km (Pessac) alors que Saint-Sébastien est à une trentaine de kilomètres —
    même limite de frontière que le disque des zones protégées ; un site implanté dans une commune
    absente du seed (La Tronche, Salouël, Chambray-lès-Tours, Saint-Priest-en-Jarez, Villejuif,
    Clamart, Bobigny) n'est pas dupliqué, la ville qui donne son nom au CHU le couvrant à quelques
    kilomètres ; et **aucune mesure de bundle n'a été prise, `esbuild` étant absent du conteneur** —
    ce qui est établi est que le module n'a gagné **aucun import** (toujours le seul `import type`),
    donc aucun fichier de données n'entre dans le graphe client.
    ⚠️ **`lib/demography.ts` est le cas mixte et a son propre marqueur** : vieillissement et
    trajectoire **sont mesurés** au recensement Insee (538/540 villes, via
    `lib/city-population`), soit 60 % du composite ; jeunes actifs et renouvellement sont
    estimés. Une surface démographie doit dire **lequel est lequel** — écrire « estimé » en
    bloc y serait faux dans l'autre sens, et le garde le refuse.
    ⚠️ **Le garde `moteurs` ne scanne que `app/**` et `components/*.tsx`**, donc il ne voit
    pas la prose qui vit dans `lib/`. C'est par là que le défaut restait : `lib/rankings-meta.ts`
    et `lib/rankings-en.ts` portaient **8 lignes « Sources : »** (DREES, Michelin, Gault &
    Millau, INAO, FUB, Géovélo, ATMO, Ademe, Cerema, Dares, Arcep, DVF, SHOM, SSMSI) sur des
    palmarès que `getRankedCities` trie **uniquement sur les axes éditoriaux du seed** — deux
    d'entre elles se contredisant dans leur propre méthodologie, qui précisait que Michelin et
    la note FUB « ne sont pas injectés ». ✅ **Corrigé le 2026-09-11**, organismes rangés en
    « cadres de référence », plus **un garde `classements`** dans `npm run integrity` qui refuse
    toute ligne « Sources : » dans ces deux tables. Deux mesures trouvées au passage et écrites
    dans la méthodologie plutôt que masquées : `/classements/bord-de-mer` annonçait un filtre
    « à 5 km du littoral » alors qu'il lit des **tags** (9 de ses 55 villes sont au-delà, Caen à
    15,0 km), et son bonus soleil annoncé « > 250 j/an » teste en réalité `sunshinedays > 2400`,
    le champ portant des **heures** malgré son nom (corpus 1 480-3 100). Détail : ROADMAP
    § Shipped 2026-09-10 et `docs/integrite-2026-09-11.md`.
    ⚠️ **Même famille, trouvée le 2026-09-11 dans `lib/city-agenda.ts`** : `isCoastal()` était
    une **recherche de sous-chaîne** sur les tags, donc le piège « `sport` contient `port` » de
    § City Match. Cinq communes publiaient « Ouverture de la saison balnéaire » — Chenôve à
    **416 km** de la mer (« vignoble **Côte** de Nuits »), Semur-en-Auxois et Montbard
    (« **Côte**-d'Or »), Rosny-sous-Bois (« centre com**mer**cial ») et Saint-Quentin
    (« Guyne**mer** »). Corrigé par la distance **mesurée** de `lib/city-coast.ts` (seuil 30 km :
    le corpus laisse un trou franc entre 29 et 150 km). ⚠️ **Ne pas symétriser** : 18 communes
    sont à moins de 5 km de la mer sans tag maritime, dont 11 ultramarines, et le corps de
    l'entrée est écrit pour la métropole — leur pousser publierait une saison fausse.
  - ⚠️ **`/classements/qualite-air` EXISTE déjà** (owner-ranking de `lib/owner-rankings.ts`,
    dossier `app/classements/qualite-air`) — la note historique « absent des 19 slugs de
    `RANKING_META` » était vraie de `RANKING_META` et fausse du site, les deux familles de
    classements étant distinctes. Vérifié le 2026-09-09. Reste réellement manquant : le **hub
    `/qualite-de-l-air`** (l'air n'est qu'une sous-page ville) et la série
    `qualite-de-l-air-[ville]-2026`, **après** la phase données seulement — un hub bâti sur le
    modèle actuel republierait une estimation en palmarès national, exactement ce que le
    retrait du rang de richesse biodiversité (10/08) et du rang d'espaces verts (31/08)
    a sanctionné.
  - ⚠️ **La direction du score est déjà correcte, ne la « corrige » pas** : le moteur
    mesure l'exposition (10 = pire), l'inversion se fait à l'affichage FR **et** EN
    avec la légende « 10 = air le plus pur ». Vérifié 2026-07-29.
  - Demande de recherche **non chiffrée** : le plan Ahrefs refuse keyword explorer et
    Search Console. Sortir les volumes de la GSC avant d'industrialiser la série.

- [ ] **F64 — Actualité locale par ville** — la seule couche mouvante du site : ce que
  les publications officielles disent d'une commune sur 12 mois glissants. Spec complète
  dans `ROADMAP.md` § « Vague 7 — F64 », **à lire avant d'y toucher** (elle contient les
  arbitrages déjà tranchés).
  - **État au 2026-08-04 (matin)** : moteur livré, **0/540 villes**. `scripts/city-news.mjs`
    (`npm run news`, + `:probe` / `:selftest` / `:prune` / `:stats`), `lib/city-news.ts`,
    `components/CityNewsSection.tsx` câblé sur les deux pages ville.
  - **État au 2026-08-04 (après la première passe réelle)** : l'ingest BODACC **ne pouvait
    pas fonctionner** et personne ne pouvait le voir depuis une routine, faute d'egress.
    Quatre défauts, tous silencieux, corrigés contre l'API réelle :
    ① `api.bodacc.fr` **n'a pas de DNS** — DILA publie sur
    `bodacc-datadila.opendatasoft.com` (l'échec remontait en « fetch failed », qui se lit
    comme un blocage proxy) ; ② la famille des procédures collectives s'appelle
    `collective`, pas `procedure_collective`, donc elles comptaient zéro partout ;
    ③ `group_by` refuse les alias et `date_format` — l'agrégation mensuelle passe par
    `year()`/`month()`, et le filtre de familles est **obligatoire** dans le `where` parce
    que `group_by` plafonne à 100 seaux (12 familles × 12 mois débordent, un mois tomberait
    en silence) ; ④ le plus vicieux — le filtre commune était une **égalité sur le nom mis
    en majuscules**, alors que `ville` est du texte libre saisi par les greffes : le 42 porte
    81 650 lignes « Saint-Étienne » **et** 46 184 « Saint-Etienne », Marseille est éclatée
    entre « Marseille » et « Marseille 8e Arrondissement ». Annecy renvoyait 12 lignes sur
    9 621 — un chiffre qui a l'air d'une mesure et vaut 0,1 % du réel. Remplacé par
    `search()`, insensible à la casse et aux accents. **Leçon générale : un constant écrit
    sans avoir vu l'API répondre est `@unverified`, et ne mérite aucune surface au-dessus.**
  - **État au 2026-08-18 — quatrième défaut du même filtre commune, corrigé.** Le filtre
    cherchait le nom **d'affichage** du seed, parenthèse de désambiguïsation comprise
    (« Saint-Denis (La Réunion) », « Le Robert (Martinique) », « Saint-Louis (Haut-Rhin) »),
    alors que le champ `ville` du BODACC ne porte que le nom de commune. Corrélation
    parfaite dans les deux sens : **les 10 seuls noms de seed à parenthèse sont les 10
    villes sorties à zéro entrée** sur 540 — le site affirmait donc que Saint-Denis de La
    Réunion n'avait rien immatriculé, rien radié et connu aucune procédure en douze mois.
    `communeName()` retire la parenthèse **finale** uniquement ; c'est la moitié
    `numerodepartement` de la clause qui distingue les homonymes, elle l'a toujours fait.
    `QUERY_VERSION` = 2 → recollecte des 540 au prochain lot local. Garde permanente :
    `news:selftest` (49 → **56 contrôles**) fait passer les **540 villes réelles** dans le
    vrai constructeur de requête et refuse toute parenthèse dans le **terme** cherché
    (pas dans la clause — `search(…)` en contient toujours). Et `news:stats` **nomme**
    désormais les villes vides au lieu de les compter : c'est ce comptage muet
    (« 13 with nothing in window ») qui a caché les dix Saint-X pendant quinze jours —
    **un agrégat de zéros doit nommer ses membres**. Restent vides et à ne pas confondre :
    `ile-de-re` (pas une commune : dix communes, ancrée sur Saint-Martin-de-Ré — non-correctif
    assumé), `dinan` et `selestat` (inexpliquées, à sonder en local avec
    `npm run news -- --slug=… --force`, ne rien écrire avant que l'API ait répondu).
  - **État au 2026-09-01 — le collecteur a repris, puis s'est arrêté après deux lots.**
    Passes des **26 et 27/08** (180 villes chacune) : le fichier porte **540 villes et 4 284
    entrées**, `meta.refreshedAt` au 27/08, et le correctif du 18/08 est confirmé contre les
    vraies données — **9 des 10 Saint-X portent leurs 8 entrées**, le dixième (`le-francois`)
    est encore en `queryVersion` 1 et guérira à son tour. Mais **180 lignes n'ont jamais été
    reprises** (v1, 04-05/08, 27-28 jours) : le seuil ramené à 21 jours le 25/08 **parle pour
    la première fois, sur 177 villes**. ⚠️ Deux lots puis plus rien ressemble davantage à une
    passe lancée à la main qu'à un cron rétabli — le tell à vérifier au prochain run est que
    ces 180 lignes v1 soient toujours là (`pickBatch` sert d'abord les versions périmées, donc
    un cron sain les aurait prises au troisième lot).
    **Ce que ce run a mesuré, et qui était listé « inconnu » depuis le 11/08 : un mois clos ne
    bouge plus.** 360 villes comptées deux fois à 22 jours d'écart, 2 471 seaux
    (ville, mois, famille) comparables : **aucun en baisse**, et les **1 769 seaux de juin et
    juillet identiques à l'unité près**. Seul août grossit (×5,5). Donc les lignes datées d'un
    mois sont dans l'index dans les jours qui suivent sa fin, **la seule ligne qui bouge d'un
    rafraîchissement à l'autre est celle du mois en cours**, et un écart entre deux mois pleins
    de la colonne est réel.
    **Défaut corrigé : la note du mois partiel qualifiait au lieu de mesurer.** « Il porte
    quelques jours quand les autres portent un mois entier » était exact le 11/08 (arrêt au 4,
    soit 4/31) et **faux après les passes du 26-27** (26-27/31) : elle invitait à écarter un
    chiffre couvrant 84-87 % de son mois. Le fichier porte **les deux régimes à la fois** —
    208 entrées à 13-16 %, 1 011 à 84-87 % — donc aucun adjectif ne vaut pour les deux.
    `newsPartialCoverage()` rend `{ through, daysCounted, daysInMonth }` et la surface **cite
    la couverture** (« soit 26 des 31 jours du mois »), vrai à 4/31 comme à 27/31. Le comptage
    reste une affirmation sur **notre fenêtre de requête**, jamais sur ce que le BODACC avait
    publié. `news:selftest` 58 → **60 contrôles** : la note doit interpoler les jours et ne
    peut plus contenir d'adjectif fixe (lecture du composant **commentaires retirés** — le
    commentaire qui pose la règle cite forcément la formule qu'elle interdit).
  - **État au 2026-09-08 — le collecteur n'a pas repris, et la source jamais relue lisait une
    page sur huit.** `refreshedAt` toujours au **27/08** (12 jours), et le tell posé le 01/09 est
    confirmé : les **180 lignes v1 du 04-05/08 n'ont jamais été servies** (34-35 jours), donc
    **aucune troisième passe** — les deux lots des 26-27/08 étaient une intervention manuelle, pas
    un cron rétabli. 177 villes étiquetées « relevé non repris ». ⚠️ **Le contrôle à faire en
    premier est la date des lignes, jamais leur nombre** : 540/540 villes et 4 284 entrées ne
    disent rien de la santé du collecteur. **Le défaut corrigé est dans Géorisques, la seule des
    trois sources que personne n'avait relue** (le BODACC a été corrigé quatre fois, le RNA est
    désactivé) : l'ingest CatNat demandait **`page=1&page_size=50` sans `sort`** sur une histoire
    GASPAR qui remonte à **1982**. Lire une page n'est correct que si l'API trie du plus récent au
    plus ancien — ordre **jamais observé et jamais demandé** ; sous l'ordre inverse, une commune à
    longue histoire ne renvoie que les années 1980-1990, le filtre à 12 mois vide la page, et
    **ce vide est publié comme une mesure** (la ville inscrit `georisques` dans `sources`, donc
    « on a demandé et il n'y avait rien »). Même signature que les trois zéros BODACC et que le
    plafond de pagination publié en biodiversité le 07/09 ; l'argument est dans le fichier
    lui-même, où `bodaccFamilyFilter()` raisonne le plafond de seaux pour *l'autre* source.
    Mesuré : **502 villes nomment Géorisques sans lister d'arrêté**, 34 en listent un ou deux
    (40 arrêtés, 5 arrêtés nationaux distincts). ⚠️ **Aucun de ces 502 zéros n'est démontré faux
    et il ne faut pas l'écrire** — `lib/natural-risks.ts` est heuristique, s'en servir pour
    corroborer serait circulaire. Ce qui est démontré suffit : **le code ne distingue pas « aucun
    arrêté » de « les arrêtés récents étaient au-delà du plafond »**. Correctif : `collectCatnat()`
    **pagine et s'arrête à la première page courte** (complet quel que soit l'ordre), budget
    8 × 50 = 400 en **fil-piège et non en limite**, échec **gradué** (page 1 lève → source
    enregistrée absente, jamais zéro ; page 2+ garde les pages lues et remonte `truncated`),
    `QUERY_VERSION` = **3**. **Aucune surface ne lit `truncated`** : le champ est typé et omis
    quand vide, mais le collecteur doit avoir tourné une fois avant qu'on prétende savoir à quoi
    il ressemble — en revanche `news:stats` **nomme** les villes à lecture courte et dit que leurs
    comptes sont des planchers. `news:selftest` 60 → **73 contrôles**, dont le défaut écrit comme
    un test (une page d'une histoire triée du plus ancien ne voit aucun arrêté récent).
  - **État au 2026-09-15 — le collecteur est sain, son silence est nominal, et la section annonçait
    douze mois pour en montrer trois.** Trois passes les **09/09 (×2) et 10/09**, **540 lignes en
    `queryVersion` 3**, 4 292 entrées, âge 5-6 jours, **zéro ville étiquetée « relevé non repris »**
    (177 au run précédent). ⚠️ **Rien depuis cinq jours est la bonne réponse et non une panne** :
    `pickBatch()` ne sert que les lignes échues et aucune ne l'est avant `DUE_AFTER_DAYS` (14), donc
    le collecteur sort sur « nothing to do » jusque vers le 23/09. Les trois runs précédents ont lu
    un silence comme une mort, à raison ; lire celui-ci pareil serait l'erreur symétrique. **La
    question ouverte le 08/09 est tranchée : les 502 zéros Géorisques étaient vrais.** La pagination
    a tourné sur les 540 villes en v3, aucune lecture courte (`⚠ incomplete reads` ne s'imprime pas),
    et le comptage donne **34 villes / 40 arrêtés — identiques entrée par entrée** à l'état v2
    d'avant correctif (même jeu de villes, zéro écart, 19 arrêtés distincts). Le correctif reste
    juste et ne se défait pas : **il a supprimé un pari sur un ordre de tri jamais observé, et c'est
    le pari qui était le défaut, pas son résultat.** **Le défaut corrigé ce run est la phrase
    d'introduction**, sur les 537 pages rendues et dans les deux locales : elle annonçait « sur les
    12 derniers mois » alors que 12 est la fenêtre **interrogée** et que la liste **imprimée** est
    plafonnée à 8 entrées. Mesuré à travers `cityNews()` : **536 des 537 villes sont au plafond**, la
    liste porte **3 mois pour 332 villes, 4 pour 174** (506/537 à quatre mois ou moins, médiane 3,
    **aucune à douze**). Conséquence, et c'est ce qui range le défaut dans la même famille que les
    quatre précédents — un silence qui se lit comme une mesure : la note sous la liste invite à lire
    la colonne, donc un mois sans ligne se lit comme un mois sans dépôt, et **47 villes rendent une
    liste trouée** (Nantes : mars, puis juillet à septembre) dont les trous sont des **évictions par
    le plafond**. Correctif au site d'affichage : **`newsSpan(entries)`** prend **le tableau déjà
    rendu**, donc la portée citée ne peut pas diverger de la liste faute d'une seconde requête à
    tenir synchronisée ; la surface énonce fenêtre **et** portée réelle, et la mise en garde
    d'éviction n'est imprimée que si `capped` (quand rien n'a été jeté, un mois absent est un vrai
    mois vide). ⚠️ **Piège à ne pas réintroduire** : le premier jet écrivait « les 8 signaux **les
    plus récents** », ce qui décrit un tri par date alors que la liste est un **tourniquet par type**
    (`roundRobinByKind()`) — c'est pour ça que Nantes garde son arrêté CatNat du 2 mars. La phrase
    était fausse sur la page même qui a servi à la relire ; l'énoncé juste est « les plus récents
    **de chaque type** ». `news:selftest` **73 → 77**, les deux anciennes phrases nommées et
    interdites, garde vérifiée **en la faisant échouer**. 🔧 Au passage, `meta.queryVersion` passe de
    **1 à 3** : le fichier annonçait 1 pour des lignes toutes en 3, et le correctif du 11/09
    n'attendait qu'une **écriture** pour s'appliquer — c'est `news:prune` qui l'a produite ce run, une
    ligne de diff, aucune entrée touchée. Personne ne lisait ce champ (`pickBatch` et les surfaces
    lisent la version **de la ligne**), mais un champ de provenance qui ment finit par être cru.
  - **La collecte est automatisée, ne la relance pas depuis une routine.**
    `scripts/local-data-runner.sh` (cron local, 02h20 / 14h20 UTC) lance `npm run news` par
    lots de 180 villes (~4 s la ville), commite `data/city-news.json` et pousse.
    `npm run news:prune` (refenêtrage 12 mois) et `:selftest` marchent hors ligne. Le RNA
    reste **désactivé** : `RNA_RESOURCE_ID` vaut `null`, la ressource n'a jamais été résolue,
    et une ville sans cette source l'omet de `sources` plutôt que d'afficher zéro association.
    ⚠️ **« Le collecteur est muet » a été un faux diagnostic deux fois de suite (07/09 et 08/09) :
    il tournait deux fois par jour et c'est le `git push` qui échouait.** Du **2026-08-27** au
    **2026-09-10**, `gh` gardant le jeton GitHub dans le trousseau de la session de bureau,
    aucun processus cron ne pouvait s'authentifier (`could not read Username`) : quatre commits
    de collecte sont restés locaux, `origin/main` a porté des JSON figés au 27/08, et les
    routines ont donc lu des données périmées en croyant le cron mort. Corrigé le 2026-09-10
    (jeton dans `~/.git-credentials`, helper `store` ajouté pour github.com en repli de `gh`).
    Conséquence de méthode : **avant de conclure quoi que ce soit sur la fraîcheur d'un JSON de
    pipeline, lis `~/.local/state/meilleurville/data-runner.log`** — le runner y écrit
    `FATAL push failed` — et compare `git log origin/main -1 -- <fichier>` au HEAD **local**.
    Un dépôt qui diverge de son origine se lit exactement comme un collecteur arrêté.
  - **Une section, pas une page.** Pas de `/villes/[slug]/actualites` ×540 : une page
    dont le corps est une liste de titres agrégés est du *scraped content*. Donc pas
    d'URL propre, pas d'entrée sitemap, pas de JSON-LD `NewsArticle` (on n'est pas
    l'éditeur), et la section **disparaît** quand la ville n'a rien dans la fenêtre.
  - **Rendu serveur obligatoire** : `CityProfile` est `"use client"` et déjà à ~1 Mo de
    JS ; le composant est monté *après* lui dans la page serveur (précédent
    `CityGuidesList`), jamais importé depuis un composant client.
  - **BODACC et RNA agrégés en compteurs mensuels, jamais nominatifs** — une grande part
    des annonces vise des entrepreneurs individuels, donc des personnes physiques. Seuls
    les arrêtés CatNat, actes de l'État ne nommant personne, sont listés à l'unité.
  - **La presse quotidienne régionale est gatée** (droit voisin, loi 2019-775) et Google
    News RSS est interdit par ses CGU. Aucun scraping d'article, aucune reformulation IA
    (reformuler ne fait pas disparaître le droit voisin, ça ajoute une erreur factuelle
    signée par nous). Phase 1 = open data officielle uniquement.
  - Convention d'honnêteté : on n'y classe ni ne commente. Une création d'entreprise
    n'est pas une bonne nouvelle en soi, une radiation n'est pas une mauvaise. `licence`
    est portée **par entrée**, pas par fichier.

