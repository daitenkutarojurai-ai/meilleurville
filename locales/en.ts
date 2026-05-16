// English UI copy. Must include every key from locales/fr.ts —
// the TranslationDict type imported from `./fr` enforces it at compile time.

import type { TranslationDict } from "./fr";

export const en: TranslationDict = {
  // Navigation
  "nav.home": "Home",
  "nav.cities": "Cities",
  "nav.rankings": "Rankings",
  "nav.guides": "Guides",
  "nav.compare": "Compare",
  "nav.quiz": "Quiz",
  "nav.map": "Map",
  "nav.about": "About",
  "nav.contact": "Contact",

  // Home
  "home.hero.title": "Find the French city that fits you",
  "home.hero.subtitle":
    "AI + lived experience + official data. Rankings, resident reviews, lifestyle matching quiz.",
  "home.hero.ctaQuiz": "Take the quiz",
  "home.hero.ctaCities": "Browse all cities",
  "home.stats.cities": "profiled cities",
  "home.stats.guides": "editorial guides",
  "home.stats.rankings": "themed rankings",

  // Cities index
  "cities.title": "Explore every French city",
  "cities.intro":
    "Scores calibrated on Insee + Ministry of Interior, resident reviews, local data. Filter, sort, compare — no fluff.",

  // City page
  "city.score.global": "Quality of life score",
  "city.score.life": "Quality of life",
  "city.score.transport": "Transport",
  "city.score.nature": "Nature",
  "city.score.cost": "Cost of living",
  "city.score.safety": "Safety",
  "city.score.culture": "Culture",
  "city.score.remoteWork": "Remote-work readiness",
  "city.score.schools": "Schools",
  "city.population": "Inhabitants",
  "city.department": "Département",
  "city.region": "Region",
  "city.sunshine": "sunshine days/year",
  "city.relatedCities": "Similar cities",
  "city.guides": "Related guides",

  // Rankings
  "rankings.title": "French city rankings",
  "rankings.intro":
    "13 themed rankings, refreshed every score-calibration cycle.",

  // Quiz
  "quiz.title": "Which French city is right for you?",
  "quiz.intro": "A few minutes, 10 questions, and we'll surface 5 cities that match.",
  "quiz.start": "Start",
  "quiz.next": "Next",
  "quiz.previous": "Previous",
  "quiz.results": "Your results",

  // Footer
  "footer.tagline": "BestCitiesInFrance — choosing where to live in France.",
  "footer.copyright": "All rights reserved.",
  "footer.legal": "Legal",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
};
