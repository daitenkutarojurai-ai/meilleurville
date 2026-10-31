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
 * Le FR n'est pas concerné : mavilleideale.fr a ses liens et son historique.
 * Rouvrir une famille = retirer sa ligne ici, rien d'autre.
 */
const EN_NOINDEX_PATTERNS: readonly RegExp[] = [
  // Les 42 sous-pages ville (24 314 URL). La fiche /cities/<slug> reste.
  /^\/cities\/[^/]+\/.+$/,
  // Synthèse d'une paire : redit la page /compare/<paire>.
  /^\/compare\/[^/]+\/synthesis$/,
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
