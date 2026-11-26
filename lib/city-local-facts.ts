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
  // 2026-11-26 — /villes/rennes : 3 027 impressions toutes pages ; « vivre à rennes » pos. 19, « rennes avis » pos. 9.
  rennes: [
    {
      fr: "Rennes a ouvert son métro automatique en mars 2002 (ligne a, Kennedy – La Poterie) ; la ligne b, de Saint-Jacques-Gaîté à Cesson-Viasilva, roule depuis le 20 septembre 2022.",
      en: "Rennes opened its driverless metro in March 2002 (line a, Kennedy – La Poterie); line b, from Saint-Jacques-Gaîté to Cesson-Viasilva, has run since 20 September 2022.",
      source: "STAR, Rennes Métropole",
    },
    {
      fr: "Le marché des Lices, tenu chaque samedi matin depuis 1622 (400 ans fêtés en 2022), réunit plus de 250 producteurs et commerçants ; il est souvent présenté comme le deuxième marché alimentaire de France.",
      en: "The Marché des Lices, held every Saturday morning since 1622 (400th anniversary in 2022), gathers more than 250 producers and traders and is often described as France's second-largest food market.",
      source: "Tourisme Bretagne, Ville de Rennes",
    },
    {
      fr: "La ligne b est la première au monde à utiliser le système Cityval de Siemens : deux lignes automatiques se croisent désormais au centre (Sainte-Anne, Gares), ce qui permet de vivre sans voiture dans la plupart des quartiers.",
      en: "Line b is the world's first to run on Siemens' Cityval system; two driverless lines now cross in the centre (Sainte-Anne, Gares), which makes car-free living realistic in most districts.",
      source: "Rennes Métropole, Siemens Mobility",
    },
  ],
  // 2026-11-26 — /villes/ile-de-re : 1 949 impressions, 73 clics (1re ville de cibles.md § 5).
  "ile-de-re": [
    {
      fr: "L'île est reliée au continent depuis le 19 mai 1988 par un pont d'environ 2,9 km au départ de La Rochelle : on y vit à l'année sans bateau, mais l'accès en voiture est soumis à une écotaxe.",
      en: "The island has been linked to the mainland since 19 May 1988 by a bridge of about 2.9 km from La Rochelle: you can live there year-round without a boat, but driving across carries an eco-toll.",
      source: "Département de la Charente-Maritime, Destination Île de Ré",
    },
    {
      fr: "Les fortifications de Vauban de Saint-Martin-de-Ré sont inscrites au patrimoine mondial de l'Unesco depuis juillet 2008, dans le réseau des sites majeurs de Vauban.",
      en: "Vauban's fortifications at Saint-Martin-de-Ré have been on the UNESCO World Heritage List since July 2008, as part of the Major Sites of Vauban.",
      source: "Unesco, Destination Île de Ré",
    },
    {
      fr: "L'île compte dix villages reliés par un réseau de pistes cyclables séparées de la circulation : le vélo y est le moyen de déplacement du quotidien, et la population est multipliée l'été.",
      en: "The island's ten villages are linked by cycle paths separated from traffic: cycling is the everyday way to get around, and the population swells several times over in summer.",
      source: "Destination Île de Ré",
    },
  ],
  // 2026-11-26 — /villes/amboise : 891 impressions, 35 clics.
  amboise: [
    {
      fr: "Léonard de Vinci s'y installe à l'automne 1516, à l'invitation de François Ier, au manoir du Cloux (l'actuel Clos Lucé), où il meurt le 2 mai 1519 ; sa tombe se trouve dans la chapelle Saint-Hubert du château.",
      en: "Leonardo da Vinci moved here in autumn 1516, at François I's invitation, to the manor of Cloux (today's Clos Lucé), where he died on 2 May 1519; his tomb lies in the château's Saint-Hubert chapel.",
      source: "Château royal d'Amboise, Clos Lucé",
    },
    {
      fr: "Le château royal, palais des rois de France à la Renaissance et résidence favorite de François Ier, domine la ville et la Loire.",
      en: "The royal château, palace of the French kings during the Renaissance and François I's favourite residence, overlooks the town and the Loire.",
      source: "Château royal d'Amboise, France.fr",
    },
    {
      fr: "La ville est dans le Val de Loire inscrit au patrimoine mondial de l'Unesco en 2000 (environ 280 km de Sully-sur-Loire à Chalonnes) et sur l'itinéraire de la Loire à Vélo.",
      en: "The town sits within the Loire Valley stretch listed by UNESCO in 2000 (about 280 km from Sully-sur-Loire to Chalonnes) and on the Loire à Vélo cycle route.",
      source: "Unesco, Office de tourisme Amboise Val de Loire",
    },
  ],
  // 2026-11-26 — /villes/narbonne : 1 520 impressions, 34 clics ; « vivre à narbonne ou perpignan » pos. 4,7.
  narbonne: [
    {
      fr: "Fondée en 118 av. J.-C. sous le nom de Narbo Martius, c'est la première colonie romaine de Gaule et hors d'Italie ; la voie Domitienne en est encore visible place de l'Hôtel-de-Ville.",
      en: "Founded in 118 BC as Narbo Martius, it was the first Roman colony in Gaul and outside Italy; a stretch of the Via Domitia is still visible on the town-hall square.",
      source: "Ville de Narbonne, Narbo Via",
    },
    {
      fr: "Le musée Narbo Via, dessiné par Foster + Partners et consacré à la Narbonne antique, a ouvert le 19 mai 2021.",
      en: "Narbo Via, the Foster + Partners-designed museum of Roman Narbonne, opened on 19 May 2021.",
      source: "Préfecture de la région Occitanie, ministère de la Culture",
    },
    {
      fr: "Le canal de la Robine traverse le centre-ville : il fait partie du canal du Midi, inscrit au patrimoine mondial de l'Unesco en 1996, et rejoint la Méditerranée à Port-la-Nouvelle.",
      en: "The Canal de la Robine runs through the town centre; it is part of the Canal du Midi World Heritage site (UNESCO, 1996) and reaches the Mediterranean at Port-la-Nouvelle.",
      source: "Unesco, ministère de la Culture",
    },
  ],
};

export function cityLocalFacts(slug: string): CityLocalFact[] {
  return CITY_LOCAL_FACTS[slug] ?? [];
}
