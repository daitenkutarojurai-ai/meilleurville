---
name: guide-batch
description: Ship a batch of per-city guides (famille-a-*, retraite-a-*, etudiant-a-*, vivre-sans-voiture-*, EN twins like family-in-* / studying-in-* / moving-to-*) into data/guides.ts or data/guides-en.ts for MaVilleIdéale. Use whenever a routine or session writes several city guides of one series in a single run, picks the next lot from docs/series-queue.md, or checks a series' FR/EN parity. Covers lot selection, the anti-thin-content gate, answer-first (GEO) structure, figure sourcing, the CRLF insert trap and the exact checks to run before committing.
---

# guide-batch — un lot de guides par ville, sans page mince

Ce skill condense deux skills génériques vendorisés à côté (`programmatic-seo`, `ai-seo`, licence MIT, Corey Haines) et les règles maison de `CLAUDE.md`. En cas de conflit, **`CLAUDE.md` gagne**.

## 1. Choisir le lot
1. Ouvre `docs/series-queue.md`. Prends la **première série ouverte** dont le compteur mesuré est sous la cible, en respectant la règle d'alternance FR/EN écrite en tête du fichier.
2. Mesure le compteur réel avant d'écrire (le compteur du fichier peut avoir dérivé) :
   `grep -c 'slug: "famille-a-' data/guides.ts` (adapte le préfixe, et pense aux slugs hors gabarit `au-`/`le-` documentés dans CLAUDE.md).
3. `git log --oneline -30` : si un autre agent vient de livrer la même série, passe à la suivante.
4. Villes candidates : par ordre de la liste du fichier de file, sinon par population (`lib/city-population.ts`) parmi les 593 slugs de `CITIES_SEED`. Une ville sans guide `vivre-a-` / `acheter-a-` n'est pas exclue, mais son guide doit tenir seul.

## 2. Le filtre anti-page-mince (programmatic-seo, appliqué ici)
Une page de série n'est pas « le même texte avec un autre nom de ville ». Avant d'écrire chaque guide, liste **au moins 5 faits propres à la ville**, chacun traçable à une source du dépôt :
- `data/housing.ts` (loyers, prix m²), `lib/city-income.ts`, `lib/city-population.ts`, scores et axes compilés depuis `lib/` (jamais un `grep` du seed), `data/neighborhoods.ts`, `data/city-parks.json`, `data/city-coast.json`, `climate-normals`, écoles via `/villes/[slug]/ecoles`, transports via le seed.
- Des lieux réels et vérifiables (équipements, quartiers, lycées), sans horaire ni tarif invérifiable.

Moins de 5 faits propres → **la ville ne part pas dans ce lot**. Note-la dans `docs/series-queue.md` (« reportée : données minces ») et prends la suivante. Mieux vaut 6 guides solides que 10 interchangeables : la politique Google sur le *scaled content abuse* vise exactement les séries à variables échangées.

Deux guides du même lot ne partagent ni phrase d'intro, ni ordre de sections identique au mot près, ni verdict générique.

## 3. Structure qui se fait citer (ai-seo, appliqué ici)
- **Intro answer-first** : les deux premières phrases répondent à la requête (« vivre en famille à X, ça vaut le coup ? ») avec le chiffre clé (loyer T3/T4, budget mensuel, rang sur l'axe pertinent). Ensuite le contexte.
- **Titres de section en questions ou en libellés de requête** (« Quel budget pour une famille à X ? », « Quels quartiers pour des enfants ? »). Le premier paragraphe de chaque section répond seul, sans dépendre du reste : c'est le bloc que Google AI Overviews / ChatGPT / Perplexity extraient.
- **Chiffres avec leur unité et leur base** (« 1 050 € / mois pour un T3, médiane `housing.ts` »), jamais « environ » sans base.
- **Comparaison explicite** avec 1 à 2 villes voisines du seed (même échelle, mêmes sources) : c'est ce qui donne à la page une valeur que la fiche ville n'a pas.
- Une section finale **verdict par profil** (pour qui ça marche, pour qui non). Pas de liste noire de quartiers (cf. décision `quartiers-a-eviter` dans CLAUDE.md).
- Pas de contenu « pour l'IA » séparé, pas de bourrage de mots-clés : Google le dit explicitement, le texte s'écrit pour un lecteur humain.

## 4. Gabarit technique
- Spec `Guide` en tête de `data/guides.ts` (EN : `data/guides-en.ts`). `metaTitle` ≤ 60 caractères, `metaDesc` ≤ 160, `publishedAt` = `updatedAt` = date du jour, `relatedCities` sur des slugs vérifiés de `CITIES_SEED`, `relatedGuides` sur des slugs qui existent (l'intégrité le vérifie).
- Accents et unités intacts (`€`, `°`, `m²`). Densité d'accents FR > 0,09 (sinon c'est un texte ascii-stripped).
- EN : anglais natif, pas traduit. Le lecteur s'installe depuis l'étranger : explique CAF, DPE, taxe foncière en une incise. **Mêmes chiffres** que la jumelle FR (alternates hreflang).
- **Piège CRLF** : le checkout Windows est en CRLF. Un script d'insertion qui cherche `'\n  },\n'` rend -1 et insère en tête de fichier. Détecte `\r\n` d'abord, ou insère avec l'outil Edit à un ancrage exact (le dernier guide de la série).
- Une seule passe d'écriture groupée par fichier en fin de lot (fichiers énormes et partagés).

## 5. Avant de commiter
```
npx tsc --noEmit
npm run integrity
npm run search-index        # régénère data/search-index*.json, sinon search-index:check casse
npm run search-index:check
```
**Jamais `npm run build`** en routine (4 h+, ENOSPC). Pas de déploiement : on pousse sur `main`, le déploiement est automatique.

Puis mets à jour : le compteur **mesuré** de la série dans `docs/series-queue.md` et dans la table de `CLAUDE.md` § Content roadmap, la liste des villes livrées, les reportées avec la raison, le prochain lot.

Commit : `content(<série>): batch N, +K guides <préfixe>-* (<villes>) [scheduled-agent]`. `git pull --rebase origin main` juste avant `git push`, jamais de force-push ni de `git stash` du travail d'autrui.
