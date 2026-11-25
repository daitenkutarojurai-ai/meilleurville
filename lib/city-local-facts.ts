/**
 * Faits propres à une ville, affichés dans le bloc « En bref : vivre à X » de la fiche
 * (`app/villes/[slug]/CityProfile.tsx`) et repris dans la réponse FAQ « Fait-il bon vivre à X ? »
 * (`lib/city-faq.ts`, donc aussi dans le JSON-LD FAQPage).
 *
 * Pourquoi : le bloc « En bref » est généré des scores pour les 593 fiches ; deux fiches s'y
 * ressemblent. Les villes qui ont déjà de la traction (docs/seo/cibles.md § 5) reçoivent ici,
 * une par run de la routine 2/4, 3 faits vérifiables qui ne sortent d'aucun gabarit.
 *
 * Règles : zéro import (le module reste lisible par n'importe quel composant) ; chaque fait est
 * recoupé par deux sources publiques et résumé avec nos mots ; `source` est un nom lisible
 * par un humain, jamais un chemin du dépôt ; aucun score ni loyer ici (ceux-là viennent de
 * `CITIES_SEED` / `HOUSING`, valeurs rendues) ; FR et EN disent la même chose.
 */
export interface CityLocalFact {
  fr: string;
  en: string;
  source: string;
}

export const CITY_LOCAL_FACTS: Record<string, CityLocalFact[]> = {
  // 2026-11-25 — /villes/nantes : 2 713 impressions, position 14,3, CTR 0,59 % (Search Console 90 j).
  nantes: [
    {
      fr: "Bus, tramways et navettes fluviales sont gratuits tous les samedis et dimanches depuis le 24 avril 2021 (hors navette aéroport), pour les habitants comme pour les visiteurs.",
      en: "Buses, trams and river shuttles have been free every Saturday and Sunday since 24 April 2021 (airport shuttle excluded), for residents and visitors alike.",
      source: "Nantes Métropole",
    },
    {
      fr: "Première ville de France à avoir remis le tramway en service, dès janvier 1985 : ses trois lignes structurent la vie sans voiture, et deux nouvelles (6 et 7, vers Saint-Herblain et La Chapelle-sur-Erdre) sont annoncées pour fin 2027.",
      en: "The first French city to bring the tram back, in January 1985; its three lines are the backbone of car-free living, and two more (lines 6 and 7, to Saint-Herblain and La Chapelle-sur-Erdre) are scheduled for late 2027.",
      source: "Semitan, Nantes Métropole",
    },
    {
      fr: "Désignée Capitale verte de l'Europe 2013 par la Commission européenne, saluée pour ses transports et sa trame de parcs et de cours d'eau.",
      en: "Named European Green Capital 2013 by the European Commission, cited for its transport policy and its network of parks and waterways.",
      source: "Commission européenne",
    },
  ],
};

export function cityLocalFacts(slug: string): CityLocalFact[] {
  return CITY_LOCAL_FACTS[slug] ?? [];
}
