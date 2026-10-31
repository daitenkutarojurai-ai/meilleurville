# Content roadmap — guides (journal des séries et des batches)

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Contient les journaux des batches tourisme 1-60, palmarès, séries per-city.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


## Content roadmap — guides (`data/guides.ts`)

Current count: **1 384 guides FR / 1 202 EN** (`search-index`, 2026-10-28 ; +`trois-fois-le-loyer-revenu-requis-t2-villes-2026` (3 × T2 contre niveau de vie médian mensuel, 409 villes : barre médiane 2 400 € contre 1 804 €, 348 villes au-dessus, aucune des 42 villes ≥ 100 000 hab. ni des 153 franciliennes ne passe ; niveau de vie ≠ salaire, dit) et `louer-au-bord-de-la-mer-47-villes-loyers-facade-2026` (47 villes de métropole ≤ 10 km de la mer : T2 médian 800 € = celui du pays, PACA 950 € contre 610 € Manche/Nord ; 60+ ans 31,3 % contre 23,4 %) ; avant : +`loyer-studio-t3-ecart-villes-2026` (écart de loyer T1→T3, 413 villes ≥ 20 000 hab., médiane 500 €, rapport 1,77-2,33 donc quasi constant dans notre estimation, dit comme tel) et `se-loger-pas-cher-pres-d-un-chu-villes-2026` (T2 médian 900 € à ≤ 10 km d'un site CHU contre 620 € à > 30 km, distance à vol d'oiseau, liste coupée à 680 € pour ne pas couper un palier) ; avant : `acheter-appartement-moins-100000-euros-villes-2026` et sa jumelle `buying-an-apartment-under-100000-euros-france-2026`, data-led, 108 villes à 45 m² sous 100 000 € au prix médian DVF 2024-2025, 383 villes comparées). Guide spec: `slug, title, metaTitle, metaDesc, category, emoji, readMinutes, publishedAt, updatedAt, intro, sections[], relatedCities[], relatedGuides[], tags[]`. All copy in **French**, direct voice, data-led. No silent fake figures.

All planned series are complete (Climat 2040 ×15, Quitter X ×18, Comparaisons A vs B ×17, Région 2026 ×16, Télétravail 2026 ×11, Lifestyle ×14, Budget ×7, Famille ×4).

