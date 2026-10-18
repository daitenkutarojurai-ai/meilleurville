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

## 2026-10-17 ~16:00 UTC — jumelles EN `/rankings` + `/rankings/[slug]` (1 hub + 19 pages)

**Surface** : le hub EN des classements et le gabarit de ses 19 pages, restés sur l'ancien
modèle (emoji 3xl/5xl de catégorie) alors que les jumelles FR étaient passées en « feuilles ».

**Changé**
- **Hub** (`app/[locale]/rankings/page.tsx`) : emoji de chaque tuile → `.plaque.plaque-small`
  « 01 »…« 19 » + ligne mono « Sheet NN / 19 » ; ombre au survol retirée, titre à l'accent au
  survol, `h-full` pour aligner les tuiles. Numéro dérivé de l'ordre de `RANKING_META`, donc
  identique au hub FR et aux pages détaillées.
- **Détail** (`app/[locale]/rankings/[slug]/page.tsx`) : emoji 5xl → `.plaque` « No. 08 » +
  sur-titre mono « Sheet 08 / 19 · 2026 ranking · N cities », mêmes calculs que la jumelle FR.
  Rang de la liste top 30 : chiffre gris → étiquette carton à filet bleu plaque (comme `CityCard`,
  pas de `.plaque` car le rang dérive du score). Le score garde sa couleur de palier.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les
2 fichiers : 0 erreur. Captures `next dev` (`NEXT_PUBLIC_DEFAULT_LOCALE=en`, chemins `/en/...`) +
Playwright à 1440 et 390 px, `scrollWidth` = viewport. `npm run build` non lancé.
Vu en passant, hors périmètre design (copie) : l'intro du hub EN (`locales/en.ts`,
`rankings.intro`) annonce « 13 themed rankings » pour 19 tuiles — à signaler à une routine contenu.

**Prochaines surfaces candidates**
1. Navbar — emojis devant chaque lien (🌍 📊 ⚖️ 📖 vus en capture EN aussi) et méga-menu.
2. `components/TopFiveCities.tsx` / `FeaturedCities` de la home.
3. Bandeau cookies — vérifier s'il reste un liseré arc-en-ciel (CLAUDE.md dit converti 10-16/17).

## 2026-10-17 ~23:00 UTC — Navbar (toutes les pages, FR + EN)

**Surface** : `components/Navbar.tsx` — pastilles de la barre desktop, méga-menu, tiroir mobile.

**Changé**
- **Fin des emojis de navigation** : 99 champs `emoji` retirés (pastilles, méga-menu, tiroir, FR et
  EN), champ supprimé du type `NavItem`. Les onglets du bas (icônes lucide) ne bougent pas.
