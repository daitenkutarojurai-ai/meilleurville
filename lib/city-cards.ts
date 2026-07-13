// Lean photo map for CityCard. Card grids render inside client components
// (/villes filters in the browser), so this module is what ends up in the
// client bundle — hence the compact shape: only the content hash of the 480px
// webp is stored, and the src is rebuilt from slug + hash. The rich record
// (hero variant, Commons URLs, QID) stays server-side in lib/city-images.
//
// Regenerated with the photos: `npm run photos`.
import RAW from "@/data/city-cards.json";

interface LeanCard {
  /** content hash of the 480px webp */
  h: string;
  /** dominant colour */
  c: string;
  /** author */
  a: string | null;
  /** licence short name */
  l: string;
}

export interface CardPhoto {
  src: string;
  width: number;
  height: number;
  color: string;
  author: string | null;
  license: string;
}

const CARDS = RAW as unknown as Record<string, LeanCard>;

// Fixed by the encoder in scripts/commune-images.mjs (480 × 0.625).
const CARD_W = 480;
const CARD_H = 300;

export function cardPhoto(slug: string): CardPhoto | null {
  const c = CARDS[slug];
  if (!c) return null;
  return {
    src: `/photos/villes/${slug}-${CARD_W}.${c.h}.webp`,
    width: CARD_W,
    height: CARD_H,
    color: c.c,
    author: c.a,
    license: c.l,
  };
}
