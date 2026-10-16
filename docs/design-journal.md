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
