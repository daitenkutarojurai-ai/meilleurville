# Distribution hors site — plan d'action (2026-11-26)

But : faire venir des visiteurs qui ne passent pas par Google, et gagner les liens qui manquent
(Domain Rating 2,8, environ 7 domaines référents). Constat et concurrents :
`docs/audits/2026-11-26-concurrence-audience.md`. Ce fichier dit **qui fait quoi et quand**.

Règles : le propriétaire publie et envoie lui-même (les routines préparent, elles n'envoient rien) ;
chaque chiffre diffusé est celui que la page liée affiche ; jamais de lien acheté ni d'échange de liens ;
la presse régionale reste **exclue comme source** de contenu (droit voisin), mais on peut lui **proposer**
nos données.

## 1. La routine du propriétaire (≈ 1 h par semaine)

| Jour | Action | Temps |
|---|---|---|
| Lundi | Télécharger l'artefact `shorts` du workflow `shorts-weekly` (GitHub > Actions). Poster les 3 vidéos sur TikTok, YouTube Shorts et Instagram Reels avec la légende du `.txt`, en ajoutant un son tendance dans l'appli | 25 min |
| Mardi | Le kit presse de la routine 4 (`docs/seo/kits-presse/`) : l'envoyer à 10 rédactions (§ 4) | 20 min |
| Mercredi | Répondre à 2 demandes de journalistes (§ 5) | 10 min |
| Vendredi | Un post LinkedIn ou Bluesky avec un chiffre de la semaine et son lien (§ 6) | 5 min |
| 1er du mois | Export Search Console (déjà prévu) + une réutilisation data.gouv.fr si une nouvelle page de données est sortie (§ 3) | 15 min |

## 2. Vidéos courtes : TikTok, YouTube Shorts, Reels

**Pourquoi** : la recherche de « vivre à X », « X ou Y » et « où vivre en … » se fait aussi en vidéo, et
aucun concurrent direct (ville-ideale, bien-dans-ma-ville, choisirsaville) ne publie de vidéos de données.
Une vidéo de 15 à 19 secondes par sujet, avec un chiffre par plan, est le format qui circule.

**En place depuis le 2026-11-26** :
- `scripts/shorts-video.ts` : 4 formats (duel A vs B, top N d'un des 19 classements, ville en 5 chiffres, top N
  d'une région), voix off française (Google Cloud TTS `GOOGLE_TTS_API_KEY`, sinon Azure `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`,
  sinon OpenAI `OPENAI_API_KEY` ; chiffres écrits en toutes lettres, clip jamais retouché ; `--texte` affiche ce que
  la voix lit), musique originale synthétisée
  (`scripts/shorts-audio.ts`), sous-titres incrustés + `.srt`. Calendrier : un créneau le lundi, mercredi,
  vendredi et dimanche (`--plan` pour le voir).
- **Facebook + Instagram : automatique.** Workflow `shorts-publish` (17h UTC les jours de créneau) : rend la vidéo
  du jour et la publie en Reel (`scripts/shorts-publish.ts`, jeton de page de `social-weekly`, expire le 2027-01-24).
  À la main : `gh workflow run shorts-publish.yml -f mode=check|dry-run|publish [-f slot=AAAA-MM-JJ]`.
- **YouTube : programmé à l'avance.** `shorts-weekly` rend un lot (`-f from=AAAA-MM-JJ -f count=12`) ; les vidéos
  sont envoyées et programmées (18h, date du créneau) depuis une fenêtre Chrome dédiée (profil
  `E:\mavilleideal\.yt-chrome-profile`, port 9333, connectée à la chaîne MaVilleIdeal) par un script puppeteer.
  L'API YouTube n'est pas utilisée : un projet non audité ne peut publier qu'en privé. Outils hors dépôt :
  `E:\mavilleideal\tools\start-youtube-chrome.cmd` (ouvre la fenêtre) puis
  `node E:\mavilleideal\tools\yt-upload.mjs <dossier du lot>` (créneau du jour = public, les autres programmés ;
  `youtube.json` dans le dossier garde les liens et évite les doublons si on relance). Lot 1 : 12 vidéos du
  26/11 au 14/12, dossier `E:\mavilleideal\shorts\2026-11-26-voix\` (ancienne voix, laissées telles quelles à la
  demande du propriétaire). Lot 2 : 12 vidéos du 16/12 au 04/01, dossier `E:\mavilleideal\shorts\2026-12-16-lot2\`.
  Prochain lot à rendre vers le 31/12 (`gh workflow run shorts-weekly.yml -f from=2027-01-06 -f count=12`).
- **Mail après chaque publication (2026-11-27)** : étape « Mail de confirmation » de `shorts-publish`
  (`scripts/shorts-notify.ts`, Brevo, secrets `BREVO_API_KEY` + `NOTIFY_EMAIL`) : lien Facebook, Instagram et
  YouTube (vidéo du créneau publique ? oEmbed : 200 = en ligne), ou ce qui a échoué. À 5 vidéos YouTube programmées
  ou moins, l'objet le signale et le mail donne la commande du lot suivant. Le stock vient de
  `scripts/shorts-youtube.json` (créneau → vidéo), que `yt-upload.mjs` complète à chaque envoi : **le commiter après
  chaque lot**, sinon le mail croit le stock épuisé. Essai : `gh workflow run shorts-publish.yml -f mode=notify-test`.
- **Début et fin (2026-11-27)** : la voix part à 0,1 s sur une question parlée (« Où bien vivre sans se ruiner ? »),
  pas sur le titre de la page ; la vidéo finit sur le n° 1 ou le verdict puis « Dites-le en commentaire », jamais
  sur une publicité pour le site (pas de lien cliquable dans un Short, et la fin publicitaire fait décrocher juste
  avant la fin). L'adresse reste en haut de l'écran, en petit sur la carte de fin et dans la légende.
- TikTok : à la main, avec la légende « TikTok » du `.txt` (pas d'API de publication ouverte).

**Mise en place (une fois, propriétaire)** :
1. Compte TikTok **professionnel** `@mavilleideale` (le lien cliquable dans la bio n'existe qu'en compte pro,
   ou au-delà de 1 000 abonnés). Bio : « Où vivre en France ? 593 villes notées sur 8 critères » + lien
   `https://www.mavilleideale.fr/?utm_source=tiktok&utm_medium=bio`.
2. Chaîne YouTube « MaVilleIdéale ». Les Shorts y sont aussi trouvés par la recherche YouTube et Google
   (onglet Vidéos). Lien de chaîne : `?utm_source=youtube&utm_medium=bio`.
3. Instagram `@mavilleideal` existe déjà (post hebdomadaire). Y ajouter les Reels ; partager chacun en story.

**Publication** : ajouter un son tendance dans l'appli (la piste est muette) ; épingler en commentaire
« Le détail : mavilleideale.fr/… » ; publier entre 12 h et 13 h ou entre 18 h et 21 h. Répondre aux
commentaires « et ma ville ? » par une vidéo-réponse : c'est un sujet de plus, déjà produit par le script
(`--ville <slug>`).

**À mesurer** (fin janvier) : vues moyennes par format, clics `utm_source=tiktok|youtube|instagram` dans
GA4. On garde le format qui dépasse 1 000 vues de moyenne et on arrête les autres.

Produire une vidéo à la demande :
```bash
npx tsx --tsconfig tsconfig.json scripts/shorts-video.ts --duel colmar,strasbourg --ville dinard --top5 region:centre-val-de-loire --out ../shorts/AAAA-MM-JJ
```

## 3. data.gouv.fr : un lien d'autorité et les réutilisateurs de données

**Pourquoi** : choisirsaville.fr (DR 10) a une organisation et un jeu de données sur data.gouv.fr. Chaque
réutilisation déclarée apparaît sur la page du jeu source (DVF : 328 réutilisations listées), avec un lien
vers la page qui réutilise. C'est le lien le plus facile à obtenir sur un domaine de cette autorité, et il
est vu par les journalistes de données et les collectivités.

**À faire par le propriétaire (30 min)** : créer un compte, puis une organisation « MaVilleIdéale » (le
guide officiel conseille l'organisation plutôt que le compte personnel pour un projet).

### 3.1 Jeu de données à publier

- **Titre** : Indicateurs de qualité de vie de 593 villes françaises (MaVilleIdéale)
- **Description** : « Note globale et 8 notes par axe (qualité de vie, sécurité, coût de la vie, transports,
  nature, culture, écoles, télétravail) pour 593 villes de France métropolitaine et d'outre-mer, avec
  population et lien vers la fiche de chaque ville. Les notes combinent des données publiques (Insee, DVF,
  SSMSI, Arcep, Éducation nationale…) et une calibration éditoriale décrite sur
  https://www.mavilleideale.fr/methode. Loyers : estimations T1, T2, T3 et prix d'achat au m² calés sur les
  observatoires locaux des loyers (ce ne sont pas des médianes de transactions). »
- **Ressources** (URL distantes, mises à jour par le dépôt) :
  - `https://www.mavilleideale.fr/presse/classement-mavilleideale-2026.csv` (notes, 593 villes)
  - `https://www.mavilleideale.fr/presse/loyers-villes-mavilleideale-2026.csv` (loyers et prix au m²)
  - `https://www.mavilleideale.fr/presse/loyers-par-departement-mavilleideale-2026.csv` (102 départements)
- **Mots-clés** : qualité de vie, villes, communes, loyers, logement, classement, déménagement
- **Couverture** : France, granularité commune ; fréquence : mensuelle ; période : 2026.
- **Licence : décision du propriétaire.** data.gouv.fr recommande la Licence Ouverte 2.0 (reprise libre, y
  compris commerciale, avec attribution). La page /presse dit aujourd'hui « réutilisables dans un cadre
  journalistique ou institutionnel ». Si la Licence Ouverte est choisie, aligner la phrase de /presse.

### 3.2 Réutilisations à déclarer (données réellement utilisées, vérifié dans le code)

| Réutilisation | URL à déclarer | Jeux de données à rattacher | Type |
|---|---|---|---|
| Prix réels au m² par ville, appartements et maisons | `https://www.mavilleideale.fr/villes/bordeaux/logement` (une fiche par ville ; le palmarès « prix réels des appartements » sort le 2 janvier 2027 et sera une meilleure URL) | Demandes de valeurs foncières géolocalisées (`data.gouv.fr/datasets/demandes-de-valeurs-foncieres-geolocalisees`) | Visualisation |
| Présidentielle 2027 : projection et second tour 2022 par commune | `https://www.mavilleideale.fr/presidentielle-2027` | Présidentielle 2022, résultats définitifs du 1er tour et du 2nd tour (ministère de l'Intérieur) | Visualisation |
| Orientation politique des villes | `https://www.mavilleideale.fr/orientation-politique` | Présidentielle 2022, 1er tour | Visualisation |
| Classement sécurité des villes | `https://www.mavilleideale.fr/securite` | Bases statistiques communale, départementale et régionale de la délinquance (SSMSI) — **uniquement si** le propriétaire confirme que la calibration de l'axe sécurité vient de ce fichier | Visualisation |

Texte type d'une réutilisation : « Pour chacune des 593 villes suivies, MaVilleIdéale calcule [ce qui est
montré] à partir de [jeu de données]. La page donne le chiffre de la ville, sa position dans le
département et la comparaison avec les villes voisines. » Joindre une capture de la page.

Ne pas déclarer Géorisques ni Arcep : le site n'utilise pas ces fichiers aujourd'hui (risques déduits des
caractéristiques de la ville, lien sortant vers Géorisques).

## 4. Presse : proposer nos données

**Ce qui marche** (voir le palmarès « Villes et villages où il fait bon vivre ») : un classement daté, un
tableau téléchargeable, et un angle local par département. SeLoger seul en a tiré une dizaine d’articles en
2026, dont des déclinaisons « Gironde : ces 10 villes… ». Les kits de la routine 4 suivent ce modèle.

**Calendrier** :
- Maintenant : kit « loyers, villes les moins chères » (`kits-presse/2026-11-24-…`), pas encore envoyé.
- Mi-janvier 2027 : **palmarès annuel 2027 décliné par département**, au moment où la presse locale reprend
  le palmarès de l'association. C'est le kit à soigner (routine 4 du mardi, à préparer dès le 15 décembre).
- Février 2027 : « la note des habitants » si au moins 30 villes ont 10 votes ou plus.

**Cibles par angle** (contact « rédaction web », « service société » ou « immobilier » sur le site de
chaque média ; pas d'adresse personnelle dans le dépôt) :

| Angle | Médias |
|---|---|
| Classement national, loyers, qualité de vie | Le Parisien (conso), 20 Minutes, Ouest-France (rubrique France), franceinfo, BFM Immo, Capital, Le Figaro Immobilier, SeLoger (rubrique Villes), Le Bonbon |
| Angle département ou ville | Le réseau actu.fr (un site par ville ou pays), France Bleu locales, hebdomadaires locaux, quotidiens régionaux (Sud Ouest, La Dépêche, Le Télégramme, La Voix du Nord, Le Progrès, L'Est Républicain, Midi Libre, Nice-Matin, La Montagne, DNA) |
| Retraite | Notre Temps, Pleine Vie, Capital retraite, blogs retraite |
| Étudiants | L'Etudiant, Studyrama, associations étudiantes |
| Télétravail, mobilité | Welcome to the Jungle, Courrier Cadres, newsletters télétravail |
| Données | Les Décodeurs (Le Monde), rubriques data des quotidiens, journalistes data sur Bluesky |

**Modèle de mail** (à adapter, 120 mots au plus, sans pièce jointe) :

> Objet : [Votre département] : la ville la moins chère pour un T2 est [Ville] ([loyer] €)
>
> Bonjour,
>
> MaVilleIdéale compare 593 villes françaises sur 8 critères à partir de données publiques. Dans [votre
> département], [Ville] est la ville la moins chère pour un T2 ([loyer] € par mois), contre [loyer médian]
> € en médiane départementale et [loyer] € à [chef-lieu].
>
> Le tableau complet (102 départements, CSV libre de reprise) et la méthode : https://www.mavilleideale.fr/presse
>
> Je peux vous envoyer les chiffres d'une autre ville du département dans la journée.
>
> [Prénom Nom], MaVilleIdéale

Relance une seule fois, 4 jours après. Noter chaque envoi et chaque reprise dans `docs/outreach-log.md`.

## 5. Demandes de journalistes

- **Site anglais (bestcitiesinfrance.com)** : profils gratuits sur Qwoted et Source of Sources (SOS), puis
  Featured. Thèmes : « moving to France, cost of living in French cities, best French cities for expats /
  retirees / remote workers ». Biographie : « Founder of BestCitiesInFrance, which scores 593 French cities
  on 8 criteria from public data (INSEE, crime statistics, rents, broadband). » Ce sont les liens qui
  manquent le plus au site anglais (1 clic en 90 jours).
- **Site français** : pas d'équivalent établi trouvé. Surveiller « appel à témoins », « je cherche un expert »
  et #JournoRequest sur LinkedIn, X et Bluesky avec les mots « ville », « déménager », « loyer ».

## 6. Réseaux du propriétaire : LinkedIn et Bluesky

Un chiffre par semaine, une image (la vidéo ou une capture de la page), un lien. Les journalistes de
données sont nombreux sur Bluesky depuis 2024. Exemples prêts : « 62 villes ont un T2 à 500 € ou moins »
(kit loyers), « Metz ou Nancy : 6,0 contre 6,2 » (vidéo duel). Paramètre `?utm_source=linkedin` ou
`?utm_source=bluesky` sur chaque lien.

## 7. Communautés (à la main, avec les règles de chaque lieu)

Reddit (r/france, r/AskFrance, r/vosfinances, r/expats, r/IWantOut), groupes Facebook « Quitter Paris »,
forums d'expatriés. Répondre à une question précise avec le chiffre et la page qui y répond, jamais de lien
seul. Une réponse utile par semaine suffit ; Reddit bannit l'autopromotion visible.

## 8. Fidéliser : faire revenir

- **Note des habitants** (livrée le 2026-11-26) : chaque note propose de partager la fiche à ses voisins et
  de s'abonner aux alertes de la ville. Les vidéos « ville en 5 chiffres » renvoient vers la note.
- **Newsletter** : 1 abonné confirmé sur la liste FR. D'abord vérifier que l'email de confirmation arrive
  (s'inscrire avec une adresse de test sur le site). Ensuite, proposer l'inscription au bon moment : après une
  note, en fin de quiz, en fin de comparaison, avec une promesse précise (« le palmarès du mois, une fois par
  mois »).
- **Alertes par ville** (existent) : à mettre en avant dans les vidéos « ville » quand l'agenda de la ville
  est rempli.

## 9. Plus tard

- **Pinterest** : compte professionnel, site revendiqué, flux RSS d'épingles verticales (jusqu'à 200 épingles
  par jour). Les guides n'ont pas d'image propre (ils partagent l'image OG du site) : il faut d'abord des
  visuels 1000×1500, que le moteur de `shorts-video.ts` peut produire.
- **Publication automatique des Reels** (Instagram et Facebook, jeton déjà utilisé par `social-weekly`) :
  seulement après validation du format par le propriétaire.
