# MeilleurVille — Roadmap v6 (2026-05-16)

Roadmap des features SSG-first, sans backend lourd, sans chiffres inventés.

**Statut** : vague 1 + vague 2 livrées (F1, F2, F3, F4, F9, F10, F11, F12, F13, F15, F16, F17, F18, F19, F20, F21, F22, F23, F24). Vague 3 démarrée avec F25. 5 features dépendant d'accès externes ont été retirées en attente d'accès/budget : ex-F5 RealityCheck, ex-F6 Journal de déménagement, ex-F7 Alertes personnalisées, ex-F8 Ville du mois, ex-F14 Carte risques interactive.

## Shipped 2026-05-16

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

## Vue d'ensemble — actif

Les 10 features livrées sont décrites dans la section « Shipped ». Tableau ci-dessous : 3 features actives (vague 2) + retirées du périmètre.

| # | Feature | Prio | Cplx | SEO | Statut |
|---|---------|------|------|-----|--------|
| 16 | Classements par score propriétaire (10 classements) | P0 | S | high | À implémenter |
| 17 | Vivre avec X €/mois (6 pages landing) | P1 | S | mid | À implémenter |
| 18 | Télétravailler à [ville] × 352 | P1 | M | high | À implémenter |
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
