// Per-city photography sourced from Wikidata (P18) → Wikimedia Commons, then
// downloaded and re-encoded to webp at build time by scripts/commune-images.mjs.
// Nothing is hotlinked: `src` always points at our own /photos/villes/ assets,
// whose filenames carry a content hash (so they can be cached immutably).
//
// Every photo here is under a free licence, but most are CC BY-SA — attribution
// is a licence condition, not a courtesy. Any surface that renders a photo MUST
// render its credit too (components/CityPhoto ties the two together).
import RAW from "@/data/city-images.json";

export interface PhotoVariant {
  src: string;
  width: number;
  height: number;
}

export interface CityPhoto {
  insee: string;
  qid: string;
  /** Commons filename, e.g. `Annecy-palais2.jpg` — the change key on re-crawl. */
  file: string;
  author: string | null;
  authorUrl: string | null;
  license: string;
  licenseUrl: string | null;
  commonsUrl: string;
  /** Dominant colour, used as the background while the image decodes. */
  color: string;
  hero: PhotoVariant;
  card: PhotoVariant;
}

const PHOTOS = RAW as unknown as Record<string, CityPhoto>;

export function cityPhoto(slug: string): CityPhoto | null {
  return PHOTOS[slug] ?? null;
}

export const PHOTO_COUNT = Object.keys(PHOTOS).length;

export function photoAlt(cityName: string, locale: "fr" | "en" = "fr"): string {
  return locale === "en" ? `View of ${cityName}, France` : `Vue de ${cityName}`;
}

/** Absolute URL — required by image sitemaps and JSON-LD ImageObject. */
export function absolutePhotoUrl(src: string, origin: string): string {
  return `${origin}${src}`;
}

/**
 * Hero photo for a guide that is *about* one city — `10-choses-a-faire-a-lyon`,
 * `acheter-a-lyon-...`, `things-to-do-in-lyon-2026`. The city slug must appear
 * in the guide slug, not merely in relatedCities: a ranking guide lists a dozen
 * cities it is not about, and illustrating it with the first one would be a lie.
 */
export function guideCityPhoto(
  guideSlug: string,
  relatedCities: string[],
): { slug: string; photo: CityPhoto } | null {
  for (const slug of relatedCities) {
    if (guideSlug.includes(`-${slug}-`) || guideSlug.endsWith(`-${slug}`)) {
      const photo = cityPhoto(slug);
      if (photo) return { slug, photo };
    }
  }
  return null;
}
