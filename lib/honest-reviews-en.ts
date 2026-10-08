// English display tables for the honest-review surfaces.
//
// `lib/honest-reviews.ts` builds its bullets, one-liner and profile labels in
// French. Surfaces that render in English translate at the display site with
// these tables (the lib is untouched, so FR output stays byte-identical).
// No imports: this module is pulled into the client bundle by HonestReviewCard.

export const AXIS_EN: Record<string, { label: string; pro: string; con: string }> = {
  life: { label: "Quality of life", pro: "Outstanding everyday quality of life", con: "Everyday life lacks distinction" },
  transport: { label: "Transport", pro: "Dense network — no car needed", con: "Car almost mandatory" },
  nature: { label: "Nature access", pro: "Direct access to nature, water or mountains", con: "Very few accessible green spaces" },
  cost: { label: "Cost of living", pro: "Affordable rents and prices", con: "Purchasing power under pressure" },
  safety: { label: "Safety", pro: "High sense of personal safety", con: "Significant perceived insecurity" },
  culture: { label: "Culture", pro: "Rich cultural scene and festivals", con: "Thin cultural offering" },
  remoteWork: { label: "Remote work", pro: "Fibre + coworking + great setting", con: "Below-average remote-work conditions" },
  schools: { label: "Schools", pro: "Top-tier schooling options", con: "Below-average school choice" },
};

export const OWNER_LABEL_EN: Record<string, string> = {
  score_canicule: "Heat resilience",
  score_solitude: "Social connection",
  score_bruit: "Noise level",
  score_securite_nocturne: "Night safety",
  score_sans_voiture: "Car-free living",
  score_teletravail: "Remote connectivity",
  score_qualite_air: "Air quality",
  score_securite_femme_seule: "Safety for women",
  score_jeune_actif: "Young professional scene",
  score_famille: "Family-friendliness",
};

export const OWNER_EN_PRO: Record<string, string> = {
  score_canicule: "Stays cool in summer",
  score_solitude: "Strong social fabric — low isolation risk",
  score_bruit: "Quieter than average",
  score_securite_nocturne: "Safe to go out at night",
  score_sans_voiture: "Fully liveable without a car",
  score_teletravail: "Great connectivity for remote work",
  score_qualite_air: "Excellent air quality",
  score_securite_femme_seule: "Safe for women living alone",
  score_jeune_actif: "Active 25-35 community",
  score_famille: "Great for raising children",
};

export const OWNER_EN_CON: Record<string, string> = {
  score_canicule: "Summers increasingly uncomfortable",
  score_solitude: "High social isolation risk",
  score_bruit: "Significant noise issues",
  score_securite_nocturne: "Stay vigilant at night in some areas",
  score_sans_voiture: "Very difficult without a car",
  score_teletravail: "Limited fibre coverage and coworking",
  score_qualite_air: "Degraded air quality",
  score_securite_femme_seule: "Below-average safety for women alone",
  score_jeune_actif: "Young demographic under-represented",
  score_famille: "Not the best choice for families",
};

/** Every profile of PROFILE_PAGES, keyed by its (French) slug. */
export const PROFILE_LABEL_EN: Record<string, string> = {
  "familles-avec-enfants": "Families with children",
  "jeunes-actifs": "Young professionals",
  "jeunes-diplomes": "Recent graduates (ages 20-26)",
  retraites: "Retirees",
  freelances: "Freelancers",
  teletravailleurs: "Remote workers",
  etudiants: "Students",
  "sans-voiture": "Car-free living",
  premium: "Premium lifestyle",
  "solo-femme": "Women living solo",
  "couple-sans-enfant": "Couples without children",
  celibataires: "Singles (ages 25-45)",
  "expat-retour": "Returning expats",
  "primo-accedants": "First-time buyers",
  "familles-monoparentales": "Single parents",
  "familles-nombreuses": "Large families",
  "amateurs-de-plein-air": "Outdoor enthusiasts",
  "neo-ruraux": "New rural movers",
  "anti-canicule": "Heatwave avoiders",
  "sensibles-au-bruit": "Noise-sensitive residents",
  "asthmatiques-allergiques": "Asthma and allergy sufferers",
  "jeunes-parents": "New parents (children 0-3)",
  "investisseurs-locatifs": "Rental investors",
  "familles-avec-ados": "Families with teenagers (12-17)",
  sportifs: "Regular athletes",
  "proches-aidants": "Family caregivers",
  "futurs-retraites": "Future retirees (ages 55-65)",
  "cyclistes-urbains": "Urban cyclists",
  "mobilite-reduite": "Reduced-mobility residents",
  "amateurs-de-littoral": "Coast lovers",
  "amateurs-de-montagne": "Mountain lovers",
  "amateurs-de-culture": "Culture lovers",
  "navetteurs-hybrides": "Hybrid commuters (2-3 days on site)",
  "suivi-medical-regulier": "Regular medical follow-up",
  "travailleurs-frontaliers": "Cross-border commuters",
  "famille-a-l-etranger": "Families living abroad",
  "professionnels-de-sante": "Healthcare professionals",
};

