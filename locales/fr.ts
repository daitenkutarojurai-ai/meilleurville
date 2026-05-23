// French UI copy. Keys must stay in sync with locales/en.ts (enforced by
// lib/i18n.ts's `TranslationKey` type — adding a key only in one file is a
// TypeScript error).
//
// We strip the `as const` (would make each value a literal string type, and
// the EN dictionary couldn't satisfy that) and type the dict explicitly so
// values are widened to `string`. Keys are still strictly enforced.

const _fr = {
  // Navigation
  "nav.home": "Accueil",
  "nav.cities": "Villes",
  "nav.rankings": "Classements",
  "nav.guides": "Guides",
  "nav.compare": "Comparer",
  "nav.quiz": "Quiz",
  "nav.map": "Carte",
  "nav.about": "À propos",
  "nav.contact": "Contact",

  // Home
  "home.hero.title": "Trouvez la ville qui vous ressemble",
  "home.hero.subtitle":
    "IA + vraies expériences + données locales. Classements, avis d'habitants, quiz de matching.",
  "home.hero.ctaQuiz": "Faire le quiz",
  "home.hero.ctaCities": "Voir toutes les villes",
  "home.stats.cities": "villes profilées",
  "home.stats.guides": "guides éditoriaux",
  "home.stats.rankings": "classements thématiques",

  // Cities index
  "cities.title": "Explorer toutes les villes françaises",
  "cities.intro":
    "Scores calibrés sur Insee + Ministère Intérieur, avis d'habitants, données locales. Filtrez, triez, comparez — sans bullshit.",

  // City page
  "city.score.global": "Score qualité de vie",
  "city.score.life": "Qualité de vie",
  "city.score.transport": "Transports",
  "city.score.nature": "Nature",
  "city.score.cost": "Coût de la vie",
  "city.score.safety": "Sécurité",
  "city.score.culture": "Culture",
  "city.score.remoteWork": "Télétravail",
  "city.score.schools": "Écoles",
  "city.population": "Habitants",
  "city.department": "Département",
  "city.region": "Région",
  "city.sunshine": "jours de soleil/an",
  "city.relatedCities": "Villes similaires",
  "city.guides": "Guides liés",

  // Rankings
  "rankings.title": "Classements des villes françaises",
  "rankings.intro":
    "13 classements thématiques, mis à jour à chaque cycle de calibration des scores.",

  // Quiz
  "quiz.title": "Quelle ville est faite pour vous ?",
  "quiz.intro": "Quelques minutes, 10 questions, et on vous propose 5 villes adaptées.",
  "quiz.start": "Commencer",
  "quiz.next": "Suivant",
  "quiz.previous": "Précédent",
  "quiz.results": "Vos résultats",

  // Footer
  "footer.tagline": "MaVilleIdeal — choisir où vivre en France.",
  "footer.copyright": "Tous droits réservés.",
  "footer.legal": "Mentions légales",
  "footer.privacy": "Confidentialité",
  "footer.terms": "CGU",
};

export type TranslationKey = keyof typeof _fr;
export type TranslationDict = Record<TranslationKey, string>;

export const fr: TranslationDict = _fr;
