/**
 * Ce que mavilleideale.fr demande à Google d'indexer (2026-11-04).
 *
 * **Zéro import**, comme `lib/en-index-policy.ts` dont c'est le pendant : lu par
 * le Worker (`worker/index.ts`, en-tête `X-Robots-Tag`), par `app/sitemap.ts`
 * (les URL exclues n'y sont plus déclarées) et par `scripts/check-sitemap.mjs`.
 *
 * Pourquoi. Le 2026-10-31, le domaine EN a été sorti de son effondrement en
 * retirant de l'index ses pages gabarit ; le FR avait été laissé de côté
 * (« il a ses liens et son historique »). Audit du 2026-11-04, audience jugée
 * très faible par le propriétaire : le FR déclarait 32 654 URL pour ≈ 7
 * domaines référents, dont 23 720 sous-pages ville sur 40 gabarits. Mesure :
 * texte visible de `<main>`, chiffres et noms de ville masqués, Jaccard sur
 * des 5-grammes de mots, deux paires (Bayonne/Montauban, Rennes/Dijon). Les
 * familles ci-dessous dépassent 0,75 en moyenne — `securite`,
 * `services-publics`, `demographie` valent 1,00 sur les deux paires : la même
 * page, seuls les nombres changent.
 *
 * Exception volontaire : `/villes/<slug>/air` (0,86) reste indexée, c'est la
 * seule famille gabarit dont la Search Console a montré une traction réelle
 * (7 705 impressions, position ~9,5 — commentaire de son generateMetadata).
 * Restent aussi indexées les familles plus distinctes (climat, quartiers,
 * a-faire, logement, transports, écoles, profils, parcs, biodiversité, sport,
 * tension locative…), les fiches ville, guides, classements, régions,
 * départements, paires de comparaison et hubs.
 *
 * Les pages restent en ligne et liées (`noindex, follow`). Rouvrir une
 * famille = retirer son nom ici, rien d'autre. Ne pas en ajouter une sans la
 * mesurer de la même façon.
 */
const FR_NOINDEX_CITY_SUBPAGES = [
  "bruit",
  "securite",
  "sante",
  "emploi",
  "eau",
  "synthese",
  "vibe",
  "mentalite-locale",
  "saisons",
  "climat-2040",
  "empreinte",
  "risques",
  "velo",
  "demographie",
  "services-publics",
  "commerces",
  "statistiques",
  "agenda",
  "presidentielle-2027",
  "cout-de-la-vie",
] as const;

const FR_NOINDEX_PATTERNS: readonly RegExp[] = [
  new RegExp(`^/villes/[^/]+/(${FR_NOINDEX_CITY_SUBPAGES.join("|")})$`),
  // Synthèse d'une paire : redit /comparer/<paire> (0,90).
  /^\/comparer\/[^/]+\/synthese$/,
  // Une page par ville, même gabarit à 0,80-0,90.
  /^\/(gentrification|cout-menage|calculateur-cout-reel)\/[^/]+$/,
  // Widgets d'intégration, pas des pages d'atterrissage (0,87).
  /^\/badge\/[^/]+$/,
];

/** `true` si ce chemin FR (sans origine) ne doit pas être indexé. */
export function isFrNoindexPath(pathname: string): boolean {
  let p = pathname.replace(/\/+$/, "") || "/";
  try {
    p = decodeURIComponent(p);
  } catch {
    // chemin mal encodé : on le teste tel quel
  }
  return FR_NOINDEX_PATTERNS.some((re) => re.test(p));
}
