# Pour qui (profils)

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Section d'origine conservée mot pour mot.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


### Pour qui (`lib/profile-pages.ts`)

Un profil = une entrée de `PROFILE_PAGES` (slug, emoji, label, meta, intro, `weights`,
`reasonHint`). Ajouter l'entrée suffit : `/pour-qui`, `/pour-qui/[profil]`, le sitemap et le bloc
« parfait pour » de `lib/honest-reviews.ts` en dérivent tous les quatre. **Compteur mesuré
(`grep -c '^    slug: "'`) : 39 profils** (2026-10-21).
⚠️ **Avant d'ajouter un profil, mesurer son bas de classement — `rankByProfile` trie sur le
score *arrondi* au dixième**, donc un palier d'ex æquo est coupé en son milieu et les rangs
qui suivent sont l'ordre d'insertion du seed, exactement le défaut que `lib/owner-rankings.ts`
interdit ailleurs. Constaté le 2026-08-28 sur un profil candidat « horaires décalés / travail de
nuit », écarté pour cette raison : **24 villes à égalité à 7,6 au rang 20**, les rangs 15 à 25
partageant la même note. La cause est en amont, dans les pondérations : `score_bruit`
(`lib/owner-scores.ts`) est un proxy en **paliers de population** qui rend 9,8 pour à peu près
toute commune sous 60 000 habitants — ce n'est donc pas un critère mais une constante, et un
classement bâti dessus ne départage rien (précédent du rang de richesse biodiversité, retiré le
10/08). Un nouveau profil doit s'appuyer sur un axe **continu** (`metroAccess`, `coastalProximity`,
`healthcareAccess`, `investorYield`…), et le contrôle à faire avant d'écrire une ligne de prose est
un `npx tsx` de scratch qui imprime le nombre d'ex æquo à la note du 20ᵉ. Les mesures publiées
jamais pondérées par un profil, si l'on cherche un cardinal neuf : `lib/city-income.ts` (Filosofi,
533/540), `lib/property-prices.ts` (DVF, 499/507) et la structure d'âge réelle de
`lib/city-population.ts` (538/540).
⚠️ **Mais ces trois-là se paient au bundle client, et la note ci-dessus ne le disait pas** (mesuré
le 2026-09-11) : `lib/profile-pages.ts` est importé **en valeur** par `PeopleLikeYouClient`, donc un
`weights` qui lit `lib/property-prices` embarque ses 172 Ko de JSON dans le bundle de
`/people-like-you`, `lib/city-population` 140 Ko, `lib/city-income` 38 Ko. Le seul des trois qui
passe sans projection est l'income ; pour les deux autres, le remède est celui déjà en place pour
`EXPAT_COUNTRY_OPTIONS` et `SEARCH_CITIES` (projection maigre descendue en props), pas un import
direct. Un cardinal **calculé** depuis des coordonnées en dur ne coûte rien, lui : c'est le parti
pris de `EMPLOYMENT_HUBS`, `BORDER_HUBS` et maintenant `AIR_HUBS`.
Dernier ajouté : **`couples-a-deux-carrieres`** (2026-10-21) — poids `metroAccess` 3,0 · `remoteWork` 2,0 · `transport`/`life`/`cost` 1,5, tous axes continus. Mesuré avant écriture : rangs 15 à 20 à 7,9 et 21e à 7,8, donc **aucun palier coupé au 20e** ; recouvrement maximal 13/20 avec `sans-voiture` ; 9 villes sur 20 en Île-de-France, 8 régions, 14 départements ; T3 médian 1 225 € contre 950 €, m² 4 200 € contre 2 700 € ; Paris 27e (7,7), Marseille 236e, Obernai seule commune sous 30 000 hab. Le profil mesure la distance à un pôle, pas le nombre d'emplois, et l'intro le dit. Aucune jumelle EN. `tsc`, `integrity` verts ; `npm run build` non lancé.
Précédent : **`artistes-et-createurs`** (2026-10-14) — poids `culture` 3,0 · `cost` 3,5 · `life` 1,0 · `safety` 0,5, **uniquement des axes continus** : `bruit` (palier de population) et `solitude` (proxy départemental) ont été essayés puis écartés, et le palier d'ex æquo en dépendait (9 villes à 7,5 au rang 20 avec eux, 5 à 7,7 sans). Mesures publiées dans l'intro : l'axe culture sature (18 villes à 9,0, Paris comme Autun, seules 5 dans le top 20), Paris 315ᵉ, T3 médian du top 20 715 € contre 950 €, recouvrement maximal 13/20 avec `jeunes-actifs`, rangs 20 à 24 ex æquo à 7,7. Le coût pèse plus que la culture, sinon le classement redonne les capitales. Aucune jumelle EN. `tsc`, `integrity`, `sitemap:check` (FR 31 747) verts ; `npm run build` non lancé.
Précédent : **`professionnels-de-sante`** (2026-09-30) — le premier profil du fichier dont le
critère cardinal est une **pénurie lue à l'endroit du moteur**, et la **troisième exception** documentée en
tête de `lib/profile-pages.ts` : nouvelle clé `healthcareScarcity`, qui lit le composite F47
(`lib/healthcare-access`) **sans inversion** (`10 = désert`) avec un poids positif, là où
`healthcareAccess` le retourne inversé sur les profils de patients. Précédent exact de `rentalTension` sur
`investisseurs-locatifs` : une nuisance pour l'un est un signal pour l'autre, la même clé sur un profil de
patient serait un bug. L'audience est le soignant qui cherche **où installer un cabinet** — c'est le miroir
de `suivi-medical-regulier`, qui classe le même composite du point de vue de qui doit s'y rendre.
⚠️ **Le chiffre le plus important de la page est publié dans son intro et doit y rester : 73 % de la variance
de l'indicateur s'explique par le seul département** (102 départements au corpus), parce que la densité de
généralistes de F47 est une valeur départementale. Le classement trie donc des départements avant de trier
des villes. **Ce n'est pas le défaut qui a fait retirer le rang de richesse biodiversité** (10/08, 56 % de
variance départementale) : là le score classait le *type de programme de saisie* et non la nature, ici il
mesure ce que son nom annonce, à la maille de sa source. Et la grille n'est pas plate à l'intérieur d'un
département — les dimensions urgences, spécialistes et pharmacies suivent la taille de la commune, d'où
La Flèche et Sablé-sur-Sarthe à 7,7 contre **Le Mans à 5,2**, même département. C'est ce quart de variance
restant qui sépare une sous-préfecture d'une ville-centre.
**Discrimination mesurée avant écriture** (contrôle prescrit ci-dessus) : **6 ex æquo à 7,3 au rang 20**,
sous la médiane de 7 des 36 profils existants, et les rangs 17 à 22 ne sont pas départagés — publié dans
l'intro, comme l'usage de la section le veut. **Recouvrement maximal 8/20** (avec `neo-ruraux`), là où la
médiane des recouvrements maximaux entre profils existants est de **13** (min 3, max 18) : le classement est
réellement neuf. Trois configurations de poids ont été mesurées avant de trancher ; celle qui pondérait la
famille sortait à **13/20 de recouvrement** avec `familles-nombreuses` et laissait entrer Obernai à 4,8 de
manque, donc la pénurie cessait d'être cardinale — écartée.
⚠️ **L'enseignement éditorial est que le classement n'est PAS « les villes les plus dépourvues », et il ne
faut pas le « corriger » en ce sens** : 16 des 22 villes de niveau désert y sont, mais les **deux plus
dépourvues du corpus en sont absentes** — Mauriac (8,2, le manque le plus élevé des 540) sort **84ᵉ** et
Clamecy (8,0) **99ᵉ**, sur une qualité de vie à 3,8 et 4,5 et des écoles à 2,2 et 2,4 ; Aubusson porte le
même 8,0 que Clamecy et sort **5ᵉ**. Quatre villes du top 20 ne sont même pas au niveau désert mais tendu
(Saint-Girons, Fontenay-le-Comte, Florac-Trois-Rivières, Gourdon). Gérardmer sort 1ʳᵉ avec la meilleure
qualité de vie du lot (8,7) **et le logement le plus cher des vingt** (T3 870 €, m² 2 200 €) : elle ne gagne
pas en étant bon marché. Repères mesurés : top 20 sur **15 départements et 8 régions**, aucune ville au-delà
de **14 500 habitants**, T3 médian **700 €** contre 930 € au corpus et m² médian **1 300 €** contre 2 500 € ;
la Creuse place trois des vingt (Aubusson, Guéret, La Souterraine) ; première ville de plus de 20 000
habitants **Saint-Dié-des-Vosges 24ᵉ**, puis Vichy 30ᵉ, Laon 46ᵉ, Chaumont 48ᵉ ; à l'autre bout de l'axe
Rennes, Angers, Strasbourg, Grenoble, Dijon et Nantes à **2,1**. Niveaux F47 sur les 540 : **147 faciles,
166 correctes, 205 tendues, 22 déserts**, médiane 4,5.
⚠️ **Le fait réglementaire le plus utile de la page est daté et contre-intuitif, à revérifier avant de le
durcir** : les quatre contrats démographiques de l'Assurance maladie (**CAIM, COTRAM, COSCOM, CTSM**) ont
cessé d'exister le **31 décembre 2025**. Depuis le **1ᵉʳ janvier 2026**, une aide ponctuelle à la première
installation en libéral, versée automatiquement par la CPAM, les remplace : **environ 10 000 € en ZIP**, un
montant plus faible en ZAC, de l'ordre de **3 000 €** pour un cabinet secondaire en ZIP. L'ancien CAIM
pouvait atteindre **50 000 €**, donc l'incitation a été **divisée par cinq** — la page dit que c'est une
prime et non un plan de financement. ⚠️ **Le montant ZAC n'est pas chiffré dans la copie** : une seule des
sources consultées le donnait (5 000 €), les autres se bornant à « plus faible » — même doctrine qu'aux
batches 46, 48, 50 et 52, une phrase sans chiffre vaut mieux qu'un chiffre faux. Faits vérifiés en ligne et
recoupés sur plusieurs résultats (méthode retenue depuis le batch 48, `WebFetch` restant bloqué) ; les faits
ZIP/ZAC, MSP (2 644 en 2024, objectif 4 000 en 2027) et zone FRR (17 700 communes, treize départements en
totalité) sont **repris du glossaire du site** plutôt que redérivés.
⚠️ **Trois prudences dans la copie, à ne pas diluer** : ① « désert médical » est nommé pour ce qu'il est, une
expression de presse sans catégorie administrative ni aide attachée, seul le **zonage ARS** ouvrant des
droits, avec son millésime ; ② **le zonage n'est pas le même pour toutes les professions** — médecins par
arrêté du 13 novembre 2017 et méthodologie ministérielle, orthophonistes (31 mai 2018),
masseurs-kinésithérapeutes (24 septembre 2018), sages-femmes (17 octobre 2019) et infirmiers
(10 janvier 2020) par négociation Assurance maladie / syndicats, donc notre indicateur, qui estime une
densité de **médecins**, situe un territoire et ne dit pas à une kinésithérapeute si sa propre profession y
est sous-dotée ; ③ le zonage travaille par **bassin de vie** et notre modèle par commune, et le vrai risque
de ces territoires est l'**isolement professionnel et la charge de garde**, pas l'absence de patients — d'où
le renvoi à la MSP, au centre de santé et à la CPTS.
✅ **Garde `pour-qui` ajoutée à `npm run integrity`** (3 surfaces → 2 profils contrôlés) : tout profil dont
les `weights` portent `healthcareAccess` ou `healthcareScarcity` doit dire **dans sa propre intro** que le
score est estimé. Le contrôle est **par entrée et non par fichier**, volontairement — `PROFILE_PAGES` est un
seul tableau, donc le marqueur d'un profil satisferait tous les autres, exactement le piège du 17/09 où un
commentaire posant la règle validait la surface. Il lit l'intro seule, pas les commentaires de pondération, et
**il a été vérifié en le faisant échouer** sur ce profil précis (il nomme `professionnels-de-sante`). C'est le
troisième angle mort de la garde `moteurs`, qui ne parcourt que `app/**` et `components/*.tsx`, après
`lib/rankings-meta.ts` (11/09).
`metaTitle` **51** caractères, `metaDescription` **149**, intro **1 557 mots**, **6 em-dashes** soit 1 pour
260 mots (cible R7.10 ~200), densité d'accents **0,175** par mot (seuil ascii-strip 0,09), aucune figure en
`/10` dans la prose, aucun `m2` / `EUR` / `deg` ascii, aucun mojibake, aucune apostrophe typographique. Les
axes cités sont lus dans **`CITIES_LIGHT`**, donc `CITIES_SEED` calibré et normalisé, **jamais un littéral du
seed** ; loyers et m² viennent de `data/housing.ts`. Aucune jumelle EN à câbler : `app/[locale]/for-who/[slug]`
est une **sélection de 13 profils**, un profil FR sans jumelle est normal et ne demande pas de hreflang.
Contrôles : `npx tsc --noEmit` **propre**, `npm run integrity` (37 profils, garde `pour-qui` verte),
`npm run sitemap:check` (FR 29 301 → **29 302 URL**, soit exactement la page neuve ; EN 28 905 inchangé),
`npm run parity` (**code 0**), `npm run hreflang:check`, plus une relecture de la prose rendue qui a corrigé
cinq formulations avant commit — dont **un superlatif que le paragraphe suivant contredisait** (« le seul
classement de ce site qui récompense une pénurie », alors que `investisseurs-locatifs` le fait déjà et sert
de précédent deux phrases plus loin) et **une quantité inventée** (« vaut plus que six places de
classement »). `npm run build` **non lancé, volontairement** (cf. § Commands depuis le batch 27).
Avant-dernier ajouté : **`famille-a-l-etranger`** (2026-09-11) — le seul profil du fichier dont le critère
cardinal est **l'avion**, et le premier à mesurer un accès vers l'extérieur du pays autrement qu'en
navette quotidienne. Nouvel axe `airportAccess` / `airportAccessHub()` : **51 plateformes** (47 en
France métropolitaine et outre-mer, 4 étrangères), coordonnées relevées par code IATA dans le jeu
ouvert **OurAirports** (domaine public) et écrites en dur, comme `EMPLOYMENT_HUBS` et `BORDER_HUBS`,
pour que le module reste sans données au bundle client. Le score est un produit **plafond ×
décroissance** : distance à vol d'oiseau majorée de 1,25, plein plafond jusqu'à 20 km, zéro à 250,
puissance 1,15 entre les deux. Quatre points de méthode à ne pas défaire : ① le `tier` dit **ce
qu'on peut prendre un mardi de novembre**, pas le trafic d'août — il suit les chiffres 2024 (France
178 M de passagers ; CDG 70,3 M, Orly 33,1, Nice 14,7, Marseille 11,2, Lyon 10,4, Bâle-Mulhouse 8,9,
Toulouse 7,8, Nantes 7,0, Bordeaux 6,5, Genève 17,8) mais les traduit en usage, si bien que **seule
une ville proche de Roissy peut atteindre 10** (18 y parviennent, toutes à moins de 20 km) ; ② un
aérodrome **sans ligne commerciale régulière n'est pas dans la table** (Mende, Vatry, Angers) —
l'inscrire donnerait une note d'accès aérien à une ville qui n'a pas d'avion ; ③ quatre plateformes
étrangères entrent parce qu'elles sont le vrai aéroport de référence d'une partie du territoire
(Genève et son secteur français, Bruxelles-Zaventem, Barcelone-El Prat, Luxembourg-Findel), tandis
que **Bâle-Mulhouse est un aéroport français**, à Saint-Louis, malgré son statut binational ;
④ `lib/distances` porte déjà une liste `AIRPORTS` et **elle n'est pas réutilisée**, volontairement :
dix plateformes métropolitaines, sans la Corse, sans l'outre-mer, sans Bâle-Mulhouse ni aucun
aéroport étranger, donc Mulhouse rattachée à Strasbourg à une centaine de kilomètres quand
l'EuroAirport est à cinq. La corriger déplacerait la ligne « aéroport le plus proche » des 540
fiches ville : c'est une autre décision, pas celle de ce run.
**Ex æquo mesurés avant écriture** (contrôle prescrit ci-dessus) : 7 villes à 6,9 pour les rangs 15
à 21, donc **Domont, 21ᵉ, a la même note que Cergy, 15ᵉ** — l'intro le dit. C'est la meilleure forme
de coupe possible et non une exception : le comptage fait ce run donne une **médiane de 7 ex æquo au
rang 20 sur les 35 profils existants**, et **33 sur 35** coupent à l'intérieur d'un palier. La
convention de `lib/owner-rankings.ts` ne s'applique donc pas telle quelle ici (on ne peut pas
raccourcir un top 20 partagé par tout le fichier) : l'usage de la section, posé par
`travailleurs-frontaliers`, est de **mesurer le palier et de le publier dans l'intro**.
Recouvrement maximal avec les 35 autres profils : **3/20** — le plus faible du fichier avec
`navetteurs-hybrides`. Deux mesures portent l'éditorial : ① **avoir un aéroport n'est pas avoir un
accès** — Rennes, Limoges et Clermont-Ferrand ont une piste à moins de 10 km et sortent à 4,0/10,
Lille et Montpellier à 5,5, quand Mulhouse atteint 6,8 sans aéroport municipal et Annemasse 8,5 sans
aucune piste ; ② la frontière suisse tient les deux extrêmes du même axe, Gex à 14 km de Genève avec
un T3 à 1 490 € et un m² à 5 200 €, Saint-Claude avec un accès presque équivalent à 720 € et
1 300 € — mais **10 690 habitants en 2011 pour 8 556 en 2022**, donc un prix de déclin et pas une
bonne affaire.
⚠️ **Le classement ne pondère pas le bruit des avions, et c'est dit dans l'intro** : les villes qui
plafonnent sur l'axe sont par construction celles qui vivent sous les trajectoires. Notre estimation
(`lib/noise-exposure`, **estimation** et non relevé acoustique — cf. le correctif du 09/09) place
Tremblay-en-France, Goussainville, Gonesse et Villiers-le-Bel au niveau le plus fort ; **aucune des
quatre n'est dans le top 20**, écartée par le coût et la qualité de vie et non par une pondération
du bruit, et la seule du classement au-dessus du plancher aérien est Ivry-sur-Seine. La page renvoie
au **plan d'exposition au bruit**, qui est le document opposable. Deux réserves publiées comme des
mesures : l'outre-mer sort à 6,0 (Saint-Denis, Fort-de-France, Pointe-à-Pitre) et 5,0 (Cayenne,
Mamoudzou) sur un trafic qui part **dans une seule direction**, et Saint-Laurent-du-Maroni ferme
l'axe à 0,0 ; côté métropole les plus enclavées ne sont ni en montagne ni sur une île, ce sont
Bourges (1,3), Nevers (1,2) et Bar-sur-Aube (1,1). Coût client mesuré à l'esbuild, axe et prose
compris : **175 051 → 187 755 o minifiés, 49 447 → 53 564 o gzip** — aucun JSON de données ajouté.
Aucune jumelle EN : `app/[locale]/for-who/[slug]` est une **sélection de 13 profils**, un profil FR
sans jumelle est normal et ne demande pas de hreflang.
Ajouté avant lui : **`travailleurs-frontaliers`** (2026-08-31) — le seul profil du fichier dont le
critère cardinal pointe **hors de France**. Nouveau composite `borderAccess` / `borderCommute()` :
distance routière estimée au plus proche de **14 pôles d'emploi transfrontaliers sur 5 pays**,
plein score à 20 km, décroissance en puissance 1,4, zéro à 110 km — **89 villes sur 540** sont dans
le champ, 11 à 20 km ou moins. Quatre points de méthode à ne pas défaire : ① la liste des pôles suit
les **flux mesurés par l'Insee** (recensement 2021 : 465 000 frontaliers, Suisse 224 000,
Luxembourg 105 000, Allemagne 50 000, Belgique 46 000, Monaco 33 000), donc **l'Espagne et l'Italie
en sont absentes** — 5 000 chacune, un ordre de grandeur sous le plus petit pôle retenu ; ajouter
Irun mettrait Hendaye en tête d'un classement qui parle d'autre chose, et son 0 est une mesure au
même titre que celui de la Corse et des DROM ; ② le barème publie des **kilomètres, pas des
minutes**, à l'inverse de `metroAccess` : un franchissement de frontière se mesure en files
d'attente (Bardonnex, Huningue, Basse Corniche), et un modèle horaire y mentirait plus qu'ailleurs ;
③ le facteur de détour est **1,3** et la décroissance est plus sévère qu'une droite au milieu de
fourchette, calée sur le fait que l'Insee compte un frontalier sur cinq au-delà de 50 km ;
④ à distance égale, une vallée alpine, un col du Jura et la plaine d'Alsace sont traités pareil, et
Saint-Paul-de-Vence (20ᵉ, 32 km de Monaco, 3 600 hab., T3 1 780 €) est le cas où le modèle est le
plus généreux — l'intro le dit. **Ex æquo mesurés avant écriture** (contrôle prescrit ci-dessus) :
5 villes à 6,5 pour 3 places au rang 20, 1 seule au rang 10, très loin des 24 qui ont fait écarter
le profil « horaires décalés ». Recouvrement maximal avec les 34 autres profils : **4/20**
(`couple-sans-enfant`, `familles-avec-ados`, `amateurs-de-montagne`) — le classement est
réellement neuf. Le résultat éditorial est la **ligne de fracture du loyer sur les 11 villes à
10/10** : frontière chère au sud et au Léman (Nice T3 1 500 €, Menton 1 450 €, Annemasse 1 350 € et
4 800 €/m²) contre frontière bon marché au nord et à l'est (Forbach 670 € et 1 200 €/m²,
Sarreguemines 690 €, Roubaix 700 €, Tourcoing 740 €, Longwy 910 €) — du simple au double sur le
loyer, du simple au quadruple sur le mètre carré, pour le même quart d'heure de trajet. Les règles
fiscales et sociales citées dans l'intro sont **datées et vérifiées ce run**, à revérifier avant de
les durcir : accord suisse de 1983 (8 cantons, imposition en France, 4,5 % de la masse salariale
reversés) contre accord genevois de 1973 (imposition à la source, 3,5 % reversés à l'Ain et à la
Haute-Savoie) ; avenant télétravail signé le 27/06/2023, **en vigueur le 24/07/2025 et applicable
depuis le 01/01/2026**, 40 % du temps annuel dont 10 jours de missions, échange automatique de
données salariales à partir de 2027 sur l'année 2026 ; **34 jours** par an hors du Grand-Duché côté
Luxembourg (compteur de jours, pas un pourcentage) ; **49,9 %** de télétravail côté sécurité sociale
depuis l'accord-cadre européen du 01/07/2023, un troisième plafond indépendant des deux premiers ;
droit d'option LAMal / assurance maladie française à exercer sous **3 mois**, l'assurance privée
française n'étant plus une option depuis le 01/06/2014. Aucun `descriptionEn` ni jumelle EN :
`app/[locale]/for-who/[slug]` est une **sélection de 13 profils** (comme `EN_THEMES` pour les red
flags), un profil FR sans jumelle est normal et ne demande pas de hreflang.
Ajouté avant lui : **`suivi-medical-regulier`**
(pathologie chronique imposant des rendez-vous réguliers) — le premier profil du fichier dont le
critère cardinal est l'**accès aux soins**, alors que `lib/healthcare-access.ts` (F47) existait
depuis longtemps sans qu'aucun des 33 profils ne le pondère, `proches-aidants` compris.
⚠️ **Inversion de direction, à ne pas « corriger »** : F47 mesure la *difficulté* (10 = désert,
convention du quartet environnement) ; la clé de poids s'appelle `healthcareAccess`, donc une
qualité, et `getScoreValue()` retourne `10 - composite`. L'inversion est au site d'affichage, jamais
dans le moteur — même traitement que `/villes/[slug]/sante`.
L'indicateur reste une **estimation** (département + taille de commune + statut hospitalier,
calibrée DREES / CNOM / zonage ARS), pas un relevé de cabinets : l'intro le dit avant de citer le
moindre rang, comme `mobilite-reduite` le fait pour l'accessibilité PMR. Deux enseignements portés
par la copie et vérifiés contre le moteur : les 22 villes de niveau « désert » comptent **toutes**
moins de 15 000 habitants et affichent **toutes** un m² sous le prix médian du site (le loyer bas
et l'effondrement de l'accès sont la même carte), et Paris, Marseille et Nice ont beau plafonner à
7,9/10 d'accès, elles sortent 57ᵉ, 163ᵉ et 100ᵉ sur le coût et la chaleur. Distinct de
`mobilite-reduite` (cardinal = transport PMR), `proches-aidants` (accompagne un tiers, cherche du
calme) et `asthmatiques-allergiques` (cardinal = qualité de l'air) ; pendant positif du red flag
`villes-desert-medical`, comme `cyclistes-urbains` l'est de `villes-anti-velo`.
Ajouté avant lui : **`navetteurs-hybrides`**
(actifs en hybride, 2-3 jours au bureau) — le seul profil du site où la *distance* à un bassin
d'emploi est le critère cardinal, là où « télétravailleurs salariés » l'ignore complètement (quand
on ne revient jamais, l'éloignement ne coûte rien) et où « sans voiture » et « cyclistes urbains »
mesurent la mobilité *à l'intérieur* d'une ville.
Nouveau composite `metroAccess` / `metroAccessCommute()` : trajet estimé vers le plus proche des
douze grands pôles d'emploi, barème 30 min = 10 → 150 min = 0. ⚠️ Trois écarts **volontaires** avec
`lib/city-commute`, qui surestime et qu'il ne faut pas « réaligner » :
① la branche rail directe n'est ouverte qu'aux villes ayant leur propre gare dans `TGV_STATIONS`
(sinon le modèle invente une ligne fermée : Saint-Girons sortait à 40 min de Toulouse) ;
② elle tourne à 140 km/h et non 220, la vitesse d'une LGV (Annecy sortait à 43 min de Grenoble, où
le train met près de 2 h) ; ③ la branche routière porte un plancher de 15 min d'approche urbaine
(sans lui : « Lyon en 2 min » depuis Villeurbanne). Corse et DROM valent **0** sur cet axe, et c'est
une mesure, pas une donnée manquante : il n'existe pas de navette hebdomadaire vers un pôle
métropolitain. En relief (Vosges, Cévennes, Alpes) le facteur de détour routier sous-estime encore
le trajet réel — l'intro le dit.
⚠️ `lib/profile-pages.ts` est importé **en valeur** par `app/people-like-you/PeopleLikeYouClient.tsx`
(client) : n'y importer aucune valeur de `CITIES_SEED`. C'est pour ça que les coordonnées des douze
pôles sont en dur et que le modèle de trajet est réimplémenté au lieu d'importer `lib/city-commute`,
qui charge le seed à l'initialisation.

