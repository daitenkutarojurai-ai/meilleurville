// R8.2 — Per-city "local mindset" / social-vibe synthesis.
//
// Composes 6 honest dimensions per city from seed + character tags + regional
// archetype. No fabricated editorial — every dimension has an explicit derivation.

import type { CitySeed } from "@/data/cities-seed";

export type Tempo = "intense" | "soutenu" | "modéré" | "calme" | "très calme";
export type Openness = "très ouverte" | "ouverte" | "neutre" | "réservée";
export type CafeCulture = "très forte" | "marquée" | "moyenne" | "faible";

export interface CityMindset {
  tempo: { level: Tempo; rationaleFr: string; rationaleEn: string };
  openness: { level: Openness; rationaleFr: string; rationaleEn: string };
  cafeCulture: { level: CafeCulture; rationaleFr: string; rationaleEn: string };
  outdoorOrientation: { score: number; labelFr: string; labelEn: string };
  associativeLife: { score: number; labelFr: string; labelEn: string };
  regionalArchetype: { fr: string; en: string };
}

function tagStr(city: CitySeed): string {
  return (city.characterTags ?? []).join(" ").toLowerCase();
}

function tempoOf(city: CitySeed): { level: Tempo; rationaleFr: string; rationaleEn: string } {
  const pop = city.population;
  const t = city.scores.transport;
  let level: Tempo;
  if (pop >= 800_000 && t >= 7.5) level = "intense";
  else if (pop >= 200_000) level = "soutenu";
  else if (pop >= 50_000) level = "modéré";
  else if (pop >= 15_000) level = "calme";
  else level = "très calme";
  return {
    level,
    rationaleFr: `Population ${pop.toLocaleString("fr-FR")}, score transport ${city.scores.transport.toFixed(1)}/10 — tempo quotidien ${level}.`,
    rationaleEn: `Population ${pop.toLocaleString("en-US")}, transport score ${city.scores.transport.toFixed(1)}/10 — daily tempo ${level}.`,
  };
}

function opennessOf(city: CitySeed): { level: Openness; rationaleFr: string; rationaleEn: string } {
  const tags = tagStr(city);
  const culture = city.scores.culture;
  const pop = city.population;
  const expatFlag = /étudiant|université|cosmopolite|tourist|tertiaire/.test(tags);
  let level: Openness;
  if (culture >= 7.5 || (expatFlag && pop >= 100_000)) level = "très ouverte";
  else if (culture >= 6 || pop >= 50_000) level = "ouverte";
  else if (pop >= 15_000) level = "neutre";
  else level = "réservée";
  return {
    level,
    rationaleFr: `Score culture ${culture.toFixed(1)}/10 + population ${pop.toLocaleString("fr-FR")} + tags (${expatFlag ? "campus/cosmopolite présent" : "ancrage local fort"}).`,
    rationaleEn: `Culture score ${culture.toFixed(1)}/10 + population ${pop.toLocaleString("en-US")} + tags (${expatFlag ? "campus/cosmopolitan present" : "strong local roots"}).`,
  };
}

function cafeCultureOf(city: CitySeed): { level: CafeCulture; rationaleFr: string; rationaleEn: string } {
  const tags = tagStr(city);
  const culture = city.scores.culture;
  const remote = city.scores.remoteWork;
  let level: CafeCulture;
  if (culture >= 7.5 && remote >= 6.5) level = "très forte";
  else if (culture >= 6 && remote >= 6) level = "marquée";
  else if (culture >= 5) level = "moyenne";
  else level = "faible";
  const provence = /provence|méditerranée|côte d'azur|sud/.test(tags) ? " Forte culture terrasse." : "";
  const bistro = /paris|bistro|brasserie|paisible/.test(tags) ? " Réseau bistro classique." : "";
  return {
    level,
    rationaleFr: `Culture ${culture.toFixed(1)} + télétravail ${remote.toFixed(1)} → niveau ${level}.${provence}${bistro}`,
    rationaleEn: `Culture ${culture.toFixed(1)} + remote work ${remote.toFixed(1)} → ${level}.${provence}${bistro}`,
  };
}

