# Stratégie d'audience — mavilleideale.fr (2026-11-23)

Document de cap. Toutes les routines le lisent avant de choisir quoi faire. Les chiffres
viennent de l'export Search Console (Web, 2026-08-22 → 2026-11-21) et sont détaillés,
cible par cible, dans `docs/seo/cibles.md` (regénéré par `node scripts/gsc-cibles.mjs`).

## 1. Où on en est

| Mesure (90 jours) | Valeur |
|---|---|
| Clics | 12 372 (≈ 137/jour) |
| Impressions | 956 333 |
| CTR | 1,29 % |
| Clics par semaine | ~800 en sept. → ~1 150 depuis le 17/10 (+40 %) |
| Impressions par semaine | ~50 000 → ~110 000 (×2,2) |
| CTR hebdo | 1,7 % → 1,05 % |
| Mobile / ordinateur | 64 % des clics ; position 8,6 sur mobile contre 16,6 sur ordinateur |
| France | 92 % des clics |
| Domain Rating (Ahrefs) | **2,8** (ville-ideale.fr : 42 ; choisirsaville.fr : 10) |

La croissance d'octobre est réelle, mais elle vient surtout d'impressions profondes : on
apparaît plus souvent, plus bas, et le CTR baisse.

## 2. Ce que disent les données

1. **60 % des clics du top 1 000 requêtes sont des recherches « ville idéale ».** Ces gens
   cherchent ville-ideale.fr, un site d'avis d'habitants. L'accueil fait 15 % des clics du
   site, et ce trafic peut disparaître du jour au lendemain. Il montre aussi ce que veulent
   ces visiteurs : *des notes et des avis d'habitants* (« avis ville », « note ville »,
   « note ma ville », « bien dans ma ville »).
2. **Une requête vide gonfle les chiffres.** La requête « parcs » fait 84 000 impressions
   (9 % du total) et 0 clic. Ne jamais lire le CTR global sans l'exclure.
3. **Les gabarits qui convertissent** (CTR au-dessus de la moyenne) :
   - comparaisons `/comparer/*` (3,4 %) et guides `*-vs-*` (2,4 %, 594 clics avec 30 pages, le meilleur rendement du site) ;
   - classements (2,4 %), quartiers (2,2 %) et fiscalité (taxe foncière, 2,1 %) ;
   - `retraite-a-*` (5,8 %) ;
   - **bruit (5,9 %), coût de la vie (3,6 %) et présidentielle 2027 (3,3 %)**, qui sont en `noindex` depuis le 04/11.
4. **Ce que Google ne montre pas.** Environ 380 guides FR des séries `parent-solo-a-*`
   (201), `vacances-celibataire-*` (98) et `vacances-monoparentales-*` (83) n'ont **aucune
   page** dans le top 1 000. Chacune fait donc moins de 136 impressions en 90 jours, alors
   que ces séries mobilisaient environ une routine par jour, sans compter leurs jumelles EN.
5. **Les fiches ville sont en page 2.** Les 107 fiches visibles font 51 600 impressions en
   position 13,2. « vivre à rennes » est en position 19, « avis montpellier » en 17,
   « rennes avis » en 9. Les guides `vivre-a-*` (position 16) visent la même intention que
   la fiche, d'où un risque de cannibalisation à vérifier ville par ville.
6. **534 requêtes sont en position 4-10, avec un CTR de 0,8 %.** On est en page 1, mais en
   bas. Il manque deux leviers : l'autorité (les liens) et des titres qui donnent envie.
7. **Les petites villes touristiques ont de la traction** : Île de Ré, Amboise, Dinard,
   Dinan, Narbonne, Concarneau, Granville, Carcassonne. Le site gagne là où la concurrence
   est faible.

## 3. Ce qui manque pour une audience plus large (par ordre d'impact)

1. **De l'autorité.** Avec 7 domaines référents environ, aucune optimisation on-page ne
   fera passer de la position 8 à la position 3 sur des requêtes disputées. C'est le premier
   frein. Le levier : **des données qui méritent un lien**, c'est-à-dire des classements
   datés et repris par la presse locale (canicule, climat 2040, taxe foncière, villes les
   moins chères), avec un kit presse prêt à l'emploi. La prospection elle-même reste
   manuelle, faite par le propriétaire (voir § 6).
