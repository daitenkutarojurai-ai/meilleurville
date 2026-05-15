import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";
import { RANKING_META } from "@/lib/rankings";
import { TAG_SLUGS } from "@/lib/guide-tags";

// Derived-once counts for every "X villes / Y guides / Z classements" claim
// displayed across the site. Import these instead of hardcoding numbers so the
// claims stay honest as the canonical data grows. Static at build time — no
// runtime cost beyond a single Set construction at module load.

export const CITIES_COUNT = CITIES_SEED.length;

export const GUIDES_COUNT = GUIDES.length;

export const RANKINGS_COUNT = Object.keys(RANKING_META).length;

export const REGIONS_COUNT = new Set(
  CITIES_SEED.map((c) => c.region).filter(Boolean)
).size;

export const DEPARTMENTS_COUNT = new Set(
  CITIES_SEED.map((c) => c.department).filter(Boolean)
).size;

export const TAGS_COUNT = TAG_SLUGS.length;

// The glossary is hardcoded in app/glossaire/page.tsx — kept as a literal here
// because there is no programmatic data source for it yet. Update this constant
// when terms are added there.
export const GLOSSARY_TERMS_COUNT = 33;
