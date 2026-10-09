import { CITIES_SEED } from "@/data/cities-seed";

// Départements limitrophes (frontière terrestre commune), table écrite à la main.
// Les centroïdes de villes du seed ne disent pas où passe une frontière : une
// dérivation par distance fabriquerait des voisins faux. La table liste un sens
// seulement, `DEPT_NEIGHBORS` la rend symétrique, et `npm run integrity` /
// `deptNeighborProblems()` vérifient que chaque nom existe dans le seed.
// Les DROM (îles ou territoire isolé) et la Corse n'ont pas de voisin
// métropolitain ; Corse-du-Sud / Haute-Corse sont voisines entre elles.
// Métropole de Lyon est enclavée dans le Rhône, l'Ain et l'Isère.
const RAW: Record<string, string[]> = {
  "Ain": ["Jura", "Saône-et-Loire", "Rhône", "Métropole de Lyon", "Isère", "Savoie", "Haute-Savoie"],
  "Aisne": ["Nord", "Ardennes", "Marne", "Seine-et-Marne", "Oise", "Somme"],
  "Allier": ["Cher", "Nièvre", "Saône-et-Loire", "Loire", "Puy-de-Dôme", "Creuse"],
  "Alpes-de-Haute-Provence": ["Hautes-Alpes", "Alpes-Maritimes", "Var", "Vaucluse"],
  "Hautes-Alpes": ["Isère", "Savoie", "Drôme", "Alpes-de-Haute-Provence"],
  "Alpes-Maritimes": ["Var", "Alpes-de-Haute-Provence"],
  "Ardèche": ["Haute-Loire", "Loire", "Isère", "Drôme", "Gard", "Lozère"],
  "Ardennes": ["Marne", "Aisne", "Meuse"],
  "Ariège": ["Haute-Garonne", "Aude", "Pyrénées-Orientales"],
  "Aube": ["Marne", "Haute-Marne", "Côte-d'Or", "Yonne", "Seine-et-Marne"],
  "Aude": ["Hérault", "Tarn", "Haute-Garonne", "Ariège", "Pyrénées-Orientales"],
  "Aveyron": ["Lot", "Tarn-et-Garonne", "Tarn", "Hérault", "Gard", "Lozère", "Cantal"],
  "Bas-Rhin": ["Haut-Rhin", "Vosges", "Meurthe-et-Moselle", "Moselle"],
  "Bouches-du-Rhône": ["Gard", "Vaucluse", "Var"],
  "Calvados": ["Manche", "Orne", "Eure"],
  "Cantal": ["Puy-de-Dôme", "Haute-Loire", "Lozère", "Aveyron", "Lot", "Corrèze"],
  "Charente": ["Charente-Maritime", "Deux-Sèvres", "Vienne", "Haute-Vienne", "Dordogne"],
  "Charente-Maritime": ["Charente", "Deux-Sèvres", "Vendée", "Gironde"],
  "Cher": ["Loiret", "Loir-et-Cher", "Indre", "Allier", "Nièvre"],
  "Corrèze": ["Haute-Vienne", "Creuse", "Puy-de-Dôme", "Cantal", "Lot", "Dordogne"],
  "Corse-du-Sud": ["Haute-Corse"],
  "Creuse": ["Haute-Vienne", "Corrèze", "Puy-de-Dôme", "Allier", "Cher", "Indre"],
  "Côte-d'Or": ["Aube", "Haute-Marne", "Haute-Saône", "Jura", "Saône-et-Loire", "Nièvre", "Yonne"],
  "Côtes-d'Armor": ["Finistère", "Morbihan", "Ille-et-Vilaine"],
  "Deux-Sèvres": ["Vendée", "Maine-et-Loire", "Vienne", "Charente", "Charente-Maritime"],
  "Dordogne": ["Gironde", "Lot-et-Garonne", "Lot", "Corrèze", "Haute-Vienne", "Charente"],
  "Doubs": ["Jura", "Haute-Saône", "Territoire de Belfort"],
  "Drôme": ["Ardèche", "Isère", "Hautes-Alpes", "Vaucluse"],
  "Essonne": ["Yvelines", "Hauts-de-Seine", "Val-de-Marne", "Seine-et-Marne", "Loiret", "Eure-et-Loir"],
  "Eure": ["Seine-Maritime", "Oise", "Val-d'Oise", "Yvelines", "Eure-et-Loir", "Orne", "Calvados"],
  "Eure-et-Loir": ["Eure", "Yvelines", "Essonne", "Loiret", "Loir-et-Cher", "Sarthe", "Orne"],
  "Finistère": ["Côtes-d'Armor", "Morbihan"],
  "Gard": ["Hérault", "Aveyron", "Lozère", "Ardèche", "Vaucluse", "Bouches-du-Rhône"],
  "Gers": ["Haute-Garonne", "Tarn-et-Garonne", "Lot-et-Garonne", "Landes", "Pyrénées-Atlantiques", "Hautes-Pyrénées"],
  "Gironde": ["Landes", "Lot-et-Garonne", "Dordogne", "Charente", "Charente-Maritime"],
  "Haut-Rhin": ["Bas-Rhin", "Vosges", "Territoire de Belfort"],
  "Haute-Garonne": ["Gers", "Tarn-et-Garonne", "Tarn", "Aude", "Ariège", "Hautes-Pyrénées"],
  "Haute-Loire": ["Loire", "Puy-de-Dôme", "Cantal", "Lozère", "Ardèche"],
  "Haute-Marne": ["Marne", "Aube", "Côte-d'Or", "Haute-Saône", "Vosges", "Meuse"],
  "Haute-Savoie": ["Ain", "Savoie"],
  "Haute-Saône": ["Vosges", "Haute-Marne", "Côte-d'Or", "Jura", "Doubs", "Territoire de Belfort"],
  "Haute-Vienne": ["Vienne", "Charente", "Dordogne", "Corrèze", "Creuse", "Indre"],
  "Hautes-Pyrénées": ["Pyrénées-Atlantiques", "Gers", "Haute-Garonne"],
  "Hauts-de-Seine": ["Paris", "Yvelines", "Val-d'Oise", "Seine-Saint-Denis", "Val-de-Marne", "Essonne"],
  "Hérault": ["Gard", "Aveyron", "Tarn", "Aude"],
  "Ille-et-Vilaine": ["Manche", "Mayenne", "Loire-Atlantique", "Morbihan", "Côtes-d'Armor"],
  "Indre": ["Cher", "Loir-et-Cher", "Indre-et-Loire", "Vienne", "Haute-Vienne", "Creuse"],
  "Indre-et-Loire": ["Loir-et-Cher", "Maine-et-Loire", "Vienne", "Indre", "Sarthe"],
  "Isère": ["Ain", "Rhône", "Métropole de Lyon", "Loire", "Ardèche", "Drôme", "Hautes-Alpes", "Savoie"],
  "Jura": ["Doubs", "Haute-Saône", "Côte-d'Or", "Saône-et-Loire", "Ain"],
  "Landes": ["Gironde", "Lot-et-Garonne", "Gers", "Pyrénées-Atlantiques"],
  "Loir-et-Cher": ["Loiret", "Eure-et-Loir", "Sarthe", "Indre-et-Loire", "Indre", "Cher"],
  "Loire": ["Rhône", "Saône-et-Loire", "Allier", "Puy-de-Dôme", "Haute-Loire", "Ardèche", "Isère"],
  "Loire-Atlantique": ["Morbihan", "Ille-et-Vilaine", "Mayenne", "Maine-et-Loire", "Vendée"],
  "Loiret": ["Seine-et-Marne", "Essonne", "Eure-et-Loir", "Loir-et-Cher", "Cher", "Nièvre", "Yonne"],
  "Lot": ["Corrèze", "Dordogne", "Lot-et-Garonne", "Tarn-et-Garonne", "Aveyron", "Cantal"],
  "Lot-et-Garonne": ["Gironde", "Dordogne", "Lot", "Tarn-et-Garonne", "Gers", "Landes"],
  "Lozère": ["Haute-Loire", "Cantal", "Aveyron", "Gard", "Ardèche"],
  "Maine-et-Loire": ["Mayenne", "Sarthe", "Indre-et-Loire", "Vienne", "Deux-Sèvres", "Vendée", "Loire-Atlantique"],
  "Manche": ["Calvados", "Orne", "Mayenne", "Ille-et-Vilaine"],
  "Marne": ["Aisne", "Ardennes", "Meuse", "Haute-Marne", "Aube", "Seine-et-Marne"],
  "Mayenne": ["Manche", "Orne", "Sarthe", "Maine-et-Loire", "Loire-Atlantique", "Ille-et-Vilaine"],
  "Meurthe-et-Moselle": ["Meuse", "Moselle", "Bas-Rhin", "Vosges"],
  "Meuse": ["Ardennes", "Marne", "Haute-Marne", "Vosges", "Meurthe-et-Moselle"],
  "Morbihan": ["Finistère", "Côtes-d'Armor", "Ille-et-Vilaine", "Loire-Atlantique"],
  "Moselle": ["Meurthe-et-Moselle", "Bas-Rhin"],
  "Métropole de Lyon": ["Rhône", "Ain", "Isère"],
  "Nièvre": ["Yonne", "Côte-d'Or", "Saône-et-Loire", "Allier", "Cher", "Loiret"],
  "Nord": ["Pas-de-Calais", "Aisne"],
  "Oise": ["Somme", "Aisne", "Seine-et-Marne", "Val-d'Oise", "Eure", "Seine-Maritime"],
  "Orne": ["Manche", "Calvados", "Eure", "Eure-et-Loir", "Sarthe", "Mayenne"],
  "Paris": ["Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne"],
  "Pas-de-Calais": ["Nord", "Somme"],
  "Puy-de-Dôme": ["Allier", "Loire", "Haute-Loire", "Cantal", "Corrèze", "Creuse"],
  "Pyrénées-Atlantiques": ["Landes", "Gers", "Hautes-Pyrénées"],
  "Pyrénées-Orientales": ["Aude", "Ariège"],
  "Rhône": ["Ain", "Saône-et-Loire", "Loire", "Isère", "Métropole de Lyon"],
  "Sarthe": ["Mayenne", "Orne", "Eure-et-Loir", "Loir-et-Cher", "Indre-et-Loire", "Maine-et-Loire"],
  "Savoie": ["Haute-Savoie", "Ain", "Isère", "Hautes-Alpes"],
  "Saône-et-Loire": ["Côte-d'Or", "Jura", "Ain", "Rhône", "Loire", "Allier", "Nièvre"],
  "Seine-Maritime": ["Eure", "Oise", "Somme"],
  "Seine-Saint-Denis": ["Paris", "Hauts-de-Seine", "Val-de-Marne", "Val-d'Oise", "Seine-et-Marne"],
  "Seine-et-Marne": ["Seine-Saint-Denis", "Val-de-Marne", "Essonne", "Loiret", "Yonne", "Aube", "Marne", "Aisne", "Oise", "Val-d'Oise"],
  "Somme": ["Pas-de-Calais", "Aisne", "Oise", "Seine-Maritime"],
  "Tarn": ["Haute-Garonne", "Tarn-et-Garonne", "Aveyron", "Hérault", "Aude"],
  "Tarn-et-Garonne": ["Lot", "Lot-et-Garonne", "Gers", "Haute-Garonne", "Tarn", "Aveyron"],
  "Territoire de Belfort": ["Doubs", "Haute-Saône", "Haut-Rhin"],
  "Val-d'Oise": ["Oise", "Eure", "Yvelines", "Hauts-de-Seine", "Seine-Saint-Denis", "Seine-et-Marne"],
  "Val-de-Marne": ["Paris", "Hauts-de-Seine", "Essonne", "Seine-et-Marne", "Seine-Saint-Denis"],
  "Var": ["Bouches-du-Rhône", "Vaucluse", "Alpes-de-Haute-Provence", "Alpes-Maritimes"],
  "Vaucluse": ["Bouches-du-Rhône", "Var", "Alpes-de-Haute-Provence", "Drôme", "Gard"],
  "Vendée": ["Loire-Atlantique", "Maine-et-Loire", "Deux-Sèvres", "Charente-Maritime"],
  "Vienne": ["Indre-et-Loire", "Maine-et-Loire", "Deux-Sèvres", "Charente", "Haute-Vienne", "Indre"],
  "Vosges": ["Meuse", "Haute-Marne", "Haute-Saône", "Haut-Rhin", "Bas-Rhin", "Meurthe-et-Moselle"],
  "Yonne": ["Aube", "Côte-d'Or", "Nièvre", "Loiret", "Seine-et-Marne"],
  "Yvelines": ["Eure", "Eure-et-Loir", "Essonne", "Hauts-de-Seine", "Val-d'Oise"],
};

function build(): Map<string, string[]> {
  const sets = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!sets.has(a)) sets.set(a, new Set());
    sets.get(a)!.add(b);
  };
  for (const [a, list] of Object.entries(RAW)) {
    for (const b of list) {
      add(a, b);
      add(b, a);
    }
  }
  return new Map(
    [...sets].map(([k, v]) => [k, [...v].sort((x, y) => x.localeCompare(y, "fr"))]),
  );
}

const NEIGHBORS = build();

/** Départements limitrophes (noms du seed), triés A-Z ; vide pour les DROM. */
export function neighborDepartments(department: string): string[] {
  return NEIGHBORS.get(department) ?? [];
}

/** Noms de la table absents du seed (une faute de frappe n'est pas typée). */
export function deptNeighborProblems(): string[] {
  const known = new Set(CITIES_SEED.map((c) => c.department));
  const bad = new Set<string>();
  for (const name of NEIGHBORS.keys()) if (!known.has(name)) bad.add(name);
  return [...bad];
}
