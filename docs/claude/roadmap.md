# Roadmap (technique, produit, EN, v11, vague 6)

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Sections d'origine conservées mot pour mot.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


## Technical roadmap — pending

Hosting is **Cloudflare** (Workers + `wrangler.toml`), not Vercel.

- [x] **`NEXT_PUBLIC_BASE_URL`** — set in `wrangler.toml [vars]` (`https://www.mavilleideale.fr`); EN export sets `NEXT_PUBLIC_DEFAULT_LOCALE=en`.
- [x] **Host disclosure** — `mentions-légales` / `legal-notice` / privacy pages corrected Vercel → Cloudflare (Cloudflare, Inc.); dates bumped 31 mai 2026.
- [ ] **`app/cgu`** date: bump "Dernière mise à jour" after legal review (currently 25 mai 2026). `confidentialite` already current (Cloudflare + D1 disclosure).

### Audit-derived roadmap (2026-06-02)

- [x] **Region & Department score pages** (§7) — DONE 2026-06-03 (most parts already existed). Aggregate score = mean of region/dept cities' global score: `app/regions/[region]/page.tsx` (`avgScore`/`avgCriteria` + JSON-LD) and `app/departements/[dept]/page.tsx` both already displayed it. City-listing region+dept filters already present in `components/VillesSearch.tsx`. The one missing piece — a **region heatmap layer on `/carte`** — shipped this session: `CarteClient` now has a Villes/Régions toggle drawing one bubble per metropolitan region at its centroid, coloured by avg score (honours active axis + lean filter), linking to `/regions/[slug]`. **EN parity shipped 2026-06-03:** `FranceHeatmap` gained an opt-in `showRegionToggle` prop (default off → homepages/timelapse byte-identical) and the EN `/map` (`app/[locale]/map`) now passes it, mirroring FR `/carte`. *Remaining follow-up: department-granularity heatmap (96 depts — would need clustering to avoid clutter).*
- [x] **Guide hero images** (§4a — deferred 2026-06-02, **DONE 2026-07-13** via the photo pipeline below) — city-specific guides (`10-choses-a-faire-a-X`, `acheter-a-X`, `things-to-do-in-X`…) now render the city's Commons photo as a hero band. A guide only gets one when the city slug appears in the *guide slug* (`guideCityPhoto`) — a ranking guide listing 12 cities is about none of them, and illustrating it with the first would be a lie. Ranking/thematic guides stay text-only by design.

### Photo pipeline (Wikidata P18 → Wikimedia Commons)

`scripts/commune-images.mjs` — crawls **all 34 969 communes** (geo.api.gouv.fr) →
Wikidata QID + main image (P18, anchored on `P374` = INSEE code, one SPARQL query
per département) → Commons `imageinfo` (author, licence, Commons page, 1600px
source). Every stage is **resumable and cached** in `.cache/commune-images/`
(gitignored, rebuildable); rate-limited to ~1 req/s with `Retry-After`-aware
backoff and a contactable User-Agent, as Wikimedia requires.

```bash
npm run photos          # full chain (communes → wikidata → commons → manifest → assets)
npm run photos:update   # re-query Wikidata; only new communes / changed P18 are refetched
node scripts/commune-images.mjs assets --limit=50   # batch control
```

- **No hotlinking.** Photos are downloaded and re-encoded to webp by sharp at
  1024px (hero) + 480px (card), written to `public/photos/villes/` with a
  **content hash** in the filename → `_headers` caches them `immutable`, and an
  upstream photo change ships under a new URL. Stale files are pruned on rerun.
- **Data**: `data/city-images.json` (rich record, server-side, via
  `lib/city-images.ts`) + `data/city-cards.json` (lean: hash/colour/author/
  licence, via `lib/city-cards.ts`) — the lean one exists because `CityCard`
  renders inside client components, and the full record would ride into the
  client bundle for nothing.
- **Attribution is a licence condition, not decoration.** Most files are CC BY-SA:
  `components/CityPhoto.tsx` renders the credit (author · licence · Commons link)
  with the pixels, and non-free licences are filtered out at crawl time
  (`LICENSE_OK`). Cards show unlinked credit text — the tile is already an `<a>`,
  and nesting anchors is invalid HTML.
- **SEO**: city + guide sitemap entries declare their photo (`images:` →
  `<image:image>`), and city JSON-LD carries an `ImageObject` with
  `license` + `acquireLicensePage` + `creditText` (Google Images "Licensable").
- Surfaces: city hero (FR + EN), `CityCard` cover everywhere, and the
  `quartiers` / `climat` / `a-faire` sub-pages (+ EN `neighbourhoods` /
  `climate` / `things-to-do`), plus city-specific guide heroes.
- The crawl covers all 34 969 communes even though only the 540 seed cities get a
  built asset — the manifest is already there the day the seed grows.

### Guide landmarks (`scripts/guide-pois.mjs`)

Illustrates the FR `10-choses-a-faire-a-*` series: Wikidata landmarks located in
the commune (heritage-listed via P1435, or typed as a visitable place — the class
gate is client-side, since P31/P279* in SPARQL blows the 60s WDQS budget) →
matched against each section heading → Commons photo + Google Maps + Wikipedia.
Data in `data/guide-pois.json`, assets under `public/photos/poi/`.

**The matcher is strict on purpose: 246/1690 sections match.** Most headings are
activities ("prendre le petit-déjeuner dans un bouchon"), not places. Every time
the rules were loosened the result was a *wrong* photo: a hotel on "Monter à
Fourvière", a railway station then a théâtre on "le marché de la Croix-Rousse", a
fountain on "Grimper à Montmartre". A section with no landmark stays text-only —
that is the correct outcome. **EN is excluded**: `things-to-do-in-*` headings are
thematic ("Croix-Rousse and the Presqu'île") and name no single place.



## Pending work

### UX polish
- **R7.10** — Em-dash purge across body copy + meta descriptions. Cap at ~1 per 200 words, never two per sentence. Manually review per-file, don't blanket sed. **Status: at target.** `data/guides.ts` purged 4017→2977 (combined with R7.8's 6750→4017, a 56% drop from origin); now ≈1 em-dash per 200 words — the residual 2977 are overwhelmingly structural separators (`metaTitle` 621, `title` 215, `"N. Label —"` ranking-list separators ~1062) which are intentionally kept. `data/guides-en.ts` (921 / 240,966 words) was already under target, untouched. Purge done via parallel range-agents + word-skeleton integrity guard (verified byte-identical word sequence vs pre-pass snapshot, zero words altered).

R7.2 (méthodologie section already absent), R7.9 (string + soft-fallback shipped in `components/HonestReviewCard.tsx`), R7.11 (`components/DiscussionCTA.tsx` on all 26 sub-pages), R7.12 (emoji icons present on every "Aller plus loin" card) are shipped.

### Product — City Match + vraie vie
- **R8.2 Vraie vie** — Indicateurs manquants: qualité internet (`/villes/[slug]/connexion-internet` shipped), mentalité locale (`/villes/[slug]/mentalite-locale` shipped), tension locative (`/villes/[slug]/tension-locative` shipped), minutes domicile-travail (section "Trajet domicile-travail estimé" sur `/villes/[slug]/transports` shipped). **R8.2 complet.**
- **R8.3 Verticale S'installer** — `/villes/[slug]/s-installer` shipped, `/villes/[slug]/agenda` shipped, portraits-types fictivement étiquetés ("Personnages fictifs · Illustratif uniquement" + disclaimer en bas de page). **R8.3 complet.**

R8.1 City Match (`/city-match` + `lib/city-match.ts`) shipped.

**Refonte du barème 2026-08-17, sur retour lecteur** — « grandes métropoles » sortait Céret
(7 800 hab.), Le Puy et Limoux. Chaque critère rend désormais un *fit* centré converti par un poids
explicite (`W` en tête de fichier) ; le score global de la ville n'est plus la base mais une ancre
de départage à 1,8. Trois points à ne pas défaire :
- **Ne pas revenir à un test en escalier.** « Chaud » ne primait qu'à 24 °C **et** 2 000 h de
  soleil : Bordeaux (23 °C, 2 065 h) comptait comme Lille. Les barèmes sont continus, et `axisFit`
  est volontairement **non borné** — un plafond mettait Obernai (sécurité 8,6) et Fontainebleau
  (8,1) à égalité et l'ordre entre elles devenait celui du seed.
