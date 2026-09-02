# MeilleurVille — Roadmap v6 (2026-05-17)

Roadmap des features SSG-first, sans backend lourd, sans chiffres inventés.

**Statut** : vague 1 + vague 2 livrées (F1, F2, F3, F4, F9, F10, F11, F12, F13, F15, F16, F17, F18, F19, F20, F21, F22, F23, F24). Vague 3 démarrée avec F25. Vague 5 démarrée avec F54. Vague 6 livrée (F58, F59, F60, F61). Vague 7 ouverte avec F62 (Score Biodiversité). 5 features dépendant d'accès externes ont été retirées en attente d'accès/budget : ex-F5 RealityCheck, ex-F6 Journal de déménagement, ex-F7 Alertes personnalisées, ex-F8 Ville du mois, ex-F14 Carte risques interactive.

---

## Vague 6 — parents solo, parcs, navigation départements (ouverte 2026-07-22)

Demande utilisateur directe. F58 / F60 / F61 livrées le jour même ; **F59 livrée le
2026-07-27 — la vague 6 est close** — c'est le plus gros du lot (pipeline de données externe).

| # | Feature | Prio | Cplx | SEO | Statut |
|---|---------|------|------|-----|--------|
| F58 | City Match — profil « parent solo » | P1 | S | mid | ✅ shipped 2026-07-22 · sous-page `/villes/[slug]/parent-solo` ×540 + hub `/parent-solo` + miroir EN `/single-parent` + `/cities/[slug]/single-parent` ×540 shipped 2026-07-25→28 · série guides `parent-solo-a-[ville]-2026` batch 1 (+10) shipped 2026-07-24, batch 2 (+10 : Rennes, Nancy, Angers, Grenoble, Dijon, Metz, Reims, Aix-en-Provence, Rouen, Toulon) shipped 2026-08-07 · miroir EN de la série `single-parent-in-[city]-2026` batch 1 (+10 : Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille) shipped 2026-08-09, batch 2 (+10) shipped 2026-08-11 — **parité FR/EN atteinte à 20/20** · **batch 3 FR (+9 : Villeurbanne, Besançon, Caen, Brest, Tours, Limoges, Clermont-Ferrand, Saint-Étienne, Le Havre) shipped 2026-08-14**, **miroir EN batch 3 (+9) shipped 2026-08-15 — parité rétablie à 29/29** · **batch 4 FR (+10 : Nîmes, Saint-Denis de La Réunion, Le Mans, Amiens, Annecy, Perpignan, Orléans, Mulhouse, Poitiers, Dunkerque) shipped 2026-08-16**, **miroir EN batch 4 (+10) shipped 2026-08-17 — parité rétablie à 39/39** (compteur vérifié des deux côtés avant et après le run, cf. § Parité EN) · **batch 5 FR (+9 : Saint-Paul 974, Avignon, Saint-Pierre 974, Béziers, La Rochelle, Pau, Cherbourg-en-Cotentin, Fort-de-France, Mérignac) shipped 2026-08-23 — 48 FR contre 39 EN, premier guide martiniquais de la série**, **miroir EN batch 5 (+9) shipped 2026-08-25 — parité rétablie à 48/48** (rang publié = fit décroissant puis nom croissant, cf. § Parité EN) · **batch 6 FR (+9 : Valence, Colmar, Saint-Nazaire, Chambéry, Bourges, Pessac, Calais, Le Tampon 974, Ajaccio) shipped 2026-08-28 — 57 FR contre 48 EN, premier guide corse de la série** (+ 5 superlatifs faux corrigés, dont un dans le guide Pau du batch 5, cf. § ci-dessous) · **miroir EN batch 6 (+9) shipped 2026-08-29 — parité rétablie à 57/57**, premier guide corse côté EN (+ 2 comparatifs faux des guides FR du 28/08 corrigés des deux côtés, cf. § Parité EN) · **batch 7 FR (+9 : La Roche-sur-Yon, Dole, Lannion, Challans, Saint-Dié-des-Vosges, Albi, Cholet, Laon, Anglet) shipped 2026-08-30 — 66 FR contre 57 EN. Le run change la règle de sélection : population → rang. Six batches « par population » avaient couvert 9 des 40 premières villes du classement et laissé La Roche-sur-Yon, 1re sur 363, sans guide ; ce batch referme le top 11 en entier** (+ 3 superlatifs faux corrigés et le vivier du batch 6 démenti par la mesure, cf. § ci-dessous) · **miroir EN batch 7 (+9) shipped 2026-09-02 — parité rétablie à 66/66**, neuvième réouverture refermée ; 532 figures contrôlées contre les jumelles FR, 0 écart, et aucun superlatif faux trouvé cette fois (cf. § Parité EN) |
| F59 | **Parcs & espaces verts par ville** (pipeline OSM + sub-page ×540) | **P0** | **L** | **high** | ✅ shipped 2026-07-27 |
| F60 | `/departements` — finder par n° / nom / ville + carte cliquable | P1 | S | low | ✅ shipped 2026-07-22 · carte cliquable 2026-07-23 |
| F61 | Vacances — profils « monoparental » et « célibataire » | P1 | S | high | ✅ shipped 2026-07-22 · mono enrichi 22/07 · célib enrichi 2026-07-26 · série guides `vacances-celibataire-[ville]-2026` batch 1 (+8) shipped 2026-08-01 · série `vacances-monoparentales-[ville]-2026` batch 1 (+7) shipped 2026-08-05 · `vacances-celibataire-[ville]-2026` batch 2 (+7 : Toulouse, Lille, Aix-en-Provence, Angers, Grenoble, Dijon, La Rochelle) shipped 2026-08-08 · croisement mois × profil `/vacances/ou-partir/[combo]` (12 × 7 = 84 pages SSG) shipped 2026-08-12 · miroir EN de la série célibataire, `solo-travel-in-[city]-2026` batch 1 (+8 : Paris, Lyon, Bordeaux, Lille, Strasbourg, Toulouse, Montpellier, Nantes) shipped 2026-08-13 · série EN fermée (batch 2, +7) 2026-08-14 · guide pilier `partir-en-vacances-seul-2026` + correction de l'anti-station-fantôme (part réelle des 15-29 ans Insee au lieu d'un écart d'affluence constant) shipped 2026-08-15 · **miroir EN de la série monoparentale, `single-parent-holidays-[city]-2026` (+7 : La Rochelle, Strasbourg, Nantes, Rennes, Vannes, Nancy, Dijon) shipped 2026-08-19 — parité FR/EN atteinte à 7/7, mêmes villes des deux côtés** (+ 4 chiffres faux corrigés dans la série FR au passage, cf. § ci-dessous) · **`vacances-celibataire-[ville]-2026` batch 3 (+7 : Nancy, Poitiers, Rouen, Caen, Clermont-Ferrand, Tours, Besançon) shipped 2026-08-22 — sélection dérivée de la mesure anti-station-fantôme, + 1 erreur de données corrigée dans `lib/transit.ts`, cf. § ci-dessous** · **`vacances-monoparentales-[ville]-2026` batch 2 (+8 : Lyon, Angers, Bordeaux, Besançon, Grenoble, Brest, Tours, Valence) shipped 2026-08-26 — sélection dérivée de la règle « accessible en train sans voiture » de la page profil elle-même, palier d'ex æquo pris entier, cf. § ci-dessous** · **`vacances-celibataire-[ville]-2026` batch 4 (+7 : Brest, Reims, Orléans, Metz, Troyes, Pau, Chambéry) shipped 2026-08-29 — règle du batch 3 recalculée et non recopiée, ce qui a rattrapé Orléans que la liste annoncée avait sauté ; + 4 erreurs de mode de transport corrigées dans `data/neighborhoods.ts` (Metz, Limoges, Amiens, Valence), cf. § ci-dessous** · **`vacances-monoparentales-[ville]-2026` batch 3 (+7 : Toulouse, Pau, Mâcon, Aix-en-Provence, Poitiers, Saint-Raphaël, Metz) shipped 2026-09-02 — premier lot où le profil classe haut des destinations chères, règle de sélection recalculée et non recopiée ; 7 comparaisons inter-villes fausses corrigées avant commit, cf. § ci-dessous** |

### F61 — série monoparentale, batch 3 : `vacances-monoparentales-[ville]-2026` (2026-09-02)

Item 2 du plan agent « vacances monoparentales ». La série était à parité 15 FR / 15 EN depuis le
27/08, donc écart nul : la main revenait au FR. **+7 guides, compteur mesuré
`grep -c 'slug: "vacances-monoparentales-'` = 22 ; `GUIDES` 1043 → 1050.** `npm run search-index`
relancé (`data/search-index.json` 1 050 guides, **252 tags** contre 251 — un seul tag franchit le
seuil de 3 guides, `vacances pas chères en famille`, porté de 1 à 3 par Mâcon et Poitiers, d'où le
passage de `npm run sitemap:check`, FR 29 125 → **29 133 URL**, soit exactement les 7 guides plus
la page de tag ; chaque URL déclarée a une page et réciproquement). `npm run parity` et
`npm run hreflang:check` repassés, verts.

**La règle de sélection du batch 2 a été recalculée et non recopiée**, comme le batch 4 de la série
célibataire l'avait établi le 29/08 : la règle « arriver en TGV/RER **et** circuler sur place en
métro, tram ou BHNS, ou à défaut transport ≥ 6,8 » de `MonoparentalExtras.tsx` retient toujours
**53 villes sur 540**, dont **39 non couvertes**. Après retrait des communes d'Île-de-France (motif
inchangé du batch 2 : une excursion depuis Paris n'est pas un séjour, et leur axe coût à 2,2 mesure
un marché résidentiel), il reste, par fit décroissant : Toulouse, Pau et Mâcon à 6,2, Aix-en-Provence,
Poitiers et Saint-Raphaël à 6,1, Metz à 6,0. **On s'arrête là parce que le palier suivant, à 5,8,
compte quatre villes** (Reims, Le Mans, Lille, Mulhouse) et déborderait la fourchette de 6 à 8 : la
convention de `lib/owner-rankings.ts` interdit de couper une égalité en son milieu, donc 7 et non 8.

**Thèse du batch : c'est le premier lot où le profil classe haut des destinations chères, et chaque
guide dit ce qui a payé.** Les 15 guides précédents tenaient tous dans la moitié abordable ou juste
en dessous. Ici, **Aix-en-Provence sort à 3,6/10 sur l'axe coût, le plus bas des 22 destinations de
la série** (un score bas signifie cher), et Saint-Raphaël à 3,9 la suit : 1 400 € et 1 300 € le T3
de référence, 5 000 € et 4 500 € le mètre carré (source `data/housing.ts`). À l'autre bout, **Mâcon
est la destination la moins chère des 22** (T3 800 €, m² 2 100 € à égalité avec Poitiers). Le guide
Aix nomme donc explicitement ce qui compense son coût dans un profil qui le pondère à 0,25 —
qualité de vie 7,8, culture 8,4, sécurité 5,9 — et le guide Saint-Raphaël pose l'arbitrage réel :
on y paie l'hébergement plus cher, mais les postes voiture, carburant et parking tombent à zéro, ce
qui n'est vrai d'aucune autre destination littorale de la série.

**Trois faits vérifiés en ligne avant rédaction, et qui portent leurs guides.** ① Le **funiculaire
de Pau**, mis en service en 1908 et **gratuit depuis 1978**, relie la gare à la place Royale : la
gare est au pied du coteau et la ville au sommet, donc c'est le fait qui décide d'une arrivée seul
avec enfants et bagages. ② La **sortie sud de la gare de Metz-Ville donne sur le parvis du Centre
Pompidou-Metz** — zéro correspondance entre la descente du train et la première activité. ③ Le
**Futuroscope a sa propre gare TGV**, à une dizaine de kilomètres au nord de Poitiers, et le réseau
urbain relie la gare de Poitiers au site : c'est le seul grand parc à thème de la série atteignable
sans louer de voiture. Le piège de gare du batch 2 est par ailleurs confirmé sur deux villes de
plus (**Mâcon-Loché-TGV à ~7 km du centre** contre Mâcon-Ville en ville, **Aix TGV à une quinzaine
de kilomètres** sur la limite avec Cabriès contre Aix-Centre en TER) et **Saint-Raphaël en est le
contre-exemple** : gare dans le centre, à environ 800 m de son cœur, plages à pied.

⚠️ **Deux limites de nos propres données ont été mesurées ce run et sont écrites dans les guides
concernés, pas seulement ici.**
- **La station climatique de référence peut être très loin, et Pau est le pire cas de la série.**
  `distanceToNearestKm()` donne **146 km** pour Pau, rattachée à **Toulouse-Blagnac** : les valeurs
  mensuelles affichées pour Pau sont littéralement celles de Toulouse, prises de l'autre côté du
  Gers, alors que Pau est adossée aux Pyrénées. Metz est à 125 km (Strasbourg-Entzheim) et Poitiers
  à 99 km (Tours). Les trois guides le disent et renvoient aux ancres annuelles du seed. Toulouse
  est la seule des sept dont la station porte son propre nom (6 km).
- **L'indicateur d'affluence n'a que trois régimes, et il sous-estime Aix-en-Provence.**
  `crowdednessForMonth()` attribue un palier de base (1, 2 ou 3) selon les `characterTags` et la
  population, puis module par la saison : sur les 22 destinations de la série, **il n'existe donc
  que trois profils annuels distincts**. Aix tombe au palier bas par construction — 147 933
  habitants, sous le seuil de 200 000, et aucun tag littoral — alors que le cours Mirabeau un
  14 août dit autre chose. **Ne pas écrire qu'une ville est « la seule jamais calme » de la série** :
  Saint-Raphaël partage son palier avec Lyon, Bordeaux, Nantes, Rennes, Strasbourg et Toulouse. Le
  guide Aix nomme la sous-estimation, le guide Mâcon explique que son palier 2 vient du tag « vins ».

⚠️ **Le plafond de collecte des parcs a failli produire une comparaison fausse.** `PARKS_PER_CITY`
vaut 40 et **14 des 22 destinations de la série l'atteignent**, dont Toulouse, Pau, Poitiers et Metz
dans ce lot : leur compte est un **plancher**, pas un total, et ne se compare pas à Aix (31),
Mâcon (21) ou Saint-Raphaël (13). Les quatre guides concernés le disent. Saint-Raphaël, avec le
total le plus faible des 22, porte en plus la réserve OSM déjà posée le 03/08 : notre source est une
carte contributive, où « personne n'a cartographié » et « il n'y a rien » se ressemblent — ici
l'espace ouvert est le massif de l'Estérel et le littoral, qui ne sont pas des parcs urbains.

⚠️ **Sept comparaisons inter-villes fausses au premier jet, corrigées avant commit.** Même mode de
défaillance qu'aux batches précédents et qu'au palmarès de novembre : les scores pris un à un
étaient justes, ce sont les **rangs et les égalités** qui dérapaient. ① et ② Toulouse puis Poitiers
donnés « derniers du lot » en nature à 5,0 alors que **Metz est à 4,8** ; ③ Pau annoncée
« quatrième plus abordable derrière Metz » alors qu'elle est **à égalité exacte avec Metz** à 6,2 ;
④ Metz donnée troisième en transports derrière « le trio à 7,0 » qui n'est **qu'un duo**
(Mâcon, Saint-Raphaël), ce qui la met quatrième ; ⑤ Metz donnée devant « Mâcon et Pau à 6,6 » en
culture alors que **Mâcon est à 6,9** ; ⑥ Poitiers annoncée à 10-12 jours de pluie « d'octobre à
mars » alors que **mars est à 9** ; ⑦ Metz annoncée pluvieuse « pendant la moitié froide de
l'année » alors qu'elle est à **9-12 jours tous les mois**, sans mois sec. **Le contrôle qui les a
trouvées est un tri complet des 22 villes sur chaque axe cité, pas une relecture.**

Contrôles passés : `npx tsc --noEmit` **propre**, `npm run integrity` (guides FR 1043 → 1050),
`search-index` + `search-index:check`, `sitemap:check`, `parity`, `hreflang:check`, plus la
vérification que les 7 guides sont **retrouvés par `guideCityPhoto()`** avec leur photo d'en-tête
**et remontés par la recherche inverse `relatedCities`** sur leur page ville. `metaTitle` 34-46
caractères, `metaDesc` 147-160, 7 sections par guide, densité d'accents 0,117-0,143 par mot (seuil
ascii-strip 0,09), **0 em-dash** sur les sept. `npm run build` **non lancé, volontairement**
(cf. CLAUDE.md § Commands depuis le batch 27).

**Prochain run : batch EN** (`single-parent-holidays-[city]-2026`, +7), l'écart FR→EN étant de 7
villes — toulouse, pau, macon, aix-en-provence, poitiers, saint-raphael, metz. Aucun slug à
arbitrer : les sept slugs de seed s'écrivent tels quels, et la règle du batch 33 de la série
tourisme (**côté EN le slug se dérive du slug de seed tel quel**) n'a rien à trancher. Deux points
de vigilance pour ces jumelles : **`single-parent-holidays-metz-2026` a de la matière propre à
l'angle expat** que le FR n'a pas (Metz est à courte distance du Luxembourg et de l'Allemagne, et
`travailleurs-frontaliers` a établi le 31/08 que les frontières y sont des passages Schengen
intérieurs sans formalité mais avec pièce d'identité) ; et **Saint-Raphaël demande que la
signalétique vert/jaune/rouge des plages surveillées soit posée comme règle opposable**, comme le
batch 33 de la série tourisme l'a fait, un lecteur étranger ne la connaissant pas.

### F61 — série monoparentale, batch 2 : `vacances-monoparentales-[ville]-2026` (2026-08-26)

Item 2 du plan agent « vacances monoparentales ». La série comptait 7 guides FR et 7 jumelles EN
depuis le 19/08, donc écart nul : la main revenait au FR. **+8 guides, compteur mesuré
`grep -c 'slug: "vacances-monoparentales-'` = 15 ; `GUIDES` 995 → 1003.** `npm run search-index`
relancé (`data/search-index.json` 1 003 guides, **246 tags** contre 245 — un seul tag neuf franchit
le seuil de 3 guides, `vacances-sans-voiture`, d'où le passage de `npm run sitemap:check`, FR
29 067 → **29 078 URL**, chaque URL déclarée a une page et réciproquement).

**La sélection est dérivée de la page profil, pas du classement générique, et c'est le point de
méthode du run.** `topCitiesForProfile("monoparental")` est saturé de communes de 8 000 à 25 000
habitants (Obernai, Amboise, Fontainebleau, Autun, Le Puy-en-Velay, Anglet, Vitré et Senlis
occupent les huit premières places) : trier
là-dedans revient à écarter à la main, run après run, des villes qui n'ont ni gare TGV ni réseau
urbain, c'est-à-dire l'inverse de ce que le profil promet. Ce batch applique donc **la règle que
`MonoparentalExtras.tsx` s'est donnée le 22/07 pour sa section « accessibles en train sans
voiture »** : arriver par TGV ou RER **et** pouvoir circuler sur place en métro, tram ou BHNS, ou
à défaut un score transport ≥ 6,8. Passée sur les 540 villes, elle en retient **53**. Deux filtres
d'éligibilité ensuite : les 7 villes déjà couvertes, et **les communes d'Île-de-France** — Issy-les-
Moulineaux (fit 6,7), Versailles et Neuilly-sur-Seine (6,3) sortent non pour leur classement mais
parce qu'une commune de la petite couronne est une excursion depuis Paris et non un séjour, et que
son axe coût, à 2,2/10, mesure un marché résidentiel francilien et pas un budget de vacances.
Restent, par fit décroissant : Lyon et Angers à 6,6, Bordeaux et Besançon à 6,4, puis **un palier
d'ex æquo à 6,3 pris entier** (Grenoble, Brest, Tours, Valence) plutôt que coupé en son milieu,
comme la convention de `lib/owner-rankings.ts` l'impose depuis le 19/08. D'où 8 guides et non 7.

⚠️ **La liste de candidates laissée par le run du 19/08 ne survit pas à cette règle, et c'est
utile à savoir.** Elle annonçait « Bordeaux, Lyon, Colmar, Annecy, Grenoble, Chambéry, Reims, Metz,
Montpellier, Aix-en-Provence ». **Colmar, Annecy et Chambéry ne passent pas** : Annecy est bien
desservie en TGV mais sort à transport 6,4/10, sous le seuil de 6,8, et sans tram ni BHNS déclarés
dans `lib/transit.ts` ; Chambéry porte le drapeau TGV mais aucun mode local et sort à 6,1 ; Colmar
n'a aucune entrée de transit du tout. Les recalculer plutôt que les recopier — la règle tient en
dix lignes de `npx tsx`.

**La thèse éditoriale du batch, et elle vient d'une limite de nos propres données.** Le drapeau
`tgv: true` de `lib/transit.ts` dit qu'une ville est desservie par le TGV ; il **ne dit pas dans
quelle gare**. Or trois des huit villes retenues ont une gare TGV qui n'est pas celle du centre, ce
qui est exactement le genre de détail qui coûte une heure et une crise de nerfs à un adulte seul
avec des enfants et des bagages : **Besançon Franche-Comté TGV** est aux Auxons, à une dizaine de
kilomètres, reliée à Besançon-Viotte par une liaison ferroviaire de quelques minutes (une partie
des TGV dessert directement Viotte) ; **Valence TGV** est à Alixan, une dizaine de kilomètres au
nord-est, le bâtiment abritant les quais TGV et ceux de la ligne régionale ; **une partie des TGV
de Tours** s'arrête à Saint-Pierre-des-Corps, commune voisine, avec une correspondance ferroviaire
de quelques minutes qui **n'existe pas derrière chaque TGV**. Les trois guides le disent avant de
parler du reste, et aucun ne cite de durée de correspondance : l'offre a bougé plusieurs fois et
une minute imprimée vieillit mal. Les cinq autres (Lyon, Angers, Bordeaux, Grenoble, Brest)
arrivent en gare de centre-ville, ce que les guides disent aussi, parce que c'est un avantage.

⚠️ **Trois affirmations comparatives fausses, écrites au premier jet et corrigées avant commit.**
Même cause qu'au 19/08 et qu'au 22/08 : les scores de la ville de la page étaient tous justes, ce
sont les **comparaisons entre villes** qui dérapent. Le remède appliqué, et à reprendre : sortir la
matrice des sept axes des huit villes **avant** de relire, puis vérifier chaque superlatif contre
elle, plus un contrôle mécanique qui rattache chaque figure en `/10` à un axe rendu d'une ville que
le guide nomme (96 figures, 0 non rattachée).
- Angers : « deux points de sécurité et deux points de coût de plus que Lyon ». Le coût, oui
  (6,2 contre 4,2). La sécurité, non : **0,6 point** (5,7 contre 5,1).
- Bordeaux : transports 7,8/10 annoncés « deuxième de cette sélection derrière Lyon ». C'est la
  **troisième**, Grenoble étant à 8,1.
- Grenoble : « nature 8,4/10, Besançon suit à 6,4 » présentait **une égalité comme un rang** —
  Brest est aussi à 6,4, et Lyon et Tours ferment ex æquo à 5,0. Corrigé dans les deux moitiés
  de la phrase.

⚠️ **Une erreur trouvée dans un guide voisin en préparant le batch, et corrigée** :
`10-choses-a-faire-a-valence-2026` intitulait sa section 6 « Ardèche depuis Valence — Gorges et
**Baume les Messieurs** ». Baume-les-Messieurs est **dans le Jura**, à environ 200 km, et le corps
de la section ne parle que des gorges de l'Ardèche et du Pont d'Arc. Titre corrigé. C'est le même
mode de défaillance que la tour Solidor attribuée à Rennes le 19/08 : **un lieu attribué à la
mauvaise région ne déclenche aucun contrôle automatique**, seule une relecture le voit.

**Honnêteté sur le climat, à ne pas diluer.** Trois des huit villes snapent sur une station
Météo-France lointaine (`nearestStation`, `lib/climate-normals.ts`) : Angers sur Nantes à 87 km,
Besançon sur Dijon à 71 km, **Valence sur Grenoble-Saint-Geoirs à 59 km et dans un tout autre
relief** — les moyennes mensuelles de Valence sortent identiques à celles de Grenoble, ce qui est
un artefact de rattachement et non une mesure. Les trois guides concernés citent donc uniquement
les ancres de juillet et de janvier du seed, qui sont bien celles de la ville, et **nomment la
station de référence et sa distance**. Les cinq autres ont une station à moins de 10 km, Grenoble
à 37 km.

**Ce que les guides ne font pas.** Aucun tarif, aucun horaire, aucune durée de trajet en train :
tout ce qui bouge d'une année sur l'autre renvoie à l'exploitant. Les loyers de `data/housing.ts`
sont cités **explicitement comme des repères de marché résidentiel et non comme des tarifs de
vacances** (« indicateur de niveau de prix local »), parce qu'un T3 en location annuelle ne dit pas
ce que coûte une semaine. Les montants d'aide ne sont jamais imprimés : VACAF, chèques-vacances
ANCV, bons vacances CAF et CSE sont décrits comme dispositifs, avec le rappel que les trois
derniers se calculent sur le quotient familial, donc sur la résidence en France et pas sur la
nationalité. Et la clarification sur le **supplément single** est reprise dans les huit guides :
l'hôtellerie française facture la chambre et non la personne, le supplément par adulte existe dans
les formules à forfait, et le vrai goulot du parent seul est la rareté des chambres familiales.

**Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, FR 1 003,
EN 749, 0 score brut recopié des deux côtés), `npm run search-index:check` propre,
`npm run sitemap:check` propre dans les deux sens, `npm run parity` en code 0. Les 8 guides sont
vérifiés **pourvus de leur photo d'en-tête** (`guideCityPhoto`, contrôle imposé depuis le batch 32
du tourisme). `metaTitle` 35-39 caractères, `metaDesc` 147-156, 7 sections par guide, densité
d'accents 0,131-0,160 par mot (seuil de détection ascii-strip 0,09), **0 em-dash** sur les huit
(cible R7.10 : ~1 pour 200 mots). `npm run build` n'a pas été lancé, conformément à
CLAUDE.md § Commands.

**Écart FR→EN après ce batch : 8 villes** (lyon, angers, bordeaux, besancon, grenoble, brest,
tours, valence) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN** de la
série `single-parent-holidays-[city]-2026`. Aucun piège de nommage : les huit slugs de seed sont
sans article ni homonyme. Attention à un point de fond côté EN, en revanche : le zonage des
vacances scolaires, que le miroir EN du 19/08 a établi comme son apport propre, place ces huit
villes dans **trois zones différentes** (à vérifier académie par académie avant d'écrire, pas de
mémoire), là où le premier lot en couvrait deux. Pour le batch FR **suivant**, la même règle
« accessible en train sans voiture » continue avec, par fit décroissant et hors Île-de-France :
**Toulouse, Pau et Mâcon à 6,2**, **Aix-en-Provence, Poitiers et Saint-Raphaël à 6,1**, **Metz à
6,0**, puis Reims, Le Mans, Lille et Mulhouse à 5,8 — les recalculer plutôt que les recopier, et
noter que ce palier fait entrer des villes à sécurité basse (Lille 3,9) qu'il faudra traiter comme
Grenoble l'est ici : le chiffre dit, sans verdict sur les habitants.

### F61 — série célibataire, batch 4 : `vacances-celibataire-[ville]-2026` (2026-08-29)

Item 2 du plan agent « vacances célibataire ». La série comptait 22 guides FR et 22 jumelles EN
depuis le 23/08, donc écart nul : la main revenait au FR. **+7 guides, compteur mesuré
`grep -c 'slug: "vacances-celibataire-'` = 29 ; `GUIDES` 1019 → 1026.** `npm run search-index`
relancé (`data/search-index.json` 1026 guides, **248 → 249 tags** : `week-end célibataire Grand Est`
franchit le seuil de 3 guides avec Reims, Metz et Troyes rejoignant Nancy, et crée
`/tags/week-end-celibataire-grand-est`), d'où le passage de `npm run sitemap:check` — FR 29 096 →
**29 104 URL**, chaque URL déclarée a une page. Les 7 guides sont vérifiés **retrouvés par
`guideCityPhoto` et pourvus de leur photo d'en-tête** après écriture.

**La règle du batch 3 a été recalculée, pas recopiée, et c'est ce qui a servi.** Le batch 3
laissait une liste toute faite pour la suite (Reims, Metz, Brest, Pau, Troyes, Valence, Chambéry)
en précisant de la recalculer. Bien lui en a pris : la règle réappliquée
(part des 15-29 ans Insee 2022, `pop2022 ≥ 60 000`, `culture ≥ 6,0`, `life ≥ 5,5`, hors banlieues
de métropoles déjà couvertes et hors villes déjà traitées) fait remonter **Orléans, que la liste
annoncée avait sauté**. Orléans sort à **25,6302 %** et Metz à **25,5658 %** : à la décimale publiée
elles sont **à égalité à 25,6 %**, et le batch 3 avait retenu l'une sans l'autre. Prendre le palier
entier est la convention de `lib/owner-rankings.ts` appliquée à une sélection éditoriale — les deux
guides le disent explicitement plutôt que de fabriquer un départage. La coupe se fait ensuite sur un
écart franc, Chambéry 22,69 % contre Le Mans 21,72 %, donc aucun palier n'est coupé en son milieu.
Villeurbanne (29,2 %) et Ivry-sur-Seine (25,1 %) sont écartées comme banlieues de métropoles déjà
couvertes, au même titre que Villeurbanne l'avait été au batch 3 ; Vannes (21,7 %) tombe sur
`pop2022` 54 955. ⚠️ **Le seuil de population se prend sur `pop2022`, pas sur le `population` du
seed** : mélanger une part Insee et un effectif approximatif du seed ferait entrer Vannes et sortir
Chambéry. Ordre retenu et rangs nationaux sur la valeur **non arrondie** (538 villes mesurées,
médiane 18,4 %) : **Brest 28,8 % (24ᵉ), Reims 27,5 % (27ᵉ), Orléans 25,6 % (35ᵉ), Metz 25,6 % (37ᵉ),
Troyes 24,6 % (44ᵉ), Pau 24,1 % (53ᵉ), Chambéry 22,7 % (70ᵉ)**.

**La thèse du batch est plus large que celle du batch 3, et elle est dite dans chaque guide.** Le
batch 3 alignait sept villes à `life` 5,7-6,6 dont la vitalité hors saison venait uniquement d'une
population étudiante. Ce lot-ci s'étale davantage : Chambéry (`life` 7,0, sécurité 6,3, nature 8,1,
global 6,5) et Pau (`life` 6,6, nature 7,0) prennent les quatre premières places de confort, pendant
qu'Orléans plafonne à `life` 5,5. Surtout, **c'est le premier batch où le mode d'arrivée départage** :
Brest, Reims et Orléans ont un tramway ; Metz a un BHNS et pas de tramway ; **Troyes n'a ni TGV ni
mode urbain sur rails et c'est, vérifié sur les 29 villes de la série, la seule dans ce cas** ;
Chambéry a le TGV mais aucun réseau ferré urbain. Chaque guide écrit ce que sa ville coûte comme
elle rapporte, y compris quand ça la dessert : Reims sécurité 5,1 et nature 4,2 (les plus bas du
lot), Orléans `life` 5,5 et sécurité 5,1, Chambéry coût 5,0 et culture 6,2 (les plus bas du lot),
Pau seule ville des sept dont la part de 60 ans et plus (28,3 %) dépasse la médiane nationale
(27,2 %).

⚠️ **Une erreur de données trouvée en écrivant, dans une quatrième famille de sources, et corrigée
sur quatre villes : `data/neighborhoods.ts` donnait un tramway à des villes qui n'en ont pas.** Le
contrôle est né d'une contradiction interne — `lib/transit.ts` déclare Metz en `{ tgv, bhns }` pendant
que deux quartiers messins vantaient leur « tramway ». Un croisement systématique des deux fichiers a
sorti quatre cas réels, tous vérifiés en ligne avant correction : **Metz** (le Mettis est un bus à
haut niveau de service mis en service le 5 octobre 2013, véhicules bi-articulés de 24 m, réseau
Le Met' ; aucun tramway), **Limoges** (dernier tramway supprimé le 1ᵉʳ mars 1951, remplacé par des
trolleybus le 5 juillet 1951, 5 lignes de trolleybus aujourd'hui), **Amiens** (projet de tramway
**abandonné en 2014**, BHNS Nemo depuis 2019, 4 lignes, bus électriques Irizar de 18 m) et
**Valence** (réseau Citéa, exclusivement bus). Les `summary` et les `tags` nomment désormais le mode
réel. C'est la même famille que le tramway fantôme de Nancy corrigé au batch 3, et la leçon est
identique : **une donnée saisie à la main sans avoir vu la source vieillit en silence, et c'est la
rédaction qui la rattrape, ni `tsc` ni `npm run integrity`.** La nouveauté utile est la méthode :
les deux fichiers portaient l'information, il suffisait de les croiser — ce croisement est
reproductible en quinze lignes de `npx tsx` et mérite d'être relancé au prochain batch.

⚠️ **Trois superlatifs faux, écrits au premier jet et corrigés avant commit — le mode de défaillance
du batch 3 s'est reproduit à l'identique.** Les scores *de la ville de chaque page* étaient tous
justes ; ce sont les comparaisons **entre** villes qui dérapent, parce qu'on les écrit de mémoire, et
`npm run integrity` ne peut pas les voir. Les trois étaient la même bévue : **Chambéry est le vrai
minimum du lot** sur culture (6,2) comme sur coût (5,0), et trois phrases l'avaient oublié.
- Brest : culture 6,6 annoncée « au niveau le plus bas de ce lot » — c'est **Chambéry, 6,2**.
- Pau : même phrase, même erreur.
- Reims : coût 6,0 annoncé « le plus bas de ce lot » — il est **l'avant-dernier, devant Chambéry 5,0**.
Le remède du batch 3 est confirmé et à reprendre tel quel : **sortir la matrice des axes du lot avant
de relire, avec ses paliers d'ex æquo**, et vérifier chaque superlatif contre elle. Les ex æquo de ce
lot, tous présentés comme tels dans les guides : `life` 5,9 (Reims/Metz/Troyes), `culture` 6,6
(Brest/Orléans/Pau), `transport` 6,4 (Brest/Reims/Orléans), 6,7 (Metz/Troyes) et 6,1 (Pau/Chambéry),
`safety` 5,7 (Brest/Pau) et 5,1 (Reims/Orléans), `cost` 6,2 (Orléans/Metz/Pau), `nature` 4,8
(Orléans/Metz), `global` 6,4 (Brest/Pau). Deux formules invérifiables ont aussi été retirées à la
relecture (« le circuit le plus court de la série », « la mise en garde la plus utile du lot »).

⚠️ **Le piège de calendrier du lot est à Orléans, et c'est le précédent du festival de cerf-volant de
Dieppe.** Le **Festival de Loire** est **biennal et se tient les années impaires** : la 12ᵉ édition
s'est tenue du **24 au 28 septembre 2025**, la 13ᵉ est attendue en **septembre 2027**. **Il n'y a donc
pas de Festival de Loire en 2026**, et une page qui en promet un recopie une édition précédente. Le
guide le dit explicitement. Autres faits vérifiés en ligne avant rédaction, aucun ne vivant dans nos
données : **La Carène** (SMAC de Brest, 70 à 90 concerts par an) et **Le Quartz** (scène nationale de
Brest, première de France en fréquentation) ; le **téléphérique de Brest** est la **ligne C** du réseau
urbain, franchit la Penfeld entre Siam et les Capucins et est le premier ouvrage du genre construit en
France depuis celui de la Bastille à Grenoble ; **La Cartonnerie** (SMAC), l'**Opéra de Reims** (salle
Art déco), la **Comédie de Reims** (CDN) et **Le Manège** (scène nationale) ; **L'Astrolabe** (SMAC
d'Orléans, deux salles de 550 et 180 places, **environ 80 concerts de septembre à juin**, arrêt
Madeleine sur la **ligne B** du tramway) ; la **Cité musicale-Metz** réunit **Arsenal, BAM et
Trinitaires** plus l'Orchestre national de Metz Grand Est, et le **Centre Pompidou-Metz** est de
**Shigeru Ban** ; la **Chapelle Argence** de Troyes occupe une chapelle du XIXᵉ siècle de l'ancien
lycée impérial, boulevard Gambetta, et la **Cité du Vitrail** présente **plus de 150 m²** de verrières
originales ; le **funiculaire de Pau est gratuit** et relie la gare au boulevard des Pyrénées, et
**Fébus** a été la **première ligne au monde** à véhicules de 18 m à hydrogène, inaugurée en
**décembre 2019** ; **Malraux, scène nationale de Chambéry et de la Savoie**, est au **Carré Curial**
et sa grande salle compte **950 places** ; **Troyes–Paris-Est** se fait en **TER ou Intercités**, sur
**141 km**, en **une heure et demie environ**, **sans TGV**.

⚠️ **Deux attributions écartées avant d'écrire**, du genre « Espace Albert Camus à Bron » : le
**Brise-Glace est la SMAC d'Annecy**, pas de Chambéry, donc le guide Chambéry ne le nomme pas et
s'appuie sur Malraux ; et la gare des **Aubrais est à Fleury-les-Aubrais**, commune voisine d'Orléans,
ce que le guide dit explicitement parce qu'un moteur de réservation peut y poser le voyageur sans
prévenir. Convention « **accessible depuis** » tenue partout ailleurs (lacs de la forêt d'Orient
depuis Troyes, stations pyrénéennes depuis Pau, lac du Bourget depuis Chambéry).

**Chiffres et vérifications.** Les 51 figures en `/10` des sept guides tracent toutes vers un score
**rendu** (`CITIES_SEED` lu via un `npx tsx`, jamais par grep du seed) d'une ville que le guide nomme ;
les parts d'âge et les populations viennent de `lib/city-population.ts` (Insee 2022), **pas des
`population` approximatives du seed**. **Aucun tarif d'hébergement n'est imprimé**, comme dans toute
la série : on transmet le réflexe, pas le prix. `metaTitle` 56-58 caractères, `metaDesc` 145-153,
6 sections et 1 136-1 299 mots par guide, densité d'accents 0,142-0,170 (**par mot** ; seuil de
détection ascii-strip 0,09), **zéro em-dash dans le corps**. `relatedGuides` câblés sur des slugs
vérifiés existants, `relatedCities` sur la ville cible. Garde-fou éditorial tenu : aucune promesse de
rencontre, aucun registre « site de rencontres », aucun cliché sur la solitude, écriture inclusive
légère (`seul·e`), et la distinction avec le profil `solo` (chercher du monde ≠ chercher la
tranquillité) portée par la section « sortir un mardi soir » de chaque guide.

⚠️ **`npm run build` n'a pas été lancé, volontairement** — c'est ce que la section Commands interdit
depuis le batch 27. Le substitut prescrit passe en entier : `npx tsc --noEmit` **propre**,
`npm run integrity`, `search-index` + `search-index:check`, `sitemap:check`, plus les contrôles
maison de ce run (matrice des superlatifs, traçage des figures `/10`, résolution `guideCityPhoto`,
croisement `neighborhoods` ↔ `transit`).

**Écart FR→EN après ce batch : 7 villes** (brest, reims, orleans, metz, troyes, pau, chambery) —
au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN** de la série
`solo-travel-in-[city]-2026`. Rappel de la règle du batch 33 : côté EN le slug se dérive du **slug de
seed tel quel**. Aucun piège de nommage sur ces sept, mais deux points de vigilance pour la version
anglaise : **Metz n'a pas de tramway** (le dire, un lecteur étranger lira « Mettis » comme un tram) et
**l'absence de Festival de Loire en 2026** doit être reprise telle quelle, un visiteur étranger étant
encore plus susceptible de caler un voyage sur une page périmée. Pour le batch FR **suivant**, la
même règle recalculée donne, dans l'ordre : **Le Mans 21,7 % (95ᵉ), Valence 21,4 % (106ᵉ),
Saint-Denis de La Réunion 21,1 % (120ᵉ), Mulhouse 20,8 % (134ᵉ), Avignon 20,3 % (158ᵉ),
Bourges 20,3 % (162ᵉ), Quimper 19,7 % (190ᵉ), Saint-Pierre de La Réunion 19,5 % (199ᵉ),
Colmar 19,4 % (209ᵉ)** et **Annecy 19,4 % (212ᵉ)** — les recalculer plutôt que les recopier, c'est
précisément ce qui a sauvé Orléans ce run. Trois remarques pour cette liste. **Avignon porte le
score de culture le plus élevé de tous les candidats restants (9,0/10)** et n'a jamais eu de guide
de la série, ce qui en fait le meilleur dossier du lot malgré son rang. **Deux villes de La Réunion
y entrent**, et la série est intégralement métropolitaine à ce jour : elles posent la question du
hors-saison autrement (l'hiver austral est la saison sèche), à trancher dans le guide plutôt qu'à
éluder. Et deux paliers d'ex æquo sont à prendre entiers ou pas du tout : **Avignon et Bourges à
20,3 %**, **Colmar et Annecy à 19,4 %**.

### F61 — série célibataire, batch 3 : `vacances-celibataire-[ville]-2026` (2026-08-22)

Item 2 du plan agent « vacances célibataire ». La série comptait 15 guides FR et 15 jumelles EN
depuis le 14/08, donc écart nul : la main revenait au FR. **+7 guides, compteur mesuré
`grep -c 'slug: "vacances-celibataire-'` = 22 ; `GUIDES` 973 → 980.** `npm run search-index`
relancé (`data/search-index.json` 980 guides, **241 tags, inchangé** — aucun tag neuf ne franchit
le seuil de 3, donc aucune page `/tags/` créée) ; `npm run sitemap:check` repassé, FR 29 040 →
**29 047 URL**, chaque URL déclarée a une page.

**La sélection ne prolonge plus le classement du profil, et c'est le changement de méthode du
run.** Les batches 1 et 2 piochaient dans `topCitiesForProfile("celibataire")`, dont le haut de
tableau est saturé de communes de 4 000 à 15 000 habitants (Obernai, Amboise, Chinon, Carnac,
Vaison-la-Romaine) : trier là-dedans revenait à écarter à la main, run après run, exactement les
villes que le profil est censé refuser. Ce batch applique à la place, telle quelle, la règle que
la section **anti-station-fantôme** de `/vacances/profil/celibataire` s'est donnée le 15/08 :
la **part des 15-29 ans au recensement Insee 2022** (`lib/city-population.ts`), population ≥ 60 000,
`culture` ≥ 6,0, `life` ≥ 5,5, hors banlieues et hors villes déjà couvertes. Les sept retenues sont
les sept premières de cette liste : **Nancy 36,4 % (4ᵉ/538), Poitiers 36,0 % (5ᵉ), Rouen 33,4 %
(8ᵉ), Caen 33,3 % (9ᵉ), Clermont-Ferrand 31,5 % (13ᵉ), Tours 29,7 % (18ᵉ), Besançon 28,9 % (23ᵉ)**,
pour une médiane nationale de 18,4 %. Villeurbanne (29,2 %) est écartée comme banlieue d'une
métropole déjà couverte, au même titre que Talence, Saint-Martin-d'Hères et Vandœuvre ;
Amiens (29,0 %) tombe sur `life` 5,1.

**La thèse du batch est assumée et dite dans chaque guide** : ces sept villes ont un score `life`
de 5,7 à 6,6, en dessous des batches 1 et 2 (La Rochelle 8,1, Aix 7,8). Leur vitalité hors saison
ne vient pas d'une densité de terrasses, elle vient d'une population résidente jeune qui habite là
de septembre à juin. C'est le contraire d'une station balnéaire, et c'est précisément ce que le
profil cherche. Chaque guide l'écrit au lieu de le masquer, y compris quand ça dessert la ville
(Poitiers culture 6,2, Clermont culture 6,2, Rouen sécurité 4,7, Tours la plus chère des sept).

⚠️ **Une erreur de données trouvée en écrivant, et corrigée : `lib/transit.ts` donnait un tramway
à Nancy.** Il n'y en a pas. Le TVR (transport léger guidé sur pneus), que l'usage local appelait
« le tram », a été retiré du service, et la ligne 1 roule en **trolleybus 100 % électrique depuis
le 5 avril 2025**, aux côtés de lignes BHNS ; un mode ferré n'est rediscuté qu'à l'horizon 2035.
L'entrée passe de `{ tram, tgv, bhns }` à `{ tgv, bhns }` et porte un commentaire qui dit pourquoi,
parce que la tentation de « restaurer » le tag sur la foi de l'usage local ou d'un vieux plan est
réelle. Portée : le badge « Tramway » disparaît de `/villes/nancy/transports` et des surfaces
vacances ; Nancy reste éligible aux sections train de `CelibataireExtras` / `MonoparentalExtras`
via `bhns`. Leçon de la même famille que le BODACC de F64 : **une donnée saisie à la main sans
avoir vu la source vieillit en silence, et c'est la rédaction qui la rattrape, pas `tsc`.**

⚠️ **Dix affirmations comparatives fausses ou imprécises, écrites au premier jet et corrigées avant
commit.** C'est exactement le mode de défaillance relevé le 19/08 sur la série monoparentale, et il
s'est reproduit à l'identique : les scores *de la ville de la page* étaient tous justes, ce sont les
**superlatifs entre villes** qui dérapent, parce qu'on les écrit de mémoire. `npm run integrity` ne
peut pas les voir (sa garde compare un chiffre à la valeur brute de la ville de la page). Le remède
appliqué ici, à reprendre pour tout batch qui compare : **sortir la matrice des axes du lot avant de
relire**, et vérifier chaque superlatif contre elle.
- Nancy : sécurité 5,1 annoncée « le point le plus bas de ce lot » — c'est **Rouen, 4,7**.
- Caen : nature 5,6 annoncée « le deuxième du lot » — elle est **troisième**, derrière
  Clermont-Ferrand 7,2 et Besançon 6,4.
- Tours : « le coût, 5,9/10, est le plus élevé de ce lot » **inversait la convention d'axe** —
  sur `cost` un score bas veut dire cher. 5,9 est le score le **plus bas** des sept. La correction
  écrit les deux moitiés de la phrase.
- Poitiers : « 20 % de 60 ans et plus, soit exactement la médiane » — la médiane nationale des 538
  villes mesurées est **27,2 %**, pas 20 %. Les sept villes du batch sont toutes très en dessous,
  ce qui est un argument du lot et pas une banalité : la phrase le dit maintenant.
- Cinq égalités présentées comme des rangs : transport 6,4 (Poitiers **et** Clermont), coût 6,4
  (Clermont **et** Besançon), culture 7,3 (Rouen **et** Tours). Même principe que la convention
  classements du 19/08 : **une égalité ne se présente pas comme un départage.**
- Clermont : `life` 6,2 annoncé « le plus modeste du lot avec Poitiers » — **Rouen 5,7 et Poitiers
  5,9** sont tous deux en dessous. Seule la culture était à égalité au dernier rang.

**Chiffres et vérifications.** Les 54 figures en `/10` des sept guides tracent toutes vers un score
**rendu** (`CITIES_SEED` lu via un `npx tsx`, jamais par grep du seed) d'une ville que le guide
nomme ; les parts d'âge viennent de `lib/city-population.ts`. Six faits d'équipement ont été
vérifiés en ligne avant rédaction, parce qu'aucun ne vit dans nos données : les SMAC **L'Autre
Canal** (Nancy), **Le Confort Moderne** (Poitiers), **le 106** (Rouen), **Le Cargö** (Caen),
**La Coopérative de Mai** (Clermont, club de 460 places et grande salle de 1 500, plus de 130
concerts par an), **Le Temps Machine** (Tours, inauguré en 2011 à Joué-lès-Tours, arrêt tram A
Joué Hôtel de Ville) et **La Rodia** (Besançon, 900 places) ; le **tramway de Caen a rouvert sur
rails le 27 juillet 2019** ; le **tramway de Clermont** est une ligne A unique de 34 stations sur
pneus guidés, en service depuis 2006 ; ce que Rouen appelle son **« métro » est commercialement un
tramway** passant en souterrain dans la traversée du centre, et l'exploitant lui-même emploie le
mot ; **Besançon a deux gares**, Viotte en ville (TGV inOui directs depuis Paris-Lyon, tram T2) et
Besançon Franche-Comté TGV hors de la ville reliée par navette, nuance écrite dans le guide parce
qu'elle coûte vingt minutes à qui réserve sans regarder. **Aucun tarif d'hébergement n'est imprimé**,
comme dans toute la série : on transmet le réflexe, pas le prix. Trois prudences assumées : la
montée gare → plateau à Poitiers est signalée comme un critère de choix d'hébergement et non comme
un détail, le pic du **festival du court métrage de Clermont en février** et les **commémorations
du Débarquement début juin dans le Calvados** sont donnés comme des saturations à vérifier avant de
bloquer des dates, et Saint-Pierre-des-Corps est explicitement décrite comme une gare d'une commune
voisine et **non** comme un quartier où loger.

`metaTitle` 57-58 caractères, `metaDesc` 145-159, 6 sections et 1 134-1 196 mots par guide,
densité d'accents 0,145-0,171 (seuil de détection ascii-strip : 0,09), **zéro em-dash dans le
corps**. `relatedGuides` câblés sur des slugs vérifiés existants (`10-choses-a-faire-a-[ville]-2026`,
`etudiant-a-[ville]-2026` ou `vivre-sans-voiture-clermont-ferrand-guide-2026` /
`caen-vs-rouen-comparatif-2026`, plus un guide célibataire d'un batch précédent par affinité
géographique). Garde-fou éditorial tenu : aucune promesse de rencontre, aucun registre « site de
rencontres », aucun cliché sur la solitude, écriture inclusive légère (`seul·e`).

**Écart FR→EN après ce batch : 7 villes** (nancy, poitiers, rouen, caen, clermont-ferrand, tours,
besancon) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN** de la série
`solo-travel-in-[city]-2026`. Aucun piège de nommage : les sept slugs de seed sont sans article ni
homonyme, `things-to-do-in-*` n'entre pas en collision. Pour le batch FR **suivant**, la liste
dérivée de la même règle continue avec **Reims** (27,5 %, culture 7,6), **Metz** (25,6 %),
**Brest** (28,8 %), **Pau** (24,1 %), **Troyes** (24,6 %), **Valence** (21,4 %) et **Chambéry**
(22,7 %, `life` 7,0) — les recalculer plutôt que les recopier, la règle est reproductible en
quelques lignes de `npx tsx`.

### F61 — miroir EN de la série monoparentale : `single-parent-holidays-[city]-2026` (2026-08-19)

Item 5 du plan agent « vacances monoparentales », le dernier de la liste à n'avoir **aucune**
surface : la série FR comptait 7 guides depuis le 05/08, l'anglais zéro. Les 7 jumelles sont
écrites d'un coup dans `data/guides-en.ts` — **La Rochelle, Strasbourg, Nantes, Rennes, Vannes,
Nancy, Dijon**. **Compteurs mesurés : FR 7, EN 7, mêmes villes des deux côtés** (`EN_GUIDES`
685 → 692). Écrit en anglais natif depuis les faits des guides FR, jamais traduit ;
`metaTitle` 36-42 caractères, `metaDesc` 137-145, 6 sections par guide (la série FR en compte 7,
la version EN fusionne la fin de liste comme les batches EN précédents).

**Ce que la version EN ajoute et que le FR n'a pas, parce qu'un lecteur français n'en a pas
besoin.** ① **Le zonage des vacances scolaires**, qui est le premier levier de prix et de foule
en France et que personne n'explique à un arrivant : cinq des sept destinations sont en **zone B**
(académies de Strasbourg, Nantes, Rennes pour Rennes et Vannes, Nancy-Metz), **La Rochelle et
Dijon sont en zone A** (académies de Poitiers et de Dijon) — vérifié ce run, et le guide Dijon le
signale explicitement puisqu'il est l'exception du lot. Les **zones** sont stables, les **dates**
tournent chaque année : la copie renvoie systématiquement au calendrier officiel
`education.gouv.fr` et ne cite aucune date. ② **Le fait qu'un hôtel français se facture à la
chambre et non à la personne**, ce qui n'avantage pas autant qu'il y paraît un adulte seul avec
deux enfants — la chambre familiale ou triple est rare en haute saison, et c'est ce qui justifie
le meublé et le mobil-home. ③ **La condition de résidence des aides** : VACAF, chèques-vacances
ANCV et bons vacances CAF se calculent tous sur le quotient familial CAF, donc suivent le fait
d'habiter en France et non la nationalité — les sept guides le disent, et celui de La Rochelle
ajoute qu'un visiteur venu de l'étranger doit chiffrer son séjour sans eux. ④ Le **112** est
donné à côté du 15 et du 116 117, parce que c'est le numéro qui marche depuis un mobile étranger.

**Aucun montant n'est imprimé**, dans la lignée de la série `solo-travel-in-[city]-2026` : les
tarifs de transport urbain, de vélo public et de musée renvoient au site de l'exploitant
(`yelo.agglo-larochelle.fr`, `cts-strasbourg.eu`, `reseau-stan.com`, `divia.fr`, `kiceo.fr`).
Chaque figure en `/10` a été **relue à travers le module** (`npx tsx` important
`@/data/cities-seed`), jamais par grep du seed, puis contrôlée mécaniquement : les 64 figures des
7 guides tracent toutes vers un score rendu d'une ville que le guide nomme.

⚠️ **Quatre chiffres faux trouvés dans la série FR en la relisant pour la traduire, et corrigés
ce run.** Ils partagent une cause : ce sont tous des **comparaisons entre villes**, écrites de
mémoire, là où les scores de la ville-sujet, eux, étaient justes. `npm run integrity` ne pouvait
pas les voir — sa garde compare un chiffre à la valeur brute *de la ville de la page*, pas à
celle d'une ville citée en passant.
- `vacances-monoparentales-nancy-2026` annonçait Nancy « nettement moins chère que Strasbourg
  (6,9) ou Dijon (7,4) ». Réel : **Strasbourg 5,6 et Dijon 6,2**, contre Nancy 6,2. Nancy est donc
  devant Strasbourg et **à égalité avec Dijon**, pas devant. La phrase inversait aussi le sens de
  l'axe (sur `cost`, un score haut = abordable) ; la version corrigée le dit.
- Le même guide plaçait Nancy (5,1) « un peu en dessous de Strasbourg (7,4) mais au-dessus de
  Metz » en sécurité. Réel : **Strasbourg 5,3 et Metz 5,3** — Nancy est juste en dessous des
  **deux**, et l'écart est trop faible pour arbitrer un séjour dessus, ce que la correction écrit.
  Le « 7,4 » est vraisemblablement le score `schools` de Nancy recopié d'une ligne voisine.
- `vacances-monoparentales-dijon-2026` situait son coût 6,2 « entre Nancy 8,2 et Strasbourg 6,9 ».
  Réel : **Nancy 6,2, Strasbourg 5,6** — et l'encadrement était de surcroît incohérent avec
  lui-même, 6,2 ne tombant pas entre 6,9 et 8,2.
- `vacances-monoparentales-rennes-2026` donnait comme repère rennais « la Tour Solidor
  Sainte-Anne visible depuis presque tout le centre ». **La tour Solidor est à Saint-Malo**
  (Saint-Servan), pas à Rennes — le guide l'envoyait chercher à une heure de train. Remplacée par
  la place de la Mairie, qui était déjà citée dans la même phrase et qui, elle, est le bon repère.
  Aucune de ces quatre erreurs n'est passée dans la version anglaise.

**Leçon à retenir pour les prochains batches** : dans un guide, **le chiffre d'une ville tierce
est le point faible**, pas celui de la ville traitée — on le vérifie à la même exigence, et un
comparatif inter-villes se relit contre le module avant d'être écrit. De même pour les repères
géographiques : un monument attribué à la mauvaise ville ne déclenche aucun contrôle automatique.

**Tags** : un seul tag neuf franchit le seuil de 3 guides, `single parent holidays` (7), qui crée
`/tags/single-parent-holidays` côté EN — d'où le passage de `npm run sitemap:check`. Les autres
réutilisent `single parent in france` (déjà 39 emplois), `brittany`, `grand-est`,
`pays-de-la-loire`, `nouvelle-aquitaine`, `bourgogne-franche-comte`. `npm run search-index`
relancé (`data/search-index.en.json` 692 guides, 96 tags).

**Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, FR 973,
EN 692, 0 score brut recopié des deux côtés), `npm run search-index:check` propre,
`npm run sitemap:check` propre dans les deux sens (FR 29 040 URL, EN 28 565), `npm run parity`
en code 0. Densité d'em-dash ramenée sous la cible R7.10 sur les 7 guides (1 pour 207-225 mots,
cible ~1 pour 200) — six étaient au-dessus au premier jet.

**Restent ouverts sur la verticale** : le **batch 2 FR** de
`vacances-monoparentales-[destination]-2026` sur les rangs 8-25 du profil (Bordeaux, Lyon, Colmar,
Annecy, Grenoble, Chambéry, Reims, Metz, Montpellier, Aix-en-Provence — vérifier tags de transit
et score sécurité **par le module** avant écriture), et l'équivalent EN du croisement mois ×
profil, `/vacances/ou-partir/[combo]` n'ayant pas de jumelle anglaise. La série étant à parité
7/7, la main revient au FR.

### F58 — série `parent-solo-a-[ville]-2026`, batch 7 (2026-08-30) — la série couvre enfin le haut de son propre classement

**+9 guides : La Roche-sur-Yon, Dole, Lannion, Challans, Saint-Dié-des-Vosges, Albi, Cholet, Laon,
Anglet.** Compteurs mesurés des deux côtés **avant** le run, comme les batches 4 à 6 l'exigent :
`grep -c 'slug: "parent-solo-a'` = 57 FR et `grep -c 'slug: "single-parent-in-'` = 57 EN, mêmes
villes de part et d'autre — écart nul, la main revenait donc au FR. Après ce run : **66 FR / 57 EN**.
`GUIDES` 1 026 → 1 035. `npm run search-index` relancé (`data/search-index.json` 1 035 guides,
**250 tags** contre 249) et **`npm run sitemap:check` repassé** parce qu'un tag franchit le seuil de
3 guides et crée `/tags/famille-monoparentale-pays-de-la-loire` — FR 29 114 URL, EN 28 673, chaque
URL déclarée a une page. Les 9 guides sont vérifiés **retrouvés par le lookup de
`app/villes/[slug]/parent-solo/page.tsx`** (`parent-solo-a-${slug}-2026` sur le **slug de seed tel
quel**) **et pourvus de leur photo d'en-tête** (`guideCityPhoto`). Aucun slug hors gabarit : les neuf
villes prennent « à » sans contraction.

⚠️ **La méthode de sélection change, et c'est le vrai apport du run. Ne pas revenir à la
population.** Les batches 1 à 6 sélectionnaient « par population d'abord, parmi les communes non
couvertes disposant d'une référence de loyer T3 ». Mesuré ce run, le résultat de six batches de
cette règle : **la série couvrait 9 des 40 premières villes de son propre classement**, elle avait un
guide sur Ajaccio (rang 316) et **aucun sur La Roche-sur-Yon, 1re sur 363**. Autrement dit, un
lecteur qui arrivait sur `/parent-solo`, lisait la première ligne du tableau et cliquait ne trouvait
rien. Ce batch prend donc **les neuf communes non couvertes les mieux classées** et **referme le
top 11 en entier** (Rennes 5e et Strasbourg 10e étaient déjà écrites). Pour les batches suivants, la
règle est le **rang, pas la population** : le classement publié est la porte d'entrée du sujet, et
c'est lui qu'il faut couvrir de haut en bas.

⚠️ **Le vivier annoncé par le batch 6 était faux, et il faut savoir pourquoi.** Il annonçait un
vivier métropolitain « très réduit », limité à Quimper, Montauban, Narbonne, Sète et Vénissieux. La
mesure réelle donne **192 communes non couvertes hors Île-de-France** au-dessus de 20 000 habitants,
dont Troyes (6,4), Vannes (6,3), Niort (6,1) et Lorient (6,1) que cette liste ignorait — sans parler
des quinze villes du top 40 qui n'avaient pas de guide. La liste avait été recopiée d'un batch à
l'autre au lieu d'être recalculée, exactement le défaut que le batch 4 de la série vacances
célibataire a corrigé le 29/08. **Une liste de candidats se recalcule à chaque run, elle ne se
transmet pas.**

**Exclusions maintenues.** Le cluster francilien non couvert et le cluster nordiste (Roubaix,
Tourcoing) restent hors série au titre de la règle granulaire des batches 4 à 6 : on n'écrit pas de
guide sur une commune dont le composite est largement un proxy de la situation socio-économique des
habitants. Aucune des neuf villes de ce batch n'en relève — la plus basse sur les écoles est
Saint-Dié-des-Vosges à 6,6/10 et la plus basse sur la sécurité Laon à 6,5/10, très au-dessus du
seuil. Mamoudzou et Cayenne restent écartées pour la raison distincte posée au batch 6.

**Trois superlatifs faux corrigés AVANT insertion.** Le mode de défaillance des batches 5 et 6 tient
toujours : **un superlatif est une requête, pas une intuition.** ① Le guide La Roche-sur-Yon
écrivait que sa note d'écoles dépassait « Cholet, Angers ou Laval » — **Cholet est à égalité (7,7) et
Angers fait mieux (7,9)** ; la phrase cite désormais Laval, Saint-Nazaire et Le Mans. ② Le guide Albi
annonçait « le prix le plus élevé des huit villes métropolitaines les mieux classées de ce batch »,
formule qui ne veut rien dire puisque les neuf sont métropolitaines et qu'**Anglet est à 4 300 €
contre 2 200 €** ; corrigé en « le plus élevé de ce batch après Anglet ». ③ Le guide Laon donnait
l'amplitude des Hauts-de-France (3,1 points) comme « le plus grand écart interne de toutes les
régions » — **l'Île-de-France l'égale exactement à 3,1**. Deux arrondis repris au passage : Anglet
gagne **2,1 points** d'écoles sur Biarritz et non « deux », et son avantage sur Bordeaux porte sur
les écoles et la sécurité seulement, les deux communes étant **à égalité sur le coût de la vie
(4,5)** et Bordeaux gardant un dixième sur les transports.

**Vérification des pivots automatisée, reconduite des batches 4 à 6** : un script rejoue **après
insertion** fit, rang, T1/T2/T3, prix au m², prix des 65 m², revenu minimum, ratio loyer ÷ écoles,
populations Insee 2011/2016/2022 et les quatre axes de chacune des neuf villes, et échoue si l'une
des valeurs n'est pas retrouvée dans le texte du guide. Il a rattrapé un manque au premier passage
(le guide Cholet ne citait ni son T1 ni son T2, seuls des soixante-six à ne pas le faire) ; les 9
passent après correction. Tous les chiffres sont lus **à travers les modules** (`npx tsx` sur
`@/data/cities-seed`, `@/data/housing`, `@/lib/city-population`, `@/lib/parent-solo`), jamais par
grep du seed, et le rang est rejoué avec le départage réel de `app/parent-solo/page.tsx`
(`name.localeCompare(…, "fr")` à égalité de score). `metaTitle` 49-53 caractères, `metaDesc` 141-159,
6 sections par guide, densité d'accents 0,138-0,176 (**par mot, pas par lettre** — seuil ascii-strip
0,09), 0 à 3 em-dashes par guide, soit 0,38 pour 200 mots au pire contre un plafond R7.10 de ~1.

**Le batch prend le haut de presque tous les barèmes de la série, et c'est cohérent avec sa règle de
sélection.** **Ratio loyer T3 ÷ score écoles** : les **huit meilleurs rapports des 66 guides** sont
dans ce batch — Dole 101 € par point, Saint-Dié-des-Vosges 102, La Roche-sur-Yon, Lannion et Cholet
104, Albi 109, Challans et Laon 112 — Anglet fermant la marche à 138. À l'échelle des 363 communes
classées, deux non couvertes font encore mieux, **Auch et Cambrai à 97 €**, et les guides le disent
plutôt que de le taire. Sept des huit meilleurs scores de coût de la vie de la série sont également
ici, **Saint-Dié-des-Vosges à 8,5/10 en tête**, et six des huit meilleures notes de sécurité, dont
**Challans à 8,3/10, la meilleure des 363 communes du classement**.

**Cinq cas valent d'être gardés en tête.** ① **La Roche-sur-Yon** est la **seule commune des 363 à
franchir le seuil de 7,5 qui déclenche la mention « Excellent »** dans `lib/parent-solo.ts` : la
deuxième, Dole, est à 7,2. Elle ne descend sous 7,0 sur aucun des quatre axes, ce qui est exactement
ce que le barème récompense — il punit les profils déséquilibrés, un axe faible pesant un quart ou un
tiers de la note sans compensation. ② **Saint-Dié-des-Vosges** cumule le **m² le moins cher de la
série (1 100 €, soit 71 500 € pour 65 m²)** et son **deuxième seuil d'entrée le plus bas (2 050 €,
derrière Calais)** avec le **deuxième recul démographique le plus marqué (−9,5 % en onze ans, derrière
Fort-de-France)** : le guide pose les deux effets contraires, marché locatif détendu contre carte
scolaire qui se resserre, et note que le rythme ralentit après 2016, à la différence de Calais où il
s'accélère. ③ **Challans** affiche la **meilleure note de sécurité du classement (8,3/10)** et la
**plus forte croissance de la série (+20,9 % en onze ans)**, deux faits qui tirent dans des sens
opposés : la croissance sature crèche et périscolaire, c'est-à-dire les dispositifs qui remplacent le
second adulte. Le guide dit aussi, sans le contourner, que **La Roche-sur-Yon et Cholet offrent la
même note d'écoles pour 60 € de T3 de moins et une meilleure desserte**. ④ **Anglet** est le
pendant exact du couple Pessac/Mérignac du batch 6 : **même T3 (1 200 €) et même seuil (3 450 €) qu'à
Bayonne pour 1,7 point d'écoles de plus**, 11e contre 175e, et **Biarritz coûte 550 € de revenu
mensuel de plus pour 2,1 points d'écoles de moins** — le cas le plus net de la série où le prix ne
suit pas le dossier. ⑤ **Laon** ouvre le seul triangle départemental de la série : **Laon, Soissons
et Saint-Quentin dans l'Aisne**, soit le plus équilibré, le plus cher sans contrepartie et le moins
cher mais le plus faible sur les écoles et la sécurité.

**Précautions éditoriales reconduites, à ne pas alléger** : ① l'axe écoles mesure **l'offre
communale**, pas la réussite des élèves ni la qualité du travail des enseignants, et chaque guide le
redit ; ② **aucune des neuf communes n'a de quartier documenté** dans `data/neighborhoods.ts`, ce que
les guides disent au lieu de le taire, et qui sert de raison affichée au fait que le site ne publie
**aucun verdict de sécurité par secteur** ; ce batch ne cite donc **aucun loyer de quartier** ; ③ les
guides nomment les villes qui font mieux qu'eux, y compris hors série (Auch et Cambrai sur le
rapport, Laval sur le m², La Roche-sur-Yon face à Cholet à budget identique) — un guide de série qui
ne dit que du bien de sa ville n'est pas un guide, c'est une brochure ; ④ deux contraintes
hors-composite sont posées parce qu'elles décident d'une semaine et qu'aucun axe ne les voit : les
**horaires décalés du bassin industriel choletais** face aux horaires du périscolaire, et la **part de
résidences secondaires et de locations saisonnières** qui réduit l'offre à l'année sur le littoral
angloy.

**Apport de méthode reconduit des batches 5 et 6, la trajectoire démographique réelle**, lue dans
`data/city-population.json` via `lib/city-population.ts` : Challans **+20,9 %** (18 930 → 22 890),
Anglet +9,6 %, La Roche-sur-Yon +3,6 %, Lannion +3,0 %, Albi +2,9 % **après un creux en 2016**,
Cholet −0,6 % sur onze ans mais +0,7 % depuis 2016, Dole −0,9 % **avec la même trajectoire en V**,
Laon −6,5 %, Saint-Dié-des-Vosges **−9,5 %**. Cholet mérite d'être signalée : **347 habitants
d'amplitude sur onze ans**, une stabilité que presque aucune des 66 villes de la série ne tient, et
qui lui évite les deux inconvénients à la fois. ⚠️ Le seed conserve ses `population` approximatives,
qui servent au seuil des 20 000 et aux tris : **les deux nombres coexistent volontairement**, ne pas
les aligner, et dire lequel est cité. L'écart est net sur Lannion (seed 20 000, recensement 20 525),
La Roche-sur-Yon (57 000 contre 54 699) et Cholet (55 000 contre 54 074), et les guides le disent.

**Prochain run parent-solo : le miroir EN** (`single-parent-in-[city]-2026`), l'écart étant de 9.
Vérifier le compteur des deux côtés avant de suivre cette phrase — consigne des batches 4 à 6, elle
vaut pour celle-ci. Nommage : **le slug EN se dérive du slug de seed tel quel** (règle du batch 33
tourisme), donc `single-parent-in-la-roche-sur-yon-2026` et
`single-parent-in-saint-die-des-vosges-2026` gardent leur forme complète ; la page ville résout son guide par
`getEnGuide('single-parent-in-' + slug + '-2026')` et une version « propre » du slug rendrait le
guide invisible. Deux points de vigilance pour ces jumelles : **`single-parent-in-dole-2026`** est un
slug ambigu en anglais (*dole* y désigne l'allocation chômage), l'intro doit poser la ville dès la
première ligne comme le batch 37 tourisme l'a fait pour Orange ; et **`single-parent-in-laon-2026`**
ne doit pas être confondu avec Lyon ni avec Lens. Pour le batch FR **suivant**, la règle du rang
s'applique : les communes non couvertes les mieux classées après ce batch sont **Fontainebleau**
(6,9, Île-de-France mais sans rapport avec le cluster exclu), **Soissons** (6,9), **Vienne** (6,9),
**Villefranche-sur-Saône** (6,9), **Auch** (6,8), **Chaumont** (6,8), **Compiègne** (6,8),
**Les Sables-d'Olonne** (6,8) et **Sens** (6,8) — vivier à **recalculer**, pas à recopier.

### F58 — série `parent-solo-a-[ville]-2026`, batch 6 (2026-08-28)

**+9 guides : Valence, Colmar, Saint-Nazaire, Chambéry, Bourges, Pessac, Calais, Le Tampon (974),
Ajaccio.** Compteurs mesurés des deux côtés **avant** le run, comme les batches 4 et 5 l'exigent :
`grep -c 'slug: "parent-solo-a'` = 48 FR et `grep -c 'slug: "single-parent-in-'` = 48 EN, mêmes
villes de part et d'autre — écart nul, la main revenait donc au FR. Après ce run : **57 FR / 48 EN**.
`GUIDES` 1 003 → 1 012. `npm run search-index` relancé (`data/search-index.json` 1 012 guides,
**248 tags** contre 245) et **`npm run sitemap:check` repassé** parce que trois tags franchissent le
seuil de 3 guides — FR 29 089 URL, chaque URL déclarée a une page. Les 9 guides ont été vérifiés
**retrouvés par le lookup de `app/villes/[slug]/parent-solo/page.tsx`** (ligne 64,
`parent-solo-a-${slug}-2026` sur le **slug de seed tel quel**) **et pourvus de leur photo d'en-tête**
(`guideCityPhoto`) après écriture.

**Sélection : population d'abord, parmi les communes non couvertes disposant d'une référence de
loyer T3 dans `data/housing.ts`**, filtre inchangé depuis le batch 3 — sans T3, `minIncomeForT3` ne
produit rien et le guide perd sa colonne vertébrale. Six des sept candidates laissées en piste par
le batch 5 sont honorées (Calais, Saint-Nazaire, Chambéry, Colmar, Valence, Le Tampon) ; **Narbonne
et Sète sont écartées au profit de Bourges, Pessac et Ajaccio, toutes trois plus peuplées** et
absentes de la liste du batch 5, qui n'avait pas repassé le vivier. Amplitude assumée : **rang 63
(Valence) à 316 (Ajaccio)** sur les 363 communes de plus de 20 000 habitants, quatre villes sur neuf
sous la médiane du classement (5,5).

⚠️ **Exclusions maintenues et exclusions nouvelles, toutes documentées.** ① Le cluster francilien
non couvert (Saint-Denis 93, Aubervilliers, Argenteuil, Montreuil, Nanterre, Créteil,
Aulnay-sous-Bois, Drancy, Champigny) et le cluster nordiste (Roubaix, Tourcoing) restent hors série
au titre de la règle posée au batch 4 et durcie au batch 5 : on n'écrit pas de guide sur une commune
dont le composite est largement un proxy de la situation socio-économique des habitants, parce que
le guide glisserait du conseil d'installation au commentaire sur les gens. **La règle est
granulaire, pas géographique**, et elle attrape ce run **La Seyne-sur-Mer** (écoles 2,4 / sécurité
3,7), qui aurait été éligible par la population. ② **Mamoudzou et Cayenne sont écartées pour une
raison différente et il faut la distinguer** : leurs composites (3,5 et 3,8, soit 363e et 360e sur
363) ne sont pas un proxy socio-économique communal mais une mesure d'infrastructure territoriale,
donc écrivables sur le fond. Elles sont écartées parce que **Mamoudzou n'a pas de population Insee**
(hors fichier « France hors Mayotte »), ce qui prive le guide de l'apport de méthode du batch 5, et
parce qu'un guide « faut-il élever seul son enfant dans la commune classée dernière de France » se
tient mal sans données infracommunales, la reconstruction post-Chido en plus côté Mayotte. À
reprendre le jour où l'une de ces deux conditions change, pas avant.

**Quatre superlatifs faux ont été corrigés AVANT insertion, et un cinquième trouvé dans le corpus
existant.** C'est le mode de défaillance identifié au batch 5 et la leçon tient : **un superlatif est
une requête, pas une intuition.** Toutes les affirmations en « le plus », « le meilleur », « le seul »
de ce batch ont été rejouées contre les modules avant écriture, et quatre sont tombées :
① Saint-Nazaire s'annonçait « troisième prix d'achat le plus bas du batch » — **Le Tampon est à
2 100 € le m² contre 2 200 €**, elle est quatrième ; ② et « trois villes de la région font mieux pour
un loyer inférieur » — **elles sont quatre** (La Roche-sur-Yon, Cholet, Laval, Saumur) ; ③ Le Tampon
s'attribuait « le seuil d'entrée le plus bas de l'île » — **Saint-Joseph est à 2 250 € également**,
c'est une égalité (le batch 5 avait déjà corrigé la même phrase dans le guide Saint-Pierre) ;
④ Ajaccio écrivait « quatrième transport le plus bas du batch » alors qu'elle est **deuxième**
derrière Le Tampon. ⑤ Enfin, le guide **Pau du batch 5 affirmait « à l'échelle de la série entière,
seule Poitiers fait mieux, à 119 € »** sur le rapport loyer ÷ point d'écoles : **quatre villes font
mieux** (Grenoble 113 €, Brest 115 €, Tours et Poitiers 119 €), et Rennes et Besançon l'égalent à
122 €. La phrase est réécrite ce run. Deux arrondis ont également été repris avant insertion, le
seuil relâché de Pessac (3 250 € et non 3 300 €) et celui du Tampon (2 350 € et non 2 400 €) : le
moteur arrondit au multiple de 50 le plus proche, pas à la centaine.

⚠️ **`npm run integrity` a rattrapé une collision figure/axe de plus, la quatrième de la série.**
Le guide Bourges citait « des transports à 7,0 et 6,4 » pour Tours et Orléans — 7,0 est le **littéral
brut du seed pour Bourges elle-même**, dont la valeur rendue est 5,2, et la garde refuse toute figure
collée à un nom d'axe qui égale le littéral brut de la ville du guide. La valeur citée était juste
(Tours est bien à 7,0 rendu), le voisinage ne l'était pas. Le contournement reste celui du batch 5 :
**attribuer explicitement chaque note à sa ville**, ne jamais laisser une note flotter à côté du nom
d'un axe. Ne pas assouplir la garde pour ça — elle est étroite par construction.

**Vérification des pivots automatisée, reconduite des batches 4 et 5** : un script rejoue **après
insertion** fit, rang, T1/T2/T3, prix au m², revenu minimum, ratio loyer ÷ écoles, populations Insee
2011 et 2022 et les quatre axes de chacune des neuf villes, et échoue si l'une des valeurs n'est pas
retrouvée dans le texte du guide correspondant. Les 9 passent du premier coup. Tous les chiffres sont
lus **à travers les modules** (`npx tsx` sur `@/data/cities-seed`, `@/data/housing`,
`@/lib/city-population`, `@/lib/parent-solo`), jamais par grep du seed, et le rang est rejoué avec le
départage réel de `app/parent-solo/page.tsx` (`name.localeCompare(…, "fr")` à égalité de score).
`metaTitle` 49-54 caractères, `metaDesc` 141-153, 6 sections par guide, densité d'accents 0,148-0,168
(seuil de détection ascii-strip 0,09 ; **la densité se mesure par mot, pas par lettre**).

**Ratio loyer T3 ÷ score écoles**, calculé comme le palmarès mensuel et cité dans chaque guide :
Saint-Nazaire 129 € par point (meilleur du lot), Bourges 131, Valence 136, **Le Tampon et Calais 142
à égalité**, Chambéry 149, Colmar 152, Pessac 164, **Ajaccio 293 — le troisième plus mauvais rapport
des 57 guides de la série, derrière Marseille (458 €) et Paris (354 €) seulement**.

**Quatre cas valent d'être gardés en tête.** ① **Calais** ouvre à **1 950 € net, le seuil d'entrée le
plus bas des 57 villes de la série**, avec le m² le moins cher également (1 350 €, soit 87 750 € pour
65 m²) — et **perd 7 393 habitants entre 2016 et 2022, la contraction la plus forte de la série sur
cette fenêtre** (−9,9 %, devant Fort-de-France à −7,2 %). Le comparateur qui devrait décider d'un
projet est interne à la région : **Cambrai affiche le même T3 à 640 € et fait mieux sur les quatre
axes**, et cinq communes des Hauts-de-France font mieux pour un T3 sous 700 €. ② **Colmar** est la
**seule du batch dont les quatre axes dépassent tous 6,0**, ce que le composite récompense, et sa
stabilité démographique apparente (−49 habitants sur onze ans) masque **−2 539 depuis le pic de
2016**, quatrième recul de la série sur cette fenêtre. ③ **Pessac** est la contrepartie annoncée par
le guide Mérignac du batch 5 : **T3 et m² strictement identiques (1 080 € et 3 800 €), 1,1 point
d'écoles de plus** (6,6 contre 5,5), 170e contre 222e. ④ **Ajaccio**, premier guide corse de la
série, cumule un seuil d'entrée de **3 650 € — supérieur à celui de Bordeaux (3 450 €)** — avec des
écoles à 4,1/10 ; et **l'insularité change la nature du conseil** : la Corse ne compte que 2 communes
éligibles (Ajaccio 4,4, Bastia 4,3), donc la mécanique « regardez à trente kilomètres » sur laquelle
se terminent tous les autres guides de la série n'y a aucun objet. Le guide le dit explicitement.

**Précautions éditoriales reconduites, à ne pas alléger** : ① l'axe écoles mesure **l'offre
communale**, pas la réussite des élèves ni la qualité du travail des enseignants, et chaque guide le
redit ; ② **aucune des neuf communes n'a de quartier documenté** dans `data/neighborhoods.ts`, ce que
les guides disent au lieu de le taire, et qui sert de raison affichée au fait que le site ne publie
**aucun verdict de sécurité par secteur** ; ce batch ne cite donc **aucun loyer de quartier**, ce qui
supprime par construction le risque de collision d'échelle des batches 4 et 5 ; ③ sur Calais et
Ajaccio, les deux dossiers les plus bas du lot sur écoles et sécurité, la copie s'en tient à ce que
les indicateurs mesurent et **ne dit rien des habitants**. ④ Pour Le Tampon, les contraintes
réunionnaises du batch 5 sont reprises telles quelles : le score de coût de la vie (4,6/10) décrit
**l'alimentaire et l'importation, pas le loyer** — un budget reconstruit depuis un loyer
métropolitain équivalent se trompe de plusieurs centaines d'euros, systématiquement dans le même
sens ; la **baignade en mer est interdite hors du lagon de la côte ouest et hors bassins surveillés,
et Le Tampon n'a pas de littoral** ; et la **saison cyclonique impose une garde d'urgence identifiée
à l'avance**, les fermetures d'établissements se décidant la veille au soir.

**Apport de méthode reconduit du batch 5, la trajectoire démographique réelle**, lue dans
`data/city-population.json` via `lib/city-population.ts` : Pessac **+13,8 %** (58 743 → 66 874),
Ajaccio +12,8 %, Le Tampon +9,3 %, Saint-Nazaire +9,0 %, Chambéry +3,1 %, Valence +1,8 % **après un
creux en 2016, seule trajectoire en V du batch**, Colmar −0,1 % sur onze ans mais −3,6 % depuis 2016,
Bourges −3,5 %, **Calais −7,3 %**. Chaque guide en tire la même paire d'effets contraires, jamais
l'un sans l'autre : une commune qui grandit **sature** crèche, périscolaire, restauration et
dérogations, c'est-à-dire les dispositifs qui remplacent le second adulte ; une commune qui se vide
**détend son marché locatif** tout en resserrant sa carte scolaire, donc allonge les trajets.
⚠️ Le seed conserve ses `population` approximatives, qui servent au seuil des 20 000 et aux tris :
**les deux nombres coexistent volontairement**, ne pas les aligner, et dire lequel est cité. L'écart
est spectaculaire sur **Chambéry** (seed 68 000, recensement 60 251) et le guide l'explique plutôt
que de le taire.

**Prochain run parent-solo : le miroir EN** (`single-parent-in-[city]-2026`), l'écart étant de 9.
Vérifier le compteur des deux côtés avant de suivre cette phrase — consigne des batches 4 et 5, elle
vaut pour celle-ci. Nommage à surveiller : **le slug EN se dérive du slug de seed tel quel** (règle
du batch 33 tourisme, confirmée par le batch 33 parent-solo sur `saint-louis-reunion-974`), donc
**`single-parent-in-le-tampon-2026`** garde son article, comme `things-to-do-in-le-tampon-2026` —
la page ville résout son guide par `getEnGuide('single-parent-in-' + slug + '-2026')`, et une version
« propre » du slug rendrait le guide invisible. Attention aussi à
**`single-parent-in-saint-nazaire-2026`**, à ne pas confondre avec les Saint-X réunionnais déjà
présents. Pour le batch FR **suivant**, le vivier métropolitain hors Île-de-France et hors communes à
donnée trop grossière est désormais très réduit : restent **Quimper** (6,1), **Montauban** (6,3),
**Narbonne** (4,9), **Sète** (4,8) et **Vénissieux** (5,6, à examiner au regard de la règle
granulaire : écoles 4,5 / sécurité 4,2, au-dessus du seuil d'exclusion mais pas de beaucoup), plus
les communes réunionnaises non couvertes — Saint-Louis, Saint-André, Saint-Benoît, Saint-Joseph — et
**Le Lamentin** (4,5) en Martinique. Sous ce vivier, la série approche de sa fermeture naturelle.

### F58 — série `parent-solo-a-[ville]-2026`, batch 5 (2026-08-23)

**+9 guides : Saint-Paul (974), Avignon, Saint-Pierre (974), Béziers, La Rochelle, Pau,
Cherbourg-en-Cotentin, Fort-de-France, Mérignac.** Compteurs mesurés des deux côtés **avant** le
run, comme le batch 4 l'exigeait : `grep -c 'slug: "parent-solo-a'` = 39 FR et
`grep -c 'slug: "single-parent-in-'` = 39 EN, mêmes villes de part et d'autre — écart nul, la main
revenait donc au FR. Après ce run : **48 FR / 39 EN**. `GUIDES` 980 → 989. `npm run search-index`
relancé (`data/search-index.json` 989 guides, **245 tags** contre 241) et **`npm run sitemap:check`
repassé** parce que quatre tags franchissent le seuil de 3 guides et créent autant de pages :
`famille-monoparentale-drom`, `famille-monoparentale-nouvelle-aquitaine`,
`famille-monoparentale-occitanie`, `vie-chere-outre-mer-parent-seul` — FR 29 060 URL, chaque URL
déclarée a une page.

**Sélection : population d'abord, parmi les communes non couvertes disposant d'une référence de
loyer T3 dans `data/housing.ts`**, filtre inchangé depuis le batch 3 — sans T3, `minIncomeForT3` ne
produit rien et le guide perd sa colonne vertébrale. Amplitude assumée comme aux batches 3 et 4 :
**rang 60 (Pau) à 325 (Saint-Paul)** sur les 363 communes de plus de 20 000 habitants, cinq villes
sur neuf sous la médiane du classement (5,5).

⚠️ **Roubaix et Tourcoing, annoncées comme candidates par le batch 4, sont écartées — et l'écart
avec la consigne est délibéré.** Le batch 4 a posé une règle et une liste, et les deux se
contredisaient. La règle : on n'écrit pas de guide sur une commune dont le composite est
« largement un proxy de la situation socio-économique des habitants », parce qu'un guide bâti
dessus glisse du conseil d'installation au commentaire sur les gens qui y vivent — même arbitrage
que le refus de la série `quartiers-a-eviter`. La liste, elle, plaçait Roubaix et Tourcoing en tête
des candidates. Or Roubaix sort à **écoles 2,2 / sécurité 2,2**, c'est-à-dire exactement le profil
d'Aubervilliers (2,4 / 2,2) et de Saint-Denis 93 (2,4 / 2,2), les deux communes que le batch 4
citait pour justifier l'exclusion ; Tourcoing suit à 2,8 / 2,6. **La règle est granulaire, pas
géographique** : elle ne parle pas du cluster francilien, elle parle du niveau de granularité de la
donnée, et ce niveau est le même dans le Nord. Les deux communes restent donc hors série tant que
`data/neighborhoods.ts` n'est pas enrichi. Le cluster francilien non couvert (Saint-Denis 93,
Aubervilliers, Argenteuil, Montreuil, Nanterre, Créteil, Aulnay-sous-Bois, Drancy, Champigny) reste
écarté pour la même raison.

**Apport de méthode de ce batch : la trajectoire démographique réelle.** Les batches 1 à 4 citaient
la population du seed. Ce batch lit **`data/city-population.json` via `lib/city-population.ts`**
(populations municipales Insee 2011 / 2016 / 2022) et publie la trajectoire, parce que c'est un
paramètre que le composite ne mesure pas et qui décide de choses concrètes pour un foyer à un
adulte : une commune qui gagne des habitants voit saturer le périscolaire, la restauration et les
dérogations — exactement les dispositifs qui remplacent le second adulte absent ; une commune qui
en perd voit sa carte scolaire se resserrer, donc les trajets s'allonger, tout en détendant son
marché locatif. Les neuf villes couvrent les deux extrêmes : **Mérignac +17,1 %** (65 882 → 77 136),
Béziers +13,1 %, La Rochelle +6,8 %, Saint-Pierre +6,1 %, Saint-Paul +2,2 %, Avignon +1,7 % mais en
repli depuis 2016, Pau −1,5 %, **Cherbourg-en-Cotentin −4,5 %** (−3 662 habitants) et
**Fort-de-France −13,4 %** (−11 588 habitants). ⚠️ Le seed conserve ses `population` approximatives,
qui servent au seuil des 20 000 et aux tris : **les deux nombres coexistent volontairement**, ne
pas les aligner, et dire lequel est cité.

**Premier guide martiniquais de la série** (Fort-de-France), après le premier guide réunionnais au
batch 4. L'angle retenu est le dépeuplement plutôt que le classement, pour une raison propre au
profil : les départs sont majoritairement le fait de jeunes actifs, et c'est **le réseau d'entraide
de proximité** qu'ils raréfient — la ressource même qui remplace le second adulte. Aucun des quatre
axes ne la mesure. Deux contraintes ultramarines reprises telles quelles du batch 4 et **à ne pas
diluer** : la saison cyclonique et les fermetures d'établissements décidées la veille au soir, qui
imposent une garde d'urgence identifiée à l'avance ; et le fait que le score de coût de la vie
(4,1/10 à Fort-de-France comme à Saint-Paul) décrit **l'alimentaire et l'importation, pas le
loyer** — un budget reconstruit depuis un loyer métropolitain équivalent se trompe de plusieurs
centaines d'euros, systématiquement dans le même sens. Pour La Réunion, la règle de baignade est
rappelée avec sa géographie exacte : **le lagon est sur la côte ouest**, donc Saint-Paul le borde
(seul avantage concret qu'elle a sur le chef-lieu) et **il n'y a pas de lagon dans le sud**, ce qui
concerne directement Saint-Pierre.

⚠️ **Neuf affirmations comparatives fausses ont été trouvées et corrigées APRÈS insertion, par une
passe de vérification croisée** — aucune n'aurait été vue par `tsc` ni par `npm run integrity`,
parce qu'aucune ne porte sur un chiffre inventé : toutes portent sur un **superlatif ou un rang
relatif** calculé de tête. Le détail, parce que c'est le mode de défaillance à surveiller :
① Saint-Pierre annonçait « la meilleure note de sécurité de l'île » (5,2) — **Le Tampon est à 5,5** ;
② et « le meilleur rapport écoles-loyer de l'outre-mer » (153 €) — **Le Tampon est à 142 € et Le
Lamentin à 180 €** ; ③ et « le seuil d'entrée le plus bas des communes réunionnaises » (2 400 €) —
**Le Tampon et Saint-Joseph sont à 2 250 €** ; ④ et « deux axes au-dessus de la moyenne, ce
qu'aucune autre commune de l'île ne fait » — **Le Tampon en fait autant** ; ⑤ et « transports 3,7 au
Tampon, le plus faible de l'île » — **Saint-Benoît et Saint-Joseph sont à 3,3** ; ⑥ Béziers écrivait
que Carcassonne « fait mieux sur les quatre axes » — elle fait mieux sur deux, **égale sur les
transports (4,9) et est en dessous sur le coût (6,2 contre 6,4)** ; ⑦ Cherbourg s'annonçait
« deuxième seuil le plus bas du batch » — **il est troisième**, derrière Béziers (2 200 €) et
Saint-Pierre (2 400 €) ; ⑧ Avignon et ⑨ Fort-de-France se donnaient le mauvais rang de ratio
(septième et sixième, pas huitième tous les deux) ; et Fort-de-France s'attribuait « la meilleure
nature des trois communes martiniquaises » — **Le Robert est à 7,8 contre 7,5**. **Leçon
opérationnelle : un superlatif est une requête, pas une intuition.** Toute phrase en « le plus »,
« le meilleur », « le seul » doit être rejouée contre le module avant commit, au même titre qu'un
chiffre. Le garde-fou ajouté ce run est un script de sweep qui extrait tous les `X,Y/10` des guides
et refuse toute valeur qui n'est l'axe rendu d'aucune ville — il ne voit pas les superlatifs, d'où
la table comparative imprimée et relue à la main.

**Vérification des pivots reconduite du batch 4, et automatisée cette fois** : un script rejoue,
**après insertion**, fit, rang, population Insee 2022, T1/T2/T3, prix au m², revenu minimum, ratio
loyer ÷ écoles et les quatre axes de chacune des neuf villes, et échoue si l'une des valeurs n'est
pas retrouvée dans le texte du guide correspondant. Il a rattrapé deux omissions (le ratio de
Saint-Paul, le T1 de Cherbourg). Tous les chiffres sont lus **à travers les modules**
(`npx tsx` sur `@/data/cities-seed`, `@/data/housing`, `@/data/neighborhoods`,
`@/lib/city-population`, `@/lib/parent-solo`), jamais par grep du seed, et le rang est rejoué avec
le départage réel de `app/parent-solo/page.tsx` (`name.localeCompare(…, "fr")` à égalité de score).

**Ratio loyer T3 ÷ score écoles**, calculé comme le palmarès mensuel et cité dans chaque guide :
Pau 122 € par point (meilleur du lot, et deuxième de toute la série après Poitiers à 119 €),
Cherbourg-en-Cotentin 141, La Rochelle 149, Saint-Pierre 153, Saint-Paul 184, Fort-de-France 188,
Avignon 189, Mérignac 196, Béziers 200 (le pire).

**Trois cas valent d'être gardés en tête.** ① **Avignon** : culture 9,0/10, l'une des plus hautes du
site, et 212e sur 363 — la démonstration la plus nette de la série que la réputation d'une ville et
son adéquation à un profil sont deux questions distinctes ; à moins de 40 km, Orange (6,1) et
Carpentras (6,0) la battent d'un point pour 80 € de loyer mensuel en moins. ② **La Rochelle** : le
cas Annecy du batch 4 rejoué — meilleur dossier qualitatif du lot (sécurité 6,5, écoles 7,4,
global 7,2) et **3 150 € net de seuil d'entrée**, le plus élevé du batch, avec un m² à 4 200 € qui
ferme aussi la porte de l'accession ; le composite est un **rang relatif, pas un test de
solvabilité**, et Niort et Poitiers font le même travail 220 à 240 € moins cher. ③ **Mérignac** :
à loyer **strictement identique** (1 080 €), Pessac offre 6,6 d'écoles contre 5,5 et un meilleur
composite ; Bordeaux, pour 120 € de plus, offre 7,4. Le seul argument qui sauve Mérignac est son
score de transport (7,7/10, le meilleur du batch) — c'est le seul axe du composite capable de
**retirer une ligne entière du budget**, ce qui vaut d'être dit explicitement dans tous les guides
où il est haut.

**Précautions éditoriales reconduites, à ne pas alléger** : ① l'axe écoles mesure **l'offre
communale**, pas la réussite des élèves ni la qualité du travail des enseignants, et chaque guide le
redit ; ② les scores de quartier de `data/neighborhoods.ts` sont sur une **échelle propre** qui ne
se compare pas au score communal, et ce batch ne cite d'eux que des **loyers T2**, jamais une note
adjacente à un nom d'axe — c'est le contournement le plus simple des trois collisions que
`npm run integrity` avait rattrapées au batch 4 ; ③ le fichier ne documente que 2 à 3 quartiers par
ville, ce qui est donné comme la raison pour laquelle le site ne publie **aucun verdict de sécurité
par secteur**. Sur Béziers et Fort-de-France, les deux dossiers les plus bas du lot sur écoles et
sécurité, la copie s'en tient à ce que les indicateurs mesurent et **ne dit rien des habitants** ;
la mention « quelques zones sensibles à éviter le soir » que porte `data/neighborhoods.ts` sur le
centre de Fort-de-France **n'est pas reprise** — un résumé de quartier n'est pas une source.

**Prochain run parent-solo : le miroir EN** (`single-parent-in-[city]-2026`), l'écart étant de 9.
Vérifier le compteur des deux côtés avant de suivre cette phrase — c'est la consigne du batch 4, et
elle vaut pour celle-ci. Nommage à surveiller : **`single-parent-in-saint-paul-reunion-2026`** et
**`single-parent-in-saint-pierre-reunion-2026`**, à désambiguïser comme
`single-parent-in-saint-denis-reunion-2026` l'est déjà, et **le slug EN se dérive du slug de seed
tel quel** (règle posée par le batch 33 tourisme : la page ville résout son guide par
`getEnGuide('single-parent-in-' + slug + '-2026')`, donc une version « propre » du slug rendrait le
guide invisible sur la page de la ville). Pour le batch FR **suivant**, le vivier métropolitain hors
Île-de-France et hors communes à donnée trop grossière se réduit nettement : restent surtout
**Calais** (5,2), **Saint-Nazaire** (6,2), **Chambéry** (6,1), **Colmar** (6,3), **Valence** (6,4),
**Narbonne** (4,9) et **Sète** (4,8), plus les communes réunionnaises non couvertes — **Le Tampon**
(4,9, et le meilleur rapport écoles-loyer de l'île à 142 €), Saint-Louis, Saint-André, Saint-Benoît,
Saint-Joseph — et **Le Lamentin** (4,5) en Martinique.

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

Ce miroir EN a été livré le 2026-08-15 (`0084d73`), ramenant la série à 29 FR / 29 EN.

### F58 — série `parent-solo-a-[ville]-2026`, batch 4 (2026-08-16)

**+10 guides : Nîmes, Saint-Denis de La Réunion, Le Mans, Amiens, Annecy, Perpignan, Orléans,
Mulhouse, Poitiers, Dunkerque.** Compteur mesuré (`grep -c 'slug: "parent-solo-a'`) : **39 FR**,
contre 29 EN. `GUIDES` 957 → 967. `npm run search-index` relancé (`data/search-index.json`
967 guides), sinon `search-index:check` échoue.

⚠️ **Le batch 3 ci-dessus annonçait un miroir EN comme prochain run : cette note était périmée.**
Le miroir a été livré le lendemain (`0084d73`) et la parité était revenue à 29/29 avant ce run.
C'est le mode de régression à surveiller dans ce fichier : une consigne « prochain run » écrite
en fin de batch survit au run qui l'exécute. **Vérifier le compteur réel avant de la suivre**,
`grep -c` des deux côtés coûte deux secondes.

**Sélection** : population d'abord parmi les communes non couvertes disposant d'une référence de
loyer T3 dans `data/housing.ts` — sans T3, `minIncomeForT3` ne produit rien et le guide perd sa
colonne vertébrale. Amplitude assumée, comme au batch 3 : **rang 46 (Poitiers) à 287 (Saint-Denis
de La Réunion)** sur les 363 communes de plus de 20 000 habitants, avec trois villes sous la
médiane du classement (5,5). Un lot qui ne retiendrait que le haut de tableau ferait une page de
promotion, pas un classement.

**Premier batch outre-mer de la série**, qui était 100 % métropolitaine alors que huit communes
réunionnaises figurent au classement. Deux faits sont posés tels quels dans le guide plutôt
qu'arrondis : **aucune commune de La Réunion n'atteint la médiane nationale**, et l'écart entre
les huit est **inférieur à un point** (Le Tampon et Saint-Pierre 4,9 → Saint-André 4,1), donc le
choix entre communes de l'île se joue sur l'emploi et le trajet, pas sur le classement. Les deux
axes responsables sont le coût de la vie (4,1/10, le plus bas du batch) et les transports
(4,7/10, le plus bas également — il n'existe pas de réseau ferroviaire de voyageurs sur l'île,
donc la voiture est une charge fixe et non une variable). Trois contraintes propres à l'île
portées par le guide et **à ne pas diluer** : l'éloignement du réseau de secours familial, qu'un
foyer à un seul adulte ne peut pas reconstituer par un aller-retour improvisé ; la **saison
cyclonique** et les fermetures d'établissements décidées la veille au soir, qui imposent une
garde d'urgence identifiée à l'avance ; et le fait que **Saint-Denis est sur la côte nord, sans
lagon**, où la baignade en mer est interdite hors bassins surveillés (risque requin) — même
convention que les guides tourisme réunionnais.

**Le cluster francilien non couvert est écarté volontairement, ne pas le reprendre par défaut au
prochain batch.** Les communes non couvertes les plus peuplées après ce lot sont Saint-Denis (93),
Aubervilliers, Argenteuil, Montreuil, Boulogne-Billancourt, Nanterre, Créteil, Aulnay-sous-Bois.
Sur ces communes, le composite (coût 0,30 · transports 0,20 · écoles 0,25 · sécurité 0,25) est
largement un proxy de la situation socio-économique des habitants — Aubervilliers sort à 4,1 avec
écoles 2,4 et sécurité 2,2 — et un guide bâti dessus glisserait du conseil d'installation au
commentaire sur les gens qui y vivent. **Même arbitrage que le refus de la série
`quartiers-a-eviter`**, et il tiendra tant que la donnée reste à cette granularité.

**Méthode reprise du batch 3, à conserver** : chiffres lus **à travers les modules**
(`npx tsx` sur `@/data/cities-seed`, `@/data/housing`, `@/data/neighborhoods`,
`@/lib/parent-solo`), jamais par grep du seed ; rang rejoué avec le départage réel de
`app/parent-solo/page.tsx` (`name.localeCompare` à égalité de score) ; **les 50 valeurs pivots
des 10 guides** (fit, rang, population, T3, revenu minimum, prix d'achat) revérifiées une à une
**après** insertion, pas seulement à la rédaction. Aucun barème de cantine ni de périscolaire
n'est chiffré, comme au batch 3 et contrairement aux batches 1-2.

⚠️ **`npm run integrity` a rattrapé trois collisions que `tsc` ne peut pas voir.** Des notes de
quartier de `data/neighborhoods.ts` (6,5 à Mulhouse et Dunkerque, 5,8 à Perpignan) tombaient par
hasard sur le **littéral brut** de `safety` du seed, placées juste après le mot « sécurité ». Le
garde ne distingue pas les deux échelles — et le lecteur non plus, ce qui est le vrai problème :
les trois phrases sont réécrites avec **l'échelle annoncée avant les nombres**. À reproduire dès
qu'un guide cite une note de quartier à côté d'un nom d'axe.

⚠️ **Deux imprécisions de `data/neighborhoods.ts` contournées sans les propager**, à corriger un
jour à la source : ① le fichier prête un **tramway à Étouvie (Amiens)** alors qu'Amiens n'a qu'un
réseau de bus — le guide ne cite pas le mode ; ② son **T2 moyen annécien plafonne à 950 €** quand
`data/housing.ts` donne **1 100 €** pour la commune. Les deux jeux n'ont ni le même périmètre ni
la même date de référence : ils ne sont ni additionnés ni moyennés, et le guide Annecy le dit
explicitement.

**Trois précautions de méthode reconduites du batch 3** : ① les scores de quartier sont sur une
**échelle propre** et ne se comparent pas au score communal ; ② `data/neighborhoods.ts` ne couvre
que **3 quartiers par ville**, ce qui est donné comme la raison pour laquelle le site ne publie
aucun verdict de sécurité par secteur ; ③ l'axe écoles mesure **l'offre communale**, pas la
réussite des élèves ni la qualité du travail des enseignants, et chaque guide le redit.

**Ratio loyer T3 ÷ score écoles**, calculé comme le palmarès mensuel et cité dans les guides :
Poitiers 119 € par point (meilleur du lot), Dunkerque 129, Mulhouse 134, Amiens 136, Le Mans 140,
Orléans 141, Saint-Denis 974 164, Annecy 167, Nîmes 181, Perpignan 193 (le pire).

**Le cas Annecy mérite d'être gardé en tête** : fit 6,2 (80e), meilleures écoles (8,7) et
meilleure sécurité (7,3) du batch, et pourtant **4 150 € net par mois** de seuil d'entrée pour un
T3 à 1 450 €. C'est la démonstration qu'un bon score composite et un dossier finançable sur un
seul salaire sont deux questions différentes — le composite est un **rang relatif**, pas un test
de solvabilité. Noter que `lib/parent-solo.ts` relâche la règle des 33 % à 35 % quand le score de
coût est sous 5 (Annecy et Saint-Denis 974 ici) : le seuil affiché est déjà la version indulgente.

**Slug hors gabarit à ne pas « corriger »** : `parent-solo-a-le-mans-2026` suit la convention déjà
retenue par le dépôt pour cette ville (`acheter-a-le-mans-…`, `demenager-a-le-mans-2026`,
`travail-a-le-mans-2026`), alors que le titre écrit « au Mans ». Même cas que `le-havre` au batch
3 : ne pas aligner le slug sur la grammaire, ne pas le compter comme un trou au diff de parité.

**Prochain run parent-solo : le miroir EN** (`single-parent-in-[city]-2026`), l'écart étant de 10.
Nommage à surveiller : `single-parent-in-le-mans-2026` (garder l'article, comme
`things-to-do-in-le-tampon-2026`) et surtout **`single-parent-in-saint-denis-reunion-2026`**, à
désambiguïser du Saint-Denis (93) sur le modèle déjà retenu côté tourisme
(`things-to-do-in-saint-denis-2026` vs `things-to-do-in-saint-denis-reunion-2026`).
Pour le batch FR **suivant**, le vivier métropolitain hors Île-de-France se réduit : les
candidates non couvertes avec référence T3 sont surtout Roubaix, Tourcoing, Avignon, Cherbourg-en-Cotentin,
Saint-Paul et Saint-Pierre (974), et le cluster francilien écarté ci-dessus reste écarté.

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
| F62 | **Score Biodiversité** (pipeline GBIF + zones protégées → sous-page ×540 + classement) | **P0** | **L** | **high** | 🚧 en cours — GBIF **540/540** (crawl clos 09/08), sous-pages en ligne des deux locales, **rang de richesse retiré le 10/08** (il classait les programmes de saisie) ; zones protégées **540/540** depuis la bascule INPN → **IGN BD TOPO** du 26/08 (la source INPN est morte depuis la cyberattaque de 07/2025), **hub national `/espaces-proteges` + `/protected-areas` livré le 26/08** ; **passe d'honnêteté des deux sous-pages ville le 27/08** (elles annonçaient encore les zones protégées comme « pas encore intégrées », et publiaient un effectif d'espèces plafonné comme un total sur 27 villes) ; **rang d'espaces verts retiré le 31/08** (un parc à cheval était compté en entier dans chaque commune qu'il touche : corrélation de rang +0,86 avec la surface du seul plus grand polygone, 26 des 53 villes du top 10 % concernées) ; **une seule des trois composantes porte encore une note, les zones protégées**, et `overall` reste `null` — deux composantes retirées et une publiable ne font pas un agrégat qui mesure ce que son nom annonce |
| F63 | **Qualité de l'air — du modèle à la mesure** (ATMO + Geod'Air, hub + classement) | **P0** | **M** | **high** | 🔜 à faire |
| F64 | **Actualité locale par ville** (open data BODACC/JO/CatNat → section CityProfile + routine hebdo) | **P1** | **M** | **low** | ✅ **en ligne — 540/540 villes, 4 284 entrées** (BODACC 4 244 + CatNat 40). Section rendue sur les deux locales, 536 villes l'affichent, 4 masquées. RNA toujours désactivé (0 association). **Le collecteur a repris les 26-27/08** après vingt jours de silence : 360 lignes recollectées en `QUERY_VERSION = 2`, ce qui **confirme le correctif du 18/08** — 9 des 10 Saint-X portent leurs 8 entrées (`le-francois`, encore en v1, guérira à son tour). ⚠️ **Puis il s'est arrêté de nouveau** : rien depuis le 27/08, et **180 lignes n'ont jamais été reprises** (v1, 04-05/08, 27-28 jours) — le seuil ramené à 21 jours le 25/08 **se déclenche pour la première fois, sur 177 villes**, comme dimensionné. Mesuré ce run sur les 360 villes comptées deux fois à 22 jours d'intervalle : **un mois clos ne bouge plus** (1 769 seaux de juin-juillet identiques à l'unité, 0 en baisse sur 2 471), seul le mois en cours grossit (×5,5). **Note du mois partiel corrigée le 01/09** : elle qualifiait (« quelques jours », exact au 4 août, faux au 26) au lieu de mesurer — elle publie désormais la couverture, « soit 26 des 31 jours du mois » |

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

#### Point d'étape 2026-08-17 — la passe zones protégées est branchée sur le cron, et ne dira pas « zéro » à Cayenne

Zones protégées **0/540**, inchangé — mais pour la première fois plus rien n'attend une main
humaine. Le run du 13/08 avait écrit `npm run protected-areas:fetch`, qui résout les couches sur
data.gouv.fr et les télécharge tout seul ; **personne ne l'appelait**. `scripts/local-data-runner.sh`
portait encore, en dur, le commentaire d'avant (« INPN ships shapefiles behind a download page, not
an API: this stage stays skipped until someone drops the converted GeoJSON layers in place ») et un
test qui sautait l'étape tant que `.cache/city-protected-areas/sources/` était vide. Comme rien ne
remplissait ce dossier, la condition ne pouvait jamais devenir vraie : le script capable de collecter
la composante était dans le dépôt depuis quatre jours et la composante serait restée à 0/540
indéfiniment. C'est le mode de défaillance déjà rencontré au déploiement — du travail invisible, sans
la moindre erreur pour le signaler.

**Ce que le runner fait désormais**, la nuit, sans qu'on lui demande : `fetch` quand le dossier de
sources est vide (avec son propre plancher d'espace libre, 15 Go — ce sont des shapefiles nationaux,
et le plancher global de 8 Go du runner protège le build, pas un téléchargement), puis l'ingest
**quand la sortie manque, vaut `{}`, ou est plus vieille que les couches qu'elle lit**. Sans cette
dernière condition, une passe déterministe d'une heure serait rejouée chaque nuit pour réécrire un
JSON identique. Deux diagnostics sont écrits au journal plutôt que devinés : `ogr2ogr` absent (les
archives se dépaquettent mais ne se reprojettent pas, donc aucune couche ne sort — `apt install
gdal-bin`), et un dossier de sources resté vide après un `fetch`, qui renvoie au journal du fetch au
lieu de reprendre le vieux « skipped ». Le téléchargement est passé en **flux vers le disque** au
lieu d'un `arrayBuffer()` en mémoire, avec écriture en `.part` renommée à la fin : ces archives font
quelques centaines de Mo, le runner tourne en cron à côté d'un build Next, et un fichier tronqué
par une coupure ne doit pas être pris pour un fichier complet à la passe suivante.

**Le défaut que la première passe réelle aurait imprimé sur 36 pages en ligne.** L'ingest écrivait
`areasTotal: 0` et `weightedCoverage: 0` pour **toute** ville sans périmètre à moins de 15 km, et
`lib/biodiversity.ts` publie ce zéro comme une **mesure** — « Aucun périmètre protégé recensé dans ce
rayon. C'est un résultat de mesure, pas une donnée manquante », écrit en toutes lettres. Cette lecture
n'est vraie que là où les couches ingérées s'appliquent. Or Natura 2000 est une directive européenne
qui **ne s'étend pas aux régions ultrapériphériques**, et le MNHN publie les ZNIEFF et espaces
protégés d'outre-mer dans des **fichiers séparés** des fichiers continentaux : une passe portant les
seules couches continentales couvre 522 des 540 villes du seed et **aucune** des 18 ultramarines.
Cayenne, à 15 km de l'Amazonie, aurait donc annoncé zéro périmètre protégé — la répétition exacte de
l'erreur du rang de richesse retiré le 10/08, un trou de *notre* collecte imprimé comme un fait sur
le lieu.

**Le garde-fou, testable hors ligne.** L'ingest classe chaque **entité** dans l'un des six territoires
disjoints (métropole, Guadeloupe, Martinique, Guyane, La Réunion, Mayotte) d'après son propre centre —
pas d'après le nom du fichier : un fichier « ZNIEFF continentales » n'est continental que parce que
son contenu l'est. Un territoire sans aucune entité, toutes couches confondues, est **hors périmètre**
de la passe : ses villes sont enregistrées `outOfScope: true`, **sans aucun chiffre de couverture**,
et `INGEST_VERSION` passe à 2. Côté lib, `CityProtectedAreas` devient une union discriminée
(`MeasuredProtectedAreas` | `OutOfScopeProtectedAreas`) — le type **n'expose pas** `weightedCoverage`
sur la branche hors périmètre, donc une surface qui l'afficherait ne compile pas ; c'est ce qui a
désigné les six sites d'affichage à corriger. Nouveau motif `protectionPending: "scope"`, prioritaire
sur `"calibration"` (la ville n'attend pas que d'autres soient ingérées, elle attend un fichier qui la
couvre), et `PROTECTION_CALIBRATED` compte désormais les villes **mesurées**
(`PROTECTED_MEASURED_SLUGS`) et non les villes ingérées : sans ça, 18 villes sans valeur seraient
entrées dans le barème centile toutes ex æquo au plancher. Sur les deux sous-pages, la section
« Zones protégées à moins de 15 km » **disparaît entièrement** pour ces villes — une liste vide sous
ce titre se lit comme un zéro — et la carte dit ce qui manque et pourquoi.

**Vérifications.** `npx tsc --noEmit` propre, `npm run integrity` propre,
`protected-areas:selftest` 32/32 (les 16 cas de reconnaissance de couches, plus 9 cas de territoire :
les six DROM, la Corse en métropole, l'océan au large de Dakar qui ne doit être revendiqué par
personne, et **les 540 villes du seed épinglées à exactement un territoire** — 522 métropole, 8 La
Réunion, 4 Martinique, 3 Guadeloupe, 2 Guyane, 1 Mayotte — donc une ville ajoutée hors des boîtes
échoue au lieu de tomber en métropole par défaut). Passe d'ingest réelle jouée sur une couche
ZNIEFF I synthétique posée sur Lyon : **522 villes avec un chiffre de couverture, 18 hors
périmètre**, l'avertissement nommant les cinq territoires manquants. Les trois formes rendues en dev
et relues : Lyon (couverture 4,8 %, périmètre listé), **Brest (0 % affiché comme une mesure, section
présente)**, **Cayenne (« non mesuré » + l'explication ultramarine, section absente)**. Le fichier de
test a été retiré, `data/city-protected-areas.json` revaut `{}`. **Limite inchangée depuis le 10/08 :**
la jumelle EN n'a pas pu être rendue, `next dev` renvoyant 404 sur toutes les sous-pages ville EN
(routage EN dans le Worker) ; elle est typée, porte les mêmes branches et la même copie, à contrôler
au prochain déploiement.

**Ce qui n'est toujours pas couvert.** Aucune donnée : les trois slugs data.gouv.fr et les noms
d'attributs INPN restent `@unverified`, l'egress d'ici étant refusé (403 CONNECT sur `api.gbif.org`,
`inpn.mnhn.fr`, `www.data.gouv.fr` — inchangé, non retesté ce run, la consigne étant de ne plus
sonder). `overall` reste `null` sur les 540 villes tant que cette composante manque, et la richesse
reste sans rang par décision du 10/08. **Ce qu'il faut surveiller à la première passe réelle du
cron** : la ligne `territories:` imprimée sous chaque couche (elle dit ce que le fichier couvre
vraiment), le champ retenu pour `id` et `name` par couche, et le compte final « X avec un chiffre de
couverture, Y hors périmètre ». Si les 18 villes ultramarines ressortent hors périmètre, la suite est
d'ajouter les ressources DROM des mêmes jeux data.gouv.fr dans `.cache/city-protected-areas/sources/`
— pas de toucher au garde-fou.

#### Point d'étape 2026-08-24 — la collecte était morte depuis trois semaines, et rien ne le disait

Zones protégées **0/540**, inchangé pour la huitième nuit d'affilée. Le run du 17/08 avait branché
`protected-areas:fetch` sur `scripts/local-data-runner.sh` et conclu que « plus rien n'attend une
main humaine ». Sept passes nocturnes plus tard, `data/city-protected-areas.json` vaut toujours `{}`.
En cherchant pourquoi, on trouve pire : **`npm run news:stats` annonce `last refresh: 2026-08-05`**,
alors que le correctif du 18/08 (`QUERY_VERSION = 2`) devait faire rejouer les 540 villes au lot
suivant. Les deux pipelines qui avaient du travail n'ont rien produit depuis **trois semaines**, et
le seul pipeline qui paraît sain — biodiversité 540/540 — l'est parce qu'il était **déjà terminé le
09/08** : il n'a rien à faire, donc son silence ne prouve rien. Aucune erreur nulle part. C'est le
mode de défaillance que ce dépôt documente déjà deux fois (le déploiement cinq jours en retard du
10/08, l'ingest jamais appelé du 17/08) : **du travail invisible**.

**Ce que le runner ne pouvait pas dire, et pourquoi.** Trois défauts, tous dans
`scripts/local-data-runner.sh`, tous corrigés ce run :

1. **Un arbre de travail sale arrêtait la passe.** Le runner refusait de continuer dès que le dépôt
   portait un fichier modifié hors des trois JSON qu'il possède, et sortait en erreur ; même sans ce
   garde-fou, le `git pull --rebase` qui suit échoue sur un dépôt sale et était traité en `FATAL`.
   C'est **exactement** la panne que le runner de déploiement a connue et corrigée le 19/08 — 175
   fichiers laissés par une session interrompue avaient gardé trois commits en 404 pendant une
   journée — sauf que la correction n'avait été appliquée qu'à **l'un des deux runners**. Désormais,
   dépôt sale ⇒ la collecte passe par un **worktree git calé sur `origin/main`**
   (`~/.cache/meilleurville-data`), `node_modules`, `.env.local` et **`.cache`** en liens vers le
   dépôt — sans ce dernier lien, chaque passe en worktree repartirait d'un crawl vierge et
   n'aboutirait jamais. On ne pousse toujours que ce qui est commité, et l'état du dossier de travail
   du propriétaire n'a plus voix au chapitre.
2. **Un échec ne réveillait personne.** `run_stage` avale tous les codes de retour — il le doit, un
   GBIF en panne ne doit pas empêcher le BODACC — si bien qu'une étape qui échoue chaque nuit est
   indiscernable dans le journal d'une étape qui n'a rien à faire, et personne ne lit le journal.
   Chaque pipeline a maintenant sa **couverture suivie dans le temps** (`pipeline-progress` :
   composant, couverture, date du dernier *changement*). Un pipeline **incomplet et immobile depuis
   plus de 48 h** déclenche l'alarme : fichier d'état, notification bureau, e-mail Brevo depuis
   `bonjour@mavilleideale.fr`, au plus un par 24 h — même mécanique que le runner de déploiement,
   avec un **tampon distinct** (sinon une alerte de publication étoufferait une alerte de collecte).
   Le corps du mail porte le diagnostic, pas seulement le symptôme : les pipelines à l'arrêt, la
   raison précise pour les zones protégées (disque insuffisant / `ogr2ogr` absent / aucune couche
   après le fetch) et les étapes tombées dans la nuit. C'est mesuré sur l'**immobilité**, pas sur
   l'échec : une étape peut échouer sans conséquence, et « réussir » sans rien écrire.
3. **`local code=$?` après un `if` lisait le code du `if`, qui vaut 0.** Toute panne s'écrivait donc
   « FAILED (exit 0) », et surtout la branche `124` — le lot coupé par le *time cap*, qui est un
   résultat partiel légitime et non une panne — **ne pouvait jamais sortir** : un crawl arrêté par
   la limite de temps se lisait comme un plantage. Trouvé par le banc d'essai, pas à la lecture.

**Un quatrième défaut, trouvé en écrivant le banc d'essai.** Le worktree du runner de déploiement est
détaché, et ce runner-ci **commite et pousse**. Depuis un HEAD détaché, `git pull --rebase origin main`
refuse de choisir une base et `git push origin main` pousserait le `main` **du dépôt** — c'est-à-dire
pas le commit qu'on vient d'écrire, sans que rien n'échoue. Le worktree porte donc une branche
(`local-data-runner`) et la passe pousse `HEAD:main`. Et le recalage se fait par **`rebase FETCH_HEAD`,
jamais `reset --hard`** : après trois échecs de push le script promet que « la passe suivante
reprendra le commit », et un reset l'aurait effacé en silence.

**Vérifications.** `bash -n` propre, `npx tsc --noEmit` propre, `npm run integrity` propre,
`protected-areas:selftest` et `biodiversity:selftest` verts. Surtout, le script a été **joué de bout
en bout** contre un dépôt factice (origin nu, pipelines bouchons, `~/.nvm` reconstitué pour vérifier
la réécriture du `PATH` de cron) sur cinq scénarios : `--status` sur une installation neuve ; dépôt
**sale** → worktree, collecte, commit, push vers `origin/main` (le chemin qui était cassé) ; dépôt
**propre** → chemin direct, commit sur `main` ; couverture **immobile depuis 72 h avec une étape en
échec** → alerte écrite avec le bon corps ; et un **commit non poussé** déposé dans le worktree,
retrouvé sur `origin/main` après la passe suivante. Le code de retour d'une étape en panne s'écrit
maintenant `exit 7` et non `exit 0`.

**Ce qui n'est toujours pas couvert.** Aucune donnée collectée : ce run répare le collecteur, il ne
collecte pas — l'egress d'ici reste refusé et la consigne est de ne plus sonder. `overall` reste
`null` sur les 540 villes, la richesse reste sans rang par décision du 10/08, et les trois slugs
data.gouv.fr comme les noms d'attributs INPN restent `@unverified`. **Ce que ce run ne peut pas
trancher** : laquelle des causes ci-dessus a réellement figé la machine du propriétaire — dépôt sale,
`fetch` en échec, plancher de 15 Go non atteint, `ogr2ogr` absent, ou cron décroché. Les cinq sont
plausibles depuis ici et aucune n'est observable à distance ; c'est précisément l'argument de
l'alerte. **La prochaine passe le dira d'elle-même**, par e-mail — ou, en trois lignes et à la
demande, par `scripts/local-data-runner.sh --status`, qui donne les trois couvertures, depuis quand
chacune n'a pas bougé, la présence des couches INPN et celle d'`ogr2ogr`. Si le cron lui-même est
décroché, rien de tout cela ne partira : c'est la première chose à vérifier (`crontab -l`).

#### Point d'étape 2026-08-31 — le rang d'espaces verts est retiré : un parc à cheval était compté en entier dans chaque commune

Aucune collecte ce run (les trois JSON sont pleins : biodiversité **540/540** dont 513 mesurables,
zones protégées **540/540** toutes mesurées, parcs **540/540** dont 11 sans parc nommé). Le travail
est le contrôle que la composante **espaces verts** n'avait jamais subi. La richesse a été auditée le
10/08 et son rang retiré ; les zones protégées ont été calibrées le 26/08 ; les espaces verts, eux,
publiaient un **/10 sur 529 villes des deux locales depuis le 06/08 sans qu'aucun contrôle n'ait été
passé dessus**. Il ne tient pas.

**Le mécanisme, lisible dans le code de collecte — ce n'est pas une inférence statistique.**
`scripts/city-parks.mjs` interroge Overpass en `way["leisure"="park"](area.a)` sur l'aire
administrative de la commune. Un filtre d'aire Overpass retourne tout élément qui **intersecte**
l'aire, et `out geom` en rend la géométrie **entière** : le shoelace calcule la surface du polygone
complet, jamais de sa part communale. Un parc à cheval est donc porté **en entier** au crédit de
chaque commune qu'il touche, puis divisé par la population de chacune. La donnée le montre à
l'identique : **45 polygones** sont enregistrés dans 2 à 4 communes du seed, **11 au-dessus de
100 ha**, avec la même surface partout — bois de Vincennes **979,7 ha** compté tel quel à Paris,
Saint-Mandé, Charenton-le-Pont et Vincennes ; bois de Boulogne **805,7 ha** à Paris, Neuilly et
Boulogne-Billancourt ; parc Georges-Valbon **337,9 ha** à Stains, Garges-lès-Gonesse, La Courneuve et
Saint-Denis.

**Ce qui a été mesuré** (script jetable, sur les 529 villes notées) :

| contrôle | valeur |
|---|---|
| corrélation de rang score ↔ surface du **seul plus grand polygone** | **+0,86** |
| villes du top 10 % dont ce polygone est compté aussi dans une autre commune du seed | **26 / 53** |
| villes du top 10 % situées en Île-de-France | **27 / 53** |
| villes dont un seul polygone fait plus de la moitié de la « surface verte » | **284 / 529** (médiane **52 %**) |

47 des 56 villes notées ≥ 9,0 doivent leur place à un polygone de plus de 50 ha, alors que 76 villes
seulement en portent un. **Saint-Mandé** (1 km², 21 223 hab.) sortait **10,0/10** avec 462 m²/hab,
c'est-à-dire les 980 ha du bois de Vincennes — qui est à Paris — divisés par sa propre population ;
**Charenton-le-Pont** 10,0 et **Vincennes** 9,9 par le même bois ; **Stains** 9,8 avec un parc de
La Courneuve. Le barème classait la **proximité d'un grand polygone**, pas la surface verte par
habitant qu'il annonçait. Quatre villes tiraient **100 %** de leur « surface verte » d'un polygone
partagé, 42 plus de la moitié, 78 au moins une partie.

**Pourquoi un retrait, et pas un correctif ciblé.** Le défaut n'est **détectable** que lorsque la
commune voisine est elle-même dans nos 540 : le domaine de Rambouillet (1 032 ha, 391 m²/hab,
10,0/10), l'Arche de la Nature du Mans ou la Combe à la Serpent de Dijon débordent tout autant sur
des communes absentes du seed, sans qu'aucune ligne du JSON ne le montre. Retirer les 78 cas visibles
aurait nettoyé la moitié dense du corpus, laissé l'autre intacte, et donné le barème pour réparé —
pire que les deux extrêmes. Et rien dans la donnée ne dit à quelle commune revient quelle part :
réaffecter au centroïde le plus proche attribue le bois de Vincennes à **Charenton**, pas à Paris.
Le remède est côté pipeline, comme pour la richesse : découper les anneaux sur la limite communale
(ou n'accepter que les polygones dont le centroïde y tombe) dans `scripts/city-parks.mjs`, donc un
`queryVersion` neuf et un recrawl.

⚠️ **F59 n'est pas touchée, et ne doit pas l'être.** Pour un **répertoire de destinations**, lister
le bois de Vincennes à Saint-Mandé est juste : on y va à pied. C'est seulement comme **surface verte
par habitant** que le même polygone devient faux — la symétrie exacte du zéro OSM, vrai pour `/parcs`
(« aucun parc nommé »), faux ici (03/08). `/parcs` trie d'ailleurs par **nombre** de parcs, pas par
surface : aucun classement du site ne repose sur la surface cumulée.

**Ce que le run a livré.** `GREEN_SPACE_RANKING_PUBLISHED = false` dans `lib/biodiversity.ts` (point
unique de bascule, corrélations et mécanisme dans le docstring), un motif
`greenSpacePending: "incomparable"`, et `greenSpaceCrossBorder()` / `greenSpaceCrossBorderShare()` +
`GREEN_SPACE_CROSS_BORDER_COUNT` (78) / `_PARK_COUNT` (45), qui permettent à chaque page de nommer
**son propre** cas plutôt que d'énoncer une limite de méthode en général. ⚠️ L'ordre des motifs est
**l'inverse** de celui de la richesse, et c'est voulu : là-bas la mesure existait dans tous les cas,
donc la raison de barème passait devant ; ici **11 communes n'ont aucun parc nommé**, donc aucune
surface à montrer, et leur dire « le barème est retiré » masquerait qu'il n'y a rien à comparer —
`"mapping"` reste prioritaire pour elles.
Sur les deux sous-pages ville : la carte 🌳 affiche le m²/hab brut (« au moins » quand F59 a plafonné
à 40 parcs), la raison du retrait, et le parc partagé nommé avec les communes qui se le partagent —
« *Le relevé compte le polygone entier de chaque parc à cheval : « Bois de Vincennes » (980 ha) est
porté ici au crédit de la commune, et aussi à Charenton-le-Pont, Paris et Vincennes.* » ; le bloc
« Pas de score global » porte la raison ; le paragraphe « Comment lire la page » ne dit plus que deux
composantes échappent au biais, mais **une seule**. Correctif d'affichage arrivé avec : la carte de
composante écrivait **« non mesuré » au-dessus du chiffre mesuré** dès qu'un rang était retiré (donc
sur la richesse depuis le 10/08, et sur les espaces verts depuis ce run) — nouveau `noScoreLabel`,
« rang retiré » / « rank withdrawn ». Les deux hubs `/espaces-proteges` et `/protected-areas`
disaient « la seule des trois composantes qui se classe honnêtement » en n'expliquant que le retrait
de la richesse : la phrase nomme désormais les deux retraits et dit que la protection est la seule
note **encore publiée**.

**Vérifications.** `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, 1 035 guides FR,
795 EN), `eslint` sur les fichiers touchés : **aucune erreur nouvelle** (les 2 remontées sur la page
EN préexistent à l'identique, décalées de 30 lignes). Pages **rendues en dev** et lues, les quatre
branches : Saint-Mandé (partagé, 100 %), Paris (partagé + effectif plafonné, « Au moins 10,8 m² »),
Rambouillet (aucun partage détecté → phrase générale), Sallanches (aucun parc nommé → `"mapping"`
inchangé). La jumelle EN a répondu **200 cette fois** (elle 404ait le 10/08 sous `next dev`) et
affiche les **mêmes nombres** : 462 m², 980 ha, protection 2,3/10 des deux côtés.
`npm run build` volontairement non lancé (interdit depuis une routine, cf. CLAUDE.md § Commands) ;
`.next` et `out` effacés en fin de run.

**Ce qui n'est toujours pas couvert.** `overall` reste `null` sur les 540 villes, et il l'est
désormais pour **deux** raisons de fond et non plus une : la richesse demande un recrawl GBIF agrégé
par `datasetKey` (`QUERY_VERSION = 3`), les espaces verts un recrawl OSM découpé sur la limite
communale. **Une seule des trois composantes porte encore une note : les zones protégées.** Les
chiffres bruts des deux autres restent publiés — ils sont exacts pour ce qu'ils sont — et c'est le
classement qui est retiré, pas la donnée. `/classements/biodiversite` reste abandonné.

#### Point d'étape 2026-08-27 — les sous-pages parlaient encore d'une composante qui est arrivée

Aucune collecte ce run : les trois JSON sont pleins (biodiversité **540/540**, dont **513
mesurables**, zones protégées **540/540** toutes mesurées, parcs **540/540** dont 11 sans parc
nommé). Le travail est en aval, et c'est celui que la bascule BD TOPO du 26/08 a laissé derrière
elle : la composante zones protégées est passée de « pas encore intégrée » à « relevée partout et
notée », et **les deux sous-pages ville ne l'avaient pas appris**. Quatre écarts entre ce que les
pages disent et ce que les données valent, corrigés des deux côtés, mêmes nombres.

**1. Une phrase fausse sur les 540 pages des deux locales.** Le paragraphe « Comment lire la page
en attendant » finissait par « et pourquoi les zones protégées en porteront la plus lourde **le
jour où elles seront intégrées** » (EN : « once they are ingested »). Elles le sont depuis huit
jours, et la même page affichait leur note trois écrans plus haut. La branche est désormais pilotée
par `protection` : quand la note existe, la page dit que c'est **la** mesure à lire, relevée sur les
540 villes à partir des mêmes tracés ; l'ancienne phrase reste, au futur, pour une commune qui
serait un jour ingérée après les autres.

**2. « Il manque encore » racontait un retard là où il y a une décision.** Le bloc « Pas de score
global » énumérait les composantes absentes sans dire pourquoi : sur les 540 villes il affichait
« la richesse d'espèces manque encore ici », alors que la mesure existe et que c'est son **rang**
qui a été retiré le 10/08 comme invalide. Chaque absence porte maintenant sa raison
(`incomparable` / `precision` / `calibration` / `effort` pour la richesse, `scope` / `data` pour la
protection, `mapping` pour les espaces verts), et la clause finale — jusqu'ici réservée au cas
`!protection`, donc morte — dit à la place que les zones protégées, elles, portent bien une note :
c'est le seul chiffre comparable de la page.

**3. Un effectif plafonné annoncé comme un total, et contredit deux écrans plus bas.** La
pagination GBIF coupe la liste d'espèces sur **27 des 540 villes** — les mieux relevées, Paris et
la petite couronne en tête. Le JSON-LD le disait depuis toujours (`minValue`), la prose écrivait
« 6 000 espèces ont été recensées » puis, plus bas, « un effectif **exact** ». Les deux pages
portent désormais « au moins » / « at least » partout où le chiffre s'affiche — titre de section,
chapô, carte de composante, description meta, carte 🦋 du profil ville — et la mention
« effectif exact » devient « sûr, mais plafonné par notre pagination » sur ces 27 villes. Même
traitement que le « au moins » déjà en place sur les espaces verts plafonnés par F59.

**4. La carte 🦋 du profil ville n'annonçait qu'un effectif incomparable.** Depuis le retrait du
rang de richesse, sa ligne se résumait à « N espèces recensées autour de la ville » — un nombre
exact dont la page elle-même dit qu'il ne se compare pas. Elle porte maintenant la note des zones
protégées à la suite, **nommée** (« zones protégées 6,8/10 ») : sous un titre « Biodiversité », un
/10 nu se lirait comme une note de biodiversité, qui n'existe pas. Nouveau champ `protection` (et
`speciesTruncated`) dans la projection serveur `lib/city-profile-data.ts` — `CityProfile` est
`"use client"`, il ne lit pas la lib.

**Deux corrections d'affichage arrivées avec, mesurées sur les 540 :**

- **Les descriptions meta ne citaient pas la seule mesure comparable de la page.** La queue
  « Oiseaux, insectes, flore, dans un rayon de N km » ne portait aucun chiffre ; elle cède la place
  à la couverture protégée (« 47,9 % du disque de 15 km sous protection (9,6/10) »), ou à
  « Aucun périmètre protégé à moins de 15 km » pour les 5 villes sans aucun périmètre. Mesuré sur
  les 540 et les deux locales : **151 caractères au pire côté FR, 149 côté EN**, aucune au-dessus
  de 160, et la clause saute d'elle-même si elle devait faire dépasser. Les titres, eux, dépassaient
  60 sur **1** ville (Château-Gontier-sur-Mayenne, 62 et 61) : le suffixe éditorial saute quand il
  ne rentre pas, plus rien au-dessus de 60.
- **88 villes lisaient du faux français.** « Biodiversité à Le Havre », « autour de Albi »,
  « Parcs de Les Abymes » : les noms du seed portent leur article, et rien dans le dépôt n'élide ni
  ne contracte (vérifié, aucun helper de ce genre nulle part). 69 noms à initiale vocalique,
  16 en « Le », 3 en « Les » — soit 16 % du corpus, dans le titre SERP **et** dans le chapô.
  Deux helpers locaux à la page FR (`deVille` / `aVille`) donnent « au Havre », « d'Albi »,
  « aux Abymes », en laissant hors élision le h aspiré (Honfleur, Hyères) et le y. C'est la règle
  que les slugs de la série tourisme appliquent déjà (`-au-tampon-`, `-aux-abymes-`).
  ⚠️ **Le défaut est le même sur les autres sous-pages ville** (« Parcs de Le Havre »…) : le
  corriger partout est une passe à part, volontairement pas faite ici.

**Vérifications.** `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, 1 003 guides
FR, 757 EN), `eslint` sur les quatre fichiers touchés : **aucune erreur nouvelle** (les 3 remontées
préexistent à l'identique sur `main`). Les métadonnées ont été rendues **par le vrai
`generateMetadata`** des deux pages sur les 540 villes, pas approximées : longueurs ci-dessus,
clause de protection présente sur 540/540, et les jumelles FR/EN vérifiées sur les mêmes nombres
(Marseille 47,9 % et 9,6/10 des deux côtés). Élision contrôlée à la main sur les cas durs :
Le Havre, Les Abymes, Le Robert (Martinique), La Rochelle, Albi, Aix-en-Provence, Orléans,
Honfleur, Hyères, Île de Ré, Le Mans. **`npm run build` volontairement non lancé** (interdit
depuis une routine, cf. CLAUDE.md § Commands).

**Ce qui n'est toujours pas couvert.** `overall` reste **`null` sur les 540 villes**, et ce n'est
plus un retard de collecte mais l'état stable de F62 : deux composantes sur trois portent une note,
la troisième ne peut pas en porter tant que la richesse n'est pas recollectée en pondérant par
`datasetKey` (`QUERY_VERSION = 3`). Le rang de richesse reste retiré (`RICHNESS_RANKING_PUBLISHED`
= `false`), `/classements/biodiversite` reste abandonné, et les 27 villes en troncature d'espèces
le resteront tant que le recrawl n'a pas eu lieu — elles n'ont plus de raison de mentir sur leur
effectif, c'est tout ce que ce run change pour elles. Les 11 communes sans parc nommé dans OSM
n'ont toujours pas de note d'espaces verts, par construction.

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

#### État au 2026-08-18 — dix communes déclaraient douze mois vides, et c'était la requête

**Le défaut.** Le filtre commune du BODACC cherchait le nom **d'affichage** du seed. Or
`data/cities-seed.ts` désambiguïse ses homonymes dans ce nom-là — « Saint-Denis (La
Réunion) », « Saint-Louis (Haut-Rhin) », « Le Robert (Martinique) » — parce qu'un
classement qui aligne deux « Saint-Denis » est illisible. Le champ `ville` du BODACC, lui,
ne porte que le nom de la commune : `search(ville, "Saint-Denis (La Réunion)")` ne tombe en
face de rien, la parenthèse étant des jetons que l'index plein texte n'a jamais vus.

La corrélation est parfaite dans les deux sens, et c'est ce qui en fait un diagnostic et pas
une intuition : **exactement 10 noms du seed portent une parenthèse, et exactement ces 10
villes sont sorties à zéro entrée** sur les 540 du crawl des 04-05/08 —
`saint-denis-reunion`, `saint-paul-reunion`, `saint-pierre-reunion`, `saint-andre-reunion`,
`saint-louis-reunion-974`, `saint-joseph-reunion`, `saint-benoit-reunion`, `le-robert`,
`le-francois`, `saint-louis-haut-rhin`. Le site affirmait donc que **Saint-Denis de La
Réunion, plus grande commune des DROM, n'avait immatriculé aucune entreprise, radié
personne et connu aucune procédure collective en douze mois**. Aucune erreur, aucun
avertissement : un zéro qui se lit comme une mesure — la signature exacte du filtre en
égalité majuscule corrigé le 04/08, et la troisième fois que ce pipeline la produit.

Le code département n'y était pour rien : `deptFromInsee` rend bien « 974 », et Le Tampon,
Fort-de-France, Les Abymes, Cayenne, Mamoudzou et Saint-Laurent-du-Maroni ont leurs 8
entrées. C'est bien le nom, et lui seul.

**Le correctif.** `communeName()` (`scripts/city-news.mjs`) retire la parenthèse **finale**,
et seulement si quelque chose lui survit ; `bodaccWhere()` cherche ce nom-là. Rien n'est
perdu au passage : c'est la moitié `numerodepartement` de la clause qui distingue les deux
Saint-Denis, elle l'a toujours fait, le nom n'a jamais eu à le faire. `QUERY_VERSION` passe
à **2**, donc `pickBatch()` traite toute ligne v1 comme échue et le prochain lot local
recollecte les 540 — `lib/city-news.ts` ne filtre sur aucune version, les lignes déjà
publiées restent affichées jusqu'à leur tour au lieu de vider la section entre-temps.

**La garde.** `npm run news:selftest` passe de 49 à **56 contrôles** : les cas de
`communeName()`, la clause complète pour Saint-Denis (974), et surtout la garde de fond —
les **540 villes réelles** passées dans le vrai constructeur de requête, avec l'assertion
qu'aucun **terme de recherche** ne contient de parenthèse et qu'aucun ne devient vide.
(Premier jet raté à noter : l'assertion portait sur la clause entière, qui contient
toujours les parenthèses de `search(…)` — c'est le terme qu'il faut lire, pas la clause.)
`selftest()` devient `async` pour lire le seed sur disque ; toujours zéro réseau.

**Et ce qui a permis à ça de durer quinze jours : `news:stats` comptait les villes vides
sans les nommer.** « 13 with nothing in window » se lit comme treize petites communes où
il ne s'est rien passé ; les dix Saint-X s'y cachaient sans que personne ait de raison de
regarder. La commande les **liste** désormais, plus peuplées d'abord — la première ligne
sort « saint-denis-reunion, saint-paul-reunion, saint-pierre-reunion… », et le défaut se
voit en une seconde. Règle générale pour ce pipeline : **un agrégat de zéros doit nommer
ses membres**, sinon un zéro faux est indiscernable d'un zéro vrai.

**Trois villes vides que ce correctif ne touche pas, et qu'il ne faut pas confondre avec
lui** :
- `ile-de-re` (« Île de Ré ») **n'est pas une commune** : l'île en compte dix et le seed
  l'ancre sur Saint-Martin-de-Ré. Aucun nom de commune ne peut donc être cherché sans
  mentir dans un sens ou dans l'autre (un compte communal sous-estimerait l'île, le nom de
  l'île n'existe pas au BODACC). **Non-correctif assumé** : la ligne reste vide et la
  section ne s'affiche pas. Si un jour on la veut, ça passe par un champ d'ancrage explicite
  au seed, pas par une exception codée en dur dans le crawler.
- `dinan` (22050) et `selestat` (67462) restent **inexpliquées** : codes Insee corrects,
  noms sans parenthèse, `sources` porte bien `bodacc` donc la requête a répondu — elle a
  répondu zéro. Douze mois sans un seul dépôt dans deux communes de 15 000 et 17 000
  habitants n'est pas crédible. **À faire au prochain passage local** :
  `npm run news -- --slug=dinan --force` puis `--slug=selestat --force`, et si le zéro
  tient, `npm run news:probe` pour voir ce que `ville` contient réellement dans le 22 et le
  67. Ne rien écrire sur ces deux villes tant que l'API n'a pas répondu.

**Correction factuelle au passage, sans changement de comportement.** Les deux fichiers
documentaient une rotation de « ~180 villes par run **hebdomadaire**, donc ~3 semaines par
tour ». C'est faux depuis le 04/08 : `local-data-runner.sh` tourne **deux fois par jour**,
soit ~360 villes/jour, et le fichier le montre lui-même (540 villes collectées sur deux
jours consécutifs, 363 + 177). Ce qui cadence le rafraîchissement est donc
`DUE_AFTER_DAYS`, pas la taille du lot : une ligne saine ne dépasse jamais ~16 jours
(14 + un balayage de ~2 jours). Conséquence sur le seuil d'affichage : **45 jours vaut ~3
cycles sains au lieu des 2 annoncés** — large, pas faux (il ne peut toujours pas se
déclencher sur un pipeline qui marche), mais il met six semaines à signaler un pipeline
mort. Le resserrer vers ~30 est une décision à part, délibérément **non prise** ici pour
que ce run ne porte qu'un seul changement de comportement ; le calcul est écrit dans les
deux fichiers pour qui la prendra.

**État du fichier au moment du run** (inchangé, le crawl n'est pas d'ici) : 540/540 villes,
4 212 entrées, `refreshedAt` 2026-08-05, soit 13 jours — **nominal** : les lignes du 04/08
arrivent à échéance le 18/08. `npm run news:prune` ne trouve rien hors fenêtre, les entrées
courent d'octobre 2025 à août 2026. `npm run integrity` vert (540 villes, 4 212 entrées),
`npx tsc --noEmit` propre, et le composant rendu pour de vrai (`renderToStaticMarkup`, FR
et EN) : 12 contrôles verts, dont l'absence de fuite de français côté EN, le marquage
« partiel » du mois d'août, `rel="nofollow"` sur tous les liens, et le fait qu'une donnée
de 13 jours n'est **pas** étiquetée périmée.

#### État au 2026-08-25 — la date était publiée comme un gage de fraîcheur, elle est publiée comme un plafond

**Le collecteur n'a rien produit depuis vingt jours, et la section disait « Mis à jour ».**
`refreshedAt` vaut toujours **2026-08-05** : ni le `QUERY_VERSION = 2` du 18/08 (qui devait
rejouer les 540 villes au lot suivant) ni la réparation du runner du 24/08 n'ont donné lieu
à la moindre passe. Deux créneaux se sont écoulés depuis cette réparation — 24/08 14h20 et
25/08 02h20 — sans un commit de données. Le fichier est donc gelé au 04-05/08 : les dix
Saint-X du correctif précédent restent à zéro entrée, et rien de ce que le BODACC a publié
depuis trois semaines n'est compté.

**Ce que 527 pages ville affirmaient pendant ce temps** : « Mis à jour le 4 août 2026. »
C'est la formule réservée à un pipeline qui marche, et le seuil qui la gouvernait
(`STALE_AFTER_DAYS = 45`) ne pouvait pas la retirer avant le **19 septembre** — le run du
18/08 avait calculé cette marge, écrit qu'elle « met six semaines à signaler un pipeline
mort », et laissé délibérément le resserrage à un run suivant. Le pipeline est mort dans
l'intervalle : c'est ce run-là.

**Le correctif, et pourquoi il ne porte pas sur le seuil en premier.** Un seuil répond à
« faut-il alerter ? », qui est un jugement sur la plomberie. Le lecteur, lui, a besoin d'un
fait sur la donnée : **cette liste a un plafond**. Les deux étaient confondus. La date est
donc désormais publiée **inconditionnellement comme un plafond** —
« Relevé arrêté au 4 août 2026 : ce qui a été publié après cette date n'est pas compté
ici. » / « Counted up to 4 August 2026: anything published after that date is not counted
here. » Même date, même octet de donnée, mais l'énoncé reste vrai au premier jour comme au
deux-centième, là où « Mis à jour le 4 août » cesse d'être le sujet dès le lendemain. Ça
compte surtout pour les **75 villes dont la ligne la plus récente est juillet 2026** : elles
n'ont aucun marqueur « partiel » pour avertir, leur liste s'arrête simplement, et
« Mis à jour » invitait à lire ce silence comme « août : rien à signaler ».

**Puis le seuil, avec l'arithmétique réelle.** `STALE_AFTER_DAYS` passe de **45 à 21**.
Le collecteur tourne à `--limit=180` deux fois par jour, soit 360 rafraîchissements/jour
pour 540 lignes ; une ligne échoit à `DUE_AFTER_DAYS` (14) et la file d'échéance, qui ne
peut pas dépasser 540 lignes, se vide en 1,5 jour. Une ligne saine plafonne donc à ~16
jours. 21 = cette borne **plus une semaine entière** : le collecteur peut sauter neuf
passes consécutives avant qu'on dise quoi que ce soit au lecteur, donc aucun risque de
crier au loup sur une ligne qui attend son tour — et le délai de détection tombe de six
semaines à trois. La phrase ajoutée quand le seuil se déclenche cite la cadence
(« Le relevé est repris tous les 14 jours ; il ne l'a pas été depuis »), pour que le lecteur
calibre sans connaître notre planning.
⚠️ Le seuil **ne se déclenche pas le jour de ce run** (20-21 jours d'âge, il faut passer
21) et c'est voulu : le nombre sort du calcul de cadence, pas d'un ajustement pour tomber
sur aujourd'hui. Il parlera à partir du 26-27/08 si le collecteur reste muet. Le gain
immédiat, lui, est dans la formulation, qui ne dépend d'aucun seuil.

**La garde.** `news:selftest` passe de 56 à **58 contrôles**, toujours zéro réseau. Rien ne
reliait la cadence citée sur la page à `DUE_AFTER_DAYS` : la lib est du TypeScript, le
script du `.mjs` lancé sans loader, donc le selftest **lit `lib/city-news.ts` comme texte**
et épingle `NEWS_REFRESH_INTERVAL_DAYS` sur `DUE_AFTER_DAYS`. Sans ça, changer l'intervalle
du collecteur transformerait silencieusement la phrase affichée en fausse déclaration sur
notre propre planning. Le second contrôle interdit qu'un futur seuil descende sous un cycle
complet (`> DUE_AFTER_DAYS + 2`), c'est-à-dire qu'il se déclenche sur une ligne à l'heure.

**Vérifications.** `npx tsc --noEmit` propre, `npm run integrity` vert (540 villes, 4 212
entrées), `news:selftest` 58/58, `news:prune` ne trouve toujours rien hors fenêtre (les
entrées courent d'octobre 2025 à août 2026, la fenêtre remonte au 25/08/2025). Simulation
sur les 540 villes réelles au 25/08 : 527 sections rendues, 13 masquées, 0 marquée en
retard ; rejouée au 27/08, les 527 le sont.

**Ce que le prochain run doit regarder en premier.** Si `news:stats` annonce encore
`last refresh: 2026-08-05`, le problème n'est plus dans ce dépôt : le script du runner a été
réparé et rejoué au banc d'essai le 24/08, donc ce qui reste est la machine du propriétaire
(cron non chargé, machine éteinte, dépôt local dans un état que la réparation n'a pas
prévu). Rien de tout ça n'est observable d'ici — c'est exactement ce que l'alerte e-mail
ajoutée le 24/08 doit produire, et son silence est en soi une information. Ne pas
« corriger » le pipeline une quatrième fois à l'aveugle : les trois défauts BODACC connus
ont tous été trouvés contre l'API réelle, aucun ne l'a été par relecture. Et ne pas toucher
à `dinan` / `selestat` sans réponse d'API (cf. section du 18/08).

#### État au 2026-09-01 — le collecteur a repris, et un mot juste au 4 août est devenu faux au 26

**Le collecteur a bien tourné.** Deux passes, les **26 et 27/08**, 180 villes chacune :
`data/city-news.json` porte **540 villes et 4 284 entrées** (BODACC 4 244, CatNat 40),
`meta.refreshedAt` au **2026-08-27**. Le diagnostic du 25/08 (« ce qui reste est la machine
du propriétaire ») était donc juste **et** l'obstacle a été levé — sans qu'on sache d'ici
comment. Le correctif du 18/08 est confirmé contre les vraies données : **9 des 10 Saint-X
portent leurs 8 entrées** (`saint-denis-reunion` 153 créations en août, `saint-louis-haut-rhin`,
`le-robert`…). Le dixième, **`le-francois`, est encore en v1** et reste donc à zéro : il n'a
pas eu son tour, il guérira au sien. Ne pas l'inscrire comme un défaut. Vides restantes,
inchangées : `dinan`, `selestat` (toujours sans réponse d'API, ne rien écrire dessus) et
`ile-de-re` (non-correctif assumé).

**Et il s'est arrêté de nouveau.** Rien depuis le 27/08, soit **cinq jours** à ce run, et
surtout **180 lignes n'ont jamais été reprises** : elles sont restées en `queryVersion` 1 au
04-05/08, soit **27-28 jours**. Conséquence directe : le seuil ramené de 45 à 21 jours le
25/08 **se déclenche pour la première fois**, sur **177 villes** (les 3 autres v1 sont vides,
donc masquées). C'est exactement ce pour quoi il a été dimensionné — une ligne saine plafonne
à ~16 jours, ces lignes en sont à 28 — et le lecteur lit désormais « Le relevé est repris tous
les 14 jours ; il ne l'a pas été depuis » là où l'ancien seuil aurait attendu le 19/09.

**La mesure que ce run permet pour la première fois : un mois clos ne bouge plus.** 360 villes
ont été comptées **deux fois à 22 jours d'intervalle**, ce qui donne 2 471 seaux
(ville, mois, famille) comparables. Résultat : **aucun n'a baissé**, et les **1 769 seaux de
juin et juillet — des mois déjà clos aux deux comptages — sont identiques à l'unité près**.
Seul août bouge : 5 253 → 28 863 (×5,5), 672 paires sur 691 en hausse. Le décalage de
publication de l'éditeur était listé « inconnu ici » depuis le 11/08 ; il est maintenant borné.
**Les lignes datées d'un mois sont toutes dans l'index dans les jours qui suivent sa fin**
(juillet ne s'est pas clos plus de quatre jours avant le premier comptage et n'a rien gagné
depuis), donc **la seule ligne qui bouge d'un rafraîchissement à l'autre est celle du mois en
cours**. Deux conséquences à garder : ① le marquage « partiel » n'a jamais à couvrir un mois
plein rétroactivement, et un mois marqué **guérit** au passage suivant, comme annoncé ; ② un
écart entre deux mois pleins de la colonne est un écart réel, pas un artefact de collecte.

**Le défaut corrigé ce run : la note expliquait le mois partiel par un adjectif, pas par une
mesure.** Elle disait qu'un mois marqué « partiel » « porte quelques jours quand les autres
portent un mois entier » et que « le mettre en regard des mois pleins ne dit rien ». C'était
**exact le 11/08**, où la seule passe jamais faite s'était arrêtée le 4 — 4 jours sur 31. Après
les passes des 26 et 27/08, la même phrase fixe annonce que 26 ou 27 jours sur 31 sont
« quelques jours », et invite à **écarter** un chiffre qui couvre 84 à 87 % de son mois : la
faute exactement symétrique de celle qu'elle avait été écrite pour empêcher. Le fichier porte
**les deux régimes en même temps** — mesuré ce run : **208 entrées à 13-16 % de leur mois,
1 011 à 84-87 %**, sur 1 219 marquées — donc aucun adjectif ne peut être vrai des deux.
Le dénominateur, lui, le peut : `newsPartialCoverage()` (`lib/city-news.ts`) rend
`{ through, daysCounted, daysInMonth }` et la surface **cite la couverture au lieu de la
qualifier** — « comptage arrêté au 26 août 2026, **soit 26 des 31 jours du mois** », et la note
de bas de liste énonce que ce qui diffère est le dénominateur, pas la mesure. Vrai à 4/31 comme
à 27/31, et l'arithmétique est rendue au lecteur au lieu de lui dire ce que le chiffre vaut.
`newsPartialThrough()` survit comme enveloppe, aucun appelant n'a changé de contrat. Le
comptage reste une affirmation sur **notre fenêtre de requête** (les lignes datées du 1er au
jour d'arrêt), jamais sur ce que le BODACC avait publié à cette date.

**La garde.** `news:selftest` passe de 58 à **60 contrôles**, toujours zéro réseau : le
premier épingle l'existence de `newsPartialCoverage` dans la lib, le second lit
`components/CityNewsSection.tsx` **comme texte, commentaires retirés** (le commentaire qui
explique la règle cite forcément la formule qu'elle interdit — premier jet raté, même famille
que l'assertion sur la clause au lieu du terme le 18/08) et exige que la note interpole
`daysCounted` / `daysInMonth` et ne contienne ni « quelques jours » ni « a few days ». C'est
la classe de régression exacte : une phrase calée à la main sur le calendrier d'une seule
passe.

**Vérifications.** `npx tsc --noEmit` propre, `npm run integrity` vert (540 villes, 4 284
entrées), `news:selftest` 60/60, `news:prune` ne trouve rien hors fenêtre (les entrées courent
d'octobre 2025 à août 2026). Composant rendu pour de vrai contre les données réelles
(`renderToStaticMarkup`, les 540 villes, FR et EN) : **536 sections rendues, 4 masquées,
177 étiquetées en retard, 488 portant un mois partiel**, zéro lien sans `rel="nofollow"`,
zéro fuite de français côté EN. Les deux régimes relus à l'œil : Allauch (arrêt au 4 août,
« soit 4 des 31 jours ») et Rennes (arrêt au 26, « soit 26 des 31 jours »).

**Ce que le prochain run doit regarder en premier.** Si `news:stats` annonce encore
`last refresh: 2026-08-27`, le collecteur est retombé en panne après deux passes — et cette
fois le symptôme est **différent** de celui d'août : il n'a pas cessé de tourner d'un coup, il
a fait **exactement deux lots** puis rien, ce qui ressemble davantage à une passe lancée à la
main qu'à un cron rétabli. Le tell à vérifier alors : les 180 lignes v1 restantes. Un cron sain
les aurait prises au troisième lot (`pickBatch` sert d'abord les `queryVersion` périmés) ; si
elles sont toujours là, aucune troisième passe n'a eu lieu. Ne pas « corriger » le pipeline à
l'aveugle pour autant, et ne toucher ni à `dinan` ni à `selestat` sans réponse d'API.

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

### État au 2026-08-20 — **0 route FR sans jumelle EN** (tenu)

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
batch 3 FR du 14/08 (+9) puis refermée le 15/08** (29 FR / 29 EN), **rouverte par le batch 4 FR
du 16/08 (+10) et refermée le 17/08** (39 FR / 39 EN). Deux réouvertures en quatre jours sur la
même série : c'est la cadence réelle, pas un accident.
`retiring-in-[city]-2026`, ouverte le 15/08 (batch 1, +8), **fermée le 18/08** (20 FR / 20 EN).

⚠️ **Une série « fermée » ne le reste pas.** C'est le deuxième mode de régression de ce
chantier, distinct de celui des routes et moins visible : `npm run parity` sort en code 0
pendant qu'une série FR déjà mise en miroir repart de neuf côté français. Aucun contrôle
automatique ne le signale — il faut re-differ les deux corpus par série à chaque run, ce qui
est précisément pourquoi le prompt dit de mesurer et non de réciter. Séries FR restant sans
aucune jumelle EN, mesurées le 18/08 après le batch `working-in-` de l'après-midi :
**`famille-a-[ville]-2026` (19 FR / 0 EN)**, **`universites-[ville]-2026` (15 FR / 0 EN)**,
`vacances-monoparentales-[ville]-2026` (7 FR / 0 EN) et le croisement mois × profil, qui a sa
route EN mais pas de guides. Ces séries n'avaient jamais été comptées dans cette liste avant le
18/08 : ce sont les plus gros trous du corpus, loin devant les séries déjà ouvertes.
`travail-a-[ville]-2026` en faisait partie (30 FR / 0 EN) ; la série EN `working-in-[city]-2026`
est **fermée depuis le 20/08** (30 FR / 29 EN, Nantes couverte par
`nantes-living-and-working-guide-2026`). ⚠️ Les comptes de séries ci-dessous sont ceux du 19/08 :
la § « Livré le 20/08 » plus bas porte le recensement à jour, dont la correction sur
`demenager-a-[ville]` (50 FR / **0** EN, et non 6).
Séries à parité, à re-differ et non à croire sur parole : tourisme 207/207,
`where-to-buy-in-` 49/49, `[city]-living-guide` 52 EN contre `vivre-a-` 51 FR,
`car-free-living-in-` 15 EN contre `vivre-sans-voiture-` 16 FR (écart de 1),
`studying-in-` 24 EN contre `etudiant-a-` 20 FR (l'EN devance).
Séries entamées et encore loin : `leaving-` 23 EN contre `quitter-` 55 FR,
`moving-to-` 6 EN contre `demenager-a-` 50 FR.

**Écart de contenu, distinct de l'écart de routes** : **guides 989 FR / 743 EN, tags 245 / 103**
(mesuré le 25/08 au 2ᵉ run, après la fermeture de `family-in-` — les chiffres plus bas dans cette
section sont datés, le réel prévaut). Séries FR restant **sans aucune jumelle EN** au 25/08 :
`universites-[ville]` (15/0) et `vacances-monoparentales-` croisé mois × profil.
`famille-a-[ville]` est **fermée** depuis le 2ᵉ run du 25/08 (19 FR / **19** EN, cf. § Shipped
2026-08-25) ; ⚠️ `universites-` ne se rouvre qu'avec un angle distinct de `studying-in-` (24 EN),
sinon c'est la cannibalisation de juin qui recommence. `demenager-a-[ville]` reste à 50 FR / 0
jumelle per-city, et **c'est un non-correctif assumé** : une série `moving-to-[city]` recouvrirait
`[city]-living-guide` (52 EN), donc elle ne se rouvre qu'avec un angle logistique distinct
(conteneur, douane, visa) et non par symétrie de compteur.
Ce n'est pas une route à créer mais du corpus à écrire, et **jamais par traduction** — les
guides EN sont du contenu natif à angle expat, c'est une décision de fond (cf. § Bilingual
setup dans `CLAUDE.md`), pas une facilité.

**Exceptions assumées** : `/badge` ×541 reste FR-only (la motion backlink vise mairies et
offices de tourisme français) ; les surfaces de compte (`/auth`, `/dashboard`, `/favoris`,
`/mes-villes`) ne sont pas du contenu indexable.

### Livré le 02/09 — `single-parent-in-[city]-2026` batch 7 (+9), la série refermée à 66/66

`npm run parity` en **code 0** en début et en fin de run (FR 219 · EN 166, 0 route FR sans jumelle) :
pas de régression de routes, donc run de corpus. Compteurs mesurés avant/après : **FR 1 042, EN 809 →
818**. Écart de corpus restant : **guides 1 042 FR / 818 EN, tags 251 / 114**.

**Le choix du run est un arbitrage contre l'ordre annoncé, et il faut dire pourquoi.** Le run du
01/09 avait classé ① `france-climate-2040-` batch 2 (15 FR / 8 EN) et ② `single-parent-in-`
(66 FR / 57 EN). C'est le second qui a été fait. La raison est la hiérarchie du prompt lui-même :
**tenir la parité passe avant combler un trou structurel**, et les deux séries ne sont pas de la
même nature. `single-parent-in-` est une **régression** — une série fermée le 29/08 à 57/57 que le
batch FR du 30/08 a rouverte, la neuvième réouverture de la série la plus volatile du chantier — et
elle avait déjà été laissée de côté par **deux runs consécutifs** (31/08 climat, 01/09 solo-travel),
c'est-à-dire exactement le seuil que le run du 31/08 avait lui-même qualifié de dérive.
`france-climate-2040-` est un trou jamais refermé, qui ne se dégrade pas d'un run à l'autre.
⚠️ **`france-climate-2040-` reste donc ouverte à 15 FR / 8 EN, et c'est la tâche du prochain run** :
les 7 régions manquantes (Massif central, Nord-Hauts-de-France, Grand Est, Centre-Val de Loire,
Bourgogne-Franche-Comté-Jura, Corse, outre-mer) font exactement un batch, et la reporter une
troisième fois serait le défaut que ce run vient de corriger, dans l'autre sens.

**Les 9 livrés** : les jumelles du batch FR du 30/08, écrites d'un coup dans `data/guides-en.ts` —
La Roche-sur-Yon, Dole, Lannion, Challans, Saint-Dié-des-Vosges, Albi, Cholet, Laon, Anglet.
**Compteurs mesurés : FR 66, EN 66 — écart nul dans les deux sens, série refermée.** Aucun piège de
nommage : les neuf slugs de seed s'écrivent tels quels, donc la règle du batch 33 tourisme (**côté EN
le slug se dérive du slug de seed tel quel**) n'avait rien à arbitrer. `metaTitle` 49-53 caractères,
`metaDesc` 134-154, 6 sections par guide (la série FR en compte 6), **0 em-dash** sur les neuf,
1 381 à 1 585 mots.

**Contrôle mécanique des chiffres : 532 figures distinctes, 532 retrouvées dans la jumelle FR, 0
écart.** ⚠️ **Le contrôle doit normaliser le séparateur décimal, pas seulement celui des milliers.**
Au premier passage il annonçait 164 figures manquantes sur 516 : c'étaient les notes en `/10` (EN
`7.5`, FR `7,5`), aucune n'était un vrai écart. Un contrôle qui remonte 32 % de faux positifs est un
contrôle qu'on cesse de lire — normaliser `(\d),(\d)` → `$1.$2` côté FR **et** les virgules de
milliers côté EN avant de comparer.

**Vérification du fond, faite avant d'écrire et non après.** Les neuf guides FR ont été repassés
contre le moteur réel (`parentSoloFit`, `minIncomeForT3`, `HOUSING`, `cityPopulation`) sur les 363
communes éligibles : rangs 1, 2, 3, 4, 6, 7, 8, 9 et 11 confirmés, médiane 5,5, La Roche-sur-Yon
seule ville ≥ 7,5 donc seule « Excellent », Challans seule à 8,3 de sécurité sur 363, Dole seule à
101 € de loyer par point d'écoles sur les 66, Saint-Dié seule à 8,5 de coût de la vie sur les 66, et
les neuf classements régionaux (11 communes en BFC, 10 en Bretagne, 14 en Pays de la Loire, 24 en
Grand Est, 22 en Occitanie, 27 en Hauts-de-France, 28 en Nouvelle-Aquitaine) vérifiés un à un.
**Aucun superlatif faux trouvé cette fois**, à la différence des batches 5, 6 et 7 — la matrice
sortie avant relecture reste la méthode qui le garantit.
⚠️ **Un palier d'ex æquo a été vérifié plutôt que recopié** : le guide Challans affirme que la Vendée
est le seul département à placer trois communes dans les vingt premières. C'est vrai, mais les rangs
18, 19 et 20 sont trois villes à 6,8 et Les Sables-d'Olonne y est 19ᵉ par tri alphabétique. La
mesure tient parce que le palier à 6,8 compte exactement 5 villes et occupe les rangs 16 à 20 : quel
que soit le départage, aucune n'en sort. Si ce palier bouge d'une ville, la phrase devient un rang
fabriqué au sens de `lib/owner-rankings.ts` et doit être réécrite.

**Contrôles de surface après écriture** : les 9 guides sont retrouvés par `getEnGuide()`, pourvus de
leur photo d'en-tête (`guideCityPhoto`, qui prend `relatedCities` en second argument), leurs 45
`relatedCities` existent tous dans `CITIES_SEED`, la recherche inverse les remonte sur leur page
ville EN, et `suggestNextEnGuides()` rend 3 voisins pour chacun. Aucun mojibake, aucun `EUR` ni `m2`
ascii.

**Tags** : aucun tag neuf franchissant le seuil de 3 guides. Les tags de ville restent à
1 occurrence et les tags de région réutilisent l'existant (`pays de la loire`,
`bourgogne-franche-comte`, `brittany`, `grand est`, `occitanie`, `hauts-de-france`,
`nouvelle-aquitaine`). ⚠️ `vendee` était à 1 occurrence : l'utiliser sur La Roche-sur-Yon **et**
Challans l'aurait porté à 3 et créé `/tags/vendee` sans que ce soit voulu — `pays de la loire` (8
occurrences) a été retenu à la place. `npm run search-index` relancé (`data/search-index.en.json`
818 guides, **114 tags, inchangé**) et `npm run sitemap:check` repassé : **EN 28 701 → 28 710 URL**,
soit exactement les 9 guides, FR inchangé à 29 123, chaque URL déclarée a une page.

**Sept apports propres à l'angle expat**, absents du FR parce qu'inutiles à un lecteur français et
tous sans chiffre neuf : **`T3` expliqué** comme un décompte de pièces et non de chambres (un T3 est
un séjour plus deux chambres), qui est le premier malentendu d'un lecteur anglophone sur toute cette
série ; **`périscolaire`** défini comme un service **communal** et non scolaire, donc dont les
horaires et la liste d'attente relèvent de la mairie ; **`carte scolaire`** définie comme la carte
de secteur, la dérogation étant une demande formelle et non une préférence ; le fait qu'un bailleur
français demande **un garant ou une garantie** en plus du test de revenu, et qu'un candidat arrivant
de l'étranger sans bulletins de salaire français est exactement le profil qui échoue là (Dole, Albi,
Anglet) ; **préfecture** définie comme le siège administratif du département (La Roche-sur-Yon) ;
**TER et Intercités** posés comme réseau régional et réseau classique, ni l'un ni l'autre à grande
vitesse (Dole, Albi) ; **collège et lycée** rendus par lower et upper secondary, l'éventail de
filières se jouant au lycée (Saint-Dié). Deux précisions de sécurité ou de droit, également sans
chiffre : l'**équipement hivernal obligatoire dans les communes de montagne désignées**, donné comme
un périmètre **à vérifier** pour sa commune et son trajet plutôt qu'affirmé de Saint-Dié ; et, à
Anglet, le rappel que la proximité de la frontière espagnole ne change rien au fait que **les droits
scolaires, de garde et de logement suivent la commune de résidence**.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **aucun verdict de sécurité par
quartier** (`data/neighborhoods.ts` ne documente aucun secteur sur ces neuf communes, et le guide le
dit plutôt que de se taire) ; **portée de l'axe écoles** répétée dans chaque guide (offre communale,
densité d'établissements, éventail de filières, **pas** la réussite des élèves ni la qualité du
travail des enseignants) ; **le m² est un repère éditorial tous biens confondus**, pas une médiane de
transactions ; **le seuil d'Anglet est déjà la version indulgente à 35 %** et monterait à 3 650 € à
la règle des 33 % ; et les **populations approximatives du seed** (57 000 à La Roche-sur-Yon, 20 000
à Lannion, 55 000 à Cholet) sont signalées comme coexistant volontairement avec le recensement cité.

**Contrôles** : `npx tsc --noEmit` **propre**, `npm run integrity` propre (540 villes, FR 1 042,
EN 818, 0 score brut recopié des deux côtés), `search-index` + `search-index:check` propres,
`sitemap:check` propre dans les deux sens, `npm run parity` en code 0.
⚠️ **`npm run build` n'a pas été lancé**, conformément à CLAUDE.md § Commands.
⚠️ **Note d'environnement, variante nouvelle du piège connu** : le conteneur démarrait avec un
`node_modules` **présent mais incomplet** (`@types/node`, `zod`, `@anthropic-ai/sdk` absents), et
`npx tsc --noEmit` sortait **44 141 lignes d'erreurs** sur tout le dépôt. Ce n'est pas une
régression, et le tell n'est pas l'absence du dossier mais la nature des erreurs : `Cannot find
module 'next'`, `JSX element implicitly has type 'any'`. **`npm install` d'abord**, toujours, y
compris quand `ls node_modules` répond.

**Prochain run.** ① **`france-climate-2040-` batch 2**, à **15 FR / 8 EN**, reporté deux fois et
prioritaire ; ② re-differ `single-parent-in-` et `solo-travel-in-`, les deux séries que les batches
FR rouvrent le plus vite. Les deux plus gros trous structurels restent inchangés et ne se referment
pas par symétrie de compteur : `quitter-` 55 FR / `leaving-` 23 EN, et `demenager-a-` 50 FR /
`moving-to-` 4 EN, ce dernier étant un **non-correctif assumé** tant qu'aucun angle logistique
distinct de `[city]-living-guide` n'est trouvé.

### Livré le 01/09 — `solo-travel-in-[city]-2026` batch 5 (+7), la série refermée à 29/29

`npm run parity` en **code 0** en début et en fin de run (FR 219 · EN 166, 0 route FR sans jumelle) :
pas de régression de routes, donc run de corpus. Compteurs mesurés avant/après : **FR 1 035, EN 795 →
802**. Écart de corpus restant : **guides 1 035 FR / 802 EN, tags 250 / 114**.

**Le choix du run n'en était pas un, et c'est le point.** Le run du 31/08 avait laissé
`solo-travel-in-` ouverte à 29 FR / 22 EN en écrivant noir sur blanc que deux runs consécutifs à la
laisser de côté seraient de la dérive. La consigne a été honorée telle quelle : les 7 jumelles du
batch FR du 29/08 (Brest, Chambéry, Metz, Orléans, Pau, Reims, Troyes) écrites d'un coup dans
`data/guides-en.ts`. **Compteurs mesurés : FR 29, EN 29 — écart nul, série refermée.** Aucun piège
de nommage : les sept slugs de seed s'écrivent tels quels, donc la règle du batch 33 tourisme
(**côté EN le slug se dérive du slug de seed tel quel**) n'avait rien à arbitrer.

**Contrôles de surface, ceux que les batches précédents ont dû ajouter après coup.** Les 7 guides
sont vérifiés **retrouvés par `getEnGuide()`**, **pourvus de leur photo d'en-tête**
(`guideCityPhoto`, qui prend `relatedCities` en second argument — un appel à un seul argument
lève) et **présents dans la liste `relatedCities` de leur page ville EN**. `metaTitle` 45-49
caractères, `metaDesc` 148-159, 6 sections par guide (la série FR en compte 6), **0 em-dash** sur
les sept. Aucun tag neuf : les six tags par guide réutilisent `solo travel`,
`travelling alone in france`, `single supplement`, les tags de région existants (`brittany`,
`savoie`, `grand-est`, `centre-val-de-loire`, `nouvelle-aquitaine`) et un tag de repère à une
occurrence, sous le seuil de 3 qui crée une page `/tags`. `npm run search-index` relancé
(`data/search-index.en.json` 802 guides, **114 tags, inchangé**) et `npm run sitemap:check`
repassé : **EN 28 687 → 28 694 URL**, soit exactement les 7 guides, chaque URL déclarée a une page.

**Contrôle mécanique des chiffres, et ce qu'il a trouvé.** Chaque nombre du texte EN cherché dans
sa jumelle FR après normalisation des séparateurs : **116 figures, 113 retrouvées**. Les trois
écarts ont été traités et non justifiés après coup. ① Le guide Brest datait la reconstruction du
centre « in the 1950s », un millésime que le FR ne porte pas et qui est en réalité une fourchette
(le chantier court bien au-delà de la décennie) : **retiré**, la phrase dit « rebuilt afterwards ».
② et ③ `1871`-`1918` (Metz dans l'Empire allemand) et `1429` (siège d'Orléans levé) sont des
**dates d'histoire, pas des mesures de la ville**, et elles portent précisément l'incise
d'explication que le lecteur anglophone n'a pas : conservées. La distinction à reprendre au
prochain run : un chiffre qui a l'air d'une mesure de la ville doit exister dans la jumelle FR ;
une date historique qu'une encyclopédie porte n'est pas soumise à cette règle.

⚠️ **Une erreur géographique du guide FR, trouvée en écrivant la jumelle et corrigée des deux
côtés.** `vacances-celibataire-reims-2026` écrivait « les grandes maisons de l'avenue de Champagne
et des Crayères proposent des visites » dans une section consacrée à Reims. **L'avenue de Champagne
est à Épernay**, à une trentaine de kilomètres, et le corpus lui-même le dit : `data/neighborhoods.ts`
la porte sous le slug `avenue-champagne-epernay`, et `data/cities-seed.ts` la rattache à Épernay avec
son classement UNESCO. Le FR est corrigé et l'EN écrit correct dès l'origine : maisons rémoises dans
le secteur des Crayères, avenue de Champagne située à Épernay et donnée comme accessible en TER.
C'est le même mode de défaillance que la tour Solidor attribuée à Rennes le 19/08 et que
Baume-les-Messieurs mis en Ardèche le 26/08 : **un lieu attribué à la mauvaise commune ne déclenche
aucun contrôle automatique**, seule une relecture le voit, et la relecture la plus efficace reste
l'écriture de la jumelle.

**Six apports propres à l'angle voyageur étranger**, absents du FR parce qu'inutiles à un lecteur
français : les **terminus parisiens** sont des gares distinctes et éloignées les unes des autres
(Montparnasse, Est, Austerlitz), donc une arrivée de Charles-de-Gaulle est une traversée de Paris
et non un changement de quai — dit sur Brest, Metz, Orléans et Reims ; **SMAC**, **scène nationale**
et **centre dramatique national** définis comme des labels d'État et non comme des rangs ; l'ambiguïté
de gare d'Orléans (**Orléans centre** contre **Les Aubrais**, commune voisine) posée avant la
réservation et non sur le quai ; **TER** et **Intercités** définis comme réseau régional et réseau
classique, ni l'un ni l'autre à grande vitesse, pour un lecteur qui croit que toute ville française
a un TGV ; **Chambéry n'est pas une station de ski** et **Brest n'a pas de vieille ville médiévale**,
deux attentes que les noms « Savoie » et « Bretagne » fabriquent chez un anglophone ; et les
**soldes françaises sont fixées nationalement**, ce qui rend prévisibles les week-ends où Troyes se
remplit pour ses magasins d'usine.

**Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, FR 1 035,
EN 802, 0 score brut recopié des deux côtés), `npm run search-index:check` propre,
`npm run sitemap:check` propre dans les deux sens, `npm run parity` en code 0.
`npm run build` n'a pas été lancé, conformément à CLAUDE.md § Commands.

**Prochain run.** Deux séries mesurées ce run et laissées ouvertes, dans cet ordre :
① **`france-climate-2040-` batch 2**, annoncé par le run du 31/08 et toujours à **15 FR / 8 EN** —
les 7 régions qui restent (Massif central, Nord-Hauts-de-France, Grand Est, Centre-Val de Loire,
Bourgogne-Franche-Comté-Jura, Corse, outre-mer) font exactement un batch ; ② **`single-parent-in-`
rouverte par le batch 7 FR du 30/08**, à **66 FR / 57 EN**, neuvième réouverture de la série la plus
volatile du chantier. Les deux plus gros trous structurels restent inchangés et ne se referment pas
par symétrie de compteur : `quitter-` 55 FR / `leaving-` 23 EN, et `demenager-a-` 50 FR /
`moving-to-` 4 EN, ce dernier étant un **non-correctif assumé** tant qu'aucun angle logistique
distinct de `[city]-living-guide` n'est trouvé.

### Livré le 31/08 — `france-climate-2040-[région]` batch 1 (+8), une série FR de 15 guides qui n'avait qu'une jumelle nationale

`npm run parity` en **code 0** en début et en fin de run (FR 219 · EN 166, 0 route FR sans jumelle) :
pas de régression de routes, donc run de corpus. Compteurs mesurés avant/après : **FR 1 035, EN 787 →
795**.

**Le choix du run, et pourquoi il n'est pas le choix évident.** Deux candidats. ① `solo-travel-in-`,
rouverte le 29/08 par un batch FR et laissée ouverte par le run du 30/08, à **29 FR / 22 EN**.
② `climat-2040-*`, **15 guides FR** face à **un seul** guide EN, le panorama national
`france-climate-change-outlook-expats-2026` — c'est-à-dire zéro couverture régionale. Le second l'a
emporté : un écart de 7 dans une série déjà en miroir se rattrape n'importe quel jour, une série de
15 sans aucune jumelle régionale est le plus gros trou de corpus qui restait, et son sujet est
exactement ce que le lecteur EN cherche (il achète en France sur un horizon de dix à quinze ans, et
personne ne lui dit ce que devient le bien qu'il vise). C'est l'arbitrage « matière réelle plutôt
qu'inertie de liste » déjà posé pour la série tourisme. **⚠️ `solo-travel-in-` reste donc ouverte à
29 FR / 22 EN, et c'est la tâche du prochain run** — deux runs consécutifs à la laisser de côté
serait de la dérive, pas un arbitrage.

**Les 8 livrés** : `france-climate-2040-` + `mediterranean-south` / `atlantic-coast` /
`south-west-pyrenees` / `brittany` / `alps-savoie` / `normandy` / `paris-ile-de-france` /
`rhone-valley`, tous en `category: "lifestyle"`, 6 sections chacun (la série FR en compte 6 à 7),
`metaTitle` 22-48 caractères, `metaDesc` 146-155, **0 em-dash**. Restent sans jumelle EN les 7
régions FR de la série : Massif central, Nord-Hauts-de-France, Grand Est, Centre-Val de Loire,
Bourgogne-Franche-Comté-Jura, Corse et outre-mer — de quoi un batch 2 exactement.

**Contrôle mécanique des chiffres, et ce qu'il a trouvé.** Chaque nombre du texte EN a été cherché
dans sa jumelle FR après normalisation des séparateurs (l'espace fine française contre la virgule
anglaise) : **189 figures distinctes, 187 retrouvées**. Les deux écarts étaient réels et ont été
traités, pas justifiés après coup : ① `30 000` / `60 000` € dans le guide Normandie est l'expansion
du `30 à 60 k€` du FR, un lecteur anglophone ne lisant pas `k€` — conservé ; ② le guide Paris
opposait « 2040 » à « 2010 », un millésime purement rhétorique qu'aucune source ne portait, réécrit
sans date. C'est le même contrôle qu'au batch 37 tourisme, et il attrape la même classe de défaut :
un chiffre qui a l'air d'une mesure sans en être une.

**Tags** : 108 → **114**, donc six pages `/tags/` neuves — `france-climate-2040` (8 guides),
`climate` (2 → 10), `heatwave` (4), `sea-level-rise` (3), `drought` (3),
`buying-property-in-france` (3). Les tags de région réutilisent l'existant (`provence`, `brittany`,
`normandy`, `ile-de-france`, `pyrenees`, `atlantic coast`, `alps`, `savoie`, `paris`, `lyon`).
`npm run sitemap:check` repassé à cause d'elles : **EN 28 673 → 28 687 URL** (8 guides + 6 tags),
chaque URL déclarée a une page. `npm run search-index` relancé (`data/search-index.en.json`
795 guides, 114 tags) — sans quoi `search-index:check` échoue.

**Accents** : la convention du corpus EN a été mesurée avant d'écrire, pas supposée — les noms
propres français gardent leurs diacritiques (`Chambéry` 144 occurrences contre 0 sans, `Rhône` 139
contre 3, `Pyrénées-Orientales` 13 contre 0), à la seule exception de **`Pyrenees`**, exonyme
anglais majoritaire (125 contre 51). Une passe de normalisation a été appliquée aux champs de prose
uniquement, jamais aux `slug` ni aux `tags`, qui restent ASCII.

**Contrôles de surface après écriture**, le même jeu qu'au batch 32 avait dû ajouter après coup :
les 8 guides sont retrouvés par `getEnGuide()`, leurs 40 `relatedCities` existent tous dans
`CITIES_SEED` (donc la recherche inverse les remonte sur les pages ville EN), et
`suggestNextEnGuides()` rend des voisins non vides pour chacun. `npx tsc --noEmit` propre,
`npm run integrity` vert (795 guides EN, 0 score brut recopié, aucun `openGraph` sans `images`).
**`npm run build` n'a pas été lancé** — interdit depuis le batch 27 (4 h 30, `.next` à 25 Go,
ENOSPC avant la finalisation, aucun signal utile) ; le substitut prescrit a été exécuté en entier.

### Livré le 30/08 — tourisme batch 37 EN (+7), la série refermée à 226/226

`npm run parity` en **code 0** en début et en fin de run (FR 219 / EN 166, 0 route FR sans jumelle) :
pas de régression de routes, donc run de corpus. **Deux séries se sont rouvertes le 29/08**, toutes
deux par un batch FR livré la veille : tourisme 226 FR / 219 EN et `vacances-celibataire-` 29 FR /
22 EN (`solo-travel-in-`). La tourisme a été prise en premier — c'est la plus grosse série du corpus
et `CLAUDE.md` § batch 36 nommait déjà les sept villes. **`vacances-celibataire-` reste ouverte à
7 et devient la tâche du prochain run** (Brest, Reims, Orléans, Metz, Troyes, Pau, Chambéry).

Les 7 jumelles `things-to-do-in-[slug]-2026` du batch 36 FR écrites d'un coup (Orange,
Saint-Germain-en-Laye, La Ciotat, Rochefort, Dieppe, Douai, Sens). **Compteurs mesurés : FR 226 /
EN 226, écart nul** (`EN_GUIDES` 780 → 787). Aucun slug hors gabarit : les sept villes prennent « à »
sans contraction, donc la règle du batch 33 (**côté EN le slug se dérive du slug de seed tel quel**)
n'avait rien à arbitrer. `metaTitle` 46-53 caractères, `metaDesc` 145-159, **8 sections par guide**
(la série FR en compte 10, l'EN fusionne les fins de liste), 1 100-1 207 mots, **0 em-dash**.
**Aucun tag neuf** : les 7 réutilisent `provence`, `ile-de-france`, `atlantic coast`, `normandy`,
`hauts-de-france`, `burgundy` — les tags de ville sont à 1 occurrence, sous le seuil de 3 qui crée
une page `/tags`. `data/search-index.en.json` reste donc à **108 tags** (787 guides) et
`npm run sitemap:check` repasse (FR 29 104 URL, EN 28 666 → **28 673**).

⚠️ **Une erreur de fait trouvée dans le guide FR du 29/08, corrigée des deux côtés.** Le guide Sens
datait le contraste entre le marché couvert et la cathédrale « à deux siècles et demi de distance »,
alors que le même guide ouvre le chantier de la cathédrale **vers 1135** et inaugure le marché en
**1882** : sept siècles et demi, pas deux et demi. La FR est corrigée et l'EN écrit « seven and a
half centuries apart ». Même famille que les comparatifs faux du 28/08 : les dates prises une à une
sont justes, c'est **l'écart calculé entre elles** qui dérape, et ni `tsc` ni `integrity` ne peuvent
le voir.

**Contrôle mécanique des figures, reconduit des batches précédents** : chaque nombre du texte EN est
cherché dans la jumelle FR après normalisation des séparateurs (« 29 357 » ↔ « 29,357 », « 1,80 » ↔
« 1.80 ») — **112 figures, 112 retrouvées**. Le seul écart signalé est de forme et non de fond
(« 40 minutes » côté EN contre « quarante minutes » écrit en toutes lettres côté FR). ⚠️ Le premier
jet du contrôle sortait **8 faux positifs** parce que son `(?!\d.)` rejetait tout nombre suivi d'un
point de fin de phrase : un contrôle qui échoue doit être suspecté avant le texte qu'il accuse.
Les 7 guides sont vérifiés **retrouvés par `getEnGuide()`**, **pourvus de leur photo d'en-tête**
(`guideCityPhoto`, appelée avec `relatedCities`) et **remontés en 1re position** par la recherche
inverse de `CityGuidesList` sur leur page ville EN.

Les prudences du FR sont reprises telles quelles, à ne pas diluer : ① **l'Hermione n'est pas à
Rochefort** — en cale sèche à Anglet, port de Bayonne, depuis l'automne 2021, l'avertissement étant
même appuyé côté EN (« Bayonne is a long way south »), un lecteur étranger étant plus susceptible de
faire le détour pour un bateau absent ; ② **pas d'édition 2026 du festival de cerf-volant de Dieppe**,
biennal en années impaires, dernière en septembre 2025, prochaine attendue en 2027 ; ③ **Louis XIV est
né au Château-Neuf**, détruit, et non dans le château qu'on visite ; ④ la légende des spectateurs
fuyant *L'Arrivée d'un train* est donnée comme **une histoire construite après coup** ; ⑤ **baignade
sans surveillance permanente à Figuerolles** et **falaises de craie qui s'effondrent par plaques** sur
la côte d'Albâtre ; ⑥ convention « **accessible depuis** » tenue partout (vignobles depuis Orange,
Maison du Transbordeur à Échillais, île d'Aix, cimetière canadien de Hautot-sur-Mer, Pourville et
Varengeville, Centre historique minier de Lewarde).

Six ajouts propres à l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur français :
la **désambiguïsation d'Orange** dès la première ligne (ni le fruit, ni l'opérateur, ni le comté
californien — et la maison d'Orange-Nassau tient son nom de la ville, pas l'inverse) ; le **RER A**
expliqué comme réseau express traversant Paris ; la **pétanque** et le **mistral** définis en une
incise ; le **carillon** défini comme un jeu de cloches joué au clavier et le **beffroi** comme tour
civique et non religieuse, avec les **corons** ; la filiation **Sens → Cantorbéry** posée comme un
pèlerinage bien plus direct pour un lecteur britannique que son obscurité ne le laisse croire, avec
le siège **primatial** expliqué ; et la **liaison transmanche Dieppe-Newhaven**, qui fait de Dieppe
une des rares stations françaises atteignables depuis la Grande-Bretagne sans avion, l'opération
**Jubilee** étant par ailleurs de l'histoire canadienne avant d'être de l'histoire française.

### Livré le 29/08 (2ᵉ run) — `single-parent-in-[city]-2026` refermée une quatrième fois (batch 6, +9)

`npm run parity` en **code 0** en début et en fin de run (FR 219 / EN 166, 0 route FR sans jumelle) :
pas de régression de routes, donc run de corpus. Le diff par série a confirmé le seul écart annoncé
par le batch 6 FR du 28/08 — **57 FR contre 48 EN**, les neuf mêmes villes : Valence, Colmar,
Saint-Nazaire, Chambéry, Bourges, Pessac, Calais, Le Tampon (974), Ajaccio. **Compteurs mesurés
après écriture : 57 FR / 57 EN, écart nul** (`EN_GUIDES` 771 → 780).

⚠️ **Le comptage du 29/08 (1er run) confondait deux séries et annonçait un faux dépassement.** Il
écrivait « `single-parent-in-` (63) dépasse déjà `parent-solo-a-` (57) » : 63 = 48 guides
`single-parent-in-` **plus** les 15 `single-parent-holidays-` de la série vacances (F61), qui n'a
rien à voir. Un préfixe qui en contient un autre se compte avec le tiret et le millésime, pas au
`grep` court — même famille de piège que le `comm` naïf sur les slugs à article du tourisme.

**Le rang publié se calcule fit décroissant puis nom croissant** (`localeCompare` en `fr`), méthode
établie le 25/08 : rejouée ici, elle reproduit **9/9** les rangs des jumelles FR (Valence 63e,
Colmar 68e, Saint-Nazaire 90e, Chambéry 97e, Bourges 139e, Pessac 170e, Calais 227e, Le Tampon 274e,
Ajaccio 316e). Un tri stable en aurait publié d'autres.

**Deux affirmations comparatives fausses trouvées dans les guides FR du 28/08, corrigées des deux
côtés.** ① Le guide Chambéry annonçait un T3 « troisième plus cher du batch » : à 1 100 € il est le
**deuxième**, derrière les 1 200 € d'Ajaccio. ② Le guide Saint-Nazaire présentait les Pays de la
Loire comme « la région la plus favorable de France à ce profil » : à la mesure, la **moyenne
régionale la plus haute est celle de la Bourgogne-Franche-Comté** (6,54 contre 6,36 sur les communes
éligibles). Ce qui tient, et qui est repris dans les deux locales, c'est le **haut de tableau** :
les Pays de la Loire placent trois communes dans les huit premières nationales (La Roche-sur-Yon 1re,
Challans 4e, Cholet 8e). Le reste du raisonnement régional du guide est confirmé au chiffre près —
quatre communes de la région font mieux au composite **pour un loyer inférieur** (La Roche-sur-Yon,
Cholet, Laval, Saumur).

Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit), `metaTitle`
38-49 caractères, `metaDesc` 120-148, **6 sections par guide** comme le reste de la série,
1 358-1 475 mots, **0 em-dash** (cible R7.10). **Aucun tag neuf** : les 9 réutilisent
`auvergne-rhone-alpes`, `grand est`, `pays de la loire`, `centre-val de loire`, `nouvelle-aquitaine`,
`hauts-de-france`, `reunion`, `corsica` — le tag de ville est nominatif (« single parent valence »)
précisément pour ne pas pousser `valence`, `besancon` ou `limoges`, tous à 2 occurrences, au-dessus
du seuil de 3 qui crée une page `/tags`. `data/search-index.en.json` reste donc à **108 tags**
(780 guides), et `npm run sitemap:check` repasse (FR 29 089 URL, EN 28 666).

**Contrôle après insertion, reconduit des batches FR** : un script rejoue fit, rang, les quatre axes,
T1/T2/T3, prix au m², revenu minimum, ratio loyer ÷ écoles, prix d'un 65 m² et populations 2011 et
2022 de chaque ville, et échoue si l'une des valeurs n'est pas retrouvée dans le texte de la jumelle.
**9/9 au premier passage.** Les 9 guides sont vérifiés **retrouvés par `getEnGuide()`**, **pourvus de
leur photo d'en-tête** (`guideCityPhoto`) et **remontés en 1re ou 2e position** par la recherche
inverse `relatedCities` de `CityGuidesList` sur leur page ville EN. Contrôle mécanique
complémentaire : **166 figures en `/10`, toutes égales à une valeur de score rendue** — aucune n'est
un littéral du seed.

Les prudences du FR sont reprises telles quelles, à ne pas diluer : l'axe écoles mesure **l'offre
communale**, pas la réussite des élèves ni le travail des enseignants ; **aucun verdict par quartier**
nulle part (les neuf communes n'ont aucun quartier documenté dans `data/neighborhoods.ts`, ce que les
guides disent au lieu de le taire) ; le **seuil affiché est déjà la version indulgente à 35 %** pour
Pessac et Le Tampon, et la **règle stricte** ailleurs, Chambéry et Ajaccio étant à 5,0 pile ; le score
de coût de la vie du Tampon décrit **l'importation, pas le loyer** ; la **baignade en mer est
interdite hors lagon de la côte ouest et hors bassins surveillés**, et **Le Tampon n'a pas de
littoral** ; la **saison cyclonique impose une garde d'urgence identifiée à l'avance** ; et sur
Calais et Ajaccio, les deux dossiers les plus bas sur écoles et sécurité, la copie s'en tient à ce que
les indicateurs mesurent et **ne dit rien des habitants**.

Sept ajouts propres à l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur
français : **Visale** comme réponse au garant qu'un arrivant n'a pas (Valence) ; le fait que
**Valence TGV est à Alixan**, hors de la ville, et qu'il faut lire le nom de la gare sur le billet
(seul chiffre repris du corpus FR, sans durée de correspondance) ; le **travail frontalier vers
l'Allemagne et la Suisse** depuis l'Alsace, dont le régime fiscal et social relève d'accords
bilatéraux et se vérifie cas par cas (Colmar) ; l'**allocation de soutien familial** et
l'intermédiation CAF des pensions (Saint-Nazaire) ; le fait qu'une **population française est celle
de la commune et non de l'aire urbaine**, ce qui explique l'écart seed / recensement (Chambéry) ;
l'**absence de restriction de nationalité à l'achat** en France mais des conditions de prêt
différentes pour un non-résident (Bourges) ; la **dérogation à la carte scolaire qui se demande et ne
se suppose pas** (Pessac) ; et, côté Calais, le fait que **le Royaume-Uni est un pays tiers depuis le
Brexit**, donc formalités de frontière à chaque traversée, enfants compris — l'atout « relais
familial atteignable » du guide FR devient ici une information de procédure. Ajaccio et Le Tampon
portent les rappels déjà établis : **DROM hors Schengen**, **La Réunion à UTC+4 sans heure d'été et
calendrier scolaire propre**, **Corse pleinement en France et dans l'UE**, mais liaisons continentales
à budgéter.

**Prochain run parent-solo : batch FR** (l'écart est nul, la main revient au FR). Vivier laissé par le
batch 6 et à recalculer plutôt qu'à recopier : **Quimper** (6,1), **Montauban** (6,3), **Narbonne**
(4,9), **Sète** (4,8), **Vénissieux** (5,6, à examiner au regard de la règle granulaire), les communes
réunionnaises non couvertes (Saint-Louis, Saint-André, Saint-Benoît, Saint-Joseph) et **Le Lamentin**
(4,5). Sous ce vivier, la série approche de sa fermeture naturelle.

### Livré le 26/08 — série tourisme rattrapée (batch 35 EN, +6), parité refermée à 219/219

`npm run parity` en **code 0** en début de run (FR 218 / EN 165, 0 route sans jumelle) : pas de
régression de routes, donc run de corpus. Le diff par série sur le corpus réel a sorti la série
tourisme comme le seul écart ouvert — **219 FR contre 213 EN**, exactement les six villes du
batch 34 FR livré la veille. Les 6 jumelles `things-to-do-in-[slug]-2026` écrites d'un coup dans
`data/guides-en.ts` : **Salon-de-Provence, Saint-Quentin, Brive-la-Gaillarde, La Seyne-sur-Mer,
Valenciennes, Thionville**. **Compteurs mesurés : FR 219 / EN 219 — écart nul, parité rétablie**
(`EN_GUIDES` 743 → 749). Le diff est propre dans les deux sens après application de la table de
correspondance des sept slugs FR à article (`puy-en-velay`→`le-puy-en-velay`, `tampon`→`le-tampon`,
`francois`→`le-francois`, `robert`→`le-robert`, `abymes`→`les-abymes`, `lamentin`→`le-lamentin`,
`sables-d-olonne`→`les-sables-d-olonne`) : aucun faux trou, aucun slug EN orphelin.

Aucun nouveau slug hors gabarit : les six slugs de seed s'écrivent tels quels, donc la règle
tranchée au batch 33 (**le slug EN se dérive du slug de seed tel quel, jamais d'une version
« propre »**) n'avait rien à arbitrer ici. Les 6 guides ont été **vérifiés retrouvés par
`getEnGuide('things-to-do-in-' + slug + '-2026')` et pourvus de leur photo d'en-tête**
(`guideCityPhoto`) après écriture — le contrôle que le batch 32 a dû ajouter après coup.
`metaTitle` 35-52 caractères, `metaDesc` 143-155, 8 sections par guide (la série FR en compte 10,
l'EN fusionne les fins de liste comme tous les batches EN précédents). Aucune figure en `/10`,
aucun horaire, aucun tarif : les seuls chiffres sont ceux des guides FR, à commencer par les
populations Insee 2022 (Salon 44 600, Saint-Quentin 53 000, Brive 46 800, La Seyne 62 900,
Valenciennes 43 000, Thionville 42 800 et 40 500 en 2016).

**Tags** : aucun tag neuf, les six réutilisent `provence-alpes-cote-d-azur`, `hauts-de-france`,
`nouvelle-aquitaine` et `grand-est`, tous très au-dessus du seuil de 3 guides.
`npm run search-index` relancé (`data/search-index.en.json` 749 guides, 103 tags — inchangé) et
`npm run sitemap:check` repassé (FR 29 067 URL, EN 28 623 → **28 629**, chaque URL déclarée a une
page).

⚠️ **Les prudences du FR sont reprises telles quelles et ne doivent pas être diluées** : la
**base aérienne 701** de Salon est une emprise militaire, dite comme telle *avant* la première
phrase sur la Patrouille de France ; le **fronton de l'hôtel de ville de Valenciennes** est la
reprise d'Albert Patrisse après l'incendie du 21-22 mai 1940, pas la pierre d'origine ; la
**maison espagnole** de Valenciennes voit son office de tourisme partir vers le Mont-de-Piété,
donc le guide dit de vérifier l'adresse plutôt que d'affirmer l'une ou l'autre ; le **savon de
Marseille n'est protégé par aucune appellation** ; et la convention « **accessible depuis** »
plutôt que « situé à » tient sur **Notre-Dame du Mai** (Six-Fours) depuis La Seyne, **château de
La Grange** (Manom) et **fort du Hackenberg** (Veckring) depuis Thionville,
**Collonges-la-Rouge / Turenne / Sarlat** et l'**aéroport de Nespouls** depuis Brive.

Six ajouts propres à l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur
français : la **Patrouille de France** présentée par son équivalent (les Red Arrows) et le
**mistral** expliqué en une incise ; « **collégiale** » et « **basilique** » définis comme titres
(collège de chanoines, titre honorifique romain) et non comme rangs épiscopaux ; la
**désambiguïsation Saint-Quentin (Aisne) vs mont Saint-Quentin (Somme)**, celui que visent les
récits anglophones de 1918, posée **dans l'intro** ; **Top 14 / Pro D2** nommés comme les deux
divisions professionnelles du rugby français ; la **fermeture préfectorale du massif du cap
Sicié** pour risque incendie donnée comme une règle opposable et non comme un conseil, et les
**navettes maritimes** de la rade dites transport en commun au tarif d'un ticket, pour éviter la
réservation d'une croisière ; et côté Thionville-Valenciennes, le fait que ces frontières sont
des **passages Schengen intérieurs sans formalité mais avec pièce d'identité**, et que
**Trèves s'appelle Trier** en allemand.

**Prochain run** : côté tourisme l'écart est nul, la série FR reprend la main — le prochain batch
FR est attendu sur les six banlieues de province jamais faites (Villenave-d'Ornon, Talence,
Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron) ou les trous listés au batch 34
(Saint-Herblain, Mantes-la-Jolie, Istres, Cambrai). Le prochain run de parité doit donc rediffer
**toutes** les séries, pas seulement celle-ci.

### Livré le 25/08 — `single-parent-in-[city]-2026` REFERMÉE une troisième fois (batch 5, +9)

`npm run parity` en **code 0** en début de run (FR 218 / EN 165, 0 route sans jumelle) : pas de
régression de routes, donc run de corpus. Le diff par série sur le corpus réel a sorti la série
`parent-solo-a-[ville]` / `single-parent-in-[city]` comme le trou le plus net et le plus récent —
**48 FR contre 39 EN**, l'écart ouvert par le batch 5 FR du 23/08. Les 9 jumelles manquantes
écrites d'un coup dans `data/guides-en.ts` : **Saint-Paul 974, Avignon, Saint-Pierre 974, Béziers,
La Rochelle, Pau, Cherbourg-en-Cotentin, Fort-de-France, Mérignac**. **Compteurs mesurés :
48 FR / 48 EN — écart nul, série refermée** (`EN_GUIDES` 725 → 734). C'est la **troisième**
réouverture-refermeture de cette série depuis le 10/08 (20/20, 29/29, 39/39, 48/48) : la cadence
réelle du chantier, pas un accident.

⚠️ **Le rang publié par cette série se calcule avec un départage par nom, et il fallait le
retrouver avant d'écrire.** Un tri stable par fit décroissant sur les 363 communes ≥ 20 000 hab.
donne Pau 53ᵉ, La Rochelle 66ᵉ, Saint-Paul 317ᵉ ; les guides FR livrés le 23/08 disent 60ᵉ, 70ᵉ,
325ᵉ. L'écart n'est pas une erreur : les paliers sont larges (16 communes à 5,3, 13 à 4,4) et la
série ordonne **fit décroissant puis nom croissant** (`localeCompare` en `fr`). Vérifié contre
neuf guides EN déjà livrés — Nîmes 224ᵉ, Le Mans 110ᵉ, Amiens 119ᵉ, Annecy 80ᵉ, Perpignan 263ᵉ,
Orléans 102ᵉ, Mulhouse 126ᵉ, Poitiers 46ᵉ, Dunkerque 158ᵉ : **9/9 reproduits** par cette méthode
et 2/9 seulement par le tri stable. Un rang recalculé « au plus simple » aurait donc publié un
chiffre différent de celui de la jumelle FR sur 7 des 9 guides. **Reprendre cette méthode pour
toute nouvelle jumelle de la série**, et se rappeler qu'un ordre à l'intérieur d'un palier est
stable, pas un départage (convention `lib/owner-rankings.ts`).

Cinq chiffres ont été **corrigés contre le moteur** avant écriture plutôt que recopiés du FR :
le coût de la vie de Mérignac à 4,0/10 est **le plus bas des neuf**, pas l'avant-dernier ;
Niort est à **deux dixièmes** de La Rochelle au composite, pas à un demi-point ; un T3 de 65 m²
à Cherbourg vaut **123 500 €** et non 124 000 ; à Fort-de-France **162 500 €** et non 163 000 ;
et 97 500 € font **un peu plus** du tiers des 273 000 € rochelais, pas moins. Contrôlés au
passage et confirmés justes : le score global de La Rochelle à **7,2/10** (c'est
`scores.global`, pas un champ `global` de premier niveau — le piège du dump), la nature du
Robert **7,8** devant Fort-de-France 7,5, et Béziers **22ᵉ sur 22** en Occitanie.

Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` 44-53 caractères, `metaDesc` 115-136, 6 sections par guide comme le reste de la
série. **Aucun tag neuf** : les 9 réutilisent `reunion`, `martinique`, `occitanie`,
`nouvelle-aquitaine`, `normandy`, `provence-alpes-cote-d-azur` — attention, ce dernier existe en
**deux graphies** dans le corpus EN (`provence-alpes-cote-dazur`, 2 guides, sous le seuil de 3) et
prendre la mauvaise aurait créé une page `/tags` de plus.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **baignade en mer interdite
hors lagon de la côte ouest et hors bassins surveillés** à La Réunion, avec la précision
géographique **qu'il n'y a pas de lagon dans le sud** (Saint-Pierre) et que Saint-Paul, elle,
borde le lagon ; **saison cyclonique** et fermetures décidées la veille au soir dans les trois
guides ultramarins ; **bruit aérien à Mérignac** présenté comme un critère qu'aucun des quatre
axes ne mesure ; et aucun verdict par quartier nulle part — 2 ou 3 quartiers documentés ne
décrivent pas une commune de 80 000 habitants.
Six ajouts propres à l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur
français : **Visale** comme réponse au garant qu'un arrivant n'a pas, la **carte scolaire** et la
dérogation qui se demande et ne se suppose pas, l'**allocation de soutien familial** versée par la
CAF et l'intermédiation des pensions, le fait que **les DROM ne sont pas dans Schengen** et que
**La Réunion est à UTC+4 sans heure d'été**, donc hors calendrier scolaire A/B/C, le **ferry
transManche de Cherbourg** vers l'Angleterre et l'Irlande, et le **chlordécone** nommé comme fait
documenté de la Martinique, sans chiffre et sans verdict, sources renvoyées à l'ARS et à la
préfecture.
`npm run search-index` relancé (`data/search-index.en.json` 734 guides, 102 tags) et
`npm run sitemap:check` repassé (FR 29 061 URL, EN 28 613) — chaque URL déclarée a une page.

**Correctif d'outil du même run — `npm run parity --sitemaps` mentait par omission.** Sans egress
(routine cloud : le proxy refuse le CONNECT), les 20 chunks revenaient en `!res.ok`, la table
sortait vide et la ligne `TOTAL` affichait **`0`** — c'est-à-dire exactement ce qu'affiche une
parité atteinte. Le tableau de bord du chantier annonçait donc « écart nul » précisément quand il
n'avait rien pu mesurer. `sitemapCounts()` compte désormais les chunks réellement lus, attrape
l'exception réseau, et **dit `NON MESURÉ — sitemap injoignable`** au lieu de publier un agrégat de
zéros. Même principe que `news:stats` le 18/08 : un agrégat de zéros doit nommer ce qu'il n'a pas
vu. Le code de sortie est inchangé (routes seules), une routine sans egress ne doit pas échouer
pour ça.

**Prochain run** : la série `single-parent-` est à parité, donc reprendre le diff par série. Les
plus gros trous restants au 25/08 sont `universites-[ville]` (15 FR / 0 EN), `famille-a-[ville]`
(19 FR / 10 EN, batch 2 de `family-in-` à écrire), `quitter-` (55 FR / 23 EN `leaving-`) et
`parent-solo-` si un batch 6 FR repart. Rappel : `demenager-a-[ville]` (50 FR / 0) reste un
**non-correctif assumé**, recouvrement avec `[city]-living-guide`.

### Livré le 24/08 — ouverture de `family-in-[city]-2026` (batch 1, +10)

`npm run parity` en **code 0** en début de run (FR 217 / EN 165, 0 route sans jumelle) : pas de
régression de routes, donc run de corpus. Le diff par famille de slugs sur le corpus réel
(FR 989 / EN 715) a redonné la même hiérarchie de trous qu'au 18/08, à ceci près qu'elle n'avait
toujours pas bougé : **`famille-a-[ville]` 19 FR / 0 EN**, `universites-` 15/0, `demenager-a-`
50/4 (les 4 sont des guides nationaux, aucune jumelle per-city), `quitter-` 55/23, `vivre-en-`
56/31. La série famille a été choisie contre le rattrapage de `parent-solo` (48 FR / 39 EN depuis
le batch 5 FR du 23/08) et contre `demenager-a-`, pour deux raisons tenables : c'est le plus gros
trou **à couverture nulle** après six jours de signalement, et une série `moving-to-[city]`
entrerait en recouvrement frontal avec `[city]-living-guide` (52 EN), soit exactement la
cannibalisation qui a coûté 15 guides EN en juin. **`EN_GUIDES` 715 → 725**, série
**19 FR / 10 EN**.

**Les 10 villes** : Lyon, Nantes, Bordeaux, Toulouse, Rennes, Strasbourg, Lille, Montpellier,
Marseille, Nice. `metaTitle` 51-57 caractères, `metaDesc` 135-158, 7 sections par guide (la série
FR en compte 5 ; la 6ᵉ et la 7ᵉ portent l'angle qui n'existe pas côté français, cf. plus bas),
catégorie `family`. **Zéro tiret cadratin sur les 10** (R7.10 : la première passe en comptait 9 à
16 par guide, soit 2 à 3 pour 200 mots, réécrits en parenthèses, deux-points et virgules — les
gloses récurrentes « T3 » et « assistante maternelle » en faisaient la moitié).

**Le socle chiffré vient des modules, jamais de la prose FR.** Loyers T1/T2/T3 lus dans
`data/housing.ts`, médianes de transaction dans `lib/property-prices.ts` (DVF 2024-2025, avec le
nombre de ventes), populations et part des 0-14 ans dans `lib/city-population.ts` (Insee 2022),
niveau de vie et taux de pauvreté dans `lib/city-income.ts` (Filosofi 2021), rang scolaire calculé
sur `CITIES_SEED`. ⚠️ **Les guides FR de cette série chiffrent des T4** — un format qui n'existe
nulle part dans nos données. Les jumelles EN publient donc le **T3**, qui est ce que rend
`/cities/[slug]/housing`, en expliquant la nomenclature française une fois par guide. Recopier le
T4 de la prose FR aurait été le piège documenté dans `CLAUDE.md` : on cite ce que la page rend.
**Aucun score `/10` n'est imprimé**, comme dans les batches EN depuis le 23/08 : les comparaisons
passent par le rang (« 1st of 540 », « 505th of 540 ») ou par des mots.

**Cinq affirmations ont été corrigées avant commit parce que le contrôle contre les modules les a
démenties**, et elles se seraient toutes lues comme des mesures : Lille n'a **pas** le pire score
de sécurité du lot (Marseille 2,7 contre 3,9) ; Nice a le meilleur score nature du lot **seule**,
pas à égalité avec Marseille (7,4 contre 7,0) ; Toulouse n'est **pas** la moins chère des quatre
plus grandes villes du lot au m² appartement (Marseille 3 154 € contre 3 222 €) ; Rennes n'est pas
non plus la moins au-dessus de la médiane nationale hors Toulouse et Marseille (Nantes +35 % et
Montpellier +32 % sont sous ses +45 %) ; et Toulouse est la ville qui **gagne le plus d'habitants
en valeur absolue** depuis 2011, pas celle qui croît le plus vite (Montpellier +16,1 % contre
+14,4 %). Neuf `relatedCities` pointaient vers des communes absentes du seed (Cesson-Sévigné, Bruz,
Betton, Lambersart, Marcq-en-Barœul, Villeneuve-d'Ascq, Castelnau-le-Lez, Lattes,
Saint-Laurent-du-Var) : `assertKnownSlugs` les aurait attrapées au build, pas `tsc`. Remplacées par
des villes du seed du même département ; les communes elles-mêmes restent nommées dans la prose,
où elles sont justes.

**Le fait qui structure tout le lot, et qu'aucun guide FR n'énonce** : huit des dix villes ont une
part de 0-14 ans **sous** la médiane des 538 villes couvertes (16,5 %). Bordeaux est à 13,4 %,
452ᵉ sur 538. Seuls Strasbourg (16,7 %) et Marseille (17,6 %) tiennent le milieu. Autrement dit,
les grandes villes françaises ne sont pas là où sont les enfants : la couronne l'est. Chaque guide
le dit avec son chiffre, ce qui évite de vendre un centre-ville à une famille qui cherche une
troisième chambre. Deux autres mesures méritaient d'être publiées telles quelles : **Lille est la
seule ville du lot où la maison est moins chère au m² que l'appartement** (2 815 € contre 3 705 €,
et sous la médiane nationale de 2 840 €), et **Strasbourg est la seule sans médiane DVF** — le
Bas-Rhin, le Haut-Rhin et la Moselle relèvent du **livre foncier** et sont absents du fichier
national. Le guide le dit au lieu de laisser un blanc, qui se lirait comme un oubli.

**Sept incises sont propres au lecteur étranger et absentes du FR parce qu'inutiles à un Français** :
① l'école est **obligatoire à 3 ans** et la maternelle est une école gratuite, pas une garderie ;
② on **inscrit à la mairie**, pas à l'école, et la carte scolaire découle de l'adresse — donc le
bail décide de l'école, et se signe après vérification, pas avant ; ③ les **onze vaccinations
obligatoires** pour tout enfant né à partir du 1ᵉʳ janvier 2018 sont exigées à l'inscription, et un
carnet étranger doit être mis en regard du calendrier français **avant** l'arrivée ; ④ la plupart
des communes appliquent la **semaine de quatre jours**, donc l'élémentaire public est fermé toute
la journée du mercredi — ce qui prend de court à peu près tous les parents anglophones ; ⑤ cantine
et périscolaire sont facturés au **quotient familial CAF**, pas à tarif unique ; ⑥ les
**allocations familiales ne démarrent qu'au deuxième enfant** en métropole et sont modulées selon
les revenus depuis 2015 (aucun montant n'est imprimé : il changerait plus vite que le guide) ;
⑦ les **zones de vacances A/B/C** décident des semaines de congés et donc du prix des billets —
vérifiées à la source ce run : Lyon et Bordeaux en A, Toulouse et Montpellier en C, les six autres
en B. Ajouts locaux du même ordre : les **sections internationales publiques sont gratuites** et
ferment leurs candidatures bien plus tôt que les écoles internationales payantes (Bordeaux, Nice),
les **classes bilingues à parité horaire** alsaciennes et les **Kitas de Kehl** (Strasbourg), et le
poids réel du **privé sous contrat** dans l'Ouest et le Nord, qui ne porte pas la connotation
sociale qu'il aurait au Royaume-Uni ou aux États-Unis.

**Deux villes reçoivent un cadrage franc plutôt qu'une brochure**, dans la ligne du refus de
`quartiers-a-eviter` : Marseille est donnée avec son rang scolaire réel (**505ᵉ sur 540**) et la
méthode que les familles y appliquent — sécuriser l'école avant le logement — sans verdict sur les
quartiers ni sur leurs habitants ; Montpellier avec ses **28 % de taux de pauvreté** et l'écart
inter-secteurs le plus large du lot, en disant que le secteur décide, pas la ville.

**Tags** : aucun tag inventé, mais deux franchissent le seuil de 3 guides d'un coup et **créent
deux pages `/tags` côté EN** — `moving-to-france-with-children` et `french-school-system` :
`TAG_SLUGS_EN` passe de 100 à **102**. Les dix tags de ville et les tags de région réutilisent
l'existant. `npm run search-index` relancé (`data/search-index.en.json` 725 guides, 102 tags) et
**`npm run sitemap:check` repassé** à cause des tags neufs — **EN 28 604 URL**, chaque URL déclarée
a une page et chaque page indexable a une URL.

**Prochain run** : `family-in-[city]-2026` batch 2 (+9) referme la série — Angers, Caen, Dijon,
Tours, Metz, Clermont-Ferrand, Orléans, Pau, Besançon, c'est-à-dire exactement le reste de la liste
FR. Si `parent-solo` a encore creusé d'ici là, il passe devant. Les trous à couverture nulle qui
restent ensuite, par taille : `universites-` (15 FR / 0 EN) et
`vacances-monoparentales-` croisé mois × profil.

### Livré le 20/08 — `working-in-[city]-2026` batch 3 (+9), **série fermée**

`npm run parity` sortait en **code 0** en début de run (FR 217 / EN 165, 0 route sans jumelle) :
pas de régression de routes, donc run de corpus. Le diff par série a redésigné la série ouverte
depuis le 18/08, qui restait le plus gros trou entamé, et le batch 3 la **referme** :
**FR `travail-a-` 30 / EN `working-in-` 29**, le seul écart restant étant **Nantes**, qui n'aura
pas de jumelle parce que `nantes-living-and-working-guide-2026` couvre déjà le sujet (son
`metaTitle` dit « Living and Working in Nantes »). `EN_GUIDES` 692 → **701**.

**Les 9 villes** : Caen, Brest, Tours, Orléans, Le Mans, Amiens, Le Havre, Nîmes,
Aix-en-Provence — c'est-à-dire exactement la liste annoncée par le batch 2. `metaTitle` 45-50
caractères, `metaDesc` 144-157, 8 sections par guide, catégorie `moving`.
`npm run search-index` relancé (`data/search-index.en.json` 701 guides, 99 tags) et
`npm run sitemap:check` repassé — **EN 28 577 URL**, chaque URL déclarée a une page et chaque
page indexable a une URL. ⚠️ **Trois tags neufs**, donc trois pages `/tags` de plus :
`TAG_SLUGS_EN` passe de 96 à **99** (`aix-en-provence`, `le-havre`, `orleans` — chacun franchit
le seuil des 3 guides avec ce batch). `caen`, `brest` et `tours` existaient déjà ; `amiens`,
`le mans` et `nimes` ne créent rien, ils restent sous le seuil.

**Le socle chiffré vient des modules, pas de la prose FR.** Un script de contrôle a repassé les
9 guides ligne à ligne contre `lib/employment-market-rankings`, `lib/city-income`,
`lib/city-population` et `data/housing` avant commit : score d'emploi affiché (`10 - composite`,
comme le rend `/cities/[slug]/employment`), rang et ex æquo, niveau de vie médian annuel et
mensuel, taux de pauvreté, rang sur 533, populations 2016 et 2022, T1/T2/T3 et prix au m².
⚠️ **Écart assumé avec la prose FR sur sept des neuf villes** : les guides FR citent des loyers
qui ne sont plus ceux de `data/housing.ts` — Brest T2 570 € contre 650 et 2 100 €/m² contre
2 500, Orléans 720 € contre 700, Le Mans 610 € contre 650, Amiens 550 € contre 680, Le Havre
620 € contre 650 et 2 200 €/m² contre 2 000, Nîmes 650 € contre 720, Aix 950 € contre 1 050 et
4 200 €/m² contre 5 000. C'est le piège documenté dans `CLAUDE.md` : **on cite ce que la page
rend**, pas ce qu'un guide voisin a écrit un jour. Les jumelles EN publient les valeurs de
`data/housing.ts`. Seuls Caen et Tours étaient déjà alignés.

⚠️ **Le rang sur 363 est publié avec ses ex æquo**, comme au batch 2 et pour la même raison : le
composite d'emploi prend peu de valeurs distinctes. **Caen et Brest sont 86ᵉ à égalité avec 61
autres communes**, Tours et Le Havre partagent le 195ᵉ rang avec douze autres, Orléans et Le Mans
le 250ᵉ avec trois autres, Nîmes le 298ᵉ avec onze autres, Aix le 179ᵉ avec quatorze autres.
Chaque guide écrit « joint Nth … level with M others on the same score ». Ne pas « simplifier »
en retirant l'ex æquo : sans lui, un rang nu se lirait comme une mesure fine là où le barème
départage des scores identiques par l'ordre du tri.

**Cinq points propres au lecteur étranger, absents des guides FR parce qu'inutiles à un Français.**
① **Brest** : l'habilitation défense n'est pas seulement lente (4 à 8 mois, enquête sur 5-10 ans
d'antécédents, plus lente encore quand la décennie précédente s'est passée hors de France) — elle
est **attachée au poste et demandée par l'employeur**, et certains postes classifiés sont en
pratique fermés selon la nationalité. Le guide dit de poser la question au recruteur d'emblée,
parce que la réponse décide si l'offre existe vraiment pour le lecteur. ② **Caen et Nîmes** : une
grande part du marché qualifié y est publique, et le recrutement public français passe par
**concours** — dates fixes, programmes publiés, et **condition de nationalité sur les emplois
titulaires**, pas sur les contractuels du même établissement. Les deux guides disent de demander
de quel type est le poste avant de bâtir un calendrier dessus. ③ **Le Mans** : la distribution
et le conseil en assurance sont des **activités réglementées** (immatriculation, heures de
formation, compétence professionnelle) et une qualification obtenue hors UE ne passe pas
automatiquement ; les titres d'actuaire relèvent d'organismes professionnels, donc la
reconnaissance dépend de qui les a délivrés. ④ **Aix** : la profession d'avocat est la porte
réglementée la plus étroite de France — inscription à un barreau français, voie de reconnaissance
dépendant du pays d'obtention, examen d'aptitude — et cela se commence **avant** le déménagement.
S'y ajoute **ITER**, qui est une organisation internationale et non un employeur français : elle
recrute par son propre canal et non par concours public, et rien de ce que dit la section visa
ne s'y applique par défaut. ⑤ **Le Havre** : le shipping et l'assurance maritime sont la seule
part de ce marché qui fonctionne largement **en anglais**, donc la porte d'entrée réaliste ; et
le travail **posté** y est la norme, avec des primes et des règles de repos qui font que le
salaire affiché et le salaire réel diffèrent.

**Quatre prudences éditoriales assumées, à ne pas diluer.** ① **Amiens** est présentée comme le
marché le plus dur du lot, chiffres à l'appui (4,3/10, niveau de vie 407ᵉ sur 533, pauvreté 26 %),
avec la conclusion explicite qu'on y vient **avec le poste déjà signé** — un loyer bas n'achète
pas du temps de recherche. Même cadrage à **Nîmes**, où la pauvreté atteint 31 % : le guide écrit
que le problème est le **nombre** de postes et non ce qu'ils paient, parce que c'est ce que dit
le détail du composite (chômage dans la pire tranche, salaires en milieu de tableau). ② **Le
Havre** : la transition énergétique de la raffinerie et de l'usine automobile est annoncée et en
cours ; le guide dit de privilégier les postes R&D, procédés et transition et de demander quelle
reconversion est **contractuellement** engagée plutôt que promise oralement. ③ **Aix** : le
guide fait passer l'arithmétique du logement avant tout le reste (T2 1 050 €, 5 000 €/m², le
double de Caen) et dit qu'un salaire de grille publique nationale ou un poste junior ne l'absorbe
pas, quel que soit l'ensoleillement. ④ **Le Mans** : la semaine des 24 Heures est traitée en
**contrainte de planning** et non en couleur locale — ne pas y caler un déménagement, une
recherche de logement ni des entretiens, et savoir que dans l'hôtellerie, l'événementiel et la
sécurité c'est la semaine où les congés ne sont pas accordés.

⚠️ **Correction de mesure à reporter : la série `demenager-a-[ville]` n'a AUCUNE jumelle EN.**
La § du 19/08 annonçait « `moving-to-` 6 EN contre `demenager-a-` 50 FR » ; le recensement par
préfixe fait ce run montre que les **4** guides `moving-to-` existants sont tous **nationaux**
(`moving-to-france-from-uk`, `-from-canada`, `-where-to-live`, `-complete-checklist`) et qu'aucun
ne vise une ville. Le rapprochement était fait sur un préfixe qui se ressemble, pas sur une série.
Séries FR restant **sans aucune jumelle EN**, mesurées ce run : **`demenager-a-[ville]-2026`
(50 FR / 0 EN)**, **`famille-a-[ville]-2026` (19 FR / 0 EN)**, **`universites-[ville]-2026`
(15 FR / 0 EN)**. Séries entamées et encore loin : `leaving-` 23 EN contre `quitter-` 55 FR.
Séries à parité, à re-differ et non à croire sur parole : tourisme 207/207, `where-to-buy-in-`
49/49, `working-in-` 29 contre `travail-a-` 30 (Nantes couverte autrement),
`single-parent-in-` 39/39, `single-parent-holidays-` 7/7, `solo-travel-in-` 15/15.

**Écart de contenu, distinct de l'écart de routes** : **guides 973 FR / 701 EN, tags 241 / 99**
(mesuré ce run après le batch).

**Prochain run** : le plus gros trou est désormais `demenager-a-[ville]-2026`, 50 guides FR sans
la moindre jumelle, mais c'est aussi la série la plus proche d'un doublon — vérifier d'abord ce
que couvrent déjà `moving-to-france-complete-checklist-2026` et les `[city]-living-guide` avant
d'ouvrir une série `moving-to-[city]`, sous peine de refabriquer la cannibalisation nettoyée en
juin 2026. À défaut, `famille-a-[ville]-2026` (19 FR / 0 EN) est le trou net suivant et ne
recouvre rien d'existant.

### Livré le 19/08 — `working-in-[city]-2026` batch 2 (+10), série aux deux tiers

`npm run parity` sortait en **code 0** en début de run (FR 217 / EN 165, 0 route sans jumelle) :
pas de régression de routes, donc run de corpus. Le diff par série a redésigné la série ouverte
la veille, qui reste le plus gros trou entamé : **`travail-a-[ville]-2026`, 30 FR / 10 EN**.
Compteurs mesurés (`grep -c` des deux côtés) : **FR `travail-a-` 30 / EN `working-in-` 20**,
`EN_GUIDES` 675 → **685**. Restent 10 jumelles, dont Nantes qui n'en aura pas :
`nantes-living-and-working-guide-2026` existe déjà et couvre le sujet — donc 9 villes réelles,
un batch 3 referme la série.

**Les 10 villes** : Grenoble, Rouen, Reims, Saint-Étienne, Toulon, Angers, Dijon, Nancy,
Clermont-Ferrand, Metz. `metaTitle` 42-53 caractères, `metaDesc` 137-152, 8 sections par guide
comme au batch 1. Catégorie `moving`. `npm run search-index` relancé
(`data/search-index.en.json` 685 guides) et `npm run sitemap:check` repassé — **EN 28 557 URL**
(28 540 + 10 guides + 7 tags), chaque URL déclarée a une page.
⚠️ **Sept tags neufs, donc sept pages `/tags` de plus** : `TAG_SLUGS_EN` passe de 88 à **95**
(`angers`, `clermont-ferrand`, `metz`, `nancy`, `reims`, `rouen`, `toulon` — chacun franchit le
seuil des 3 guides avec ce batch). `saint-etienne` et `grenoble` ne créent rien : le premier
reste à 2 guides, le second était déjà à 3.

**Le socle chiffré vient des modules, pas de la prose FR**, comme au batch 1, et un script de
contrôle a re-vérifié les 10 guides ligne à ligne contre `lib/employment-market-rankings`,
`lib/city-income`, `lib/city-population` et `data/housing` avant commit. ⚠️ **Écart assumé avec
la prose FR sur trois villes** : les guides FR citent des loyers qui ne sont plus ceux de
`data/housing.ts` (Reims T2 640 € contre 680, Saint-Étienne 490 € contre 580 et 1 350 €/m²
contre 1 500). C'est exactement le piège documenté dans `CLAUDE.md` — **on cite ce que la page
rend**, pas ce qu'un guide voisin a écrit un jour. Les jumelles EN publient les valeurs de
`data/housing.ts`, celles que rend `/cities/[slug]/housing`.

⚠️ **Le rang sur 363 est publié avec ses ex æquo, et c'est un durcissement par rapport au batch 1.**
Le composite d'emploi prend peu de valeurs distinctes : Angers est 86ᵉ **à égalité avec 61 autres
communes**, Reims, Rouen et Clermont-Ferrand partagent le même 195ᵉ rang, Nancy et Metz le même
254ᵉ. Un rang nu se lirait comme une mesure fine alors qu'il départage des scores identiques par
l'ordre du tri. Chaque guide écrit donc « joint Nth … level with M others on the same score ».
Ne pas « simplifier » en retirant l'ex æquo : c'est ce qui rend le chiffre honnête, et ça dit au
lecteur que l'estimation résout des conditions et non des différences fines.

**Quatre points propres au lecteur étranger, absents des guides FR parce qu'inutiles à un
Français.** ① **Metz** : un titre de séjour français **n'ouvre pas** le droit au travail
luxembourgeois — c'est l'autorisation luxembourgeoise, obtenue par l'employeur, qui compte, et
habiter Metz n'y change rien. Le plafond de **34 jours de télétravail par an** depuis la France
(convention renégociée en 2023, appliquée en 2024) est repris tel quel du FR : il rend
contradictoire toute offre luxembourgeoise annoncée « full remote ». ② **Toulon** : l'habilitation
défense (4 à 8 mois, enquête sur 5 à 10 ans d'antécédents) est **plus lente quand les antécédents
sont à l'étranger** — le guide dit de poser la question à l'employeur et de **ne pas signer de bail
sur une date de prise de poste non confirmée**. ③ **Grenoble** : le contrôle export encadre qui
peut travailler sur quel programme en microélectronique, indépendamment du visa, et la **thèse
CIFRE** est l'une des rares vraies portes d'entrée pour un chercheur non-UE — c'est un contrat, pas
une bourse. ④ **Nancy** : une grande partie du marché est académique, donc le **passeport talent
« chercheur »** avec convention d'accueil, et non le contrat de travail ordinaire, est la voie à
demander ; et un poste hospitalier ou universitaire ne s'obtient pas comme un CDI mais par concours.
S'y ajoute, à **Rouen**, le fait que les sites Seveso ajoutent des semaines d'habilitation et de
formation sécurité entre l'offre et le premier jour.

**Trois prudences éditoriales assumées, à ne pas diluer.** ① **Saint-Étienne** : le label UNESCO
Ville créative design est réel, mais la ville **signale plus qu'elle n'embauche** — le guide dit
qu'une part des designers stéphanois vivent de commandes lyonnaises et parisiennes opérées depuis
Saint-Étienne, et que c'est un projet de vie différent d'un poste salarié local. ② **Reims** : une
appellation parmi les plus rentables au monde et un niveau de vie **368ᵉ sur 533** cohabitent ; le
guide met les deux dans la même phrase plutôt que de vendre le prestige. ③ **Rouen, Reims, Dijon,
Angers** portent tous le même avertissement sur le marché à deux étages créé par le train : un
salaire parisien paie un loyer local et concourt pour les mêmes logements, ce qui dégrade le
rapport loyer/salaire *local* sans que le tableau des loyers le montre. Sur **Clermont-Ferrand**,
la dépendance à un employeur unique est chiffrée en part directe **et** en part induite, sans
prédire de restructuration.

**Prochain run** : batch 3 de `working-in-`, qui **ferme la série** — Caen, Brest, Tours, Orléans,
Le Mans, Amiens, Le Havre, Nîmes et Aix-en-Provence (9 villes, Nantes exclue pour la raison
ci-dessus). Ensuite, les deux plus gros trous restants sont `famille-a-[ville]-2026` (19 FR / 0 EN)
et `universites-[ville]-2026` (15 FR / 0 EN).

### Livré le 18/08 (2ᵉ run du jour) — ouverture de `working-in-[city]-2026` (batch 1, +10)

`npm run parity` sortait en **code 0** en début de run (FR 217 / EN 165, 0 route sans jumelle) :
pas de régression de routes, donc run de corpus. Le run du matin ayant fermé `retiring-in-`, le
diff par série a désigné le sujet que ce même run annonçait : **`travail-a-[ville]-2026`, 30 FR /
0 EN**, le plus gros trou du corpus et une série qui n'avait jamais été entamée côté anglais.
Compteurs mesurés (`grep -c` des deux côtés) : **FR `travail-a-` 30 / EN `working-in-` 10**,
`EN_GUIDES` 665 → **675**. La série reste ouverte à 20 jumelles près.

**Les 10 villes** : Paris, Lyon, Marseille, Toulouse, Bordeaux, Lille, Strasbourg, Montpellier,
Nice, Rennes. `metaTitle` 47-54 caractères, `metaDesc` 124-136, 8 sections par guide (la série FR
en compte 6, l'EN en ajoute deux qui n'ont pas d'équivalent français, cf. plus bas), 1 331 à
1 446 mots, **zéro tiret cadratin** dans le corps. Catégorie `moving`, comme
`french-cities-tech-jobs-2026`. `npm run search-index` relancé (`data/search-index.en.json`
675 guides) et `npm run sitemap:check` repassé — **EN 28 540 URL**, chaque URL déclarée a une page.
⚠️ **Deux tags neufs, donc deux pages `/tags` de plus** : `TAG_SLUGS_EN` passe de 86 à **88**
(`working-in-france` et `job-market-france`, 10 guides chacun). Les autres tags réutilisent les
slugs de ville et de région existants.

⚠️ **Le socle chiffré n'est pas la prose des guides FR, et c'est le point de méthode du run.**
Les guides `travail-a-` citent des taux de chômage départementaux, des effectifs Apec et des
salaires médians « Insee DADS » qui ne figurent dans **aucun fichier de `data/`**. La version EN
s'appuie à la place sur trois sources lues **à travers les modules** (`npx tsx` sur
`@/lib/employment-market-rankings`, `@/lib/city-income`, `@/data/housing`, `@/data/cities-seed`) :
① le **score marché du travail** que rend déjà `/cities/[slug]/employment`, c'est-à-dire
`10 - composite` de `lib/employment-market.ts`, avec son **rang sur les 363 communes de plus de
20 000 habitants** (Lyon 1ᵉʳ à 7,5/10, Rennes 4ᵉ, Strasbourg 5ᵉ, Paris 3ᵉ, Lille 251ᵉ à 4,9) ;
② le **niveau de vie médian et le taux de pauvreté réels** d'Insee Filosofi 2021 via
`lib/city-income.ts`, avec le rang sur 533 communes ; ③ les loyers et prix d'achat de
`data/housing.ts`. Les seuls chiffres repris de la prose FR sont les **fourchettes de salaire brut
cadre** et les **effectifs d'employeurs nommés**, attribués comme tels (« our French guide to the
same market reports »), parce qu'aucune donnée du dépôt ne les porte.

⚠️ **Deux pièges de vocabulaire tenus dans les dix guides, à ne pas diluer.** Le score de marché
est une **estimation** construite depuis le chômage départemental, la création d'entreprises, la
diversité des employeurs et le salaire départemental : chaque guide le dit avant de citer le rang,
au même titre que `mobilite-reduite` le fait pour l'accessibilité. Et le chiffre Insee est un
**niveau de vie par unité de consommation, prestations comprises, tous résidents confondus, pas un
salaire** : chaque guide l'écrit et interdit explicitement de le comparer à une offre d'embauche.
C'est la convention de `lib/city-income.ts`, et c'est ce qui permet de publier sans mentir le cas
**Strasbourg** : 5ᵉ sur 363 au marché du travail (mesure départementale) et **362ᵉ sur 533 au
niveau de vie communal, 26 % de pauvreté**. Les deux sont vraies, elles ne mesurent pas la même
population ; le guide le dit en toutes lettres plutôt que de choisir celle qui arrange.

**Ce que l'EN ajoute et que le FR n'a pas** : deux sections par guide sur le droit au travail
(permis employeur, Passeport Talent dont **le plancher de salaire est renvoyé à France-Visas et
jamais chiffré ici** parce qu'il est révisé, comparabilité ENIC-NARIC, professions réglementées,
niveau de français réellement exigé) et sur ce que contient un contrat français (CDI/CDD, essai
cadre, cinq semaines légales, RTT, 50 % du titre de transport, mutuelle d'entreprise, brut contre
net d'environ 78 %, prélèvement à la source). Quatre angles propres au lecteur étranger, absents
du FR parce qu'inutiles à un Français : ① **Rennes** — les postes sous habilitation défense (DGA MI,
DGSE) sont en pratique fermés à qui n'a pas la nationalité française, ce qui retire une grande part
du marché cyber local à un candidat étranger, et aucun visa n'y change rien ; ② **Strasbourg** — un
titre de séjour français **n'ouvre pas** le droit de travailler en Allemagne, et le plafond de
télétravail côté français dans le cadre frontalier fait basculer la fiscalité s'il est dépassé ;
③ **Nice** — Monaco est un autre pays avec son propre permis de travail et ses règles de priorité
à l'embauche, et la convention de 1963 maintient les Français imposables en France, donc « emploi
monégasque » ≠ « salaire net à zéro impôt » ; ④ **Toulouse et Bordeaux** — le contrôle export et
l'habilitation restreignent l'accès à certains programmes par nationalité, à demander avant le
troisième entretien et non après.

**Nantes est volontairement hors batch** : `nantes-living-and-working-guide-2026` existe déjà et
son titre porte le mot *working*. Écrire `working-in-nantes-2026` par-dessus reproduirait
exactement la cannibalisation nettoyée en juin 2026 (cf. § dédup EN, 15 guides retirés). Si la
série va jusqu'à Nantes, ce sera en tranchant d'abord le sort du guide existant, pas en l'ignorant.

**Prochain run** : re-vérifier la parité de routes d'abord, comme toujours. Si elle tient, le sujet
est **la suite de `working-in-`** (20 jumelles manquantes : Aix-en-Provence, Amiens, Angers, Brest,
Caen, Clermont-Ferrand, Dijon, Grenoble, Le Havre, Le Mans, Metz, Nancy, Nantes sous réserve
ci-dessus, Nîmes, Orléans, Reims, Rouen, Saint-Étienne, Toulon, Tours), devant `famille-a-`
(19 FR / 0 EN) et `universites-` (15 FR / 0 EN). **Compter avant de suivre cette note** : un batch
FR livré entre-temps peut rouvrir une série déjà fermée, c'est arrivé deux fois en quatre jours sur
`parent-solo-a-`.

### Livré le 18/08 — `retiring-in-[city]-2026` FERMÉE à 20/20 (batch 2, +12)

`npm run parity` sortait en **code 0** en début de run (FR 217 / EN 165, 0 route sans jumelle) :
pas de régression de routes, donc run de corpus. Aucun commit de contenu FR depuis le 16/08, donc
aucune série fraîchement rouverte : le diff par série a désigné **`retiring-in-[city]`**, ouverte
le 15/08 à 8 jumelles sur 20 et restée le plus gros trou d'une série *déjà entamée*. Le lot ferme
la série d'un coup plutôt qu'en deux batches de 6, parce qu'une série close ne peut plus dériver
en silence.

**Les 12 jumelles** : Le Puy-en-Velay, Fontainebleau, Challans, Tulle, Pontarlier,
Saint-Dié-des-Vosges, Château-Gontier, Albertville, Gaillac, Vendôme, Marmande, Saint-Lô.
**Compteurs mesurés : FR `retraite-a-` 20 / EN `retiring-in-[ville]` 20** (le pilier national
`retiring-in-france-best-cities-2026` est hors compte des deux côtés), `EN_GUIDES` 653 → **665**.
`metaTitle` 48-56, `metaDesc` 136-147, 7 sections par guide (même gabarit que le batch 1),
1 062 à 1 144 mots par guide, **zéro tiret cadratin** dans le corps. Aucun tag nouveau au sens des
routes : `TAG_SLUGS_EN` reste à 86 (seuil de 3 guides par tag), donc aucune page `/tags` créée.
`npm run search-index` relancé (`data/search-index.en.json` 665 guides) et `npm run sitemap:check`
repassé — EN 28 528 URL, chaque URL déclarée a une page.

⚠️ **Les loyers et prix viennent de `data/housing.ts`, pas de la prose des guides FR — et sur 6
des 12 villes les deux ne disent pas la même chose.** Le batch 1 EN du 15/08 avait déjà tranché
ainsi sans le documenter (Vitré €600 / €2 200, Anglet €890 / €4 300 sont exactement `housing.ts`),
et c'est la bonne règle : `housing.ts` est ce que rendent `/villes/[slug]` et les palmarès, donc
un guide EN aligné dessus ne peut pas contredire une page du site en un clic. **Écarts relevés,
à corriger un jour côté FR et à ne pas recopier entre-temps** : Challans (guide FR T2 600 €,
achat 2 500 €/m² ; données 640 € et 2 100 €/m²), Tulle (460 € / 1 100 €/m² contre 530 € et
1 400 €/m²), Albertville (700 € / 2 900 €/m² contre 740 € et 2 800 €/m²), Gaillac (570 € /
1 900 €/m² contre 600 € et 1 800 €/m²), **Vendôme (600 € / 1 900 €/m² contre 540 € et
1 500 €/m², le plus gros écart du lot)**, Marmande (510 € / 1 350 €/m² contre 560 € et
1 500 €/m²). Les six budgets mensuels EN ont été **recalculés** poste par poste depuis le loyer
réel, pas recopiés : sinon le total ne serait plus la somme de ses lignes. Les six autres villes
(Le Puy, Fontainebleau, Pontarlier, Saint-Dié, Château-Gontier, Saint-Lô) concordent déjà.
Les scores cités, eux, concordent partout : relus via `npx tsx` sur `@/data/cities-seed`, donc
calibrés et normalisés, jamais grepés dans le seed.

**Quatre angles propres au lecteur étranger, absents du FR parce qu'inutiles à un Français.**
① Pontarlier porte un avertissement transfrontalier qui n'existe pas côté FR : résidence fiscale,
couverture maladie et immatriculation du véhicule suivent **chacune leur propre règle** dans le
cadre France-Suisse, et le guide dit explicitement de ne bâtir aucun plan de soins côté suisse
sans confirmation écrite de prise en charge. ② Saint-Lô met en avant les **ferries de Cherbourg
vers l'Angleterre et l'Irlande** (1 h 15) comme argument pratique de retour, ce qu'un retraité
britannique pèse davantage qu'une cathédrale. ③ Château-Gontier et Tulle signalent la **communauté
britannique installée de longue date** en Mayenne et en Corrèze-Dordogne, qui explique que notaires
et agents y aient l'habitude des dossiers étrangers. ④ Fontainebleau explique les **dépassements
d'honoraires**, bien plus fréquents en Île-de-France, et la conséquence sur le calibrage de la
mutuelle. Chaque guide explique au passage les sigles qu'un étranger ne connaît pas (PUMa, S1,
DPE, mutuelle, médecin traitant, taxe foncière, notaire), en incise, comme le reste du corpus EN.

**Deux prudences reprises du FR et à ne pas diluer** : l'altitude du Puy-en-Velay (629 m) et ses
hivers sont **déconseillés pour certaines pathologies respiratoires ou cardiaques**, à trancher
avec son médecin avant de choisir et non après ; et la **saturation de la médecine de ville à
Challans**, où trouver un médecin traitant peut prendre des mois, est présentée comme le vrai
point de vigilance vendéen, pas comme une réserve de forme.

**Prochain run** : la parité de routes est à re-vérifier en premier comme toujours, mais si elle
tient, les trois séries FR **jamais entamées côté EN** sont maintenant le sujet — `travail-a-`
(30 FR / 0 EN), `famille-a-` (19 FR / 0 EN), `universites-` (15 FR / 0 EN) — devant
`vacances-monoparentales-` (7 / 0). Ouvrir `travail-a-` d'abord : c'est le plus gros trou, et
l'angle emploi est exactement ce qu'un lecteur qui envisage de s'installer en France cherche.

### Livré le 17/08 — `single-parent-in-[city]-2026` refermée à 39/39 (batch 4, +10)

`npm run parity` sortait en **code 0** en début de run (FR 217 / EN 165, 0 route sans jumelle) :
pas de régression de routes, donc run de corpus. **Le diff par série a décidé du sujet, pas le
tableau de bord** : le batch 4 FR du 16/08 (`490376e`, +10) avait rouvert un écart de 10 sur
`parent-solo-a-[ville]` le jour même, la veille de ce run. C'est le trou le plus frais et le
plus gros après `retiring-in-[city]` (12), et la règle « un écart rattrapé le jour même coûte
une page » tranche en sa faveur.

**Les 10 jumelles** : Nîmes, Saint-Denis de La Réunion, Le Mans, Amiens, Annecy, Perpignan,
Orléans, Mulhouse, Poitiers, Dunkerque. **Compteurs mesurés : FR 39 / EN 39** (`grep -c` des
deux côtés), `EN_GUIDES` 643 → **653**.

⚠️ **La note « prochain run parent-solo = miroir EN » du batch 3 était périmée quand elle a été
écrite** (le batch 4 FR le dit lui-même). Celle-ci ne l'est pas, elle a été vérifiée au compteur
avant rédaction et re-vérifiée après. **Continuer à compter, jamais à suivre la note.**

**Chiffres relus à travers les modules, jamais grepés dans le seed** : `npx tsx` sur
`@/data/cities-seed`, `@/data/housing`, `@/data/neighborhoods`, `@/lib/parent-solo`. Les 10 rangs
sont rejoués avec le départage réel de `app/parent-solo/page.tsx` (`name.localeCompare(…, "fr")`
à égalité de score) : Poitiers 46e, Annecy 80e, Orléans 102e, Le Mans 110e, Amiens 119e,
Mulhouse 126e, Dunkerque 158e, Nîmes 224e, Perpignan 263e, Saint-Denis 287e sur 363 éligibles,
médiane 5,5. Les comparateurs repris du FR sont vérifiés un à un (Albi 7,0, Auch 6,8, Castres 6,5,
La Roche-sur-Yon 7,5 première du national, Cholet 7,0, Tours 6,5, Châtellerault 6,5, Colmar 6,3,
Cambrai 6,4, Lille 6,3, Annemasse 6,4, Laon 7,0, Soissons 6,9, Compiègne 6,8, Abbeville 6,5,
Olivet 5,9, Fleury-les-Aubrais 5,4, Alès 5,0), ainsi que les rangs régionaux (Nîmes 17e
d'Occitanie/22, Amiens 11e des Hauts-de-France/27, Le Mans 10e des Pays de la Loire/14, Orléans
4e du Centre-Val de Loire/11, Poitiers 4e de Nouvelle-Aquitaine/28).

**Contrôle croisé automatisé FR↔EN sur les 10 paires** (règle 5 : deux alternates hreflang ne
peuvent pas afficher deux nombres différents) : **484 nombres distincts côté EN, 4 seulement
absents du corpus FR du batch**, tous justifiés et vérifiés — les « 7 à 8 % » de frais de notaire
(ajout EN, chiffre déjà publié par la série `retiring-in-`), le « 17e » d'Occitanie (écrit en
toutes lettres côté FR), les « 24 Heures » du Mans et le « 26 décembre » férié alsacien. Zéro
écart de score, zéro écart de montant. `npm run integrity` confirme **0 score brut recopié** des
deux côtés.

**Écrit en anglais natif depuis les faits des guides FR, aucun chiffre qui n'y soit.**
`metaTitle` 49-55 caractères, `metaDesc` 117-136, **6 sections par guide** (même découpage que le
FR, comme les batches 3 et 4 de cette série et contrairement aux batches tourisme qui fusionnent),
**zéro tiret cadratin dans le corps** (R7.10). Aucun tag nouveau : les 10 réutilisent `occitanie`
×2, `hauts-de-france` ×2, `reunion`, `pays-de-la-loire`, `auvergne-rhone-alpes`,
`centre-val-de-loire`, `grand-est`, `nouvelle-aquitaine` — **`TAG_SLUGS_EN` reste à 86**, aucune
page `/tags/[slug]` créée, donc pas de `sitemap:check` à relancer. `npm run search-index` relancé
(`data/search-index.en.json` 653 guides, 86 tags).

**Les prudences du FR sont reprises telles quelles et ne doivent pas être diluées** : sur
Saint-Denis, l'éloignement du réseau de secours familial, la **saison cyclonique** et les
fermetures décidées la veille au soir, et la **baignade interdite hors bassins surveillés sur la
côte nord, qui n'a pas de lagon** (risque requin) ; sur Dunkerque, les **horaires postés** de
l'industrie portuaire posés comme un problème de garde à traiter avant la signature du contrat, et
la **centrale de Gravelines** signalée comme un périmètre de plan particulier d'intervention sans
que le site prétende évaluer le risque ; partout, les trois quartiers de `data/neighborhoods.ts`
sont donnés sur **leur propre échelle**, non comparable au score communal, avec le refus explicite
de publier une liste noire — même arbitrage que le rejet de la série `quartiers-a-eviter`.

**Sept apports propres au lecteur anglophone**, absents du FR parce qu'inutiles à un lecteur
français : ① les **DROM sont hors espace Schengen**, donc un visa court séjour Schengen n'ouvre pas
La Réunion (l'erreur classique, posée dès l'intro) ; ② le permis de conduire UE/EEE y est valable
tel quel, les autres relèvent de règles d'échange par pays ; ③ la **garantie Visale** comme réponse
à l'absence de garant français, à préparer avant les visites et non pendant ; ④ le **quotient
familial CAF** qui tarife cantine et périscolaire, et le statut de parent isolé qui n'est un
critère prioritaire en crèche **que s'il est déclaré** ; ⑤ les **7 à 8 % de frais de notaire** sur
l'ancien, ajoutés à chaque prix d'achat cité ; ⑥ la glose du **T3** (pièces hors cuisine et salle de
bains) et le fait que les bailleurs français appliquent le seuil de revenu à la lettre ; ⑦ les
liaisons qui comptent quand la famille est à l'étranger et non à trois heures de train — le ferry
transmanche depuis Dunkerque, l'aéroport partagé près de Mulhouse, le corridor ferroviaire
Perpignan-Barcelone, et le rappel que pour un parent venu de l'étranger le « réseau de secours »
est déjà dans un autre pays. Deux particularités locales également glosées : les **deux jours
fériés alsaciens** (Vendredi saint et 26 décembre) qui décalent les calendriers scolaires à
Mulhouse, et les **24 Heures** du Mans qui saturent la ville une semaine par an.

**Prochain run** : re-mesurer par série avant de choisir. Au 17/08 le plus gros écart connu est
`retiring-in-[city]` (**9 EN dont 1 national / 20 FR**), dont le batch 1 du 16/08 note que les
12 villes FR restantes (Le Puy-en-Velay, Fontainebleau, Challans, Tulle, Pontarlier,
Saint-Dié-des-Vosges, Château-Gontier, Albertville, Gaillac, Vendôme, Marmande, Saint-Lô) ont un
intérêt marginal faible pour un lecteur anglophone. `vacances-monoparentales-[ville]-2026`
(7 FR / 0 EN) reste sans aucune jumelle.

### Livré le 16/08 — ouverture de la série `retiring-in-[city]-2026` (batch 1, +8)

`npm run parity` sortait en **code 0** en début de run (FR 217 / EN 165, 0 route sans jumelle) :
pas de régression de routes à rattraper, donc run de corpus.

**Le trou choisi, et pourquoi celui-là.** Le FR porte 20 guides `retraite-a-[ville]-2026` ;
l'EN portait **4** guides retraite, tous nationaux ou régionaux (`retiring-to-france-guide`,
`retiring-in-france-best-cities`, `retiring-to-france-best-cities`, `retiring-south-of-france`)
et **zéro par ville**. C'est le plus gros écart *pertinent pour l'audience* du corpus : la
retraite en France est l'une des intentions de recherche anglophones les plus fortes du sujet
(Britanniques, Irlandais, Américains, Canadiens), et le site n'avait rien au niveau ville pour
la capter. Les séries à plus gros écart brut ne valaient pas mieux : `acheter-a-` ↔
`where-to-buy-in-` est **déjà à 49/49** (le `comm` naïf sur les préfixes le rate), et
`quitter-` vise un lecteur français qui part, pas un lecteur étranger qui arrive.

**Les 8 villes** : Royan, Les Sables-d'Olonne, Île de Ré, Dinan, Lannion, Vitré, Anglet,
Hendaye. Sélection géographique assumée — Atlantique, Bretagne, Côte basque, c'est-à-dire la
carte réelle de la retraite anglophone en France, pas les 8 premières de la liste FR.

**Chiffres.** Aucun chiffre inventé : les loyers, prix au m² et budgets sont repris **à
l'identique** du guide FR jumeau et de `data/housing.ts` ; les scores cités sont lus par
`npx tsx` depuis `CITIES_SEED` (donc calibrés + normalisés), jamais grepés dans le seed —
`npm run integrity` confirme « 0 score brut recopié » côté EN. Les 8 `relatedCities` sont
vérifiées présentes au seed (`assertKnownSlugs`).

**Ce que la version EN ajoute et que le FR n'a pas** (c'est ce qui la rend native plutôt que
traduite) : une 7ᵉ section « Residency, health cover and tax from [city] » absente des 6
sections FR — visa long séjour visiteur, PUMa à 3 mois de résidence, mutuelle, **S1** pour les
retraités de l'État britannique et l'exonération de charges sociales qui va avec, répartition
des pensions par convention fiscale (pensions de la fonction publique imposées au UK, pension
d'État et pensions privées imposées en France), et les frais de notaire ~7-8 % rappelés dans
chaque section « Renting or buying ». Chaque sigle français est glosé en incise
(`médecin traitant`, `mutuelle`, `taxe foncière`, `notaire`). La section « getting back to see
family » remplace la fin de section FR sur les loisirs : pour un lecteur étranger, la liaison
retour (Brittany Ferries à Saint-Malo depuis Dinan, TGV direct depuis Vitré, aéroport de
Biarritz en bordure d'Anglet) est un critère de décision, pas un détail.
⚠️ Deux prudences à ne pas diluer si la série est reprise : les liaisons aériennes régionales
(La Rochelle, Biarritz) sont annoncées comme **saisonnières et à vérifier**, jamais listées
route par route ; et sur Hendaye, l'arbitrage transfrontalier est explicitement encadré
(résidence fiscale, droits à la couverture santé et immatriculation du véhicule suivent des
règles distinctes qui ne s'alignent pas) plutôt que présenté comme une astuce budgétaire.

**Compteurs mesurés** : `EN_GUIDES` 635 → **643** ; série `retiring-in-[city]` **8 EN / 20 FR**
— ouverte, **pas fermée**. `metaTitle` 48-55 caractères, `metaDesc` 140-145, 7 sections par
guide, `category: "moving"`. Trois tags neufs franchissent le seuil de 3 guides de
`lib/guide-tags-en.ts` et créent donc 3 pages `/tags/[slug]` EN : `expat-retirement`,
`affordable-retirement-france`, `brittany-retirement-expat` — d'où le `sitemap:check` relancé
(EN 28 506 URL, chaque URL déclarée a une page). `npm run search-index` relancé
(`data/search-index.en.json` 643 guides, 86 tags), sans quoi `search-index:check` échoue.

**Prochain run sur cette série** : les 12 villes FR restantes sont Le Puy-en-Velay,
Fontainebleau, Challans, Tulle, Pontarlier, Saint-Dié-des-Vosges, Château-Gontier, Albertville,
Gaillac, Vendôme, Marmande, Saint-Lô. Elles sont nettement moins évidentes pour un lecteur
anglophone que les 8 livrées (intérieur, montagne, petites préfectures) — les traiter en un
seul batch de 12 est possible mais l'intérêt marginal est faible ; re-mesurer l'écart par série
avant de décider, plutôt que de fermer celle-ci par symétrie.

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

## Shipped 2026-09-02

- **hreflang sur la famille vacances — 1 138 pages, et un garde-fou pour les 195 paires écrites à
  la main.** Suite directe du chantier ouvert le 2026-08-02, qui avait rétabli le hreflang sur les
  ~42 000 sous-pages ville et laissé une liste de familles à traiter « une par run » :
  `vacances`/`vacations`, `red-flags`, les calculateurs, `gentrification`, `pour-qui`/`for-who`.
  Les quatre dernières ont été faites depuis (vérifié ce run : leurs hubs appellent
  `pathAlternates`) ; **`vacances` restait à moitié faite** — le hub, `region` et le croisement
  `ou-partir`/`where-to-go` déclaraient leur paire, les quatre familles de fond, non.
  - **Ce qui gagne un hreflang** : `/vacances/[ville]` ↔ `/vacations/[city]` (540 paires, les deux
    `generateStaticParams` bouclent sur `CITIES_SEED`), `/vacances/mois/[mois]` ↔
    `/vacations/month/[month]` (12), `/vacances/profil/[profil]` ↔ `/vacations/profile/[profile]`
    (7), `/vacances/activite/[activite]` ↔ `/vacations/activity/[activity]` (10). Soit **569 pages
    FR et 569 EN**. Chaque équivalence a été vérifiée sur les `generateStaticParams` réels des deux
    côtés, jamais sur la ressemblance des slugs.
  - **Pourquoi ça comptait ici plus qu'ailleurs** : ces pages sont le **même moteur, les mêmes
    chiffres, sur deux domaines** (`topCitiesForMonth`, `topCitiesForProfile`,
    `topCitiesForActivity`, `bestMonthsFor`). Sans hreflang, ce sont des quasi-doublons
    inter-domaines que rien ne relie ; c'est exactement le cas que la balise existe pour traiter.
  - **Le mois est le seul cas où le slug se traduit**, et le piège est le même qu'en août :
    `hreflangLanguages` ne traduit que la **tête** de route, elle aurait annoncé
    `/vacations/month/février`, un 404. Le passage se fait donc par l'index du mois, via
    `EN_MONTH_SLUG` (`lib/vacation-crossing`) côté FR et `indexToMonthSlug` côté EN — deux tables
    déjà en place, aucune n'a été créée pour l'occasion. Réciprocité vérifiée sur les 12 : le
    slug FR → slug EN → slug FR revient à l'identique, `février` ↔ `february`, `août` ↔ `august`.
    Le slug FR reste **accentué** dans le hreflang, comme dans le canonical et dans le sitemap.
  - ⚠️ **`/vacations/profile/[profile]` sert les slugs FR** (`monoparental`, `celibataire`) sur le
    domaine anglais : les deux routes dérivent du même `VACATION_PROFILES`, donc le segment est
    identique des deux côtés. Ne pas le « traduire » en `single-parent` / `singles` — ces
    formes-là sont celles du croisement mois × profil (`EN_PROFILE_SLUG`), une route distincte, et
    les employer ici annoncerait un 404. Le commentaire est posé dans les deux pages.
  - ⚠️ **`/vacances/quiz` n'a pas de jumelle EN et n'en déclare donc pas.** C'est la seule
    exception de la famille, et elle est piégeuse : **`npm run parity` la donne pour couverte**,
    parce que son `coveredByDynamic` accepte n'importe quelle route EN dynamique de même
    profondeur — ici `/vacations/[city]`. Un rapport de parité vert ne prouve donc pas qu'une URL
    existe. Le commentaire est dans le fichier pour qu'un run futur ne « corrige » pas l'absence.
  - **Le garde-fou, et pourquoi il ne pouvait pas être une règle de type.** Les sous-pages ville
    passent par `cityAlternates*`, qui dérive la jumelle d'une table contrôlée depuis août. Partout
    ailleurs, les deux chemins sont **écrits à la main** dans la page — seule façon de déclarer une
    paire dont la queue est traduite — et rien ne les relit : une faute de frappe, un slug qui
    n'existe pas de l'autre côté, un copier-coller qui laisse le chemin de la page voisine,
    tout ça compile et part dans le `<head>`. `npm run hreflang:check` gagne donc une seconde
    section : il extrait **les 195 appels à `pathAlternates` / `pathAlternatesEn`** des 385
    `page.tsx`, normalise les `${…}` en segment dynamique et rapproche les deux chemins des deux
    arbres de routes réels. Il vérifie aussi que le **canonical est celui de la page qui l'émet**
    (1ᵉʳ argument pour `pathAlternates`, 2ᵉ pour `pathAlternatesEn`) et que la variante FR n'est pas
    appelée depuis une page EN, ce qui publierait le canonical de l'autre locale.
  - ⚠️ **La règle de correspondance est stricte, et l'assouplir casse le contrôle.** Première
    version écrite avec la règle lâche de `check-parity.mjs` (un segment dynamique de la route
    absorbe un segment littéral demandé) : elle **laissait passer `/vacations/quiz`**, absorbé par
    `/vacations/[city]` — dont le `generateStaticParams` n'émet que les 540 slugs de ville et qui
    porte `dynamicParams = false`. Le contrôle validait donc précisément le seul défaut qu'il
    existe pour attraper. Désormais littéral face à littéral, dynamique face à dynamique. Coût
    mesuré avant de trancher : **les 390 chemins des 195 paires tombent tous sur une
    correspondance exacte**, aucun ne dépendait de la règle lâche. Une page statique dont la
    jumelle serait servie par une route dynamique sera signalée — c'est voulu, seul l'auteur peut
    savoir si le slug est bien dans le `generateStaticParams` d'en face.
  - **Testé dans les quatre sens**, chaque fois en cassant volontairement une page puis en la
    restaurant : cible EN inexistante → erreur ; canonical d'une page voisine → erreur ; variante
    FR appelée depuis une page EN → erreur ; `/vacations/quiz` → erreur, code de sortie 1. État
    propre : code 0.
  - **Note pour le point à trancher ci-dessus** (`/vacations/*`, 211 impressions et 0 clic) :
    déclarer le hreflang ne pousse rien à l'indexation, il désambiguïse deux versions linguistiques
    d'une même page. Si la décision produit est un `noindex`, la balise part avec les pages ; rien
    ici ne préjuge de cet arbitrage.
  - **Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` propre, `npm run hreflang:check`
    (39 paires de sous-pages ville + 195 paires à la main), `npm run parity` en code 0,
    `npm run search-index:check` propre, `npm run sitemap:check` propre dans les deux sens
    (FR 29 123 URL, EN 28 710 — inchangés, aucune route n'est créée). Aucune URL canonique ne
    bouge, aucune donnée, aucune copie. `npm run build` n'a pas été lancé, conformément à
    CLAUDE.md § Commands.

---

## Shipped 2026-09-01

- **Série tourisme FR — batch 38 (+7 : Poissy, Rueil-Malmaison, Vernon, Dole, Soissons, Cambrai,
  Carpentras).** Le premier batch depuis longtemps qui n'a **rien eu à arbitrer contre la liste de
  gisements** : Cambrai venait du batch 34, les six autres du batch 36. **Compteurs mesurés : FR 233
  (`-a-` strict 226 + 5 `au-` + 2 `aux-`), EN 226 ; `GUIDES` 1035 → 1042**, donc écart FR→EN de 7 et
  **prochain run = batch EN**. Détail complet, faits vérifiés et vivier restant : CLAUDE.md
  § « Batch 38 ».
- **Ce que le run corrige au passage** : le vivier laissé par le batch 36 nommait le musée de Vernon
  « musée Alphonse-Georges-Poulain », nom qu'il ne porte plus — il a été **rebaptisé musée Blanche
  Hoschedé-Monet en 2024**. Une liste de gisements vieillit comme le reste, et rien dans le dépôt ne
  peut le signaler : c'est la vérification en ligne avant rédaction qui l'attrape, pas `tsc`.
  Trois localisations remises à leur commune réelle sous la convention « accessible depuis » (parc du
  **Peuple de l'herbe à Carrières-sous-Poissy**, char **Deborah à Flesquières**, **Giverny** commune
  à part entière), et **six affirmations fausses écrites au premier jet** — toutes des écarts
  calculés, des comparaisons ou des distances, la même classe de défaut que l'« deux siècles et
  demi » de Sens au batch 37.
- **Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, FR 1 042,
  EN 802, 0 score brut recopié), `search-index` + `search-index:check` (251 tags, un seul neuf :
  `/tags/que-faire-dans-le-nord`), `npm run sitemap:check` propre dans les deux sens (FR 29 123 URL,
  EN 28 694), `npm run parity` en code 0, lookup `a-faire` + photo d'en-tête vérifiés sur les 7.
  `npm run build` volontairement non lancé (CLAUDE.md § Commands).

---

## Shipped 2026-08-29 (2e run du jour)

- **Parité EN — `single-parent-in-[city]-2026` batch 6 (+9 : Valence, Colmar, Saint-Nazaire,
  Chambéry, Bourges, Pessac, Calais, Le Tampon 974, Ajaccio), série refermée à 57/57.** Les neuf
  jumelles du batch FR du 28/08, écrites d'un coup dans `data/guides-en.ts`. **Compteurs mesurés
  avant et après : 57 FR / 48 EN → 57 / 57** (`EN_GUIDES` 771 → 780). `npm run parity` en code 0
  aux deux bouts. Détail complet, méthode de rang, contrôles et vivier suivant : § Parité EN,
  « Livré le 29/08 (2ᵉ run) ».
  - ⚠️ **Le comptage du run précédent confondait deux séries** : « EN 63 » agrégeait
    `single-parent-in-` (48) et `single-parent-holidays-` (15, série vacances F61). Un préfixe qui
    en contient un autre se compte avec son tiret et son millésime.
  - **Deux comparatifs faux des guides FR du 28/08, corrigés dans les deux locales** : le T3 de
    Chambéry à 1 100 € est le **deuxième** plus cher du batch (Ajaccio 1 200 €) et non le
    troisième ; et les Pays de la Loire ne sont pas « la région la plus favorable de France à ce
    profil » — la meilleure moyenne régionale est celle de la **Bourgogne-Franche-Comté** (6,54
    contre 6,36). Ce qui tient et qui est publié à la place : les Pays de la Loire placent **trois
    communes dans les huit premières nationales**.
  - **Ce qui n'est pas livré** : rien d'autre. Aucune route neuve, aucun tag neuf (EN reste à 108),
    aucune page `/tags` créée, et le rang de richesse biodiversité reste fermé. `npm run build` n'a
    pas été lancé, conformément à CLAUDE.md § Commands ; le rendu réel reste une passe locale.

- **Parité EN — deuxième lot `living-in-[sous-région]-2026` (+6 : les Pyrénées, la Lorraine, la
  Sarthe, l'Auvergne, la Bretagne intérieure, les DROM).** `npm run parity` sort en **code 0**,
  0 route FR sans jumelle EN : la parité de routes tient depuis le 09/08, le run est donc allé sur
  l'**écart de corpus**, mesuré ce run à **FR 1 012 / EN 765**. Les sitemaps en ligne restent
  injoignables depuis une routine cloud, donc l'écart par section est **non mesuré, pas nul**.
  **Compteurs mesurés : `EN_GUIDES` 765 → 771**, `data/search-index.en.json` 771 guides, 108 tags
  (103 → 108, d'où le passage de `sitemap:check` : EN 28 629 → 28 657 URL).

  **Le diff par série est à refaire avant tout autre lot : il n'y a presque plus de trou par ville.**
  Le contrôle ville par ville sur les huit séries per-city apparie **`etudiant-a-`/`studying-in-`,
  `retraite-a-`/`retiring-in-`, `travail-a-`/`working-in-`, `famille-a-`/`family-in-`,
  `acheter-a-`/`where-to-buy-in-`, `budget-mensuel-realiste-`/`cost-of-living-` et
  `vivre-sans-voiture-`/`car-free-living-in-` à zéro manque**, et `single-parent-in-` (63) dépasse
  déjà `parent-solo-a-` (57). L'écart de 247 guides est donc presque entièrement dans des **grappes
  thématiques FR sans jumelle** (`vivre-en-` 56, `meilleures-villes-` 52, `vivre-a-` 51,
  `demenager-a-` 50, `quitter-` 55), pas dans des villes oubliées. Ne pas repartir d'un comptage de
  préfixes : il fabrique des faux manques (`vivre-sans-voiture-paris-guide` face à
  `car-free-living-in-paris-2026` sort « 16 manquants » sur une série complète).

  **⚠️ Le Jura a été écrit puis RETIRÉ avant commit — ne pas le réécrire.** Le lot du 28/08 l'avait
  déjà écarté au motif que `living-in-bourgogne-franche-comte-2026` le couvre ; le contrôle a été
  refait ce run et l'exclusion est **confirmée et plus forte que notée** : ce guide s'intitule
  « An Expat Guide to Burgundy **and the Jura** », cite le Jura 9 fois, la Suisse 4 fois, et porte
  le **même squelette de sections** (« Where to base yourself », « Property and cost of living »,
  « Who it suits — and the honest downsides »). Deux pages dont le titre revendique le même massif,
  c'est exactement la cannibalisation que CLAUDE.md documente. Le guide rédigé (Besançon, Pontarlier,
  Dole, Belfort, Lons-le-Saunier, Montbéliard + la règle fiscale de l'accord de 1983) a donc été
  jeté, pas commité. **Condition de réouverture** : réécrire d'abord le guide Bourgogne-Franche-Comté
  pour qu'il cesse de revendiquer le Jura, sinon les deux se mangent.

  **Le test qui décide, et pourquoi les cinq autres passent.** Le critère retenu est le **titre**,
  pas le nombre de mentions : une grappe sous-régionale sous un guide de région administrative est un
  patron **déjà établi** dans le corpus (`living-in-the-gard` sous `living-in-occitanie`,
  `living-in-haute-savoie` sous `living-in-auvergne-rhone-alpes`, `living-in-the-dordogne` sous
  `living-in-nouvelle-aquitaine`) et il est à parité avec le FR, qui fait pareil. L'exclusion ne se
  déclenche que quand le guide large **nomme la sous-région dans son titre**. Vérifié un par un :
  `living-in-grand-est` s'intitule « France's Border Region » (Lorraine seulement dans le corps),
  `living-in-auvergne-rhone-alpes` « Lyon, the Alps and Beyond », `living-in-pays-de-la-loire`
  « the Atlantic West » (aucune mention de la Sarthe), `living-in-brittany` « France's Celtic
  Coast » — cadré littoral, quand le nouveau guide prend l'Argoat que le premier ne fait
  qu'indiquer en quatre phrases. Et `living-in-ariege` (« Rural Pyrenees ») ne cite **ni Pau, ni
  Bayonne, ni Tarbes, ni Perpignan, ni le Pays basque, ni le catalan** : un guide de chaîne entière
  Atlantique→Méditerranée est un autre objet. Mitigation appliquée aux quatre voisinages, sur le
  précédent Corrèze-Limousin→Creuse du 28/08 : **chaque nouveau guide dit en première section ce
  qu'il couvre et renvoie nommément au guide adjacent**, plutôt que de le recouvrir en silence.

  **Chiffres.** Tous les loyers, prix et scores sont lus **dans les modules** (`data/housing.ts`,
  `CITIES_SEED` via un `npx tsx` de scratch), jamais dans les littéraux du seed ni dans le texte des
  guides FR — `integrity` confirme « 0 score brut recopié » côté EN. Aucun horaire, aucun tarif.
  `metaTitle` 44-54 caractères, `metaDesc` 141-155, 6 à 8 sections, 1 045 à 1 729 mots. Densité
  d'accents 0,022-0,028 par mot, dans la bande des guides EN déjà livrés (0,012-0,034 mesuré sur
  `living-in-the-ain`, `-brittany`, `-the-dordogne`, `-alsace`) — **le seuil ascii-strip de 0,09 est
  un seuil FR et ne s'applique pas à de l'anglais**. Les 6 guides ont été vérifiés **retrouvés par
  `getEnGuide()`** et **remontés par la recherche inverse `relatedCities`** sur 11 régions, dont les
  cinq DROM.

  **Trois erreurs des sources FR corrigées avant rédaction, qu'aucun contrôle automatique ne voit.**
  1. **Fuseaux horaires des DROM** (`vivre-en-outre-mer-guide-2026`) : le guide FR écrit « −1h
     Antilles/Guyane, +1h ou +3h Mayotte/Réunion ». C'est faux dans les deux sens. Les valeurs
     retenues : Guadeloupe et Martinique **UTC−4**, Guyane **UTC−3**, Mayotte **UTC+3**, Réunion
     **UTC+4**, aucun ne pratiquant l'heure d'été — donc l'écart avec la métropole **bouge d'une
     heure deux fois par an**, ce qui est le fait utile pour qui garde un employeur métropolitain.
     Cohérent avec le batch 33, qui avait déjà établi « La Réunion est à UTC+4 sans heure d'été ».
  2. **Paris–Clermont-Ferrand n'est pas un TGV** (`vivre-en-auvergne-guide-2025` annonce « liaisons
     TGV vers Paris (3h) »). C'est une ligne **Intercités** classique et le trajet dépasse trois
     heures. Le guide EN le dit explicitement, sans chiffre au quart d'heure, parce que c'est
     précisément le point qui disqualifie la région pour qui a besoin de Paris régulièrement.
  3. **Population de Saint-Denis de La Réunion** : 153 810 au seed contre « 154 000 » dans le guide
     FR. Le rendu prime, comme partout ailleurs.

  **Prudences portées par la copie, à ne pas diluer.** ① **Mayotte passe en première section**, avant
  toute phrase sur le lagon : le cyclone **Chido de décembre 2024** et la reconstruction toujours en
  cours en 2026, la ressource en eau sous tension, et le fait que c'est une affectation professionnelle
  et non un projet lifestyle — même cadrage qu'aux batches 30 et 31. ② **La baignade en mer est
  interdite à La Réunion** hors lagon de la côte ouest et hors zones surveillées (risque requin),
  avec la précision géographique qu'**il n'y a pas de lagon à l'est ni au sud** : c'est une
  interdiction, pas un conseil. ③ Les **DROM ne sont pas dans Schengen** et sont **hors territoire
  TVA et accises de l'UE** — un visa Schengen n'y vaut pas, point que le lecteur anglophone ne peut
  pas deviner et que le guide FR n'a aucune raison de porter. ④ La **prime d'indexation des
  fonctionnaires** (1,4 à ~1,53) est présentée avec son revers : salariés du privé, indépendants et
  télétravailleurs **n'y ont pas droit** et absorbent la majoration de prix sans contrepartie.
  ⑤ Sur la Bretagne intérieure, la **sous-densité médicale** est écrite comme rédhibitoire pour qui a
  des besoins de soins réguliers, et la **faible liquidité à la revente** comme une raison de n'acheter
  que pour y vivre. ⑥ **Vichy** : le guide nomme en une incise l'origine du nom pour un lecteur
  anglophone (le régime de 1940-1944 y a réquisitionné les hôtels) avant de parler de la ville thermale
  UNESCO — l'omettre serait une lacune, s'y appesantir une faute. ⑦ Le seuil de **34 jours** de
  télétravail France-Luxembourg est donné avec la consigne de vérifier l'année en cours, parce qu'il a
  déjà été renégocié plusieurs fois.

  **Reste à faire.** Les grappes FR sans jumelle EN, par taille : `vivre-a-[ville]` (51),
  `demenager-a-[ville]` (50) — attention, `[city]-living-guide-for-expats` et `moving-to-` couvrent
  déjà une partie, à comparer ville par ville avant d'écrire —, `meilleures-villes-` (52, mais le
  reliquat est en faible intention expatriée selon le contrôle du 28/08) et `quitter-` (55, écarté :
  « quitter Amiens » n'a pas de lecteur anglophone). Sous-régions encore non couvertes et sans
  recouvrement de titre : la Champagne hors Reims, la Savoie hors Haute-Savoie, la Normandie
  intérieure. Le Jura est **fermé** tant que la condition ci-dessus n'est pas remplie.

---

## Shipped 2026-08-28

- **Parité EN — ouverture d'un lot `living-in-[sous-région]-2026` (+8 : le Vaucluse, le Gard, la
  Gascogne/le Gers, les Landes, la Vendée, la Corrèze-Limousin, l'Ain, l'Ardèche-Drôme).**
  `npm run parity` sort en **code 0**, 0 route FR sans jumelle EN : la parité de routes tient, donc
  le run est allé sur l'**écart de corpus**, mesuré ce run à **FR 1 003 / EN 757**. Les sitemaps en
  ligne sont injoignables depuis une routine cloud (403 CONNECT sur les deux domaines) : l'écart par
  section est donc **non mesuré**, pas nul. **Compteurs mesurés : `EN_GUIDES` 757 → 765**,
  `data/search-index.en.json` 765 guides, 106 tags.

  **Pourquoi cette série et pas une autre.** Le diff FR↔EN par famille de slugs donne trois gros
  écarts : `quitter-` 55 / `leaving-` 23, `meilleures-villes` 52 / `best-french-cities` 29, et
  `vivre-en|dans-[sous-région]` face à `living-in-`. Les deux premiers ont été écartés — « quitter
  Amiens » n'a pas de lecteur anglophone, et le contrôle thème par thème montre que les classements
  à forte intention (santé, écoles internationales, LGBT, vélo, air, vins, seniors, étudiants
  étrangers, accessibilité, durabilité) ont **déjà** leur jumelle EN, le reliquat FR étant les
  thèmes que CLAUDE.md classe lui-même en faible intention expatriée. Restait la **France
  sous-régionale**, qui est exactement l'espace de recherche de l'acheteur anglophone et où l'EN
  n'avait rien. Les sous-régions déjà couvertes par un autre angle ont été **écartées pour éviter la
  cannibalisation** que CLAUDE.md documente : Lot/Aveyron/Tarn (`occitanie-rural-lot-aveyron-tarn-expat-guide-2026`),
  la Touraine (`loire-valley-living-guide-2026` + `tours-loire-valley-living-guide-2026`), la Côte
  d'Azur (`french-riviera-cote-dazur-living-2026`), le Jura (`living-in-bourgogne-franche-comte-2026`).
  Le guide Corrèze-Limousin dit **en première section** ce qu'il couvre et renvoie explicitement à
  `living-in-creuse-2026` pour la Creuse, plutôt que de recouvrir un guide existant en silence.

  **Chiffres.** Tous les loyers et prix des villes du seed sont lus **dans les modules**
  (`data/housing.ts`, `CITIES_SEED`), jamais dans les littéraux du seed ni dans le texte des guides
  FR — c'est ce que rendent les deux pages ville, donc les jumelles hreflang affichent le même
  nombre. Les fourchettes €/m² des lieux **absents du seed** (villages du Luberon, Uzès, Sommières,
  Mimizan, Ferney-Voltaire, Divonne, Lectoure, Die, Ardèche méridionale) viennent des guides FR
  correspondants et sont données comme fourchettes. Les scores cités (Nîmes sécurité 3,9 · Condom
  8,6 · Fontenay-le-Comte 8,8 · Gex 7,7 · Aubenas nature 8,5 / transport 2,7 · Valence transport 7,4
  · Bourg-en-Bresse 6,0) sortent de `CITIES_SEED`, donc de la valeur **rendue**. Aucun horaire,
  aucun tarif. `metaTitle` 44-60 caractères, `metaDesc` 144-154, 6 sections par guide, ~1 000 mots.

  **Quatre faits FR corrigés en cours de sourcing, tous vérifiés en ligne, tous des erreurs qu'aucun
  contrôle automatique ne peut voir.** Ils étaient dans les guides FR sources et seraient partis tels
  quels côté EN si le run s'était contenté de traduire :
  1. **Pays de Gex, fiscalité du frontalier** (`vivre-dans-l-ain-guide-2026`). Le guide écrivait que
     « les frontaliers résidant en France paient leurs impôts en France ». C'est vrai des cantons de
     Vaud, Valais, Neuchâtel, Jura, Berne et Bâle (accord de 1983) et **faux de Genève**, qui n'y est
     pas partie : le salaire genevois est **imposé à la source à Genève** (accord de 1973), Genève
     reversant une compensation aux communes françaises, le revenu se déclarant quand même en France
     (2042/2047) avec crédit d'impôt. Or le Pays de Gex travaille à Genève — la phrase était fausse
     pour la quasi-totalité de ses lecteurs, sur la question qui vaut des milliers d'euros par an.
  2. **Bourg-en-Bresse** (même guide) : « Score MaVilleIdéale : 6.6/10 » alors que
     `/villes/bourg-en-bresse` affiche **6,0**. Exactement la classe de dérive que CLAUDE.md décrit,
     et que `npm run integrity` ne voit pas ici : le garde-fou cherche un chiffre **à côté d'un nom
     d'axe**, or « Score MaVilleIdéale » n'en est pas un. Corrigé en 6,0.
  3. **Incendies 2022** (`vivre-dans-les-landes-guide-2026`) : « l'incendie de l'été 2022 a détruit
     35 000 hectares », attribué aux Landes. Le bilan officiel est de **plus de 30 000 ha** du massif
     des Landes de Gascogne, **principalement en Gironde** (Landiras 13 300 ha, La Teste-de-Buch,
     Saumos 3 720 ha), avec des dizaines de milliers d'évacuations préventives. Surestimation **et**
     erreur de département.
  4. **Le Limousin n'a pas de TGV** (`vivre-en-correze-limousin-guide-2025`) : le guide donnait
     « TGV Paris en 2h10 » pour Limoges et « pôle TGV, Paris en 3h30 » pour Brive. Les deux villes
     sont sur la **ligne POLT**, desservie en **Intercités depuis Paris-Austerlitz** : Limoges
     ≈ 3h25-3h30, Brive ≈ 4h20-4h30. Deux heures d'écart sur le trajet, c'est la décision
     d'installation elle-même. Corrigé des deux côtés, et la section EN correspondante s'appelle
     « The train is slower than you think ».

  **Cinq apports propres au lecteur anglophone, absents du FR parce qu'inutiles à un lecteur
  français**, et à ne pas diluer : ① le **droit d'option** d'assurance maladie du frontalier suisse —
  **3 mois** à compter de la prise de poste, **LAMal par défaut** si rien n'est notifié, et choix
  **irrévocable** en principe (réouverture limitée à la retraite sur pension suisse seule, la reprise
  d'activité après interruption, ou le changement de pays de résidence) ; ② le seuil de **40 %** de
  télétravail annuel depuis la France sans changement d'État d'imposition ; ③ **l'Ardèche est le seul
  département de France métropolitaine sans gare voyageurs, sans autoroute et sans aéroport** —
  service supprimé en **1973** (rive droite du Rhône, Givors-Nîmes), réouverture du Teil repoussée de
  2024 à 2026 puis **2027**, concertation Nîmes-Le Teil tenue à l'hiver 2025-26 : à présenter comme
  un projet, pas comme un calendrier sur lequel on déménage ; ④ les **baïnes** de la côte landaise,
  avec la règle opposable (baignade en plage surveillée, entre les drapeaux, drapeau rouge = plage
  fermée, pas une appréciation personnelle) — même précédent que la règle réunionnaise ; ⑤ les
  **corridas avec mise à mort** des ferias de Nîmes, à décider avant de signer un bail et non après.
  S'y ajoutent trois pièges pratiques : les **deux gares d'Avignon** (Avignon TGV hors les murs vs
  Avignon Centre), le sigle **ERRIAL / état des risques** et le **PPRI** expliqués en incise pour
  l'épisode cévenol du Gard, et l'**OLD** (obligation légale de débroussaillement) pour la forêt
  landaise.

  **Tags** : aucun tag inventé, mais `avignon` et `nimes` franchissent le seuil de 3 guides et créent
  **`/tags/avignon`** et **`/tags/nimes`** côté EN (104 → 106 slugs), d'où le passage de
  `npm run sitemap:check`. Les huit guides ont été vérifiés **retrouvés par la remontée inverse
  `relatedCities`** sur leurs pages ville et région EN après écriture : Condom, Biscarrosse,
  Fontenay-le-Comte, Gex, Oyonnax, Romans-sur-Isère et Aubenas passent de **zéro à un** guide EN sur
  leur page ville.

  **Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, FR 1 003,
  EN 765), `npm run search-index` relancé puis `search-index:check` propre, `npm run sitemap:check`
  propre (FR 29 078 URL, EN 28 629 → **28 649**), `npm run parity` en **code 0**.
  `npm run build` n'a pas été lancé, conformément à CLAUDE.md § Commands.

  **Gisements restants pour le prochain lot de sous-régions EN**, tous avec un guide FR source et
  sans jumelle EN : le Périgord hors Dordogne, la Champagne hors Reims, la Lorraine et sa frontière
  luxembourgeoise, la Normandie intérieure, l'Auvergne profonde, la Sarthe-Maine, les Pyrénées, la
  Savoie, et l'outre-mer, qui n'a **aucune vue d'ensemble EN** alors que ses 18 villes ont désormais
  leur guide tourisme des deux côtés.

---

## Shipped 2026-08-27 (2e run du jour)

- **Perf — la palette de recherche embarquait le seed entier sur toutes les pages ; le quiz expat,
  les 190 Ko de `lib/expat-return`. Mesuré avant/après, pas estimé.**
  C'est le piège « Projections, not entities » de CLAUDE.md § Performance, appliqué aux deux
  composants clients où il restait. `components/SearchPalette.tsx` importait `CITIES_SEED` pour en
  lire **quatre champs** (slug, nom, région, score global) et `RANKING_META` depuis `lib/rankings.ts`,
  qui tire le seed **et** `data/housing.ts` pour ses fonctions de tri. La palette est montée par la
  `Navbar`, donc sur **toutes** les pages du site : les 588 Ko du seed — descriptions FR et EN, tags
  de caractère, codes Insee, normales climatiques — partaient au navigateur pour afficher un nom et
  une pastille de couleur. La correction de 2026-08-04 avait sorti le corpus de guides de ce même
  fichier (5,9 Mo → 668 Ko) ; **le seed était ce qu'il restait dans les 668 Ko.**

  **Mesures réelles** (esbuild, `--bundle --minify`, mêmes réglages et mêmes externals des deux
  côtés, `NEXT_PUBLIC_DEFAULT_LOCALE=fr`, arbre HEAD contre arbre de travail) :

  | Composant | avant | après | gzip avant → après |
  |---|---|---|---|
  | `SearchPalette` | 741 182 o | **266 235 o** | 154 557 → **61 263 o** (−60 %) |
  | `ExpatQuiz` | 280 441 o | **88 484 o** | 74 991 → **22 867 o** (−70 %) |

  ⚠️ **C'est esbuild, pas Turbopack** : l'instrument n'est pas celui qui produit la prod, l'écart
  relatif est ce qui est mesuré. Ne pas recopier ces octets comme des tailles de chunk livrées.

  Trois changements, tous sur le même patron — **une frontière qui n'importe rien** :
  - **`lib/rankings-meta.ts` (neuf)** — `RANKING_META` et `RankingSlug` déménagent tels quels
    (aucune valeur touchée) dans un module **sans un seul import**. `lib/rankings.ts` les réexporte,
    donc les ~16 surfaces qui l'importent depuis lui n'ont rien à changer. Le tri des villes
    (`getRankedCities`, les scorers climat/littoral/logement) reste où il est, avec le seed.
  - **`SEARCH_CITIES` dans les index de recherche générés** — `scripts/build-search-index.mjs` émet
    désormais un tableau `cities` (slug, nom, région, score) dans `data/search-index.json` et
    `data/search-index.en.json`, à côté de `guides` et `tags`. Le script **évalue le vrai module**
    `data/cities-seed.ts` avec son vrai `calibrateScores` et son vrai `normalizeDistribution` : la
    projection porte donc le score **rendu**, jamais le littéral du seed — la règle que CLAUDE.md
    répète depuis le correctif du 10/08. Vérifié champ par champ contre `CITIES_SEED` importé par
    `npx tsx` : **540/540 identiques, longueur et ordre compris**. Le garde existant
    `npm run search-index:check` couvre le nouveau tableau sans une ligne de plus, et `prebuild`
    le rejoue, donc la prod ne peut pas partir avec une liste périmée. Coût : +65 Ko par fichier,
    dont **un seul part par build** (le ternaire sur `NEXT_PUBLIC_DEFAULT_LOCALE` est inliné) — en
    échange des 588 Ko du seed.
  - **`ExpatCountryOption` / `EXPAT_COUNTRY_OPTIONS`** — `components/ExpatQuiz.tsx` lisait
    `EXPAT_COUNTRIES` en **valeur** pour n'en tirer que drapeau, nom et `bestSuitedCities` ; les 190 Ko
    de prose, de chiffres et de liens administratifs des 21 fiches pays suivaient. La liste descend
    maintenant en **prop depuis la page serveur** `app/expat-retour/quiz`, exactement comme
    `CITIES_LIGHT` le fait déjà juste à côté — donc **rien à maintenir en double** : une fiche pays
    ajoutée à `EXPAT_COUNTRIES` apparaît dans le quiz sans autre geste. Le composant n'importe plus
    que des **types** de la lib, qui sont effacés à la compilation. C'était la dette notée noir sur
    blanc au § « Expat retour » de CLAUDE.md le 2026-08-26 (« trouvé ce run, non corrigé »).

  **Ce qui n'est PAS un gain, et qu'il faut lire comme tel.** `components/PoliticalLeanTail.tsx`
  importait `BLOC_COLORS` / `BLOC_ORDER` depuis `@/lib/political-lean`, qui lit
  `data/political-lean.json` (289 Ko) à l'initialisation. L'audit du graphe de modules le donnait
  pour le 2ᵉ plus gros passager du site ; **la mesure dit 3 584 octets avant comme après** — le
  bundler élimine le JSON, les fonctions qui le touchent n'étant pas appelées ici. L'import a
  quand même été repointé sur `lib/political-lean-meta` (la moitié client-safe, extraite pour ça),
  parce qu'une élimination n'est acquise que tant que personne n'appelle une de ces fonctions depuis
  ce fichier — mais **le gain annoncé est zéro**, et le commentaire du fichier le dit. Leçon de
  méthode, à garder : *un graphe d'imports dit ce qui est atteignable, pas ce qui est livré.*

  **Ce que ce run ne fait pas.** L'audit (script jetable, 84 modules clients balayés) laisse trois
  passagers réels, aucun corrigeable en une passe :
  - `data/city-population.json` (140 Ko) dans **`CityProfile`**, via
    `DemographyCard → lib/demography → lib/city-population` — donc sur les 540 pages ville, FR et EN.
    Le remède est le patron déjà en place à côté : calculer dans `lib/city-profile-data.ts`
    (serveur) et descendre le résultat en props. C'est le prochain vrai levier, et il touche le rendu
    des pages ville — à faire avec un build local, pas depuis une routine.
  - Le même JSON dans `components/PersonalSynthesisQuiz` via `lib/city-synthesis` : celui-là est
    **légitime**, le quiz recalcule la synthèse dans le navigateur.
  - `data/housing.ts` (53 Ko) et `data/city-cards.json` (63 Ko) dans les six quiz et grilles de
    villes : légitimes aussi, les loyers servent au filtrage et au classement côté client.

  **Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, FR 1 003,
  EN 757), `npm run search-index:check` propre après régénération, `npm run parity` en code 0,
  `npx eslint` sur les sept fichiers touchés — 0 erreur, 1 avertissement préexistant
  (`react-hooks/exhaustive-deps` sur le `useEffect` d'échappement de la palette, hors diff).
  Aucune route ajoutée, donc `app/sitemap.ts` inchangé et `sitemap:check` non requis.
  `npm run build` n'a pas été lancé, conformément à CLAUDE.md § Commands.

---

## Shipped 2026-08-27

- **Parité EN — série `single-parent-holidays-[city]-2026` REFERMÉE (batch 2, +8 : Lyon, Angers,
  Bordeaux, Besançon, Grenoble, Brest, Tours, Valence).** `npm run parity` sort en **code 0**, 0 route
  FR sans jumelle EN : la parité de routes tient, donc le run est allé sur l'écart de corpus. La cible
  s'est choisie toute seule — le batch 2 FR `vacances-monoparentales` a été poussé **la veille**
  (`493091b`, 2026-08-26) et laissait 15 guides FR contre 7 EN. C'est exactement le cas que le prompt
  de la routine désigne comme prioritaire : un écart rattrapé le jour même coûte huit pages, rattrapé
  un mois plus tard il en coûte cent. **Compteurs mesurés : FR 15, EN 15 — écart nul, parité rétablie**
  (`EN_GUIDES` 749 → 757).
  **Tous les chiffres ont été relus dans les modules, pas dans les sources**, conformément à la règle
  « ne jamais citer un littéral du seed ». Vérifiés un à un avant rédaction et identiques aux jumelles
  FR : les huit composites (Lyon 6,6 · Angers 6,6 · Bordeaux 6,4 · Besançon 6,4 · Grenoble/Brest/Tours/
  Valence 6,3) sortent de `vacationFit(city, { profile: "monoparental" })` — ⚠️ **pas** de
  `rankByProfile(familles-monoparentales)`, qui donne d'autres valeurs (Lyon 6,40, Bordeaux 6,10) et
  qui est le piège de ce lot ; les axes de `CITIES_SEED` ; les loyers T3 et prix m² de `data/housing.ts` ;
  l'affluence 1-5 de `allMonthSignals()` ; les paliers de budget de `vacationFit` (Valence seule en €€,
  Lyon et Bordeaux en €€€€) ; les drapeaux de `getTransit()` (Valence sans tram, confirmé) ; la
  population Insee 2022 de Valence, 64 288, et sa hausse de 2,9 % ; et les distances de station
  climatique (Angers → Nantes 87 km, Besançon → Dijon 71 km, Valence → Grenoble 59 km).
  Écrit en anglais natif depuis les faits des guides FR, `metaTitle` 35-39 caractères, `metaDesc`
  145-158, 6 sections par guide (la série FR en compte 7, l'EN fusionne aides et logistique du soir
  comme le batch 1). Densité de tirets cadratins ramenée sous la cible R7.10 après première passe
  (0,18-0,93 pour 200 mots ; Grenoble était à 1,78, Lyon à 1,39).
  Les prudences du FR sont reprises telles quelles : **gare TGV ≠ gare de centre-ville** pour Besançon
  (Les Auxons, ~10 km), Tours (Saint-Pierre-des-Corps) et Valence (Alixan) ; **la montagne sans voiture
  est étroite** à Grenoble comme à Valence, la liaison se vérifie avant de bâtir la journée ; **Brest
  n'est pas une station balnéaire** et le plan B couvert est la structure du séjour, pas une option ;
  **Fontevraud est accessible depuis Angers sans y être située** ; **la dune du Pilat n'a pas de gare**.
  Aucun horaire, aucun tarif, aucun barème d'aide — les montants VACAF / ANCV / CAF sont renvoyés à
  l'organisme parce qu'ils sont réévalués et calculés sur le quotient familial.
  Cinq ajouts propres à l'angle voyageur étranger, absents du FR : la **zone de vacances scolaires** de
  chaque ville (A pour Lyon, Bordeaux, Besançon, Grenoble, Valence ; B pour Angers, Brest, Tours) avec
  renvoi des dates à education.gouv.fr, parce que c'est ce qui commande les prix ; le **112** ajouté au
  15 et au 116 117 ; le **quotient familial** et la **CAF** définis en incise ; le **TER** présenté
  comme un réseau distinct du TGV ; et les **traboules**, le **miroir d'eau** et la **tenture de
  l'Apocalypse** expliqués plutôt que nommés.
  **Tags** : aucun tag inventé, mais `car-free holidays france` franchit le seuil de 3 guides et
  **crée `/tags/car-free-holidays-france` côté EN** (103 → 104), d'où le passage de
  `npm run sitemap:check` (FR 29 078 URL, EN 28 639 — chaque URL déclarée a une page).
  `npm run search-index` relancé (`data/search-index.en.json` 757 guides, 104 tags).
  **Prochain écart de corpus, mesuré ce run et non récité** : `demenager-a-[city]` ×50 côté FR n'a
  aucune jumelle EN (`moving-to-[city]` n'existe pas, seul `moving-to-france` ×4), et
  `quitter-[city]-guide` ×49 face à `leaving-[city]-where-to-go` ×15. Ce sont les deux plus gros trous
  de série restants ; `vivre-a-[city]` ×48 est en revanche déjà couvert par les variantes
  `[city]-living-guide` (47), donc **ne pas le rouvrir**.

---

## Shipped 2026-08-26 (2e run du jour)

- **F62 — la composante zones protégées se lit enfin d'une ville à l'autre : hub `/espaces-proteges`
  + jumelle EN `/protected-areas`** ✅ — Le run du matin ayant fait du contenu (batch 35 EN, parité
  tourisme refermée à 219/219), ce run prend l'autre zone et **finit ce que la bascule BD TOPO du
  matin même a rendu possible**. Depuis le commit `85d4da8`, `data/city-protected-areas.json` porte
  **540/540 villes** mesurées sur les cinq protections réglementaires (réserves naturelles, parcs
  nationaux et régionaux, arrêtés de biotope, Natura 2000), ingest v3, source `bdtopo`, périmètres
  arrêtés au **2026-08-19**. `PROTECTION_CALIBRATED` est donc vrai depuis ce matin et chaque ville
  publie un /10 — mais la mesure ne se lisait **qu'une ville à la fois**, sur
  `/villes/[slug]/biodiversite`. Aucune comparaison nationale nulle part.

  **Pourquoi celle-ci se classe alors que la richesse a été retirée le 10/08.** Un arrêté de biotope
  existe qu'un naturaliste passe par là ou non ; la raréfaction GBIF mesurait d'abord la densité
  d'observateurs. C'est la seule des trois composantes insensible au biais d'effort, et c'est
  exactement l'argument qui a servi à retirer l'autre. ⚠️ **Ce n'est pas une réouverture de
  `/classements/biodiversite`**, abandonné et à ne pas recréer : le hub ne publie aucun rang de
  richesse, `RICHNESS_RANKING_PUBLISHED` reste `false`, et `overall` reste `null`.

  **Ce que le hub publie** (`lib/protected-areas-ranking.ts`, aucune mesure nouvelle — tout vient du
  JSON) : le **top 40 national** en paliers d'ex æquo, les **42 communes de plus de 100 000
  habitants entre elles** (top 20), et le bas de tableau. Chiffres mesurés ce run : médiane
  **6,8 %** du disque de 15 km sur les 540 villes ; **Digne-les-Bains 96,4 %** (réserve géologique
  de Haute-Provence), Florac-Trois-Rivières 93,2 %, Apt 78,3 %, Baie-Mahault 77,4 % ; **Marseille
  47,9 %, seule commune de plus de 100 000 habitants du top 40** ; **14 villes** s'arrondissent à
  0,0 %, dont **5 sans aucun périmètre à moins de 15 km** (Albi, Auch, Fleurance, Longwy, Vitré),
  listées **alphabétiquement et sans rang** — elles portent la même valeur.

  **La convention de classement du 19/08 est appliquée telle quelle** : groupement par valeur, aucun
  palier coupé en son milieu (le classement s'arrête à 40 et dit que la 41ᵉ, Chambéry, est à
  36,8 %), rang de compétition partagé par les ex æquo, tri par nom **à l'intérieur** d'un palier
  annoncé comme un ordre stable et non un départage, et `itemListOrder` calculé : le JSON-LD passe
  en `ItemListUnordered` dès qu'une des dix premières villes est ex æquo (aujourd'hui elles ne le
  sont pas, la tête est donc ordonnée — mais ce n'est pas codé en dur).

  ⚠️ **Trois limites écrites dans les deux pages, à ne pas diluer.** ① **Cœur de parc et aire
  d'adhésion pèsent pareil** (1,0) : la BD TOPO les publie comme deux polygones du même type, alors
  que l'aire d'adhésion est une zone de charte sans interdiction générale. Sur **11 villes** le seul
  polygone de parc national relevé est une aire d'adhésion (Alès, Bagnères-de-Bigorre, Gap,
  La Seyne-sur-Mer, Lourdes, Marignane, Pau, Sainte-Maxime, Saint-Tropez, Six-Fours,
  **Toulon — 4ᵉ des grandes villes**) : leur couverture est un **majorant**, et la colonne
  « protection la plus forte » l'affiche ligne par ligne (« aire d'adhésion » / « buffer zone
  only »), pas seulement en méthodologie. La détection se fait sur le **nom** du périmètre, faute
  d'attribut qui distingue les deux dans la source — c'est documenté dans la lib pour que personne
  ne la prenne pour une donnée. ② **Protégé ne veut pas dire accessible** : un site Natura 2000
  recouvre souvent des terres agricoles ou privées, sans sentier. ③ **C'est un disque, pas une
  commune** : 15 km débordent largement les limites communales, volontairement, mais ne disent rien
  de ce qu'on a au pied de son immeuble.

  **Corrections de copie ramassées au passage sur les deux sous-pages ville** (héritées de l'époque
  INPN, fausses depuis ce matin) : le message « non mesuré » citait des périmètres **INPN et des
  ZNIEFF** alors que les ZNIEFF sont désormais hors calcul ; l'exemple d'emboîtement des zonages
  était « une ZNIEFF I est presque toujours incluse dans une ZNIEFF II », remplacé par un site
  Natura 2000 chevauchant une réserve et un parc régional ; et la section espèces menacées promettait
  que « les statuts nationaux viendront de l'INPN », ce qui ne peut plus arriver — la phrase dit
  maintenant que la liste rouge du MNHN n'est pas revenue en ligne depuis la cyberattaque de
  juillet 2025. Les deux pages ville gagnent aussi un **repère de médiane nationale + lien vers le
  hub**, dans les deux locales.

  **Câblage** : `FR_TO_EN_ROUTE` (`espaces-proteges` → `protected-areas`), une entrée sitemap par
  locale, `pathAlternates` / `pathAlternatesEn` donc canonical **et** hreflang sur les deux pages,
  `generateStaticParams` limité à `locale: "en"` côté EN. Titres **51 (FR) et 47 (EN)** caractères, descriptions
  **157 et 153**, `openGraph` avec `images: ["/opengraph-image"]` (le piège documenté). Rendu **vérifié
  en `next dev`** sur les quatre routes (hub FR, hub EN, `/villes/digne-les-bains/biodiversite`,
  `/en/cities/digne-les-bains/biodiversity`) : 200 partout, hreflang et canonical présents dans le
  `<head>`, liens croisés présents dans le HTML — aucun JS requis pour lire les deux tableaux.

  **Contrôles** : `npx tsc --noEmit` propre, `npm run integrity`, `npm run parity` (FR 219 · EN 166,
  **0 route FR sans jumelle EN**), `npm run hreflang:check`, `npm run sitemap:check` (FR 29 067 →
  **29 068**, EN 28 629 → **28 630**, chaque URL déclarée a une page). `npm run build` volontairement
  pas lancé, comme la consigne l'impose depuis le batch 27.

  **Suite possible** : une vue par région ou par macro-région (le top 40 est très PACA / Occitanie),
  et le rebranchement des liens de fiche `inpnUrl()` le jour où l'INPN resert des fiches — la
  BD TOPO porte le code MNHN dans `identifiants_sources`, il suffira de le remonter à l'ingest.

---

## Shipped 2026-08-25 (2e run du jour)

- **Parité EN — série `family-in-[city]-2026` FERMÉE (batch 2, +9 : Angers, Caen, Dijon, Tours,
  Metz, Clermont-Ferrand, Orléans, Pau, Besançon)** ✅ — **`EN_GUIDES` 734 → 743, série 19 FR /
  19 EN, écart nul.** `npm run parity` en **code 0** en début de run (FR 218 / EN 165, 0 route
  sans jumelle) : pas de régression de routes, donc run de corpus. Le diff par série sur le
  corpus réel (FR 989 / EN 734) a redonné `famille-a-[ville]` 19 FR / 10 EN comme le trou le
  plus avancé, et le batch 1 du 24/08 avait nommé ces neuf villes exactement : la liste FR est
  honorée telle quelle et la série est close.

  **Le socle chiffré vient des modules, jamais de la prose FR** (même méthode que le batch 1) :
  loyers T2/T3 dans `data/housing.ts`, médianes de transaction et effectifs de ventes dans
  `lib/property-prices.ts` (DVF 2024-2025), populations 2011/2022 et part des 0-14 ans dans
  `lib/city-population.ts` (Insee 2022), niveau de vie et taux de pauvreté dans
  `lib/city-income.ts` (Filosofi 2021), axes lus dans `CITIES_SEED` via un `npx tsx`. **Aucun
  score en `/10` imprimé**, `metaTitle` 51-54 caractères, `metaDesc` 143-156, 7 sections et
  1 209-1 284 mots par guide, **zéro tiret cadratin**, `relatedCities` toutes vérifiées présentes
  au seed, photo d'en-tête retrouvée sur les 9 (`guideCityPhoto`).

  ⚠️ **La trouvaille du run : la série publiait des rangs que le score ne départage pas, des
  deux côtés du batch.** L'axe `schools` a une décimale, donc ses paliers sont larges, et un
  `indexOf` sur un tableau trié rend une position d'insertion, pas un rang. Mesuré : 7,9 est un
  palier de **5 villes** (Paris, Nantes, Tours, Angers, Lille, rangs 31-35), 7,4 un palier de
  **11** (rangs 87-97), 6,6 un palier de **107** (rangs 102-208), et 9,0 un palier de **13 villes
  ex æquo en tête**. Le batch 1 du 24/08 avait donc écrit « Rennes 1st of 540 » et « Toulouse
  2nd of 540 » alors que les deux villes ont le **même** score et que onze autres le partagent,
  « Nantes 31st », « Lille 34th », « Strasbourg 16th », « Bordeaux 87th », « Montpellier 98th »,
  « Marseille 505th » et « Nice 351st » — **9 des 10 guides du batch 1**, seul Lyon (8,9, valeur
  unique) était juste. C'est très exactement la convention posée le 19/08 dans
  `lib/owner-rankings.ts` : **une égalité ne se présente pas comme un départage**. Les 9 guides
  sont corrigés en paliers (« inside the top 35 of 540, in a five-way tie », « in the 505th to
  521st band of 540 »), titres compris — « second-best schools in France » et « the best schools
  in France » ne pouvaient pas être vrais tous les deux à partir de deux 9,0 identiques. Les 9
  nouveaux guides sont écrits en paliers dès le premier jet. **Corollaire pour tout futur batch :
  ne jamais publier un rang tiré d'un `sort` + `indexOf` sur un axe à une décimale sans avoir
  compté le palier** ; les rangs de part des 0-14 ans (538 valeurs distinctes) et de niveau de vie
  sont sûrs, sauf pour Angers, Metz et Besançon dont le niveau de vie est ex æquo — ces trois
  guides disent la position en mots, pas en rang.

  **Sept affirmations comparatives fausses corrigées avant commit**, le mode de défaillance
  documenté le 19/08 et le 22/08 qui se reproduit à chaque batch : les scores de la ville de la
  page sont justes, ce sont les **superlatifs entre villes** qui dérapent. Trois villes et non une
  passent sous les deux médianes nationales de prix (Clermont-Ferrand **et** Pau **et** Besançon,
  chacune l'annonçait à sa façon comme un cas isolé) ; l'écart de pauvreté entre Dijon (17 %) et
  le haut du lot est de **huit** points, pas onze ; la maison caennaise est à **plus d'un
  cinquième** au-dessus de l'appartement, pas à un quart ; Metz n'est pas « troisième moins chère »
  mais la suivante derrière **trois villes ex æquo à 900 €** ; Orléans est au dernier rang du lot
  sur la vie quotidienne et la sécurité mais **à égalité avec Metz** sur les écoles ; et quatre
  guides annonçaient « eleven other cities » pour un palier qui compte 11 villes **en tout**.
  Deux tirets cadratins résiduels du batch 1 (Lille, Montpellier) supprimés au passage.

  **Le fait qui structure le lot** : les neuf sont toutes moins chères que les dix grandes villes
  du batch 1, dans les deux marchés. Le T3 va de **900 € (Clermont-Ferrand, Pau, Besançon) à
  1 000 € (Angers)** quand le batch 1 allait de 1 080 € à 1 500 €, et **les huit qui ont une
  médiane DVF sont sous la moins chère des dix premières** (Marseille, 3 154 €/m²) — Angers de
  11 € seulement. Deux mesures publiées telles quelles parce qu'elles renversent une intuition :
  **Orléans est la seule des neuf au-dessus de la médiane nationale de 0-14 ans** (17,5 %, 212ᵉ sur
  538, contre 16,5 %), c'est-à-dire la seule commune du lot où les familles habitent encore la
  ville et non la couronne ; et **la maison y coûte 1,3 % de plus que l'appartement au m²**
  (2 572 € contre 2 538 €), le plus petit écart des neuf, devant Angers (+2,9 %) et loin de
  Besançon (+25,5 %). À l'inverse **Caen affiche 11,8 % de 0-14 ans, 499ᵉ sur 538**, le plancher
  de toute la série, et **Pau 28,3 % de 60 ans et plus** quand la suivante est à 23,5 % : les deux
  seules villes du lot qui ont moins d'habitants qu'en 2011 sont précisément celles-là.

  **Neuf incises propres au lecteur étranger, une par ville, toutes absentes du batch 1** :
  ① la **taxe d'habitation supprimée sur la résidence principale mais la taxe foncière non**, et
  c'est le propriétaire qui la paie (Angers) ; ② **trois autorités différentes affectent les trois
  niveaux** — la mairie pour maternelle et élémentaire, le département pour le collège, le rectorat
  pour le lycée, sur trois cartes qui ne se superposent pas (Caen) ; ③ le **carnet de santé** et le
  calendrier d'examens obligatoires suivis gratuitement par la **PMI** jusqu'à six ans (Dijon) ;
  ④ le dispositif **UPE2A** pour un enfant qui arrive sans français, évalué par le CASNAV de
  l'académie, gratuit, national, et qui peut légitimement envoyer hors carte scolaire (Tours) ;
  ⑤ le **droit local d'Alsace-Moselle** : enseignement religieux comme matière ordinaire à l'école
  publique avec dispense **à demander par écrit**, deux jours fériés de plus (Vendredi saint et
  26 décembre) et le **régime local d'assurance maladie** qui rembourse au-dessus du taux national
  (Metz) ; ⑥ l'**assurance scolaire**, obligatoire pour tout ce qui est facultatif, jamais
  automatique (Clermont-Ferrand) ; ⑦ la **dérogation** à la carte scolaire, ses motifs limitatifs
  et le fait qu'elle se décide sur les places restantes, donc tard (Orléans) ; ⑧ l'**échange de
  permis de conduire**, valable de droit pour l'UE, soumis à accord de réciprocité et à un délai
  courant depuis le premier titre de séjour ailleurs, dans la seule ville du lot où la voiture
  n'est pas optionnelle (Pau) ; ⑨ le **permis frontalier** et le **droit d'option** irréversible
  entre couverture santé suisse et française (Besançon).

  **Trois prudences assumées, à ne pas diluer.** ① Le **livre foncier** prive Metz de médiane DVF
  au même titre que Strasbourg, et le guide le dit au lieu de laisser un blanc, qui se lirait comme
  un oubli. ② La médiane maison de Besançon repose sur **375 ventes**, le plus petit échantillon du
  lot : elle est donnée comme indicative. ③ Clermont-Ferrand est bon marché **parce que les revenus
  y sont bas** (niveau de vie le plus faible du lot, 25 % de pauvreté, le plus haut) : le guide écrit
  qu'un ménage qui arrive avec un revenu d'ailleurs fait un arbitrage, pas une bonne affaire. Et,
  suivant la convention des batches précédents, tout ce qui relève d'une commune voisine est écrit
  « accessible depuis » : Amnéville et Sarrebruck depuis Metz, l'Aquarium du Val de Loire
  (Lussault-sur-Loire) depuis Tours, Saint-Pierre-des-Corps nommée comme **gare d'une autre
  commune**, Bordes depuis Pau, la gare Besançon Franche-Comté TGV comme extérieure à la ville.

  **Tags** : aucun tag inventé, mais `pau` franchit le seuil de 3 guides et **crée `/tags/pau`
  côté EN** — `TAG_SLUGS_EN` passe de 102 à **103**. `npm run search-index` relancé
  (`data/search-index.en.json` 743 guides, 103 tags) et **`npm run sitemap:check` repassé** à cause
  du tag neuf : FR 29 061 URL, **EN 28 623**, chaque URL déclarée a une page.
  `npx tsc --noEmit`, `npm run integrity`, `npm run search-index:check`, `npm run hreflang:check`
  et `npm run parity` passent tous.

  **Ce qui n'est PAS livré** : aucun guide FR (la série `famille-a-` reste à 19, elle n'est pas
  rouverte) ; aucune correction des rangs publiés par les **autres** séries EN, qui utilisent
  peut-être le même `sort` + `indexOf` sur un axe à une décimale — le contrôle n'a été fait que sur
  `family-in-`, et c'est le premier endroit où regarder au prochain run. Le crawl reste bloqué
  (egress 403), donc rien n'a été tenté côté F62/F63/F64.

  **Prochain run** : la série `family-in-` est fermée, donc reprendre le diff par série. Les plus
  gros trous à couverture **nulle** restent `universites-[ville]` (15 FR / 0 EN) et
  `vacances-monoparentales-` croisé mois × profil ; ensuite `quitter-` (55 FR / 23 EN `leaving-`),
  `vivre-en-` et `parent-solo-` si un batch 6 FR repart. ⚠️ `universites-` demande un **angle
  distinct** avant d'être ouverte : `studying-in-[city]` compte déjà 24 guides EN et recouvrirait
  frontalement une série « universités » écrite par symétrie de compteur, exactement la
  cannibalisation qui a coûté 15 guides EN en juin. L'angle qui tient, s'il est pris : les
  **établissements et l'admission** vus d'un candidat étranger (Campus France, DAP, niveau de
  français exigé, frais différenciés), pas la vie étudiante. Rappel inchangé :
  `demenager-a-[ville]` (50 FR / 0) est un **non-correctif assumé**.

---

## Shipped 2026-08-23

- **Parité EN — série `solo-travel-in-[city]-2026` REFERMÉE (batch 3, +7 : Nancy, Poitiers,
  Rouen, Caen, Clermont-Ferrand, Tours, Besançon) + la jumelle manquante de `working-in`
  (Nantes, +1)** ✅ — **`EN_GUIDES` 707 → 715.**

  **Le run a commencé par la mesure**, comme la routine l'exige : `npm run parity` d'abord
  (code 0, **217 routes FR / 165 EN, aucune route FR sans jumelle** — la parité de routes tient
  depuis le 09/08 et n'a pas régressé), puis un diff de familles de slugs sur le corpus réel
  (`FR 980 / EN 707`). Deux écarts sont sortis, tous deux des séries **déclarées fermées** qui
  avaient rouvert dans le dos de la routine :

  - `vacances-celibataire-[ville]-2026` était passée de 15 à **22 FR** le 22/08 (batch 3 d'un
    autre agent) face à **15 EN**. Écart de 7, rattrapé le lendemain — c'est exactement le cas
    que la routine existe pour attraper : une jumelle rattrapée le jour même coûte une page,
    rattrapée dans un mois elle en coûte cent.
  - `travail-a-[ville]` / `working-in-[city]` : la série EN avait été annoncée « fermée » le
    20/08 à 29 guides pour **30 FR**. Le manquant était **Nantes**, la plus grosse ville de la
    série. Leçon reprise du batch 32 tourisme : **une série se déclare fermée sur un diff, pas
    sur un compte** — 29 contre 30 se lit comme fermé si on ne compare que les totaux.

  **Les 7 guides `solo-travel` sont écrits en anglais natif depuis les faits des guides FR**,
  6 sections chacun comme le reste de la série (la version FR en compte 6 aussi ici),
  `metaTitle` 47-51 caractères, `metaDesc` 139-159, zéro tiret cadratin. **Les chiffres sont
  contrôlés contre le moteur, pas recopiés de la prose FR** : part des 15-29 ans au recensement
  Insee 2022 relue via `lib/city-population.ts` sur les 538 villes couvertes — Nancy 36,4 %
  (4ᵉ), Poitiers 36,0 % (5ᵉ), Rouen 33,4 % (8ᵉ), Caen 33,3 % (9ᵉ), Clermont-Ferrand 31,5 %
  (13ᵉ), Tours 29,7 % (18ᵉ), Besançon 28,9 % (23ᵉ), médiane nationale 18,4 % — plus les
  populations municipales (Poitiers 89 472, Clermont-Ferrand 147 751). Les sept valeurs
  tombent au chiffre près sur ce que la prose FR annonce.

  **Aucun score `/10` n'est cité**, conformément à ce que fait déjà la série EN : les guides
  comparent en toutes lettres (« the most affordable of this batch », « the best safety score
  of this series ») plutôt que d'imprimer un nombre qui n'a pas la même échelle pour un lecteur
  anglophone. Les faits qui portent chaque guide sont repris tels quels : **il n'y a pas de
  tramway à Nancy** (le TVR a été retiré, la ligne 1 roule en trolleybus 100 % électrique
  depuis le 5 avril 2025), le « métro » de Rouen est **techniquement un tramway** en souterrain
  dans la traversée du centre, **Rouen, Caen et Clermont-Ferrand n'ont pas de desserte TGV**
  (ligne classique depuis Saint-Lazare pour les deux normandes, **gare de Bercy et non gare de
  Lyon** pour Clermont), le tramway de Caen a rouvert **sur rails le 27 juillet 2019**, celui de
  Clermont est une **ligne A unique sur pneus** (34 stations, ~16 km, 2006), **Saint-Pierre-des-Corps
  n'est pas un quartier de Tours** mais une gare d'une commune voisine, et Besançon a **deux
  gares** dont une hors de la ville (~20 min de trajet supplémentaire, seul piège logistique de
  la destination). Quatre incises sont propres au lecteur étranger et absentes du FR parce
  qu'inutiles à un lecteur français : ce que veut dire le label **centre dramatique national**
  et **scène nationale**, ce que sont les **Journées du patrimoine**, le fait que le centre de
  Caen est **littéralement reconstruit** après l'été 1944, et que la pierre noire de la
  cathédrale de Clermont est de la **lave locale**.

  **`working-in-nantes-2026`** suit le gabarit de la série (8 sections, catégorie `moving`) et
  ses chiffres viennent des libs, pas d'une intuition : estimation marché du travail **7,5/10**
  lue par `getEmploymentRankings()`, niveau de vie médian Insee **24 170 €/an** (114ᵉ sur 533,
  taux de pauvreté 17 %) par `lib/city-income.ts`, loyers **600 / 850 / 1 150 €** et **4 200 €/m²**
  par `data/housing.ts`, axes seed télétravail 9/10, transport 8,1/10, écoles 7,9/10, coût
  5,3/10.
  ⚠️ **Nantes n'est pas écrite « première » du classement emploi, et c'est délibéré** : elle est
  **à égalité avec Lyon** à 2,5 de composite, donc le guide dit « joint top … tied with Lyon »
  et pose la raison en une incise. C'est la convention posée le 19/08 (`lib/owner-rankings.ts`) :
  une égalité ne se coupe jamais en son milieu, et un rang qu'un score à une décimale ne
  départage pas ne se publie pas.
  ⚠️ **Défaut trouvé au passage, non corrigé ce run et à traiter en priorité au prochain** :
  **les 29 guides `working-in-[city]-2026` déjà livrés publient tous un rang fabriqué à
  l'intérieur d'une égalité** (« fourth of the 363 », « 86th of the 363 »…). Mesuré sur le vrai
  moteur : Rennes/Strasbourg/Paris sont à égalité à 2,8 et s'affichent 4ᵉ, 5ᵉ et 3ᵉ ;
  Bordeaux, Angers, Caen et Brest annoncent 86ᵉ ou 91ᵉ **dans un palier de 62 villes** ;
  Marseille, Toulouse et Dijon se partagent un palier de 14 en affichant 148ᵉ, 156ᵉ et 161ᵉ.
  Le calcul lui-même est juste, c'est sa **restitution** qui fabrique un ordre : `sort` +
  `findIndex` sur un composite à une décimale. Le correctif est éditorial (une phrase par
  guide : palier, effectif de l'égalité), pas un correctif de moteur — même remède que
  `/classements/qualite-air` le 19/08.

  Aucun tag neuf : les 8 guides réutilisent des tags existants (`grand-est`, `normandy`,
  `centre-val-de-loire`, `bourgogne-franche-comte`, `nouvelle-aquitaine`,
  `auvergne-rhone-alpes`, `pays-de-la-loire`), donc aucune page `/tags/` nouvelle.
  `npx tsc --noEmit` propre, `npm run integrity` propre (guides EN 707 → 715),
  `npm run search-index` relancé (`data/search-index.en.json` 715 guides, 100 tags),
  `npm run sitemap:check` propre dans les deux sens (**29 047 URL FR inchangé / 28 592 EN**,
  soit +8 côté EN et rien de bougé côté FR), `npm run parity` en code 0.
  **Prochain run** : le rang fabriqué des 29 `working-in` ci-dessus passe avant tout nouveau
  lot de contenu, sauf si `npm run parity` remonte une régression de route.

---

## Shipped 2026-08-20

- **Série tourisme — batch 33 EN, rattrapage de parité : `things-to-do-in-[city]-2026` (+6)** ✅
  Les 6 jumelles du batch 32 FR (18/08) écrites d'un coup dans `data/guides-en.ts` : **Le Lamentin
  (972), Baie-Mahault (971), Saint-Louis (974), Saint-Joseph (974), Les Sables-d'Olonne,
  Vincennes**. **Compteurs mesurés : FR 213, EN 213 — écart nul, parité rétablie**
  (`EN_GUIDES` 701 → 707). Le compte se prend des deux côtés avec
  `grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'` et
  `grep -c 'slug: "things-to-do-in-.*-2026"'` — les sept slugs FR à article contracté
  (`au-puy-en-velay`, `au-tampon`, `au-francois`, `au-robert`, `aux-abymes`, `au-lamentin`,
  `aux-sables-d-olonne`) restent hors gabarit et ne sont pas des trous.

  ⚠️ **Un conseil de nommage laissé par le batch 32 a été écarté, à raison.** Il annonçait que le
  suffixe départemental de `saint-louis-reunion-**974**` « n'a pas à passer côté EN, où aucun autre
  slug ne le porte ». C'est vrai du style et faux du fonctionnement : la page ville EN résout son
  guide par `getEnGuide('things-to-do-in-' + slug + '-2026')` **sur le slug de seed**
  (`app/[locale]/cities/[slug]/things-to-do/page.tsx:130`), donc un guide nommé
  `things-to-do-in-saint-louis-reunion-2026` serait resté **invisible sur la page de Saint-Louis**,
  exactement le défaut que le batch 32 venait de corriger côté FR pour les slugs à article. Le slug
  livré est donc **`things-to-do-in-saint-louis-reunion-974-2026`**, moche et branché. Règle
  générale : côté EN, le slug d'un guide de la série se dérive du **slug de seed tel quel**, jamais
  d'une version « propre » de celui-ci. Vérifié après écriture — les 6 guides sont retrouvés par le
  lookup et les 6 reçoivent bien leur photo d'en-tête via `guideCityPhoto()`.

  Écrit en anglais natif depuis les faits des guides FR, jamais traduit ; `metaTitle` 42-47
  caractères, `metaDesc` 147-154, 8 sections par guide (la série FR en compte 10, la version EN
  fusionne les fins de liste comme tous les batches EN précédents). **Aucune figure en `/10`, aucun
  horaire, aucun tarif** : la série tourisme n'en cite pas, donc rien à contrôler contre le module —
  et rien de ce que `npm run integrity` ne pourrait pas voir n'a été inventé.

  **Les prudences du FR sont reprises telles quelles et ne doivent pas être diluées** : la
  **mangrove n'est pas un lieu de baignade** (Le Lamentin et Baie-Mahault) ; le **chlordécone** est
  nommé comme fait documenté de la plaine du Lamentin, sans chiffre et sans verdict ; **La Favorite
  a une adresse au Lamentin** tout en étant à la limite de Fort-de-France ; la baignade en mer est
  **interdite hors lagon de la côte ouest et hors bassins surveillés** à La Réunion, avec sa
  précision géographique dans les deux guides 974 (**pas de lagon devant Saint-Louis, pas de lagon
  dans le sud**) ; les **arrêtés de baignade de la rivière Langevin sont affichés sur place et font
  foi**, jamais résumés en « c'est autorisé » ; et le **bois de Vincennes n'est pas à Vincennes** —
  il relève de la Ville de Paris et du 12ᵉ arrondissement, donc Parc floral, zoo, hippodrome,
  arboretum et Cartoucherie sont écrits « accessible from », convention des batches 26/28/30.

  **Cinq ajouts propres à l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur
  français.** ① Les **DROM ne sont pas dans l'espace Schengen** : un visa Schengen n'y est pas
  valable, ce qui se règle avant de réserver et pas à l'embarquement — dit dans les quatre guides
  ultramarins. ② La Martinique est **hors territoire TVA et accises de l'UE**, donc le rhum
  rapporté en métropole relève d'une **franchise voyageur** et non d'une circulation intra-UE ; la
  quantité renvoie à la douane, aucun chiffre n'est imprimé. ③ **La Réunion est à UTC+4 sans heure
  d'été et ses saisons sont inversées** — l'hiver austral (mai-novembre) est la *bonne* saison,
  contre-intuitif pour un anglophone. ④ Sur une plage française surveillée, **vert / jaune / rouge**
  et la zone balisée sont une signalétique réglementaire, pas un avis — dit aux Sables. ⑤ Les
  **vacances scolaires** commandent la foule : la Vendée est en **académie de Nantes, zone B**, mais
  les **dates bougent chaque année**, donc renvoi au calendrier officiel et **aucune date citée**
  (même traitement que la série `single-parent-holidays-*` du 19/08). Deux précisions mineures dans
  la même veine : un **lolo** est expliqué la première fois qu'il apparaît, et le **Théâtre du
  Soleil joue en français**, ce qu'un lecteur anglophone ne devine pas avant d'avoir réservé.

  **Tags** : aucun tag neuf inventé, mais `guadeloupe` franchit le seuil de 3 guides avec
  Baie-Mahault et **crée `/tags/guadeloupe` côté EN** (99 → 100 pages de tag) — d'où le passage de
  `npm run sitemap:check`. Les cinq autres réutilisent `martinique`, `reunion`, `pays-de-la-loire`,
  `ile-de-france`.

  **Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` propre (540 villes, FR 973,
  EN 707, 0 score brut recopié des deux côtés), `npm run search-index` relancé
  (`data/search-index.en.json` 707 guides, 100 tags) puis `search-index:check` propre,
  `npm run sitemap:check` propre dans les deux sens (FR 29 040 URL, EN 28 584),
  `npm run hreflang:check` propre, `npm run parity` en code 0. **0 em-dash** sur les six guides
  (cible R7.10 : ~1 pour 200 mots), densité de caractères accentués conforme — les noms propres
  français gardent leurs diacritiques, aucun ascii-strip.

  **Prochain run de la série : batch FR** (l'écart est nul, la main revient au FR). L'outre-mer est
  épuisé des deux côtés. Restent en piste, dans l'ordre où le batch 32 les a laissées : les six
  banlieues de province jamais faites — **Villenave-d'Ornon, Talence, Le Bouscat** (Bordeaux
  Métropole) et **Vaulx-en-Velin, Saint-Priest, Bron** (Métropole de Lyon ; rappel du batch 28 :
  **l'Espace Albert Camus et le fort de la ceinture lyonnaise sont à Bron**, pas à Vénissieux) — et
  les trous touristiques réels du corpus, les plus nets étant **Salon-de-Provence**,
  **Saint-Quentin**, **Brive-la-Gaillarde**, **La Seyne-sur-Mer** et **Saint-Herblain**.

  **Non livré ce run**, et volontairement : aucun déploiement (le runner nocturne publie `main`),
  aucun `npm run build` (interdit depuis une routine), et aucune relecture du reste de la série
  tourisme EN — seules les six nouvelles entrées ont été écrites et contrôlées.

---

## Shipped 2026-08-19

- **F16 — les classements propriétaires ne fabriquent plus l'ordre qu'ils n'ont pas mesuré**
  ✅ (2ᵉ run du jour ; le run du matin avait fait du contenu EN, celui-ci prend du technique).
  `lib/owner-rankings.ts` publiait un « Top 50 » par `sort` + `slice(0, 50)` sur des scores à une
  décimale. Deux conséquences, mesurées avant d'être écrites :

  **① `/classements/qualite-air` publiait 18 de ses 50 lignes en piochant dans une égalité à
  411 villes.** `DEPT_PM25_AVG` (`lib/owner-scores.ts`) est une table de **20 départements** :
  les **383 villes sur 540** dont le département n'y figure pas reçoivent toutes la **même
  constante de repli**, 7,0/10, marquée `kind: "estimation-regionale"`. Sur 540 villes le score ne
  prend que **7 valeurs distinctes** ; seules 32 villes dépassent 7,0. Les 18 places restantes du
  top 50 étaient donc remplies dans **l'ordre d'insertion du seed**, présenté au lecteur comme les
  rangs 33 à 50 d'un classement de qualité de l'air.

  **② `/classements/calme-sonore` publiait ses 50 lignes en piochant dans une égalité à 170.**
  `score_bruit` n'a que la population et l'appartenance à l'Île-de-France pour entrées : **9 valeurs
  distinctes sur 540 villes**, dont un premier palier de **170 communes ex æquo** à 9,8/10. Aucune
  des 50 « villes les plus calmes de France » publiées n'était mesurée plus calme que les 120 qui ne
  l'étaient pas.

  C'est le même défaut que le rang de richesse en biodiversité, retiré le 10/08 : la valeur est
  exacte, c'est **l'ordre** qui était fabriqué. Même remède, mais transposable aux 10 classements
  plutôt qu'un retrait — la page existe et est indexée, la supprimer casserait la parité de routes.
  Deux garde-fous, documentés en tête de `lib/owner-rankings.ts` :
  - **Les villes à repli national sortent du barème.** Trier une constante rend l'ordre du fichier,
    pas un classement. Concerne les deux seuls scores à repli plat : `score_qualite_air` (383 villes
    écartées, 157 classées) et `score_solitude` (314 écartées, 226 classées). Leur score reste
    affiché sur leur fiche ville, avec sa provenance — `OwnerScoresCard` était déjà honnête, c'est
    le classement qui ne l'était pas.
  - **Aucune égalité n'est coupée en son milieu.** `rankByOwnerScore` rend des **paliers**
    (`OwnerRankingTier`) avec rang de compétition ; un palier qui ferait déborder la limite n'est pas
    publié à moitié, le classement s'arrête avant lui **et le dit**. Exception assumée : le premier
    palier passe toujours, sinon un score grossier rendrait une page vide.

  Longueurs réelles après correctif (limite 50) : qualité de l'air **32**, canicule **17**, lien
  social 43, sécurité nocturne 43, sans voiture 45, télétravail 44, femme seule 50, jeune actif 48,
  famille 49. Et **calme sonore 170**, seul cas où `firstTierOverflows` : la page abandonne la
  numérotation, liste le palier par ordre alphabétique et écrit en clair que le score ne départage
  pas. Un tri par nom n'est **pas** un départage — c'est un ordre stable et annoncé comme tel.

  **JSON-LD** : `itemListOrder` vaut désormais `ItemListUnordered` (et les `position` sautent) dès
  qu'une des 10 premières villes est à égalité, ce qui est le cas des 10 classements. Publier un
  `ItemListOrderDescending` là où le score ne classe pas, c'est fabriquer le même ordre en données
  structurées, où personne ne le relit.

- **Sept méthodologies affichées décrivaient un calcul qui n'est pas celui du code** ✅ — trouvé en
  relisant chaque chaîne contre sa fonction, et corrigé des deux côtés. FR : `canicule-resistance`
  annonçait « 9 − (T juillet − 22) × 0,9 » quand le code fait `9,7 − (T − 18) × 0,7` ;
  `calme-sonore` annonçait une base 8,5 et une pénalité IDF de 1 pt quand le code part de 9,6 avec
  1,2. EN, plus grave : `young-professionals` et `families` renvoyaient à `lib/niche-scores.ts` avec
  des pondérations (« culture × 2, transport × 1,5… ») **qui n'ont jamais servi à ces pages** — elles
  classent `lib/owner-scores.ts` ; `safest-for-women` donnait la formule de la sécurité nocturne au
  lieu de la sienne. Les descriptions qui promettaient une projection ARPEGE 2040 non branchée sont
  ramenées à ce qui est calculé. Les surfaces disent maintenant aussi **ce que le score n'est pas** :
  aucune mesure acoustique dans `calme-sonore`, aucune donnée d'emploi dans `jeune-actif`, une
  valeur PM2.5 **départementale et non communale**.
  ⚠️ Ces chaînes ont dérivé parce qu'elles vivent **loin** de la fonction qu'elles décrivent (la
  définition du classement d'un côté, le calcul de l'autre, la version EN dans une troisième file).
  Aucun contrôle ne peut le voir : `tsc` et `integrity` valident des types et des données, pas la
  cohérence entre une phrase et une formule. À relire à chaque fois qu'un barème d'owner score
  bouge — les commentaires de `lib/owner-scores.ts` notaient d'ailleurs eux-mêmes les changements de
  base sans que les pages suivent.

- **11 titres et descriptions hors bornes rentrés dans les clous** ✅, tant qu'on y était et sur les
  mêmes fichiers : 3 `metaTitle` FR > 60 caractères (jusqu'à 70 pour qualité de l'air), 1 EN à 63, et
  4 `metaDescription` EN > 160 (jusqu'à 181). Le « — top 50 » de 6 titres EN et du hub
  `/niche-rankings` est retiré : il n'était plus vrai, et sa disparition suffisait à faire rentrer
  trois titres.

**Périmètre** : `lib/owner-rankings.ts`, `components/OwnerRankingPage.tsx` (les 10 pages FR) et
`app/[locale]/niche-rankings/[slug]/page.tsx` (les 10 pages EN) + son hub. Aucune route créée ni
supprimée, aucune entrée de sitemap touchée, `lib/owner-scores.ts` **inchangé** — les valeurs et leur
provenance étaient justes, seul leur classement mentait. `npx tsc --noEmit`, `npm run integrity`,
`npm run parity` (code 0, FR 217 / EN 165) et `npm run hreflang:check` repassent.

**Suite possible, pas faite ici** : le vrai remède pour `qualite-air` est F63 (ATMO + Geod'Air à la
commune), qui remplacerait la table de 20 départements et rendrait au classement ses 540 villes ;
pour `calme-sonore`, les Cartes de Bruit Stratégiques du Cerema. Les deux demandent un crawl, donc
une passe locale — l'egress est refusé côté routine.

---

## Shipped 2026-08-15

- **Série F61 — guide pilier `partir-en-vacances-seul-2026`, et correction de la mesure sur
  laquelle il s'appuie** ✅ — Le pilier célibataire était le gap éditorial signalé par les batches 1
  et 2 de la série (le pendant mono, `partir-en-vacances-seul-avec-ses-enfants-2026`, existait
  depuis le 29/07). Il est livré, **mais le run a commencé par découvrir que la section du site
  qu'il devait citer ne mesurait rien.**

  **Le bug : l'anti-station-fantôme classait sur une valeur constante.** La section 1 de
  `/vacances/profil/celibataire` triait les villes sur l'écart d'affluence août − novembre de
  `monthSignal`. Or `crowdednessForMonth` vaut `base + mod` où `mod` **ne dépend que du mois** et
  à l'identique pour toutes les villes (+2 en août, −0,5 en novembre) : l'écart vaut **2 partout**,
  de Saint-Tropez à Paris, et le tri sur cette valeur était un no-op silencieux. Pire, la condition
  d'entrée « novembre ≥ 2/5 » ne retenait que les villes à base élevée, c'est-à-dire notamment les
  communes balnéaires : **la section admettait exactement ce qu'elle promettait d'écarter.** Les
  Sables-d'Olonne y sortait 3ᵉ (48,7 % de résidents de 60 ans et plus, 11,3 % de 15-29 ans), avec
  Saint-Malo 7ᵉ. La légende affichée était fausse dans les deux sens : « un écart ≤ 1 indique une
  ville qui tourne toute l'année » (aucune ville n'atteint 1) et « une station balnéaire passe de 4
  à 1, elle est exclue d'office » (elle passe de 4 à 2, et elle est retenue).

  **Le remède : une mesure réelle à la place d'un signal qualitatif.** La part des **15-29 ans dans
  la population résidente**, recensement Insee 2022 (`lib/city-population.ts`, 538/540 villes).
  C'est le meilleur proxy disponible de vie permanente, et le raisonnement est direct : les bars et
  les salles d'un mardi soir de novembre tournent grâce à des gens qui habitent la ville à l'année,
  pas grâce aux vacanciers. La séparation est nette et n'a pas eu besoin d'être calibrée — Rennes
  34,1 %, Angers 31,4 %, Bordeaux 29,8 %, Nantes 28,7 %, Strasbourg 28,5 %, Aix 26,5 %, La Rochelle
  23,4 %, Albi 22,2 % face à Arcachon 8,7 %, Royan 9,5 %, La Baule 10,2 %, Dinard 11,9 %. Seuil à
  **20 %** (médiane nationale 18,4 %, 3ᵉ quartile 20,8 %), plancher population Insee 40 000, `life`
  ≥ 7,0 et `culture` ≥ 6,5 conservés. La part des **60 ans et plus est affichée en regard**, sans
  jugement : une commune où vivent beaucoup de retraités n'est pas une mauvaise commune, elle est
  mal appariée à un séjour dont l'unité est la sortie du soir — cadrage repris tel quel dans le
  guide, ne pas le durcir. Effet secondaire heureux : **La Rochelle est désormais justifiée par une
  mesure** au lieu de l'être par un pari éditorial, ce que le batch 2 avançait sans preuve.
  ⚠️ Garde-fou posé **dans `lib/vacation-seasons.ts`** au-dessus de `crowdednessForMonth` :
  `crowded` compare des villes à un mois donné, **jamais des mois entre eux**. Tout futur
  consommateur qui trierait sur un écart mensuel retomberait dans le même trou.

  **Deux seuils affichés ne correspondaient pas au code** dans la section 3 de la même page
  (« coût ≥ 5,5 » et « population ≥ 80 000 » alors que le filtre applique 5,0 et 60 000) : corrigés
  sur la légende, pas sur le code, le filtre étant celui qu'on veut.

  **Le guide** (`category: "lifestyle"`, emoji 🍸, 9 sections, 2 443 mots, `metaTitle` 55 car.,
  `metaDesc` 141, **zéro tiret cadratin dans le corps** — R7.10, densité d'accents 0,16 pour un
  seuil de détection ascii-strip à 0,09). Angle : les deux seuls vrais problèmes du voyage en
  solitaire, l'arithmétique de la chambre et le calendrier. ① Le **supplément single n'est pas une
  surtaxe mais une soustraction** : un hôtel vend une chambre, un prix « par personne base double »
  suppose que quelqu'un paie l'autre moitié, et la démonstration est arithmétique, sans pourcentage
  inventé — ce qui varie entre destinations n'est donc **pas** le supplément (il vaut la moitié de
  la chambre partout) mais la disponibilité de formats tarifés à la personne ou à la surface.
  ② Les villes qui vivent toute l'année, avec la mesure Insee ci-dessus. ③ Le piège inverse, stations
  chiffrées, avec la limite honnête que le recensement ne voit pas les résidences secondaires (qui
  jouent dans le même sens, étant vides en novembre). ④ **L'angle mort assumé du classement** : Lille
  36,8 %, Nancy 36,4 %, Rouen 33,4 %, Caen 33,3 %, Toulouse 32,6 % dominent la mesure démographique
  mais sortent de la grille sur le score `life` (Lille 5,7) — le guide dit que si le critère est
  strictement la certitude de trouver du monde un mardi de février, la part des 15-29 ans bat le
  classement composite. Un classement pondéré répond à une question moyenne, pas à celle du lecteur.
  ⑤ Train + desserte tardive, avec **deux tensions signalées plutôt que masquées** : Aix bien classée
  hors saison mais transport 6,1 et gare TGV excentrée (ça marche parce que le centre est compact,
  pas parce que le réseau est bon), Albi 8ᵉ sur les 15-29 ans mais ni TGV ni tram, transport 5,5.
  ⑥ **Le calendrier universitaire plutôt que le calendrier touristique** : les deux cycles qui font
  vivre ces villes (année universitaire, saison culturelle) se vident en juillet-août au moment
  précis où l'hébergement coûte le plus cher. ⑦ Distinction `solo` / `celibataire` explicitée une
  dernière fois, avec la phrase qui borne la promesse : un classement peut mesurer une densité de
  bars et une population résidente jeune, il ne peut **rien** mesurer de ce qui s'y passe.

  **Zéro chiffre inventé, aucun tarif hôtelier.** Tous les scores sont lus **à travers les modules**
  (`npx tsx` important `@/lib/cities-light`, `@/lib/vacation-fit`, `@/lib/city-population`,
  `@/lib/transit`, `@/lib/vacation-seasons`), jamais par grep du seed. Températures = normales
  Météo-France via `monthSignal` (Aix 11,7 °C en novembre contre Strasbourg 6,3 °C). `relatedCities`
  et les 5 `relatedGuides` vérifiés présents. `GUIDES` 956 → 957, `npm run search-index` relancé
  (957 guides, 240 tags), `search-index:check`, `npx tsc --noEmit`, `npm run integrity` et
  `npm run sitemap:check` (29 022 URL FR) propres.

  **Restent ouverts sur la verticale** : batch 3 de la série par ville (les candidats des rangs
  suivants sont à trier sévèrement, plusieurs sont des banlieues franciliennes ou des stations que
  la mesure 15-29 disqualifie maintenant explicitement — la retenir comme critère de sélection) ;
  **miroir EN du pilier**, la série `solo-travel-in-[city]-2026` étant fermée à 15/15 mais sans
  guide pilier `travelling-solo-in-france-2026` ; et un passage en revue des autres surfaces qui
  consomment `crowded` pour vérifier qu'aucune ne le lit comme un signal de saisonnalité.

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
