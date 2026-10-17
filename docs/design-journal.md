# Journal de la routine design

Une entrée par run (date + heure UTC). Lire avant de choisir une surface : ne pas refaire ni défaire
le travail d'un run précédent. Identité fixée : CLAUDE.md § « Design identity — Carte & plaque ».

## 2026-10-16 ~16:00 UTC — hub `/classements`

**Surface** : `app/classements/page.tsx` + `components/ClassementsJumpNav.tsx` (seul utilisateur).

**Changé**
- Les 19 en-têtes de catégorie portaient chacun une tuile en dégradé (`from-emerald-400 to-lime-500`,
  `from-violet-400 to-fuchsia-500`…) + un emoji, et le libellé comme le lien « Classement complet »
  étaient peints dans une couleur par catégorie (`#22C55E`, `#84CC16`, `#A855F7`, `#F59E0B`…), soit
  exactement les couleurs réservées aux paliers de score : « Famille » en vert et « Retraite » en
  ambre se lisaient comme des notes. Remplacé par une **tuile `.plaque`** portant l'icône lucide
  (le champ `icon` existait déjà, inutilisé), un libellé de feuille de carte **« Feuille 01 / 19 »**
  en mono, titre à l'encre, lien en `--accent`, filet `--border` sous l'en-tête. Champs
  `gradient` / `color` / `emoji` supprimés de `CATEGORIES`.
