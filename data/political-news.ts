// Actualité politique nationale et locale — fil de /presidentielle-2027,
// /orientation-politique et des pages /villes/[slug]/presidentielle-2027.
// Petit fichier, sûr côté client (aucun import).
//
// Tenu à jour par la routine `meilleurville-actu-politique` (2026-10-17) et
// par les signalements du formulaire de contact (sujet « Actu politique »).
// Règles, à ne pas assouplir :
//  - un fait par entrée, DATÉ (date de l'événement, pas de la mise en ligne) et
//    SOURCÉ (`sourceUrl` lisible, pas un chemin du dépôt) ;
//  - on résume avec nos mots, on ne recopie pas un article (droit voisin) ;
//  - aucun pronostic, aucun qualificatif partisan ; les chiffres sont ceux
//    publiés par la source, jamais arrondis à notre convenance ;
//  - `cities` ne porte que des slugs de `CITIES_SEED` (garde `politique` dans
//    `npm run integrity`) et seulement quand le fait concerne la commune ;
//  - `id` est stable (ancre `#<id>`), ne jamais renommer une entrée publiée ;
//  - ordre libre : les surfaces trient par date décroissante.

export type PoliticalNewsKind =
  | "sondage"
  | "candidature"
  | "calendrier"
  | "justice"
  | "budget"
  | "municipal"
  | "parlement";

export interface PoliticalNews {
  id: string;
  date: string; // YYYY-MM-DD
  kind: PoliticalNewsKind;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  /** Slugs de villes concernées (actualité locale). Vide = national. */
  cities?: string[];
}

export const POLITICAL_NEWS_KIND_LABEL: Record<PoliticalNewsKind, string> = {
  sondage: "Sondage",
  candidature: "Candidature",
  calendrier: "Calendrier",
  justice: "Justice",
  budget: "Budget",
  municipal: "Municipal",
  parlement: "Parlement",
};

export const POLITICAL_NEWS_AS_OF = "2026-10-21";

