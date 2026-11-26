# Audit concurrence et audience — 2026-11-26

Session manuelle (propriétaire + Claude). Demande : « analyser le site et la concurrence, trouver les
fonctionnalités ou contenus qui manquent pour gagner de l'audience et fidéliser, trouver des canaux hors
du site (vidéos courtes, articles, presse), et mettre en œuvre ». Plan d'action hors site :
`docs/seo/distribution-hors-site.md`. Cap général : `docs/seo/strategie-audience.md`.

## 1. Où en est le site (mesuré le 2026-11-26)

| Mesure | Valeur | Source |
|---|---|---|
| Clics Google, 90 j | 12 372 (≈ 137/jour), dont 60 % du top 1 000 sur « ville idéale » | `cibles.md` |
| Domain Rating | 2,8 (ville-ideale.fr 42, choisirsaville.fr 10) | Ahrefs |
| Avis d'habitants publiés | **20 pour 593 villes**, 15 villes en ont au moins un, le plus récent date du 27/10 | `/api/comments`, 593 villes |
| Abonnés newsletter Brevo | liste FR : 1, liste EN : 1 ; une lettre part chaque semaine | API Brevo |
| Réseaux | un post FB + IG par semaine (`social-weekly`), aucune vidéo, pas de TikTok ni YouTube | dépôt |
| Déploiement | vert, 2 fois par jour | `gh run list` |

Lecture : le site a le contenu (593 fiches, 1 700+ guides, 19 classements) mais ni la communauté
(avis), ni l'audience propre (newsletter, réseaux), ni l'autorité (liens). Ce sont les trois choses que
les concurrents ont et que nous n'avons pas.

## 2. Concurrents

| Site | Modèle | Ce qui marche chez eux | Ce qui nous manque |
|---|---|---|---|
| ville-ideale.fr | Avis d'habitants notés sur 10 par critère, modérés, toutes communes | La marque : la majorité de nos clics « ville idéale » cherchent ce site | Volume d'avis |
| bien-dans-ma-ville.fr | Notes /5 sur 5 critères + données publiques | 3 M visiteurs/an et 80 000 avis (leur communiqué de février 2025) ; classement par département, « pires villes », comparateur de 5 villes, signalements envoyés aux mairies, carte des ventes ; ils publient des communiqués | Avis en un geste, classements des habitants par département |
| villesavivre.fr | Avis (classé à partir de 3) | Classements par taille : grandes, moyennes, petites villes | Classement par taille (« ville moyenne », 263 impr., pos. 10,9) |
| Villes et villages où il fait bon vivre (association) | Palmarès annuel : 34 727 communes, 197 critères, pondérés par un sondage OpinionWay | Rendez-vous annuel repris par toute la presse ; SeLoger seul en a fait plus de dix articles, déclinés par département (« Gironde : ces 10 villes… ») | Un palmarès annuel daté, avec un angle par département |
| choisirsaville.fr | Comparateur de données publiques + carte | Organisation sur data.gouv.fr avec un jeu de 34 746 communes (lien et visibilité auprès des réutilisateurs) | Présence sur data.gouv.fr |
| habity.fr | 16 classements par critère, toutes communes mesurables | DVF+, revenus, fibre, politique | — (nous couvrons ces axes) |
| SeLoger (rubrique Villes, quiz avec Nextories) | Média immobilier | Reprend tous les palmarès et les décline par département | — (cible presse, pas concurrent à copier) |

Nos avantages réels : une méthode publiée et des notes sur 8 axes, les comparaisons A vs B (meilleur CTR
du site), les guides, la politique (présidentielle 2027 par commune), le site anglais jumeau, les
sous-pages par ville. Notre seul vrai retard de contenu est la couverture (593 villes contre ~35 000
communes) : on ne la comble pas avec des pages minces (règle de `lib/fr-index-policy.ts`).

## 3. Ce qui manquait, et ce qui a été fait

