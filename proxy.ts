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

import { createServerClient } from "@supabase/ssr";
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
  // "gentrification" removed — EN page now exists at app/[locale]/gentrification
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

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Always pass through Next internals, API routes, static assets, and
  // SEO-critical files served at the root of either domain.
  //
  // opengraph-image / twitter-image are Next metadata routes with no file
  // extension — without an explicit bypass the EN rewrite would turn
  // /opengraph-image into /en/opengraph-image (which has no page → 404),
  // so the EN domain would ship broken og:image tags.
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
    pathname.endsWith("/opengraph-image") ||
    pathname.endsWith("/twitter-image") ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Determine rewrite target for locale logic (EN domain only)
  let rewriteTarget: URL | null = null;
  if (DEFAULT_LOCALE === "en") {
    const firstSegment = pathname.split("/")[1] ?? "";
    if (FR_ONLY_SEGMENTS.has(firstSegment)) {
      rewriteTarget = new URL("/404", request.url);
    } else if (!(pathname === "/en" || pathname.startsWith("/en/"))) {
      const clone = request.nextUrl.clone();
      clone.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
      rewriteTarget = clone;
    }
  } else {
    if (pathname === "/en" || pathname.startsWith("/en/")) {
      rewriteTarget = new URL("/404", request.url);
    }
  }

  // Build base response (rewrite or pass-through)
  let response = rewriteTarget
    ? NextResponse.rewrite(rewriteTarget)
    : NextResponse.next({ request });

  // Refresh Supabase auth session so it doesn't expire mid-browse.
  // Only active when env vars are set (skips gracefully otherwise).
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(toSet) {
            toSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = rewriteTarget
              ? NextResponse.rewrite(rewriteTarget)
              : NextResponse.next({ request });
            toSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );
    await supabase.auth.getUser();
  }

  return response;
}

export const runtime = "edge";

export const config = {
  matcher: [
    // Run on every path except Next internals and obvious static files.
    "/((?!_next/static|_next/image|_next/data|.*\\..*).*)",
  ],
};
