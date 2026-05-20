// Next 16 renamed `middleware.ts` to `proxy.ts` — same purpose, clearer name.
//
// Locale detection via NEXT_PUBLIC_DEFAULT_LOCALE.
//
// - fr (default) : mavilleideale.fr — FR routes at root, `/en/*` returns 404
//   so the FR domain never accidentally serves English content.
// - en           : bestcitiesinfrance.com — bare URLs are rewritten internally
//   to `/en/<path>` so the URL bar stays clean
//   (e.g. /cities/lyon → renders app/[locale]/cities/[slug]/page.tsx with locale=en),
//   while existing FR URLs (/villes/*, /classements/*, etc.) 404 to avoid
//   duplicate content on the EN domain.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as
  | "fr"
  | "en";

// FR-only top-level segments. On the EN domain these 404 — we don't want
// /villes/lyon served from bestcitiesinfrance.com (would dupe /cities/lyon).
//
// Note: top-level segments shared across locales (e.g. /regions which uses the
// same slug on both languages) must NOT appear here — they fall through to the
// /en/<path> rewrite below on the EN domain.
const FR_ONLY_SEGMENTS = new Set([
  "villes",
  "classements",
  "comparer",
  "comparer-regions",
  "guides",
  "quartiers",
  "departements",
  "red-flags",
  "carte",
  "carte-risques",
  "calendrier-immobilier",
  "calculateur-cout-reel",
  "quiz-compatibilite",
  "journal-demenagement",
  "expat-retour",
  "reality-check",
  "ville-du-mois",
  "gentrification",
  "alertes",
  "favoris",
  "recherche",
  "sommaire",
  "methode",
  "outils",
  "tags",
  "glossaire",
  "donnees",
  "mentions-legales",
  "confidentialite",
  "cgu",
  "a-propos",
]);

export function proxy(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;

  // Always pass through Next internals, API routes, static assets, and
  // SEO-critical files served at the root of either domain.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/sitemap/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/feed.xml" ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return;
  }

  if (DEFAULT_LOCALE === "en") {
    // On the EN project, block FR-only routes so the EN domain doesn't
    // serve duplicate French content under different paths.
    const firstSegment = pathname.split("/")[1] ?? "";
    if (FR_ONLY_SEGMENTS.has(firstSegment)) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }

    // If the path already includes /en, render it as-is (this is how the
    // EN page tree is keyed internally).
    if (pathname === "/en" || pathname.startsWith("/en/")) {
      return;
    }

    // Bare URL on the EN domain → rewrite internally to /en/<path>
    // so app/[locale]/* picks it up with locale="en".
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    return NextResponse.rewrite(rewritten);
  }

  // DEFAULT_LOCALE === "fr" (or anything else)
  // The FR project should never expose /en/* publicly. Treat as not-found
  // so Google doesn't index the EN tree from the French domain.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  // FR: pass-through. Existing behaviour preserved.
  return;
}

export const config = {
  matcher: [
    // Run on every path except Next internals and obvious static files.
    "/((?!_next/static|_next/image|_next/data|.*\\..*).*)",
  ],
};