**10 choses à faire à [ville] series** — new `category: "tourisme"` (`GUIDE_CATEGORIES` entry: "À faire & voir 🎯"). Batch 1 (Paris/Lyon/Bordeaux/Toulouse/Marseille/Nice/Nantes/Rennes), Batch 2 (Strasbourg/Montpellier/Lille/Grenoble/Rouen/Dijon/Metz/Angers), Batch 3 (Reims/Aix-en-Provence/Brest/Clermont-Ferrand/Tours/Perpignan/Le Havre/Orléans), Batch 4 (Caen/Nancy/Amiens/Limoges/Besançon/Pau/Bayonne/Biarritz), Batch 5 (La Rochelle/Annecy/Chambéry/Toulon/Valence/Poitiers/Troyes/Colmar), Batch 6 (Nîmes/Avignon/Cannes/Saint-Malo/Vannes/Quimper/Dunkerque/Mulhouse), Batch 7 (Arles/Montauban/Albi/Tarbes/Niort/Angoulême/Saintes/Le Mans) shipped. Slug pattern: `10-choses-a-faire-a-[slug]-2026`. 56 guides total. Batch 8 (Lorient/Chartres/Blois/Auxerre/Belfort/Épinal/Roanne/Chalon-sur-Saône) shipped. 64 guides total. Batch 9 (Saint-Étienne/Fréjus/Arras/Lens/Calais/Boulogne-sur-Mer/Mâcon/Bourg-en-Bresse) shipped. 72 guides total. Batch 10 (Montluçon/Vichy/Clermont-l'Hérault*/Sète/Hyères/Draguignan/Laval/Cherbourg) shipped (*Clermont-l'Hérault initially skipped, ajouté en batch 11). 80 guides total. Batch 11 (Saint-Nazaire/Cholet/La-Roche-sur-Yon/Châtellerault/Cognac/Périgueux/Agen/Carcassonne/Clermont-l'Hérault) shipped. 89 guides total. Batch 12 (Aix-les-Bains/Évian-les-Bains/Manosque/Narbonne/Béziers/Castres/Millau/Rodez) shipped. 97 guides total. Batch 13 (Auch/Cahors/Mende/Privas/Aurillac/Le-Puy-en-Velay/Moulins/Bressuire) shipped. 105 guides total. Batch 14 (Bar-le-Duc/Chaumont/Guéret/Saint-Brieuc/Saint-Lô/Évreux/Beauvais/Laon) shipped. 113 guides total. Batch 15 (Charleville-Mézières/Saint-Dié-des-Vosges/Pontarlier/Saint-Omer/Châteauroux/Nevers/Vesoul/Lons-le-Saunier) shipped. 121 guides total. Batch 16 (Foix/Gap/Digne-les-Bains/Mont-de-Marsan/Tulle/Châlons-en-Champagne/Alençon/Bourges/Fontainebleau) shipped. 130 guides total. Batch 17 (Honfleur/Sarlat-la-Canéda/Ajaccio/Bastia/Cassis/Collioure/Saint-Tropez/Menton/Épernay/Provins) shipped — touristic gems. 140 guides total. Batch 18 (Lourdes/Beaune/Concarneau/Saint-Jean-de-Luz/Carnac/Gordes/Saint-Paul-de-Vence/Amboise/Saumur/Chantilly) shipped — pilgrimages, vins, mégalithes, châteaux Loire. 150 guides total. Batch 19 (Grasse/Antibes/Cagnes-sur-Mer/Saint-Raphaël/Chinon/Compiègne/Bayeux/Martigues/Calvi/Porto-Vecchio) shipped — Riviera française, Loire, Normandie, Corse. 160 guides total. Batch 20 (Arcachon/Royan/Libourne/Dinan/Pézenas/Vienne/Riom/Sisteron/Apt/Annonay/Montbéliard) shipped — Atlantique, vignobles, Provence, Auvergne, Franche-Comté. 171 guides total. Batch 21 (Aubagne/Anglet/Autun/Bagnères-de-Bigorre) shipped 2026-07-29 — pays de Pagnol, côte basque surf, Augustodunum romain, Pyrénées thermales. 173 guides total (compteur mesuré `grep 'slug: "10-choses-a-faire-a-.*-2026"'` = 173 ; le fil cumulatif ci-dessus s'écarte de 2 sans que j'aie retrouvé où — le réel prévaut). **Batch 22 (Saint-Denis de La Réunion/Saint-Paul/Saint-Pierre/Fort-de-France/Pointe-à-Pitre/Cayenne) shipped 2026-07-30 — premier batch outre-mer : la série était 100 % métropolitaine alors que 18 villes DROM sont dans le seed et qu'aucune n'avait de guide tourisme. Compteur mesuré = 179.** Villes DROM encore non couvertes, par population : Le Tampon, Mamoudzou, Saint-André, Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault, Le Robert, Le François. Écart FR→EN après ce batch : 10 villes (anglet, aubagne, autun, bagneres-de-bigorre + les 6 DROM) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**.

**Batch 23 — EN, rattrapage de parité, shipped 2026-08-01.** Les 10 jumelles `things-to-do-in-[slug]-2026` manquantes écrites d'un coup (Anglet, Aubagne, Autun, Bagnères-de-Bigorre + les 6 villes DROM du batch 22) dans `data/guides-en.ts`. **Compteurs mesurés : FR 179, EN 180 — écart nul, parité rétablie.** L'EN dépasse d'une unité parce que `things-to-do-in-le-puy-en-velay-2026` existe côté anglais alors que le FR utilise `10-choses-a-faire-**au**-puy-en-velay-2026` (« au Puy », pas « à Le Puy ») : ce n'est pas un trou, c'est le seul slug de la série qui ne suit pas le gabarit `-a-[slug]-`. Ne pas « corriger » le FR, et ne pas compter Le Puy comme manquant au prochain diff — le diff naïf `comm` sur les deux listes de slugs le remonte à chaque run.
Premiers guides EN sur l'outre-mer : nouveaux tags `reunion` / `martinique` / `guadeloupe` / `french guiana`, qui créent autant de pages `/tags/[slug]` côté EN. Rédigés en anglais natif depuis les faits des sources FR (pas de traduction), avec la contrainte de sécurité explicitée pour La Réunion : hors lagon et hors enclos surveillés, la baignade est interdite — un lecteur anglophone ne le devine pas.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Villes DROM encore non couvertes des deux côtés, par population : Le Tampon, Mamoudzou, Saint-André, Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 24 — FR, shipped 2026-08-04 : Versailles, Saint-Denis (93), Roubaix, Tourcoing, Boulogne-Billancourt, Villeurbanne, Le Tampon.** Premier batch sur les **grandes communes non-préfectures et les banlieues**, qui étaient le vrai trou de la série : les 10 villes non couvertes les plus peuplées étaient toutes des communes d'Île-de-France, du Nord ou de la métropole de Lyon, et **Versailles — la ville la plus visitée de France après Paris — n'avait aucun guide** parce que la série avait été construite par préfectures et par jolies petites villes. Chacune de ces villes a de la matière réelle et non touristique : nécropole royale et chantier de la flèche à Saint-Denis, La Piscine et la villa Cavrois côté Roubaix, Le Fresnoy et le bunker du message Verlaine à Tourcoing, Albert-Kahn et l'île Seguin à Boulogne, les Gratte-Ciel de 1934 et le TNP à Villeurbanne, le Piton de la Fournaise depuis Le Tampon.
**Compteurs mesurés : `-a-` strict = 185, en incluant `au-` = 187 ; EN = 180.** ⚠️ Le Tampon a le **deuxième slug de la série à échapper au gabarit `-a-[slug]-`** après Le Puy : `10-choses-a-faire-**au**-tampon-2026` (« au Tampon », pas « à Le Tampon »). Le grep historique `grep -c 'slug: "10-choses-a-faire-a-.*-2026"'` **en rate désormais deux** — utiliser `grep -c 'slug: "10-choses-a-faire-a[u]*-.*-2026"'` pour le compte réel. Ne pas « corriger » ces deux slugs, et ne pas les compter comme des trous EN au prochain diff.
Écart FR→EN après ce batch : **7 villes** (versailles, saint-denis 93, roubaix, tourcoing, boulogne-billancourt, villeurbanne, le-tampon) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**. Attention au nommage anglais : `things-to-do-in-saint-denis-2026` doit viser le 93 et se distinguer de `things-to-do-in-saint-denis-reunion-2026`, qui existe déjà.

**Batch 25 — EN, rattrapage de parité, shipped 2026-08-05.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 24 écrites d'un coup dans `data/guides-en.ts`
(Versailles, Saint-Denis 93, Roubaix, Tourcoing, Boulogne-Billancourt, Villeurbanne,
Le Tampon). **Compteurs mesurés : FR 187, EN 187 — écart nul dans les deux sens, parité
rétablie** (`EN_GUIDES` 541 → 548). Le piège de nommage annoncé ci-dessus est tranché :
`things-to-do-in-saint-denis-2026` (93) et `things-to-do-in-saint-denis-reunion-2026`
coexistent, chacune résolue par `getEnGuide('things-to-do-in-' + slug + '-2026')` depuis
le slug de seed correspondant, et l'intro du guide 93 signale l'homonymie dès la première
ligne.
⚠️ **Le diff naïf remonte désormais deux faux trous, pas un.** Aux deux slugs FR hors
gabarit (`au-puy-en-velay`, `au-tampon`) répondent des slugs EN en `le-` :
`things-to-do-in-le-puy-en-velay-2026` et `things-to-do-in-le-tampon-2026`. Le contrôle
de parité doit mapper `puy-en-velay` → `le-puy-en-velay` et `tampon` → `le-tampon` avant
de comparer ; sans ça il annonce deux manques de chaque côté à chaque run. Ne pas
« corriger » ces slugs.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` ≤ 60 caractères sur les 7 — plus serré que le reste de la série, qui montait
à 74 et se faisait tronquer en SERP — et `metaDesc` ≤ 160. Aucun tag nouveau : les tags
de région réutilisent `ile-de-france`, `hauts-de-france`, `auvergne-rhone-alpes`,
`reunion`. **Prochain run : batch FR** (l'écart est nul, la série FR reprend la main).
Villes DROM encore non couvertes des deux côtés, par population : Mamoudzou, Saint-André,
Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph,
Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 26 — FR, shipped 2026-08-06 : Saint-Ouen-sur-Seine, Vitry-sur-Seine, Montreuil,
Argenteuil, Neuilly-sur-Seine, Pantin, Meaux.** Deuxième batch sur les communes de la
petite couronne, dans la continuité du batch 24, mais sélectionnées **par matière
touristique réelle plutôt que par population** — c'est la correction de méthode du run.
Les dix communes non couvertes les plus peuplées sont toutes des banlieues d'Île-de-France
et plusieurs n'ont honnêtement pas dix choses à faire ; à l'inverse Saint-Ouen porte le
**plus grand marché d'antiquités au monde** et n'avait aucun guide, et Meaux (une demi-heure
de la gare de l'Est) aligne cité épiscopale complète, plus grande collection européenne
sur 1914-1918 et une AOP fromagère. Les angles retenus : les Puces et l'écoquartier des
Docks à Saint-Ouen, le MAC VAL et les pochoirs de C215 à Vitry, les murs à pêches et
Méliès à Montreuil, les emplacements de Monet et la Sainte Tunique à Argenteuil, l'île de
la Grande Jatte de Seurat et l'axe historique à Neuilly, les Grands Moulins et le CND de
Kalisz à Pantin.
**Compteurs mesurés : `-a-` strict = 192, en incluant `au-` = 194 ; EN = 187 ; `GUIDES`
909 → 916.** Aucun nouveau slug hors gabarit : les deux exceptions restent `au-puy-en-velay`
et `au-tampon`.
`metaTitle` ≤ 60 caractères sur les 7 (48-55), `metaDesc` ≤ 160, densité d'accents 0,15 —
très au-dessus du seuil de détection ascii-strip (0,09). Aucun horaire, tarif ni hauteur
n'est cité : sur des équipements franciliens qui ouvrent et ferment vite, une phrase sans
chiffre a été préférée à un chiffre invérifiable. Deux points de prudence assumés dans la
copie : le marché aux puces de la porte de Montreuil est annoncé comme susceptible d'être
déplacé par le réaménagement de la porte, et le Jardin d'acclimatation, la Fondation Louis
Vuitton et Bagatelle sont présentés comme **accessibles depuis** Neuilly, pas comme situés
à Neuilly — ils relèvent de Paris 16ᵉ, et l'inverse serait faux.
⚠️ Ne pas repartir de la liste brute des communes les plus peuplées non couvertes pour le
prochain batch FR : le haut de cette liste (Nanterre, Créteil, Colombes, Aubervilliers,
Vitry déjà fait, Courbevoie, Drancy…) est majoritairement pauvre en matière touristique
vérifiable. Les gisements qui restent sont **Cergy** (Axe majeur de Dani Karavan),
**Issy-les-Moulineaux** (île Saint-Germain, tour aux figures de Dubuffet), **Aubervilliers**
(19M, Docks), **Mérignac**, **Pessac** (Cité Frugès de Le Corbusier, UNESCO) et
**Vénissieux** — puis les DROM restants.
Écart FR→EN après ce batch : **7 villes** (saint-ouen-sur-seine, vitry-sur-seine, montreuil,
argenteuil, neuilly-sur-seine, pantin, meaux) — au-dessus du seuil de ~6, donc **le prochain
run doit être un batch EN**. Attention au nommage anglais : `things-to-do-in-saint-ouen-2026`
côtoiera `things-to-do-in-saint-denis-2026` (93) et `things-to-do-in-saint-denis-reunion-2026`
déjà présents — garder le suffixe `-sur-seine` pour Saint-Ouen, Vitry et Neuilly évite toute
ambiguïté avec les homonymes français.

**Batch 27 — EN, rattrapage de parité, shipped 2026-08-08.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 26 écrites d'un coup dans `data/guides-en.ts`
(Saint-Ouen-sur-Seine, Vitry-sur-Seine, Montreuil, Argenteuil, Neuilly-sur-Seine, Pantin,
Meaux). **Compteurs mesurés : FR 194 (`-a-` strict 192 + les 2 slugs en `au-`), EN 194 —
écart nul, parité rétablie** (`EN_GUIDES` 548 → 555). Le conseil de nommage du batch 26 a été
suivi : les slugs gardent `-sur-seine` sur Saint-Ouen, Vitry et Neuilly, donc aucune collision
avec `things-to-do-in-saint-denis-2026` (93) ni `things-to-do-in-saint-denis-reunion-2026`.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` 39-51 caractères, `metaDesc` 138-154, 8 sections par guide (la série FR en compte
10, la version EN fusionne les fins de liste — marchés + accès — comme les batches EN
précédents). Deux prudences reprises telles quelles du FR, à ne pas diluer : le marché aux
puces de la porte de Montreuil est annoncé comme susceptible d'être déplacé par le
réaménagement de la porte, et le Jardin d'acclimatation, la Fondation Louis Vuitton et
Bagatelle sont **accessibles depuis** Neuilly sans y être situés. Trois ajouts propres à
l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur français : la version
originale sous-titrée du Méliès, la règle d'import du lait cru pour le brie de Meaux, et le
rappel que les Puces ferment le mardi placé dès le premier paragraphe de section.
Aucun tag nouveau : les 7 réutilisent `ile-de-france`. `npm run search-index` relancé
(`data/search-index.en.json` 555 guides) — sans ça `search-index:check` échoue.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Reprendre la liste
de gisements du batch 26 (Cergy, Issy-les-Moulineaux, Aubervilliers, Mérignac, Pessac,
Vénissieux) plutôt que la liste brute des communes les plus peuplées. Villes DROM encore non
couvertes des deux côtés, par population : Mamoudzou, Saint-André, Les Abymes, Saint-Louis
(974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault,
Le Robert, Le François.

**Batch 28 — FR, shipped 2026-08-11 : Cergy, Issy-les-Moulineaux, Aubervilliers, Mérignac,
Pessac, Vénissieux.** La liste de gisements laissée par les batches 26 et 27 a été honorée telle
quelle et est désormais **épuisée** — elle ne peut plus servir de point de départ au prochain
batch FR. Trois banlieues franciliennes et trois communes de métropole régionale (deux
bordelaises, une lyonnaise), c'est-à-dire le premier batch de la série qui sort d'Île-de-France
pour les grandes banlieues : Bordeaux Métropole et la Métropole de Lyon avaient exactement le
même trou que la petite couronne avant le batch 24. Angles retenus : l'Axe majeur de Dani Karavan
et le téléski nautique à Cergy, la Tour aux figures de Dubuffet et le seul musée de France
consacré à la carte à jouer à Issy, la Galerie du 19M et la Maladrerie de Renée Gailhoustet à
Aubervilliers, le parc de Bourran et le vignoble urbain Luchey-Halde à Mérignac, la cité Frugès
de Le Corbusier (UNESCO) et Pessac-Léognan à Pessac, le parc de Parilly et la mémoire de la
Marche de 1983 à Vénissieux.
**Compteurs mesurés : FR 200 (`-a-` strict 198 + les 2 slugs en `au-`), EN 194 ; `GUIDES` 933 →
939.** Aucun nouveau slug hors gabarit : les deux exceptions restent `au-puy-en-velay` et
`au-tampon`. `metaTitle` 44-53 caractères, `metaDesc` 140-153, 10 sections par guide, densité
d'accents 0,141-0,175 (seuil de détection ascii-strip : 0,09). `npm run search-index` relancé
(`data/search-index.json` 939 guides) — le FR a le même piège que l'EN, `search-index:check`
échoue sinon.
⚠️ **Trois faits ont été corrigés en cours de rédaction par vérification en ligne, et se seraient
lus comme des mesures s'ils étaient partis en l'état** : l'**Espace Albert Camus est à Bron**, pas
à Vénissieux (attribution classique, la salle dessert l'est lyonnais) ; il n'existe **pas de fort
de Vénissieux** — le fort de la ceinture lyonnaise voisine est le **fort de Bron** ; et la Marche
pour l'égalité de 1983 est **née aux Minguettes mais partie de Marseille** le 15 octobre, pas
partie de Vénissieux. La nuance origine / départ est le genre d'erreur qu'aucun contrôle
automatique n'attrape. Deux prudences assumées dans la copie, à ne pas diluer : la collection du
**CAEA à Mérignac est sur la base aérienne 106**, donc en zone militaire à accès restreint — elle
est présentée comme telle et non comme un musée ouvert le dimanche ; et la **villa des Brillants**
(second site du musée Rodin) est **accessible depuis** Issy sans y être située, elle relève de
Meudon — même traitement que le Jardin d'acclimatation au batch 26. Sur Vénissieux, les Minguettes
sont décrites en quartier habité et en histoire urbaine, sans verdict de sécurité ni jugement sur
les habitants (cf. la décision d'écarter `quartiers-a-eviter`).
Écart FR→EN après ce batch : **6 villes** (cergy, issy-les-moulineaux, aubervilliers, merignac,
pessac, venissieux) — au seuil de ~6, donc **le prochain run doit être un batch EN**. Attention au
nommage anglais : `things-to-do-in-pessac-2026` et `things-to-do-in-merignac-2026` cohabiteront
avec `things-to-do-in-bordeaux-2026` (les trois communes sont limitrophes et les guides se citent
mutuellement) ; garder `-les-moulineaux` sur Issy. Pour le batch FR **suivant**, la liste de
gisements est à reconstituer : les communes non couvertes les plus peuplées restent pauvres en
matière vérifiable, les pistes ouvertes sont plutôt les grandes banlieues de province (Villenave-d'Ornon,
Talence, Le Bouscat côté Bordeaux ; Vaulx-en-Velin, Saint-Priest, Bron côté Lyon) et les DROM
restants : Mamoudzou, Saint-André, Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni,
Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 29 — EN, rattrapage de parité, shipped 2026-08-12.** Les 6 jumelles
`things-to-do-in-[slug]-2026` du batch 28 écrites d'un coup dans `data/guides-en.ts`
(Cergy, Issy-les-Moulineaux, Aubervilliers, Mérignac, Pessac, Vénissieux). **Compteurs
mesurés : FR 200 (`-a-` strict 198 + les 2 slugs en `au-`), EN 200 — écart nul, parité
rétablie** (`EN_GUIDES` 598 → 604). Le conseil de nommage du batch 28 a été suivi :
`things-to-do-in-pessac-2026` et `things-to-do-in-merignac-2026` cohabitent avec
`things-to-do-in-bordeaux-2026`, et Issy garde `-les-moulineaux`. Aucun tag nouveau — les 6
réutilisent `ile-de-france`, `nouvelle-aquitaine`, `auvergne-rhone-alpes`.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` 42-52 caractères, `metaDesc` 136-158, 8 sections par guide (la série FR en compte
10, la version EN fusionne les fins de liste comme les batches EN précédents). Les quatre
prudences du FR sont reprises telles quelles, à ne pas diluer : **CAEA sur la base aérienne
106** (zone militaire, accès restreint), **villa des Brillants accessible depuis Issy sans y
être située** (elle relève de Meudon), **cité Frugès = quartier habité** parcouru depuis la
rue, et sur Vénissieux la Marche de 1983 **née aux Minguettes mais partie de Marseille** le
15 octobre, Minguettes décrites sans verdict de sécurité, **fort de Bron** et non de
Vénissieux. `npm run search-index` relancé (`data/search-index.en.json` 604 guides).
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). La liste de
gisements du batch 26-27 étant épuisée, reprendre les pistes laissées par le batch 28 :
grandes banlieues de province (Villenave-d'Ornon, Talence, Le Bouscat côté Bordeaux ;
Vaulx-en-Velin, Saint-Priest, Bron côté Lyon) et les DROM restants — Mamoudzou, Saint-André,
Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph,
Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 30 — FR, shipped 2026-08-13 : Saint-Laurent-du-Maroni, Mamoudzou, Le François,
Le Robert, Saint-Benoît (974), Saint-André (974), Les Abymes.** Deuxième batch outre-mer après
le 22, et le premier à couvrir **les cinq territoires DROM d'un coup** — la Guyane de l'Ouest,
Mayotte (qui n'avait **aucun** guide de la série alors que Mamoudzou est dans le seed depuis le
début), deux communes de la côte atlantique martiniquaise, deux de la côte au vent réunionnaise
et la commune la plus peuplée de Guadeloupe. Le choix est assumé contre les banlieues de province
laissées en piste par le batch 28 (Villenave-d'Ornon, Talence, Le Bouscat, Vaulx-en-Velin,
Saint-Priest, Bron) : à matière vérifiable comparée, ces sept-là en ont nettement plus, et le trou
DROM traînait depuis le batch 22. Angles retenus : le camp de la Transportation et les pirogues du
Maroni à Saint-Laurent, le lagon à double barrière et les baleines à bosse à Mamoudzou, les fonds
blancs et l'Habitation Clément au François, l'îlet Chancel et ses iguanes au Robert, Takamaka et
le Grand Étang à Saint-Benoît, le temple du Colosse et le Dipavali à Saint-André, la mangrove de
Taonaba et les Grands-Fonds aux Abymes.
⚠️ **Trois nouveaux slugs hors gabarit, dont le premier en `aux-`** : `10-choses-a-faire-**au**-francois-2026`,
`10-choses-a-faire-**au**-robert-2026` et `10-choses-a-faire-**aux**-abymes-2026` (« au François »,
« au Robert », « aux Abymes » — même raison grammaticale que `au-puy-en-velay` et `au-tampon`).
Le grep du batch 24 `'10-choses-a-faire-a[u]*-.*-2026'` **en rate désormais un** : le compte réel
se prend avec **`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`**. Ne pas « corriger » ces
cinq slugs, et ne pas les compter comme des trous EN au prochain diff — la table de correspondance
à appliquer avant tout `comm` est désormais : `puy-en-velay`→`le-puy-en-velay`,
`tampon`→`le-tampon`, `francois`→`le-francois`, `robert`→`le-robert`, `abymes`→`les-abymes`.
**Compteurs mesurés : FR 207 (`-a-` strict 202 + 4 en `au-` + 1 en `aux-`), EN 200 ; `GUIDES`
939 → 946.** `metaTitle` 44-48 caractères, `metaDesc` 141-156, 10 sections par guide, densité
d'accents 0,149-0,175 (seuil de détection ascii-strip : 0,09 ; les guides déjà livrés de la série
sont à 0,153-0,181). `npm run search-index` relancé (`data/search-index.json` 946 guides).
⚠️ **Le guide Mamoudzou porte une contrainte que les six autres n'ont pas, à ne pas diluer** : le
cyclone **Chido de décembre 2024** a détruit ou endommagé une part considérable des infrastructures
mahoraises, dont plus des deux tiers de l'offre touristique selon les bilans dressés après coup, et
la reconstruction courait toujours en 2026. L'intro le dit **avant** la première phrase sur le lagon,
et la section pratique renvoie aux sources officielles, à la tension sur la ressource en eau et au
fait que prestataires et hébergements se reconstituaient — présenter Mayotte comme une destination
balnéaire clé en main aurait été faux et potentiellement dangereux pour un lecteur. Quatre autres
prudences assumées : la baignade en mer **interdite hors lagon de la côte ouest et hors bassins
surveillés** à La Réunion (risque requin) est rappelée dans les deux guides réunionnais, **et il n'y
a pas de lagon dans l'est** ; la **baignade est interdite au bassin La Paix** (courants, profondeur)
alors qu'elle est autorisée au bassin La Mer en amont ; la **baignoire de Joséphine** est donnée
comme **tradition orale et non comme fait établi** ; et le raz-de-marée du **cyclone Jenny en 1962**
est la cause documentée de la ruine de l'église de Champ-Borne. Suivant la convention des batches 26
et 28, tout ce qui relève d'une commune voisine est écrit « **accessible depuis** » et non « situé
à » : mont Choungui (Chirongui) depuis Mamoudzou, presqu'île de la Caravelle (La Trinité) depuis
Le Robert, Anse des Cascades et Notre-Dame-des-Laves (Sainte-Rose) depuis Saint-Benoît, cascade
Niagara (Sainte-Suzanne) et vanille (Bras-Panon) depuis Saint-André, Mémorial ACTe (Pointe-à-Pitre)
et cimetière en damier (Morne-à-l'Eau) depuis Les Abymes, Awala-Yalimapo et Javouhey depuis
Saint-Laurent. Aucun horaire, tarif ni hauteur n'est cité : sur des sites ultramarins à petites
équipes et à ouverture mouvante, la copie renvoie à l'office de tourisme.
Écart FR→EN après ce batch : **7 villes** (saint-laurent-du-maroni, mamoudzou, le-francois,
le-robert, saint-benoit-reunion, saint-andre-reunion, les-abymes) — au-dessus du seuil de ~6, donc
**le prochain run doit être un batch EN**. Nommage anglais à surveiller : `things-to-do-in-le-francois-2026`,
`things-to-do-in-le-robert-2026` et `things-to-do-in-les-abymes-2026` (garder l'article, comme
`things-to-do-in-le-tampon-2026`), et **`things-to-do-in-saint-andre-2026` doit être désambiguïsé**
— `saint-andre-reunion` est le slug de seed, et l'EN porte déjà `things-to-do-in-saint-denis-2026`
(93) face à `things-to-do-in-saint-denis-reunion-2026`, donc appliquer le même traitement.
Pour le batch FR **suivant**, restent 4 villes DROM non couvertes des deux côtés : Le Lamentin (972),
Baie-Mahault (971), Saint-Louis (974), Saint-Joseph (974) — trop peu pour un batch entier et les
trois premières sont pauvres en matière touristique vérifiable ; les compléter avec les banlieues de
province laissées par le batch 28.

**Batch 31 — EN, rattrapage de parité, shipped 2026-08-15.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 30 écrites d'un coup dans `data/guides-en.ts`
(Saint-Laurent-du-Maroni, Mamoudzou, Le François, Le Robert, Saint-Benoît 974, Saint-André 974,
Les Abymes). **Compteurs mesurés : FR 207 (`-a-` strict 202 + 4 en `au-` + 1 en `aux-`), EN 207 —
écart nul, parité rétablie** (`EN_GUIDES` 628 → 635). C'est le batch qui **achève la couverture EN
de l'outre-mer** : les cinq territoires DROM ont désormais autant de guides tourisme d'un côté que
de l'autre, et **Mayotte entre dans le corpus anglais** (le tag `mayotte` est le seul tag nouveau,
il crée `/tags/mayotte` côté EN — les six autres réutilisent `reunion`, `martinique`, `guadeloupe`,
`french guiana`). Le nommage annoncé par le batch 30 a été suivi : article conservé sur
`things-to-do-in-le-francois-2026`, `-le-robert-2026` et `-les-abymes-2026` (comme
`things-to-do-in-le-tampon-2026`), et **`things-to-do-in-saint-andre-reunion-2026` est désambiguïsé**
au même titre que `saint-benoit-reunion`, sur le modèle `saint-denis-2026` (93) vs
`saint-denis-reunion-2026`.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit), `metaTitle`
41-46 caractères, `metaDesc` 150-157, 8 sections par guide (la série FR en compte 10, la version EN
fusionne les fins de liste comme les batches EN précédents). `npm run search-index` relancé
(`data/search-index.en.json` 635 guides, 83 tags) et `npm run sitemap:check` repassé à cause du tag
neuf — 28 495 URL EN, chaque URL déclarée a une page.
⚠️ **La contrainte Mamoudzou du batch 30 est reprise telle quelle et ne doit pas être diluée** : le
cyclone **Chido de décembre 2024** et la reconstruction toujours en cours en 2026 sont dits dans
l'intro **avant** la première phrase sur le lagon, et la section pratique répète que rien ne se
réserve la veille, que la ressource en eau reste sous tension et qu'il faut vérifier la situation
auprès des sources officielles. Les autres prudences du FR sont conservées : baignade en mer
**interdite hors lagon de la côte ouest et hors bassins surveillés** à La Réunion, **rappelée dans
les deux guides réunionnais avec la précision qu'il n'y a pas de lagon dans l'est** ; **baignade
interdite au bassin La Paix**, autorisée au bassin La Mer en amont ; **baignoire de Joséphine**
donnée comme tradition orale et non comme fait établi ; **cyclone Jenny 1962** comme cause de la
ruine de l'église de Champ-Borne. Et la convention « **accessible depuis** » plutôt que « situé à »
tient sur les sites de communes voisines : mont Choungui, presqu'île de la Caravelle, Anse des
Cascades et Notre-Dame-des-Laves, cascade Niagara et vanille de Bras-Panon, Mémorial ACTe et
cimetière de Morne-à-l'Eau, Awala-Yalimapo et Javouhey.
Trois ajouts propres à l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur
français : le fait que le français n'est pas toujours la langue du marché de Mamoudzou (shimaoré et
kibushi), le rappel qu'un aller-retour à Albina est un **franchissement de frontière
internationale** dont les formalités se règlent avant d'embarquer et non sur le quai, et la mise en
garde qu'un opérateur proposant de nager au milieu d'un groupe de baleines vous met **en
infraction**.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Restent 4 villes DROM
non couvertes des deux côtés — Le Lamentin (972), Baie-Mahault (971), Saint-Joseph (974) et
Saint-Louis (974), **dont Saint-Louis n'est pas dans `CITIES_SEED`** (vérifié ce run : le slug
`saint-louis-reunion` n'existe pas, donc la ville ne peut pas avoir de guide tant qu'elle n'est pas
au seed) : cela ne fait que 3 candidats réels, trop peu pour un batch. Les compléter avec les
banlieues de province laissées par le batch 28, toutes vérifiées présentes au seed et sans guide :
**Villenave-d'Ornon, Talence, Le Bouscat** (Bordeaux Métropole) et **Vaulx-en-Velin, Saint-Priest,
Bron** (Métropole de Lyon). Rappel utile pour Bron : le batch 28 a établi que **l'Espace Albert
Camus et le fort de la ceinture lyonnaise sont à Bron**, pas à Vénissieux — le guide Bron doit les
reprendre, et le guide Vénissieux ne doit pas être « corrigé » en sens inverse.

**Batch 32 — FR, shipped 2026-08-18 : Le Lamentin (972), Baie-Mahault (971), Saint-Louis (974),
Saint-Joseph (974), Les Sables-d'Olonne, Vincennes.** Ce batch **clôt la couverture outre-mer côté
FR : les 18 villes DROM du seed ont désormais leur guide tourisme**, et il corrige au passage une
erreur de vérification du batch 31.
⚠️ **Saint-Louis (Réunion) EST dans `CITIES_SEED`** — sous le slug **`saint-louis-reunion-974`**, pas
`saint-louis-reunion`. Le batch 31 avait cherché le second, ne l'avait pas trouvé et en avait conclu
que la ville était absente du seed : elle ne l'a jamais été. Leçon générale, la même qu'ailleurs dans
ce fichier : **une absence se constate en listant, pas en testant un slug deviné** (`CITIES_SEED.find`
sur une liste imprimée, pas un `grep` sur une intuition).
Les deux villes métropolitaines sont un **écart assumé avec la liste de gisements laissée par le
batch 28** (Villenave-d'Ornon, Talence, Le Bouscat, Vaulx-en-Velin, Saint-Priest, Bron), au nom de la
correction de méthode du batch 26 : on choisit par **matière touristique réelle**, pas par inertie de
liste. Les Sables-d'Olonne — port de départ du Vendée Globe, station balnéaire de référence de la
Vendée — et Vincennes — seule résidence royale médiévale conservée d'Île-de-France, au terminus de la
ligne 1 — étaient les deux plus gros trous du corpus, très au-dessus de trois banlieues bordelaises.
Ces six-là restent en piste pour un batch FR ultérieur.
**Compteurs mesurés : FR 213 (`-a-` strict 206 + 5 en `au-` + 2 en `aux-`), EN 207 ; `GUIDES` 967 →
973.** `metaTitle` 37-50 caractères, `metaDesc` 143-159, 10 sections par guide, densité d'accents
0,139-0,174 (seuil de détection ascii-strip : 0,09). `npm run search-index` relancé
(`data/search-index.json` 973 guides, 241 tags) et **`npm run sitemap:check` repassé** — le tag
`que faire en Guadeloupe` a franchi le seuil des 3 guides et crée `/tags/que-faire-en-guadeloupe`.
⚠️ **Deux nouveaux slugs hors gabarit** : `10-choses-a-faire-**au**-lamentin-2026` et
`10-choses-a-faire-**aux**-sables-d-olonne-2026`. Le compte réel se prend toujours avec
**`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`**, et la table de correspondance à appliquer
avant tout `comm` s'allonge : `puy-en-velay`→`le-puy-en-velay`, `tampon`→`le-tampon`,
`francois`→`le-francois`, `robert`→`le-robert`, `abymes`→`les-abymes`, `lamentin`→`le-lamentin`,
`sables-d-olonne`→`les-sables-d-olonne`.
⚠️ **Ces slugs à article rendaient leur propre guide invisible sur la page de la ville — corrigé ce
run.** `app/villes/[slug]/a-faire/page.tsx` ne cherchait que `10-choses-a-faire-a-${slug}-2026`, et
`guideCityPhoto()` (`lib/city-images.ts`) n'acceptait le rapprochement que sur le slug de seed entier :
les **7** guides concernés n'avaient donc ni carte « guide en vedette » ni photo d'en-tête, en silence,
depuis le batch 22. Les deux sites tentent désormais les formes contractées `au-`/`aux-` sur le slug
privé de son article. L'élision **exige la présence de l'article contracté** dans le slug du guide
(`-au-<stem>-` / `-aux-<stem>-`) et non le seul radical : rapprocher sur `-rochelle-` ou `-havre-`
ouvrirait la porte aux faux positifs que le commentaire de `guideCityPhoto` interdit depuis l'origine.
Six faits ont été **vérifiés en ligne avant rédaction** et portent les guides : l'église
Saint-Jean-Baptiste de Baie-Mahault est une **Ali Tur** de 1931 en béton armé, **classée MH en 2017**,
reconstruite après le cyclone de 1928 ; le **temple du Gol** de Saint-Louis est le **plus ancien temple
hindou de La Réunion**, élevé en 1856 par des engagés indiens, **inscrit MH en 1996** ; l'**église
Saint-Louis de Vincennes** (1914-1924, Droz et Marrast, béton armé, **classée MH en 1996**) porte des
fresques de Maurice Denis ; le **MASC** des Sables conserve les plus grandes collections publiques
**Chaissac** et **Brauner** ; le **gecko vert de Manapany** (*Phelsuma inexpectata*) est endémique du
seul littoral sud de La Réunion et en danger critique ; et **La Favorite**, fondée en 1842 et toujours
mue à la vapeur, a bien une **adresse au Lamentin** tout en étant à la limite de Fort-de-France.
Trois prudences assumées dans la copie, à ne pas diluer : ① **le bois de Vincennes n'est pas à
Vincennes** — il appartient à la Ville de Paris et relève du 12ᵉ arrondissement, donc Parc floral,
zoo, hippodrome, arboretum et Cartoucherie sont écrits « **accessibles depuis** », même traitement que
le Jardin d'acclimatation au batch 26 ; la section 7 le dit explicitement plutôt que de laisser le
lecteur le croire ; ② la règle réunionnaise est répétée dans les deux guides 974 avec sa précision
géographique — **pas de lagon devant Saint-Louis, pas de lagon dans le sud** — et les arrêtés de
baignade de la rivière Langevin sont donnés comme **variables et affichés sur place**, jamais résumés
en « c'est autorisé » ; ③ le **chlordécone** est nommé dans le guide Lamentin comme un fait
documenté de la plaine agricole, sans chiffre et sans verdict. Aucun horaire, tarif ni hauteur n'est
cité, à la seule exception des ~52 m du donjon de Vincennes et des ~995 ha du bois, qui sont des
constantes publiées.
Écart FR→EN après ce batch : **6 villes** (le-lamentin, baie-mahault, saint-louis-reunion-974,
saint-joseph-reunion, les-sables-d-olonne, vincennes) — au seuil de ~6, donc **le prochain run doit
être un batch EN**. Nommage anglais à surveiller : garder l'article sur
`things-to-do-in-le-lamentin-2026` et `things-to-do-in-les-sables-d-olonne-2026` (comme
`things-to-do-in-le-tampon-2026`), et **désambiguïser les deux 974** —
`things-to-do-in-saint-louis-reunion-2026` et `things-to-do-in-saint-joseph-reunion-2026`, sur le
modèle déjà en place de `saint-denis-reunion` / `saint-andre-reunion` / `saint-benoit-reunion`.
Attention : le seed écrit `saint-louis-reunion-**974**`, mais le suffixe numérique n'a pas à passer
côté EN, où aucun autre slug ne le porte.
Pour le batch FR **suivant**, l'outre-mer est épuisé : reprendre les six banlieues de province laissées
intactes ici (Villenave-d'Ornon, Talence, Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron — rappel du
batch 28 : **l'Espace Albert Camus et le fort de la ceinture lyonnaise sont à Bron**, pas à Vénissieux)
ou continuer sur les trous touristiques réels du corpus, dont les plus nets après ce batch sont
**Salon-de-Provence** (château de l'Empéri, Nostradamus), **Saint-Quentin** (Art déco, pastels de
Quentin de La Tour), **Brive-la-Gaillarde**, **La Seyne-sur-Mer** et **Saint-Herblain**.

**Batch 33 — EN, rattrapage de parité, shipped 2026-08-20.** Les 6 jumelles
`things-to-do-in-[slug]-2026` du batch 32 écrites d'un coup dans `data/guides-en.ts` (Le Lamentin,
Baie-Mahault, Saint-Louis 974, Saint-Joseph 974, Les Sables-d'Olonne, Vincennes). **Compteurs
mesurés : FR 213, EN 213 — écart nul, parité rétablie** (`EN_GUIDES` 701 → 707).
⚠️ **Le conseil de nommage du batch 32 sur le suffixe `-974` a été écarté, et il faut savoir
pourquoi.** Il annonçait que « le suffixe numérique n'a pas à passer côté EN ». C'est vrai du style
et faux du fonctionnement : `app/[locale]/cities/[slug]/things-to-do/page.tsx` résout son guide par
`getEnGuide('things-to-do-in-' + slug + '-2026')` **sur le slug de seed**, donc
`things-to-do-in-saint-louis-reunion-2026` serait resté invisible sur la page de Saint-Louis — le
défaut même que le batch 32 venait de corriger côté FR pour les slugs à article. Le slug livré est
**`things-to-do-in-saint-louis-reunion-974-2026`**. **Règle générale : côté EN, le slug d'un guide
de série se dérive du slug de seed tel quel, jamais d'une version « propre » de celui-ci** ; le
rapprochement photo (`guideCityPhoto`) suit la même clé. Les 6 guides ont été vérifiés retrouvés
par le lookup **et** pourvus de leur photo d'en-tête après écriture.
Écrit en anglais natif depuis les faits des guides FR, `metaTitle` 42-47 caractères, `metaDesc`
147-154, 8 sections par guide (la série FR en compte 10, l'EN fusionne les fins de liste). Aucune
figure en `/10`, aucun horaire, aucun tarif. Les prudences du FR sont reprises telles quelles :
mangrove non baignable, chlordécone nommé sans chiffre ni verdict, La Favorite avec adresse au
Lamentin, baignade en mer interdite hors lagon ouest et bassins surveillés à La Réunion (**pas de
lagon devant Saint-Louis, pas de lagon dans le sud**), arrêtés de la rivière Langevin affichés sur
place et faisant foi, **bois de Vincennes accessible depuis Vincennes sans y être situé**.
Cinq ajouts propres à l'angle voyageur étranger : les **DROM ne sont pas dans Schengen** (un visa
Schengen n'y vaut pas), la Martinique est **hors territoire TVA et accises de l'UE** donc le rhum
relève d'une franchise voyageur renvoyée à la douane sans chiffre imprimé, **La Réunion est à UTC+4
sans heure d'été et ses saisons sont inversées**, la signalétique **vert/jaune/rouge** d'une plage
surveillée est réglementaire, et les **vacances scolaires** commandent la foule (Vendée = académie
de Nantes, **zone B**, dates renvoyées au calendrier officiel, aucune date citée).
**Tags** : aucun tag neuf inventé, mais `guadeloupe` franchit le seuil de 3 guides et **crée
`/tags/guadeloupe` côté EN** (99 → 100), d'où le passage de `npm run sitemap:check` (FR 29 040 URL,
EN 28 584). `npm run search-index` relancé (`data/search-index.en.json` 707 guides, 100 tags).
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). L'outre-mer est épuisé
des deux côtés ; reprendre les six banlieues de province jamais faites (Villenave-d'Ornon, Talence,
Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron) ou les trous touristiques listés au batch 32.

**Batch 34 — FR, shipped 2026-08-25 : Salon-de-Provence, Saint-Quentin, Brive-la-Gaillarde,
La Seyne-sur-Mer, Valenciennes, Thionville.** Les cinq trous touristiques listés au batch 32 ont été
honorés (Saint-Herblain écarté, voir plus bas) et **Valenciennes et Thionville s'y ajoutent** : ce
sont les deux plus gros manques restants après eux, et l'un comme l'autre pèsent plus lourd, en
matière vérifiable, que les six banlieues bordelaises et lyonnaises encore en piste — Valenciennes
tient un musée des Beaux-Arts de rang national et deux artistes majeurs nés sur place, Thionville un
millénaire de fortifications frontalières. C'est le même arbitrage qu'au batch 32, et pour la même
raison : **on choisit par matière touristique réelle, pas par inertie de liste.** Les six banlieues
(Villenave-d'Ornon, Talence, Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron) **restent en piste** et
n'ont toujours pas été faites — rappel du batch 28 : l'Espace Albert Camus et le fort de la ceinture
lyonnaise sont **à Bron**, pas à Vénissieux.
**Compteurs mesurés : FR 219 (`-a-` strict 212 + 5 en `au-` + 2 en `aux-`), EN 213 ; `GUIDES` 989 →
995.** Aucun nouveau slug hors gabarit : les sept exceptions restent `au-puy-en-velay`, `au-tampon`,
`au-francois`, `au-robert`, `au-lamentin`, `aux-abymes`, `aux-sables-d-olonne`. `metaTitle` 38-46
caractères, `metaDesc` 143-156, 10 sections par guide, densité d'accents 0,150-0,179 (les guides déjà
livrés de la série sont à 0,154-0,179 ; seuil de détection ascii-strip 0,09 — **la densité se mesure
par mot, pas par lettre**, une confusion qui fait sortir 0,035 et croire à une régression).
`npm run search-index` relancé (`data/search-index.json` 995 guides, 245 tags — aucun tag neuf, donc
aucune page `/tags/` créée) et `npm run sitemap:check` repassé (FR 29 067 URL, EN 28 623). Les six
guides ont été vérifiés **retrouvés par le lookup de `app/villes/[slug]/a-faire/page.tsx` et pourvus
de leur photo d'en-tête** (`guideCityPhoto`) après écriture — le contrôle que le batch 32 a dû
ajouter après coup.
⚠️ **Faits vérifiés en ligne avant rédaction, et qui portent les guides** : le château de l'Empéri
(Salon) est un fief des **archevêques d'Arles**, et son musée d'art et d'histoire militaires vient de
la **collection Raoul et Jean Brunon**, entrée dans les collections nationales par l'accord de 1967 et
déposée à Salon ; Nostradamus achète sa maison en **1547** et y meurt en **1566**, mais son tombeau
est à la collégiale Saint-Laurent **par transfert** — il avait d'abord été inhumé au couvent des
Cordeliers, détruit à la Révolution ; le festival **Musique à l'Empéri** a été créé en 1993 par Éric
Le Sage, Paul Meyer et Emmanuel Pahud ; l'hôtel de ville de Saint-Quentin est un chantier **1331-1509**
restauré **en Art déco en 1926** par Louis Guindez, soit gothique flamboyant dehors et années 1920
dedans ; le monument aux morts de Saint-Quentin (inauguré le **31 juillet 1927**) est de **Paul Bigot**
avec **Bouchard et Landowski** ; la crypte de la collégiale de Brive montre les vestiges d'une
basilique du **Ve siècle** dégagés en **1986-1987** ; le pont levant de La Seyne date de **1917**
(société Daydé), est inscrit MH le **3 novembre 1987** et a rouvert au public en **2009** ; les
Sablettes ont été reconstruites **entre 1950 et 1953 par Fernand Pouillon** (label Patrimoine du XXe
siècle en 2004) ; le fronton de Carpeaux de l'hôtel de ville de Valenciennes est **tombé dans
l'incendie de la nuit du 21 au 22 mai 1940** et a été **refait à l'identique par Albert Patrisse** —
ce qu'on regarde depuis la place n'est pas la pierre d'origine ; le Mont-de-Piété de Valenciennes est
de **Wenceslas Cobergher, 1622-1625** ; le fort de **Guentrange** est allemand (chantier ouvert en
**avril 1899**, opérationnel en **1905**) et Guentrange **fait partie de Thionville**, ce n'a jamais
été une commune autonome.
Trois prudences assumées dans la copie, à ne pas diluer : ① la **base aérienne 701** de Salon est une
**emprise militaire** — la Patrouille de France y est stationnée depuis 1964 et l'École de l'air y
forme les officiers, mais on n'y entre pas librement ; le guide le dit avant de parler de la
Patrouille, même traitement que le CAEA sur la base 106 à Mérignac (batch 28) ; ② convention
« **accessible depuis** » plutôt que « situé à » sur tout ce qui relève d'une commune voisine —
**Notre-Dame du Mai** (Six-Fours-les-Plages) depuis La Seyne, **château de La Grange** (Manom) et
**fort du Hackenberg** (Veckring) depuis Thionville, **Collonges-la-Rouge / Turenne / Sarlat** depuis
Brive, l'**aéroport de Brive** étant lui-même sur **Nespouls** ; ③ la **maison espagnole** de
Valenciennes a longtemps abrité l'office de tourisme, dont le **transfert vers le Mont-de-Piété** est
engagé : le guide dit de vérifier l'adresse plutôt que d'affirmer l'une ou l'autre. Aucun horaire,
aucun tarif, aucune hauteur n'est cité, et le seul chiffre non patrimonial est la population Insee
2022 lue dans `data/city-population.json` (Salon 44 553, Saint-Quentin 52 995, Brive 46 769, La Seyne
62 905, Valenciennes 42 979, Thionville 42 778) — pas les `population` approximatives du seed.
⚠️ **`npm run build` n'a pas été lancé, volontairement** : c'est ce que la section Commands interdit
depuis le batch 27 (4 h 30 de génération, `.next` à 25 Go, aucun signal utile). Le substitut prescrit
a été exécuté en entier et passe : `npx tsc --noEmit` **propre**, `npm run integrity`, `search-index`
+ `search-index:check`, `sitemap:check`, plus le contrôle de lookup / photo ci-dessus. Note
d'environnement pour le prochain run : le conteneur de routine démarre **sans `node_modules`**, et
`npx tsc --noEmit` y renvoie alors **43 762 erreurs réparties sur tout le dépôt** (`Property 'key'
does not exist`, `Type 'undefined' is not assignable`, `Cannot find module 'zod'`). Ce n'est pas une
régression, c'est l'installation absente — **lancer `npm install` avant de conclure quoi que ce soit
d'un `tsc` massivement rouge**.
Écart FR→EN après ce batch : **6 villes** (salon-de-provence, saint-quentin, brive-la-gaillarde,
la-seyne-sur-mer, valenciennes, thionville) — au seuil de ~6, donc **le prochain run doit être un
batch EN**. Rappel de la règle tranchée au batch 33 : côté EN, le slug se dérive du **slug de seed
tel quel** (`getEnGuide('things-to-do-in-' + slug + '-2026')`), jamais d'une version « propre » —
donc `things-to-do-in-la-seyne-sur-mer-2026` garde son article et son `-sur-mer`, et
`things-to-do-in-brive-la-gaillarde-2026` garde `-la-gaillarde`. Attention à
`things-to-do-in-saint-quentin-2026` : c'est la ville de l'Aisne, à ne pas confondre avec le
**mont Saint-Quentin** de la Somme, qui revient dans les sources anglophones sur 1918.
Pour le batch FR **suivant**, les gisements restants sont les six banlieues de province ci-dessus et,
côté trous touristiques, **Saint-Herblain** (écarté ici faute de matière : Zénith, ONYX et vallée du
Cens ne font pas dix entrées vérifiables), **Mantes-la-Jolie** (collégiale Notre-Dame, tour
Saint-Maclou), **Istres** (étang de Berre, vieux village) et **Cambrai**, seule ville du Nord de cette
taille encore sans guide.

**Batch 35 — EN, rattrapage de parité, shipped 2026-08-26.** Les 6 jumelles
`things-to-do-in-[slug]-2026` du batch 34 écrites d'un coup dans `data/guides-en.ts`
(Salon-de-Provence, Saint-Quentin, Brive-la-Gaillarde, La Seyne-sur-Mer, Valenciennes, Thionville).
**Compteurs mesurés : FR 219, EN 219 — écart nul dans les deux sens, parité rétablie**
(`EN_GUIDES` 743 → 749). Aucun nouveau slug hors gabarit : les six slugs de seed s'écrivent tels
quels, donc la règle du batch 33 (**côté EN le slug se dérive du slug de seed tel quel**) n'avait
rien à arbitrer. Les 6 guides ont été vérifiés **retrouvés par le lookup de
`app/[locale]/cities/[slug]/things-to-do/page.tsx` et pourvus de leur photo d'en-tête**
(`guideCityPhoto`) après écriture. `metaTitle` 35-52 caractères, `metaDesc` 143-155, 8 sections par
guide (la série FR en compte 10, l'EN fusionne les fins de liste). Aucune figure en `/10`, aucun
horaire, aucun tarif : les seuls chiffres sont ceux des guides FR. Aucun tag neuf — les six
réutilisent `provence-alpes-cote-d-azur`, `hauts-de-france`, `nouvelle-aquitaine`, `grand-est`.
`npm run search-index` relancé (`data/search-index.en.json` 749 guides, 103 tags, inchangé) et
`npm run sitemap:check` repassé (EN 28 623 → 28 629).
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **base aérienne 701 = emprise
militaire**, dite avant la première phrase sur la Patrouille de France ; **fronton de l'hôtel de
ville de Valenciennes = reprise d'Albert Patrisse** après l'incendie du 21-22 mai 1940, pas la
pierre d'origine ; **maison espagnole**, adresse de l'office de tourisme à vérifier ; **savon de
Marseille protégé par aucune appellation** ; et « **accessible depuis** » plutôt que « situé à »
sur Notre-Dame du Mai (Six-Fours), La Grange (Manom), le Hackenberg (Veckring),
Collonges-la-Rouge / Turenne / Sarlat et l'aéroport de Nespouls.
Six ajouts propres à l'angle voyageur étranger, absents du FR : la Patrouille de France présentée
par son équivalent (Red Arrows) et le mistral expliqué en une incise ; « collégiale » et
« basilique » définis comme titres et non comme rangs épiscopaux ; la **désambiguïsation
Saint-Quentin (Aisne) vs mont Saint-Quentin (Somme)** — celui des récits anglophones de 1918 —
posée dès l'intro ; Top 14 et Pro D2 nommés comme les deux divisions professionnelles du rugby
français ; la **fermeture préfectorale du cap Sicié** pour risque incendie donnée comme règle
opposable, et les navettes maritimes de la rade dites transport en commun au tarif d'un ticket ;
et le fait que les frontières belge et luxembourgeoise sont des **passages Schengen intérieurs
sans formalité mais avec pièce d'identité**, Trèves s'appelant **Trier** en allemand.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Gisements inchangés :
les six banlieues de province jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ;
Vaulx-en-Velin, Saint-Priest, Bron — rappel : l'Espace Albert Camus et le fort de la ceinture
lyonnaise sont **à Bron**) et les trous listés au batch 34 (Saint-Herblain, Mantes-la-Jolie,
Istres, Cambrai).

**Batch 38 — FR, shipped 2026-09-01 : Poissy, Rueil-Malmaison, Vernon, Dole, Soissons, Cambrai,
Carpentras.** Sept villes, six régions, prises **dans la liste de gisements laissée par les batches
34 et 36** — pour la première fois depuis longtemps le batch n'a rien eu à arbitrer contre elle :
Cambrai était le trou nommé par le batch 34, Poissy, Rueil-Malmaison, Vernon, Dole, Soissons et
Carpentras étaient six des neuf trous nommés par le batch 36. Il en reste trois de cette liste
(**Bergerac, Agde, Thonon-les-Bains**), plus Saint-Herblain, Mantes-la-Jolie et Istres du batch 34,
plus les six banlieues de province jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ;
Vaulx-en-Velin, Saint-Priest, Bron — rappel du batch 28 : **l'Espace Albert Camus et le fort de la
ceinture lyonnaise sont à Bron**, pas à Vénissieux).
**Compteurs mesurés : FR 233 (`-a-` strict 226 + 5 en `au-` + 2 en `aux-`), EN 226 ; `GUIDES` 1035
→ 1042.** Aucun nouveau slug hors gabarit : les sept villes prennent « à » sans contraction, les
sept exceptions restent `au-puy-en-velay`, `au-tampon`, `au-francois`, `au-robert`, `au-lamentin`,
`aux-abymes`, `aux-sables-d-olonne`. `metaTitle` 32-43 caractères, `metaDesc` 141-155, 10 sections
par guide, densité d'accents 0,131-0,174 **par mot** (seuil ascii-strip 0,09), 0 à 5 em-dashes par
guide pour ~1 050 mots (cible R7.10 : ~1 pour 200 mots). `npm run search-index` relancé
(`data/search-index.json` 1 042 guides, 250 → **251 tags** : « que faire dans le Nord » franchit le
seuil de 3 guides et crée `/tags/que-faire-dans-le-nord`), d'où le passage de
`npm run sitemap:check` (FR 29 123 URL, EN 28 694, chaque URL déclarée a une page et
réciproquement). Les sept guides sont vérifiés **retrouvés par le lookup de
`app/villes/[slug]/a-faire/page.tsx` et pourvus de leur photo d'en-tête** (`guideCityPhoto`).
⚠️ **Le fait le plus utile du batch est une correction de la liste de gisements elle-même : le musée
de Vernon ne s'appelle plus musée Alphonse-Georges-Poulain.** Il a été **rebaptisé musée Blanche
Hoschedé-Monet en 2024**, nom choisi par les habitants pour la belle-fille de Monet, peintre à part
entière ; l'ancien nom lui avait été donné en 1966 pour l'archéologue conservateur en poste depuis
1922. Le batch 36 l'avait inscrit au vivier sous son ancien nom, et une page qui envoie un lecteur
chercher une enseigne qui n'existe plus se lit comme une page périmée. Trois pièges de localisation
écartés de la même façon, convention « **accessible depuis** » plutôt que « situé à » : le **parc du
Peuple de l'herbe est à Carrières-sous-Poissy**, de l'autre côté de la Seine, pas à Poissy ; le char
**Deborah est à Flesquières**, à une dizaine de kilomètres de Cambrai ; **Giverny est une commune à
part entière** à cinq à sept kilomètres de Vernon, pas un quartier de Vernon ; et la **forêt de
Chaux** relève des communes voisines de Dole, dont La Vieille-Loye.
Faits vérifiés en ligne avant rédaction et qui portent les guides : villa Savoye **1928-1931**,
**classée MH le 12 décembre 1965**, quatre mois après la mort de Le Corbusier, **UNESCO juillet
2016** dans la série transnationale de **dix-sept** réalisations, loge du jardinier comprise dans le
bien ; collégiale de Poissy fondée **vers 1016** par Robert le Pieux ; **Louis IX né le 25 avril
1214** à Poissy et baptisé quelques jours plus tard, fonts devenus relique après la canonisation de
**1297**, restaurés en **1630**, grille dessinée par **Viollet-le-Duc** ; prieuré royal décidé par
Philippe le Bel après la canonisation du **11 août 1297**, détruit à la Révolution, **seule la
porterie subsiste**, inscrite MH en **1933**, aujourd'hui musée du Jouet ; **parc Meissonier** 12 ha,
cèdre du Liban centenaire, **Ernest Meissonier (1815-1891)** installé à Poissy en **1846**, parc
propriété de la ville depuis **1952** ; usine **Ford SAF ouverte en 1938**, rachetée par **Simca en
juillet 1954**, nouvelle usine inaugurée en **octobre 1958** (château d'eau de **75 m**, un millier
de véhicules par jour), **Stellantis depuis 2021**, campus en **2025** ; **parc du Peuple de l'herbe
113 ha**, ouvert depuis **2016** ; Malmaison achetée par Joséphine le **21 avril 1799** pour
**325 000 francs**, résidence privée jusqu'en 1814, **divorce en 1809**, **Joséphine y meurt le 29
mai 1814**, domaine racheté par **Daniel Iffla dit Osiris en 1896** et donné à l'État, **musée ouvert
en 1905** ; **parc de Bois-Préau 17 ha**, fermé le mardi ; **monument funéraire de Joséphine élevé en
1825** par Eugène et Hortense dans la chapelle Saint-Nicolas à droite du chœur, **cénotaphe
d'Hortense élevé en 1858** par Napoléon III à gauche, corps en crypte dans un sarcophage antique ;
**orgue Cavaillé-Coll classé MH depuis 1970**, restauré en **2017** ; **Atelier Grognard**, ancienne
usine de plaques de cuivre, zinc et étain pour la gravure, **plus de 650 m²** ; **Vieux-Moulin** de
Vernon sur deux piles du pont du **XIIe siècle**, dernier des **six** moulins, peint par Monet sous
le titre *Vieille maison sur le pont* (musée de La Nouvelle-Orléans) ; **château des Tourelles**
élevé après la prise de Vernon par **Philippe Auguste en 1196**, tour carrée et quatre tourelles
rondes, une vingtaine de mètres, quasi inchangé depuis huit cents ans ; **musée des impressionnismes
de Giverny créé en 2009** ; **Pasteur né à Dole le 27 décembre 1822**, maison devenue musée en
**1923** ; **clocher de la collégiale de Dole 73 m**, achevé en **1596** sur un dessin de **Hugues
Sambin** inspiré de Santa Maria di Carignano à Gênes, **82 m à l'origine**, abaissé de **9 m** après
le siège de **1636** et une tempête ; Dole capitale de la Franche-Comté **jusqu'en 1678** (traité de
Nimègue), **université transférée à Besançon en mai 1691** par lettres patentes de Louis XIV ;
**Hôtel-Dieu de Dole réhabilité entre 1998 et 2000** en médiathèque, bibliothèque patrimoniale et
archives ; **forêt de Chaux 20 493 ha**, deuxième massif feuillu de France après Orléans ; tours de
**Saint-Jean-des-Vignes 75 et 80 m**, site vendu à l'évêque en **1804**, **démontage de 1805 à
1825** pour restaurer la cathédrale, façade sauvée après une campagne à laquelle **Victor Hugo** a
prêté sa voix ; cathédrale de Soissons **nef 110 m**, **30,33 m sous voûte**, **tour 66 m**,
**croisillon sud arrondi construit vers 1176-1190** face à un bras nord à mur plat ; **Adoration des
bergers de Rubens, vers 1618-1620**, bras **nord** du transept, armes de **Simon Le Gras
(1624-1656)** ajoutées, évacuée pendant les deux guerres, restaurée en **1949** et **1993** ; musée
de Soissons **inauguré en 1857**, installé **depuis 1933** dans l'abbaye Saint-Léger ; vase de
Soissons raconté par **Grégoire de Tours, livre II**, bataille de **486** ; **beffroi de Cambrai**,
ancien clocher Saint-Martin **1447-1474**, **62 m**, **UNESCO 2005** ; cathédrale actuelle = ancienne
**abbatiale du Saint-Sépulcre rebâtie 1696-1702** sous **Fénelon**, **cathédrale en 1804** par
**Louis Belmas** ; **cathédrale gothique disparue**, flèche de **110 m**, « merveille des Pays-Bas » ;
**mausolée de Fénelon par David d'Angers, 1826** ; **icône Notre-Dame de Grâce vers 1340** ; **maison
espagnole de 1595**, office de tourisme ; musée de Cambrai dans l'**hôtel de Francqueville (1720)**,
**dépôts de l'État à partir de 1923** ; **bataille de Cambrai du 20 novembre au 7 décembre 1917**,
**476 chars engagés dont 378 au combat**, ligne Hindenburg percée sur **9 à 12 km** sauf à
Flesquières, contre-attaque allemande le **30 novembre** ; **Deborah D51**, Mark IV femelle, **28 t,
8 m, 2,5 m**, retrouvé en **novembre 1998** par **Philippe Gorczynski** sous **3 m** de terre après
**81 ans**, centre d'interprétation **inauguré le 25 novembre 2017**, **4 des 8** membres d'équipage
au cimetière du Commonwealth voisin ; **bêtise de Cambrai vers 1830**, procès conclu en **1889**
(Afchain « seul inventeur », Despinoy « créateur ») ; **synagogue de Carpentras 1367**, la plus
ancienne de France en activité, restaurée au XVIIIe par **Antoine d'Allemand**, bains rituels et deux
fours au rez-de-chaussée ; **expulsion des juifs du royaume de France en 1306** et résidence
autorisée dans **quatre villes** du Comtat (Carpentras, Cavaillon, Avignon, L'Isle-sur-la-Sorgue) ;
**cathédrale Saint-Siffrein commencée en 1404** sur ordre de l'antipape **Benoît XIII**, achevée en
**1519**, façade baroque du XVIIe, **portail sud dit porte Juive** ; **arc romain du Ier siècle** ;
**hôtel-Dieu financé par Malachie d'Inguimbert, chantier 1750-1769**, travaux **2014-2017**,
**Inguimbertine ouverte début novembre 2017** (inauguration le samedi **4 novembre**), **~1 800 m²**,
**~60 000 documents**, une quarantaine de tableaux, plus de cent objets ; **marché aux truffes le
vendredi de novembre à mars** ; **berlingot** au sirop de fruits confits, sorti du statut médicinal
en **1844** par **François Pascal Long** ; **ligne Avignon-Carpentras rouverte aux voyageurs en avril
2015**, une quinzaine de kilomètres, une trentaine de minutes.
⚠️ **Six affirmations écrites au premier jet et corrigées avant commit**, toutes du même genre — un
écart calculé, une comparaison ou une distance qu'aucun contrôle automatique ne voit : ① « les cinq
points qu'il défendait **depuis dix ans** » (ils sont formulés quelques années avant le chantier, pas
dix) ; ② les fonts de Saint Louis « **à huit cents mètres** » de la villa Savoye, alors que le même
guide dit deux sections plus loin que la villa est à l'écart du centre ; ③ Poissy résidence royale
« **bien avant** que Saint-Germain-en-Laye ou Versailles n'existent comme lieux de pouvoir »,
comparaison invérifiable retirée ; ④ Rueil « **à vingt minutes de La Défense** », chiffre non vérifié ;
⑤ Percier et Fontaine crédités de « l'architecture » de Malmaison plutôt que des aménagements qui leur
ont été confiés ; ⑥ musée de Soissons donné « en accès libre » sans source. C'est le même mode de
défaillance qu'au batch 37 (l'écart de sept siècles et demi lu « deux siècles et demi » à Sens) : les
dates prises une à une étaient justes, ce sont les **écarts et les comparaisons** qui dérapent.
Les seuls chiffres de population sont ceux de l'Insee 2022 lus dans `data/city-population.json`
(Poissy 40 792, Rueil-Malmaison 80 842, Vernon 24 841, Dole 23 784, Soissons 28 667, Cambrai 31 568,
Carpentras 30 854) — **pas les `population` approximatives du seed**. Aucun tarif, aucun horaire ;
quatre équipements à ouverture instable sont explicitement renvoyés à une vérification préalable
(musée du Jouet, château de Bois-Préau **resté longtemps fermé et réduit à des expositions
temporaires**, chapelle du Grand Séminaire, apothicairerie de l'hôtel-Dieu). Deux cadrages assumés à
ne pas diluer : la **porte Juive** de Carpentras est nommée pour ce qu'elle était — les convertis y
passaient pour le baptême — et la section « carrières » dit que le refuge pontifical était un régime
juridique contraint, pas une harmonie ; et le **vase de Soissons n'existe pas**, c'est un récit de
Grégoire de Tours écrit un siècle après les faits, le guide le dit plutôt que d'envoyer un lecteur
chercher une vitrine.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27). Le
substitut prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity`,
`search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (0 route FR sans jumelle),
plus le contrôle de lookup / photo ci-dessus.
Écart FR→EN après ce batch : **7 villes** (poissy, rueil-malmaison, vernon, dole, soissons, cambrai,
carpentras) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**. Rappel de la
règle du batch 33 : côté EN, le slug se dérive du **slug de seed tel quel**
(`getEnGuide('things-to-do-in-' + slug + '-2026')`), et aucun de ces sept ne porte d'article, donc
rien à arbitrer. Trois points de vigilance pour ces jumelles : **`things-to-do-in-vernon-2026` doit
poser Vernon (Eure) dès la première ligne** — les sources anglophones ramènent Vernon (Colombie-
Britannique), Vernon (Texas) et le Mount Vernon de Washington ; le nom du musée de Vernon doit être
le **nouveau** des deux côtés ; et la **bataille de Cambrai est de l'histoire britannique avant
d'être de l'histoire française** (476 chars, Flesquières, cimetières du Commonwealth), donc la
jumelle anglaise a de la matière propre là où le guide FR reste sobre — même arbitrage qu'avec
Jubilee à Dieppe au batch 37.

**Batch 39 — EN, rattrapage de parité, shipped 2026-09-01.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 38 écrites d'un coup dans `data/guides-en.ts` (Poissy,
Rueil-Malmaison, Vernon, Dole, Soissons, Cambrai, Carpentras). **Compteurs mesurés : FR 233
(`-a-` strict 226 + 5 en `au-` + 2 en `aux-`), EN 233 — écart nul dans les deux sens, parité
rétablie** (`EN_GUIDES` 802 → 809). Aucun slug hors gabarit : les sept villes prennent « à » sans
contraction, donc la règle du batch 33 (**côté EN le slug se dérive du slug de seed tel quel**)
n'avait rien à arbitrer, et les sept exceptions restent `au-puy-en-velay`, `au-tampon`,
`au-francois`, `au-robert`, `au-lamentin`, `aux-abymes`, `aux-sables-d-olonne`. `metaTitle` 33-43
caractères, `metaDesc` 133-157, 8 sections par guide (la série FR en compte 10, l'EN fusionne les
fins de liste). Les 7 guides sont vérifiés **retrouvés par `getEnGuide()` depuis le slug de seed**
et **pourvus de leur photo d'en-tête** (`guideCityPhoto`) après écriture. Aucun tag neuf : les 7
réutilisent `ile-de-france`, `normandy`, `bourgogne-franche-comte`, `hauts-de-france`, `provence`
— `search-index.en.json` reste à **114 tags**, donc aucune page `/tags/` créée ; `sitemap:check`
repassé quand même (FR 29 123 URL, EN 28 694 → **28 701**, soit exactement les 7 guides neufs).
Densité d'em-dash ramenée à la cible R7.10 après une première passe qui la dépassait sur quatre
guides (Carpentras était à 1 pour 100 mots) : **1 pour 199 à 266 mots** sur les sept.
⚠️ **Trois figures du texte EN ne sont pas dans la jumelle FR, et c'est délibéré — le contrôle
mécanique les remontera à chaque run, ne pas les « corriger ».** Le contrôle (chaque suite de
chiffres du texte EN cherchée dans le guide FR, séparateurs normalisés) donne **166 figures, 163
retrouvées** ; les 3 restantes sont `43` et `25` (Vernon) et `23` (Cambrai), toutes vérifiées en
ligne avant écriture et introduites au titre de la matière propre à l'angle voyageur anglophone
que le batch 38 avait explicitement demandée : ① la **43ᵉ division (Wessex)** britannique force le
franchissement de la Seine à Vernon à partir du soir du **25 août 1944**, sous le nom d'opération
**Neptune** — le guide précise que ce n'est pas le débarquement de Normandie qui porte le même nom
de code, et cela donne enfin une raison à la section « ce que 1944 a emporté », qui côté FR
constate la destruction sans la dater ; ② les cloches ont sonné en Grande-Bretagne le **23 novembre
1917** pour la percée de Cambrai, **seule occasion de toute la guerre** où l'on a sonné pour une
victoire, et trois jours avant que la position ne cède — c'est par là qu'un lecteur britannique
situe la ville. Le guide Cambrai est le seul du batch à 8 minutes de lecture pour cette raison.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **parc du Peuple de l'herbe à
Carrières-sous-Poissy** et non à Poissy, **Giverny commune à part entière** à cinq à sept km de
Vernon, **char Deborah à Flesquières** à une dizaine de km de Cambrai, **forêt de Chaux** relevant
des communes voisines dont La Vieille-Loye, **château de Bois-Préau** longtemps fermé et réduit aux
expositions temporaires (à vérifier avant de venir), **chapelle du Grand Séminaire** et
**apothicairerie de l'hôtel-Dieu** à ouverture instable, **maison espagnole** office de tourisme,
**vase de Soissons inexistant** (récit de Grégoire de Tours écrit un siècle après les faits), et
**musée de Vernon sous son nouveau nom** (Blanche Hoschedé-Monet depuis 2024, l'ancien
Alphonse-Georges-Poulain étant encore sur les panneaux — le guide EN le dit, c'était le point de
vigilance nº 2 du batch 38). Cinq autres ajouts propres au lecteur étranger, sans chiffre :
**Vernon (Eure) posé dès la première ligne** contre Vernon (Colombie-Britannique), Vernon (Texas)
et Mount Vernon — le point de vigilance nº 1 du batch 38 ; **RER A** et **collégiale** définis en
une incise ; **Joséphine** présentée comme la première épouse de Napoléon, née en Martinique ;
**beffroi** défini comme tour civile et non clocher ; **Hôtel-Dieu** rendu par « a hospital in the
old sense of a charitable foundation » ; et **Philippe Auguste face au duché anglo-normand**
explicité comme « contre les rois d'Angleterre, également ducs de Normandie ».
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27 : 4 h 30
de génération, `.next` à 25 Go, ENOSPC avant la finalisation, aucun signal utile). Le substitut
prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity`, `search-index` +
`search-index:check`, `sitemap:check`, `npm run parity` (0 route FR sans jumelle), plus le contrôle
de lookup / photo, le contrôle de figures ci-dessus et une vérification d'encodage (`m²` intact,
aucun `m2` / `EUR` / `deg` ascii, aucun mojibake). Note d'environnement confirmée : le conteneur de
routine démarre **sans `node_modules`** — `npm install` d'abord, sinon `tsc` sort des dizaines de
milliers d'erreurs qui ne sont pas des régressions.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Gisements inchangés :
les trois villes de la liste du batch 36 jamais faites (**Bergerac, Agde, Thonon-les-Bains**), les
trous du batch 34 (**Saint-Herblain, Mantes-la-Jolie, Istres**) et les six banlieues de province
jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron —
rappel du batch 28 : **l'Espace Albert Camus et le fort de la ceinture lyonnaise sont à Bron**, pas
à Vénissieux).

**Batch 40 — FR, shipped 2026-09-03 : Bergerac, Agde, Thonon-les-Bains, Rambouillet, Béthune,
Montélimar, Cavaillon.** Trois villes sortent de la liste de gisements laissée par les batches 36
et 39 (Bergerac, Agde, Thonon-les-Bains) ; les quatre autres sont le même arbitrage qu'aux batches
26, 32, 34 et 36, **par matière touristique réelle et non par inertie de liste** — le comptage fait
ce run donne **308 villes du seed sur 540 sans guide tourisme**, dont un haut de liste par
population presque entièrement francilien et pauvre en matière vérifiable, pendant que
**Rambouillet** (château national, laiterie de Marie-Antoinette, Bergerie nationale, premier sommet
du G6), **Béthune** (beffroi UNESCO, Grand-Place Art déco), **Montélimar** et **Cavaillon**
dormaient sans guide. **Béthune et Cavaillon n'avaient jusqu'ici aucun guide les citant.**
**Compteurs mesurés : FR 240 (`-a-` strict 233 + 5 en `au-` + 2 en `aux-`), EN 233 ; `GUIDES`
1050 → 1057.** Aucun nouveau slug hors gabarit. `metaTitle` 32-44 caractères, `metaDesc` 137-151,
10 sections par guide, densité d'accents 0,133-0,171 **par mot** (seuil ascii-strip 0,09), **0
em-dash**. `npm run search-index` relancé (1 057 guides, 252 → **254 tags** : `que faire dans les
Yvelines` et `sorties Hauts-de-France beffrois` franchissent le seuil de 3 guides), d'où le passage
de `npm run sitemap:check` (FR 29 133 → **29 142 URL**, soit les 7 guides plus les 2 pages de tag).
Les sept guides sont vérifiés retrouvés par le lookup de `app/villes/[slug]/a-faire/page.tsx`,
pourvus de leur photo d'en-tête et remontés en 1re position par la recherche inverse
`relatedCities`.
⚠️ **Le fait le plus utile du batch est une correction : le vrai Cyrano n'a jamais vécu à Bergerac.**
Savinien de Cyrano de Bergerac est né à Paris en 1619 ; son père était seigneur de Mauvières et de
Bergerac, **deux fiefs de la vallée de Chevreuse, à Saint-Forget dans les Yvelines**, le second
ainsi nommé par un propriétaire du XVIe siècle récompensé pour son aide à la reprise de la ville
périgourdine aux Anglais. Il ajoute « de Bergerac » à son nom en **1645**, après la revente des
terres, et l'accent gascon est une invention de Rostand. Même genre de correction côté Thonon :
**« faire ripaille » ne vient pas du château de Ripaille** — l'expression précède de plusieurs
décennies le premier pavillon d'Amédée VIII et dérive de « riper », le lieu tenant son nom de
« rispe », la broussaille.
⚠️ **Dix affirmations corrigées avant commit, dont six démenties par une mesure sur nos propres
données et non par une relecture** : Bergerac donnée en recul « alors que la Dordogne attire » (les
4 villes du département sont plates ou en recul, Bergerac étant la 2e moins mauvaise) ; Agde
sous-vendue en « une des communes qui grossit le plus vite » alors qu'elle est **la première du
corpus héraultais à +23,4 %, devant Montpellier** ; Thonon et Montélimar comparés sans chiffre
(+11,1 % entre Annemasse et Annecy ; +14,1 %, 1re de la Drôme) ; Cavaillon comparée à un « Luberon
voisin qui gagne » (invérifiable, et 5 des 8 communes vauclusiennes du corpus reculent) ; Béthune
« stable dans un bassin qui a perdu » sans chiffre (−0,3 % contre −4,1 à −6,2 % chez ses voisines).
Quatre erreurs de fait pur : Marseille fondée « quelques décennies » avant Agde (600 vs 525 av.
J.-C. = trois quarts de siècle) ; Cap d'Agde annoncé à 4 km du centre au lieu de **5** ; mérinos
présents « deux siècles et demi » après 1786 au lieu de **240 ans** ; label patrimoine du XXe siècle
prêté au Cap d'Agde sans source, supprimé. **Le contrôle qui les a trouvées est un tri complet des
villes du département sur la population Insee, pas une relecture.**
Trois prudences à ne pas diluer : convention « **accessible depuis** » sur **Monbazillac** (commune
à part, ~8 km), **l'Espace Rambouillet qui est à Sonchamp** malgré son nom, et
**Notre-Dame-de-Lorette / l'Anneau de la Mémoire, à Ablain-Saint-Nazaire** ; le **quartier naturiste
du Cap d'Agde** traité en une section factuelle et sans jugement, la confusion jouant dans les deux
sens ; et la **carrière de Cavaillon** nommée pour ce qu'elle était, un quartier contraint sous
tolérance encadrée, même cadrage que la porte Juive de Carpentras au batch 38. Aucun horaire, aucun
tarif ; populations Insee 2022 de `data/city-population.json`, **pas les `population` du seed**.
Écart FR→EN après ce batch : **7 villes** — donc **le prochain run doit être un batch EN**. Quatre
points de vigilance : `things-to-do-in-agde-2026` doit distinguer Agde du Cap d'Agde dès la
première ligne ; **la correction Cyrano est de la matière propre à l'angle anglophone** (Rostand est
joué en anglais depuis un siècle) ; **Béthune a de la matière 14-18 que le FR n'a pas** (l'Anneau de
la Mémoire porte des noms britanniques et allemands), même arbitrage que Dieppe au batch 37 et
Cambrai au batch 39 ; et la traversée Thonon-Lausanne demande que le franchissement Schengen soit
posé comme règle opposable, la Suisse n'étant pas dans l'UE. Pour le batch FR **suivant**, les
gisements restants sont Saint-Herblain, Mantes-la-Jolie, Istres et les six banlieues de province
jamais faites, à compléter par les trous mesurés ce run : **Villefranche-sur-Saône**, **Melun**,
**Alès**, **Le Cannet**, **Conflans-Sainte-Honorine**, **Pontoise**, **Haguenau**, **Blagnac** et
**Six-Fours-les-Plages**.

