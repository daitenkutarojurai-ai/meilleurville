// Transit-network presence per city. Hand-curated from public network maps
// (RATP, SNCF Voyageurs, GART). Only confirmed entries are listed; unknown
// slugs return `{}` so the page falls back to the score-only summary.

export type Transit = {
  metro?: boolean;          // heavy or light metro
  tram?: boolean;           // modern tramway network
  tgv?: boolean;            // direct TGV inOui / Ouigo from main station
  rer?: boolean;            // RER A–E (Île-de-France)
  velo?: "fort" | "moyen";  // notable cycling network
  bhns?: boolean;           // bus à haut niveau de service
};

const T: Record<string, Transit> = {
  // — Métro —
  paris: { metro: true, tram: true, tgv: true, rer: true, velo: "fort", bhns: true },
  lyon: { metro: true, tram: true, tgv: true, velo: "fort", bhns: true },
  marseille: { metro: true, tram: true, tgv: true, bhns: true },
  lille: { metro: true, tram: true, tgv: true, velo: "fort", bhns: true },
  toulouse: { metro: true, tram: true, tgv: true, velo: "fort", bhns: true },
  rennes: { metro: true, tgv: true, velo: "fort", bhns: true },
  rouen: { metro: true, velo: "moyen", bhns: true },

  // — Tram (sans métro) —
  strasbourg: { tram: true, tgv: true, velo: "fort", bhns: true },
  bordeaux: { tram: true, tgv: true, velo: "fort", bhns: true },
  nantes: { tram: true, tgv: true, velo: "fort", bhns: true },
  montpellier: { tram: true, tgv: true, velo: "moyen", bhns: true },
  nice: { tram: true, tgv: true, bhns: true },
  grenoble: { tram: true, tgv: true, velo: "fort", bhns: true },
  "saint-etienne": { tram: true, tgv: true, bhns: true },
  tours: { tram: true, tgv: true, velo: "moyen", bhns: true },
  reims: { tram: true, tgv: true, bhns: true },
  caen: { tram: true, bhns: true },
  brest: { tram: true, tgv: true, bhns: true },
  angers: { tram: true, tgv: true, velo: "moyen", bhns: true },
  dijon: { tram: true, tgv: true, bhns: true },
  besancon: { tram: true, tgv: true, bhns: true },
  "le-mans": { tram: true, tgv: true, bhns: true },
  "le-havre": { tram: true, bhns: true },
  orleans: { tram: true, velo: "moyen", bhns: true },
  valenciennes: { tram: true, bhns: true },
  mulhouse: { tram: true, tgv: true, velo: "moyen", bhns: true },
  avignon: { tram: true, tgv: true, bhns: true },
  nancy: { tram: true, tgv: true, bhns: true },
  "clermont-ferrand": { tram: true, bhns: true, velo: "moyen" },
  aubagne: { tram: true, bhns: true },

  // — TGV sans métro/tram dense —
  "aix-en-provence": { tgv: true, bhns: true },
  perpignan: { tgv: true, bhns: true },
  metz: { tgv: true, bhns: true },
  poitiers: { tgv: true, bhns: true },
  "la-rochelle": { tgv: true, velo: "fort", bhns: true },
  "saint-malo": { tgv: true },
  vannes: { tgv: true },
  quimper: { tgv: true },
  bayonne: { tgv: true },
  biarritz: { tgv: true },
  pau: { tgv: true, bhns: true },
  tarbes: { tgv: true },
  agen: { tgv: true },
  arras: { tgv: true },
  valence: { tgv: true, bhns: true },
  chambery: { tgv: true },
  annecy: { tgv: true, velo: "moyen" },
  belfort: { tgv: true },
  montbeliard: { tgv: true },
  macon: { tgv: true },
  "bourg-en-bresse": { tgv: true },
  "le-creusot": { tgv: true },
  "saint-brieuc": { tgv: true },
  morlaix: { tgv: true },
  guingamp: { tgv: true },
  lorient: { tgv: true },
  "saint-nazaire": { tgv: true },
  laval: { tgv: true },
  toulon: { tgv: true, bhns: true },
  carcassonne: { tgv: true },
  narbonne: { tgv: true },
  beziers: { tgv: true },
  cannes: { tgv: true },
  antibes: { tgv: true },
  "saint-raphael": { tgv: true },
  angouleme: { tgv: true, bhns: true },
  niort: { tgv: true },

  // — Banlieue parisienne — RER & métro Paris —
  "boulogne-billancourt": { metro: true, rer: true, tram: true, velo: "moyen" },
  "issy-les-moulineaux": { metro: true, rer: true, tram: true, velo: "moyen" },
  "levallois-perret": { metro: true, velo: "moyen" },
  "neuilly-sur-seine": { metro: true, rer: true, velo: "moyen" },
  "saint-denis": { metro: true, rer: true, tram: true, tgv: true },
  montreuil: { metro: true, tram: true },
  pantin: { metro: true, rer: true, tram: true },
  "ivry-sur-seine": { metro: true, rer: true, tram: true },
  "vitry-sur-seine": { rer: true, tram: true },
  creteil: { metro: true, rer: true },
  vincennes: { metro: true, rer: true },
  versailles: { rer: true, tgv: true },
  "saint-germain-en-laye": { rer: true },
  "rueil-malmaison": { rer: true, tram: true },
  cergy: { rer: true },
  argenteuil: { tram: true },
  colombes: { tram: true },
  nanterre: { rer: true, tram: true },
  courbevoie: { rer: true, tram: true },
  "evry-courcouronnes": { rer: true, tgv: true },
  "noisy-le-grand": { rer: true },
  massy: { rer: true, tgv: true },
  pontoise: { rer: true },
  etampes: { rer: true },

  // — DROM — pas de réseaux ferrés urbains; quelques BHNS —
  "saint-denis-reunion": { bhns: true },
  "fort-de-france": { bhns: true },
};

export function getTransit(slug: string): Transit {
  return T[slug] ?? {};
}

export function transitTags(t: Transit): string[] {
  const out: string[] = [];
  if (t.metro) out.push("Métro");
  if (t.rer) out.push("RER");
  if (t.tram) out.push("Tramway");
  if (t.tgv) out.push("TGV");
  if (t.bhns) out.push("BHNS");
  if (t.velo === "fort") out.push("Vélo+++");
  else if (t.velo === "moyen") out.push("Vélo");
  return out;
}