/** French → English for the labels/details already built by lib/honest-reviews.
 *  Keyed by source because "Télétravail" is both an axis and an owner label. */
function frToEn(): { axis: Map<string, string>; owner: Map<string, string> } {
  const axis = new Map<string, string>();
  const owner = new Map<string, string>();
  const AXIS_FR: Record<string, { label: string; pro: string; con: string }> = {
    life: { label: "Qualité de vie", pro: "Art de vivre quotidien soigné", con: "Quotidien sans signe distinctif" },
    transport: { label: "Transports", pro: "Réseau dense, on se passe de voiture", con: "Voiture quasi obligatoire" },
    nature: { label: "Nature", pro: "Accès direct nature/eau/montagne", con: "Très peu d'espaces naturels accessibles" },
    cost: { label: "Coût de la vie", pro: "Loyers et prix accessibles", con: "Pouvoir d'achat sous pression" },
    safety: { label: "Sécurité", pro: "Sentiment de sécurité élevé", con: "Insécurité ressentie significative" },
    culture: { label: "Culture", pro: "Scène culturelle dense, festivals", con: "Offre culturelle pauvre" },
    remoteWork: { label: "Télétravail", pro: "Fibre + coworking + cadre", con: "Conditions remote en retrait" },
    schools: { label: "Écoles", pro: "Offre scolaire de premier plan", con: "Offre scolaire dans la moyenne basse" },
  };
  for (const [k, fr] of Object.entries(AXIS_FR)) {
    axis.set(fr.label, AXIS_EN[k].label);
    axis.set(fr.pro, AXIS_EN[k].pro);
    axis.set(fr.con, AXIS_EN[k].con);
  }
  axis.set("Score global", "Overall score");
  axis.set("Excellence générale", "All-round excellence");
  axis.set("Plusieurs axes en retrait", "Several axes lagging");
  const OWNER_FR: Record<string, { label: string; pro: string; con: string }> = {
    score_canicule: { label: "Résistance canicule", pro: "Bien tempéré l'été", con: "Étés de plus en plus chauds" },
    score_solitude: { label: "Lien social", pro: "Tissu social fort, on ne s'y sent pas seul", con: "Isolement social fréquent (forte part de ménages seuls)" },
    score_bruit: { label: "Calme sonore", pro: "Calme sonore au-dessus de la moyenne", con: "Nuisances sonores marquées" },
    score_securite_nocturne: { label: "Sécurité nocturne", pro: "Sortir le soir sans crainte", con: "Vigilance la nuit dans certains quartiers" },
    score_sans_voiture: { label: "Vie sans voiture", pro: "Vivable sans voiture", con: "Sans voiture, la vie est compliquée" },
    score_teletravail: { label: "Télétravail", pro: "Très bon cadre pour télétravailler", con: "Couverture fibre et coworking limités" },
    score_qualite_air: { label: "Qualité air", pro: "Qualité de l'air remarquable", con: "Qualité de l'air dégradée" },
    score_securite_femme_seule: { label: "Sécurité femme seule", pro: "Sentiment de sécurité solo-femme", con: "Sentiment de sécurité solo-femme en retrait" },
    score_jeune_actif: { label: "Jeune actif", pro: "Communauté 25-35 ans dynamique", con: "Démographie jeune peu représentée" },
    score_famille: { label: "Famille", pro: "Très bien pour élever des enfants", con: "Pas le meilleur choix pour une famille" },
  };
  for (const [k, fr] of Object.entries(OWNER_FR)) {
    owner.set(fr.label, OWNER_LABEL_EN[k]);
    owner.set(fr.pro, OWNER_EN_PRO[k]);
    owner.set(fr.con, OWNER_EN_CON[k]);
  }
  return { axis, owner };
}

let cache: ReturnType<typeof frToEn> | null = null;

/** Translate one French bullet string (label or detail) built by the lib. */
export function bulletTextEn(text: string, source: "axis" | "owner"): string {
  cache ??= frToEn();
  return (source === "axis" ? cache.axis : cache.owner).get(text) ?? text;
}

/** English twin of buildOneLine() in lib/honest-reviews.ts (same thresholds). */
export function oneLineEn(
  cityName: string,
  globalScore: number,
  strengths: Array<{ label: string; detail: string; score: number }>,
  weaknesses: Array<{ label: string; detail: string; score: number }>,
): string {
  const top = strengths[0];
  const worst = weaknesses[0];
  const namedStrength = top ? top.detail.toLowerCase() : `a global score of ${globalScore.toFixed(1)}/10`;
  if (worst && worst.score < 4.0) return `${cityName} stands out for ${namedStrength}, but ${worst.detail.toLowerCase()}.`;
  if (worst && worst.score < 5.0) return `${cityName} scores well on ${namedStrength}; keep an eye on ${worst.label.toLowerCase()}.`;
  return `${cityName}: a solid profile with ${namedStrength} and no major drawback.`;
}