**Batch 41 — EN, rattrapage de parité, shipped 2026-09-03.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 40 écrites d'un coup dans `data/guides-en.ts` (Bergerac,
Agde, Thonon-les-Bains, Rambouillet, Béthune, Montélimar, Cavaillon). **Compteurs mesurés : FR 240
(`-a-` strict 233 + 5 en `au-` + 2 en `aux-`), EN 240 — écart nul dans les deux sens, parité
rétablie** (`EN_GUIDES` 825 → 832). Aucun slug hors gabarit : les sept villes prennent « à » sans
contraction, donc la règle du batch 33 (**côté EN le slug se dérive du slug de seed tel quel**)
n'avait rien à arbitrer. `metaTitle` 36-45 caractères, `metaDesc` 126-142, 8 sections par guide (la
série FR en compte 10, l'EN fusionne les fins de liste). Les 7 guides sont vérifiés **retrouvés par
`getEnGuide()` depuis le slug de seed** et **pourvus de leur photo d'en-tête** (`guideCityPhoto`).
Aucun tag neuf — les 7 réutilisent `nouvelle-aquitaine`, `occitanie`, `auvergne-rhone-alpes`,
`ile-de-france`, `hauts-de-france`, `provence` ; `search-index.en.json` reste à **114 tags**, donc
aucune page `/tags/` créée, et `sitemap:check` confirme EN **28 724 URL**, soit exactement les 7
guides neufs. Densité d'em-dash très en dessous de la cible R7.10 : 2 sur les sept guides réunis.
⚠️ **Onze figures du texte EN ne sont pas dans les jumelles FR, et c'est délibéré — le contrôle
mécanique les remontera à chaque run, ne pas les « corriger ».** Le contrôle (chaque suite de
chiffres du texte EN cherchée dans le guide FR, séparateurs normalisés) donne **109 figures, 98
retrouvées** ; les 11 restantes sont toutes vérifiées en ligne avant écriture et relèvent de la
matière propre à l'angle anglophone que le batch 40 avait explicitement demandée. ① **Bergerac** :
`1981`, `1991`, `2025` et `1897`. Pour un lecteur britannique, « Bergerac » n'est pas une ville du
Périgord mais **une série de la BBC diffusée de 1981 à 1991 avec John Nettles, rebootée en 2025 —
et située à Jersey**. La désambiguïsation ouvre l'intro, exactement comme celle d'Orange au batch 37
et de Vernon au batch 39. `1897` date la pièce de Rostand, jouée et filmée en anglais depuis, ce qui
donne son poids à la correction Cyrano du batch 40 : le vrai Savinien est né à Paris et les fiefs de
Bergerac sont dans les Yvelines. ② **Rambouillet** : `1999` et `23`. Les pourparlers sur le Kosovo
se sont ouverts **au château le 6 février 1999** et y ont tenu **jusqu'au 23 février** ; ils ont
repris **à Paris**, et c'est là, pas à Rambouillet, que la délégation kosovare albanaise a signé le
**18 mars**. Le guide le dit dans cet ordre : attribuer la signature au château est l'erreur
courante. Le même paragraphe garde le G6 de novembre 1975, dont quatre des six pays sont
anglophones ou lus en anglais. ③ **Béthune** : `1914`, `1915`, `1918`, `21` et `3004`. C'est le
guide où l'écart FR/EN est le plus fort, et le batch 40 l'avait annoncé. Béthune a été pendant
l'essentiel de la guerre **un quartier général de corps et de division britannique, un centre
ferroviaire et hospitalier** — l'Indian Corps y tient le secteur en 1914-1915 — et c'est le
**bombardement du 21 mai 1918**, après l'échec allemand sur la Lys, qui a détruit la Grand-Place
que la ville a reconstruite en Art déco. Le cimetière communal porte **3 004 sépultures du
Commonwealth de la Première Guerre mondiale**. Autrement dit la section « pourquoi la place est Art
déco » n'est pas un ajout décoratif : elle donne enfin sa cause au monument que le guide FR décrit
sans la dater.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **Monbazillac est une commune à
part** (~8 km) et non un quartier de Bergerac, **l'Espace Rambouillet est à Sonchamp** malgré son
nom, **Notre-Dame-de-Lorette et l'Anneau de la Mémoire sont à Ablain-Saint-Nazaire**, le **quartier
naturiste du Cap d'Agde** est traité en une section factuelle et sans jugement (la confusion joue
dans les deux sens, et le reste de la station n'a rien de naturiste), la **carrière de Cavaillon**
est nommée pour ce qu'elle était — un régime juridique de tolérance encadrée, pas une harmonie —,
**« faire ripaille » ne vient pas du château de Ripaille**, et le **CAEA-style « accessible
depuis »** tient partout ailleurs. Sept ajouts sans chiffre propres au lecteur étranger : Agde et
**Cap d'Agde posés en première ligne comme deux endroits distincts à cinq kilomètres** (point de
vigilance nº 1 du batch 40) ; **Léman rendu « Lake Geneva »** ; la traversée Rives-Lausanne écrite
comme le batch 40 le demandait, **Schengen sans visa mais pièce d'identité obligatoire, et la Suisse
hors UE et hors union douanière donc franchises douanières applicables** — le piège étant de déduire
« pas de contrôle de passeport » de « pas de règles » ; **« Rambouillet » est un nom de race ovine
aux États-Unis et en Australie**, et l'American Rambouillet descend du troupeau toujours présent à
la Bergerie nationale, ce qui donne au visiteur anglophone une raison d'y aller que le FR n'a pas ;
**Dumas présenté par *The Three Musketeers* et *The Count of Monte Cristo*** avant sa rente de douze
melons ; **beffroi, collégiale et CDN définis en une incise** ; et les tarifs d'un CDN de province
comparés à Londres plutôt qu'à Paris.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27 : 4 h 30
de génération, `.next` à 25 Go, ENOSPC avant la finalisation, aucun signal utile). Le substitut
prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides EN 825 → 832),
`search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (0 route FR sans jumelle),
`npm run hreflang:check`, plus le contrôle de lookup / photo, le contrôle de figures ci-dessus et
une vérification d'encodage (aucun `m2` / `EUR` / `deg` ascii, aucun mojibake, accents intacts).
Note d'environnement reconfirmée : le conteneur de routine démarre **sans `node_modules`** —
`npm install` d'abord.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Gisements inchangés :
Saint-Herblain, Mantes-la-Jolie, Istres, les six banlieues de province jamais faites
(Villenave-d'Ornon, Talence, Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron — rappel du batch 28 :
**l'Espace Albert Camus et le fort de la ceinture lyonnaise sont à Bron**, pas à Vénissieux) et les
trous mesurés au batch 40 : Villefranche-sur-Saône, Melun, Alès, Le Cannet, Conflans-Sainte-Honorine,
Pontoise, Haguenau, Blagnac, Six-Fours-les-Plages.

**Batch 42 — FR, shipped 2026-09-05 : Pontoise, Haguenau, Alès, Villefranche-sur-Saône,
Six-Fours-les-Plages, Blagnac, Le Cannet.** Six des sept villes sortent de la liste de gisements
laissée par le batch 40 (Pontoise, Haguenau, Blagnac, Six-Fours-les-Plages, Villefranche-sur-Saône,
Le Cannet) ; **Alès** est l'ajout du run, et c'est le plus gros trou restant du corpus : deuxième
commune du Gard, seul site minier visitable de la région, et aucun guide ne la citait. Les six
banlieues de province jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ; Vaulx-en-Velin,
Saint-Priest, Bron — rappel du batch 28 : **l'Espace Albert Camus et le fort de la ceinture
lyonnaise sont à Bron**, pas à Vénissieux) **restent en piste et n'ont toujours pas été faites**,
même arbitrage qu'aux batches 26, 32, 34, 36 et 40 : **on choisit par matière touristique réelle,
pas par inertie de liste.**
⚠️ **Un nouveau slug hors gabarit, le huitième** : `10-choses-a-faire-**au**-cannet-2026` (« au
Cannet »). Le compte réel se prend toujours avec **`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`**,
et la table de correspondance à appliquer avant tout `comm` s'allonge : `puy-en-velay`→`le-puy-en-velay`,
`tampon`→`le-tampon`, `francois`→`le-francois`, `robert`→`le-robert`, `lamentin`→`le-lamentin`,
`cannet`→`le-cannet`, `abymes`→`les-abymes`, `sables-d-olonne`→`les-sables-d-olonne`. Le correctif
du batch 32 tient : `app/villes/[slug]/a-faire/page.tsx` et `guideCityPhoto()` retrouvent bien la
forme contractée depuis `le-cannet`, vérifié après écriture sur les sept guides.
**Compteurs mesurés : FR 247 (`-a-` strict 239 + 6 en `au-` + 2 en `aux-`), EN 240 ; `GUIDES` 1066
→ 1073.** `metaTitle` 32-42 caractères, `metaDesc` 130-150, 10 sections par guide, densité d'accents
0,122-0,203 **par mot** (seuil ascii-strip 0,09), 0 à 5 em-dashes pour ~1 200 mots (cible R7.10 :
~1 pour 200 mots). `npm run search-index` relancé (`data/search-index.json` 1 073 guides, **257 tags,
inchangé** — aucun tag neuf n'a franchi le seuil de 3 guides, donc aucune page `/tags/` créée) et
`npm run sitemap:check` repassé (FR 29 155 → **29 162 URL**, soit exactement les 7 guides neufs ;
EN 28 737). Les sept guides sont vérifiés **retrouvés par le lookup de
`app/villes/[slug]/a-faire/page.tsx` et pourvus de leur photo d'en-tête** (`guideCityPhoto`).
⚠️ **Le fait qui structure le guide Haguenau est une absence, et il faut la dire avant de faire
chercher un monument inexistant** : Barberousse transforme la forteresse en palais impérial à partir
de **1162** et accorde la charte de franchises en **1164**, la chapelle palatine est bâtie
**1170-1184** et les empereurs y résident jusqu'en **1250** — mais **il n'en reste rien**. La ville
est incendiée **deux fois la même année 1677**, par le général de Montclar le **10 février** puis par
le maréchal de Créquy du **16 au 17 septembre**, sur ordre de Louis XIV et de Louvois qui appliquent
la terre brûlée pour empêcher les Impériaux de tenir les villes de la **Décapole** (dix villes,
constituée en **1354**, dont Haguenau est le chef-lieu) ; le château impérial disparaît alors, la
chapelle en **1687**. Haguenau ne renaît qu'à partir de **1715** et devient, après Strasbourg et
Colmar, la ville d'Alsace la plus riche en édifices du **XVIIIe siècle** — c'est ce siècle-là qu'on
regarde dans le centre. Puis occupation en **1940**, libération en **mars 1945** après deux mois de
combats sur les lignes de la Moder, reconstruction après **1950**.
Autres faits vérifiés en ligne avant rédaction : cathédrale **Saint-Maclou de Pontoise** bâtie
**1140-1165**, façade flamboyante substituée à la façade d'origine dans la **seconde moitié du XVe
siècle**, **cathédrale seulement depuis 1966** (création du diocèse) ; **musée Tavet-Delacour** dans
un hôtel bâti **1477-1483** pour l'archevêque de Rouen, musée à la suite de la proposition de M.
Tavet en **1889**, **donation Otto Freundlich en 1968** — le plus vaste ensemble au monde pour cet
artiste ; **musée Pissarro créé en 1980** ; **Pissarro à Pontoise de 1866 à 1868 puis de 1872 au
début des années 1880**, il y fait venir **Cézanne et Guillaumin en 1872**, **Gauguin est son élève
1879-1883**, et c'est par lui que **Van Gogh arrive à Auvers en 1890** ; **église Notre-Dame détruite
au siège de 1589, rebâtie en 1599** ; **carmel fondé en 1605** ; **église Saint-Georges de Haguenau**
chantier ouvert en **1143**, **classée MH dès 1848** ; **forêt indivise de Haguenau 13 406 ha**, la
plus grande forêt domaniale indivise de France, statut issu d'une **ordonnance de Louis XIV du 28
août 1696**, ville et État copropriétaires à parts égales, jamais défrichée (sols sableux, cônes
alluviaux de la Moder et de la Sauer), **Gros Chêne** foudroyé au début du XXe siècle après cinq à
six siècles ; **Mine Témoin d'Alès créée en 1945** quartier de Rochebelle, **700 m de galeries**, le
plus grand réseau minier naturel visitable de France, **mine-école des Houillères des Cévennes où des
apprentis sont réellement descendus de 1945 à 1968** ; **musée PAB** au château de Rochebelle,
ancienne résidence des évêques, **Pierre-André Benoit 1921-1993**, imprimeur et éditeur de Picasso,
Picabia, Miró et Braque ; **fort Vauban** dans les jardins du Bosquet, ordonné par Louis XIV pendant
la **guerre des Camisards** ; **chapelle de l'Ermitage** dite Notre-Dame-des-Mines, **290 m**,
bâtie à partir du XIIe siècle ; **apogée de la soie en 1855**, année d'apparition de la **pébrine**,
**Pasteur à Alès de 1865 à 1869** ; **collégiale Notre-Dame-des-Marais** de Villefranche, flèche de
**72 m**, chantier du XIIe au XVIe ; **musée Paul-Dini ouvert le 9 juin 2001** dans l'ancienne halle
aux grains dite la **Grenette** (**1893**, réaménagée **1999-2001**), né d'une donation de Muguette
et Paul Dini (**premier don le 15 août 1998**, ~**450 tableaux**), collection permanente > **1 200
œuvres**, peinture lyonnaise et rhônalpine **de 1875 à aujourd'hui** ; **Conscrits nés vers 1850**,
grande **vague** sur la rue Nationale, **inscrits en 2020 à l'inventaire du patrimoine culturel
immatériel**, classes en 6 en 2026 ; **collégiale Saint-Pierre de Six-Fours** au XIe siècle,
**polyptyque de la Vierge attribué à Louis Bréa** (né à Nice vers 1450, mort vers 1523), **classé MH
en 1898** ; **Notre-Dame de Pépiole**, paléochrétienne, trois nefs juxtaposées à absides, vitraux en
culs de bouteilles ; **Notre-Dame du Mai au sommet du cap Sicié, 358 m**, panorama de Cassis à
Toulon ; **fort de Six-Fours** bâti à la fin du XIXe après **1870**, réarmé en batterie antiaérienne
avant le débarquement d'**août 1944** ; **batterie du cap Nègre, 1846** ; **Aeroscopia ouvert en
janvier 2015** (Concorde, Caravelle Air Inter, Super Guppy, **A300B premier avion produit par
Airbus**, A400M, A380, réplique du Morane-Saulnier de Roland Garros, **fresque de 58 m**) ; **visites
Airbus par Manatour au départ de l'accueil d'Aeroscopia**, chaînes **A350 (FAL Jean-Luc Lagardère)**
et **A321**, **~1 h 30**, réservation obligatoire et **document d'identité exigé** ; **quatre
monuments protégés à Blagnac** — oratoire Saint-Exupère **classé 1922**, église Saint-Pierre
**inscrite 1926**, pont sur le Touch **inscrit 1950**, couvent Sainte-Catherine de Sienne **inscrit
2001** ; **Odyssud** en bordure du parc du Ritouret, **950 places**, tram T1 ; **musée Bonnard ouvert
le 25 juin 2011** dans l'ancien **hôtel Saint-Vianney** (architectes Ferrero et Rossi, de Vence),
**seul musée au monde consacré à Bonnard** ; **Bonnard achète Le Bosquet en 1926** et y reste jusqu'à
sa mort en **1947** ; **chapelle Saint-Sauveur** décorée par **Théo Tobiasse** sur le thème « La vie
est une fête », sculpture **L'Oiseau de Lumière** ; **mur des amoureux réalisé en 1990** par le
fresquiste **Guy Ceppa** d'après **Raymond Peynet**, citoyen d'honneur ; **tour des Danys, XVIe
siècle**, la plus ancienne construction du Cannet conservée en l'état, **porte murée à trois mètres
du sol**, **neuf mâchicoulis**.
⚠️ **Six affirmations écrites au premier jet et retirées avant commit, toutes faute de source et
non faute de vraisemblance** — c'est le même mode de défaillance qu'aux batches 38 et 40, mais un cran
plus en amont : ① les cloches de Saint-Georges données « parmi les plus anciennes de France » ; ② les
boiseries de Saint-Nicolas attribuées nommément à l'**abbaye de Neubourg** (l'origine abbatiale est
sûre, l'abbaye ne l'était pas) ; ③ le château de Rochebelle situé « sur la rive gauche du Gardon » ;
④ « une **soixantaine** de cours Renaissance » à Villefranche, chiffre très répandu et jamais sourcé,
remplacé par « des dizaines » ; ⑤ la seconde nef de la collégiale de Six-Fours qualifiée de
« gothique » face à une « romane primitive », alors que seule la datation du noyau au XIe siècle
était établie ; ⑥ un marché propre au quartier de Rocheville, au Cannet. **Aucune n'aurait été vue
par un contrôle automatique, et aucune n'était nécessaire à la phrase qui la portait.**
Cinq prudences assumées dans la copie, à ne pas diluer : ① convention « **accessible depuis** »
plutôt que « situé à » sur tout ce qui relève d'une commune voisine — **Auvers-sur-Oise est une
commune à part entière** en aval de Pontoise et ce qui s'y visite ne se visite pas à Pontoise, la
**Bambouseraie est à Générargues** près d'Anduze et non à Alès, **les Embiez** se rejoignent en
bateau depuis Le Brusc et se visitent comme une excursion à part, le **vignoble du Beaujolais** n'est
pas dans Villefranche ; ② le **fort de Six-Fours reste une emprise militaire** et le **site Airbus de
Blagnac une emprise industrielle en activité** — dits comme tels avant la première phrase attrayante,
même traitement que le CAEA sur la base 106 (batch 28) et la base aérienne 701 de Salon (batch 34) ;
③ l'**accès aux massifs forestiers du Var est réglementé par arrêté préfectoral en saison des feux**,
avec des niveaux évalués quotidiennement pouvant fermer complètement le cap Sicié : le guide dit que
cela se consulte **le matin même** et que passer outre est une infraction, pas une imprudence ;
④ **Le Cannet n'est pas Cannes** — communes distinctes, tissu urbain continu, et **Le Cannet n'a pas
de littoral** ; la section le dit plutôt que de laisser un lecteur réserver une plage ; ⑤ les deux
musées municipaux de Pontoise ayant été réunis sous le nom de **musée d'Art et d'Histoire Pissarro –
Pontoise**, la répartition des collections a bougé et les deux sections concernées renvoient à une
vérification avant déplacement, comme la Mine Témoin qui fonctionne par créneaux. Aucun horaire,
aucun tarif, aucune hauteur inventée ; les seuls chiffres de population sont ceux de l'Insee 2022 lus
dans `data/city-population.json` (Pontoise 31 623, Haguenau 36 070, Alès 45 025,
Villefranche-sur-Saône 36 224, Six-Fours-les-Plages 36 843, Blagnac 27 314, Le Cannet 40 198) —
**pas les `population` approximatives du seed**.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27 : 4 h 30
de génération, `.next` à 25 Go, ENOSPC avant la finalisation, aucun signal utile). Le substitut
prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides FR 1066 →
1073), `search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (0 route FR sans
jumelle), `npm run hreflang:check`, plus le contrôle de lookup / photo ci-dessus et une vérification
d'encodage (accents intacts, aucun `m2` / `EUR` / `deg` ascii, aucun mojibake). Note d'environnement
reconfirmée : le conteneur de routine démarre **sans `node_modules`** — `npm install` d'abord.
Écart FR→EN après ce batch : **7 villes** (pontoise, haguenau, ales, villefranche-sur-saone,
six-fours-les-plages, blagnac, le-cannet) — au-dessus du seuil de ~6, donc **le prochain run doit
être un batch EN**. Rappel de la règle du batch 33 : côté EN, le slug se dérive du **slug de seed tel
quel** (`getEnGuide('things-to-do-in-' + slug + '-2026')`), donc **`things-to-do-in-le-cannet-2026`
garde son article** (comme `le-tampon`, `le-francois`, `les-sables-d-olonne`) et
`things-to-do-in-six-fours-les-plages-2026` garde sa forme complète. Quatre points de vigilance pour
ces jumelles : ① **Le Cannet doit être distingué de Cannes dès la première ligne** — un lecteur
anglophone qui lit « Cannet » lit « Cannes » ; ② **Blagnac a de la matière propre à l'angle
anglophone**, le Concorde étant un programme **franco-britannique** (BAC/Sud-Aviation) et le musée
exposant l'exemplaire d'un avion dont l'autre chaîne était à Filton : le FR reste sobre là-dessus,
même arbitrage qu'avec Jubilee à Dieppe (batch 37) et Cambrai (batch 39) ; ③ la règle des massifs
varois et le **document d'identité obligatoire pour la visite Airbus** sont à écrire comme des règles
opposables, pas comme des conseils ; ④ **Bonnard est mieux connu du public anglophone sous le nom du
groupe des Nabis** et via les collections de la Tate et du MoMA — le lien se pose, sans chiffre.
Pour le batch FR **suivant**, les gisements restants sont Saint-Herblain, Mantes-la-Jolie, Istres,
Melun, Conflans-Sainte-Honorine, Le Bouscat, Talence, Villenave-d'Ornon, Vaulx-en-Velin,
Saint-Priest, Bron.

