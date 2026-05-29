import type { CitySeed } from "@/data/cities-seed";
import type { HousingData } from "@/data/housing";

export interface CityNarrative {
  intro: string;
  pros: string[];
  cons: string[];
  notable: string[];
}

type Locale = "fr" | "en";

type ScoreKey = keyof CitySeed["scores"];

interface AxisCopy {
  proStrong: string;
  proGood: string;
  conWeak: string;
  conBad: string;
}

const AXIS_COPY_FR: Record<ScoreKey, AxisCopy> = {
  global: {
    proStrong: "Score global parmi les plus élevés du pays",
    proGood: "Bon équilibre général qualité de vie",
    conWeak: "Score global en dessous de la moyenne nationale",
    conBad: "Plusieurs axes à améliorer pour la qualité de vie",
  },
  life: {
    proStrong: "Art de vivre reconnu, quotidien agréable",
    proGood: "Cadre de vie plaisant au jour le jour",
    conWeak: "Cadre de vie qui peut sembler banal",
    conBad: "Qualité de vie quotidienne en retrait",
  },
  transport: {
    proStrong: "Réseau de transports en commun très complet (tram, métro, bus)",
    proGood: "Transports en commun corrects, bien desservie en TER",
    conWeak: "Réseau de transports limité, voiture souvent utile",
    conBad: "Transports en commun peu développés, voiture quasi indispensable",
  },
  nature: {
    proStrong: "Accès direct à la nature : montagne, mer, lac ou forêt",
    proGood: "Espaces verts à proximité immédiate",
    conWeak: "Nature peu présente en centre-ville",
    conBad: "Très peu d'accès à la nature au quotidien",
  },
  cost: {
    proStrong: "Coût de la vie très abordable, loyers raisonnables",
    proGood: "Prix maîtrisés comparé aux grandes métropoles",
    conWeak: "Coût de la vie au-dessus de la moyenne",
    conBad: "Loyers et prix immobiliers dissuasifs",
  },
  safety: {
    proStrong: "Sentiment de sécurité élevé au quotidien",
    proGood: "Ville plutôt tranquille",
    conWeak: "Sentiment de sécurité en demi-teinte selon les quartiers",
    conBad: "Insécurité ressentie significative dans certains quartiers",
  },
  culture: {
    proStrong: "Vie culturelle dense : musées, salles, festivals",
    proGood: "Offre culturelle régulière, scène locale active",
    conWeak: "Offre culturelle limitée, sorties peu nombreuses",
    conBad: "Vie culturelle très restreinte, peu d'événements",
  },
  remoteWork: {
    proStrong: "Idéale pour le télétravail : fibre, coworkings, qualité de vie",
    proGood: "Bonnes conditions pour télétravailler (fibre, cafés)",
    conWeak: "Peu d'infrastructures dédiées au télétravail",
    conBad: "Conditions peu favorables au remote (connexion, coworkings)",
  },
  schools: {
    proStrong: "Offre scolaire et universitaire de premier plan",
    proGood: "Établissements scolaires bien notés en moyenne",
    conWeak: "Offre scolaire dans la moyenne, peu de choix",
    conBad: "Offre scolaire en retrait, peu d'options pour les familles",
  },
};

const AXIS_COPY_EN: Record<ScoreKey, AxisCopy> = {
  global: {
    proStrong: "One of the highest overall scores in the country",
    proGood: "Solid all-round quality of life",
    conWeak: "Overall score below the national average",
    conBad: "Several areas hold quality of life back",
  },
  life: {
    proStrong: "Renowned lifestyle, genuinely pleasant day-to-day",
    proGood: "Pleasant living environment day to day",
    conWeak: "Living environment can feel a bit unremarkable",
    conBad: "Day-to-day quality of life falls short",
  },
  transport: {
    proStrong: "Very comprehensive public transit (tram, metro, bus)",
    proGood: "Decent public transit, well served by regional trains",
    conWeak: "Limited transit network, a car is often handy",
    conBad: "Underdeveloped public transit, a car is all but essential",
  },
  nature: {
    proStrong: "Direct access to nature: mountains, sea, lake or forest",
    proGood: "Green spaces right on your doorstep",
    conWeak: "Not much nature in the city center",
    conBad: "Very little access to nature day to day",
  },
  cost: {
    proStrong: "Very affordable cost of living, reasonable rents",
    proGood: "Costs kept in check compared with the big metros",
    conWeak: "Cost of living above average",
    conBad: "Off-putting rents and property prices",
  },
  safety: {
    proStrong: "Strong sense of safety day to day",
    proGood: "A fairly quiet, low-key town",
    conWeak: "Mixed sense of safety depending on the neighborhood",
    conBad: "Noticeable perceived insecurity in some neighborhoods",
  },
  culture: {
    proStrong: "Rich cultural life: museums, venues, festivals",
    proGood: "Regular cultural programming, active local scene",
    conWeak: "Limited cultural offering, few things to do out",
    conBad: "Very thin cultural life, few events",
  },
  remoteWork: {
    proStrong: "Ideal for remote work: fiber, coworking, quality of life",
    proGood: "Good conditions for remote work (fiber, cafes)",
    conWeak: "Little infrastructure dedicated to remote work",
    conBad: "Poor conditions for remote work (connectivity, coworking)",
  },
  schools: {
    proStrong: "Top-tier schools and universities",
    proGood: "Schools rated well on average",
    conWeak: "Average school offering, little choice",
    conBad: "Limited school offering, few options for families",
  },
};

