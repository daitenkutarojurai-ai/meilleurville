// Salles et spots sportifs par ville (salles de sport, street workout, CrossFit,
// escalade), lus dans `data/city-sport-spots.json`, que produit
// `scripts/city-sport-spots.mjs` depuis OpenStreetMap.
//
// Serveur uniquement : le JSON pèse plusieurs centaines de Ko et n'a rien à faire
// dans un bundle client. Ne jamais importer ce module depuis un "use client".
//
// Ce que la donnée dit : ce qui est CARTOGRAPHIÉ dans OpenStreetMap, pas un
// annuaire exhaustif. Une ville absente du fichier = pas encore collectée (null),
// une ville présente avec zéro = collectée, rien de cartographié. Les surfaces le
// disent, et portent l'attribution ODbL « © les contributeurs OpenStreetMap ».
import RAW from "@/data/city-sport-spots.json";

export type SportSpotKind = "fitness" | "street" | "crossfit" | "climbing";

export interface SportSpot {
  k: SportSpotKind;
  /** Nom OSM, absent pour beaucoup de spots de street workout. */
  n: string | null;
  lat: number;
  lng: number;
  /** Identifiant OSM (`n123`, `w456`, `r789`). */
  id: string;
  /** Distance au centre-ville (coordonnées du seed), km à vol d'oiseau. */
  km: number;
  /** Enseigne, quand elle diffère du nom. */
  b?: string;
  /** Site web déclaré dans OSM. */
  w?: string;
  /** Street workout : nombre d'agrès regroupés dans le spot. */
  dev?: number;
}

export interface CitySportSpots {
  at: string;
  v: number;
  counts: Record<SportSpotKind, number>;
  spots: SportSpot[];
}

interface SportSpotsFile {
  meta: { source: string; license: string; queryVersion: number; caps: Record<SportSpotKind, number> };
  cities: Record<string, CitySportSpots>;
}

const DATA = RAW as unknown as SportSpotsFile;

export const SPORT_SPOT_KINDS: SportSpotKind[] = ["fitness", "street", "crossfit", "climbing"];
export const SPORT_SPOT_CAPS = DATA.meta?.caps ?? { fitness: 25, street: 25, crossfit: 12, climbing: 12 };

export function citySportSpots(slug: string): CitySportSpots | null {
  return DATA.cities?.[slug] ?? null;
}

export const SPORT_SPOTS_CITY_COUNT = Object.keys(DATA.cities ?? {}).length;

export const SPORT_SPOT_LABEL: Record<SportSpotKind, { fr: string; en: string; emoji: string }> = {
  fitness: { fr: "Salles de sport et fitness", en: "Gyms and fitness clubs", emoji: "🏋️" },
  street: { fr: "Street workout et agrès en plein air", en: "Street workout and outdoor fitness", emoji: "🤸" },
  crossfit: { fr: "Box CrossFit et cross-training", en: "CrossFit and cross-training boxes", emoji: "🔥" },
  climbing: { fr: "Salles d'escalade et de bloc", en: "Climbing and bouldering gyms", emoji: "🧗" },
};

/** Nom affiché : le nom OSM, sinon un libellé générique honnête. */
export function sportSpotName(s: SportSpot, locale: "fr" | "en"): string {
  if (s.n) return s.n;
  if (s.k === "street") {
    const dev = s.dev ?? 1;
    if (locale === "fr") return dev > 1 ? `Spot sans nom · ${dev} agrès` : "Agrès sans nom";
    return dev > 1 ? `Unnamed spot · ${dev} stations` : "Unnamed station";
  }
  return locale === "fr" ? "Lieu sans nom dans OpenStreetMap" : "Unnamed place in OpenStreetMap";
}

export function osmUrl(id: string): string {
  const type = id[0] === "n" ? "node" : id[0] === "w" ? "way" : "relation";
  return `https://www.openstreetmap.org/${type}/${id.slice(1)}`;
}