**Batch 43 — EN, rattrapage de parité, shipped 2026-09-08.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 42 écrites d'un coup dans `data/guides-en.ts` (Pontoise,
Haguenau, Alès, Villefranche-sur-Saône, Six-Fours-les-Plages, Blagnac, Le Cannet). **Compteurs
mesurés : FR 247 (`-a-` strict 239 + 6 en `au-` + 2 en `aux-`), EN 247 — écart nul dans les deux
sens, parité rétablie** (`EN_GUIDES` 864 → 871). La règle du batch 33 avait quelque chose à
arbitrer cette fois : côté EN le slug se dérive du **slug de seed tel quel**, donc
**`things-to-do-in-le-cannet-2026` garde son article** là où le FR contracte en
`10-choses-a-faire-**au**-cannet-2026`, et `things-to-do-in-six-fours-les-plages-2026` garde sa
forme complète. Les 7 guides sont vérifiés **retrouvés par `getEnGuide()` depuis le slug de seed**
et **pourvus de leur photo d'en-tête** (`guideCityPhoto` retrouve bien la forme contractée FR
depuis `le-cannet` — le correctif du batch 32 tient). `metaTitle` 33-46 caractères, `metaDesc`
137-154, 8 sections par guide (la série FR en compte 10, l'EN fusionne les fins de liste),
**0 em-dash** sur les sept réunis. Aucun tag neuf — `search-index.en.json` reste à **114 tags**,
donc aucune page `/tags/` créée ; `sitemap:check` donne EN **28 763 URL**, les seules URL neuves
étant les 7 guides.
⚠️ **Treize figures du texte EN ne sont pas dans les jumelles FR, et c'est délibéré — le contrôle
mécanique les remontera à chaque run, ne pas les « corriger ».** 140 figures, 127 retrouvées ; les
13 restantes sont vérifiées en ligne avant écriture et relèvent de la matière propre à l'angle
anglophone que le batch 42 avait demandée. ① **Pontoise** : `1830`, `1870`, `1871`, `1911`, `1916`
— **la moitié de l'histoire Pissarro est à Londres** et le FR ne le dit pas. Né en **1830** à
Charlotte Amalie (Saint-Thomas, **Antilles danoises**), **citoyen danois toute sa vie** ; quitte
Louveciennes en septembre **1870**, réfugié à **Upper Norwood** dès décembre, **douze huiles** de
ce séjour dont *Fox Hill, Upper Norwood* et *The Avenue, Sydenham*, **à la National Gallery** ;
rentre en juin **1871** devant une maison saccagée par les Prussiens, une grande part de son œuvre
de jeunesse détruite — ce qui donne enfin sa raison au poids des années Pontoise. Son fils
**Lucien** s'installe à Londres en 1890 (date déjà au FR pour Van Gogh à Auvers), devient
**britannique en 1916**, membre fondateur du **Camden Town Group en 1911**. ② **Alès** : `1685`
(révocation de l'édit de Nantes, que le FR nomme sans dater, ajoutée pour situer les Camisards
face au mot **huguenot** que le lecteur connaît) et `1878` — **les Cévennes ont une porte
littéraire anglophone et Alès est en bas** : Stevenson marche du Monastier à **Saint-Jean-du-Gard**
du 22 septembre au **3 octobre 1878**, douze jours et ~120 milles avec Modestine, *Travels with a
Donkey in the Cévennes* paraît l'année suivante, **la dernière partie du livre est au pays des
Camisards** (le fort du Bosquet et les derniers chapitres décrivent la même guerre depuis les deux
camps), et un sentier balisé suit l'itinéraire. ③ **Villefranche** : `1985` — décret fixant le
**Beaujolais nouveau** au **troisième jeudi de novembre**, valable pour les seules appellations
Beaujolais et Beaujolais-Villages ; **les dix crus n'ont pas le droit d'en faire**. ④ **Blagnac** :
`29`, `1962`, `1969` — **le Concorde est franco-britannique** (traité signé à Londres le
**29 novembre 1962**, Sud-Aviation et **BAC**, Rolls-Royce et SNECMA, **deux** chaînes
d'assemblage final, Toulouse et **Filton** près de Bristol, premier vol de Toulouse le **2 mars
1969**, le prototype britannique de Filton quelques semaines plus tard) : l'appareil posé ici est
la moitié française d'un avion dont l'autre moitié était construite chez le lecteur. Même
arbitrage qu'avec Jubilee à Dieppe (batch 37), Cambrai (batch 39) et Béthune (batch 41).
Les quatre points de vigilance du batch 42 sont honorés : **Le Cannet distingué de Cannes dès la
première ligne** puis en section 1 (communes distinctes, tissu continu, **pas de littoral**, donc
pas de plage à réserver) ; **règle des massifs varois** et **document d'identité obligatoire pour
la visite Airbus** écrits comme des **règles opposables** (passer outre une fermeture est une
infraction ; un visiteur hors UE apporte son **passeport**) ; **Bonnard rattaché aux Nabis, à la
Tate et au MoMA sans aucun chiffre**, le lien posé dans le seul sens qui serve — les tableaux qui
voyagent à Londres et à New York sont les tardifs, peints ici. Prudences du FR reprises telles
quelles : **fort de Six-Fours et site Airbus = emprises** dites avant la première phrase
attrayante ; « **accessible depuis** » sur **Auvers-sur-Oise**, la **Bambouseraie à Générargues**,
**les Embiez**, le **vignoble** hors de Villefranche ; **musées de Pontoise réunis** et collections
redistribuées, **Mine Témoin** par créneaux, **musée Bonnard** à accrochage changeant, donc
vérification avant déplacement ; **du palais de Barberousse il ne reste rien**, dit avant qu'on
parte le chercher. Quatre ajouts sans chiffre propres au lecteur étranger : **Saint-Empire** et
**ville libre d'Empire** définis (sans quoi la Décapole ne veut rien dire) ; **Operation Nordwind**
nommée pour l'hiver 1945 sur la Moder (VIIᵉ armée américaine tenant la rive sud sous Haguenau) ;
**Operation Dragoon** pour le débarquement de Provence ; **Toulon** comme base principale de la
flotte française de Méditerranée, ce qui donne sa raison au fort et à la batterie du cap Nègre.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27). Le
substitut prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides EN
864 → 871), `search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**,
0 route FR sans jumelle), `npm run hreflang:check`, plus le contrôle de lookup / photo, le contrôle
de figures ci-dessus et une vérification d'encodage. Note d'environnement reconfirmée : le
conteneur de routine démarre **sans `node_modules`** et en **HEAD détaché** — `git checkout main`
puis `npm install` d'abord.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Gisements inchangés :
Saint-Herblain, Mantes-la-Jolie, Istres, Melun, Conflans-Sainte-Honorine, et les six banlieues de
province jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ; Vaulx-en-Velin, Saint-Priest,
Bron — rappel du batch 28 : **l'Espace Albert Camus et le fort de la ceinture lyonnaise sont à
Bron**, pas à Vénissieux).

**Batch 44 — FR, shipped 2026-09-08 : Melun, Mantes-la-Jolie, Istres, Conflans-Sainte-Honorine,
Bron, Vaulx-en-Velin, Saint-Priest.** Le batch **referme les trois banlieues lyonnaises** en piste
depuis le batch 28 et **quatre des trous touristiques** nommés aux batches 34 et 36 ; il ne reste
de ces listes que Saint-Herblain (écarté au batch 34 faute de matière) et les trois banlieues
bordelaises. **Trois des sept villes n'étaient citées par aucun guide du site** — Mantes-la-Jolie,
Istres, Conflans-Sainte-Honorine — alors que la première porte une collégiale dont le chantier
s'ouvre entre 1140 et 1150, classée MH dès 1840, et la plus importante collection publique
française de Maximilien Luce.
**Compteurs mesurés : FR 254 (`-a-` strict 246 + 6 en `au-` + 2 en `aux-`), EN 247 ; `GUIDES`
1 090 → 1 097.** Aucun nouveau slug hors gabarit. `metaTitle` 32-52 caractères, `metaDesc`
128-148, 10 sections par guide, densité d'accents 0,122-0,167 **par mot** (seuil ascii-strip
0,09), **0 em-dash**. `npm run search-index` relancé (1 097 guides, 263 → **264 tags** : « que
faire dans la Métropole de Lyon » franchit le seuil de 3 guides), d'où `npm run sitemap:check`
(FR **29 193 URL**, EN 28 763).
⚠️ **Le correctif du batch 32 avait un symétrique, resté ouvert un mois, et ce run l'a trouvé en
passant le contrôle de lookup sur les 540 villes au lieu des seules villes du lot.** Le batch 32
traitait le cas où le **guide** contracte un article que le seed porte (`le-cannet` →
`…-au-cannet-2026`). Le cas inverse existe : **le seed élide un article que le guide garde** —
`clermont-herault` au seed contre `10-choses-a-faire-a-clermont-**l**-herault-2026`. Sur 254
guides de la série, **253 seulement étaient atteignables** depuis une page ville, et
`/villes/clermont-herault/a-faire` n'avait ni carte ni photo d'en-tête depuis le batch 11. Nouvel
export **`citySlugElisions()`** (`lib/city-images.ts`), câblé dans `guideCityPhoto()` et dans les
deux pages `a-faire` / `things-to-do`. **L'insertion n'est tentée qu'à une frontière de tiret et
le reste du slug doit correspondre exactement** — un rapprochement sur le seul radical rouvrirait
les faux positifs que le commentaire de `guideCityPhoto` interdit depuis l'origine. Vérifié de
façon exhaustive (540 villes × les deux séries) : aucune ville ne résout deux guides, aucun guide
n'est réclamé par deux villes, **254/254 FR et 247/247 EN atteignables, zéro orphelin**. Second
défaut trouvé dans la foulée : `things-to-do-in-clermont-l-herault-2026` **ne listait pas sa
propre ville** dans `relatedCities`, corrigé.
⚠️ **Six affirmations corrigées avant commit, dont une démentie par une mesure sur nos propres
données** : Melun donnée « la commune de Seine-et-Marne qui gagne le plus d'habitants », vrai **en
rythme** (+10,6 %, 1re des 11) et **faux en nombre** (Meaux +4 434 contre +4 188) — le guide dit
désormais les deux comptes ; Conflans « l'une des plus faibles croissances des Yvelines » alors
qu'elle est **dixième sur seize** ; le musée de la batellerie annoncé « le seul en France » sans
source ; deux durées de trajet non vérifiées (Bron, Vaulx-en-Velin) ; le château de Saint-Priest
donné « le monument le plus substantiel de l'est lyonnais après le fort de Bron ». **Le contrôle
qui a trouvé la première est un tri du département sur le gain absolu, pas une relecture.** Un
réflexe faux écarté par vérification en ligne : la **médiathèque François-Mitterrand n'est pas
dans le château de Saint-Priest** (elle est place Charles-Ottina) ; le château accueille des
concerts et des rendez-vous du conservatoire.
Sept prudences assumées, à ne pas diluer : ① « **accessible depuis** » sur **Vaux-le-Vicomte, qui
est à Maincy** (~8 km de Melun) et se traite comme une sortie d'une journée ; ② la **base aérienne
125 d'Istres-Le Tubé est une emprise militaire**, dite avant toute phrase attrayante, comme la
base 701 de Salon (batch 34) ; ③ la **baignade dans l'étang de Berre est soumise à des arrêtés
d'interdiction temporaire**, écrite comme une règle opposable avec l'affichage sur place qui fait
foi ; ④ le **parc de Parilly est à cheval sur Bron et Vénissieux**, la **centrale de Cusset sur
Villeurbanne et Vaulx-en-Velin** (l'essentiel côté villeurbannais) et le **Grand Parc
Miribel-Jonage sur quatre communes au moins** — aucun n'est attribué à une seule ; ⑤ l'**Espace
Albert-Camus est à Bron**, le rappel du batch 28 devenant ici une section entière ; ⑥ le
**bateau-chapelle Je Sers de Conflans est d'abord un lieu d'accueil social en activité**, pas une
attraction ; ⑦ **cités Tase, Village de Vaulx et Val Fourré décrits sans verdict de sécurité ni
classement**, même cadrage que les Minguettes (batch 28). Aucun horaire, aucun tarif, aucune
figure en `/10` ; les seuls chiffres de population viennent de `data/city-population.json`.
Écart FR→EN après ce batch : **7 villes** — donc **le prochain run doit être un batch EN**. Quatre
points de vigilance : ① **`things-to-do-in-melun-2026` doit poser Melun face à Vaux-le-Vicomte dès
la première ligne**, un lecteur anglophone connaissant le château et ignorant la ville, laquelle
ne le contient pas ; ② **Mantes a de la matière propre à l'angle anglophone** (collégiale
contemporaine de Notre-Dame de Paris, bombardement du 30 mai 1944 relevant de la préparation du
débarquement), même arbitrage qu'avec Dieppe au batch 37 et Cambrai au batch 39 ; ③ arrêtés de
baignade de l'étang de Berre et zones surveillées du Grand Parc à écrire comme des **règles
opposables** ; ④ **« batellerie » n'a pas d'équivalent d'un mot en anglais** (inland waterway
transport), à poser avant usage, de même que « pardon » au sens de pèlerinage fluvial.
Pour le batch FR **suivant** : **287 villes du seed sur 540 restent sans guide tourisme** (mesuré
ce run), les gisements nommés restants étant Saint-Herblain et les trois banlieues bordelaises.

**Batch 45 — EN, rattrapage de parité, shipped 2026-09-08.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 44 écrites d'un coup dans `data/guides-en.ts` (Melun,
Mantes-la-Jolie, Istres, Conflans-Sainte-Honorine, Bron, Vaulx-en-Velin, Saint-Priest).
**Compteurs mesurés : FR 254 (`-a-` strict 246 + 6 en `au-` + 2 en `aux-`), EN 254 — écart nul dans
les deux sens, parité rétablie** (`EN_GUIDES` 871 → 878). Aucun slug hors gabarit : les sept villes
prennent « à » sans contraction, donc la règle du batch 33 (**côté EN le slug se dérive du slug de
seed tel quel**) n'avait rien à arbitrer, et les huit exceptions restent `au-puy-en-velay`,
`au-tampon`, `au-francois`, `au-robert`, `au-lamentin`, `au-cannet`, `aux-abymes`,
`aux-sables-d-olonne`. `metaTitle` 38-47 caractères, `metaDesc` 137-151, 8 sections par guide (la
série FR en compte 10, l'EN fusionne les fins de liste), **0 em-dash** sur les sept réunis. Les 7
guides sont vérifiés **retrouvés par `getEnGuide()` depuis le slug de seed** et **pourvus de leur
photo d'en-tête** (`guideCityPhoto`), contrôle passé sur les 540 villes et pas seulement sur le lot :
aucune ville ne réclame deux guides de la série, aucun des 7 n'est orphelin. Aucun tag neuf —
`search-index.en.json` reste à **114 tags**, donc aucune page `/tags/` créée ; `sitemap:check` donne
EN 28 763 → **28 770 URL**, soit exactement les 7 guides neufs (FR inchangé à 29 193).
⚠️ **Quinze figures du texte EN ne sont pas dans les jumelles FR, et c'est délibéré — le contrôle
mécanique les remontera à chaque run, ne pas les « corriger ».** 217 figures, 202 retrouvées ; les 15
restantes sont vérifiées en ligne avant écriture et relèvent de la matière propre à l'angle
anglophone que le batch 44 avait demandée. ① **Melun** : `1420`. À l'été 1420, quelques semaines
après le traité de Troyes qui le fait héritier du trône de France, **Henri V d'Angleterre met le
siège devant Melun** avec Philippe le Bon, et la garnison tient environ **dix-huit semaines**,
jusqu'en novembre, les deux camps se battant dans des mines sous les murs. La tradition
chroniquistique veut qu'Henri V y ait croisé le fer avec le capitaine **Arnaud Guillaume de
Barbazan** sans le reconnaître, ce qui aurait sauvé la vie de celui-ci à la reddition (frère d'armes
du roi, donc inexécutable ; il finit en cage de fer), et les **vingt soldats écossais** de la
garnison qui refusèrent de se soumettre à Jacques Iᵉʳ d'Écosse, captif d'Henri et emmené sur place,
furent pendus comme traîtres à leur propre roi. ⚠️ **Le jour de la reddition n'est pas cité** : les
sources consultées donnent **17 novembre** et **18 novembre** ; le mois et la durée font consensus,
le jour non, donc on écrit ce qui est établi et rien de plus. Les effectifs (20 000 assiégeants,
700 défenseurs) sont écartés pour la même raison. ② **Mantes-la-Jolie** : `1087`. C'est la matière la
plus forte du batch et le guide FR ne la porte pas du tout : **Guillaume le Conquérant a brûlé Mantes
en 1087 et y a reçu la blessure dont il est mort**, ramené à Rouen où il meurt le **9 septembre 1087**,
vingt et un ans après Hastings. Le mécanisme (projeté contre le pommeau de sa selle) est donné comme
récit de chroniqueurs, pas comme fait établi. Aucun site ne le commémore sur place, et c'est
précisément ce qui vaut d'être dit : la ville est un point de franchissement entre Paris et la
Normandie, assiégée et rebâtie depuis mille ans pour cette seule raison. ③ **Istres** : `3 750`. La
piste de la BA 125 fait environ **3 750 m**, la plus longue d'Europe de l'Ouest, et la NASA la tenait
comme **site d'atterrissage d'urgence transatlantique de la navette spatiale** (le troisième actif,
avec Saragosse et Morón). Le fait **renforce** la prudence FR au lieu de la contredire : rien de tout
cela ne se visite, et la section le dit avant d'être intéressante. ④ **Conflans** : `1879`, `38`,
`300`, `350`. C'est ce qui explique enfin pourquoi toutes les péniches du quai font la même
longueur — la loi du **5 août 1879** portée par **Charles de Freycinet** a standardisé les écluses du
réseau, et le **gabarit Freycinet** fixe le bateau qui y passe : **38,5 m** au plus, **300 à 350
tonnes**. Tout le monde matériel exposé au musée est la culture de ce seul bateau. ⑤ **Bron** :
`1860`, `2000`. Le système **Séré de Rivières** est rendu par son parallèle britannique, les **forts
Palmerston des années 1860**, nés du même réflexe après 1859 et périmés par les mêmes progrès de
l'artillerie ; et en **2000**, pour le centenaire de sa naissance, Satolas a été rebaptisé
**Lyon-Saint-Exupéry**, du nom de l'auteur du *Petit Prince*, né à Lyon — l'aéroport qui a pris le
trafic de Bron porte le nom de l'écrivain lyonnais le plus traduit, et le petit musée du fort garde
la première moitié de cette histoire. ⑥ **Saint-Priest** : `1936`, année du **Front populaire**,
glosé pour un lecteur qui ne connaît ni la coalition ni les congés payés.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **Vaux-le-Vicomte est à Maincy**
(~8 km) et se traite comme une journée à part, pas comme une extension d'une matinée à Melun ; le
**diptyque de Melun n'est pas à Melun** (Anvers et Berlin) ; **« la Jolie » attribué à Henri IV est
une tradition et non un fait établi** ; la **BA 125 d'Istres**, le **site Airbus** et **Renault
Trucks à Saint-Priest** sont des emprises fermées, dites avant toute phrase attrayante ; la
**baignade dans l'étang de Berre est soumise à des arrêtés d'interdiction temporaire** et celle du
**Grand Parc limitée aux zones surveillées**, écrites toutes deux comme des **règles opposables**
avec l'affichage sur place qui fait foi (point de vigilance ③ du batch 44) ; le **parc de Parilly est
à cheval sur Bron et Vénissieux**, la **centrale de Cusset sur Villeurbanne et Vaulx-en-Velin**
(l'essentiel côté villeurbannais) et le **Grand Parc sur quatre communes au moins**, aucun n'étant
attribué à une seule ; l'**Espace Albert-Camus est à Bron** ; le **bateau-chapelle Je Sers est
d'abord un lieu d'accueil social en activité** ; la **médiathèque François-Mitterrand n'est pas dans
le château de Saint-Priest** ; la chapelle **Saint-Sulpice d'Istres** garde sa datation en tradition
non tranchée et le **château du Village de Vaulx** reste « présenté par les associations locales
comme » le plus ancien ; et **cités Tase, Village de Vaulx et Val Fourré sont décrits sans verdict de
sécurité ni classement**.
Ajouts sans chiffre propres au lecteur étranger : **« batellerie » posé avant usage** (aucun
équivalent d'un mot en anglais — *inland waterway transport*, plus proche du *canal trade*) et
**« pardon »** glosé en pèlerinage-fête, les deux points de vigilance ④ du batch 44 ; **collégiale**,
**hôtel-Dieu**, **oppidum**, **étang** (lagune saumâtre, pas la Méditerranée ouverte) et **pisé**
(rammed earth, cousin du cob anglais) définis en une incise ; la **gendarmerie** présentée comme une
force de police à statut militaire sans équivalent britannique ou américain, ce qui donne son sujet
au musée ; **soie artificielle = rayon**, donc la TASE rend lisible la reconversion chimique d'une
ville de la soie ; le **musée de la batellerie** rapproché des waterways museums des Midlands ;
**Langemarck**, nom de baptême de la coque du Je Sers, situé près d'Ypres ; **Le Corbusier, Le Nôtre,
Le Vau et Le Brun** rattachés à Versailles pour situer Vaux ; et **Bron et Saint-Priest présentées
comme des bases bon marché pour visiter Lyon**, ce qui est la vraie raison pour laquelle un
anglophone taperait ces noms.
🔧 **Correctif de tag au passage** : le guide `things-to-do-in-pontoise-2026` (batch 43) portait
`"ile de france"` avec des espaces là où le corpus écrit `"ile-de-france"` (32 occurrences) —
consolidé, sinon la variante montait vers le seuil de 3 guides et créait une page `/tags/` doublon à
côté de `/tags/ile-de-france`. L'autre occurrence (ligne 1660, guide « paris suburbs ») relève d'une
autre série et n'est pas touchée.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27 : 4 h 30
de génération, `.next` à 25 Go, ENOSPC avant la finalisation, aucun signal utile). Le substitut
prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides EN 871 → 878),
`search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**, 0 route FR sans
jumelle), `npm run hreflang:check`, plus le contrôle de lookup / photo, le contrôle de figures
ci-dessus et une vérification d'encodage (accents intacts, aucun `m2` / `EUR` / `deg` ascii, aucun
mojibake, aucune guillemet courbe). Note d'environnement reconfirmée : le conteneur de routine
démarre **sans `node_modules`** — `npm install` d'abord.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). **287 villes du seed sur
540 restent sans guide tourisme** (mesure du batch 44, inchangée ce run puisque aucun guide FR n'a
été écrit) ; les gisements nommés restants sont **Saint-Herblain** (écarté au batch 34 faute de
matière) et les **trois banlieues bordelaises** jamais faites (Villenave-d'Ornon, Talence,
Le Bouscat), à compléter par de nouveaux trous mesurés — rappel des batches 26, 32, 34, 36, 40 et
42 : **on choisit par matière touristique réelle, pas par inertie de liste.**