2. **De vrais avis d'habitants.** C'est l'intention de la moitié des visiteurs. Il faut
   rendre l'avis visible et facile à donner sur chaque fiche, l'agréger par ville en
   Schema.org `AggregateRating` seulement quand il est réel, et inviter les visiteurs à en
   laisser un.
3. **Des fiches ville qui répondent à « vivre à X » et « X avis ».** Il faut une page
   forte par ville et par intention, avec un contenu propre à la ville en haut de page :
   points forts et faibles chiffrés, quartiers, prix, avis. Fusionner ou relier
   explicitement guide `vivre-a-X` et fiche.
4. **Des titres et descriptions orientés clic** sur les pages déjà en page 1
   (`cibles.md` § 2, 4, 7).
5. **De la diffusion hors Google** :
   - agenda daté et politique 2027 à jour sur les villes avec traction, pour donner des raisons de revenir (« actualités lyon » sort déjà en position 5,5). La presse régionale reste exclue (droit voisin) ;
   - newsletter Brevo (la liste existe) ;
   - réseaux sociaux (`scripts/social-post.mjs` existe, mais les jetons de page ne sont pas configurés).
6. **Une boucle de mesure.** Chaque mois : exporter la Search Console, lancer
   `node scripts/gsc-cibles.mjs`, puis committer. Les routines ciblent ce fichier.

## 4. Règles pour toute nouvelle page

- **Preuve de demande obligatoire** : une requête dans `cibles.md`, ou une suggestion
  Google trouvée par WebSearch, citée dans le commit. Sans preuve, pas de page.
- **Priorité aux gabarits qui convertissent** : comparaison A vs B, classement
  thématique, quartiers, fiscalité, retraite, avis.
- **Priorité aux villes avec traction** (`cibles.md` § 5) avant les villes sans
  impression.
- **On arrête d'allonger les séries sans traction** (parent-solo, vacances-celibataire,
  vacances-monoparentales, biodiversité par ville). On les rouvre seulement si une page de
  la série entre dans le top 1 000 d'un export.
- **Améliorer une page existante vaut mieux qu'en créer une nouvelle**, dès qu'une page
  existante se classe en position 4-20 sur la requête.
- **Millésime 2027 depuis le 2026-11-24** (décision du propriétaire) : titres, h1 et descriptions des guides
  et des gabarits affichent 2027. Les slugs existants gardent leur `-2026` : ne jamais les renommer (historique
  Google). Un guide neuf prend 2027 dans son titre et son slug. L’année reste 2026 quand c’est un fait : municipales
  2026, lois, barèmes et fiscalité, PTZ, ZRR, DVF, palmarès mensuels, éditions d’événements, données datées
  (« chiffres 2026 », « médians 2026 »), projections « 2026 → 2040 ». Ne rien repasser en 2026.

## 5. Feuille de route

