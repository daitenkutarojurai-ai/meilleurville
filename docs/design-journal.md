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

## 2026-10-18 ~16:00 UTC — home : `components/RankingPreview.tsx` (FR + EN)

**Surface** : section « Classements par style de vie » de la home (FR `/` et EN `/`).

**Changé**
- **Fin des teintes de catégorie** : les 5 tuiles bleu / émeraude / vert / violet / ambre (fond,
  bordure et titre colorés — couleurs de palier détournées) deviennent des **feuilles de carte**
  identiques : en-tête `.topo-bg` avec l'icône sur `.plaque` (même objet que les en-têtes de
  `/classements`) et la référence mono « Feuille 01 / 19 » (« Sheet » en EN), numéro **dérivé de
  `RANKING_META`** comme sur le hub, donc cohérent avec lui.
- Titre en encre, N°1 + score sur filet pointillé, **bande de palier à plat** (`scoreHex`) en pied,
  comme `TopFiveCities` ; `sr-only` « sur 10 ».
- Retrait de `TiltCard` / `Spotlight` / `shine` / `backdrop-blur` (effets SaaS) sur cette section ;
  badge `accent` → ligne mono « Classements 2026 · 19 feuilles », filet de tête comme le podium.
  Lien « Tous les classements » unique (plus de doublon mobile).
- Non touché : copie, moteur de classement, scores.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright à 1440 et 390 px, `scrollWidth` = viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. `components/QuizTeaser.tsx` (home) — utilise encore `TiltCard`/`Spotlight`, à vérifier.
2. Bandeau cookies — tuile 🍪 sur fond lavis bleu ; vérifier le reste.
3. Pied de page (`components/Footer.tsx`) — emojis et colonnes à aligner sur le carroyage A/B/C/D.

## 2026-10-18 ~23:00 UTC — home : `components/QuizTeaser.tsx` (FR + EN)

**Surface** : section « Quiz IA » de la home (FR `/` et EN `/`).

**Changé**
- Retrait de toute la pile SaaS : `TiltCard`, `MagneticButton`, fond aurora + blobs flous animés,
  grain, `glass-strong`, `gradient-text-anim`, bouton `shine accent-pulse`, pastille flottante
  dégradée ambre→brique avec `Sparkles`.
- Une **feuille** papier carte à filet `--border`, coupée en deux : copie à gauche, démo à droite
  posée sur `.topo-bg`. Sur-titre en ligne mono accent ; « existe. / exists. » en `.ink-underline`
  (seule occurrence de la home).
- CTA « Trouver ma ville » en **`.plaque`** (même objet que le CTA City Match de la Navbar, icône
  `MapPin`) ; lien secondaire souligné, ✨ décoratif retiré.
- Étapes : pastilles de verre → légende numérotée 01/02/03 en mono sur filets pointillés (`<ol>`).
- Démo : emojis 🌲🎭🌊🥐 retirés des réponses, `aria-pressed`, `type="button"`, une colonne sous sm ;
  villes matchées en **`.plaque.plaque-small`** (noms de lieux), `aria-live`.
- Non touché : copie, liens, nombre de villes.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright à 1440 et 390 px, `scrollWidth` = viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Bandeau cookies — tuile 🍪 sur fond lavis bleu (vue en capture ce run).
2. Pied de page (`components/Footer.tsx`) — emojis et colonnes à aligner sur le carroyage A/B/C/D.
3. Simulateur de la home (section 05) — à inspecter.

## 2026-10-19 ~03:00 UTC — pied de page : `components/Footer.tsx` (FR + EN, toutes les pages)

**Surface** : le footer partagé du site (≈ 58 000 pages FR + EN).

**Changé**
- Fin de la pile SaaS : dégradé radial vert forêt, trois blobs aurora (vert, ambre, lime — couleurs
  de palier), grain, filet dégradé vert, wordmark géant `gradient-text-anim` à 25 %, titres de
  colonne lime, flèches lime au survol, cœur rose `#EC4899`, point vert pulsant.
- **Marge basse d'une carte d'état-major** : champ encre `#18212F`, courbes de niveau `.topo-bg`
  (traits navy en `screen`, opacité 0,4), bande plaque navy + liseré vert en tête (même objet que le
  bandeau cookies).
