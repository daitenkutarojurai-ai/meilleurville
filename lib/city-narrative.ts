import type { CitySeed } from "@/data/cities-seed";
import type { HousingData } from "@/data/housing";

export interface CityNarrative {
  intro: string;
  pros: string[];
  cons: string[];
  notable: string[];
}

type ScoreKey = keyof CitySeed["scores"];

interface AxisCopy {
  proStrong: string;
  proGood: string;
  conWeak: string;
  conBad: string;
}

const AXIS_COPY: Record<ScoreKey, AxisCopy> = {
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

function pickAxisLine(score: number, key: ScoreKey, mode: "pro" | "con"): string | null {
  const c = AXIS_COPY[key];
  if (mode === "pro") {
    if (score >= 8.0) return c.proStrong;
    if (score >= 7.0) return c.proGood;
    return null;
  }
  if (score <= 4.5) return c.conBad;
  if (score <= 5.7) return c.conWeak;
  return null;
}

function climateLine(city: CitySeed): string | null {
  const sun = city.sunshinedays;
  const tj = city.avgTempJuly;
  if (sun && sun >= 2500) return "Ensoleillement exceptionnel (plus de 2 500 h/an)";
  if (sun && sun >= 2200) return "Très ensoleillée (autour de 2 200 h/an)";
  if (sun && sun < 1700) return "Climat plutôt gris en hiver (moins de 1 700 h de soleil/an)";
  if (tj && tj >= 27) return "Étés très chauds, à anticiper en pleine canicule";
  return null;
}

function housingPro(city: CitySeed, h: HousingData | undefined): string | null {
  if (!h) return null;
  if (h.avgRentT2 <= 700) return `Loyer T2 médian autour de ${h.avgRentT2} €/mois — très accessible`;
  if (h.avgBuyPriceM2 <= 2200) return `Prix d'achat très abordables (~${h.avgBuyPriceM2.toLocaleString("fr-FR")} €/m²)`;
  return null;
}

function housingCon(city: CitySeed, h: HousingData | undefined): string | null {
  if (!h) return null;
  if (h.avgRentT2 >= 1100) return `Loyer T2 médian élevé (~${h.avgRentT2} €/mois)`;
  if (h.avgBuyPriceM2 >= 5000) return `Marché immobilier tendu (~${h.avgBuyPriceM2.toLocaleString("fr-FR")} €/m² à l'achat)`;
  return null;
}

function tagBasedNotable(city: CitySeed): string[] {
  const out: string[] = [];
  const tags = city.characterTags.map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("patrimoine") || t.includes("historique") || t.includes("médiéval")))
    out.push(`${city.name} est reconnue pour la richesse de son patrimoine historique`);
  if (tags.some((t) => t.includes("étudiant") || t.includes("universit")))
    out.push(`Pôle étudiant et universitaire actif dans la région`);
  if (tags.some((t) => t.includes("port") || t.includes("maritime")))
    out.push(`Identité maritime forte, façade littorale ou portuaire`);
  if (tags.some((t) => t.includes("vélo") || t.includes("velo") || t.includes("cycl")))
    out.push(`L'une des villes françaises les plus pratiquantes du vélo au quotidien`);
  if (tags.some((t) => t.includes("montagne") || t.includes("alpin")))
    out.push(`Stations de ski et sentiers de randonnée à moins d'une heure`);
  if (tags.some((t) => t.includes("vin") || t.includes("vignoble")))
    out.push(`Région viticole renommée, terroir reconnu`);
  if (tags.some((t) => t.includes("tech") || t.includes("startup")))
    out.push(`Écosystème tech et startups en croissance`);
  if (tags.some((t) => t.includes("touris")))
    out.push(`Forte attractivité touristique, surtout en haute saison`);
  return out;
}

function geoNotable(city: CitySeed): string | null {
  if (!city.population) return null;
  if (city.population > 500000) return `Plus de ${Math.round(city.population / 1000)} 000 habitants — métropole majeure`;
  if (city.population > 200000) return `Grande ville de ${Math.round(city.population / 1000)} 000 habitants`;
  if (city.population < 30000) return `Ville à taille humaine (${city.population.toLocaleString("fr-FR")} hab.)`;
  return null;
}