function outdoorOrientationOf(city: CitySeed): { score: number; labelFr: string; labelEn: string } {
  // Composite: nature score + sunshine (normalized) + coastal/mountain tag bonus
  const tags = tagStr(city);
  const baseN = city.scores.nature;
  const sun = city.sunshinedays ?? 1900;
  const sunNorm = Math.max(0, Math.min(3, (sun - 1700) / 200)); // 0..3
  const bonus =
    (/côte|mer|atlantique|méditerranée|littoral|plage/.test(tags) ? 1.2 : 0) +
    (/alpes|montagne|pyrénées|ski|massif|chartreuse|vercors/.test(tags) ? 1.2 : 0) +
    (/vélo|cycliste/.test(tags) ? 0.5 : 0);
  const score = Math.min(10, Math.round((baseN + sunNorm + bonus) * 10) / 10);
  let labelFr: string, labelEn: string;
  if (score >= 8) { labelFr = "très forte"; labelEn = "very strong"; }
  else if (score >= 6.5) { labelFr = "marquée"; labelEn = "marked"; }
  else if (score >= 5) { labelFr = "présente"; labelEn = "present"; }
  else { labelFr = "limitée"; labelEn = "limited"; }
  return { score, labelFr, labelEn };
}

function associativeLifeOf(city: CitySeed): { score: number; labelFr: string; labelEn: string } {
  // Composite: culture score + safety (community vitality) - very small towns get a floor
  const c = city.scores.culture;
  const s = city.scores.safety;
  const pop = city.population;
  const popFactor = pop < 8_000 ? -1 : pop < 20_000 ? -0.4 : pop < 100_000 ? 0 : 0.4;
  const score = Math.max(2, Math.min(10, Math.round((c * 0.55 + s * 0.35 + popFactor) * 10) / 10));
  let labelFr: string, labelEn: string;
  if (score >= 7.5) { labelFr = "très active"; labelEn = "very active"; }
  else if (score >= 6) { labelFr = "active"; labelEn = "active"; }
  else if (score >= 4.5) { labelFr = "modérée"; labelEn = "moderate"; }
  else { labelFr = "faible"; labelEn = "thin"; }
  return { score, labelFr, labelEn };
}

