// Server-side helpers for the embeddable "Nᵉ ville de France" badge —
// each city gets a rank (by global score), an SVG string, and an ergonomic
// HTML embed snippet ready to paste on external sites (mairies, offices de
// tourisme, agences immobilières). Rank + score are derived from the seed
// only — no new dataset.
//
// The SVG is emitted as a self-contained string (no external font, no
// external stylesheet, viewBox-based sizing) so the pasted HTML degrades
// gracefully on any embedding site.
import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";

export type BadgeVariant = "compact" | "wide" | "square";
export const BADGE_VARIANTS: BadgeVariant[] = ["compact", "wide", "square"];

const CACHE = new Map<string, number>();

/** National rank by global score across all 540 cities. 1 = best. */
export function nationalRank(slug: string): number | null {
  if (CACHE.size === 0) {
    const sorted = [...CITIES_SEED].sort(
      (a, b) => b.scores.global - a.scores.global,
    );
    sorted.forEach((c, i) => CACHE.set(c.slug, i + 1));
  }
  return CACHE.get(slug) ?? null;
}

/** Total metropolitan + DROM cities in the seed — used as denominator. */
export function citiesCount(): number {
  return CITIES_SEED.length;
}

/** French ordinal suffix — 1er, 2e, 3e, … */
export function ordinal(n: number): string {
  return n === 1 ? "1er" : `${n}e`;
}

function scoreColor(score: number): string {
  if (score >= 7.5) return "#A855F7";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

function scoreLabel(score: number): string {
  if (score >= 7.5) return "Exceptionnel";
  if (score >= 7.0) return "Excellent";
  if (score >= 6.0) return "Bon";
  if (score >= 5.0) return "Moyen";
  if (score >= 4.0) return "En dessous";
  return "Difficile";
}

/** XML-escape a string safely for inline SVG text nodes. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface BadgeSpec {
  variant: BadgeVariant;
  city: CitySeed;
  rank: number;
  total: number;
  score: number;
  color: string;
  label: string;
}

export function buildBadgeSpec(
  slug: string,
  variant: BadgeVariant,
): BadgeSpec | null {
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return null;
  const rank = nationalRank(slug);
  if (rank === null) return null;
  const score = city.scores.global;
  return {
    variant,
    city,
    rank,
    total: citiesCount(),
    score,
    color: scoreColor(score),
    label: scoreLabel(score),
  };
}

/** Emit the self-contained SVG string for a badge spec. */
export function renderBadgeSvg(spec: BadgeSpec): string {
  const { variant, city, rank, total, score, color, label } = spec;
  const rankLine = `${ordinal(rank)} ville de France`;
  const scoreText = score.toFixed(1);

  if (variant === "wide") {
    const w = 460;
    const h = 120;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(
      `${city.name} — ${rankLine} sur ${total}, score ${scoreText} sur 10`,
    )}">
  <rect width="${w}" height="${h}" rx="14" fill="#0d1117"/>
  <rect x="0" y="0" width="6" height="${h}" fill="${color}"/>
  <text x="24" y="34" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="12" fill="#8b949e" letter-spacing="1.5">${esc(
    "MAVILLEIDEAL — Classement 2026",
  )}</text>
  <text x="24" y="66" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="24" font-weight="800" fill="#f0f6fc">${esc(
    city.name,
  )}</text>
  <text x="24" y="90" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="14" fill="${color}" font-weight="700">${esc(
    rankLine,
  )} <tspan fill="#8b949e" font-weight="500">· sur ${total}</tspan></text>
  <g transform="translate(360 30)">
    <rect width="80" height="60" rx="10" fill="#161b22" stroke="${color}" stroke-opacity="0.35"/>
    <text x="40" y="36" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="${color}">${scoreText}</text>
    <text x="40" y="52" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="#8b949e">/ 10 · ${esc(label)}</text>
  </g>
</svg>`;
  }

  if (variant === "square") {
    const s = 200;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" role="img" aria-label="${esc(
      `${city.name} — ${rankLine} sur ${total}, score ${scoreText} sur 10`,
    )}">
  <rect width="${s}" height="${s}" rx="18" fill="#0d1117"/>
  <text x="${s / 2}" y="30" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#8b949e" letter-spacing="2">${esc(
    "MAVILLEIDEAL 2026",
  )}</text>
  <text x="${s / 2}" y="70" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="${color}">${scoreText}</text>
  <text x="${s / 2}" y="86" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#8b949e">/ 10 · ${esc(label)}</text>
  <line x1="30" x2="${s - 30}" y1="102" y2="102" stroke="#21262d"/>
  <text x="${s / 2}" y="128" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#f0f6fc">${esc(city.name)}</text>
  <text x="${s / 2}" y="152" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="${color}" font-weight="700">${esc(rankLine)}</text>
  <text x="${s / 2}" y="170" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#8b949e">sur ${total} villes</text>
</svg>`;
  }

  // compact (default) — 280×80, one-line rank + score chip
  const w = 280;
  const h = 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(
    `${city.name} — ${rankLine} sur ${total}, score ${scoreText} sur 10`,
  )}">
  <rect width="${w}" height="${h}" rx="12" fill="#0d1117"/>
  <rect x="0" y="0" width="4" height="${h}" fill="${color}"/>
  <text x="16" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#8b949e" letter-spacing="1.4">${esc(
    "MAVILLEIDEAL",
  )}</text>
  <text x="16" y="48" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="800" fill="#f0f6fc">${esc(city.name)}</text>
  <text x="16" y="66" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="${color}" font-weight="600">${esc(rankLine)} <tspan fill="#8b949e" font-weight="500">· sur ${total}</tspan></text>
  <g transform="translate(214 16)">
    <rect width="54" height="48" rx="8" fill="#161b22" stroke="${color}" stroke-opacity="0.35"/>
    <text x="27" y="30" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="${color}">${scoreText}</text>
    <text x="27" y="42" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="#8b949e">/ 10</text>
  </g>
</svg>`;
}

const SITE_URL = "https://www.mavilleideale.fr";

/** HTML embed snippet — the actual paste target for external sites. */
export function renderEmbedHtml(spec: BadgeSpec): string {
  const svg = renderBadgeSvg(spec).replace(/\n\s*/g, " ");
  const targetUrl = `${SITE_URL}/villes/${spec.city.slug}`;
  return `<a href="${targetUrl}" target="_blank" rel="noopener" title="${esc(
    `${spec.city.name} — Classement MaVilleIdeal`,
  )}" style="display:inline-block;text-decoration:none;line-height:0">${svg}</a>`;
}

export const VARIANT_LABEL: Record<BadgeVariant, string> = {
  compact: "Compact (280 × 80)",
  wide: "Large (460 × 120)",
  square: "Carré (200 × 200)",
};

export const VARIANT_DESC: Record<BadgeVariant, string> = {
  compact:
    "Idéal en pied de page ou en sidebar. Discret, tient sur une ligne.",
  wide: "Format bannière. Bon compromis lisibilité / encombrement.",
  square: "Format vignette, adapté aux cartes et aux grilles.",
};
