# Journal du maillage interne

Une ligne par run de l'agent de maillage. Format :
`- YYYY-MM-DD app/chemin/de/la/page-cible.tsx (N liens ajoutés)`

- 2026-07-05 app/red-flags/villes-embouteillages-quotidiens/page.tsx (5 liens ajoutés)
- 2026-07-07 app/comparer-departements/page.tsx (5 liens ajoutés)
- 2026-07-09 app/red-flags/villes-erosion-cotiere/page.tsx (5 liens ajoutés)
- 2026-07-12 app/red-flags/villes-manque-de-verdure/page.tsx (5 liens ajoutés)
- 2026-07-14 app/red-flags/villes-logement-introuvable/page.tsx (5 liens ajoutés)
- 2026-07-16 app/red-flags/villes-parking-cauchemar/page.tsx (5 liens ajoutés)
- 2026-07-19 app/pour-qui/sensibles-au-bruit (5 liens ajoutés)
- 2026-07-21 app/red-flags/villes-chauffage-hivernal-couteux/page.tsx (5 liens ajoutés)
- 2026-07-23 app/red-flags/villes-belles-invivables-ete/page.tsx (5 liens ajoutés)
- 2026-07-26 app/red-flags/villes-manque-de-creches/page.tsx (5 liens ajoutés)
- 2026-07-28 app/parent-solo/page.tsx (5 liens ajoutés)
- 2026-07-30 app/villes-qui-grandissent/page.tsx (5 liens ajoutés)
- 2026-08-02 app/red-flags/villes-pauvrete-elevee/page.tsx (5 liens ajoutés)
- 2026-08-04 app/avis/page.tsx (5 liens ajoutés)
- 2026-08-06 app/guides/categorie/[categorie]/page.tsx (6 liens ajoutés — un par thématique)
- 2026-08-09 app/[locale]/reviews/page.tsx (5 liens ajoutés — jumelle EN de /avis, footer seul en entrant)
- 2026-08-11 app/expat-retour/page.tsx (5 liens ajoutés — hub 19 pays, footer seul en entrant contextuel)
- 2026-08-13 app/parcs/page.tsx (5 liens ajoutés — hub F59, Navbar seule en entrant depuis le 27/07)
- 2026-08-16 app/vivre-avec/page.tsx (6 liens ajoutés — hub + 6 tranches de salaire dans le sitemap mais zéro entrant sur tout le site FR : ni Navbar, ni Footer, ni /sommaire, ni /outils)
- 2026-08-18 app/red-flags/villes-qui-se-vident/page.tsx (5 liens ajoutés — thème du 12/08, aucun entrant contextuel : seule la grille générée de /red-flags y menait, quand son pendant /villes-qui-grandissent en compte 6)
- 2026-08-23 app/classements/sans-voiture/page.tsx (5 liens ajoutés — les 10 classements `lib/owner-rankings.ts` forment une clique fermée : ils ne se lient qu'entre eux, le hub `/classements` ne liste que `RANKING_META` et `/sommaire` non plus ; 5 d'entre eux avaient zéro entrant hors clique. Sources : `/velo`, `/villes/[slug]/velo`, `/villes/[slug]/transports`, `/pour-qui/[profil]` (sans-voiture, cyclistes-urbains, etudiants, jeunes-diplomes) et `/classements/[slug]` (mobilite, cyclistes). Au passage : le bouton de `/villes/[slug]/transports` s'intitulait « Classement sans voiture » mais pointait vers `/classements/mobilite` — libellé remis en face de sa destination, le lien vers le vrai classement est ajouté à côté. Restent orphelins hors clique : `securite-femme-seule`, `lien-social`, `jeune-actif`, `famille-proprietaire`.)