function axisCopy(locale: Locale): Record<ScoreKey, AxisCopy> {
  return locale === "en" ? AXIS_COPY_EN : AXIS_COPY_FR;
}

function pickAxisLine(
  score: number,
  key: ScoreKey,
  mode: "pro" | "con",
  locale: Locale
): string | null {
  const c = axisCopy(locale)[key];
  if (mode === "pro") {
    if (score >= 7.5) return c.proStrong;
    if (score >= 7.0) return c.proGood;
    return null;
  }
  if (score <= 4.5) return c.conBad;
  if (score <= 5.7) return c.conWeak;
  return null;
}

function climateLine(city: CitySeed, locale: Locale): string | null {
  const sun = city.sunshinedays;
  const tj = city.avgTempJuly;
  if (locale === "en") {
    if (sun && sun >= 2500) return "Exceptional sunshine (over 260 days a year)";
    if (sun && sun >= 2200) return "Very sunny (around 230 days a year)";
    if (sun && sun < 1700) return "Rather grey winters (fewer than 180 days of sun a year)";
    if (tj && tj >= 27) return "Very hot summers, worth planning around in a heatwave";
    return null;
  }
  if (sun && sun >= 2500) return "Ensoleillement exceptionnel (plus de 260 j/an)";
  if (sun && sun >= 2200) return "Très ensoleillée (autour de 230 j/an)";
  if (sun && sun < 1700) return "Climat plutôt gris en hiver (moins de 180 j de soleil/an)";
  if (tj && tj >= 27) return "Étés très chauds, à anticiper en pleine canicule";
  return null;
}

function isSunny(line: string | null): boolean {
  if (!line) return false;
  return (
    line.includes("ensoleillé") ||
    line.includes("Ensoleillement") ||
    line.includes("sunny") ||
    line.includes("sunshine")
  );
}

function housingPro(city: CitySeed, h: HousingData | undefined, locale: Locale): string | null {
  if (!h) return null;
  if (locale === "en") {
    if (h.avgRentT2 <= 700)
      return `Median 1-bed rent around ${h.avgRentT2.toLocaleString("en-US")} €/mo — very affordable`;
    if (h.avgBuyPriceM2 <= 2200)
      return `Very affordable purchase prices (~${h.avgBuyPriceM2.toLocaleString("en-US")} €/m²)`;
    return null;
  }
  if (h.avgRentT2 <= 700) return `Loyer T2 médian autour de ${h.avgRentT2} €/mois — très accessible`;
  if (h.avgBuyPriceM2 <= 2200) return `Prix d'achat très abordables (~${h.avgBuyPriceM2.toLocaleString("fr-FR")} €/m²)`;
  return null;
}

function housingCon(city: CitySeed, h: HousingData | undefined, locale: Locale): string | null {
  if (!h) return null;
  if (locale === "en") {
    if (h.avgRentT2 >= 1100)
      return `High median 1-bed rent (~${h.avgRentT2.toLocaleString("en-US")} €/mo)`;
    if (h.avgBuyPriceM2 >= 5000)
      return `Tight property market (~${h.avgBuyPriceM2.toLocaleString("en-US")} €/m² to buy)`;
    return null;
  }
  if (h.avgRentT2 >= 1100) return `Loyer T2 médian élevé (~${h.avgRentT2} €/mois)`;
  if (h.avgBuyPriceM2 >= 5000) return `Marché immobilier tendu (~${h.avgBuyPriceM2.toLocaleString("fr-FR")} €/m² à l'achat)`;
  return null;
}