| Manque | Fait le 2026-11-26 | Commit |
|---|---|---|
| Donner son avis coûtait un formulaire complet (prénom, email, message) : 20 avis en tout | **Note rapide des habitants** sur les 593 fiches : un tap, la relation à la ville, 4 sous-critères facultatifs, sans compte ni email. Moyenne affichée à partir de 3 votes. Après la note : avis écrit, partage « demander à vos voisins », alertes | `5ea34c7` |
| Les 102 pages département titraient « Meilleures villes X 2026 » ; les requêtes « où vivre en loire-atlantique » / « en bretagne » sortent en position 33-37 | Titres et h1 « Où vivre en Gironde ? », prépositions correctes (dans le Nord, dans l'Ain, à Paris), millésime 2027 ; régions aussi | `b4775d4` |
| Les CSV « classement complet » de /presse et /press s'arrêtaient à 540 villes (fichiers du 9 octobre) | Régénérés à 593 villes | `dc0606d` |
| Aucune vidéo, alors que la recherche de villes se fait aussi sur TikTok et YouTube | **Générateur de vidéos courtes** (duel, ville en chiffres, top 5 régional), 6 premières vidéos dans `E:\mavilleideal\shorts\2026-11-26\` avec leurs légendes, workflow hebdomadaire `shorts-weekly` (lundi, artefact, rien n'est publié tout seul) | `6c23ec4` |
| Pas de présence data.gouv.fr ni de plan hors site | Kit data.gouv.fr (jeu de données + réutilisations prêtes à coller), liste presse par angle, modèles de pitch, routine hebdomadaire du propriétaire | `docs/seo/distribution-hors-site.md` |

## 4. Ce qui reste (par ordre d'impact)

1. **Publier les vidéos** (propriétaire, 30 min/semaine) : créer TikTok et YouTube, poster les 6 premières.
2. **data.gouv.fr** (propriétaire, 30 min une fois) : organisation, jeu de données, réutilisations. Premier
   lien d'autorité haute du site.
3. **Palmarès annuel de janvier 2027** pensé pour la presse, décliné par département (CSV + un paragraphe
   par département), publié mi-janvier : c'est le moment où toute la presse locale reprend « Villes et
   villages où il fait bon vivre ». Routine 4 du mardi.
4. **Afficher la note des habitants en HTML statique** dès qu'il y a des votes : instantané
   `/api/ratings/summary` → `data/city-ratings.json` dans le data-runner, rendu dans la fiche (et la FAQ
   « Quel est l'avis des habitants sur X ? »). Puis un classement des villes notées par leurs habitants
   (seuil 10 votes, comme bien-dans-ma-ville).
5. **Newsletter** : 1 abonné. Vérifier d'abord que l'email de confirmation arrive (double opt-in via Brevo
   depuis le Worker), puis proposer l'inscription au bon moment : après une note, après le quiz, en fin de
   comparaison (« recevoir le palmarès du mois »).
6. **Classements par taille de ville** (grandes, moyennes, petites) : demande prouvée (« ville moyenne »
   263 impr., « petites villes les moins chères » 180).
7. **Pinterest** (plus tard) : flux RSS d'épingles verticales ; le moteur de `shorts-video.ts` sait déjà
   produire l'image.

## 5. Notes de méthode

- Avis : comptés en interrogeant `/api/comments?topic=city:<slug>` pour les 593 villes. D1 n'est pas
  lisible depuis ce poste (jetons Cloudflare sans droit D1, erreur 7403).
- Concurrents : recherches web du 2026-11-26 (palmarès 2026, pages de classement, communiqué
  bien-dans-ma-ville, page data.gouv.fr de choisirsaville). Chiffres de trafic des concurrents = leurs
  propres déclarations, non vérifiées.
- `npm run integrity` échoue sur Windows au contrôle `air-light` : faux positif CRLF (contenu identique
  une fois les fins de ligne normalisées), comme `search-index:check`. Vert sous Linux.
