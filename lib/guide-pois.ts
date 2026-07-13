// Landmarks attached to the sections of the `10-choses-a-faire-a-*` guides.
// Built by scripts/guide-pois.mjs: Wikidata (located in the commune, heritage-
// listed or typed as a visitable place, with an image) → matched against the
// section heading → photo re-encoded to webp under /photos/poi/.
//
// A section appears here ONLY when its heading actually names the landmark.
// Most sections are activities ("prendre le petit-déjeuner dans un bouchon"),
// have no single subject, and are legitimately absent — that is not a gap to
// fill with an approximate photo.
import RAW from "@/data/guide-pois.json";

export interface GuidePoi {
  name: string;
  qid: string;
  lat: number | null;
  lng: number | null;
  /** Wikipedia article, when the landmark has one. */
  wiki: string | null;
  src: string;
  width: number;
  height: number;
  color: string;
  author: string | null;
  authorUrl: string | null;
  license: string;
  licenseUrl: string | null;
  commonsUrl: string;
}

/** guide slug → section index → landmark */
const POIS = RAW as unknown as Record<string, Record<string, GuidePoi>>;

export function guidePois(guideSlug: string): Record<string, GuidePoi> | null {
  return POIS[guideSlug] ?? null;
}

/**
 * Google Maps URL API — the documented, key-less form. Name + city lands on the
 * place card; raw coordinates would only drop a nameless pin.
 */
export function mapsUrl(poi: GuidePoi, cityName: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${poi.name}, ${cityName}`,
  )}`;
}
