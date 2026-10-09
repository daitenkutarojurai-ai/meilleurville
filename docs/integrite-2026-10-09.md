# Intégrité des données — 2026-10-09

## Priorité : éditions du palmarès publiées en avance — corrigé

**Constat.** `data/guides.ts` rendait les éditions **novembre 2026**, **décembre 2026** et
**janvier 2027** du palmarès mensuel (`publishedAt` 02/09, 22/09 et 04/10), donc page guide,
listes, tags, sitemap, search-index et maillage. Un lecteur d'octobre lisait « Palmarès janvier
2027 ».

**Correctif.**
- Les trois objets sont déplacés tels quels dans **`data/palmares-drafts.ts`**
  (`PALMARES_DRAFTS: Guide[]`), qu'aucun module rendu n'importe. Aucun texte perdu.
- `npm run search-index` relancé : 1 216 → **1 213 guides FR**, 276 tags (aucune page `/tags/`
  disparue). `sitemap:check` vert (FR 30 295 URL, EN 29 896).
- **Garde `palmarès` dans `npm run integrity`** : elle refuse ① une édition de `GUIDES` datée d'un
  mois futur (mois lu dans le slug, bascule le 2 du mois en UTC), ② un slug à la fois brouillon et
  publié, ③ tout import de `palmares-drafts` depuis `app/`, `components/`, `lib/` ou `worker/`.
  Vérifiée **en la faisant échouer** (slug de juillet passé en 2027 → échec nommé).
- Mécanisme documenté dans `CLAUDE.md` § R13.2 : la routine palmarès déplace l'édition le 2 du
  mois, remet les dates à la date réelle, revérifie ses chiffres et ses `relatedGuides`.
- **Maillage** : aucun `relatedGuides` d'une édition publiée ne visait un brouillon (les liens
  vers novembre/décembre ne partaient que des brouillons eux-mêmes). Une seule mention en prose
  hors palmarès : `parent-solo-a-les-sables-d-olonne-2026` citait « l'édition de novembre du
  palmarès » — reformulée en « la préparation d'une édition du palmarès ». Aucune référence dans
  `data/guides-en.ts`.
- **Promesse d'octobre** : la section « Rendez-vous en novembre » de l'édition d'octobre annonce
  la population municipale Insee 2011/2016/2022 — c'est exactement le brouillon de novembre. Pas
  de promesse orpheline.
- **Non fait, volontairement** : aucune redirection pour les trois URL retirées. Un 301 vers
  octobre survivrait à leur republication et la masquerait. Elles répondront 404 jusqu'au
  déploiement qui suivra leur publication.

## Contrôle FR / EN (règle 2)

- **Six moteurs « qualité »** (air, démographie, emploi, santé, sécurité, services publics) : les
  sous-pages FR affichent `(10 - x).toFixed(1)`, les jumelles EN `Math.round((10 - x) * 10) / 10`.
  Les deux arrondis peuvent diverger à la demi-décimale, donc comparés sur **les 561 villes, composite
  et chaque dimension** : **16 830 comparaisons, 0 écart**.
- Vélo et sport (EN arrondi par `Math.round`, FR par `toFixed`) : 0 écart sur 561 villes.
- Hubs nationaux et macro-régionaux (sécurité, santé, emploi, services publics, démographie,
  risques) : nombre d'inversions identique FR/EN sur chaque paire.
- Cartes de `CityProfile` (9 cartes du quartet + moteurs) : composant unique, branché sur `locale`,
  palette par niveau, légende « 10 = » présente.
- Échantillon nommé : Lyon, Rennes, Angers, La Rochelle, Lens, Figeac, Briançon, Mamoudzou,
  Saint-Denis (La Réunion), **Villejuif** (`scoreCohort: "extension"`) — couvert par les balayages
  sur les 561 villes ci-dessus, qui n'excluent pas la cohorte d'extension.
- Revue honnête : FR (`buildHonestReview`) et EN (reconstruction locale) appliquent les mêmes seuils
  (≥ 7,0 / ≤ 4,8), le même tri et les mêmes coupes (4 / 3).

## Conventions (règles 1 et 3)

- Bloc `**Convention**` présent dans les 14 libs de score (quartet environnement, `environment-index`,
  santé, sécurité, emploi, services publics, démographie, tension locative, biodiversité, vélo,
  commerces).
- Nuisances (bruit, eau, risques) : brutes `10 = pire`, légende présente, palette par niveau en FR,
  `hazardColor = scoreColor(10 - x)` en EN. Conforme.

## Couverture des paires

- `RANKING_EN` ↔ `RANKING_META` : 19/19, zéro orpheline.
- `REGION_EN_DESCRIPTIONS` ↔ régions du seed : 18/18, zéro orpheline.
- `assertUniqueSlugs` (FR et EN) : vert via `npm run integrity`. `hreflang:check` vert.

## Corrigé au passage

- `/villes/[slug]/sport` : la meta et la FAQ (donc le JSON-LD) écrivaient `${s.composite}/10`, soit
  « 6.4/10 » avec un point dans une copie française. Passé en `toFixed(1)` + virgule (6 chaînes).
  Même nombre qu'en EN.

## À arbitrer (non corrigé)

- **Point décimal dans la copie FR** : **62** gabarits `x.toFixed(1)}/10` sans `.replace(".", ",")`
  sur 18 sous-pages ville FR (dont `parent-solo` ×19, `a-faire` ×8), principalement dans les FAQ et
  donc le JSON-LD. Le nombre est juste et identique à l'EN ; c'est de la typographie. Correction
  mécanique possible en un passage, laissée hors de ce run faute d'être une question d'intégrité.
- Aucun score publié à déplacer ce run.

Contrôles : `npx tsc --noEmit` propre, `npm run integrity`, `npm run sitemap:check`,
`npm run search-index:check`, `npm run hreflang:check` — tous verts. `npm run build` non lancé.
