/**
 * Prépositions de lieu pour les titres « Où vivre en Gironde ? » (2026-11-26).
 * « en » est la règle ; les tables listent les exceptions, département par département
 * (102 noms du seed, Métropole de Lyon comprise). Zéro import : utilisable partout.
 */

const DEPT_DANS_LE = new Set([
  "Bas-Rhin", "Calvados", "Cantal", "Cher", "Doubs", "Finistère", "Gard", "Gers", "Haut-Rhin", "Jura",
  "Loir-et-Cher", "Loiret", "Lot", "Morbihan", "Nord", "Pas-de-Calais", "Puy-de-Dôme", "Rhône", "Tarn",
  "Tarn-et-Garonne", "Territoire de Belfort", "Val-d'Oise", "Val-de-Marne", "Var", "Vaucluse",
]);
const DEPT_DANS_LA = new Set([
  "Creuse", "Drôme", "Loire", "Manche", "Marne", "Meuse", "Nièvre", "Sarthe", "Somme", "Vienne", "Métropole de Lyon",
]);
const DEPT_DANS_L = new Set(["Ain", "Aisne", "Allier", "Aube", "Aude", "Essonne", "Eure", "Hérault", "Indre", "Oise", "Orne", "Yonne"]);
const DEPT_DANS_LES = new Set([
  "Alpes-Maritimes", "Alpes-de-Haute-Provence", "Ardennes", "Bouches-du-Rhône", "Côtes-d'Armor", "Deux-Sèvres",
  "Hautes-Alpes", "Hautes-Pyrénées", "Hauts-de-Seine", "Landes", "Pyrénées-Atlantiques", "Pyrénées-Orientales",
  "Vosges", "Yvelines",
]);
const PLACE_A = new Set(["Paris", "La Réunion", "Mayotte"]);

/** Ce qui précède le nom : « en », « dans le », « dans l' » (sans espace), « à »… */
export function departementPrefix(dept: string): string {
  if (PLACE_A.has(dept)) return "à ";
  if (DEPT_DANS_LE.has(dept)) return "dans le ";
  if (DEPT_DANS_LA.has(dept)) return "dans la ";
  if (DEPT_DANS_L.has(dept)) return "dans l'";
  if (DEPT_DANS_LES.has(dept)) return "dans les ";
  return "en ";
}

/** « en Gironde », « dans les Landes », « dans l'Ain », « à Paris ». */
export const inDepartement = (dept: string) => `${departementPrefix(dept)}${dept}`;

const REGION_PREFIX: Record<string, string> = {
  "Grand Est": "dans le ",
  "Hauts-de-France": "dans les ",
  "Pays de la Loire": "dans les ",
  "La Réunion": "à ",
  Mayotte: "à ",
};

export const regionPrefix = (region: string) => REGION_PREFIX[region] ?? "en ";

/** « en Bretagne », « dans les Hauts-de-France », « à La Réunion ». */
export const inRegion = (region: string) => `${regionPrefix(region)}${region}`;