- **Médailles 🥇🥈🥉** (pastilles or/argent/bronze, l'or étant un ambre de palier) retirées : `CityCard`
  imprime déjà le rang en haut à droite, la médaille le doublait.
- Hero : emoji 🏆 retiré, sur-titre « Édition 2026 · 19 feuilles » (compte dérivé de `CATEGORIES`).
  `.topo-bg` essayé sur le hero puis **retiré** : à pleine intensité les courbes de niveau passent
  derrière le titre et le chapô et nuisent à la lecture (vu en capture). `AmbientBackground` fournit
  déjà le topo discret.
- Barre de sauts collante : plus d'emojis, verre (`glass`, `backdrop-blur`) → carton
  `--bg-surface` + filet `--border` ; chips sur papier `--bg-canvas`. **Mobile** : la barre collante
  occupait 7 lignes (~290 px d'écran) ; elle tient désormais sur **une ligne défilante
  horizontalement** sous `sm` (scroll interne à l'élément, aucun scroll de page), retour au wrap
  centré dès `sm`.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 2
fichiers sans erreur. Captures avant/après via `next dev` + Playwright (1440 et 390 px,
`scrollWidth` = viewport aux deux largeurs). `npm run build` non lancé (interdit en routine).
Note capture : forcer `opacity:1` pour contourner `ScrollReveal` déclenche un avertissement
d'hydratation en dev et fait apparaître le méga-menu caché — artefact du script, pas du code.

**Prochaines surfaces candidates**
1. `components/CityCard.tsx` — bande de couverture en dégradé + `bg-aurora` sous la photo (composant
   le plus répandu du site, à vérifier : la bande encode-t-elle le score ? si oui la garder en palier
   plein, sinon la passer à l'identité).
2. Bandeau cookies — liseré arc-en-ciel (CLAUDE.md), et tuile d'icône 🍪.
3. Navbar — emojis devant chaque lien (🌍 📖 ⚖️ 🗳️ 🚩) et méga-menu ; CTA « Trouver ma ville » rose
   (`ScrollTo…`/barre flottante vue en capture desktop) encore dans l'ancien rose fuchsia.

## 2026-10-17 ~03:00 UTC — `components/CityCard.tsx`

**Surface** : la carte ville, composant le plus répandu du site (11 fichiers l'importent : hubs,
classements, régions, départements, favoris… FR et EN via la prop `locale`).

**Changé**
- **Bande de score** : elle encodait bien le palier, mais en dégradé à trois arrêts qui mélangeait
  deux paliers (`from-green-500 via-lime-400`, `from-lime-400 via-yellow-300 to-amber-300`) + un
  voile `bg-aurora` : une carte « Excellent » se lisait à moitié « Bon ». Remplacée par la couleur
  du palier **à plat** (`scoreHex`), 6 px. `gradientForScore` supprimé.
- **Couverture sans photo** (rares villes sans image Commons) : ancien dégradé arc-en-ciel →
  feuille de carte `.topo-bg` sur papier `--bg-canvas` avec le nom de la ville sur une **`.plaque`**
  (nom de lieu, jamais le score — c'est la bande qui le porte). Non vu en capture (les villes
  testées ont toutes une photo) ; plaque `truncate max-w-[85%]` dans `h-32`.
- **Libellé de palier** : étoile jaune-ambre (ambre de palier détourné en décoration) → pastille
  papier avec un point de la couleur du palier.
- **Rang** : rond gris → étiquette carton à filet bleu plaque, « n°3 » (EN « #3 ») en mono. Pas de
  `.plaque` : le rang dérive du score, et la plaque ne doit jamais encoder un score.
- **Mini-grille d'axes** : jauges en dégradé à alpha sur piste blanche → couleur de palier pleine
  sur piste `--border` ; tuiles papier à filet.
- Effet `shine` (reflet glissant, gabarit SaaS) retiré.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur le
fichier : 0 erreur (1 warning `no-img-element` préexistant). Captures `next dev` + Playwright sur
`/classements/famille` à 1440 et 390 px, `scrollWidth` = viewport. Playwright est global :
`/opt/node22/lib/node_modules/playwright/index.mjs`. ⚠️ Ne pas `pkill -f "next dev"` dans la même
commande que le commit : le motif tue le shell lui-même. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Bandeau cookies — liseré arc-en-ciel en haut (vu en capture : orange→violet) et tuile 🍪.
2. Navbar — emojis devant chaque lien et dans le méga-menu ; CTA flottant « Trouver ma ville » en
   rose fuchsia (barre sous le méga-menu, desktop).
3. Hero des pages `/classements/[slug]` — tuile d'icône en dégradé vert + emoji 🏆 du sur-titre, et
   barres « Poids des critères » en vert émeraude (couleur de palier détournée).

## 2026-10-17 ~11:00 UTC — gabarit `/classements/[slug]` (19 pages FR)

**Surface** : hero et colonne latérale des 19 classements détaillés.

**Changé**
- **Hero** : voile `bg-aurora` retiré ; tuile d'icône en dégradé `accent → emerald-700` (un vert
  de palier en décoration) + emoji de catégorie remplacés par une **`.plaque` « N°08 »** ; sur-titre
  🏆 → ligne mono « Feuille 08 / 19 · Classement 2026 · N villes », la même numérotation que les
  en-têtes du hub `/classements`. Le numéro est **calculé** depuis l'ordre de `RANKING_META`.
- **Ordre du hub aligné** : `CATEGORIES` (`app/classements/page.tsx`) plaçait « écologie » en 13ᵉ
  alors que `RANKING_META` la met en 17ᵉ — la feuille n'aurait pas porté le même numéro sur le hub
  et sur sa page. Une ligne déplacée, commentaire posé.
- **Poids des critères** : jauges teintées par `meta.color` (violet, ambre, rouge, lime… selon la
  catégorie, donc des couleurs de palier détournées) → bleu plaque sur piste `--border`.
- **Méthodologie** : coches `emerald-600` → accent.
- **Classements voisins** (9 cartes) : emoji décoratif → flèche `ArrowUpRight` accent ; **guides
  associés** : `g.emoji` → `BookOpen` accent.
- **CTA quiz** : fond/bord/lien `meta.bgColor/borderColor/color` → lavis `--accent-soft`, lien accent.
- Non touché : la colonne Score/Global du tableau (vraie couleur de palier), la copie.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les
2 fichiers : 0 erreur. Captures `next dev` + Playwright sur `/classements/securite` à 1440 et 390 px,
`scrollWidth` = viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Jumelle EN `app/[locale]/rankings/[slug]/page.tsx` — emoji 5xl en tête du hero (l. 94), à
   aligner sur la plaque « No. 08 » (attention : ordre et compte à dériver de `RANKING_META` aussi).
2. Navbar — emojis devant chaque lien (🌍 📊 📖 ⚖️ 🗳️ 🚩), vus en capture desktop.
3. `components/TopFiveCities.tsx` / `FeaturedCities` de la home.
