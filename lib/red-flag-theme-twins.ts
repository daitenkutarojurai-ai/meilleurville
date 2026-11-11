// Jumelles FR ↔ EN des thèmes Red Flags.
//
// Côté FR chaque thème est une page statique (`/red-flags/villes-bruit-cauchemar`),
// côté EN une route dynamique (`/red-flags/themes/noise-nightmare`) dont le slug
// n'est PAS la traduction mécanique du slug FR. Les deux pages existaient sans se
// déclarer (audit 2026-11-11 : 29 paires sans hreflang). Cette table est la seule
// source du rapprochement : les pages FR et la page EN la lisent, et
// `npm run hreflang:check` vérifie que chaque slug a bien sa page des deux côtés.
// Module serveur : il importe lib/i18n (donc les dictionnaires), ne pas le lire
// depuis un composant client.
import { pathAlternates, pathAlternatesEn } from "@/lib/i18n";

export const RED_FLAG_THEME_EN_SLUG: Record<string, string> = {
  "villes-regrets-achat": "buyers-remorse",
  "villes-sans-voiture-difficile": "car-dependent",
  "villes-belles-invivables-ete": "beautiful-brutal-summers",
  "villes-pollution-air-chronique": "chronic-air-pollution",
  "villes-risques-naturels": "natural-hazards",
  "villes-bruit-cauchemar": "noise-nightmare",
  "villes-sans-eau-ete": "water-stress",
  "villes-desert-medical": "medical-desert",
  "villes-chomage-eleve": "chronic-unemployment",
  "villes-cadre-de-vie-tendu": "quality-of-life-stretched",
  "villes-couts-explosifs": "cost-explosion",
  "villes-desert-services-publics": "public-services-desert",
  "villes-anti-velo": "anti-cycling",
  "villes-pauvres-en-sport": "sports-poor-cities",
  "villes-vieillissement-critique": "critical-ageing",
  "villes-nuit-tendue": "tense-nights",
  "villes-hiver-rude": "harsh-winters",
  "villes-fuite-jeunes-actifs": "young-workers-leaving",
  "villes-vols-cambriolages": "theft-burglary",
  "villes-desert-culturel": "cultural-desert",
  "villes-embouteillages-quotidiens": "daily-traffic-jams",
  "villes-mono-touristiques": "mono-tourism-dependence",
  "villes-fiscalite-lourde": "heavy-property-tax",
  "villes-logement-introuvable": "unfindable-rentals",
  "villes-manque-de-creches": "childcare-shortage",
  "villes-erosion-cotiere": "coastal-erosion",
  "villes-parking-cauchemar": "parking-nightmare",
  "villes-internet-precaire": "patchy-internet",
};

/** `alternates` d'une page de thème FR : canonical seul si le thème n'a pas de jumelle EN. */
export function redFlagThemeAlternates(frSlug: string) {
  const enSlug = RED_FLAG_THEME_EN_SLUG[frSlug];
  return enSlug
    ? pathAlternates(`/red-flags/${frSlug}`, `/red-flags/themes/${enSlug}`)
    : { canonical: `/red-flags/${frSlug}` };
}

/** `alternates` de la page de thème EN ; `null` si la table ne connaît pas la paire. */
export function redFlagThemeAlternatesEn(frSlug: string, enSlug: string) {
  return RED_FLAG_THEME_EN_SLUG[frSlug] === enSlug
    ? pathAlternatesEn(`/red-flags/${frSlug}`, `/red-flags/themes/${enSlug}`)
    : null;
}
