# MeilleurVille — Roadmap v6 (2026-05-17)

Roadmap des features SSG-first, sans backend lourd, sans chiffres inventés.

**Statut** : vague 1 + vague 2 livrées (F1, F2, F3, F4, F9, F10, F11, F12, F13, F15, F16, F17, F18, F19, F20, F21, F22, F23, F24). Vague 3 démarrée avec F25. Vague 5 démarrée avec F54. 5 features dépendant d'accès externes ont été retirées en attente d'accès/budget : ex-F5 RealityCheck, ex-F6 Journal de déménagement, ex-F7 Alertes personnalisées, ex-F8 Ville du mois, ex-F14 Carte risques interactive.

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
