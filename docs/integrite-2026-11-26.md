# Intégrité des données — 2026-11-26

**Résultat : run propre. Aucun écart FR / EN, aucune citation de note contredite par la page rendue, rien corrigé.**

## Pages touchées cette semaine (routines 2 et 3)

- **FAQ fiche ville** (`lib/city-faq.ts`, 16 questions FR et EN) : sur 10 villes (Lyon, Rennes, Nantes, Narbonne,
  Amboise, Île de Ré, Cayenne, Millau, Romainville `extension`, Biarritz), 16/16 réponses des deux côtés et
  **mêmes nombres** dans les deux locales (0 nombre propre à une seule locale). Globaux rendus : 7,1 · 7,4 · 6,9 · 4,9 ·
  7,9 · 7,6 · 3,9 · 5,6 · 2,8 · 5,6.
- **Guides A vs B de la semaine** (10 : pau/tarbes, vannes/la-rochelle, paris/lyon, tours/orléans, sète/montpellier,
  colmar/mulhouse, vannes/lorient, marseille/montpellier, narbonne/perpignan, aix-les-bains/annecy) : chaque « x,x/10 »
  accolé à un nom de ville figure parmi les notes rendues de cette ville. Une alerte (paris-vs-lyon, « Lyon … 7,1/10 »)
  est un artefact de l'expression régulière : 7,1 est bien le global rendu de Lyon.
- **`VersusScoreboard`** lit `CITIES_SEED` (valeurs rendues), même formatage FR/EN (virgule / point).
- `lib/city-local-facts.ts` : faits datés sans score ; rien à recouper.

## Vérifié

`npm run integrity` vert (palmarès : 5 éditions, aucune d'un mois futur, 2 brouillons).

## À arbitrer (inchangé depuis le 2026-11-20)

Composite sécurité ≠ axe de la fiche ; chemins de dépôt dans `lib/red-flag-themes.ts` (garde `sources` limitée aux guides).
