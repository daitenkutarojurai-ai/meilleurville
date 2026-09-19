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
  "clermont-ferrand": { tram: true, bhns: true, velo: "moyen" },
  aubagne: { tram: true, bhns: true },

  // — TGV sans métro/tram dense —
  // ⚠️ Nancy portait `tram: true` : c'est faux depuis 2023. Le TVR (transport
  // léger guidé sur pneus, souvent appelé « le tram » localement) a été retiré
  // du service, et la ligne 1 roule en trolleybus 100 % électrique depuis le
  // 5 avril 2025, aux côtés de lignes BHNS. Il n'y a pas de tramway à Nancy en
  // 2026 ; un mode ferré n'est rediscuté qu'à l'horizon 2035. Ne pas
  // « restaurer » le tag sur la foi de l'usage local ou d'un vieux plan.
  nancy: { tgv: true, bhns: true },
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
  // Ajoutés le 2026-09-12. Les deux villes rendaient `{}`, que la table
  // documente comme « inconnu » et non comme « pas de desserte » : une surface
  // qui lit `{}` retombe sur le résumé par score et n'affirme rien. Mais un
  // rédacteur, lui, lit l'absence comme une absence, et c'est ainsi qu'un guide
  // peut écrire « pas de TGV » d'une ville qui en a un. Vérifié avant écriture :
  // Colmar est reliée à Paris-Est par un TGV inOui direct (2 h 20 au plus
  // rapide), Montauban-Ville-Bourbon est desservie par TGV inOui et Ouigo sur
  // l'axe Paris-Bordeaux-Toulouse. Ni tram ni métro dans l'une ni dans l'autre ;
  // `bhns` et `velo` restent non renseignés faute de vérification, pas par
  // constat d'absence.
  colmar: { tgv: true },
  montauban: { tgv: true },

  // Ajoutés le 2026-09-16, même motif qu'au 2026-09-12 : les deux rendaient
  // `{}`, que la table documente comme « inconnu » et non comme « pas de
  // desserte », et un rédacteur lit l'absence comme une absence. Vérifié avant
  // écriture : Vendôme-Villiers-sur-Loir TGV est reliée à Paris-Montparnasse
  // par TGV inOui en 42 à 44 min, 7 à 8 liaisons directes par jour, la gare
  // étant à ~5 km du centre avec une navette du réseau MOVE calée sur chaque
  // arrivée et chaque départ ; La Roche-sur-Yon est desservie par TGV inOui
  // depuis Paris-Montparnasse via Nantes, ~16 trains/jour, 3 h 06 au plus
  // rapide. Ni tram ni métro dans l'une ni dans l'autre ; `bhns` et `velo`
  // restent non renseignés faute de vérification, pas par constat d'absence.
  // ⚠️ Vérifiées le même jour et volontairement NON ajoutées, faute de TGV :
  // Vienne (TER Lyon 18 min), Villefranche-sur-Saône (TER Lyon 21 min),
  // Compiègne (TER Paris-Nord direct, ~30/jour), Brive-la-Gaillarde
  // (Intercités Paris-Austerlitz, ~4 h 35), Dieppe (correspondance à
  // Rouen-Rive-Droite, direct Paris uniquement le week-end). Anglet n'a pas de
  // gare du tout et se rejoint par Bayonne ou Biarritz. Ne pas leur poser
  // `tgv: true` : le type ne sait pas exprimer « vérifié absent », donc ces
  // six-là restent hors table et cette note est leur seule trace.
  vendome: { tgv: true },
  "la-roche-sur-yon": { tgv: true },

  // ⚠️ Vérifiées le 2026-09-19 pour le batch 7 de la série célibataire et
  // volontairement NON ajoutées, faute de TGV : Albi (TER liO depuis
  // Toulouse-Matabiau, ~53 min, une dizaine de liaisons par jour, gares
  // Albi-Ville et Albi-Madeleine), Beauvais (TER Hauts-de-France depuis
  // Paris-Nord, 1 h 05 au plus rapide, ~1 h 19 en moyenne, une vingtaine de
  // liaisons par jour). Arras, Angoulême, Lorient et Vannes, les quatre autres
  // villes du lot, sont déjà dans la table avec leur TGV. Même raison qu'au
  // 2026-09-16 : le type ne sait pas exprimer « vérifié absent », donc ces
  // deux-là restent hors table et cette note est leur seule trace. Ne pas leur
  // poser `tgv: true`, et ne pas déduire de leur `{}` qu'elles sont
  // inaccessibles en train : elles le sont très bien, en TER.

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
  argenteuil: {},
  colombes: {},
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