- Marque sur **`.plaque`** (BrandMark + « MaVilleIdéale » en blanc, plus de « Idéale » vert `#4ADE80`).
- Titres de colonne avec **référence de carroyage A/B/C** sur `.plaque-small`, comme le méga-menu.
- Liens `#C3CAD5` (≈ 10:1 sur l'encre), survol blanc souligné, focus blanc.
- Ligne de légende : cœur brique (`--accent-pink`), **barre d'échelle** décorative « Échelle / Map
  scale » (aria-hidden) à la place du point pulsant.
- Emoji décoratif 🌿 retiré de la tagline FR (remplacé par un point). Copie et liens inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright (chromium `/opt/pw-browsers`) à 1440 et 390 px, `scrollWidth` =
viewport. `npm run build` non lancé. ⚠️ Ne pas lancer `pkill -f "next dev"` dans la même commande
que d'autres étapes : le motif tue le shell lui-même.

**Prochaines surfaces candidates**
1. Bandeau cookies — tuile 🍪 sur lavis bleu arrondie + `backdrop-blur` : passer en fiche papier.
2. Simulateur de la home (section 05) — à inspecter.
3. Sous-pages ville : tuiles d'icônes dégradées restantes (`grep -rnE "bg-gradient-to-[a-z]+ from-[a-z]+-[0-9]+" app/villes`).

## 2026-10-19 ~11:00 UTC — home : `components/GuidesTeaser.tsx` (FR + EN)

**Surface** : section « Guides pratiques » de la home (FR `/` et EN `/`).

**Changé**
- Fin des couvertures pastel `from-emerald/lime/pink/rose/sky` (couleurs de palier détournées),
  de l'aurora, du grain, du lavis radial vert et du `gradient-text-anim` du titre.
- Fin des emojis décoratifs (📖 du sur-titre, emoji de guide en 7xl/5xl sur la couverture).
- Chaque guide devient une **fiche** : couverture `.topo-bg` + tuile livre sur `.plaque`, référence
  mono « À la une · Fiche 01 / 03 » / « 02 / 03 » (EN « Sheet »), méta mono, filet pointillé avant
  « Lire le guide », bordure accent au survol (plus d'ombres teintées ni de pastille `backdrop-blur`).
- En-tête aligné sur `RankingPreview` : filet de tête, sur-titre mono « Guides pratiques · 1 305
  fiches » (compte dérivé du corpus de la locale), mot-clé en `font-display` italique accent
  (pas d'`.ink-underline` : déjà utilisé par `QuizTeaser` sur la même page). Lien « Tous les
  guides » unique (plus de doublon mobile).
- Non touché : copie, sélection des 3 guides, liens.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright (`/opt/node22/lib/node_modules/playwright`, chromium
`/opt/pw-browsers`) à 1440 et 390 px, `scrollWidth` = viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. `components/ProfileQuickAccess.tsx` (home) — utilise encore aurora/blur, à inspecter.
2. `components/RedFlagTeaser.tsx` + `NewsletterSection.tsx` (home) — idem.
3. Bandeau cookies — tuile 🍪 sur lavis bleu arrondie + `backdrop-blur` : passer en fiche papier.

## 2026-10-19 ~16:00 UTC — home : `components/ProfileQuickAccess.tsx` (FR + EN)

**Surface** : section « Votre profil » de la home (FR `/` et EN `/`).

**Changé**
- Fin des cartes `glass` + `border-white/50` + ombre/tilt au survol, du lavis radial vert (couleur de
  palier), du `gradient-text-anim` du titre et des emojis (✨ du sur-titre, 👨‍👩‍👧 💻 🚲 💰 🎭 🌿 🏡).
- Chaque profil devient une **fiche de légende** : tuile d'icône lucide sur `.plaque`, référence mono
  « 01 / 07 », filet pointillé, et la **ville N°1 sur une plaque émaillée** (`.plaque.plaque-small`,
  nom tronqué proprement à 390 px) — une plaque pour un nom de lieu, jamais pour un score.
- « Cadre de vie — le méga-index » rentre dans la grille comme **fiche d'index sur papier topo**
  (`.topo-bg`, `sm:col-span-2`, la grille 3 colonnes se ferme sur 3 rangées pleines).
- En-tête aligné sur `RankingPreview` / `GuidesTeaser` : filet de tête, sur-titre mono « Votre profil ·
  7 légendes » (compte dérivé de `PROFILES`), mot-clé `font-display` italique accent, lien unique
  « Voir tous les classements thématiques » en haut à droite.
- Non touché : copie, profils, liens, calcul de la ville N°1.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright à 1440 et 390 px, `scrollWidth` = viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. `components/RedFlagTeaser.tsx` (home) — aurora/blur à inspecter.
2. `components/NewsletterSection.tsx` (home) — idem.
3. Bandeau cookies — tuile 🍪 sur lavis bleu arrondie + `backdrop-blur` : passer en fiche papier.

## 2026-10-19 ~23:00 UTC — home : `components/RedFlagTeaser.tsx` (FR + EN)

**Surface** : section « Red Flag Radar » de la home (FR `/` et EN `/`).

**Changé**
- Fin du rouge détourné (rouge = palier « Mauvais ») : lavis radial rouge, pastille `rounded-full`
  rouge, tuiles d'icônes rouges, lien CTA rouge, bordures rouges au survol, `gradient-text-anim`.
- Le radar devient la **légende des risques d'une carte** : cartouche encadré sur papier `.topo-bg`
  (double cadre), en-tête mono « Légende · 4 catégories surveillées », chaque catégorie = symbole
  carré **hachuré brique** (`--accent-pink`, la seule touche chaude) + référence mono R1–R4, filets
  pointillés ; plus de flèches trompeuses sur des lignes qui ne sont pas des liens.
- En-tête aligné sur les autres sections de la home (filet de tête, sur-titre mono brique, mot-clé
  `font-display` italique brique), CTA souligné d'un trait brique. Section sur le papier de la page
  (plus de `bg-surface` + `overflow-hidden`), largeur `max-w-5xl` comme ses voisines.
- Non touché : copie, catégories, lien.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright à 1440 et 390 px, `scrollWidth` = viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. `components/NewsletterSection.tsx` (home) — aurora/blur à inspecter.
2. Bandeau cookies — tuile 🍪 sur lavis bleu arrondie : passer en fiche papier (visible sur toutes les captures).
3. Hub `/red-flags` — dégradés de héros (cf. CLAUDE.md « fair game »), dans la continuité de ce teaser.

## 2026-10-20 ~03:00 UTC — `components/NewsletterSection.tsx` (home FR/EN + pied de chaque guide, mode `compact`)

**Surface** : « La lettre du dimanche », en bas de la home (FR + EN) et en mode `compact` en pied de chaque guide.

**Changé**
- Fin de l'aurora (3 blobs flous), du grain, des 3 `Sparkles` flottants, du `glass-strong` + ombre
  teintée, de la tuile dégradée accent → **emerald** (vert de palier détourné), du
  `gradient-text-anim`, du `MagneticButton` + `shine`, et du succès en `text-emerald-700`.
- La lettre devient une **enveloppe sur papier** : liseré « par avion » en diagonales navy/brique
  (les deux seuls accents), fiche `bg-surface`, et à droite (≥ md) un **timbre** à bord perforé
  (pointillé, légère rotation) sur papier `.topo-bg` avec une `.plaque-small` portant l'enveloppe
  et la mention mono « Dim. » / « Sun. ».
- En-tête aligné sur les autres sections de la home (filet de tête, sur-titre mono « Courrier ·
  chaque dimanche » / « Post · every Sunday »), mot-clé `font-display` italique accent.
- Champ e-mail en mono, bord encre ; bouton navy plat ; erreur en brique (plus de rouge de palier) ;
  succès en navy sur `--accent-soft` ; filet pointillé avant les mentions.
- `compact` (guides) : même enveloppe sans timbre ni grand titre.
- Non touché : copie, endpoint, honeypot, locale envoyée à l'API.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright à 1440 et 390 px (home + un guide), `scrollWidth` = viewport.
`npm run build` non lancé.

**Prochaines surfaces candidates**
1. Bandeau cookies — tuile 🍪 sur lavis bleu arrondie (visible sur toutes les captures) : fiche papier.
2. Hub `/red-flags` — dégradés de héros (« fair game » dans CLAUDE.md), continuité du teaser.
3. Section commentaires des guides (vue sous la lettre) — erreur en `red-50`, à inspecter.

## 2026-10-20 ~11:00 UTC — bandeau cookies `components/CookieConsent.tsx` (toutes pages FR + EN)

**Surface** : la fiche de consentement, affichée en bas à gauche de chaque page à la première visite.

**Changé**
- Fin de la carte d'app : `rounded-2xl`, `bg-white/95` + `backdrop-blur-md`, tuile d'icône arrondie
  sur lavis bleu, boutons `rounded-xl`, bandeau dégradé navy/vert en tête.
- Devient un **feuillet de carte** : papier `--bg-surface`, filet encre + filet crayon intérieur
  (double cadre), **bande de courbes de niveau** (`.topo-bg`) le long du bord gauche séparée par un
  pointillé, icône cookie sur **`.plaque.plaque-small`**, sur-titre mono brique « Petite note · N° 01 »,
  filet pointillé avant le texte, boutons à angles nets (navy plein / contour encre), pied mono
  « GA4 · consentement » et lien « Voir le détail » souligné brique. Inclinaison d'entrée adoucie.
- Non touché : copie, logique de consentement GA, clé de stockage, délai d'apparition.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright sur `/` à 1440 et 390 px, `scrollWidth` = viewport. `npm run build`
non lancé.

**Prochaines surfaces candidates**
1. Hub `/red-flags` — dégradés de héros (« fair game » dans CLAUDE.md), continuité du teaser.
2. Section commentaires des guides — erreur en `red-50`, à inspecter.
3. Hero home — pastille « ✨ On en parle » et puces de villes arrondies (vues sur la capture) : fiche/plaque.

## 2026-10-20 ~16:00 UTC — hub `/red-flags` (FR `app/red-flags/page.tsx` + EN `app/[locale]/red-flags/page.tsx`)

**Surface** : le hub Red Flag Radar, dans la continuité du `RedFlagTeaser` de la home (26050cb).

**Changé**
- Héros : fin du dégradé `from-red-950/20` et de la pastille rouge arrondie. Papier `.topo-bg` sous
  un voile `bg-canvas/80` (le relief ne traverse plus le texte), sur-titre mono brique souligné,
  H1 plus grand avec la chute en `font-display` italique brique (même phrase que le teaser).
- Vignettes thématiques (FR, 43) : `rounded-md`, emoji retiré au profit d'un cartouche mono brique
  « Feuille NN / 43 » sous filet pointillé (convention des `/classements`), survol brique au lieu de
  `red-500`, flèche lucide. `auto-rows-fr` seulement à partir de `sm` (plus de vides sur mobile).
- Fiches par ville : angles nets, survol brique, filet pointillé. **La teinte de vigilance
  (`ring`/`tone`) est conservée** : elle encode un niveau, pas une décoration.
- Compteurs : fin du `glass` et des couleurs rouge/emerald détournées → cartouche à filets encre
  (grille `gap-px`), N° 01-04 en mono, chiffres navy.
- Catégories (6) : fin des six teintes (orange/bleu/violet/rouge/ambre/emerald) → symboles de
  légende hachurés brique R1-R6 (même `HATCH` que le teaser), titres encre, tirets brique.
  Champs `color`/`bg` supprimés des tableaux ; `Card` n'est plus importé côté FR.
- CTA « Signaler un point noir » : fin du `rounded-3xl` à dégradé rouge → feuillet topo à double
  cadre, icône sur `.plaque.plaque-small`, bouton contour brique (plein au survol).
- Non touché : copie, liens, données, calcul de vigilance, `ContributionStats`, `CommentSection`.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright `/red-flags` et `/en/red-flags` à 1440 et 390 px, `scrollWidth` =
viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. `components/ContributionStats.tsx` (vu sur /red-flags) — bouton plein `red-500`, tuiles d'emojis
   🔊💧🚨🏗️🌊, cartes `rounded-2xl` ombrées : légende + plaque.
2. Pages thème `RedFlagThemePage` (`/red-flags/villes-*`, 43 pages) — à inspecter dans la foulée.
3. Section commentaires des guides — erreur en `red-50`, à inspecter.

## 2026-10-20 ~23:00 UTC — `components/ContributionStats.tsx` (bloc « La communauté en action » de `/red-flags`)

**Surface** : le bloc couverture + catégories surveillées du hub `/red-flags`, dernier îlot SaaS de la page.

**Changé**
- Fin du `glass`, des cartes `rounded-2xl`/`rounded-xl` translucides et du bouton plein `red-500`.
- Couverture : fiche papier à filet pointillé sous le titre, compteurs en cartouche à filets encre
  (`gap-px`, N° 01-04 mono, chiffres navy — même grammaire que les compteurs du hub), libellés en
  `text-secondary` (contraste AA). CTA « Signaler un point noir » en contour brique, plein au survol,
  flèche lucide.
- Catégories : emojis 🔊💧🌫️🚨🏗️🌊 remplacés par des symboles de légende hachurés brique (icônes
  lucide, même `HATCH` que les R1-R6 du hub et le teaser), repère mono C1-C6, liste `<ul>` sans
  sous-cartes, sources sous filet pointillé.
- Non touché : copie (libellés, descriptions, sources), compteurs, lien.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright `/red-flags` à 1440 et 390 px, `scrollWidth` = viewport.
`npm run build` non lancé.

**Prochaines surfaces candidates**
1. Pages thème `RedFlagThemePage` (`/red-flags/villes-*`, 43 pages) — à inspecter.
2. Section commentaires des guides — erreur en `red-50`, à inspecter.
3. Hero home — pastille « ✨ On en parle » et puces de villes arrondies : fiche/plaque.

## 2026-10-21 ~03:00 UTC — pages thème `components/RedFlagThemePage.tsx` (`/red-flags/villes-*`, 43 pages FR)

**Surface** : le gabarit partagé des 43 classements thématiques Red Flag, dans la continuité du hub.

**Changé**
- En-tête : fin de l'`AmbientBackground`, du badge arrondi « ← Red Flags » et du gros emoji décoratif.
  Papier `.topo-bg` sous voile `bg-canvas/80` (comme le hub), lien retour mono brique souligné +
  repère « Feuille NN / 43 » (même numérotation que les vignettes du hub), H1 aligné à gauche.
- « Ce que disent les chiffres » : encart de légende à filet brique gauche, titre en sur-titre mono.
- Classement : fin des `Card` empilées → registre à filets pointillés dans une seule fiche papier,
  rang « N° 01 » en mono, lien « Fiche X » souligné brique + flèche lucide. **La pastille de gravité
  garde ses teintes rouge/orange/ambre** (elle encode un niveau), angles nets + chiffres mono.
- Méthodologie : note de bas de carte, cadre pointillé sur papier.
- « Autres red flags » : vignettes « Feuille NN / 43 » identiques au hub, emojis retirés, survol brique.
- Non touché : copie, JSON-LD, légende de convention des scores, `CommentSection`, données.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright `/red-flags/villes-sans-enfants` à 1440 et 390 px, `scrollWidth` =
viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Jumelle EN `app/[locale]/red-flags/themes/[slug]/page.tsx` — même gabarit à aligner.
2. Fiches red-flag par ville (`/red-flags/<ville>`) — à inspecter.
3. Section commentaires (`CommentSection`) — erreur en `red-50`, cartes arrondies : à inspecter.

## 2026-10-21 ~11:00 UTC — jumelle EN des pages thème `app/[locale]/red-flags/themes/[slug]/page.tsx`

**Surface** : les pages thème Red Flag de bestcitiesinfrance.com (sélection `EN_THEMES`), alignées
sur le gabarit FR `RedFlagThemePage` livré au run de 03:00.

**Changé**
- En-tête : fin du lien « ← Red Flags » gris et du gros emoji centré → papier `.topo-bg` sous voile
  `bg-canvas/80`, lien retour mono brique souligné + flèche lucide, repère « Sheet NN / N »
  (numérotation dans l'ordre de `EN_THEMES`), H1 aligné à gauche.
- « What the data shows » : encart de légende à filet brique gauche, sur-titre mono.
- Classement : fin des cartes `rounded-2xl` empilées et du « #N » → registre à filets pointillés
  dans une fiche papier, rang « No. 01 » mono, liens « profile » souligné brique et « Red flag
  report » pointillé avec flèches lucide. Pastille de gravité : teintes de niveau conservées, angles
  nets, chiffres mono (identique au FR).
- Méthodologie : note de bas de carte, cadre pointillé sur papier.
- « Other red flag themes » : vignettes « Sheet NN » sans emoji, survol brique ; lien « All red-flag
  reports » en mono brique (fin de l'icône `AlertTriangle` en ligne).
- Non touché : textes `EN_THEMES` (le champ `emoji` reste dans les données, non rendu), JSON-LD,
  légende de convention, liens.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright `/en/red-flags/themes/buyers-remorse` à 1440 et 390 px.
`npm run build` non lancé.

**Prochaines surfaces candidates**
1. Fiches red-flag par ville (`/red-flags/<ville>` FR + EN) — à inspecter.
2. Section commentaires (`CommentSection`) — erreur en `red-50`, cartes arrondies : à inspecter.
3. Hero home — pastille « ✨ On en parle » et puces de villes arrondies : fiche/plaque.

## 2026-10-21 ~16:00 UTC — fiches red-flag par ville `app/red-flags/[slug]/page.tsx` (540 pages FR)

**Surface** : la fiche « Red Flags de [ville] », gabarit unique des 540 villes, dans la continuité du
hub et des feuilles thème.

**Changé**
- En-tête : fin de l'`AmbientBackground`, du badge arrondi rouge `AlertTriangle` et du nom de ville
  en `gradient-text-anim` italique → papier `.topo-bg` voilé, lien retour mono brique + repère
  « Fiche ville · Données 2026 », **nom de ville sur `.plaque`** (nom de lieu, usage prévu).
- Indice de vigilance : fin du `glass` → cartouche à double filet, sur-titre mono brique ; la bande
  des 9 carrés de niveau devient une `<ol>` légendée (N° 01-09 + libellé `sr-only`).
- Drapeaux : fin des 9 cartes teintées `backdrop-blur` → planche à filets `gap-px` dans une fiche,
  symboles lucide hachurés brique (même trame que R1-R6/C1-C6), repère mono, pastille de niveau
  angles nets ; la 9ᵉ case prend les deux colonnes (plus de trou). Sources sous filet pointillé.
- **Les teintes rouge→émeraude encodent le niveau de risque et sont gardées**, passées en 700 sur
  100 (`chip`) pour tenir l'AA en 10-11 px ; verdict de vigilance en 700.
- Encart canicule : fin du `red-50` et de l'emoji 🥵 → encart à filet brique gauche + flèche.
- Méthode en note pointillée, profils proches en vignettes (département mono brique), renvois de bas
  de page en liens soulignés brique au lieu de pilules.
- Correctif au passage : SWC avalait l'espace avant « figure parmi » et avant les « — » des
  `<strong>` de la méthode (« Maronifigure », « uniquement— ») ; espaces explicites `{" "}`.
- Non touché : calcul des drapeaux, copie, JSON-LD, métadonnées.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + Playwright (headless_shell 1194) `/red-flags/saint-laurent-du-maroni` à 1440 et
390 px, `scrollWidth` = viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Jumelle EN des fiches ville (`app/[locale]/cities/[slug]/red-flags` ou équivalent) — à localiser et aligner.
2. Section commentaires (`CommentSection`) — erreur en `red-50`, cartes arrondies : à inspecter.
3. Hero home — pastille « ✨ On en parle » et puces de villes arrondies : fiche/plaque.

## 2026-10-21 ~23:00 UTC — jumelle EN des fiches red-flag par ville `app/[locale]/red-flags/[slug]/page.tsx` (540 pages EN)

**Surface** : « Red flags for [city] » sur bestcitiesinfrance.com, aligné sur le gabarit FR livré à 16:00.

**Changé**
- En-tête : fin du fil d'Ariane gris et du badge arrondi rouge `AlertTriangle` → papier `.topo-bg`
  voilé, lien retour mono brique + « City report · 2026 data », **nom de ville sur `.plaque`**.
- Indice de vigilance : cartouche à double filet, sur-titre mono brique, bande des 9 niveaux en
  `<ol>` légendée (01-09 + libellé `sr-only`).
- Drapeaux : fin des cartes `rounded-2xl` teintées → planche à filets `gap-px`, symboles lucide
  hachurés brique, repère mono, pastille de niveau angles nets ; 9ᵉ case sur deux colonnes.
- Teintes de niveau conservées (elles encodent le risque), passées en 700 sur 100 comme le FR —
  verdict de vigilance compris (était en 600, sous l'AA).
- Méthode en note pointillée, profils proches en vignettes (département mono brique), renvois en
  liens soulignés brique au lieu des pilules `rounded-xl`.
- Non touché : calcul des drapeaux, copie, JSON-LD, métadonnées.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 0 erreur.
Captures `next dev` + playwright-core (headless_shell 1194, installé dans le scratchpad — playwright
n'est pas dans `node_modules`) `/en/red-flags/saint-laurent-du-maroni` à 1440 et 390 px,
`scrollWidth` = viewport. `npm run build` non lancé. ⚠️ Arrêter `next dev` par `pkill -f`/`pgrep -f`
sur un motif présent dans la commande elle-même tue le shell (exit 144) : viser le PID du port.

**Prochaines surfaces candidates**
1. Section commentaires (`CommentSection`) — erreur en `red-50`, cartes arrondies : à inspecter.
2. Hero home — pastille « ✨ On en parle » et puces de villes arrondies : fiche/plaque.
3. `FeedbackWidget` (sur toutes les sous-pages ville) — à inspecter.

## 2026-10-22 ~03:00 UTC — section commentaires `components/CommentSection.tsx` (+ `ContributorBadge`)

**Surface** : le bloc « Discussions » partagé — fiches ville (FR/EN), guides, classements, comparateur,
red flags, contact. Un composant, des milliers de pages.

**Changé**
- En-tête : fin du sur-titre emoji « 💬 Communauté » → mono brique « Communauté · registre », titre sur
  filet encre, compteur en mono.
- Formulaire : fin du `glass` arrondi → cartouche à double filet (même trame que l'indice de vigilance),
  repère « Nouvelle entrée », champs papier angles nets, pied sous filet pointillé.
- Notes d'état : erreur `red-50`/`red-700` → filet brique gauche sur papier ; succès et abonnement
  `emerald` → filet navy (le vert est réservé aux paliers) ; encart abonnement sans dégradé ni 📬.
- Étoiles de note utilisateur : `amber` (palier) → brique ; `aria-pressed` + libellé « N sur 5 ».
- Liste : cartes arrondies → registre `<ol>` à filets, entrées numérotées « N° 02 », initiale dans un
  repère carré navy au lieu des avatars aux 6 teintes de score ; état vide sans emoji 🙊.
- `ContributorBadge` (aussi utilisé par `QASection`) : bandeau émeraude à confettis multicolores →
  tampon « Reçu » encre navy ; **devient bilingue** (`locale`), il affichait du français sur l'EN ;
  `prefers-reduced-motion` respecté ; l'effet `setState` (erreur lint préexistante) remplacé par un
  ajustement d'état au rendu.
- Non touché : logique d'envoi, API, honeypot, copie.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 3
fichiers : 0 erreur (1 de moins). Captures `next dev` + playwright-core `/guides/10-choses-a-faire-a-lyon-2026`
à 1440 et 390 px (API commentaires simulée par `page.route`), `scrollWidth` = viewport. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. `QASection` (questions par ville) — cartes arrondies, erreur `red-50`, avatars aux teintes de score : même traitement.
2. Hero home — pastille « ✨ On en parle » et puces de villes arrondies : fiche/plaque.
3. `FeedbackWidget` (sur toutes les sous-pages ville) — à inspecter.

## 2026-10-22 ~16:00 UTC — Navbar `components/Navbar.tsx` (toutes les pages, FR + EN) — passage « Couleurs »

**Surface** : barre du haut, méga-menu desktop, barre du bas téléphone et tiroir mobile. Première passe
de la routine sous l'identité « Couleurs » (727f5ab / d0121c3) : les entrées précédentes de ce journal
(brique, plaque, registre) décrivent l'identité abandonnée.

**Changé**
- Barre du haut : fin du blanc translucide → lavis indigo → rose → cyan sous le flou (`.nav-couleurs`,
  `.nav-couleurs-scrolled`), filet vif de 3 px en tête (`.nav-rule`), ombre indigo.
- Marque : « Idéale » / « CitiesInFrance » en `.gradient-text`.
- Liens : actif sur pastille blanche + soulignement dégradé indigo → rose ; survol teinté.
- City Match : fin de la `.plaque` → bouton pilule dégradé (`.btn-couleurs`, blanc sur #4338CA → #DB2777).
- Méga-menu : chaque colonne sur sa bande (indigo, rose, ciel, aqua) avec pastille lettrée de couleur ;
  bandeau d'appel en `--band-bold` (texte blanc) avec bouton blanc.
- Barre du bas : même lavis, icône active dans une pastille blanche, bouton Menu dégradé.
- Tiroir : dégradé lilas en tête + filet vif, puces arrondies, CTA dégradé.
- `.nav-rule` ne pose pas de `position` (elle aurait écrasé `sticky`/`fixed`, couche non-utilitaire).
- Non touché : liens, logique, copie.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` : 1 erreur
préexistante (`set-state-in-effect`, ligne « Close mega-menu on route change »), aucune ajoutée. Captures
`next dev` + playwright-core (scratchpad) `/villes/lyon` à 1440 (+ méga-menu) et 390 px (+ tiroir),
`scrollWidth` = viewport. `npm run build` non lancé. Astuce : fermer le bandeau cookies (« Non merci »)
avant de cliquer le Menu mobile, il intercepte le clic.

**Prochaines surfaces candidates**
1. `CityProfile.tsx` — fiche ville : découper les blocs en bandes distinctes (forte audience).
2. Bandeau cookies (`CookieBanner`) — encore en « petite note » plaque/serif de l'ancienne identité.
3. Cartes héritées `RankingPreview` / `ProfileQuickAccess` / `GuidesTeaser` (feuille / plaque).

## 2026-10-24 ~11:00 UTC — fiche ville `app/villes/[slug]/CityProfile.tsx` (540 FR + 540 EN) — bandes « Couleurs »

**Surface** : la fiche ville, page la plus visitée. Avant : un seul grand bloc canvas sous le hero, puis
discussions / FAQ / actu / guides tous sur blanc avec filets gris.

**Changé**
- Barre d'onglets collante : blanc translucide + ombre indigo ; onglet actif sur pastille `--band-indigo`
  soulignée rose, survol lilas.
- Zone de contenu (panneaux) : `band band-indigo`.
- « Données & analyse » : sa propre bande ciel (`band-sky`), pleine largeur dans la grille.
- « Explorer [ville] en détail » : bande rose (`band-pink`), titre passé en `font-display` ; colle au bloc
  suivant (`-mb-10`) seulement une fois hydraté sur l'onglet vue d'ensemble — sans JS tous les panneaux
  sont visibles et la marge négative aurait recouvert le suivant.
- Discussions : `band-aqua` ; FAQ : `band-lilac`, accordéons en cartes blanches à ombre indigo, filet
  indigo à gauche quand ouvert, survol indigo pâle, titre `font-display`.
- Barre « Comparer avec » : `band-white`, puces indigo pâle → pleines au survol.
- `CityNewsSection` (`band-indigo`) et `CityGuidesList` (`band-sky`) : fin du blanc forcé (seules ces deux
  pages ville les utilisent).
- Séquence : aurore → indigo → ciel → rose → aqua → lilas → blanc → indigo → ciel ; jamais deux voisines
  identiques. Non touché : données, logique, copie.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 3
fichiers : 1 erreur préexistante (`set-state-in-effect`, l. ~97), aucune ajoutée. Captures dev server +
playwright `/villes/lyon` à 1440 et 390 px, `scrollWidth` = viewport. `npm run build` non lancé.
Astuce : ne pas tuer le serveur avec `pkill -f` sur un motif contenu dans la commande elle-même (tue le shell).

**Prochaines surfaces candidates**
1. Cartes internes de la fiche (`Card` « card-sheen », cartes de sous-pages) : en-têtes `.grad-head-*` ?
2. Bandeau cookies `components/CookieConsent.tsx` — encore en « petite note » plaque/topo/filets.
3. Cartes héritées `RankingPreview` / `ProfileQuickAccess` / `GuidesTeaser` (feuille / plaque).

## 2026-10-25 ~11:00 UTC — bandeau cookies `components/CookieConsent.tsx` (toutes les pages, FR + EN) — « Couleurs »

**Surface** : le bandeau de consentement, première chose vue par chaque nouveau visiteur. Avant : « bout de
carte » de l'identité rejetée (papier, double filet encre, bande `.topo-bg`, pointillés, `.plaque`, mono
« N° 01 », légère rotation).

**Changé**
- Carte blanche arrondie (2xl), anneau indigo pâle, ombre indigo.
- En-tête en `--band-bold` (indigo → violet → rose, texte blanc) : sur-titre, titre `font-display`,
  médaillon blanc 🍪, bouton fermer blanc.
- « Ça me va » en `.btn-couleurs` pilule ; « Non merci » en pilule indigo pâle (`--accent-soft`, texte
  `--accent-hover`) : refus toujours aussi visible que l'acceptation.
- Pastille aqua « GA4 · consentement » (#0E7490 sur `--band-aqua`), lien détail indigo souligné rose.
- Animation d'entrée sans rotation (translate + scale), `prefers-reduced-motion` respecté.
- Retirés : `.topo-bg`, `.plaque`, pointillés, mention « N° 01 » (décor). Copie, logique, gtag inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur.
Captures `next dev` + playwright `/villes/lyon` 1440 et 390 px, `scrollWidth` = viewport. `npm run build`
non lancé. ⚠️ Environnement : `npm ci` n'installe que `@next/swc-linux-x64-musl` (inutilisable) →
`npm i --no-save @next/swc-linux-x64-gnu@16.2.9` avant `next dev`. `/a-propos` plante en dev
(route `[locale]`), prendre `/villes/lyon`. Et toujours pas de `pkill -f` (il a encore tué le shell).

**Prochaines surfaces candidates**
1. Cartes héritées `RankingPreview` / `ProfileQuickAccess` / `GuidesTeaser` (feuille / plaque).
2. Cartes internes de la fiche ville (`Card` « card-sheen ») : en-têtes `.grad-head-*` ?
3. Gabarits de sous-pages ville (ex. `climat`) : découper le gros bloc en bandes.

## 2026-10-25 ~16:00 UTC — cartes héritées de l'accueil : `ProfileQuickAccess`, `RankingPreview`, `GuidesTeaser` (FR + EN)

**Surface** : les trois blocs « feuille / plaque » de la page d'accueil (FR `/` et EN `/`).

**Changé**
- `ProfileQuickAccess` (le plus daté) : cartes blanches arrondies (2xl), anneau indigo pâle, ombre indigo,
  survol levé à ombre rose ; tuile d'icône en dégradé `.grad-head-N` (rotation par index, icône blanche) au
  lieu de la `.plaque` ; compteur « 01 / 07 » en pastille indigo ; N°1 en libellé rose + ville en pilule
  indigo (fin de la `plaque-small`). Carte « Cadre de vie — méga-index » : fin du `.topo-bg` papier,
  passée en tuile vive `grad-head-5` (texte blanc), la seule de la grille. Libellé « légendes » → « profils ».
- `RankingPreview` : sur-titre « Classements 2026 · 19 feuilles » → « 2026 · 19 classements » ; filets
  pointillés → pleins ; commentaires « Carte & plaque » réécrits.
- `GuidesTeaser` : pointillés → filet plein. Les trois en-têtes de section perdent le filet gris de tête
  (`border-t pt-6`, vestige de feuille de carte).
- Non touché : liens, données, copie éditoriale.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur sur les
3 fichiers. Captures `next dev` + playwright `/` à 1440 et 390 px, `scrollWidth` = viewport. Contrastes :
rose #DB2777 sur blanc 4,6:1, indigo #4338CA sur `--band-indigo` 6,5:1. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Cartes internes de la fiche ville (`Card` « card-sheen ») : en-têtes `.grad-head-*` ?
2. Gabarits de sous-pages ville (ex. `climat`) : découper le gros bloc en bandes.
3. Hub `/classements` : cartes de classement, vestiges plaque / pointillés (`grep -rn "border-dashed\|plaque\|topo-bg" app components`).

## 2026-10-25 ~23:00 UTC — hub `/classements` (FR) + `/rankings` (EN) + `ClassementsJumpNav` — « Couleurs »

**Surface** : l'index des 19 classements, un des hubs les plus visités. Avant : 19 sections posées sur le fond
de page sans bande, tuiles d'icône `.plaque`, filet gris de « feuille », sur-titre « 19 feuilles » ; EN en
cartes à plaque numérotée.

**Changé**
- FR : hero en `.bg-aurora` + pastille « Édition 2026 · 19 classements » ; chaque catégorie devient une
  bande pleine largeur en rotation `band-indigo → pink → sky → aqua → lilac` (jamais deux voisines
  identiques), tuile d'icône dégradée `.grad-head-N` (rotation par index), libellé « Classement NN / 19 » en
  pastille blanche, « N°1 ville » en pilule rose, « Classement complet » en pilule `.btn-couleurs`
  (desktop et mobile). Filet de feuille retiré.
- Barre de raccourcis sticky : verre teinté `nav-couleurs-scrolled`, chip active en `.btn-couleurs`,
  chips blanches. ⚠️ Fond et box-shadow neutralisés **en style inline** : la règle `:where(main > section)`
  est hors `@layer`, donc elle bat les utilitaires Tailwind (`bg-transparent`, `shadow-none`) malgré sa
  spécificité nulle — sans ça la section sticky peignait une bande ciel pleine largeur par-dessus le contenu.
- EN : hero aurora, grille sur `band-indigo`, cartes blanches à ombre indigo (survol rose), numéro en tuile
  `.grad-head-N` au lieu de la plaque. Copie et données inchangées.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur sur les
3 fichiers. Captures `next dev` + playwright `/classements` 1440 et 390 px, `scrollWidth` = viewport.
EN non capturé (route `[locale]` en dev). L'avertissement d'hydratation vu en dev vient du script de capture
qui force l'opacité des `ScrollReveal`, pas du code. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Pages de détail `app/classements/[slug]` + `app/[locale]/rankings/[slug]` (plaques encore présentes).
2. Hubs Red Flags `app/red-flags/page.tsx` + `[locale]/red-flags` (plaque / topo-bg).
3. Cartes internes de la fiche ville (`Card` « card-sheen ») / gabarits de sous-pages ville en bandes.

## 2026-10-25 ~23:00 UTC (run suivant) — pages de détail `/classements/[slug]` (FR) + `/rankings/[slug]` (EN)

**Surface** : les 19 pages de classement × 2 locales (gabarit unique). Avant : hero sans fond propre avec
plaque émaillée « N°02 », tout le corps (podium, tableau, barre latérale) posé sur le fond de page,
tableau gris, CTA en carte pâle, commentaires et feedback sans bande.

**Changé**
- FR : hero `.bg-aurora`, tuile numérotée dégradée `.grad-head-N` (rotation par n° de classement, même
  logique que le hub) au lieu de la plaque, pastille blanche « Classement NN / 19 · Édition 2026 ». Corps
  dans une bande `band-indigo` ; titres Top 3 / Classement complet précédés d'une pastille rose / indigo ;
  tableau en carte blanche à ombre indigo, ligne d'en-tête en dégradé `grad-head-0` (libellés blancs), rangs
  1-3 en pastille indigo, lignes du top 3 légèrement teintées, lignes repliées (`RankingTableTail`) en blanc.
  CTA quiz devenu le seul bloc `band-bold` de la page (bouton pilule blanc). Commentaires en `band-pink`,
  feedback en `band-white`. Couleurs de score inchangées.
- EN : hero aurora pleine largeur + même tuile et pastille ; top 30 sur `band-indigo` en cartes blanches à
  ombre indigo (survol rose), rang en pilule indigo ; méthodologie sur `band-pink` en cartes blanches.
- Copie, données, liens : inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur sur les
3 fichiers. Captures `next dev` + playwright `/classements/famille` à 1440 et 390 px, `scrollWidth` =
viewport. EN non capturé (route `[locale]` en dev). `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Hubs Red Flags `app/red-flags/page.tsx` + `[locale]/red-flags` (plaque / topo-bg).
2. Cartes internes de la fiche ville (`Card` « card-sheen ») / gabarits de sous-pages ville en bandes (ex. `climat`).
3. `app/guides/[slug]` (gabarit guide : en-tête, sommaire, encadrés).

## 2026-10-26 ~03:00 UTC — hubs Red Flags `/red-flags` (FR) + `/red-flags` (EN) + `ContributionStats`

**Surface** : le hub Red Flags des deux locales et le composant partagé `ContributionStats` (aussi monté sur
les fiches `/red-flags/[slug]` des deux locales). Avant : hero `topo-bg` à voile papier, tout le corps sur le
fond de page dans un seul conteneur, symboles hachurés brique, plaque émaillée, filets pointillés, CTA en
cadre topo.

**Changé**
- Hero `.bg-aurora`, sur-titre en pastille blanche, chute du titre en `.gradient-text`.
- Une bande par section, jamais deux voisines identiques — FR : thèmes `band-indigo` → fiches `band-pink` →
  chiffres + catégories `band-sky` → communauté `band-aqua` → CTA `band-bold` (seul bloc vif, bouton pilule
  blanc) → « Pour aller plus loin » `band-lilac` → commentaires + feedback `band-white`. EN : fiches
  `band-pink` → chiffres + catégories `band-sky` → CTA `band-bold`.
- Cartes blanches à ombre indigo ; numéros en pilules ; chiffres clés à en-tête `.grad-head-N` ; icônes de
  catégorie en tuiles dégradées `.grad-head-N` (fin du `HATCH`) ; puces rondes roses ; « Toutes les villes »
  en `.btn-couleurs`.
- Fiches par ville : carte blanche sous la teinte de vigilance (couleurs de palier inchangées, réservées).
- `ContributionStats` : cartes blanches, compteurs sur fond `--band-indigo`, tuiles d'icône dégradées,
  bouton `.btn-couleurs`, filets pleins.
- Copie, données, liens : inchangés.

**Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur sur les 3
fichiers. Captures `next dev` + playwright `/red-flags` 1440 et 390 px, `scrollWidth` = viewport. EN non
capturé (route `[locale]` en dev). Note outillage : tuer le serveur de dev avec un motif `-f` qui apparaît
dans la ligne de commande du shell tue le shell lui-même. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Pages thème `components/RedFlagThemePage.tsx` (43 en FR + la sélection EN) et fiches `/red-flags/[slug]`.
2. Cartes internes de la fiche ville (`Card` « card-sheen ») / gabarits de sous-pages ville en bandes (ex. `climat`).
3. `app/guides/[slug]` (gabarit guide : en-tête, sommaire, encadrés).

## 2026-10-26 ~11:00 UTC — pages thème Red Flags `RedFlagThemePage` (FR ×44) + `/red-flags/themes/[slug]` (EN)

**Surface** : le gabarit des pages thème Red Flags. FR : `components/RedFlagThemePage.tsx` (44 pages
`/red-flags/villes-*`). EN : `app/[locale]/red-flags/themes/[slug]/page.tsx`. Avant : en-tête en bande
rose unie (FR) ou papier topo voilé (EN), tout le corps dans un seul conteneur sur le fond de page, registre
à filets pointillés, encarts en cadre pointillé, numéros « Sheet NN » côté EN.

**Changé**
- Hero `.bg-aurora` ; lien retour et numéro « N° NN / 44 » en pastilles blanches.
- Bandes : réalité + classement `band-indigo` → méthodologie `band-sky` → autres thèmes `band-lilac` →
  commentaires `band-white` (FR). Pas de `band-bold` (aucun appel à l'action sur ce gabarit).
- « Ce que disent les chiffres » et « Méthodologie » en cartes blanches à en-tête dégradé (`grad-head-5`,
  `grad-head-0` : extrémités à ≥ 4,5:1 sur le blanc ; `grad-head-1/2` écartés pour contraste).
- Classement : une carte blanche à ombre indigo par ville, rang en pilule (indigo plein top 3, lavande
  ensuite), badge de gravité en pilule (couleurs de gravité inchangées). Fin des `divide-dashed`.
- Vignettes « autres thèmes » : cartes blanches, numéro en pilule rose. EN : « Sheet NN » → « No. NN »,
  lien « All red-flag reports » en `.btn-couleurs`, soulignement pointillé remplacé.
- h3 → h2 pour Méthodologie / Autres thèmes (sections de premier niveau). Copie et données inchangées.

**Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur sur les 2
fichiers. Captures `next dev` + playwright `/red-flags/villes-sans-enfants` 1440 et 390 px, `scrollWidth` =
viewport. EN non capturé (route `[locale]` en dev). `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Fiches ville `/red-flags/[slug]` (FR + EN `red-flags/[slug]`).
2. Cartes internes de la fiche ville (`Card` « card-sheen ») / gabarits de sous-pages ville en bandes (ex. `climat`).
3. `app/guides/[slug]` (gabarit guide : en-tête, sommaire, encadrés).

## 2026-10-26 ~16:00 UTC — fiches ville Red Flags `/red-flags/[slug]` (FR ×540) + EN `red-flags/[slug]`

**Surface** : les deux gabarits de fiche ville Red Flags (`app/red-flags/[slug]/page.tsx`,
`app/[locale]/red-flags/[slug]/page.tsx`). Avant : hero `topo-bg` voilé, nom de ville en `.plaque`, cartouche à
double filet, planche à filets `gap-px`, symboles hachurés (`HATCH`), méthode en cadre pointillé, vignettes
à filet pointillé, liens soulignés brique, tout sur le fond de page.

**Changé**
- Hero `.bg-aurora`, retour et sur-titre en pastilles blanches, nom de ville en `.gradient-text`.
- Bandes : vigilance `band-sky` → drapeaux `band-indigo` → (FR, si canicule) renvoi classement `band-pink`
  → méthode `band-aqua` → profils proches `band-lilac` → renvois + feedback `band-white`.
- Cartes blanches à ombre indigo partout ; icônes en tuiles `.grad-head-N` (fin du `HATCH`, constante et
  import `CSSProperties` supprimés) ; numéros en pilules ; badges de niveau en pilules (couleurs de niveau
  inchangées, réservées) ; pastilles de la bande de niveaux rondes ; méthode en carte à en-tête
  `grad-head-3` ; département en pilule rose ; renvois en pilules indigo.
- Copie, données, liens : inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur sur les
2 fichiers. Captures `next dev` + playwright `/red-flags/marseille` 1440 et 390 px, `scrollWidth` =
viewport. EN non capturé (route `[locale]` en dev). `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Cartes internes de la fiche ville (`Card` « card-sheen ») / gabarits de sous-pages ville en bandes (ex. `climat`).
2. `app/guides/[slug]` (gabarit guide : en-tête, sommaire, encadrés).
3. Page agenda `/villes/[slug]/agenda` + `components/CityEvents.tsx`.

## 2026-10-26 ~23:00 UTC — gabarit guide `app/guides/[slug]` (FR ×1 354) + EN `app/[locale]/guides/[slug]` (×1 173)

**Surface** : les deux gabarits de guide. Avant : hero blanc avec aurore à 40 %, tout le corps (sommaire,
sections, tags, suggestions, CTA, sidebar) sur le fond de page, cartes à filet gris, CTA en encart indigo pâle,
newsletter et commentaires sans fond propre.

**Changé**
- Hero `.bg-aurora` pleine ; fil d'Ariane en pastille blanche ; emoji en tuile `grad-head-5` ; titre en
  `.gradient-text` ; chiffres clés en cartes blanches avec icône en tuile dégradée (rotation `grad-head-N`).
- Bandes : corps (sommaire + sections + sidebar) `band-indigo` → suite de lecture (tags, « Lire ensuite »,
  précédent/suivant, CTA) `band-sky` → newsletter `band-aqua` → commentaires `band-pink` (FR ; l'EN n'a ni
  newsletter ni commentaires).
- Sommaire et cartes de sidebar (« Villes mentionnées », « Comparer ces villes ») à en-tête dégradé ; numéros
  de sommaire en pilules lavande ; numéros de section en pilules `grad-head-0/5` alternées ; sections en cartes
  blanches à ombre indigo ; « Lire ensuite » en h2 `.gradient-text`, cartes blanches à emoji en tuile dégradée ;
  tags en pilules blanches ; CTA City Match en `band-bold` (le seul de la page), bouton blanc ; « Tous les
  guides » en pilule blanche. Score EN de la sidebar garde sa couleur de palier.
- Tags / suggestions / précédent-suivant / CTA sortis de la colonne `<article>` vers leur propre bande (la
  sidebar sticky ne longe plus que les sections). Copie, données, liens, JSON-LD : inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur sur les 2
fichiers. Captures `next dev` + playwright `/guides/10-choses-a-faire-a-lyon-2026` 1440 et 390 px,
`scrollWidth` = viewport. EN non capturé (route `[locale]` en dev). `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Cartes internes de la fiche ville (`Card` « card-sheen ») / gabarits de sous-pages ville en bandes (ex. `climat`).
2. Page agenda `/villes/[slug]/agenda` + `components/CityEvents.tsx`.
3. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx` (encore à filet gris dans la sidebar).

## 2026-10-27 ~03:00 UTC — page agenda `/villes/[slug]/agenda` (FR ×540) + EN `/cities/[slug]/calendar` + `components/CityEvents.tsx`

**Surface** : les deux gabarits d'agenda ville et le bloc « À venir » partagé. Avant : hero blanc à filet,
tout le corps sur le fond de page, date d'événement en `.plaque` navy héritée, état vide en cadre pointillé,
badge Sport à filet, cartes à filet gris, et surtout des **pastilles de catégorie en ambre / émeraude /
violet**, couleurs réservées aux paliers de score.

**Changé**
- Hero `.bg-aurora`, icône en tuile `grad-head-5`, titre en `.gradient-text`.
- Bandes : « À venir » `band-sky` → « Au fil de l'année » `band-indigo` → méthode, renvois et discussion
  `band-white` (EN : le FeedbackWidget entre dans cette bande au lieu de flotter sur le fond de page).
- `CityEvents` : cartes blanches à ombre indigo, tuile de date dégradée en rotation (`grad-head-0/5/4`, fin
  de la plaque), état vide en carte blanche pleine (fin du pointillé), badge Sport en pilule rose, h2 en
  `.gradient-text`, `mb-12` retiré (la bande porte l'espacement).
- Mois en pilule dégradée en rotation ; catégories en pilules indigo / rose / aqua / ciel (fin de
  l'ambre, de l'émeraude et du violet) ; « Retour à la fiche » en pilule indigo. Copie, données, JSON-LD,
  ancres `#<id>` : inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 3
fichiers : 3 erreurs `no-unescaped-entities` préexistantes (identiques avant le changement), 0 ajoutée.
Captures `next dev` + playwright `/villes/orleans/agenda` 1440 et 390 px, `scrollWidth` = viewport. EN non
capturé (route `[locale]` en dev). `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Cartes internes de la fiche ville (`Card` « card-sheen ») / gabarits de sous-pages ville en bandes (ex. `climat`).
2. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx`.
3. `components/ReportCTA.tsx` (carte à filet gauche, utilisée partout) et `DiscussionCTA` / `FeedbackWidget`.

## 2026-10-27 ~11:00 UTC — blocs de fin de sous-page : `DiscussionCTA`, `ReportCTA`, `FeedbackWidget`

**Surface** : les trois composants partagés qui ferment toutes les sous-pages ville (via `DiscussionCTA`),
les hubs (FeedbackWidget) et l'agenda / Red Flags / pages politiques (ReportCTA) — 112 fichiers les rendent.
Avant : cartes à filet gris sur fond de page, encart ReportCTA à filet gauche « Carte & plaque » (commentaire
d'en-tête inclus), boutons à bordure grise, 👎 actif en rouge `--danger` (couleur de palier détournée).

**Changé**
- Les trois en cartes blanches à ombre indigo (même ombre que `CityEvents`), sans filet.
- `DiscussionCTA` : tuile d'icône `grad-head-0`, chevron dans une pastille lavande qui vire à l'indigo au survol,
  léger soulèvement au survol.
- `ReportCTA` (variante carte) : tuile `grad-head-1` (mégaphone) devant titre + texte ; bouton principal en
  pilule dégradée `grad-head-0`, secondaires en pilules lavande (`--band-indigo`, texte #3730A3) ; la variante
  `inline` hérite des mêmes boutons. Commentaire d'identité mis à jour.
- `FeedbackWidget` : question et boutons sur une ligne en desktop (retour à la ligne sur mobile), « Utile » en
  pilule lavande → `grad-head-0` actif, « À améliorer » en pilule rose → `grad-head-1` actif (fin du rouge),
  « Envoyer » en pilule dégradée, textarea à anneau indigo. Logique, honeypot, copie : inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` 0 erreur sur les 3
fichiers. Captures `next dev` + playwright `/villes/orleans/climat` 1440 et 390 px, `scrollWidth` = viewport.
EN non capturé (mêmes composants, prop `locale`). `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Gabarit de sous-page ville `climat` : les renvois de pied (« Profil complet », « Classement soleil ») sont
   encore des pastilles grises à filet, et les cartes « Villes au climat comparable » sont ternes.
2. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx`.
3. Cartes internes de la fiche ville (`Card` « card-sheen »).

## 2026-10-27 ~16:10 UTC — sous-page climat `/villes/[slug]/climat` (FR) + EN `/cities/[slug]/climate`

**Surface** : le gabarit climat. Avant : onze `<section>` à `pb-8` seul en rotation automatique (bandes collées
au contenu), cartes `glass` à filet, « Idéal / À éviter » en émeraude / orange, red flags en rouge / orange,
écarts à la moyenne en vert / orange (couleurs réservées aux paliers), villes comparables et renvois en pastilles
grises à filet. EN : cartes à filet sur fond de page, hero blanc.

**Changé**
- Hero `.bg-aurora` (FR et EN).
- FR en 4 bandes explicites : repères + diagramme + Idéal/À éviter en `band-indigo` ; red flags + rang soleil en
  `band-sky` ; villes comparables en `band-pink` (h2 `.gradient-text`, cartes blanches à ombre rose) ; renvois +
  DiscussionCTA en `band-white`.
- Cartes blanches à ombre indigo ; Idéal / À éviter à liseré haut indigo / rose ; red flags à tuile d'icône
  `grad-head-1` / `grad-head-2` ; écarts « vs moyenne FR » en indigo / rose ; renvois en pilules lavande.
- EN : stats + diagramme en `band-indigo`, « What it feels like » en `band-sky` (h2 dégradé, bouton `grad-head-0`,
  renvois en pilules), FeedbackWidget en `band-white`. La note nature garde sa couleur de palier. Copie, données,
  JSON-LD, liens : inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 2 fichiers :
1 erreur `no-unescaped-entities` préexistante côté EN, 0 ajoutée. Captures `next dev` + playwright
`/villes/nice/climat` 1440 et 390 px, `scrollWidth` = viewport. EN non capturé (route `[locale]` en dev).
`npm run build` non lancé.

**Prochaines surfaces candidates**
1. Autres sous-pages ville au même schéma `glass` + sections `pb-8` (`quartiers`, `transports`, `ecoles`).
2. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx`.
3. Cartes internes de la fiche ville (`Card` « card-sheen »).

## 2026-10-27 ~23:00 UTC — sous-page quartiers `/villes/[slug]/quartiers` (FR) + EN `/cities/[slug]/neighbourhoods`

**Surface** : le gabarit quartiers (540 villes × 2 locales). Avant : hero sur fond de page, fiches `Card` à filet,
puces de type en vert / violet / orange / ambre (couleurs de palier détournées), meilleure valeur du tableau en
émeraude, renvois en pastilles grises, encart « Passer Pro — 9,90 €/mois » (offre inexistante). EN : hero blanc
à filet, et **bug** : le JSX `<CityPhotoBand>` était collé à l'intérieur d'une chaîne gabarit, donc la page EN
affichait « {photo && ( <CityPhotoBand … /> )} » en texte brut dans le chapeau, sans photo.

**Changé**
- Hero `.bg-aurora` (FR et EN) ; EN : photo remise hors de la chaîne, sous le chapeau.
- Fiches quartier en `band-indigo`, cartes blanches à ombre indigo, tuile de score lavande, tags en pastilles
  ciel, lien Google Maps en pilule lavande, puces de type dans les familles indigo / bleu / cyan / rose / fuchsia.
- FR : tableau comparatif en `band-sky`, carte blanche à en-tête `grad-head-2`, meilleure note et loyer le plus bas
  marqués par une pastille lavande cerclée d'indigo (la couleur de palier du chiffre est conservée).
- FR : encart Pro supprimé (CLAUDE.md : retirer les teasers Premium) ; renvois en pilules + DiscussionCTA en
  `band-white`. EN : méthodologie à en-tête dégradé + DiscussionCTA en `band-white`.
- Données, copie, JSON-LD, liens : inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 2 fichiers :
0 problème (2 avertissements `Card` inutilisé en moins). Captures `next dev` + playwright `/villes/lyon/quartiers`
1440 et 390 px, `scrollWidth` = viewport. EN non capturé (route `[locale]` en dev). `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Autres sous-pages ville au schéma `Card`/`glass` + sections `pb-8` (`transports`, `ecoles`, `logement`).
2. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx`.
3. Cartes internes de la fiche ville (`Card` « card-sheen »).

## 2026-10-28 ~03:00 UTC — sous-page transports `/villes/[slug]/transports` (FR) + EN `/cities/[slug]/transport`

**Surface** : le gabarit transports (540 villes × 2 locales). Avant : hero sur fond de page, cartes `glass`, réseaux
« présents » en vert émeraude et écart à la moyenne en vert / orange (couleurs de palier détournées), badge
« Estimation » ambre, 6 cartes réseaux dans une grille à 5 colonnes (Vélo orphelin sur une 2e ligne), renvois en
pastilles grises à filet. EN : un seul bloc blanc.

**Changé**
- Hero `.bg-aurora` (FR et EN ; EN : nom de ville en `.gradient-text`).
- FR en 4 bandes : repères + réseaux en `band-indigo` (cartes blanches à ombre indigo, réseau présent cerclé
  d'indigo avec pastille lavande, absent en carte translucide, grille `sm:3 / lg:6` sans orphelin) ; trajet
  domicile-travail en `band-sky` (badge « Estimation » rose) ; villes comparables en `band-pink` (h2 dégradé,
  cartes blanches à ombre rose) ; renvois en pilules lavande + DiscussionCTA en `band-white`.
- Écart « vs moyenne FR » en indigo / rose.
- EN : « What the score includes » en carte blanche sur `band-indigo`, « Getting around » en `band-sky` (h2 dégradé,
  bouton `grad-head-0`, renvois en pilules), FeedbackWidget en `band-white`. Copie, données, JSON-LD, liens inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 2 fichiers :
1 erreur `no-unescaped-entities` préexistante côté EN (`{c.name}'s`), 0 ajoutée. Captures `next dev` + playwright
`/villes/lyon/transports` 1440 et 390 px, `scrollWidth` = viewport. EN non capturé. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Sous-pages `ecoles` et `logement` (même schéma `glass` + sections `pb-8`).
2. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx`.
3. Cartes internes de la fiche ville (`Card` « card-sheen »).

## 2026-10-28 ~11:00 UTC — sous-page écoles `/villes/[slug]/ecoles` (FR) + EN `/cities/[slug]/schools`

**Surface** : le gabarit écoles (540 villes × 2 locales). Avant : hero sur fond de page, cartes `glass`, écart à la
moyenne en vert / orange (couleurs de palier détournées), fiches établissements en bloc séparé, renvois en pastilles
grises à filet. EN : un seul bloc blanc.

**Changé**
- Hero `.bg-aurora` (FR et EN ; EN : nom de ville en `.gradient-text`).
- FR en 3 bandes : repères + « Établissements recensés » (nouveau h2) en `band-indigo`, cartes blanches à ombre
  indigo, sur-titres en indigo foncé ; villes comparables en `band-pink` (h2 dégradé, cartes à ombre rose) ;
  renvois en pilules lavande + MapsQuickSearch + DiscussionCTA en `band-white`.
- Écart « vs moyenne FR » en indigo / rose.
- EN : « How French schools work » en carte blanche sur `band-indigo`, « What the score reflects » en `band-sky`
  (h2 dégradé, bouton `grad-head-0`, renvois en pilules), Maps + FeedbackWidget en `band-white`. Copie, données,
  JSON-LD, liens inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 2 fichiers :
0 problème. Captures `next dev` + playwright `/villes/lyon/ecoles` 1440 et 390 px, `scrollWidth` = viewport.
EN non capturé. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Sous-page `logement` (même schéma `glass` + sections `pb-8`), puis `emploi` / `sante`.
2. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx`.
3. Cartes internes de la fiche ville (`Card` « card-sheen »).

## 2026-10-28 ~16:00 UTC — sous-page logement `/villes/[slug]/logement` (FR) + EN `/cities/[slug]/housing`

**Surface** : le gabarit logement (540 villes × 2 locales) + le composant partagé `PropertyPriceTable`. Avant : hero
blanc à filet, un seul conteneur de cartes à filet gris sur fond de page, icône d'alerte ambre (couleur de palier),
renvois en cartes grises.

**Changé**
- Hero `.bg-aurora`, icône dans une tuile `grad-head-0` (FR et EN).
- 4 bandes : marché locatif + prix DVF en `band-indigo` (cartes blanches à ombre indigo, `PropertyPriceTable` aligné) ;
  louer/acheter + loyers par quartier en `band-sky` (h2 dégradés, liens en pilules ; bande omise si aucun des deux
  blocs) ; conseils en `band-pink` (carte à ombre rose) ; « Aller plus loin » en tuiles lavande + DiscussionCTA /
  FeedbackWidget en `band-white`. EN : bouton retour en `grad-head-0`.
- Alerte « données non individualisées » en rose au lieu de l'ambre. Couleurs de palier de la tension et du score
  coût conservées (elles encodent une note). Copie, données, JSON-LD, liens inchangés.

**Contrôles** : `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 3 fichiers : 0 erreur
(1 avertissement préexistant `TENSION_LABEL` inutilisé). Captures `next dev` + playwright `/villes/lyon/logement`
1440 et 390 px, `scrollWidth` = viewport. EN non capturé. `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Sous-pages `emploi` / `sante` (même schéma).
2. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx`.
3. Sous-page `louer-ou-acheter` (liée depuis logement).

## 2026-10-28 ~23:00 UTC — sous-page emploi `/villes/[slug]/emploi` (FR) + EN `/cities/[slug]/employment`

**Surface** : le gabarit emploi (540 villes × 2 locales). Avant : un seul bloc sur fond de page, carte composite à
filet gauche coloré, méthodologie et renvois en `Card` grises, lien classement en texte. EN : trois blocs blancs à filet.

**Changé**
- Hero `.bg-aurora`, emoji 💼 dans une tuile `grad-head-0` (FR) ; EN : nom de ville en `.gradient-text`.
- FR en 3 bandes : score composite (carte blanche à ombre indigo, plus de filet gauche) + quatre dimensions en
  `band-indigo` ; méthodologie en `band-sky` (h2 dégradé, carte à ombre cyan) ; renvois en tuiles lavande, lien
  classement national en pilule, DiscussionCTA en `band-white`.
- Les fonds/couleurs de niveau des `JobBlock` (vert/ambre/orange/rouge) sont conservés : ils encodent un niveau.
- EN : dimensions en cartes blanches sur `band-indigo`, « How to read this » en `band-sky` (h2 dégradé, bouton
  `grad-head-0`, bouton secondaire en pilule blanche), FeedbackWidget en `band-white`. Copie, données, JSON-LD, liens inchangés.

**Contrôles** : `npm ci`, `npx tsc --noEmit` propre, `npm run integrity` vert, `npx eslint` sur les 2 fichiers :
0 problème. Captures `next dev` + playwright `/villes/lyon/emploi` 1440 et 390 px, `scrollWidth` = viewport.
EN non capturé (404 en dev, la réécriture EN n'existe que dans le Worker). `npm run build` non lancé.

**Prochaines surfaces candidates**
1. Sous-page `sante` (même schéma), puis `teletravail`.
2. Hub `/guides` (`GuidesGrid`, en-tête, filtres) et `components/GuideCard.tsx`.
3. Sous-page `louer-ou-acheter`.
