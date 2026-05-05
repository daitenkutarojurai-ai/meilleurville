// Higher-education presence per city. Hand-curated from MESR / CPU /
// Conférence des grandes écoles / CGE 2024 lists. Only confirmed entries
// are listed; unknown slugs return `{}` so the page falls back to the
// score-only summary.

export type Education = {
  university?: string;        // main université name when one is anchored in town
  cpge?: boolean;             // notable CPGE preparing for grandes écoles
  ingenieur?: string[];       // engineering schools (INSA, ENSAM, ENS, École Centrale, etc.)
  commerce?: string[];        // business schools (HEC, ESSEC, EM, Audencia, etc.)
  iep?: boolean;              // Sciences Po campus
  artsDesign?: string[];      // major art/design schools (Beaux-Arts, etc.)
};

const E: Record<string, Education> = {
  // — Île-de-France —
  paris: {
    university: "Sorbonne · Paris Cité · PSL",
    cpge: true,
    ingenieur: ["Mines Paris", "ENS Ulm", "ESPCI", "Centrale", "Télécom Paris (campus mixte)"],
    commerce: ["ESCP", "Dauphine"],
    iep: true,
    artsDesign: ["Beaux-Arts de Paris", "ENSAD", "École du Louvre"],
  },
  versailles: { university: "UVSQ — Université Paris-Saclay", cpge: true },
  "saint-germain-en-laye": { cpge: true },
  cergy: { university: "CY Cergy Paris Université", commerce: ["ESSEC"] },
  "evry-courcouronnes": { university: "Université d'Évry Paris-Saclay", ingenieur: ["Télécom SudParis (proche)"] },
  nanterre: { university: "Université Paris Nanterre" },
  creteil: { university: "Université Paris-Est Créteil (UPEC)" },
  "saint-denis": { university: "Université Paris 8 Vincennes – Saint-Denis" },
  "boulogne-billancourt": { commerce: ["IÉSEG (annexe)"] },
  "issy-les-moulineaux": {},
  "levallois-perret": {},
  "neuilly-sur-seine": {},
  fontainebleau: { commerce: ["INSEAD"] },
  massy: { ingenieur: ["IOGS Institut d'Optique (proche Saclay)"] },

  // — Grandes métropoles régionales —
  lyon: {
    university: "Université de Lyon (Lyon 1, 2, 3)",
    cpge: true,
    ingenieur: ["INSA Lyon", "Centrale Lyon", "ENS Lyon", "CPE Lyon"],
    commerce: ["EM Lyon"],
    iep: true,
  },
  villeurbanne: { university: "Université Lyon 1 — campus de la Doua", ingenieur: ["INSA Lyon"] },
  marseille: {
    university: "Aix-Marseille Université",
    cpge: true,
    ingenieur: ["Centrale Marseille", "Polytech Marseille"],
    commerce: ["KEDGE BS"],
  },
  "aix-en-provence": {
    university: "Aix-Marseille Université",
    cpge: true,
    iep: true,
    commerce: ["IAE Aix"],
  },
  toulouse: {
    university: "Université de Toulouse (UT1, UT2J, UT3)",
    cpge: true,
    ingenieur: ["INSA Toulouse", "ISAE-Supaéro", "ENAC", "IMT Mines Albi (proche)"],
    commerce: ["TBS Education"],
    iep: true,
  },
  bordeaux: {
    university: "Université de Bordeaux",
    cpge: true,
    ingenieur: ["ENSEIRB-MATMECA (Bordeaux INP)"],
    commerce: ["KEDGE BS"],
    iep: true,
  },
  lille: {
    university: "Université de Lille",
    cpge: true,
    ingenieur: ["Centrale Lille", "IMT Nord Europe"],
    commerce: ["EDHEC", "IÉSEG", "SKEMA (campus)"],
    iep: true,
  },
  rennes: {
    university: "Université de Rennes (Rennes 1 + Rennes 2)",
    cpge: true,
    ingenieur: ["INSA Rennes", "ENS Rennes", "CentraleSupélec (campus)"],
    commerce: ["Rennes School of Business"],
    iep: true,
  },
  nantes: {
    university: "Nantes Université",
    cpge: true,
    ingenieur: ["Centrale Nantes", "École des Mines de Nantes (IMT Atlantique)", "Polytech Nantes"],
    commerce: ["Audencia"],
  },
  strasbourg: {
    university: "Université de Strasbourg",
    cpge: true,
    ingenieur: ["ENGEES", "INSA Strasbourg", "Télécom Physique Strasbourg"],
    commerce: ["EM Strasbourg"],
    iep: true,
  },
  montpellier: {
    university: "Université de Montpellier · Université Paul-Valéry",
    cpge: true,
    ingenieur: ["Polytech Montpellier", "SupAgro Montpellier"],
    commerce: ["Montpellier Business School"],
  },
  nice: {
    university: "Université Côte d'Azur",
    cpge: true,
    ingenieur: ["Polytech Nice Sophia"],
    commerce: ["SKEMA", "EDHEC (campus Nice)"],
  },
  grenoble: {
    university: "Université Grenoble Alpes",
    cpge: true,
    ingenieur: ["Grenoble INP (Phelma, Ensimag, etc.)"],
    commerce: ["Grenoble Ecole de Management"],
    iep: true,
  },
  "saint-etienne": {
    university: "Université Jean Monnet",
    cpge: true,
    ingenieur: ["Mines Saint-Étienne", "Telecom Saint-Étienne"],
  },

  // — Autres universités —
  reims: { university: "Université de Reims Champagne-Ardenne", cpge: true, commerce: ["NEOMA BS"], iep: true },
  rouen: { university: "Université de Rouen Normandie", cpge: true, ingenieur: ["INSA Rouen Normandie"], commerce: ["NEOMA BS"] },
  caen: { university: "Université de Caen Normandie", cpge: true, ingenieur: ["ENSICAEN"] },
  "le-havre": { university: "Université Le Havre Normandie", commerce: ["EM Normandie"] },
  amiens: { university: "Université de Picardie Jules Verne", cpge: true },
  poitiers: { university: "Université de Poitiers", cpge: true, ingenieur: ["ENSI Poitiers (ENSIP)"], iep: true },
  tours: { university: "Université de Tours", cpge: true, ingenieur: ["Polytech Tours"] },
  orleans: { university: "Université d'Orléans", cpge: true, ingenieur: ["Polytech Orléans"] },
  brest: { university: "Université de Bretagne Occidentale", cpge: true, ingenieur: ["IMT Atlantique", "ENIB", "ENSTA Bretagne"] },
  angers: { university: "Université d'Angers", cpge: true, ingenieur: ["Arts et Métiers (campus)", "ESEO"], commerce: ["ESSCA"] },
  "le-mans": { university: "Le Mans Université", cpge: true },
  limoges: { university: "Université de Limoges", cpge: true, ingenieur: ["ENSIL-ENSCI"] },
  "clermont-ferrand": { university: "Université Clermont Auvergne", cpge: true, ingenieur: ["Sigma Clermont"], commerce: ["ESC Clermont"] },
  dijon: { university: "Université de Bourgogne", cpge: true, commerce: ["BSB Burgundy"], iep: true },
  besancon: { university: "Université de Franche-Comté", cpge: true, ingenieur: ["ENSMM", "Supmicrotech"] },
  nancy: { university: "Université de Lorraine", cpge: true, ingenieur: ["Mines Nancy", "ENSEM", "Telecom Nancy", "ENSIC"] },
  metz: { university: "Université de Lorraine", cpge: true, ingenieur: ["CentraleSupélec (campus Metz)", "ENIM"] },
  mulhouse: { university: "Université de Haute-Alsace", cpge: true, ingenieur: ["ENSISA", "ENSCMu"] },
  pau: { university: "Université de Pau et des Pays de l'Adour (UPPA)", cpge: true, ingenieur: ["ENSGTI", "ISA BTP"] },
  bayonne: { university: "Antenne UPPA — Côte basque", commerce: ["ESC Pau (proche)"] },
  perpignan: { university: "Université de Perpignan Via Domitia", cpge: true },
  nimes: { university: "Université de Nîmes", cpge: true },
  avignon: { university: "Avignon Université", cpge: true },
  "la-rochelle": { university: "La Rochelle Université", cpge: true, ingenieur: ["EIGSI"], commerce: ["Excelia BS"] },
  niort: { university: "Antenne Université de Poitiers — IRIAF" },
  toulon: { university: "Université de Toulon", cpge: true, ingenieur: ["SeaTech / ISEN"] },
  troyes: { university: "Université de Technologie de Troyes (UTT)", commerce: ["Y SCHOOLS / SCBS"] },
  compiegne: { university: "Université de Technologie de Compiègne (UTC)" },
  belfort: { university: "Université de Technologie de Belfort-Montbéliard (UTBM)" },
  "valenciennes": { university: "Université Polytechnique Hauts-de-France (UPHF)" },
  arras: { university: "Université d'Artois" },
  lens: { university: "Antenne Université d'Artois" },
  douai: { ingenieur: ["IMT Nord Europe (campus Douai)"] },
  cambrai: {},
  "boulogne-sur-mer": { university: "ULCO — Côte d'Opale" },
  calais: { university: "ULCO — Côte d'Opale" },
  dunkerque: { university: "ULCO — Côte d'Opale" },
  chambery: { university: "Université Savoie Mont Blanc", cpge: true, ingenieur: ["Polytech Annecy-Chambéry"] },
  annecy: { university: "Université Savoie Mont Blanc — campus", cpge: true, ingenieur: ["Polytech Annecy-Chambéry"] },
  corte: { university: "Università di Corsica — Pasquale Paoli", cpge: true },
  ajaccio: { cpge: true },
  bastia: { cpge: true },
  bourges: { ingenieur: ["INSA Centre Val de Loire"] },
  "blois": { ingenieur: ["INSA Centre Val de Loire (campus)"] },
  chartres: {},
  "saint-malo": {},
  vannes: { university: "Université Bretagne Sud — campus Vannes", ingenieur: ["ENSIBS"] },
  lorient: { university: "Université Bretagne Sud — campus Lorient", ingenieur: ["ENSIBS"] },
  quimper: { university: "Antenne UBO — Pôle universitaire", cpge: true },
  "saint-brieuc": { cpge: true },
  laval: { university: "Antenne Le Mans Université — Laval" },
  cholet: {},
  agen: { cpge: true },
  cahors: {},
  rodez: {},
  albi: { university: "Antenne Champollion (Toulouse)", ingenieur: ["IMT Mines Albi"] },
  carcassonne: { cpge: true },
  narbonne: {},
  beziers: {},
  sete: {},
  arles: {},
  cannes: {},
  antibes: {},
  hyeres: {},
  frejus: {},
  saumur: {},
  vichy: {},
  moulins: {},
  nevers: {},
  auxerre: { cpge: true },
  sens: {},
  "bourg-en-bresse": { cpge: true },
  macon: { cpge: true },
  "chalon-sur-saone": { cpge: true },
  beaune: {},
  vesoul: {},
  // DROM
  "saint-denis-reunion": { university: "Université de La Réunion", cpge: true, ingenieur: ["ESIROI"] },
  "saint-pierre-reunion": { university: "Université de La Réunion — campus Sud" },
  "saint-paul-reunion": {},
  "le-tampon": { university: "Université de La Réunion — campus Le Tampon" },
  "fort-de-france": { university: "Université des Antilles — pôle Martinique", cpge: true },
  "le-lamentin": {},
  "les-abymes": {},
  "pointe-a-pitre": { university: "Université des Antilles — pôle Guadeloupe", cpge: true },
  "baie-mahault": {},
  cayenne: { university: "Université de Guyane", cpge: true },
  "saint-laurent-du-maroni": {},
  mamoudzou: { university: "Centre Universitaire de Formation et de Recherche de Mayotte (CUFR)" },
};

export function getEducation(slug: string): Education {
  return E[slug] ?? {};
}

export function educationTags(e: Education): string[] {
  const out: string[] = [];
  if (e.university) out.push("Université");
  if (e.cpge) out.push("CPGE");
  if (e.ingenieur && e.ingenieur.length) out.push("École d'ingénieur");
  if (e.commerce && e.commerce.length) out.push("École de commerce");
  if (e.iep) out.push("Sciences Po");
  if (e.artsDesign && e.artsDesign.length) out.push("Beaux-Arts / Design");
  return out;
}