### Maintenant (semaines 1-2)
- [x] Titres et descriptions des pages en position 4-12 les plus vues (`cibles.md` § 4, 7) — 2026-11-23 (3ddb220) : fiche ville, 15 guides, 3 classements, `/classements`, `/avis`, gabarits avis-honnete et fiscalité. Suite : routine 4 du vendredi.
- [x] Bloc « En bref : vivre à X » en haut des 593 fiches (note, loyer T2, 2 axes forts et 2 faibles,
      quartiers, avis honnête, guide d'installation) — 2026-11-23. La FAQ + JSON-LD FAQPage existait déjà (`lib/city-faq.ts`).
      Suite : faits propres à chaque ville, routine 2.
- [x] Appel à l'avis en haut des 593 fiches (« Vous habitez X ? Donnez votre avis »), renvoi depuis `/avis`,
      titre de l'accueil « MaVilleIdéale : avis et notes des villes de France » — 2026-11-23.
- [x] Indexation de `bruit` et `cout-de-la-vie` rouverte en test — 2026-11-23. À mesurer sur l'export de décembre.
- [x] Cannibalisation : les 10 villes les plus vues avaient fiche + guide `vivre-a-*` au même titre. Les 49 guides
      passent en « S’installer à X en 2026 », la fiche garde « Vivre à X », liens croisés — 2026-11-23.

### Ce trimestre (décembre à février)
- [ ] Comparaisons A vs B : traiter toutes les paires demandées dans `cibles.md` § 6, puis
      les paires voisines des villes avec traction.
- [ ] Un **classement de données par mois**, pensé pour la presse :
      - un communiqué dans `/presse` ;
      - un tableau téléchargeable ;
      - une carte ;
      - les chiffres par département, pour que chaque journal local ait son angle.
- [x] Présidentielle 2027 : `/villes/[slug]/presidentielle-2027` rouverte le 2026-11-24 avec du contenu
      local (second tour 2022 par commune, écarts au national, rang département/région, voisines ;
      `lib/presidential-local.ts`). Similarité 0,87 → 0,76. À relire sur l'export de décembre.
- [ ] Liste « communes ZRR 2026 » (647 impressions, position 9,7) et « top 20 des villes
      les moins chères » (375 impressions, position 8,1) : en faire des pages dédiées et à jour.
- [ ] Jumelles EN seulement pour les pages FR qui ont de la traction.

### Plus tard (2027)
- [x] `max-image-preview:large` + `max-snippet:-1` sur tout le site — 2026-11-23. (Les images OG font déjà 1 200 px.)
- [ ] Automatiser la boucle Search Console : jeton OAuth en lecture seule, et une Action
      GitHub qui regénère `cibles.md` chaque semaine.
- [ ] Newsletter mensuelle « Le palmarès du mois » (Brevo), avec un lien de partage.

## 6. Ce que seul le propriétaire peut faire

1. **Prospection de liens** : envoyer chaque mois le kit presse (préparé par la routine du
   mardi) à 10-20 journaux locaux concernés par le classement. Viser aussi les blogs
   expatriation et retraite, et les sites des offices de tourisme des villes bien notées.
2. **Export Search Console mensuel** : Performances > 3 mois > Exporter > CSV. Ensuite,
   `node scripts/gsc-cibles.mjs <dossier>` et commit, ou donner le fichier zip à Claude.
3. **Réseaux sociaux** : créer les jetons de page Facebook, LinkedIn et Threads pour
   activer `scripts/social-post.mjs`.

## 7. Routines (4 par jour maximum, depuis le 2026-11-23)

| UTC | Routine | Rôle |
|---|---|---|
| 06:45 | mvi 1/4 Actu & agenda (Sonnet) | Politique 2027, agenda daté des villes avec traction, fraîcheur des signaux publics |
| 10:15 | mvi 2/4 Croissance SEO (Opus) | Pages en position 4-20 : titres, fiche ville « vivre à X / avis », cannibalisation, maillage, appel à l’avis |
| 14:15 | mvi 3/4 Contenu à demande prouvée (Sonnet) | 2 à 4 pages neuves avec preuve de demande : comparaisons A vs B, classements thématiques |
| 19:15 | mvi 4/4 Rotation (Sonnet) | Lun EN utile · Mar kit presse · Mer/Sam design · Jeu intégrité · Ven CTR · Dim palmarès + bilan |

Journal commun : `docs/seo/journal.md`. Le digest quotidien (07:30, Haiku) vérifie ces 4 créneaux.
Routines mises en pause le 2026-11-23 (réactivables) : series-villes, actu-politique, agenda-sport,
actu-locale, parite-en, design-mavilleideale, extension-villes, vacances-celibataire, vacances-monoparental,
parent-solo, biodiversite, maillage-interne, narration-rework, integrite-donnees.

## 8. Indicateurs (à relire à chaque export)

| Indicateur | Aujourd'hui | Cible 3 mois |
|---|---|---|
| Clics/semaine hors « ville idéale » | ≈ 1 000 | 1 600 |
| CTR hors « parcs » | ≈ 1,4 % | 2,0 % |
| Requêtes hors marque en position ≤ 3 (top 1 000) | 66 | 150 |
| Domaines référents | ≈ 7 | 25 |
| Fiches ville en position ≤ 10 | 0 sur le top 20 des villes | 10 |
