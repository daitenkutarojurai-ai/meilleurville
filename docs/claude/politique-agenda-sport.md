# Politique, agenda daté et sport

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Sections d'origine conservées mot pour mot.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


## Politique, présidentielle 2027 et fil d'actualité (2026-10-17)

- **Hub `/presidentielle-2027`** (FR seul) : compte à rebours + calendrier (`components/ElectionCountdown.tsx`), suivi des sondages (`components/PollTracker.tsx` : fourchette min-max + moyenne, tableau en vue accessible), candidats (badge « officialisée » seulement si une entrée sourcée du fil l'atteste), carte en relief, projection des villes de plus de 100 000 hab., fil d'actu, FAQ JSON-LD.
- **`/villes/[slug]/presidentielle-2027`** (+ jumelle EN `/cities/[slug]/2027-election`) : une page par ville ayant un résultat 2022 — projection, vote réel 2022, écart au national, villes au vote le plus proche, partage. Liée depuis la carte politique de `CityProfile`.
- **`components/PoliticalMap.tsx`** : vue « Relief » (projection oblique, une colonne par ville, hauteur = score au-dessus d'un plancher de 20 %, ou part d'une famille isolée), rendue **côté client seulement** après montage pour ne pas alourdir le HTML ; la vue Plan reste le rendu serveur sans JS. Bascule 2027 (projection) / 2022 (résultat).
- **`data/political-news.ts`** : fil daté et sourcé, tenu par la routine `meilleurville-actu-politique`. Importé côté client (compte à rebours), donc **aucun import** dans ce fichier ; ses gardes vivent dans `npm run integrity` (garde `politique` : ids uniques, dates lisibles et non futures, source http, slugs de ville connus). Résumer avec nos mots, jamais recopier un article (droit voisin).
- **`components/ReportCTA.tsx`** : boutons « Signaler un événement / un point noir / corriger une info / une actu politique », qui ouvrent `/contact?topic=…&ville=…` avec un gabarit pré-rempli (`lib/contact-prefill.ts`). Sujets `evenement` et `politique` ajoutés à l'enum du worker. Présent sur toutes les sous-pages ville (via `DiscussionCTA`), l'agenda, les Red Flags et les pages politiques.
- `/red-flags` : vignettes d'abord, texte de lecture en fin de page (« Pour aller plus loin »), à la demande du propriétaire.

## Agenda daté par ville (`data/city-events.ts`, 2026-10-16)

`/villes/[slug]/agenda` (EN `/cities/[slug]/calendar`) opens with an « À venir » block
(`components/CityEvents.tsx`, schema.org `Event` JSON-LD) fed by `data/city-events.ts`: REAL
dated events only, each with a readable `source` — either sent by the organiser through the
contact form, or published by the city / organiser on an official site. Never invent or
estimate a date. Each event's `id` is its anchor (`/villes/orleans/agenda#<id>`) and is the link
we send back to organisers, so never rename one. Past events drop off at the next build.
`npm run integrity` checks city slugs, unique ids and dates. The month-by-month block below it is
still the derived, indicative `lib/city-agenda.ts`.

## Sport : salles, street workout, CrossFit, escalade + agenda sportif (2026-10-22)

Demande du propriétaire. Deux briques, rendues par `components/SportSpots.tsx` (serveur, zéro JS) sur
`/villes/[slug]/sport` et EN `/cities/[slug]/sports-leisure` :
- **Où s'entraîner** : `data/city-sport-spots.json`, produit par `scripts/city-sport-spots.mjs`
  (`npm run sport-spots`, `:stats`) depuis OpenStreetMap / Overpass, lu par `lib/sport-spots.ts` (serveur
  uniquement). Quatre catégories : salles (`leisure=fitness_centre`), street workout (`leisure=fitness_station`,
  agrès regroupés à 80 m en un spot), CrossFit (`sport=crossfit` **ou** nom « CrossFit / cross training »,
  car le tag est rare), escalade. Les comptes sont complets, la liste est plafonnée aux plus proches du centre.
  C'est ce qui est **cartographié**, pas un annuaire : la surface le dit, et porte l'attribution ODbL.
  ⚠️ Deux garde-fous à ne pas retirer : un `remark` d'expiration Overpass est une erreur (Marseille est
  d'abord sortie à 0), et une ville de 20 000 habitants ou plus à 0 lieu n'est **pas** écrite (Lyon à 0 sur un
  miroir saturé, 89 salles en réalité). La collecte tourne dans `scripts/local-data-runner.sh` (120 villes
  par passe, GitHub Actions) jusqu'à couvrir le seed.
- **Prochains rendez-vous sportifs** : `kind: "sport"` dans `data/city-events.ts` (même règles que l'agenda :
  date réelle, source lisible, rien d'estimé), JSON-LD `SportsEvent`, badge « Sport » sur la page agenda.
  Alimenté par la routine `meilleurville-agenda-sport`. Un horaire de coup d'envoi ne s'écrit que publié par la
  ligue ou le club ; sinon date seule.

