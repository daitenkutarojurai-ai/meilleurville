# Kit presse — Loyers : les villes les moins chères de France (2026-11-24)

À envoyer par le propriétaire. Aucune adresse personnelle dans ce fichier : chercher le contact « rédaction web / service société » sur le site de chaque média.
Demande de départ : requêtes « top 20 des villes les moins chères de france » (375 impr., pos. 8,1) et « petites villes les moins chères de france » (`cibles.md`).

## Communiqué (version courte)

**Un T2 à 390 € à Mauriac, 1 800 € à Paris : les loyers varient de 1 à 4,6 selon la ville**

- Sur 593 villes suivies, le loyer médian d'un T2 est de 710 € par mois. 62 villes sont à 500 € ou moins, 91 à 1 000 € ou plus.
- Les T2 les moins chers : Mauriac (Cantal) et La Souterraine (Creuse) à 390 €, Bellac (Haute-Vienne) à 400 €, Commercy (Meuse) et Le Blanc (Indre) à 420 €.
- Parmi les villes de plus de 50 000 habitants, Calais et Saint-Quentin sont les moins chères (480 €), devant Laval (490 €).

Méthode : repères de loyer T1/T2/T3 établis par MaVilleIdéale, calés sur les observatoires locaux des loyers. Ce sont des estimations, pas des médianes de transactions ni des annonces. Chaque ville garde sa note globale (8 critères) : un loyer bas ne signifie pas une meilleure qualité de vie.

Citation possible : « Le loyer ne fait pas la ville, mais l'écart est assez grand pour changer un projet de déménagement : c'est pour ça que chaque ville a sa fiche chiffrée. »

Données : page `/presse` (section « Communiqué »), CSV par ville `/presse/loyers-villes-mavilleideale-2026.csv`, synthèse par département `/presse/loyers-par-departement-mavilleideale-2026.csv` (102 départements : ville la moins chère, la plus chère, médiane). Classement détaillé : `/guides/villes-france-moins-cheres-2026-top-10`.
Régénération : `npx tsx scripts/export-presse-loyers.ts`.

## Angle local par département

Le CSV départemental donne à chaque journal son titre : « X, la ville la moins chère du département », avec l'écart au chef-lieu. Proposer à chaque rédaction ses chiffres en répondant sous 24 h (contact `/presse`).

## Cibles (types de médias et sites)

1. Presse quotidienne régionale du Limousin et du Massif central (Cantal, Creuse, Haute-Vienne, Corrèze) : leurs villes ouvrent le classement.
2. PQR du Grand Est et du Centre (Meuse, Indre, Haute-Marne) : même raison.
3. PQR du Nord (Calais, Saint-Quentin, Cambrai) : angle « grandes villes abordables ».
4. Hebdomadaires locaux des départements cités : reprennent volontiers un classement où leur commune figure.
5. Radios locales et France Bleu locales : format « chiffre du jour ».
6. Blogs de retraite : budget logement = première variable d'un départ.
7. Blogs d'expatriation et de retour en France : comparaison avec Paris et les grandes métropoles.
8. Sites de télétravail et nomadisme : arbitrage loyer / connexion (Arcep).
9. Blogs d'investissement locatif : rendement, lien avec le prix au m² du CSV.
10. Offices de tourisme et mairies des villes bien classées : relais sur leur site « s'installer ici ».
11. Agences de développement économique et services attractivité des départements : veulent des arguments de ré-installation.
12. Associations étudiantes et sites de logement étudiant : le T1 est dans le CSV.
13. Newsletters budget et finances perso : « où vivre avec un petit budget ».
14. Forums et groupes d'habitants (Reddit r/vosfinances, groupes Facebook « Je quitte Paris ») : à poster à la main, en respectant les règles de chaque groupe.
15. Journalistes data (rubriques « données » des quotidiens) : le CSV est réutilisable sous licence de reprise avec attribution.

## Trois posts courts

1. « Un T2 à 390 € à Mauriac, 1 800 € à Paris. Nous avons classé 593 villes par loyer : le tableau complet est libre de reprise → mavilleideale.fr/presse »
2. « Plus de 50 000 habitants et un T2 à moins de 500 € : Calais, Saint-Quentin, Laval. Le classement et les notes de qualité de vie → mavilleideale.fr/guides/villes-france-moins-cheres-2026-top-10 »
3. « Quelle est la ville la moins chère de votre département ? Notre tableau couvre 102 départements, en CSV → mavilleideale.fr/presse »