export const POLITICAL_NEWS: PoliticalNews[] = [
  {
    id: "opinionway-glucksmann-progresse-2026-10",
    date: "2026-10-14",
    kind: "sondage",
    title: "OpinionWay : Glucksmann progresse après la primaire, Le Pen toujours en tête",
    summary:
      "Enquête des 13 et 14 octobre : Marine Le Pen 35 %, Jean-Luc Mélenchon 15 %, Raphaël Glucksmann 13 % (jusqu'à 15 % selon l'hypothèse testée), Édouard Philippe 12 %. Premier sondage publié après sa victoire à la primaire.",
    source: "Euronews",
    sourceUrl:
      "https://fr.euronews.com/2026/10/16/presidentielle-2027-raphael-glucksmann-progresse-dans-les-sondages-apres-sa-victoire-a-la-",
  },
  {
    id: "primaire-gauche-glucksmann-2026-10-11",
    date: "2026-10-11",
    kind: "candidature",
    title: "Raphaël Glucksmann remporte la primaire de la gauche sociale-démocrate dès le 1er tour",
    summary:
      "66,17 % des voix, devant Olivier Faure (14,46 %), Ségolène Royal (7,62 %), Emmanuel Maurel (5,92 %) et Jérôme Guedj (5,83 %). 120 787 votants. Il portera la candidature du PS, de Place publique et de la GRS.",
    source: "Public Sénat",
    sourceUrl:
      "https://www.publicsenat.fr/actualites/politique/primaire-de-la-gauche-raphael-glucksmann-plie-le-match-et-remporte-le-scrutin-des-le-premier-tour-avec-66",
  },
  {
    id: "budget-2027-motion-rejet-ps-2026-10-13",
    date: "2026-10-13",
    kind: "budget",
    title: "Budget 2027 : la motion de rejet préalable du groupe socialiste n'est pas adoptée",
    summary:
      "L'Assemblée nationale a repoussé le 13 octobre, par 236 voix contre 149, la motion de rejet préalable déposée par les socialistes contre le projet de loi de finances 2027. Les groupes de gauche ont voté pour ; le bloc central, la Droite républicaine, LIOT, le groupe Ciotti et le RN ont voté contre. L'examen de la partie recettes a commencé le soir même.",
    source: "LCP – Assemblée nationale",
    sourceUrl:
      "https://lcp.fr/actualites/la-motion-de-rejet-des-socialistes-n-ayant-pas-ete-adoptee-l-examen-du-budget-2027-aura",
  },
  {
    id: "budget-2027-presente-2026-10-01",
    date: "2026-10-01",
    kind: "budget",
    title: "Budget 2027 : 5 % de déficit visé, 5,4 milliards d'effort demandés aux collectivités",
    summary:
      "Le gouvernement Lecornu vise un déficit public de 5 % en 2027 (après 5,4 %) et une dette à 121,7 % du PIB. Les pensions au-dessus de 1 260 € ne seraient plus indexées intégralement sur l'inflation. Les collectivités locales sont mises à contribution à hauteur de 5,4 milliards d'euros.",
    source: "France 24",
    sourceUrl:
      "https://www.france24.com/fr/france/20261001-budget-2027-le-gouvernement-d%C3%A9voile-son-projet-sous-la-pression-des-march%C3%A9s",
  },
  {
    id: "le-pen-appel-eligible-2026-07-07",
    date: "2026-07-07",
    kind: "justice",
    title: "Procès des assistants du RN : Marine Le Pen condamnée en appel mais éligible en 2027",
    summary:
      "La cour d'appel de Paris ramène l'inéligibilité à 45 mois dont 30 avec sursis : la part ferme (15 mois) étant déjà purgée, elle peut se présenter. Elle se déclare candidate et annonce un pourvoi en cassation.",
    source: "Toute l'Europe",
    sourceUrl:
      "https://www.touteleurope.eu/vie-politique-des-etats-membres/proces-des-assistants-du-rn-marine-le-pen-condamnee-en-appel-mais-eligible-a-l-election-presidentielle-2027/",
  },
  {
    id: "dates-presidentielle-fixees-2026-07",
    date: "2026-07-01",
    kind: "calendrier",
    title: "Les dates de la présidentielle sont fixées : 18 avril et 2 mai 2027",
    summary:
      "Premier tour le dimanche 18 avril 2027, second tour le dimanche 2 mai. En Guadeloupe, Martinique, Guyane, à Saint-Pierre-et-Miquelon, Saint-Barthélemy, Saint-Martin et en Polynésie française, on vote la veille (17 avril et 1er mai).",
    source: "Service-public.fr",
    sourceUrl: "https://www.service-public.gouv.fr/particuliers/actualites/A15053?lang=fr",
  },
  {
    id: "retailleau-candidat-lr-2026-04-19",
    date: "2026-04-19",
    kind: "candidature",
    title: "Bruno Retailleau désigné candidat des Républicains par les adhérents",
    summary:
      "Consultation en ligne : 73,8 % des votants approuvent la candidature du président du parti, sans primaire. Participation de 60 % (environ 46 000 votants sur 76 000 adhérents appelés).",
    source: "Public Sénat",
    sourceUrl:
      "https://www.publicsenat.fr/actualites/politique/presidentielle-bruno-retailleau-designe-candidat-par-les-adherents-lr",
  },
];

/** Échéances électorales. `rule` explique une date dérivée d'un texte. */
export interface ElectionDate {
  date: string; // YYYY-MM-DD
  label: string;
  detail: string;
  rule?: string;
}

export const ELECTION_CALENDAR: ElectionDate[] = [
  {
    date: "2027-03-12",
    label: "Fin des inscriptions sur les listes électorales",
    detail: "Dernier jour pour s'inscrire (ou signaler un déménagement) et voter au 1er tour, en mairie ou par courrier ; en ligne, jusqu'au mercredi 10 mars.",
    rule: "Code électoral : jusqu'au 6e vendredi précédant le scrutin (6e mercredi en ligne). Date calculée, à confirmer sur service-public.fr.",
  },
  {
    date: "2027-04-18",
    label: "1er tour de la présidentielle",
    detail: "Dimanche 18 avril 2027 (samedi 17 avril aux Antilles, en Guyane, à Saint-Pierre-et-Miquelon, Saint-Barthélemy, Saint-Martin et en Polynésie).",
  },
  {
    date: "2027-05-02",
    label: "2nd tour de la présidentielle",
    detail: "Dimanche 2 mai 2027 (samedi 1er mai dans les mêmes territoires).",
  },
];

export const FIRST_ROUND_DATE = "2027-04-18";
