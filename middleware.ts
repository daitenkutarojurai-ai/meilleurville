// Edge middleware — runs on Cloudflare Workers (via OpenNext) and on the
// Next.js Edge runtime on regular servers.
//
// Contains the same locale-rewrite and Supabase session-refresh logic as
// proxy.ts, but in Edge-compatible form. proxy.ts (Node.js-only in Next 16)
// cannot run on Cloudflare Workers; this file is what OpenNext uses.

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as
  | "fr"
  | "en";

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

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

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

  let response = rewriteTarget
    ? NextResponse.rewrite(rewriteTarget)
    : NextResponse.next({ request });

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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|.*\\..*).*)",
  ],
};
