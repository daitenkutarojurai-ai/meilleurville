# Glossaire

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Section d'origine conservée mot pour mot.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


### Glossaire (`app/glossaire/page.tsx`)

Page unique, données inline (`SECTIONS: {title, emoji, terms[]}`), `DefinedTermSet` JSON-LD généré
depuis le tableau — ajouter un terme suffit, rien d'autre à câbler. **Compteur mesuré
(`grep -c 'term: "'`) : 225 termes, 22 sections** (2026-10-27). Section ajoutée le 2026-10-27 : « Animaux de compagnie, logement et déménagement » 🐕 (4 termes : clause « animaux interdits » art. 10 loi 70-598, permis de détention chiens 1ʳᵉ/2ᵉ catégorie, identification et fichier I-CAD au déménagement, assurance RC de l'animal). Faits recoupés par recherche web ; ⚠️ points laissés ouverts faute de source concordante : portée de la règle sur un règlement de copropriété, location saisonnière, pièces exactes et délais du permis après changement de commune, tarifs d'assurance. Section précédente, ajoutée le 2026-10-20 : « Arrivée dans une commune : vote, adresse et courrier » 📮 (4 termes : liste électorale, radiation d'office, changement d'adresse en ligne service-public, réexpédition La Poste). Faits recoupés par recherche web ; ⚠️ chiffres volontairement omis, sources divergentes ou périmées : fenêtre avant/après déménagement du téléservice d'adresse, tarifs de réexpédition (d'anciens montants circulent), règles de rattachement à une commune ; date limite présidentielle 2027 (vendredi 12 mars 2027) donnée comme à revérifier après le décret du 12/06/2026. Section précédente : « Électricité, gaz » (2026-10-15). Section ajoutée le 2026-10-15 : « Électricité, gaz et fournisseurs d'énergie » ⚡ (8 termes : distributeur Enedis/ELD ~95 %/5 %, fournisseur contre distributeur, Tarif Bleu, puissance souscrite et option base/heures creuses, part acheminement TURPE, fin du TRV gaz au 30/06/2023, gaz de réseau ~9 500-9 700 communes contre propane/fioul, résiliation au déménagement et médiateur). ⚠️ Chiffres volontairement omis, sources divergentes : nombre d'ELD (130 à 150), niveau et date de l'ajustement TURPE 2026, nombre de ménages basculés du TRV gaz, prix du kWh. Faits recoupés par recherche web ; ni tarif, ni horaire. Dernière section avant elle : « Études supérieures, bourses et logement étudiant » (2026-10-12). Dernière section ajoutée le 2026-10-12 : « Études supérieures, bourses et logement étudiant » 🎓 (9 termes : DSE, bourse sur critères sociaux en 8 échelons, CVEC 105 € en 2026-2027, résidence Crous, Visale étudiant, bail meublé de 9 mois, aide à la mobilité Parcoursup 500 €, alternance et logement, colocation). Faits recoupés par recherche web ; ⚠️ le montant exact des échelons de bourse 2026-2027 n'est pas publié en chiffres précis (sources divergentes sur une revalorisation) : fourchette ~1 450–6 300 €/an seulement, renvoi au simulateur Crous. Date limite du DSE donnée « autour du 31 mai » (millésime 2026), à revérifier chaque année. Pas de jumelle EN (le glossaire EN est une sélection). ⚠️ Un terme ajouté oblige à
remonter `GLOSSARY_TERMS_COUNT` (`lib/site-stats.ts`, 183 → 200 ce run) : `npm run integrity`
recompte la page et **échoue** sinon — le nombre est affiché sur `/outils`, `/recherche`, la carte
OG et `StaticPageCrossLink`. Dernière section ajoutée : « Grand âge, dépendance et aide à domicile »
👵 — 17 termes (grille AGGIR et GIR 1 à 6, APA à domicile, APA en établissement et talon GIR 5-6,
les trois tarifs d'un EHPAD, prix d'un EHPAD, habilitation à l'aide sociale, encadrement de la
hausse annuelle du tarif hébergement, ASH, récupération sur succession, obligation alimentaire,
domicile de secours, réforme expérimentale de la tarification à 23 départements, résidence autonomie
contre résidence services seniors, SAAD/SSIAD/accueil familial et guichet d'entrée, réduction
d'impôt de séjour, crédit d'impôt services à la personne, congé de proche aidant et AJPA). C'était
le trou béant de la page : sur 183 termes, **zéro** ne parlait de perte d'autonomie, d'EHPAD, d'APA
ni de qui paie quand les ressources ne suffisent plus — ni EHPAD, ni AGGIR, ni ASH, ni obligation
alimentaire, ni domicile de secours, ni tutelle n'apparaissaient une seule fois, APA et GIR ne
figurant qu'en incise dans la définition de MaPrimeAdapt'. Le site porte pourtant quatre profils
concernés (`retraites`, `futurs-retraites`, `proches-aidants`, `suivi-medical-regulier`), le red
flag `villes-vieillissement-critique`, `/villes/[slug]/sante` — et l'édition de décembre du palmarès
vient de mesurer que **les villes que nous notons le mieux sont les plus âgées** (corrélation de
rang +0,455 entre la part des 60 ans et plus et le score global). Cinq points de méthode à ne pas
diluer : ① **le piège central du chapitre est nommé, et c'est celui du prix de l'eau** — il n'existe
aucun tarif national d'EHPAD, et surtout les chiffres qui circulent ne mesurent pas le même objet :
médiane contre moyenne, tarif hébergement seul contre hébergement plus tarif dépendance des
GIR 5-6, places habilitées à l'aide sociale contre secteur privé commercial à prix d'entrée libre.
Selon ce qu'on mesure, les sources consultées ce run vont d'environ 1 900 € à près de 2 700 € par
mois pour le même pays. La page **ne publie donc aucun prix national** et renvoie au comparateur
public des prix des EHPAD, établissement par établissement ; ② **aucune entrée en doublon** —
l'ALD, le forfait journalier hospitalier et la CMI stationnement existaient déjà (sections santé et
transports), MaPrimeAdapt' aussi (section rénovation énergétique), donc le chapitre y **renvoie**
au lieu d'ouvrir une seconde définition, même précédent que la CFE rappelée depuis la zone FRR, que
l'homonymie APL et que le quotient familial CAF contre fiscal ; ③ **la clé géographique du chapitre
est le domicile de secours** (art. L. 122-2 CASF) : il s'acquiert par trois mois de résidence
habituelle et se perd par trois mois d'absence, mais le séjour en établissement sanitaire ou social
**n'est ni acquisitif ni une cause de perte**. Installer un parent dans un EHPAD d'un autre
département pour le rapprocher de ses enfants ne transfère donc pas la charge de l'ASH : le
département d'origine reste compétent, avec son barème, sa politique de récupération et sa façon de
solliciter les obligés alimentaires. C'est le fait le plus contre-intuitif du chapitre et il est au
cœur de ce que ce site raconte, à savoir qu'un déménagement déplace des droits ; ④ **une divergence
réelle est publiée plutôt que tranchée** : la récupération de l'ASH sur succession s'exerce en
principe **dès le premier euro et sans franchise**, là où celle de l'ASPA attend un actif net de
l'ordre de 39 000 € en métropole, mais beaucoup de sources annoncent un seuil de 46 000 € et les
deux se rencontrent sur le terrain parce que **la politique de recouvrement est départementale** —
l'entrée dit donc que ce n'est pas une règle nationale mal expliquée mais une pratique locale, à
demander par écrit au conseil départemental ; ⑤ **deux faits sont écrits comme datés et à
revérifier**, pas comme acquis : l'expérimentation de fusion des sections soins et dépendance
(LFSS 2024 modifiée par la LFSS 2025, du 1ᵉʳ juillet 2025 au 31 décembre 2026, **23 départements
volontaires**, rapport au Parlement attendu avant juin 2026, généralisation envisagée à partir de
2027 sans calendrier arrêté), qui fait que deux départements voisins ne financent pas la dépendance
de la même façon en ce moment ; et la transformation de la réduction d'impôt de séjour en crédit
d'impôt, **votée par les députés le 25 octobre 2025 mais non retenue dans la loi de finances pour
2026** — le dispositif reste une réduction, ce qui est précisément pourquoi il ne rapporte rien au
foyer non imposable, c'est-à-dire à celui qui aura besoin de l'ASH.
⚠️ **Le fait le plus utile du run est une correction de ma propre mémoire, et elle contredit ce
qu'écrivent encore des guides spécialisés** : l'exclusion des **petits-enfants** de l'obligation
alimentaire au titre d'une demande d'ASH est la **loi du 8 avril 2024**, pas la loi ASV du
28 décembre 2015 ; le premier résultat de recherche consulté affirmait au contraire que « les
enfants et petits-enfants peuvent être appelés à contribuer ». Chiffres cités, tous réglementaires
ou publiés et **vérifiés en ligne ce run** : plafonds APA au 1ᵉʳ janvier 2026 de 2 080,33 € (GIR 1),
1 682,30 € (GIR 2), 1 215,99 € (GIR 3) et 811,52 € (GIR 4), indexés sur la majoration pour tierce
personne, majoration de répit jusqu'à 583,52 €/an, participation au-delà de 933,89 € de ressources
mensuelles ; talon GIR 5-6 de l'ordre de 5 à 7 €/jour ; hausse du tarif hébergement des
établissements non habilités plafonnée à **0,86 %** en 2026 par l'arrêté du 24 décembre 2025, pour
les seuls contrats en cours ; ASH à 90 % des ressources avec un minimum de l'ordre de 125 €/mois
laissé au résident, 65 ans (60 en cas d'inaptitude au travail), donations récupérables sur dix ans ;
réduction d'impôt de séjour de 25 % dans la limite de 10 000 €/personne/an, soit 2 500 € au plus,
plafond diminué de l'APA, de l'aide sociale et des aides au logement perçues ; crédit d'impôt
services à la personne de 50 % dans la limite de 12 000 €, majorée de 1 500 € par enfant à charge,
par membre du foyer de plus de 65 ans ou par ascendant bénéficiaire de l'APA, sans dépasser
15 000 €, et jusqu'à 18 000 € la première année d'emploi ; AJPA à 66,64 €/jour et 33,32 €/demi-
journée au 1ᵉʳ janvier 2026, 66 jours par personne accompagnée et 264 sur une carrière depuis le
1ᵉʳ janvier 2025. **Trois chiffres volontairement omis, faute de sources concordantes — ne pas les
« compléter »** : le prix médian national d'un EHPAD (voir ① ci-dessus), la part de places
habilitées à l'aide sociale par département, et la durée maximale du congé de proche aidant sur une
carrière, l'entrée s'en tenant aux 66 jours **indemnisés** et disant que le congé peut se prolonger
au-delà sans être payé. Aucun horaire, aucun tarif d'établissement, aucune moyenne inventée, aucun
prix d'EHPAD commune par commune. Aucune jumelle EN à câbler : `app/[locale]/glossary` est une
**sélection de 32 termes** pour le lecteur expatrié, pas un miroir, et la paire
`pathAlternates("/glossaire", "/glossary")` est inchangée. 🔧 Corrigé au passage, même famille de
dérive qu'au run précédent : l'**intro de la page énumère les chapitres couverts** et ne citait pas
le nouveau, alors que le compteur juste au-dessus est dérivé de `SECTIONS` ; la description du
`DefinedTermSet` a reçu GIR, APA, ASH et domicile de secours au même titre. Contrôles :
`npx tsc --noEmit` **propre**, `npm run integrity` (garde `glossaire` : 200 termes recomptés sur la
page), `npm run sitemap:check` (FR 29 294 URL, EN 28 887 — **inchangé**, `/glossaire` existait déjà,
donc aucune URL neuve), `npm run hreflang:check`, plus une vérification d'encodage (densité
d'accents **0,201** par mot contre un seuil ascii-strip de 0,09, `€` conservé ×21, aucun `m2` /
`EUR` / `deg` ascii, aucun mojibake, aucune apostrophe typographique, **0 em-dash** pour 2 811 mots
là où la cible R7.10 en tolérerait 14). `npm run build` **non lancé, volontairement** (cf.
§ Commands depuis le batch 27). ⚠️ Egress : `legifrance.gouv.fr`, `service-public.fr` et
`pour-les-personnes-agees.gouv.fr` restent hors d'atteinte en `WebFetch` depuis la routine, alors
que **la recherche web fonctionne** : les faits ont donc été recoupés sur plusieurs résultats plutôt
que sur une fiche unique, méthode retenue depuis le batch 48. Avant-dernière section ajoutée : « Eau, assainissement, déchets et
réseaux » 💧 — 14 termes (prix de l'eau, régie/délégation/syndicat, part fixe et son plafond,
raccordement obligatoire aux eaux usées, PFAC, SPANC et contrôle périodique, TEOM ou REOM, zonage
de TEOM et taux disproportionné, tarification incitative, déchèterie, taxe d'aménagement, réseau de
chaleur et périmètre de développement prioritaire, arrêté sécheresse, contrôle sanitaire de l'eau).
C'était le trou béant de la page : sur 169 termes, **zéro** ne parlait d'eau, de déchets ni de
raccordement, alors que ce sont les factures d'un ménage qui varient le plus d'une commune à
l'autre et que le site porte `/villes/[slug]/eau`, `/villes/[slug]/risques` et le red flag
`villes-sans-eau-ete`. Cinq points de méthode à ne pas diluer : ① **le piège central du chapitre est
nommé** — il n'existe ni prix national de l'eau ni taux national de TEOM, l'État ne fixe aucun des
deux, et ce qui donne l'illusion inverse est le **nom de l'opérateur** imprimé sur la facture, le
même dans toute la France alors que le tarif a été voté par une assemblée locale ; corollaire,
l'échelle du prix n'est pas forcément la commune mais le **syndicat**, ce qui découpe une
agglomération autrement que ses limites administratives ; ② **aucune entrée en doublon** — la taxe
GEMAPI (section assurance) et le diagnostic d'assainissement non collectif (section diagnostics)
existaient déjà, donc le SPANC distingue explicitement le **contrôle périodique** du diagnostic de
vente au lieu d'ouvrir une seconde entrée, même précédent que la CFE renvoyée depuis la zone FRR et
que l'homonymie APL ; ③ les chiffres sont tous réglementaires ou publiés et **vérifiés en ligne ce
run** (4,89 € TTC/m³ au 1ᵉʳ janvier 2025 dont 2,50 € eau potable et 2,39 € assainissement, rapport
Sispea de juin 2026 sur l'activité 2024, soit 586,80 €/an pour la facture de référence de 120 m³ ;
plafond de part fixe à 40 % du coût du service pour 120 m³, relevé à 50 % en communes rurales,
arrêté du 6 août 2007 ; raccordement sous deux ans, prolongation jusqu'à dix ans, majoration jusqu'à
100 % votée par le conseil municipal, art. L1331-1 CSP ; PFAC plafonnée à 80 %, art. L1331-7 CSP ;
contrôle SPANC à dix ans au plus, art. L2224-8 CGCT ; taxe d'aménagement 2026 à **892 €/m²** hors
Île-de-France et **1 011 €** en Île-de-France, arrêté du 22 décembre 2025 indexé sur l'ICC du T3
2025, part départementale ≤ 2,5 % et part régionale francilienne ≤ 1 % ; réseau de chaleur classé
au-delà de 50 % d'EnR&R avec obligation de raccordement au-delà de 30 kW dans le périmètre
prioritaire) — aucun tarif d'opérateur, aucune moyenne de facture inventée, aucun taux de TEOM
commune par commune ; ④ **une exception géographique est publiée plutôt que lissée** : le plafond de
part fixe **ne s'applique pas aux communes touristiques** (art. L133-11 code du tourisme), y compris
classées sur une partie seulement de leur territoire, donc dans une station un logement peu occupé
paie une facture d'eau presque indépendante de sa consommation ; et la restriction n'est pas partout
saisonnière — à **Mayotte** la distribution est rationnée par des tours d'eau depuis plusieurs
années, ce que l'entrée sécheresse dit au lieu de décrire un régime métropolitain comme universel ;
⑤ **deux chiffres volontairement écartés**, faute de sources concordantes ou parce que la
comparaison était biaisée — la couverture exacte de la tarification incitative (les bilans donnent
6,5 à 6,6 millions d'habitants selon le millésime, l'entrée publie « sous les 10 % de la population »
et les cibles légales LTECV de 15 millions en 2020 et 25 millions en 2025, qui elles sont fermes),
et surtout le rapprochement très répandu **132 kg/hab/an d'ordures résiduelles en tarification
incitative contre 249 kg au niveau national** : les collectivités concernées étant majoritairement
rurales, ce rapport mélange l'effet du tarif et celui du territoire, donc l'entrée retient la baisse
d'environ 30 % mesurée par l'Ademe et **nomme le biais** plutôt que de republier l'écart. 🔧 Corrigé
au passage : l'intro de la page **énumérait les chapitres couverts et avait dérivé** — elle ne citait
ni les transports (section livrée le 2026-09-07) ni le nouveau chapitre, alors que le compteur juste
au-dessus est dérivé de `SECTIONS` ; même famille de dérive que les deux compteurs du hub expat
fermés le 2026-09-16. ⚠️ Egress : `legifrance.gouv.fr`, `service-public.fr`, `economie.gouv.fr` et
`banquedesterritoires.fr` répondent **403 CONNECT** depuis la routine — la recherche web fonctionne,
donc les faits ont été recoupés sur plusieurs résultats plutôt que sur une fiche unique, méthode déjà
retenue au batch 48. Aucune jumelle EN à câbler : `app/[locale]/glossary` est une **sélection de
32 termes** pour le lecteur expatrié, pas un miroir, et la paire `pathAlternates("/glossaire",
"/glossary")` est inchangée. Section précédente : « Emploi, chômage et mobilité
professionnelle » 📈 — 14 termes (zone d'emploi, taux de chômage localisé vs recensement,
catégories A/B/C, France Travail, contrat d'engagement, ARE, démission légitime pour suivi de
conjoint, rupture conventionnelle, clause de mobilité, aide à la mobilité, télétravail par accord
ou charte, conseil de prud'hommes compétent, zone FRR, portabilité de la mutuelle). C'était le trou
béant de la page : sur 155 termes, **zéro** ne parlait de travail, alors que le site porte
`/villes/[slug]/emploi`, la série close `travail-a-[ville]-2026` (30 guides), l'axe `remoteWork` du
seed et `/copilot` — et qu'on change rarement de ville sans que le travail entre dans l'équation.
Cinq points de méthode à ne pas diluer : ① **chaque entrée est retenue pour son arête géographique**,
pas pour sa valeur RH générale — sans quoi la section aurait dupliqué n'importe quel glossaire de
droit du travail ; ce qui la justifie ici est que le nombre change quand on franchit une limite
communale, départementale ou régionale ; ② **l'entrée CFE n'a pas été créée**, alors qu'elle
s'imposait pour la micro-entreprise : « Cotisation Foncière des Entreprises » existe déjà en
section fiscalité locale **avec** l'angle freelance qui change de ville, donc la zone FRR y renvoie
(« définie plus haut ») au lieu d'ouvrir un doublon — même précédent que l'homonymie APL et que le
quotient familial CAF vs fiscal ; ③ le piège central du chapitre est nommé : **« taux de chômage »
désigne deux mesures différentes**, le taux localisé (compatible BIT, trimestriel, qui s'arrête à la
zone d'emploi) et le taux au sens du recensement (publié à la commune, notion déclarative moins
restrictive, donc mécaniquement plus élevé) — un chiffre de chômage cité pour une commune est
presque toujours le second, et c'est aussi ce qui explique que `lib/employment-market.ts` publie un
*niveau* départemental et non un pourcentage communal ; ④ les chiffres cités sont tous
réglementaires ou publiés et **vérifiés en ligne ce run** (306 zones d'emploi du zonage 2020, hors
Mayotte et Guyane pour ce niveau de diffusion ; 78 h/mois entre catégories B et C, nomenclature Cnis
de septembre 2008 ; loi du 18 décembre 2023 pour le plein emploi et bascule Pôle emploi → France
Travail au 1ᵉʳ janvier 2024 ; contrat d'engagement au 1ᵉʳ janvier 2025, 15 à 20 h pour le RSA ; ARE
minimale 32,13 €/jour, non revalorisée au 1ᵉʳ juillet 2026 faute de majorité au conseil
d'administration de l'Unédic du 30 juin ; 15 jours calendaires de rétractation puis 15 jours
ouvrables d'homologation ; arrêt du 18 décembre 2024 sur la clause de mobilité ; 60 km ou 2 h
aller-retour, 20 km hors métropole, 0,23 €/km et 5 200 € sur 12 mois glissants pour l'aide à la
mobilité ; articles L1222-9 et R1412-1 ; 17 700 communes FRR depuis le 1ᵉʳ juillet 2024, 13
départements entiers, 2 200 sortantes maintenues par la LF 2025 ; portabilité 12 mois) — aucun
barème d'assureur, aucun taux de CFE commune par commune, aucune moyenne inventée ; ⑤ **une
exception géographique réelle est publiée plutôt que lissée** : Mayotte relève d'un règlement
d'assurance chômage distinct dont l'allocation minimale journalière est de **16,05 €**, soit la
moitié des 32,13 € du régime général — sur un site qui porte Mamoudzou au seed, écrire « l'ARE ne
dépend pas du lieu » sans cette réserve aurait été faux. Section précédente : « Transports, voiture et stationnement » 🚉
— 13 termes (AOM, versement mobilité, prise en charge à 50 % de l'abonnement, forfait mobilités
durables, vignette Crit'Air, FPS, gratuité des réseaux, changement d'adresse sur la carte grise,
CMI stationnement, barème kilométrique, stationnement vélo sécurisé en gare, aides à l'achat d'un
vélo, tarification TER). C'était le trou béant de la page : sur 142 termes, **un seul** parlait de
mobilité (ZFE), alors que le site porte `/villes/[slug]/transports`, `/villes/[slug]/velo`, la
série `vivre-sans-voiture-[ville]` et les profils `cyclistes-urbains`, `sans-voiture` et
`navetteurs-hybrides`. Cinq points de méthode à ne pas diluer : ① **l'entrée ZFE existante a été
réécrite, pas dupliquée** — la nouvelle section pose « Vignette Crit'Air » et renvoie à la
définition d'urbanisme, même précédent que l'homonymie APL et que le quotient familial CAF vs
fiscal ; ② le fait ZFE est daté et à revérifier avant de le durcir : la suppression des ZFE, **votée
le 15 avril 2026** dans la loi de simplification de la vie économique, a été **censurée par le
Conseil constitutionnel le 21 mai 2026 comme cavalier législatif** (article 45), donc sur la
procédure et non sur le fond — le cadre légal tient, mais les calendriers d'exclusion et les
régimes de sanction sont décidés métropole par métropole et bougent, d'où le renvoi au site de la
métropole plutôt qu'une liste qui périmerait ; ③ **il n'existe plus d'aide nationale à l'achat d'un
vélo** — bonus vélo et prime à la conversion ont pris fin le 14 février 2025, ce qui reste est
local, donc c'est devenu un fait *géographique*, exactement le sujet du site ; ④ les seuls chiffres
cités sont réglementaires ou publiés et **tous vérifiés en ligne avant rédaction** (600 €/900 €/300 €
du FMD, 50 % obligatoires et 75 % exonérés jusqu'au 31/12/2026, 135 € et redevance d'acheminement
2,76 € sur la carte grise, majoration FPS de 50 €, 12 h plancher de la CMI, décret n° 2021-741 et
ses 1 133 gares à 4 % / 2 % de la fréquentation entrante, 46 % puis 54 % de gares conformes,
barème kilométrique gelé pour la 4ᵉ année et +20 % électrique, ~40 réseaux gratuits, Montpellier
21/12/2023) — aucun tarif d'opérateur, aucune moyenne de prime, aucun taux de versement mobilité
commune par commune (seul le plafond légal est cité, sans le chiffrer au dixième) ; ⑤ deux entrées
disent explicitement ce qu'un chiffre ne dirait pas : la gratuité d'un réseau **est réservée aux
résidents et ne dit rien de la fréquence**, et l'obligation de stationnement vélo en gare
**n'a pas été tenue**, donc elle se vérifie sur place et ne se déduit pas du texte.
Le titre de la page passe à « Glossaire immobilier, aides, école, santé & mobilité » (52 car.) et sa
`description` reste à 153. Section ajoutée juste avant :
« Santé, médecin traitant et accès aux soins » 🩺 — 15 termes (médecin traitant, parcours de soins
coordonnés, ticket modérateur, participation forfaitaire et franchise médicale, secteur 1/2 et
OPTAM, ALD, contrat responsable et 100 % Santé, CSS, carte Vitale et Mon espace santé, changer de
caisse en déménageant, APL d'accessibilité potentielle localisée, désert médical/ZIP/ZAC,
MSP/centre de santé/CPTS, forfait journalier hospitalier et forfait patient urgences, SAS et
116 117). C'était le trou béant de la page : le site porte `/villes/[slug]/sante`,
`lib/healthcare-access.ts` (F47), le red flag `villes-desert-medical` et le profil
`suivi-medical-regulier` livré le 17/08, sans jamais définir ce que « désert médical » veut dire
administrativement ni ce qu'un arrivant doit faire de sa carte Vitale. Quatre points de méthode à
ne pas diluer : ① **homonymie APL assumée et signalée** — « accessibilité potentielle localisée »
(DREES/IRDES, seuil de sous-densité 2,5 consultations/an/hab., 6,3 M de personnes sous le seuil en
2024, soit ~9 % de la population) porte le même sigle que l'Aide personnalisée au logement, déjà
définie deux sections plus haut ; l'entrée le dit en première ligne plutôt que de créer un doublon
silencieux, même précédent que le quotient familial CAF vs fiscal ; ② **« désert médical » n'est pas
une catégorie administrative** — ce qui existe est le zonage ARS ZIP/ZAC, et c'est lui qui ouvre des
droits ; ③ les personnes **en ALD ne sont pas exonérées** de la participation forfaitaire ni des
franchises (idée reçue très répandue, y compris dans des sources secondaires qui citent encore le
montant de 1 € d'avant mai 2024) — les exonérés sont les moins de 18 ans, les femmes enceintes à
partir du 6ᵉ mois et les bénéficiaires CSS/AME ; ④ le **doublement des plafonds à 100 € chacun**
annoncé le 23/07/2026 est écrit comme une annonce datée, **décret non publié au JO à la rédaction**
et application ~2 mois après parution — à revérifier avant de le durcir en fait acquis. Chiffres
cités, tous réglementaires ou publiés, aucun tarif d'assureur : 2 € de participation forfaitaire
(15/05/2024), franchises 1 €/boîte, 1 €/acte paramédical, 4 €/transport, butoirs 4 € et 8 €/jour,
plafonds 50 € chacun ; consultation généraliste secteur 1 30 € (22/12/2024, ex-26,50 €), base
secteur 2 hors OPTAM 23 € ; hors parcours de soins 30 % au lieu de 70 % ; CSS 868 €/1 303 € (gratuite)
et 1 172 €/1 759 € (payante) du 01/04/2026 au 31/03/2027, participation ≤ 1 €/jour, 8 à 30 €/mois
selon l'âge ; forfait journalier hospitalier 23 €/jour et 17 € en psychiatrie, forfait patient
urgences 23 €, tous deux depuis le 01/03/2026 (ex-20 €, 15 €, 19,61 €) ; 2 644 MSP en 2024 pour un
objectif de 4 000 en 2027. Le montant minoré du FPU en ALD est **volontairement omis** : les sources
consultées divergent (8,49 € et 9,96 €), une phrase sans chiffre valant mieux qu'un chiffre faux.
Avant-dernière section : « Assurance habitation et catastrophes naturelles » 🌊 — 12 termes (MRH et qui doit s'assurer,
garantie cat-nat, arrêté de catastrophe naturelle, franchise légale, surprime, CCR, RGA, fonds
Barnier, taxe GEMAPI, recul du trait de côte, BCT, valeur à neuf). Elle honore exactement le
cadrage laissé en 2026-08-03 ci-dessous : **côté assurance et indemnisation uniquement**, parce
qu'ERP/ERRIAL et PPRI/PPRT sont déjà traités sous « Diagnostics ». Le site portait
`/villes/[slug]/risques`, `/red-flags/villes-risques-naturels`, `villes-erosion-cotiere` et
`villes-sans-eau-ete` sans jamais expliquer ce qui est payé, par qui et sous quelle condition.
Trois points de méthode à ne pas diluer : ① la garantie cat-nat **ne couvre ni la tempête, ni la
grêle, ni le poids de la neige** (garantie distincte du contrat) et **ne couvre pas le recul du
trait de côte**, phénomène lent donc hors du champ « intensité anormale » — c'est l'erreur la plus
répandue, et les deux entrées concernées le disent explicitement ; ② les seuls chiffres cités sont réglementaires et
nationaux (franchise 380 € / 1 520 € sécheresse, surprime 20 % et 9 % au 1ᵉʳ janvier 2025, plafond
GEMAPI 40 €/hab./an, subvention Barnier jusqu'à 80 %) — aucun tarif d'assureur, aucune moyenne de
prime, qui ne seraient pas sourçables ; ③ ce qui relève du contrat et non de la loi (valeur à neuf,
plafonds) est écrit comme tel, avec « le plus souvent » et « délai contractuel ». Section antérieure :
« École, garde d'enfants et scolarité » 🎒 — 15 termes (carte scolaire, dérogation, certificat de
radiation, instruction obligatoire, REP/REP+, IPS, Affelnet, Parcoursup, privé sous contrat,
périscolaire, quotient familial CAF, modes de garde, CMG, PAI/PAP/PPS, transport scolaire) : c'était
le trou de la page, qui ne couvrait que l'immobilier et l'argent alors que le site porte
`/villes/[slug]/ecoles` et la série `famille-a-[ville]`. Deux pièges vérifiés au passage : le
**quotient familial** existait déjà au sens fiscal, l'entrée CAF le nomme explicitement pour ne pas
créer un doublon silencieux ; **ERP/ERRIAL** et **PPRI/PPRT** sont déjà traités sous « Diagnostics »,
donc une future section risques naturels doit se limiter à l'assurance (cat-nat, franchise, RGA,
fonds Barnier) sous peine de recouvrement. Aucun chiffre de loyer, prix ou score n'est cité ici :
les montants réglementaires seulement, et rien qui ne soit sourçable.

