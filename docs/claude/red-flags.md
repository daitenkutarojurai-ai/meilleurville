# Red Flag Radar

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Section d'origine conservée mot pour mot.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


### Red Flag Radar (`lib/red-flag-themes.ts`)

Un thème = une entrée de `RED_FLAG_THEMES` (slug, titre, meta, `intro` / `reality` / `methodology`,
`rank()`) **plus** un dossier `app/red-flags/<slug>/page.tsx` de 20 lignes qui lit
`getRedFlagTheme()` et rend `<RedFlagThemePage>`. Le hub `/red-flags` et le sitemap dérivent tous
les deux de la liste, il n'y a donc rien d'autre à câbler ; l'EN est une **sélection à part**
(`EN_THEMES` dans `app/[locale]/red-flags/themes/[slug]/page.tsx`, qui réutilise le `rank()` FR via
`frSlug`) — un thème FR sans jumelle EN est normal et ne demande pas de hreflang. **Compteurs
mesurés (`grep -c '^    slug: "'` et `ls app/red-flags | grep -c villes-`) : 45 thèmes, 45 dossiers**
(2026-10-28). Dernier ajouté : **`villes-littoral-taux-d-effort-eleve`** — T3 × 12 ÷ (niveau de vie médian × 1,8 UC), villes de métropole ≥ 20 000 hab. à ≤ 10 km de la mer ouverte (`lib/city-coast.ts`), taux ≥ 35 % : 16 villes sur 47 (médiane littorale 31,9 % ≈ médiane nationale 31,6 %), 12 en PACA dont 7 dans les Alpes-Maritimes ; Cannes 53,4 %, Nice 46,4 %. Outre-mer exclu (Filosofi). Aucun score ; recouvrement 1 avec `villes-pauvres-loyers-hauts`, 3 avec `villes-couts-explosifs`. Précédent : **`villes-acheter-plus-cher-que-louer`** — prix médian DVF appartement (2024-2025) × 65 m² ÷ 12 × loyer T3 de `data/housing.ts`, en années de loyer ; médiane 14,7 sur 383 villes (≥ 20 000 hab., ≥ 100 ventes), 43 villes à 20 ans ou plus (29 en Île-de-France dont 18 dans les Hauts-de-Seine, 12 villes côtières de métropole, 2 à La Réunion) ; Saint-Paul (974) en tête à 31,9 sur un prix appartement douteux (dit dans la méthodologie). Aucun score, 7 villes communes avec `villes-achat-hors-de-portee`, 8 avec `villes-regrets-achat`. Précédent : **`villes-pauvres-loyers-hauts`** — taux de pauvreté communal (Filosofi 2021, ≥ 22 %, médiane 19 % sur 409 villes de 20 000 hab. et plus) croisé avec un T3 ≥ 1,10 × la médiane (1 080 €) : 165 villes passent le seuil de pauvreté, dont 118 ont un T3 *sous* la médiane (Roubaix 46 % / 700 €), 26 cumulent (23 en Île-de-France, Seine-Saint-Denis 9) ; Aubervilliers ouvre. Aucun score, aucune causalité, taux publié en entier (tri sur la valeur non arrondie). Précédent : **`villes-vieillir-loin-des-soins`** — part des 75 ans et plus (Insee 2022, **mesurée**, ≥ 12 %, médiane 9,5 % sur 521 villes de 10 000 hab. et plus) croisée avec le composite d'accès aux soins de `lib/healthcare-access.ts` (**estimé**, ≥ 6/10, 10 = désert) : 139 villes passent le seuil d'âge, 97 celui des soins, 57 cumulent (49 « tendu », 8 « désert »). Arcachon ouvre (30,0 %), Vichy est la première ville de plus de 20 000 hab. (7ᵉ) ; stations balnéaires/thermales d'un côté, sous-préfectures de l'intérieur de l'autre ; T3 médian 720 € contre 950 €. Réserves publiées : EHPAD comptés dans la part, soins estimés et non relevés, aucune causalité. Severity 6 + 0,12 × écart de part + 0,5 × (composite − 6), aucun plafond atteint. Précédent : **`villes-jeunes-studio-cher`** — deux mesures publiées, aucun score : part des 15-29 ans (Insee 2022, `lib/city-population.ts`) ≥ 24 % croisée avec un T1 de `data/housing.ts` ≥ 1,10 × la médiane des 361 villes de 20 000 hab. et plus (540 €). 50 villes passent le seuil de jeunesse (médiane 19,5 %), 145 celui du loyer, 15 cumulent ; Talence ouvre (36,5 %, T1 620 €), Paris suit (2,2 × la médiane). Résultat contre-intuitif publié : le T1 médian des 50 villes jeunes est de 510 €, sous celui du corpus — Lille, Rennes, Nancy, Poitiers restent sous le seuil. La tranche 15-29 ans mélange étudiants et jeunes actifs, et le thème n'affirme aucune causalité. Avant-dernier : **`villes-arrivees-loyers-hauts`** — deux mesures publiées, aucun score : villes de 20 000 hab. et plus qui gagnent ≥ 10 % d'habitants (Insee 2011→2022) et ≥ 4 % sur 2016-2022 avec un T3 ≥ 1,15 × la médiane des 361 villes comparées (1 010 €). 71 villes passent la croissance, 27 le loyer (17 en Île-de-France), 15 publiées ; Bagnolet ouvre. Aucune causalité ni pénurie de parc affirmée (pas de données de stock), et 19 des 71 ont un T3 sous la médiane (Villenave-d'Ornon, +45,5 %, est pile à 1 010 €). Avant-dernier : **`villes-sans-enfants`** — troisième thème du fichier bâti sur une
**mesure publiée et aucun score**, après `villes-qui-se-vident` et les deux thèmes DVF. L'indicateur
est le nombre de résidents de 60 ans et plus par résident de moins de 15 ans, pris dans les tranches
d'âge que l'Insee publie à la commune (`lib/city-population.ts`, 538/540). Médiane des 472 villes de
plus de 10 000 habitants : **1,50**, les moins de 15 ans y pesant **16,9 %**. **28 communes dépassent
3,00**, Arcachon ouvrant à **9,14** (720 enfants pour 6 586 habitants de 60 ans et plus, soit 60,4 %
de la population au-dessus de 60 ans et 6,6 % en dessous de 15), devant Royan 7,03, Dinard 5,83,
La Baule 5,15 et Granville 4,96.
⚠️ **Le résultat contredit la lecture réflexe, et c'est tout l'intérêt du thème : ce ne sont pas des
villes pauvres en déclin, ce sont des stations.** Mesuré : les 28 publiées ont un niveau de vie médian
de **23 490 €** contre **21 410 €** pour le corpus, et un loyer T3 médian de **1 050 €** contre
**950 €** — plus riches et plus chères que la moyenne. Trois géographies : 21 des 28 sont à moins de
15 km de la mer ouverte (pauvreté basse : 9 % aux Sables-d'Olonne, 12 % à Arcachon et Dinard) ; les
villes d'eaux et de soins (Vichy 3,89, Lourdes 3,66, Dax 3,05) portent le **même rapport par un
mécanisme inverse**, avec 23 % de pauvreté à Vichy et à Lourdes ; puis quelques villes moyennes de
l'Ouest intérieur (Fontenay-le-Comte, Saintes, Dinan, Bergerac). Le miroir est publié tel quel : les
communes les plus jeunes du corpus sont Saint-Laurent-du-Maroni (0,13 senior par enfant, 41,7 % de
moins de 15 ans), Cayenne, Stains, Creil, Cergy et Trappes.
⚠️ **Trois points de méthode à ne pas défaire.** ① **Les tranches d'âge n'existent que pour le
millésime 2022**, là où les populations totales en portent trois : le thème publie un **état, jamais
une tendance**, et aucune phrase ne doit laisser croire qu'il mesure une baisse de la cohorte
d'enfants — c'est la différence de fond avec `villes-qui-se-vident`. ② Le recensement compte des
**résidents** : en villégiature une part du parc est en résidence secondaire et les ménages jeunes
habitent la commune voisine, moins chère, donc l'aire alentour peut être plus jeune que la commune
(même réserve qu'au thème précédent). ③ Le repère « part des moins de 15 ans » est **calculé au
chargement, pas écrit en dur**, pour suivre le fichier de recensement. Recouvrements mesurés avant
écriture, tous bas : **2/28** avec `villes-vieillissement-critique` (qui classe un score composite et
mesure la *charge* d'une population âgée), **0/28** avec `villes-fuite-jeunes-actifs`, **0/28** avec
`villes-manque-de-creches`, et 5 des 9 villes de `villes-mono-touristiques` s'y retrouvent par une
autre porte (une **économie** saisonnière là, une **démographie** ici).
⚠️ **Une erreur rattrapée en cours de run, du genre que rien n'automatise** : la part médiane des
moins de 15 ans avait d'abord été lue à 17,7 % en prenant le `kidShare` de la ville médiane *par
rapport seniors/enfants* au lieu de la médiane des parts. La vraie valeur est **16,9 %**. Le calcul
au chargement l'a démentie à la première exécution — **une médiane se prend sur le tableau trié par
la grandeur qu'on médiane, pas sur la ligne du milieu d'un autre tri.**
⚠️ Une **piste écartée ce run et à ne pas re-proposer en l'état** : classer la **liquidité du marché**
(ventes DVF par millier d'habitants). Mesurée, elle donne un bas de classement composé des DROM et des
communes à fort parc social de Seine-Saint-Denis et du Val-d'Oise (La Courneuve 5,5 ‰, Gennevilliers
5,6 ‰) et un haut composé de stations (Agde 124,5 ‰, Arcachon 78,9 ‰). L'indicateur mesure d'abord la
**part de parc privé en accession**, pas la facilité de revente, et nous n'avons pas la structure
d'occupation qui permettrait de corriger — publier « on y revend difficilement » sur La Courneuve
serait une affirmation que nos données ne portent pas. Corrélation avec le taux de pauvreté −0,19
seulement, ce qui ne suffit pas à disculper la mesure : c'est le mécanisme, pas la corrélation, qui
la disqualifie.
Avant-dernier ajouté : **`villes-prix-au-m2-trompeur`** — le seul classement du fichier qui
ne mesure pas la ville mais **le chiffre qu'on publie sur elle**, celui de ce site compris.
L'indicateur est l'écart interquartile relatif des prix d'appartement DVF (p75 ÷ p25, millésimes
2024-2025, `lib/property-prices.ts`) : sur les 433 villes où le calcul est possible, la médiane est
à 1,49 et **22 villes dépassent 1,75**, le seuil de publication. Montbéliard ouvre à **121 %**
d'écart (quartiles 624 → 1 382 €/m² autour d'une médiane à 934), devant Guingamp 118 %, Les Abymes
113 % et Chenôve 103 %. ⚠️ **Un indicateur de dispersion est d'abord suspect d'être un artefact
d'échantillon, et les trois contrôles qui l'écartent sont à refaire avant de toucher au barème** :
① la dispersion médiane ne bouge pas avec l'effectif de ventes (1,49 sur 100-200 ventes · 1,46 sur
200-400 · 1,50 sur 400-800 · 1,50 sur 800-2 000 · 1,54 au-delà) alors qu'un artefact produirait
l'inverse, du bruit en bas et du lissage en haut ; ② la corrélation de rang vaut **0,05** avec le
nombre de ventes et **0,01** avec la population, donc l'indicateur ne mesure ni la taille ni
l'intensité du marché ; ③ p25 et p75 sont des quantiles, insensibles aux extrêmes qui déformeraient
une moyenne — ne pas « simplifier » en écart-type. Trois points de cadrage à ne pas diluer : ⓐ **ce
n'est pas un doublon du taux de pauvreté** (corrélation 0,39, la moitié du chemin) — Biscarrosse
entre avec **10 %** de pauvreté et Salon-de-Provence avec 17 %, quand la médiane des villes publiées
est à 25 %, parce qu'un front de mer et un arrière-pays produisent le même écart de quartiles qu'un
parc social et un programme neuf ; ⓑ **le phénomène est celui des copropriétés**, pas du bâti en
général : la corrélation avec la dispersion des maisons n'est que de 0,30, et Aulnay-sous-Bois sort
à 1,93 côté appartement contre 1,43 côté maison (Chenôve 2,03 contre 1,42) — d'où le choix de ne
classer que les appartements, le prix d'une maison incluant terrain et dépendances ; ⓒ **une
dispersion élevée n'annonce ni moins-value ni difficulté de revente** — Cannes (79 % d'écart, soit
220 350 € sur 65 m²) et Marseille (83 %, sur le plus gros échantillon du corpus, 19 801 ventes) sont
des marchés recherchés ; le classement avertit sur la lisibilité du prix affiché, pas sur la santé du
marché. Filtres : quartiles publiés et **≥ 100 ventes** d'appartement (cinq fois le seuil DVF — un
quartile demande plus d'observations qu'une médiane), puis rapport ≥ 1,75 ; 25 communes de livre
foncier (Bas-Rhin, Haut-Rhin, Moselle) et Mayotte sont hors source, 15 sous le seuil DVF, 66 sous
les 100 ventes. Aucune égalité exacte sur le corpus éligible, le tri porte sur la valeur non
arrondie. Distinct de `villes-achat-hors-de-portee`, qui rapporte la **médiane** au revenu local :
là on demande si la ville est achetable, ici si son prix affiché veut dire quelque chose — Montluçon
est les deux. Ajouté avant lui : **`villes-achat-hors-de-portee`** — le premier classement du site à
confronter **deux mesures publiées et aucun score** : la médiane DVF des prix d'appartement
(`lib/property-prices.ts`, millésimes 2024-2025) rapportée au niveau de vie médian communal
(`lib/city-income.ts`, Filosofi 2021). Publié en **années de revenu disponible pour 65 m²** : sur les
430 villes où les deux mesures existent, la médiane est de 5,4 années, 74 villes dépassent 8 années
et 16 dépassent 11 — le seuil de publication. Saint-Tropez ouvre à 18,6 années, Paris suit à 14,1, et
9 des 16 sont en petite couronne. Cinq points de méthode à ne pas défaire : ① le ménage (couple sans
enfant, **1,5 UC**) et la surface (65 m²) entrent comme un **facteur constant** identique partout,
donc les changer déplace le nombre d'années affiché et **jamais** l'ordre — ce qui trie est le seul
rapport prix/revenu ; ne pas « recalibrer » ces constantes en croyant corriger un classement ;
② `medianIncome` est un niveau de vie **par unité de consommation**, le multiplier par les UC du
ménage cité est obligatoire (même piège que le palmarès d'octobre, sans quoi le taux est gonflé de
moitié) ; ③ **plancher de 100 ventes d'appartement** sur la fenêtre, cinq fois le seuil de publication
de DVF : c'est lui qui écarte `ile-de-re` (33 ventes, et un slug qui couvre dix communes) ; ④ prix
2024-2025 contre revenus 2021, donc le nombre d'années est **surestimé en valeur absolue** et seul le
classement tient ; ⑤ la severity démarre à **8/10 au seuil d'entrée** (11 années) et plafonne à 10 à
vingt années, le tri portant sur la valeur non arrondie — deux villes peuvent afficher la même
gravité à la décimale sans être à égalité. Cas de lecture à garder : **Aubervilliers** (3 951 €/m², la
commune la moins chère du classement) et **Levallois-Perret** (8 935 €/m²) sortent au même rapport de
11,2 années par deux mécanismes opposés. Distinct de `villes-regrets-achat` (prix face au score de
qualité de vie, sans revenus), `villes-couts-explosifs` (dépenses mensuelles face à un proxy de
salaire départemental) et `villes-logement-introuvable` (tension locative). Avant-dernier ajouté :
**`villes-qui-se-vident`** — le seul autre thème du fichier dont le
classement repose sur une **mesure publiée** et non sur un score : les populations municipales Insee
2011 / 2016 / 2022 lues via `lib/city-population.ts` (538/540 villes, mêmes millésimes dans un même
fichier, donc immunisé aux fusions de communes). Sur les 538 villes couvertes, 204 comptent moins
d'habitants en 2022 qu'en 2016 et 162 perdent sur les deux fenêtres ; 15 villes passent les seuils.
Trois points de méthode à ne pas diluer : ① le **filtre marché** (loyer T2 ≤ 1,10 × la médiane
nationale, `data/housing.ts`) est ce qui empêche le thème de devenir faux — Paris (−6,1 % depuis
2011), Le Kremlin-Bicêtre (−9,4 %) et l'arc azuréen perdent des habitants dans des marchés à 1,5-2,6
fois la médiane, c'est un rétrécissement des ménages, pas une désertion ; la coupure est posée à 1,10
parce que les ratios réels sautent de 1,07 (Fort-de-France, Apt — recul bien réel) à 1,14 (Grasse,
Beaune, Bondy) ; ② il faut un recul **sur les deux fenêtres** (2011→2022 et 2016→2022), sinon un
millésime accidenté suffit à entrer ; ③ le recensement compte la population **résidente** : en
littoral et en montagne (Berck, Briançon) une part de la baisse est une conversion en résidences
secondaires, et le chiffre communal masque le cas classique du centre qui se vide pendant que l'aire
d'attraction gagne — la méthodologie affichée le dit, ne pas l'alléger. Distinct de
`villes-vieillissement-critique` et `villes-fuite-jeunes-actifs`, qui classent des scores de tension
de `lib/demography.ts` : recouvrement mesuré de 4/15 et 2/15 sur le top 15.