**Batch 46 — FR, shipped 2026-09-10 : Verdun, Vaison-la-Romaine, Senlis, Dinard, Briançon, Figeac,
Granville.** Sept villes, sept régions, et un batch qui **écarte une fois de plus la liste de
gisements** au nom de la règle des batches 26, 32, 34, 36, 40 et 42 : les trois banlieues bordelaises
(Villenave-d'Ornon, Talence, Le Bouscat) et Saint-Herblain **restent en piste et n'ont toujours pas
été faites**, parce que le comptage de ce run donne **286 villes du seed sur 540 sans guide
tourisme** et que sept trous majeurs y dormaient : le champ de bataille le plus visité de France
(Verdun), le plus vaste site archéologique antique accessible du pays (Vaison), l'une des toutes
premières cathédrales gothiques (Senlis), le plus important ensemble conservé de villas Belle Époque
(Dinard), des fortifications inscrites à l'UNESCO en 2008 (Briançon), la ville natale de Champollion
(Figeac) et la maison d'enfance de Christian Dior (Granville). **Aucune des sept n'était citée par un
guide de la série.**
**Compteurs mesurés : FR 261 (`-a-` strict 253 + 6 en `au-` + 2 en `aux-`), EN 254 ; `GUIDES` 1 105 →
1 112.** Aucun nouveau slug hors gabarit : les huit exceptions restent `au-puy-en-velay`, `au-tampon`,
`au-francois`, `au-robert`, `au-lamentin`, `au-cannet`, `aux-abymes`, `aux-sables-d-olonne`.
`metaTitle` 34-45 caractères, `metaDesc` 147-158, 10 sections par guide, densité d'accents
0,124-0,160 **par mot** (seuil ascii-strip 0,09), **0 em-dash** sur les sept réunis.
`npm run search-index` relancé (1 112 guides, 265 → **266 tags** : « que faire dans le Vaucluse »
franchit le seuil de 3 guides et crée `/tags/que-faire-dans-le-vaucluse`), d'où le passage de
`npm run sitemap:check` (FR **29 211 URL**, EN 28 786). Contrôle de lookup / photo passé **sur les
540 villes et les 261 guides de la série**, pas seulement sur le lot : **261/261 atteignables, 0
orphelin, 0 collision, 0 guide sans photo d'en-tête**.
⚠️ **Le fait le plus utile du batch est une correction de géographie, et c'est le cœur du guide
Verdun : le champ de bataille n'est pas à Verdun.** L'**ossuaire de Douaumont** est sur le champ de
bataille, à côté de la **nécropole nationale créée en 1923 sur 14,438 ha pris sur le territoire de
Fleury-devant-Douaumont**, et le **Mémorial de Verdun est à Fleury-devant-Douaumont**, pas dans la
ville. Un lecteur qui descend en gare de Verdun en pensant arriver au pied de l'ossuaire a une
dizaine de kilomètres et un véhicule d'écart avec son programme : le guide le dit dans une section
entière (nº 7) avant de décrire quoi que ce soit, même traitement que le bois de Vincennes au
batch 32 et que le parc du Peuple de l'herbe au batch 38.
⚠️ **Deuxième piège de calendrier, du genre de celui du festival de cerf-volant de Dieppe (batch 36) :
il n'y a pas de Choralies à Vaison-la-Romaine en 2026.** Le rassemblement choral du théâtre antique
est **triennal** ; la 25ᵉ édition s'est tenue **du 30 juillet au 17 août 2025** et la suivante est
annoncée **du 26 juillet au 3 août 2028**. Une page qui promettrait une édition 2026 recopierait
l'édition passée. La section nº 9 du guide Vaison est écrite pour dire cette absence.
Faits vérifiés en ligne avant rédaction et qui portent les guides : cathédrale de Verdun **consacrée
par le pape Eugène III le 11 novembre 1147**, chœur oriental repris par l'architecte **Garin de 1136
à 1160** (portails du Lion et de Saint-Jean, crypte-halle), **classée MH le 30 octobre 1906** et le
**cloître le 13 juillet 1907** ; **citadelle souterraine creusée de 1886 à 1893 sous 16 m de roche**,
**près de 4 km de galeries en 1914, 7 km en fin de guerre**, 2 000 hommes, et **désignation du Soldat
inconnu le 10 novembre 1920** (huit cercueils amenés la veille) ; **porte Chaussée 1380** ; **monument
à la Victoire** ouvert en chantier **1926**, inauguré le **23 mars 1929**, **73 marches**, architectes
**Léon Chesnay et Louis-Alfred Berthémy**, sculpture de **Jean Boucher** ; **bataille du 21 février au
18 décembre 1916**, **fort de Douaumont pris le 25 février 1916**, **Fleury seize fois repris entre
juin et août 1916**, village jamais reconstruit et pourtant toujours une commune ; **ossuaire**
première pierre le **22 août 1920**, inauguré le **7 août 1932**, architectes **Léon Azéma, Max Edrei
et Jacques Hardy** ; **Mémorial de Verdun** première pierre en **juin 1963**, campagne de travaux
achevée en **2016** ; **dragée** rattachée par la tradition à **1220**, forme lisse vers **1600**,
**maison Braquier née en 1783**, usine sous **Léon Braquier en 1871** ; parc archéologique de Vaison
**une quinzaine d'hectares de vestiges dont huit ouverts au public** sur **Puymin et La Villasse**,
**maison à l'Apollon lauré ~2 000 m²**, **maison à la Pergola ~3 000 m² sur trois niveaux**, **théâtre
antique dégagé en 1907 par le chanoine Joseph Sautel**, **5 000 places** ; **cathédrale
Notre-Dame-de-Nazareth** du XIIe, **nouvelle cathédrale décidée en ville haute en 1464** et ancienne
abandonnée à la fin du XVe (c'est ce délaissement qui l'a conservée) ; **château des comtes de
Toulouse** au XIIe ; **crue de l'Ouvèze le 22 septembre 1992, +17 m**, **seul le pont romain a tenu**
des trois ponts, précédent d'une **délibération municipale d'août 1616** sur la réparation du même
parapet ; **cathédrale de Senlis 1153-1191**, **enceinte gallo-romaine du IIIe siècle** d'environ
**800 m** en appareil alterné pierre/brique, **une trentaine de tours à l'origine** ; **arènes du
Iᵉʳ siècle, ~8 000 spectateurs, redécouvertes en 1865** ; **Hugues Capet élu roi des Francs en 987 à
Senlis**, château **rebâti sous Louis VI vers 1130** sur la muraille antique, séjours royaux jusqu'à
**Henri IV** ; **prieuré Saint-Maurice fondé en 1264 par Louis IX** pour des reliques de la septième
croisade, **seule l'aile est du cloître** subsiste, **musée de la Vénerie** dans la résidence d'abbé
commendataire du début du XVIIIe ; **villa Eugénie bâtie en 1868 par l'architecte Jean Pichot** pour
un couple impérial **qui n'y est jamais venu**, acquise en **1872** par Pierre Levavasseur, léguée à
Dinard en **1873**, mairie en **1893**, bibliothèque de **1967 à 1984**, musée **depuis le 13 juillet
1985** ; **villas de villégiature 1870-1914** ; **promenade du Clair de Lune aménagée dans les années
1930** ; **festival du film britannique et irlandais, 37ᵉ édition du 7 au 11 octobre 2026**, **Hitchcock
d'or** ; **Briançon 1 326 m**, **fortifications de Vauban inscrites à l'UNESCO en 2008** avec
Mont-Dauphin (enceinte urbaine, forts des Salettes, des Trois-Têtes, du Randouillet et du Dauphin,
communication Y, pont d'Asfeld) ; **collégiale** sur plans d'**Isaac Robelin revus par Vauban**,
chantier **1703-1718**, consacrée en **1726** par **Mgr de Tencin**, érigée en collégiale une
vingtaine d'années plus tard ; **pont d'Asfeld** sur la **Durance**, chantier ouvert **1729**,
première pierre le **20 avril 1730 à 11 h**, voûte fermée le **24 août**, achevé en **1731** ;
**Champollion né à Figeac le 23 décembre 1790**, **musée ouvert en 1986**, **« Les Écritures du
Monde » depuis 2007**, **~600 objets**, écriture apparue il y a **~5 300 ans** ; **place des Écritures
créée en 1991** pour le bicentenaire, œuvre **« Ex-Libris, J.-F. Champollion » de Joseph Kosuth**,
commande du **Fonds national d'art contemporain en 1990**, dalle de granit noir **~11,20 m × 8,60 m**
gravée de l'inscription trilingue ; **abbaye Saint-Sauveur fondée vers 830 par Pépin Iᵉʳ
d'Aquitaine** ; **aiguilles du Cingle et de Lissac, fin du XIIIe siècle** ; **Granville fondée par les
Anglais en 1440**, qui fortifient le promontoire et ouvrent le chantier de **Notre-Dame-du-Cap-Lihou**
avec du **granit des îles Chausey**, pour tenir une place face au **Mont-Saint-Michel qui leur
résiste** ; **Grande Porte de 1625** ouvrant sur le **logis du Roi** ; **musée Christian Dior**, seul
musée labellisé **Musée de France consacré à un couturier**, dans la **villa Les Rhumbs**, **jardin
dessiné par Madeleine Dior**, **exposition temporaire chaque été depuis 1997** ; **carnaval inscrit au
patrimoine culturel immatériel de l'UNESCO le 30 novembre 2016** (11ᵉ session, Addis-Abeba), origine
liée au **départ des marins pour Terre-Neuve**, une quarantaine de chars, de l'ordre de **100 000**
spectateurs.
⚠️ **Trois chiffres volontairement omis, parce que les sources divergent — ne pas les « compléter » au
prochain run.** ① Le **décompte des victimes de la crue de Vaison** : les sources consultées donnent
« plus de 40 », « 46 », et « 38 dans le Haut-Vaucluse dont 34 à Vaison » ; le guide écrit « plusieurs
dizaines de morts dans le Haut-Vaucluse » et **dit explicitement qu'il ne tranche pas ce que les
statistiques officielles n'ont pas tranché**. ② Le **nombre de tours subsistantes du rempart de
Senlis** : 15 selon une source, 16 selon une autre, sur une trentaine à l'origine — le guide écrit
« une moitié environ ». ③ Le **nombre de villas Belle Époque de Dinard** et la part protégée MH : le
chiffre de ~400 circule sans source primaire, le guide écrit « plusieurs centaines » et « une partie
substantielle ». Même doctrine que le FPU en ALD du glossaire et que le jour de la reddition de Melun
au batch 45 : **une phrase sans chiffre vaut mieux qu'un chiffre faux.**
⚠️ **Quatre affirmations écrites au premier jet et corrigées avant commit, dont une démentie par une
mesure sur nos propres données** : ① Senlis présentée comme une ville qui profite de la proximité
parisienne, alors que le tri du département sur la population Insee la donne **dernière des sept
communes de l'Oise du corpus** (−3,8 % depuis 2011), **derrière Chantilly** (−2,0 %) pendant que
Creil gagne **8,2 %** — les villes-cartes-postales de l'Oise se vident quand les villes de travail se
remplissent, et le guide dit désormais ce comptage ; ② Briançon donnée en croissance de station de
montagne alors qu'elle **perd 1 202 habitants entre 2016 et 2022** après en avoir gagné entre 2011 et
2016, dernière des trois communes des Hautes-Alpes — le guide dit le recul **et** la réserve du
recensement, qui compte des résidents et non des lits ; ③ Figeac annoncée « première du Lot » sans
dire que c'est **la première d'un département qui recule** (−0,2 % contre −1,6 % à Cahors et −9,3 % à
Gourdon) ; ④ une section Briançon intitulée « Le téléphérique » dont le corps ne parlait d'aucun
téléphérique, renommée « Les cinq vallées et Serre Chevalier ». **Le contrôle qui a trouvé les trois
premières est un tri complet du département sur la population Insee, pas une relecture.**
Six prudences assumées dans la copie, à ne pas diluer : ① convention « **accessible depuis** » plutôt
que « situé à » sur **l'ossuaire, le Mémorial, les forts et Fleury** (Verdun), **Saint-Malo** depuis
Dinard, le **parc national des Écrins** et les **Grands Bains du Monêtier**, qui sont au
Monêtier-les-Bains (Briançon), les **îles Chausey** et le **Mont-Saint-Michel** depuis Granville,
**Saint-Cirq-Lapopie et la vallée du Célé** depuis Figeac ; ② **la pierre de Rosette n'est pas à
Figeac** — elle est au British Museum depuis 1802, la ville a la maison natale du déchiffreur et une
reproduction monumentale, et la section nº 3 le dit **avant** que quelqu'un ne fasse le voyage pour la
mauvaise raison, comme l'Hermione absente de Rochefort au batch 36 ; ③ **les villas de Dinard sont des
propriétés privées**, regardées depuis la rue, écrit comme une règle et non comme un conseil ;
④ **falaises et bords de mer** — pointe du Roc à Granville, sentier des douaniers à Dinard — donnés
avec le balisage qui fait foi et le rappel que le **marnage de la baie du Mont-Saint-Michel est parmi
les plus forts d'Europe** ; ⑤ **haute montagne** à Briançon : cols d'altitude fermés l'hiver (ce qui
fausse tout calculateur d'itinéraire), orages d'après-midi la règle en été, réglementation de cœur de
parc national **opposable** ; ⑥ **la Grande Gargouille de Briançon n'est pas une gargouille** mais la
grand-rue et son canal central à ciel ouvert, dispositif de lutte contre l'incendie — même genre de
désamorçage que « faire ripaille » au batch 40. Aucun horaire, aucun tarif, aucune figure en `/10` ;
cinq équipements à ouverture instable sont explicitement renvoyés à une vérification préalable (Centre
mondial de la paix, monument à la Victoire, musée de la villa Eugénie, arènes de Senlis et les trois
musées municipaux, musée Christian Dior hors saison d'exposition). Les seuls chiffres de population
sont ceux de l'Insee 2022 lus dans `data/city-population.json` (Verdun 16 610, Vaison-la-Romaine
5 920, Senlis 15 238, Dinard 10 407, Briançon 10 748, Figeac 9 757, Granville 12 799) — **pas les
`population` approximatives du seed**.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27 : 4 h 30 de
génération, `.next` à 25 Go, ENOSPC avant la finalisation, aucun signal utile). Le substitut prescrit
passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides FR 1 105 → 1 112),
`search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**, 0 route FR sans
jumelle), `npm run hreflang:check`, plus le contrôle de lookup / photo exhaustif ci-dessus et une
vérification d'encodage (accents intacts, `m²` conservé, aucun `m2` / `EUR` / `deg` ascii, aucun
mojibake). Note d'environnement reconfirmée : le conteneur de routine démarre **en HEAD détaché et
sans `node_modules`** — `git checkout main` puis `npm install` d'abord.
Écart FR→EN après ce batch : **7 villes** (verdun, vaison-la-romaine, senlis, dinard, briancon,
figeac, granville) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**. Rappel
de la règle du batch 33 : côté EN, le slug se dérive du **slug de seed tel quel**
(`getEnGuide('things-to-do-in-' + slug + '-2026')`), et aucun de ces sept ne porte d'article, donc
rien à arbitrer — noter seulement que le slug de seed est **`briancon`** sans cédille. Quatre points
de vigilance pour ces jumelles : ① **Verdun est de l'histoire américaine et britannique autant que
française pour un lecteur anglophone** — le nom « Verdun » est un repère de la Première Guerre mondiale
dans tout le monde anglophone, et la jumelle a de la matière propre là où le FR reste sobre (même
arbitrage qu'avec Jubilee à Dieppe au batch 37, Cambrai au batch 39, Béthune au batch 41 et Blagnac au
batch 43) ; ② **`things-to-do-in-dinard-2026` doit poser la fondation britannique de la station dès
l'intro** — Dinard a été faite par une clientèle britannique et son festival de cinéma britannique en
est l'héritier direct, c'est le meilleur angle anglophone du batch ; ③ **Granville a été fondée par les
Anglais en 1440 pour assiéger le Mont-Saint-Michel**, fait que le FR porte déjà et qu'un lecteur
britannique lira autrement ; ④ **la pierre de Rosette au British Museum** est, côté EN, le point de
départ naturel du guide Figeac et non une note en fin de section.
Pour le batch FR **suivant**, il reste **279 villes du seed sur 540 sans guide tourisme** (286 avant ce
run). Les gisements nommés restants sont **Saint-Herblain** (écarté au batch 34 faute de matière) et
les **trois banlieues bordelaises** jamais faites (Villenave-d'Ornon, Talence, Le Bouscat), à compléter
par les trous mesurés ce run et non retenus faute de place, tous vérifiés présents au seed et sans
guide : **Langres** (remparts complets, ville natale de Diderot), **Saint-Rémy-de-Provence** (Glanum,
Van Gogh), **La Baule**, **Morlaix** (viaduc), **Sélestat** (bibliothèque humaniste), **Dax**,
**Obernai**, **Aubusson** (tapisserie), **Saverne**, **Vendôme**, **Douarnenez**, **Quiberon** et
**Céret**.

**Batch 47 — EN, rattrapage de parité, shipped 2026-09-11.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 46 écrites d'un coup dans `data/guides-en.ts` (Verdun,
Vaison-la-Romaine, Senlis, Dinard, Briançon, Figeac, Granville). **Compteurs mesurés : FR 261
(`-a-` strict 253 + 6 en `au-` + 2 en `aux-`), EN 261 — écart nul dans les deux sens, parité
rétablie** (`EN_GUIDES` 894 → 901). Les 7 villes manquantes ont été **mesurées par diff des deux
listes de slugs** après application de la table de correspondance des articles contractés, pas
recopiées du journal. Aucun slug hors gabarit : les sept prennent « à » sans contraction, donc la
règle du batch 33 (**côté EN le slug se dérive du slug de seed tel quel**) n'avait rien à
arbitrer, et le slug de seed est bien `briancon` sans cédille. `metaTitle` 34-45 caractères,
`metaDesc` 141-149, 8 sections par guide (la série FR en compte 10, l'EN fusionne les fins de
liste), **0 em-dash** sur les sept réunis. Aucun tag neuf — `search-index.en.json` reste à
**114 tags**, donc aucune page `/tags/` créée ; `sitemap:check` donne EN 28 786 → **28 793 URL**,
soit exactement les 7 guides neufs (FR inchangé à 29 211). Contrôle de lookup / photo passé **sur
les 540 villes et les 261 guides de la série** : **261/261 atteignables, 0 orphelin, 0 collision**.
⚠️ **Un contrôle de parité doit appeler le même résolveur que la page** (`getEnGuide(slug)` puis
`citySlugElisions(slug)`) : la première version du script de ce run testait le seul slug de seed
et a signalé `things-to-do-in-clermont-l-herault-2026` en faux orphelin, c'est-à-dire exactement le
défaut que le batch 44 avait fermé.
⚠️ **Seize figures du texte EN ne sont pas dans les jumelles FR, et c'est délibéré — le contrôle
mécanique les remontera à chaque run, ne pas les « corriger ».** 202 figures, 186 retrouvées ; les
16 restantes sont vérifiées en ligne avant écriture et relèvent de la matière propre à l'angle
anglophone que le batch 46 avait demandée. ① **Verdun** : `1918`, `26 000`, `14 246`. Deux sections
que le FR n'a pas. La Somme était prévue pour le **1ᵉʳ août 1916** et a été **avancée au 1ᵉʳ
juillet** à la demande française pour détourner des divisions allemandes de Verdun — le pire jour
de l'armée britannique a eu lieu ce jour-là à cause de ces crêtes. Et l'offensive **Meuse-Argonne**
du **26 septembre 1918** à l'armistice a engagé ~**1,2 million** d'Américains, coûté plus de
**26 000** vies (bataille la plus meurtrière de l'histoire des États-Unis), le cimetière de
**Romagne-sous-Montfaucon** portant **14 246** sépultures, le plus grand cimetière militaire
américain d'Europe. ⚠️ Il est à **une quarantaine de kilomètres au nord-ouest**, donc **bien
au-delà des sites de 1916** : traité en **troisième** sortie, dans la continuité de la prudence qui
structure le guide FR. ② **Dinard** : `1871` ×2, `1887`. **Saint Bartholomew's**, bâtie en **1871**
à l'angle de la rue des Cèdres et de la **rue Faber**, premier office le **16 novembre 1871**,
**première et toujours seule église anglicane de l'ouest de la France** ; la rue porte le nom des
**Faber**, Américains installés au milieu du siècle qui revendaient du terrain à leurs amis
anglais, assez nombreux pour justifier un consul britannique. **Dinard Golf**, **1887**, dessiné
par **Tom Dunn**, **deuxième plus ancien club de France après Pau** — ⚠️ à
**Saint-Briac-sur-Mer**, donc « accessible depuis ». ⚠️ La **date de fondation de la station est
volontairement omise** (sources entre 1835 et le début des années 1850) : même doctrine que le
décompte des victimes de la crue de Vaison. ③ **Figeac** : `1819`, `1822`, `1823` — **Thomas
Young**, la moitié anglaise du déchiffrement, que rien à Figeac ne mentionne. ④ **Granville** :
`1947` — **Dior** daté par le **12 février 1947** et **Carmel Snow** du *Harper's Bazaar*, qui fixe
le nom anglais de la silhouette ; et la **liaison saisonnière Granville-Jersey** (~**1 h 20**,
piétons seulement) écrite comme **règle opposable**, Jersey étant une **dépendance de la Couronne
ni au Royaume-Uni ni dans l'UE**. ⑤ **Vaison** : `13`, `1967` — **Tom Simpson mort sur le Ventoux
le 13 juillet 1967**, mémorial à un kilomètre sous le sommet, ⚠️ « accessible depuis » avec les
ascensions de **Bédoin, Malaucène et Sault**, communes distinctes. ⑥ **Briançon** : `1911`,
`2 058` — **Galibier** franchi par le Tour le **10 juillet 1911**, atteint par le **col du Lautaret
à 2 058 m**.
⚠️ **Une section neuve pour Senlis (`1914` ×2), datée sans être chiffrée** : occupation le **1ᵉʳ
septembre 1914**, le maire **Eugène Odent** fusillé le **2 septembre** avec un groupe d'habitants,
contre-attaque franco-britannique de la **Marne du 6 au 12 septembre**. **Le nombre de fusillés
n'est pas cité** (sources : cinq, six, « plusieurs »), et le guide **n'écrit pas** que Senlis fut le
point le plus avancé de la marche allemande — affirmation qui circule et qu'aucune source consultée
n'établit pour cette commune.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **champ de bataille pas à
Verdun**, **pas de Choralies en 2026**, **décompte de la crue de Vaison non tranché**, **villas de
Dinard propriétés privées**, arènes de Senlis / trois musées municipaux / villa Eugénie / Centre
mondial de la paix / monument à la Victoire / musée Dior hors saison renvoyés à vérification,
**Écrins et Grands Bains du Monêtier accessibles depuis Briançon** avec réglementation de cœur de
parc **opposable**, **Grande Gargouille qui n'est pas une gargouille**, Saint-Malo / Chausey /
Saint-Cirq-Lapopie en excursions, falaises et bords de mer avec le balisage qui fait foi et le
**marnage de la baie du Mont-Saint-Michel parmi les plus forts d'Europe**, **aiguilles de Figeac**
laissées à leur hypothèse non tranchée.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27). Le
substitut prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides EN
894 → 901), `search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**),
`npm run hreflang:check`, plus le contrôle de lookup / photo, le contrôle de figures ci-dessus et
une vérification d'encodage. ⚠️ Note d'environnement élargie : outre le **HEAD détaché et
l'absence de `node_modules`**, **un fragment d'objet laissé dans `scratch/*.ts` fait sortir `tsc` en
rouge sur des erreurs de syntaxe qui ne sont pas des régressions** — les brouillons d'insertion vont
hors du dépôt.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). **279 villes du seed sur
540 restent sans guide tourisme** ; gisements inchangés : Saint-Herblain, les trois banlieues
bordelaises (Villenave-d'Ornon, Talence, Le Bouscat) et les trous listés au batch 46 (Langres,
Saint-Rémy-de-Provence, La Baule, Morlaix, Sélestat, Dax, Obernai, Aubusson, Saverne, Vendôme,
Douarnenez, Quiberon, Céret).