- **Le littoral se lit dans `lib/city-coast.ts`, jamais dans les tags.** L'ancien `isCoastal`
  comparait par sous-chaîne : « sport » contient « port », donc Grenoble, Clermont-Ferrand,
  Saint-Étienne et Tarbes étaient côtières, comme « côte-d'or » et « porte des alpes » ; le repli
  `elevation <= 15 m` ajoutait les ports fluviaux. `data/city-coast.json` (via `npm run coast`)
  porte la distance à la **mer ouverte** — filtre de largeur d'eau, donc un fleuve de 500 m n'est
  pas la mer : La Rochelle 0,1 km, Bordeaux 19,4 km, Nantes 25,5 km, Rouen 57 km.
- **`caveat` doit rester affiché.** Une combinaison peut être insatisfiable (aucune commune
  française de plus de 200 000 hab. n'est en montagne) ; la fiche dit ce que la ville rate
  (« mais 7 800 habitants ») au lieu de laisser l'arbitrage passer pour un bug.

⚠️ Le permalien voyage en **query** (`/city-match?r=<code>`) et son séparateur est un **point**.
`/city-match/r/<code>` n'a jamais existé — tout lien partagé tombait en 404 — et le tiret cassait
le découpage positionnel dès que `single-parent` était la réponse d'étape de vie. Les libellés
restent français dans la lib et sont traduits par `translateReason()` dans
`app/city-match/CityMatchQuiz.tsx` : **tout nouveau libellé demande sa règle**, sinon il part en
français sur bestcitiesinfrance.com.

### Plateforme communautaire (R9)
R9.1 (`/auth` + `/connexion`, Supabase), R9.2 (`/favoris` + `/dashboard`), R9.3 (alertes: `lib/alertes-store.ts` + `POST /api/alertes/subscribe` + cron Mon 08:00 UTC + `components/AlerteForm.tsx` in CityProfile), R9.4 (`/villes/[slug]/questions` + EN `/cities/[slug]/questions`), R9.5 (`/projection-5ans`) shipped.

### Data-visualisation (R10)
- **R10.1** — 2D/3D toggle sur `/carte` via CSS perspective + SVG ColumnLayer. Toggle ◉ 2D / ▲ 3D. Hauteur = score, couleur = score. DROM strip séparé (DromStrip component). Filtres par axe déjà présents. **Shipped** (CSS perspective, no new deps). Note: deck.gl proper avec tuiles carte de fond reste une upgrade future.

R10.2 (`/villes/[slug]/empreinte` + `lib/city-fingerprint.ts` + `components/CityFingerprint.tsx`), R10.3 (`/climat-2040-timelapse`) shipped.

### Features IA (R11)
- **R11.3 "Where people like YOU moved"** — Phase A: `/portraits-types` (FR) + `/community-profiles` (EN), 6 fictional labeled archetypes with real niche scores. Phase B (shipped): estimation model `lib/people-like-you.ts` (`migrationFor(origin, profile)` → upgrades/laterals by persona score over 17 `lib/profile-pages.ts` profiles). Surfaces: interactive `/people-like-you` (FR) + `/[locale]/people-like-you` (EN), and SSG per-origin landing pages `/ou-vont-les-gens/[ville]` (24 biggest departure cities, no-JS/indexable, same engine). Clearly labelled "modèle estimatif, pas de suivi"; swaps to real anonymized account flows once volume allows. (Distinct from `/depuis/[slug]` = weekend travel, and `/expat-retour`.)
- **R11.5 Street Reality Score** — _removed from roadmap (2026-05-31)._

R11.1 (`/future-you` + `lib/future-you.ts`), R11.2 (`/vibe` + `lib/vibe.ts`), R11.6 (`components/VsBattle.tsx`), R11.7 (`/copilot`) shipped.

### Tourisme & activités (R12)
- **R12.1** — `/villes/[slug]/a-faire` shipped: SSG activity sub-page for all 540 cities. Surfaces activity categories from seed data (nature/culture/transport scores + characterTags), links to the `10-choses-a-faire-a-[slug]-2026` guide when available (24 cities). Card added to CityProfile strip. Sitemap entry added.

### Distribution & backlinks (R13)
- **R13.1 Badge embarcable "1ère/2e/Nème ville de France"** — ✅ shipped 2026-07-10 (`/badge` hub + `/badge/[slug]` × 540 SSG, `lib/city-badge.ts` + `components/BadgeEmbed.tsx`). Three formats (compact 280×80, wide 460×120, square 200×200) — self-contained SVG strings (no external font, no fetch), one-click copy for both the full embed `<a>` snippet and the raw SVG. National rank computed once from the seed global score (cached module-level). Card added to the FR CityProfile sub-page grid; `/badge` chunk added to `SITEMAP_CHUNKS_FR` at the tail (order-stable, existing chunk URLs unchanged; `SITEMAP_CHUNK_COUNT` auto-picks it up so `robots.txt` advertises the new chunk). EN mirror deferred — the backlink pitch is a FR-side motion (mairies, offices de tourisme, agences locales), doesn't translate cleanly to `bestcitiesinfrance.com`'s expat audience.
  - **La motion elle-même tourne** : `npx tsx scripts/outreach-mairies.ts` (dry-run par défaut, `--send` pour tirer), registre des communes déjà contactées dans `scripts/outreach-contacted.json`, journal complet dans **`docs/outreach-log.md`**. Deux règles à ne pas contourner : les adresses se résolvent **par code Insee** via l'annuaire officiel de l'État (chercher par nom renvoie des homonymes ; les annuaires tiers ont produit les 4 seuls bounces de la campagne), et tous les chiffres d'un envoi sont **calculés depuis le seed**, jamais saisis à la main. État au 2026-07-29 : 137 envois, 1 réponse presse (NRCO).
- **R13.2 Palmarès mensuel** — ✅ first edition shipped 2026-07-14 as guide `palmares-juillet-2026-rapport-qualite-vie-loyer` (score global ÷ loyer T2, 540 villes, filtre pop ≥ 20k — ranking computed from seed + housing, no invented figures; méthodo affichée dans le guide). **Cadence: one edition per month, published as a guide** (`palmares-[mois]-2026-…`, category `budget`). ⚠️ **Une édition n'est publiée qu'à partir du 2 du mois qu'elle porte (règle du 2026-10-09).** Une ancienne version du prompt de la routine palmarès « préparait la suivante » : au 2026-10-07, `GUIDES` rendait déjà novembre 2026, décembre 2026 et janvier 2027 — un lecteur d'octobre tombant sur « Palmarès janvier 2027 » ne croit plus le reste du site. Les éditions rédigées en avance vivent dans **`data/palmares-drafts.ts`** (`PALMARES_DRAFTS`), qu'aucun module de `app/`, `components/`, `lib/` ou `worker/` n'importe : ni page, ni hub, ni sitemap, ni search-index, ni maillage. Le 2 du mois, la routine palmarès **déplace** l'objet dans `data/guides.ts`, remet `publishedAt`/`updatedAt` à la date réelle, revérifie les chiffres contre le pipeline et ses `relatedGuides` (un lien vers un autre brouillon fait échouer `assertKnownSlugs`, c'est voulu), puis `npm run search-index`. **Garde `palmarès` dans `npm run integrity`** : elle refuse une édition de `GUIDES` datée d'un mois futur (mois lu dans le slug, bascule le 2 en UTC), un slug présent des deux côtés et tout import des brouillons depuis une surface rendue — vérifiée en la faisant échouer. Les trois éditions retirées n'ont pas de redirection : un 301 vers octobre survivrait à leur republication et la masquerait. État au 2026-10-09 : 4 éditions publiées (juillet → octobre), 3 brouillons (novembre, décembre, janvier) ; les blocs « Cinquième / Sixième / Septième édition » ci-dessous décrivent ces brouillons, rédigés et contrôlés, **pas des pages en ligne**. Second edition shipped 2026-07-28: `palmares-aout-2026-rapport-qualite-vie-prix-achat` (score global ÷ prix d'achat au m², 363 communes éligibles = pop ≥ 20k avec référence de prix). Third edition shipped 2026-08-02: `palmares-septembre-2026-ecoles-cout-du-logement` (**axe `schools` ÷ loyer T3**, 363 communes éligibles = pop ≥ 20k ; les 540 villes du seed ont toutes une référence de loyer, donc le seul filtre est la population). Le thème annoncé en août a été honoré tel quel. Le T3 remplace le T2 de juillet parce qu'une famille avec enfants ne vit pas dans un deux-pièces, et ça change le classement. Ratio publié en **euros de loyer par point de score écoles** (médiane 184 €, Alençon 94 €, Aubervilliers 550 €) : plus lisible que le quotient brut. ⚠️ Le bas du classement est à 26/30 francilien (une seule ville d'Île-de-France dans les 100 premières sur 115 éligibles, Fontainebleau 93e) — la section correspondante dit explicitement que l'axe mesure l'offre communale, pas le destin des élèves, et ne juge ni eux ni leurs enseignants ; garder ce cadrage si l'édition est reprise. Quatrième édition shipped 2026-08-15 : `palmares-octobre-2026-taux-effort-logement` (**loyer T3 annuel ÷ revenu disponible d'un ménage de référence**, 357 communes éligibles). Le thème annoncé en septembre a été honoré tel quel. **Le dénominateur est la nouveauté et le piège** : `medianIncome` est un **niveau de vie par unité de consommation**, pas un revenu de ménage — le multiplier par les UC du ménage cité est obligatoire, sinon le taux affiché est presque doublé. Ménage retenu : couple + un enfant de moins de 14 ans = **1,8 UC** (échelle OCDE modifiée), qui occupe un T3. Éligibilité : pop ≥ 20k **et** niveau de vie publié — 6 des 363 communes de septembre tombent (Les Abymes, Baie-Mahault, Cayenne, Saint-Laurent-du-Maroni, Mamoudzou hors champ Filosofi ; Pierrefitte-sur-Seine fusionnée). Médiane 31,1 %, Aurillac 17,1 %, Paris 62,8 %. ⚠️ Trois limites portées **dans le guide** et à ne pas diluer si l'édition est reprise : ① les revenus sont au millésime **Filosofi 2021** et les loyers à 2026, donc les taux absolus sont **surestimés** et seul le classement tient ; ② le loyer est un loyer **de marché**, donc un coût d'entrée, pas ce que paient les locataires en place ; ③ le revenu disponible Insee **inclut les prestations, aides au logement comprises**, ce qui joue en sens inverse. Le classement est robuste au choix du ménage (corrélation de rang 0,99 avec une personne seule en T1, > 0,99 avec un couple en T2) — ne pas re-débattre du 1,8 UC. Cinquième édition shipped 2026-09-02 : `palmares-novembre-2026-ou-la-france-emmenage` (**variation de population municipale Insee 2011 → 2022**, 361 communes éligibles). Le thème annoncé en octobre a été honoré tel quel. C'est la première édition qui **ne calcule pas un rapport** : elle classe une mesure brute, et croise le résultat avec nos scores au lieu de les mettre au dénominateur.
**Le résultat est le contraire de ce que le site suggère ailleurs, et c'est l'intérêt de l'édition** : la corrélation de rang entre croissance et score global vaut **−0,165** (−0,206 sur les 344 villes notées sous 7). Les 30 villes qui croissent le plus vite ont une note médiane de **4,6**, les 30 qui se vident le plus vite **5,8**, pour une médiane générale de 5,3 ; leur loyer T3 médian est de **1 080 €** contre **725 €**. On emménage là où c'est cher et mal noté, parce que la croissance suit l'emploi et le foncier constructible. ⚠️ Mais la relation est **en U, pas linéaire** : les bandes de note donnent +6,2 % (69 villes sous 4), +4,5 %, +2,8 %, +2,0 % (85 villes de 6 à 7), puis **+6,8 %** pour les 17 villes notées ≥ 7 — la France grandit à ses deux extrémités et se vide au milieu. **La médiane de cette dernière bande porte sur 17 villes seulement et le guide dit qu'elle est fragile** : ne pas la durcir, la pente qui la précède (344 villes) est le résultat solide.
⚠️ Trois pièges de méthode propres à cette source. ① Le fichier Insee **rétropole les millésimes anciens sur la géographie communale d'aujourd'hui**, donc une fusion ne fabrique pas de croissance (Annecy 2011 = 119 426, déjà le périmètre fusionné) — vérifié sur Annecy, Saint-Denis, Cherbourg, Les Sables-d'Olonne, Évry-Courcouronnes. ② Le seuil de 20 000 hab. est appliqué à la **population mesurée** et non aux `population` approximatives du seed, d'où **361** éligibles et non les 363 des éditions précédentes : 5 entrent (Lingolsheim, Givors, Denain, Cugnaux, Mont-Saint-Aignan), 5 sortent (Sélestat, Saint-Dié-des-Vosges, Cahors, Pertuis, Fontainebleau), plus Mamoudzou et Pierrefitte-sur-Seine sans donnée. Le guide liste les dix avec leur effectif. ③ Le recensement compte des **résidents** : littoral et montagne convertissent en résidences secondaires, et la commune n'est pas l'aire d'attraction (Paris perd 136 270 habitants pendant que la commune francilienne médiane gagne 5,4 %).
⚠️ **Quatre affirmations écrites au premier jet et corrigées avant commit**, toutes du même genre que celles du batch 38 — un rang, un décompte ou une comparaison qu'aucun contrôle automatique ne voit : ① Beaune donnée « deuxième meilleure note du corpus éligible » alors qu'elle en est **la première** (7,7, devant Anglet 7,6) ; ② « quinze des trente dernières places » pour Hauts-de-France + Grand Est, alors que le décompte réel est **douze** (7 + 5) ; ③ la perte parisienne comparée à « une ville comme Nancy » (104 387 hab.) quand elle vaut **136 270**, soit la population d'**Amiens** (134 780) ; ④ le #1 lui-même, Villenave-d'Ornon à +45,5 %, **vérifié en ligne avant publication** parce qu'un tel écart ressemble d'abord à un bug — les 42 185 habitants sont la population légale 2022 authentifiée par le décret n° 2024-1276 du 31/12/2024, et la cause est documentée (tramway C en 2019, ZAC de la route de Toulouse). **Une croissance aberrante se vérifie contre l'Insee avant d'être publiée en tête de classement.**
Contrôles passés : `npx tsc --noEmit` propre, `npm run integrity` (guides FR 1042 → 1043), `search-index` + `search-index:check` (251 tags, inchangé, donc aucune page `/tags/` créée), `sitemap:check` (FR 29 124 → **29 125 URL**, soit exactement le guide neuf). `npm run build` **non lancé, volontairement** (cf. § Commands depuis le batch 27).
Sixième édition shipped 2026-09-22 : `palmares-decembre-2026-structure-par-age` (**part des 60 ans et plus**, les sept tranches Insee de `data/city-population.json`, mêmes 361 communes éligibles). Le thème annoncé en novembre a été honoré tel quel et ses trois repères retrouvés à l'identique : **48,7 % aux Sables-d'Olonne, 5,3 % à Saint-Laurent-du-Maroni, médiane 24,1 %**. C'est la deuxième édition d'affilée qui classe une mesure brute et la croise avec nos scores au lieu de la mettre au dénominateur.
**Le résultat est l'exact miroir de celui de novembre, et c'est l'intérêt de l'édition** : la corrélation de rang entre la part des seniors et notre score global vaut **+0,455** (novembre : −0,165 entre ce même score et la croissance). La pente par bandes ne se retourne jamais sur les 361 villes — note médiane **3,5 · 4,8 · 5,2 · 5,7 · 5,9** pour les bandes < 18 %, 18-22 %, 22-26 %, 26-30 % et > 30 % (48, 86, 80, 80 et 67 communes), contre 5,3 de médiane générale — donc nettement plus robuste que le U de novembre, dont la dernière bande ne portait que 17 villes. ⚠️ **Le mécanisme est mesuré, pas supposé, et il est entièrement géographique** : la part des seniors corrèle à **+0,608** avec l'axe nature, +0,499 sécurité, +0,451 qualité de vie, +0,377 coût, mais **−0,519** transports et −0,066 télétravail. Nos axes récompensent le calme, la nature, la sécurité et le logement abordable, c'est-à-dire la carte que l'âge occupe : **le score ne mesure pas l'âge, il mesure la même géographie.** Aucune causalité n'est tirée, et le guide le dit.
⚠️ **Trois pièges de méthode propres à cette source, à ne pas défaire si l'édition est reprise.** ① Les **tranches d'âge n'existent que pour le millésime 2022** là où les populations totales en portent trois : l'édition publie un **état et jamais une tendance**, aucune ville n'y est dite « en train de vieillir » — Les Sables-d'Olonne est la plus âgée du corpus et gagne 17,5 % d'habitants depuis 2011, 17 des 30 premières sont en croissance. ② **Le seuil de 20 000 habitants ne change pas que la liste, il retourne la conclusion.** Le red flag `villes-sans-enfants` (14/09) mesure à partir de **10 000** habitants que ses 28 communes sont plus riches et plus chères que son corpus (23 490 € contre 21 410 €, T3 1 050 € contre 950 €) ; à partir de 20 000, les 30 plus âgées ont un T3 médian de **880 € contre 1 010 €** et un niveau de vie **identique** (21 505 € contre 21 420 €). Les deux mesures sont exactes : les stations balnéaires aisées sont **petites** (à 10 000 habitants, Arcachon 60,4 %, Royan 56,0 %, Dinard 51,2 %, La Baule 50,5 % et Sanary 49,6 % passent devant Les Sables), et le seuil les efface. ③ **113 des 361 communes éligibles sont en Île-de-France** (médiane 19,3 %, la plus basse des régions métropolitaines) : les 24,1 % sont la médiane de **notre corpus**, pas celle des villes françaises — hors Île-de-France, 27,1 %.
⚠️ **Cinq décomptes faux corrigés avant commit, tous invisibles pour `tsc` et `npm run integrity`** : « seize » communes du top 20 à moins de 15 km de la mer pour **quinze** (et la liste d'exceptions oubliait **Saintes**) ; Challans donnée deuxième meilleure note du top 20 alors que Les Sables (7,4) passe devant (7,1) ; Caen « cinquième » part de moins de 15 ans la plus faible pour la **sixième** ; « soixante-sept » communes au-dessus de 30 % pour **soixante-six** (67 sont à 30 % ou plus) et « vingt » au-dessus de 36 % pour **vingt et une** ; Vierzon donnée seule commune **du classement** à 1 100 €/m² (vrai du **top 20** seulement). Deux superlatifs retirés faute d'être vérifiables. Le prix au m² cité est le repère éditorial **`avgBuyPriceM2`** et le guide le nomme comme tel.
Septième édition shipped 2026-10-04 : `palmares-janvier-2027-prix-reels-appartements` (**médiane DVF du prix au m² des appartements**, ventes 2024-2025, `lib/property-prices.ts`, **347 des 361 communes éligibles**, 431 509 ventes). Le thème annoncé en décembre a été honoré tel quel et ses trois repères retrouvés à l'identique (347 villes, médiane **2 712 €/m²**, 14 manquantes = 13 Alsace-Moselle en livre foncier + Saint-Laurent-du-Maroni à 9 ventes). Neuilly-sur-Seine **10 382 €** → Montluçon **680 €** (×15,3), Q1 1 986 €, Q3 3 759 € ; 19 du top 20 et 42 du top 50 en Île-de-France (médiane IdF 3 775 € contre 2 275 € ailleurs), Biarritz seule exception (9ᵉ). Coupure du top 20 hors égalité (6 207 contre 6 184).
**Le résultat est un audit de notre propre repère** : `HOUSING.avgBuyPriceM2` range les villes presque comme les transactions (corrélation de rang **0,931**) mais dépasse la médiane appartement dans **235/347** villes, écart médian **+9,1 %**, ±10 % dans 127, > 25 % dans 71. ⚠️ **La moitié de cet écart est un artefact de comparaison** : le repère est tous biens confondus et la maison est plus chère que l'appartement dans 300/342 villes ; face à un prix mixte (médianes appartement et maison **pondérées par le nombre de ventes** — ce n'est pas une médiane de toutes les ventes, le guide le dit), l'écart médian tombe à **+3,2 %**, ±10 % dans 174, > 25 % dans 33. Le repère surestime surtout le bas du marché (quart le moins cher +15,1 %, quart le plus cher +2,4 %, quarts intermédiaires 5,6 et 13,0 — pente non régulière, publiée telle quelle). Écarts nommés : Montbéliard +82 %, Yerres +78 %, Montluçon +62 % (le repère y décrit la maison, 1 088 €), Perpignan +53 % sur 3 096 ventes, Nîmes +33, Grenoble +28, Saint-Étienne +25, Toulouse +24, Nantes +23 ; à l'inverse **Saint-Paul (La Réunion) −55 %** (5 304 € contre 2 400, appartement plus cher que la maison), puis littoral et Nord–Pas-de-Calais (où l'appartement se vend plus cher que la maison). ⚠️ **Le guide ne réaligne pas le repère et dit pourquoi** — conforme à la règle posée au 18/08. Si quelqu'un corrige un jour `data/housing.ts`, il faut relire ces chiffres dans le guide. Croisement avec nos notes : corrélation de rang prix/score **−0,126**, note médiane du top 20 5,4 contre 5,85 pour les 20 moins chères ; 9 des 16 villes notées ≥ 7 sous la médiane de prix (Beaune 7,7 à 2 533 €, Laon 7,2 à 1 136 €). Sept villes sous 50 ventes (Saint-Benoît 21, Denain 22…) signalées comme fragiles. ⚠️ **Une affirmation corrigée avant commit** : les sous-estimations étaient dites « plus profondes » que les surestimations alors que l'écart maximal est de −55 % contre +82 %. Contrôles : `tsc` propre, `integrity`, `search-index` + `:check` (274 tags, inchangé), `sitemap:check` (FR **29 310 URL**). `npm run build` non lancé, volontairement.
Announced next theme (**février 2027**) : **les maisons**, même source DVF (médiane €/m² maison, ventes 2024-2025), disponible pour **343 des 361** communes éligibles, médiane **3 264 €/m²** (mesuré le 04/10). Les 18 manquantes : les 13 d'Alsace-Moselle + **5 de petite couronne sous 20 ventes de maison** (Levallois-Perret, Clichy, Saint-Mandé, Charenton-le-Pont, Le Kremlin-Bicêtre) ; Saint-Laurent-du-Maroni, absente en janvier, y figure. Angle : l'écart maison/appartement et les **42 villes sur 342** où la maison coûte moins cher au m² que l'appartement (Nord–Pas-de-Calais, littoral, Antilles). Rappel obligatoire : le prix d'une maison **inclut son terrain**. Honour it or update the January guide's last section if the theme changes. Method: rank from the real pipeline via a scratch `npx tsx --tsconfig tsconfig.json` hors du dépôt, important `@/data/cities-seed`, `@/lib/property-prices`, `@/lib/city-population` ; éligibilité = `pop2022 > 20 000` mesurée, jamais la `population` du seed.

### Vacances `/vacances` — architecture (shipped, monétisation pending)
Engines: `lib/vacation-seasons.ts` (climat 12 mois ×352), `lib/vacation-activities.ts` (10 activités), `lib/vacation-fit.ts` (score composite + helpers). 387 routes SSG.
Activation monétisation: créer compte Booking Partners → `NEXT_PUBLIC_BOOKING_AID=XXXXXXX` sur Vercel.
Phase 1.5 shipped: `lib/climate-normals.ts` + `data/climate-normals-raw.json` (29 MF stations, nearest-station snap, fallback sinusoïdale). SVG chart sur `/villes/[slug]/climat` (FR) et `/cities/[slug]/climate` (EN) via `components/ClimateChart.tsx`. Phase 3 shipped: quiz `/vacances/quiz` + email capture (Brevo list 4, `/api/vacances/newsletter`).

---



### EN routes shipped (as of 2026-05-21)

FR-equivalent routes covered: home, cities index + 352 city pages, 4 city sub-pages (climate/transport/schools/cost-of-living), 17 total city sub-pages, rankings index + 19 detail pages, 18 regions, all departments, quiz, compare + ~300 pairs, compare-regions (78 pairs), guides index + 6 native EN guides, map, leaderboard, about, contact, faq, methodology, legal, privacy.

### EN translation roadmap — pending

**Phase 1 — content depth**
- [x] `descriptionEn` / `seoTitleEn` / `seoDescriptionEn` — all 541 cities populated (verified 2026-05-26)
- [ ] Keep `REGION_EN_DESCRIPTIONS` and `RANKING_EN` in sync with FR changes — *couverture vérifiée 2026-07-28 : 18/18 régions, 19/19 classements, zéro clé orpheline de part et d'autre.* Item permanent (il se rouvre dès qu'une région ou un classement est ajouté côté FR), pas une tâche en attente.

**Phase 2 — missing routes**
- [x] Triplet comparisons `/compare/[a]-vs-[b]-vs-[c]` (shipped via `lib/comparer-triplets.ts` + `app/[locale]/compare/[pair]/page.tsx`)
- [x] `/cities/[slug]/things-to-do` (EN port of FR `a-faire`, ×540 SSG, 2026-06-01) — EN city sub-pages now fully mirror FR
- [x] `/sport` + `/sport/[macroregion]` ×6 (EN national sport ranking, 2026-06-01) — mirrors the `cycling` hub, reuses `lib/sport-leisure`
- [x] `/rental-tension` + `/rental-tension/[macroregion]` ×6 (EN, 2026-06-01) — port of FR `/tension-locative`, reuses `lib/rental-tension`, links to `/cities/[slug]/rental-market`
- [x] `/political-leaning` (EN, 2026-06-01) — port of FR `/orientation-politique`, reuses `lib/political-lean` (`BLOC_LABEL.en`)
- [x] `/weekend-getaways` + `/weekend-getaways/[slug]` ×26 (EN, 2026-06-01) — port of FR `/depuis`, reuses `lib/city-commute`; Paris card → `/from-paris`
- [x] `/tags` + `/tags/[slug]` (EN, 2026-06-01) — port of FR `/tags` via new `lib/guide-tags-en.ts` (reads `EN_GUIDES`; FR `lib/guide-tags` untouched)
- _Note: FR `/palmares` + `/synthese` are already covered by EN `/overall-ranking` (same `lib/city-synthesis`); FR `/vivre-avec` by EN `/living-on`. EN top-level parity with FR is now effectively complete._

**Phase 3 — secondary surfaces** (all shipped)
- [x] `/red-flags` + `/red-flags/themes` (EN)
- [x] `/vacations` (EN port)
- [x] `/quiz/compatibility` (EN port)
- [x] `/calculator/real-cost`, `/household-cost`, `/simulator/purchase`
- [x] City sub-pages: `neighbourhoods`, `seasons`, `honest-review`, `climate-2040`, plus `fingerprint`, `vibe`, `get-settled`, `overview`, `synthesis`, `profiles`

**Phase 4 — long tail**
- [ ] EN guides — in progress (531 native EN guides via `data/guides-en.ts`; FR has 669; not 1:1 translations, native expat-angle content). **2026-06-03 per-city / per-region batches** (all grounded in the matching FR guide's real figures + `housing.ts`, auto-registered via `EN_GUIDES`):
  - **+10 cost-of-living** `cost-of-living-[city]-2026` (Paris/Lyon/Bordeaux/Toulouse/Montpellier/Nice/Nantes/Rennes/Strasbourg/Lille) — from FR `budget-mensuel-realiste`; filled the EN budget gap (was 16 vs FR 134).
  - **+15 where-to-buy** `where-to-buy-in-[city]-2026` (Paris/Lyon/Marseille/Toulouse/Lille/Bordeaux/Nantes/Strasbourg/Rennes/Montpellier/Nice/Grenoble/Annecy/Aix-en-Provence/Biarritz) — from FR `acheter-a-[ville]-quel-quartier-budget`; per-neighbourhood €/m² + foreign-buyer process.
  - **+13 car-free living** `car-free-living-in-[city]-2026` (Paris/Lyon/Strasbourg/Bordeaux/Nantes/Toulouse/Grenoble/Rennes/Montpellier/Nice/Lille/Annecy/Dijon) — from FR `vivre-sans-voiture`; category `lifestyle`.
  - **+12 living in [region]** `living-in-[region]-2026` (the Dordogne, French Basque Country, French Riviera, the Var, Alsace, Brittany, Normandy, Charente-Maritime, Haute-Savoie, Occitanie, Roussillon, Hauts-de-France) — region-level overviews from FR `vivre-en-[region]`; category `moving`. (`leaving-[city]` is already well-covered in EN, so `quitter` was skipped.)
  - **Discoverability (2026-06-04):** the new guides (and all 482) were only reachable via /guides index, search, tags. Fixed the orphan gap: `CityGuidesList` made locale-aware (`locale="en"` reads `EN_GUIDES` + EN copy; FR output byte-identical) and wired into `app/[locale]/cities/[slug]`; EN region pages (`app/[locale]/regions/[region]`) gained a "Guides about [region]" reverse-lookup block. Every EN city/region page now links up to 12 native guides (newest first). FR pages untouched/unchanged.
  - **2026-06-04 — FR parity reached on two series + all admin regions covered (EN 482→526):** **+34 where-to-buy** `where-to-buy-in-[city]-2026` (all remaining FR `acheter-a-[ville]` cities — Amiens/Angers/Arles/Avignon/Bayonne/Besançon/Brest/Caen/Chambéry/Chartres/Clermont-Ferrand/Colmar/Dijon/La Rochelle/Le Havre/Le Mans/Limoges/Lorient/Metz/Mulhouse/Nancy/Nîmes/Orléans/Pau/Perpignan/Poitiers/Reims/Rouen/Saint-Étienne/Toulon/Tours/Troyes/Valence/Vannes) → **where-to-buy now 49/49 vs FR**; **+2 car-free** (Clermont-Ferrand, Marseille) → **car-free now 15/15 vs FR**; **+8 living-in [region]** (Île-de-France, Auvergne-Rhône-Alpes, Nouvelle-Aquitaine, Provence-Alpes-Côte d'Azur, Grand Est, Pays de la Loire, Bourgogne-Franche-Comté, Centre-Val de Loire) → **all 13 metropolitan admin regions now have a top-level EN overview** (the other 5 already shipped). Region guides set `relatedCities` to real region city slugs so they surface on EN region pages (reverse lookup = relatedCities ∩ region-cities, not tags). Method note: re-serialize agent objects through a canonical serializer before splice (2 agents had drifted to 2-space indent / dropped opening `{` — `new Function('['+frag+']')` parse → field-ordered emit → tsc-gated).
  - **2026-06-04 (b) — +10 `best-french-cities-[theme]` ranking guides (EN 526→536):** ports high-intent `meilleures-villes` themes that had no EN equivalent, for the relocation audience: international-schools (`family`), healthcare, lgbt-friendly, wine-lovers, property-investment (`budget`), surf-watersports, vegan-vegetarian, culture-festivals, wellness-spas, clean-air (all `lifestyle` unless noted). Native EN ranking guides grounded in each FR source's real city ranking + data (CHU counts, GP density, rental yields, €/m², ATMO air indices, thermal towns, festivals, school names). `relatedCities` = top-ranked real slugs → surface on those cities'/regions' EN pages. Deliberately NON-overlapping with the existing EN best-cities cluster (foodies/families/students/seniors/remote/cycling/outdoor/mountain/coastal). Still uncovered in EN best-cities (after the (c) batch): freelancer-ecosystem (overlaps remote/nomad), music-scene (overlaps culture-festivals), naturalist-biodiversity, covered-markets, single-parent/blended families, kids-sport, stable-industrial-jobs — all lower expat intent.
  - **2026-06-04 (c) — +5 medium-intent best-cities (EN 536→541):** affordable-property (`budget`, first-time/budget buyers), entrepreneurs-startups (`remote-work`, French Tech), accessibility (`lifestyle`, disabled/reduced-mobility), sustainability (`lifestyle`, greenest/zero-waste), international-students (`lifestyle`, angled at foreign students — distinct from the existing general best-cities-for-students). Same grounding/validation method.
  - **2026-06-04 (d) — +5 micro-region living-in (EN 541→546):** Ariège, Creuse, Berry, Poitou, Ardennes-Meuse (rural sub-regions, unique long-tail, honest cheap-rural-France framing). `living-in` series now covers all 13 admin regions + the major sub-regions; only Périgord/Bretagne-intérieure/Auvergne-profonde left, and those overlap existing EN (the-dordogne / brittany / auvergne-rhone-alpes) so skipped.
  - Method for all: extract FR figures → parallel read-only agents → validate (schema/€-glyph/figure presence/slug-uniqueness) → single-writer insert (parse-validate + canonical re-serialize before splice). The `assertUniqueSlugs` guard blocks any accidental dup at build.
  - **EN guide coverage is now effectively complete for the well-grounded, distinct topics.** Series at FR parity / full coverage: where-to-buy (49/49), car-free (15/15), cost-of-living, things-to-do (170), living-in (13 admin regions + sub-regions), best-french-cities (≈33 themes). The practical "how to move to France" cluster was already comprehensively covered — and had **content-cannibalisation** (near-identical pages competing for one query, same root cause as the earlier dup-*slug* bug but with distinct slugs). **De-duped 2026-06-04 (EN 546→537):** removed 9 near-identical guides keeping the richest + any distinct angle per cluster — healthcare 7→2 (kept `france-healthcare-guide-expats` + `navigating-cpam-doctolib`), banking 3→2, driving-licence 2→1 (broad `driving-in-france` kept separately), income-tax 2→1 (property-tax kept separately), social-security 2→1. Each removed slug 301s to its canonical in `public/_redirects`. NO dangling refs (EN guides cross-link dynamically via `suggestNextEnGuides`, not hardcoded slugs). **Batch 2 (same day, EN 537→532):** the same pattern existed in the best-cities/moving series — removed 5 more: families 2→1, remote-work/digital-nomad 6→3 (kept the `france-for-remote-workers-complete-guide` pillar + `best-french-cities-remote-workers` ranking + `france-for-digital-nomads`), pets 2→1; all 301'd. **Batch 3 (corpus-wide similarity scan):** ran an automated overlap scan across all EN guides (title+headings token overlap, excluding within-series pairs which legitimately share a template). It surfaced one more true cross-cluster dup — two national "complete guide to buying property in France" guides — removed `french-property-purchase-guide-for-expats` (kept the richer `buying-property-in-france-expat-guide`), 301'd. The scan confirmed everything else flagged was **series structure, not duplication** (per-city `where-to-buy`/`living-in`/`things-to-do`, `leaving-[city]`, `[city]-vs-[city]`, `[city]-living-guide` all share templates by design but cover distinct entities). **Net EN 546→531 across the three dedup batches; corpus now clean of clear near-duplicates.**
- **FR dedup (2026-06-04, `data/guides.ts` 669→657):** the FR primary site had the same problem in a different shape — 12 guides existed as both a stale `…-2025` and a current `…-2026` (6 `vivre-en-` regions, 4 `meilleures-villes-` themes, `teletravailler-depuis-alsace`, `metz-vs-nancy-comparatif`). Removed the 2025 versions, kept 2026, 301'd each in `public/_redirects`. Rewrote all surviving `relatedGuides` cross-refs 2025→2026 (occitanie alone was referenced 31×) and removed the 4 resulting consecutive-duplicate entries (Corsica tourism guides). FR guide-page render already filters `relatedGuides` to existing slugs, so no dead links. Detector: `grep slugs | sed 's/-20[0-9]{2}$//' | uniq -d` (same base, two years). A follow-up FR similarity scan (same method as EN) then found one phrasing-dup cluster: an orphan 3-city `guide-immobilier-[city]-prix-quartiers` series (bordeaux/nantes/rennes) whose guides were literally titled "Acheter à [city]…" — pure dups of the canonical 49-city `acheter-a-[city]-quel-quartier-budget` series. Removed the 3 orphans (0 inbound refs), 301'd to the richer `acheter-` versions. **FR 669→654; both FR & EN corpuses now scanned (year-collision + title/heading similarity) and clean of clear near-dupes.** Genuinely remaining = only low-intent listicles (music-scene, covered-markets, naturalist, single-parent/blended families, kids-sport, stable-industrial-jobs) and comparatifs (covered by `/compare`).
  - ✅ **Duplicate-slug bug FIXED + guarded (2026-06-03):** EN had 3 dup slugs (`strasbourg-/rennes-living-guide-for-expats-2026`, `french-school-system-expat-guide-2026`); FR `GUIDES` had 3 more (`vivre-en-centre-val-de-loire-guide-2026`, `vivre-en-hauts-de-france-guide-2026`, `10-choses-a-faire-a-clermont-l-herault-2026`). The 2nd of each pair was dead (`.find()` returns the first) + a dup sitemap URL. Kept the richer variant of each pair. EN 445→442, FR 672→669. **Regression guard added:** `assertUniqueSlugs()` in `lib/data-integrity.ts` throws at module load (dev + `phase-production-build`); wired into `data/guides.ts` (`guides.slug`) and `data/guides-en.ts` (`guides-en.slug`). A future duplicate now fails the build loudly.
- 2026-06-01/02:
  - **170 EN tourism guides `things-to-do-in-[city]-2026` — FULL PARITY with FR `10-choses-a-faire` reached (2026-06-02).** Every FR tourism city now has a native EN counterpart. Auto-surfaced as the featured card on `/cities/[slug]/things-to-do`; slug + featured-card lookup mirror FR `a-faire`. Shipped across 19 batches (batches 6–19 this session, +120 guides covering all of metropolitan France: heritage cathedrals, Loire/Basque/Brittany/Corsica, Riviera, Champagne, the north coast, Alps, Pyrenees, Auvergne, Jura, Vosges, plus the smaller prefecture towns). NB: EN deploy needs `NODE_OPTIONS=--max-old-space-size=4096` (47k-asset upload OOMs Node's default heap — see [[deploy-manual-no-ci]]).
  - 6 EN itinerary guides (`one-week-in-provence`, `french-riviera-road-trip`, `loire-valley-chateaux`, `alsace-wine-route`, `brittany-coast-road-trip`, `three-days-in-paris`) — `category: "lifestyle"`, distinct travel-intent series.
  - EN guide-page "Read next" now relevance-ranked (`lib/guide-suggestions-en.ts`); guide-page JSON-LD enriched (Article author/publisher/mainEntityOfPage + BreadcrumbList).
- [x] Per-city OG images with EN copy (`app/[locale]/cities/[slug]/opengraph-image.tsx`, EN locale, "BestCitiesInFrance")
- [x] EN-specific RSS feed (`/feed.xml` + `/guides/feed.xml` locale-aware via `NEXT_PUBLIC_DEFAULT_LOCALE`)

---

## Roadmap v11 — Data depth, guide series & per-city enrichissement

### Doublons filtrés (déjà livré — ne pas re-créer)

| Demande | Couverture existante |
|---------|----------------------|
| météo / indice météo | `/villes/[slug]/climat` + `ClimateChart` |
| fibre / 5G / internet | `/villes/[slug]/connexion-internet` |
| prix location / tension locative | `/villes/[slug]/tension-locative` |
| transports / gares / autoroutes / temps de trajet | `/villes/[slug]/transports` |
| écoles | `/villes/[slug]/ecoles` (EN: `schools`) |
| sortir / commerces culturels | `/villes/[slug]/a-faire` + guides `10-choses-a-faire` |
| quartiers | `/villes/[slug]/quartiers` |
| comparaisons A vs B | `/comparer/[a]-vs-[b]` (~300 paires SSG) |
| avis | CityProfile onglet discussion |
| immobilier / acheter | guides `acheter-a-[ville]` (49 villes FR + EN) |
| coût de la vie | guides `budget-mensuel-realiste` (FR) + `cost-of-living-[city]` (EN) |
| expatrié | EN living guides |
| criminalité | score `safety` dans seed (affiché onglet scores) |
| score famille / étudiant / retraité / écologique | `lib/niche-scores.ts` + city-match |
| emploi / télétravail | champ `remoteWork` seed + `/copilot` |

### Nouvelles sous-pages ville — ✅ toutes livrées

`/villes/[slug]/statistiques`, `sante`, `air` (= pollution), `emploi`, `commerces` existent tous
(plus `bruit`, `eau`, `risques`, `fiscalite`, `securite`, `demographie`, `sport`, `velo`… — ~38
sous-pages ville au total). Computed from existing seed axes + characterTags, pas de nouveaux
champs seed. Même pattern que `climat`.

### Enrichissement seed — champs à ajouter (toujours ouvert)

`population` est fait ; le reste n'a jamais été ajouté (les sous-pages ci-dessus s'en passent en
computant depuis les axes existants — l'enrichissement reste utile pour des chiffres réels) :

- ~~`population: number`~~ — ✅ dans le seed (recensement)
- ~~`salaireMédianNet`~~ — ✅ **remplacé par mieux, 2026-07-28** : `data/city-income.json`
  (via `scripts/city-income.mjs` + `lib/city-income.ts`) porte le **niveau de vie médian**
  et le **taux de pauvreté** réels, publiés **à la commune** par Insee Filosofi 2021 —
  533/540 villes. C'est plus fin que le proxy départemental prévu ici. Attention au
  vocabulaire : niveau de vie = revenu disponible par unité de consommation, **pas un
  salaire** ; `lib/city-income.ts` porte la convention. Surfacé sur
  `/villes/[slug]/statistiques` + EN `statistics`. Non couvertes : Guadeloupe, Guyane,
  Mayotte (hors champ Filosofi) et Pierrefitte-sur-Seine (fusionnée dans Saint-Denis
  en 2025) — la page n'affiche alors rien plutôt qu'un chiffre inventé.
- ~~`populationEvolution: number`~~ — ✅ **fait 2026-07-29, en mieux** : `data/city-population.json`
  (via `scripts/city-population.mjs` / `npm run population` + `lib/city-population.ts`) porte la
  **population municipale réelle 2011 / 2016 / 2022** et les **sept tranches d'âge** publiées par
  l'Insee à la commune (base « Évolution et structure de la population en 2022 ») — 538/540 villes.
  `lib/demography.ts` ne devine plus le vieillissement ni la trajectoire depuis le département :
  `ageingRisk` lit la part réelle des 60 ans et plus, `trajectoryRisk` l'évolution réelle 2016→2022,
  le proxy départemental ne servant plus que de repli. Surfacé sur `/villes/[slug]/demographie`
  (pyramide des âges) et `/villes/[slug]/statistiques` (+ jumelles EN). Non couvertes : Mamoudzou
  (hors fichier « France hors Mayotte ») et Pierrefitte-sur-Seine (fusionnée dans Saint-Denis en
  2025). ⚠️ Le seed conserve ses `population` approximatives, utilisées par les tris et les seuils
  (éligibilité palmarès, filtres) : les deux nombres coexistent volontairement.
- ~~`prixM2` appartement / maison~~ — ✅ **fait 2026-08-18** : `data/city-property-prices.json`
  (via `scripts/city-property-prices.mjs` / `npm run property-prices` + `lib/property-prices.ts`)
  porte la **médiane des prix au m² réellement enregistrés**, appartement et maison séparément,
  depuis **DVF géolocalisé** (DGFiP / Etalab, millésimes 2024 + 2025, 624 036 ventes retenues).
  540/540 villes ingérées : **499 avec un prix appartement, 507 avec un prix maison**. Surfacé sur
  `/villes/[slug]/logement` et EN `/cities/[slug]/housing` via `components/PropertyPriceTable.tsx`
  (composant **serveur** — le JSON fait 172 Ko et n'a rien à faire dans le bundle client).
  ⚠️ `HOUSING[slug].avgBuyPriceM2` (`data/housing.ts`) **reste** et ne mesure pas la même chose :
  c'est un repère éditorial unique tous biens confondus, pas une médiane de transactions. Les deux
  nombres coexistent volontairement et peuvent diverger — ne pas « aligner » l'un sur l'autre, et
  toujours dire lequel est mesuré. Cinq points de méthode à ne pas défaire : ① `valeur_fonciere`
  est le prix de la **mutation entière** répété sur chaque ligne, donc on regroupe par
  `id_mutation` et on ne garde que les ventes portant **un seul** logement — sans ça une vente
  d'immeuble rapporte le prix complet à la surface d'un lot ; ② une mutation revient sur plusieurs
  lignes (une par parcelle), d'où la déduplication sur (parcelle, surface, type) ; ③ le prix d'une
  **maison inclut le terrain** et les dépendances comptent au numérateur sans compter au
  dénominateur, donc le €/m² maison n'est pas comparable au €/m² appartement à l'euro près — les
  deux surfaces le disent ; ④ sous **20 ventes** d'un type sur la fenêtre, l'effectif est publié
  mais **pas** la médiane (`pending: "sample"`, 15 villes sans prix appartement, 7 sans prix
  maison) ; ⑤ **26 communes n'ont aucun prix et n'en auront jamais dans cette source** — le
  Bas-Rhin, le Haut-Rhin et la Moselle relèvent du **livre foncier** et sont absents de DVF
  (`coverage: "livre-foncier"` : Strasbourg, Mulhouse, Metz, Colmar…), Mayotte n'y est pas non plus
  (`coverage: "absent"`). Le bloc s'affiche quand même et **dit pourquoi** : un blanc silencieux se
  lit comme un oubli. `npm run property-prices:selftest` (15 contrôles hors ligne) couvre les
  quatre pièges d'agrégation, les bornes et l'éclatement PLM (Paris → 75101-75120, Lyon → 69381-69389,
  Marseille → 13201-13216, qui n'existent pas comme fichier sous leur code communal).
  Egress : `files.data.gouv.fr` répond depuis une session **locale**, pas depuis une routine cloud.
- `tauxChomage: number` — % (proxie zone emploi)
- `densiteMedecins: number` — généralistes / 1 000 hab
- `indiceAtmo: number` — qualité air annuelle 0–10 (1 = très pollué)
- `espacesVerts: number` — % superficie communale (proxie CORINE)

**Egress : les sources ouvertes sont joignables depuis une session locale** (vérifié
2026-07-28) — `insee.fr` (fichiers zip/csv), `geo.api.gouv.fr`, `data.gouv.fr`,
`overpass-api.de`. C'est l'environnement des routines cloud qui les refuse (403 CONNECT),
pas le projet. Un pipeline d'enrichissement se lance donc en local, pattern
`scripts/city-income.mjs` : téléchargement caché dans `.cache/`, parse, JSON commité.
`api.insee.fr` (Melodi) reste injoignable et demande un jeton — passer par les fichiers
publiés sur `insee.fr`, dont l'URL est stable (`/fr/statistiques/fichier/<id>/<nom>.zip`).

### Bloc FAQ structuré sur CityProfile — ✅ livré

Accordéon `<details>` natif (réponses dans le HTML statique, no-JS/crawler-friendly) en bas de
`CityProfile.tsx` + `FAQPage` JSON-LD dans `components/CityJsonLd.tsx`. 100 % computé depuis le seed.

### Nouvelles séries de guides per-city (FR)

**Depuis le 2026-10-22, ces séries ont leur routine** (`meilleurville-series-villes`, 3 runs par jour) : la file
`docs/series-queue.md` dit quelle série et quelles villes viennent ensuite (compteurs mesurés, villes reportées et
pourquoi), et le skill `.claude/skills/guide-batch/` dit comment écrire un lot (filtre anti-page-mince, intro
answer-first, contrôles). Les skills génériques `programmatic-seo` et `ai-seo` (MIT, vendorisés à côté) en sont la
source ; en cas de conflit, ce fichier gagne. La table ci-dessous reste l'historique ; la file fait foi pour la suite.

État au 2026-07-14 :

| Slug pattern | Catégorie | Cible | Statut |
|---|---|---|---|
| `vivre-a-[ville]-2026` | `moving` | top 50 villes | ✅ 51 guides |
| `etudiant-a-[ville]-2026` | `lifestyle` | top 40 villes étudiantes | ✅ 47 guides — batch 4 2026-10-29 (Annecy, Vannes, Lorient, Quimper, Troyes, La Roche-sur-Yon, Niort), batch 3 2026-10-18 (Perpignan, Pau, La Rochelle, Toulon, Avignon, Chambéry, Valenciennes, Mulhouse, Le Havre, Nîmes) ; batch 2 rouvert 2026-10-18 (Paris, Aix-en-Provence, Nice, Rouen, Reims, Brest, Orléans, Metz, Saint-Étienne, Le Mans) : la série s'était arrêtée à 20 alors que Paris, Aix et Nice avaient déjà leur jumelle EN `studying-in-*`. Chiffres : studio = notre estimation des loyers, abonnement = tarif tout public du calculateur (plafond), score vie étudiante = `computeNicheScores` sur le seed rendu (paliers d'ex æquo annoncés, jamais un rang coupé), 15-29 ans = Insee RP 2022 (médiane 18,5 %), barèmes nationaux 2026-2027 (droits 178/255 €, CVEC 105 €, bourse 145-633 €/mois, repas Crous à 1 € pour tous depuis le 4 mai 2026). Les réseaux absents du calculateur (Yélo à La Rochelle, Tango à Nîmes) sont annoncés comme tels, avec une hypothèse de 30 € étiquetée. **Prochain lot** : Saint-Denis (La Réunion), Annecy, Cergy, Lorient, Vannes, Troyes, Bayonne, Dunkerque, Arras, Niort. **EN** : ✅ les 17 jumelles `studying-in-*` des lots 2 et 3 livrées le 2026-10-22 — parité 40/40. |
| `famille-a-[ville]-2026` | `family` | top 60 villes | 🟢 jumelles EN du lot 6 livrées 2026-10-27 (EN 60, reste le-mans reportée) — lot 6 livré 2026-10-27 (nevers, cholet, albi, laval, saint-malo, belfort), FR 61 — jumelles EN du lot 5 livrées 2026-10-26 (EN 54) — lot 5 livré 2026-10-26 (bourges, la-roche-sur-yon, niort, chartres, blois, auxerre, saint-brieuc), FR 55, jumelles EN à faire — jumelles EN du lot 4 livrées 2026-10-26 (EN 47) — lot 4 livré 2026-10-25 (aix-en-provence, montauban, troyes, angouleme, lorient, arles, cherbourg), FR 48, jumelles EN à faire — jumelles EN du lot 3 livrées 2026-10-25 (EN 40) — 39 guides + famille-au-mans + famille-au-havre (41) — lot 3 livré 2026-10-25 (Quimper, Valence, Bayonne, Chambéry, Avignon, Nîmes, Toulon), jumelles EN à faire — lot 2 livré 2026-10-22 (Perpignan, Annecy, La Rochelle, Poitiers, Nancy, Vannes, Le Havre), jumelles EN à faire — lot 1 livré 2026-10-22 (Grenoble, Reims, Rouen, Brest, Saint-Étienne, Limoges, Amiens) ; jumelles EN des 7 livrées le même jour (EN 26 ; Le Mans reportée) ; lot 2 jumelles EN livrées 2026-10-24 (EN 33) ; file : `docs/series-queue.md` |
| `retraite-a-[ville]-2026` | `lifestyle` | top 20 villes | ✅ 49 guides (lot 6 livré 2026-10-29 : Antibes, Cannes, Fréjus, Aix-en-Provence, Avignon, Béziers, jumelles EN à faire ; lot 5 livré 2026-10-28 : Quimper, Lorient, Saint-Brieuc, Menton, Dax, Bayonne, jumelles EN du lot 5 livrées 2026-10-28 (EN 43) ; lot 4 livré 2026-10-27 : Biarritz, Arcachon, Saint-Malo, Annecy, Sète, Narbonne, Nîmes ; jumelles EN du lot 4 livrées 2026-10-28 (EN 37) ; file : `docs/series-queue.md`) — historique : 20 guides (batch 1 shipped 2026-07-14 : Dinan, Lannion, Les Sables-d'Olonne, Royan, Le Puy-en-Velay, Anglet, Hendaye, Vitré, Fontainebleau, Île de Ré ; batch 2 shipped 2026-07-15 : Challans, Tulle, Pontarlier, Saint-Dié-des-Vosges, Château-Gontier, Albertville, Gaillac, Vendôme, Marmande, Saint-Lô ; **batch 3 shipped 2026-10-18 — les grandes destinations, absentes jusque-là** : Montpellier, Bordeaux, Nice, Perpignan, La Rochelle, Pau, Toulon, Vannes, Angers, Hyères → 30 guides. Chiffres : score retraite = `computeNicheScores` (paliers annoncés), accès aux soins = moteur estimé affiché `10 - composite` (médiane 5,5, toujours dit « estimation »), CHU le plus proche = `nearestChuSite` (vol d'oiseau, annoncé comme tel), 60+/75+ = Insee RP 2022 (médianes 26,2 % / 10,2 %), budget = loyer de notre estimation + lignes d'hypothèse étiquetées, pension moyenne ≈ 1 500 € nets (DREES). **Prochain lot** : Nantes, Tours, Biarritz, Bayonne, Arcachon, Annecy, Avignon, Nîmes, Saint-Malo, Sète) |
| `demenager-a-[ville]-2026` | `lifestyle` (pas de cat. `moving` en FR) | top 50 villes | ✅ 50 guides — série close 2026-07-18 pm. Batch 1 (Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille), batch 2 (Rennes, Grenoble, Rouen, Angers, Dijon, Tours, Clermont-Ferrand, Metz, Nancy, Caen), batch 3 (Saint-Étienne, Le Havre, Reims, Toulon, Villeurbanne, Nîmes, Aix-en-Provence, Brest, Le Mans, Amiens), batch 4 (Saint-Denis 93, Perpignan, Boulogne-Billancourt, Argenteuil, Orléans, Mulhouse, Saint-Paul Réunion, Nanterre, Créteil, Vitry-sur-Seine), batch 5 (Saint-Denis Réunion, Le Tampon, Aubervilliers, Colombes, Asnières-sur-Seine, Courbevoie, Rueil-Malmaison, Champigny-sur-Marne, Saint-Maur-des-Fossés, Antibes). Logistique déménagement (≠ sous-page `s-installer`) |
| `quartiers-a-eviter-[ville]-2026` | `moving` | top 30 villes | ⛔ **écartée 2026-07-28 — faute de données, pas faute d'envie** |
| `travail-a-[ville]-2026` | `lifestyle` | top 30 villes | ✅ 30 guides — série close 2026-07-22 (batches 1/2/3) |
| `universites-[ville]-2026` | `lifestyle` | top 15 villes | ✅ 15 guides — série close 2026-07-25 (batch 1 : Paris, Lyon, Toulouse, Lille, Bordeaux, Aix-en-Provence, Montpellier, Rennes, Strasbourg, Nantes ; batch 2 : Grenoble, Nice, Clermont-Ferrand, Nancy, Dijon) |

**Pourquoi `quartiers-a-eviter` est écartée (décision 2026-07-28, ne pas la re-proposer sans nouvelles données).**
`data/neighborhoods.ts` couvre les 540 villes mais à raison de **3 quartiers par ville**, et ce sont les quartiers
centraux les mieux connus. Les quartiers que les gens visent réellement en tapant cette requête n'y sont pas. Écrire
la série reviendrait donc à sourcer une réputation de quartier ailleurs que dans nos données — c'est-à-dire à
inventer des chiffres sur des lieux réels et sur les gens qui y habitent, exactement ce que la ligne éditoriale
interdit, avec un risque diffamatoire en prime. Le pendant honnête de `meilleurs-quartiers` existe déjà : la section
quartiers de `acheter-a-[ville]` et `/villes/[slug]/quartiers`, qui disent sur quel axe un quartier décroche et pour
quel profil, sans verdict global. **Condition de réouverture** : enrichir `neighborhoods.ts` à 8-12 quartiers par
ville sur une source réelle (IRIS Insee, SSMSI infracommunal) — auquel cas la série se justifie, en cadrage par
profil (« bruyant pour une famille » ≠ « mauvais »), jamais en liste noire.

Déjà couverts (skip) : `acheter-a-[ville]` (immobilier), `budget-mensuel-realiste-[ville]` (coût de la vie), `10-choses-a-faire-a-[ville]` (sortir), `quitter-[ville]` (départ), `vivre-sans-voiture-[ville]` (transports).

### Pages comparatives éditoriales

L'engine `/comparer/[a]-vs-[b]` est livré + ~300 paires SSG existent.

- ✅ **Landing `/comparer` enrichie** — 50 paires éditoriales (`POPULAR_PAIRS` dans `app/comparer/page.tsx`).
- [x] **Sitemap haut-trafic** — ✅ clos 2026-07-28. `app/sitemap.ts` et `generateStaticParams` dérivent tous deux de `SEO_PAIRS` : la couverture sitemap **est** la liste des paires, il n'y a rien à synchroniser. Reste le choix éditorial de la liste : carré top-15 fermé le 27/07, rangs 16-20 métropolitains (Grenoble, Dijon, Angers, Nîmes) croisés avec le top-11 le 28/07 → **722 paires**, top-20 × top-20 à 156/190. Les 34 restantes sont exclues volontairement (Reims / Toulon / Le Havre / Saint-Étienne face aux rangs 16-20, et tout ce qui implique Saint-Denis de La Réunion) : pas de demande de recherche. **Ne pas viser 1 225** — le top-50 × top-50 complet est majoritairement du bruit.

### Hors périmètre (nécessitent des assets ou APIs externes)

- **Photos / vidéos** : pipeline assets sous licence requis (même contrainte que guide hero images — cf. §4a audit).
- **Cartes thématiques** (écoles, hôpitaux, commerces, météo) : nécessitent APIs data.gouv.fr / IGN / OpenStreetMap Overpass — scope = projet à part entière, pas intégrable dans un build statique sans étape de pré-fetch. *Exception actée 2026-07-22 : les **parcs** passent dans le périmètre via un pipeline Overpass pré-fetché (F59, cf. ROADMAP.md « Vague 6 ») — le pattern `scripts/commune-images.mjs` (crawl caché + resumable + assets versionnés) prouve que c'est tenable en statique.*

---

## Vague 6 (2026-07-22) — parents solo, parcs, navigation départements

Demande utilisateur. Détail complet dans `ROADMAP.md` § « Vague 6 ».

- [x] **F58 — City Match « parent solo »** — 5ᵉ option de la question `stage` dans
  `lib/city-match.ts`. Pondération distincte de `family` : un seul revenu et un seul
  conducteur, donc `cost` et `transport` pèsent autant que `schools`. L'encodage du
  permalien étant positionnel, les anciens liens restent valides.
- [x] **F59 — Parcs & espaces verts par ville** — ✅ **livré 2026-07-27.**
  Pipeline OSM/Overpass → `data/city-parks.json` → `/villes/[slug]/parcs` ×540 (+ EN
  `/cities/[slug]/parks`). Objectif produit : permettre à un parent de *découvrir* des
  parcs au lieu de retourner au même. Attribution ODbL obligatoire. Spec détaillée
  dans `ROADMAP.md`.
- [x] **F60 — `/departements` trouvable** — la page listait ~102 cartes triées par score
  moyen, sans recherche : retrouver le sien demandait de scroller. Remplacé par
  `components/DepartementFinder.tsx` (grille compacte + recherche par **n°**, par nom,
  **ou par ville** — taper « Bordeaux » remonte la Gironde ; tri n° / A-Z / score).
  Les 540 liens villes restent dans le HTML statique sous un `<details>`, pour ne pas
  perdre le maillage interne.
- [x] **F61 — Vacances : profils `monoparental` et `celibataire`** — ajoutés à
  `VACATION_PROFILES` (`lib/vacation-fit.ts`), ce qui génère automatiquement
  `/vacances/profil/[profil]` FR + `/vacations/profile/[profile]` EN, les cartes des
  hubs et les options du quiz. `monoparental` pondère transport + coût au-dessus de
  `famille` (un seul adulte) ; `celibataire` privilégie la densité de vie sur le
  budget, à la différence de `solo` (voyager seul·e ≠ chercher du monde).
  ⚠️ `PROFILE_SLUGS` dans `app/sitemap.ts` était codé en dur — désormais dérivé de
  `VACATION_PROFILES` pour éviter que ça redérive.

---