const REGION_ARCHETYPE: Record<string, { fr: string; en: string }> = {
  "Île-de-France": {
    fr: "Tempo francilien : déplacements longs, sociabilité par cercles professionnels et amicaux distincts, marché du temps plus que du logement.",
    en: "Île-de-France tempo: long commutes, social life via separate work/friend circles, time is the scarcest currency more than housing.",
  },
  "Auvergne-Rhône-Alpes": {
    fr: "Esprit rhône-alpin : sportif outdoor, montagne accessible, sociabilité moins effusive qu'au Sud, fort attachement local.",
    en: "Rhône-Alpes mindset: outdoor-sporty, mountains within reach, less effusive than the South, strong local attachment.",
  },
  "Provence-Alpes-Côte d'Azur": {
    fr: "Tempo provençal méditerranéen : rythme de vie plus lent en hiver, social en extérieur, terrasse-centric, été touristique très chargé.",
    en: "Mediterranean Provence tempo: slower winter rhythm, outdoor socialising, terrace-centric, very busy tourist summers.",
  },
  "Nouvelle-Aquitaine": {
    fr: "Ambiance sud-ouest : accent local, gastronomie centrale dans la sociabilité, dimanche en famille, importance des marchés de producteurs.",
    en: "South-West vibe: local accent, food central to social life, family Sundays, producer markets matter.",
  },
  "Occitanie": {
    fr: "Tempo occitan : accent affirmé, vie de place de village ou de centre-ville méditerranéen, fort attachement à la langue régionale dans certaines zones.",
    en: "Occitan tempo: pronounced accent, village-square or Mediterranean centre social life, strong regional-language attachment in some areas.",
  },
  "Bretagne": {
    fr: "Esprit breton : identité régionale très marquée, fest-noz, vie associative dense, climat partagé comme repère collectif.",
    en: "Breton mindset: very pronounced regional identity, fest-noz dances, dense civic life, weather as a shared social anchor.",
  },
  "Pays de la Loire": {
    fr: "Tempo ligérien : pays de l'eau, sociabilité fluviale et estuarienne, scènes culturelles autour de Nantes et Angers.",
    en: "Loire tempo: water-country, river and estuary socialising, cultural scenes around Nantes and Angers.",
  },
  "Normandie": {
    fr: "Caractère normand : ancrage à la ferme normande et à la côte de la Manche, marchés du week-end, sociabilité moins extravertie.",
    en: "Norman character: anchored to dairy farms and Channel coast, weekend markets, less extroverted socialising.",
  },
  "Grand Est": {
    fr: "Esprit Grand Est : héritage frontalier (Allemagne, Belgique, Luxembourg, Suisse), bilinguisme dans plusieurs zones, traditions calendaires fortes (Noël, fêtes patronales).",
    en: "Grand Est mindset: cross-border heritage (Germany, Belgium, Luxembourg, Switzerland), bilingual zones, strong calendar traditions (Christmas, patronal feasts).",
  },
  "Hauts-de-France": {
    fr: "Tempo nordiste : sociabilité chaleureuse réputée, café-brasserie-friterie centraux, marquages mineurs ANRU dans plusieurs centres.",
    en: "Northern French tempo: famously warm social life, café-brasserie-friterie central, ongoing urban renewal in several centres.",
  },
  "Bourgogne-Franche-Comté": {
    fr: "Esprit bourguignon-franc-comtois : vignobles, gastronomie, ancrage rural fort, ville-centre + petits bourgs satellites.",
    en: "Burgundy-Franche-Comté mindset: vineyards, gastronomy, strong rural roots, city-centre plus satellite small towns.",
  },
  "Centre-Val de Loire": {
    fr: "Tempo de Val de Loire : châteaux, cours d'eau, vie plus posée, fort patrimoine, position centrale entre métropoles.",
    en: "Loire Valley tempo: châteaux, rivers, slower pace, heritage-rich, central position between metropolises.",
  },
  "Corse": {
    fr: "Esprit corse : identité insulaire très affirmée, importance du village d'origine, langue corse vivante, été touristique intense.",
    en: "Corsican mindset: strongly affirmed island identity, village of origin matters, living Corsican language, intense tourist summer.",
  },
  "La Réunion": {
    fr: "Tempo réunionnais : créole, métissage indo-africain-européen-chinois, fortes traditions familiales et religieuses, vie sociale autour du marché et de la côte.",
    en: "Réunion tempo: Creole society, Indo-African-European-Chinese mix, strong family and religious traditions, social life around markets and the coast.",
  },
  "Martinique": {
    fr: "Esprit martiniquais : créole, vie côtière, fortes traditions musicales et carnavalesques, sociabilité familiale très large.",
    en: "Martinican mindset: Creole, coastal life, strong music and carnival traditions, very extended family socialising.",
  },
  "Guadeloupe": {
    fr: "Tempo guadeloupéen : créole, archipel, sociabilité côtière, carnaval fort, économie touristique saisonnière.",
    en: "Guadeloupe tempo: Creole, archipelago life, coastal socialising, strong carnival, seasonal tourist economy.",
  },
  "Guyane": {
    fr: "Esprit guyanais : multiculturel (créole, amérindien, brésilien, hmong), climat équatorial, isolement européen, sociabilité par communautés.",
    en: "Guianan mindset: multicultural (Creole, Amerindian, Brazilian, Hmong), equatorial climate, European-distance isolation, community-based socialising.",
  },
  "Mayotte": {
    fr: "Tempo mahorais : société comorienne francophone, traditions musulmanes fortes, climat tropical, défis structurels (sécurité, infrastructure).",
    en: "Mayotte tempo: Francophone Comorian society, strong Muslim traditions, tropical climate, structural challenges (safety, infrastructure).",
  },
};

const DEFAULT_ARCHETYPE = {
  fr: "Caractère régional standard pour cette zone — voir profils-types pour une ventilation par profil.",
  en: "Standard regional character for this area — see profiles for a per-profile breakdown.",
};

export function cityMindset(city: CitySeed): CityMindset {
  return {
    tempo: tempoOf(city),
    openness: opennessOf(city),
    cafeCulture: cafeCultureOf(city),
    outdoorOrientation: outdoorOrientationOf(city),
    associativeLife: associativeLifeOf(city),
    regionalArchetype: REGION_ARCHETYPE[city.region] ?? DEFAULT_ARCHETYPE,
  };
}