function tagBasedNotable(city: CitySeed, locale: Locale): string[] {
  const out: string[] = [];
  const tags = city.characterTags.map((t) => t.toLowerCase());
  const en = locale === "en";
  if (tags.some((t) => t.includes("patrimoine") || t.includes("historique") || t.includes("médiéval")))
    out.push(
      en
        ? `${city.name} is renowned for the wealth of its historic heritage`
        : `${city.name} est reconnue pour la richesse de son patrimoine historique`
    );
  if (tags.some((t) => t.includes("étudiant") || t.includes("universit")))
    out.push(en ? `Active student and university hub in the region` : `Pôle étudiant et universitaire actif dans la région`);
  if (tags.some((t) => t.includes("port") || t.includes("maritime")))
    out.push(en ? `Strong maritime identity, coastal or port city` : `Identité maritime forte, façade littorale ou portuaire`);
  if (tags.some((t) => t.includes("vélo") || t.includes("velo") || t.includes("cycl")))
    out.push(
      en
        ? `One of the most bike-friendly cities in France for everyday cycling`
        : `L'une des villes françaises les plus pratiquantes du vélo au quotidien`
    );
  if (tags.some((t) => t.includes("montagne") || t.includes("alpin")))
    out.push(en ? `Ski resorts and hiking trails less than an hour away` : `Stations de ski et sentiers de randonnée à moins d'une heure`);
  if (tags.some((t) => t.includes("vin") || t.includes("vignoble")))
    out.push(en ? `Renowned wine region, celebrated terroir` : `Région viticole renommée, terroir reconnu`);
  if (tags.some((t) => t.includes("tech") || t.includes("startup")))
    out.push(en ? `Growing tech and startup ecosystem` : `Écosystème tech et startups en croissance`);
  if (tags.some((t) => t.includes("touris")))
    out.push(en ? `Strong tourist appeal, especially in peak season` : `Forte attractivité touristique, surtout en haute saison`);
  return out;
}

function geoNotable(city: CitySeed, locale: Locale): string | null {
  if (!city.population) return null;
  const en = locale === "en";
  const loc = en ? "en-US" : "fr-FR";
  if (city.population > 500000)
    return en
      ? `Over ${Math.round(city.population / 1000)},000 inhabitants — a major metro`
      : `Plus de ${Math.round(city.population / 1000)} 000 habitants — métropole majeure`;
  if (city.population > 200000)
    return en
      ? `Large city of ${Math.round(city.population / 1000)},000 inhabitants`
      : `Grande ville de ${Math.round(city.population / 1000)} 000 habitants`;
  if (city.population < 30000)
    return en
      ? `Human-scale town (${city.population.toLocaleString(loc)} inhab.)`
      : `Ville à taille humaine (${city.population.toLocaleString("fr-FR")} hab.)`;
  return null;
}

function elevationNotable(city: CitySeed, locale: Locale): string | null {
  if (!city.elevation) return null;
  if (locale === "en") {
    if (city.elevation >= 600) return `Sits at altitude (${city.elevation} m), cooler summers`;
    if (city.elevation <= 10) return `Coastal or lowland town (${city.elevation} m elevation)`;
    return null;
  }
  if (city.elevation >= 600) return `Située en altitude (${city.elevation} m), climat plus frais l'été`;
  if (city.elevation <= 10) return `Ville côtière ou de plaine (${city.elevation} m d'altitude)`;
  return null;
}

