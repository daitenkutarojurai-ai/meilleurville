# Expat retour

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Section d'origine conservée mot pour mot.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


### Expat retour (`lib/expat-return.ts`)

Une fiche par pays de départ, données inline (`EXPAT_COUNTRIES`), rendues par
`app/expat-retour/[pays]/page.tsx` (URL `/expat-retour/depuis-<slug>`). Ajouter une entrée au
tableau suffit : `generateStaticParams`, le hub et le sitemap en dérivent tous les trois.
**Compteur mesuré (`grep -c '^    slug: "'`) : 26 pays** (2026-10-19). Dernier ajouté : **Tunisie** — fiche courte, assumée : seuls les faits recoupés par recherche web sont écrits (conventions SS du 17/12/1965 + accord vieillesse du 12/09/1975 + convention de juin 2003, convention fiscale du 28/05/1973, EUR/TND 3,3646 au 08/10/2026 cours BCT, réexportation de billets 5 000/30 000 TND, lycées AEFE de Tunis/La Marsa/Sfax). ⚠️ Points laissés ouverts faute de source, ne pas les « compléter » : ce que la convention de 2003 donne réellement au retour (jour de signature 23 ou 26 juin selon les sources), article pensions de la convention fiscale, règles de résidence tunisiennes, transfert d'épargne d'un résident qui part, liste d'échange des permis, statut animal. Les 9 `bestSuitedCities` sont une sélection éditoriale. Pas de jumelle EN. Précédent : **Vietnam** — fiche plus courte que les trois précédentes, assumée : fil conducteur = **on solde l'impôt avant le vol** (décret 126/2020, suspension de sortie levée sous 24 h ouvrables après règlement ; employeur mandatable ; garantie bancaire) ; **aucune convention de sécurité sociale** (années vietnamiennes = zéro trimestre, remboursement en capital seule récupération ; loi 41/2024/QH15 en vigueur le 01/07/2025) ; convention fiscale du 10/02/1993 (décret 94-1101, en vigueur le 01/07/1994). ⚠️ **Trois points laissés ouverts faute de source, ne pas les « compléter » sans l'avoir établi** : si le Vietnam figure sur la liste d'échange des permis (arrêté du 12/01/2012, liste en révision — la fiche bâtit sur le cas défavorable), le seuil de pension 15 ou 20 ans et la restriction aux nouveaux affiliés, et la règle de rapatriement de l'épargne d'un salarié étranger (les sources ne couvrent que les bénéfices de sociétés). Aucun loyer vietnamien publié. EUR/VND ≈ 30 000 en juillet 2026 (aucune cotation d'octobre relevée). Les 10 `bestSuitedCities` sont une **sélection éditoriale, non un calcul**, et la fiche le dit. Pas de jumelle EN. `tsc`, `integrity`, `sitemap:check` (FR 30 036), `hreflang:check` verts ; `npm run build` non lancé. Précédent : **Israël** — la fiche
dont le fil conducteur est qu'**on quitte le pays deux fois, devant deux administrations, et qu'aucune des
deux ne le fait toute seule**. Côté fisc, il n'existe **aucun formulaire qui prononce** la fin de la
résidence : elle s'apprécie au centre des intérêts vitaux, avec des présomptions de séjour (183 jours dans
l'année, ou 30 jours dans l'année et 425 sur cette année et les deux précédentes) que **l'une comme l'autre
partie** peut renverser en supportant la charge de la preuve. ⚠️ **Le formulaire 1348 existe** — premier jet
corrigé, j'avais écrit « il n'y a pas de formulaire » : c'est une **déclaration de résidence** par laquelle
on soutient que son centre de vie est ailleurs, donc une position que l'administration peut contester des
années plus tard, pas une notification qui clôt quoi que ce soit. S'y ajoute l'**exit tax de l'article 100A**
de l'ordonnance de l'impôt sur le revenu : les biens sont **réputés vendus la veille** de la perte de
résidence, et le **report du paiement jusqu'à la cession réelle est le régime par défaut** (le contribuable
est réputé l'avoir choisi), la part israélienne se calculant à la vente au prorata de la durée de détention
antérieure à la sortie. Côté social, la **résidence Bituah Leumi est un statut distinct**, décidé par un
autre organisme : elle prend fin sur déclaration ou automatiquement après **cinq ans** hors du pays, et sans
déclaration **les cotisations minimales courent jusqu'à cinq ans** et fabriquent une dette qu'on découvre au
retour. Au retour en Israël, la **période d'attente** se compte à raison d'**un mois par tranche de 25 jours
consécutifs** passés sur place, rachetable par un paiement spécial.
⚠️ **Le réflexe faux du dossier est symétrique de celui des trois fiches précédentes, et il faut le garder
tel quel : « il y a une convention, donc je suis couvert » est faux.** La convention générale du **17
décembre 1965** (décret n° 66-784 du 14 octobre 1966) **totalise** bien les périodes pour la retraite — à
l'inverse du Mexique, de la Thaïlande et de la Chine, où les années valent zéro trimestre — mais elle **ne
comporte aucune disposition** ouvrant la prise en charge des soins en France au titre d'une retraite
israélienne. **Il n'y a donc pas de S1**, qui est un instrument du droit de l'Union et non des conventions
bilatérales : PUMa de droit commun, 3 mois de résidence puis instruction. Le chômage, comme dans toute
convention bilatérale, est hors champ.
⚠️ **Et l'épargne retraite se traite à l'inverse du Mexique, du Brésil, de la Chine et de la Thaïlande** :
un fonds israélien **continue de fructifier pour un non-résident et verse sa rente à l'étranger** par
virement international à partir de l'âge de la retraite, alors qu'un **retrait anticipé subit 35 %** de
retenue. La bonne décision est de **ne pas y toucher** — kupat gemel sans pénalité à partir de 60 ans,
keren hishtalmut disponible et non imposée après six ans. Quatre fiches d'affilée installaient l'habitude
inverse.
Autres faits vérifiés en ligne et qui portent la fiche : convention fiscale signée à Jérusalem le **31
juillet 1995**, en vigueur le **18 juillet 1996** (loi n° 96-503 du 11 juin 1996, décret n° 96-814 du 11
septembre 1996), modifiée depuis par la convention multilatérale ; barème IR 2026 à sept tranches, **10 %
jusqu'à 84 120 ILS** puis 14, 20, 31, 35 et 47 % jusqu'à **721 560 ILS**, au-delà desquels une **surtaxe de
3 %** porte le marginal à 50 % ; **TVA 18 %** depuis le 1ᵉʳ janvier 2025 (contre 17 %), donc **sous** les
20 % français ; cotisation nationale + prélèvement santé du salarié ~**4,27 %** sous **7 703 ILS/mois** et
~**12,17 %** au-dessus, plafond **51 910 ILS/mois** ; pension de vieillesse forfaitaire 2026 **1 838
ILS/mois** seul et **2 762 ILS** en couple ; âge de la retraite **67 ans** pour les hommes, **62 → 65 ans**
pour les femmes sur onze ans par cohorte (65 ans pour celles nées en 1970 ou après), loi de finances 2022 ;
exonération de dix ans des olim maintenue mais **l'amendement n° 272**, publié en **avril 2024**, supprime
l'exonération **de déclaration** pour qui devient résident à compter du **1ᵉʳ janvier 2026** (ceux arrivés
jusqu'à fin 2025 la gardent) ; loyer moyen national **5 027 ILS** au T1 2026 (+3,5 % sur un an), Tel-Aviv
**7 351**, Jérusalem **5 280**, Haïfa T3 **3 082** et T4 **3 937**, districts Tel-Aviv 6 338 / Centre 5 386
/ Jérusalem 5 232 / Haïfa 3 665 / Sud 3 632 ; parc automobile **entièrement importé**, taxe d'achat + TVA
renchérissant le prix hors taxe de **115 à 130 %**, taxe d'achat électrique **52 % en 2026** (plafond
d'avantage 30 000 ILS) contre 45 % et 35 000 ILS en 2025 ; indice de niveau des prix **138** pour une
moyenne OCDE à 100 en **2022**, le plus élevé du groupe alors, **en recul de plus de dix points entre 2021
et 2023** ; année scolaire de septembre à la mi-juin, réseau AEFE avec le **collège français Marc-Chagall**
(Tel-Aviv, 1966), le **collège-lycée Marcel et Lucette Drahi** (Holon) et le **collège des Frères**.
⚠️ **Deux chiffres volontairement omis, sources divergentes ou datées — ne pas les « compléter »** : la
**taille de la communauté** (le registre est réparti sur **trois circonscriptions consulaires**, Tel-Aviv,
Haïfa et **Jérusalem, poste autonome qui ne relève pas de l'ambassade** — la fiche le dit pour la radiation,
et s'arrête là, les estimations publiées allant du simple au double et les comptes trouvés datant de
2014-2016) ; et la **moyenne mensuelle EUR/ILS d'août 2026**. Sur ce second point, un piège à retenir :
**les « moyennes mensuelles » que les sites de change placent en tête de résultats sont souvent des
prévisions et non des relevés** — celle trouvée d'abord (3,476, fourchette 3,377-3,584) est une projection.
La fiche publie **environ 3,45 shekels pour un euro, fourchette voisine de 3,42 à 3,48**, appuyée sur des
cotations de jours réels.
⚠️ **Le permis israélien : divergence de sources publiée telle quelle, et le plan est bâti sur le cas
défavorable.** Plusieurs réponses ministérielles à des questions écrites de l'Assemblée nationale énoncent
qu'Israël **ne figure pas** sur la liste de l'arrêté du **12 janvier 2012** (circulaire du **3 août 2012**),
et en donnent la raison, ce qui les rend crédibles : la partie israélienne voulait maintenir examen, test
d'acuité visuelle et taxe pour les permis français présentés à l'échange en Israël, ce qui contredit la
conception française de l'échange. En face, des listicles de 2026 rangent Israël parmi les pays
conventionnés **sans citer de texte**. La fiche publie les deux, renvoie à la liste en vigueur et
**construit le conseil sur l'hypothèse défavorable** (un an de reconnaissance, puis code et conduite) :
c'est la mieux étayée, et la seule dont l'erreur coûte cher.
⚠️ **L'animal : la réglementation a été refondue en 2026 et le statut d'Israël n'a pas pu être établi.** Le
**règlement d'exécution (UE) 2026/636 du 20 mars 2026** porte désormais les listes de pays tiers, le
**règlement (UE) n° 577/2013 étant abrogé** et le **règlement délégué (UE) 2026/131** prenant le relais.
Quatre tentatives (EUR-Lex, autorités vétérinaires nationales, ministère) sont revenues **403 CONNECT** ou
sans la lettre I de la liste : la fiche **n'affirme rien**, renvoie aux services vétérinaires et bâtit le
calendrier sur le cas non listé (titrage ≥ **0,5 UI/ml** sur prélèvement ≥ **30 jours** après vaccination,
puis **3 mois** d'attente), parce que c'est le seul dont l'erreur coûte un trimestre.
🔧 **Corrigé au passage dans la fiche Mexique** : elle citait deux fois le **règlement (UE) n° 577/2013**
comme le texte en vigueur, alors qu'il est abrogé depuis la refonte ci-dessus. Le fond ne bouge pas (la
refonte reprend les mêmes listes), c'est **le numéro cité qui était périmé** — les deux passages nomment
désormais le texte courant et invitent à vérifier la liste avant de réserver.
✅ **Nouvelle valeur d'article, et c'était nécessaire, pas cosmétique.** `CountryArticle`
(`lib/country-article.ts`) gagne **`d'`**, pour un nom qui **refuse l'article** tout en **commençant par une
voyelle**. Avec `""`, deux dérivations sur quatre sortaient fausses (« Rentrer **de Israël** en France » en
og:title, « **À Israël** » en en-tête de tableau, « … ou **de Israël** » dans l'énumération du hub) ; avec
`l'`, c'étaient le `<title>` et le H1 (« depuis **l'Israël** »). **Aucune des cinq valeurs existantes
n'était juste**, donc le défaut ne se corrigeait pas par un meilleur choix dans l'ancienne union, et
**aucun garde ne l'aurait vu** : le garde `expat` de `npm run integrity` contrôle les surfaces, pas la
justesse d'une valeur d'article. Les **23 fiches existantes sont inchangées** (dérivations vérifiées une à
une après la modification), et ⚠️ **l'élision se saisit, elle ne se devine pas** : tester l'initiale du nom
serait une heuristique sur une chaîne, exactement ce qui a produit le `isCoastal` par sous-chaîne de City
Match — un h muet (« d'Haïti ») et un h aspiré se ressemblent à la lettre près. Même classe : Oman, Haïti,
Aruba.
Les 10 `bestSuitedCities` **sont un calcul et la fiche le dit** : `npx tsx` de scratch sur les **116
communes métropolitaines de plus de 50 000 habitants** dont `data/housing.ts` publie un loyer, notées sur la
**facilité** d'accès aux soins (30 %, soit `10 - computeHealthcareAccess().composite`, l'inversion étant au
site de lecture), l'accessibilité du T3 (25 %), la continuité climatique (25 %, moyenne de `avgTempJanuary`
et de `sunshinedays`) et `life` (20 %). Résultat : Cagnes-sur-Mer, Montpellier, Nice, Béziers,
Aix-en-Provence, Nîmes, Hyères, Marseille, Grasse, Toulon — un arc méditerranéen continu, **4 villes
communes sur 10 avec la fiche Maroc**, ce que la fiche assume. Départage : le 10ᵉ (Toulon 7,27) et le 11ᵉ
(Fréjus 7,16) sont séparés de plus d'un dixième, donc **aucun palier n'est coupé au rang 10** ; mais **six
villes partagent la même note arrondie (7,3)**, donc les rangs 5 à 10 sont **un ordre stable et non un
départage**, et la fiche le publie.
⚠️ **Correction de méthode à ne pas défaire : le vivier est métropolitain parce que l'axe climatique
détectait les tropiques.** Sur les **127** communes de plus de 50 000 habitants **DROM compris**, le même
barème donnait Fort-de-France, Saint-Denis, Saint-Pierre, Saint-Paul et Les Abymes aux **cinq premières
places**, puis Cayenne et Mamoudzou dans les seize premières. La cause n'est pas une préférence du modèle :
normalisée sur les 540 villes, la température de janvier cesse de mesurer une continuité méditerranéenne et
**écrase les 1 à 10,5 °C de la métropole dans le bas de son échelle**. Restreint à la métropole, l'axe
redevient un gradient réel (1 à 10,5 °C, 1 480 à 2 900 h d'ensoleillement). Les villes ultramarines ne sont
pas écartées comme mauvaises destinations : **l'axe ne mesurait plus ce que son nom annonçait**.
Mesure maison publiée dans la fiche : au taux d'août 2026, la moyenne de Tel-Aviv (**7 351 ILS ≈ 2 115 €**)
**dépasse 537 des 540 loyers T3** que nous publions, seuls Paris (2 800 €), Saint-Tropez (2 600 €) et
Neuilly-sur-Seine (2 500 €) restant au-dessus ; la moyenne nationale israélienne (**5 027 ILS ≈ 1 446 €**)
en dépasse **487 sur 540**, pour un T3 médian français de **930 €**. ⚠️ La fiche dit que **les deux chiffres
ne mesurent pas le même objet** (moyenne israélienne tous types de logements contre loyer de référence d'un
trois-pièces), donc l'écart est un ordre de grandeur. Le `netConversionFactor` est **0,25 contre un taux de
marché à 0,29**, l'inverse du Maroc, du Mexique et de la Thaïlande, et la fiche dit que c'est un **ordre de
grandeur raisonné et non une PPA mesurée** — aucun rapport France/Israël n'a pu être établi ce run.
Aucune page EN : `israel` n'est pas dans `EN_EXPAT_COUNTRY_SLUGS`, donc pas de hreflang à câbler. Contrôles :
`npx tsc --noEmit` **propre**, `npm run integrity` (24 fiches, 6 jumelles EN toutes réelles),
`npm run sitemap:check` (FR **29 267 URL**, soit exactement la fiche neuve ; EN 28 855 inchangé),
`npm run parity` (code 0), `npm run hreflang:check`, plus un contrôle des quatre tournures sur les 24 fiches
(titre max **53/60**, description max **156/160**), des 10 slugs contre `CITIES_SEED`, et de l'encodage
(densité d'accents **0,168** par mot contre un seuil ascii-strip de 0,09, aucun `m2` / `EUR` / `deg` ascii,
aucun mojibake, **1 seul em-dash** pour 4 831 mots là où la cible R7.10 en tolère ~24).
`npm run build` **non lancé, volontairement** (cf. § Commands depuis le batch 27).
⚠️ Egress : `legifrance.gouv.fr`, `service-public.fr`, `diplomatie.gouv.fr`, `securite-routiere.gouv.fr`,
`eur-lex.europa.eu`, `cleiss.fr`, `taxsummaries.pwc.com` et la plupart des sites d'autorité répondent
**403 CONNECT** en `WebFetch` depuis la routine, alors que la **recherche web fonctionne** : les faits ont
donc été recoupés sur plusieurs résultats plutôt que sur une fiche unique, méthode déjà retenue au batch 48
et à la section glossaire.
Avant-dernier ajouté : **Mexique** — la
fiche dont le fil conducteur est **une date, et elle tombe avant le vol**. L'avis de changement de
résidence fiscale se dépose auprès du SAT **au plus tard dans les quinze jours qui précèdent** le
changement, et pas plus de deux mois à l'avance (dernier alinéa de l'**article 9 du CFF**, fiche
85/CFF) ; à défaut, **on ne perd pas la qualité de résident mexicain** et le Mexique reste fondé à
imposer les revenus mondiaux, sans rattrapage possible depuis la France. ⚠️ **C'est l'exact inverse du
calendrier brésilien** (Comunicação de Saída Definitiva jusqu'au dernier jour de février de l'année
suivante) : le réflexe pris sur la fiche voisine est ici la faute. Et symétriquement, l'année du départ
**on ne dépose pas de déclaration annuelle** — l'**article 150 de la LISR** fait des paiements
provisionnels un paiement définitif et interdit la déclaration à qui change de résidence en cours
d'année. Une démarche impérative avant, une démarche à ne pas faire après.
Le second fait structurant : **il n'existe aucune convention de sécurité sociale France-Mexique**
(vérifié ce run). Négociations ouvertes en **1981**, jamais abouties ; la France est liée à **42 États
ou territoires** couvrant **plus de 80 %** de sa population expatriée, et le Mexique est dans le
cinquième restant alors qu'il abrite **la première communauté française d'Amérique latine, plus de
20 000 personnes**, et qu'il est le **deuxième partenaire commercial** de la France sur le continent —
quand le Brésil, l'Argentine, le Chili, l'Uruguay, le Canada et les États-Unis ont la leur. Donc zéro
trimestre français, ni S1 ni totalisation, PUMa de droit commun au retour (3 mois de résidence +
2-3 mois d'instruction).
⚠️ **Cinq réflexes faux, corrigés par vérification avant rédaction.** ① **Quitter le Mexique n'ouvre
aucun droit de retrait de l'Afore** : le départ définitif n'est pas un cas de retrait, le retrait total
suppose une **résolution ou une negativa de pensión** de l'IMSS, donc **60 ans au plus tôt** — un
rentrant de 38 ans ne touche rien pendant vingt-deux ans. Même famille que le FGTS brésilien et que le
compte individuel chinois, mais plus fermée que les deux. ② Le barème monte : **875 semaines cotisées
en 2026** (plancher de 750 relevé de 25 par an, 1 000 en 2031) ; en dessous, negativa de pensión =
solde versé en une fois mais **perte de la rente et du service médical**. ③ Le versement **ne part que
sur un compte bancaire mexicain** au nom du titulaire (RFC avec homoclave + CLABE), d'où la consigne de
ne pas fermer le compte et de laisser une **procuration à un apoderado legal** — même piège que le
remboursement SSO thaïlandais. ④ **Le permis mexicain ne s'échange pas** : le Mexique n'est pas sur la
liste de réciprocité, dans aucun des deux sens — l'analogie latino-américaine (« le Brésil s'échange »)
est fausse. ⑤ **L'animal est le point facile, à l'inverse du dossier chinois** : le Mexique figure à
l'**annexe II du règlement (UE) n° 577/2013**, donc **dispensé de titrage sérique** — transposer le
calendrier chinois ferait perdre un trimestre pour rien.
Autres faits vérifiés et qui portent la fiche : **convention fiscale signée à Mexico le 7 novembre
1991**, en vigueur le **31 décembre 1992**, décret n° 93-285 du 1ᵉʳ mars 1993 ; barème ISR **1,92 % à
35 %** (taux plafond au-delà de **3 898 140 pesos**, art. 152 LISR), déclaration annuelle au **30
avril** ; **RESICO 1 % à 2,5 %** du chiffre d'affaires encaissé sans déduction jusqu'à **3 500 000
pesos/an** (art. 113-E) — d'où la consigne de demander sa **constancia de semanas cotizadas** avant de
rentrer, un expatrié payé en honorarios n'ayant ni semaines ni Afore (même piège que l'extrait CNIS du
dossier brésilien) ; **retiro por desempleo** à 46 jours qui **coûte des semaines cotisées** ;
**zone restreinte de l'article 27, fraction I, de la Constitution** (100 km des frontières, 50 km des
plages) où l'étranger passe par un **fideicomiso** bancaire de 50 ans renouvelable, c'est-à-dire
précisément là où la communauté est installée ; **résidence permanente de validité indéfinie**, l'ancien
**article 47 de la Ley General de Población** ayant été **abrogé le 25 mai 2011** sans remplacement,
contre une résidence temporaire bornée à 4 ans (art. 54 Ley de Migración, 18 mois d'absence cumulée
max) ; **Seguro de Salud para la Familia** annuel payé d'avance et revalorisé au 1ᵉʳ mars 2026, **annulé
sans remboursement** si l'IMSS diagnostique une affection préexistante la première année (art. 9,
fraction II, LSS) — c'est une des raisons pour lesquelles on rentre ; **EUR/MXN moyen 19,53** en août
2026 (19,09-20,00 dans le mois, soit près de 5 % d'écart entre le meilleur et le pire jour pour
rapatrier).
⚠️ **Un chiffre volontairement omis** : le montant de la cotisation IMSS des tranches âgées, les sources
secondaires divergeant (18 100 et 20 538 pesos) — la fiche donne les deux montants concordants (9 300
pesos pour 0-19 ans, 11 400 pour un adulte de 30 ans) et renvoie au portail de l'IMSS. Même doctrine que
le FPU en ALD du glossaire : une phrase sans chiffre vaut mieux qu'un chiffre faux.
Les 10 `bestSuitedCities` **sont un calcul et la fiche le dit** : `npx tsx` de scratch sur les **127
communes de plus de 50 000 habitants** dont `data/housing.ts` publie un loyer, notées sur `remoteWork`
(30 %), `life` (25 %), accessibilité du T3 (25 %) et **facilité** d'accès aux soins (20 %, soit
`10 - computeHealthcareAccess().composite`, l'inversion étant au site de lecture). Résultat : Rennes,
Nantes, Bordeaux, Angers, La Rochelle, Strasbourg, Annecy, Toulouse, Lyon, Villeurbanne — **aucune
égalité ne coupe le classement au rang 10**, et la dernière warning publie les deux réserves du barème
(La Rochelle et Annecy entrent malgré un accès aux soins bien plus difficile ; Annecy porte le T3 le
plus élevé des dix à 1 450 €). Les 22 chiffres de loyer et de m² cités sont contrôlés un à un contre
`data/housing.ts` (T3 médian du vivier **1 080 €**, m² médian **3 200 €**). Aucune page EN :
`mexique` n'est pas dans `EN_EXPAT_COUNTRY_SLUGS`, donc pas de hreflang à câbler. Contrôles :
`npx tsc --noEmit` **propre**, `npm run integrity`, `npm run sitemap:check` (FR 29 193 → **29 194 URL**,
soit exactement la fiche neuve ; EN inchangé), `npm run parity` (code 0), `npm run hreflang:check`, plus
une vérification d'encodage (accents intacts, densité 0,175 par mot contre un seuil ascii-strip de 0,09,
aucun `m2` / `EUR` / `deg` ascii, aucun mojibake) et une passe em-dash ramenée de 35 à **10** pour
4 647 mots (cible R7.10 : ~1 pour 200 mots). `npm run build` **non lancé, volontairement** (cf.
§ Commands depuis le batch 27).
✅ **Le nom de pays ne se compose plus à la main (2026-09-16).** La note qui vivait ici — le
`<title>` n'utilisait pas `depuisLabel` et rendait « Rentrer en France depuis Mexique » — sous-estimait
le défaut. `depuisLabel` et `auLabel` étaient **optionnels**, avec un repli `?? "le"` / `?? "Au"` écrit
dans le JSX, et **six fiches sur 23 ne les avaient jamais portés** : les pages publiaient « depuis
**le** Suisse », « **le** Belgique », « **le** Allemagne », les en-têtes de tableau assortis, et
« depuis **l' Espagne** » sur les quatre fiches en `l'` (le JSX insère une espace que l'élision
refuse). Les 23 `<title>`, `description` et `og:title` portaient par ailleurs le nom **nu**.
Désormais : champ **requis** `article` (`le` · `la` · `l'` · `les` · `""`), et les quatre tournures
dérivent de **`lib/country-article.ts`** — `countryWithArticle`, `countryFrom` (provenance),
`countryInLabel` (en-tête), `listCountriesFrom` (énumération du hub). Trois règles à ne pas défaire :
① **la dérivation reproduit à l'identique les 17 `auLabel` / `depuisLabel` écrits à la main**, 0 écart
contrôlé contre `HEAD` — c'est ce qui la valide, pas une intuition ; ② `countryFrom` n'est **pas** une
contraction mécanique : un féminin **perd** son article (« rentrer **de** Suisse »), un masculin
consonantique le garde contracté (« **du** Japon »), et `l'` couvre les deux genres exprès
(« l'Iran » → « d'Iran » → « En Iran ») ; ③ un composant **client** lit `@/lib/country-article`, qui
n'importe rien, et **jamais** `@/lib/expat-return`, qui les réexporte — importer une fonction en
valeur depuis la lib tirerait ses 248 Ko dans le bundle (mesuré : +220 o minifiés, +91 o gzip sur le
quiz, contre les 248 Ko qu'un import direct coûterait). Garde `expat` dans `npm run integrity` :
3 surfaces, il refuse « depuis {country.name} », un compte de pays en dur et le retour d'un champ à
repli. Deux dérives de compteur fermées au passage sur le hub, qui annonçait **18 pays** pour 23 et
nommait les 18 mêmes dans son intro — les deux se dérivent d'`EXPAT_COUNTRIES`.
✅ **La paire hreflang est déclarée (2026-09-17)**, ce qui était noté ici « reste ouvert ». La queue
est traduite (`depuis-suisse` ↔ `from-suisse`), donc elle s'écrit à la main avec `pathAlternates` /
`pathAlternatesEn` des deux côtés. Deux asymétries à ne pas « harmoniser » : ① côté **FR** le
`languages` est **conditionné sur `EN_EXPAT_COUNTRY_SLUGS`** — 6 fiches sur 23 ont une jumelle, les
17 autres gardent un canonical nu, et c'est le comportement juste ; ② côté **EN** la paire est
**inconditionnelle**, la route FR couvrant les 23 pays. Garde ajoutée dans `npm run integrity` :
tout slug de `EN_EXPAT_COUNTRY_SLUGS` doit être le slug d'une fiche réelle — un `Set` de littéraux
est bien typé même quand il porte une faute de frappe, et la faute produirait à la fois un
`notFound()` côté EN et un hreflang FR en 404. ⚠️ `hreflang:check` contrôle les chemins des paires
**déclarées** contre l'arbre de routes, pas l'égalité des deux `generateStaticParams` : celle-ci a
été **mesurée** ce run (6/6, 0 slug EN sans fiche FR) et reste à remesurer si l'un des deux
ensembles bouge.
Ajouté avant lui : **Thaïlande** — la
première fiche dont le fil conducteur n'est ni l'argent ni la fiscalité mais **la santé** : on rentre de
Thaïlande le plus souvent pour se faire soigner, et c'est exactement là que le dossier est le plus mal
armé. **Il n'existe aucune convention de sécurité sociale France-Thaïlande** (vérifié ce run) : ni
totalisation, ni portabilité, ni S1 — les années thaïlandaises valent **zéro trimestre** hors cotisation
volontaire à la CFE, et un rentrant sans emploi retombe sur la PUMa de droit commun (3 mois de résidence
+ 2-3 mois d'instruction). C'est le même trou qu'au dossier chinois, mais le rentrant type n'est pas le
même : le cadre de Shanghai a un contrat français qui l'attend, le retraité de Hua Hin a un diagnostic.
⚠️ **Quatre réflexes faux, corrigés par vérification avant rédaction.** ① **Le permis thaïlandais ne
s'échange pas** : la France échange ceux de la Chine, du Japon, de la Corée du Sud, du Vietnam et des
Philippines, pas ceux de la Thaïlande, faute d'accord de réciprocité — l'analogie « c'est l'Asie, comme
la Chine » est fausse, et c'est l'exact inverse du dossier chinois où l'échange marche. ② **Le
remboursement des cotisations SSO ne se demande pas depuis la France** : dépôt en personne au bureau du
SSO, part **salariale seulement** (celle de l'employeur est perdue), virement **uniquement sur un compte
bancaire thaïlandais**, 2 à 4 mois de délai, demande recevable 2 ans après le départ — fermer son compte
avant de partir revient à renoncer à l'argent. ③ **Il n'y a pas de matelas à rapatrier** : l'assiette de
cotisation est plafonnée (5 % sur 15 000 THB/mois jusqu'en 2025, **17 500 THB au 1ᵉʳ janvier 2026**, soit
**875 THB/mois** de chaque côté, une vingtaine d'euros) — un cadre bien payé a cotisé le même montant
qu'un employé au plafond, à l'inverse d'un compte individuel chinois ou d'un FGTS brésilien. ④ **La
pension française n'est pas imposable en Thaïlande**, mais l'écart entre le texte français de la
convention du **27 décembre 1974** et sa version anglaise traduite du thaï a exposé ~**1 500** pensionnés
à un risque de double imposition après la réinterprétation du 1ᵉʳ janvier 2024, avant que l'administration
thaïlandaise ne confirme l'exemption. Autres faits vérifiés : décrets **Por 161 / Por 162** (tout revenu
étranger rapatrié est imposable quelle que soit l'année d'acquisition, **sauf** les revenus acquis avant
le 01/01/2024, définitivement à l'abri), résidence fiscale à **180 jours**, déclaration avant le **31
mars**, barème 0-35 % avec 150 000 THB exonérés ; **quota de 49 %** de la surface des lots pour la pleine
propriété d'un appartement, **terrain non détenable** par un étranger, bail typique de 30 ans, et
**formulaire FET (ex-Tor Tor 3)** exigé pour rapatrier le produit d'une revente ; visa retraite à
**65 000 THB/mois** de revenu ou **800 000 THB** de dépôt, assurance O-A obligatoire depuis 2019
(40 000 THB ambulatoire / 400 000 THB hospitalisation) ; exonération LTR « Wealthy Pensioner » qui **tombe
avec le visa** ; année scolaire thaïlandaise de la mi-mai à début mars, **LFIB** (1957, réseau AEFE) au
calendrier français ; EUR/THB moyen **38,29** en août 2026 (38,10-38,55 dans le mois).
Le choix des 10 `bestSuitedCities` n'est pas éditorial : il sort d'un `npx tsx` de scratch croisant
`avgTempJanuary`, `sunshinedays`, `HOUSING` et `computeHealthcareAccess()` sur les 540 villes. Il donne
le résultat qui structure la fiche : **la communauté française de Thaïlande est littorale et retraitée**
(15 838 inscrits au registre en octobre 2025, +4,05 % sur un an, communauté réelle estimée > 40 000 ;
Bangkok 7 351 mais Pattaya 1 965, Phuket 1 905, Samui 1 323, Chiang Mai 1 200, Isan 1 034, Hua Hin 800),
donc **le retour atterrit sur la Méditerranée bien plus que sur l'Île-de-France**. Les 20 chiffres français
viennent de `data/housing.ts` et les scores cités sont lus dans `CITIES_SEED` via le module, pas dans le
seed source. Aucune page EN : `thailande` n'est pas dans `EN_EXPAT_COUNTRY_SLUGS`, donc pas de hreflang à
câbler (`parity` et `hreflang:check` repassés, verts). `sitemap:check` : FR 29 123 → **29 124 URL**, soit
exactement la fiche neuve.
Ajouté avant elles : **Brésil** — la
première fiche d'Amérique latine, région qui n'avait aucun pays sur les vingt précédents. Le fil
conducteur est que **la sortie fiscale brésilienne est un dépôt, pas un départ** : sans la
*Comunicação de Saída Definitiva do País* (à déposer de la date de départ jusqu'au **dernier jour de
février de l'année suivante**), la Receita Federal tient le partant pour résident pendant les **douze
mois d'absence** qui suivent, donc imposable au Brésil sur ses revenus mondiaux, salaire français
compris ; la *Declaração de Saída Definitiva* est un second document, déposé dans la fenêtre annuelle
de l'impôt (**23/03 → 29/05** pour l'exercice 2026). Trois autres faits vérifiés portent la fiche :
① l'accord de sécurité sociale signé le **15/12/2011** (accord d'application 22/04/2013, décret
n° 2014-1013) est **en vigueur depuis le 01/09/2014** et permet la totalisation des périodes INSS —
c'est l'exact inverse du dossier chinois, et son champ territorial vise **expressément les DOM,
Guyane comprise** ; ② le real est librement convertible (aucun quota, contrairement au yuan) mais les
décrets **12.466/2025 et 12.499/2025** ont porté l'**IOF de 1,1 % à 3,5 %** sur les virements vers un
compte de même titularité à l'étranger hors finalité d'investissement ; ③ la loi **15.270/2025**, en
vigueur depuis janvier 2026, exonère d'impôt les revenus jusqu'à **5 000 R$/mois** (réduction
jusqu'à 7 350 R$), le barème progressif à 27,5 % restant par ailleurs.
⚠️ **Quatre réflexes faux, corrigés par vérification avant rédaction.** ① **Partir n'ouvre aucun droit
de retrait du FGTS** : le départ définitif ne figure pas à l'article 20 de la loi 8.036/90 ; les voies
réelles sont le licenciement sans juste cause ou **trois ans consécutifs hors du régime**, déblocage au
mois anniversaire du titulaire. ② **Un expatrié payé en PJ n'a souvent rien cotisé** (ni FGTS ni part
patronale INSS) : l'accord permet de totaliser des périodes, pas d'en inventer — d'où la consigne de
sortir l'extrait **CNIS** avant de rentrer. ③ **L'accord de sécurité sociale ne fabrique pas de
S1** : un rentrant sans emploi retombe sur la PUMa de droit commun (trois mois de résidence + 2-3 mois
d'instruction), alors que l'accord couvre formellement le risque maladie-maternité. ④ La **prova de
vida annuelle** suit le pensionné INSS en France (blocage puis suppression du versement à défaut ;
certificat valable **90 jours**). Autres chiffres cités, tous sourcés : retenue à la source du
non-résident **25 %** sur le travail, **15 %** sur les loyers bruts, plus-values **15 à 22,5 %** ;
FipeZAP juin 2026 **64,98 R$/m²** de loyer à São Paulo, **59,87** à Rio ; EUR/BRL **5,94** de moyenne
en août 2026 (5,81-6,15 dans le mois) ; convention fiscale du **10/09/1971**, en vigueur depuis le
**10/05/1972** ; franchise de déménagement (12 mois de résidence hors UE, biens détenus > 6 mois,
**cerfa n° 10070**) ; frontière franco-brésilienne de **730 km** dont 430 sur l'Oyapock. Les 20
chiffres français viennent de `data/housing.ts` et les deux scores cités (Cayenne 3,9, Lyon 7,1) sont
lus dans `CITIES_SEED`, pas dans le seed source. Aucune page EN : `bresil` n'est pas dans
`EN_EXPAT_COUNTRY_SLUGS`, donc pas de hreflang à câbler.
✅ **Dette de perf soldée le 2026-08-27** (elle était notée ici « trouvée ce run, non corrigée ») :
`components/ExpatQuiz.tsx` importait `EXPAT_COUNTRIES` **en valeur** alors qu'il n'a besoin que de
`slug` / `name` / `flag` / `bestSuitedCities`, et embarquait les 190 Ko de prose de
`lib/expat-return.ts` dans le bundle du quiz. Le remède retenu n'est ni un allègement des fiches ni
un JSON généré : `EXPAT_COUNTRY_OPTIONS` (projection dérivée du tableau, en bas du même fichier)
descend **en prop depuis la page serveur** `app/expat-retour/quiz`, comme `CITIES_LIGHT` juste à
côté — donc rien à maintenir en double, une fiche ajoutée apparaît dans le quiz sans autre geste. Le
composant n'importe plus que des **types**, effacés à la compilation. Mesuré : 280 441 → 88 484 o
minifiés, 74 991 → 22 867 o gzip. **Ne pas réintroduire un import en valeur ici.**
Ajouté avant eux : **Chine** —
le seul dossier du site où la difficulté n'est ni fiscale ni culturelle mais **mécanique** : faire
sortir ses droits et son argent. Trois points vérifiés en ligne, et qui portent la fiche : ① **aucune
convention de sécurité sociale n'est en vigueur** entre la France et la Chine — signée le 31/10/2016,
arrangement administratif le 16/09/2019, avenant en 09/2023 après objection du Conseil d'État sur le
champ territorial, **jamais ratifiée** — donc les années chinoises valent **zéro trimestre français**
hors cotisation volontaire à la CFE, et il n'existe **ni S1 ni carte européenne** (d'où le trou de
couverture de 3 mois si le retour se fait sans emploi : PUMa sur critère de résidence, 2-3 mois
d'instruction) ; ② le yuan n'est pas librement convertible — quota annuel d'achat de devises plafonné
à **50 000 USD par personne**, réservé aux dépenses personnelles, contrôle bancaire renforcé au
**1ᵉʳ janvier 2026** au-delà de 5 000 CNY / 1 000 USD — donc l'épargne se rapatrie sur des années ;
③ le régime d'exonération d'IIT sur **huit catégories d'avantages en nature** (logement, scolarité…)
court jusqu'au **31/12/2027** et n'est pas cumulable avec les déductions additionnelles, si bien que
comparer un net chinois à un net français n'a pas de sens tant que le logement et l'école ne sont pas
réintégrés. Autres faits sourcés : règle des six ans (183 j/an, remise à zéro par une absence de plus
de 30 jours consécutifs, 2025 premier exercice où l'imposition mondiale peut se déclencher), accord
fiscal du 26/11/2013 en vigueur depuis le 28/12/2014, remboursement du seul **compte individuel** de
retraite au départ (part patronale mutualisée perdue, 15 ans pour ouvrir un droit).
⚠️ **Deux réflexes à ne pas appliquer ici.** Le permis chinois **s'échange** en France sans examen —
accord de reconnaissance réciproque signé le 23/11/2018, **en vigueur depuis le 17/08/2021**, pour les
permis délivrés à compter du 1ᵉʳ avril 2008 : l'intuition « hors UE donc pas d'échange » est fausse et
avait été écrite avant vérification. Et l'animal demande **quatre mois** et non « presque rien » comme
sur les retours intra-UE : la Chine est un **pays tiers non listé**, donc titrage sérologique ≥ 0,5 UI/ml
en laboratoire agréé UE sur un prélèvement fait ≥ 30 jours après vaccination, **puis 3 mois d'attente**
courant depuis la prise de sang. Les 10 `bestSuitedCities` sont vérifiées dans `CITIES_SEED` et les
20 chiffres français cités (T3 : Grenoble 1 020 € … Paris 2 800 € ; prix/m² : Grenoble 3 200 € …
Paris 10 500 €) sont contrôlés un à un contre `data/housing.ts`. Aucune page EN : `chine` n'est pas
dans `EN_EXPAT_COUNTRY_SLUGS`, donc pas de hreflang à câbler.
⚠️ La **meta description** de `app/expat-retour/[pays]/page.tsx` dépassait 160 caractères sur **les 20
fiches d'alors** (jusqu'à 176 pour « Émirats arabes unis ») : la queue générique « Avec villes recommandées
(frontalières + métropoles). » poussait hors du snippet les postes réellement cherchés. Réécrite,
puis **141-156 caractères sur les 23** depuis que l'article du pays y entre (mesure du 2026-09-16 ;
c'était 138-152 quand la description portait le nom nu) — ne pas y remettre de queue générique. Le
`<title>` a le même plafond et la même histoire : il montait à 66 pour « Émirats arabes unis », la
queue « 2026 · Guide pratique » a été ramenée à l'année seule, et il tient **38-53 sur les 23**.
Ajouté avant lui : **Suède** —
premier pays nordique de la liste, et le seul dossier du site où **le retour est fiscalement
neutre** (kommunalskatt à taux plat ~29-35 % + 20 % d'État au-delà d'environ 600-625 k SEK, à peu
près la fourchette effective française). Le choc est ailleurs, et dans les deux sens : gain sur le
locatif (la file d'attente municipale de première main dépasse 9-11 ans à Stockholm centre, donc
tout arrivant passe par la sous-location andrahand), perte sèche sur la petite enfance (480 jours de
congé parental dont 390 à ~80 %, maxtaxa ~1 700 SEK/mois, déjeuner scolaire gratuit → crèche FR
150-400 €/mois et PreParE ~450 €/mois), et angle mort patrimonial (la Suède n'a plus d'ISF depuis
2007 ni de droits de succession depuis 2004-2005 : le retour réactive IFI et barème successoral).
Deux pièges spécifiques portés par les avertissements et à ne pas diluer : la règle de
**väsentlig anknytning** (présomption de résidence fiscale suédoise pendant 5 ans si un lien
essentiel subsiste — la *sommarstuga* en est un, charge de la preuve inversée) et le fait que
l'enveloppe **ISK** n'a pas d'équivalent français et n'est pas reconnue (retour au PFU 30 % +
formulaire 3916). Les loyers et prix français cités viennent de `data/housing.ts` (T3 : Grenoble
1 020 € … Lyon 1 380 €, Paris 2 800 €), les 10 `bestSuitedCities` sont vérifiées dans `CITIES_SEED`.
⚠️ La liste du sitemap **était codée en dur et avait dérivé** : Côte d'Ivoire et Japon avaient une
page mais aucune URL déclarée. Elle est désormais dérivée de `EXPAT_COUNTRIES` (même correctif que
`PROFILE_SLUGS` en F61) — ne pas la re-figer.