- **Pastilles desktop** : texte seul 13 px semi-gras ; actif = filet bleu plaque souligné sous le
  libellé (au lieu d'une pilule navy pleine à ombre portée), coins `rounded-md`.
- **Méga-menu** : chaque colonne porte une référence de carroyage **A / B / C / D** sur une
  `.plaque.plaque-small` mono, titre en encre sur filet ; liens en texte avec filet gauche bleu
  plaque au survol / à l'état actif (lavis `--accent-soft`). Fond rendu opaque
  (`/97 backdrop-blur` laissait transparaître le titre de la page dessous — vu en capture).
- **Tiroir mobile** : puces arrondies à emoji → étiquettes papier rectangulaires, active en bleu plaque.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 1 erreur
préexistante (`set-state-in-effect` l. 335, fermeture du menu au changement de route — ligne non
touchée), aucune ajoutée. Captures `next dev` + Playwright sur `/classements` à 1440 px (barre +
méga-menu ouvert) et 390 px (tiroir), `scrollWidth` = viewport. `npm run build` non lancé.
⚠️ Rappel (re-piégé ce run) : jamais `pkill -f "next dev…"` dans la même commande que le commit.

**Prochaines surfaces candidates**
1. `components/TopFiveCities.tsx` / `FeaturedCities` de la home.
2. Bandeau cookies — tuile 🍪 en lucide sur fond lavis ; vérifier le reste.
3. Pied de page (`components/Footer.tsx`) — emojis et colonnes à aligner sur le carroyage A/B/C/D.

## 2026-10-18 ~03:00 UTC — home : `TopFiveCities` + en-tête de `FeaturedCities` (FR + EN)

**Surface** : les deux premières sections « villes » de la home (FR et EN, composants partagés).

**Changé**
- **TopFiveCities** : médailles 🥇🥈🥉🏅 et barres de rang en dégradé or/argent/bronze
  (ambre/orange = couleurs de palier détournées) retirées. Chaque carte porte une **feuille topo**
  avec le nom de la ville sur `.plaque.plaque-small` (un nom de lieu, jamais le score), le rang en
  étiquette carton à filet bleu plaque « n°1 » (même objet que `CityCard`), puis la **bande de
  palier à plat** (`scoreHex`, vraie couleur de score). Pied de carte sur filet pointillé, flèche
  accent au lieu d'un « Voir → » invisible sans survol ; ombre portée et translation retirées.
  Sur-titre 🏆/Trophy → ligne mono « Podium · Top 5 villes » ; liseré dégradé du haut → filet `--border`.
- **FeaturedCities** : badge `success` vert « 🏆 Coup de cœur » (vert de palier en décoration) →
  ligne mono accent « Coup de cœur · 6 villes », même filet de tête que le podium.
- Non touché : scores, tagline, copie, `CityCard`.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les
2 fichiers : 0 erreur. Captures `next dev` + Playwright (`/opt/node22/lib/node_modules/playwright`)
sur `/` à 1440 et 390 px, `scrollWidth` = viewport. `npm run build` non lancé.
⚠️ `tsc` après `next dev` : supprimer `.next` (types générés tronqués) — et `pkill` dans sa propre
commande, il tue le shell sinon (re-piégé ce run).

**Prochaines surfaces candidates**
1. `components/SectionNav.tsx` — emojis 🏆 📊 🔍 ✨ 💸 📖 devant chaque ancre (vus en capture).
2. Bandeau cookies — tuile 🍪 en lucide sur fond lavis ; vérifier le reste.
3. Pied de page (`components/Footer.tsx`) — emojis et colonnes à aligner sur le carroyage A/B/C/D.

## 2026-10-18 ~11:00 UTC — home : `components/SectionNav.tsx` (FR + EN)

**Surface** : la barre d'ancres collante qui apparaît sous la Navbar une fois le hero passé (md+).

**Changé**
- **Fin des emojis** 🏆 📊 🔍 ✨ 💸 📖 (champ `emoji` supprimé du tableau `SECTIONS`).
- Lecture « index de feuilles en marge de carte » : légende mono « Sur cette page / On this page »,
  puis entrées numérotées « 01 Top 5 … 06 Guides » (numéro mono tabulaire).
- Actif : pilule navy pleine à ombre → texte accent + filet bleu plaque posé sur le filet bas de la
  barre (même grammaire que les pastilles de la Navbar depuis le 17/10 23:00).
- Fond `--bg-canvas` opaque (le `/90 backdrop-blur-xl` laissait transparaître le contenu).
- `<button>` → `<a href="#id">` (`aria-current="location"`) : les ancres deviennent de vrais liens,
  le défilement doux reste en JS (`preventDefault` + `history.replaceState`).

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Capture `next dev` + Playwright à 1440 et 820 px (la barre est masquée sous md, donc rien à voir à
390 px), `scrollWidth` = viewport. `npm run build` non lancé.
⚠️ Capture : les sections sous `ScrollReveal` restent à opacity 0 si on saute directement à une
ancre — faire défiler par `mouse.wheel` d'abord.

**Prochaines surfaces candidates**
1. `components/RankingPreview.tsx` (home « Classements par style de vie ») — 5 tuiles teintées
   bleu/vert/vert clair/violet/ambre avec titres colorés : couleurs de palier détournées, à passer
   en feuilles + plaque comme `/classements`.
2. Bandeau cookies — tuile 🍪 sur fond lavis ; vérifier le reste.
3. Pied de page (`components/Footer.tsx`) — emojis et colonnes à aligner sur le carroyage A/B/C/D.