**Batch 48 — FR, shipped 2026-09-15 : Langres, Saint-Rémy-de-Provence, La Baule, Morlaix, Dax,
Vendôme, Céret.** Sept villes, sept régions, prises dans le vivier laissé par les batches 46 et 47 ;
**trois n'étaient citées par aucun guide du site** (Langres, Saint-Rémy-de-Provence, La Baule), ce
qui était le vrai trou du corpus. **Compteurs mesurés : FR 268 (`-a-` strict 260 + 6 en `au-` + 2 en
`aux-`), EN 261 ; `GUIDES` 1 129 → 1 136.** Aucun nouveau slug hors gabarit ; ⚠️ noter que le slug de
seed de La Baule est **`la-baule`** alors que le nom du seed est « La Baule-Escoublac » — le guide se
dérive du slug, côté FR comme côté EN. `metaTitle` 31-42 caractères, `metaDesc` 139-153, 10 sections
par guide, densité d'accents 0,139-0,167 **par mot** (seuil ascii-strip 0,09), **0 em-dash**.
`npm run search-index` relancé (1 136 guides, **268 tags, inchangé**, donc aucune page `/tags/`
créée) et `npm run sitemap:check` repassé (FR **29 239 URL**, EN 28 825). Contrôle de lookup / photo
passé **sur les 540 villes et les 268 guides de la série** : 268/268 atteignables, 0 orphelin,
0 collision, 0 guide sans photo d'en-tête.
⚠️ **Le fait le plus utile du batch est une correction d'attribution** : des toiles de Picasso
longtemps rattachées au **Pont-Neuf de Paris** représentent le **pont du chemin de fer de Céret**,
inauguré en 1889, que les habitants appelaient **el pont nou** — le malentendu tient à une
traduction. Et la **gare de Céret, ouverte en 1889, est fermée aux voyageurs depuis 1940** : il n'y a
pas de train pour Céret, la gare utile est Perpignan. Deuxième correction du même genre : **La Baule
n'est pas née d'une plage mais d'un désastre** — le premier village d'Escoublac a été submergé par le
sable et la commune s'est rebâtie **un kilomètre à l'intérieur des terres en 1779**, la forêt de pins
ayant été plantée au milieu du XIXe siècle **pour arrêter ce sable**.
⚠️ **Deux affirmations corrigées avant commit, toutes deux démenties par une mesure sur nos propres
données** : Morlaix donnée « la moins chère des cinq communes du Finistère, devant Douarnenez » alors
que c'est **l'inverse** (Douarnenez T3 690 € et m² 1 600 € contre 710 € et 1 700 €) ; et le château du
Taureau placé « à une vingtaine de kilomètres » de Morlaix, distance jamais vérifiée, retirée. **Le
contrôle qui a trouvé la première est un tri du département sur le loyer et le prix au m², pas une
relecture.**
⚠️ **Deux chiffres volontairement omis, sources divergentes — ne pas les « compléter »** : le nombre
de tours encore debout sur l'enceinte de Langres (7 ou 12 selon ce qu'on appelle une tour ; le guide
publie la divergence et s'en tient aux 3,5 km de la boucle) et le nombre d'établissements thermaux de
Dax (14, 15 ou 16 ; le guide écrit « une quinzaine »). Même doctrine qu'au batch 46.
Prudences assumées à ne pas diluer : **Saint-Paul-de-Mausole est toujours une clinique psychiatrique
en activité**, dit avant toute phrase sur Van Gogh ; **aucune des toiles peintes à Saint-Rémy n'y est
restée** (La Nuit étoilée est au MoMA), dit avant que quelqu'un fasse le voyage pour la mauvaise
raison ; **on ne se baigne pas dans la fontaine chaude de Dax** (64 °C) et la feria est traitée en
fait pratique, la corrida nommée comme une pratique encadrée et contestée que le guide ne tranche
pas ; la **maison dite de la Duchesse Anne** à Morlaix et la **légende du diable** à Céret sont
ramenées à leur statut de tradition ; les **cerises de Céret ne sont plus systématiquement les
premières de France** (Saint-Gilles dans le Gard les devance certaines années) ; et la convention
« **accessible depuis** » tient partout (quatre lacs depuis Langres, Les Baux depuis Saint-Rémy,
Le Pouliguen, Pornichet et Guérande depuis La Baule, château du Taureau depuis Morlaix, côte landaise
depuis Dax, Blois et Amboise depuis Vendôme, Canigou depuis Céret).
⚠️ Egress : **`fr.wikipedia.org` répond 403 CONNECT depuis la routine**, la recherche web fonctionne
en revanche — les faits ont été recoupés sur plusieurs résultats plutôt que sur une fiche unique.
Écart FR→EN après ce batch : **7 villes** — donc **le prochain run doit être un batch EN**. Quatre
points de vigilance : ① **`things-to-do-in-dax-2026` est ambigu en anglais** (*dax* est l'indice
boursier allemand), l'intro doit poser la ville dès la première ligne, comme Orange au batch 37 et
Bergerac au batch 41 ; ② **Van Gogh est de l'histoire de l'art anglophone** (MoMA, Getty), donc la
jumelle Saint-Rémy a de la matière propre, à condition de garder intacte la prudence sur la clinique ;
③ **La Baule se lit comme un resort victorien** côté anglophone, et la désambiguïsation entre la baie
et les trois communes doit être posée tôt ; ④ **Céret demande la correction du pont neuf en première
ligne**, c'est dans la littérature anglophone sur le cubisme que l'erreur circule le plus.
Pour le batch FR **suivant**, il reste **271 villes du seed sur 540 sans guide tourisme** (278 avant
ce run) ; gisements nommés restants, tous vérifiés présents au seed et sans guide : Saint-Herblain,
les trois banlieues bordelaises (Villenave-d'Ornon, Talence, Le Bouscat) et le reliquat du vivier du
batch 46 — Sélestat, Obernai, Saverne, Aubusson, Douarnenez, Quiberon.

**Batch 49 — EN, rattrapage de parité, shipped 2026-09-17.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 48 écrites d'un coup dans `data/guides-en.ts` (Langres,
Saint-Rémy-de-Provence, La Baule, Morlaix, Dax, Vendôme, Céret). **Compteurs mesurés : FR 268,
EN 268 — écart nul dans les deux sens, parité rétablie** (`EN_GUIDES` 941 → 948). Les 7 villes
manquantes ont été **mesurées par diff des deux listes de slugs** après application de la table de
correspondance des articles contractés, pas recopiées du journal. Aucun slug hors gabarit : les
sept prennent « à » sans contraction, donc la règle du batch 33 (**côté EN le slug se dérive du
slug de seed tel quel**) n'avait rien à arbitrer — noter seulement que le slug de seed de La Baule
est **`la-baule`** alors que le nom du seed est « La Baule-Escoublac ». `metaTitle` 41-49
caractères, `metaDesc` 141-152, 8 sections par guide (la série FR en compte 10, l'EN fusionne les
fins de liste), **0 em-dash** sur les sept réunis. Contrôle de lookup / photo passé **sur les 540
villes et les 268 guides de la série**, avec le **même résolveur que la page** (`getEnGuide(slug)`
puis `citySlugElisions(slug)`, la leçon du batch 47) : **268/268 atteignables, 0 orphelin, 0
collision**. Aucun tag neuf — `search-index.en.json` reste à **114 tags**, donc aucune page
`/tags/` créée ; `sitemap:check` donne EN **28 840 URL**, soit exactement les 7 guides neufs
(FR inchangé à 29 248).
⚠️ **Onze figures du texte EN ne sont pas dans les jumelles FR, et c'est délibéré — ne pas les
« corriger ».** 137 figures, 126 retrouvées ; les 11 restantes sont vérifiées en ligne avant
écriture. ① **Langres** : `1917`, `1918`, `28`, `1919` — **c'est la ville où l'armée américaine a
formé ses officiers d'état-major**, Army General Staff College organisé le **28 novembre 1917**,
**75** élèves à la première promotion, quatre cours de trois mois, dissous en **décembre 1918**,
au milieu d'une grappe d'écoles de l'AEF de **1917 à 1919** ; **Pershing n'était pas ici**, son GHQ
était à **Chaumont depuis le 1ᵉʳ septembre 1917** (commune à part → « accessible depuis »). Le
guide dit que **c'est du contexte et non un musée**. ② **Saint-Rémy** : `1990`, `1987`, `53.9` —
**Les Iris au Getty de Los Angeles depuis 1990**, vendue aux enchères en **1987** pour **53,9 M$**,
commencée dans le jardin clos le lendemain de l'arrivée ; le FR ne cite que *La Nuit étoilée* au
MoMA. ③ **La Baule** : `1940`, `1944`, `1945` — le **Lancastria** coulé le **17 juin 1940**
(opération Aerial), plus lourde perte britannique sur un seul navire, ⚠️ **bilan volontairement
non cité** (estimations très divergentes, même doctrine que la crue de Vaison au batch 46) ; et la
**poche de Saint-Nazaire**, d'**août 1944** au **11 mai 1945**, trois jours après la capitulation
générale, ⚠️ reddition **à Bouvron** et non ici. ④ **Vendôme** : `1578` — **Sonnets pour Hélène**,
dont « Quand vous serez bien vieille » est le poème que **Yeats** a refait en « When You Are Old » ;
⚠️ **la date du poème de Yeats n'est pas citée**, les sources donnant 1891 et 1893.
⚠️ **Deux angles anglophones retirés avant commit, faute de source** : la cathédrale de **Dax
donnée dans les 71 monuments de l'inscription UNESCO Compostelle** (non vérifiable — l'entrée dit
seulement que Dax est une **étape de la Via Turonensis**, sans chiffre) et **La Baule « épargnée
par les bombardements qui ont détruit Saint-Nazaire »** (la destruction est documentée mais les
sources divergent, 80 % et 85 %, et rien n'établit que La Baule ait été épargnée — supprimé, pas
nuancé). Même mode de défaillance qu'aux batches 42 et 46.
Les quatre points de vigilance du batch 48 sont honorés : **Dax désambiguïsé de l'indice boursier
allemand dès la première ligne** ; **La Baule pose dès l'intro que la baie est partagée par trois
communes** (un hébergement annoncé à La Baule peut être à Pornichet ou au Pouliguen) et se lit
comme une station balnéaire de chemin de fer du même moule que celles des côtes britanniques ;
**Céret ouvre sur la correction du pont neuf**, en section 1 ; et **Van Gogh est traité en histoire
de l'art anglophone sans toucher à la prudence FR**, Saint-Paul-de-Mausole étant dit **clinique
psychiatrique en activité** avant toute phrase sur le peintre. Prudences du FR reprises telles
quelles : **on ne se baigne pas dans la fontaine chaude** (64 °C), corrida nommée sans être
tranchée, **péloïde** qui n'est pas de la vase de rivière, **maison de la Duchesse Anne** et
**légende du pont du Diable** en tradition, **cerises de Céret plus systématiquement les premières
de France**, **villas de La Baule propriétés privées**, drapeaux de baignade réglementaires,
**arrêtés massifs opposables** à Saint-Rémy comme à Céret, frontière espagnole Schengen avec pièce
d'identité obligatoire, **aucune toile peinte à Saint-Rémy n'y est restée**, tours de Langres
**non tranchées** (sept à douze), et « accessible depuis » partout.
Six ajouts sans chiffre propres au lecteur étranger : **Morlaix ouvre sur sa devise** « S'ils te
mordent, mords-les » (*bite us and we bite back*), née du sac de la ville par **Thomas Howard, duc
de Norfolk et Grand Amiral d'Henri VIII, le 1ᵉʳ juillet 1522** — date que le FR utilise déjà pour
dater la maison de la Duchesse Anne sans dire d'où elle vient ; **Morlaix est atteignable depuis
ces îles sans avion** (Roscoff à une vingtaine de km, Brittany Ferries depuis Plymouth et Cork —
précédent Dieppe-Newhaven du batch 37) ; **Anne de Bretagne** et **l'Encyclopédie de Diderot**
glosées en une incise ; **ce qu'est une cure thermale** posé avant tout le reste du guide Dax,
le mot anglais *spa* désignant autre chose ; et **l'Élysée** glosé comme résidence présidentielle.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27). Le
substitut prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides EN
941 → 948), `search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**),
`npm run hreflang:check`, plus le contrôle de lookup / photo, le contrôle de figures ci-dessus et
une vérification d'encodage. 🔎 Trouvé en passant, **pas un défaut de parité** :
`things-to-do-in-vesoul-2026` est le **seul guide de la série sans photo d'en-tête**, parce que
**Vesoul n'a aucune entrée dans `data/city-images.json`** ; le guide FR jumeau se comporte
exactement pareil, donc les deux locales sont symétriques. C'est un trou du pipeline photo, à
combler par `npm run photos` en passe locale, pas par du contenu.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Il reste **272 villes
du seed sur 540 sans guide tourisme** (mesuré ce run) ; gisements nommés restants, tous
**revérifiés ce run** présents au seed et sans guide : Saint-Herblain, les trois banlieues
bordelaises (Villenave-d'Ornon, Talence, Le Bouscat) et le reliquat du vivier du batch 46 —
Sélestat, Obernai, Saverne, Aubusson, Douarnenez, Quiberon.

**Batch 50 — FR, shipped 2026-09-22 : Sélestat, Obernai, Saverne, Aubusson, Douarnenez, Quiberon,
Moissac.** Le batch **épuise le vivier du batch 46** : ses six dernières villes sont écrites d'un coup,
et il ne reste plus de cette liste que Saint-Herblain (écarté au batch 34 faute de matière) et les
trois banlieues bordelaises jamais faites (Villenave-d'Ornon, Talence, Le Bouscat). **Moissac** est
l'ajout du run et le plus gros trou restant du corpus : un cloître daté avec certitude de 1100,
soixante-seize chapiteaux dont quarante-six historiés, un tympan qui est un repère de la sculpture
romane, inscrit à l'UNESCO depuis 1998, et aucun guide ne citait la ville. Trois des sept sont
alsaciennes, ce qui est assumé : c'est le vivier qui était ainsi composé, et les trois guides se
citent mutuellement plutôt que de se répéter.
**Compteurs mesurés : FR 275 (`-a-` strict 267 + 6 en `au-` + 2 en `aux-`), EN 268 ; `GUIDES` 1 160 →
1 167.** Aucun nouveau slug hors gabarit : les huit exceptions restent `au-puy-en-velay`, `au-tampon`,
`au-francois`, `au-robert`, `au-lamentin`, `au-cannet`, `aux-abymes`, `aux-sables-d-olonne`.
`metaTitle` 35-38 caractères, `metaDesc` 130-144, 10 sections par guide, 1 178-1 273 mots, densité
d'accents 0,145-0,197 **par mot** (seuil ascii-strip 0,09), **0 em-dash** sur les sept réunis.
`npm run search-index` relancé (1 167 guides, 272 → **273 tags** : « que faire dans le Bas-Rhin »
franchit le seuil de 3 guides avec les trois villes alsaciennes et Haguenau, et crée
`/tags/que-faire-dans-le-bas-rhin`), d'où le passage de `npm run sitemap:check` (FR **29 276 URL**,
EN 28 863, chaque URL déclarée a une page et réciproquement). Contrôle de lookup / photo passé **sur
les 540 villes et les 275 guides de la série**, avec le **résolveur recopié de
`app/villes/[slug]/a-faire/page.tsx`** (la leçon du batch 47) : **275/275 atteignables, 0 orphelin,
0 collision**, et un seul guide sans photo d'en-tête, `10-choses-a-faire-a-vesoul-2026`, qui est le
trou de pipeline photo déjà relevé au batch 49 et pas une régression de ce lot.
⚠️ **Le fait le plus utile du batch est une nuance retirée à un superlatif, et elle concerne le seul
argument que Sélestat met en avant : la primauté de son sapin de Noël est disputée.** La ville
conserve bien une entrée comptable du **21 décembre 1521** (quatre schillings aux gardes forestiers
pour surveiller la forêt communale le jour de la Saint-Thomas, quand on y coupait les sapins), et
c'est la mention la plus souvent citée. Mais les archives de **Strasbourg** portent un achat de
**neuf sapins par l'Œuvre Notre-Dame en 1492**, et les revendications de **Riga** et de **Tallinn**
au début du XVIe siècle sont contestées par les historiens, qui y voient des fêtes de corporations
sans rapport avec Noël. Le guide publie la divergence au lieu de recopier « la plus ancienne mention
écrite du sapin de Noël », formule qu'on lit partout. Deuxième désamorçage du même genre : **Sélestat
appartient au réseau des sites Vauban sans être l'un des douze ouvrages inscrits à l'UNESCO en 2008**
— ses remparts sont de **Jacques Tarade**, ingénieur formé par Vauban, entre 1675 et 1691.
⚠️ **Deux affirmations corrigées avant commit par une mesure, pas par une relecture.** ① Le guide
Aubusson donnait la commune comme ayant « le mètre carré de référence le plus bas de notre corpus » :
le tri complet de `data/housing.ts` la place **deuxième sur 540**, derrière **Mauriac** (750 €) et à
égalité avec **La Souterraine** (800 €) ; la phrase publie désormais le classement exact. ② Le guide
Sélestat plaçait Haguenau « à quarante kilomètres au nord » : le calcul sur les coordonnées du seed
donne **66 km**. Même famille que l'écart de sept siècles et demi de Sens (batch 37) et que les six
comparaisons du batch 38 — ce sont les **distances et les rangs dérivés** qui dérapent, jamais les
dates prises une à une. Six autres retouches du même passage en revue : une durée de trajet non
vérifiée (Obernai-Strasbourg, remplacée par la distance mesurée), une traversée d'isthme chronométrée
à trois minutes sans source (Quiberon), une fraction inventée (« un tiers du tissu bâti » de Moissac),
et trois superlatifs invérifiables sur la fréquentation ou la photogénie.
⚠️ **Trois chiffres volontairement omis, sources divergentes — ne pas les « compléter » au prochain
run.** ① Le décompte de la tenture **Aubusson tisse Tolkien** : les publications donnent treize ou
quatorze tentures murales, un ou deux tapis, et 130 ou 160 m² tissés ; le guide donne l'accord signé
avec la **Tolkien Estate en janvier 2017**, les sept ateliers de la région, l'achèvement en **2024**
après sept ans, et s'arrête là. ② Le nombre de **cuves à garum des Plomarc'h** à Douarnenez, entre une
quinzaine et une trentaine selon ce qu'on décide de compter. ③ Le bilan de la **crue du Tarn des 3-4
mars 1930** à Moissac : cent vingt ou cent trente morts, six cents maisons détruites ou quatorze cents
à rebâtir. Même doctrine qu'au batch 46 (victimes de Vaison, tours de Senlis, villas de Dinard) et
qu'au batch 48. S'y ajoute l'**AOC du chasselas de Moissac**, donnée tantôt en 1971 tantôt en 1977 :
le guide ne retient que l'**AOP de 1996**, sur laquelle les sources concordent.
Faits vérifiés en ligne avant rédaction et qui portent les guides : **Bibliothèque humaniste** de
Sélestat, école latine fondée en **1452** et collection de **Beatus Rhenanus** léguée en **1547**,
**1 686 documents anciens**, registre **Mémoire du monde de l'UNESCO depuis 2011**, Érasme venu
**quatre fois entre 1515 et 1522** ; **Sainte-Foy** romane **1152-1190** sur dons de Barberousse,
classée **1862**, seul vestige du prieuré bénédictin puis jésuite ; **Saint-Georges 1220-1490**, nef
**1220-1235** en gothique bourguignon à voûtes sexpartites, vitraux du chœur **1430-1460**, reprises
de **Max Ingrand** et créations de **François Chapuis en 1986**, classée **1848** ; **arsenal
Sainte-Barbe** gothique de **1470**, arsenal en **1534** ; **tour des Sorcières** de la première
enceinte de **1216** ; **Ill*Wald** environ **1 855 ha**, créée **1995**, classée **2013**, plus vaste
réserve naturelle régionale d'Alsace, forêt alluviale de **1 500 ha** d'un seul tenant, plus de
**130 km** de cours d'eau ; **Corso fleuri depuis 1929** ; **Haut-Koenigsbourg** à **755 m** sur
**Orschwiller**, restauration **1900-1908** par **Bodo Ebhardt**, inaugurée le **13 mai 1908** devant
Guillaume II ; **puits aux six seaux d'Obernai, 1579**, trois colonnes à chapiteaux corinthiens et
baldaquin octogonal ; **Kapellturm 60 m**, vestige d'une chapelle de la fin du XIIIe démolie en
**1873** ; marché du jeudi mentionné dès **1301** ; **Saints-Pierre-et-Paul 1867-1872** par **Eugène
Petit**, **Saint-Sépulcre de 1504**, vitraux de la fin du XVe repris en **1895-96**, orgue **Merklin
1882**, cœur de **Mgr Freppel** (né à Obernai en 1827) depuis **1921** ; **Mont Sainte-Odile 764 m**
sur **Ottrott**, abbaye de **Hohenbourg**, **mur païen** d'une dizaine de km, ~**300 000 blocs**,
1,6 à 1,8 m de large, jusqu'à 3 m de haut, **daté du VIIe siècle** par les recherches récentes ;
**route des Vins créée le 30 mai 1953** lors d'un rallye automobile, **170 km** de Marlenheim à Thann,
**119 communes** ; **Léonardsau**, parc de **8 ha** ; **brasserie Kronenbourg d'Obernai ouverte en
1969**, plus de **70 ha** ; **gare d'Obernai** sur la ligne de Sélestat à Saverne, ouverte le
**28 septembre 1864** ; **château des Rohan de Saverne**, **Louis-René de Rohan** évêque en **1779**,
incendie la même année, façade sur parc de **Nicolas-Alexandre Salins de Montfort**, **35 travées** à
pilastres ioniques colossaux, **140 m** de grès rose, achevée **1789**, décors interrompus en **1790** ;
**affaire du collier**, scandale le **15 août 1785**, arrestation le jour même, acquittement le
**31 mai 1786**, fin de vie à **Ettenheim** ; **musée du château**, **deuxième collection lapidaire
d'Alsace** après Strasbourg, section **Louise Weiss** ; **roseraie**, société fondée en **1898**,
deuxième plus ancienne de France, **1,5 ha**, ~**8 500 rosiers**, **800 variétés** ; **Haut-Barr** sur
trois rochers à ~**470 m**, « **œil de l'Alsace** », passerelle dite pont du Diable ; **télégraphe
Chappe** en service de **1798 à 1852** ; **maison Katz de 1605**, bâtie par **Henri Katz**, receveur
général de l'évêché ; **jardin botanique du col de Saverne**, **2,5 ha**, aménagé en **1931** par des
naturalistes dont **Émile Walter** (mort en 1953), à **335 m**, collection d'orchidées indigènes
présentée comme la plus importante de France avec une vingtaine d'espèces ; **plan incliné de
Saint-Louis-Arzviller** en service le **27 janvier 1969**, remplace **17 écluses sur 4 km** qui
demandaient une journée, dénivelé de l'ordre de **45 m** ; **Cité internationale de la tapisserie
ouverte en juillet 2016** (inaugurée le **10 juillet**) dans les anciens locaux de l'**ENAD**,
syndicat mixte créé en **2010** ; **tapisserie d'Aubusson inscrite en 2009** au patrimoine culturel
immatériel ; **Maison du Tapissier** des XVe-XVIe, famille **Corneille**, lissiers et jurés-gardes de
la manufacture royale ; **pont de la Terrade** du XVIe, quartier des teinturiers ; **Sainte-Croix** du
XIIIe, bâtie par les vicomtes d'Aubusson ; **Felletin à 10 km au sud**, qui dispute à Aubusson le titre
de berceau ; **Port-Musée de Douarnenez inauguré en mai 1993** au Port-Rhu, **huit bateaux** visitables
à flot ; **Plomarc'h**, établissement de salaison du **Iᵉʳ siècle**, garum, alec et liquamen ;
**kouign-amann** né vers **1860**, attribué par la tradition à **Yves-René Scordia**, rapport
**40/30/30**, appellation « Véritable Kouign Amann de Douarnenez » déposée à l'INPI le **15 décembre
1999** ; **Temps Fête depuis 1986**, premier rassemblement national de voiliers du patrimoine en
France ; **ligne de Quimper fermée aux voyageurs le 6 mars 1972** et aux marchandises en **1988**, ni
voie ni gare à Tréboul ; **Côte Sauvage de Quiberon**, baignade interdite par l'**arrêté municipal
n° 128/2021 du 20 avril 2021** ; **fort de Penthièvre** décidé en **1747** après le pillage de **1746**,
nom du duc de Penthièvre, gouverneur de Bretagne ; **59 résistants morts entre avril et juillet 1944**
dont **50 le 13 juillet**, monument sur le glacis, cérémonie chaque 13 juillet ; **débarquement du
27 juin 1795**, plus de **4 000 émigrés** sur la plage de Carnac, Cadoudal, Hoche, **assaut final le
21 juillet** ; **traversée Port-Maria-Le Palais ~50 min** à l'année et ~**30 min** en navette rapide
l'été ; **institut de thalassothérapie fondé en mai 1964 par Louison Bobet**, dont la carrière s'arrête
fin **1961** sur un accident de voiture et qui se convainc de l'eau de mer en rééducation à **Roscoff**
chez le **docteur René Bagot** ; **Tire-Bouchon** Auray-Quiberon en juillet et août ; **cloître de
Moissac de 1100**, **76 chapiteaux dont 46 historiés** ; **tympan du portail sud** de la première
moitié du XIIe, vision de saint Jean ; **abbaye fondée au VIIIe**, rattachée à **Cluny en 1047** ;
**UNESCO 1998** au titre des chemins de Saint-Jacques, via Podiensis, **GR 65** ; **Uvarium de 1932**,
pavillon octogonal portant « Don de la Ville de Paris, 1930 », **station uvale en 1931**, Moulin de
Moissac comme hôtel des curistes ; **Ville d'art et d'histoire depuis 2012** ; **pont-canal du Cacor**,
**356 m**, **8,35 m** de large, **14 piles**, **1844-1845**, brique de Toulouse et pierre du Quercy,
ingénieur **François Terrié**.
Six prudences assumées dans la copie, à ne pas diluer : ① convention « **accessible depuis** » plutôt
que « situé à » partout où le site relève d'une commune voisine — **Haut-Koenigsbourg à Orschwiller**,
**Mont Sainte-Odile et mur païen à Ottrott**, **plan incliné à Saint-Louis, en Moselle**, **Felletin**,
et surtout le **fort de Penthièvre, qui est à Saint-Pierre-Quiberon et non à Quiberon** ; ② le **fort de
Penthièvre est une emprise militaire**, base d'entraînement du **3ᵉ RIMa de Vannes depuis 1969**, et
**il ne se visite pas** : seuls l'obélisque et le secteur du mémorial sont accessibles, dit avant toute
phrase attrayante, même traitement que la base 106 de Mérignac (batch 28), la base 701 de Salon
(batch 34) et la BA 125 d'Istres (batch 44) ; ③ la **brasserie Kronenbourg d'Obernai** est une emprise
industrielle en activité, pas un musée, et ses visites relèvent de l'exploitant ; ④ l'**interdiction de
baignade de la Côte Sauvage** est écrite comme une **règle opposable** avec son numéro d'arrêté, et non
comme un conseil, la signalisation par drapeaux des plages surveillées valant partout ailleurs ; ⑤ la
**vallée des peintres (Crozant, Fresselines, Monet en 1889) est dans le nord de la Creuse**, à plus
d'une heure de route d'Aubusson, ce que le guide dit explicitement plutôt que de laisser croire à une
excursion ; ⑥ **Temps Fête est biennal et tombe les années paires** — l'édition 2026 s'est tenue du 23
au 26 juillet, la suivante est attendue en **2028**, et **il n'y a rien en 2027** : même piège de
calendrier que le festival de cerf-volant de Dieppe (batch 36) et les Choralies de Vaison (batch 46), et
la copie le dit. Aucun horaire, aucun tarif, aucune figure en `/10` ; les seuls chiffres de population
sont ceux de l'Insee 2022 lus dans `data/city-population.json` (Sélestat 19 523, Obernai 12 303, Saverne
11 323, Aubusson 3 036, Douarnenez 14 188, Quiberon 4 782, Moissac 13 652) — **pas les `population`
approximatives du seed** — et les loyers et prix au m² viennent de `data/housing.ts`.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27 : 4 h 30 de
génération, `.next` à 25 Go, ENOSPC avant la finalisation, aucun signal utile). Le substitut prescrit
passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides FR 1 160 → 1 167),
`search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**, 0 route FR sans
jumelle), `npm run hreflang:check`, plus le contrôle de lookup / photo exhaustif ci-dessus et une
vérification d'encodage (accents intacts, `€` conservé, aucun `m2` / `EUR` / `deg` ascii, aucun
mojibake, aucune apostrophe typographique). Note d'environnement reconfirmée : le conteneur de routine
démarre **en HEAD détaché et sans `node_modules`** — `git checkout main` puis `npm install` d'abord, et
les brouillons vont **hors du dépôt** (leçon du batch 47).
⚠️ Egress : la **recherche web fonctionne**, et c'est par elle que tous les faits ci-dessus ont été
recoupés sur plusieurs résultats plutôt que sur une fiche unique, méthode retenue depuis le batch 48.
Écart FR→EN après ce batch : **7 villes** (selestat, obernai, saverne, aubusson, douarnenez, quiberon,
moissac) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**. Rappel de la règle
du batch 33 : côté EN, le slug se dérive du **slug de seed tel quel**
(`getEnGuide('things-to-do-in-' + slug + '-2026')`), et aucun de ces sept ne porte d'article, donc rien
à arbitrer. Quatre points de vigilance pour ces jumelles : ① **le sapin de Noël de Sélestat est le
meilleur angle anglophone du lot et le plus piégeux** — la primauté est disputée (Strasbourg 1492, Riga,
Tallinn), la jumelle doit publier la divergence comme le FR et non reprendre le superlatif des guides de
voyage ; ② **Aubusson tisse Tolkien est de la matière anglophone avant d'être française**, Tolkien étant
lu en anglais et la Tolkien Estate britannique : la jumelle a de la matière propre là où le FR reste
sobre, même arbitrage qu'avec Jubilee à Dieppe (batch 37), Cambrai (batch 39), Béthune (batch 41) et
Blagnac (batch 43) ; ③ **le débarquement de 1795 à Quiberon est une opération britannique** (flotte de la
Royal Navy, émigrés armés par Londres) et se lira autrement pour un lecteur anglophone, mais
l'interdiction de baignade et le statut militaire du fort de Penthièvre restent des **règles opposables**
à écrire comme telles ; ④ **`things-to-do-in-moissac-2026` doit poser Moissac face à Toulouse et à la
route de Compostelle dès la première ligne**, un lecteur anglophone connaissant le Camino et ignorant la
ville qui en porte l'étape.
Pour le batch FR **suivant**, il reste **265 villes du seed sur 540 sans guide tourisme** (272 avant ce
run). Le vivier du batch 46 est **épuisé** ; les gisements nommés restants sont **Saint-Herblain**
(écarté au batch 34 faute de matière) et les **trois banlieues bordelaises** jamais faites
(Villenave-d'Ornon, Talence, Le Bouscat), à compléter par les trous mesurés ce run et non retenus faute
de place, tous vérifiés présents au seed et sans guide : **Sedan** (le château fort le plus étendu
d'Europe, la capitulation de 1870, la percée de 1940), **Firminy** (site Le Corbusier ; ⚠️ **corrigé au batch 52** — ce
n'est pas l'église Saint-Pierre qui relève de l'inscription UNESCO de 2016 mais la **Maison de la
Culture**, seul bâtiment de la ville achevé du vivant de l'architecte), **Corte** (citadelle, musée de la Corse),
**Gérardmer**, **Les Andelys** (Château-Gaillard), **Paray-le-Monial**, **Sanary-sur-Mer**,
**Noirmoutier-en-l'Île** (passage du Gois ; ⚠️ le slug de seed est `noirmoutier`, pas `noirmoutier-en-l-ile`), **Vitré**, **Lannion**, **Hendaye**, **Saint-Flour** et
**Embrun**. Rappel des batches 26, 32, 34, 36, 40, 42 et 46 : **on choisit par matière touristique
réelle, pas par inertie de liste.**

**Batch 51 — EN, rattrapage de parité, shipped 2026-09-23.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 50 écrites d'un coup dans `data/guides-en.ts` (Sélestat,
Obernai, Saverne, Aubusson, Douarnenez, Quiberon, Moissac). **Compteurs mesurés : FR 275, EN 275 —
écart nul dans les deux sens, parité rétablie** (`EN_GUIDES` 971 → 978). Aucun slug hors gabarit :
les sept villes prennent « à » sans contraction, donc la règle du batch 33 (**côté EN le slug se
dérive du slug de seed tel quel**) n'avait rien à arbitrer, et les huit exceptions restent
`au-puy-en-velay`, `au-tampon`, `au-francois`, `au-robert`, `au-lamentin`, `au-cannet`,
`aux-abymes`, `aux-sables-d-olonne`. `metaTitle` 39-50 caractères, `metaDesc` 130-150, 8 sections
par guide (la série FR en compte 10, l'EN fusionne les fins de liste), 1 342-1 620 mots, **0
em-dash**. Aucun tag neuf — `search-index.en.json` reste à **114 tags**, donc aucune page `/tags/`
créée ; `sitemap:check` donne EN 28 863 → **28 870 URL**, soit exactement les 7 guides neufs
(FR inchangé à 29 276).
⚠️ **Deux pièges d'outillage, trouvés en écrivant le contrôle et non en lisant le journal.**
① Un contrôle de parité doit appeler **le résolveur de la page** (`getEnGuide(slug)` puis
`citySlugElisions(slug)`) : le premier script de ce run testait le slug de seed tel quel et a
signalé `clermont-herault` en faux orphelin, c'est-à-dire exactement le défaut du batch 47.
② **`guideCityPhoto()` prend deux arguments** (`guideSlug`, `relatedCities`) et résout la photo
**par `relatedCities`** — une ville absente de son propre `relatedCities` perd donc son en-tête en
silence, le défaut que le batch 44 avait dû corriger sur `things-to-do-in-clermont-l-herault-2026`.
Les 7 portent leur ville en 1re position. Contrôle passé **sur les 540 villes et les 275 guides de
la série, des deux côtés** : **275/275 FR et 275/275 EN atteignables, 0 orphelin, 0 collision**, et
un seul guide sans photo d'en-tête, `things-to-do-in-vesoul-2026` — le trou de pipeline photo du
batch 49, symétrique en FR, pas une régression de ce lot.
⚠️ **Vingt et une figures du texte EN ne sont pas dans les jumelles FR, et c'est délibéré — le
contrôle mécanique les remontera à chaque run, ne pas les « corriger ».** 249 figures, 228
retrouvées. ① **Sélestat** `1800`, `1510` : l'histoire d'origine du lecteur britannique est
**victorienne** — la reine Charlotte, épouse allemande de George III, créditée du premier sapin
anglais à Windsor en **1800** (et c'était un **if**), coutume généralisée après la gravure de
Victoria et Albert dans l'*Illustrated London News* de 1848 ; le registre de Sélestat précède cette
gravure de trois siècles. La divergence du FR est **élargie et non résolue** : Riga **1510**,
Tallinn plus tôt encore, toutes deux appuyées sur la **confrérie des Têtes-Noires**, qui coupait un
arbre, l'ornait, le promenait **puis le brûlait**, d'où le doute des historiens ; **Gustavs
Strenga** n'en tient aucune pour exacte ; et le **21 décembre est la fête de saint Thomas apôtre**,
donc ce qui est payé est la garde d'un bois. ⚠️ **La date de 1441 souvent donnée à Tallinn n'est
pas citée**, elle contredirait le « début du XVIᵉ siècle » du FR. ② **Saverne** `1772`, `1774`,
`1837`, `1796`, `1822` : Rohan **ambassadeur à Vienne de 1772 à 1774**, détesté de Marie-Thérèse
puis de sa fille, ce qui donne **sa cause** à l'affaire du collier que le FR raconte sans mobile ;
**Carlyle la raconte dans *Fraser's Magazine* en 1837**, l'année de sa *French Revolution* ; et
l'Amirauté britannique, refusant de copier Chappe, fait bâtir le télégraphe **à volets** de Lord
George Murray, première ligne en **1796**, avant d'adopter le sémaphore Chappe avec une ligne de
Portsmouth en **1822**. ③ **Quiberon** `1759` : **un anglophone qui tape « Quiberon » tombe d'abord
sur la Royal Navy**. Le **20 novembre 1759** Hawke poursuit Conflans **dans la baie même** par coup
de vent, au milieu des récifs, et brise la flotte française ; **Heart of Oak**, marche officielle de
la Royal Navy, est écrit cette année-là par **Garrick** et **Boyce** pour *Harlequin's Invasion*, et
son « wonderful year » est 1759. Le fait est **géographique** et tient donc la section de l'isthme,
la baie étant définie par la presqu'île, Belle-Île, Houat et Hoëdic. ⚠️ **Aucun bilan humain n'est
cité** (2 500 marins, 630 pour le seul *Superbe*, sans concordance), et le guide **distingue les
deux Quiberon anglais**, 1759 et 1795, à trente-six ans d'écart. ④ **Moissac** `1926`, `1929` :
**qui a étudié la sculpture romane en anglais a étudié ce portail** — **Meyer Schapiro** vient en
France en **1926** à 22 ans, le doctorat que Columbia lui décerne en **1929** est le premier de
cette université en histoire de l'art et archéologie, et l'essentiel paraît dans *The Art Bulletin*
en 1931. ⑤ **Obernai** `1664` : **le nombre imprimé sur la bouteille est une date** (brasserie
fondée en 1664 par Geronimus Hatt à Strasbourg), et 1664 est la **deuxième lager premium la plus
vendue au Royaume-Uni**. ⑥ **Aubusson** `1954`, `2020` : l'accord a été signé par **Christopher
Tolkien**, exécuteur littéraire, éditeur du *Silmarillion* et des douze volumes de *The History of
Middle-earth*, **auteur de la carte de la Terre du Milieu de l'édition de 1954**, mort en **2020**.
⚠️ **La date de signature reste « 2017 » comme au FR** (des sources anglophones la placent fin 2016)
et **le décompte de l'ensemble n'est pas tranché** : on ne résout pas côté EN ce que le FR a
explicitement laissé ouvert. ⑦ **Douarnenez** `2011`, `2015`, `1910` : le kouign-amann était inconnu
aux États-Unis jusqu'à **Dominique Ansel**, qui l'ouvre à New York en **2011** sous le sigle **DKA**,
et dès **2015** New York, Washington, Boston, San Francisco et Salt Lake City en vendaient, certains
raccourcissant le nom en *queen* ; et là où le FR dit qu'Ys « a nourri quantité de musique » sans
nommer une œuvre, l'EN nomme **le dixième prélude du premier livre de Debussy, publié en 1910**,
*La cathédrale engloutie*.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : primauté du sapin **disputée** ;
Sélestat dans le **réseau** Vauban **sans être** l'un des douze ouvrages UNESCO de 2008 ; dates du
Corso fleuri à vérifier auprès de l'office de tourisme ; **Haut-Koenigsbourg à Orschwiller** ;
**Mont Sainte-Odile et mur païen à Ottrott** ; **Kronenbourg = emprise industrielle en activité** ;
route des Vins = réseau de routes et non sentier balisé ; **roseraie fermée hors saison** ; **plan
incliné à Saint-Louis, en Moselle** ; **UNESCO immatériel d'Aubusson = un savoir-faire, rien à
visiter de l'inscription** ; **vallée des peintres à plus d'une heure** ; cuves à garum **non
tranchées** ; kouign-amann donné pour **tradition** ; île Tristan à marée basse sur réservation ;
**Temps Fête biennal, années paires, rien en 2027** ; drapeaux **réglementaires** ; **Ys = légende** ;
**baignade interdite sur toute la Côte Sauvage par l'arrêté n° 128/2021 du 20 avril 2021**, écrite
comme **règle opposable** ; **fort de Penthièvre à Saint-Pierre-Quiberon**, terrain militaire du
3ᵉ RIMa **qui ne se visite pas** (l'EN ajoute « no arrangement, no open day », un visiteur étranger
étant plus enclin à aller demander) ; **thalasso ≠ thermalisme** ; **cloître de Moissac amputé** ;
**bilan de la crue de 1930 non tranché** ; **AOC chasselas non tranchée**, seule l'AOP de 1996
retenue. Ajouts sans chiffre propres au lecteur étranger : **Érasme enseignait le grec à Cambridge**
et logeait à Queens' College avant ses quatre séjours à Sélestat (⚠️ **la chaire Lady Margaret n'est
pas citée**, les historiens ne s'accordant pas sur son obtention) ; **« beffroi » défini comme tour
civile** ; basse lisse contre haute lisse des Gobelins ; **garum expliqué par la sauce de poisson
d'Asie du Sud-Est** ; « station uvale » et *uva* glosés ; Toulouse posée comme l'approche pratique
de Moissac.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27). Le
substitut prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides EN
971 → 978), `search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**,
FR 221 / EN 166), `npm run hreflang:check`, plus le contrôle de lookup / photo exhaustif, le
contrôle de figures ci-dessus et une vérification d'encodage (accents intacts, aucun mojibake,
aucune apostrophe typographique, aucun `m2` / `EUR` / `deg` ascii, aucune figure en `/10`, aucun
horaire, aucun tarif). ⚠️ Egress : `en.wikipedia.org` répond **EGRESS_BLOCKED** en `WebFetch` depuis
la routine, alors que **la recherche web fonctionne** — les faits ont donc été recoupés sur
plusieurs résultats plutôt que sur une fiche unique, méthode retenue depuis le batch 48.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Il reste **265 villes du
seed sur 540 sans guide tourisme** ; gisements inchangés : **Saint-Herblain**, les **trois banlieues
bordelaises** (Villenave-d'Ornon, Talence, Le Bouscat) et les trous listés au batch 50 — Sedan,
Firminy, Corte, Gérardmer, Les Andelys, Paray-le-Monial, Sanary-sur-Mer, Noirmoutier-en-l'Île
(⚠️ slug de seed `noirmoutier`), Vitré, Lannion, Hendaye, Saint-Flour, Embrun.

**Batch 52 — FR, shipped 2026-09-29 : Sedan, Corte, Les Andelys, Paray-le-Monial, Vitré, Firminy,
Noirmoutier-en-l'Île.** Sept villes, sept régions, **toutes prises dans le vivier laissé par les
batches 50 et 51** : pour la deuxième fois seulement depuis le batch 38, le lot n'a rien eu à
arbitrer contre la liste. Il en reste six de ce vivier (**Gérardmer, Sanary-sur-Mer, Lannion,
Hendaye, Saint-Flour, Embrun**), plus **Saint-Herblain** (écarté au batch 34 faute de matière) et
les **trois banlieues bordelaises** jamais faites (Villenave-d'Ornon, Talence, Le Bouscat).
⚠️ **Un nouveau slug hors gabarit, le neuvième, et le troisième en `aux-`** :
`10-choses-a-faire-**aux**-andelys-2026` (« aux Andelys », le seed écrivant `les-andelys`). Le
compte réel se prend toujours avec **`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`**, et la
table de correspondance à appliquer avant tout `comm` s'allonge : `puy-en-velay`→`le-puy-en-velay`,
`tampon`→`le-tampon`, `francois`→`le-francois`, `robert`→`le-robert`, `lamentin`→`le-lamentin`,
`cannet`→`le-cannet`, `abymes`→`les-abymes`, `andelys`→`les-andelys`,
`sables-d-olonne`→`les-sables-d-olonne`. Le correctif du batch 32 tient : le résolveur de
`app/villes/[slug]/a-faire/page.tsx` retrouve bien la forme contractée depuis `les-andelys`,
vérifié après écriture.
**Compteurs mesurés : FR 282 (`-a-` strict 273 + 6 en `au-` + 3 en `aux-`), EN 275 ; `GUIDES` 1 184
→ 1 191.** `metaTitle` 33-43 caractères, `metaDesc` 123-146, 10 sections par guide, 1 109-1 241 mots,
densité d'accents 0,131-0,169 **par mot** (seuil ascii-strip 0,09), **0 em-dash** sur les sept réunis.
`npm run search-index` relancé (1 191 guides, **274 tags, inchangé** — aucun tag neuf n'a franchi le
seuil de 3 guides, donc aucune page `/tags/` créée) et `npm run sitemap:check` repassé (FR **29 301
URL**, EN 28 898, chaque URL déclarée a une page et réciproquement). Contrôle de lookup / photo passé
**sur les 540 villes et les 282 guides de la série**, avec le résolveur recopié de la page :
**282/282 atteignables, 0 orphelin, 0 collision**, et un seul guide sans photo d'en-tête,
`10-choses-a-faire-a-vesoul-2026`, qui est le trou de pipeline photo relevé au batch 49 et pas une
régression de ce lot.
⚠️ **Le fait le plus utile du batch est une correction de ce fichier : à Firminy, ce n'est pas
l'église Saint-Pierre qui est inscrite à l'UNESCO, c'est la Maison de la Culture.** Le batch 50
inscrivait la ville au vivier avec la mention « dont l'église Saint-Pierre relève de l'inscription
UNESCO de 2016 » : c'est faux, et la raison est une règle et non un hasard. L'œuvre architecturale de
Le Corbusier a été inscrite le **17 juillet 2016** en **dix-sept sites**, et le seul retenu à Firminy
est la **Maison de la Culture** (1961-1965, **112 m** de long, toit de béton suspendu à des câbles
sans aucun appui intérieur, **classée MH en 1984**), **parce que c'est le seul bâtiment de la ville
achevé du vivant de l'architecte**. Les trois autres sont posthumes en tout ou partie — église
Saint-Pierre conçue en 1960 et **achevée en 2006** par José Oubrerie, unité d'habitation commencée en
1965 (**cinquième au monde**), stade de 1965-1966 — donc hors périmètre. Le guide consacre une
section entière à dire ce qui est inscrit et ce qui ne l'est pas, la confusion étant générale.
⚠️ **Deuxième correction, du même genre que l'Hermione absente de Rochefort (batch 36) : la Via Vitae
du musée du Hiéron a été partiellement volée.** La pièce maîtresse de Paray-le-Monial — **138
statuettes chryséléphantines** d'or et d'ivoire achevées en **1904** par le joaillier **Joseph
Chaumet**, classées **Trésor national en 2000** et acquises par le musée en **2005** — a fait l'objet
d'un **braquage à main armée le 21 novembre 2024**, dont une partie de l'œuvre n'est pas revenue. Le
guide renvoie à une vérification auprès du musée avant de se déplacer pour elle plutôt que de
promettre ce qui n'est peut-être plus exposé.
⚠️ **Troisième correction, de géographie, et elle structure le guide Noirmoutier : ni le passage du
Gois ni le pont ne sont sur la commune.** Le **Gois** (4,15 km, **neuf balises de sauvetage numérotées
de 1 à 9** espacées d'environ 500 m, praticable une heure et demie avant et après la basse mer) relie
**Beauvoir-sur-Mer** à **Barbâtre**, à la pointe sud de l'île ; le **pont** relie **Fromentine**,
commune de **La Barre-de-Monts**, à **Barbâtre** également. L'île compte **quatre communes** et
Noirmoutier-en-l'Île est à une vingtaine de kilomètres de l'une comme de l'autre. Un lecteur qui
réserve au bourg en croyant arriver au pied du Gois se trompe de bout d'île. La règle de marée est
écrite comme **opposable** et non comme un conseil, et le guide dit que les balises existent parce que
le cas se produit tous les ans.
Autres faits vérifiés en ligne avant rédaction et qui portent les guides : **château de Sedan fondé en
1424** par la famille de **La Marck**, chantier étalé sur environ un siècle et demi, **35 000 m²**
d'enceinte pour jusqu'à **4 000 hommes**, murailles de **7 à 27 m** d'épaisseur, **principauté
souveraine protestante jusqu'au rattachement de 1642** ; **Turenne né au château de Sedan le
11 septembre 1611**, deuxième fils du duc de Bouillon, formé à la guerre chez ses oncles **Maurice et
Frédéric-Henri de Nassau**, **maréchal de France en 1643** ; **Dijonval**, privilège accordé par
**Fabert en 1646** à trois marchands parisiens, **seule manufacture royale de draps fins du royaume**,
corps principal de **1755** et ailes en retour de **1778** ; **bataille de Sedan du 1er septembre
1870**, capitulation signée le lendemain au **château de Bellevue**, **quelque 83 000 prisonniers**
dont l'empereur, République proclamée le 4 ; **maison de la dernière cartouche à Bazeilles**, auberge
**Bourgerie**, dernière cartouche tirée par le capitaine **Arsène Lambert**, scène fixée par le tableau
d'**Alphonse de Neuville** ; **percée du 13 mai 1940**, **Guderian** ayant dissimulé bateaux et
pontonniers dans les ruelles des usines textiles avant de passer la Meuse en canots pneumatiques en
fin d'après-midi, le massif ardennais étant tenu par l'état-major français pour difficilement
franchissable ; **Nid d'Aigle de Corte** du **XVe siècle** dans une citadelle du XVIIIe, **musée de la
Corse ouvert le 21 juin 1997** sur un projet d'**Andrea Bruno** autour de la collection ethnographique
du père **Louis Doazan** (~**3 000 objets**) ; **université fondée par Paoli en 1765**, fermée avec
l'indépendance et **rouverte en 1981** ; **Restonica** site classé depuis **1966**, **lac de Melo
1 711 m**, **lac de Capitello 1 930 m**, départ des **bergeries de Grotelle** au bout de la **D623**,
**brèche de Capitello 2 080 m** sur le **GR20** ; **Château-Gaillard**, chantier ouvert en **1196** et
forteresse debout en **1198**, de l'ordre de **6 000 personnes** sur le chantier, **siège d'environ six
mois** et prise le **6 mars 1204** par Philippe Auguste, la Normandie entière tombant **en trois mois**
ensuite ; **Poussin né en juin 1594 au hameau de Villers**, **musée Nicolas Poussin** dans une maison
du XVIIIe avec une **mosaïque gallo-romaine du IIIe siècle** et un **Coriolan** de Poussin ;
**collégiale Notre-Dame des Andelys** à orgue **Cavaillé-Coll** sur une tribune Renaissance signée
**Étienne Delaune** ; **basilique de Paray bâtie 1090-1109** sous l'abbatiat de **saint Hugues**,
**parallèlement au chantier de Cluny III** ; **Marguerite-Marie Alacoque (1647-1690)**, première vision
le **27 décembre 1673**, grandes apparitions **1673-1675**, **monastère de la Visitation fondé en
1626** ; **maison Jayet bâtie 1525-1528** pour **Pierre Jayet**, marchand de serge de laine, façade de
première Renaissance appliquée sur du bâti plus ancien, **classée MH en 1875**, mairie **depuis 1862** ;
**château de Vitré bâti vers 1050**, agrandi au XIIIe par **André III**, enceinte triangulaire,
**classé MH en 1872**, mairie et musée ; **remparts des XIIIe-XVe**, environ **500 m** conservés ;
**château des Rochers-Sévigné**, manoir du XVe dans la famille de Sévigné **depuis 1410**, **à 6 km du
centre mais sur le territoire communal**, **16 séjours** et **297 lettres** de Madame de Sévigné
(**1626-1696**), **chapelle octogonale de 1671** pour l'abbé de Coulanges, jardin sur un dessin de
**Le Nôtre** restauré en **1982** ; **donjon de Noirmoutier** bâti fin XIIe par **Pierre V de la
Garnache**, une vingtaine de mètres, l'un des mieux conservés du grand Ouest ; **crypte Saint-Philbert**
abritant le corps du saint **de 690 à 836** avant les transferts vers **Déas, Cunault et Tournus**
(fuite devant les raids scandinaves), **classée MH en 1898** ; **marais salants sur environ un tiers de
l'île**, communes de Noirmoutier et de **L'Épine** ; **bois de la Chaise, 93 ha** au nord-est,
mimosas, chênes verts et pins maritimes.
⚠️ **Quatre chiffres volontairement omis, sources divergentes — ne pas les « compléter » au prochain
run.** ① La **durée du chantier de Château-Gaillard** : les sources disent « en un an » et « de 1196 à
1198 », le guide publie la divergence et s'en tient au fait que la forteresse est debout en 1198.
② La **date du jardin des Rochers** : 1689 ou 1690 selon les sources, le guide écrit « à la fin des
années 1680 » et dit qu'il ne tranche pas. ③ Le **classement MH du château de Noirmoutier**, donné
1994 par une seule source : le guide dit « classé au titre des monuments historiques » sans l'année.
④ La **hauteur exacte du donjon de Noirmoutier**, donnée « près de 20 m » : « une vingtaine de mètres ».
Même doctrine qu'aux batches 46, 48 et 50.
⚠️ **Une orthographe non tranchée** : la maison de Paray s'écrit **Jayet** sur les sources de l'office
de tourisme et **Jaillet** ailleurs ; le guide retient Jayet, celle des sources locales. Ne pas
« corriger » sans nouvelle source.
⚠️ **Deux affirmations écrites au premier jet et retirées avant commit, toutes deux démenties par une
mesure sur nos propres données** — même mode de défaillance qu'aux batches 40, 44, 46, 48 et 50, où
ce sont les **rangs et les comparaisons** qui dérapent et jamais les dates prises une à une : ① Sedan
donnée en effondrement démographique sans réserve, alors que le tri du département montre qu'elle
**perd le plus sur onze ans (−9,6 %) et le moins sur la fenêtre récente (−0,7 %)**, devant
Charleville-Mézières (−2,2 %) et Rethel (−3,0 %) : la chute est ancienne et s'est arrêtée, et les deux
comptes sont désormais publiés ; ② Vitré présentée comme une ville qui profite de Rennes, alors qu'elle
est **la première des quatre communes d'Ille-et-Vilaine du corpus à +10,4 %, devant Rennes à +9,5 %** —
elle grandit plus vite que sa métropole, à 35 km à vol d'oiseau et pour un T3 à 800 € contre 1 100 €.
Six prudences assumées dans la copie, à ne pas diluer : ① convention « **accessible depuis** » plutôt
que « situé à » partout où le site relève d'une commune voisine — **Bazeilles** depuis Sedan,
**Charleville-Mézières** (18 km à vol d'oiseau) et sa place Ducale, **Giverny qui est une commune à
part entière** et **Vernon** (18 km) depuis Les Andelys, **Fougères** depuis Vitré, **Charolles et le
Charolais** depuis Paray, le **massif du Pilat** et **Saint-Étienne** (10 km) depuis Firminy ;
② l'**unité d'habitation de Firminy est un immeuble habité** et **Firminy-Vert un quartier habité**,
dits comme tels avant toute phrase attrayante, même cadrage que les Minguettes (batch 28) et les cités
Tase (batch 44) ; ③ les **bassins des marais salants sont un outil de travail sur propriété privée**,
on regarde depuis les chemins ; ④ les **falaises de craie des Andelys se détachent par plaques**, avec
le balisage qui fait foi, même règle qu'à Dieppe (batch 36) et Granville (batch 46) ; ⑤ l'**accès
motorisé à la haute Restonica est réglementé en saison** et le dispositif change d'une année à l'autre,
donc renvoi à l'office de tourisme et **pas à un calculateur d'itinéraire**, et les lacs sont écrits
comme de la haute montagne (orage d'après-midi la règle en été) ; ⑥ **Paray est une ville sanctuaire**,
donc le calendrier du sanctuaire commande les hébergements et l'accès à la chapelle des apparitions,
qui reste un lieu de culte en activité et non un monument ouvert en permanence. Aucun horaire, aucun
tarif, aucune figure en `/10` ; les seuls chiffres de population sont ceux de l'Insee 2022 lus dans
`data/city-population.json` (Sedan 16 727, Corte 7 737, Les Andelys 7 822, Paray-le-Monial 9 256,
Vitré 18 892, Firminy 17 128, Noirmoutier 4 502) — **pas les `population` approximatives du seed** — et
les loyers et prix au m² viennent de `data/housing.ts`.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27 : 4 h 30 de
génération, `.next` à 25 Go, ENOSPC avant la finalisation, aucun signal utile). Le substitut prescrit
passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides FR 1 184 → 1 191),
`search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**, 0 route FR sans
jumelle), `npm run hreflang:check`, plus le contrôle de lookup / photo exhaustif ci-dessus et une
vérification d'encodage (accents intacts, `m²` conservé, `œ` conservé, aucun `m2` / `EUR` / `deg`
ascii, aucun mojibake, aucune apostrophe typographique). Note d'environnement reconfirmée : le
conteneur de routine démarre **en HEAD détaché et sans `node_modules`** — `git checkout main` puis
`npm install` d'abord.
⚠️ Egress : la **recherche web fonctionne** et c'est par elle que tous les faits ci-dessus ont été
recoupés sur plusieurs résultats plutôt que sur une fiche unique, méthode retenue depuis le batch 48.
Écart FR→EN après ce batch : **7 villes** (sedan, corte, les-andelys, paray-le-monial, vitre, firminy,
noirmoutier) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**. Rappel de la
règle du batch 33 : côté EN, le slug se dérive du **slug de seed tel quel**
(`getEnGuide('things-to-do-in-' + slug + '-2026')`), donc
**`things-to-do-in-les-andelys-2026` garde son article** (comme `le-cannet`, `le-tampon`,
`les-sables-d-olonne`) et **`things-to-do-in-noirmoutier-2026` garde la forme courte du seed**, pas
`noirmoutier-en-l-ile`. Cinq points de vigilance pour ces jumelles : ① **Château-Gaillard est de
l'histoire anglaise avant d'être de l'histoire française** — Richard Cœur de Lion, la perte du duché
anglo-normand, le siège de 1204 : la jumelle a de la matière propre là où le FR reste sobre, même
arbitrage qu'avec Jubilee à Dieppe (batch 37), Cambrai (batch 39), Béthune (batch 41), Blagnac
(batch 43) et Verdun (batch 47) ; ② **`things-to-do-in-corte-2026` est un slug ambigu en anglais**
(*Corte* est un patronyme et un toponyme fréquents, et *Cortes* renvoie au parlement espagnol), l'intro
doit poser la ville dès la première ligne, comme Orange (batch 37), Bergerac (batch 41) et Dax
(batch 49) ; ③ **la correction UNESCO de Firminy est encore plus utile côté anglophone**, où « Le
Corbusier UNESCO site » circule sans distinguer les dix-sept sites inscrits du reste ; ④ la **règle de
marée du Gois** et le fait que **ni le Gois ni le pont ne sont sur la commune** sont à écrire comme des
**règles opposables**, un visiteur étranger étant plus enclin à se fier à un GPS qu'à un horaire de
marée ; ⑤ **Madame de Sévigné n'a pas d'équivalent anglophone évident** — la lettre comme genre
littéraire se pose en une incise avant d'être utilisée.
Pour le batch FR **suivant**, il reste **258 villes du seed sur 540 sans guide tourisme** (265 avant ce
run) ; gisements nommés restants : **Saint-Herblain**, les **trois banlieues bordelaises**
(Villenave-d'Ornon, Talence, Le Bouscat) et le reliquat du vivier du batch 50 — **Gérardmer,
Sanary-sur-Mer, Lannion, Hendaye, Saint-Flour, Embrun**.

**Batch 53 — EN, rattrapage de parité, shipped 2026-09-30.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 52 écrites d'un coup dans `data/guides-en.ts` (Sedan, Corte,
Les Andelys, Paray-le-Monial, Vitré, Firminy, Noirmoutier). **Compteurs mesurés : FR 282, EN 282 —
écart nul dans les deux sens, parité rétablie** (`EN_GUIDES` 1 003 → 1 010). Les 7 villes manquantes
ont été **mesurées par diff des deux listes de slugs**, article contracté restauré avant comparaison,
puis recoupées par le résolveur de la page. Un slug hors gabarit à arbitrer, et la règle du batch 33
tranche : **`things-to-do-in-les-andelys-2026` garde son article** là où le FR contracte en
`10-choses-a-faire-aux-andelys-2026`, et **`things-to-do-in-noirmoutier-2026` garde la forme courte
du seed**, pas `noirmoutier-en-l-ile`. `metaTitle` 46-51 caractères, `metaDesc` 135-147, 8 à 9
sections par guide (la série FR en compte 10, l'EN fusionne les fins de liste), 1 330-1 533 mots,
**1 em-dash pour 252 à 362 mots** après une passe de réduction (Corte sortait à 1 pour 121, Sedan à
1 pour 171). Contrôle de lookup / photo passé **sur les 540 villes et les 282 guides de la série,
des deux côtés**, avec le résolveur recopié de la page (`getEnGuide(slug)` puis
`citySlugElisions(slug)`, la leçon des batches 47 et 51) : **282/282 atteignables, 0 orphelin,
0 collision**, les 7 portant leur ville en 1re position de `relatedCities` et pourvus de leur photo
d'en-tête ; seul `things-to-do-in-vesoul-2026` reste sans photo, trou de pipeline du batch 49,
symétrique en FR.
⚠️ **Aucun tag neuf, et le compte du journal était périmé** : `search-index.en.json` reste à
**117 tags**, pas 114 — le fichier au HEAD en portait déjà 117 avant ce run. **Un compte de tags se
prend par diff des deux index, pas en recopiant la dernière valeur écrite ici.** `sitemap:check`
donne EN 28 898 → **28 905 URL**, soit exactement les 7 guides neufs (FR inchangé à 29 301).
⚠️ **Dix-sept figures du texte EN ne sont pas dans les jumelles FR, et c'est délibéré — ne pas les
« corriger ».** 185 figures, 168 retrouvées ; les 17 restantes sont vérifiées en ligne avant
écriture. ① **Corte** : `13`, `1755`, `1769`, `1768`, `1807`, `1889` — **la moitié de l'histoire de
Paoli est à Londres et rien à Corte ne le dit.** Élu général de la nation corse le **13 juillet
1755**, battu à Ponte Nuovo en **1769**, exilé en Angleterre où **James Boswell**, biographe de
Samuel Johnson, l'avait rencontré en 1765 avant de publier *An Account of Corsica* en **février
1768** (trois éditions en un an). Mort à Londres le **5 février 1807**, enterré à Old St Pancras ;
monument de marbre blanc à buste de **John Flaxman** élevé la même année dans le bas-côté sud du
chœur de **Westminster Abbey**, toujours en place — mais **le corps n'y est pas** : en **1889** ses
restes repartent en Corse sur une frégate britannique, réinhumés à **Morosaglia**, commune à part.
② **Paray-le-Monial** : `1676`, `1678`, `1682`, `1920` — **le jésuite qui a cru Marguerite-Marie a
porté la dévotion à Londres et en a fait de la prison.** Claude La Colombière, supérieur du collège
de Paray en 1675, part en **1676** comme prédicateur de cour de **Marie de Modène, duchesse d'York**
et femme du futur Jacques II, réside à **St James's Palace** ; arrêté en **novembre 1678**, dénoncé
comme partie au **complot papiste** de Titus Oates, détenu une cinquantaine de jours puis expulsé,
mort à Paray en **1682**. Canonisation de Marguerite-Marie en **1920**. ③ **Vitré** : `1725`, `1734`,
`1737` — l'épistolier posé comme genre avant d'être utilisé (point de vigilance ⑤ du batch 52) :
édition clandestine en **1725**, puis **614 lettres** publiées par sa petite-fille Pauline de Simiane
entre **1734 et 1737**. ⚠️ Simiane est une **éditrice intrusive** qui écarte et réécrit : ce qu'on
lit depuis trois siècles n'est pas tout à fait ce qui a été posté, dit avant qu'on entre dans la
pièce. ④ **Noirmoutier** : `1999`, `2018` — la règle de marée **démontrée par une organisation qui a
dû se dérouter**. Tour **1999**, étape 2 : chute en chaîne sur le Gois, peloton coupé de **six
minutes**, Alex Zülle (2e à Paris) ne rattrape jamais. **2018** : le Tour repart de
**Noirmoutier-en-l'Île même** en prévoyant le Gois et sort finalement **par le pont**, la course
ayant été décalée d'une semaine pour la Coupe du monde et les heures de marée ne collant plus. ⑤
**Sedan** : `1871`, `1914`, cadrage franco-prussien, plus **un désamorçage d'étymologie** dans la
manière de « faire ripaille » (batch 40) : un anglophone qui connaît *sedan* (chaise à porteurs, et
en usage américain une carrosserie) supposera que le mot vient de la ville. **C'est une conjecture de
Samuel Johnson et l'OED la désavoue** ; la thèse italienne (*sede*, *sedere*) n'a pas de preuve non
plus. L'origine est **inconnue**.
⚠️ **Le contrôle de figures ne voit que les chiffres, pas les nombres écrits en lettres.** Il sort
**0 écart sur Les Andelys et Firminy** alors que ces deux guides portent justement la matière
anglophone la plus lourde du lot, écrite en lettres : ① **Les Andelys** — le FR dit que la place tient
six mois et tombe le 6 mars 1204 **sans nommer qui la tenait**, à savoir **Roger de Lacy, baron de
Pontefract, commandant pour le roi Jean** ; le guide EN pose que c'est le sol où le duché de
Normandie cesse d'être anglo-normand, ajoute l'entrée française **par un conduit de latrines** jusqu'à
la chapelle, et les **quinze cents civils** réfugiés dans la place dont **un millier** est expulsé et
laissé passer par Philippe, un second groupe refoulé trouvant les portes closes, hivernant dans le
fossé et y perdant **environ la moitié** des siens (⚠️ chiffres divergents, ordre de grandeur seul) ;
② **Firminy** — **dix-sept sites dans sept pays**. **Ne pas lire un `0` de cette colonne comme
« aucune matière propre ».**
⚠️ **Quatre affirmations écrites au premier jet et retirées avant commit, faute de source et non de
vraisemblance** — même mode de défaillance qu'aux batches 42, 46 et 49 : ① la basilique de Paray
donnée témoin de Cluny III « par les mêmes ateliers » (simultanéité et parti architectural sourcés,
ateliers non) ; ② **Cluny placée « à une cinquantaine de kilomètres » de Paray** alors que le calcul
sur les coordonnées du seed donne **41,5 km** — et **Cluny n'étant pas dans `CITIES_SEED`**, la
coordonnée d'en face venait de ma mémoire, donc la distance est **retirée** et non corrigée ;
③ la chaire extérieure de Notre-Dame de Vitré attribuée à la Contre-Réforme et donnée pour rare ;
④ la toile de chanvre de Vitré qualifiée de toile à voile. Reformulé aussi : les trois transferts des
reliques de saint Philbert ne « cartographient » pas les raids scandinaves, chaque étape éloigne le
saint d'une côte exposée. **Seul le cas ② a été tranché par une mesure sur nos données ; les autres
sont tombés à la relecture de source.**
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **ni le Gois ni le pont ne sont
sur la commune** (l'île compte quatre communes ; Gois = Beauvoir-sur-Mer ↔ Barbâtre, pont =
Fromentine, à La Barre-de-Monts, ↔ Barbâtre, soit une vingtaine de km du bourg), **neuf balises =
refuges parce que le cas se produit**, **bassins salants = outil de travail sur propriété privée**,
**baignade en zone surveillée, drapeaux réglementaires** ; **unité d'habitation de Firminy = immeuble
habité** et **Firminy-Vert = quartier habité**, dits avant toute phrase attrayante ; **stade en
activité** ; **falaises de craie des Andelys** qui se détachent par plaques, balisage qui fait foi ;
**pas de gare aux Andelys** ; **Giverny commune à part entière**, visitée depuis Giverny, et **musée
de Vernon sous son nouveau nom** ; **Poussin n'a pratiquement pas travaillé aux Andelys** ; **accès
motorisé à la haute Restonica réglementé en saison**, renvoi à l'office de tourisme **et pas à un
calculateur d'itinéraire** ; **Melo et Capitello = haute montagne** ; **Paray ville sanctuaire**,
calendrier du sanctuaire, **chapelle de la Visitation lieu de culte en activité** ; **Via Vitae
partiellement volée le 21 novembre 2024**, à vérifier avant de se déplacer pour elle (doctrine de
l'Hermione absente de Rochefort, batch 36, reprise explicitement) ; **Jayet / Jaillet non tranché** ;
**jardin des Rochers « fin des années 1680 »**, 1689 ou 1690 non tranché ; **Les Rochers à 6 km mais
sur le territoire communal** ; **Bazeilles et Charleville-Mézières communes à part** ; **chantier de
Château-Gaillard en un an ou deux, non tranché**.
Ajouts sans chiffre propres au lecteur étranger : **Corte désambiguïsé dès la première ligne**
(patronyme, toponymes, *Cortes* espagnoles à une lettre près — point de vigilance ② du batch 52),
*Corti* donné en corse ; **collégiale** définie comme desservie par un collège de chanoines, ce qui
explique l'échelle du bâtiment aux Andelys ; **Marches de Bretagne** posées avec le fait que la
Bretagne était **un État distinct jusqu'au XVIe siècle** ; **Turenne rattaché au service hollandais**
et à la génération étudiée par Marlborough ; **frontière belge = passage Schengen intérieur sans
formalité mais avec pièce d'identité** ; **Saint-Malo nommé comme port de ferry** et Rennes comme
nœud ; **Charolais rattaché à la race bovine** ; **Chandigarh** nommée comme l'autre endroit où Le
Corbusier a bâti un morceau de ville entier ; **Sacré-Cœur présenté par les institutions anglophones
qui en portent le nom**.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27). Le
substitut prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity` (guides EN
1 003 → 1 010), `search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (**code 0**,
0 route FR sans jumelle), `npm run hreflang:check`, plus le contrôle de lookup / photo exhaustif, le
contrôle de figures ci-dessus et une vérification d'encodage (accents intacts, aucun mojibake, aucune
apostrophe typographique, aucun `m2` / `EUR` / `deg` ascii, aucune figure en `/10`, aucun horaire,
aucun tarif).
⚠️ Egress : `en.wikipedia.org` **et `westminster-abbey.org`** répondent **EGRESS_BLOCKED** en
`WebFetch` depuis la routine, alors que **la recherche web fonctionne** — faits recoupés sur
plusieurs résultats plutôt que sur une fiche unique, méthode retenue depuis le batch 48. C'est ce
recoupement qui a tranché la date d'*An Account of Corsica*, donnée **1766** par un résultat et
**février 1768** par les autres, libraires d'ancien compris.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Il reste **258 villes du
seed sur 540 sans guide tourisme** ; gisements nommés : **Saint-Herblain**, les **trois banlieues
bordelaises** jamais faites (Villenave-d'Ornon, Talence, Le Bouscat) et le reliquat du vivier du
batch 50 — **Gérardmer, Sanary-sur-Mer, Lannion, Hendaye, Saint-Flour, Embrun**.

**Batch 54 — FR, shipped 2026-10-07 : Gérardmer, Lannion, Saint-Flour, Semur-en-Auxois, Maubeuge,
Sartène, Sceaux.** Sept villes prises dans le vivier du batch 52 (Gérardmer, Lannion, Saint-Flour) et
dans les trous mesurés ce run par `relatedCities` des guides tourisme. **Compteurs mesurés : FR 289
(`-a-` strict 280 + 6 en `au-` + 3 en `aux-`), EN 282 ; `GUIDES` 1 199 → 1 206.** Aucun slug hors
gabarit. `metaTitle` 34-43, `metaDesc` 133-145, 10 sections, 654-837 mots (plus courts que la série :
choix de ne rien écrire qui ne soit sourcé), 0 em-dash. `search-index` relancé (1 206 guides, 274 tags,
inchangé), `sitemap:check` vert (FR 29 802, EN 29 397), `tsc` et `integrity` verts.
⚠️ **Correction de vivier : Maubeuge n'est PAS l'un des douze sites Vauban de l'UNESCO (2008)** — elle
est dans le réseau des places fortes mais pas dans l'inscription ; le guide le dit en intro. Autres
prudences : « accessible depuis » pour Garabit (Ruynes-en-Margeride), Alésia (Alise-Sainte-Reine),
Fontenay (Marmagne), Filitosa (Sollacaro), radôme (Pleumeur-Bodou), Longemer/Retournemer, Linge,
Vallée-aux-Loups (Châtenay-Malabry) ; Gérardmer reconstruite après l'incendie de nov. 1944 (~85 %) ;
château de Sceaux du Second Empire, pas de Colbert ; Catenacciu traité comme une cérémonie religieuse.
Ni le fait que Sceaux soit en RER B ni les horaires ne sont chiffrés. `npm run build` non lancé.
**Prochain run : batch EN** (écart FR→EN = 7 villes : gerardmer, lannion, saint-flour, semur-en-auxois,
maubeuge, sartene, sceaux). Vigilance : Maubeuge/UNESCO, Lannion↔Telstar (angle anglophone), Sceaux.
Gisements FR restants (non couverts, mesurés) : Montbard, Sainte-Maxime, Mandelieu-la-Napoule, Berck,
Florac, Sarreguemines, Saint-Claude, Péronne, Châteaudun, Montargis, Guebwiller, Sallanches.

**Batch 56 — FR, shipped 2026-10-10 : Châteaudun, Péronne, Sarreguemines, Montargis, Guebwiller,
Saint-Claude.** Parité FR/EN à l'arrivée (289/289 après diff avec table des articles), donc batch FR,
six villes prises dans les trous listés au batch 54 (aucune n'avait de guide). **Compteurs mesurés :
FR 295 (`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`), EN 289 ; `GUIDES` 1 213 → 1 219.**
Guides courts (8 à 10 sections), **uniquement des faits recoupés par recherche web ce run** (la
recherche fonctionne, `WebFetch` non essayé) : ni horaire, ni tarif, ni hauteur non sourcée ; les
divergences sont publiées (âge du château de Péronne fin XIIᵉ ou XIIIᵉ, donjon de Châteaudun
« dernier tiers du XIIᵉ », 131 ponts de Montargis **non repris** faute de recoupement, attribution
de la prasline à Jaluzot donnée comme tradition). Populations = Insee 2022 de
`data/city-population.json` (Saint-Claude 10 690 → 8 556 sur 2011-2022, dit sans verdict).
Prudences : « accessible depuis » pour Bliesbruck-Reinheim, Murbach, Thiepval/Longueval/Albert, Grand
Ballon ; munitions non explosées sur les terres de la Somme ; routes de montagne en hiver.
`tsc`, `integrity`, `search-index` (276 tags, 2 de plus) et `sitemap:check` (FR 30 609, EN 30 204)
verts ; `npm run build` non lancé. Contrôle lookup/photo exhaustif **non refait** ce run.
**Prochain run : batch EN** (écart FR→EN = 6 villes : chateaudun, peronne, sarreguemines, montargis,
guebwiller, saint-claude). Vigilance EN : Péronne (Historial, Louis XI 1468, front de la Somme vu de
Grande-Bretagne), Guebwiller (Grand Ballon), Montargis (désambiguïser des homonymes). Gisements FR
restants : Montbard, Sainte-Maxime, Mandelieu-la-Napoule, Berck, Florac-Trois-Rivières, Sallanches,
Saint-Herblain.

**Batch 57 — EN, rattrapage de parité, shipped 2026-10-11.** Les 6 jumelles `things-to-do-in-[slug]-2026` du batch 56 (Châteaudun, Péronne, Sarreguemines, Montargis, Guebwiller, Saint-Claude) dans `data/guides-en.ts`. **Compteurs mesurés : FR 295, EN 295 — écart nul** (diff des slugs après table des articles contractés ; `EN_GUIDES` 289 → 295). 8 sections, `metaTitle` 46-52, `metaDesc` ≤ 160, 0 em-dash. Lookup/photo vérifiés (6/6, ville en 1re position de `relatedCities`). Aucun tag neuf. Ajouts anglophones vérifiés par recherche web : Dunois = « Bastard of Orléans » ; incendie de Châteaudun le 18/10/1870 (aucun effectif cité, sources divergentes) ; Mont Saint-Quentin pris par le corps australien fin août 1918 (jours non donnés) ; *Quentin Durward* pour Louis XI à Péronne ; canal de Briare achevé en 1642 (longueur et écluses non citées) ; quatre grands crus de Guebwiller ; Grand Ballon ~1 424 m (une seule source). Prudences du FR reprises (Bliesbruck-Reinheim, Murbach, champ de bataille de la Somme hors Péronne, 131 ponts non repris, recul de Saint-Claude sans verdict). `tsc`, `integrity`, `search-index`, `parity`, `hreflang:check`, `sitemap:check` (EN 30 873) verts ; `npm run build` non lancé. **Prochain run : batch FR** — gisements : Montbard, Sainte-Maxime, Mandelieu-la-Napoule, Berck, Florac-Trois-Rivières, Sallanches, Saint-Herblain.

**Batch 58 — FR, shipped 2026-10-12 : Montbard, Sainte-Maxime, Mandelieu-la-Napoule, Berck, Florac-Trois-Rivières, Sallanches.** Six des sept gisements listés au batch 57 (Saint-Herblain écarté, toujours sans matière vérifiée). **Compteurs mesurés : FR 301 (`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`), EN 295 ; `GUIDES` → 1 234 (search-index).** 10 sections, populations Insee 2022. Faits recoupés par recherche web (fusion Florac + La Salle-Prunet en 2016 ; château de La Napoule acheté en 1918 par Henry Clews ; Sallanches incendiée en 1840 puis reconstruite en style sarde ; hôpital marin de Berck 1861/1869 ; tour Carrée de Sainte-Maxime = musée des traditions locales — le « musée du phonographe » de mémoire n'a pas été retrouvé et n'est pas repris). Prudences : « accessible depuis » pour Fontenay (Marmagne), Alésia, Bussy-Rabutin, Grande Forge (Buffon), Tanneron, Gorges du Tarn, Chamonix/Megève/Saint-Gervais, Le Touquet/Montreuil-sur-Mer ; arrêtés préfectoraux feux de forêt (Maures, Estérel) ; marée et phoques en baie d'Authie ; crues cévenoles. Ni horaire ni tarif. `tsc`, `integrity`, `search-index` (278 tags, +1), `sitemap:check` (FR 31 467) verts ; `npm run build` non lancé. ⚠️ Slugs fantômes évités : `le-touquet-paris-plage`, `montreuil-sur-mer`, `chamonix-mont-blanc`, `megeve` ne sont **pas** au seed (`montreuil` = 93).
**Prochain run : batch EN** (écart FR→EN = 6 villes : montbard, sainte-maxime, mandelieu-la-napoule, berck, florac-trois-rivieres, sallanches). Gisements FR restants : Saint-Herblain et trous à re-mesurer.

**Batch 59 — EN, rattrapage de parité, shipped 2026-10-14.** Les 6 jumelles `things-to-do-in-[slug]-2026` du batch 58 (Montbard, Sainte-Maxime, Mandelieu-la-Napoule, Berck, Florac-Trois-Rivières, Sallanches) dans `data/guides-en.ts`. **Compteurs mesurés : FR 301, EN 301 — écart nul** (diff des slugs après table des articles contractés ; `EN_GUIDES` 295 → 301). 8 sections, `metaTitle` ≤ 60, `metaDesc` ≤ 160, 0 em-dash, ville en 1re position de `relatedCities`. Aucun tag neuf créé (region tags réutilisés). Faits repris du FR, aucun chiffre hors Insee 2022 déjà cité ; prudences conservées (arrêtés préfectoraux feux de forêt Maures/Estérel, crues cévenoles, marée et phoques en baie d'Authie, « accessible depuis » pour Fontenay, Alésia, Tanneron, gorges du Tarn, Chamonix/Megève/Saint-Gervais, Le Touquet/Montreuil). Ajouts voyageur étranger sans chiffre : Stevenson et son âne (GR 70), mimosa-arbre et non cocktail, Savoie alors sarde. `tsc`, `integrity`, `search-index` (+`:check`), `parity`, `hreflang:check`, `sitemap:check` (EN 31 339) verts ; `npm run build` non lancé. Contrôle lookup/photo exhaustif non refait ce run. **Prochain run : batch FR** (écart nul) — gisements à re-mesurer (Saint-Herblain écarté faute de matière).

**Batch 60 — FR, shipped 2026-10-17 : Longwy, Thiers, Gien, Vallauris, La Flèche, Villefranche-de-Rouergue.** Parité 301/301 à l'arrivée, donc batch FR. Villes choisies par matière touristique réelle parmi les 263 du seed sans guide de la série (haut de liste par population = banlieues franciliennes pauvres en matière). **Compteurs mesurés : FR 307 (`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`), EN 301 ; `search-index` 1 257 guides, 281 tags.** Guides courts (508-651 mots, 10 sections), uniquement des faits recoupés par recherche web ce run ; aucun horaire ni tarif ; populations Insee 2022. Prudences : ville haute de Longwy habitée et bombardée en 1914/1944 (UNESCO 2008) ; Prytanée de La Flèche en activité (accès limité) ; superlatif du cloître de la chartreuse de Villefranche ramené à « parmi les plus grands » (sources divergentes) ; nombre d'espèces du zoo non figé ; « accessible depuis » pour Cannes/Antibes (Vallauris, Golfe-Juan fait partie de la commune), Najac, vallée du Loir, parc Livradois-Forez. Gisements restants plausibles : Brioude, Issoire, Limoux, Parthenay, Maisons-Laffitte, Sèvres, Saint-Cloud, Abbeville, Biscarrosse. `tsc`, `integrity`, `search-index(:check)`, `sitemap:check` (FR 31 819) verts ; `npm run build` non lancé. **Prochain run : batch EN** (écart FR→EN = 6 villes : longwy, thiers, gien, vallauris, la-fleche, villefranche-de-rouergue).

**Batch 61 — EN, rattrapage de parité, shipped 2026-10-18.** Les 6 jumelles `things-to-do-in-[slug]-2026` du batch 60 (Longwy, Thiers, Gien, Vallauris, La Flèche, Villefranche-de-Rouergue) dans `data/guides-en.ts`. **Compteurs mesurés : FR 307, EN 307 — écart nul** (diff des slugs après table des articles contractés ; `EN_GUIDES` 301 → 307). 7-8 sections, `metaTitle` ≤ 40, `metaDesc` ≤ 132, 0 em-dash, ville en 1re position de `relatedCities`, photo d'en-tête retrouvée (6/6). Aucun tag neuf. Faits repris du FR, aucun chiffre hors guide FR ; prudences conservées (ville haute de Longwy habitée et abîmée en 1914/1944, Prytanée en activité, superlatif du cloître de Villefranche ramené à « parmi les plus grands », Golfe-Juan dans la commune de Vallauris, Cannes/Antibes « reached from »). Ajouts voyageur étranger sans chiffre : frontières Schengen intérieures à Longwy, Sheffield pour la coutellerie de Thiers, fondateur anglais de la faïencerie de Gien, bastides françaises et anglaises. `tsc`, `integrity`, `search-index(:check)` (118 tags EN), `sitemap:check` (EN 32 013), `hreflang:check` verts ; `npm run build` non lancé. **Prochain run : batch FR** (écart nul) — gisements à re-mesurer.

**Batch 62 — FR, shipped 2026-10-19 : Saint-Cloud, Sèvres, Maisons-Laffitte, Abbeville, Brioude, Issoire.** Parité 307/307 à l'arrivée, donc batch FR. **Compteurs mesurés : FR 313 (`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`), EN 307 ; `search-index` 1 305 guides, 284 tags.** 10 sections, 360-540 mots, populations Insee 2022, aucun horaire ni tarif. Faits recoupés par recherche web ce run ; divergences laissées ouvertes : date de fondation du musée de Sèvres, dates de la basilique de Brioude (XIe-XIVe), année du déblaiement des ruines de Saint-Cloud (1891 ou 1892), adresse du musée Boucher-de-Perthes à Abbeville. Prudences : pavillon de Breteuil (BIPM) côté Sèvres, non visitable ; hippodrome et pistes de Maisons-Laffitte ; baie de Somme et marées « accessible depuis » ; Chavaniac, Saint-Nectaire, Parentignat hors commune. `tsc`, `integrity`, `search-index(:check)`, `sitemap:check` (FR 32 465) verts ; `npm run build` non lancé. Lookup/photo exhaustif non refait. Gisements restants : Biscarrosse, Pamiers, Limoux, Parthenay, Cluses, Bagnols-sur-Cèze, Hazebrouck, Saint-Herblain (sans matière). **Prochain run : batch EN** (écart FR→EN = 6 villes : saint-cloud, sevres, maisons-laffitte, abbeville, brioude, issoire).

**Batch 63 — EN, rattrapage de parité, shipped 2026-10-21.** Les 6 jumelles `things-to-do-in-[slug]-2026` du batch 62 (Saint-Cloud, Sèvres, Maisons-Laffitte, Abbeville, Brioude, Issoire) dans `data/guides-en.ts`. **Compteurs mesurés : FR 313, EN 313 — écart nul** (diff des slugs après table des articles contractés ; `EN_GUIDES` 307 → 313 ; `search-index.en.json` 1 101 guides, 118 tags, inchangé donc aucune page `/tags/` neuve). 7 sections, `metaTitle` ≤ 40, `metaDesc` ≤ 125, 0 em-dash, ville en 1re position de `relatedCities`. Faits repris des guides FR, populations Insee 2022 déjà citées ; prudences conservées (pavillon de Breteuil côté Sèvres non visitable, divergence de date du musée de Sèvres non tranchée, hippodrome et pistes de Maisons-Laffitte, marée en baie de Somme, Chavaniac / Saint-Nectaire / Parentignat hors commune). Ajouts voyageur étranger sans chiffre : RER A et « collégiale » / beffroi définis, traité d'Abbeville de 1259 (Louis IX / Henri III) lu comme repère franco-anglais. `tsc`, `integrity`, `search-index(:check)` verts ; `npm run build` non lancé. **Prochain run : batch FR** (écart nul) — gisements : Biscarrosse, Pamiers, Limoux, Parthenay, Cluses, Bagnols-sur-Cèze, Hazebrouck.

**Batch 64 — FR, shipped 2026-10-25 : Meudon, Romans-sur-Isère, Étampes, Dreux, Oyonnax, Nogent-sur-Marne.** Parité 313/313 à l'arrivée, donc batch FR. **Compteurs mesurés : FR 319 (`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`), EN 313 ; `search-index` 1 339 guides, 289 tags.** 10 sections, guides courts, populations Insee 2022, loyers T3 de `data/housing.ts`, aucun horaire ni tarif. Faits recoupés par recherche web ce run ; divergences laissées ouvertes : numéro d'origine du pavillon Baltard, dates de la collégiale de Romans (XIe-XVIIIe selon la source), dates de l'église Saint-Pierre de Dreux. Prudences : musée d'art et d'histoire de Dreux ≠ chapelle royale ; Bourg-de-Péage commune distincte de Romans ; lacs de Nantua et Genin, Vincennes « accessible depuis ». Lookup/photo exhaustif non refait. **Prochain run : batch EN** (écart FR→EN = 6 villes : meudon, romans-sur-isere, etampes, dreux, oyonnax, nogent-sur-marne).

**Batch 65 — EN, rattrapage de parité, shipped 2026-10-26.** Les 6 jumelles `things-to-do-in-[slug]-2026` du batch 64 (Meudon, Romans-sur-Isère, Étampes, Dreux, Oyonnax, Nogent-sur-Marne) dans `data/guides-en.ts`. **Compteurs mesurés : FR 319, EN 319 — écart nul** (`grep -c 'slug: "things-to-do-in-.*-2026"'` ; `search-index.en.json` 1 165 guides, 126 tags). 10 sections, mêmes chiffres que les guides FR (Insee 2022, loyers T3 de notre estimation), aucun chiffre neuf, prudences conservées (villa des Brillants à Meudon, Bourg-de-Péage commune distincte, musée de Dreux ≠ chapelle royale, lacs de Nantua et Genin en excursion, Vincennes « reached from »). Ajouts voyageur étranger sans chiffre : collégiale, beffroi, Hôtel-Dieu et guinguette définis en une incise, Anne de Pisseleu et Diane de Poitiers situées, Maison d'Orléans présentée. `tsc`, `integrity`, `search-index(:check)` verts ; `npm run build` non lancé ; lookup/photo exhaustif non refait. **Prochain run : batch FR** (écart nul).

**Batch 66 — FR, shipped 2026-10-28 : Parthenay, Limoux, Hazebrouck, Pamiers, Biscarrosse, Cluses.** Parité 319/319 à l'arrivée, donc batch FR. **Compteurs mesurés : FR 325 (`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`), EN 319 ; `search-index` 1 382 guides, 290 tags.** 10 sections, guides courts, populations Insee 2022 et loyers T3 de `data/housing.ts`, aucun tarif ; faits recoupés par recherche web (résultats minces : Notre-Dame de Marceille, FLIP, Fort de Pamiers, beffroi d'Hazebrouck non confirmés, donc **non écrits** ; Hazebrouck n'est pas donnée UNESCO). Prudences : horaires du musée de l'hydraviation divergents, cathédrale de Pamiers ouverte par créneaux, comparaisons T3 avec voisines du seed. `tsc`, `integrity`, `search-index(:check)`, `sitemap:check` verts ; `npm run build` non lancé. ⚠️ Insérer les guides avec des clés non quotées (`slug: "…"`) : un JSON.stringify brut fait rater le grep de comptage. **Prochain run : batch EN** (écart FR→EN = 6 villes : parthenay, limoux, hazebrouck, pamiers, biscarrosse, cluses).

**Batch 67 — EN, rattrapage de parité, shipped 2026-10-31.** Les 6 jumelles `things-to-do-in-[slug]-2026` du batch 66 (Parthenay, Limoux, Hazebrouck, Pamiers, Biscarrosse, Cluses) dans `data/guides-en.ts`, `category: "city-guide"`. **Compteurs mesurés : FR 325, EN 325 — écart nul** (`search-index.en.json` 1 268 guides, 136 tags). Mêmes chiffres et mêmes prudences que le FR (horaires du musée de l'hydraviation divergents, cathédrale de Pamiers par créneaux, Hazebrouck sans UNESCO), aucun chiffre neuf ; ajouts voyageur étranger : blanquette, géants, décolletage et sous-préfecture définis en une incise. `tsc`, `integrity`, `search-index(:check)`, `sitemap:check` verts ; `npm run build` non lancé. **Prochain run : batch FR** (écart nul).

**Guide data-led `rendement-locatif-brut-villes-pas-cheres-piege-2026` (budget), shipped 2026-10-10 — `GUIDES` 1 219 → 1 220 (compte `search-index`).** Rendement brut = loyer T2 annuel (`data/housing.ts`) ÷ (médiane DVF appartement 2024-2025 × 45 m²), 362 communes (pop 2022 > 20 000, ≥ 100 ventes, Alsace-Moselle hors DVF), croisé avec la variation de population Insee 2011→2022. Résultat publié : médiane 7,4 %, Montluçon 19,2 % en tête, et un gradient net (variation médiane −1,8 % sur les 30 premières, 19/30 perdent des habitants, +6,0 % sur les 92 dernières ; corrélation de rang −0,29, avec le score global +0,04). La surface de 45 m² est une constante qui ne change pas l'ordre ; vacance, taxe foncière et travaux sont dits non mesurés. Pas de série : ne pas décliner par ville avec des chiffres non sourcés (la série `investir-locatif-[ville]` héritée en contient).

**Batch 36 — FR, shipped 2026-08-29 : Orange, Saint-Germain-en-Laye, La Ciotat, Rochefort, Dieppe,
Douai, Sens.** Sept villes, sept régions différentes, et le même arbitrage qu'aux batches 26, 32 et
34, assumé une fois de plus contre la liste de gisements : **on choisit par matière touristique
réelle, pas par inertie de liste**. Les six banlieues de province (Villenave-d'Ornon, Talence,
Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron) **restent en piste et n'ont toujours pas été
faites** — mais laisser **Orange**, qui porte deux monuments romains inscrits à l'UNESCO depuis
1981, sans guide pour écrire Le Bouscat n'était pas défendable. Le constat qui a décidé du batch :
en listant les 322 villes du seed non couvertes par population, le haut de liste est presque
entièrement francilien et pauvre en matière vérifiable, alors que sept trous **majeurs** dormaient
plus bas — la première cathédrale gothique de la chrétienté (Sens), la plus ancienne salle de cinéma
du monde (La Ciotat), la plus longue manufacture d'Europe à sa construction (Rochefort), la première
station balnéaire de France (Dieppe), le plus important carillon de France (Douai) et le musée
d'archéologie de référence du pays (Saint-Germain-en-Laye).
**Compteurs mesurés : FR 226 (`-a-` strict 219 + 5 en `au-` + 2 en `aux-`), EN 219 ; `GUIDES` 1012 →
1019.** Aucun nouveau slug hors gabarit : les sept villes prennent toutes « à » sans contraction, les
sept exceptions restent `au-puy-en-velay`, `au-tampon`, `au-francois`, `au-robert`, `au-lamentin`,
`aux-abymes`, `aux-sables-d-olonne`. `metaTitle` 32-41 caractères, `metaDesc` 141-155, 10 sections
par guide, densité d'accents 0,135-0,180 (**par mot, pas par lettre** — seuil ascii-strip 0,09).
`npm run search-index` relancé (`data/search-index.json` 1019 guides, 245 → **248 tags**, donc trois
pages `/tags/` neuves) et **`npm run sitemap:check` repassé** à cause d'elles (FR 29 096 URL,
EN 28 666). Les sept guides ont été vérifiés **retrouvés par le lookup de
`app/villes/[slug]/a-faire/page.tsx` et pourvus de leur photo d'en-tête** (`guideCityPhoto`).
⚠️ **Le fait le plus important du batch est une correction : l'Hermione n'est pas à Rochefort.** La
réplique a bien été construite dans l'arsenal à partir de juillet 1997 et mise à l'eau le 7 septembre
2014, mais elle est **immobilisée en cale sèche à Anglet, dans le port de Bayonne, depuis l'automne
2021**, et l'association qui la porte a connu de graves difficultés financières. Un guide qui envoie
un lecteur à Rochefort voir l'Hermione l'envoie à 300 km de la frégate : la section le dit
explicitement et invite à vérifier avant de se déplacer pour elle. Deux autres pièges de calendrier
et d'attribution écartés de la même façon : le **festival de cerf-volant de Dieppe est biennal et
tombe les années impaires** (édition 2025, prochaine attendue en 2027, **donc rien en 2026** — une
page qui promet le contraire recopie une édition précédente) ; et **Louis XIV est né au Château-Neuf
de Saint-Germain-en-Laye, pas dans le château qu'on visite**, lequel abrite le Musée d'Archéologie
nationale — le Château-Neuf est détruit, il n'en reste que le Pavillon Henri IV. La légende des
spectateurs fuyant *L'Arrivée d'un train* est donnée pour ce qu'elle est, **une histoire construite
après coup** : la première projection publique payante des vues Lumière a eu lieu à Paris en décembre
1895, et à l'Eden c'est le 21 mars 1899 qui fait date.
Faits vérifiés en ligne avant rédaction et qui portent les guides : mur de scène d'Orange **103 m ×
37 m, 1,80 m d'épaisseur**, seul mur de scène romain conservé entier en Occident, statue d'Auguste de
**3,55 m**, arc élevé vers **20-25** pour les victoires de Germanicus sur la **via Agrippa**, classé
MH dès **1840** ; **cadastres romains découverts en 1949**, 416 fragments, ordonnés sous **Vespasien
en 77**, les mieux conservés au monde ; Chorégies nées des Fêtes romaines de **1869**, nom adopté en
**1903**, plus ancien festival de France ; MAN créé par décret impérial du **8 mars 1862**, inauguré
le **12 mai 1867**, restauration d'**Eugène Millet**, élève de Viollet-le-Duc ; Grande Terrasse de
Le Nôtre, **2,4 km**, **1669-1673** ; Debussy né le **22 août 1862** au 38 rue au Pain, musée ouvert
en **1990** ; Le Prieuré de Maurice Denis, **ancien hôpital royal voulu par Mme de Montespan**,
acheté en **1914**, donation de **1976** ; Eden Théâtre ouvert le **15 juin 1889** ; **pétanque née
en 1907** (Jules Hugues dit Lenoir, terrain des frères Pitiot, premier concours en **1910**, du
provençal *pèd tanca*) ; **île Verte, seule île boisée des Bouches-du-Rhône**, 13 ha, acquise par le
département en **1963** ; Corderie Royale **374 m** ; **maison de Pierre Loti rouverte le 10 juin
2025** après douze ans de fermeture, **visites guidées uniquement, groupes de dix, ~1 h 30, donc
réservation obligatoire** ; pont transbordeur de Martrou **1898-1900**, Ferdinand Arnodin, **dernier
de France** et huit dans le monde, MH le **30 avril 1976**, restauré 2016-2020, réinauguré le
**29 juillet 2020**, ouvert d'avril à début novembre ; bains de mer de Dieppe en **1824**, bain de la
duchesse de Berry le **3 août 1824**, séjours jusqu'en 1829 ; **plus grande collection d'ivoires
d'Europe** au château-musée ; Estran Cité de la Mer créé le **20 mai 1987** ; opération **Jubilee du
19 août 1942**, un peu plus de 6 000 hommes dont près de 5 000 Canadiens, cinq points sur une
quinzaine de kilomètres, journée la plus meurtrière de la guerre pour le Canada ; beffroi de Douai
commencé en **1391**, UNESCO **2005**, **carillon de 62 cloches**, le plus important de France ;
**Gayant né en 1530** (procession de saint Maurand, *gayant* = géant en picard), M. Gayant **8,50 m
et 370 kg**, Marie Cagenon **6,25 m**, Jacquot, Fillon et Binbin, fêtes le **dimanche suivant le
5 juillet** et les deux jours suivants ; musée de la Chartreuse dans l'**hôtel d'Abancourt (1559)** et
l'**aile Montmorency (1608)**, musée depuis **1958**, plus de 10 000 œuvres ; **Lewarde, plus grand
musée de la mine de France**, ancienne fosse Delloye, plus de 150 000 visiteurs/an, **270 ans**
d'exploitation ; cathédrale de Sens ouverte **vers 1135** sous Henri Sanglier, consacrée en **1164**,
**première cathédrale gothique**, **Guillaume de Sens** appelé ensuite à reconstruire le chœur de
**Cantorbéry après l'incendie de 1174** ; **vêtements liturgiques de Thomas Becket** au trésor (venu à
Sens en **1164** puis **1170**), trésor parmi les plus riches de France avec Conques ; marché couvert
de Sens inauguré en **1882**, style Baltard, MH **1975**, architectes Horace Lefort et Benoni Roblot.
Les seuls chiffres de population sont ceux de l'Insee 2022 lus dans `data/city-population.json`
(Orange 29 357, Saint-Germain-en-Laye 45 286, La Ciotat 37 599, Rochefort 23 188, Dieppe 28 599,
Douai 39 833, Sens 27 275) — **pas les `population` approximatives du seed**. Aucun horaire, aucun
tarif. Convention « **accessible depuis** » plutôt que « situé à » tenue partout : Châteauneuf-du-Pape,
Gigondas et Vacqueyras depuis Orange, la **Maison du Transbordeur qui est à Échillais** et l'île d'Aix
depuis Rochefort, le **cimetière militaire canadien de Hautot-sur-Mer** et Varengeville depuis Dieppe,
le **Centre historique minier qui est à Lewarde** depuis Douai. Deux prudences de sécurité assumées :
la baignade à **Figuerolles se fait sans surveillance permanente**, et les **falaises de craie
s'effondrent par plaques** sur la côte d'Albâtre, donc distance au bord et balisage respectés.
⚠️ **`npm run build` n'a pas été lancé, volontairement** — c'est ce que la section Commands interdit
depuis le batch 27 (4 h 30 de génération, `.next` à 25 Go, aucun signal utile, ENOSPC avant la
finalisation). Le substitut prescrit a été exécuté en entier et passe : `npx tsc --noEmit` **propre**,
`npm run integrity`, `search-index` + `search-index:check`, `sitemap:check`, plus le contrôle de
lookup / photo et un contrôle de charge des vraies gardes (`assertUniqueSlugs` / `assertKnownSlugs`)
par import du module.
Écart FR→EN après ce batch : **7 villes** (orange, saint-germain-en-laye, la-ciotat, rochefort,
dieppe, douai, sens) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**.
Rappel de la règle tranchée au batch 33 : côté EN, le slug se dérive du **slug de seed tel quel**
(`getEnGuide('things-to-do-in-' + slug + '-2026')`), jamais d'une version « propre » — donc
`things-to-do-in-la-ciotat-2026` et `things-to-do-in-saint-germain-en-laye-2026` gardent leur forme
complète. Trois points de vigilance pour ces jumelles : **`things-to-do-in-orange-2026` est un slug
ambigu en anglais** (le mot *orange*, la maison d'Orange-Nassau, le comté d'Orange en Californie) —
l'intro doit poser la ville dès la première ligne ; l'angle voyageur étranger a de la matière propre
sur trois de ces villes (le lien **Orange / Orange-Nassau / maillot néerlandais**, la filiation
**Sens → Cantorbéry** qui parle beaucoup plus à un lecteur britannique qu'à un français, et
**Jubilee**, qui est de l'histoire canadienne avant d'être de l'histoire française — la liaison
transmanche **Dieppe-Newhaven** rend d'ailleurs Dieppe atteignable sans avion depuis l'Angleterre) ;
et l'avertissement **Hermione** doit être repris tel quel, un lecteur étranger étant encore plus
susceptible de faire le détour pour un bateau qui n'est pas là.
Pour le batch FR **suivant**, les gisements restants sont les six banlieues de province ci-dessus et,
côté trous touristiques réels mesurés ce run, **Rueil-Malmaison** (château de Malmaison, Joséphine),
**Poissy** (villa Savoye, Le Corbusier, UNESCO), **Dole** (ville natale de Pasteur), **Soissons**
(abbaye Saint-Jean-des-Vignes), **Bergerac**, **Carpentras** (synagogue, cathédrale Saint-Siffrein),
**Agde**, **Thonon-les-Bains** et **Vernon** (d'où Giverny est accessible) — tous vérifiés présents
au seed et sans guide, et tous plus riches en matière vérifiable que le haut de la liste par
population. Les trous listés au batch 34 (Saint-Herblain, Mantes-la-Jolie, Istres, Cambrai) restent
ouverts.

**Batch 37 — EN, rattrapage de parité, shipped 2026-08-30.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 36 écrites d'un coup dans `data/guides-en.ts` (Orange,
Saint-Germain-en-Laye, La Ciotat, Rochefort, Dieppe, Douai, Sens). **Compteurs mesurés : FR 226,
EN 226 — écart nul, parité rétablie** (`EN_GUIDES` 780 → 787). Aucun slug hors gabarit : les sept
villes prennent « à » sans contraction, donc la règle du batch 33 (**côté EN le slug se dérive du
slug de seed tel quel**) n'avait rien à arbitrer, et les sept exceptions restent `au-puy-en-velay`,
`au-tampon`, `au-francois`, `au-robert`, `au-lamentin`, `aux-abymes`, `aux-sables-d-olonne`.
`metaTitle` 46-53 caractères, `metaDesc` 145-159, 8 sections par guide (la série FR en compte 10,
l'EN fusionne les fins de liste), 0 em-dash. Aucun tag neuf — les 7 réutilisent `provence`,
`ile-de-france`, `atlantic coast`, `normandy`, `hauts-de-france`, `burgundy`, et les tags de ville
restent à 1 occurrence, sous le seuil de 3 qui crée une page `/tags`. `npm run search-index`
relancé (`data/search-index.en.json` 787 guides, **108 tags**, inchangé) et `npm run sitemap:check`
repassé (FR 29 104 URL, EN 28 673). Les 7 guides sont vérifiés **retrouvés par
`getEnGuide()`**, **pourvus de leur photo d'en-tête** (`guideCityPhoto`) et **remontés en 1re
position** par la recherche inverse `relatedCities` de `CityGuidesList` sur leur page ville EN.
⚠️ **Une erreur de fait du guide FR corrigée des deux côtés** : le guide Sens datait le contraste
entre le marché couvert et la cathédrale « à deux siècles et demi de distance » alors que le même
guide ouvre le chantier **vers 1135** et inaugure le marché en **1882** — sept siècles et demi. Les
dates prises une à une étaient justes, c'est **l'écart calculé entre elles** qui dérapait, et aucun
contrôle automatique ne peut le voir. Contrôle mécanique des figures : chaque nombre du texte EN
cherché dans la jumelle FR après normalisation des séparateurs, **112 figures, 112 retrouvées**.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **l'Hermione n'est pas à
Rochefort** (cale sèche à Anglet depuis l'automne 2021, avertissement appuyé côté EN), **pas
d'édition 2026 du festival de cerf-volant de Dieppe** (biennal, années impaires), **Louis XIV né au
Château-Neuf** détruit et non dans le château visitable, la fuite des spectateurs devant
*L'Arrivée d'un train* donnée comme **histoire construite après coup**, **baignade sans surveillance
permanente à Figuerolles**, **falaises de craie qui s'effondrent par plaques**, et la convention
« accessible depuis » tenue partout. Six ajouts propres à l'angle voyageur étranger : la
**désambiguïsation d'Orange** dès la première ligne (ni le fruit, ni l'opérateur, ni le comté
californien), le **RER A**, la **pétanque** et le **mistral** expliqués en une incise, le
**carillon** et le **beffroi** définis, la filiation **Sens → Cantorbéry** posée pour un lecteur
britannique, et la **liaison transmanche Dieppe-Newhaven** avec Jubilee présentée comme de
l'histoire canadienne.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Gisements inchangés :
les six banlieues de province jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ;
Vaulx-en-Velin, Saint-Priest, Bron) et les trous listés aux batches 34 et 36 ci-dessus.



### Pending guide work
- **Editorial rewrite (R7.8) — DONE.** Main pass ran 2026-05-30 (all guides → prose voice). Fragment-tail cleanup ran 2026-06-03: the 23 budget/acheter/investment guides the first pass missed (numbered `(N) **Label** : value` scaffolding, detected via `boldColon>=40`) rewritten into flowing prose, 228 strings, figure-integrity verified. Method: extract verbatim bodies → parallel read-only agents → single-writer exact-match apply (see `[[parallel-agents-single-file]]`). Only `intro`/`sections[].body` touched.
  - *Accent restoration — DONE 2026-06-03.* 58 tourism guides (`10-choses-a-faire-*`, incl. Paris/Bordeaux) had been saved ascii-stripped (`decoupe`, `a 57 m`, `28,30 EUR`, `m2`, `360 deg`); diacritics + `€/°/m²/m³` restored across 638 strings, word-skeleton integrity verified. Detected by accent-density < 0.09 (the earlier "~33" estimate undercounted). Legit currency-code `EUR` (EUR/USD context) left intact.

Vivre sans voiture +5, Acheter à [ville] +5, and the "Lire ensuite" reading list (via `lib/guide-suggestions.ts` + auto-block on each guide page) are shipped.


- 2026-10-29 agent contenu : +3 guides thématiques data-led (FR `annees-de-niveau-de-vie-pour-acheter-50-m2-409-villes-2026`, FR `villes-les-plus-jeunes-de-france-part-des-15-29-ans-2026`, EN `income-needed-to-rent-a-studio-in-france-409-cities-2026`). Corpus mesuré : FR 1408 guides, EN 1214 guides (`grep -c "^    slug:"`). Prochain lot : angles Insee × loyers déjà calculables (part des 60+ vs santé, densité vs prix).

- 2026-10-31 — guides data-led démographie : +2 FR (villes-qui-gagnent-le-plus-d-habitants-2016-2022-413-villes-2026, villes-les-plus-agees-de-france-part-des-75-ans-et-plus-2026) + 2 jumelles EN natives. Compte mesuré : 1 435 guides FR, 1 274 EN (search-index). Prochain lot : part des moins de 15 ans (familles) ou taille des ménages.