function elevationNotable(city: CitySeed): string | null {
  if (!city.elevation) return null;
  if (city.elevation >= 600) return `Située en altitude (${city.elevation} m), climat plus frais l'été`;
  if (city.elevation <= 10) return `Ville côtière ou de plaine (${city.elevation} m d'altitude)`;
  return null;
}

function buildIntro(city: CitySeed): string {
  const g = city.scores.global;
  const tier =
    g >= 8.0 ? "se classe parmi les meilleures villes françaises pour la qualité de vie"
    : g >= 7.0 ? "offre une qualité de vie clairement au-dessus de la moyenne"
    : g >= 6.0 ? "présente un profil équilibré, sans excès dans un sens ni dans l'autre"
    : "présente quelques fragilités sur la qualité de vie selon nos indicateurs";

  const tagsPart = city.characterTags.slice(0, 3).join(", ");
  const popPart = city.population
    ? `${city.population.toLocaleString("fr-FR")} habitants`
    : "ville française";
  return `${city.name} (${city.department}, ${city.region}) ${tier}. Avec ses ${popPart}, on la décrit souvent comme ${tagsPart}. Score global ${g.toFixed(1)}/10, calibré sur 340 villes.`;
}

export function buildCityNarrative(
  city: CitySeed,
  housing: HousingData | undefined
): CityNarrative {
  const axes: ScoreKey[] = ["nature", "transport", "culture", "safety", "schools", "remoteWork", "cost", "life"];

  // Pros: top 3-5 axes by score, only those scoring well
  const sortedDesc = [...axes].sort((a, b) => city.scores[b] - city.scores[a]);
  const pros: string[] = [];
  for (const k of sortedDesc) {
    const line = pickAxisLine(city.scores[k], k, "pro");
    if (line) pros.push(line);
    if (pros.length >= 4) break;
  }
  const climateP = climateLine(city);
  if (climateP && (climateP.includes("ensoleillé") || climateP.includes("Ensoleillement")) && pros.length < 5) {
    pros.push(climateP);
  }
  const housingP = housingPro(city, housing);
  if (housingP && pros.length < 5) pros.push(housingP);
  if (pros.length < 3) {
    pros.push(`Identité ${city.characterTags[0] ?? "locale"} marquée`);
  }

  // Cons: bottom axes scoring poorly
  const sortedAsc = [...axes].sort((a, b) => city.scores[a] - city.scores[b]);
  const cons: string[] = [];
  for (const k of sortedAsc) {
    const line = pickAxisLine(city.scores[k], k, "con");
    if (line) cons.push(line);
    if (cons.length >= 4) break;
  }
  const housingC = housingCon(city, housing);
  if (housingC && cons.length < 5) cons.push(housingC);
  const climateC = climateLine(city);
  if (climateC && !climateC.includes("ensoleillé") && !climateC.includes("Ensoleillement") && cons.length < 5) {
    cons.push(climateC);
  }
  if (cons.length < 3) {
    if (city.scores.cost < 7) cons.push("Prix immobiliers en hausse continue ces dernières années");
    if (cons.length < 3) cons.push("Comme partout, certains quartiers à éviter en soirée");
    if (cons.length < 3) cons.push("Saisonnalité marquée : tout le monde n'apprécie pas le rythme");
  }

  // Notable facts
  const notable: string[] = [];
  notable.push(...tagBasedNotable(city));
  const geo = geoNotable(city);
  if (geo) notable.push(geo);
  const ele = elevationNotable(city);
  if (ele) notable.push(ele);
  if (notable.length < 2) {
    notable.push(`Préfecture ou sous-préfecture du département ${city.department}`);
  }

  return {
    intro: buildIntro(city),
    pros: pros.slice(0, 5),
    cons: cons.slice(0, 5),
    notable: notable.slice(0, 3),
  };
}