function buildIntro(city: CitySeed, locale: Locale): string {
  const g = city.scores.global;
  if (locale === "en") {
    const tierEn =
      g >= 7.5 ? "ranks among the best French cities for quality of life"
      : g >= 7.0 ? "offers a quality of life clearly above average"
      : g >= 6.0 ? "has a balanced profile, with no real excess either way"
      : "shows a few weaknesses on quality of life according to our indicators";
    const tagsPart = city.characterTags.slice(0, 3).join(", ");
    const popPart = city.population
      ? `${city.population.toLocaleString("en-US")} inhabitants`
      : "a French city";
    return `${city.name} (${city.department}, ${city.region}) ${tierEn}. With its ${popPart}, it is often described as ${tagsPart}. Overall score ${g.toFixed(1)}/10, calibrated across 352 cities.`;
  }

  const tier =
    g >= 7.5 ? "se classe parmi les meilleures villes françaises pour la qualité de vie"
    : g >= 7.0 ? "offre une qualité de vie clairement au-dessus de la moyenne"
    : g >= 6.0 ? "présente un profil équilibré, sans excès dans un sens ni dans l'autre"
    : "présente quelques fragilités sur la qualité de vie selon nos indicateurs";

  const tagsPart = city.characterTags.slice(0, 3).join(", ");
  const popPart = city.population
    ? `${city.population.toLocaleString("fr-FR")} habitants`
    : "ville française";
  return `${city.name} (${city.department}, ${city.region}) ${tier}. Avec ses ${popPart}, on la décrit souvent comme ${tagsPart}. Score global ${g.toFixed(1)}/10, calibré sur 352 villes.`;
}

const NARRATIVE_CACHE = new Map<string, CityNarrative>();

export function buildCityNarrative(
  city: CitySeed,
  housing: HousingData | undefined,
  locale: Locale = "fr"
): CityNarrative {
  const cacheKey = `${locale}:${city.slug}`;
  const cached = NARRATIVE_CACHE.get(cacheKey);
  if (cached) return cached;
  const result = buildCityNarrativeUncached(city, housing, locale);
  NARRATIVE_CACHE.set(cacheKey, result);
  return result;
}

function buildCityNarrativeUncached(
  city: CitySeed,
  housing: HousingData | undefined,
  locale: Locale
): CityNarrative {
  const en = locale === "en";
  const axes: ScoreKey[] = ["nature", "transport", "culture", "safety", "schools", "remoteWork", "cost", "life"];

  // Pros: top 3-5 axes by score, only those scoring well
  const sortedDesc = [...axes].sort((a, b) => city.scores[b] - city.scores[a]);
  const pros: string[] = [];
  for (const k of sortedDesc) {
    const line = pickAxisLine(city.scores[k], k, "pro", locale);
    if (line) pros.push(line);
    if (pros.length >= 4) break;
  }
  const climateP = climateLine(city, locale);
  if (climateP && isSunny(climateP) && pros.length < 5) {
    pros.push(climateP);
  }
  const housingP = housingPro(city, housing, locale);
  if (housingP && pros.length < 5) pros.push(housingP);
  if (pros.length < 3) {
    const tag = city.characterTags[0] ?? (en ? "local" : "locale");
    pros.push(en ? `Strong ${tag} identity` : `Identité ${tag} marquée`);
  }

  // Cons: bottom axes scoring poorly
  const sortedAsc = [...axes].sort((a, b) => city.scores[a] - city.scores[b]);
  const cons: string[] = [];
  for (const k of sortedAsc) {
    const line = pickAxisLine(city.scores[k], k, "con", locale);
    if (line) cons.push(line);
    if (cons.length >= 4) break;
  }
  const housingC = housingCon(city, housing, locale);
  if (housingC && cons.length < 5) cons.push(housingC);
  const climateC = climateLine(city, locale);
  if (climateC && !isSunny(climateC) && cons.length < 5) {
    cons.push(climateC);
  }
  if (cons.length < 3) {
    if (city.scores.cost < 7)
      cons.push(en ? "Property prices have risen steadily in recent years" : "Prix immobiliers en hausse continue ces dernières années");
    if (cons.length < 3)
      cons.push(en ? "Like anywhere, a few neighborhoods best avoided after dark" : "Comme partout, certains quartiers à éviter en soirée");
    if (cons.length < 3)
      cons.push(en ? "Marked seasonality: the rhythm isn't for everyone" : "Saisonnalité marquée : tout le monde n'apprécie pas le rythme");
  }

  // Notable facts
  const notable: string[] = [];
  notable.push(...tagBasedNotable(city, locale));
  const geo = geoNotable(city, locale);
  if (geo) notable.push(geo);
  const ele = elevationNotable(city, locale);
  if (ele) notable.push(ele);
  if (notable.length < 2) {
    notable.push(
      en
        ? `Prefecture or sub-prefecture of the ${city.department} department`
        : `Préfecture ou sous-préfecture du département ${city.department}`
    );
  }

  return {
    intro: buildIntro(city, locale),
    pros: pros.slice(0, 5),
    cons: cons.slice(0, 5),
    notable: notable.slice(0, 3),
  };
}
