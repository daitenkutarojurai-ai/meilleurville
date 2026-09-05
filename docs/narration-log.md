# Narration log — retravail éditorial des articles long-format

Journal des passes de retravail narratif (fluidité, rythme, transitions, accroche).
Une ligne par run : `- YYYY-MM-DD app/chemin/du/fichier.tsx :: identifiant`.
Les données factuelles (chiffres, scores, noms) ne sont jamais modifiées.

## Reliquat mesuré le 2026-09-05 — la passe R7.8 a un angle mort

Le corpus FR est bien à la cible R7.10 **en moyenne** (1 tiret cadratin pour 352 mots
sur `intro` + `sections[].body`, cible 200), mais la moyenne cache une queue :
**85 guides sont sous 1 tiret pour 100 mots**, dont **39 de la série tourisme
`10-choses-a-faire-*`**. Ce ne sont pas des guides « à alléger » : ils n'ont jamais été
mis en prose, ils sont restés en fragments sans verbe ponctués par parenthèses et
cadratins (Riom était à 1 pour 29). La roadmap donne R7.8 pour *DONE* — c'est vrai du
gros du corpus, faux de cette queue.

Prochains plus atteints, mesurés : `10-choses-a-faire-a-royan-2026` (1/30),
`-pezenas-` (1/34), `-montbeliard-` (1/35), `-sisteron-` (1/36), `-concarneau-` (1/36),
`-vienne-` (1/37), `-saint-brieuc-` (1/38), `-saint-jean-de-luz-` (1/39), `-apt-` (1/39),
`-saint-paul-de-vence-` (1/41). Hors tourisme : `acheter-maison-campagne-france-2026-vraiment-vivable`,
`encadrement-loyers-france-2026-villes-investir-malgre-tout`, la série `travail-a-*`
(Caen, Clermont-Ferrand, Rouen, Reims) et `vacances-monoparentales-*`.

Le compte se reprend sur `intro` + `sections[].body` **uniquement** : les `heading`
(« N. Label — ») et les `metaTitle` gardent leurs cadratins, ce sont des séparateurs
structurels, et les compter fait croire à une régression.

- 2026-07-03 app/guides/[slug]/page.tsx :: vivre-en-france-teletravail-guide-2025
- 2026-07-04 app/guides/[slug]/page.tsx :: quitter-lyon-guide-2026
- 2026-07-05 app/guides/[slug]/page.tsx :: vivre-en-corse-guide-2026
- 2026-07-06 app/guides/[slug]/page.tsx :: meilleure-ville-famille-france
- 2026-07-07 app/guides/[slug]/page.tsx :: quitter-paris-guide-2025
- 2026-07-08 app/guides/[slug]/page.tsx :: budget-vivre-en-france-comparatif
- 2026-07-09 app/red-flags/[slug]/page.tsx :: villes-erosion-cotiere
- 2026-07-10 app/guides/[slug]/page.tsx :: villes-etudiantes-france-guide
- 2026-07-11 app/guides/[slug]/page.tsx :: quitter-marseille-guide-2026
- 2026-07-12 app/guides/[slug]/page.tsx :: retraite-france-guide
- 2026-07-13 app/red-flags/[slug]/page.tsx :: villes-desert-medical
- 2026-07-14 app/guides/[slug]/page.tsx :: soleil-france-guide
- 2026-07-15 app/guides/[slug]/page.tsx :: alternatives-ile-de-france-banlieue-parisienne-guide-2025
- 2026-07-16 app/guides/[slug]/page.tsx :: teletravail-bretagne-guide
- 2026-07-17 app/guides/[slug]/page.tsx :: vivre-sans-voiture-france-guide-2025
- 2026-07-18 app/guides/[slug]/page.tsx :: meilleures-villes-jeunes-actifs-france-2025
- 2026-07-19 app/guides/[slug]/page.tsx :: vivre-bord-mer-france-guide
- 2026-07-20 app/guides/[slug]/page.tsx :: paris-province-guide-demenagement-2025
- 2026-07-21 app/guides/[slug]/page.tsx :: villes-nature-plein-air-france
- 2026-07-22 app/guides/[slug]/page.tsx :: bordeaux-lyon-nantes-quelle-ville-choisir
- 2026-07-23 app/pour-qui/[profil]/page.tsx :: amateurs-de-montagne
- 2026-07-24 app/guides/[slug]/page.tsx :: vivre-dans-le-sud-france-guide-2025
- 2026-07-26 app/guides/[slug]/page.tsx :: vivre-pays-basque-bayonne-biarritz-pau
- 2026-07-27 app/guides/[slug]/page.tsx :: nouvelles-villes-montantes-france-2026
- 2026-07-28 app/guides/[slug]/page.tsx :: villes-seniors-retraite-france
- 2026-07-29 app/expat-retour/[pays]/page.tsx :: depuis-suisse
- 2026-07-30 data/guides.ts :: travail-a-orleans-2026
- 2026-08-02 data/guides.ts :: travail-a-amiens-2026
- 2026-08-05 data/guides.ts :: 10-choses-a-faire-a-libourne-2026
- 2026-08-07 data/guides.ts :: 10-choses-a-faire-a-annonay-2026
- 2026-08-12 data/guides.ts :: travail-a-aix-en-provence-2026
- 2026-08-14 data/guides.ts :: partir-en-vacances-seul-avec-ses-enfants-2026
- 2026-08-15 data/guides.ts :: travail-a-brest-2026
- 2026-08-19 data/guides.ts :: travail-a-nimes-2026
- 2026-08-26 data/guides.ts :: travail-a-le-mans-2026
- 2026-08-28 data/guides.ts :: acheter-immobilier-outre-mer-drom-france-2026
- 2026-08-29 data/guides.ts :: vivre-dans-bourg-2000-habitants-france-2026
- 2026-09-02 data/guides.ts :: vivre-proche-centrale-nucleaire-france-2026
- 2026-09-04 data/guides.ts :: petites-villes-50000-habitants-tout-france-2026
- 2026-09-05 data/guides.ts :: 10-choses-a-faire-a-riom-2026
