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
