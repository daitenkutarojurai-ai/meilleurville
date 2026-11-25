/**
 * Ce que bestcitiesinfrance.com demande à Google d'indexer (2026-10-31).
 *
 * **Zéro import** : ce module est lu par le Worker (`worker/index.ts`, en-tête
 * `X-Robots-Tag`), par `app/sitemap.ts` (les URL exclues n'y sont plus
 * déclarées) et par `scripts/check-sitemap.mjs`. Une seule liste, trois
 * lecteurs : un chemin ne peut pas être à la fois `noindex` et déclaré.
 *
 * Pourquoi. Audit du 2026-10-31 : le sitemap EN déclarait 32 208 URL, dont
 * ≈ 28 500 pages gabarit par ville ou par paire — 120 à 500 mots, dont 70 à
 * 97 % identiques d'une ville à l'autre une fois les chiffres masqués
 * (`/cities/bayonne/noise` contre `/cities/montauban/noise` : 0,94). Le domaine
 * n'a aucun lien entrant hors mavilleideale.fr (46 sur 46, GSC 2026-08-11) :
 * Google n'a que le contenu pour juger le site, et il le juge à l'échelle du
 * domaine. Il a essayé le site de mi-mai à mi-juin puis l'a laissé tomber ;
 * au 2026-10-31 aucune page n'apparaît, même sur le nom de marque.
 *
 * Les pages restent en ligne et liées (`noindex, follow`) : elles servent le
 * visiteur et transmettent les liens, elles ne sont simplement plus
 * présentées comme des pages d'atterrissage. Restent indexables les fiches
 * ville, les 1 268 guides, les classements, régions, départements, paires de
 * comparaison et les hubs — ≈ 3 700 URL.
 *
 * Le FR a sa propre liste depuis le 2026-11-04 (`lib/fr-index-policy.ts`),
 * plus courte : familles mesurées une à une, seuil 0,75.
 *
 * Deuxième passe, 2026-11-25. Export Search Console du domaine (Web,
 * 2026-08-24 → 11-23) : 1 clic et 903 impressions en 90 jours, ≈ 10 par jour
 * depuis le 1er septembre, position médiane au-delà de 40. Rien ne remonte
 * trois semaines après la première passe. Mesure des 4 121 URL encore
 * déclarées (même méthode : texte de `<main>`, chiffres et noms masqués,
 * 5-grammes) : quatre familles dépassaient encore le seuil — `/compare/<paire>`
 * 0,85 à 1,00 sur 10 paires sur 11 (436 mots, le même texte partout, trios
 * compris : 0,88-0,93), `/leaving/<ville>` 1,00, `/living-on/<montant>` 0,93-0,98,
 * `/weekend-getaways/<ville>` 0,86-0,91. Les comparaisons étaient la famille la
 * plus vue (185 impressions, 0 clic, position ~60) : à cette profondeur, ce
 * n'est pas une traction. Elles restent indexées côté FR, où elles convertissent
 * (`docs/seo/strategie-audience.md`). Hubs `/compare`, `/living-on` et
 * `/weekend-getaways` inchangés. Sitemap EN 4 121 → ≈ 3 300 URL.
 *
 * Rouvrir une famille = retirer sa ligne ici, rien d'autre.
 */
const EN_NOINDEX_PATTERNS: readonly RegExp[] = [
  // Les 42 sous-pages ville (24 314 URL). La fiche /cities/<slug> reste.
  /^\/cities\/[^/]+\/.+$/,
  // Paires et trios (/compare/a-vs-b, a-vs-b-vs-c) et leur synthèse, qui redit
  // la paire. Le hub /compare reste.
  /^\/compare\/[^/]+(\/synthesis)?$/,
  // Une page par ville ou par budget, même texte à 0,86-1,00 (2026-11-25).
  /^\/(leaving|living-on|weekend-getaways)\/[^/]+$/,
  // Une page par ville, même gabarit à 91-97 %.
  /^\/(household-cost|gentrification|moving-from|tags)\/[^/]+$/,
  /^\/calculator\/real-cost\/[^/]+$/,
  /^\/departments\/[^/]+\/(tax|synthesis)$/,
  // /red-flags/<ville> ; les thèmes (/red-flags/themes/…) restent.
  /^\/red-flags\/(?!themes$)[^/]+$/,
  // /vacations/<ville> ; mois, profils, activités, régions restent.
  /^\/vacations\/[^/]+$/,
];

/** `true` si ce chemin EN (sans origine) ne doit pas être indexé. */
export function isEnNoindexPath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  return EN_NOINDEX_PATTERNS.some((re) => re.test(p));
}
